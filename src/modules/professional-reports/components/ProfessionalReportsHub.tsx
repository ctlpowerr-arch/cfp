import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Wrench,
  Layers,
  Award,
  Upload,
  Send,
  Eye,
  Lock,
  History,
  Activity,
  Trash2,
  RefreshCw,
  Check,
  X,
  FolderArchive,
  Camera,
  Sparkles,
  UserCheck,
  Building2,
  Calendar,
  Download,
  Edit3,
  RotateCcw,
  Maximize2,
  Filter,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ModernSelect } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useAcademicYear } from '@/context/AcademicYearContext';
import {
  ProfessionalReport,
  ProfessionalReportAggregate,
  ProfessionalReportStatus,
  ReportTemplate,
  SPECIALTY_CATEGORY_CONFIG,
} from '../types/professionalReport.types';
import {
  professionalReportApi,
  SecuritySelfTestResponse,
} from '../api/professionalReportApiClient';
import {
  OFFICIAL_SPECIALTIES_LIST,
  SpecialtyDefinition,
  getTemplateForSpecialty,
} from '../templates/specialtyTemplatesCatalog';
import { generateProfessionalReportPDF } from '../utils/professionalPdfGenerator';
import { AdaptiveReportWizard } from './AdaptiveReportWizard';
import { AdaptiveReportDetailView } from './AdaptiveReportDetailView';
import { StudentPortfolioView } from './StudentPortfolioView';
import { AdminAllReportsView } from './AdminAllReportsView';
import { useTeacherAdminData } from '../hooks/useTeacherAdminData';

