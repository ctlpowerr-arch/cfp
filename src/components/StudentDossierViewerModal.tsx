import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Printer, 
  ExternalLink, 
  User, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  CreditCard,
  X,
  Award,
  Users,
  Upload,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFCFA } from "@/utils/formatCurrency";
import { toast } from 'sonner';

interface StudentDossierViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onRefreshStudent?: () => void;
}

const DOCUMENT_LABELS: Record<string, { label: string; desc: string }> = {
  birthCertificate: {
    label: "Acte de Naissance Certifié",
    desc: "Copie légalisée par l'autorité municipale / préfectorale"
  },
  diploma: {
    label: "Diplôme / Relevé d'Entrée",
    desc: "Baccalauréat, Probatoire, BTS ou GCE A-Level"
  },
  cni: {
    label: "Photocopie CNI / Passeport",
    desc: "Carte Nationale d'Identité ou récépissé en cours de validité"
  },
  photo: {
    label: "Photos d'Identité 4x4",
    desc: "2 exemplaires couleur sur fond blanc"
  },
  medicalCertificate: {
    label: "Certificat Médical d'Aptitude",
    desc: "Délivré par un médecin assermenté / hôpital public"
  },
  tuitionReceipt: {
    label: "Reçu de Paiement Scolarité",
    desc: "Versement de l'acompte ou de l'intégralité des frais"
  },
  commitmentForm: {
    label: "Fiche d'Engagement & Règlement",
    desc: "Signée par l'étudiant et son répondant légal"
  }
};

