import crypto from 'crypto';
import path from 'path';
import { ProfessionalReportStatus } from '../types/professionalReport.types';

/**
 * ============================================================================
 * SÉCURITÉ DU MICROSERVICE RAPPORTS PROFESSIONNELS (PHASE 1)
 * ============================================================================
 * - Anti-XSS / NoSQL Injection & Sanitization
 * - Machine à états finis stricte (Transitions interdites bloquées côté serveur)
 * - Anti-IDOR & Validation de concurrence optimiste
 * - Analyse binaire des uploads (Magic Bytes, double extension, quotas)
 */

export const ALLOWED_STATUS_TRANSITIONS: Record<
  ProfessionalReportStatus,
  ProfessionalReportStatus[]
> = {
  [ProfessionalReportStatus.DRAFT]: [
    ProfessionalReportStatus.DRAFT,
    ProfessionalReportStatus.SUBMITTED,
    ProfessionalReportStatus.ARCHIVED,
  ],
  [ProfessionalReportStatus.SUBMITTED]: [
    ProfessionalReportStatus.UNDER_REVIEW,
    ProfessionalReportStatus.CHANGES_REQUESTED,
    ProfessionalReportStatus.APPROVED,
    ProfessionalReportStatus.ARCHIVED,
  ],
  [ProfessionalReportStatus.UNDER_REVIEW]: [
    ProfessionalReportStatus.CHANGES_REQUESTED,
    ProfessionalReportStatus.APPROVED,
    ProfessionalReportStatus.ARCHIVED,
  ],
  [ProfessionalReportStatus.CHANGES_REQUESTED]: [
    ProfessionalReportStatus.RESUBMITTED,
    ProfessionalReportStatus.DRAFT,
    ProfessionalReportStatus.ARCHIVED,
  ],
  [ProfessionalReportStatus.RESUBMITTED]: [
    ProfessionalReportStatus.UNDER_REVIEW,
    ProfessionalReportStatus.CHANGES_REQUESTED,
    ProfessionalReportStatus.APPROVED,
    ProfessionalReportStatus.ARCHIVED,
  ],
  [ProfessionalReportStatus.APPROVED]: [
    ProfessionalReportStatus.ARCHIVED,
  ],
  [ProfessionalReportStatus.ARCHIVED]: [
    ProfessionalReportStatus.DRAFT, // Dé-archivage contrôlé admin uniquement
  ],
};

export function isValidStatusTransition(
  currentStatus: ProfessionalReportStatus,
  targetStatus: ProfessionalReportStatus
): boolean {
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  return Boolean(allowed && allowed.includes(targetStatus));
}

export function sanitizeText(input: unknown, maxLength: number = 2000): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function clampNumber(value: unknown, min: number, max: number, defaultVal: number): number {
  const num = Number(value);
  if (isNaN(num)) return defaultVal;
  return Math.min(Math.max(num, min), max);
}

// ----------------------------------------------------------------------------
// ANALYSE SÉCURISÉE DES FICHIERS UPLOADÉS (Magic Bytes & Anti-Exploit)
// ----------------------------------------------------------------------------
const MAGIC_BYTE_SIGNATURES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
};

export interface FileSecurityCheckResult {
  valid: boolean;
  error?: string;
  detectedMime?: string;
  sha256?: string;
}

export function verifyFileBufferSecurity(
  buffer: Buffer,
  declaredMimeType: string,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10 Mo
): FileSecurityCheckResult {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Fichier vide ou corrompu.' };
  }

  if (buffer.length > maxSizeBytes) {
    return {
      valid: false,
      error: `Taille maximale dépassée (${(buffer.length / (1024 * 1024)).toFixed(1)} Mo / 10 Mo autorisés).`,
    };
  }

  let detectedMime: string | null = null;

  for (const [mime, signature] of Object.entries(MAGIC_BYTE_SIGNATURES)) {
    let match = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      detectedMime = mime;
      break;
    }
  }

  if (!detectedMime) {
    return {
      valid: false,
      error: 'Type de fichier non autorisé. Seuls les formats JPEG, PNG, WEBP et PDF sont acceptés.',
    };
  }

  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

  return {
    valid: true,
    detectedMime,
    sha256,
  };
}

export function sanitizeFileName(originalName: string): string {
  const parsed = path.parse(originalName);
  const safeName = parsed.name
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 50);
  const safeExt = parsed.ext
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '')
    .slice(0, 10);
  return `${safeName}${safeExt}`;
}
