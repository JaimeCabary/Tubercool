"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrendsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "prevalence"],
    queryFn: analyticsApi.prevalenceByYear,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Trends" description="Long-term TB case trend analysis 2010–2026" />

      {isLoading ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Multi-Year Trend</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="total" stroke="#93C5FD" strokeWidth={2} name="Total Tested" dot={{ r: 3 }} />
              <Line yAxisId="left" type="monotone" dataKey="positive" stroke="#2563EB" strokeWidth={2} name="TB Positive" dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="Rate %" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
