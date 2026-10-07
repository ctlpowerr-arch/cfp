import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Video, 
  FileText, 
  Award, 
  ChevronRight,
  ArrowUpRight,
  PlayCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  Target,
  UserCheck,
  Bell,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from "@/lib/utils";
import RollCallModal from '@/components/teacher/RollCallModal';

export default function TeacherOverview() {
  const { teacher } = useOutletContext<{ teacher: any }>();
  const navigate = useNavigate();
  const [isCourseActive, setIsCourseActive] = useState(false);
  const [realStudents, setRealStudents] = useState<any[]>([]);
  const [teacherSchedule, setTeacherSchedule] = useState<any[]>([]);
  const [adminNotifs, setAdminNotifs] = useState<any[]>([]);
  const [rollCallModalSession, setRollCallModalSession] = useState<any | null>(null);

  const loadAllData = () => {
    // 1. Load students
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        const teacherClassCodes = teacher.assignedClasses ? teacher.assignedClasses.map((c: any) => typeof c === 'string' ? c : c?.classCode || c?.code || '') : [];
        if (teacherClassCodes.length > 0) {
          const myStudents = data.filter((s: any) => 
            teacherClassCodes.includes(s.classCode) || 
            teacherClassCodes.includes(s.promo) ||
            (s.classCode && teacherClassCodes.some((cc: string) => s.classCode.startsWith(cc)))
          );
          setRealStudents(myStudents.length > 0 ? myStudents : data.slice(0, 16));
        } else if (teacher.specialty) {
          const myStudents = data.filter((s: any) => s.specialty === teacher.specialty);
          setRealStudents(myStudents.length > 0 ? myStudents : data.slice(0, 16));
        } else {
          setRealStudents(data.slice(0, 16));
        }
      })
      .catch(console.error);

    // 2. Load teacher schedule
    fetch('/api/schedule')
      .then(res => res.json())
      .then(data => {
        const tId = teacher.id;
        const tEmail = teacher.email?.toLowerCase();
        const tName = teacher.name?.toLowerCase();
        const mySessions = data.filter((s: any) => 
          (tId && s.teacherId === tId) ||
          (tEmail && s.teacherEmail?.toLowerCase() === tEmail) ||
          (tName && s.teacherName?.toLowerCase() === tName)
        );
        setTeacherSchedule(mySessions.length > 0 ? mySessions : data.slice(0, 3));
      })
      .catch(console.error);

    // 3. Load administrative notifications
    fetch(`/api/notifications?teacherId=${teacher.id}`)
      .then(res => res.json())
      .then(notifs => {
        if (Array.isArray(notifs)) {
          setAdminNotifs(notifs.slice(0, 3));
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadAllData();
  }, [teacher]);

  // Compute authentic stats
  const avgAttendance = realStudents.length > 0
    ? Math.round(realStudents.reduce((acc, s) => acc + (s.attendance || 90), 0) / realStudents.length)
    : 94;

  const nextSession = teacherSchedule[0] || {
    subject: teacher.assignedClasses?.[0]?.subject || "Algorithmique Avancée & Structures de Données",
    room: teacher.assignedClasses?.[0]?.room || "Labo Info 1",
    classCode: teacher.assignedClasses?.[0]?.classCode || "G1-GL",
    className: teacher.assignedClasses?.[0]?.className || "G1 Génie Logiciel",
    hour: "08h00",
    day: "Lundi"
  };

  const stats = [
    { 
      label: "Mes Étudiants", 
      value: realStudents.length, 
      icon: Users, 
      trend: "En direct", 
      color: "text-blue-600", 
      bg: "bg-blue-50 dark:bg-blue-900/20" 
    },
    { 
      label: "Taux Assiduité", 
      value: `${avgAttendance}%`, 
      icon: CheckCircle2, 
      trend: "+2.4%", 
      color: "text-emerald-600", 
      bg: "bg-emerald-50 dark:bg-emerald-900/20" 
    },
    { 
      label: "Séances / Semaine", 
      value: teacherSchedule.length, 
      icon: Calendar, 
      trend: "Planning", 
      color: "text-purple-600", 
      bg: "bg-purple-50 dark:bg-purple-900/20" 
    },
    { 
      label: "Note Performance", 
      value: teacher.performanceScore || "19.2/20", 
      icon: Award, 
      trend: "Évaluation", 
      color: "text-amber-600", 
      bg: "bg-amber-50 dark:bg-amber-900/20" 
    },
  ];

  const handleStartCourse = () => {
    setIsCourseActive(!isCourseActive);
    if (!isCourseActive) {
      toast.success("Session de cours démarrée ! Les étudiants peuvent maintenant émarger.");
    } else {
      toast.info("Session de cours terminée.");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-slate-900 dark:bg-white overflow-hidden group shadow-2xl"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white dark:text-slate-900 tracking-tight break-words">
              Ravi de vous revoir, <span className="text-blue-400 dark:text-blue-600">{teacher.name.split(' ')[1] || teacher.name}</span> ! 👋
            </h2>
            <p className="text-slate-400 dark:text-slate-500 font-bold text-xs sm:text-sm uppercase tracking-widest mt-2">
              {isCourseActive ? (
                <span className="flex items-center gap-2 text-emerald-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" /> Session en cours • {nextSession.room} ({nextSession.classCode})
                </span>
              ) : (
                <>Prochaine séance : <span className="text-white dark:text-slate-900 font-black">{nextSession.subject}</span> • {nextSession.day} {nextSession.hour} ({nextSession.room})</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Button 
              onClick={() => setRollCallModalSession(nextSession)}
              className="flex-1 sm:flex-none h-11 sm:h-12 px-4 sm:px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" /> Faire l'Appel
            </Button>
            <Button 
              onClick={() => navigate('/teacher/schedule')}
              className="flex-1 sm:flex-none h-11 sm:h-12 px-4 sm:px-6 rounded-2xl bg-white/10 dark:bg-slate-100 backdrop-blur-md text-white dark:text-slate-900 font-black text-xs border-none hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> Planning
            </Button>
            <Button 
              onClick={handleStartCourse}
              className={cn(
                "w-full sm:w-auto h-11 sm:h-12 px-4 sm:px-6 rounded-2xl font-black text-xs border-none shadow-lg transition-all active:scale-95",
                isCourseActive ? "bg-red-500 text-white shadow-red-500/20" : "bg-blue-600 text-white shadow-blue-500/20 hover:scale-105"
              )}
            >
              {isCourseActive ? 'Terminer le Cours' : 'Démarrer le Cours'}
            </Button>
          </div>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </motion.div>

      {/* Administration Directives Notification Ribbon */}
      {adminNotifs.length > 0 && (
        <Card className="border-none bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    Communication Administrative
                  </span>
                  <Badge className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5">
                    {adminNotifs.filter(n => !n.read).length} nouveau(x)
                  </Badge>
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {adminNotifs[0].title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                  {adminNotifs[0].message}
                </p>
              </div>
            </div>
            <p className="text-xs font-bold text-blue-600 flex items-center gap-1 cursor-pointer">
              Ouvrez le menu cloche en haut pour consulter tous les messages &rarr;
            </p>
          </div>
        </Card>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-2xl", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-100 py-1">
                    {stat.trend}
                  </Badge>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800">
            <div>
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Engagement Étudiants</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Taux de participation par semaine</CardDescription>
            </div>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
              <Button size="sm" variant="ghost" className="h-8 rounded-lg font-black text-[9px] uppercase px-4 bg-white dark:bg-slate-700 shadow-sm">Semaine</Button>
              <Button size="sm" variant="ghost" className="h-8 rounded-lg font-black text-[9px] uppercase px-4 text-slate-400">Mois</Button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={teacher.performanceHistory}>
                  <defs>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorEngagement)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Current Active Modules */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mes Modules Actifs</h4>
                <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-0 space-y-6">
              {teacher.modules?.map((mod: any, idx: number) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-slate-900 dark:text-white text-sm truncate pr-4">{mod.name}</p>
                    <span className="text-[10px] font-black text-blue-600">{mod.progress}%</span>
                  </div>
                  <Progress value={mod.progress} className="h-2 bg-slate-50 dark:bg-slate-800" />
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                    <Clock className="w-3 h-3" /> {mod.lessons - mod.completed} leçons restantes
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Insight Box */}
          <Card className="border-none shadow-xl bg-blue-600 p-8 text-white rounded-[2.5rem] relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-black text-sm uppercase tracking-widest">ITMC AI Insight</h4>
              </div>
              <p className="text-blue-50 font-medium text-xs leading-relaxed mb-6">
                "Le module {teacher.modules?.[0]?.name} avance bien, mais 3 étudiants ont manqué les deux derniers TD. Envisagez une session de rattrapage."
              </p>
              <Button size="sm" className="bg-white text-blue-600 font-black rounded-xl h-10 px-6 text-[10px] uppercase shadow-lg hover:bg-blue-50 transition-all">
                Générer Rapport Complet
              </Button>
            </div>
            <div className="absolute -bottom-8 -right-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
              <Sparkles className="w-40 h-40" />
            </div>
          </Card>
        </div>
      </div>

      {/* Assigned Classes & Subjects Section */}
      {teacher.assignedClasses && teacher.assignedClasses.length > 0 && (
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-5 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3 flex-wrap">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" /> 
                <span className="break-words">Mes Salles de Classe & Matières Enseignées</span>
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Affectation • Total: {realStudents.length} étudiants répartis sur {teacher.assignedClasses.length} classe(s)
              </CardDescription>
            </div>
            <Badge className="bg-blue-50 text-blue-600 border-blue-200 font-black text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-xl shrink-0">
              {teacher.department || 'Informatique'}
            </Badge>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {teacher.assignedClasses.map((clsItem: any, index: number) => {
                const code = typeof clsItem === 'string' ? clsItem : (clsItem.classCode || clsItem.code || clsItem.className || 'G1-GL');
                const className = typeof clsItem === 'string' ? clsItem : (clsItem.className || clsItem.name || code);
                const subject = typeof clsItem === 'object' && clsItem !== null ? (clsItem.subject || teacher.specialty || 'Cours Général') : 'Cours Général';
                const count = typeof clsItem === 'object' && clsItem !== null ? (clsItem.studentCount || 8) : 8;
                const schedule = typeof clsItem === 'object' && clsItem !== null ? (clsItem.schedule || "Lundi 08h-11h") : "Lundi 08h-11h";
                const room = typeof clsItem === 'object' && clsItem !== null ? (clsItem.room || "Labo Info") : "Labo Info";

                return (
                  <div 
                    key={index} 
                    className="p-4 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-4 relative overflow-hidden group hover:border-blue-500 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-100/50 dark:bg-blue-900/30 px-3 py-1 rounded-full uppercase tracking-wider shrink-0">
                        {code}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-bold border-slate-200 shrink-0">
                        {count} Élèves
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm sm:text-base leading-snug break-words">
                        {subject}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 mt-1">
                        Classe: <span className="text-slate-800 dark:text-slate-200">{className}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-500 gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {schedule}
                      </span>
                      <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-0.5 rounded-lg shrink-0">
                        {room}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Publier un support", sub: "PDF, Vidéos, Exercices", icon: FileText, color: "bg-blue-50 text-blue-600", path: "/teacher/modules" },
          { label: "Créer un Quiz", sub: "Évaluation hebdomadaire", icon: CheckCircle2, color: "bg-purple-50 text-purple-600", path: "/teacher/modules" },
          { label: "Suivi Étudiants", sub: "Notes et assiduité", icon: Target, color: "bg-emerald-50 text-emerald-600", path: "/teacher/students" },
        ].map((action, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(action.path)}
            className="flex items-center gap-4 p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
          >
            <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", action.color)}>
              <action.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white text-sm">{action.label}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{action.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto text-slate-200 group-hover:text-slate-400 transition-colors" />
          </button>
        ))}
      </div>

      {/* Interactive Roll Call Modal */}
      <RollCallModal
        isOpen={!!rollCallModalSession}
        onClose={() => setRollCallModalSession(null)}
        session={rollCallModalSession}
        teacher={teacher}
        onSuccess={loadAllData}
      />
    </div>
  );
}
