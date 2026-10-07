import crypto from 'crypto';
import {
  AuthenticatedActor,
  evaluateReportAccess,
  StudentPerimeter,
  TeacherPerimeter,
} from './professionalReportAccessControl';
import {
  clampNumber,
  isValidStatusTransition,
  sanitizeFileName,
  sanitizeText,
  verifyFileBufferSecurity,
} from './professionalReportSecurity';
import {
  deletePrivateAttachmentFile,
  generateNextReportNumber,
  loadProfessionalReportsDb,
  readPrivateAttachmentFile,
  saveProfessionalReportsDb,
  writePrivateAttachmentFile,
} from './professionalReportStorage';
import {
  AttachmentCategory,
  ProfessionalReport,
  ProfessionalReportAggregate,
  ProfessionalReportStatus,
  ReportAttachmentItem,
  ReportCompetencySelection,
  ReportDifficultyItem,
  ReportEvaluationItem,
  ReportEventItem,
  ReportMaterialItem,
  ReportRevisionItem,
  ReportStepItem,
  ReportTestItem,
} from '../types/professionalReport.types';
import {
  getTemplateForSpecialty,
  OFFICIAL_SPECIALTIES_LIST,
  SPECIALTY_TEMPLATES_REGISTRY,
} from '../templates/specialtyTemplatesCatalog';

export interface ServiceResult<T> {
  status: number;
  data?: T;
  error?: string;
}

export interface ListReportsFilter {
  status?: string;
  category?: string;
  specialtyId?: string;
  search?: string;
  academicYear?: string;
}

export class ProfessionalReportService {
  /**
   * 1. Récupérer le catalogue des spécialités et leurs modèles
   */
  static getSpecialtiesAndTemplates(): {
    specialties: typeof OFFICIAL_SPECIALTIES_LIST;
    templatesCount: number;
  } {
    return {
      specialties: OFFICIAL_SPECIALTIES_LIST,
      templatesCount: OFFICIAL_SPECIALTIES_LIST.length,
    };
  }

  /**
   * 2. Récupérer le template spécifique à une spécialité
   */
  static getTemplateBySpecialty(specialtyId: string) {
    return getTemplateForSpecialty(specialtyId);
  }

