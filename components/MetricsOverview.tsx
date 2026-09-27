'use client';

import React, { useState } from 'react';
import { MetricPoint } from '@/lib/types';
import { TrendingUp, Cpu, Database, Gauge, AlertCircle, Clock } from 'lucide-react';

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

  // If remediated, append stabilized tail
  const displayMetrics = isRemediated
    ? [
        ...metrics,
        { time: '12:35 (Auto-Healed)', cpu: 28, memory: 44, dbPoolUtil: 32, p99Latency: 52, errorRate: 0.05, lockWaitMs: 3 }
      ]
    : metrics;

  // Chart dimension helpers
  const width = 600;
  const height = 180;
  const padding = 35;

  const pointsCount = displayMetrics.length;
  const getX = (idx: number) => padding + (idx / (pointsCount - 1)) * (width - 2 * padding);

  // Normalization helpers
  const maxResource = 100;
  const getYResource = (val: number) => height - padding - (val / maxResource) * (height - 2 * padding);

  const maxLatency = Math.max(...displayMetrics.map(m => m.p99Latency), 100);
  const getYLatency = (val: number) => height - padding - (val / maxLatency) * (height - 2 * padding);

  // SVG path generators
  const generatePath = (getY: (val: number) => number, key: keyof MetricPoint) => {
    return displayMetrics.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m[key] as number)}`).join(' ');
  };

  const generateArea = (getY: (val: number) => number, key: keyof MetricPoint) => {
    const linePath = generatePath(getY, key);
    return `${linePath} L ${getX(pointsCount - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            Continuous Multi-Stack Telemetry Stream
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized timeseries correlation across infrastructure, microservices, and database query buffers.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'resources' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Resource Saturation
          </button>
          <button
            onClick={() => setActiveTab('latency')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'latency' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            p99 Latency & Locks
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'errors' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Error Escalation
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 select-none">
          <defs>
            <linearGradient id="gradient-db" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-mem" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-lat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = height - padding - (tick / 100) * (height - 2 * padding);
            return (
              <g key={tick}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                <text x={padding - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#64748b" className="font-mono">
                  {activeTab === 'latency' ? Math.round((tick / 100) * maxLatency) : `${tick}%`}
                </text>
              </g>
            );
          })}

          {/* Dotted deployment inflection line */}
          <line
            x1={getX(3)}
            y1={padding}
            x2={getX(3)}
            y2={height - padding}
            stroke="#e11d48"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text x={getX(3) + 4} y={padding + 12} fontSize="9" fill="#f43f5e" fontWeight="600" className="font-mono">
            DEPLOY {deploymentTime} (ANOMALY START)
          </text>

          {/* Render Active Tab Curves */}
          {activeTab === 'resources' && (
            <>
              {/* Memory Area & Line */}
              <path d={generateArea(getYResource, 'memory')} fill="url(#gradient-mem)" />
              <path d={generatePath(getYResource, 'memory')} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              
              {/* DB Pool Area & Line */}
              <path d={generateArea(getYResource, 'dbPoolUtil')} fill="url(#gradient-db)" />
              <path d={generatePath(getYResource, 'dbPoolUtil')} fill="none" stroke="#f43f5e" strokeWidth="2.5" />

              {/* CPU Line */}
              <path d={generatePath(getYResource, 'cpu')} fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 2" />
            </>
          )}

          {activeTab === 'latency' && (
            <>
              <path d={generateArea(getYLatency, 'p99Latency')} fill="url(#gradient-lat)" />
              <path d={generatePath(getYLatency, 'p99Latency')} fill="none" stroke="#fbbf24" strokeWidth="2.5" />
              <path d={generatePath(getYLatency, 'lockWaitMs')} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="2 2" />
            </>
          )}

          {activeTab === 'errors' && (
            <>
              <path d={generateArea(getYResource, 'errorRate')} fill="url(#gradient-db)" />
              <path d={generatePath(getYResource, 'errorRate')} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
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
                  r="3.5"
                  fill="#ffffff"
                  stroke="#f43f5e"
                  strokeWidth="2"
                />
                <text x={x} y={height - padding + 15} textAnchor="middle" fontSize="9" fill="#94a3b8" className="font-mono">
                  {m.time}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-800 text-xs">
          {activeTab === 'resources' && (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                DB Pool Utilization % (Saturation Culprit)
              </span>
              <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                System Memory %
              </span>
              <span className="flex items-center gap-1.5 text-purple-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                CPU Load %
              </span>
            </div>
          )}

          {activeTab === 'latency' && (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                Ingress p99 Latency (ms)
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Database Lock Wait (ms)
              </span>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                HTTP 5xx Error Rate (%)
              </span>
            </div>
          )}

          <div className="text-[11px] text-slate-400 font-mono">
            Sample Frequency: 30s • Telemetry Window: 35m
          </div>
        </div>
      </div>
    </div>
  );
};
