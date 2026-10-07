import React, { useRef, useState } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  Calendar,
  CreditCard,
  Building2,
  Phone,
  Mail,
  User,
  Hash,
  QrCode,
  Scissors,
  Check,
  Copy,
  Sparkles,
  Layers,
  FileCheck,
  AlertTriangle,
  Ban,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  Send,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLogo from '@/components/AppLogo';
import { numberToFrenchWords } from '@/utils/frenchNumbers';
import { exportElementToPDF, printElementDirect } from '@/lib/pdfExport';
import { formatFCFA } from '@/utils/formatCurrency';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface CaisseReceiptData {
  id?: string;
  receiptNumber: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  title: string;
  amount: number;
  paymentMethod: string;
  recordedBy?: string;
  beneficiary?: string;
  studentId?: string;
  studentName?: string;
  matricule?: string;
  specialty?: string;
  classCode?: string;
  tranche?: string;
  totalTuition?: number;
  totalPaid?: number;
  remaining?: number;
  notes?: string;
  academicYear?: string;
  registrationAllocated?: number;
  pensionAllocated?: number;
  autoVentilated?: boolean;
  status?: string;
  cancelled?: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  restoredAt?: string;
  restoredBy?: string;
}

interface CaisseReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: CaisseReceiptData | null;
}

