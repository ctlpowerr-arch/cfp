import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Search,
  Download,
  RefreshCw,
  Trash2,
  Filter,
  LogIn,
  Users,
  BookOpen,
  DollarSign,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Monitor,
  Globe,
  FileText,
  Plus,
  Eye,
  X,
  Layers,
  ListFilter,
  Sparkles,
  Lock,
  Activity
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useBranding } from '../context/BrandingContext';
import { useAcademicYear } from '../context/AcademicYearContext';

export type LogCategory = 'ALL' | 'CONNEXIONS' | 'UTILISATEURS' | 'PEDAGOGIE' | 'FINANCES' | 'SYSTEME' | 'SECURITE';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  category: Exclude<LogCategory, 'ALL'>;
  eventType: string;
  title: string;
  details: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  ipAddress: string;
  device: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  academicYear: string;
  endpoint?: string;
  integrityHash?: string;
}

export const CATEGORY_META: Record<
  Exclude<LogCategory, 'ALL'>,
  {
    label: string;
    shortLabel: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentText: string;
    accentBg: string;
    accentBorder: string;
    pdfColor: [number, number, number];
  }
> = {
  CONNEXIONS: {
    label: 'Connexions & Authentification',
    shortLabel: 'Connexions',
    description: 'Ouvertures de sessions, tentatives de connexion, changements de mots de passe et accès portails',
    icon: LogIn,
    accentText: 'text-blue-700 dark:text-blue-400',
    accentBg: 'bg-blue-50/80 dark:bg-blue-950/40',
    accentBorder: 'border-blue-200 dark:border-blue-800/60',
    pdfColor: [37, 99, 235]
  },
  UTILISATEURS: {
    label: 'Utilisateurs & Inscriptions',
    shortLabel: 'Utilisateurs',
    description: 'Admissions étudiants, attribution de matricules, gestion des formateurs et secrétaires',
    icon: Users,
    accentText: 'text-indigo-700 dark:text-indigo-400',
    accentBg: 'bg-indigo-50/80 dark:bg-indigo-950/40',
    accentBorder: 'border-indigo-200 dark:border-indigo-800/60',
    pdfColor: [79, 70, 229]
  },
  PEDAGOGIE: {
    label: 'Pédagogie, Notes & Émargements',
    shortLabel: 'Pédagogie',
    description: 'Saisie des notes de composition, bulletins, présences, plannings et cahiers de texte',
    icon: BookOpen,
    accentText: 'text-teal-700 dark:text-teal-400',
    accentBg: 'bg-teal-50/80 dark:bg-teal-950/40',
    accentBorder: 'border-teal-200 dark:border-teal-800/60',
    pdfColor: [13, 148, 136]
  },
  FINANCES: {
    label: 'Finances, Caisse & Scolarité',
    shortLabel: 'Finances & Caisse',
    description: 'Encaissements de scolarité, génération de reçus, décaissements et barèmes tarifaires',
    icon: DollarSign,
    accentText: 'text-emerald-700 dark:text-emerald-400',
    accentBg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
    accentBorder: 'border-emerald-200 dark:border-emerald-800/60',
    pdfColor: [5, 150, 105]
  },
  SYSTEME: {
    label: 'Système, Identité & Années',
    shortLabel: 'Système',
    description: 'Modifications du logo et des coordonnées du centre, bascule d’année scolaire et sauvegardes',
    icon: Settings,
    accentText: 'text-amber-700 dark:text-amber-400',
    accentBg: 'bg-amber-50/80 dark:bg-amber-950/40',
    accentBorder: 'border-amber-200 dark:border-amber-800/60',
    pdfColor: [217, 119, 6]
  },
  SECURITE: {
    label: 'Sécurité & Pare-feu WAF',
    shortLabel: 'Sécurité WAF',
    description: 'Blocages d’intrusions (XSS, SQLi), tentatives de force brute et alertes de sécurité critiques',
    icon: Shield,
    accentText: 'text-rose-700 dark:text-rose-400',
    accentBg: 'bg-rose-50/80 dark:bg-rose-950/40',
    accentBorder: 'border-rose-200 dark:border-rose-800/60',
    pdfColor: [225, 29, 72]
  }
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Super Admin',
  teacher: 'Formateur',
  secretary: 'Secrétariat',
  student: 'Étudiant',
  system: 'Système / WAF'
};

