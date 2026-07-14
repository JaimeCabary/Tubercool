"use client";
import React, { useState, useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Search, Settings, ChevronLeft, Dna } from "lucide-react";
import { Input } from "@/components/ui/input";

const TITLES: Record<string, string> = {
  "/dashboard":              "Dashboard",
  "/menu":                   "Menu",
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
  const router = useRouter();
  const title = TITLES[pathname] ?? "TuberCool";

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return Object.entries(TITLES)
      .filter(([_, title]) => title.toLowerCase().includes(lowerQuery))
      .slice(0, 6);
  }, [query]);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between bg-white/80 backdrop-blur-md px-4 gap-3">
      {/* Left side: Logo / Back Button */}
      {pathname !== "/dashboard" ? (
        <button 
          onClick={() => router.back()}
          className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 transition-colors active:scale-95"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
        </button>
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950 shadow-sm shadow-blue-950/30 md:hidden">
          <Dna className="h-[22px] w-[22px] text-white" strokeWidth={2.5} />
        </div>
      )}

      {/* Desktop Title */}
      <h1 className="hidden md:block text-base font-bold tracking-tight text-gray-900 truncate">{title}</h1>

      {/* Mobile Search Bar */}
      <div className="relative flex-1 md:hidden">
        <Input 
          type="search" 
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search Tubercool" 
          className="w-full bg-white shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-100 focus-visible:ring-1 focus-visible:ring-gray-200 rounded-full h-11 pl-4 pr-10 text-[15px]"
        />
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        
        {showResults && query.length > 0 && (
          <div className="absolute top-[52px] left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
            {results.length > 0 ? (
              results.map(([path, routeTitle]) => (
                <button
                  key={path}
                  onClick={() => { router.push(path); setQuery(""); setShowResults(false); }}
                  className="w-full flex items-center px-4 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-50 last:border-0"
                >
                  <Search className="h-4 w-4 mr-3 text-gray-400" />
                  {routeTitle}
                </button>
              ))
            ) : (
              <div className="px-4 py-4 text-sm text-gray-500 text-center">No screens found</div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Right Side */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input 
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="Search Tubercool..." 
            className="h-8 w-52 pl-9 text-xs bg-gray-50" 
          />
          {showResults && query.length > 0 && (
            <div className="absolute top-10 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              {results.length > 0 ? (
                results.map(([path, routeTitle]) => (
                  <button
                    key={path}
                    onClick={() => { router.push(path); setQuery(""); setShowResults(false); }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                  >
                    {routeTitle}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500 text-center">No results</div>
              )}
            </div>
          )}
        </div>
        <Link href="/notifications" className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
        </Link>
      </div>
    </header>
  );
}
