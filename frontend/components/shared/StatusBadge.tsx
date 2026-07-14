import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  positive:      { label: "Positive",      className: "bg-red-100 text-red-700 border-red-200" },
  negative:      { label: "Negative",      className: "bg-green-100 text-green-700 border-green-200" },
  indeterminate: { label: "Indeterminate", className: "bg-amber-100 text-amber-700 border-amber-200" },
  pending:       { label: "Pending",       className: "bg-gray-100 text-gray-600 border-gray-200" },
  completed:     { label: "Completed",     className: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress:   { label: "In Progress",   className: "bg-purple-100 text-purple-700 border-purple-200" },
  cancelled:     { label: "Cancelled",     className: "bg-gray-100 text-gray-500 border-gray-200" },
  high:          { label: "High",          className: "bg-red-100 text-red-700 border-red-200" },
  medium:        { label: "Medium",        className: "bg-amber-100 text-amber-700 border-amber-200" },
  low:           { label: "Low",           className: "bg-green-100 text-green-700 border-green-200" },
  active:        { label: "Active",        className: "bg-green-100 text-green-700 border-green-200" },
  inactive:      { label: "Inactive",      className: "bg-gray-100 text-gray-500 border-gray-200" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status?.toLowerCase()] ?? { label: status, className: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
