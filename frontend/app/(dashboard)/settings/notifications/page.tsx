"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const NOTIFICATIONS = [
  { id: "new_patient", label: "New Patient Registered", description: "Alert when a new patient is added to your hospital" },
  { id: "test_complete", label: "Test Result Completed", description: "When a pending test result is finalised" },
  { id: "positive_result", label: "TB Positive Result", description: "Immediate alert on positive TB diagnosis" },
  { id: "prediction_done", label: "AI Prediction Ready", description: "When a prediction model run completes" },
  { id: "weekly_summary", label: "Weekly Summary", description: "Weekly digest of cases and statistics" },
  { id: "system_alerts", label: "System Alerts", description: "Infrastructure and maintenance notifications" },
];

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATIONS.map(n => [n.id, n.id === "positive_result" || n.id === "test_complete"]))
  );

  function save() {
    toast.success("Notification preferences saved");
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Notification Preferences</h3>
        <div className="space-y-4">
          {NOTIFICATIONS.map(n => (
            <div key={n.id} className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{n.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.description}</p>
              </div>
              <button
                onClick={() => setPrefs(p => ({ ...p, [n.id]: !p[n.id] }))}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                  prefs[n.id] ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  prefs[n.id] ? "translate-x-4" : "translate-x-0"
                }`} />
              </button>
            </div>
          ))}
        </div>
        <Button size="sm" className="mt-4" onClick={save}>Save Preferences</Button>
      </div>
    </div>
  );
}
