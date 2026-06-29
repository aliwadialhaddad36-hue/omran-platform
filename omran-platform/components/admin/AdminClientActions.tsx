"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, X, Loader2, Trash2 } from "lucide-react";
import type { Client } from "@/types";

export default function AdminClientActions({ client }: { client: Client }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState(client.admin_notes || "");
  const supabase = createClient();

  const approve = async () => {
    setLoading("approve");
    await supabase.from("clients").update({ status: "approved", payment_status: "verified", admin_notes: adminNotes }).eq("id", client.id);
    if (client.user_id) {
      await supabase.from("notifications").insert({
        user_id: client.user_id,
        title: "تمت الموافقة على اشتراكك! 🎉",
        message: `تمت الموافقة على اشتراكك في باقة ${client.package_price} ريال. مرحباً بك في قائمة عملائنا المميزين!`,
        type: "success",
        related_type: "client",
        related_id: client.id,
      });
    }
    setLoading(null);
    router.refresh();
  };

  const reject = async () => {
    setLoading("reject");
    await supabase.from("clients").update({ status: "rejected", admin_notes: adminNotes }).eq("id", client.id);
    if (client.user_id) {
      await supabase.from("notifications").insert({
        user_id: client.user_id,
        title: "لم تتم الموافقة على الاشتراك",
        message: `نعتذر، لم تتم الموافقة على طلب اشتراكك.${adminNotes ? ` السبب: ${adminNotes}` : ""}`,
        type: "warning",
        related_type: "client",
        related_id: client.id,
      });
    }
    setLoading(null);
    router.refresh();
  };

  const deleteClient = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا العميل؟")) return;
    setLoading("delete");
    await supabase.from("clients").delete().eq("id", client.id);
    setLoading(null);
    router.refresh();
  };

  if (client.status !== "pending") {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${client.status === "approved" ? "text-green-600" : "text-red-500"}`}>
          {client.status === "approved" ? "تمت الموافقة" : "مرفوض"}
        </span>
        <button onClick={deleteClient} disabled={!!loading}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          {loading === "delete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 min-w-[160px]">
      <input
        value={adminNotes}
        onChange={(e) => setAdminNotes(e.target.value)}
        placeholder="ملاحظات (اختياري)"
        className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-omran/30"
      />
      <div className="flex gap-2">
        <button onClick={approve} disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium disabled:opacity-50">
          {loading === "approve" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          قبول
        </button>
        <button onClick={reject} disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium disabled:opacity-50">
          {loading === "reject" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          رفض
        </button>
      </div>
      <button onClick={deleteClient} disabled={!!loading}
        className="flex items-center justify-center gap-1 px-3 py-2 text-red-400 hover:bg-red-50 rounded-lg text-xs transition-colors disabled:opacity-50">
        {loading === "delete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        حذف
      </button>
    </div>
  );
}
