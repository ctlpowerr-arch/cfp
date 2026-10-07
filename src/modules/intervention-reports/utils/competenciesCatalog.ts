/**
 * Référentiel des compétences professionnelles par filière et spécialité du CFP-ITMC
 */

export interface DomainCompetencyTemplate {
  code: string;
  label: string;
  domain: string;
}

export const SPECIALTY_COMPETENCIES_CATALOG: Record<string, DomainCompetencyTemplate[]> = {
  'genie-logiciel': [
    { code: 'GL-ARCH-01', label: 'Concevoir l’architecture logicielle et les schémas de données', domain: 'Architecture Logicielle' },
    { code: 'GL-DEV-02', label: 'Développer des composants backend et APIs sécurisées RESTful', domain: 'Développement Backend' },
    { code: 'GL-DEV-03', label: 'Développer des interfaces utilisateur réactives et responsives', domain: 'Développement Frontend' },
    { code: 'GL-OPS-04', label: 'Conteneuriser, déployer et administrer les services via Docker/CI-CD', domain: 'DevOps & Déploiement' },
    { code: 'GL-TEST-05', label: 'Écrire et exécuter les plans de tests unitaires, d’intégration et de charge', domain: 'Qualité & Recette' },
    { code: 'GL-SEC-06', label: 'Auditer le code contre les failles OWASP Top 10 (Anti-IDOR, XSS, CSRF)', domain: 'Cybersécurité Applicative' },
    { code: 'GL-DATA-07', label: 'Optimiser les requêtes SQL, transactions et index PostgreSQL', domain: 'Bases de Données' },
  ],
  'reseaux-et-telecoms': [
    { code: 'RT-LAN-01', label: 'Configurer les VLANs 802.1Q, Trunking, et Spanning-Tree Rapid-PVST+', domain: 'Commutation Réseau' },
    { code: 'RT-WAN-02', label: 'Mettre en œuvre le routage dynamique OSPF, BGP et routes statiques', domain: 'Routage & WAN' },
    { code: 'RT-CAB-03', label: 'Câbler, brasser et certifier les liaisons cuivre Cat6A et fibre optique', domain: 'Infrastructure Physique' },
    { code: 'RT-SEC-04', label: 'Configurer les pare-feux, listes de contrôle d’accès (ACL) et VPN IPsec', domain: 'Sécurité Réseau' },
    { code: 'RT-WIFI-05', label: 'Déployer et calibrer une infrastructure Wi-Fi d’entreprise avec contrôleur', domain: 'Réseaux Sans Fil' },
    { code: 'RT-DIAG-06', label: 'Diagnostiquer les pannes réseau à l’analyseur Wireshark et réflectomètre', domain: 'Dépannage & Diagnostic' },
  ],
  'cyber-securite': [
    { code: 'CS-AUDIT-01', label: 'Réaliser un audit de vulnérabilité système et réseau avec Nmap/OpenVAS', domain: 'Audit & Vulnérabilités' },
    { code: 'CS-HARD-02', label: 'Durcir les configurations serveurs Linux/Windows et bastions', domain: 'Durcissement Système' },
    { code: 'CS-SOC-03', label: 'Analyser les logs d’accès et identifier les tentatives d’intrusion', domain: 'Surveillance & SOC' },
    { code: 'CS-CRYPTO-04', label: 'Déployer une autorité de certification PKI et chiffrer les flux TLS 1.3', domain: 'Cryptographie & TLS' },
    { code: 'CS-INC-05', label: 'Appliquer le protocole de réponse à incident et confinement de menace', domain: 'Gestion des Incidents' },
  ],
  'ia-et-big-data': [
    { code: 'IA-DATA-01', label: 'Nettoyer, normaliser et structurer des flux massifs de données', domain: 'Ingénierie des Données' },
    { code: 'IA-ML-02', label: 'Entraîner et évaluer des modèles prédictifs de Machine Learning', domain: 'Modélisation IA' },
    { code: 'IA-PROMPT-03', label: 'Intégrer des APIs de modèles de langage (LLM/GenAI) en environnement serveur', domain: 'IA Générative' },
    { code: 'IA-PIPE-04', label: 'Mettre en place des pipelines ETL et tableaux de bord décisionnels', domain: 'Business Intelligence' },
  ],
  'electrotechnique': [
    { code: 'ELT-CONSIG-01', label: 'Effectuer la consignation électrique et la Vérification d’Absence de Tension (VAT)', domain: 'Sécurité & Habilitation' },
    { code: 'ELT-CAB-02', label: 'Câbler des armoires de distribution BT, disjoncteurs et contacteurs', domain: 'Câblage & Tableauterie' },
    { code: 'ELT-MOT-03', label: 'Raccorder, paramétrer et démarrer des moteurs triphasés et variateurs', domain: 'Machines Tournantes' },
    { code: 'ELT-DIAG-04', label: 'Localiser un défaut d’isolement, court-circuit ou déséquilibre de phase', domain: 'Dépannage & Mesures' },
    { code: 'ELT-PLAN-05', label: 'Lire et concevoir des schémas unifilaires et multifilaires industriels', domain: 'Schémas Électriques' },
  ],
  'maintenance-industrielle': [
    { code: 'MIN-PREV-01', label: 'Exécuter les gammes de maintenance préventive systématique et conditionnelle', domain: 'Maintenance Préventive' },
    { code: 'MIN-MEC-02', label: 'Démonter, contrôler, ligner et remonter des organes mécaniques et roulements', domain: 'Mécanique Industrielle' },
    { code: 'MIN-PNEU-03', label: 'Diagnostiquer et dépanner des circuits hydrauliques et pneumatiques', domain: 'Fluides Industriels' },
    { code: 'MIN-AUTO-04', label: 'Intervenir sur des automates programmables industriels (API / PLC)', domain: 'Automatisme' },
    { code: 'MIN-RAP-05', label: 'Rédiger une GMAO et consigner les indicateurs MTBF / MTTR', domain: 'Gestion de Maintenance' },
  ],
  'froid-et-climatisation': [
    { code: 'FCL-FLUID-01', label: 'Récupérer, manipuler et charger les fluides frigorigènes en toute sécurité', domain: 'Fluides Frigorigènes' },
    { code: 'FCL-SPLIT-02', label: 'Installer, raccorder et mettre sous pression d’azote des climatiseurs split/VRV', domain: 'Installation Climatisation' },
    { code: 'FCL-DIAG-03', label: 'Rechercher les fuites, mesurer les surchauffes et sous-refroidissements', domain: 'Diagnostic Thermique' },
    { code: 'FCL-ELEC-04', label: 'Dépanner la régulation électrique et les compresseurs frigorifiques', domain: 'Électromécanique Froid' },
  ],
  'maconnerie-gros-oeuvre': [
    { code: 'MAC-IMPL-01', label: 'Effectuer l’implantation d’un ouvrage et le nivellement au niveau optique', domain: 'Topographie & Nivellement' },
    { code: 'MAC-COFFR-02', label: 'Poser les coffrages, armatures ferraillées et couler le béton', domain: 'Béton Armé & Coffrage' },
    { code: 'MAC-ELEV-03', label: 'Monter des murs en agglomérés, briques ou blocs selon les aplombs', domain: 'Élévation Maçonnerie' },
    { code: 'MAC-SECU-04', label: 'Installer les échafaudages conformes et sécuriser les abords du chantier', domain: 'Sécurité Chantier' },
  ],
  'plomberie': [
    { code: 'PLM-TUBE-01', label: 'Façonner, cintrer et souder des tubes cuivre, PER et multicouche', domain: 'Tuyauterie & Raccords' },
    { code: 'PLM-SANI-02', label: 'Poser et raccorder les appareils sanitaires et colonnes d’évacuation', domain: 'Installations Sanitaires' },
    { code: 'PLM-TEST-03', label: 'Effectuer les épreuves hydrauliques de mise en pression et étanchéité', domain: 'Essais & Recette' },
  ],
  'default': [
    { code: 'GEN-DIAG-01', label: 'Poser un diagnostic méthodique et identifier la cause racine du problème', domain: 'Diagnostic Général' },
    { code: 'GEN-PROC-02', label: 'Appliquer rigoureusement la procédure technique et les normes du métier', domain: 'Exécution Technique' },
    { code: 'GEN-SECU-03', label: 'Respecter les consignes de sécurité, EPI et propreté du poste de travail', domain: 'Hygiène & Sécurité' },
    { code: 'GEN-TEST-04', label: 'Effectuer les vérifications, tests fonctionnels et recette finale', domain: 'Contrôle Qualité' },
    { code: 'GEN-DOC-05', label: 'Rédiger un compte-rendu technique clair, précis et professionnel', domain: 'Communication Technique' },
  ],
};

