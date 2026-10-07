import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  Upload, 
  Sparkles, 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  GraduationCap, 
  Clock, 
  UserCheck, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { defaultSpecialties } from '@/data/specialtiesData';
import { sendRegistrationNotification } from '@/services/emailService';
import { Button } from '@/components/ui/button';
import { ModernSelect } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AppLogo from '@/components/AppLogo';

interface StudentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSpecialtyId?: string;
}

export default function StudentRegistrationModal({
  isOpen,
  onClose,
  defaultSpecialtyId
}: StudentRegistrationModalProps) {
  const [specialties, setSpecialties] = useState<any[]>(defaultSpecialties);
  const [regStep, setRegStep] = useState(1);
  const [regFormData, setRegFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: 'Douala',
    specialtyId: defaultSpecialtyId || '',
    timeSlot: 'morning',
    level: 'Niveau 1',
  });

  const [regFiles, setRegFiles] = useState<{
    diploma: File | null;
    birthCertificate: File | null;
    medicalCertificate: File | null;
    cni: File | null;
  }>({
    diploma: null,
    birthCertificate: null,
    medicalCertificate: null,
    cni: null
  });

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  // Fetch updated specialties list from database
  useEffect(() => {
    fetch('/api/specialties')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSpecialties(data);
        }
      })
      .catch(() => {});
  }, []);

  // Update default specialty when opened
  useEffect(() => {
    if (defaultSpecialtyId) {
      setRegFormData(prev => ({ ...prev, specialtyId: defaultSpecialtyId }));
    } else if (specialties.length > 0 && !regFormData.specialtyId) {
      setRegFormData(prev => ({ ...prev, specialtyId: specialties[0].id }));
    }
  }, [defaultSpecialtyId, specialties]);

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen) {
      setRegStep(1);
      setRegSuccess(false);
      setRegError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (field: 'diploma' | 'birthCertificate' | 'medicalCertificate' | 'cni', file: File | null) => {
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      toast.error(`Le fichier "${file.name}" dépasse 12 Mo.`);
      return;
    }

    setUploadProgress(prev => ({ ...prev, [field]: 10 }));
    let prog = 10;
    const interval = setInterval(() => {
      prog += 30;
      if (prog >= 100) {
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [field]: 100 }));
        setRegFiles(prev => ({ ...prev, [field]: file }));
        toast.success(`Fichier ${file.name} prêt !`);
      } else {
        setUploadProgress(prev => ({ ...prev, [field]: prog }));
      }
    }, 80);
  };

  const handleFileDrop = (field: 'diploma' | 'birthCertificate' | 'medicalCertificate' | 'cni', e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(field, e.dataTransfer.files[0]);
    }
  };

  const fileToBase64 = (file: File | null): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
    });
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regFormData.firstName.trim() || !regFormData.lastName.trim() || !regFormData.phone.trim()) {
      setRegError('Veuillez renseigner toutes vos coordonnées obligatoires (Prénom, Nom, Téléphone).');
      return;
    }
    if (!regFormData.specialtyId) {
      setRegError('Veuillez sélectionner la spécialité de votre choix.');
      return;
    }

    setRegError('');
    setIsSubmitting(true);

    try {
      const diplomaBase64 = await fileToBase64(regFiles.diploma);
      const birthBase64 = await fileToBase64(regFiles.birthCertificate);
      const medicalBase64 = await fileToBase64(regFiles.medicalCertificate);
      const cniBase64 = await fileToBase64(regFiles.cni);

      const targetSpecialty = specialties.find(s => s.id === regFormData.specialtyId);
      const specialtyName = targetSpecialty ? targetSpecialty.name : 'Formation Professionnelle DQP';

      const newRegistration = {
        id: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `${regFormData.firstName} ${regFormData.lastName}`,
        firstName: regFormData.firstName,
        lastName: regFormData.lastName,
        level: targetSpecialty?.levelRequired || 'Niveau 1',
        status: 'En attente',
        email: regFormData.email || `${regFormData.firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${regFormData.lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}@candidat-itmc.cm`,
        phone: regFormData.phone,
        city: regFormData.city || 'Douala',
        specialty: specialtyName,
        specialtyId: regFormData.specialtyId,
        timeSlot: regFormData.timeSlot === 'morning' ? 'Matin (8h - 14h)' : 'Soir (17h30 - 20h30)',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${regFormData.firstName}`,
        registrationDate: new Date().toLocaleDateString('fr-FR'),
        fullDate: new Date().toISOString(),
        documents: {
          diploma: diplomaBase64,
          birthCertificate: birthBase64,
          medicalCertificate: medicalBase64,
          cni: cniBase64
        },
        documentsChecklist: {
          diploma: !!diplomaBase64,
          birthCertificate: !!birthBase64,
          medicalCertificate: !!medicalBase64,
          cni: !!cniBase64
        }
      };

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRegistration)
      });

      if (!response.ok) {
        throw new Error('Échec de la sauvegarde sur le serveur');
      }

      // EmailJS Notification
      try {
        await sendRegistrationNotification({
          id: newRegistration.id,
          name: newRegistration.name,
          firstName: newRegistration.firstName,
          lastName: newRegistration.lastName,
          phone: newRegistration.phone,
          email: newRegistration.email,
          specialty: newRegistration.specialty,
          timeSlot: newRegistration.timeSlot,
          level: newRegistration.level,
          registrationDate: newRegistration.registrationDate,
          documents: newRegistration.documents
        });
      } catch (e) {
        console.warn("Notice EmailJS :", e);
      }

      window.dispatchEvent(new Event('storage'));
      setRegSuccess(true);
      toast.success("Votre dossier de pré-inscription a été transmis avec succès !");
    } catch (error) {
      console.error("Error saving registration:", error);
      setRegError("Une anomalie est survenue lors de l'envoi de votre dossier. Veuillez réessayer.");
      toast.error("Erreur d'envoi. Veuillez vérifier vos informations.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSpecialtyObj = specialties.find(s => s.id === regFormData.specialtyId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[94vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <GraduationCap className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Dossier de Pré-inscription en Ligne
                </h3>
                <p className="text-xs text-blue-200/90 font-medium">
                  CFP-ITMC Douala Logpom • Agréé par le MINEFOP
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors relative z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps Breadcrumb */}
          {!regSuccess && (
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 overflow-x-auto">
              {[
                { step: 1, title: '1. Coordonnées', desc: 'Identité candidat' },
                { step: 2, title: '2. Spécialité', desc: 'Filière DQP & Vacation' },
                { step: 3, title: '3. Pièces & Validation', desc: 'Documents facultatifs' },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2.5 shrink-0">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all",
                    regStep === s.step 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                      : regStep > s.step 
                        ? "bg-emerald-600 text-white" 
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  )}>
                    {regStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.title}</p>
                    <p className="text-[10px] text-slate-400 leading-none">{s.desc}</p>
                  </div>
                  {s.step < 3 && <div className="hidden sm:block w-8 h-0.5 bg-slate-200 dark:bg-slate-700 mx-2" />}
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {regError && (
            <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-bold leading-relaxed">{regError}</span>
            </div>
          )}

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {regSuccess ? (
              /* Success confirmation */
              <div className="text-center py-6 px-2 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    Pré-inscription Enregistrée avec Succès !
                  </h4>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Félicitations <strong className="text-slate-900 dark:text-white">{regFormData.firstName} {regFormData.lastName}</strong>, votre dossier a été reçu par la direction des admissions de l'institut.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-3 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-center border-b border-slate-200 dark:border-slate-700 pb-2">
                    Récapitulatif de votre Candidature
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block">Spécialité DQP choisie :</span>
                      <strong className="text-slate-900 dark:text-white text-sm">
                        {selectedSpecialtyObj?.name || 'Spécialité ITMC'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Horaires / Vacation :</span>
                      <strong className="text-slate-900 dark:text-white">
                        {regFormData.timeSlot === 'morning' ? 'Vacation Jour (8h - 14h)' : 'Vacation Soir (17h30 - 20h30)'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Numéro de téléphone :</span>
                      <strong className="text-blue-600 font-mono">{regFormData.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Campus :</span>
                      <strong className="text-slate-800 dark:text-slate-200">Douala Logpom (Carrefour Bassong)</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 rounded-2xl text-xs font-bold leading-relaxed">
                  📌 Aucun paiement n'est exigé en ligne à cette étape. Notre secrétariat pédagogique va étudier vos pièces et vous contacter par téléphone sous 24h pour finaliser votre admission.
                </div>

                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <Button 
                    onClick={onClose}
                    className="rounded-xl h-11 px-8 font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                  >
                    Terminer & Fermer
                  </Button>
                </div>
              </div>
            ) : (
              /* Steps Form */
              <form onSubmit={handleRegistrationSubmit} className="space-y-6">
                
                {/* STEP 1: Personal Info */}
                {regStep === 1 && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 font-medium">
                      Renseignez vos coordonnées directes afin que le secrétariat d'admission puisse vous contacter et valider votre dossier.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                          Prénom(s) <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          required
                          value={regFormData.firstName}
                          onChange={e => setRegFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Ex: Jean Paul" 
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                          Nom de Famille <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          required
                          value={regFormData.lastName}
                          onChange={e => setRegFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Ex: Kamga" 
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                          Numéro WhatsApp / Téléphone <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="tel" 
                          required
                          value={regFormData.phone}
                          onChange={e => setRegFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Ex: 691 75 19 93" 
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                          Adresse Email
                        </label>
                        <input 
                          type="email" 
                          value={regFormData.email}
                          onChange={e => setRegFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Ex: jean.kamga@gmail.com" 
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                        Ville &amp; Quartier de Résidence
                      </label>
                      <input 
                        type="text" 
                        value={regFormData.city}
                        onChange={e => setRegFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Ex: Douala, Logpom, Bonamoussadi, Akwa, Bafoussam..." 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: Specialty & Time Slot */}
                {regStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                        Sélectionnez la Spécialité DQP de votre choix <span className="text-rose-500">*</span>
                      </label>
                      <ModernSelect 
                        required
                        dropdownTitle="Sélectionner une Spécialité DQP"
                        value={regFormData.specialtyId}
                        onChange={e => setRegFormData(prev => ({ ...prev, specialtyId: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-black text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
                      >
                        {specialties.map((s) => (
                          <option key={s.id} value={s.id}>
                            🎓 {s.name} — {s.filiere || 'DQP Homologué'}
                          </option>
                        ))}
                      </ModernSelect>
                    </div>

                    {/* Time Slot Selector */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                        Créneau Horaire / Vacation Souhaitée <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div 
                          onClick={() => setRegFormData(prev => ({ ...prev, timeSlot: 'morning' }))}
                          className={cn(
                            "p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2",
                            regFormData.timeSlot === 'morning' 
                              ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm" 
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-black text-xs text-slate-900 dark:text-white">Vacation Jour (Matin)</span>
                            <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", regFormData.timeSlot === 'morning' ? "border-blue-600" : "border-slate-300")}>
                              {regFormData.timeSlot === 'morning' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-500">Horaires : 08h00 - 14h00 (Cours &amp; TP intensifs)</span>
                        </div>

                        <div 
                          onClick={() => setRegFormData(prev => ({ ...prev, timeSlot: 'evening' }))}
                          className={cn(
                            "p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2",
                            regFormData.timeSlot === 'evening' 
                              ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm" 
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-black text-xs text-slate-900 dark:text-white">Vacation Soir (Professionnels)</span>
                            <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", regFormData.timeSlot === 'evening' ? "border-blue-600" : "border-slate-300")}>
                              {regFormData.timeSlot === 'evening' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-500">Horaires : 17h30 - 20h30 (Spécial travailleurs)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Documents (Optional) */}
                {regStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 font-bold leading-relaxed">
                      💡 <strong>Dépôt Flexible :</strong> L'envoi immédiat de vos pièces n'est pas obligatoire. Vous pouvez joindre vos scans maintenant ou déposer les originaux en présentiel lors de votre passage au campus.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'diploma', label: 'Dernier Diplôme ou Relevé', desc: 'Scan Bac, Probatoire ou BEPC' },
                        { key: 'birthCertificate', label: 'Acte de Naissance', desc: 'Copie d\'acte de naissance' },
                        { key: 'medicalCertificate', label: 'Certificat Médical', desc: 'Aptitude médicale' },
                        { key: 'cni', label: 'Photocopie CNI / Récépissé', desc: 'Carte Nationale d\'Identité' },
                      ].map((doc) => {
                        const field = doc.key as 'diploma' | 'birthCertificate' | 'medicalCertificate' | 'cni';
                        const hasFile = regFiles[field];
                        const progress = uploadProgress[field];
                        const isUploading = progress !== undefined && progress < 100;
                        
                        return (
                          <div key={doc.key} className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700 dark:text-slate-300">{doc.label}</label>
                            
                            <div 
                              onDragOver={e => e.preventDefault()}
                              onDrop={e => handleFileDrop(field, e)}
                              onClick={() => {
                                const input = document.getElementById(`modal-file-input-${doc.key}`);
                                if (input) input.click();
                              }}
                              className={cn(
                                "border-2 border-dashed rounded-2xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 h-28",
                                hasFile 
                                  ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/30" 
                                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/40"
                              )}
                            >
                              <input 
                                type="file" 
                                id={`modal-file-input-${doc.key}`}
                                className="hidden"
                                onChange={e => handleFileChange(field, e.target.files ? e.target.files[0] : null)}
                                accept="image/*,application/pdf"
                              />
                              
                              {hasFile ? (
                                <>
                                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <Check className="w-4 h-4" />
                                  </div>
                                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 line-clamp-1">{hasFile.name}</p>
                                  <span className="text-[10px] text-emerald-600 font-extrabold uppercase">Prêt pour envoi</span>
                                </>
                              ) : isUploading ? (
                                <div className="w-full px-4 space-y-1.5">
                                  <span className="text-[10px] font-bold text-blue-600">Chargement... {progress}%</span>
                                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-blue-600 h-full transition-all duration-100" style={{ width: `${progress}%` }} />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-5 h-5 text-slate-400" />
                                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Cliquer pour charger</p>
                                  <p className="text-[9px] text-slate-400">{doc.desc}</p>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Form Buttons Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 gap-3">
                  {regStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRegStep(prev => prev - 1)}
                      className="h-11 rounded-xl px-5 font-bold text-xs gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Précédent</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
                      className="h-11 rounded-xl px-4 font-bold text-xs text-slate-400"
                    >
                      Annuler
                    </Button>
                  )}

                  {regStep < 3 ? (
                    <Button
                      type="button"
                      onClick={() => {
                        if (regStep === 1) {
                          if (!regFormData.firstName.trim() || !regFormData.lastName.trim() || !regFormData.phone.trim()) {
                            setRegError('Veuillez remplir vos nom, prénom et téléphone.');
                            return;
                          }
                          setRegError('');
                        }
                        setRegStep(prev => prev + 1);
                      }}
                      className="h-11 rounded-xl px-6 font-black text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-md shadow-blue-500/20"
                    >
                      <span>Continuer</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-11 rounded-xl px-7 font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md shadow-emerald-500/20"
                    >
                      {isSubmitting ? "Envoi en cours..." : "Finaliser & Envoyer ma Candidature"}
                    </Button>
                  )}
                </div>

              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
