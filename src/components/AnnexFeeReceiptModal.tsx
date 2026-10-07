import React, { useRef, useState } from 'react';
import { 
  Receipt, 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  FolderCheck, 
  Calendar, 
  User, 
  Hash, 
  BookOpen, 
  ShieldCheck, 
  QrCode, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { exportElementToPDF, printElementDirect } from '@/lib/pdfExport';
import { formatFCFA } from '@/utils/formatCurrency';
import { numberToFrenchWords } from '@/utils/frenchNumbers';
import { toast } from 'sonner';

export interface AnnexFeeReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: {
    receiptNumber: string;
    date: string;
    studentName: string;
    studentId?: string;
    matricule?: string;
    specialty?: string;
    feeName: string;
    feeCategory?: string;
    amount: number;
    paymentMethod: string;
    cashierName?: string;
    notes?: string;
  } | null;
}

export default function AnnexFeeReceiptModal({
  isOpen,
  onClose,
  receiptData
}: AnnexFeeReceiptModalProps) {
  const receiptPrintRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!receiptData) return null;

  const formattedDate = new Date(receiptData.date || Date.now()).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const amountInWords = numberToFrenchWords(Number(receiptData.amount) || 0);

  const handlePrint = () => {
    if (!receiptPrintRef.current) return;
    printElementDirect(receiptPrintRef.current, `Recu_Frais_Annexe_${receiptData.receiptNumber}`);
  };

  const handleDownloadPdf = async () => {
    if (!receiptPrintRef.current) return;
    try {
      setIsExporting(true);
      await exportElementToPDF(receiptPrintRef.current, `Recu_Frais_Annexe_${receiptData.receiptNumber}.pdf`, { scale: 2.2, quality: 1 });
      toast.success("Reçu de frais annexe téléchargé au format PDF !");
    } catch (e) {
      toast.error("Erreur lors de la génération du PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto p-0 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header Toolbar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
              <FolderCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900 dark:text-white">
                Reçu Officiel d'Encaissement Frais Annexes
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                N° {receiptData.receiptNumber} • Fiche de versement hors pension
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl font-bold text-xs h-9 px-3"
            >
              <Printer className="w-4 h-4 text-purple-600" />
              <span>Imprimer</span>
            </Button>
            <Button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              size="sm"
              className="gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 px-3.5 shadow-md shadow-purple-500/20"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? "Export PDF..." : "Télécharger PDF"}</span>
            </Button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Canvas */}
        <div className="p-6 bg-slate-100 dark:bg-slate-950 flex justify-center">
          <div
            ref={receiptPrintRef}
            id="printable-annex-receipt"
            className="w-full max-w-[620px] bg-white text-slate-900 font-sans p-7 rounded-2xl border-2 border-purple-900 shadow-xl space-y-5 text-xs relative overflow-hidden"
          >
            {/* Stamp Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <img
                src="/watermark-logo.png"
                alt=""
                className="w-[260px] max-w-[70%] h-auto opacity-[0.07] object-contain"
              />
            </div>

            {/* Header / Institutional Branding */}
            <div className="border-b-2 border-purple-950 pb-3 flex justify-between items-start">
              <div className="space-y-0.5">
                <h2 className="text-[11px] font-black uppercase text-purple-950 tracking-wide">RÉPUBLIQUE DU CAMEROUN</h2>
                <p className="text-[8px] text-slate-500 font-bold uppercase">Paix - Travail - Patrie</p>
                <p className="text-[9px] text-slate-900 font-extrabold uppercase mt-1">MINISTÈRE DE L'EMPLOI ET DE LA FORMATION PROFESSIONNELLE</p>
                <p className="text-[9px] text-purple-900 font-black">CENTRE DE FORMATION PROFESSIONNELLE CFP-ITMC DOUALA</p>
                <p className="text-[8px] text-slate-500">Logpom Carrefour Bassong • Tel: (+237) 683 66 32 22 / 688 05 20 94</p>
              </div>

              <div className="text-right space-y-1">
                <div className="px-2.5 py-1 bg-purple-950 text-white font-black text-[9px] uppercase rounded">
                  REÇU FRAIS ANNEXES & DOSSIERS
                </div>
                <p className="text-[9.5px] font-mono font-black text-purple-900">N° {receiptData.receiptNumber}</p>
                <p className="text-[8.5px] text-slate-500">{formattedDate}</p>
              </div>
            </div>

            {/* Receipt Title Banner */}
            <div className="text-center py-2 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-950">
                ATTESTATION DE VERSEMENT DE FRAIS ANNEXES & DIVERS
              </h3>
              <p className="text-[9px] font-bold text-slate-600 mt-0.5">
                Paiement indépendant non imputable sur la pension de scolarité
              </p>
            </div>

            {/* Details Table */}
            <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Apprenant(e) / Candidat(e) :</span>
                  <span className="font-black text-slate-900">{receiptData.studentName}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Matricule / Identifiant :</span>
                  <span className="font-mono font-bold text-purple-900">{receiptData.matricule || receiptData.studentId || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] pt-1 border-t border-slate-200">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Filière / Spécialité DQP :</span>
                  <span className="font-bold text-slate-800">{receiptData.specialty || 'Formation Professionnelle'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Mode de Règlement :</span>
                  <span className="font-bold text-emerald-800">{receiptData.paymentMethod || 'Espèces / Caisse'}</span>
                </div>
              </div>
            </div>

            {/* Fee Nature & Amount Highlight */}
            <div className="p-4 rounded-xl bg-purple-900 text-white space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold uppercase text-purple-200 block">Nature du Frais Encaissé :</span>
                  <span className="text-sm font-black text-amber-300">{receiptData.feeName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase text-purple-200 block">Montant Versé :</span>
                  <span className="text-lg font-black text-white">{formatFCFA(receiptData.amount)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-800 text-[10px] italic text-purple-100">
                Arrêté le présent reçu à la somme de : <strong className="text-white not-italic uppercase font-bold">{amountInWords} Francs CFA</strong>.
              </div>
            </div>

            {/* Note / Observation */}
            {receiptData.notes && (
              <div className="text-[10px] text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200">
                <strong>Observation :</strong> {receiptData.notes}
              </div>
            )}

            {/* Footer Signatures & QR Code */}
            <div className="pt-2 grid grid-cols-3 gap-3 items-end border-t border-slate-200 text-[9px]">
              <div className="space-y-1">
                <p className="font-bold text-slate-800">L'Apprenant / Déposant</p>
                <div className="h-10 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 text-[8px]">
                  Signature
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 mx-auto bg-slate-100 border border-slate-300 rounded p-1 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-purple-950" />
                </div>
                <p className="text-[7.5px] text-slate-500 font-mono">AUTHENTICITÉ CFP-ITMC</p>
              </div>

              <div className="text-right space-y-1">
                <p className="font-bold text-slate-800">Agent de Caisse ITMC</p>
                <p className="text-purple-900 font-black">{receiptData.cashierName || 'Caisse Principale'}</p>
                <div className="h-8 border-2 border-purple-900 rounded bg-purple-50 flex items-center justify-center font-black text-[8px] text-purple-950 uppercase">
                  TAMPON CAISSE ACCREDITÉ
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
