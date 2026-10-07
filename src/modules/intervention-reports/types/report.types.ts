/**
 * ============================================================================
 * MICROSERVICE : RAPPORTS D'INTERVENTION (PHASE 2 — MODÈLE COMPLET OPÉRATIONNEL)
 * ============================================================================
 * Modèle de données normalisé et typé pour la gestion des rapports d'intervention
 * techniques et pédagogiques du CFP-ITMC.
 */

export enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  RESUBMITTED = 'RESUBMITTED',
  APPROVED = 'APPROVED',
  ARCHIVED = 'ARCHIVED',
}

export type InterventionType =
  | 'MAINTENANCE'
  | 'INSTALLATION'
  | 'DEPANNAGE'
  | 'DIAGNOSTIC'
  | 'CHANTIER'
  | 'LABORATOIRE'
  | 'PROJET_TECHNIQUE'
  | 'AUDIT_SECURITE';

export type StepPhase =
  | 'PREPARATION'
  | 'DIAGNOSTIC'
  | 'EXECUTION'
  | 'VERIFICATION'
  | 'REMISE_EN_SERVICE';

export type AttachmentCategory =
  | 'BEFORE'
  | 'DURING'
  | 'AFTER'
  | 'DOCUMENT'
  | 'SCHEMA';

export type CompetencyLevel =
  | 'NON_ACQUIS'
  | 'EN_COURS'
  | 'ACQUIS'
  | 'EXPERT';

export type TestResultStatus =
  | 'CONFORME'
  | 'PARTIELLEMENT_CONFORME'
  | 'NON_CONFORME'
  | 'NON_APPLICABLE'
  | 'A_SURVEILLER';

export type DifficultySeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type ToolCategory =
  | 'MESURE'
  | 'OUTILLAGE_MANUEL'
  | 'ELECTROPORTATIF'
  | 'LOGICIEL_DIAGNOSTIC'
  | 'EPI_SECURITE';

export interface SafetyChecklistState {
  epiGlasses: boolean;
  epiGloves: boolean;
  epiHelmet: boolean;
  epiShoes: boolean;
  lockoutTagout: boolean; // Mise hors tension / consignation
  areaSignage: boolean; // Balisage zone
  voltageFreeCheck: boolean; // Vérification absence de tension (VAT)
  emergencyStopChecked: boolean; // Arrêt d'urgence vérifié
  rulesApplied: string;
  observations: string;
}

export interface StudentSelfEvaluationDetail {
  autonomyScore: number; // /5
  technicalMasteryScore: number; // /5
  safetyComplianceScore: number; // /5
  learned: string; // Ce qu'il a appris
  succeeded: string; // Ce qu'il a réussi
  difficultiesFaced: string; // Ses difficultés
  improvementsGoal: string; // Ce qu'il veut améliorer
  studentComment: string; // Synthèse libre
}

/**
 * 1. Entité Principale : `reports`
 */
export interface InterventionReport {
  id: string;
  reportNumber: string; // Ex: RPT-2026-GL-0001
  version: number; // Contrôle de concurrence optimiste (anti-écrasement)
  lastIdempotencyKey?: string;

  // Rattachement Étudiant (vérifié côté serveur)
  studentId: string;
  studentMatricule: string;
  studentName: string;
  studentEmail: string;

  // Rattachement Académique & Pédagogique (vérifié côté serveur)
  specialtyId: string;
  specialtyName: string;
  formation: string; // Pôle / Filière
  classCode: string; // Promotion / Groupe
  academicYear: string; // Ex: 2026-2027

  // Enseignant Responsable / Évaluateur
  assignedTeacherId: string;
  assignedTeacherName: string;

  // Informations Métier de l'Intervention (Étapes 1, 2, 3)
  title: string; // Objet du rapport
  interventionType: InterventionType;
  interventionDate: string;
  startTime: string; // Ex: "08:30"
  endTime: string; // Ex: "12:30"
  durationHours: number; // Calculé ou saisi

  // Client & Lieu (Étape 2)
  clientOrSite: string; // Nom du client ou site
  clientPhone: string; // Téléphone client
  clientAddress: string; // Adresse / Ville
  location: string; // Atelier, Laboratoire, Chantier ou Entreprise

  // Objet & Objectifs (Étape 3)
  problemObserved: string; // Problème constaté initialement
  contextAndObjective: string; // Objectifs de l'intervention
  generalDescription: string; // Description synthétique des travaux

  // Sécurité & Conclusion (Étapes 7 & Bilan)
  safetyMeasures: string;
  safetyChecklist: SafetyChecklistState;
  observations: string;
  conclusion: string;

  // Auto-évaluation détaillée (Étape 9)
  selfEvaluation: StudentSelfEvaluationDetail;

  // État strict du workflow
  status: ReportStatus;
  currentRevision: number;
  latestScoreOn20: number | null;

  // Dates & Timestamps
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  validatedAt: string | null;
  archivedAt: string | null;
}

/**
 * 2. Entité : `report_steps` (Étapes chronologiques de l'intervention)
 */
