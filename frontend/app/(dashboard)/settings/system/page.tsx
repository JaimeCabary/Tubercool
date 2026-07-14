"use client";

import { useAuthStore } from "@/lib/store/auth";

export default function SystemSettingsPage() {
  const { user } = useAuthStore();
  
  if (user?.role !== "super_admin") {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-gray-500">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">System Information</h3>
        <p className="text-xs text-gray-500">
          This system is currently managed by environment variables. 
          API configuration cannot be modified via the client interface for security reasons.
        </p>

        <div className="rounded-lg bg-gray-50 p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-700">Platform Specs</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <span>Frontend</span><span className="font-mono text-gray-700">Next.js 14</span>
            <span>Backend</span><span className="font-mono text-gray-700">FastAPI</span>
            <span>Database</span><span className="font-mono text-gray-700">PostgreSQL</span>
            <span>ML Model</span><span className="font-mono text-gray-700">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
