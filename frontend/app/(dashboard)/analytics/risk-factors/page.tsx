"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

export default function RiskFactorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "risk-factors"],
    queryFn: () => analyticsApi.riskFactors(),
  });

  const chartData = data ? [
    { factor: "HIV+", count: data.hiv_positive, pct: +((data.hiv_positive / data.total_patients) * 100).toFixed(1) },
    { factor: "Diabetes", count: data.diabetes, pct: +((data.diabetes / data.total_patients) * 100).toFixed(1) },
    { factor: "Smoking", count: data.smoking, pct: +((data.smoking / data.total_patients) * 100).toFixed(1) },
    { factor: "Alcohol", count: data.alcohol, pct: +((data.alcohol / data.total_patients) * 100).toFixed(1) },
    { factor: "Prev. TB", count: data.previous_tb, pct: +((data.previous_tb / data.total_patients) * 100).toFixed(1) },
    { factor: "TB Contact", count: data.tb_contact, pct: +((data.tb_contact / data.total_patients) * 100).toFixed(1) },
  ] : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Risk Factors" description="Distribution of TB risk factors across patients" />

      {isLoading ? <Skeleton className="h-80 rounded-xl" /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Risk Factor Prevalence</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} />
                <Radar name="%" dataKey="pct" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Risk Factor Counts</h3>
            <div className="space-y-3">
              {chartData.map(d => (
                <div key={d.factor}>
                  <div className="mb-1 flex justify-between text-xs text-gray-700">
                    <span>{d.factor}</span>
                    <span className="font-medium">{d.count} ({d.pct}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(d.pct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
