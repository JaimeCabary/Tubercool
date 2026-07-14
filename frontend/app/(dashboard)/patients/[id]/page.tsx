"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Plus, FlaskConical, Brain, Edit } from "lucide-react";
import { patientsApi, testsApi, predictionsApi } from "@/lib/api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => patientsApi.get(id),
  });

  const { data: tests } = useQuery({
    queryKey: ["tests", id],
    queryFn: () => testsApi.list({ patient_id: id }),
    enabled: !!id,
  });

  const { data: predictions } = useQuery({
    queryKey: ["predictions", id],
    queryFn: () => predictionsApi.list({ patient_id: id }),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="space-y-4 max-w-4xl">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );

  if (!patient) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-gray-500">Patient not found</p>
      <Link href="/patients" className="mt-4 text-sm text-blue-600">← Back to patients</Link>
    </div>
  );

  const InfoRow = ({ label, value }: { label: string; value?: string | null | boolean }) => (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-900">
        {typeof value === "boolean" ? (value ? "Yes" : "No") : (value || "—")}
      </span>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h2>
            <p className="text-xs font-mono text-gray-500">{patient.patient_id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/tests/new?patient_id=${id}`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Test
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={async () => {
              await predictionsApi.create(id);
              router.push(`/predictions?patient_id=${id}`);
            }}
          >
            <Brain className="h-3.5 w-3.5" /> Run Prediction
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Personal */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Personal</h3>
          <InfoRow label="Gender" value={patient.gender} />
          <InfoRow label="Date of Birth" value={patient.date_of_birth ? format(new Date(patient.date_of_birth), "dd MMM yyyy") : null} />
          <InfoRow label="Phone" value={patient.phone} />
          <InfoRow label="Occupation" value={patient.occupation} />
          <InfoRow label="Education" value={patient.education_level} />
        </div>

        {/* Location */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Location</h3>
          <InfoRow label="State" value={patient.state} />
          <InfoRow label="LGA" value={patient.lga} />
          <InfoRow label="Address" value={patient.address} />
        </div>

        {/* Risk Factors */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Risk Factors</h3>
          <InfoRow label="HIV Status" value={patient.hiv_status} />
          <InfoRow label="Diabetes" value={patient.diabetes} />
          <InfoRow label="Smoking" value={patient.smoking} />
          <InfoRow label="Alcohol" value={patient.alcohol} />
          <InfoRow label="Previous TB" value={patient.previous_tb} />
          <InfoRow label="TB Contact" value={patient.tb_contact} />
        </div>
      </div>

      {/* Tests */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Test Results</h3>
          <Link href={`/tests/new?patient_id=${id}`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </Link>
        </div>
        {!tests?.length ? (
          <p className="text-xs text-gray-500">No tests recorded yet</p>
        ) : (
          <div className="space-y-2">
            {tests.map(t => (
              <Link key={t.id} href={`/tests/${t.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FlaskConical className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">{format(new Date(t.test_date), "dd MMM yyyy")}</p>
                    <p className="text-[10px] text-gray-500">GeneXpert: {t.genexpert_result ?? "—"} · AFB: {t.afb_smear_1 ?? "—"}</p>
                  </div>
                </div>
                <StatusBadge status={t.tb_status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Predictions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">AI Predictions</h3>
        {!predictions?.length ? (
          <p className="text-xs text-gray-500">No predictions generated yet</p>
        ) : (
          <div className="space-y-2">
            {predictions.map(p => (
              <Link key={p.id} href={`/predictions/${p.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-xs font-medium text-gray-900 capitalize">{p.prediction} — {p.confidence} confidence</p>
                    <p className="text-[10px] text-gray-500">
                      P(+): {((p.probability_positive ?? 0) * 100).toFixed(1)}% · {p.model_version}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">{format(new Date(p.created_at), "dd MMM")}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
