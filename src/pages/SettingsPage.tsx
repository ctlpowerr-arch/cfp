import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Plus, 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Settings as SettingsIcon, 
  Database, 
  RefreshCw, 
  Layers,
  Camera,
  Upload,
  Sparkles,
  X,
  User,
  Mail,
  GraduationCap,
  BookOpen,
  MapPin,
  Building2,
  Phone,
  Globe,
  FileText,
  Image as ImageIcon,
  Download,
  Server,
  ExternalLink,
  Check,
  RotateCcw,
  Lock,
  KeyRound,
  Trash2,
  ArrowRight,
  CreditCard,
  Briefcase,
  Award,
  DollarSign,
  Activity,
  History,
  Info,
  Edit3,
  Stamp
} from 'lucide-react';
import { useAcademicYear, AcademicYear } from '../context/AcademicYearContext';
import { ModernSelect } from '@/components/ui/select';
import { useBranding } from '../context/BrandingContext';
import { useAuth } from '../context/AuthContext';
import AppLogo from '@/components/AppLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import EmailJsSettingsCard from '@/components/EmailJsSettingsCard';
import ActivityLogsManager from '@/components/ActivityLogsManager';

// Preset emblems if admin wants instant high-definition logos
const PRESET_EMBLEMS = [
  {
    id: 'default',
    title: 'Blason Prestige ITMC',
    subtitle: 'Blason héraldique officiel',
    url: '/logo.jpg'
  },
  {
    id: 'tech',
    title: 'Emblème Tech & Systèmes',
    subtitle: 'Style digital & data',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=250&auto=format&fit=crop&q=80'
  },
  {
    id: 'academy',
    title: 'Sceau Académique & Lauriers',
    subtitle: 'Certification & Diplômes',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=250&auto=format&fit=crop&q=80'
  }
];