export default function CaisseReceiptModal({ isOpen, onClose, receipt }: CaisseReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [printLayout, setPrintLayout] = useState<'double' | 'single'>('double');
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (!receipt) return null;

  const isIncome = receipt.type === 'income';
  const isCancelled = receipt.status === 'Annulé' || receipt.cancelled === true;
  const amountInWords = numberToFrenchWords(receipt.amount);

  const formattedDate = new Date(receipt.date || Date.now()).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    if (!printRef.current) return;
    printElementDirect(printRef.current, `Recu_CFP_ITMC_${receipt.receiptNumber}`);
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current && !receipt) return;
    try {
      setIsExporting(true);
      const studentOrBenef = (receipt.studentName || receipt.beneficiary || 'CFP-ITMC').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `RECU_${receipt.receiptNumber}_${studentOrBenef}.pdf`;
      await exportElementToPDF(printRef.current, filename, { scale: 2.2, quality: 1, receiptData: receipt });
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyRef = () => {
    const text = `Reçu CFP-ITMC N°: ${receipt.receiptNumber} | Montant: ${formatFCFA(receipt.amount)} | Bénéficiaire: ${receipt.studentName || receipt.beneficiary} | Date: ${formattedDate} | Objet: ${receipt.title}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Informations du reçu copiées dans le presse-papier !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const lines = [
      `🏛️ *INSTITUT DE FORMATION PROFESSIONNELLE CFP-ITMC*`,
      `📄 *QUITTANCE OFFICIELLE DE CAISSE* : N° ${receipt.receiptNumber}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Tiers / Apprenant* : ${receipt.studentName || receipt.beneficiary}`,
      receipt.matricule ? `🔢 *Matricule* : ${receipt.matricule}` : '',
      receipt.specialty ? `📚 *Filière* : ${receipt.specialty}` : '',
      `💰 *Montant Réglé* : ${formatFCFA(receipt.amount)}`,
      `✍️ *En lettres* : ${amountInWords}`,
      `💳 *Mode de Règlement* : ${receipt.paymentMethod || 'Espèces'}`,
      `📌 *Objet* : ${receipt.title} ${receipt.tranche ? '(' + receipt.tranche + ')' : ''}`,
      `📅 *Date d'encaissement* : ${formattedDate}`,
      isCancelled ? `⚠️ *STATUT : ANNULÉ LE ${receipt.cancelledAt ? new Date(receipt.cancelledAt).toLocaleDateString() : ''}*` : `✅ *STATUT : TRANSACTION VALIDÉE & CERTIFIÉE*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_Document généré par le Système de Gestion Académique & Financière CFP-ITMC Douala._`
    ].filter(Boolean).join('\n');

    const encoded = encodeURIComponent(lines);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Helper component to render an official receipt voucher (Volet)
  const renderVoucher = (voletType: 'etudiant' | 'institut') => {
    const isClientCopy = voletType === 'etudiant';
    const voletTitle = isClientCopy 
      ? (isIncome ? "VOLET 1 : EXEMPLAIRE ÉTUDIANT (QUITTANCE LIBÉRATOIRE)" : "VOLET 1 : EXEMPLAIRE BÉNÉFICIAIRE")
      : (isIncome ? "VOLET 2 : SOUCHE ARCHIVE INSTITUT (CONTRÔLE & COMPTABILITÉ)" : "VOLET 2 : SOUCHE CAISSE CENTRALE");

    return (
      <div className="bg-white text-slate-900 border-2 border-slate-300 rounded-2xl p-6 shadow-sm relative overflow-hidden font-sans">
        {/* Security Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <img
            src="/watermark-logo.png"
            alt=""
            className="w-[280px] max-w-[70%] h-auto opacity-[0.07] object-contain"
          />
        </div>

        {/* Cancellation Diagonal Watermark */}
        {isCancelled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
            <span className="text-rose-600/25 font-black text-6xl sm:text-7xl tracking-widest uppercase rotate-[-25deg] border-4 border-rose-600/35 px-8 py-3 rounded-2xl">
              ANNULÉ
            </span>
          </div>
        )}

        {/* Cancellation Alert Header Banner */}
        {isCancelled && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-900 text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="uppercase tracking-wider">DOCUMENT ANNULÉ • TRANSACTION INVALIDE</span>
            </div>
            <span className="text-[11px] font-medium text-rose-700">
              Annulé le {receipt.cancelledAt ? new Date(receipt.cancelledAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''} par {receipt.cancelledBy || 'Direction & Administration'} (Motif : {receipt.cancellationReason || 'Annulation'})
            </span>
          </div>
        )}

        {/* Top Tag & Volet Badge */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3 text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="font-extrabold uppercase tracking-wider text-blue-950">
              {voletTitle}
            </span>
          </div>
          <span className="font-mono text-slate-500 font-semibold text-[11px]">
            Sécurité Doc : #{receipt.receiptNumber}-{isClientCopy ? 'CLT' : 'ARC'}
          </span>
        </div>

        {/* Official Header */}
        <div className="grid grid-cols-12 gap-4 items-center border-b-2 border-slate-900 pb-4 mb-4">
          {/* Logo & Institute Details */}
          <div className="col-span-8 flex items-center gap-3.5">
            <AppLogo size="lg" variant="seal" className="shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                  CFP-ITMC DOUALA
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  MINISTÈRE DE L'EMPLOI ET DE LA FORMATION PROFESSIONNELLE (MINEFOP)
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 leading-tight mt-0.5">
                Institut de Formation Professionnelle aux Métiers des Technologies & du Management
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Arrêté d'homologation MINEFOP • Douala Logpom (Carrefour Bassong) • Tél: (+237) 683 66 32 22 / 688 05 20 94
              </p>
            </div>
          </div>

          {/* Receipt Number & Date Box */}
          <div className="col-span-4 text-right">
            <div className={cn(
              "inline-block px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide border shadow-xs",
              isIncome 
                ? (receipt.category === 'inscription' ? "bg-amber-100 text-amber-950 border-amber-300" : "bg-emerald-100 text-emerald-950 border-emerald-300")
                : "bg-rose-100 text-rose-950 border-rose-300"
            )}>
              {isIncome 
                ? (receipt.category === 'inscription' ? "Frais d'Inscription & Dossier" : `Pension Scolaire : ${receipt.tranche || 'Tranche'}`)
                : "Bon de Décaissement Caisse"}
            </div>
            <p className="font-mono text-base sm:text-lg font-black text-slate-950 mt-1.5">
              N° {receipt.receiptNumber}
            </p>
            <p className="text-[10.5px] font-bold text-slate-600">
              Année Académique : {receipt.academicYear || "2026-2027"}
            </p>
          </div>
        </div>

        {/* Client / Student & Payment Identity Box */}
        <div className="grid grid-cols-12 gap-4 bg-slate-50/90 border border-slate-200 rounded-xl p-4 text-xs mb-4">
          <div className="col-span-7 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isIncome ? "Apprenant(e) / Bénéficiaire de la formation" : "Fournisseur / Bénéficiaire du décaissement"}
            </p>
            <p className="font-black text-slate-950 text-sm">
              {isIncome ? (receipt.studentName || "Apprenant ITMC") : (receipt.beneficiary || "Fournisseur Externe")}
            </p>
            {isIncome && receipt.matricule && (
              <p className="text-slate-700">
                Matricule Officiel : <span className="font-mono font-bold text-slate-900 bg-slate-200/70 px-1.5 py-0.5 rounded">{receipt.matricule}</span>
              </p>
            )}
            {isIncome && receipt.specialty && (
              <p className="text-blue-950 font-semibold truncate">
                Spécialité DQP : <span className="font-bold">{receipt.specialty}</span>
              </p>
            )}
            {isIncome && receipt.classCode && (
              <p className="text-slate-600">
                Promotion / Groupe : <span className="font-bold">{receipt.classCode}</span>
              </p>
            )}
          </div>

          <div className="col-span-5 text-right space-y-1 border-l border-slate-200 pl-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Détails du Règlement & Caisse
            </p>
            <p className="font-semibold text-slate-800">
              Date & Heure : <span className="font-bold text-slate-950">{formattedDate}</span>
            </p>
            <p className="text-slate-700">
              Mode : <span className="font-extrabold text-slate-950 uppercase bg-slate-200/80 px-2 py-0.5 rounded">{receipt.paymentMethod || "Espèces"}</span>
            </p>
            <p className="text-slate-600">
              Opérateur Caisse : <span className="font-medium text-slate-800">{receipt.recordedBy || "Caisse Centrale CFP-ITMC"}</span>
            </p>
          </div>
        </div>

        {/* Operation Designation & Sum Details */}
        <div className="border-2 border-slate-200 rounded-xl overflow-hidden mb-4">
          <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 uppercase flex justify-between tracking-wider border-b border-slate-200">
            <span>Désignation & Motif du Versement</span>
            <span>Montant Réglé</span>
          </div>
          <div className="p-4 bg-white space-y-3 text-xs">
            <div className="flex justify-between items-start gap-4">
              <div className="pr-4">
                <p className="font-extrabold text-slate-950 text-sm leading-snug">{receipt.title}</p>
                {receipt.tranche && (
                  <span className="inline-block mt-1 text-[10.5px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    Tranche acquittée : {receipt.tranche}
                  </span>
                )}
                {receipt.notes && (
                  <p className="text-[11px] text-slate-600 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    Observations de caisse : {receipt.notes}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-xl sm:text-2xl font-black text-slate-950 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300 inline-block">
                  {formatFCFA(receipt.amount)}
                </span>
              </div>
            </div>

            {/* Sum in Words */}
            <div className="pt-2.5 border-t border-dashed border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold">Arrêté la présente quittance à la somme de : </span>
              <span className="font-bold text-slate-950 italic">
                « {amountInWords} »
              </span>
            </div>
          </div>
        </div>

        {/* Detail of Intelligent Ventilation (if mixed payment) */}
        {Boolean(receipt.registrationAllocated && receipt.pensionAllocated && receipt.registrationAllocated > 0 && receipt.pensionAllocated > 0) && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 mb-4 text-xs space-y-2">
            <div className="flex justify-between items-center text-emerald-950 font-bold border-b border-emerald-200 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Ventilation Intelligente Automatique ({formatFCFA(receipt.amount)})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-700 text-white font-bold">2 Postes Réglés</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-0.5">
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-xs">
                <span className="text-[10px] text-amber-800 font-bold block uppercase">1. Frais d'Inscription & Dossier</span>
                <span className="font-mono font-black text-slate-950 text-sm">{formatFCFA(receipt.registrationAllocated)}</span>
                <span className="text-[9.5px] text-emerald-700 font-semibold block mt-0.5">✅ Inscription 100% Soldée</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-xs">
                <span className="text-[10px] text-blue-800 font-bold block uppercase">2. Pension Scolaire (1ère Tranche)</span>
                <span className="font-mono font-black text-slate-950 text-sm">{formatFCFA(receipt.pensionAllocated)}</span>
                <span className="text-[9.5px] text-blue-700 font-semibold block mt-0.5">🚀 Avance sur la 1ère Tranche</span>
              </div>
            </div>
          </div>
        )}

        {/* Tuition Balance Summary (if applicable) */}
        {isIncome && receipt.totalTuition !== undefined && (
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 mb-4 text-xs">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-white rounded-lg border border-blue-100">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Pension Totale Spécialité</p>
                <p className="font-mono font-bold text-slate-900 text-sm">{formatFCFA(receipt.totalTuition || 0)}</p>
              </div>
              <div className="p-2 bg-white rounded-lg border border-blue-100">
                <p className="text-[10px] text-emerald-700 uppercase font-bold">Total Réglé à ce jour</p>
                <p className="font-mono font-bold text-emerald-700 text-sm">{formatFCFA(receipt.totalPaid || receipt.amount)}</p>
              </div>
              <div className="p-2 bg-white rounded-lg border border-blue-100">
                <p className="text-[10px] text-amber-700 uppercase font-bold">Reste à Payer</p>
                <p className="font-mono font-black text-amber-900 text-sm">
                  {formatFCFA(receipt.remaining !== undefined ? receipt.remaining : Math.max(0, (receipt.totalTuition || 0) - (receipt.totalPaid || receipt.amount)))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Signatures & Security Stamp Section */}
        <div className="grid grid-cols-12 gap-4 pt-3 border-t-2 border-slate-200 text-xs items-end">
          {/* Depositor Signature */}
          <div className="col-span-4">
            <p className="font-bold text-slate-900">L'Apprenant / Déposant</p>
            <div className="h-16 border-b-2 border-dashed border-slate-300 flex items-end pb-1">
              <span className="text-[9px] text-slate-400 italic">Mention manuscrite "Lu et approuvé"</span>
            </div>
          </div>

          {/* QR Code Security Stamp */}
          <div className="col-span-4 flex flex-col items-center justify-center text-center">
            <div className="p-1.5 border-2 border-slate-300 rounded-xl bg-white shadow-xs">
              <QrCode className="w-12 h-12 text-slate-900" />
            </div>
            <span className="text-[8.5px] font-mono font-bold text-slate-600 mt-1">
              AUTHENTICITÉ CERTIFIÉE CFP-ITMC
            </span>
          </div>

          {/* Institute Stamp & Cashier Signature */}
          <div className="col-span-4 text-right">
            <p className="font-bold text-slate-900">Visa & Cachet Caisse Principale</p>
            <div className="h-16 flex flex-col items-end justify-end">
              <div className="border-2 border-blue-600 bg-blue-50 rounded-lg px-3 py-1 text-[9px] font-black text-blue-950 uppercase tracking-tight text-center">
                DIRECTION FINANCIÈRE • CAISSE CENTRALE
              </div>
              <p className="text-[8.5px] text-slate-500 mt-1 font-mono font-semibold">
                Douala, le {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Legal Subtext */}
        <div className="text-center pt-3 mt-3 border-t border-slate-200 text-[9px] text-slate-500 font-medium">
          Quittance libératoire certifiée conforme et infalsifiable. Tout versement effectué est définitif conformément au règlement financier en vigueur à l'CFP-ITMC Douala.
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0 shadow-2xl transition-all duration-200 flex flex-col overflow-hidden",
          isFullscreen 
            ? "fixed inset-0 z-50 w-screen h-screen max-w-none max-h-none rounded-none m-0" 
            : "w-[96vw] sm:w-[94vw] lg:max-w-6xl max-h-[95vh] rounded-3xl"
        )}
      >
        {/* Modern Modal Header */}
        <DialogHeader className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Title & Document Identity */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Quittance Officielle & Reçu de Caisse
                  </DialogTitle>
                  <Badge className={cn(
                    "text-[10px] font-bold px-2 py-0.5",
                    isCancelled 
                      ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                  )}>
                    {isCancelled ? "🚫 Annulé" : "✅ Validé & Encaissé"}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>Réf : <strong className="font-mono text-blue-600 dark:text-blue-400">{receipt.receiptNumber}</strong></span>
                  <span>•</span>
                  <span>{formattedDate}</span>
                  <span>•</span>
                  <span>Montant : <strong className="text-slate-900 dark:text-white font-bold">{formatFCFA(receipt.amount)}</strong></span>
                </DialogDescription>
              </div>
            </div>

            {/* Controls & Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
              {/* Double / Single Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setPrintLayout('double')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-bold text-xs transition-all",
                    printLayout === 'double' 
                      ? "bg-blue-600 text-white shadow-xs" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Double Volet (A4)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintLayout('single')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-bold text-xs transition-all",
                    printLayout === 'single' 
                      ? "bg-blue-600 text-white shadow-xs" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Volet Unique (A5)
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
                  className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700"
                  title="Zoom arrière"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono font-bold text-[11px] text-slate-700 dark:text-slate-300">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
                  className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700"
                  title="Zoom avant"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* WhatsApp Share Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleWhatsAppShare}
                className="gap-1.5 rounded-xl border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 text-xs font-bold h-9"
                title="Partager par WhatsApp au parent ou à l'étudiant"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>

              {/* Copy Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyRef}
                className="gap-1.5 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold h-9"
                title="Copier le résumé du reçu"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copié !" : "Copier"}</span>
              </Button>

              {/* Fullscreen Toggle */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(prev => !prev)}
                className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold h-9 px-2.5"
                title={isFullscreen ? "Quitter le plein écran" : "Afficher en plein écran"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>

              {/* Direct Print Button */}
              <Button
                type="button"
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-xs font-bold h-9 text-blue-700 dark:text-blue-300"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span>Imprimer</span>
              </Button>

              {/* PDF Download Button */}
              <Button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                size="sm"
                className="gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 text-xs h-9 px-3.5"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? "Génération PDF..." : "Télécharger PDF"}</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Spacious Scrollable Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/70 dark:bg-slate-900/80 flex justify-center items-start">
          <div 
            style={{ 
              transform: `scale(${zoomLevel / 100})`, 
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="w-full max-w-4xl"
          >
            <div 
              ref={printRef}
              id="printable-caisse-receipt"
              className="space-y-6 p-4 sm:p-6 bg-white text-slate-900 rounded-3xl shadow-xl border border-slate-300"
            >
              {/* Volet 1: Exemplaire Étudiant / Client */}
              {renderVoucher('etudiant')}

              {/* Double Voucher Perforation Line */}
              {printLayout === 'double' && (
                <div className="relative py-3 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-dashed border-slate-400" />
                  </div>
                  <div className="relative bg-slate-100 px-4 py-1 rounded-full border-2 border-slate-300 text-[10px] font-black text-slate-600 flex items-center gap-2 shadow-xs">
                    <Scissors className="w-3.5 h-3.5 text-slate-700" />
                    <span>LIGNE DE DÉCOUPE OFFICIELLE • SOUCHE ARCHIVE COMPTABILITÉ</span>
                  </div>
                </div>
              )}

              {/* Volet 2: Exemplaire Institut / Souche Caisse */}
              {printLayout === 'double' && renderVoucher('institut')}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
