"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { cn } from "@/lib/utils";

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Width class on desktop right panel. Default: "max-w-md" */
  width?: string;
}

export function SlidePanel({
  open,
  onClose,
  title,
  description,
  children,
  width = "max-w-md",
}: SlidePanelProps) {
  const isMobile = useIsMobile();
  const side = isMobile ? "bottom" : "right";

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side={side}
        showCloseButton
        className={cn(
          "flex flex-col gap-0 p-0 overflow-hidden",
          isMobile
            ? "h-[62vh] rounded-t-2xl"
            : cn("h-full w-full border-l border-gray-200 shadow-xl", width)
        )}
      >
        {/* Drag handle — mobile only */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="h-1 w-10 rounded-full bg-gray-300" />
          </div>
        )}

        <SheetHeader className="border-b border-gray-100 px-5 py-4 shrink-0">
          <SheetTitle className="text-base font-semibold text-gray-900">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-xs text-gray-500">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
