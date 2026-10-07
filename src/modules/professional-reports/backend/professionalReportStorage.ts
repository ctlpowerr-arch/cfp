import fs from 'fs';
import path from 'path';
import {
  ProfessionalReport,
  ProfessionalReportStatus,
  ReportAttachmentItem,
  ReportEvaluationItem,
  ReportEventItem,
  ReportRevisionItem,
} from '../types/professionalReport.types';

export interface ProfessionalReportsDatabaseSchema {
  schemaVersion: number;
  lastSequenceByYearAndSpec: Record<string, number>;
  reports: ProfessionalReport[];
  attachments: ReportAttachmentItem[];
  evaluations: ReportEvaluationItem[];
  events: ReportEventItem[];
  revisions: ReportRevisionItem[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'professional_reports_db.json');
const PRIVATE_STORAGE_ROOT = path.resolve(process.cwd(), 'storage', 'professional_reports');

function ensurePrivateStorageDirectory(): void {
  if (!fs.existsSync(PRIVATE_STORAGE_ROOT)) {
    fs.mkdirSync(PRIVATE_STORAGE_ROOT, { recursive: true });
  }
}

export function createInitialSeed(): ProfessionalReportsDatabaseSchema {
  const now = new Date().toISOString();
  const twoDaysAgo = new Date(Date.now() - 2 * 86400_000).toISOString();
  const fiveDaysAgo = new Date(Date.now() - 5 * 86400_000).toISOString();

  const reports: ProfessionalReport[] = [
    // 1. Plomberie (Bâtiment) - Statut: SUBMITTED
    {
      id: 'RPT-UUID-PLOMB-0001',
      reportNumber: 'RPT-2026-PLOMB-0001',
      templateId: 'tpl-plomb-v1',
      templateVersion: 1,
      version: 2,
      studentId: 'std_101',
      studentMatricule: '26ITMC-BAT004',
      studentName: 'Boris Kamdem',
      studentEmail: 'b.kamdem@itmc-it.cm',
      specialtyId: 'plomberie',
      specialtyCode: 'PLOMB',
      specialtyName: 'Plomberie',
      category: 'BATIMENT_CONSTRUCTION',
      formation: 'Bâtiment & Travaux',
      classCode: 'G1',
      academicYear: '2026-2027',
      assignedTeacherId: 'TCH-005',
      assignedTeacherName: 'M. André Tchamba',
      title: 'Pose et raccordement du collecteur sanitaire et test d’étanchéité à 6 bars',
      activityType: 'TP_ATELIER',
      activityDate: '2026-09-29',
      startTime: '08:00',
      endTime: '14:00',
      durationHours: 6,
      location: 'Atelier Plomberie & Fluides CFP-ITMC',
      clientOrHostOrg: 'Banc d’Essai Pédagogique Sanitaire',
      clientPhone: '+237 677 00 11 22',
      clientAddress: 'Campus ITMC Douala',
      problemOrContext: 'Mise en place d’une nourrice de distribution d’eau sanitaire pour 4 pièces d’eau.',
      objectives: 'Brasure cuivre Ø16, sertissage PER Ø16 et épreuve hydraulique sous pression.',
      summaryDescription: 'Montage du collecteur, fixation des colliers isophoniques, piquages et mise en eau.',
      dynamicValues: {
        typeReseau: 'ALIM_EF_EC',
        diametreTuyaux: 'Cuivre écroui Ø14/16 et multicouche Ø16',
        pressionService: 3.5,
        testEtancheite: 'OK_ZERO_FUITE',
      },
      steps: [
        {
          id: 'step_p1',
          order: 1,
          title: 'Traçage et pose des supports isophoniques',
          description: 'Implantation des entraxes et fixation des colliers sur mur témoin.',
          durationMinutes: 60,
          status: 'DONE',
        },
        {
          id: 'step_p2',
          order: 2,
          title: 'Brasure forte capillaire et sertissage PER',
          description: 'Assemblage des tés et vannes d’arrêt 1/4 de tour.',
          durationMinutes: 180,
          status: 'DONE',
        },
        {
          id: 'step_p3',
          order: 3,
          title: 'Épreuve sous pression à la pompe manuelle',
          description: 'Mise à 6 bars pendant 30 minutes avec manomètre étalon.',
          durationMinutes: 60,
          status: 'DONE',
        },
      ],
      materials: [
        { id: 'mat_p1', name: 'Tube Cuivre écroui Ø16', quantity: 6, unit: 'mètres' },
        { id: 'mat_p2', name: 'Nourrice de distribution 4 départs', quantity: 2, unit: 'unités' },
      ],
      tools: [
        { id: 'tool_p1', name: 'Chalumeau oxygène-acétylène', category: 'OUTILLAGE_MANUEL' },
        { id: 'tool_p2', name: 'Pompe d’épreuve hydraulique Virax', category: 'MESURE' },
      ],
      difficulties: [
        {
          id: 'diff_p1',
          problem: 'Micro-suintement sur raccord à visser au 1er gonflage',
          cause: 'Quantité insuffisante de filasse et pâte à joint',
          solution: 'Démontage, nettoyage du filetage et ré-enroulement de filasse',
          result: 'Étanchéité parfaite à 6 bars',
          severity: 'LOW',
        },
      ],
      testsAndControls: [
        {
          id: 'test_p1',
          name: 'Contrôle de maintien de pression 30 min',
          parameter: 'Pression manomètre',
          expectedValue: '6.0',
          measuredValue: '6.0',
          unit: 'bars',
          status: 'CONFORME',
        },
      ],
      competencies: [
        {
          code: 'PLOMB-C02',
          label: 'Mettre en œuvre les techniques de raccordement et brasure',
          domain: 'Réalisation Technique',
          studentLevel: 'ACQUIS',
        },
      ],
      safety: {
        ppeEquipmentUsed: ['Lunettes de protection', 'Gants de soudeur cuir', 'Chaussures de sécurité'],
        safetyBriefingDone: true,
        isolationOrPowerOffDone: true,
        areaSecured: true,
        rulesAppliedNotes: 'Ventilation du poste de brasure et présence d’un extincteur CO2 à proximité.',
        observations: 'Aucun incident thermique.',
      },
      studentBilan: {
        learned: 'Maîtrise du bon dosage de la chauffe pour la brasure capillaire cuivre.',
        succeeded: 'Épreuve de pression validée du premier coup après reprise du raccord.',
        difficulties: 'Régularité du cordon de brasure sur les zones peu accessibles.',
        improvements: 'Améliorer la vitesse de découpe et d’ébavurage des tubes.',
        overallScore: 4,
        studentComments: 'Très bon TP formateur.',
      },
      attachments: [],
      evaluations: [],
      events: [
        {
          id: 'evt_p1',
          reportId: 'RPT-UUID-PLOMB-0001',
          actorId: 'std_101',
          actorName: 'Boris Kamdem',
          actorRole: 'student',
          actorIp: '127.0.0.1',
          action: 'REPORT_SUBMITTED',
          fromStatus: ProfessionalReportStatus.DRAFT,
          toStatus: ProfessionalReportStatus.SUBMITTED,
          details: 'Soumission officielle du rapport pour évaluation par M. André Tchamba.',
          timestamp: twoDaysAgo,
        },
      ],
      revisions: [],
      status: ProfessionalReportStatus.SUBMITTED,
      currentRevision: 1,
      latestScoreOn20: null,
      createdAt: fiveDaysAgo,
      updatedAt: twoDaysAgo,
      submittedAt: twoDaysAgo,
      reviewedAt: null,
      validatedAt: null,
      archivedAt: null,
    },

    // 2. Conception de Logiciels (Informatique) - Statut: APPROVED (18/20)
    {
      id: 'RPT-UUID-DEVLOG-0002',
      reportNumber: 'RPT-2026-DEVLOG-0001',
      templateId: 'tpl-devlog-v1',
      templateVersion: 1,
      version: 3,
      studentId: 'std_102',
      studentMatricule: '26ITMC-GL001',
      studentName: 'Arthur Ngassa',
      studentEmail: 'a.ngassa@itmc-it.cm',
      specialtyId: 'conception-de-logiciels',
      specialtyCode: 'DEVLOG',
      specialtyName: 'Conception de Logiciels',
      category: 'INFORMATIQUE_DIGITAL_COMMUNICATION',
      formation: 'Informatique & Digital',
      classCode: 'G1',
      academicYear: '2026-2027',
      assignedTeacherId: 'TCH-001',
      assignedTeacherName: 'Dr. Jean-Paul Kamga',
      title: 'Implémentation d’une API REST sécurisée avec JWT, RBAC et tests d’intégration Jest',
      activityType: 'PROJET_INTEGRE',
      activityDate: '2026-09-27',
      startTime: '09:00',
      endTime: '17:00',
      durationHours: 8,
      location: 'Laboratoire Génie Logiciel & Cloud',
      clientOrHostOrg: 'Portail Académique CFP-ITMC',
      clientPhone: '+237 677 88 99 00',
      clientAddress: 'Douala Logpom',
      problemOrContext: 'Sécurisation des accès aux endpoints critiques et gestion des rôles multi-utilisateurs.',
      objectives: 'Architecture MVC en couches, hachage bcrypt, tokens signés RS256 et couverture Jest > 85%.',
      summaryDescription: 'Création des middlewares d’authentification, contrôleurs et suites de tests automatisés.',
      dynamicValues: {
        stackTechnologique: 'Node.js, TypeScript, Express, PostgreSQL, Jest, Supertest',
        repoOrBranch: 'git.itmc-lab.cm/gl/auth-service (branch: main)',
        couvertureTests: 92,
        bugsResolus: 'Correction du bug de token expiré non catché provoquant un crash serveur.',
      },
      steps: [
        {
          id: 'step_d1',
          order: 1,
          title: 'Conception du modèle de données et schémas Zod',
          description: 'Validation stricte des payloads entrants.',
          durationMinutes: 120,
          status: 'DONE',
        },
        {
          id: 'step_d2',
          order: 2,
          title: 'Développement des middlewares d’autorisation',
          description: 'Vérification des rôles et permissions.',
          durationMinutes: 180,
          status: 'DONE',
        },
      ],
      materials: [
        { id: 'mat_d1', name: 'Poste de développement Linux Workstation', quantity: 1, unit: 'poste' },
      ],
      tools: [
        { id: 'tool_d1', name: 'VS Code & Postman API Client', category: 'LOGICIEL_DIAGNOSTIC' },
      ],
      difficulties: [
        {
          id: 'diff_d1',
          problem: 'Conflit de migration de schéma PostgreSQL',
          cause: 'Colonne non nullable sans valeur par défaut',
          solution: 'Écriture d’une migration idempotente avec valeur de repli',
          result: 'Migration réussie',
          severity: 'MEDIUM',
        },
      ],
      testsAndControls: [
        {
          id: 'test_d1',
          name: 'Exécution de la suite de tests Jest (24 tests)',
          parameter: 'Taux de succès des tests',
          expectedValue: '100',
          measuredValue: '100',
          unit: '%',
          status: 'CONFORME',
        },
      ],
      competencies: [
        {
          code: 'DEVLOG-C02',
          label: 'Mettre en œuvre les techniques et procédures de programmation sécurisée',
          domain: 'Réalisation Technique',
          studentLevel: 'EXPERT',
          teacherLevel: 'EXPERT',
        },
      ],
      safety: {
        ppeEquipmentUsed: ['Poste ergonomique conforme'],
        safetyBriefingDone: true,
        isolationOrPowerOffDone: false,
        areaSecured: true,
        rulesAppliedNotes: 'Stockage des secrets d’API dans un fichier .env exclu du contrôle de version Git.',
        observations: 'Zéro fuite d’information sensible.',
      },
      studentBilan: {
        learned: 'Maîtrise avancée des concepts d’authentification asymétrique RS256.',
        succeeded: 'Couverture de tests supérieure à 90%.',
        difficulties: 'Mocking propre des requêtes de base de données sous Jest.',
        improvements: 'Ajouter une documentation OpenAPI / Swagger interactive.',
        overallScore: 5,
        studentComments: 'Projet complet et prêt pour la production.',
      },
      attachments: [],
      evaluations: [
        {
          id: 'eval_d1',
          reportId: 'RPT-UUID-DEVLOG-0002',
          revisionNumber: 1,
          teacherId: 'TCH-001',
          teacherName: 'Dr. Jean-Paul Kamga',
          decision: ProfessionalReportStatus.APPROVED,
          criteriaScores: {
            crit_technique: 5.5,
            crit_securite: 4,
            crit_analyse: 4.5,
            crit_redaction: 4,
          },
          scoreOn20: 18.0,
          generalFeedback: 'Excellent travail de conception logicielle. Le code est modulaire, testé et sécurisé.',
          strengths: 'Rigueur architecturale, couverture Jest exemplaire.',
          improvementsRequired: 'Poursuivre la veille sur les standards OAuth2.',
          annotatedSections: [
            { sectionKey: 'specifiqueMetier', comment: 'Très bonne implémentation des tests.', severity: 'INFO' },
          ],
          evaluatedAt: now,
        },
      ],
      events: [
        {
          id: 'evt_d1',
          reportId: 'RPT-UUID-DEVLOG-0002',
          actorId: 'TCH-001',
          actorName: 'Dr. Jean-Paul Kamga',
          actorRole: 'teacher',
          actorIp: '127.0.0.1',
          action: 'REPORT_APPROVED',
          fromStatus: ProfessionalReportStatus.SUBMITTED,
          toStatus: ProfessionalReportStatus.APPROVED,
          details: 'Validation et attribution de la note officielle de 18.0 / 20.',
          timestamp: now,
        },
      ],
      revisions: [],
      status: ProfessionalReportStatus.APPROVED,
      currentRevision: 1,
      latestScoreOn20: 18.0,
      createdAt: fiveDaysAgo,
      updatedAt: now,
      submittedAt: twoDaysAgo,
      reviewedAt: now,
      validatedAt: now,
      archivedAt: null,
    },
  ];

  return {
    schemaVersion: 1,
    lastSequenceByYearAndSpec: {
      '2026-PLOMB': 1,
      '2026-DEVLOG': 1,
    },
    reports,
    attachments: [],
    evaluations: [],
    events: [],
    revisions: [],
  };
}

let cachedDatabase: ProfessionalReportsDatabaseSchema | null = null;

export function loadProfessionalReportsDb(): ProfessionalReportsDatabaseSchema {
  ensurePrivateStorageDirectory();
  if (cachedDatabase) {
    return cachedDatabase;
  }

  const seed = createInitialSeed();

  if (!fs.existsSync(DB_FILE_PATH)) {
    saveProfessionalReportsDb(seed);
    cachedDatabase = seed;
    return seed;
  }

  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<ProfessionalReportsDatabaseSchema>;

    if (!parsed.reports || parsed.reports.length === 0) {
      saveProfessionalReportsDb(seed);
      cachedDatabase = seed;
      return seed;
    }

    cachedDatabase = {
      schemaVersion: parsed.schemaVersion || 1,
      lastSequenceByYearAndSpec: parsed.lastSequenceByYearAndSpec || seed.lastSequenceByYearAndSpec,
      reports: Array.isArray(parsed.reports) ? parsed.reports : seed.reports,
      attachments: Array.isArray(parsed.attachments) ? parsed.attachments : [],
      evaluations: Array.isArray(parsed.evaluations) ? parsed.evaluations : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
      revisions: Array.isArray(parsed.revisions) ? parsed.revisions : [],
    };
    return cachedDatabase;
  } catch (err) {
    console.error('[PROFESSIONAL-REPORTS] Erreur de lecture DB, restauration seed :', err);
    saveProfessionalReportsDb(seed);
    cachedDatabase = seed;
    return seed;
  }
}

