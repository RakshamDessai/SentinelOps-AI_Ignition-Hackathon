'use client';

import React, { useState } from 'react';
import { LogEntry } from '@/lib/types';
import { Terminal, Search, Filter, AlertCircle, Play, Pause, ChevronDown } from 'lucide-react';

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
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase()) && !log.service.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'FATAL':
        return 'bg-purple-900/60 text-purple-300 border-purple-700/60 font-bold';
      case 'ERROR':
        return 'bg-rose-900/60 text-rose-300 border-rose-700/60 font-semibold';
      case 'WARN':
        return 'bg-amber-900/60 text-amber-300 border-amber-700/60 font-medium';
      case 'INFO':
      default:
        return 'bg-sky-900/40 text-sky-300 border-sky-700/40';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            Distributed Telemetry Logs & Culprit Trace Stream
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingesting structured application logs, container output, and OpenTelemetry trace spans.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none text-xs cursor-pointer"
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="FATAL">FATAL</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs & services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs w-44 sm:w-56"
            />
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title={isPaused ? 'Resume Stream' : 'Pause Stream'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Console View */}
      <div className="bg-black/85 rounded-xl border border-slate-800/90 p-3 font-mono text-xs max-h-72 overflow-y-auto space-y-1.5">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className={`p-2 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 border transition-all ${
              log.isCulprit
                ? 'bg-rose-950/40 border-rose-600/70 text-rose-200 shadow-sm shadow-rose-900/30'
                : 'bg-slate-950/40 border-transparent hover:border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-start sm:items-center gap-2">
              <span className="text-slate-500 text-[11px] shrink-0">{log.timestamp}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border uppercase font-mono ${getLevelBadge(log.level)}`}>
                {log.level}
              </span>
              <span className="text-sky-400 font-semibold shrink-0 text-[11px]">
                [{log.service}]
              </span>
              <span className="leading-snug break-all">{log.message}</span>
            </div>

            {log.isCulprit && (
              <span className="shrink-0 px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] uppercase tracking-wider self-start sm:self-auto flex items-center gap-1 shadow-sm">
                <AlertCircle className="w-3 h-3" />
                Root Culprit Anomaly
              </span>
            )}
          </div>
        ))}

        {isRemediated && (
          <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-600/40 text-emerald-300 text-xs flex items-center gap-2">
            <span className="text-slate-400">{new Date().toTimeString().split(' ')[0]}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-bold uppercase text-[10px]">
              RECOVERY
            </span>
            <span>All upstream and downstream connection health checks returned 200 OK. Error rate normalized.</span>
          </div>
        )}
      </div>
    </div>
  );
};
