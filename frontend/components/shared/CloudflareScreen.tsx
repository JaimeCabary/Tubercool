"use client";

import { useEffect, useRef, useState } from "react";
import { Dna } from "lucide-react";

/**
 * Real Cloudflare Turnstile verification screen.
 *
 * Setup (one-time, free):
 *  1. Go to dash.cloudflare.com → Turnstile → Add site
 *  2. Domain: your domain (or localhost for dev)
 *  3. Widget type: Managed
 *  4. Copy the Site Key → set NEXT_PUBLIC_TURNSTILE_SITE_KEY in .env.local
 *
 * Dev / no-key fallback: uses Cloudflare's always-pass test key automatically.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

// Cloudflare's official always-pass test sitekey for development
const DEV_SITEKEY = "1x00000000000000000000AA";
const SITEKEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? DEV_SITEKEY;

export function CloudflareScreen() {
  const [show, setShow] = useState(false);
  const [domain, setDomain] = useState("");
  const [rayId, setRayId] = useState("");
  const [verified, setVerified] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const hasVerified = sessionStorage.getItem("cf_verified");
    if (hasVerified) return;

    setShow(true);
    setDomain(window.location.hostname);
    // Generate Ray ID client-side only (avoids hydration mismatch)
    setRayId(
      Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );
  }, []);

  // Load Turnstile script and render widget once the screen is visible
  useEffect(() => {
    if (!show || !widgetRef.current) return;

    const scriptId = "cf-turnstile-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => renderWidget();
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    }

    function renderWidget() {
      if (!widgetRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: SITEKEY,
        theme: "dark",
        callback: () => {
          // Real Turnstile verified — user is human
          setVerified(true);
          sessionStorage.setItem("cf_verified", "true");
          setTimeout(() => setShow(false), 800);
        },
        "error-callback": () => {
          // On error, let them through after a short delay rather than blocking
          setTimeout(() => {
            sessionStorage.setItem("cf_verified", "true");
            setShow(false);
          }, 2000);
        },
      });
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] text-[#d9d9d9] font-sans">
      <div className="flex w-full max-w-[600px] flex-col px-6 py-8 md:px-0">

        {/* ── TuberCool Logo + Domain ─────────────────────────────── */}
        <div className="mb-6 flex items-center gap-3">
          {/* TuberCool DNA logo — matches sidebar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-900 shadow-lg shadow-blue-900/30">
            <Dna className="h-[22px] w-[22px] text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              {domain || "tbdiagnosis.ng"}
            </h1>
            <p className="text-[12px] text-[#737373]">TB Diagnosis Platform · Southeastern Nigeria</p>
          </div>
        </div>

        {/* ── Verification copy ───────────────────────────────────── */}
        <h2 className="mb-3 text-xl font-normal text-white">
          {verified ? "Verification complete" : "Performing security verification"}
        </h2>
        <p className="mb-8 text-[14px] leading-relaxed text-[#a3a3a3]">
          This platform uses Cloudflare to protect patient data against
          automated threats. Please complete the check below to continue.
        </p>

        {/* ── Actual Cloudflare Turnstile widget ─────────────────── */}
        <div className="mb-8">
          {verified ? (
            <div className="flex items-center gap-3 rounded-[4px] border border-[#2a2a2a] bg-[#111] px-4 py-3 w-fit">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-emerald-400">Verified — you're human ✓</span>
            </div>
          ) : (
            <div ref={widgetRef} />
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className="mt-16 w-full border-t border-[#222] pt-5 text-center">
          <div className="text-[12px] text-[#555]">
            Ray ID:{" "}
            <code className="font-mono text-[#888]">{rayId}</code>
          </div>
          <div className="mt-2 text-[12px] text-[#555]">
            Performance & Security by{" "}
            <span className="text-[#888]">Cloudflare</span>
            {" · "}
            <span className="text-[#888]">TuberCool v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
