"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FlaskConical, BrainCircuit, BarChart3 } from "lucide-react";

const LEFT_TABS = [
  { href: "/dashboard", icon: LayoutDashboard },
  { href: "/patients",  icon: Users },
];

const RIGHT_TABS = [
  { href: "/tests",               icon: FlaskConical },
  { href: "/analytics/prevalence",icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => 
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 md:hidden pointer-events-none">
      <nav className="flex w-full max-w-sm items-center justify-between gap-2 pointer-events-auto">
        
        {/* Left Pill */}
        <div className="flex h-[56px] flex-1 items-center justify-evenly rounded-[28px] bg-white/95 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 backdrop-blur-md px-2">
          {LEFT_TABS.map(({ href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                  active ? "text-blue-600" : "text-gray-400 hover:text-gray-600 active:bg-gray-100"
                )}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 1.7} />
              </Link>
            );
          })}
        </div>

        {/* Center FAB */}
        <Link 
          href="/predictions" 
          className={cn(
            "flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full shadow-[0_8px_24px_rgb(15,23,42,0.25)] transition-transform active:scale-90",
            isActive("/predictions") ? "bg-blue-600 text-white" : "bg-gray-900 text-white"
          )}
        >
          <BrainCircuit className="h-[26px] w-[26px]" strokeWidth={2} />
        </Link>

        {/* Right Pill */}
        <div className="flex h-[56px] flex-1 items-center justify-evenly rounded-[28px] bg-white/95 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 backdrop-blur-md px-2">
          {RIGHT_TABS.map(({ href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                  active ? "text-blue-600" : "text-gray-400 hover:text-gray-600 active:bg-gray-100"
                )}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 1.7} />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
