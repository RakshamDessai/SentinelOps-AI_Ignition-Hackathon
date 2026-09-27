'use client';

import React, { useState } from 'react';
import { MetricPoint } from '@/lib/types';
import { TrendingUp, Clock, Filter } from 'lucide-react';

interface MetricsProps {
  metrics: MetricPoint[];
  isRemediated: boolean;
  deploymentTime?: string;
}

export const MetricsOverview: React.FC<MetricsProps> = ({
  metrics,
  isRemediated,
  deploymentTime = '12:15'
}) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'latency' | 'errors'>('resources');
  const [timeRange, setTimeRange] = useState<'15m' | '30m' | '1h' | 'Live'>('30m');

  const displayMetrics = isRemediated
    ? [
        ...metrics,
        { time: '12:35 (Recovered)', cpu: 28, memory: 44, dbPoolUtil: 32, p99Latency: 52, errorRate: 0.05, lockWaitMs: 3 }
      ]
    : metrics;

  const width = 600;
  const height = 180;
  const padding = 35;

  const pointsCount = displayMetrics.length;
  const getX = (idx: number) => padding + (idx / (pointsCount - 1)) * (width - 2 * padding);

  const maxResource = 100;
  const getYResource = (val: number) => height - padding - (val / maxResource) * (height - 2 * padding);

  const maxLatency = Math.max(...displayMetrics.map(m => m.p99Latency), 100);
  const getYLatency = (val: number) => height - padding - (val / maxLatency) * (height - 2 * padding);

  const generatePath = (getY: (val: number) => number, key: keyof MetricPoint) => {
    return displayMetrics.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m[key] as number)}`).join(' ');
  };

  const generateArea = (getY: (val: number) => number, key: keyof MetricPoint) => {
    const linePath = generatePath(getY, key);
    return `${linePath} L ${getX(pointsCount - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Synchronized Telemetry Time-Series
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Multi-variate telemetry streams correlating compute, threadpools, and database transaction latencies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Filter (Industry Standard Feature) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-mono">
            {(['15m', '30m', '1h', 'Live'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  timeRange === r
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Metric Category Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'resources'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveTab('latency')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'latency'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Latency & Locks
            </button>
            <button
              onClick={() => setActiveTab('errors')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'errors'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Errors
            </button>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full bg-slate-50/70 dark:bg-slate-950/70 rounded-lg p-3 border border-slate-200 dark:border-slate-800/80 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 select-none">
          <defs>
            <linearGradient id="gradient-db" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-mem" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-lat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = height - padding - (tick / 100) * (height - 2 * padding);
            return (
              <g key={tick}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
                <text x={padding - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8" className="font-mono">
                  {activeTab === 'latency' ? Math.round((tick / 100) * maxLatency) : `${tick}%`}
                </text>
              </g>
            );
          })}

          {/* Dotted deployment marker line */}
          <line
            x1={getX(3)}
            y1={padding}
            x2={getX(3)}
            y2={height - padding}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text x={getX(3) + 4} y={padding + 10} fontSize="8.5" fill="#ef4444" fontWeight="600" className="font-mono">
            DEPLOY {deploymentTime} (INFLECTION POINT)
          </text>

          {/* Render Active Tab Curves */}
          {activeTab === 'resources' && (
            <>
              <path d={generateArea(getYResource, 'memory')} fill="url(#gradient-mem)" />
              <path d={generatePath(getYResource, 'memory')} fill="none" stroke="#0284c7" strokeWidth="2" />
              
              <path d={generateArea(getYResource, 'dbPoolUtil')} fill="url(#gradient-db)" />
              <path d={generatePath(getYResource, 'dbPoolUtil')} fill="none" stroke="#e11d48" strokeWidth="2" />

              <path d={generatePath(getYResource, 'cpu')} fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 2" />
            </>
          )}

          {activeTab === 'latency' && (
            <>
              <path d={generateArea(getYLatency, 'p99Latency')} fill="url(#gradient-lat)" />
              <path d={generatePath(getYLatency, 'p99Latency')} fill="none" stroke="#d97706" strokeWidth="2" />
              <path d={generatePath(getYLatency, 'lockWaitMs')} fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="2 2" />
            </>
          )}

          {activeTab === 'errors' && (
            <>
              <path d={generateArea(getYResource, 'errorRate')} fill="url(#gradient-db)" />
              <path d={generatePath(getYResource, 'errorRate')} fill="none" stroke="#dc2626" strokeWidth="2" />
            </>
          )}

          {/* Points & X-Axis Labels */}
          {displayMetrics.map((m, i) => {
            const x = getX(i);
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={
                    activeTab === 'resources'
                      ? getYResource(m.dbPoolUtil)
                      : activeTab === 'latency'
                      ? getYLatency(m.p99Latency)
                      : getYResource(m.errorRate)
                  }
                  r="3"
                  className="fill-white stroke-rose-500"
                  strokeWidth="1.5"
                />
                <text x={x} y={height - padding + 14} textAnchor="middle" fontSize="9" fill="#94a3b8" className="font-mono">
                  {m.time}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          {activeTab === 'resources' && (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                DB Pool Utilization %
              </span>
              <span className="flex items-center gap-1.5 font-medium text-sky-600 dark:text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                System Memory %
              </span>
              <span className="flex items-center gap-1.5 font-medium text-purple-600 dark:text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                CPU Load %
              </span>
            </div>
          )}

          {activeTab === 'latency' && (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Ingress p99 Latency (ms)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Database Lock Wait (ms)
              </span>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                HTTP 5xx Error Rate (%)
              </span>
            </div>
          )}

          <div className="text-[11px] text-slate-400 font-mono">
            Granularity: 30s • Telemetry Window: {timeRange}
          </div>
        </div>
      </div>
    </div>
  );
};
