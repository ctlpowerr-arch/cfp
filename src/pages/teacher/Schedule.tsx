import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Users, 
  Zap,
  Trash2,
  Edit3,
  X,
  UserCheck,
  ShieldAlert,
  Sparkles,
  Printer,
  Filter,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import RollCallModal from '@/components/teacher/RollCallModal';

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const ALL_HOURS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 7;
  return h < 10 ? `0${h}h` : `${h}h`;
});

const EVALUATION_TYPES = ['Cours', 'TD', 'TP', 'Examen', 'Composition', 'Rattrapage'];

// Printable PDF report generator for teacher
function printTeacherSchedulePDF(
  events: any[],
  teacherName: string,
  teacherDepartment: string,
  filterSummary: string = ""
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error("Veuillez autoriser les fenêtres surgissantes pour exporter le PDF.");
    return;
  }

  const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const sortedEvents = [...events].sort((a, b) => {
    const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return parseInt(a.hour || '0', 10) - parseInt(b.hour || '0', 10);
  });

  const rowsHtml = sortedEvents.map((evt, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e293b;">${evt.day}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #2563eb;">${evt.hour} (${evt.duration || '2h'})</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${evt.subject}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: ${
          evt.type === 'Examen' ? '#fee2e2; color: #991b1b;' :
          evt.type === 'Composition' ? '#fef3c7; color: #92400e;' :
          evt.type === 'Rattrapage' ? '#f3e8ff; color: #6b21a8;' :
          evt.type === 'TD' ? '#d1fae5; color: #065f46;' :
          '#dbeafe; color: #1e40af;'
        }">${evt.type || 'Cours'}</span>
      </td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${evt.classCode} (${evt.className || ''})</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #0369a1;">${evt.room || 'Salle A'}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>EMPLOI_DU_TEMPS_${teacherName.replace(/\s+/g, '_')}</title>
      <style>
        @page { size: A4 landscape; margin: 0mm; }
        *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; margin: 0; padding: 10mm 12mm; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; }
        .logo-box { font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
        .logo-sub { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
        .doc-title { text-align: center; margin: 12px 0; }
        .doc-title h1 { font-size: 16px; font-weight: 900; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
        .doc-title p { font-size: 11px; color: #2563eb; font-weight: bold; margin-top: 3px; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 10px; }
        th { background: #0f172a; color: #ffffff; text-align: left; padding: 7px 9px; border: 1px solid #0f172a; text-transform: uppercase; font-size: 8.5px; letter-spacing: 0.5px; }
        .footer-signatures { display: flex; justify-content: space-between; margin-top: 25px; padding-top: 12px; border-top: 1px dashed #cbd5e1; }
        .sig-box { width: 220px; text-align: center; }
        .sig-title { font-size: 9px; font-weight: bold; color: #475569; text-transform: uppercase; }
        .sig-space { height: 45px; }
        .watermark-bg {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 320px;
          max-width: 60%;
          opacity: 0.06;
          pointer-events: none;
          z-index: -1;
        }
      </style>
    </head>
    <body>
      <img src="/watermark-logo.png" class="watermark-bg" alt="" />
      <div class="header">
        <div>
          <div class="logo-box">CFP-ITMC</div>
          <div class="logo-sub">Planning &amp; Enseignements</div>
        </div>
        <div style="text-align: right; font-size: 9.5px; font-weight: bold; color: #475569;">
          <div>Professeur : <strong>${teacherName}</strong></div>
          <div>Département : ${teacherDepartment}</div>
          <div>Année Académique : 2026 - 2027</div>
        </div>
      </div>

      <div class="doc-title">
        <h1>EMPLOI DU TEMPS INDIVIDUEL ET PROGRAMME DES COURS</h1>
        <p>${filterSummary || "Planning complet de l'enseignant"}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Jour</th>
            <th>Heure / Durée</th>
            <th>Matière / Évaluation</th>
            <th>Type</th>
            <th>Classe / Filière</th>
            <th>Salle / Amphi</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="6" style="text-align:center; padding:25px; font-weight:bold; color:#64748b;">Aucune séance dans votre emploi du temps pour ces critères.</td></tr>'}
        </tbody>
      </table>

      <div class="footer-signatures">
        <div class="sig-box">
          <div class="sig-title">L'Enseignant</div>
          <div style="font-size: 11px; font-weight: bold; margin-top: 10px;">${teacherName}</div>
          <div class="sig-space"></div>
        </div>
        <div class="sig-box">
          <div class="sig-title">La Direction des Études</div>
          <div class="sig-space"></div>
          <div style="font-size: 9px; color: #94a3b8;">Signature &amp; Cachet</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export default function TeacherSchedule() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; hour: string } | null>(null);
  const [rollCallSession, setRollCallSession] = useState<any | null>(null);
  
  // Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all'); // 'all' | 'day' | 'evening'

  // Visible Hours based on Shift Filter
  const visibleHours = ALL_HOURS.filter(hour => {
    const hNum = parseInt(hour, 10);
    if (selectedShift === 'day') {
      return hNum >= 7 && hNum <= 16; // Cours du Jour (07h30 - 16h30)
    }
    if (selectedShift === 'evening') {
      return hNum >= 17 && hNum <= 22; // Cours du Soir (17h00 - 22h00)
    }
    return true; // Tous les créneaux (07h - 22h)
  });

  const [activeViewMode, setActiveViewMode] = useState<'agenda' | 'grid'>('agenda');
  const [selectedMobileDay, setSelectedMobileDay] = useState<string>('Lundi');

  const [formData, setFormData] = useState({
    subject: '',
    room: '',
    classCode: 'G1-GL',
    type: 'Cours',
    duration: '2h',
    day: 'Lundi',
    hour: '08h'
  });

  // Load Teacher Info & Schedule
  useEffect(() => {
    const storedTeacher = localStorage.getItem('teacherData');
    if (storedTeacher) {
      try {
        setTeacher(JSON.parse(storedTeacher));
      } catch (e) {
        console.error("Error parsing teacherData", e);
      }
    } else {
      // Default Demo Teacher
      setTeacher({
        id: "demo_teacher",
        name: "Dr. Alex Vance",
        email: "demo@itmc-it.cm",
        function: "Enseignant-Chercheur Principal",
        department: "Génie Informatique & Systèmes",
        assignedClasses: [
          { classCode: "G1-GL", className: "G1 - Génie Logiciel", room: "Labo Info 1", subject: "Algorithmique & Algèbre" },
          { classCode: "R1-RCS", className: "R1 - Réseaux & Sécurité", room: "Labo Réseaux", subject: "Architecture des Réseaux" }
        ]
      });
    }
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/schedule');
      const data = await res.json();
      
      // Filter strictly for THIS logged-in teacher ONLY
      if (teacher) {
        const mySchedule = data.filter((item: any) => {
          const matchId = teacher.id && item.teacherId === teacher.id;
          const matchEmail = teacher.email && item.teacherEmail?.toLowerCase() === teacher.email.toLowerCase();
          const matchName = teacher.name && item.teacherName?.toLowerCase() === teacher.name.toLowerCase();
          return matchId || matchEmail || matchName;
        });
        setSchedule(mySchedule);
      } else {
        setSchedule(data);
      }
    } catch (err) {
      toast.error("Erreur de chargement du planning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacher) {
      fetchSchedule();
    }
  }, [teacher]);

  // Filtered Schedule
  const filteredSchedule = schedule.filter((item) => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesClass = selectedClass === 'all' || item.classCode === selectedClass;

    const hNum = parseInt(item.hour || '0', 10);
    const matchesShift = selectedShift === 'all' ||
      (selectedShift === 'day' && hNum >= 7 && hNum <= 16) ||
      (selectedShift === 'evening' && hNum >= 17 && hNum <= 22);

    return matchesType && matchesClass && matchesShift;
  });

  const openAddModal = (day = 'Lundi', hour = '08h') => {
    setEditingSession(null);
    setSelectedSlot({ day, hour });
    const defaultClass = teacher?.assignedClasses?.[0];
    setFormData({
      subject: defaultClass?.subject || '',
      room: defaultClass?.room || 'Salle A',
      classCode: defaultClass?.classCode || 'G1-GL',
      type: 'Cours',
      duration: '2h',
      day,
      hour
    });
    setIsModalOpen(true);
  };

  const openEditModal = (session: any) => {
    setEditingSession(session);
    setSelectedSlot({ day: session.day || 'Lundi', hour: session.hour || '08h' });
    setFormData({
      subject: session.subject || '',
      room: session.room || '',
      classCode: session.classCode || teacher?.assignedClasses?.[0]?.classCode || 'G1-GL',
      type: session.type || 'Cours',
      duration: session.duration || '2h',
      day: session.day || 'Lundi',
      hour: session.hour || '08h'
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    try {
      const selectedClassObj = teacher.assignedClasses?.find((c: any) => c.classCode === formData.classCode);

      const payload = {
        teacherId: teacher.id || 'demo_teacher',
        teacherName: teacher.name || 'Enseignant',
        teacherEmail: teacher.email || 'teacher@itmc-it.cm',
        classCode: formData.classCode,
        className: selectedClassObj?.className || formData.classCode,
        subject: formData.subject,
        room: formData.room,
        day: formData.day,
        hour: formData.hour,
        duration: formData.duration,
        type: formData.type,
        academicYear: "2026-2027"
      };

      let res;
      if (editingSession) {
        res = await fetch(`/api/schedule/${editingSession.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        toast.success(editingSession ? "Séance modifiée avec succès !" : "Cours ajouté à votre emploi du temps !");
        setIsModalOpen(false);
        fetchSchedule();
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch (err) {
      toast.error("Erreur lors de la programmation");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette séance de votre planning ?")) return;

    try {
      const res = await fetch(`/api/schedule/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Séance retirée de votre planning");
        fetchSchedule();
      } else {
        toast.error("Erreur de suppression");
      }
    } catch (err) {
      toast.error("Erreur de suppression");
    }
  };

  const getEventsForDayAndHour = (day: string, hour: string) => {
    return filteredSchedule.filter(e => {
      if (e.day !== day) return false;
      const eHourNum = parseInt(e.hour, 10);
      const slotHourNum = parseInt(hour, 10);
      return eHourNum === slotHourNum;
    });
  };

  const handlePrint = () => {
    let summary = `Filtres actifs : `;
    if (selectedClass !== 'all') summary += `Classe ${selectedClass} • `;
    if (selectedType !== 'all') summary += `Type : ${selectedType}`;
    else summary += `Tous les cours & évaluations`;

    printTeacherSchedulePDF(
      filteredSchedule,
      teacher?.name || "Enseignant",
      teacher?.department || "Génie Informatique",
      summary
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight break-words">
              Mon Emploi du Temps
            </h2>
          </div>
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Professeur : <span className="text-blue-600 font-extrabold">{teacher?.name || 'Inconnu'}</span> ({teacher?.department || 'Génie Informatique'})
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <Button 
            onClick={handlePrint}
            variant="outline"
            className="flex-1 md:flex-none h-11 sm:h-12 px-3 sm:px-5 rounded-2xl font-black text-xs uppercase tracking-wider border-slate-200 dark:border-slate-800 cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4 mr-1.5 sm:mr-2 text-blue-600" /> Imprimer / PDF
          </Button>

          <Button 
            onClick={() => openAddModal(selectedMobileDay !== 'Tous' ? selectedMobileDay : 'Lundi', '08h')}
            className="flex-1 md:flex-none h-11 sm:h-12 px-4 sm:px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> Programmer
          </Button>
        </div>
      </div>

      {/* Security Privacy & Filter Notice */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <UserCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-xs">
              Filtres d'affichage du planning :
            </p>
          </div>

          {/* Mode Switcher: Mobile Agenda vs Weekly Grid */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setActiveViewMode('agenda')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1",
                activeViewMode === 'agenda' 
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              📱 Vue Jour / Agenda
            </button>
            <button
              onClick={() => setActiveViewMode('grid')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1",
                activeViewMode === 'grid' 
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              🗓️ Grille Semaine
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Filter by Shift / Période (Jour / Soir) */}
          <ModernSelect 
            dropdownTitle="Filtrer par Créneau"
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="h-10 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 font-bold text-xs text-amber-900 dark:text-amber-200 outline-none cursor-pointer w-full"
          >
            <option value="all">🌐 Tous les créneaux (07h - 22h)</option>
            <option value="day">☀️ Cours du Jour (07h30 - 16h30)</option>
            <option value="evening">🌙 Cours du Soir (17h00 - 22h00)</option>
          </ModernSelect>

          {/* Filter by Type */}
          <ModernSelect 
            dropdownTitle="Filtrer par Type de Séance"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-xs text-blue-600 outline-none cursor-pointer w-full"
          >
            <option value="all">📝 Toutes les évaluations / types</option>
            {EVALUATION_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </ModernSelect>

          {/* Filter by Assigned Class */}
          <ModernSelect 
            dropdownTitle="Filtrer par Classe"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer w-full"
          >
            <option value="all">🎓 Toutes mes classes</option>
            {teacher?.assignedClasses?.map((ac: any, idx: number) => {
              const code = typeof ac === 'string' ? ac : (ac.classCode || ac.code || ac.className || 'G1-GL');
              return (
                <option key={idx} value={code}>🎓 {code}</option>
              );
            })}
          </ModernSelect>
        </div>
      </div>

      {/* VIEW MODE 1: AGENDA / DAY-BY-DAY LIST VIEW (MOBILE FRIENDLY) */}
      {activeViewMode === 'agenda' && (
        <div className="space-y-4">
          {/* Horizontal Scrollable Day Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
            <button
              onClick={() => setSelectedMobileDay('Tous')}
              className={cn(
                "px-4 py-2.5 rounded-2xl font-black text-xs tracking-wider uppercase whitespace-nowrap shrink-0 transition-all cursor-pointer border",
                selectedMobileDay === 'Tous'
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              )}
            >
              📅 Toute la Semaine
            </button>
            {days.map(d => (
              <button
                key={d}
                onClick={() => setSelectedMobileDay(d)}
                className={cn(
                  "px-4 py-2.5 rounded-2xl font-black text-xs tracking-wider uppercase whitespace-nowrap shrink-0 transition-all cursor-pointer border",
                  selectedMobileDay === d
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                )}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Sessions Agenda List */}
          <div className="space-y-3">
            {(() => {
              const displayEvents = filteredSchedule.filter(e => 
                selectedMobileDay === 'Tous' || e.day === selectedMobileDay
              );

              if (displayEvents.length === 0) {
                return (
                  <Card className="p-8 text-center bg-white dark:bg-slate-900 border-none shadow-sm rounded-3xl">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto mb-3">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      Aucun cours ni examen programmé
                    </p>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      {selectedMobileDay !== 'Tous' ? `Aucune séance pour le jour : ${selectedMobileDay}` : 'Votre emploi du temps est vide pour ces filtres.'}
                    </p>
                    <Button 
                      onClick={() => openAddModal(selectedMobileDay !== 'Tous' ? selectedMobileDay : 'Lundi', '08h')}
                      className="mt-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase px-5 h-11"
                    >
                      + Programmer un cours
                    </Button>
                  </Card>
                );
              }

              // Group by day if 'Tous', or just list chronologically
              const dayGroups = selectedMobileDay === 'Tous' ? days : [selectedMobileDay];

              return dayGroups.map(dayName => {
                const dayEvts = displayEvents
                  .filter(e => e.day === dayName)
                  .sort((a, b) => parseInt(a.hour || '0', 10) - parseInt(b.hour || '0', 10));

                if (dayEvts.length === 0) return null;

                return (
                  <div key={dayName} className="space-y-2">
                    <div className="flex items-center gap-2 pt-2">
                      <Badge className="bg-slate-900 text-white font-black text-[10px] uppercase px-3 py-1 rounded-xl">
                        {dayName}
                      </Badge>
                      <span className="text-xs font-bold text-slate-400">({dayEvts.length} séance(s))</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dayEvts.map(event => (
                        <Card 
                          key={event.id}
                          className={cn(
                            "p-4 rounded-3xl border shadow-sm relative transition-all",
                            event.type === 'Cours' ? "bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 border-blue-200 dark:border-blue-900" :
                            event.type === 'Examen' ? "bg-red-50/70 dark:bg-red-950/40 text-red-950 dark:text-red-100 border-red-200 dark:border-red-900" :
                            event.type === 'TD' ? "bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 border-emerald-200 dark:border-emerald-900" :
                            "bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 border-amber-200 dark:border-amber-900"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge className="bg-white dark:bg-black/40 text-slate-900 dark:text-white font-black text-[10px] uppercase px-2.5 py-0.5 border-none">
                                🕒 {event.hour} ({event.duration || '2h'})
                              </Badge>
                              <Badge variant="outline" className="text-[10px] font-black border-current">
                                {event.type || 'Cours'}
                              </Badge>
                              <Badge className="bg-indigo-600 text-white font-black text-[10px] uppercase px-2 py-0.5">
                                {event.classCode}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button 
                                onClick={() => openEditModal(event)}
                                className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-blue-600 flex items-center justify-center shadow-sm hover:scale-105 cursor-pointer"
                                title="Modifier"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteEvent(event.id)}
                                className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-red-600 flex items-center justify-center shadow-sm hover:scale-105 cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-base font-black leading-snug mb-2 break-words">
                            {event.subject}
                          </h4>

                          <div className="flex items-center gap-4 text-xs font-bold opacity-80 pb-3 border-b border-current/10">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" /> {event.room || "Salle A01"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> {event.className || event.classCode}
                            </span>
                          </div>

                          <div className="pt-2 flex items-center justify-between">
                            <span className={cn(
                              "text-[10px] font-black uppercase px-2.5 py-1 rounded-xl flex items-center gap-1",
                              event.status === 'completed' ? "bg-emerald-600 text-white" : "bg-black/10 dark:bg-white/10"
                            )}>
                              {event.status === 'completed' ? <><CheckCircle2 className="w-3 h-3" /> Cours Émargé</> : "À faire"}
                            </span>

                            <Button
                              size="sm"
                              onClick={() => setRollCallSession(event)}
                              className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer"
                            >
                              Émarger
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: WEEKLY GRID TABLE */}
      {activeViewMode === 'grid' && (
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
          <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 text-xs font-bold text-center border-b border-blue-100 dark:border-blue-900 flex items-center justify-center gap-2">
            <span>👈 Glissez horizontalement pour consulter la semaine complète 👉</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[850px]">
              {/* Header Days */}
              <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
                <div className="p-4 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/30">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                {days.map(day => (
                  <div key={day} className="p-4 text-center border-r border-slate-100 dark:border-slate-800 last:border-0 bg-slate-50/20 dark:bg-slate-900">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{day}</p>
                  </div>
                ))}
              </div>

              {/* Time Grid Rows */}
              <div className="relative">
                {visibleHours.map((hour) => (
                  <div key={hour} className="grid grid-cols-7 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <div className="p-4 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center bg-slate-50/30 dark:bg-slate-800/20">
                      <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">{hour}</span>
                    </div>
                    {days.map(day => {
                      const events = getEventsForDayAndHour(day, hour);
                      return (
                        <div 
                          key={`${day}-${hour}`} 
                          className="p-2 border-r border-slate-50 dark:border-slate-800/50 last:border-0 min-h-[110px] relative group transition-colors"
                        >
                          {events.map((event) => (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              key={event.id}
                              className={cn(
                                "p-3 rounded-2xl shadow-sm mb-2 relative group/event transition-all border",
                                event.type === 'Cours' ? "bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800" :
                                event.type === 'Examen' ? "bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border-red-200 dark:border-red-800" :
                                event.type === 'TD' ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800" :
                                "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800"
                              )}
                            >
                              {/* Action Buttons Overlay */}
                              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/event:opacity-100 transition-opacity z-20">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); openEditModal(event); }}
                                  className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 cursor-pointer"
                                  title="Modifier la séance"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                                  className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 cursor-pointer"
                                  title="Supprimer de mon planning"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex items-center justify-between mb-1 pr-12">
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/30">
                                  {event.type} • {event.duration || '2h'}
                                </span>
                                <Badge variant="outline" className="text-[9px] font-black border-current">
                                  {event.classCode}
                                </Badge>
                              </div>

                              <h4 className="text-xs font-black leading-snug mb-2 line-clamp-2">{event.subject}</h4>

                              <div className="space-y-1 text-[10px] font-bold opacity-80 pt-1 border-t border-current/10">
                                <p className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" /> {event.room || "Salle A01"}
                                </p>
                                <p className="flex items-center gap-1">
                                  <Users className="w-3 h-3 text-indigo-600 shrink-0" /> {event.className || event.classCode}
                                </p>
                              </div>

                              {/* Émargement Quick Status & Action */}
                              <div className="pt-2 mt-2 border-t border-current/10 flex items-center justify-between">
                                <span className={cn(
                                  "text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1",
                                  event.status === 'completed' ? "bg-emerald-600 text-white" : "bg-black/10 dark:bg-white/10"
                                )}>
                                  {event.status === 'completed' ? <><CheckCircle2 className="w-2.5 h-2.5" /> Émargé</> : "À faire"}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setRollCallSession(event); }}
                                  className="text-[10px] font-black underline hover:text-blue-600 cursor-pointer flex items-center gap-1"
                                >
                                  Émarger
                                </button>
                              </div>
                            </motion.div>
                          ))}
                          <button 
                            onClick={() => openAddModal(day, hour)}
                            className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center bg-blue-600/5 transition-opacity z-0"
                          >
                            <Plus className="w-6 h-6 text-blue-600/40" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modal for adding/editing session */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-md rounded-[2.5rem] border-none p-6 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
              {editingSession ? "Modifier la séance" : "Ajouter une séance à mon planning"}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Créneau : {formData.day} à {formData.hour}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEvent} className="space-y-4 mt-2">
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Jour</label>
                <ModernSelect 
                  dropdownTitle="Jour de la Séance"
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs outline-none"
                  value={formData.day}
                  onChange={(e) => setFormData({...formData, day: e.target.value})}
                >
                  {days.map(d => (
                    <option key={d} value={d}>📅 {d}</option>
                  ))}
                </ModernSelect>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Heure de début</label>
                <ModernSelect 
                  dropdownTitle="Heure de Début"
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs outline-none"
                  value={formData.hour}
                  onChange={(e) => setFormData({...formData, hour: e.target.value})}
                >
                  <optgroup label="☀️ Cours du Jour (07h30 - 16h30)">
                    {ALL_HOURS.filter(h => parseInt(h, 10) <= 16).map(h => (
                      <option key={h} value={h}>☀️ {h} — Cours du jour</option>
                    ))}
                  </optgroup>
                  <optgroup label="🌙 Cours du Soir (17h00 - 22h00)">
                    {ALL_HOURS.filter(h => parseInt(h, 10) >= 17).map(h => (
                      <option key={h} value={h}>🌙 {h} — Cours du soir</option>
                    ))}
                  </optgroup>
                </ModernSelect>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sélectionner la classe attitrée</label>
              <ModernSelect 
                dropdownTitle="Classe Attitrée"
                className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs outline-none focus:ring-2 ring-blue-500/20 cursor-pointer"
                value={formData.classCode}
                onChange={(e) => {
                  const selVal = e.target.value;
                  const selClass = teacher.assignedClasses?.find((c: any) => 
                    (typeof c === 'string' ? c : c?.classCode || c?.code) === selVal
                  );
                  const isObj = typeof selClass === 'object' && selClass !== null;
                  setFormData({
                    ...formData, 
                    classCode: selVal,
                    subject: isObj ? (selClass.subject || formData.subject) : formData.subject,
                    room: isObj ? (selClass.room || formData.room) : formData.room
                  });
                }}
              >
                {(teacher?.assignedClasses && teacher.assignedClasses.length > 0 
                  ? teacher.assignedClasses 
                  : [{ classCode: 'G1-GL', className: 'G1 Génie Logiciel', subject: 'Informatique' }]
                ).map((ac: any, idx: number) => {
                  const code = typeof ac === 'string' ? ac : (ac.classCode || ac.code || ac.className || 'G1-GL');
                  const name = typeof ac === 'string' ? '' : (ac.className || ac.name || '');
                  const subj = typeof ac === 'object' && ac !== null ? (ac.subject || '') : '';
                  
                  let label = code;
                  if (name && name !== code) {
                    label += ` — ${name}`;
                  }
                  if (subj) {
                    label += ` (${subj})`;
                  }
                  return (
                    <option key={idx} value={code}>
                      🎓 {label}
                    </option>
                  );
                })}
              </ModernSelect>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom du Cours / Module</label>
              <Input 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Ex: Programmation Web Avancée" 
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Salle d'enseignement</label>
                <Input 
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  placeholder="Ex: Labo Info 1" 
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Durée de la séance</label>
                <ModernSelect 
                  dropdownTitle="Durée de la Séance"
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs outline-none"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                >
                  <option value="1h">⏱️ 1 heure</option>
                  <option value="2h">⏱️ 2 heures</option>
                  <option value="3h">⏱️ 3 heures</option>
                  <option value="4h">⏱️ 4 heures</option>
                </ModernSelect>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Type / Évaluation</label>
              <div className="grid grid-cols-3 gap-2">
                {EVALUATION_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({...formData, type: t})}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                      formData.type === t ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl cursor-pointer mt-2">
              {editingSession ? "Enregistrer les modifications" : "Valider et Ajouter au Planning"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Interactive Roll Call & Attendance Modal */}
      <RollCallModal
        isOpen={!!rollCallSession}
        onClose={() => setRollCallSession(null)}
        session={rollCallSession}
        teacher={teacher}
        onSuccess={fetchSchedule}
      />
    </div>
  );
}