const STATUS_CONFIG: Record<
  ProfessionalReportStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  [ProfessionalReportStatus.DRAFT]: {
    label: 'Brouillon',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotClass: 'bg-slate-400',
  },
  [ProfessionalReportStatus.SUBMITTED]: {
    label: 'Soumis',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  [ProfessionalReportStatus.UNDER_REVIEW]: {
    label: 'En évaluation',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-500',
  },
  [ProfessionalReportStatus.CHANGES_REQUESTED]: {
    label: 'Corrections demandées',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    dotClass: 'bg-amber-500',
  },
  [ProfessionalReportStatus.RESUBMITTED]: {
    label: 'Resoumis',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
  },
  [ProfessionalReportStatus.APPROVED]: {
    label: 'Validé & Approuvé',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  [ProfessionalReportStatus.ARCHIVED]: {
    label: 'Archivé',
    badgeClass: 'bg-slate-200 text-slate-800 border-slate-400',
    dotClass: 'bg-slate-600',
  },
};

export const ProfessionalReportsHub: React.FC<{ student?: any }> = ({ student }) => {
  const { user } = useAuth();
  const { selectedYear } = useAcademicYear();

  // Role detection
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin' || (user as any)?.role === 'superadmin';

  // Données de configuration réelles attribuées par l'Admin pour l'enseignant
  const {
    teacherProfile,
    assignedSpecialties,
    assignedModules,
    assignedClasses,
    teacherStudents,
  } = useTeacherAdminData();

  // State des rapports et catalogue
  const [reportsList, setReportsList] = useState<ProfessionalReport[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [selectedSpecialtyForCatalog, setSelectedSpecialtyForCatalog] = useState<string>('plomberie');
  const [activeCatalogTemplate, setActiveCatalogTemplate] = useState<ReportTemplate | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSelfTesting, setIsSelfTesting] = useState(false);
  const [selfTestResult, setSelfTestResult] = useState<SecuritySelfTestResponse | null>(null);

  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('ALL');

  // Navigation principale
  const [mainTab, setMainTab] = useState<'reports' | 'portfolio' | 'admin_hierarchy' | 'catalog' | 'architecture'>('reports');

  // Active Wizard modal for editing
  const [activeWizardAggregate, setActiveWizardAggregate] = useState<ProfessionalReportAggregate | null>(null);

  // Active Detail View modal for evaluation / consultation
  const [selectedReportAggregate, setSelectedReportAggregate] = useState<ProfessionalReportAggregate | null>(null);

  // Modal de création rapide
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createSpecialtyId, setCreateSpecialtyId] = useState('plomberie');
  const [createTitle, setCreateTitle] = useState('');
  const [createActivityType, setCreateActivityType] = useState('TP_ATELIER');

  // Chargement initial
  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await professionalReportApi.fetchReports({
        status: statusFilter,
        category: categoryFilter,
        specialtyId: specialtyFilter,
        search: searchQuery,
        academicYear: selectedYear || undefined,
      });
      setReportsList(res.reports || []);
      setTotalReports(res.total || 0);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des rapports professionnels.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, categoryFilter, specialtyFilter, searchQuery, selectedYear]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Configuration automatique de la spécialité pour l'étudiant connecté
  useEffect(() => {
    if (isStudent && student?.specialty) {
      const matched = getTemplateForSpecialty(student.specialty);
      if (matched) {
        setCreateSpecialtyId(matched.specialtyId);
        setSpecialtyFilter(matched.specialtyId);
      }
    }
  }, [isStudent, student]);

  // Chargement du template dans le catalogue
  useEffect(() => {
    if (selectedSpecialtyForCatalog) {
      professionalReportApi
        .fetchTemplateBySpecialty(selectedSpecialtyForCatalog)
        .then((tpl) => setActiveCatalogTemplate(tpl))
        .catch(() => {});
    }
  }, [selectedSpecialtyForCatalog]);

  // Auto-Diagnostic de Sécurité
  const handleRunSelfTest = async () => {
    setIsSelfTesting(true);
    try {
      const result = await professionalReportApi.runSecuritySelfTest();
      setSelfTestResult(result);
      toast.success('Auto-diagnostic exécuté avec succès : Moteur validé 100% !');
    } catch (err: any) {
      toast.error('Erreur lors de l’auto-diagnostic.');
    } finally {
      setIsSelfTesting(false);
    }
  };

  // Ouvrir les détails d'un rapport ou le wizard selon les permissions
  const handleOpenReport = async (reportId: string) => {
    try {
      const agg = await professionalReportApi.fetchReportById(reportId);
      if (agg.permissions.canEdit) {
        setActiveWizardAggregate(agg);
      } else {
        setSelectedReportAggregate(agg);
      }
    } catch (err: any) {
      toast.error(err.message || 'Impossible d’ouvrir ce rapport.');
    }
  };

  // Créer un rapport
  const handleCreateReport = async () => {
    if (!createTitle.trim()) {
      toast.error('Veuillez saisir un titre pour l’activité.');
      return;
    }
    try {
      const spec = OFFICIAL_SPECIALTIES_LIST.find((s) => s.id === createSpecialtyId);
      const res = await professionalReportApi.createReport({
        title: createTitle,
        specialtyId: createSpecialtyId,
        specialtyName: spec?.name || 'Spécialité',
        activityType: createActivityType,
        academicYear: selectedYear || '2026-2027',
      });
      toast.success(`Rapport créé avec succès sous le numéro ${res.report.reportNumber} !`);
      setIsCreateModalOpen(false);
      setCreateTitle('');
      loadReports();
      setActiveWizardAggregate(res);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner - Engine Title */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-amber-400 shrink-0" />
              <span>
                {isStudent ? '📋 Mes Rapports Professionnels' : isTeacher ? '📋 Rapports de mes Étudiants' : '📚 Tous les Rapports du Centre'}
              </span>
            </h1>

            <p className="text-indigo-200 text-xs sm:text-sm font-medium leading-relaxed">
              Moteur universel adaptatif : formulaire guidé en 10 étapes, auto-sauvegarde dynamique, preuves visuelles par catégories, portfolio d’apprenant et visas d’évaluation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isStudent && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                + Nouveau Rapport
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setMainTab('reports')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            mainTab === 'reports'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Rapports d'Activité ({totalReports})</span>
        </button>

        <button
          onClick={() => setMainTab('portfolio')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            mainTab === 'portfolio'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50'
          }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>📂 Portfolio Professionnel</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setMainTab('admin_hierarchy')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              mainTab === 'admin_hierarchy'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>📚 Tous les Rapports (Super Admin)</span>
          </button>
        )}

        {!isTeacher && !isStudent && (
          <button
            onClick={() => setMainTab('catalog')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              mainTab === 'catalog'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Catalogue des 35 Modèles</span>
          </button>
        )}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1 : LISTE DES RAPPORTS AVEC FILTRES ET ACCÈS RAPIDE */}
      {/* ==================================================================== */}
      {mainTab === 'reports' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre, matricule, numéro..."
                className="pl-9 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            <ModernSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">📁 Toutes les catégories (4)</option>
              <option value="BATIMENT_CONSTRUCTION">🏗️ Bâtiment & Travaux</option>
              <option value="INDUSTRIE_MECANIQUE_ENERGIE">⚡ Industrie & Énergie</option>
              <option value="INFORMATIQUE_DIGITAL_COMMUNICATION">💻 Informatique & Digital</option>
              <option value="ADMINISTRATION_COMMERCE_GESTION">📊 Administration & Gestion</option>
            </ModernSelect>

            {!isStudent && (
              <ModernSelect value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
                <option value="ALL">
                  {isTeacher
                    ? `🎓 Mes Filières / Spécialités Assignées (${assignedSpecialties.length || 'Admin'})`
                    : '🎓 Toutes les spécialités (35)'}
                </option>
                {isTeacher && assignedSpecialties.length > 0
                  ? assignedSpecialties.map((specName, idx) => {
                      const match = OFFICIAL_SPECIALTIES_LIST.find(
                        (s) => s.name.toLowerCase() === specName.toLowerCase() || s.id === specName
                      );
                      return (
                        <option key={idx} value={match ? match.id : specName}>
                          {match ? `${match.icon} ${match.name}` : `🎓 ${specName}`}
                        </option>
                      );
                    })
                  : OFFICIAL_SPECIALTIES_LIST.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.icon} {spec.name}
                      </option>
                    ))}
              </ModernSelect>
            )}

            <ModernSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">📋 Tous les statuts</option>
              <option value="DRAFT">📝 Brouillons</option>
              <option value="SUBMITTED">📤 Soumis</option>
              <option value="UNDER_REVIEW">⏱️ En évaluation</option>
              <option value="CHANGES_REQUESTED">🔄 Corrections demandées</option>
              <option value="APPROVED">✅ Validés & Approuvés</option>
            </ModernSelect>
          </div>

          {/* Reports Grid */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-indigo-600" />
              <p className="font-bold text-sm">Chargement des rapports professionnels...</p>
            </div>
          ) : reportsList.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-black text-slate-700 dark:text-slate-200">
                Aucun rapport professionnel trouvé pour ces filtres.
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Créez un nouveau rapport ou ajustez vos critères de recherche.
              </p>
              {isStudent && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-2 h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  + Créer un Rapport
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportsList.map((rep) => {
                const statusInfo = STATUS_CONFIG[rep.status] || STATUS_CONFIG[ProfessionalReportStatus.DRAFT];

                return (
                  <div
                    key={rep.id}
                    onClick={() => handleOpenReport(rep.id)}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="font-mono font-bold text-[10px] text-indigo-700 dark:text-indigo-300 border-indigo-200">
                          {rep.reportNumber}
                        </Badge>
                        <Badge className={`text-[10px] font-black uppercase border ${statusInfo.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusInfo.dotClass}`} />
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {rep.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {rep.summaryDescription || rep.problemOrContext || 'Documentation de l’activité pratique...'}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          🎓 {rep.studentName}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{rep.studentMatricule}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px] border-none">
                          {rep.specialtyName}
                        </Badge>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{rep.durationHours}h</span>
                      </div>

                      {rep.latestScoreOn20 !== null && (
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                          <span className="text-emerald-800 dark:text-emerald-300 font-black text-xs">
                            Note Officielle
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">
                            {rep.latestScoreOn20} / 20
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2 : PORTFOLIO PROFESSIONNEL DE L'ÉTUDIANT */}
      {/* ==================================================================== */}
      {mainTab === 'portfolio' && <StudentPortfolioView studentId={isStudent ? user?.id : undefined} />}

      {/* ==================================================================== */}
      {/* TAB 3 : TOUS LES RAPPORTS (VUE HIÉRARCHIQUE SUPER ADMIN) */}
      {/* ==================================================================== */}
      {mainTab === 'admin_hierarchy' && <AdminAllReportsView />}

      {/* ==================================================================== */}
      {/* TAB 4 : CATALOGUE DES 35 MODÈLES ADAPTATIFS */}
      {/* ==================================================================== */}
      {mainTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu des 35 spécialités */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 max-h-[750px] overflow-y-auto">
            <h2 className="text-sm font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider px-2">
              Les 35 Spécialités Officielles
            </h2>

            <div className="space-y-1.5">
              {OFFICIAL_SPECIALTIES_LIST.map((spec) => {
                const isSelected = selectedSpecialtyForCatalog === spec.id;
                return (
                  <button
                    key={spec.id}
                    onClick={() => setSelectedSpecialtyForCatalog(spec.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{spec.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{spec.name}</p>
                        <p className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          Code: {spec.code}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inspecteur du Template */}
          <div className="lg:col-span-2 space-y-4">
            {activeCatalogTemplate ? (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{activeCatalogTemplate.icon}</span>
                      <span>{activeCatalogTemplate.title}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeCatalogTemplate.description}
                    </p>
                  </div>

                  {isStudent && (
                    <Button
                      onClick={() => {
                        setCreateSpecialtyId(activeCatalogTemplate.specialtyId);
                        setCreateTitle(`Rapport d'activité — ${activeCatalogTemplate.specialtyName}`);
                        setIsCreateModalOpen(true);
                      }}
                      className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0"
                    >
                      + Utiliser ce Modèle
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Sections & Champs Spécifiques
                  </h3>

                  {activeCatalogTemplate.sections.map((sec) => (
                    <div key={sec.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                      <p className="text-xs font-black text-slate-900 dark:text-white">{sec.title}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sec.fields.map((fld) => (
                          <div key={fld.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{fld.label}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Clé: {fld.key}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODALS : WIZARD DE CRÉATION/ÉDITION & DETAIL VIEW */}
      {/* ==================================================================== */}
      {activeWizardAggregate && (
        <AdaptiveReportWizard
          report={activeWizardAggregate.report}
          template={activeWizardAggregate.template}
          onSaveSuccess={loadReports}
          onSubmitSuccess={loadReports}
          onClose={() => setActiveWizardAggregate(null)}
        />
      )}

      {selectedReportAggregate && (
        <AdaptiveReportDetailView
          aggregate={selectedReportAggregate}
          onRefresh={loadReports}
          onClose={() => setSelectedReportAggregate(null)}
        />
      )}

      {/* Modal de création rapide */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Nouveau Rapport d'Activité
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {!isStudent ? (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Spécialité / Filière Métier (35)
                  </label>
                  <ModernSelect value={createSpecialtyId} onChange={(e) => setCreateSpecialtyId(e.target.value)}>
                    {OFFICIAL_SPECIALTIES_LIST.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name} ({s.code})
                      </option>
                    ))}
                  </ModernSelect>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Filière Activée</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    🎓 {student?.specialty || "Génie Logiciel"} (Configuration Automatique)
                  </span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Type d'Activité
                </label>
                <ModernSelect value={createActivityType} onChange={(e) => setCreateActivityType(e.target.value)}>
                  <option value="TP_ATELIER">🧪 Travaux Pratiques & Laboratoire</option>
                  <option value="CHANTIER_TERRAIN">🏗️ Intervention Chantier / Mission Extérieure</option>
                  <option value="PROJET_INTEGRE">🎯 Projet Technique de Synthèse</option>
                  <option value="STAGE_ENTREPRISE">🏢 Stage & Immersion Professionnelle</option>
                  <option value="MAINTENANCE_CURATIVE">🔧 Dépannage & Maintenance</option>
                </ModernSelect>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Objet / Titre de l'Activité
                </label>
                <Input
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Ex: Raccordement sanitaire cuivre, Diagnostic panne moteur..."
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="h-10 px-4 rounded-xl text-xs font-bold"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateReport}
                className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase"
              >
                Créer & Ouvrir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
