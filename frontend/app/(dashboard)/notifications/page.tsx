"use client";

import { Bell, CheckCircle2, AlertCircle, Info, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "New AI Prediction Ready",
    description: "The chest X-ray analysis for Patient TBP-2024-001 has finished processing. Probability of TB is high.",
    time: "10 mins ago",
    type: "alert",
    read: false,
  },
  {
    id: 2,
    title: "Lab Result Uploaded",
    description: "GeneXpert results for Chidi Okafor have been uploaded to the system.",
    time: "1 hour ago",
    type: "success",
    read: false,
  },
  {
    id: 3,
    title: "System Maintenance",
    description: "Scheduled maintenance will occur tonight at 2:00 AM UTC.",
    time: "5 hours ago",
    type: "info",
    read: true,
  },
  {
    id: 4,
    title: "Weekly Summary",
    description: "Your facility recorded 12 new positive cases this week. Tap to view the full prevalence report.",
    time: "2 days ago",
    type: "info",
    read: true,
  },
];

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500">Stay updated on patient results and system alerts.</p>
        </div>
        <Button variant="outline" size="sm">Mark all as read</Button>
      </div>

      <div className="space-y-4">
        {NOTIFICATIONS.map((n) => (
          <div 
            key={n.id} 
            className={`flex gap-4 rounded-xl border p-4 transition-colors ${
              n.read ? "bg-white border-gray-100" : "bg-blue-50/50 border-blue-100"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {n.type === "alert" && <AlertCircle className="h-5 w-5 text-red-500" />}
              {n.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {n.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-medium ${n.read ? "text-gray-900" : "text-gray-900"}`}>
                  {n.title}
                </p>
                <span className="flex shrink-0 items-center gap-1 text-[11px] text-gray-500">
                  <Clock className="h-3 w-3" />
                  {n.time}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{n.description}</p>
            </div>
            
            {!n.read && (
              <div className="shrink-0 flex items-center">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
