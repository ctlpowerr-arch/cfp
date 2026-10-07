/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import btpBanner from '../assets/images/btp_banner_1789588045687.jpg';
import industrieBanner from '../assets/images/industrie_banner_1789588058807.jpg';
import informatiqueBanner from '../assets/images/informatique_banner_1789588071170.jpg';
import administrationBanner from '../assets/images/administration_banner_1789588085823.jpg';
import heroCampusBanner from '../assets/images/hero_campus_banner_1789588101387.jpg';

export { heroCampusBanner, btpBanner, industrieBanner, informatiqueBanner, administrationBanner };

export interface SpecialtyItem {
  id: string;
  name: string;
  filiere: string; // One of the 4 official categories
  subCategory: string; // Subgroup name
  description: string;
  longDescription: string;
  images: string[];
  duration: string; // "12 Mois"
  levelRequired: string; // "Tout niveau / CEP / BEPC / BAC"
  modules?: string[];
  skills?: string[];
  opportunities?: string[];
  tuitionFee?: string;
  certification?: string;
  studyRhythm?: string;
  practicePercent?: number; // 80
  theoryPercent?: number; // 20
}

export const FILIERES = {
  BATIMENT: {
    id: "batiment",
    name: "Bâtiment, Construction et Travaux",
    shortName: "BTP & Construction",
    icon: "🏗️",
    count: 11,
    bannerImage: btpBanner,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-900/40",
    textClass: "text-amber-700 dark:text-amber-400"
  },
  INDUSTRIE: {
    id: "industrie",
    name: "Industrie, Mécanique et Énergie",
    shortName: "Industrie & Énergie",
    icon: "⚙️",
    count: 9,
    bannerImage: industrieBanner,
    color: "from-blue-600 to-cyan-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-900/40",
    textClass: "text-blue-700 dark:text-blue-400"
  },
  INFORMATIQUE: {
    id: "informatique",
    name: "Informatique, Digital et Communication",
    shortName: "Informatique & Digital",
    icon: "💻",
    count: 8,
    bannerImage: informatiqueBanner,
    color: "from-indigo-600 to-violet-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    borderColor: "border-indigo-200 dark:border-indigo-900/40",
    textClass: "text-indigo-700 dark:text-indigo-400"
  },
  ADMINISTRATION: {
    id: "administration",
    name: "Administration, Commerce et Gestion",
    shortName: "Gestion & Commerce",
    icon: "💼",
    count: 7,
    bannerImage: administrationBanner,
    color: "from-emerald-600 to-teal-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-900/40",
    textClass: "text-emerald-700 dark:text-emerald-400"
  }
};

// Curated stock photos for high-impact visual representation (Optimized for WebP / High Lighthouse Score)
const photoPool = {
  batiment: [
    btpBanner,
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=75"
  ],
  industrie: [
    industrieBanner,
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=800&auto=format&fit=crop&q=75"
  ],
  informatique: [
    informatiqueBanner,
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=75"
  ],
  administration: [
    administrationBanner,
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=75",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=75"
  ]
};

