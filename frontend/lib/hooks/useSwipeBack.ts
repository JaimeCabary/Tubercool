"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SwipeBackOptions {
  /** Minimum horizontal distance to trigger. Default: 60px */
  threshold?: number;
  /** Maximum vertical drift allowed. Default: 80px */
  maxVertical?: number;
  /** Only trigger when swipe starts within this many px from left edge. Default: 30px */
  edgeZone?: number;
}

/**
 * Attaches a swipe-from-left-edge gesture to trigger router.back().
 * Works on touch devices. No-op on desktop.
 */
export function useSwipeBack(options: SwipeBackOptions = {}) {
  const { threshold = 60, maxVertical = 80, edgeZone = 30 } = options;
  const router = useRouter();
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    const x = e.touches[0].clientX;
    if (x <= edgeZone) {
      startX.current = x;
      startY.current = e.touches[0].clientY;
    }
  }, [edgeZone]);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (startX.current === null || startY.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - startY.current);
    if (dx >= threshold && dy <= maxVertical) {
      router.back();
    }
    startX.current = null;
    startY.current = null;
  }, [threshold, maxVertical, router]);

  useEffect(() => {
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend",   onTouchEnd);
    };
  }, [onTouchStart, onTouchEnd]);
}
