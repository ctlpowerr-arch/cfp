import React, { useState } from 'react';
import { ProfessionalReportsHub } from '@/modules/professional-reports/components/ProfessionalReportsHub';
import { InterventionReportsHub } from '@/modules/intervention-reports/components/InterventionReportsHub';
import { Badge } from '@/components/ui/badge';
import { Layers, Wrench } from 'lucide-react';

export default function InterventionReportsTeacher() {
  const [activeEngine, setActiveEngine] = useState<'professional' | 'intervention'>('professional');

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Switch Bar - 100% Responsive */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-indigo-600 text-white font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-lg shrink-0">
            Espace Enseignant
          </Badge>
          <h2 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">
            Évaluation des Travaux Pratiques & Projets
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveEngine('professional')}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer ${
              activeEngine === 'professional'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">Rapports Professionnels (35 Spécialités)</span>
          </button>

          <button
            onClick={() => setActiveEngine('intervention')}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer ${
              activeEngine === 'intervention'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
            }`}
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span className="truncate">Rapports d'Intervention</span>
          </button>
        </div>
      </div>

      {/* Main View */}
      {activeEngine === 'professional' ? <ProfessionalReportsHub /> : <InterventionReportsHub />}
    </div>
  );
}
