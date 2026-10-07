import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Save,
  Send,
  Upload,
  Camera,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  Layers,
  ShieldCheck,
  FileText,
  User,
  Building2,
  Phone,
  MapPin,
  Sparkles,
  HelpCircle,
  X,
  Eye,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ModernSelect } from '@/components/ui/select';
import {
  AttachmentCategory,
  CompetencyLevel,
  DifficultySeverity,
  InterventionReportAggregate,
  InterventionType,
  ReportAttachment,
  ReportCompetency,
  ReportDifficulty,
  ReportMaterial,
  ReportStatus,
  ReportStep,
  ReportTest,
  ReportTool,
  SafetyChecklistState,
  StepPhase,
  TestResultStatus,
  ToolCategory,
} from '../types/report.types';
import { interventionReportApi } from '../api/reportApiClient';
import { getCompetenciesForSpecialty } from '../utils/competenciesCatalog';

interface InterventionReportWizardProps {
  initialReportId?: string;
  onClose: () => void;
  onSaved?: (aggregate: InterventionReportAggregate) => void;
  onSubmitted?: (aggregate: InterventionReportAggregate) => void;
}

const WIZARD_STEPS = [
  { step: 1, title: 'Infos Générales', subtitle: 'Identité & Horaires' },
  { step: 2, title: 'Client & Lieu', subtitle: 'Localisation' },
  { step: 3, title: 'Objet & Objectifs', subtitle: 'Problème constaté' },
  { step: 4, title: 'Matériel & Outils', subtitle: 'Composants & EPI' },
  { step: 5, title: 'Travaux Réalisés', subtitle: 'Étapes détaillées' },
  { step: 6, title: 'Difficultés', subtitle: 'Pannes & Solutions' },
  { step: 7, title: 'Sécurité & Tests', subtitle: 'Contrôles & VAT' },
  { step: 8, title: 'Photos & Preuves', subtitle: 'Avant / Pendant / Après' },
  { step: 9, title: 'Compétences & Bilan', subtitle: 'Auto-évaluation' },
  { step: 10, title: 'Vérification', subtitle: 'Validation finale' },
];

const INTERVENTION_TYPE_OPTIONS: Array<{ value: InterventionType; label: string }> = [
  { value: 'MAINTENANCE', label: '🔧 Maintenance Préventive / Curative' },
  { value: 'INSTALLATION', label: '📦 Installation & Mise en Service' },
  { value: 'DEPANNAGE', label: '⚡ Dépannage & Diagnostic de Panne' },
  { value: 'DIAGNOSTIC', label: '🔍 Diagnostic & Expertise Technique' },
  { value: 'CHANTIER', label: '🏗️ Intervention Chantier / Gros Œuvre' },
  { value: 'LABORATOIRE', label: '🧪 TP Laboratoire / Banc d’Essai' },
  { value: 'PROJET_TECHNIQUE', label: '🎯 Projet Technique Intégré' },
  { value: 'AUDIT_SECURITE', label: '🛡️ Audit Technique & Cybersécurité' },
];

