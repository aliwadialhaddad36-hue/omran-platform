import { createClient } from "@/lib/supabase/server";
import { formatDate, statusColors, statusLabels } from "@/lib/utils";
import { FolderOpen, Users, Star, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalProjects },
    { count: pendingProjects },
    { count: approvedProjects },
    { count: totalClients },
    { count: pendingClients },
    { data: recentProjects },
    { data: recentClients },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("projects").select("*, profiles(full_name,email)").order("created_at", { ascending: false }).limit(5),
    supabase.from("clients").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "إجمالي المشاريع", value: totalProjects || 0, icon: FolderOpen, color: "text-blue-600 bg-blue-50", href: "/admin/projects" },
    { label: "مشاريع قيد المراجعة", value: pendingProjects || 0, icon: Clock, color: "text-yellow-600 bg-yellow-50", href: "/admin/projects?status=pending" },
    { label: "مشاريع مُعتمدة", value: approvedProjects || 0, icon: CheckCircle, color: "text-green-600 bg-green-50", href: "/admin/projects?status=approved" },
    { label: "إجمالي العملاء", value: totalClients || 0, icon: Star, color: "text-purple-600 bg-purple-50", href: "/admin/clients" },
    { label: "عملاء قيد الموافقة", value: pendingClients || 0, icon: Users, color: "text-orange-600 bg-orange-50", href: "/admin/clients?status=pending" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم الإدارة</h1>
        <p className="text-gray-500 text-sm mt-1">نظرة شاملة على المنصة</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-2xl border border-border p-5 card-hover">
            <div className={`p-2.5 rounded-xl w-fit ${s.color} mb-3`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-omran" />
              آخر المشاريع
            </h2>
            <Link href="/admin/projects" className="text-sm text-omran hover:underline">عرض الكل</Link>
          </div>
          <div className="divide-y divide-border">
            {recentProjects?.map((p) => (
              <div key={p.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{(p as any).profiles?.full_name || (p as any).profiles?.email}</p>
                </div>
                <span className={`badge-status ${statusColors[p.status]}`}>{statusLabels[p.status]}</span>
              </div>
            ))}
            {!recentProjects?.length && <div className="px-6 py-8 text-center text-sm text-gray-400">لا توجد مشاريع</div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              آخر العملاء
            </h2>
            <Link href="/admin/clients" className="text-sm text-omran hover:underline">عرض الكل</Link>
          </div>
          <div className="divide-y divide-border">
            {recentClients?.map((c) => (
              <div key={c.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.package_price} ريال</p>
                </div>
                <span className={`badge-status ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
              </div>
            ))}
            {!recentClients?.length && <div className="px-6 py-8 text-center text-sm text-gray-400">لا يوجد عملاء</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
