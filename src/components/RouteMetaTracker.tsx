import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface MetaConfig {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  section?: string;
  robots?: string;
}

const DEFAULT_BANNER = 'https://cfp-itmc.com/banner-og.png';
const BASE_URL = 'https://cfp-itmc.com';

const ROUTE_META_MAP: Record<string, MetaConfig> = {
  // --- Administrative Portal Routes ---
  '/dashboard': {
    title: "Tableau de Bord Administratif & Direction | CFP-ITMC Douala Logpom",
    description: "Espace de supervision administrative, gestion académique, suivi des filières DQP et pilotage stratégique de l'Institut CFP-ITMC Douala Logpom.",
    ogTitle: "Portail Administratif & Direction Générale — CFP-ITMC Douala",
    ogDescription: "Plateforme de gestion intégrée : effectifs étudiants, corps professoral, admissions DQP MINEFOP et indicateurs académiques.",
    ogType: "website",
    section: "Administration",
    twitterTitle: "Portail Administration & Direction CFP-ITMC",
    twitterDescription: "Supervision académique et administrative du CFP-ITMC Douala Logpom (Agréé MINEFOP).",
  },
  '/dashboard/news': {
    title: "Gestion des Actualités & Publications Officielles | CFP-ITMC Administration",
    description: "Publication et diffusion des communiqués officiels, sessions d'examens DQP, journées portes ouvertes et événements du campus CFP-ITMC.",
    ogTitle: "Actualités & Événements Officiels — CFP-ITMC Administration",
    ogDescription: "Centre de communication institutionnelle et publications officielles du campus CFP-ITMC Douala.",
    section: "Communication & Actualités",
  },
  '/dashboard/students': {
    title: "Gestion des Effectifs Étudiants & Dossiers DQP | CFP-ITMC Administration",
    description: "Suivi des inscriptions, dossiers scolaires, attestations de scolarité, assiduité et progression des apprenants aux diplômes d'État DQP.",
    ogTitle: "Gestion des Étudiants & Apprenants DQP — CFP-ITMC Administration",
    ogDescription: "Dossiers d'étudiants, relevés académiques et suivi des 35 filières professionnelles certifiées MINEFOP.",
    section: "Scolarité",
  },
  '/dashboard/registrations': {
    title: "Gestion des Admissions & Préinscriptions DQP | CFP-ITMC Administration",
    description: "Traitement des candidatures en ligne, validation des dossiers d'admission et inscriptions aux filières d'excellence du CFP-ITMC Douala.",
    ogTitle: "Admissions & Inscriptions DQP — CFP-ITMC Administration",
    ogDescription: "Portail d'enregistrement et d'admission des nouveaux apprenants pour l'année académique à Douala Logpom.",
    section: "Admissions",
  },
  '/dashboard/teachers': {
    title: "Corps Professoral & Gestion des Formateurs | CFP-ITMC Administration",
    description: "Répertoire des formateurs certifiés, affectations pédagogiques, spécialités techniques et suivi des vacations au CFP-ITMC Douala.",
    ogTitle: "Corps Enseignant & Formateurs Agréés — CFP-ITMC Administration",
    ogDescription: "Gestion de l'équipe pédagogique d'élite, ingénieurs-formateurs et experts métiers du Centre.",
    section: "Pédagogie & RH",
  },
  '/dashboard/courses': {
    title: "Filières, Modules & Référentiels DQP | CFP-ITMC Administration",
    description: "Programmes académiques certifiés MINEFOP, syllabus de cours, unités de formation et référentiels de compétences professionnelles.",
    ogTitle: "Offre de Formation & Référentiels DQP — CFP-ITMC Administration",
    ogDescription: "39 filières professionnelles d'élite : Génie Logiciel, Réseaux, Cyber-sécurité, BTP, Santé et Management.",
    section: "Programmes Académiques",
  },
  '/dashboard/classes': {
    title: "Gestion des Salles & Promotions Académiques | CFP-ITMC Administration",
    description: "Organisation des cohortes d'étudiants, attribution des salles de cours, laboratoires informatiques et gestion des promotions certifiantes.",
    ogTitle: "Classes & Promotions Académiques — CFP-ITMC Administration",
    ogDescription: "Gestion logistique et organisationnelle des promotions DQP du campus CFP-ITMC Douala Logpom.",
    section: "Salles & Promotions",
  },
  '/dashboard/schedule': {
    title: "Planning Général & Emplois du Temps Campus | CFP-ITMC Administration",
    description: "Planification des créneaux de cours, ateliers pratiques en laboratoire, soutenances de projets et examens officiels du campus.",
    ogTitle: "Emplois du Temps & Planning Campus — CFP-ITMC Administration",
    ogDescription: "Planning hebdomadaire interactif des cours magistraux et travaux pratiques à Douala Logpom.",
    section: "Planning",
  },
  '/dashboard/learning': {
    title: "Ressources Pédagogiques & E-Learning | CFP-ITMC Administration",
    description: "Plateforme documentaire, supports de cours numériques, bibliothèques techniques et ressources d'apprentissage en ligne.",
    ogTitle: "E-Learning & Ressources Numériques — CFP-ITMC Administration",
    ogDescription: "Centre de ressources didactiques numériques et e-learning pour les apprenants et formateurs de l'Institut.",
    section: "E-Learning",
  },
  '/dashboard/ai': {
    title: "Assistant IA & Ingénierie Pédagogique | CFP-ITMC Administration",
    description: "Outils d'Intelligence Artificielle pour la conception de cours, génération de quiz, syllabus conformes MINEFOP et assistance académique.",
    ogTitle: "Assistant IA Pédagogique — CFP-ITMC Administration",
    ogDescription: "Intelligence Artificielle au service de l'excellence pédagogique et de la formation professionnelle à Douala.",
    section: "Innovation & IA",
  },
  '/dashboard/settings': {
    title: "Paramètres Institutionnels & Année Académique | CFP-ITMC Administration",
    description: "Configuration du système, gestion des années académiques, rôles de sécurité RBAC, politiques de chiffrement et audit.",
    ogTitle: "Paramètres & Sécurité du Système — CFP-ITMC Administration",
    ogDescription: "Centre de configuration et sécurité institutionnelle de l'Institut CFP-ITMC.",
    section: "Configuration",
  },

  // --- Teacher Portal Routes ---
  '/teacher': {
    title: "Espace Formateurs & Corps Professoral | CFP-ITMC Douala",
    description: "Portail sécurisé des formateurs CFP-ITMC : gestion des cours, suivi des présences, saisie des notes et accompagnement des étudiants DQP.",
    ogTitle: "Portail Formateurs & Enseignants — CFP-ITMC Douala",
    ogDescription: "Espace professionnel dédié aux formateurs : cours, évaluations continues, assiduité et progression pédagogique.",
    ogType: "website",
    section: "Espace Formateur",
    twitterTitle: "Espace Enseignants & Formateurs CFP-ITMC",
    twitterDescription: "Plateforme pédagogique des formateurs certifiés de l'Institut CFP-ITMC Douala Logpom.",
  },
  '/teacher/classes': {
    title: "Mes Classes & Effectifs d'Étudiants | Espace Enseignant CFP-ITMC",
    description: "Consultation des listes d'élèves, trombinoscope, feuilles de présence et assiduité par filière et promotion à Douala Logpom.",
    ogTitle: "Mes Classes & Promotions — Espace Formateur CFP-ITMC",
    ogDescription: "Suivi des promotions et listes d'apprenants inscrits aux modules d'enseignement DQP.",
    section: "Classes Enseignant",
  },
  '/teacher/modules': {
    title: "Modules de Cours & Supports Pédagogiques | Espace Enseignant CFP-ITMC",
    description: "Gestion des unités d'enseignement, dépôt des polycopiés, travaux dirigés et suivi de l'avancement des programmes DQP MINEFOP.",
    ogTitle: "Modules & Supports de Cours — Espace Formateur CFP-ITMC",
    ogDescription: "Gestion des contenus pédagogiques et travaux pratiques pour la préparation au Diplôme de Qualification Professionnelle.",
    section: "Modules de Cours",
  },
  '/teacher/compositions': {
    title: "Évaluations, Notes & Relevés DQP | Espace Enseignant CFP-ITMC",
    description: "Saisie et calcul des notes continues, examens blancs, procès-verbaux de contrôle continu et évaluations finales d'État.",
    ogTitle: "Notes & Évaluations des Apprenants — Espace Formateur CFP-ITMC",
    ogDescription: "Saisie sécurisée des notes d'examens et relevés de compétences professionnelles des étudiants.",
    section: "Évaluations",
  },
  '/teacher/students': {
    title: "Suivi Pédagogique des Apprenants | Espace Enseignant CFP-ITMC",
    description: "Évaluation continue des compétences professionnelles, assiduité, notes et accompagnement individualisé des étudiants DQP.",
    ogTitle: "Suivi Pédagogique des Étudiants — Espace Formateur CFP-ITMC",
    ogDescription: "Accompagnement individualisé et progression des apprenants dans les filières techniques et tertiaires.",
    section: "Suivi Étudiants",
  },
  '/teacher/schedule': {
    title: "Emploi du Temps Enseignant & Horaires | Espace Enseignant CFP-ITMC",
    description: "Calendrier des séances de cours, laboratoires d'ingénierie informatique, ateliers BTP et interventions de la semaine à Logpom.",
    ogTitle: "Emploi du Temps Formateur — Espace Enseignant CFP-ITMC",
    ogDescription: "Planning personnel des cours et interventions pédagogiques de l'enseignant.",
    section: "Planning Formateur",
  },
  '/teacher/ai': {
    title: "Générateur de Cours & IA Pédagogique | Espace Enseignant CFP-ITMC",
    description: "Assistant d'ingénierie pédagogique par IA pour concevoir des plans de cours, fiches de TD, QCM et études de cas pratiques d'excellence.",
    ogTitle: "Générateur IA de Contenus Pédagogiques — Espace Formateur CFP-ITMC",
    ogDescription: "Conception accélérée de cours et d'exercices pratiques certifiés conformes au référentiel MINEFOP.",
    section: "Outils IA Enseignant",
  },
  '/teacher/settings': {
    title: "Profil & Paramètres de Sécurité | Espace Enseignant CFP-ITMC",
    description: "Gestion du compte formateur, mise à jour des coordonnées professionnelles et options de sécurité de session.",
    ogTitle: "Paramètres du Profil Enseignant — CFP-ITMC",
    ogDescription: "Paramètres du compte formateur et options de sécurité sur la plateforme CFP-ITMC.",
    section: "Profil Enseignant",
  },

  // --- Auth / Login Portals ---
  '/login': {
    title: "Portail d'Authentification Sécurisé | CFP-ITMC Douala Logpom",
    description: "Accès chiffré aux espaces administratifs, formateurs, secrétariat et étudiants de l'Institut de Formation Professionnelle CFP-ITMC Douala.",
    ogTitle: "Portail d'Accès Sécurisé — CFP-ITMC Douala Logpom",
    ogDescription: "Connexion aux espaces numériques de travail : Direction, Secrétariat, Enseignants et Étudiants.",
    section: "Authentification",
  },
  '/login/admin': {
    title: "Connexion Espace Direction & Administration | CFP-ITMC Douala",
    description: "Accès sécurisé pour la direction générale, les coordinateurs pédagogiques et les administrateurs du CFP-ITMC Douala.",
    ogTitle: "Connexion Espace Administration — CFP-ITMC Douala",
    ogDescription: "Portail d'accès réservé à la direction générale et à l'administration de l'Institut.",
    section: "Authentification Admin",
  },
  '/login/teacher': {
    title: "Connexion Espace Enseignants & Formateurs | CFP-ITMC Douala",
    description: "Accès sécurisé pour les formateurs et enseignants de l'Institut CFP-ITMC Douala Logpom.",
    ogTitle: "Connexion Espace Formateurs — CFP-ITMC Douala",
    ogDescription: "Portail d'accès pour les enseignants et formateurs certifiés de l'CFP-ITMC.",
    section: "Authentification Enseignant",
  },
  '/login/student': {
    title: "Connexion Espace Étudiants & Apprenants | CFP-ITMC Douala",
    description: "Accès à l'espace étudiant CFP-ITMC : consultation des notes, emplois du temps, cours et attestations DQP.",
    ogTitle: "Connexion Espace Étudiants — CFP-ITMC Douala",
    ogDescription: "Portail de connexion pour les étudiants et candidats aux diplômes DQP.",
    section: "Authentification Étudiant",
  },
  '/login/secretary': {
    title: "Connexion Secrétariat & Scolarité | CFP-ITMC Douala",
    description: "Accès pour les secrétaires de scolarité, gestionnaires des inscriptions et accueil du campus de Douala Logpom.",
    ogTitle: "Connexion Secrétariat Scolaire — CFP-ITMC Douala",
    ogDescription: "Portail de gestion des inscriptions et de la scolarité de l'Institut CFP-ITMC.",
    section: "Authentification Secrétariat",
  },

  // --- Student Portal Routes ---
  '/student': {
    title: "Espace Étudiant & Portail Académique | CFP-ITMC Douala",
    description: "Tableau de bord de l'apprenant : suivi des modules DQP, calendrier des cours, bulletins de notes et ressources pédagogiques.",
    ogTitle: "Portail Étudiant — CFP-ITMC Douala Logpom",
    ogDescription: "Espace numérique de travail pour les étudiants en formation professionnelle certifiante DQP.",
    section: "Espace Étudiant",
  },
  '/student/modules': {
    title: "Mes Modules & Cours en Ligne | Espace Étudiant CFP-ITMC",
    description: "Accédez aux supports de cours, travaux pratiques et fiches de révision pour la validation du DQP.",
    ogTitle: "Cours & Modules — Espace Étudiant CFP-ITMC",
    ogDescription: "Supports didactiques et ressources de formation professionnelle.",
    section: "Cours Étudiant",
  },
  '/student/schedule': {
    title: "Mon Emploi du Temps & Horaires | Espace Étudiant CFP-ITMC",
    description: "Consultez le planning hebdomadaire de vos cours, ateliers en laboratoire et sessions de révision.",
    ogTitle: "Emploi du Temps Étudiant — CFP-ITMC",
    ogDescription: "Calendrier des cours pour les promotions du CFP-ITMC Douala Logpom.",
    section: "Planning Étudiant",
  },
  '/student/grades': {
    title: "Mes Notes, Bulletins & Relevés DQP | Espace Étudiant CFP-ITMC",
    description: "Consultation des notes de contrôle continu, moyennes générales et bulletins académiques officiels.",
    ogTitle: "Notes & Bulletins de Compétences — CFP-ITMC",
    ogDescription: "Relevé des notes et évaluation des compétences professionnelles.",
    section: "Notes Étudiant",
  },
  '/student/settings': {
    title: "Paramètres du Compte Étudiant | CFP-ITMC Douala",
    description: "Mise à jour des informations personnelles, mot de passe et préférences de compte.",
    ogTitle: "Mon Compte Étudiant — CFP-ITMC",
    ogDescription: "Gestion du profil apprenant sur la plateforme CFP-ITMC.",
    section: "Profil Étudiant",
  },

  // --- Public Routes ---
  '/': {
    title: "CFP-ITMC Douala Logpom | Centre de Formation Professionnelle Agréé MINEFOP - Diplômes DQP & CQP",
    description: "CFP-ITMC (Institut ITMC) à Douala Logpom (Carrefour Bassong) : 35 formations professionnelles diplômantes DQP agréées MINEFOP en Génie Logiciel, Réseaux, Cyber-sécurité, BTP, Industrie, Santé et Gestion au Cameroun.",
    ogTitle: "CFP-ITMC Douala Logpom | Formations Professionnelles d'Excellence Agréées MINEFOP",
    ogDescription: "35 filières certifiées sanctionnées par le Diplôme de Qualification Professionnelle (DQP) sous tutelle du MINEFOP à Douala Logpom.",
    section: "Accueil",
  },
  '/formations': {
    title: "35 Formations Professionnelles & Diplômes DQP MINEFOP | CFP-ITMC Douala",
    description: "Consultez le catalogue complet des 35 filières certifiées MINEFOP : Informatique & Digital, Technologies Industrielles, BTP, Santé et Gestion à Douala Logpom.",
    ogTitle: "Catalogue des 35 Formations Certifiantes DQP — CFP-ITMC Douala",
    ogDescription: "Formations accélérées d'excellence avec stages garantis et insertion professionnelle au Cameroun.",
    section: "Formations",
  },
  '/a-propos': {
    title: "À Propos du CFP-ITMC Douala | Institut Agréé MINEFOP Logpom",
    description: "Découvrez notre histoire, nos agréments officiels MINEFOP, nos infrastructures de pointe et notre vision de la formation professionnelle d'élite au Cameroun.",
    ogTitle: "À Propos du Centre CFP-ITMC Douala Logpom",
    ogDescription: "Centre de référence en formation professionnelle pratique et insertion des jeunes au Cameroun.",
    section: "À Propos",
  },
  '/actualites': {
    title: "Actualités, Événements & Rentrée Académique | CFP-ITMC Douala",
    description: "Restez informés des dernières actualités du campus, sessions d'examens DQP, séminaires technologiques et dates de rentrée au CFP-ITMC.",
    ogTitle: "Actualités & Événements — CFP-ITMC Douala Logpom",
    ogDescription: "Toute l'actualité officielle et les communiqués du campus CFP-ITMC.",
    section: "Actualités",
  },
  '/contact': {
    title: "Contact & Localisation Campus Logpom Bassong | CFP-ITMC Douala",
    description: "Contactez le CFP-ITMC à Douala Logpom (Carrefour Bassong). Téléphone, WhatsApp (+237 683 66 32 22 / +237 688 05 20 94), email et plan d'accès direct au campus.",
    ogTitle: "Contact & Inscriptions — CFP-ITMC Douala Logpom",
    ogDescription: "Prenez contact avec notre équipe d'orientation pour votre inscription aux diplômes DQP.",
    section: "Contact",
  }
};