export function getCompetenciesForSpecialty(specialtyIdOrName?: string): DomainCompetencyTemplate[] {
  if (!specialtyIdOrName) return SPECIALTY_COMPETENCIES_CATALOG.default;
  const clean = specialtyIdOrName.toLowerCase().trim();

  for (const [key, list] of Object.entries(SPECIALTY_COMPETENCIES_CATALOG)) {
    if (clean.includes(key) || key.includes(clean)) {
      return [...list, ...SPECIALTY_COMPETENCIES_CATALOG.default];
    }
  }

  // Synonymes courants
  if (clean.includes('logiciel') || clean.includes('dev') || clean.includes('info')) {
    return [...SPECIALTY_COMPETENCIES_CATALOG['genie-logiciel'], ...SPECIALTY_COMPETENCIES_CATALOG.default];
  }
  if (clean.includes('reseau') || clean.includes('telecom')) {
    return [...SPECIALTY_COMPETENCIES_CATALOG['reseaux-et-telecoms'], ...SPECIALTY_COMPETENCIES_CATALOG.default];
  }
  if (clean.includes('securite') || clean.includes('cyber')) {
    return [...SPECIALTY_COMPETENCIES_CATALOG['cyber-securite'], ...SPECIALTY_COMPETENCIES_CATALOG.default];
  }
  if (clean.includes('electr')) {
    return [...SPECIALTY_COMPETENCIES_CATALOG['electrotechnique'], ...SPECIALTY_COMPETENCIES_CATALOG.default];
  }
  if (clean.includes('froid') || clean.includes('clim')) {
    return [...SPECIALTY_COMPETENCIES_CATALOG['froid-et-climatisation'], ...SPECIALTY_COMPETENCIES_CATALOG.default];
  }
  if (clean.includes('maint')) {
    return [...SPECIALTY_COMPETENCIES_CATALOG['maintenance-industrielle'], ...SPECIALTY_COMPETENCIES_CATALOG.default];
  }
  if (clean.includes('btp') || clean.includes('macon') || clean.includes('batiment')) {
    return [...SPECIALTY_COMPETENCIES_CATALOG['maconnerie-gros-oeuvre'], ...SPECIALTY_COMPETENCIES_CATALOG.default];
  }

  return SPECIALTY_COMPETENCIES_CATALOG.default;
}
