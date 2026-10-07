import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Award,
  Calendar,
  Clock,
  FileCheck,
  CheckCircle2,
  FileText,
  Download,
  Building,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModernSelect } from '@/components/ui/select';
import { ProfessionalReport } from '../types/professionalReport.types';
import { professionalReportApi } from '../api/professionalReportApiClient';
import { generateProfessionalReportPDF } from '../utils/professionalPdfGenerator';

export const StudentPortfolioView: React.FC<{ studentId?: string }> = ({ studentId }) => {
  const [reports, setReports] = useState<ProfessionalReport[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('2026-2027');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    professionalReportApi
      .fetchReports({ academicYear: selectedYear })
      .then((res) => {
        let list = res.reports || [];
        if (studentId) {
          list = list.filter((r) => r.studentId === studentId);
        }
        setReports(list);
      })
      .finally(() => setIsLoading(false));
  }, [selectedYear, studentId]);

  const approvedReports = reports.filter((r) => r.status === 'APPROVED');
  const totalHours = reports.reduce((sum, r) => sum + (r.durationHours || 0), 0);
  const averageGrade =
    approvedReports.length > 0
      ? (
          approvedReports.reduce((sum, r) => sum + (r.latestScoreOn20 || 0), 0) / approvedReports.length
        ).toFixed(1)
      : 'N/A';

  return (
    <div className="space-y-6">
      {/* Portfolio Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-amber-400">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-600 text-white font-mono text-[10px]">
                  PORTFOLIO PROFESSIONNEL
                </Badge>
                <Badge className="bg-slate-800 text-slate-300 text-[10px]">
                  Historique Académique
                </Badge>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                Dossier des Activités, Compétences & Preuves Métier
              </h2>
            </div>
          </div>

          <ModernSelect
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-auto bg-slate-800 text-white border-slate-700 h-10 text-xs font-bold"
          >
            <option value="2026-2027">Année Académique 2026–2027</option>
            <option value="2025-2026">Année Académique 2025–2026</option>
            <option value="2024-2025">Année Académique 2024–2025</option>
          </ModernSelect>
        </div>

        {/* Portfolio Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Rapports Enregistrés</p>
            <p className="text-xl font-black text-amber-400 mt-0.5">{reports.length}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Projets Validés</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">{approvedReports.length}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Heures Pratiques Cumulées</p>
            <p className="text-xl font-black text-indigo-300 mt-0.5">{totalHours} hrs</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Moyenne Générale</p>
            <p className="text-xl font-black text-amber-300 mt-0.5">{averageGrade} / 20</p>
          </div>
        </div>
      </div>

      {/* Reports Timeline */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
          Chronologie des Travaux {selectedYear}
        </h3>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Chargement du portfolio...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            Aucun rapport archivé pour cette année académique.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-100 text-indigo-800 border-none font-mono text-[10px]">
                      {rep.reportNumber}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {rep.specialtyName}
                    </Badge>
                    <Badge className="bg-slate-100 text-slate-700 text-[10px]">{rep.status}</Badge>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {rep.title}
                  </h4>

                  <p className="text-xs text-slate-500">
                    {rep.activityDate} • {rep.location} • {rep.durationHours}h
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {rep.latestScoreOn20 !== null && (
                    <Badge className="bg-emerald-600 text-white font-black text-xs px-3 py-1">
                      {rep.latestScoreOn20} / 20
                    </Badge>
                  )}

                  <Button
                    size="sm"
                    onClick={async () => {
                      const agg = await professionalReportApi.fetchReportById(rep.id);
                      generateProfessionalReportPDF(agg);
                    }}
                    className="h-9 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
