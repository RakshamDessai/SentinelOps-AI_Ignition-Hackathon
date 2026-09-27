'use client';

import React, { useState } from 'react';
import { LogEntry } from '@/lib/types';
import { Terminal, Search, Filter, AlertCircle, Play, Pause } from 'lucide-react';

interface LogProps {
  logs: LogEntry[];
  isRemediated: boolean;
}

export const LiveLogStream: React.FC<LogProps> = ({ logs, isRemediated }) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
    if (
      searchQuery &&
      !log.message.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.service.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'FATAL':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800 font-bold';
      case 'ERROR':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 font-semibold';
      case 'WARN':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 font-medium';
      case 'INFO':
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Distributed Telemetry Logs & Culprit Spans
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time stdout, stderr, and OpenTelemetry trace logs ingested from active cluster services.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <Filter className="w-3 h-3 text-slate-500" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none text-xs cursor-pointer font-medium"
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="FATAL">FATAL</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter logs by message or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-8 pr-3 py-1 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 text-xs w-44 sm:w-56"
            />
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title={isPaused ? 'Resume Stream' : 'Pause Stream'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-500" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Telemetry Log Stream Container (Adaptive Light/Dark Mode) */}
      <div className="bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-3 font-mono text-xs max-h-72 overflow-y-auto space-y-1.5 transition-colors duration-200">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className={`p-2.5 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 border transition-all ${
              log.isCulprit
                ? 'bg-rose-50/90 dark:bg-rose-950/40 border-l-4 border-l-rose-500 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-100 shadow-xs'
                : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
              <span className="text-slate-400 dark:text-slate-500 text-[11px] shrink-0 font-mono">
                {log.timestamp}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-mono tracking-wider shrink-0 ${getLevelBadge(log.level)}`}>
                {log.level}
              </span>
              <span className="text-sky-700 dark:text-sky-400 font-semibold shrink-0 text-[11px] font-mono bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-200/80 dark:border-sky-800/60">
                [{log.service}]
              </span>
              <span className="leading-snug break-all font-mono text-[11px] select-text">
                {log.message}
              </span>
            </div>

            {log.isCulprit && (
              <span className="shrink-0 px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-medium text-[10px] uppercase tracking-wider self-start sm:self-auto flex items-center gap-1 font-mono">
                <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                Culprit Anomaly
              </span>
            )}
          </div>
        ))}

        {isRemediated && (
          <div className="p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">{new Date().toTimeString().split(' ')[0]}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 font-semibold uppercase text-[10px] font-mono">
              RECOVERY
            </span>
            <span className="text-[11px] font-mono">Autonomous mitigation verified. Cluster health check status: 200 OK.</span>
          </div>
        )}
      </div>
    </div>
  );
};
