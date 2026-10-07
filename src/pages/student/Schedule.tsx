import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Printer, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = ['08h00', '10h00', '12h00', '14h00', '16h00', '18h00'];

export default function StudentSchedule() {
  const { student } = useOutletContext<{ student: any }>();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schedule');
      const allSchedule = await res.json();
      
      // Filter strictly for student's classCode or promo
      if (Array.isArray(allSchedule)) {
        let classEvents = allSchedule.filter((item: any) => 
          item.classCode === student.classCode || 
          item.classCode === student.promo ||
          (student.classCode && item.className?.includes(student.classCode))
        );
        
        // If no direct match, fallback to class code prefix or specialty
        if (classEvents.length === 0 && student.specialty) {
          classEvents = allSchedule.filter((item: any) => 
            item.specialty === student.specialty || 
            item.department === student.department
          );
        }

        setSchedule(classEvents.length > 0 ? classEvents : allSchedule.slice(0, 6));
      }
    } catch (err) {
      toast.error("Erreur lors de la récupération de l'emploi du temps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [student]);

  const filteredSchedule = selectedDay === 'all' 
    ? schedule 
    : schedule.filter(s => s.day === selectedDay);

  // Group by day for grid
  const scheduleByDay: Record<string, any[]> = {};
  DAYS.forEach(d => {
    scheduleByDay[d] = schedule.filter(s => s.day === d);
  });

  const totalHours = schedule.reduce((acc, s) => {
    const dur = parseInt(s.duration || '2', 10);
    return acc + (isNaN(dur) ? 2 : dur);
  }, 0);

  const uniqueTeachers = Array.from(new Set(schedule.map(s => s.teacherName).filter(Boolean)));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
            <Badge className="bg-blue-600 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-xl">
              Classe : {student?.classCode || student?.promo || 'G1-GL'}
            </Badge>
            <Badge variant="outline" className="text-slate-500 font-bold text-[10px] sm:text-xs border-slate-200">
              Salle : {student?.room || 'Labo Info 1'}
            </Badge>
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 font-bold text-[10px] sm:text-xs">
              Semestre 1 • 2026-2027
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Mon Emploi du Temps
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Planning des cours synchronisé avec vos formateurs et la Direction des Études ITMC.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto justify-center">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
                viewMode === 'grid' 
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
                viewMode === 'agenda' 
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Liste Chronologique
            </button>
          </div>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="w-full sm:w-auto rounded-2xl h-11 px-5 font-bold gap-2 border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" /> Imprimer / PDF
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <Card className="rounded-2xl sm:rounded-[2rem] border-slate-100 dark:border-slate-800 p-3.5 sm:p-5 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate leading-tight">Volume Horaire</p>
              <h3 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white truncate leading-tight mt-0.5">{totalHours}h / sem.</h3>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl sm:rounded-[2rem] border-slate-100 dark:border-slate-800 p-3.5 sm:p-5 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate leading-tight">Matières & Séances</p>
              <h3 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white truncate leading-tight mt-0.5">{schedule.length} séances</h3>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl sm:rounded-[2rem] border-slate-100 dark:border-slate-800 p-3.5 sm:p-5 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate leading-tight">Enseignants Affectés</p>
              <h3 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white truncate leading-tight mt-0.5">{uniqueTeachers.length} formateurs</h3>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl sm:rounded-[2rem] border-slate-100 dark:border-slate-800 p-3.5 sm:p-5 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate leading-tight">Mon Assiduité</p>
              <h3 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white truncate leading-tight mt-0.5">{student?.attendance || 96}%</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Day Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <button
          onClick={() => setSelectedDay('all')}
          className={cn(
            "px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap cursor-pointer",
            selectedDay === 'all'
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
          )}
        >
          Toute la semaine ({schedule.length})
        </button>
        {DAYS.map(day => {
          const count = scheduleByDay[day]?.length || 0;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2",
                selectedDay === day
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
              )}
            >
              <span>{day}</span>
              {count > 0 && (
                <span className={cn(
                  "w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black",
                  selectedDay === day ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : schedule.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Aucun cours planifié pour le moment</h3>
          <p className="text-xs text-slate-500">
            L'administration et vos enseignants sont en train de finaliser la grille horaire de votre classe.
          </p>
        </div>
      ) : viewMode === 'grid' && selectedDay === 'all' ? (
        /* Weekly Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DAYS.map(day => {
            const dayEvents = scheduleByDay[day] || [];
            return (
              <div 
                key={day}
                className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col"
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{day}</h3>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-black">
                    {dayEvents.length} cours
                  </Badge>
                </div>

                <div className="space-y-3 flex-1">
                  {dayEvents.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs font-bold italic">
                      Pas de cours planifié ce jour
                    </div>
                  ) : (
                    dayEvents.map(event => (
                      <motion.div
                        key={event.id}
                        whileHover={{ scale: 1.01 }}
                        className={cn(
                          "p-4 rounded-2xl border transition-all relative overflow-hidden",
                          event.status === 'completed'
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {event.hour} ({event.duration || '2h'})
                          </span>
                          <span className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                            event.status === 'completed'
                              ? "bg-emerald-600 text-white"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          )}>
                            {event.status === 'completed' ? 'Émargé' : 'Prévu'}
                          </span>
                        </div>

                        <h4 className="font-black text-sm text-slate-900 dark:text-white mb-1 leading-snug">
                          {event.subject}
                        </h4>

                        <div className="space-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <p className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                            <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            {event.teacherName || 'Formateur ITMC'}
                          </p>
                          <p className="flex items-center gap-1.5 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            Salle : {event.room || 'Labo Info 1'}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Chronological / Single Day Agenda View */
        <div className="space-y-4">
          {filteredSchedule.map((event, idx) => (
            <motion.div
              key={event.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex flex-col items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/30">
                  <span className="text-[10px] font-black uppercase tracking-wider">{event.day?.slice(0, 3)}</span>
                  <span className="text-base font-black leading-tight mt-0.5">{event.hour}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {event.type || 'Cours Magistral & TP'}
                    </Badge>
                    <span className="text-xs text-slate-400 font-bold">• {event.duration || '2h'} de cours</span>
                    {event.status === 'completed' && (
                      <Badge className="bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Dispensé & Émargé
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {event.subject}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-indigo-600" /> Formateur : {event.teacherName}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" /> Salle : {event.room || 'Salle B02'}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> {event.className || student.classCode}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <Button
                  onClick={() => navigate('/student/modules')}
                  variant="outline"
                  className="rounded-xl h-10 text-xs font-bold border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Voir le support de cours
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
