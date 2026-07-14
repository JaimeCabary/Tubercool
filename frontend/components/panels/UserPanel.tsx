"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { UserCog, Mail, Phone, Building2, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { usersApi } from "@/lib/api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const ROLE_COLORS: Record<string, string> = {
  super_admin:    "bg-purple-100 text-purple-700",
  hospital_admin: "bg-blue-100   text-blue-700",
  clinician:      "bg-teal-100   text-teal-700",
  researcher:     "bg-amber-100  text-amber-700",
};

interface UserPanelProps {
  userId: string;
}

export function UserPanel({ userId }: UserPanelProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersApi.get(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }
  if (!user) return <p className="text-sm text-gray-500">User not found.</p>;

  const initials = (user.full_name ?? user.email)
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const Row = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) =>
    value ? (
      <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
        <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] text-gray-400">{label}</p>
          <p className="text-sm text-gray-800">{value}</p>
        </div>
      </div>
    ) : null;

  return (
    <div className="space-y-5">
      {/* Avatar + identity */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-lg font-bold text-blue-700">
          {initials}
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">{user.full_name ?? "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${ROLE_COLORS[user.role] ?? "bg-gray-100 text-gray-600"}`}>
              <ShieldCheck className="h-3 w-3" />
              {user.role.replace("_", " ")}
            </span>
            <StatusBadge status={user.is_active ? "active" : "inactive"} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <Row icon={Mail}     label="Email"      value={user.email} />
        <Row icon={Phone}    label="Phone"      value={user.phone} />
        <Row icon={Building2} label="Hospital"  value={user.hospital_id ?? "Not assigned"} />
        <Row icon={Clock}    label="Last Login" value={user.last_login ? format(new Date(user.last_login), "dd MMM yyyy, HH:mm") : "Never"} />
        <Row icon={Clock}    label="Joined"     value={format(new Date(user.created_at), "dd MMM yyyy")} />
      </div>

      {/* Verification badge */}
      {user.is_verified && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3">
          <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-700 font-medium">Email verified</p>
        </div>
      )}

      {/* Action */}
      <Link href={`/users/${user.id}`} className="block">
        <Button variant="outline" size="sm" className="w-full h-10 justify-between gap-2">
          <span className="flex items-center gap-2">
            <UserCog className="h-4 w-4" /> Manage User
          </span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </Button>
      </Link>
    </div>
  );
}
