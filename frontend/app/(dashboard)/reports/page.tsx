import Link from "next/link";
import { FileText, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";

const REPORT_TYPES = [
  { title: "Prevalence Report", description: "Annual TB prevalence rates by hospital and state", period: "2010–2026" },
  { title: "Demographic Analysis", description: "Age, gender, and geographic breakdown of TB cases", period: "Cumulative" },
  { title: "Risk Factor Summary", description: "Co-morbidities and environmental risk factors", period: "Current year" },
  { title: "Hospital Performance", description: "Case detection rates across the 6 UTH sites", period: "Quarterly" },
  { title: "Drug Resistance Profile", description: "MDR-TB and XDR-TB patterns and DST results", period: "2020–2026" },
  { title: "Trend Analysis", description: "Year-on-year trends and seasonal patterns", period: "2010–2026" },
];

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="Generate and export research-grade reports"
        action={{ label: "Custom Report", href: "/reports/generate", icon: Plus }} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map(r => (
          <div key={r.title} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <FileText className="h-4.5 w-4.5 text-blue-600 h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{r.title}</h3>
            <p className="mt-1 text-xs text-gray-500">{r.description}</p>
            <p className="mt-1 text-xs text-gray-400">{r.period}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                <Download className="h-3 w-3" /> PDF
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                <Download className="h-3 w-3" /> CSV
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
