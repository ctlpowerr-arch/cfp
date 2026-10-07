import React, { useRef, useState, useMemo } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  CreditCard, 
  Calendar, 
  User, 
  Hash, 
  BookOpen, 
  FileCheck, 
  AlertTriangle, 
  Ban, 
  ArrowUpDown, 
  DollarSign, 
  FileSpreadsheet, 
  QrCode, 
  ShieldCheck, 
  Sparkles,
  Eye,
  Check,
  Send,
  Building2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { exportElementToPDF, printElementDirect, generateDirectReceiptPDF } from '@/lib/pdfExport';
import { formatFCFA } from '@/utils/formatCurrency';
import { numberToFrenchWords } from '@/utils/frenchNumbers';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AppLogo from '@/components/AppLogo';

export interface StudentPaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  allTransactions?: any[];
  onViewSingleReceipt?: (receipt: any) => void;
}

export default function StudentPaymentHistoryModal({
  isOpen,
  onClose,
  student,
  allTransactions = [],
  onViewSingleReceipt
}: StudentPaymentHistoryModalProps) {
  const statementPrintRef = useRef<HTMLDivElement>(null);
  const [isExportingStatement, setIsExportingStatement] = useState(false);

  // Filter all active/cancelled transactions strictly for this student
  const studentTransactions = useMemo(() => {
    if (!student) return [];
    if (!Array.isArray(allTransactions) || allTransactions.length === 0) {
      return student.recentReceipts || [];
    }

    const sId = (student.id || '').toLowerCase();
    const sName = (student.name || '').toLowerCase().trim();
    const sMatricule = (student.matricule || '').toLowerCase().trim();

    const matches = allTransactions.filter(t => {
      const tStudentId = (t.studentId || '').toLowerCase();
      const tStudentName = (t.studentName || t.beneficiary || '').toLowerCase().trim();
      const tMatricule = (t.matricule || '').toLowerCase().trim();

      if (sId && tStudentId && sId === tStudentId) return true;
      if (sMatricule && tMatricule && sMatricule === tMatricule) return true;
      if (sName && tStudentName && (sName === tStudentName || tStudentName.includes(sName) || sName.includes(tStudentName))) return true;

      return false;
    });

    // Chronological order: newest first
    return matches.sort((a, b) => new Date(b.date || Date.now()).getTime() - new Date(a.date || Date.now()).getTime());
  }, [student, allTransactions]);

  const activeTxs = useMemo(() => {
    return studentTransactions.filter(t => t.status !== 'Annulé' && !t.cancelled);
  }, [studentTransactions]);

  const totalPaidActive = useMemo(() => {
    return activeTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [activeTxs]);

  if (!student) return null;

  const totalTuition = Number(student.totalTuition) || Number(student.fees?.total) || 350000;
  const remainingDUE = Math.max(0, totalTuition - totalPaidActive);
  const isFullySettled = remainingDUE <= 0;

  const formattedDateNow = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handlePrintFullStatement = () => {
    if (!statementPrintRef.current) return;
    printElementDirect(
      statementPrintRef.current, 
      `Releve_Versements_${(student.name || 'Etudiant').replace(/[^a-zA-Z0-9]/g, '_')}`
    );
  };

  const handleDownloadFullStatementPdf = async () => {
    if (!statementPrintRef.current) return;
    try {
      setIsExportingStatement(true);
      const cleanName = (student.name || 'Etudiant').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `RELEVÉ_VERSEMENTS_${student.matricule || student.id}_${cleanName}.pdf`;
      await exportElementToPDF(statementPrintRef.current, filename, { scale: 2.2, quality: 1 });
    } catch (e) {
      console.error("PDF export statement error:", e);
      toast.error("Erreur lors du téléchargement du relevé complet.");
    } finally {
      setIsExportingStatement(false);
    }
  };

  const handleDirectDownloadSinglePdf = (receiptObj: any) => {
    const studentClean = (student.name || 'Etudiant').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `QUITTANCE_${receiptObj.receiptNumber}_${studentClean}.pdf`;
    generateDirectReceiptPDF(receiptObj, filename);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] sm:w-[94vw] lg:max-w-5xl max-h-[94vh] rounded-3xl p-0 border-none shadow-2xl bg-slate-100 dark:bg-slate-950 overflow-hidden flex flex-col">
        
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    Historique des Versements & Quittances
                  </DialogTitle>
                  <Badge className={cn(
                    "text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg uppercase",
                    isFullySettled 
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                  )}>
                    {isFullySettled ? "✨ Scolarité 100% Soldée" : "Paiement en Cours"}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                  <strong className="text-slate-900 dark:text-white font-bold">{student.name}</strong>
                  <span>•</span>
                  <span>Matricule : <strong className="font-mono text-blue-600 dark:text-blue-400">{student.matricule || student.id}</strong></span>
                  <span>•</span>
                  <span>Filière : <strong className="text-slate-800 dark:text-slate-200">{student.specialty || 'Génie Logiciel'}</strong> ({student.promo || student.classCode || 'G1'})</span>
                </DialogDescription>
              </div>
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrintFullStatement}
                className="gap-1.5 rounded-xl border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 text-xs font-bold h-9"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span>Imprimer Relevé</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleDownloadFullStatementPdf}
                disabled={isExportingStatement}
                className="gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 shadow-md shadow-blue-500/20"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingStatement ? "Export..." : "Télécharger Tout (PDF)"}</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pension Scolaire Totale</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {formatFCFA(totalTuition)}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Barème homologué CFP-ITMC</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Cumul Effectif Versé à ce jour</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {formatFCFA(totalPaidActive)}
              </p>
              <p className="text-[10px] text-emerald-600/80 mt-0.5 font-semibold">
                {studentTransactions.length} transaction(s) enregistrée(s)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 shadow-xs">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">Reste à Payer (Solde Dû)</p>
              <p className="text-lg font-black text-amber-900 dark:text-amber-200 mt-1">
                {formatFCFA(remainingDUE)}
              </p>
              <p className="text-[10px] text-amber-700/80 mt-0.5 font-bold">
                {isFullySettled ? "Règlement 100% accompli" : `Taux de règlement : ${Math.round((totalPaidActive / totalTuition) * 100)}%`}
              </p>
            </div>
          </div>

          {/* Transactions History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Détail Réel de tous les Versements Effectués</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Chaque versement possède sa quittance libératoire individuelle téléchargeable et imprimable.
                </p>
              </div>

              <Badge variant="outline" className="text-xs font-bold bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                {studentTransactions.length} Reçu(s) & Quittance(s)
              </Badge>
            </div>

            {studentTransactions.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Aucun versement enregistré pour cet étudiant</p>
                <p className="text-xs text-slate-400">Les quittances apparaîtront ici dès que les premiers encaissements seront effectués en caisse.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="p-3.5">N° Quittance</th>
                      <th className="p-3.5">Date & Heure</th>
                      <th className="p-3.5">Rubrique / Motif</th>
                      <th className="p-3.5">Ventilation</th>
                      <th className="p-3.5 text-center">Mode</th>
                      <th className="p-3.5 text-right">Montant</th>
                      <th className="p-3.5 text-center">Statut</th>
                      <th className="p-3.5 text-right">Actions Quittance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {studentTransactions.map((tx, idx) => {
                      const isCancelled = tx.status === 'Annulé' || tx.cancelled === true;
                      const formattedTxDate = new Date(tx.date || Date.now()).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      const receiptObj = {
                        receiptNumber: tx.receiptNumber || `REC-${tx.id || idx}`,
                        date: tx.date || new Date().toISOString(),
                        type: 'income',
                        category: tx.category || 'pension',
                        title: tx.title || `Versement - ${tx.tranche || 'Scolarité'}`,
                        amount: Number(tx.amount) || 0,
                        paymentMethod: tx.paymentMethod || 'Espèces',
                        studentName: student.name,
                        matricule: student.matricule || tx.matricule,
                        specialty: student.specialty || tx.specialty,
                        classCode: student.classCode || student.promo,
                        tranche: tx.tranche || 'Paiement',
                        totalTuition: totalTuition,
                        totalPaid: totalPaidActive,
                        remaining: remainingDUE,
                        recordedBy: tx.recordedBy || 'Caisse Centrale CFP-ITMC',
                        status: tx.status,
                        cancelled: isCancelled,
                        cancellationReason: tx.cancellationReason
                      };

                      return (
                        <tr key={tx.id || idx} className={cn("hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors", isCancelled && "bg-rose-50/40 dark:bg-rose-950/20 opacity-75")}>
                          <td className="p-3.5 font-mono font-bold text-blue-700 dark:text-blue-300">
                            #{receiptObj.receiptNumber}
                          </td>
                          <td className="p-3.5 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {formattedTxDate}
                          </td>
                          <td className="p-3.5">
                            <span className={cn("font-bold text-slate-900 dark:text-white", isCancelled && "line-through text-slate-400")}>
                              {tx.title || "Versement scolarité"}
                            </span>
                            {isCancelled && tx.cancellationReason && (
                              <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
                                Motif : {tx.cancellationReason}
                              </p>
                            )}
                          </td>
                          <td className="p-3.5">
                            <Badge variant="outline" className="text-[10px] font-bold border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {tx.tranche || (tx.category === 'inscription' ? "Frais d'inscription" : "Pension")}
                            </Badge>
                          </td>
                          <td className="p-3.5 text-center font-medium text-slate-600 dark:text-slate-400">
                            {tx.paymentMethod || 'Espèces'}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            <span className={cn(isCancelled && "line-through text-rose-400")}>
                              {formatFCFA(tx.amount)}
                            </span>
                          </td>
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <Badge className={cn(
                              "text-[9px] font-black uppercase px-2 py-0.5",
                              isCancelled 
                                ? "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                            )}>
                              {isCancelled ? "Annulé" : "Validé"}
                            </Badge>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Open Full Receipt Modal */}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (onViewSingleReceipt) {
                                    onViewSingleReceipt(receiptObj);
                                  }
                                }}
                                className="h-8 px-2.5 rounded-lg border-blue-200 hover:bg-blue-50 text-blue-700 dark:text-blue-300 text-[11px] font-bold gap-1"
                                title="Afficher et imprimer la quittance officielle"
                              >
                                <Printer className="w-3.5 h-3.5 text-blue-600" />
                                <span>Reçu</span>
                              </Button>

                              {/* Direct Download Single Receipt PDF */}
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => handleDirectDownloadSinglePdf(receiptObj)}
                                className="h-8 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold gap-1"
                                title="Télécharger le PDF direct de ce versement"
                              >
                                <Download className="w-3.5 h-3.5 text-blue-600" />
                                <span className="hidden sm:inline">PDF</span>
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
          </div>

          {/* Printable Consolidated Statement Area (Mounted off-screen for perfect header and table capture) */}
          <div style={{ position: 'fixed', left: '-9999px', top: '0', width: '820px', pointerEvents: 'none' }}>
            <div 
              ref={statementPrintRef}
              id="printable-student-statement"
              className="p-8 bg-white text-slate-900 font-sans space-y-6 text-xs max-w-[800px] mx-auto border border-slate-300 rounded-xl relative overflow-hidden"
            >
              {/* Security Watermark Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <img
                  src="/watermark-logo.png"
                  alt=""
                  className="w-[320px] max-w-[70%] h-auto opacity-[0.06] object-contain"
                />
              </div>

              {/* Official Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-base font-black uppercase text-blue-900 tracking-tight">INSTITUT DE FORMATION PROFESSIONNELLE CFP-ITMC</h2>
                  <p className="text-[10px] text-slate-600 font-semibold">Ministère de l'Emploi & de la Formation Professionnelle (MINEFOP)</p>
                  <p className="text-[9.5px] text-slate-500">Arrêté d'homologation MINEFOP • Douala Logpom (Carrefour Bassong) • Tél: (+237) 683 66 32 22 / 688 05 20 94</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="px-3 py-1 bg-blue-900 text-white font-black text-[10px] uppercase rounded">
                    GRAND LIVRE COMPTE ÉLÈVE
                  </div>
                  <p className="text-[9px] font-mono text-slate-500">Édition : {formattedDateNow}</p>
                </div>
              </div>

              {/* Title & Document Ref */}
              <div className="text-center py-2.5 bg-slate-100 rounded-xl border border-slate-200">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  RELEVÉ OFFICIEL DES VERSEMENTS & SITUATION FINANCIÈRE
                </h3>
                <p className="text-[10px] font-mono font-bold text-blue-800 mt-0.5">
                  COMPTE APPRENANT N° : {student.matricule || student.id}
                </p>
              </div>

              {/* Student Identity Card Box */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-slate-300 bg-slate-50/70">
                <div className="space-y-1">
                  <p><strong className="uppercase text-slate-500 text-[9px]">Nom & Prénom :</strong> <span className="font-bold text-sm text-slate-900">{student.name}</span></p>
                  <p><strong className="uppercase text-slate-500 text-[9px]">Matricule Officiel :</strong> <span className="font-mono font-bold text-blue-800">{student.matricule || student.id}</span></p>
                  <p><strong className="uppercase text-slate-500 text-[9px]">Filière DQP :</strong> <span className="font-bold">{student.specialty || 'Génie Logiciel'}</span></p>
                </div>
                <div className="space-y-1 text-right">
                  <p><strong className="uppercase text-slate-500 text-[9px]">Classe / Promo :</strong> <span className="font-bold">{student.promo || student.classCode || 'G1'}</span></p>
                  <p><strong className="uppercase text-slate-500 text-[9px]">Session Académique :</strong> <span>2026-2027</span></p>
                  <p><strong className="uppercase text-slate-500 text-[9px]">Statut Règlement :</strong> <span className="font-bold text-blue-800">{isFullySettled ? "100% Soldé" : "En cours"}</span></p>
                </div>
              </div>

              {/* Financial Balance Summary Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                      <th className="p-2">Intitulé Rubrique</th>
                      <th className="p-2 text-right">Montant Exigible</th>
                      <th className="p-2 text-right">Cumul Encaissé</th>
                      <th className="p-2 text-right">Solde Reste Dû</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2 font-medium">Pension Scolaire Globale Spécialité</td>
                      <td className="p-2 text-right font-mono font-bold">{formatFCFA(totalTuition)}</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-800">{formatFCFA(totalPaidActive)}</td>
                      <td className="p-2 text-right font-mono font-bold text-amber-900">{formatFCFA(remainingDUE)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Detailed Transactions Log */}
              <div className="space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
                  Historique Chronologique des Quittances Émises ({activeTxs.length})
                </h4>

                <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300">N° Reçu</th>
                      <th className="p-2 border-r border-slate-300">Date</th>
                      <th className="p-2 border-r border-slate-300">Objet du Versement</th>
                      <th className="p-2 border-r border-slate-300 text-center">Mode</th>
                      <th className="p-2 text-right">Montant Réglé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeTxs.map((tx, i) => (
                      <tr key={i}>
                        <td className="p-2 font-mono font-bold text-blue-900 border-r border-slate-200">#{tx.receiptNumber || tx.id}</td>
                        <td className="p-2 border-r border-slate-200">{new Date(tx.date || Date.now()).toLocaleDateString('fr-FR')}</td>
                        <td className="p-2 border-r border-slate-200">{tx.title || "Versement pension"}</td>
                        <td className="p-2 text-center border-r border-slate-200">{tx.paymentMethod || 'Espèces'}</td>
                        <td className="p-2 text-right font-mono font-bold">{formatFCFA(tx.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                      <td colSpan={4} className="p-2 text-right uppercase text-[10px]">TOTAL CUMUL ENCAISSÉ :</td>
                      <td className="p-2 text-right font-mono text-xs text-emerald-800">{formatFCFA(totalPaidActive)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Legal Subtext & Official Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-[10px] items-end border-t border-slate-300">
                <div>
                  <p className="font-bold text-slate-800">Directeur Administratif & Financier</p>
                  <p className="text-slate-500 italic mt-8">Mentions légales & certification CFP-ITMC Douala</p>
                </div>

                <div className="text-right space-y-1">
                  <p className="font-bold text-slate-800">Visa & Cachet Caisse Principale</p>
                  <div className="h-12 border-2 border-blue-800 bg-blue-50/50 rounded flex items-center justify-center font-black text-[9px] text-blue-950 uppercase">
                    DIRECTION FINANCIÈRE • CAISSE CENTRALE
                  </div>
                  <p className="text-[8.5px] text-slate-500 font-mono">Fait à Douala, le {formattedDateNow}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
