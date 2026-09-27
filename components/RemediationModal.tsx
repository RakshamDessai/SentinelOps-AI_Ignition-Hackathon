'use client';

import React, { useState } from 'react';
import { RemediationPlan } from '@/lib/types';
import { X, CheckCircle2, Terminal, GitPullRequest, FileText, Play, Copy, Check, Download, RefreshCw, ShieldCheck } from 'lucide-react';
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

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleCreatePR = () => {
    setPrCreated(true);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  const generateReportText = () => {
    return `# Incident Post-Mortem: ${remediation.postMortemReport.incidentId}
**Severity:** ${remediation.postMortemReport.severity}
**Impact:** ${remediation.postMortemReport.businessImpact}
**Recovery:** ${remediation.postMortemReport.recoveryActionTaken}

## Recommended Architectural Safeguards:
${remediation.postMortemReport.architecturalRecommendations.map(r => `- ${r}`).join('\n')}

Generated autonomously by SentinelOps AI Incident Intelligence Platform`;
  };

  const copyPostMortem = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    const blob = new Blob([generateReportText()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${remediation.postMortemReport.incidentId}-PostMortem.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Remediation & Self-Healing Pipeline
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-phase resolution: Traffic Mitigation • Git Code Patch • Post-Mortem Report
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50/40 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('immediate')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'immediate'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4 text-rose-500" />
            <span>Phase 1: Immediate Mitigation</span>
          </button>

          <button
            onClick={() => setActiveTab('codePatch')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'codePatch'
                ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GitPullRequest className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Phase 2: Permanent Code Patch PR</span>
          </button>

          <button
            onClick={() => setActiveTab('postMortem')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'postMortem'
                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Phase 3: Post-Mortem Report</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Immediate Actions */}
          {activeTab === 'immediate' && (
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono block">
                Cluster Self-Healing Actions to Avert Downtime:
              </span>

              <div className="space-y-3">
                {remediation.immediateActions.map((action) => {
                  const isExecuting = executingActionId === action.id;

                  return (
                    <div
                      key={action.id}
                      className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{action.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono">
                            ETA: {action.estimatedMitigationTime}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">{action.impact}</p>
                        <div className="font-mono text-[11px] bg-white dark:bg-slate-900 px-2 py-1 rounded text-sky-700 dark:text-sky-300 inline-block border border-slate-200 dark:border-slate-800">
                          {action.command}
                        </div>
                      </div>

                      <button
                        onClick={() => handleExecute(action.id, action.command)}
                        disabled={isExecuting || isRemediated}
                        className={`shrink-0 px-4 py-2 rounded-lg font-semibold text-xs tracking-wider transition-all flex items-center gap-2 shadow-xs ${
                          isRemediated
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default'
                            : isExecuting
                            ? 'bg-amber-600 text-white'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                      >
                        {isRemediated ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Remediated</span>
                          </>
                        ) : isExecuting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Executing...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Execute Self-Healing</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {terminalLogs.length > 0 && (
                <div className="mt-4 bg-slate-950 rounded-lg p-3.5 border border-slate-800 font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-sky-400" />
                      Cluster Mitigation Log
                    </span>
                    <span className="text-emerald-400">Kubernetes Active</span>
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
              <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-sky-600 dark:text-sky-400 font-semibold block">
                      Autonomous Pull Request
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {remediation.permanentPatch.prTitle}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      File: {remediation.permanentPatch.filePath}
                    </span>
                  </div>

                  <button
                    onClick={handleCreatePR}
                    disabled={prCreated}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      prCreated
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default'
                        : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                    }`}
                  >
                    {prCreated ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>PR #142 Created on GitHub</span>
                      </>
                    ) : (
                      <>
                        <GitPullRequest className="w-3.5 h-3.5" />
                        <span>Publish GitHub PR</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Architectural Rationale:</strong>{' '}
                  {remediation.permanentPatch.explanation}
                </div>

                {/* Diff Viewer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="bg-white dark:bg-slate-900 rounded-md p-3 border border-rose-200 dark:border-rose-900/40">
                    <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400 mb-2 pb-1 border-b border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
                      <span>BEFORE (Defect)</span>
                      <span className="text-[10px] text-slate-400">v2.4.1</span>
                    </div>
                    <pre className="text-rose-800 dark:text-rose-300 whitespace-pre-wrap leading-relaxed text-[11px]">
                      {remediation.permanentPatch.codeBefore}
                    </pre>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-md p-3 border border-emerald-200 dark:border-emerald-900/40">
                    <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-2 pb-1 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                      <span>AFTER (SentinelOps AI Patch)</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Tested Clean</span>
                    </div>
                    <pre className="text-emerald-800 dark:text-emerald-300 whitespace-pre-wrap leading-relaxed text-[11px]">
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
              <div className="bg-slate-50 dark:bg-slate-950/70 p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">
                      {remediation.postMortemReport.incidentId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-mono">
                      {remediation.postMortemReport.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadReport}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-300 dark:border-slate-700 transition-colors"
                      title="Download Markdown Report"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .md</span>
                    </button>

                    <button
                      onClick={copyPostMortem}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white dark:bg-sky-600 dark:hover:bg-sky-500 text-xs font-medium transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">Averted Business Impact:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {remediation.postMortemReport.businessImpact}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">Autonomous Mitigation Summary:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {remediation.postMortemReport.recoveryActionTaken}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">Architectural Recommendations:</span>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mt-1 space-y-1">
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
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>SentinelOps Self-Healing Pipeline</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-medium border border-slate-300 dark:border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
