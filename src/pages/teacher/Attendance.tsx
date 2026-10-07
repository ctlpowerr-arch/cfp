import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Download, 
  Filter, 
  Search, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Sparkles,
  Check,
  X,
  Clock3,
  HelpCircle,
  RefreshCw,
  Plus,
  Send,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { printElementDirect, exportElementToPDF } from "@/lib/pdfExport";

export default function TeacherAttendancePage() {
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [classesList, setClassesList] = useState<any[]>([]);
  const [modulesList, setModulesList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Émargement state
  const [selectedClass, setSelectedClass] = useState<string>('G1');
  const [selectedModule, setSelectedModule] = useState<string>('Génie Logiciel & Algorithmique');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionHours, setSessionHours] = useState<number>(2);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [studentStatuses, setStudentStatuses] = useState<Record<string, { status: 'present' | 'late' | 'absent' | 'excused'; note: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History & Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('month'); // 'all' | 'week' | 'month' | 'custom'
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [previewLog, setPreviewLog] = useState<any | null>(null);

  const printSheetRef = useRef<HTMLDivElement>(null);

  // Load teacher data & classes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clsRes, modRes, stdRes, logRes] = await Promise.all([
          fetch('/api/classes').then(r => r.json()).catch(() => []),
          fetch('/api/modules/relational').then(r => r.json()).catch(() => []),
          fetch('/api/students').then(r => r.json()).catch(() => []),
          fetch('/api/attendance/logs').then(r => r.json()).catch(() => [])
        ]);

        if (Array.isArray(clsRes)) setClassesList(clsRes);
        if (Array.isArray(modRes)) setModulesList(modRes);
        if (Array.isArray(stdRes)) setStudentsList(stdRes);
        if (Array.isArray(logRes)) setAttendanceLogs(logRes);

        // Pre-select first class if available
        if (clsRes.length > 0 && clsRes[0].code) {
          setSelectedClass(clsRes[0].code);
        }
      } catch (err) {
        console.error("Failed to load attendance data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter students by selected live class
  const classStudents = studentsList.filter(s => 
    s.promo === selectedClass || 
    s.classCode === selectedClass ||
    (s.promo && selectedClass && s.promo.toLowerCase() === selectedClass.toLowerCase())
  );

  const currentModuleObj = modulesList.find(m => m.name === selectedModule || m.id === selectedModule);
  const isStudentDeactivatedInModule = (studentId: string) => {
    if (!currentModuleObj || !Array.isArray(currentModuleObj.deactivatedStudents)) return false;
    return currentModuleObj.deactivatedStudents.some((ds: any) => String(ds.studentId) === String(studentId));
  };

  // Initialize or sync live student statuses
  useEffect(() => {
    const initial: Record<string, { status: 'present' | 'late' | 'absent' | 'excused'; note: string }> = {};
    classStudents.forEach(s => {
      initial[s.id] = studentStatuses[s.id] || { status: 'present', note: '' };
    });
    setStudentStatuses(initial);
  }, [selectedClass, studentsList.length]);

  const handleStatusChange = (studentId: string, status: 'present' | 'late' | 'absent' | 'excused') => {
    setStudentStatuses(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || { note: '' }), status }
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setStudentStatuses(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || { status: 'present' }), note }
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: 'present' | 'late' | 'absent' | 'excused'; note: string }> = {};
    classStudents.forEach(s => {
      updated[s.id] = { status: 'present', note: studentStatuses[s.id]?.note || '' };
    });
    setStudentStatuses(updated);
    toast.success(`Tous les ${classStudents.length} étudiants ont été marqués Présents !`);
  };

  // Submit Live Émargement
  const handleSubmitLiveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (classStudents.length === 0) {
      toast.error("Aucun étudiant à émarger dans cette classe.");
      return;
    }

    setIsSubmitting(true);
    try {
      const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');
      const records = classStudents.map(s => {
        const st = studentStatuses[s.id] || { status: 'present', note: '' };
        return {
          studentId: s.id,
          studentName: s.name,
          matricule: s.matricule || s.id,
          status: st.status,
          note: st.note
        };
      });

      const response = await fetch('/api/attendance/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classCode: selectedClass,
          specialty: classStudents[0]?.specialty || "Informatique",
          moduleName: selectedModule,
          teacherId: teacherData.id || "TCH-001",
          teacherName: teacherData.name || "Professeur Démo",
          date: sessionDate,
          hours: sessionHours,
          notes: sessionNotes,
          records
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Émargement validé avec succès pour ${data.presentCount}/${data.total} présents !`);
        
        // Refresh logs list
        const updatedLogs = await fetch('/api/attendance/logs').then(r => r.json()).catch(() => []);
        if (Array.isArray(updatedLogs)) setAttendanceLogs(updatedLogs);

        // Switch to history tab to view generated log
        setActiveTab('history');
      } else {
        toast.error("Échec de l'enregistrement de l'émargement.");
      }
    } catch (err) {
      toast.error("Erreur serveur lors de la validation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter attendance logs in history
  const filteredLogs = attendanceLogs.filter(log => {
    const matchesSearch = 
      (log.moduleName && log.moduleName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.teacherName && log.teacherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.classCode && log.classCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass = filterClass === 'all' || log.classCode === filterClass;

    let matchesDate = true;
    if (filterPeriod === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      matchesDate = new Date(log.date) >= oneWeekAgo;
    } else if (filterPeriod === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      matchesDate = new Date(log.date) >= oneMonthAgo;
    } else if (filterPeriod === 'custom' && (startDate || endDate)) {
      if (startDate && log.date < startDate) matchesDate = false;
      if (endDate && log.date > endDate) matchesDate = false;
    }

    return matchesSearch && matchesClass && matchesDate;
  });

  // Calculate 3 Dashboard Statistics
  const totalSessionsCount = filteredLogs.length;
  const totalHoursEffectuated = filteredLogs.reduce((sum, l) => sum + (Number(l.hours) || 2), 0);
  
  let globalPresents = 0, globalTotalRecords = 0, totalLates = 0, totalAbsents = 0;
  filteredLogs.forEach(l => {
    if (l.summary) {
      globalPresents += l.summary.present || 0;
      globalTotalRecords += l.summary.total || 0;
      totalLates += l.summary.late || 0;
      totalAbsents += l.summary.absent || 0;
    }
  });

  const attendanceRate = globalTotalRecords > 0 
    ? Math.round((globalPresents / globalTotalRecords) * 100) 
    : 92;

  // Print A4 Sheet handler
  const handlePrintLogSheet = (log: any) => {
    setPreviewLog(log);
    setTimeout(() => {
      if (printSheetRef.current) {
        printElementDirect(printSheetRef.current, `Fiche_Emargement_${log.classCode}_${log.date}`);
      }
    }, 200);
  };

  const handleDownloadPDF = (log: any) => {
    setPreviewLog(log);
    setTimeout(() => {
      if (printSheetRef.current) {
        exportElementToPDF(printSheetRef.current, `Fiche_Emargement_${log.classCode}_${log.date}.pdf`);
      }
    }, 200);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 px-2 sm:px-4">
      {/* Header Title Banner - 100% Responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 bg-slate-900 text-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Badge className="bg-blue-600 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg sm:rounded-xl shrink-0">
              Espace Enseignant • CFP-ITMC
            </Badge>
            <Badge variant="outline" className="text-slate-300 border-slate-700 font-bold text-[9px] sm:text-[10px] px-2.5 py-1 rounded-lg sm:rounded-xl shrink-0">
              Année Académique 2026-2027
            </Badge>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Émargement & Feuille de Présence
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
            Module de contrôle des appels, suivi d'assiduité en temps réel, génération des fiches d'émargement officielles A4 et exportation PDF pour la direction pédagogique.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
          <Button
            onClick={() => setActiveTab('live')}
            className={cn(
              "h-11 sm:h-12 px-4 sm:px-5 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-wider gap-2 cursor-pointer transition-all justify-center w-full sm:w-auto",
              activeTab === 'live' 
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30" 
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            )}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Faire l'Émargement</span>
          </Button>

          <Button
            onClick={() => setActiveTab('history')}
            className={cn(
              "h-11 sm:h-12 px-4 sm:px-5 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-wider gap-2 cursor-pointer transition-all justify-center w-full sm:w-auto",
              activeTab === 'history' 
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30" 
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            )}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Historique & Imprimer</span>
          </Button>
        </div>
      </div>

      {/* 3 LES 3 TABLEAUX DE BORD DE STATISTIQUES (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1: Taux d'Assiduité */}
        <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden relative group">
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-none text-[10px] font-black uppercase">
                {attendanceRate >= 85 ? "Excellent" : "Moyen"}
              </Badge>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {attendanceRate}%
              </p>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400 mt-1">
                Tableau 1 • Taux Global d'Assiduité
              </p>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Calculé sur <strong className="text-slate-900 dark:text-white font-bold">{globalTotalRecords}</strong> présences enregistrées.
            </p>
          </div>
        </Card>

        {/* KPI 2: Heures Effectuées */}
        <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden relative group">
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Clock className="w-6 h-6" />
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-none text-[10px] font-black uppercase">
                {totalSessionsCount} Séances
              </Badge>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {totalHoursEffectuated} h
              </p>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400 mt-1">
                Tableau 2 • Volume Horaire Effectué
              </p>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Heures de cours validées avec feuille d'émargement signée.
            </p>
          </div>
        </Card>

        {/* KPI 3: Alertes Retards & Absences */}
        <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden relative group">
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-none text-[10px] font-black uppercase">
                Suivi Disciplinaire
              </Badge>
            </div>
            <div>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {totalAbsents} <span className="text-xs text-red-500 font-bold uppercase">Abs.</span>
                </p>
                <span className="text-slate-300">•</span>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {totalLates} <span className="text-xs font-bold uppercase">Retards</span>
                </p>
              </div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400 mt-1">
                Tableau 3 • Bilan Absences & Retards
              </p>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Mis à jour à chaque appel d'émargement validé.
            </p>
          </div>
        </Card>
      </div>

      {/* TABS MAIN CONTENT */}
      {activeTab === 'live' ? (
        <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                  Prise d'Appel & Émargement en Direct
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">
                  Sélectionnez la classe, le module et cochez la présence de chaque étudiant.
                </CardDescription>
              </div>

              <Button
                type="button"
                onClick={handleMarkAllPresent}
                variant="outline"
                className="h-11 rounded-2xl border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-black text-xs uppercase tracking-wider gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Tout marquer Présent ({classStudents.length})
              </Button>
            </div>

            {/* Session Config Selectors Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Classe / Promotion
                </label>
                <ModernSelect
                  dropdownTitle="Sélectionner la Classe / Promotion"
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 font-bold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20"
                >
                  {classesList.map((c) => (
                    <option key={c.id || c.code} value={c.code || c.name}>
                      🎓 {c.name || c.code} ({c.studentCount || 0} étudiants)
                    </option>
                  ))}
                  {classesList.length === 0 && (
                    <>
                      <option value="G1">🎓 G1 — Ingénieur 1ère Année</option>
                      <option value="G2">🎓 G2 — Ingénieur 2ème Année</option>
                      <option value="L3-GL">🎓 L3 — Génie Logiciel & IA</option>
                    </>
                  )}
                </ModernSelect>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Matière / Module DQP
                </label>
                <Input
                  value={selectedModule}
                  onChange={e => setSelectedModule(e.target.value)}
                  placeholder="Ex: Génie Logiciel, Cyber-sécurité..."
                  className="h-12 rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Date de Séance
                </label>
                <Input
                  type="date"
                  value={sessionDate}
                  onChange={e => setSessionDate(e.target.value)}
                  className="h-12 rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Durée de Séance (Heures)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={sessionHours}
                  onChange={e => setSessionHours(Number(e.target.value))}
                  className="h-12 rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmitLiveSession}>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Liste des Apprenants Enregistrés ({classStudents.length})
                </h3>

                <p className="text-xs text-slate-500 font-medium">
                  Réglementation MINEFOP : Chaque retard doit être motivé.
                </p>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-black text-[10px] uppercase text-slate-400">#</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-slate-400">Apprenant & Matricule Officiel</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-slate-400">Filière</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-slate-400 text-center">Statut de Présence</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-slate-400">Note / Observation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-bold">
                          Aucun étudiant inscrit trouvé pour la classe "{selectedClass}".
                        </TableCell>
                      </TableRow>
                    ) : (
                      classStudents.map((std, index) => {
                        const st = studentStatuses[std.id] || { status: 'present', note: '' };
                        return (
                          <TableRow key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <TableCell className="font-black text-slate-400 text-xs">
                              #{index + 1}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${std.name}`} />
                                  <AvatarFallback>{std.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                                      {std.name}
                                    </p>
                                    {isStudentDeactivatedInModule(std.id) && (
                                      <Badge className="bg-red-600 text-white font-black text-[9px] uppercase px-2 py-0.5">
                                        🚫 Présence Désactivée pour ce Module
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                    Matricule : {std.matricule || std.id}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              {std.specialty || 'Génie Logiciel'}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Present Button */}
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(std.id, 'present')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 cursor-pointer",
                                    st.status === 'present'
                                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
                                  )}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Présent
                                </button>

                                {/* Late Button */}
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(std.id, 'late')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 cursor-pointer",
                                    st.status === 'late'
                                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-amber-50 hover:text-amber-700"
                                  )}
                                >
                                  <Clock3 className="w-3.5 h-3.5" />
                                  Retard
                                </button>

                                {/* Excused Button */}
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(std.id, 'excused')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 cursor-pointer",
                                    st.status === 'excused'
                                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-700"
                                  )}
                                >
                                  <HelpCircle className="w-3.5 h-3.5" />
                                  Excusé
                                </button>

                                {/* Absent Button */}
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(std.id, 'absent')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 cursor-pointer",
                                    st.status === 'absent'
                                      ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-red-50 hover:text-red-700"
                                  )}
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Absent
                                </button>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Input
                                placeholder="Motif ou remarque (optionnel)..."
                                value={st.note}
                                onChange={e => handleNoteChange(std.id, e.target.value)}
                                className="h-9 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-none font-medium"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Optional Session General Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Remarques Générales du Cours (Optionnel)
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                  placeholder="Ex: TP sur les structures de données réalisé. Présence globale satisfaisante."
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold min-h-[80px] outline-none focus:ring-2 ring-blue-500/20"
                />
              </div>

              {/* Form Action Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || classStudents.length === 0}
                  className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.15em] shadow-xl gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Enregistrement..." : "Valider & Enregistrer l'Émargement Officiel"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      ) : (
        /* HISTORIQUE, FILTRAGE & IMPRESSION DES FICHES D'ÉMARGEMENT */
        <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Historique des Fiches d'Émargement & Imprimerie
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">
                  Filtrez les émargements par classe, enseignant ou période personnalisée avant impression PDF A4.
                </CardDescription>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher module, enseignant..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              {/* Class Filter */}
              <div>
                <ModernSelect
                  dropdownTitle="Filtrer par Classe"
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="w-full h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 font-bold text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="all">🎓 Toutes les classes</option>
                  <option value="G1">🎓 Groupe 1 (G1)</option>
                  <option value="G2">🎓 Groupe 2 (G2)</option>
                  <option value="L3-GL">🎓 Licence 3 GL</option>
                </ModernSelect>
              </div>

              {/* Period Filter */}
              <div>
                <ModernSelect
                  dropdownTitle="Filtrer par Période"
                  value={filterPeriod}
                  onChange={e => setFilterPeriod(e.target.value)}
                  className="w-full h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 font-bold text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="all">📅 Toutes les dates</option>
                  <option value="week">🗓️ Derniers 7 jours</option>
                  <option value="month">📆 Dernier mois (30j)</option>
                  <option value="custom">✨ Période personnalisée</option>
                </ModernSelect>
              </div>

              {/* Custom Date Inputs if 'custom' */}
              {filterPeriod === 'custom' ? (
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="h-11 rounded-xl text-xs font-bold bg-white dark:bg-slate-800"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="h-11 rounded-xl text-xs font-bold bg-white dark:bg-slate-800"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-end font-bold text-xs text-slate-400">
                  <span>{filteredLogs.length} fiche(s) trouvée(s)</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-black text-[10px] uppercase text-slate-400">Date & Heure</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-slate-400">Classe & Filière</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-slate-400">Module / Enseignant</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-slate-400 text-center">Présence</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-bold">
                        Aucun enregistrement d'émargement ne correspond aux filtres sélectionnés.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <TableCell>
                          <p className="font-black text-sm text-slate-900 dark:text-white">
                            {log.date}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">
                            Durée : {log.hours || 2}h de cours
                          </p>
                        </TableCell>

                        <TableCell>
                          <Badge className="bg-blue-600 text-white font-black text-[9px] uppercase border-none mb-1">
                            Promo {log.classCode}
                          </Badge>
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {log.specialty || 'Génie Logiciel'}
                          </p>
                        </TableCell>

                        <TableCell>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            {log.moduleName}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">
                            Enseignant : {log.teacherName}
                          </p>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg">
                              {log.summary?.present || 0} Présents
                            </span>
                            <span className="text-xs font-black text-red-600 bg-red-50 dark:bg-red-950 px-2 py-1 rounded-lg">
                              {log.summary?.absent || 0} Absents
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => handlePrintLogSheet(log)}
                              variant="outline"
                              size="sm"
                              className="rounded-xl h-9 font-bold text-xs gap-1.5 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-600" />
                              Imprimer A4
                            </Button>
                            <Button
                              onClick={() => handleDownloadPDF(log)}
                              size="sm"
                              className="rounded-xl h-9 bg-slate-900 hover:bg-black text-white font-bold text-xs gap-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              PDF
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* HIDDEN PRINTABLE A4 FICHE D'ÉMARGEMENT TEMPLATE */}
      <div className="hidden">
        {previewLog && (
          <div ref={printSheetRef} className="p-8 bg-white text-slate-900 font-sans max-w-[800px] mx-auto border border-slate-300 rounded-lg shadow-none relative overflow-hidden">
            {/* Security Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <img
                src="/watermark-logo.png"
                alt=""
                className="w-[320px] max-w-[70%] h-auto opacity-[0.06] object-contain"
              />
            </div>

            {/* Header branding */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">CFP-ITMC DOUALA - LOGPOM</h2>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Institut & Centre de Formation Professionnelle aux Métiers des Technologies & du Management
                </p>
                <p className="text-[9px] text-slate-500">Agrément MINEFOP • N° 000214/MINEFOP/SG/DFOP</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-slate-900 text-white font-black text-xs px-3 py-1 uppercase tracking-wider rounded">
                  FICHE D'ÉMARGEMENT OFFICIELLE
                </span>
                <p className="text-xs font-mono font-bold text-blue-900 mt-1">Réf: {previewLog.id}</p>
              </div>
            </div>

            {/* Session Info Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 mb-6 text-xs">
              <div>
                <p><strong className="uppercase text-slate-500 text-[9px]">Classe / Promotion :</strong> <span className="font-bold">{previewLog.classCode}</span></p>
                <p><strong className="uppercase text-slate-500 text-[9px]">Filière DQP :</strong> <span className="font-bold">{previewLog.specialty}</span></p>
                <p><strong className="uppercase text-slate-500 text-[9px]">Module d'Enseignement :</strong> <span className="font-bold text-blue-900">{previewLog.moduleName}</span></p>
              </div>
              <div className="text-right">
                <p><strong className="uppercase text-slate-500 text-[9px]">Date de Séance :</strong> <span className="font-bold">{previewLog.date}</span></p>
                <p><strong className="uppercase text-slate-500 text-[9px]">Enseignant Titulaire :</strong> <span className="font-bold">{previewLog.teacherName}</span></p>
                <p><strong className="uppercase text-slate-500 text-[9px]">Durée de Cours :</strong> <span className="font-bold">{previewLog.hours || 2} Heures</span></p>
              </div>
            </div>

            {/* Attendance Student Table */}
            <table className="w-full text-xs text-left border-collapse border border-slate-300 mb-6">
              <thead className="bg-slate-900 text-white uppercase text-[9px] font-black tracking-wider">
                <tr>
                  <th className="p-2 border border-slate-700 w-10">N°</th>
                  <th className="p-2 border border-slate-700">Matricule Officiel</th>
                  <th className="p-2 border border-slate-700">Nom & Prénoms de l'Apprenant</th>
                  <th className="p-2 border border-slate-700 text-center w-24">Statut</th>
                  <th className="p-2 border border-slate-700">Émargement / Empreinte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {previewLog.records && previewLog.records.map((r: any, idx: number) => (
                  <tr key={r.studentId || idx}>
                    <td className="p-2 border border-slate-300 font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold text-blue-900">{r.matricule || r.studentId}</td>
                    <td className="p-2 border border-slate-300 font-bold text-slate-900">{r.studentName}</td>
                    <td className="p-2 border border-slate-300 text-center font-black uppercase text-[10px]">
                      {r.status === 'present' ? <span className="text-emerald-700">Présent</span> :
                       r.status === 'late' ? <span className="text-amber-700">Retard</span> :
                       r.status === 'excused' ? <span className="text-blue-700">Excusé</span> :
                       <span className="text-red-700">Absent</span>}
                    </td>
                    <td className="p-2 border border-slate-300 text-[10px] italic text-slate-500">
                      {r.note || (r.status === 'present' ? 'Signé en cours' : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bilan Summary */}
            <div className="flex justify-between items-center p-3 bg-slate-100 rounded border border-slate-300 mb-8 text-xs font-bold">
              <span>Effectif Total : {previewLog.summary?.total || 0}</span>
              <span className="text-emerald-800">Présents : {previewLog.summary?.present || 0}</span>
              <span className="text-amber-800">Retards : {previewLog.summary?.late || 0}</span>
              <span className="text-blue-800">Excusés : {previewLog.summary?.excused || 0}</span>
              <span className="text-red-800">Absents : {previewLog.summary?.absent || 0}</span>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-xs">
              <div className="text-center">
                <p className="font-black uppercase text-slate-600 mb-12">Signature de l'Enseignant :</p>
                <p className="font-bold text-slate-900">{previewLog.teacherName}</p>
              </div>
              <div className="text-center">
                <p className="font-black uppercase text-slate-600 mb-12">Visa Direction Pédagogique CFP-ITMC :</p>
                <p className="font-bold text-slate-900">Cachet & Signature Administrateur</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
