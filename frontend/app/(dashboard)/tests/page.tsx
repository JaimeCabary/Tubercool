"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, FlaskConical } from "lucide-react";
import { testsApi } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function TestsPage() {
  const { data: tests, isLoading } = useQuery({
    queryKey: ["tests"],
    queryFn: () => testsApi.list(),
  });

  return (
    <div>
      <PageHeader
        title="Test Results"
        description="All diagnostic test records"
        action={{ label: "New Test", href: "/tests/new", icon: Plus }}
      />

      <div className="rounded-xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : !tests?.length ? (
          <div className="p-6">
            <EmptyState icon={FlaskConical} title="No test results" description="Record the first test result" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500">
                <th className="px-4 py-3 text-left font-medium">Test Date</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">GeneXpert</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">AFB Smear</th>
                <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Mantoux (mm)</th>
                <th className="px-4 py-3 text-left font-medium">TB Status</th>
                <th className="px-4 py-3 text-left font-medium">Test Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tests.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{format(new Date(t.test_date), "dd MMM yyyy")}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{t.genexpert_result ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{t.afb_smear_1 ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{t.mantoux_result_mm ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.tb_status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/tests/${t.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
