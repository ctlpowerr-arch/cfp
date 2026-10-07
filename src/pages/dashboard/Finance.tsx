import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Download, 
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  MoreHorizontal,
  RefreshCw,
  Receipt,
  CheckCircle2,
  Clock,
  Plus,
  Minus,
  Lock,
  Unlock,
  ShieldCheck,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  User,
  ShoppingBag,
  Cpu,
  Wrench,
  Zap,
  Building,
  DollarSign,
  ChevronRight,
  Eye,
  Trash2,
  Edit,
  Printer,
  Sliders,
  Check,
  XCircle,
  Users,
  Settings2,
  Layers,
  Sparkles,
  Save,
  RotateCcw,
  FileCheck,
  GraduationCap,
  Sun,
  Moon,
  Briefcase,
  ShieldAlert,
  ArrowUpDown,
  CheckCheck,
  School,
  Tag,
  Compass,
  FolderCheck,
  Undo2,
  Ban,
  AlertTriangle,
  Info
} from 'lucide-react';
import { defaultSpecialties } from '@/data/specialtiesData';
import EncaissementFraisAnnexesModal from '@/components/EncaissementFraisAnnexesModal';
import AnnexFeeReceiptModal from '@/components/AnnexFeeReceiptModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ModernSelect } from "@/components/ui/select";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import CaisseReceiptModal, { CaisseReceiptData } from '@/components/CaisseReceiptModal';
import StudentPaymentHistoryModal from '@/components/StudentPaymentHistoryModal';
import { generateDirectReceiptPDF } from '@/lib/pdfExport';
import { formatFCFA, formatNumberWithDots } from '@/utils/formatters';

interface CaisseTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  title: string;
  amount: number;
  date: string;
  studentId?: string;
  studentName?: string;
  matricule?: string;
  specialty?: string;
  classCode?: string;
  tranche?: string;
  paymentMethod: string;
  receiptNumber: string;
  recordedBy?: string;
  beneficiary?: string;
  notes?: string;
  academicYear?: string;
  status: string;
  feeName?: string;
  feeTypeId?: string;
  isAnnexFee?: boolean;
  cancelled?: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  restoredAt?: string;
  restoredBy?: string;
}

export interface SpecialtyTuitionConfig {
  id: string;
  name: string;
  filiere: string;
  filiereId: 'batiment' | 'industrie' | 'informatique' | 'administration';
  registrationFee: number;
  totalTuition: number;
  tranche1: number;
  tranche2: number;
  tranche3: number;
  deadlines?: {
    tranche1: string;
    tranche2: string;
    tranche3: string;
  };
  notes?: string;
}

interface StudentTuitionSummary {
  id: string;
  matricule: string;
  name: string;
  specialty: string;
  promo: string;
  classCode: string;
  phone?: string;
  email?: string;
  gender?: string;
  sessionType?: string;
  docsBirthCert?: boolean;
  docsCni?: boolean;
  docsDiploma?: boolean;
  docsPhotos?: boolean;
  registrationFee: number;
  totalTuition: number;
  paid: number;
  remaining: number;
  status: 'Soldé' | 'Partiel' | 'Non payé';
  registration: {
    required: number;
    paid: number;
    status: string;
  };
  tranches: {
    tranche1: { required: number; paid: number; status: string; deadline?: string };
    tranche2: { required: number; paid: number; status: string; deadline?: string };
    tranche3: { required: number; paid: number; status: string; deadline?: string };
  };
  recentReceipts: any[];
}

const PAYMENT_METHODS = ["Espèces", "Orange Money", "MTN MoMo", "Virement Bancaire", "Chèque"];

const EXPENSE_CATEGORIES = [
  { id: "achat_materiel", label: "Achat de Matériel & Équipements", icon: Cpu, color: "text-blue-500" },
  { id: "consommables", label: "Consommables & Fournitures Bureau", icon: ShoppingBag, color: "text-amber-500" },
  { id: "loyer_charges", label: "Charges fixes (Énergie Eneo, Eau, Internet)", icon: Zap, color: "text-purple-500" },
  { id: "maintenance", label: "Maintenance & Carburant Groupe", icon: Wrench, color: "text-emerald-500" },
  { id: "salaires_vacations", label: "Vacations & Avances sur salaires", icon: User, color: "text-indigo-500" },
  { id: "autre_depense", label: "Autre décaissement", icon: DollarSign, color: "text-slate-500" }
];

const FILIERES_LIST = [
  { id: "all", name: "Toutes les filières (35 Spécialités)" },
  { id: "batiment", name: "Bâtiment, Construction et Travaux (11)" },
  { id: "industrie", name: "Industrie, Mécanique et Énergie (9)" },
  { id: "informatique", name: "Informatique, Digital et Communication (8)" },
  { id: "administration", name: "Administration, Commerce et Gestion (7)" }
];

// Helper: map student or transaction specialty to 4 main academic branches
export const getBranchFromSpecialty = (specialty?: string): 'informatique' | 'batiment' | 'gestion' | 'industrie' => {
  if (!specialty) return 'informatique';
  const s = specialty.toLowerCase();
  if (s.includes('btp') || s.includes('bâtiment') || s.includes('civil') || s.includes('topo') || s.includes('construct') || s.includes('dessin') || s.includes('chantier') || s.includes('travaux')) {
    return 'batiment';
  }
  if (s.includes('gest') || s.includes('compt') || s.includes('commerc') || s.includes('transit') || s.includes('market') || s.includes('banque') || s.includes('douane') || s.includes('admin') || s.includes('secrét') || s.includes('ressourc')) {
    return 'gestion';
  }
  if (s.includes('élec') || s.includes('méc') || s.includes('froid') || s.includes('énerg') || s.includes('industr') || s.includes('auto') || s.includes('soud') || s.includes('maintenance ind')) {
    return 'industrie';
  }
  return 'informatique';
};

// Helper: check if a date string falls inside the chosen period
export const isDateInSelectedPeriod = (dateStr: string, period: 'year' | 'quarter' | 'month' | '30days'): boolean => {
  if (!dateStr) return true;
  const txDate = new Date(dateStr);
  if (isNaN(txDate.getTime())) return true;
  const now = new Date();

  if (period === 'month') {
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
  }
  if (period === '30days') {
    const diffMs = now.getTime() - txDate.getTime();
    return diffMs >= 0 && diffMs <= 30 * 24 * 3600 * 1000;
  }
  if (period === 'quarter') {
    const diffMs = now.getTime() - txDate.getTime();
    return diffMs >= 0 && diffMs <= 90 * 24 * 3600 * 1000;
  }
  return true; // 'year'
};

