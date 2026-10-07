/**
 * ============================================================================
 * MICROSERVICE : RAPPORTS PROFESSIONNELS ADAPTATIFS PAR SPÉCIALITÉ
 * ============================================================================
 * Architecture Phase 1 : Moteur dynamique, métamodèle, versionnage,
 * schéma de données normalisé, RBAC/ABAC et sécurité anti-IDOR.
 */

// ----------------------------------------------------------------------------
// 1. STATUTS DU WORKFLOW DE VALIDATION (Machine à États Finis Stricte)
// ----------------------------------------------------------------------------
export enum ProfessionalReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  RESUBMITTED = 'RESUBMITTED',
  APPROVED = 'APPROVED',
  ARCHIVED = 'ARCHIVED',
}

// ----------------------------------------------------------------------------
// 2. CATÉGORIES OFFICIELLES DU CENTRE DE FORMATION
// ----------------------------------------------------------------------------
export type SpecialtyCategory =
  | 'BATIMENT_CONSTRUCTION'
  | 'INDUSTRIE_MECANIQUE_ENERGIE'
  | 'INFORMATIQUE_DIGITAL_COMMUNICATION'
  | 'ADMINISTRATION_COMMERCE_GESTION';

export const SPECIALTY_CATEGORY_CONFIG: Record<
  SpecialtyCategory,
  { label: string; icon: string; badgeColor: string; description: string }
> = {
  BATIMENT_CONSTRUCTION: {
    label: 'Bâtiment, Construction & Travaux',
    icon: '🏗️',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Métiers du gros œuvre, finitions, plomberie, soudure et aménagement technique.',
  },
  INDUSTRIE_MECANIQUE_ENERGIE: {
    label: 'Industrie, Mécanique & Énergie',
    icon: '⚡',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'Systèmes énergétiques, froid, mécanique automobile, électrotechnique et automatisme.',
  },
  INFORMATIQUE_DIGITAL_COMMUNICATION: {
    label: 'Informatique, Digital & Communication',
    icon: '💻',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    description: 'Développement logiciel, réseaux, marketing digital, infographie, sécurité et télécoms.',
  },
  ADMINISTRATION_COMMERCE_GESTION: {
    label: 'Administration, Commerce & Gestion',
    icon: '📊',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'Secrétariat, comptabilité, gestion administrative, caisse et relation client.',
  },
};

// ----------------------------------------------------------------------------
// 3. TYPES DE CHAMPS & SECTIONS DYNAMIQUES DU MOTEUR DE RAPPORTS
// ----------------------------------------------------------------------------
export type FieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'CHECKBOX'
  | 'RADIO'
  | 'DATE'
  | 'TIME'
  | 'MEASUREMENT'
  | 'FILE_UPLOAD'
  | 'KEY_VALUE_LIST'
  | 'TABLE_GRID'
  | 'SAFETY_CHECKLIST'
  | 'RATING_SCALE';

export type SectionType =
  | 'COMMON_HEADER'
  | 'ACTIVITY_CORE'
  | 'SPECIALTY_SPECIFIC'
  | 'SAFETY_RISK_MANAGEMENT'
  | 'DIFFICULTIES_SOLUTIONS'
  | 'TESTS_CONTROLS'
  | 'EVIDENCE_ATTACHMENTS'
  | 'COMPETENCIES_EVALUATION'
  | 'STUDENT_SUMMARY'
  | 'CUSTOM_SECTION';

export interface ReportFieldOption {
  value: string;
  label: string;
  description?: string;
  badgeColor?: string;
}

export interface ReportField {
  id: string;
  key: string;
  label: string;
  placeholder?: string;
  fieldType: FieldType;
  unit?: string; // Ex: "bar", "V", "A", "°C", "m²", "ms", "FCFA", "%"
  options?: ReportFieldOption[];
  isRequired: boolean;
  order: number;
  defaultValue?: any;
  helpText?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  validationRegex?: string;
  gridSpan?: 'full' | 'half' | 'third';
}

export interface ReportSection {
  id: string;
  key: string;
  title: string;
  subtitle?: string;
  icon: string;
  order: number;
  sectionType: SectionType;
  isRequired: boolean;
  isCollapsible?: boolean;
  helpText?: string;
  fields: ReportField[];
}

