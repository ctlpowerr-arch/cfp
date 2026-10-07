import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause,
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Clock, 
  FileText, 
  Download,
  Share2,
  Bookmark,
  MessageCircle,
  Sparkles,
  Layers,
  GraduationCap,
  Volume2,
  Tv,
  ListVideo,
  Award,
  BookMarked,
  Check,
  RotateCcw,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ModernSelect } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { defaultSpecialties, enrichSpecialty } from '@/data/specialtiesData';
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: string;
  completed: boolean;
  description: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function LearningPage() {
  const [specialties, setSpecialties] = React.useState<any[]>([]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = React.useState<string>("1");
  const [activeLessonId, setActiveLessonId] = React.useState<string>("");
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<'about' | 'resources' | 'quiz'>('about');
  
  // Quiz states
  const [quizAnswer, setQuizAnswer] = React.useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = React.useState<boolean>(false);

  // Progression & Quiz states
  const [progress, setProgress] = React.useState<any[]>([]);
  const [modules, setModules] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [quizTimer, setQuizTimer] = React.useState<number>(0);
  const [quizStartTime, setQuizStartTime] = React.useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = React.useState<Record<string, any>>({});
  const [isQuizSubmitting, setIsQuizSubmitting] = React.useState(false);

  const studentId = "1"; // Hardcoded for demo, should come from auth

  const fetchData = async () => {
    try {
      const [modRes, progRes] = await Promise.all([
        fetch('/api/modules'),
        fetch(`/api/progress/${studentId}`)
      ]);
      const modData = await modRes.json();
      const progData = await progRes.json();
      
      setModules(modData);
      setProgress(progData);
    } catch (err) {
      console.error("Failed to fetch learning data", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // Progression Check
  const isLessonLocked = (modId: string, lessonId: string) => {
    const mod = modules.find(m => m.id === modId);
    if (!mod || !mod.lessons) return true;
    
    const lessonIdx = mod.lessons.findIndex((l: any) => l.id === lessonId);
    if (lessonIdx === 0) return false; // First lesson is never locked

    const prevLesson = mod.lessons[lessonIdx - 1];
    // Check if previous lesson has a quiz and if it was completed
    if (prevLesson.quizzes && prevLesson.quizzes.length > 0) {
      const isCompleted = progress.some(p => p.lessonId === prevLesson.id && p.quizId === prevLesson.quizzes[0].id);
      return !isCompleted;
    }
    
    return false; // No quiz, no lock? Or should it be locked by resource view? User said "obligatour que un etudiant reponde a des quix"
  };

  const isQuizCompleted = (lessonId: string, quizId: string) => {
    return progress.some(p => p.lessonId === lessonId && p.quizId === quizId);
  };

  // Sync chosen specialty and modules
  const activeSpecialty = specialties.find(s => s.id === selectedSpecialtyId) || null;

  // Use real modules if available, otherwise fallback to generated ones for demo consistency
  const currentModules = React.useMemo<any[]>(() => {
    if (modules.length > 0) {
      return modules.map((m: any) => ({
        ...m,
        lessons: Array.isArray(m.lessons) ? m.lessons : []
      }));
    }
    
    // Fallback logic for initial view if DB is empty
    if (!activeSpecialty) return [];
    const specialtyModules = activeSpecialty.modules || [];
    return specialtyModules.map((moduleName: string, mIdx: number) => ({
      id: `mod-${mIdx}`,
      name: `Module ${mIdx + 1} : ${moduleName}`,
      lessons: [
        {
          id: `l-${mIdx}-1`,
          title: "Introduction",
          isSuspended: false,
          resources: [{ id: 'r1', title: 'Cours PDF', type: 'document' }],
          quizzes: [{ id: 'q1', title: 'Quiz Final', timer: 600, questions: [{ id: 'qn1', text: 'Questions de synthèse', type: 'text' }] }]
        }
      ]
    }));
  }, [modules, activeSpecialty]);

  // Handle active lesson selection
  React.useEffect(() => {
    if (currentModules.length > 0 && !activeLessonId) {
      setActiveLessonId(currentModules[0].lessons[0].id);
    } else if (currentModules.length > 0) {
      // If selected specialty changed, make sure active lesson is valid for the current modules
      const isValid = currentModules.some(m => m.lessons.some(l => l.id === activeLessonId));
      if (!isValid) {
        setActiveLessonId(currentModules[0].lessons[0].id);
      }
    }
  }, [currentModules, activeLessonId]);

  // Find currently active lesson details
  const activeLesson = React.useMemo(() => {
    for (const mod of currentModules) {
      const found = mod.lessons.find(l => l.id === activeLessonId);
      if (found) return found;
    }
    return currentModules[0]?.lessons[0] || null;
  }, [currentModules, activeLessonId]);

  const handleSubmitQuiz = async (quizId: string) => {
    if (isQuizSubmitting) return;
    setIsQuizSubmitting(true);
    
    try {
      const mod = currentModules.find(m => m.lessons.some((l: any) => l.id === activeLessonId));
      const res = await fetch('/api/progress/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          moduleId: mod?.id,
          lessonId: activeLessonId,
          quizId,
          answers: quizAnswers
        })
      });
      
      if (res.ok) {
        toast.success("Réponses soumises ! Vous pouvez passer à la leçon suivante.");
        fetchData();
        setQuizSubmitted(true);
      }
    } catch (err) {
      toast.error("Erreur lors de la soumission");
    } finally {
      setIsQuizSubmitting(false);
    }
  };

  const changeSpecialty = (id: string) => {
    setSelectedSpecialtyId(id);
    localStorage.setItem('cfpitmc_active_learning_id', String(id));
    setQuizSubmitted(false);
  };

  const toggleLessonCompleted = (lessonId: string) => {
    // Legacy support if needed, but progression is now quiz-based
  };
  React.useEffect(() => {
    if (activeTab === 'quiz' && activeLesson?.quizzes?.[0] && !quizSubmitted) {
      const quiz = activeLesson.quizzes[0];
      const completed = isQuizCompleted(activeLesson.id, quiz.id);
      if (completed) {
        setQuizSubmitted(true);
        return;
      }

      setQuizTimer(quiz.timer);
      setQuizStartTime(Date.now());
      
      const interval = setInterval(() => {
        setQuizTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitQuiz(quiz.id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeTab, activeLessonId, quizSubmitted]);

  // Calculate stats for current specialty
  const totalLessonsCount = currentModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessonsCount = currentModules.reduce((acc, m) => {
    return acc + m.lessons.filter(l => progress.some(p => p.lessonId === l.id)).length;
  }, 0);
  const completionPercentage = totalLessonsCount > 0 
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
    : 0;

  // Next and Previous lesson navigation
  const flatLessons = React.useMemo(() => {
    return currentModules.flatMap(m => m.lessons);
  }, [currentModules]);

  const handleNextLesson = () => {
    if (!activeLessonId) return;
    const currentIdx = flatLessons.findIndex(l => l.id === activeLessonId);
    if (currentIdx !== -1 && currentIdx < flatLessons.length - 1) {
      setActiveLessonId(flatLessons[currentIdx + 1].id);
      setIsPlaying(false);
    }
  };

  const handlePrevLesson = () => {
    if (!activeLessonId) return;
    const currentIdx = flatLessons.findIndex(l => l.id === activeLessonId);
    if (currentIdx > 0) {
      setActiveLessonId(flatLessons[currentIdx - 1].id);
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Selector */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 gap-4 shadow-xs">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-blue-600 shrink-0" />
            E-learning &amp; Classe Virtuelle
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Suivez vos cours, téléchargez vos supports de formation de 12 mois préparant au DQP.
          </p>
        </div>

        {/* Dynamic Specialty Selector */}
        <div className="w-full lg:w-96 flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Choisir votre Formation :</label>
          <ModernSelect 
            dropdownTitle="Choisir votre Formation"
            value={selectedSpecialtyId} 
            onChange={(e) => changeSpecialty(e.target.value)}
            className="w-full h-11 px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {specialties.map(spec => (
              <option key={spec.id} value={spec.id}>
                🎓 {spec.name} — {spec.subCategory}
              </option>
            ))}
          </ModernSelect>
        </div>
      </div>

      {activeSpecialty ? (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main left content (Video & Tabs) */}
          <div className="flex-1 w-full flex flex-col gap-6 min-w-0">
            
            {/* Interactive Player Card */}
            <Card className="border-none shadow-md bg-slate-950 text-white rounded-3xl overflow-hidden relative group">
              <div className="aspect-video w-full relative bg-slate-950 flex items-center justify-center">
                {/* Visualizer for playing state */}
                {isPlaying ? (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-6 p-4">
                    <div className="flex items-end gap-1.5 h-16">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [12, 64, 12] }}
                          transition={{
                            duration: 0.8 + (i % 3) * 0.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.05
                          }}
                          className="w-1.5 bg-blue-500 rounded-full"
                        />
                      ))}
                    </div>
                    <div className="text-center space-y-1">
                      <Badge className="bg-blue-600 text-white border-none uppercase text-[9px] font-black tracking-widest px-2.5 py-1 animate-pulse">
                        Lecture en cours • Son Stéréo
                      </Badge>
                      <h3 className="text-base md:text-lg font-black text-white px-4">
                        {activeLesson?.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">Durée écoulée: 03:14 / {activeLesson?.duration}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <img 
                      src={activeSpecialty.images?.[0] || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop"} 
                      className="absolute inset-0 w-full h-full object-cover opacity-30 transition-opacity group-hover:opacity-40" 
                      alt="Course thumbnail"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <Button 
                        size="lg" 
                        onClick={() => setIsPlaying(true)}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl scale-100 hover:scale-110 transition-transform flex items-center justify-center cursor-pointer"
                      >
                        <Play className="w-6 h-6 md:w-8 md:h-8 fill-white ml-1 text-white" />
                      </Button>
                    </div>
                  </>
                )}

                {/* Top header badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <Badge className="bg-slate-900/95 text-white backdrop-blur-md border-none uppercase text-[9px] font-bold tracking-widest px-3 py-1 flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-blue-400" />
                    Classe CFP-ITMC Logpom
                  </Badge>
                  <div className="flex gap-1.5">
                    <Badge className="bg-emerald-600/90 text-white border-none uppercase text-[9px] font-bold px-2.5 py-1">
                      Durée: 12 Mois
                    </Badge>
                    <Badge className="bg-indigo-600/90 text-white border-none uppercase text-[9px] font-bold px-2.5 py-1">
                      Examen: DQP
                    </Badge>
                  </div>
                </div>

                {/* Bottom title layer (overlay) */}
                {!isPlaying && (
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-4 rounded-2xl z-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Leçon active :</span>
                      <h2 className="text-sm md:text-lg font-extrabold text-white leading-tight">
                        {activeLesson?.title}
                      </h2>
                    </div>
                    <div className="hidden sm:flex gap-1">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full"><Share2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full"><Bookmark className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Player control bar */}
              <div className="p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handlePrevLesson}
                    disabled={flatLessons.findIndex(l => l.id === activeLessonId) === 0}
                    className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  {isPlaying ? (
                    <Button 
                      size="sm" 
                      onClick={() => setIsPlaying(false)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 px-3.5"
                    >
                      <Pause className="w-4 h-4 fill-white text-white" /> Pause
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => setIsPlaying(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 px-3.5"
                    >
                      <Play className="w-4 h-4 fill-white text-white" /> Play
                    </Button>
                  )}

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleNextLesson}
                    disabled={flatLessons.findIndex(l => l.id === activeLessonId) === flatLessons.length - 1}
                    className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {activeLesson && (
                    <Button
                      onClick={() => toggleLessonCompleted(activeLesson.id)}
                      className={cn(
                        "rounded-xl text-xs font-black px-4 py-2 h-9 flex items-center gap-1.5 transition-all shadow-xs",
                        progress[activeLesson.id] 
                          ? "bg-green-600 text-white hover:bg-green-700" 
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:text-white"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {progress[activeLesson.id] ? "Leçon Complétée ✓" : "Marquer comme fait"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-none shadow-xs bg-white dark:bg-slate-900">
                <CardContent className="p-3 sm:p-4 flex items-center gap-3 min-w-0">
                  <div className="p-2 sm:p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block uppercase tracking-widest truncate">Durée Générale</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block truncate">12 Mois (DQP)</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xs bg-white dark:bg-slate-900">
                <CardContent className="p-3 sm:p-4 flex items-center gap-3 min-w-0">
                  <div className="p-2 sm:p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block uppercase tracking-widest truncate">Modules de Formation</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block truncate">
                      {activeSpecialty.modules?.length || 6} Disciplines
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xs bg-white dark:bg-slate-900">
                <CardContent className="p-3 sm:p-4 flex items-center gap-3 min-w-0">
                  <div className="p-2 sm:p-2.5 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl shrink-0">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block uppercase tracking-widest truncate">Votre progression</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block truncate">
                      {completionPercentage}% complété
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dynamic Tabs Section: About, Resources, Quiz */}
            <Card className="border-none shadow-xs bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
              <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2 flex gap-2">
                <button
                  onClick={() => setActiveTab('about')}
                  className={cn(
                    "flex-1 md:flex-initial px-4 py-2.5 text-xs md:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
                    activeTab === 'about' 
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Layers className="w-4 h-4 text-blue-500" />
                  À propos du cours
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={cn(
                    "flex-1 md:flex-initial px-4 py-2.5 text-xs md:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
                    activeTab === 'resources' 
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  Supports PDF ({activeSpecialty.modules?.length || 6})
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={cn(
                    "flex-1 md:flex-initial px-4 py-2.5 text-xs md:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
                    activeTab === 'quiz' 
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Award className="w-4 h-4 text-amber-500" />
                  Auto-Évaluation
                </button>
              </div>

              <CardContent className="p-6 md:p-8">
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                        Description de la leçon : "{activeLesson?.title}"
                      </h3>
                      <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                        {activeLesson?.description}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100/30 dark:border-blue-900/30 rounded-2xl space-y-2">
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 block uppercase tracking-wider">
                        Validation MINEFOP :
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        Cette leçon prépare directement aux épreuves pratiques de l'examen national du DQP (Diplôme de Qualification Professionnelle) sous la tutelle du Ministère de l'Emploi et de la Formation Professionnelle.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-black">Informations de la spécialité</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {activeSpecialty.longDescription || activeSpecialty.description}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="text-sm md:text-base font-bold">Supports de cours à télécharger</h3>
                        <p className="text-[11px] text-slate-400">Préparez vos fiches pratiques de révision</p>
                      </div>
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-black uppercase">
                        Format PDF
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {currentModules.map((mod: any, idx: number) => (
                        <div 
                          key={mod.id || idx} 
                          className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 group hover:border-slate-200 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-xl shrink-0 font-bold text-xs uppercase">
                              PDF
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                                {mod.name || mod.title}
                              </p>
                              <span className="text-[10px] font-semibold text-slate-400">Support de cours • {2.4 + idx * 0.5} Mo</span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl cursor-pointer"
                            onClick={() => alert(`Téléchargement du support de cours: ${mod.name || mod.title}`)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {activeLesson?.quizzes?.length > 0 ? (
                      activeLesson.quizzes.map((quiz: any) => {
                        const completed = isQuizCompleted(activeLesson.id, quiz.id);
                        return (
                          <div key={quiz.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                              <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">{quiz.title}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Évaluation obligatoire pour progression</p>
                              </div>
                              {!completed && !quizSubmitted && (
                                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-2xl border border-red-100 dark:border-red-900/30">
                                  <Clock className="w-4 h-4 text-red-600 animate-pulse" />
                                  <span className="text-sm font-black text-red-600">
                                    {Math.floor(quizTimer / 60)}:{(quizTimer % 60).toString().padStart(2, '0')}
                                  </span>
                                </div>
                              )}
                              {completed && (
                                <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[10px] uppercase px-4 py-1.5 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Complété
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-8">
                              {quiz.questions.map((q: any, qi: number) => (
                                <div key={q.id} className="space-y-4">
                                  <div className="flex gap-4">
                                    <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center font-black text-xs shrink-0">{qi + 1}</span>
                                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1.5">{q.text}</p>
                                  </div>
                                  
                                  <div className="ml-12">
                                    {q.type === 'text' && (
                                      <textarea 
                                        disabled={completed || quizSubmitted}
                                        value={quizAnswers[q.id] || ''}
                                        onChange={(e) => setQuizAnswers({...quizAnswers, [q.id]: e.target.value})}
                                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm min-h-[100px] outline-none focus:ring-2 ring-blue-500/20 disabled:opacity-60"
                                        placeholder="Saisissez votre réponse ici..."
                                      />
                                    )}
                                    {q.type === 'file' && (
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-center w-full">
                                          <label className={cn(
                                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl transition-all",
                                            completed || quizSubmitted ? "bg-slate-100 border-slate-200 cursor-not-allowed" : "bg-slate-50 border-slate-300 hover:bg-slate-100 cursor-pointer"
                                          )}>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                              <Download className="w-8 h-8 mb-3 text-slate-400" />
                                              <p className="mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center px-4">
                                                Cliquez pour uploader un document ou une image
                                              </p>
                                            </div>
                                            <input 
                                              type="file" 
                                              className="hidden" 
                                              disabled={completed || quizSubmitted}
                                              onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                  setQuizAnswers({...quizAnswers, [q.id]: e.target.files[0].name});
                                                }
                                              }}
                                            />
                                          </label>
                                        </div>
                                        {quizAnswers[q.id] && (
                                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Fichier sélectionné: {quizAnswers[q.id]}</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {!completed && !quizSubmitted && (
                              <Button 
                                onClick={() => handleSubmitQuiz(quiz.id)}
                                disabled={isQuizSubmitting}
                                className="w-full h-14 mt-12 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700"
                              >
                                {isQuizSubmitting ? "Envoi en cours..." : "Soumettre mes réponses"}
                              </Button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucun quiz pour cette leçon</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right sidebar (Modules & Playlist) */}
          <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
            
            {/* Playlist card */}
            <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <ListVideo className="w-5 h-5 text-blue-600 shrink-0" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm md:text-base">
                    Progression du Programme
                  </h3>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Leçons acquises</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {completedLessonsCount} / {totalLessonsCount} cours ({completionPercentage}%)
                    </span>
                  </div>
                  <Progress value={completionPercentage} className="h-2 rounded-full" />
                </div>
              </div>

              {/* Scrollable Playlist area */}
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                <div className="p-3 space-y-4">
                  {currentModules.map((mod: any, mIdx: number) => (
                    <div key={mod.id || mIdx} className="space-y-1.5">
                      <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                        {mod.name || mod.title}
                      </div>

                      <div className="space-y-1">
                        {mod.lessons.map((les: any, li: number) => {
                          const isActive = activeLessonId === les.id;
                          const isCompleted = isQuizCompleted(les.id, les.quizzes?.[0]?.id);
                          const isLocked = isLessonLocked(mod.id, les.id);

                          return (
                            <div
                              key={les.id}
                              onClick={() => {
                                if (!isLocked && !les.isSuspended) {
                                  setActiveLessonId(les.id);
                                  setIsPlaying(false);
                                }
                              }}
                              className={cn(
                                "w-full text-left p-2.5 rounded-xl transition-all duration-150 flex items-center justify-between gap-3 group relative cursor-pointer outline-none",
                                isActive 
                                  ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-900/40 text-blue-700 dark:text-blue-400 font-extrabold" 
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-transparent",
                                (isLocked || les.isSuspended) && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black",
                                  isActive ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                )}>
                                  {li + 1}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[11px] truncate flex items-center gap-1.5">
                                    {les.title}
                                    {isLocked && <Lock className="w-2.5 h-2.5" />}
                                    {les.isSuspended && <span className="text-[7px] uppercase bg-orange-100 text-orange-600 px-1 py-0.5 rounded">Gelé</span>}
                                  </p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                    {les.resources?.length || 0} supports • {les.quizzes?.length || 0} quiz
                                  </p>
                                </div>
                              </div>
                              {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30">
                <Button 
                  onClick={() => alert("Espace de discussion étudiant du CFP-ITMC bientôt accessible avec vos codes d'accès.")}
                  variant="outline" 
                  className="w-full gap-2 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-slate-200 dark:border-slate-800 font-bold"
                >
                  <MessageCircle className="w-4 h-4" />
                  Espace de Discussion
                </Button>
              </div>
            </Card>

            {/* Certification / DQP verification footer banner */}
            <Card className="border border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <div className="space-y-3 relative z-10">
                <div className="p-2 bg-white/10 rounded-xl w-fit">
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
                <h4 className="font-extrabold text-sm md:text-base leading-tight">
                  Examen National du DQP
                </h4>
                <p className="text-[11px] text-slate-100 leading-relaxed font-medium">
                  Toutes les leçons de votre spécialité de 12 mois sont méticuleusement alignées sur le cahier des charges de l'examen de Qualification Professionnelle.
                </p>
                <div className="pt-1">
                  <Badge className="bg-white/25 text-white hover:bg-white/20 border-none text-[9px] font-extrabold px-2.5 py-1 uppercase">
                    Agrément MINEFOP Cameroun
                  </Badge>
                </div>
              </div>
            </Card>

          </div>

        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm">Chargement de votre espace d'apprentissage...</p>
        </div>
      )}

    </div>
  );
}
