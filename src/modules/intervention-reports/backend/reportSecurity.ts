import crypto from 'crypto';
import path from 'path';
import {
  AttachmentCategory,
  CompetencyLevel,
  DifficultySeverity,
  InterventionType,
  ReportStatus,
  StepPhase,
  TestResultStatus,
  ToolCategory,
} from '../types/report.types';

/**
 * ============================================================================
 * SÉCURITÉ, VALIDATION, ÉTAT STRICT, ANTI-XSS, MAGIC-BYTES & CONCURRENCE
 * ============================================================================
 */

export const ALLOWED_INTERVENTION_TYPES: readonly InterventionType[] = [
  'MAINTENANCE',
  'INSTALLATION',
  'DEPANNAGE',
  'DIAGNOSTIC',
  'CHANTIER',
  'LABORATOIRE',
  'PROJET_TECHNIQUE',
  'AUDIT_SECURITE',
];

export const ALLOWED_STEP_PHASES: readonly StepPhase[] = [
  'PREPARATION',
  'DIAGNOSTIC',
  'EXECUTION',
  'VERIFICATION',
  'REMISE_EN_SERVICE',
];

export const ALLOWED_ATTACHMENT_CATEGORIES: readonly AttachmentCategory[] = [
  'BEFORE',
  'DURING',
  'AFTER',
  'DOCUMENT',
  'SCHEMA',
];

export const ALLOWED_COMPETENCY_LEVELS: readonly CompetencyLevel[] = [
  'NON_ACQUIS',
  'EN_COURS',
  'ACQUIS',
  'EXPERT',
];

export const ALLOWED_TEST_RESULTS: readonly TestResultStatus[] = [
  'CONFORME',
  'NON_CONFORME',
  'A_SURVEILLER',
];

