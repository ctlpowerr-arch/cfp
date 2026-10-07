import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ModernSelect } from '@/components/ui/select';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Radio, 
  BookOpen, 
  Layout, 
  FileText, 
  Video, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  ExternalLink, 
  Award, 
  BarChart3, 
  AlertCircle, 
  ShieldCheck,
  Calendar as CalendarIcon,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  MessageSquare,
  Sparkles,
  History,
  Briefcase,
  GraduationCap,
  Play,
  FileCheck,
  Zap,
  MoreVertical,
  ChevronRight,
  Maximize2,
  ArrowRight,
  PlayCircle,
  Lock,
  Pencil,
  Trash2,
  School,
  Check,
  X,
  Layers,
  UserPlus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- Mock Data & Constants ---

const performanceData = [
  { name: 'Lun', value: 45 },
  { name: 'Mar', value: 52 },
  { name: 'Mer', value: 48 },
  { name: 'Jeu', value: 61 },
  { name: 'Ven', value: 55 },
  { name: 'Sam', value: 67 },
  { name: 'Dim', value: 72 },
];

const PRESET_DEPARTMENTS = [
  "Informatique",
  "Réseaux & Télécoms",
  "Cyber-sécurité & Systèmes",
  "Infographie & UI/UX Design",
  "Management & Gestion",
  "Automobile & Mécanique",
  "Electronique & Embedded",
  "Génie Civil & Architecture"
];

const PRESET_FUNCTIONS = [
  "Chef de Département",
  "Enseignant Titulaire",
  "Enseignant Senior",
  "Formateur Spécialisé",
  "Vacataire / Intervenant",
  "Directeur Pédagogique"
];

const PRESET_DEGREES = [
  "Doctorat / PhD en Informatique",
  "Master 2 / Recherche",
  "Ingénieur d'État",
  "Master 1 / Maîtrise",
  "Licence Professionnelle",
  "BTS / DQP Spécialisé"
];

