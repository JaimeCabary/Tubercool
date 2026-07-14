"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Building2, MapPin, Phone, Mail, Users, FlaskConical,
  TrendingUp, ArrowRight
} from "lucide-react";
import { hospitalsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface HospitalPanelProps {
  hospitalId: string;
}

export function HospitalPanel({ hospitalId }: HospitalPanelProps) {
  const { data: hospital, isLoading } = useQuery({
    queryKey: ["hospital", hospitalId],
    queryFn: () => hospitalsApi.get(hospitalId),
    enabled: !!hospitalId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }
  if (!hospital) return <p className="text-sm text-gray-500">Hospital not found.</p>;

  const Stat = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) => (
    <div className="flex flex-col items-center rounded-xl bg-gray-50 p-4 gap-1">
      <Icon className="h-5 w-5 text-blue-500" />
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-500 text-center">{label}</p>
    </div>
  );

  const Row = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) => (
    value ? (
      <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
        <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] text-gray-400">{label}</p>
          <p className="text-sm text-gray-800">{value}</p>
        </div>
      </div>
    ) : null
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100">
          <Building2 className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900 leading-tight">{hospital.name}</p>
          {hospital.code && (
            <p className="text-xs font-mono text-gray-400 mt-0.5">{hospital.code}</p>
          )}
          <div className="mt-1">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
              hospital.is_active
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}>
              {hospital.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats — mock counts since analytics aren't per-hospital in this query */}
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={Users} label="Patients" value="—" />
        <Stat icon={FlaskConical} label="Tests" value="—" />
        <Stat icon={TrendingUp} label="Rate" value="—" />
      </div>

      {/* Details */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <Row icon={MapPin} label="State / LGA" value={[hospital.state, hospital.lga].filter(Boolean).join(" · ")} />
        <Row icon={MapPin} label="Address" value={hospital.address} />
        <Row icon={Phone} label="Phone" value={hospital.phone} />
        <Row icon={Mail} label="Email" value={hospital.email} />
      </div>

      {/* Action */}
      <Link href={`/hospitals/${hospital.id}`} className="block">
        <Button variant="outline" size="sm" className="w-full h-10 justify-between gap-2">
          <span className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> View Full Details
          </span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </Button>
      </Link>
    </div>
  );
}
