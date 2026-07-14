"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Brain } from "lucide-react";
import Link from "next/link";
import { predictionsApi } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SlidePanel } from "@/components/shared/SlidePanel";
import { PredictionPanel } from "@/components/panels/PredictionPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function PredictionsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: predictions, isLoading } = useQuery({
    queryKey: ["predictions"],
    queryFn: () => predictionsApi.list(),
  });

  return (
    <>
      <div>
        <PageHeader
          title="AI Predictions"
          description="TB diagnosis predictions — click any row to inspect"
        />

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : !predictions?.length ? (
            <div className="p-8">
              <EmptyState
                icon={Brain}
                title="No predictions yet"
                description="Navigate to a patient and run an AI prediction"
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {predictions.map(p => {
                const probPos = (p.probability_positive ?? 0) * 100;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedId(p.id)}
                  >
                    {/* Probability circle */}
                    <div className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold",
                      p.prediction === "positive"      ? "bg-red-100 text-red-700"
                        : p.prediction === "negative"  ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    )}>
                      {probPos.toFixed(0)}%
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {p.prediction} — <span className="font-normal text-gray-500">{p.confidence} confidence</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {p.model_version} · {format(new Date(p.created_at), "dd MMM yyyy, HH:mm")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={p.prediction ?? "pending"} />
                      <Link
                        href={`/predictions/${p.id}`}
                        onClick={e => e.stopPropagation()}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Full →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SlidePanel
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title="Prediction Result"
        description="Probability scores and feature breakdown"
        width="max-w-[480px]"
      >
        {selectedId && <PredictionPanel predictionId={selectedId} />}
      </SlidePanel>
    </>
  );
}
