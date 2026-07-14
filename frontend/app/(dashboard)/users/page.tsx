"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, UserCog, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usersApi } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SlidePanel } from "@/components/shared/SlidePanel";
import { UserPanel } from "@/components/panels/UserPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const ROLE_COLORS: Record<string, string> = {
  super_admin:    "bg-purple-100 text-purple-700",
  hospital_admin: "bg-blue-100   text-blue-700",
  clinician:      "bg-teal-100   text-teal-700",
  researcher:     "bg-amber-100  text-amber-700",
};

export default function UsersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list(),
  });

  const selected = users?.find(u => u.id === selectedId);

  return (
    <>
      <div>
        <PageHeader
          title="Users"
          description={`${users?.length ?? 0} system users`}
          action={{ label: "Add User", href: "/users/new", icon: Plus }}
        />

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : !users?.length ? (
            <div className="p-8">
              <EmptyState
                icon={UserCog}
                title="No users yet"
                description="Add the first system user"
                action={{ label: "Add User", href: "/users/new" }}
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map(u => {
                const initials = (u.full_name ?? u.email)
                  .split(" ")
                  .map(w => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedId(u.id)}
                  >
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {u.full_name ?? "—"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>

                    {/* Role */}
                    <span className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize shrink-0 ${ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                      <ShieldCheck className="h-3 w-3" />
                      {u.role.replace("_", " ")}
                    </span>

                    {/* Status */}
                    <div className="hidden md:block shrink-0">
                      <StatusBadge status={u.is_active ? "active" : "inactive"} />
                    </div>

                    {/* Last login */}
                    <p className="hidden lg:block text-xs text-gray-400 shrink-0">
                      {u.last_login ? format(new Date(u.last_login), "dd MMM yy") : "Never"}
                    </p>

                    {/* Full link */}
                    <Link
                      href={`/users/${u.id}`}
                      onClick={e => e.stopPropagation()}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 shrink-0"
                    >
                      Edit →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SlidePanel
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={selected?.full_name ?? "User"}
        description={selected?.email}
        width="max-w-[400px]"
      >
        {selectedId && <UserPanel userId={selectedId} />}
      </SlidePanel>
    </>
  );
}
