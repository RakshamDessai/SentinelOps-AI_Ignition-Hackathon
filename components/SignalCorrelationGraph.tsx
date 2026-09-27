'use client';

import React, { useState } from 'react';
import { IncidentScenario } from '@/lib/types';
import { GitCommit, Layers, Database, Cpu, Globe, ArrowRight, Info, Network } from 'lucide-react';

interface TopologyProps {
  scenario: IncidentScenario;
  isRemediated: boolean;
}

export const SignalCorrelationGraph: React.FC<TopologyProps> = ({ scenario, isRemediated }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>('app');

  const nodes = [
    {
      id: 'deploy',
      layer: 'Deployment Layer',
      icon: GitCommit,
      title: scenario.deployment.hash,
      subtitle: `${scenario.deployment.author}`,
      status: 'culprit',
      metric: `Risk Score: ${scenario.deployment.riskScore}/100`,
      detail: `Commit "${scenario.deployment.message}". Modified ${scenario.deployment.changedFiles.length} files.`
    },
    {
      id: 'app',
      layer: 'Application Layer',
      icon: Layers,
      title: scenario.rootCause.culpritService,
      subtitle: 'Microservice Runtime',
      status: isRemediated ? 'healthy' : 'critical',
      metric: isRemediated ? 'Threadpool: Nominal' : 'Thread Saturation',
      detail: scenario.rootCause.probableRootCause
    },
    {
      id: 'infra',
      layer: 'Infrastructure',
      icon: Cpu,
      title: 'Kubernetes Pods',
      subtitle: 'Node & Container Cgroups',
      status: isRemediated ? 'healthy' : 'warning',
      metric: isRemediated ? 'CPU: 28% | Mem: 45%' : `CPU: ${scenario.metrics[scenario.metrics.length - 1].cpu}% | Mem: ${scenario.metrics[scenario.metrics.length - 1].memory}%`,
      detail: 'Container resource utilization trending upward; thread backlog prevents scale-in.'
    },
    {
      id: 'db',
      layer: 'Database Layer',
      icon: Database,
      title: 'PostgreSQL RDS',
      subtitle: 'Connection Pool & Locks',
      status: isRemediated ? 'healthy' : 'critical',
      metric: isRemediated ? 'Pool: 32/100' : `Pool: ${scenario.database.activeConnections}/${scenario.database.maxConnections} (${scenario.database.waitingThreads} wait)`,
      detail: scenario.database.topOffenderQuery
    },
    {
      id: 'ingress',
      layer: 'Client Ingress',
      icon: Globe,
      title: 'API Gateway',
      subtitle: 'Edge HTTP Responses',
      status: isRemediated ? 'healthy' : 'warning',
      metric: isRemediated ? 'p99: 52ms | Err: 0%' : `p99: ${scenario.metrics[scenario.metrics.length - 1].p99Latency}ms | Err: ${scenario.metrics[scenario.metrics.length - 1].errorRate}%`,
      detail: 'Client-facing response latency rising rapidly; timeout threshold approaching.'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Network className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Cross-Stack Signal Correlation Topology
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
              Live Topology
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time causal graph correlating code changes, microservices, container metrics, and database transactions.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Culprit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Degraded
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Nominal
          </span>
        </div>
      </div>

      {/* Visual Pipeline Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isSelected = selectedNode === node.id;
          
          let statusBadge = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
          let borderStyle = 'border-slate-200 dark:border-slate-800';

          if (node.status === 'culprit' || node.status === 'critical') {
            borderStyle = isSelected ? 'border-rose-500' : 'border-rose-300 dark:border-rose-800/80';
            statusBadge = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
          } else if (node.status === 'warning') {
            borderStyle = isSelected ? 'border-amber-500' : 'border-amber-300 dark:border-amber-800/80';
            statusBadge = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
          } else if (node.status === 'healthy') {
            borderStyle = isSelected ? 'border-emerald-500' : 'border-emerald-300 dark:border-emerald-800/80';
            statusBadge = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
          }

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer relative bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800/70 shadow-sm ${borderStyle} ${
                isSelected ? 'ring-2 ring-sky-500/40 bg-white dark:bg-slate-850' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  {node.layer}
                </span>
                <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>

              <div className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate mb-0.5">
                {node.title}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2">
                {node.subtitle}
              </div>

              <div className={`text-[10px] font-mono px-2 py-0.5 rounded truncate font-medium ${statusBadge}`}>
                {node.metric}
              </div>

              {/* Connecting arrow for larger screens */}
              {index < nodes.length - 1 && (
                <div className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 items-center justify-center text-slate-400 shadow-xs">
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Node Detailed Telemetry Drawer */}
      {selectedNode && (
        <div className="mt-4 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-start gap-3">
          <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              Layer Inspection: {nodes.find(n => n.id === selectedNode)?.layer} ({nodes.find(n => n.id === selectedNode)?.title})
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {nodes.find(n => n.id === selectedNode)?.detail}
            </p>
          </div>
        </div>
      )}

      {/* Cross-Stack Pearson Correlation Table */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 font-mono">
          Empirical Signal Cross-Correlation Matrix (Pearson r)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {scenario.rootCause.crossStackCorrelations.map((corr, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="text-sky-600 dark:text-sky-400">{corr.signalA}</span>
                  <span className="text-slate-400">↔</span>
                  <span className="text-rose-600 dark:text-rose-400">{corr.signalB}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{corr.reasoning}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                  r = {corr.correlationCoefficient}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                  Strong Coupling
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
