import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Clock, 
  Video, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  BookMarked,
  Pencil,
  Eye,
  EyeOff,
  Plus, 
  MoreVertical,
  PlayCircle,
  FileCode,
  Layout,
  ChevronRight,
  ArrowRight,
  Upload,
  Link as LinkIcon,
  HelpCircle,
  X,
  Loader2,
  Settings,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TeacherModules() {
  const { teacher } = useOutletContext<{ teacher: any }>();
  const navigate = useNavigate();
  const [modules, setModules] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [allProgress, setAllProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewModuleOpen, setIsNewModuleOpen] = useState(false);
  const [isNewLessonOpen, setIsNewLessonOpen] = useState(false);
  const [isNewResourceOpen, setIsNewResourceOpen] = useState(false);
  const [isNewQuizOpen, setIsNewQuizOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingResource, setViewingResource] = useState<any>(null);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  // Edit and Suspend Module states
  const [isEditModuleOpen, setIsEditModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [editModuleData, setEditModuleData] = useState({ name: '', description: '', isSuspended: false });

  // Relational tracking states
  const [viewingLessonTracking, setViewingLessonTracking] = useState<{ module: any; lesson: any } | null>(null);
  const [trackingTab, setTrackingTab] = useState<'students' | 'quizzes'>('students');
  const [viewingModuleLeaderboard, setViewingModuleLeaderboard] = useState<any | null>(null);
  
  const [manualStudyStudentId, setManualStudyStudentId] = useState<string>('');
  const [manualStudyMinutes, setManualStudyMinutes] = useState<number>(30);
  const [editingGradeSubmission, setEditingGradeSubmission] = useState<any | null>(null);
  const [gradePointsInput, setGradePointsInput] = useState<number>(0);
  const [teacherFeedbackInput, setTeacherFeedbackInput] = useState<string>('');
  
  const [newModuleData, setNewModuleData] = useState<{ name: string; description: string; lessons?: number }>({ name: '', description: '', lessons: 10 });
  const [newLessonData, setNewLessonData] = useState({ title: '', description: '' });
  const [newResourceData, setNewResourceData] = useState({ title: '', type: 'video' });
  const [newQuizData, setNewQuizData] = useState<{
    title: string;
    timer: number;
    questions: Array<{
      id: string;
      text: string;
      type: 'multiple_choice' | 'single_choice' | 'text' | 'file';
      options?: string[];
      correctAnswers?: string[];
    }>;
  }>({ 
    title: '', 
    timer: 60, 
    questions: [{ 
      id: '1', 
      text: '', 
      type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C'],
      correctAnswers: ['Option A']
    }] 
  });

  const fetchModules = async () => {
    try {
      const [modRes, studRes, progRes] = await Promise.all([
        fetch('/api/modules/relational'),
        fetch('/api/students'),
        fetch('/api/progress')
      ]);

      if (modRes.ok) {
        const relMods = await modRes.json();
        const myMods = teacher.specialty ? relMods.filter((m: any) => m.specialty === teacher.specialty) : relMods;
        setModules(myMods);
        // If viewing tracking modal, keep it updated
        if (viewingLessonTracking) {
          const updatedMod = relMods.find((m: any) => m.id === viewingLessonTracking.module.id);
          if (updatedMod) {
            const updatedLes = (updatedMod.lessons || []).find((l: any) => l.id === viewingLessonTracking.lesson.id);
            if (updatedLes) {
              setViewingLessonTracking({ module: updatedMod, lesson: updatedLes });
            }
          }
        }
        if (viewingModuleLeaderboard) {
          const updatedMod = relMods.find((m: any) => m.id === viewingModuleLeaderboard.id);
          if (updatedMod) setViewingModuleLeaderboard(updatedMod);
        }
      }
      if (studRes.ok) setStudents(await studRes.json());
      if (progRes.ok) setAllProgress(await progRes.json());
    } catch (err) {
      toast.error("Erreur lors du chargement des données relationnelles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const formatDateFrench = (dateStr?: string) => {
    if (!dateStr) return 'Non renseigné';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleToggleStudentModulePresence = async (modId: string, studentId: string, currentlyDeactivated: boolean, studentName: string) => {
    let reason = '';
    if (!currentlyDeactivated) {
      const inputReason = window.prompt(`Saisissez le motif de désactivation de la présence pour ${studentName} dans ce module :`, "Absences répétées / Non respect du règlement");
      if (inputReason === null) return;
      reason = inputReason.trim() || "Désactivé par l'enseignant";
    } else {
      if (!window.confirm(`Voulez-vous réactiver la présence de ${studentName} pour ce module ?`)) return;
    }

    try {
      const res = await fetch(`/api/modules/${modId}/students/${studentId}/toggle-presence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deactivated: !currentlyDeactivated,
          reason
        })
      });

      if (res.ok) {
        toast.success(!currentlyDeactivated 
          ? `Présence de ${studentName} désactivée pour ce module !` 
          : `Présence de ${studentName} réactivée avec succès !`
        );
        fetchModules();
      } else {
        toast.error("Erreur lors de la mise à jour du statut de présence");
      }
    } catch {
      toast.error("Erreur réseau lors du changement de statut");
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGradeSubmission) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/progress/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: editingGradeSubmission.id,
          lessonPoints: gradePointsInput,
          teacherFeedback: teacherFeedbackInput
        })
      });
      if (res.ok) {
        toast.success("Évaluation et note enregistrées avec succès !");
        setEditingGradeSubmission(null);
        await fetchModules();
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch {
      toast.error("Erreur serveur lors de la notation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkStudentStudied = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingLessonTracking || !manualStudyStudentId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/progress/mark-studied', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: manualStudyStudentId,
          moduleId: viewingLessonTracking.module.id,
          lessonId: viewingLessonTracking.lesson.id,
          timeSpentMinutes: Number(manualStudyMinutes) || 30
        })
      });
      if (res.ok) {
        toast.success("Passage de l'élève enregistré !");
        setManualStudyStudentId('');
        await fetchModules();
      } else {
        toast.error("Erreur lors de l'enregistrement du passage");
      }
    } catch {
      toast.error("Erreur serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleData.name.trim()) {
      toast.error("Le nom du module est requis");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newModuleData.name,
          description: newModuleData.description,
          lessonsCount: Number(newModuleData.lessons) || 1,
          startDate: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        })
      });
      if (res.ok) {
        toast.success("Module créé avec succès !");
        setIsNewModuleOpen(false);
        setNewModuleData({ name: '', description: '', lessons: 10 });
        await fetchModules();
      } else {
        toast.error("Erreur lors de la création du module");
      }
    } catch (err) {
      toast.error("Erreur réseau lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (modId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce module et tout son contenu ?")) return;
    try {
      const res = await fetch(`/api/modules/${modId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Module supprimé avec succès !");
        await fetchModules();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur réseau lors de la suppression");
    }
  };

  const handleDeleteLesson = async (modId: string, lesId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce cours ?")) return;
    try {
      const res = await fetch(`/api/modules/${modId}/lessons/${lesId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Cours supprimé avec succès !");
        await fetchModules();
      } else {
        toast.error("Erreur lors de la suppression du cours");
      }
    } catch {
      toast.error("Erreur réseau lors de la suppression");
    }
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/modules/${editingModule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editModuleData.name,
          description: editModuleData.description,
          isSuspended: editModuleData.isSuspended
        })
      });
      if (res.ok) {
        toast.success("Module modifié avec succès !");
        setIsEditModuleOpen(false);
        setEditingModule(null);
        await fetchModules();
      } else {
        toast.error("Erreur lors de la modification du module");
      }
    } catch {
      toast.error("Erreur réseau lors de la modification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleModuleSuspension = async (mod: any) => {
    const newSuspendedState = !mod.isSuspended;
    try {
      const res = await fetch(`/api/modules/${mod.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuspended: newSuspendedState })
      });
      if (res.ok) {
        toast.success(newSuspendedState ? "Module suspendu (masqué/gelé pour les élèves)" : "Module réactivé avec succès !");
        await fetchModules();
      } else {
        toast.error("Erreur lors de la mise à jour du statut");
      }
    } catch {
      toast.error("Erreur réseau lors du changement de statut");
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/modules/${selectedModule.id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLessonData)
      });
      if (res.ok) {
        toast.success("Leçon ajoutée au module !");
        setIsNewLessonOpen(false);
        setNewLessonData({ title: '', description: '' });
        fetchModules();
      }
    } catch (err) {
      toast.error("Erreur lors de la création de la leçon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !selectedLesson) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/modules/${selectedModule.id}/lessons/${selectedLesson.id}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResourceData)
      });
      if (res.ok) {
        toast.success("Ressource publiée !");
        setIsNewResourceOpen(false);
        setNewResourceData({ title: '', type: 'video' });
        fetchModules();
      }
    } catch (err) {
      toast.error("Erreur lors de la publication");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !selectedLesson) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/modules/${selectedModule.id}/lessons/${selectedLesson.id}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuizData)
      });
      if (res.ok) {
        toast.success("Quiz créé avec succès !");
        setIsNewQuizOpen(false);
        setNewQuizData({ 
          title: '', 
          timer: 60, 
          questions: [{ 
            id: '1', 
            text: '', 
            type: 'multiple_choice',
            options: ['Option A', 'Option B', 'Option C'],
            correctAnswers: ['Option A']
          }] 
        });
        fetchModules();
      }
    } catch (err) {
      toast.error("Erreur lors de la création du quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (modId: string, lesId: string, resId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette ressource ?")) return;
    try {
      const res = await fetch(`/api/modules/${modId}/lessons/${lesId}/resources/${resId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Ressource supprimée");
        fetchModules();
      }
    } catch (err) {
      toast.error("Échec de la suppression");
    }
  };

  const toggleLessonStatus = async (modId: string, lessonId: string, isSuspended: boolean) => {
    try {
      const res = await fetch(`/api/modules/${modId}/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuspended: !isSuspended })
      });
      if (res.ok) {
        toast.success(!isSuspended ? "Leçon gelée (suspendue)" : "Leçon réactivée");
        fetchModules();
      }
    } catch (err) {
      toast.error("Erreur lors de l'opération");
    }
  };

  const toggleResourceStatus = async (modId: string, lesId: string, resId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await fetch(`/api/modules/${modId}/lessons/${lesId}/resources/${resId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(newStatus === 'active' ? "Ressource réactivée" : "Ressource suspendue");
        fetchModules();
      }
    } catch (err) {
      toast.error("Échec de l'opération");
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video': return Video;
      case 'quiz': return HelpCircle;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Mes Modules</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gérez vos contenus et suivez l'avancement</p>
        </div>
        <Button 
          onClick={() => setIsNewModuleOpen(true)}
          className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5 mr-2" /> Nouveau Module
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {modules.map((mod: any, idx: number) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-2xl sm:rounded-[2rem]">
              <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-72 bg-slate-50 dark:bg-slate-800/80 p-5 sm:p-8 flex flex-col justify-between shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
                        {idx + 1}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingModule(mod);
                            setEditModuleData({ name: mod.name || '', description: mod.description || '', isSuspended: !!mod.isSuspended });
                            setIsEditModuleOpen(true);
                          }}
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-colors"
                          title="Modifier le module"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleModuleSuspension(mod)}
                          className={cn(
                            "h-8 w-8 rounded-xl transition-colors",
                            mod.isSuspended ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40" : "text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          )}
                          title={mod.isSuspended ? "Réactiver le module" : "Suspendre le module"}
                        >
                          {mod.isSuspended ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteModule(mod.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                          title="Supprimer le module"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {mod.isSuspended ? (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-none font-black text-[9px] uppercase px-3 py-1 mb-2">
                        ⏸️ Suspendu (Gelé)
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 border-none font-black text-[9px] uppercase px-3 py-1 mb-2">
                        ▶️ En Cours / Actif
                      </Badge>
                    )}
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight mb-2 break-words">{mod.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Démarré le {mod.startDate}</p>
                  </div>
                  <div className="mt-6 sm:mt-8 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Avancement</span>
                        <span className="text-sm font-black text-blue-600">{mod.progress}%</span>
                      </div>
                      <Progress value={mod.progress} className="h-2 bg-white dark:bg-slate-700" />
                    </div>
                    <Button 
                      onClick={() => setViewingModuleLeaderboard(mod)}
                      className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Synthèse & Points ({mod.totalActiveStudents || 0} Élèves)</span>
                    </Button>
                  </div>
                </div>

                <div className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leçons</p>
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-blue-500 shrink-0" />
                        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{mod.completed || 0} / {Array.isArray(mod.lessons) ? mod.lessons.length : (mod.lessons || 0)}</p>
                      </div>
                    </div>
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Évaluations</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{(mod.resources || []).filter((r: any) => r.type === 'Quiz').length} Quiz actifs</p>
                      </div>
                    </div>
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</p>
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{(mod.resources || []).filter((r: any) => r.type === 'Document' || r.type === 'pdf').length} fichiers</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Leçons & Programme</h4>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => { setSelectedModule(mod); setIsNewLessonOpen(true); }}
                        className="text-[9px] font-black uppercase text-blue-600 hover:bg-blue-50 self-start sm:self-auto"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Ajouter une leçon
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {(mod.lessons || []).map((lesson: any, li: number) => (
                        <div key={lesson.id} className={cn(
                          "p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all space-y-4",
                          lesson.isSuspended ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-100 dark:border-slate-800 shadow-sm"
                        )}>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                                {li + 1}
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-sm font-black text-slate-900 dark:text-white truncate">{lesson.title}</h5>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{(lesson.resources || []).length} ressources • {(lesson.quizzes || []).length} quiz</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              {/* 1. Suivi Élèves */}
                              <button 
                                type="button"
                                onClick={() => {
                                  setViewingLessonTracking({ module: mod, lesson });
                                  setTrackingTab('students');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-[11px] font-bold transition-all shadow-xs"
                              >
                                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                <span>Suivi élèves ({lesson.studentsWhoStudied?.length || 0} vus)</span>
                              </button>

                              {/* 2. Geler / Réactiver */}
                              <button 
                                type="button"
                                onClick={() => toggleLessonStatus(mod.id, lesson.id, lesson.isSuspended)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all shadow-xs",
                                  lesson.isSuspended 
                                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100" 
                                    : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                                )}
                              >
                                {lesson.isSuspended ? (
                                  <>
                                    <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>Réactiver</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span>Geler</span>
                                  </>
                                )}
                              </button>

                              {/* 3. + Ressource */}
                              <button 
                                type="button"
                                onClick={() => { setSelectedModule(mod); setSelectedLesson(lesson); setIsNewResourceOpen(true); }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 text-[11px] font-bold transition-all shadow-xs"
                              >
                                <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>Ressource</span>
                              </button>

                              {/* 4. + Quiz */}
                              <button 
                                type="button"
                                onClick={() => { setSelectedModule(mod); setSelectedLesson(lesson); setIsNewQuizOpen(true); }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 text-[11px] font-bold transition-all shadow-xs"
                              >
                                <Plus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                <span>Quiz</span>
                              </button>

                              {/* 5. Supprimer */}
                              <button 
                                type="button"
                                onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
                                title="Supprimer cette leçon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {(lesson.resources || []).map((resource: any) => {
                              const ResIcon = getIcon(resource.type);
                              return (
                                <div key={resource.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 group">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <ResIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                                      {resource.title}
                                      {resource.status === 'suspended' && <span className="ml-2 text-[7px] text-orange-500 font-bold uppercase">(Suspendu)</span>}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button 
                                      onClick={() => setViewingResource(resource)}
                                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-blue-500"
                                      title="Consulter le contenu"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => toggleResourceStatus(mod.id, lesson.id, resource.id, resource.status)}
                                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"
                                    >
                                      {resource.status === 'suspended' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-orange-500" />}
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteResource(mod.id, lesson.id, resource.id)}
                                      className="p-1 hover:bg-red-100 rounded text-red-500"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )})}
                              {(lesson.quizzes || []).map((quiz: any) => (
                                <div key={quiz.id} className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 group">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <HelpCircle className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 truncate">{quiz.title} ({Math.floor(quiz.timer / 60)}min)</span>
                                  </div>
                                  <Badge className="bg-purple-100 text-purple-600 border-none text-[8px] uppercase shrink-0">{quiz.questions?.length} Qs</Badge>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 items-stretch gap-2 sm:gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/teacher/students')}
                        className="rounded-xl font-black text-[10px] uppercase tracking-wider h-10 px-3 sm:px-4 border-slate-200 dark:border-slate-800 shrink-0 w-full whitespace-normal text-center"
                      >
                        Gérer les Étudiants
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => { setSelectedModule(mod); setIsStatsOpen(true); }}
                        className="rounded-xl font-black text-[10px] uppercase tracking-wider h-10 px-3 sm:px-4 border-slate-200 dark:border-slate-800 shrink-0 w-full whitespace-normal text-center"
                      >
                        Statistiques
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => { setSelectedModule(mod); setIsDetailOpen(true); }}
                      className="rounded-xl font-black text-[10px] uppercase tracking-wider h-10 px-3 sm:px-4 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 justify-between md:justify-start shrink-0 w-full md:w-auto mt-1 md:mt-0"
                    >
                      <span>Ouvrir le module</span> <ArrowRight className="w-4 h-4 ml-2 shrink-0" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* New Module Dialog */}
      <Dialog open={isNewModuleOpen} onOpenChange={setIsNewModuleOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-md rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Nouveau Module</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Créez un nouveau support de cours
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateModule} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titre du Module</label>
              <Input 
                value={newModuleData.name}
                onChange={(e) => setNewModuleData({...newModuleData, name: e.target.value})}
                placeholder="Ex: Développement Mobile Flutter" 
                className="h-12 rounded-xl bg-slate-50 border-none font-bold" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description</label>
              <textarea 
                value={newModuleData.description}
                onChange={(e) => setNewModuleData({...newModuleData, description: e.target.value})}
                className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-sm min-h-[100px] outline-none focus:ring-2 ring-blue-500/20" 
                placeholder="Objectifs pédagogiques..." 
                required
              />
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl">
              Créer le Module
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={isEditModuleOpen} onOpenChange={setIsEditModuleOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-lg rounded-2xl sm:rounded-[2.5rem] border-none p-6 md:p-8 bg-white dark:bg-slate-900 shadow-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Modifier le Module</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Mettez à jour le nom, la description et l'état du cours
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateModule} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom du module</label>
              <Input 
                value={editModuleData.name}
                onChange={(e) => setEditModuleData({...editModuleData, name: e.target.value})}
                placeholder="Ex: Programmation Web Avancée"
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description / Objectifs</label>
              <textarea 
                rows={4}
                value={editModuleData.description}
                onChange={(e) => setEditModuleData({...editModuleData, description: e.target.value})}
                placeholder="Présentation générale du module..."
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">Statut du Module</p>
                <p className="text-[10px] font-bold text-slate-400">Geler ou débloquer la visibilité pour les élèves</p>
              </div>
              <Button
                type="button"
                variant={editModuleData.isSuspended ? "destructive" : "outline"}
                onClick={() => setEditModuleData({...editModuleData, isSuspended: !editModuleData.isSuspended})}
                className="rounded-xl font-black text-xs"
              >
                {editModuleData.isSuspended ? "Actuellement Suspendu" : "Actif (Visible)"}
              </Button>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModuleOpen(false)} className="flex-1 h-12 rounded-2xl font-bold">
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Lesson Dialog */}
      <Dialog open={isNewLessonOpen} onOpenChange={setIsNewLessonOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-md rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Nouvelle Leçon</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Module: {selectedModule?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLesson} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titre de la leçon</label>
              <Input 
                value={newLessonData.title}
                onChange={(e) => setNewLessonData({...newLessonData, title: e.target.value})}
                placeholder="Ex: Chapitre 1: Introduction" 
                className="h-12 rounded-xl bg-slate-50 border-none font-bold" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Objectifs</label>
              <textarea 
                value={newLessonData.description}
                onChange={(e) => setNewLessonData({...newLessonData, description: e.target.value})}
                className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-sm min-h-[80px] outline-none focus:ring-2 ring-blue-500/20" 
                placeholder="Décrivez ce que l'étudiant va apprendre..." 
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Créer la Leçon"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Quiz Dialog */}
      <Dialog open={isNewQuizOpen} onOpenChange={setIsNewQuizOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-2xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              Créer un Quiz Interactif
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Leçon : {selectedLesson?.title}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateQuiz} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titre du Quiz</label>
              <Input 
                value={newQuizData.title}
                onChange={(e) => setNewQuizData({...newQuizData, title: e.target.value})}
                placeholder="Ex: Évaluation & Questionnaire Chapitre 1" 
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold" 
                required 
              />
            </div>

            {/* Timer in SECONDS */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Durée du Chronomètre (en SECONDES)
                </label>
                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                  {newQuizData.timer} sec ({Math.floor(newQuizData.timer / 60)} min {newQuizData.timer % 60}s)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Input 
                  type="number"
                  value={newQuizData.timer}
                  onChange={(e) => setNewQuizData({...newQuizData, timer: Math.max(10, parseInt(e.target.value) || 30)})}
                  className="h-11 rounded-xl bg-white dark:bg-slate-900 border-none font-mono font-bold text-sm w-36" 
                  min="10"
                  required 
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[30, 45, 60, 120, 300, 600].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewQuizData({...newQuizData, timer: preset})}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer",
                        newQuizData.timer === preset 
                          ? "bg-purple-600 text-white shadow-md" 
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50"
                      )}
                    >
                      {preset}s {preset >= 60 && `(${preset / 60}m)`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Questions ({newQuizData.questions.length})
              </label>

              {newQuizData.questions.map((q, i) => (
                <div key={q.id || i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 space-y-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
                      Question #{i + 1}
                    </span>
                    {newQuizData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newQuizData.questions.filter((_, idx) => idx !== i);
                          setNewQuizData({...newQuizData, questions: updated});
                        }}
                        className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer
                      </button>
                    )}
                  </div>

                  <Input 
                    value={q.text}
                    onChange={(e) => {
                      const newQuestions = [...newQuizData.questions];
                      newQuestions[i].text = e.target.value;
                      setNewQuizData({...newQuizData, questions: newQuestions});
                    }}
                    placeholder={`Intitulé de la question ${i+1}...`}
                    className="h-11 bg-white dark:bg-slate-900 border-none text-xs font-bold"
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-400">Type de question</label>
                    <Select 
                      value={q.type}
                      onValueChange={(val: any) => {
                        const newQuestions = [...newQuizData.questions];
                        newQuestions[i].type = val;
                        if ((val === 'multiple_choice' || val === 'single_choice') && (!newQuestions[i].options || newQuestions[i].options.length === 0)) {
                          newQuestions[i].options = ['Option 1', 'Option 2', 'Option 3'];
                          newQuestions[i].correctAnswers = ['Option 1'];
                        }
                        setNewQuizData({...newQuizData, questions: newQuestions});
                      }}
                    >
                      <SelectTrigger className="h-10 bg-white dark:bg-slate-900 border-none text-xs font-bold">
                        <SelectValue placeholder="Type de réponse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Choix Multiples (Plusieurs bonnes réponses possibles)</SelectItem>
                        <SelectItem value="single_choice">Choix Unique (Une seule bonne réponse)</SelectItem>
                        <SelectItem value="text">Texte Libre / Réponse rédigée</SelectItem>
                        <SelectItem value="file">Document / Image à joindre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Options & Correct Answers for Multiple Choice & Single Choice */}
                  {(q.type === 'multiple_choice' || q.type === 'single_choice') && (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-3 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                          Options de réponses & Bonnes réponses
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">
                          💡 Cochez la ou les cases correctes
                        </span>
                      </div>

                      <div className="space-y-2">
                        {(q.options || ['Option A', 'Option B']).map((opt, optIdx) => {
                          const isCorrect = (q.correctAnswers || []).includes(opt);
                          return (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input 
                                type={q.type === 'single_choice' ? "radio" : "checkbox"}
                                name={`correct_${i}`}
                                checked={isCorrect}
                                onChange={(e) => {
                                  const newQuestions = [...newQuizData.questions];
                                  const curCorrect = newQuestions[i].correctAnswers || [];
                                  if (q.type === 'single_choice') {
                                    newQuestions[i].correctAnswers = [opt];
                                  } else {
                                    if (e.target.checked) {
                                      if (!curCorrect.includes(opt)) curCorrect.push(opt);
                                    } else {
                                      newQuestions[i].correctAnswers = curCorrect.filter(c => c !== opt);
                                    }
                                  }
                                  setNewQuizData({...newQuizData, questions: newQuestions});
                                }}
                                className="w-4 h-4 accent-purple-600 cursor-pointer shrink-0"
                              />

                              <Input 
                                value={opt}
                                onChange={(e) => {
                                  const newQuestions = [...newQuizData.questions];
                                  const oldOpt = (newQuestions[i].options || [])[optIdx];
                                  const newOpt = e.target.value;
                                  if (newQuestions[i].options) {
                                    newQuestions[i].options![optIdx] = newOpt;
                                  }
                                  // Update in correctAnswers if changed
                                  if (newQuestions[i].correctAnswers) {
                                    newQuestions[i].correctAnswers = newQuestions[i].correctAnswers!.map(c => c === oldOpt ? newOpt : c);
                                  }
                                  setNewQuizData({...newQuizData, questions: newQuestions});
                                }}
                                placeholder={`Choix ${optIdx + 1}`}
                                className={cn(
                                  "h-9 text-xs font-bold border-none",
                                  isCorrect ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-black" : "bg-slate-50 dark:bg-slate-800"
                                )}
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  const newQuestions = [...newQuizData.questions];
                                  const deletedOpt = (newQuestions[i].options || [])[optIdx];
                                  newQuestions[i].options = (newQuestions[i].options || []).filter((_, idx) => idx !== optIdx);
                                  newQuestions[i].correctAnswers = (newQuestions[i].correctAnswers || []).filter(c => c !== deletedOpt);
                                  setNewQuizData({...newQuizData, questions: newQuestions});
                                }}
                                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          const newQuestions = [...newQuizData.questions];
                          const curOpts = newQuestions[i].options || [];
                          curOpts.push(`Option ${curOpts.length + 1}`);
                          newQuestions[i].options = curOpts;
                          setNewQuizData({...newQuizData, questions: newQuestions});
                        }}
                        className="h-8 text-[10px] font-black uppercase text-purple-600 hover:bg-purple-50"
                      >
                        + Ajouter un choix de réponse
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setNewQuizData({
                  ...newQuizData, 
                  questions: [
                    ...newQuizData.questions, 
                    { 
                      id: Date.now().toString(), 
                      text: '', 
                      type: 'multiple_choice',
                      options: ['Option 1', 'Option 2', 'Option 3'],
                      correctAnswers: ['Option 1']
                    }
                  ]
                })}
                className="w-full h-11 rounded-2xl border-dashed border-purple-300 dark:border-purple-800 text-purple-600 font-black text-xs uppercase"
              >
                + Ajouter une question
              </Button>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl cursor-pointer">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Publier le Quiz Officiel"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isNewResourceOpen} onOpenChange={setIsNewResourceOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-md rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Publier une ressource</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Module: {selectedModule?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddResource} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'video', label: 'Vidéo', icon: Video },
                { id: 'document', label: 'Support PDF', icon: FileText },
                { id: 'tp', label: 'TP Pratique', icon: Target },
                { id: 'td', label: 'TD / Devoir', icon: BookMarked },
                { id: 'quiz', label: 'Quiz', icon: HelpCircle },
              ].map(type => (
                <button 
                  key={type.id} 
                  type="button" 
                  onClick={() => setNewResourceData({...newResourceData, type: type.id})}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 transition-all border-2",
                    newResourceData.type === type.id ? "border-blue-600 bg-blue-50 text-blue-600" : "border-transparent hover:bg-slate-100"
                  )}
                >
                  <type.icon className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase">{type.label}</span>
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titre de la ressource</label>
              <Input 
                value={newResourceData.title}
                onChange={(e) => setNewResourceData({...newResourceData, title: e.target.value})}
                placeholder="Ex: TP1 - Installation de l'environnement" 
                className="h-12 rounded-xl bg-slate-50 border-none font-bold" 
                required 
              />
            </div>
            <label className="block border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
              <p className="text-xs font-black text-slate-400 uppercase">Fichier lié à la session</p>
              <p className="text-[10px] font-bold text-slate-300 mt-1">
                {(newResourceData as any).fileName || "Cliquez pour sélectionner un fichier"}
              </p>
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = () => {
                      setNewResourceData({...newResourceData, fileName: file.name, fileContent: reader.result} as any);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Publier maintenant"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Statistics Dialog */}
      <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-2xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Statistiques du Module</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {selectedModule?.name} • Performance globale
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="p-6 border-none bg-slate-50 dark:bg-slate-800 rounded-3xl">
              <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {selectedModule?.progress || 0}%
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Avancement Moyen</p>
            </Card>
            <Card className="p-6 border-none bg-slate-50 dark:bg-slate-800 rounded-3xl">
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {selectedModule?.id === '1' ? '42' : '38'}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Étudiants Actifs</p>
            </Card>
            <Card className="p-6 border-none bg-slate-50 dark:bg-slate-800 rounded-3xl">
              <Target className="w-6 h-6 text-emerald-600 mb-2" />
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {selectedModule?.resources?.length || 0}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Ressources Partagées</p>
            </Card>
          </div>
          <div className="mt-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Performances Récentes</h4>
            <div className="space-y-3">
              {allProgress
                .filter(p => p.moduleId === selectedModule?.id)
                .slice(-5) // Last 5 submissions
                .map((perf, i) => {
                  const student = students.find(s => s.id === perf.studentId);
                  return (
                    <div key={perf.id || i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-[10px] font-black">
                          {student?.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{student?.name || 'Étudiant'}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-blue-600">Soumis</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Quiz ID: {perf.quizId}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {allProgress.filter(p => p.moduleId === selectedModule?.id).length === 0 && (
                <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-4 italic">Aucun quiz soumis pour ce module</p>
              )}
            </div>
          </div>
          <div className="mt-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Progression du Module</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Chapitres terminés</span>
                  <span>{selectedModule?.completed || 0} / {Array.isArray(selectedModule?.lessons) ? selectedModule.lessons.length : 10}</span>
                </div>
                <Progress value={((selectedModule?.completed || 0) / (Array.isArray(selectedModule?.lessons) ? selectedModule.lessons.length : 10)) * 100} className="h-2 bg-slate-100" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Module Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-3xl md:max-w-4xl rounded-2xl sm:rounded-[2.5rem] border-none p-0 overflow-hidden bg-white dark:bg-slate-900 max-h-[92vh] overflow-y-auto">
          <div className="flex flex-col md:flex-row min-h-[400px] md:h-[80vh]">
            <div className="md:w-1/3 bg-slate-900 p-6 sm:p-8 md:p-10 text-white">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-2xl mb-6 shadow-xl shadow-blue-500/20">
                {modules.indexOf(selectedModule) + 1}
              </div>
              <h2 className="text-3xl font-black leading-tight mb-4">{selectedModule?.name}</h2>
              <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                {selectedModule?.description || "Aucune description disponible pour ce module."}
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500">Durée Totale</p>
                    <p className="text-sm font-bold">45 Heures</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500">Objectif</p>
                    <p className="text-sm font-bold">Certification Niveau 1</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-10 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Programme & Ressources</h3>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="rounded-xl border-slate-200">
                  Fermer
                </Button>
              </div>
              <div className="space-y-6">
                {selectedModule?.resources && selectedModule.resources.length > 0 ? (
                  selectedModule.resources.map((resource: any, idx: number) => (
                    <div key={resource.id || idx} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-transparent hover:border-blue-100 dark:hover:border-blue-900 transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center font-black text-slate-400 group-hover:text-blue-600 transition-colors">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{resource.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{resource.type} • {resource.date || 'Récemment'}</p>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-xl text-blue-600">
                          {resource.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  [1, 2, 3].map((lesson) => (
                    <div key={lesson} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-transparent hover:border-blue-100 dark:hover:border-blue-900 transition-all group opacity-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center font-black text-slate-400">
                            {lesson}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">Leçon {lesson}: Contenu à venir</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">En attente de publication</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resource View Dialog */}
      <Dialog open={!!viewingResource} onOpenChange={(open) => !open && setViewingResource(null)}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-2xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">{viewingResource?.title}</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Fichier: {viewingResource?.fileName || "Aucun fichier attaché"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            {viewingResource?.fileContent ? (
              viewingResource.fileContent.startsWith('data:image/') ? (
                <img src={viewingResource.fileContent} alt="Resource" className="max-w-full rounded-xl mx-auto shadow-sm" />
              ) : viewingResource.fileContent.startsWith('data:application/pdf') ? (
                <iframe src={viewingResource.fileContent} className="w-full h-[500px] rounded-xl border border-slate-100 dark:border-slate-800" title="PDF Preview" />
              ) : viewingResource.fileContent.startsWith('data:video/') ? (
                <video src={viewingResource.fileContent} controls className="w-full rounded-xl shadow-sm" />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-4">Aperçu non disponible pour ce type de fichier.</p>
                  <a href={viewingResource.fileContent} download={viewingResource.fileName} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors">
                    Télécharger le fichier
                  </a>
                </div>
              )
            ) : (
               <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-400">Aucun contenu à afficher</p>
               </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Relational Lesson Tracking Dialog */}
      <Dialog open={!!viewingLessonTracking} onOpenChange={(open) => !open && setViewingLessonTracking(null)}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-3xl md:max-w-4xl rounded-2xl sm:rounded-[2.5rem] border-none p-3.5 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          {viewingLessonTracking && (
            <div className="space-y-6">
              <DialogHeader className="text-left space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-none font-black text-[9px] uppercase px-3 py-1">
                    {viewingLessonTracking.module.name}
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-none font-black text-[9px] uppercase px-3 py-1">
                    {viewingLessonTracking.lesson.lessonMaxPoints || 20} Points Max
                  </Badge>
                </div>
                <DialogTitle className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white break-words">
                  Suivi Relationnel : {viewingLessonTracking.lesson.title}
                </DialogTitle>
                <DialogDescription className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest break-words">
                  Assiduité des étudiants, réponses exactes aux quiz et relevé de notes
                </DialogDescription>
              </DialogHeader>

              {/* Navigation Tabs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Button
                  onClick={() => setTrackingTab('students')}
                  className={cn(
                    "h-10 px-3 sm:px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all justify-center w-full sm:w-auto text-center",
                    trackingTab === 'students' 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  )}
                >
                  <Users className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">Élèves ayant suivi le cours ({viewingLessonTracking.lesson.studentsWhoStudied?.length || 0})</span>
                </Button>
                <Button
                  onClick={() => setTrackingTab('quizzes')}
                  className={cn(
                    "h-10 px-3 sm:px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all justify-center w-full sm:w-auto text-center",
                    trackingTab === 'quizzes' 
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  )}
                >
                  <HelpCircle className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">Réponses aux Quiz & Notes ({viewingLessonTracking.lesson.quizResults?.length || 0})</span>
                </Button>
              </div>

              {/* Tab 1: Students Who Studied */}
              {trackingTab === 'students' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    {viewingLessonTracking.lesson.studentsWhoStudied && viewingLessonTracking.lesson.studentsWhoStudied.length > 0 ? (
                      viewingLessonTracking.lesson.studentsWhoStudied.map((st: any) => (
                        <div key={st.id} className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={st.avatar} alt={st.studentName} className="w-10 h-10 rounded-xl bg-white p-0.5 border shadow-sm shrink-0" />
                            <div className="min-w-0">
                              <h5 className="text-sm font-black text-slate-900 dark:text-white truncate">{st.studentName}</h5>
                              <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{st.email} • Promo {st.promo}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700/50">
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase">Lecture</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatDateFrench(st.studiedAt)}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase">Durée</p>
                              <p className="text-xs font-black text-indigo-600">{st.timeSpentMinutes || 30} min</p>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-none font-black text-[9px] uppercase px-3 py-1 shrink-0">
                              Terminé
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-4">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-500">Aucun élève n'a encore enregistré de lecture pour cette leçon.</p>
                      </div>
                    )}
                  </div>

                  {/* Manual Study Entry */}
                  <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-3.5 sm:p-4">
                    <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase mb-3 flex items-center gap-2 break-words">
                      <Plus className="w-4 h-4 text-indigo-600 shrink-0" /> Enregistrer le passage d'un élève sur ce cours
                    </h5>
                    <form onSubmit={handleMarkStudentStudied} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <Select value={manualStudyStudentId} onValueChange={setManualStudyStudentId}>
                          <SelectTrigger className="h-10 w-full bg-white dark:bg-slate-900 rounded-xl text-xs font-bold">
                            <SelectValue placeholder="Sélectionner un étudiant..." />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((s: any) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} ({s.promo} - {s.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        type="number"
                        placeholder="Durée (min)"
                        value={manualStudyMinutes}
                        onChange={(e) => setManualStudyMinutes(Number(e.target.value))}
                        className="h-10 w-full sm:w-32 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold"
                      />
                      <Button
                        type="submit"
                        disabled={!manualStudyStudentId || isSubmitting}
                        className="h-10 w-full sm:w-auto px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider whitespace-nowrap shadow-md cursor-pointer justify-center"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Valider la présence"}
                      </Button>
                    </form>
                  </Card>
                </div>
              )}

              {/* Tab 2: Quiz Responses & Grades */}
              {trackingTab === 'quizzes' && (
                <div className="space-y-6">
                  {viewingLessonTracking.lesson.quizResults && viewingLessonTracking.lesson.quizResults.length > 0 ? (
                    viewingLessonTracking.lesson.quizResults.map((sub: any) => (
                      <Card key={sub.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={sub.avatar} alt={sub.studentName} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white p-0.5 border shadow-sm shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">{sub.studentName}</h5>
                                {(sub.isLate || (sub.overtimeSeconds && sub.overtimeSeconds > 0)) ? (
                                  <Badge className="bg-red-600 text-white font-black text-[9px] uppercase px-2 py-0.5 animate-pulse">
                                    ⏱️ RÉPONSE TARDIVE (+{sub.overtimeSeconds || 15}s)
                                  </Badge>
                                ) : (
                                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-[9px] uppercase px-2 py-0.5">
                                    ⚡ Dans les temps
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase truncate">
                                {sub.email} • Promo {sub.promo} • Temps mis : {Math.floor((sub.timeTakenSeconds || 60) / 60)}m {(sub.timeTakenSeconds || 60) % 60}s
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase">Horodatage</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatDateFrench(sub.submittedAt)}</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-950/60 p-2.5 sm:p-3 rounded-2xl border border-blue-100 dark:border-blue-900">
                              <p className="text-[9px] font-black text-blue-500 uppercase">Note Obtenue</p>
                              <p className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400">
                                {sub.lessonPoints} / {sub.maxLessonPoints || 20} Pts <span className="text-[10px] sm:text-xs font-bold">({sub.scorePercentage}%)</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Exact Student Answers */}
                        <div className="space-y-3">
                          <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Réponses écrites fournies par l'élève :</h6>
                          {sub.answers && sub.answers.length > 0 ? (
                            sub.answers.map((ans: any, ai: number) => (
                              <div key={ans.questionId || ai} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-black text-slate-900 dark:text-white">Question {ai + 1} : {ans.questionText}</p>
                                  <Badge className={cn("border-none text-[9px] font-black px-2 py-0.5", ans.points >= (ans.maxPoints || 10) * 0.7 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                                    {ans.points} / {ans.maxPoints || 10} pts
                                  </Badge>
                                </div>
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                  "{ans.studentAnswer}"
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 font-bold">Aucune réponse détaillée enregistrée.</p>
                          )}
                        </div>

                        {/* Teacher Feedback & Evaluation */}
                        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Appréciation de l'Enseignant</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingGradeSubmission(sub);
                                setGradePointsInput(sub.lessonPoints || 0);
                                setTeacherFeedbackInput(sub.teacherFeedback || '');
                              }}
                              className="text-[9px] font-black uppercase text-indigo-600 hover:bg-indigo-100"
                            >
                              <Pencil className="w-3 h-3 mr-1" /> Modifier la note / Remarque
                            </Button>
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {sub.teacherFeedback ? `"${sub.teacherFeedback}"` : <span className="text-slate-400 italic">Aucune remarque rédigée pour le moment.</span>}
                          </p>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">Aucun étudiant n'a encore soumis de réponse au quiz de cette leçon.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Grade / Feedback Edit Dialog */}
      <Dialog open={!!editingGradeSubmission} onOpenChange={(open) => !open && setEditingGradeSubmission(null)}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-lg rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Évaluer l'Élève</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Attribuer une note et laisser un commentaire constructif
            </DialogDescription>
          </DialogHeader>

          {editingGradeSubmission && (
            <form onSubmit={handleGradeSubmission} className="space-y-4 mt-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center gap-3">
                <img src={editingGradeSubmission.avatar} alt="Student" className="w-10 h-10 rounded-xl bg-white p-0.5" />
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{editingGradeSubmission.studentName}</p>
                  <p className="text-[10px] font-bold text-slate-400">{editingGradeSubmission.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">
                  Note attribuée sur la leçon (Max {editingGradeSubmission.maxLessonPoints || 20} Points)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={editingGradeSubmission.maxLessonPoints || 20}
                  value={gradePointsInput}
                  onChange={(e) => setGradePointsInput(Number(e.target.value))}
                  className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">
                  Remarque / Feedback Pédagogique
                </label>
                <textarea
                  rows={4}
                  value={teacherFeedbackInput}
                  onChange={(e) => setTeacherFeedbackInput(e.target.value)}
                  placeholder="Écrivez vos conseils ou remarques sur ses réponses..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingGradeSubmission(null)} className="flex-1 h-12 rounded-2xl font-bold">
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer la Note"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Module Leaderboard & Synthèse Dialog */}
      <Dialog open={!!viewingModuleLeaderboard} onOpenChange={(open) => !open && setViewingModuleLeaderboard(null)}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-4xl md:max-w-5xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          {viewingModuleLeaderboard && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-none font-black text-[9px] uppercase px-3 py-1">
                    Synthèse Global du Module
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-none font-black text-[9px] uppercase px-3 py-1">
                    {viewingModuleLeaderboard.totalPossibleModulePoints || 40} Points Cumulés Max
                  </Badge>
                </div>
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
                  Tableau de Synthèse : {viewingModuleLeaderboard.name}
                </DialogTitle>
                <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Points totaux cumulés par étudiant, classement et leçons complétées
                </DialogDescription>
              </DialogHeader>

              {/* Leaderboard Table */}
              <div className="overflow-x-auto w-full min-w-0">
                <table className="w-full min-w-[620px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="py-3 px-4">Rang</th>
                      <th className="py-3 px-4">Étudiant</th>
                      <th className="py-3 px-4">Présence Module</th>
                      <th className="py-3 px-4">Leçons Suivies</th>
                      <th className="py-3 px-4 text-center">Points Totaux</th>
                      <th className="py-3 px-4 text-center">Moyenne</th>
                      <th className="py-3 px-4 text-right">Action Présence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(viewingModuleLeaderboard.studentLeaderboard || []).map((st: any, rankIdx: number) => (
                      <tr key={st.studentId} className={cn("transition-colors", st.isPresenceDeactivated ? "bg-red-50/40 dark:bg-red-950/20" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30")}>
                        <td className="py-4 px-4 font-black text-sm text-slate-400">
                          {rankIdx === 0 ? <span className="text-amber-500 font-black text-base">🥇 #1</span> :
                           rankIdx === 1 ? <span className="text-slate-400 font-black text-base">🥈 #2</span> :
                           rankIdx === 2 ? <span className="text-amber-700 font-black text-base">🥉 #3</span> :
                           `#${rankIdx + 1}`}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img src={st.avatar} alt={st.studentName} className="w-9 h-9 rounded-xl bg-white p-0.5 border shadow-sm" />
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{st.studentName}</p>
                              <p className="text-[10px] font-bold text-slate-400">{st.email} • Promo {st.promo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {st.isPresenceDeactivated ? (
                            <Badge className="bg-red-600 text-white font-black text-[9px] uppercase px-2.5 py-1">
                              🔴 PRÉSENCE DÉSACTIVÉE
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-[9px] uppercase px-2.5 py-1">
                              🟢 PRÉSENCE ACTIVE
                            </Badge>
                          )}
                          {st.deactivatedReason && (
                            <p className="text-[9px] text-red-600 dark:text-red-400 font-bold mt-0.5 italic">
                              "{st.deactivatedReason}"
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-4 font-bold text-xs text-slate-700 dark:text-slate-300">
                          {st.lessonsCompletedCount} / {(viewingModuleLeaderboard.lessons || []).length} cours
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-sm font-black text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900">
                            {st.totalPointsEarned} / {st.totalPossibleModulePoints || 40} Pts
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="w-24 mx-auto space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-black text-slate-600 dark:text-slate-400">
                              <span>{st.percentage}%</span>
                            </div>
                            <Progress value={st.percentage} className="h-2" />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            size="sm"
                            variant={st.isPresenceDeactivated ? "outline" : "destructive"}
                            onClick={() => handleToggleStudentModulePresence(
                              viewingModuleLeaderboard.id,
                              st.studentId,
                              !!st.isPresenceDeactivated,
                              st.studentName
                            )}
                            className="h-8 rounded-xl font-bold text-[10px] uppercase gap-1 cursor-pointer"
                          >
                            {st.isPresenceDeactivated ? "✅ Réactiver Présence" : "🚫 Désactiver Présence"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
