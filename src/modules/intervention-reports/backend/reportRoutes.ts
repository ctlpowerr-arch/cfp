import { Request, Response, Router } from 'express';
import { ReportStatus } from '../types/report.types';
import {
  AuthenticatedActor,
  resolveStudentProfileFromServer,
  resolveTeacherPerimeterFromServer,
  verifyReportAccess,
} from './reportAccessControl';
import {
  checkReportRateLimit,
  inspectAndValidateUploadedFile,
  sanitizeReportString,
  validateStatusTransition,
} from './reportSecurity';
import {
  createInterventionReport,
  deleteInterventionReport,
  deleteReportAttachment,
  downloadReportAttachment,
  evaluateOrTransitionReport,
  ExternalSystemContext,
  getReportAggregateById,
  listAndSearchReports,
  submitInterventionReport,
  updateInterventionReportDraft,
  uploadReportAttachment,
} from './reportService';
import { loadInterventionReportsDb } from './reportStorage';

export interface InterventionReportRouterDependencies {
  authenticateMiddleware: (req: Request, res: Response, next: () => void) => void;
  getStudentsDb: () => any[];
  getTeachersDb: () => any[];
  getClassesDb: () => any[];
  getSpecialtyRegistry: () => Array<{ id: string; name: string; code: string; filiere: string }>;
  getAcademicYearsDb: () => any[];
  logAudit?: (
    userId: string,
    userName: string,
    userRole: string,
    action: string,
    details: string,
    ip: string,
    severity?: 'info' | 'warning' | 'critical'
  ) => void;
  emitNotification?: (notif: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'urgent';
    targetRole?: string;
    targetUserId?: string;
    link?: string;
  }) => void;
}