export default function StudentDossierViewerModal({
  isOpen,
  onClose,
  student,
  onRefreshStudent
}: StudentDossierViewerModalProps) {
  if (!student) return null;

  const [localDocs, setLocalDocs] = useState<Record<string, string>>(student.documents || {});
  const [localChecklist, setLocalChecklist] = useState<Record<string, boolean>>(student.documentsChecklist || {});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const checklist = localChecklist;
  const documents = localDocs;
  const guardian = student.guardian || {};
  const fees = student.fees || {};

  const totalRequired = 7;
  const verifiedCount = Object.keys(DOCUMENT_LABELS).filter(k => checklist[k] || !!documents[k]).length;
  const isComplete = verifiedCount === totalRequired;

  const handleFileUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 12 Mo.");
      return;
    }

    try {
      setUploadingKey(key);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const updatedDocs = { ...localDocs, [key]: base64 };
        const updatedChecklist = { ...localChecklist, [key]: true };

        const res = await fetch(`/api/students/${student.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documents: updatedDocs,
            documentsChecklist: updatedChecklist
          })
        });

        if (res.ok) {
          setLocalDocs(updatedDocs);
          setLocalChecklist(updatedChecklist);
          toast.success(`Pièce '${DOCUMENT_LABELS[key]?.label || key}' conservée dans le dossier !`);
          if (onRefreshStudent) onRefreshStudent();
        } else {
          toast.error("Échec de l'enregistrement du document.");
        }
        setUploadingKey(null);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Erreur lors de la lecture de la pièce.");
      setUploadingKey(null);
    }
  };

  const handleDeleteDoc = async (key: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer la pièce '${DOCUMENT_LABELS[key]?.label || key}' de ce dossier ?`)) {
      return;
    }

    try {
      setUploadingKey(key);
      const updatedDocs = { ...localDocs };
      delete updatedDocs[key];
      const updatedChecklist = { ...localChecklist, [key]: false };

      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: updatedDocs,
          documentsChecklist: updatedChecklist
        })
      });

      if (res.ok) {
        setLocalDocs(updatedDocs);
        setLocalChecklist(updatedChecklist);
        toast.success(`Pièce supprimée du dossier !`);
        if (onRefreshStudent) onRefreshStudent();
      } else {
        toast.error("Échec de la suppression.");
      }
    } catch (err) {
      toast.error("Erreur de communication avec le serveur.");
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-4xl max-h-[92vh] overflow-hidden p-0 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold text-[10px] uppercase">
                  Dossier d'Inscription MINEFOP
                </Badge>
                <span className="text-xs text-slate-400">Matricule : {student.matricule || student.id}</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-white mt-1">
                {student.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Filière : {student.specialty} • Classe : {student.classCode || student.promo || 'G1'}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5 rounded-xl text-xs font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer Dossier
            </Button>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isComplete 
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40' 
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40'
          }`}>
            <div className="flex items-center gap-3">
              <ShieldCheck className={`w-6 h-6 ${isComplete ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Conformité Administrative du Dossier ({verifiedCount} sur {totalRequired} pièces vérifiées)
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isComplete 
                    ? "Dossier 100% complet et éligible pour l'examen national du DQP MINEFOP." 
                    : "Certaines pièces obligatoires sont en attente de dépôt au secrétariat."}
                </p>
              </div>
            </div>
            <Badge className={`font-black text-xs px-3 py-1 ${
              isComplete ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              {isComplete ? "Dossier Conforme" : "Dossier Incomplet"}
            </Badge>
          </div>

          {/* Identity & Academic Details Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-500" /> Informations Civiles & Candidat
              </h5>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500">Nom Complet:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500">Date & Lieu Naissance:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {student.birthDate || 'Non spécifié'} à {student.birthPlace || 'Douala'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500">Genre / Nationalité:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {student.gender === 'F' ? 'Féminin' : 'Masculin'} • {student.nationality || 'Camerounaise'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500">Téléphone:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{student.email}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-purple-500" /> Inscription Pédagogique
              </h5>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500">Filière DQP:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.specialty}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500">Classe / Promotion:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.classCode || student.promo || 'G1'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500">Créneau Horaire:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.timeSlot || 'Cours du Jour'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500">Année Académique:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.academicYear || '2026-2027'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Statut Admission:</span>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-bold text-[10px]">
                    {student.status || 'Inscrit & Confirmé'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* 7 MINEFOP Regulatory Documents List */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
              <span>Pièces Justificatives Numérisées</span>
              <span className="text-blue-600 font-bold">{verifiedCount} Validées</span>
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(DOCUMENT_LABELS).map(([key, meta]) => {
                const isProvided = !!checklist[key] || !!documents[key];
                const docUrl = documents[key];

                return (
                  <div
                    key={key}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                      isProvided 
                        ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10' 
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isProvided 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' 
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                      }`}>
                        {isProvided ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{meta.label}</p>
                        <p className="text-[10px] text-slate-400">{meta.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge 
                        variant="outline"
                        className={`text-[9px] font-bold border-none ${
                          isProvided 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}
                      >
                        {isProvided ? 'Fourni' : 'Manquant'}
                      </Badge>

                      {/* View / Download button */}
                      {docUrl && (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Télécharger / Aperçu"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Upload / Replace button */}
                      <label className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors" title={isProvided ? "Remplacer le document" : "Joindre un document (Image / PDF)"}>
                        {uploadingKey === key ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(key, e)}
                        />
                      </label>

                      {/* Delete button */}
                      {isProvided && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(key)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Supprimer la pièce du dossier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guardian & Financial Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-amber-500" /> Tuteur Légal & Contact d'Urgence
              </h5>
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">{guardian.name || 'Non renseigné'}</p>
                <p className="text-slate-500">Lien : {guardian.relation || 'Parent'}</p>
                <p className="text-slate-500">Téléphone : {guardian.phone || 'Non renseigné'}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Situation Financière
              </h5>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Frais Annuels :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatFCFA(fees.total || 350000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Montant Versé :</span>
                  <span className="font-bold text-emerald-600">{formatFCFA(fees.paid || 150000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reste à Payer :</span>
                  <span className="font-bold text-amber-600">
                    {formatFCFA(Math.max(0, Number(fees.total || 350000) - Number(fees.paid || 150000)))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <p className="text-[11px] text-slate-400 font-medium">
            CFP-ITMC Douala Logpom • Enregistrement officiel sous agrément MINEFOP
          </p>
          <Button onClick={onClose} className="rounded-xl px-6 font-bold">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
