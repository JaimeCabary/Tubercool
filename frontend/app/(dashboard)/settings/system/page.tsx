"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SystemSettingsPage() {
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1");

  return (
    <div className="max-w-lg space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">System Configuration</h3>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Backend API URL</Label>
          <Input value={apiUrl} onChange={e => setApiUrl(e.target.value)} className="font-mono text-xs" />
          <p className="text-xs text-gray-400">Change this to point to your deployed backend</p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-700">System Information</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <span>Frontend</span><span className="font-mono text-gray-700">Next.js 14</span>
            <span>Backend</span><span className="font-mono text-gray-700">FastAPI + uv</span>
            <span>Database</span><span className="font-mono text-gray-700">PostgreSQL</span>
            <span>ML Model</span><span className="font-mono text-gray-700">rule-based-v1.0</span>
          </div>
        </div>

        <Button size="sm" onClick={() => toast.success("Settings saved")}>Save</Button>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="mb-1 text-sm font-semibold text-amber-800">Data Management</h3>
        <p className="text-xs text-amber-700 mb-3">These actions affect all hospitals and are irreversible. Super Admin only.</p>
        <div className="flex gap-3">
          <Button size="sm" variant="outline" className="text-xs border-amber-300 text-amber-700 hover:bg-amber-100">
            Export All Data
          </Button>
          <Button size="sm" variant="outline" className="text-xs border-red-300 text-red-600 hover:bg-red-50">
            Clear Test Data
          </Button>
        </div>
      </div>
    </div>
  );
}