/**
 * Sets or creates a meta tag in document.head
 */
function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Sets or creates a link tag in document.head
 */
function setLinkTag(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export default function RouteMetaTracker() {
  const location = useLocation();

  useEffect(() => {
    // Ensure the page always starts at the top when navigating
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const pathname = location.pathname;
    const currentUrl = `${BASE_URL}${pathname}`;
    
    // Find matching meta config or construct dynamic fallback
    let meta = ROUTE_META_MAP[pathname];
    
    if (!meta) {
      if (pathname.startsWith('/dashboard')) {
        meta = {
          title: "Portail Administratif & Direction | CFP-ITMC Douala",
          description: "Espace de supervision administrative, gestion académique et pilotage du CFP-ITMC Douala Logpom.",
          ogTitle: "Portail Administratif — CFP-ITMC Douala",
          ogDescription: "Gestion administrative et académique du CFP-ITMC Douala Logpom.",
          section: "Administration"
        };
      } else if (pathname.startsWith('/teacher')) {
        meta = {
          title: "Espace Enseignants & Formateurs | CFP-ITMC Douala",
          description: "Portail pédagogique et académique des formateurs certifiés du CFP-ITMC Douala Logpom.",
          ogTitle: "Espace Formateurs — CFP-ITMC Douala",
          ogDescription: "Gestion des cours, notes et suivi des apprenants au CFP-ITMC.",
          section: "Formateurs"
        };
      } else if (pathname.startsWith('/student')) {
        meta = {
          title: "Espace Étudiant & Portail Académique | CFP-ITMC Douala",
          description: "Espace personnel de suivi des cours, notes et plannings pour les étudiants du CFP-ITMC Douala.",
          ogTitle: "Espace Étudiants — CFP-ITMC Douala",
          ogDescription: "Portail académique pour les apprenants du CFP-ITMC.",
          section: "Étudiants"
        };
      } else {
        meta = {
          title: "CFP-ITMC Douala Logpom | Centre de Formation Agréé MINEFOP - Diplôme DQP",
          description: "Centre de Formation Professionnelle CFP-ITMC à Douala Logpom. Formations certifiantes d'excellence au Cameroun.",
          ogTitle: "CFP-ITMC Douala Logpom | Centre de Formation Agréé MINEFOP",
          ogDescription: "Formations certifiées DQP MINEFOP en Technologies, BTP, Santé et Gestion à Douala.",
          section: "Général"
        };
      }
    }

    const title = meta.title;
    const description = meta.description;
    const ogTitle = meta.ogTitle || title;
    const ogDescription = meta.ogDescription || description;
    const ogImage = meta.ogImage || DEFAULT_BANNER;
    const twitterTitle = meta.twitterTitle || ogTitle;
    const twitterDescription = meta.twitterDescription || ogDescription;
    const twitterImage = meta.twitterImage || ogImage;
    const twitterCard = meta.twitterCard || 'summary_large_image';
    const section = meta.section || 'Éducation & Formation Professionnelle';

    // 1. Primary SEO Tags
    document.title = title;
    setMetaTag('name', 'title', title);
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'author', 'CFP-ITMC Douala');
    setMetaTag('name', 'robots', meta.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setLinkTag('canonical', currentUrl);

    // 2. Open Graph Tags (Facebook, WhatsApp, LinkedIn, Telegram, Discord previews)
    setMetaTag('property', 'og:site_name', 'CFP-ITMC Douala Logpom');
    setMetaTag('property', 'og:type', meta.ogType || 'website');
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:title', ogTitle);
    setMetaTag('property', 'og:description', ogDescription);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:image:secure_url', ogImage);
    setMetaTag('property', 'og:image:alt', `${title} - CFP-ITMC Douala Logpom`);
    setMetaTag('property', 'og:locale', 'fr_FR');
    setMetaTag('property', 'og:locale:alternate', 'fr_CM');
    setMetaTag('property', 'article:section', section);

    // 3. Twitter Card Tags (X / Twitter Preview)
    setMetaTag('name', 'twitter:card', twitterCard);
    setMetaTag('name', 'twitter:site', '@cfpitmc');
    setMetaTag('name', 'twitter:creator', '@cfpitmc');
    setMetaTag('name', 'twitter:url', currentUrl);
    setMetaTag('name', 'twitter:title', twitterTitle);
    setMetaTag('name', 'twitter:description', twitterDescription);
    setMetaTag('name', 'twitter:image', twitterImage);
    setMetaTag('name', 'twitter:image:alt', `${title} - CFP-ITMC`);
    setMetaTag('name', 'twitter:label1', 'Type de Portail');
    setMetaTag('name', 'twitter:data1', section);
    setMetaTag('name', 'twitter:label2', 'Campus & Ville');
    setMetaTag('name', 'twitter:data2', 'Douala Logpom, Cameroun');

    // Synchronize theme with route (vitrine is always light, dashboard respects stored theme)
    const isPublicVitrine = pathname === '/' || 
      pathname.startsWith('/a-propos') || 
      pathname.startsWith('/formations') || 
      pathname.startsWith('/actualites') || 
      pathname.startsWith('/contact');

    if (isPublicVitrine) {
      document.documentElement.classList.remove('dark');
    } else {
      const storedTheme = localStorage.getItem('itmc_admin_theme') || 'dark';
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (storedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [location.pathname]);

  return null;
}