export const ALLOWED_DIFFICULTY_SEVERITIES: readonly DifficultySeverity[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

export const ALLOWED_TOOL_CATEGORIES: readonly ToolCategory[] = [
  'MESURE',
  'OUTILLAGE_MANUEL',
  'ELECTROPORTATIF',
  'LOGICIEL_DIAGNOSTIC',
  'EPI_SECURITE',
];

/**
 * 1. MACHINE À ÉTATS STRICTE DES STATUTS DE RAPPORT (CONTRÔLÉE CÔTÉ SERVEUR)
 * Empêche toute transition illégale (ex: APPROVED -> DRAFT ou STUDENT -> APPROVED)
 */
const STATUS_TRANSITION_MATRIX: Record<
  ReportStatus,
  Array<{ to: ReportStatus; allowedRoles: Array<'student' | 'teacher' | 'admin'> }>
> = {
  [ReportStatus.DRAFT]: [
    { to: ReportStatus.DRAFT, allowedRoles: ['student', 'admin'] },
    { to: ReportStatus.SUBMITTED, allowedRoles: ['student', 'admin'] },
  ],
  [ReportStatus.SUBMITTED]: [
    { to: ReportStatus.UNDER_REVIEW, allowedRoles: ['teacher', 'admin'] },
    { to: ReportStatus.CHANGES_REQUESTED, allowedRoles: ['teacher', 'admin'] },
    { to: ReportStatus.APPROVED, allowedRoles: ['teacher', 'admin'] },
  ],
  [ReportStatus.UNDER_REVIEW]: [
    { to: ReportStatus.UNDER_REVIEW, allowedRoles: ['teacher', 'admin'] },
    { to: ReportStatus.CHANGES_REQUESTED, allowedRoles: ['teacher', 'admin'] },
    { to: ReportStatus.APPROVED, allowedRoles: ['teacher', 'admin'] },
  ],
  [ReportStatus.CHANGES_REQUESTED]: [
    { to: ReportStatus.CHANGES_REQUESTED, allowedRoles: ['student', 'teacher', 'admin'] },
    { to: ReportStatus.RESUBMITTED, allowedRoles: ['student', 'admin'] },
  ],
  [ReportStatus.RESUBMITTED]: [
    { to: ReportStatus.UNDER_REVIEW, allowedRoles: ['teacher', 'admin'] },
    { to: ReportStatus.CHANGES_REQUESTED, allowedRoles: ['teacher', 'admin'] },
    { to: ReportStatus.APPROVED, allowedRoles: ['teacher', 'admin'] },
  ],
  [ReportStatus.APPROVED]: [
    { to: ReportStatus.ARCHIVED, allowedRoles: ['teacher', 'admin'] },
  ],
  [ReportStatus.ARCHIVED]: [],
};

export function validateStatusTransition(
  currentStatus: ReportStatus,
  targetStatus: ReportStatus,
  actorRole: 'student' | 'teacher' | 'admin' | 'secretary'
): { valid: boolean; error?: string } {
  if (actorRole === 'secretary') {
    return {
      valid: false,
      error: "Le secrétariat n'est pas habilité à modifier l'état d'un rapport d'intervention pédagogique.",
    };
  }

  const transitions = STATUS_TRANSITION_MATRIX[currentStatus] || [];
  const matching = transitions.find((t) => t.to === targetStatus);

  if (!matching) {
    return {
      valid: false,
      error: `Transition d'état interdite : un rapport au statut [${currentStatus}] ne peut pas passer à [${targetStatus}].`,
    };
  }

  if (!matching.allowedRoles.includes(actorRole)) {
    return {
      valid: false,
      error: `Rôle [${actorRole}] non autorisé à effectuer la transition de [${currentStatus}] vers [${targetStatus}].`,
    };
  }

  return { valid: true };
}

/**
 * 2. PROTECTION XSS, HTML INJECTION, TEMPLATE INJECTION & COMMAND/SQL INJECTION
 */
export function sanitizeReportString(input: unknown, maxLength = 4000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\0/g, '') // Null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\/?(iframe|object|embed|form|input|button|meta|link|style|svg|math|base|applet)\b[^>]*>/gi, '')
    .replace(/on[a-z]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '')
    .replace(/(javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, '')
    .replace(/\{\{[\s\S]*?\}\}|\$\{[\s\S]*?\}/g, '') // Neutralize template injection {{...}} / ${...}
    .replace(/<[^>]+>/g, '') // Strip residual HTML tags for strict plain-text safety
    .trim()
    .slice(0, maxLength);
}

export function sanitizeIdentifier(input: unknown, maxLength = 80): string {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[^a-zA-Z0-9_\-.]/g, '').slice(0, maxLength);
}

export function sanitizeSearchQuery(input: unknown, maxLength = 120): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>$;'"\\`{}[\]()]/g, '')
    .slice(0, maxLength);
}

export function isValidIsoDate(input: unknown): boolean {
  if (typeof input !== 'string' || !input.trim()) return false;
  const cleaned = input.trim();
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?)?$/.test(cleaned)) {
    return false;
  }
  const d = new Date(cleaned);
  return !isNaN(d.getTime());
}

export function isValidAcademicYearFormat(input: unknown): boolean {
  if (typeof input !== 'string') return false;
  return /^\d{4}-\d{4}$/.test(input.trim());
}

export function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

/**
 * 3. VALIDATION CENTRALISÉE DES STRUCTURES DE DONNÉES DU RAPPORT
 */
