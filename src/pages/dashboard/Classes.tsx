import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Users, 
  Building2, 
  Sparkles, 
  BookOpen, 
  ChevronRight, 
  Check, 
  X, 
  Layers, 
  UserCheck, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModernSelect } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { defaultSpecialties } from '@/data/specialtiesData';

interface ClassItem {
  id: string;
  code: string;
  name: string;
  level: string;
  room: string;
  capacity: number;
  studentCount?: number;
  students?: any[];
  academicYear: string;
  filières: string[];
  description?: string;
  assignedTeacherIds?: string[];
  assignedTeachers?: string[];
}

const ALL_SPECIALTIES = defaultSpecialties.map(s => s.name);

const LEVELS = [
  "Licence 1",
  "Licence 2",
  "Licence 3",
  "Master 1",
  "Master 2",
  "BTS 1",
  "BTS 2",
  "DQP"
];

export default function AdminClassesPage() {
  const { currentAcademicYear } = useAcademicYear();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedFiliere, setSelectedFiliere] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [selectedClassForRoster, setSelectedClassForRoster] = useState<ClassItem | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('Licence 1');
  const [room, setRoom] = useState('Amphi A');
  const [capacity, setCapacity] = useState('50');
  const [filières, setFilières] = useState<string[]>(['Génie Logiciel']);
  const [customFiliere, setCustomFiliere] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTeacherIds, setAssignedTeacherIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [currentAcademicYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const yearQuery = currentAcademicYear?.name ? `?academicYear=${currentAcademicYear.name}` : '';
      const [clsRes, tchRes] = await Promise.all([
        fetch(`/api/classes${yearQuery}`),
        fetch(`/api/teachers${yearQuery}`)
      ]);

      if (clsRes.ok) {
        const data = await clsRes.json();
        setClasses(data);
      }
      if (tchRes.ok) {
        const tData = await tchRes.json();
        setTeachers(tData);
      }
    } catch (err) {
      toast.error("Erreur de chargement des classes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingClass(null);
    setCode('');
    setName('');
    setLevel('Licence 1');
    setRoom('Amphi Turing');
    setCapacity('50');
    setFilières(['Génie Logiciel']);
    setCustomFiliere('');
    setDescription('');
    setAssignedTeacherIds(['demo_teacher']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setEditingClass(cls);
    setCode(cls.code);
    setName(cls.name);
    setLevel(cls.level || 'Licence 1');
    setRoom(cls.room || 'Salle A');
    setCapacity(String(cls.capacity || 50));
    setFilières(Array.isArray(cls.filières) && cls.filières.length > 0 ? cls.filières : ['Génie Logiciel']);
    setCustomFiliere('');
    setDescription(cls.description || '');
    setAssignedTeacherIds(cls.assignedTeacherIds || []);
    setIsModalOpen(true);
  };

  const toggleFiliere = (f: string) => {
    if (filières.includes(f)) {
      if (filières.length === 1) {
        toast.warning("Une classe doit contenir au moins une filière.");
        return;
      }
      setFilières(filières.filter(item => item !== f));
    } else {
      setFilières([...filières, f]);
    }
  };

  const handleAddCustomFiliere = () => {
    if (!customFiliere.trim()) return;
    const clean = customFiliere.trim();
    if (filières.includes(clean)) {
      toast.info("Filière déjà ajoutée");
      setCustomFiliere('');
      return;
    }
    setFilières([...filières, clean]);
    setCustomFiliere('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      toast.error("Le code et le nom de la classe sont requis.");
      return;
    }

    const assignedTeachers = teachers
      .filter(t => assignedTeacherIds.includes(t.id))
      .map(t => t.name);

    const payload = {
      code: code.trim(),
      name: name.trim(),
      level,
      room,
      capacity: Number(capacity) || 50,
      filières,
      description,
      assignedTeacherIds,
      assignedTeachers,
      academicYear: currentAcademicYear?.name || "2026-2027"
    };

    try {
      let res;
      if (editingClass) {
        res = await fetch(`/api/classes/${editingClass.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        toast.success(editingClass ? "Classe mise à jour !" : "Nouvelle classe créée avec ses filières !");
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur d'enregistrement");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    }
  };

  const handleDelete = async (id: string, codeStr: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la classe ${codeStr} ?`)) return;

    try {
      const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Classe ${codeStr} supprimée`);
        fetchData();
      } else {
        toast.error("Échec de la suppression");
      }
    } catch (err) {
      toast.error("Erreur de suppression");
    }
  };

  // Extract all unique filières across 35 ITMC specialties + classes
  const allUniqueFilieres = Array.from(
    new Set([
      ...ALL_SPECIALTIES,
      ...classes.flatMap(c => c.filières || [])
    ])
  );

  // Filtered classes list
  const filteredClasses = classes.filter(cls => {
    const matchesQuery = 
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.filières || []).some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = selectedLevel === 'all' || cls.level === selectedLevel;
    const matchesFiliere = selectedFiliere === 'all' || (cls.filières || []).includes(selectedFiliere);

    return matchesQuery && matchesLevel && matchesFiliere;
  });

  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0);
  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Structure Académique
            </span>
            <span className="text-xs font-bold text-slate-400">• Année : {currentAcademicYear?.name}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Gestion des Classes & Filières
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Création des classes multi-filières, affectation des salles et répartition des enseignants.
          </p>
        </div>

        <Button 
          onClick={handleOpenAdd}
          className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Créer une Classe
        </Button>
      </div>

      {/* Info Banner on Class & Filières Architecture */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-100 dark:border-slate-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">
            Architecture Pédagogique Multi-Filières :
          </p>
          <p>
            Chaque classe (ex: <span className="font-bold text-blue-600 dark:text-blue-400">G1</span>, <span className="font-bold text-blue-600 dark:text-blue-400">L3-GL</span>) est configurée par le Super Admin pour regrouper <strong>une ou plusieurs filières d'études</strong> (ex: Génie Logiciel, Cyber-sécurité, IA). Les plannings et enseignants s'y adaptent automatiquement.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-100 dark:shadow-none p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Classes</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{classes.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-100 dark:shadow-none p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Filières Couvertes</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{allUniqueFilieres.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-100 dark:shadow-none p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Capacité d'accueil</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalCapacity} places</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-100 dark:shadow-none p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Corps Enseignant</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{teachers.length} profs</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="rounded-2xl border-none bg-white dark:bg-slate-900 p-4 shadow-xl shadow-slate-100 dark:shadow-none space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher classe, code ou filière..."
              className="pl-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold"
            />
          </div>

          {/* Level Filter */}
          <ModernSelect 
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">🎓 Tous les Niveaux Académiques</option>
            {LEVELS.map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </ModernSelect>

          {/* Filière Filter */}
          <ModernSelect 
            value={selectedFiliere}
            onChange={(e) => setSelectedFiliere(e.target.value)}
            className="h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">🏷️ Toutes les Filières</option>
            {allUniqueFilieres.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </ModernSelect>
        </div>
      </Card>

      {/* Classes Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chargement des classes...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-800 dark:text-white">Aucune classe trouvée</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Aucune classe ne correspond à vos filtres actuels. Cliquez sur "Créer une classe" pour ajouter une classe multi-filières.
          </p>
          <Button 
            onClick={handleOpenAdd}
            className="mt-4 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            Créer une classe maintenant
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredClasses.map((cls) => {
            const teacherNames = cls.assignedTeachers && cls.assignedTeachers.length > 0 
              ? cls.assignedTeachers 
              : ["Enseignant référent non assigné"];

            return (
              <motion.div key={cls.id} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="rounded-3xl border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-100 dark:shadow-none hover:shadow-2xl transition-all overflow-hidden flex flex-col h-full border border-slate-100 dark:border-slate-800">
                  <div className="p-4 sm:p-6 space-y-4 flex-1">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-900 shrink-0">
                            {cls.code}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                            {cls.level}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug break-words">
                          {cls.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => handleOpenEdit(cls)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all cursor-pointer"
                          title="Modifier la classe et ses filières"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(cls.id, cls.code)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/40 text-slate-600 dark:text-slate-300 hover:text-red-600 transition-all cursor-pointer"
                          title="Supprimer la classe"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Integrated Filières */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        Filières Intégrées ({cls.filières?.length || 0}) :
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cls.filières && cls.filières.map((f, idx) => (
                          <span 
                            key={idx}
                            className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 max-w-full break-words"
                          >
                            🏷️ {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Details: Room, Capacity & Real Enrolled Students */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 min-w-0">
                        <p className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1 whitespace-nowrap">
                          <Building2 className="w-3 h-3 text-blue-500 shrink-0" />
                          Salle de cours
                        </p>
                        <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 truncate">{cls.room || 'Non assignée'}</p>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 min-w-0 border border-blue-100 dark:border-blue-900/40">
                        <p className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1 whitespace-nowrap">
                          <Users className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                          Effectif Actuel
                        </p>
                        <p className="text-xs font-black text-blue-900 dark:text-blue-200 mt-0.5">
                          {cls.studentCount || (cls.students?.length) || 0} / {cls.capacity || 50} apprenants
                        </p>
                      </div>
                    </div>

                    {/* View Enrolled Students Action */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedClassForRoster(cls)}
                      className="w-full h-9 rounded-xl border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-100/60 text-blue-700 dark:text-blue-300 font-bold text-xs gap-2"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Voir les {cls.studentCount || (cls.students?.length) || 0} étudiants inscrits
                    </Button>

                    {/* Teachers List */}
                    <div className="pt-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                        Enseignants intervenants :
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {teacherNames.map((tn, idx) => (
                          <span key={idx} className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 max-w-full truncate flex items-center gap-1">
                            <span>👤</span> <span className="truncate">{tn}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {cls.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic pt-1">
                        "{cls.description}"
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Code : {cls.code}</span>
                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      Multi-filières actives <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog for Adding/Editing Class */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-xl rounded-[2.5rem] border-none p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
              {editingClass ? "Modifier la classe" : "Créer une nouvelle classe multi-filières"}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Configuration académique par le Super Admin
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Code de la classe *
                </label>
                <Input 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ex: G1, L3-GL, BTS2"
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Niveau Académique
                </label>
                <ModernSelect 
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-slate-800 dark:text-white outline-none"
                >
                  {LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </ModernSelect>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                Nom complet de la classe *
              </label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: G1 - Cycle Ingénieur 1ère Année"
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Salle principale
                </label>
                <Input 
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Ex: Amphi Turing, Labo Info 1"
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Capacité (places)
                </label>
                <Input 
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="50"
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                />
              </div>
            </div>

            {/* Multi-filière Selector Section */}
            <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                  <span>Filières associées à cette classe (Toutes les 39 Spécialités ITMC) *</span>
                  <Badge variant="outline" className="text-[10px] bg-white dark:bg-slate-900 font-bold border-indigo-200">
                    {filières.length} sélectionnée(s)
                  </Badge>
                </label>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-300 mt-0.5">
                  Sélectionnez les filières d'études dispensées dans cette classe parmi nos 35 spécialités :
                </p>
              </div>

              {/* All 35 Specialties Badges in scrollable grid */}
              <div className="max-h-48 overflow-y-auto custom-scrollbar p-2 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex flex-wrap gap-1.5">
                  {ALL_SPECIALTIES.map((f) => {
                    const isSelected = filières.includes(f);
                    return (
                      <button
                        type="button"
                        key={f}
                        onClick={() => toggleFiliere(f)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border",
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                        )}
                      >
                        {isSelected ? <Check className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3 text-slate-400" />}
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Filière Input */}
              <div className="flex items-center gap-2 pt-1">
                <Input 
                  value={customFiliere}
                  onChange={(e) => setCustomFiliere(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomFiliere(); } }}
                  placeholder="Ou saisir une autre filière personnalisée..."
                  className="h-9 text-xs rounded-xl bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800"
                />
                <Button 
                  type="button"
                  onClick={handleAddCustomFiliere}
                  className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer"
                >
                  Ajouter
                </Button>
              </div>

              {/* Selected Filières Summary Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {filières.map((f, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-black flex items-center gap-1 shadow-sm">
                    🏷️ {f}
                    <button type="button" onClick={() => toggleFiliere(f)} className="hover:text-red-200 cursor-pointer ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Assign Teachers */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                Enseignants affectés à cette classe
              </label>
              <div className="max-h-36 overflow-y-auto custom-scrollbar p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 space-y-1">
                {teachers.map((t) => {
                  const isChecked = assignedTeacherIds.includes(t.id);
                  return (
                    <label key={t.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{t.name} ({t.mainSpecialty || t.department})</span>
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedTeacherIds([...assignedTeacherIds, t.id]);
                          } else {
                            setAssignedTeacherIds(assignedTeacherIds.filter(id => id !== t.id));
                          }
                        }}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                Description / Notes Pédagogiques
              </label>
              <Input 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Option ingénierie logicielle et intelligence artificielle"
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl cursor-pointer"
            >
              {editingClass ? "Enregistrer les modifications" : "Valider et Créer la Classe"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog for Enrolled Students in this Class */}
      <Dialog open={!!selectedClassForRoster} onOpenChange={(open) => !open && setSelectedClassForRoster(null)}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-2xl rounded-[2.5rem] border-none p-6 md:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white font-mono text-xs">
                {selectedClassForRoster?.code}
              </Badge>
              <span className="text-xs text-slate-400 font-semibold">• {selectedClassForRoster?.level}</span>
            </div>
            <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Liste des Étudiants — {selectedClassForRoster?.name}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-slate-500">
              Salle {selectedClassForRoster?.room || 'Labo'} • Effectif vérifié : {selectedClassForRoster?.studentCount || selectedClassForRoster?.students?.length || 0} apprenant(s)
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            {(!selectedClassForRoster?.students || selectedClassForRoster.students.length === 0) ? (
              <div className="text-center py-10 border border-dashed rounded-2xl p-6">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucun étudiant encore assigné à cette classe</p>
                <p className="text-xs text-slate-400 mt-1">Les étudiants inscrits via le portail ou le fichier des apprenants s'afficheront ici en direct.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                {selectedClassForRoster.students.map((student: any) => (
                  <div key={student.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
                        {student.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {student.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {student.email} • {student.phone}
                        </p>
                        <span className="inline-block text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          {student.specialty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div className="hidden sm:block">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Assiduité</p>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">{student.attendance || 95}%</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-bold px-2 py-0.5",
                        student.status === 'Actif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        student.status === 'En attente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      )}>
                        {student.status || 'Actif'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button 
                onClick={() => setSelectedClassForRoster(null)}
                className="bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs rounded-xl px-5 h-10"
              >
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
