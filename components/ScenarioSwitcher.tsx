'use client';

import React from 'react';
import { IncidentScenario } from '@/lib/types';
import { SCENARIOS } from '@/lib/scenarios';
import { Layers, Database, Cpu, Lock, Sparkles } from 'lucide-react';

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
    <div className="glass-panel-subtle rounded-2xl p-4 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          Pre-Loaded Enterprise Incident Simulation Scenarios:
        </span>
        <span className="text-[11px] text-slate-400">Click to load real-world failure dynamics</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {SCENARIOS.map((sc) => {
          const Icon = getIcon(sc.category);
          const isSelected = sc.id === currentScenarioId;

          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-sky-950/40 border-sky-500/80 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/50'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                  isSelected ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {sc.category}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
              </div>

              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1">
                  {sc.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {sc.systemContext.split('(')[0]}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-slate-800/60 text-slate-400">
                <span>Risk: <strong className="text-rose-400">{sc.prediction.probability}%</strong></span>
                <span>TTF: <strong className="text-amber-400">{Math.round(sc.prediction.timeToFailureSec / 60)}m</strong></span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
