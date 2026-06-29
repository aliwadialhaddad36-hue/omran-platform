import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import MarkAllReadButton from "@/components/shared/MarkAllReadButton";

const typeIcons = {
  info: { icon: Info, color: "text-blue-600 bg-blue-50" },
  success: { icon: CheckCircle, color: "text-green-600 bg-green-50" },
  warning: { icon: AlertTriangle, color: "text-yellow-600 bg-yellow-50" },
  error: { icon: XCircle, color: "text-red-600 bg-red-50" },
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const unreadIds = notifications?.filter((n) => !n.read).map((n) => n.id) || [];

  if (unreadIds.length > 0) {
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-omran" />
            الإشعارات
          </h1>
          <p className="text-gray-500 text-sm mt-1">جميع إشعاراتك في مكان واحد</p>
        </div>
        {unreadIds.length > 0 && <MarkAllReadButton userId={user.id} />}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        {!notifications?.length ? (
          <div className="py-16 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">لا توجد إشعارات</p>
            <p className="text-gray-400 text-sm mt-1">ستظهر هنا إشعاراتك عند وجودها</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => {
              const t = typeIcons[n.type as keyof typeof typeIcons] || typeIcons.info;
              const Icon = t.icon;
              return (
                <div key={n.id} className={`flex gap-4 px-6 py-4 transition-colors ${!n.read ? "bg-omran/5" : "hover:bg-gray-50"}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${!n.read ? "text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-omran flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
