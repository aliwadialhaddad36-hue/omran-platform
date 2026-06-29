import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Bell } from "lucide-react";
import SendNotificationForm from "@/components/admin/SendNotificationForm";

export default async function AdminNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: users } = await supabase.from("profiles").select("id, full_name, email").neq("id", user.id);

  const typeColors: Record<string, string> = {
    info: "bg-blue-50 text-blue-700",
    success: "bg-green-50 text-green-700",
    warning: "bg-yellow-50 text-yellow-700",
    error: "bg-red-50 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-omran" />
          الإشعارات
        </h1>
        <p className="text-gray-500 text-sm mt-1">إرسال إشعارات للمستخدمين وعرض سجل الإشعارات</p>
      </div>

      <SendNotificationForm users={users || []} />

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-gray-900">سجل الإشعارات</h2>
        </div>
        {!notifications?.length ? (
          <div className="py-12 text-center text-gray-400">لا توجد إشعارات</div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div key={n.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50">
                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${typeColors[n.type] || typeColors.info}`}>{n.type}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    إلى: {(n as any).profiles?.full_name || (n as any).profiles?.email} — {formatDate(n.created_at)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${n.read ? "bg-gray-100 text-gray-400" : "bg-omran/10 text-omran font-medium"}`}>
                  {n.read ? "مقروء" : "غير مقروء"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
