import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SentinelOps AI — Continuous Software Failure Prediction & Root-Cause Intelligence",
  description: "Cross-stack continuous telemetry intelligence platform. Detects abnormal behavior, predicts failures before occurrence, pinpoints root causes across code and infrastructure, and autonomously generates explainable remediation plans.",
  keywords: ["AI failure prediction", "root cause analysis", "SRE", "DevOps", "observability", "Ignite 1% Hackathon", "Ignition in AI Era"],
  authors: [{ name: "Kaartikeya, Sneha, Krushna, Raksh" }]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
