import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Users, Shield, User } from "lucide-react";
import AdminUserActions from "@/components/admin/AdminUserActions";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-omran" />
          إدارة المستخدمين
        </h1>
        <p className="text-gray-500 text-sm mt-1">إدارة المستخدمين وصلاحياتهم</p>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-border text-xs font-semibold text-gray-500 uppercase">
          <div className="col-span-4">المستخدم</div>
          <div className="col-span-3">الجوال</div>
          <div className="col-span-2">الدور</div>
          <div className="col-span-2">تاريخ الانضمام</div>
          <div className="col-span-1"></div>
        </div>

        {!users?.length ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">لا يوجد مستخدمون</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {users.map((u) => (
              <div key={u.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                <div className="col-span-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${u.role === "admin" ? "bg-yellow-100 text-yellow-700" : "bg-omran/10 text-omran"}`}>
                      {u.role === "admin" ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{u.full_name || "—"}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-3 text-sm text-gray-600">{u.phone || "—"}</div>
                <div className="col-span-2">
                  <span className={`badge-status ${u.role === "admin" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                    {u.role === "admin" ? "مدير" : "مستخدم"}
                  </span>
                </div>
                <div className="col-span-2 text-xs text-gray-400">{formatDate(u.created_at)}</div>
                <div className="col-span-1 flex justify-end">
                  <AdminUserActions user={u as any} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
