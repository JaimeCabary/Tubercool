import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  imageSrc?: string;
  sub?: string;
  trend?: { value: number; positive: boolean };
  color?: "blue" | "green" | "red" | "amber";
}

const colors = {
  blue:  { bg: "bg-blue-50",   icon: "text-blue-600",   text: "text-blue-700" },
  green: { bg: "bg-green-50",  icon: "text-green-600",  text: "text-green-700" },
  red:   { bg: "bg-red-50",    icon: "text-red-600",    text: "text-red-700" },
  amber: { bg: "bg-amber-50",  icon: "text-amber-600",  text: "text-amber-700" },
};

export function StatCard({ label, value, icon: Icon, imageSrc, sub, trend, color = "blue" }: StatCardProps) {
  const c = colors[color];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-gray-500 tracking-wide uppercase">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
          {trend && (
            <p className={cn("mt-1 text-xs font-medium", trend.positive ? "text-green-600" : "text-red-600")}>
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% vs last year
            </p>
          )}
        </div>
        {imageSrc ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 p-1.5 shadow-sm ring-1 ring-gray-100">
            <img src={imageSrc} alt="" className="h-full w-full object-contain drop-shadow-sm" />
          </div>
        ) : Icon && (
          <div className={cn("rounded-lg p-2.5", c.bg)}>
            <Icon className={cn("h-5 w-5", c.icon)} />
          </div>
        )}
      </div>
    </div>
  );
}
