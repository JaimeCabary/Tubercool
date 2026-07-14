"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Building2 } from "lucide-react";
import { hospitalsApi } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { SlidePanel } from "@/components/shared/SlidePanel";
import { HospitalPanel } from "@/components/panels/HospitalPanel";
import { Skeleton } from "@/components/ui/skeleton";

export default function HospitalsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ["hospitals"],
    queryFn: hospitalsApi.list,
  });

  const selected = hospitals?.find(h => h.id === selectedId);

  return (
    <>
      <div>
        <PageHeader
          title="Hospitals"
          description="6 University Teaching Hospitals — Southeastern Nigeria"
          action={{ label: "Add Hospital", href: "/hospitals/new", icon: Plus }}
        />

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : !hospitals?.length ? (
          <EmptyState
            icon={Building2}
            title="No hospitals added"
            description="Add the first hospital"
            action={{ label: "Add Hospital", href: "/hospitals/new" }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hospitals.map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedId(h.id)}
                className="rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-blue-300 hover:shadow-sm active:scale-[0.99]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug">{h.name}</p>
                {h.code && (
                  <p className="mt-0.5 text-xs font-mono text-gray-400">{h.code}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {[h.state, h.lga].filter(Boolean).join(", ")}
                </p>
                <div className="mt-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    h.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {h.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <SlidePanel
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "Hospital"}
        description={selected ? `${selected.state ?? ""} · ${selected.lga ?? ""}`.trim().replace(/^·\s*|·\s*$/, "") : undefined}
        width="max-w-[420px]"
      >
        {selectedId && <HospitalPanel hospitalId={selectedId} />}
      </SlidePanel>
    </>
  );
}
