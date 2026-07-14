"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { testsApi, patientsApi } from "@/lib/api";

const schema = z.object({
  patient_id: z.string().min(1, "Select a patient"),
  test_date: z.string().min(1, "Required"),
  genexpert_result: z.string().optional(),
  genexpert_rif_resistance: z.string().optional(),
  genexpert_ct_value: z.coerce.number().optional(),
  afb_smear_1: z.string().optional(),
  afb_smear_2: z.string().optional(),
  afb_smear_3: z.string().optional(),
  afb_culture: z.string().optional(),
  mantoux_result_mm: z.coerce.number().optional(),
  mantoux_interpretation: z.string().optional(),
  cxr_done: z.boolean().default(false),
  cxr_result: z.string().optional(),
  cxr_findings: z.string().optional(),
  igra_result: z.string().optional(),
  dst_isoniazid: z.string().optional(),
  dst_rifampicin: z.string().optional(),
  dst_ethambutol: z.string().optional(),
  dst_pyrazinamide: z.string().optional(),
  dst_streptomycin: z.string().optional(),
  tb_status: z.enum(["positive", "negative", "indeterminate", "pending"]).default("pending"),
  tb_type: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const AFB_OPTIONS = ["negative", "scanty", "1+", "2+", "3+"];
const GENE_OPTIONS = ["MTB not detected", "MTB detected", "Invalid", "Error", "No result"];
const SENS_OPTIONS = ["", "sensitive", "resistant", "indeterminate"];

export default function NewTestPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPatientId = searchParams.get("patient_id") ?? "";

  const { data: patients } = useQuery({ queryKey: ["patients"], queryFn: () => patientsApi.list() });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { patient_id: defaultPatientId, test_date: new Date().toISOString().split("T")[0] },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== "")
      );
      const test = await testsApi.create(cleanedData);
      toast.success("Test result saved");
      router.push(`/tests/${test.id}`);
    } catch {
      toast.error("Failed to save test result");
    } finally {
      setLoading(false);
    }
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => {
    const isRequired = label.endsWith(" *");
    const labelText = isRequired ? label.slice(0, -2) : label;
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-600">
          {labelText}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {children}
      </div>
    );
  };

  const Select = ({ name, options, placeholder }: { name: keyof FormData; options: string[]; placeholder?: string }) => (
    <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register(name as any)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o || "N/A"}</option>)}
    </select>
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">New Test Result</h2>
          <p className="text-sm text-gray-500">Enter diagnostic test results</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Section title="Basic Information">
          <Field label="Patient *">
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("patient_id")}>
              <option value="">Select patient</option>
              {(patients ?? []).map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name} — {p.patient_id}</option>
              ))}
            </select>
            {errors.patient_id && <p className="text-xs text-red-500">{errors.patient_id.message}</p>}
          </Field>
          <Field label="Test Date *">
            <Input type="date" {...register("test_date")} />
          </Field>
          <Field label="TB Status">
            <Select name="tb_status" options={["pending", "positive", "negative", "indeterminate"]} />
          </Field>
          <Field label="TB Type">
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("tb_type")}>
              <option value="">Select type</option>
              <option>Pulmonary TB</option>
              <option>Extra-pulmonary TB</option>
              <option>MDR-TB</option>
              <option>XDR-TB</option>
            </select>
          </Field>
        </Section>

        <Section title="GeneXpert / Xpert MTB-RIF">
          <Field label="GeneXpert Result">
            <Select name="genexpert_result" options={GENE_OPTIONS} placeholder="Not done" />
          </Field>
          <Field label="RIF Resistance">
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("genexpert_rif_resistance")}>
              <option value="">N/A</option>
              <option>Detected</option>
              <option>Not detected</option>
              <option>Indeterminate</option>
            </select>
          </Field>
          <Field label="CT Value">
            <Input type="number" step="0.1" placeholder="e.g. 18.5" {...register("genexpert_ct_value")} />
          </Field>
        </Section>

        <Section title="AFB Smear Microscopy">
          <Field label="Smear 1"><Select name="afb_smear_1" options={AFB_OPTIONS} placeholder="Not done" /></Field>
          <Field label="Smear 2"><Select name="afb_smear_2" options={AFB_OPTIONS} placeholder="Not done" /></Field>
          <Field label="Smear 3"><Select name="afb_smear_3" options={AFB_OPTIONS} placeholder="Not done" /></Field>
          <Field label="Culture Result">
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("afb_culture")}>
              <option value="">Not done</option>
              <option>Negative</option>
              <option>Positive</option>
              <option>Contaminated</option>
            </select>
          </Field>
        </Section>

        <Section title="Mantoux / TST">
          <Field label="Induration (mm)">
            <Input type="number" step="0.5" placeholder="e.g. 12" {...register("mantoux_result_mm")} />
          </Field>
          <Field label="Interpretation">
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("mantoux_interpretation")}>
              <option value="">N/A</option>
              <option>Negative</option>
              <option>Positive</option>
            </select>
          </Field>
        </Section>

        <Section title="Drug Sensitivity Testing (DST)">
          <Field label="Isoniazid"><Select name="dst_isoniazid" options={SENS_OPTIONS} /></Field>
          <Field label="Rifampicin"><Select name="dst_rifampicin" options={SENS_OPTIONS} /></Field>
          <Field label="Ethambutol"><Select name="dst_ethambutol" options={SENS_OPTIONS} /></Field>
          <Field label="Pyrazinamide"><Select name="dst_pyrazinamide" options={SENS_OPTIONS} /></Field>
          <Field label="Streptomycin"><Select name="dst_streptomycin" options={SENS_OPTIONS} /></Field>
        </Section>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Label className="text-xs text-gray-600 mb-2 block">Clinical Notes</Label>
          <Textarea rows={3} placeholder="Additional findings..." {...register("notes")} />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Test Result
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
