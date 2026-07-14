"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/auth";

const schema = z.object({
  full_name: z.string().min(2, "Required"),
  email: z.string().email(),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProfileSettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: user?.full_name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  async function onSubmit(_data: FormData) {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success("Profile updated");
    setLoading(false);
  }

  const F = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-600">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="space-y-4 max-w-lg">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Profile Information</h3>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-semibold text-blue-700">
            {(user?.full_name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <F label="Full Name" error={errors.full_name?.message}>
            <Input {...register("full_name")} />
          </F>
          <F label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </F>
          <F label="Phone">
            <Input {...register("phone")} />
          </F>
          <Button type="submit" size="sm" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
