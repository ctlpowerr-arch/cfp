import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter, 
  Award, 
  Printer, 
  Download, 
  Edit3, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Trash2, 
  Calculator, 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Loader2, 
  Sparkles, 
  ChevronRight,
  GraduationCap,
  AlertCircle,
  X,
  FileCheck,
  Building,
  Check,
  Share2,
  Eye,
  EyeOff,
  Globe,
  ShieldCheck,
  QrCode,
  Layers,
  Crown,
  FolderCheck,
  CheckSquare,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import { GradeGridSkeleton } from '@/components/GradeSkeleton';
import { Button } from "@/components/ui/button";
import { printDocument } from '@/lib/printUtils';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import AppLogo from "@/components/AppLogo";
import { exportElementToPDF, printElementDirect } from "@/lib/pdfExport";
import {
  OfficialBulletinSheet,
  printOfficialBulletin,
  getModuleAppreciation,
  getMentionAndGeneralAppreciation
} from "@/components/OfficialTranscriptModal";
import TeacherSubmissionsModal from "@/components/teacher/TeacherSubmissionsModal";
import { toast } from "sonner";

interface StudentGrade {
  studentId: string;
  studentName: string;
  promo: string;
  email: string;
  score: number;
  comments?: string;
}

interface CompositionResource {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'file';
  url: string;
  size?: number;
}

interface Composition {
  id: string;
  title: string;
  type: 'CC' | 'TD' | 'Composition Normale';
  promo: string;
  department: string;
  level: string;
  subject: string;
  teacherName: string;
  coefficient: number;
  maxScore: number;
  date: string;
  status: 'Ouverte' | 'Clôturée';
  isPublished?: boolean;
  normaleId?: string;
  grades: StudentGrade[];
  createdAt?: string;
  durationMinutes?: number;
  subjectText?: string;
  resources?: CompositionResource[];
  allowStudentSubmissions?: boolean;
  requiresSubmission?: boolean;
  allowedSubmissionTypes?: ('pdf' | 'images')[];
  submissionDeadline?: string;
  maxImagesCount?: number;
  maxImageSizeMb?: number;
  maxPdfSizeMb?: number;
  submissions?: any[];
}

