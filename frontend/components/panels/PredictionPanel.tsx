"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Brain, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { predictionsApi } from "@/lib/api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip
} from "recharts";

interface PredictionPanelProps {
  predictionId: string;
}

export function PredictionPanel({ predictionId }: PredictionPanelProps) {
  const { data: p, isLoading } = useQuery({
    queryKey: ["prediction", predictionId],
    queryFn: () => predictionsApi.get(predictionId),
    enabled: !!predictionId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }
  if (!p) return <p className="text-sm text-gray-500">Prediction not found.</p>;

  const probPos = (p.probability_positive ?? 0) * 100;
  const probNeg = (p.probability_negative ?? 0) * 100;

  const features = Object.entries(p.feature_importance ?? {})
    .map(([name, value]) => ({ name, value: Math.abs(Number(value) * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const ProbBar = ({ label, pct, color }: { label: string; pct: number; color: string }) => (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );

  const confidenceIcon =
    p.confidence === "high" ? <TrendingUp className="h-4 w-4 text-green-600" />
    : p.confidence === "low" ? <TrendingDown className="h-4 w-4 text-red-500" />
    : <Minus className="h-4 w-4 text-amber-500" />;

  return (
    <div className="space-y-5">
      {/* Result hero */}
      <div className={cn(
        "rounded-2xl p-5",
        p.prediction === "positive" ? "bg-red-50 ring-1 ring-red-200"
          : p.prediction === "negative" ? "bg-green-50 ring-1 ring-green-200"
          : "bg-amber-50 ring-1 ring-amber-200"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Diagnosis Prediction
            </p>
            <p className="text-3xl font-bold capitalize text-gray-900">{p.prediction}</p>
            <div className="mt-2 flex items-center gap-1.5">
              {confidenceIcon}
              <span className="text-sm text-gray-600 capitalize">{p.confidence} confidence</span>
            </div>
          </div>
          <div className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold",
            p.prediction === "positive" ? "bg-red-100 text-red-700"
              : p.prediction === "negative" ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          )}>
            {probPos.toFixed(0)}%
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          <ProbBar label="TB Positive" pct={probPos} color="bg-red-500" />
          <ProbBar label="TB Negative" pct={probNeg} color="bg-green-500" />
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[10px] uppercase tracking-widest text-gray-400">Model</p>
          <p className="mt-0.5 text-xs font-mono font-medium text-gray-700">{p.model_version}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[10px] uppercase tracking-widest text-gray-400">Generated</p>
          <p className="mt-0.5 text-xs font-medium text-gray-700">
            {format(new Date(p.created_at), "dd MMM yyyy")}
          </p>
        </div>
      </div>

      {/* Feature importance */}
      {features.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Feature Importance
          </p>
          <ResponsiveContainer width="100%" height={features.length * 28 + 20}>
            <BarChart data={features} layout="vertical" barSize={8} margin={{ left: 0, right: 12 }}>
              <XAxis type="number" tick={{ fontSize: 9 }} unit="%" hide />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
                formatter={(v: number) => `${v.toFixed(1)}%`}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {features.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#2563EB" : i < 3 ? "#60A5FA" : "#BFDBFE"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
        <strong>Clinical Note:</strong> This is a decision-support tool only. Final diagnosis must
        be confirmed by a qualified clinician per WHO guidelines.
      </div>

      {/* Action */}
      <Link href={`/predictions/${p.id}`} className="block">
        <Button variant="outline" size="sm" className="w-full h-10 justify-between gap-2">
          <span className="flex items-center gap-2">
            <Brain className="h-4 w-4" /> View Full Analysis
          </span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </Button>
      </Link>
    </div>
  );
}
