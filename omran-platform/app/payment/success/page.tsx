import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; client_id?: string }>;
}) {
  const { client_id } = await searchParams;

  if (client_id) {
    const supabase = await createClient();
    await supabase
      .from("clients")
      .update({ payment_status: "paid" })
      .eq("id", client_id);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "تم الدفع بنجاح! 🎉",
        message: "تم استلام دفعتك بنجاح. سيتم مراجعة اشتراكك وإخطارك بالموافقة قريباً.",
        type: "success",
        related_type: "client",
        related_id: client_id,
      });
    }
  }

  return (
    <div className="min-h-screen omran-gradient flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">تم الدفع بنجاح!</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          شكراً لك! تم استلام دفعتك بنجاح. سيتم مراجعة طلبك من قِبل فريق العمران وإخطارك عبر الإشعارات بمجرد الموافقة.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3 bg-omran hover:bg-omran-light text-white rounded-xl font-medium text-sm transition-colors"
        >
          الذهاب إلى لوحة التحكم
        </Link>
      </div>
    </div>
  );
}
