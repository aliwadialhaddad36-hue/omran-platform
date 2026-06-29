"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, FolderPlus, Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  company: z.string().min(2, "اسم الشركة مطلوب"),
  details: z.string().min(20, "يرجى كتابة تفاصيل المشروع (20 حرف على الأقل)"),
});

type FormData = z.infer<typeof schema>;

export default function AddProjectPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: insertError } = await supabase.from("projects").insert({
      user_id: user.id,
      name: data.name,
      email: data.email,
      company: data.company,
      details: data.details,
      status: "pending",
    });

    if (insertError) {
      setError("حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى");
      return;
    }

    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "تم استلام طلبك",
      message: `تم استلام مشروع "${data.name}" وسيتم مراجعته من قِبل الإدارة قريباً`,
      type: "info",
      related_type: "project",
    });

    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-20">
        <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">تم إرسال المشروع</h2>
          <p className="text-gray-500 text-sm mb-6">
            تم استلام مشروعك بنجاح. ستصلك إشعار عبر المنصة بمجرد مراجعته والموافقة عليه من قِبل الإدارة، وسيُرسل لك رابط المشروع للتسويق.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2.5 bg-omran text-white rounded-xl text-sm font-medium hover:bg-omran-light transition-colors"
          >
            إضافة مشروع آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FolderPlus className="w-6 h-6 text-omran" />
          إضافة مشروع جديد
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          أدخل تفاصيل مشروعك وسيتم مراجعته وإرسال رابط التسويق
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-section space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="محمد أحمد"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-omran/20 focus:border-omran transition-all"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-omran/20 focus:border-omran transition-all"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            اسم الشركة / الجهة <span className="text-red-500">*</span>
          </label>
          <input
            {...register("company")}
            placeholder="شركة العمران للتطوير"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-omran/20 focus:border-omran transition-all"
          />
          {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            تفاصيل المشروع <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("details")}
            rows={5}
            placeholder="اكتب تفاصيل المشروع كاملةً: النوع، الموقع، المساحة، المميزات، الجمهور المستهدف..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-omran/20 focus:border-omran transition-all resize-none"
          />
          {errors.details && <p className="mt-1 text-xs text-red-500">{errors.details.message}</p>}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-omran hover:bg-omran-light text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "جارٍ الإرسال..." : "إرسال المشروع"}
          </button>
        </div>
      </form>
    </div>
  );
}
