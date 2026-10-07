/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import emailjs from '@emailjs/browser';

export interface EmailJsConfig {
  serviceId: string;
  templateId: string; // Registration Template ID
  contactTemplateId?: string; // Contact Template ID
  publicKey: string;
  privateKey?: string; // Private Key / Access Token (for restricted/strict accounts)
  adminEmail: string;
  enabled: boolean;
}

export interface RegistrationEmailData {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  specialty: string;
  timeSlot: string;
  level?: string;
  registrationDate?: string;
  documents?: {
    diploma?: string | null;
    birthCertificate?: string | null;
    medicalCertificate?: string | null;
    cni?: string | null;
  };
}

export interface ContactEmailData {
  fullName: string;
  phone: string;
  email?: string;
  filiere: string;
  message: string;
}

export interface EmailLogEntry {
  id: string;
  type: 'registration' | 'contact' | 'test';
  recipient: string;
  candidateName: string;
  specialtyOrSubject: string;
  timestamp: string;
  status: 'sent' | 'fallback_logged' | 'failed';
  errorDetails?: string;
}

// Storage keys
const EMAILJS_CONFIG_KEY = 'cfpitmc_emailjs_config';
const EMAIL_LOGS_KEY = 'cfpitmc_email_logs';

/**
 * Get current EmailJS configuration (merging environment variables and localStorage)
 */
export function getEmailJsConfig(): EmailJsConfig {
  const envServiceId = ((import.meta as any).env?.VITE_EMAILJS_SERVICE_ID || '').trim();
  const envTemplateId = ((import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID || '').trim();
  const envContactTemplateId = ((import.meta as any).env?.VITE_EMAILJS_CONTACT_TEMPLATE_ID || '').trim();
  const envPublicKey = ((import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY || '').trim();
  const envPrivateKey = ((import.meta as any).env?.VITE_EMAILJS_PRIVATE_KEY || (import.meta as any).env?.VITE_EMAILJS_SECRET_KEY || '').trim();
  const envAdminEmail = ((import.meta as any).env?.VITE_ADMIN_NOTIFICATION_EMAIL || 'direction@cfp-itmc.com').trim();

  const stored = localStorage.getItem(EMAILJS_CONFIG_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        serviceId: (parsed.serviceId || envServiceId).trim(),
        templateId: (parsed.templateId || envTemplateId).trim(),
        contactTemplateId: (parsed.contactTemplateId || envContactTemplateId || parsed.templateId || envTemplateId).trim(),
        publicKey: (parsed.publicKey || envPublicKey).trim(),
        privateKey: (parsed.privateKey || envPrivateKey || '').trim(),
        adminEmail: (parsed.adminEmail || envAdminEmail).trim(),
        enabled: parsed.enabled ?? true
      };
    } catch {
      // fallback
    }
  }

  return {
    serviceId: envServiceId,
    templateId: envTemplateId,
    contactTemplateId: envContactTemplateId || envTemplateId,
    publicKey: envPublicKey,
    privateKey: envPrivateKey,
    adminEmail: envAdminEmail,
    enabled: true
  };
}

/**
 * Save EmailJS configuration to localStorage
 */
