'use client';

import React, { useState, useEffect } from 'react';
import { FailurePrediction } from '@/lib/types';
import { AlertTriangle, Clock, ShieldAlert, Sparkles, CheckCircle2, TrendingUp, AlertOctagon } from 'lucide-react';

interface GaugeProps {
  prediction: FailurePrediction;
  isRemediated: boolean;
  onOpenRemediation: () => void;
}

export const FailurePredictionGauge: React.FC<GaugeProps> = ({
  prediction,
  isRemediated,
  onOpenRemediation,
}) => {
  const [countdown, setCountdown] = useState(prediction.timeToFailureSec);

  useEffect(() => {
    setCountdown(prediction.timeToFailureSec);
  }, [prediction.timeToFailureSec]);

  useEffect(() => {
    if (isRemediated || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRemediated, countdown]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentProbability = isRemediated ? 12 : prediction.probability;
  const currentRisk = isRemediated ? 'NOMINAL' : prediction.riskLevel;

  // Circular gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentProbability / 100) * circumference;

  const getRiskColor = () => {
    if (isRemediated) return 'text-emerald-400 stroke-emerald-400';
    if (currentProbability >= 90) return 'text-rose-500 stroke-rose-500';
    if (currentProbability >= 70) return 'text-amber-500 stroke-amber-500';
    return 'text-sky-400 stroke-sky-400';
  };

  const getBadgeStyle = () => {
    if (isRemediated) {
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
    }
    if (currentRisk === 'CRITICAL') {
      return 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse';
    }
    return 'bg-amber-500/15 border-amber-500/40 text-amber-300';
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-slate-800">
      {/* Subtle background radar/glow */}
      <div className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
        isRemediated ? 'bg-emerald-500' : 'bg-rose-600'
      }`} />

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 relative z-10">
        {/* Left: Probability Circular Gauge & Countdown */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Circular Progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-slate-800/80"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className={`transition-all duration-1000 ease-out ${getRiskColor()}`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
                {currentProbability}%
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Failure Risk
              </span>
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wider uppercase flex items-center gap-1.5 ${getBadgeStyle()}`}>
                {isRemediated ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    System Stabilized
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                    {currentRisk} Risk Alert
                  </>
                )}
              </span>
              <span className="text-xs text-slate-400 font-mono">Confidence: {prediction.confidence}%</span>
            </div>

            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
              <span className="text-xs text-slate-400">Estimated TTF (Time-to-Failure):</span>
              <span className={`text-xl font-mono font-bold ${isRemediated ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isRemediated ? '∞ Stable' : timeFormatted}
              </span>
            </div>
            
            <p className="text-xs text-slate-400 max-w-sm">
              {isRemediated
                ? 'Autonomous self-healing mitigated the failure condition before downtime occurred.'
                : 'Predictive multi-variate regressor detected an unsustainable trajectory across system layers.'}
            </p>
          </div>
        </div>

        {/* Center / Right: Predicted Incident & Early Warning Signals */}
        <div className="flex-1 space-y-3 w-full lg:max-w-2xl bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Forecasted Incident Signature
              </span>
              <span className="text-[11px] text-sky-400 font-mono">Proactive Detection Active</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              {isRemediated ? 'All Services Healthy & Operating within Nominal SLA' : prediction.predictedIncident}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              <strong className="text-slate-300">Trigger:</strong> {prediction.primaryAnomalyTrigger}
            </p>
          </div>

          {/* Early Warning Signals List */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Correlated Pre-Failure Telemetry Signals:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {prediction.earlyWarningSignals.map((signal, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-slate-300"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Remediation Action Trigger Button */}
        <div className="shrink-0 flex flex-col items-center justify-center w-full lg:w-auto">
          <button
            onClick={onOpenRemediation}
            className={`w-full lg:w-48 py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex flex-col items-center justify-center gap-1 ${
              isRemediated
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-900/30 glow-danger animate-pulse'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{isRemediated ? 'View Fix & Report' : '⚡ Self-Heal Now'}</span>
            </div>
            <span className="text-[10px] font-normal text-white/80 lowercase">
              {isRemediated ? 'review code patch' : 'auto-generate mitigation plan'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
