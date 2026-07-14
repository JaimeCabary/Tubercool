"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2 } from "lucide-react";
import { hospitalsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: hospital, isLoading } = useQuery({
    queryKey: ["hospital", id],
    queryFn: () => hospitalsApi.get(id),
  });

  if (isLoading) return <Skeleton className="h-64 rounded-xl max-w-xl" />;
  if (!hospital) return <p className="text-gray-500">Hospital not found</p>;

  const Row = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-900">{value || "—"}</span>
    </div>
  );

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600"><ArrowLeft className="h-4 w-4" /></button>
        <h2 className="text-xl font-semibold text-gray-900">{hospital.name}</h2>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <Row label="Code" value={hospital.code} />
        <Row label="State" value={hospital.state} />
        <Row label="LGA" value={hospital.lga} />
        <Row label="Address" value={hospital.address} />
        <Row label="Email" value={hospital.email} />
        <Row label="Phone" value={hospital.phone} />
        <Row label="Status" value={hospital.is_active ? "Active" : "Inactive"} />
      </div>
    </div>
  );
}