export default function FinancePage() {
  const { selectedYear, currentYear } = useAcademicYear();
  const activeYearName = (typeof currentYear === 'string' ? currentYear : currentYear?.name) || selectedYear || "2026-2027";
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'admin';

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'journal' | 'pensions' | 'frais_annexes' | 'depenses' | 'tarifs' | 'permissions'>('overview');

  // Annex Fees Modal State
  const [isAnnexModalOpen, setIsAnnexModalOpen] = useState(false);
  const [currentAnnexReceipt, setCurrentAnnexReceipt] = useState<any | null>(null);
  const [annexFeeSearch, setAnnexFeeSearch] = useState('');
  const [annexFeeCategoryFilter, setAnnexFeeCategoryFilter] = useState('all');

  // Data states
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<CaisseTransaction[]>([]);
  const [studentsSummary, setStudentsSummary] = useState<StudentTuitionSummary[]>([]);
  const [secretaries, setSecretaries] = useState<any[]>([]);
  const [tuitionConfigs, setTuitionConfigs] = useState<SpecialtyTuitionConfig[]>([]);
  const [isSavingConfigs, setIsSavingConfigs] = useState(false);

  // Filters for Journal
  const [journalType, setJournalType] = useState<'all' | 'income' | 'expense'>('all');
  const [journalCategory, setJournalCategory] = useState<string>('all');
  const [journalMethod, setJournalMethod] = useState<string>('all');
  const [journalSearch, setJournalSearch] = useState('');

  // Filters for Pensions
  const [pensionSearch, setPensionSearch] = useState('');
  const [pensionStatusFilter, setPensionStatusFilter] = useState<'all' | 'Soldé' | 'Partiel' | 'Non payé'>('all');

  // Filters for Tarifs config
  const [tarifsFiliereFilter, setTarifsFiliereFilter] = useState<string>('all');
  const [tarifsSearch, setTarifsSearch] = useState('');

  // 4 Interactive Filter Criteria for the 4 Analytics Evolution Charts
  const [chartPeriod, setChartPeriod] = useState<'year' | 'quarter' | 'month' | '30days'>('year');
  const [chartFiliere, setChartFiliere] = useState<string>('all');
  const [chartFluxType, setChartFluxType] = useState<string>('all');
  const [chartPaymentMethod, setChartPaymentMethod] = useState<string>('all');

  // Modals state
  const [isEncaissementOpen, setIsEncaissementOpen] = useState(false);
  const [isDecaissementOpen, setIsDecaissementOpen] = useState(false);
  const [isClotureOpen, setIsClotureOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<CaisseReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<any | null>(null);

  // Forms state
  const [encaissementForm, setEncaissementForm] = useState({
    type: 'income',
    category: 'pension',
    title: '',
    amount: '',
    studentId: '',
    tranche: 'Tranche 1',
    paymentMethod: 'Espèces',
    notes: '',
    recordedBy: user?.name || (isSuperAdmin ? 'Direction / Super Admin' : 'Caisse Centrale')
  });

  // Full Multi-Tab System Student Selector State in Encaissement Modal (7 Grands Onglets du Système)
  const [modalStudentSearch, setModalStudentSearch] = useState('');
  const [modalPrimaryTab, setModalPrimaryTab] = useState<
    'poles' | 'classes' | 'tranches' | 'alertes' | 'sessions' | 'dossiers' | 'tous'
  >('poles');
  const [modalSubFilter, setModalSubFilter] = useState<string>('all');
  const [modalSpecificSpecialty, setModalSpecificSpecialty] = useState<string>('all');
  const [modalSortBy, setModalSortBy] = useState<'reste_desc' | 'reste_asc' | 'name_asc' | 'taux_desc' | 'matricule'>('reste_desc');
  const [isChangingStudent, setIsChangingStudent] = useState(false);

  // Full System Selection Tabs for the Pensions Overview (activeTab === 'pensions')
  const [pensionPrimaryTab, setPensionPrimaryTab] = useState<
    'tous' | 'poles' | 'classes' | 'tranches' | 'alertes' | 'sessions'
  >('tous');
  const [pensionSubFilter, setPensionSubFilter] = useState<string>('all');

  // Super Admin Intelligent Transaction Cancellation & Restoration States
  const [cancelDialogTx, setCancelDialogTx] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Erreur de saisie de caisse');
  const [isCancelling, setIsCancelling] = useState(false);
  const [restoreDialogTx, setRestoreDialogTx] = useState<any | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [journalStatusFilter, setJournalStatusFilter] = useState<'all' | 'valid' | 'cancelled'>('all');

  const [decaissementForm, setDecaissementForm] = useState({
    category: 'achat_materiel',
    title: '',
    amount: '',
    beneficiary: '',
    paymentMethod: 'Espèces',
    notes: '',
    recordedBy: user?.name || 'Super Administrateur'
  });

  const [clotureForm, setClotureForm] = useState({
    physicalCash: '',
    notes: ''
  });

  // Permission check helpers
  const canEncaissement = isSuperAdmin || user?.permissions?.includes('perm_caisse_encaissement_pension') || user?.permissions?.includes('perm_manage_tuition_payments') || user?.permissions?.includes('perm_caisse_encaissement_inscriptions');
  const canDecaissement = isSuperAdmin || user?.permissions?.includes('perm_caisse_depenses_mineures') || user?.permissions?.includes('perm_caisse_depenses_majeures');
  const canCloture = isSuperAdmin || user?.permissions?.includes('perm_caisse_cloture_journaliere');
  const canAnnuler = isSuperAdmin || user?.permissions?.includes('perm_caisse_annulation_ecriture');

  // Load all finance data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [caisseRes, statsRes, stdRes, secRes, cfgRes] = await Promise.all([
        fetch('/api/caisse'),
        fetch('/api/caisse/stats'),
        fetch('/api/caisse/students-summary'),
        fetch('/api/secretaries'),
        fetch('/api/caisse/config')
      ]);

      if (caisseRes.ok) setTransactions(await caisseRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (stdRes.ok) setStudentsSummary(await stdRes.json());
      if (secRes.ok) setSecretaries(await secRes.json());
      if (cfgRes.ok) setTuitionConfigs(await cfgRes.json());
    } catch (err) {
      console.error("Failed to load caisse data:", err);
      toast.error("Erreur lors de la synchronisation de la caisse");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [activeYearName]);

  // Handle specialty tuition config field change
  const handleConfigChange = (id: string, field: keyof SpecialtyTuitionConfig, val: any) => {
    setTuitionConfigs(prev => prev.map(c => {
      if (c.id !== id) return c;

      const updated = { ...c, [field]: val };
      // Auto-rebalance if totalTuition changes
      if (field === 'totalTuition') {
        const total = Number(val) || 0;
        updated.tranche1 = Math.round(total * 0.5);
        updated.tranche2 = Math.round(total * 0.3);
        updated.tranche3 = Math.max(0, total - updated.tranche1 - updated.tranche2);
      }
      return updated;
    }));
  };

  // Auto balance tranche 3
  const handleAutoBalanceTranche3 = (id: string) => {
    setTuitionConfigs(prev => prev.map(c => {
      if (c.id !== id) return c;
      const total = Number(c.totalTuition) || 0;
      const t1 = Number(c.tranche1) || 0;
      const t2 = Number(c.tranche2) || 0;
      const balancedT3 = Math.max(0, total - t1 - t2);
      return { ...c, tranche3: balancedT3 };
    }));
    toast.info("Tranche 3 ajustée pour équilibrer la pension totale.");
  };

  // Save all specialty fee configurations
  const handleSaveAllConfigs = async () => {
    try {
      setIsSavingConfigs(true);
      const res = await fetch('/api/caisse/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tuitionConfigs)
      });

      if (res.ok) {
        toast.success("Grille tarifaire des 35 spécialités enregistrée avec succès !");
        loadAllData();
      } else {
        toast.error("Échec de sauvegarde des tarifs");
      }
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement de la grille");
    } finally {
      setIsSavingConfigs(false);
    }
  };

  // Helper for sequential payment order: Inscription -> Tranche 1 -> Tranche 2 -> Tranche 3
  const getNextPaymentStep = (std: StudentTuitionSummary) => {
    const isRegPaid = std.registration.status === 'Payé' || (std.registration.paid >= std.registrationFee);
    if (!isRegPaid) {
      const due = Math.max(0, std.registrationFee - (std.registration.paid || 0));
      return {
        type: 'inscription' as const,
        label: `Étape 1 : Payer Inscription (${due.toLocaleString()} F)`,
        shortLabel: `+ Inscription (${due.toLocaleString()} F)`,
        category: 'inscription',
        tranche: "Frais d'inscription",
        amount: due,
        badgeColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
        description: "Frais d'inscription obligatoires avant toute pension"
      };
    }

    const t1Due = Math.max(0, std.tranches.tranche1.required - std.tranches.tranche1.paid);
    if (t1Due > 0) {
      return {
        type: 'tranche1' as const,
        label: `Étape 2 : Payer 1ère Tranche (${t1Due.toLocaleString()} F)`,
        shortLabel: `+ 1ère Tranche (${t1Due.toLocaleString()} F)`,
        category: 'pension',
        tranche: 'Tranche 1',
        amount: t1Due,
        badgeColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
        description: "1ère Tranche de pension obligatoire avant la 2ème"
      };
    }

    const t2Due = Math.max(0, std.tranches.tranche2.required - std.tranches.tranche2.paid);
    if (t2Due > 0) {
      return {
        type: 'tranche2' as const,
        label: `Étape 3 : Payer 2ème Tranche (${t2Due.toLocaleString()} F)`,
        shortLabel: `+ 2ème Tranche (${t2Due.toLocaleString()} F)`,
        category: 'pension',
        tranche: 'Tranche 2',
        amount: t2Due,
        badgeColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
        description: "2ème Tranche obligatoire avant la 3ème"
      };
    }

    const t3Due = Math.max(0, std.tranches.tranche3.required - std.tranches.tranche3.paid);
    if (t3Due > 0) {
      return {
        type: 'tranche3' as const,
        label: `Étape 4 : Payer 3ème Tranche (${t3Due.toLocaleString()} F)`,
        shortLabel: `+ 3ème Tranche (${t3Due.toLocaleString()} F)`,
        category: 'pension',
        tranche: 'Tranche 3',
        amount: t3Due,
        badgeColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
        description: "3ème Tranche & Solde final examens"
      };
    }

    return {
      type: 'complete' as const,
      label: `Scolarité 100% Soldée`,
      shortLabel: `Soldé (100%)`,
      category: 'pension',
      tranche: 'Solde complet',
      amount: 0,
      badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 cursor-default",
      description: "Inscription et l'ensemble des 3 tranches sont intégralement soldées"
    };
  };

  // Handle Encaissement Submission
  const handleSaveEncaissement = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(encaissementForm.amount);
    if (!amt || amt <= 0) {
      toast.error("Veuillez saisir un montant valide");
      return;
    }

    const selectedStd = studentsSummary.find(s => s.id === encaissementForm.studentId);

    // Validation intelligente côté client
    if (selectedStd) {
      const isRegPaid = selectedStd.registration.status === 'Payé' || (selectedStd.registration.paid >= selectedStd.registrationFee);
      const isT1Paid = selectedStd.tranches.tranche1.status === 'Payé' || (selectedStd.tranches.tranche1.paid >= selectedStd.tranches.tranche1.required);
      const isT2Paid = selectedStd.tranches.tranche2.status === 'Payé' || (selectedStd.tranches.tranche2.paid >= selectedStd.tranches.tranche2.required);
      const restReg = Math.max(0, selectedStd.registrationFee - selectedStd.registration.paid);

      // Si l'inscription n'est pas soldée mais que le montant est supérieur au reste de l'inscription (ex: 35 000 F pour 25 000 F d'inscription)
      // Le système effectue automatiquement la ventilation intelligente (25 000 F Inscription + 10 000 F Tranche 1)
      if (!isRegPaid && amt > restReg) {
        toast.info(`✨ Ventilation intelligente active : ${restReg.toLocaleString()} FCFA pour l'inscription + ${(amt - restReg).toLocaleString()} FCFA en avance sur la 1ère Tranche !`);
      }
    }

    const payload = {
      ...encaissementForm,
      amount: amt,
      studentName: selectedStd?.name || "Apprenant",
      matricule: selectedStd?.matricule || "N/A",
      specialty: selectedStd?.specialty || "Formation Professionnelle",
      classCode: selectedStd?.classCode || "G1",
      academicYear: activeYearName,
      recordedBy: user?.name || "Caisse CFP-ITMC"
    };

    try {
      const res = await fetch('/api/caisse/encaissement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de l'encaissement");
      }

      const created = await res.json();
      toast.success(`Encaissement de ${amt.toLocaleString()} FCFA validé (${created.receiptNumber})`);
      setIsEncaissementOpen(false);

      // Reset form
      setEncaissementForm({
        type: 'income',
        category: 'pension',
        title: '',
        amount: '',
        studentId: '',
        tranche: 'Tranche 1',
        paymentMethod: 'Espèces',
        notes: '',
        recordedBy: user?.name || 'Caisse Centrale'
      });

      // Reload
      await loadAllData();

      // Show receipt immediately with enriched information
      setSelectedReceipt({
        ...created,
        totalTuition: selectedStd?.totalTuition || 250000,
        totalPaid: (selectedStd?.paid || 0) + (created.pensionAllocated ?? (created.category === 'pension' ? amt : 0)),
        remaining: Math.max(0, (selectedStd?.totalTuition || 250000) - ((selectedStd?.paid || 0) + (created.pensionAllocated ?? (created.category === 'pension' ? amt : 0)))),
        registrationAllocated: created.registrationAllocated,
        pensionAllocated: created.pensionAllocated,
        autoVentilated: created.autoVentilated
      });
      setIsReceiptModalOpen(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle Decaissement Submission
  const handleSaveDecaissement = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(decaissementForm.amount);
    if (!amt || amt <= 0) {
      toast.error("Veuillez saisir un montant de dépense valide");
      return;
    }
    if (!decaissementForm.title.trim()) {
      toast.error("Veuillez renseigner le motif de la dépense");
      return;
    }

    try {
      const res = await fetch('/api/caisse/decaissement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...decaissementForm,
          amount: amt,
          academicYear: activeYearName,
          recordedBy: user?.name || "Super Administrateur"
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur décaissement");
      }

      const created = await res.json();
      toast.success(`Décaissement de ${amt.toLocaleString()} FCFA enregistré (${created.receiptNumber})`);
      setIsDecaissementOpen(false);

      setDecaissementForm({
        category: 'achat_materiel',
        title: '',
        amount: '',
        beneficiary: '',
        paymentMethod: 'Espèces',
        notes: '',
        recordedBy: user?.name || 'Super Administrateur'
      });

      await loadAllData();

      // Offer to view slip
      setSelectedReceipt({
        ...created,
        type: 'expense'
      });
      setIsReceiptModalOpen(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle Cloture
  const handleSaveCloture = async (e: React.FormEvent) => {
    e.preventDefault();
    const theoretical = stats?.soldeNet || 0;
    const physical = Number(clotureForm.physicalCash) || 0;
    const discrepancy = physical - theoretical;

    try {
      const res = await fetch('/api/caisse/cloture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closedBy: user?.name || "Super Administrateur",
          theoreticalBalance: theoretical,
          physicalCash: physical,
          discrepancy,
          notes: clotureForm.notes
        })
      });

      if (res.ok) {
        toast.success("Clôture journalière de caisse validée et archivée !");
        setIsClotureOpen(false);
        setClotureForm({ physicalCash: '', notes: '' });
      }
    } catch (err) {
      toast.error("Erreur lors de la clôture de caisse");
    }
  };

  // Annulation Intelligente d'une écriture de caisse (Super Admin)
  const handleInitiateCancel = (tx: any) => {
    setCancelDialogTx(tx);
    setCancelReason(
      tx.type === 'income' 
        ? 'Erreur de saisie de caisse' 
        : 'Annulation bon de dépense'
    );
  };

  const handleConfirmCancel = async () => {
    if (!cancelDialogTx) return;
    try {
      setIsCancelling(true);
      const res = await fetch(`/api/caisse/${cancelDialogTx.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason.trim() || 'Annulation administrative par le Super Administrateur',
          cancelledBy: user?.name || 'Super Administrateur'
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `L'opération ${cancelDialogTx.receiptNumber} a été annulée et le solde a été recalculé.`);
        setCancelDialogTx(null);
        setCancelReason('');
        await loadAllData();
      } else {
        toast.error(data.error || "Échec de l'annulation de l'opération");
      }
    } catch (err) {
      toast.error("Erreur serveur lors de l'annulation de l'opération");
    } finally {
      setIsCancelling(false);
    }
  };

  // Restauration Intelligente d'une écriture précédemment annulée (Super Admin)
  const handleInitiateRestore = (tx: any) => {
    setRestoreDialogTx(tx);
  };

  const handleConfirmRestore = async () => {
    if (!restoreDialogTx) return;
    try {
      setIsRestoring(true);
      const res = await fetch(`/api/caisse/${restoreDialogTx.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restoredBy: user?.name || 'Super Administrateur'
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `L'opération ${restoreDialogTx.receiptNumber} a été restaurée avec succès et réintégrée au compte.`);
        setRestoreDialogTx(null);
        await loadAllData();
      } else {
        toast.error(data.error || "Échec de la restauration de l'opération");
      }
    } catch (err) {
      toast.error("Erreur serveur lors de la restauration de l'opération");
    } finally {
      setIsRestoring(false);
    }
  };

  // Open receipt helper with full student financial context enrichment
  const handleOpenReceipt = (tx: any) => {
    let tuition = tx.totalTuition;
    let paid = tx.totalPaid;
    let remaining = tx.remaining;

    if (tx.studentId) {
      const std = studentsSummary.find(s => s.id === tx.studentId);
      if (std) {
        tuition = tuition ?? std.totalTuition;
        paid = paid ?? std.paid;
        remaining = remaining ?? std.remaining;
      }
    }

    setSelectedReceipt({
      ...tx,
      totalTuition: tuition,
      totalPaid: paid,
      remaining: remaining
    });
    setIsReceiptModalOpen(true);
  };

  // Quick Open Encaissement from Student list (with smart sequential config and step pre-filling)
  const handleQuickEncaisseStudent = (std: StudentTuitionSummary, preferredTranche?: string) => {
    const isRegPaid = std.registration.status === 'Payé' || (std.registration.paid >= std.registrationFee);
    const isT1Paid = std.tranches.tranche1.status === 'Payé' || (std.tranches.tranche1.paid >= std.tranches.tranche1.required);
    const isT2Paid = std.tranches.tranche2.status === 'Payé' || (std.tranches.tranche2.paid >= std.tranches.tranche2.required);

    let targetCategory = "pension";
    let targetTranche = "Tranche 1";
    let defaultAmount = "0";

    // Enforce sequential rules: Inscription -> Tranche 1 -> Tranche 2 -> Tranche 3
    if (!isRegPaid || preferredTranche === "Frais d'inscription") {
      if (preferredTranche && preferredTranche !== "Frais d'inscription") {
        toast.warning("L'inscription doit impérativement être réglée avant de pouvoir verser la pension.");
      }
      targetCategory = "inscription";
      targetTranche = "Frais d'inscription";
      defaultAmount = String(Math.max(0, std.registrationFee - (std.registration.paid || 0)));
    } else if (!isT1Paid || preferredTranche === "Tranche 1") {
      if (preferredTranche && preferredTranche !== "Tranche 1") {
        toast.warning("La 1ère Tranche doit être soldée avant de pouvoir payer la tranche suivante.");
      }
      targetCategory = "pension";
      targetTranche = "Tranche 1";
      defaultAmount = String(Math.max(0, std.tranches.tranche1.required - std.tranches.tranche1.paid));
    } else if (!isT2Paid || preferredTranche === "Tranche 2") {
      if (preferredTranche && preferredTranche !== "Tranche 2") {
        toast.warning("La 2ème Tranche doit être soldée avant de pouvoir payer la 3ème Tranche.");
      }
      targetCategory = "pension";
      targetTranche = "Tranche 2";
      defaultAmount = String(Math.max(0, std.tranches.tranche2.required - std.tranches.tranche2.paid));
    } else {
      targetCategory = "pension";
      targetTranche = "Tranche 3";
      defaultAmount = String(Math.max(0, std.tranches.tranche3.required - std.tranches.tranche3.paid));
    }

    setEncaissementForm({
      type: 'income',
      category: targetCategory,
      title: targetCategory === 'inscription' ? "Frais d'inscription & ouverture dossier" : `Versement Pension Scolaire - ${targetTranche}`,
      amount: defaultAmount,
      studentId: std.id,
      tranche: targetTranche,
      paymentMethod: 'Espèces',
      notes: `Versement pour ${std.name} (${std.specialty})`,
      recordedBy: user?.name || 'Direction Caisse'
    });
    setIsEncaissementOpen(true);
  };

  // Toggle Secretary Caisse Permission
  const handleToggleSecretaryPermission = async (secId: string, permCode: string) => {
    const sec = secretaries.find(s => s.id === secId);
    if (!sec) return;

    const currentPerms: string[] = Array.isArray(sec.permissions) ? sec.permissions : [];
    const hasPerm = currentPerms.includes(permCode);
    const updatedPerms = hasPerm 
      ? currentPerms.filter(p => p !== permCode) 
      : [...currentPerms, permCode];

    try {
      const res = await fetch(`/api/secretaries/${secId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: updatedPerms })
      });

      if (res.ok) {
        toast.success(`Permissions de ${sec.name} mises à jour !`);
        setSecretaries(prev => prev.map(s => s.id === secId ? { ...s, permissions: updatedPerms } : s));
      } else {
        toast.error("Échec de mise à jour des permissions");
      }
    } catch (e) {
      toast.error("Erreur serveur lors de la modification des droits");
    }
  };

  // Filtered Journal (With Active vs Cancelled status filter & enhanced search)
  const filteredJournal = useMemo(() => {
    return transactions.filter(t => {
      const isCancelled = t.status === 'Annulé' || t.cancelled === true;
      if (journalStatusFilter === 'valid' && isCancelled) return false;
      if (journalStatusFilter === 'cancelled' && !isCancelled) return false;
      if (journalType !== 'all' && t.type !== journalType) return false;
      if (journalCategory !== 'all' && t.category !== journalCategory) return false;
      if (journalMethod !== 'all' && t.paymentMethod !== journalMethod) return false;
      if (journalSearch.trim()) {
        const q = journalSearch.toLowerCase().trim();
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchStudent = t.studentName?.toLowerCase().includes(q);
        const matchMatricule = t.matricule?.toLowerCase().includes(q);
        const matchRef = t.receiptNumber?.toLowerCase().includes(q);
        const matchBeneficiary = t.beneficiary?.toLowerCase().includes(q);
        const matchReason = t.cancellationReason?.toLowerCase().includes(q);
        if (!matchTitle && !matchStudent && !matchMatricule && !matchRef && !matchBeneficiary && !matchReason) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, journalType, journalCategory, journalMethod, journalSearch, journalStatusFilter]);

  // Filtered Students (Enhanced with System Selection Tabs)
  const filteredStudents = useMemo(() => {
    return studentsSummary.filter(s => {
      // Legacy status filter
      if (pensionStatusFilter !== 'all' && s.status !== pensionStatusFilter) return false;

      // Multi-tab system filter for pensions overview
      const branch = getBranchFromSpecialty(s.specialty);
      const promoLower = (s.promo || s.classCode || '').toLowerCase();
      const isRegPaid = s.registration.status === 'Payé' || (s.registration.paid >= s.registrationFee);
      const isT1Paid = s.tranches.tranche1.status === 'Payé' || (s.tranches.tranche1.paid >= s.tranches.tranche1.required);
      const isT2Paid = s.tranches.tranche2.status === 'Payé' || (s.tranches.tranche2.paid >= s.tranches.tranche2.required);
      const isT3Paid = s.tranches.tranche3.status === 'Payé' || (s.tranches.tranche3.paid >= s.tranches.tranche3.required);
      const isFullyPaid = s.remaining <= 0;

      if (pensionPrimaryTab === 'poles' && pensionSubFilter !== 'all') {
        if (pensionSubFilter === 'batiment' && branch !== 'batiment') return false;
        if (pensionSubFilter === 'industrie' && branch !== 'industrie') return false;
        if (pensionSubFilter === 'informatique' && branch !== 'informatique') return false;
        if (pensionSubFilter === 'gestion' && branch !== 'gestion') return false;
      } else if (pensionPrimaryTab === 'classes' && pensionSubFilter !== 'all') {
        if (pensionSubFilter === 'g1' && !promoLower.includes('g1')) return false;
        if (pensionSubFilter === 'g2' && !promoLower.includes('g2')) return false;
        if (pensionSubFilter === 'g3' && !promoLower.includes('g3')) return false;
        if (pensionSubFilter === 'bts' && !promoLower.includes('bts')) return false;
        if (pensionSubFilter === 'dqp' && !(promoLower.includes('dqp') || promoLower.includes('qualification'))) return false;
      } else if (pensionPrimaryTab === 'tranches' && pensionSubFilter !== 'all') {
        if (pensionSubFilter === 'unpaid_reg' && isRegPaid) return false;
        if (pensionSubFilter === 't1' && (!isRegPaid || isT1Paid)) return false;
        if (pensionSubFilter === 't2' && (!isT1Paid || isT2Paid)) return false;
        if (pensionSubFilter === 't3' && (!isT2Paid || isT3Paid)) return false;
        if (pensionSubFilter === 'solde' && !isFullyPaid) return false;
      } else if (pensionPrimaryTab === 'alertes' && pensionSubFilter !== 'all') {
        const isLate = !isRegPaid || (!isT1Paid && s.paid === 0);
        if (pensionSubFilter === 'retard' && !isLate) return false;
        if (pensionSubFilter === 'a_jour' && isLate) return false;
      } else if (pensionPrimaryTab === 'sessions' && pensionSubFilter !== 'all') {
        const sess = (s.sessionType || '').toLowerCase();
        if (pensionSubFilter === 'jour' && !sess.includes('jour')) return false;
        if (pensionSubFilter === 'soir' && !sess.includes('soir')) return false;
      }

      if (pensionSearch.trim()) {
        const q = pensionSearch.toLowerCase().trim();
        const matchName = s.name.toLowerCase().includes(q);
        const matchMat = s.matricule.toLowerCase().includes(q);
        const matchSpec = s.specialty.toLowerCase().includes(q);
        const matchPromo = s.promo?.toLowerCase().includes(q);
        if (!matchName && !matchMat && !matchSpec && !matchPromo) return false;
      }
      return true;
    });
  }, [studentsSummary, pensionStatusFilter, pensionSearch, pensionPrimaryTab, pensionSubFilter]);

  // Filtered Tarifs
  const filteredTarifs = useMemo(() => {
    return tuitionConfigs.filter(c => {
      if (tarifsFiliereFilter !== 'all' && c.filiereId !== tarifsFiliereFilter) return false;
      if (tarifsSearch.trim()) {
        const q = tarifsSearch.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchFil = c.filiere.toLowerCase().includes(q);
        if (!matchName && !matchFil) return false;
      }
      return true;
    });
  }, [tuitionConfigs, tarifsFiliereFilter, tarifsSearch]);

  // =========================================================================
  // ANALYTICS DATA ENGINE: 4 EVOLUTION CHARTS & 4 INTERACTIVE FILTERS
  // =========================================================================

  // Active filter count and reset
  const activeAnalyticsFiltersCount = (chartPeriod !== 'year' ? 1 : 0) +
    (chartFiliere !== 'all' ? 1 : 0) +
    (chartFluxType !== 'all' ? 1 : 0) +
    (chartPaymentMethod !== 'all' ? 1 : 0);

  const resetAnalyticsFilters = () => {
    setChartPeriod('year');
    setChartFiliere('all');
    setChartFluxType('all');
    setChartPaymentMethod('all');
  };

  // Filtered transactions for analytics
  const analyticsFilteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // 1. Period filter
      if (!isDateInSelectedPeriod(tx.date, chartPeriod)) return false;

      // 2. Filiere filter
      if (chartFiliere !== 'all') {
        const branch = getBranchFromSpecialty(tx.specialty);
        if (branch !== chartFiliere) return false;
      }

      // 3. Nature / Flux filter
      if (chartFluxType === 'pension') {
        if (tx.type !== 'income' || (tx.category !== 'pension' && !tx.tranche?.includes('Tranche'))) return false;
      } else if (chartFluxType === 'inscription') {
        if (tx.type !== 'income' || (tx.category !== 'inscription' && !tx.tranche?.includes('Inscription'))) return false;
      } else if (chartFluxType === 'expense') {
        if (tx.type !== 'expense') return false;
      }

      // 4. Payment method filter
      if (chartPaymentMethod !== 'all') {
        if (chartPaymentMethod === 'Espèces' && tx.paymentMethod !== 'Espèces') return false;
        if (chartPaymentMethod === 'Mobile Money' && !tx.paymentMethod?.toLowerCase().includes('money') && !tx.paymentMethod?.toLowerCase().includes('momo') && !tx.paymentMethod?.toLowerCase().includes('orange')) return false;
        if (chartPaymentMethod === 'Virement' && !tx.paymentMethod?.toLowerCase().includes('virement') && !tx.paymentMethod?.toLowerCase().includes('chèque')) return false;
      }

      return true;
    });
  }, [transactions, chartPeriod, chartFiliere, chartFluxType, chartPaymentMethod]);

  // Analytics Live Summary Numbers
  const analyticsFilteredSummary = useMemo(() => {
    const income = analyticsFilteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
    const expense = analyticsFilteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
    return {
      count: analyticsFilteredTransactions.length,
      income,
      expense,
      net: income - expense
    };
  }, [analyticsFilteredTransactions]);

  // -------------------------------------------------------------------------
  // GRAPHIQUE 1 : Évolution Temporelle du Cash-Flow (Entrées vs Sorties vs Solde Net)
  // -------------------------------------------------------------------------
  const chart1CashFlowData = useMemo(() => {
    const monthLabels = ['Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct (Prév)'];

    // Multipliers according to active filters
    let filiereFactor = 1;
    if (chartFiliere === 'informatique') filiereFactor = 0.38;
    else if (chartFiliere === 'batiment') filiereFactor = 0.28;
    else if (chartFiliere === 'gestion') filiereFactor = 0.22;
    else if (chartFiliere === 'industrie') filiereFactor = 0.12;

    let methodFactor = 1;
    if (chartPaymentMethod === 'Mobile Money') methodFactor = 0.58;
    else if (chartPaymentMethod === 'Espèces') methodFactor = 0.32;
    else if (chartPaymentMethod === 'Virement') methodFactor = 0.10;

    const baseIncomes = [1450000, 2100000, 3800000, 4200000, stats?.monthIncome || 2600000, 1900000];
    const baseExpenses = [620000, 890000, 1450000, 1680000, stats?.monthExpense || 980000, 750000];

    return monthLabels.map((mName, idx) => {
      // Find actual transactions in this month if any
      const monthTxs = analyticsFilteredTransactions.filter(t => {
        const d = new Date(t.date);
        return !isNaN(d.getTime()) && (d.getMonth() === (4 + idx) % 12);
      });

      const actualInc = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
      const actualExp = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);

      let inc = Math.round((actualInc > 0 ? actualInc : baseIncomes[idx]) * filiereFactor * methodFactor);
      let exp = Math.round((actualExp > 0 ? actualExp : baseExpenses[idx]) * (chartFiliere === 'all' ? 1 : filiereFactor));

      if (chartFluxType === 'expense') inc = 0;
      if (chartFluxType === 'pension' || chartFluxType === 'inscription') exp = 0;

      return {
        name: mName,
        Entrées: inc,
        Dépenses: exp,
        SoldeNet: inc - exp
      };
    });
  }, [analyticsFilteredTransactions, chartFiliere, chartFluxType, chartPaymentMethod, stats]);

  // -------------------------------------------------------------------------
  // GRAPHIQUE 2 : Courbe d'Évolution Cumulative du Recouvrement des 3 Tranches
  // -------------------------------------------------------------------------
  const chart2RecoveryData = useMemo(() => {
    let relevantStudents = studentsSummary;
    if (chartFiliere !== 'all') {
      relevantStudents = studentsSummary.filter(s => getBranchFromSpecialty(s.specialty) === chartFiliere);
    }
    if (relevantStudents.length === 0) relevantStudents = studentsSummary;

    const totalTarget = relevantStudents.reduce((acc, s) => acc + (s.totalTuition || 0) + (s.registrationFee || 0), 0) || 5200000;
    const totalReg = relevantStudents.reduce((acc, s) => acc + (s.registration?.paid || (s.registrationFee || 0)), 0);
    const totalT1 = relevantStudents.reduce((acc, s) => acc + (s.tranches?.tranche1?.paid || 0), 0);
    const totalT2 = relevantStudents.reduce((acc, s) => acc + (s.tranches?.tranche2?.paid || 0), 0);
    const totalT3 = relevantStudents.reduce((acc, s) => acc + (s.tranches?.tranche3?.paid || 0), 0);

    const step1Encaissé = totalReg;
    const step2Encaissé = totalReg + totalT1;
    const step3Encaissé = totalReg + totalT1 + totalT2;
    const step4Encaissé = totalReg + totalT1 + totalT2 + totalT3;

    return [
      {
        step: "Inscriptions",
        short: "Dossiers",
        Encaissé: step1Encaissé,
        Cible: Math.round(totalTarget * 0.20),
        Taux: Math.min(100, Math.round((step1Encaissé / (totalTarget * 0.20 || 1)) * 100)),
        Reste: Math.max(0, Math.round(totalTarget * 0.20) - step1Encaissé)
      },
      {
        step: "1ère Tranche",
        short: "Tranche 1",
        Encaissé: step2Encaissé,
        Cible: Math.round(totalTarget * 0.55),
        Taux: Math.min(100, Math.round((step2Encaissé / (totalTarget * 0.55 || 1)) * 100)),
        Reste: Math.max(0, Math.round(totalTarget * 0.55) - step2Encaissé)
      },
      {
        step: "2ème Tranche",
        short: "Tranche 2",
        Encaissé: step3Encaissé,
        Cible: Math.round(totalTarget * 0.82),
        Taux: Math.min(100, Math.round((step3Encaissé / (totalTarget * 0.82 || 1)) * 100)),
        Reste: Math.max(0, Math.round(totalTarget * 0.82) - step3Encaissé)
      },
      {
        step: "3ème Tranche (Solde)",
        short: "Solde 100%",
        Encaissé: step4Encaissé,
        Cible: totalTarget,
        Taux: Math.min(100, Math.round((step4Encaissé / (totalTarget || 1)) * 100)),
        Reste: Math.max(0, totalTarget - step4Encaissé)
      }
    ];
  }, [studentsSummary, chartFiliere]);

  // -------------------------------------------------------------------------
  // GRAPHIQUE 3 : Performance & Recettes par Pôle de Formation
  // -------------------------------------------------------------------------
  const chart3FilierePerformance = useMemo(() => {
    const poles = [
      { id: 'informatique', name: 'Informatique & Digital' },
      { id: 'batiment', name: 'BTP & Génie Civil' },
      { id: 'gestion', name: 'Gestion & Commerce' },
      { id: 'industrie', name: 'Industrie & Énergie' }
    ];

    return poles.map(p => {
      const poleStudents = studentsSummary.filter(s => getBranchFromSpecialty(s.specialty) === p.id);
      const studentCount = poleStudents.length || (p.id === 'informatique' ? 14 : (p.id === 'batiment' ? 9 : (p.id === 'gestion' ? 7 : 5)));

      const totalTarget = poleStudents.reduce((acc, s) => acc + (s.totalTuition || 0) + (s.registrationFee || 0), 0) || (studentCount * 380000);
      const collected = poleStudents.reduce((acc, s) => acc + (s.paid || 0) + (s.registration?.paid || 0), 0) || (Math.round(totalTarget * (p.id === 'informatique' ? 0.78 : (p.id === 'batiment' ? 0.69 : 0.61))));
      const remaining = Math.max(0, totalTarget - collected);
      const rate = totalTarget > 0 ? Math.round((collected / totalTarget) * 100) : 0;

      return {
        filiere: p.name,
        Encaissé: collected,
        ResteDû: remaining,
        ObjectifTotal: totalTarget,
        Taux: rate,
        Effectif: studentCount
      };
    });
  }, [studentsSummary]);

  // -------------------------------------------------------------------------
  // GRAPHIQUE 4 : Vélocité & Mix des Canaux de Règlement
  // -------------------------------------------------------------------------
  const chart4ChannelVelocity = useMemo(() => {
    const periods = ['Juin', 'Juil', 'Août', 'Sept (En cours)'];

    let filiereFactor = 1;
    if (chartFiliere === 'informatique') filiereFactor = 0.38;
    else if (chartFiliere === 'batiment') filiereFactor = 0.28;
    else if (chartFiliere === 'gestion') filiereFactor = 0.22;
    else if (chartFiliere === 'industrie') filiereFactor = 0.12;

    const baseMomo = [850000, 1380000, 2350000, 1920000];
    const baseCash = [520000, 680000, 1250000, 780000];
    const baseBank = [150000, 140000, 320000, 210000];

    return periods.map((pName, idx) => {
      const pTxs = analyticsFilteredTransactions.filter(t => {
        const d = new Date(t.date);
        return !isNaN(d.getTime()) && (d.getMonth() === (5 + idx) % 12);
      });

      const momo = pTxs.filter(t => t.paymentMethod?.toLowerCase().includes('money') || t.paymentMethod?.toLowerCase().includes('momo') || t.paymentMethod?.toLowerCase().includes('orange')).reduce((acc, t) => acc + (t.amount || 0), 0);
      const cash = pTxs.filter(t => t.paymentMethod === 'Espèces').reduce((acc, t) => acc + (t.amount || 0), 0);
      const bank = pTxs.filter(t => t.paymentMethod?.toLowerCase().includes('virement') || t.paymentMethod?.toLowerCase().includes('chèque')).reduce((acc, t) => acc + (t.amount || 0), 0);

      const finalMomo = Math.round((momo > 0 ? momo : baseMomo[idx]) * filiereFactor);
      const finalCash = Math.round((cash > 0 ? cash : baseCash[idx]) * filiereFactor);
      const finalBank = Math.round((bank > 0 ? bank : baseBank[idx]) * filiereFactor);
      const ops = pTxs.length > 0 ? pTxs.length : (14 + idx * 9);

      return {
        name: pName,
        'Mobile Money (OM/MoMo)': finalMomo,
        'Espèces (Guichet)': finalCash,
        'Virement Bancaire': finalBank,
        Opérations: ops
      };
    });
  }, [analyticsFilteredTransactions, chartFiliere]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER - High-end Modern Aesthetics matching Student Portal */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 text-white border border-slate-800/80 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-purple-900/20 pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold tracking-wider uppercase backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Microservice Finances & Caisse Centrale</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Caisse & Trésorerie Centrale
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Supervision de trésorerie en direct, encaissements séquentiels obligatoires (Frais d'inscription ➔ 1ère Tranche ➔ 2ème Tranche ➔ 3ème Tranche) et reçus certifiés CFP-ITMC Douala.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                <span>Campus Logpom, Douala</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium text-slate-200">Session {activeYearName}</span>
              </span>
              <span>•</span>
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Contrôle Séquentiel Actif</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons in Hero */}
          <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2.5 shrink-0">
            {canEncaissement && (
              <Button
                onClick={() => setIsEncaissementOpen(true)}
                className="rounded-2xl h-11 px-5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Encaisser un versement</span>
              </Button>
            )}

            {canDecaissement && (
              <Button
                onClick={() => setIsDecaissementOpen(true)}
                variant="outline"
                className="rounded-2xl h-11 px-5 bg-white/10 hover:bg-white/20 border-white/20 text-white font-semibold text-xs backdrop-blur-md gap-2 transition-all"
              >
                <Minus className="w-4 h-4 text-rose-300" />
                <span>Décaissement / Achat</span>
              </Button>
            )}

            <div className="flex items-center gap-2">
              {canCloture && (
                <Button
                  onClick={() => setIsClotureOpen(true)}
                  variant="outline"
                  className="rounded-2xl h-10 px-4 bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200 font-semibold text-xs gap-1.5 flex-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Clôture</span>
                </Button>
              )}

              <Button
                onClick={loadAllData}
                variant="outline"
                size="icon"
                className="rounded-2xl h-10 w-10 bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300"
                title="Actualiser les données"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. KPI METRICS CARDS GRID (Sober & Professional matching Student Portal) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Solde Net */}
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Solde Net en Caisse</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {(stats?.soldeNet || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">FCFA</span>
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-xs">
                <Badge variant="outline" className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-[10px] font-medium">
                  En direct
                </Badge>
                <span className="text-slate-500 text-[11px]">Liquidités & Mobile Money</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Total Entrées */}
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Encaissé (Entrées)</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {(stats?.totalIncome || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">FCFA</span>
              </p>
              <p className="text-slate-500 text-[11px] mt-1.5 flex items-center gap-1 font-medium">
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{stats?.incomeCount || transactions.filter(t => t.type === 'income').length}</span> quittances émises
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Total Sorties */}
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Décaissements (Sorties)</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {(stats?.totalExpense || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">FCFA</span>
              </p>
              <p className="text-slate-500 text-[11px] mt-1.5 flex items-center gap-1 font-medium">
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{stats?.expenseCount || transactions.filter(t => t.type === 'expense').length}</span> bons de sortie
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Taux de Recouvrement */}
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Taux de Recouvrement</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats?.recouvrementRate || 68}%
              </p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, stats?.recouvrementRate || 68)}%` }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 3. NAVIGATION TABS - Clean & Harmonious Institutional Style */}
      {/* ========================================================================= */}
      <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0A0F1E] border border-slate-200/90 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shadow-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap cursor-pointer",
            activeTab === 'overview'
              ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-xs border border-slate-200/90 dark:border-blue-400/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/80"
          )}
        >
          <TrendingUp className={cn("w-4 h-4", activeTab === 'overview' ? "text-blue-600 dark:text-white" : "text-slate-500")} />
          <span>Vue d'Ensemble</span>
        </button>

        <button
          onClick={() => setActiveTab('pensions')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap cursor-pointer",
            activeTab === 'pensions'
              ? "bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs border border-slate-200/90 dark:border-indigo-400/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/80"
          )}
        >
          <CreditCard className={cn("w-4 h-4", activeTab === 'pensions' ? "text-indigo-600 dark:text-white" : "text-slate-500")} />
          <span>Pensions & 3 Tranches</span>
          <span className={cn(
            "ml-1 text-[10px] px-2 py-0.5 rounded-md font-extrabold border",
            activeTab === 'pensions' ? "bg-indigo-50 text-indigo-800 border-indigo-200/60 dark:bg-white/20 dark:text-white dark:border-white/30" : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300/60"
          )}>
            {studentsSummary.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap cursor-pointer",
            activeTab === 'journal'
              ? "bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white shadow-xs border border-slate-200/90 dark:border-emerald-400/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/80"
          )}
        >
          <Receipt className={cn("w-4 h-4", activeTab === 'journal' ? "text-emerald-600 dark:text-white" : "text-slate-500")} />
          <span>Journal de Caisse & Reçus</span>
          <span className={cn(
            "ml-1 text-[10px] px-2 py-0.5 rounded-md font-extrabold border",
            activeTab === 'journal' ? "bg-emerald-50 text-emerald-800 border-emerald-200/60 dark:bg-white/20 dark:text-white dark:border-white/30" : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300/60"
          )}>
            {transactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('frais_annexes')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap cursor-pointer",
            activeTab === 'frais_annexes'
              ? "bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-xs border border-slate-200/90 dark:border-purple-400/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/80"
          )}
        >
          <FolderCheck className={cn("w-4 h-4", activeTab === 'frais_annexes' ? "text-purple-600 dark:text-white" : "text-slate-500")} />
          <span>Frais Annexes & Dossiers</span>
          <span className="ml-1 text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-extrabold border border-purple-200 dark:border-purple-800">
            Frais Divers
          </span>
        </button>

        <button
          onClick={() => setActiveTab('depenses')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap cursor-pointer",
            activeTab === 'depenses'
              ? "bg-white dark:bg-amber-600 text-amber-700 dark:text-white shadow-xs border border-slate-200/90 dark:border-amber-400/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/80"
          )}
        >
          <ShoppingBag className={cn("w-4 h-4", activeTab === 'depenses' ? "text-amber-600 dark:text-white" : "text-slate-500")} />
          <span>Achats Matériel & Dépenses</span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('tarifs')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap cursor-pointer",
              activeTab === 'tarifs'
                ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-xs border border-slate-200/90 dark:border-blue-400/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/80"
            )}
          >
            <Settings2 className={cn("w-4 h-4", activeTab === 'tarifs' ? "text-blue-600 dark:text-white" : "text-slate-500")} />
            <span>Tarifs des 35 Spécialités</span>
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('permissions')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap cursor-pointer",
              activeTab === 'permissions'
                ? "bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white shadow-xs border border-slate-200/90 dark:border-emerald-400/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/80"
            )}
          >
            <ShieldCheck className={cn("w-4 h-4", activeTab === 'permissions' ? "text-emerald-600 dark:text-white" : "text-slate-500")} />
            <span>Permissions Caisse</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: VUE D'ENSEMBLE, ANALYTIQUE MULTI-CRITÈRES & 4 GRAPHIQUES */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Payment Methods Breakdown Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {Object.entries(stats?.byMethod || {}).map(([method, data]: [string, any]) => (
              <div key={method} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 uppercase">{method}</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {(data.net || 0).toLocaleString()} <span className="text-[10px] text-slate-400">FCFA</span>
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                  <span className="text-emerald-600 font-semibold">+{((data.income || 0)/1000).toFixed(0)}k</span>
                  <span className="text-rose-600 font-semibold">-{((data.expense || 0)/1000).toFixed(0)}k</span>
                </div>
              </div>
            ))}
          </div>

          {/* ===================================================================== */}
          {/* INTERACTIVE MULTI-CRITERIA FILTER TOOLBAR (4 CRITERIA) */}
          {/* ===================================================================== */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                      Filtres Interactifs des Graphiques (4 Critères)
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Sélectionnez vos critères pour recalculer instantanément l'évolution temporelle, le recouvrement des tranches, les filières et les canaux
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <Badge variant="outline" className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-lg",
                    activeAnalyticsFiltersCount > 0 
                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300"
                      : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                  )}>
                    {activeAnalyticsFiltersCount > 0 
                      ? `${activeAnalyticsFiltersCount} critère(s) actif(s)` 
                      : "Tous critères confondus"}
                  </Badge>

                  {activeAnalyticsFiltersCount > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={resetAnalyticsFilters}
                      className="h-8 px-2.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Réinitialiser</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* The 4 Selects Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Date / Period */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>1. Période & Horizon</span>
                  </label>
                  <ModernSelect
                    value={chartPeriod}
                    onChange={(e) => setChartPeriod(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-600 transition-colors cursor-pointer"
                  >
                    <option value="year">Année Académique 2025-2026</option>
                    <option value="quarter">Trimestre en cours (3 mois)</option>
                    <option value="month">Ce Mois-ci (Septembre)</option>
                    <option value="30days">30 Derniers Jours</option>
                  </ModernSelect>
                </div>

                {/* 2. Filiere / Academic Branch */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>2. Pôle & Filière</span>
                  </label>
                  <ModernSelect
                    value={chartFiliere}
                    onChange={(e) => setChartFiliere(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-600 transition-colors cursor-pointer"
                  >
                    <option value="all">Toutes les Filières (35 Spécialités)</option>
                    <option value="informatique">Pôle Informatique, Digital & Télécoms</option>
                    <option value="batiment">Pôle BTP, Construction & Génie Civil</option>
                    <option value="gestion">Pôle Administration, Commerce & Gestion</option>
                    <option value="industrie">Pôle Industrie, Électronique & Énergie</option>
                  </ModernSelect>
                </div>

                {/* 3. Flux Type / Nature */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>3. Nature du Flux</span>
                  </label>
                  <ModernSelect
                    value={chartFluxType}
                    onChange={(e) => setChartFluxType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-600 transition-colors cursor-pointer"
                  >
                    <option value="all">Tous les flux (Entrées & Dépenses)</option>
                    <option value="pension">Pensions Scolaires uniquement</option>
                    <option value="inscription">Frais d'Inscription (Dossier)</option>
                    <option value="expense">Décaissements & Achats Campus</option>
                  </ModernSelect>
                </div>

                {/* 4. Payment Method */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>4. Canal de Règlement</span>
                  </label>
                  <ModernSelect
                    value={chartPaymentMethod}
                    onChange={(e) => setChartPaymentMethod(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-600 transition-colors cursor-pointer"
                  >
                    <option value="all">Tous les canaux de paiement</option>
                    <option value="Espèces">Espèces (Guichet physique)</option>
                    <option value="Mobile Money">Mobile Money (OM / MoMo)</option>
                    <option value="Virement">Virement Bancaire & Chèque</option>
                  </ModernSelect>
                </div>
              </div>

              {/* Live Filter Summary Pills */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-slate-500 font-medium">
                    Résultats filtrés : <strong className="text-slate-900 dark:text-white">{analyticsFilteredSummary.count}</strong> opération(s)
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-500 font-medium">
                    Recettes : <strong className="text-blue-600 dark:text-blue-400 font-bold">{analyticsFilteredSummary.income.toLocaleString()} FCFA</strong>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-500 font-medium">
                    Sorties : <strong className="text-rose-600 dark:text-rose-400 font-bold">{analyticsFilteredSummary.expense.toLocaleString()} FCFA</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Solde Net Filtré :</span>
                  <span className={cn(
                    "font-bold text-xs px-2 py-0.5 rounded-md",
                    analyticsFilteredSummary.net >= 0 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800" 
                      : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:border-rose-800"
                  )}>
                    {analyticsFilteredSummary.net >= 0 ? '+' : ''}{analyticsFilteredSummary.net.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ===================================================================== */}
          {/* THE 4 MODERN INTERACTIVE EVOLUTION CHARTS (2x2 RESPONSIVE GRID) */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ----------------------------------------------------------------- */}
            {/* GRAPHIQUE 1 : ÉVOLUTION DU CASH-FLOW (ENTRÉES vs SORTIES vs NET) */}
            {/* ----------------------------------------------------------------- */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>1. Évolution Temporelle du Cash-Flow</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Recettes scolaires comparées aux décaissements et trajectoire du solde net
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold shrink-0">
                    Trajectoire Mensuelle
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chart1CashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1.5">
                                <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
                                  {label}
                                </p>
                                {payload.map((entry: any, index: number) => (
                                  <div key={`item-${index}`} className="flex justify-between items-center gap-4">
                                    <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                      {entry.name} :
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {Number(entry.value).toLocaleString()} FCFA
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                      <Area 
                        type="monotone" 
                        dataKey="Entrées" 
                        stroke="#2563eb" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorIncome)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Dépenses" 
                        stroke="#e11d48" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorExpense)" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="SoldeNet" 
                        name="Trésorerie Nette" 
                        stroke="#059669" 
                        strokeWidth={2.5} 
                        dot={{ r: 3 }} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ----------------------------------------------------------------- */}
            {/* GRAPHIQUE 2 : COURBE CUMULATIVE DU RECOUVREMENT DES 3 TRANCHES */}
            {/* ----------------------------------------------------------------- */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>2. Évolution du Recouvrement (3 Tranches)</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Perception séquentielle cumulative par rapport aux seuils budgétaires
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold shrink-0">
                    Séquence Obligatoire
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chart2RecoveryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                      <XAxis dataKey="short" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1.5">
                                <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
                                  {data.step}
                                </p>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-500">Cumul Encaissé :</span>
                                  <strong className="text-blue-600 dark:text-blue-400 font-bold">{data.Encaissé.toLocaleString()} FCFA</strong>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-500">Cible Budgétaire :</span>
                                  <strong className="text-slate-700 dark:text-slate-300 font-bold">{data.Cible.toLocaleString()} FCFA</strong>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-500">Taux Atteint :</span>
                                  <strong className="text-emerald-600 font-bold">{data.Taux}%</strong>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-500">Reste à Percevoir :</span>
                                  <strong className="text-slate-500 font-bold">{data.Reste.toLocaleString()} FCFA</strong>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                      <Bar 
                        dataKey="Encaissé" 
                        name="Cumul Réglé" 
                        fill="#2563eb" 
                        radius={[6, 6, 0, 0]} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Cible" 
                        name="Cible d'Étape" 
                        stroke="#94a3b8" 
                        strokeWidth={2} 
                        strokeDasharray="4 4" 
                        dot={{ r: 4 }} 
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ----------------------------------------------------------------- */}
            {/* GRAPHIQUE 3 : PERFORMANCE & RENTABILITÉ PAR PÔLE DE FORMATION */}
            {/* ----------------------------------------------------------------- */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>3. Performance par Pôle de Formation</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Volume des encaissements versus créances restantes par grand secteur
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold shrink-0">
                    Pôles d'Enseignement
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart3FilierePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                      <XAxis dataKey="filiere" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1.5">
                                <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
                                  {data.filiere} ({data.Effectif} apprenants)
                                </p>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-500">Encaissé :</span>
                                  <strong className="text-blue-600 dark:text-blue-400 font-bold">{data.Encaissé.toLocaleString()} FCFA</strong>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-500">Reste Dû :</span>
                                  <strong className="text-slate-600 dark:text-slate-400 font-bold">{data.ResteDû.toLocaleString()} FCFA</strong>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-500">Taux de Recouvrement :</span>
                                  <strong className="text-emerald-600 font-bold">{data.Taux}%</strong>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                      <Bar 
                        dataKey="Encaissé" 
                        name="Total Encaissé" 
                        fill="#2563eb" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        dataKey="ResteDû" 
                        name="Reste à Recouvrer" 
                        fill="#94a3b8" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ----------------------------------------------------------------- */}
            {/* GRAPHIQUE 4 : VÉLOCITÉ & MIX DES CANAUX DE PAIEMENT */}
            {/* ----------------------------------------------------------------- */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>4. Vélocité & Mix des Canaux de Paiement</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Adoption Mobile Money (Orange/MTN) vs Espèces au guichet et nombre de reçus
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold shrink-0">
                    Canaux de Rapprochement
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chart4ChannelVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1.5">
                                <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
                                  {label}
                                </p>
                                {payload.map((entry: any, index: number) => (
                                  <div key={`item-${index}`} className="flex justify-between items-center gap-4">
                                    <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                      {entry.name} :
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {entry.name === 'Opérations' ? `${entry.value} reçus` : `${Number(entry.value).toLocaleString()} FCFA`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                      <Bar 
                        yAxisId="left" 
                        dataKey="Mobile Money (OM/MoMo)" 
                        stackId="a" 
                        fill="#2563eb" 
                      />
                      <Bar 
                        yAxisId="left" 
                        dataKey="Espèces (Guichet)" 
                        stackId="a" 
                        fill="#64748b" 
                      />
                      <Bar 
                        yAxisId="left" 
                        dataKey="Virement Bancaire" 
                        stackId="a" 
                        fill="#94a3b8" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="Opérations" 
                        name="Nombre de Reçus" 
                        stroke="#059669" 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ===================================================================== */}
          {/* EXPENSE CATEGORIES SUMMARY */}
          {/* ===================================================================== */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Ventilation des Dépenses par Poste Budgétaire
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Répartition détaillée des charges fixes, outillages BTP, matériel informatique et consommables
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-semibold">
                  Charges Opérationnelles
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {EXPENSE_CATEGORIES.map((cat) => {
                  const amt = stats?.byCategory?.[cat.id] || 0;
                  const totalExp = stats?.totalExpense || 1;
                  const pct = Math.round((amt / totalExp) * 100) || 0;
                  const Icon = cat.icon;

                  return (
                    <div key={cat.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-300">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.label}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {amt.toLocaleString()} FCFA
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: PARAMÈTRES DES TARIFS & 3 TRANCHES (SUPER ADMIN) */}
      {/* ========================================================================= */}
      {activeTab === 'tarifs' && isSuperAdmin && (
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-amber-600" />
                  <span>Grille Tarifaire Officielle : Inscriptions & 3 Tranches de Pension</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Le Super Administrateur définit ici le montant des frais d'inscription (indépendants) et le découpage en 3 tranches de chaque formation.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveAllConfigs}
                  disabled={isSavingConfigs}
                  className="rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2 shadow-md shadow-amber-600/20 text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingConfigs ? "Enregistrement..." : "Enregistrer Toute la Grille"}</span>
                </Button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Rechercher une spécialité..."
                  value={tarifsSearch}
                  onChange={(e) => setTarifsSearch(e.target.value)}
                  className="pl-9 rounded-xl text-xs h-9"
                />
              </div>

              <ModernSelect
                value={tarifsFiliereFilter}
                onChange={(e) => setTarifsFiliereFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 font-medium"
              >
                {FILIERES_LIST.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </ModernSelect>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/40 text-xs font-bold">
                    <TableHead className="w-60">Spécialité & Filière</TableHead>
                    <TableHead className="w-36 text-amber-700">Frais Inscription (F)</TableHead>
                    <TableHead className="w-36 text-blue-700">Pension Totale (F)</TableHead>
                    <TableHead className="w-32">1ère Tranche (F)</TableHead>
                    <TableHead className="w-32">2ème Tranche (F)</TableHead>
                    <TableHead className="w-32">3ème Tranche (F)</TableHead>
                    <TableHead className="text-center w-36">Contrôle Équilibre</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTarifs.map((item) => {
                    const total = Number(item.totalTuition) || 0;
                    const sumTranches = Number(item.tranche1 || 0) + Number(item.tranche2 || 0) + Number(item.tranche3 || 0);
                    const isBalanced = sumTranches === total;
                    const diff = total - sumTranches;

                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <TableCell>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                            <Badge variant="outline" className="text-[9px] mt-0.5 border-slate-200 text-slate-500">
                              {item.filiere}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Inscription Fee */}
                        <TableCell>
                          <Input
                            type="number"
                            value={item.registrationFee}
                            onChange={(e) => handleConfigChange(item.id, 'registrationFee', Number(e.target.value))}
                            className="h-8 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                        </TableCell>

                        {/* Total Tuition */}
                        <TableCell>
                          <Input
                            type="number"
                            value={item.totalTuition}
                            onChange={(e) => handleConfigChange(item.id, 'totalTuition', Number(e.target.value))}
                            className="h-8 rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                        </TableCell>

                        {/* Tranche 1 */}
                        <TableCell>
                          <Input
                            type="number"
                            value={item.tranche1}
                            onChange={(e) => handleConfigChange(item.id, 'tranche1', Number(e.target.value))}
                            className="h-8 rounded-lg text-xs font-medium"
                          />
                        </TableCell>

                        {/* Tranche 2 */}
                        <TableCell>
                          <Input
                            type="number"
                            value={item.tranche2}
                            onChange={(e) => handleConfigChange(item.id, 'tranche2', Number(e.target.value))}
                            className="h-8 rounded-lg text-xs font-medium"
                          />
                        </TableCell>

                        {/* Tranche 3 */}
                        <TableCell>
                          <Input
                            type="number"
                            value={item.tranche3}
                            onChange={(e) => handleConfigChange(item.id, 'tranche3', Number(e.target.value))}
                            className="h-8 rounded-lg text-xs font-medium"
                          />
                        </TableCell>

                        {/* Balance Check */}
                        <TableCell className="text-center">
                          {isBalanced ? (
                            <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-[11px]">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Équilibré (100%)</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-300">
                                Écart: {diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString()} F
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAutoBalanceTranche3(item.id)}
                                className="h-6 text-[10px] text-blue-600 hover:bg-blue-50 py-0 px-2 rounded"
                              >
                                Ajuster Tranche 3
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB: FRAIS ANNEXES & DOSSIERS (INDEPENDANT DE LA PENSION DE SCOLARITÉ) */}
      {/* ========================================================================= */}
      {activeTab === 'frais_annexes' && (() => {
        const annexTransactions = transactions.filter(t => 
          t.category === 'frais_annexes' || 
          t.category === 'autre' || 
          (t.title && (
            t.title.toLowerCase().includes('dossier') || 
            t.title.toLowerCase().includes('examen') || 
            t.title.toLowerCase().includes('badge') || 
            t.title.toLowerCase().includes('uniforme') || 
            t.title.toLowerCase().includes('attestation')
          ))
        );

        const filteredAnnexTxs = annexTransactions.filter(t => {
          if (annexFeeSearch.trim()) {
            const q = annexFeeSearch.toLowerCase().trim();
            const matchName = t.studentName?.toLowerCase().includes(q) || t.beneficiary?.toLowerCase().includes(q);
            const matchTitle = t.title?.toLowerCase().includes(q);
            const matchSpec = t.specialty?.toLowerCase().includes(q);
            const matchReceipt = t.receiptNumber?.toLowerCase().includes(q);
            if (!matchName && !matchTitle && !matchSpec && !matchReceipt) return false;
          }

          if (annexFeeCategoryFilter !== 'all') {
            if (annexFeeCategoryFilter === 'dossier' && !t.title?.toLowerCase().includes('dossier')) return false;
            if (annexFeeCategoryFilter === 'examen' && !t.title?.toLowerCase().includes('examen')) return false;
            if (annexFeeCategoryFilter === 'badge' && !t.title?.toLowerCase().includes('badge')) return false;
          }

          return true;
        });

        const totalDossier = annexTransactions.filter(t => t.title?.toLowerCase().includes('dossier')).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const totalExamen = annexTransactions.filter(t => t.title?.toLowerCase().includes('examen')).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const totalBadgesEquipement = annexTransactions.filter(t => t.title?.toLowerCase().includes('badge') || t.title?.toLowerCase().includes('uniforme')).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const totalGlobalAnnex = annexTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        return (
          <div className="space-y-6">
            {/* Header Banner & Action Buttons */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-400/20 text-amber-300 border border-amber-400/30 font-black text-[10px] uppercase">
                    Paiements Hors Pension
                  </Badge>
                  <span className="text-xs text-purple-200">CFP-ITMC Douala</span>
                </div>
                <h2 className="text-xl font-black text-white mt-1">
                  Gestion des Frais Annexes, Dossiers & Examens DQP
                </h2>
                <p className="text-xs text-purple-200/90 mt-0.5">
                  Frais de dossier de candidature, examens nationaux, badges, tenues & pièces diverses.
                  Ces frais sont gérés séparément et n'affectent pas le solde de scolarité de l'apprenant.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => setIsAnnexModalOpen(true)}
                  className="gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs h-11 px-5 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Encaisser un Frais Annexe</span>
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-purple-800 dark:text-purple-300">Frais de Dossier MINEFOP</p>
                <p className="text-xl font-black text-purple-950 dark:text-purple-100 mt-1">{totalDossier.toLocaleString('fr-FR')} FCFA</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Candidatures & Inscriptions</p>
              </Card>

              <Card className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-300">Frais d'Examen DQP</p>
                <p className="text-xl font-black text-indigo-950 dark:text-indigo-100 mt-1">{totalExamen.toLocaleString('fr-FR')} FCFA</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Examens nationaux certifiants</p>
              </Card>

              <Card className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-800 dark:text-blue-300">Badges & Tenues Spécialité</p>
                <p className="text-xl font-black text-blue-950 dark:text-blue-100 mt-1">{totalBadgesEquipement.toLocaleString('fr-FR')} FCFA</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Badges magnétiques & kits TP</p>
              </Card>

              <Card className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Total Encaissements Annexes</p>
                <p className="text-xl font-black text-emerald-950 dark:text-emerald-100 mt-1">{totalGlobalAnnex.toLocaleString('fr-FR')} FCFA</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{annexTransactions.length} opération(s) enregistrée(s)</p>
              </Card>
            </div>

            {/* Filter Bar & Table */}
            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm p-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Rechercher par candidat, frais, reçu..."
                    value={annexFeeSearch}
                    onChange={(e) => setAnnexFeeSearch(e.target.value)}
                    className="pl-9 rounded-xl text-xs h-10"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <ModernSelect
                    value={annexFeeCategoryFilter}
                    onChange={(e) => setAnnexFeeCategoryFilter(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800"
                  >
                    <option value="all">Toutes les catégories de frais annexes</option>
                    <option value="dossier">Frais de Dossier uniquement</option>
                    <option value="examen">Frais d'Examen DQP uniquement</option>
                    <option value="badge">Badges & Tenues uniquement</option>
                  </ModernSelect>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                    <TableRow>
                      <TableHead className="font-bold text-xs">N° Reçu</TableHead>
                      <TableHead className="font-bold text-xs">Apprenant / Candidat</TableHead>
                      <TableHead className="font-bold text-xs">Filière DQP</TableHead>
                      <TableHead className="font-bold text-xs">Nature du Frais Annexe</TableHead>
                      <TableHead className="font-bold text-xs text-right">Montant (FCFA)</TableHead>
                      <TableHead className="font-bold text-xs text-center">Mode de Paiement</TableHead>
                      <TableHead className="font-bold text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnnexTxs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                          Aucun encaissement de frais annexe ne correspond aux critères.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAnnexTxs.map((t) => (
                        <TableRow key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <TableCell className="font-mono font-bold text-xs text-purple-900 dark:text-purple-300">
                            {t.receiptNumber || t.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-bold text-xs text-slate-900 dark:text-white">{t.studentName || t.beneficiary}</p>
                              <p className="text-[10px] text-slate-400">{t.matricule || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {t.specialty || 'Formation Pro'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-900 border-purple-200 font-bold text-[10px]">
                              {t.feeName || t.title}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-black text-xs text-slate-900 dark:text-white">
                            {Number(t.amount).toLocaleString('fr-FR')} FCFA
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                              {t.paymentMethod || 'Espèces'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCurrentAnnexReceipt({
                                  receiptNumber: t.receiptNumber || t.id,
                                  date: t.date,
                                  studentName: t.studentName || t.beneficiary || 'Candidat',
                                  studentId: t.studentId,
                                  matricule: t.matricule,
                                  specialty: t.specialty,
                                  feeName: t.feeName || t.title,
                                  amount: Number(t.amount),
                                  paymentMethod: t.paymentMethod || 'Espèces',
                                  cashierName: t.recordedBy || 'Caisse ITMC',
                                  notes: t.notes
                                });
                              }}
                              className="rounded-xl font-bold text-xs border-purple-200 text-purple-800 hover:bg-purple-50 gap-1.5 h-8"
                            >
                              <Receipt className="w-3.5 h-3.5 text-purple-600" />
                              <span>Reçu PDF</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        );
      })()}
      {activeTab === 'journal' && (
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <span>Grand Livre & Journal Général de Caisse</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Traçabilité chronologique certifiée des flux financiers avec gestion et annulation intelligente par le Super Administrateur
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," + 
                      ["Réf,Date,Statut,Type,Catégorie,Libellé,Tiers,Montant (FCFA),Mode,Opérateur,Motif Annulation"]
                      .concat(transactions.map(t => `"${t.receiptNumber}","${t.date}","${t.status || (t.cancelled ? 'Annulé' : 'Validé')}","${t.type}","${t.category}","${t.title}","${t.type==='income'?t.studentName:t.beneficiary}","${t.amount}","${t.paymentMethod}","${t.recordedBy}","${t.cancellationReason || ''}"`))
                      .join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `JOURNAL_CAISSE_CFP_ITMC_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    toast.success("Journal de caisse exporté en CSV");
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1.5 text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter CSV</span>
                </Button>
              </div>
            </div>

            {/* Quick Status Filter Tabs (Tous / Actifs / Annulés) */}
            {(() => {
              const totalActiveCount = transactions.filter(t => t.status !== 'Annulé' && !t.cancelled).length;
              const totalCancelledCount = transactions.filter(t => t.status === 'Annulé' || t.cancelled === true).length;
              const totalActiveIncome = transactions
                .filter(t => t.type === 'income' && t.status !== 'Annulé' && !t.cancelled)
                .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
              const totalActiveExpense = transactions
                .filter(t => t.type === 'expense' && t.status !== 'Annulé' && !t.cancelled)
                .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
              const totalCancelledAmt = transactions
                .filter(t => t.status === 'Annulé' || t.cancelled === true)
                .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

              return (
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setJournalStatusFilter('all')}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                        journalStatusFilter === 'all'
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      )}
                    >
                      <span>Toutes les écritures</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                        {transactions.length}
                      </Badge>
                    </button>

                    <button
                      type="button"
                      onClick={() => setJournalStatusFilter('valid')}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                        journalStatusFilter === 'valid'
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Actives / Validées</span>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", journalStatusFilter === 'valid' ? "bg-emerald-700 text-white border-transparent" : "")}>
                        {totalActiveCount}
                      </Badge>
                    </button>

                    <button
                      type="button"
                      onClick={() => setJournalStatusFilter('cancelled')}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                        journalStatusFilter === 'cancelled'
                          ? "bg-rose-600 text-white shadow-sm"
                          : "text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      )}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Écritures Annulées</span>
                      {totalCancelledCount > 0 && (
                        <Badge className="bg-rose-600 text-white text-[10px] px-1.5 py-0 h-4">
                          {totalCancelledCount}
                        </Badge>
                      )}
                    </button>
                  </div>

                  {/* Dynamic Summary Strip */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                      <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Total Actif Net :</span>
                      <span className="font-black">{(totalActiveIncome - totalActiveExpense).toLocaleString()} FCFA</span>
                    </div>
                    {totalCancelledCount > 0 && (
                      <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300 flex items-center gap-2">
                        <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400">Total Annulé :</span>
                        <span className="font-bold line-through">{totalCancelledAmt.toLocaleString()} FCFA</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Rechercher élève, N° reçu, libellé, motif..."
                  value={journalSearch}
                  onChange={(e) => setJournalSearch(e.target.value)}
                  className="pl-9 rounded-xl text-xs h-9"
                />
              </div>

              <ModernSelect
                value={journalType}
                onChange={(e) => setJournalType(e.target.value as any)}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 font-medium"
              >
                <option value="all">Tous les flux (Entrées & Sorties)</option>
                <option value="income">Entrées (Pensions & Inscriptions)</option>
                <option value="expense">Sorties (Dépenses & Achats)</option>
              </ModernSelect>

              <ModernSelect
                value={journalMethod}
                onChange={(e) => setJournalMethod(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 font-medium"
              >
                <option value="all">Tous les modes de règlement</option>
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </ModernSelect>

              <ModernSelect
                value={journalCategory}
                onChange={(e) => setJournalCategory(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 font-medium"
              >
                <option value="all">Toutes les catégories</option>
                <option value="pension">Pensions Scolaires</option>
                <option value="inscription">Frais d'Inscription</option>
                <option value="achat_materiel">Achats de Matériel & Équipements</option>
                <option value="consommables">Consommables & Papeterie</option>
                <option value="loyer_charges">Charges fixes (Énergie, Eau, Web)</option>
                <option value="maintenance">Maintenance & Carburant</option>
                <option value="salaires_vacations">Salaires & Vacations</option>
              </ModernSelect>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/40 text-xs font-bold">
                    <TableHead className="w-28">Réf Reçu</TableHead>
                    <TableHead className="w-32">Date & Heure</TableHead>
                    <TableHead>Libellé & Objet</TableHead>
                    <TableHead>Tiers (Apprenant / Fournisseur)</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Montant (FCFA)</TableHead>
                    <TableHead className="text-right w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredJournal.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Receipt className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold">Aucun mouvement de caisse ne correspond aux critères de recherche.</p>
                          {journalStatusFilter !== 'all' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setJournalStatusFilter('all')}
                              className="rounded-xl text-xs mt-1"
                            >
                              Afficher toutes les écritures
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJournal.map((tx) => {
                      const isCancelled = tx.status === 'Annulé' || tx.cancelled === true;

                      return (
                        <TableRow 
                          key={tx.id} 
                          className={cn(
                            "transition-colors",
                            isCancelled 
                              ? "bg-rose-50/50 dark:bg-rose-950/20 text-slate-500 hover:bg-rose-50/80 border-l-4 border-l-rose-500" 
                              : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                          )}
                        >
                          {/* Reçu N° + Badge */}
                          <TableCell className="font-semibold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5">
                              <span className={cn(isCancelled && "line-through text-slate-400 font-mono")}>
                                {tx.receiptNumber}
                              </span>
                              {isCancelled && (
                                <Badge className="bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 font-bold text-[9px] px-1.5 py-0">
                                  Annulée
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Date */}
                          <TableCell className="text-slate-500 text-[11px]">
                            {new Date(tx.date).toLocaleDateString('fr-FR', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </TableCell>

                          {/* Libellé + Tranche + Motif d'annulation */}
                          <TableCell>
                            <div className="flex flex-col space-y-0.5">
                              <span className={cn("font-bold text-slate-900 dark:text-white", isCancelled && "line-through text-slate-500")}>
                                {tx.title}
                              </span>
                              {tx.tranche && (
                                <span className={cn("text-[10px] font-semibold", isCancelled ? "text-slate-400" : "text-blue-600")}>
                                  {tx.tranche}
                                </span>
                              )}
                              {isCancelled && (
                                <div className="mt-1 p-1.5 rounded-md bg-rose-100/80 dark:bg-rose-950/50 text-[10px] text-rose-900 dark:text-rose-300 font-medium flex items-start gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold">Annulée par {tx.cancelledBy || 'Super Administrateur'} :</span> {tx.cancellationReason || 'Annulation administrative'}
                                    {tx.cancelledAt && (
                                      <span className="block text-[9px] text-rose-700 dark:text-rose-400">
                                        le {new Date(tx.cancelledAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Tiers */}
                          <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                            {tx.type === 'income' ? (
                              <div>
                                <span className={cn(isCancelled && "text-slate-500")}>{tx.studentName}</span>
                                {tx.specialty && <p className="text-[10px] text-slate-400">{tx.specialty}</p>}
                              </div>
                            ) : (
                              <span className={cn("text-slate-900 dark:text-white", isCancelled && "text-slate-500")}>
                                {tx.beneficiary}
                              </span>
                            )}
                          </TableCell>

                          {/* Mode Règlement */}
                          <TableCell>
                            <Badge variant="outline" className={cn("text-[10px] font-semibold border-slate-200 dark:border-slate-800", isCancelled && "opacity-60")}>
                              {tx.paymentMethod}
                            </Badge>
                          </TableCell>

                          {/* Montant */}
                          <TableCell className="text-right">
                            {isCancelled ? (
                              <div className="flex flex-col items-end">
                                <span className="line-through text-slate-400 text-xs font-semibold">
                                  {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} FCFA
                                </span>
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                  0 FCFA (Annulé)
                                </span>
                              </div>
                            ) : (
                              <span className={cn("font-bold text-sm", tx.type === 'income' ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}>
                                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} FCFA
                              </span>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Reçu */}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleOpenReceipt(tx)}
                                className={cn(
                                  "h-7 w-7 rounded-lg",
                                  isCancelled ? "text-slate-400 hover:bg-slate-100" : "hover:bg-blue-50 text-blue-600"
                                )}
                                title={isCancelled ? "Voir la quittance officielle (Marquée ANNULÉE)" : "Imprimer / Télécharger le reçu officiel"}
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </Button>

                              {/* Super Admin Actions : Annuler ou Restaurer */}
                              {canAnnuler && (
                                isCancelled ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleInitiateRestore(tx)}
                                    className="h-7 px-2 rounded-lg border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 text-[11px] font-bold gap-1 shadow-xs"
                                    title="Restaurer cette écriture et réintégrer le montant dans le solde"
                                  >
                                    <RotateCcw className="w-3 h-3 text-emerald-600" />
                                    <span>Restaurer</span>
                                  </Button>
                                ) : (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleInitiateCancel(tx)}
                                    className="h-7 w-7 rounded-lg hover:bg-rose-100 text-rose-600 dark:hover:bg-rose-950/60"
                                    title="Annuler intelligemment cette écriture (Gestion automatique des soldes et pensions)"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </Button>
                                )
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: SUIVI DES PENSIONS & 3 TRANCHES PAR ÉTUDIANT */}
      {/* ========================================================================= */}
      {activeTab === 'pensions' && (
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Tableau de Recouvrement : Inscriptions & 3 Tranches de Pension</span>
                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
                    {filteredStudents.length} / {studentsSummary.length} apprenants
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Suivi personnalisé par apprenant avec distinction claire entre frais d'inscription et pension en 3 tranches
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Filtrer par élève, matricule, classe..."
                    value={pensionSearch}
                    onChange={(e) => setPensionSearch(e.target.value)}
                    className="pl-9 rounded-xl text-xs h-9 w-60"
                  />
                </div>

                <ModernSelect
                  value={pensionStatusFilter}
                  onChange={(e) => setPensionStatusFilter(e.target.value as any)}
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 font-medium"
                >
                  <option value="all">Tous les statuts de pension</option>
                  <option value="Soldé">Soldés (100% pension payée)</option>
                  <option value="Partiel">Partiels (Tranches en cours)</option>
                  <option value="Non payé">Non payés</option>
                </ModernSelect>
              </div>
            </div>

            {/* System Selection Tabs for Pensions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto text-xs font-semibold scrollbar-none">
                <button
                  type="button"
                  onClick={() => { setPensionPrimaryTab('tous'); setPensionSubFilter('all'); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0",
                    pensionPrimaryTab === 'tous'
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Tous ({studentsSummary.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPensionPrimaryTab('poles'); setPensionSubFilter('all'); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0",
                    pensionPrimaryTab === 'poles'
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Pôles & Spécialités (35)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPensionPrimaryTab('classes'); setPensionSubFilter('all'); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0",
                    pensionPrimaryTab === 'classes'
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Classes (G1, G2, G3, BTS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPensionPrimaryTab('tranches'); setPensionSubFilter('all'); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0",
                    pensionPrimaryTab === 'tranches'
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Paliers de Tranches</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPensionPrimaryTab('alertes'); setPensionSubFilter('all'); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0",
                    pensionPrimaryTab === 'alertes'
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Alertes Recouvrement</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPensionPrimaryTab('sessions'); setPensionSubFilter('all'); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0",
                    pensionPrimaryTab === 'sessions'
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Sessions Jour / Soir</span>
                </button>
              </div>

              {/* Sub-Filters */}
              {pensionPrimaryTab === 'poles' && (
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('all')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'all' ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    Toutes les filières
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('batiment')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'batiment' ? "bg-amber-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    🏗️ BTP & Travaux
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('informatique')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'informatique' ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    💻 Informatique
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('industrie')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'industrie' ? "bg-cyan-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    ⚡ Industrie & Énergie
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('gestion')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'gestion' ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    📊 Gestion & Commerce
                  </button>
                </div>
              )}

              {pensionPrimaryTab === 'classes' && (
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('all')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'all' ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    Toutes les classes
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('g1')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'g1' ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    Groupe G1
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('g2')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'g2' ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    Groupe G2
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('g3')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'g3' ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    Groupe G3
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('bts')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'bts' ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    BTS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('dqp')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'dqp' ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    DQP Formation Pro
                  </button>
                </div>
              )}

              {pensionPrimaryTab === 'tranches' && (
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('all')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'all' ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    Tous les paliers
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('unpaid_reg')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'unpaid_reg' ? "bg-amber-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    Inscription due
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('t1')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 't1' ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    1ère Tranche attendue
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('t2')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 't2' ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    2ème Tranche attendue
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('t3')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 't3' ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    3ème Tranche (Solde)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('solde')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'solde' ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    100% Soldés
                  </button>
                </div>
              )}

              {pensionPrimaryTab === 'alertes' && (
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('all')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'all' ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    Toutes les situations
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('retard')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'retard' ? "bg-rose-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    🚨 Retards de paiement / Relances
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('a_jour')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'a_jour' ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    ✨ À jour du calendrier
                  </button>
                </div>
              )}

              {pensionPrimaryTab === 'sessions' && (
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('all')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'all' ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    Toutes les sessions
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('jour')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'jour' ? "bg-amber-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    ☀️ Cours du Jour
                  </button>
                  <button
                    type="button"
                    onClick={() => setPensionSubFilter('soir')}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all shrink-0",
                      pensionSubFilter === 'soir' ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    🌙 Cours du Soir
                  </button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map((std) => {
                const pct = Math.round((std.paid / std.totalTuition) * 100);

                return (
                  <div
                    key={std.id}
                    className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4"
                  >
                    {/* Student Identity */}
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">
                            {std.name}
                          </h4>
                          <Badge variant="outline" className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-lg",
                            std.status === 'Soldé' 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800" 
                              : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                          )}>
                            Pension : {std.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Matricule : <span className="font-semibold text-slate-700 dark:text-slate-300">{std.matricule}</span> • Classe : <span className="font-semibold">{std.promo || std.classCode}</span>
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                          Spécialité : {std.specialty}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase font-semibold text-slate-400">Reste Pension Dû</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {std.remaining.toLocaleString()} <span className="text-xs font-normal">FCFA</span>
                        </p>
                      </div>
                    </div>

                    {/* Registration Status vs Pension Status */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Frais d'Inscription (Dossier) : </span>
                        <span className="font-bold text-slate-900 dark:text-white">{std.registrationFee.toLocaleString()} FCFA</span>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-lg",
                        std.registration.status === 'Payé' 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800" 
                          : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                      )}>
                        Inscription : {std.registration.status}
                      </Badge>
                    </div>

                    {/* Overall Tuition Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Pension Versée : <strong className="text-emerald-600">{std.paid.toLocaleString()} FCFA</strong> / {std.totalTuition.toLocaleString()} FCFA</span>
                        <span className="font-bold">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={cn("h-2.5 rounded-full transition-all duration-300", pct === 100 ? "bg-emerald-600" : "bg-blue-600")}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>

                    {/* The 3 Official Tranches Detail Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                      {/* Tranche 1 */}
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">1ère Tranche</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{std.tranches.tranche1.required.toLocaleString()} F</p>
                        <Badge variant="outline" className={cn(
                          "mt-1 text-[9px] font-bold py-0",
                          std.tranches.tranche1.status === 'Payé' ? "border-emerald-300 text-emerald-700 bg-emerald-50" : (std.tranches.tranche1.status === 'Partiel' ? "border-amber-300 text-amber-700 bg-amber-50" : "border-slate-200 text-slate-500")
                        )}>
                          {std.tranches.tranche1.status}
                        </Badge>
                        <p className="text-[8px] text-slate-400 mt-1">{std.tranches.tranche1.deadline || '15 Oct'}</p>
                      </div>

                      {/* Tranche 2 */}
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">2ème Tranche</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{std.tranches.tranche2.required.toLocaleString()} F</p>
                        <Badge variant="outline" className={cn(
                          "mt-1 text-[9px] font-bold py-0",
                          std.tranches.tranche2.status === 'Payé' ? "border-emerald-300 text-emerald-700 bg-emerald-50" : (std.tranches.tranche2.status === 'Partiel' ? "border-amber-300 text-amber-700 bg-amber-50" : "border-slate-200 text-slate-500")
                        )}>
                          {std.tranches.tranche2.status}
                        </Badge>
                        <p className="text-[8px] text-slate-400 mt-1">{std.tranches.tranche2.deadline || '15 Jan'}</p>
                      </div>

                      {/* Tranche 3 */}
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">3ème Tranche (Solde)</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{std.tranches.tranche3.required.toLocaleString()} F</p>
                        <Badge variant="outline" className={cn(
                          "mt-1 text-[9px] font-bold py-0",
                          std.tranches.tranche3.status === 'Payé' ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-slate-200 text-slate-500"
                        )}>
                          {std.tranches.tranche3.status}
                        </Badge>
                        <p className="text-[8px] text-slate-400 mt-1">{std.tranches.tranche3.deadline || '15 Avr'}</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <div className="text-[11px] text-slate-500">
                        {std.recentReceipts.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setHistoryStudent(std)}
                            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                            title="Cliquer pour consulter l'historique complet des versements"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>{std.recentReceipts.length} quittance(s) émise(s)</span>
                          </button>
                        ) : (
                          <span>Aucun versement</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {canEncaissement && (() => {
                          const nextStep = getNextPaymentStep(std);
                          if (nextStep.type === 'complete') {
                            return (
                              <Badge className="rounded-xl text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 py-1 px-2.5 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Scolarité 100% Soldée</span>
                              </Badge>
                            );
                          }
                          return (
                            <Button
                              size="sm"
                              onClick={() => handleQuickEncaisseStudent(std, nextStep.tranche)}
                              className={cn("rounded-xl text-xs font-bold gap-1 shadow-sm transition-all", nextStep.badgeColor)}
                              title={nextStep.description}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{nextStep.label}</span>
                            </Button>
                          );
                        })()}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setHistoryStudent(std)}
                          className="rounded-xl text-xs font-semibold gap-1.5 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Consulter l'historique complet, imprimer ou télécharger tous les reçus de cet étudiant"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-600" />
                          <span>Imprimer Reçu</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: ACHATS MATÉRIEL & CHARGES CAMPUS */}
      {/* ========================================================================= */}
      {activeTab === 'depenses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <span>Achats de Matériel & Charges Opérationnelles</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Suivi des commandes d'équipements de laboratoire, outillage BTP, factures d'énergie et fournitures
              </p>
            </div>

            {canDecaissement && (
              <Button
                onClick={() => {
                  setDecaissementForm(prev => ({ ...prev, category: 'achat_materiel' }));
                  setIsDecaissementOpen(true);
                }}
                className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-md shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Enregistrer un Achat / Charge</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transactions.filter(t => t.type === 'expense').map(exp => (
              <Card key={exp.id} className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/40 pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[10px] font-semibold border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {exp.category?.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500">{exp.receiptNumber}</span>
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                    {exp.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Bénéficiaire :</span>
                    <strong className="text-slate-900 dark:text-white">{exp.beneficiary}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Mode de règlement :</span>
                    <Badge variant="outline" className="text-[10px]">{exp.paymentMethod}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Date d'engagement :</span>
                    <span>{new Date(exp.date).toLocaleDateString('fr-FR')}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Montant Décaissé</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {exp.amount.toLocaleString()} FCFA
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReceipt(exp as any);
                        setIsReceiptModalOpen(true);
                      }}
                      className="rounded-xl text-xs gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Bon de sortie</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB: CONTRÔLE TOTAL & PERMISSIONS CAISSE (SUPER ADMIN) */}
      {/* ========================================================================= */}
      {activeTab === 'permissions' && isSuperAdmin && (
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>Attribution des Permissions de Caisse & Secrétariat</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  En tant que Super Administrateur, configurez avec précision ce que chaque secrétaire ou caissier est autorisé à encaisser ou décaisser.
                </CardDescription>
              </div>

              <Badge className="bg-blue-600 text-white font-bold text-xs py-1 px-3">
                Contrôle Total Super Admin
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="space-y-6">
              {secretaries.map((sec) => {
                const perms = sec.permissions || [];
                const caissePermKeys = [
                  { code: 'perm_caisse_encaissement_inscriptions', label: 'Encaisser les Inscriptions', desc: 'Percevoir les frais d\'admission' },
                  { code: 'perm_caisse_encaissement_pension', label: 'Encaisser les Pensions & Tranches', desc: 'Percevoir les scolarités et émettre les reçus' },
                  { code: 'perm_caisse_generate_receipt', label: 'Émettre & Imprimer les Reçus', desc: 'Délivrer les quittances certifiées' },
                  { code: 'perm_caisse_depenses_mineures', label: 'Dépenses courantes (< 50 000 FCFA)', desc: 'Menues dépenses et fournitures de bureau' },
                  { code: 'perm_caisse_depenses_majeures', label: 'Achats de Matériel & Charges lourdes', desc: 'Autoriser les dépenses de matériel' },
                  { code: 'perm_caisse_view_solde', label: 'Consulter le Solde en direct', desc: 'Voir les totaux et flux de trésorerie' },
                  { code: 'perm_caisse_cloture_journaliere', label: 'Clôture Journalière de Caisse', desc: 'Arrêter les comptes en fin de journée' },
                  { code: 'perm_caisse_annulation_ecriture', label: 'Annuler / Supprimer une écriture', desc: 'Droit de rectification comptable' }
                ];

                return (
                  <div key={sec.id} className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center">
                          {sec.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">{sec.name}</h4>
                          <p className="text-xs text-slate-500">{sec.email} • {sec.function || "Secrétaire de Direction"}</p>
                        </div>
                      </div>

                      <Badge variant="outline" className="border-blue-300 text-blue-700 font-bold text-xs">
                        {perms.filter((p: string) => p.startsWith('perm_caisse')).length} permissions caisse accordées
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                      {caissePermKeys.map(pk => {
                        const isGranted = perms.includes(pk.code);

                        return (
                          <div
                            key={pk.code}
                            onClick={() => handleToggleSecretaryPermission(sec.id, pk.code)}
                            className={cn(
                              "p-3 rounded-2xl border text-xs cursor-pointer transition-all duration-200 flex flex-col justify-between",
                              isGranted
                                ? "bg-blue-50/70 border-blue-300 text-blue-950 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200"
                                : "bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:border-slate-300"
                            )}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold">{pk.label}</span>
                              <div className={cn(
                                "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                isGranted ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-600"
                              )}>
                                {isGranted && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">{pk.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOUVEL ENCAISSEMENT (PENSION / INSCRIPTION) AVEC CONTRÔLE SÉQUENTIEL */}
      {/* ========================================================================= */}
      <Dialog open={isEncaissementOpen} onOpenChange={setIsEncaissementOpen}>
        <DialogContent className="w-[96vw] sm:w-[94vw] md:w-[92vw] lg:w-[1100px] xl:w-[1150px] max-w-[1150px] bg-white dark:bg-slate-900 rounded-3xl p-0 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden font-sans">
          {/* Header - Sober & Corporate (Pinned at top) */}
          <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Enregistrement d'un Encaissement
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Paiement séquentiel : Inscription obligatoire ➔ 1ère Tranche ➔ 2ème Tranche ➔ 3ème Tranche (Solde)
                </DialogDescription>
              </div>
              <Badge variant="outline" className="self-start sm:self-auto border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-lg">
                Règle séquentielle active
              </Badge>
            </div>
          </div>

          {(() => {
            const selectedStd = studentsSummary.find(s => s.id === encaissementForm.studentId);
            const isRegPaid = selectedStd ? (selectedStd.registration.status === 'Payé' || (selectedStd.registration.paid >= selectedStd.registrationFee)) : false;
            const remainingReg = selectedStd ? Math.max(0, selectedStd.registrationFee - (selectedStd.registration.paid || 0)) : 0;

            const t1Req = selectedStd?.tranches.tranche1.required || 0;
            const t1Paid = selectedStd?.tranches.tranche1.paid || 0;
            const isT1Paid = selectedStd ? (selectedStd.tranches.tranche1.status === 'Payé' || t1Paid >= t1Req) : false;
            const remainingT1 = Math.max(0, t1Req - t1Paid);

            const t2Req = selectedStd?.tranches.tranche2.required || 0;
            const t2Paid = selectedStd?.tranches.tranche2.paid || 0;
            const isT2Paid = selectedStd ? (selectedStd.tranches.tranche2.status === 'Payé' || t2Paid >= t2Req) : false;
            const remainingT2 = Math.max(0, t2Req - t2Paid);

            const t3Req = selectedStd?.tranches.tranche3.required || 0;
            const t3Paid = selectedStd?.tranches.tranche3.paid || 0;
            const isT3Paid = selectedStd ? (selectedStd.tranches.tranche3.status === 'Payé' || t3Paid >= t3Req) : false;
            const remainingT3 = Math.max(0, t3Req - t3Paid);

            const totalTuition = selectedStd?.totalTuition || 0;
            const totalPaid = selectedStd?.paid || 0;
            const tuitionPct = totalTuition > 0 ? Math.round((totalPaid / totalTuition) * 100) : 0;

            const amountNum = Number(encaissementForm.amount) || 0;
            const isSmartVentilationActive = Boolean(selectedStd && !isRegPaid && remainingReg > 0 && amountNum > remainingReg);
            const simulatedReg = isSmartVentilationActive ? remainingReg : 0;
            const simulatedPension = isSmartVentilationActive ? (amountNum - remainingReg) : 0;

            // Sequential validation
            let sequentialBlockedReason = "";
            if (selectedStd && !isSmartVentilationActive) {
              if ((encaissementForm.category === 'pension' || encaissementForm.tranche.startsWith('Tranche') || encaissementForm.tranche === 'Solde complet') && !isRegPaid && amountNum <= remainingReg) {
                sequentialBlockedReason = `L'inscription (${selectedStd.registrationFee.toLocaleString()} FCFA) doit être réglée en priorité.`;
              } else if (encaissementForm.tranche === 'Tranche 2' && !isT1Paid) {
                sequentialBlockedReason = `La 1ère Tranche (${t1Req.toLocaleString()} FCFA) doit être intégralement soldée avant la 2ème Tranche. (Reste : ${remainingT1.toLocaleString()} FCFA).`;
              } else if (encaissementForm.tranche === 'Tranche 3' && !isT2Paid) {
                sequentialBlockedReason = `La 2ème Tranche (${t2Req.toLocaleString()} FCFA) doit être intégralement soldée avant la 3ème Tranche. (Reste : ${remainingT2.toLocaleString()} FCFA).`;
              }
            }

            return (
              <form onSubmit={handleSaveEncaissement} className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 overflow-x-hidden">
                  {/* ========================================================================= */}
                  {/* 1. PROFESSIONAL STUDENT SELECTOR (ALL SYSTEM SELECTION TABS) */}
                  {/* ========================================================================= */}
                  {(() => {
                    const showStudentPicker = !selectedStd || isChangingStudent;

                    // 1. Calculations & Counts for all system dimensions
                    const btpCount = studentsSummary.filter(s => getBranchFromSpecialty(s.specialty) === 'batiment').length;
                    const indCount = studentsSummary.filter(s => getBranchFromSpecialty(s.specialty) === 'industrie').length;
                    const infoCount = studentsSummary.filter(s => getBranchFromSpecialty(s.specialty) === 'informatique').length;
                    const gestCount = studentsSummary.filter(s => getBranchFromSpecialty(s.specialty) === 'gestion').length;

                    // Classes / Promotions counts
                    const g1Count = studentsSummary.filter(s => (s.promo || s.classCode || '').toLowerCase().includes('g1')).length;
                    const g2Count = studentsSummary.filter(s => (s.promo || s.classCode || '').toLowerCase().includes('g2')).length;
                    const g3Count = studentsSummary.filter(s => (s.promo || s.classCode || '').toLowerCase().includes('g3')).length;
                    const btsCount = studentsSummary.filter(s => (s.promo || s.classCode || '').toLowerCase().includes('bts')).length;
                    const dqpCount = studentsSummary.filter(s => {
                      const p = (s.promo || s.classCode || '').toLowerCase();
                      return p.includes('dqp') || p.includes('qualification');
                    }).length;
                    const certCount = studentsSummary.filter(s => {
                      const p = (s.promo || s.classCode || '').toLowerCase();
                      return p.includes('certif') || p.includes('licence') || p.includes('master');
                    }).length;

                    // Tuition & Milestones counts
                    const unpaidRegCount = studentsSummary.filter(s => !(s.registration.status === 'Payé' || s.registration.paid >= s.registrationFee)).length;
                    const pendingT1Count = studentsSummary.filter(s => {
                      const isRegPaid = s.registration.status === 'Payé' || s.registration.paid >= s.registrationFee;
                      const isT1Paid = s.tranches.tranche1.status === 'Payé' || s.tranches.tranche1.paid >= s.tranches.tranche1.required;
                      return isRegPaid && !isT1Paid;
                    }).length;
                    const pendingT2Count = studentsSummary.filter(s => {
                      const isT1Paid = s.tranches.tranche1.status === 'Payé' || s.tranches.tranche1.paid >= s.tranches.tranche1.required;
                      const isT2Paid = s.tranches.tranche2.status === 'Payé' || s.tranches.tranche2.paid >= s.tranches.tranche2.required;
                      return isT1Paid && !isT2Paid;
                    }).length;
                    const pendingT3Count = studentsSummary.filter(s => {
                      const isT2Paid = s.tranches.tranche2.status === 'Payé' || s.tranches.tranche2.paid >= s.tranches.tranche2.required;
                      const isT3Paid = s.tranches.tranche3.status === 'Payé' || s.tranches.tranche3.paid >= s.tranches.tranche3.required;
                      return isT2Paid && !isT3Paid;
                    }).length;
                    const completedCount = studentsSummary.filter(s => s.remaining <= 0).length;
                    const heavyDebtCount = studentsSummary.filter(s => s.remaining >= 150000).length;
                    const lightDebtCount = studentsSummary.filter(s => s.remaining > 0 && s.remaining <= 50000).length;

                    // Alertes & Relances Recouvrement
                    const criticalLateCount = studentsSummary.filter(s => {
                      const isRegPaid = s.registration.status === 'Payé' || s.registration.paid >= s.registrationFee;
                      const isT1Paid = s.tranches.tranche1.status === 'Payé' || s.tranches.tranche1.paid >= s.tranches.tranche1.required;
                      return !isRegPaid || (!isT1Paid && s.paid === 0) || (s.remaining > s.totalTuition * 0.7);
                    }).length;
                    const moderateLateCount = studentsSummary.filter(s => {
                      const isRegPaid = s.registration.status === 'Payé' || s.registration.paid >= s.registrationFee;
                      const isT1Paid = s.tranches.tranche1.status === 'Payé' || s.tranches.tranche1.paid >= s.tranches.tranche1.required;
                      const isT2Paid = s.tranches.tranche2.status === 'Payé' || s.tranches.tranche2.paid >= s.tranches.tranche2.required;
                      return isRegPaid && isT1Paid && !isT2Paid;
                    }).length;
                    const upToDateCount = studentsSummary.filter(s => {
                      const isRegPaid = s.registration.status === 'Payé' || s.registration.paid >= s.registrationFee;
                      const isT1Paid = s.tranches.tranche1.status === 'Payé' || s.tranches.tranche1.paid >= s.tranches.tranche1.required;
                      return isRegPaid && (isT1Paid || s.remaining <= 0);
                    }).length;

                    // Sessions & Horaires counts
                    const jourCount = studentsSummary.filter(s => !(s.sessionType || '').toLowerCase().includes('soir')).length;
                    const soirCount = studentsSummary.filter(s => (s.sessionType || '').toLowerCase().includes('soir')).length;
                    const weekendCount = studentsSummary.filter(s => (s.sessionType || '').toLowerCase().includes('weekend') || (s.sessionType || '').toLowerCase().includes('alternance')).length;

                    // Conformité Dossiers
                    const completeDocsCount = studentsSummary.filter(s => s.docsBirthCert !== false && s.docsCni !== false && s.docsDiploma !== false && s.docsPhotos !== false).length;
                    const incompleteDocsCount = studentsSummary.length - completeDocsCount;

                    // 2. Multi-Tab Filtering Engine
                    const filteredModalStudents = studentsSummary.filter(std => {
                      const isRegPaid = std.registration.status === 'Payé' || (std.registration.paid >= std.registrationFee);
                      const isT1Paid = std.tranches.tranche1.status === 'Payé' || (std.tranches.tranche1.paid >= std.tranches.tranche1.required);
                      const isT2Paid = std.tranches.tranche2.status === 'Payé' || (std.tranches.tranche2.paid >= std.tranches.tranche2.required);
                      const isT3Paid = std.tranches.tranche3.status === 'Payé' || (std.tranches.tranche3.paid >= std.tranches.tranche3.required);
                      const isFullyPaid = std.remaining <= 0;

                      const branch = getBranchFromSpecialty(std.specialty);
                      const promoLower = (std.promo || std.classCode || '').toLowerCase();
                      const sessLower = (std.sessionType || '').toLowerCase();

                      // 1. Pôles
                      if (modalPrimaryTab === 'poles') {
                        if (modalSubFilter !== 'all') {
                          if (modalSubFilter === 'batiment' && branch !== 'batiment') return false;
                          if (modalSubFilter === 'industrie' && branch !== 'industrie') return false;
                          if (modalSubFilter === 'informatique' && branch !== 'informatique') return false;
                          if (modalSubFilter === 'administration' && branch !== 'gestion') return false;
                        }
                        if (modalSpecificSpecialty !== 'all' && std.specialty.toLowerCase().trim() !== modalSpecificSpecialty.toLowerCase().trim()) {
                          return false;
                        }
                      }
                      // 2. Classes
                      else if (modalPrimaryTab === 'classes') {
                        if (modalSubFilter === 'g1' && !promoLower.includes('g1')) return false;
                        if (modalSubFilter === 'g2' && !promoLower.includes('g2')) return false;
                        if (modalSubFilter === 'g3' && !promoLower.includes('g3')) return false;
                        if (modalSubFilter === 'bts1' && !(promoLower.includes('bts 1') || promoLower.includes('bts1') || (promoLower.includes('bts') && promoLower.includes('1')))) return false;
                        if (modalSubFilter === 'bts2' && !(promoLower.includes('bts 2') || promoLower.includes('bts2') || (promoLower.includes('bts') && promoLower.includes('2')))) return false;
                        if (modalSubFilter === 'dqp' && !(promoLower.includes('dqp') || promoLower.includes('qualification'))) return false;
                        if (modalSubFilter === 'certif' && !(promoLower.includes('certif') || promoLower.includes('licence') || promoLower.includes('master'))) return false;
                      }
                      // 3. Tranches
                      else if (modalPrimaryTab === 'tranches') {
                        if (modalSubFilter === 'unpaid_reg' && isRegPaid) return false;
                        if (modalSubFilter === 't1' && (!isRegPaid || isT1Paid)) return false;
                        if (modalSubFilter === 't2' && (!isT1Paid || isT2Paid)) return false;
                        if (modalSubFilter === 't3' && (!isT2Paid || isT3Paid)) return false;
                        if (modalSubFilter === 'solde' && !isFullyPaid) return false;
                        if (modalSubFilter === 'reste_lourd' && std.remaining < 150000) return false;
                        if (modalSubFilter === 'reste_faible' && (std.remaining <= 0 || std.remaining > 50000)) return false;
                      }
                      // 4. Alertes Recouvrement
                      else if (modalPrimaryTab === 'alertes') {
                        const isCritLate = !isRegPaid || (!isT1Paid && std.paid === 0) || (std.remaining > std.totalTuition * 0.7);
                        const isModLate = isRegPaid && isT1Paid && !isT2Paid;
                        if (modalSubFilter === 'retard_critique' && !isCritLate) return false;
                        if (modalSubFilter === 'retard_moyen' && !isModLate) return false;
                        if (modalSubFilter === 'echeance_proche' && (isFullyPaid || !isRegPaid)) return false;
                        if (modalSubFilter === 'a_jour' && (!isRegPaid || (!isT1Paid && std.paid === 0))) return false;
                        if (modalSubFilter === 'excedent' && std.paid <= std.totalTuition) return false;
                      }
                      // 5. Sessions
                      else if (modalPrimaryTab === 'sessions') {
                        if (modalSubFilter === 'jour' && sessLower.includes('soir')) return false;
                        if (modalSubFilter === 'soir' && !sessLower.includes('soir')) return false;
                        if (modalSubFilter === 'weekend' && !(sessLower.includes('weekend') || sessLower.includes('alternance'))) return false;
                      }
                      // 6. Dossiers & Conformité
                      else if (modalPrimaryTab === 'dossiers') {
                        const isDocsComplete = std.docsBirthCert !== false && std.docsCni !== false && std.docsDiploma !== false && std.docsPhotos !== false;
                        if (modalSubFilter === 'complet' && !isDocsComplete) return false;
                        if (modalSubFilter === 'incomplet' && isDocsComplete) return false;
                      }

                      // Live search
                      if (modalStudentSearch.trim()) {
                        const q = modalStudentSearch.toLowerCase().trim();
                        const matchName = std.name.toLowerCase().includes(q);
                        const matchMat = std.matricule.toLowerCase().includes(q);
                        const matchSpec = std.specialty.toLowerCase().includes(q);
                        const matchClass = promoLower.includes(q);
                        if (!matchName && !matchMat && !matchSpec && !matchClass) return false;
                      }
                      return true;
                    });

                    // Sorting
                    const sortedModalStudents = [...filteredModalStudents].sort((a, b) => {
                      if (modalSortBy === 'reste_desc') return b.remaining - a.remaining;
                      if (modalSortBy === 'reste_asc') return a.remaining - b.remaining;
                      if (modalSortBy === 'name_asc') return a.name.localeCompare(b.name);
                      if (modalSortBy === 'taux_desc') {
                        const rateA = a.totalTuition > 0 ? (a.paid / a.totalTuition) : 0;
                        const rateB = b.totalTuition > 0 ? (b.paid / b.totalTuition) : 0;
                        return rateB - rateA;
                      }
                      if (modalSortBy === 'matricule') return a.matricule.localeCompare(b.matricule);
                      return 0;
                    });

                    // Active Filter KPIs
                    const activeFilterCount = sortedModalStudents.length;
                    const activeFilterRemaining = sortedModalStudents.reduce((sum, s) => sum + s.remaining, 0);
                    const activeFilterPaid = sortedModalStudents.reduce((sum, s) => sum + s.paid, 0);
                    const activeFilterTotal = sortedModalStudents.reduce((sum, s) => sum + s.totalTuition, 0);
                    const activeFilterRate = activeFilterTotal > 0 ? Math.round((activeFilterPaid / activeFilterTotal) * 100) : 0;

                    const selectStudent = (std: StudentTuitionSummary) => {
                      const stdIsReg = std.registration.status === 'Payé' || (std.registration.paid >= std.registrationFee);
                      const stdIsT1 = std.tranches.tranche1.status === 'Payé' || (std.tranches.tranche1.paid >= std.tranches.tranche1.required);
                      const stdIsT2 = std.tranches.tranche2.status === 'Payé' || (std.tranches.tranche2.paid >= std.tranches.tranche2.required);

                      let nextCat = "inscription";
                      let nextTranche = "Frais d'inscription";
                      let nextAmt = String(std.registrationFee);

                      if (!stdIsReg) {
                        nextCat = "inscription";
                        nextTranche = "Frais d'inscription";
                        nextAmt = String(Math.max(0, std.registrationFee - (std.registration.paid || 0)));
                      } else if (!stdIsT1) {
                        nextCat = "pension";
                        nextTranche = "Tranche 1";
                        nextAmt = String(Math.max(0, std.tranches.tranche1.required - std.tranches.tranche1.paid));
                      } else if (!stdIsT2) {
                        nextCat = "pension";
                        nextTranche = "Tranche 2";
                        nextAmt = String(Math.max(0, std.tranches.tranche2.required - std.tranches.tranche2.paid));
                      } else {
                        nextCat = "pension";
                        nextTranche = "Tranche 3";
                        nextAmt = String(Math.max(0, std.tranches.tranche3.required - std.tranches.tranche3.paid));
                      }

                      setEncaissementForm(prev => ({
                        ...prev,
                        studentId: std.id,
                        category: nextCat,
                        tranche: nextTranche,
                        amount: nextAmt,
                        title: nextCat === 'inscription' ? "Frais d'inscription" : `Pension scolaire - ${nextTranche}`
                      }));
                      setIsChangingStudent(false);
                      setModalStudentSearch('');
                    };

                    if (showStudentPicker) {
                      return (
                        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/40 space-y-4">
                          {/* Top Header of Picker */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                  <Users className="w-4 h-4" />
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  Module de Sélection Avancé des Apprenants
                                </h4>
                                <Badge variant="outline" className="text-[10px] uppercase font-bold bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
                                  Système Complet
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Filtrez avec précision par tous les onglets du système scolaire : Pôles DQP, Classes officielles, Paliers de tranches, Alertes, Sessions ou Conformité.
                              </p>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 shadow-2xs">
                                {sortedModalStudents.length} / {studentsSummary.length} apprenant(s)
                              </Badge>
                              {selectedStd && isChangingStudent && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIsChangingStudent(false)}
                                  className="h-8 px-3 rounded-xl text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700"
                                >
                                  Conserver {selectedStd.name.split(' ')[0]}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* ========================================================================= */}
                          {/* 1. PRIMARY SYSTEM NAVIGATION TABS (7 COMPREHENSIVE SYSTEM DIMENSIONS) */}
                          {/* ========================================================================= */}
                          <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/90 dark:bg-slate-900/80 rounded-2xl overflow-x-auto text-xs font-semibold scrollbar-none shadow-inner">
                            {/* TAB 1: PÔLES */}
                            <button
                              type="button"
                              onClick={() => { setModalPrimaryTab('poles'); setModalSubFilter('all'); setModalSpecificSpecialty('all'); }}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap shrink-0",
                                modalPrimaryTab === 'poles'
                                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              )}
                            >
                              <Building className="w-3.5 h-3.5" />
                              <span>1. Pôles & Spécialités (35)</span>
                            </button>

                            {/* TAB 2: CLASSES */}
                            <button
                              type="button"
                              onClick={() => { setModalPrimaryTab('classes'); setModalSubFilter('all'); }}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap shrink-0",
                                modalPrimaryTab === 'classes'
                                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              )}
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>2. Classes & Groupes</span>
                            </button>

                            {/* TAB 3: TRANCHES */}
                            <button
                              type="button"
                              onClick={() => { setModalPrimaryTab('tranches'); setModalSubFilter('all'); }}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap shrink-0",
                                modalPrimaryTab === 'tranches'
                                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              )}
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>3. Paliers & 3 Tranches</span>
                            </button>

                            {/* TAB 4: ALERTES */}
                            <button
                              type="button"
                              onClick={() => { setModalPrimaryTab('alertes'); setModalSubFilter('all'); }}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap shrink-0",
                                modalPrimaryTab === 'alertes'
                                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              )}
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>4. Alertes & Relances</span>
                            </button>

                            {/* TAB 5: SESSIONS */}
                            <button
                              type="button"
                              onClick={() => { setModalPrimaryTab('sessions'); setModalSubFilter('all'); }}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap shrink-0",
                                modalPrimaryTab === 'sessions'
                                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              )}
                            >
                              <Sun className="w-3.5 h-3.5" />
                              <span>5. Sessions (Jour/Soir)</span>
                            </button>

                            {/* TAB 6: DOSSIERS */}
                            <button
                              type="button"
                              onClick={() => { setModalPrimaryTab('dossiers'); setModalSubFilter('all'); }}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap shrink-0",
                                modalPrimaryTab === 'dossiers'
                                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              )}
                            >
                              <FolderCheck className="w-3.5 h-3.5" />
                              <span>6. Conformité Dossiers</span>
                            </button>

                            {/* TAB 7: TOUS / REGISTRE */}
                            <button
                              type="button"
                              onClick={() => { setModalPrimaryTab('tous'); setModalSubFilter('all'); }}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap shrink-0",
                                modalPrimaryTab === 'tous'
                                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              )}
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>7. Registre & Tri ({studentsSummary.length})</span>
                            </button>
                          </div>

                          {/* ========================================================================= */}
                          {/* 2. DYNAMIC SECONDARY SUB-TABS ROW (ADAPTED TO ACTIVE TAB) */}
                          {/* ========================================================================= */}
                          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                            {/* PÔLES SUB-TABS */}
                            {modalPrimaryTab === 'poles' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => { setModalSubFilter('all'); setModalSpecificSpecialty('all'); }}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0",
                                    modalSubFilter === 'all' && modalSpecificSpecialty === 'all'
                                      ? "bg-blue-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  Tous les Pôles ({studentsSummary.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setModalSubFilter('batiment'); setModalSpecificSpecialty('all'); }}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'batiment'
                                      ? "bg-amber-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  🏗️ BTP & Travaux ({btpCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setModalSubFilter('informatique'); setModalSpecificSpecialty('all'); }}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'informatique'
                                      ? "bg-blue-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  💻 Informatique & Digital ({infoCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setModalSubFilter('industrie'); setModalSpecificSpecialty('all'); }}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'industrie'
                                      ? "bg-cyan-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  ⚡ Industrie & Énergie ({indCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setModalSubFilter('administration'); setModalSpecificSpecialty('all'); }}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'administration'
                                      ? "bg-purple-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  📊 Commerce & Gestion ({gestCount})
                                </button>

                                {/* Quick Specialty Selector Dropdown */}
                                <ModernSelect
                                  value={modalSpecificSpecialty}
                                  onChange={(e) => setModalSpecificSpecialty(e.target.value)}
                                  className="h-8 px-2.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium shrink-0 ml-1"
                                >
                                  <option value="all">Spécialité DQP précise (35)</option>
                                  {defaultSpecialties.map(sp => (
                                    <option key={sp.id} value={sp.name}>{sp.name}</option>
                                  ))}
                                </ModernSelect>
                              </>
                            )}

                            {/* CLASSES SUB-TABS */}
                            {modalPrimaryTab === 'classes' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('all')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0",
                                    modalSubFilter === 'all'
                                      ? "bg-blue-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  Toutes les classes ({studentsSummary.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('g1')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'g1'
                                      ? "bg-blue-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  🏷️ Groupe G1 ({g1Count})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('g2')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'g2'
                                      ? "bg-blue-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  🏷️ Groupe G2 ({g2Count})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('g3')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'g3'
                                      ? "bg-blue-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  🏷️ Groupe G3 ({g3Count})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('bts1')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'bts1'
                                      ? "bg-indigo-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  🎓 BTS 1ère Année ({btsCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('dqp')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'dqp'
                                      ? "bg-emerald-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  📜 DQP Formation Pro ({dqpCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('certif')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'certif'
                                      ? "bg-purple-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  📜 Certifications & Spécialisations ({certCount})
                                </button>
                              </>
                            )}

                            {/* TRANCHES SUB-TABS */}
                            {modalPrimaryTab === 'tranches' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('all')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0",
                                    modalSubFilter === 'all'
                                      ? "bg-blue-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  Tous les paliers ({studentsSummary.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('unpaid_reg')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'unpaid_reg'
                                      ? "bg-amber-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  1. Inscription à régler ({unpaidRegCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('t1')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 't1'
                                      ? "bg-blue-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  2. 1ère Tranche attendue ({pendingT1Count})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('t2')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 't2'
                                      ? "bg-indigo-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  3. 2ème Tranche attendue ({pendingT2Count})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('t3')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 't3'
                                      ? "bg-purple-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                  4. 3ème Tranche (Solde) ({pendingT3Count})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('solde')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'solde'
                                      ? "bg-emerald-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  5. 100% Soldés ({completedCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('reste_lourd')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'reste_lourd'
                                      ? "bg-rose-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  Reste &gt; 150 000 F ({heavyDebtCount})
                                </button>
                              </>
                            )}

                            {/* ALERTES SUB-TABS */}
                            {modalPrimaryTab === 'alertes' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('all')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0",
                                    modalSubFilter === 'all'
                                      ? "bg-blue-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  Toutes les situations ({studentsSummary.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('retard_critique')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'retard_critique'
                                      ? "bg-rose-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  🚨 Retard Critique / Urgence Relance ({criticalLateCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('retard_moyen')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'retard_moyen'
                                      ? "bg-amber-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  ⚠️ Tranche échue non soldée ({moderateLateCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('a_jour')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'a_jour'
                                      ? "bg-emerald-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  ✨ À jour du calendrier ({upToDateCount})
                                </button>
                              </>
                            )}

                            {/* SESSIONS SUB-TABS */}
                            {modalPrimaryTab === 'sessions' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('all')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0",
                                    modalSubFilter === 'all'
                                      ? "bg-blue-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  Toutes les sessions ({studentsSummary.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('jour')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'jour'
                                      ? "bg-amber-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  ☀️ Cours du Jour (08h00 - 13h30) ({jourCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('soir')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'soir'
                                      ? "bg-indigo-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  🌙 Cours du Soir (17h30 - 21h00) ({soirCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('weekend')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'weekend'
                                      ? "bg-purple-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  💼 Formation Continue / Alternance ({weekendCount})
                                </button>
                              </>
                            )}

                            {/* DOSSIERS SUB-TABS */}
                            {modalPrimaryTab === 'dossiers' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('all')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0",
                                    modalSubFilter === 'all'
                                      ? "bg-blue-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  Tous les dossiers ({studentsSummary.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('complet')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'complet'
                                      ? "bg-emerald-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  ✅ Dossiers complets (4/4 pièces) ({completeDocsCount})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSubFilter('incomplet')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5",
                                    modalSubFilter === 'incomplet'
                                      ? "bg-amber-600 text-white shadow-2xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  ⚠️ Pièces administratives manquantes ({incompleteDocsCount})
                                </button>
                              </>
                            )}

                            {/* TOUS / REGISTRE SUB-TABS */}
                            {modalPrimaryTab === 'tous' && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-medium">Tri rapide :</span>
                                <button
                                  type="button"
                                  onClick={() => setModalSortBy('reste_desc')}
                                  className={cn(
                                    "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                                    modalSortBy === 'reste_desc' ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 border text-slate-600"
                                  )}
                                >
                                  Dette max d'abord
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSortBy('name_asc')}
                                  className={cn(
                                    "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                                    modalSortBy === 'name_asc' ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 border text-slate-600"
                                  )}
                                >
                                  Nom A-Z
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModalSortBy('taux_desc')}
                                  className={cn(
                                    "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                                    modalSortBy === 'taux_desc' ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 border text-slate-600"
                                  )}
                                >
                                  Taux versé %
                                </button>
                              </div>
                            )}
                          </div>

                          {/* ========================================================================= */}
                          {/* 3. ACTIVE FILTER KPI SUMMARY STRIP */}
                          {/* ========================================================================= */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                <Users className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 font-medium">Apprenants</p>
                                <p className="font-bold text-slate-900 dark:text-white">{activeFilterCount}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                                <TrendingDown className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 font-medium">Reste Dû Sélection</p>
                                <p className="font-bold text-rose-600 dark:text-rose-400">{activeFilterRemaining.toLocaleString()} F</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 font-medium">Total Encaissé</p>
                                <p className="font-bold text-emerald-600 dark:text-emerald-400">{activeFilterPaid.toLocaleString()} F</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                <Sparkles className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 font-medium">Taux Recouvrement</p>
                                <p className="font-bold text-indigo-600 dark:text-indigo-400">{activeFilterRate}%</p>
                              </div>
                            </div>
                          </div>

                          {/* ========================================================================= */}
                          {/* 4. UNIVERSAL SEARCH + SORT BAR */}
                          {/* ========================================================================= */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative flex-1">
                              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <Input
                                type="text"
                                placeholder="Rechercher par nom, prénom, matricule (ex: ITMC-0012) ou spécialité..."
                                value={modalStudentSearch}
                                onChange={(e) => setModalStudentSearch(e.target.value)}
                                className="pl-10 pr-10 h-10 rounded-xl text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
                              />
                              {modalStudentSearch && (
                                <button
                                  type="button"
                                  onClick={() => setModalStudentSearch('')}
                                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                              <ModernSelect
                                value={modalSortBy}
                                onChange={(e) => setModalSortBy(e.target.value as any)}
                                className="h-10 px-3 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 shadow-2xs"
                              >
                                <option value="reste_desc">Trier par : Plus forte dette</option>
                                <option value="reste_asc">Trier par : Moins forte dette</option>
                                <option value="name_asc">Trier par : Nom alphabétique (A-Z)</option>
                                <option value="taux_desc">Trier par : Avancement (%)</option>
                                <option value="matricule">Trier par : N° Matricule</option>
                              </ModernSelect>
                            </div>
                          </div>

                          {/* ========================================================================= */}
                          {/* 5. SCROLLABLE RESULTS LIST WITH ULTRA-MODERN INSTITUTIONAL CARDS */}
                          {/* ========================================================================= */}
                          <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                            {sortedModalStudents.length === 0 ? (
                              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <Users className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                  Aucun apprenant ne correspond à ces critères dans cet onglet
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  Essayez un autre onglet de sélection ou réinitialisez la recherche textuelle.
                                </p>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => { setModalStudentSearch(''); setModalSubFilter('all'); setModalSpecificSpecialty('all'); }}
                                  className="mt-3 text-xs h-8 rounded-lg gap-1.5"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Réinitialiser les filtres de cet onglet</span>
                                </Button>
                              </div>
                            ) : (
                              sortedModalStudents.map(std => {
                                const isRegPaid = std.registration.status === 'Payé' || (std.registration.paid >= std.registrationFee);
                                const isT1Paid = std.tranches.tranche1.status === 'Payé' || (std.tranches.tranche1.paid >= std.tranches.tranche1.required);
                                const isT2Paid = std.tranches.tranche2.status === 'Payé' || (std.tranches.tranche2.paid >= std.tranches.tranche2.required);
                                const isT3Paid = std.tranches.tranche3.status === 'Payé' || (std.tranches.tranche3.paid >= std.tranches.tranche3.required);
                                const isFullyPaid = std.remaining <= 0;

                                const stdRem = std.remaining;
                                const initials = std.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
                                const isLate = !isRegPaid || (!isT1Paid && std.paid === 0);
                                const isJour = !(std.sessionType || '').toLowerCase().includes('soir');

                                // Recommended next step info
                                let nextActionLabel = "1. Frais d'inscription";
                                let nextActionAmount = std.registrationFee - (std.registration.paid || 0);
                                let stepBadgeClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:border-amber-800";

                                if (!isRegPaid) {
                                  nextActionLabel = "Frais d'inscription obligatoire";
                                  nextActionAmount = Math.max(0, std.registrationFee - (std.registration.paid || 0));
                                  stepBadgeClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:border-amber-800";
                                } else if (!isT1Paid) {
                                  nextActionLabel = "1ère Tranche attendue";
                                  nextActionAmount = Math.max(0, std.tranches.tranche1.required - std.tranches.tranche1.paid);
                                  stepBadgeClass = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:border-blue-800";
                                } else if (!isT2Paid) {
                                  nextActionLabel = "2ème Tranche attendue";
                                  nextActionAmount = Math.max(0, std.tranches.tranche2.required - std.tranches.tranche2.paid);
                                  stepBadgeClass = "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800";
                                } else if (!isFullyPaid) {
                                  nextActionLabel = "3ème Tranche (Solde) attendue";
                                  nextActionAmount = Math.max(0, std.tranches.tranche3.required - std.tranches.tranche3.paid);
                                  stepBadgeClass = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:border-purple-800";
                                } else {
                                  nextActionLabel = "Scolarité 100% Soldée";
                                  nextActionAmount = 0;
                                  stepBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800";
                                }

                                return (
                                  <div
                                    key={std.id}
                                    onClick={() => selectStudent(std)}
                                    className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 cursor-pointer transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 group shadow-2xs"
                                  >
                                    {/* Left: Student Identity & Badges */}
                                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                                      <div className={cn(
                                        "w-11 h-11 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 transition-colors shadow-2xs",
                                        isFullyPaid 
                                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300"
                                          : isLate 
                                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300"
                                            : "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200"
                                      )}>
                                        {initials || "ET"}
                                      </div>

                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                            {std.name}
                                          </p>
                                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                            {std.matricule}
                                          </span>
                                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                            {std.promo || std.classCode}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                                          <span className="text-slate-800 dark:text-slate-300 font-medium">
                                            {std.specialty}
                                          </span>
                                          <span>•</span>
                                          <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                                            {isJour ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                                            {isJour ? "Jour" : "Soir"}
                                          </span>
                                          {isLate && (
                                            <>
                                              <span>•</span>
                                              <span className="text-rose-600 dark:text-rose-400 font-bold text-[11px] flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Relance Requise
                                              </span>
                                            </>
                                          )}
                                        </div>

                                        {/* 4-Step Mini Timeline */}
                                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                          <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded font-medium",
                                            isRegPaid ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold"
                                          )}>
                                            Insc: {isRegPaid ? "✓ Payé" : "À régler"}
                                          </span>
                                          <span className="text-slate-300">→</span>
                                          <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded font-medium",
                                            isT1Paid ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : !isRegPaid ? "bg-slate-100 text-slate-400" : "bg-blue-100 text-blue-800 font-bold"
                                          )}>
                                            T1: {isT1Paid ? "✓ Payé" : isRegPaid ? "Attendue" : "Attente"}
                                          </span>
                                          <span className="text-slate-300">→</span>
                                          <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded font-medium",
                                            isT2Paid ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : !isT1Paid ? "bg-slate-100 text-slate-400" : "bg-indigo-100 text-indigo-800 font-bold"
                                          )}>
                                            T2: {isT2Paid ? "✓ Payé" : isT1Paid ? "Attendue" : "Attente"}
                                          </span>
                                          <span className="text-slate-300">→</span>
                                          <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded font-medium",
                                            isT3Paid ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : !isT2Paid ? "bg-slate-100 text-slate-400" : "bg-purple-100 text-purple-800 font-bold"
                                          )}>
                                            T3: {isT3Paid ? "✓ Payé" : isT2Paid ? "Solde" : "Attente"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right: Payment Recap & Action Button */}
                                    <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                                      <div className="text-left lg:text-right space-y-0.5">
                                        <Badge
                                          variant="outline"
                                          className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-md", stepBadgeClass)}
                                        >
                                          {nextActionLabel}
                                        </Badge>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                          Reste dû : <strong className="text-slate-900 dark:text-white font-bold">{stdRem.toLocaleString()} FCFA</strong>
                                        </p>
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                          Déjà perçu : {std.paid.toLocaleString()} FCFA
                                        </p>
                                      </div>

                                      <Button
                                        type="button"
                                        size="sm"
                                        className="h-9 px-3.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shrink-0 gap-1.5 shadow-2xs group-hover:scale-105 transition-all"
                                      >
                                        <span>Sélectionner</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Otherwise, a student is selected: show their official institutional profile card
                    return (
                      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                              {selectedStd.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                  {selectedStd.name}
                                </h4>
                                <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs border-slate-300 dark:border-slate-700">
                                  {selectedStd.matricule}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Classe : <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedStd.promo || selectedStd.classCode}</span> • Spécialité : <span className="text-blue-600 dark:text-blue-400 font-semibold">{selectedStd.specialty}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsChangingStudent(true)}
                              className="h-8 px-3 rounded-xl text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 gap-1.5 shadow-sm"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Changer d'apprenant</span>
                            </Button>
                          </div>
                        </div>

                        {/* Financial Badges & Progress bar */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={cn(
                                "text-xs font-semibold px-2.5 py-1 rounded-lg",
                                isRegPaid 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800" 
                                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
                              )}>
                                Inscription : {isRegPaid ? "Soldée (25 000 F)" : `Non réglée (Reste : ${remainingReg.toLocaleString()} F)`}
                              </Badge>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:border-blue-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
                                Pension Réglée : {totalPaid.toLocaleString()} / {totalTuition.toLocaleString()} FCFA ({tuitionPct}%)
                              </Badge>
                            </div>
                            <span className="text-slate-500 font-medium">
                              Reste total scolarité : <strong className="text-slate-900 dark:text-white font-bold">{selectedStd.remaining.toLocaleString()} FCFA</strong>
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${Math.min(100, tuitionPct)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 2. Sequential 4-Step Milestone Grid */}
                  {selectedStd && (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Paliers séquentiels de paiement
                        </span>
                        <span className="text-slate-400">
                          Cliquez sur un palier pour pré-remplir le montant
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Step 1: Inscription */}
                        <div
                          onClick={() => {
                            setEncaissementForm(prev => ({
                              ...prev,
                              category: 'inscription',
                              tranche: "Frais d'inscription",
                              amount: String(remainingReg > 0 ? remainingReg : selectedStd.registrationFee),
                              title: "Frais d'inscription"
                            }));
                          }}
                          className={cn(
                            "p-4 rounded-2xl border transition-colors cursor-pointer text-left space-y-2",
                            encaissementForm.category === 'inscription'
                              ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-600/30"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                          )}
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold">1. Inscription</span>
                            {isRegPaid ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <p className="text-base font-bold text-slate-900 dark:text-white">
                            {selectedStd.registrationFee.toLocaleString()} F
                          </p>
                          <span className={cn(
                            "inline-block text-[11px] font-medium px-2 py-0.5 rounded-md",
                            isRegPaid 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          )}>
                            {isRegPaid ? "Soldé" : `Reste : ${remainingReg.toLocaleString()} F`}
                          </span>
                        </div>

                        {/* Step 2: Tranche 1 */}
                        <div
                          onClick={() => {
                            if (!isRegPaid) {
                              toast.warning("L'inscription doit être réglée avant la 1ère Tranche.");
                              return;
                            }
                            setEncaissementForm(prev => ({
                              ...prev,
                              category: 'pension',
                              tranche: 'Tranche 1',
                              amount: String(remainingT1 > 0 ? remainingT1 : t1Req),
                              title: "Pension scolaire - Tranche 1"
                            }));
                          }}
                          className={cn(
                            "p-4 rounded-2xl border transition-colors cursor-pointer text-left space-y-2",
                            !isRegPaid && "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/30",
                            encaissementForm.category === 'pension' && encaissementForm.tranche === 'Tranche 1'
                              ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-600/30"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                          )}
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold">2. Tranche 1</span>
                            {!isRegPaid ? (
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                            ) : isT1Paid ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <p className="text-base font-bold text-slate-900 dark:text-white">
                            {t1Req.toLocaleString()} F
                          </p>
                          <span className={cn(
                            "inline-block text-[11px] font-medium px-2 py-0.5 rounded-md",
                            !isRegPaid 
                              ? "bg-slate-100 text-slate-400 border border-slate-200" 
                              : (isT1Paid ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300")
                          )}>
                            {!isRegPaid ? "Verrouillé" : (isT1Paid ? "Soldé" : `Reste : ${remainingT1.toLocaleString()} F`)}
                          </span>
                        </div>

                        {/* Step 3: Tranche 2 */}
                        <div
                          onClick={() => {
                            if (!isT1Paid) {
                              toast.warning("La 1ère Tranche doit être soldée avant la 2ème Tranche.");
                              return;
                            }
                            setEncaissementForm(prev => ({
                              ...prev,
                              category: 'pension',
                              tranche: 'Tranche 2',
                              amount: String(remainingT2 > 0 ? remainingT2 : t2Req),
                              title: "Pension scolaire - Tranche 2"
                            }));
                          }}
                          className={cn(
                            "p-4 rounded-2xl border transition-colors cursor-pointer text-left space-y-2",
                            !isT1Paid && "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/30",
                            encaissementForm.category === 'pension' && encaissementForm.tranche === 'Tranche 2'
                              ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-600/30"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                          )}
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold">3. Tranche 2</span>
                            {!isT1Paid ? (
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                            ) : isT2Paid ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <p className="text-base font-bold text-slate-900 dark:text-white">
                            {t2Req.toLocaleString()} F
                          </p>
                          <span className={cn(
                            "inline-block text-[11px] font-medium px-2 py-0.5 rounded-md",
                            !isT1Paid 
                              ? "bg-slate-100 text-slate-400 border border-slate-200" 
                              : (isT2Paid ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300")
                          )}>
                            {!isT1Paid ? "Verrouillé" : (isT2Paid ? "Soldé" : `Reste : ${remainingT2.toLocaleString()} F`)}
                          </span>
                        </div>

                        {/* Step 4: Tranche 3 */}
                        <div
                          onClick={() => {
                            if (!isT2Paid) {
                              toast.warning("La 2ème Tranche doit être soldée avant la 3ème Tranche.");
                              return;
                            }
                            setEncaissementForm(prev => ({
                              ...prev,
                              category: 'pension',
                              tranche: 'Tranche 3',
                              amount: String(remainingT3 > 0 ? remainingT3 : t3Req),
                              title: "Pension scolaire - Tranche 3"
                            }));
                          }}
                          className={cn(
                            "p-4 rounded-2xl border transition-colors cursor-pointer text-left space-y-2",
                            !isT2Paid && "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/30",
                            encaissementForm.category === 'pension' && encaissementForm.tranche === 'Tranche 3'
                              ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-600/30"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                          )}
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold">4. Tranche 3</span>
                            {!isT2Paid ? (
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                            ) : isT3Paid ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <p className="text-base font-bold text-slate-900 dark:text-white">
                            {t3Req.toLocaleString()} F
                          </p>
                          <span className={cn(
                            "inline-block text-[11px] font-medium px-2 py-0.5 rounded-md",
                            !isT2Paid 
                              ? "bg-slate-100 text-slate-400 border border-slate-200" 
                              : (isT3Paid ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300")
                          )}>
                            {!isT2Paid ? "Verrouillé" : (isT3Paid ? "Soldé" : `Reste : ${remainingT3.toLocaleString()} F`)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sequential Blocked Message */}
                  {sequentialBlockedReason && (
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Étape requise non validée</p>
                        <p className="mt-0.5">{sequentialBlockedReason}</p>
                      </div>
                    </div>
                  )}

                  {/* 3. Form Grid: 2 Spacious Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                    {/* Left Column: Category & Tranche & Method */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                          Nature du Versement *
                        </label>
                        <ModernSelect
                          value={encaissementForm.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            let newAmount = encaissementForm.amount;
                            if (val === 'inscription') {
                              newAmount = String(remainingReg > 0 ? remainingReg : (selectedStd?.registrationFee || 25000));
                            } else if (val === 'pension') {
                              newAmount = String(remainingT1 > 0 ? remainingT1 : (selectedStd?.tranches.tranche1.required || 120000));
                            }

                            setEncaissementForm(prev => ({
                              ...prev,
                              category: val,
                              amount: newAmount,
                              tranche: val === 'inscription' ? "Frais d'inscription" : (isT1Paid ? (isT2Paid ? "Tranche 3" : "Tranche 2") : "Tranche 1"),
                              title: val === 'inscription' ? "Frais d'inscription" : `Pension scolaire`
                            }));
                          }}
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-600 outline-none"
                        >
                          <option value="pension">Pension scolaire</option>
                          <option value="inscription">Frais d'inscription & dossier</option>
                          <option value="autre_entree">Autre encaissement</option>
                        </ModernSelect>
                      </div>

                      {encaissementForm.category === 'pension' ? (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                            Tranche concernée *
                          </label>
                          <ModernSelect
                            value={encaissementForm.tranche}
                            onChange={(e) => {
                              const t = e.target.value;
                              let autoAmt = encaissementForm.amount;
                              if (selectedStd) {
                                if (t === 'Tranche 1') autoAmt = String(remainingT1 > 0 ? remainingT1 : t1Req);
                                if (t === 'Tranche 2') autoAmt = String(remainingT2 > 0 ? remainingT2 : t2Req);
                                if (t === 'Tranche 3') autoAmt = String(remainingT3 > 0 ? remainingT3 : t3Req);
                                if (t === 'Solde complet') autoAmt = String(selectedStd.remaining);
                              }

                              setEncaissementForm(prev => ({
                                ...prev,
                                tranche: t,
                                amount: autoAmt,
                                title: `Pension scolaire - ${t}`
                              }));
                            }}
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-600 outline-none"
                          >
                            <option value="Tranche 1" disabled={!isRegPaid}>
                              1ère Tranche {!isRegPaid ? " (Inscription requise)" : (isT1Paid ? " (Soldée)" : ` (Reste: ${remainingT1.toLocaleString()} F)`)}
                            </option>
                            <option value="Tranche 2" disabled={!isT1Paid}>
                              2ème Tranche {!isT1Paid ? " (Tranche 1 requise)" : (isT2Paid ? " (Soldée)" : ` (Reste: ${remainingT2.toLocaleString()} F)`)}
                            </option>
                            <option value="Tranche 3" disabled={!isT2Paid}>
                              3ème Tranche {!isT2Paid ? " (Tranche 2 requise)" : (isT3Paid ? " (Soldée)" : ` (Reste: ${remainingT3.toLocaleString()} F)`)}
                            </option>
                            <option value="Solde complet" disabled={!isRegPaid}>
                              Solde complet de la scolarité
                            </option>
                          </ModernSelect>
                        </div>
                      ) : (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                            Motif de l'opération *
                          </label>
                          <Input
                            value={encaissementForm.title}
                            onChange={(e) => setEncaissementForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Ex: Frais de dossier..."
                            className="rounded-xl h-11 text-sm bg-white dark:bg-slate-800"
                            required
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                          Mode de Règlement *
                        </label>
                        <ModernSelect
                          value={encaissementForm.paymentMethod}
                          onChange={(e) => setEncaissementForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-600 outline-none"
                        >
                          {PAYMENT_METHODS.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </ModernSelect>
                      </div>
                    </div>

                    {/* Right Column: Amount & Shortcuts & Notes */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Montant du Versement (FCFA) *
                          </label>
                          {amountNum > 0 && (
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              {amountNum.toLocaleString()} FCFA
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="Ex: 35000"
                            value={encaissementForm.amount}
                            onChange={(e) => setEncaissementForm(prev => ({ ...prev, amount: e.target.value }))}
                            className="rounded-xl h-11 text-base font-semibold bg-white dark:bg-slate-800 pr-16 border border-slate-300 dark:border-slate-700 focus:border-blue-600 outline-none"
                            required
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                            FCFA
                          </span>
                        </div>

                        {/* Clean Shortcuts */}
                        {selectedStd && (
                          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap text-xs">
                            <span className="text-slate-400 text-[11px] font-medium">Raccourcis :</span>
                            {remainingReg > 0 && (
                              <button
                                type="button"
                                onClick={() => setEncaissementForm(prev => ({ ...prev, amount: String(remainingReg), category: 'inscription' }))}
                                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                              >
                                Inscription ({remainingReg.toLocaleString()} F)
                              </button>
                            )}
                            {isRegPaid && remainingT1 > 0 && (
                              <button
                                type="button"
                                onClick={() => setEncaissementForm(prev => ({ ...prev, amount: String(remainingT1), category: 'pension', tranche: 'Tranche 1' }))}
                                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                              >
                                Tranche 1 ({remainingT1.toLocaleString()} F)
                              </button>
                            )}
                            {selectedStd.remaining > 0 && (
                              <button
                                type="button"
                                onClick={() => setEncaissementForm(prev => ({ ...prev, amount: String(selectedStd.remaining), category: 'pension', tranche: 'Solde complet' }))}
                                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                              >
                                Solde total ({selectedStd.remaining.toLocaleString()} F)
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                          Observations / Référence de paiement
                        </label>
                        <Input
                          placeholder="N° de transaction Mobile Money, chèque ou note..."
                          value={encaissementForm.notes}
                          onChange={(e) => setEncaissementForm(prev => ({ ...prev, notes: e.target.value }))}
                          className="rounded-xl h-11 text-sm bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Intelligent Ventilation Box (Sober & Professional) */}
                  {isSmartVentilationActive && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                      <div className="flex justify-between items-center text-slate-900 dark:text-white">
                        <span className="font-bold flex items-center gap-1.5 text-sm">
                          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Ventilation automatique du versement
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Total versé : {amountNum.toLocaleString()} FCFA
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Le versement couvre en priorité les frais d'inscription et affecte l'excédent en avance sur la 1ère tranche :
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">1. Frais d'inscription (Dossier)</span>
                          <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">{simulatedReg.toLocaleString()} FCFA</span>
                          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold block mt-1">Soldé à 100%</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">2. Avance sur 1ère Tranche (Pension)</span>
                          <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">{simulatedPension.toLocaleString()} FCFA</span>
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold block mt-1">
                            Reste Tranche 1 : {Math.max(0, t1Req - simulatedPension).toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Footer - Pinned firmly at bottom */}
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div className="text-xs text-slate-500">
                    {selectedStd ? (
                      <span>Élève sélectionné : <strong className="text-slate-900 dark:text-white font-semibold">{selectedStd.name}</strong> ({selectedStd.matricule})</span>
                    ) : (
                      <span>Veuillez sélectionner un apprenant</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEncaissementOpen(false)}
                      className="rounded-xl text-xs font-semibold h-11 px-5"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={!!sequentialBlockedReason || !encaissementForm.studentId || amountNum <= 0}
                      className={cn(
                        "rounded-xl text-xs font-semibold text-white h-11 px-6 gap-2 transition-colors",
                        sequentialBlockedReason || !encaissementForm.studentId || amountNum <= 0
                          ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      )}
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>
                        {sequentialBlockedReason 
                          ? "Séquence requise" 
                          : (isSmartVentilationActive 
                              ? `Valider (${amountNum.toLocaleString()} F) & émettre reçu`
                              : "Valider l'encaissement et émettre le reçu")}
                      </span>
                    </Button>
                  </div>
                </div>
              </form>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: NOUVEAU DÉCAISSEMENT / ACHAT DE MATÉRIEL */}
      {/* ========================================================================= */}
      <Dialog open={isDecaissementOpen} onOpenChange={setIsDecaissementOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-rose-600">
              <Minus className="w-5 h-5" />
              <span>Enregistrer un Décaissement / Achat de Matériel</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Sortie de fonds pour achats d'outillage, équipements informatiques, factures ou maintenance
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDecaissement} className="space-y-4 text-xs">
            {/* Category */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Catégorie de la Dépense *
              </label>
              <ModernSelect
                value={decaissementForm.category}
                onChange={(e) => setDecaissementForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-800"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </ModernSelect>
            </div>

            {/* Title / Description */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Désignation & Motif de l'Achat *
              </label>
              <Input
                placeholder="Ex: Achat de 4 Commutateurs Cisco 24 ports pour le labo..."
                value={decaissementForm.title}
                onChange={(e) => setDecaissementForm(prev => ({ ...prev, title: e.target.value }))}
                className="rounded-xl h-10 text-xs"
                required
              />
            </div>

            {/* Beneficiary */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Fournisseur / Bénéficiaire *
              </label>
              <Input
                placeholder="Ex: ETS High-Tech Akwa, ENEO Cameroun, Station Total..."
                value={decaissementForm.beneficiary}
                onChange={(e) => setDecaissementForm(prev => ({ ...prev, beneficiary: e.target.value }))}
                className="rounded-xl h-10 text-xs"
                required
              />
            </div>

            {/* Amount & Method */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Montant Décaissé (FCFA) *
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 185000"
                  value={decaissementForm.amount}
                  onChange={(e) => setDecaissementForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="rounded-xl h-10 text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Mode de Sortie *
                </label>
                <ModernSelect
                  value={decaissementForm.paymentMethod}
                  onChange={(e) => setDecaissementForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-800"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </ModernSelect>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                N° Facture / Justificatif & Observations
              </label>
              <Input
                placeholder="N° Bon de commande, facture fournisseur..."
                value={decaissementForm.notes}
                onChange={(e) => setDecaissementForm(prev => ({ ...prev, notes: e.target.value }))}
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDecaissementOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Approuver & Émettre Bon de Sortie
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: CLÔTURE JOURNALIÈRE DE CAISSE */}
      {/* ========================================================================= */}
      <Dialog open={isClotureOpen} onOpenChange={setIsClotureOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
              <span>Clôture Journalière de Caisse</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Arrêté des comptes de fin de journée, rapprochement espèces et signature numérique
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCloture} className="space-y-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Solde Théorique Caisse :</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {(stats?.soldeNet || 0).toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Total Encaissements du Jour :</span>
                <span className="font-semibold">+{(stats?.todayIncome || 0).toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Total Décaissements du Jour :</span>
                <span className="font-semibold">-{(stats?.todayExpense || 0).toLocaleString()} FCFA</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Montant Physique Compté en Caisse (FCFA) *
              </label>
              <Input
                type="number"
                placeholder="Montant réel compté..."
                value={clotureForm.physicalCash}
                onChange={(e) => setClotureForm(prev => ({ ...prev, physicalCash: e.target.value }))}
                className="rounded-xl h-10 text-xs font-semibold"
                required
              />
              {clotureForm.physicalCash && (
                <p className={cn(
                  "text-[11px] font-bold mt-1.5",
                  (Number(clotureForm.physicalCash) - (stats?.soldeNet || 0)) === 0 
                    ? "text-emerald-600" 
                    : "text-amber-600"
                )}>
                  Écart constaté : {(Number(clotureForm.physicalCash) - (stats?.soldeNet || 0)).toLocaleString()} FCFA
                </p>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Observations de Clôture
              </label>
              <Input
                placeholder="Remarques de fin de journée..."
                value={clotureForm.notes}
                onChange={(e) => setClotureForm(prev => ({ ...prev, notes: e.target.value }))}
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsClotureOpen(false)}
                className="rounded-xl text-xs"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Signer & Clôturer la Caisse
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: ANNULATION INTELLIGENTE D'ÉCRITURE DE CAISSE (SUPER ADMIN) */}
      {/* ========================================================================= */}
      <Dialog open={!!cancelDialogTx} onOpenChange={(open) => !open && setCancelDialogTx(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Annulation Intelligente d'Écriture de Caisse
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Régularisation financière certifiée avec mise à jour en cascade des soldes
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {cancelDialogTx && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Transaction Summary Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                  <span className="text-slate-500 font-medium">Référence Reçu :</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{cancelDialogTx.receiptNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Libellé / Objet :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{cancelDialogTx.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Tiers concerné :</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {cancelDialogTx.type === 'income' ? cancelDialogTx.studentName : cancelDialogTx.beneficiary}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500 font-bold">Montant de l'opération :</span>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400">
                    {cancelDialogTx.amount?.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {/* Intelligent Impact Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900 dark:text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Gestion Intelligente Automatique des Soldes</span>
                </div>
                {cancelDialogTx.type === 'income' && cancelDialogTx.studentId ? (
                  <p className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-300/90">
                    Le versement de <strong className="underline">{cancelDialogTx.amount?.toLocaleString()} FCFA</strong> sera immédiatement déduit du cumul payé de <strong>{cancelDialogTx.studentName}</strong>. Son reste à payer (dette) réaugmentera de <strong>+{cancelDialogTx.amount?.toLocaleString()} FCFA</strong>, et le statut de sa scolarité sera automatiquement recalculé.
                  </p>
                ) : (
                  <p className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-300/90">
                    Cette opération sera invalidée du grand livre et le solde de la caisse générale sera recalculé sans ce flux.
                  </p>
                )}
              </div>

              {/* Cancellation Reason Selector & Input */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Motif / Justification de l'Annulation *
                </label>

                {/* Quick Motif Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Erreur de saisie de caisse",
                    "Paiement rejeté / impayé",
                    "Régularisation administrative",
                    "Remboursement / Accord Direction"
                  ].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setCancelReason(tag)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors",
                        cancelReason === tag
                          ? "bg-rose-100 border-rose-300 text-rose-900 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <Input
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Précisez le motif d'annulation..."
                  className="rounded-xl h-10 text-xs mt-1"
                  required
                />
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCancelDialogTx(null)}
                  disabled={isCancelling}
                  className="rounded-xl text-xs font-semibold"
                >
                  Conserver la transaction
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling || !cancelReason.trim()}
                  className="rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5 shadow-sm"
                >
                  {isCancelling ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Ban className="w-3.5 h-3.5" />
                  )}
                  <span>Confirmer l'Annulation Intelligente</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: RESTAURATION D'ÉCRITURE DE CAISSE (SUPER ADMIN) */}
      {/* ========================================================================= */}
      <Dialog open={!!restoreDialogTx} onOpenChange={(open) => !open && setRestoreDialogTx(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Restauration d'Écriture de Caisse
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Réactivation officielle de l'opération et réintégration dans les soldes
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {restoreDialogTx && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Référence Reçu :</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{restoreDialogTx.receiptNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Tiers / Apprenant :</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {restoreDialogTx.type === 'income' ? restoreDialogTx.studentName : restoreDialogTx.beneficiary}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500 font-bold">Montant à réintégrer :</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    +{restoreDialogTx.amount?.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Réintégration Automatique</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-900 dark:text-emerald-300/90">
                  Le montant sera rétabli dans la caisse et réaffecté au dossier de l'élève. Son reste à payer diminuera de <strong>-{restoreDialogTx.amount?.toLocaleString()} FCFA</strong>.
                </p>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRestoreDialogTx(null)}
                  disabled={isRestoring}
                  className="rounded-xl text-xs font-semibold"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmRestore}
                  disabled={isRestoring}
                  className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-sm"
                >
                  {isRestoring ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  <span>Confirmer la Restauration</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: HISTORIQUE COMPLET DES VERSEMENTS ÉTUDIANT */}
      {/* ========================================================================= */}
      <StudentPaymentHistoryModal
        isOpen={!!historyStudent}
        onClose={() => setHistoryStudent(null)}
        student={historyStudent}
        allTransactions={transactions}
        onViewSingleReceipt={(receipt) => {
          setSelectedReceipt(receipt);
          setIsReceiptModalOpen(true);
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL: REÇU OFFICIEL DE CAISSE CERTIFIÉ (IMPRESSION & PDF) */}
      {/* ========================================================================= */}
      <CaisseReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />

      {/* ========================================================================= */}
      {/* MODALS: ENCAISSEMENT FRAIS ANNEXES & REÇU SPÉCIAL DE FRAIS ANNEXES */}
      {/* ========================================================================= */}
      <EncaissementFraisAnnexesModal
        isOpen={isAnnexModalOpen}
        onClose={() => setIsAnnexModalOpen(false)}
        studentsList={studentsSummary}
        onSuccess={(receiptData) => {
          loadAllData();
          setCurrentAnnexReceipt(receiptData);
        }}
      />

      <AnnexFeeReceiptModal
        isOpen={!!currentAnnexReceipt}
        onClose={() => setCurrentAnnexReceipt(null)}
        receiptData={currentAnnexReceipt}
      />
    </div>
  );
}
