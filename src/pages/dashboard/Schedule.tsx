import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Users, 
  Search,
  Filter,
  Edit3,
  Trash2,
  X,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  UserSquare2,
  Check,
  ChevronDown,
  Printer,
  FileSpreadsheet,
  Award,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const ALL_HOURS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 7;
  return h < 10 ? `0${h}h` : `${h}h`;
});

const EVALUATION_TYPES = ['Cours', 'TD', 'TP', 'Examen', 'Composition', 'Rattrapage'];

// Helper to generate & print formatted PDF report
function printSchedulePDF(
  events: any[],
  title: string = "EMPLOI DU TEMPS & PROGRAMME DES ÉVALUATIONS",
  subtitle: string = "CENTRE DE FORMATION PROFESSIONNELLE INTERNATIONALE DE TECHNOLOGIE ET DES MÉTIERS DE LA CONSTRUCTION"
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error("Veuillez autoriser les fenêtres surgissantes (popups) pour imprimer le PDF.");
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
      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${evt.classCode}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1;">${evt.teacherName || 'Prof. Attitré'}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #0369a1;">${evt.room || 'Salle A'}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${title.replace(/[^\w.-]/gi, '_')}</title>
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
          <div class="logo-sub">Direction des Études &amp; de la Pédagogie</div>
        </div>
        <div style="text-align: right; font-size: 9.5px; font-weight: bold; color: #475569;">
          <div>Année Académique : 2026 - 2027</div>
          <div>Document Officiel Certifié</div>
        </div>
      </div>

      <div class="doc-title">
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Jour</th>
            <th>Créneau</th>
            <th>Matière / Évaluation</th>
            <th>Type</th>
            <th>Classe</th>
            <th>Enseignant Responsable</th>
            <th>Salle / Labo</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="7" style="text-align:center; padding:25px; font-weight:bold; color:#64748b;">Aucune séance ne correspond aux filtres sélectionnés.</td></tr>'}
        </tbody>
      </table>

      <div class="footer-signatures">
        <div class="sig-box">
          <div class="sig-title">Le Chef de Département</div>
          <div class="sig-space"></div>
          <div style="font-size: 9px; color: #94a3b8;">Signature &amp; Cachet</div>
        </div>
        <div class="sig-box">
          <div class="sig-title">La Direction Académique</div>
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

export default function AdminSchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [selectedClassCode, setSelectedClassCode] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all'); // 'all' | 'day' | 'evening'
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; hour: string } | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    teacherId: '',
    classCode: 'G1-GL',
    subject: '',
    room: '',
    day: 'Lundi',
    hour: '08h',
    duration: '2h',
    type: 'Cours'
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [schRes, tchRes, clsRes] = await Promise.all([
        fetch('/api/schedule'),
        fetch('/api/teachers'),
        fetch('/api/classes')
      ]);

      if (schRes.ok && tchRes.ok) {
        const schData = await schRes.json();
        const tchData = await tchRes.json();
        setSchedule(schData);
        setTeachers(tchData);
      }
      if (clsRes.ok) {
        const clsData = await clsRes.json();
        setClassesList(clsData);
      }
    } catch (err) {
      toast.error("Erreur de chargement des données d'emploi du temps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Schedule
  const filteredSchedule = schedule.filter((item) => {
    const matchesTeacher = selectedTeacherId === 'all' || item.teacherId === selectedTeacherId;
    const matchesClass = selectedClassCode === 'all' || item.classCode === selectedClassCode;
    const matchesDay = selectedDay === 'all' || item.day === selectedDay;
    const matchesType = selectedType === 'all' || item.type === selectedType;

    const hNum = parseInt(item.hour || '0', 10);
    const matchesShift = selectedShift === 'all' ||
      (selectedShift === 'day' && hNum >= 7 && hNum <= 16) ||
      (selectedShift === 'evening' && hNum >= 17 && hNum <= 22);

    const matchesSearch = searchQuery === '' || 
      item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.room?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.classCode?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTeacher && matchesClass && matchesDay && matchesType && matchesShift && matchesSearch;
  });

  // Unique Classes list derived directly from synchronized classes database
  const allClasses = classesList.length > 0
    ? classesList.map(c => c.code).sort()
    : ['G1-GL', 'G2-GL', 'L3-GL', 'R1-RCS', 'R2-RCS', 'L3-RCS', 'D1-DES', 'D2-DES', 'C1-CMD', 'C2-CMD'];

  // Open modal for new session
  const handleOpenAddModal = (slot?: { day: string; hour: string }) => {
    setEditingSession(null);
    const defaultTeacher = teachers[0] || {};
    const defaultClassCode = Array.isArray(defaultTeacher.assignedClasses) && defaultTeacher.assignedClasses.length > 0
      ? defaultTeacher.assignedClasses[0]
      : 'G1-GL';
    const foundClass = classesList.find(c => c.code === defaultClassCode);

    setSelectedSlot(slot || { day: 'Lundi', hour: '08h' });
    setFormData({
      teacherId: defaultTeacher.id || '',
      classCode: defaultClassCode,
      subject: '',
      room: foundClass?.room || 'Labo Info 1',
      day: slot?.day || 'Lundi',
      hour: slot?.hour || '08h',
      duration: '2h',
      type: 'Cours'
    });
    setIsModalOpen(true);
  };

  // Open modal for editing session
  const handleOpenEditModal = (session: any) => {
    setEditingSession(session);
    setFormData({
      teacherId: session.teacherId || '',
      classCode: session.classCode || 'G1-GL',
      subject: session.subject || '',
      room: session.room || '',
      day: session.day || 'Lundi',
      hour: session.hour || '08h',
      duration: session.duration || '2h',
      type: session.type || 'Cours'
    });
    setIsModalOpen(true);
  };

  // Submit Handler (Add or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacherId) {
      toast.error("Veuillez sélectionner un professeur");
      return;
    }

    const selectedTeacher = teachers.find(t => t.id === formData.teacherId);
    const selectedClassObj = classesList.find(c => c.code === formData.classCode);

    const payload = {
      ...formData,
      teacherName: selectedTeacher?.name || 'Professeur',
      teacherEmail: selectedTeacher?.email || '',
      className: selectedClassObj?.name || formData.classCode,
      specialty: selectedClassObj?.filières?.[0] || selectedTeacher?.mainSpecialty || 'Informatique & Numérique',
      room: formData.room || selectedClassObj?.room || 'Labo Info 1',
      academicYear: '2026-2027'
    };

    try {
      const saveSlot = async (forceOverrule = false) => {
        const finalPayload = { ...payload, force: forceOverrule };
        let res;
        if (editingSession) {
          res = await fetch(`/api/schedule/${editingSession.id}?force=${forceOverrule}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload)
          });
        } else {
          res = await fetch(`/api/schedule?force=${forceOverrule}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload)
          });
        }

        if (res.ok) {
          toast.success(editingSession ? "Planning modifié avec succès !" : "Nouveau cours programmé !");
          setIsModalOpen(false);
          fetchData();
        } else if (res.status === 409) {
          const errData = await res.json();
          toast.error(errData.message || "Conflit d'emploi du temps détecté !", {
            duration: 8000,
            action: {
              label: "Forcer",
              onClick: () => saveSlot(true)
            }
          });
        } else {
          toast.error("Erreur de sauvegarde du planning");
        }
      };

      await saveSlot(false);
    } catch (err) {
      toast.error("Une erreur réseau s'est produite");
    }
  };

  // Delete Handler
  const handleDeleteSession = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette séance du planning ?")) return;

    try {
      const res = await fetch(`/api/schedule/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Séance supprimée du planning");
        fetchData();
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

  const triggerExport = () => {
    const selTeacher = teachers.find(t => t.id === selectedTeacherId);
    let subtitleText = "Planning Général de l'Établissement";
    if (selTeacher) subtitleText = `Planning de l'Enseignant : ${selTeacher.name} (${selTeacher.department || ''})`;
    else if (selectedClassCode !== 'all') subtitleText = `Planning de la Classe : ${selectedClassCode}`;
    if (selectedType !== 'all') subtitleText += ` • Filtré par ${selectedType}`;

    printSchedulePDF(filteredSchedule, "EMPLOI DU TEMPS & PROGRAMME DES ÉVALUATIONS", subtitleText);
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-blue-900/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-blue-500/20 text-blue-300 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-400" />
                Super Administration
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1">
                Planning Global
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Emploi du Temps Général &amp; Programme des Évaluations
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Superviser les cours, TD, TP, compositions et examens. Exportation PDF structurée selon le filtrage actif.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <Button 
              onClick={triggerExport}
              className="h-12 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-lg cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-2 text-emerald-400" /> Imprimer / PDF
            </Button>

            <Button 
              onClick={() => handleOpenAddModal()}
              className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shrink-0 cursor-pointer"
            >
              <Plus className="w-5 h-5 mr-2" /> Programmer
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          
          {/* Search bar */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block ml-1">Recherche</span>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Matière, prof, salle..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold border-none"
              />
            </div>
          </div>

          {/* Filter by Teacher */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block ml-1">Enseignant</span>
            <ModernSelect 
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="all">👨‍🏫 Tous les Enseignants ({teachers.length})</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </ModernSelect>
          </div>

          {/* Filter by Class */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block ml-1">Classe / Filière</span>
            <ModernSelect 
              value={selectedClassCode}
              onChange={(e) => setSelectedClassCode(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="all">🎓 Toutes les Classes ({allClasses.length})</option>
              {allClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </ModernSelect>
          </div>

          {/* Filter by Type / Evaluation */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block ml-1">Évaluation / Type</span>
            <ModernSelect 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-blue-600 font-extrabold outline-none"
            >
              <option value="all">📝 Tous les Types &amp; Évaluations</option>
              {EVALUATION_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </ModernSelect>
          </div>

          {/* Filter by Shift / Période (Jour / Soir) */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block ml-1">Période / Shift</span>
            <ModernSelect 
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 font-bold text-xs text-amber-900 dark:text-amber-200 outline-none"
            >
              <option value="all">🌐 Tous les créneaux (07h - 22h)</option>
              <option value="day">☀️ Cours du Jour (07h30 - 16h30)</option>
              <option value="evening">🌙 Cours du Soir (17h00 - 22h00)</option>
            </ModernSelect>
          </div>

          {/* Filter by Day */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block ml-1">Jour</span>
            <ModernSelect 
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="all">📅 Tous les jours</option>
              {DAYS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </ModernSelect>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500">
          <p>
            Affichage de <span className="text-slate-900 dark:text-white font-black">{filteredSchedule.length}</span> séance(s) programmée(s)
          </p>

          <div className="flex items-center gap-2">
            {(selectedTeacherId !== 'all' || selectedClassCode !== 'all' || selectedDay !== 'all' || selectedType !== 'all' || selectedShift !== 'all' || searchQuery !== '') && (
              <Button 
                onClick={() => { setSelectedTeacherId('all'); setSelectedClassCode('all'); setSelectedDay('all'); setSelectedType('all'); setSelectedShift('all'); setSearchQuery(''); }}
                variant="ghost" 
                size="sm"
                className="text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl h-9"
              >
                Réinitialiser filtres
              </Button>
            )}

            <Button 
              onClick={triggerExport}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 rounded-xl shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Exporter PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Interactive Timetable Grid */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[950px]">
            
            {/* Header Days */}
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
              <div className="p-4 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/30">
                <Clock className="w-5 h-5 text-slate-400" />
              </div>
              {DAYS.map(day => (
                <div key={day} className="p-4 text-center border-r border-slate-100 dark:border-slate-800 last:border-0 bg-slate-50/20 dark:bg-slate-900">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{day}</p>
                </div>
              ))}
            </div>

            {/* Time Rows */}
            <div className="relative">
              {visibleHours.map((hour) => (
                <div key={hour} className="grid grid-cols-7 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                  <div className="p-4 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center bg-slate-50/30 dark:bg-slate-800/20">
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">{hour}</span>
                  </div>
                  {DAYS.map(day => {
                    const events = getEventsForDayAndHour(day, hour);
                    return (
                      <div 
                        key={`${day}-${hour}`} 
                        className="p-2 border-r border-slate-50 dark:border-slate-800/50 last:border-0 min-h-[125px] relative group transition-colors hover:bg-blue-500/5"
                      >
                        {events.map((event) => (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={event.id}
                            className={cn(
                              "p-3 rounded-2xl shadow-sm mb-2 relative group/event transition-all border",
                              event.type === 'Examen' ? "bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border-red-200 dark:border-red-800" :
                              event.type === 'Composition' ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800" :
                              event.type === 'Rattrapage' ? "bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800" :
                              event.type === 'TD' ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800" :
                              event.type === 'TP' ? "bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 border-teal-200 dark:border-teal-800" :
                              "bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800"
                            )}
                          >
                            {/* Action Buttons Overlay */}
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/event:opacity-100 transition-opacity z-20">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenEditModal(event); }}
                                className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 cursor-pointer"
                                title="Modifier la séance"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteSession(event.id); }}
                                className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 cursor-pointer"
                                title="Supprimer de l'emploi du temps"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 dark:bg-black/40">
                                {event.type} • {event.duration || '2h'}
                              </span>
                              <Badge className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[9px] font-black">
                                {event.classCode}
                              </Badge>
                            </div>

                            <h4 className="text-xs font-black leading-snug mb-2 line-clamp-2">{event.subject}</h4>

                            <div className="space-y-1 text-[10px] font-bold opacity-80 pt-1.5 border-t border-current/10">
                              <p className="flex items-center gap-1 truncate text-blue-900 dark:text-blue-200">
                                <UserSquare2 className="w-3 h-3 shrink-0" /> {event.teacherName || "Prof. Non Assigné"}
                              </p>
                              <p className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 shrink-0" /> {event.room || "Labo Info"}
                              </p>
                            </div>
                          </motion.div>
                        ))}

                        <button 
                          onClick={() => handleOpenAddModal({ day, hour })}
                          className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center bg-blue-600/10 transition-opacity z-0"
                          title={`Ajouter une séance le ${day} à ${hour}`}
                        >
                          <Plus className="w-6 h-6 text-blue-600" />
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

      {/* Add / Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-lg rounded-[2.5rem] border-none p-6 md:p-8 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
              {editingSession ? "Modifier la Séance du Planning" : "Programmer une Nouvelle Séance"}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Créneau : {formData.day} à {formData.hour}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            
            {/* Select Professor */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Professeur Attitré</label>
              <ModernSelect 
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-slate-800 dark:text-slate-200 outline-none"
                value={formData.teacherId}
                onChange={(e) => {
                  const tId = e.target.value;
                  const selTeacher = teachers.find(t => t.id === tId);
                  const teacherClass = Array.isArray(selTeacher?.assignedClasses) && selTeacher.assignedClasses.length > 0
                    ? selTeacher.assignedClasses[0]
                    : formData.classCode;
                  const matchingClass = classesList.find(c => c.code === teacherClass);
                  setFormData({
                    ...formData,
                    teacherId: tId,
                    classCode: teacherClass,
                    room: matchingClass?.room || formData.room
                  });
                }}
                required
              >
                <option value="">-- Sélectionner un enseignant --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.department || t.function})
                  </option>
                ))}
              </ModernSelect>
            </div>

            {/* Select Class & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Classe / Filière</label>
                <ModernSelect 
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-slate-800 dark:text-slate-200 outline-none"
                  value={formData.classCode}
                  onChange={(e) => {
                    const cCode = e.target.value;
                    const matchingClass = classesList.find(c => c.code === cCode);
                    setFormData({
                      ...formData, 
                      classCode: cCode,
                      room: matchingClass?.room || formData.room
                    });
                  }}
                >
                  {allClasses.map(c => {
                    const classObj = classesList.find(item => item.code === c);
                    return (
                      <option key={c} value={c}>
                        {c} {classObj?.name ? `— ${classObj.name}` : ''}
                      </option>
                    );
                  })}
                </ModernSelect>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Durée</label>
                <ModernSelect 
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-slate-800 dark:text-slate-200 outline-none"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                >
                  <option value="1h">1 heure</option>
                  <option value="2h">2 heures</option>
                  <option value="3h">3 heures</option>
                  <option value="4h">4 heures</option>
                </ModernSelect>
              </div>
            </div>

            {/* Subject Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Matière / Discipline</label>
              <Input 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Ex: Génie Logiciel & Refactoring"
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                required
              />
            </div>

            {/* Room & Day/Hour */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Salle / Amphi</label>
                <Input 
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  placeholder="Ex: Labo Info 2"
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Jour</label>
                <ModernSelect 
                  className="w-full h-12 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs outline-none"
                  value={formData.day}
                  onChange={(e) => setFormData({...formData, day: e.target.value})}
                >
                  {DAYS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </ModernSelect>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Heure de Début</label>
                <ModernSelect 
                  className="w-full h-12 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs outline-none"
                  value={formData.hour}
                  onChange={(e) => setFormData({...formData, hour: e.target.value})}
                >
                  <optgroup label="☀️ Cours du Jour (07h30 - 16h30)">
                    {ALL_HOURS.filter(h => parseInt(h, 10) <= 16).map(h => (
                      <option key={h} value={h}>{h} - Cours du jour</option>
                    ))}
                  </optgroup>
                  <optgroup label="🌙 Cours du Soir (17h00 - 22h00)">
                    {ALL_HOURS.filter(h => parseInt(h, 10) >= 17).map(h => (
                      <option key={h} value={h}>{h} - Cours du soir</option>
                    ))}
                  </optgroup>
                </ModernSelect>
              </div>
            </div>

            {/* Type & Evaluation selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Type / Nature de l'évaluation</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {EVALUATION_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({...formData, type: t})}
                    className={cn(
                      "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                      formData.type === t ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl cursor-pointer">
              {editingSession ? "Enregistrer les modifications" : "Confirmer la Séance au Planning"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

