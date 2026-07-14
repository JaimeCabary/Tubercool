"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function HospitalsAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "hospitals"],
    queryFn: () => analyticsApi.byHospital(),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Hospital Comparison" description="TB case load and positivity by hospital" />

      {isLoading ? <Skeleton className="h-80 rounded-xl" /> : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Cases by Hospital</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="hospital" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="tests" name="Total Tests" fill="#DBEAFE" radius={[0, 3, 3, 0]} />
                <Bar dataKey="positive" name="TB Positive" fill="#2563EB" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Hospital Summary Table</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500">
                  <th className="py-2 text-left font-medium">Hospital</th>
                  <th className="py-2 text-left font-medium hidden md:table-cell">State</th>
                  <th className="py-2 text-right font-medium">Patients</th>
                  <th className="py-2 text-right font-medium">Tests</th>
                  <th className="py-2 text-right font-medium">Positive</th>
                  <th className="py-2 text-right font-medium">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data ?? []).map((h: any) => (
                  <tr key={h.hospital}>
                    <td className="py-2.5 font-medium text-gray-900 text-xs">{h.hospital}</td>
                    <td className="py-2.5 text-gray-600 text-xs hidden md:table-cell">{h.state}</td>
                    <td className="py-2.5 text-right text-gray-600 text-xs">{h.patients}</td>
                    <td className="py-2.5 text-right text-gray-600 text-xs">{h.tests}</td>
                    <td className="py-2.5 text-right text-red-600 font-medium text-xs">{h.positive}</td>
                    <td className="py-2.5 text-right text-gray-600 text-xs">{h.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
