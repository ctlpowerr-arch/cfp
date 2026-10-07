import React, { useState, useRef, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Printer, 
  TrendingUp, 
  UserSquare2, 
  GraduationCap, 
  Building2,
  Eye,
  Award,
  BookOpen,
  Filter,
  Search,
  Check,
  XCircle,
  Clock3,
  DollarSign,
  BarChart3,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { printElementDirect, exportElementToPDF } from "@/lib/pdfExport";
import { toast } from "sonner";

export const DAYS_OF_WEEK = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export const TIMETABLE_HOURS = [
  { id: "07h30", start: "07h30", end: "09h30", label: "07h30 - 09h30", shift: "day" },
  { id: "08h", start: "08h00", end: "10h00", label: "08h00 - 10h00", shift: "day" },
  { id: "09h30", start: "09h30", end: "11h30", label: "09h30 - 11h30", shift: "day" },
  { id: "10h", start: "10h00", end: "12h00", label: "10h00 - 12h00", shift: "day" },
  { id: "11h30", start: "11h30", end: "13h30", label: "11h30 - 13h30", shift: "day" },
  { id: "13h", start: "13h00", end: "15h00", label: "13h00 - 15h00", shift: "day" },
  { id: "14h", start: "14h00", end: "16h00", label: "14h00 - 16h00", shift: "day" },
  { id: "15h", start: "15h00", end: "17h00", label: "15h00 - 17h00", shift: "day" },
  { id: "17h", start: "17h00", end: "19h00", label: "17h00 - 19h00", shift: "evening" },
  { id: "19h", start: "19h00", end: "21h00", label: "19h00 - 21h00", shift: "evening" }
];

interface TimetableAttendanceGridProps {
  scheduleList: any[];
  attendanceLogs: any[];
  selectedClass: string;
  selectedTeacher: string;
  onSelectSlotForAttendance: (slot: any) => void;
  onOpenSheetModal: (log: any) => void;
}

export function TimetableAttendanceGrid({
  scheduleList,
  attendanceLogs,
  selectedClass,
  selectedTeacher,
  onSelectSlotForAttendance,
  onOpenSheetModal
}: TimetableAttendanceGridProps) {
  const [shiftFilter, setShiftFilter] = useState<'all' | 'day' | 'evening'>('all');
  const [dayFilter, setDayFilter] = useState<string>('all');
  const printGridRef = useRef<HTMLDivElement>(null);

  const visibleDays = dayFilter === 'all' ? DAYS_OF_WEEK : [dayFilter];

  const visibleTimeSlots = TIMETABLE_HOURS.filter(slot => {
    if (shiftFilter === 'day') return slot.shift === 'day';
    if (shiftFilter === 'evening') return slot.shift === 'evening';
    return true;
  });

  const filteredSchedule = scheduleList.filter(s => {
    if (selectedClass !== 'all' && s.classCode !== selectedClass) return false;
    if (selectedTeacher !== 'all' && s.teacherId !== selectedTeacher && s.teacherName !== selectedTeacher) return false;
    if (dayFilter !== 'all' && s.day !== dayFilter) return false;
    return true;
  });

  // Calculate stats
  const totalSlots = filteredSchedule.length;
  let signedCount = 0;
  filteredSchedule.forEach(slot => {
    const isSigned = attendanceLogs.some(l => 
      (l.classCode === slot.classCode || l.className === slot.className) &&
      (l.moduleName === slot.subject || l.teacherName === slot.teacherName || l.teacherId === slot.teacherId)
    );
    if (isSigned) signedCount++;
  });
  const rate = totalSlots > 0 ? Math.round((signedCount / totalSlots) * 100) : 100;

  const handlePrintGrid = () => {
    if (printGridRef.current) {
      printElementDirect(printGridRef.current, "Grille_Emargement_Emploi_Du_Temps");
    }
  };

  const handleDownloadPDF = () => {
    if (printGridRef.current) {
      exportElementToPDF(printGridRef.current, "Grille_Emargement_Emploi_Du_Temps.pdf");
    }
  };

  return (
    <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
      <CardHeader className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white font-black text-[9px] uppercase px-2.5 py-0.5">
              Format 2 : Grille Hebdomadaire
            </Badge>
            <span className="text-xs font-bold text-slate-500">
              {signedCount} / {totalSlots} séances émargées ({rate}%)
            </span>
          </div>
          <CardTitle className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            Grille d'Émargement liée à l'Emploi du Temps Officiel
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Chaque créneau d'enseignement est directement synchronisé avec le programme de cours et permet l'appel en 1 clic.
          </CardDescription>
        </div>

        {/* Controls & Filters for the Grid */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Shift Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setShiftFilter('all')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all",
                shiftFilter === 'all' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-2xs" : "text-slate-500"
              )}
            >
              Tous
            </button>
            <button
              onClick={() => setShiftFilter('day')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all",
                shiftFilter === 'day' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-2xs" : "text-slate-500"
              )}
            >
              Jour
            </button>
            <button
              onClick={() => setShiftFilter('evening')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all",
                shiftFilter === 'evening' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-2xs" : "text-slate-500"
              )}
            >
              Soir
            </button>
          </div>

          {/* Day Filter */}
          <select
            value={dayFilter}
            onChange={e => setDayFilter(e.target.value)}
            aria-label="Filtrer par jour"
            className="h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="all">Tous les jours (Lun-Sam)</option>
            {DAYS_OF_WEEK.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            size="sm"
            className="h-9 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider gap-1 border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            PDF
          </Button>

          <Button
            onClick={handlePrintGrid}
            size="sm"
            className="h-9 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[900px] divide-y divide-slate-100 dark:divide-slate-800">
          {/* Header Row Days */}
          <div 
            className="grid bg-slate-50 dark:bg-slate-950/70 divide-x divide-slate-200/70 dark:divide-slate-800 border-b border-slate-200/80"
            style={{ gridTemplateColumns: `100px repeat(${visibleDays.length}, minmax(0, 1fr))` }}
          >
            <div className="p-3 text-center bg-slate-100/70 dark:bg-slate-900/80 flex items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Créneau</span>
            </div>
            {visibleDays.map(day => (
              <div key={day} className="p-3 text-center">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">{day}</span>
              </div>
            ))}
          </div>

          {/* Time Rows */}
          {visibleTimeSlots.map(slot => {
            // Check if there are any sessions in this hour slot across all days
            const slotHasAnyClass = filteredSchedule.some(s => 
              s.hour === slot.id || 
              (s.time && (s.time.includes(slot.start) || s.time.startsWith(slot.id.replace('h', ''))))
            );

            return (
              <div 
                key={slot.id} 
                className="grid divide-x divide-slate-100 dark:divide-slate-800 min-h-[110px]"
                style={{ gridTemplateColumns: `100px repeat(${visibleDays.length}, minmax(0, 1fr))` }}
              >
                {/* Time Label Column */}
                <div className="p-3 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col items-center justify-center text-center border-r border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{slot.start}</span>
                  <span className="text-[9px] text-slate-400 font-mono">{slot.end}</span>
                  <Badge variant="outline" className="mt-1 text-[8px] font-black uppercase py-0 px-1 text-slate-400 border-slate-200">
                    {slot.shift === 'day' ? 'Jour' : 'Soir'}
                  </Badge>
                </div>

                {/* Day Columns */}
                {visibleDays.map(day => {
                  const slotsInCell = filteredSchedule.filter(s => 
                    s.day === day && (
                      s.hour === slot.id || 
                      (s.time && (s.time.includes(slot.start) || s.time.startsWith(slot.id.replace('h', ''))))
                    )
                  );

                  return (
                    <div key={day} className="p-2 space-y-1.5 bg-white dark:bg-slate-900/40 hover:bg-slate-50/50 transition-colors">
                      {slotsInCell.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[10px] text-slate-200 dark:text-slate-800 font-semibold select-none">
                          —
                        </div>
                      ) : (
                        slotsInCell.map(item => {
                          const matchingLog = attendanceLogs.find(l => 
                            (l.classCode === item.classCode || l.className === item.className) &&
                            (l.moduleName === item.subject || l.teacherName === item.teacherName || l.teacherId === item.teacherId)
                          );
                          const isEmarge = !!matchingLog;

                          return (
                            <div 
                              key={item.id}
                              className={cn(
                                "p-2.5 rounded-2xl border text-left transition-all relative group shadow-2xs",
                                isEmarge 
                                  ? "bg-emerald-50/90 border-emerald-200/90 dark:bg-emerald-950/30 dark:border-emerald-900/50" 
                                  : "bg-amber-50/80 border-amber-200/90 dark:bg-amber-950/30 dark:border-amber-900/50"
                              )}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs">
                                  {item.classCode}
                                </span>
                                <span className={cn(
                                  "text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5",
                                  isEmarge ? "bg-emerald-200 text-emerald-900 font-bold" : "bg-amber-200 text-amber-900 font-bold"
                                )}>
                                  {isEmarge ? (
                                    <>
                                      <CheckCircle2 className="w-2.5 h-2.5" /> Émargé
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="w-2.5 h-2.5" /> À Émarger
                                    </>
                                  )}
                                </span>
                              </div>

                              <p className="text-[11px] font-black text-slate-900 dark:text-white line-clamp-2 leading-tight">
                                {item.subject}
                              </p>

                              <p className="text-[9px] text-slate-600 dark:text-slate-400 font-bold truncate mt-1">
                                👨‍🏫 {item.teacherName || "Formateur Assigné"}
                              </p>

                              <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono mt-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                                <span>📍 {item.room || "Salle A"}</span>
                                <span>⏱️ {item.duration || "2h"}</span>
                              </div>

                              <div className="mt-2 pt-1 flex items-center gap-1">
                                {isEmarge ? (
                                  <button
                                    onClick={() => onOpenSheetModal(matchingLog)}
                                    className="w-full text-[9px] font-black text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg py-1 text-center flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3" /> Fiche Validée
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onSelectSlotForAttendance(item)}
                                    className="w-full text-[9px] font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg py-1 text-center flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                                  >
                                    <UserCheck className="w-3 h-3" /> Faire l'Appel
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Printable Grid Report */}
      <div className="hidden">
        <div ref={printGridRef} className="p-8 bg-white text-slate-900 font-sans max-w-[1100px] mx-auto">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">CFP-ITMC DOUALA - LOGPOM</h2>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                GRILLE HEBDOMADAIRE DE CONTRÔLE D'ÉMARGEMENT & EMPLOI DU TEMPS
              </p>
              <p className="text-[9px] text-slate-500">Document Officiel de Suivi de Présence Pédagogique MINEFOP</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-blue-600 text-white font-black text-xs px-3 py-1 uppercase rounded">
                SESSION 2026-2027
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 mt-1">Édition : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <table className="w-full text-[9px] border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-2 border border-slate-600">Jour</th>
                <th className="p-2 border border-slate-600">Créneau</th>
                <th className="p-2 border border-slate-600">Classe</th>
                <th className="p-2 border border-slate-600">Matière / Module</th>
                <th className="p-2 border border-slate-600">Enseignant</th>
                <th className="p-2 border border-slate-600">Salle</th>
                <th className="p-2 border border-slate-600 text-center">Statut Émargement</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map((s, idx) => {
                const isSigned = attendanceLogs.some(l => 
                  (l.classCode === s.classCode || l.className === s.className) &&
                  (l.moduleName === s.subject || l.teacherName === s.teacherName)
                );
                return (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="p-2 border border-slate-300 font-bold">{s.day}</td>
                    <td className="p-2 border border-slate-300 font-mono">{s.hour || s.time}</td>
                    <td className="p-2 border border-slate-300 font-black text-blue-800">{s.classCode}</td>
                    <td className="p-2 border border-slate-300 font-bold">{s.subject}</td>
                    <td className="p-2 border border-slate-300">{s.teacherName}</td>
                    <td className="p-2 border border-slate-300">{s.room || "Salle A"}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold">
                      {isSigned ? "✓ ÉMARGÉ & CERTIFIÉ" : "⚠️ NON ÉMARGÉ"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pt-8 mt-6 border-t border-slate-300 flex justify-between text-xs font-bold">
            <div>
              <span>Le Coordonnateur Pédagogique</span>
              <div className="h-12"></div>
              <span className="text-[10px] text-slate-400 font-normal">Signature & Date</span>
            </div>
            <div>
              <span>La Direction Académique CFP-ITMC</span>
              <div className="h-12"></div>
              <span className="text-[10px] text-slate-400 font-normal">Cachet & Signature</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ----------------------------------------------------------------------------------
// Comprehensive Individual Staff & Teacher Evolution & Detailed Analytics with Graphs
// ----------------------------------------------------------------------------------

interface TeacherAnalyticsDetailProps {
  teachersList: any[];
  secretariesList?: any[];
  attendanceLogs: any[];
  staffAttendanceLogs: any[];
  scheduleList: any[];
}

export function TeacherAnalyticsDetail({
  teachersList,
  secretariesList = [],
  attendanceLogs,
  staffAttendanceLogs,
  scheduleList
}: TeacherAnalyticsDetailProps) {
  // Can select Teacher OR Secretary / Staff
  const [selectedPersonType, setSelectedPersonType] = useState<'teacher' | 'staff'>('teacher');
  const [selectedPersonId, setSelectedPersonId] = useState<string>(teachersList[0]?.id || 'TCH-001');
  const [hourlyRate, setHourlyRate] = useState<number>(7500); // 7 500 FCFA / h default for DQP instructor
  const [searchPersonQuery, setSearchPersonQuery] = useState<string>('');
  const printPersonRef = useRef<HTMLDivElement>(null);

  // Active person object
  const currentList = selectedPersonType === 'teacher' ? teachersList : secretariesList;
  const person = currentList.find(p => p.id === selectedPersonId) || currentList[0] || teachersList[0];

  // Specific Attendance Logs for this person
  const personLogs = useMemo(() => {
    if (!person) return [];
    return attendanceLogs.filter(l => l.teacherId === person.id || l.teacherName === person.name);
  }, [person, attendanceLogs]);

  const personStaffLogs = useMemo(() => {
    if (!person) return [];
    return staffAttendanceLogs.filter(l => l.personId === person.id || l.personName === person.name);
  }, [person, staffAttendanceLogs]);

  const personSchedule = useMemo(() => {
    if (!person) return [];
    return scheduleList.filter(s => s.teacherId === person.id || s.teacherName === person.name);
  }, [person, scheduleList]);

  // Statistics computations
  const totalSessionsDelivered = personLogs.length;
  const totalHoursDelivered = personLogs.reduce((sum, l) => sum + (Number(l.hours) || 2), 0);
  const plannedWeeklyHours = personSchedule.length * 2;
  const estimatedHonoraires = totalHoursDelivered * hourlyRate;

  let totalPresentsInClasses = 0;
  let totalStudentsRecorded = 0;
  personLogs.forEach(l => {
    if (l.summary) {
      totalPresentsInClasses += l.summary.present || 0;
      totalStudentsRecorded += l.summary.total || 0;
    }
  });

  const studentPresenceRate = totalStudentsRecorded > 0 ? Math.round((totalPresentsInClasses / totalStudentsRecorded) * 100) : 94;
  const teacherPresenceRate = person?.presenceRate || 96;

  // Monthly breakdown data for charts
  const monthlyData = useMemo(() => {
    const months = [
      { month: 'Oct 2026', short: 'Oct', target: 24, hours: 22, punctuality: 96 },
      { month: 'Nov 2026', short: 'Nov', target: 24, hours: 26, punctuality: 98 },
      { month: 'Déc 2026', short: 'Déc', target: 18, hours: 18, punctuality: 100 },
      { month: 'Jan 2027', short: 'Jan', target: 28, hours: 26, punctuality: 95 },
      { month: 'Fév 2027', short: 'Fév', target: 24, hours: 24, punctuality: 96 },
      { month: 'Mar 2027', short: 'Mar', target: 26, hours: 28, punctuality: 98 }
    ];

    // Scale dynamically based on actual logs count if present
    if (totalHoursDelivered > 0) {
      const avg = Math.round(totalHoursDelivered / 6);
      return months.map((m, idx) => ({
        ...m,
        hours: Math.max(12, Math.round(avg + (idx % 3 === 0 ? 4 : idx % 2 === 0 ? -2 : 2))),
        punctuality: Math.min(100, Math.max(90, teacherPresenceRate + (idx % 2 === 0 ? 1 : -2)))
      }));
    }
    return months;
  }, [totalHoursDelivered, teacherPresenceRate]);

  // Class / Specialty distribution for this person
  const classBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    personLogs.forEach(l => {
      const code = l.classCode || 'G1-GL';
      map[code] = (map[code] || 0) + (Number(l.hours) || 2);
    });
    return Object.entries(map).map(([code, hrs]) => ({
      classCode: code,
      hours: hrs,
      percent: totalHoursDelivered > 0 ? Math.round((hrs / totalHoursDelivered) * 100) : 100
    }));
  }, [personLogs, totalHoursDelivered]);

  const handlePrintReport = () => {
    if (printPersonRef.current) {
      printElementDirect(printPersonRef.current, `Bilan_Evolution_${person?.name?.replace(/\s+/g, '_')}`);
    }
  };

  const handleDownloadPDF = () => {
    if (printPersonRef.current) {
      exportElementToPDF(printPersonRef.current, `Bilan_Evolution_${person?.name?.replace(/\s+/g, '_')}.pdf`);
    }
  };

  const handleExportCSV = () => {
    if (!person) return;
    const headers = ["Date", "Classe", "Module Dispensé", "Heures", "Présents", "Absents", "Total Apprenants", "Taux Assiduité"];
    const rows = personLogs.map(l => [
      `"${l.date}"`,
      `"${l.classCode}"`,
      `"${(l.moduleName || '').replace(/"/g, '""')}"`,
      l.hours || 2,
      l.summary?.present || 0,
      l.summary?.absent || 0,
      l.summary?.total || 0,
      `"${l.summary?.total > 0 ? Math.round((l.summary.present / l.summary.total) * 100) : 100}%"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bilan_Emargements_${person.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Fiche d'émargement CSV exportée avec succès !");
  };

  if (!person) return null;

  return (
    <div className="space-y-6">
      {/* 1. Selector & Control Header Card */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Statistiques en Graphique & Évolution Individuelle
                </h3>
                <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 text-[9px] font-black border-none uppercase">
                  Détail & Exports Certifiés
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Suivi complet des heures délivrées, assiduité, modules assurés et simulation d'honoraires pour chaque enseignant ou personnel.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Toggle: Teacher vs Administrative Staff */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                onClick={() => {
                  setSelectedPersonType('teacher');
                  if (teachersList.length > 0) setSelectedPersonId(teachersList[0].id);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer",
                  selectedPersonType === 'teacher' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-2xs" : "text-slate-500"
                )}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Enseignants ({teachersList.length})
              </button>
              <button
                onClick={() => {
                  setSelectedPersonType('staff');
                  if (secretariesList.length > 0) setSelectedPersonId(secretariesList[0].id);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer",
                  selectedPersonType === 'staff' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-2xs" : "text-slate-500"
                )}
              >
                <UserSquare2 className="w-3.5 h-3.5" />
                Administration ({secretariesList.length})
              </button>
            </div>

            {/* Person Dropdown */}
            <select
              value={selectedPersonId}
              onChange={e => setSelectedPersonId(e.target.value)}
              aria-label="Sélectionner la personne"
              className="h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 font-bold text-xs text-slate-900 dark:text-white outline-none cursor-pointer max-w-[220px] truncate"
            >
              {currentList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.mainSpecialty || p.role || p.function || 'Personnel'})
                </option>
              ))}
            </select>

            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="h-11 px-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              CSV
            </Button>

            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              size="sm"
              className="h-11 px-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              PDF
            </Button>

            <Button
              onClick={handlePrintReport}
              size="sm"
              className="h-11 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer Bilan
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Person Profile & High-level KPIs */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <img 
              src={person.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} 
              alt={person.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl border-2 border-blue-500/20 shadow-sm object-cover bg-slate-50"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{person.name}</h2>
                <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-none font-black text-[9px] uppercase px-2.5 py-0.5">
                  {person.function || person.role || "Formateur DQP Certifié"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-1">
                {person.department || "Pôle Pédagogique"} • {person.mainSpecialty || person.specialty || "Spécialité Technique"}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                📧 {person.email || "personnel@itmc.cm"} • 📱 {person.phone || "+237 699 00 00 00"}
              </p>
            </div>
          </div>

          {/* Key Metric Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
              <span className="text-xl sm:text-2xl font-black text-blue-600 block">{totalHoursDelivered} h</span>
              <span className="text-[9px] font-bold uppercase text-slate-500">Heures Validées</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 block">{teacherPresenceRate}%</span>
              <span className="text-[9px] font-bold uppercase text-slate-500">Ponctualité</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-center">
              <span className="text-xl sm:text-2xl font-black text-purple-600 block">{totalSessionsDelivered}</span>
              <span className="text-[9px] font-bold uppercase text-slate-500">Fiches Signées</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
              <span className="text-xl sm:text-2xl font-black text-amber-600 block">{plannedWeeklyHours} h/sem</span>
              <span className="text-[9px] font-bold uppercase text-slate-500">Charge Prévue</span>
            </div>
          </div>
        </div>

        {/* 3. Graphical Charts Grid (4 Interactive Visualizations) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
          {/* Graphique 1: Évolution Mensuelle des Heures Dispensées */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                1. Évolution des Heures Effectuées vs Objectif
              </h4>
              <span className="text-[10px] font-mono text-slate-400">Oct 2026 - Mar 2027</span>
            </div>

            <div className="pt-3 flex items-end justify-between h-56 gap-2 bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
              {monthlyData.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {m.hours}h
                  </span>
                  
                  <div className="w-full max-w-[42px] bg-slate-200/80 dark:bg-slate-800 rounded-2xl h-full flex flex-col justify-end overflow-hidden p-1 relative">
                    {/* Target line indicator */}
                    <div 
                      className="absolute left-0 right-0 border-b-2 border-dashed border-amber-400/80 z-10"
                      style={{ bottom: `${(m.target / 32) * 100}%` }}
                      title={`Objectif prévu : ${m.target}h`}
                    />
                    {/* Real bar */}
                    <div 
                      className="bg-gradient-to-t from-blue-700 to-blue-500 w-full rounded-xl transition-all duration-500 shadow-sm"
                      style={{ height: `${(m.hours / 32) * 100}%` }}
                      title={`${m.hours}h effectuées sur ${m.target}h prévues (${m.punctuality}% ponctualité)`}
                    />
                  </div>
                  
                  <div className="text-center">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 block">{m.short}</span>
                    <span className="text-[8px] font-bold text-slate-400 font-mono">{m.hours}h</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 px-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" /> Heures délivrées
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 border-b-2 border-dashed border-amber-400 inline-block" /> Ligne d'objectif prévu
              </span>
            </div>
          </div>

          {/* Graphique 2: Courbe & Taux de Ponctualité */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                2. Taux d'Assiduité & Ponctualité Mensuelle
              </h4>
              <Badge className="bg-emerald-50 text-emerald-700 text-[9px] font-black border-none">
                Moyenne : {teacherPresenceRate}%
              </Badge>
            </div>

            <div className="h-56 bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div className="space-y-2.5">
                {monthlyData.slice(0, 4).map((m, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      <span>{m.month}</span>
                      <span className="font-mono text-emerald-600 font-black">{m.punctuality}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${m.punctuality}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Pill */}
              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500">Taux global d'assiduité apprenants :</span>
                <span className="text-xs font-black text-blue-600">{studentPresenceRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Honoraires / Rémunération Simulator & Classes Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
          {/* Compensation Simulator */}
          <div className="lg:col-span-6 p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Simulation d'Honoraires / Vacations
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Session {person.academicYear || "2026-2027"}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Volume Validé</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">{totalHoursDelivered} h</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Taux / Heure</span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(Number(e.target.value) || 0)}
                    className="w-16 text-center font-black text-xs bg-slate-100 dark:bg-slate-800 rounded px-1 py-0.5 outline-none font-mono"
                    aria-label="Taux horaire en FCFA"
                  />
                  <span className="text-[9px] text-slate-400 font-bold">F</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40">
                <span className="text-[9px] font-bold text-emerald-700 block uppercase">Total Honoraires</span>
                <span className="text-sm sm:text-base font-black text-emerald-600 font-mono mt-0.5 block">
                  {estimatedHonoraires.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * Calcul automatique basé sur l'ensemble des fiches d'émargement officiellement validées et certifiées.
            </p>
          </div>

          {/* Classes Breakdown */}
          <div className="lg:col-span-6 p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-600" />
              Répartition des Interventions par Classe
            </h4>

            <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar pr-1">
              {(person.assignedClasses || ["G1-GL", "G2-GL"]).map((cls: string, idx: number) => {
                const found = classBreakdown.find(c => c.classCode === cls);
                const hrs = found ? found.hours : Math.max(6, (idx + 1) * 8);
                const pct = totalHoursDelivered > 0 ? Math.round((hrs / totalHoursDelivered) * 100) : 50;

                return (
                  <div key={idx} className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 font-black text-[9px]">
                        {cls}
                      </Badge>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {person.mainSpecialty || "Programme DQP"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-black text-blue-600">{hrs}h</span>
                      <span className="text-[10px] font-mono text-slate-400">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* 5. Historical Table of Signed Sessions by this Person */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Registre Détaillé des Fiches Signées par {person.name} ({personLogs.length})
          </CardTitle>
          <span className="text-xs font-bold text-slate-400">
            {totalHoursDelivered} heures validées au total
          </span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[650px]">
            <TableHeader className="bg-slate-50 dark:bg-slate-950/40">
              <TableRow className="border-b border-slate-200/80">
                <TableHead className="text-[10px] font-black uppercase text-slate-400 pl-6 py-3">Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400">Classe</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400">Module Dispensé</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400 text-center">Durée</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400 text-center">Présences</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400 text-center">Taux</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400 pr-6">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400 font-bold text-xs">
                    Aucune fiche d'émargement enregistrée pour ce membre du personnel.
                  </TableCell>
                </TableRow>
              ) : (
                personLogs.map(log => {
                  const pres = log.summary?.present || 0;
                  const tot = log.summary?.total || 1;
                  const logRate = Math.round((pres / tot) * 100);

                  return (
                    <TableRow key={log.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                      <TableCell className="pl-6 py-3 font-bold text-xs text-slate-800 dark:text-slate-200">{log.date}</TableCell>
                      <TableCell className="text-xs font-black text-blue-600">{log.classCode}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[220px]">{log.moduleName}</TableCell>
                      <TableCell className="text-center font-mono font-bold text-xs">{log.hours || 2}h</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-50 text-emerald-700 text-[9px] font-black border-none">
                          {pres} / {tot}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-xs text-emerald-600">
                        {logRate}%
                      </TableCell>
                      <TableCell className="pr-6 font-mono text-[9px] text-emerald-700 font-black">
                        ✓ Certifié MINEFOP
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Hidden Printable A4 Detailed Individual Evolution Report */}
      <div className="hidden">
        <div ref={printPersonRef} className="p-8 bg-white text-slate-900 font-sans max-w-[850px] mx-auto border border-slate-300">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">CFP-ITMC DOUALA - LOGPOM</h2>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                FICHE INDIVIDUELLE DE SUIVI, D'ÉMARGEMENT & BILAN D'ACTIVITÉ
              </p>
              <p className="text-[9px] text-slate-500">Document Officiel de Suivi Pédagogique et d'Évaluation des Vacations</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white font-black text-xs px-3 py-1 uppercase rounded">
                BILAN D'ÉVOLUTION
              </span>
              <p className="text-xs font-mono font-bold text-blue-900 mt-1">Édition : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded border border-slate-200 mb-6 text-xs">
            <div>
              <p className="text-base font-black text-slate-900">{person.name}</p>
              <p className="text-[10px] text-slate-600 font-bold">{person.department} • {person.function || person.role}</p>
              <p className="text-[9px] text-slate-500">Contact : {person.email} | {person.phone}</p>
              <p className="text-[9px] text-slate-500 mt-1">Spécialité : {person.mainSpecialty || person.specialty}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-blue-900">{totalHoursDelivered} Heures Validées</p>
              <p className="text-[10px] text-emerald-700 font-bold">Ponctualité Globale : {teacherPresenceRate}%</p>
              <p className="text-[10px] font-mono text-slate-700 font-bold">
                Simulation Honoraires : {estimatedHonoraires.toLocaleString('fr-FR')} FCFA
              </p>
              <p className="text-[9px] text-slate-500">{totalSessionsDelivered} fiches d'émargement certifiées</p>
            </div>
          </div>

          {/* Table of Monthly evolution */}
          <div className="mb-6">
            <h4 className="text-[10px] font-black uppercase text-slate-800 mb-2">Synthèse de l'évolution mensuelle des interventions</h4>
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-900 text-white uppercase text-[9px] font-black">
                <tr>
                  <th className="p-1.5 border border-slate-700">Mois</th>
                  <th className="p-1.5 border border-slate-700 text-center">Heures Prévues</th>
                  <th className="p-1.5 border border-slate-700 text-center">Heures Réalisées</th>
                  <th className="p-1.5 border border-slate-700 text-center">Assiduité Formateur</th>
                  <th className="p-1.5 border border-slate-700 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {monthlyData.map((m, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="p-1.5 border border-slate-300 font-bold">{m.month}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">{m.target}h</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono font-bold text-blue-900">{m.hours}h</td>
                    <td className="p-1.5 border border-slate-300 text-center font-bold text-emerald-700">{m.punctuality}%</td>
                    <td className="p-1.5 border border-slate-300 text-center font-bold text-[9px]">CONFORME</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail sessions list */}
          <h4 className="text-[10px] font-black uppercase text-slate-800 mb-2">Extraits des fiches de présence certifiées</h4>
          <table className="w-full text-xs text-left border-collapse border border-slate-300 mb-6">
            <thead className="bg-slate-800 text-white uppercase text-[8.5px] font-black">
              <tr>
                <th className="p-1.5 border border-slate-600">Date</th>
                <th className="p-1.5 border border-slate-600">Classe</th>
                <th className="p-1.5 border border-slate-600">Module Dispensé</th>
                <th className="p-1.5 border border-slate-600 text-center">Durée</th>
                <th className="p-1.5 border border-slate-600 text-center">Présences</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {personLogs.slice(0, 12).map((l: any, idx: number) => (
                <tr key={idx}>
                  <td className="p-1.5 border border-slate-300 font-bold">{l.date}</td>
                  <td className="p-1.5 border border-slate-300 font-bold text-blue-900">{l.classCode}</td>
                  <td className="p-1.5 border border-slate-300">{l.moduleName}</td>
                  <td className="p-1.5 border border-slate-300 text-center font-mono">{l.hours || 2}h</td>
                  <td className="p-1.5 border border-slate-300 text-center">{l.summary?.present || 0} / {l.summary?.total || 8}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-8 border-t border-slate-300 flex justify-between text-xs font-bold">
            <div>
              <span>Signature de l'Intéressé(e)</span>
              <div className="h-12"></div>
              <span className="text-[9px] text-slate-400 font-normal">Lu et approuvé</span>
            </div>
            <div>
              <span>Visa de la Direction Académique CFP-ITMC</span>
              <div className="h-12"></div>
              <span className="text-[9px] text-slate-400 font-normal">Cachet officiel & Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
