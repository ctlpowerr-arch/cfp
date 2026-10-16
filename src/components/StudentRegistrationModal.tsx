import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  GraduationCap, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { defaultSpecialties } from '@/data/specialtiesData';
import { sendRegistrationNotification } from '@/services/emailService';
import { Button } from '@/components/ui/button';
import { ModernSelect } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
      const targetSpecialty = specialties.find(s => s.id === regFormData.specialtyId);
      const specialtyName = targetSpecialty ? targetSpecialty.name : 'Formation Professionnelle DQP';

      const newRegistration = {
        id: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `${regFormData.firstName.trim()} ${regFormData.lastName.trim()}`,
        fullName: `${regFormData.firstName.trim()} ${regFormData.lastName.trim()}`,
        firstName: regFormData.firstName.trim(),
        lastName: regFormData.lastName.trim(),
        level: targetSpecialty?.levelRequired || 'Niveau 1',
        status: 'En attente',
        email: regFormData.email.trim() || `${regFormData.firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${regFormData.lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}@candidat-itmc.cm`,
        phone: regFormData.phone.trim(),
        city: regFormData.city.trim() || 'Douala',
        specialty: specialtyName,
        specialtyId: regFormData.specialtyId,
        timeSlot: regFormData.timeSlot === 'morning' ? 'Matin (8h - 14h)' : 'Soir (17h30 - 20h30)',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${regFormData.firstName.trim()}`,
        registrationDate: new Date().toLocaleDateString('fr-FR'),
        fullDate: new Date().toISOString(),
        documents: {},
        documentsChecklist: {
          diploma: false,
          birthCertificate: false,
          medicalCertificate: false,
          cni: false
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
          className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header - Fully Responsive Without Any Overflow */}
          <div className="p-3.5 sm:p-5 md:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white flex items-center justify-between shrink-0 relative overflow-hidden gap-3">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 relative z-10">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white leading-tight">
                  Dossier de Pré-inscription en Ligne
                </h3>
                <p className="text-[11px] sm:text-xs text-blue-200/90 font-medium truncate mt-0.5">
                  CFP-ITMC Douala Logpom • Agréé par le MINEFOP
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 relative z-10 cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Steps Indicator (Responsive 2-Step Grid - No Horizontal Scrollbar) */}
          {!regSuccess && (
            <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-lg mx-auto">
                {[
                  { step: 1, title: '1. Coordonnées', desc: 'Identité candidat' },
                  { step: 2, title: '2. Spécialité', desc: 'Filière & Vacation' },
                ].map((s) => (
                  <div 
                    key={s.step} 
                    className={cn(
                      "flex items-center gap-2 sm:gap-2.5 p-2 rounded-xl transition-all select-none",
                      regStep === s.step 
                        ? "bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80" 
                        : "opacity-75"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 transition-all",
                      regStep === s.step 
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20" 
                        : regStep > s.step 
                          ? "bg-emerald-600 text-white" 
                          : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                    )}>
                      {regStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                    </div>
                    <div className="min-w-0">
                      <p className={cn(
                        "text-[11px] sm:text-xs font-black truncate",
                        regStep === s.step ? "text-blue-900 dark:text-blue-200" : "text-slate-700 dark:text-slate-300"
                      )}>
                        {s.title}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 truncate leading-none mt-0.5">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {regError && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-bold leading-relaxed">{regError}</span>
            </div>
          )}

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {regSuccess ? (
              /* Success confirmation */
              <div className="text-center py-6 px-2 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Pré-inscription Enregistrée avec Succès !
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Félicitations <strong className="text-slate-900 dark:text-white">{regFormData.firstName} {regFormData.lastName}</strong>, votre candidature a été transmise à la direction des admissions du CFP-ITMC.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-3 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-center border-b border-slate-200 dark:border-slate-700 pb-2">
                    Récapitulatif de votre Candidature
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block">Spécialité choisie :</span>
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
                      <strong className="text-slate-900 dark:text-white">{regFormData.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Campus d'inscription :</span>
                      <strong className="text-slate-900 dark:text-white">Douala Logpom (Bassong)</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 font-medium">
                  Notre équipe des admissions vous contactera par appel direct ou WhatsApp sous 24h pour finaliser votre dossier d'admission.
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button 
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                  >
                    Fermer cette fenêtre
                  </Button>
                  <Button 
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto px-6 h-11 rounded-xl border-slate-300 font-bold text-xs"
                  >
                    <Link to="/contact">Localiser le Campus Logpom</Link>
                  </Button>
                </div>
              </div>
            ) : (
              /* Streamlined 2-Step Form */
              <form onSubmit={handleRegistrationSubmit} className="space-y-6">
                
                {/* STEP 1: Personal Info */}
                {regStep === 1 && (
                  <div className="space-y-4">
                    <div className="p-3 sm:p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 font-medium leading-relaxed">
                      Renseignez vos coordonnées directes afin que le secrétariat d'admission puisse vous contacter et valider votre dossier.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
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
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
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
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
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
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
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
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
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
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: Specialty & Time Slot (Final Step) */}
                {regStep === 2 && (
                  <div className="space-y-4">
                    <div className="p-3 sm:p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed">
                      Sélectionnez la filière professionnelle homologuée par le MINEFOP de votre choix ainsi que votre vacation préférée.
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                        Sélectionnez la Spécialité DQP de votre choix <span className="text-rose-500">*</span>
                      </label>
                      <ModernSelect 
                        required
                        dropdownTitle="Sélectionner une Spécialité DQP"
                        value={regFormData.specialtyId}
                        onChange={e => setRegFormData(prev => ({ ...prev, specialtyId: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-xs font-black text-slate-900 dark:text-white focus:ring-2 ring-blue-500/20 outline-none"
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
                            "p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-1.5 sm:gap-2",
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
                            "p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-1.5 sm:gap-2",
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

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                      💡 <strong>Dépôt des pièces en présentiel :</strong> Aucun document à téléverser en ligne. Vos photocopies de diplôme et acte de naissance pourront être remises directement au secrétariat du campus à Logpom lors de la rentrée.
                    </div>
                  </div>
                )}

                {/* Form Buttons Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 gap-3">
                  {regStep === 2 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRegError('');
                        setRegStep(1);
                      }}
                      className="h-10 sm:h-11 rounded-xl px-4 sm:px-5 font-bold text-xs gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Précédent</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
                      className="h-10 sm:h-11 rounded-xl px-3 sm:px-4 font-bold text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Annuler
                    </Button>
                  )}

                  {regStep === 1 ? (
                    <Button
                      type="button"
                      onClick={() => {
                        if (!regFormData.firstName.trim() || !regFormData.lastName.trim() || !regFormData.phone.trim()) {
                          setRegError('Veuillez remplir vos prénom, nom et numéro de téléphone.');
                          return;
                        }
                        setRegError('');
                        setRegStep(2);
                      }}
                      className="h-10 sm:h-11 rounded-xl px-5 sm:px-6 font-black text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <span>Continuer</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-10 sm:h-11 rounded-xl px-5 sm:px-7 font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      {isSubmitting ? "Envoi en cours..." : "Valider & Envoyer ma Pré-inscription"}
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