export function saveEmailJsConfig(config: Partial<EmailJsConfig>): EmailJsConfig {
  const current = getEmailJsConfig();
  const updated: EmailJsConfig = { 
    ...current, 
    ...config,
    serviceId: (config.serviceId !== undefined ? config.serviceId : current.serviceId).trim(),
    templateId: (config.templateId !== undefined ? config.templateId : current.templateId).trim(),
    contactTemplateId: (config.contactTemplateId !== undefined ? config.contactTemplateId : current.contactTemplateId)?.trim(),
    publicKey: (config.publicKey !== undefined ? config.publicKey : current.publicKey).trim(),
    privateKey: (config.privateKey !== undefined ? config.privateKey : (current.privateKey || '')).trim(),
    adminEmail: (config.adminEmail !== undefined ? config.adminEmail : current.adminEmail).trim(),
  };
  localStorage.setItem(EMAILJS_CONFIG_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Helper to normalize EmailJS IDs (handles prefixes 'service_' and 'template_')
 */
export function normalizeServiceId(id: string): string {
  const trimmed = (id || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('service_')) return trimmed;
  return `service_${trimmed}`;
}

export function normalizeTemplateId(id: string): string {
  const trimmed = (id || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('template_')) return trimmed;
  return `template_${trimmed}`;
}

/**
 * Centralized, fail-safe EmailJS API transmitter
 * Handles both Public Key and Private Key (accessToken) for restricted domains
 * Automatically normalizes 'service_' and 'template_' prefixes
 */
async function executeEmailJsSend(
  serviceId: string,
  templateId: string,
  templateParams: Record<string, any>,
  publicKey: string,
  privateKey?: string
): Promise<{ success: boolean; status?: number; text: string }> {
  const cleanRawServiceId = (serviceId || '').trim();
  const cleanRawTemplateId = (templateId || '').trim();
  const normServiceId = normalizeServiceId(cleanRawServiceId);
  const normTemplateId = normalizeTemplateId(cleanRawTemplateId);
  const cleanPublicKey = (publicKey || '').trim();
  const cleanPrivateKey = (privateKey || '').trim();

  // Try permutations of IDs (normalized with prefix first, then raw)
  const candidatePairs = [
    { sId: normServiceId, tId: normTemplateId },
    { sId: cleanRawServiceId, tId: cleanRawTemplateId },
  ];

  for (const pair of candidatePairs) {
    if (!pair.sId || !pair.tId) continue;

    // Attempt 1: Direct EmailJS REST API with accessToken support
    try {
      const payload: Record<string, any> = {
        service_id: pair.sId,
        template_id: pair.tId,
        user_id: cleanPublicKey,
        template_params: templateParams,
      };

      if (cleanPrivateKey) {
        payload.accessToken = cleanPrivateKey;
      }

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (response.ok) {
        return { success: true, status: response.status, text: responseText || 'OK' };
      }

      console.warn(`EmailJS REST call (${pair.sId}, ${pair.tId}) status ${response.status}: ${responseText}`);
    } catch (fetchErr: any) {
      console.warn('Direct EmailJS fetch error:', fetchErr);
    }

    // Attempt 2: Official @emailjs/browser SDK
    try {
      const options: any = { publicKey: cleanPublicKey };
      if (cleanPrivateKey) {
        options.privateKey = cleanPrivateKey;
      }

      const sdkResponse = await emailjs.send(
        pair.sId,
        pair.tId,
        templateParams,
        options
      );

      return {
        success: true,
        status: sdkResponse.status,
        text: sdkResponse.text || 'OK'
      };
    } catch (sdkErr: any) {
      console.warn(`EmailJS SDK (${pair.sId}) failed:`, sdkErr);
    }
  }

  return {
    success: false,
    status: 400,
    text: "Échec d'envoi : Vérifiez votre Service ID (ex: service_xd7n598), Template ID (ex: template_wwt518w) et Public Key."
  };
}

/**
 * Get email logs
 */
export function getEmailLogs(): EmailLogEntry[] {
  const stored = localStorage.getItem(EMAIL_LOGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Add an entry to the email logs
 */
export function addEmailLog(entry: Omit<EmailLogEntry, 'id' | 'timestamp'>): void {
  try {
    const logs = getEmailLogs();
    const newEntry: EmailLogEntry = {
      ...entry,
      id: `LOG-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toLocaleString('fr-FR')
    };
    const updated = [newEntry, ...logs].slice(0, 50); // Keep 50 most recent logs
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not save email log:", err);
  }
}

/**
 * Generates modern, responsive, wide executive HTML according to the CFP-ITMC Academic Charter
 */
export function generateRegistrationHtmlEmail(data: RegistrationEmailData, adminUrl?: string): string {
  const currentYear = new Date().getFullYear();
  const adminLink = adminUrl || `${window.location.origin}/dashboard/registrations`;
  const timeFormatted = data.timeSlot.includes('Soir') ? 'Cours du Soir (17h30 - 20h30)' : 'Cours du Jour (08h30 - 13h30)';
  const cleanPhone = (data.phone || '').replace(/[^0-9+]/g, '');
  const waPhone = cleanPhone.replace('+', '');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dossier de Pré-Inscription — CFP-ITMC Douala</title>
</head>
<body style="margin:0;padding:0;background-color:#0b1329;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;-webkit-font-smoothing:antialiased;line-height:1.5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b1329;padding:30px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container Card (680px Wide for maximum clarity and prestige) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:680px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.35);border:1px solid #1e293b;">
          
          <!-- Official Academic Header -->
          <tr>
            <td style="background-color:#0f172a;padding:32px 36px;text-align:left;border-bottom:4px solid #f59e0b;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="display:inline-block;background-color:#f59e0b;color:#0f172a;font-size:10px;font-weight:900;letter-spacing:1px;padding:4px 10px;border-radius:4px;text-transform:uppercase;margin-bottom:10px;">
                      MINEFOP • RÉPUBLIQUE DU CAMEROUN
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.5px;line-height:1.2;">
                      CFP-ITMC DOUALA LOGPOM
                    </h1>
                    <p style="margin:4px 0 0 0;color:#94a3b8;font-size:13px;font-weight:500;">
                      Centre de Formation Professionnelle Agréé • Douala Logpom
                    </p>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <div style="background-color:#1e293b;border:1px solid #334155;border-radius:10px;padding:10px 16px;text-align:center;">
                      <span style="display:block;font-size:10px;text-transform:uppercase;color:#94a3b8;font-weight:800;letter-spacing:0.5px;">DOSSIER N°</span>
                      <strong style="font-size:15px;color:#f8fafc;font-weight:900;letter-spacing:0.5px;">${data.id}</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notification Status Bar -->
          <tr>
            <td style="background-color:#f8fafc;padding:16px 36px;border-bottom:1px solid #e2e8f0;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="color:#0f172a;font-size:14px;font-weight:800;">
                    <span style="color:#2563eb;margin-right:6px;">●</span> Nouvelle Pré-Inscription en Ligne
                  </td>
                  <td align="right" style="color:#64748b;font-size:12px;font-weight:600;">
                    Reçu le : ${data.registrationDate || new Date().toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding:32px 36px;">

              <!-- Introduction text -->
              <p style="margin:0 0 24px 0;font-size:14px;color:#334155;line-height:1.6;">
                Un candidat vient de compléter avec succès sa demande d'admission sur le portail numérique officiel de l'<strong>CFP-ITMC</strong>. Veuillez trouver ci-après les éléments complets de sa candidature :
              </p>

              <!-- Block 1: Identification Candidat -->
              <div style="margin-bottom:24px;">
                <div style="font-size:12px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;border-left:3px solid #2563eb;padding-left:10px;">
                  1. Identification du Candidat
                </div>
                
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;width:38%;color:#64748b;font-size:13px;font-weight:600;">
                      Nom et Prénom :
                    </td>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;color:#0f172a;font-size:14px;font-weight:800;">
                      ${data.name}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;color:#64748b;font-size:13px;font-weight:600;">
                      Téléphone / WhatsApp :
                    </td>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;color:#0f172a;font-size:14px;font-weight:800;">
                      <a href="tel:${cleanPhone}" style="color:#2563eb;text-decoration:none;font-weight:800;margin-right:12px;">${data.phone}</a>
                      <a href="https://wa.me/${waPhone}" target="_blank" style="display:inline-block;background-color:#22c55e;color:#ffffff;font-size:11px;font-weight:800;padding:3px 8px;border-radius:6px;text-decoration:none;">
                        WhatsApp ↗
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;color:#64748b;font-size:13px;font-weight:600;">
                      Adresse E-mail :
                    </td>
                    <td style="padding:12px 18px;color:#0f172a;font-size:13px;font-weight:700;">
                      ${data.email ? `<a href="mailto:${data.email}" style="color:#2563eb;text-decoration:none;">${data.email}</a>` : '<span style="color:#94a3b8;font-style:italic;">Non renseignée</span>'}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Block 2: Programme Académique -->
              <div style="margin-bottom:28px;">
                <div style="font-size:12px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;border-left:3px solid #f59e0b;padding-left:10px;">
                  2. Programme Académique &amp; Session Choisie
                </div>

                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;width:38%;color:#64748b;font-size:13px;font-weight:600;">
                      Filière / Spécialité :
                    </td>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;color:#0f172a;font-size:14px;font-weight:900;">
                      ${data.specialty}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;color:#64748b;font-size:13px;font-weight:600;">
                      Régime &amp; Horaires :
                    </td>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;color:#047857;font-size:13px;font-weight:800;">
                      ${timeFormatted}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;color:#64748b;font-size:13px;font-weight:600;">
                      Sanction / Diplôme d'État :
                    </td>
                    <td style="padding:12px 18px;color:#b45309;font-size:13px;font-weight:800;">
                      DQP 12 Mois (Diplôme de Qualification Professionnelle) • Examen National MINEFOP
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Administrative Notice Box -->
              <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:top;width:24px;padding-right:12px;">
                      <span style="font-size:18px;line-height:1;">✅</span>
                    </td>
                    <td style="font-size:12px;color:#166534;line-height:1.6;">
                      <strong>Procédure Administrative :</strong> Le dossier est prêt pour validation. Le candidat doit se présenter au campus avec 2 photos 4x4, photocopie CNI, diplôme le plus élevé et acte de naissance.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button Section -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:10px 0 20px 0;">
                    <a href="${adminLink}" target="_blank" style="display:inline-block;background-color:#0f172a;color:#ffffff;font-size:14px;font-weight:800;padding:15px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(15,23,42,0.25);">
                      Ouvrir le Tableau de Bord CFP-ITMC →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Information -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 36px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#64748b;line-height:1.6;">
              <p style="margin:0 0 6px 0;font-weight:800;color:#0f172a;font-size:12px;">
                CENTRE DE FORMATION PROFESSIONNELLE ITMC (CFP-ITMC)
              </p>
              <p style="margin:0 0 8px 0;">
                Douala Logpom, Carrefour Bassong (Face Pharmacie) • Douala, République du Cameroun
              </p>
              <p style="margin:0;color:#94a3b8;font-size:10px;">
                E-mail : cfp.itmc@gmail.com • Agrément Ministériel MINEFOP • Notification automatique © ${currentYear} CFP-ITMC.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates wide, executive HTML for Contact & Orientation requests
 */
export function generateContactHtmlEmail(data: ContactEmailData, adminUrl?: string): string {
  const currentYear = new Date().getFullYear();
  const adminLink = adminUrl || `${window.location.origin}/dashboard/overview`;
  const cleanPhone = (data.phone || '').replace(/[^0-9+]/g, '');
  const waPhone = cleanPhone.replace('+', '');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demande d'Information &amp; Contact — CFP-ITMC</title>
</head>
<body style="margin:0;padding:0;background-color:#0b1329;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;-webkit-font-smoothing:antialiased;line-height:1.5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b1329;padding:30px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container Card (680px Wide) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:680px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.35);border:1px solid #1e293b;">
          
          <!-- Official Academic Header -->
          <tr>
            <td style="background-color:#0f172a;padding:30px 36px;text-align:left;border-bottom:4px solid #2563eb;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:10px;font-weight:900;letter-spacing:1px;padding:4px 10px;border-radius:4px;text-transform:uppercase;margin-bottom:10px;">
                      SERVICE D'ORIENTATION ACADÉMIQUE
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:900;letter-spacing:-0.5px;line-height:1.2;">
                      CFP-ITMC DOUALA LOGPOM
                    </h1>
                    <p style="margin:4px 0 0 0;color:#94a3b8;font-size:13px;font-weight:500;">
                      Formations Professionnelles DQP, CQP &amp; AQP • Renseignements &amp; Inscriptions
                    </p>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <div style="background-color:#1e293b;border:1px solid #334155;border-radius:10px;padding:8px 14px;text-align:center;">
                      <span style="display:block;font-size:9px;text-transform:uppercase;color:#94a3b8;font-weight:800;">STATUT</span>
                      <strong style="font-size:13px;color:#38bdf8;font-weight:900;">NOUVEAU MESSAGE</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sub Header -->
          <tr>
            <td style="background-color:#f8fafc;padding:14px 36px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#475569;">
              <strong>Date de réception :</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:32px 36px;">

              <!-- Visitor Contact Details -->
              <div style="margin-bottom:24px;">
                <div style="font-size:12px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;border-left:3px solid #2563eb;padding-left:10px;">
                  Coordonnées de l'Apprenant / Visiteur
                </div>

                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;width:35%;color:#64748b;font-size:13px;font-weight:600;">
                      Nom Complet :
                    </td>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;color:#0f172a;font-size:14px;font-weight:800;">
                      ${data.fullName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;color:#64748b;font-size:13px;font-weight:600;">
                      Téléphone :
                    </td>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;color:#0f172a;font-size:14px;font-weight:800;">
                      <a href="tel:${cleanPhone}" style="color:#2563eb;text-decoration:none;margin-right:12px;">${data.phone}</a>
                      <a href="https://wa.me/${waPhone}" target="_blank" style="display:inline-block;background-color:#22c55e;color:#ffffff;font-size:11px;font-weight:800;padding:3px 8px;border-radius:6px;text-decoration:none;">
                        WhatsApp ↗
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;color:#64748b;font-size:13px;font-weight:600;">
                      Adresse E-mail :
                    </td>
                    <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;color:#0f172a;font-size:13px;font-weight:700;">
                      ${data.email ? `<a href="mailto:${data.email}" style="color:#2563eb;text-decoration:none;">${data.email}</a>` : '<span style="color:#94a3b8;font-style:italic;">Non renseignée</span>'}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 18px;color:#64748b;font-size:13px;font-weight:600;">
                      Filière Souhaitée :
                    </td>
                    <td style="padding:12px 18px;color:#0f172a;font-size:13px;font-weight:800;">
                      ${data.filiere}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Message Body -->
              <div style="margin-bottom:28px;">
                <div style="font-size:12px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;border-left:3px solid #0f172a;padding-left:10px;">
                  Message Transmis
                </div>

                <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:0 12px 12px 0;padding:18px 22px;color:#1e293b;font-size:14px;line-height:1.7;white-space:pre-wrap;">
                  ${data.message}
                </div>
              </div>

              <!-- Quick Actions -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:10px 0 16px 0;">
                    ${data.email ? `
                      <a href="mailto:${data.email}?subject=Suite à votre demande — CFP-ITMC Douala" style="display:inline-block;background-color:#0f172a;color:#ffffff;font-size:13px;font-weight:800;padding:13px 26px;border-radius:10px;text-decoration:none;margin-right:10px;">
                        ✉️ Répondre par Email
                      </a>
                    ` : ''}
                    <a href="tel:${cleanPhone}" style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:13px;font-weight:800;padding:13px 26px;border-radius:10px;text-decoration:none;">
                      📞 Appeler le Candidat
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 36px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#64748b;line-height:1.6;">
              <p style="margin:0 0 6px 0;font-weight:800;color:#0f172a;font-size:12px;">
                INSTITUT DE FORMATION PROFESSIONNELLE ITMC (CFP-ITMC)
              </p>
              <p style="margin:0 0 8px 0;">
                Douala Logpom, Carrefour Bassong (Face Pharmacie) • Douala, Cameroun
              </p>
              <p style="margin:0;color:#94a3b8;font-size:10px;">
                © ${currentYear} CFP-ITMC. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send an email notification for a candidate registration using EmailJS
 */
export async function sendRegistrationNotification(
  data: RegistrationEmailData
): Promise<{ success: boolean; message: string; isSimulated?: boolean; details?: string }> {
  const config = getEmailJsConfig();

  // Create human readable plain text message
  const plainTextMessage = `
NOUVELLE PRÉ-INSCRIPTION CFP-ITMC DOUALA
-----------------------------------------
Réf Dossier : ${data.id}
Date : ${data.registrationDate || new Date().toLocaleDateString('fr-FR')}

Candidat : ${data.name}
Téléphone : ${data.phone}
Email : ${data.email || 'Non renseigné'}

Spécialité : ${data.specialty}
Horaire choisi : ${data.timeSlot}
Diplôme visé : DQP 12 Mois (Diplôme d'État MINEFOP) / CQP / AQP

Lien Admin : ${window.location.origin}/dashboard/registrations
  `.trim();

  const formattedHtml = generateRegistrationHtmlEmail(data);

  // EmailJS Template Parameters matching all common variable placeholder formats
  const templateParams: Record<string, any> = {
    to_email: config.adminEmail,
    to_name: 'Direction CFP-ITMC',
    from_name: data.name,
    reply_to: data.email || config.adminEmail,
    name: data.name,
    fullName: data.name,
    candidate_name: data.name,
    candidate_first_name: data.firstName || '',
    candidate_last_name: data.lastName || '',
    phone: data.phone,
    candidate_phone: data.phone,
    telephone: data.phone,
    email: data.email || 'non-fourni@candidat.cm',
    candidate_email: data.email || 'non-fourni@candidat.cm',
    specialty: data.specialty,
    specialty_name: data.specialty,
    filiere: data.specialty,
    time_slot: data.timeSlot,
    timeSlot: data.timeSlot,
    registration_id: data.id,
    registration_date: data.registrationDate || new Date().toLocaleDateString('fr-FR'),
    diploma_type: 'DQP (12 Mois) • Agréé MINEFOP',
    admin_url: `${window.location.origin}/dashboard/registrations`,
    message: plainTextMessage,
    message_html: formattedHtml,
    html_body: formattedHtml,
    content: formattedHtml
  };

  // If EmailJS credentials are fully present, perform the real API call
  if (config.serviceId && config.templateId && config.publicKey) {
    const sendResult = await executeEmailJsSend(
      config.serviceId,
      config.templateId,
      templateParams,
      config.publicKey,
      config.privateKey
    );

    if (sendResult.success) {
      console.log('✅ EmailJS Inscription envoyée avec succès:', sendResult.status, sendResult.text);

      addEmailLog({
        type: 'registration',
        recipient: config.adminEmail,
        candidateName: data.name,
        specialtyOrSubject: data.specialty,
        status: 'sent'
      });

      return {
        success: true,
        message: `Notification transmise avec succès à la direction (${config.adminEmail}).`
      };
    } else {
      console.error('❌ Erreur envoi EmailJS:', sendResult.text);

      addEmailLog({
        type: 'registration',
        recipient: config.adminEmail,
        candidateName: data.name,
        specialtyOrSubject: data.specialty,
        status: 'failed',
        errorDetails: sendResult.text
      });

      return {
        success: false,
        message: `Échec d'envoi EmailJS : ${sendResult.text}`,
        details: sendResult.text
      };
    }
  }

  // Fallback mode when keys are not yet filled: log cleanly in storage
  console.info('ℹ️ EmailJS en mode simulation (clés non configurées). Notification enregistrée localement.');
  addEmailLog({
    type: 'registration',
    recipient: config.adminEmail,
    candidateName: data.name,
    specialtyOrSubject: `${data.specialty} (Mode Simulation)`,
    status: 'fallback_logged'
  });

  return {
    success: true,
    isSimulated: true,
    message: `Dossier enregistré ! Notification préparée pour ${config.adminEmail} (Configurez vos clés EmailJS dans Paramètres pour l'envoi en direct).`
  };
}

/**
 * Send an email notification for a contact request using EmailJS
 */
export async function sendContactNotification(
  data: ContactEmailData
): Promise<{ success: boolean; message: string; isSimulated?: boolean; details?: string }> {
  const config = getEmailJsConfig();
  const formattedHtml = generateContactHtmlEmail(data);

  const plainTextMessage = `
MESSAGE DE CONTACT CFP-ITMC
---------------------------
Nom : ${data.fullName}
Téléphone : ${data.phone}
Email : ${data.email || 'Non renseigné'}
Filière : ${data.filiere}

Message :
${data.message}
  `.trim();

  const templateParams: Record<string, any> = {
    to_email: config.adminEmail,
    to_name: 'Direction CFP-ITMC',
    from_name: data.fullName,
    reply_to: data.email || config.adminEmail,
    name: data.fullName,
    fullName: data.fullName,
    candidate_name: data.fullName,
    phone: data.phone,
    candidate_phone: data.phone,
    telephone: data.phone,
    email: data.email || 'visiteur@site.cm',
    candidate_email: data.email || 'visiteur@site.cm',
    specialty: data.filiere,
    specialty_name: data.filiere,
    filiere: data.filiere,
    subject: `Demande de renseignement - ${data.filiere}`,
    message: plainTextMessage,
    message_html: formattedHtml,
    html_body: formattedHtml,
    content: formattedHtml
  };

  const targetTemplateId = config.contactTemplateId || config.templateId;

  if (config.serviceId && targetTemplateId && config.publicKey) {
    const sendResult = await executeEmailJsSend(
      config.serviceId,
      targetTemplateId,
      templateParams,
      config.publicKey,
      config.privateKey
    );

    if (sendResult.success) {
      console.log('✅ EmailJS Contact envoyé avec succès:', sendResult.status, sendResult.text);

      addEmailLog({
        type: 'contact',
        recipient: config.adminEmail,
        candidateName: data.fullName,
        specialtyOrSubject: data.filiere,
        status: 'sent'
      });

      return {
        success: true,
        message: `Votre message a été transmis avec succès à nos conseillers d'orientation (${config.adminEmail}).`
      };
    } else {
      console.error('❌ Erreur envoi EmailJS Contact:', sendResult.text);

      addEmailLog({
        type: 'contact',
        recipient: config.adminEmail,
        candidateName: data.fullName,
        specialtyOrSubject: data.filiere,
        status: 'failed',
        errorDetails: sendResult.text
      });

      return {
        success: false,
        message: `Erreur EmailJS (${sendResult.text}). Vérifiez vos identifiants ou votre clé privée.`,
        details: sendResult.text
      };
    }
  }

  addEmailLog({
    type: 'contact',
    recipient: config.adminEmail,
    candidateName: data.fullName,
    specialtyOrSubject: `${data.filiere} (Mode Simulation)`,
    status: 'fallback_logged'
  });

  return {
    success: true,
    isSimulated: true,
    message: "Votre message a bien été réceptionné par notre équipe !"
  };
}

/**
 * Send a test email to verify EmailJS configuration
 */
export async function sendTestEmailNotification(
  targetEmail?: string
): Promise<{ success: boolean; message: string; details?: string }> {
  const config = getEmailJsConfig();
  const recipient = (targetEmail || config.adminEmail).trim();

  if (!config.serviceId || !config.templateId || !config.publicKey) {
    return {
      success: false,
      message: "Veuillez renseigner au minimum votre Service ID, Template ID et Public Key EmailJS."
    };
  }

  const dummyData: RegistrationEmailData = {
    id: `REG-TEST-${Math.floor(100 + Math.random() * 900)}`,
    name: 'Samuel Eto’o (Candidat Test)',
    firstName: 'Samuel',
    lastName: 'Eto’o',
    phone: '+237 699 00 11 22',
    email: recipient,
    specialty: 'Électricité Industrielle & Bâtiment',
    timeSlot: 'Cours du Jour (08h30 - 13h30)',
    level: 'DQP 12 Mois',
    registrationDate: new Date().toLocaleDateString('fr-FR')
  };

  const formattedHtml = generateRegistrationHtmlEmail(dummyData);

  const templateParams: Record<string, any> = {
    to_email: recipient,
    to_name: 'Administrateur Test CFP-ITMC',
    from_name: 'Test Système CFP-ITMC',
    reply_to: recipient,
    name: dummyData.name,
    fullName: dummyData.name,
    candidate_name: dummyData.name,
    candidate_phone: dummyData.phone,
    candidate_email: dummyData.email,
    phone: dummyData.phone,
    email: dummyData.email,
    specialty: dummyData.specialty,
    specialty_name: dummyData.specialty,
    filiere: dummyData.specialty,
    time_slot: dummyData.timeSlot,
    registration_id: dummyData.id,
    registration_date: dummyData.registrationDate,
    diploma_type: 'DQP (12 Mois) • Test de Réception',
    admin_url: `${window.location.origin}/dashboard/registrations`,
    message: `Ceci est un test de transmission automatique EmailJS pour CFP-ITMC Douala Logpom.`,
    message_html: formattedHtml,
    html_body: formattedHtml,
    content: formattedHtml
  };

  const sendResult = await executeEmailJsSend(
    config.serviceId,
    config.templateId,
    templateParams,
    config.publicKey,
    config.privateKey
  );

  if (sendResult.success) {
    addEmailLog({
      type: 'test',
      recipient,
      candidateName: 'Test Système',
      specialtyOrSubject: 'Test de Configuration EmailJS',
      status: 'sent'
    });

    return {
      success: true,
      message: `E-mail de test envoyé avec succès à ${recipient} ! Vérifiez votre boîte de réception.`
    };
  } else {
    addEmailLog({
      type: 'test',
      recipient,
      candidateName: 'Test Système',
      specialtyOrSubject: 'Échec Test EmailJS',
      status: 'failed',
      errorDetails: sendResult.text
    });

    return {
      success: false,
      message: `Échec du test EmailJS : ${sendResult.text}`,
      details: sendResult.text
    };
  }
}
