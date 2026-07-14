"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FlaskConical, BrainCircuit, BarChart3 } from "lucide-react";

const TABS = [
  { href: "/dashboard",           icon: LayoutDashboard, label: "Home" },
  { href: "/patients",            icon: Users,           label: "Patients" },
  { href: "/tests",               icon: FlaskConical,    label: "Tests" },
  { href: "/predictions",         icon: BrainCircuit,    label: "AI" },
  { href: "/analytics/prevalence",icon: BarChart3,       label: "Analytics" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-safe md:hidden">
      <div className="flex">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-semibold tracking-wide transition-colors",
                active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon
                className="h-6 w-6"
                strokeWidth={active ? 2.3 : 1.7}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
