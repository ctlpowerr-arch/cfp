import {
  ReportField,
  ReportSection,
  ReportTemplate,
  SpecialtyCategory,
} from '../types/professionalReport.types';

/**
 * ============================================================================
 * CATALOGUE DES 35 MODÈLES ADAPTATIFS DE RAPPORTS PROFESSIONNELS
 * ============================================================================
 * Chaque modèle définit dynamiquement :
 * - Sections & champs spécialisés
 * - Unités de mesure, options, règles de validation
 * - Grille d'évaluation sommative /20
 * - Référentiel de compétences pédagogiques
 */

export interface SpecialtyDefinition {
  id: string;
  code: string;
  name: string;
  category: SpecialtyCategory;
  order: number;
  icon: string;
  description: string;
}

export const OFFICIAL_SPECIALTIES_LIST: SpecialtyDefinition[] = [
  // --------------------------------------------------------------------------
  // CATÉGORIE 1 — BÂTIMENT, CONSTRUCTION & TRAVAUX (10)
  // --------------------------------------------------------------------------
  {
    id: 'plomberie',
    code: 'PLOMB',
    name: 'Plomberie',
    category: 'BATIMENT_CONSTRUCTION',
    order: 1,
    icon: '🔧',
    description: 'Installation sanitaire, réseaux hydrauliques, évacuation et dépannage fuites.',
  },
  {
    id: 'maconnerie-gros-oeuvre',
    code: 'MACO',
    name: 'Maçonnerie Gros Œuvre',
    category: 'BATIMENT_CONSTRUCTION',
    order: 2,
    icon: '🧱',
    description: 'Fondations, élévation de murs, dosage béton, coffrage et ferraillage.',
  },
  {
    id: 'carrelage-batiment',
    code: 'CARREL',
    name: 'Carrelage / Bâtiment',
    category: 'BATIMENT_CONSTRUCTION',
    order: 3,
    icon: '📐',
    description: 'Calepinage, préparation des supports, pose de revêtements et jointoiement.',
  },
  {
    id: 'etancheite',
    code: 'ETANCH',
    name: 'Étanchéité',
    category: 'BATIMENT_CONSTRUCTION',
    order: 4,
    icon: '🛡️',
    description: 'Traitement des infiltrations, membranes bitumineuses et résines d’étanchéité.',
  },
  {
    id: 'metallerie-soudure-tuyauterie',
    code: 'SOUD',
    name: 'Métallerie-Soudure-Tuyauterie',
    category: 'BATIMENT_CONSTRUCTION',
    order: 5,
    icon: '🔥',
    description: 'Soudage TIG/MIG/Arc, découpe thermique, assemblage acier et tuyauterie industrielle.',
  },
  {
    id: 'peinture-batiment',
    code: 'PEINT',
    name: 'Peinture Bâtiment',
    category: 'BATIMENT_CONSTRUCTION',
    order: 6,
    icon: '🎨',
    description: 'Préparation des fonds, enduits, application monocouche/bicouche et finitions décoratives.',
  },
  {
    id: 'vitrerie-aluminium',
    code: 'VITRE',
    name: 'Vitrerie Aluminium',
    category: 'BATIMENT_CONSTRUCTION',
    order: 7,
    icon: '🪟',
    description: 'Menuiserie aluminium, découpe et pose de vitrages simples et feuilletés.',
  },
  {
    id: 'coffreur-ferrailleur',
    code: 'COFF',
    name: 'Coffreur / Ferrailleur',
    category: 'BATIMENT_CONSTRUCTION',
    order: 8,
    icon: '🏗️',
    description: 'Ouvrages d’art béton armé, armatures acier HA, étayage et coulage.',
  },
  {
    id: 'poseur-de-paves',
    code: 'PAVE',
    name: 'Poseur de Pavés',
    category: 'BATIMENT_CONSTRUCTION',
    order: 9,
    icon: '🛤️',
    description: 'Terrassement, nivellement, lit de sable, pose autobloquants et compactage vibrant.',
  },
  {
    id: 'staff-et-decoration',
    code: 'STAFF',
    name: 'Staff et Décoration',
    category: 'BATIMENT_CONSTRUCTION',
    order: 10,
    icon: '🏛️',
    description: 'Moulage en plâtre et filasse, corniches, rosaces et faux plafonds décoratifs.',
  },

  // --------------------------------------------------------------------------
  // CATÉGORIE 2 — INDUSTRIE, MÉCANIQUE & ÉNERGIE (8)
  // --------------------------------------------------------------------------
  {
    id: 'energie-renouvelable-solaire',
    code: 'SOLAR',
    name: 'Énergie Renouvelable / Systèmes Solaires',
    category: 'INDUSTRIE_MECANIQUE_ENERGIE',
    order: 11,
    icon: '☀️',
    description: 'Dimensionnement solaire, pose modules PV, onduleurs hybrides et bancs de batteries.',
  },
  {
    id: 'froid-et-climatisation',
    code: 'FROID',
    name: 'Froid et Climatisation',
    category: 'INDUSTRIE_MECANIQUE_ENERGIE',
    order: 12,
    icon: '❄️',
    description: 'Circuits frigorifiques, tirage au vide, charge fluide R410A/R32 et régulation thermique.',
  },
  {
    id: 'mecanique-automobile',
    code: 'MECA',
    name: 'Mécanique Automobile',
    category: 'INDUSTRIE_MECANIQUE_ENERGIE',
    order: 13,
    icon: '🚗',
    description: 'Diagnostic moteur, trains roulants, freinage ABS, distribution et révision générale.',
  },
  {
    id: 'electrotechnique',
    code: 'ELEC',
    name: 'Électrotechnique',
    category: 'INDUSTRIE_MECANIQUE_ENERGIE',
    order: 14,
    icon: '⚡',
    description: 'TGBT, distribution basse tension, moteurs asynchrones, schémas et sécurité NFC 18-510.',
  },
  {
    id: 'mecatronique-automobile',
    code: 'MECATRO',
    name: 'Mécatronique Automobile',
    category: 'INDUSTRIE_MECANIQUE_ENERGIE',
    order: 15,
    icon: '🏎️',
    description: 'Multiplexage CAN bus, injection électronique common rail, capteurs et calculateurs ECU.',
  },
  {
    id: 'informatique-industrielle',
    code: 'INDUS',
    name: 'Informatique Industrielle',
    category: 'INDUSTRIE_MECANIQUE_ENERGIE',
    order: 16,
    icon: '🤖',
    description: 'Automates programmables (Siemens S7, Schneider), grafcet, SCADA et bus de terrain.',
  },
  {
    id: 'conduite-chariots-elevateurs',
    code: 'CHARIOT',
    name: 'Conduite des Chariots Élévateurs',
    category: 'INDUSTRIE_MECANIQUE_ENERGIE',
    order: 17,
    icon: '🚜',
    description: 'Manutention logistique, gerbage en hauteur, respect du CACES et sécurité d’entrepôt.',
  },
  {
    id: 'technicien-qualite',
    code: 'QUALITE',
    name: 'Technicien Qualité',
    category: 'INDUSTRIE_MECANIQUE_ENERGIE',
    order: 18,
    icon: '🎯',
    description: 'Contrôle métrologique, plans d’échantillonnage, non-conformités et audits ISO 9001.',
  },

  // --------------------------------------------------------------------------
  // CATÉGORIE 3 — INFORMATIQUE, DIGITAL & COMMUNICATION (8)
  // --------------------------------------------------------------------------
  {
    id: 'telecommunication',
    code: 'TELECOM',
    name: 'Télécommunication',
    category: 'INFORMATIQUE_DIGITAL_COMMUNICATION',
    order: 19,
    icon: '📡',
    description: 'Fibre optique (réflectométrie OTDR), liaisons faisceaux hertziens, VSAT et téléphonie IP.',
  },
  {
    id: 'conception-de-logiciels',
    code: 'DEVLOG',
    name: 'Conception de Logiciels',
    category: 'INFORMATIQUE_DIGITAL_COMMUNICATION',
    order: 20,
    icon: '💻',
    description: 'Développement Full-Stack, modélisation UML/Merise, bases de données et tests unitaires.',
  },
  {
    id: 'maintenance-reseaux-informatiques',
    code: 'RESEAUX',
    name: 'Maintenance des Réseaux Informatiques',
    category: 'INFORMATIQUE_DIGITAL_COMMUNICATION',
    order: 21,
    icon: '🌐',
    description: 'Commutation VLAN, routage OSPF/BGP, serveurs Linux/Windows Active Directory et pare-feu.',
  },
  {
    id: 'marketing-digital',
    code: 'MKTDIG',
    name: 'Marketing Digital',
    category: 'INFORMATIQUE_DIGITAL_COMMUNICATION',
    order: 22,
    icon: '📈',
    description: 'Campagnes Google/Meta Ads, community management, SEO/SEA, tunnels de conversion et analytics.',
  },
  {
    id: 'infographie',
    code: 'INFOG',
    name: 'Infographie',
    category: 'INFORMATIQUE_DIGITAL_COMMUNICATION',
    order: 23,
    icon: '🖌️',
    description: 'Création d’identités visuelles, Photoshop, Illustrator, InDesign et chartes graphiques.',
  },
  {
    id: 'graphisme-de-production',
    code: 'GRAPH',
    name: 'Graphisme de Production',
    category: 'INFORMATIQUE_DIGITAL_COMMUNICATION',
    order: 24,
    icon: '🖨️',
    description: 'Prépresse, gestion des profils colorimétriques CMJN, imposition et sérigraphie grand format.',
  },
  {
    id: 'technique-de-telesurveillance',
    code: 'TELESURV',
    name: 'Technique de Télésurveillance',
    category: 'INFORMATIQUE_DIGITAL_COMMUNICATION',
    order: 25,
    icon: '📹',
    description: 'Caméras IP PoE, enregistreurs NVR, contrôle d’accès biométrique et alarmes anti-intrusion.',
  },
  {
    id: 'pentester',
    code: 'PENTEST',
    name: 'Pentester',
    category: 'INFORMATIQUE_DIGITAL_COMMUNICATION',
    order: 26,
    icon: '🛡️',
    description: 'Audit de vulnérabilités, tests d’intrusion éthiques, sécurité OWASP et durcissement système.',
  },

  // --------------------------------------------------------------------------
  // CATÉGORIE 4 — ADMINISTRATION, COMMERCE & GESTION (7)
  // --------------------------------------------------------------------------
  {
    id: 'secretariat-bureautique-bilingue',
    code: 'SECBIL',
    name: 'Secrétariat Bureautique Bilingue',
    category: 'ADMINISTRATION_COMMERCE_GESTION',
    order: 27,
    icon: '🌐',
    description: 'Rédaction administrative français/anglais, accueil, gestion d’agenda et organisation événementielle.',
  },
  {
    id: 'comptabilite-informatisee-gestion',
    code: 'COMPTA',
    name: 'Comptabilité Informatisée et Gestion',
    category: 'ADMINISTRATION_COMMERCE_GESTION',
    order: 28,
    icon: '📊',
    description: 'Système Comptable OHADA, saisie des écritures Sage/Saari, déclarations fiscales et rapprochements.',
  },
  {
    id: 'assistant-de-direction',
    code: 'ASSIST',
    name: 'Assistant de Direction',
    category: 'ADMINISTRATION_COMMERCE_GESTION',
    order: 29,
    icon: '📑',
    description: 'Coordination de comités, comptes-rendus de réunions, gestion de projets et filtrage managérial.',
  },
  {
    id: 'secretariat-comptable',
    code: 'SECCOMP',
    name: 'Secrétariat Comptable',
    category: 'ADMINISTRATION_COMMERCE_GESTION',
    order: 30,
    icon: '🧾',
    description: 'Traitement des factures fournisseurs, états de caisse, paie des salaires et archivage.',
  },
  {
    id: 'televendeur',
    code: 'TELEVEND',
    name: 'Télévendeur',
    category: 'ADMINISTRATION_COMMERCE_GESTION',
    order: 31,
    icon: '📞',
    description: 'Prospection téléphonique B2B/B2C, qualification des leads, traitement des objections et closing.',
  },
  {
    id: 'caissier',
    code: 'CAISSE',
    name: 'Caissier',
    category: 'ADMINISTRATION_COMMERCE_GESTION',
    order: 32,
    icon: '💶',
    description: 'Opérations d’encaissement espèces/TPE/Mobile Money, contrôle des faux billets et arrêté journalier.',
  },
  {
    id: 'secretariat-bureautique',
    code: 'SECBUR',
    name: 'Secrétariat Bureautique',
    category: 'ADMINISTRATION_COMMERCE_GESTION',
    order: 33,
    icon: '⌨️',
    description: 'Traitement de texte avancé, tableurs Excel, publipostage et classement documentaire physique et numérique.',
  },
];

