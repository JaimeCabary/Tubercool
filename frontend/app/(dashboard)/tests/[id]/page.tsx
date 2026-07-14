"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Brain } from "lucide-react";
import { testsApi, predictionsApi } from "@/lib/api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";

export default function TestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [predicting, setPredicting] = useState(false);

  const { data: test, isLoading } = useQuery({
    queryKey: ["test", id],
    queryFn: () => testsApi.get(id),
  });

  async function runPrediction() {
    if (!test) return;
    setPredicting(true);
    try {
      const pred = await predictionsApi.create(test.patient_id, test.id);
      toast.success("Prediction generated");
      router.push(`/predictions/${pred.id}`);
    } catch {
      toast.error("Prediction failed");
    } finally {
      setPredicting(false);
    }
  }

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-48 rounded-xl" /><Skeleton className="h-48 rounded-xl" /></div>;
  if (!test) return <p className="text-gray-500">Test not found</p>;

  const Row = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-900">{value ?? "—"}</span>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Test Result</h2>
            <p className="text-xs text-gray-500">{format(new Date(test.test_date), "dd MMMM yyyy")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={test.tb_status} />
          <Button size="sm" variant="outline" onClick={runPrediction} disabled={predicting} className="gap-1.5">
            <Brain className="h-3.5 w-3.5" /> {predicting ? "Running..." : "Run AI"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Section title="GeneXpert">
          <Row label="Result" value={test.genexpert_result} />
          <Row label="RIF Resistance" value={test.genexpert_rif_resistance} />
          <Row label="CT Value" value={test.genexpert_ct_value} />
        </Section>

        <Section title="AFB Smear">
          <Row label="Smear 1" value={test.afb_smear_1} />
          <Row label="Smear 2" value={test.afb_smear_2} />
          <Row label="Smear 3" value={test.afb_smear_3} />
          <Row label="Culture" value={test.afb_culture} />
        </Section>

        <Section title="Mantoux / TST">
          <Row label="Induration" value={test.mantoux_result_mm != null ? `${test.mantoux_result_mm} mm` : null} />
          <Row label="Interpretation" value={test.mantoux_interpretation} />
        </Section>

        <Section title="IGRA">
          <Row label="Result" value={test.igra_result} />
        </Section>

        <Section title="Drug Sensitivity (DST)">
          <Row label="Isoniazid" value={test.dst_isoniazid} />
          <Row label="Rifampicin" value={test.dst_rifampicin} />
          <Row label="Ethambutol" value={test.dst_ethambutol} />
          <Row label="Pyrazinamide" value={test.dst_pyrazinamide} />
          <Row label="Streptomycin" value={test.dst_streptomycin} />
        </Section>

        <Section title="Final Classification">
          <Row label="TB Status" value={test.tb_status} />
          <Row label="TB Type" value={test.tb_type} />
          <Row label="Test Status" value={test.status} />
        </Section>
      </div>

      {test.notes && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Notes</h3>
          <p className="text-sm text-gray-700">{test.notes}</p>
        </div>
      )}
    </div>
  );
}