export const defaultSpecialties: SpecialtyItem[] = [
  // =========================================================================
  // 1. BÂTIMENT, CONSTRUCTION ET TRAVAUX (11 Spécialités)
  // =========================================================================
  {
    id: "tuyauterie",
    name: "Tuyauterie",
    filiere: "Bâtiment, Construction et Travaux",
    subCategory: "Installation & Chantiers",
    description: "Lecture de plans isométriques, traçage, découpe, cintrage et assemblage de tuyauteries industrielles et de bâtiment.",
    longDescription: "Formation intensive axée à 80% sur la pratique en atelier : traçage de lignes, débitage de tubes en acier et cuivre, chanfreinage, assemblage par brides, filetage et épreuves hydrauliques de pression sous la supervision de compagnons expérimentés.",
    images: [
      "/images/vitrine/Tu/img_1.jpeg",
      "/images/vitrine/Tu/img_2.jpeg",
      "/images/vitrine/Tu/img_3.jpeg",
      "/images/vitrine/Tu/img_4.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour (08h30 - 13h30) & Cours du soir (17h30 - 20h30)",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "150 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Lecture de plans isométriques et schémas tuyauterie",
      "Techniques de débit, tronçonnage et meulage",
      "Cintrage à froid et à chaud des tubes",
      "Montage d'accessoires, vannes et brides",
      "Tests d'étanchéité et épreuves de pression",
      "Sécurité des chantiers et travail en hauteur"
    ],
    skills: [
      "Interpréter un dessin isométrique de tuyauterie",
      "Réaliser un assemblage par boulonnage ou soudure",
      "Effectuer un test de pression hydrostatique",
      "Respecter scrupuleusement les règles HSE sur chantier"
    ],
    opportunities: [
      "Tuyauteur industriel sur chantiers pétroliers ou maritimes",
      "Poseur de réseaux de fluides en BTP",
      "Monteur en tuyauterie d'usine agroalimentaire",
      "Artisan indépendant en plomberie industrielle"
    ]
  },
  {
    id: "carrelage-batiment",
    name: "Carrelage – Bâtiment",
    filiere: "Bâtiment, Construction et Travaux",
    subCategory: "Second Œuvre & Finition",
    description: "Préparation des supports, calepinage, pose de carreaux, faïences, mosaïques et réalisation des joints parfaits.",
    longDescription: "Un cursus pratique de 12 mois pour maîtriser les techniques modernes de pose droite, diagonale ou décalée de carrelage au sol et mural. Utilisation des colles professionnelles, découpes précises au coupe-carreaux électrique et nivellement par croisillons auto-nivelants.",
    images: [
      "/images/vitrine/CaBa/img_1.jpeg",
      "/images/vitrine/CaBa/img_2.jpeg",
      "/images/vitrine/CaBa/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "150 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Diagnostic et préparation des supports (chapes, ragréage)",
      "Calcul des surfaces, quantitatifs et calepinage",
      "Pose collée et scellée de carreaux sols et murs",
      "Découpes complexes et passages de tuyauteries",
      "Confection et lissage des joints hydrofuges",
      "Pose de plinthes et finitions d'angles"
    ],
    skills: [
      "Réaliser un calepinage optimisé sans gaspillage",
      "Poser du grès cérame, faïence et carrelage grand format",
      "Assurer un alignement et une planéité irréprochables",
      "Effectuer des joints propres et étanches"
    ],
    opportunities: [
      "Carreleur-mosaïste qualifié pour villas et hôtels",
      "Poseur indépendant pour chantiers de rénovation",
      "Applicateur de finitions de luxe BTP",
      "Chef d'équipe revêtements durs"
    ]
  },
  {
    id: "coffreur-ferrailleur",
    name: "Coffreur / Ferrailleur",
    filiere: "Bâtiment, Construction et Travaux",
    subCategory: "Gros Œuvre & Structure",
    description: "Montage des coffrages bois/métal, façonnage, ligaturage des armatures en acier et coulage du béton armé.",
    longDescription: "Acquérez en 12 mois les compétences essentielles pour ériger des structures solides : fondations, poteaux, poutres, dalles et escaliers. Travaux pratiques quotidiens sur ferraillages complexes, cintrage d'armatures et mise en œuvre du béton vibrant.",
    images: [
      "/images/vitrine/CoFe/img_1.jpeg",
      "/images/vitrine/CoFe/img_2.jpeg",
      "/images/vitrine/CoFe/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "150 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Lecture des plans de ferraillage et d'armatures",
      "Façonnage des aciers (cadres, étriers, épingles)",
      "Ligaturage et calage des armatures dans le coffrage",
      "Fabrication et montage des coffrages traditionnels et manuportables",
      "Coulage, vibration et cure du béton armé",
      "Décoffrage soigné et sécurité collective"
    ],
    skills: [
      "Monter des coffrages stables et étanches",
      "Façonner et poser des armatures conformes aux plans d'ingénierie",
      "Contrôler l'enrobage et la vibration du béton",
      "Organiser son poste de travail en toute sécurité"
    ],
    opportunities: [
      "Coffreur-ferrailleur sur chantiers d'immeubles et ponts",
      "Chef d'équipe béton armé",
      "Compagnon gros œuvre en entreprise de BTP",
      "Artisan indépendant en coulage de dalles"
    ]
  },
  {
    id: "poseur-de-paves",
    name: "Poseur de Pavés",
    filiere: "Bâtiment, Construction et Travaux",
    subCategory: "Voirie & Aménagements Extérieurs",
    description: "Terrassement manuel, nivellement du lit de pose, calepinage décoratif et compactage de pavés autobloquants.",
    longDescription: "Spécialité très demandée pour l'aménagement des cours résidentielles, parkings, allées et espaces publics. Formation axée sur la gestion des pentes d'écoulement des eaux, la pose géométrique autobloquante, le garnissage des joints au sable fin et le damage vibrant.",
    images: [
      "/images/vitrine/PoPa/img_1.jpeg",
      "/images/vitrine/PoPa/img_2.jpeg",
      "/images/vitrine/PoPa/img_3.jpeg",
      "/images/vitrine/PoPa/img_4.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "140 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Terrassement léger et préparation de la sous-couche",
      "Réalisation des pentes d'écoulement et pose de bordures",
      "Répartition et tirage du lit de sable",
      "Motifs de pose (arêtes de poisson, chevrons, damier)",
      "Découpes au massicot et meuleuse thermique",
      "Sablage des joints et compactage à la plaque vibrante"
    ],
    skills: [
      "Régler parfaitement les niveaux et pentes d'évacuation",
      "Poser rapidement des pavés selon des motifs décoratifs",
      "Réaliser des rives et bordures de maintien solides",
      "Assurer une finition uniforme et durable"
    ],
    opportunities: [
      "Poseur professionnel de pavés pour résidences et commerces",
      "Ouvrier qualifié en voirie urbaine et aménagement VRD",
      "Entrepreneur indépendant en pavage décoratif",
      "Chef d'équipe pose de revêtements urbains"
    ]
  },
  {
    id: "staff-et-decoration",
    name: "Staff et Décoration",
    filiere: "Bâtiment, Construction et Travaux",
    subCategory: "Décoration & Plâtrerie",
    description: "Moulage de plâtre armé (staff), pose de faux-plafonds décoratifs, corniches, rosaces et luminaires encastrés.",
    longDescription: "Transformez les intérieurs en œuvres d'art. En 12 mois, maîtrisez la préparation du plâtre à mouler, l'armature à la filasse, la fabrication en atelier d'éléments préfabriqués (gorges lumineuses, corniches) et leur scellement soigné sur chantier.",
    images: [
      "/images/vitrine/StDe/img_1.jpeg",
      "/images/vitrine/StDe/img_2.jpeg",
      "/images/vitrine/StDe/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "160 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Propriétés du plâtre et dosage de la filasse végétale",
      "Confection de moules et tirage d'ornements",
      "Traçage et pose d'ossatures pour faux-plafonds modernes",
      "Pose de corniches, moulures et rosaces",
      "Intégration de gorges lumineuses LED contemporaines",
      "Enduisage, ponçage et finitions avant mise en peinture"
    ],
    skills: [
      "Fabriquer des éléments décoratifs en staff",
      "Poser des faux-plafonds suspendus droits ou à redans",
      "Réaliser des raccords invisibles et impeccables",
      "Interpréter les demandes décoratives des clients"
    ],
    opportunities: [
      "Staffeur-ornemaniste pour résidences de standing",
      "Artisan plâtrier-décorateur indépendant",
      "Poseur de plafonds modernes et cloisons sèches",
      "Décorateur d'intérieur second œuvre"
    ]
  },
  {
    id: "etancheite",
    name: "Étanchéité",
    filiere: "Bâtiment, Construction et Travaux",
    subCategory: "Isolation & Protection",
    description: "Protection des toitures-terrasses, dalles, fondations et sous-sols contre les infiltrations d'eau et d'humidité.",
    longDescription: "Au Cameroun avec les saisons des pluies, l'étanchéité est un métier vital. Apprenez en 12 mois l'application de membranes bitumineuses thermosoudées au chalumeau, résines d'étanchéité liquides (SEL), protection des relevés et étanchéité sous carrelage.",
    images: [
      "/images/vitrine/Et/img_1.jpeg",
      "/images/vitrine/Et/img_2.jpeg",
      "/images/vitrine/Et/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "150 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Analyse des pathologies d'infiltrations et humidité",
      "Préparation des supports et application du primaire d'accroche",
      "Pose de membranes bitumineuses au chalumeau à gaz",
      "Réalisation des relevés d'étanchéité et points singuliers",
      "Application de systèmes d'étanchéité liquide (résines mono/bi-composants)",
      "Mise en eau pour épreuve d'étanchéité et sécurité incendie"
    ],
    skills: [
      "Diagnostiquer l'origine d'une fuite ou infiltration",
      "Souder des membranes étanches sans brûlure ni bulle",
      "Traiter les acrotères, caniveaux et tuyaux de descente",
      "Garantir une étanchéité durable garantie sans fuite"
    ],
    opportunities: [
      "Étancheur professionnel en bâtiment",
      "Applicateur de résines et revêtements imperméables",
      "Spécialiste de la rénovation toiture anti-fuite",
      "Chef d'équipe étanchéité en entreprise générale"
    ]
  },
  {
    id: "peinture-batiment",
    name: "Peinture Bâtiment",
    filiere: "Bâtiment, Construction et Travaux",
    subCategory: "Second Œuvre & Finition",
    description: "Lessivage, rebouchage, enduisage fin, ponçage et application de peintures décoratives mates, satinées et laquées.",
    longDescription: "Une formation résolument pratique pour devenir un peintre professionnel recherché : préparation parfaite des murs, maîtrise des enduits de lissage au couteau, harmonie des teintes, utilisation de rouleaux anti-goutte, pistolets airless et effets décoratifs.",
    images: [
      "/images/vitrine/PeBa/img_1.jpeg",
      "/images/vitrine/PeBa/img_2.jpeg",
      "/images/vitrine/PeBa/img_3.jpeg",
      "/images/vitrine/PeBa/img_4.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "140 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Préparation mécanique et chimique des subjectiles",
      "Application des enduits de rebouchage et de lissage",
      "Techniques de ponçage manuel et girafes aspirantes",
      "Chimie des peintures (acryliques, glycéros, époxy)",
      "Application au rouleau, brosse et pistolet Airless",
      "Effets décoratifs (stuc, sablé, chaux, patines)"
    ],
    skills: [
      "Obtenir des surfaces parfaitement lisses sans aspérités",
      "Appliquer les peintures sans traces de reprise",
      "Formuler et mélanger des teintes personnalisées",
      "Entretenir son matériel et protéger les chantiers"
    ],
    opportunities: [
      "Peintre applicateur en bâtiment neuf et rénovation",
      "Spécialiste en peintures décoratives haut de gamme",
      "Peintre au pistolet industriel",
      "Entrepreneur artisan peintre indépendant"
    ]
  },
  {
    id: "metallerie-soudure-tuyauterie",
    name: "Métallerie-Soudure-Tuyauterie",
    filiere: "Bâtiment, Construction et Travaux",
    subCategory: "Construction Métallique",
    description: "Fabrication d'ouvrages métalliques, grilles, portails, charpentes légères et maîtrise du soudage à l'arc (MMA/MIG-MAG).",
    longDescription: "Un cursus polyvalent de 12 mois combinant métallerie artisanale et soudage professionnel. Vous apprendrez la découpe des profilés acier, le pointage, l'assemblage géométrique, le meulage et la soudure étanche sur tôles et tuyaux.",
    images: [
      "/images/vitrine/MeSoTu/img_1.jpeg",
      "/images/vitrine/MeSoTu/img_2.jpeg",
      "/images/vitrine/MeSoTu/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "165 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Sécurité en atelier chaud et protection individuelle",
      "Débit des profilés (cornières, tubes carrés, ronds)",
      "Soudage à l'arc avec électrode enrobée (MMA)",
      "Initiation au soudage semi-automatique MIG/MAG",
      "Fabrication de grilles de sécurité, portails et balcons",
      "Traitements anticorrosion et peintures antirouille"
    ],
    skills: [
      "Réaliser des cordons de soudure réguliers et résistants",
      "Assembler des structures métalliques à l'équerre",
      "Monter des garde-corps et portes métalliques blindées",
      "Détecter les défauts de soudure et les corriger"
    ],
    opportunities: [
      "Métallier-soudeur d'atelier ou de chantier",
      "Fabricant de portails et fermetures métalliques",
      "Monteur de charpentes et hangars métalliques",
      "Artisan soudeur à son propre compte"
    ]
  },
  {
    id: "maconnerie-gros-oeuvre",
    name: "Maçonnerie Gros Œuvre",
    filiere: "Bâtiment, Construction et Travaux",
    subCategory: "Gros Œuvre & Structure",
    description: "Implantation de bâtiments, fondations, élévation de murs en parpaings/briques et confection de chapes.",
    longDescription: "Le socle de tout bâtiment : 12 mois d'immersion pratique pour apprendre à implanter à la lunette et au cordeau, monter des murs verticaux au fil à plomb, réaliser des linteaux, chaînages horizontaux et verticaux, ainsi que les enduits de façade.",
    images: [
      "/images/vitrine/MaGrOe/img_1.jpeg",
      "/images/vitrine/MaGrOe/img_2.jpeg",
      "/images/vitrine/MaGrOe/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "150 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Implantation d'un bâtiment sur chaises d'alignement",
      "Fouilles en rigoles et coulage de béton de propreté",
      "Montage de murs en agglos de 15 et 20 avec mortier dosé",
      "Réalisation de chaînages et linteaux armés",
      "Dressage des enduits de façade à la règle de maçon",
      "Réalisation de chapes de nivellement lissées"
    ],
    skills: [
      "Monter des maçonneries droites avec aplomb parfait",
      "Doser correctement les mortiers et bétons de chantier",
      "Implanter avec précision un ouvrage selon un plan",
      "Tirer un enduit traditionnel au mortier de ciment"
    ],
    opportunities: [
      "Maçon qualifié gros œuvre BTP",
      "Chef d'équipe construction résidentielle",
      "Entrepreneur général en bâtiment",
      "Ouvrier polyvalent sur chantiers publics"
    ]
  },
  {
    id: "vitrerie-aluminium",
    name: "Vitrerie Aluminium",
    filiere: "Bâtiment, Construction et Travaux",
    subCategory: "Menuiserie & Fermetures",
    description: "Fabrication et pose de fenêtres coulissantes, portes vitrées, façades rideaux et cloisons amovibles en aluminium.",
    longDescription: "Spécialité moderne très prisée des bureaux et résidences. Maîtrisez le débit des profilés aluminium à la tronçonneuse d'angle, le fraisage des serrures, la découpe du verre sécurit/feuilleté, la pose des joints d'étanchéité et l'installation sur chantier.",
    images: [
      "/images/vitrine/ViAl/img_1.jpeg",
      "/images/vitrine/ViAl/img_2.jpeg",
      "/images/vitrine/ViAl/img_3.jpeg",
      "/images/vitrine/ViAl/img_4.jpeg",
      "/images/vitrine/ViAl/img_5.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / BEPC / BAC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "165 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Découverte des gammes de profilés aluminium",
      "Prise de cotes réelles sur chantier et débitage d'angles",
      "Usinage des drainages, gâches et poignées",
      "Techniques de coupe, façonnage et manipulation du verre",
      "Assemblage mécanique des vantaux et dormants",
      "Pose sur maçonnerie, calage et étanchéité au silicone"
    ],
    skills: [
      "Fabriquer des baies vitrées coulissantes aluminium",
      "Couper et manipuler le vitrage en toute sécurité",
      "Poser des cloisons de bureaux vitrées modulaires",
      "Régler la quincaillerie pour une manœuvre fluide"
    ],
    opportunities: [
      "Menuisier vitrier aluminium d'atelier",
      "Poseur de fermetures vitrées et vérandas",
      "Installateur de murs rideaux pour immeubles",
      "Artisan fabricant de fenêtres aluminium"
    ]
  },
  {
    id: "plomberie",
    name: "Plomberie",
    filiere: "Bâtiment, Construction et Travaux",
    subCategory: "Sanitaire & Réseaux de Fluides",
    description: "Installation des réseaux d'eau froide/chaude, pose d'équipements sanitaires, évacuations PVC et dépannage rapide.",
    longDescription: "Cursus pratique de 12 mois pour acquérir l'autonomie d'un artisan plombier : raccordements multicouche, PER, PPR soudé et cuivre, installation de chauffe-eau, WC suspendus, douches italiennes, pompes de surpression et recherche de fuites.",
    images: [
      "/images/vitrine/Pl/img_1.jpeg",
      "/images/vitrine/Pl/img_2.jpeg",
      "/images/vitrine/Pl/img_3.jpeg",
      "/images/vitrine/Pl/img_4.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "155 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Principes hydrauliques et dimensionnement des conduites",
      "Travail du tube PPR thermosoudé, multicouche et cuivre",
      "Installation des réseaux d'évacuation PVC ventilés",
      "Pose et raccordement d'appareils sanitaires (WC, lavabos, éviers)",
      "Installation de pompes immergées, suppresseurs et cuves",
      "Recherche de fuite, dépannage et débouchage professionnel"
    ],
    skills: [
      "Réaliser un réseau d'adduction d'eau sans fuite",
      "Installer un système sanitaire complet moderne",
      "Poser un réservoir d'eau avec surpresseur automatique",
      "Dépanner les fuites et pannes hydrauliques urgentes"
    ],
    opportunities: [
      "Plombier installateur sanitaire bâtiment",
      "Technicien de maintenance réseaux d'eau",
      "Installateur de pompes et systèmes d'arrosage",
      "Plombier dépanneur indépendant"
    ]
  },

  // =========================================================================
  // 2. INDUSTRIE, MÉCANIQUE ET ÉNERGIE (9 Spécialités)
  // =========================================================================
  {
    id: "conduite-chariots-elevateurs",
    name: "Conduite des Chariots Élévateurs et Manutentions",
    filiere: "Industrie, Mécanique et Énergie",
    subCategory: "Logistique & Engins Industriels",
    description: "Pilotage sécurisé de chariots élévateurs frontaux et rétractables, gerbage en hauteur et gestion de stock.",
    longDescription: "Formation certifiante accélérée de 12 mois (CACES/CQP) avec conduite intensive sur engins réels : manœuvres d'approche, levage de palettes, empilage en rayonnages grande hauteur, vérifications journalières et prévention des risques d'accidents en entrepôt.",
    images: [
      "/images/vitrine/CoChElMa/img_1.jpeg",
      "/images/vitrine/CoChElMa/img_2.jpeg",
      "/images/vitrine/CoChElMa/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / Permis B recommandé mais non obligatoire",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "180 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel de Cariste Manutentionnaire DQP / CQP MINEFOP",
    modules: [
      "Réglementation et responsabilités du cariste",
      "Technologie et composants des chariots élévateurs",
      "Vérifications de sécurité de prise de poste",
      "Conduite de précision et circulation en allée étroite",
      "Prise et dépose de charges jusqu'à 6 mètres de hauteur",
      "Chargement / déchargement de conteneurs et camions"
    ],
    skills: [
      "Manœuvrer un chariot élévateur avec précision millimétrique",
      "Gérer le centre de gravité et respecter les plaques de charge",
      "Gerber et dégerber des palettes en palettiers hauts",
      "Appliquer les règles de sécurité en entrepôt logistique"
    ],
    opportunities: [
      "Cariste professionnel en plateforme logistique",
      "Conducteur d'engins de manutention portuaire / aéroportuaire",
      "Magasinier-cariste en grande distribution et usines",
      "Opérateur de manutention lourde industrielle"
    ]
  },
  {
    id: "mecatronique-automobile",
    name: "Mécatronique Automobile",
    filiere: "Industrie, Mécanique et Énergie",
    subCategory: "Électronique Automobile",
    description: "Diagnostic assisté par scanner multimarque, reprogrammation d'ECU, calculateurs de bord et capteurs électroniques.",
    longDescription: "Au cœur des véhicules modernes : diagnostic électronique approfondi des réseaux CAN/LIN, capteurs PMH, débitmètres, injecteurs piézo-électriques, direction assistée électrique, systèmes Start & Stop et détection des codes défauts (DTC) avec la valise de scanner.",
    images: [
      "/images/vitrine/MecatrAu/img_1.jpeg",
      "/images/vitrine/MecatrAu/img_2.jpeg",
      "/images/vitrine/MecatrAu/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "BEPC / Probatoire / BAC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "175 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Architecture électrique et électronique des véhicules récents",
      "Multiplexage et bus de communication (CAN, LIN)",
      "Utilisation avancée des valises de diagnostic multimarques",
      "Oscilloscope automobile et contrôle des signaux capteurs",
      "Systèmes d'injection Common Rail et gestion moteur",
      "Reprogrammation des calculateurs et calibrage capteurs"
    ],
    skills: [
      "Interpréter les flux de données en direct avec une valise",
      "Contrôler un capteur ou actionneur à l'oscilloscope",
      "Résoudre les pannes électroniques intermittentes complexes",
      "Réinitialiser les voyants et réapparier les composants"
    ],
    opportunities: [
      "Mécatronicien automobile de concession",
      "Électronicien auto spécialisé en diagnostic",
      "Technicien scanner et reprogrammation",
      "Gérant de centre de diagnostic automobile"
    ]
  },
  {
    id: "mecanique-automobile",
    name: "Mécanique Automobile",
    filiere: "Industrie, Mécanique et Énergie",
    subCategory: "Maintenance Automobile",
    description: "Entretien moteur, calage de distribution, embrayage, freinage ABS, suspension et révision générale des véhicules.",
    longDescription: "Un cursus 80% pratique sur bancs d'essai et véhicules en atelier : démontage et remontage de culasses, remplacement de kits de distribution, révision des circuits de lubrification et refroidissement, purge de freins et parallélisme des trains roulants.",
    images: [
      "/images/vitrine/MecanAu/img_1.jpeg",
      "/images/vitrine/MecanAu/img_2.jpeg",
      "/images/vitrine/MecanAu/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "160 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Fonctionnement et métrologie des moteurs essence et diesel",
      "Démontage, contrôle et calage de la distribution",
      "Système de freinage hydraulique et remplacement plaquettes/disques",
      "Embrayage, boîte de vitesses manuelle et transmissions",
      "Suspension, amortisseurs et géométrie du train avant",
      "Vidanges complètes, filtres et check-up d'entretien"
    ],
    skills: [
      "Caler une chaîne ou courroie de distribution avec précision",
      "Remplacer un kit d'embrayage et purger le circuit",
      "Identifier les anomalies mécaniques par écoute et mesure",
      "Assurer une révision complète de véhicule dans les normes"
    ],
    opportunities: [
      "Mécanicien d'entretien en atelier ou concession",
      "Mécanicien de flotte d'entreprise ou de transport",
      "Technicien de service rapide automobile",
      "Artisan garagiste indépendant"
    ]
  },
  {
    id: "energie-renouvelable",
    name: "Énergie Renouvelable",
    filiere: "Industrie, Mécanique et Énergie",
    subCategory: "Transition Énergétique",
    description: "Dimensionnement, étude technique et implantation de centrales photovoltaïques, éoliennes et micro-centrales hydroélectriques.",
    longDescription: "Formation orientée vers la transition énergétique durable : calculs d'ensoleillement, dimensionnement des champs solaires résidentiels et industriels, hybridation groupe électrogène / solaire, onduleurs hybrides et parcs de batteries lithium LiFePO4.",
    images: [
      "/images/vitrine/EnRe/img_1.jpeg",
      "/images/vitrine/EnRe/img_2.jpeg",
      "/images/vitrine/EnRe/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "BEPC / Probatoire / BAC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "170 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Gisement solaire et calcul du besoin énergétique",
      "Dimensionnement des générateurs photovoltaïques",
      "Technologie des onduleurs réseaux et hybrides intelligents",
      "Stockage d'énergie (Batteries Gel, AGM et Lithium LiFePO4)",
      "Couplage solaire avec réseau public et groupes électrogènes",
      "Études de rentabilité économique et cahier des charges"
    ],
    skills: [
      "Dimensionner un système solaire autonome ou hybride",
      "Sélectionner les équipements selon le profil de consommation",
      "Paramétrer un onduleur hybride communicant",
      "Concevoir une solution d'énergie de secours fiable"
    ],
    opportunities: [
      "Conseiller technique en énergies renouvelables",
      "Concepteur de projets solaires photovoltaïques",
      "Technico-commercial en équipements verts",
      "Installateur de parcs solaires d'entreprises"
    ]
  },
  {
    id: "maintenance-systemes-solaires",
    name: "Maintenance des Systèmes Solaires",
    filiere: "Industrie, Mécanique et Énergie",
    subCategory: "Transition Énergétique",
    description: "Pose sur toiture, câblage sécurisé, dépannage d'onduleurs, équilibrage de batteries et entretien des panneaux solaires.",
    longDescription: "Formation 80% pratique sur toitures-écoles et bancs photovoltaïques réels : techniques de fixation sans fuite, raccordement des chaînes de panneaux (strings), sertissage des connecteurs MC4, boîtiers DC/AC avec parafoudres et nettoyage préventif.",
    images: [
      "/images/vitrine/MaSySo/img_1.jpeg",
      "/images/vitrine/MaSySo/img_2.jpeg",
      "/images/vitrine/MaSySo/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "160 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Sécurité des travaux en toiture et harnais de sécurité",
      "Pose mécanique des rails et fixations de panneaux",
      "Câblage DC, connecteurs MC4 et protection fusibles/parafoudres",
      "Raccordement de régulateurs MPPT et onduleurs chargeurs",
      "Équilibrage, test d'impédance et entretien de batteries",
      "Diagnostic de baisse de rendement et remplacement de modules"
    ],
    skills: [
      "Poser et câbler des panneaux solaires sur tous types de toits",
      "Installer un coffret de protection DC/AC conforme",
      "Diagnostiquer une panne d'onduleur ou de batterie défaillante",
      "Assurer la maintenance périodique pour un rendement maximal"
    ],
    opportunities: [
      "Technicien installateur de kits solaires",
      "Agent de maintenance de parcs photovoltaïques",
      "Dépanneur d'installations solaires résidentielles",
      "Installateur indépendant en énergie solaire"
    ]
  },
  {
    id: "electrotechnique",
    name: "Électrotechnique",
    filiere: "Industrie, Mécanique et Énergie",
    subCategory: "Électricité Industrielle & Bâtiment",
    description: "Câblage d'armoires électriques, démarreurs de moteurs triphasés, relais de protection et installations domestiques.",
    longDescription: "Maîtrisez en 12 mois la lecture de schémas électriques industriels, le câblage de coffrets d'automatisme, le démarrage direct et étoile-triangle de moteurs asynchrones, la pose d'appareillages modulaires et la mise à la terre sécurisée.",
    images: [
      "/images/vitrine/El/img_1.jpeg",
      "/images/vitrine/El/img_2.jpeg",
      "/images/vitrine/El/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / BEPC / BAC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "160 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Lois fondamentales du courant continu et alternatif triphasé",
      "Lecture et réalisation de schémas de commande et de puissance",
      "Câblage d'armoires électriques et pose de goulottes",
      "Démarrage et inversion de sens des moteurs électriques",
      "Choix des disjoncteurs, contacteurs et relais thermiques",
      "Mesures au multimètre, pince ampèremétrique et contrôleur d'isolement"
    ],
    skills: [
      "Câbler une armoire électrique industrielle complète",
      "Raccorder et sécuriser un moteur électrique triphasé",
      "Effectuer un dépannage rapide sur une chaîne électromécanique",
      "Vérifier la conformité de la prise de terre et des protections"
    ],
    opportunities: [
      "Électrotechnicien de maintenance industrielle",
      "Câbleur d'armoires et coffrets électriques",
      "Électricien tertiaire et industriel qualifié",
      "Artisan électricien indépendant"
    ]
  },
  {
    id: "froid-et-climatisation",
    name: "Froid et Climatisation",
    filiere: "Industrie, Mécanique et Énergie",
    subCategory: "Génie Climatique & Froid",
    description: "Installation de climatiseurs split, chambres froides, tirage au vide, charge en gaz frigorigène (R410A, R32) et dépannage.",
    longDescription: "Un secteur en forte croissance au climat tropical : apprenez le dudgeonnage des tubes cuivre, l'installation intérieure et extérieure de climatiseurs réversibles, la détection de fuites à l'azote, le tirage au vide et le dépannage des compresseurs et cartes électroniques.",
    images: [
      "/images/vitrine/FrCl/img_1.jpeg",
      "/images/vitrine/FrCl/img_2.jpeg",
      "/images/vitrine/FrCl/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "165 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Cycle thermodynamique de réfrigération et fluides frigorigènes",
      "Travail du tube cuivre (coupe, ébavurage, évasement, brasage)",
      "Pose murale et raccordement électrique/frigorifique de splits",
      "Tirage au vide à la pompe et charge précise au manomètre",
      "Maintenance de chambres froides positives et négatives",
      "Diagnostic des pannes électriques et remplacement de condensateurs"
    ],
    skills: [
      "Installer un climatiseur split de A à Z en respectant les normes",
      "Recharger un circuit frigorifique avec le bon gaz sans fuite",
      "Nettoyer et désinfecter les échangeurs thermiques",
      "Dépanner un groupe frigorifique en panne"
    ],
    opportunities: [
      "Frigoriste climaticien en entreprise d'installation",
      "Technicien de maintenance hôtelière et commerciale",
      "Installateur de climatiseurs résidentiels",
      "Dépanneur frigoriste indépendant"
    ]
  },
  {
    id: "informatique-industrielle",
    name: "Informatique Industrielle",
    filiere: "Industrie, Mécanique et Énergie",
    subCategory: "Automatismes & Systèmes",
    description: "Programmation d'automates programmables industriels (API / PLC), capteurs industriels et interfaces hommes-machines (IHM).",
    longDescription: "Faites dialoguer informatique et usines : programmation en langage Ladder et Grafcet d'automates (Siemens, Schneider), câblage de capteurs inductifs/optiques, variateurs de vitesse pour moteurs et supervision sur écrans tactiles industriels.",
    images: [
      "/images/vitrine/InIn/img_1.jpeg",
      "/images/vitrine/InIn/img_2.jpeg",
      "/images/vitrine/InIn/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "BEPC / Probatoire / BAC F ou Scientifique",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "180 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Architecture des automates programmables industriels (API/PLC)",
      "Programmation Ladder, blocs fonctions (FBD) et Grafcet",
      "Raccordement des entrées/sorties analogiques et numériques",
      "Paramétrage de variateurs de fréquence pour moteurs",
      "Conception d'écrans de contrôle IHM tactiles",
      "Protocoles de communication industriels (Modbus, Profinet)"
    ],
    skills: [
      "Programmer un cycle automatisé de production sur automate",
      "Diagnostiquer un arrêt de chaîne par analyse du programme",
      "Raccorder et calibrer des capteurs industriels de précision",
      "Concevoir une interface graphique IHM conviviale"
    ],
    opportunities: [
      "Automaticien d'usine agroalimentaire ou manufacturière",
      "Technicien de maintenance en informatique industrielle",
      "Intégrateur de systèmes automatisés",
      "Spécialiste de la modernisation de lignes de production"
    ]
  },
  {
    id: "technicien-qualite",
    name: "Technicien Qualité",
    filiere: "Industrie, Mécanique et Énergie",
    subCategory: "Contrôle Qualité & Normes",
    description: "Contrôle qualité sur chaînes de production, métrologie, application des normes ISO 9001 et traitement des non-conformités.",
    longDescription: "Garant de l'excellence des produits : apprenez en 12 mois à mettre en place des fiches de contrôle, utiliser les instruments de métrologie de haute précision (pied à coulisse, micromètre), animer les démarches 5S, rédiger les rapports d'audit et piloter les actions correctives.",
    images: [
      "/images/vitrine/TeQu/img_1.jpeg",
      "/images/vitrine/TeQu/img_2.jpeg",
      "/images/vitrine/TeQu/img_3.jpeg",
      "/images/vitrine/TeQu/img_4.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "BEPC / Probatoire / BAC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "160 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Principes du management de la qualité et norme ISO 9001",
      "Outils de résolution de problèmes (Ishikawa, 5 Pourquoi, Pareto)",
      "Métrologie d'atelier et étalonnage des instruments de mesure",
      "Contrôle à la réception des matières et prélèvements statistiques",
      "Gestion des fiches de non-conformité et actions correctives",
      "Mise en œuvre de la méthode 5S et audits de postes"
    ],
    skills: [
      "Établir un plan de contrôle qualité pour une chaîne de fabrication",
      "Mesurer et contrôler des pièces avec précision métrologique",
      "Identifier les causes racines des défauts de fabrication",
      "Rédiger des procédures claires et former les opérateurs"
    ],
    opportunities: [
      "Contrôleur qualité en usine agroalimentaire ou plastique",
      "Technicien assurance qualité en industrie",
      "Auditeur interne qualité processus",
      "Assistant responsable Qualité Hygiène Sécurité (QSE)"
    ]
  },

  // =========================================================================
  // 3. INFORMATIQUE, DIGITAL ET COMMUNICATION (8 Spécialités)
  // =========================================================================
  {
    id: "infographie",
    name: "Infographie",
    filiere: "Informatique, Digital et Communication",
    subCategory: "Design & Multimédia",
    description: "Création d'identités visuelles, logos, affiches publicitaires, flyers et bannières web avec Photoshop, Illustrator et InDesign.",
    longDescription: "Libérez votre créativité numérique en 12 mois : manipulation experte des calques, détourages complexes, typographie créative, photomontages réalistes, vectorisation de logos vectoriels et préparation de fichiers pour l'imprimerie grand format et les réseaux sociaux.",
    images: [
      "/images/vitrine/In/img_1.jpeg",
      "/images/vitrine/In/img_2.jpeg",
      "/images/vitrine/In/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / Accessible aux débutants motivés",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "150 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Principes de composition, théorie des couleurs et typographie",
      "Adobe Photoshop : retouche photo, détourage et photomontage",
      "Adobe Illustrator : création de logos, pictogrammes et vecteurs",
      "Adobe InDesign : mise en page de catalogues, dépliants et brochures",
      "Conception de visuels optimisés pour Facebook, Instagram, LinkedIn",
      "Gestion de la chaîne graphique, formats CMJN et repères d'impression"
    ],
    skills: [
      "Créer une charte graphique complète et un logo mémorable",
      "Réaliser des affiches et supports promotionnels professionnels",
      "Préparer des fichiers prépresse prêts pour l'impression",
      "Travailler vite sous pression avec les raccourcis professionnels"
    ],
    opportunities: [
      "Infographe en agence de communication ou imprimerie",
      "Designer graphique freelance sur plateformes internationales",
      "Créateur de contenus visuels pour marques et influenceurs",
      "Responsable de studio graphique d'entreprise"
    ]
  },
  {
    id: "marketing-digital",
    name: "Marketing Digital",
    filiere: "Informatique, Digital et Communication",
    subCategory: "Communication & Ventes en Ligne",
    description: "Publicité sponsorisée (Meta Ads, Google Ads), Community Management, création de tunnels de vente et croissance des ventes.",
    longDescription: "Multipliez le chiffre d'affaires des entreprises grâce au digital : lancement de campagnes publicitaires ciblées sur Facebook et TikTok, rédaction de textes persuasifs (copywriting), création de visuels percutants sur Canva, gestion de communauté et analyse ROI des budgets publicitaires.",
    images: [
      "/images/vitrine/MaDi/img_1.jpeg",
      "/images/vitrine/MaDi/img_2.jpeg",
      "/images/vitrine/MaDi/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "BEPC / Probatoire / BAC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "150 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Stratégie de présence sur les réseaux sociaux (Facebook, TikTok, Instagram)",
      "Publicité payante avec Facebook Ads Manager et Google Ads",
      "Copywriting : l'art d'écrire des textes qui vendent",
      "Création de visuels et vidéos dynamiques avec Canva et CapCut",
      "Emailing marketing, prospection WhatsApp Business automatisée",
      "Suivi des conversions, analytics et calcul du retour sur investissement (ROI)"
    ],
    skills: [
      "Lancer et rentabiliser des campagnes Facebook / Instagram Ads",
      "Piloter et animer une communauté en ligne engagée",
      "Mettre en place un tunnel de vente WhatsApp Business pour le Cameroun",
      "Analyser les statistiques pour optimiser les ventes quotidiennes"
    ],
    opportunities: [
      "Community Manager / Spécialiste réseaux sociaux",
      "Media Buyer / Gestionnaire de publicités sponsorisées",
      "Responsable Marketing Digital en PME",
      "Consultant freelance en acquisition clients"
    ]
  },
  {
    id: "maintenance-reseaux-informatiques",
    name: "Maintenance des Réseaux Informatiques",
    filiere: "Informatique, Digital et Communication",
    subCategory: "Systèmes & Réseaux",
    description: "Câblage RJ45, configuration de routeurs et switchs (Cisco, MikroTik), adressage IP, partage de ressources et dépannage PC.",
    longDescription: "Le garant du bon fonctionnement des systèmes informatiques : assemblage et dépannage matériel de PC, installation et sécurisation de Windows et Linux, sertissage de baies de brassage réseau, configuration de bornes Wi-Fi sécurisées et partage d'imprimantes/fichiers.",
    images: [
      "/images/vitrine/MaReIn/img_1.jpeg",
      "/images/vitrine/MaReIn/img_2.jpeg",
      "/images/vitrine/MaReIn/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / BEPC / BAC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "155 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Architecture matérielle des ordinateurs et diagnostic hardware",
      "Installation et clonage des systèmes d'exploitation (Windows/Linux)",
      "Câblage réseau structuré, sertissage RJ45 et testeurs de câbles",
      "Adressage IP (IPv4, masques, sous-réseaux, passerelles, DNS)",
      "Configuration de routeurs, switchs manageables et points d'accès Wi-Fi",
      "Mise en place de partages réseau sécurisés et sauvegardes automatiques"
    ],
    skills: [
      "Monter, démonter et dépanner n'importe quel ordinateur",
      "Déployer un réseau local d'entreprise avec baie de brassage",
      "Configurer des routeurs et sécuriser l'accès Wi-Fi",
      "Résoudre rapidement les pannes de connexion et virus"
    ],
    opportunities: [
      "Technicien support informatique & helpdesk",
      "Administrateur réseaux junior en PME",
      "Installateur de parcs informatiques et réseaux câblés",
      "Technicien dépanneur PC & réseaux freelance"
    ]
  },
  {
    id: "technique-telesurveillance",
    name: "Technique de Télésurveillance",
    filiere: "Informatique, Digital et Communication",
    subCategory: "Sécurité Électronique & Vidéosurveillance",
    description: "Installation de caméras IP et analogiques HD, enregistreurs NVR/DVR, alarmes anti-intrusion et contrôle d'accès biométrique.",
    longDescription: "Un secteur à forte rentabilité immédiate : apprenez à concevoir et installer des systèmes complets de sécurité électronique. Tirage de câbles réseau et coaxiaux, configuration d'enregistreurs NVR, accès vidéo à distance sur smartphone via Internet, alarmes sans fil et ventouses magnétiques.",
    images: [
      "/images/vitrine/TeTe/img_1.jpeg",
      "/images/vitrine/TeTe/img_2.jpeg",
      "/images/vitrine/TeTe/img_3.jpeg",
      "/images/vitrine/TeTe/img_4.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "160 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Technologies des caméras (Analogique HD, Caméras IP, Dôme, Bullet, PTZ)",
      "Câblage réseau PoE et alimentation secourue par onduleur",
      "Configuration des enregistreurs DVR et NVR (Disques durs, détection de mouvement)",
      "Paramétrage du routage réseau pour visionnage à distance sur smartphone",
      "Installation de systèmes d'alarmes anti-intrusion sans fil et sirènes",
      "Pose de contrôles d'accès par carte RFID, code et empreinte biométrique"
    ],
    skills: [
      "Poser et orienter des caméras pour éliminer les angles morts",
      "Configurer un NVR et activer les notifications d'intrusion",
      "Rendre un système consultable en direct depuis un smartphone n'importe où",
      "Installer un contrôle d'accès pour portes de bureaux sécurisées"
    ],
    opportunities: [
      "Installateur de vidéosurveillance et alarmes",
      "Technicien en sécurité électronique en entreprise",
      "Conseiller technique en télésurveillance",
      "Installateur indépendant pour particuliers et entreprises"
    ]
  },
  {
    id: "telecommunication",
    name: "Télécommunication",
    filiere: "Informatique, Digital et Communication",
    subCategory: "Réseaux Mobiles & Télécoms",
    description: "Déploiement de liaisons hertziennes, raccordement de fibre optique par soudure, antennes relais et téléphonie sur IP (VoIP).",
    longDescription: "Formation pratique sur les infrastructures de communication modernes : réalisation d'épissures de fibre optique à la soudeuse à fusion, mesures de réflectométrie (OTDR), installation d'antennes radio point à point, et mise en service de standard téléphonique IP (PBX).",
    images: [
      "/images/vitrine/TeCo/img_1.jpeg",
      "/images/vitrine/TeCo/img_2.jpeg",
      "/images/vitrine/TeCo/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "BEPC / Probatoire / BAC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "170 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Principes des transmissions de données et téléphonie mobile",
      "Technologie de la fibre optique (monomode, multimode)",
      "Préparation des câbles et soudure de fibre par fusion optique",
      "Mesures et détection de coupures par réflectomètre OTDR",
      "Installation de faisceaux hertziens et antennes de transmission",
      "Configuration de standard téléphonique IP (Asterisk / VoIP)"
    ],
    skills: [
      "Réaliser une soudure de fibre optique avec perte inférieure à 0.02 dB",
      "Localiser une cassure de fibre avec un réflectomètre",
      "Pointer une antenne de liaison radio avec précision",
      "Installer des téléphones IP d'entreprise configurés"
    ],
    opportunities: [
      "Technicien fibre optique chez les opérateurs ou sous-traitants",
      "Technicien de maintenance télécoms et pylônes",
      "Monteur-câbleur réseaux de transmission",
      "Installateur de téléphonie d'entreprise VoIP"
    ]
  },
  {
    id: "testeur-intrusion",
    name: "Testeur d’intrusion (cybersécurité)",
    filiere: "Informatique, Digital et Communication",
    subCategory: "Cybersécurité Offensive & Défensive",
    description: "Recherche éthique de vulnérabilités, tests de pénétration de réseaux et sites web, audits de sécurité et protection contre le piratage.",
    longDescription: "Devenez un hacker éthique en 12 mois : prise en main de Kali Linux, scan de ports avec Nmap, exploitation de failles web (injections SQL, XSS) avec Burp Suite et Metasploit, piratage de mots de passe, sensibilisation au phishing et rédaction de rapports de remédiation.",
    images: [
      "/images/vitrine/TeIn/img_1.jpeg",
      "/images/vitrine/TeIn/img_2.jpeg",
      "/images/vitrine/TeIn/img_3.jpeg",
      "/images/vitrine/TeIn/img_4.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "BEPC / Probatoire / BAC / Notions solides en informatique",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "185 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Fondamentaux de la sécurité offensive et éthique légale",
      "Prise en main de l'environnement Kali Linux et scripts Bash/Python",
      "Reconnaissance et cartographie des cibles avec Nmap et Wireshark",
      "Attaques sur applications web (Top 10 OWASP : SQLi, XSS, CSRF)",
      "Tests d'intrusion sur réseaux locaux et systèmes avec Metasploit",
      "Rédaction de rapports d'audit et recommandations de sécurité"
    ],
    skills: [
      "Identifier les failles de sécurité d'un site web ou réseau d'entreprise",
      "Exécuter des tests d'intrusion contrôlés sans détruire les données",
      "Sécuriser les serveurs contre les attaques externes courantes",
      "Produire un rapport de test de pénétration pour la direction"
    ],
    opportunities: [
      "Pentester junior / Consultant en cybersécurité",
      "Analyste sécurité des systèmes d'information",
      "Auditeur technique en sécurité informatique",
      "Responsable protection des données en entreprise"
    ]
  },
  {
    id: "conception-logiciels",
    name: "Conception de Logiciels",
    filiere: "Informatique, Digital et Communication",
    subCategory: "Développement & Programmation",
    description: "Développement d'applications de gestion web et bureau avec JavaScript, Python, React et bases de données SQL.",
    longDescription: "Une immersion accélérée pour créer des logiciels concrets qui résolvent des besoins locaux : développement d'une application de gestion de stock, facturation, authentification sécurisée, conception d'interfaces modernes et déploiement en ligne accessible sur PC et mobile.",
    images: [
      "/images/vitrine/CoLo/img_1.jpeg",
      "/images/vitrine/CoLo/img_2.jpeg",
      "/images/vitrine/CoLo/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "BEPC / Probatoire / BAC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "175 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Logique algorithmique et bases solides de programmation",
      "Création d'interfaces web dynamiques avec HTML5, Tailwind CSS et JavaScript",
      "Développement Back-end et gestion de base de données (Node.js & SQLite/MySQL)",
      "Conception d'une application complète de gestion commerciale (CRUD)",
      "Gestion des versions avec Git et GitHub",
      "Mise en production et hébergement cloud"
    ],
    skills: [
      "Concevoir et coder un logiciel de gestion pour entreprise",
      "Créer et manipuler une base de données relationnelle SQL",
      "Construire une interface utilisateur ergonomique et fluide",
      "Déboguer et mettre en ligne une application fonctionnelle"
    ],
    opportunities: [
      "Développeur d'applications web & mobile junior",
      "Programmeur de logiciels de gestion d'entreprise",
      "Développeur Front-end / Back-end freelance",
      "Créateur de solutions technologiques indépendant"
    ]
  },
  {
    id: "graphisme-production",
    name: "Graphisme de Production",
    filiere: "Informatique, Digital et Communication",
    subCategory: "Édition & Production Graphique",
    description: "Production de maquettes d'emballage (packaging), sérigraphie, flocage textile, découpe vinyle et impression grand format.",
    longDescription: "Passez du fichier informatique au produit physique fini ! Maîtrisez le traçage vectoriel pour machines de découpe (plotter), la préparation des typons de sérigraphie pour t-shirts, le flocage thermique, la création de packaging de produits et le calage des traceurs grand format.",
    images: [
      "/images/vitrine/GrPr/img_1.jpeg",
      "/images/vitrine/GrPr/img_2.jpeg",
      "/images/vitrine/GrPr/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "155 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Dessin vectoriel appliqué à la fabrication physique",
      "Préparation de fichiers pour découpe vinyle et traceurs",
      "Techniques d'impression sérigraphique et insolation des cadres",
      "Flocage textile à chaud et sublimation sur objets publicitaires",
      "Conception de maquettes de packaging et étiquettes produits",
      "Maintenance de premier niveau des machines de marquage"
    ],
    skills: [
      "Préparer un typon et imprimer en sérigraphie sur textile",
      "Piloter un plotter de découpe vinyle pour enseignes et vitrines",
      "Personnaliser des objets publicitaires par presse thermique",
      "Gérer la chaîne de production d'un atelier d'impression"
    ],
    opportunities: [
      "Opérateur en atelier de sérigraphie et marquage publicitaire",
      "Technicien de production graphique en imprimerie",
      "Créateur de marque de vêtements et objets personnalisés",
      "Entrepreneur gérant d'imprimerie numérique rapide"
    ]
  },

  // =========================================================================
  // 4. ADMINISTRATION, COMMERCE ET GESTION (7 Spécialités)
  // =========================================================================
  {
    id: "caissier",
    name: "Caissier",
    filiere: "Administration, Commerce et Gestion",
    subCategory: "Commerce & Gestion Financière",
    description: "Tenue de caisse enregistreuse, maniement d'espèces et devises, détection de faux billets, TPE et paiements mobiles.",
    longDescription: "Devenez un professionnel de caisse rapide et rigoureux : utilisation de logiciels de point de vente (POS), scannage de codes-barres, encaissement par carte bancaire, Orange Money, MTN MoMo, clôture journalière et arrêt de caisse sans écart.",
    images: [
      "/images/vitrine/Ca/img_1.jpeg",
      "/images/vitrine/Ca/img_2.jpeg",
      "/images/vitrine/Ca/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC / Probatoire",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "135 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Rôle et responsabilités professionnelles du caissier",
      "Utilisation des terminaux points de vente (TPV) et scanners",
      "Gestion des encaissements (Espèces, Chèques, Cartes, Mobile Money)",
      "Techniques de détection rapide des faux billets de banque",
      "Procédures d'ouverture, d'alimentation et de clôture de caisse",
      "Accueil chaleureux des clients et gestion du stress en affluence"
    ],
    skills: [
      "Encaisser rapidement et rendre la monnaie avec exactitude",
      "Reconnaître instantanément les billets de banque contrefaits",
      "Établir le journal de caisse et réconcilier les totaux",
      "Offrir un service client courtois et rassurant"
    ],
    opportunities: [
      "Caissier en supermarché et grande distribution",
      "Caissier d'agence de microfinance ou banque",
      "Opérateur de guichet de transfert d'argent (Express Union, etc.)",
      "Caissier de restaurant, pharmacie ou hôtel"
    ]
  },
  {
    id: "assistant-direction",
    name: "Assistant de Direction",
    filiere: "Administration, Commerce et Gestion",
    subCategory: "Assistanat de Direction",
    description: "Organisation d'agendas complexes, accueil de délégations, rédaction de comptes-rendus de réunions et gestion confidentielle.",
    longDescription: "Véritable bras droit des dirigeants : maîtrise de la correspondance d'affaires, planification de conseils d'administration, organisation de voyages d'affaires, gestion des priorités du directeur et coordination fluide des services de l'entreprise.",
    images: [
      "/images/vitrine/AsDi/img_1.jpeg",
      "/images/vitrine/AsDi/img_2.jpeg",
      "/images/vitrine/AsDi/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "BEPC / Probatoire / BAC / BAC+2",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "160 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Posture professionnelle, discrétion et protocole managérial",
      "Rédaction administrative de haut niveau (Lettres, Notes de service, PV)",
      "Gestion d'agendas électroniques partagés et filtrage des appels",
      "Organisation d'événements d'entreprise, séminaires et voyages",
      "Classement numérique et archivage sécurisé des dossiers",
      "Maîtrise des outils collaboratifs (Google Workspace, Office 365, Teams)"
    ],
    skills: [
      "Rédiger avec une orthographe et une syntaxe parfaites",
      "Gérer l'emploi du temps d'un directeur sans chevauchement",
      "Préparer et animer le suivi des décisions de réunions",
      "Représenter l'entreprise avec élégance et professionnalisme"
    ],
    opportunities: [
      "Assistant(e) de direction générale en grande entreprise",
      "Collaborateur de cabinet d'avocats ou notaire",
      "Secrétaire général(e) d'organisation ou ONG",
      "Coordonnateur administratif de projet"
    ]
  },
  {
    id: "secretariat-comptable",
    name: "Secrétariat Comptable",
    filiere: "Administration, Commerce et Gestion",
    subCategory: "Comptabilité & Secrétariat",
    description: "Tenue des pièces comptables, facturation clients, relance des impayés, rapprochements bancaires et paie du personnel.",
    longDescription: "La double compétence la plus recherchée en PME : secrétariat administratif rigoureux couplé à la saisie des écritures comptables, déclarations fiscales mensuelles (TVA, CNPS) et suivi rigoureux des règlements fournisseurs et clients.",
    images: [
      "/images/vitrine/SeCo/img_1.jpeg",
      "/images/vitrine/SeCo/img_2.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "BEPC / Probatoire / BAC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "155 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Principes fondamentaux de la comptabilité générale (Plan OHADA révisé)",
      "Établissement et contrôle des factures d'achats et de ventes",
      "Saisie des journaux comptables sur logiciel spécialisé",
      "Rapprochements bancaires et état de trésorerie quotidien",
      "Calcul des salaires, fiches de paie et cotisations CNPS",
      "Classement, archivage et correspondance comptable"
    ],
    skills: [
      "Saisir les opérations courantes selon le système comptable OHADA",
      "Effectuer un rapprochement bancaire sans écart",
      "Éditer les fiches de paie et calculer les déclarations sociales",
      "Gérer la trésorerie et la facturation avec rigueur"
    ],
    opportunities: [
      "Secrétaire comptable en PME / PMI",
      "Assistant comptable en cabinet d'expertise comptable",
      "Gestionnaire de facturation et recouvrement",
      "Comptable unique en petite structure commerciale"
    ]
  },
  {
    id: "secretariat-bureautique-bilingue",
    name: "Secrétariat Bureautique Bilingue",
    filiere: "Administration, Commerce et Gestion",
    subCategory: "Secrétariat & Langues",
    description: "Secrétariat moderne en français et anglais, traduction de courriers d'affaires, accueil de partenaires internationaux.",
    longDescription: "Indispensable dans le contexte bilingue camerounais et international : saisie rapide au clavier, rédaction impeccable en français et anglais, traduction immédiate de courriers commerciaux, gestion des appels téléphoniques anglophones et bureautique avancée.",
    images: [
      "/images/vitrine/SeBuBi/img_1.jpeg",
      "/images/vitrine/SeBuBi/img_2.jpeg",
      "/images/vitrine/SeBuBi/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "BEPC / Probatoire / BAC / Notions d'anglais",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "155 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "English Business Communication & Correspondence",
      "Dactylographie et saisie rapide au clavier (40+ mots/minute)",
      "Traduction pratique de documents administratifs et commerciaux",
      "Maîtrise avancée de Microsoft Word (mise en page bilingue, publipostage)",
      "Microsoft Excel pour tableaux de bord et suivis de dossiers",
      "Accueil physique et téléphonique de clients internationaux"
    ],
    skills: [
      "Rédiger des courriers d'affaires fluides en français et anglais",
      "Tenir une conversation téléphonique professionnelle bilingue",
      "Mettre en page des rapports d'activité impeccables",
      "Servir d'interface efficace entre interlocuteurs francophones et anglophones"
    ],
    opportunities: [
      "Secrétaire bilingue en multinationale ou ambassade",
      "Assistant(e) de direction bilingue en cabinet d'audit",
      "Agent d'accueil et relations publiques en hôtellerie de luxe",
      "Traducteur/rédacteur administratif bilingue"
    ]
  },
  {
    id: "televendeur",
    name: "Télévendeur",
    filiere: "Administration, Commerce et Gestion",
    subCategory: "Commerce & Centres d'Appels",
    description: "Prospection commerciale téléphonique, traitement des objections, négociation de vente et fidélisation client à distance.",
    longDescription: "Un métier qui recrute en continu dans les centres d'appels et entreprises commerciales : techniques de téléprospection, argumentaire de vente percutant (méthode CAB), sourire téléphonique, utilisation de logiciels de relation client (CRM) et atteinte des objectifs commerciaux.",
    images: [
      "/images/vitrine/TeVe/img_1.jpeg",
      "/images/vitrine/TeVe/img_2.jpeg",
      "/images/vitrine/TeVe/img_3.jpeg",
      "/images/vitrine/TeVe/img_4.jpeg",
      "/images/vitrine/TeVe/img_5.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / Bonne élocution / Aisance orale",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "140 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Techniques de communication vocale et accroche téléphonique",
      "Structure d'un entretien de vente par téléphone (Méthode AIDA)",
      "Traitement des objections et techniques de closing immédiat",
      "Prise en main des casques et logiciels CRM de centre d'appels",
      "Service après-vente, fidélisation et gestion des clients mécontents",
      "Jeux de rôles intensifs et simulation d'appels réels"
    ],
    skills: [
      "Capter l'attention d'un prospect dès les 10 premières secondes",
      "Transformer des objections en arguments d'achat solides",
      "Conclure des ventes par téléphone avec aisance",
      "Atteindre et dépasser les objectifs commerciaux fixés"
    ],
    opportunities: [
      "Télévendeur / Téléconseiller en centre d'appels (Call Center)",
      "Commercial sédentaire en entreprise de services",
      "Conseiller clientèle à distance pour opérateurs télécoms",
      "Agent de prospection commerciale en PME"
    ]
  },
  {
    id: "secretariat-bureautique",
    name: "Secrétariat Bureautique",
    filiere: "Administration, Commerce et Gestion",
    subCategory: "Secrétariat & Bureautique",
    description: "Dactylographie à 10 doigts, maîtrise complète de Word, Excel, PowerPoint, gestion du courrier et accueil du public.",
    longDescription: "Le classique indispensable de toute organisation : apprenez la saisie rapide et sans faute, la création de tableaux et graphiques sur Excel, la mise en forme de présentations percutantes, la gestion du courrier physique et électronique et le standard téléphonique.",
    images: [
      "/images/vitrine/SeBu/img_1.jpeg",
      "/images/vitrine/SeBu/img_2.jpeg",
      "/images/vitrine/SeBu/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "Tout niveau / CEP / BEPC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "140 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Dactylographie tactile à l'aveugle (Vitesse et précision)",
      "Microsoft Word complet : mise en page, styles, tableaux, publipostage",
      "Microsoft Excel : formules de calcul, fonctions usuelles, graphiques",
      "Microsoft PowerPoint : conception de diaporamas percutants",
      "Gestion de la boîte email professionnelle et de l'agenda",
      "Réception, enregistrement et classement du courrier d'entreprise"
    ],
    skills: [
      "Taper rapidement des documents administratifs impeccables",
      "Concevoir des tableaux de calculs automatiques sous Excel",
      "Organiser un bureau et classer les dossiers avec méthode",
      "Accueillir les visiteurs avec amabilité et professionnalisme"
    ],
    opportunities: [
      "Secrétaire bureautique dans tous secteurs d'activités",
      "Opératrice de saisie en entreprise ou administration",
      "Agent d'accueil et d'orientation du public",
      "Secrétaire d'école, clinique ou cabinet médical"
    ]
  },
  {
    id: "comptabilite-informatisee-gestion",
    name: "Comptabilité Informatisée et Gestion",
    filiere: "Administration, Commerce et Gestion",
    subCategory: "Gestion Comptable Informatisée",
    description: "Pratique sur logiciels comptables (Sage Saari Compta), bilan, compte de résultat, gestion de trésorerie et fiscalité.",
    longDescription: "Maîtrisez la gestion financière moderne sur ordinateur : paramétrage de dossiers comptables sous Sage Saari, passation des écritures de clôture, balance des comptes, déclarations fiscales DGI Cameroun et tableaux de bord financiers sur Excel avancé.",
    images: [
      "/images/vitrine/CoInGe/img_1.jpeg",
      "/images/vitrine/CoInGe/img_2.jpeg",
      "/images/vitrine/CoInGe/img_3.jpeg"
    ],
    duration: "12 Mois",
    levelRequired: "BEPC / Probatoire / BAC",
    studyRhythm: "Cours du jour & Cours du soir",
    practicePercent: 80,
    theoryPercent: 20,
    tuitionFee: "165 000 FCFA (payable en 2 tranches)",
    certification: "Certificat Professionnel DQP / CQP homologué MINEFOP",
    modules: [
      "Normes comptables OHADA révisées appliquées aux entreprises",
      "Prise en main et paramétrage du logiciel Sage Saari Comptabilité",
      "Saisie des journaux d'achats, ventes, banque et opérations diverses",
      "Élaboration des balances, grand livre et états financiers de fin d'exercice",
      "Fiscalité pratique des PME (Acomptes d'impôt, TVA, DIPE, DSF)",
      "Modélisation de tableaux de bord financiers sous Microsoft Excel"
    ],
    skills: [
      "Tenir la comptabilité complète d'une PME sur logiciel Sage",
      "Établir les déclarations fiscales et sociales camerounaises",
      "Contrôler la trésorerie et éditer les états de synthèse",
      "Analyser les coûts et conseiller la direction sur la gestion financière"
    ],
    opportunities: [
      "Comptable d'entreprise / Chargé de comptabilité",
      "Collaborateur en cabinet comptable et fiscal",
      "Gestionnaire de trésorerie et de paie",
      "Conseiller en gestion comptable pour PME"
    ]
  }
];

export function enrichSpecialty(item: SpecialtyItem): Required<SpecialtyItem> {
  const defaultRhythm = "Cours du jour (8h30 - 13h30) & Cours du soir (17h30 - 20h30)";
  const defaultCertification = "Certificat Professionnel DQP / CQP sous tutelle du MINEFOP";

  const canonical = defaultSpecialties.find(s => s.id === item.id);
  const canonicalImages = canonical && canonical.images && canonical.images.length > 0 ? canonical.images : null;
  const imagesToUse = (item.images && item.images.length > 0 && item.images[0].startsWith('/images/vitrine/'))
    ? item.images
    : (canonicalImages || (item.images && item.images.length > 0 ? item.images : photoPool.informatique));

  return {
    id: item.id,
    name: item.name,
    filiere: item.filiere,
    subCategory: item.subCategory,
    description: item.description,
    longDescription: item.longDescription,
    images: imagesToUse,
    duration: "12 Mois",
    levelRequired: item.levelRequired || "Tout niveau / CEP / BEPC / BAC",
    modules: item.modules && item.modules.length > 0 ? item.modules : [
      "Fondamentaux et sécurité professionnelle en atelier",
      "Pratique intensive des gestes techniques clés (80% pratique)",
      "Études de cas réels et simulations de chantiers / projets",
      "Utilisation des outillages et technologies de dernière génération",
      "Contrôle qualité, finitions et respect des normes professionnelles",
      "Immersion professionnelle et préparation à l'insertion immédiate"
    ],
    skills: item.skills && item.skills.length > 0 ? item.skills : [
      "Maîtriser les gestes professionnels indispensables du métier",
      "Utiliser les outils et équipements modernes en toute sécurité",
      "Réaliser des interventions conformes aux standards du marché",
      "Travailler avec rigueur, rapidité et autonomie sur le terrain"
    ],
    opportunities: item.opportunities && item.opportunities.length > 0 ? item.opportunities : [
      "Technicien qualifié en entreprise ou industrie",
      "Professionnel indépendant à son propre compte",
      "Chef d'équipe ou responsable technique d'atelier",
      "Collaborateur de confiance en PME / PMI"
    ],
    tuitionFee: item.tuitionFee || "150 000 FCFA (payable en 2 tranches)",
    certification: item.certification || defaultCertification,
    studyRhythm: item.studyRhythm || defaultRhythm,
    practicePercent: item.practicePercent || 80,
    theoryPercent: item.theoryPercent || 20
  };
}
