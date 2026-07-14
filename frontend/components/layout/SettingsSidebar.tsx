"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Shield, Bell, Settings } from "lucide-react";

const links = [
  { href: "/settings/profile",       icon: User,     label: "Profile" },
  { href: "/settings/security",      icon: Shield,   label: "Security" },
  { href: "/settings/notifications", icon: Bell,     label: "Notifications" },
  { href: "/settings/system",        icon: Settings, label: "System" },
];

export function SettingsSidebar() {
  const pathname = usePathname();
  return (
    <nav className="w-44 shrink-0 space-y-0.5">
      {links.map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === href
              ? "bg-blue-50 text-blue-700 font-medium"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
