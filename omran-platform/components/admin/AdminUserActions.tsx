"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, User, Trash2, Loader2 } from "lucide-react";
import type { Profile } from "@/types";

export default function AdminUserActions({ user }: { user: Profile }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const toggleRole = async () => {
    setLoading("role");
    const newRole = user.role === "admin" ? "user" : "admin";
    await supabase.from("profiles").update({ role: newRole }).eq("id", user.id);
    setLoading(null);
    router.refresh();
  };

  const deleteUser = async () => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.full_name || user.email}"؟`)) return;
    setLoading("delete");
    await supabase.from("profiles").delete().eq("id", user.id);
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggleRole}
        disabled={!!loading}
        title={user.role === "admin" ? "تحويل إلى مستخدم" : "تحويل إلى مدير"}
        className="p-1.5 text-gray-400 hover:text-omran hover:bg-omran/10 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === "role" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : user.role === "admin" ? (
          <User className="w-3.5 h-3.5" />
        ) : (
          <Shield className="w-3.5 h-3.5" />
        )}
      </button>
      <button
        onClick={deleteUser}
        disabled={!!loading}
        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === "delete" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