/**
 * Générateur de sections spécialisées par spécialité
 */
function buildSpecializedTemplate(spec: SpecialtyDefinition): ReportTemplate {
  const sections: ReportSection[] = [];

  // ==========================================================================
  // SECTION SPÉCIFIQUE 1 : Paramètres Techniques Métier
  // ==========================================================================
  const specificFields: ReportField[] = [];

  switch (spec.id) {
    // --- 1. Plomberie ---
    case 'plomberie':
      specificFields.push(
        {
          id: 'plomb_type_reseau',
          key: 'typeReseau',
          label: 'Type de Réseau / Installation',
          fieldType: 'SELECT',
          isRequired: true,
          order: 1,
          options: [
            { value: 'ALIM_EF_EC', label: 'Alimentation Eau Froide / Chaude Sanitaire' },
            { value: 'EVAC_EU_EV', label: 'Évacuation Eaux Usées / Eaux Vannes' },
            { value: 'CHAUFFAGE', label: 'Circuit Chauffage / Boucle d’eau chaude' },
            { value: 'GAZ_BUTANE', label: 'Installation Gaz / Butane domestique' },
          ],
        },
        {
          id: 'plomb_diametre_tuyaux',
          key: 'diametreTuyaux',
          label: 'Matériaux & Diamètres utilisés',
          fieldType: 'TEXT',
          placeholder: 'Ex: Cuivre écroui Ø14/16, PER Ø16, PVC évacuation Ø100',
          isRequired: true,
          order: 2,
        },
        {
          id: 'plomb_pression_service',
          key: 'pressionService',
          label: 'Pression de Service mesurée',
          fieldType: 'NUMBER',
          unit: 'bars',
          placeholder: 'Ex: 3.5',
          isRequired: true,
          order: 3,
        },
        {
          id: 'plomb_test_etancheite',
          key: 'testEtancheite',
          label: 'Test de mise en pression & Étanchéité',
          fieldType: 'SELECT',
          isRequired: true,
          order: 4,
          options: [
            { value: 'OK_ZERO_FUITE', label: '✅ Conforme — Zéro fuite à 6 bars pendant 30 min' },
            { value: 'FUITE_CORRIGEE', label: '⚠️ Fuite détectée sur raccord puis resserrée/corrigée' },
            { value: 'REPRISE_REQUISE', label: '❌ Non étanche — Remplacement joint/brasure requis' },
          ],
        }
      );
      break;

    // --- 2. Maçonnerie Gros Œuvre ---
    case 'maconnerie-gros-oeuvre':
      specificFields.push(
        {
          id: 'maco_type_ouvrage',
          key: 'typeOuvrage',
          label: 'Nature des Travaux de Gros Œuvre',
          fieldType: 'SELECT',
          isRequired: true,
          order: 1,
          options: [
            { value: 'FONDATION_SEMELLE', label: 'Fouille & Semelle filante / isolée' },
            { value: 'ELEVATION_PARPAING', label: 'Élévation de murs en parpaings / agglos' },
            { value: 'POTEAUX_POUTRES', label: 'Poteaux et poutres en béton armé' },
            { value: 'DALLE_COMPRESSION', label: 'Plancher haut / Dalle de compression' },
          ],
        },
        {
          id: 'maco_dosage_beton',
          key: 'dosageBeton',
          label: 'Dosage du Béton / Mortier',
          fieldType: 'TEXT',
          placeholder: 'Ex: 350 kg/m³ CPJ 35 (1 sac ciment, 2 brouettes sable, 3 brouettes gravier)',
          isRequired: true,
          order: 2,
        },
        {
          id: 'maco_aplomb_niveau',
          key: 'aplombNiveau',
          label: 'Contrôle d’Aplomb et d’Horizontailté',
          fieldType: 'TEXT',
          placeholder: 'Ex: Tolérance < 3mm mesurée au niveau à bulle et fil à plomb',
          isRequired: true,
          order: 3,
        }
      );
      break;

    // --- 11. Énergie Renouvelable / Solaire ---
    case 'energie-renouvelable-solaire':
      specificFields.push(
        {
          id: 'solar_puissance_crete',
          key: 'puissanceCrete',
          label: 'Puissance Crête Totale installée',
          fieldType: 'NUMBER',
          unit: 'kWc',
          placeholder: 'Ex: 4.8',
          isRequired: true,
          order: 1,
        },
        {
          id: 'solar_tension_voc',
          key: 'tensionVoc',
          label: 'Tension Circuit Ouvert (Voc)',
          fieldType: 'NUMBER',
          unit: 'V DC',
          placeholder: 'Ex: 480',
          isRequired: true,
          order: 2,
        },
        {
          id: 'solar_capacite_batteries',
          key: 'capaciteBatteries',
          label: 'Capacité & Technologie du Stockage',
          fieldType: 'TEXT',
          placeholder: 'Ex: 4x Batteries Lithium LiFePO4 48V 100Ah (19.2 kWh)',
          isRequired: true,
          order: 3,
        },
        {
          id: 'solar_rendement_onduleur',
          key: 'rendementOnduleur',
          label: 'Rendement de conversion Onduleur',
          fieldType: 'NUMBER',
          unit: '%',
          placeholder: 'Ex: 96.5',
          isRequired: true,
          order: 4,
        }
      );
      break;

    // --- 20. Conception de Logiciels ---
    case 'conception-de-logiciels':
      specificFields.push(
        {
          id: 'dev_stack_techno',
          key: 'stackTechnologique',
          label: 'Stack Technologique & Frameworks',
          fieldType: 'TEXT',
          placeholder: 'Ex: React, Node.js/TypeScript, PostgreSQL, Docker, Git',
          isRequired: true,
          order: 1,
        },
        {
          id: 'dev_repo_url',
          key: 'repoOrBranch',
          label: 'Dépôt Git / Branche de travail',
          fieldType: 'TEXT',
          placeholder: 'Ex: gitlab.itmc.cm/promo-gl/portal-module-v2 (branche: feature/auth-jwt)',
          isRequired: false,
          order: 2,
        },
        {
          id: 'dev_couverture_tests',
          key: 'couvertureTests',
          label: 'Couverture de Tests Unitaires / Intégration',
          fieldType: 'NUMBER',
          unit: '%',
          placeholder: 'Ex: 88',
          isRequired: true,
          order: 3,
        },
        {
          id: 'dev_bugs_resolus',
          key: 'bugsResolus',
          label: 'Bugs identifiés & Correctifs appliqués',
          fieldType: 'TEXTAREA',
          placeholder: 'Ex: Correction de la faille de race condition sur les transactions concurrentes...',
          isRequired: true,
          order: 4,
        }
      );
      break;

    // --- 26. Pentester / Cybersécurité ---
    case 'pentester':
      specificFields.push(
        {
          id: 'pentest_perimetre',
          key: 'perimetreAutorise',
          label: 'Périmètre Autorisé (Scope & Mandat)',
          fieldType: 'TEXT',
          placeholder: 'Ex: Plage IP 192.168.100.0/24 & Application Web staging.itmc-lab.cm',
          isRequired: true,
          order: 1,
        },
        {
          id: 'pentest_methodologie',
          key: 'methodologieUtilisee',
          label: 'Méthodologie d’Audit',
          fieldType: 'SELECT',
          isRequired: true,
          order: 2,
          options: [
            { value: 'OWASP_TOP10', label: 'OWASP Top 10 Web Application Security' },
            { value: 'PTES', label: 'PTES (Penetration Testing Execution Standard)' },
            { value: 'NIST_800_115', label: 'NIST SP 800-115 Technical Guide to Info Security' },
            { value: 'OSSTMM', label: 'OSSTMM v3 (Open Source Security Testing)' },
          ],
        },
        {
          id: 'pentest_cve_trouvees',
          key: 'vulnerabilitesCritiques',
          label: 'Vulnérabilités / CVE détectées',
          fieldType: 'TEXTAREA',
          placeholder: 'Ex: 1x SQL Injection (Critical CVSS 9.8), 2x Stored XSS (Medium CVSS 5.4)...',
          isRequired: true,
          order: 3,
        },
        {
          id: 'pentest_recommandations',
          key: 'recommandationsSecurite',
          label: 'Préconisations de Remédiation',
          fieldType: 'TEXTAREA',
          placeholder: 'Ex: Utiliser des requêtes préparées avec ORM, activer CSP et durcir les headers TLS.',
          isRequired: true,
          order: 4,
        }
      );
      break;

    // --- 28. Comptabilité Informatisée et Gestion ---
    case 'comptabilite-informatisee-gestion':
      specificFields.push(
        {
          id: 'compta_logiciel',
          key: 'logicielUtilise',
          label: 'Logiciel Comptable Mobilisé',
          fieldType: 'SELECT',
          isRequired: true,
          order: 1,
          options: [
            { value: 'SAGE_SAARI_100', label: 'Sage 100 Comptabilité / Paie i7' },
            { value: 'CIEL_COMPTA', label: 'Ciel Compta / Gestion Commerciale' },
            { value: 'ODOO_ACCOUNTING', label: 'Odoo ERP Comptabilité Cloud' },
            { value: 'EXCEL_OHADA', label: 'Tableur Financier SYSCOHADA' },
          ],
        },
        {
          id: 'compta_periode',
          key: 'periodeTraitee',
          label: 'Période / Exercice Comptable',
          fieldType: 'TEXT',
          placeholder: 'Ex: Clôture mensuelle Septembre 2026',
          isRequired: true,
          order: 2,
        },
        {
          id: 'compta_balance_equilibree',
          key: 'balanceEquilibree',
          label: 'Contrôle de l’Équilibre Débit / Crédit',
          fieldType: 'SELECT',
          isRequired: true,
          order: 3,
          options: [
            { value: 'EQUILIBRE_PARFAIT', label: '✅ Balance équilibrée — Écart Débit/Crédit = 0.00 FCFA' },
            { value: 'ECART_REGULARISE', label: '⚠️ Écart d’imputation détecté puis lettré et régularisé' },
          ],
        },
        {
          id: 'compta_volume_pieces',
          key: 'volumePieces',
          label: 'Nombre de Pièces Comptables saisies',
          fieldType: 'NUMBER',
          unit: 'pièces',
          placeholder: 'Ex: 145',
          isRequired: true,
          order: 4,
        }
      );
      break;

    // --- 22. Marketing Digital ---
    case 'marketing-digital':
      specificFields.push(
        {
          id: 'mkt_canal_principal',
          key: 'canalCampagne',
          label: 'Canal de Diffusion Principal',
          fieldType: 'SELECT',
          isRequired: true,
          order: 1,
          options: [
            { value: 'META_ADS', label: 'Meta Ads (Facebook & Instagram Ads)' },
            { value: 'GOOGLE_ADS', label: 'Google Ads (Search, Display, YouTube)' },
            { value: 'TIKTOK_ADS', label: 'TikTok Ads & Contenu Viral' },
            { value: 'EMAIL_AUTOMATION', label: 'Emailing & Marketing Automation (Brevo/Mailchimp)' },
            { value: 'SEO_NATUREL', label: 'Optimisation SEO Référencement Naturel' },
          ],
        },
        {
          id: 'mkt_budget_engage',
          key: 'budgetEngage',
          label: 'Budget Publicitaire Engagé',
          fieldType: 'NUMBER',
          unit: 'FCFA',
          placeholder: 'Ex: 150000',
          isRequired: true,
          order: 2,
        },
        {
          id: 'mkt_taux_conversion',
          key: 'tauxConversion',
          label: 'Taux de Conversion (CR) mesuré',
          fieldType: 'NUMBER',
          unit: '%',
          placeholder: 'Ex: 4.8',
          isRequired: true,
          order: 3,
        },
        {
          id: 'mkt_leads_generes',
          key: 'leadsGeneres',
          label: 'Nombre de Prospects / Ventes générés',
          fieldType: 'NUMBER',
          placeholder: 'Ex: 128',
          isRequired: true,
          order: 4,
        }
      );
      break;

    // --- Par Défaut pour les autres spécialités : champs génériques intelligents ---
    default:
      specificFields.push(
        {
          id: `${spec.code.toLowerCase()}_equipement_principal`,
          key: 'equipementOuSupportPrincipal',
          label: 'Équipement, Support ou Document Principal',
          fieldType: 'TEXT',
          placeholder: 'Préciser le matériel, logiciel ou document clé de l’activité...',
          isRequired: true,
          order: 1,
        },
        {
          id: `${spec.code.toLowerCase()}_methode_technique`,
          key: 'methodeOuTechnique',
          label: 'Méthode ou Technique Professionnelle appliquée',
          fieldType: 'TEXT',
          placeholder: 'Préciser la norme, procédure ou démarche suivie...',
          isRequired: true,
          order: 2,
        },
        {
          id: `${spec.code.toLowerCase()}_indicateur_cle`,
          key: 'indicateurPerformance',
          label: 'Indicateur Clé de Réussite / Mesure de Performance',
          fieldType: 'TEXT',
          placeholder: 'Ex: Tolérance respectée, conformité à 100%, délai tenu...',
          isRequired: true,
          order: 3,
        }
      );
  }

  // Construction de la section spécifique
  sections.push({
    id: `sec_${spec.code.toLowerCase()}_specific`,
    key: 'specifiqueMetier',
    title: `Données Techniques Spécifiques — ${spec.name}`,
    subtitle: `Paramètres propres à la filière ${spec.name}`,
    icon: spec.icon,
    order: 2,
    sectionType: 'SPECIALTY_SPECIFIC',
    isRequired: true,
    fields: specificFields,
  });

  return {
    id: `tpl-${spec.code.toLowerCase()}-v1`,
    specialtyId: spec.id,
    specialtyCode: spec.code,
    specialtyName: spec.name,
    category: spec.category,
    version: 1,
    title: `Rapport d'Activité Professionnelle & Travaux Pratiques — ${spec.name}`,
    description: `Modèle standardisé CFP-ITMC pour la documentation des projets, chantiers, TP et stages en ${spec.name}.`,
    icon: spec.icon,
    defaultDurationHours: spec.category === 'BATIMENT_CONSTRUCTION' ? 6 : spec.category === 'INDUSTRIE_MECANIQUE_ENERGIE' ? 5 : 4,
    activityTypes: [
      { value: 'TP_ATELIER', label: '🧪 Travaux Pratiques & Laboratoire' },
      { value: 'CHANTIER_TERRAIN', label: '🏗️ Intervention Chantier / Mission Extérieure' },
      { value: 'PROJET_INTEGRE', label: '🎯 Projet Technique de Synthèse' },
      { value: 'STAGE_ENTREPRISE', label: '🏢 Stage & Immersion Professionnelle' },
      { value: 'MAINTENANCE_CURATIVE', label: '🔧 Dépannage & Maintenance' },
    ],
    sections,
    suggestedCompetencies: [
      {
        code: `${spec.code}-C01`,
        label: `Préparer et organiser l'environnement d'intervention en ${spec.name}`,
        domain: 'Organisation & Méthode',
      },
      {
        code: `${spec.code}-C02`,
        label: `Mettre en œuvre les techniques et procédures professionnelles selon les normes`,
        domain: 'Réalisation Technique',
      },
      {
        code: `${spec.code}-C03`,
        label: `Contrôler la conformité, tester les résultats et diagnostiquer les écarts`,
        domain: 'Contrôle & Qualité',
      },
      {
        code: `${spec.code}-C04`,
        label: `Respecter les consignes de sécurité, protection individuelle et environnementale`,
        domain: 'Sécurité & Hygiène',
      },
      {
        code: `${spec.code}-C05`,
        label: `Rédiger un compte-rendu technique clair, argumenté et exploitable`,
        domain: 'Communication Professionnelle',
      },
    ],
    safetyRulesSummary: `Application obligatoire des consignes de sécurité du CFP-ITMC pour la filière ${spec.name} (EPI conformes, balisage, consignation des énergies).`,
    evaluationRubric: {
      criteria: [
        {
          key: 'crit_technique',
          label: 'Maîtrise Technique & Rigueur Métier',
          maxPoints: 6,
          description: 'Qualité des opérations réalisées et respect des règles de l’art de la spécialité.',
        },
        {
          key: 'crit_securite',
          label: 'Sécurité, Consignation & Protection (EPI)',
          maxPoints: 4,
          description: 'Application rigoureuse des règles de sécurité et conformité des équipements.',
        },
        {
          key: 'crit_analyse',
          label: 'Analyse des Difficultés & Contrôle Qualité',
          maxPoints: 5,
          description: 'Pertinence du diagnostic, tests effectués et résolution des anomalies.',
        },
        {
          key: 'crit_redaction',
          label: 'Clarté de Rédaction & Pièces Justificatives',
          maxPoints: 5,
          description: 'Précision du compte-rendu, illustrations avant/pendant/après et auto-évaluation.',
        },
      ],
      totalPoints: 20,
    },
    isActive: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z',
  };
}

