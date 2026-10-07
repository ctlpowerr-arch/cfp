import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Download, 
  Filter, 
  Search, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  UserSquare2, 
  Building2, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Clock3, 
  SlidersHorizontal,
  RefreshCw,
  Award,
  Key,
  ToggleLeft,
  ToggleRight,
  Eye,
  Check,
  X,
  FileSpreadsheet,
  ChevronRight,
  BookOpen,
  LayoutGrid,
  ListFilter
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { defaultSpecialties, FILIERES } from "@/data/specialtiesData";
import { useAcademicYear } from "@/context/AcademicYearContext";
import { useAuth } from "@/context/AuthContext";
import { printElementDirect, exportElementToPDF } from "@/lib/pdfExport";
import { TimetableAttendanceGrid, TeacherAnalyticsDetail } from "./attendanceHelpers";

export default function AdminAttendancePage() {
  const { user } = useAuth();
  const { selectedYear } = useAcademicYear();

  // Active Tab: sessions_logs | students_analytics | live_rollcall | teacher_detail | staff_clockin | roles
  const [activeTab, setActiveTab] = useState<'sessions_logs' | 'students_analytics' | 'live_rollcall' | 'teacher_detail' | 'staff_clockin' | 'roles'>('sessions_logs');

  // Presentation Form for Sessions: 'list' (Registre) vs 'grid' (Grille Emploi du Temps)
  const [sessionViewMode, setSessionViewMode] = useState<'list' | 'grid'>('list');

  // Core Data Lists
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [scheduleList, setScheduleList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [secretariesList, setSecretariesList] = useState<any[]>([]);
  const [staffAttendanceLogs, setStaffAttendanceLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Global & Tab Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPole, setSelectedPole] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all'); // 'all' | 'week' | 'month' | 'custom'
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Selected Log for Sheet Modal Preview
  const [previewLog, setPreviewLog] = useState<any | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState<boolean>(false);

  // Live Émargement Form State (for Tab 3)
  const [liveClassCode, setLiveClassCode] = useState<string>('G1-GL');
  const [liveModuleName, setLiveModuleName] = useState<string>('Algorithmique & Programmation');
  const [liveTeacherId, setLiveTeacherId] = useState<string>('TCH-001');
  const [liveDate, setLiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [liveHours, setLiveHours] = useState<number>(2);
  const [liveNotes, setLiveNotes] = useState<string>('');
  const [studentStatuses, setStudentStatuses] = useState<Record<string, { status: 'present' | 'late' | 'absent' | 'excused'; note: string }>>({});
  const [isSubmittingLive, setIsSubmittingLive] = useState<boolean>(false);

  // Staff Clock-in State (for Tab 4)
  const [staffRole, setStaffRole] = useState<'teacher' | 'secretary'>('teacher');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedStaffName, setSelectedStaffName] = useState<string>('');
  const [clockDate, setClockDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState<string>('08:00');
  const [checkOutTime, setCheckOutTime] = useState<string>('16:00');
  const [hoursWorked, setHoursWorked] = useState<number>(8);
  const [clockStatus, setClockStatus] = useState<string>('Présent');
  const [clockNotes, setClockNotes] = useState<string>('');
  const [isSubmittingStaff, setIsSubmittingStaff] = useState<boolean>(false);
  const [isManualEntry, setIsManualEntry] = useState<boolean>(false);

  // Secretary Delegation State (for Tab 5)
  const [secretaryPermissions, setSecretaryPermissions] = useState<Record<string, boolean>>({});

  // Printable references
  const singleSheetPrintRef = useRef<HTMLDivElement>(null);
  const analyticsPrintRef = useRef<HTMLDivElement>(null);
  const staffPrintRef = useRef<HTMLDivElement>(null);

  // Fetch all core system data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [logsRes, schedRes, stdRes, clsRes, tchRes, secRes, staffAttRes] = await Promise.all([
        fetch('/api/attendance/logs').then(r => r.json()).catch(() => []),
        fetch('/api/schedule').then(r => r.json()).catch(() => []),
        fetch('/api/students').then(r => r.json()).catch(() => []),
        fetch('/api/classes').then(r => r.json()).catch(() => []),
        fetch('/api/teachers').then(r => r.json()).catch(() => []),
        fetch('/api/secretaries').then(r => r.json()).catch(() => []),
        fetch('/api/staff-attendance').then(r => r.json()).catch(() => [])
      ]);

      if (Array.isArray(logsRes)) setAttendanceLogs(logsRes);
      if (Array.isArray(schedRes)) setScheduleList(schedRes);
      if (Array.isArray(stdRes)) setStudentsList(stdRes);
      if (Array.isArray(clsRes)) {
        setClassesList(clsRes);
        if (clsRes.length > 0 && !liveClassCode) {
          setLiveClassCode(clsRes[0].code);
        }
      }
      if (Array.isArray(tchRes)) {
        setTeachersList(tchRes);
        if (tchRes.length > 0 && !selectedStaffId) {
          setSelectedStaffId(tchRes[0].id);
          setSelectedStaffName(tchRes[0].name);
        }
      }
      if (Array.isArray(secRes)) {
        setSecretariesList(secRes);
        const perms: Record<string, boolean> = {};
        secRes.forEach((s: any) => {
          perms[s.id] = s.permissions?.includes('perm_emargement_staff') ?? true;
        });
        setSecretaryPermissions(perms);
      }
      if (Array.isArray(staffAttRes)) setStaffAttendanceLogs(staffAttRes);
    } catch (err) {
      console.error("Failed to load admin attendance data", err);
      toast.error("Erreur de chargement des données d'émargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedYear]);

  // Sync staff name selection
  useEffect(() => {
    if (isManualEntry) return;
    if (staffRole === 'teacher') {
      const found = teachersList.find(t => t.id === selectedStaffId);
      if (found) setSelectedStaffName(found.name);
    } else {
      const found = secretariesList.find(s => s.id === selectedStaffId);
      if (found) setSelectedStaffName(found.name);
    }
  }, [selectedStaffId, staffRole, isManualEntry, teachersList, secretariesList]);

  // Sync live rollcall students when class changes
  const liveClassStudents = useMemo(() => {
    return studentsList.filter(s => s.classCode === liveClassCode || s.promo === liveClassCode);
  }, [studentsList, liveClassCode]);

  useEffect(() => {
    const initial: Record<string, { status: 'present' | 'late' | 'absent' | 'excused'; note: string }> = {};
    liveClassStudents.forEach(s => {
      initial[s.id] = { status: 'present', note: '' };
    });
    setStudentStatuses(initial);
  }, [liveClassCode, liveClassStudents]);

  // Filter 35 Specialties based on Selected Pole
  const availableSpecialties = useMemo(() => {
    if (selectedPole === 'all') return defaultSpecialties;
    return defaultSpecialties.filter(sp => {
      const f = (sp.filiere || '').toLowerCase();
      if (selectedPole === 'batiment') return f.includes('bâtiment') || f.includes('batiment') || f.includes('construction');
      if (selectedPole === 'industrie') return f.includes('industrie') || f.includes('mécanique') || f.includes('énergie');
      if (selectedPole === 'informatique') return f.includes('informatique') || f.includes('digital') || f.includes('communication');
      if (selectedPole === 'administration') return f.includes('administration') || f.includes('commerce') || f.includes('gestion');
      return true;
    });
  }, [selectedPole]);

  // Filter Classes based on Selected Pole & Specialty
  const availableClasses = useMemo(() => {
    return classesList.filter(cls => {
      if (selectedPole === 'all') return true;
      const cc = cls.code.toLowerCase();
      if (selectedPole === 'batiment' && cc.includes('btp')) return true;
      if (selectedPole === 'industrie' && cc.includes('ind')) return true;
      if (selectedPole === 'informatique' && (cc.includes('gl') || cc.includes('rcs') || cc.includes('des'))) return true;
      if (selectedPole === 'administration' && cc.includes('cmd')) return true;
      return false;
    });
  }, [classesList, selectedPole]);

  // Filter Attendance Logs (Tab 1)
  const filteredLogs = useMemo(() => {
    return attendanceLogs.filter(log => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQ = 
          (log.moduleName && log.moduleName.toLowerCase().includes(q)) ||
          (log.teacherName && log.teacherName.toLowerCase().includes(q)) ||
          (log.classCode && log.classCode.toLowerCase().includes(q)) ||
          (log.specialty && log.specialty.toLowerCase().includes(q)) ||
          (log.date && log.date.toLowerCase().includes(q));
        if (!matchQ) return false;
      }

      if (selectedPole !== 'all') {
        const cc = (log.classCode || '').toLowerCase();
        const spec = (log.specialty || '').toLowerCase();
        if (selectedPole === 'batiment' && !cc.includes('btp') && !spec.includes('bâtiment') && !spec.includes('btp')) return false;
        if (selectedPole === 'industrie' && !cc.includes('ind') && !spec.includes('industrie') && !spec.includes('énergie')) return false;
        if (selectedPole === 'informatique' && !cc.includes('gl') && !cc.includes('rcs') && !cc.includes('des') && !spec.includes('informatique')) return false;
        if (selectedPole === 'administration' && !cc.includes('cmd') && !spec.includes('gestion') && !spec.includes('commerce')) return false;
      }

      if (selectedSpecialty !== 'all') {
        const spec = (log.specialty || '').toLowerCase();
        const sel = selectedSpecialty.toLowerCase();
        if (!spec.includes(sel) && !sel.includes(spec)) return false;
      }

      if (selectedClass !== 'all') {
        if (log.classCode !== selectedClass) return false;
      }

      if (selectedTeacher !== 'all') {
        if (log.teacherId !== selectedTeacher && log.teacherName !== selectedTeacher) return false;
      }

      if (filterPeriod === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        if (new Date(log.date) < oneWeekAgo) return false;
      } else if (filterPeriod === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        if (new Date(log.date) < oneMonthAgo) return false;
      } else if (filterPeriod === 'custom') {
        if (startDate && log.date < startDate) return false;
        if (endDate && log.date > endDate) return false;
      }

      return true;
    });
  }, [attendanceLogs, searchQuery, selectedPole, selectedSpecialty, selectedClass, selectedTeacher, filterPeriod, startDate, endDate]);

  // Overall Computed KPIs
  const totalSessionsCount = filteredLogs.length;
  const totalHoursDelivered = filteredLogs.reduce((sum, l) => sum + (Number(l.hours) || 2), 0);
  
  let totalPresents = 0, totalLates = 0, totalAbsents = 0, totalExcused = 0, totalHeadcount = 0;
  filteredLogs.forEach(l => {
    if (l.summary) {
      totalPresents += l.summary.present || 0;
      totalLates += l.summary.late || 0;
      totalAbsents += l.summary.absent || 0;
      totalExcused += l.summary.excused || 0;
      totalHeadcount += l.summary.total || 0;
    }
  });

  const overallAttendanceRate = totalHeadcount > 0 ? Math.round((totalPresents / totalHeadcount) * 100) : 92;

  // Compute Analytics per Specialty for Tab 2
  const specialtyAnalytics = useMemo(() => {
    const map = new Map<string, { totalSessions: number; totalPresents: number; totalRecords: number; studentsCount: number }>();
    
    classesList.forEach(cls => {
      const clsStudents = studentsList.filter(s => s.classCode === cls.code);
      const spec = cls.filières?.[0] || cls.name;
      const curr = map.get(spec) || { totalSessions: 0, totalPresents: 0, totalRecords: 0, studentsCount: clsStudents.length };
      curr.studentsCount = Math.max(curr.studentsCount, clsStudents.length);
      map.set(spec, curr);
    });

    filteredLogs.forEach(l => {
      const spec = l.specialty || l.className || 'Spécialité DQP';
      const curr = map.get(spec) || { totalSessions: 0, totalPresents: 0, totalRecords: 0, studentsCount: 8 };
      curr.totalSessions += 1;
      if (l.summary) {
        curr.totalPresents += l.summary.present || 0;
        curr.totalRecords += l.summary.total || 0;
      }
      map.set(spec, curr);
    });

    return Array.from(map.entries()).map(([specialty, val]) => ({
      specialty,
      totalSessions: val.totalSessions,
      studentsCount: val.studentsCount,
      averageRate: val.totalRecords > 0 ? Math.round((val.totalPresents / val.totalRecords) * 100) : 90
    }));
  }, [classesList, studentsList, filteredLogs]);

  // At-Risk Students list (<75% attendance)
  const atRiskStudents = useMemo(() => {
    return studentsList.filter(s => typeof s.attendance === 'number' && s.attendance < 75);
  }, [studentsList]);

  // Filtered Staff Logs (Tab 4)
  const filteredStaffLogs = useMemo(() => {
    return staffAttendanceLogs.filter(log => {
      if (staffRole === 'teacher' && log.personRole !== 'teacher') return false;
      if (staffRole === 'secretary' && log.personRole === 'teacher') return false;

      if (filterPeriod === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        if (new Date(log.date) < oneWeekAgo) return false;
      } else if (filterPeriod === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        if (new Date(log.date) < oneMonthAgo) return false;
      } else if (filterPeriod === 'custom') {
        if (startDate && log.date < startDate) return false;
        if (endDate && log.date > endDate) return false;
      }
      return true;
    });
  }, [staffAttendanceLogs, staffRole, filterPeriod, startDate, endDate]);

  // Open Detailed Sheet Preview Modal
  const handleOpenSheetModal = (log: any) => {
    setPreviewLog(log);
    setIsSheetModalOpen(true);
  };

  // Pre-fill live attendance from schedule slot
  const handleSelectSlotForAttendance = (slot: any) => {
    if (slot.classCode) setLiveClassCode(slot.classCode);
    if (slot.subject) setLiveModuleName(slot.subject);
    if (slot.teacherId) setLiveTeacherId(slot.teacherId);
    if (slot.duration) {
      const h = parseInt(slot.duration);
      if (!isNaN(h)) setLiveHours(h);
    }
    setActiveTab('live_rollcall');
    toast.info(`Créneau chargé : ${slot.subject} (${slot.classCode}) • ${slot.teacherName}`);
  };

  // Submit Live Émargement (Tab 3)
  const handleSubmitLiveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (liveClassStudents.length === 0) {
      toast.error("Aucun apprenant trouvé dans cette classe.");
      return;
    }

    setIsSubmittingLive(true);
    try {
      const selectedTch = teachersList.find(t => t.id === liveTeacherId) || teachersList[0];
      const records = liveClassStudents.map(s => {
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
          classCode: liveClassCode,
          specialty: liveClassStudents[0]?.specialty || "Formation Professionnelle",
          moduleName: liveModuleName,
          teacherId: selectedTch?.id || "TCH-001",
          teacherName: selectedTch?.name || "Formateur CFP-ITMC",
          date: liveDate,
          hours: liveHours,
          notes: liveNotes,
          records
        })
      });

      if (response.ok) {
        const newLog = await response.json();
        toast.success(`Fiche d'émargement enregistrée avec succès (${newLog.presentCount || records.length} présents) !`);
        
        const updatedLogs = await fetch('/api/attendance/logs').then(r => r.json()).catch(() => []);
        if (Array.isArray(updatedLogs)) setAttendanceLogs(updatedLogs);

        setActiveTab('sessions_logs');
      } else {
        toast.error("Échec de l'enregistrement de l'émargement.");
      }
    } catch (err) {
      toast.error("Erreur serveur lors de la validation.");
    } finally {
      setIsSubmittingLive(false);
    }
  };

  // Submit Staff Attendance (Tab 4)
  const handleSubmitStaffAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffName) {
      toast.error("Veuillez sélectionner ou saisir un collaborateur.");
      return;
    }

    setIsSubmittingStaff(true);
    try {
      const response = await fetch('/api/staff-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId: selectedStaffId,
          personName: selectedStaffName,
          personRole: staffRole,
          date: clockDate,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          hoursWorked: hoursWorked,
          status: clockStatus,
          notes: clockNotes,
          recordedBy: user?.name || "Super Administrateur"
        })
      });

      if (response.ok) {
        toast.success(`Pointage validé pour ${selectedStaffName} (${clockStatus}) !`);
        const updated = await fetch('/api/staff-attendance').then(r => r.json()).catch(() => []);
        if (Array.isArray(updated)) setStaffAttendanceLogs(updated);
        setClockNotes('');
      } else {
        toast.error("Échec de l'enregistrement du pointage.");
      }
    } catch (err) {
      toast.error("Erreur serveur lors de l'enregistrement.");
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  // Toggle Secretary Permission (Tab 5)
  const handleToggleSecretaryPermission = async (secId: string) => {
    const currentVal = !!secretaryPermissions[secId];
    const newVal = !currentVal;
    setSecretaryPermissions(prev => ({ ...prev, [secId]: newVal }));

    try {
      const sec = secretariesList.find(s => s.id === secId);
      if (sec) {
        let currentPerms: string[] = sec.permissions || [];
        if (newVal && !currentPerms.includes('perm_emargement_staff')) {
          currentPerms.push('perm_emargement_staff');
        } else if (!newVal) {
          currentPerms = currentPerms.filter(p => p !== 'perm_emargement_staff');
        }

        await fetch(`/api/secretaries/${secId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions: currentPerms })
        });

        toast.success(`Habilitation d'émargement ${newVal ? 'accordée' : 'révoquée'} pour ${sec.name}`);
      }
    } catch (err) {
      toast.error("Échec de mise à jour de l'habilitation.");
    }
  };

  // Export CSV of Attendance Records
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      toast.error("Aucune donnée à exporter.");
      return;
    }

    const headers = ["ID Fiche", "Classe", "Spécialité", "Module", "Enseignant", "Date", "Heures", "Présents", "Retards", "Absents", "Total Apprenants", "Taux Assiduité"];
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.classCode}"`,
      `"${l.specialty || ''}"`,
      `"${(l.moduleName || '').replace(/"/g, '""')}"`,
      `"${(l.teacherName || '').replace(/"/g, '""')}"`,
      `"${l.date}"`,
      l.hours || 2,
      l.summary?.present || 0,
      l.summary?.late || 0,
      l.summary?.absent || 0,
      l.summary?.total || 0,
      `"${l.summary?.total > 0 ? Math.round((l.summary.present / l.summary.total) * 100) : 0}%"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Export_Emargements_ITMC_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Fichier CSV téléchargé avec succès !");
  };

  // Print Handlers
  const handlePrintSingleSheet = () => {
    if (singleSheetPrintRef.current) {
      printElementDirect(singleSheetPrintRef.current, `Fiche_Emargement_${previewLog?.classCode || 'ITMC'}`);
    }
  };

  const handleDownloadSingleSheetPDF = () => {
    if (singleSheetPrintRef.current) {
      exportElementToPDF(singleSheetPrintRef.current, `Fiche_Emargement_${previewLog?.classCode || 'ITMC'}_${previewLog?.date}.pdf`);
    }
  };

  const handlePrintAnalyticsReport = () => {
    if (analyticsPrintRef.current) {
      printElementDirect(analyticsPrintRef.current, "Rapport_Assiduite_Global_ITMC");
    }
  };

  const handlePrintStaffReport = () => {
    if (staffPrintRef.current) {
      printElementDirect(staffPrintRef.current, "Feuille_Pointage_Personnel_ITMC");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-2 sm:px-4 select-none">
      {/* 1. Super Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-7 md:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-xl shadow-xs">
                Super Administration • CFP-ITMC
              </Badge>
              <Badge variant="outline" className="text-slate-300 border-slate-700 font-bold text-[10px] px-3 py-1 rounded-xl">
                Session {selectedYear} • Emploi du Temps Connecté
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
              Émargement, Présences & Assiduité Globale
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
              Synchronisé avec les programmes de cours réels, les fiches officielles, la grille de l'emploi du temps et les bilans formateurs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              onClick={() => setActiveTab('live_rollcall')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-wider h-11 px-4 shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Effectuer un Appel
            </Button>
            <Button
              variant="outline"
              onClick={loadAllData}
              className="rounded-2xl border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-11 px-3"
              title="Actualiser les données réelles"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Dedicated Responsive Horizontal Navigation Bar */}
      <div className="bg-slate-100/90 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: 'sessions_logs', label: `Fiches & Planning (${totalSessionsCount})`, icon: FileText },
            { id: 'teacher_detail', label: "Bilan & Évolution Graphique (Formateur & Staff)", icon: TrendingUp },
            { id: 'students_analytics', label: "Statistiques & 4 Graphiques", icon: BarChart3 },
            { id: 'live_rollcall', label: "Nouvel Appel en Direct", icon: Plus },
            { id: 'staff_clockin', label: "Pointage Personnel", icon: UserSquare2 },
            { id: 'roles', label: "Habilitations & Rôles", icon: Key }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 select-none cursor-pointer whitespace-nowrap",
                  isActive 
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. KPI Overview Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Séances</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">{totalSessionsCount}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Fiches d'appel validées</p>
        </Card>

        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assiduité Globale</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">{overallAttendanceRate}%</p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Moyenne générale de présence</p>
        </Card>

        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Heures Réalisées</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">{totalHoursDelivered}h</p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Volume horaire dispensé</p>
        </Card>

        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Apprenants à Risque</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">{atRiskStudents.length}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Assiduité &lt; 75% du seuil</p>
        </Card>
      </div>

      {/* 4. Global Multi-Criteria Filter Bar */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
          
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Rechercher par matière, formateur, classe..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-2xl border-slate-200 bg-slate-50/70 dark:bg-slate-950/40 text-xs font-bold focus-visible:ring-blue-600"
            />
          </div>

          <div className="col-span-1 lg:col-span-3">
            <ModernSelect
              value={selectedPole}
              onChange={(e) => {
                setSelectedPole(e.target.value);
                setSelectedSpecialty('all');
                setSelectedClass('all');
              }}
              className="h-11 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 font-bold text-xs"
            >
              <option value="all">🎓 Toutes les Filières (4 Pôles)</option>
              <option value="batiment">🏗️ BTP, Construction & Travaux</option>
              <option value="industrie">⚙️ Industrie, Mécanique & Énergie</option>
              <option value="informatique">💻 Informatique & Digital</option>
              <option value="administration">💼 Administration & Gestion</option>
            </ModernSelect>
          </div>

          <div className="col-span-1 lg:col-span-3">
            <ModernSelect
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="h-11 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 font-bold text-xs"
            >
              <option value="all">⚡ Spécialités DQP ({availableSpecialties.length})</option>
              {availableSpecialties.map(sp => (
                <option key={sp.id} value={sp.name}>
                  {sp.name}
                </option>
              ))}
            </ModernSelect>
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <ModernSelect
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-11 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 font-bold text-xs"
            >
              <option value="all">Toutes les Classes ({availableClasses.length})</option>
              {availableClasses.map(cls => (
                <option key={cls.id} value={cls.code}>
                  {cls.code} • {cls.name}
                </option>
              ))}
            </ModernSelect>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Période :</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Toutes Dates' },
                { id: 'week', label: '7 Derniers Jours' },
                { id: 'month', label: '30 Derniers Jours' },
                { id: 'custom', label: 'Personnalisée' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setFilterPeriod(p.id)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer",
                    filterPeriod === p.id 
                      ? "bg-blue-600 text-white font-black shadow-xs" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {filterPeriod === 'custom' && (
              <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
                <Input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="h-8 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 w-32"
                />
                <span className="text-slate-400 text-xs">à</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="h-8 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 w-32"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider gap-1.5 border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter CSV
            </Button>

            <Button
              onClick={handlePrintAnalyticsReport}
              size="sm"
              className="h-9 px-3.5 rounded-xl bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer Bilan A4
            </Button>
          </div>
        </div>
      </Card>

      {/* ========================================================= */}
      {/* TAB 1: REGISTRE DES FICHES EN 2 FORMES (LISTE & GRILLE) */}
      {/* ========================================================= */}
      {activeTab === 'sessions_logs' && (
        <div className="space-y-4">
          {/* View Mode Switcher: Forme 1 (Liste) vs Forme 2 (Grille Emploi du Temps) */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-400">Présentation des Émargements :</span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setSessionViewMode('list')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer",
                    sessionViewMode === 'list' 
                      ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs" 
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  Forme 1 : Registre / Liste ({filteredLogs.length})
                </button>

                <button
                  onClick={() => setSessionViewMode('grid')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer",
                    sessionViewMode === 'grid' 
                      ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs" 
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Forme 2 : Grille Emploi du Temps ({scheduleList.length} Créneaux)
                </button>
              </div>
            </div>

            <Button
              onClick={() => setActiveTab('live_rollcall')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider gap-1.5 h-8 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Effectuer un Appel
            </Button>
          </div>

          {sessionViewMode === 'grid' ? (
            <TimetableAttendanceGrid
              scheduleList={scheduleList}
              attendanceLogs={attendanceLogs}
              selectedClass={selectedClass}
              selectedTeacher={selectedTeacher}
              onSelectSlotForAttendance={handleSelectSlotForAttendance}
              onOpenSheetModal={handleOpenSheetModal}
            />
          ) : (
            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardContent className="p-0">
                {filteredLogs.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-xs font-bold space-y-2">
                    <Users className="w-10 h-10 mx-auto text-slate-300" />
                    <p>Aucune fiche d'émargement ne correspond à vos filtres</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-[680px]">
                      <TableHeader className="bg-slate-50/80 dark:bg-slate-950/40">
                        <TableRow className="border-b border-slate-200/70 dark:border-slate-800">
                          <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider py-4 pl-6">Classe & Spécialité</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Module Professionnel</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Formateur</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Date & Durée</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Présences</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-right pr-6">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.map(log => {
                          const presentCount = log.summary?.present || 0;
                          const totalCount = log.summary?.total || 8;
                          const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

                          return (
                            <TableRow key={log.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                              <TableCell className="py-3.5 pl-6">
                                <span className="text-xs font-black text-slate-900 dark:text-white block">
                                  {log.classCode}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5 truncate max-w-[180px]">
                                  {log.specialty || log.className}
                                </span>
                              </TableCell>

                              <TableCell>
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[240px]">
                                  {log.moduleName}
                                </span>
                                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold block">
                                  Cours Présentiel & Pratique
                                </span>
                              </TableCell>

                              <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                {log.teacherName}
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{log.date}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                  {log.hours || 2} heures de cours
                                </span>
                              </TableCell>

                              <TableCell className="text-center">
                                <div className="inline-flex flex-col items-center">
                                  <Badge className={cn(
                                    "font-black text-[10px] px-2.5 py-0.5 rounded-full border-none",
                                    rate >= 90 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" :
                                    rate >= 75 ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" :
                                    "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                  )}>
                                    {presentCount} / {totalCount} ({rate}%)
                                  </Badge>
                                  {log.summary?.late > 0 && (
                                    <span className="text-[9px] text-amber-600 font-bold mt-0.5">
                                      {log.summary.late} retard(s)
                                    </span>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell className="text-right pr-6">
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenSheetModal(log)}
                                  className="h-8 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider gap-1.5 shadow-sm"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Voir Feuille
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: BILAN INDIVIDUEL & STATS FORMATEURS & STAFF */}
      {/* ========================================================= */}
      {activeTab === 'teacher_detail' && (
        <TeacherAnalyticsDetail
          teachersList={teachersList}
          secretariesList={secretariesList}
          attendanceLogs={attendanceLogs}
          staffAttendanceLogs={staffAttendanceLogs}
          scheduleList={scheduleList}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 3: STATISTIQUES & 4 GRAPHIQUES D'ASSIDUITÉ */}
      {/* ========================================================= */}
      {activeTab === 'students_analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            
            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-blue-50 text-blue-700 border-none font-black text-[9px] uppercase mb-1">
                    Graphique 1 / 4
                  </Badge>
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Assiduité par Spécialité DQP
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">Taux Moyen</span>
              </div>

              <div className="space-y-3.5 pt-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {specialtyAnalytics.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[240px]">
                        {item.specialty}
                      </span>
                      <span className="font-mono font-black text-blue-600 dark:text-blue-400">
                        {item.averageRate}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          item.averageRate >= 90 ? "bg-emerald-500" :
                          item.averageRate >= 75 ? "bg-blue-600" : "bg-rose-500"
                        )}
                        style={{ width: `${item.averageRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-indigo-50 text-indigo-700 border-none font-black text-[9px] uppercase mb-1">
                    Graphique 2 / 4
                  </Badge>
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    Évolution Chronologique des Séances
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">Session 2026-2027</span>
              </div>

              <div className="pt-4 flex items-end justify-between h-56 gap-1.5 sm:gap-2">
                {[
                  { month: 'Sept', rate: 94 },
                  { month: 'Oct', rate: 91 },
                  { month: 'Nov', rate: 88 },
                  { month: 'Déc', rate: 95 },
                  { month: 'Janv', rate: 92 },
                  { month: 'Févr', rate: 90 },
                  { month: 'Mars', rate: 93 }
                ].map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.rate}%
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl h-full flex flex-col justify-end overflow-hidden p-0.5">
                      <div 
                        className="bg-blue-600 w-full rounded-t-lg transition-all duration-300"
                        style={{ height: `${m.rate}%` }}
                        title={`Présents : ${m.rate}%`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase truncate">{m.month}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[9px] uppercase mb-1">
                    Graphique 3 / 4
                  </Badge>
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-emerald-600" />
                    Répartition Globale des Statuts
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">Total {totalHeadcount} Appels</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center space-y-1">
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {totalPresents}
                  </span>
                  <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                    Présences ({overallAttendanceRate}%)
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center space-y-1">
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-400">
                    {totalLates}
                  </span>
                  <p className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                    Retards Signalés
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center space-y-1">
                  <span className="text-2xl font-black text-blue-700 dark:text-blue-400">
                    {totalExcused}
                  </span>
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                    Absences Excusées
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center space-y-1">
                  <span className="text-2xl font-black text-rose-700 dark:text-rose-400">
                    {totalAbsents}
                  </span>
                  <p className="text-[10px] font-black uppercase text-rose-600 tracking-wider">
                    Absences Injustifiées
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-rose-50 text-rose-700 border-none font-black text-[9px] uppercase mb-1">
                    Graphique 4 / Alerte
                  </Badge>
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Apprenants à Risque (&lt; 75%)
                  </h3>
                </div>
                <Badge className="bg-rose-600 text-white font-black text-[10px] rounded-full px-2.5">
                  {atRiskStudents.length} Signalé(s)
                </Badge>
              </div>

              <div className="overflow-y-auto max-h-56 custom-scrollbar rounded-2xl border border-slate-100 dark:border-slate-800">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-black text-[10px] uppercase text-slate-400">Apprenant</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-slate-400">Classe / Spécialité</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-slate-400 text-right">Taux</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atRiskStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-slate-400 font-bold text-xs">
                          Aucun étudiant sous le seuil critique de 75% !
                        </TableCell>
                      </TableRow>
                    ) : (
                      atRiskStudents.map(std => (
                        <TableRow key={std.id} className="hover:bg-rose-50/40 dark:hover:bg-rose-950/20">
                          <TableCell className="py-2.5">
                            <p className="font-black text-xs text-slate-900 dark:text-white">{std.name}</p>
                            <p className="font-mono text-[10px] font-bold text-rose-600">{std.matricule || std.id}</p>
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-300 py-2.5">
                            {std.specialty} ({std.classCode})
                          </TableCell>
                          <TableCell className="text-right font-black text-rose-600 text-xs py-2.5">
                            {std.attendance}%
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PRISE D'ÉMARGEMENT DIRECTE AVEC SÉLECTION CRÉNEAU */}
      {/* ========================================================= */}
      {activeTab === 'live_rollcall' && (
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="p-4 sm:p-6 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Prise d'Émargement Immédiate d'une Séance
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Choisissez un créneau de l'emploi du temps ou configurez la séance manuellement.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updated: Record<string, { status: 'present' | 'late' | 'absent' | 'excused'; note: string }> = {};
                    liveClassStudents.forEach(s => {
                      updated[s.id] = { status: 'present', note: studentStatuses[s.id]?.note || '' };
                    });
                    setStudentStatuses(updated);
                    toast.success(`Tous les ${liveClassStudents.length} apprenants marqués Présents !`);
                  }}
                  className="rounded-xl text-xs font-black text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-9"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Tous Présents
                </Button>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmitLiveSession}>
            <CardContent className="p-4 sm:p-6 space-y-6">
              {/* Quick Select from Schedule */}
              {scheduleList.length > 0 && (
                <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Chargement Rapide depuis l'Emploi du Temps :
                  </label>
                  <select
                    onChange={(e) => {
                      const slot = scheduleList.find(s => s.id === e.target.value);
                      if (slot) handleSelectSlotForAttendance(slot);
                    }}
                    className="w-full h-10 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 font-bold text-xs text-slate-900 dark:text-white px-3 outline-none"
                    aria-label="Charger depuis l'emploi du temps"
                  >
                    <option value="">Sélectionner un cours planifié pour auto-compléter...</option>
                    {scheduleList.map(s => (
                      <option key={s.id} value={s.id}>
                        [{s.day} {s.time}] {s.classCode} • {s.subject} ({s.teacherName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Configuration Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Classe / Promotion</label>
                  <ModernSelect
                    value={liveClassCode}
                    onChange={(e) => setLiveClassCode(e.target.value)}
                    className="h-10 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border-slate-200"
                  >
                    {classesList.map(cls => (
                      <option key={cls.id} value={cls.code}>
                        {cls.code} • {cls.name}
                      </option>
                    ))}
                  </ModernSelect>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Formateur Responsable</label>
                  <ModernSelect
                    value={liveTeacherId}
                    onChange={(e) => setLiveTeacherId(e.target.value)}
                    className="h-10 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border-slate-200"
                  >
                    {teachersList.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialty || 'Formateur'})
                      </option>
                    ))}
                  </ModernSelect>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Date de la Séance</label>
                  <Input
                    type="date"
                    value={liveDate}
                    onChange={e => setLiveDate(e.target.value)}
                    className="h-10 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Durée (Heures)</label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={liveHours}
                    onChange={e => setLiveHours(Number(e.target.value))}
                    className="h-10 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border-slate-200"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 lg:col-span-4 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Intitulé du Module / Leçon</label>
                  <Input
                    placeholder="Ex: Travaux Pratiques en Atelier, Algorithmique, Tuyauterie..."
                    value={liveModuleName}
                    onChange={e => setLiveModuleName(e.target.value)}
                    className="h-10 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border-slate-200"
                  />
                </div>
              </div>

              {/* Roster Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Liste d'Appel des Apprenants ({liveClassStudents.length})
                  </h4>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Table className="min-w-[620px]">
                    <TableHeader className="bg-slate-50 dark:bg-slate-950/40">
                      <TableRow className="border-b border-slate-200/80">
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 pl-6 py-3">Apprenant</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400">Matricule</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 text-center">Statut de Présence</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 pr-6">Observation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {liveClassStudents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10 text-slate-400 text-xs font-bold">
                            Aucun apprenant enregistré dans la classe {liveClassCode}
                          </TableCell>
                        </TableRow>
                      ) : (
                        liveClassStudents.map(student => {
                          const currentStatus = studentStatuses[student.id]?.status || 'present';
                          const currentNote = studentStatuses[student.id]?.note || '';

                          return (
                            <TableRow key={student.id} className="border-b border-slate-100 dark:border-slate-800">
                              <TableCell className="pl-6 py-3">
                                <span className="text-xs font-black text-slate-900 dark:text-white block">{student.name}</span>
                                <span className="text-[10px] text-slate-400 font-bold block">{student.specialty}</span>
                              </TableCell>

                              <TableCell className="text-xs font-mono font-bold text-blue-600">
                                {student.matricule || student.id}
                              </TableCell>

                              <TableCell className="text-center">
                                <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                  {[
                                    { id: 'present', label: 'Présent', color: 'bg-emerald-600 text-white' },
                                    { id: 'late', label: 'Retard', color: 'bg-amber-500 text-white' },
                                    { id: 'excused', label: 'Excusé', color: 'bg-blue-600 text-white' },
                                    { id: 'absent', label: 'Absent', color: 'bg-rose-600 text-white' }
                                  ].map(s => (
                                    <button
                                      key={s.id}
                                      type="button"
                                      onClick={() => {
                                        setStudentStatuses(prev => ({
                                          ...prev,
                                          [student.id]: { ...(prev[student.id] || { note: '' }), status: s.id as any }
                                        }));
                                      }}
                                      className={cn(
                                        "px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer",
                                        currentStatus === s.id ? s.color : "text-slate-500 hover:text-slate-900"
                                      )}
                                    >
                                      {s.label}
                                    </button>
                                  ))}
                                </div>
                              </TableCell>

                              <TableCell className="pr-6">
                                <Input
                                  placeholder="Justification, retard..."
                                  value={currentNote}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setStudentStatuses(prev => ({
                                      ...prev,
                                      [student.id]: { ...(prev[student.id] || { status: 'present' }), note: val }
                                    }));
                                  }}
                                  className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border-slate-200"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmittingLive || liveClassStudents.length === 0}
                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmittingLive ? "Enregistrement en cours..." : "Valider et Signer la Fiche d'Émargement"}
              </Button>
            </CardContent>
          </form>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 5: POINTAGE DU PERSONNEL & FORMATEURS */}
      {/* ========================================================= */}
      {activeTab === 'staff_clockin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-5 rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-5 sm:p-6 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserSquare2 className="w-5 h-5 text-blue-600" />
                Pointage du Personnel
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Enregistrez les arrivées et départs quotidiens.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmitStaffAttendance}>
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Catégorie de Personnel</label>
                  <ModernSelect
                    value={staffRole}
                    onChange={e => {
                      const newRole = e.target.value as any;
                      setStaffRole(newRole);
                      setIsManualEntry(false);
                      if (newRole === 'teacher' && teachersList.length > 0) {
                        setSelectedStaffId(teachersList[0].id);
                        setSelectedStaffName(teachersList[0].name);
                      } else if (secretariesList.length > 0) {
                        setSelectedStaffId(secretariesList[0].id);
                        setSelectedStaffName(secretariesList[0].name);
                      }
                    }}
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
                  >
                    <option value="teacher">Corps Enseignant / Formateurs</option>
                    <option value="secretary">Personnel Administratif & Secrétariat</option>
                  </ModernSelect>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Membre du Personnel</label>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isManualEntry;
                        setIsManualEntry(next);
                        if (next) setSelectedStaffName('');
                      }}
                      className="text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      {isManualEntry ? "Choisir dans la liste" : "Saisie Manuelle"}
                    </button>
                  </div>
                  {isManualEntry ? (
                    <Input
                      placeholder="Nom complet..."
                      value={selectedStaffName}
                      onChange={e => setSelectedStaffName(e.target.value)}
                      className="h-10 rounded-xl text-xs font-bold"
                    />
                  ) : (
                    <ModernSelect
                      value={selectedStaffId}
                      onChange={e => setSelectedStaffId(e.target.value)}
                      className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
                    >
                      {staffRole === 'teacher' ? (
                        teachersList.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.specialty || 'Formateur'})
                          </option>
                        ))
                      ) : (
                        secretariesList.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.email})
                          </option>
                        ))
                      )}
                    </ModernSelect>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Date</label>
                    <Input
                      type="date"
                      value={clockDate}
                      onChange={e => setClockDate(e.target.value)}
                      className="h-10 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Statut</label>
                    <ModernSelect
                      value={clockStatus}
                      onChange={e => setClockStatus(e.target.value)}
                      className="h-10 rounded-xl text-xs font-bold"
                    >
                      <option value="Présent">Présent</option>
                      <option value="Retard">Retard</option>
                      <option value="Absent">Absent</option>
                      <option value="Congé">Congé</option>
                      <option value="Mission">Mission</option>
                    </ModernSelect>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Arrivée</label>
                    <Input
                      type="time"
                      value={checkInTime}
                      onChange={e => setCheckInTime(e.target.value)}
                      className="h-10 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Départ</label>
                    <Input
                      type="time"
                      value={checkOutTime}
                      onChange={e => setCheckOutTime(e.target.value)}
                      className="h-10 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Durée Validée (Heures)</label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={hoursWorked}
                    onChange={e => setHoursWorked(Number(e.target.value))}
                    className="h-10 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Notes / Justificatif</label>
                  <textarea
                    placeholder="Observations particulières..."
                    value={clockNotes}
                    onChange={e => setClockNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium min-h-[60px] outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingStaff}
                  className="w-full h-11 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider"
                >
                  <UserCheck className="w-4 h-4 mr-1.5" />
                  {isSubmittingStaff ? "Enregistrement..." : "Valider le Pointage"}
                </Button>
              </CardContent>
            </form>
          </Card>

          {/* Staff Log Table */}
          <Card className="lg:col-span-7 rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-5 sm:p-6 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-black text-slate-900 dark:text-white">
                  Registre des Pointages ({filteredStaffLogs.length})
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Historique certifié par la direction.
                </CardDescription>
              </div>

              <Button
                onClick={handlePrintStaffReport}
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider gap-1.5 shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                <Table className="min-w-[580px]">
                  <TableHeader className="bg-slate-50 dark:bg-slate-950/40 sticky top-0 z-10">
                    <TableRow className="border-b border-slate-200/80">
                      <TableHead className="text-[10px] font-black uppercase text-slate-400 pl-6 py-3">Membre</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-400">Date & Horaires</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-400 text-center">Durée</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-400 text-center">Statut</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-400 pr-6">Opérateur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaffLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-bold text-xs">
                          Aucun pointage trouvé dans cette période.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStaffLogs.map(log => (
                        <TableRow key={log.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                          <TableCell className="pl-6 py-3">
                            <span className="text-xs font-black text-slate-900 dark:text-white block">{log.personName}</span>
                            <span className="text-[9px] font-bold text-blue-600 block">
                              {log.personRole === 'teacher' ? 'Formateur' : 'Secrétariat'}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{log.date}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{log.checkIn} - {log.checkOut}</span>
                          </TableCell>

                          <TableCell className="text-center font-mono font-bold text-xs">
                            {log.hoursWorked || 8}h
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge className={cn(
                              "font-black text-[9px] uppercase border-none px-2 py-0.5",
                              log.status === 'Présent' ? "bg-emerald-50 text-emerald-700" :
                              log.status === 'Retard' ? "bg-amber-50 text-amber-700" :
                              log.status === 'Absent' ? "bg-rose-50 text-rose-700" :
                              "bg-blue-50 text-blue-700"
                            )}>
                              {log.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-xs font-semibold text-slate-500 pr-6">
                            {log.recordedBy || 'Super Admin'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: HABILITATIONS & DÉLÉGATION DE RÔLE */}
      {/* ========================================================= */}
      {activeTab === 'roles' && (
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden max-w-4xl mx-auto">
          <CardHeader className="p-5 sm:p-7 md:p-8 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  Délégation & Habilitations d'Émargement
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  Autorisez les secrétaires à marquer l'émargement et les pointages du personnel.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-7 md:p-8 space-y-6">
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-blue-50/70 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900">
              💡 <strong className="text-slate-900 dark:text-white font-bold">Règles de sécurité :</strong> En activant l'habilitation ci-dessous, la secrétaire désignée pourra valider les fiches d'émargement et les présences quotidiennes des formateurs et apprenants.
            </p>

            <div className="space-y-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Collaborateurs Administratifs ({secretariesList.length})
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {secretariesList.map(sec => {
                  const isGranted = !!secretaryPermissions[sec.id];
                  return (
                    <div key={sec.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sec.name}`} />
                          <AvatarFallback>{sec.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-black text-xs text-slate-900 dark:text-white">{sec.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{sec.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={cn(
                          "font-black text-[9px] uppercase border-none px-2.5 py-1",
                          isGranted ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        )}>
                          {isGranted ? "Émargement Autorisé" : "Lecture Seule"}
                        </Badge>

                        <button
                          onClick={() => handleToggleSecretaryPermission(sec.id)}
                          className="text-blue-600 hover:scale-110 transition-transform cursor-pointer"
                          title="Basculer l'habilitation"
                        >
                          {isGranted ? (
                            <ToggleRight className="w-8 h-8 text-blue-600" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-slate-300" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DIALOG MODAL: OFFICIAL SHEET PREVIEW & PDF PRINT */}
      <Dialog open={isSheetModalOpen} onOpenChange={setIsSheetModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar p-4 sm:p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Feuille Officielle d'Émargement • {previewLog?.classCode} ({previewLog?.date})
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Document officiel certifié par le CFP-ITMC avec liste des émargements et signatures.
            </DialogDescription>
          </DialogHeader>

          {previewLog && (
            <div className="space-y-6">
              <div 
                ref={singleSheetPrintRef} 
                className="p-4 sm:p-8 bg-white text-slate-900 font-sans border border-slate-200 rounded-2xl shadow-sm relative overflow-x-auto"
              >
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4 min-w-[550px]">
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-900">CFP-ITMC DOUALA - LOGPOM</h2>
                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider">
                      FEUILLE OFFICIELLE D'ÉMARGEMENT & DE PRÉSENCE EN COURS
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium">Homologation MINEFOP • Arrêté N° 0127/MINEFOP/SG/DFOP</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-slate-900 text-white font-black text-[10px] uppercase rounded">
                      Fiche #{previewLog.id}
                    </Badge>
                    <p className="text-[10px] font-mono font-bold text-slate-700 mt-1">Date : {previewLog.date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-4 text-xs min-w-[550px]">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Classe / Promo</span>
                    <span className="font-black text-slate-900">{previewLog.classCode}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Spécialité</span>
                    <span className="font-black text-slate-900 truncate block">{previewLog.specialty}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Formateur</span>
                    <span className="font-black text-slate-900">{previewLog.teacherName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Volume Horaire</span>
                    <span className="font-black text-slate-900">{previewLog.hours || 2} Heures</span>
                  </div>
                  <div className="col-span-2 sm:col-span-4 pt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Module / Thème</span>
                    <span className="font-bold text-blue-900">{previewLog.moduleName}</span>
                  </div>
                </div>

                <table className="w-full text-xs text-left border-collapse border border-slate-300 mb-6 min-w-[550px]">
                  <thead className="bg-slate-900 text-white uppercase text-[9px] font-black">
                    <tr>
                      <th className="p-2 border border-slate-700 w-12 text-center">N°</th>
                      <th className="p-2 border border-slate-700">Nom & Prénoms Apprenant</th>
                      <th className="p-2 border border-slate-700 w-28">Matricule</th>
                      <th className="p-2 border border-slate-700 w-28 text-center">Statut</th>
                      <th className="p-2 border border-slate-700 w-36">Signature / Émargement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {Array.isArray(previewLog.records) && previewLog.records.map((r: any, idx: number) => (
                      <tr key={idx} className={r.status === 'absent' ? 'bg-rose-50/50' : ''}>
                        <td className="p-2 border border-slate-300 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-2 border border-slate-300 font-bold">{r.studentName}</td>
                        <td className="p-2 border border-slate-300 font-mono text-[10px] text-blue-900 font-semibold">{r.matricule}</td>
                        <td className="p-2 border border-slate-300 text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-black uppercase inline-block",
                            r.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'late' ? 'bg-amber-100 text-amber-800' :
                            r.status === 'excused' ? 'bg-blue-100 text-blue-800' :
                            'bg-rose-100 text-rose-800'
                          )}>
                            {r.status === 'present' ? 'Présent' : r.status === 'late' ? 'Retard' : r.status === 'excused' ? 'Excusé' : 'Absent'}
                          </span>
                        </td>
                        <td className="p-2 border border-slate-300 font-mono text-[10px] text-slate-400 italic">
                          {r.status === 'present' ? '✓ Émargé' : r.note || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-300 text-xs min-w-[550px]">
                  <div>
                    <p className="font-bold text-slate-700 mb-1">Synthèse de Séance :</p>
                    <p className="text-[10px] text-slate-600">Présents : <strong>{previewLog.summary?.present || 0}</strong> • Absents : <strong>{previewLog.summary?.absent || 0}</strong> • Total : <strong>{previewLog.summary?.total || 0}</strong></p>
                    <p className="text-[10px] text-slate-400 mt-2">Observation : {previewLog.notes || "Séance conforme au programme pédagogique."}</p>
                  </div>
                  <div className="sm:text-right space-y-6">
                    <div>
                      <p className="font-black text-slate-900">Visa & Signature du Formateur</p>
                      <p className="text-[10px] text-slate-500 font-medium">{previewLog.teacherName}</p>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">Scellé électroniquement CFP-ITMC</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setIsSheetModalOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              Fermer
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleDownloadSingleSheetPDF}
                className="rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger PDF
              </Button>

              <Button
                onClick={handlePrintSingleSheet}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Printable Global Analytics Template */}
      <div className="hidden">
        <div ref={analyticsPrintRef} className="p-8 bg-white text-slate-900 font-sans max-w-[800px] mx-auto border border-slate-300">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">CFP-ITMC DOUALA - LOGPOM</h2>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                RAPPORT GLOBAL D'ASSIDUITÉ ET DE PRÉSENCE APPRENANTS
              </p>
              <p className="text-[9px] text-slate-500">Document Officiel de la Direction Pédagogique • Session {selectedYear}</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white font-black text-xs px-3 py-1 uppercase tracking-wider rounded">
                BILAN ACADÉMIQUE
              </span>
              <p className="text-xs font-mono font-bold text-blue-900 mt-1">Édition : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 rounded bg-slate-50 border border-slate-200 mb-6 text-center text-xs">
            <div>
              <p className="text-2xl font-black text-blue-900">{overallAttendanceRate}%</p>
              <p className="text-[9px] font-bold uppercase text-slate-500">Moyenne d'Assiduité</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{totalSessionsCount}</p>
              <p className="text-[9px] font-bold uppercase text-slate-500">Séances Dispensées</p>
            </div>
            <div>
              <p className="text-2xl font-black text-rose-600">{atRiskStudents.length}</p>
              <p className="text-[9px] font-bold uppercase text-slate-500">Élèves à Risque (&lt;75%)</p>
            </div>
          </div>

          <p className="font-black text-xs uppercase text-slate-700 mb-2">Bilan par Spécialité DQP :</p>
          <table className="w-full text-xs text-left border-collapse border border-slate-300 mb-6">
            <thead className="bg-slate-900 text-white uppercase text-[9px] font-black">
              <tr>
                <th className="p-2 border border-slate-700">Spécialité / Filière</th>
                <th className="p-2 border border-slate-700 text-center">Séances</th>
                <th className="p-2 border border-slate-700 text-right">Taux de Présence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {specialtyAnalytics.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2 border border-slate-300 font-bold">{item.specialty}</td>
                  <td className="p-2 border border-slate-300 text-center font-mono">{item.totalSessions}</td>
                  <td className="p-2 border border-slate-300 text-right font-black text-blue-900">{item.averageRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-8 border-t border-slate-300 flex justify-between text-xs font-bold">
            <span>Visa de l'Inspecteur Pédagogique</span>
            <span>Le Directeur Général CFP-ITMC</span>
          </div>
        </div>

        <div ref={staffPrintRef} className="p-8 bg-white text-slate-900 font-sans max-w-[800px] mx-auto border border-slate-300">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">CFP-ITMC DOUALA - LOGPOM</h2>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                FEUILLE OFFICIELLE DE POINTAGE ET D'ÉMARGEMENT DU PERSONNEL
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white font-black text-xs px-3 py-1 uppercase tracking-wider rounded">
                RELEVÉ DU PERSONNEL
              </span>
            </div>
          </div>

          <table className="w-full text-xs text-left border-collapse border border-slate-300 mb-6">
            <thead className="bg-slate-900 text-white uppercase text-[9px] font-black">
              <tr>
                <th className="p-2 border border-slate-700">Nom & Prénoms</th>
                <th className="p-2 border border-slate-700">Catégorie</th>
                <th className="p-2 border border-slate-700">Date & Horaires</th>
                <th className="p-2 border border-slate-700 text-center">Durée</th>
                <th className="p-2 border border-slate-700 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {filteredStaffLogs.map((r: any, idx: number) => (
                <tr key={idx}>
                  <td className="p-2 border border-slate-300 font-bold">{r.personName}</td>
                  <td className="p-2 border border-slate-300">{r.personRole === 'teacher' ? 'Formateur' : 'Secrétariat'}</td>
                  <td className="p-2 border border-slate-300">{r.date} ({r.checkIn} - {r.checkOut})</td>
                  <td className="p-2 border border-slate-300 text-center font-mono">{r.hoursWorked || 8}h</td>
                  <td className="p-2 border border-slate-300 text-center font-bold">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-8 border-t border-slate-300 flex justify-between text-xs font-bold">
            <span>Signature du Chef de Personnel</span>
            <span>Visa de la Direction Générale</span>
          </div>
        </div>
      </div>
    </div>
  );
}