// --- Sub-components ---

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, bg }: any) => (
  <Card className="border-none shadow-sm overflow-hidden group">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-900">{value}</h3>
          {trend && (
            <div className={cn("flex items-center gap-1 text-[10px] font-black uppercase", trend === 'up' ? "text-emerald-600" : "text-red-600")}>
              {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300", bg, color)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [pedagogicalStats, setPedagogicalStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [schedule, setSchedule] = useState<any[]>([]);

  // Add / Edit Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [customClassInput, setCustomClassInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    function: 'Enseignant Titulaire',
    department: 'Informatique',
    degree: 'Master 2 / Recherche',
    recruitmentDate: new Date().toISOString().split('T')[0],
    mainSpecialty: 'Génie Logiciel',
    assignedClasses: [] as string[],
    isTitulaire: false,
    titulaireClasses: [] as string[],
    titulaireRole: '',
    status: 'Actif'
  });

  const fetchData = async () => {
    try {
      const [teachersRes, classesRes, statsRes, scheduleRes] = await Promise.all([
        fetch('/api/teachers'),
        fetch('/api/classes'),
        fetch('/api/stats/pedagogical'),
        fetch('/api/schedule')
      ]);
      
      if (teachersRes.ok) {
        const data = await teachersRes.json();
        setTeachers(data);
      }
      if (classesRes.ok) {
        const data = await classesRes.json();
        setClassesList(data);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setPedagogicalStats(data);
      }
      if (scheduleRes.ok) {
        const data = await scheduleRes.json();
        setSchedule(data);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Consolidate full list of system classes & rooms
  const allClassesList = useMemo(() => {
    if (classesList.length > 0) return classesList;
    return [
      { id: "cls-g1", code: "G1", name: "Génie Logiciel (Licence 1 / Niveau 1)" },
      { id: "cls-g2", code: "G2", name: "Génie Logiciel & BD (Niveau 2)" },
      { id: "cls-g3", code: "G3", name: "Génie Logiciel (Licence 3 / DQP)" },
      { id: "cls-r1", code: "R1", name: "Réseaux & Télécoms (Niveau 1)" },
      { id: "cls-r2", code: "R2", name: "Réseaux & Télécoms (Niveau 2)" },
      { id: "cls-tuy", code: "TUY", name: "Tuyauterie Industrielle" },
      { id: "cls-car", code: "CAR", name: "Carrelage Bâtiment" },
      { id: "cls-mec", code: "MEC", name: "Mécatronique Automobile" },
      { id: "cls-dt", code: "DT", name: "Douane & Transit" },
      { id: "cls-cg", code: "CG", name: "Comptabilité & Gestion" }
    ];
  }, [classesList]);

  // Compute unassigned classes/rooms that currently lack an Enseignant Titulaire
  const unassignedClasses = useMemo(() => {
    return allClassesList.filter(cls => {
      const clsCode = (cls.code || cls.name || '').toLowerCase();
      const hasTitulaire = teachers.some(t => {
        if (!t.isTitulaire) return false;
        const tcList = Array.isArray(t.titulaireClasses) ? t.titulaireClasses : [t.titulaireClasses || ''];
        return tcList.some((tc: string) => {
          if (!tc) return false;
          const cleanTc = tc.toLowerCase();
          return cleanTc === 'tous' || cleanTc === clsCode || clsCode.includes(cleanTc) || cleanTc.includes(clsCode);
        });
      });
      return !hasTitulaire;
    });
  }, [allClassesList, teachers]);

  // Quick Assign Titulaire State & Handlers
  const [quickAssignClass, setQuickAssignClass] = useState<any | null>(null);
  const [selectedQuickTeacherId, setSelectedQuickTeacherId] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'titulaires' | 'intervenants' | 'unassigned'>('all');
  const [customTitulaireInput, setCustomTitulaireInput] = useState('');

  const handleOpenQuickAssign = (clsObj: any) => {
    setQuickAssignClass(clsObj);
    if (teachers.length > 0) setSelectedQuickTeacherId(teachers[0].id);
  };

  const handleSaveQuickAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAssignClass || !selectedQuickTeacherId) return;

    const teacher = teachers.find(t => t.id === selectedQuickTeacherId);
    if (!teacher) return;

    setSaving(true);
    try {
      const existingTitulaireClasses = Array.isArray(teacher.titulaireClasses) ? teacher.titulaireClasses : [];
      const newCode = quickAssignClass.code || quickAssignClass.name;
      const updatedTitulaireClasses = Array.from(new Set([...existingTitulaireClasses, newCode]));

      const payload = {
        ...teacher,
        isTitulaire: true,
        titulaireClasses: updatedTitulaireClasses,
        titulaireRole: `Enseignant Titulaire (${updatedTitulaireClasses.join(', ')})`
      };

      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Enseignant Titulaire ${teacher.name} affecté avec succès à la salle ${newCode} !`);
        setQuickAssignClass(null);
        fetchData();
      } else {
        toast.error("Erreur lors de l'affectation du Titulaire.");
      }
    } catch (err) {
      toast.error("Erreur de connexion serveur.");
    } finally {
      setSaving(false);
    }
  };

  // Compute classes where teacher is present/assigned
  const getTeacherClasses = (t: any) => {
    if (!t) return [];
    const directAssigned = Array.isArray(t.assignedClasses) && t.assignedClasses.length > 0 
      ? t.assignedClasses 
      : (Array.isArray(t.promotions) ? t.promotions : []);

    const directStrings = directAssigned.map((item: any) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (typeof item === 'object') {
        if (item.classCode && item.className) return `${item.classCode} - ${item.className}`;
        if (item.classCode) return item.classCode;
        if (item.className) return item.className;
        if (item.name) return item.name;
        if (item.code) return item.code;
        return 'Classe Spécialisée';
      }
      return String(item);
    }).filter(Boolean);

    const linkedFromClasses = classesList
      .filter((cls: any) => {
        const teacherIds = cls.assignedTeacherIds || [];
        const teacherNames = cls.assignedTeachers || [];
        return (
          teacherIds.includes(t.id) ||
          teacherNames.some((n: any) => typeof n === 'string' && n.toLowerCase() === t.name?.toLowerCase())
        );
      })
      .map((cls: any) => `${cls.code} - ${cls.name}`);

    const combined = [...directStrings, ...linkedFromClasses];
    return Array.from(new Set(combined));
  };

  const handleResetUserPassword = async (teacherObj: { id: string; name: string; email: string }) => {
    if (!confirm(`Réinitialiser le mot de passe de ${teacherObj.name} (${teacherObj.email}) au mot de passe par défaut 'itmc2026DLA' ?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: teacherObj.id,
          email: teacherObj.email,
          newPassword: 'itmc2026DLA'
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Mot de passe de ${teacherObj.name} réinitialisé à 'itmc2026DLA' !`);
      } else {
        toast.error(data.error || "Échec de réinitialisation.");
      }
    } catch (e) {
      toast.error("Erreur lors de la réinitialisation du mot de passe.");
    }
  };

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    const defaultClasses = classesList.length > 0 
      ? [`${classesList[0].code} - ${classesList[0].name}`] 
      : ['Licence 1'];

    setFormData({
      name: '',
      email: '',
      phone: '+237 600 00 00 00',
      function: 'Enseignant Titulaire',
      department: 'Informatique',
      degree: 'Master 2 / Recherche',
      recruitmentDate: new Date().toISOString().split('T')[0],
      mainSpecialty: 'Génie Logiciel',
      assignedClasses: defaultClasses,
      isTitulaire: false,
      titulaireClasses: [],
      titulaireRole: '',
      status: 'Actif'
    });
    setCustomClassInput('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (teacher: any) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '+237 600 00 00 00',
      function: teacher.function || 'Enseignant Titulaire',
      department: teacher.department || 'Informatique',
      degree: teacher.degree || 'Master 2 / Recherche',
      recruitmentDate: teacher.recruitmentDate || new Date().toISOString().split('T')[0],
      mainSpecialty: teacher.mainSpecialty || 'Génie Logiciel',
      assignedClasses: getTeacherClasses(teacher),
      isTitulaire: Boolean(teacher.isTitulaire),
      titulaireClasses: Array.isArray(teacher.titulaireClasses) ? teacher.titulaireClasses : [],
      titulaireRole: teacher.titulaireRole || '',
      status: teacher.status || 'Actif'
    });
    setCustomClassInput('');
    setIsFormOpen(true);
  };

  const toggleClassAssignment = (classLabel: string) => {
    setFormData(prev => {
      const exists = prev.assignedClasses.includes(classLabel);
      if (exists) {
        return { ...prev, assignedClasses: prev.assignedClasses.filter(c => c !== classLabel) };
      } else {
        return { ...prev, assignedClasses: [...prev.assignedClasses, classLabel] };
      }
    });
  };

  const handleAddCustomClass = () => {
    if (!customClassInput.trim()) return;
    const trimmed = customClassInput.trim();
    if (!formData.assignedClasses.includes(trimmed)) {
      setFormData(prev => ({ ...prev, assignedClasses: [...prev.assignedClasses, trimmed] }));
    }
    setCustomClassInput('');
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Veuillez remplir au moins le nom et l'adresse e-mail.");
      return;
    }

    setSaving(true);
    try {
      const isTit = formData.isTitulaire || formData.titulaireClasses.length > 0;
      const titRole = isTit 
        ? `Enseignant Titulaire ${formData.titulaireClasses.length > 0 ? `(${formData.titulaireClasses.join(', ')})` : ''}` 
        : formData.function;

      const payload = {
        ...editingTeacher,
        ...formData,
        isTitulaire: isTit,
        titulaireClasses: formData.titulaireClasses,
        titulaireRole: titRole,
        id: editingTeacher?.id || undefined,
        promotions: formData.assignedClasses,
      };

      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingTeacher ? "Enseignant mis à jour avec succès !" : "Nouvel enseignant créé avec succès !");
        setIsFormOpen(false);
        fetchData();
      } else {
        toast.error("Erreur lors de la sauvegarde de l'enseignant.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de connexion serveur.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet enseignant ?")) return;

    try {
      const res = await fetch(`/api/teachers/${teacherId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Enseignant supprimé.");
        if (selectedTeacher?.id === teacherId) {
          setIsDetailOpen(false);
        }
        fetchData();
      } else {
        toast.error("Erreur lors de la suppression.");
      }
    } catch (err) {
      toast.error("Erreur de connexion.");
    }
  };

  const handleStatusChange = async (teacherId: string, newStatus: string) => {
    try {
      const teacher = teachers.find(t => t.id === teacherId);
      if (!teacher) return;
      
      const updatedTeacher = { ...teacher, status: newStatus };
      const response = await fetch('/api/teachers', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTeacher) 
      });

      if (response.ok) {
        toast.success(`Statut mis à jour : ${newStatus}`);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        t.name?.toLowerCase().includes(q) ||
        t.department?.toLowerCase().includes(q) ||
        t.mainSpecialty?.toLowerCase().includes(q) ||
        t.degree?.toLowerCase().includes(q) ||
        (Array.isArray(t.titulaireClasses) && t.titulaireClasses.some((tc: string) => tc.toLowerCase().includes(q)));

      if (!matchesSearch) return false;

      if (filterCategory === 'titulaires') return Boolean(t.isTitulaire);
      if (filterCategory === 'intervenants') return !t.isTitulaire;
      return true;
    });
  }, [teachers, searchQuery, filterCategory]);

  // Command Center Stats
  const stats = [
    { title: "Enseignants", value: String(teachers.length), icon: Users, trend: "Actifs", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Modules Publiés", value: "48", icon: BookOpen, trend: "Pédagogique", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { title: "Contenus (Vidéos/PDF)", value: "542", icon: PlayCircle, trend: "+12.5%", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { title: "Progression Moy.", value: "68%", icon: TrendingUp, trend: "+3.5%", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-900/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight break-words">
            Centre de Commandement <span className="text-blue-600">Pédagogique</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs sm:text-sm uppercase tracking-widest mt-1">
            Super Administrateur • ITMC Dashboard v2.0
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
            className="rounded-xl font-bold border-slate-200 dark:border-slate-800 gap-2 h-11 justify-center w-full sm:w-auto shrink-0 cursor-pointer"
          >
            <Layout className="w-4 h-4 shrink-0" /> {viewMode === 'grid' ? 'Vue Liste' : 'Vue Grille'}
          </Button>
          <Button 
            onClick={handleOpenAdd}
            className="rounded-xl font-black bg-blue-600 hover:bg-blue-700 text-white h-11 px-5 sm:px-6 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5 shrink-0" /> Ajouter un Enseignant
          </Button>
        </div>
      </div>

      {/* Global Command Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden bg-white dark:bg-slate-900">
              <div className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-2xl", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <Badge variant="outline" className="rounded-lg font-black text-[10px] border-slate-100 uppercase py-1">
                    {stat.trend}
                  </Badge>
                </div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.title}</h3>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
                
                <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <stat.icon className="w-24 h-24 rotate-12" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Secondary Metrics Bar */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 p-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-8 min-w-max">
          {[
            { label: "Modules", value: "48", icon: BookOpen },
            { label: "Quiz", value: "124", icon: CheckCircle2 },
            { label: "TD/TP", value: "86", icon: Briefcase },
            { label: "Vidéos", value: "215", icon: Video },
            { label: "Documents", value: "182", icon: FileText },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 border-r border-slate-100 dark:border-slate-800 pr-8 last:border-0">
              <item.icon className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Signal Banner: Unassigned Classes / Rooms lacking an Enseignant Titulaire */}
      {unassignedClasses.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-2 border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/30 p-5 rounded-3xl shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start lg:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-amber-950 flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-amber-500/30">
                  ⚠️
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-amber-500 text-amber-950 font-black text-[9px] uppercase border-none">
                      Signalement Système ITMC
                    </Badge>
                    <span className="text-xs font-black text-amber-950 dark:text-amber-200">
                      {unassignedClasses.length} Salle(s) / Filière(s) Sans Enseignant Titulaire
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/80 dark:text-amber-200/80 font-medium mt-1">
                    Aucun enseignant titulaire n'est actuellement affecté à ces salles. Désignez un titulaire pour autoriser les délibérations et bulletins de fin d'année.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {unassignedClasses.slice(0, 6).map(uCls => (
                  <Button
                    key={uCls.code || uCls.id}
                    onClick={() => handleOpenQuickAssign(uCls)}
                    size="sm"
                    className="h-8 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>{uCls.code} ({uCls.name.slice(0, 16)})</span>
                    <Plus className="w-3 h-3 text-amber-950" />
                  </Button>
                ))}
                {unassignedClasses.length > 6 && (
                  <Badge variant="outline" className="text-xs font-black border-amber-500 text-amber-800 dark:text-amber-200">
                    +{unassignedClasses.length - 6} autres
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Main Content Area with Tabs */}
      <Tabs defaultValue="list" className="space-y-8">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 w-full">
          <TabsList className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 h-auto w-full lg:w-auto flex overflow-x-auto no-scrollbar max-w-full shrink-0">
            <TabsTrigger value="list" className="flex-1 lg:flex-initial rounded-xl px-3 sm:px-6 py-2.5 font-black text-[10px] uppercase tracking-widest whitespace-nowrap shrink-0 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900">
              Liste des Enseignants ({teachers.length})
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex-1 lg:flex-initial rounded-xl px-3 sm:px-6 py-2.5 font-black text-[10px] uppercase tracking-widest whitespace-nowrap shrink-0 data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900">
              Planning Global
            </TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64 md:w-72 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Rechercher par nom, spécialité, diplôme..." 
                className="pl-12 h-11 bg-white dark:bg-slate-900 border-none shadow-sm rounded-xl font-medium text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleOpenAdd}
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Ajouter
            </Button>
          </div>
        </div>

        <TabsContent value="list" className="space-y-6 mt-0">
          {/* Sub-Filters Bar for Titulaire & Alertes */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={filterCategory === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterCategory('all')}
                className="rounded-xl font-extrabold text-xs h-9 px-4 cursor-pointer"
              >
                Tous ({teachers.length})
              </Button>
              <Button
                variant={filterCategory === 'titulaires' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterCategory('titulaires')}
                className={cn(
                  "rounded-xl font-extrabold text-xs h-9 px-4 cursor-pointer flex items-center gap-1.5",
                  filterCategory === 'titulaires' ? "bg-amber-500 text-white" : "text-amber-600 dark:text-amber-400"
                )}
              >
                ⭐ Enseignants Titulaires ({teachers.filter(t => t.isTitulaire).length})
              </Button>
              <Button
                variant={filterCategory === 'intervenants' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterCategory('intervenants')}
                className="rounded-xl font-extrabold text-xs h-9 px-4 cursor-pointer"
              >
                Intervenants ({teachers.filter(t => !t.isTitulaire).length})
              </Button>
              <Button
                variant={filterCategory === 'unassigned' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterCategory('unassigned')}
                className={cn(
                  "rounded-xl font-extrabold text-xs h-9 px-4 cursor-pointer flex items-center gap-1.5",
                  filterCategory === 'unassigned' ? "bg-red-500 text-white" : "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                )}
              >
                ⚠️ Salles Sans Titulaire ({unassignedClasses.length})
              </Button>
            </div>
            
            <p className="text-[10px] font-bold text-slate-400 uppercase px-3">
              {filteredTeachers.length} enseignant(s) affiché(s)
            </p>
          </div>

          {filterCategory === 'unassigned' ? (
            /* Dedicated view for unassigned classes / filières lacking a Titular teacher */
            <Card className="border-2 border-amber-500/30 p-6 rounded-3xl bg-amber-50/30 dark:bg-amber-950/20 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/50 pb-4">
                <div>
                  <h3 className="text-base font-black text-amber-950 dark:text-amber-200 uppercase tracking-tight flex items-center gap-2">
                    <span>⚠️</span> Signalement : Salles et Filières Sans Enseignant Titulaire ({unassignedClasses.length})
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-300 font-medium mt-0.5">
                    Pour chaque salle ci-dessous, aucun enseignant n'est encore désigné comme Titulaire. Cliquez sur "Affecter un Titulaire" pour y remédier.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {unassignedClasses.map((cls) => (
                  <div key={cls.id || cls.code} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Badge className="bg-amber-500 text-white font-black text-[10px]">
                          Code : {cls.code}
                        </Badge>
                        <span className="text-[10px] font-extrabold text-red-500 uppercase">Alerte Titulaire</span>
                      </div>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">{cls.name}</h4>
                    </div>

                    <Button
                      onClick={() => handleOpenQuickAssign(cls)}
                      className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      <span>Affecter un Titulaire</span>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher, i) => {
                const teacherClasses = getTeacherClasses(teacher);
                return (
                  <motion.div
                    key={teacher.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-500 group overflow-hidden rounded-[2.5rem] flex flex-col justify-between h-full border border-slate-100 dark:border-slate-800">
                      <div className="p-4 sm:p-6 space-y-4">
                        {/* Header: Avatar, Name, Actions */}
                        <div className="flex items-start justify-between gap-2 sm:gap-4 min-w-0">
                          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className="relative shrink-0">
                              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-slate-50 shadow-lg ring-2 ring-blue-500/10">
                                <AvatarImage src={teacher.avatar} />
                                <AvatarFallback>{teacher.name?.charAt(0) || 'T'}</AvatarFallback>
                              </Avatar>
                              <div className={cn(
                                "absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center",
                                teacher.status === 'Actif' ? "bg-emerald-500" : "bg-slate-300"
                              )}>
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                                {teacher.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-blue-50 text-blue-600 border-blue-100 max-w-full truncate">
                                  {teacher.function || 'Enseignant'}
                                </Badge>
                                {teacher.isTitulaire && (
                                  <Badge className="text-[9px] font-black uppercase tracking-tighter bg-amber-500 text-white border-none shadow-xs flex items-center gap-1">
                                    ⭐ Titulaire ({Array.isArray(teacher.titulaireClasses) && teacher.titulaireClasses.length > 0 ? teacher.titulaireClasses.join(', ') : 'Général'})
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider line-clamp-2 leading-tight mt-0.5">
                                {teacher.department || 'Informatique'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEdit(teacher)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all cursor-pointer"
                              title="Modifier l'enseignant"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger render={
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl" />
                              }>
                                <MoreHorizontal className="w-5 h-5" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-none shadow-2xl bg-white dark:bg-slate-900">
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Actions Admin</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleOpenEdit(teacher)} className="rounded-xl gap-3 font-bold py-3 cursor-pointer">
                                    <Pencil className="w-4 h-4 text-blue-600" /> Modifier Profil
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setSelectedTeacher(teacher); setIsDetailOpen(true); }} className="rounded-xl gap-3 font-bold py-3 cursor-pointer">
                                    <BookOpen className="w-4 h-4 text-indigo-600" /> Consulter Détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleResetUserPassword(teacher)} className="rounded-xl gap-3 font-bold py-3 text-amber-600 dark:text-amber-400 cursor-pointer">
                                    <ShieldCheck className="w-4 h-4 text-amber-500" /> Réinitialiser Mot de Passe
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                  <DropdownMenuItem onClick={() => handleDeleteTeacher(teacher.id)} className="rounded-xl gap-3 font-bold py-3 text-red-500 cursor-pointer">
                                    <Trash2 className="w-4 h-4" /> Supprimer Enseignant
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Degree & Recruitment Date Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[10px]">
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 min-w-0">
                            <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[8px] font-black uppercase text-slate-400 block">Niveau / Diplôme</span>
                              <span className="font-extrabold truncate block">{teacher.degree || 'Master 2'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 min-w-0">
                            <CalendarIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[8px] font-black uppercase text-slate-400 block">Date de Début</span>
                              <span className="font-extrabold truncate block">{teacher.recruitmentDate || 'Récemment'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Assigned Classes Badge Row (CRITICAL FEATURE) */}
                        <div className="space-y-1.5 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                              <School className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              Classes où présent ({teacherClasses.length}) :
                            </p>
                            <button
                              onClick={() => handleOpenEdit(teacher)}
                              className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              Gérer
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {teacherClasses.length > 0 ? (
                              teacherClasses.map((cName: string, idx: number) => (
                                <span 
                                  key={idx} 
                                  className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs flex items-center gap-1 max-w-full truncate"
                                >
                                  🏷️ <span className="truncate">{cName}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 italic">
                                Aucune classe assignée
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Performance Metrics Grid */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Modules</p>
                            <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">{(teacher.modules || []).length}</p>
                          </div>
                          <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Étudiants</p>
                            <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">{teacher.studentsCount || 0}</p>
                          </div>
                          <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Score</p>
                            <p className={cn(
                              "text-sm sm:text-base font-black",
                              (teacher.performanceScore || 85) > 90 ? "text-emerald-500" : "text-blue-500"
                            )}>{teacher.performanceScore || 85}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-blue-500" /> Avancement Pédagogique
                            </p>
                            <span className="text-xs font-black text-blue-600">{teacher.progress || 0}%</span>
                          </div>
                          <Progress value={teacher.progress || 0} className="h-2 bg-slate-100 dark:bg-slate-800" />
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between gap-2">
                        <Button
                          onClick={() => handleOpenEdit(teacher)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl font-extrabold text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5 text-blue-600" /> Modifier Info
                        </Button>

                        <Button 
                          onClick={() => { setSelectedTeacher(teacher); setIsDetailOpen(true); }}
                          variant="ghost" 
                          size="sm"
                          className="group gap-1 font-black text-xs text-blue-600 hover:text-blue-700 p-0 h-auto"
                        >
                          Consulter <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem]">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow className="border-slate-100 dark:border-slate-800">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest px-8">Enseignant & Diplôme</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Département & Fonction</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Date Début</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Classes Présentes</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Statut</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase tracking-widest px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => {
                    const teacherClasses = getTeacherClasses(teacher);
                    return (
                      <TableRow key={teacher.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50">
                        <TableCell className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-100 dark:border-slate-800">
                              <AvatarImage src={teacher.avatar} />
                              <AvatarFallback>{teacher.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white text-sm">{teacher.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-indigo-500" />
                                {teacher.degree || 'Master 2'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-[9px] font-bold uppercase border-slate-200 dark:border-slate-700">{teacher.department}</Badge>
                            <p className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400">{teacher.function}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {teacher.recruitmentDate || 'Récemment'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {teacherClasses.length > 0 ? (
                              teacherClasses.slice(0, 3).map((cName: string, idx: number) => (
                                <span key={idx} className="text-[9px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900">
                                  {cName}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 italic">Aucune</span>
                            )}
                            {teacherClasses.length > 3 && (
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                +{teacherClasses.length - 3}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", teacher.status === 'Actif' ? "bg-emerald-500" : "bg-slate-300")} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{teacher.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              onClick={() => handleOpenEdit(teacher)} 
                              variant="outline" 
                              size="sm" 
                              className="h-8 rounded-lg font-bold text-xs gap-1 border-slate-200"
                            >
                              <Pencil className="w-3.5 h-3.5 text-blue-600" /> Éditer
                            </Button>
                            <Button 
                              onClick={() => { setSelectedTeacher(teacher); setIsDetailOpen(true); }} 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 rounded-lg font-bold text-xs"
                            >
                              Détails
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="planning" className="mt-0">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Vue d'ensemble des cours</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Supervisez l'occupation des salles et le planning des enseignants</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-600 border-none font-black text-[9px] uppercase px-3 py-1">Semaine en cours</Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-4 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                    <div key={day} className="p-4 text-center border-r border-slate-100 dark:border-slate-800 last:border-0 font-black text-[10px] uppercase tracking-widest text-slate-400">
                      {day}
                    </div>
                  ))}
                </div>
                {Array.from({ length: 11 }, (_, i) => `${i + 8}h`).map(hour => (
                  <div key={hour} className="grid grid-cols-7 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <div className="p-4 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-center">
                      <span className="text-[10px] font-black text-slate-400">{hour}</span>
                    </div>
                    {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => {
                      const events = schedule.filter(e => e.day === day && e.hour === hour);
                      return (
                        <div key={`${day}-${hour}`} className="p-2 border-r border-slate-50 dark:border-slate-800/50 last:border-0 min-h-[80px] group relative hover:bg-slate-50/50 transition-colors">
                          {events.map(event => (
                            <div key={event.id} className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 mb-1">
                              <p className="text-[8px] font-black text-blue-600 dark:text-blue-400 truncate">{event.subject}</p>
                              <p className="text-[7px] font-bold text-slate-400 mt-0.5 truncate">{event.class}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- ADD / EDIT TEACHER FORM MODAL --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white dark:bg-slate-900 rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              {editingTeacher ? (
                <>
                  <Pencil className="w-5 h-5 text-blue-600" />
                  Modifier l'enseignant : <span className="text-blue-600">{editingTeacher.name}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Ajouter un nouvel enseignant
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Complétez les informations personnelles, le niveau d'étude, la date de début et les classes assignées.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveTeacher} className="space-y-6 mt-4">
            {/* Section 1: Personal Info */}
            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" /> Identity & Contact
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nom Complet *</Label>
                  <Input 
                    required
                    placeholder="Ex: Dr. Jean-Paul Kamga" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="h-10 rounded-xl bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Adresse Email *</Label>
                  <Input 
                    required
                    type="email"
                    placeholder="Ex: jp.kamga@itmc-it.cm" 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-10 rounded-xl bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Numéro de Téléphone</Label>
                  <Input 
                    placeholder="Ex: +237 699 00 11 22" 
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="h-10 rounded-xl bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Statut</Label>
                  <ModernSelect 
                    dropdownTitle="Statut de l'Enseignant"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 text-xs font-bold text-slate-800 dark:text-white"
                  >
                    <option value="Actif">🟢 Actif</option>
                    <option value="En congé">🟠 En congé</option>
                    <option value="Inactif">🔴 Inactif</option>
                  </ModernSelect>
                </div>
              </div>
            </div>

            {/* Section 2: Department & Academic Credentials */}
            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Titres Academic & Département
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Département</Label>
                  <input 
                    list="departments-list"
                    placeholder="Sélectionnez ou saisissez..."
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 text-xs font-medium"
                  />
                  <datalist id="departments-list">
                    {PRESET_DEPARTMENTS.map((dept, i) => (
                      <option key={i} value={dept} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Fonction Pédagogique</Label>
                  <input 
                    list="functions-list"
                    placeholder="Ex: Chef de Département, Titulaire..."
                    value={formData.function}
                    onChange={(e) => setFormData(prev => ({ ...prev, function: e.target.value }))}
                    className="w-full h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 text-xs font-medium"
                  />
                  <datalist id="functions-list">
                    {PRESET_FUNCTIONS.map((f, i) => (
                      <option key={i} value={f} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Niveau d'Étude / Diplôme *</Label>
                  <input 
                    list="degrees-list"
                    placeholder="Ex: Doctorat, Master 2..."
                    value={formData.degree}
                    onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                    className="w-full h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 text-xs font-medium"
                  />
                  <datalist id="degrees-list">
                    {PRESET_DEGREES.map((d, i) => (
                      <option key={i} value={d} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date de Début / Recrutement *</Label>
                  <Input 
                    type="date"
                    value={formData.recruitmentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, recruitmentDate: e.target.value }))}
                    className="h-10 rounded-xl bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Spécialité Principale</Label>
                  <Input 
                    placeholder="Ex: Génie Logiciel & IA" 
                    value={formData.mainSpecialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, mainSpecialty: e.target.value }))}
                    className="h-10 rounded-xl bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Assigned Classes (CRITICAL USER REQUIREMENT) */}
            <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-indigo-600" /> Classes où l'Enseignant est Présent
                </h4>
                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md">
                  {formData.assignedClasses.length} classe(s) sélectionnée(s)
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                Cochez ou cliquez sur les classes dans lesquelles cet enseignant intervient. Les données seront directement synchronisées avec la gestion des classes et le planning.
              </p>

              {/* Class pills toggle list */}
              <div className="flex flex-wrap gap-2 pt-2">
                {classesList.map((cls) => {
                  const label = `${cls.code} - ${cls.name}`;
                  const isSelected = formData.assignedClasses.includes(label) || formData.assignedClasses.includes(cls.code) || formData.assignedClasses.includes(cls.name);
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => toggleClassAssignment(label)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border",
                        isSelected 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                      )}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{cls.code} ({cls.name})</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom class adder */}
              <div className="flex items-center gap-2 pt-2">
                <Input 
                  placeholder="Ou ajouter un nom de classe personnalisé..."
                  value={customClassInput}
                  onChange={(e) => setCustomClassInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomClass(); } }}
                  className="h-9 rounded-xl bg-white dark:bg-slate-900 text-xs"
                />
                <Button 
                  type="button" 
                  onClick={handleAddCustomClass}
                  variant="outline"
                  className="h-9 px-4 rounded-xl text-xs font-bold shrink-0 border-indigo-200"
                >
                  Ajouter
                </Button>
              </div>

              {/* Selected classes badges */}
              {formData.assignedClasses.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-indigo-100/60 dark:border-indigo-900/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase self-center">Classes retenues :</span>
                  {formData.assignedClasses.map((ac, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-600 text-white"
                    >
                      {ac}
                      <button 
                        type="button" 
                        onClick={() => toggleClassAssignment(ac)} 
                        className="hover:text-red-200 ml-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ENSEIGNANT TITULAIRE DESIGNATION SECTION */}
            <div className="space-y-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                    ⭐
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-tight">
                      Statut Enseignant Titulaire (Responsable de Promotion)
                    </h4>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-medium">
                      Autorise l'enseignant à créer et publier les Sessions Normales (NM) et à délibérer les notes.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isTitulaire} 
                    onChange={(e) => setFormData(prev => ({ ...prev, isTitulaire: e.target.checked }))} 
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {formData.isTitulaire && (
                <div className="pt-2 border-t border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
                      Promotions & Salles dont cet enseignant est Titulaire (Cumul Multi-Salles) :
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        const allCodes = allClassesList.map(c => c.code || c.name);
                        setFormData(prev => ({
                          ...prev,
                          titulaireClasses: prev.titulaireClasses.length === allCodes.length ? [] : allCodes
                        }));
                      }}
                      className="text-[10px] font-black text-amber-600 hover:underline uppercase cursor-pointer"
                    >
                      {formData.titulaireClasses.length === allClassesList.length ? 'Désélectionner Tout' : 'Tout Sélectionner'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set([...allClassesList.map(c => c.code || c.name), 'Tous'])).map((pCode) => {
                      const isAssignedTitulaire = formData.titulaireClasses.includes(pCode);
                      return (
                        <button
                          key={pCode}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              titulaireClasses: isAssignedTitulaire
                                ? prev.titulaireClasses.filter(c => c !== pCode)
                                : [...prev.titulaireClasses, pCode]
                            }));
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5",
                            isAssignedTitulaire
                              ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-amber-200 hover:border-amber-400"
                          )}
                        >
                          {isAssignedTitulaire && <Check className="w-3.5 h-3.5" />}
                          <span>Salle / Promo {pCode}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Titulaire Class Code */}
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      placeholder="Ajouter un code personnalisé (ex: L3-GL, BAT-1)..."
                      value={customTitulaireInput}
                      onChange={(e) => setCustomTitulaireInput(e.target.value)}
                      className="h-9 text-xs bg-white dark:bg-slate-800 border-amber-200"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (customTitulaireInput.trim() && !formData.titulaireClasses.includes(customTitulaireInput.trim())) {
                          setFormData(prev => ({
                            ...prev,
                            titulaireClasses: [...prev.titulaireClasses, customTitulaireInput.trim()]
                          }));
                          setCustomTitulaireInput('');
                        }
                      }}
                      className="h-9 px-4 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shrink-0 cursor-pointer"
                    >
                      Ajouter Salle
                    </Button>
                  </div>

                  {formData.titulaireClasses.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between">
                      <span>Récapitulatif des salles titulaire ({formData.titulaireClasses.length}) :</span>
                      <span className="font-black text-amber-600">{formData.titulaireClasses.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl font-bold text-xs h-11 px-6 border-slate-200"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="rounded-xl font-black text-xs h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              >
                {saving ? "Sauvegarde en cours..." : (editingTeacher ? "Enregistrer les modifications" : "Créer l'enseignant")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- DETAIL DRAWER / DIALOG --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-4xl md:max-w-5xl max-h-[92vh] overflow-y-auto p-0 border-none bg-slate-50 dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl">
          {selectedTeacher && (
            <div className="relative">
              {/* Profile Header Banner */}
              <div className="h-24 md:h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10">
                  <BookOpen className="w-24 h-24 md:w-32 md:h-32 rotate-12" />
                </div>
              </div>
              
              <div className="px-4 md:px-8 -mt-10 md:-mt-12 relative z-10 space-y-6 pb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 text-center md:text-left">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-slate-50 shadow-xl">
                      <AvatarImage src={selectedTeacher.avatar} />
                      <AvatarFallback>{selectedTeacher.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="pb-0 md:pb-2">
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{selectedTeacher.name}</h2>
                        <Badge className="bg-emerald-500 text-white border-none text-[8px] md:text-[10px] font-black uppercase whitespace-nowrap">Vérifié</Badge>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px] md:text-sm flex items-center justify-center md:justify-start gap-2">
                        <Briefcase className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                        {selectedTeacher.function} • {selectedTeacher.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pb-0 md:pb-2 w-full md:w-auto">
                    <Button 
                      onClick={() => {
                        setIsDetailOpen(false);
                        handleOpenEdit(selectedTeacher);
                      }}
                      className="flex-1 md:flex-none h-11 px-6 rounded-xl bg-blue-600 text-white font-black flex gap-2 text-xs shadow-lg shadow-blue-500/20"
                    >
                      <Pencil className="w-4 h-4" /> Modifier le Profil
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="outline" className="h-11 w-11 p-0 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                      }>
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="rounded-xl p-2 w-48 shadow-xl">
                        <DropdownMenuItem onClick={() => handleStatusChange(selectedTeacher.id, selectedTeacher.status === 'Actif' ? 'Inactif' : 'Actif')} className="gap-2 font-bold text-xs cursor-pointer">
                          <Settings className="w-4 h-4 text-slate-400" /> Changer Statut ({selectedTeacher.status})
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteTeacher(selectedTeacher.id)} className="gap-2 font-bold text-xs text-red-600 cursor-pointer">
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <div className="overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    <TabsList className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex min-w-max md:min-w-0 md:w-auto">
                      <TabsTrigger value="overview" className="flex-1 md:flex-none gap-2 font-black text-[9px] md:text-[10px] uppercase tracking-widest px-4 md:px-6 py-2.5">
                        Vue d'ensemble
                      </TabsTrigger>
                      <TabsTrigger value="classes" className="flex-1 md:flex-none gap-2 font-black text-[9px] md:text-[10px] uppercase tracking-widest px-4 md:px-6 py-2.5">
                        Classes & Enseignement
                      </TabsTrigger>
                      <TabsTrigger value="curriculum" className="flex-1 md:flex-none gap-2 font-black text-[9px] md:text-[10px] uppercase tracking-widest px-4 md:px-6 py-2.5">
                        Programme
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="overview" className="mt-6 space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      {/* Personal Info */}
                      <Card className="border-none shadow-sm bg-white dark:bg-slate-800/80 p-5 md:p-6 space-y-6 rounded-3xl">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bio & Recrutement</h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase">Formation / Niveau</p>
                              <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate">{selectedTeacher.degree || "Doctorat"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0">
                              <CalendarIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase">Date de Prise de Poste</p>
                              <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate">{selectedTeacher.recruitmentDate || "Non définie"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 shrink-0">
                              <Award className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase">Spécialité Principale</p>
                              <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate">{selectedTeacher.mainSpecialty || "Génie Logiciel"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase">E-mail Professionnel</p>
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedTeacher.email}</p>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Content Metrics */}
                      <Card className="border-none shadow-sm bg-white dark:bg-slate-800/80 p-5 md:p-6 md:col-span-2 rounded-3xl">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Charge Pédagogique & Activités</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6">
                          <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-blue-600 hover:text-white transition-all duration-300">
                            <Video className="w-5 h-5 md:w-6 md:h-6 mb-2 text-blue-600 group-hover:text-white" />
                            <p className="text-xl md:text-2xl font-black">{selectedTeacher.metrics?.videos || 0}</p>
                            <p className="text-[8px] md:text-[9px] font-bold uppercase">Vidéos</p>
                          </div>
                          <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-emerald-600 hover:text-white transition-all duration-300">
                            <FileText className="w-5 h-5 md:w-6 md:h-6 mb-2 text-emerald-600 group-hover:text-white" />
                            <p className="text-xl md:text-2xl font-black">{selectedTeacher.metrics?.pdfs || 0}</p>
                            <p className="text-[8px] md:text-[9px] font-bold uppercase">Docs</p>
                          </div>
                          <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-amber-600 hover:text-white transition-all duration-300">
                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mb-2 text-amber-600 group-hover:text-white" />
                            <p className="text-xl md:text-2xl font-black">{selectedTeacher.metrics?.quizzes || 0}</p>
                            <p className="text-[8px] md:text-[9px] font-bold uppercase">Quiz</p>
                          </div>
                          <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-purple-600 hover:text-white transition-all duration-300">
                            <School className="w-5 h-5 md:w-6 md:h-6 mb-2 text-purple-600 group-hover:text-white" />
                            <p className="text-xl md:text-2xl font-black">{getTeacherClasses(selectedTeacher).length}</p>
                            <p className="text-[8px] md:text-[9px] font-bold uppercase">Classes</p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Performance Analysis Graph */}
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-800/80 p-5 md:p-6 overflow-hidden rounded-3xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Indice de Qualité</h4>
                          <p className="text-base md:text-xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">Activité hebdomadaire</p>
                        </div>
                        <div className="flex items-center gap-4 md:gap-6">
                          <div className="text-right">
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">Progression</p>
                            <p className="text-base md:text-lg font-black text-blue-600">{selectedTeacher.progress || 0}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">Score Perf.</p>
                            <p className="text-base md:text-lg font-black text-emerald-600">{selectedTeacher.performanceScore || 85}</p>
                          </div>
                        </div>
                      </div>
                      <div className="h-[200px] md:h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={selectedTeacher.performanceHistory || performanceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                              {(selectedTeacher.performanceHistory || performanceData).map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.value > 60 ? '#3b82f6' : '#94a3b8'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Tab Classes */}
                  <TabsContent value="classes" className="mt-6 space-y-4">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-800/80 p-5 md:p-6 rounded-3xl">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Classes attribuées & Présence</h4>
                        <Button onClick={() => { setIsDetailOpen(false); handleOpenEdit(selectedTeacher); }} size="sm" className="bg-indigo-600 text-white rounded-xl text-xs font-bold">
                          Modifier les classes
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getTeacherClasses(selectedTeacher).map((cName: string, idx: number) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-black">
                                🏫
                              </div>
                              <div>
                                <p className="font-black text-slate-900 dark:text-white text-sm">{cName}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Enseignant référent / Intervenant</p>
                              </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-none font-bold text-[9px]">
                              Présent
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="curriculum" className="mt-6 space-y-4 md:space-y-6">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-800/80 p-5 md:p-6 rounded-3xl">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Modules & Avancement Réel</h4>
                      <div className="space-y-8">
                        {selectedTeacher.modules?.map((mod: any, idx: number) => (
                          <div key={idx} className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs md:text-sm shrink-0">
                                  {idx + 1}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="font-black text-slate-900 dark:text-white text-sm md:text-base truncate">{mod.name}</h5>
                                  <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase">{mod.completed || 0} / {mod.lessons || 10} Leçons Complétées</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-4">
                                <div className="text-right">
                                  <p className="text-lg md:text-xl font-black text-blue-600">{mod.progress || 0}%</p>
                                </div>
                              </div>
                            </div>
                            <Progress value={mod.progress || 0} className="h-2 md:h-2.5 bg-slate-100 dark:bg-slate-800" />
                          </div>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- QUICK ASSIGN TITULAIRE MODAL --- */}
      <Dialog open={!!quickAssignClass} onOpenChange={(open) => !open && setQuickAssignClass(null)}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-lg p-6 bg-white dark:bg-slate-900 rounded-3xl border-none shadow-2xl space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-xl">⭐</span> Affectation Enseignant Titulaire
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500">
              Désignez l'enseignant responsable pour la salle sélectionnée afin d'autoriser les délibérations et bulletins de fin d'année.
            </DialogDescription>
          </DialogHeader>

          {quickAssignClass && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/30">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300">Salle / Filière à Pourvoir</p>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">{quickAssignClass.code} — {quickAssignClass.name}</h4>
                  </div>
                  <Badge className="bg-amber-500 text-white font-black text-[10px] shrink-0">
                    Sans Titulaire
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Choisir un Enseignant du Corps Pédagogique :
                </Label>
                <select
                  value={selectedQuickTeacherId}
                  onChange={(e) => setSelectedQuickTeacherId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.mainSpecialty || t.department}) {t.isTitulaire ? `— Titulaire actuel: ${Array.isArray(t.titulaireClasses) && t.titulaireClasses.length > 0 ? t.titulaireClasses.join(', ') : 'Général'}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected teacher preview */}
              {selectedQuickTeacherId && (() => {
                const tObj = teachers.find(t => t.id === selectedQuickTeacherId);
                if (!tObj) return null;
                const existing = Array.isArray(tObj.titulaireClasses) ? tObj.titulaireClasses : [];
                return (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-extrabold text-slate-900 dark:text-white">
                      <span>{tObj.name}</span>
                      <Badge className="bg-blue-600 text-white text-[9px] font-black">{tObj.function || 'Enseignant'}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Salles actuellement titulaire : <strong className="text-amber-600">{existing.length > 0 ? existing.join(', ') : 'Aucune salle affectée'}</strong>
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> La salle {quickAssignClass.code} sera ajoutée à sa liste (Cumul Multi-Salles).
                    </p>
                  </div>
                );
              })()}

              <DialogFooter className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setQuickAssignClass(null)}
                  className="rounded-xl font-bold text-xs h-11 px-5 border-slate-200"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveQuickAssign}
                  disabled={saving}
                  className="rounded-xl font-black text-xs h-11 px-6 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {saving ? "Affectation..." : "⭐ Affecter comme Titulaire"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
