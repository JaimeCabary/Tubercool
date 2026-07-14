"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line
} from "recharts";

export default function PrevalencePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "prevalence"],
    queryFn: analyticsApi.prevalenceByYear,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Prevalence Analysis" description="TB case prevalence across years and hospitals" />

      {isLoading ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-1 text-sm font-semibold text-gray-900">Cases by Year</h3>
            <p className="mb-4 text-xs text-gray-500">Total tested vs confirmed positive</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="total" name="Total Tested" fill="#DBEAFE" radius={[3, 3, 0, 0]} />
                <Bar dataKey="positive" name="TB Positive" fill="#2563EB" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-1 text-sm font-semibold text-gray-900">Positivity Rate</h3>
            <p className="mb-4 text-xs text-gray-500">Annual positivity rate (%)</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} name="Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary table */}
      {data && data.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Year-by-Year Summary</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500">
                <th className="py-2 text-left font-medium">Year</th>
                <th className="py-2 text-right font-medium">Total Tested</th>
                <th className="py-2 text-right font-medium">TB Positive</th>
                <th className="py-2 text-right font-medium">Positivity Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row: any) => (
                <tr key={row.year}>
                  <td className="py-2.5 font-medium text-gray-900">{row.year}</td>
                  <td className="py-2.5 text-right text-gray-600">{row.total}</td>
                  <td className="py-2.5 text-right text-red-600 font-medium">{row.positive}</td>
                  <td className="py-2.5 text-right text-gray-600">{row.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