export interface ReportStep {
  id: string;
  reportId: string;
  stepOrder: number;
  phase: StepPhase;
  title: string;
  description: string;
  durationMinutes: number;
  technicalNotes: string;
  observations?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 3. Entité : `report_materials` (Matériels, composants et consommables utilisés)
 */
export interface ReportMaterial {
  id: string;
  reportId: string;
  name: string;
  reference: string;
  category: string;
  quantity: number;
  unit: string;
  specification: string;
  notes: string;
  createdAt: string;
}

/**
 * 4. Entité : `report_tools` (Outillage, instruments de mesure, EPI et logiciels)
 */
export interface ReportTool {
  id: string;
  reportId: string;
  name: string;
  category: ToolCategory;
  serialOrRef: string;
  calibrationStatus: string;
  usageNotes: string;
  createdAt: string;
}

/**
 * 5. Entité : `report_difficulties` (Pannes, obstacles techniques et résolutions)
 */
export interface ReportDifficulty {
  id: string;
  reportId: string;
  problemEncountered: string;
  rootCause: string;
  solutionApplied: string;
  resultObtained?: string;
  severity: DifficultySeverity;
  resolved: boolean;
  timeLostMinutes: number;
  createdAt: string;
}

/**
 * 6. Entité : `report_tests` (Contrôles, mesures, essais et recette technique)
 */
export interface ReportTest {
  id: string;
  reportId: string;
  testName: string;
  parameterMeasured: string;
  expectedValue: string;
  measuredValue: string;
  unit: string;
  result: TestResultStatus;
  observations: string;
  createdAt: string;
}

/**
 * 7. Entité : `report_competencies` (Compétences professionnelles mobilisées)
 */
export interface ReportCompetency {
  id: string;
  reportId: string;
  code: string;
  label: string;
  domain: string;
  selfLevel: CompetencyLevel;
  teacherLevel: CompetencyLevel | null;
  teacherComment: string;
  createdAt: string;
}

/**
 * 8. Entité : `report_attachments` (Métadonnées des photos Avant/Pendant/Après & documents)
 */
export interface ReportAttachment {
  id: string;
  reportId: string;
  category: AttachmentCategory;
  originalName: string;
  storedFileName: string;
  storageRelativePath: string;
  mimeType: string;
  detectedMagicMime: string;
  sizeBytes: number;
  sha256Checksum: string;
  caption: string;
  stepId: string | null;
  uploadedById: string;
  uploadedByName: string;
  uploadedByRole: string;
  createdAt: string;
}

/**
 * 9. Entité : `report_evaluations` (Évaluations, corrections et validations enseignant)
 */
export interface ReportEvaluation {
  id: string;
  reportId: string;
  revisionNumber: number;
  teacherId: string;
  teacherName: string;
  decision: ReportStatus.UNDER_REVIEW | ReportStatus.CHANGES_REQUESTED | ReportStatus.APPROVED;
  scoreOn20: number | null;
  technicalScoreOn20: number | null;
  methodScoreOn20: number | null;
  safetyScoreOn20: number | null;
  redactionScoreOn20: number | null;
  generalFeedback: string;
  strengths: string;
  improvementsRequired: string;
  annotatedSections: Array<{
    section: string;
    comment: string;
    severity: 'INFO' | 'WARNING' | 'REQUIRED';
  }>;
  evaluatedAt: string;
}

/**
 * 10. Entité : `report_events` (Journal d'audit immuable et traçabilité de sécurité)
 */
export type ReportAuditAction =
  | 'REPORT_CREATED'
  | 'DRAFT_UPDATED'
  | 'DRAFT_AUTOSAVED'
  | 'ATTACHMENT_ADDED'
  | 'ATTACHMENT_REMOVED'
  | 'REPORT_SUBMITTED'
  | 'REVIEW_STARTED'
  | 'CHANGES_REQUESTED'
  | 'REPORT_RESUBMITTED'
  | 'REPORT_APPROVED'
  | 'REPORT_ARCHIVED'
  | 'REPORT_DELETED'
  | 'UNAUTHORIZED_ACCESS_BLOCKED';

export interface ReportEvent {
  id: string;
  reportId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  actorIp: string;
  action: ReportAuditAction;
  fromStatus: ReportStatus | null;
  toStatus: ReportStatus | null;
  details: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * 11. Entité : `report_revisions` (Historique des versions soumises / évaluées)
 */
export interface ReportRevision {
  id: string;
  reportId: string;
  revisionNumber: number;
  statusAtSnapshot: ReportStatus;
  snapshotReason: string;
  createdById: string;
  createdByName: string;
  createdByRole: string;
  snapshotSummary: {
    title: string;
    stepsCount: number;
    materialsCount: number;
    toolsCount: number;
    difficultiesCount: number;
    testsCount: number;
    competenciesCount: number;
    attachmentsCount: number;
  };
  snapshotData: {
    report: Omit<InterventionReport, 'lastIdempotencyKey'>;
    steps: ReportStep[];
    materials: ReportMaterial[];
    tools: ReportTool[];
    difficulties: ReportDifficulty[];
    tests: ReportTest[];
    competencies: ReportCompetency[];
    attachmentIds: string[];
  };
  createdAt: string;
}

/**
 * Agrégat complet retourné lors de la consultation détaillée d'un rapport
 */
export interface InterventionReportAggregate {
  report: InterventionReport;
  steps: ReportStep[];
  materials: ReportMaterial[];
  tools: ReportTool[];
  difficulties: ReportDifficulty[];
  tests: ReportTest[];
  competencies: ReportCompetency[];
  attachments: Array<ReportAttachment & { downloadUrl: string }>;
  evaluations: ReportEvaluation[];
  revisions: Array<Omit<ReportRevision, 'snapshotData'>>;
  events: ReportEvent[];
  permissions: {
    canEdit: boolean;
    canSubmit: boolean;
    canUpload: boolean;
    canReview: boolean;
    canApprove: boolean;
    canRequestChanges: boolean;
    canArchive: boolean;
    canDelete: boolean;
  };
}
