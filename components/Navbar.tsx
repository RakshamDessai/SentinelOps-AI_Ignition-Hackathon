'use client';

import React from 'react';
import { Activity, ShieldAlert, Cpu, Database, GitBranch, Terminal, RefreshCw, UploadCloud, MessageSquareCode } from 'lucide-react';

interface NavbarProps {
  onOpenCustomAnalyzer: () => void;
  onOpenCopilot: () => void;
  isRemediated: boolean;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCustomAnalyzer,
  onOpenCopilot,
  isRemediated,
  onReset
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Product Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-950"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white font-mono">
                Sentinel<span className="text-sky-400">Ops</span>.ai
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-sky-500/10 text-sky-300 border border-sky-500/30">
                v2.6 Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Cross-Stack Software Failure Prediction & Root-Cause Intelligence
            </p>
          </div>
        </div>

        {/* Live System Observability Pills */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isRemediated ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
            <span className="font-mono text-slate-400">Cluster:</span>
            <span className="font-medium text-white">prod-useast-1</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-slate-400">OTel Spans:</span>
            <span className="font-medium text-white">14.8k/s</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-slate-400">Telemetry:</span>
            <span className="font-medium text-emerald-400">Healthy Ingestion</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isRemediated && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
              title="Reset to active anomaly"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Anomaly</span>
            </button>
          )}

          <button
            onClick={onOpenCustomAnalyzer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-sky-300 text-xs font-medium transition-all border border-sky-500/30 hover:border-sky-400 shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Ingest Custom Logs</span>
            <span className="sm:hidden">Ingest</span>
          </button>

          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-sky-500/20"
          >
            <MessageSquareCode className="w-4 h-4" />
            <span>SRE Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