export function validateAndSanitizeSteps(rawSteps: unknown, reportId: string): {
  valid: boolean;
  error?: string;
  steps: any[];
} {
  if (!Array.isArray(rawSteps)) {
    return { valid: true, steps: [] };
  }
  if (rawSteps.length > 50) {
    return { valid: false, error: 'Nombre maximal d’étapes dépassé (max 50 étapes par rapport).', steps: [] };
  }

  const now = new Date().toISOString();
  const sanitized = rawSteps.map((step, idx) => {
    const phase: StepPhase = ALLOWED_STEP_PHASES.includes(step?.phase)
      ? step.phase
      : 'EXECUTION';
    return {
      id: sanitizeIdentifier(step?.id) || `stp_${crypto.randomBytes(6).toString('hex')}`,
      reportId,
      stepOrder: clampNumber(step?.stepOrder, 1, 100, idx + 1),
      phase,
      title: sanitizeReportString(step?.title || `Étape ${idx + 1}`, 200),
      description: sanitizeReportString(step?.description, 3000),
      durationMinutes: clampNumber(step?.durationMinutes, 1, 1440, 30),
      technicalNotes: sanitizeReportString(step?.technicalNotes, 1500),
      completed: Boolean(step?.completed ?? true),
      createdAt: isValidIsoDate(step?.createdAt) ? step.createdAt : now,
      updatedAt: now,
    };
  });

  return { valid: true, steps: sanitized };
}

export function validateAndSanitizeMaterials(rawMaterials: unknown, reportId: string): {
  valid: boolean;
  error?: string;
  materials: any[];
} {
  if (!Array.isArray(rawMaterials)) {
    return { valid: true, materials: [] };
  }
  if (rawMaterials.length > 100) {
    return { valid: false, error: 'Nombre maximal de matériels dépassé (max 100).', materials: [] };
  }

  const now = new Date().toISOString();
  const sanitized = rawMaterials
    .filter((m) => m && typeof m === 'object' && sanitizeReportString(m.name, 150).length > 0)
    .map((m) => ({
      id: sanitizeIdentifier(m?.id) || `mat_${crypto.randomBytes(6).toString('hex')}`,
      reportId,
      name: sanitizeReportString(m.name, 150),
      reference: sanitizeReportString(m.reference, 100),
      category: sanitizeReportString(m.category || 'Composant', 100),
      quantity: clampNumber(m.quantity, 0.01, 100000, 1),
      unit: sanitizeReportString(m.unit || 'Unité', 40),
      specification: sanitizeReportString(m.specification, 300),
      notes: sanitizeReportString(m.notes, 500),
      createdAt: isValidIsoDate(m?.createdAt) ? m.createdAt : now,
    }));

  return { valid: true, materials: sanitized };
}

export function validateAndSanitizeTools(rawTools: unknown, reportId: string): {
  valid: boolean;
  error?: string;
  tools: any[];
} {
  if (!Array.isArray(rawTools)) {
    return { valid: true, tools: [] };
  }
  if (rawTools.length > 80) {
    return { valid: false, error: 'Nombre maximal d’outils dépassé (max 80).', tools: [] };
  }

  const now = new Date().toISOString();
  const sanitized = rawTools
    .filter((t) => t && typeof t === 'object' && sanitizeReportString(t.name, 150).length > 0)
    .map((t) => {
      const category: ToolCategory = ALLOWED_TOOL_CATEGORIES.includes(t?.category)
        ? t.category
        : 'OUTILLAGE_MANUEL';
      return {
        id: sanitizeIdentifier(t?.id) || `tol_${crypto.randomBytes(6).toString('hex')}`,
        reportId,
        name: sanitizeReportString(t.name, 150),
        category,
        serialOrRef: sanitizeReportString(t.serialOrRef, 100),
        calibrationStatus: sanitizeReportString(t.calibrationStatus || 'Vérifié / Opérationnel', 100),
        usageNotes: sanitizeReportString(t.usageNotes, 500),
        createdAt: isValidIsoDate(t?.createdAt) ? t.createdAt : now,
      };
    });

  return { valid: true, tools: sanitized };
}

