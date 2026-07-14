"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { usersApi } from "@/lib/api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: user, isLoading } = useQuery({ queryKey: ["user", id], queryFn: () => usersApi.get(id) });

  if (isLoading) return <Skeleton className="h-64 rounded-xl max-w-md" />;
  if (!user) return <p className="text-gray-500">User not found</p>;

  const Row = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-900">{value || "—"}</span>
    </div>
  );

  return (
    <div className="max-w-md space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600"><ArrowLeft className="h-4 w-4" /></button>
        <h2 className="text-xl font-semibold text-gray-900">{user.full_name ?? user.email}</h2>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
            {(user.full_name?.[0] ?? user.email[0]).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
            <StatusBadge status={user.is_active ? "active" : "inactive"} />
          </div>
        </div>
        <Row label="Email" value={user.email} />
        <Row label="Phone" value={user.phone} />
        <Row label="Role" value={user.role?.replace("_", " ")} />
        <Row label="Last Login" value={user.last_login ? format(new Date(user.last_login), "dd MMM yyyy HH:mm") : "Never"} />
        <Row label="Created" value={format(new Date(user.created_at), "dd MMM yyyy")} />
      </div>
    </div>
  );
}
