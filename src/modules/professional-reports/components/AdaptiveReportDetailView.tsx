import React, { useState } from 'react';
import {
  Download,
  X,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Send,
  Award,
  ShieldCheck,
  Calendar,
  UserCheck,
  Building,
  Eye,
  FileText,
  Clock,
  History,
  Layers,
  ChevronRight,
  Maximize2,
  ZoomIn,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ModernSelect } from '@/components/ui/select';
import {
  ProfessionalReportAggregate,
  ProfessionalReportStatus,
} from '../types/professionalReport.types';
import { professionalReportApi } from '../api/professionalReportApiClient';
import { generateProfessionalReportPDF } from '../utils/professionalPdfGenerator';

interface AdaptiveReportDetailViewProps {
  aggregate: ProfessionalReportAggregate;
  onRefresh: () => void;
  onClose: () => void;
}

export const AdaptiveReportDetailView: React.FC<AdaptiveReportDetailViewProps> = ({
  aggregate,
  onRefresh,
  onClose,
}) => {
  const { report, template, permissions } = aggregate;

  // État du formulaire d'évaluation enseignant
  const [evaluationDecision, setEvaluationDecision] = useState<
    ProfessionalReportStatus.APPROVED | ProfessionalReportStatus.CHANGES_REQUESTED
  >(ProfessionalReportStatus.APPROVED);

  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    template.evaluationRubric.criteria.forEach((c) => {
      initial[c.key] = Math.round(c.maxPoints * 0.85 * 10) / 10;
    });
    return initial;
  });

  const [generalFeedback, setGeneralFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvementsRequired, setImprovementsRequired] = useState('');

  // Commentaire par section
  const [sectionAnnotations, setSectionAnnotations] = useState<
    Array<{ sectionKey: string; comment: string; severity: 'INFO' | 'WARNING' | 'REQUIRED' }>
  >([]);
  const [activeAnnotatingSection, setActiveAnnotatingSection] = useState<string | null>(null);
  const [newSectionComment, setNewSectionComment] = useState('');

  // Lightbox photo
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  // Calcul automatique de la note totale sur 20
  const computedTotalScore = Object.values(criteriaScores).reduce((a, b) => a + Number(b || 0), 0);

  // Ajouter une annotation sur une section
  const handleAddSectionAnnotation = (sectionKey: string) => {
    if (!newSectionComment.trim()) return;
    setSectionAnnotations((prev) => [
      ...prev,
      { sectionKey, comment: newSectionComment.trim(), severity: 'REQUIRED' },
    ]);
    setNewSectionComment('');
    setActiveAnnotatingSection(null);
    toast.success('Commentaire ajouté sur la section.');
  };

  // Traitement de l'évaluation enseignant
  const handlePerformEvaluation = async () => {
    if (!generalFeedback.trim()) {
      toast.error('Veuillez saisir une appréciation générale.');
      return;
    }

    setIsSubmittingEval(true);
    try {
      await professionalReportApi.evaluateReport(report.id, {
        decision: evaluationDecision,
        scoreOn20: computedTotalScore,
        criteriaScores,
        generalFeedback,
        strengths,
        improvementsRequired,
        annotatedSections: sectionAnnotations,
      });

      toast.success(
        evaluationDecision === ProfessionalReportStatus.APPROVED
          ? '🎉 Rapport validé avec succès ! Note attribuée : ' + computedTotalScore + ' / 20'
          : '🔄 Demande de corrections transmise à l’étudiant.'
      );
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l’évaluation.');
    } finally {
      setIsSubmittingEval(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Detail Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-indigo-600 text-white font-mono text-[10px]">
                {report.reportNumber}
              </Badge>
              <Badge className="bg-slate-800 text-slate-300 text-[10px]">
                {report.specialtyName}
              </Badge>
            </div>
            <h2 className="text-sm sm:text-base font-black text-white truncate max-w-md">
              {report.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              onClick={() => generateProfessionalReportPDF(aggregate)}
              className="h-9 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Officiel</span>
            </Button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Detail Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700 dark:text-slate-300">
          {/* Grille Identité & Contexte */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Apprenant</p>
              <p className="font-black text-slate-900 dark:text-white">{report.studentName}</p>
              <p className="text-[10px] text-slate-500 font-mono">{report.studentMatricule}</p>
            </div>

            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Date & Durée</p>
              <p className="font-bold">{report.activityDate}</p>
              <p className="text-[10px] text-slate-500">{report.durationHours}h ({report.startTime} - {report.endTime})</p>
            </div>

            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Lieu & Client</p>
              <p className="font-bold">{report.location}</p>
              <p className="text-[10px] text-slate-500">{report.clientOrHostOrg}</p>
            </div>

            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Formateur</p>
              <p className="font-bold">{report.assignedTeacherName}</p>
              <p className="text-[10px] text-slate-500">{report.academicYear}</p>
            </div>
          </div>

          {/* SECTION : Données Techniques Spécifiques du Métier */}
          {report.dynamicValues && Object.keys(report.dynamicValues).length > 0 && (
            <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xs uppercase text-indigo-900 dark:text-indigo-300 tracking-wider">
                  Données Techniques Métier ({report.specialtyName})
                </h3>
                {permissions.canEvaluate && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveAnnotatingSection('specifiqueMetier')}
                    className="h-7 px-2 text-[10px] font-bold text-indigo-600"
                  >
                    + Commenter cette section
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(report.dynamicValues).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{key}</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{String(val)}</p>
                  </div>
                ))}
              </div>

              {activeAnnotatingSection === 'specifiqueMetier' && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 space-y-2 mt-2">
                  <Textarea
                    value={newSectionComment}
                    onChange={(e) => setNewSectionComment(e.target.value)}
                    placeholder="Saisissez une observation ou correction sur cette section..."
                    className="min-h-[60px] text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setActiveAnnotatingSection(null)}>
                      Annuler
                    </Button>
                    <Button size="sm" onClick={() => handleAddSectionAnnotation('specifiqueMetier')}>
                      Enregistrer la remarque
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GALERIE D'IMAGES ADAPTATIVE */}
          {report.attachments.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-black text-xs uppercase text-slate-400 tracking-wider">
                Galerie de Photos & Preuves ({report.attachments.length})
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {report.attachments.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setLightboxImage(`/api/professional-reports/${report.id}/attachments/${img.id}/download`)}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 cursor-pointer h-28"
                  >
                    <img
                      src={`/api/professional-reports/${report.id}/attachments/${img.id}/download`}
                      alt={img.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PANNEAU D'ÉVALUATION ENSEIGNANT (Si permission active) */}
          {permissions.canEvaluate && (
            <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/60 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200 dark:border-amber-800/50">
                <div>
                  <h3 className="text-sm font-black text-amber-950 dark:text-amber-200 flex items-center gap-2 uppercase tracking-wider">
                    <Award className="w-5 h-5 text-amber-600" />
                    Évaluation Pédagogique & Validation ({template.specialtyName})
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Saisissez la grille de notation et attribuez la décision finale.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1">
                    Note Calculée : {computedTotalScore} / 20
                  </Badge>
                </div>
              </div>

              {/* Décision */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEvaluationDecision(ProfessionalReportStatus.APPROVED)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    evaluationDecision === ProfessionalReportStatus.APPROVED
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-700'
                  }`}
                >
                  <p className="font-black text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    ✅ Valider & Approuver le Rapport
                  </p>
                  <p className={`text-[10px] mt-1 ${evaluationDecision === ProfessionalReportStatus.APPROVED ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Attribue la note officielle et clôture le rapport.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setEvaluationDecision(ProfessionalReportStatus.CHANGES_REQUESTED)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    evaluationDecision === ProfessionalReportStatus.CHANGES_REQUESTED
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-bold'
                      : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-700'
                  }`}
                >
                  <p className="font-black text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    🔄 Demander des Corrections
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    Renvoie le rapport à l'étudiant avec vos consignes.
                  </p>
                </button>
              </div>

              {/* Grille de critères spécifique */}
              <div className="space-y-2">
                <label className="font-bold block text-xs">Critères d'Évaluation Spécifiques</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {template.evaluationRubric.criteria.map((crit) => (
                    <div key={crit.key} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{crit.label}</p>
                        <p className="text-[10px] text-slate-400">{crit.description}</p>
                      </div>
                      <Input
                        type="number"
                        step="0.5"
                        max={crit.maxPoints}
                        min={0}
                        value={criteriaScores[crit.key] ?? 0}
                        onChange={(e) =>
                          setCriteriaScores((prev) => ({
                            ...prev,
                            [crit.key]: Math.min(Number(e.target.value), crit.maxPoints),
                          }))
                        }
                        className="w-16 h-9 font-black text-indigo-600 text-center text-xs rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Appréciation Générale */}
              <div className="space-y-1">
                <label className="font-bold block text-xs">Appréciation Générale / Consignes *</label>
                <Textarea
                  value={generalFeedback}
                  onChange={(e) => setGeneralFeedback(e.target.value)}
                  placeholder="Rédigez votre évaluation pédagogique ou détaillez les corrections attendues..."
                  className="min-h-[90px] rounded-xl text-xs bg-white dark:bg-slate-900"
                />
              </div>

              <Button
                onClick={handlePerformEvaluation}
                disabled={isSubmittingEval}
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                <Send className="w-4 h-4 mr-2" />
                <span>{isSubmittingEval ? 'Enregistrement...' : 'Enregistrer la Décision & Transmettre'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Image Preview */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img src={lightboxImage} alt="Aperçu" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
};
