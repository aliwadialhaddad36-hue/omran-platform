import { createClient } from "@/lib/supabase/server";
import { formatDate, statusColors, statusLabels } from "@/lib/utils";
import { Star, ExternalLink } from "lucide-react";
import AdminClientActions from "@/components/admin/AdminClientActions";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("clients").select("*").order("created_at", { ascending: false });
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query = query.eq("status", status);
  }
  const { data: clients } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          إدارة العملاء المميزين
        </h1>
        <p className="text-gray-500 text-sm mt-1">مراجعة طلبات الاشتراك والمدفوعات</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[{ label: "الكل", value: "" }, { label: "قيد الانتظار", value: "pending" }, { label: "مُعتمد", value: "approved" }, { label: "مرفوض", value: "rejected" }].map((f) => (
          <a key={f.value} href={f.value ? `/admin/clients?status=${f.value}` : "/admin/clients"}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${status === f.value || (!status && !f.value) ? "bg-omran text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-omran/40"}`}>
            {f.label}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        {!clients?.length ? (
          <div className="py-16 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">لا يوجد عملاء</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {clients.map((c) => (
              <div key={c.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{c.name}</h3>
                      <span className={`badge-status ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
                      <span className={`badge-status ${statusColors[c.payment_status]}`}>{statusLabels[c.payment_status] || c.payment_status}</span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p><span className="font-medium">الجوال:</span> {c.phone}</p>
                      <p><span className="font-medium">البريد:</span> {c.email}</p>
                      <p><span className="font-medium">الباقة:</span> {c.package_price} ريال شهرياً</p>
                      <p className="text-xs text-gray-400">{formatDate(c.created_at)}</p>
                    </div>
                    {c.receipt_url && (
                      <a href={c.receipt_url} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-sm text-omran font-medium hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" />
                        عرض الإيصال
                      </a>
                    )}
                    {c.admin_notes && (
                      <div className="mt-2 text-sm text-gray-500 italic">ملاحظة: {c.admin_notes}</div>
                    )}
                  </div>
                  <AdminClientActions client={c as any} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
