import React, { useState } from 'react';
import { ProfessionalReportsHub } from '@/modules/professional-reports/components/ProfessionalReportsHub';
import { InterventionReportsHub } from '@/modules/intervention-reports/components/InterventionReportsHub';
import { Badge } from '@/components/ui/badge';
import { Layers, Wrench } from 'lucide-react';

export default function InterventionReportsAdmin() {
  const [activeEngine, setActiveEngine] = useState<'professional' | 'intervention'>('professional');

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Switch Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-600 text-white font-bold text-[10px]">
            Super Admin
          </Badge>
          <span className="text-xs font-black text-slate-700 dark:text-slate-200">
            Gestion Globale des Rapports Pédagogiques
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveEngine('professional')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-1.5 flex-1 sm:flex-initial justify-center cursor-pointer ${
              activeEngine === 'professional'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Moteur 35 Spécialités (Phase 1)</span>
          </button>

          <button
            onClick={() => setActiveEngine('intervention')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-1.5 flex-1 sm:flex-initial justify-center cursor-pointer ${
              activeEngine === 'intervention'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Rapports d'Intervention</span>
          </button>
        </div>
      </div>

      {/* Main View */}
      {activeEngine === 'professional' ? <ProfessionalReportsHub /> : <InterventionReportsHub />}
    </div>
  );
}
