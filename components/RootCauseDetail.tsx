'use client';

import React, { useState } from 'react';
import { RootCauseAnalysis, DatabaseTelemetry } from '@/lib/types';
import { Bug, GitCommit, Database, AlertCircle, ChevronRight, FileCode, Search, HelpCircle } from 'lucide-react';

interface RootCauseProps {
  rootCause: RootCauseAnalysis;
  database: DatabaseTelemetry;
  isRemediated: boolean;
  onOpenRemediation: () => void;
}

export const RootCauseDetail: React.FC<RootCauseProps> = ({
  rootCause,
  database,
  isRemediated,
  onOpenRemediation
}) => {
  const [activeTab, setActiveTab] = useState<'causalChain' | 'culpritCode' | 'databaseTelemetry'>('causalChain');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      {/* Title & Badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Bug className="w-4 h-4 text-rose-500" />
              Root-Cause Intelligence & Causal Chain
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 font-mono">
              Confidence: {rootCause.confidence}%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pinpointed culprit layer across application code, infrastructure limits, and Git deployments.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('causalChain')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'causalChain'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Causal Chain ({rootCause.causalChain.length} Steps)
          </button>
          <button
            onClick={() => setActiveTab('culpritCode')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'culpritCode'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Culprit Code Diff
          </button>
          <button
            onClick={() => setActiveTab('databaseTelemetry')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'databaseTelemetry'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Database Activity
          </button>
        </div>
      </div>

      {/* Probable Cause Summary Banner */}
      <div className="bg-slate-50 dark:bg-slate-950/60 rounded-lg p-4 border border-slate-200 dark:border-slate-800 mb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            Probable Root Cause Hypothesis
          </span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {rootCause.probableRootCause}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Isolated in service: <span className="font-mono text-sky-600 dark:text-sky-400 font-semibold">{rootCause.culpritService}</span>
          </p>
        </div>

        <button
          onClick={onOpenRemediation}
          className="shrink-0 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <span>Remediate Root Cause</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* TAB 1: Causal Chain */}
      {activeTab === 'causalChain' && (
        <div className="space-y-3">
          <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {rootCause.causalChain.map((step) => {
              const layerBadges: Record<string, string> = {
                Deployment: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
                Application: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
                Database: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
                Infrastructure: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
                Client: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              };

              return (
                <div key={step.step} className="relative group">
                  <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-sky-500"></div>

                  <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                          Step {step.step}:
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {step.title}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-mono font-medium ${layerBadges[step.layer] || 'bg-slate-100 text-slate-700'}`}>
                        {step.layer}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3.5 rounded-lg bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <span className="font-semibold text-sky-800 dark:text-sky-300 flex items-center gap-1.5 font-mono text-[11px]">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Automated Diagnostic Rationale:
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {rootCause.explainableRationale}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Culprit Code Diff */}
      {activeTab === 'culpritCode' && rootCause.culpritCommit && (
        <div className="space-y-3">
          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <GitCommit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-sky-600 dark:text-sky-400">{rootCause.culpritCommit.hash}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-700 dark:text-slate-300">{rootCause.culpritCommit.author}</span>
                <span className="text-slate-400">({rootCause.culpritCommit.timestamp})</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold font-mono text-[10px]">
                Culprit Risk Score: {rootCause.culpritCommit.riskScore}/100
              </span>
            </div>

            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
              "{rootCause.culpritCommit.message}"
            </p>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 font-mono">
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Files Modified:</span>
              <div className="flex flex-wrap gap-1.5">
                {rootCause.culpritCommit.changedFiles.map((file, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300">
                    {file}
                  </span>
                ))}
              </div>
            </div>

            {/* Code Diff Display (GitHub Style) */}
            <div className="mt-2 rounded-lg bg-white dark:bg-black/80 p-3 font-mono text-xs overflow-x-auto border border-slate-200 dark:border-slate-800">
              <pre className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                {rootCause.culpritCommit.diffPreview.split('\n').map((line, idx) => {
                  let lineClass = 'text-slate-500 dark:text-slate-400';
                  if (line.startsWith('+')) lineClass = 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40 px-1 rounded block';
                  if (line.startsWith('-')) lineClass = 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40 px-1 rounded block';
                  if (line.startsWith('//')) lineClass = 'text-amber-700 dark:text-amber-400 font-bold block';
                  return (
                    <div key={idx} className={lineClass}>
                      {line}
                    </div>
                  );
                })}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Database Telemetry Activity */}
      {activeTab === 'databaseTelemetry' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Active Conns</span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                {database.activeConnections} / {database.maxConnections}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Waiting Threads</span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                {database.waitingThreads} blocked
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Slow Queries</span>
              <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                {database.slowQueryCount} (&gt;1s)
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Deadlocks</span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-500">
                {database.deadlocks}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-mono text-[11px]">
              <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Offending SQL Query Pattern (Holding Locks / Starving Pool):
            </span>
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-xs font-mono text-amber-800 dark:text-amber-300 overflow-x-auto">
              <code>{database.topOffenderQuery}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
