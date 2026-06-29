import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate, statusLabels, statusColors } from "@/lib/utils";
import { FolderOpen, Users, Clock, CheckCircle, ExternalLink, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: projects }, { data: profile }] = await Promise.all([
    supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ]);

  const stats = {
    total: projects?.length || 0,
    pending: projects?.filter((p) => p.status === "pending").length || 0,
    approved: projects?.filter((p) => p.status === "approved").length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          أهلاً، {profile?.full_name || "بك"} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">إليك نظرة عامة على مشاريعك</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "إجمالي المشاريع", value: stats.total, icon: FolderOpen, color: "text-blue-600 bg-blue-50" },
          { label: "قيد المراجعة", value: stats.pending, icon: Clock, color: "text-yellow-600 bg-yellow-50" },
          { label: "مُعتمدة", value: stats.approved, icon: CheckCircle, color: "text-green-600 bg-green-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5 card-hover">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-omran" />
            آخر المشاريع
          </h2>
          <Link href="/add-project" className="text-sm text-omran font-medium hover:underline">
            + إضافة مشروع
          </Link>
        </div>

        {!projects?.length ? (
          <div className="py-16 text-center">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">لا توجد مشاريع حتى الآن</p>
            <p className="text-gray-400 text-sm mt-1">أضف مشروعك الأول الآن</p>
            <Link href="/add-project" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-omran text-white rounded-xl text-sm font-medium hover:bg-omran-light transition-colors">
              إضافة مشروع
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {projects.map((p) => (
              <div key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(p.created_at)}</p>
                </div>
                <span className={`badge-status ${statusColors[p.status]}`}>
                  {statusLabels[p.status]}
                </span>
                {p.status === "approved" && p.project_url && (
                  <a
                    href={p.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-omran font-medium hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    رابط المشروع
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
