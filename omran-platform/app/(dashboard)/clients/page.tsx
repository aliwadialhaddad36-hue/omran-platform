"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { PACKAGES } from "@/lib/stripe";
import { CheckCircle2, CreditCard, Loader2, Star, Upload } from "lucide-react";
import type { PackagePrice } from "@/types";

const schema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(9, "رقم الجوال غير صحيح"),
  email: z.string().email("بريد إلكتروني غير صالح"),
});
type FormData = z.infer<typeof schema>;

type Step = "form" | "package" | "payment" | "receipt" | "done";

export default function ClientsPage() {
  const [step, setStep] = useState<Step>("form");
  const [formData, setFormData] = useState<FormData | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackagePrice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "receipt">("stripe");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onFormSubmit = (data: FormData) => {
    setFormData(data);
    setStep("package");
  };

  const onPackageSelect = async () => {
    if (!formData || !selectedPackage) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: client, error: insertError } = await supabase
      .from("clients")
      .insert({ ...formData, package_price: selectedPackage, user_id: user?.id, status: "pending", payment_status: "pending" })
      .select()
      .single();

    setLoading(false);
    if (insertError) { setError("حدث خطأ، يرجى المحاولة مرة أخرى"); return; }
    setClientId(client.id);
    setStep("payment");
  };

  const onStripeCheckout = async () => {
    if (!clientId || !selectedPackage) return;
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, packagePrice: selectedPackage }),
    });
    const { url, error: stripeError } = await res.json();
    setLoading(false);
    if (stripeError) { setError(stripeError); return; }
    window.location.href = url;
  };

  const onReceiptUpload = async () => {
    if (!receiptFile || !clientId) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const ext = receiptFile.name.split(".").pop();
    const path = `receipts/${clientId}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("receipts").upload(path, receiptFile, { upsert: true });
    if (uploadError) { setError("فشل رفع الإيصال"); setLoading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("receipts").getPublicUrl(path);
    await supabase.from("clients").update({ receipt_url: publicUrl, payment_status: "paid" }).eq("id", clientId);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "تم رفع الإيصال",
        message: "تم رفع إيصال الدفع بنجاح. سيتم مراجعته من قِبل الإدارة وإخطارك بالنتيجة.",
        type: "info",
        related_type: "client",
        related_id: clientId,
      });
    }
    setLoading(false);
    setStep("done");
  };

  if (step === "done") {
    return (
      <div className="max-w-lg mx-auto mt-20">
        <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">تم الاشتراك بنجاح!</h2>
          <p className="text-gray-500 text-sm">
            تم استلام طلبك وسيتم مراجعته من قِبل الإدارة. ستصلك رسالة إشعار بمجرد الموافقة.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          العملاء المميزون
        </h1>
        <p className="text-gray-500 text-sm mt-1">اشترك في إحدى الباقات للاستفادة من خدماتنا المميزة</p>
      </div>

      <div className="flex items-center gap-2 mb-2">
        {(["form", "package", "payment", "receipt"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s || (["form","package","payment","receipt","done"].indexOf(step) > i) ? "bg-omran text-white" : "bg-gray-200 text-gray-500"}`}>
              {i + 1}
            </div>
            {i < 3 && <div className={`w-10 h-0.5 ${["form","package","payment","receipt","done"].indexOf(step) > i ? "bg-omran" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {step === "form" && (
        <form onSubmit={handleSubmit(onFormSubmit)} className="form-section space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">البيانات الشخصية</h2>
          {([
            { name: "name" as const, label: "الاسم الكامل", placeholder: "محمد أحمد" },
            { name: "phone" as const, label: "رقم الجوال", placeholder: "05xxxxxxxx" },
            { name: "email" as const, label: "البريد الإلكتروني", placeholder: "example@email.com", type: "email" },
          ]).map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label} <span className="text-red-500">*</span></label>
              <input {...register(f.name)} type={f.type || "text"} placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-omran/20 focus:border-omran" />
              {errors[f.name] && <p className="mt-1 text-xs text-red-500">{errors[f.name]?.message}</p>}
            </div>
          ))}
          <button type="submit" disabled={isSubmitting}
            className="w-full py-3 bg-omran hover:bg-omran-light text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            التالي: اختيار الباقة
          </button>
        </form>
      )}

      {step === "package" && (
        <div className="form-section space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">اختر الباقة المناسبة</h2>
          <div className="grid grid-cols-1 gap-4">
            {(Object.entries(PACKAGES) as [string, typeof PACKAGES[125]][]).map(([price, pkg]) => {
              const p = Number(price) as PackagePrice;
              const isSelected = selectedPackage === p;
              return (
                <button key={price} type="button" onClick={() => setSelectedPackage(p)}
                  className={`text-right p-5 rounded-xl border-2 transition-all ${isSelected ? "border-omran bg-omran/5" : "border-gray-200 hover:border-omran/40"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-omran bg-omran" : "border-gray-300"}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-omran">{price}</span>
                      <span className="text-sm text-gray-500 mr-1">ريال / شهر</span>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 mb-2">{pkg.label}</p>
                  <ul className="space-y-1">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}
          <div className="flex gap-3">
            <button onClick={() => setStep("form")} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">السابق</button>
            <button onClick={onPackageSelect} disabled={!selectedPackage || loading}
              className="flex-1 py-3 bg-omran hover:bg-omran-light text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              التالي: الدفع
            </button>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div className="form-section space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">طريقة الدفع</h2>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "stripe", label: "بطاقة ائتمانية", icon: CreditCard },
              { value: "receipt", label: "رفع إيصال تحويل", icon: Upload },
            ] as const).map((m) => (
              <button key={m.value} type="button" onClick={() => setPaymentMethod(m.value)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === m.value ? "border-omran bg-omran/5" : "border-gray-200 hover:border-omran/30"}`}>
                <m.icon className={`w-5 h-5 ${paymentMethod === m.value ? "text-omran" : "text-gray-400"}`} />
                <span className="text-sm font-medium text-gray-700">{m.label}</span>
              </button>
            ))}
          </div>

          {paymentMethod === "stripe" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              ستُحوَّل إلى صفحة Stripe الآمنة للدفع بالبطاقة
            </div>
          )}
          {paymentMethod === "receipt" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
              يرجى التحويل إلى الحساب المصرفي ثم رفع الإيصال في الخطوة التالية
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

          <div className="flex gap-3">
            <button onClick={() => setStep("package")} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">السابق</button>
            <button
              onClick={() => paymentMethod === "stripe" ? onStripeCheckout() : setStep("receipt")}
              disabled={loading}
              className="flex-1 py-3 bg-omran hover:bg-omran-light text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {paymentMethod === "stripe" ? "الدفع الآن" : "التالي: رفع الإيصال"}
            </button>
          </div>
        </div>
      )}

      {step === "receipt" && (
        <div className="form-section space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">رفع إيصال التحويل</h2>
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${receiptFile ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-omran/50"}`}>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-3">
              {receiptFile ? receiptFile.name : "اضغط لرفع صورة الإيصال"}
            </p>
            <label className="cursor-pointer px-5 py-2 bg-omran text-white rounded-lg text-sm font-medium hover:bg-omran-light">
              اختر الملف
              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}
          <div className="flex gap-3">
            <button onClick={() => setStep("payment")} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">السابق</button>
            <button onClick={onReceiptUpload} disabled={!receiptFile || loading}
              className="flex-1 py-3 bg-omran hover:bg-omran-light text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              رفع وإرسال
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
