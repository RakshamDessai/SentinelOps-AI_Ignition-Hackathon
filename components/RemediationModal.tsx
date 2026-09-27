'use client';

import React, { useState } from 'react';
import { RemediationPlan } from '@/lib/types';
import { X, Sparkles, CheckCircle2, Terminal, GitPullRequest, FileText, Play, Copy, Check, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RemediationProps {
  isOpen: boolean;
  onClose: () => void;
  remediation: RemediationPlan;
  scenarioId: string;
  isRemediated: boolean;
  onExecuteRemediation: (actionId: string) => Promise<void>;
}

export const RemediationModal: React.FC<RemediationProps> = ({
  isOpen,
  onClose,
  remediation,
  scenarioId,
  isRemediated,
  onExecuteRemediation
}) => {
  const [activeTab, setActiveTab] = useState<'immediate' | 'codePatch' | 'postMortem'>('immediate');
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [prCreated, setPrCreated] = useState(false);

  if (!isOpen) return null;

  const handleExecute = async (actionId: string, cmd: string) => {
    setExecutingActionId(actionId);
    setTerminalLogs([
      `$ [SENTINEL-OPS] Initiating autonomous cluster mitigation...`,
      `$ Target: production cluster us-east-1`,
      `$ Executing: ${cmd}`
    ]);

    await new Promise((r) => setTimeout(r, 600));
    setTerminalLogs((prev) => [...prev, `[INFO] Drain initiated on affected pods...`]);

    await new Promise((r) => setTimeout(r, 800));
    setTerminalLogs((prev) => [
      ...prev,
      `[SUCCESS] Rollback synchronized: deployment revision updated.`,
      `[INFO] Reclaiming leaked database connections...`,
      `[SUCCESS] Active pool utilization dropped to nominal (28%).`,
      `[SUCCESS] Anomaly neutralized. System SLO restored.`
    ]);

    await onExecuteRemediation(actionId);
    setExecutingActionId(null);

    // Fire celebration confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleCreatePR = () => {
    setPrCreated(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const copyPostMortem = () => {
    const text = `# Incident Post-Mortem: ${remediation.postMortemReport.incidentId}
**Severity:** ${remediation.postMortemReport.severity}
**Impact:** ${remediation.postMortemReport.businessImpact}
**Recovery:** ${remediation.postMortemReport.recoveryActionTaken}

## Recommended Architectural Safeguards:
${remediation.postMortemReport.architecturalRecommendations.map(r => `- ${r}`).join('\n')}

Generated autonomously by SentinelOps AI Incident Intelligence Platform`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500/20 to-purple-500/20 border border-sky-500/30 text-sky-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Autonomous Remediation & Self-Healing Engine
              </h2>
              <p className="text-xs text-slate-400">
                Multi-phase recovery: Immediate Traffic Mitigation • Git Code Patch • Post-Mortem
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('immediate')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'immediate'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4 text-rose-400" />
            <span>Phase 1: Immediate Self-Healing</span>
          </button>

          <button
            onClick={() => setActiveTab('codePatch')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'codePatch'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitPullRequest className="w-4 h-4 text-sky-400" />
            <span>Phase 2: Permanent Code Patch PR</span>
          </button>

          <button
            onClick={() => setActiveTab('postMortem')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'postMortem'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Phase 3: Post-Mortem Report</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: Immediate Actions */}
          {activeTab === 'immediate' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Select Immediate Cluster Action to Prevent Total Downtime:
                </span>

                {remediation.immediateActions.map((action) => {
                  const isExecuting = executingActionId === action.id;

                  return (
                    <div
                      key={action.id}
                      className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">{action.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                            ETA: {action.estimatedMitigationTime}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-snug">{action.impact}</p>
                        <div className="font-mono text-xs bg-slate-900 px-2.5 py-1 rounded text-sky-300 inline-block border border-slate-800">
                          {action.command}
                        </div>
                      </div>

                      <button
                        onClick={() => handleExecute(action.id, action.command)}
                        disabled={isExecuting || isRemediated}
                        className={`shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${
                          isRemediated
                            ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                            : isExecuting
                            ? 'bg-amber-600 text-white animate-pulse'
                            : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-900/40 glow-danger'
                        }`}
                      >
                        {isRemediated ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Remediated</span>
                          </>
                        ) : isExecuting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Executing...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-white" />
                            <span>Execute Self-Healing</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Execution Console Output */}
              {terminalLogs.length > 0 && (
                <div className="mt-4 bg-black/80 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-sky-400" />
                      Self-Healing Execution Log
                    </span>
                    <span className="text-emerald-400">Kubernetes & RDS Active</span>
                  </div>
                  <div className="pt-2 space-y-1">
                    {terminalLogs.map((log, i) => (
                      <div
                        key={i}
                        className={
                          log.includes('[SUCCESS]')
                            ? 'text-emerald-400 font-semibold'
                            : log.includes('Executing:')
                            ? 'text-sky-300'
                            : 'text-slate-400'
                        }
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Permanent Code Patch PR */}
          {activeTab === 'codePatch' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-semibold block">
                      Auto-Generated Pull Request
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      {remediation.permanentPatch.prTitle}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      File: {remediation.permanentPatch.filePath}
                    </span>
                  </div>

                  <button
                    onClick={handleCreatePR}
                    disabled={prCreated}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                      prCreated
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-sky-500 hover:bg-sky-400 text-white shadow-md'
                    }`}
                  >
                    {prCreated ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>PR #142 Created on GitHub</span>
                      </>
                    ) : (
                      <>
                        <GitPullRequest className="w-4 h-4" />
                        <span>Publish GitHub PR</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-sky-950/20 border border-sky-900/40 rounded-lg text-xs text-slate-300">
                  <strong className="text-sky-300">Architectural Rationale:</strong>{' '}
                  {remediation.permanentPatch.explanation}
                </div>

                {/* Diff Viewer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                  {/* Before */}
                  <div className="bg-slate-900/90 rounded-lg p-3 border border-rose-900/40">
                    <div className="text-[11px] font-bold text-rose-400 mb-2 pb-1 border-b border-rose-900/40 flex items-center justify-between">
                      <span>BEFORE (Vulnerable / Leaking)</span>
                      <span className="text-[10px] text-slate-500">v2.4.1</span>
                    </div>
                    <pre className="text-rose-300/90 whitespace-pre-wrap leading-relaxed text-[11px]">
                      {remediation.permanentPatch.codeBefore}
                    </pre>
                  </div>

                  {/* After */}
                  <div className="bg-slate-900/90 rounded-lg p-3 border border-emerald-900/40">
                    <div className="text-[11px] font-bold text-emerald-400 mb-2 pb-1 border-b border-emerald-900/40 flex items-center justify-between">
                      <span>AFTER (SentinelOps AI Patch)</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Tested Clean</span>
                    </div>
                    <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed text-[11px]">
                      {remediation.permanentPatch.codeAfter}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Post-Mortem Report */}
          {activeTab === 'postMortem' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-sky-400">
                      {remediation.postMortemReport.incidentId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {remediation.postMortemReport.severity}
                    </span>
                  </div>

                  <button
                    onClick={copyPostMortem}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Markdown' : 'Copy Post-Mortem'}</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-300">Prevented Business Impact:</span>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      {remediation.postMortemReport.businessImpact}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-300">Autonomous Recovery Action:</span>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      {remediation.postMortemReport.recoveryActionTaken}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-300">Preventative Safeguards:</span>
                    <ul className="list-disc list-inside text-slate-400 mt-1 space-y-1">
                      {remediation.postMortemReport.architecturalRecommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>SentinelOps Automated Self-Healing Pipeline</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
