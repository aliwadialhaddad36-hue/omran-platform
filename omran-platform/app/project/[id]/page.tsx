import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import {
  Building2, Calendar, Link2, Share2, User, Briefcase,
  CheckCircle, ArrowRight, ExternalLink
} from "lucide-react";
import Link from "next/link";
import ShareButton from "./ShareButton";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name, company, details")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!project) {
    return { title: "مشروع غير موجود | العمران" };
  }

  return {
    title: `${project.name} — ${project.company} | العمران`,
    description: project.details.slice(0, 160),
    openGraph: {
      title: `${project.name} | منصة العمران`,
      description: project.details.slice(0, 160),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} | منصة العمران`,
      description: project.details.slice(0, 160),
    },
  };
}

export default async function PublicProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*, profiles(full_name)")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!project) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const shareUrl = `${appUrl}/project/${id}`;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-omran-dark to-omran shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-white font-bold text-lg">العمران</span>
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
          >
            <span>انضم للمنصة</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </header>

      {/* Hero band */}
      <div className="bg-gradient-to-l from-omran/90 to-omran-light/80 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-3">
            <CheckCircle className="w-4 h-4" />
            مشروع معتمد على منصة العمران
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {project.name}
          </h1>
          <p className="text-white/70 text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            {project.company}
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Details card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-800 text-base">تفاصيل المشروع</h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-600 leading-loose text-sm whitespace-pre-wrap">
                  {project.details}
                </p>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: User, label: "المقدِّم", value: (project as any).profiles?.full_name || "غير معلن" },
                { icon: Briefcase, label: "الشركة", value: project.company },
                { icon: Calendar, label: "تاريخ الإضافة", value: formatDate(project.created_at) },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-omran mb-1.5">
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs font-semibold text-gray-500">{item.label}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Project link card */}
            {project.project_url && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-omran" />
                  رابط المشروع
                </h3>
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-4 py-3 bg-omran hover:bg-omran-light text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{project.project_url}</span>
                </a>
              </div>
            )}

            {/* Share card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-omran" />
                شارك المشروع
              </h3>
              <div className="space-y-2">
                <ShareButton
                  url={shareUrl}
                  title={`${project.name} — ${project.company} | منصة العمران`}
                />
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`🏗️ ${project.name}\n${project.company}\n\nاطّلع على تفاصيل المشروع:\n${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-medium transition-colors border border-green-200"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                  مشاركة عبر واتساب
                </a>
                {/* Twitter/X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🏗️ ${project.name} — ${project.company}\nاطّلع على المشروع على منصة العمران:\n${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-colors border border-gray-200"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  مشاركة على X
                </a>
              </div>
            </div>

            {/* CTA card */}
            <div className="bg-gradient-to-br from-omran to-omran-light rounded-2xl p-5 text-white">
              <Building2 className="w-7 h-7 text-yellow-400 mb-3" />
              <h3 className="font-bold mb-1.5 text-base">أضف مشروعك</h3>
              <p className="text-white/70 text-xs mb-4 leading-relaxed">
                انضم لمنصة العمران وانشر مشروعك للوصول لآلاف المهتمين
              </p>
              <Link
                href="/register"
                className="block text-center py-2.5 px-4 bg-yellow-400 hover:bg-yellow-300 text-omran-dark rounded-xl text-sm font-bold transition-colors"
              >
                ابدأ الآن مجاناً
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-omran" />
            <span>منصة العمران — جميع الحقوق محفوظة {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-omran transition-colors">دخول</Link>
            <Link href="/register" className="hover:text-omran transition-colors">تسجيل</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
