'use client';

import React, { useState } from 'react';
import { SCENARIOS } from '@/lib/scenarios';
import { IncidentScenario } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { FailurePredictionGauge } from '@/components/FailurePredictionGauge';
import { SignalCorrelationGraph } from '@/components/SignalCorrelationGraph';
import { MetricsOverview } from '@/components/MetricsOverview';
import { RootCauseDetail } from '@/components/RootCauseDetail';
import { LiveLogStream } from '@/components/LiveLogStream';
import { RemediationModal } from '@/components/RemediationModal';
import { CustomLogAnalyzer } from '@/components/CustomLogAnalyzer';
import { OpsCopilotChat } from '@/components/OpsCopilotChat';
import { 
  AlertOctagon, 
  CheckCircle2, 
  ShieldAlert, 
  Layers, 
  TrendingUp, 
  Bug, 
  Terminal, 
  LayoutGrid, 
  ChevronDown,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  Lock
} from 'lucide-react';

type ActiveViewTab = 'overview' | 'topology' | 'rootcause' | 'metrics' | 'logs' | 'all';

export default function DashboardPage() {
  const [currentScenario, setCurrentScenario] = useState<IncidentScenario>(SCENARIOS[0]);
  const [isRemediated, setIsRemediated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveViewTab>('overview');
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

  const getScenarioIcon = (category: IncidentScenario['category']) => {
    switch (category) {
      case 'Database Exhaustion':
        return Database;
      case 'Thread Starvation':
        return Layers;
      case 'Memory Leak':
        return Cpu;
      case 'Deadlock / Cascading':
        return Lock;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Header Navigation */}
      <Navbar
        onOpenCustomAnalyzer={() => setIsCustomAnalyzerOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        isRemediated={isRemediated}
        onReset={handleReset}
      />

      {/* 2. Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Incident Summary & Scenario Switcher Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Left: Incident Details */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5 ${
                  isRemediated
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                }`}>
                  {isRemediated ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
                  {isRemediated ? 'INCIDENT RESOLVED' : 'P1 ACTIVE INCIDENT'}
                </span>
                
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {currentScenario.systemContext.split('(')[0]}
                </span>
              </div>

              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {currentScenario.title}
              </h1>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {currentScenario.subtitle}
              </p>
            </div>

            {/* Right: Quick Scenario Pill Selectors */}
            <div className="shrink-0 flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              {SCENARIOS.map((sc) => {
                const Icon = getScenarioIcon(sc.category);
                const isSelected = sc.id === currentScenario.id;

                return (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{sc.category}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* 3. Clean Workspace View Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white dark:bg-sky-600 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Incident Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('topology')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'topology'
                  ? 'bg-slate-900 text-white dark:bg-sky-600 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Cross-Stack Topology</span>
            </button>

            <button
              onClick={() => setActiveTab('rootcause')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'rootcause'
                  ? 'bg-slate-900 text-white dark:bg-sky-600 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Bug className="w-4 h-4" />
              <span>Root Cause & Code</span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'metrics'
                  ? 'bg-slate-900 text-white dark:bg-sky-600 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Metrics & Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'logs'
                  ? 'bg-slate-900 text-white dark:bg-sky-600 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Logs & Spans</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white ${
                activeTab === 'all'
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : ''
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>View All</span>
            </button>
          </div>
        </div>

        {/* 4. Active Tab Content (Clean & Breathable Layout) */}
        
        {/* VIEW 1: Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <FailurePredictionGauge
              prediction={currentScenario.prediction}
              isRemediated={isRemediated}
              onOpenRemediation={() => setIsRemediationModalOpen(true)}
            />

            <SignalCorrelationGraph
              scenario={currentScenario}
              isRemediated={isRemediated}
            />
          </div>
        )}

        {/* VIEW 2: Topology Tab */}
        {activeTab === 'topology' && (
          <div className="space-y-6">
            <SignalCorrelationGraph
              scenario={currentScenario}
              isRemediated={isRemediated}
            />
          </div>
        )}

        {/* VIEW 3: Root Cause & Code Tab */}
        {activeTab === 'rootcause' && (
          <div className="space-y-6">
            <RootCauseDetail
              rootCause={currentScenario.rootCause}
              database={currentScenario.database}
              isRemediated={isRemediated}
              onOpenRemediation={() => setIsRemediationModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 4: Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <MetricsOverview
              metrics={currentScenario.metrics}
              isRemediated={isRemediated}
            />
          </div>
        )}

        {/* VIEW 5: Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <LiveLogStream
              logs={currentScenario.logs}
              isRemediated={isRemediated}
            />
          </div>
        )}

        {/* VIEW 6: View All (Sequential with generous spacing) */}
        {activeTab === 'all' && (
          <div className="space-y-8">
            <FailurePredictionGauge
              prediction={currentScenario.prediction}
              isRemediated={isRemediated}
              onOpenRemediation={() => setIsRemediationModalOpen(true)}
            />

            <SignalCorrelationGraph
              scenario={currentScenario}
              isRemediated={isRemediated}
            />

            <MetricsOverview
              metrics={currentScenario.metrics}
              isRemediated={isRemediated}
            />

            <RootCauseDetail
              rootCause={currentScenario.rootCause}
              database={currentScenario.database}
              isRemediated={isRemediated}
              onOpenRemediation={() => setIsRemediationModalOpen(true)}
            />

            <LiveLogStream
              logs={currentScenario.logs}
              isRemediated={isRemediated}
            />
          </div>
        )}

      </main>

      {/* 5. Modals and Drawers */}
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

      {/* 6. Clean Observability Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-slate-900 dark:text-white">SentinelOps</span>
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
