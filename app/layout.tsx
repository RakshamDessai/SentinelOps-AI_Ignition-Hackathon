import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "SentinelOps AI — Continuous Software Failure Prediction & Root-Cause Intelligence",
  description: "Cross-stack continuous telemetry intelligence platform. Detects abnormal behavior, predicts failures before occurrence, pinpoints root causes across code and infrastructure, and autonomously generates explainable remediation plans.",
  keywords: ["AI failure prediction", "root cause analysis", "SRE", "DevOps", "observability", "distributed systems"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-sky-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
