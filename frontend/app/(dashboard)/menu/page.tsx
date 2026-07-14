"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, 
  BarChart3, 
  TrendingUp, 
  ChartColumnBig, 
  AlertTriangle, 
  MapPin, 
  Building2, 
  UserCog, 
  FileText, 
  Settings2, 
  LogOut,
  User,
  Shield,
  Bell,
  Settings
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";

const MENU_SECTIONS = [
  {
    title: "Analytics",
    items: [
      { href: "/analytics/prevalence",   icon: BarChart3,      label: "Prevalence", color: "text-blue-500", bg: "bg-blue-50" },
      { href: "/analytics/trends",       icon: TrendingUp,     label: "Trends", color: "text-indigo-500", bg: "bg-indigo-50" },
      { href: "/analytics/demographics", icon: ChartColumnBig, label: "Demographics", color: "text-purple-500", bg: "bg-purple-50" },
      { href: "/analytics/risk-factors", icon: AlertTriangle,  label: "Risk Factors", color: "text-amber-500", bg: "bg-amber-50" },
      { href: "/analytics/hospitals",    icon: MapPin,         label: "By Hospital", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  },
  {
    title: "Management",
    items: [
      { href: "/hospitals", icon: Building2, label: "Hospitals", color: "text-rose-500", bg: "bg-rose-50" },
      { href: "/users",     icon: UserCog,   label: "Users", color: "text-cyan-500", bg: "bg-cyan-50" },
      { href: "/reports",   icon: FileText,  label: "Reports", color: "text-slate-500", bg: "bg-slate-50" },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/settings/security",      icon: Shield,   label: "Security",      color: "text-emerald-500",bg: "bg-emerald-50" },
      { href: "/settings/notifications", icon: Bell,     label: "Notifications", color: "text-amber-500",  bg: "bg-amber-50" },
      { href: "/settings/system",        icon: Settings, label: "System",        color: "text-gray-500",   bg: "bg-gray-100" },
    ],
  },
];

export default function MenuPage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="mx-auto w-full max-w-md pb-12">
      {/* Profile Header */}
      <Link 
        href="/settings/profile"
        className="mb-8 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 transition-colors hover:bg-gray-50 active:scale-[0.98]"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
          {(user?.full_name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="truncate text-lg font-bold text-gray-900">{user?.full_name ?? user?.email ?? "User"}</h2>
          <p className="truncate text-sm text-gray-500 capitalize">{user?.role?.replace("_", " ")}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </Link>

      {/* Menu Sections */}
      <div className="space-y-6">
        {MENU_SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
              {section.title}
            </h3>
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
              {section.items.map((item, index) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 active:bg-gray-100 ${
                    index !== section.items.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 text-[15px] font-semibold text-gray-700">{item.label}</span>
                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Section */}
        <div className="pt-2">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-red-100">
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-4 p-4 transition-colors hover:bg-red-50 active:bg-red-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="flex-1 text-left text-[15px] font-semibold text-red-600">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
