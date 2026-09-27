'use client';

import React, { useState } from 'react';
import { RootCauseAnalysis, DatabaseTelemetry } from '@/lib/types';
import { Bug, GitCommit, Database, AlertCircle, CheckCircle, ChevronRight, FileCode, Search, HelpCircle, ShieldCheck } from 'lucide-react';

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
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      {/* Title & Badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Bug className="w-4 h-4 text-rose-400" />
              Automated Root-Cause Intelligence & Causal Chain
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
              Confidence: {rootCause.confidence}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pinpointed root culprit across application logic, infrastructure saturation, and Git deployments.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('causalChain')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'causalChain' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Causal Chain ({rootCause.causalChain.length} Steps)
          </button>
          <button
            onClick={() => setActiveTab('culpritCode')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'culpritCode' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Culprit Code Diff
          </button>
          <button
            onClick={() => setActiveTab('databaseTelemetry')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'databaseTelemetry' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Database Activity
          </button>
        </div>
      </div>

      {/* Probable Cause Summary Card */}
      <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800 mb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Probable Root Cause Hypothesis
          </span>
          <h3 className="text-sm font-semibold text-white">
            {rootCause.probableRootCause}
          </h3>
          <p className="text-xs text-slate-400">
            Isolated in service: <span className="font-mono text-sky-400 font-semibold">{rootCause.culpritService}</span>
          </p>
        </div>

        <button
          onClick={onOpenRemediation}
          className="shrink-0 px-4 py-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <span>Remediate Root Cause</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* TAB 1: Causal Chain */}
      {activeTab === 'causalChain' && (
        <div className="space-y-3">
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {rootCause.causalChain.map((step) => {
              const layerColors: Record<string, string> = {
                Deployment: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                Application: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                Database: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                Infrastructure: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
                Client: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              };

              return (
                <div key={step.step} className="relative group">
                  {/* Step Node Dot */}
                  <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-sky-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 group-hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-300">
                          Step {step.step}:
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {step.title}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-mono font-medium ${layerColors[step.layer] || 'bg-slate-800 text-slate-300'}`}>
                        {step.layer}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explainable Rationale */}
          <div className="mt-4 p-4 rounded-xl bg-sky-950/20 border border-sky-900/40 text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-sky-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Explainable AI Diagnostic Rationale:
            </span>
            <p className="text-slate-400 leading-relaxed">
              {rootCause.explainableRationale}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Culprit Code Diff */}
      {activeTab === 'culpritCode' && rootCause.culpritCommit && (
        <div className="space-y-4">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <GitCommit className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-sky-400">{rootCause.culpritCommit.hash}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">{rootCause.culpritCommit.author}</span>
                <span className="text-slate-500">({rootCause.culpritCommit.timestamp})</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold font-mono text-[11px]">
                Culprit Risk Score: {rootCause.culpritCommit.riskScore}/100
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium">
              "{rootCause.culpritCommit.message}"
            </p>

            <div className="text-[11px] text-slate-400 space-y-1 font-mono">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Files Modified:</span>
              <div className="flex flex-wrap gap-1.5">
                {rootCause.culpritCommit.changedFiles.map((file, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-300">
                    {file}
                  </span>
                ))}
              </div>
            </div>

            {/* Code Diff Display */}
            <div className="mt-2 rounded-lg bg-slate-900/90 p-3 font-mono text-xs overflow-x-auto border border-slate-800">
              <pre className="text-slate-300 leading-relaxed">
                {rootCause.culpritCommit.diffPreview.split('\n').map((line, idx) => {
                  let lineClass = 'text-slate-400';
                  if (line.startsWith('+')) lineClass = 'text-emerald-400 bg-emerald-950/30 px-1 rounded block';
                  if (line.startsWith('-')) lineClass = 'text-rose-400 bg-rose-950/30 px-1 rounded block';
                  if (line.startsWith('//')) lineClass = 'text-amber-400 font-bold block';
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Active Conns</span>
              <span className="text-lg font-bold text-rose-400">
                {database.activeConnections} / {database.maxConnections}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Waiting Threads</span>
              <span className="text-lg font-bold text-amber-400">
                {database.waitingThreads} blocked
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Slow Queries</span>
              <span className="text-lg font-bold text-sky-400">
                {database.slowQueryCount} (&gt;1s)
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Deadlocks</span>
              <span className="text-lg font-bold text-rose-500">
                {database.deadlocks}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Offending SQL Query Pattern (Holding Locks / Starving Pool):
            </span>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto">
              <code>{database.topOffenderQuery}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
