import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Upload, 
  Download, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  X, 
  TrendingUp, 
  Printer, 
  Sparkles, 
  AlertCircle,
  Shield,
  Award,
  Trophy,
  Star,
  ChevronRight,
  ChevronLeft,
  Check,
  Lock,
  Zap,
  Flame,
  Crown,
  BookOpen,
  Clock,
  Rocket,
  Scroll,
  CheckCircle2,
  MessageCircle,
  Eye,
  Edit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ModernSelect } from '@/components/ui/select';
import { OfficialAttestationModal, AttestationData, ATTESTATION_MODELS, AttestationStyle } from '@/components/OfficialAttestationModal';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  fileContent: string;
  uploadedBy: string;
  status?: string;
}

interface Internship {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  academicYear: string;
  companyName: string;
  companyLogo: string;
  location: string;
  supervisorName: string;
  supervisorEmail: string;
  supervisorPhone: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  status: 'active' | 'completed' | 'canceled' | 'pending';
  documents: Document[];
  certificateGenerated: boolean;
  createdAt: string;
  // Gamified quest fields
  questStep?: number; // 1 to 6
  conventionSigned?: boolean;
  midtermValidated?: boolean;
  tutorScore?: number | null;
  tutorAppreciation?: string;
  reportValidated?: boolean;
}

interface Student {
  id: string;
  name: string;
  matricule: string;
  classCode: string;
  promo: string;
  academicYear: string;
  specialty: string;
}

export interface QuestStepInfo {
  id: number;
  title: string;
  subtitle: string;
  lore: string;
  xp: number;
  iconName: 'rocket' | 'scroll' | 'shield' | 'scale' | 'book' | 'crown';
  badge: string;
  status: 'completed' | 'in_progress' | 'locked';
  details: string;
}

export const getInternshipQuestInfo = (it: Internship) => {
  const hasConvention = !!(it.conventionSigned || it.documents?.some(d => d.type === 'convention') || (it.questStep && it.questStep >= 2));
  
  // Immersion logic
  const start = new Date(it.startDate).getTime();
  const end = it.endDate ? new Date(it.endDate).getTime() : start + (it.durationMonths * 30 * 86400000);
  const now = Date.now();
  const totalDuration = Math.max(1, end - start);
  const elapsed = Math.max(0, Math.min(now - start, totalDuration));
  const timeProgress = Math.min(100, Math.round((elapsed / totalDuration) * 100));
  const daysElapsed = Math.round(elapsed / 86400000);
  const totalDays = Math.round(totalDuration / 86400000);
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  
  const isMidtermReached = timeProgress >= 50;
  const hasMidterm = !!(it.midtermValidated || (hasConvention && isMidtermReached) || (it.questStep && it.questStep >= 3));

  const hasEvaluation = !!(it.tutorScore != null || it.documents?.some(d => d.type === 'evaluation') || (it.questStep && it.questStep >= 4));
  const hasReport = !!(it.reportValidated || it.documents?.some(d => d.type === 'rapport') || (it.questStep && it.questStep >= 5));
  const isCompleted = it.status === 'completed' || !!(it.certificateGenerated || (it.questStep && it.questStep >= 6));

  // Determine current active level (1 to 6)
  let currentLevel = 1;
  if (isCompleted) {
    currentLevel = 6;
  } else if (hasReport) {
    currentLevel = 6; // Ready to be crowned / closed
  } else if (hasEvaluation) {
    currentLevel = 5; // Ready for final report
  } else if (hasMidterm) {
    currentLevel = 4; // Ready for tutor evaluation
  } else if (hasConvention) {
    currentLevel = 3; // Immersion in progress
  } else {
    currentLevel = 2; // Convention signing required
  }

  // Calculate XP
  let xp = 150; // Step 1
  if (hasConvention) xp += 200;
  if (hasMidterm) xp += 200;
  if (hasEvaluation) xp += 250;
  if (hasReport) xp += 250;
  if (isCompleted) xp += 450; // Total 1500 XP

  const progressPercent = Math.min(100, Math.round((xp / 1500) * 100));

  let rankTitle = "Initié Apprenant 🛡️";
  if (xp >= 1500) rankTitle = "Maître Certifié MINEFOP 👑";
  else if (xp >= 1050) rankTitle = "Major de Promotion 🏆";
  else if (xp >= 800) rankTitle = "Spécialiste Émérite 🎖️";
  else if (xp >= 550) rankTitle = "Guerrier du Terrain ⚡";
  else if (xp >= 350) rankTitle = "Compagnon de Stage 📜";

  const steps: QuestStepInfo[] = [
    {
      id: 1,
      title: "Mission Initiée",
      subtitle: "Affectation & Accord de Principe",
      lore: "L'apprenant est affecté à l'entreprise d'accueil avec accord de tutelle et calendrier fixé.",
      xp: 150,
      iconName: "rocket",
      badge: "Initié 🚀",
      status: 'completed',
      details: `${it.companyName} • Tuteur : ${it.supervisorName} (${it.location || 'Douala'})`
    },
    {
      id: 2,
      title: "Pacte de Stage",
      subtitle: "Convention Tripartite Signée",
      lore: "La convention tripartite (CFP-ITMC, Entreprise et Stagiaire) officialise le cadre légal et pédagogique.",
      xp: 200,
      iconName: "scroll",
      badge: "Pacte Scellé 📜",
      status: hasConvention ? 'completed' : (currentLevel === 2 ? 'in_progress' : 'locked'),
      details: hasConvention ? "Convention validée et enregistrée au dossier" : "En attente de signature tripartite"
    },
    {
      id: 3,
      title: "Expédition Terrain",
      subtitle: "Immersion Active & Mi-Parcours",
      lore: "Immersion pratique en entreprise. Franchissement du cap des 30 à 45 jours et bilan intermédiaire.",
      xp: 200,
      iconName: "shield",
      badge: "Guerrier du Terrain ⚡",
      status: hasMidterm ? 'completed' : (currentLevel === 3 ? 'in_progress' : 'locked'),
      details: `${timeProgress}% écoulé (${daysElapsed}j passés / ${totalDays}j total • Reste ${daysRemaining}j)`
    },
    {
      id: 4,
      title: "Épreuve du Maître",
      subtitle: "Grille d'Évaluation & Note Tuteur",
      lore: "Le tuteur professionnel renseigne la fiche d'évaluation des compétences et délivre la note sur 20.",
      xp: 250,
      iconName: "scale",
      badge: "Étoile du Tuteur 🎖️",
      status: hasEvaluation ? 'completed' : (currentLevel === 4 ? 'in_progress' : 'locked'),
      details: it.tutorScore != null ? `Note attribuée : ${it.tutorScore}/20 ${it.tutorAppreciation ? `• "${it.tutorAppreciation}"` : ''}` : "En attente de la note d'évaluation"
    },
    {
      id: 5,
      title: "Grimoire Technique",
      subtitle: "Rapport de Stage Validé",
      lore: "Dépôt et validation académique du rapport professionnel de stage technique par la commission d'examen.",
      xp: 250,
      iconName: "book",
      badge: "Maître Rédacteur 📘",
      status: hasReport ? 'completed' : (currentLevel === 5 ? 'in_progress' : 'locked'),
      details: hasReport ? "Rapport technique validé conforme par le jury" : "En attente du dépôt du rapport final"
    },
    {
      id: 6,
      title: "Sanctuaire de la Maîtrise",
      subtitle: "Clôture & Attestation MINEFOP",
      lore: "Validation suprême par le Conseil Pédagogique du CFP-ITMC et génération de l'Attestation officielle.",
      xp: 450,
      iconName: "crown",
      badge: "Diplômé Certifié 👑",
      status: isCompleted ? 'completed' : (currentLevel === 6 ? 'in_progress' : 'locked'),
      details: isCompleted ? "Stage officiellement clôturé. Attestation délivrée avec Sceau officiel" : "Prêt pour la clôture finale et remise de l'attestation"
    }
  ];

  return {
    steps,
    currentLevel,
    xp,
    totalXp: 1500,
    progressPercent,
    rankTitle,
    hasConvention,
    hasMidterm,
    hasEvaluation,
    hasReport,
    isCompleted,
    timeProgress,
    daysElapsed,
    totalDays,
    daysRemaining
  };
};

const SAMPLE_ATTESTATIONS: AttestationData[] = [
  {
    id: "att_stage_sample1",
    docNumber: "ITMC-AFS-2026/0142",
    category: "stage",
    studentName: "M. DJOUKOUO Paul Alain",
    studentMatricule: "26ITMC20GL001",
    birthDate: "14/05/2001",
    birthPlace: "Douala",
    specialty: "Génie Logiciel & Développement Web",
    promo: "DQP / CQP - Niveau 3",
    sessionPeriod: "Du 15 Juin 2026 au 15 Août 2026",
    companyName: "Orange Cameroun S.A.",
    companySupervisor: "M. MBIADA Jean-Claude (Chef de projet)",
    internshipTopic: "Mise en place d'un portail client sécurisé et intégration d'API web",
    issueDate: new Date().toISOString().split('T')[0],
    issueCity: "Douala",
    directorName: "Dr. TCHAPGNIN Gédéon",
    status: "Délivrée"
  },
  {
    id: "att_formation_sample1",
    docNumber: "ITMC-AFF-2026/0488",
    category: "formation",
    studentName: "Mme KAMGA NOUBISSI Carine",
    studentMatricule: "26ITMC21RT004",
    birthDate: "22/11/2000",
    birthPlace: "Yaoundé",
    specialty: "Réseaux Informatiques & Cyber-sécurité",
    promo: "DQP - Niveau 3 Spécialisé",
    sessionPeriod: "Du 01 Octobre 2025 au 30 Juin 2026",
    mention: "Très Bien",
    overallAverage: "17,25 / 20",
    issueDate: new Date().toISOString().split('T')[0],
    issueCity: "Douala",
    directorName: "Dr. TCHAPGNIN Gédéon",
    status: "Délivrée"
  }
];

