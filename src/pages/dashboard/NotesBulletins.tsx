import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, 
  GraduationCap, 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Award,
  Users,
  Calendar,
  Filter,
  RefreshCw,
  Sliders,
  ChevronRight,
  BookMarked,
  Printer,
  Download,
  CheckSquare,
  Sparkles,
  Layers,
  Building2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { useAuth } from '@/context/AuthContext';
import OfficialTranscriptModal, { 
  OfficialBulletinSheet 
} from '@/components/OfficialTranscriptModal';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { defaultSpecialties } from "@/data/specialtiesData";
import {
  Composition,
  StudentGrade,
  CATEGORIES_FILIERES,
  getCategoryIdForFiliereString,
  doesSpecialtyMatchStudentOrClass,
  getStudentBulletinData,
  BULLETIN_PRINT_SCOPED_CSS
} from './notesBulletinsHelpers';

export default function NotesBulletins() {
  const { user } = useAuth();
  const { selectedYear } = useAcademicYear();

  // Active Tab: evaluations | notes | bulletins
  const [activeTab, setActiveTab] = useState<string>('evaluations');

  // Core Data Lists
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [normalesList, setNormalesList] = useState<any[]>([]);
  const [modulesList, setModulesList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Global & Tab Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedNormaleFilter, setSelectedNormaleFilter] = useState<string>('all');

  // Grading Tab State
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [gradingGrades, setGradingGrades] = useState<StudentGrade[]>([]);
  const [savingGrades, setSavingGrades] = useState<boolean>(false);

  // Bulletins Tab State
  const [bulletinStudentId, setBulletinStudentId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [transcriptStudent, setTranscriptStudent] = useState<any | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingComp, setEditingComp] = useState<Composition | null>(null);

  // Create Evaluation Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newType, setNewType] = useState<'CC' | 'TD' | 'Composition Normale' | 'Rattrapage'>('CC');
  const [newClassCode, setNewClassCode] = useState<string>('G1-GL');
  const [newSubject, setNewSubject] = useState<string>('');
  const [newTeacherName, setNewTeacherName] = useState<string>('');
  const [newNormaleId, setNewNormaleId] = useState<string>('none');
  const [newCoefficient, setNewCoefficient] = useState<number>(3);
  const [newMaxScore, setNewMaxScore] = useState<number>(20);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [compsRes, studentsRes, classesRes, normalesRes, modulesRes] = await Promise.all([
        fetch(`/api/compositions?includeDrafts=true`).then(r => r.json()).catch(() => []),
        fetch(`/api/students`).then(r => r.json()).catch(() => []),
        fetch(`/api/classes`).then(r => r.json()).catch(() => []),
        fetch(`/api/normales`).then(r => r.json()).catch(() => []),
        fetch(`/api/modules`).then(r => r.json()).catch(() => [])
      ]);

      if (Array.isArray(compsRes)) setCompositions(compsRes);
      if (Array.isArray(studentsRes)) setStudents(studentsRes);
      if (Array.isArray(classesRes)) setClassesList(classesRes);
      if (Array.isArray(normalesRes)) setNormalesList(normalesRes);
      if (Array.isArray(modulesRes)) setModulesList(modulesRes);

      // Auto-select first composition for grading if none selected
      if (Array.isArray(compsRes) && compsRes.length > 0 && !selectedCompId) {
        initGradingForComp(compsRes[0], Array.isArray(studentsRes) ? studentsRes : []);
      }
    } catch (error) {
      console.error("Error loading notes and bulletins data", error);
      toast.error("Erreur de connexion lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  // Sync grading tab when an evaluation is selected
  const initGradingForComp = (comp: Composition, currentStudents: any[] = students) => {
    setSelectedCompId(comp.id);
    const targetStudents = currentStudents.filter(
      s => s.classCode === comp.classCode || s.promo === comp.promo || s.promo === comp.classCode
    );

    const updatedGrades = targetStudents.map(student => {
      const existing = comp.grades?.find(g => g.studentId === student.id);
      return {
        studentId: student.id,
        studentName: student.name,
        promo: student.promo || comp.promo || 'G1',
        classCode: comp.classCode,
        email: student.email || '',
        score: existing ? existing.score : 0,
        comments: existing ? existing.comments || '' : ''
      };
    });

    setGradingGrades(updatedGrades);
  };

  const handleSelectCompositionForGrading = (compId: string) => {
    const comp = compositions.find(c => c.id === compId);
    if (!comp) return;
    initGradingForComp(comp);
    setActiveTab('notes');
  };

  // Filtered Compositions List
  const filteredCompositions = useMemo(() => {
    return compositions.filter(c => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQ = 
          c.title?.toLowerCase().includes(q) ||
          c.subject?.toLowerCase().includes(q) ||
          c.classCode?.toLowerCase().includes(q) ||
          c.teacherName?.toLowerCase().includes(q) ||
          c.promo?.toLowerCase().includes(q);
        if (!matchQ) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        const cat = getCategoryIdForFiliereString(c.department || c.classCode || c.subject);
        if (cat !== selectedCategory) {
          const associatedClass = classesList.find(cls => cls.code === c.classCode);
          const classCat = getCategoryIdForFiliereString(associatedClass?.filières?.join(' ') || associatedClass?.department || '');
          if (classCat !== selectedCategory) return false;
        }
      }

      // 3. Specialty Filter
      if (selectedSpecialty !== 'all') {
        const associatedClass = classesList.find(cls => cls.code === c.classCode);
        const match = doesSpecialtyMatchStudentOrClass(selectedSpecialty, [
          c.subject,
          c.department,
          ...(associatedClass?.filières || [])
        ], c.classCode);
        if (!match) return false;
      }

      // 4. Class Code Filter
      if (selectedClassFilter !== 'all') {
        if (c.classCode !== selectedClassFilter && c.promo !== selectedClassFilter) return false;
      }

      // 5. Type Filter
      if (selectedTypeFilter !== 'all') {
        if (c.type !== selectedTypeFilter) return false;
      }

      // 6. Normale / Session Filter
      if (selectedNormaleFilter !== 'all') {
        if (c.normaleId !== selectedNormaleFilter) return false;
      }

      return true;
    });
  }, [compositions, searchQuery, selectedCategory, selectedSpecialty, selectedClassFilter, selectedTypeFilter, selectedNormaleFilter, classesList]);

  // Filtered Students List for Bulletins & Roster
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQ =
          s.name?.toLowerCase().includes(q) ||
          s.matricule?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.specialty?.toLowerCase().includes(q) ||
          s.classCode?.toLowerCase().includes(q);
        if (!matchQ) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        const cat = getCategoryIdForFiliereString(s.specialty || s.department || s.classCode);
        if (cat !== selectedCategory) return false;
      }

      // 3. Specialty Filter
      if (selectedSpecialty !== 'all') {
        const match = doesSpecialtyMatchStudentOrClass(selectedSpecialty, s.specialty || '', s.classCode);
        if (!match) return false;
      }

      // 4. Class Filter
      if (selectedClassFilter !== 'all') {
        if (s.classCode !== selectedClassFilter && s.promo !== selectedClassFilter) return false;
      }

      return true;
    });
  }, [students, searchQuery, selectedCategory, selectedSpecialty, selectedClassFilter]);

  // Auto-select first student in bulletins if none selected or selected is filtered out
  useEffect(() => {
    if (filteredStudents.length > 0) {
      if (!bulletinStudentId || !filteredStudents.some(s => s.id === bulletinStudentId)) {
        setBulletinStudentId(filteredStudents[0].id);
      }
    } else {
      setBulletinStudentId('');
    }
  }, [filteredStudents, bulletinStudentId]);

  // Active student object in bulletins tab
  const activeBulletinStudent = useMemo(() => {
    return students.find(s => s.id === bulletinStudentId) || filteredStudents[0] || null;
  }, [students, bulletinStudentId, filteredStudents]);

  // Active evaluation in grading tab
  const activeGradingComp = useMemo(() => {
    return compositions.find(c => c.id === selectedCompId) || filteredCompositions[0] || compositions[0] || null;
  }, [compositions, selectedCompId, filteredCompositions]);

  // Stats for active grading composition
  const gradingStats = useMemo(() => {
    if (!gradingGrades || gradingGrades.length === 0) return { avg: 0, high: 0, low: 0, rate: 0 };
    const scores = gradingGrades.map(g => Number(g.score || 0));
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / scores.length;
    const high = Math.max(...scores);
    const low = Math.min(...scores);
    const successCount = scores.filter(s => s >= 10).length;
    const rate = (successCount / scores.length) * 100;
    return { avg, high, low, rate };
  }, [gradingGrades]);

  // Create Evaluation Submit
  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClassCode || !newSubject.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const selectedClassObj = classesList.find(c => c.code === newClassCode);
    const promoValue = selectedClassObj?.code?.split('-')[0] || 'G1';

    const payload = {
      title: newTitle.trim(),
      type: newType,
      promo: promoValue,
      classCode: newClassCode,
      department: selectedClassObj?.filières?.[0] || selectedClassObj?.name || "Formation Professionnelle",
      level: selectedClassObj?.level || "Niveau Unique",
      subject: newSubject.trim(),
      teacherName: newTeacherName.trim() || "Dr. Jean-Paul Kamga",
      normaleId: newNormaleId !== 'none' ? newNormaleId : null,
      coefficient: Number(newCoefficient) || 2,
      maxScore: Number(newMaxScore) || 20,
      date: newDate,
      status: "Ouverte",
      academicYear: selectedYear || "2026-2027",
      isPublished: true,
      grades: []
    };

    try {
      const res = await fetch('/api/compositions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();
      const created = await res.json();
      toast.success("Nouvelle évaluation créée avec succès !");
      setIsCreateOpen(false);
      resetCreateForm();
      fetchData();
      initGradingForComp(created);
    } catch (err) {
      toast.error("Échec de la création de l'évaluation.");
    }
  };

  // Edit Evaluation Submit
  const handleEditEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComp) return;

    try {
      const res = await fetch(`/api/compositions/${editingComp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingComp)
      });

      if (!res.ok) throw new Error();
      toast.success("Évaluation mise à jour avec succès.");
      setIsEditOpen(false);
      setEditingComp(null);
      fetchData();
    } catch (err) {
      toast.error("Échec de la mise à jour.");
    }
  };

  // Delete Evaluation
  const handleDeleteEvaluation = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette évaluation ? Les notes associées seront supprimées.")) return;
    try {
      const res = await fetch(`/api/compositions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success("Évaluation supprimée.");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = async (comp: Composition) => {
    try {
      const nextPublished = !comp.isPublished;
      const res = await fetch(`/api/compositions/${comp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: nextPublished })
      });
      if (!res.ok) throw new Error();
      toast.success(nextPublished ? "Évaluation publiée aux étudiants !" : "Évaluation masquée (Brouillon).");
      fetchData();
    } catch (err) {
      toast.error("Erreur de modification du statut.");
    }
  };

  // Save Student Grades
  const handleSaveGrades = async () => {
    if (!selectedCompId) return;
    setSavingGrades(true);
    const invalid = gradingGrades.some(g => isNaN(g.score) || g.score < 0 || g.score > 20);
    if (invalid) {
      toast.error("Veuillez saisir des notes valides comprises entre 0 et 20.");
      setSavingGrades(false);
      return;
    }

    try {
      const comp = compositions.find(c => c.id === selectedCompId);
      const nextStatus = comp?.status === 'Ouverte' ? 'Clôturée' : comp?.status;
      const res = await fetch(`/api/compositions/${selectedCompId}/grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grades: gradingGrades,
          status: nextStatus
        })
      });
      if (!res.ok) throw new Error();
      toast.success("Notes de l'évaluation enregistrées et validées !");
      fetchData();
    } catch (err) {
      toast.error("Une erreur est survenue lors de l'enregistrement des notes.");
    } finally {
      setSavingGrades(false);
    }
  };

  // Batch PDF Downloader
  const handleBatchDownloadPDF = async () => {
    const targetIds = selectedStudentIds.length > 0 ? selectedStudentIds : (bulletinStudentId ? [bulletinStudentId] : []);
    if (targetIds.length === 0) {
      toast.error("Veuillez sélectionner au moins un étudiant.");
      return;
    }

    const toastId = toast.loading(`Génération du PDF officiel pour ${targetIds.length} bulletin(s)...`);
    setIsBatchProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const container = document.getElementById('batch-bulletins-print-container');
      if (!container) throw new Error("Conteneur introuvable");

      const sheets = container.getElementsByClassName('batch-bulletin-wrapper');
      if (sheets.length === 0) throw new Error("Aucun bulletin prêt");

      let pdf: any = null;
      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i] as HTMLElement;
        const innerPage = sheet.querySelector('.itmc-bulletin-page') as HTMLElement;
        if (!innerPage) continue;

        const imgData = await toPng(innerPage, {
          pixelRatio: 2.0,
          backgroundColor: '#ffffff'
        });

        if (!pdf) {
          pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
          });
        } else {
          pdf.addPage();
        }

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      }

      if (pdf) {
        const filename = `Bulletins_Officiels_ITMC_${selectedClassFilter !== 'all' ? selectedClassFilter : 'Promotion'}_${selectedYear}.pdf`;
        pdf.save(filename);
        toast.success(`Téléchargement de ${targetIds.length} bulletin(s) complété !`);
      }
    } catch (error) {
      console.error("Batch PDF error:", error);
      toast.error("Erreur lors de la génération du PDF.");
    } finally {
      setIsBatchProcessing(false);
      toast.dismiss(toastId);
    }
  };

  // Batch Print
  const handleBatchPrint = async () => {
    const targetIds = selectedStudentIds.length > 0 ? selectedStudentIds : (bulletinStudentId ? [bulletinStudentId] : []);
    if (targetIds.length === 0) {
      toast.error("Veuillez sélectionner au moins un étudiant.");
      return;
    }

    setIsBatchProcessing(true);
    const toastId = toast.loading("Préparation de l'impression officielle...");

    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const container = document.getElementById('batch-bulletins-print-container');
      if (!container) throw new Error("Conteneur non initialisé.");

      const sheets = container.getElementsByClassName('batch-bulletin-wrapper');
      if (sheets.length === 0) throw new Error("Aucun élément prêt.");

      let combinedHTML = '';
      for (let i = 0; i < sheets.length; i++) {
        combinedHTML += sheets[i].innerHTML;
      }

      const oldIframe = document.getElementById('batch-bulletin-print-iframe');
      if (oldIframe) oldIframe.remove();

      const iframe = document.createElement('iframe');
      iframe.id = 'batch-bulletin-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.zIndex = '-9999';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) {
        window.print();
        return;
      }

      doc.open();
      doc.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Bulletins_Officiels_ITMC</title>
  <style>${BULLETIN_PRINT_SCOPED_CSS}</style>
