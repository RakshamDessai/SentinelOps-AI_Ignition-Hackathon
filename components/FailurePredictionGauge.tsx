'use client';

import React, { useState, useEffect } from 'react';
import { FailurePrediction } from '@/lib/types';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle2, AlertOctagon, ArrowRight } from 'lucide-react';

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
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentProbability / 100) * circumference;

  const getRiskColor = () => {
    if (isRemediated) return 'text-emerald-500 stroke-emerald-500';
    if (currentProbability >= 90) return 'text-rose-500 stroke-rose-500';
    if (currentProbability >= 70) return 'text-amber-500 stroke-amber-500';
    return 'text-sky-500 stroke-sky-500';
  };

  const getBadgeStyle = () => {
    if (isRemediated) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
    }
    if (currentRisk === 'CRITICAL') {
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60';
    }
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
        {/* Probability Gauge & Countdown */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                className={`transition-all duration-700 ease-out ${getRiskColor()}`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                {currentProbability}%
              </span>
              <span className="text-[10px] uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">
                Failure Risk
              </span>
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border uppercase tracking-wider flex items-center gap-1.5 ${getBadgeStyle()}`}>
                {isRemediated ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    System Stabilized
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    {currentRisk} Risk
                  </>
                )}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Model Confidence: {prediction.confidence}%
              </span>
            </div>

            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
              <span className="text-xs text-slate-500 dark:text-slate-400">Projected Time-to-Failure (TTF):</span>
              <span className={`text-xl font-mono font-bold ${
                isRemediated
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {isRemediated ? 'Nominal' : timeFormatted}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
              {isRemediated
                ? 'Autonomous self-healing mitigated the failure condition before customer downtime occurred.'
                : 'Continuous telemetry regressor detected an unsustainable saturation trend across software stack.'}
            </p>
          </div>
        </div>

        {/* Forecasted Incident & Early Warning Signals */}
        <div className="flex-1 space-y-3 w-full lg:max-w-2xl bg-slate-50 dark:bg-slate-950/60 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                Forecasted Incident Signature
              </span>
              <span className="text-[11px] text-sky-600 dark:text-sky-400 font-mono font-medium">Proactive Monitoring</span>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              {isRemediated ? 'All Services Healthy & Operating within Nominal SLA' : prediction.predictedIncident}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              <strong className="text-slate-800 dark:text-slate-300">Trigger:</strong> {prediction.primaryAnomalyTrigger}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Pre-Failure Telemetry Signals:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {prediction.earlyWarningSignals.map((signal, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex flex-col items-center justify-center w-full lg:w-auto">
          <button
            onClick={onOpenRemediation}
            className={`w-full lg:w-48 py-2.5 px-4 rounded-lg font-semibold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
              isRemediated
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-950/20'
            }`}
          >
            <span>{isRemediated ? 'View Remediations' : 'Mitigate Incident'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
