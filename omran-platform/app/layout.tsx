import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "العمران - منصة المشاريع",
  description: "منصة العمران لإدارة ونشر المشاريع العقارية والإنشائية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-arabic antialiased">{children}</body>
    </html>
  );
}
