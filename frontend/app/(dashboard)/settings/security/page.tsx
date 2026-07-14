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
import { authApi } from "@/lib/api";

const schema = z.object({
  current_password: z.string().min(1, "Required"),
  new_password: z.string().min(8, "Min 8 characters"),
  confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

export default function SecuritySettingsPage() {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await authApi.changePassword(data.current_password, data.new_password);
      toast.success("Password changed successfully");
      reset();
    } catch {
      toast.error("Current password is incorrect");
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
    <div className="max-w-lg space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Change Password</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <F label="Current Password" error={errors.current_password?.message}>
            <Input type="password" {...register("current_password")} />
          </F>
          <F label="New Password" error={errors.new_password?.message}>
            <Input type="password" {...register("new_password")} />
          </F>
          <F label="Confirm New Password" error={errors.confirm_password?.message}>
            <Input type="password" {...register("confirm_password")} />
          </F>
          <Button type="submit" size="sm" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-semibold text-gray-900">Session</h3>
        <p className="text-xs text-gray-500 mb-4">Access tokens expire after 30 minutes. Refresh tokens are valid for 7 days.</p>
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="rounded bg-gray-100 px-2 py-1">Access: 30 min</span>
          <span className="rounded bg-gray-100 px-2 py-1">Refresh: 7 days</span>
        </div>
      </div>
    </div>
  );
}
