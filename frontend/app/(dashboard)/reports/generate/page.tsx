"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";

export default function GenerateReportPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "prevalence",
    from_year: "2010",
    to_year: "2026",
    hospital: "all",
    format: "pdf",
  });

  async function generate() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    toast.success("Report generated — download will start shortly");
    setLoading(false);
  }

  return (
    <div className="max-w-xl space-y-4">
      <PageHeader title="Generate Report" description="Configure and export a custom report" />

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Report Type</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          >
            <option value="prevalence">Prevalence Report</option>
            <option value="demographics">Demographic Analysis</option>
            <option value="risk_factors">Risk Factor Summary</option>
            <option value="hospital">Hospital Performance</option>
            <option value="drug_resistance">Drug Resistance Profile</option>
            <option value="trends">Trend Analysis</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600">From Year</Label>
            <Input type="number" min={2010} max={2026} value={form.from_year}
              onChange={e => setForm(f => ({ ...f, from_year: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600">To Year</Label>
            <Input type="number" min={2010} max={2026} value={form.to_year}
              onChange={e => setForm(f => ({ ...f, to_year: e.target.value }))} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Hospital</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={form.hospital}
            onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))}
          >
            <option value="all">All Hospitals</option>
            <option value="UNTH">University of Nigeria Teaching Hospital</option>
            <option value="ABUTH">Abia State University Teaching Hospital</option>
            <option value="EBSUTH">Ebonyi State University Teaching Hospital</option>
            <option value="FNSH">Federal Neuropsychiatric Hospital</option>
            <option value="IMSUTH">Imo State University Teaching Hospital</option>
            <option value="FMCO">Federal Medical Centre Owerri</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Output Format</Label>
          <div className="flex gap-3">
            {["pdf", "csv", "xlsx"].map(fmt => (
              <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value={fmt}
                  checked={form.format === fmt}
                  onChange={() => setForm(f => ({ ...f, format: fmt }))}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700 uppercase">{fmt}</span>
              </label>
            ))}
          </div>
        </div>

        <Button onClick={generate} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {loading ? "Generating..." : "Generate Report"}
        </Button>
      </div>
    </div>
  );
}
