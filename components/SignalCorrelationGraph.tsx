'use client';

import React, { useState } from 'react';
import { IncidentScenario } from '@/lib/types';
import { GitCommit, Layers, Database, Cpu, Globe, ArrowRight, CheckCircle, AlertTriangle, Link2, Info } from 'lucide-react';

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
      metric: isRemediated ? 'Threads: Normal' : 'Threadpool Saturation',
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
      detail: 'Container limits under heavy stress; thread backlog preventing scale-in.'
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
      title: 'API Gateway / Cloudflare',
      subtitle: 'Edge HTTP Responses',
      status: isRemediated ? 'healthy' : 'warning',
      metric: isRemediated ? 'p99: 52ms | Err: 0%' : `p99: ${scenario.metrics[scenario.metrics.length - 1].p99Latency}ms | Err: ${scenario.metrics[scenario.metrics.length - 1].errorRate}%`,
      detail: 'Client facing response latency spiking; gateway timeout cascade imminent.'
    }
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Link2 className="w-4 h-4 text-sky-400" />
              Cross-Stack Signal Correlation Topology
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
              Correlated Full-Stack
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time causal graph linking code commits, microservice state, database locks, and ingress latency.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Culprit Anomaly
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Degraded
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Healthy
          </span>
        </div>
      </div>

      {/* Visual Pipeline Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isSelected = selectedNode === node.id;
          
          let statusBorder = 'border-slate-800 hover:border-slate-700';
          let statusGlow = '';
          let badgeColor = 'bg-slate-800 text-slate-300';

          if (node.status === 'culprit' || node.status === 'critical') {
            statusBorder = 'border-rose-500/50 bg-rose-950/20';
            statusGlow = 'shadow-rose-900/20';
            badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
          } else if (node.status === 'warning') {
            statusBorder = 'border-amber-500/50 bg-amber-950/20';
            badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
          } else if (node.status === 'healthy') {
            statusBorder = 'border-emerald-500/40 bg-emerald-950/20';
            badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
          }

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${statusBorder} ${statusGlow} ${
                isSelected ? 'ring-2 ring-sky-400 bg-slate-900/90' : 'bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                  {node.layer}
                </span>
                <Icon className={`w-4 h-4 ${
                  node.status === 'critical' || node.status === 'culprit' ? 'text-rose-400' : 'text-sky-400'
                }`} />
              </div>

              <div className="font-mono text-xs font-bold text-white truncate mb-0.5">
                {node.title}
              </div>
              <div className="text-[11px] text-slate-400 truncate mb-2">
                {node.subtitle}
              </div>

              <div className={`text-[10px] font-mono px-2 py-0.5 rounded truncate font-medium ${badgeColor}`}>
                {node.metric}
              </div>

              {/* Connecting arrow for larger screens */}
              {index < nodes.length - 1 && (
                <div className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-slate-400">
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Node Detailed Telemetry Drawer */}
      {selectedNode && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-semibold text-slate-200">
              Layer Inspection: {nodes.find(n => n.id === selectedNode)?.layer} ({nodes.find(n => n.id === selectedNode)?.title})
            </span>
            <p className="text-slate-400 leading-relaxed">
              {nodes.find(n => n.id === selectedNode)?.detail}
            </p>
          </div>
        </div>
      )}

      {/* Cross-Stack Pearson Correlation Coefficients Matrix */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <span>Mathematical Cross-Signal Correlation Matrix (Pearson r)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {scenario.rootCause.crossStackCorrelations.map((corr, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-medium text-slate-200 flex items-center gap-1.5">
                  <span className="text-sky-300">{corr.signalA}</span>
                  <span className="text-slate-500">↔</span>
                  <span className="text-rose-300">{corr.signalB}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{corr.reasoning}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-mono font-bold text-sky-400">
                  r = {corr.correlationCoefficient}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-emerald-400 font-semibold">
                  High Causality
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
