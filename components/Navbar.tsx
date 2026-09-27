'use client';

import React from 'react';
import { Activity, Cpu, Database, RefreshCw, UploadCloud, MessageSquareCode, Sun, Moon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTheme } from './ThemeProvider';

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
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sky-600 dark:bg-sky-500 text-white shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white font-mono">
                Sentinel<span className="text-sky-600 dark:text-sky-400">Ops</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-mono">
                Enterprise v2.6
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Continuous Cross-Stack Failure Prediction & Root-Cause Intelligence
            </p>
          </div>
        </div>

        {/* Observability Telemetry Status Pills */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isRemediated ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="text-slate-400">Cluster:</span>
            <span className="font-mono font-medium text-slate-900 dark:text-white">prod-us-east-1</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-slate-400">OTel Spans:</span>
            <span className="font-mono font-medium text-slate-900 dark:text-white">14.8k/s</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <Database className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-slate-400">Database:</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">Synchronized</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {isRemediated && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-medium transition-colors border border-slate-300 dark:border-slate-700"
              title="Reset anomaly state for testing"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Anomaly</span>
            </button>
          )}

          <button
            onClick={onOpenCustomAnalyzer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-medium transition-colors border border-slate-300 dark:border-slate-700"
          >
            <UploadCloud className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="hidden sm:inline">Ingest Custom Logs</span>
            <span className="sm:hidden">Ingest</span>
          </button>

          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-sky-600 dark:hover:bg-sky-500 text-xs font-medium transition-colors shadow-sm"
          >
            <MessageSquareCode className="w-4 h-4" />
            <span>SRE Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