export interface ReportTemplate {
  id: string;
  specialtyId: string;
  specialtyCode: string;
  specialtyName: string;
  category: SpecialtyCategory;
  version: number;
  title: string;
  description: string;
  icon: string;
  defaultDurationHours: number;
  activityTypes: Array<{ value: string; label: string }>;
  sections: ReportSection[];
  suggestedCompetencies: Array<{
    code: string;
    label: string;
    domain: string;
  }>;
  safetyRulesSummary: string;
  evaluationRubric: {
    criteria: Array<{
      key: string;
      label: string;
      maxPoints: number;
      description: string;
    }>;
    totalPoints: number; // Ex: 20
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 4. ENTITÉS DE DONNÉES DU RAPPORT PROFESSIONNEL
// ----------------------------------------------------------------------------

export interface ReportStepItem {
  id: string;
  order: number;
  title: string;
  description: string;
  durationMinutes: number;
  observations?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
}

export interface ReportMaterialItem {
  id: string;
  name: string;
  reference?: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface ReportToolItem {
  id: string;
  name: string;
  category: string;
  notes?: string;
}

export interface ReportDifficultyItem {
  id: string;
  problem: string;
  cause?: string;
  solution: string;
  result: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ReportTestItem {
  id: string;
  name: string;
  parameter: string;
  expectedValue: string;
  measuredValue: string;
  unit: string;
  status: 'CONFORME' | 'PARTIEL' | 'NON_CONFORME' | 'NA';
  observations?: string;
}

export interface ReportCompetencySelection {
  code: string;
  label: string;
  domain: string;
  studentLevel: 'NON_ACQUIS' | 'EN_COURS' | 'ACQUIS' | 'EXPERT';
  teacherLevel?: 'NON_ACQUIS' | 'EN_COURS' | 'ACQUIS' | 'EXPERT' | null;
  teacherComment?: string;
}

export interface ReportStudentBilan {
  learned: string;
  succeeded: string;
  difficulties: string;
  improvements: string;
  overallScore: number; // 1 - 5
  studentComments?: string;
}

export interface ReportSafetyData {
  ppeEquipmentUsed: string[]; // Liste des EPI utilisés
  safetyBriefingDone: boolean;
  isolationOrPowerOffDone: boolean;
  areaSecured: boolean;
  rulesAppliedNotes: string;
  observations: string;
}

export type AttachmentCategory =
  | 'BEFORE'
  | 'DURING'
  | 'AFTER'
  | 'DOCUMENT'
  | 'SCHEMA'
  | 'SCREENSHOT'
  | 'PROOF';

export interface ReportAttachmentItem {
  id: string;
  reportId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  category: AttachmentCategory;
  caption: string;
  storageRelativePath: string;
  sha256: string;
  uploadedAt: string;
}

export interface ReportEvaluationItem {
  id: string;
  reportId: string;
  revisionNumber: number;
  teacherId: string;
  teacherName: string;
  decision: ProfessionalReportStatus.CHANGES_REQUESTED | ProfessionalReportStatus.APPROVED;
  criteriaScores: Record<string, number>;
  scoreOn20: number;
  generalFeedback: string;
  strengths: string;
  improvementsRequired: string;
  annotatedSections: Array<{
    sectionKey: string;
    comment: string;
    severity: 'INFO' | 'WARNING' | 'REQUIRED';
  }>;
  evaluatedAt: string;
}

export type ReportAuditAction =
  | 'REPORT_CREATED'
  | 'DRAFT_SAVED'
  | 'DRAFT_AUTOSAVED'
  | 'ATTACHMENT_UPLOADED'
  | 'ATTACHMENT_DELETED'
  | 'REPORT_SUBMITTED'
  | 'REVIEW_STARTED'
  | 'CHANGES_REQUESTED'
  | 'REPORT_RESUBMITTED'
  | 'REPORT_APPROVED'
  | 'REPORT_ARCHIVED'
  | 'REPORT_DELETED'
  | 'UNAUTHORIZED_ACCESS_BLOCKED';

export interface ReportEventItem {
  id: string;
  reportId: string;
  actorId: string;
  actorName: string;
  actorRole: 'student' | 'teacher' | 'admin' | 'superadmin' | 'system';
  actorIp: string;
  action: ReportAuditAction;
  fromStatus: ProfessionalReportStatus | null;
  toStatus: ProfessionalReportStatus | null;
  details: string;
  timestamp: string;
}

export interface ReportRevisionItem {
  id: string;
  reportId: string;
  revisionNumber: number;
  snapshot: any;
  submittedAt: string;
  submittedById: string;
  submittedByName: string;
}

// ----------------------------------------------------------------------------
// 5. RAPPORT PROFESSIONNEL COMPLET (Schéma Universel Normalisé)
// ----------------------------------------------------------------------------
export interface ProfessionalReport {
  id: string;
  reportNumber: string; // Ex: RPT-2026-PLOMB-0001
  templateId: string;
  templateVersion: number;
  version: number; // Contrôle de concurrence optimiste anti-écrasement
  lastIdempotencyKey?: string;

  // Identification Étudiant
  studentId: string;
  studentMatricule: string;
  studentName: string;
  studentEmail: string;

  // Rattachement Académique
  specialtyId: string;
  specialtyCode: string;
  specialtyName: string;
  category: SpecialtyCategory;
  formation: string;
  classCode: string;
  academicYear: string;

  // Enseignant Assigné
  assignedTeacherId: string;
  assignedTeacherName: string;

  // Activité & Cadre Temporel
  title: string;
  activityType: string;
  activityDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  location: string;
  clientOrHostOrg: string;
  clientPhone: string;
  clientAddress: string;

  // Description Générale
  problemOrContext: string;
  objectives: string;
  summaryDescription: string;

  // Données Dynamiques Spécifiques à la Spécialité (Champs personnalisés du template)
  dynamicValues: Record<string, any>;

  // Collections Structurées
  steps: ReportStepItem[];
  materials: ReportMaterialItem[];
  tools: ReportToolItem[];
  difficulties: ReportDifficultyItem[];
  testsAndControls: ReportTestItem[];
  competencies: ReportCompetencySelection[];
  safety: ReportSafetyData;
  studentBilan: ReportStudentBilan;

  // Pièces Jointes & Évaluation
  attachments: ReportAttachmentItem[];
  evaluations: ReportEvaluationItem[];
  events: ReportEventItem[];
  revisions: ReportRevisionItem[];

  // Statut & Timestamps
  status: ProfessionalReportStatus;
  currentRevision: number;
  latestScoreOn20: number | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  validatedAt: string | null;
  archivedAt: string | null;
}

export interface ProfessionalReportAggregate {
  report: ProfessionalReport;
  template: ReportTemplate;
  permissions: {
    canEdit: boolean;
    canSubmit: boolean;
    canEvaluate: boolean;
    canDelete: boolean;
    canDownloadPdf: boolean;
  };
}
