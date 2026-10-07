import React, { useState, useMemo, useEffect } from 'react';
import { 
  FolderCheck, 
  Sparkles, 
  User, 
  BookOpen, 
  DollarSign, 
  CreditCard, 
  Check, 
  Settings2, 
  ShieldCheck, 
  FileText, 
  Plus, 
  RefreshCw,
  Search,
  CheckCircle2,
  Trash2,
  Settings,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ModernSelect } from '@/components/ui/select';
import { defaultSpecialties } from '@/data/specialtiesData';
import { formatFCFA } from '@/utils/formatCurrency';
import { toast } from 'sonner';

export interface DefaultAnnexFeeType {
  id: string;
  name: string;
  category: string;
  defaultAmount: number;
  description: string;
}

interface EncaissementFraisAnnexesModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentsList: any[];
  onSuccess: (receiptData: any) => void;
}

export default function EncaissementFraisAnnexesModal({
  isOpen,
  onClose,
  studentsList,
  onSuccess
}: EncaissementFraisAnnexesModalProps) {
  const [activeTab, setActiveTab] = useState<'encaissement' | 'config'>('encaissement');
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [savingTypes, setSavingTypes] = useState(false);

  // Loaded dynamic list from database
  const [feeTypes, setFeeTypes] = useState<DefaultAnnexFeeType[]>([]);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [customStudentName, setCustomStudentName] = useState<string>('');
  const [customMatricule, setCustomMatricule] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('Génie Logiciel');
  const [selectedFeeTypeId, setSelectedFeeTypeId] = useState<string>('');
  const [customFeeName, setCustomFeeName] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Espèces / Caisse');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load fee types from server on open
  const loadFeeTypes = async () => {
    try {
      setLoadingTypes(true);
      const res = await fetch('/api/caisse/annex-fee-types');
      if (res.ok) {
        const data = await res.json();
        setFeeTypes(data);
        if (data.length > 0 && !selectedFeeTypeId) {
          setSelectedFeeTypeId(data[0].id);
          setAmount(data[0].defaultAmount);
        }
      }
    } catch (err) {
      console.error("Error loading annex fee types:", err);
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFeeTypes();
    }
  }, [isOpen]);

  // Filter students for search dropdown
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return studentsList.slice(0, 8);
    const q = studentSearch.toLowerCase().trim();
    return studentsList.filter(s => 
      s.name?.toLowerCase().includes(q) ||
      s.matricule?.toLowerCase().includes(q) ||
      s.specialty?.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [studentsList, studentSearch]);

  const handleSelectStudent = (std: any) => {
    setSelectedStudentId(std.id);
    setCustomStudentName(std.name);
    setCustomMatricule(std.matricule || std.id);
    if (std.specialty) setSelectedSpecialty(std.specialty);
    setStudentSearch(std.name);
  };

  const handleFeeTypeChange = (typeId: string) => {
    setSelectedFeeTypeId(typeId);
    if (typeId !== 'custom') {
      const targetFee = feeTypes.find(f => f.id === typeId);
      if (targetFee) {
        setAmount(targetFee.defaultAmount);
      }
    } else {
      setAmount(0);
    }
  };

  // Save updated list of fee types to the backend
  const handleSaveFeeConfig = async () => {
    // Validate list
    const hasEmptyName = feeTypes.some(f => !f.name.trim());
    if (hasEmptyName) {
      toast.error("Le nom de chaque frais annexe doit être renseigné.");
      return;
    }

    try {
      setSavingTypes(true);
      const res = await fetch('/api/caisse/annex-fee-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feeTypes)
      });
      if (res.ok) {
        toast.success("La configuration des frais annexes a été enregistrée avec succès !");
        setActiveTab('encaissement');
      } else {
        toast.error("Échec de l'enregistrement de la configuration.");
      }
    } catch (err) {
      toast.error("Erreur serveur lors de la sauvegarde.");
    } finally {
      setSavingTypes(false);
    }
  };

  const handleAddNewType = () => {
    const newId = `frais_annexe_${Date.now()}`;
    const newType: DefaultAnnexFeeType = {
      id: newId,
      name: "Nouveau Frais Annexe",
      category: "Divers",
      defaultAmount: 10000,
      description: "Description de ce frais annexe personnalisé"
    };
    setFeeTypes([...feeTypes, newType]);
    toast.success("Nouvel élément ajouté au formulaire ! Vous pouvez maintenant modifier son titre et son prix.");
  };

  const handleDeleteType = (id: string) => {
    setFeeTypes(feeTypes.filter(f => f.id !== id));
    toast.info("Élément retiré de la liste.");
  };

  const handleFieldChange = (id: string, field: keyof DefaultAnnexFeeType, value: any) => {
    setFeeTypes(feeTypes.map(f => {
      if (f.id === id) {
        return { ...f, [field]: value };
      }
      return f;
    }));
  };

  const handleSubmitEncaissement = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = customStudentName.trim() || studentSearch.trim();
    if (!finalName) {
      toast.error("Veuillez saisir le nom de l'apprenant ou du candidat.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Le montant du frais annexe doit être supérieur à 0 FCFA.");
      return;
    }

    const feeObj = feeTypes.find(f => f.id === selectedFeeTypeId);
    const finalFeeName = selectedFeeTypeId === 'custom' ? customFeeName.trim() || 'Frais Annexe Divers' : (feeObj?.name || 'Frais Annexe');

    try {
      setIsSubmitting(true);
      const payload = {
        amount: Number(amount),
        category: 'frais_annexes',
        isAnnexFee: true,
        feeTypeId: selectedFeeTypeId,
        feeName: finalFeeName,
        title: `Frais Annexe : ${finalFeeName}`,
        studentId: selectedStudentId || undefined,
        studentName: finalName,
        matricule: customMatricule || 'CANDIDAT',
        specialty: selectedSpecialty,
        paymentMethod,
        notes: notes.trim() || `Encaissement ${finalFeeName} (${selectedSpecialty})`,
        recordedBy: 'Caisse Principale'
      };

      const res = await fetch('/api/caisse/encaissement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Frais annexe de ${formatFCFA(amount)} encaissé avec succès !`);
        
        onSuccess({
          receiptNumber: data.transaction?.receiptNumber || `REC-ANNEX-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString(),
          studentName: finalName,
          studentId: selectedStudentId,
          matricule: customMatricule,
          specialty: selectedSpecialty,
          feeName: finalFeeName,
          amount: Number(amount),
          paymentMethod,
          cashierName: 'Caisse Principale ITMC',
          notes: notes.trim()
        });

        onClose();
      } else {
        toast.error(data.error || "Échec de l'encaissement du frais annexe.");
      }
    } catch (err) {
      toast.error("Erreur serveur lors de l'enregistrement de l'encaissement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] sm:max-w-4xl max-h-[92vh] overflow-hidden p-0 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-purple-300">
              <FolderCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-black text-white">
                  Frais Annexes, Dossiers & Droits d'Examens
                </DialogTitle>
                <Badge className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-black uppercase">
                  Hors Pension
                </Badge>
              </div>
              <DialogDescription className="text-xs text-purple-200/90 mt-0.5">
                Gérez librement les libellés, tarifs par défaut et encaissements des frais administratifs indépendants de la pension.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={() => setActiveTab('encaissement')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'encaissement'
                  ? 'bg-white text-purple-950 shadow-md'
                  : 'text-purple-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              Encaissement
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'config'
                  ? 'bg-white text-purple-950 shadow-md'
                  : 'text-purple-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              Config Tarifs & Libellés
            </button>
          </div>
        </div>

        {/* Form Body */}
        {activeTab === 'encaissement' ? (
          <form onSubmit={handleSubmitEncaissement} className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50 dark:bg-slate-900/40">
            {/* Search Student or Enter Candidate */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Sélection de l'Apprenant(e) ou du Candidat(e) *
              </Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom, matricule ou tapez un nouveau nom..."
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setCustomStudentName(e.target.value);
                  }}
                  className="pl-9 rounded-xl h-11 text-xs font-bold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              {/* Student Dropdown Results */}
              {studentSearch && filteredStudents.length > 0 && (
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-h-36 overflow-y-auto space-y-1 text-xs shadow-lg">
                  {filteredStudents.map(std => (
                    <div
                      key={std.id}
                      onClick={() => handleSelectStudent(std)}
                      className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 cursor-pointer flex items-center justify-between font-medium transition-all"
                    >
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white">{std.name}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({std.specialty})</span>
                      </div>
                      <span className="font-mono text-[10px] text-purple-800 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full">{std.matricule || std.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specialty & Fee Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Filière / Spécialité DQP *
                </Label>
                <ModernSelect
                  dropdownTitle="Filière / Spécialité DQP"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800"
                >
                  {defaultSpecialties.map(spec => (
                    <option key={spec.id} value={spec.name}>
                      🎓 {spec.name}
                    </option>
                  ))}
                </ModernSelect>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Choisir la Nature du Frais Annexe *
                </Label>
                <ModernSelect
                  dropdownTitle="Nature du Frais Annexe"
                  value={selectedFeeTypeId}
                  onChange={(e) => handleFeeTypeChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-purple-200 dark:border-purple-800 text-xs font-black bg-purple-50/50 dark:bg-purple-950/20 text-purple-950 dark:text-purple-200"
                >
                  {feeTypes.map(fee => (
                    <option key={fee.id} value={fee.id}>
                      💳 {fee.name} — {formatFCFA(fee.defaultAmount)}
                    </option>
                  ))}
                  <option value="custom">✨ Autre Frais Annexe Personnalisé...</option>
                </ModernSelect>
              </div>
            </div>

            {/* Custom Fee Name if applicable */}
            {selectedFeeTypeId === 'custom' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Libellé du Frais Personnalisé *
                </Label>
                <Input
                  placeholder="Ex: Frais de Duplicata d'Attestation, Kit de Travaux Pratiques..."
                  value={customFeeName}
                  onChange={(e) => setCustomFeeName(e.target.value)}
                  className="rounded-xl h-11 text-xs font-bold bg-white dark:bg-slate-800"
                />
              </div>
            )}

            {/* Amount & Payment Method Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Montant à Encaisser (FCFA) *
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="rounded-xl h-11 text-base font-black text-purple-900 dark:text-purple-300 pr-16 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    FCFA
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Mode de Règlement *
                </Label>
                <ModernSelect
                  dropdownTitle="Mode de Règlement"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800"
                >
                  <option value="Espèces / Caisse">💵 Espèces / Caisse Principale</option>
                  <option value="Orange Money (OM)">🟠 Orange Money (OM)</option>
                  <option value="MTN Mobile Money (MoMo)">🟡 MTN Mobile Money (MoMo)</option>
                  <option value="Virement Bancaire">🏦 Virement Bancaire</option>
                  <option value="Chèque">📄 Chèque Certifié</option>
                </ModernSelect>
              </div>
            </div>

            {/* Notes / Observations */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Observation / Référence du Règlement
              </Label>
              <Input
                placeholder="Ex: Dossier MINEFOP complet transmis le 30/09..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl h-10 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Information Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-extrabold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Règle de Gestion Financière ITMC :</span>
              </p>
              <p className="text-[10.5px]">
                Ce versement sera enregistré comme un <strong>Frais Annexe Administrateur</strong>. Il générera un reçu officiel dédié et n'aura aucun impact sur la pension de scolarité annuelle de l'apprenant.
              </p>
            </div>

            <DialogFooter className="pt-3 gap-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl text-xs font-bold h-11 px-5"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !customStudentName.trim() || !amount}
                className="rounded-xl text-xs bg-purple-600 hover:bg-purple-700 text-white font-extrabold h-11 px-6 shadow-lg shadow-purple-500/25 gap-2"
              >
                {isSubmitting ? (
                  <span>Enregistrement...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valider Encaissement & Imprimer Reçu</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Configuration View for Super Admin */
          <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col">
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <Settings className="w-4 h-4" />
                  <span>Gestion Personnalisée de l'offre Administrative</span>
                </p>
                <p className="text-[10.5px] text-purple-950/80 dark:text-purple-200/90 leading-relaxed">
                  Ajoutez de nouvelles catégories de frais ou modifiez les libellés et les tarifs par défaut. Les secrétaires et agents de caisse verront instantanément cette liste mise à jour lors des encaissements.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleAddNewType}
                className="rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-extrabold text-xs h-10 px-4 gap-1.5 shadow-md shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Frais</span>
              </Button>
            </div>

            {loadingTypes ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mb-2" />
                <span className="text-xs font-semibold">Chargement des éléments...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 flex-1">
                {feeTypes.map((fee, idx) => (
                  <div 
                    key={fee.id} 
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm hover:shadow transition-all space-y-3 relative group"
                  >
                    {/* Input Header for Title */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="w-full space-y-1">
                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nom de l'élément / Libellé officiel</Label>
                        <Input
                          type="text"
                          value={fee.name}
                          onChange={(e) => handleFieldChange(fee.id, 'name', e.target.value)}
                          className="rounded-xl h-10 text-xs font-bold w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-purple-500 text-slate-900 dark:text-white"
                          placeholder="Ex: Frais d'Uniforme de Spécialité..."
                        />
                      </div>

                      <div className="w-full sm:w-44 space-y-1 shrink-0">
                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Montant d'Encaissement</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={fee.defaultAmount}
                            onChange={(e) => handleFieldChange(fee.id, 'defaultAmount', Number(e.target.value))}
                            className="rounded-xl h-10 text-xs font-black text-right bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-purple-900 dark:text-purple-300 pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">FCFA</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteType(fee.id)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shrink-0 self-end mb-0.5 sm:mb-0"
                        title="Supprimer ce frais"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Description Input for Subtext */}
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Description explicative ou d'orientation</Label>
                      <Input
                        type="text"
                        value={fee.description}
                        onChange={(e) => handleFieldChange(fee.id, 'description', e.target.value)}
                        className="rounded-xl h-9 text-[11px] bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 text-slate-500"
                        placeholder="Courte description de ce frais..."
                      />
                    </div>
                  </div>
                ))}

                {feeTypes.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
                    <p className="text-xs font-semibold">Aucun type de frais annexe configuré.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Cliquez sur « Ajouter un Frais » ci-dessus pour commencer.</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('encaissement')}
                className="rounded-xl text-xs font-bold h-11 px-5"
              >
                Retour
              </Button>
              <Button
                type="button"
                onClick={handleSaveFeeConfig}
                disabled={savingTypes || feeTypes.length === 0}
                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs h-11 px-6 shadow-lg shadow-purple-500/25 gap-2 cursor-pointer"
              >
                {savingTypes ? (
                  <span>Sauvegarde en cours...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Enregistrer la Configuration</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
