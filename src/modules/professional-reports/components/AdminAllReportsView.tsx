import React, { useState, useEffect } from 'react';
import {
  Building2,
  FolderArchive,
  Layers,
  Search,
  ChevronRight,
  UserCheck,
  FileText,
  Download,
  Filter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModernSelect } from '@/components/ui/select';
import {
  ProfessionalReport,
  SpecialtyCategory,
  SPECIALTY_CATEGORY_CONFIG,
} from '../types/professionalReport.types';
import { OFFICIAL_SPECIALTIES_LIST } from '../templates/specialtyTemplatesCatalog';
import { professionalReportApi } from '../api/professionalReportApiClient';
import { generateProfessionalReportPDF } from '../utils/professionalPdfGenerator';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';

export const AdminAllReportsView: React.FC = () => {
  const [reports, setReports] = useState<ProfessionalReport[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    professionalReportApi
      .fetchReports({
        category: selectedCategory,
        specialtyId: selectedSpecialty,
        search: searchQuery,
      })
      .then((res) => setReports(res.reports || []))
      .finally(() => setIsLoading(false));
  }, [selectedCategory, selectedSpecialty, searchQuery]);

  // Groupement hiérarchique par Catégorie -> Spécialité
  const categoriesList: SpecialtyCategory[] = [
    'BATIMENT_CONSTRUCTION',
    'INDUSTRIE_MECANIQUE_ENERGIE',
    'INFORMATIQUE_DIGITAL_COMMUNICATION',
    'ADMINISTRATION_COMMERCE_GESTION',
  ];

  return (
    <div className="space-y-6">
      {/* Admin Title Bar */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <Layers className="w-8 h-8 text-amber-400" />
          <div>
            <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
              Super Admin Console & Analytiques
            </Badge>
            <h2 className="text-xl font-black text-white mt-1">
              📚 Vue Hiérarchique & Statistiques de Tous les Rapports du Centre
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Supervision globale des 35 spécialités : statistiques d'évolution, répartition par statut/catégorie et filtrage hiérarchique.
        </p>
      </div>

      {/* DASHBOARD ANALYTIQUE 4 GRAPHIQUES POUR LE SUPER ADMIN */}
      <AdminAnalyticsDashboard reports={reports} />

      {/* Hierarchy Category Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => setSelectedCategory('ALL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700'
          }`}
        >
          <p className="font-black text-xs">📁 Toutes les Catégories</p>
          <p className="text-[10px] mt-1 opacity-80">35 spécialités au total</p>
        </div>

        {categoriesList.map((catKey) => {
          const cfg = SPECIALTY_CATEGORY_CONFIG[catKey];
          const count = reports.filter((r) => r.category === catKey).length;
          const isSelected = selectedCategory === catKey;

          return (
            <div
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{cfg.icon}</span>
                <Badge className="bg-white/20 text-white border-none font-bold text-[10px]">
                  {count} rapport(s)
                </Badge>
              </div>
              <p className="font-black text-xs mt-2 line-clamp-1">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par étudiant, spécialité, classe..."
            className="pl-9 h-10 rounded-xl text-xs"
          />
        </div>

        <ModernSelect
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="w-full sm:w-64 h-10 text-xs font-bold"
        >
          <option value="ALL">🎓 Sélectionner une spécialité (35)</option>
          {OFFICIAL_SPECIALTIES_LIST.map((spec) => (
            <option key={spec.id} value={spec.id}>
              {spec.icon} {spec.name}
            </option>
          ))}
        </ModernSelect>
      </div>

      {/* Reports Table */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Chargement...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">Aucun rapport trouvé.</div>
        ) : (
          <div className="space-y-2">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-600 text-white font-mono text-[10px]">
                      {rep.reportNumber}
                    </Badge>
                    <span className="font-bold text-slate-900 dark:text-white">{rep.studentName}</span>
                    <span className="text-slate-400 font-mono">({rep.studentMatricule})</span>
                  </div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">{rep.title}</p>
                  <p className="text-[10px] text-slate-400">
                    {rep.specialtyName} • Classe {rep.classCode} • {rep.academicYear} • Statut : [{rep.status}]
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={async () => {
                    const agg = await professionalReportApi.fetchReportById(rep.id);
                    generateProfessionalReportPDF(agg);
                  }}
                  className="h-8 px-3 rounded-lg bg-slate-900 text-white text-[11px] font-bold shrink-0 self-end sm:self-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  PDF
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
