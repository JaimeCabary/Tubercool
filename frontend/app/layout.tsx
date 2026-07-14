import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const sans = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "TuberCool",
  description: "TB Diagnosis Prediction & Surveillance Platform — Southeastern Nigeria",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-gray-50 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
