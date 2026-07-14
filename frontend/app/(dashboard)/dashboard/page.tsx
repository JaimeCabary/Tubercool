"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users, FlaskConical, Brain, Building2, TrendingUp, AlertCircle, Wifi, WifiOff
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { analyticsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSSE } from "@/lib/hooks/useSSE";

const MONTHLY_TREND = [
  { month: "Jan", tests: 42, positive: 18 },
  { month: "Feb", tests: 55, positive: 22 },
  { month: "Mar", tests: 48, positive: 19 },
  { month: "Apr", tests: 61, positive: 27 },
  { month: "May", tests: 73, positive: 30 },
  { month: "Jun", tests: 67, positive: 25 },
];

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data: overview, isLoading } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn:  analyticsApi.overview,
    staleTime: 30_000,
  });

  // ── Real-time SSE ─────────────────────────────────────────────────────────
  const { lastEvent, status: sseStatus } = useSSE(
    `${API_BASE}/stream/events`
  );

  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === "stats_update") {
      // Merge the live snapshot directly into the React Query cache
      queryClient.setQueryData<typeof overview>(
        ["analytics", "overview"],
        (old) => ({
          ...(old ?? {}),
          ...(lastEvent.payload as Partial<typeof overview>),
        })
      );
    }
  }, [lastEvent, queryClient]);

  const sseLive = sseStatus === "connected";

  return (
    <div className="space-y-6">
      {/* Hero / Vector Graphic Section */}
      <div className="flex flex-col items-center justify-center pt-8 pb-10 text-center">
        <div className="relative mb-6 flex h-48 w-48 items-center justify-center">
          {/* Decorative background glow behind the image */}
          <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl"></div>
          <img 
            src="/doctor-girl.png" 
            alt="Doctor Assistant" 
            className="relative z-10 h-full w-full object-contain drop-shadow-lg"
          />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Clinical Dashboard Overview</h2>
        <p className="mt-2 text-sm font-medium text-gray-500 max-w-[400px]">
          Manage patient records, review AI diagnostic predictions, and analyze real-time epidemiological data.
        </p>
      </div>
      {/* Live status indicator */}
      <div className="flex items-center justify-end gap-1.5">
        {sseLive ? (
          <>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <Wifi className="h-3.5 w-3.5" /> Live
            </span>
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <WifiOff className="h-3.5 w-3.5" /> Reconnecting…
            </span>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard label="Total Patients"    value={overview?.total_patients   ?? 0}    imageSrc="/stethoscope.png" color="blue"  />
            <StatCard label="Tests Conducted"   value={overview?.total_tests      ?? 0}    imageSrc="/syringe.png"     color="blue"  />
            <StatCard label="TB Positive"       value={overview?.positive_cases   ?? 0}    imageSrc="/lungs.png"       color="red"   />
            <StatCard label="Positivity Rate"   value={`${overview?.positivity_rate ?? 0}%`} imageSrc="/heart.png"       color="amber" />
            <StatCard label="AI Predictions"    value={overview?.total_predictions ?? 0}   imageSrc="/brain.png"       color="blue"  />
            <StatCard label="Hospitals"         value={overview?.active_hospitals  ?? 0}   imageSrc="/doc.png"         color="green" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Monthly Test Volume</h3>
            <p className="text-xs text-gray-500">Tests vs positive cases — last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_TREND} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="tests"    fill="#DBEAFE" name="Tests"    radius={[3, 3, 0, 0]} />
              <Bar dataKey="positive" fill="#2563EB" name="Positive" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Positivity Rate Trend</h3>
            <p className="text-xs text-gray-500">Rolling monthly rate</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={MONTHLY_TREND.map(d => ({
                ...d,
                rate: Math.round((d.positive / d.tests) * 100),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Rate %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/patients/new">
            <Button size="sm" variant="outline">+ New Patient</Button>
          </Link>
          <Link href="/tests/new">
            <Button size="sm" variant="outline">+ New Test</Button>
          </Link>
          <Link href="/predictions">
            <Button size="sm" variant="outline">Run Prediction</Button>
          </Link>
          <Link href="/analytics/prevalence">
            <Button size="sm" variant="outline">View Analytics</Button>
          </Link>
          <Link href="/reports/generate">
            <Button size="sm" variant="outline">Generate Report</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
