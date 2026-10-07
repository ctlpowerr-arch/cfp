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
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ModernSelect } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useAcademicYear } from '@/context/AcademicYearContext';
import {
  AttachmentCategory,
  InterventionReportAggregate,
  InterventionType,
  ReportStatus,
} from '../types/report.types';
import {
  interventionReportApi,
  ReportListItem,
  ReportListResponse,
  SecuritySelfTestResponse,
} from '../api/reportApiClient';
import { InterventionReportWizard } from './InterventionReportWizard';
import { generateInterventionReportPDF } from '../utils/reportPdfGenerator';

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  [ReportStatus.DRAFT]: {
    label: 'Brouillon',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotClass: 'bg-slate-400',
  },
  [ReportStatus.SUBMITTED]: {
    label: 'Soumis',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  [ReportStatus.UNDER_REVIEW]: {
    label: 'En cours d’évaluation',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-500',
  },
  [ReportStatus.CHANGES_REQUESTED]: {
    label: 'Corrections demandées',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    dotClass: 'bg-amber-500',
  },
  [ReportStatus.RESUBMITTED]: {
    label: 'Resoumis',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
  },
  [ReportStatus.APPROVED]: {
    label: 'Validé & Approuvé',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  [ReportStatus.ARCHIVED]: {
    label: 'Archivé',
    badgeClass: 'bg-slate-200 text-slate-800 border-slate-400',
    dotClass: 'bg-slate-600',
  },
};

const INTERVENTION_TYPE_LABELS: Record<InterventionType, string> = {
  MAINTENANCE: 'Maintenance Préventive / Curative',
  INSTALLATION: 'Installation & Mise en Service',
  DEPANNAGE: 'Dépannage & Réparation',
  DIAGNOSTIC: 'Diagnostic Technique',
  CHANTIER: 'Intervention Chantier / Terrain',
  LABORATOIRE: 'TP Laboratoire / Banc d’Essai',
  PROJET_TECHNIQUE: 'Projet Technique Intégré',
  AUDIT_SECURITE: 'Audit Technique & Sécurité',
};

export const InterventionReportsHub: React.FC = () => {
  const { user } = useAuth();
  const { selectedYear } = useAcademicYear();

  const [listData, setListData] = useState<ReportListResponse | null>(null);
  const [contextInfo, setContextInfo] = useState<any>(null);
  const [securityTest, setSecurityTest] = useState<SecuritySelfTestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingSecurity, setIsTestingSecurity] = useState(false);

  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [showArchitecturePanel, setShowArchitecturePanel] = useState(false);

  // Sélection & modales
  const [selectedAggregate, setSelectedAggregate] =
    useState<InterventionReportAggregate | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<
    'overview' | 'steps' | 'resources' | 'tests' | 'attachments' | 'evaluation' | 'audit'
  >('overview');

  // Wizard 10 étapes
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardEditingReportId, setWizardEditingReportId] = useState<string | undefined>(undefined);

  // Modal Correction Enseignant
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState(
    'Veuillez ajouter les photos après intervention et compléter les mesures du tableau de tests.'
  );

  // Modal Validation Enseignant
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [valTechScore, setValTechScore] = useState<number>(17);
  const [valMethodScore, setValMethodScore] = useState<number>(16);
  const [valSafetyScore, setValSafetyScore] = useState<number>(18);
  const [valRedacScore, setValRedacScore] = useState<number>(17);
  const [valFeedback, setValFeedback] = useState(
    'Rapport technique de très grande qualité. Méthode d’intervention rigoureuse et mesures conformes.'
  );

  // Modal Vue Photo Plein Écran
  const [zoomedPhoto, setZoomedPhoto] = useState<{
    url: string;
    title: string;
    category: string;
  } | null>(null);

  const fetchReportsAndContext = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ctxRes, listRes] = await Promise.all([
        interventionReportApi.getContext(),
        interventionReportApi.listReports({
          academicYear: selectedYear || 'ALL',
          status: statusFilter,
          interventionType: typeFilter,
          search: searchQuery,
        }),
      ]);
      setContextInfo(ctxRes);
      setListData(listRes);
    } catch (err: any) {
      toast.error(err?.message || 'Impossible de charger les rapports d’intervention.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    fetchReportsAndContext();
  }, [fetchReportsAndContext]);

  const handleOpenReportDetail = async (reportId: string) => {
    try {
      const agg = await interventionReportApi.getReportById(reportId);
      setSelectedAggregate(agg);
      setActiveDetailTab('overview');
    } catch (err: any) {
      toast.error(err?.message || 'Accès refusé à ce rapport.');
    }
  };

  const handleRunSecurityDiagnostics = async () => {
    try {
      setIsTestingSecurity(true);
      const res = await interventionReportApi.runSecuritySelfTest();
      setSecurityTest(res);
      setShowArchitecturePanel(true);
      if (res.allPassed) {
        toast.success(
          'Les 5 piliers de sécurité (Anti-IDOR, Périmètre Spécialité, États, Magic-Bytes, Anti-XSS) sont 100% validés !'
        );
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors du test de sécurité.');
    } finally {
      setIsTestingSecurity(false);
    }
  };

  const handleOpenNewReportWizard = () => {
    setWizardEditingReportId(undefined);
    setIsWizardOpen(true);
  };

  const handleOpenEditWizard = (reportId: string) => {
    setWizardEditingReportId(reportId);
    setIsWizardOpen(true);
  };

  const handleExportPDF = (agg: InterventionReportAggregate) => {
    try {
      generateInterventionReportPDF(agg);
      toast.success(`Export PDF généré pour le rapport ${agg.report.reportNumber}.`);
    } catch {
      toast.error('Échec de la génération du PDF.');
    }
  };

  const handleRequestCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAggregate) return;

    try {
      const updated = await interventionReportApi.evaluateReport(selectedAggregate.report.id, {
        decision: ReportStatus.CHANGES_REQUESTED,
        generalFeedback: correctionReason,
        improvementsRequired: correctionReason,
      });
      setSelectedAggregate(updated);
      setIsCorrectionModalOpen(false);
      toast.success(
        `Demande de correction transmise à l’étudiant (${selectedAggregate.report.studentName}).`
      );
      fetchReportsAndContext();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la demande de correction.');
    }
  };

  const handleApproveReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAggregate) return;

    try {
      const avg = Number(
        ((valTechScore + valMethodScore + valSafetyScore + valRedacScore) / 4).toFixed(2)
      );
      const updated = await interventionReportApi.evaluateReport(selectedAggregate.report.id, {
        decision: ReportStatus.APPROVED,
        scoreOn20: avg,
        technicalScoreOn20: valTechScore,
        methodScoreOn20: valMethodScore,
        safetyScoreOn20: valSafetyScore,
        redactionScoreOn20: valRedacScore,
        generalFeedback: valFeedback,
      });
      setSelectedAggregate(updated);
      setIsValidationModalOpen(false);
      toast.success(
        `🎉 Rapport ${selectedAggregate.report.reportNumber} validé avec la note de ${avg}/20 !`
      );
      fetchReportsAndContext();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la validation.');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await interventionReportApi.deleteReport(reportId);
      toast.success('Rapport supprimé.');
      if (selectedAggregate?.report.id === reportId) {
        setSelectedAggregate(null);
      }
      fetchReportsAndContext();
    } catch (err: any) {
      toast.error(err?.message || 'Suppression refusée.');
    }
  };

  const roleLabel =
    user?.role === 'student'
      ? 'Espace Étudiant • Mes Rapports d’Intervention'
      : user?.role === 'teacher'
      ? 'Espace Enseignant • Évaluation Pédagogique des Rapports'
      : 'Super Admin • Supervision Globale & Audit';

  return (
    <div className="space-y-6">
      {/* Wizard 10 Étapes Actif */}
      {isWizardOpen && (
        <InterventionReportWizard
          initialReportId={wizardEditingReportId}
          onClose={() => {
            setIsWizardOpen(false);
            fetchReportsAndContext();
          }}
          onSaved={(agg) => {
            setSelectedAggregate(agg);
            fetchReportsAndContext();
          }}
          onSubmitted={(agg) => {
            setSelectedAggregate(agg);
            setIsWizardOpen(false);
            fetchReportsAndContext();
          }}
        />
      )}

      {/* En-tête Principal */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Lock className="w-3.5 h-3.5" />
                {roleLabel}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-indigo-400 shrink-0" />
              {user?.role === 'teacher' ? "Évaluation des Rapports de mes Étudiants" : "Rapports d’Intervention — CFP-ITMC Douala"}
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl">
              {user?.role === 'teacher'
                ? "Consultez, évaluez et validez les rapports de travaux pratiques et chantiers soumis par vos étudiants."
                : "Suivi professionnel des interventions en atelier, laboratoire et chantier avec formulaire guidé en 10 étapes, photos Avant/Pendant/Après, auto-évaluation et génération de certificat PDF officiel."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(user?.role === 'student' || user?.role === 'admin' || (user as any)?.role === 'superadmin') && (
              <Button
                onClick={handleOpenNewReportWizard}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg text-xs"
              >
                <Plus className="w-4 h-4 mr-1.5" /> + NOUVEAU RAPPORT
              </Button>
            )}
          </div>
        </div>

        {/* Bandeau de Périmètre Résolu */}
        {contextInfo && (
          <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {contextInfo.studentProfile && user?.role === 'student' && (
              <>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-slate-400 block">Apprenant Connecté</span>
                  <span className="font-semibold text-white text-sm">
                    {contextInfo.studentProfile.name} ({contextInfo.studentProfile.matricule})
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-slate-400 block">Spécialité & Filière</span>
                  <span className="font-semibold text-indigo-300 text-sm">
                    {contextInfo.studentProfile.specialtyName} • {contextInfo.studentProfile.formation}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-slate-400 block">Enseignant Évaluateur</span>
                  <span className="font-semibold text-emerald-300 text-sm">
                    {contextInfo.studentProfile.assignedTeacherName} (Groupe{' '}
                    {contextInfo.studentProfile.classCode})
                  </span>
                </div>
              </>
            )}

            {contextInfo.teacherPerimeter && (
              <>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-slate-400 block">Enseignant Responsable</span>
                  <span className="font-semibold text-white text-sm">
                    {contextInfo.teacherPerimeter.teacherName}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-slate-400 block">Spécialités du Périmètre</span>
                  <span className="font-semibold text-indigo-300 text-sm">
                    {contextInfo.teacherPerimeter.rawSpecialties?.join(', ') || 'Toutes'}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-slate-400 block">Classes Rattachées</span>
                  <span className="font-semibold text-emerald-300 text-sm">
                    {contextInfo.teacherPerimeter.rawClasses?.join(', ') || 'Toutes les promotions'}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Matrice de sécurité Phase 1 / Phase 2 */}
      {showArchitecturePanel && securityTest && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Auto-Diagnostic Sécurité & Conformité MINEFOP
                </h3>
                <p className="text-xs text-slate-500">
                  Vérifications temps réel exécutées côté serveur à{' '}
                  {new Date(securityTest.executedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowArchitecturePanel(false)}
              className="text-slate-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {securityTest.checks.map((chk) => (
              <div
                key={chk.code}
                className={`p-3.5 rounded-xl border ${
                  chk.passed
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    {chk.code}
                  </span>
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-900 mb-1">{chk.label}</p>
                {chk.detail && (
                  <p className="text-[11px] text-slate-600 line-clamp-3">{chk.detail}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cartes KPI */}
      {listData && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Total Rapports</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {listData.stats.totalAccessible}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {listData.stats.totalHoursLogged}h d’atelier cumulées
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Brouillons</div>
            <div className="text-2xl font-bold text-slate-700 mt-1">
              {listData.stats.byStatus.DRAFT}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Autosave actif</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
            <div className="text-xs text-blue-700 font-medium">En attente d’évaluation</div>
            <div className="text-2xl font-bold text-blue-700 mt-1">
              {listData.stats.pendingTeacherActionCount}
            </div>
            <div className="text-[11px] text-blue-600 mt-1">Soumis & Resoumis</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
            <div className="text-xs text-amber-700 font-medium">Corrections demandées</div>
            <div className="text-2xl font-bold text-amber-700 mt-1">
              {listData.stats.byStatus.CHANGES_REQUESTED}
            </div>
            <div className="text-[11px] text-amber-600 mt-1">À retravailler</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
            <div className="text-xs text-emerald-700 font-medium">Validés & Approuvés</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">
              {listData.stats.byStatus.APPROVED}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">
              Moyenne :{' '}
              {listData.stats.averageScoreOn20 !== null
                ? `${listData.stats.averageScoreOn20}/20`
                : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Barre de Filtres avec ModernSelect */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par N° RPT-2026-..., titre, étudiant, matricule, client, spécialité..."
            className="pl-10 text-xs"
          />
        </div>

        <div className="w-full md:w-56">
          <ModernSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">📋 Tous les statuts</option>
            <option value={ReportStatus.DRAFT}>📝 Brouillons (DRAFT)</option>
            <option value={ReportStatus.SUBMITTED}>📨 Soumis (SUBMITTED)</option>
            <option value={ReportStatus.UNDER_REVIEW}>🔍 En révision (UNDER_REVIEW)</option>
            <option value={ReportStatus.CHANGES_REQUESTED}>⚠️ Corrections demandées</option>
            <option value={ReportStatus.RESUBMITTED}>🔄 Resoumis (RESUBMITTED)</option>
            <option value={ReportStatus.APPROVED}>✅ Validés (APPROVED)</option>
            <option value={ReportStatus.ARCHIVED}>🗄️ Archivés (ARCHIVED)</option>
          </ModernSelect>
        </div>

        <div className="w-full md:w-64">
          <ModernSelect
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">🔧 Tous types d’intervention</option>
            {Object.entries(INTERVENTION_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </ModernSelect>
        </div>

        <Button
          variant="outline"
          onClick={fetchReportsAndContext}
          className="shrink-0"
          title="Actualiser"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Grille Principale */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne Liste */}
        <div
          className={`${
            selectedAggregate ? 'lg:col-span-5' : 'lg:col-span-12'
          } space-y-3`}
        >
          {isLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              Chargement des rapports...
            </div>
          ) : !listData || listData.items.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
              <ClipboardList className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="font-semibold text-slate-800">
                Aucun rapport dans cette sélection ({selectedYear})
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Les rapports sont filtrés selon votre rôle et votre année académique.
              </p>
              {(user?.role === 'student' || user?.role === 'admin') && (
                <Button
                  size="sm"
                  onClick={handleOpenNewReportWizard}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white mt-2"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Créer mon premier rapport
                </Button>
              )}
            </div>
          ) : (
            listData.items.map((item: ReportListItem) => {
              const st = STATUS_CONFIG[item.status] || STATUS_CONFIG[ReportStatus.DRAFT];
              const isSelected = selectedAggregate?.report.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenReportDetail(item.id)}
                  className={`bg-white rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {item.reportNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        Rév. #{item.currentRevision}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${st.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dotClass}`} />
                      {st.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5 line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mb-3">
                    <span className="font-medium text-slate-800">
                      👨‍🎓 {item.studentName} ({item.studentMatricule})
                    </span>
                    <span className="text-indigo-700 font-medium">
                      🏷️ {item.specialtyName}
                    </span>
                    <span>🏢 {item.clientOrSite}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>{item.counts.steps} étapes</span>
                      <span>{item.counts.attachments} photos</span>
                      <span>{item.durationHours}h</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.latestScoreOn20 !== null && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          {item.latestScoreOn20}/20
                        </span>
                      )}
                      <span>{item.interventionDate}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Colonne Détail Agrégat */}
        {selectedAggregate && (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Header du rapport */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-indigo-100 text-indigo-900">
                      {selectedAggregate.report.reportNumber}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        STATUS_CONFIG[selectedAggregate.report.status].badgeClass
                      }`}
                    >
                      {STATUS_CONFIG[selectedAggregate.report.status].label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {INTERVENTION_TYPE_LABELS[selectedAggregate.report.interventionType]}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedAggregate.report.title}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Bouton Générer PDF */}
                  <Button
                    size="sm"
                    onClick={() => handleExportPDF(selectedAggregate)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> 📄 GÉNÉRER PDF
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAggregate(null)}
                    className="text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Apprenant</span>
                  <span className="font-semibold text-slate-800">
                    {selectedAggregate.report.studentName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Client / Site</span>
                  <span className="font-semibold text-indigo-700">
                    {selectedAggregate.report.clientOrSite}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Enseignant Référent</span>
                  <span className="font-semibold text-slate-800">
                    {selectedAggregate.report.assignedTeacherName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Horaires & Durée</span>
                  <span className="font-semibold text-slate-800">
                    {selectedAggregate.report.interventionDate} ({selectedAggregate.report.durationHours}h)
                  </span>
                </div>
              </div>

              {/* Boutons d'Action Métier (Enseignant / Étudiant) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: 'overview', label: 'Synthèse' },
                      { id: 'steps', label: `Étapes (${selectedAggregate.steps.length})` },
                      {
                        id: 'resources',
                        label: `Matériel & Outils (${
                          selectedAggregate.materials.length + selectedAggregate.tools.length
                        })`,
                      },
                      {
                        id: 'tests',
                        label: `Tests & Pannes (${
                          selectedAggregate.tests.length + selectedAggregate.difficulties.length
                        })`,
                      },
                      {
                        id: 'attachments',
                        label: `Photos (${selectedAggregate.attachments.length})`,
                      },
                      {
                        id: 'evaluation',
                        label: `Évaluation (${selectedAggregate.evaluations.length})`,
                      },
                      { id: 'audit', label: `Audit (${selectedAggregate.events.length})` },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDetailTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        activeDetailTab === tab.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {/* Actions Étudiant */}
                  {selectedAggregate.permissions.canEdit && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenEditWizard(selectedAggregate.report.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Modifier le rapport
                    </Button>
                  )}

                  {/* Actions Enseignant */}
                  {selectedAggregate.permissions.canRequestChanges && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsCorrectionModalOpen(true)}
                      className="border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> 🔄 DEMANDER UNE CORRECTION
                    </Button>
                  )}

                  {selectedAggregate.permissions.canApprove && (
                    <Button
                      size="sm"
                      onClick={() => setIsValidationModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ✅ VALIDER
                    </Button>
                  )}

                  {selectedAggregate.permissions.canDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteReport(selectedAggregate.report.id)}
                      className="text-red-600 hover:bg-red-50 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Contenu Tabs */}
            <div className="p-5 space-y-4 max-h-[640px] overflow-y-auto text-xs">
              {activeDetailTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 uppercase font-bold block mb-1">
                        Client & Contact
                      </span>
                      <p className="font-bold text-slate-900 text-sm">
                        {selectedAggregate.report.clientOrSite}
                      </p>
                      {selectedAggregate.report.clientPhone && (
                        <p className="text-slate-600">Tél: {selectedAggregate.report.clientPhone}</p>
                      )}
                      {selectedAggregate.report.clientAddress && (
                        <p className="text-slate-600">Adresse: {selectedAggregate.report.clientAddress}</p>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 uppercase font-bold block mb-1">
                        Lieu de l’intervention
                      </span>
                      <p className="font-bold text-slate-900 text-sm">
                        {selectedAggregate.report.location}
                      </p>
                      <p className="text-slate-600">
                        Horaires : {selectedAggregate.report.startTime || '08:30'} -{' '}
                        {selectedAggregate.report.endTime || '12:30'} ({selectedAggregate.report.durationHours}h)
                      </p>
                    </div>
                  </div>

                  {selectedAggregate.report.problemObserved && (
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                      <h4 className="font-bold text-amber-950 uppercase">
                        Symptôme / Problème Constaté
                      </h4>
                      <p className="text-amber-900 whitespace-pre-line">
                        {selectedAggregate.report.problemObserved}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                    <h4 className="font-bold text-slate-900 uppercase">
                      Contexte & Objectifs de l’intervention
                    </h4>
                    <p className="text-slate-700 whitespace-pre-line">
                      {selectedAggregate.report.contextAndObjective}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                    <h4 className="font-bold text-slate-900 uppercase">
                      Description Synthétique des Travaux
                    </h4>
                    <p className="text-slate-700 whitespace-pre-line">
                      {selectedAggregate.report.generalDescription}
                    </p>
                  </div>

                  {selectedAggregate.report.conclusion && (
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                      <h4 className="font-bold text-emerald-950 uppercase">
                        Bilan & Recommandations
                      </h4>
                      <p className="text-emerald-900 whitespace-pre-line">
                        {selectedAggregate.report.conclusion}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === 'steps' && (
                <div className="space-y-3">
                  {selectedAggregate.steps.map((st) => (
                    <div
                      key={st.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-700 uppercase">
                          Étape #{st.stepOrder} • [{st.phase}]
                        </span>
                        <span className="text-slate-500">{st.durationMinutes} min</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{st.title}</h4>
                      <p className="text-slate-700">{st.description}</p>
                      {st.technicalNotes && (
                        <div className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-600">
                          Observation : {st.technicalNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeDetailTab === 'resources' && (
                <div className="space-y-5">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">
                      Composants & Matériels ({selectedAggregate.materials.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedAggregate.materials.map((m) => (
                        <div
                          key={m.id}
                          className="p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{m.name}</span>{' '}
                            {m.reference && <span className="text-slate-500">({m.reference})</span>}
                          </div>
                          <span className="font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-800">
                            {m.quantity} {m.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">
                      Outillage & Instruments de Mesure ({selectedAggregate.tools.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedAggregate.tools.map((t) => (
                        <div
                          key={t.id}
                          className="p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{t.name}</span>{' '}
                            <span className="text-indigo-600 font-semibold">[{t.category}]</span>
                          </div>
                          <span className="text-emerald-700 font-medium">
                            {t.calibrationStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'tests' && (
                <div className="space-y-5">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">
                      Contrôles, Mesures & Essais ({selectedAggregate.tests.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedAggregate.tests.map((tst) => (
                        <div
                          key={tst.id}
                          className="p-3 rounded-xl border border-slate-200 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{tst.testName}</span>
                            <span
                              className={`px-2 py-0.5 rounded font-bold ${
                                tst.result === 'CONFORME'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tst.result === 'PARTIELLEMENT_CONFORME'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {tst.result}
                            </span>
                          </div>
                          <div className="text-slate-600">
                            Attendu : <strong>{tst.expectedValue}</strong> | Mesuré :{' '}
                            <strong>
                              {tst.measuredValue} {tst.unit}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">
                      Difficultés Rencontrées & Résolutions ({selectedAggregate.difficulties.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedAggregate.difficulties.map((d) => (
                        <div
                          key={d.id}
                          className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1"
                        >
                          <div className="font-bold text-amber-900">{d.problemEncountered}</div>
                          {d.rootCause && (
                            <div className="text-slate-700">
                              <strong>Cause :</strong> {d.rootCause}
                            </div>
                          )}
                          <div className="text-emerald-800">
                            <strong>Solution :</strong> {d.solutionApplied}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Galerie Photos */}
              {activeDetailTab === 'attachments' && (
                <div className="space-y-5">
                  {(['BEFORE', 'DURING', 'AFTER', 'SCHEMA', 'DOCUMENT'] as const).map((cat) => {
                    const catFiles = selectedAggregate.attachments.filter((a) => a.category === cat);
                    const catTitles: Record<string, string> = {
                      BEFORE: '📷 Photos AVANT Intervention',
                      DURING: '🔧 Photos PENDANT Intervention',
                      AFTER: '✨ Photos APRÈS Intervention',
                      SCHEMA: '📐 Schémas Techniques & Plans',
                      DOCUMENT: '📄 Documents Annexes',
                    };

                    return (
                      <div key={cat} className="space-y-2">
                        <span className="font-bold text-slate-900 block">
                          {catTitles[cat]} ({catFiles.length})
                        </span>

                        {catFiles.length === 0 ? (
                          <p className="text-slate-400 italic">Aucune preuve pour cette section.</p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {catFiles.map((att) => (
                              <div
                                key={att.id}
                                className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs cursor-pointer hover:border-indigo-400"
                                onClick={() =>
                                  setZoomedPhoto({
                                    url: att.downloadUrl,
                                    title: att.caption || att.originalName,
                                    category: att.category,
                                  })
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-900 truncate">
                                    {att.caption || att.originalName}
                                  </span>
                                  <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {Math.round(att.sizeBytes / 1024)} Ko • SHA-256 vérifié
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Évaluations */}
              {activeDetailTab === 'evaluation' && (
                <div className="space-y-4">
                  {selectedAggregate.evaluations.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500">
                      Rapport en attente d’évaluation par Dr. Jean-Paul Kamga.
                    </div>
                  ) : (
                    selectedAggregate.evaluations.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            Évalué par {ev.teacherName} (Rév. #{ev.revisionNumber})
                          </span>
                          {ev.scoreOn20 !== null && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                              {ev.scoreOn20}/20
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700">{ev.generalFeedback}</p>
                        {ev.strengths && (
                          <div className="text-emerald-700">
                            <strong>Points forts :</strong> {ev.strengths}
                          </div>
                        )}
                        {ev.improvementsRequired && (
                          <div className="text-amber-800">
                            <strong>Ajustements demandés :</strong> {ev.improvementsRequired}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Journal d'audit */}
              {activeDetailTab === 'audit' && (
                <div className="space-y-2.5">
                  <h4 className="font-bold text-slate-900 uppercase">
                    Journal d’Audit Immuable (`report_events`)
                  </h4>
                  {selectedAggregate.events.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
                    >
                      <div>
                        <span className="font-mono font-bold text-indigo-700 mr-2">
                          [{evt.action}]
                        </span>
                        <span className="font-semibold text-slate-800">
                          {evt.actorName} ({evt.actorRole})
                        </span>
                        <p className="text-slate-600 mt-0.5">{evt.details}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {new Date(evt.timestamp).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Demande de Correction (Enseignant) */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" /> Demander une Correction
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCorrectionModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleRequestCorrectionSubmit} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Le rapport passera au statut <strong>CHANGES_REQUESTED</strong>. L’étudiant recevra
                une notification immédiate et pourra apporter les modifications demandées.
              </p>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Motif & Instructions de correction *
                </label>
                <textarea
                  rows={4}
                  required
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCorrectionModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Transmettre la demande de correction
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Validation Enseignant */}
      {isValidationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Validation & Notation
                Officielle
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsValidationModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleApproveReportSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Note Technique (/20)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={valTechScore}
                    onChange={(e) => setValTechScore(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Méthode & Rigueur (/20)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={valMethodScore}
                    onChange={(e) => setValMethodScore(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Sécurité & EPI (/20)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={valSafetyScore}
                    onChange={(e) => setValSafetyScore(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Rédaction & Schémas (/20)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={valRedacScore}
                    onChange={(e) => setValRedacScore(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Appréciation pédagogique officielle *
                </label>
                <textarea
                  rows={3}
                  required
                  value={valFeedback}
                  onChange={(e) => setValFeedback(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsValidationModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Valider & Noter le Rapport
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Zoom Photo Plein Écran */}
      {zoomedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                [{zoomedPhoto.category}] {zoomedPhoto.title}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setZoomedPhoto(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] max-h-[550px]">
              <img
                src={zoomedPhoto.url}
                alt={zoomedPhoto.title}
                className="max-h-[500px] max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
