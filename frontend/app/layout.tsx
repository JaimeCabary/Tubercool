
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const sans = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"]
});

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "TuberCool",
  description: "TB Diagnosis Prediction & Surveillance Platform — Southeastern Nigeria",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TuberCool",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { CloudflareScreen } from "@/components/shared/CloudflareScreen";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-gray-50 font-sans">
        <CloudflareScreen />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