export function createInterventionReportsRouter(
  deps: InterventionReportRouterDependencies
): Router {
  const router = Router();

  router.use(deps.authenticateMiddleware);

  const buildContext = (req: Request): ExternalSystemContext => {
    const rawUser = (req as any).user || {};
    const actor: AuthenticatedActor = {
      id: String(rawUser.id || ''),
      email: String(rawUser.email || ''),
      name: String(rawUser.name || 'Utilisateur'),
      role: rawUser.role || 'student',
      permissions: Array.isArray(rawUser.permissions) ? rawUser.permissions : [],
    };
    const actorIp = String(
      req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1'
    );

    return {
      actor,
      actorIp,
      studentsDb: deps.getStudentsDb(),
      teachersDb: deps.getTeachersDb(),
      classesDb: deps.getClassesDb(),
      specialtyRegistry: deps.getSpecialtyRegistry(),
      academicYearsDb: deps.getAcademicYearsDb(),
      onSystemAuditLog: (action, details, severity = 'info') => {
        deps.logAudit?.(actor.id, actor.name, actor.role, action, details, actorIp, severity);
      },
      onEmitNotification: (notif) => {
        deps.emitNotification?.(notif);
      },
    };
  };

  router.get('/context', (req: Request, res: Response) => {
    const ctx = buildContext(req);
    const db = loadInterventionReportsDb();

    const studentResolution =
      ctx.actor.role === 'student'
        ? resolveStudentProfileFromServer({
            actor: ctx.actor,
            studentsDb: ctx.studentsDb,
            teachersDb: ctx.teachersDb,
            classesDb: ctx.classesDb,
            specialtyRegistry: ctx.specialtyRegistry,
            academicYearsDb: ctx.academicYearsDb,
          })
        : null;

    const teacherPerimeter =
      ctx.actor.role === 'teacher'
        ? resolveTeacherPerimeterFromServer({
            actor: ctx.actor,
            teachersDb: ctx.teachersDb,
            classesDb: ctx.classesDb,
            specialtyRegistry: ctx.specialtyRegistry,
          })
        : null;

    res.json({
      microservice: 'INTERVENTION_REPORTS',
      phase: 'PHASE_1_FOUNDATION_READY',
      schemaVersion: db.schemaVersion,
      actor: ctx.actor,
      studentProfile: studentResolution?.profile || null,
      teacherPerimeter,
      collectionsSummary: {
        reports: db.reports.length,
        report_steps: db.report_steps.length,
        report_materials: db.report_materials.length,
        report_tools: db.report_tools.length,
        report_difficulties: db.report_difficulties.length,
        report_tests: db.report_tests.length,
        report_competencies: db.report_competencies.length,
        report_attachments: db.report_attachments.length,
        report_evaluations: db.report_evaluations.length,
        report_events: db.report_events.length,
        report_revisions: db.report_revisions.length,
      },
    });
  });

  router.get('/', (req: Request, res: Response) => {
    const ctx = buildContext(req);
    const rate = checkReportRateLimit(`${ctx.actor.id}:${ctx.actorIp}`, 'SEARCH_REPORTS');
    if (!rate.allowed) {
      return res.status(429).json({
        error: `Trop de requêtes de recherche. Veuillez patienter ${rate.retryAfterSeconds}s.`,
      });
    }

    const result = listAndSearchReports(ctx, {
      academicYear: req.query.academicYear as string,
      status: req.query.status as string,
      specialty: req.query.specialty as string,
      formation: req.query.formation as string,
      classCode: req.query.classCode as string,
      studentId: req.query.studentId as string,
      teacherId: req.query.teacherId as string,
      interventionType: req.query.interventionType as string,
      search: req.query.search as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 50,
    });

    return res.json(result);
  });

  router.post('/security-self-test', (req: Request, res: Response) => {
    const illegalTransition = validateStatusTransition(
      ReportStatus.APPROVED,
      ReportStatus.DRAFT,
      'student'
    );
    const legalSubmit = validateStatusTransition(
      ReportStatus.DRAFT,
      ReportStatus.SUBMITTED,
      'student'
    );

    const mockReport: any = {
      id: 'RPT-TEST-IDOR',
      studentId: 'std_101',
      studentEmail: 'a.ngassa@itmc-it.cm',
      studentName: 'Arthur Ngassa',
      specialtyName: 'Génie Logiciel',
      assignedTeacherId: 'TCH-001',
      status: ReportStatus.DRAFT,
    };
    const idorAttempt = verifyReportAccess({
      actor: {
        id: 'std_999',
        email: 'intrus@itmc-it.cm',
        name: 'Étudiant Intrus',
        role: 'student',
      },
      report: mockReport,
    });

    const crossSpecialtyTeacherAttempt = verifyReportAccess({
      actor: {
        id: 'TCH-BTP-99',
        email: 'btp@itmc-it.cm',
        name: 'Enseignant BTP',
        role: 'teacher',
      },
      report: mockReport,
      teacherPerimeter: {
        teacherId: 'TCH-BTP-99',
        teacherName: 'Enseignant BTP',
        teacherEmail: 'btp@itmc-it.cm',
        authorizedSpecialties: ['maconnerie', 'btp'],
        authorizedFormations: ['btp & construction'],
        authorizedClasses: ['btp1'],
        rawSpecialties: ['Maçonnerie & Gros Œuvre'],
        rawClasses: ['BTP1'],
      },
    });

    const fakeExeCheck = inspectAndValidateUploadedFile({
      originalFileName: 'preuve_atelier.jpg.exe',
      base64OrDataUrl: Buffer.from('MZ-fake-executable-payload').toString('base64'),
      category: 'BEFORE',
    });

    const validPngBytes = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
      0x52,
    ]);
    const validPngCheck = inspectAndValidateUploadedFile({
      originalFileName: 'schema_reseau.png',
      base64OrDataUrl: validPngBytes.toString('base64'),
      category: 'BEFORE',
    });

    const xssSample = `<script>alert("xss")</script><img src=x onerror=alert(1)>{{constructor.constructor('return process')()}}Rapport OK`;
    const sanitizedSample = sanitizeReportString(xssSample);

    const checks = [
      {
        code: 'STATE_MACHINE_PROTECTION',
        label: 'Blocage des transitions illégales (ex: APPROVED → DRAFT interdit)',
        passed: !illegalTransition.valid && legalSubmit.valid,
        detail: illegalTransition.error,
      },
      {
        code: 'STUDENT_ANTI_IDOR',
        label: 'Isolation stricte Anti-IDOR entre étudiants (accès croisé refusé)',
        passed: !idorAttempt.allowed,
        detail: idorAttempt.reason,
      },
      {
        code: 'TEACHER_SPECIALTY_PERIMETER',
        label: 'Cloisonnement Enseignant par Spécialité autorisée',
        passed: !crossSpecialtyTeacherAttempt.allowed,
        detail: crossSpecialtyTeacherAttempt.reason,
      },
      {
        code: 'FILE_MAGIC_BYTES_FIREWALL',
        label: 'Inspection Magic-Bytes & rejet des doubles extensions (.jpg.exe / MZ)',
        passed: !fakeExeCheck.valid && validPngCheck.valid,
        detail: fakeExeCheck.error,
      },
      {
        code: 'XSS_TEMPLATE_SANITIZATION',
        label: 'Neutralisation XSS, HTML actif et Template Injection',
        passed:
          !sanitizedSample.includes('<script') &&
          !sanitizedSample.includes('onerror') &&
          !sanitizedSample.includes('{{') &&
          sanitizedSample.includes('Rapport OK'),
        detail: `Entrée nettoyée : "${sanitizedSample}"`,
      },
    ];

    return res.json({
      allPassed: checks.every((c) => c.passed),
      executedAt: new Date().toISOString(),
      checks,
    });
  });

  router.get('/:id', (req: Request, res: Response) => {
    const ctx = buildContext(req);
    const result = getReportAggregateById(ctx, req.params.id as string);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(200).json(result.data);
  });

  router.post('/', async (req: Request, res: Response) => {
    const ctx = buildContext(req);
    const rate = checkReportRateLimit(`${ctx.actor.id}:${ctx.actorIp}`, 'CREATE_REPORT');
    if (!rate.allowed) {
      return res.status(429).json({
        error: `Limite de création atteinte. Réessayez dans ${rate.retryAfterSeconds}s.`,
      });
    }

    const result = await createInterventionReport(ctx, req.body || {});
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(201).json(result.data);
  });

  router.put('/:id', async (req: Request, res: Response) => {
    const ctx = buildContext(req);
    const result = await updateInterventionReportDraft(ctx, req.params.id as string, req.body || {});
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(200).json(result.data);
  });

  router.post('/:id/submit', async (req: Request, res: Response) => {
    const ctx = buildContext(req);
    const rate = checkReportRateLimit(`${ctx.actor.id}:${ctx.actorIp}`, 'SUBMIT_REPORT');
    if (!rate.allowed) {
      return res.status(429).json({
        error: `Trop de soumissions rapprochées. Veuillez patienter ${rate.retryAfterSeconds}s.`,
      });
    }

    const result = await submitInterventionReport(ctx, req.params.id as string, req.body || {});
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(200).json(result.data);
  });

  router.post('/:id/evaluate', async (req: Request, res: Response) => {
    const ctx = buildContext(req);
    const rate = checkReportRateLimit(`${ctx.actor.id}:${ctx.actorIp}`, 'EVALUATE_REPORT');
    if (!rate.allowed) {
      return res.status(429).json({
        error: `Limite d'évaluation atteinte. Veuillez patienter ${rate.retryAfterSeconds}s.`,
      });
    }

    const result = await evaluateOrTransitionReport(ctx, req.params.id as string, req.body || {});
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(200).json(result.data);
  });

  router.post('/:id/attachments', async (req: Request, res: Response) => {
    const ctx = buildContext(req);
    const rate = checkReportRateLimit(`${ctx.actor.id}:${ctx.actorIp}`, 'UPLOAD_ATTACHMENT');
    if (!rate.allowed) {
      return res.status(429).json({
        error: `Trop d'envois de fichiers. Veuillez patienter ${rate.retryAfterSeconds}s.`,
      });
    }

    const result = await uploadReportAttachment(ctx, req.params.id as string, req.body || {});
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(201).json(result.attachment);
  });

  router.get('/:id/attachments/:attachmentId/download', (req: Request, res: Response) => {
    const ctx = buildContext(req);
    const result = downloadReportAttachment(ctx, req.params.id as string, req.params.attachmentId as string);
    if (result.error || !result.buffer) {
      return res.status(result.status).json({ error: result.error || 'Fichier indisponible.' });
    }

    res.setHeader('Content-Type', result.mimeType || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(result.fileName || 'attachment')}"`
    );
    return res.send(result.buffer);
  });

  router.delete('/:id/attachments/:attachmentId', async (req: Request, res: Response) => {
    const ctx = buildContext(req);
    const result = await deleteReportAttachment(ctx, req.params.id as string, req.params.attachmentId as string);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.json({ success: true });
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    const ctx = buildContext(req);
    const result = await deleteInterventionReport(ctx, req.params.id as string);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.json({ success: true });
  });

  return router;
}