export function saveProfessionalReportsDb(db: ProfessionalReportsDatabaseSchema): void {
  ensurePrivateStorageDirectory();
  cachedDatabase = db;
  const tempFile = `${DB_FILE_PATH}.tmp.${process.pid}`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE_PATH);
}

export function generateNextReportNumber(
  db: ProfessionalReportsDatabaseSchema,
  academicYear: string,
  specialtyCode: string
): string {
  const yearPrefix = (academicYear || '2026').slice(0, 4).replace(/[^0-9]/g, '') || '2026';
  const cleanSpec = (specialtyCode || 'GEN')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6) || 'GEN';
  const seqKey = `${yearPrefix}-${cleanSpec}`;
  const nextNumber = (db.lastSequenceByYearAndSpec[seqKey] || 0) + 1;
  db.lastSequenceByYearAndSpec[seqKey] = nextNumber;
  return `RPT-${yearPrefix}-${cleanSpec}-${String(nextNumber).padStart(4, '0')}`;
}

export function writePrivateAttachmentFile(params: {
  reportId: string;
  storedFileName: string;
  buffer: Buffer;
}): string {
  ensurePrivateStorageDirectory();
  const safeReportDirName = params.reportId.replace(/[^a-zA-Z0-9_-]/g, '');
  const safeFileName = path.basename(params.storedFileName).replace(/[^a-zA-Z0-9._-]/g, '');

  const reportFolder = path.resolve(PRIVATE_STORAGE_ROOT, safeReportDirName);
  if (!reportFolder.startsWith(PRIVATE_STORAGE_ROOT)) {
    throw new Error('Violation de sécurité : chemin invalide.');
  }

  if (!fs.existsSync(reportFolder)) {
    fs.mkdirSync(reportFolder, { recursive: true });
  }

  const fullFilePath = path.resolve(reportFolder, safeFileName);
  if (!fullFilePath.startsWith(reportFolder)) {
    throw new Error('Violation de sécurité : chemin invalide.');
  }

  fs.writeFileSync(fullFilePath, params.buffer);
  return path.relative(PRIVATE_STORAGE_ROOT, fullFilePath);
}

export function readPrivateAttachmentFile(storageRelativePath: string): Buffer | null {
  ensurePrivateStorageDirectory();
  const normalizedRel = storageRelativePath.replace(/^(\.\.(\/|\\|$))+/, '');
  const fullFilePath = path.resolve(PRIVATE_STORAGE_ROOT, normalizedRel);

  if (!fullFilePath.startsWith(PRIVATE_STORAGE_ROOT) || !fs.existsSync(fullFilePath)) {
    return null;
  }

  try {
    return fs.readFileSync(fullFilePath);
  } catch (err) {
    console.error('[PROFESSIONAL-REPORTS] Erreur de lecture binaire :', err);
    return null;
  }
}

export function deletePrivateAttachmentFile(storageRelativePath: string): boolean {
  ensurePrivateStorageDirectory();
  const normalizedRel = storageRelativePath.replace(/^(\.\.(\/|\\|$))+/, '');
  const fullFilePath = path.resolve(PRIVATE_STORAGE_ROOT, normalizedRel);

  if (!fullFilePath.startsWith(PRIVATE_STORAGE_ROOT)) {
    return false;
  }

  if (fs.existsSync(fullFilePath)) {
    try {
      fs.unlinkSync(fullFilePath);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}
