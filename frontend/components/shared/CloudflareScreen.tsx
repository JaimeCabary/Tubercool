"use client";

import { useEffect, useState } from "react";

export function CloudflareScreen() {
  const [show, setShow] = useState(false);
  const [domain, setDomain] = useState("tubercool.vercel.app");

  useEffect(() => {
    // Only show once per session
    const hasShown = sessionStorage.getItem("cf_verified");
    if (!hasShown) {
      setShow(true);
      setDomain(window.location.hostname);
      
      // Hide after 3.5 seconds
      const timer = setTimeout(() => {
        sessionStorage.setItem("cf_verified", "true");
        setShow(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-[#d9d9d9] font-sans">
      <div className="w-full max-w-[600px] px-6 py-8 md:px-0 flex flex-col h-full md:h-auto md:justify-center">
        
        {/* Logo and Domain */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center">
            {/* Simple purple polygon mimicking Cloudflare's generic icon or custom logo */}
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-[#8833ff]">
              <path d="M12 2L22 7.5V16.5L12 22L2 16.5V7.5L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-3xl font-medium text-white tracking-tight">{domain}</h1>
        </div>

        {/* Verification Text */}
        <h2 className="mb-4 text-2xl font-normal text-white">Performing security verification</h2>
        <p className="mb-8 text-[15px] leading-relaxed text-[#a3a3a3]">
          This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
        </p>

        {/* Widget Box */}
        <div className="mb-8 flex items-center justify-between border border-[#333] bg-[#1a1a1a] p-4 rounded-[4px] w-full max-w-[340px] shadow-[0_0_8px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3">
            <div className="relative h-6 w-6">
              {/* Spinning dots */}
              <div className="absolute inset-0 animate-spin rounded-full border-[2.5px] border-[#333] border-t-[#22c55e]"></div>
            </div>
            <span className="text-sm font-medium text-[#e0e0e0]">Verifying...</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 64 64" className="h-5 w-auto text-[#f6821f]">
                <path fill="currentColor" d="M60.8 39.2c-1.4-6-6.4-10.7-12.6-11.7-1.7-7-8-12.1-15.6-12.1-7.2 0-13.4 4.5-15.4 10.9-1.3-.8-2.8-1.2-4.4-1.2-4.7 0-8.6 3.8-8.6 8.6 0 1.2.3 2.4.7 3.4C2 38.6.1 41.6.1 45.1c0 4.8 3.9 8.6 8.6 8.6h46c4.6 0 8.3-3.7 8.3-8.3 0-4.1-3-7.5-6.9-8.1z"/>
              </svg>
              <span className="text-[10px] font-bold text-[#e0e0e0] tracking-wide">CLOUDFLARE</span>
            </div>
            <div className="mt-1 flex gap-2 text-[10px] text-[#737373]">
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Help</a>
            </div>
          </div>
        </div>

        {/* Footer info (Ray ID) */}
        <div className="mt-auto md:mt-24 w-full border-t border-[#333] pt-6 text-center">
          <div className="text-[13px] text-[#a3a3a3]">
            Ray ID: <code className="font-mono text-white">{(Math.random() * 1e16).toString(16).substring(0,16)}</code>
          </div>
          <div className="mt-2 text-[13px] text-[#a3a3a3]">
            Performance and Security by <a href="#" className="text-white hover:underline">Cloudflare</a> | <a href="#" className="hover:underline">Privacy</a>
          </div>
        </div>
      </div>
    </div>
  );
}
