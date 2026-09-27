'use client';

import React, { useState } from 'react';
import { SCENARIOS } from '@/lib/scenarios';
import { IncidentScenario } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { ScenarioSwitcher } from '@/components/ScenarioSwitcher';
import { FailurePredictionGauge } from '@/components/FailurePredictionGauge';
import { SignalCorrelationGraph } from '@/components/SignalCorrelationGraph';
import { MetricsOverview } from '@/components/MetricsOverview';
import { RootCauseDetail } from '@/components/RootCauseDetail';
import { LiveLogStream } from '@/components/LiveLogStream';
import { RemediationModal } from '@/components/RemediationModal';
import { CustomLogAnalyzer } from '@/components/CustomLogAnalyzer';
import { OpsCopilotChat } from '@/components/OpsCopilotChat';
import { Sparkles, Shield, HeartPulse, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const [currentScenario, setCurrentScenario] = useState<IncidentScenario>(SCENARIOS[0]);
  const [isRemediated, setIsRemediated] = useState<boolean>(false);
  const [isRemediationModalOpen, setIsRemediationModalOpen] = useState<boolean>(false);
  const [isCustomAnalyzerOpen, setIsCustomAnalyzerOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  const handleSelectScenario = (sc: IncidentScenario) => {
    setCurrentScenario(sc);
    setIsRemediated(false);
  };

  const handleExecuteRemediation = async (actionId: string) => {
    try {
      const res = await fetch('/api/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, scenarioId: currentScenario.id })
      });
      if (res.ok) {
        setIsRemediated(true);
      }
    } catch (e) {
      console.error('Failed to trigger remediation API', e);
      setIsRemediated(true);
    }
  };

  const handleReset = () => {
    setIsRemediated(false);
  };

  const handleCustomAnalyzed = (customSc: IncidentScenario) => {
    setCurrentScenario(customSc);
    setIsRemediated(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Top Navigation */}
      <Navbar
        onOpenCustomAnalyzer={() => setIsCustomAnalyzerOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        isRemediated={isRemediated}
        onReset={handleReset}
      />

      {/* 3. Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Scenario Switcher */}
        <ScenarioSwitcher
          currentScenarioId={currentScenario.id}
          onSelectScenario={handleSelectScenario}
        />

        {/* Hero Failure Prediction & TTF Gauge */}
        <FailurePredictionGauge
          prediction={currentScenario.prediction}
          isRemediated={isRemediated}
          onOpenRemediation={() => setIsRemediationModalOpen(true)}
        />

        {/* Cross-Stack Signal Correlation Topology */}
        <SignalCorrelationGraph
          scenario={currentScenario}
          isRemediated={isRemediated}
        />

        {/* Multi-Stack Telemetry Timeseries Curves */}
        <MetricsOverview
          metrics={currentScenario.metrics}
          isRemediated={isRemediated}
        />

        {/* Root Cause Detail & Causal Chain */}
        <RootCauseDetail
          rootCause={currentScenario.rootCause}
          database={currentScenario.database}
          isRemediated={isRemediated}
          onOpenRemediation={() => setIsRemediationModalOpen(true)}
        />

        {/* Live Logs & Culprit Trace Stream */}
        <LiveLogStream
          logs={currentScenario.logs}
          isRemediated={isRemediated}
        />
      </main>

      {/* 4. Modals and Drawers */}
      <RemediationModal
        isOpen={isRemediationModalOpen}
        onClose={() => setIsRemediationModalOpen(false)}
        remediation={currentScenario.remediation}
        scenarioId={currentScenario.id}
        isRemediated={isRemediated}
        onExecuteRemediation={handleExecuteRemediation}
      />

      <CustomLogAnalyzer
        isOpen={isCustomAnalyzerOpen}
        onClose={() => setIsCustomAnalyzerOpen(false)}
        onAnalyzed={handleCustomAnalyzed}
      />

      <OpsCopilotChat
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        scenario={currentScenario}
      />

      {/* 5. Enterprise Observability Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-slate-900 dark:text-white">SentinelOps AI</span>
            <span>•</span>
            <span>Continuous Telemetry & Incident Intelligence Platform</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              All Systems Operational
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
            <span>OpenTelemetry v1.28</span>
            <span>•</span>
            <span>Kubernetes v1.30</span>
            <span>•</span>
            <span>PostgreSQL Wire v16</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
