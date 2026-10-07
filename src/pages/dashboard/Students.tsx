import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle2,
  Clock,
  UserPlus,
  Loader2,
  Trash2,
  Pencil,
  AlertCircle,
  Layers,
  BookOpen,
  FileSpreadsheet,
  Award,
  Printer,
  FileCheck,
  CreditCard,
  UserCheck,
  ShieldCheck,
  Hash,
  Sparkles,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import OfficialTranscriptModal from "@/components/OfficialTranscriptModal";
import MatriculeManagementModal from "@/components/MatriculeManagementModal";
import { generateOfficialMatricule, SPECIALTY_MATRICULE_REGISTRY } from "@/utils/matriculeEngine";
import { exportElementToPDF, printElementDirect } from "@/lib/pdfExport";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { defaultSpecialties } from '@/data/specialtiesData';
import { useAuth } from '@/context/AuthContext';
import { useAcademicYear } from '@/context/AcademicYearContext';
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const statusColors: any = {
  'Actif': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400',
  'Inscrit': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400',
  'Inactif': 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 font-bold',
  'Désactivé': 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 font-bold',
  'Excellent': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400',
  'En progrès': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400',
  'À risque': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400',
  'Diplômé': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400',
};

export default function StudentsPage() {
  const { user } = useAuth();
  const { selectedYear } = useAcademicYear();
  const [students, setStudents] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isMatriculeModalOpen, setIsMatriculeModalOpen] = useState(false);
  const [copiedMatricule, setCopiedMatricule] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [transcriptStudent, setTranscriptStudent] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    gender: 'M',
    birthDate: '',
    birthPlace: 'Douala',
    nationality: 'Camerounaise',
    address: 'Douala, Cameroun',
    email: '',
    phone: '',
    matricule: '',
    promo: 'G1',
    status: 'Inscrit',
    specialty: 'Tuyauterie',
    sessionType: 'Cours du Jour (08h30 - 13h30)',
    guardianName: '',
    guardianPhone: '',
    initialDeposit: '50000',
    paymentMethod: 'Espèces / Caisse Scolaire',
    docsBirthCert: true,
    docsCni: true,
    docsDiploma: true,
    docsPhotos: true
  });

  // Permission checkers
  const isAdmin = user?.role === 'admin';
  const hasPerm = (permCode: string) => {
    if (isAdmin) return true;
    return user?.permissions?.includes(permCode) || false;
  };

  const canAddStudent = hasPerm('perm_manual_admission') || hasPerm('perm_add_student');
  const canEditStudent = hasPerm('perm_edit_student');
  const canDeleteStudent = hasPerm('perm_delete_student');
  const canExportStudents = hasPerm('perm_export_school_data');
  const canPrintCertificat = hasPerm('perm_print_certificat_scolarite');
  const canManageTranscripts = hasPerm('perm_manage_transcripts_archive') || hasPerm('perm_generate_bulletins');

  const uniqueClassOptions = useMemo(() => {
    const map = new Map<string, { code: string; label: string }>();
    const base = [
      { code: 'G1', label: 'G1 - Groupe 1 (1ère Année)' },
      { code: 'G2', label: 'G2 - Groupe 2 (2ème Année)' },
      { code: 'G3', label: 'G3 - Groupe 3 (3ème Année)' },
      { code: 'L3-GL', label: 'L3-GL - Licence 3 Génie Logiciel' }
    ];
    base.forEach(b => map.set(b.code, b));
    (classesList || []).forEach(cls => {
      if (cls && cls.code) {
        map.set(cls.code, { code: cls.code, label: `${cls.code} - ${cls.name}` });
      }
    });
    return Array.from(map.values());
  }, [classesList]);

  const fetchData = async () => {
    try {
      const [resStud, resCls] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/classes')
      ]);
      if (resStud.ok) {
        const data = await resStud.json();
        setStudents(data);
      }
      if (resCls.ok) {
        const data = await resCls.json();
        setClassesList(data);
      }
    } catch (err) {
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddStudent) {
      toast.error("Vous ne disposez pas de l'autorisation d'inscription manuelle.");
      return;
    }

    try {
      const officialMat = formData.matricule?.trim() || generateOfficialMatricule({
        studentName: formData.name || 'Étudiant',
        specialty: formData.specialty || 'Génie Logiciel',
        academicYear: selectedYear || '2026-2027',
        orderNumber: students.length + 1
      });

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          matricule: officialMat,
          registrationDate: new Date().toISOString().split('T')[0]
        })
      });
      if (res.ok) {
        toast.success(`Étudiant ${formData.name} inscrit manuellement avec succès au CFP-ITMC !`);
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          gender: 'M',
          birthDate: '',
          birthPlace: 'Douala',
          nationality: 'Camerounaise',
          address: 'Douala, Cameroun',
          email: '',
          phone: '',
          matricule: '',
          promo: 'G1',
          status: 'Inscrit',
          specialty: 'Génie Logiciel',
          sessionType: 'Cours du Jour (08h00 - 14h00)',
          guardianName: '',
          guardianPhone: '',
          initialDeposit: '50000',
          paymentMethod: 'Espèces / Caisse Scolaire',
          docsBirthCert: true,
          docsCni: true,
          docsDiploma: true,
          docsPhotos: true
        });
        fetchData();
      }
    } catch (err) {
      toast.error("Échec de l'inscription manuelle de l'étudiant");
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditStudent) {
      toast.error("Autorisation requise pour modifier le dossier étudiant.");
      return;
    }

    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      // If matricule changed, also trigger dedicated matricule endpoint for full cascade
      if (formData.matricule && formData.matricule !== selectedStudent.matricule) {
        await fetch(`/api/students/${selectedStudent.id}/matricule`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matricule: formData.matricule.trim(),
            reason: "Modification manuelle Super Admin via formulaire étudiant"
          })
        });
      }

      if (res.ok) {
        toast.success("Informations et matricule de l'étudiant mis à jour avec succès !");
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Échec de la mise à jour");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!canDeleteStudent) {
      toast.error("Suppression non autorisée pour votre fonction.");
      return;
    }
    if (!confirm("Voulez-vous vraiment supprimer cet étudiant ?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Étudiant supprimé avec succès");
        fetchData();
      }
    } catch (err) {
      toast.error("Échec de la suppression");
    }
  };

  const openEditModal = (student: any) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || '',
      gender: student.gender || 'M',
      birthDate: student.birthDate || '',
      birthPlace: student.birthPlace || 'Douala',
      nationality: student.nationality || 'Camerounaise',
      address: student.address || 'Douala, Cameroun',
      email: student.email || '',
      phone: student.phone || '',
      matricule: student.matricule || '',
      promo: student.promo || 'G1',
      status: student.status || 'Actif',
      specialty: student.specialty || 'Génie Logiciel',
      sessionType: student.sessionType || 'Cours du Jour (08h00 - 14h00)',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      initialDeposit: student.initialDeposit || '50000',
      paymentMethod: student.paymentMethod || 'Espèces / Caisse Scolaire',
      docsBirthCert: student.docsBirthCert !== false,
      docsCni: student.docsCni !== false,
      docsDiploma: student.docsDiploma !== false,
      docsPhotos: student.docsPhotos !== false
    });
    setIsEditModalOpen(true);
  };

  const openCertificatModal = (student: any) => {
    setSelectedStudent(student);
    setIsCertModalOpen(true);
  };

  // Export CSV Functionality
  const handleResetUserPassword = async (stdObj: { id: string; name: string; email: string }) => {
    if (!confirm(`Réinitialiser le mot de passe de l'apprenant ${stdObj.name} (${stdObj.email}) au mot de passe par défaut 'itmc2026DLA' ?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: stdObj.id,
          email: stdObj.email,
          newPassword: 'itmc2026DLA'
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Mot de passe réinitialisé à 'itmc2026DLA' !`);
      } else {
        toast.error(data.error || "Échec de réinitialisation.");
      }
    } catch (e) {
      toast.error("Erreur de connexion lors de la réinitialisation.");
    }
  };

  const handleExportCSV = () => {
    if (!canExportStudents) {
      toast.error("Vous ne disposez pas de l'autorisation d'export des données.");
      return;
    }
    const headers = ["ID", "Nom & Prenom", "Email", "Telephone", "Filiere DQP", "Promotion / Classe", "Statut", "Nationalite"];
    const rows = filteredStudents.map(s => [
      s.id,
      `"${s.name || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.specialty || ''}"`,
      `"${s.promo || ''}"`,
      `"${s.status || ''}"`,
      `"${s.nationality || 'Camerounaise'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CFP_ITMC_Registre_Etudiants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Registre officiel des étudiants exporté au format CSV avec succès.");
  };

  const handleToggleStudentStatus = async (student: any) => {
    if (!canEditStudent) {
      toast.error("Autorisation requise pour modifier le statut de l'étudiant.");
      return;
    }

    const isCurrentlyInactive = student.status === 'Inactif' || student.status === 'Désactivé' || student.active === false;
    const newStatus = isCurrentlyInactive ? 'Actif' : 'Inactif';
    const actionText = isCurrentlyInactive ? 'réactiver' : 'désactiver';

    if (!confirm(`Voulez-vous vraiment ${actionText} l'étudiant "${student.name}" (${student.matricule || student.email}) ?\n\n${isCurrentlyInactive ? "En réactivant cet étudiant, il pourra de nouveau se connecter à son compte et sera inclus dans les effectifs." : "En désactivant cet étudiant, son accès au compte sera BLOQUÉ et il ne sera plus inclus dans les listes d'étudiants actifs."}`)) {
      return;
    }

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...student,
          status: newStatus,
          active: !isCurrentlyInactive
        })
      });

      if (res.ok) {
        toast.success(
          isCurrentlyInactive
            ? `Compte de ${student.name} réactivé avec succès ! Accès rétabli.`
            : `Compte de ${student.name} désactivé (Inactif). Accès au compte bloqué.`
        );
        fetchData();
      } else {
        toast.error("Échec du changement de statut.");
      }
    } catch (err) {
      toast.error("Erreur réseau lors de la modification du statut.");
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const q = searchQuery.toLowerCase();
      const matchSearch = (
        student.name?.toLowerCase().includes(q) ||
        student.promo?.toLowerCase().includes(q) ||
        student.email?.toLowerCase().includes(q) ||
        student.specialty?.toLowerCase().includes(q) ||
        student.matricule?.toLowerCase().includes(q)
      );

      const matchFiliere = selectedFiliere === 'all' || student.specialty?.toLowerCase() === selectedFiliere.toLowerCase();
      const matchClass = selectedClass === 'all' || student.promo?.toLowerCase() === selectedClass.toLowerCase();

      const isInactive = student.status === 'Inactif' || student.status === 'Désactivé' || student.active === false;
      const matchStatus = selectedStatus === 'all' ||
        (selectedStatus === 'active_only' ? !isInactive :
        selectedStatus === 'inactive_only' ? isInactive :
        student.status?.toLowerCase() === selectedStatus.toLowerCase());

      return matchSearch && matchFiliere && matchClass && matchStatus;
    });
  }, [students, searchQuery, selectedFiliere, selectedClass, selectedStatus]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestion des Étudiants</h1>
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 font-black text-[10px] uppercase">
              CFP-ITMC Douala
            </Badge>
          </div>
          <p className="text-slate-500 mt-1 text-sm">Organisation par filière DQP, par classe (promo) et inscriptions administratives officielles.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          {canExportStudents && (
            <Button 
              onClick={handleExportCSV}
              variant="outline" 
              className="gap-2 h-11 px-4 sm:px-6 rounded-xl border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 shrink-0 font-bold text-xs"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Exporter Registre CSV
            </Button>
          )}
          <Button 
            onClick={() => setIsMatriculeModalOpen(true)}
            variant="outline" 
            className="gap-2 h-11 px-4 sm:px-5 rounded-xl border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 shrink-0 font-bold text-xs"
            title="Générateur et gestionnaire des matricules MINEFOP par ordre alphabétique"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            Matricules MINEFOP
          </Button>
          {canAddStudent && (
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 px-4 sm:px-6 rounded-xl shrink-0 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20"
            >
              <UserPlus className="w-4 h-4" />
              Inscrire un Étudiant
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            placeholder="Rechercher par nom, matricule, email, promo ou filière..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-2.5 outline-none focus:ring-2 ring-blue-500/20 transition-all text-sm h-11"
          />
        </div>

        <div>
          <Select value={selectedFiliere} onValueChange={setSelectedFiliere}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Filtrer par filière" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Toutes les filières</SelectItem>
              {defaultSpecialties.map(sp => (
                <SelectItem key={sp.id} value={sp.name}>{sp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Filtrer par classe / promo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Toutes les classes</SelectItem>
              {uniqueClassOptions.map(cls => (
                <SelectItem key={`filter_cls_${cls.code}`} value={cls.code}>
                  {cls.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Statut du compte" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">📋 Tous les statuts</SelectItem>
              <SelectItem value="active_only">✅ Actifs uniquement (Accès OK)</SelectItem>
              <SelectItem value="inactive_only">🛑 Inactifs uniquement (Accès bloqué)</SelectItem>
              <SelectItem value="Inscrit">🔹 Inscrit</SelectItem>
              <SelectItem value="Actif">🟢 Actif</SelectItem>
              <SelectItem value="Inactif">🛑 Inactif / Désactivé</SelectItem>
              <SelectItem value="Diplômé">🎓 Diplômé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Table */}
      <Card className="border-none shadow-sm overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Étudiant</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Filière</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Classe / Promo</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Progression</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Statut</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                        <AvatarFallback className="font-bold">{student.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white leading-snug">{student.name}</span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-medium text-slate-500">{student.email}</span>
                          {student.matricule && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(student.matricule);
                                setCopiedMatricule(student.matricule);
                                toast.success(`Matricule ${student.matricule} copié !`);
                                setTimeout(() => setCopiedMatricule(null), 2000);
                              }}
                              className="font-mono text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Cliquer pour copier le matricule"
                            >
                              <Hash className="w-2.5 h-2.5 text-blue-500" />
                              <span>{student.matricule}</span>
                              {copiedMatricule === student.matricule ? (
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-2.5 h-2.5 text-slate-400" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{student.specialty || 'Génie Logiciel'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge variant="outline" className="rounded-lg font-black text-[10px] uppercase border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 px-2.5 py-1">
                      {student.promo || 'G1'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-600 rounded-full" style={{ width: `${student.prog || 0}%` }} />
                       </div>
                       <span className="text-[10px] font-black text-slate-400">{student.prog || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge variant="outline" className={cn("px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider border-none", statusColors[student.status] || 'bg-slate-100 text-slate-700')}>
                      {student.status || 'Actif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {canPrintCertificat && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openCertificatModal(student)}
                          className="h-9 w-9 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          title="Générer Certificat de Scolarité"
                        >
                          <Award className="w-4 h-4" />
                        </Button>
                      )}
                      {canManageTranscripts && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setTranscriptStudent(student)}
                          className="h-9 w-9 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          title="Voir / Imprimer le Relevé de Notes"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </Button>
                      )}
                      {canEditStudent && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleResetUserPassword(student)}
                          className="h-9 w-9 rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          title="Réinitialiser le mot de passe de cet apprenant à 'itmc2026DLA'"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </Button>
                      )}
                      {canEditStudent && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleToggleStudentStatus(student)}
                          className={cn(
                            "h-9 w-9 rounded-xl transition-colors",
                            (student.status === 'Inactif' || student.status === 'Désactivé' || student.active === false)
                              ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              : "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          )}
                          title={(student.status === 'Inactif' || student.status === 'Désactivé' || student.active === false)
                            ? "Réactiver cet étudiant (Autoriser l'accès au compte)"
                            : "Désactiver cet étudiant (Marquer INACTIF - Bloquer l'accès)"
                          }
                        >
                          {(student.status === 'Inactif' || student.status === 'Désactivé' || student.active === false) ? (
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-rose-600" />
                          )}
                        </Button>
                      )}
                      {canEditStudent && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditModal(student)}
                          className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          title="Modifier le dossier, statut ou la classe"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {canDeleteStudent && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteStudent(student.id)}
                          className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Aucun étudiant trouvé correspondant aux filtres.</p>
                      <p className="text-slate-400 text-xs">Modifiez vos critères de recherche ou ajoutez un nouvel étudiant.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/50">
          <span>{filteredStudents.length} étudiant(s) affiché(s) sur {students.length} total</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl px-4 h-9 font-black" disabled>Précédent</Button>
            <Button variant="outline" size="sm" className="rounded-xl px-4 h-9 font-black" disabled>Suivant</Button>
          </div>
        </div>
      </Card>

      {/* Add Student Dialog (Manual Administrative Registration) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-2xl rounded-2xl sm:rounded-[2.5rem] border-none p-6 sm:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Inscription Manuelle d'un Étudiant</DialogTitle>
                <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  CFP-ITMC Douala • Enregistrement officiel & matricule automatique
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-6 mt-4">
            
            {/* Section 1: État Civil */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-blue-600 tracking-wider">
                <UserCheck className="w-4 h-4" />
                1. Informations d'État Civil
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom & Prénoms complets *</Label>
                  <Input 
                    required
                    placeholder="Ex: TCHANA KAMGA Jean-Paul"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Genre</Label>
                  <Select value={formData.gender} onValueChange={v => setFormData({...formData, gender: v})}>
                    <SelectTrigger className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin (M)</SelectItem>
                      <SelectItem value="F">Féminin (F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date de Naissance</Label>
                  <Input 
                    type="date"
                    value={formData.birthDate}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lieu de Naissance</Label>
                  <Input 
                    placeholder="Ex: Douala"
                    value={formData.birthPlace}
                    onChange={e => setFormData({...formData, birthPlace: e.target.value})}
                    className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nationalité</Label>
                  <Input 
                    value={formData.nationality}
                    onChange={e => setFormData({...formData, nationality: e.target.value})}
                    className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Téléphone de l'étudiant *</Label>
                  <Input 
                    required
                    placeholder="+237 699 00 00 00"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Institutionnel / Perso *</Label>
                  <Input 
                    type="email"
                    required
                    placeholder="etudiant@itmc-it.cm"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Filière DQP & Session Académique */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-blue-600 tracking-wider">
                <BookOpen className="w-4 h-4" />
                2. Affectation Académique & Filière DQP
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Spécialité / Filière DQP *</Label>
                  <Select 
                    value={formData.specialty} 
                    onValueChange={v => setFormData({...formData, specialty: v})}
                  >
                    <SelectTrigger className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                      <SelectValue placeholder="Sélectionner une filière" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[260px]">
                      {defaultSpecialties.map(sp => (
                        <SelectItem key={sp.id} value={sp.name}>{sp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Classe / Groupe</Label>
                  <Select 
                    value={formData.promo} 
                    onValueChange={v => setFormData({...formData, promo: v})}
                  >
                    <SelectTrigger className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {uniqueClassOptions.map(cls => (
                        <SelectItem key={`add_cls_${cls.code}`} value={cls.code}>
                          {cls.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type de Session</Label>
                  <Select 
                    value={formData.sessionType} 
                    onValueChange={v => setFormData({...formData, sessionType: v})}
                  >
                    <SelectTrigger className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cours du Jour (08h30 - 13h30)">Cours du Jour (08h30 - 13h30) [80% Pratique]</SelectItem>
                      <SelectItem value="Cours du Soir (17h30 - 20h30)">Cours du Soir (17h30 - 20h30) [Professionnels]</SelectItem>
                      <SelectItem value="Formation Continue Weekend">Formation Continue Weekend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 3: Caisse & Paiement */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-600 tracking-wider">
                <CreditCard className="w-4 h-4" />
                3. Frais d'Inscription & Caisse
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Acompte / Frais versés (FCFA)</Label>
                  <Input 
                    type="number"
                    value={formData.initialDeposit}
                    onChange={e => setFormData({...formData, initialDeposit: e.target.value})}
                    className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mode de Règlement</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={v => setFormData({...formData, paymentMethod: v})}
                  >
                    <SelectTrigger className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Espèces / Caisse Scolaire">Espèces / Caisse Scolaire</SelectItem>
                      <SelectItem value="Orange Money / MTN MoMo">Orange Money / MTN MoMo</SelectItem>
                      <SelectItem value="Virement Bancaire">Virement Bancaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-xl h-12 px-6 font-bold flex-1">
                Annuler
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-black uppercase text-xs tracking-widest flex-1 shadow-lg shadow-blue-500/25">
                Valider l'Inscription
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog (Admin Modify Class & Filière) */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-lg rounded-2xl sm:rounded-[2.5rem] border-none p-6 sm:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Modifier l'Étudiant & sa Classe</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Mise à jour des affectations pour {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditStudent} className="space-y-5 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom Complet</Label>
                <Input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="rounded-2xl h-12 border-slate-200 dark:border-slate-700 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</Label>
                <Input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="rounded-2xl h-12 border-slate-200 dark:border-slate-700 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Filière d'Étude</Label>
                <Select 
                  value={formData.specialty} 
                  onValueChange={v => setFormData({...formData, specialty: v})}
                >
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Sélectionner une filière" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-[280px]">
                    {defaultSpecialties.map(sp => (
                      <SelectItem key={sp.id} value={sp.name}>{sp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Classe / Promo</Label>
                  <Select 
                    value={formData.promo} 
                    onValueChange={v => setFormData({...formData, promo: v})}
                  >
                    <SelectTrigger className="rounded-2xl h-12 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Classe" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {uniqueClassOptions.map(cls => (
                        <SelectItem key={`edit_cls_${cls.code}`} value={cls.code}>
                          {cls.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Statut du Compte</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={v => setFormData({...formData, status: v})}
                  >
                    <SelectTrigger className="rounded-2xl h-12 border-slate-200 dark:border-slate-700 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Inscrit">🔹 Inscrit</SelectItem>
                      <SelectItem value="Actif">🟢 Actif</SelectItem>
                      <SelectItem value="Inactif">🛑 Inactif (Accès au compte Bloqué)</SelectItem>
                      <SelectItem value="En progrès">📈 En progrès</SelectItem>
                      <SelectItem value="À risque">⚠️ À risque</SelectItem>
                      <SelectItem value="Diplômé">🎓 Diplômé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Numéro Matricule Officiel MINEFOP (Super Admin)
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = generateOfficialMatricule({
                        studentName: formData.name || 'Étudiant',
                        specialty: formData.specialty || 'Génie Logiciel',
                        academicYear: selectedStudent?.academicYear || selectedYear || '2026-2027',
                        orderNumber: Math.floor(1 + Math.random() * 50)
                      });
                      setFormData({ ...formData, matricule: generated });
                      toast.success(`Matricule régénéré : ${generated}`);
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-générer
                  </button>
                </div>
                <Input 
                  value={formData.matricule}
                  onChange={e => setFormData({...formData, matricule: e.target.value})}
                  placeholder="Ex: 21ITMC26GL001 ou 1itmc26gl001"
                  className="rounded-2xl h-12 border-slate-200 dark:border-slate-700 font-mono font-bold text-blue-600 dark:text-blue-400 focus:ring-blue-500/20"
                />
                <p className="text-[10px] text-slate-400 ml-1">
                  Format normalisé : [N°Filière][ITMC][Session][Code][N°Ordre A-Z]. Modifiable par l'administrateur avec répercussion automatique.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Téléphone</Label>
                <Input 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="rounded-2xl h-12 border-slate-200 dark:border-slate-700 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="rounded-xl h-12 px-6 font-bold flex-1">
                Annuler
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-black text-white rounded-xl h-12 px-6 font-black uppercase text-[10px] tracking-widest flex-1 shadow-sm">
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Matricule Management Modal (MINEFOP Standards & A-Z Sequence Generator) */}
      <MatriculeManagementModal
        isOpen={isMatriculeModalOpen}
        onClose={() => setIsMatriculeModalOpen(false)}
        students={students}
        onRefresh={fetchData}
      />

      {/* Official Transcript Modal with full admin management & publish control */}
      <OfficialTranscriptModal
        isOpen={!!transcriptStudent}
        onClose={() => setTranscriptStudent(null)}
        student={transcriptStudent}
        canManagePublish={true}
        onCompositionUpdated={fetchData}
      />

      {/* Official School Attendance Certificate Dialog (Certificat de Scolarité) */}
      <Dialog open={isCertModalOpen} onOpenChange={setIsCertModalOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-2xl rounded-2xl sm:rounded-[2.5rem] border-none p-6 sm:p-8 max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Certificat de Scolarité Officiel</DialogTitle>
                <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Centre de Formation Professionnelle ITMC Douala (MINEFOP)
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 mt-4">
              {/* Certificate Preview Card */}
              <div id="certificate-print-area" className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-serif relative overflow-hidden">
                {/* Security Watermark Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                  <img
                    src="/watermark-logo.png"
                    alt=""
                    className="w-[300px] max-w-[70%] h-auto opacity-[0.07] object-contain"
                  />
                </div>

                <div className="text-center pb-4 border-b border-slate-300 dark:border-slate-700 space-y-1 relative z-10">
                  <p className="text-[10px] font-sans font-black tracking-widest uppercase text-slate-500">RÉPUBLIQUE DU CAMEROUN • PAIX - TRAVAIL - PATRIE</p>
                  <p className="text-[11px] font-sans font-bold text-blue-600 uppercase">MINISTÈRE DE L'EMPLOI ET DE LA FORMATION PROFESSIONNELLE</p>
                  <h3 className="text-lg font-black font-sans tracking-tight uppercase text-slate-900 dark:text-white mt-1">CFP-ITMC DOUALA</h3>
                  <p className="text-[9px] font-sans text-slate-500">Agrément Ministériel N° 0128/MINEFOP/SG/DFOP/SDGS/SACD</p>
                </div>

                <div className="py-6 space-y-4">
                  <div className="text-center">
                    <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-sans font-black text-sm uppercase tracking-widest rounded-lg">
                      ATTESTATION DE SCOLARITÉ
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    Le Directeur Général du Centre de Formation Professionnelle <strong>ITMC</strong> soussigné, atteste par la présente que l'étudiant(e) :
                  </p>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-sans space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Nom et Prénom:</span>
                      <span className="font-black text-slate-900 dark:text-white text-sm">{selectedStudent.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Matricule:</span>
                      <span className="font-mono font-bold text-blue-600">{selectedStudent.matricule || `ITMC-${selectedStudent.id}`}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Filière DQP:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.specialty || 'Génie Logiciel'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Promotion / Classe:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.promo || 'G1'} - Année Académique 2025/2026</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Statut:</span>
                      <Badge className="bg-green-600 text-white font-bold text-[9px] uppercase">Régulièrement Inscrit(e)</Badge>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    Est régulièrement inscrit(e) et suit avec assiduité les cours théoriques et pratiques préparant au Diplôme de Qualification Professionnelle (DQP).
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end font-sans text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold">Fait à Douala, le {new Date().toLocaleDateString('fr-FR')}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-1">Vérification QR: ITMC-VERIF-{selectedStudent.id}</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-black text-[10px] uppercase text-slate-700 dark:text-slate-300">Le Directeur Pédagogique</p>
                    <div className="h-10 w-24 mx-auto border-b border-dashed border-slate-400"></div>
                    <p className="text-[9px] text-slate-400 font-bold">Cachet & Signature</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-wrap gap-2.5 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsCertModalOpen(false)} className="rounded-xl h-11 px-5 font-bold">
                  Fermer
                </Button>
                <Button 
                  onClick={async () => {
                    const el = document.getElementById('certificate-print-area');
                    if (el && selectedStudent) {
                      await exportElementToPDF(el, `Certificat_Scolarite_ITMC_${selectedStudent.name.replace(/\s+/g, '_')}`);
                    }
                  }} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-5 font-black uppercase text-xs tracking-wider flex-1 gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </Button>
                <Button 
                  onClick={() => {
                    const el = document.getElementById('certificate-print-area');
                    if (el && selectedStudent) {
                      printElementDirect(el, `Certificat_Scolarite_${selectedStudent.name.replace(/\s+/g, '_')}`);
                    }
                  }} 
                  variant="outline"
                  className="rounded-xl h-11 px-5 font-black uppercase text-xs tracking-wider flex-1 gap-2 border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer A4
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
