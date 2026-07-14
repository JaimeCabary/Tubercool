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
import { usersApi, hospitalsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const schema = z.object({
  full_name: z.string().min(2, "Required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  role: z.enum(["super_admin", "hospital_admin", "clinician", "researcher"]),
  hospital_id: z.string().optional(),
  password: z.string().min(8, "Min 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function NewUserPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: hospitals } = useQuery({ queryKey: ["hospitals"], queryFn: hospitalsApi.list });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "clinician" },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await usersApi.create(data);
      toast.success("User created");
      router.push("/users");
    } catch {
      toast.error("Failed to create user");
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
        <h2 className="text-xl font-semibold text-gray-900">Add User</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Full Name *" error={errors.full_name?.message}>
            <Input placeholder="Dr. Jane Obi" {...register("full_name")} />
          </F>
          <F label="Email *" error={errors.email?.message}>
            <Input type="email" placeholder="jane@hospital.ng" {...register("email")} />
          </F>
          <F label="Phone">
            <Input placeholder="+234 800 000 0000" {...register("phone")} />
          </F>
          <F label="Role *" error={errors.role?.message}>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("role")}>
              <option value="clinician">Clinician</option>
              <option value="hospital_admin">Hospital Admin</option>
              <option value="researcher">Researcher</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </F>
          <F label="Hospital">
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register("hospital_id")}>
              <option value="">No hospital</option>
              {(hospitals ?? []).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </F>
          <F label="Password *" error={errors.password?.message}>
            <Input type="password" placeholder="Min 8 characters" {...register("password")} />
          </F>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create User
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
