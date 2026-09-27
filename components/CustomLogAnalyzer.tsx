'use client';

import React, { useState } from 'react';
import { IncidentScenario } from '@/lib/types';
import { X, UploadCloud, Sparkles, RefreshCw } from 'lucide-react';

interface AnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzed: (scenario: IncidentScenario) => void;
}

export const CustomLogAnalyzer: React.FC<AnalyzerProps> = ({
  isOpen,
  onClose,
  onAnalyzed
}) => {
  const [telemetryText, setTelemetryText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const samplePresets = [
    {
      name: 'PostgreSQL Connection Exhaustion',
      data: `12:21:10 checkout-service WARN CouponExpiredException: Code AUTUMN26 is expired
12:23:45 checkout-service WARN HikariPool-1 - Connection acquisition took 2840ms. Pool active=88, idle=2
12:25:12 postgres-primary ERROR FATAL: remaining connection slots are reserved for non-replication superuser
12:27:00 checkout-service ERROR ConnectionTimeout: Connection is not available, request timed out after 5000ms
12:28:15 api-ingress FATAL Upstream connection reset by peer from checkout-service (HTTP 504 Gateway Timeout)`
    },
    {
      name: 'Kubernetes Pod OutOfMemory & Heap Leak',
      data: `12:15:00 telehealth-session-svc INFO Active patient video streaming sessions: 5,120
12:18:22 telehealth-session-svc WARN runtime.GC STW pause took 980ms (HeapAlloc: 6.8GB)
12:22:15 k8s-pod-telehealth-79b WARN Cgroup memory limit threshold reached: 92% of 8.0Gi
12:25:50 telehealth-session-svc ERROR runtime.GC STW pause took 2400ms. Heartbeat frame dropped
12:28:10 k8s-pod-telehealth-79b FATAL Kernel invoked oom-killer: killed process 1821 (telehealth) total-vm:8400MB`
    },
    {
      name: 'Synchronous Partner Webhook Timeout',
      data: `12:18:10 payment-worker WARN Outbound socket handshake with bank-api.partner.io taking > 5000ms
12:21:45 payment-worker WARN Threadpool saturated: 128/128 workers busy awaiting I/O completion
12:24:12 kafka-consumer ERROR Consumer group payment-workers heartbeat failed. Missed max poll interval
12:26:40 settlement-api FATAL HTTP 503 Service Unavailable: No healthy upstream worker available`
    }
  ];

  const handleRunAnalysis = async () => {
    if (!telemetryText.trim()) {
      setError('Please enter or select sample telemetry logs to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telemetryText })
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data = await res.json();
      if (data.scenario) {
        onAnalyzed(data.scenario);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze custom telemetry');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-3xl flex flex-col shadow-xl overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Live Telemetry Ingestion & Correlation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ingest application logs, exception stack traces, or metrics to calculate failure risk and root cause.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="px-5 pt-3.5 pb-2.5 bg-slate-50/40 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono block mb-2">
            Load Quick Incident Templates:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setTelemetryText(preset.data)}
                className="px-2.5 py-1 rounded-md text-xs bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors font-medium shadow-xs"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Textarea */}
        <div className="p-5 sm:p-6 space-y-2.5">
          <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block font-mono text-[11px]">
            Application Logs / Distributed Traces / Metrics JSON:
          </label>
          <textarea
            rows={7}
            placeholder="Paste your logs, exception stack traces, or telemetry records here..."
            value={telemetryText}
            onChange={(e) => setTelemetryText(e.target.value)}
            className="w-full bg-slate-50 dark:bg-black/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />

          {error && (
            <div className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded border border-rose-200 dark:border-rose-900/50">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-300 dark:border-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-sky-600 dark:hover:bg-sky-500 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Correlating Signals...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Correlate & Predict</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
