"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2, LayoutDashboard, FolderPlus, Users,
  MessageSquare, Bell, LogOut, ChevronLeft, Shield, Menu, X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

interface SidebarProps {
  profile: Profile;
  unreadCount?: number;
}

const userNav = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/add-project", label: "إضافة مشروع", icon: FolderPlus },
  { href: "/clients", label: "العملاء المميزون", icon: Users },
  { href: "/chat", label: "شات الفريق", icon: MessageSquare },
  { href: "/notifications", label: "الإشعارات", icon: Bell },
];

const adminNav = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/projects", label: "المشاريع", icon: FolderPlus },
  { href: "/admin/clients", label: "العملاء", icon: Users },
  { href: "/admin/users", label: "المستخدمون", icon: Shield },
  { href: "/chat", label: "شات الفريق", icon: MessageSquare },
  { href: "/admin/notifications", label: "الإشعارات", icon: Bell },
];

export default function Sidebar({ profile, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = profile.role === "admin";
  const nav = isAdmin ? adminNav : userNav;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">العمران</p>
            <p className="text-white/50 text-xs">
              {isAdmin ? "لوحة الإدارة" : "لوحة المستخدم"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const hasNotif = item.href.includes("notifications") && unreadCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn("sidebar-item", isActive && "active")}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {hasNotif && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-4 py-3 mb-2">
          <p className="text-white font-medium text-sm truncate">{profile.full_name || profile.email}</p>
          <p className="text-white/50 text-xs truncate">{profile.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-right text-red-300 hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-omran text-white rounded-lg shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 bg-gradient-to-b from-omran-dark to-omran shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 left-4 p-1 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-omran-dark to-omran shadow-2xl fixed inset-y-0 right-0 z-30">
        <SidebarContent />
      </aside>
    </>
  );
}
