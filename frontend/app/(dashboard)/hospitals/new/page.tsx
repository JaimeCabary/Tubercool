"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hospitalsApi } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Required"),
  code: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  lga: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function NewHospitalPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await hospitalsApi.create(data);
      toast.success("Hospital added");
      router.push("/hospitals");
    } catch {
      toast.error("Failed to add hospital");
    } finally {
      setLoading(false);
    }
  }

  const F = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-600">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600"><ArrowLeft className="h-4 w-4" /></button>
        <h2 className="text-xl font-semibold text-gray-900">Add Hospital</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Hospital Name *" error={errors.name?.message}>
            <Input placeholder="University of Nigeria Teaching Hospital" {...register("name")} />
          </F>
          <F label="Code">
            <Input placeholder="UNTH" {...register("code")} />
          </F>
          <F label="State">
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("state")}>
              <option value="">Select state</option>
              {["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"].map(s => <option key={s}>{s}</option>)}
            </select>
          </F>
          <F label="LGA">
            <Input placeholder="Local Government Area" {...register("lga")} />
          </F>
          <F label="Email">
            <Input type="email" placeholder="info@hospital.ng" {...register("email")} />
          </F>
          <F label="Phone">
            <Input placeholder="+234 800 000 0000" {...register("phone")} />
          </F>
        </div>
        <F label="Address">
          <Input placeholder="Full hospital address" {...register("address")} />
        </F>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Hospital
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
