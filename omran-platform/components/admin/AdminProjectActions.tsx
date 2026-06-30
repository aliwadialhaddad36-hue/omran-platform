"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, X, Loader2, Link2, Trash2 } from "lucide-react";
import type { Project } from "@/types";

export default function AdminProjectActions({ project }: { project: Project }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const defaultUrl = project.project_url ||
    `${typeof window !== "undefined" ? window.location.origin : ""}/project/${project.id}`;
  const [projectUrl, setProjectUrl] = useState(defaultUrl);
  const [adminNotes, setAdminNotes] = useState(project.admin_notes || "");
  const [showApproveModal, setShowApproveModal] = useState(false);

  const supabase = createClient();

  const approve = async () => {
    if (!projectUrl.trim()) return;
    setLoading("approve");
    await supabase.from("projects").update({ status: "approved", project_url: projectUrl, admin_notes: adminNotes }).eq("id", project.id);
    await supabase.from("notifications").insert({
      user_id: project.user_id,
      title: "تمت الموافقة على مشروعك! 🎉",
      message: `تمت الموافقة على مشروع "${project.name}". يمكنك مشاركة رابط المشروع للتسويق: ${projectUrl}`,
      type: "success",
      related_type: "project",
      related_id: project.id,
    });
    setLoading(null);
    setShowApproveModal(false);
    router.refresh();
  };

  const reject = async () => {
    setLoading("reject");
    await supabase.from("projects").update({ status: "rejected", admin_notes: adminNotes }).eq("id", project.id);
    await supabase.from("notifications").insert({
      user_id: project.user_id,
      title: "تم رفض المشروع",
      message: `نعتذر، لم تتم الموافقة على مشروع "${project.name}".${adminNotes ? ` السبب: ${adminNotes}` : ""}`,
      type: "warning",
      related_type: "project",
      related_id: project.id,
    });
    setLoading(null);
    router.refresh();
  };

  const deleteProject = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;
    setLoading("delete");
    await supabase.from("projects").delete().eq("id", project.id);
    setLoading(null);
    router.refresh();
  };

  if (project.status === "approved") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-600 font-medium">تمت الموافقة</span>
        <button onClick={deleteProject} disabled={loading === "delete"}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          {loading === "delete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  if (project.status === "rejected") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-500 font-medium">مرفوض</span>
        <button onClick={deleteProject} disabled={loading === "delete"}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          {loading === "delete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 min-w-[160px]">
        <input
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="ملاحظات (اختياري)"
          className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-omran/30 focus:border-omran"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setShowApproveModal(true)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            قبول
          </button>
          <button
            onClick={reject}
            disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            {loading === "reject" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
            رفض
          </button>
        </div>
        <button onClick={deleteProject} disabled={!!loading}
          className="flex items-center justify-center gap-1 px-3 py-2 text-red-400 hover:bg-red-50 rounded-lg text-xs transition-colors disabled:opacity-50">
          {loading === "delete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          حذف
        </button>
      </div>

      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-omran" />
              رابط المشروع
            </h3>
            <p className="text-sm text-gray-500 mb-4">أدخل رابط المشروع الذي سيُرسل للعميل للتسويق:</p>
            <input
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://omran.example.com/project/..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-omran/20 focus:border-omran mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
                إلغاء
              </button>
              <button
                onClick={approve}
                disabled={!projectUrl.trim() || loading === "approve"}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === "approve" && <Loader2 className="w-4 h-4 animate-spin" />}
                تأكيد الموافقة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
