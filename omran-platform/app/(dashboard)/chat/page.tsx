"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import type { Message, Profile } from "@/types";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p as Profile);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*, profiles(full_name, email, role)")
        .order("created_at", { ascending: true })
        .limit(100);
      setMessages((msgs as Message[]) || []);
      setLoading(false);
    };
    init();

    const channel = supabase
      .channel("messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const { data: msg } = await supabase
            .from("messages")
            .select("*, profiles(full_name, email, role)")
            .eq("id", payload.new.id)
            .single();
          if (msg) setMessages((prev) => [...prev, msg as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!content.trim() || !profile) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("messages").insert({ sender_id: user.id, content: content.trim() });
    }
    setContent("");
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-omran" />
          شات الفريق
        </h1>
        <p className="text-gray-500 text-sm mt-1">تواصل مع الفريق والإدارة في الوقت الفعلي</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-border flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-omran" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">لا توجد رسائل بعد</p>
              <p className="text-gray-400 text-sm mt-1">ابدأ المحادثة مع الفريق</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === profile?.id;
              const senderName = msg.profiles?.full_name || msg.profiles?.email || "مجهول";
              const isAdmin = msg.profiles?.role === "admin";
              return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isAdmin ? "bg-yellow-100 text-yellow-700" : "bg-omran/10 text-omran"}`}>
                    {senderName.charAt(0)}
                  </div>
                  <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">
                        {isMe ? "أنت" : senderName}
                        {isAdmin && !isMe && <span className="mr-1 text-yellow-600 font-bold">(إدارة)</span>}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(msg.created_at)}</span>
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-omran text-white rounded-tl-sm" : "bg-gray-100 text-gray-800 rounded-tr-sm"}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-3 items-end">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKey}
              placeholder="اكتب رسالتك... (Enter للإرسال)"
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-omran/20 focus:border-omran resize-none"
              style={{ maxHeight: "120px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!content.trim() || sending}
              className="p-3 bg-omran hover:bg-omran-light text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
