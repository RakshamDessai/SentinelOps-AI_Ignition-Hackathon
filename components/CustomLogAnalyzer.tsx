'use client';

import React, { useState } from 'react';
import { IncidentScenario } from '@/lib/types';
import { X, UploadCloud, Sparkles, RefreshCw, FileText, CheckCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Live Custom Telemetry Ingestion & Correlation Engine
              </h2>
              <p className="text-xs text-slate-400">
                Paste raw application logs, stack traces, or metrics to run failure prediction & root-cause extraction.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="px-6 pt-4 pb-2 bg-slate-950/30 border-b border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Load Quick Test Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setTelemetryText(preset.data)}
                className="px-3 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Textarea */}
        <div className="p-6 space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Application Logs / Distributed Traces / Stack Traces:
          </label>
          <textarea
            rows={8}
            placeholder="Paste your logs, exception stack traces, or telemetry records here..."
            value={telemetryText}
            onChange={(e) => setTelemetryText(e.target.value)}
            className="w-full bg-black/80 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
          />

          {error && (
            <div className="text-xs text-rose-400 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/50">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs uppercase tracking-wider shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Correlating Cross-Stack Signals...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze & Predict Failures</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