export default function SettingsPage() {
  const location = useLocation();
  const { user: authUser } = useAuth();
  const context = useOutletContext<{ teacher?: any }>() || {};
  const activeTeacher = context.teacher;
  // Strictly only show teacher portal mode when actually inside /teacher/settings
  const isTeacherRoute = location.pathname.startsWith('/teacher');
  const [forceAdminMode, setForceAdminMode] = useState(false);
  const isTeacher = isTeacherRoute && !forceAdminMode;

  const getAuthToken = () =>
    sessionStorage.getItem('ITMC_PORTAL_SESSION_TOKEN') ||
    sessionStorage.getItem('ITMC_PORTAL_ENCRYPTED_SESSION') ||
    localStorage.getItem('ITMC_PORTAL_SESSION_TOKEN') ||
    localStorage.getItem('ITMC_PORTAL_ENCRYPTED_SESSION') ||
    localStorage.getItem('token');

  // Academic Year Context
  const { 
    selectedYear, 
    setSelectedYear, 
    years, 
    refreshYears, 
    addAcademicYear, 
    updateAcademicYear, 
    deleteAcademicYear,
    rolloverAcademicYear 
  } = useAcademicYear();

  // Navigation tab state
  const [adminActiveTab, setAdminActiveTab] = useState<'branding' | 'sessions' | 'logs' | 'security' | 'database' | 'emailjs'>('branding');

  // Branding Context & Form
  const { branding, updateBranding, updateLogo, resetLogo } = useBranding();
  const [previewLogo, setPreviewLogo] = useState<string>('');
  const [logoInputUrl, setLogoInputUrl] = useState<string>('');
  const [isSavingLogo, setIsSavingLogo] = useState<boolean>(false);
  const [isSavingBranding, setIsSavingBranding] = useState<boolean>(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const watermarkFileInputRef = useRef<HTMLInputElement>(null);
  const stampFileInputRef = useRef<HTMLInputElement>(null);
  const signatureFileInputRef = useRef<HTMLInputElement>(null);
  const restoreBackupInputRef = useRef<HTMLInputElement>(null);

  const [institutionForm, setInstitutionForm] = useState({
    institutionName: branding.institutionName || 'CFP-ITMC',
    institutionFullName: branding.institutionFullName || "Centre de Formation Professionnelle aux Métiers des Technologies de l'Information et du Management au Cameroun",
    acronym: branding.acronym || 'CFP-ITMC',
    motto: branding.motto || "L'Excellence Technologique et Managériale au Service de l'Emploi",
    directorName: branding.directorName || "Dr. TCHAPGNIN Gédéon",
    directorTitle: branding.directorTitle || "Directeur des Études",
    authorizationNumber: branding.authorizationNumber || "Arrêté N° 0038/MINEFOP/SG/DFOP/SDGS/SACD",
    postalBox: branding.postalBox || "BP 1248 Douala",
    city: branding.city || 'Douala - Logpom',
    neighborhood: branding.neighborhood || 'Logpom (Carrefour Bassong)',
    country: branding.country || 'Cameroun',
    domain: branding.domain || 'cfp-itmc.com',
    website: branding.website || 'https://cfp-itmc.com',
    phone: branding.phone || '683 66 32 22 / 688 05 20 94',
    email: branding.email || 'info@cfp.itmc.com',
    secondaryEmail: branding.secondaryEmail || 'cfp.itmc@gmail.com',
    orangeMoneyNumber: branding.orangeMoneyNumber || '688 05 20 94',
    mtnMoneyNumber: branding.mtnMoneyNumber || '683 66 32 22',
    bankAccount: branding.bankAccount || 'UBA Cameroun • 04018-00001-XXXXXXXXXX',
    officialStampUrl: branding.officialStampUrl || '',
    directorSignatureUrl: branding.directorSignatureUrl || '',
    watermarkUrl: branding.watermarkUrl || '/watermark-logo.png',
    currency: branding.currency || 'FCFA'
  });

  useEffect(() => {
    setInstitutionForm({
      institutionName: branding.institutionName || 'CFP-ITMC',
      institutionFullName: branding.institutionFullName || "Centre de Formation Professionnelle aux Métiers des Technologies de l'Information et du Management au Cameroun",
      acronym: branding.acronym || 'CFP-ITMC',
      motto: branding.motto || "L'Excellence Technologique et Managériale au Service de l'Emploi",
      directorName: branding.directorName || "Dr. TCHAPGNIN Gédéon",
      directorTitle: branding.directorTitle || "Directeur des Études",
      authorizationNumber: branding.authorizationNumber || "Arrêté N° 0038/MINEFOP/SG/DFOP/SDGS/SACD",
      postalBox: branding.postalBox || "BP 1248 Douala",
      city: branding.city || 'Douala - Logpom',
      neighborhood: branding.neighborhood || 'Logpom (Carrefour Bassong)',
      country: branding.country || 'Cameroun',
      domain: branding.domain || 'cfp-itmc.com',
      website: branding.website || 'https://cfp-itmc.com',
      phone: branding.phone || '683 66 32 22 / 688 05 20 94',
      email: branding.email || 'info@cfp.itmc.com',
      secondaryEmail: branding.secondaryEmail || 'cfp.itmc@gmail.com',
      orangeMoneyNumber: branding.orangeMoneyNumber || '688 05 20 94',
      mtnMoneyNumber: branding.mtnMoneyNumber || '683 66 32 22',
      bankAccount: branding.bankAccount || 'UBA Cameroun • 04018-00001-XXXXXXXXXX',
      officialStampUrl: branding.officialStampUrl || '',
      directorSignatureUrl: branding.directorSignatureUrl || '',
      watermarkUrl: branding.watermarkUrl || '/watermark-logo.png',
      currency: branding.currency || 'FCFA'
    });
    if (branding.logoUrl) {
      setPreviewLogo(branding.logoUrl);
      setLogoInputUrl(branding.logoUrl);
    }
  }, [branding]);

  // Academic Year State
  const [newYearForm, setNewYearForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'Planifiée',
    isCurrent: false,
    description: ''
  });
  const [isSubmittingYear, setIsSubmittingYear] = useState(false);
  const [loadingYearAction, setLoadingYearAction] = useState<string | null>(null);

  // Edit Academic Year Modal State
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [editYearForm, setEditYearForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'En Cours',
    description: ''
  });
  const [isSavingEditYear, setIsSavingEditYear] = useState(false);

  // Rollover Modal State
  const [showRolloverModal, setShowRolloverModal] = useState(false);
  const [rolloverSourceYear, setRolloverSourceYear] = useState<AcademicYear | null>(null);
  const [rolloverTargetName, setRolloverTargetName] = useState('');
  const [rolloverPromoteStudents, setRolloverPromoteStudents] = useState(true);
  const [isExecutingRollover, setIsExecutingRollover] = useState(false);

  // Super Admin Account Profile & Security State
  const [adminProfileForm, setAdminProfileForm] = useState({
    name: branding.directorName || authUser?.name || 'Dr. TCHAPGNIN Gédéon',
    email: authUser?.email || 'admin@itmc-it.cm',
    phone: branding.phone || '683 66 32 22 / 688 05 20 94',
    functionTitle: branding.directorTitle || 'Directeur des Études'
  });
  const [isSavingAdminProfile, setIsSavingAdminProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Hostinger Database Status & Restore
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isLoadingDbStatus, setIsLoadingDbStatus] = useState<boolean>(false);
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

  // Teacher Profile State (when on /teacher/settings)
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    department: '',
    bio: ''
  });
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);

  useEffect(() => {
    if (activeTeacher) {
      setTeacherForm({
        name: activeTeacher.name || '',
        email: activeTeacher.email || '',
        phone: activeTeacher.phone || '+237 688 05 20 94',
        specialty: activeTeacher.specialty || 'Ingénierie & Technologies',
        department: activeTeacher.department || 'Département Informatique & Réseaux',
        bio: activeTeacher.bio || 'Formateur certifié au CFP-ITMC Douala Logpom.'
      });
    }
  }, [activeTeacher]);

  const fetchAdminAccount = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/account', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.account) {
          setAdminProfileForm({
            name: data.account.name || branding.directorName || 'Directeur Pédagogique & Super Admin',
            email: data.account.email || 'admin@itmc-it.cm',
            phone: data.account.phone || branding.phone || '683 66 32 22 / 688 05 20 94',
            functionTitle: data.account.functionTitle || branding.directorTitle || 'Directeur du Centre & Super Admin'
          });
        }
      }
    } catch (err) {
      console.error("Error fetching admin account:", err);
    }
  };

  const fetchDbStatus = async () => {
    setIsLoadingDbStatus(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/database/status', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (err) {
      console.error("Error fetching database status:", err);
    } finally {
      setIsLoadingDbStatus(false);
    }
  };

  const fetchSecurityLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/security/logs', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setSecurityLogs(Array.isArray(data) ? data.slice(0, 15) : []);
      }
    } catch (err) {
      console.error("Error fetching security logs:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (!isTeacher) {
      fetchAdminAccount();
      fetchDbStatus();
      fetchSecurityLogs();
    }
  }, [isTeacher]);

  // Handle Logo Upload via File
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner un fichier image valide (PNG, SVG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image est trop volumineuse. Taille maximale : 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPreviewLogo(dataUrl);
        setLogoInputUrl('');
        toast.info("Aperçu du logo chargé. Cliquez sur 'Enregistrer & Appliquer Partout' pour déployer.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLogo = async () => {
    const targetUrl = previewLogo || logoInputUrl;
    if (!targetUrl) {
      toast.error("Veuillez téléverser une image ou saisir une URL de logo.");
      return;
    }

    setIsSavingLogo(true);
    const success = await updateLogo(targetUrl);
    setIsSavingLogo(false);

    if (success) {
      toast.success("Logo de l'institut mis à jour avec succès ! Il est maintenant diffusé sur tous les portails et documents.");
      fetchSecurityLogs();
    }
  };

  const handleResetToCrest = async () => {
    if (!window.confirm("Voulez-vous rétablir le blason vectoriel officiel d'origine du CFP-ITMC ?")) return;

    setIsSavingLogo(true);
    const success = await resetLogo();
    setIsSavingLogo(false);

    if (success) {
      setPreviewLogo('');
      setLogoInputUrl('');
      toast.success("Blason vectoriel d'origine réinitialisé avec succès !");
      fetchSecurityLogs();
    }
  };

  const handleSelectPresetLogo = (presetUrl: string, presetName: string) => {
    setPreviewLogo(presetUrl);
    setLogoInputUrl(presetUrl);
    toast.info(`Modèle sélectionné : ${presetName}. Cliquez sur 'Enregistrer & Appliquer' pour confirmer.`);
  };

  // Handle Official Stamp, Director Signature & Watermark Upload
  const handleWatermarkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner un fichier image valide pour le filigrane.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setInstitutionForm((prev) => ({ ...prev, watermarkUrl: dataUrl }));
        toast.info("Filigrane chargé ! Cliquez sur 'Enregistrer Toutes les Coordonnées' pour appliquer sur tous les documents.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStampFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image valide pour le cachet officiel.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setInstitutionForm((prev) => ({ ...prev, officialStampUrl: dataUrl }));
        toast.info("Cachet officiel chargé. Cliquez sur 'Enregistrer Toutes les Coordonnées' pour sauvegarder.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image valide pour la signature.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setInstitutionForm((prev) => ({ ...prev, directorSignatureUrl: dataUrl }));
        toast.info("Signature de la Direction chargée. Cliquez sur 'Enregistrer Toutes les Coordonnées' pour sauvegarder.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Institution Form
  const handleSaveInstitutionInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBranding(true);
    const success = await updateBranding(institutionForm);
    setIsSavingBranding(false);

    if (success) {
      toast.success("Coordonnées, cachet, téléphone et identité de l'institut mis à jour avec succès !");
      fetchSecurityLogs();
    }
  };

  // Academic Year Handlers
  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearForm.name.trim()) {
      toast.error("Le nom de l'année scolaire est obligatoire (ex: 2027-2028).");
      return;
    }

    setIsSubmittingYear(true);
    const success = await addAcademicYear({
      name: newYearForm.name.trim(),
      startDate: newYearForm.startDate,
      endDate: newYearForm.endDate,
      status: newYearForm.status,
      isCurrent: newYearForm.isCurrent,
      description: newYearForm.description
    });
    setIsSubmittingYear(false);

    if (success) {
      toast.success(`Année académique ${newYearForm.name} créée avec succès !`);
      setNewYearForm({
        name: '',
        startDate: '',
        endDate: '',
        status: 'Planifiée',
        isCurrent: false,
        description: ''
      });
      fetchSecurityLogs();
    } else {
      toast.error("Erreur lors de la création de l'année académique. Vérifiez qu'elle n'existe pas déjà.");
    }
  };

  const openEditYearModal = (year: AcademicYear) => {
    setEditingYear(year);
    setEditYearForm({
      name: year.name || '',
      startDate: year.startDate || '',
      endDate: year.endDate || '',
      status: year.status || 'En Cours',
      description: year.description || ''
    });
  };

  const handleSaveEditYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingYear || !editYearForm.name.trim()) return;
    setIsSavingEditYear(true);
    const success = await updateAcademicYear(editingYear.id, {
      name: editYearForm.name.trim(),
      startDate: editYearForm.startDate,
      endDate: editYearForm.endDate,
      status: editYearForm.status,
      description: editYearForm.description
    });
    setIsSavingEditYear(false);
    if (success) {
      toast.success(`Session académique ${editYearForm.name} modifiée avec succès !`);
      setEditingYear(null);
      fetchSecurityLogs();
    } else {
      toast.error("Impossible de mettre à jour cette session académique.");
    }
  };

  const handleUpdateStatus = async (year: AcademicYear, newStatus: string) => {
    setLoadingYearAction(year.id);
    const success = await updateAcademicYear(year.id, { status: newStatus });
    setLoadingYearAction(null);
    if (success) {
      toast.success(`Statut de ${year.name} mis à jour : ${newStatus}`);
      fetchSecurityLogs();
    } else {
      toast.error("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleSetActiveYear = async (year: AcademicYear) => {
    setLoadingYearAction(year.id + '-active');
    const success = await updateAcademicYear(year.id, { isCurrent: true, status: 'En Cours' });
    setLoadingYearAction(null);
    if (success) {
      setSelectedYear(year.name);
      toast.success(`L'année ${year.name} est maintenant l'année académique active officielle du centre.`);
      fetchSecurityLogs();
    } else {
      toast.error("Impossible de basculer l'année active.");
    }
  };

  const handleDeleteYear = async (year: AcademicYear) => {
    if (year.isCurrent) {
      toast.error("Impossible de supprimer l'année académique active.");
      return;
    }
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'année ${year.name} ? Cette action est irréversible.`)) {
      return;
    }
    setLoadingYearAction(year.id + '-delete');
    const success = await deleteAcademicYear(year.id);
    setLoadingYearAction(null);
    if (success) {
      toast.success(`Année académique ${year.name} supprimée avec succès.`);
      fetchSecurityLogs();
    } else {
      toast.error("Erreur lors de la suppression de l'année.");
    }
  };

  const openRolloverModal = (year: AcademicYear) => {
    setRolloverSourceYear(year);
    const parts = year.name.split('-');
    if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      setRolloverTargetName(`${Number(parts[0]) + 1}-${Number(parts[1]) + 1}`);
    } else {
      setRolloverTargetName('');
    }
    setShowRolloverModal(true);
  };

  const handleExecuteRollover = async () => {
    if (!rolloverSourceYear || !rolloverTargetName.trim()) {
      toast.error("Veuillez spécifier l'année scolaire cible.");
      return;
    }

    setIsExecutingRollover(true);
    const success = await rolloverAcademicYear(rolloverSourceYear.id, {
      targetYearName: rolloverTargetName.trim(),
      autoPromoteG1ToG2: rolloverPromoteStudents
    });
    setIsExecutingRollover(false);

    if (success) {
      setShowRolloverModal(false);
      toast.success(`Bascule réussie ! La session ${rolloverSourceYear.name} a été clôturée et ${rolloverTargetName.trim()} est active.`);
      fetchSecurityLogs();
      fetchDbStatus();
    } else {
      toast.error("Erreur lors de la procédure de clôture et bascule annuelle.");
    }
  };

  // Save Super Admin Profile Information
  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAdminProfile(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(adminProfileForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Profil Super Admin enregistré avec succès !");
        await updateBranding({
          directorName: adminProfileForm.name,
          directorTitle: adminProfileForm.functionTitle
        });
        fetchSecurityLogs();
      } else {
        toast.error(data.error || "Erreur lors de la sauvegarde du profil.");
      }
    } catch {
      toast.error("Erreur réseau lors de la sauvegarde du profil.");
    } finally {
      setIsSavingAdminProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Mot de passe administrateur modifié avec succès !");
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        fetchSecurityLogs();
      } else {
        toast.error(data.error || "Erreur lors de la modification du mot de passe.");
      }
    } catch {
      toast.error("Erreur réseau lors de la mise à jour du mot de passe.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Download Full Backup JSON via authenticated fetch
  const handleDownloadFullBackup = async () => {
    setIsDownloadingBackup(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/database/backup-full', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `sauvegarde_globale_cfp_itmc_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Sauvegarde globale JSON téléchargée avec succès !");
    } catch {
      toast.error("Échec du téléchargement de la sauvegarde.");
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  const handleDownloadSqlSchema = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/database/schema-export', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error("SQL export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'schema_hostinger_cfp_itmc.sql';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Téléchargement du schéma MySQL Hostinger terminé.");
    } catch {
      toast.error("Impossible de télécharger le schéma SQL.");
    }
  };

  const handleRestoreBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm("Voulez-vous restaurer cette sauvegarde JSON ? Les données actuelles seront mises à jour avec celles de l'archive.")) {
      e.target.value = '';
      return;
    }
    setIsRestoringBackup(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const token = getAuthToken();
      const res = await fetch('/api/admin/database/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Base de données restaurée avec succès !");
        refreshYears();
        fetchDbStatus();
        fetchSecurityLogs();
      } else {
        toast.error(data.error || "Erreur lors de la restauration.");
      }
    } catch {
      toast.error("Fichier JSON de sauvegarde invalide ou corrompu.");
    } finally {
      setIsRestoringBackup(false);
      e.target.value = '';
    }
  };

  const handleSaveTeacherProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTeacher(true);
    try {
      if (activeTeacher?.id) {
        const token = getAuthToken();
        await fetch(`/api/teachers/${encodeURIComponent(activeTeacher.id)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(teacherForm)
        });
        const updated = { ...activeTeacher, ...teacherForm };
        localStorage.setItem('teacherData', JSON.stringify(updated));
      }
      toast.success("Votre profil formateur et vos coordonnées ont été enregistrés avec succès !");
    } catch {
      toast.error("Erreur lors de la mise à jour du profil formateur.");
    } finally {
      setIsSavingTeacher(false);
    }
  };

  // ---------------- RENDERING TEACHER PORTAL SETTINGS ----------------
  if (isTeacher) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-4">
            <AppLogo size="lg" variant="compact" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Paramètres Pédagogiques &amp; Profil Formateur
              </h1>
              <p className="text-slate-300 font-medium text-xs sm:text-sm mt-1">
                {branding.institutionFullName} • Session Active : <strong>{selectedYear}</strong>
              </p>
            </div>
          </div>
          <Button
            onClick={() => setForceAdminMode(true)}
            className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-4 h-11 shrink-0 cursor-pointer"
          >
            <Shield className="w-4 h-4 mr-2" />
            Ouvrir Paramètres Super Admin
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7 rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 bg-white dark:bg-slate-900 space-y-5">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Mes Coordonnées d'Enseignant
            </h2>
            <form onSubmit={handleSaveTeacherProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">Nom Complet</label>
                  <Input
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">Email Professionnel</label>
                  <Input
                    type="email"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">Téléphone Direct</label>
                  <Input
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">Spécialité / Filière</label>
                  <Input
                    value={teacherForm.specialty}
                    onChange={(e) => setTeacherForm({ ...teacherForm, specialty: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSavingTeacher}
                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                {isSavingTeacher ? "Enregistrement..." : "Enregistrer mes Coordonnées"}
              </Button>
            </form>
          </Card>

          <Card className="lg:col-span-5 rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 bg-white dark:bg-slate-900 space-y-5">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Session Académique de Travail
            </h2>
            <p className="text-xs text-slate-500">
              Basculez entre les sessions académiques pour consulter ou saisir les notes et émargements correspondants.
            </p>
            <div className="space-y-2.5">
              {years.map((y) => (
                <button
                  key={y.id}
                  type="button"
                  onClick={() => {
                    setSelectedYear(y.name);
                    toast.success(`Session basculée sur ${y.name}`);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedYear === y.name
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-sm font-black text-slate-900 dark:text-white block">{y.name}</span>
                    <span className="text-[11px] text-slate-500">{y.status || 'En Cours'}</span>
                  </div>
                  {selectedYear === y.name && (
                    <Badge className="bg-emerald-600 text-white border-none text-[10px]">Connectée</Badge>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ---------------- RENDERING ADMINISTRATOR PORTAL SETTINGS ----------------
  return (
    <div className="space-y-6 sm:space-y-8 p-3 sm:p-6 max-w-7xl mx-auto">
      
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-blue-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 bg-blue-500/20 text-blue-400 border border-blue-400/30 rounded-2xl shrink-0 shadow-lg">
            <SettingsIcon className="w-8 h-8 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Paramètres &amp; Identité de l'Établissement
              </h1>
              <Badge className="bg-blue-600 text-white font-black text-[10px] px-2.5 py-0.5 border-none uppercase tracking-wider">
                Super Admin
              </Badge>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1 max-w-2xl">
              {branding.institutionName} • {branding.city} ({branding.neighborhood}) • Année Active : <strong>{selectedYear}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-slate-300 uppercase block tracking-wider">Session Active</span>
              <span className="text-xs font-black text-emerald-300">{selectedYear}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto custom-scrollbar border border-slate-200/60 dark:border-slate-700/60">
        <button
          onClick={() => setAdminActiveTab('branding')}
          className={`px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            adminActiveTab === 'branding'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md scale-100'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Établissement &amp; Identité</span>
        </button>

        <button
          onClick={() => setAdminActiveTab('sessions')}
          className={`px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            adminActiveTab === 'sessions'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md scale-100'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Années Scolaires &amp; Sessions ERP</span>
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-[9px] px-1.5 py-0 h-4 border-none">
            {years.length}
          </Badge>
        </button>

        <button
          onClick={() => setAdminActiveTab('logs')}
          className={`px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            adminActiveTab === 'logs'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md scale-100'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 text-indigo-600" />
          <span>Journal d'Activités &amp; Logs</span>
          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-black text-[9px] px-1.5 py-0 h-4 border-none">
            PDF &amp; Audit
          </Badge>
        </button>

        <button
          onClick={() => setAdminActiveTab('security')}
          className={`px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            adminActiveTab === 'security'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md scale-100'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 text-purple-600" />
          <span>Compte Super Admin &amp; Sécurité</span>
        </button>

        <button
          onClick={() => setAdminActiveTab('database')}
          className={`px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            adminActiveTab === 'database'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-md scale-100'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 text-amber-600" />
          <span>Sauvegardes &amp; Hostinger MySQL</span>
        </button>

        <button
          onClick={() => setAdminActiveTab('emailjs')}
          className={`px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            adminActiveTab === 'emailjs'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-md scale-100'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4 text-rose-600" />
          <span>Notifications EmailJS</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: IDENTITÉ & ÉTABLISSEMENT */}
      {/* ========================================================================= */}
      {adminActiveTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Logo Management Stage */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-2xl">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Logo &amp; Armoiries du Centre</h2>
                    <p className="text-xs text-slate-400">Diffusion instantanée sur toute l'application</p>
                  </div>
                </div>
                <Badge className={branding.logoUrl ? "bg-emerald-500 text-white font-bold text-xs border-none" : "bg-blue-600 text-white font-bold text-xs border-none"}>
                  {branding.logoUrl ? "Logo Actif" : "Blason Par Défaut"}
                </Badge>
              </div>

              {/* Real-time Multi-Mode Preview Box */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Aperçus en direct</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                    Synchronisé
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase mb-2">Barre de Navigation</span>
                    <AppLogo size="md" variant="compact" overrideLogoUrl={previewLogo || branding.logoUrl} />
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase mb-2">Relevés &amp; Diplômes</span>
                    <AppLogo size="md" variant="seal" overrideLogoUrl={previewLogo || branding.logoUrl} />
                  </div>
                </div>
              </div>

              {/* Preset Emblem Gallery */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block">
                  Galerie d'Armoiries Prêtes à l'Emploi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_EMBLEMS.map((emblem) => (
                    <button
                      key={emblem.id}
                      type="button"
                      onClick={() => handleSelectPresetLogo(emblem.url, emblem.title)}
                      className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-center transition-all cursor-pointer group"
                    >
                      <div className="w-10 h-10 mx-auto rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1.5 border group-hover:scale-105 transition-transform">
                        <img src={emblem.url} alt={emblem.title} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">{emblem.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                    Option 1 : Téléverser votre Fichier Logo (PNG, SVG, JPG, WebP)
                  </label>
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    onChange={handleLogoFileUpload}
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-dashed border-2 border-blue-300 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-bold text-xs text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    Parcourir les fichiers de mon appareil...
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                    Option 2 : Lien URL Web Direct
                  </label>
                  <Input
                    type="url"
                    placeholder="https://votre-site.com/mon-logo.png"
                    value={logoInputUrl}
                    onChange={(e) => {
                      setLogoInputUrl(e.target.value);
                      setPreviewLogo(e.target.value);
                    }}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={handleApplyLogo}
                    disabled={isSavingLogo}
                    className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 cursor-pointer transition-all"
                  >
                    {isSavingLogo ? "Déploiement..." : "Enregistrer & Appliquer Partout"}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleResetToCrest}
                    disabled={isSavingLogo || !branding.logoUrl}
                    variant="outline"
                    className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Rétablir Blason
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Institutional Information Form */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Informations Officielles de l'Établissement</h2>
                  <p className="text-xs text-slate-400">Coordonnées, agrément ministériel et finances pour reçus</p>
                </div>
              </div>

              <form onSubmit={handleSaveInstitutionInfo} className="space-y-5">
                {/* 1. Identification */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider block">
                    1. Identification &amp; Dénomination
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Nom du Centre</label>
                      <Input
                        type="text"
                        required
                        value={institutionForm.institutionName}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, institutionName: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Sigle / Acronyme</label>
                      <Input
                        type="text"
                        required
                        value={institutionForm.acronym}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, acronym: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Intitulé Officiel Complet</label>
                    <Input
                      type="text"
                      required
                      value={institutionForm.institutionFullName}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, institutionFullName: e.target.value })}
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Devise / Slogan Officiel</label>
                    <Input
                      type="text"
                      value={institutionForm.motto}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, motto: e.target.value })}
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                    />
                  </div>
                </div>

                {/* 2. Direction & Agrément */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider block">
                    2. Direction &amp; Agrément Ministériel
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Nom du Responsable / Directeur</label>
                      <Input
                        type="text"
                        value={institutionForm.directorName}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, directorName: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Titre Fonctionnel</label>
                      <Input
                        type="text"
                        value={institutionForm.directorTitle}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, directorTitle: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">N° d'Agrément / Arrêté Ministériel</label>
                    <Input
                      type="text"
                      value={institutionForm.authorizationNumber}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, authorizationNumber: e.target.value })}
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                    />
                  </div>
                </div>

                {/* 3. Localisation & Contacts */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">
                    3. Localisation &amp; Coordonnées
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Ville du Campus</label>
                      <Input
                        type="text"
                        required
                        value={institutionForm.city}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, city: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Quartier &amp; Repère</label>
                      <Input
                        type="text"
                        required
                        value={institutionForm.neighborhood}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, neighborhood: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Boîte Postale</label>
                      <Input
                        type="text"
                        value={institutionForm.postalBox}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, postalBox: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                        Numéros de Téléphone (Standard)
                      </label>
                      <Input
                        type="text"
                        required
                        value={institutionForm.phone}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, phone: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Email Officiel Principal</label>
                      <Input
                        type="email"
                        required
                        value={institutionForm.email}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, email: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Nom de Domaine Web</label>
                      <Input
                        type="text"
                        required
                        value={institutionForm.domain}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, domain: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Site Web URL</label>
                      <Input
                        type="url"
                        required
                        value={institutionForm.website}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, website: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Coordonnées de Paiement pour Reçus */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider block">
                    4. Canaux de Paiement de la Scolarité (Imprimés sur Reçus)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Numéro Orange Money</label>
                      <Input
                        type="text"
                        value={institutionForm.orangeMoneyNumber}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, orangeMoneyNumber: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-orange-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Numéro MTN Mobile Money</label>
                      <Input
                        type="text"
                        value={institutionForm.mtnMoneyNumber}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, mtnMoneyNumber: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-yellow-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Coordonnées Bancaires / RIB</label>
                    <Input
                      type="text"
                      value={institutionForm.bankAccount}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, bankAccount: e.target.value })}
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                    />
                  </div>
                </div>

                {/* 5. Cachet Officiel & Signature Direction */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider block">
                    5. Cachet Officiel &amp; Signature Direction (Documents PDF)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Cachet Officiel */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Cachet / Tampon Officiel</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Apposé sur les reçus, attestations et bulletins PDF.</p>
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                          {institutionForm.officialStampUrl ? (
                            <img src={institutionForm.officialStampUrl} alt="Cachet" className="w-full h-full object-contain p-1" />
                          ) : (
                            <Shield className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <input
                          type="file"
                          ref={stampFileInputRef}
                          onChange={handleStampFileUpload}
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => stampFileInputRef.current?.click()}
                          className="flex-1 h-9 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          Importer Cachet
                        </Button>
                        {institutionForm.officialStampUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setInstitutionForm(prev => ({ ...prev, officialStampUrl: '' }))}
                            className="h-9 w-9 p-0 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Supprimer le cachet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Signature Direction */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Signature de la Direction</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">PNG transparent recommandé pour les actes officiels.</p>
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                          {institutionForm.directorSignatureUrl ? (
                            <img src={institutionForm.directorSignatureUrl} alt="Signature" className="w-full h-full object-contain p-1" />
                          ) : (
                            <FileText className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <input
                          type="file"
                          ref={signatureFileInputRef}
                          onChange={handleSignatureFileUpload}
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => signatureFileInputRef.current?.click()}
                          className="flex-1 h-9 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          Importer Signature
                        </Button>
                        {institutionForm.directorSignatureUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setInstitutionForm(prev => ({ ...prev, directorSignatureUrl: '' }))}
                            className="h-9 w-9 p-0 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Supprimer la signature"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Filigrane Officiel des Documents (Watermark) */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider block">
                      6. Filigrane Officiel d'Arrière-Plan (Bulletins, Reçus, Planning, Listes)
                    </span>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px] border-none">
                      Sécurité Visuelle
                    </Badge>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Image du Filigrane Institutionnel</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Ce filigrane s'affiche en grand format en arrière-plan transparent de tous les bulletins de notes, reçus de scolarité, fiches d'émargement, certificats de scolarité et plannings de cours.
                        </p>
                      </div>
                      <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {institutionForm.watermarkUrl ? (
                          <img src={institutionForm.watermarkUrl} alt="Filigrane" className="w-full h-full object-contain p-1 opacity-80" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <input
                        type="file"
                        ref={watermarkFileInputRef}
                        onChange={handleWatermarkFileUpload}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => watermarkFileInputRef.current?.click()}
                        className="flex-1 h-9 rounded-xl text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        Importer Nouveau Filigrane
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInstitutionForm(prev => ({ ...prev, watermarkUrl: '/watermark-logo.png' }));
                          toast.info("Filigrane officiel CFP-ITMC rétabli. Enregistrez pour confirmer.");
                        }}
                        className="h-9 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        Rétablir Filigrane Officiel
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSavingBranding}
                  className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer mt-4"
                >
                  {isSavingBranding ? "Enregistrement en cours..." : "Enregistrer Toutes les Coordonnées"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GESTION DES ANNÉES SCOLAIRES (SUPER ROBUSTE ERP) */}
      {/* ========================================================================= */}
      {adminActiveTab === 'sessions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Column: Academic Years List & Operations */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Sessions &amp; Années Académiques ERP</h2>
                    <p className="text-xs text-slate-400">Cloisonnement strict des notes, compositions et scolarités</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={refreshYears}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Actualiser
                  </Button>
                </div>
              </div>

              {/* Sessions List Cards */}
              <div className="space-y-4">
                {years.map((year) => {
                  const isSelected = year.name === selectedYear;
                  const isCurrentInDb = year.isCurrent;
                  const stats = year.statistics || {};

                  return (
                    <div 
                      key={year.id} 
                      className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-4 ${
                        isSelected 
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-800 shadow-md ring-2 ring-emerald-500/20' 
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 shadow-md ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}>
                            <Calendar className="w-6 h-6" />
                          </div>
                          
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{year.name}</h3>
                              
                              {isSelected && (
                                <Badge className="bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider border-none">
                                  Session Active Connectée
                                </Badge>
                              )}
                              
                              {isCurrentInDb && !isSelected && (
                                <Badge className="bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider border-none">
                                  Active par Défaut
                                </Badge>
                              )}

                              <Badge className={`font-bold text-[10px] border-none ${
                                year.status === 'En Cours' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                year.status === 'Clôturée' ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {year.status || 'Planifiée'}
                              </Badge>
                            </div>

                            <p className="text-xs text-slate-500 font-medium">
                              {year.startDate ? `Rentrée : ${year.startDate}` : 'Date de début non fixée'} • {year.endDate ? `Clôture : ${year.endDate}` : 'Fin de session flexible'}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Status & Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end">
                          {!isSelected && (
                            <Button
                              size="sm"
                              onClick={() => handleSetActiveYear(year)}
                              disabled={loadingYearAction === year.id + '-active'}
                              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm shadow-emerald-600/20"
                            >
                              {loadingYearAction === year.id + '-active' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Définir Active"}
                            </Button>
                          )}

                          <ModernSelect
                            dropdownTitle={`Statut de l'année ${year.name}`}
                            value={year.status || 'Planifiée'}
                            onChange={(e) => handleUpdateStatus(year, e.target.value)}
                            disabled={loadingYearAction === year.id}
                            className="h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                          >
                            <option value="En Cours">🟢 En Cours</option>
                            <option value="Planifiée">🗓️ Planifiée</option>
                            <option value="Clôturée">🔒 Clôturée</option>
                          </ModernSelect>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditYearModal(year)}
                            className="h-10 px-3 rounded-xl border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Modifier les dates, le nom ou la description de cette session"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1" />
                            Modifier
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRolloverModal(year)}
                            className="h-10 px-3 rounded-xl border-slate-200 dark:border-slate-700 font-bold text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer"
                            title="Clôturer et passer à l'année suivante"
                          >
                            <ArrowRight className="w-3.5 h-3.5 mr-1" />
                            Bascule
                          </Button>

                          {!year.isCurrent && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteYear(year)}
                              disabled={loadingYearAction === year.id + '-delete'}
                              className="h-10 w-10 p-0 rounded-xl border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                              title="Supprimer cette année scolaire"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Live ERP Metrics for this Year */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Étudiants Inscrits</span>
                          <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                            {stats.studentsCount ?? 0}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Compositions / Notes</span>
                          <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                            {stats.compositionsCount ?? 0}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Scolarité Perçue</span>
                          <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">
                            {(stats.caisseTotal ?? 0).toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column: Create New Academic Year Form */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Créer une Année Scolaire</h2>
                  <p className="text-xs text-slate-400">Ouverture d'une nouvelle session académique</p>
                </div>
              </div>

              <form onSubmit={handleCreateYear} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                    Nom / Code de la Session
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="ex: 2027-2028"
                    value={newYearForm.name}
                    onChange={(e) => setNewYearForm({ ...newYearForm, name: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                  />
                  <span className="text-[10px] text-slate-400">Format conventionnel recommandé : YYYY-YYYY</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Date de Rentrée</label>
                    <Input
                      type="date"
                      value={newYearForm.startDate}
                      onChange={(e) => setNewYearForm({ ...newYearForm, startDate: e.target.value })}
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Date de Clôture</label>
                    <Input
                      type="date"
                      value={newYearForm.endDate}
                      onChange={(e) => setNewYearForm({ ...newYearForm, endDate: e.target.value })}
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Statut Initial</label>
                  <ModernSelect
                    value={newYearForm.status}
                    onChange={(e) => setNewYearForm({ ...newYearForm, status: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="Planifiée">🗓️ Planifiée (Préparation)</option>
                    <option value="En Cours">🟢 En Cours (Active)</option>
                    <option value="Clôturée">🔒 Clôturée (Archivée)</option>
                  </ModernSelect>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Notes / Descriptif</label>
                  <Input
                    type="text"
                    placeholder="ex: Rentrée solennelle Douala Logpom"
                    value={newYearForm.description}
                    onChange={(e) => setNewYearForm({ ...newYearForm, description: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isCurrentNewYear"
                    checked={newYearForm.isCurrent}
                    onChange={(e) => setNewYearForm({ ...newYearForm, isCurrent: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="isCurrentNewYear" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Définir immédiatement comme session active
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingYear}
                  className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer mt-2"
                >
                  {isSubmittingYear ? "Création..." : "Enregistrer la Session"}
                </Button>
              </form>
            </Card>

            {/* Architecture Protection Banner */}
            <div className="p-6 bg-slate-900 text-white rounded-[2.5rem] shadow-xl space-y-3 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black">Cloisonnement &amp; Sécurité ERP</h3>
                  <p className="text-[11px] text-slate-400">Architecture multi-tenant académique</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Chaque requête API transmet automatiquement le header <code>x-academic-year</code>. Les notes, relevés de scolarité, emplois du temps et rapports d'intervention sont étanches par année.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2.5: CENTRE DE TRAÇABILITÉ & JOURNAL D'ACTIVITÉS (LOGS PAR CATÉGORIE) */}
      {/* ========================================================================= */}
      {adminActiveTab === 'logs' && (
        <ActivityLogsManager />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMPTE SUPER ADMIN & SÉCURITÉ */}
      {/* ========================================================================= */}
      {adminActiveTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Admin Credentials Form */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-2xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Sécurité du Compte Super Admin</h2>
                  <p className="text-xs text-slate-400">Mise à jour du mot de passe et habilitations</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-black text-purple-900 dark:text-purple-300">Profil Administrateur Root</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Ce compte dispose d'un accès sans restriction à l'ensemble des modules, à la configuration de marque, aux relevés et à la gestion de la caisse.
                </p>
              </div>

              {/* Formulaire 1 : Profil Super Admin sans mot de passe requis */}
              <form onSubmit={handleSaveAdminProfile} className="space-y-4">
                <span className="text-[11px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider block">
                  1. Identité &amp; Coordonnées du Super Administrateur
                </span>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Nom Complet de l'Administrateur *</label>
                    <Input
                      type="text"
                      required
                      placeholder="Ex: M. le Directeur Général"
                      value={adminProfileForm.name}
                      onChange={(e) => setAdminProfileForm({ ...adminProfileForm, name: e.target.value })}
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Fonction / Titre Officiel</label>
                    <Input
                      type="text"
                      placeholder="Directeur Général / Super Admin"
                      value={adminProfileForm.functionTitle}
                      onChange={(e) => setAdminProfileForm({ ...adminProfileForm, functionTitle: e.target.value })}
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Email Administrateur *</label>
                      <Input
                        type="email"
                        required
                        placeholder="direction@itmc.cm"
                        value={adminProfileForm.email}
                        onChange={(e) => setAdminProfileForm({ ...adminProfileForm, email: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Téléphone Direct</label>
                      <Input
                        type="text"
                        placeholder="+237 696 80 30 74"
                        value={adminProfileForm.phone}
                        onChange={(e) => setAdminProfileForm({ ...adminProfileForm, phone: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  {isChangingPassword ? "Enregistrement..." : "Enregistrer le Profil Super Admin"}
                </Button>
              </form>

              {/* Formulaire 2 : Changement de Mot de Passe */}
              <form onSubmit={handleChangePassword} className="space-y-4 pt-5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-wider block">
                  2. Changement du Mot de Passe Maître
                </span>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Mot de passe actuel</label>
                  <Input
                    type="password"
                    placeholder="Saisissez votre mot de passe actuel"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Nouveau mot de passe</label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 caractères"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Confirmer le nouveau mot de passe</label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Confirmez le nouveau mot de passe"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 cursor-pointer mt-2"
                >
                  {isChangingPassword ? "Modification..." : "Mettre à Jour Mon Mot de Passe"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Audit Trail & Security Logs */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-2xl">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Journal d'Audit &amp; Traçabilité</h2>
                    <p className="text-xs text-slate-400">Dernières opérations d'administration enregistrées</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setAdminActiveTab('logs')}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 mr-1.5" />
                    Centre Complet &amp; Export PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchSecurityLogs}
                    className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                {securityLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-medium">
                    Aucun événement de sécurité consigné pour le moment.
                  </div>
                ) : (
                  securityLogs.map((log: any, idx: number) => (
                    <div 
                      key={log.id || idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {log.eventType || log.type || 'ACTION_ADMIN'}
                          </span>
                          <Badge className={`text-[9px] font-black border-none px-1.5 py-0 h-4 ${
                            log.severity === 'HIGH' ? 'bg-rose-500 text-white' :
                            log.severity === 'MEDIUM' ? 'bg-amber-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {log.severity || 'INFO'}
                          </Badge>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                          {log.details}
                        </p>
                      </div>

                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('fr-FR') : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SAUVEGARDES & BASE DE DONNÉES HOSTINGER */}
      {/* ========================================================================= */}
      {adminActiveTab === 'database' && (
        <div className="space-y-6 sm:space-y-8">
          <div className="p-6 sm:p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl border border-slate-800 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black">Gestion des Données &amp; Sauvegardes Complètes</h2>
                  <p className="text-xs text-slate-400">
                    Exportation intégrale pour sécurité et déploiement MySQL Hostinger
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleDownloadFullBackup}
                  disabled={isDownloadingBackup}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
                >
                  <Download className="w-4 h-4" />
                  {isDownloadingBackup ? "Export..." : "Télécharger Sauvegarde Globale JSON"}
                </Button>

                <Button
                  onClick={handleDownloadSqlSchema}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Download className="w-4 h-4" />
                  Télécharger schema_hostinger.sql
                </Button>

                <input
                  type="file"
                  ref={restoreBackupInputRef}
                  onChange={handleRestoreBackupFile}
                  accept=".json,application/json"
                  className="hidden"
                />
                <Button
                  type="button"
                  disabled={isRestoringBackup}
                  onClick={() => restoreBackupInputRef.current?.click()}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  {isRestoringBackup ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isRestoringBackup ? "Restauration..." : "Restaurer une Sauvegarde (.JSON)"}
                </Button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Apprenants Enregistrés</span>
                <p className="text-2xl font-black text-white mt-1">
                  {dbStatus?.statistics?.studentsCount ?? 39}
                </p>
                <span className="text-[10px] text-emerald-400 font-bold">39 Spécialités DQP</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formateurs Actifs</span>
                <p className="text-2xl font-black text-white mt-1">
                  {dbStatus?.statistics?.teachersCount ?? 5}
                </p>
                <span className="text-[10px] text-blue-400 font-bold">Corps Enseignant</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classes &amp; Filières</span>
                <p className="text-2xl font-black text-white mt-1">
                  {dbStatus?.statistics?.classesCount ?? 12}
                </p>
                <span className="text-[10px] text-indigo-400 font-bold">G1 &amp; G2</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Traçabilité &amp; Logs</span>
                <p className="text-2xl font-black text-white mt-1">
                  {dbStatus?.statistics?.securityLogsCount ?? 14}
                </p>
                <span className="text-[10px] text-amber-400 font-bold">Événements Certifiés</span>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4">
              <h3 className="font-black text-sm text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4" /> Procédure de Sauvegarde et Migration Hostinger
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>
                  <strong>Sauvegarde locale :</strong> Téléchargez régulièrement la sauvegarde globale JSON (bouton bleu ci-dessus) pour conserver un instantané complet de votre établissement.
                </li>
                <li>
                  <strong>Export MySQL :</strong> Utilisez le bouton vert pour exporter le schéma SQL officiel <code>schema_hostinger.sql</code> optimisé pour MySQL 8.0 / MariaDB 10.6.
                </li>
                <li>
                  <strong>Import phpMyAdmin :</strong> Dans votre compte Hostinger, ouvrez phpMyAdmin et importez directement le fichier SQL généré.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: NOTIFICATIONS EMAILJS */}
      {/* ========================================================================= */}
      {adminActiveTab === 'emailjs' && (
        <EmailJsSettingsCard />
      )}

      {/* ========================================================================= */}
      {/* MODAL: MODIFIER UNE ANNÉE SCOLAIRE EXISTANTE */}
      {/* ========================================================================= */}
      {!!editingYear && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-2xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Modifier l'Année Scolaire</h3>
                  <p className="text-xs text-slate-400">Ajustez le libellé, les dates ou la note de session</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingYear(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditYear} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                  Libellé de l'Année Scolaire (YYYY-YYYY) *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="ex: 2026-2027"
                  value={editYearForm.name}
                  onChange={(e) => setEditYearForm({ ...editYearForm, name: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Date de Rentrée</label>
                  <Input
                    type="date"
                    value={editYearForm.startDate}
                    onChange={(e) => setEditYearForm({ ...editYearForm, startDate: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Date de Clôture</label>
                  <Input
                    type="date"
                    value={editYearForm.endDate}
                    onChange={(e) => setEditYearForm({ ...editYearForm, endDate: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Notes / Descriptif</label>
                <Input
                  type="text"
                  placeholder="ex: Session officielle ITMC"
                  value={editYearForm.description}
                  onChange={(e) => setEditYearForm({ ...editYearForm, description: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingYear(null)}
                  className="flex-1 h-11 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingEditYear}
                  className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  {isSavingEditYear ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSISTANT DE CLÔTURE & BASCULE DE SESSION (ROLL-OVER ERP) */}
      {/* ========================================================================= */}
      {showRolloverModal && rolloverSourceYear && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-2xl">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Clôture &amp; Bascule Annuelle</h3>
                  <p className="text-xs text-slate-400">Passage de session ERP</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRolloverModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-black">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Attention : Opération de scellement annuel</span>
              </div>
              <p>
                La session source <strong>{rolloverSourceYear.name}</strong> sera marquée comme <strong>🔒 Clôturée</strong>. Toutes les notes et scolarités de cette session seront verrouillées en lecture seule.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                  Nom de la Nouvelle Session Active
                </label>
                <Input
                  type="text"
                  required
                  placeholder="ex: 2027-2028"
                  value={rolloverTargetName}
                  onChange={(e) => setRolloverTargetName(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                />
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="promoteStudentsCheck"
                  checked={rolloverPromoteStudents}
                  onChange={(e) => setRolloverPromoteStudents(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer mt-0.5"
                />
                <label htmlFor="promoteStudentsCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer leading-tight">
                  Promouvoir automatiquement les étudiants de première année (G1 vers G2) pour cette nouvelle session
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowRolloverModal(false)}
                className="flex-1 h-11 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                Annuler
              </Button>
              <Button
                onClick={handleExecuteRollover}
                disabled={isExecutingRollover}
                className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/20"
              >
                {isExecutingRollover ? "Bascule en cours..." : "Confirmer la Bascule"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
