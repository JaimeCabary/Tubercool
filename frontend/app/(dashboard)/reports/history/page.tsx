import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";

const HISTORY = [
  { id: "1", name: "Prevalence Report 2010–2026", type: "prevalence", format: "PDF", size: "2.4 MB", date: "14 Jul 2026", user: "Dr. Chidi Okafor" },
  { id: "2", name: "Demographic Analysis Q2 2026", type: "demographics", format: "CSV", size: "845 KB", date: "10 Jul 2026", user: "Dr. Amaka Eze" },
  { id: "3", name: "Hospital Performance Report", type: "hospital", format: "XLSX", size: "1.2 MB", date: "01 Jul 2026", user: "Admin" },
  { id: "4", name: "Drug Resistance Profile 2020–2026", type: "drug_resistance", format: "PDF", size: "3.1 MB", date: "25 Jun 2026", user: "Dr. Chidi Okafor" },
  { id: "5", name: "Risk Factor Summary 2026", type: "risk_factors", format: "PDF", size: "1.8 MB", date: "15 Jun 2026", user: "Dr. Ngozi Nwosu" },
];

export default function ReportHistoryPage() {
  return (
    <div>
      <PageHeader title="Report History" description="Previously generated reports" />

      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        {HISTORY.map(r => (
          <div key={r.id} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <FileText className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-500">{r.date} · {r.user} · {r.size}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded px-2 py-0.5">{r.format}</span>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                <Download className="h-3 w-3" /> Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
