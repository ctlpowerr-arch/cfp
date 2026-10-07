import crypto from 'crypto';
import {
  AttachmentCategory,
  InterventionReport,
  InterventionReportAggregate,
  InterventionType,
  ReportAttachment,
  ReportAuditAction,
  ReportEvaluation,
  ReportEvent,
  ReportRevision,
  ReportStatus,
} from '../types/report.types';
import {
  AuthenticatedActor,
  resolveStudentProfileFromServer,
  resolveTeacherPerimeterFromServer,
  resolveValidAcademicYear,
  specialtiesMatch,
  verifyReportAccess,
} from './reportAccessControl';
import {
  ALLOWED_INTERVENTION_TYPES,
  clampNumber,
  inspectAndValidateUploadedFile,
  isValidIsoDate,
  sanitizeIdentifier,
  sanitizeReportString,
  sanitizeSearchQuery,
  validateAndSanitizeCompetencies,
  validateAndSanitizeDifficulties,
  validateAndSanitizeMaterials,
  validateAndSanitizeSteps,
  validateAndSanitizeTests,
  validateAndSanitizeTools,
  validateStatusTransition,
  withReportMutex,
} from './reportSecurity';
import {
  deletePrivateAttachmentFile,
  generateNextReportNumber,
  loadInterventionReportsDb,
  readPrivateAttachmentFile,
  saveInterventionReportsDb,
  writePrivateAttachmentFile,
} from './reportStorage';

export interface ExternalSystemContext {
  actor: AuthenticatedActor;
  actorIp: string;
  studentsDb: any[];
  teachersDb: any[];
  classesDb: any[];
  specialtyRegistry: Array<{ id: string; name: string; code: string; filiere: string }>;
  academicYearsDb: any[];
  onSystemAuditLog?: (action: string, details: string, severity?: 'info' | 'warning' | 'critical') => void;
  onEmitNotification?: (notification: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'urgent';
    targetRole?: string;
    targetUserId?: string;
    link?: string;
  }) => void;
}

function recordReportEvent(params: {
  reportId: string;
  actor: AuthenticatedActor;
  actorIp: string;
  action: ReportAuditAction;
  fromStatus: ReportStatus | null;
  toStatus: ReportStatus | null;
  details: string;
  metadata?: Record<string, any>;
}): ReportEvent {
  const db = loadInterventionReportsDb();
  const evt: ReportEvent = {
    id: `evt_${crypto.randomBytes(8).toString('hex')}`,
    reportId: params.reportId,
    actorId: params.actor.id,
    actorName: params.actor.name,
    actorRole: params.actor.role,
    actorIp: params.actorIp,
    action: params.action,
    fromStatus: params.fromStatus,
    toStatus: params.toStatus,
    details: params.details,
    metadata: params.metadata,
    timestamp: new Date().toISOString(),
  };
  db.report_events.unshift(evt);
  if (db.report_events.length > 5000) {
    db.report_events = db.report_events.slice(0, 5000);
  }
  return evt;
}

function createRevisionSnapshot(params: {
  report: InterventionReport;
  actor: AuthenticatedActor;
  reason: string;
}): ReportRevision {
  const db = loadInterventionReportsDb();
  const steps = db.report_steps
    .filter((s) => s.reportId === params.report.id)
    .sort((a, b) => a.stepOrder - b.stepOrder);
  const materials = db.report_materials.filter((m) => m.reportId === params.report.id);
  const tools = db.report_tools.filter((t) => t.reportId === params.report.id);
  const difficulties = db.report_difficulties.filter((d) => d.reportId === params.report.id);
  const tests = db.report_tests.filter((t) => t.reportId === params.report.id);
  const competencies = db.report_competencies.filter((c) => c.reportId === params.report.id);
  const attachments = db.report_attachments.filter((a) => a.reportId === params.report.id);

  const { lastIdempotencyKey: _ignored, ...cleanReport } = params.report;

  const revision: ReportRevision = {
    id: `rev_${crypto.randomBytes(8).toString('hex')}`,
    reportId: params.report.id,
    revisionNumber: params.report.currentRevision,
    statusAtSnapshot: params.report.status,
    snapshotReason: params.reason,
    createdById: params.actor.id,
    createdByName: params.actor.name,
    createdByRole: params.actor.role,
    snapshotSummary: {
      title: params.report.title,
      stepsCount: steps.length,
      materialsCount: materials.length,
      toolsCount: tools.length,
      difficultiesCount: difficulties.length,
      testsCount: tests.length,
      competenciesCount: competencies.length,
      attachmentsCount: attachments.length,
    },
    snapshotData: {
      report: cleanReport,
      steps,
      materials,
      tools,
      difficulties,
      tests,
      competencies,
      attachmentIds: attachments.map((a) => a.id),
    },
    createdAt: new Date().toISOString(),
  };

  db.report_revisions.unshift(revision);
  return revision;
}

