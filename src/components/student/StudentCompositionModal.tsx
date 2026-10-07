import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Trash2, 
  Eye, 
  Layers, 
  Award, 
  Calendar, 
  User, 
  BookOpen, 
  Sparkles, 
  Send, 
  FolderCheck,
  FileCheck,
  ZoomIn,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatFCFA } from '@/utils/formatCurrency';

interface StudentCompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  composition: any | null;
  student: any;
  onSubmissionSuccess?: () => void;
}

export default function StudentCompositionModal({
  isOpen,
  onClose,
  composition,
  student,
  onSubmissionSuccess
}: StudentCompositionModalProps) {
  if (!composition || !student) return null;

  const [pdfFile, setPdfFile] = useState<{ name: string; size: number; base64: string } | null>(null);
  const [imagesList, setImagesList] = useState<Array<{ id: string; name: string; size: number; base64: string }>>([]);
  const [studentComments, setStudentComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Find existing submission of this student
  const existingSubmission = Array.isArray(composition.submissions)
    ? composition.submissions.find((s: any) => s.studentId === student.id)
    : null;

  // Student's grade from grades array if available
  const studentGradeRecord = Array.isArray(composition.grades)
    ? composition.grades.find((g: any) => g.studentId === student.id)
    : null;

  const currentGrade = existingSubmission?.grade ?? studentGradeRecord?.score;
  const teacherFeedback = existingSubmission?.teacherFeedback ?? studentGradeRecord?.comments;

  useEffect(() => {
    if (existingSubmission) {
      if (existingSubmission.pdfUrl) {
        setPdfFile({
          name: existingSubmission.pdfName || "Copie_Composition.pdf",
          size: existingSubmission.pdfSize || 0,
          base64: existingSubmission.pdfUrl
        });
      } else {
        setPdfFile(null);
      }

      if (Array.isArray(existingSubmission.images)) {
        setImagesList(existingSubmission.images.map((img: any, idx: number) => ({
          id: img.id || `img-${idx}`,
          name: img.name || `Page_${idx + 1}.jpg`,
          size: img.size || 0,
          base64: img.url || img.base64
        })));
      } else {
        setImagesList([]);
      }

      setStudentComments(existingSubmission.comments || '');
    } else {
      setPdfFile(null);
      setImagesList([]);
      setStudentComments('');
    }
  }, [existingSubmission, composition]);

  // Handle PDF Upload with 3 MB max limit
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check PDF extension/type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error("Veuillez sélectionner un document au format PDF valide.");
      return;
    }

    // 3 MB Limit = 3 * 1024 * 1024 bytes
    const maxBytes = 3 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`Le fichier PDF est trop volumineux (${(file.size / (1024 * 1024)).toFixed(2)} Mo). La taille maximale autorisée est de 3 Mo.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPdfFile({
        name: file.name,
        size: file.size,
        base64: reader.result as string
      });
      toast.success(`Document PDF "${file.name}" chargé avec succès (${(file.size / 1024).toFixed(0)} Ko)`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Images Upload with 7 images max, 4 MB each
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (imagesList.length + files.length > 7) {
      toast.error(`Vous ne pouvez pas dépasser la limite de 7 images au total (actuellement ${imagesList.length}, vous tentez d'en ajouter ${files.length}).`);
      return;
    }

    const maxBytes = 4 * 1024 * 1024; // 4 MB each

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`Le fichier "${file.name}" n'est pas une image.`);
        return;
      }

      if (file.size > maxBytes) {
        toast.error(`L'image "${file.name}" dépasse la limite de 4 Mo (${(file.size / (1024 * 1024)).toFixed(2)} Mo).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagesList((prev) => {
          if (prev.length >= 7) return prev;
          return [
            ...prev,
            {
              id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: file.name,
              size: file.size,
              base64: reader.result as string
            }
          ];
        });
        toast.success(`Photo "${file.name}" ajoutée (${(file.size / 1024).toFixed(0)} Ko)`);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveImage = (id: string) => {
    setImagesList((prev) => prev.filter((img) => img.id !== id));
    toast.info("Image retirée.");
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    toast.info("Fichier PDF retiré.");
  };

  // Submit student copy
  const handleSubmitCopy = async () => {
    if (!pdfFile && imagesList.length === 0 && !studentComments.trim()) {
      toast.error("Veuillez joindre au moins un fichier PDF, une image ou saisir vos réponses avant de valider.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        studentId: student.id,
        studentName: student.name,
        studentMatricule: student.matricule || "",
        promo: student.promo || student.classCode || composition.promo || "G1",
        pdfUrl: pdfFile?.base64,
        pdfName: pdfFile?.name,
        pdfSize: pdfFile?.size,
        images: imagesList.map((img) => ({
          id: img.id,
          name: img.name,
          size: img.size,
          url: img.base64
        })),
        comments: studentComments.trim()
      };

      const res = await fetch(`/api/compositions/${composition.id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Votre copie d'évaluation a été remise avec succès à l'enseignant !");
        if (onSubmissionSuccess) {
          onSubmissionSuccess();
        }
        onClose();
      } else {
        toast.error(data.error || "Erreur lors de la remise de votre copie.");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Impossible de transmettre la copie. Vérifiez votre connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allowSubmissions = composition.allowStudentSubmissions || composition.requiresSubmission;
  const resourcesList = Array.isArray(composition.resources) ? composition.resources : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] sm:max-w-4xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        
        {/* Header Banner */}
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 shadow-xs">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {composition.title}
                  </DialogTitle>
                  <Badge className={cn(
                    "text-[10px] font-black uppercase px-2.5 py-0.5",
                    composition.type === 'Composition Normale' 
                      ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300"
                      : "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                  )}>
                    {composition.type}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{composition.subject}</span>
                  <span>•</span>
                  <span>Enseignant : <strong className="text-slate-700 dark:text-slate-300">{composition.teacherName || 'Formateur ITMC'}</strong></span>
                  <span>•</span>
                  <span>Coeff : <strong className="text-blue-600">{composition.coefficient || 1}</strong></span>
                  <span>•</span>
                  <span>Barème : <strong className="text-emerald-600">/{composition.maxScore || 20}</strong></span>
                </DialogDescription>
              </div>
            </div>

            {/* Existing Submission Badge */}
            {existingSubmission && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold py-1 px-3 gap-1.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copie déposée</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">

          {/* Teacher Subject & Instructions Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Énoncé, Sujet & Consignes de l'Évaluation
                </h4>
              </div>
              {composition.durationMinutes && (
                <Badge variant="outline" className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950 border-indigo-200 text-indigo-700 dark:text-indigo-300 gap-1">
                  <Clock className="w-3 h-3 text-indigo-600" />
                  <span>Durée : {composition.durationMinutes} min</span>
                </Badge>
              )}
            </div>

            {/* Subject Text Content */}
            {composition.subjectText ? (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                {composition.subjectText}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Consultez les documents et ressources joints par l'enseignant ci-dessous pour traiter cette épreuve.
              </p>
            )}

            {/* Resources Diffusion Section (PDFs, Documents, Images) */}
            {resourcesList.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FolderCheck className="w-3.5 h-3.5 text-blue-600" />
                  Ressources & Fichiers du Sujet Diffusés par le Formateur ({resourcesList.length}) :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {resourcesList.map((res: any, idx: number) => {
                    const isPdf = res.type === 'pdf' || res.name?.toLowerCase().endsWith('.pdf');
                    const isImg = res.type === 'image' || res.name?.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);

                    return (
                      <div 
                        key={res.id || idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            isPdf ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400" : "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                          )}>
                            {isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {res.name || `Ressource_${idx + 1}`}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {res.size ? `${(res.size / 1024).toFixed(0)} Ko • ` : ''}{isPdf ? 'Document PDF officiel' : 'Image du sujet'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {isImg && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setPreviewImage(res.url || res.base64)}
                              className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-blue-600"
                              title="Aperçu"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <a
                            href={res.url || res.base64}
                            download={res.name || `Sujet_${composition.title}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[11px] font-bold gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Télécharger</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Student Feedback & Note (If already graded) */}
          {typeof currentGrade === 'number' && (
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-black uppercase text-emerald-950 dark:text-emerald-300 tracking-wider">
                    Évaluation Corrigée & Notée
                  </span>
                </div>
                <div className="px-3 py-1 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-xs">
                  {currentGrade.toFixed(1)} / {composition.maxScore || 20}
                </div>
              </div>
              {teacherFeedback && (
                <div className="pt-2 text-xs text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <strong className="text-emerald-800 dark:text-emerald-400 block mb-0.5">Appréciation de l'enseignant :</strong>
                  {teacherFeedback}
                </div>
              )}
            </div>
          )}

          {/* Student Submissions Section */}
          {allowSubmissions ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 p-4 sm:p-5 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>Dépôt de votre Copie & Réponses</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Transmettez votre travail sous forme de <strong>PDF (max 3 Mo)</strong> ou de <strong>photos de copies (max 7 images de 4 Mo chacune)</strong>.
                  </p>
                </div>

                {existingSubmission?.submittedAt && (
                  <Badge variant="outline" className="text-[10px] font-bold border-slate-300 text-slate-600 dark:text-slate-300">
                    Déposé le {new Date(existingSubmission.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </Badge>
                )}
              </div>

              {/* PDF Document Upload Area */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-rose-600" />
                    Copie au Format PDF (1 Fichier max • Limite 3 Mo)
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Optionnel si vous envoyez des images</span>
                </label>

                {pdfFile ? (
                  <div className="flex items-center justify-between p-3.5 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {pdfFile.name}
                        </p>
                        <p className="text-[10px] text-rose-700 dark:text-rose-300 font-bold">
                          {pdfFile.size ? `${(pdfFile.size / 1024).toFixed(0)} Ko • ` : ''}Document PDF prêt pour transmission
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={pdfFile.base64}
                        download={pdfFile.name}
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-600 border border-slate-200 dark:border-slate-700"
                        title="Télécharger l'aperçu"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={handleRemovePdf}
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 text-rose-600 hover:bg-rose-100 border border-rose-200 dark:border-rose-900"
                        title="Retirer ce PDF"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all">
                    <FileText className="w-7 h-7 text-rose-500 mb-1.5" />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      Cliquer pour charger votre Copie PDF
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      Format .pdf uniquement • Taille maximale : 3 Mo
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handlePdfUpload}
                    />
                  </label>
                )}
              </div>

              {/* Images / Photo Copies Upload Area */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Photos & Feuilles de Composition Manuscrites</span>
                  </label>
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-black",
                    imagesList.length >= 7 ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-slate-100 text-slate-700"
                  )}>
                    {imagesList.length} / 7 photos (max 4 Mo chacune)
                  </Badge>
                </div>

                {/* Images Grid */}
                {imagesList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {imagesList.map((img, idx) => (
                      <div 
                        key={img.id}
                        className="relative group rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs aspect-3/4 flex flex-col"
                      >
                        <img 
                          src={img.base64} 
                          alt={img.name} 
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Page number badge */}
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-slate-900/80 text-white font-black text-[9px] rounded-md backdrop-blur-xs">
                          Page {idx + 1}
                        </div>

                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewImage(img.base64)}
                            className="p-2 bg-white text-slate-900 rounded-lg hover:bg-slate-100"
                            title="Agrandir"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img.id)}
                            className="p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Images Button (if under 7) */}
                {imagesList.length < 7 && (
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-200 dark:border-blue-900 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 cursor-pointer text-xs font-bold text-blue-700 dark:text-blue-300 transition-all">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Ajouter des Photos de votre Copie ({7 - imagesList.length} restante(s) • max 4 Mo/photo)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImagesUpload}
                    />
                  </label>
                )}
              </div>

              {/* Text Notes / Complementary Answers */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Commentaires / Réponses écrites complémentaires (Optionnel)
                </label>
                <Textarea
                  placeholder="Saisissez ici toute note, précision ou réponse complémentaire pour l'enseignant..."
                  value={studentComments}
                  onChange={(e) => setStudentComments(e.target.value)}
                  className="rounded-xl min-h-[70px] text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  onClick={handleSubmitCopy}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs gap-2 shadow-md shadow-indigo-500/20"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Transmission en cours..." : (existingSubmission ? "Mettre à jour mon Dépôt" : "Transmettre ma Copie à l'Enseignant")}</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-center space-y-1.5">
              <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
              <p className="font-bold text-xs text-amber-900 dark:text-amber-200">
                Cette composition est en mode consultation ou épreuve sur table en présentiel.
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                L'enseignant n'a pas exigé de dépôt numérique pour cette épreuve. Les notes seront publiées directement après correction.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
          <p className="text-[11px] text-slate-400 font-medium">
            CFP-ITMC Douala • Portail Examens & Compositions Sécurisé
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

        {/* Full Image Preview Overlay */}
        {previewImage && (
          <div 
            className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
              <img 
                src={previewImage} 
                alt="Aperçu Grand Format" 
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
              <button
                onClick={() => setPreviewImage(null)}
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
