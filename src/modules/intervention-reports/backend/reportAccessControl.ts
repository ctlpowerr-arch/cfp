import { InterventionReport, ReportStatus } from '../types/report.types';

/**
 * ============================================================================
 * CONTRÔLE D'ACCÈS (RBAC + ABAC), ANTI-IDOR & CALCUL DE PÉRIMÈTRE SERVEUR
 * ============================================================================
 */

export interface AuthenticatedActor {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student' | 'secretary';
  permissions?: string[];
}

export interface ResolvedStudentProfile {
  id: string;
  matricule: string;
  name: string;
  email: string;
  specialtyId: string;
  specialtyName: string;
  formation: string;
  classCode: string;
  academicYear: string;
  assignedTeacherId: string;
  assignedTeacherName: string;
}

export interface ResolvedTeacherPerimeter {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  authorizedSpecialties: string[];
  authorizedFormations: string[];
  authorizedClasses: string[];
  rawSpecialties: string[];
  rawClasses: string[];
}

function normalizeToken(str?: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function specialtiesMatch(specA?: string, specB?: string): boolean {
  const a = normalizeToken(specA);
  const b = normalizeToken(specB);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;

  const groups = [
    ['genie logiciel', 'gl', 'developpement', 'informatique'],
    ['cyber-securite', 'cybersecurite', 'securite informatique', 'cs'],
    ['reseaux & systemes', 'reseaux & telecoms', 'reseaux', 'rt', 'telecoms'],
    ['intelligence artificielle', 'ia & big data', 'big data & business intelligence', 'ia', 'big data', 'data science'],
    ['cloud computing', 'cloud', 'devops'],
    ['electrotechnique', 'electricite', 'elt'],
    ['maintenance industrielle', 'maintenance', 'min'],
    ['froid et climatisation', 'froid', 'climatisation', 'fcl'],
    ['maconnerie', 'gros oeuvre', 'btp', 'construction'],
    ['plomberie', 'tuyauterie', 'plm', 'tuy'],
  ];

  for (const group of groups) {
    const aInGroup = group.some((kw) => a.includes(kw));
    const bInGroup = group.some((kw) => b.includes(kw));
    if (aInGroup && bInGroup) return true;
  }

  return false;
}

export function resolveValidAcademicYear(
  requestedYear: string | null | undefined,
  academicYearsDb: any[]
): string {
  const validYears = Array.isArray(academicYearsDb) && academicYearsDb.length > 0
    ? academicYearsDb
    : [
        { id: '2024-2025', name: '2024-2025', status: 'Clôturée', isCurrent: false },
        { id: '2025-2026', name: '2025-2026', status: 'Clôturée', isCurrent: false },
        { id: '2026-2027', name: '2026-2027', status: 'En Cours', isCurrent: true },
      ];

  if (requestedYear && typeof requestedYear === 'string') {
    const clean = requestedYear.trim();
    const matched = validYears.find((y: any) => y.name === clean || y.id === clean);
    if (matched) return matched.name;
  }

  const current = validYears.find((y: any) => y.isCurrent) || validYears[validYears.length - 1];
  return current?.name || '2026-2027';
}

export function resolveStudentProfileFromServer(params: {
  actor: AuthenticatedActor;
  targetStudentId?: string;
  studentsDb: any[];
  teachersDb: any[];
  classesDb: any[];
  specialtyRegistry: Array<{ id: string; name: string; code: string; filiere: string }>;
  academicYearsDb: any[];
}): { found: boolean; profile?: ResolvedStudentProfile; error?: string } {
  const { actor, targetStudentId, studentsDb, teachersDb, specialtyRegistry, academicYearsDb } = params;

  let studentRecord: any = null;

  if (actor.role === 'student') {
    studentRecord = studentsDb.find(
      (s: any) =>
        s.id === actor.id ||
        (s.email && actor.email && s.email.toLowerCase() === actor.email.toLowerCase()) ||
        (s.name && actor.name && normalizeToken(s.name) === normalizeToken(actor.name))
    );

    if (!studentRecord && studentsDb.length > 0) {
      studentRecord = {
        id: actor.id || 'std_101',
        name: actor.name || 'Arthur Ngassa',
        email: actor.email || 'a.ngassa@itmc-it.cm',
        matricule: '26ITMC-GL001',
        promo: 'G1',
        specialty: 'Génie Logiciel',
        academicYear: '2026-2027',
      };
    }
  } else if (actor.role === 'admin' || actor.role === 'teacher') {
    if (targetStudentId) {
      studentRecord = studentsDb.find(
        (s: any) => s.id === targetStudentId || s.matricule === targetStudentId || s.email === targetStudentId
      );
    }
    if (!studentRecord && studentsDb.length > 0) {
      studentRecord = studentsDb[0];
    }
  }

  if (!studentRecord) {
    return { found: false, error: 'Profil étudiant introuvable dans la base académique.' };
  }

  const rawSpecialty = studentRecord.specialty || 'Génie Logiciel';
  const specMeta =
    specialtyRegistry.find(
      (item) =>
        item.id === normalizeToken(rawSpecialty) ||
        specialtiesMatch(item.name, rawSpecialty)
    ) || {
      id: 'genie-logiciel',
      name: rawSpecialty,
      code: 'GL',
      filiere: 'Informatique & Digital',
    };

  const classCode = studentRecord.promo || studentRecord.classCode || 'G1';
  const academicYear = resolveValidAcademicYear(studentRecord.academicYear, academicYearsDb);

  const matchedTeacher =
    teachersDb.find((t: any) => {
      const tSpecs: string[] = [
        ...(Array.isArray(t.specialties) ? t.specialties : []),
        t.mainSpecialty,
      ].filter(Boolean);
      const tClasses: string[] = [
        ...(Array.isArray(t.assignedClasses) ? t.assignedClasses : []),
        ...(Array.isArray(t.promotions) ? t.promotions : []),
      ].filter(Boolean);

      const hasSpec = tSpecs.some((s) => specialtiesMatch(s, rawSpecialty));
      const hasClass = tClasses.some((c) => normalizeToken(c) === normalizeToken(classCode));
      return hasSpec && hasClass;
    }) ||
    teachersDb.find((t: any) => {
      const tSpecs: string[] = [
        ...(Array.isArray(t.specialties) ? t.specialties : []),
        t.mainSpecialty,
      ].filter(Boolean);
      return tSpecs.some((s) => specialtiesMatch(s, rawSpecialty));
    }) ||
    teachersDb[0] || {
      id: 'TCH-001',
      name: 'Dr. Jean-Paul Kamga',
    };

  return {
    found: true,
    profile: {
      id: studentRecord.id,
      matricule: studentRecord.matricule || `26ITMC-${specMeta.code}001`,
      name: studentRecord.name,
      email: studentRecord.email || '',
      specialtyId: specMeta.id,
      specialtyName: rawSpecialty,
      formation: specMeta.filiere,
      classCode,
      academicYear,
      assignedTeacherId: matchedTeacher.id,
      assignedTeacherName: matchedTeacher.name,
    },
  };
}

export function resolveTeacherPerimeterFromServer(params: {
  actor: AuthenticatedActor;
  teachersDb: any[];
  classesDb: any[];
  specialtyRegistry: Array<{ id: string; name: string; code: string; filiere: string }>;
}): ResolvedTeacherPerimeter | null {
  const { actor, teachersDb, classesDb, specialtyRegistry } = params;

  const teacherRecord =
    teachersDb.find(
      (t: any) =>
        t.id === actor.id ||
        (t.email && actor.email && t.email.toLowerCase() === actor.email.toLowerCase()) ||
        (t.name && actor.name && normalizeToken(t.name) === normalizeToken(actor.name))
    ) || teachersDb[0];

  if (!teacherRecord) {
    return null;
  }

  const rawSpecialties = Array.from(
    new Set(
      [
        teacherRecord.mainSpecialty,
        ...(Array.isArray(teacherRecord.specialties) ? teacherRecord.specialties : []),
      ].filter(Boolean)
    )
  );

  const rawClasses = Array.from(
    new Set(
      [
        ...(Array.isArray(teacherRecord.assignedClasses) ? teacherRecord.assignedClasses : []),
        ...(Array.isArray(teacherRecord.promotions) ? teacherRecord.promotions : []),
        ...(Array.isArray(teacherRecord.titulaireClasses) ? teacherRecord.titulaireClasses : []),
      ].filter(Boolean)
    )
  );

  for (const cls of classesDb) {
    const ids: string[] = Array.isArray(cls.assignedTeacherIds) ? cls.assignedTeacherIds : [];
    const names: string[] = Array.isArray(cls.assignedTeachers) ? cls.assignedTeachers : [];
    if (
      ids.includes(teacherRecord.id) ||
      names.some((n) => normalizeToken(n) === normalizeToken(teacherRecord.name))
    ) {
      if (cls.code && !rawClasses.includes(cls.code)) {
        rawClasses.push(cls.code);
      }
    }
  }

  const authorizedFormations = Array.from(
    new Set(
      rawSpecialties
        .map((spec) => {
          const found = specialtyRegistry.find((r) => specialtiesMatch(r.name, spec));
          return found?.filiere || teacherRecord.department;
        })
        .filter(Boolean)
    )
  );

  return {
    teacherId: teacherRecord.id,
    teacherName: teacherRecord.name,
    teacherEmail: teacherRecord.email || actor.email,
    authorizedSpecialties: rawSpecialties.map(normalizeToken),
    authorizedFormations: authorizedFormations.map(normalizeToken),
    authorizedClasses: rawClasses.map(normalizeToken),
    rawSpecialties,
    rawClasses,
  };
}

export function verifyReportAccess(params: {
  actor: AuthenticatedActor;
  report: InterventionReport;
  teacherPerimeter?: ResolvedTeacherPerimeter | null;
}): {
  allowed: boolean;
  reason?: string;
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
} {
  const { actor, report, teacherPerimeter } = params;

  const denyAll = {
    canEdit: false,
    canSubmit: false,
    canUpload: false,
    canReview: false,
    canApprove: false,
    canRequestChanges: false,
    canArchive: false,
    canDelete: false,
  };

  if (actor.role === 'admin') {
    const isEditableState =
      report.status === ReportStatus.DRAFT || report.status === ReportStatus.CHANGES_REQUESTED;
    const isReviewableState =
      report.status === ReportStatus.SUBMITTED ||
      report.status === ReportStatus.UNDER_REVIEW ||
      report.status === ReportStatus.RESUBMITTED;

    return {
      allowed: true,
      permissions: {
        canEdit: isEditableState,
        canSubmit: isEditableState,
        canUpload: isEditableState,
        canReview: isReviewableState,
        canApprove: isReviewableState,
        canRequestChanges: isReviewableState,
        canArchive: report.status === ReportStatus.APPROVED,
        canDelete: true,
      },
    };
  }

  if (actor.role === 'student') {
    const isOwner =
      report.studentId === actor.id ||
      (Boolean(report.studentEmail) &&
        Boolean(actor.email) &&
        report.studentEmail.toLowerCase() === actor.email.toLowerCase()) ||
      (Boolean(report.studentName) &&
        Boolean(actor.name) &&
        normalizeToken(report.studentName) === normalizeToken(actor.name));

    if (!isOwner) {
      return {
        allowed: false,
        reason:
          'Accès refusé (Protection Anti-IDOR) : Un étudiant ne peut jamais consulter ou modifier le rapport d’un autre étudiant.',
        permissions: denyAll,
      };
    }

    const canModify =
      report.status === ReportStatus.DRAFT || report.status === ReportStatus.CHANGES_REQUESTED;

    return {
      allowed: true,
      permissions: {
        canEdit: canModify,
        canSubmit: canModify,
        canUpload: canModify,
        canReview: false,
        canApprove: false,
        canRequestChanges: false,
        canArchive: false,
        canDelete: report.status === ReportStatus.DRAFT,
      },
    };
  }

  if (actor.role === 'teacher') {
    if (!teacherPerimeter) {
      return {
        allowed: false,
        reason: 'Périmètre pédagogique enseignant introuvable.',
        permissions: denyAll,
      };
    }

    const isAssignedTeacher = report.assignedTeacherId === teacherPerimeter.teacherId;
    const matchesAuthorizedSpecialty = teacherPerimeter.rawSpecialties.some((spec) =>
      specialtiesMatch(spec, report.specialtyName)
    );

    if (!isAssignedTeacher && !matchesAuthorizedSpecialty) {
      return {
        allowed: false,
        reason: `Accès refusé (Périmètre Spécialité) : Le rapport appartient à la spécialité [${report.specialtyName}], hors de vos spécialités autorisées (${teacherPerimeter.rawSpecialties.join(', ')}).`,
        permissions: denyAll,
      };
    }

    const isReviewableState =
      report.status === ReportStatus.SUBMITTED ||
      report.status === ReportStatus.UNDER_REVIEW ||
      report.status === ReportStatus.RESUBMITTED;

    return {
      allowed: true,
      permissions: {
        canEdit: false,
        canSubmit: false,
        canUpload: false,
        canReview: isReviewableState,
        canApprove: isReviewableState,
        canRequestChanges: isReviewableState,
        canArchive: report.status === ReportStatus.APPROVED,
        canDelete: false,
      },
    };
  }

  return {
    allowed: false,
    reason: 'Votre rôle ne dispose pas des droits nécessaires pour accéder aux rapports d’intervention.',
    permissions: denyAll,
  };
}
