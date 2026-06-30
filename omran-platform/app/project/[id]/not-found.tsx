import Link from "next/link";
import { Building2, AlertTriangle } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">المشروع غير متاح</h1>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          هذا المشروع غير موجود أو لم تتم الموافقة عليه بعد. إذا كنت صاحب المشروع، يرجى انتظار موافقة الإدارة.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-omran hover:bg-omran-light text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Building2 className="w-4 h-4" />
          العودة للمنصة
        </Link>
      </div>
    </div>
  );
}
