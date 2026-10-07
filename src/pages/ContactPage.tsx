/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Building2, 
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Navigation,
  Send,
  Calendar,
  Compass,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModernSelect } from '@/components/ui/select';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import BottomCallToActionBanner from '@/components/BottomCallToActionBanner';
import { sanitizeInput, isInjectionPayload, checkRateLimit, getCsrfToken } from '@/lib/security';
import { toast } from 'sonner';
import { sendContactNotification } from '@/services/emailService';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    filiere: 'Numérique & Informatique',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);

    // 1. Check Rate-Limiting (Anti-Spam / Anti-Brute-Force)
    const rateCheck = checkRateLimit("contact_form_submit", 3, 60000); // Max 3 submissions per minute
    if (!rateCheck.allowed) {
      setSecurityError("Sécurité Anti-Spam : Trop de tentatives soumises. Veuillez patienter 1 minute avant de réessayer.");
      return;
    }

    // 2. Anti-Injection / Anti-XSS Payload Checks
    if (
      isInjectionPayload(formData.fullName) ||
      isInjectionPayload(formData.phone) ||
      isInjectionPayload(formData.email) ||
      isInjectionPayload(formData.message)
    ) {
      setSecurityError("Alerte Sécurité : Caractères ou scripts suspects détectés. La soumission a été bloquée pour protéger la plateforme.");
      return;
    }

    setIsSubmitting(true);

    // 3. Input Sanitization
    const sanitizedData = {
      fullName: sanitizeInput(formData.fullName),
      phone: sanitizeInput(formData.phone),
      email: sanitizeInput(formData.email),
      filiere: sanitizeInput(formData.filiere),
      message: sanitizeInput(formData.message),
      csrfToken: getCsrfToken()
    };

    console.log("Données de contact sécurisées et transmises :", sanitizedData);

    try {
      const emailResult = await sendContactNotification({
        fullName: sanitizedData.fullName,
        phone: sanitizedData.phone,
        email: sanitizedData.email,
        filiere: sanitizedData.filiere,
        message: sanitizedData.message
      });

      if (emailResult.success) {
        toast.success("Votre demande a été transmise à notre équipe d'orientation !");
      }
    } catch (err) {
      console.warn("Notice EmailJS contact :", err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <PublicNavbar />

      {/* Grande Bannière Immersive Plein Écran Bleu Uni & Blanc */}
      <PageHeaderBanner
        title="Contactez-nous"
        description="Nous sommes là pour répondre à toutes vos questions. N'hésitez pas !"
      />

      {/* Main Content - Pleine Largeur PC max-w-7xl */}
      <section className="py-16 lg:py-24 flex-1">
        <div className="container mx-auto px-6 sm:px-8 max-w-7xl space-y-16">
          
          {/* Grille Principale 2 Colonnes Grands Écrans */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Colonne Coordonnées directes (5 colonnes) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-200/50">
                <div>
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200/50">
                    Coordonnées Directes
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-3 leading-tight">
                    Secrétariat &amp; Accueil
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    Nos conseillers vous reçoivent du lundi au samedi pour vous guider dans le choix de votre spécialité et votre inscription.
                  </p>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                  {/* Adresse */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-xs">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Localisation :</span>
                      <strong className="text-sm sm:text-base font-extrabold text-slate-900 block mt-0.5">
                        Douala - Logpom, Carrefour Andem
                      </strong>
                      <span className="text-xs text-slate-500 block mt-0.5 font-medium">Campus Principal CFP-ITMC • Arrondissement de Douala 5ème</span>
                    </div>
                  </div>

                  {/* Téléphone & WhatsApp */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-xs">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Téléphone &amp; WhatsApp :</span>
                      <div className="text-sm sm:text-base font-black text-slate-900 font-mono">
                        +237 683 66 32 22 <br />
                        +237 688 05 20 94
                      </div>
                      <a 
                        href="https://wa.me/237683663222" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Écrire sur WhatsApp (+237 683 66 32 22)
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-xs">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Courriels Officiels :</span>
                      <a 
                        href="mailto:info@cfp.itmc.com" 
                        className="text-xs sm:text-sm font-extrabold text-blue-600 hover:text-blue-800 hover:underline block mt-0.5"
                      >
                        info@cfp.itmc.com
                      </a>
                      <a 
                        href="mailto:cfp.itmc@gmail.com" 
                        className="text-xs text-slate-600 hover:text-blue-700 hover:underline font-bold block mt-0.5"
                      >
                        cfp.itmc@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Horaires */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-xs">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Horaires de réception :</span>
                      <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5">
                        Lun – Ven : 08h00 – 18h00 (Non-stop)
                      </strong>
                      <span className="text-xs text-slate-500 font-medium">Samedi : 08h00 – 14h00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne Formulaire de pré-inscription (7 colonnes) */}
            <div className="lg:col-span-7 bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl shadow-slate-200/50">
              {submitted ? (
                <div className="text-center py-12 space-y-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-950">Demande d'orientation enregistrée !</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Merci pour votre intérêt. Un conseiller pédagogique du CFP-ITMC prendra contact avec vous dans les plus brefs délais par téléphone ou WhatsApp.
                  </p>
                  <Button 
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="text-xs sm:text-sm font-bold rounded-xl h-11 px-6 border-slate-300 cursor-pointer"
                  >
                    Envoyer une autre demande
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {securityError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs font-bold animate-pulse">
                      <ShieldAlert className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                      <span>{securityError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Formulaire Express</span>
                    <h3 className="font-black text-slate-950 text-xl sm:text-2xl">Pré-inscription &amp; Demande d'Orientation</h3>
                    <p className="text-xs sm:text-sm text-slate-500">Renseignez vos coordonnées pour recevoir le programme détaillé et la grille tarifaire.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-extrabold text-slate-800">Nom &amp; Prénom *</label>
                      <input 
                        required
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        placeholder="Ex: Paul Mbarga"
                        className="w-full h-12 px-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-blue-600 focus:bg-white shadow-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-extrabold text-slate-800">Téléphone (WhatsApp) *</label>
                      <input 
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+237 6XX XXX XXX"
                        className="w-full h-12 px-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-blue-600 focus:bg-white shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-extrabold text-slate-800">Adresse E-mail</label>
                      <input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="exemple@gmail.com"
                        className="w-full h-12 px-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-blue-600 focus:bg-white shadow-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-extrabold text-slate-800">Filière d'Intérêt *</label>
                      <ModernSelect
                        dropdownTitle="Choisir votre Filière d'Intérêt"
                        value={formData.filiere}
                        onChange={(e) => setFormData({...formData, filiere: e.target.value})}
                        className="w-full h-12 px-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-blue-600 focus:bg-white shadow-xs font-medium"
                      >
                        <option value="Numérique & Informatique (Cybersécurité, Réseaux, Dév Web...)">💻 Numérique &amp; Informatique — Cybersécurité, Réseaux, Dév Web...</option>
                        <option value="Automobile & Mécanique (Diagnostic électronique, Électricité auto...)">🚗 Automobile &amp; Mécanique — Diagnostic électronique, Électricité auto...</option>
                        <option value="Énergie Solaire & Électricité (Installations solaires, Froid...)">⚡ Énergie Solaire &amp; Électricité — Installations solaires, Froid...</option>
                        <option value="Génie Civil & BTP (Dessin bâtiment, Topographie, Maçonnerie...)">🏗️ Génie Civil &amp; BTP — Dessin bâtiment, Topographie, Maçonnerie...</option>
                        <option value="Gestion, Comptabilité & Commerce (Comptabilité, Douane, Transit...)">📊 Gestion, Comptabilité &amp; Commerce — Comptabilité, Douane, Transit...</option>
                      </ModernSelect>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-extrabold text-slate-800">Votre Message ou Questions</label>
                    <textarea 
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Précisez votre niveau d'études, vos disponibilités (Jour ou Soir) ou vos questions..."
                      className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-blue-600 focus:bg-white shadow-xs"
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base h-12 rounded-2xl shadow-lg shadow-blue-500/25 cursor-pointer transition-all gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Transmission en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Envoyer ma demande d'orientation</span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* Grande Bannière Finale Bleu Uni & Blanc en fond direct vers le Footer */}
      <BottomCallToActionBanner 
        title="Une Question ? Écrivez-nous Directement"
        description="Nos conseillers sont disponibles du lundi au samedi pour vous renseigner sur les sessions d'examens et les cycles de formation DQP."
        primaryButtonText="Consulter les 39 Spécialités"
        primaryButtonLink="/formations"
        secondaryButtonText="WhatsApp (+237 638 36 63 22)"
        secondaryButtonHref="https://wa.me/237638366322"
        secondaryButtonIcon={<MessageCircle className="w-5 h-5 text-emerald-300" />}
      />

      <PublicFooter showWaveTransition={false} />
    </div>
  );
}
