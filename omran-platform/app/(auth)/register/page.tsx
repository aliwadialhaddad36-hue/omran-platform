"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react";

const registerSchema = z
  .object({
    full_name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
    phone: z.string().min(9, "رقم الجوال غير صحيح"),
    email: z.string().email("بريد إلكتروني غير صالح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirm_password"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name, phone: data.phone },
      },
    });
    if (error) {
      setError(error.message === "User already registered" ? "هذا البريد الإلكتروني مسجل مسبقاً" : error.message);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const fields: { name: keyof RegisterForm; label: string; type?: string; placeholder: string }[] = [
    { name: "full_name", label: "الاسم الكامل", placeholder: "محمد أحمد" },
    { name: "phone", label: "رقم الجوال", placeholder: "05xxxxxxxx" },
    { name: "email", label: "البريد الإلكتروني", type: "email", placeholder: "example@email.com" },
  ];

  return (
    <div className="min-h-screen omran-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <Building2 className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">العمران</h1>
          <p className="text-white/70 text-sm">منصة إدارة المشاريع</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">إنشاء حساب جديد</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                <input
                  {...register(f.name)}
                  type={f.type || "text"}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-omran/30 focus:border-omran transition-all"
                />
                {errors[f.name] && (
                  <p className="mt-1 text-xs text-red-500">{errors[f.name]?.message}</p>
                )}
              </div>
            ))}

            {(["password", "confirm_password"] as const).map((fieldName) => (
              <div key={fieldName}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {fieldName === "password" ? "كلمة المرور" : "تأكيد كلمة المرور"}
                </label>
                <div className="relative">
                  <input
                    {...register(fieldName)}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-omran/30 focus:border-omran transition-all"
                  />
                  {fieldName === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {errors[fieldName] && (
                  <p className="mt-1 text-xs text-red-500">{errors[fieldName]?.message}</p>
                )}
              </div>
            ))}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-omran hover:bg-omran-light text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-omran font-medium hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