export const InterventionReportWizard: React.FC<InterventionReportWizardProps> = ({
  initialReportId,
  onClose,
  onSaved,
  onSubmitted,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [reportId, setReportId] = useState<string | null>(initialReportId || null);
  const [reportNumber, setReportNumber] = useState<string>('');
  const [reportVersion, setReportVersion] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Étape 1 : Infos Générales & Préremplissage
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    matricule: '',
    specialty: '',
    formation: '',
    classCode: '',
    academicYear: '',
    teacherName: '',
  });
  const [interventionDate, setInterventionDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [startTime, setStartTime] = useState<string>('08:30');
  const [endTime, setEndTime] = useState<string>('12:30');
  const [durationHours, setDurationHours] = useState<number>(4);

  // Étape 2 : Client & Lieu
  const [clientOrSite, setClientOrSite] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientAddress, setClientAddress] = useState<string>('Douala, Cameroun');
  const [location, setLocation] = useState<string>('Atelier Technique CFP-ITMC (Logpom)');
  const [interventionType, setInterventionType] = useState<InterventionType>('MAINTENANCE');

  // Étape 3 : Objet & Objectifs
  const [title, setTitle] = useState<string>('');
  const [problemObserved, setProblemObserved] = useState<string>('');
  const [contextAndObjective, setContextAndObjective] = useState<string>('');
  const [generalDescription, setGeneralDescription] = useState<string>('');

  // Étape 4 : Matériel & Outils
  const [materials, setMaterials] = useState<ReportMaterial[]>([]);
  const [tools, setTools] = useState<ReportTool[]>([]);

  // Étape 5 : Étapes chronologiques
  const [steps, setSteps] = useState<ReportStep[]>([
    {
      id: `stp_init_1`,
      reportId: '',
      stepOrder: 1,
      phase: 'PREPARATION',
      title: 'Préparation du poste et consignation de sécurité',
      description: 'Mise en place des EPI, contrôle visuel et vérification de la disponibilité des outils.',
      durationMinutes: 30,
      technicalNotes: '',
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Étape 6 : Difficultés
  const [difficulties, setDifficulties] = useState<ReportDifficulty[]>([]);

  // Étape 7 : Sécurité & Tests
  const [safetyMeasures, setSafetyMeasures] = useState<string>(
    'Port des EPI réglementaires, consignation du système et respect des procédures de sécurité.'
  );
  const [safetyChecklist, setSafetyChecklist] = useState<SafetyChecklistState>({
    epiGlasses: true,
    epiGloves: true,
    epiHelmet: true,
    epiShoes: true,
    lockoutTagout: true,
    areaSignage: true,
    voltageFreeCheck: true,
    emergencyStopChecked: true,
    rulesApplied: 'Normes de sécurité d’atelier CFP-ITMC',
    observations: 'Aucun incident à signaler.',
  });
  const [tests, setTests] = useState<ReportTest[]>([
    {
      id: 'tst_init_1',
      reportId: '',
      testName: 'Contrôle visuel et mécanique initial',
      parameterMeasured: 'État général',
      expectedValue: 'Conforme',
      measuredValue: 'Conforme',
      unit: '',
      result: 'CONFORME',
      observations: 'Bon état général.',
      createdAt: new Date().toISOString(),
    },
  ]);

  // Étape 8 : Photos & Preuves
  const [attachments, setAttachments] = useState<Array<ReportAttachment & { downloadUrl: string }>>([]);
  const [uploadCategory, setUploadCategory] = useState<AttachmentCategory>('BEFORE');
  const [uploadCaption, setUploadCaption] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Étape 9 : Compétences & Auto-évaluation
  const [availableSpecialtyCompetencies, setAvailableSpecialtyCompetencies] = useState<
    Array<{ code: string; label: string; domain: string }>
  >([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState<ReportCompetency[]>([]);
  const [selfEvaluation, setSelfEvaluation] = useState({
    autonomyScore: 4,
    technicalMasteryScore: 4,
    safetyComplianceScore: 5,
    learned: '',
    succeeded: '',
    difficultiesFaced: '',
    improvementsGoal: '',
    studentComment: '',
  });
  const [conclusion, setConclusion] = useState<string>('');

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calcul automatique de la durée à partir de startTime et endTime
  useEffect(() => {
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
        const totalMinutes = eh * 60 + em - (sh * 60 + sm);
        if (totalMinutes > 0) {
          setDurationHours(Number((totalMinutes / 60).toFixed(1)));
        }
      }
    }
  }, [startTime, endTime]);

  // Initialisation du contexte et préremplissage
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const ctxRes = await interventionReportApi.getContext();
        if (ctxRes.studentProfile) {
          setStudentInfo({
            name: ctxRes.studentProfile.name,
            matricule: ctxRes.studentProfile.matricule,
            specialty: ctxRes.studentProfile.specialtyName,
            formation: ctxRes.studentProfile.formation,
            classCode: ctxRes.studentProfile.classCode,
            academicYear: ctxRes.studentProfile.academicYear,
            teacherName: ctxRes.studentProfile.assignedTeacherName,
          });

          const catalog = getCompetenciesForSpecialty(ctxRes.studentProfile.specialtyName);
          setAvailableSpecialtyCompetencies(catalog);
        }

        if (initialReportId) {
          const rep = await interventionReportApi.getReportById(initialReportId);
          setReportId(rep.report.id);
          setReportNumber(rep.report.reportNumber);
          setReportVersion(rep.report.version);
          setTitle(rep.report.title);
          setInterventionType(rep.report.interventionType);
          setInterventionDate(rep.report.interventionDate);
          setStartTime(rep.report.startTime || '08:30');
          setEndTime(rep.report.endTime || '12:30');
          setDurationHours(rep.report.durationHours || 4);
          setClientOrSite(rep.report.clientOrSite);
          setClientPhone(rep.report.clientPhone || '');
          setClientAddress(rep.report.clientAddress || 'Douala, Cameroun');
          setLocation(rep.report.location);
          setProblemObserved(rep.report.problemObserved || '');
          setContextAndObjective(rep.report.contextAndObjective);
          setGeneralDescription(rep.report.generalDescription);
          setSafetyMeasures(rep.report.safetyMeasures);
          if (rep.report.safetyChecklist) setSafetyChecklist(rep.report.safetyChecklist);
          setConclusion(rep.report.conclusion);
          if (rep.report.selfEvaluation) {
            setSelfEvaluation({
              autonomyScore: rep.report.selfEvaluation.autonomyScore || 4,
              technicalMasteryScore: rep.report.selfEvaluation.technicalMasteryScore || 4,
              safetyComplianceScore: rep.report.selfEvaluation.safetyComplianceScore || 5,
              learned: rep.report.selfEvaluation.learned || '',
              succeeded: rep.report.selfEvaluation.succeeded || '',
              difficultiesFaced: rep.report.selfEvaluation.difficultiesFaced || '',
              improvementsGoal: rep.report.selfEvaluation.improvementsGoal || '',
              studentComment: rep.report.selfEvaluation.studentComment || '',
            });
          }
          setMaterials(rep.materials);
          setTools(rep.tools);
          setSteps(rep.steps);
          setDifficulties(rep.difficulties);
          setTests(rep.tests);
          setSelectedCompetencies(rep.competencies);
          setAttachments(rep.attachments);
        }
      } catch (err: any) {
        toast.error(err?.message || 'Erreur lors du chargement des informations.');
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [initialReportId]);

  // Sauvegarde réelle (persistée en base)
  const saveReportData = useCallback(
    async (isAutosave = false) => {
      const draftTitle = title.trim() || `Intervention ${interventionType} du ${interventionDate}`;
      const payload = {
        title: draftTitle,
        interventionType,
        interventionDate,
        startTime,
        endTime,
        durationHours,
        clientOrSite: clientOrSite.trim() || 'CFP-ITMC Atelier Pédagogique',
        clientPhone,
        clientAddress,
        location,
        problemObserved,
        contextAndObjective,
        generalDescription,
        safetyMeasures,
        safetyChecklist,
        conclusion,
        selfEvaluation,
        materials,
        tools,
        steps,
        difficulties,
        tests,
        competencies: selectedCompetencies,
        isAutosave,
        expectedVersion: reportVersion,
      };

      try {
        setSaveStatus('saving');
        let res: InterventionReportAggregate;

        if (!reportId) {
          res = await interventionReportApi.createReport({
            ...payload,
            idempotencyKey: `init_${Date.now()}`,
          });
          setReportId(res.report.id);
          setReportNumber(res.report.reportNumber);
          setReportVersion(res.report.version);
        } else {
          res = await interventionReportApi.updateDraft(reportId, payload);
          setReportVersion(res.report.version);
        }

        setSaveStatus('saved');
        onSaved?.(res);
        return res;
      } catch (err: any) {
        setSaveStatus('error');
        if (!isAutosave) {
          toast.error(err?.message || 'Erreur lors de la sauvegarde.');
        }
        return null;
      }
    },
    [
      title,
      interventionType,
      interventionDate,
      startTime,
      endTime,
      durationHours,
      clientOrSite,
      clientPhone,
      clientAddress,
      location,
      problemObserved,
      contextAndObjective,
      generalDescription,
      safetyMeasures,
      safetyChecklist,
      conclusion,
      selfEvaluation,
      materials,
      tools,
      steps,
      difficulties,
      tests,
      selectedCompetencies,
      reportId,
      reportVersion,
      onSaved,
    ]
  );

  // Déclencheur Autosave avec Debounce (1.8s)
  useEffect(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    if (!title && !clientOrSite && !contextAndObjective && materials.length === 0) return;

    autosaveTimerRef.current = setTimeout(() => {
      saveReportData(true);
    }, 1800);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    title,
    clientOrSite,
    contextAndObjective,
    generalDescription,
    problemObserved,
    safetyMeasures,
    materials,
    tools,
    steps,
    difficulties,
    tests,
    selectedCompetencies,
    selfEvaluation,
    conclusion,
    saveReportData,
  ]);

  // Upload d'image / document
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Assurer d'abord que le rapport est créé en base
    let currentId = reportId;
    if (!currentId) {
      const saved = await saveReportData(false);
      if (!saved) return;
      currentId = saved.report.id;
    }

    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = String(reader.result || '');
          const att = await interventionReportApi.uploadAttachment(currentId!, {
            originalFileName: file.name,
            mimeType: file.type,
            base64Data,
            category: uploadCategory,
            caption: uploadCaption || file.name,
          });

          setAttachments((prev) => [...prev, att]);
          setUploadCaption('');
          toast.success(
            `Preuve [${uploadCategory}] "${file.name}" vérifiée (Magic-Bytes OK) et enregistrée !`
          );
        } catch (err: any) {
          toast.error(err?.message || 'Fichier rejeté par le pare-feu.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
      toast.error('Erreur lors de la lecture du fichier.');
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!reportId) return;
    try {
      await interventionReportApi.deleteAttachment(reportId, attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      toast.success('Pièce jointe supprimée.');
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la suppression.');
    }
  };

  // Soumission finale officielle
  const handleFinalSubmit = async () => {
    const saved = await saveReportData(false);
    if (!saved) return;

    try {
      const submitted = await interventionReportApi.submitReport(
        saved.report.id,
        'Soumission officielle depuis le Wizard d’intervention CFP-ITMC'
      );
      toast.success(
        `🎉 Rapport ${submitted.report.reportNumber} soumis avec succès à ${submitted.report.assignedTeacherName} !`
      );
      onSubmitted?.(submitted);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Échec de la soumission du rapport.');
    }
  };

  // Gestion des matériaux
  const addMaterial = () => {
    setMaterials((prev) => [
      ...prev,
      {
        id: `mat_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        reportId: reportId || '',
        name: '',
        reference: '',
        category: 'Composant',
        quantity: 1,
        unit: 'unité',
        specification: '',
        notes: '',
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const updateMaterial = (index: number, field: keyof ReportMaterial, value: any) => {
    setMaterials((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeMaterial = (index: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  // Gestion des outils
  const addTool = () => {
    setTools((prev) => [
      ...prev,
      {
        id: `tol_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        reportId: reportId || '',
        name: '',
        category: 'OUTILLAGE_MANUEL',
        serialOrRef: '',
        calibrationStatus: 'Opérationnel / Calibré',
        usageNotes: '',
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const updateTool = (index: number, field: keyof ReportTool, value: any) => {
    setTools((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeTool = (index: number) => {
    setTools((prev) => prev.filter((_, i) => i !== index));
  };

  // Gestion des étapes
  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        id: `stp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        reportId: reportId || '',
        stepOrder: prev.length + 1,
        phase: 'EXECUTION',
        title: `Étape ${prev.length + 1}`,
        description: '',
        durationMinutes: 45,
        technicalNotes: '',
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  };

  const updateStep = (index: number, field: keyof ReportStep, value: any) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeStep = (index: number) => {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, idx) => ({ ...s, stepOrder: idx + 1 }))
    );
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    setSteps((prev) => {
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((s, idx) => ({ ...s, stepOrder: idx + 1 }));
    });
  };

  // Gestion des difficultés
  const addDifficulty = () => {
    setDifficulties((prev) => [
      ...prev,
      {
        id: `dif_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        reportId: reportId || '',
        problemEncountered: '',
        rootCause: '',
        solutionApplied: '',
        resultObtained: 'Problème résolu avec succès.',
        severity: 'MEDIUM',
        resolved: true,
        timeLostMinutes: 20,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const updateDifficulty = (index: number, field: keyof ReportDifficulty, value: any) => {
    setDifficulties((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeDifficulty = (index: number) => {
    setDifficulties((prev) => prev.filter((_, i) => i !== index));
  };

  // Gestion des tests
  const addTest = () => {
    setTests((prev) => [
      ...prev,
      {
        id: `tst_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        reportId: reportId || '',
        testName: '',
        parameterMeasured: '',
        expectedValue: '',
        measuredValue: '',
        unit: '',
        result: 'CONFORME',
        observations: '',
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const updateTest = (index: number, field: keyof ReportTest, value: any) => {
    setTests((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeTest = (index: number) => {
    setTests((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation checklist status
  const isGeneralInfoComplete = Boolean(title && interventionDate && startTime && endTime);
  const isClientAndLocationComplete = Boolean(clientOrSite && location);
  const isObjectivesComplete = Boolean(
    contextAndObjective.length >= 15 && generalDescription.length >= 15
  );
  const isStepsComplete = steps.length > 0 && steps.every((s) => s.title && s.description);
  const isSafetyComplete = Boolean(safetyMeasures);
  const isPhotosPresent = attachments.length > 0;
  const isTestsComplete = tests.length > 0;
  const isCompetenciesSelected = selectedCompetencies.length > 0;
  const isReadyForSubmission =
    isGeneralInfoComplete &&
    isObjectivesComplete &&
    isStepsComplete &&
    isSafetyComplete;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden">
        {/* En-tête du Wizard avec barre de statut & Autosave */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-500/20 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                Étape {currentStep} / {WIZARD_STEPS.length}
              </span>
              {reportNumber && (
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-300">
                  {reportNumber}
                </span>
              )}
              {/* Indicateur visuel d'Autosave */}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                  saveStatus === 'saved'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : saveStatus === 'saving'
                    ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {saveStatus === 'saved' && (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> ✓ Enregistré
                  </>
                )}
                {saveStatus === 'saving' && (
                  <>
                    <Save className="w-3 h-3 animate-spin" /> ⟳ Enregistrement...
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertTriangle className="w-3 h-3" /> Erreur sauvegarde
                  </>
                )}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              {WIZARD_STEPS[currentStep - 1].title} —{' '}
              <span className="text-indigo-300 text-sm font-normal">
                {WIZARD_STEPS[currentStep - 1].subtitle}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveReportData(false)}
              className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs hidden sm:flex"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" /> Sauvegarder
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Barre de Progression Horizontale (Desktop & Mobile) */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 overflow-x-auto flex items-center gap-1.5 shrink-0 custom-scrollbar">
          {WIZARD_STEPS.map((s) => {
            const isDone = s.step < currentStep;
            const isCurrent = s.step === currentStep;
            return (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/30'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-white text-indigo-700'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isDone ? '✓' : s.step}
                </span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Corps du Formulaire par Étape */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* ========================================================================= */}
          {/* ÉTAPE 1 : INFORMATIONS GÉNÉRALES & PRÉREMPLISSAGE INTELLIGENT */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <span className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" /> Profil Apprenant & Données
                  Académiques (Résolues automatiquement)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500 block">Étudiant</span>
                    <span className="font-bold text-slate-900">{studentInfo.name || 'Arthur Ngassa'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Matricule</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {studentInfo.matricule || '26ITMC-GL001'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Spécialité & Classe</span>
                    <span className="font-bold text-indigo-700">
                      {studentInfo.specialty || 'Génie Logiciel'} ({studentInfo.classCode || 'G1'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Enseignant Référent</span>
                    <span className="font-bold text-slate-900">
                      {studentInfo.teacherName || 'Dr. Jean-Paul Kamga'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Date de l’intervention *
                  </label>
                  <Input
                    type="date"
                    value={interventionDate}
                    onChange={(e) => setInterventionDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Durée totale calculée (heures)
                  </label>
                  <Input
                    type="number"
                    step={0.5}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Heure de début *
                  </label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Heure de fin *
                  </label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ÉTAPE 2 : CLIENT ET LIEU */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Type d’intervention technique *
                </label>
                <ModernSelect
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value as InterventionType)}
                >
                  {INTERVENTION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </ModernSelect>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nom du client, entreprise ou système cible *
                  </label>
                  <Input
                    value={clientOrSite}
                    onChange={(e) => setClientOrSite(e.target.value)}
                    placeholder="Ex: Hôpital Général Douala / Serveur ITMC-PROD-01"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Téléphone du contact / client
                  </label>
                  <Input
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ex: (+237) 699 00 11 22"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Adresse ou ville de l’intervention
                  </label>
                  <Input
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Ex: Douala - Akwa, Boulevard de la Liberté"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Lieu précis (Atelier, Laboratoire, Chantier...) *
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Atelier Électrotechnique & Froid — Bâtiment B"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ÉTAPE 3 : OBJET ET OBJECTIFS */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Objet / Intitulé clair de l’intervention * (min 5 caractères)
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Diagnostic et remplacement du contacteur de puissance sur compresseur triphasé"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Problème constaté initialement (Symptômes & dysfonctionnements)
                </label>
                <textarea
                  rows={3}
                  value={problemObserved}
                  onChange={(e) => setProblemObserved(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3"
                  placeholder="Décrivez ce qui ne fonctionnait pas avant l’intervention (bruit anormal, disjonction, erreur HTTP 500, fuite de fluide...)"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Contexte & Objectifs de l’intervention * (min 15 caractères pour soumission)
                </label>
                <textarea
                  rows={3}
                  value={contextAndObjective}
                  onChange={(e) => setContextAndObjective(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3"
                  placeholder="Quels étaient les objectifs fixés (remise en service, rétablissement de la communication réseau, vérification de conformité...) ?"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Description synthétique des travaux * (min 15 caractères)
                </label>
                <textarea
                  rows={3}
                  value={generalDescription}
                  onChange={(e) => setGeneralDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3"
                  placeholder="Synthèse globale de la démarche adoptée..."
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ÉTAPE 4 : MATÉRIEL ET OUTILS */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Matériels */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Composants, Matériels & Pièces Détachées ({materials.length})
                    </h4>
                    <p className="text-slate-500 text-[11px]">
                      Articles et pièces consommées ou installées lors de l’intervention
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addMaterial}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter un composant
                  </Button>
                </div>

                {materials.length === 0 ? (
                  <p className="text-slate-400 italic py-3 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
                    Aucun matériel ajouté. Cliquez sur le bouton pour en ajouter.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {materials.map((mat, idx) => (
                      <div
                        key={mat.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                      >
                        <div className="sm:col-span-4">
                          <Input
                            placeholder="Désignation du composant *"
                            value={mat.name}
                            onChange={(e) => updateMaterial(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <Input
                            placeholder="Référence / Marque"
                            value={mat.reference}
                            onChange={(e) => updateMaterial(idx, 'reference', e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Input
                            type="number"
                            min={0.1}
                            placeholder="Qté"
                            value={mat.quantity}
                            onChange={(e) => updateMaterial(idx, 'quantity', Number(e.target.value))}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Input
                            placeholder="Unité (pièce, m, L)"
                            value={mat.unit}
                            onChange={(e) => updateMaterial(idx, 'unit', e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMaterial(idx)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outillage */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Outillage & Instruments de Mesure ({tools.length})
                    </h4>
                    <p className="text-slate-500 text-[11px]">
                      Appareils de mesure, outillage électroportatif et logiciels mobilisés
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addTool}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter un outil
                  </Button>
                </div>

                {tools.length === 0 ? (
                  <p className="text-slate-400 italic py-3 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
                    Aucun outil spécifié.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {tools.map((tol, idx) => (
                      <div
                        key={tol.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                      >
                        <div className="sm:col-span-4">
                          <Input
                            placeholder="Nom de l’outil / appareil *"
                            value={tol.name}
                            onChange={(e) => updateTool(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <ModernSelect
                            value={tol.category}
                            onChange={(e) => updateTool(idx, 'category', e.target.value as ToolCategory)}
                          >
                            <option value="MESURE">Appareil de mesure</option>
                            <option value="OUTILLAGE_MANUEL">Outillage manuel</option>
                            <option value="ELECTROPORTATIF">Électroportatif</option>
                            <option value="LOGICIEL_DIAGNOSTIC">Logiciel de diagnostic</option>
                            <option value="EPI_SECURITE">Équipement EPI</option>
                          </ModernSelect>
                        </div>
                        <div className="sm:col-span-4">
                          <Input
                            placeholder="État de calibration / Observations"
                            value={tol.calibrationStatus}
                            onChange={(e) => updateTool(idx, 'calibrationStatus', e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTool(idx)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ÉTAPE 5 : TRAVAUX RÉALISÉS ÉTAPE PAR ÉTAPE */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Chronologie des Travaux Réalisés ({steps.length} étapes)
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Détaillez méthodiquement chaque étape technique de votre intervention
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={addStep}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> + Ajouter une étape
                </Button>
              </div>

              <div className="space-y-3">
                {steps.map((st, idx) => (
                  <div
                    key={st.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                          {st.stepOrder}
                        </span>
                        <ModernSelect
                          value={st.phase}
                          onChange={(e) => updateStep(idx, 'phase', e.target.value as StepPhase)}
                        >
                          <option value="PREPARATION">1. Préparation</option>
                          <option value="DIAGNOSTIC">2. Diagnostic</option>
                          <option value="EXECUTION">3. Exécution</option>
                          <option value="VERIFICATION">4. Vérification</option>
                          <option value="REMISE_EN_SERVICE">5. Remise en service</option>
                        </ModernSelect>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={idx === 0}
                          onClick={() => moveStep(idx, 'up')}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={idx === steps.length - 1}
                          onClick={() => moveStep(idx, 'down')}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(idx)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3">
                        <Input
                          placeholder="Intitulé de l’étape *"
                          value={st.title}
                          onChange={(e) => updateStep(idx, 'title', e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <Input
                          type="number"
                          placeholder="Durée (min)"
                          value={st.durationMinutes}
                          onChange={(e) => updateStep(idx, 'durationMinutes', Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Description détaillée des opérations techniques effectuées..."
                      value={st.description}
                      onChange={(e) => updateStep(idx, 'description', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
                    />

                    <Input
                      placeholder="Observations ou valeurs mesurées particulières..."
                      value={st.technicalNotes}
                      onChange={(e) => updateStep(idx, 'technicalNotes', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ÉTAPE 6 : DIFFICULTÉS ET SOLUTIONS */}
          {/* ========================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Pannes, Obstacles & Résolutions Techniques ({difficulties.length})
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Documentez les difficultés imprévues et les solutions professionnelles apportées
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={addDifficulty}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> + Ajouter une difficulté
                </Button>
              </div>

              {difficulties.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
                  <p className="text-slate-500">Aucune difficulté particulière signalée.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDifficulty}
                    className="mt-2 text-xs"
                  >
                    Ajouter une difficulté rencontrée
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {difficulties.map((d, idx) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 text-xs uppercase">
                          Difficulté #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <ModernSelect
                            value={d.severity}
                            onChange={(e) =>
                              updateDifficulty(idx, 'severity', e.target.value as DifficultySeverity)
                            }
                          >
                            <option value="LOW">Mineure (Faible)</option>
                            <option value="MEDIUM">Moyenne</option>
                            <option value="HIGH">Importante</option>
                            <option value="CRITICAL">Critique</option>
                          </ModernSelect>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDifficulty(idx)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Difficulté / Problème rencontré *"
                        value={d.problemEncountered}
                        onChange={(e) => updateDifficulty(idx, 'problemEncountered', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
                      />

                      <textarea
                        rows={2}
                        placeholder="Cause racine identifiée..."
                        value={d.rootCause}
                        onChange={(e) => updateDifficulty(idx, 'rootCause', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
                      />

                      <textarea
                        rows={2}
                        placeholder="Solution technique appliquée *"
                        value={d.solutionApplied}
                        onChange={(e) => updateDifficulty(idx, 'solutionApplied', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* ÉTAPE 7 : SÉCURITÉ ET TESTS DE CONFORMITÉ */}
          {/* ========================================================================= */}
          {currentStep === 7 && (
            <div className="space-y-6">
              {/* Checklist Sécurité */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Mesures de Sécurité & EPI
                  Appliqués
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={safetyChecklist.epiGlasses}
                      onChange={(e) =>
                        setSafetyChecklist((p) => ({ ...p, epiGlasses: e.target.checked }))
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Lunettes EPI</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={safetyChecklist.epiGloves}
                      onChange={(e) =>
                        setSafetyChecklist((p) => ({ ...p, epiGloves: e.target.checked }))
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Gants de protection</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={safetyChecklist.epiShoes}
                      onChange={(e) =>
                        setSafetyChecklist((p) => ({ ...p, epiShoes: e.target.checked }))
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Chaussures sécurité</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={safetyChecklist.lockoutTagout}
                      onChange={(e) =>
                        setSafetyChecklist((p) => ({ ...p, lockoutTagout: e.target.checked }))
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Consignation / Cadenas</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={safetyChecklist.voltageFreeCheck}
                      onChange={(e) =>
                        setSafetyChecklist((p) => ({ ...p, voltageFreeCheck: e.target.checked }))
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Vérif. Absence Tension</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={safetyChecklist.areaSignage}
                      onChange={(e) =>
                        setSafetyChecklist((p) => ({ ...p, areaSignage: e.target.checked }))
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Balisage de la zone</span>
                  </label>
                </div>

                <Input
                  placeholder="Règles d’hygiène et sécurité complémentaires..."
                  value={safetyMeasures}
                  onChange={(e) => setSafetyMeasures(e.target.value)}
                />
              </div>

              {/* Tableau des tests */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Contrôles, Mesures & Tests de Recette ({tests.length})
                    </h4>
                    <p className="text-slate-500 text-[11px]">
                      Vérifications techniques chiffrées après intervention
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addTest}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> + Ajouter un test
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {tests.map((t, idx) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      <div className="sm:col-span-4">
                        <Input
                          placeholder="Intitulé du test / paramètre *"
                          value={t.testName}
                          onChange={(e) => updateTest(idx, 'testName', e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          placeholder="Attendu"
                          value={t.expectedValue}
                          onChange={(e) => updateTest(idx, 'expectedValue', e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          placeholder="Mesuré / Unité"
                          value={t.measuredValue}
                          onChange={(e) => updateTest(idx, 'measuredValue', e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <ModernSelect
                          value={t.result}
                          onChange={(e) => updateTest(idx, 'result', e.target.value as TestResultStatus)}
                        >
                          <option value="CONFORME">✅ Conforme</option>
                          <option value="PARTIELLEMENT_CONFORME">⚠️ Partiellement conforme</option>
                          <option value="NON_CONFORME">❌ Non conforme</option>
                          <option value="NON_APPLICABLE">⚪ Non applicable (N/A)</option>
                          <option value="A_SURVEILLER">👁️ À surveiller</option>
                        </ModernSelect>
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTest(idx)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ÉTAPE 8 : PHOTOS AVANT / PENDANT / APRÈS (SUPPORT SMARTPHONE CAMERA) */}
          {/* ========================================================================= */}
          {currentStep === 8 && (
            <div className="space-y-5">
              {/* Module d'envoi de photo avec déclencheur direct appareil photo */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-600" /> Preuves Visuelles Obligatoires
                    (Avant / Pendant / Après)
                  </h4>
                  <span className="text-[11px] text-slate-500">Inspection Magic-Bytes active</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Catégorie de la photo *
                    </label>
                    <ModernSelect
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as AttachmentCategory)}
                    >
                      <option value="BEFORE">📷 Photo AVANT intervention (État initial)</option>
                      <option value="DURING">🔧 Photo PENDANT intervention (Opérations)</option>
                      <option value="AFTER">✨ Photo APRÈS intervention (Résultat final)</option>
                      <option value="SCHEMA">📐 Schéma technique / Topologie</option>
                      <option value="DOCUMENT">📄 Fiche de mesure / Rapport PDF</option>
                    </ModernSelect>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Légende explicative
                    </label>
                    <Input
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      placeholder="Ex: Vue du disjoncteur calciné avant remplacement..."
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-slate-500">
                    Seuls les vrais formats JPEG, PNG, WEBP et PDF sont validés (max 8 Mo).
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Bouton Prendre une Photo (Appareil photo Smartphone) */}
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-sm">
                      <Camera className="w-3.5 h-3.5" />
                      {isUploading ? 'Vérification...' : 'Prendre / Choisir Photo'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        capture="environment"
                        onChange={handleUploadFile}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Galerie par catégories AVANT / PENDANT / APRÈS */}
              {(['BEFORE', 'DURING', 'AFTER', 'SCHEMA', 'DOCUMENT'] as const).map((cat) => {
                const catFiles = attachments.filter((a) => a.category === cat);
                const catTitles: Record<string, string> = {
                  BEFORE: '📷 Photos AVANT Intervention',
                  DURING: '🔧 Photos PENDANT Intervention',
                  AFTER: '✨ Photos APRÈS Intervention',
                  SCHEMA: '📐 Schémas Techniques',
                  DOCUMENT: '📄 Documents & Rapports Annexes',
                };

                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">
                        {catTitles[cat]} ({catFiles.length})
                      </span>
                    </div>

                    {catFiles.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-2">
                        Aucune photo pour cette catégorie.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {catFiles.map((att) => (
                          <div
                            key={att.id}
                            className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 relative group shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900 truncate text-xs">
                                {att.caption || att.originalName}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAttachment(att.id)}
                                className="text-red-500 hover:bg-red-50 p-1 h-auto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {Math.round(att.sizeBytes / 1024)} Ko • {att.detectedMagicMime}
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

          {/* ========================================================================= */}
          {/* ÉTAPE 9 : COMPÉTENCES & AUTO-ÉVALUATION */}
          {/* ========================================================================= */}
          {currentStep === 9 && (
            <div className="space-y-5">
              {/* Sélection des compétences du référentiel */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  Compétences Professionnelles Mobilisées
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Cochez les compétences du référentiel CFP-ITMC réellement appliquées lors de ce
                  travail
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableSpecialtyCompetencies.map((comp) => {
                    const isSelected = selectedCompetencies.some((c) => c.code === comp.code);

                    const toggleComp = () => {
                      if (isSelected) {
                        setSelectedCompetencies((prev) => prev.filter((c) => c.code !== comp.code));
                      } else {
                        setSelectedCompetencies((prev) => [
                          ...prev,
                          {
                            id: `cmp_${Date.now()}_${comp.code}`,
                            reportId: reportId || '',
                            code: comp.code,
                            label: comp.label,
                            domain: comp.domain,
                            selfLevel: 'ACQUIS',
                            teacherLevel: null,
                            teacherComment: '',
                            createdAt: new Date().toISOString(),
                          },
                        ]);
                      }
                    };

                    return (
                      <div
                        key={comp.code}
                        onClick={toggleComp}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-400 ring-1 ring-indigo-300'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={toggleComp}
                          className="mt-1 rounded text-indigo-600"
                        />
                        <div>
                          <span className="font-bold text-indigo-900 block font-mono text-xs">
                            {comp.code}
                          </span>
                          <span className="text-slate-800 text-xs font-medium">{comp.label}</span>
                          <span className="text-slate-400 block text-[10px]">{comp.domain}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bilan & Auto-évaluation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">
                  Bilan & Auto-évaluation de l’Apprenant
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Autonomie (/5)
                    </label>
                    <ModernSelect
                      value={String(selfEvaluation.autonomyScore)}
                      onChange={(e) =>
                        setSelfEvaluation((p) => ({
                          ...p,
                          autonomyScore: Number(e.target.value),
                        }))
                      }
                    >
                      <option value="5">5/5 — Totale autonomie</option>
                      <option value="4">4/5 — Bonne autonomie</option>
                      <option value="3">3/5 — Autonomie moyenne</option>
                      <option value="2">2/5 — Besoin d'assistance</option>
                      <option value="1">1/5 — Guidé pas à pas</option>
                    </ModernSelect>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Maîtrise Technique (/5)
                    </label>
                    <ModernSelect
                      value={String(selfEvaluation.technicalMasteryScore)}
                      onChange={(e) =>
                        setSelfEvaluation((p) => ({
                          ...p,
                          technicalMasteryScore: Number(e.target.value),
                        }))
                      }
                    >
                      <option value="5">5/5 — Expert</option>
                      <option value="4">4/5 — Très bonne maîtrise</option>
                      <option value="3">3/5 — Maîtrise correcte</option>
                      <option value="2">2/5 — En apprentissage</option>
                    </ModernSelect>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Respect Sécurité (/5)
                    </label>
                    <ModernSelect
                      value={String(selfEvaluation.safetyComplianceScore)}
                      onChange={(e) =>
                        setSelfEvaluation((p) => ({
                          ...p,
                          safetyComplianceScore: Number(e.target.value),
                        }))
                      }
                    >
                      <option value="5">5/5 — Rigueur exemplaire</option>
                      <option value="4">4/5 — Conforme</option>
                      <option value="3">3/5 — Vigilance requise</option>
                    </ModernSelect>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Ce que j’ai appris lors de cette intervention :
                    </label>
                    <textarea
                      rows={2}
                      value={selfEvaluation.learned}
                      onChange={(e) =>
                        setSelfEvaluation((p) => ({ ...p, learned: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
                      placeholder="Nouvelles connaissances ou techniques assimilées..."
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Ce que j’ai le mieux réussi :
                    </label>
                    <textarea
                      rows={2}
                      value={selfEvaluation.succeeded}
                      onChange={(e) =>
                        setSelfEvaluation((p) => ({ ...p, succeeded: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
                      placeholder="Points forts de mon exécution..."
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Conclusion générale & recommandations :
                  </label>
                  <textarea
                    rows={2}
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
                    placeholder="Bilan global de l'intervention..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ÉTAPE 10 : VÉRIFICATION FINALE ET SOUMISSION */}
          {/* ========================================================================= */}
          {currentStep === 10 && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1">
                <h4 className="font-bold text-sm">Vérification Finale Avant Soumission</h4>
                <p className="text-slate-300 text-xs">
                  Après soumission, le rapport sera verrouillé et transmis à Dr. Jean-Paul Kamga
                  pour correction et notation.
                </p>
              </div>

              {/* Checklist visuelle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isGeneralInfoComplete
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <span className="font-semibold">Informations générales & Horaires</span>
                  {isGeneralInfoComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                </div>

                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isObjectivesComplete
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <span className="font-semibold">Objet, Problème & Objectifs</span>
                  {isObjectivesComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                </div>

                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isStepsComplete
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <span className="font-semibold">
                    Travaux réalisés ({steps.length} étapes)
                  </span>
                  {isStepsComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                </div>

                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    materials.length > 0 || tools.length > 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-semibold">
                    Matériels & Outils ({materials.length + tools.length} éléments)
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>

                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isPhotosPresent
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-semibold">
                    Preuves visuelles ({attachments.length} photos)
                  </span>
                  {isPhotosPresent ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <span className="text-[11px] text-slate-400">Facultatif</span>
                  )}
                </div>

                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isTestsComplete
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-semibold">
                    Tests & Contrôles ({tests.length} tests)
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              {/* Résumé récapitulatif */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-slate-500 font-bold uppercase text-[10px]">
                  Aperçu de la soumission
                </span>
                <h3 className="font-bold text-slate-900 text-sm">{title || 'Sans titre'}</h3>
                <p className="text-slate-600 text-xs">
                  {studentInfo.name} ({studentInfo.matricule}) • {studentInfo.specialty} •{' '}
                  {interventionDate} ({durationHours}h)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page du Wizard : Navigation Suivant / Précédent & Soumission */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
            className="text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < WIZARD_STEPS.length ? (
              <Button
                type="button"
                onClick={() => setCurrentStep((p) => Math.min(WIZARD_STEPS.length, p + 1))}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Suivant <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!isReadyForSubmission}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg"
              >
                <Send className="w-4 h-4 mr-1.5" /> 📤 Soumettre le Rapport Officiel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
