'use client';

import React from 'react';
import { IncidentScenario } from '@/lib/types';
import { SCENARIOS } from '@/lib/scenarios';
import { Database, Layers, Cpu, Lock, CheckCircle2 } from 'lucide-react';

interface SwitcherProps {
  currentScenarioId: string;
  onSelectScenario: (scenario: IncidentScenario) => void;
}

export const ScenarioSwitcher: React.FC<SwitcherProps> = ({
  currentScenarioId,
  onSelectScenario
}) => {
  const getIcon = (category: IncidentScenario['category']) => {
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
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 mb-3">
        <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-mono">
          Simulated Enterprise Incident Scenarios
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Select a production incident pattern to inspect cross-stack telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {SCENARIOS.map((sc) => {
          const Icon = getIcon(sc.category);
          const isSelected = sc.id === currentScenarioId;

          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-500 dark:border-sky-500/80 shadow-sm'
                  : 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                  isSelected
                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'
                    : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {sc.category}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                  {sc.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {sc.systemContext.split('(')[0]}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-slate-200/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400">
                <span>Risk: <strong className="text-rose-600 dark:text-rose-400 font-bold">{sc.prediction.probability}%</strong></span>
                <span>TTF: <strong className="text-amber-600 dark:text-amber-400 font-medium">{Math.round(sc.prediction.timeToFailureSec / 60)}m</strong></span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
