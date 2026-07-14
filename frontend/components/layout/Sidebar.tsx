"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  BrainCircuit,
  BarChart3,
  Building2,
  UserCog,
  FileText,
  Settings2,
  TrendingUp,
  MapPin,
  AlertTriangle,
  ChartColumnBig,
  LogOut,
  Dna,
  ChevronLeft,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { getAvatarUrl } from "@/lib/utils";

const NAV = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Clinical",
    items: [
      { href: "/patients",    icon: Users,        label: "Patients" },
      { href: "/tests",       icon: FlaskConical, label: "Test Results" },
      { href: "/predictions", icon: BrainCircuit, label: "AI Predictions" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/analytics/prevalence",   icon: BarChart3,      label: "Prevalence" },
      { href: "/analytics/trends",       icon: TrendingUp,     label: "Trends" },
      { href: "/analytics/demographics", icon: ChartColumnBig, label: "Demographics" },
      { href: "/analytics/risk-factors", icon: AlertTriangle,  label: "Risk Factors" },
      { href: "/analytics/hospitals",    icon: MapPin,         label: "By Hospital" },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/hospitals", icon: Building2, label: "Hospitals" },
      { href: "/users",     icon: UserCog,   label: "Users" },
      { href: "/reports",   icon: FileText,  label: "Reports" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/settings/profile", icon: Settings2, label: "Settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { clearAuth, user } = useAuthStore();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  function logout() {
    clearAuth();
    router.push("/login");
  }

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <aside 
      className={cn(
        "relative flex h-screen flex-col border-r border-gray-200 bg-white text-gray-600 transition-all duration-300",
        isCollapsed ? "w-[88px]" : "w-[270px]"
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-3 top-[18px] z-50 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-transform hover:bg-gray-50 hover:text-gray-900",
          isCollapsed && "rotate-180"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Logo */}
      <div className={cn("flex h-14 shrink-0 items-center border-b border-gray-100 transition-all", isCollapsed ? "justify-center px-0" : "gap-3 px-5")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-950 text-white shadow-sm shadow-blue-950/20">
          <Dna className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-gray-900 truncate tracking-tight">TuberCool</p>
            <p className="text-[10px] font-medium text-gray-500">Research Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-5 space-y-7",
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        isCollapsed ? "px-3" : "px-4"
      )}>
        {NAV.map(section => (
          <div key={section.label}>
            {!isCollapsed ? (
              <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {section.label}
              </p>
            ) : (
              <div className="mb-3 flex justify-center">
                <div className="h-0.5 w-4 rounded-full bg-gray-200"></div>
              </div>
            )}
            <ul className="space-y-1">
              {section.items.map(({ href, icon: Icon, label }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      title={isCollapsed ? label : undefined}
                      className={cn(
                        "flex items-center rounded-xl py-2 text-sm font-semibold transition-all",
                        isCollapsed ? "justify-center px-0" : "gap-3 px-3",
                        active
                          ? "bg-gray-100 text-blue-950 shadow-sm ring-1 ring-gray-200/50"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.5 : 2} />
                      {!isCollapsed && <span>{label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-gray-100 p-4">
        <div className={cn(
          "flex items-center rounded-xl py-2 transition-colors hover:bg-gray-50",
          isCollapsed ? "flex-col justify-center gap-3 px-0" : "gap-3 px-2"
        )}>
          <img 
            src={getAvatarUrl(user?.full_name || user?.email || "User", "male")} 
            alt="avatar" 
            className="h-9 w-9 shrink-0 rounded-full bg-blue-50 border border-blue-100" 
          />
          
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-gray-900 tracking-tight">
                {user?.full_name ?? user?.email ?? "User"}
              </p>
              <p className="truncate text-[10px] font-medium text-gray-500 capitalize">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
          )}

          <button
            onClick={logout}
            title="Sign out"
            className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