const SEVERITY_META: Record<
  'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  { label: string; dotColor: string; textColor: string }
> = {
  LOW: {
    label: 'Normal / Info',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-700 dark:text-emerald-400'
  },
  MEDIUM: {
    label: 'Important',
    dotColor: 'bg-blue-500',
    textColor: 'text-blue-700 dark:text-blue-400'
  },
  HIGH: {
    label: 'Sensible',
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-700 dark:text-amber-400'
  },
  CRITICAL: {
    label: 'Critique',
    dotColor: 'bg-rose-600',
    textColor: 'text-rose-700 dark:text-rose-400'
  }
};

export default function ActivityLogsManager() {
  const { branding } = useBranding();
  const { selectedYear } = useAcademicYear();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<LogCategory>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<'ALL' | 'TODAY' | '7DAYS' | '30DAYS'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'chronological' | 'grouped'>('chronological');

  // Modals
  const [inspectedLog, setInspectedLog] = useState<AuditLogEntry | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // New Manual Audit Note Form
  const [noteForm, setNoteForm] = useState<{
    category: Exclude<LogCategory, 'ALL'>;
    title: string;
    details: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>({
    category: 'SYSTEME',
    title: '',
    details: '',
    severity: 'LOW'
  });
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/security/logs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLogs(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      toast.error("Impossible de charger le journal d'activités.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<LogCategory, number> = {
      ALL: logs.length,
      CONNEXIONS: 0,
      UTILISATEURS: 0,
      PEDAGOGIE: 0,
      FINANCES: 0,
      SYSTEME: 0,
      SECURITE: 0
    };
    logs.forEach((log) => {
      if (counts[log.category] !== undefined) {
        counts[log.category] += 1;
      } else {
        counts.SYSTEME += 1;
      }
    });
    return counts;
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter((log) => {
      if (selectedCategory !== 'ALL' && log.category !== selectedCategory) return false;
      if (selectedRole !== 'ALL' && log.actorRole !== selectedRole) return false;
      if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) return false;

      if (dateRange !== 'ALL' && log.timestamp) {
        const logTime = new Date(log.timestamp).getTime();
        if (dateRange === 'TODAY') {
          const todayStr = new Date().toISOString().split('T')[0];
          if (!log.timestamp.startsWith(todayStr)) return false;
        } else if (dateRange === '7DAYS') {
          if (now - logTime > 7 * 24 * 3600 * 1000) return false;
        } else if (dateRange === '30DAYS') {
          if (now - logTime > 30 * 24 * 3600 * 1000) return false;
        }
      }

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          (log.title && log.title.toLowerCase().includes(q)) ||
          (log.details && log.details.toLowerCase().includes(q)) ||
          (log.actorName && log.actorName.toLowerCase().includes(q)) ||
          (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
          (log.ipAddress && log.ipAddress.toLowerCase().includes(q)) ||
          (log.id && log.id.toLowerCase().includes(q)) ||
          (log.eventType && log.eventType.toLowerCase().includes(q)) ||
          (log.device && log.device.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [logs, selectedCategory, selectedRole, selectedSeverity, dateRange, searchQuery]);

  // Grouped by category for the Grouped View
  const groupedLogs = useMemo(() => {
    const groups: Record<Exclude<LogCategory, 'ALL'>, AuditLogEntry[]> = {
      CONNEXIONS: [],
      UTILISATEURS: [],
      PEDAGOGIE: [],
      FINANCES: [],
      SYSTEME: [],
      SECURITE: []
    };
    filteredLogs.forEach((log) => {
      const cat = groups[log.category] ? log.category : 'SYSTEME';
      groups[cat].push(log);
    });
    return groups;
  }, [filteredLogs]);

  // Format date & time cleanly
  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return {
        date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    } catch {
      return { date: '--/--/----', time: '--:--:--' };
    }
  };

  // =========================================================================
  // EXPORT PDF OFFICIEL (PAR CATÉGORIE OU GLOBAL)
  // =========================================================================
  const handleExportPdf = (targetCategory: LogCategory = selectedCategory, customSubset?: AuditLogEntry[]) => {
    const entriesToExport =
      customSubset ||
      (targetCategory === 'ALL'
        ? filteredLogs
        : logs.filter((l) => l.category === targetCategory));

    if (entriesToExport.length === 0) {
      toast.error("Aucune entrée de log à exporter pour cette sélection.");
      return;
    }

    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 210mm

      const categoryTitle =
        targetCategory === 'ALL'
          ? 'TOUTES LES CATÉGORIES (RAPPORT INTÉGRAL)'
          : CATEGORY_META[targetCategory].label.toUpperCase();

      const headerColor: [number, number, number] =
        targetCategory === 'ALL' ? [15, 23, 42] : CATEGORY_META[targetCategory].pdfColor;

      // Helper to draw institutional header on page 1
      const drawFirstPageHeader = () => {
        // Top Institutional Banner
        doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.rect(0, 0, pageWidth, 34, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.text(branding.institutionName || 'CFP-ITMC', 14, 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const fullNameLine = (branding.institutionFullName || '').slice(0, 110);
        doc.text(fullNameLine, 14, 18);
        doc.text(
          `${branding.city || 'Douala - Logpom'} (${branding.neighborhood || 'Carrefour Bassong'}) • Tél: ${branding.phone || '683 66 32 22 / 688 05 20 94'} • Email: ${branding.email || 'info@cfp.itmc.com'}`,
          14,
          23.5
        );
        doc.text(
          `${branding.authorizationNumber || 'Arrêté MINEFOP'} • Session Académique : ${selectedYear}`,
          14,
          29
        );

        // Right side box in header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('JOURNAL OFFICIEL DES ACTIVITÉS & LOGS', pageWidth - 14, 13, { align: 'right' });
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`Catégorie : ${categoryTitle}`, pageWidth - 14, 19.5, { align: 'right' });
        doc.text(
          `Édité le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
          pageWidth - 14,
          25,
          { align: 'right' }
        );
        doc.text(`Total d'événements certifiés : ${entriesToExport.length}`, pageWidth - 14, 30, { align: 'right' });

        // Summary KPI Bar below header
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.rect(14, 38, pageWidth - 28, 14, 'FD');

        const authCount = entriesToExport.filter((e) => e.category === 'CONNEXIONS').length;
        const userCount = entriesToExport.filter((e) => e.category === 'UTILISATEURS').length;
        const pedaCount = entriesToExport.filter((e) => e.category === 'PEDAGOGIE').length;
        const finCount = entriesToExport.filter((e) => e.category === 'FINANCES').length;
        const sysCount = entriesToExport.filter((e) => e.category === 'SYSTEME').length;
        const secCount = entriesToExport.filter((e) => e.category === 'SECURITE').length;

        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        const summaryText = `SYNTHÈSE DU RAPPORT :   Connexions (${authCount})   |   Utilisateurs & Inscriptions (${userCount})   |   Pédagogie & Notes (${pedaCount})   |   Finances & Caisse (${finCount})   |   Système (${sysCount})   |   Sécurité WAF (${secCount})`;
        doc.text(summaryText, 18, 46.5);
      };

      // Helper to draw table column headers
      const drawTableHeader = (yPos: number) => {
        doc.setFillColor(30, 41, 59);
        doc.rect(14, yPos, pageWidth - 28, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);

        doc.text('DATE & HEURE', 16, yPos + 5.3);
        doc.text('CATÉGORIE', 48, yPos + 5.3);
        doc.text('UTILISATEUR & RÔLE', 80, yPos + 5.3);
        doc.text('OPÉRATION & DÉTAILS DE L’ACTIVITÉ', 132, yPos + 5.3);
        doc.text('POSTE & IP', 236, yPos + 5.3);
        doc.text('NIVEAU / HASH', 265, yPos + 5.3);
        return yPos + 8;
      };

      drawFirstPageHeader();
      let currentY = drawTableHeader(56);

      entriesToExport.forEach((log, index) => {
        const { date, time } = formatDateTime(log.timestamp);
        const catMeta = CATEGORY_META[log.category] || CATEGORY_META.SYSTEME;
        const roleLabel = ROLE_LABELS[log.actorRole] || log.actorRole;

        // Wrap details text so it fits nicely in 100mm column
        const titleAndDetails = `${log.title} — ${log.details}`;
        const detailLines = doc.splitTextToSize(titleAndDetails, 100);
        const rowHeight = Math.max(10, detailLines.length * 4 + 3);

        // Page break if needed
        if (currentY + rowHeight > pageHeight - 24) {
          doc.addPage();
          // Compact header on subsequent pages
          doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
          doc.rect(0, 0, pageWidth, 14, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(`${branding.institutionName || 'CFP-ITMC'} — JOURNAL D'AUDIT (${categoryTitle})`, 14, 9);
          doc.text(`Session : ${selectedYear}`, pageWidth - 14, 9, { align: 'right' });

          currentY = drawTableHeader(18);
        }

        // Alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, currentY, pageWidth - 28, rowHeight, 'F');
        }

        // Bottom row line
        doc.setDrawColor(226, 232, 240);
        doc.line(14, currentY + rowHeight, pageWidth - 14, currentY + rowHeight);

        // 1. Date & Time
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(date, 16, currentY + 4.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(time, 16, currentY + 8.2);

        // 2. Category
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(catMeta.pdfColor[0], catMeta.pdfColor[1], catMeta.pdfColor[2]);
        doc.text(catMeta.shortLabel.toUpperCase(), 48, currentY + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(log.status || 'Certifié', 48, currentY + 8.5);

        // 3. Actor & Role
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        const actorShort = (log.actorName || 'Admin').slice(0, 28);
        doc.text(actorShort, 80, currentY + 4.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(71, 85, 105);
        doc.text(`${roleLabel} • ${(log.actorEmail || '').slice(0, 26)}`, 80, currentY + 8.2);

        // 4. Operation & Details
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(30, 41, 59);
        doc.text(detailLines, 132, currentY + 4.5);

        // 5. IP & Device
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.setTextColor(15, 23, 42);
        doc.text(log.ipAddress || '127.0.0.1', 236, currentY + 4.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text((log.device || 'Poste Web').slice(0, 22), 236, currentY + 8.2);

        // 6. Severity & Integrity Hash
        const sevLabel = SEVERITY_META[log.severity]?.label || log.severity;
        if (log.severity === 'CRITICAL' || log.severity === 'HIGH') {
          doc.setTextColor(220, 38, 38);
        } else if (log.severity === 'MEDIUM') {
          doc.setTextColor(217, 119, 6);
        } else {
          doc.setTextColor(5, 150, 105);
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.text(sevLabel, 265, currentY + 4.5);
        doc.setFont('courier', 'normal');
        doc.setFontSize(6.2);
        doc.setTextColor(100, 116, 139);
        doc.text(`#${(log.integrityHash || log.id).slice(0, 10)}`, 265, currentY + 8.2);

        currentY += rowHeight;
      });

      // Add Footer & Page Numbers on all pages
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setDrawColor(203, 213, 225);
        doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Document d'audit certifié • ${branding.institutionName || 'CFP-ITMC'} (${branding.domain || 'cfp-itmc.com'}) • Empreinte de sécurité SHA-256 vérifiée`,
          14,
          pageHeight - 10
        );
        doc.text(
          `Visa Direction : ${branding.directorName || 'Le Super Administrateur'}`,
          pageWidth / 2 + 25,
          pageHeight - 10
        );
        doc.setFont('helvetica', 'bold');
        doc.text(`Page ${p} / ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
      }

      const dateSlug = new Date().toISOString().split('T')[0];
      const catSlug = targetCategory.toLowerCase();
      doc.save(`journal_logs_${catSlug}_${branding.acronym || 'cfp_itmc'}_${dateSlug}.pdf`);
      toast.success(`Rapport PDF (${categoryTitle}) généré et téléchargé avec succès !`);
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("Erreur lors de la génération du fichier PDF.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      toast.error("Aucune donnée à exporter.");
      return;
    }
    const headers = ['ID', 'Date_Heure', 'Categorie', 'Titre', 'Details', 'Utilisateur', 'Email', 'Role', 'IP', 'Poste', 'Severite', 'Statut', 'Annee_Scolaire', 'Hash'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.category,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${(l.actorName || '').replace(/"/g, '""')}"`,
      l.actorEmail,
      l.actorRole,
      l.ipAddress,
      `"${(l.device || '').replace(/"/g, '""')}"`,
      l.severity,
      l.status,
      l.academicYear,
      l.integrityHash
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs_${selectedCategory.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Export CSV (Excel) téléchargé avec succès !");
  };

  // Add Manual Audit Note
  const handleCreateManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.details.trim()) {
      toast.error("Veuillez renseigner le titre et les détails de l'opération.");
      return;
    }
    setIsSavingNote(true);
    try {
      const res = await fetch('/api/security/logs/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: noteForm.category,
          eventType: 'AUDIT_MANUEL_SUPER_ADMIN',
          title: noteForm.title.trim(),
          details: noteForm.details.trim(),
          severity: noteForm.severity
        })
      });
      if (res.ok) {
        toast.success("Entrée d'audit consignée et certifiée dans le journal !");
        setNoteForm({ category: 'SYSTEME', title: '', details: '', severity: 'LOW' });
        setShowAddNoteModal(false);
        await fetchLogs();
      } else {
        toast.error("Erreur lors de l'enregistrement de la note d'audit.");
      }
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Delete single log
  const handleDeleteLog = async (id: string) => {
    try {
      const res = await fetch(`/api/security/logs/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setLogs((prev) => prev.filter((item) => item.id !== id));
        if (inspectedLog?.id === id) setInspectedLog(null);
        toast.success("Entrée supprimée du journal.");
      }
    } catch {
      toast.error("Impossible de supprimer cette entrée.");
    }
  };

  // Clear logs (all or current category)
  const handleClearLogs = async (categoryToClear: LogCategory) => {
    const label = categoryToClear === 'ALL' ? 'TOUT le journal des logs' : `les logs de la catégorie "${CATEGORY_META[categoryToClear].label}"`;
    if (!window.confirm(`Confirmez-vous la purge de ${label} ? Une trace d'audit de cette purge sera conservée.`)) {
      return;
    }
    try {
      const res = await fetch('/api/security/logs/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categoryToClear })
      });
      if (res.ok) {
        toast.success(`Purge effectuée avec succès.`);
        await fetchLogs();
      }
    } catch {
      toast.error("Erreur lors de la purge des logs.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary & Action Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Centre de Traçabilité, Connexions &amp; Journal d'Activités
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Suivi en temps réel des connexions, des opérations financières, des saisies pédagogiques et de la sécurité WAF • Empreinte SHA-256
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={fetchLogs}
              className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddNoteModal(true)}
              className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              Consigner une Note d'Audit
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleExportCsv}
              className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              Exporter CSV
            </Button>

            <Button
              type="button"
              onClick={() => handleExportPdf(selectedCategory)}
              disabled={isExportingPdf}
              className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isExportingPdf
                ? 'Génération PDF...'
                : selectedCategory === 'ALL'
                ? 'Exporter PDF (Toutes Catégories)'
                : `Exporter PDF (${CATEGORY_META[selectedCategory].shortLabel})`}
            </Button>
          </div>
        </div>

        {/* Category Interactive Cards / Segmented Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Filtrer et exporter par catégorie d'activité
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('chronological')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    viewMode === 'chronological'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Flux Chronologique
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grouped')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    viewMode === 'grouped'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Vue Groupée par Catégorie
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Layers className="w-4 h-4 opacity-80" />
                <span className="font-mono tabular-nums text-sm font-bold">{categoryCounts.ALL}</span>
              </div>
              <div>
                <div className="text-xs font-semibold leading-tight">Toutes Activités</div>
                <div className="text-[11px] opacity-70 mt-0.5">Vue globale</div>
              </div>
            </button>

            {(Object.keys(CATEGORY_META) as Array<Exclude<LogCategory, 'ALL'>>).map((catKey) => {
              const meta = CATEGORY_META[catKey];
              const IconComp = meta.icon;
              const isSelected = selectedCategory === catKey;

              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${meta.accentBg} ${meta.accentBorder} ${meta.accentText} ring-2 ring-current/15`
                      : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <IconComp className={`w-4 h-4 ${isSelected ? meta.accentText : 'text-slate-500'}`} />
                    <span className="font-mono tabular-nums text-sm font-bold">{categoryCounts[catKey]}</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold leading-tight truncate">{meta.shortLabel}</div>
                    <div className="text-[11px] opacity-75 mt-0.5 truncate">PDF dédié</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Multi-Criteria Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Rechercher un utilisateur, email, IP, action, matricule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="admin">Super Admin</option>
              <option value="teacher">Formateurs</option>
              <option value="secretary">Secrétariat</option>
              <option value="student">Étudiants</option>
              <option value="system">Système / WAF</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">Toutes sévérités</option>
              <option value="CRITICAL">Critique uniquement</option>
              <option value="HIGH">Sensible / Haute</option>
              <option value="MEDIUM">Importante / Moyenne</option>
              <option value="LOW">Normale / Info</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">Tout l'historique</option>
              <option value="TODAY">Aujourd'hui</option>
              <option value="7DAYS">7 derniers jours</option>
              <option value="30DAYS">30 derniers jours</option>
            </select>
          </div>

          <div className="md:col-span-1 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClearLogs(selectedCategory)}
              title={selectedCategory === 'ALL' ? 'Purger tous les logs' : `Purger la catégorie ${CATEGORY_META[selectedCategory].shortLabel}`}
              className="h-10 w-full rounded-xl border-rose-200 dark:border-rose-900/50 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Direct PDF Export Per Category Strip */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span>
            Affichage de <strong className="font-mono tabular-nums text-slate-900 dark:text-white">{filteredLogs.length}</strong> événement(s) certifié(s)
            {selectedCategory !== 'ALL' && ` dans la catégorie ${CATEGORY_META[selectedCategory].label}`}
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">Export PDF rapide par catégorie :</span>
            {(Object.keys(CATEGORY_META) as Array<Exclude<LogCategory, 'ALL'>>).map((catKey) => (
              <button
                key={catKey}
                type="button"
                onClick={() => handleExportPdf(catKey)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3 opacity-70" />
                <span>{CATEGORY_META[catKey].shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CHRONOLOGICAL STRUCTURED TABLE */}
      {/* ========================================================================= */}
      {viewMode === 'chronological' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Shield className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Aucune activité ne correspond à vos critères de filtrage
              </h3>
              <p className="text-xs text-slate-500">
                Modifiez la catégorie sélectionnée ou réinitialisez votre recherche pour afficher l'historique complet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4">Horodatage</th>
                    <th className="py-3.5 px-4">Catégorie</th>
                    <th className="py-3.5 px-4">Utilisateur &amp; Rôle</th>
                    <th className="py-3.5 px-4">Activité &amp; Détails</th>
                    <th className="py-3.5 px-4">Poste &amp; Adresse IP</th>
                    <th className="py-3.5 px-4">Niveau &amp; Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
                  {filteredLogs.map((log) => {
                    const { date, time } = formatDateTime(log.timestamp);
                    const catMeta = CATEGORY_META[log.category] || CATEGORY_META.SYSTEME;
                    const CatIcon = catMeta.icon;
                    const sevMeta = SEVERITY_META[log.severity] || SEVERITY_META.LOW;
                    const roleLabel = ROLE_LABELS[log.actorRole] || log.actorRole;

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setInspectedLog(log)}
                        className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        {/* Timestamp */}
                        <td className="py-3.5 px-4 whitespace-nowrap align-top">
                          <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                            {date}
                          </div>
                          <div className="font-mono tabular-nums text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <span>{time}</span>
                            <span aria-hidden="true">·</span>
                            <span>{log.academicYear || selectedYear}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap align-top">
                          <div className={`inline-flex items-center gap-1.5 font-semibold ${catMeta.accentText}`}>
                            <CatIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>{catMeta.shortLabel}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                            #{log.integrityHash?.slice(0, 8) || log.id.slice(-6)}
                          </div>
                        </td>

                        {/* User / Actor */}
                        <td className="py-3.5 px-4 align-top max-w-[210px]">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {log.actorName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            <span>{roleLabel}</span>
                            <span aria-hidden="true"> · </span>
                            <span>{log.actorEmail}</span>
                          </div>
                        </td>

                        {/* Operation & Details */}
                        <td className="py-3.5 px-4 align-top max-w-md">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {log.title}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5 line-clamp-2">
                            {log.details}
                          </p>
                        </td>

                        {/* IP & Device */}
                        <td className="py-3.5 px-4 whitespace-nowrap align-top">
                          <div className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                            {log.ipAddress}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[160px]">
                            {log.device}
                          </div>
                        </td>

                        {/* Severity & Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap align-top">
                          <div className={`flex items-center gap-1.5 font-semibold ${sevMeta.textColor}`}>
                            <span className={`w-2 h-2 rounded-full ${sevMeta.dotColor}`} />
                            <span>{sevMeta.label}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {log.status}
                          </div>
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3.5 px-4 whitespace-nowrap align-top text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setInspectedLog(log)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                              title="Inspecter les détails certifiés"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLog(log.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Supprimer cette entrée"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: GROUPED BY CATEGORY VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'grouped' && (
        <div className="space-y-6">
          {(Object.keys(CATEGORY_META) as Array<Exclude<LogCategory, 'ALL'>>).map((catKey) => {
            const catLogs = groupedLogs[catKey] || [];
            if (selectedCategory !== 'ALL' && selectedCategory !== catKey) return null;

            const meta = CATEGORY_META[catKey];
            const IconComp = meta.icon;

            return (
              <div
                key={catKey}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden"
              >
                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`p-3 rounded-2xl ${meta.accentBg} ${meta.accentText}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {meta.label}
                        </h3>
                        <span className="font-mono tabular-nums text-xs font-semibold text-slate-500">
                          · {catLogs.length} entrée(s)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{meta.description}</p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={catLogs.length === 0}
                    onClick={() => handleExportPdf(catKey, catLogs)}
                    className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exporter PDF ({meta.shortLabel})
                  </Button>
                </div>

                {catLogs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Aucune activité enregistrée dans cette catégorie pour les filtres actuels.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {catLogs.map((log) => {
                      const { date, time } = formatDateTime(log.timestamp);
                      const sevMeta = SEVERITY_META[log.severity] || SEVERITY_META.LOW;
                      const roleLabel = ROLE_LABELS[log.actorRole] || log.actorRole;

                      return (
                        <div
                          key={log.id}
                          onClick={() => setInspectedLog(log)}
                          className="p-4 sm:px-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="space-y-1 max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-bold text-slate-900 dark:text-white">{log.title}</span>
                              <span aria-hidden="true" className="text-slate-300">·</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{log.actorName}</span>
                              <span className="text-slate-400">({roleLabel})</span>
                              <span aria-hidden="true" className="text-slate-300">·</span>
                              <span className={`font-semibold ${sevMeta.textColor}`}>{sevMeta.label}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {log.details}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0 font-mono tabular-nums">
                            <div className="text-right">
                              <div className="font-semibold text-slate-800 dark:text-slate-200">{date} à {time}</div>
                              <div className="text-[11px] text-slate-400">{log.ipAddress} · {log.device}</div>
                            </div>
                            <Eye className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INSPECTEUR DE LOG DÉTAILLÉ & FICHE DE CERTIFICATION */}
      {/* ========================================================================= */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Fiche d'Audit Certifiée · {CATEGORY_META[inspectedLog.category]?.label || inspectedLog.category}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {inspectedLog.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedLog(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400">Description complète de l'événement</div>
                <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium">
                  {inspectedLog.details}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-[11px] text-slate-400">Utilisateur / Acteur</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{inspectedLog.actorName}</div>
                  <div className="text-[11px] text-slate-500">{inspectedLog.actorEmail}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-[11px] text-slate-400">Rôle &amp; Statut</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {ROLE_LABELS[inspectedLog.actorRole] || inspectedLog.actorRole}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{inspectedLog.status}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-[11px] text-slate-400">Date &amp; Heure Exacte</div>
                  <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white mt-0.5">
                    {formatDateTime(inspectedLog.timestamp).date} à {formatDateTime(inspectedLog.timestamp).time}
                  </div>
                  <div className="text-[11px] text-slate-500">Session : {inspectedLog.academicYear}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-[11px] text-slate-400">Adresse IP &amp; Terminal</div>
                  <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white mt-0.5">
                    {inspectedLog.ipAddress}
                  </div>
                  <div className="text-[11px] text-slate-500">{inspectedLog.device}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between font-mono text-[11px] text-slate-500">
                <span>ID : {inspectedLog.id}</span>
                <span>SHA-256 : #{inspectedLog.integrityHash}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleExportPdf(inspectedLog.category, [inspectedLog])}
                className="rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Exporter cette Fiche en PDF
              </Button>
              <Button
                type="button"
                onClick={() => setInspectedLog(null)}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONSIGNER UNE NOTE D'AUDIT MANUELLE */}
      {/* ========================================================================= */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Consigner une Entrée d'Audit Officielle
                </h3>
                <p className="text-xs text-slate-500">
                  Ajoute une trace certifiée dans le journal d'activités de l'établissement
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddNoteModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualLog} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Catégorie</label>
                  <select
                    value={noteForm.category}
                    onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="CONNEXIONS">Connexions &amp; Accès</option>
                    <option value="UTILISATEURS">Utilisateurs &amp; Inscriptions</option>
                    <option value="PEDAGOGIE">Pédagogie &amp; Notes</option>
                    <option value="FINANCES">Finances &amp; Caisse</option>
                    <option value="SYSTEME">Système &amp; Établissement</option>
                    <option value="SECURITE">Sécurité &amp; WAF</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Niveau d'Importance</label>
                  <select
                    value={noteForm.severity}
                    onChange={(e) => setNoteForm({ ...noteForm, severity: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="LOW">Normal / Info</option>
                    <option value="MEDIUM">Important</option>
                    <option value="HIGH">Sensible / Haute</option>
                    <option value="CRITICAL">Critique</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Intitulé de l'Opération</label>
                <Input
                  type="text"
                  required
                  placeholder="ex: Vérification trimestrielle de la caisse"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Détails &amp; Observations</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Décrivez l'action ou l'observation à consigner dans le journal..."
                  value={noteForm.details}
                  onChange={(e) => setNoteForm({ ...noteForm, details: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddNoteModal(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingNote}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  {isSavingNote ? 'Enregistrement...' : "Certifier & Enregistrer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