export default function TeacherCompositions() {
  const { teacher } = useOutletContext<{ teacher: any }>();
  const { selectedYear } = useAcademicYear();
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [normales, setNormales] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'compositions' | 'normales'>('compositions');
  const [students, setStudents] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Tous');
  const [selectedPromo, setSelectedPromo] = useState<string>('Toutes');
  const [selectedSubject, setSelectedSubject] = useState<string>('Toutes');
  const [selectedStatus, setSelectedStatus] = useState<string>('Tous');
  const [normaleSearchTerm, setNormaleSearchTerm] = useState('');
  const [normalePromoFilter, setNormalePromoFilter] = useState('Toutes');
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 220);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedType, selectedPromo, selectedSubject, selectedStatus, normaleSearchTerm, normalePromoFilter]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateNormaleOpen, setIsCreateNormaleOpen] = useState(false);
  const [isEditNormaleOpen, setIsEditNormaleOpen] = useState(false);
  const [editingNormale, setEditingNormale] = useState<any | null>(null);
  const [selectedNormaleDetail, setSelectedNormaleDetail] = useState<any | null>(null);
  const [editingComposition, setEditingComposition] = useState<Composition | null>(null);
  const [managingNormale, setManagingNormale] = useState<any | null>(null);
  const [isManageNormaleCompsOpen, setIsManageNormaleCompsOpen] = useState(false);
  const [gradingComposition, setGradingComposition] = useState<Composition | null>(null);
  const [selectedStudentReport, setSelectedStudentReport] = useState<any | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPrintListOpen, setIsPrintListOpen] = useState<Composition | null>(null);
  const [selectedCompForSubmissions, setSelectedCompForSubmissions] = useState<Composition | null>(null);

  // New composition form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'CC' | 'TD' | 'Composition Normale'>('CC');
  const [newNormaleId, setNewNormaleId] = useState<string>('none');
  const [newPromo, setNewPromo] = useState('G1');
  const [newDepartment, setNewDepartment] = useState('Informatique');
  const [newLevel, setNewLevel] = useState('Licence 1');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Architecture des Ordinateurs']);
  const [newCoefficient, setNewCoefficient] = useState(1);
  const [newMaxScore, setNewMaxScore] = useState(20);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newIsPublished, setNewIsPublished] = useState(true);
  const [newSubjectText, setNewSubjectText] = useState('');
  const [newDurationMinutes, setNewDurationMinutes] = useState(120);
  const [newAllowSubmissions, setNewAllowSubmissions] = useState(false);
  const [newSubmissionDeadline, setNewSubmissionDeadline] = useState('');
  const [newResources, setNewResources] = useState<CompositionResource[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New & Edit Normale form state - Full freedom for Titulaire
  const [normaleTitle, setNormaleTitle] = useState('Session Normale 1');
  const [normaleCode, setNormaleCode] = useState('SN1-G1-S1');
  const [normalePromo, setNormalePromo] = useState('G1');
  const [normaleSemester, setNormaleSemester] = useState('Semestre 1');
  const [normaleDescription, setNormaleDescription] = useState('Session d\'évaluation normale et examens semestriels');
  const [normaleTargetDate, setNormaleTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedNormaleCompIds, setSelectedNormaleCompIds] = useState<string[]>([]);

  // Student selection & direct scoring state inside creation form
  const [studentSelectionMode, setStudentSelectionMode] = useState<'grouped' | 'manual'>('grouped');
  const [selectedStudentMap, setSelectedStudentMap] = useState<Record<string, { selected: boolean; score: number; comments: string }>>({});
  const [studentSearchInCreate, setStudentSearchInCreate] = useState('');

  // Grading form state
  const [currentGrades, setCurrentGrades] = useState<StudentGrade[]>([]);

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  // Synchronize student selection whenever creation modal opens or mode/promo changes
  useEffect(() => {
    if (isCreateOpen && students.length > 0) {
      setSelectedStudentMap(prev => {
        const nextMap: Record<string, { selected: boolean; score: number; comments: string }> = {};
        students.forEach(s => {
          const isSelected = studentSelectionMode === 'grouped'
            ? (newPromo === 'Toutes' || s.promo === newPromo)
            : (prev[s.id]?.selected ?? true);
          nextMap[s.id] = {
            selected: isSelected,
            score: prev[s.id]?.score || 0,
            comments: prev[s.id]?.comments || ''
          };
        });
        return nextMap;
      });
    }
  }, [isCreateOpen, newPromo, studentSelectionMode, students]);

  const toggleStudentSelected = (studentId: string) => {
    setSelectedStudentMap(prev => ({
      ...prev,
      [studentId]: {
        selected: !prev[studentId]?.selected,
        score: prev[studentId]?.score || 0,
        comments: prev[studentId]?.comments || ''
      }
    }));
  };

  const updateStudentScoreInCreate = (studentId: string, scoreVal: number) => {
    const clamped = Math.max(0, Math.min(newMaxScore, scoreVal));
    setSelectedStudentMap(prev => ({
      ...prev,
      [studentId]: {
        selected: prev[studentId]?.selected ?? true,
        score: clamped,
        comments: prev[studentId]?.comments || ''
      }
    }));
  };

  const updateStudentCommentInCreate = (studentId: string, comments: string) => {
    setSelectedStudentMap(prev => ({
      ...prev,
      [studentId]: {
        selected: prev[studentId]?.selected ?? true,
        score: prev[studentId]?.score || 0,
        comments
      }
    }));
  };

  // Annual Bulletin Config Modal state for Enseignant Titulaire
  const [isAnnualConfigModalOpen, setIsAnnualConfigModalOpen] = useState(false);
  const [annualPromo, setAnnualPromo] = useState('G1');
  const [annualSelectedNormaleIds, setAnnualSelectedNormaleIds] = useState<string[]>([]);
  const [annualSelectedCompIds, setAnnualSelectedCompIds] = useState<string[]>([]);
  const [annualIsActivated, setAnnualIsActivated] = useState(true);
  const [annualTitulaireNotes, setAnnualTitulaireNotes] = useState('ADMIS(E) EN CLASSE SUPÉRIEURE / ADMIS AU DIPLÔME DQP');
  const [annualTitulaireName, setAnnualTitulaireName] = useState('Dr. Jean-Paul Kamga');

  const handleOpenAnnualConfigModal = async (targetPromo?: string) => {
    const promoToUse = targetPromo || (selectedPromo !== 'Toutes' ? selectedPromo : 'G1');
    setAnnualPromo(promoToUse);

    // Filter promo's normales and comps
    const promoNormales = normales.filter(n => n.promo === promoToUse || n.promo === 'Tous');
    const promoComps = compositions.filter(c => c.promo === promoToUse || c.promo === 'Toutes');

    // Default select all promo normales & comps
    setAnnualSelectedNormaleIds(promoNormales.map(n => n.id));
    setAnnualSelectedCompIds(promoComps.map(c => c.id));

    try {
      const res = await fetch(`/api/annual-bulletins?promo=${promoToUse}`);
      if (res.ok) {
        const configs = await res.json();
        if (Array.isArray(configs) && configs.length > 0) {
          const cfg = configs[0];
          setAnnualIsActivated(cfg.isActivated !== false);
          if (Array.isArray(cfg.selectedNormaleIds) && cfg.selectedNormaleIds.length > 0) {
            setAnnualSelectedNormaleIds(cfg.selectedNormaleIds);
          }
          if (Array.isArray(cfg.selectedCompositionIds) && cfg.selectedCompositionIds.length > 0) {
            setAnnualSelectedCompIds(cfg.selectedCompositionIds);
          }
          if (cfg.titulaireName) setAnnualTitulaireName(cfg.titulaireName);
          if (cfg.titulaireNotes) setAnnualTitulaireNotes(cfg.titulaireNotes);
        }
      }
    } catch (e) {
      console.error("Failed to load annual bulletin config", e);
    }

    setIsAnnualConfigModalOpen(true);
  };

  const handleSaveAnnualConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');
      const payload = {
        promo: annualPromo,
        isActivated: annualIsActivated,
        selectedNormaleIds: annualSelectedNormaleIds,
        selectedCompositionIds: annualSelectedCompIds,
        titulaireName: annualTitulaireName || teacherData.name || "Dr. Jean-Paul Kamga",
        titulaireNotes: annualTitulaireNotes
      };

      const res = await fetch('/api/annual-bulletins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Bulletin de Fin d'Année configuré et ${annualIsActivated ? 'activé' : 'désactivé'} pour la Promo ${annualPromo} !`);
        setIsAnnualConfigModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to save annual bulletin config", err);
      toast.error("Erreur lors de l'enregistrement de la configuration annuelle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectAllStudentsInCreate = (select: boolean) => {
    setSelectedStudentMap(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        updated[id] = { ...updated[id], selected: select };
      });
      return updated;
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, nmRes, studRes, modRes] = await Promise.all([
        fetch('/api/compositions?includeDrafts=true').then(r => r.json()),
        fetch('/api/normales').then(r => r.json()),
        fetch('/api/students').then(r => r.json()),
        fetch('/api/modules').then(r => r.json())
      ]);

      setCompositions(Array.isArray(compRes) ? compRes : []);
      setNormales(Array.isArray(nmRes) ? nmRes : []);
      setStudents(Array.isArray(studRes) ? (teacher.specialty ? studRes.filter(s => s.specialty === teacher.specialty) : studRes) : []);
      setModules(Array.isArray(modRes) ? modRes : []);
    } catch (e) {
      console.error("Failed to load compositions and normales", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResourceFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImg = file.type.startsWith('image/');

      if (type === 'pdf' && !isPdf) {
        toast.error(`Le fichier "${file.name}" n'est pas un document PDF.`);
        return;
      }

      if (type === 'image' && !isImg) {
        toast.error(`Le fichier "${file.name}" n'est pas une image.`);
        return;
      }

      const limit = type === 'pdf' ? 3 * 1024 * 1024 : 4 * 1024 * 1024;
      if (file.size > limit) {
        toast.error(`Le fichier "${file.name}" dépasse la limite autorisée de ${type === 'pdf' ? '3 Mo' : '4 Mo'}.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setNewResources(prev => [
          ...prev,
          {
            id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: file.name,
            type: isPdf ? 'pdf' : 'image',
            size: file.size,
            url: reader.result as string
          }
        ]);
        toast.success(`Ressource "${file.name}" attachée au sujet !`);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleCreateComposition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || selectedSubjects.length === 0) return;

    setIsSubmitting(true);
    try {
      const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');

      // Build custom grades for participating selected students
      const selectedGrades = students
        .filter(s => selectedStudentMap[s.id]?.selected)
        .map(s => ({
          studentId: s.id,
          studentName: s.name,
          promo: s.promo || newPromo || "G1",
          email: s.email || "",
          score: Number(selectedStudentMap[s.id]?.score || 0),
          comments: selectedStudentMap[s.id]?.comments || ""
        }));

      const payload = {
        title: newTitle,
        type: newType,
        normaleId: newNormaleId !== 'none' ? newNormaleId : null,
        promo: newPromo,
        department: newDepartment,
        level: newLevel,
        subject: selectedSubjects.join(', '),
        subjects: selectedSubjects,
        teacherName: teacherData.name || teacher?.name || "Dr. Jean-Paul Kamga",
        coefficient: Number(newCoefficient),
        maxScore: Number(newMaxScore),
        date: newDate,
        isPublished: newIsPublished,
        durationMinutes: Number(newDurationMinutes) || 120,
        subjectText: newSubjectText,
        resources: newResources,
        allowStudentSubmissions: newAllowSubmissions,
        requiresSubmission: newAllowSubmissions,
        submissionDeadline: newSubmissionDeadline,
        maxImagesCount: 7,
        maxImageSizeMb: 4,
        maxPdfSizeMb: 3,
        grades: selectedGrades,
        specialty: teacher.specialty || ''
      };

      const res = await fetch('/api/compositions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        setCompositions([created, ...compositions]);
        setIsCreateOpen(false);
        // Refresh Normales as well so linked count updates
        fetchData();
        // Reset form
        setNewTitle('');
        setNewCoefficient(1);
        setNewNormaleId('none');
        setSelectedSubjects(['Architecture des Ordinateurs']);
        setNewIsPublished(true);
        setNewSubjectText('');
        setNewDurationMinutes(120);
        setNewAllowSubmissions(false);
        setNewSubmissionDeadline('');
        setNewResources([]);
      }
    } catch (e) {
      console.error("Failed to create composition", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCreateNormale = () => {
    setEditingNormale(null);
    setNormaleTitle(`Session Normale ${normales.length + 1}`);
    setNormaleCode(`SN-G1-S${normales.length + 1}`);
    setNormalePromo('G1');
    setNormaleSemester(`Semestre ${Math.min(normales.length + 1, 6)}`);
    setNormaleDescription('Session d\'évaluation normale et examens semestriels');
    setNormaleTargetDate(new Date().toISOString().split('T')[0]);
    setIsCreateNormaleOpen(true);
  };

  const handleOpenEditNormale = (normale: any) => {
    setEditingNormale(normale);
    setNormaleTitle(normale.title || '');
    setNormaleCode(normale.code || '');
    setNormalePromo(normale.promo || 'G1');
    setNormaleSemester(normale.semester || 'Semestre 1');
    setNormaleDescription(normale.description || '');
    setNormaleTargetDate(normale.targetDate || new Date().toISOString().split('T')[0]);
    setIsEditNormaleOpen(true);
  };

  const handleDuplicateNormale = (normale: any) => {
    setEditingNormale(null);
    const count = normales.filter(n => n.promo === normale.promo).length + 1;
    setNormaleTitle(`${normale.title} (Copie / Session ${count})`);
    setNormaleCode(`NM-${normale.promo}-S${count}`);
    setNormalePromo(normale.promo || 'G1');
    setNormaleSemester(normale.semester ? `${normale.semester}` : `Semestre ${count}`);
    setNormaleDescription(normale.description || '');
    setNormaleTargetDate(new Date().toISOString().split('T')[0]);
    setIsCreateNormaleOpen(true);
  };

  const handleSaveEditNormale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNormale || !normaleTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: normaleTitle,
        code: normaleCode,
        promo: normalePromo,
        semester: normaleSemester,
        description: normaleDescription,
        targetDate: normaleTargetDate,
      };

      const res = await fetch(`/api/normales/${editingNormale.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        setNormales(prev => prev.map(n => n.id === editingNormale.id ? updated : n));
        if (selectedNormaleDetail?.id === editingNormale.id) {
          setSelectedNormaleDetail(updated);
        }
        setIsEditNormaleOpen(false);
        setEditingNormale(null);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to update normale", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNormale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!normaleTitle.trim() || !normalePromo) return;

    setIsSubmitting(true);
    try {
      const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');
      const payload = {
        title: normaleTitle,
        code: normaleCode || `NM-${normalePromo}-${Date.now().toString().slice(-4)}`,
        promo: normalePromo,
        semester: normaleSemester,
        description: normaleDescription,
        targetDate: normaleTargetDate,
        titulaireId: teacher?.id || teacherData?.id || "TCH-001",
        titulaireName: teacher?.name || teacherData?.name || "Dr. Jean-Paul Kamga",
        titulaireSpecialty: teacher?.mainSpecialty || teacher?.department || "Informatique",
        compositionIds: selectedNormaleCompIds
      };

      const res = await fetch('/api/normales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        setNormales([created, ...normales]);
        setIsCreateNormaleOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to create normale", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublishNormale = async (normaleItem: any) => {
    try {
      const willPublish = !normaleItem.isPublished;
      const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');
      const res = await fetch(`/api/normales/${normaleItem.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: willPublish,
          publishedBy: teacher?.name || teacherData?.name || normaleItem.titulaireName
        })
      });

      if (res.ok) {
        const resData = await res.json();
        setNormales(prev => prev.map(n => n.id === normaleItem.id ? resData.normale : n));
        fetchData();
      }
    } catch (err) {
      console.error("Failed to toggle publish for normale", err);
    }
  };

  const handleDeleteNormale = async (normaleId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette Session Normale (NM) ?")) return;
    try {
      const res = await fetch(`/api/normales/${normaleId}`, { method: 'DELETE' });
      if (res.ok) {
        setNormales(prev => prev.filter(n => n.id !== normaleId));
        if (selectedNormaleDetail?.id === normaleId) {
          setSelectedNormaleDetail(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete normale", err);
    }
  };

  const handleTogglePublish = async (comp: Composition) => {
    const nextPublished = comp.isPublished === false ? true : false;
    try {
      const res = await fetch(`/api/compositions/${comp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: nextPublished })
      });
      if (res.ok) {
        setCompositions(prev => prev.map(c => c.id === comp.id ? { ...c, isPublished: nextPublished } : c));
      }
    } catch (e) {
      console.error("Failed to toggle publish status", e);
    }
  };

  const handleBatchPublish = async (publish: boolean) => {
    try {
      const targetComps = compositions.filter(c => publish ? (c.isPublished === false) : (c.isPublished !== false));
      if (targetComps.length === 0) return;
      
      await Promise.all(targetComps.map(c =>
        fetch(`/api/compositions/${c.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublished: publish })
        })
      ));

      setCompositions(prev => prev.map(c => ({ ...c, isPublished: publish })));
    } catch (e) {
      console.error("Failed batch publish", e);
    }
  };

  const handleToggleCompositionToNormale = async (normaleId: string, compositionId: string) => {
    try {
      const res = await fetch(`/api/normales/${normaleId}/toggle-composition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compositionId })
      });
      if (res.ok) {
        const data = await res.json();
        setNormales(prev => prev.map(n => n.id === normaleId ? data.normale : n));
        if (managingNormale?.id === normaleId) {
          setManagingNormale(data.normale);
        }
        // Refresh compositions to synchronize normaleId
        const compRes = await fetch('/api/compositions?includeDrafts=true').then(r => r.json());
        if (Array.isArray(compRes)) setCompositions(compRes);
      }
    } catch (err) {
      console.error("Failed to toggle composition linking to normale", err);
    }
  };

  const handleOpenEditComposition = (comp: Composition) => {
    setEditingComposition(comp);
    setNewTitle(comp.title || '');
    setNewType(comp.type || 'CC');
    setNewNormaleId((comp as any).normaleId || 'none');
    setNewPromo(comp.promo || 'G1');
    setNewCoefficient(comp.coefficient || 1);
    setNewMaxScore(comp.maxScore || 20);
    setNewDate(comp.date || new Date().toISOString().split('T')[0]);
    setNewIsPublished(comp.isPublished !== false);
    setNewSubjectText(comp.subjectText || '');
    setNewDurationMinutes(comp.durationMinutes || 120);
    setNewAllowSubmissions(Boolean(comp.allowStudentSubmissions || comp.requiresSubmission));
    setNewSubmissionDeadline(comp.submissionDeadline || '');
    setNewResources(Array.isArray(comp.resources) ? comp.resources : []);
  };

  const handleSaveEditComposition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComposition || !newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: newTitle,
        type: newType,
        normaleId: newNormaleId !== 'none' ? newNormaleId : null,
        promo: newPromo,
        coefficient: Number(newCoefficient),
        maxScore: Number(newMaxScore),
        date: newDate,
        isPublished: newIsPublished,
        durationMinutes: Number(newDurationMinutes) || 120,
        subjectText: newSubjectText,
        resources: newResources,
        allowStudentSubmissions: newAllowSubmissions,
        requiresSubmission: newAllowSubmissions,
        submissionDeadline: newSubmissionDeadline
      };

      const res = await fetch(`/api/compositions/${editingComposition.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        setCompositions(prev => prev.map(c => c.id === editingComposition.id ? updated : c));

        // Sync with normale if changed
        if (newNormaleId && newNormaleId !== 'none') {
          await fetch(`/api/normales/${newNormaleId}/toggle-composition`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ compositionId: editingComposition.id })
          });
        }

        setEditingComposition(null);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to edit composition", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenGrading = (comp: Composition) => {
    setGradingComposition(comp);
    // Copy existing grades or populate missing students
    const existingMap = new Map((comp.grades || []).map(g => [g.studentId, g]));
    
    // Filter students for this promo or take all if promo='Toutes'
    const promoStudents = comp.promo && comp.promo !== 'Toutes'
      ? students.filter(s => s.promo === comp.promo)
      : students;

    const fullGrades = promoStudents.map(s => {
      const existing = existingMap.get(s.id);
      return existing || {
        studentId: s.id,
        studentName: s.name,
        promo: s.promo || comp.promo || "G1",
        email: s.email || "",
        score: 0,
        comments: ""
      };
    });

    setCurrentGrades(fullGrades);
  };

  const handleScoreChange = (studentId: string, scoreVal: number) => {
    const clamped = Math.max(0, Math.min(gradingComposition?.maxScore || 20, scoreVal));
    setCurrentGrades(prev => prev.map(g => g.studentId === studentId ? { ...g, score: clamped } : g));
  };

  const handleCommentChange = (studentId: string, comments: string) => {
    setCurrentGrades(prev => prev.map(g => g.studentId === studentId ? { ...g, comments } : g));
  };

  const handleSaveGrades = async (statusOverride?: 'Ouverte' | 'Clôturée') => {
    if (!gradingComposition) return;
    setIsSubmitting(true);
    try {
      const newStatus = statusOverride || gradingComposition.status;
      const res = await fetch(`/api/compositions/${gradingComposition.id}/grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grades: currentGrades,
          status: newStatus
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setCompositions(prev => prev.map(c => c.id === updated.id ? updated : c));
        setGradingComposition(null);
      }
    } catch (e) {
      console.error("Failed to save grades", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLock = async (comp: Composition) => {
    const nextStatus = comp.status === 'Ouverte' ? 'Clôturée' : 'Ouverte';
    try {
      const res = await fetch(`/api/compositions/${comp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setCompositions(prev => prev.map(c => c.id === comp.id ? { ...c, status: nextStatus } : c));
      }
    } catch (e) {
      console.error("Failed to toggle status", e);
    }
  };

  const handleDeleteComposition = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette évaluation ?")) return;
    try {
      const res = await fetch(`/api/compositions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCompositions(prev => prev.filter(c => c.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete composition", e);
    }
  };

  // Helper to calculate student averages for Report Card
  const calculateStudentTranscript = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    // Group compositions by subject
    const subjectMap = new Map<string, {
      subject: string;
      evaluations: { title: string; type: string; score: number; maxScore: number; coeff: number }[];
      totalWeightedScore: number;
      totalCoeff: number;
    }>();

    compositions.forEach(comp => {
      const stGrade = comp.grades?.find(g => g.studentId === studentId);
      if (stGrade) {
        const subjectName = comp.subject || "Matière Générale";
        if (!subjectMap.has(subjectName)) {
          subjectMap.set(subjectName, {
            subject: subjectName,
            evaluations: [],
            totalWeightedScore: 0,
            totalCoeff: 0
          });
        }
        const subjObj = subjectMap.get(subjectName)!;
        const normalizedScore = (stGrade.score / (comp.maxScore || 20)) * 20; // scale to /20
        subjObj.evaluations.push({
          title: comp.title,
          type: comp.type,
          score: stGrade.score,
          maxScore: comp.maxScore || 20,
          coeff: comp.coefficient || 1
        });
        subjObj.totalWeightedScore += normalizedScore * (comp.coefficient || 1);
        subjObj.totalCoeff += (comp.coefficient || 1);
      }
    });

    const subjectBreakdown = Array.from(subjectMap.values()).map(item => {
      const subjectAverage = item.totalCoeff > 0 ? (item.totalWeightedScore / item.totalCoeff) : 0;
      let mention = "Ajourné";
      if (subjectAverage >= 16) mention = "Très Bien";
      else if (subjectAverage >= 14) mention = "Bien";
      else if (subjectAverage >= 12) mention = "Assez Bien";
      else if (subjectAverage >= 10) mention = "Passable";

      return {
        ...item,
        subjectAverage: Math.round(subjectAverage * 100) / 100,
        mention
      };
    });

    const totalWeightedSum = subjectBreakdown.reduce((acc, curr) => acc + (curr.subjectAverage * curr.totalCoeff), 0);
    const globalCoeffSum = subjectBreakdown.reduce((acc, curr) => acc + curr.totalCoeff, 0);
    const globalAverage = globalCoeffSum > 0 ? Math.round((totalWeightedSum / globalCoeffSum) * 100) / 100 : 0;

    let decision = "Ajourné";
    if (globalAverage >= 10) decision = "Admis(e)";

    return {
      student,
      subjectBreakdown,
      globalAverage,
      globalCoeffSum,
      decision
    };
  };

  // Export Compositions to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Titre,Type,Matiere,Classe,Coeff,Date,Statut,Etudiant,Note,NoteMax,Remarque\n";
    compositions.forEach(comp => {
      (comp.grades || []).forEach(g => {
        csvContent += `"${comp.id}","${comp.title}","${comp.type}","${comp.subject}","${comp.promo}",${comp.coefficient},"${comp.date}","${comp.status}","${g.studentName}",${g.score},${comp.maxScore},"${g.comments || ''}"\n`;
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `compositions_itmc_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logic
  const filteredCompositions = compositions.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.promo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'Tous' || c.type === selectedType;
    const matchesPromo = selectedPromo === 'Toutes' || c.promo === selectedPromo;
    const matchesSubject = selectedSubject === 'Toutes' || c.subject === selectedSubject;
    const matchesStatus = selectedStatus === 'Tous' || c.status === selectedStatus;

    return matchesSearch && matchesType && matchesPromo && matchesSubject && matchesStatus;
  });

  // Unique lists for filters
  const uniqueSubjects = Array.from(new Set([
    "Architecture des Ordinateurs",
    "Algorithmique Avancée",
    "Sécurité Réseaux",
    "Base de Données Relationales",
    ...compositions.map(c => c.subject).filter(Boolean)
  ]));

  const uniquePromos = Array.from(new Set([
    "G1", "G2", "G3", "R1", "R2",
    ...students.map(s => s.promo).filter(Boolean)
  ]));

  // Global metrics
  const totalCompositions = compositions.length;
  const totalCC = compositions.filter(c => c.type === 'CC').length;
  const totalTD = compositions.filter(c => c.type === 'TD').length;
  const totalExam = compositions.filter(c => c.type === 'Composition Normale').length;

  const allScores = compositions.flatMap(c => (c.grades || []).map(g => (g.score / (c.maxScore || 20)) * 20));
  const globalClassAvg = allScores.length > 0 
    ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10 
    : 14.5;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 dark:from-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 font-black text-[9px] sm:text-[10px] uppercase tracking-widest px-2.5 py-0.5 sm:px-3 sm:py-1">
              Année Académique 2025-2026
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
            <FileSpreadsheet className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-blue-400 shrink-0" />
            <span>Gestion des Compositions & Évaluations</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
            Créez vos **Contrôles Continus (CC)**, **TD** et **Compositions Normales**, saisissez les notes par classe, et **publiez ou bloquez les relevés** en un clic.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 relative z-10 w-full lg:w-auto">
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="h-10 sm:h-12 px-3 sm:px-6 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> 
            <span className="truncate">Nouvelle Évaluation</span>
          </Button>

          <Button 
            onClick={() => handleOpenAnnualConfigModal()}
            className="h-10 sm:h-12 px-3 sm:px-5 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto"
            title="Activer le Bulletin de Fin d'Année et sélectionner les compositions arrêtées"
          >
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-950 shrink-0" /> 
            <span className="truncate">Bulletin Fin d'Année</span>
          </Button>

          <Button 
            onClick={() => setIsReportOpen(true)}
            variant="outline"
            className="h-10 sm:h-12 px-3 sm:px-5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white border-white/20 font-black text-[10px] sm:text-xs uppercase tracking-wider backdrop-blur-md flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto"
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" /> 
            <span className="truncate">Relevé de Notes PDF</span>
          </Button>

          <Button
            onClick={() => handleBatchPublish(true)}
            variant="outline"
            className="h-10 sm:h-12 px-3 rounded-xl sm:rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/30 font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 w-full sm:w-auto"
            title="Rendre toutes les notes visibles aux élèves"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" /> 
            <span className="truncate">Tout Publier</span>
          </Button>

          <Button
            onClick={() => handleBatchPublish(false)}
            variant="outline"
            className="h-10 sm:h-12 px-3 rounded-xl sm:rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-400/30 font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 w-full sm:w-auto"
            title="Masquer toutes les notes aux élèves"
          >
            <EyeOff className="w-3.5 h-3.5 shrink-0" /> 
            <span className="truncate">Tout Bloquer</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xl border border-blue-100 dark:border-blue-900">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Évaluations</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalCompositions}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1">{totalCC} CC • {totalTD} TD • {totalExam} Normales</p>
          </div>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl border border-indigo-100 dark:border-indigo-900">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Moyenne Générale</p>
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{globalClassAvg} / 20</h3>
            <p className="text-[10px] font-bold text-emerald-500 mt-1">Niveau d'excellence global</p>
          </div>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl border border-emerald-100 dark:border-emerald-900">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Étudiants Évalués</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{students.length}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Promos G1, G2, R1 actives</p>
          </div>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-xl border border-amber-100 dark:border-amber-900">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Évaluations Clôturées</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {compositions.filter(c => c.status === 'Clôturée').length} / {compositions.length}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Notes verrouillées</p>
          </div>
        </Card>
      </div>

      {/* Academic Tab Switcher: Compositions vs Sessions Normales (NM) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('compositions')}
            className={cn(
              "px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2.5 transition-all cursor-pointer w-full text-center truncate",
              activeTab === 'compositions'
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Évaluations ({compositions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('normales')}
            className={cn(
              "px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2.5 transition-all cursor-pointer w-full text-center relative truncate",
              activeTab === 'normales'
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span className="truncate">Sessions NM ({normales.length})</span>
            <Badge className="bg-amber-400/90 text-amber-950 font-black text-[8px] sm:text-[9px] px-1.5 py-0 border-none shrink-0 hidden md:inline-flex">
              Titulaire
            </Badge>
          </button>
        </div>

        {activeTab === 'normales' ? (
          <Button
            onClick={handleOpenCreateNormale}
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> <span className="truncate">Créer une Session NM</span>
          </Button>
        ) : (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> <span className="truncate">Nouvelle Évaluation</span>
          </Button>
        )}
      </div>

      {activeTab === 'normales' ? (
        /* NORMALES (NM) SESSIONS TAB VIEW */
        <div className="space-y-6">
          {/* Titulaire Authority Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 dark:from-amber-950/40 dark:to-indigo-950/40 p-6 rounded-[2rem] border border-amber-300/40 dark:border-amber-700/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Pôle Délibérations & Enseignants Titulaires
                  </h3>
                  <Badge className="bg-amber-500 text-amber-950 font-black text-[9px] uppercase px-2 py-0.5 border-none">
                    Titulaire Attitré
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  L'enseignant titulaire peut <strong>créer autant de sessions et de semestres qu'il le souhaite</strong> avec les <strong>titres libres de son choix</strong> (Semestre 1, 2, 3, 4, Rattrapage, Examens Blancs...). Lorsque les formateurs rattachent leurs CC et compositions, le titulaire a la pleine autorité pour <strong>publier ou bloquer les relevés</strong>.
                </p>
              </div>
            </div>

            <Button
              onClick={handleOpenCreateNormale}
              className="h-11 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider shrink-0 gap-2 shadow-lg shadow-amber-600/20"
            >
              <Plus className="w-4 h-4" /> + Nouvelle Session NM
            </Button>
          </div>

          {/* Normales Search and Filtering Bar */}
          <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher une session, un semestre, code..."
                value={normaleSearchTerm}
                onChange={(e) => setNormaleSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-slate-50 dark:bg-slate-800/60 border-none rounded-xl font-medium text-xs text-slate-900 dark:text-white"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider hidden sm:inline">Filtrer Promo :</span>
              <Select value={normalePromoFilter} onValueChange={setNormalePromoFilter}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold border-none w-full sm:w-44">
                  <SelectValue placeholder="Toutes les promos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Toutes">Toutes les promos</SelectItem>
                  {uniquePromos.map(p => (
                    <SelectItem key={p} value={p}>Promo {p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Normales Grid */}
          {normales.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-8">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Aucune Session Normale (NM) enregistrée</h3>
              <p className="text-xs text-slate-500 font-medium max-w-md mx-auto mt-1 mb-6">
                Créez une session normale pour regrouper les épreuves et CC du semestre, puis publiez les notes pour les étudiants.
              </p>
              <Button onClick={handleOpenCreateNormale} className="rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase px-6 h-11">
                <Plus className="w-4 h-4 mr-2" /> Créer une Session Normale (NM)
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {normales
                .filter(n => {
                  const matchSearch = !normaleSearchTerm.trim() || 
                    (n.title && n.title.toLowerCase().includes(normaleSearchTerm.toLowerCase())) ||
                    (n.semester && n.semester.toLowerCase().includes(normaleSearchTerm.toLowerCase())) ||
                    (n.code && n.code.toLowerCase().includes(normaleSearchTerm.toLowerCase())) ||
                    (n.promo && n.promo.toLowerCase().includes(normaleSearchTerm.toLowerCase()));
                  const matchPromo = normalePromoFilter === 'Toutes' || n.promo === normalePromoFilter;
                  return matchSearch && matchPromo;
                })
                .map((normale) => {
                // Find compositions attached to this Normale
                const linkedComps = compositions.filter(c => 
                  c.normaleId === normale.id || (normale.compositionIds && normale.compositionIds.includes(c.id))
                );
                
                // Calculate participants and average
                const allGradeScores = linkedComps.flatMap(c => (c.grades || []).map(g => (g.score / (c.maxScore || 20)) * 20));
                const normaleAvg = allGradeScores.length > 0 
                  ? (allGradeScores.reduce((a, b) => a + b, 0) / allGradeScores.length).toFixed(2)
                  : "En attente";

                const isPublished = normale.isPublished === true;

                return (
                  <motion.div
                    key={normale.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full space-y-6">
                      <div className="space-y-4">
                        {/* Header card info */}
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <Badge className="bg-indigo-600 text-white font-black text-[10px] uppercase px-2.5 py-0.5 border-none">
                                Session Normale (NM)
                              </Badge>
                              <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-black text-[10px] uppercase px-2 py-0.5 border-none">
                                Promo {normale.promo}
                              </Badge>
                              <Badge variant="outline" className="text-slate-500 font-bold text-[10px] border-slate-200">
                                {normale.semester || "Semestre 1"}
                              </Badge>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                              {normale.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                              Code : <strong className="text-slate-700 dark:text-slate-300">{normale.code}</strong> • Date : {normale.targetDate || "Session 2026"}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isPublished ? (
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-black text-[10px] uppercase px-3 py-1 flex items-center gap-1.5 shrink-0">
                                <Globe className="w-3.5 h-3.5 text-emerald-600" /> Publiée aux Élèves
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-black text-[10px] uppercase px-3 py-1 flex items-center gap-1.5 shrink-0">
                                <EyeOff className="w-3.5 h-3.5 text-amber-600" /> Masquée / Bloquée
                              </Badge>
                            )}

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleOpenEditNormale(normale)}
                              title="Modifier les informations de la session"
                              className="h-9 w-9 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 shrink-0"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDuplicateNormale(normale)}
                              title="Dupliquer / Créer le semestre suivant"
                              className="h-9 w-9 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 shrink-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Titulaire Info */}
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                            <Crown className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Enseignant Titulaire Responsable</p>
                            <p className="font-black text-slate-900 dark:text-white">{normale.titulaireName || "Dr. Jean-Paul Kamga"}</p>
                          </div>
                        </div>

                        {/* Included Compositions / CCs */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider">
                            <span>Évaluations & CC inclus ({linkedComps.length})</span>
                            <span className="text-indigo-600">Moy. Générale : {normaleAvg} / 20</span>
                          </div>

                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {linkedComps.length === 0 ? (
                              <div className="p-3 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-400 font-medium">
                                Aucun CC rattaché pour l'instant. Les formateurs peuvent sélectionner cette Normale lors de la création d'évaluations.
                              </div>
                            ) : (
                              linkedComps.map(c => (
                                <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-black text-[9px] border-none">
                                      {c.type}
                                    </Badge>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{c.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0 font-bold text-slate-500">
                                    <span>Coeff {c.coefficient || 1}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-blue-600">/{c.maxScore || 20}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons & Publish Toggle */}
                      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleTogglePublishNormale(normale)}
                            className={cn(
                              "flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                              isPublished
                                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                            )}
                          >
                            {isPublished ? (
                              <>
                                <EyeOff className="w-4 h-4" /> Bloquer la Session Normale
                              </>
                            ) : (
                              <>
                                <Globe className="w-4 h-4" /> Publier la Session Normale (NM)
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={() => {
                              setManagingNormale(normale);
                              setIsManageNormaleCompsOpen(true);
                            }}
                            variant="outline"
                            className="h-12 px-3 rounded-2xl border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-black text-xs uppercase flex items-center gap-1.5 shrink-0 hover:bg-indigo-100"
                            title="Rattacher ou détacher des CC / évaluations à tout moment"
                          >
                            <Layers className="w-4 h-4 text-indigo-600" /> Gérer CC
                          </Button>

                          <Button
                            onClick={() => handleOpenEditNormale(normale)}
                            variant="outline"
                            className="h-12 px-3 rounded-2xl border-slate-200 dark:border-slate-800 font-black text-xs uppercase flex items-center gap-1.5 shrink-0"
                            title="Modifier le titre, semestre ou date"
                          >
                            <Edit3 className="w-4 h-4 text-slate-600 dark:text-slate-300" /> Modifier
                          </Button>

                          <Button
                            onClick={() => setSelectedNormaleDetail(normale)}
                            variant="outline"
                            className="h-12 px-4 rounded-2xl border-slate-200 dark:border-slate-800 font-black text-xs uppercase flex items-center gap-2 shrink-0"
                            title="Consulter le PV de délibération"
                          >
                            <FileText className="w-4 h-4 text-indigo-600" /> PV Délibération
                          </Button>

                          <Button
                            onClick={() => handleDeleteNormale(normale.id)}
                            size="icon"
                            variant="ghost"
                            className="h-12 w-12 rounded-2xl hover:bg-red-50 text-slate-400 hover:text-red-500 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* COMPOSITIONS & CC TAB VIEW */
        <>
          {/* Filters & Search Control Toolbar */}
          <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Rechercher une évaluation, matière, classe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-12 bg-slate-50 dark:bg-slate-800/60 border-none rounded-2xl font-medium text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Quick Type Tabs */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto">
                {['Tous', 'CC', 'TD', 'Composition Normale'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap",
                      selectedType === type
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Filtrer par Matière</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold border-none">
                    <SelectValue placeholder="Toutes les matières" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Toutes">Toutes les matières</SelectItem>
                    {uniqueSubjects.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Filtrer par Classe / Promo</label>
                <Select value={selectedPromo} onValueChange={setSelectedPromo}>
                  <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold border-none">
                    <SelectValue placeholder="Toutes les promos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Toutes">Toutes les promos</SelectItem>
                    {uniquePromos.map(p => (
                      <SelectItem key={p} value={p}>Promo {p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Filtrer par Statut</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold border-none">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous">Tous les statuts</SelectItem>
                    <SelectItem value="Ouverte">Ouverte (Saisie autorisée)</SelectItem>
                    <SelectItem value="Clôturée">Clôturée (Verrouillée)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

      {/* Compositions List Grid */}
      {loading || isFiltering ? (
        <GradeGridSkeleton count={6} />
      ) : filteredCompositions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-8">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Aucune évaluation trouvée</h3>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto mt-1 mb-6">
            Aucun Contrôle Continu (CC), TD ou Composition ne correspond à vos filtres actuels.
          </p>
          <Button onClick={() => setIsCreateOpen(true)} className="rounded-2xl bg-blue-600 text-white font-black text-xs uppercase px-6 h-11">
            <Plus className="w-4 h-4 mr-2" /> Créer une Évaluation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompositions.map((comp) => {
            const gradesList = comp.grades || [];
            const isClosed = comp.status === 'Clôturée';
            const validScores = gradesList.map(g => (g.score / (comp.maxScore || 20)) * 20);
            const compAvg = validScores.length > 0 
              ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10 
              : 0;

            const badgeColor = comp.type === 'CC' 
              ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              : comp.type === 'TD'
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";

            return (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
              >
                <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <Badge className={cn("border-none font-black text-[9px] uppercase px-2.5 py-0.5", badgeColor)}>
                            {comp.type}
                          </Badge>
                          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-none font-black text-[9px] uppercase px-2 py-0.5">
                            Promo {comp.promo}
                          </Badge>
                          <Badge className={cn("border-none font-black text-[9px] uppercase px-2 py-0.5", isClosed ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300")}>
                            {isClosed ? "Clôturée" : "Ouverte"}
                          </Badge>
                          {comp.isPublished === false ? (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-black text-[9px] uppercase px-2 py-0.5 flex items-center gap-1">
                              <EyeOff className="w-2.5 h-2.5 text-amber-600" /> Relevé Bloqué
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-black text-[9px] uppercase px-2 py-0.5 flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5 text-emerald-600" /> Relevé Publié
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 transition-colors pt-1">
                          {comp.title}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" /> <span className="truncate">{comp.subject}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleTogglePublish(comp)}
                          title={comp.isPublished === false ? "Publier les notes aux élèves" : "Bloquer l'accès aux élèves"}
                          className={cn("rounded-xl h-9 w-9", comp.isPublished === false ? "text-amber-600 bg-amber-50 dark:bg-amber-950/30" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30")}
                        >
                          {comp.isPublished === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleToggleLock(comp)}
                          title={isClosed ? "Déverrouiller l'évaluation" : "Clôturer l'évaluation"}
                          className="rounded-xl h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {isClosed ? <Lock className="w-4 h-4 text-red-500" /> : <Unlock className="w-4 h-4 text-emerald-500" />}
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Coefficient</p>
                        <p className="font-black text-slate-900 dark:text-white">Coeff {comp.coefficient || 1}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Barème Max</p>
                        <p className="font-black text-slate-900 dark:text-white">/{comp.maxScore || 20} Pts</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Date</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{comp.date}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Moyenne Classe</p>
                        <p className="font-black text-blue-600 dark:text-blue-400">{compAvg} / 20</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Direct Quick Publish Status Strip */}
                    <div className={cn(
                      "px-3 py-2 rounded-xl text-[10px] font-black flex items-center justify-between transition-colors",
                      comp.isPublished === false 
                        ? "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60" 
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60"
                    )}>
                      <span className="flex items-center gap-1.5">
                        {comp.isPublished === false ? (
                          <><EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Notes masquées aux étudiants</>
                        ) : (
                          <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Relevé accessible aux étudiants</>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(comp)}
                        className={cn(
                          "underline hover:no-underline font-black uppercase text-[9px] cursor-pointer ml-2",
                          comp.isPublished === false ? "text-amber-700 hover:text-amber-900" : "text-emerald-700 hover:text-emerald-900"
                        )}
                      >
                        {comp.isPublished === false ? "Débloquer & Publier" : "Bloquer l'accès"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>{gradesList.filter(g => g.score > 0).length} / {gradesList.length || students.length} étudiants notés</span>
                      <span>{Math.round(((gradesList.filter(g => g.score > 0).length) / (gradesList.length || students.length || 1)) * 100)}%</span>
                    </div>
                    <Progress value={((gradesList.filter(g => g.score > 0).length) / (gradesList.length || students.length || 1)) * 100} className="h-1.5" />

                    {/* Student Submissions Management Button */}
                    {(comp.allowStudentSubmissions || comp.requiresSubmission || (Array.isArray(comp.submissions) && comp.submissions.length > 0)) && (
                      <Button
                        type="button"
                        onClick={() => setSelectedCompForSubmissions(comp)}
                        className="w-full h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-black text-xs flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800 transition-all shadow-xs"
                      >
                        <FolderCheck className="w-4 h-4 text-indigo-600" />
                        <span>Consulter les Copies Reçues ({comp.submissions?.length || 0})</span>
                      </Button>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        onClick={() => handleOpenGrading(comp)}
                        className="flex-1 h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-wider shadow-md hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white transition-all flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {isClosed ? "Consulter Notes" : "Saisir / Modifier"}
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleOpenEditComposition(comp)}
                        title="Éditer l'évaluation et la rattacher à une Session NM à tout moment"
                        className="h-11 w-11 rounded-xl border-slate-200 dark:border-slate-800 shrink-0 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setIsPrintListOpen(comp)}
                        title="Imprimer PV de Notes"
                        className="h-11 w-11 rounded-xl border-slate-200 dark:border-slate-800 shrink-0"
                      >
                        <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteComposition(comp.id)}
                        title="Supprimer l'évaluation"
                        className="h-11 w-11 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  )}

      {/* MODAL 1: Create Evaluation Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-3xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-2">
              <Plus className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
              Créer une Nouvelle Évaluation
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Définissez le type, la matière, sélectionnez les étudiants (groupé ou individuel) et attribuez les notes
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateComposition} className="space-y-5 mt-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Titre de l'évaluation</label>
              <Input
                required
                placeholder="ex: CC1 - Pipeline & Mémoire Cache"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Type d'évaluation</label>
                <Select value={newType} onValueChange={(val: any) => setNewType(val)}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Contrôle Continu (CC)</SelectItem>
                    <SelectItem value="TD">Travaux Dirigés (TD)</SelectItem>
                    <SelectItem value="Composition Normale">Composition Normale (Examen)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Classe / Promotion Principale</label>
                <Select value={newPromo} onValueChange={setNewPromo}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Toutes">Toutes les Promos</SelectItem>
                    {uniquePromos.map(p => (
                      <SelectItem key={p} value={p}>Promo {p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Link to Session Normale (NM) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Inclure dans une Session Normale (NM)
              </label>
              <Select value={newNormaleId || "none"} onValueChange={(val) => setNewNormaleId(val === "none" ? "" : val)}>
                <SelectTrigger className="h-12 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 font-bold text-xs border border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200">
                  <SelectValue placeholder="-- Aucune session normale (Évaluation isolée) --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Aucune (Évaluation autonome) --</SelectItem>
                  {normales.map(n => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.title} (Promo {n.promo} • {n.semester})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400 font-medium">
                En incluant ce CC/Examen dans une Normale, l'enseignant titulaire pourra délibérer et publier le relevé global aux élèves.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Matières / Disciplines (Sélection Multiple)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                {uniqueSubjects.map(s => {
                  const isChecked = selectedSubjects.includes(s);
                  return (
                    <div 
                      key={s}
                      onClick={() => {
                        if (isChecked) {
                          if (selectedSubjects.length > 1) {
                            setSelectedSubjects(selectedSubjects.filter(sub => sub !== s));
                          }
                        } else {
                          setSelectedSubjects([...selectedSubjects, s]);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-xl cursor-pointer text-xs font-bold transition-all",
                        isChecked ? "bg-blue-600 text-white shadow-md" : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                      )}
                    >
                      <div className={cn("w-4 h-4 rounded border flex items-center justify-center text-[10px] flex-shrink-0", isChecked ? "bg-white text-blue-600 border-white" : "border-slate-400")}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Coefficient</label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  value={newCoefficient}
                  onChange={(e) => setNewCoefficient(Number(e.target.value))}
                  className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-center text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Barème Max</label>
                <Input
                  type="number"
                  value={newMaxScore}
                  onChange={(e) => setNewMaxScore(Number(e.target.value))}
                  className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-center text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Date d'Examen</label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs"
                />
              </div>
            </div>

            {/* SUBJECT INSTRUCTIONS & RESOURCE DIFFUSION SECTION */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                    Sujet de l'Épreuve & Diffusion des Ressources
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">Durée :</span>
                  <Input
                    type="number"
                    min={15}
                    max={480}
                    value={newDurationMinutes}
                    onChange={(e) => setNewDurationMinutes(Number(e.target.value))}
                    className="w-20 h-7 text-center font-black text-xs bg-white dark:bg-slate-800 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">min</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Consignes, Énoncé ou Questions de l'Évaluation
                </label>
                <textarea
                  placeholder="Saisissez ici les consignes, les exercices, directives ou le barème de l'épreuve..."
                  value={newSubjectText}
                  onChange={(e) => setNewSubjectText(e.target.value)}
                  className="w-full h-24 p-3 rounded-xl bg-white dark:bg-slate-800 text-xs font-medium border border-indigo-100 dark:border-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Resources Attachment: PDF Subject & Images */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Fichiers du Sujet Diffusés aux Étudiants ({newResources.length})
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="h-8 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px] uppercase cursor-pointer flex items-center gap-1.5 border border-rose-200">
                      <FileText className="w-3.5 h-3.5 text-rose-600" />
                      <span>+ Sujet PDF (max 3Mo)</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => handleAddResourceFile(e, 'pdf')}
                      />
                    </label>

                    <label className="h-8 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px] uppercase cursor-pointer flex items-center gap-1.5 border border-blue-200">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>+ Image Sujet (max 4Mo)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleAddResourceFile(e, 'image')}
                      />
                    </label>
                  </div>
                </div>

                {newResources.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {newResources.map(res => (
                      <div key={res.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {res.type === 'pdf' ? <FileText className="w-4 h-4 text-rose-600 shrink-0" /> : <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />}
                          <span className="font-bold truncate text-slate-800 dark:text-slate-200">{res.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewResources(prev => prev.filter(r => r.id !== res.id))}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* STUDENT COPIES SUBMISSIONS ACTIVATION */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FolderCheck className="w-4 h-4 text-indigo-600" />
                  Exiger / Autoriser le dépôt de copie en ligne par les étudiants
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Si activé, les étudiants pourront renvoyer leur copie sous forme de <strong>PDF (max 3 Mo)</strong> ou de <strong>photos de copies manuscrites (max 7 images de 4 Mo chacune)</strong>. Vous pourrez ensuite consulter et noter chaque copie dans la section "Copies Reçues".
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={newAllowSubmissions}
                  onChange={(e) => setNewAllowSubmissions(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* STUDENT SELECTION & DIRECT POINT INPUT SECTION */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Étudiants Participants & Points Obtenus
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sélectionnez les élèves et saisissez optionnellement leurs notes directes
                  </p>
                </div>

                {/* Selection Mode Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setStudentSelectionMode('grouped')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5",
                      studentSelectionMode === 'grouped'
                        ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <Building className="w-3.5 h-3.5" /> Groupé (Promo {newPromo})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentSelectionMode('manual')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5",
                      studentSelectionMode === 'manual'
                        ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <Users className="w-3.5 h-3.5" /> Sélection Manuelle
                  </button>
                </div>
              </div>

              {/* Filter and Select/Deselect Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input
                    placeholder="Chercher un étudiant..."
                    value={studentSearchInCreate}
                    onChange={(e) => setStudentSearchInCreate(e.target.value)}
                    className="pl-9 h-9 bg-white dark:bg-slate-900 border-none rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-black text-[10px] px-3 py-1 border-none">
                    {students.filter(s => selectedStudentMap[s.id]?.selected).length} / {students.length} retenus
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => selectAllStudentsInCreate(true)}
                      className="h-8 text-[10px] font-black text-blue-600 uppercase px-2"
                    >
                      Tout cocher
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => selectAllStudentsInCreate(false)}
                      className="h-8 text-[10px] font-black text-slate-400 uppercase px-2"
                    >
                      Tout décocher
                    </Button>
                  </div>
                </div>
              </div>

              {/* Student Rows Table */}
              <div className="max-h-64 overflow-y-auto overflow-x-auto w-full min-w-0 rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full min-w-[540px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-[9px] font-black text-slate-400 uppercase tracking-widest sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 z-10">
                      <th className="py-2.5 px-3 w-10 text-center">Part.</th>
                      <th className="py-2.5 px-3">Nom de l'Étudiant</th>
                      <th className="py-2.5 px-3">Promo</th>
                      <th className="py-2.5 px-3 w-28 text-center">Note ( /{newMaxScore} )</th>
                      <th className="py-2.5 px-3">Commentaire</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {students
                      .filter(s => 
                        s.name.toLowerCase().includes(studentSearchInCreate.toLowerCase()) || 
                        s.email.toLowerCase().includes(studentSearchInCreate.toLowerCase()) ||
                        s.promo.toLowerCase().includes(studentSearchInCreate.toLowerCase())
                      )
                      .map(s => {
                        const stState = selectedStudentMap[s.id] || { selected: false, score: 0, comments: '' };
                        return (
                          <tr 
                            key={s.id} 
                            className={cn(
                              "transition-colors",
                              stState.selected ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/40 opacity-50"
                            )}
                          >
                            <td className="py-2 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={stState.selected}
                                onChange={() => toggleStudentSelected(s.id)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <p className="font-bold text-slate-900 dark:text-white leading-tight">{s.name}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{s.email}</p>
                            </td>
                            <td className="py-2 px-3 font-black text-slate-500">{s.promo}</td>
                            <td className="py-2 px-3 text-center">
                              <Input
                                type="number"
                                step="0.25"
                                min={0}
                                max={newMaxScore}
                                disabled={!stState.selected}
                                value={stState.score}
                                onChange={(e) => updateStudentScoreInCreate(s.id, Number(e.target.value))}
                                className="w-20 mx-auto text-center font-black h-8 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <Input
                                placeholder="Appréciation..."
                                disabled={!stState.selected}
                                value={stState.comments}
                                onChange={(e) => updateStudentCommentInCreate(s.id, e.target.value)}
                                className="h-8 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold border-none"
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Direct Publishing Switch */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Publier directement le relevé aux étudiants
                </p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  Si activé, les notes et relevés seront instantanément visibles dans l'espace étudiant.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={newIsPublished}
                  onChange={(e) => setNewIsPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1 h-12 rounded-2xl font-bold">
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer l'évaluation"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Marks Input & Saisie des Notes Modal */}
      <Dialog open={!!gradingComposition} onOpenChange={(open) => !open && setGradingComposition(null)}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-3xl md:max-w-4xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          {gradingComposition && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-100 text-blue-700 border-none font-black text-[9px] uppercase px-3 py-1">
                    {gradingComposition.type}
                  </Badge>
                  <Badge className="bg-indigo-100 text-indigo-700 border-none font-black text-[9px] uppercase px-3 py-1">
                    Promo {gradingComposition.promo}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700 border-none font-black text-[9px] uppercase px-3 py-1">
                    Coeff {gradingComposition.coefficient}
                  </Badge>
                </div>
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
                  Saisie des Notes : {gradingComposition.title}
                </DialogTitle>
                <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Matière : {gradingComposition.subject} • Barème sur /{gradingComposition.maxScore || 20} Points
                </DialogDescription>
              </DialogHeader>

              {gradingComposition.status === 'Clôturée' && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Cette évaluation est actuellement <strong>CLÔTURÉE</strong>. Déverrouillez-la pour modifier les notes enregistrées.</span>
                </div>
              )}

              {/* Student Marks Table */}
              <div className="overflow-x-auto w-full min-w-0 rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full min-w-[620px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Étudiant</th>
                      <th className="py-3 px-4">Promo</th>
                      <th className="py-3 px-4 text-center">Note / {gradingComposition.maxScore || 20}</th>
                      <th className="py-3 px-4 text-center">Pourcentage</th>
                      <th className="py-3 px-4">Appréciation / Remarque</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                    {currentGrades.map((g, idx) => {
                      const perc = Math.round((g.score / (gradingComposition.maxScore || 20)) * 100);
                      return (
                        <tr key={g.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3.5 px-4 font-black text-slate-400">{idx + 1}</td>
                          <td className="py-3.5 px-4">
                            <p className="font-black text-slate-900 dark:text-white">{g.studentName}</p>
                            <p className="text-[10px] text-slate-400">{g.email}</p>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-600 dark:text-slate-400">{g.promo}</td>
                          <td className="py-3.5 px-4 text-center">
                            <Input
                              type="number"
                              step="0.25"
                              min={0}
                              max={gradingComposition.maxScore || 20}
                              disabled={gradingComposition.status === 'Clôturée'}
                              value={g.score}
                              onChange={(e) => handleScoreChange(g.studentId, Number(e.target.value))}
                              className="w-24 mx-auto text-center font-black h-10 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-600"
                            />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Badge className={cn("border-none text-[10px] font-black px-2.5 py-1", perc >= 70 ? "bg-emerald-100 text-emerald-700" : perc >= 50 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700")}>
                              {perc}%
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4">
                            <Input
                              placeholder="ex: Travail rigoureux, des progrès"
                              disabled={gradingComposition.status === 'Clôturée'}
                              value={g.comments || ''}
                              onChange={(e) => handleCommentChange(g.studentId, e.target.value)}
                              className="h-10 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold border-none"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGradingComposition(null)}
                  className="w-full sm:w-auto h-12 rounded-2xl font-bold px-6"
                >
                  Fermer
                </Button>

                {gradingComposition.status === 'Ouverte' && (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      type="button"
                      onClick={() => handleSaveGrades('Clôturée')}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-initial h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase px-6"
                    >
                      Enregistrer & Clôturer
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleSaveGrades()}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-initial h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase px-6 shadow-lg shadow-blue-500/20"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer les Notes"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Relevé de Notes PDF Generator Modal */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-3xl md:max-w-4xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] uppercase px-3 py-1">
                Générateur de Relevé de Notes
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
              Générer & Télécharger le Relevé de Notes (PDF)
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Sélectionnez un étudiant pour afficher son bilan académique complet et l'imprimer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-2">
            <div className="flex items-center gap-3">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase whitespace-nowrap">Sélectionner l'Étudiant :</label>
              <Select value={selectedStudentReport?.id || ''} onValueChange={(val) => setSelectedStudentReport(students.find(s => s.id === val))}>
                <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs border-none flex-1">
                  <SelectValue placeholder="Choisir un étudiant dans la liste..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} (Promo {s.promo} - {s.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStudentReport ? (() => {
              const transcript = calculateStudentTranscript(selectedStudentReport.id);
              if (!transcript) return null;

              const bulletinRows = transcript.subjectBreakdown.map((sb: any, i: number) => ({
                num: i + 1,
                moduleName: sb.subject,
                coeff: Number(sb.totalCoeff) || 2,
                note20: Number(sb.subjectAverage) || 0,
                appreciation: getModuleAppreciation(Number(sb.subjectAverage) || 0)
              }));

              const totalCoeffs = bulletinRows.reduce((s: number, r: any) => s + r.coeff, 0);
              const avgNum = Number(transcript.globalAverage) || 0;
              const { mention, generalAppreciation } = getMentionAndGeneralAppreciation(avgNum);

              // Compute real rank among promo peers
              const promoPeers = students.filter(s => s.promo === selectedStudentReport.promo);
              const peerScores = promoPeers
                .map(p => {
                  const t = calculateStudentTranscript(p.id);
                  return { id: p.id, avg: t ? Number(t.globalAverage) : 0 };
                })
                .sort((a, b) => b.avg - a.avg);
              const rIdx = peerScores.findIndex(p => p.id === selectedStudentReport.id);
              const rankStr = `${rIdx !== -1 ? rIdx + 1 : 1} / ${Math.max(peerScores.length, 1)}`;

              return (
                <div className="space-y-6">
                  <div className="bg-[#dfe5ee] p-2 sm:p-4 rounded-2xl overflow-x-auto">
                    <OfficialBulletinSheet
                      student={transcript.student}
                      rows={bulletinRows}
                      totalCoefficients={totalCoeffs}
                      overallAverage={avgNum}
                      rankLabel={rankStr}
                      generalAppreciation={generalAppreciation}
                      mentionLabel={mention}
                      sessionTitle={`SESSION ${selectedYear}`}
                      sessionShort={`Session ${selectedYear}`}
                      academicYear={selectedYear}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <Button 
                      onClick={async () => {
                        const el = document.getElementById('bulletin');
                        if (el) {
                          await exportElementToPDF(el, `Bulletin_Notes_${transcript.student.name.replace(/\s+/g, '_')}_${selectedYear}`, { scale: 2.4 });
                        }
                      }} 
                      className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Télécharger PDF
                    </Button>
                    <Button 
                      onClick={() => {
                        const el = document.getElementById('bulletin');
                        if (el) {
                          printOfficialBulletin(el, `Bulletin_Notes_${transcript.student.name.replace(/\s+/g, '_')}_${selectedYear}`);
                        }
                      }} 
                      variant="outline"
                      className="h-11 px-5 rounded-xl border-slate-300 dark:border-slate-700 font-black text-xs uppercase tracking-wider gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-blue-500" /> Imprimer A4
                    </Button>
                  </div>
                </div>
              );
            })() : (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <Award className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">Veuillez choisir un étudiant pour prévisualiser son relevé de notes.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: Print Grade List Modal */}
      <Dialog open={!!isPrintListOpen} onOpenChange={(open) => !open && setIsPrintListOpen(null)}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-3xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          {isPrintListOpen && (
            <div className="space-y-6">
              <div id="printable-pv" className="p-4 sm:p-8 bg-white text-slate-900 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black uppercase text-slate-900">ITMC PORTAL - PROCES-VERBAL D'ÉVALUATION</h3>
                    <p className="text-xs font-bold text-slate-500">{isPrintListOpen.title} • {isPrintListOpen.subject}</p>
                  </div>
                  <div className="text-left sm:text-right text-xs font-bold">
                    <p>Type: {isPrintListOpen.type}</p>
                    <p>Promo: {isPrintListOpen.promo}</p>
                    <p>Coeff: {isPrintListOpen.coefficient}</p>
                  </div>
                </div>

                <div className="overflow-x-auto w-full min-w-0">
                  <table className="w-full min-w-[500px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-black text-slate-700 uppercase border-b">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Étudiant</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3 text-center">Note /{isPrintListOpen.maxScore || 20}</th>
                      <th className="py-2 px-3">Remarque</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-medium">
                    {(isPrintListOpen.grades || []).map((g, idx) => (
                      <tr key={g.studentId}>
                        <td className="py-2 px-3 font-bold">{idx + 1}</td>
                        <td className="py-2 px-3 font-black">{g.studentName}</td>
                        <td className="py-2 px-3 text-slate-500">{g.email}</td>
                        <td className="py-2 px-3 text-center font-black text-blue-700">{g.score}</td>
                        <td className="py-2 px-3 text-slate-600">{g.comments || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button 
                  onClick={() => printDocument({
                    title: `PV_${isPrintListOpen.title.replace(/\s+/g, '_')}`,
                    elementId: 'printable-pv'
                  })} 
                  className="h-11 rounded-xl bg-blue-600 text-white font-black text-xs uppercase px-6"
                >
                  <Printer className="w-4 h-4 mr-2" /> Imprimer Liste
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 5: Create Session Normale (NM) Modal - Full freedom for Titulaire */}
      <Dialog open={isCreateNormaleOpen} onOpenChange={setIsCreateNormaleOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-2xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mb-2">
              <Crown className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
              Créer une Session Normale (NM)
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Créez librement autant de semestres et de sessions que vous souhaitez
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateNormale} className="space-y-4 mt-4">
            {/* Custom Title Input + Quick Suggestions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Titre de la Session Normale (Libre)
                </label>
                <span className="text-[9px] font-bold text-indigo-600">Personnalisable à 100%</span>
              </div>
              <Input
                required
                placeholder="ex: Session Normale 1 (NM) - Semestre 1"
                value={normaleTitle}
                onChange={(e) => setNormaleTitle(e.target.value)}
                className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  `Session Normale ${normales.length + 1} (NM)`,
                  `Semestre 1 - Examen Final`,
                  `Semestre 2 - Délibération`,
                  `Semestre 3 - Synthèse`,
                  `Session de Rattrapage`,
                  `Examen Blanc DQP`
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setNormaleTitle(sug)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-[10px] font-bold transition-colors cursor-pointer border border-transparent hover:border-indigo-200"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Promotion Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Promotion / Classe</label>
                <Select value={normalePromo} onValueChange={setNormalePromo}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniquePromos.map(p => (
                      <SelectItem key={p} value={p}>Promo {p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Semester / Period (Free Input + Quick Chips) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Semestre / Période (Libre)
                  </label>
                  <span className="text-[9px] font-bold text-indigo-600">Saisie libre</span>
                </div>
                <Input
                  required
                  placeholder="ex: Semestre 1, Semestre 2, Semestre 3, Trimestre 1..."
                  value={normaleSemester}
                  onChange={(e) => setNormaleSemester(e.target.value)}
                  className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs"
                />
              </div>
            </div>

            {/* Quick Semesters Chips */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                Suggestions rapides de Semestre / Session :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Semestre 1',
                  'Semestre 2',
                  'Semestre 3',
                  'Semestre 4',
                  'Semestre 5',
                  'Semestre 6',
                  'Trimestre 1',
                  'Trimestre 2',
                  'Trimestre 3',
                  'Rattrapage / Session 2',
                  'Examen Blanc DQP',
                  'Session Extraordinaire'
                ].map(sem => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => {
                      setNormaleSemester(sem);
                      if (!normaleTitle || normaleTitle.includes('Session Normale')) {
                        setNormaleTitle(`Session Normale (NM) - ${sem}`);
                      }
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer",
                      normaleSemester === sem
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200/60 dark:border-slate-700/60"
                    )}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Date prévisionnelle de délibération</label>
              <Input
                type="date"
                value={normaleTargetDate}
                onChange={(e) => setNormaleTargetDate(e.target.value)}
                className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Description & Consignes Académiques</label>
              <Input
                placeholder="ex: Regroupement des CC1, CC2 et examens finaux pour la délibération finale"
                value={normaleDescription}
                onChange={(e) => setNormaleDescription(e.target.value)}
                className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-medium text-xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateNormaleOpen(false)} className="flex-1 h-12 rounded-2xl font-bold">
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-500/20">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer la Session Normale"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 5B: Edit Session Normale (NM) Modal */}
      <Dialog open={isEditNormaleOpen} onOpenChange={setIsEditNormaleOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-2xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mb-2">
              <Edit3 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
              Modifier la Session Normale
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Mettez à jour le titre, le semestre ou les informations de la session
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEditNormale} className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Titre de la Session Normale
                </label>
                <span className="text-[9px] font-bold text-indigo-600">Libre & Modifiable</span>
              </div>
              <Input
                required
                placeholder="ex: Session Normale (NM) - Semestre 2"
                value={normaleTitle}
                onChange={(e) => setNormaleTitle(e.target.value)}
                className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Promotion / Classe</label>
                <Select value={normalePromo} onValueChange={setNormalePromo}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniquePromos.map(p => (
                      <SelectItem key={p} value={p}>Promo {p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Semestre / Période
                </label>
                <Input
                  required
                  placeholder="ex: Semestre 1, Semestre 2, Semestre 3..."
                  value={normaleSemester}
                  onChange={(e) => setNormaleSemester(e.target.value)}
                  className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                Changer rapidement pour :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Semestre 1',
                  'Semestre 2',
                  'Semestre 3',
                  'Semestre 4',
                  'Semestre 5',
                  'Semestre 6',
                  'Trimestre 1',
                  'Trimestre 2',
                  'Rattrapage / Session 2',
                  'Examen Blanc DQP'
                ].map(sem => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setNormaleSemester(sem)}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer",
                      normaleSemester === sem
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200/60 dark:border-slate-700/60"
                    )}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Date prévisionnelle de délibération</label>
              <Input
                type="date"
                value={normaleTargetDate}
                onChange={(e) => setNormaleTargetDate(e.target.value)}
                className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Description & Consignes Académiques</label>
              <Input
                placeholder="ex: Regroupement des CC1, CC2 et examens finaux"
                value={normaleDescription}
                onChange={(e) => setNormaleDescription(e.target.value)}
                className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-medium text-xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditNormaleOpen(false)} className="flex-1 h-12 rounded-2xl font-bold">
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-500/20">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer les modifications"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 6: Normale Deliberation PV Detail Modal */}
      <Dialog open={!!selectedNormaleDetail} onOpenChange={(open) => !open && setSelectedNormaleDetail(null)}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-4xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          {selectedNormaleDetail && (() => {
            const normale = selectedNormaleDetail;
            const linkedComps = compositions.filter(c => 
              c.normaleId === normale.id || (normale.compositionIds && normale.compositionIds.includes(c.id))
            );
            const promoStudents = students.filter(s => (s.promo || '').toLowerCase() === (normale.promo || '').toLowerCase());

            // Build student transcript averages
            const studentResults = promoStudents.map(st => {
              let totalPoints = 0;
              let totalWeights = 0;
              const scores: { [key: string]: number } = {};

              linkedComps.forEach(comp => {
                const g = (comp.grades || []).find(grade => grade.studentId === st.id);
                const score = g ? (g.score / (comp.maxScore || 20)) * 20 : 0;
                const weight = comp.coefficient || 1;
                totalPoints += score * weight;
                totalWeights += weight;
                scores[comp.id] = score;
              });

              const average = totalWeights > 0 ? Math.round((totalPoints / totalWeights) * 10) / 10 : 0;
              return {
                student: st,
                scores,
                average,
                decision: average >= 10 ? 'Admis(e)' : 'Ajourné(e)'
              };
            }).sort((a, b) => b.average - a.average);

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-600 text-white font-black text-[9px] uppercase px-2.5 py-0.5 border-none">
                          Procès-Verbal de Délibération
                        </Badge>
                        <Badge className="bg-slate-100 dark:bg-slate-800 font-black text-[9px] uppercase">
                          Promo {normale.promo}
                        </Badge>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                        {normale.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleTogglePublishNormale(normale)}
                      className={cn(
                        "h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider",
                        normale.isPublished
                          ? "bg-amber-600 text-white hover:bg-amber-500"
                          : "bg-emerald-600 text-white hover:bg-emerald-500"
                      )}
                    >
                      {normale.isPublished ? <EyeOff className="w-3.5 h-3.5 mr-1.5" /> : <Globe className="w-3.5 h-3.5 mr-1.5" />}
                      {normale.isPublished ? "Bloquer le Relevé" : "Publier aux Élèves"}
                    </Button>
                    <Button
                      onClick={() => printDocument({
                        title: `PV_Deliberation_NM_${normale.semester}_${normale.promo}`,
                        elementId: 'printable-pv',
                        landscape: true
                      })}
                      className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1.5" /> Imprimer PV
                    </Button>
                  </div>
                </div>

                {/* Printable Deliberation Board */}
                <div id="printable-pv" className="p-6 bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  {/* Seal and Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                      <AppLogo size="md" variant="seal" />
                      <div>
                        <h3 className="font-black text-base text-slate-900 tracking-tight">CFP-ITMC</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Direction des Études &amp; Examens</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-black uppercase text-slate-900">PROCES-VERBAL DE DELIBERATION (NM)</p>
                      <p className="text-[10px] text-slate-500 font-bold">{normale.semester} • Session {normale.targetDate || "2026"}</p>
                      <p className="text-[10px] text-slate-500">Titulaire : <strong>{normale.titulaireName}</strong></p>
                    </div>
                  </div>

                  {/* Compositions summary bar */}
                  <div className="p-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 flex flex-wrap items-center gap-3">
                    <span className="font-black text-slate-900 uppercase text-[10px]">Épreuves Délibérées ({linkedComps.length}) :</span>
                    {linkedComps.map(c => (
                      <Badge key={c.id} variant="outline" className="text-[10px] bg-white text-slate-800 border-slate-200">
                        {c.title} (Coeff {c.coefficient})
                      </Badge>
                    ))}
                  </div>

                  {/* Results Table */}
                  <div className="overflow-x-auto w-full min-w-0">
                    <table className="w-full min-w-[600px] text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white font-black uppercase text-[9px] tracking-wider">
                          <th className="py-2.5 px-3 rounded-l-xl">Rang</th>
                          <th className="py-2.5 px-3">Nom & Prénom(s)</th>
                          <th className="py-2.5 px-3">Matricule</th>
                          {linkedComps.map(c => (
                            <th key={c.id} className="py-2.5 px-2 text-center text-[8px]">{c.title.slice(0, 15)} (/{c.maxScore || 20})</th>
                          ))}
                          <th className="py-2.5 px-3 text-center">Moyenne / 20</th>
                          <th className="py-2.5 px-3 text-right rounded-r-xl">Décision</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                        {studentResults.length === 0 ? (
                          <tr>
                            <td colSpan={5 + linkedComps.length} className="py-6 text-center text-slate-400 font-bold">
                              Aucun étudiant enregistré pour la Promo {normale.promo}.
                            </td>
                          </tr>
                        ) : (
                          studentResults.map((res, index) => (
                            <tr key={res.student.id} className="hover:bg-slate-50/70">
                              <td className="py-3 px-3 font-black text-slate-500">#{index + 1}</td>
                              <td className="py-3 px-3 font-black text-slate-900">{res.student.name}</td>
                              <td className="py-3 px-3 font-mono text-[10px] font-bold text-blue-700">{res.student.matricule || 'N/A'}</td>
                              {linkedComps.map(c => (
                                <td key={c.id} className="py-3 px-2 text-center font-bold text-slate-700">
                                  {res.scores[c.id] !== undefined ? res.scores[c.id].toFixed(1) : '-'}
                                </td>
                              ))}
                              <td className="py-3 px-3 text-center font-black text-blue-700 text-sm">{res.average} / 20</td>
                              <td className="py-3 px-3 text-right">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-full text-[10px] font-black uppercase",
                                  res.decision === 'Admis(e)' ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                )}>
                                  {res.decision}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 text-center text-xs font-bold text-slate-600">
                    <div>
                      <p className="uppercase text-[9px] text-slate-400 font-black">L'Enseignant Titulaire</p>
                      <p className="mt-8 font-black text-slate-900">{normale.titulaireName || "Dr. Jean-Paul Kamga"}</p>
                      <p className="text-[9px] text-slate-400 italic">Signature & Visa de Délibération</p>
                    </div>
                    <div>
                      <p className="uppercase text-[9px] text-slate-400 font-black">La Direction des Études CFP-ITMC</p>
                      <div className="mt-2 flex items-center justify-center">
                        <AppLogo size="sm" variant="seal" />
                      </div>
                      <p className="mt-2 font-black text-slate-900">Le Directeur Académique</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* MODAL 7: Manage Compositions/CCs included in a Session Normale (NM) at any time */}
      <Dialog open={isManageNormaleCompsOpen} onOpenChange={setIsManageNormaleCompsOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-3xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          {managingNormale && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mb-2">
                  <Layers className="w-6 h-6" />
                </div>
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
                  Rattacher / Détacher des CC & Évaluations
                </DialogTitle>
                <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Session Normale : <strong className="text-indigo-600">{managingNormale.title}</strong> (Promo {managingNormale.promo})
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                <p className="font-black flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" /> Gestion Dynamique post-création
                </p>
                <p className="font-medium">
                  Vous pouvez cocher ou décocher n'importe quel Contrôle Continu (CC), TD ou Composition à tout moment pour l'inclure ou l'exclure du calcul du Procès-Verbal de la session.
                </p>
              </div>

              {/* Compositions List for this Promo */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Évaluations disponibles pour la Promo {managingNormale.promo} ({compositions.filter(c => !c.promo || c.promo === managingNormale.promo || managingNormale.promo === 'Toutes').length})
                </h4>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {compositions
                    .filter(c => !c.promo || c.promo === managingNormale.promo || managingNormale.promo === 'Toutes')
                    .length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-400">
                          Aucune évaluation trouvée pour la Promo {managingNormale.promo}.
                        </p>
                      </div>
                    ) : (
                      compositions
                        .filter(c => !c.promo || c.promo === managingNormale.promo || managingNormale.promo === 'Toutes')
                        .map((comp) => {
                          const isLinked = comp.normaleId === managingNormale.id || (managingNormale.compositionIds && managingNormale.compositionIds.includes(comp.id));

                          return (
                            <div
                              key={comp.id}
                              className={cn(
                                "p-4 rounded-2xl border transition-all flex items-center justify-between gap-4",
                                isLinked
                                  ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 shadow-sm"
                                  : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
                              )}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge className={cn("font-black text-[9px] border-none uppercase px-2 py-0.5", isLinked ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700")}>
                                    {comp.type || 'CC'}
                                  </Badge>
                                  <Badge variant="outline" className="text-[9px] font-bold">
                                    Coeff {comp.coefficient || 1} • /{comp.maxScore || 20} Pts
                                  </Badge>
                                </div>
                                <h5 className="font-black text-slate-900 dark:text-white text-sm">
                                  {comp.title}
                                </h5>
                                <p className="text-xs text-slate-500 font-medium">
                                  Matière : <strong>{comp.subject}</strong> • Date : {comp.date}
                                </p>
                              </div>

                              <Button
                                type="button"
                                onClick={() => handleToggleCompositionToNormale(managingNormale.id, comp.id)}
                                className={cn(
                                  "h-10 px-4 rounded-xl font-black text-xs uppercase tracking-wider shrink-0 transition-all",
                                  isLinked
                                    ? "bg-indigo-600 hover:bg-red-600 text-white shadow-md"
                                    : "bg-slate-200 hover:bg-indigo-600 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-white"
                                )}
                              >
                                {isLinked ? "Détacher (Inclus)" : "+ Inclure dans NM"}
                              </Button>
                            </div>
                          );
                        })
                    )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={() => setIsManageNormaleCompsOpen(false)}
                  className="h-12 px-6 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase shadow-lg shadow-indigo-600/20"
                >
                  Terminer / Valider
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 8: Edit Composition & Change NM Link Modal */}
      <Dialog open={!!editingComposition} onOpenChange={(open) => !open && setEditingComposition(null)}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-2xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          {editingComposition && (
            <form onSubmit={handleSaveEditComposition} className="space-y-5">
              <DialogHeader>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-2">
                  <Settings className="w-6 h-6" />
                </div>
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
                  Éditer l'Évaluation
                </DialogTitle>
                <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Modifiez le titre, le coefficient, le barème ou rattachez cette évaluation à une Session Normale (NM)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Titre de l'évaluation</label>
                  <Input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs"
                  />
                </div>

                {/* Session Normale (NM) Link Selector */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Rattacher à une Session Normale (NM)
                    </label>
                    <Badge className="bg-amber-400 text-amber-950 font-black text-[8px] uppercase border-none">
                      Modification Libre
                    </Badge>
                  </div>
                  <Select value={newNormaleId} onValueChange={setNewNormaleId}>
                    <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-slate-800 font-bold text-xs border-indigo-200 dark:border-indigo-800">
                      <SelectValue placeholder="Aucune session (Évaluation indépendante)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune session (Évaluation indépendante)</SelectItem>
                      {normales.map(n => (
                        <SelectItem key={n.id} value={n.id}>
                          Session Normale : {n.title} (Promo {n.promo} - {n.semester})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] font-bold text-indigo-600/80">
                    Vous pouvez rattacher ou changer la Session NM à n'importe quel moment, même après la création !
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Type d'Évaluation</label>
                    <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                      <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Contrôle Continu (CC)</SelectItem>
                        <SelectItem value="TD">Travaux Dirigés (TD)</SelectItem>
                        <SelectItem value="Composition Normale">Composition Normale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Coefficient</label>
                    <Input
                      type="number"
                      step="0.5"
                      min={0.5}
                      value={newCoefficient}
                      onChange={(e) => setNewCoefficient(Number(e.target.value))}
                      className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Note Max</label>
                    <Input
                      type="number"
                      min={5}
                      max={100}
                      value={newMaxScore}
                      onChange={(e) => setNewMaxScore(Number(e.target.value))}
                      className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Promo / Classe</label>
                    <Select value={newPromo} onValueChange={setNewPromo}>
                      <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {uniquePromos.map(p => (
                          <SelectItem key={p} value={p}>Promo {p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Date de l'évaluation</label>
                    <Input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs"
                    />
                  </div>
                </div>

                {/* SUBJECT INSTRUCTIONS & RESOURCE DIFFUSION SECTION IN EDIT */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                        Sujet de l'Épreuve & Diffusion des Ressources
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500">Durée :</span>
                      <Input
                        type="number"
                        min={15}
                        max={480}
                        value={newDurationMinutes}
                        onChange={(e) => setNewDurationMinutes(Number(e.target.value))}
                        className="w-20 h-7 text-center font-black text-xs bg-white dark:bg-slate-800 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 font-bold">min</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Consignes, Énoncé ou Questions de l'Évaluation
                    </label>
                    <textarea
                      placeholder="Saisissez ici les consignes, les exercices, directives ou le barème de l'épreuve..."
                      value={newSubjectText}
                      onChange={(e) => setNewSubjectText(e.target.value)}
                      className="w-full h-24 p-3 rounded-xl bg-white dark:bg-slate-800 text-xs font-medium border border-indigo-100 dark:border-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Resources Attachment: PDF Subject & Images */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        Fichiers du Sujet Diffusés aux Étudiants ({newResources.length})
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="h-8 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px] uppercase cursor-pointer flex items-center gap-1.5 border border-rose-200">
                          <FileText className="w-3.5 h-3.5 text-rose-600" />
                          <span>+ Sujet PDF (max 3Mo)</span>
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => handleAddResourceFile(e, 'pdf')}
                          />
                        </label>

                        <label className="h-8 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px] uppercase cursor-pointer flex items-center gap-1.5 border border-blue-200">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ Image Sujet (max 4Mo)</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleAddResourceFile(e, 'image')}
                          />
                        </label>
                      </div>
                    </div>

                    {newResources.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {newResources.map(res => (
                          <div key={res.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              {res.type === 'pdf' ? <FileText className="w-4 h-4 text-rose-600 shrink-0" /> : <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />}
                              <span className="font-bold truncate text-slate-800 dark:text-slate-200">{res.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setNewResources(prev => prev.filter(r => r.id !== res.id))}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* STUDENT COPIES SUBMISSIONS ACTIVATION IN EDIT */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FolderCheck className="w-4 h-4 text-indigo-600" />
                      Exiger / Autoriser le dépôt de copie en ligne par les étudiants
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Si activé, les étudiants pourront renvoyer leur copie sous forme de <strong>PDF (max 3 Mo)</strong> ou de <strong>photos de copies manuscrites (max 7 images de 4 Mo chacune)</strong>.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={newAllowSubmissions}
                      onChange={(e) => setNewAllowSubmissions(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setEditingComposition(null)} className="flex-1 h-12 rounded-2xl font-bold">
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 9: Teacher Submissions Management & Grading Lightbox Modal */}
      <TeacherSubmissionsModal
        isOpen={!!selectedCompForSubmissions}
        onClose={() => setSelectedCompForSubmissions(null)}
        composition={selectedCompForSubmissions}
        onUpdateComposition={(updatedComp) => {
          setCompositions(prev => prev.map(c => c.id === updatedComp.id ? updatedComp : c));
          setSelectedCompForSubmissions(updatedComp);
        }}
      />

      {/* MODAL 10: Enseignant Titulaire - Annual Bulletin Configuration Modal */}
      <Dialog open={isAnnualConfigModalOpen} onOpenChange={setIsAnnualConfigModalOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-3xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mb-2">
              <Crown className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
              Activer & Configurer le Bulletin de Fin d'Année
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Sélectionnez les Sessions Normales (NM) et Évaluations retenues pour le Bilan Annuel de Fin d'Année
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAnnualConfig} className="space-y-6 mt-2">
            {/* Promo Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-slate-900 dark:text-white">
                  Promotion / Spécialité gérée par le Titulaire :
                </label>
                <p className="text-[11px] text-slate-500">
                  Choisissez la classe pour laquelle vous arrêtez le bilan annuel
                </p>
              </div>

              <Select value={annualPromo} onValueChange={(val) => {
                setAnnualPromo(val);
                handleOpenAnnualConfigModal(val);
              }}>
                <SelectTrigger className="h-11 w-48 rounded-xl bg-white dark:bg-slate-800 font-bold text-xs border-slate-300 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {uniquePromos.map(p => (
                    <SelectItem key={p} value={p}>Promo {p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enable Toggle */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Activer la publication du Bulletin de Fin d'Année aux élèves
                </p>
                <p className="text-[10px] text-amber-800/80 dark:text-amber-200/80">
                  Rend visible l'onglet "Bulletin de Fin d'Année" sur les relevés des apprenants.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={annualIsActivated}
                  onChange={(e) => setAnnualIsActivated(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Sessions Normales Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Sessions Normales (NM) à intégrer dans le Bilan Annuel ({normales.filter(n => n.promo === annualPromo || n.promo === 'Tous').length}) :
              </h4>

              <div className="grid grid-cols-1 gap-2">
                {normales.filter(n => n.promo === annualPromo || n.promo === 'Tous').length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3">Aucune Session Normale enregistrée pour la Promo {annualPromo}.</p>
                ) : (
                  normales.filter(n => n.promo === annualPromo || n.promo === 'Tous').map(norm => {
                    const isChecked = annualSelectedNormaleIds.includes(norm.id);
                    return (
                      <label key={norm.id} className={cn(
                        "p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all",
                        isChecked ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800" : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                      )}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setAnnualSelectedNormaleIds(prev => prev.filter(id => id !== norm.id));
                              } else {
                                setAnnualSelectedNormaleIds(prev => [...prev, norm.id]);
                              }
                            }}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">{norm.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{norm.semester} • Titulaire : {norm.titulaireName}</p>
                          </div>
                        </div>
                        <Badge className={cn("font-bold text-[9px] uppercase border-none", isChecked ? "bg-amber-500 text-amber-950" : "bg-slate-200 text-slate-600")}>
                          {isChecked ? "Retenu" : "Exclu"}
                        </Badge>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Titulaire Name & Jury Decision Text */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500">Nom de l'Enseignant Titulaire</label>
                <Input
                  value={annualTitulaireName}
                  onChange={(e) => setAnnualTitulaireName(e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500">Formule & Mention du Jury de Fin d'Année</label>
                <textarea
                  rows={2}
                  value={annualTitulaireNotes}
                  onChange={(e) => setAnnualTitulaireNotes(e.target.value)}
                  placeholder="ex: ADMIS(E) EN CLASSE SUPÉRIEURE / ADMIS AU DIPLÔME DQP"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsAnnualConfigModalOpen(false)} className="flex-1 h-12 rounded-2xl font-bold">
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black shadow-lg shadow-amber-500/20">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activer & Enregistrer le Bilan Annuel"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
