'use client';

import React from 'react';
import { ShieldCheck, Award, Users, Flame, Sparkles } from 'lucide-react';

export const TeamBadge: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-purple-950/60 border-y border-white/10 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Hackathon Identity */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/40 text-amber-300 font-semibold uppercase tracking-wider text-[11px]">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            Ignite 1% Hackathon
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 font-medium hidden sm:inline flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            Theme: Open Innovation AI
          </span>
        </div>

        {/* Center: Team Credits */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-3.5 py-1">
          <div className="flex items-center gap-1 text-slate-300 font-medium">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Team:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sky-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
              Kaartikeya <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">Leader</span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-200">Sneha</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-200">Krushna</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-200">Raksh</span>
          </div>
        </div>

        {/* Right: Community & Partners */}
        <div className="hidden lg:flex items-center gap-2 text-slate-400">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Ignition in AI Era • Student Tech & Careers • NxtGenSec</span>
        </div>
      </div>
    </div>
  );
};