export default function AdminInternships() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation Tabs (Stage vs Attestations)
  const [mainTab, setMainTab] = useState<'stages' | 'attestations_stage' | 'attestations_formation'>('stages');

  // Attestation States
  const [attestationsList, setAttestationsList] = useState<AttestationData[]>([]);
  const [selectedAttestationModal, setSelectedAttestationModal] = useState<AttestationData | null>(null);
  const [isAttestationModalOpen, setIsAttestationModalOpen] = useState(false);

  // Attestation Generator State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genCategory, setGenCategory] = useState<'stage' | 'formation'>('stage');
  const [genMode, setGenMode] = useState<'select' | 'manual'>('select');
  const [selectedGenStudentId, setSelectedGenStudentId] = useState<string>('');
  const [editingAttestationId, setEditingAttestationId] = useState<string | null>(null);
  const [genStatus, setGenStatus] = useState<string>('Délivrée');
  const [genDocNumber, setGenDocNumber] = useState<string>('');
  const [genStyleModel, setGenStyleModel] = useState<AttestationStyle>('classic');

  const [genStudentName, setGenStudentName] = useState('');
  const [genStudentMatricule, setGenStudentMatricule] = useState('');
  const [genBirthDate, setGenBirthDate] = useState('01/01/2002');
  const [genBirthPlace, setGenBirthPlace] = useState('Douala');
  const [genSpecialty, setGenSpecialty] = useState('Génie Logiciel');
  const [genPromo, setGenPromo] = useState('DQP / CQP - Niveau 3');
  const [genSessionPeriod, setGenSessionPeriod] = useState('Du 01 Octobre 2025 au 30 Juin 2026');
  const [genMention, setGenMention] = useState('Très Bien');
  const [genOverallAverage, setGenOverallAverage] = useState('16,50 / 20');
  const [genCompanyName, setGenCompanyName] = useState('Orange Cameroun S.A.');
  const [genCompanySupervisor, setGenCompanySupervisor] = useState('M. Marc EBOA');
  const [genInternshipTopic, setGenInternshipTopic] = useState('Mise en œuvre des architectures informatiques cloud');
  const [genIssueCity, setGenIssueCity] = useState('Douala');
  const [genDirectorName, setGenDirectorName] = useState('Dr. TCHAPGNIN Gédéon');

  // Search & Filter for Attestations
  const [attestationSearchTerm, setAttestationSearchTerm] = useState('');

  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Detail Drawer / Modal & Gamified Quest State
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [activeQuestStep, setActiveQuestStep] = useState<number>(1);
  const [tutorScoreInput, setTutorScoreInput] = useState<string>('18');
  const [tutorAppreciationInput, setTutorAppreciationInput] = useState<string>('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedModel, setSelectedModel] = useState<number>(1);

  // Assignment / Creation Form state
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form Values
  const [formId, setFormId] = useState('');
  const [formStudentId, setFormStudentId] = useState('');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formSupervisorName, setFormSupervisorName] = useState('');
  const [formSupervisorEmail, setFormSupervisorEmail] = useState('');
  const [formSupervisorPhone, setFormSupervisorPhone] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formDurationMonths, setFormDurationMonths] = useState(2);
  const [formStatus, setFormStatus] = useState<'active' | 'completed' | 'canceled' | 'pending'>('active');

  // Document upload state
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('convention');

  // Document edit state
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingDocName, setEditingDocName] = useState('');
  const [editingDocType, setEditingDocType] = useState('convention');
  const [editingDocStatus, setEditingDocStatus] = useState('Validé');

  const loadData = async () => {
    setLoading(true);
    try {
      const [intRes, stdRes, attRes] = await Promise.all([
        fetch('/api/internships').then(r => r.json()).catch(() => []),
        fetch('/api/students').then(r => r.json()).catch(() => []),
        fetch('/api/attestations').then(r => r.json()).catch(() => [])
      ]);

      if (Array.isArray(intRes)) setInternships(intRes);
      if (Array.isArray(stdRes)) setStudents(stdRes);

      if (Array.isArray(attRes) && attRes.length > 0) {
        setAttestationsList(attRes);
      } else {
        setAttestationsList(SAMPLE_ATTESTATIONS);
      }
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAssign = () => {
    setIsEditing(false);
    setFormId('');
    setFormStudentId(students[0]?.id || '');
    setFormCompanyName('');
    setFormLocation('');
    setFormSupervisorName('');
    setFormSupervisorEmail('');
    setFormSupervisorPhone('');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormDurationMonths(2);
    setFormStatus('active');
    setShowAssignForm(true);
  };

  const handleOpenEdit = (it: Internship) => {
    setIsEditing(true);
    setFormId(it.id);
    setFormStudentId(it.studentId);
    setFormCompanyName(it.companyName);
    setFormLocation(it.location);
    setFormSupervisorName(it.supervisorName);
    setFormSupervisorEmail(it.supervisorEmail || '');
    setFormSupervisorPhone(it.supervisorPhone || '');
    setFormStartDate(it.startDate);
    setFormDurationMonths(it.durationMonths);
    setFormStatus(it.status);
    setShowAssignForm(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId || !formCompanyName.trim()) {
      toast.error("Veuillez remplir les informations obligatoires.");
      return;
    }

    const selectedStd = students.find(s => s.id === formStudentId);
    const payload = {
      studentId: formStudentId,
      studentName: selectedStd ? selectedStd.name : 'Étudiant',
      studentClass: selectedStd ? (selectedStd.classCode || selectedStd.promo) : '',
      companyName: formCompanyName,
      location: formLocation,
      supervisorName: formSupervisorName,
      supervisorEmail: formSupervisorEmail,
      supervisorPhone: formSupervisorPhone,
      startDate: formStartDate,
      durationMonths: formDurationMonths,
      status: formStatus
    };

    try {
      const url = isEditing ? `/api/internships/${formId}` : '/api/internships';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(isEditing ? "Stage mis à jour avec succès" : "Stage affecté avec succès");
        setShowAssignForm(false);
        loadData();
        if (selectedInternship && selectedInternship.id === formId) {
          // Update selected view
          const updated = await res.json();
          setSelectedInternship(updated);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur de validation");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de communication avec le serveur.");
    }
  };

  const handleDeleteInternship = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette affectation de stage ?")) return;

    try {
      const res = await fetch(`/api/internships/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Stage supprimé du dossier.");
        setSelectedInternship(null);
        loadData();
      } else {
        toast.error("Impossible de supprimer le stage.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseInternshipDirect = async (id: string) => {
    try {
      const res = await fetch(`/api/internships/${id}/close`, { method: 'PUT' });
      if (res.ok) {
        toast.success("🏆 Félicitations ! Le stage a été officiellement clôturé avec succès (+450 XP).");
        loadData();
        if (selectedInternship?.id === id) {
          const updated = await res.json();
          setSelectedInternship(updated);
        }
      } else {
        toast.error("Une erreur s'est produite lors de la clôture.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Gamified Quest Helpers & Actions
  useEffect(() => {
    if (selectedInternship) {
      const q = getInternshipQuestInfo(selectedInternship);
      setActiveQuestStep(q.currentLevel);
      setTutorScoreInput(selectedInternship.tutorScore != null ? selectedInternship.tutorScore.toString() : '18');
      setTutorAppreciationInput(selectedInternship.tutorAppreciation || '');
    }
  }, [selectedInternship?.id]);

  useEffect(() => {
    if (!selectedInternship && internships.length > 0) {
      setSelectedInternship(internships[0]);
    }
  }, [internships, selectedInternship]);

  const handleUpdateQuestField = async (id: string, updates: Partial<Internship>, successMsg: string) => {
    try {
      const res = await fetch(`/api/internships/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        toast.success(successMsg);
        loadData();
        setSelectedInternship(updated);
      } else {
        toast.error("Erreur lors de la mise à jour de la quête.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur de communication.");
    }
  };

  const handleToggleConvention = (it: Internship) => {
    const newVal = !it.conventionSigned;
    handleUpdateQuestField(
      it.id,
      { conventionSigned: newVal, questStep: newVal ? Math.max(it.questStep || 1, 2) : 1 },
      newVal ? "⭐ Convention signée et validée (+200 XP) !" : "Statut convention tripartite réinitialisé."
    );
  };

  const handleToggleMidterm = (it: Internship) => {
    const newVal = !it.midtermValidated;
    handleUpdateQuestField(
      it.id,
      { midtermValidated: newVal, questStep: newVal ? Math.max(it.questStep || 1, 3) : 2 },
      newVal ? "⚡ Jalon mi-parcours terrain validé avec succès (+200 XP) !" : "Jalon mi-parcours réinitialisé."
    );
  };

  const handleSaveTutorEvaluation = (it: Internship) => {
    let score: number | null = null;
    if (tutorScoreInput.trim() !== '') {
      const parsed = parseFloat(tutorScoreInput);
      if (isNaN(parsed) || parsed < 0 || parsed > 20) {
        toast.error("Veuillez saisir une note valide entre 0 et 20 ou laisser vide.");
        return;
      }
      score = parsed;
    }
    
    handleUpdateQuestField(
      it.id,
      { 
        tutorScore: score, 
        tutorAppreciation: tutorAppreciationInput,
        questStep: Math.max(it.questStep || 1, 4)
      },
      score !== null 
        ? `🎖️ Note du tuteur (${score}/20) enregistrée (+250 XP) !`
        : `🎖️ Évaluation enregistrée sans note !`
    );
  };

  const handleToggleReport = (it: Internship) => {
    const newVal = !it.reportValidated;
    handleUpdateQuestField(
      it.id,
      { reportValidated: newVal, questStep: newVal ? Math.max(it.questStep || 1, 5) : 4 },
      newVal ? "📘 Rapport de stage validé conforme (+250 XP) !" : "Validation académique du rapport retirée."
    );
  };

  const handleAdvanceQuest = (it: Internship) => {
    const q = getInternshipQuestInfo(it);
    if (q.currentLevel >= 6) {
      toast.info("L'apprenant a déjà atteint le rang suprême de Maître Certifié ! 👑");
      return;
    }
    const nextLevel = q.currentLevel + 1;
    let updates: Partial<Internship> = { questStep: nextLevel };
    if (nextLevel === 2) updates.conventionSigned = true;
    if (nextLevel === 3) updates.midtermValidated = true;
    if (nextLevel === 4 && it.tutorScore == null) updates.tutorScore = 18;
    if (nextLevel === 5) updates.reportValidated = true;
    if (nextLevel === 6) updates.status = 'completed';

    handleUpdateQuestField(
      it.id,
      updates,
      `🚀 Étape ${nextLevel} débloquée ! Félicitations pour la progression de quête.`
    );
    setActiveQuestStep(nextLevel);
  };

  const handleOpenGenerator = (cat: 'stage' | 'formation', initialStyle: AttestationStyle = 'classic') => {
    setGenCategory(cat);
    setGenMode('select');
    setEditingAttestationId(null);
    setGenStatus('Délivrée');
    setGenDocNumber('');
    setGenStyleModel(initialStyle);
    if (students.length > 0) {
      const s = students[0];
      setSelectedGenStudentId(s.id);
      setGenStudentName(s.name);
      setGenStudentMatricule(s.matricule || s.id);
      setGenSpecialty(s.specialty || s.classCode || 'Génie Informatique');
      setGenPromo(s.promo || s.classCode || 'DQP / CQP - Niveau 3');
    } else {
      setGenStudentName('M. NOUBISSI Jean-Paul');
      setGenStudentMatricule('2026-ITMC-042');
    }
    setIsGeneratorOpen(true);
  };

  const handleOpenEditAttestation = (att: AttestationData) => {
    setGenCategory(att.category);
    setGenMode('manual');
    setEditingAttestationId(att.id || null);
    setGenStatus(att.status || 'Délivrée');
    setGenDocNumber(att.docNumber || '');
    setGenStyleModel(att.styleModel || 'classic');
    
    setSelectedGenStudentId(att.studentId || '');
    setGenStudentName(att.studentName || '');
    setGenStudentMatricule(att.studentMatricule || '');
    setGenBirthDate(att.birthDate || '01/01/2002');
    setGenBirthPlace(att.birthPlace || 'Douala');
    setGenSpecialty(att.specialty || 'Génie Logiciel');
    setGenPromo(att.promo || 'DQP / CQP - Niveau 3');
    setGenSessionPeriod(att.sessionPeriod || 'Du 01 Octobre 2025 au 30 Juin 2026');
    setGenMention(att.mention || 'Très Bien');
    setGenOverallAverage(att.overallAverage || '16,50 / 20');
    setGenCompanyName(att.companyName || 'Orange Cameroun S.A.');
    setGenCompanySupervisor(att.companySupervisor || 'M. Marc EBOA');
    setGenInternshipTopic(att.internshipTopic || 'Mise en œuvre des architectures informatiques cloud');
    setGenIssueCity(att.issueCity || 'Douala');
    setGenDirectorName(att.directorName || 'Dr. TCHAPGNIN Gédéon');
    
    setIsGeneratorOpen(true);
  };

  const handleSelectGenStudent = (studentId: string) => {
    setSelectedGenStudentId(studentId);
    const s = students.find(st => st.id === studentId);
    if (s) {
      setGenStudentName(s.name);
      setGenStudentMatricule(s.matricule || s.id);
      setGenSpecialty(s.specialty || s.classCode || 'Génie Informatique');
      setGenPromo(s.promo || s.classCode || 'DQP / CQP - Niveau 3');
    }
  };

  const handleSaveAttestation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genStudentName.trim()) {
      toast.error("Veuillez saisir le nom de l'apprenant.");
      return;
    }

    const payload: AttestationData = {
      id: editingAttestationId || undefined,
      category: genCategory,
      styleModel: genStyleModel || 'classic',
      studentId: selectedGenStudentId,
      studentName: genStudentName,
      studentMatricule: genStudentMatricule,
      birthDate: genBirthDate,
      birthPlace: genBirthPlace,
      specialty: genSpecialty,
      promo: genPromo,
      sessionPeriod: genSessionPeriod,
      mention: genMention,
      overallAverage: genOverallAverage,
      companyName: genCompanyName,
      companySupervisor: genCompanySupervisor,
      internshipTopic: genInternshipTopic,
      issueCity: genIssueCity,
      issueDate: new Date().toISOString().split('T')[0],
      directorName: genDirectorName,
      status: genStatus || "Délivrée"
    };

    if (genDocNumber.trim() !== '') {
      payload.docNumber = genDocNumber;
    }

    try {
      const res = await fetch('/api/attestations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingAttestationId) {
          toast.success("Attestation mise à jour avec succès !");
          setAttestationsList(prev => prev.map(a => a.id === saved.id ? saved : a));
        } else {
          toast.success(`Attestation de ${genCategory === 'stage' ? 'Fin de Stage' : 'Fin de Formation'} créée avec succès !`);
          setAttestationsList(prev => [saved, ...prev]);
        }
        setIsGeneratorOpen(false);
        setEditingAttestationId(null);
        
        // Open preview modal immediately
        setSelectedAttestationModal(saved);
        setIsAttestationModalOpen(true);
      } else {
        toast.error("Erreur lors de la génération de l'attestation.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de connexion avec le serveur.");
    }
  };

  const handleDeleteAttestation = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette attestation ?")) return;

    try {
      const res = await fetch(`/api/attestations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Attestation supprimée.");
        setAttestationsList(prev => prev.filter(a => a.id !== id));
      } else {
        toast.error("Échec de suppression.");
      }
    } catch (e) {
      toast.error("Erreur réseau.");
    }
  };

  const handleAdminFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedInternship) return;

    setUploadingDoc(true);
    try {
      const newDoc = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: docType,
        url: URL.createObjectURL(file),
        fileContent: "",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "Super Admin (Direction)"
      };

      const updatedDocs = [...(selectedInternship.documents || []), newDoc];
      const res = await fetch(`/api/internships/${selectedInternship.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: updatedDocs })
      });

      if (res.ok) {
        setInternships(prev => prev.map(item => item.id === selectedInternship.id ? { ...item, documents: updatedDocs } : item));
        setSelectedInternship(prev => prev ? { ...prev, documents: updatedDocs } : null);
        toast.success(`Document "${file.name}" ajouté avec succès !`);
      } else {
        toast.error("Erreur lors de l'ajout du document.");
      }
    } catch (err) {
      toast.error("Échec de la connexion pour téléverser le document.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!selectedInternship) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;

    try {
      const updatedDocs = (selectedInternship.documents || []).filter(d => d.id !== docId);
      const res = await fetch(`/api/internships/${selectedInternship.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: updatedDocs })
      });

      if (res.ok) {
        setInternships(prev => prev.map(item => item.id === selectedInternship.id ? { ...item, documents: updatedDocs } : item));
        setSelectedInternship(prev => prev ? { ...prev, documents: updatedDocs } : null);
        toast.success("Document supprimé avec succès !");
      } else {
        toast.error("Erreur lors de la suppression du document.");
      }
    } catch (err) {
      toast.error("Erreur de connexion.");
    }
  };

  const handleSaveDocumentEdit = async (docId: string) => {
    if (!selectedInternship) return;
    if (!editingDocName.trim()) {
      toast.error("Le nom du document ne peut pas être vide.");
      return;
    }

    try {
      const updatedDocs = (selectedInternship.documents || []).map(d => {
        if (d.id === docId) {
          return {
            ...d,
            name: editingDocName,
            type: editingDocType,
            status: editingDocStatus
          };
        }
        return d;
      });

      const res = await fetch(`/api/internships/${selectedInternship.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: updatedDocs })
      });

      if (res.ok) {
        setInternships(prev => prev.map(item => item.id === selectedInternship.id ? { ...item, documents: updatedDocs } : item));
        setSelectedInternship(prev => prev ? { ...prev, documents: updatedDocs } : null);
        setEditingDocId(null);
        toast.success("Document mis à jour avec succès !");
      } else {
        toast.error("Erreur lors de la mise à jour du document.");
      }
    } catch (err) {
      toast.error("Erreur de connexion.");
    }
  };

  // Filtered attestations
  const filteredStageAttestations = useMemo(() => {
    return attestationsList.filter(a => {
      if (a.category !== 'stage') return false;
      const q = attestationSearchTerm.toLowerCase();
      if (!q) return true;
      return (
        a.studentName?.toLowerCase().includes(q) ||
        a.studentMatricule?.toLowerCase().includes(q) ||
        a.companyName?.toLowerCase().includes(q) ||
        a.docNumber?.toLowerCase().includes(q)
      );
    });
  }, [attestationsList, attestationSearchTerm]);

  const filteredFormationAttestations = useMemo(() => {
    return attestationsList.filter(a => {
      if (a.category !== 'formation') return false;
      const q = attestationSearchTerm.toLowerCase();
      if (!q) return true;
      return (
        a.studentName?.toLowerCase().includes(q) ||
        a.studentMatricule?.toLowerCase().includes(q) ||
        a.specialty?.toLowerCase().includes(q) ||
        a.docNumber?.toLowerCase().includes(q) ||
        a.mention?.toLowerCase().includes(q)
      );
    });
  }, [attestationsList, attestationSearchTerm]);

  const printCertificate = () => {
    window.print();
  };

  // Stats calculation
  const totalStages = internships.length;
  const activeStages = internships.filter(i => i.status === 'active').length;
  const completedStages = internships.filter(i => i.status === 'completed').length;
  const completionRate = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  // Filter Logic
  const filteredInternships = internships.filter(it => {
    const q = getInternshipQuestInfo(it);
    const matchesSearch = it.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          it.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          it.supervisorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || it.status === statusFilter;
    const matchesClass = classFilter === 'all' || it.studentClass === classFilter;
    const matchesLevel = levelFilter === 'all' || q.currentLevel.toString() === levelFilter;

    return matchesSearch && matchesStatus && matchesClass && matchesLevel;
  });

  // Extract unique classes for filtering
  const uniqueClasses = Array.from(new Set(internships.map(it => it.studentClass).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Espace Stage &amp; <span className="text-blue-600">Attestations Officielles</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Super Administrateur • Gestion des stages, conventions et édition des attestations A4 Paysage MINEFOP
          </p>
        </div>

        {mainTab === 'stages' && !showAssignForm && !showCertificate && (
          <Button 
            onClick={handleOpenAssign}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs h-11 px-5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2 text-amber-400" />
            Affecter un Stage
          </Button>
        )}

        {mainTab === 'attestations_stage' && (
          <Button
            onClick={() => handleOpenGenerator('stage')}
            className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs h-11 px-5 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>+ Générer Attestation Fin de Stage</span>
          </Button>
        )}

        {mainTab === 'attestations_formation' && (
          <Button
            onClick={() => handleOpenGenerator('formation')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-11 px-5 rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
          >
            <Scroll className="w-4 h-4 text-amber-300" />
            <span>+ Générer Attestation Fin de Formation</span>
          </Button>
        )}
      </div>

      {/* CATEGORY TABS NAVIGATION BAR */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex overflow-x-auto custom-scrollbar gap-2">
        <button
          onClick={() => setMainTab('stages')}
          className={cn(
            "flex-1 min-w-[220px] py-3.5 px-5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer",
            mainTab === 'stages'
              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Briefcase className="w-4 h-4 text-blue-500" />
          <span>Gestions des Stages ({internships.length})</span>
        </button>

        <button
          onClick={() => setMainTab('attestations_stage')}
          className={cn(
            "flex-1 min-w-[220px] py-3.5 px-5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer",
            mainTab === 'attestations_stage'
              ? "bg-amber-500 text-amber-950 shadow-lg shadow-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Award className="w-4 h-4 text-amber-600" />
          <span>Attestations Fin de Stage ({attestationsList.filter(a => a.category === 'stage').length})</span>
        </button>

        <button
          onClick={() => setMainTab('attestations_formation')}
          className={cn(
            "flex-1 min-w-[220px] py-3.5 px-5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer",
            mainTab === 'attestations_formation'
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Scroll className="w-4 h-4 text-emerald-400" />
          <span>Attestations Fin de Formation ({attestationsList.filter(a => a.category === 'formation').length})</span>
        </button>
      </div>

      {/* TAB 1: STAGE MANAGEMENT */}
      {mainTab === 'stages' && (
        <div className="space-y-8">
          {/* STATS OVERVIEW SECTION */}
          {!showAssignForm && !showCertificate && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-1.5 bg-slate-50/30 dark:bg-slate-950/10 rounded-[32px] border border-slate-100 dark:border-slate-800/40">
              {/* Card 1: Total Stages */}
              <div className="relative overflow-hidden border border-slate-200/80 dark:border-slate-800 rounded-[24px] bg-white dark:bg-slate-900/90 p-6 shadow-xs hover:shadow-sm transition-all duration-300 group flex items-center justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100/50 dark:bg-slate-800/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500" />
                <div className="relative z-10 space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Total Stages</p>
                  <h3 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">{totalStages}</h3>
                  <span className="inline-flex items-center text-[9px] font-bold text-slate-500">Dossiers gérés</span>
                </div>
                <div className="relative z-10 w-12 h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-xs group-hover:bg-slate-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-950 transition-colors duration-300">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: En cours */}
              <div className="relative overflow-hidden border border-slate-200/80 dark:border-slate-800 rounded-[24px] bg-white dark:bg-slate-900/90 p-6 shadow-xs hover:shadow-sm transition-all duration-300 group flex items-center justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 dark:bg-blue-900/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500" />
                <div className="relative z-10 space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">En cours</p>
                  <h3 className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{activeStages}</h3>
                  <span className="inline-flex items-center text-[9px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-md">Immersion active</span>
                </div>
                <div className="relative z-10 w-12 h-12 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3 (SELECTOR 1): Clôturés (The Ultimate Certified Goal!) */}
              <div className="relative overflow-hidden border-2 border-emerald-500/30 dark:border-emerald-500/20 rounded-[24px] bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900/90 dark:to-emerald-950/10 p-6 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all duration-300 group flex items-center justify-between">
                <div className="absolute top-0 right-0 w-28 h-24 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500" />
                <div className="relative z-10 space-y-1">
                  <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                    <span>Clôturés</span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  </p>
                  <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">{completedStages}</h3>
                  <span className="inline-flex items-center text-[9px] font-black text-emerald-700 bg-emerald-100/70 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full uppercase tracking-wider">Certifié MINEFOP 👑</span>
                </div>
                <div className="relative z-10 w-12 h-12 bg-emerald-600 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              {/* Card 4: Taux de validation */}
              <div className="relative overflow-hidden border border-slate-200/80 dark:border-slate-800 rounded-[24px] bg-white dark:bg-slate-900/90 p-6 shadow-xs hover:shadow-sm transition-all duration-300 group flex items-center justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 dark:bg-amber-900/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500" />
                <div className="relative z-10 space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Taux de validation</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{completionRate}%</h3>
                  <span className="inline-flex items-center text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md">Succès académique</span>
                </div>
                <div className="relative z-10 w-12 h-12 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-xs group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ATTESTATIONS DE FIN DE STAGE */}
      {mainTab === 'attestations_stage' && (
        <div className="space-y-6">
          {/* STATS OVERVIEW FOR STAGE ATTESTATIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-xs p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attestations Stage</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {attestationsList.filter(a => a.category === 'stage').length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-xs p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Homologation MINEFOP</p>
                  <h3 className="text-3xl font-black text-emerald-600 mt-1">100%</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-xs p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entreprises Partenaires</p>
                  <h3 className="text-3xl font-black text-blue-600 mt-1">
                    {new Set(attestationsList.filter(a => a.category === 'stage').map(a => a.companyName)).size || 1}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-xs p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Format Officiel</p>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">A4 Paysage</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Printer className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* GALERIE DES 5 MODÈLES D'ATTESTATION DE STAGE (1 PAR DÉFAUT + 4 NOUVEAUX MOTIFS IMAGE) */}
          <Card className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Catalogue des 5 Modèles d&apos;Attestation de Fin de Stage (Cliquez pour prévisualiser)</span>
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  L&apos;ancien modèle officiel est activé par défaut • 4 nouveaux modèles modernes avec motifs haute définition sous forme d&apos;image sont disponibles.
                </p>
              </div>
              <Badge className="bg-blue-600 text-white font-black text-[10px] uppercase self-start sm:self-auto">
                1 Modèle par Défaut + 4 Nouveaux Motifs Image
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {ATTESTATION_MODELS.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    const baseAtt = filteredStageAttestations[0] || SAMPLE_ATTESTATIONS[0];
                    setSelectedAttestationModal({ ...baseAtt, category: 'stage', styleModel: m.id });
                    setIsAttestationModalOpen(true);
                  }}
                  className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/70 dark:bg-slate-800/50 p-2.5 transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-20 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white mb-2 flex items-center justify-center">
                      {m.motifImage ? (
                        <>
                          <img
                            src={m.motifImage}
                            alt={m.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-2 bg-white/85 rounded-md border border-amber-500/40 flex flex-col items-center justify-center p-1 text-center">
                            <span className="text-[8px] font-black uppercase text-slate-900 leading-tight">ATTESTATION DE STAGE</span>
                            <span className="text-[7px] font-bold text-amber-700">Motif Image HD</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-white border-4 border-double border-blue-950 flex flex-col items-center justify-center p-2 text-center">
                          <Scroll className="w-5 h-5 text-amber-600 mb-0.5" />
                          <span className="text-[8px] font-black uppercase text-blue-950">ANCIEN MODÈLE OFFICIEL</span>
                          <span className="text-[7px] font-bold text-amber-600">Par Défaut MINEFOP</span>
                        </div>
                      )}
                      {m.isDefault && (
                        <span className="absolute top-1.5 right-1.5 bg-blue-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-xs">
                          Par Défaut
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-black text-slate-900 dark:text-white leading-snug">{m.shortName}</p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{m.subtitle}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-[10px] font-black text-blue-600 dark:text-blue-400">
                    <span>Aperçu A4</span>
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* SEARCH & ACTION BAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom d'étudiant, matricule, entreprise..."
                value={attestationSearchTerm}
                onChange={(e) => setAttestationSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <Button
              onClick={() => handleOpenGenerator('stage')}
              className="h-11 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Award className="w-4 h-4" />
              <span>Générer Attestation Fin de Stage</span>
            </Button>
          </div>

          {/* TABLE OF STAGE ATTESTATIONS */}
          <Card className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="p-4 pl-6">Document &amp; N°</th>
                    <th className="p-4">Apprenant / Matricule</th>
                    <th className="p-4">Entreprise d'accueil</th>
                    <th className="p-4">Tuteur / Encadreur</th>
                    <th className="p-4">Date Délivrance</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                  {filteredStageAttestations.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-sm">{att.docNumber}</p>
                            <span className="text-[10px] font-bold text-amber-600">Format A4 Paysage</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-black text-slate-900 dark:text-white">{att.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{att.studentMatricule}</p>
                      </td>

                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        {att.companyName}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {att.companySupervisor || 'Non spécifié'}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-400 font-bold">
                        {att.issueDate}
                      </td>

                      <td className="p-4">
                        <Badge className={cn(
                          "text-white font-black text-[9px] uppercase border-none",
                          att.status === 'Annulée' ? "bg-rose-500 hover:bg-rose-600" :
                          att.status === 'En attente' ? "bg-amber-500 hover:bg-amber-600" :
                          "bg-emerald-500 hover:bg-emerald-600"
                        )}>
                          {att.status || 'Délivrée'}
                        </Badge>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedAttestationModal(att);
                              setIsAttestationModalOpen(true);
                            }}
                            className="h-8 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-[11px] gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visualiser / A4 Paysage</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditAttestation(att)}
                            className="h-8 px-2.5 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 font-bold text-[11px] gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-500" />
                            <span>Modifier</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAttestation(att.id!)}
                            className="h-8 w-8 p-0 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: ATTESTATIONS DE FIN DE FORMATION */}
      {mainTab === 'attestations_formation' && (
        <div className="space-y-6">
          {/* STATS OVERVIEW FOR FORMATION ATTESTATIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-xs p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attestations Formation</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {attestationsList.filter(a => a.category === 'formation').length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Scroll className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-xs p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mentions Honorifiques</p>
                  <h3 className="text-3xl font-black text-amber-500 mt-1">Très Bien / Bien</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-xs p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Spécialités Couvertes</p>
                  <h3 className="text-3xl font-black text-blue-600 mt-1">
                    {new Set(attestationsList.filter(a => a.category === 'formation').map(a => a.specialty)).size || 1}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-xs p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agrément MINEFOP</p>
                  <h3 className="text-lg font-black text-emerald-600 mt-2">Homologué</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* GALERIE DES 5 MODÈLES D'ATTESTATION DE FORMATION (1 PAR DÉFAUT + 4 NOUVEAUX MOTIFS IMAGE) */}
          <Card className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Catalogue des 5 Modèles d&apos;Attestation de Fin de Formation (Cliquez pour prévisualiser)</span>
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  L&apos;ancien modèle diplôme est activé par défaut • 4 nouveaux modèles modernes avec motifs sous forme d&apos;image sont disponibles.
                </p>
              </div>
              <Badge className="bg-emerald-600 text-white font-black text-[10px] uppercase self-start sm:self-auto">
                1 Modèle par Défaut + 4 Nouveaux Motifs Image
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {ATTESTATION_MODELS.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    const baseAtt = filteredFormationAttestations[0] || SAMPLE_ATTESTATIONS[1];
                    setSelectedAttestationModal({ ...baseAtt, category: 'formation', styleModel: m.id });
                    setIsAttestationModalOpen(true);
                  }}
                  className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-800/50 p-2.5 transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-20 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white mb-2 flex items-center justify-center">
                      {m.motifImage ? (
                        <>
                          <img
                            src={m.motifImage}
                            alt={m.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-2 bg-white/85 rounded-md border border-amber-500/40 flex flex-col items-center justify-center p-1 text-center">
                            <span className="text-[8px] font-black uppercase text-slate-900 leading-tight">FIN DE FORMATION</span>
                            <span className="text-[7px] font-bold text-emerald-700">Motif Image HD</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-[#fdfbf7] border-4 border-double border-amber-700 flex flex-col items-center justify-center p-2 text-center">
                          <Award className="w-5 h-5 text-amber-600 mb-0.5" />
                          <span className="text-[8px] font-black uppercase text-blue-950">ANCIEN MODÈLE DIPLÔME</span>
                          <span className="text-[7px] font-bold text-amber-700">Par Défaut MINEFOP</span>
                        </div>
                      )}
                      {m.isDefault && (
                        <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-xs">
                          Par Défaut
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-black text-slate-900 dark:text-white leading-snug">{m.shortName}</p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{m.subtitle}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    <span>Aperçu A4</span>
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* SEARCH & ACTION BAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom d'étudiant, matricule, spécialité, mention..."
                value={attestationSearchTerm}
                onChange={(e) => setAttestationSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <Button
              onClick={() => handleOpenGenerator('formation')}
              className="h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Scroll className="w-4 h-4 text-amber-300" />
              <span>Générer Attestation Fin de Formation</span>
            </Button>
          </div>

          {/* TABLE OF FORMATION ATTESTATIONS */}
          <Card className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="p-4 pl-6">Document &amp; N°</th>
                    <th className="p-4">Apprenant / Matricule</th>
                    <th className="p-4">Filière / Spécialité</th>
                    <th className="p-4">Période &amp; Promotion</th>
                    <th className="p-4">Mention / Note</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                  {filteredFormationAttestations.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                            <Scroll className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-sm">{att.docNumber}</p>
                            <span className="text-[10px] font-bold text-emerald-600">Format A4 Paysage</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-black text-slate-900 dark:text-white">{att.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{att.studentMatricule}</p>
                      </td>

                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        {att.specialty}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        <p className="font-bold">{att.promo}</p>
                        <p className="text-[10px] text-slate-400">{att.sessionPeriod}</p>
                      </td>

                      <td className="p-4">
                        <span className="font-black text-amber-600 dark:text-amber-400">{att.mention}</span>
                        <p className="text-[10px] font-bold text-slate-500">{att.overallAverage}</p>
                      </td>

                      <td className="p-4">
                        <Badge className={cn(
                          "text-white font-black text-[9px] uppercase border-none",
                          att.status === 'Annulée' ? "bg-rose-500 hover:bg-rose-600" :
                          att.status === 'En attente' ? "bg-amber-500 hover:bg-amber-600" :
                          "bg-emerald-500 hover:bg-emerald-600"
                        )}>
                          {att.status || 'Délivrée'}
                        </Badge>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedAttestationModal(att);
                              setIsAttestationModalOpen(true);
                            }}
                            className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visualiser / A4 Paysage</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditAttestation(att)}
                            className="h-8 px-2.5 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 font-bold text-[11px] gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-500" />
                            <span>Modifier</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAttestation(att.id!)}
                            className="h-8 w-8 p-0 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ATTESTATION GENERATOR MODAL */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl overflow-hidden my-auto">
            <CardHeader className="bg-slate-900 text-white p-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-amber-950 flex items-center justify-center font-black">
                  {genCategory === 'stage' ? <Award className="w-5 h-5" /> : <Scroll className="w-5 h-5" />}
                </div>
                <div>
                  <CardTitle className="text-base font-black uppercase tracking-tight">
                    Générateur Officiel • {genCategory === 'stage' ? 'Attestation de Fin de Stage' : 'Attestation de Fin de Formation'}
                  </CardTitle>
                  <p className="text-xs text-slate-400 font-medium">Format A4 Paysage Homologué MINEFOP</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsGeneratorOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Candidate Selection Mode */}
              <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setGenMode('select')}
                  className={cn(
                    "py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer",
                    genMode === 'select'
                      ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  🎓 Sélectionner un Apprenant
                </button>
                <button
                  type="button"
                  onClick={() => setGenMode('manual')}
                  className={cn(
                    "py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer",
                    genMode === 'manual'
                      ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  ✍️ Saisie Manuelle Libre
                </button>
              </div>

              {genMode === 'select' && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block">
                    Sélectionner l'Apprenant dans le système :
                  </label>
                  <ModernSelect
                    value={selectedGenStudentId}
                    onChange={(e) => handleSelectGenStudent(e.target.value)}
                    className="w-full text-xs font-bold"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        🎓 {s.name} ({s.matricule || s.id}) — {s.specialty || s.classCode || 'Génie Logiciel'}
                      </option>
                    ))}
                  </ModernSelect>
                </div>
              )}

              <form onSubmit={handleSaveAttestation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                      Nom et Prénom de l'Apprenant *
                    </label>
                    <input
                      type="text"
                      required
                      value={genStudentName}
                      onChange={(e) => setGenStudentName(e.target.value)}
                      placeholder="Ex: M. DJOUKOUO Paul Alain"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                      Matricule Officiel *
                    </label>
                    <input
                      type="text"
                      required
                      value={genStudentMatricule}
                      onChange={(e) => setGenStudentMatricule(e.target.value)}
                      placeholder="Ex: 26ITMC20GL001"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                      Date de Naissance
                    </label>
                    <input
                      type="text"
                      value={genBirthDate}
                      onChange={(e) => setGenBirthDate(e.target.value)}
                      placeholder="Ex: 14/05/2001"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                      Lieu de Naissance
                    </label>
                    <input
                      type="text"
                      value={genBirthPlace}
                      onChange={(e) => setGenBirthPlace(e.target.value)}
                      placeholder="Ex: Douala"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                      Filière / Spécialité *
                    </label>
                    <input
                      type="text"
                      required
                      value={genSpecialty}
                      onChange={(e) => setGenSpecialty(e.target.value)}
                      placeholder="Ex: Génie Logiciel & Développement Web"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                      Promotion / Niveau *
                    </label>
                    <input
                      type="text"
                      required
                      value={genPromo}
                      onChange={(e) => setGenPromo(e.target.value)}
                      placeholder="Ex: DQP / CQP - Niveau 3"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {genCategory === 'stage' ? (
                    <>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                          Entreprise d'Accueil *
                        </label>
                        <input
                          type="text"
                          required
                          value={genCompanyName}
                          onChange={(e) => setGenCompanyName(e.target.value)}
                          placeholder="Ex: Orange Cameroun S.A."
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                          Tuteur / Encadreur
                        </label>
                        <input
                          type="text"
                          value={genCompanySupervisor}
                          onChange={(e) => setGenCompanySupervisor(e.target.value)}
                          placeholder="Ex: M. Marc EBOA (Chef de projet)"
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                          Thème / Projet de Stage
                        </label>
                        <input
                          type="text"
                          value={genInternshipTopic}
                          onChange={(e) => setGenInternshipTopic(e.target.value)}
                          placeholder="Ex: Conception et déploiement d'un portail web d'entreprise"
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                          Période de Formation *
                        </label>
                        <input
                          type="text"
                          required
                          value={genSessionPeriod}
                          onChange={(e) => setGenSessionPeriod(e.target.value)}
                          placeholder="Ex: Du 01 Octobre 2025 au 30 Juin 2026"
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-black uppercase text-slate-500 block">
                            Mention &amp; Score (Optionnels)
                          </label>
                          <span className="text-[9px] text-slate-400 font-medium">(Laissez vide pour cacher la note)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={genMention}
                            onChange={(e) => setGenMention(e.target.value)}
                            placeholder="Ex: Très Bien"
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                          <input
                            type="text"
                            value={genOverallAverage}
                            onChange={(e) => setGenOverallAverage(e.target.value)}
                            placeholder="Ex: 17,25 / 20"
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                      Ville de Délivrance
                    </label>
                    <input
                      type="text"
                      value={genIssueCity}
                      onChange={(e) => setGenIssueCity(e.target.value)}
                      placeholder="Ex: Douala"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                      Directeur des Études Signataire
                    </label>
                    <input
                      type="text"
                      value={genDirectorName}
                      onChange={(e) => setGenDirectorName(e.target.value)}
                      placeholder="Ex: Dr. TCHAPGNIN Gédéon"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                      Statut de l'Attestation
                    </label>
                    <ModernSelect
                      value={genStatus}
                      onChange={(e) => setGenStatus(e.target.value)}
                      className="w-full text-xs font-bold"
                    >
                      <option value="Délivrée">Délivrée</option>
                      <option value="En attente">En attente</option>
                      <option value="Annulée">Annulée</option>
                    </ModernSelect>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                      Numéro de Document MINEFOP
                    </label>
                    <input
                      type="text"
                      value={genDocNumber}
                      onChange={(e) => setGenDocNumber(e.target.value)}
                      placeholder="Génération automatique"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">
                      Modèle Graphique de l&apos;Attestation (1 Ancien Modèle par Défaut + 4 Nouveaux Modèles avec Motifs en Image)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      {ATTESTATION_MODELS.map((m) => {
                        const isSelected = genStyleModel === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setGenStyleModel(m.id)}
                            className={cn(
                              "p-2 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                              isSelected
                                ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/30 shadow-xs"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300"
                            )}
                          >
                            <div className="w-full h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white mb-1.5 flex items-center justify-center relative">
                              {m.motifImage ? (
                                <img
                                  src={m.motifImage}
                                  alt={m.shortName}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-white border-2 border-double border-blue-950 flex items-center justify-center">
                                  <Scroll className="w-4 h-4 text-amber-600" />
                                </div>
                              )}
                              {m.isDefault && (
                                <span className="absolute top-0.5 right-0.5 bg-blue-600 text-white text-[7px] font-black uppercase px-1 rounded">
                                  Défaut
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-black text-slate-900 dark:text-white leading-tight block">
                              {m.shortName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsGeneratorOpen(false)}
                    className="rounded-xl font-bold text-xs h-11 px-6 border-slate-200"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl font-black text-xs h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{editingAttestationId ? "Enregistrer les Modifications" : "Générer l'Attestation Officielle"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* OFFICIAL A4 LANDSCAPE ATTESTATION PREVIEW & PRINT MODAL */}
      <OfficialAttestationModal
        isOpen={isAttestationModalOpen}
        onClose={() => {
          setIsAttestationModalOpen(false);
          setSelectedAttestationModal(null);
        }}
        attestation={selectedAttestationModal}
      />

      {/* FORM: CREATE OR EDIT ASSIGNMENT */}
      {showAssignForm && (
        <Card className="border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
            <CardTitle className="text-lg font-bold text-slate-800">
              {isEditing ? "Modifier les Détails du Stage" : "Affecter un Stage à un Apprenant"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmitForm} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Student Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Sélectionner l'Apprenant *
                  </label>
                  <ModernSelect 
                    disabled={isEditing}
                    required
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full text-sm"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        🎓 {s.name} ({s.classCode || s.promo}) — {s.matricule}
                      </option>
                    ))}
                  </ModernSelect>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Nom de l'Entreprise d'accueil *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={formCompanyName}
                      onChange={(e) => setFormCompanyName(e.target.value)}
                      placeholder="Ex: Orange Cameroun" 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Localisation / Adresse
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="Ex: Douala, Akwa" 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Nom du Tuteur en Entreprise *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={formSupervisorName}
                      onChange={(e) => setFormSupervisorName(e.target.value)}
                      placeholder="Ex: M. Jean Dupont" 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Email du Tuteur
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      value={formSupervisorEmail}
                      onChange={(e) => setFormSupervisorEmail(e.target.value)}
                      placeholder="Ex: tuteur@entreprise.cm" 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Téléphone du Tuteur
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="tel" 
                      value={formSupervisorPhone}
                      onChange={(e) => setFormSupervisorPhone(e.target.value)}
                      placeholder="Ex: +237 6xx xx xx xx" 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Date de début *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="date" 
                        required
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Durée (mois)
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      max="12"
                      value={formDurationMonths}
                      onChange={(e) => setFormDurationMonths(parseInt(e.target.value) || 2)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Statut du stage
                  </label>
                  <ModernSelect 
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full text-sm"
                  >
                    <option value="active">⚡ En Cours / Actif</option>
                    <option value="completed">✅ Terminé / Clôturé</option>
                    <option value="pending">⏳ En Attente de validation</option>
                    <option value="canceled">❌ Annulé / Suspendu</option>
                  </ModernSelect>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAssignForm(false)}
                  className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6"
                >
                  {isEditing ? "Enregistrer les modifications" : "Affecter le stage"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* DETAILED VIEW CERTIFICATE PRINT PREVIEW */}
      {showCertificate && selectedInternship && (
        <div className="space-y-6">
          {/* Print stylesheet insertion */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page {
                size: ${selectedModel % 2 === 0 ? 'landscape' : 'portrait'};
                margin: 0;
              }
              body * {
                visibility: hidden !important;
              }
              #print-area-admin, #print-area-admin * {
                visibility: visible !important;
              }
              .printable-certificate, .printable-certificate * {
                visibility: visible !important;
              }
              #print-area-admin {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: 100% !important;
                border: none !important;
                box-shadow: none !important;
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                display: block !important;
              }
              .printable-certificate {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                box-sizing: border-box !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: white !important;
                z-index: 9999999 !important;
                overflow: hidden !important;
              }
              .print-portrait {
                width: 210mm !important;
                height: 297mm !important;
              }
              .print-landscape {
                width: 297mm !important;
                height: 210mm !important;
              }
            }
          `}} />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCertificate(false)}
                className="text-slate-700 hover:bg-slate-100 h-9"
              >
                Retour
              </Button>
              <div className="h-4 w-[1px] bg-slate-300 hidden md:block" />
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                {[1, 2, 3, 4, 5].map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedModel(m)}
                    type="button"
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200",
                      selectedModel === m
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    )}
                  >
                    M{m} {m % 2 === 0 ? "Paysage" : "Portrait"}
                  </button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={printCertificate}
              className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 h-9 rounded-xl font-bold px-4"
            >
              Imprimer (Sélection)
              <Printer className="w-4 h-4" />
            </Button>
          </div>

          {/* PRINT AREA CANVAS - DYNAMICALLY SHOWING SELECTED MODEL */}
          <div id="print-area-admin" className="w-full bg-slate-100/50 p-4 md:p-8 rounded-3xl border border-slate-200 overflow-x-auto flex justify-center">
            
            {/* MODEL 1 : Classique Académique (Vertical / Portrait) */}
            {selectedModel === 1 && (
              <div 
                className="bg-white border-[24px] border-slate-950 p-6 md:p-14 w-[794px] max-w-full shadow-2xl relative font-serif text-slate-900 text-center overflow-hidden printable-certificate print-portrait"
                style={{ minHeight: '1123px' }}
              >
                {/* Elegant corner ornaments */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-600/60 pointer-events-none" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-600/60 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-600/60 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-600/60 pointer-events-none" />

                {/* Subtle background watermarked logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none z-0">
                  <img
                    src="/watermark-logo.png"
                    alt=""
                    className="w-[340px] max-w-[70%] h-auto object-contain"
                  />
                </div>

                {/* Elegant Inner Double Border */}
                <div className="border border-double border-amber-600/40 p-6 md:p-10 h-full flex flex-col justify-between relative z-10" style={{ minHeight: '940px' }}>
                  
                  {/* Header section with Logo and School Info */}
                  <div className="flex flex-col items-center justify-center space-y-1 mb-6">
                    <span className="text-[10px] tracking-widest uppercase font-sans text-amber-600 font-bold">RÉPUBLIQUE DU CAMEROUN</span>
                    <span className="text-[8px] tracking-wide text-stone-400 font-sans">PAIX - TRAVAIL - PATRIE</span>
                    <div className="w-16 h-[1px] bg-stone-200 my-1" />
                    <h2 className="text-2xl font-black tracking-widest uppercase font-serif text-slate-900">CFP - ITMC</h2>
                    <p className="text-[10px] max-w-lg tracking-wider uppercase font-sans text-slate-600 font-semibold leading-relaxed">
                      Centre de Formation Professionnelle aux Métiers des Technologies de l'Information et du Management au Cameroun
                    </p>
                    <p className="text-[9px] text-stone-400 font-sans italic">
                      Autorisation Ministérielle N° 000142/MINEFOP/SG/DFOP/SDGSF/SACD · Douala (Logpom)
                    </p>
                    <div className="w-32 h-[1px] bg-amber-600/40 my-3" />
                  </div>

                  {/* Title Block with Gold/Bronze accents */}
                  <div className="my-6">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-slate-950 font-serif leading-tight">
                      ATTESTATION DE FIN DE STAGE
                    </h1>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <div className="h-[1px] w-8 bg-amber-600/40" />
                      <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold font-sans">
                        Stage Professionnel de Fin de Cycle
                      </p>
                      <div className="h-[1px] w-8 bg-amber-600/40" />
                    </div>
                  </div>

                  {/* Certificate Body Paragraphs */}
                  <div className="my-8 max-w-2xl mx-auto space-y-5 text-sm md:text-base leading-relaxed text-slate-800 text-justify font-serif">
                    <p className="indent-8">
                      Le Directeur Académique du <strong>Centre de Formation Professionnelle (CFP-ITMC)</strong> certifie par la présente que l'apprenant(e) désigné(e) ci-après :
                    </p>
                    
                    <div className="text-center my-6">
                      <p className="text-xl md:text-2xl font-black text-amber-900 uppercase tracking-wide font-serif">
                        {selectedInternship.studentName}
                      </p>
                      <p className="text-[11px] text-stone-500 font-sans mt-1">
                        Inscrit(e) en Spécialité : <strong className="text-slate-900 font-bold">{selectedInternship.studentClass || "Génie Logiciel"}</strong> · Matricule : <strong className="text-slate-900 font-bold font-mono">{selectedInternship.id}</strong>
                      </p>
                    </div>

                    <p className="indent-8">
                      A accompli avec assiduité, dévouement et esprit d'initiative un stage d'application pratique au sein de l'organisation :
                    </p>

                    <div className="text-center my-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl max-w-md mx-auto">
                      <p className="text-lg font-black text-slate-900 uppercase">{selectedInternship.companyName}</p>
                      <p className="text-[11px] text-stone-500 font-sans mt-0.5">{selectedInternship.location || "Douala, Cameroun"}</p>
                    </div>

                    <p className="indent-8">
                      Ce stage s'est déroulé durant la période allant du <strong>{new Date(selectedInternship.startDate).toLocaleDateString('fr-FR')}</strong> au <strong>{new Date(selectedInternship.endDate).toLocaleDateString('fr-FR')}</strong> (soit une durée réglementaire de {selectedInternship.durationMonths} mois), sous la direction technique de son tuteur professionnel en entreprise, <strong>M./Mme {selectedInternship.supervisorName}</strong>.
                    </p>

                    <p className="indent-8">
                      Durant son affectation, l'apprenant(e) a su faire montre de compétences techniques avérées, d'un comportement exemplaire et d'une rigueur professionnelle conforme aux standards académiques du CFP-ITMC.
                    </p>

                    <p>
                      En foi de quoi, la présente attestation officielle lui est délivrée pour servir et valoir ce que de droit.
                    </p>
                  </div>

                  {/* Seal and Signatures Area */}
                  <div className="grid grid-cols-3 gap-4 items-center mt-12 text-xs font-sans">
                    
                    {/* Left signature */}
                    <div className="text-center">
                      <p className="font-bold uppercase tracking-wider text-slate-800 text-[10px]">Le Maître de Stage</p>
                      <p className="text-[9px] text-stone-400 italic mt-0.5">{selectedInternship.companyName}</p>
                      <div className="h-16 flex items-center justify-center">
                        <span className="font-sans italic text-stone-300 text-[11px] font-black tracking-widest">[Signature validée]</span>
                      </div>
                      <p className="font-bold text-slate-900 text-[11px]">{selectedInternship.supervisorName}</p>
                    </div>

                    {/* Golden Center Stamp Badge */}
                    <div className="flex justify-center">
                      <div className="w-20 h-24 rounded-full border-4 border-amber-600/30 flex flex-col items-center justify-center p-2 relative bg-amber-500/[0.04] shadow-inner rotate-[-6deg]">
                        <div className="w-16 h-16 rounded-full border border-dashed border-amber-600/40 flex items-center justify-center flex-col">
                          <Sparkles className="w-6 h-6 text-amber-600/80 animate-pulse" />
                          <span className="text-[7px] font-black text-amber-700/80 tracking-widest mt-1">SÉCURISÉ</span>
                        </div>
                        <span className="text-[6px] font-bold text-amber-600/60 font-mono mt-1">ITMC CERTIFIED</span>
                      </div>
                    </div>

                    {/* Right signature */}
                    <div className="text-center">
                      <p className="font-bold uppercase tracking-wider text-slate-800 text-[10px]">Pour le CFP-ITMC</p>
                      <p className="text-[9px] text-stone-400 italic mt-0.5">Le Directeur Académique</p>
                      <div className="h-16 flex items-center justify-center">
                        <span className="font-sans italic text-amber-700/80 text-[11px] font-black tracking-widest">[Sceau Académique]</span>
                      </div>
                      <p className="font-bold text-slate-900 text-[11px]">Direction Pédagogique</p>
                    </div>

                  </div>

                  {/* Decorative Seal / Cert ID footer */}
                  <div className="mt-8 pt-4 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center text-[9px] text-stone-400 font-sans tracking-wider">
                    <span>Réf Certificat: ITMC-STAGE-{selectedInternship.id.toUpperCase()}-{new Date(selectedInternship.startDate).getFullYear()}</span>
                    <span>Fait à Douala, le {new Date().toLocaleDateString('fr-FR')}</span>
                  </div>

                </div>
              </div>
            )}

            {/* MODEL 2 : Élite Moderne (Horizontal / Landscape) */}
            {selectedModel === 2 && (
              <div 
                className="bg-white border-[20px] border-slate-950 flex w-[1123px] max-w-full shadow-2xl relative font-sans text-slate-800 overflow-hidden text-left printable-certificate print-landscape"
                style={{ minHeight: '794px' }}
              >
                {/* Left golden band block */}
                <div className="w-[200px] bg-slate-950 p-8 flex flex-col justify-between items-center border-r border-amber-600/20 shrink-0 select-none">
                  <div className="flex flex-col items-center">
                    <span className="text-amber-500 font-bold text-xs uppercase tracking-widest font-mono">CFP-ITMC</span>
                    <div className="w-8 h-[2px] bg-amber-500 my-2" />
                  </div>
                  
                  {/* Vertical turned elegant text */}
                  <div className="transform -rotate-90 text-[11px] tracking-[0.25em] uppercase text-stone-400 font-mono text-center font-bold whitespace-nowrap py-12">
                    🎓 CERTIFICAT DE STAGE PROFESSIONNEL
                  </div>

                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                </div>

                {/* Right content page (wide) */}
                <div className="flex-1 p-10 md:p-14 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start border-b border-stone-100 pb-4">
                      <div>
                        <h2 className="text-3xl font-serif font-black tracking-tight text-slate-900">CERTIFICAT D'ACCOMPLISSEMENT</h2>
                        <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest font-bold">CFP-ITMC Direction Académique Douala</p>
                      </div>
                      <Badge className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg uppercase tracking-wider font-mono text-[9px] px-2.5 py-1">
                        ITMC-EXCELLENCE
                      </Badge>
                    </div>

                    <div className="space-y-4 text-sm leading-relaxed text-justify text-slate-700 font-serif">
                      <p>
                        Le Directeur de l'établissement atteste officiellement que l'étudiant(e) mentionné(e) ci-dessous a validé l'intégralité des exigences pratiques requises pour l'obtention du diplôme professionnel de fin de cycle :
                      </p>
                      
                      <div className="py-4 my-2">
                        <p className="text-2xl font-sans font-black text-slate-900">{selectedInternship.studentName}</p>
                        <p className="text-xs font-mono text-slate-500 mt-1 uppercase">
                          Spécialité : <strong className="text-slate-900">{selectedInternship.studentClass}</strong> · Matricule : <strong className="text-slate-900 font-mono">{selectedInternship.id}</strong>
                        </p>
                      </div>

                      <p>
                        A accompli avec distinction et professionnalisme ses fonctions de stagiaire auprès de la structure d'accueil <strong>{selectedInternship.companyName}</strong>, sise à <strong>{selectedInternship.location || "Douala"}</strong>, pour une période réglementaire de {selectedInternship.durationMonths} mois consécutifs, du {new Date(selectedInternship.startDate).toLocaleDateString('fr-FR')} au {new Date(selectedInternship.endDate).toLocaleDateString('fr-FR')}.
                      </p>

                      <p>
                        Pendant cette période d'immersion, l'intéressé(e) a fait preuve de rigueur technique et d'une aptitude remarquable à intégrer les équipes projets avec dynamisme.
                      </p>
                    </div>
                  </div>

                  {/* Landscape bottom signatures */}
                  <div className="grid grid-cols-2 gap-12 pt-8 border-t border-stone-100 text-xs">
                    <div>
                      <p className="font-mono text-slate-400 uppercase tracking-widest">Enseignant tuteur & Entreprise</p>
                      <p className="font-bold text-slate-800 mt-2">{selectedInternship.supervisorName} ({selectedInternship.companyName})</p>
                    </div>
                    <div>
                      <p className="font-mono text-slate-400 uppercase tracking-widest">Direction Générale CFP-ITMC</p>
                      <p className="font-bold text-slate-800 mt-2">Le Secrétariat Académique</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODEL 3 : Traditionnel Orné (Vertical / Portrait) */}
            {selectedModel === 3 && (
              <div 
                className="bg-[#fdfcf9] border-[16px] border-amber-800/20 p-8 md:p-14 w-[794px] max-w-full shadow-2xl relative font-serif text-slate-900 text-center overflow-hidden printable-certificate print-portrait"
                style={{ minHeight: '1123px' }}
              >
                {/* Intricate border overlay */}
                <div className="absolute inset-4 border border-amber-600/30 pointer-events-none" />
                <div className="absolute inset-5 border-4 border-double border-amber-600/10 pointer-events-none" />

                <div className="h-full flex flex-col justify-between py-6 relative z-10" style={{ minHeight: '940px' }}>
                  
                  {/* Ornate Header */}
                  <div className="space-y-2">
                    <span className="text-amber-800 font-bold text-xs uppercase tracking-[0.2em]">Scolarité Traditionnelle</span>
                    <h2 className="text-2xl font-serif font-black italic tracking-wide text-slate-950">Centre de Formation Professionnelle ITMC</h2>
                    <p className="text-[10px] text-stone-500 tracking-wider">Agrément Officiel MINEFOP · Douala, Cameroun</p>
                    <div className="w-16 h-[2px] bg-amber-700/30 mx-auto mt-4" />
                  </div>

                  {/* Calligraphy Title */}
                  <div className="my-10">
                    <p className="text-stone-400 italic text-sm">Le présent document atteste solennellement de la</p>
                    <h1 className="text-4xl font-serif font-extrabold italic text-amber-900 tracking-wide mt-2">
                      Validation de Stage Professionnel
                    </h1>
                  </div>

                  {/* Parchment Body */}
                  <div className="max-w-xl mx-auto space-y-5 text-sm md:text-base leading-relaxed text-stone-800 italic">
                    <p>
                      Il est certifié devant l'institution académique que l'élève-apprenti :
                    </p>
                    
                    <p className="text-2xl font-bold font-serif not-italic text-slate-900 underline decoration-amber-600/50 underline-offset-8">
                      {selectedInternship.studentName}
                    </p>

                    <p className="text-xs font-mono tracking-wider not-italic text-stone-500">
                      Spécialité : {selectedInternship.studentClass} · Année {selectedInternship.academicYear}
                    </p>

                    <p>
                      A accompli avec honneur et assiduité son stage d'immersion professionnelle obligatoire auprès de la structure :
                    </p>

                    <p className="text-lg font-bold font-serif not-italic text-amber-900">
                      {selectedInternship.companyName}
                    </p>

                    <p>
                      Durant la période du {new Date(selectedInternship.startDate).toLocaleDateString('fr-FR')} au {new Date(selectedInternship.endDate).toLocaleDateString('fr-FR')} sous l'encadrement pédagogique de M./Mme {selectedInternship.supervisorName}.
                    </p>
                  </div>

                  {/* Vintage red/wax seal SVG */}
                  <div className="my-6 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center shadow-lg relative border-4 border-red-800 select-none">
                      <div className="w-10 h-10 rounded-full border border-dashed border-red-600 flex items-center justify-center text-white text-[8px] font-mono tracking-widest font-black">
                        ITMC
                      </div>
                      <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-500" />
                    </div>
                  </div>

                  {/* Calligraphy Signature lines */}
                  <div className="grid grid-cols-2 gap-8 text-xs font-sans not-italic text-stone-500 mt-8">
                    <div>
                      <p className="font-semibold uppercase text-slate-800">Le Secrétariat Académique</p>
                      <div className="h-12" />
                      <p className="italic font-serif">Douala, Cameroun</p>
                    </div>
                    <div>
                      <p className="font-semibold uppercase text-slate-800">Le Directeur Pédagogique</p>
                      <div className="h-12" />
                      <p className="font-bold text-slate-900">CFP-ITMC Administration</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* MODEL 4 : Tech Minimaliste (Horizontal / Landscape) */}
            {selectedModel === 4 && (
              <div 
                className="bg-slate-950 border-4 border-slate-800 p-8 md:p-14 w-[1123px] max-w-full shadow-2xl relative font-mono text-slate-300 text-left overflow-hidden printable-certificate print-landscape"
                style={{ minHeight: '794px' }}
              >
                {/* Tech glowing background effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

                <div className="h-full flex flex-col justify-between" style={{ minHeight: '640px' }}>
                  
                  {/* Header info */}
                  <div className="flex justify-between items-start border-b border-slate-800 pb-6">
                    <div>
                      <h2 className="text-xl font-black text-white tracking-widest">[ MODULE::INTERNSHIP_VALIDATION ]</h2>
                      <p className="text-[10px] text-slate-500 mt-1">CFP-ITMC ADVANCED PLATFORM // SYSTEME SECURISE</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <p>CERT_ID: {selectedInternship.id.toUpperCase()}</p>
                      <p>STATUS: VERIFIED_IMMUTABLE</p>
                    </div>
                  </div>

                  {/* Body Statement */}
                  <div className="my-10 space-y-6 text-sm">
                    <p className="text-slate-400">
                      &gt; L'étudiant(e) identifié(e) ci-après a validé avec succès le protocole académique de stage en entreprise :
                    </p>

                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <p className="text-lg font-black text-white">&gt; {selectedInternship.studentName}</p>
                      <p className="text-xs text-slate-400">
                        &gt; CLASSE: {selectedInternship.studentClass} // SPEC: {selectedInternship.studentClass}
                      </p>
                      <p className="text-xs text-slate-400">&gt; MATRICULE_ID: {selectedInternship.id}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-slate-400">
                        &gt; Entreprise d'accueil : <strong className="text-white">{selectedInternship.companyName}</strong> ({selectedInternship.location || "Cameroun"})
                      </p>
                      <p className="text-slate-400">
                        &gt; Durée : {selectedInternship.durationMonths} mois ({new Date(selectedInternship.startDate).toLocaleDateString()} &gt; {new Date(selectedInternship.endDate).toLocaleDateString()})
                      </p>
                      <p className="text-slate-400">
                        &gt; Superviseur principal : M./Mme {selectedInternship.supervisorName}
                      </p>
                    </div>
                  </div>

                  {/* Monospace block cryptographic verification hash */}
                  <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-[10px] text-slate-500 flex justify-between items-center flex-wrap gap-2">
                    <span>DIGITAL_HASH_CHECK: 0x7fa890e1cb2a0149e9842bfcfc0211a19b88ef112a9e3bc89f1f0a82e8bf951a</span>
                    <span>ITMC VERIFIED SECURE GATEWAY</span>
                  </div>

                  {/* Minimal signatures */}
                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-800 text-xs">
                    <div>
                      <p className="text-slate-500">// MAITRE DE STAGE SIGNATURE</p>
                      <p className="text-white mt-1">{selectedInternship.supervisorName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">// CFP-ITMC DIRECTION SIGNATURE</p>
                      <p className="text-white mt-1">Directeur Académique</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* MODEL 5 : Prestige Impérial (Vertical / Portrait) */}
            {selectedModel === 5 && (
              <div 
                className="bg-white border-2 border-stone-200 w-[794px] max-w-full shadow-2xl relative font-sans text-slate-800 text-center overflow-hidden printable-certificate print-portrait"
                style={{ minHeight: '1123px' }}
              >
                {/* Header blue banner solid block */}
                <div className="bg-indigo-950 text-white py-12 px-8 border-b-8 border-amber-500 relative">
                  <span className="text-[10px] tracking-widest uppercase text-amber-500 font-extrabold">CFP-ITMC ACADEMY</span>
                  <h1 className="text-3xl font-black uppercase mt-2 tracking-wider">PRESTIGE IMPÉRIAL</h1>
                  <p className="text-xs text-stone-300 mt-1 uppercase tracking-widest">Attestation d'Excellence Académique et Technique</p>
                </div>

                <div className="p-8 md:p-14 flex flex-col justify-between" style={{ minHeight: '750px' }}>
                  
                  {/* Imperial Seal icon representation */}
                  <div className="my-4 flex justify-center">
                    <div className="w-16 h-16 bg-amber-500/10 border border-amber-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-amber-500" />
                    </div>
                  </div>

                  {/* Content statement */}
                  <div className="space-y-6 max-w-xl mx-auto text-sm leading-relaxed text-stone-700 font-serif text-justify">
                    <p className="text-center font-sans uppercase font-bold text-slate-500 text-xs tracking-wider">Le Conseil Pédagogique Déclare :</p>
                    
                    <p className="indent-8">
                      Ayant satisfait pleinement à l'ensemble du cursus de formation professionnelle et technique du CFP-ITMC, l'étudiant(e) émérite désigné(e) ci-après a validé with brio ses travaux de recherche appliquée et son stage professionnel :
                    </p>

                    <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-md mx-auto">
                      <p className="text-2xl font-sans font-black text-slate-900 uppercase">{selectedInternship.studentName}</p>
                      <p className="text-xs text-stone-500 mt-1 font-sans">
                        Filière : {selectedInternship.studentClass}
                      </p>
                    </div>

                    <p className="indent-8">
                      A réalisé ses travaux de stage en entreprise avec discipline, créativité et esprit de corps au sein de l'organisation <strong>{selectedInternship.companyName}</strong> (Douala), sous la tutelle de <strong>M./Mme {selectedInternship.supervisorName}</strong>.
                    </p>
                  </div>

                  {/* Imperial signatures footer */}
                  <div className="grid grid-cols-2 gap-12 border-t border-stone-100 pt-8 text-xs font-sans text-stone-500">
                    <div>
                      <p className="font-bold text-slate-800">LA DIRECTION DU STAGE</p>
                      <div className="h-12" />
                      <p className="font-bold text-slate-900">{selectedInternship.supervisorName}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">LE DIRECTEUR ACADÉMIQUE</p>
                      <div className="h-12" />
                      <p className="font-bold text-slate-900">CFP-ITMC Administration</p>
                    </div>
                  </div>

                  {/* Cert ID */}
                  <div className="pt-8 text-[9px] text-stone-400 font-mono flex justify-between items-center border-t border-stone-100 mt-6">
                    <span>VERIFICATION_KEY: {selectedInternship.id.toUpperCase()}</span>
                    <span>Douala, le {new Date().toLocaleDateString('fr-FR')}</span>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CENTRAL FILTER BAR & STAGES TABLE PANEL */}
      {!showAssignForm && !showCertificate && (
        <div className="space-y-8">
          
          {/* ========================================================================= */}
          {/* CONSOLE DE SUIVI DE STAGE : CHEMINEMENT GAMIFIÉ / QUÊTE ÉPIQUE EN NIVEAUX */}
          {/* ========================================================================= */}
          {selectedInternship ? (() => {
            const quest = getInternshipQuestInfo(selectedInternship);
            const activeStep = quest.steps.find(s => s.id === activeQuestStep) || quest.steps[0];
            
            return (
              <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl overflow-hidden">
                {/* Ambient glowing radial effects */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
                
                {/* HEADER DE LA QUÊTE */}
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-white/10">
                  {/* Student avatar & quest identity */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-indigo-500/30">
                        {selectedInternship.studentName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                        <Crown className="w-3 h-3" />
                        <span>Niv.{quest.currentLevel}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold tracking-wider text-indigo-400 uppercase">
                          Quête de Stage CFP-ITMC
                        </span>
                        <span className="text-slate-500">•</span>
                        <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px] font-bold">
                          {quest.rankTitle}
                        </Badge>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                        {selectedInternship.studentName}
                      </h2>
                      <p className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                        <span className="font-semibold text-amber-300">🏢 {selectedInternship.companyName}</span>
                        <span>·</span>
                        <span>Classe : {selectedInternship.studentClass || "Filière Métier"}</span>
                        <span>·</span>
                        <span className="text-slate-400">Tuteur : {selectedInternship.supervisorName}</span>
                      </p>
                    </div>
                  </div>

                  {/* XP & Progress Gauge */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[240px] w-full sm:w-auto">
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                          Progression de Quête
                        </span>
                        <span className="font-mono font-black text-amber-300 text-sm">
                          {quest.xp} / {quest.totalXp} XP
                        </span>
                      </div>
                      <div className="w-full bg-slate-800/80 rounded-full h-3 p-0.5 overflow-hidden border border-white/10">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400 h-full rounded-full transition-all duration-700 shadow-md shadow-amber-400/20"
                          style={{ width: `${quest.progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-medium">
                        <span>Étape {quest.currentLevel} sur 6</span>
                        <span className="text-emerald-400 font-bold">{quest.progressPercent}% Complété</span>
                      </div>
                    </div>

                    {/* Quick shortcut buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedInternship.status === 'completed' ? (
                        <Button
                          onClick={() => {
                            setSelectedAttestationModal({
                              id: selectedInternship.id,
                              docNumber: `ITMC-AFS-2026/${selectedInternship.id.slice(-4).toUpperCase()}`,
                              category: 'stage',
                              styleModel: 'classic',
                              studentName: selectedInternship.studentName,
                              studentMatricule: selectedInternship.studentId || selectedInternship.id,
                              specialty: selectedInternship.studentClass || 'Génie Logiciel',
                              promo: 'DQP / CQP - Niveau 3',
                              companyName: selectedInternship.companyName,
                              companySupervisor: selectedInternship.supervisorName,
                              internshipTopic: selectedInternship.tutorAppreciation || 'Mise en œuvre professionnelle en entreprise',
                              issueDate: new Date().toLocaleDateString('fr-FR'),
                              issueCity: 'Douala',
                              directorName: 'Dr. TCHAPGNIN Gédéon',
                              status: 'Délivrée'
                            });
                            setIsAttestationModalOpen(true);
                          }}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 py-2 h-auto cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-950" />
                          Imprimer l&apos;Attestation (5 Modèles)
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleCloseInternshipDirect(selectedInternship.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 py-2 h-auto cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                          Clôturer le Stage 🏆
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        onClick={() => setSelectedInternship(null)}
                        className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl h-9 w-9 p-0"
                        title="Réduire la console"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* LE CHEMINEMENT DE JEU (GAME ROADMAP : 6 ÉTAPES CONNECTÉES) */}
                {/* ========================================================= */}
                <div className="relative z-10 py-8">
                  <div className="text-center mb-6">
                    <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                      🗺️ Cheminement Interactif du Stage • Cliquez sur une étape pour inspecter ou agir
                    </span>
                  </div>

                  {/* Horizontal Quest Trail */}
                  <div className="relative">
                    {/* Connecting line behind nodes */}
                    <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 bg-slate-800 z-0">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-400 transition-all duration-700"
                        style={{ width: `${Math.min(100, ((quest.currentLevel - 1) / 5) * 100)}%` }}
                      />
                    </div>

                    {/* Nodes grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
                      {quest.steps.map((st) => {
                        const isSelected = activeQuestStep === st.id;
                        const isCurrentActive = quest.currentLevel === st.id;
                        const isDone = st.status === 'completed';
                        const isLocked = st.status === 'locked';

                        return (
                          <div
                            key={st.id}
                            onClick={() => setActiveQuestStep(st.id)}
                            className={cn(
                              "cursor-pointer rounded-2xl p-4 transition-all duration-300 relative flex flex-col items-center text-center border group",
                              isSelected 
                                ? "bg-white/15 border-indigo-400 shadow-xl shadow-indigo-500/20 scale-105" 
                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
                              isCurrentActive && !isSelected && "ring-2 ring-indigo-400/60"
                            )}
                          >
                            {/* Step Badge XP */}
                            <span className={cn(
                              "text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full mb-3",
                              isDone 
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                                : isCurrentActive 
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse" 
                                  : "bg-slate-800 text-slate-400"
                            )}>
                              +{st.xp} XP
                            </span>

                            {/* Node icon circle */}
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg mb-2.5 transition-all shadow-md",
                              isDone 
                                ? "bg-emerald-500 text-white shadow-emerald-500/30" 
                                : isCurrentActive 
                                  ? "bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-indigo-500/40 ring-4 ring-indigo-400/40 animate-pulse" 
                                  : "bg-slate-800 text-slate-500 border border-white/5"
                            )}>
                              {isDone ? (
                                <Check className="w-6 h-6 stroke-[3]" />
                              ) : isLocked ? (
                                <Lock className="w-5 h-5 text-slate-500" />
                              ) : (
                                st.id === 6 ? <Crown className="w-6 h-6 text-amber-300" /> :
                                st.id === 5 ? <BookOpen className="w-5 h-5" /> :
                                st.id === 4 ? <Award className="w-5 h-5" /> :
                                st.id === 3 ? <Shield className="w-5 h-5" /> :
                                st.id === 2 ? <Scroll className="w-5 h-5" /> :
                                <Rocket className="w-5 h-5" />
                              )}
                            </div>

                            {/* Title & subtitle */}
                            <p className="text-xs font-bold text-white leading-tight">
                              {st.title}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                              {st.subtitle}
                            </p>

                            {/* Status tag */}
                            <div className="mt-3">
                              {isDone ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                                  <CheckCircle2 className="w-3 h-3" /> Validé
                                </span>
                              ) : isCurrentActive ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-300">
                                  <Zap className="w-3 h-3 text-amber-400 animate-bounce" /> En cours
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-500">Verrouillé</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* FICHE D'INSPECTION DE L'ÉTAPE ACTIVE & ACTIONS DU MAÎTRE  */}
                {/* ========================================================= */}
                <div className="relative z-10 bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black">
                        #{activeStep.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-white">
                            Étape {activeStep.id} : {activeStep.title}
                          </h3>
                          <Badge className={cn(
                            "text-[10px] font-bold",
                            activeStep.status === 'completed'
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : activeStep.status === 'in_progress'
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-slate-800 text-slate-400"
                          )}>
                            {activeStep.status === 'completed' ? 'Complété ✅' : activeStep.status === 'in_progress' ? 'Objectif Actif ⚡' : 'Verrouillé 🔒'}
                          </Badge>
                        </div>
                        <p className="text-xs text-indigo-300 font-medium mt-0.5">
                          {activeStep.subtitle} • Récompense : +{activeStep.xp} XP
                        </p>
                      </div>
                    </div>

                    {/* Step navigation & Quick Step Advancer */}
                    <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={activeQuestStep <= 1}
                        onClick={() => setActiveQuestStep(prev => Math.max(1, prev - 1))}
                        className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs h-8 rounded-lg cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={activeQuestStep >= 6}
                        onClick={() => setActiveQuestStep(prev => Math.min(6, prev + 1))}
                        className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs h-8 rounded-lg cursor-pointer"
                      >
                        Suivant <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>

                      {quest.currentLevel < 6 && (
                        <Button
                          size="sm"
                          onClick={() => handleAdvanceQuest(selectedInternship)}
                          className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs h-8 rounded-lg shadow-md cursor-pointer ml-2"
                        >
                          <Zap className="w-3.5 h-3.5 mr-1 text-amber-300" />
                          Débloquer Étape Suivante ➡️
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Lore / Description */}
                  <p className="text-xs sm:text-sm text-slate-300 italic py-3 leading-relaxed">
                    "{activeStep.lore}"
                  </p>

                  {/* Interactive Controls according to the active step */}
                  <div className="pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        État de l'Objectif
                      </span>
                      <p className="text-xs font-semibold text-white bg-white/5 p-3 rounded-xl border border-white/5">
                        📌 {activeStep.details}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-start md:justify-end gap-2.5">
                      {/* Step 1 actions */}
                      {activeStep.id === 1 && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenEdit(selectedInternship)}
                          className="bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl"
                        >
                          Modifier l'affectation & entreprise
                        </Button>
                      )}

                      {/* Step 2 actions (Convention) */}
                      {activeStep.id === 2 && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleToggleConvention(selectedInternship)}
                            className={cn(
                              "text-xs rounded-xl font-bold cursor-pointer",
                              quest.hasConvention 
                                ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40" 
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                            )}
                          >
                            <Scroll className="w-3.5 h-3.5 mr-1.5" />
                            {quest.hasConvention ? "Convention Validée ✅ (Cliquer pour annuler)" : "Marquer la Convention comme Signée"}
                          </Button>
                        </>
                      )}

                      {/* Step 3 actions (Immersion & Midterm) */}
                      {activeStep.id === 3 && (
                        <Button
                          size="sm"
                          onClick={() => handleToggleMidterm(selectedInternship)}
                          className={cn(
                            "text-xs rounded-xl font-bold cursor-pointer",
                            quest.hasMidterm 
                              ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40" 
                              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                          )}
                        >
                          <Shield className="w-3.5 h-3.5 mr-1.5" />
                          {quest.hasMidterm ? "Jalon Mi-Parcours Validé ⚡ (Cliquer pour révoquer)" : "Valider le Cap Mi-Parcours (30-45 jours)"}
                        </Button>
                      )}

                      {/* Step 4 actions (Tutor evaluation) */}
                      {activeStep.id === 4 && (
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
                            <span className="text-slate-400 font-bold">Note :</span>
                            <input 
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={tutorScoreInput}
                              onChange={(e) => setTutorScoreInput(e.target.value)}
                              className="w-14 bg-transparent text-white font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                            />
                            <span className="text-slate-400">/20</span>
                          </div>

                          <input 
                            type="text"
                            placeholder="Appréciation du tuteur..."
                            value={tutorAppreciationInput}
                            onChange={(e) => setTutorAppreciationInput(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full sm:w-48"
                          />

                          <Button
                            size="sm"
                            onClick={() => handleSaveTutorEvaluation(selectedInternship)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
                          >
                            Enregistrer la Note 🎖️
                          </Button>
                        </div>
                      )}

                      {/* Step 5 actions (Rapport) */}
                      {activeStep.id === 5 && (
                        <Button
                          size="sm"
                          onClick={() => handleToggleReport(selectedInternship)}
                          className={cn(
                            "text-xs rounded-xl font-bold cursor-pointer",
                            quest.hasReport 
                              ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40" 
                              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                          )}
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                          {quest.hasReport ? "Rapport de Stage Validé Conforme 📘 (Cliquer pour annuler)" : "Valider la Recevabilité du Rapport"}
                        </Button>
                      )}

                      {/* Step 6 actions (Clôture & Attestation) */}
                      {activeStep.id === 6 && (
                        <>
                          {selectedInternship.status !== 'completed' ? (
                            <Button
                              size="sm"
                              onClick={() => handleCloseInternshipDirect(selectedInternship.id)}
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer"
                            >
                              <Crown className="w-3.5 h-3.5 mr-1.5" />
                              Clôturer Officiellement le Stage 🏆
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedAttestationModal({
                                  id: selectedInternship.id,
                                  docNumber: `ITMC-AFS-2026/${selectedInternship.id.slice(-4).toUpperCase()}`,
                                  category: 'stage',
                                  styleModel: 'classic',
                                  studentName: selectedInternship.studentName,
                                  studentMatricule: selectedInternship.studentId || selectedInternship.id,
                                  specialty: selectedInternship.studentClass || 'Génie Logiciel',
                                  promo: 'DQP / CQP - Niveau 3',
                                  companyName: selectedInternship.companyName,
                                  companySupervisor: selectedInternship.supervisorName,
                                  internshipTopic: selectedInternship.tutorAppreciation || 'Mise en œuvre professionnelle en entreprise',
                                  issueDate: new Date().toLocaleDateString('fr-FR'),
                                  issueCity: 'Douala',
                                  directorName: 'Dr. TCHAPGNIN Gédéon',
                                  status: 'Délivrée'
                                });
                                setIsAttestationModalOpen(true);
                              }}
                              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 mr-1.5" />
                              Ouvrir le Studio d&apos;Attestations (5 Modèles) 🖨️
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Achievements Shelf */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Trophées de l'Apprenant :
                    </span>
                    <Badge className={cn("text-[10px] font-bold", quest.hasConvention ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-white/5 text-slate-500 border-transparent opacity-40")}>
                      🛡️ Pacte Scellé
                    </Badge>
                    <Badge className={cn("text-[10px] font-bold", quest.hasMidterm ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-white/5 text-slate-500 border-transparent opacity-40")}>
                      ⚡ Guerrier du Terrain
                    </Badge>
                    <Badge className={cn("text-[10px] font-bold", quest.hasEvaluation ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : "bg-white/5 text-slate-500 border-transparent opacity-40")}>
                      🎖️ Étoile du Tuteur
                    </Badge>
                    <Badge className={cn("text-[10px] font-bold", quest.hasReport ? "bg-blue-500/20 text-blue-300 border-blue-500/40" : "bg-white/5 text-slate-500 border-transparent opacity-40")}>
                      📘 Maître Rédacteur
                    </Badge>
                    <Badge className={cn("text-[10px] font-bold", quest.isCompleted ? "bg-amber-400 text-slate-950 border-amber-300 font-black" : "bg-white/5 text-slate-500 border-transparent opacity-40")}>
                      👑 Diplômé d'Élite MINEFOP
                    </Badge>
                  </div>
                </div>

              </div>
            );
          })() : (
            <Card className="border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-slate-50 rounded-3xl p-6 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md">
                  <Flame className="w-6 h-6 animate-pulse text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Console de Suivi & Cheminement de Quête</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Sélectionnez un apprenant dans le tableau ci-dessous pour ouvrir son parcours de stage gamifié étape par étape.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* TABLEAU DES AFFECTATIONS & COLONNE DE QUÊTE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT TABLE AREA (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-slate-200 rounded-3xl bg-white shadow-xs overflow-hidden">
                <CardHeader className="bg-slate-50/30 border-b border-slate-100 p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="font-bold text-slate-800">Affectations de Stage enregistrées</h3>
                    
                    {/* Quick search input */}
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher apprenant, tuteur..." 
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  {/* Filters selectors */}
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Filter className="w-3.5 h-3.5" />
                      <span>Filtrer par :</span>
                    </div>

                    <ModernSelect 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs min-w-[130px]"
                    >
                      <option value="all">📁 Tous les Statuts</option>
                      <option value="active">⚡ En Cours</option>
                      <option value="completed">✅ Clôturés</option>
                      <option value="pending">⏳ En Attente</option>
                      <option value="canceled">❌ Annulés</option>
                    </ModernSelect>

                    <ModernSelect 
                      value={levelFilter} 
                      onChange={(e) => setLevelFilter(e.target.value)}
                      className="text-xs min-w-[150px]"
                    >
                      <option value="all">🎮 Tous les Niveaux de Quête</option>
                      <option value="1">🚀 Niv. 1 : Initialisé</option>
                      <option value="2">📜 Niv. 2 : Convention</option>
                      <option value="3">⚡ Niv. 3 : Immersion</option>
                      <option value="4">🎖️ Niv. 4 : Évaluation</option>
                      <option value="5">📘 Niv. 5 : Rapport</option>
                      <option value="6">👑 Niv. 6 : Clôturé / Certifié</option>
                    </ModernSelect>

                    <ModernSelect 
                      value={classFilter} 
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="text-xs min-w-[150px]"
                    >
                      <option value="all">🏫 Toutes les classes</option>
                      {uniqueClasses.map(cl => (
                        <option key={cl} value={cl}>📚 {cl}</option>
                      ))}
                    </ModernSelect>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredInternships.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Aucune affectation de stage trouvée pour ces critères de recherche.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold">
                            <th className="p-4">Apprenant</th>
                            <th className="p-4">Entreprise & Tuteur</th>
                            <th className="p-4">Cheminement de Quête</th>
                            <th className="p-4">Dates</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          {filteredInternships.map((it) => {
                            const q = getInternshipQuestInfo(it);
                            const isSelected = selectedInternship?.id === it.id;

                            return (
                              <tr 
                                key={it.id} 
                                onClick={() => setSelectedInternship(it)}
                                className={cn(
                                  "hover:bg-slate-50/80 transition-colors cursor-pointer",
                                  isSelected && "bg-indigo-50/60 font-semibold"
                                )}
                              >
                                <td className="p-4">
                                  <p className="font-bold text-slate-900">{it.studentName}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{it.studentClass}</p>
                                </td>
                                <td className="p-4">
                                  <p className="font-semibold text-slate-800">{it.companyName}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Tuteur : {it.supervisorName}</p>
                                </td>
                                
                                {/* Colonne de cheminement visuel */}
                                <td className="p-4">
                                  <div className="space-y-1.5 min-w-[130px]">
                                    {/* Mini 6-pip trail */}
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5, 6].map(stepNum => {
                                        const isPast = stepNum < q.currentLevel || (q.isCompleted && stepNum === 6);
                                        const isCurr = stepNum === q.currentLevel && !q.isCompleted;
                                        return (
                                          <div
                                            key={stepNum}
                                            className={cn(
                                              "w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black transition-all",
                                              isPast 
                                                ? "bg-emerald-500 text-white" 
                                                : isCurr 
                                                  ? "bg-indigo-600 text-white ring-2 ring-indigo-400/50 animate-pulse" 
                                                  : "bg-slate-200 text-slate-400"
                                            )}
                                          >
                                            {isPast ? "✓" : stepNum}
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-bold text-indigo-700">Niv. {q.currentLevel}/6</span>
                                      <span className="text-slate-400 font-mono">{q.xp} XP</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-4">
                                  <p>{new Date(it.startDate).toLocaleDateString('fr-FR')}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{it.durationMonths} mois</p>
                                </td>

                                <td className="p-4">
                                  <Badge className={cn(
                                    "font-mono uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-full border",
                                    it.status === 'completed' 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                  )}>
                                    {it.status === 'completed' ? 'Clôturé' : 'En Cours'}
                                  </Badge>
                                </td>

                                <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-end gap-1.5">
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => setSelectedInternship(it)}
                                      className="h-7 text-[10px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-0 rounded-lg font-bold"
                                    >
                                      Quête
                                    </Button>

                                    {it.status === 'active' && (
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => handleCloseInternshipDirect(it.id)}
                                        className="h-7 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-0 rounded-lg font-bold"
                                      >
                                        Clôturer
                                      </Button>
                                    )}
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => handleOpenEdit(it)}
                                      className="h-7 text-[10px] text-slate-600 hover:text-slate-900 px-2 py-0 rounded-lg"
                                    >
                                      Modifier
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => handleDeleteInternship(it.id)}
                                      className="h-7 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-0 rounded-lg"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT DOSSIER DRAWER PANEL (1 col) */}
            <div className="lg:col-span-1">
              {selectedInternship ? (
                <Card className="border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden sticky top-6">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-row items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">Dossier de Stage</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Apprenant: {selectedInternship.studentName}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedInternship(null)}
                      className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-5 space-y-6">
                    
                    {/* General company info */}
                    <div className="space-y-2 text-xs">
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Informations Entreprise</p>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                        <p className="font-extrabold text-sm text-slate-950">{selectedInternship.companyName}</p>
                        <p className="flex items-center gap-1.5 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          {selectedInternship.location || "Douala, Cameroun"}
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          Du {new Date(selectedInternship.startDate).toLocaleDateString('fr-FR')} au {new Date(selectedInternship.endDate).toLocaleDateString('fr-FR')} ({selectedInternship.durationMonths} mois)
                        </p>
                      </div>
                    </div>

                    {/* Supervisor with official phone numbers */}
                    <div className="space-y-2 text-xs">
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Responsable / Tuteur en Entreprise</p>
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                        <p className="font-bold text-slate-900">{selectedInternship.supervisorName}</p>
                        {selectedInternship.supervisorEmail && (
                          <p className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            {selectedInternship.supervisorEmail}
                          </p>
                        )}
                        <p className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Phone className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                          <span>{selectedInternship.supervisorPhone || "+237 638 36 63 22 // +237 688 05 20 94"}</span>
                        </p>

                        <div className="pt-2">
                          <a 
                            href="https://wa.me/237638366322"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[11px] font-bold transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Contacter le Secrétariat / Tuteur WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Documents uploaded */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Pièces Justificatives</p>
                        <span className="text-[10px] text-stone-400">{selectedInternship.documents?.length || 0} document(s)</span>
                      </div>

                      {/* Admin simple upload helper */}
                      <div className="p-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <ModernSelect 
                          value={docType}
                          onChange={(e) => setDocType(e.target.value)}
                          className="w-full mb-2 text-xs"
                        >
                          <option value="convention">📄 Convention signée</option>
                          <option value="evaluation">🏅 Fiche d'Évaluation</option>
                          <option value="rapport">📝 Rapport validé</option>
                          <option value="attestation">🎓 Attestation entreprise</option>
                        </ModernSelect>
                        <div className="relative">
                          <input 
                            type="file" 
                            id="admin-file-upload" 
                            disabled={uploadingDoc}
                            onChange={handleAdminFileUpload}
                            className="hidden" 
                            accept=".pdf,.png,.jpg,.jpeg"
                          />
                          <label 
                            htmlFor="admin-file-upload"
                            className="w-full cursor-pointer inline-flex items-center justify-center gap-1.5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-semibold hover:bg-slate-800 transition-colors"
                          >
                            Ajouter un document
                            <Upload className="w-3 h-3" />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2 mt-2">
                        {selectedInternship.documents && selectedInternship.documents.length > 0 ? (
                          <div className="border border-slate-100 rounded-2xl bg-white overflow-hidden divide-y divide-slate-100">
                            {selectedInternship.documents.map(d => (
                              <div key={d.id} className="p-3 hover:bg-slate-50/80 text-[11px] space-y-2">
                                {editingDocId === d.id ? (
                                  <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                    <div>
                                      <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Nom du document</label>
                                      <input
                                        type="text"
                                        value={editingDocName}
                                        onChange={(e) => setEditingDocName(e.target.value)}
                                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Type</label>
                                        <ModernSelect
                                          value={editingDocType}
                                          onChange={(e) => setEditingDocType(e.target.value)}
                                          className="w-full py-1 text-xs"
                                        >
                                          <option value="convention">📄 Convention</option>
                                          <option value="evaluation">🏅 Évaluation</option>
                                          <option value="rapport">📝 Rapport</option>
                                          <option value="attestation">🎓 Attestation</option>
                                        </ModernSelect>
                                      </div>
                                      <div>
                                        <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Statut</label>
                                        <ModernSelect
                                          value={editingDocStatus}
                                          onChange={(e) => setEditingDocStatus(e.target.value)}
                                          className="w-full py-1 text-xs"
                                        >
                                          <option value="Validé">🟢 Validé</option>
                                          <option value="En attente">🟡 En attente</option>
                                          <option value="Rejeté">🔴 Rejeté</option>
                                        </ModernSelect>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-200">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingDocId(null)}
                                        className="h-7 text-[10px] px-2.5 text-slate-500 hover:text-slate-800"
                                      >
                                        Annuler
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleSaveDocumentEdit(d.id)}
                                        className="h-7 text-[10px] px-3 bg-blue-600 text-white hover:bg-blue-700 font-bold"
                                      >
                                        Enregistrer
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold text-slate-800 truncate" title={d.name}>{d.name}</p>
                                      <p className="text-[9px] text-slate-400 capitalize mt-0.5">
                                        Type: <span className="font-bold text-slate-600">{d.type}</span> · {d.uploadedBy}
                                      </p>
                                      <div className="mt-1 flex items-center gap-1.5">
                                        <Badge className={cn(
                                          "font-black text-[8px] uppercase px-1.5 py-0.5 border-none",
                                          d.status === 'Rejeté' ? "bg-rose-100 text-rose-700" :
                                          d.status === 'En attente' ? "bg-amber-100 text-amber-700" :
                                          "bg-emerald-100 text-emerald-700"
                                        )}>
                                          {d.status || 'Validé'}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <a 
                                        href={d.fileContent || '#'} 
                                        download={d.name}
                                        className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                                        title="Télécharger"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </a>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setEditingDocId(d.id);
                                          setEditingDocName(d.name);
                                          setEditingDocType(d.type);
                                          setEditingDocStatus(d.status || 'Validé');
                                        }}
                                        className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                                        title="Modifier"
                                      >
                                        <Edit className="w-3.5 h-3.5 text-blue-500" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteDocument(d.id)}
                                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                                        title="Supprimer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic text-center py-4 bg-slate-50 rounded-2xl">
                            Aucun document déposé par l'apprenant.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions summary */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      {selectedInternship.status === 'completed' ? (
                        <Button 
                          onClick={() => {
                            setSelectedAttestationModal({
                              id: selectedInternship.id,
                              docNumber: `ITMC-AFS-2026/${selectedInternship.id.slice(-4).toUpperCase()}`,
                              category: 'stage',
                              styleModel: 'classic',
                              studentName: selectedInternship.studentName,
                              studentMatricule: selectedInternship.studentId || selectedInternship.id,
                              specialty: selectedInternship.studentClass || 'Génie Logiciel',
                              promo: 'DQP / CQP - Niveau 3',
                              companyName: selectedInternship.companyName,
                              companySupervisor: selectedInternship.supervisorName,
                              internshipTopic: selectedInternship.tutorAppreciation || 'Mise en œuvre professionnelle en entreprise',
                              issueDate: new Date().toLocaleDateString('fr-FR'),
                              issueCity: 'Douala',
                              directorName: 'Dr. TCHAPGNIN Gédéon',
                              status: 'Délivrée'
                            });
                            setIsAttestationModalOpen(true);
                          }}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Afficher / Imprimer l&apos;Attestation (5 Modèles)
                          <Printer className="w-4 h-4" />
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleCloseInternshipDirect(selectedInternship.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 rounded-xl cursor-pointer"
                          >
                            Clôturer le stage
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleOpenEdit(selectedInternship)}
                            className="flex-1 text-slate-700 border-slate-300 hover:bg-slate-50 text-xs py-2 rounded-xl cursor-pointer"
                          >
                            Modifier
                          </Button>
                        </div>
                      )}
                    </div>

                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-slate-200 rounded-3xl bg-slate-50/50 p-6 text-center text-slate-400 text-xs">
                  Sélectionnez une ligne dans le tableau pour consulter l'intégralité du dossier d'affectation et les documents de stage.
                </Card>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