export function validateAndSanitizeDifficulties(rawDifficulties: unknown, reportId: string): {
  valid: boolean;
  error?: string;
  difficulties: any[];
} {
  if (!Array.isArray(rawDifficulties)) {
    return { valid: true, difficulties: [] };
  }
  if (rawDifficulties.length > 40) {
    return { valid: false, error: 'Nombre maximal de difficultés dépassé (max 40).', difficulties: [] };
  }

  const now = new Date().toISOString();
  const sanitized = rawDifficulties
    .filter((d) => d && typeof d === 'object' && sanitizeReportString(d.problemEncountered, 500).length > 0)
    .map((d) => {
      const severity: DifficultySeverity = ALLOWED_DIFFICULTY_SEVERITIES.includes(d?.severity)
        ? d.severity
        : 'MEDIUM';
      return {
        id: sanitizeIdentifier(d?.id) || `dif_${crypto.randomBytes(6).toString('hex')}`,
        reportId,
        problemEncountered: sanitizeReportString(d.problemEncountered, 800),
        rootCause: sanitizeReportString(d.rootCause, 800),
        solutionApplied: sanitizeReportString(d.solutionApplied, 1200),
        severity,
        resolved: Boolean(d.resolved ?? true),
        timeLostMinutes: clampNumber(d.timeLostMinutes, 0, 1440, 15),
        createdAt: isValidIsoDate(d?.createdAt) ? d.createdAt : now,
      };
    });

  return { valid: true, difficulties: sanitized };
}

export function validateAndSanitizeTests(rawTests: unknown, reportId: string): {
  valid: boolean;
  error?: string;
  tests: any[];
} {
  if (!Array.isArray(rawTests)) {
    return { valid: true, tests: [] };
  }
  if (rawTests.length > 60) {
    return { valid: false, error: 'Nombre maximal de tests dépassé (max 60).', tests: [] };
  }

  const now = new Date().toISOString();
  const sanitized = rawTests
    .filter((t) => t && typeof t === 'object' && sanitizeReportString(t.testName, 200).length > 0)
    .map((t) => {
      const result: TestResultStatus = ALLOWED_TEST_RESULTS.includes(t?.result)
        ? t.result
        : 'CONFORME';
      return {
        id: sanitizeIdentifier(t?.id) || `tst_${crypto.randomBytes(6).toString('hex')}`,
        reportId,
        testName: sanitizeReportString(t.testName, 200),
        parameterMeasured: sanitizeReportString(t.parameterMeasured, 150),
        expectedValue: sanitizeReportString(t.expectedValue, 120),
        measuredValue: sanitizeReportString(t.measuredValue, 120),
        unit: sanitizeReportString(t.unit, 40),
        result,
        observations: sanitizeReportString(t.observations, 600),
        createdAt: isValidIsoDate(t?.createdAt) ? t.createdAt : now,
      };
    });

  return { valid: true, tests: sanitized };
}

export function validateAndSanitizeCompetencies(
  rawCompetencies: unknown,
  reportId: string,
  allowTeacherGrading = false
): {
  valid: boolean;
  error?: string;
  competencies: any[];
} {
  if (!Array.isArray(rawCompetencies)) {
    return { valid: true, competencies: [] };
  }
  if (rawCompetencies.length > 50) {
    return { valid: false, error: 'Nombre maximal de compétences dépassé (max 50).', competencies: [] };
  }

  const now = new Date().toISOString();
  const sanitized = rawCompetencies
    .filter((c) => c && typeof c === 'object' && sanitizeReportString(c.label, 250).length > 0)
    .map((c, idx) => {
      const selfLevel: CompetencyLevel = ALLOWED_COMPETENCY_LEVELS.includes(c?.selfLevel)
        ? c.selfLevel
        : 'EN_COURS';
      const teacherLevel: CompetencyLevel | null =
        allowTeacherGrading && ALLOWED_COMPETENCY_LEVELS.includes(c?.teacherLevel)
          ? c.teacherLevel
          : null;

      return {
        id: sanitizeIdentifier(c?.id) || `cmp_${crypto.randomBytes(6).toString('hex')}`,
        reportId,
        code: sanitizeReportString(c.code || `C${idx + 1}`, 30),
        label: sanitizeReportString(c.label, 250),
        domain: sanitizeReportString(c.domain || 'Compétence Technique', 120),
        selfLevel,
        teacherLevel,
        teacherComment: allowTeacherGrading ? sanitizeReportString(c.teacherComment, 600) : '',
        createdAt: isValidIsoDate(c?.createdAt) ? c.createdAt : now,
      };
    });

  return { valid: true, competencies: sanitized };
}

