
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
  title: "TuberCool | AI-Assisted TB Diagnosis",
  description: "Advanced AI-powered Tuberculosis diagnosis, prediction, and epidemiological surveillance platform for Southeastern Nigeria teaching hospitals.",
  keywords: ["Tuberculosis", "TB Diagnosis", "AI Healthcare", "Nigeria", "Epidemiology", "Surveillance", "Medical AI", "TuberCool", "Health Tech"],
  authors: [{ name: "Jaime Cabary" }, { name: "TuberCool Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TuberCool",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "TuberCool | AI-Assisted TB Diagnosis",
    description: "Advanced AI-powered Tuberculosis diagnosis and epidemiological surveillance platform.",
    url: "https://tubercool.vercel.app",
    siteName: "TuberCool",
    images: [{ url: "/icon.png", width: 512, height: 512 }],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TuberCool | AI-Assisted TB Diagnosis",
    description: "Advanced AI-powered Tuberculosis diagnosis and epidemiological surveillance platform.",
    images: ["/icon.png"],
  },
  metadataBase: new URL("https://tubercool.vercel.app"),
};

export const viewport: Viewport = {
  themeColor: "#172554",
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
