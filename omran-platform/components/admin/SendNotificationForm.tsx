"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Send, Loader2, Bell } from "lucide-react";

interface User { id: string; full_name: string | null; email: string; }

export default function SendNotificationForm({ users }: { users: User[] }) {
  const router = useRouter();
  const [target, setTarget] = useState<"all" | string>("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "success" | "warning" | "error">("info");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const send = async () => {
    if (!title.trim() || !message.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const targets = target === "all" ? users.map((u) => u.id) : [target];
    const rows = targets.map((userId) => ({ user_id: userId, title: title.trim(), message: message.trim(), type, related_type: null, related_id: null }));
    await supabase.from("notifications").insert(rows);
    setTitle("");
    setMessage("");
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4 text-omran" />
        إرسال إشعار
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">المستلم</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-omran/20 focus:border-omran bg-white">
              <option value="all">جميع المستخدمين</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">نوع الإشعار</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-omran/20 focus:border-omran bg-white">
              <option value="info">معلومة</option>
              <option value="success">نجاح</option>
              <option value="warning">تحذير</option>
              <option value="error">خطأ</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">عنوان الإشعار</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الإشعار"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-omran/20 focus:border-omran" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">نص الإشعار</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="اكتب نص الإشعار..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-omran/20 focus:border-omran resize-none" />
        </div>
        {success && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">تم إرسال الإشعار بنجاح ✓</div>}
        <div className="flex justify-end">
          <button onClick={send} disabled={!title.trim() || !message.trim() || loading}
            className="px-6 py-2.5 bg-omran hover:bg-omran-light text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}
