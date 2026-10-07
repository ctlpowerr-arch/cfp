import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Clock, 
  Video, 
  FileText, 
  CheckCircle2, 
  PlayCircle,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  X,
  Target,
  Trophy,
  Lock,
  Eye,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function StudentModules() {
  const { student } = useOutletContext<{ student: any }>();
  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [viewingResource, setViewingResource] = useState<any>(null);
  
  // Quiz state
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [viewingQuiz, setViewingQuiz] = useState<any>(null);
  const [viewingSubmission, setViewingSubmission] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizTimeLeft, setQuizTimeLeft] = useState<number>(0);
  const [overtimeSeconds, setOvertimeSeconds] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeQuiz) {
      timer = setInterval(() => {
        setQuizTimeLeft(prev => {
          if (prev > 0) return prev - 1;
          setOvertimeSeconds(o => o + 1);
          return 0;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQuiz]);

  useEffect(() => {
    fetchData();
  }, [student]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [modRes, progRes] = await Promise.all([
        fetch('/api/modules/relational'),
        fetch('/api/progress')
      ]);
      const modData = await modRes.json();
      const progData = await progRes.json();
      
      let filteredModules = modData;
      if (Array.isArray(modData)) {
        if (student?.classCode || student?.promo) {
          const myClassMods = modData.filter((m: any) => 
            m.classCode === student.classCode || 
            m.classCode === student.promo ||
            (student.classCode && m.classCode?.startsWith(student.promo)) ||
            (student.specialty && m.specialty === student.specialty)
          );
          if (myClassMods.length > 0) {
            filteredModules = myClassMods;
          }
        }
      }

      setModules(filteredModules.length > 0 ? filteredModules : modData);
      setProgress(progData);
    } catch (e) {
      toast.error("Erreur lors du chargement des modules");
    } finally {
      setLoading(false);
    }
  };

  const getLessonProgress = (lessonId: string) => {
    const submissions = progress.filter(p => p.lessonId === lessonId && p.studentId === student.id);
    if (submissions.length === 0) return null;
    
    // Check if there's any graded/submitted quiz for this lesson
    const quizSubmissions = submissions.filter(p => p.type === 'quiz_submission');
    if (quizSubmissions.length > 0) {
      return quizSubmissions[0]; // Return the first quiz submission found
    }
    
    return submissions[0]; // Otherwise just return lesson_read
  };

  const hasCompletedQuiz = (quizId: string) => {
    return progress.some(p => p.quizId === quizId && p.studentId === student.id);
  };

  const getQuizSubmission = (quizId: string) => {
    return progress.find(p => p.quizId === quizId && p.studentId === student.id);
  };

  const getModuleProgressPercent = (mod: any) => {
    if (!mod.lessons || mod.lessons.length === 0) return 0;
    let completedLessons = 0;
    mod.lessons.forEach((l: any) => {
      if (getLessonProgress(l.id)) completedLessons++;
    });
    return Math.round((completedLessons / mod.lessons.length) * 100);
  };

  const handleStartQuiz = (quiz: any, lesson: any) => {
    if (selectedModule && Array.isArray(selectedModule.deactivatedStudents) && 
        selectedModule.deactivatedStudents.some((ds: any) => String(ds.studentId) === String(student.id))) {
      toast.error("Votre présence a été désactivée par l'enseignant pour ce module.");
      return;
    }
    if (hasCompletedQuiz(quiz.id)) {
      toast.error("Vous avez déjà répondu à ce quiz.");
      return;
    }
    setActiveQuiz({ ...quiz, lessonId: lesson.id, moduleId: selectedModule.id });
    setQuizTimeLeft(Number(quiz.timer) || 60);
    setOvertimeSeconds(0);
    setQuizAnswers({});
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    
    let totalScore = 0;
    const ptsPerQuestion = 10;
    const maxScore = (activeQuiz.questions?.length || 1) * ptsPerQuestion;

    const formattedAnswers = (activeQuiz.questions || []).map((q: any, i: number) => {
      const qKey = q.id || String(i);
      const studentAnsRaw = quizAnswers[qKey];
      let isCorrect = false;

      if (q.type === 'multiple_choice' || q.type === 'single_choice') {
        const studentChoices = Array.isArray(studentAnsRaw)
          ? studentAnsRaw
          : typeof studentAnsRaw === 'string' && studentAnsRaw
          ? [studentAnsRaw]
          : [];

        const correctChoices = Array.isArray(q.correctAnswers) ? q.correctAnswers : [];

        if (correctChoices.length > 0) {
          const matchAll = correctChoices.length === studentChoices.length &&
            correctChoices.every((c: string) => studentChoices.includes(c));
          if (matchAll) {
            isCorrect = true;
            totalScore += ptsPerQuestion;
          }
        } else {
          if (studentChoices.length > 0) {
            isCorrect = true;
            totalScore += ptsPerQuestion;
          }
        }
      } else {
        if (studentAnsRaw && String(studentAnsRaw).trim().length > 0) {
          isCorrect = true;
          totalScore += ptsPerQuestion;
        }
      }

      return {
        questionId: qKey,
        questionText: q.text,
        studentAnswer: Array.isArray(studentAnsRaw) ? studentAnsRaw.join(', ') : String(studentAnsRaw || 'Non répondu'),
        points: isCorrect ? ptsPerQuestion : 0,
        maxPoints: ptsPerQuestion
      };
    });

    const isLate = overtimeSeconds > 0;
    const totalTimeTaken = (Number(activeQuiz.timer) || 60) + overtimeSeconds;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/progress/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id || "101",
          studentName: student.name,
          email: student.email || "etudiant@itmc.cm",
          promo: student.promo || student.classCode || student.level || "G1",
          moduleId: activeQuiz.moduleId,
          lessonId: activeQuiz.lessonId,
          quizId: activeQuiz.id,
          answers: formattedAnswers,
          lessonPoints: totalScore,
          maxLessonPoints: maxScore,
          isLate,
          overtimeSeconds,
          timeTakenSeconds: totalTimeTaken,
          quizTimerSeconds: Number(activeQuiz.timer) || 60
        })
      });
      
      if (res.ok) {
        toast.success(isLate 
          ? `Quiz soumis ! (Réponse Tardive enregistrée, +${overtimeSeconds}s)` 
          : "Quiz soumis avec succès dans les temps !"
        );
        setActiveQuiz(null);
        fetchData();
      } else {
        toast.error("Erreur lors de la soumission du quiz");
      }
    } catch {
      toast.error("Erreur réseau lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  
  // Rendering Completed Quiz Modal
  if (viewingQuiz && viewingSubmission) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{viewingQuiz.title} - Correction</h2>
              <p className="text-emerald-500 font-medium flex items-center gap-2">
                Score obtenu : {viewingSubmission.lessonPoints} / {viewingSubmission.maxLessonPoints}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <Trophy className="w-8 h-8" />
            </div>
          </div>
          
          <div className="space-y-8 mb-10">
            {viewingQuiz.questions.map((q: any, i: number) => {
              const studentAnswer = viewingSubmission.answers?.find((a: any) => a.questionId === (q.id || String(i)))?.text || "Aucune réponse fournie";
              return (
              <div key={q.id || i} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">
                  <span className="text-blue-500 mr-2">{i + 1}.</span> 
                  {q.text}
                </h3>
                <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Votre Réponse</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">{studentAnswer}</p>
                </div>
              </div>
            )})}
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={() => { setViewingQuiz(null); setViewingSubmission(null); }}
              className="w-full h-14 rounded-2xl font-black bg-slate-100 hover:bg-slate-200 text-slate-600 shadow-sm"
            >
              Fermer
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

// Rendering Active Quiz Modal
  if (activeQuiz) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-slate-100 dark:border-slate-800"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{activeQuiz.title}</h2>
              
              {quizTimeLeft > 0 ? (
                <motion.div 
                  className={cn(
                    "font-black text-xl flex items-center gap-2",
                    quizTimeLeft < 15 ? "text-red-500 animate-pulse" : "text-blue-600 dark:text-blue-400"
                  )}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  key={quizTimeLeft}
                >
                  <Clock className="w-5 h-5" />
                  Temps restant : {Math.floor(quizTimeLeft / 60)}:{String(quizTimeLeft % 60).padStart(2, '0')}
                </motion.div>
              ) : (
                <Badge className="bg-red-600 text-white font-black text-xs uppercase px-3 py-1 rounded-xl animate-pulse flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  TEMPS IMPARTI ÉCOULÉ • RÉPONSE TARDIVE (+{overtimeSeconds}s)
                </Badge>
              )}
            </div>

            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 shrink-0">
              <Target className="w-7 h-7" />
            </div>
          </div>
          
          <div className="space-y-8 mb-10">
            {activeQuiz.questions?.map((q: any, i: number) => {
              const qKey = q.id || String(i);
              const currentAns = quizAnswers[qKey];

              return (
                <div key={qKey} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                      <span className="text-purple-600 font-black mr-2">Q{i + 1}.</span> 
                      {q.text}
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase text-slate-400">
                      {q.type === 'multiple_choice' ? 'Choix Multiples' : q.type === 'single_choice' ? 'Choix Unique' : 'Réponse Rédigée'}
                    </Badge>
                  </div>

                  {/* Multiple choice options rendering */}
                  {(q.type === 'multiple_choice' || q.type === 'single_choice') && q.options && q.options.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-black uppercase text-slate-400">
                        {q.type === 'multiple_choice' ? 'Sélectionnez une ou plusieurs réponses :' : 'Sélectionnez la réponse correcte :'}
                      </p>

                      {q.options.map((opt: string, optIdx: number) => {
                        const selectedChoices: string[] = Array.isArray(currentAns) 
                          ? currentAns 
                          : typeof currentAns === 'string' && currentAns ? [currentAns] : [];
                        const isChecked = selectedChoices.includes(opt);

                        return (
                          <label 
                            key={optIdx} 
                            className={cn(
                              "flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer font-bold text-xs sm:text-sm",
                              isChecked 
                                ? "bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 shadow-sm" 
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                            )}
                          >
                            <input 
                              type={q.type === 'single_choice' ? "radio" : "checkbox"}
                              name={`q_${qKey}`}
                              checked={isChecked}
                              onChange={(e) => {
                                if (q.type === 'single_choice') {
                                  setQuizAnswers({ ...quizAnswers, [qKey]: [opt] });
                                } else {
                                  let updated = [...selectedChoices];
                                  if (e.target.checked) {
                                    if (!updated.includes(opt)) updated.push(opt);
                                  } else {
                                    updated = updated.filter(c => c !== opt);
                                  }
                                  setQuizAnswers({ ...quizAnswers, [qKey]: updated });
                                }
                              }}
                              className="w-4 h-4 accent-purple-600 cursor-pointer"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : q.type === 'text' ? (
                    <textarea 
                      value={currentAns || ''}
                      onChange={(e) => setQuizAnswers({...quizAnswers, [qKey]: e.target.value})}
                      placeholder="Saisissez votre réponse rédigée..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[100px] focus:ring-2 ring-purple-500/20 outline-none transition-all font-medium text-xs sm:text-sm"
                    />
                  ) : (
                    <Input 
                      value={currentAns || ''}
                      onChange={(e) => setQuizAnswers({...quizAnswers, [qKey]: e.target.value})}
                      placeholder="Saisissez votre réponse..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs font-bold"
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={() => setActiveQuiz(null)}
              variant="outline" 
              className="flex-1 h-14 rounded-2xl font-bold text-slate-500 cursor-pointer"
            >
              Annuler
            </Button>
            <Button 
              onClick={submitQuiz}
              disabled={isSubmitting || Object.keys(quizAnswers).length < activeQuiz.questions?.length}
              className="flex-1 h-14 rounded-2xl font-black bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-500/20 cursor-pointer"
            >
              {isSubmitting ? "Envoi..." : "Valider mes réponses"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Resource Viewer Modal
  if (viewingResource) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-950 rounded-[2.5rem] w-full max-w-6xl h-full max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white truncate mr-4">
              {viewingResource.title}
            </h2>
            <Button 
              onClick={() => setViewingResource(null)}
              className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              variant="ghost"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-hidden p-6 bg-slate-50 dark:bg-slate-900">
            {viewingResource.type === 'video' ? (
              <video 
                controls 
                autoPlay 
                className="w-full h-full rounded-2xl object-contain" 
                src={viewingResource.url} 
              />
            ) : viewingResource.type === 'image' ? (
              <img 
                src={viewingResource.url} 
                className="w-full h-full rounded-2xl object-contain" 
                alt={viewingResource.title} 
              />
            ) : (
              <iframe 
                src={viewingResource.url} 
                className="w-full h-full rounded-2xl bg-white"
                title="Viewer"
              />
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Viewing a specific Lesson
  if (selectedLesson && selectedModule) {
    const lessonProg = getLessonProgress(selectedLesson.id);
    
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <button 
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors"
        >
          <ArrowRight className="w-5 h-5 rotate-180" /> Retour au module
        </button>
        
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white relative">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-none">{selectedModule.name}</Badge>
                {lessonProg && <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none"><CheckCircle2 className="w-3 h-3 mr-1"/> Complété</Badge>}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">{selectedLesson.title}</h1>
              <p className="text-blue-100 text-lg max-w-2xl">{selectedLesson.description}</p>
            </div>
          </div>
          
          <div className="p-10 space-y-12">
            {/* Resources Section */}
            {selectedLesson.resources && selectedLesson.resources.length > 0 && (
              <section>
                <h3 className="text-xl font-black mb-6 text-slate-900 dark:text-white flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-500" /> Supports de cours
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedLesson.resources.map((res: any, idx: number) => (
                    <div 
                      key={idx}
                      onClick={() => ['filetext', 'video', 'image', 'document', 'pdf'].includes(res.type) ? setViewingResource(res) : window.open(res.url, '_blank')}
                      className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all flex items-center gap-4 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm group-hover:text-blue-600 transition-colors">
                        {res.type === 'video' ? <Video className="w-6 h-6" /> : res.type === 'image' ? <Eye className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{res.title}</h4>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{res.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Quizzes Section */}
            {selectedLesson.quizzes && selectedLesson.quizzes.length > 0 && (
              <section>
                <h3 className="text-xl font-black mb-6 text-slate-900 dark:text-white flex items-center gap-3">
                  <Target className="w-6 h-6 text-indigo-500" /> Évaluations & Quiz
                </h3>
                <div className="space-y-4">
                  {selectedLesson.quizzes.map((quiz: any, idx: number) => {
                    const submission = getQuizSubmission(quiz.id);
                    const isCompleted = !!submission;
                    
                    return (
                      <div 
                        key={idx}
                        className={cn(
                          "p-6 rounded-[2rem] border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6",
                          isCompleted 
                            ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md"
                        )}
                      >
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                            isCompleted ? "bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300" : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"
                          )}>
                            {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <HelpCircle className="w-7 h-7" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{quiz.title}</h4>
                            <div className="flex gap-4 text-sm font-medium">
                              <span className="text-slate-500 flex items-center gap-1"><Clock className="w-4 h-4"/> {Math.floor(quiz.timer / 60)} min</span>
                              <span className="text-slate-500 flex items-center gap-1"><FileText className="w-4 h-4"/> {quiz.questions?.length || 0} questions</span>
                            </div>
                          </div>
                        </div>
                        
                        {isCompleted ? (
                          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl border border-emerald-100 dark:border-emerald-700/30">
                            <div className="flex items-center gap-4">
                              <div className="text-right sm:text-left">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Votre Score</p>
                                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                  {submission.lessonPoints} <span className="text-sm text-emerald-600/50">/ {submission.maxLessonPoints}</span>
                                </p>
                              </div>
                              <Trophy className="w-8 h-8 text-amber-400" />
                            </div>
                            <Button
                              onClick={() => { setViewingQuiz(quiz); setViewingSubmission(submission); }}
                              variant="outline"
                              className="ml-auto rounded-xl font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                              <Eye className="w-4 h-4 mr-2" /> Voir mes réponses
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleStartQuiz(quiz, selectedLesson)}
                            className="h-12 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto"
                          >
                            Commencer le quiz
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Modules List View
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Mes Modules</h1>
          <p className="text-slate-500 font-medium">Explorez vos cours, consultez les ressources et validez vos acquis.</p>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-6 py-3 rounded-2xl">
          <Trophy className="w-6 h-6 text-amber-500" />
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Score Global</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">1,240 pts</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {modules.map((mod: any, idx: number) => {
            const isSelected = selectedModule?.id === mod.id;
            const percent = getModuleProgressPercent(mod);
            
            return (
              <motion.div 
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-[2rem] border overflow-hidden transition-all duration-300",
                  isSelected ? "border-blue-500 ring-4 ring-blue-500/10 shadow-lg" : "border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md"
                )}
              >
                <div 
                  onClick={() => setSelectedModule(isSelected ? null : mod)}
                  className="p-8 cursor-pointer relative"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <Badge variant="outline" className="font-bold border-slate-200">
                      {mod.lessons?.length || 0} Leçons
                    </Badge>
                  </div>
                  
                  {/* Professor name and Class/Room info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                        {mod.teacherName?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{mod.teacherName || 'Professeur Attitré'}</p>
                    </div>
                    {mod.room && (
                      <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold px-2.5 py-0.5">
                        {mod.classCode || 'Classe'} • {mod.room}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{mod.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">{mod.description}</p>

                  {Array.isArray(mod.deactivatedStudents) && mod.deactivatedStudents.some((ds: any) => String(ds.studentId) === String(student.id)) && (
                    <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-red-700 dark:text-red-300 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>Votre présence / accès à ce module a été désactivé(e) par l'enseignant.</span>
                    </div>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 uppercase tracking-widest">Progression</span>
                      <span className="text-blue-600">{percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20"
                    >
                      <div className="p-6 space-y-3">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Programme du module</h4>
                        {mod.lessons && mod.lessons.map((lesson: any, lIdx: number) => {
                          const isCompleted = getLessonProgress(lesson.id);
                          return (
                            <div 
                              key={lesson.id}
                              onClick={() => {
                                setSelectedModule(mod);
                                setSelectedLesson(lesson);
                              }}
                              className="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                                isCompleted ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-500"
                              )}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{lesson.title}</h5>
                                <p className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                                  <span>{lesson.resources?.length || 0} Supports</span>
                                  <span>{lesson.quizzes?.length || 0} Quizz</span>
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                          );
                        })}
                        {(!mod.lessons || mod.lessons.length === 0) && (
                          <div className="text-center p-6 text-slate-500 font-medium">
                            Aucune leçon disponible pour ce module.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
