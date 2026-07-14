"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { patientsApi } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SlidePanel } from "@/components/shared/SlidePanel";
import { PatientPanel } from "@/components/panels/PatientPanel";
import { RunPredictionPanel } from "@/components/panels/RunPredictionPanel";
import { FilterPanel, type FilterValues } from "@/components/panels/FilterPanel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { format } from "date-fns";
import { getAvatarUrl } from "@/lib/utils";

type Panel =
  | { type: "patient"; id: string }
  | { type: "predict"; id: string; name: string }
  | { type: "filter" }
  | null;

const EMPTY_FILTER: FilterValues = {
  state: "", hospital_id: "", hiv_status: "", tb_status: "", gender: "",
};

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTER);
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(EMPTY_FILTER);

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients", search, appliedFilters],
    queryFn: () =>
      patientsApi.list({
        search: search || undefined,
        state: appliedFilters.state || undefined,
        hospital_id: appliedFilters.hospital_id || undefined,
      }),
  });

  const panelTitle =
    panel?.type === "patient" ? "Patient Overview"
    : panel?.type === "predict" ? "Run AI Prediction"
    : "Filters";

  const panelDescription =
    panel?.type === "patient" ? "Quick summary and actions"
    : panel?.type === "predict" ? "Analyse latest test results"
    : undefined;

  return (
    <>
      <div>
        <PageHeader
          title="Patients"
          description={`${patients?.length ?? 0} patient records`}
          action={{ label: "New Patient", href: "/patients/new", icon: Plus }}
        />

        {/* Search + Filter bar */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search name or ID..."
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={() => { setFilters(appliedFilters); setPanel({ type: "filter" }); }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : !patients?.length ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title="No patients found"
                description="Register the first patient to get started"
              />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
                  <th className="px-4 py-3 text-left font-medium">Patient</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">ID</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">State</th>
                  <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">HIV</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Registered</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map(p => (
                  <tr
                    key={p.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => setPanel({ type: "patient", id: p.id })}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getAvatarUrl(`${p.first_name} ${p.last_name}`, p.gender || undefined)} 
                          alt="avatar" 
                          className="h-8 w-8 shrink-0 rounded-full bg-blue-50 border border-blue-100" 
                        />
                        <span className="font-medium text-gray-900">
                          {p.first_name} {p.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400 hidden sm:table-cell">
                      {p.patient_id}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.state ?? "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <StatusBadge status={p.hiv_status ?? "unknown"} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden md:table-cell">
                      {format(new Date(p.created_at), "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <Link
                        href={`/patients/${p.id}`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Full →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide panel */}
      <SlidePanel
        open={!!panel}
        onClose={() => setPanel(null)}
        title={panelTitle}
        description={panelDescription}
        width="max-w-[440px]"
      >
        {panel?.type === "patient" && (
          <PatientPanel
            patientId={panel.id}
            onRunPrediction={(id) => {
              const p = patients?.find(x => x.id === id);
              setPanel({
                type: "predict",
                id,
                name: p ? `${p.first_name} ${p.last_name}` : "Patient",
              });
            }}
          />
        )}
        {panel?.type === "predict" && (
          <RunPredictionPanel patientId={panel.id} patientName={panel.name} />
        )}
        {panel?.type === "filter" && (
          <FilterPanel
            values={filters}
            onChange={setFilters}
            onApply={() => { setAppliedFilters(filters); setPanel(null); }}
            onClear={() => { const e = EMPTY_FILTER; setFilters(e); setAppliedFilters(e); setPanel(null); }}
          />
        )}
      </SlidePanel>
    </>
  );
}