/**
 * 4. SERVICE D'INSPECTION BINAIRE & SÉCURITÉ DES FICHIERS UPLOADÉS
 */
const DANGEROUS_EXTENSIONS_REGEX =
  /\.(exe|bat|cmd|sh|bash|php|phtml|pl|py|rb|js|mjs|cjs|ts|jsp|asp|aspx|dll|so|dylib|msi|vbs|ps1|scr|com|hta|html|htm|svg|xml|swf|jar|war)(\.|$)/i;

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 Mo max par pièce jointe

export interface VerifiedFileResult {
  valid: boolean;
  error?: string;
  buffer?: Buffer;
  detectedMime?: string;
  safeExtension?: string;
  safeOriginalName?: string;
  storedFileName?: string;
  sha256Checksum?: string;
  sizeBytes?: number;
}

export function inspectAndValidateUploadedFile(params: {
  originalFileName: unknown;
  claimedMimeType?: unknown;
  base64OrDataUrl: unknown;
  category: unknown;
}): VerifiedFileResult {
  const { originalFileName, base64OrDataUrl, category } = params;

  if (!ALLOWED_ATTACHMENT_CATEGORIES.includes(category as AttachmentCategory)) {
    return {
      valid: false,
      error: `Catégorie de pièce jointe invalide. Valeurs autorisées : ${ALLOWED_ATTACHMENT_CATEGORIES.join(', ')}`,
    };
  }

  if (typeof originalFileName !== 'string' || originalFileName.trim().length === 0) {
    return { valid: false, error: 'Le nom original du fichier est requis.' };
  }

  const rawName = path.basename(originalFileName.trim().replace(/\0/g, ''));

  if (DANGEROUS_EXTENSIONS_REGEX.test(rawName)) {
    return {
      valid: false,
      error: `Fichier rejeté par sécurité : extension exécutable ou double extension interdite détectée (${rawName}).`,
    };
  }

  const parts = rawName.split('.');
  if (parts.length > 2) {
    const middleParts = parts.slice(1, -1);
    if (middleParts.some((p) => /^(exe|php|js|sh|bat|cmd|html|svg|py|pl|jsp|asp)$/i.test(p))) {
      return {
        valid: false,
        error: `Fichier rejeté : double extension malveillante détectée (${rawName}).`,
      };
    }
  }

  if (typeof base64OrDataUrl !== 'string' || base64OrDataUrl.trim().length < 16) {
    return { valid: false, error: 'Contenu binaire du fichier manquant ou invalide.' };
  }

  let cleanBase64 = base64OrDataUrl.trim();
  const dataUrlMatch = cleanBase64.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
  if (dataUrlMatch) {
    cleanBase64 = dataUrlMatch[2];
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(cleanBase64, 'base64');
  } catch {
    return { valid: false, error: 'Encodage binaire du fichier corrompu.' };
  }

  if (!buffer || buffer.length < 8) {
    return { valid: false, error: 'Fichier vide ou trop court pour être une image ou un PDF valide.' };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Fichier trop volumineux (${(buffer.length / (1024 * 1024)).toFixed(2)} Mo). Limite fixée à 8 Mo.`,
    };
  }

  if (
    (buffer[0] === 0x4d && buffer[1] === 0x5a) ||
    (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) ||
    (buffer[0] === 0x23 && buffer[1] === 0x21)
  ) {
    return {
      valid: false,
      error: 'Alerte Sécurité : signature binaire exécutable détectée dans le fichier.',
    };
  }

  let detectedMime: string | null = null;
  let safeExtension: string | null = null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    detectedMime = 'image/jpeg';
    safeExtension = 'jpg';
  } else if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    detectedMime = 'image/png';
    safeExtension = 'png';
  } else if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    detectedMime = 'image/webp';
    safeExtension = 'webp';
  } else if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    detectedMime = 'application/pdf';
    safeExtension = 'pdf';
  }

  if (!detectedMime || !safeExtension) {
    return {
      valid: false,
      error:
        'Signature binaire du fichier non reconnue. Seuls les vrais fichiers JPEG, PNG, WEBP et PDF sont autorisés.',
    };
  }

  if (
    (category === 'BEFORE' || category === 'DURING' || category === 'AFTER') &&
    !detectedMime.startsWith('image/')
  ) {
    return {
      valid: false,
      error: `Les preuves visuelles (${category}) doivent obligatoirement être des images authentifiées (JPEG, PNG, WEBP).`,
    };
  }

  const sampleAscii =
    buffer.subarray(0, Math.min(buffer.length, 2048)).toString('latin1') +
    buffer.subarray(Math.max(0, buffer.length - 2048)).toString('latin1');
  if (/<script\b|javascript:|onload\s*=|onerror\s*=|<\?php/i.test(sampleAscii)) {
    return {
      valid: false,
      error: 'Alerte Sécurité : code actif ou script embarqué détecté dans le fichier.',
    };
  }

  const sha256Checksum = crypto.createHash('sha256').update(buffer).digest('hex');
  const randomId = crypto.randomBytes(16).toString('hex');
  const storedFileName = `att_${randomId}.${safeExtension}`;
  const safeOriginalName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);

  return {
    valid: true,
    buffer,
    detectedMime,
    safeExtension,
    safeOriginalName,
    storedFileName,
    sha256Checksum,
    sizeBytes: buffer.length,
  };
}

/**
 * 5. RATE LIMITING GRANULAIRE
 */
const reportRateBuckets = new Map<string, { count: number; resetAt: number }>();

export type ReportRateAction =
  | 'CREATE_REPORT'
  | 'SUBMIT_REPORT'
  | 'UPLOAD_ATTACHMENT'
  | 'SEARCH_REPORTS'
  | 'EVALUATE_REPORT'
  | 'EXPORT_PDF';

const RATE_LIMIT_RULES: Record<ReportRateAction, { max: number; windowMs: number }> = {
  CREATE_REPORT: { max: 15, windowMs: 60_000 },
  SUBMIT_REPORT: { max: 10, windowMs: 60_000 },
  UPLOAD_ATTACHMENT: { max: 25, windowMs: 60_000 },
  SEARCH_REPORTS: { max: 90, windowMs: 60_000 },
  EVALUATE_REPORT: { max: 30, windowMs: 60_000 },
  EXPORT_PDF: { max: 20, windowMs: 60_000 },
};

export function checkReportRateLimit(actorKey: string, action: ReportRateAction): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const rule = RATE_LIMIT_RULES[action];
  const key = `${action}:${actorKey}`;
  const now = Date.now();
  const current = reportRateBuckets.get(key);

  if (!current || now > current.resetAt) {
    reportRateBuckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return { allowed: true };
  }

  current.count += 1;
  if (current.count > rule.max) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

/**
 * 6. MUTEX ATOMIQUE
 */
const activeLocks = new Map<string, Promise<any>>();

export async function withReportMutex<T>(lockKey: string, task: () => Promise<T>): Promise<T> {
  const previous = activeLocks.get(lockKey) || Promise.resolve();
  let releaseLock!: () => void;
  const currentLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });

  activeLocks.set(
    lockKey,
    previous.then(() => currentLock).catch(() => currentLock)
  );

  await previous.catch(() => {});
  try {
    return await task();
  } finally {
    releaseLock();
    if (activeLocks.get(lockKey) === currentLock) {
      activeLocks.delete(lockKey);
    }
  }
}
