"use client";
import { useState, useEffect } from "react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Search, Menu, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

const TITLES: Record<string, string> = {
  "/dashboard":              "Dashboard",
  "/patients":               "Patients",
  "/patients/new":           "New Patient",
  "/tests":                  "Test Results",
  "/tests/new":              "New Test",
  "/predictions":            "AI Predictions",
  "/analytics/prevalence":   "Prevalence",
  "/analytics/trends":       "Trends",
  "/analytics/demographics": "Demographics",
  "/analytics/risk-factors": "Risk Factors",
  "/analytics/hospitals":    "Hospital Comparison",
  "/hospitals":              "Hospitals",
  "/hospitals/new":          "New Hospital",
  "/users":                  "Users",
  "/users/new":              "New User",
  "/reports":                "Reports",
  "/reports/generate":       "Generate Report",
  "/reports/history":        "Report History",
  "/settings/profile":       "Profile",
  "/settings/security":      "Security",
  "/settings/notifications": "Notifications",
  "/settings/system":        "System",
};

export function TopBar() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "TuberCool";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 gap-4">
      <div className="flex items-center gap-3">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[270px] border-r-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h1 className="text-sm font-semibold text-gray-900 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search..." className="h-8 w-52 pl-9 text-xs bg-gray-50" />
        </div>
        <Link href="/settings/profile" className="md:hidden relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Settings className="h-[18px] w-[18px]" />
        </Link>
        <Link href="/notifications" className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          {/* dot */}
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
        </Link>
      </div>
    </header>
  );
}
