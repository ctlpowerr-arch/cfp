import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  User, 
  BookOpen, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Building2, 
  CreditCard, 
  Clock, 
  Sparkles, 
  Check, 
  X,
  FileCheck,
  Eye,
  RefreshCw,
  Award,
  Users,
  Hash
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  generateOfficialMatricule, 
  decomposeMatricule, 
  SPECIALTY_MATRICULE_REGISTRY,
  findSpecialtyMeta
} from '@/utils/matriculeEngine';
import { toast } from 'sonner';

interface ManualStudentAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentCreated: () => void;
  classesList?: any[];
  defaultAcademicYear?: string;
}

const SPECIALTIES_LIST = SPECIALTY_MATRICULE_REGISTRY.map(s => s.name);

export default function ManualStudentAdmissionModal({
  isOpen,
  onClose,
  onStudentCreated,
  classesList = [],
  defaultAcademicYear = "2026-2027"
}: ManualStudentAdmissionModalProps) {
  const [currentTab, setCurrentTab] = useState<'identity' | 'academic' | 'documents' | 'guardian'>('identity');
  const [submitting, setSubmitting] = useState(false);

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

  // Form State
  const [formData, setFormData] = useState({
    // Identity
    name: '',
    birthDate: '2004-05-15',
    birthPlace: 'Douala',
    gender: 'M',
    nationality: 'Camerounaise',
    address: 'Douala - Logpom (Carrefour Bassong)',
    phone: '+237 ',
    email: '',
    avatar: '',

    // Academic
    specialty: 'Génie Logiciel',
    promo: 'G1',
    classCode: 'G1-GL',
    timeSlot: 'Cours du Jour (08h00 - 14h00)',
    matricule: generateOfficialMatricule({
      studentName: 'Étudiant',
      specialty: 'Génie Logiciel',
      academicYear: defaultAcademicYear,
      orderNumber: 1
    }),
    academicYear: defaultAcademicYear,
    status: 'Inscrit',
    entryDegree: 'Baccalauréat Scientifique / Technique',

    // Guardian
    guardianName: '',
    guardianPhone: '+237 ',
    guardianRelation: 'Père',
    guardianProfession: 'Cadre / Fonctionnaire',

    // Financial
    totalTuition: 350000,
    paidAmount: 150000,
    paymentMethod: 'Espèces / Caisse Principale',
    paymentDate: new Date().toISOString().split('T')[0],

    // Observations
    observations: 'Dossier d\'inscription validé et complet conforme aux normes DQP MINEFOP.'
  });

  // Documents checklist state & uploaded files (All start unsubmitted for candidate file import)
  const [documentsData, setDocumentsData] = useState<{
    [key: string]: { name: string; submitted: boolean; fileUrl: string; date: string; size: string };
  }>({
    diploma: {
      name: "Diplôme Requis (Baccalauréat / Probatoire / GCE)",
      submitted: false,
      fileUrl: "",
      date: "",
      size: ""
    },
    birthCertificate: {
      name: "Acte de Naissance (Copie Légalisée)",
      submitted: false,
      fileUrl: "",
      date: "",
      size: ""
    },
    cni: {
      name: "CNI / Document d'Identité ou Récépissé",
      submitted: false,
      fileUrl: "",
      date: "",
      size: ""
    },
    medicalCertificate: {
      name: "Certificat Médical d'Aptitude Physique",
      submitted: false,
      fileUrl: "",
      date: "",
      size: ""
    },
    photo: {
      name: "Photos d'Identité (Format 4x4 Couleur)",
      submitted: false,
      fileUrl: "",
      date: "",
      size: ""
    },
    commitmentForm: {
      name: "Fiche d'Engagement Règlement Signée",
      submitted: false,
      fileUrl: "",
      date: "",
      size: ""
    }
  });

  const toggleDocumentSubmitted = (docKey: string) => {
    setDocumentsData(prev => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        submitted: !prev[docKey].submitted
      }
    }));
  };

  const handleSimulateFileUpload = (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = () => {
        setDocumentsData(prev => {
          const docName = prev[docKey]?.name || "Document";
          toast.success(`Document "${docName}" importé avec succès !`);
          return {
            ...prev,
            [docKey]: {
              ...prev[docKey],
              submitted: true,
              fileUrl: typeof reader.result === 'string' ? reader.result : prev[docKey].fileUrl,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              date: new Date().toLocaleDateString('fr-FR')
            }
          };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const regenerateMatricule = (specialtyName?: string) => {
    const spec = specialtyName || formData.specialty || 'Génie Logiciel';
    const newMat = generateOfficialMatricule({
      studentName: formData.name || 'Étudiant',
      specialty: spec,
      academicYear: formData.academicYear || defaultAcademicYear,
      orderNumber: Math.floor(1 + Math.random() * 99)
    });
    setFormData(prev => ({ ...prev, matricule: newMat }));
    toast.success(`Nouveau matricule officiel généré : ${newMat}`);
  };

  const handleNameChange = (name: string) => {
    const cleanName = name;
    let suggestedEmail = formData.email;
    if (name.trim().length > 3) {
      const parts = name.trim().toLowerCase().split(/\s+/);
      if (parts.length >= 2) {
        suggestedEmail = `${parts[0]}.${parts[1]}@itmc-it.cm`.replace(/[^a-z0-9.@-]/g, '');
      } else {
        suggestedEmail = `${parts[0]}@itmc-it.cm`.replace(/[^a-z0-9.@-]/g, '');
      }
    }
    setFormData(prev => ({
      ...prev,
      name: cleanName,
      email: suggestedEmail
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error("Veuillez renseigner le nom complet de l'étudiant.");
      setCurrentTab('identity');
      return;
    }

    setSubmitting(true);
    try {
      // Build documents payload
      const docsObj: Record<string, string> = {};
      const docsChecklistObj: Record<string, boolean> = {};

      Object.entries(documentsData).forEach(([key, val]) => {
        docsObj[key] = val.submitted ? val.fileUrl : "";
        docsChecklistObj[key] = val.submitted;
      });

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        specialty: formData.specialty,
        promo: formData.promo,
        classCode: formData.classCode || formData.promo,
        department: "Informatique & Numérique",
        gender: formData.gender,
        birthDate: formData.birthDate,
        birthPlace: formData.birthPlace,
        nationality: formData.nationality,
        address: formData.address,
        timeSlot: formData.timeSlot,
        matricule: formData.matricule,
        academicYear: formData.academicYear,
        status: formData.status,
        entryDegree: formData.entryDegree,
        guardian: {
          name: formData.guardianName,
          phone: formData.guardianPhone,
          relation: formData.guardianRelation,
          profession: formData.guardianProfession
        },
        fees: {
          total: Number(formData.totalTuition) || 350000,
          paid: 0,
          paymentMethod: 'Aucun (Géré en Caisse)',
          paymentDate: ''
        },
        documents: docsObj,
        documentsChecklist: docsChecklistObj,
        observations: formData.observations,
        admissionDate: new Date().toISOString().split('T')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name.trim())}`
      };

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Étudiant ${formData.name} inscrit avec succès ! Dossier complet généré et validé.`);
        onStudentCreated();
        onClose();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Échec de l'enregistrement de l'étudiant.");
      }
    } catch (err) {
      console.error("Manual student creation error:", err);
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalSubmittedDocs = Object.values(documentsData).filter(d => d.submitted).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-4xl max-h-[94vh] overflow-hidden p-0 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white border-b border-blue-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30 font-black text-[9px] uppercase tracking-wider">
                    Admission Directe & DQP
                  </Badge>
                  <span className="text-xs text-slate-400">• Matricule : {formData.matricule}</span>
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-black text-white mt-1">
                  Inscription Manuelle de l'Étudiant & Dossier Complet
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300">
                  Enregistrez un apprenant avec toutes ses informations civiles, académiques et ses pièces justificatives MINEFOP.
                </DialogDescription>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Tabs Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/10">
            {[
              { key: 'identity', label: '1. État Civil & Identité', icon: User },
              { key: 'academic', label: '2. Cursus & Filière', icon: GraduationCap },
              { key: 'documents', label: `3. Dossier Numérique (${totalSubmittedDocs}/6)`, icon: FileCheck },
              { key: 'guardian', label: '4. Tuteur & Validation', icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setCurrentTab(tab.key as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {/* TAB 1: IDENTITY */}
            {currentTab === 'identity' && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Renseignez l'état civil certifié de l'apprenant tel qu'il figure sur son acte de naissance officiel.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nom & Prénom(s) Complets *</Label>
                    <Input 
                      required
                      placeholder="Ex: NKOUE MOUSSI Patrick Junior"
                      value={formData.name}
                      onChange={e => handleNameChange(e.target.value)}
                      className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Date de Naissance *</Label>
                    <Input 
                      type="date"
                      required
                      value={formData.birthDate}
                      onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lieu de Naissance *</Label>
                    <Input 
                      required
                      placeholder="Ex: Douala"
                      value={formData.birthPlace}
                      onChange={e => setFormData({ ...formData, birthPlace: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Genre *</Label>
                    <Select value={formData.gender} onValueChange={v => setFormData({ ...formData, gender: v })}>
                      <SelectTrigger className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="M">Masculin (M)</SelectItem>
                        <SelectItem value="F">Féminin (F)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nationalité</Label>
                    <Input 
                      placeholder="Camerounaise"
                      value={formData.nationality}
                      onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Téléphone Mobile (WhatsApp) *</Label>
                    <Input 
                      required
                      placeholder="+237 699 00 00 00"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Email Institutionnel / Personnel *</Label>
                    <Input 
                      type="email"
                      required
                      placeholder="nom.prenom@itmc-it.cm"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Adresse Résidentielle (Quartier Douala)</Label>
                    <Input 
                      placeholder="Douala - Logpom (Carrefour Bassong / Cité des Palmiers)"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: ACADEMIC */}
            {currentTab === 'academic' && (
              <motion.div
                key="academic"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-purple-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Affectation Académique & Filière DQP</h4>
                      <p className="text-[11px] text-slate-500">Sélectionnez la filière d'apprentissage et la promotion correspondante.</p>
                    </div>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => regenerateMatricule()} className="gap-1.5 text-xs font-bold rounded-xl">
                    <RefreshCw className="w-3.5 h-3.5" /> Régénérer Matricule
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Filière / Spécialité DQP *</Label>
                    <Select 
                      value={formData.specialty} 
                      onValueChange={v => {
                        setFormData(prev => ({ 
                          ...prev, 
                          specialty: v,
                          matricule: generateOfficialMatricule({
                            studentName: prev.name || 'Étudiant',
                            specialty: v,
                            academicYear: prev.academicYear || defaultAcademicYear,
                            orderNumber: Math.floor(1 + Math.random() * 50)
                          })
                        }));
                      }}
                    >
                      <SelectTrigger className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-[260px]">
                        {SPECIALTIES_LIST.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Classe / Promotion *</Label>
                    <Select 
                      value={formData.promo} 
                      onValueChange={v => setFormData({ ...formData, promo: v, classCode: v })}
                    >
                      <SelectTrigger className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {uniqueClassOptions.map(cls => (
                          <SelectItem key={`adm_cls_${cls.code}`} value={cls.code}>
                            {cls.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Numéro Matricule Officiel MINEFOP</Label>
                      <button
                        type="button"
                        onClick={() => regenerateMatricule()}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Auto
                      </button>
                    </div>
                    <Input 
                      required
                      value={formData.matricule}
                      onChange={e => setFormData({ ...formData, matricule: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-mono font-bold bg-slate-50 dark:bg-slate-800/50 text-blue-600 dark:text-blue-400"
                    />
                    <p className="text-[9.5px] text-slate-400">
                      Structure MINEFOP : [N°Filière][ITMC][Session][Code][Rang A-Z] (Modifiable par l'Admin)
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Créneau Horaire / Régime de Cours</Label>
                    <Select value={formData.timeSlot} onValueChange={v => setFormData({ ...formData, timeSlot: v })}>
                      <SelectTrigger className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Cours du Jour (08h00 - 14h00)">Cours du Jour (08h00 - 14h00)</SelectItem>
                        <SelectItem value="Cours du Soir (17h00 - 21h00)">Cours du Soir (17h00 - 21h00)</SelectItem>
                        <SelectItem value="Cours du Samedi / Professionnels">Cours du Samedi / Professionnels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Diplôme Requis à l'Entrée</Label>
                    <Input 
                      placeholder="Ex: Baccalauréat C / D / TI ou GCE A/L"
                      value={formData.entryDegree}
                      onChange={e => setFormData({ ...formData, entryDegree: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Statut Initial</Label>
                    <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                      <SelectTrigger className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Inscrit">Inscrit (Confirmé)</SelectItem>
                        <SelectItem value="Actif">Actif</SelectItem>
                        <SelectItem value="En attente de paiement">En attente de paiement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Année Académique</Label>
                    <Input 
                      value={formData.academicYear}
                      onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: DOCUMENTS & PIÈCES JUSTIFICATIVES MINEFOP */}
            {currentTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Dossier Réglementaire DQP MINEFOP ({totalSubmittedDocs} sur 6 pièces fournies)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Cochez et joignez les pièces justificatives numérisées du candidat pour valider son dossier officiel.
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-black text-xs px-3 py-1">
                    {totalSubmittedDocs === 6 ? "Dossier 100% Conforme" : `${totalSubmittedDocs}/6 Reçu(s)`}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {Object.entries(documentsData).map(([key, doc]) => (
                    <div 
                      key={key} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        doc.submitted 
                          ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20' 
                          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleDocumentSubmitted(key)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                              doc.submitted 
                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                            }`}
                          >
                            {doc.submitted && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </button>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{doc.name}</p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {doc.submitted ? `Numérisé • ${doc.size}` : "Non encore fourni"}
                            </span>
                          </div>
                        </div>

                        <Badge 
                          variant="outline" 
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border-none ${
                            doc.submitted 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                          }`}
                        >
                          {doc.submitted ? "Fourni" : "À fournir"}
                        </Badge>
                      </div>

                      {/* Upload / Replace Action */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <label className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors">
                            <Upload className="w-3 h-3" />
                            <span>{doc.submitted ? "Remplacer le fichier" : "Téléverser la pièce"}</span>
                          </div>
                          <input 
                            type="file" 
                            accept="application/pdf,image/*" 
                            className="hidden" 
                            onChange={(e) => handleSimulateFileUpload(key, e)} 
                          />
                        </label>

                        {doc.submitted && doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-500 transition-colors"
                            title="Aperçu du document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 4: GUARDIAN & EMERGENCY */}
            {currentTab === 'guardian' && (
              <motion.div
                key="guardian"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                  <Users className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Coordonnées du parent, répondant financier ou tuteur légal en cas d'urgence ou de suivi pédagogique.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nom Complet du Parent / Tuteur *</Label>
                    <Input 
                      placeholder="Ex: M. NKOUE Albert"
                      value={formData.guardianName}
                      onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lien de Parenté</Label>
                    <Select value={formData.guardianRelation} onValueChange={v => setFormData({ ...formData, guardianRelation: v })}>
                      <SelectTrigger className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Père">Père</SelectItem>
                        <SelectItem value="Mère">Mère</SelectItem>
                        <SelectItem value="Tuteur Légal">Tuteur Légal</SelectItem>
                        <SelectItem value="Oncle / Tante">Oncle / Tante</SelectItem>
                        <SelectItem value="Employeur / Sponsor">Employeur / Sponsor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Téléphone Direct du Tuteur *</Label>
                    <Input 
                      placeholder="+237 677 00 00 00"
                      value={formData.guardianPhone}
                      onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Profession & Ville / Quartier du Tuteur</Label>
                    <Input 
                      placeholder="Ex: Ingénieur Télécom - Douala Bonapriso"
                      value={formData.guardianProfession}
                      onChange={e => setFormData({ ...formData, guardianProfession: e.target.value })}
                      className="rounded-xl h-11 border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (currentTab === 'academic') setCurrentTab('identity');
                else if (currentTab === 'documents') setCurrentTab('academic');
                else if (currentTab === 'guardian') setCurrentTab('documents');
                else onClose();
              }}
              className="rounded-xl h-11 px-5 font-bold"
            >
              {currentTab === 'identity' ? "Annuler" : "Précédent"}
            </Button>

            <div className="flex items-center gap-2">
              {currentTab !== 'guardian' ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (currentTab === 'identity') setCurrentTab('academic');
                    else if (currentTab === 'academic') setCurrentTab('documents');
                    else if (currentTab === 'documents') setCurrentTab('guardian');
                  }}
                  className="bg-slate-900 hover:bg-black text-white rounded-xl h-11 px-6 font-bold"
                >
                  Étape Suivante
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-8 font-black uppercase text-xs tracking-wider shadow-lg shadow-emerald-600/20"
                >
                  {submitting ? "Validation du Dossier..." : "Valider & Inscrire l'Étudiant"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
