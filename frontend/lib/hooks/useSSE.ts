"use client";

import { useEffect, useRef, useCallback, useState } from "react";

type SSEEvent = {
  type: string;
  payload: Record<string, unknown>;
  ts: string;
};

type SSEStatus = "connecting" | "connected" | "disconnected" | "error";

/**
 * Persistent SSE connection with exponential back-off reconnect.
 * Returns the last received event and connection status.
 */
export function useSSE(url: string, enabled = true) {
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const [status, setStatus] = useState<SSEStatus>("disconnected");
  const esRef = useRef<EventSource | null>(null);
  const retryMs = useRef(1000);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    setStatus("connecting");

    const token = localStorage.getItem("access_token");
    const fullUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;

    const es = new EventSource(fullUrl);
    esRef.current = es;

    es.onopen = () => {
      setStatus("connected");
      retryMs.current = 1000; // reset back-off on success
    };

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as SSEEvent;
        setLastEvent(data);
      } catch {
        // ignore malformed frames
      }
    };

    es.onerror = () => {
      es.close();
      setStatus("error");
      // exponential back-off, cap at 30s
      timer.current = setTimeout(() => {
        retryMs.current = Math.min(retryMs.current * 2, 30_000);
        connect();
      }, retryMs.current);
    };
  }, [url, enabled]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [connect]);

  return { lastEvent, status };
}