export function listAndSearchReports(
  ctx: ExternalSystemContext,
  query: {
    academicYear?: string;
    status?: string;
    specialty?: string;
    formation?: string;
    classCode?: string;
    studentId?: string;
    teacherId?: string;
    interventionType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  const db = loadInterventionReportsDb();
  const teacherPerimeter =
    ctx.actor.role === 'teacher'
      ? resolveTeacherPerimeterFromServer({
          actor: ctx.actor,
          teachersDb: ctx.teachersDb,
          classesDb: ctx.classesDb,
          specialtyRegistry: ctx.specialtyRegistry,
        })
      : null;

  const accessibleReports = db.reports.filter((report) => {
    const access = verifyReportAccess({
      actor: ctx.actor,
      report,
      teacherPerimeter,
    });
    return access.allowed;
  });

  const cleanSearch = sanitizeSearchQuery(query.search).toLowerCase();
  const cleanStatus = sanitizeIdentifier(query.status);
  const cleanSpecialty = sanitizeReportString(query.specialty, 100);
  const cleanFormation = sanitizeReportString(query.formation, 100);
  const cleanClassCode = sanitizeReportString(query.classCode, 40);
  const cleanStudentId = sanitizeIdentifier(query.studentId);
  const cleanTeacherId = sanitizeIdentifier(query.teacherId);
  const cleanType = sanitizeIdentifier(query.interventionType);
  const cleanYear = query.academicYear ? sanitizeReportString(query.academicYear, 20) : '';

  const filtered = accessibleReports.filter((r) => {
    if (cleanYear && cleanYear !== 'ALL' && r.academicYear !== cleanYear) {
      return false;
    }
    if (cleanStatus && cleanStatus !== 'ALL' && r.status !== cleanStatus) {
      return false;
    }
    if (cleanSpecialty && cleanSpecialty !== 'ALL' && !specialtiesMatch(r.specialtyName, cleanSpecialty)) {
      return false;
    }
    if (
      cleanFormation &&
      cleanFormation !== 'ALL' &&
      r.formation.toLowerCase() !== cleanFormation.toLowerCase()
    ) {
      return false;
    }
    if (
      cleanClassCode &&
      cleanClassCode !== 'ALL' &&
      r.classCode.toLowerCase() !== cleanClassCode.toLowerCase()
    ) {
      return false;
    }
    if (cleanStudentId && cleanStudentId !== 'ALL' && r.studentId !== cleanStudentId) {
      return false;
    }
    if (cleanTeacherId && cleanTeacherId !== 'ALL' && r.assignedTeacherId !== cleanTeacherId) {
      return false;
    }
    if (cleanType && cleanType !== 'ALL' && r.interventionType !== cleanType) {
      return false;
    }
    if (cleanSearch) {
      const haystack = [
        r.reportNumber,
        r.title,
        r.studentName,
        r.studentMatricule,
        r.specialtyName,
        r.formation,
        r.classCode,
        r.location,
        r.clientOrSite,
        r.assignedTeacherName,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(cleanSearch)) {
        return false;
      }
    }
    return true;
  });

  filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const enrichedItems = filtered.map((r) => {
    const stepsCount = db.report_steps.filter((s) => s.reportId === r.id).length;
    const attachmentsCount = db.report_attachments.filter((a) => a.reportId === r.id).length;
    const evaluationsCount = db.report_evaluations.filter((e) => e.reportId === r.id).length;
    const testsCount = db.report_tests.filter((t) => t.reportId === r.id).length;
    const access = verifyReportAccess({
      actor: ctx.actor,
      report: r,
      teacherPerimeter,
    });
    return {
      ...r,
      counts: {
        steps: stepsCount,
        attachments: attachmentsCount,
        evaluations: evaluationsCount,
        tests: testsCount,
      },
      permissions: access.permissions,
    };
  });

  const yearScopedReports = accessibleReports.filter(
    (r) => !cleanYear || cleanYear === 'ALL' || r.academicYear === cleanYear
  );
  const scoredReports = yearScopedReports.filter(
    (r) => typeof r.latestScoreOn20 === 'number' && !isNaN(r.latestScoreOn20)
  );
  const averageScoreOn20 =
    scoredReports.length > 0
      ? Number(
          (
            scoredReports.reduce((acc, item) => acc + (item.latestScoreOn20 || 0), 0) /
            scoredReports.length
          ).toFixed(2)
        )
      : null;

  const stats = {
    totalAccessible: yearScopedReports.length,
    byStatus: {
      DRAFT: yearScopedReports.filter((r) => r.status === ReportStatus.DRAFT).length,
      SUBMITTED: yearScopedReports.filter((r) => r.status === ReportStatus.SUBMITTED).length,
      UNDER_REVIEW: yearScopedReports.filter((r) => r.status === ReportStatus.UNDER_REVIEW).length,
      CHANGES_REQUESTED: yearScopedReports.filter((r) => r.status === ReportStatus.CHANGES_REQUESTED).length,
      RESUBMITTED: yearScopedReports.filter((r) => r.status === ReportStatus.RESUBMITTED).length,
      APPROVED: yearScopedReports.filter((r) => r.status === ReportStatus.APPROVED).length,
      ARCHIVED: yearScopedReports.filter((r) => r.status === ReportStatus.ARCHIVED).length,
    },
    pendingTeacherActionCount: yearScopedReports.filter(
      (r) =>
        r.status === ReportStatus.SUBMITTED ||
        r.status === ReportStatus.UNDER_REVIEW ||
        r.status === ReportStatus.RESUBMITTED
    ).length,
    averageScoreOn20,
    totalHoursLogged: yearScopedReports.reduce((acc, r) => acc + (Number(r.durationHours) || 0), 0),
  };

  const page = clampNumber(query.page, 1, 1000, 1);
  const limit = clampNumber(query.limit, 1, 200, 50);
  const startIndex = (page - 1) * limit;
  const paginatedItems = enrichedItems.slice(startIndex, startIndex + limit);

  return {
    items: paginatedItems,
    pagination: {
      total: enrichedItems.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(enrichedItems.length / limit)),
    },
    stats,
    actorPerimeter:
      ctx.actor.role === 'teacher' && teacherPerimeter
        ? {
            role: 'teacher',
            teacherId: teacherPerimeter.teacherId,
            teacherName: teacherPerimeter.teacherName,
            authorizedSpecialties: teacherPerimeter.rawSpecialties,
            authorizedClasses: teacherPerimeter.rawClasses,
          }
        : {
            role: ctx.actor.role,
          },
  };
}