</head>
<body>${combinedHTML}</body>
</html>`);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error(e);
        }
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 1500);
      }, 400);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la préparation de l'impression.");
    } finally {
      setIsBatchProcessing(false);
      toast.dismiss(toastId);
    }
  };

  const resetCreateForm = () => {
    setNewTitle('');
    setNewType('CC');
    setNewClassCode(classesList[0]?.code || 'G1-GL');
    setNewSubject('');
    setNewTeacherName('');
    setNewNormaleId('none');
    setNewCoefficient(3);
    setNewMaxScore(20);
    setNewDate(new Date().toISOString().split('T')[0]);
  };

  // KPIs
  const totalCompsCount = compositions.length;
  const publishedCompsCount = compositions.filter(c => c.isPublished !== false).length;
  const totalNormalesCount = normalesList.length;
  const totalStudentsCount = students.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Notes & Bulletins Officiels
              </h1>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-black uppercase">
                MINEFOP DQP
              </Badge>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Super Administration • 35 Spécialités DQP • Sessions Normales & Bulletins Cameroun
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-wider h-11 px-5 shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Créer une Évaluation
          </Button>

          <Button 
            variant="outline" 
            onClick={fetchData}
            className="rounded-2xl border-slate-200 text-slate-600 h-11 px-3.5 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
            title="Actualiser les données réelles du système"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 md:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
          
          {/* Search */}
          <div className="relative lg:col-span-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Rechercher par matière, étudiant, matricule, classe..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-2xl border-slate-200/90 bg-slate-50/70 dark:bg-slate-950/40 text-xs font-bold focus-visible:ring-blue-600"
            />
          </div>

          {/* 4 Core Categories */}
          <div className="lg:col-span-3">
            <Select value={selectedCategory} onValueChange={(val) => {
              setSelectedCategory(val);
              setSelectedSpecialty('all');
            }}>
              <SelectTrigger className="h-11 rounded-2xl text-xs font-black bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/90">
                <SelectValue placeholder="Catégorie Filière" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {CATEGORIES_FILIERES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs font-bold">
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 35 Official Specialties */}
          <div className="lg:col-span-3">
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="h-11 rounded-2xl text-xs font-bold bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/90">
                <SelectValue placeholder="Spécialité DQP (35)" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl max-h-72">
                <SelectItem value="all" className="text-xs font-black text-blue-600">
                  ⚡ Toutes les Spécialités (35)
                </SelectItem>
                {defaultSpecialties
                  .filter(sp => selectedCategory === 'all' || getCategoryIdForFiliereString(sp.filiere) === selectedCategory)
                  .map(sp => (
                    <SelectItem key={sp.id} value={sp.name} className="text-xs font-semibold">
                      {sp.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Classes / Promotions */}
          <div className="lg:col-span-2">
            <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
              <SelectTrigger className="h-11 rounded-2xl text-xs font-bold bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/90">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all" className="text-xs font-bold">Toutes Classes</SelectItem>
                {classesList
                  .filter(cls => selectedCategory === 'all' || getCategoryIdForFiliereString(cls.filières?.join(' ') || cls.name) === selectedCategory)
                  .map(cls => (
                    <SelectItem key={cls.id} value={cls.code} className="text-xs font-bold">
                      {cls.code} ({cls.name})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* Quick Active Filter Badges */}
        {(selectedCategory !== 'all' || selectedSpecialty !== 'all' || selectedClassFilter !== 'all' || searchQuery.trim()) && (
          <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Filtres actifs :</span>
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="rounded-xl px-2.5 py-1 text-[10px] font-bold">
                {CATEGORIES_FILIERES.find(c => c.id === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory('all')} className="ml-1 text-slate-400 hover:text-slate-700">✕</button>
              </Badge>
            )}
            {selectedSpecialty !== 'all' && (
              <Badge variant="secondary" className="rounded-xl px-2.5 py-1 text-[10px] font-bold">
                Spécialité : {selectedSpecialty}
                <button onClick={() => setSelectedSpecialty('all')} className="ml-1 text-slate-400 hover:text-slate-700">✕</button>
              </Badge>
            )}
            {selectedClassFilter !== 'all' && (
              <Badge variant="secondary" className="rounded-xl px-2.5 py-1 text-[10px] font-bold">
                Classe : {selectedClassFilter}
                <button onClick={() => setSelectedClassFilter('all')} className="ml-1 text-slate-400 hover:text-slate-700">✕</button>
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSpecialty('all');
                setSelectedClassFilter('all');
                setSelectedTypeFilter('all');
                setSelectedNormaleFilter('all');
                setSearchQuery('');
              }}
              className="h-6 px-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg ml-auto"
            >
              Réinitialiser tous les filtres
            </Button>
          </div>
        )}
      </Card>

      {/* Primary Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="bg-slate-100/90 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 max-w-xl shadow-sm">
          <TabsList className="grid grid-cols-3 bg-transparent h-11 gap-1.5 border-none p-0">
            <TabsTrigger 
              value="evaluations" 
              className="rounded-xl font-black text-xs py-2.5 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              Évaluations ({filteredCompositions.length})
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="rounded-xl font-black text-xs py-2.5 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm flex items-center justify-center gap-1.5"
            >
              <Sliders className="w-4 h-4" />
              Saisie de Notes
            </TabsTrigger>
            <TabsTrigger 
              value="bulletins" 
              className="rounded-xl font-black text-xs py-2.5 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              Bulletins ({filteredStudents.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: EVALUATIONS & EXAMS LIST */}
        {/* ========================================================= */}
        <TabsContent value="evaluations" className="m-0 focus-visible:ring-0 space-y-6">
          
          {/* Secondary Filter Sub-bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Type & Session :</span>
              
              <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
                <SelectTrigger className="h-9 w-44 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 border-slate-200">
                  <SelectValue placeholder="Tous Types" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-xs font-bold">Tous Types d'Évaluations</SelectItem>
                  <SelectItem value="CC" className="text-xs font-bold">Contrôle Continu (CC)</SelectItem>
                  <SelectItem value="TD" className="text-xs font-bold">Travail Dirigé (TD)</SelectItem>
                  <SelectItem value="Composition Normale" className="text-xs font-black text-blue-600">Composition Normale</SelectItem>
                  <SelectItem value="Rattrapage" className="text-xs font-bold text-rose-600">Rattrapage</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedNormaleFilter} onValueChange={setSelectedNormaleFilter}>
                <SelectTrigger className="h-9 w-52 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 border-slate-200">
                  <SelectValue placeholder="Session Normale" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-60">
                  <SelectItem value="all" className="text-xs font-bold">Toutes Sessions Normales</SelectItem>
                  {normalesList.map(n => (
                    <SelectItem key={n.id} value={n.id} className="text-xs font-bold">
                      ⚡ {n.title} ({n.promo} - {n.semester})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs font-bold text-slate-400">
              Total : <span className="font-extrabold text-slate-900 dark:text-white">{filteredCompositions.length}</span> évaluation(s) affichée(s)
            </div>
          </div>

          {/* Evaluations Table */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-0">
              {loading ? (
                <div className="py-24 text-center text-slate-400 animate-pulse text-xs font-bold">
                  Chargement des évaluations scolaires en cours...
                </div>
              ) : filteredCompositions.length === 0 ? (
                <div className="py-24 text-center text-slate-400 space-y-3">
                  <BookMarked className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-xs font-black text-slate-600 dark:text-slate-300">Aucune évaluation ne correspond aux filtres sélectionnés</p>
                  <p className="text-[11px] text-slate-400">Modifiez vos filtres ou créez une nouvelle évaluation pour cette spécialité.</p>
                  <Button 
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSpecialty('all');
                      setSelectedClassFilter('all');
                      setSelectedTypeFilter('all');
                      setSelectedNormaleFilter('all');
                      setSearchQuery('');
                    }} 
                    variant="outline" 
                    className="rounded-xl text-xs font-bold mt-2"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-950/40">
                      <TableRow className="hover:bg-transparent border-b border-slate-200/70 dark:border-slate-800">
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider py-4 pl-6">Intitulé & Matière</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Classe</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Type / Session</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Coeff.</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Enseignant</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Statut</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompositions.map((comp) => {
                        const gradesCount = comp.grades?.length || 0;
                        const linkedNormale = normalesList.find(n => n.id === comp.normaleId);
                        return (
                          <TableRow key={comp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800">
                            <TableCell className="py-4 pl-6">
                              <div>
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white block max-w-sm leading-snug">
                                  {comp.title}
                                </span>
                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block mt-0.5">
                                  {comp.subject}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-black">
                                {comp.classCode}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5">
                                <span className={`text-[11px] font-black block ${
                                  comp.type === 'Composition Normale' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
                                }`}>
                                  {comp.type}
                                </span>
                                {linkedNormale && (
                                  <span className="text-[9px] font-bold text-slate-400 block">
                                    ⚡ {linkedNormale.title}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-black text-xs text-slate-900 dark:text-white">
                              {comp.coefficient}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              {comp.teacherName}
                            </TableCell>
                            <TableCell className="text-[11px] font-semibold text-slate-500">
                              {comp.date}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1 items-start">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                  comp.status === 'Ouverte' 
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}>
                                  {comp.status === 'Ouverte' ? "Saisie Ouverte" : "Clôturée"}
                                </span>
                                {comp.isPublished ? (
                                  <span className="text-[9px] text-blue-600 font-extrabold flex items-center gap-1">
                                    <CheckCircle className="w-2.5 h-2.5" /> Publié
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-slate-400 font-semibold">Brouillon</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleSelectCompositionForGrading(comp.id)}
                                  className="h-8 px-3 text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1 shadow-sm"
                                >
                                  <Sliders className="w-3 h-3" />
                                  Notes ({gradesCount})
                                </Button>

                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleTogglePublish(comp)}
                                  className={`h-8 px-2 text-[10px] font-bold rounded-xl ${
                                    comp.isPublished 
                                      ? 'text-amber-600 hover:bg-amber-50' 
                                      : 'text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                  title={comp.isPublished ? "Masquer" : "Publier aux apprenants"}
                                >
                                  {comp.isPublished ? "Masquer" : "Publier"}
                                </Button>

                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => {
                                    setEditingComp(comp);
                                    setIsEditOpen(true);
                                  }}
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 rounded-xl"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>

                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleDeleteEvaluation(comp.id)}
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 rounded-xl"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
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
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 2: SAISIE & REGISTRE DES NOTES */}
        {/* ========================================================= */}
        <TabsContent value="notes" className="m-0 focus-visible:ring-0 space-y-6">
          
          {/* Quick Evaluation Selector Bar */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="eval-switcher" className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Choisir l'évaluation à noter :
                </Label>
                <div className="w-full md:w-96">
                  <Select 
                    value={activeGradingComp?.id || ''} 
                    onValueChange={(val) => {
                      const comp = compositions.find(c => c.id === val);
                      if (comp) initGradingForComp(comp);
                    }}
                  >
                    <SelectTrigger id="eval-switcher" className="h-11 rounded-2xl text-xs font-black bg-slate-50 dark:bg-slate-950 border-slate-200">
                      <SelectValue placeholder="Sélectionner une évaluation..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl max-h-72">
                      {compositions.map(c => (
                        <SelectItem key={c.id} value={c.id} className="text-xs font-bold">
                          [{c.classCode}] {c.title} • {c.subject} ({c.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {activeGradingComp && (
                <Button 
                  onClick={handleSaveGrades}
                  disabled={savingGrades}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 px-6 font-black uppercase text-[10px] tracking-wider flex items-center gap-2 shadow-md shadow-emerald-500/20"
                >
                  {savingGrades ? "Sauvegarde..." : <><Save className="w-4 h-4" /> Enregistrer les Notes</>}
                </Button>
              )}
            </div>
          </Card>

          {activeGradingComp && (
            <div className="space-y-6">
              {/* Active Evaluation Overview & Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <Card className="lg:col-span-2 rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 rounded-xl text-[10px] font-black uppercase">
                        Classe {activeGradingComp.classCode}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-bold">
                        Coefficient : {activeGradingComp.coefficient}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-bold">
                        Barème : /{activeGradingComp.maxScore}
                      </Badge>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        activeGradingComp.status === 'Ouverte' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {activeGradingComp.status === 'Ouverte' ? '⚠️ Saisie Ouverte' : '✅ Clôturée'}
                      </span>
                    </div>

                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {activeGradingComp.title}
                    </h2>
                    <p className="text-xs font-bold text-slate-500">
                      Matière / Module : <span className="text-blue-600 dark:text-blue-400 font-extrabold">{activeGradingComp.subject}</span>
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400">
                      Enseignant Responsable : {activeGradingComp.teacherName} • Date : {activeGradingComp.date}
                    </p>
                  </div>
                </Card>

                <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-slate-900 text-white p-6 flex flex-col justify-between shadow-md">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4">Statistiques de la Classe</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Moyenne Générale</span>
                        <span className="text-xl font-black text-blue-400">{gradingStats.avg.toFixed(2)} / 20</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Taux de Réussite</span>
                        <span className="text-xl font-black text-emerald-400">{gradingStats.rate.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Note Max</span>
                        <span className="text-sm font-black text-slate-200">{gradingStats.high} / 20</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Note Min</span>
                        <span className="text-sm font-black text-slate-200">{gradingStats.low} / 20</span>
                      </div>
                    </div>
                  </div>
                </Card>

              </div>

              {/* Editable Grading Table */}
              <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="border-b border-slate-200/60 dark:border-slate-800 px-6 py-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-black text-slate-900 dark:text-white">Grille Officielle de Notation</CardTitle>
                    <CardDescription className="text-xs text-slate-400">Saisissez les notes sur 20 et les appréciations individuelles des apprenants.</CardDescription>
                  </div>
                  <Button 
                    onClick={handleSaveGrades}
                    disabled={savingGrades}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider"
                  >
                    Enregistrer
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {gradingGrades.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 text-xs font-bold">
                      Aucun apprenant enregistré dans la classe {activeGradingComp.classCode}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/80 dark:bg-slate-950/40">
                          <TableRow className="border-b border-slate-200/70 dark:border-slate-800">
                            <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider py-4 pl-6">Apprenant</TableHead>
                            <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Matricule</TableHead>
                            <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider w-44">Note (/20)</TableHead>
                            <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Appréciation Pédagogique</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gradingGrades.map((g, idx) => {
                            const studentObj = students.find(s => s.id === g.studentId);
                            return (
                              <TableRow key={g.studentId} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/40">
                                <TableCell className="py-3.5 pl-6">
                                  <span className="text-xs font-black text-slate-900 dark:text-white block">{g.studentName}</span>
                                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{studentObj?.specialty || g.email}</span>
                                </TableCell>
                                <TableCell className="text-xs font-mono font-black text-blue-700 dark:text-blue-300">
                                  {studentObj?.matricule || "N/A"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Input 
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.25"
                                      placeholder="0.00"
                                      value={g.score === 0 && !gradingGrades[idx].comments ? '' : g.score}
                                      onChange={(e) => {
                                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                                        const updated = [...gradingGrades];
                                        updated[idx].score = val;
                                        setGradingGrades(updated);
                                      }}
                                      className="h-10 w-24 rounded-xl font-black text-center text-xs bg-slate-50 dark:bg-slate-950 focus-visible:ring-blue-600 border-slate-200"
                                    />
                                    <span className="text-xs text-slate-400 font-black">/ 20</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Input 
                                    placeholder="Très bon travail, compétences acquises..."
                                    value={g.comments || ''}
                                    onChange={(e) => {
                                      const updated = [...gradingGrades];
                                      updated[idx].comments = e.target.value;
                                      setGradingGrades(updated);
                                    }}
                                    className="h-10 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200"
                                  />
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
            </div>
          )}
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 3: BULLETINS OFFICIELS MINEFOP */}
        {/* ========================================================= */}
        <TabsContent value="bulletins" className="m-0 focus-visible:ring-0 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: APPRENANTS ROSTER & SELECTION */}
            <div className="xl:col-span-5 space-y-4">
              
              <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-5 space-y-4">
                
                {/* Session Selector */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Label htmlFor="bulletin-session-select" className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                    Période / Session du Bulletin :
                  </Label>
                  <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                    <SelectTrigger id="bulletin-session-select" className="h-10 rounded-xl text-xs font-black bg-white dark:bg-slate-900 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl max-h-72">
                      <SelectItem value="all" className="text-xs font-bold">📚 Bulletin Général (Toutes les Évaluations)</SelectItem>
                      <SelectItem value="annual" className="text-xs font-black text-blue-600">🏆 Bulletin de Synthèse Annuelle DQP</SelectItem>
                      {normalesList.map(n => (
                        <SelectItem key={n.id} value={n.id} className="text-xs font-bold">
                          ⚡ {n.title} ({n.promo} - {n.semester})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Header with Select-All */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Registre des Apprenants ({filteredStudents.length})
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Cochez pour le téléchargement groupé ou cliquez pour afficher l'aperçu.
                    </p>
                  </div>

                  {filteredStudents.length > 0 && (
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl hover:bg-slate-200/70 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds(filteredStudents.map(s => s.id));
                          } else {
                            setSelectedStudentIds([]);
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Tous ({filteredStudents.length})</span>
                    </label>
                  )}
                </div>

                {/* Students List */}
                {filteredStudents.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-xs font-bold space-y-2">
                    <Users className="w-10 h-10 mx-auto text-slate-300" />
                    <p>Aucun apprenant ne correspond aux filtres</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                    {filteredStudents.map(student => {
                      const isSelected = activeBulletinStudent?.id === student.id;
                      const isChecked = selectedStudentIds.includes(student.id);
                      return (
                        <div 
                          key={student.id}
                          onClick={() => setBulletinStudentId(student.id)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border cursor-pointer ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm' 
                              : 'border-slate-100 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudentIds(prev => [...prev, student.id]);
                                } else {
                                  setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
                                }
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer shrink-0"
                            />
                            
                            <div className="min-w-0 flex-1">
                              <span className={`block text-xs font-black truncate ${isSelected ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                                {student.name}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono font-bold text-slate-500 truncate">
                                  {student.matricule || "N/A"}
                                </span>
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded">
                                  {student.classCode}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right pl-2 shrink-0">
                            <span className="block text-xs font-black text-slate-800 dark:text-slate-200">
                              {student.lastGrade || "15.00/20"}
                            </span>
                            <span className="block text-[8px] text-slate-400 uppercase tracking-widest mt-0.5">Moyenne</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Batch Action Toolbar inside Left Card */}
                {selectedStudentIds.length > 0 && (
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                        Sélection groupée : {selectedStudentIds.length} apprenant(s)
                      </span>
                      <button 
                        onClick={() => setSelectedStudentIds([])}
                        className="text-[10px] font-bold text-slate-400 hover:text-white underline"
                      >
                        Désélectionner
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleBatchDownloadPDF}
                        disabled={isBatchProcessing}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider h-10 rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF ({selectedStudentIds.length})
                      </Button>
                      <Button
                        onClick={handleBatchPrint}
                        disabled={isBatchProcessing}
                        variant="outline"
                        className="border-slate-700 text-white hover:bg-slate-800 font-black text-[10px] uppercase tracking-wider h-10 rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Imprimer
                      </Button>
                    </div>
                  </div>
                )}

              </Card>

            </div>

            {/* RIGHT COLUMN: BULLETIN PREVIEW & GENERATOR */}
            <div className="xl:col-span-7 space-y-4">
              
              {!activeBulletinStudent ? (
                <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 py-24 text-center">
                  <Award className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-xs font-black text-slate-600 dark:text-slate-300">Aucun apprenant sélectionné</p>
                  <p className="text-[11px] text-slate-400 mt-1">Sélectionnez un apprenant dans la liste pour prévisualiser son bulletin officiel.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          Aperçu Officiel : {activeBulletinStudent.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold block mt-0.5">
                          Matricule : {activeBulletinStudent.matricule || "N/A"} • Spécialité : {activeBulletinStudent.specialty}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          onClick={() => setTranscriptStudent(activeBulletinStudent)}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Bulletin Détaillé & Scellé
                        </Button>
                        <Button
                          onClick={handleBatchPrint}
                          variant="outline"
                          className="rounded-xl h-10 px-3 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Live Sheet Render */}
                  <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm bg-slate-100/50 dark:bg-slate-950 p-4 overflow-hidden flex justify-center">
                    <div className="w-full max-w-[210mm] shadow-lg rounded-2xl overflow-hidden bg-white">
                      {(() => {
                        const bData = getStudentBulletinData(
                          activeBulletinStudent, 
                          selectedSessionId, 
                          compositions, 
                          normalesList, 
                          students
                        );
                        return (
                          <OfficialBulletinSheet
                            student={activeBulletinStudent}
                            rows={bData.moduleRows}
                            totalCoefficients={bData.totalCoefficients}
                            overallAverage={bData.overallAverage}
                            rankLabel={bData.rankLabel}
                            generalAppreciation={bData.generalAppreciation}
                            mentionLabel={bData.mentionLabel}
                            sessionTitle={bData.sessionTitle}
                            sessionShort={bData.sessionShort}
                            academicYear={selectedYear || "2026-2027"}
                            isAnnualBulletin={selectedSessionId === 'annual'}
                          />
                        );
                      })()}
                    </div>
                  </Card>
                </div>
              )}

            </div>

          </div>
        </TabsContent>
      </Tabs>

      {/* ========================================================= */}
      {/* HIDDEN CONTAINER FOR BATCH PDF & PRINT CAPTURE */}
      {/* ========================================================= */}
      <div 
        id="batch-bulletins-print-container" 
        style={{ 
          position: 'absolute', 
          top: '-9999px', 
          left: '-9999px', 
          opacity: 0, 
          pointerEvents: 'none',
          width: '210mm'
        }}
      >
        {(selectedStudentIds.length > 0 ? selectedStudentIds : (bulletinStudentId ? [bulletinStudentId] : [])).map(sid => {
          const student = students.find(s => s.id === sid);
          if (!student) return null;
          const bData = getStudentBulletinData(student, selectedSessionId, compositions, normalesList, students);
          return (
            <div 
              key={student.id} 
              className="batch-bulletin-wrapper" 
              style={{ pageBreakAfter: 'always', margin: 0, padding: 0 }}
            >
              <OfficialBulletinSheet
                student={student}
                rows={bData.moduleRows}
                totalCoefficients={bData.totalCoefficients}
                overallAverage={bData.overallAverage}
                rankLabel={bData.rankLabel}
                generalAppreciation={bData.generalAppreciation}
                mentionLabel={bData.mentionLabel}
                sessionTitle={bData.sessionTitle}
                sessionShort={bData.sessionShort}
                academicYear={selectedYear || "2026-2027"}
                isAnnualBulletin={selectedSessionId === 'annual'}
              />
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* DIALOG 1: CREATE EVALUATION */}
      {/* ========================================================= */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-lg rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900 dark:text-white">Créer une Nouvelle Évaluation</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Ajoutez un contrôle continu (CC), un travail dirigé (TD) ou une composition normale semestrielle.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEvaluation} className="space-y-4 mt-2">
            
            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs font-black text-slate-700 dark:text-slate-300">Titre de l'Évaluation *</Label>
              <Input 
                id="title"
                required
                placeholder="ex: CC1 - Algorithmique Avancée & Complexité"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="type" className="text-xs font-black text-slate-700 dark:text-slate-300">Type *</Label>
                <Select value={newType} onValueChange={(val: any) => setNewType(val)}>
                  <SelectTrigger id="type" className="h-10 rounded-xl text-xs font-bold bg-slate-50 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="CC" className="text-xs font-bold">Contrôle Continu (CC)</SelectItem>
                    <SelectItem value="TD" className="text-xs font-bold">Travail Dirigé (TD)</SelectItem>
                    <SelectItem value="Composition Normale" className="text-xs font-black text-blue-600">Composition Normale</SelectItem>
                    <SelectItem value="Rattrapage" className="text-xs font-bold text-rose-600">Rattrapage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="class" className="text-xs font-black text-slate-700 dark:text-slate-300">Classe Cible *</Label>
                <Select value={newClassCode} onValueChange={setNewClassCode}>
                  <SelectTrigger id="class" className="h-10 rounded-xl text-xs font-bold bg-slate-50 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-60">
                    {classesList.map(cls => (
                      <SelectItem key={cls.id} value={cls.code} className="text-xs font-bold">
                        {cls.code} ({cls.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="subject" className="text-xs font-black text-slate-700 dark:text-slate-300">Matière / Module DQP *</Label>
              <Input 
                id="subject"
                required
                placeholder="ex: Algorithmique Avancée & Structures de Données"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="teacher" className="text-xs font-black text-slate-700 dark:text-slate-300">Enseignant</Label>
                <Input 
                  id="teacher"
                  placeholder="ex: Dr. Jean-Paul Kamga"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="normaleId" className="text-xs font-black text-slate-700 dark:text-slate-300">Rattacher à une Normale</Label>
                <Select value={newNormaleId} onValueChange={setNewNormaleId}>
                  <SelectTrigger id="normaleId" className="h-10 rounded-xl text-xs font-bold bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-60">
                    <SelectItem value="none" className="text-xs font-bold">Aucune (Évaluation Libre)</SelectItem>
                    {normalesList.map(n => (
                      <SelectItem key={n.id} value={n.id} className="text-xs font-bold">
                        ⚡ {n.title} ({n.promo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-2">
                <Label htmlFor="date" className="text-xs font-black text-slate-700 dark:text-slate-300">Date d'Évaluation</Label>
                <Input 
                  id="date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="coeff" className="text-xs font-black text-slate-700 dark:text-slate-300">Coeff. *</Label>
                <Input 
                  id="coeff"
                  type="number"
                  min="1"
                  max="10"
                  value={newCoefficient}
                  onChange={(e) => setNewCoefficient(Number(e.target.value))}
                  className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200 font-black text-center"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-5 font-black uppercase text-[10px] tracking-wider"
              >
                Créer l'Évaluation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* DIALOG 2: EDIT EVALUATION */}
      {/* ========================================================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-lg rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900 dark:text-white">Modifier l'Évaluation</DialogTitle>
          </DialogHeader>
          {editingComp && (
            <form onSubmit={handleEditEvaluation} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label htmlFor="edit-title" className="text-xs font-black text-slate-700 dark:text-slate-300">Titre de l'Évaluation</Label>
                <Input 
                  id="edit-title"
                  required
                  value={editingComp.title}
                  onChange={(e) => setEditingComp({ ...editingComp, title: e.target.value })}
                  className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-type" className="text-xs font-black text-slate-700 dark:text-slate-300">Type</Label>
                  <Select 
                    value={editingComp.type} 
                    onValueChange={(val: any) => setEditingComp({ ...editingComp, type: val })}
                  >
                    <SelectTrigger id="edit-type" className="h-10 rounded-xl text-xs font-bold bg-slate-50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="CC" className="text-xs font-bold">Contrôle Continu (CC)</SelectItem>
                      <SelectItem value="TD" className="text-xs font-bold">Travail Dirigé (TD)</SelectItem>
                      <SelectItem value="Composition Normale" className="text-xs font-black text-blue-600">Composition Normale</SelectItem>
                      <SelectItem value="Rattrapage" className="text-xs font-bold text-rose-600">Rattrapage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-class" className="text-xs font-black text-slate-700 dark:text-slate-300">Classe</Label>
                  <Select 
                    value={editingComp.classCode} 
                    onValueChange={(val: string) => setEditingComp({ ...editingComp, classCode: val })}
                  >
                    <SelectTrigger id="edit-class" className="h-10 rounded-xl text-xs font-bold bg-slate-50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-60">
                      {classesList.map(cls => (
                        <SelectItem key={cls.id} value={cls.code} className="text-xs font-bold">
                          {cls.code} ({cls.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-subject" className="text-xs font-black text-slate-700 dark:text-slate-300">Matière / Module</Label>
                <Input 
                  id="edit-subject"
                  required
                  value={editingComp.subject}
                  onChange={(e) => setEditingComp({ ...editingComp, subject: e.target.value })}
                  className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-teacher" className="text-xs font-black text-slate-700 dark:text-slate-300">Enseignant</Label>
                  <Input 
                    id="edit-teacher"
                    value={editingComp.teacherName}
                    onChange={(e) => setEditingComp({ ...editingComp, teacherName: e.target.value })}
                    className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-coeff" className="text-xs font-black text-slate-700 dark:text-slate-300">Coefficient</Label>
                  <Input 
                    id="edit-coeff"
                    type="number"
                    min="1"
                    max="10"
                    value={editingComp.coefficient}
                    onChange={(e) => setEditingComp({ ...editingComp, coefficient: Number(e.target.value) })}
                    className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200 text-center font-black"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-5 font-black uppercase text-[10px] tracking-wider"
                >
                  Enregistrer les Modifications
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* OFFICIAL TRANSCRIPT MODAL */}
      {/* ========================================================= */}
      <OfficialTranscriptModal 
        isOpen={!!transcriptStudent}
        onClose={() => setTranscriptStudent(null)}
        student={transcriptStudent}
        canManagePublish={true}
        onCompositionUpdated={fetchData}
      />

    </div>
  );
}
