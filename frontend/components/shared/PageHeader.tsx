import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; href: string; icon?: LucideIcon };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>
      {action && (
        <Link href={action.href}>
          <Button size="sm" className="gap-1.5">
            {action.icon && <action.icon className="h-3.5 w-3.5" />}
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}
