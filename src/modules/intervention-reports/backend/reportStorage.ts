import fs from 'fs';
import path from 'path';
import {
  InterventionReport,
  ReportAttachment,
  ReportCompetency,
  ReportDifficulty,
  ReportEvaluation,
  ReportEvent,
  ReportMaterial,
  ReportRevision,
  ReportStatus,
  ReportStep,
  ReportTest,
  ReportTool,
} from '../types/report.types';

export interface InterventionReportsDatabaseSchema {
  schemaVersion: number;
  lastSequenceByYearAndSpec: Record<string, number>;
  reports: InterventionReport[];
  report_steps: ReportStep[];
  report_materials: ReportMaterial[];
  report_tools: ReportTool[];
  report_difficulties: ReportDifficulty[];
  report_tests: ReportTest[];
  report_competencies: ReportCompetency[];
  report_attachments: ReportAttachment[];
  report_evaluations: ReportEvaluation[];
  report_events: ReportEvent[];
  report_revisions: ReportRevision[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'intervention_reports_db.json');
const PRIVATE_STORAGE_ROOT = path.resolve(process.cwd(), 'storage', 'intervention_reports');

function ensurePrivateStorageDirectory(): void {
  if (!fs.existsSync(PRIVATE_STORAGE_ROOT)) {
    fs.mkdirSync(PRIVATE_STORAGE_ROOT, { recursive: true });
  }
}

export function createInitialDatabaseSeed(): InterventionReportsDatabaseSchema {
  const now = new Date().toISOString();
  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
  const oneDayAgo = new Date(Date.now() - 86400_000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 2 * 86400_000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 86400_000).toISOString();
  const fiveDaysAgo = new Date(Date.now() - 5 * 86400_000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

  // ============================================================================
  // 5 EXEMPLES RÉALISTES DE RAPPORTS D'INTERVENTION
  // ============================================================================
  const reports: InterventionReport[] = [
    // --------------------------------------------------------------------------
    // 1. RAPPORT GL : Déploiement Cluster Docker & BD (Statut: SUBMITTED)
    // --------------------------------------------------------------------------
    {
      id: 'RPT-UUID-9a8f1b2c-0001',
      reportNumber: 'RPT-2026-GL-0001',
      version: 3,
      studentId: 'std_101',
      studentMatricule: '26ITMC-GL001',
      studentName: 'Arthur Ngassa',
      studentEmail: 'a.ngassa@itmc-it.cm',
      specialtyId: 'genie-logiciel',
      specialtyName: 'Génie Logiciel',
      formation: 'Informatique & Digital',
      classCode: 'G1',
      academicYear: '2026-2027',
      assignedTeacherId: 'TCH-001',
      assignedTeacherName: 'Dr. Jean-Paul Kamga',
      title: 'Déploiement et sécurisation d’un cluster API REST & PostgreSQL sous Docker',
      interventionType: 'INSTALLATION',
      interventionDate: '2026-09-28',
      startTime: '08:30',
      endTime: '14:30',
      durationHours: 6,
      clientOrSite: 'Serveur Pédagogique SRV-ITMC-PROD-02',
      clientPhone: '+237 677 88 99 10',
      clientAddress: 'Campus ITMC, Bâtiment A, Salle Serveurs',
      location: 'Laboratoire Génie Logiciel & Cloud — Bâtiment A',
      problemObserved: 'Ralentissements critiques et instabilités de service sur l’infrastructure de staging suite à une saturation des connexions directes à la base de données.',
      contextAndObjective:
        'Mise en place d’une architecture conteneurisée haute disponibilité pour l’hébergement du portail académique interne avec reverse-proxy Nginx, certificats TLS et réplication PostgreSQL avec pooler de connexions PgBouncer.',
      generalDescription:
        'Configuration des conteneurs Docker, isolation des réseaux bridge internes, durcissement des variables d’environnement et mise en place des sondes de santé (healthchecks).',
      safetyMeasures:
        'Sauvegarde préalable des volumes existants, isolation du réseau de test VLAN 40, utilisation de comptes système non-root dans les conteneurs.',
      safetyChecklist: {
        epiGlasses: true,
        epiGloves: true,
        epiHelmet: false,
        epiShoes: true,
        lockoutTagout: true,
        areaSignage: true,
        voltageFreeCheck: true,
        emergencyStopChecked: true,
        rulesApplied: 'Norme NFC 18-510 & Bonnes pratiques Docker CIS Benchmark',
        observations: 'Sauvegarde préalable effectuée et validation des accès sécurisés.',
      },
      observations:
        'Le temps de réponse moyen de l’API est passé de 240 ms à 48 ms après activation du pool de connexions PgBouncer.',
      conclusion:
        'Infrastructure opérationnelle, conforme aux exigences de sécurité OWASP et prête pour la mise en production.',
      selfEvaluation: {
        autonomyScore: 4,
        technicalMasteryScore: 5,
        safetyComplianceScore: 5,
        learned: 'Maîtrise avancée des réseaux overlay Docker et du tuning de PostgreSQL.',
        succeeded: 'Déploiement zéro défaut avec temps de réponse divisé par 5.',
        difficultiesFaced: 'Gestion fine des permissions sur les volumes persistants.',
        improvementsGoal: 'Automatiser le renouvellement automatique des certificats SSL Let’s Encrypt.',
        studentComment: 'Excellente maîtrise de Docker Compose et du durcissement TLS.',
      },
      status: ReportStatus.SUBMITTED,
      currentRevision: 1,
      latestScoreOn20: null,
      createdAt: fiveDaysAgo,
      updatedAt: twoDaysAgo,
      submittedAt: twoDaysAgo,
      reviewedAt: null,
      validatedAt: null,
      archivedAt: null,
    },

    // --------------------------------------------------------------------------
    // 2. RAPPORT RT : Diagnostic Réseau Cisco Catalyst & VLAN (Statut: APPROVED)
    // --------------------------------------------------------------------------
    {
      id: 'RPT-UUID-7c4d2e9f-0002',
      reportNumber: 'RPT-2026-RT-0001',
      version: 4,
      studentId: 'std_102',
      studentMatricule: '26ITMC-RT014',
      studentName: 'Bérénice Tchoumi',
      studentEmail: 'b.tchoumi@itmc-it.cm',
      specialtyId: 'reseaux-systemes',
      specialtyName: 'Réseaux & Systèmes',
      formation: 'Informatique & Digital',
      classCode: 'G2',
      academicYear: '2026-2027',
      assignedTeacherId: 'TCH-002',
      assignedTeacherName: 'Ing. Samuel Eboué',
      title: 'Diagnostic et segmentation VLAN / OSPF sur commutateurs Cisco Catalyst L3',
      interventionType: 'DEPANNAGE',
      interventionDate: '2026-09-25',
      startTime: '09:00',
      endTime: '14:00',
      durationHours: 5,
      clientOrSite: 'Cœur de réseau Campus ITMC — Baie RACK-01',
      clientPhone: '+237 677 88 99 20',
      clientAddress: 'Campus ITMC, Salle Technique Baie de Brassage',
      location: 'Salle Serveurs & Baie de Brassage Principale',
      problemObserved: 'Tempêtes de broadcast massives causant 68% de pertes de paquets entre les salles TP et le réseau administratif.',
      contextAndObjective:
        'Résolution des tempêtes de broadcast constatées entre le réseau administratif et les salles de TP étudiantes par segmentation VLAN 802.1Q et routage inter-VLAN.',
      generalDescription:
        'Analyse du trafic via Wireshark, reconfiguration des ports Trunk, activation de Rapid-PVST+ avec PortFast/BPDU Guard et mise en place des ACL de filtrage inter-VLAN.',
      safetyMeasures:
        'Port du bracelet antistatique ESD, repérage et étiquetage des jarretières optiques avant déconnexion, sauvegarde de la running-config sur serveur TFTP.',
      safetyChecklist: {
        epiGlasses: false,
        epiGloves: true,
        epiHelmet: false,
        epiShoes: true,
        lockoutTagout: true,
        areaSignage: true,
        voltageFreeCheck: true,
        emergencyStopChecked: true,
        rulesApplied: 'Règles ESD IEEE 142 et consignation salle serveurs',
        observations: 'Bracelet ESD vérifié et balisage de la zone d’intervention établi.',
      },
      observations:
        'Une boucle physique sur le commutateur d’accès SW-TP-03 causait 68% de perte de paquets. Le mécanisme BPDU Guard bloque désormais immédiatement toute boucle.',
      conclusion:
        'Stabilité complète du réseau rétablie. Latence inter-VLAN inférieure à 1.2 ms.',
      selfEvaluation: {
        autonomyScore: 5,
        technicalMasteryScore: 4,
        safetyComplianceScore: 5,
        learned: 'Maîtrise de la capture et analyse des trames 802.1Q et Spanning Tree.',
        succeeded: 'Élimination totale de la boucle réseau sans interruption du service administratif.',
        difficultiesFaced: 'Identification du switch non managé raccordé clandestinement en salle de TP.',
        improvementsGoal: 'Activer le filtrage 802.1X sur l’ensemble des prises murales.',
        studentComment: 'Diagnostic rapide grâce à l’analyse des trames Spanning-Tree.',
      },
      status: ReportStatus.APPROVED,
      currentRevision: 1,
      latestScoreOn20: 17.5,
      createdAt: fiveDaysAgo,
      updatedAt: now,
      submittedAt: twoDaysAgo,
      reviewedAt: now,
      validatedAt: now,
      archivedAt: null,
    },

    // --------------------------------------------------------------------------
    // 3. RAPPORT EL : Système Solaire Photovoltaïque 5kVA (Statut: UNDER_REVIEW)
    // --------------------------------------------------------------------------
    {
      id: 'RPT-UUID-3b5e8a1d-0003',
      reportNumber: 'RPT-2026-EL-0001',
      version: 2,
      studentId: 'std_103',
      studentMatricule: '26ITMC-EL009',
      studentName: 'Cédric Mballa',
      studentEmail: 'c.mballa@itmc-it.cm',
      specialtyId: 'electrotechnique-energie',
      specialtyName: 'Électrotechnique & Énergies Renouvelables',
      formation: 'Industrie & Énergies',
      classCode: 'G1',
      academicYear: '2026-2027',
      assignedTeacherId: 'TCH-003',
      assignedTeacherName: 'Ing. Patrick Nguemo',
      title: 'Installation et raccordement d’un système photovoltaïque hybride 5kVA avec banc de batteries Lithium',
      interventionType: 'INSTALLATION',
      interventionDate: '2026-09-30',
      startTime: '08:00',
      endTime: '16:30',
      durationHours: 8.5,
      clientOrSite: 'Cabinet Médical La Grâce — Douala Bonamoussadi',
      clientPhone: '+237 699 44 22 11',
      clientAddress: 'Rue des Palmiers, Face Clinique des Anges, Douala',
      location: 'Toiture terrasse & Local technique TGBT',
      problemObserved: 'Coupures d’énergie intempestives du réseau Eneo interrompant les équipements médicaux sensibles (échographe, réfrigérateur de vaccins).',
      contextAndObjective:
        'Dimensionnement, pose des structures porteuses, raccordement de 10 panneaux solaires 500Wc, câblage de l’onduleur chargeur hybride Victron 48V/5000VA et paramétrage du basculement automatique sans coupure (< 20 ms).',
      generalDescription:
        'Pose des rails aluminium et fixations antivol, câblage en série-parallèle avec connecteurs MC4 étanches IP68, passage de câbles DC solaires 6mm² sous gaine ICTA, mise à la terre équipotentielle du champ PV (< 5 Ohms) et raccordement du coffret de protection DC/AC parafoudre.',
      safetyMeasures:
        'Harnais antichute fixé sur ligne de vie temporaire, chaussures de sécurité isolantes 1000V, gants composites classe 0, vérification d’absence de tension (VAT) et consignation cadenassée du disjoncteur général de branchement.',
      safetyChecklist: {
        epiGlasses: true,
        epiGloves: true,
        epiHelmet: true,
        epiShoes: true,
        lockoutTagout: true,
        areaSignage: true,
        voltageFreeCheck: true,
        emergencyStopChecked: true,
        rulesApplied: 'Norme NFC 15-100 & Guide UTE C15-712-1 pour installations PV',
        observations: 'Contrôle d’isolement diélectrique supérieur à 50 MΩ sous 1000V DC.',
      },
      observations:
        'Production solaire instantanée mesurée à 4.2 kW à 12h30 sous un ensoleillement de 850 W/m². Rendement onduleur mesuré à 94.6%.',
      conclusion:
        'Système autonome en service continu, basculement onduleur testé avec succès lors d’une coupure réseau simulée. Aucun redémarrage des automates médicaux.',
      selfEvaluation: {
        autonomyScore: 5,
        technicalMasteryScore: 5,
        safetyComplianceScore: 5,
        learned: 'Maîtrise du serrage au couple des cosses batterie M8 et paramétrage du bus CAN BMS Pylontech.',
        succeeded: 'Temps de commutation nul et zéro défaut d’isolement.',
        difficultiesFaced: 'Acheminement sécurisé des câbles DC dans la gaine technique verticale exiguë.',
        improvementsGoal: 'Intégrer le monitoring distant via carte Cerbo-GX et portail VRM.',
        studentComment: 'Intervention exigeante sur le plan de la sécurité électrique et de la rigueur de câblage.',
      },
      status: ReportStatus.UNDER_REVIEW,
      currentRevision: 1,
      latestScoreOn20: null,
      createdAt: twoDaysAgo,
      updatedAt: oneDayAgo,
      submittedAt: oneDayAgo,
      reviewedAt: null,
      validatedAt: null,
      archivedAt: null,
    },

    // --------------------------------------------------------------------------
    // 4. RAPPORT MI : Maintenance Bras Manipulateur Siemens (Statut: CHANGES_REQUESTED)
    // --------------------------------------------------------------------------
    {
      id: 'RPT-UUID-4d6f9c2e-0004',
      reportNumber: 'RPT-2026-MI-0001',
      version: 2,
      studentId: 'std_104',
      studentMatricule: '26ITMC-MI022',
      studentName: 'Diane Fouda',
      studentEmail: 'd.fouda@itmc-it.cm',
      specialtyId: 'maintenance-industrielle',
      specialtyName: 'Maintenance Industrielle & Automatisme',
      formation: 'Industrie & Énergies',
      classCode: 'G2',
      academicYear: '2026-2027',
      assignedTeacherId: 'TCH-004',
      assignedTeacherName: 'Mme Claire Bikoue',
      title: 'Maintenance curative sur bras manipulateur pneumatique et automate Siemens S7-1200 en cellule d’usinage',
      interventionType: 'MAINTENANCE',
      interventionDate: '2026-09-29',
      startTime: '13:30',
      endTime: '18:00',
      durationHours: 4.5,
      clientOrSite: 'Atelier de Fabrication Mécanique — Ligne d’Assemblage 2',
      clientPhone: '+237 677 12 34 56',
      clientAddress: 'Zone Industrielle de Bassa, Douala',
      location: 'Cellule Robotisée d’Usinage CNC & Transfert Pneumatique',
      problemObserved: 'Blocage aléatoire du vérin rotatif de prise de pièce et mise en sécurité récurrente de l’automate avec code d’erreur Timeout Étape 4 Grafcet.',
      contextAndObjective:
        'Localiser l’origine de la perte de cadence sur la cellule de transfert, remplacer les composants pneumatiques défaillants et reprogrammer les temporisations de confirmation sous TIA Portal v18.',
      generalDescription:
        'Purge et consignation du circuit pneumatique 6 bars, test des capteurs magnétiques Reed ILS de fin de course vérin, remplacement du distributeur 5/2 bistable à commande électrique 24VDC et ajustement des régulateurs de débit unidirectionnels.',
      safetyMeasures:
        'Consignation électrique cadenassée (LOTO) du coffret automate, purge totale de la pression résiduelle avec manomètre de contrôle à 0 bar, pose de cales mécaniques de sécurité sous les charges suspendues du bras.',
      safetyChecklist: {
        epiGlasses: true,
        epiGloves: true,
        epiHelmet: true,
        epiShoes: true,
        lockoutTagout: true,
        areaSignage: true,
        voltageFreeCheck: true,
        emergencyStopChecked: true,
        rulesApplied: 'Directive Machine 2006/42/CE & Procédure de consignation des fluides sous pression',
        observations: 'Consignation pneumatique et purge validée avant toute intervention mécanique.',
      },
      observations:
        'Le tiroir interne du distributeur 5/2 était gommé par des dépôts d’huile de compresseur calcinée. Le remplacement et l’ajout d’un filtre coalescent 0.01 µm ont résolu la cause racine.',
      conclusion:
        'Cellule remise en cycle automatique. Cadence rétablie à 42 pièces/minute sans aucun à-coup.',
      selfEvaluation: {
        autonomyScore: 4,
        technicalMasteryScore: 4,
        safetyComplianceScore: 5,
        learned: 'Diagnostic précis par l’état des LED des entrées TOR automate sous TIA Portal.',
        succeeded: 'Résolution complète de la panne intermittente sans remplacer le vérin principal.',
        difficultiesFaced: 'Accessibilité très restreinte de l’îlot de distribution pneumatique.',
        improvementsGoal: 'Préconiser un plan de vidange régulier du groupe FRL de la ligne.',
        studentComment: 'Rapport complet en attente des photos des électrovannes demandées par l’enseignante.',
      },
      status: ReportStatus.CHANGES_REQUESTED,
      currentRevision: 1,
      latestScoreOn20: null,
      createdAt: threeDaysAgo,
      updatedAt: oneDayAgo,
      submittedAt: twoDaysAgo,
      reviewedAt: oneDayAgo,
      validatedAt: null,
      archivedAt: null,
    },

    // --------------------------------------------------------------------------
    // 5. RAPPORT GL : Passerelle de Paiement Mobile Money (Statut: DRAFT)
    // --------------------------------------------------------------------------
    {
      id: 'RPT-UUID-5e7a0d3f-0005',
      reportNumber: 'RPT-2026-GL-0002',
      version: 1,
      studentId: 'std_105',
      studentMatricule: '26ITMC-GL038',
      studentName: 'Emmanuel Nono',
      studentEmail: 'e.nono@itmc-it.cm',
      specialtyId: 'genie-logiciel',
      specialtyName: 'Génie Logiciel',
      formation: 'Informatique & Digital',
      classCode: 'G1',
      academicYear: '2026-2027',
      assignedTeacherId: 'TCH-001',
      assignedTeacherName: 'Dr. Jean-Paul Kamga',
      title: 'Implémentation et audit de sécurité d’une passerelle de paiement Orange Money & MTN MoMo',
      interventionType: 'PROJET_TECHNIQUE',
      interventionDate: '2026-10-01',
      startTime: '10:00',
      endTime: '15:30',
      durationHours: 5.5,
      clientOrSite: 'Plateforme E-Commerce ITMC Store — Serveur Sandbox',
      clientPhone: '+237 655 00 11 22',
      clientAddress: 'Campus ITMC, Incubateur Tech & Startups',
      location: 'Laboratoire de Développement Logiciel & FinTech',
      problemObserved: 'Nécessité de sécuriser les transactions financières en ligne contre les attaques de rejeu (Replay Attacks) et les fraudes par altération de webhook.',
      contextAndObjective:
        'Concevoir et intégrer un microservice Node.js/TypeScript d’encaissement sécurisé prenant en charge les paiements Mobile Money avec signature cryptographique HMAC-SHA256, clé d’idempotence et persistance transactionnelle ACID.',
      generalDescription:
        'Écriture des handlers API REST, mise en place de workers asynchrones BullMQ / Redis pour le traitement des notifications de paiement (webhooks) et chiffrement des clés secrètes d’API dans un coffre-fort de variables Vault.',
      safetyMeasures:
        'Isolation des clés d’API privées hors du code source Git, validation stricte des schémas d’entrée via Zod, rate-limiting anti-bruteforce (10 req/min par IP sur les endpoints sensibles).',
      safetyChecklist: {
        epiGlasses: false,
        epiGloves: false,
        epiHelmet: false,
        epiShoes: true,
        lockoutTagout: false,
        areaSignage: false,
        voltageFreeCheck: false,
        emergencyStopChecked: false,
        rulesApplied: 'Standards de sécurité PCI-DSS v4.0 & Recommandations OWASP API Security Top 10',
        observations: 'Environnement de test 100% virtualisé sur réseau sécurisé avec certificats TLS 1.3.',
      },
      observations:
        '100% des requêtes falsifiées sans signature HMAC valide ont été immédiatement rejetées avec code HTTP 401 Unauthorized.',
      conclusion:
        'Module de paiement prêt pour la phase d’audit contradictoire avant bascule sur les endpoints bancaires de production.',
      selfEvaluation: {
        autonomyScore: 4,
        technicalMasteryScore: 5,
        safetyComplianceScore: 4,
        learned: 'Compréhension approfondie des architectures orientées événements et de la cryptographie symétrique.',
        succeeded: 'Idempotence garantie sur 1 000 transactions concurrentes en test de charge.',
        difficultiesFaced: 'Gestion des timeouts intermittents sur l’API partenaire en mode simulation.',
        improvementsGoal: 'Ajouter la réconciliation comptable automatique quotidienne via export CSV/Excel.',
        studentComment: 'Brouillon en cours de finalisation avant soumission officielle.',
      },
      status: ReportStatus.DRAFT,
      currentRevision: 1,
      latestScoreOn20: null,
      createdAt: oneDayAgo,
      updatedAt: oneHourAgo,
      submittedAt: null,
      reviewedAt: null,
      validatedAt: null,
      archivedAt: null,
    },
  ];

  // ============================================================================
  // ÉTAPES CHRONOLOGIQUES DÉTAILLÉES (report_steps)
  // ============================================================================
  const report_steps: ReportStep[] = [
    // Étapes Rapport 1 (GL)
    {
      id: 'STEP-001',
      reportId: 'RPT-UUID-9a8f1b2c-0001',
      stepOrder: 1,
      phase: 'PREPARATION',
      title: 'Audit de l’environnement hôte et sauvegarde préalable',
      description: 'Vérification des ressources CPU/RAM/Disque et snapshot complet des volumes de données.',
      durationMinutes: 45,
      technicalNotes: 'Espace libre : 142 Go NVMe. Snapshot créé sous /backup/pre-deploy-20260928.tar.zst',
      observations: 'Aucun processus zombie détecté sur l’hôte.',
      completed: true,
      createdAt: fiveDaysAgo,
      updatedAt: fiveDaysAgo,
    },
    {
      id: 'STEP-002',
      reportId: 'RPT-UUID-9a8f1b2c-0001',
      stepOrder: 2,
      phase: 'EXECUTION',
      title: 'Configuration de l’orchestration Docker Compose & réseau isolé',
      description: 'Rédaction du fichier docker-compose.prod.yml avec réseau interne chiffré et secrets montés.',
      durationMinutes: 120,
      technicalNotes: 'Sous-réseau 172.28.0.0/24 dédié aux conteneurs backend et base de données.',
      observations: 'Montage en lecture seule des configurations statiques Nginx.',
      completed: true,
      createdAt: fiveDaysAgo,
      updatedAt: fiveDaysAgo,
    },
    {
      id: 'STEP-003',
      reportId: 'RPT-UUID-9a8f1b2c-0001',
      stepOrder: 3,
      phase: 'EXECUTION',
      title: 'Déploiement du pooler de connexions PgBouncer et réplication PostgreSQL',
      description: 'Paramétrage du mode Transaction Pooling pour encaisser les pics de trafic étudiants.',
      durationMinutes: 90,
      technicalNotes: 'Max client connections fixé à 250, pool size à 25 vers le serveur PostgreSQL.',
      observations: 'Consommation mémoire stabilisée à 180 Mo pour 500 connexions actives.',
      completed: true,
      createdAt: fiveDaysAgo,
      updatedAt: fiveDaysAgo,
    },
    {
      id: 'STEP-004',
      reportId: 'RPT-UUID-9a8f1b2c-0001',
      stepOrder: 4,
      phase: 'REMISE_EN_SERVICE',
      title: 'Tests de charge HTTP et validation des certificats TLS Let’s Encrypt',
      description: 'Exécution d’un benchmark k6 avec 500 utilisateurs virtuels et contrôle du grade SSL Labs (Note A+).',
      durationMinutes: 60,
      technicalNotes: 'Headers de sécurité HSTS, CSP et X-Frame-Options validés.',
      observations: 'Temps de réponse P95 sous 50ms.',
      completed: true,
      createdAt: fiveDaysAgo,
      updatedAt: fiveDaysAgo,
    },

    // Étapes Rapport 2 (RT)
    {
      id: 'STEP-005',
      reportId: 'RPT-UUID-7c4d2e9f-0002',
      stepOrder: 1,
      phase: 'DIAGNOSTIC',
      title: 'Capture et analyse des trames réseau Wireshark',
      description: 'Mise en miroir de port (SPAN) sur le commutateur de cœur SW-CORE-01 pour isoler la source du broadcast.',
      durationMinutes: 60,
      technicalNotes: 'Taux de trames ARP/Broadcast mesuré à 14 200 pps (anomalie critique).',
      observations: 'Adresse MAC source suspecte localisée sur le port GigabitEthernet 1/0/18.',
      completed: true,
      createdAt: fiveDaysAgo,
      updatedAt: fiveDaysAgo,
    },
    {
      id: 'STEP-006',
      reportId: 'RPT-UUID-7c4d2e9f-0002',
      stepOrder: 2,
      phase: 'EXECUTION',
      title: 'Segmentation VLAN 802.1Q et configuration Spanning-Tree Rapid-PVST+',
      description: 'Création du VLAN 10 (Admin), VLAN 20 (Pédagogie), VLAN 30 (Serveurs) et activation de BPDU Guard.',
      durationMinutes: 120,
      technicalNotes: 'Bridge Root configuré avec priorité 4096 sur SW-CORE-01.',
      observations: 'Le port incriminé a été automatiquement placé en état err-disable dès la détection de la boucle.',
      completed: true,
      createdAt: fiveDaysAgo,
      updatedAt: fiveDaysAgo,
    },
    {
      id: 'STEP-007',
      reportId: 'RPT-UUID-7c4d2e9f-0002',
      stepOrder: 3,
      phase: 'REMISE_EN_SERVICE',
      title: 'Vérification du routage inter-VLAN et ACL de sécurité',
      description: 'Test des tables de routage OSPF et application des listes de contrôle d’accès (ACL).',
      durationMinutes: 60,
      technicalNotes: 'Isolation stricte du VLAN Admin depuis le réseau WiFi étudiant.',
      observations: 'Ping inter-VLAN < 1 ms, sécurité validée.',
      completed: true,
      createdAt: fiveDaysAgo,
      updatedAt: fiveDaysAgo,
    },

    // Étapes Rapport 3 (EL)
    {
      id: 'STEP-008',
      reportId: 'RPT-UUID-3b5e8a1d-0003',
      stepOrder: 1,
      phase: 'PREPARATION',
      title: 'Consignation TGBT et mise en place de la sécurité en toiture',
      description: 'Arrêt du disjoncteur général, condamnation par cadenas LOTO et fixation des lignes de vie antichute.',
      durationMinutes: 60,
      technicalNotes: 'VAT effectuée au multimètre Fluke : 0.00 V AC entre phases et neutre.',
      observations: 'Zone balisée avec ruban de signalisation au sol.',
      completed: true,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
    {
      id: 'STEP-009',
      reportId: 'RPT-UUID-3b5e8a1d-0003',
      stepOrder: 2,
      phase: 'EXECUTION',
      title: 'Pose des 10 modules solaires 500Wc et câblage DC',
      description: 'Fixation des rails aluminium avec inclinaison 12° Sud, sertissage des connecteurs MC4 solaires 1000V.',
      durationMinutes: 240,
      technicalNotes: 'Tension circuit ouvert Voc mesurée : 492 V DC. Courant court-circuit Isc : 12.8 A.',
      observations: 'Continuité des masses métalliques vérifiée à 0.04 Ohm.',
      completed: true,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
    {
      id: 'STEP-010',
      reportId: 'RPT-UUID-3b5e8a1d-0003',
      stepOrder: 3,
      phase: 'REMISE_EN_SERVICE',
      title: 'Raccordement de l’onduleur Victron et mise en service banc Lithium',
      description: 'Connexion de la batterie 48V 100Ah Pylontech, paramétrage du régulateur MPPT 250/100.',
      durationMinutes: 120,
      technicalNotes: 'Communication BMS active sur port CAN. Tension batterie 53.2 V.',
      observations: 'Basculement sans coupure vérifié sur charge réelle 3.5 kW.',
      completed: true,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },

    // Étapes Rapport 4 (MI)
    {
      id: 'STEP-011',
      reportId: 'RPT-UUID-4d6f9c2e-0004',
      stepOrder: 1,
      phase: 'PREPARATION',
      title: 'Consignation pneumatique 6 bars et cadenassage LOTO',
      description: 'Fermeture de la vanne générale d’arrivée d’air comprimé et décompression du circuit avec manomètre à zéro.',
      durationMinutes: 30,
      technicalNotes: 'Pose de cales mécaniques de blocage sur le bras pivotant.',
      observations: 'Aucune pression résiduelle constatée.',
      completed: true,
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo,
    },
    {
      id: 'STEP-012',
      reportId: 'RPT-UUID-4d6f9c2e-0004',
      stepOrder: 2,
      phase: 'EXECUTION',
      title: 'Remplacement du distributeur 5/2 bistable et nettoyage du filtre FRL',
      description: 'Démontage de l’embase FESTO défectueuse, montage du composant neuf et remplacement de la cartouche filtrante 5µm.',
      durationMinutes: 90,
      technicalNotes: 'Couple de serrage des raccords instantanés pneumatiques respecté.',
      observations: 'Présence d’huile condensée sur l’ancien tiroir de distribution.',
      completed: true,
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo,
    },
    {
      id: 'STEP-013',
      reportId: 'RPT-UUID-4d6f9c2e-0004',
      stepOrder: 3,
      phase: 'REMISE_EN_SERVICE',
      title: 'Mise à jour du programme automate S7-1200 et essais en cadence',
      description: 'Modification de la temporisation de surveillance fin de course (T#1.5s) sous TIA Portal v18.',
      durationMinutes: 60,
      technicalNotes: 'Cycle automatique testé sur 100 pièces consécutives.',
      observations: 'Zéro défaut de prise de pièce enregistré.',
      completed: true,
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo,
    },

    // Étapes Rapport 5 (GL Mobile Money)
    {
      id: 'STEP-014',
      reportId: 'RPT-UUID-5e7a0d3f-0005',
      stepOrder: 1,
      phase: 'PREPARATION',
      title: 'Spécification de l’architecture cryptographique HMAC-SHA256',
      description: 'Définition des schémas d’échange sécurisés avec les API partenaires Orange Money & MTN MoMo.',
      durationMinutes: 60,
      technicalNotes: 'Génération de paires de clés et configuration des headers X-Signature et X-Timestamp.',
      observations: 'Fenêtre de validité des requêtes fixée à 300 secondes anti-rejeu.',
      completed: true,
      createdAt: oneDayAgo,
      updatedAt: oneDayAgo,
    },
    {
      id: 'STEP-015',
      reportId: 'RPT-UUID-5e7a0d3f-0005',
      stepOrder: 2,
      phase: 'EXECUTION',
      title: 'Développement du module d’encaissement et gestionnaire de webhooks',
      description: 'Implémentation des routes Node.js/TypeScript avec validation Zod et workers de file d’attente BullMQ.',
      durationMinutes: 180,
      technicalNotes: 'Transaction DB avec niveau d’isolation Serializable pour prévenir le double encaissement.',
      observations: 'Simulation de 500 paiements réussis sur sandbox.',
      completed: true,
      createdAt: oneDayAgo,
      updatedAt: oneHourAgo,
    },
  ];

  // ============================================================================
  // MATÉRIELS ET COMPOSANTS (report_materials)
  // ============================================================================
  const report_materials: ReportMaterial[] = [
    {
      id: 'MAT-001',
      reportId: 'RPT-UUID-9a8f1b2c-0001',
      name: 'Serveur Rack Dell PowerEdge R650',
      reference: 'SRV-R650-ITMC-02',
      category: 'Infrastructure Serveur',
      quantity: 1,
      unit: 'unité',
      specification: 'Dual Xeon Silver 4314, 64 Go RAM ECC, RAID 10 NVMe',
      notes: 'Hôte de production virtualisé',
      createdAt: fiveDaysAgo,
    },
    {
      id: 'MAT-002',
      reportId: 'RPT-UUID-7c4d2e9f-0002',
      name: 'Commutateur Cisco Catalyst 3850 Layer 3',
      reference: 'WS-C3850-24T-L',
      category: 'Équipement Réseau Actif',
      quantity: 2,
      unit: 'unités',
      specification: '24 ports Gigabit Ethernet + 4x 10G SFP+ Uplinks, IP Base',
      notes: 'Cœur et distribution réseau',
      createdAt: fiveDaysAgo,
    },
    {
      id: 'MAT-003',
      reportId: 'RPT-UUID-3b5e8a1d-0003',
      name: 'Panneaux Solaires Monocristallins Jinko Solar 500Wc',
      reference: 'JKM500M-72HL4-V',
      category: 'Énergie Solaire PV',
      quantity: 10,
      unit: 'modules',
      specification: 'Cellules Half-cut PERC, Rendement 21.3%, Cadre alu anodisé 35mm',
      notes: 'Puissance totale crête installée : 5.0 kWc',
      createdAt: twoDaysAgo,
    },
    {
      id: 'MAT-004',
      reportId: 'RPT-UUID-3b5e8a1d-0003',
      name: 'Onduleur Hybride Chargeur Victron MultiPlus-II 48V/5000VA',
      reference: 'PMP482505010',
      category: 'Conversion Énergie',
      quantity: 1,
      unit: 'unité',
      specification: 'Pur sinus, Chargeur 70A, Temps de transfert UPS < 20ms',
      notes: 'Alimentation secourue TGBT',
      createdAt: twoDaysAgo,
    },
    {
      id: 'MAT-005',
      reportId: 'RPT-UUID-4d6f9c2e-0004',
      name: 'Distributeur Pneumatique 5/2 Bistable FESTO',
      reference: 'CPE14-M1BH-5J-1/8',
      category: 'Pneumatique Industrielle',
      quantity: 1,
      unit: 'pièce',
      specification: 'Bobines 24V DC, Débit nominal 900 l/min, Pression 2.5 - 8 bars',
      notes: 'Composant neuf certifié',
      createdAt: threeDaysAgo,
    },
  ];

  // ============================================================================
  // OUTILLAGE ET ÉQUIPEMENTS (report_tools)
  // ============================================================================
  const report_tools: ReportTool[] = [
    {
      id: 'TOOL-001',
      reportId: 'RPT-UUID-9a8f1b2c-0001',
      name: 'Docker CE 27.1 & Docker Compose v2.29',
      category: 'LOGICIEL_DIAGNOSTIC',
      serialOrRef: 'DOCKER-LTS-2026',
      calibrationStatus: 'À jour LTS',
      usageNotes: 'Orchestration et isolation réseau',
      createdAt: fiveDaysAgo,
    },
    {
      id: 'TOOL-002',
      reportId: 'RPT-UUID-7c4d2e9f-0002',
      name: 'Analyseur de Protocoles Wireshark v4.2 & Câble Console RJ45/USB',
      category: 'LOGICIEL_DIAGNOSTIC',
      serialOrRef: 'CAB-CONSOLE-FTDI-01',
      calibrationStatus: 'Conforme',
      usageNotes: 'Capture des trames et configuration série Cisco',
      createdAt: fiveDaysAgo,
    },
    {
      id: 'TOOL-003',
      reportId: 'RPT-UUID-3b5e8a1d-0003',
      name: 'Contrôleur d’Installation Solaire & Mégohmmètre Chauvin Arnoux CA 6117',
      category: 'MESURE',
      serialOrRef: 'CA-6117-CAL-2026-04',
      calibrationStatus: 'Étalonné le 15/04/2026',
      usageNotes: 'Mesure de résistance de terre, test d’isolement 1000V et Voc/Isc',
      createdAt: twoDaysAgo,
    },
    {
      id: 'TOOL-004',
      reportId: 'RPT-UUID-4d6f9c2e-0004',
      name: 'Console de Programmation Automate Siemens Field PG M6 avec TIA Portal v18',
      category: 'LOGICIEL_DIAGNOSTIC',
      serialOrRef: 'SIEMENS-PG-M6-08',
      calibrationStatus: 'Licence Campus Active',
      usageNotes: 'Diagnostic en ligne PLC et ajustement des blocs de fonction',
      createdAt: threeDaysAgo,
    },
  ];

  // ============================================================================
  // DIFFICULTÉS ET SOLUTIONS (report_difficulties)
  // ============================================================================
  const report_difficulties: ReportDifficulty[] = [
    {
      id: 'DIFF-001',
      reportId: 'RPT-UUID-9a8f1b2c-0001',
      problemEncountered: 'Conflit de permissions UID/GID sur le volume persistant PostgreSQL au démarrage du conteneur.',
      rootCause: 'Le dossier hôte appartenait à root:root (0:0) alors que le conteneur tournait sous l’utilisateur non-root postgres (999:999).',
      solutionApplied: 'Mise en place d’un init-container d’ajustement des ACL POSIX et durcissement des volumes montés.',
      severity: 'MEDIUM',
      resolved: true,
      timeLostMinutes: 25,
      createdAt: fiveDaysAgo,
    },
    {
      id: 'DIFF-002',
      reportId: 'RPT-UUID-7c4d2e9f-0002',
      problemEncountered: 'Boucle physique de commutation causant un effondrement complet du débit réseau.',
      rootCause: 'Un commutateur 8 ports non managé avait été raccordé en boucle sur deux prises murales en salle TP Informatique.',
      solutionApplied: 'Activation immédiate de Spanning-Tree BPDU Guard sur l’ensemble des ports Edge d’accès utilisateurs.',
      severity: 'CRITICAL',
      resolved: true,
      timeLostMinutes: 40,
      createdAt: fiveDaysAgo,
    },
    {
      id: 'DIFF-003',
      reportId: 'RPT-UUID-3b5e8a1d-0003',
      problemEncountered: 'Échauffement anormal constaté sur le bornier DC d’entrée du régulateur MPPT.',
      rootCause: 'Couple de serrage insuffisant de la vis de serrage (1.2 Nm au lieu des 2.5 Nm préconisés par le constructeur).',
      solutionApplied: 'Resserrage systématique au tournevis dynamométrique isolé 1000V à 2.5 Nm et contrôle thermographique infrarouge.',
      severity: 'HIGH',
      resolved: true,
      timeLostMinutes: 30,
      createdAt: twoDaysAgo,
    },
    {
      id: 'DIFF-004',
      reportId: 'RPT-UUID-4d6f9c2e-0004',
      problemEncountered: 'Le vérin rotatif s’arrêtait à mi-course sans déclencher le capteur de confirmation fin de mouvement.',
      rootCause: 'Forte chute de pression dynamique (3.2 bars au lieu de 6 bars) causée par l’encrassement du filtre du groupe de conditionnement FRL.',
      solutionApplied: 'Remplacement de la cartouche filtrante 5µm et purge manuelle des condensats du réservoir tampon.',
      severity: 'MEDIUM',
      resolved: true,
      timeLostMinutes: 35,
      createdAt: threeDaysAgo,
    },
  ];

  // ============================================================================
  // TABLEAU DE TESTS ET CONTRÔLES (report_tests)
  // ============================================================================
  const report_tests: ReportTest[] = [
    {
      id: 'TEST-001',
      reportId: 'RPT-UUID-9a8f1b2c-0001',
      testName: 'Temps de réponse de l’endpoint /api/health sous charge (500 VU)',
      parameterMeasured: 'Latence P95 HTTP',
      expectedValue: '< 100',
      measuredValue: '48',
      unit: 'ms',
      result: 'CONFORME',
      observations: 'Aucune erreur 5xx enregistrée sur un banc de 30 000 requêtes.',
      createdAt: fiveDaysAgo,
    },
    {
      id: 'TEST-002',
      reportId: 'RPT-UUID-7c4d2e9f-0002',
      testName: 'Débit utile et taux de perte de paquets inter-VLAN (Iperf3)',
      parameterMeasured: 'Bande passante TCP / Perte UDP',
      expectedValue: '> 900 Mbps / 0%',
      measuredValue: '942 Mbps / 0.00%',
      unit: 'Mbps',
      result: 'CONFORME',
      observations: 'Stabilité absolue et conformité avec la politique QoS.',
      createdAt: fiveDaysAgo,
    },
    {
      id: 'TEST-003',
      reportId: 'RPT-UUID-3b5e8a1d-0003',
      testName: 'Résistance de la prise de terre du champ solaire photovoltaïque',
      parameterMeasured: 'Résistance ohmique terre',
      expectedValue: '< 10.0',
      measuredValue: '4.2',
      unit: 'Ohms',
      result: 'CONFORME',
      observations: 'Mesure effectuée selon la méthode des 3 piquets (62%).',
      createdAt: twoDaysAgo,
    },
    {
      id: 'TEST-004',
      reportId: 'RPT-UUID-3b5e8a1d-0003',
      testName: 'Test d’isolement diélectrique des conducteurs DC sous 1000V DC',
      parameterMeasured: 'Résistance d’isolement',
      expectedValue: '> 5.0',
      measuredValue: '78.4',
      unit: 'MOhms',
      result: 'CONFORME',
      observations: 'Excellent niveau d’isolement entre conducteurs actifs et terre.',
      createdAt: twoDaysAgo,
    },
    {
      id: 'TEST-005',
      reportId: 'RPT-UUID-4d6f9c2e-0004',
      testName: 'Temps de cycle complet de transfert pneumatique pièce finie',
      parameterMeasured: 'Durée du cycle automate',
      expectedValue: '< 1.8',
      measuredValue: '1.42',
      unit: 'secondes',
      result: 'CONFORME',
      observations: 'Gain de productivité de 12% par rapport au nominal initial.',
      createdAt: threeDaysAgo,
    },
  ];

  // ============================================================================
  // COMPÉTENCES MOBILISÉES (report_competencies)
  // ============================================================================
  const report_competencies: ReportCompetency[] = [
    {
      id: 'COMP-001',
      reportId: 'RPT-UUID-9a8f1b2c-0001',
      code: 'GL-DEVOPS-01',
      label: 'Déployer et sécuriser une architecture micro-services conteneurisée',
      domain: 'Architecture & DevOps',
      selfLevel: 'ACQUIS',
      teacherLevel: null,
      teacherComment: '',
      createdAt: fiveDaysAgo,
    },
    {
      id: 'COMP-002',
      reportId: 'RPT-UUID-7c4d2e9f-0002',
      code: 'RT-SWITCH-02',
      label: 'Configurer la commutation L2/L3, les VLAN 802.1Q et la sécurité Spanning-Tree',
      domain: 'Commutation & Routage',
      selfLevel: 'EXPERT',
      teacherLevel: 'EXPERT',
      teacherComment: 'Démonstration irréprochable de la maîtrise des protocoles Cisco.',
      createdAt: fiveDaysAgo,
    },
    {
      id: 'COMP-003',
      reportId: 'RPT-UUID-3b5e8a1d-0003',
      code: 'EL-PHOTOV-01',
      label: 'Dimensionner, raccorder et mettre en service une centrale solaire hybride avec stockage',
      domain: 'Énergies Renouvelables',
      selfLevel: 'ACQUIS',
      teacherLevel: null,
      teacherComment: '',
      createdAt: twoDaysAgo,
    },
    {
      id: 'COMP-004',
      reportId: 'RPT-UUID-4d6f9c2e-0004',
      code: 'MI-PNEUM-03',
      label: 'Diagnostiquer et dépanner une chaîne d’actionneurs pneumatiques et automates programmables',
      domain: 'Maintenance & Automatisme',
      selfLevel: 'ACQUIS',
      teacherLevel: null,
      teacherComment: '',
      createdAt: threeDaysAgo,
    },
  ];

  // ============================================================================
  // ÉVALUATIONS ENSEIGNANT (report_evaluations)
  // ============================================================================
  const report_evaluations: ReportEvaluation[] = [
    {
      id: 'EVAL-001',
      reportId: 'RPT-UUID-7c4d2e9f-0002',
      revisionNumber: 1,
      teacherId: 'TCH-002',
      teacherName: 'Ing. Samuel Eboué',
      decision: ReportStatus.APPROVED,
      scoreOn20: 17.5,
      technicalScoreOn20: 18,
      methodScoreOn20: 17,
      safetyScoreOn20: 18,
      redactionScoreOn20: 17,
      generalFeedback:
        'Remarquable rapport d’intervention technique. La démarche d’isolation de la boucle Spanning-Tree, l’analyse des trames Wireshark et la configuration du routage inter-VLAN sont parfaitement documentées et conformes aux standards professionnels.',
      strengths: 'Précision chirurgicale des mesures, respect strict des procédures de sauvegarde TFTP, clarté exemplaire du compte-rendu.',
      improvementsRequired: 'Poursuivre la veille sur les protocoles d’authentification 802.1X.',
      annotatedSections: [
        { section: 'Sécurité & ESD', comment: 'Excellent port du bracelet antistatique et repérage optique.', severity: 'INFO' },
        { section: 'Tableau de Tests', comment: 'Mesures Iperf3 complètes et cohérentes.', severity: 'INFO' },
      ],
      evaluatedAt: now,
    },
  ];

  // ============================================================================
  // ÉVÉNEMENTS D'AUDIT (report_events)
  // ============================================================================
  const report_events: ReportEvent[] = [
    {
      id: 'EVT-001',
      reportId: 'RPT-UUID-9a8f1b2c-0001',
      actorId: 'std_101',
      actorName: 'Arthur Ngassa',
      actorRole: 'student',
      actorIp: '127.0.0.1',
      action: 'REPORT_CREATED',
      fromStatus: null,
      toStatus: ReportStatus.DRAFT,
      details: 'Création initiale du rapport RPT-2026-GL-0001.',
      timestamp: fiveDaysAgo,
    },
    {
      id: 'EVT-002',
      reportId: 'RPT-UUID-9a8f1b2c-0001',
      actorId: 'std_101',
      actorName: 'Arthur Ngassa',
      actorRole: 'student',
      actorIp: '127.0.0.1',
      action: 'REPORT_SUBMITTED',
      fromStatus: ReportStatus.DRAFT,
      toStatus: ReportStatus.SUBMITTED,
      details: 'Soumission officielle du rapport (Révision #1) à Dr. Jean-Paul Kamga.',
      timestamp: twoDaysAgo,
    },
    {
      id: 'EVT-003',
      reportId: 'RPT-UUID-7c4d2e9f-0002',
      actorId: 'std_102',
      actorName: 'Bérénice Tchoumi',
      actorRole: 'student',
      actorIp: '127.0.0.1',
      action: 'REPORT_SUBMITTED',
      fromStatus: ReportStatus.DRAFT,
      toStatus: ReportStatus.SUBMITTED,
      details: 'Soumission du rapport RPT-2026-RT-0001.',
      timestamp: twoDaysAgo,
    },
    {
      id: 'EVT-004',
      reportId: 'RPT-UUID-7c4d2e9f-0002',
      actorId: 'TCH-002',
      actorName: 'Ing. Samuel Eboué',
      actorRole: 'teacher',
      actorIp: '127.0.0.1',
      action: 'REPORT_APPROVED',
      fromStatus: ReportStatus.SUBMITTED,
      toStatus: ReportStatus.APPROVED,
      details: 'Validation finale avec note officielle de 17.5 / 20 attribuée.',
      timestamp: now,
    },
    {
      id: 'EVT-005',
      reportId: 'RPT-UUID-4d6f9c2e-0004',
      actorId: 'TCH-004',
      actorName: 'Mme Claire Bikoue',
      actorRole: 'teacher',
      actorIp: '127.0.0.1',
      action: 'CHANGES_REQUESTED',
      fromStatus: ReportStatus.SUBMITTED,
      toStatus: ReportStatus.CHANGES_REQUESTED,
      details: 'Demande de modifications : Veuillez ajouter les photos des électrovannes et préciser la pression du FRL.',
      timestamp: oneDayAgo,
    },
  ];

  return {
    schemaVersion: 1,
    lastSequenceByYearAndSpec: {
      '2026-GL': 2,
      '2026-RT': 1,
      '2026-EL': 1,
      '2026-MI': 1,
    },
    reports,
    report_steps,
    report_materials,
    report_tools,
    report_difficulties,
    report_tests,
    report_competencies,
    report_attachments: [],
    report_evaluations,
    report_events,
    report_revisions: [],
  };
}

let cachedDatabase: InterventionReportsDatabaseSchema | null = null;

export function loadInterventionReportsDb(): InterventionReportsDatabaseSchema {
  ensurePrivateStorageDirectory();
  if (cachedDatabase) {
    return cachedDatabase;
  }

  const seed = createInitialDatabaseSeed();

  if (!fs.existsSync(DB_FILE_PATH)) {
    saveInterventionReportsDb(seed);
    cachedDatabase = seed;
    return seed;
  }

  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<InterventionReportsDatabaseSchema>;
    
    // Si la DB sur disque contient moins de 5 rapports, la rafraîchir avec les 5 rapports complets
    if (!parsed.reports || parsed.reports.length < 5) {
      saveInterventionReportsDb(seed);
      cachedDatabase = seed;
      return seed;
    }

    cachedDatabase = {
      schemaVersion: parsed.schemaVersion || 1,
      lastSequenceByYearAndSpec: parsed.lastSequenceByYearAndSpec || seed.lastSequenceByYearAndSpec,
      reports: Array.isArray(parsed.reports) ? parsed.reports : seed.reports,
      report_steps: Array.isArray(parsed.report_steps) ? parsed.report_steps : seed.report_steps,
      report_materials: Array.isArray(parsed.report_materials) ? parsed.report_materials : seed.report_materials,
      report_tools: Array.isArray(parsed.report_tools) ? parsed.report_tools : seed.report_tools,
      report_difficulties: Array.isArray(parsed.report_difficulties)
        ? parsed.report_difficulties
        : seed.report_difficulties,
      report_tests: Array.isArray(parsed.report_tests) ? parsed.report_tests : seed.report_tests,
      report_competencies: Array.isArray(parsed.report_competencies)
        ? parsed.report_competencies
        : seed.report_competencies,
      report_attachments: Array.isArray(parsed.report_attachments) ? parsed.report_attachments : [],
      report_evaluations: Array.isArray(parsed.report_evaluations)
        ? parsed.report_evaluations
        : seed.report_evaluations,
      report_events: Array.isArray(parsed.report_events) ? parsed.report_events : seed.report_events,
      report_revisions: Array.isArray(parsed.report_revisions) ? parsed.report_revisions : [],
    };
    return cachedDatabase;
  } catch (err) {
    console.error('[INTERVENTION-REPORTS] Erreur de lecture DB, restauration du schéma initial :', err);
    saveInterventionReportsDb(seed);
    cachedDatabase = seed;
    return seed;
  }
}

export function saveInterventionReportsDb(db: InterventionReportsDatabaseSchema): void {
  ensurePrivateStorageDirectory();
  cachedDatabase = db;
  const tempFile = `${DB_FILE_PATH}.tmp.${process.pid}`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE_PATH);
}

export function generateNextReportNumber(
  db: InterventionReportsDatabaseSchema,
  academicYear: string,
  specialtyCode: string
): string {
  const yearPrefix = (academicYear || '2026').slice(0, 4).replace(/[^0-9]/g, '') || '2026';
  const cleanSpec = (specialtyCode || 'GEN')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4) || 'GEN';
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
    throw new Error('Violation de sécurité : tentative de traversée de répertoire détectée.');
  }

