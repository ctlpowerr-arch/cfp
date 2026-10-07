/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  ShieldCheck, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Copy, 
  Check, 
  ExternalLink,
  HelpCircle,
  FileCode,
  Layers,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  getEmailJsConfig, 
  saveEmailJsConfig, 
  sendTestEmailNotification, 
  getEmailLogs, 
  generateRegistrationHtmlEmail,
  generateContactHtmlEmail,
  RegistrationEmailData,
  ContactEmailData
} from '@/services/emailService';

export default function EmailJsSettingsCard() {
  const [config, setConfig] = useState(getEmailJsConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplateTab, setSelectedTemplateTab] = useState<'registration' | 'contact'>('registration');
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [logs, setLogs] = useState(getEmailLogs());

  const sampleRegistration: RegistrationEmailData = {
    id: 'REG-2026-8841',
    name: 'Alain Kengne Fotso',
    firstName: 'Alain',
    lastName: 'Kengne Fotso',
    phone: '+237 677 12 34 56',
    email: 'alain.kengne@gmail.com',
    specialty: 'Plomberie Sanitaire & Raccordements',
    timeSlot: 'Cours du Jour (08h30 - 13h30)',
    level: 'DQP 12 Mois (Diplôme d’État)',
    registrationDate: new Date().toLocaleDateString('fr-FR')
  };

  const sampleContact: ContactEmailData = {
    fullName: 'Mireille Tchakounte',
    phone: '+237 699 44 55 66',
    email: 'mireille.t@yahoo.fr',
    filiere: 'Secrétariat Bureautique & Comptabilité',
    message: 'Bonjour, je souhaite connaître les modalités de paiement et les dates de rentrée pour la session du soir.'
  };

  const sampleRegistrationHtml = generateRegistrationHtmlEmail(sampleRegistration);
  const sampleContactHtml = generateContactHtmlEmail(sampleContact);

  const currentTemplateHtml = selectedTemplateTab === 'registration' ? sampleRegistrationHtml : sampleContactHtml;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const saved = saveEmailJsConfig(config);
      setConfig(saved);
      toast.success("Paramètres EmailJS enregistrés avec succès !");
    } catch {
      toast.error("Erreur lors de l'enregistrement de la configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSend = async () => {
    if (!config.serviceId || !config.templateId || !config.publicKey) {
      toast.error("Veuillez d'abord renseigner votre Service ID, Template ID et Public Key.");
      return;
    }

    setIsTesting(true);
    toast.info(`Envoi d'un e-mail test à ${config.adminEmail}...`);

    try {
      const result = await sendTestEmailNotification(config.adminEmail);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setLogs(getEmailLogs());
    } catch (err: any) {
      toast.error(`Erreur inattendue : ${err?.message || err}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyTemplate = (type?: 'registration' | 'contact') => {
    const targetType = type || selectedTemplateTab;
    const htmlToCopy = targetType === 'registration' ? sampleRegistrationHtml : sampleContactHtml;
    navigator.clipboard.writeText(htmlToCopy);
    setCopiedTemplate(true);
    toast.success(`Modèle HTML ${targetType === 'registration' ? "d'Inscription" : "de Contact"} copié dans le presse-papier !`);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const isConfigured = Boolean(config.serviceId && config.templateId && config.publicKey);

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 pointer-events-none blur-2xl" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-display font-black tracking-tight">
                  Notification des Inscriptions via EmailJS
                </h3>
                {isConfigured ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-black uppercase">
                    Connecté
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-black uppercase">
                    Configuration Requise
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Envoi automatique d'un e-mail à l'administration dès qu'un candidat clique sur <strong>« S'inscrire »</strong> et soumet son dossier sur le site web.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold rounded-xl h-10 gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              Aperçu du Mail
            </Button>

            <Button
              type="button"
              disabled={isTesting}
              onClick={handleTestSend}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl h-10 gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              {isTesting ? "Envoi du test..." : "Tester l'envoi"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-black text-slate-900">Identifiants EmailJS</h4>
            </div>
            <a 
              href="https://dashboard.emailjs.com/admin" 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              Tableau de bord EmailJS <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Service ID <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={config.serviceId}
                  onChange={e => setConfig(prev => ({ ...prev, serviceId: e.target.value }))}
                  placeholder="Ex: service_itmc_gmail"
                  className="rounded-xl h-11 text-xs"
                />
                <p className="text-[10px] text-slate-400">Depuis EmailJS &gt; Email Services</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Template ID Inscription <span className="text-rose-500">*</span></span>
                  <Badge className="bg-blue-100 text-blue-700 text-[9px] px-1 py-0 border-none font-bold">Dossiers</Badge>
                </label>
                <Input
                  value={config.templateId}
                  onChange={e => setConfig(prev => ({ ...prev, templateId: e.target.value }))}
                  placeholder="Ex: template_inscription_dqp"
                  className="rounded-xl h-11 text-xs"
                />
                <p className="text-[10px] text-slate-400">Pour les demandes de pré-inscription</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Template ID Contact</span>
                  <Badge className="bg-slate-100 text-slate-600 text-[9px] px-1 py-0 border-none font-bold">Optionnel</Badge>
                </label>
                <Input
                  value={config.contactTemplateId || ''}
                  onChange={e => setConfig(prev => ({ ...prev, contactTemplateId: e.target.value }))}
                  placeholder="Ex: template_contact_orientation"
                  className="rounded-xl h-11 text-xs"
                />
                <p className="text-[10px] text-slate-400">Pour les messages de la page Contact</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Public Key (Clé Publique) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="password"
                  value={config.publicKey}
                  onChange={e => setConfig(prev => ({ ...prev, publicKey: e.target.value }))}
                  placeholder="Ex: user_xXXXXXXXXX / Public Key"
                  className="rounded-xl h-11 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400">Depuis EmailJS &gt; Account &gt; General &gt; Public Key</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Private Key (Clé Privée / Access Token)</span>
                  <Badge className="bg-amber-50 text-amber-800 text-[9px] px-1 py-0 border border-amber-200 font-bold">Sécurité</Badge>
                </label>
                <Input
                  type="password"
                  value={config.privateKey || ''}
                  onChange={e => setConfig(prev => ({ ...prev, privateKey: e.target.value }))}
                  placeholder="Ex: xxx_xxxxxxxxxxxxxxxxxxxx"
                  className="rounded-xl h-11 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400">EmailJS &gt; Account &gt; Security &gt; Private Key (Optionnel ou Requis selon votre compte)</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Email de Réception de l'Administration <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                value={config.adminEmail}
                onChange={e => setConfig(prev => ({ ...prev, adminEmail: e.target.value }))}
                placeholder="Ex: direction@cfp-itmc.com, secretariat@itmc-it.cm"
                className="rounded-xl h-11 text-xs"
              />
              <p className="text-[10px] text-slate-400">Adresse où vous recevrez toutes les notifications d'inscription</p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl h-11 px-6 text-xs gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSaving ? "Sauvegarde..." : "Enregistrer la Configuration"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleCopyTemplate('registration')}
                className="rounded-xl h-11 text-xs font-bold text-slate-700 border-slate-200 gap-2 cursor-pointer"
              >
                {copiedTemplate ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedTemplate ? "HTML Copié !" : "Copier le Modèle HTML"}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Info Guide & Template Params (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-black text-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Paramètres Disponibles dans le Modèle EmailJS</span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Dans votre modèle EmailJS, vous pouvez insérer directement ces balises pour afficher les données du candidat :
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-blue-700 font-bold">
                {"{{candidate_name}}"}
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-blue-700 font-bold">
                {"{{candidate_phone}}"}
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-blue-700 font-bold">
                {"{{candidate_email}}"}
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-blue-700 font-bold">
                {"{{specialty_name}}"}
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-blue-700 font-bold">
                {"{{time_slot}}"}
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-blue-700 font-bold">
                {"{{registration_id}}"}
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-blue-700 font-bold col-span-2">
                {"{{{message_html}}}"} <span className="font-sans text-slate-500 font-normal">(Email complet avec charte)</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed font-semibold">
              💡 <strong>Astuce :</strong> En collant notre modèle HTML dans le champ <i>Content</i> de votre template EmailJS, l'e-mail reçu aura automatiquement l'en-tête bleu institutionnel, le sceau agréé MINEFOP et le récapitulatif stylisé.
            </div>

            {/* Troubleshooting 400 Bad Request */}
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950 space-y-2">
              <div className="flex items-center gap-1.5 font-black text-amber-900 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Résolution de l'erreur EmailJS 400 (Bad Request) :</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[10px] text-amber-900/90 pl-1 leading-normal">
                <li><strong>Sécurité EmailJS :</strong> Allez sur <i>Account &gt; Security</i> et cochez <u>« Allow EmailJS API for non-whitelisted requests »</u>.</li>
                <li><strong>Clé Privée / Access Token :</strong> Si le mode strict est actif, copiez votre <i>Private Key</i> dans le champ ci-contre ou dans <code>VITE_EMAILJS_PRIVATE_KEY</code>.</li>
                <li><strong>Connexion Service :</strong> Vérifiez dans <i>Email Services</i> que votre service Gmail / Outlook est actif avec un voyant vert.</li>
                <li><strong>Destinataire du Template :</strong> Dans votre Template EmailJS, assurez-vous que <i>To Email</i> est défini sur <code>{"{{to_email}}"}</code> ou votre adresse directe.</li>
              </ul>
            </div>
          </div>

          {/* Mini Logs Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                Derniers envois d'e-mails
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{logs.length} enregistrements</span>
            </div>

            {logs.length === 0 ? (
              <p className="text-[11px] text-slate-400 py-3 text-center">Aucun envoi récent enregistré.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {logs.slice(0, 4).map(log => (
                  <div key={log.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="truncate max-w-[180px]">
                      <span className="font-bold text-slate-800 block truncate">{log.candidateName}</span>
                      <span className="text-[9px] text-slate-500">{log.specialtyOrSubject}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        log.status === 'sent' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : log.status === 'failed' 
                            ? 'bg-rose-100 text-rose-700' 
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {log.status === 'sent' ? 'Envoyé' : log.status === 'failed' ? 'Échoué' : 'Simulation'}
                      </span>
                      <span className="text-[8px] text-slate-400 block mt-0.5">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Email HTML Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="text-sm sm:text-base font-black">
                    Aperçu Réel du Courriel ({selectedTemplateTab === 'registration' ? "Inscription DQP/CQP" : "Contact & Orientation"})
                  </h4>
                  <p className="text-[11px] text-slate-400">Format reçu par l'administration lors d'une soumission sur le site web</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
                className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>

            {/* Template Selector Sub-header */}
            <div className="bg-slate-800 px-5 py-2.5 flex items-center gap-2 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedTemplateTab('registration')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTemplateTab === 'registration'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                🎓 Modèle 1 : Inscription Candidat
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplateTab('contact')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTemplateTab === 'contact'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                💬 Modèle 2 : Contact &amp; Orientation
              </button>
            </div>

            {/* Modal Content / Iframe / Render */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/90 flex justify-center">
              <div 
                className="w-full max-w-[700px] bg-transparent rounded-2xl overflow-hidden"
                dangerouslySetInnerHTML={{ __html: currentTemplateHtml }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-semibold">
                Charte CFP-ITMC • Diplômes DQP, CQP &amp; AQP MINEFOP
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCopyTemplate(selectedTemplateTab)}
                  className="text-xs font-bold rounded-xl h-10 border-slate-200 gap-1.5"
                >
                  {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedTemplate ? "Copié !" : `Copier Modèle ${selectedTemplateTab === 'registration' ? 'Inscription' : 'Contact'}`}
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl h-10 px-5"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
