import { createClient } from "@/lib/supabase/server";
import { formatDate, statusColors, statusLabels } from "@/lib/utils";
import { FolderOpen, ExternalLink } from "lucide-react";
import AdminProjectActions from "@/components/admin/AdminProjectActions";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select("*, profiles(full_name, email, phone)")
    .order("created_at", { ascending: false });

  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data: projects } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-omran" />
          إدارة المشاريع
        </h1>
        <p className="text-gray-500 text-sm mt-1">مراجعة وإدارة جميع المشاريع المقدمة</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { label: "الكل", value: "" },
          { label: "قيد الانتظار", value: "pending" },
          { label: "مُعتمد", value: "approved" },
          { label: "مرفوض", value: "rejected" },
        ].map((f) => (
          <a
            key={f.value}
            href={f.value ? `/admin/projects?status=${f.value}` : "/admin/projects"}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${status === f.value || (!status && !f.value) ? "bg-omran text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-omran/40"}`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        {!projects?.length ? (
          <div className="py-16 text-center">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">لا توجد مشاريع</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {projects.map((p) => (
              <div key={p.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">{p.name}</h3>
                      <span className={`badge-status ${statusColors[p.status]}`}>{statusLabels[p.status]}</span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p><span className="font-medium">الشركة:</span> {p.company}</p>
                      <p><span className="font-medium">مقدم بواسطة:</span> {(p as any).profiles?.full_name || "غير معروف"} — {(p as any).profiles?.email}</p>
                      <p><span className="font-medium">البريد الإلكتروني:</span> {p.email}</p>
                      <p className="text-xs text-gray-400">{formatDate(p.created_at)}</p>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed">
                      {p.details}
                    </div>
                    {p.status === "approved" && p.project_url && (
                      <a href={p.project_url} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-sm text-omran font-medium hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" />
                        {p.project_url}
                      </a>
                    )}
                    {p.admin_notes && (
                      <div className="mt-2 text-sm text-gray-500 italic">ملاحظة: {p.admin_notes}</div>
                    )}
                  </div>
                  <AdminProjectActions project={p as any} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