  if (!fs.existsSync(reportFolder)) {
    fs.mkdirSync(reportFolder, { recursive: true });
  }

  const fullFilePath = path.resolve(reportFolder, safeFileName);
  if (!fullFilePath.startsWith(reportFolder)) {
    throw new Error('Violation de sécurité : chemin de fichier invalide.');
  }

  fs.writeFileSync(fullFilePath, params.buffer);
  return path.relative(PRIVATE_STORAGE_ROOT, fullFilePath);
}

export function readPrivateAttachmentFile(storageRelativePath: string): Buffer | null {
  ensurePrivateStorageDirectory();
  const normalizedRel = storageRelativePath.replace(/^(\.\.(\/|\\|$))+/, '');
  const fullFilePath = path.resolve(PRIVATE_STORAGE_ROOT, normalizedRel);

  if (!fullFilePath.startsWith(PRIVATE_STORAGE_ROOT)) {
    console.error('[INTERVENTION-REPORTS] Tentative d’accès hors racine de stockage :', storageRelativePath);
    return null;
  }

  if (!fs.existsSync(fullFilePath)) {
    return null;
  }

  try {
    return fs.readFileSync(fullFilePath);
  } catch (err) {
    console.error('[INTERVENTION-REPORTS] Erreur de lecture binaire :', err);
    return null;
  }
}

export function deletePrivateAttachmentFile(storageRelativePath: string): boolean {
  ensurePrivateStorageDirectory();
  const normalizedRel = storageRelativePath.replace(/^(\.\.(\/|\\|$))+/, '');
  const fullFilePath = path.resolve(PRIVATE_STORAGE_ROOT, normalizedRel);

  if (!fullFilePath.startsWith(PRIVATE_STORAGE_ROOT)) {
    console.error('[INTERVENTION-REPORTS] Tentative de suppression hors racine de stockage :', storageRelativePath);
    return false;
  }

  if (fs.existsSync(fullFilePath)) {
    try {
      fs.unlinkSync(fullFilePath);
      return true;
    } catch (err) {
      console.error('[INTERVENTION-REPORTS] Erreur de suppression binaire :', err);
      return false;
    }
  }
  return true;
}