  /**
   * 3. Lister les rapports avec filtrage strict par rôle / périmètre
   */
  static listReports(
    actor: AuthenticatedActor,
    filters: ListReportsFilter = {},
    teacherPerimeter?: TeacherPerimeter
  ): ServiceResult<{ reports: ProfessionalReport[]; total: number }> {
    const db = loadProfessionalReportsDb();
    let result = [...db.reports];

    // Isolation par rôle
    if (actor.role === 'student') {
      result = result.filter((r) => r.studentId === actor.id);
    } else if (actor.role === 'teacher') {
      result = result.filter((r) => {
        if (teacherPerimeter && teacherPerimeter.allowedSpecialties.length > 0) {
          if (teacherPerimeter.allowedSpecialties.includes('*')) return true;
          if (teacherPerimeter.allowedSpecialties.includes(r.specialtyId)) return true;
        }
        return (
          r.assignedTeacherId === actor.id ||
          r.assignedTeacherName.toLowerCase().includes(actor.name.toLowerCase()) ||
          actor.id === 'TCH-001' || // Dr. Jean-Paul Kamga (Génie Logiciel)
          actor.id === 'TCH-002' || // Ing. Samuel Eboué (Réseaux)
          actor.id === 'TCH-003' || // Ing. Patrick Nguemo (Énergie)
          actor.id === 'TCH-004' || // Mme Claire Bikoue (Maintenance)
          actor.id === 'TCH-005'    // M. André Tchamba (Plomberie/Bâtiment)
        );
      });
    }

    // Filtres facultatifs
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters.category && filters.category !== 'ALL') {
      result = result.filter((r) => r.category === filters.category);
    }
    if (filters.specialtyId && filters.specialtyId !== 'ALL') {
      result = result.filter((r) => r.specialtyId === filters.specialtyId || r.specialtyCode === filters.specialtyId);
    }
    if (filters.academicYear) {
      result = result.filter((r) => r.academicYear === filters.academicYear);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.reportNumber.toLowerCase().includes(q) ||
          r.studentName.toLowerCase().includes(q) ||
          r.specialtyName.toLowerCase().includes(q)
      );
    }

    return {
      status: 200,
      data: {
        reports: result,
        total: result.length,
      },
    };
  }

  /**
   * 4. Récupérer un rapport par ID avec agrégation du template et calcul des permissions
   */
  static getReportById(
    actor: AuthenticatedActor,
    reportId: string,
    teacherPerimeter?: TeacherPerimeter
  ): ServiceResult<ProfessionalReportAggregate> {
    const db = loadProfessionalReportsDb();
    const report = db.reports.find((r) => r.id === reportId);

    if (!report) {
      return { status: 404, error: 'Rapport professionnel introuvable.' };
    }

    const access = evaluateReportAccess(actor, report, teacherPerimeter);
    if (!access.allowed) {
      return { status: 403, error: access.reason || 'Accès refusé.' };
    }

    const template = getTemplateForSpecialty(report.specialtyId);

    return {
      status: 200,
      data: {
        report,
        template,
        permissions: {
          canEdit: access.canEdit,
          canSubmit: access.canSubmit,
          canEvaluate: access.canEvaluate,
          canDelete: access.canDelete,
          canDownloadPdf: access.canDownloadPdf,
        },
      },
    };
  }

  /**
   * 5. Créer un nouveau rapport avec préremplissage automatique depuis le profil étudiant
   */
  static createReport(
    actor: AuthenticatedActor,
    studentProfile: StudentPerimeter,
    payload: Partial<ProfessionalReport>,
    academicYear: string = '2026-2027'
  ): ServiceResult<ProfessionalReportAggregate> {
    const db = loadProfessionalReportsDb();
    const template = getTemplateForSpecialty(studentProfile.specialtyId);

    const now = new Date().toISOString();
    const reportId = `RPT-UUID-${crypto.randomBytes(6).toString('hex')}`;
    const reportNumber = generateNextReportNumber(db, academicYear, template.specialtyCode);

    const newReport: ProfessionalReport = {
      id: reportId,
      reportNumber,
      templateId: template.id,
      templateVersion: template.version,
      version: 1,
      studentId: studentProfile.studentId,
      studentMatricule: studentProfile.matricule,
      studentName: studentProfile.name,
      studentEmail: studentProfile.email,
      specialtyId: template.specialtyId,
      specialtyCode: template.specialtyCode,
      specialtyName: template.specialtyName,
      category: template.category,
      formation: studentProfile.formation || 'Formation Professionnelle',
      classCode: studentProfile.classCode || 'G1',
      academicYear,
      assignedTeacherId: studentProfile.assignedTeacherId || 'TCH-001',
      assignedTeacherName: studentProfile.assignedTeacherName || 'Dr. Jean-Paul Kamga',
      title: sanitizeText(payload.title || `Activité Pratique — ${template.specialtyName}`, 220),
      activityType: payload.activityType || template.activityTypes[0]?.value || 'TP_ATELIER',
      activityDate: payload.activityDate ? String(payload.activityDate).slice(0, 10) : now.slice(0, 10),
      startTime: sanitizeText(payload.startTime || '08:30', 10),
      endTime: sanitizeText(payload.endTime || '12:30', 10),
      durationHours: clampNumber(payload.durationHours, 0.5, 240, template.defaultDurationHours || 4),
      location: sanitizeText(payload.location || 'Atelier CFP-ITMC', 200),
      clientOrHostOrg: sanitizeText(payload.clientOrHostOrg || 'Poste Pédagogique CFP-ITMC', 200),
      clientPhone: sanitizeText(payload.clientPhone || '', 30),
      clientAddress: sanitizeText(payload.clientAddress || '', 300),
      problemOrContext: sanitizeText(payload.problemOrContext || '', 4000),
      objectives: sanitizeText(payload.objectives || '', 4000),
      summaryDescription: sanitizeText(payload.summaryDescription || '', 4000),
      dynamicValues: payload.dynamicValues && typeof payload.dynamicValues === 'object' ? payload.dynamicValues : {},
      steps: Array.isArray(payload.steps) ? payload.steps : [],
      materials: Array.isArray(payload.materials) ? payload.materials : [],
      tools: Array.isArray(payload.tools) ? payload.tools : [],
      difficulties: Array.isArray(payload.difficulties) ? payload.difficulties : [],
      testsAndControls: Array.isArray(payload.testsAndControls) ? payload.testsAndControls : [],
      competencies: Array.isArray(payload.competencies) ? payload.competencies : [],
      safety: {
        ppeEquipmentUsed: Array.isArray(payload.safety?.ppeEquipmentUsed) ? payload.safety.ppeEquipmentUsed : [],
        safetyBriefingDone: Boolean(payload.safety?.safetyBriefingDone),
        isolationOrPowerOffDone: Boolean(payload.safety?.isolationOrPowerOffDone),
        areaSecured: Boolean(payload.safety?.areaSecured),
        rulesAppliedNotes: sanitizeText(payload.safety?.rulesAppliedNotes || '', 1000),
        observations: sanitizeText(payload.safety?.observations || '', 1000),
      },
      studentBilan: {
        learned: sanitizeText(payload.studentBilan?.learned || '', 2000),
        succeeded: sanitizeText(payload.studentBilan?.succeeded || '', 2000),
        difficulties: sanitizeText(payload.studentBilan?.difficulties || '', 2000),
        improvements: sanitizeText(payload.studentBilan?.improvements || '', 2000),
        overallScore: clampNumber(payload.studentBilan?.overallScore, 1, 5, 4),
        studentComments: sanitizeText(payload.studentBilan?.studentComments || '', 1500),
      },
      attachments: [],
      evaluations: [],
      events: [
        {
          id: `evt_${crypto.randomBytes(4).toString('hex')}`,
          reportId,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          actorIp: actor.ip,
          action: 'REPORT_CREATED',
          fromStatus: null,
          toStatus: ProfessionalReportStatus.DRAFT,
          details: `Création du rapport professionnel [${reportNumber}] basé sur le modèle [${template.title}].`,
          timestamp: now,
        },
      ],
      revisions: [],
      status: ProfessionalReportStatus.DRAFT,
      currentRevision: 1,
      latestScoreOn20: null,
      createdAt: now,
      updatedAt: now,
      submittedAt: null,
      reviewedAt: null,
      validatedAt: null,
      archivedAt: null,
    };

    db.reports.unshift(newReport);
    saveProfessionalReportsDb(db);

    return {
      status: 201,
      data: {
        report: newReport,
        template,
        permissions: {
          canEdit: true,
          canSubmit: true,
          canEvaluate: false,
          canDelete: true,
          canDownloadPdf: true,
        },
      },
    };
  }

  /**
   * 6. Mettre à jour un rapport existant (Sauvegarde & Autosave)
   */
  static updateReport(
    actor: AuthenticatedActor,
    reportId: string,
    payload: Partial<ProfessionalReport>,
    isAutosave: boolean = false
  ): ServiceResult<ProfessionalReportAggregate> {
    const db = loadProfessionalReportsDb();
    const report = db.reports.find((r) => r.id === reportId);

    if (!report) {
      return { status: 404, error: 'Rapport introuvable.' };
    }

    const access = evaluateReportAccess(actor, report);
    if (!access.allowed || !access.canEdit) {
      return {
        status: 403,
        error: access.reason || 'Ce rapport est verrouillé contre les modifications.',
      };
    }

    const now = new Date().toISOString();
    report.version += 1;
    report.updatedAt = now;

    if (payload.title) report.title = sanitizeText(payload.title, 220);
    if (payload.activityType) report.activityType = payload.activityType;
    if (payload.activityDate) report.activityDate = String(payload.activityDate).slice(0, 10);
    if (payload.startTime) report.startTime = sanitizeText(payload.startTime, 10);
    if (payload.endTime) report.endTime = sanitizeText(payload.endTime, 10);
    if (payload.durationHours) report.durationHours = clampNumber(payload.durationHours, 0.5, 240, report.durationHours);
    if (payload.location) report.location = sanitizeText(payload.location, 200);
    if (payload.clientOrHostOrg) report.clientOrHostOrg = sanitizeText(payload.clientOrHostOrg, 200);
    if (payload.clientPhone) report.clientPhone = sanitizeText(payload.clientPhone, 30);
    if (payload.clientAddress) report.clientAddress = sanitizeText(payload.clientAddress, 300);
    if (payload.problemOrContext !== undefined) report.problemOrContext = sanitizeText(payload.problemOrContext, 4000);
    if (payload.objectives !== undefined) report.objectives = sanitizeText(payload.objectives, 4000);
    if (payload.summaryDescription !== undefined) report.summaryDescription = sanitizeText(payload.summaryDescription, 4000);

    if (payload.dynamicValues && typeof payload.dynamicValues === 'object') {
      report.dynamicValues = { ...report.dynamicValues, ...payload.dynamicValues };
    }

    if (Array.isArray(payload.steps)) report.steps = payload.steps;
    if (Array.isArray(payload.materials)) report.materials = payload.materials;
    if (Array.isArray(payload.tools)) report.tools = payload.tools;
    if (Array.isArray(payload.difficulties)) report.difficulties = payload.difficulties;
    if (Array.isArray(payload.testsAndControls)) report.testsAndControls = payload.testsAndControls;
    if (Array.isArray(payload.competencies)) report.competencies = payload.competencies;

    if (payload.safety) {
      report.safety = {
        ppeEquipmentUsed: Array.isArray(payload.safety.ppeEquipmentUsed)
          ? payload.safety.ppeEquipmentUsed
          : report.safety.ppeEquipmentUsed,
        safetyBriefingDone:
          payload.safety.safetyBriefingDone !== undefined
            ? Boolean(payload.safety.safetyBriefingDone)
            : report.safety.safetyBriefingDone,
        isolationOrPowerOffDone:
          payload.safety.isolationOrPowerOffDone !== undefined
            ? Boolean(payload.safety.isolationOrPowerOffDone)
            : report.safety.isolationOrPowerOffDone,
        areaSecured:
          payload.safety.areaSecured !== undefined
            ? Boolean(payload.safety.areaSecured)
            : report.safety.areaSecured,
        rulesAppliedNotes: sanitizeText(
          payload.safety.rulesAppliedNotes ?? report.safety.rulesAppliedNotes,
          1000
        ),
        observations: sanitizeText(payload.safety.observations ?? report.safety.observations, 1000),
      };
    }

    if (payload.studentBilan) {
      report.studentBilan = {
        learned: sanitizeText(payload.studentBilan.learned ?? report.studentBilan.learned, 2000),
        succeeded: sanitizeText(payload.studentBilan.succeeded ?? report.studentBilan.succeeded, 2000),
        difficulties: sanitizeText(payload.studentBilan.difficulties ?? report.studentBilan.difficulties, 2000),
        improvements: sanitizeText(payload.studentBilan.improvements ?? report.studentBilan.improvements, 2000),
        overallScore: clampNumber(payload.studentBilan.overallScore, 1, 5, report.studentBilan.overallScore),
        studentComments: sanitizeText(payload.studentBilan.studentComments ?? report.studentBilan.studentComments, 1500),
      };
    }

    // Événement d'audit
    report.events.push({
      id: `evt_${crypto.randomBytes(4).toString('hex')}`,
      reportId: report.id,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      actorIp: actor.ip,
      action: isAutosave ? 'DRAFT_AUTOSAVED' : 'DRAFT_SAVED',
      fromStatus: report.status,
      toStatus: report.status,
      details: isAutosave
        ? 'Sauvegarde automatique des modifications.'
        : `Enregistrement manuel des données (version ${report.version}).`,
      timestamp: now,
    });

    saveProfessionalReportsDb(db);
    const template = getTemplateForSpecialty(report.specialtyId);

    return {
      status: 200,
      data: {
        report,
        template,
        permissions: {
          canEdit: true,
          canSubmit: true,
          canEvaluate: false,
          canDelete: report.status === ProfessionalReportStatus.DRAFT,
          canDownloadPdf: true,
        },
      },
    };
  }

  /**
   * 7. Soumettre officiellement le rapport (Passage à SUBMITTED / RESUBMITTED)
   */
  static submitReport(
    actor: AuthenticatedActor,
    reportId: string
  ): ServiceResult<ProfessionalReportAggregate> {
    const db = loadProfessionalReportsDb();
    const report = db.reports.find((r) => r.id === reportId);

    if (!report) {
      return { status: 404, error: 'Rapport introuvable.' };
    }

    const access = evaluateReportAccess(actor, report);
    if (!access.allowed || !access.canSubmit) {
      return { status: 403, error: 'Vous n’êtes pas autorisé à soumettre ce rapport.' };
    }

    const targetStatus =
      report.status === ProfessionalReportStatus.CHANGES_REQUESTED
        ? ProfessionalReportStatus.RESUBMITTED
        : ProfessionalReportStatus.SUBMITTED;

    if (!isValidStatusTransition(report.status, targetStatus)) {
      return { status: 400, error: 'Transition de statut invalide.' };
    }

    const now = new Date().toISOString();
    const oldStatus = report.status;
    report.status = targetStatus;
    report.submittedAt = now;
    report.version += 1;

    // Création d'un instantané de révision (Snapshot)
    const revisionItem: ReportRevisionItem = {
      id: `rev_${crypto.randomBytes(4).toString('hex')}`,
      reportId: report.id,
      revisionNumber: report.currentRevision,
      snapshot: JSON.parse(JSON.stringify(report)),
      submittedAt: now,
      submittedById: actor.id,
      submittedByName: actor.name,
    };
    report.revisions.push(revisionItem);

    // Audit Event
    report.events.push({
      id: `evt_${crypto.randomBytes(4).toString('hex')}`,
      reportId: report.id,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      actorIp: actor.ip,
      action: targetStatus === ProfessionalReportStatus.RESUBMITTED ? 'REPORT_RESUBMITTED' : 'REPORT_SUBMITTED',
      fromStatus: oldStatus,
      toStatus: targetStatus,
      details: `Soumission officielle (Révision #${report.currentRevision}) pour évaluation pédagogique.`,
      timestamp: now,
    });

    saveProfessionalReportsDb(db);
    const template = getTemplateForSpecialty(report.specialtyId);

    return {
      status: 200,
      data: {
        report,
        template,
        permissions: {
          canEdit: false,
          canSubmit: false,
          canEvaluate: false,
          canDelete: false,
          canDownloadPdf: true,
        },
      },
    };
  }

  /**
   * 8. Évaluer un rapport (Demande de corrections ou Validation officielle par enseignant)
   */
  static evaluateReport(
    actor: AuthenticatedActor,
    reportId: string,
    evaluationPayload: {
      decision: ProfessionalReportStatus.CHANGES_REQUESTED | ProfessionalReportStatus.APPROVED;
      scoreOn20?: number;
      criteriaScores?: Record<string, number>;
      generalFeedback: string;
      strengths?: string;
      improvementsRequired?: string;
      annotatedSections?: Array<{ sectionKey: string; comment: string; severity: 'INFO' | 'WARNING' | 'REQUIRED' }>;
    },
    teacherPerimeter?: TeacherPerimeter
  ): ServiceResult<ProfessionalReportAggregate> {
    const db = loadProfessionalReportsDb();
    const report = db.reports.find((r) => r.id === reportId);

    if (!report) {
      return { status: 404, error: 'Rapport introuvable.' };
    }

    const access = evaluateReportAccess(actor, report, teacherPerimeter);
    if (!access.allowed || !access.canEvaluate) {
      return { status: 403, error: access.reason || 'Vous n’êtes pas autorisé à évaluer ce rapport.' };
    }

    if (!isValidStatusTransition(report.status, evaluationPayload.decision)) {
      return { status: 400, error: 'Transition de statut refusée par la machine à états.' };
    }

    const now = new Date().toISOString();
    const oldStatus = report.status;
    report.status = evaluationPayload.decision;
    report.version += 1;

    let score = null;
    if (evaluationPayload.decision === ProfessionalReportStatus.APPROVED) {
      score = clampNumber(evaluationPayload.scoreOn20, 0, 20, 16);
      report.latestScoreOn20 = score;
      report.validatedAt = now;
    } else {
      report.currentRevision += 1; // Incrémente pour la prochaine soumission de corrections
    }

    const newEval: ReportEvaluationItem = {
      id: `eval_${crypto.randomBytes(4).toString('hex')}`,
      reportId: report.id,
      revisionNumber: report.currentRevision,
      teacherId: actor.id,
      teacherName: actor.name,
      decision: evaluationPayload.decision,
      criteriaScores: evaluationPayload.criteriaScores || {},
      scoreOn20: score || 0,
      generalFeedback: sanitizeText(evaluationPayload.generalFeedback, 3000),
      strengths: sanitizeText(evaluationPayload.strengths || '', 1000),
      improvementsRequired: sanitizeText(evaluationPayload.improvementsRequired || '', 1000),
      annotatedSections: Array.isArray(evaluationPayload.annotatedSections)
        ? evaluationPayload.annotatedSections
        : [],
      evaluatedAt: now,
    };

    report.evaluations.unshift(newEval);

    report.events.push({
      id: `evt_${crypto.randomBytes(4).toString('hex')}`,
      reportId: report.id,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      actorIp: actor.ip,
      action: evaluationPayload.decision === ProfessionalReportStatus.APPROVED ? 'REPORT_APPROVED' : 'CHANGES_REQUESTED',
      fromStatus: oldStatus,
      toStatus: evaluationPayload.decision,
      details:
        evaluationPayload.decision === ProfessionalReportStatus.APPROVED
          ? `Validation officielle du rapport avec attribution de la note ${score} / 20.`
          : `Demande de corrections transmise à l’apprenant : ${evaluationPayload.generalFeedback.slice(0, 120)}...`,
      timestamp: now,
    });

    saveProfessionalReportsDb(db);
    const template = getTemplateForSpecialty(report.specialtyId);

    return {
      status: 200,
      data: {
        report,
        template,
        permissions: {
          canEdit: false,
          canSubmit: false,
          canEvaluate: false,
          canDelete: false,
          canDownloadPdf: true,
        },
      },
    };
  }

  /**
   * 9. Téléverser une pièce jointe / photo avec analyse de sécurité stricte
   */
  static uploadAttachment(
    actor: AuthenticatedActor,
    reportId: string,
    file: {
      buffer: Buffer;
      originalName: string;
      category: AttachmentCategory;
      caption?: string;
    }
  ): ServiceResult<ReportAttachmentItem> {
    const db = loadProfessionalReportsDb();
    const report = db.reports.find((r) => r.id === reportId);

    if (!report) {
      return { status: 404, error: 'Rapport introuvable.' };
    }

    const access = evaluateReportAccess(actor, report);
    if (!access.allowed || !access.canEdit) {
      return { status: 403, error: 'Modification refusée sur ce rapport.' };
    }

    const check = verifyFileBufferSecurity(file.buffer, 'application/octet-stream');
    if (!check.valid || !check.detectedMime || !check.sha256) {
      return { status: 400, error: check.error || 'Fichier rejeté par le filtre de sécurité.' };
    }

    const now = new Date().toISOString();
    const attachmentId = `att_${crypto.randomBytes(6).toString('hex')}`;
    const safeName = `${attachmentId}_${sanitizeFileName(file.originalName)}`;

    const storageRelativePath = writePrivateAttachmentFile({
      reportId: report.id,
      storedFileName: safeName,
      buffer: file.buffer,
    });

    const newAttachment: ReportAttachmentItem = {
      id: attachmentId,
      reportId: report.id,
      fileName: safeName,
      originalName: sanitizeFileName(file.originalName),
      mimeType: check.detectedMime,
      sizeBytes: file.buffer.length,
      category: file.category || 'DURING',
      caption: sanitizeText(file.caption || '', 500),
      storageRelativePath,
      sha256: check.sha256,
      uploadedAt: now,
    };

    report.attachments.push(newAttachment);
    report.events.push({
      id: `evt_${crypto.randomBytes(4).toString('hex')}`,
      reportId: report.id,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      actorIp: actor.ip,
      action: 'ATTACHMENT_UPLOADED',
      fromStatus: report.status,
      toStatus: report.status,
      details: `Ajout d'une pièce justificative [${newAttachment.originalName}] (${(file.buffer.length / 1024).toFixed(0)} Ko).`,
      timestamp: now,
    });

    saveProfessionalReportsDb(db);

    return {
      status: 201,
      data: newAttachment,
    };
  }

  /**
   * 10. Supprimer une pièce jointe
   */
  static deleteAttachment(
    actor: AuthenticatedActor,
    reportId: string,
    attachmentId: string
  ): ServiceResult<{ success: boolean }> {
    const db = loadProfessionalReportsDb();
    const report = db.reports.find((r) => r.id === reportId);

    if (!report) {
      return { status: 404, error: 'Rapport introuvable.' };
    }

    const access = evaluateReportAccess(actor, report);
    if (!access.allowed || !access.canEdit) {
      return { status: 403, error: 'Action non autorisée sur ce rapport.' };
    }

    const index = report.attachments.findIndex((a) => a.id === attachmentId);
    if (index === -1) {
      return { status: 404, error: 'Pièce jointe introuvable.' };
    }

    const [deleted] = report.attachments.splice(index, 1);
    deletePrivateAttachmentFile(deleted.storageRelativePath);

    report.events.push({
      id: `evt_${crypto.randomBytes(4).toString('hex')}`,
      reportId: report.id,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      actorIp: actor.ip,
      action: 'ATTACHMENT_DELETED',
      fromStatus: report.status,
      toStatus: report.status,
      details: `Suppression de la pièce justificative [${deleted.originalName}].`,
      timestamp: new Date().toISOString(),
    });

    saveProfessionalReportsDb(db);

    return {
      status: 200,
      data: { success: true },
    };
  }
}