// ----------------------------------------------------------------------------
// REGISTRE EN MÉMOIRE DES 35 MODÈLES ADAPTATIFS
// ----------------------------------------------------------------------------
export const SPECIALTY_TEMPLATES_REGISTRY: Record<string, ReportTemplate> = {};

OFFICIAL_SPECIALTIES_LIST.forEach((spec) => {
  SPECIALTY_TEMPLATES_REGISTRY[spec.id] = buildSpecializedTemplate(spec);
  // Alias avec le code spécialité pour une résolution souple
  SPECIALTY_TEMPLATES_REGISTRY[spec.code.toLowerCase()] = SPECIALTY_TEMPLATES_REGISTRY[spec.id];
});

export function getTemplateForSpecialty(specialtyIdentifier: string): ReportTemplate {
  if (!specialtyIdentifier) {
    return SPECIALTY_TEMPLATES_REGISTRY['plomberie'];
  }
  const cleanKey = specialtyIdentifier.toLowerCase().trim().replace(/_/g, '-');
  if (SPECIALTY_TEMPLATES_REGISTRY[cleanKey]) {
    return SPECIALTY_TEMPLATES_REGISTRY[cleanKey];
  }
  // Recherche par correspondance partielle dans le nom
  const found = OFFICIAL_SPECIALTIES_LIST.find(
    (s) =>
      s.id === cleanKey ||
      s.code.toLowerCase() === cleanKey ||
      s.name.toLowerCase().includes(cleanKey)
  );
  if (found && SPECIALTY_TEMPLATES_REGISTRY[found.id]) {
    return SPECIALTY_TEMPLATES_REGISTRY[found.id];
  }
  // Fallback sûr vers Plomberie ou Conception de Logiciels
  return SPECIALTY_TEMPLATES_REGISTRY['conception-de-logiciels'] || SPECIALTY_TEMPLATES_REGISTRY['plomberie'];
}
