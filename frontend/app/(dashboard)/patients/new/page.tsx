"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { patientsApi, hospitalsApi } from "@/lib/api";

const schema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  date_of_birth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  lga: z.string().optional(),
  occupation: z.string().optional(),
  education_level: z.string().optional(),
  hospital_id: z.string().min(1, "Select a hospital"),
  hiv_status: z.enum(["positive", "negative", "unknown"]).default("unknown"),
  diabetes: z.boolean().default(false),
  smoking: z.boolean().default(false),
  alcohol: z.boolean().default(false),
  previous_tb: z.boolean().default(false),
  tb_contact: z.boolean().default(false),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewPatientPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { data: hospitals } = useQuery({ queryKey: ["hospitals"], queryFn: hospitalsApi.list });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const patient = await patientsApi.create(data);
      toast.success("Patient registered successfully");
      router.push(`/patients/${patient.id}`);
    } catch {
      toast.error("Failed to register patient");
    } finally {
      setLoading(false);
    }
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-700">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  const Checkbox = ({ label, name }: { label: string; name: keyof FormData }) => (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
      <input type="checkbox" className="rounded border-gray-300" {...register(name as any)} />
      {label}
    </label>
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/patients" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Register New Patient</h2>
          <p className="text-sm text-gray-500">Fill in the patient's details and risk factors</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Section title="Personal Information">
          <Field label="First Name *" error={errors.first_name?.message}>
            <Input placeholder="Chidi" {...register("first_name")} />
          </Field>
          <Field label="Last Name *" error={errors.last_name?.message}>
            <Input placeholder="Okafor" {...register("last_name")} />
          </Field>
          <Field label="Date of Birth">
            <Input type="date" {...register("date_of_birth")} />
          </Field>
          <Field label="Gender">
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("gender")}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Phone">
            <Input placeholder="+234 800 000 0000" {...register("phone")} />
          </Field>
          <Field label="Occupation">
            <Input placeholder="Farmer, Teacher, etc." {...register("occupation")} />
          </Field>
          <Field label="Education Level">
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("education_level")}>
              <option value="">Select level</option>
              <option value="none">No formal education</option>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="tertiary">Tertiary</option>
              <option value="postgraduate">Postgraduate</option>
            </select>
          </Field>
        </Section>

        <Section title="Location">
          <Field label="Address">
            <Input placeholder="Street address" {...register("address")} />
          </Field>
          <Field label="State">
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("state")}>
              <option value="">Select state</option>
              {["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="LGA">
            <Input placeholder="Local Government Area" {...register("lga")} />
          </Field>
          <Field label="Hospital *" error={errors.hospital_id?.message}>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("hospital_id")}>
              <option value="">Select hospital</option>
              {(hospitals ?? []).map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title="Risk Factors & Medical History">
          <Field label="HIV Status">
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("hiv_status")}>
              <option value="unknown">Unknown</option>
              <option value="negative">Negative</option>
              <option value="positive">Positive</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Label className="text-xs font-medium text-gray-700 mb-3 block">Co-morbidities & Risk Factors</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Checkbox label="Diabetes" name="diabetes" />
              <Checkbox label="Smoking" name="smoking" />
              <Checkbox label="Alcohol use" name="alcohol" />
              <Checkbox label="Previous TB" name="previous_tb" />
              <Checkbox label="TB contact" name="tb_contact" />
            </div>
          </div>
        </Section>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Label className="text-xs font-medium text-gray-700 mb-2 block">Notes</Label>
          <Textarea rows={3} placeholder="Additional clinical notes..." {...register("notes")} />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register Patient
          </Button>
          <Link href="/patients">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
