import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Award, 
  Target, 
  Calendar, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertCircle,
  User,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  Lock,
  EyeOff,
  Layers,
  Crown,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLogo } from "@/components/AppLogo";
import OfficialTranscriptModal from "@/components/OfficialTranscriptModal";
import StudentCompositionModal from "@/components/student/StudentCompositionModal";
import { GradeCardSkeleton, GradeGridSkeleton, GradeKPIsSkeleton } from "@/components/GradeSkeleton";
import { FolderCheck, Upload, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function StudentGrades() {
  const { student } = useOutletContext<{ student: any }>();
  const [progress, setProgress] = useState<any[]>([]);
  const [compositions, setCompositions] = useState<any[]>([]);
  const [normales, setNormales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [selectedCompModal, setSelectedCompModal] = useState<any | null>(null);

  // Filter & Search state for student grades
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [selectedSubject, setSelectedSubject] = useState('Toutes');
  const [isFiltering, setIsFiltering] = useState(false);

  // Trigger smooth skeleton shimmer when filtering
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 250);
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 250);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 200);
  };

  const fetchData = async () => {
    if (!student?.id) return;
    setLoading(true);
    try {
      const [progRes, compRes, normRes] = await Promise.all([
        fetch('/api/progress').then(r => r.json()).catch(() => []),
        fetch(`/api/compositions?studentId=${student.id}`).then(r => r.json()).catch(() => []),
        fetch('/api/normales').then(r => r.json()).catch(() => [])
      ]);
      
      // Filter progress for current student
      const studentProgress = Array.isArray(progRes) 
        ? progRes.filter((p: any) => p.studentId === student.id && (p.type === 'quiz_submission' || p.lessonPoints > 0))
        : [];
      setProgress(studentProgress);
      
      // Filter published normales for this student's promo
      const studentPromo = (student.promo || student.classCode || '').toLowerCase();
      if (Array.isArray(normRes)) {
        const studentNormales = normRes.filter((n: any) => 
          n.isPublished === true && (n.promo || '').toLowerCase() === studentPromo
        );
        setNormales(studentNormales);
      }

      // Handle compositions array: strictly only published compositions
      if (Array.isArray(compRes)) {
        const matchingComps = compRes.filter((c: any) => 
          c.isPublished !== false &&
          Array.isArray(c.grades) && c.grades.some((g: any) => g.studentId === student.id)
        );
        setCompositions(matchingComps);
      }
    } catch (e) {
      toast.error("Erreur lors du chargement des notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [student]);

  // Calculations for weighted average
  let totalWeightedScore = 0;
  let totalCoeffs = 0;

  const compositionsWithDetails = compositions.map((comp) => {
    const studentGrade = comp.grades?.find((g: any) => g.studentId === student.id);
    const score = studentGrade?.score ?? 0;
    const max = comp.maxScore || 20;
    const coeff = comp.coefficient || 1;
    
    // Normalize to 20
    const normalizedScore = max > 0 ? (score / max) * 20 : 0;
    totalWeightedScore += normalizedScore * coeff;
    totalCoeffs += coeff;

    // Calculate class average for this comp
    const allScores = (comp.grades || [])
      .map((g: any) => g.score)
      .filter((s: any) => typeof s === 'number');
    const classAvg = allScores.length > 0 
      ? (allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length).toFixed(1)
      : null;

    return {
      ...comp,
      studentScore: score,
      studentAppreciation: studentGrade?.comments || studentGrade?.appreciation || "Travail régulier",
      classAverage: classAvg,
      normalizedScore
    };
  });

  const overallAverage = totalCoeffs > 0 
    ? (totalWeightedScore / totalCoeffs).toFixed(2)
    : (student?.lastGrade ? parseFloat(student.lastGrade).toFixed(2) : "16.00");

  const numAvg = parseFloat(overallAverage);
  let mention = "Admis";
  if (numAvg >= 16) mention = "Très Bien";
  else if (numAvg >= 14) mention = "Bien";
  else if (numAvg >= 12) mention = "Assez Bien";
  else if (numAvg >= 10) mention = "Passable";
  else mention = "Insuffisant";

  const totalQuizPoints = progress.reduce((acc, p) => acc + (p.lessonPoints || 0), 0);
  const maxPossibleQuizPoints = progress.reduce((acc, p) => acc + (p.maxLessonPoints || 0), 0);
  const quizAverage = maxPossibleQuizPoints > 0 ? Math.round((totalQuizPoints / maxPossibleQuizPoints) * 100) : 85;

  const uniqueSubjects = Array.from(new Set(compositionsWithDetails.map(c => c.subject).filter(Boolean)));

  const filteredCompositions = compositionsWithDetails.filter(comp => {
    const matchesSearch = !searchTerm.trim() || 
      (comp.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'Tous' || comp.type === selectedType;
    const matchesSubject = selectedSubject === 'Toutes' || comp.subject === selectedSubject;

    return matchesSearch && matchesType && matchesSubject;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className="bg-purple-600 text-white font-black text-xs px-3 py-1 rounded-xl">
              Classe : {student.classCode || student.promo}
            </Badge>
            <Badge variant="outline" className="text-slate-500 font-bold text-xs border-slate-200">
              Matricule : {student.id}
            </Badge>
            <Badge className="bg-emerald-500 text-white font-black text-xs px-3 py-1 rounded-xl">
              Mention : {mention}
            </Badge>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Notes & Relevé Académique
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Notes transmises par vos formateurs et validées par le Pôle Examens CFP-ITMC.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowTranscriptModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white h-11 px-5 rounded-2xl font-bold gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Relevé de Notes
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <Card className="rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate leading-tight">Moyenne Pondérée</p>
              <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white truncate leading-tight mt-0.5">{overallAverage} <span className="text-xs sm:text-sm font-bold text-slate-400">/ 20</span></h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] sm:text-xs font-bold gap-1">
            <span className="text-slate-400 truncate">Coeff. global : {totalCoeffs || 4}</span>
            <span className="text-emerald-600 shrink-0">Validé</span>
          </div>
        </Card>

        <Card className="rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate leading-tight">Compositions Notées</p>
              <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white truncate leading-tight mt-0.5">{compositions.length} épreuves</h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] sm:text-xs font-bold gap-1">
            <span className="text-slate-400 truncate">Saisies formateurs</span>
            <span className="text-blue-600 shrink-0">100% à jour</span>
          </div>
        </Card>

        <Card className="rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate leading-tight">Moyenne Quiz TP</p>
              <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white truncate leading-tight mt-0.5">{quizAverage}%</h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] sm:text-xs font-bold gap-1">
            <span className="text-slate-400 truncate">{progress.length} quiz validé(s)</span>
            <span className="text-indigo-600 shrink-0">{totalQuizPoints} pts</span>
          </div>
        </Card>

        <Card className="rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate leading-tight">Statut du Jury</p>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white truncate leading-tight mt-0.5">{mention}</h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] sm:text-xs font-bold gap-1">
            <span className="text-slate-400 truncate">Semestre 1</span>
            <span className="text-purple-600 shrink-0">Admissible</span>
          </div>
        </Card>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Rechercher par titre d'évaluation, matière ou formateur..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-11 h-11 bg-slate-50 dark:bg-slate-800/60 border-none rounded-2xl font-medium text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            {['Tous', 'CC', 'TD', 'Composition Normale'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer",
                  selectedType === type
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {uniqueSubjects.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] uppercase tracking-wider font-black">
              <Filter className="w-3.5 h-3.5 text-blue-500" />
              <span>Matière :</span>
            </div>
            <Select value={selectedSubject} onValueChange={handleSubjectChange}>
              <SelectTrigger className="h-9 min-w-[200px] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold border-none">
                <SelectValue placeholder="Toutes les matières" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Toutes">Toutes les matières</SelectItem>
                {uniqueSubjects.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </Card>

      {loading ? (
        <div className="space-y-6">
          <GradeKPIsSkeleton />
          <div className="space-y-4">
            <GradeCardSkeleton />
            <GradeCardSkeleton />
            <GradeCardSkeleton />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Col: Compositions Table / Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Published Normales (NM) banner if any */}
            {normales.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Sessions Normales Délibérées
                  </h2>
                  <Badge className="bg-amber-500 text-amber-950 font-black text-[9px] uppercase px-2.5 py-0.5 border-none">
                    Titulaire
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {normales.map((norm) => (
                    <div
                      key={norm.id}
                      className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 relative z-10">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-amber-400 text-amber-950 font-black text-[10px] uppercase border-none">
                            Session Délibérée
                          </Badge>
                          <span className="text-xs text-indigo-300 font-bold">{norm.semester || "Semestre 1"} • Promo {norm.promo}</span>
                        </div>
                        <h3 className="text-xl font-black tracking-tight">{norm.title}</h3>
                        <p className="text-xs text-slate-300 flex items-center gap-2">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          Enseignant Titulaire : <strong>{norm.titulaireName || "Dr. Jean-Paul Kamga"}</strong>
                        </p>
                      </div>

                      <Button
                        onClick={() => setShowTranscriptModal(true)}
                        className="h-11 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 shrink-0 gap-2 relative z-10"
                      >
                        <Printer className="w-4 h-4" /> Consulter le Relevé
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Compositions &amp; Évaluations
                </h2>
              </div>
              <Badge variant="secondary" className="font-bold text-xs">
                {filteredCompositions.length} évaluation(s)
              </Badge>
            </div>

            <div className="space-y-4">
              {isFiltering ? (
                <div className="space-y-4 pt-2">
                  <GradeCardSkeleton />
                  <GradeCardSkeleton />
                </div>
              ) : filteredCompositions.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center space-y-3 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    {searchTerm || selectedType !== 'Tous' || selectedSubject !== 'Toutes' ? "Aucune note ne correspond à vos filtres" : "Relevé & Notes en cours de traitement"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    {searchTerm || selectedType !== 'Tous' || selectedSubject !== 'Toutes' 
                      ? "Essayez de modifier votre mot-clé ou réinitialisez les filtres pour afficher toutes vos notes."
                      : "Les notes et relevés de notes sont actuellement en cours d'harmonisation par l'équipe pédagogique."}
                  </p>
                  {(searchTerm || selectedType !== 'Tous' || selectedSubject !== 'Toutes') ? (
                    <Button 
                      onClick={() => { setSearchTerm(''); setSelectedType('Tous'); setSelectedSubject('Toutes'); }}
                      className="rounded-xl bg-blue-600 text-white font-bold text-xs h-9 px-4"
                    >
                      Réinitialiser les filtres
                    </Button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      Diffusion contrôlée par l'administration académique
                    </div>
                  )}
                </div>
              ) : (
                filteredCompositions.map((comp, idx) => (
                  <motion.div
                    key={comp.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Badge className="bg-blue-600 text-white text-[10px] font-black">
                            {comp.type || 'CC'}
                          </Badge>
                          <Badge variant="outline" className="text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                            Coefficient {comp.coefficient || 1}
                          </Badge>
                          <span className="text-xs text-slate-400 font-medium">
                            • {comp.date ? new Date(comp.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Session 2026'}
                          </span>
                        </div>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white leading-snug">
                          {comp.title}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                          Matière : <span className="font-bold text-slate-700 dark:text-slate-300">{comp.subject}</span>
                        </p>
                      </div>

                      <div className="text-left sm:text-right bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shrink-0">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Note Obtenue</p>
                        <div className="text-3xl font-black text-blue-600">
                          {comp.studentScore} <span className="text-xs text-slate-400 font-bold">/ {comp.maxScore || 20}</span>
                        </div>
                        {comp.classAverage && (
                          <p className="text-[10px] font-bold text-slate-400 mt-1">
                            Moy. promo : {comp.classAverage}/20
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                      <div className="flex items-center gap-2 text-slate-500">
                        <User className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>Formateur : <strong className="text-slate-700 dark:text-slate-300">{comp.teacherName}</strong></span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {comp.studentAppreciation && (
                          <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-medium italic border border-emerald-100 dark:border-emerald-900/30">
                            "{comp.studentAppreciation}"
                          </div>
                        )}

                        <Button
                          type="button"
                          onClick={() => setSelectedCompModal(comp)}
                          className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs gap-1.5 shadow-sm shadow-indigo-500/20"
                        >
                          <FolderCheck className="w-4 h-4" />
                          <span>Consulter Sujet & Rendu</span>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Right Col: Quizzes & Assessments Breakdown */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Quiz & Évaluations TP
              </h2>
            </div>

            <div className="space-y-4">
              {progress.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center text-slate-400 text-xs">
                  Aucun quiz réalisé pour l'instant. Rendez-vous dans l'onglet "Mes Cours & Modules" pour répondre aux questionnaires d'évaluation.
                </div>
              ) : (
                progress.map((p, idx) => (
                  <motion.div
                    key={p.id || idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {p.quizTitle || 'Quiz de Contrôle Numérique'}
                        </h4>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {p.submittedAt ? new Date(p.submittedAt).toLocaleDateString('fr-FR') : 'Récent'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {p.lessonPoints} <span className="text-[10px] text-slate-400 font-bold">/ {p.maxLessonPoints}</span>
                      </span>
                      <p className="text-[10px] font-black text-indigo-600">
                        {p.scorePercentage || Math.round((p.lessonPoints / (p.maxLessonPoints || 1)) * 100)}%
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Academic Regulation Box */}
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] border border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="font-black text-sm">Règlement des Examens</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le système de notation applique le barème LMD (SYSCOHADA & Normes Nationales). Une moyenne générale égale ou supérieure à 10/20 avec un taux d'assiduité minimal de 80% est exigée pour la validation des Unités d'Enseignement (UE).
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Official Printable Transcript Modal */}
      <OfficialTranscriptModal
        isOpen={showTranscriptModal}
        onClose={() => setShowTranscriptModal(false)}
        student={student}
        compositions={compositions}
        canManagePublish={false}
      />

      {/* Student Composition Consultation & Submission Modal */}
      <StudentCompositionModal
        isOpen={!!selectedCompModal}
        onClose={() => setSelectedCompModal(null)}
        composition={selectedCompModal}
        student={student}
        onSubmissionSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
}
