import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Camera,
  Upload,
  Sparkles,
  Layers,
  Wrench,
  Award,
  ShieldCheck,
  Clock,
  Building,
  HelpCircle,
  X,
  FileText,
  FileCheck,
  Check,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ModernSelect } from '@/components/ui/select';
import {
  AttachmentCategory,
  ProfessionalReport,
  ReportAttachmentItem,
  ReportCompetencySelection,
  ReportDifficultyItem,
  ReportMaterialItem,
  ReportStepItem,
  ReportTemplate,
  ReportTestItem,
  ReportToolItem,
} from '../types/professionalReport.types';
import { professionalReportApi } from '../api/professionalReportApiClient';

interface AdaptiveReportWizardProps {
  report: ProfessionalReport;
  template: ReportTemplate;
  onSaveSuccess?: () => void;
  onSubmitSuccess?: () => void;
  onClose: () => void;
}

export const AdaptiveReportWizard: React.FC<AdaptiveReportWizardProps> = ({
  report: initialReport,
  template,
  onSaveSuccess,
  onSubmitSuccess,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;

  // État local réactif du rapport
  const [report, setReport] = useState<ProfessionalReport>(initialReport);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-Save Debounce Ref
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Résolution des catégories de photos selon le domaine/spécialité
  const getPhotoCategoriesForSpecialty = (): Array<{ key: AttachmentCategory; label: string }> => {
    const cat = template.category;
    if (cat === 'BATIMENT_CONSTRUCTION') {
      return [
        { key: 'BEFORE', label: '📷 État Initial / Avant Travaux' },
        { key: 'DURING', label: '⚡ Pendant la Réalisation / Processus' },
        { key: 'AFTER', label: '✅ Ouvrage Fini / Résultat Après' },
        { key: 'SCHEMA', label: '📐 Plan / Schéma de Calepinage' },
      ];
    }
    if (cat === 'INFORMATIQUE_DIGITAL_COMMUNICATION') {
      return [
        { key: 'BEFORE', label: '📋 Brief Client / Environnement' },
        { key: 'DURING', label: '💻 Configuration & Code' },
        { key: 'SCREENSHOT', label: '📸 Captures d’Écran & Logs' },
        { key: 'AFTER', label: '🎯 Résultat Final / Métriques' },
      ];
    }
    if (cat === 'ADMINISTRATION_COMMERCE_GESTION') {
      return [
        { key: 'BEFORE', label: '📑 Documents Source / Pièces' },
        { key: 'DURING', label: '⌨️ Saisie & Traitement Logiciel' },
        { key: 'AFTER', label: '📊 État Récapitulatif / Tableau' },
        { key: 'PROOF', label: '🧾 Preuve de Contrôle / Visa' },
      ];
    }
    // Industrie / Énergie / Générique
    return [
      { key: 'BEFORE', label: '📷 Avant Intervention' },
      { key: 'DURING', label: '🔧 Pendant l’Activité' },
      { key: 'AFTER', label: '✅ Après Intervention' },
      { key: 'PROOF', label: '📑 Document / Preuve' },
    ];
  };

  const photoCategories = getPhotoCategoriesForSpecialty();

  // Sauvegarde explicite ou automatique
  const performSave = useCallback(
    async (isAutosave: boolean = false) => {
      setIsSaving(true);
      try {
        const updated = await professionalReportApi.updateReport(report.id, report, isAutosave);
        setReport(updated.report);
        setLastSavedTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
        if (!isAutosave) {
          toast.success('Brouillon sauvegardé avec succès !');
        }
        if (onSaveSuccess) onSaveSuccess();
      } catch (err: any) {
        if (!isAutosave) {
          toast.error(err.message || 'Erreur lors de la sauvegarde.');
        }
      } finally {
        setIsSaving(false);
      }
    },
    [report, onSaveSuccess]
  );

  // Trigger Auto-Save lors de la modification des données
  const triggerAutoSave = () => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      performSave(true);
    }, 3000);
  };

  // Mise à jour d'un champ dynamique spécifique à la spécialité
  const handleDynamicValueChange = (key: string, value: any) => {
    setReport((prev) => ({
      ...prev,
      dynamicValues: {
        ...prev.dynamicValues,
        [key]: value,
      },
    }));
    triggerAutoSave();
  };

  // Gestion des étapes chronologiques
  const handleAddStep = () => {
    const newStep: ReportStepItem = {
      id: `step_${Date.now()}`,
      order: report.steps.length + 1,
      title: '',
      description: '',
      durationMinutes: 30,
      status: 'DONE',
    };
    setReport((prev) => ({ ...prev, steps: [...prev.steps, newStep] }));
    triggerAutoSave();
  };

  const handleUpdateStep = (index: number, field: keyof ReportStepItem, val: any) => {
    const nextSteps = [...report.steps];
    nextSteps[index] = { ...nextSteps[index], [field]: val };
    setReport((prev) => ({ ...prev, steps: nextSteps }));
    triggerAutoSave();
  };

  const handleRemoveStep = (index: number) => {
    const nextSteps = report.steps.filter((_, i) => i !== index);
    setReport((prev) => ({ ...prev, steps: nextSteps }));
    triggerAutoSave();
  };

  // Gestion des matériaux
  const handleAddMaterial = () => {
    const newItem: ReportMaterialItem = {
      id: `mat_${Date.now()}`,
      name: '',
      quantity: 1,
      unit: 'unité',
    };
    setReport((prev) => ({ ...prev, materials: [...prev.materials, newItem] }));
    triggerAutoSave();
  };

  const handleUpdateMaterial = (index: number, field: keyof ReportMaterialItem, val: any) => {
    const next = [...report.materials];
    next[index] = { ...next[index], [field]: val };
    setReport((prev) => ({ ...prev, materials: next }));
    triggerAutoSave();
  };

  const handleRemoveMaterial = (index: number) => {
    setReport((prev) => ({ ...prev, materials: prev.materials.filter((_, i) => i !== index) }));
    triggerAutoSave();
  };

  // Gestion des difficultés
  const handleAddDifficulty = () => {
    const newItem: ReportDifficultyItem = {
      id: `diff_${Date.now()}`,
      problem: '',
      solution: '',
      result: '',
      severity: 'MEDIUM',
    };
    setReport((prev) => ({ ...prev, difficulties: [...prev.difficulties, newItem] }));
    triggerAutoSave();
  };

  const handleUpdateDifficulty = (index: number, field: keyof ReportDifficultyItem, val: any) => {
    const next = [...report.difficulties];
    next[index] = { ...next[index], [field]: val };
    setReport((prev) => ({ ...prev, difficulties: next }));
    triggerAutoSave();
  };

  const handleRemoveDifficulty = (index: number) => {
    setReport((prev) => ({ ...prev, difficulties: prev.difficulties.filter((_, i) => i !== index) }));
    triggerAutoSave();
  };

  // Gestion des tests et contrôles
  const handleAddTest = () => {
    const newItem: ReportTestItem = {
      id: `test_${Date.now()}`,
      name: '',
      parameter: '',
      expectedValue: '',
      measuredValue: '',
      unit: '',
      status: 'CONFORME',
    };
    setReport((prev) => ({ ...prev, testsAndControls: [...prev.testsAndControls, newItem] }));
    triggerAutoSave();
  };

  const handleUpdateTest = (index: number, field: keyof ReportTestItem, val: any) => {
    const next = [...report.testsAndControls];
    next[index] = { ...next[index], [field]: val };
    setReport((prev) => ({ ...prev, testsAndControls: next }));
    triggerAutoSave();
  };

  const handleRemoveTest = (index: number) => {
    setReport((prev) => ({ ...prev, testsAndControls: prev.testsAndControls.filter((_, i) => i !== index) }));
    triggerAutoSave();
  };

  // Téléversement d'image / photo caméra
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: AttachmentCategory) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (evt) => {
      const base64 = evt.target?.result as string;
      if (!base64) return;

      try {
        toast.info('Analyse de sécurité et téléversement de la photo...');
        const uploaded = await professionalReportApi.uploadAttachment(report.id, {
          base64Data: base64,
          originalName: file.name,
          category,
          caption: `Photo ${category} - ${file.name}`,
        });

        setReport((prev) => ({ ...prev, attachments: [...prev.attachments, uploaded] }));
        toast.success('Photo ajoutée et vérifiée avec succès !');
      } catch (err: any) {
        toast.error(err.message || 'Échec du téléversement de la photo.');
      }
    };

    reader.readAsDataURL(file);
  };

  // Suppression d'une pièce jointe
  const handleDeleteAttachment = async (attId: string) => {
    try {
      await professionalReportApi.deleteAttachment(report.id, attId);
      setReport((prev) => ({ ...prev, attachments: prev.attachments.filter((a) => a.id !== attId) }));
      toast.success('Photo supprimée.');
    } catch (err: any) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  // Soumission finale du rapport
  const handleSubmitFinalReport = async () => {
    setIsSubmitting(true);
    try {
      await performSave(true); // Sauvegarde préalable des dernières modifications
      await professionalReportApi.submitReport(report.id);
      toast.success('🎉 Rapport professionnel transmis avec succès à votre formateur référent !');
      if (onSubmitSuccess) onSubmitSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la soumission du rapport.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Wizard Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-slate-800">{template.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-600 text-white font-mono text-[10px]">
                  {report.reportNumber}
                </Badge>
                <Badge className="bg-slate-800 text-slate-300 text-[10px]">
                  {template.specialtyName}
                </Badge>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white truncate max-w-md mt-0.5">
                {report.title || template.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-emerald-400 block">
                {isSaving ? '⟳ Enregistrement...' : lastSavedTime ? `✓ Sauvegardé à ${lastSavedTime}` : '✓ Brouillon synchro'}
              </span>
              <span className="text-[10px] text-slate-400">Étape {currentStep} / {totalSteps}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => performSave(false)}
              disabled={isSaving}
              className="h-9 px-3 rounded-xl border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </Button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-slate-100 dark:bg-slate-800/60 p-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
          {[
            { num: 1, label: 'Général' },
            { num: 2, label: 'Métier' },
            { num: 3, label: 'Étape par Étape' },
            { num: 4, label: 'Matériel' },
            { num: 5, label: 'Difficultés' },
            { num: 6, label: 'Tests & Mesures' },
            { num: 7, label: 'Sécurité & EPI' },
            { num: 8, label: 'Photos & Galerie' },
            { num: 9, label: 'Bilan' },
            { num: 10, label: 'Soumission' },
          ].map((s) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wider transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isCompleted
                    ? 'bg-slate-200 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                }`}
              >
                <span>{s.num}.</span>
                <span>{s.label}</span>
                {isCompleted && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>

        {/* Wizard Step Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700 dark:text-slate-300">
          {/* ÉTAPE 1 : INFORMATIONS GÉNÉRALES PRÉREMPLIES */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40">
                <p className="font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                  ✓ Préremplissage Automatique des Données Apprenant
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Les informations académiques sont extraites directement de votre profil étudiant CFP-ITMC.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nom & Prénom</label>
                  <Input value={report.studentName} disabled className="bg-slate-100 dark:bg-slate-800 font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Matricule</label>
                  <Input value={report.studentMatricule} disabled className="bg-slate-100 dark:bg-slate-800 font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Spécialité & Classe</label>
                  <Input value={`${report.specialtyName} (${report.classCode})`} disabled className="bg-slate-100 dark:bg-slate-800 font-bold" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Titre de l'Activité Professionnelle *</label>
                <Input
                  value={report.title}
                  onChange={(e) => {
                    setReport((p) => ({ ...p, title: e.target.value }));
                    triggerAutoSave();
                  }}
                  placeholder="Ex: Pose et raccordement du collecteur sanitaire cuivre Ø16..."
                  className="h-11 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Type d'Activité</label>
                  <ModernSelect
                    value={report.activityType}
                    onChange={(e) => {
                      setReport((p) => ({ ...p, activityType: e.target.value }));
                      triggerAutoSave();
                    }}
                  >
                    {template.activityTypes.map((act) => (
                      <option key={act.value} value={act.value}>
                        {act.label}
                      </option>
                    ))}
                  </ModernSelect>
                </div>

                <div>
                  <label className="font-bold block mb-1">Date de réalisation</label>
                  <Input
                    type="date"
                    value={report.activityDate}
                    onChange={(e) => {
                      setReport((p) => ({ ...p, activityDate: e.target.value }));
                      triggerAutoSave();
                    }}
                    className="h-10 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Durée (heures)</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={report.durationHours}
                    onChange={(e) => {
                      setReport((p) => ({ ...p, durationHours: Number(e.target.value) }));
                      triggerAutoSave();
                    }}
                    className="h-10 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Lieu / Atelier / Chantier</label>
                  <Input
                    value={report.location}
                    onChange={(e) => {
                      setReport((p) => ({ ...p, location: e.target.value }));
                      triggerAutoSave();
                    }}
                    placeholder="Ex: Atelier Plomberie Bâtiment A, Chantier Bonamoussadi..."
                    className="h-10 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Client / Entreprise d'accueil</label>
                  <Input
                    value={report.clientOrHostOrg}
                    onChange={(e) => {
                      setReport((p) => ({ ...p, clientOrHostOrg: e.target.value }));
                      triggerAutoSave();
                    }}
                    placeholder="Ex: Clinique Grâce, Banc d'Essai CFP-ITMC..."
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Objectifs & Context de l'Activité</label>
                <Textarea
                  value={report.objectives}
                  onChange={(e) => {
                    setReport((p) => ({ ...p, objectives: e.target.value }));
                    triggerAutoSave();
                  }}
                  placeholder="Expliquez brièvement le besoin, la panne constatée ou les exigences du cahier des charges..."
                  className="min-h-[90px] rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : DONNÉES TECHNIQUES MÉTIEUR ADAPTATIVES */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-indigo-900 dark:text-indigo-300 text-xs uppercase tracking-wider">
                    Paramètres Métier Spécifiques : {template.specialtyName}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ces champs ont été générés dynamiquement par le moteur de la filière [{template.specialtyCode}].
                  </p>
                </div>
                <Badge className="bg-indigo-600 text-white font-mono text-[10px]">{template.category}</Badge>
              </div>

              {/* Rendu dynamique des sections du template */}
              {template.sections
                .filter((sec) => sec.sectionType === 'SPECIALTY_SPECIFIC')
                .map((sec) => (
                  <div key={sec.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
                    <p className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span>{sec.icon}</span>
                      <span>{sec.title}</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sec.fields.map((fld) => {
                        const val = report.dynamicValues?.[fld.key] ?? fld.defaultValue ?? '';

                        return (
                          <div key={fld.id} className="space-y-1">
                            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                              <span>{fld.label} {fld.isRequired ? '*' : ''}</span>
                              {fld.unit && <span className="text-[10px] font-mono text-indigo-600">({fld.unit})</span>}
                            </label>

                            {fld.fieldType === 'SELECT' ? (
                              <ModernSelect
                                value={val}
                                onChange={(e) => handleDynamicValueChange(fld.key, e.target.value)}
                              >
                                <option value="">-- Sélectionner --</option>
                                {fld.options?.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </ModernSelect>
                            ) : fld.fieldType === 'TEXTAREA' ? (
                              <Textarea
                                value={val}
                                onChange={(e) => handleDynamicValueChange(fld.key, e.target.value)}
                                placeholder={fld.placeholder}
                                className="min-h-[80px] rounded-xl text-xs"
                              />
                            ) : (
                              <Input
                                type={fld.fieldType === 'NUMBER' ? 'number' : 'text'}
                                value={val}
                                onChange={(e) => handleDynamicValueChange(fld.key, e.target.value)}
                                placeholder={fld.placeholder}
                                className="h-10 rounded-xl"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* ÉTAPE 3 : ÉTAPES CHRONOLOGIQUES DE L'ACTIVITÉ */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xs uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    Chronologie des Travaux / Étapes Réalisées
                  </h3>
                  <p className="text-[11px] text-slate-400">Ajoutez chaque étape majeure dans l’ordre d’exécution.</p>
                </div>
                <Button
                  onClick={handleAddStep}
                  className="h-9 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Ajouter une Étape
                </Button>
              </div>

              {report.steps.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">Aucune étape enregistrée.</p>
                  <Button onClick={handleAddStep} variant="outline" className="h-9 px-3 text-xs font-bold">
                    + Ajouter la 1ère Étape
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {report.steps.map((st, idx) => (
                    <div key={st.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-indigo-600 text-white font-bold text-[10px]">
                            Étape #{idx + 1}
                          </Badge>
                          <Input
                            value={st.title}
                            onChange={(e) => handleUpdateStep(idx, 'title', e.target.value)}
                            placeholder="Titre de l’étape..."
                            className="h-9 font-bold bg-white dark:bg-slate-900 rounded-lg text-xs"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveStep(idx)}
                          className="text-slate-400 hover:text-red-500 p-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <Textarea
                        value={st.description}
                        onChange={(e) => handleUpdateStep(idx, 'description', e.target.value)}
                        placeholder="Description détaillée de l’opération..."
                        className="min-h-[60px] bg-white dark:bg-slate-900 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 4 : MATÉRIEL ET OUTILLAGE */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xs uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    Composants, Matériaux & Outillage Utilisés
                  </h3>
                  <p className="text-[11px] text-slate-400">Lister les matériels consommés et instruments mobilisés.</p>
                </div>
                <Button
                  onClick={handleAddMaterial}
                  className="h-9 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Ajouter du Matériel
                </Button>
              </div>

              {report.materials.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">Aucun matériel saisi.</p>
                  <Button onClick={handleAddMaterial} variant="outline" className="h-9 px-3 text-xs font-bold">
                    + Ajouter du Matériel
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {report.materials.map((mat, idx) => (
                    <div key={mat.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                      <Input
                        value={mat.name}
                        onChange={(e) => handleUpdateMaterial(idx, 'name', e.target.value)}
                        placeholder="Désignation..."
                        className="h-9 bg-white dark:bg-slate-900 flex-1 text-xs"
                      />
                      <Input
                        type="number"
                        value={mat.quantity}
                        onChange={(e) => handleUpdateMaterial(idx, 'quantity', Number(e.target.value))}
                        className="h-9 w-20 bg-white dark:bg-slate-900 text-xs font-bold"
                      />
                      <Input
                        value={mat.unit}
                        onChange={(e) => handleUpdateMaterial(idx, 'unit', e.target.value)}
                        placeholder="Unité"
                        className="h-9 w-24 bg-white dark:bg-slate-900 text-xs"
                      />
                      <button onClick={() => handleRemoveMaterial(idx)} className="text-slate-400 hover:text-red-500 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 5 : DIFFICULTÉS ET SOLUTIONS */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xs uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    Difficultés Rencontrées & Solutions Appliquées
                  </h3>
                  <p className="text-[11px] text-slate-400">Documentez les anomalies et votre capacité de diagnostic.</p>
                </div>
                <Button
                  onClick={handleAddDifficulty}
                  className="h-9 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Ajouter une Difficulté
                </Button>
              </div>

              {report.difficulties.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">Aucune difficulté déclarée.</p>
                  <Button onClick={handleAddDifficulty} variant="outline" className="h-9 px-3 text-xs font-bold">
                    + Déclarer un Problème Résolu
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {report.difficulties.map((diff, idx) => (
                    <div key={diff.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-amber-100 text-amber-900 border-none font-bold text-[10px]">
                          Anomalie #{idx + 1}
                        </Badge>
                        <button onClick={() => handleRemoveDifficulty(idx)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          value={diff.problem}
                          onChange={(e) => handleUpdateDifficulty(idx, 'problem', e.target.value)}
                          placeholder="Problème constaté..."
                          className="h-9 bg-white dark:bg-slate-900 text-xs font-bold"
                        />
                        <Input
                          value={diff.solution}
                          onChange={(e) => handleUpdateDifficulty(idx, 'solution', e.target.value)}
                          placeholder="Solution appliquée..."
                          className="h-9 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 6 : TESTS, MESURES ET CONTRÔLES QUALITÉ */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xs uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    Tests, Mesures & Contrôles Qualité
                  </h3>
                  <p className="text-[11px] text-slate-400">Consignez vos valeurs mesurées comparées aux valeurs attendues.</p>
                </div>
                <Button
                  onClick={handleAddTest}
                  className="h-9 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Ajouter un Test
                </Button>
              </div>

              {report.testsAndControls.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">Aucun test de contrôle ajouté.</p>
                  <Button onClick={handleAddTest} variant="outline" className="h-9 px-3 text-xs font-bold">
                    + Ajouter une Mesure
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {report.testsAndControls.map((t, idx) => (
                    <div key={t.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                      <Input
                        value={t.name}
                        onChange={(e) => handleUpdateTest(idx, 'name', e.target.value)}
                        placeholder="Nom du test..."
                        className="h-9 bg-white dark:bg-slate-900 text-xs sm:col-span-2 font-bold"
                      />
                      <Input
                        value={t.measuredValue}
                        onChange={(e) => handleUpdateTest(idx, 'measuredValue', e.target.value)}
                        placeholder="Mesuré"
                        className="h-9 bg-white dark:bg-slate-900 text-xs font-bold text-indigo-600"
                      />
                      <Input
                        value={t.unit}
                        onChange={(e) => handleUpdateTest(idx, 'unit', e.target.value)}
                        placeholder="Unité"
                        className="h-9 bg-white dark:bg-slate-900 text-xs"
                      />
                      <div className="flex items-center gap-1">
                        <ModernSelect
                          value={t.status}
                          onChange={(e) => handleUpdateTest(idx, 'status', e.target.value)}
                        >
                          <option value="CONFORME">✅ Conforme</option>
                          <option value="PARTIEL">⚠️ Partiel</option>
                          <option value="NON_CONFORME">❌ Non conforme</option>
                        </ModernSelect>
                        <button onClick={() => handleRemoveTest(idx)} className="text-slate-400 hover:text-red-500 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 7 : SÉCURITÉ ET PROTECTION (EPI) */}
          {currentStep === 7 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-black text-xs uppercase">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sécurité, Hygiène & Protection Individuelle (EPI)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {template.safetyRulesSummary}
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                <label className="font-bold block text-xs">Observations & Mesures de Sécurité Appliquées</label>
                <Textarea
                  value={report.safety?.rulesAppliedNotes || ''}
                  onChange={(e) => {
                    setReport((p) => ({
                      ...p,
                      safety: { ...p.safety, rulesAppliedNotes: e.target.value },
                    }));
                    triggerAutoSave();
                  }}
                  placeholder="Préciser la mise hors tension, le balisage de la zone, le port des gants/lunettes/chaussures..."
                  className="min-h-[100px] rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* ÉTAPE 8 : PHOTOS & GALERIE ADAPTATIVES */}
          {currentStep === 8 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xs uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    Photos, Captures & Justificatifs ({template.specialtyName})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Importez directement des preuves visuelles réparties par catégories.
                  </p>
                </div>
              </div>

              {/* Blocs d'upload par catégorie dynamique */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photoCategories.map((cat) => {
                  const items = report.attachments.filter((a) => a.category === cat.key);

                  return (
                    <div
                      key={cat.key}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{cat.label}</span>
                        <Badge className="bg-indigo-100 text-indigo-800 border-none font-bold text-[10px]">
                          {items.length} photo(s)
                        </Badge>
                      </div>

                      {/* Dropzone / Upload button */}
                      <label className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center transition-all">
                        <Camera className="w-5 h-5 text-indigo-600" />
                        <span className="text-[11px] font-bold text-indigo-600">+ Prendre ou Choisir une Photo</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          capture="environment"
                          onChange={(e) => handlePhotoUpload(e, cat.key)}
                          className="hidden"
                        />
                      </label>

                      {/* Previews */}
                      {items.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {items.map((img) => (
                            <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
                              <img
                                src={`/api/professional-reports/${report.id}/attachments/${img.id}/download`}
                                alt={img.caption}
                                className="w-full h-24 object-cover"
                              />
                              <button
                                onClick={() => handleDeleteAttachment(img.id)}
                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ÉTAPE 9 : AUTO-ÉVALUATION & BILAN */}
          {currentStep === 9 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 space-y-2">
                <h3 className="font-black text-xs uppercase text-indigo-900 dark:text-indigo-300 tracking-wider">
                  Bilan & Auto-évaluation de l'Apprenant
                </h3>
                <p className="text-[11px] text-slate-500">
                  Résumez ce que vous avez appris et vos axes de progression.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold block">Ce que j'ai appris *</label>
                  <Textarea
                    value={report.studentBilan?.learned || ''}
                    onChange={(e) => {
                      setReport((p) => ({
                        ...p,
                        studentBilan: { ...p.studentBilan, learned: e.target.value },
                      }));
                      triggerAutoSave();
                    }}
                    placeholder="Synthèse des compétences théoriques et pratiques acquises..."
                    className="min-h-[80px] rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold block">Ce que j'ai réussi *</label>
                  <Textarea
                    value={report.studentBilan?.succeeded || ''}
                    onChange={(e) => {
                      setReport((p) => ({
                        ...p,
                        studentBilan: { ...p.studentBilan, succeeded: e.target.value },
                      }));
                      triggerAutoSave();
                    }}
                    placeholder="Points forts de votre réalisation..."
                    className="min-h-[80px] rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 10 : RÉCAPITULATIF & SOUMISSION OFFICIELLE */}
          {currentStep === 10 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-8 h-8 text-amber-400" />
                  <div>
                    <h3 className="text-base font-black">Vérification Finale du Rapport Professionnel</h3>
                    <p className="text-xs text-slate-400">
                      Rapport {report.reportNumber} • Filière {report.specialtyName}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">Nombre d'étapes :</span>
                    <span className="font-bold text-white">{report.steps.length} étape(s)</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">Photos & Justificatifs :</span>
                    <span className="font-bold text-white">{report.attachments.length} fichier(s)</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">Formateur destinataire :</span>
                    <span className="font-bold text-indigo-300">{report.assignedTeacherName}</span>
                  </p>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  ⚠️ Dès la soumission officielle, le rapport sera verrouillé et transmis à votre formateur pour évaluation.
                </p>

                <Button
                  onClick={handleSubmitFinalReport}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Transmissions...' : 'Soumettre Officiellement le Rapport'}</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-3 shrink-0">
          <Button
            variant="outline"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
            className="h-10 px-4 rounded-xl text-xs font-bold gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>

          <span className="text-xs font-bold text-slate-400">
            Étape {currentStep} sur {totalSteps}
          </span>

          <Button
            disabled={currentStep === totalSteps}
            onClick={() => setCurrentStep((p) => Math.min(totalSteps, p + 1))}
            className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1 cursor-pointer"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
