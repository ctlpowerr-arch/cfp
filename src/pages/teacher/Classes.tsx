import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Users, 
  Building2, 
  Layers, 
  Calendar, 
  BookOpen, 
  Search, 
  ChevronRight, 
  Sparkles, 
  UserCheck, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import RollCallModal from '@/components/teacher/RollCallModal';

interface ClassItem {
  id: string;
  code: string;
  name: string;
  level: string;
  room: string;
  capacity: number;
  studentCount?: number;
  academicYear: string;
  filières: string[];
  description?: string;
  assignedTeacherIds?: string[];
  assignedTeachers?: string[];
}

export default function TeacherClassesPage() {
  const { currentAcademicYear } = useAcademicYear();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<any>(null);
  const [myClasses, setMyClasses] = useState<ClassItem[]>([]);
  const [scheduleSessions, setScheduleSessions] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassModal, setSelectedClassModal] = useState<ClassItem | null>(null);
  const [rollCallClass, setRollCallClass] = useState<ClassItem | null>(null);

  useEffect(() => {
    // Read logged-in teacher info
    const stored = localStorage.getItem('teacherData');
    if (stored) {
      try {
        setTeacher(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (!teacher) return;
    fetchTeacherClasses();
  }, [teacher, currentAcademicYear]);

  const fetchTeacherClasses = async () => {
    setLoading(true);
    try {
      const yearQuery = currentAcademicYear?.name ? `academicYear=${currentAcademicYear.name}` : '';
      const tId = teacher.id || 'demo_teacher';
      const tEmail = teacher.email || 'demo@itmc-it.cm';

      const [clsRes, schRes, stdRes] = await Promise.all([
        fetch(`/api/classes?teacherId=${tId}&teacherEmail=${tEmail}&${yearQuery}`),
        fetch(`/api/schedule?teacherId=${tId}&teacherEmail=${tEmail}&${yearQuery}`),
        fetch(`/api/students?${yearQuery}`)
      ]);

      if (clsRes.ok) {
        const clsData = await clsRes.json();
        setMyClasses(clsData);
      }
      if (schRes.ok) {
        const schData = await schRes.json();
        setScheduleSessions(schData);
      }
      if (stdRes.ok) {
        const stdData = await stdRes.json();
        setStudentsList(stdData);
      }
    } catch (err) {
      toast.error("Erreur de chargement de vos classes");
    } finally {
      setLoading(false);
    }
  };

  // Filtered classes list
  const filteredClasses = myClasses.filter(cls => {
    const query = searchQuery.toLowerCase();
    return (
      cls.name.toLowerCase().includes(query) ||
      cls.code.toLowerCase().includes(query) ||
      (cls.filières || []).some(f => f.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-400">Année : {currentAcademicYear?.name}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Mes Classes & Filières Tuteurées
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visualisation des classes dans lesquelles vous intervenez et des filières associées.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate('/teacher/schedule')}
            variant="outline"
            className="h-11 px-4 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            Mon Planning de Cours
          </Button>
        </div>
      </div>

      {/* Teacher Profile Banner */}
      <Card className="p-5 rounded-3xl border-none bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shrink-0">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">{teacher?.name || "Enseignant"}</h2>
              <p className="text-xs font-bold text-blue-100 mt-0.5">
                {teacher?.function || "Professeur"} • {teacher?.department || "Département Informatique"}
              </p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-200" />
            <span>{myClasses.length} classe(s) sous votre tutorat</span>
          </div>
        </div>
      </Card>

      {/* Search Bar */}
      <Card className="rounded-2xl border-none bg-white dark:bg-slate-900 p-4 shadow-xl shadow-slate-100 dark:shadow-none">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer mes classes ou filières d'intervention..."
            className="pl-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold"
          />
        </div>
      </Card>

      {/* Classes Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chargement de vos classes d'intervention...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-800 dark:text-white">Aucune classe assignée</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Vous n'avez pas encore de séance programmée ni de classe attribuée pour cette année académique.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => {
            // Find schedule sessions for this class taught by this teacher
            const classSessions = scheduleSessions.filter(s => s.classCode === cls.code || s.classCode === cls.id);
            // Filter students in this promo or class
            const classStudents = studentsList.filter(st => 
              st.classCode === cls.code || 
              st.promo === cls.code || 
              st.classCode === cls.id || 
              (cls.code.includes('-') && st.promo === cls.code.split('-')[0])
            );

            return (
              <motion.div key={cls.id} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="rounded-3xl border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-100 dark:shadow-none hover:shadow-2xl transition-all overflow-hidden flex flex-col h-full border border-slate-100 dark:border-slate-800">
                  <div className="p-6 space-y-4 flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                            {cls.code}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {cls.level}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                          {cls.name}
                        </h3>
                      </div>
                    </div>

                    {/* Integrated Filières */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-500" />
                        Filières de cette classe ({cls.filières?.length || 0}) :
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cls.filières && cls.filières.map((f, idx) => (
                          <span 
                            key={idx}
                            className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900"
                          >
                            🏷️ {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Details: Room & Student count */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-blue-500" />
                          Salle de cours
                        </p>
                        <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{cls.room || 'Salle A'}</p>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-500" />
                          Effectif
                        </p>
                        <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                          {classStudents.length > 0 ? classStudents.length : (cls.studentCount || 30)} étudiants
                        </p>
                      </div>
                    </div>

                    {/* My Sessions in this class */}
                    <div className="pt-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        Mes séances au planning ({classSessions.length}) :
                      </p>
                      {classSessions.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Aucune séance hebdomadaire configurée</p>
                      ) : (
                        <div className="space-y-1">
                          {classSessions.slice(0, 3).map((sess, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] font-bold flex items-center justify-between">
                              <span className="text-slate-800 dark:text-slate-200">{sess.subject}</span>
                              <span className="text-blue-600 dark:text-blue-400">{sess.day} à {sess.hour}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                    <Button 
                      onClick={() => setSelectedClassModal(cls)}
                      variant="ghost"
                      size="sm"
                      className="text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 cursor-pointer"
                    >
                      Détails ({classStudents.length})
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button 
                        onClick={() => setRollCallClass(cls)}
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 rounded-xl border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40 hover:bg-emerald-100 font-bold text-[11px] cursor-pointer flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Émarger
                      </Button>

                      <Button 
                        onClick={() => navigate('/teacher/schedule')}
                        size="sm"
                        className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer flex items-center gap-1"
                      >
                        Planning <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Class Details & Roster Modal */}
      <Dialog open={!!selectedClassModal} onOpenChange={() => setSelectedClassModal(null)}>
        {selectedClassModal && (
          <DialogContent className="w-[calc(100vw-1.25rem)] max-w-2xl rounded-[2.5rem] border-none p-6 md:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black">
                  {selectedClassModal.code}
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-200 font-bold">
                  {selectedClassModal.level}
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
                {selectedClassModal.name}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Filières : {selectedClassModal.filières?.join(' • ')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Liste des étudiants inscrits dans la classe
                </h4>
                <Button
                  size="sm"
                  onClick={() => {
                    const target = selectedClassModal;
                    setSelectedClassModal(null);
                    setRollCallClass(target);
                  }}
                  className="h-7 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                >
                  <UserCheck className="w-3 h-3" /> Ouvrir l'Émargement
                </Button>
              </div>

              {(() => {
                const roster = studentsList.filter(s => 
                  s.classCode === selectedClassModal.code || 
                  s.promo === selectedClassModal.code || 
                  s.classCode === selectedClassModal.id || 
                  (selectedClassModal.code.includes('-') && s.promo === selectedClassModal.code.split('-')[0])
                );
                if (roster.length === 0) {
                  return (
                    <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs font-bold">
                      Aucun étudiant directement enregistré dans cette promotion pour l'instant.
                    </div>
                  );
                }
                return (
                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {roster.map((student) => (
                      <div key={student.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{student.email} • {student.phone || 'N/A'}</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                          Moyenne: {student.lastGrade || '15/20'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Interactive Roll Call & Attendance Modal */}
      <RollCallModal
        isOpen={!!rollCallClass}
        onClose={() => setRollCallClass(null)}
        session={rollCallClass}
        teacher={teacher}
        onSuccess={fetchTeacherClasses}
      />
    </div>
  );
}