export function getReportAggregateById(
  ctx: ExternalSystemContext,
  rawReportId: string
): { status: number; error?: string; data?: InterventionReportAggregate } {
  const reportId = sanitizeIdentifier(rawReportId);
  if (!reportId) {
    return { status: 400, error: 'Identifiant de rapport invalide.' };
  }

  const db = loadInterventionReportsDb();
  const report = db.reports.find((r) => r.id === reportId || r.reportNumber === reportId);

  if (!report) {
    return { status: 404, error: 'Rapport d’intervention introuvable.' };
  }

  const teacherPerimeter =
    ctx.actor.role === 'teacher'
      ? resolveTeacherPerimeterFromServer({
          actor: ctx.actor,
          teachersDb: ctx.teachersDb,
          classesDb: ctx.classesDb,
          specialtyRegistry: ctx.specialtyRegistry,
        })
      : null;

  const access = verifyReportAccess({
    actor: ctx.actor,
    report,
    teacherPerimeter,
  });

  if (!access.allowed) {
    recordReportEvent({
      reportId: report.id,
      actor: ctx.actor,
      actorIp: ctx.actorIp,
      action: 'UNAUTHORIZED_ACCESS_BLOCKED',
      fromStatus: report.status,
      toStatus: report.status,
      details: access.reason || 'Tentative d’accès non autorisée bloquée.',
    });
    saveInterventionReportsDb(db);
    ctx.onSystemAuditLog?.(
      'REPORT_ANTI_IDOR_BLOCKED',
      `Accès refusé sur le rapport ${report.reportNumber} (${report.id}) pour ${ctx.actor.name} [${ctx.actor.role}] : ${access.reason}`,
      'warning'
    );
    return { status: 403, error: access.reason || 'Accès interdit à ce rapport.' };
  }

  const steps = db.report_steps
    .filter((s) => s.reportId === report.id)
    .sort((a, b) => a.stepOrder - b.stepOrder);
  const materials = db.report_materials.filter((m) => m.reportId === report.id);
  const tools = db.report_tools.filter((t) => t.reportId === report.id);
  const difficulties = db.report_difficulties.filter((d) => d.reportId === report.id);
  const tests = db.report_tests.filter((t) => t.reportId === report.id);
  const competencies = db.report_competencies.filter((c) => c.reportId === report.id);
  const attachments = db.report_attachments
    .filter((a) => a.reportId === report.id)
    .map((att) => ({
      ...att,
      downloadUrl: `/api/intervention-reports/${encodeURIComponent(report.id)}/attachments/${encodeURIComponent(att.id)}/download`,
    }));
  const evaluations = db.report_evaluations
    .filter((e) => e.reportId === report.id)
    .sort((a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime());
  const revisions = db.report_revisions
    .filter((rev) => rev.reportId === report.id)
    .map(({ snapshotData: _omit, ...summary }) => summary);
  const events = db.report_events
    .filter((evt) => evt.reportId === report.id)
    .slice(0, 100);

  return {
    status: 200,
    data: {
      report,
      steps,
      materials,
      tools,
      difficulties,
      tests,
      competencies,
      attachments,
      evaluations,
      revisions,
      events,
      permissions: access.permissions,
    },
  };
}

export async function createInterventionReport(
  ctx: ExternalSystemContext,
  payload: Record<string, any>
): Promise<{ status: number; error?: string; data?: InterventionReportAggregate }> {
  if (ctx.actor.role !== 'student' && ctx.actor.role !== 'admin') {
    return {
      status: 403,
      error: 'Seuls les étudiants (ou un administrateur habilité) peuvent initier un rapport d’intervention.',
    };
  }

  return withReportMutex(`create:${ctx.actor.id}`, async () => {
    const db = loadInterventionReportsDb();

    const idempotencyKey = sanitizeIdentifier(payload?.idempotencyKey, 80);
    if (idempotencyKey) {
      const existingByKey = db.reports.find(
        (r) => r.lastIdempotencyKey === idempotencyKey && r.studentId === ctx.actor.id
      );
      if (existingByKey) {
        return getReportAggregateById(ctx, existingByKey.id);
      }
    }

    const resolvedStudent = resolveStudentProfileFromServer({
      actor: ctx.actor,
      targetStudentId: ctx.actor.role === 'admin' ? sanitizeIdentifier(payload?.studentId) : undefined,
      studentsDb: ctx.studentsDb,
      teachersDb: ctx.teachersDb,
      classesDb: ctx.classesDb,
      specialtyRegistry: ctx.specialtyRegistry,
      academicYearsDb: ctx.academicYearsDb,
    });

    if (!resolvedStudent.found || !resolvedStudent.profile) {
      return { status: 400, error: resolvedStudent.error || 'Profil étudiant introuvable.' };
    }

    const profile = resolvedStudent.profile;
    const academicYear = resolveValidAcademicYear(
      payload?.academicYear || profile.academicYear,
      ctx.academicYearsDb
    );

    const specEntry = ctx.specialtyRegistry.find(
      (s) => s.id === profile.specialtyId || specialtiesMatch(s.name, profile.specialtyName)
    );
    const specialtyCode = specEntry?.code || 'GEN';

    const title = sanitizeReportString(payload?.title, 220);
    if (!title || title.length < 5) {
      return {
        status: 400,
        error: 'L’objet / titre du rapport d’intervention est obligatoire (minimum 5 caractères).',
      };
    }

    const interventionType: InterventionType = ALLOWED_INTERVENTION_TYPES.includes(
      payload?.interventionType
    )
      ? payload.interventionType
      : 'MAINTENANCE';

    const now = new Date().toISOString();
    const reportId = `RPT-UUID-${crypto.randomBytes(6).toString('hex')}`;
    const reportNumber = generateNextReportNumber(db, academicYear, specialtyCode);

    const interventionDate = isValidIsoDate(payload?.interventionDate)
      ? String(payload.interventionDate).slice(0, 10)
      : now.slice(0, 10);

    const newReport: InterventionReport = {
      id: reportId,
      reportNumber,
      version: 1,
      lastIdempotencyKey: idempotencyKey || undefined,
      studentId: profile.id,
      studentMatricule: profile.matricule,
      studentName: profile.name,
      studentEmail: profile.email,
      specialtyId: profile.specialtyId,
      specialtyName: profile.specialtyName,
      formation: profile.formation,
      classCode: profile.classCode,
      academicYear,
      assignedTeacherId: profile.assignedTeacherId,
      assignedTeacherName: profile.assignedTeacherName,
      title,
      interventionType,
      startTime: sanitizeReportString(payload?.startTime || '08:30', 10),
      endTime: sanitizeReportString(payload?.endTime || '12:30', 10),
      clientPhone: sanitizeReportString(payload?.clientPhone || '', 30),
      clientAddress: sanitizeReportString(payload?.clientAddress || '', 300),
      location: sanitizeReportString(payload?.location || 'Atelier Technique CFP-ITMC', 200),
      clientOrSite: sanitizeReportString(payload?.clientOrSite || 'Poste d’intervention pédagogique', 200),
      problemObserved: sanitizeReportString(payload?.problemObserved || '', 3000),
      contextAndObjective: sanitizeReportString(payload?.contextAndObjective, 4000),
      generalDescription: sanitizeReportString(payload?.generalDescription, 4000),
      safetyMeasures: sanitizeReportString(payload?.safetyMeasures, 2500),
      safetyChecklist: {
        epiGlasses: Boolean(payload?.safetyChecklist?.epiGlasses),
        epiGloves: Boolean(payload?.safetyChecklist?.epiGloves),
        epiHelmet: Boolean(payload?.safetyChecklist?.epiHelmet),
        epiShoes: Boolean(payload?.safetyChecklist?.epiShoes),
        lockoutTagout: Boolean(payload?.safetyChecklist?.lockoutTagout),
        areaSignage: Boolean(payload?.safetyChecklist?.areaSignage),
        voltageFreeCheck: Boolean(payload?.safetyChecklist?.voltageFreeCheck),
        emergencyStopChecked: Boolean(payload?.safetyChecklist?.emergencyStopChecked),
        rulesApplied: sanitizeReportString(payload?.safetyChecklist?.rulesApplied || '', 1000),
        observations: sanitizeReportString(payload?.safetyChecklist?.observations || '', 1000),
      },
      observations: sanitizeReportString(payload?.observations, 3000),
      conclusion: sanitizeReportString(payload?.conclusion, 3000),
      selfEvaluation: {
        autonomyScore: clampNumber(payload?.selfEvaluation?.autonomyScore, 1, 5, 3),
        technicalMasteryScore: clampNumber(payload?.selfEvaluation?.technicalMasteryScore, 1, 5, 3),
        safetyComplianceScore: clampNumber(payload?.selfEvaluation?.safetyComplianceScore, 1, 5, 4),
        learned: sanitizeReportString(payload?.selfEvaluation?.learned, 2000),
        succeeded: sanitizeReportString(payload?.selfEvaluation?.succeeded, 2000),
        difficultiesFaced: sanitizeReportString(payload?.selfEvaluation?.difficultiesFaced, 2000),
        improvementsGoal: sanitizeReportString(payload?.selfEvaluation?.improvementsGoal, 2000),
        studentComment: sanitizeReportString(payload?.selfEvaluation?.studentComment, 1500),
      },
      status: ReportStatus.DRAFT,
      currentRevision: 1,
      latestScoreOn20: null,
      interventionDate,
      durationHours: clampNumber(payload?.durationHours, 0.5, 240, 4),
      createdAt: now,
      updatedAt: now,
      submittedAt: null,
      reviewedAt: null,
      validatedAt: null,
      archivedAt: null,
    };

    const stepsRes = validateAndSanitizeSteps(payload?.steps, reportId);
    const materialsRes = validateAndSanitizeMaterials(payload?.materials, reportId);
    const toolsRes = validateAndSanitizeTools(payload?.tools, reportId);
    const diffsRes = validateAndSanitizeDifficulties(payload?.difficulties, reportId);
    const testsRes = validateAndSanitizeTests(payload?.tests, reportId);
    const compsRes = validateAndSanitizeCompetencies(payload?.competencies, reportId, false);

    db.reports.unshift(newReport);
    db.report_steps.push(...stepsRes.steps);
    db.report_materials.push(...materialsRes.materials);
    db.report_tools.push(...toolsRes.tools);
    db.report_difficulties.push(...diffsRes.difficulties);
    db.report_tests.push(...testsRes.tests);
    db.report_competencies.push(...compsRes.competencies);

    recordReportEvent({
      reportId,
      actor: ctx.actor,
      actorIp: ctx.actorIp,
      action: 'REPORT_CREATED',
      fromStatus: null,
      toStatus: ReportStatus.DRAFT,
      details: `Création du brouillon ${reportNumber} (${title}) rattaché à la spécialité ${profile.specialtyName}.`,
    });

    saveInterventionReportsDb(db);
    ctx.onSystemAuditLog?.(
      'REPORT_CREATED',
      `Rapport ${reportNumber} créé par ${profile.name} (${profile.specialtyName}).`,
      'info'
    );

    return getReportAggregateById(ctx, reportId);
  });
}

export async function updateInterventionReportDraft(
  ctx: ExternalSystemContext,
  rawReportId: string,
  payload: Record<string, any>
): Promise<{ status: number; error?: string; data?: InterventionReportAggregate }> {
  const reportId = sanitizeIdentifier(rawReportId);
  if (!reportId) {
    return { status: 400, error: 'Identifiant de rapport invalide.' };
  }

  return withReportMutex(`report:${reportId}`, async () => {
    const db = loadInterventionReportsDb();
    const report = db.reports.find((r) => r.id === reportId || r.reportNumber === reportId);
    if (!report) {
      return { status: 404, error: 'Rapport d’intervention introuvable.' };
    }

    const access = verifyReportAccess({
      actor: ctx.actor,
      report,
    });

    if (!access.allowed) {
      recordReportEvent({
        reportId: report.id,
        actor: ctx.actor,
        actorIp: ctx.actorIp,
        action: 'UNAUTHORIZED_ACCESS_BLOCKED',
        fromStatus: report.status,
        toStatus: report.status,
        details: access.reason || 'Modification non autorisée bloquée.',
      });
      saveInterventionReportsDb(db);
      return { status: 403, error: access.reason || 'Accès refusé.' };
    }

    if (!access.permissions.canEdit) {
      return {
        status: 409,
        error: `Modification refusée : un rapport au statut [${report.status}] est verrouillé contre l'édition directe.`,
      };
    }

    if (
      payload?.expectedVersion !== undefined &&
      Number(payload.expectedVersion) !== report.version
    ) {
      return {
        status: 409,
        error: `Conflit de version détecté (version serveur: ${report.version}, version envoyée: ${payload.expectedVersion}). Veuillez rafraîchir le rapport pour éviter d’écraser des données.`,
      };
    }

    if (payload?.title !== undefined) {
      const cleanTitle = sanitizeReportString(payload.title, 220);
      if (cleanTitle.length < 5) {
        return { status: 400, error: 'Le titre du rapport doit contenir au moins 5 caractères.' };
      }
      report.title = cleanTitle;
    }

    if (
      payload?.interventionType !== undefined &&
      ALLOWED_INTERVENTION_TYPES.includes(payload.interventionType)
    ) {
      report.interventionType = payload.interventionType;
    }

    if (payload?.location !== undefined) {
      report.location = sanitizeReportString(payload.location, 200);
    }
    if (payload?.startTime !== undefined) {
      report.startTime = sanitizeReportString(payload.startTime, 10);
    }
    if (payload?.endTime !== undefined) {
      report.endTime = sanitizeReportString(payload.endTime, 10);
    }
    if (payload?.clientPhone !== undefined) {
      report.clientPhone = sanitizeReportString(payload.clientPhone, 30);
    }
    if (payload?.clientAddress !== undefined) {
      report.clientAddress = sanitizeReportString(payload.clientAddress, 300);
    }
    if (payload?.problemObserved !== undefined) {
      report.problemObserved = sanitizeReportString(payload.problemObserved, 3000);
    }
    if (payload?.clientOrSite !== undefined) {
      report.clientOrSite = sanitizeReportString(payload.clientOrSite, 200);
    }
    if (payload?.contextAndObjective !== undefined) {
      report.contextAndObjective = sanitizeReportString(payload.contextAndObjective, 4000);
    }
    if (payload?.generalDescription !== undefined) {
      report.generalDescription = sanitizeReportString(payload.generalDescription, 4000);
    }
    if (payload?.safetyMeasures !== undefined) {
      report.safetyMeasures = sanitizeReportString(payload.safetyMeasures, 2500);
    }
    if (payload?.safetyChecklist && typeof payload.safetyChecklist === 'object') {
      report.safetyChecklist = {
        epiGlasses:
          payload.safetyChecklist.epiGlasses !== undefined
            ? Boolean(payload.safetyChecklist.epiGlasses)
            : report.safetyChecklist?.epiGlasses ?? false,
        epiGloves:
          payload.safetyChecklist.epiGloves !== undefined
            ? Boolean(payload.safetyChecklist.epiGloves)
            : report.safetyChecklist?.epiGloves ?? false,
        epiHelmet:
          payload.safetyChecklist.epiHelmet !== undefined
            ? Boolean(payload.safetyChecklist.epiHelmet)
            : report.safetyChecklist?.epiHelmet ?? false,
        epiShoes:
          payload.safetyChecklist.epiShoes !== undefined
            ? Boolean(payload.safetyChecklist.epiShoes)
            : report.safetyChecklist?.epiShoes ?? false,
        lockoutTagout:
          payload.safetyChecklist.lockoutTagout !== undefined
            ? Boolean(payload.safetyChecklist.lockoutTagout)
            : report.safetyChecklist?.lockoutTagout ?? false,
        areaSignage:
          payload.safetyChecklist.areaSignage !== undefined
            ? Boolean(payload.safetyChecklist.areaSignage)
            : report.safetyChecklist?.areaSignage ?? false,
        voltageFreeCheck:
          payload.safetyChecklist.voltageFreeCheck !== undefined
            ? Boolean(payload.safetyChecklist.voltageFreeCheck)
            : report.safetyChecklist?.voltageFreeCheck ?? false,
        emergencyStopChecked:
          payload.safetyChecklist.emergencyStopChecked !== undefined
            ? Boolean(payload.safetyChecklist.emergencyStopChecked)
            : report.safetyChecklist?.emergencyStopChecked ?? false,
        rulesApplied: sanitizeReportString(
          payload.safetyChecklist.rulesApplied ?? report.safetyChecklist?.rulesApplied ?? '',
          1000
        ),
        observations: sanitizeReportString(
          payload.safetyChecklist.observations ?? report.safetyChecklist?.observations ?? '',
          1000
        ),
      };
    }
    if (payload?.observations !== undefined) {
      report.observations = sanitizeReportString(payload.observations, 3000);
    }
    if (payload?.conclusion !== undefined) {
      report.conclusion = sanitizeReportString(payload.conclusion, 3000);
    }
    if (payload?.interventionDate !== undefined && isValidIsoDate(payload.interventionDate)) {
      report.interventionDate = String(payload.interventionDate).slice(0, 10);
    }
    if (payload?.durationHours !== undefined) {
      report.durationHours = clampNumber(payload.durationHours, 0.5, 240, report.durationHours);
    }

    if (payload?.selfEvaluation && typeof payload.selfEvaluation === 'object') {
      report.selfEvaluation = {
        autonomyScore: clampNumber(
          payload.selfEvaluation.autonomyScore,
          1,
          5,
          report.selfEvaluation.autonomyScore
        ),
        technicalMasteryScore: clampNumber(
          payload.selfEvaluation.technicalMasteryScore,
          1,
          5,
          report.selfEvaluation.technicalMasteryScore
        ),
        safetyComplianceScore: clampNumber(
          payload.selfEvaluation.safetyComplianceScore,
          1,
          5,
          report.selfEvaluation.safetyComplianceScore
        ),
        learned: sanitizeReportString(
          payload.selfEvaluation.learned ?? report.selfEvaluation.learned,
          2000
        ),
        succeeded: sanitizeReportString(
          payload.selfEvaluation.succeeded ?? report.selfEvaluation.succeeded,
          2000
        ),
        difficultiesFaced: sanitizeReportString(
          payload.selfEvaluation.difficultiesFaced ?? report.selfEvaluation.difficultiesFaced,
          2000
        ),
        improvementsGoal: sanitizeReportString(
          payload.selfEvaluation.improvementsGoal ?? report.selfEvaluation.improvementsGoal,
          2000
        ),
        studentComment: sanitizeReportString(
          payload.selfEvaluation.studentComment ?? report.selfEvaluation.studentComment,
          1500
        ),
      };
    }

    if (Array.isArray(payload?.steps)) {
      const stepsRes = validateAndSanitizeSteps(payload.steps, report.id);
      if (!stepsRes.valid) return { status: 400, error: stepsRes.error };
      db.report_steps = db.report_steps.filter((s) => s.reportId !== report.id);
      db.report_steps.push(...stepsRes.steps);
    }

    if (Array.isArray(payload?.materials)) {
      const matRes = validateAndSanitizeMaterials(payload.materials, report.id);
      if (!matRes.valid) return { status: 400, error: matRes.error };
      db.report_materials = db.report_materials.filter((m) => m.reportId !== report.id);
      db.report_materials.push(...matRes.materials);
    }

    if (Array.isArray(payload?.tools)) {
      const toolRes = validateAndSanitizeTools(payload.tools, report.id);
      if (!toolRes.valid) return { status: 400, error: toolRes.error };
      db.report_tools = db.report_tools.filter((t) => t.reportId !== report.id);
      db.report_tools.push(...toolRes.tools);
    }

    if (Array.isArray(payload?.difficulties)) {
      const diffRes = validateAndSanitizeDifficulties(payload.difficulties, report.id);
      if (!diffRes.valid) return { status: 400, error: diffRes.error };
      db.report_difficulties = db.report_difficulties.filter((d) => d.reportId !== report.id);
      db.report_difficulties.push(...diffRes.difficulties);
    }

    if (Array.isArray(payload?.tests)) {
      const testRes = validateAndSanitizeTests(payload.tests, report.id);
      if (!testRes.valid) return { status: 400, error: testRes.error };
      db.report_tests = db.report_tests.filter((t) => t.reportId !== report.id);
      db.report_tests.push(...testRes.tests);
    }

    if (Array.isArray(payload?.competencies)) {
      const compRes = validateAndSanitizeCompetencies(payload.competencies, report.id, false);
      if (!compRes.valid) return { status: 400, error: compRes.error };
      db.report_competencies = db.report_competencies.filter((c) => c.reportId !== report.id);
      db.report_competencies.push(...compRes.competencies);
    }

    report.version += 1;
    report.updatedAt = new Date().toISOString();

    const isAutosave = Boolean(payload?.isAutosave);
    recordReportEvent({
      reportId: report.id,
      actor: ctx.actor,
      actorIp: ctx.actorIp,
      action: isAutosave ? 'DRAFT_AUTOSAVED' : 'DRAFT_UPDATED',
      fromStatus: report.status,
      toStatus: report.status,
      details: isAutosave
        ? `Sauvegarde automatique (v${report.version}).`
        : `Mise à jour du rapport ${report.reportNumber} (v${report.version}).`,
    });

    saveInterventionReportsDb(db);
    return getReportAggregateById(ctx, report.id);
  });
}

export async function submitInterventionReport(
  ctx: ExternalSystemContext,
  rawReportId: string,
  payload?: { submissionNote?: string; idempotencyKey?: string }
): Promise<{ status: number; error?: string; data?: InterventionReportAggregate }> {
  const reportId = sanitizeIdentifier(rawReportId);
  if (!reportId) {
    return { status: 400, error: 'Identifiant de rapport invalide.' };
  }

  return withReportMutex(`report:${reportId}`, async () => {
    const db = loadInterventionReportsDb();
    const report = db.reports.find((r) => r.id === reportId || r.reportNumber === reportId);
    if (!report) {
      return { status: 404, error: 'Rapport d’intervention introuvable.' };
    }

    const access = verifyReportAccess({
      actor: ctx.actor,
      report,
    });

    if (!access.allowed || !access.permissions.canSubmit) {
      return {
        status: 403,
        error:
          access.reason ||
          `Ce rapport au statut [${report.status}] ne peut pas être soumis ou vous n'en êtes pas l'auteur.`,
      };
    }

    const targetStatus =
      report.status === ReportStatus.CHANGES_REQUESTED
        ? ReportStatus.RESUBMITTED
        : ReportStatus.SUBMITTED;

    const transition = validateStatusTransition(report.status, targetStatus, ctx.actor.role);
    if (!transition.valid) {
      return { status: 409, error: transition.error };
    }

    const steps = db.report_steps.filter((s) => s.reportId === report.id);
    if (
      !report.title ||
      report.title.trim().length < 5 ||
      !report.contextAndObjective ||
      report.contextAndObjective.trim().length < 15 ||
      !report.generalDescription ||
      report.generalDescription.trim().length < 15
    ) {
      return {
        status: 400,
        error:
          'Soumission refusée : veuillez renseigner le titre, le contexte/objectif et la description technique (minimum 15 caractères chacun) avant de soumettre.',
      };
    }

    if (steps.length === 0) {
      return {
        status: 400,
        error:
          'Soumission refusée : le rapport doit comporter au moins une étape technique documentée dans la chronologie d’intervention.',
      };
    }

    const previousStatus = report.status;
    const now = new Date().toISOString();

    if (targetStatus === ReportStatus.RESUBMITTED) {
      report.currentRevision += 1;
    }

    report.status = targetStatus;
    report.submittedAt = now;
    report.updatedAt = now;
    report.version += 1;

    const cleanNote = sanitizeReportString(payload?.submissionNote, 600);

    createRevisionSnapshot({
      report,
      actor: ctx.actor,
      reason:
        targetStatus === ReportStatus.RESUBMITTED
          ? `Resoumission après corrections (Révision #${report.currentRevision}) ${cleanNote ? `- ${cleanNote}` : ''}`
          : `Soumission initiale pour évaluation (Révision #${report.currentRevision})`,
    });

    recordReportEvent({
      reportId: report.id,
      actor: ctx.actor,
      actorIp: ctx.actorIp,
      action: targetStatus === ReportStatus.RESUBMITTED ? 'REPORT_RESUBMITTED' : 'REPORT_SUBMITTED',
      fromStatus: previousStatus,
      toStatus: targetStatus,
      details:
        targetStatus === ReportStatus.RESUBMITTED
          ? `Rapport resoumis par ${report.studentName} (Révision #${report.currentRevision}).`
          : `Rapport soumis par ${report.studentName} à ${report.assignedTeacherName}.`,
    });

    saveInterventionReportsDb(db);

    ctx.onEmitNotification?.({
      title:
        targetStatus === ReportStatus.RESUBMITTED
          ? `Rapport resoumis : ${report.reportNumber}`
          : `Nouveau rapport soumis : ${report.reportNumber}`,
      message: `${report.studentName} (${report.specialtyName} - ${report.classCode}) a soumis le rapport "${report.title}".`,
      type: 'info',
      targetRole: 'teacher',
      targetUserId: report.assignedTeacherId,
    });

    return getReportAggregateById(ctx, report.id);
  });
}

export async function evaluateOrTransitionReport(
  ctx: ExternalSystemContext,
  rawReportId: string,
  payload: {
    decision: ReportStatus;
    scoreOn20?: number | null;
    technicalScoreOn20?: number | null;
    methodScoreOn20?: number | null;
    safetyScoreOn20?: number | null;
    redactionScoreOn20?: number | null;
    generalFeedback?: string;
    strengths?: string;
    improvementsRequired?: string;
    annotatedSections?: Array<{
      section: string;
      comment: string;
      severity: 'INFO' | 'WARNING' | 'REQUIRED';
    }>;
    competencyEvaluations?: Array<{
      id: string;
      teacherLevel: string;
      teacherComment?: string;
    }>;
  }
): Promise<{ status: number; error?: string; data?: InterventionReportAggregate }> {
  const reportId = sanitizeIdentifier(rawReportId);
  if (!reportId) {
    return { status: 400, error: 'Identifiant de rapport invalide.' };
  }

  return withReportMutex(`report:${reportId}`, async () => {
    const db = loadInterventionReportsDb();
    const report = db.reports.find((r) => r.id === reportId || r.reportNumber === reportId);
    if (!report) {
      return { status: 404, error: 'Rapport d’intervention introuvable.' };
    }

    const teacherPerimeter =
      ctx.actor.role === 'teacher'
        ? resolveTeacherPerimeterFromServer({
            actor: ctx.actor,
            teachersDb: ctx.teachersDb,
            classesDb: ctx.classesDb,
            specialtyRegistry: ctx.specialtyRegistry,
          })
        : null;

    const access = verifyReportAccess({
      actor: ctx.actor,
      report,
      teacherPerimeter,
    });

    if (!access.allowed) {
      recordReportEvent({
        reportId: report.id,
        actor: ctx.actor,
        actorIp: ctx.actorIp,
        action: 'UNAUTHORIZED_ACCESS_BLOCKED',
        fromStatus: report.status,
        toStatus: report.status,
        details: access.reason || 'Tentative d’évaluation hors périmètre bloquée.',
      });
      saveInterventionReportsDb(db);
      return { status: 403, error: access.reason || 'Accès refusé.' };
    }

    const targetStatus = payload?.decision;
    const transitionCheck = validateStatusTransition(report.status, targetStatus, ctx.actor.role);
    if (!transitionCheck.valid) {
      return { status: 409, error: transitionCheck.error };
    }

    const now = new Date().toISOString();
    const previousStatus = report.status;

    if (targetStatus === ReportStatus.UNDER_REVIEW) {
      report.status = ReportStatus.UNDER_REVIEW;
      report.reviewedAt = now;
      report.updatedAt = now;
      report.version += 1;

      recordReportEvent({
        reportId: report.id,
        actor: ctx.actor,
        actorIp: ctx.actorIp,
        action: 'REVIEW_STARTED',
        fromStatus: previousStatus,
        toStatus: ReportStatus.UNDER_REVIEW,
        details: `Prise en charge de la correction par ${ctx.actor.name}.`,
      });

      saveInterventionReportsDb(db);
      return getReportAggregateById(ctx, report.id);
    }

    if (targetStatus === ReportStatus.ARCHIVED) {
      report.status = ReportStatus.ARCHIVED;
      report.archivedAt = now;
      report.updatedAt = now;
      report.version += 1;

      recordReportEvent({
        reportId: report.id,
        actor: ctx.actor,
        actorIp: ctx.actorIp,
        action: 'REPORT_ARCHIVED',
        fromStatus: previousStatus,
        toStatus: ReportStatus.ARCHIVED,
        details: `Archivage officiel du rapport validé par ${ctx.actor.name}.`,
      });

      saveInterventionReportsDb(db);
      return getReportAggregateById(ctx, report.id);
    }

    const generalFeedback = sanitizeReportString(payload?.generalFeedback, 3000);
    if (!generalFeedback || generalFeedback.length < 5) {
      return {
        status: 400,
        error: 'Une appréciation pédagogique (minimum 5 caractères) est obligatoire pour évaluer ou demander des corrections.',
      };
    }

    const techScore =
      payload?.technicalScoreOn20 !== undefined && payload?.technicalScoreOn20 !== null
        ? clampNumber(payload.technicalScoreOn20, 0, 20, 10)
        : null;
    const methodScore =
      payload?.methodScoreOn20 !== undefined && payload?.methodScoreOn20 !== null
        ? clampNumber(payload.methodScoreOn20, 0, 20, 10)
        : null;
    const safetyScore =
      payload?.safetyScoreOn20 !== undefined && payload?.safetyScoreOn20 !== null
        ? clampNumber(payload.safetyScoreOn20, 0, 20, 10)
        : null;
    const redacScore =
      payload?.redactionScoreOn20 !== undefined && payload?.redactionScoreOn20 !== null
        ? clampNumber(payload.redactionScoreOn20, 0, 20, 10)
        : null;

    let finalScore: number | null = null;
    if (payload?.scoreOn20 !== undefined && payload?.scoreOn20 !== null) {
      finalScore = clampNumber(payload.scoreOn20, 0, 20, 10);
    } else if (
      techScore !== null &&
      methodScore !== null &&
      safetyScore !== null &&
      redacScore !== null
    ) {
      finalScore = Number(((techScore + methodScore + safetyScore + redacScore) / 4).toFixed(2));
    }

    const evaluation: ReportEvaluation = {
      id: `evl_${crypto.randomBytes(8).toString('hex')}`,
      reportId: report.id,
      revisionNumber: report.currentRevision,
      teacherId: teacherPerimeter?.teacherId || ctx.actor.id,
      teacherName: teacherPerimeter?.teacherName || ctx.actor.name,
      decision: targetStatus as ReportStatus.CHANGES_REQUESTED | ReportStatus.APPROVED,
      scoreOn20: finalScore,
      technicalScoreOn20: techScore,
      methodScoreOn20: methodScore,
      safetyScoreOn20: safetyScore,
      redactionScoreOn20: redacScore,
      generalFeedback,
      strengths: sanitizeReportString(payload?.strengths, 1500),
      improvementsRequired: sanitizeReportString(payload?.improvementsRequired, 1500),
      annotatedSections: [],
      evaluatedAt: now,
    };

    db.report_evaluations.unshift(evaluation);

    if (Array.isArray(payload?.competencyEvaluations)) {
      for (const compEval of payload.competencyEvaluations) {
        const targetComp = db.report_competencies.find(
          (c) => c.reportId === report.id && c.id === sanitizeIdentifier(compEval?.id)
        );
        if (
          targetComp &&
          ['NON_ACQUIS', 'EN_COURS', 'ACQUIS', 'EXPERT'].includes(compEval.teacherLevel)
        ) {
          targetComp.teacherLevel = compEval.teacherLevel as any;
          targetComp.teacherComment = sanitizeReportString(compEval.teacherComment, 600);
        }
      }
    }

    report.status = targetStatus;
    report.reviewedAt = now;
    if (targetStatus === ReportStatus.APPROVED) {
      report.validatedAt = now;
    }
    if (finalScore !== null) {
      report.latestScoreOn20 = finalScore;
    }
    report.updatedAt = now;
    report.version += 1;

    recordReportEvent({
      reportId: report.id,
      actor: ctx.actor,
      actorIp: ctx.actorIp,
      action: targetStatus === ReportStatus.APPROVED ? 'REPORT_APPROVED' : 'CHANGES_REQUESTED',
      fromStatus: previousStatus,
      toStatus: targetStatus,
      details:
        targetStatus === ReportStatus.APPROVED
          ? `Rapport validé par ${evaluation.teacherName}${finalScore !== null ? ` avec la note de ${finalScore}/20` : ''}.`
          : `Corrections demandées par ${evaluation.teacherName}.`,
    });

    saveInterventionReportsDb(db);

    ctx.onEmitNotification?.({
      title:
        targetStatus === ReportStatus.APPROVED
          ? `Rapport validé : ${report.reportNumber}`
          : `Corrections demandées : ${report.reportNumber}`,
      message:
        targetStatus === ReportStatus.APPROVED
          ? `Votre rapport "${report.title}" a été approuvé par ${evaluation.teacherName}${finalScore !== null ? ` (${finalScore}/20)` : ''}.`
          : `${evaluation.teacherName} a demandé des ajustements sur votre rapport "${report.title}".`,
      type: targetStatus === ReportStatus.APPROVED ? 'success' : 'warning',
      targetRole: 'student',
      targetUserId: report.studentId,
    });

    return getReportAggregateById(ctx, report.id);
  });
}

export async function uploadReportAttachment(
  ctx: ExternalSystemContext,
  rawReportId: string,
  payload: {
    originalFileName: string;
    mimeType?: string;
    base64Data: string;
    category: AttachmentCategory;
    caption?: string;
    stepId?: string | null;
  }
): Promise<{ status: number; error?: string; attachment?: ReportAttachment & { downloadUrl: string } }> {
  const reportId = sanitizeIdentifier(rawReportId);
  if (!reportId) {
    return { status: 400, error: 'Identifiant de rapport invalide.' };
  }

  return withReportMutex(`report:${reportId}`, async () => {
    const db = loadInterventionReportsDb();
    const report = db.reports.find((r) => r.id === reportId || r.reportNumber === reportId);
    if (!report) {
      return { status: 404, error: 'Rapport d’intervention introuvable.' };
    }

    const access = verifyReportAccess({
      actor: ctx.actor,
      report,
    });

    if (!access.allowed || !access.permissions.canUpload) {
      return {
        status: 403,
        error:
          access.reason ||
          `Ajout de pièce jointe refusé : ce rapport est au statut [${report.status}] ou vous n'êtes pas autorisé à le modifier.`,
      };
    }

    const existingAttachments = db.report_attachments.filter((a) => a.reportId === report.id);
    if (existingAttachments.length >= 25) {
      return {
        status: 400,
        error: 'Limite atteinte : un rapport ne peut pas contenir plus de 25 pièces jointes.',
      };
    }

    const verified = inspectAndValidateUploadedFile({
      originalFileName: payload?.originalFileName,
      claimedMimeType: payload?.mimeType,
      base64OrDataUrl: payload?.base64Data,
      category: payload?.category,
    });

    if (
      !verified.valid ||
      !verified.buffer ||
      !verified.storedFileName ||
      !verified.detectedMime ||
      !verified.sha256Checksum ||
      !verified.safeOriginalName ||
      !verified.sizeBytes
    ) {
      ctx.onSystemAuditLog?.(
        'REPORT_UPLOAD_REJECTED',
        `Fichier rejeté sur le rapport ${report.reportNumber} par ${ctx.actor.name} : ${verified.error}`,
        'warning'
      );
      return { status: 400, error: verified.error || 'Fichier invalide.' };
    }

    const storageRelativePath = writePrivateAttachmentFile({
      reportId: report.id,
      storedFileName: verified.storedFileName,
      buffer: verified.buffer,
    });

    const attachment: ReportAttachment = {
      id: `att_${crypto.randomBytes(8).toString('hex')}`,
      reportId: report.id,
      category: payload.category,
      originalName: verified.safeOriginalName,
      storedFileName: verified.storedFileName,
      storageRelativePath,
      mimeType: verified.detectedMime,
      detectedMagicMime: verified.detectedMime,
      sizeBytes: verified.sizeBytes,
      sha256Checksum: verified.sha256Checksum,
      caption: sanitizeReportString(payload?.caption, 300),
      stepId: payload?.stepId ? sanitizeIdentifier(payload.stepId) : null,
      uploadedById: ctx.actor.id,
      uploadedByName: ctx.actor.name,
      uploadedByRole: ctx.actor.role,
      createdAt: new Date().toISOString(),
    };

    db.report_attachments.push(attachment);
    report.updatedAt = new Date().toISOString();
    report.version += 1;

    recordReportEvent({
      reportId: report.id,
      actor: ctx.actor,
      actorIp: ctx.actorIp,
      action: 'ATTACHMENT_ADDED',
      fromStatus: report.status,
      toStatus: report.status,
      details: `Pièce jointe ajoutée [${attachment.category}] : ${attachment.originalName} (${Math.round(attachment.sizeBytes / 1024)} Ko).`,
    });

    saveInterventionReportsDb(db);

    return {
      status: 201,
      attachment: {
        ...attachment,
        downloadUrl: `/api/intervention-reports/${encodeURIComponent(report.id)}/attachments/${encodeURIComponent(attachment.id)}/download`,
      },
    };
  });
}

export function downloadReportAttachment(
  ctx: ExternalSystemContext,
  rawReportId: string,
  rawAttachmentId: string
): {
  status: number;
  error?: string;
  buffer?: Buffer;
  mimeType?: string;
  fileName?: string;
} {
  const reportId = sanitizeIdentifier(rawReportId);
  const attachmentId = sanitizeIdentifier(rawAttachmentId);

  const db = loadInterventionReportsDb();
  const report = db.reports.find((r) => r.id === reportId || r.reportNumber === reportId);
  if (!report) {
    return { status: 404, error: 'Rapport introuvable.' };
  }

  const teacherPerimeter =
    ctx.actor.role === 'teacher'
      ? resolveTeacherPerimeterFromServer({
          actor: ctx.actor,
          teachersDb: ctx.teachersDb,
          classesDb: ctx.classesDb,
          specialtyRegistry: ctx.specialtyRegistry,
        })
      : null;

  const access = verifyReportAccess({
    actor: ctx.actor,
    report,
    teacherPerimeter,
  });

  if (!access.allowed) {
    return { status: 403, error: access.reason || 'Accès refusé à cette pièce jointe.' };
  }

  const attachment = db.report_attachments.find(
    (a) => a.id === attachmentId && a.reportId === report.id
  );
  if (!attachment) {
    return { status: 404, error: 'Pièce jointe introuvable.' };
  }

  const fileBuffer = readPrivateAttachmentFile(attachment.storageRelativePath);
  if (!fileBuffer) {
    return { status: 404, error: 'Fichier binaire introuvable dans le stockage sécurisé.' };
  }

  return {
    status: 200,
    buffer: fileBuffer,
    mimeType: attachment.detectedMagicMime || attachment.mimeType,
    fileName: attachment.originalName,
  };
}

export async function deleteReportAttachment(
  ctx: ExternalSystemContext,
  rawReportId: string,
  rawAttachmentId: string
): Promise<{ status: number; error?: string }> {
  const reportId = sanitizeIdentifier(rawReportId);
  const attachmentId = sanitizeIdentifier(rawAttachmentId);

  return withReportMutex(`report:${reportId}`, async () => {
    const db = loadInterventionReportsDb();
    const report = db.reports.find((r) => r.id === reportId || r.reportNumber === reportId);
    if (!report) {
      return { status: 404, error: 'Rapport introuvable.' };
    }

    const access = verifyReportAccess({
      actor: ctx.actor,
      report,
    });

    if (!access.allowed || !access.permissions.canUpload) {
      return {
        status: 403,
        error: 'Vous ne pouvez pas supprimer une pièce jointe sur un rapport verrouillé ou qui ne vous appartient pas.',
      };
    }

    const idx = db.report_attachments.findIndex(
      (a) => a.id === attachmentId && a.reportId === report.id
    );
    if (idx === -1) {
      return { status: 404, error: 'Pièce jointe introuvable.' };
    }

    const [removed] = db.report_attachments.splice(idx, 1);
    deletePrivateAttachmentFile(removed.storageRelativePath);

    report.updatedAt = new Date().toISOString();
    report.version += 1;

    recordReportEvent({
      reportId: report.id,
      actor: ctx.actor,
      actorIp: ctx.actorIp,
      action: 'ATTACHMENT_REMOVED',
      fromStatus: report.status,
      toStatus: report.status,
      details: `Pièce jointe supprimée : ${removed.originalName}.`,
    });

    saveInterventionReportsDb(db);
    return { status: 200 };
  });
}

export async function deleteInterventionReport(
  ctx: ExternalSystemContext,
  rawReportId: string
): Promise<{ status: number; error?: string }> {
  const reportId = sanitizeIdentifier(rawReportId);
  if (!reportId) {
    return { status: 400, error: 'Identifiant invalide.' };
  }

  return withReportMutex(`report:${reportId}`, async () => {
    const db = loadInterventionReportsDb();
    const report = db.reports.find((r) => r.id === reportId || r.reportNumber === reportId);
    if (!report) {
      return { status: 404, error: 'Rapport introuvable.' };
    }

    const access = verifyReportAccess({
      actor: ctx.actor,
      report,
    });

    if (!access.allowed || !access.permissions.canDelete) {
      return {
        status: 403,
        error:
          'Suppression interdite : seuls les brouillons non soumis peuvent être supprimés par leur auteur (ou par le Super Admin).',
      };
    }

    const attachments = db.report_attachments.filter((a) => a.reportId === report.id);
    for (const att of attachments) {
      deletePrivateAttachmentFile(att.storageRelativePath);
    }

    db.reports = db.reports.filter((r) => r.id !== report.id);
    db.report_steps = db.report_steps.filter((s) => s.reportId !== report.id);
    db.report_materials = db.report_materials.filter((m) => m.reportId !== report.id);
    db.report_tools = db.report_tools.filter((t) => t.reportId !== report.id);
    db.report_difficulties = db.report_difficulties.filter((d) => d.reportId !== report.id);
    db.report_tests = db.report_tests.filter((t) => t.reportId !== report.id);
    db.report_competencies = db.report_competencies.filter((c) => c.reportId !== report.id);
    db.report_attachments = db.report_attachments.filter((a) => a.reportId !== report.id);
    db.report_evaluations = db.report_evaluations.filter((e) => e.reportId !== report.id);
    db.report_revisions = db.report_revisions.filter((rev) => rev.reportId !== report.id);

    recordReportEvent({
      reportId: report.id,
      actor: ctx.actor,
      actorIp: ctx.actorIp,
      action: 'REPORT_DELETED',
      fromStatus: report.status,
      toStatus: null,
      details: `Suppression du rapport ${report.reportNumber} (${report.title}) par ${ctx.actor.name}.`,
    });

    saveInterventionReportsDb(db);
    ctx.onSystemAuditLog?.(
      'REPORT_DELETED',
      `Rapport ${report.reportNumber} supprimé par ${ctx.actor.name} [${ctx.actor.role}].`,
      'warning'
    );

    return { status: 200 };
  });
}
