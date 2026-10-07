import {
  ProfessionalReport,
  ProfessionalReportStatus,
} from '../types/professionalReport.types';

/**
 * ============================================================================
 * CONTRÔLE D'ACCÈS DU MICROSERVICE RAPPORTS PROFESSIONNELS (RBAC / ABAC)
 * ============================================================================
 * Résolution stricte du périmètre enseignant/étudiant et protection Anti-IDOR.
 */

export interface AuthenticatedActor {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'superadmin';
  permissions?: string[];
  ip: string;
}

export interface StudentPerimeter {
  studentId: string;
  matricule: string;
  name: string;
  email: string;
  specialtyId: string;
  specialtyName: string;
  formation: string;
  classCode: string;
  assignedTeacherId: string;
  assignedTeacherName: string;
}

export interface TeacherPerimeter {
  teacherId: string;
  name: string;
  email: string;
  allowedSpecialties: string[]; // IDs des spécialités autorisées
  allowedClassCodes: string[];
  isCoordinator: boolean;
}

export interface AccessEvaluationResult {
  allowed: boolean;
  reason?: string;
  canEdit: boolean;
  canSubmit: boolean;
  canEvaluate: boolean;
  canDelete: boolean;
  canDownloadPdf: boolean;
}

export function evaluateReportAccess(
  actor: AuthenticatedActor,
  report: ProfessionalReport,
  teacherPerimeter?: TeacherPerimeter
): AccessEvaluationResult {
  // 1. Super Admin / Admin : Accès universel
  if (actor.role === 'admin' || actor.role === 'superadmin') {
    return {
      allowed: true,
      canEdit: true,
      canSubmit: true,
      canEvaluate: true,
      canDelete: true,
      canDownloadPdf: true,
    };
  }

  // 2. Étudiant : Isolation stricte sur son propre studentId (Anti-IDOR)
  if (actor.role === 'student') {
    if (report.studentId !== actor.id) {
      return {
        allowed: false,
        reason: 'Violation Anti-IDOR : Vous n’êtes pas autorisé à accéder au rapport d’un autre apprenant.',
        canEdit: false,
        canSubmit: false,
        canEvaluate: false,
        canDelete: false,
        canDownloadPdf: false,
      };
    }

    const isEditableStatus =
      report.status === ProfessionalReportStatus.DRAFT ||
      report.status === ProfessionalReportStatus.CHANGES_REQUESTED;

    return {
      allowed: true,
      canEdit: isEditableStatus,
      canSubmit: isEditableStatus,
      canEvaluate: false,
      canDelete: report.status === ProfessionalReportStatus.DRAFT,
      canDownloadPdf: true,
    };
  }

  // 3. Enseignant : Filtrage par périmètre de spécialités & classes autorisées
  if (actor.role === 'teacher') {
    if (teacherPerimeter) {
      const hasSpecialtyAccess =
        teacherPerimeter.allowedSpecialties.includes('*') ||
        teacherPerimeter.allowedSpecialties.includes(report.specialtyId) ||
        teacherPerimeter.teacherId === report.assignedTeacherId;

      if (!hasSpecialtyAccess) {
        return {
          allowed: false,
          reason: `Accès refusé : Ce rapport relève de la filière [${report.specialtyName}], hors de votre périmètre d’évaluation.`,
          canEdit: false,
          canSubmit: false,
          canEvaluate: false,
          canDelete: false,
          canDownloadPdf: false,
        };
      }
    }

    const canEvaluate =
      report.status === ProfessionalReportStatus.SUBMITTED ||
      report.status === ProfessionalReportStatus.UNDER_REVIEW ||
      report.status === ProfessionalReportStatus.RESUBMITTED;

    return {
      allowed: true,
      canEdit: false,
      canSubmit: false,
      canEvaluate,
      canDelete: false,
      canDownloadPdf: true,
    };
  }

  return {
    allowed: false,
    reason: 'Rôle non reconnu ou non autorisé.',
    canEdit: false,
    canSubmit: false,
    canEvaluate: false,
    canDelete: false,
    canDownloadPdf: false,
  };
}
