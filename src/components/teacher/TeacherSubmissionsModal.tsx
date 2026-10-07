import React, { useState } from 'react';
import { 
  FolderCheck, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Download, 
  Eye, 
  Award, 
  User, 
  ZoomIn, 
  Save, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Search,
  FileCheck,
  Send,
  Sparkles
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TeacherSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  composition: any | null;
  onUpdateComposition?: (updatedComp: any) => void;
}

export default function TeacherSubmissionsModal({
  isOpen,
  onClose,
  composition,
  onUpdateComposition
}: TeacherSubmissionsModalProps) {
  if (!composition) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'missing' | 'graded'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [isSavingGrade, setIsSavingGrade] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; index: number; total: number } | null>(null);

  // Combine grades array and submissions array to get a unified student list
  const studentsList = Array.isArray(composition.grades) ? composition.grades : [];
  const submissionsList = Array.isArray(composition.submissions) ? composition.submissions : [];

  const combinedStudents = studentsList.map((st: any) => {
    const sub = submissionsList.find((s: any) => s.studentId === st.studentId);
    return {
      studentId: st.studentId,
      studentName: st.studentName,
      promo: st.promo || composition.promo,
      grade: sub?.grade ?? st.score,
      comments: sub?.teacherFeedback ?? st.comments,
      submission: sub || null,
      isSubmitted: !!sub,
      isGraded: (typeof sub?.grade === 'number' && sub.grade > 0) || (typeof st.score === 'number' && st.score > 0)
    };
  });

  const filteredStudents = combinedStudents.filter((st: any) => {
    const matchesSearch = st.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          st.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === 'submitted') return st.isSubmitted;
    if (filterStatus === 'missing') return !st.isSubmitted;
    if (filterStatus === 'graded') return st.isGraded;
    return true;
  });

  const totalSubmitted = combinedStudents.filter((s: any) => s.isSubmitted).length;
  const totalGraded = combinedStudents.filter((s: any) => s.isGraded).length;

  const handleSelectStudentForGrading = (st: any) => {
    setSelectedSubmission(st);
    setGradeInput(st.grade !== undefined && st.grade !== null ? String(st.grade) : '');
    setFeedbackInput(st.comments || '');
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;

    const numScore = parseFloat(gradeInput);
    if (isNaN(numScore) || numScore < 0 || numScore > (composition.maxScore || 20)) {
      toast.error(`Veuillez saisir une note valide comprise entre 0 et ${composition.maxScore || 20}.`);
      return;
    }

    setIsSavingGrade(true);
    try {
      const res = await fetch(`/api/compositions/${composition.id}/submissions/${selectedSubmission.studentId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: numScore,
          teacherFeedback: feedbackInput.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Note de ${numScore}/${composition.maxScore || 20} enregistrée pour ${selectedSubmission.studentName} !`);
        if (onUpdateComposition) {
          onUpdateComposition(data.composition);
        }
        // Update local selected
        setSelectedSubmission({
          ...selectedSubmission,
          grade: numScore,
          comments: feedbackInput.trim(),
          isGraded: true
        });
      } else {
        toast.error("Erreur lors de l'enregistrement de la note.");
      }
    } catch (error) {
      console.error("Grade save error:", error);
      toast.error("Impossible de joindre le serveur.");
    } finally {
      setIsSavingGrade(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] sm:max-w-6xl max-h-[94vh] overflow-y-auto p-0 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 shadow-xs">
                <FolderCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    Copies & Réponses des Étudiants
                  </DialogTitle>
                  <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold px-2.5">
                    {composition.title}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Matière : <strong>{composition.subject}</strong> • Promo : <strong>{composition.promo}</strong> • Barème : <strong>/{composition.maxScore || 20}</strong>
                </DialogDescription>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 text-xs font-bold py-1 px-3">
                {totalSubmitted} / {combinedStudents.length} copies remises
              </Badge>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 text-xs font-bold py-1 px-3">
                {totalGraded} notée(s)
              </Badge>
            </div>
          </div>
        </div>

        {/* Modal Layout: 2 Columns */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
          
          {/* Left Column: List of Students (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 space-y-3 overflow-y-auto">
            {/* Search & Filter Toolbar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Rechercher un apprenant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={cn("py-1.5 rounded-lg transition-all", filterStatus === 'all' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500")}
                >
                  Tous ({combinedStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('submitted')}
                  className={cn("py-1.5 rounded-lg transition-all", filterStatus === 'submitted' ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs" : "text-slate-500")}
                >
                  Reçues ({totalSubmitted})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('missing')}
                  className={cn("py-1.5 rounded-lg transition-all", filterStatus === 'missing' ? "bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs" : "text-slate-500")}
                >
                  En attente
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('graded')}
                  className={cn("py-1.5 rounded-lg transition-all", filterStatus === 'graded' ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs" : "text-slate-500")}
                >
                  Notées ({totalGraded})
                </button>
              </div>
            </div>

            {/* Students List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Aucun étudiant ne correspond aux critères.
                </div>
              ) : (
                filteredStudents.map((st: any) => {
                  const isSelected = selectedSubmission?.studentId === st.studentId;
                  const sub = st.submission;

                  return (
                    <div
                      key={st.studentId}
                      onClick={() => handleSelectStudentForGrading(st)}
                      className={cn(
                        "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2",
                        isSelected 
                          ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 shadow-xs" 
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {st.studentName}
                          </p>
                          {st.isGraded && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black px-1.5 py-0">
                              {Number(st.grade).toFixed(1)}/20
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>Promo {st.promo}</span>
                          <span>•</span>
                          {st.isSubmitted ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {sub?.images?.length ? `${sub.images.length} photo(s)` : ''}
                              {sub?.pdfUrl ? ' + PDF' : ''}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">Non remis</span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {st.isSubmitted ? (
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                            <FileCheck className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center font-bold text-xs">
                            <Clock className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Copy Details & Direct Grading (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            {selectedSubmission ? (
              <div className="space-y-6">
                
                {/* Selected Student Banner */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedSubmission.studentName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Identifiant : <span className="font-mono text-indigo-600 font-bold">{selectedSubmission.studentId}</span> • Promo {selectedSubmission.promo}
                    </p>
                  </div>

                  {selectedSubmission.isSubmitted && selectedSubmission.submission?.submittedAt && (
                    <Badge variant="outline" className="text-xs font-bold bg-emerald-50 text-emerald-700 border-emerald-300">
                      Remis le {new Date(selectedSubmission.submission.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                  )}
                </div>

                {/* Submission Content Area */}
                {selectedSubmission.isSubmitted ? (
                  <div className="space-y-4">
                    
                    {/* PDF Submission View */}
                    {selectedSubmission.submission?.pdfUrl && (
                      <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">
                              {selectedSubmission.submission.pdfName || "Copie_Composition.pdf"}
                            </p>
                            <p className="text-[10px] text-rose-700 dark:text-rose-300 font-bold">
                              Document PDF remis par l'étudiant
                            </p>
                          </div>
                        </div>

                        <a
                          href={selectedSubmission.submission.pdfUrl}
                          download={selectedSubmission.submission.pdfName || `Copie_${selectedSubmission.studentName}.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Download className="w-4 h-4" />
                          <span>Télécharger le PDF</span>
                        </a>
                      </div>
                    )}

                    {/* Images Gallery (max 7) */}
                    {Array.isArray(selectedSubmission.submission?.images) && selectedSubmission.submission.images.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-blue-600" />
                            Feuilles de Copie & Photos ({selectedSubmission.submission.images.length} page(s))
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium">Cliquez pour agrandir</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {selectedSubmission.submission.images.map((img: any, idx: number) => (
                            <div
                              key={img.id || idx}
                              onClick={() => setLightboxImage({ url: img.url || img.base64, index: idx, total: selectedSubmission.submission.images.length })}
                              className="relative group rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 aspect-3/4 bg-slate-900 cursor-pointer shadow-xs"
                            >
                              <img
                                src={img.url || img.base64}
                                alt={`Page ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-slate-950/80 text-white font-black text-[9px] rounded-md">
                                Page {idx + 1}
                              </div>
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ZoomIn className="w-5 h-5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Student Comments */}
                    {selectedSubmission.submission?.comments && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                        <strong className="text-slate-500 text-[10px] uppercase font-black block">Remarques de l'apprenant :</strong>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed italic">
                          "{selectedSubmission.submission.comments}"
                        </p>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-center space-y-2">
                    <Clock className="w-8 h-8 text-amber-600 mx-auto" />
                    <p className="font-bold text-xs text-amber-900 dark:text-amber-200">
                      Cet étudiant n'a pas encore soumis de copie numérique.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Vous pouvez néanmoins attribuer une note manuelle (ex: pour une épreuve sur table en présentiel).
                    </p>
                  </div>
                )}

                {/* Direct Grading & Feedback Box */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/80 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Notation & Correction Pédagogique
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Note Attribuée (sur {composition.maxScore || 20}) *
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.25"
                          min="0"
                          max={composition.maxScore || 20}
                          placeholder="ex: 15.5"
                          value={gradeInput}
                          onChange={(e) => setGradeInput(e.target.value)}
                          className="h-11 rounded-xl text-base font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          / {composition.maxScore || 20}
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Appréciation / Commentaire pour l'élève
                      </label>
                      <Textarea
                        placeholder="Ex: Excellent raisonnement sur l'algorithme, attention à la gestion de la mémoire..."
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        className="rounded-xl min-h-[70px] text-xs bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      type="button"
                      onClick={handleSaveGrade}
                      disabled={isSavingGrade}
                      className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs gap-2 shadow-md shadow-emerald-500/20"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingGrade ? "Enregistrement..." : "Valider & Publier la Note"}</span>
                    </Button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3 text-slate-400">
                <FolderCheck className="w-12 h-12 text-slate-300" />
                <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                  Sélectionnez un étudiant dans la liste de gauche pour consulter sa copie et saisir sa note.
                </p>
                <p className="text-xs">
                  Vous pourrez visualiser le PDF complet ou feuilleter les photos de compositions manuscrites.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
          <p className="text-[11px] text-slate-400 font-medium">
            CFP-ITMC Douala • Système Centralisé de Gestion des Évaluations
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl font-bold text-xs"
          >
            Fermer
          </Button>
        </div>

        {/* Lightbox for zooming photos */}
        {lightboxImage && (
          <div
            className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
            onClick={() => setLightboxImage(null)}
          >
            <div className="relative max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl flex flex-col items-center">
              <img
                src={lightboxImage.url}
                alt="Page de copie"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
              <div className="mt-2 px-4 py-1.5 bg-slate-900/90 text-white font-bold text-xs rounded-full">
                Page {lightboxImage.index + 1} sur {lightboxImage.total}
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
