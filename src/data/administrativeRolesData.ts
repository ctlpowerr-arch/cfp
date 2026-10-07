/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Architecture RBAC - 14 Rôles Administratifs & Matrice des 50 Permissions Granulaires
 * Centre de Formation Professionnelle CFP-ITMC Douala
 */

export interface PermissionItem {
  code: string;
  label: string;
  category: string;
  categoryLabel: string;
  description: string;
}

export interface AdministrativeRole {
  code: string;
  title: string;
  shortTitle: string;
  department: string;
  description: string;
  badgeColor: string;
  defaultPermissions: string[];
}

// =========================================================================
// 10 CATÉGORIES & 50 PERMISSIONS GRANULAIRES
// =========================================================================
export const PERMISSION_CATEGORIES = [
  { id: 'students', label: 'Étudiants & Scolarité', icon: 'GraduationCap' },
  { id: 'registrations', label: 'Candidatures & Inscriptions', icon: 'FileText' },
  { id: 'teachers', label: 'Corps Enseignant & Pédagogie', icon: 'UserSquare2' },
  { id: 'schedule', label: 'Emplois du Temps & Salles', icon: 'Calendar' },
  { id: 'exams', label: 'Notes, Examens & Jurys', icon: 'FileSpreadsheet' },
  { id: 'caisse', label: 'Caisse, Facturation & Finances', icon: 'Wallet' },
  { id: 'hr', label: 'Ressources Humaines & Contrats', icon: 'Users' },
  { id: 'vitrine', label: 'Site Vitrine, Annonces & Événements', icon: 'Globe' },
  { id: 'elearning', label: 'Jeux Éducatifs & E-Learning', icon: 'Gamepad2' },
  { id: 'security', label: 'Sécurité, Audits & Paramètres', icon: 'ShieldCheck' }
];

export const ALL_PERMISSIONS: PermissionItem[] = [
  // 1. Étudiants & Scolarité (6 permissions)
  {
    code: 'perm_view_students_list',
    label: 'Consulter la liste des étudiants',
    category: 'students',
    categoryLabel: 'Étudiants & Scolarité',
    description: 'Accès en lecture à l\'annuaire des étudiants inscrits et promotions.'
  },
  {
    code: 'perm_view_student_dossier',
    label: 'Consulter les pièces du dossier numérique',
    category: 'students',
    categoryLabel: 'Étudiants & Scolarité',
    description: 'Visualisation des actes de naissance, CNI, diplômes et certificats.'
  },
  {
    code: 'perm_edit_student_info',
    label: 'Modifier les informations d\'un étudiant',
    category: 'students',
    categoryLabel: 'Étudiants & Scolarité',
    description: 'Mise à jour des coordonnées, tuteurs et affectation de filière.'
  },
  {
    code: 'perm_delete_student',
    label: 'Supprimer définitivement un étudiant',
    category: 'students',
    categoryLabel: 'Étudiants & Scolarité',
    description: 'Retrait irréversible d\'un dossier étudiant de la base de données.'
  },
  {
    code: 'perm_toggle_student_status',
    label: 'Activer / Désactiver un compte étudiant (Inactif)',
    category: 'students',
    categoryLabel: 'Étudiants & Scolarité',
    description: 'Suspendre ou réactiver l\'accès d\'un apprenant au portail étudiant.'
  },
  {
    code: 'perm_manage_matricules_minefop',
    label: 'Générer et attribuer les matricules MINEFOP',
    category: 'students',
    categoryLabel: 'Étudiants & Scolarité',
    description: 'Génération automatique par ordre alphabétique et modification de matricule.'
  },

  // 2. Candidatures & Inscriptions (5 permissions)
  {
    code: 'perm_view_registrations',
    label: 'Consulter les dossiers de pré-inscription',
    category: 'registrations',
    categoryLabel: 'Candidatures & Inscriptions',
    description: 'Accès au tableau des nouvelles candidatures déposées en ligne ou au guichet.'
  },
  {
    code: 'perm_validate_registrations',
    label: 'Valider et intégrer les candidats aux effectifs',
    category: 'registrations',
    categoryLabel: 'Candidatures & Inscriptions',
    description: 'Admission définitive du candidat et création automatique de son compte étudiant.'
  },
  {
    code: 'perm_reject_registrations',
    label: 'Rejeter une candidature',
    category: 'registrations',
    categoryLabel: 'Candidatures & Inscriptions',
    description: 'Marquer un dossier comme rejeté sans intégration aux effectifs.'
  },
  {
    code: 'perm_edit_registration_docs',
    label: 'Modifier / Téléverser les pièces jointes des candidats',
    category: 'registrations',
    categoryLabel: 'Candidatures & Inscriptions',
    description: 'Ajouter, remplacer ou supprimer un document du dossier de pré-inscription.'
  },
  {
    code: 'perm_print_certificat_scolarite',
    label: 'Délivrer et imprimer les Certificats de Scolarité',
    category: 'registrations',
    categoryLabel: 'Candidatures & Inscriptions',
    description: 'Génération des attestations officielles certifiées avec QR Code MINEFOP.'
  },

  // 3. Corps Enseignant & Pédagogie (5 permissions)
  {
    code: 'perm_view_teachers',
    label: 'Consulter le corps enseignant',
    category: 'teachers',
    categoryLabel: 'Corps Enseignant & Pédagogie',
    description: 'Accès au répertoire des professeurs, formateurs et vacataires.'
  },
  {
    code: 'perm_add_teacher',
    label: 'Recruter et inscrire un enseignant',
    category: 'teachers',
    categoryLabel: 'Corps Enseignant & Pédagogie',
    description: 'Création de la fiche formateur et attribution des modules DQP.'
  },
  {
    code: 'perm_edit_teacher',
    label: 'Modifier les attributions d\'un formateur',
    category: 'teachers',
    categoryLabel: 'Corps Enseignant & Pédagogie',
    description: 'Modification des coordonnées, spécialités et classes assignées.'
  },
  {
    code: 'perm_delete_teacher',
    label: 'Supprimer un enseignant du système',
    category: 'teachers',
    categoryLabel: 'Corps Enseignant & Pédagogie',
    description: 'Retrait d\'un compte enseignant et réaffectation de ses cours.'
  },
  {
    code: 'perm_manage_teacher_evaluations',
    label: 'Superviser l\'évaluation pédagogique des formateurs',
    category: 'teachers',
    categoryLabel: 'Corps Enseignant & Pédagogie',
    description: 'Audit de la qualité d\'enseignement et retours d\'expérience des apprenants.'
  },

  // 4. Emplois du Temps & Salles (5 permissions)
  {
    code: 'perm_view_schedules',
    label: 'Consulter l\'emploi du temps global',
    category: 'schedule',
    categoryLabel: 'Emplois du Temps & Salles',
    description: 'Accès à la grille horaire hebdomadaire de toutes les filières.'
  },
  {
    code: 'perm_create_schedule_slot',
    label: 'Programmer une séance de cours / TD / TP',
    category: 'schedule',
    categoryLabel: 'Emplois du Temps & Salles',
    description: 'Ajout d\'un créneau avec détection automatique des collisions de salle.'
  },
  {
    code: 'perm_edit_schedule_slot',
    label: 'Modifier un créneau horaire ou une salle',
    category: 'schedule',
    categoryLabel: 'Emplois du Temps & Salles',
    description: 'Ajustement des heures de cours ou permutation d\'enseignant.'
  },
  {
    code: 'perm_delete_schedule_slot',
    label: 'Annuler ou supprimer une séance de cours',
    category: 'schedule',
    categoryLabel: 'Emplois du Temps & Salles',
    description: 'Suppression d\'un cours avec notification instantanée aux étudiants.'
  },
  {
    code: 'perm_manage_classrooms',
    label: 'Gérer les salles de cours, ateliers & labos',
    category: 'schedule',
    categoryLabel: 'Emplois du Temps & Salles',
    description: 'Création, capacité et affectation des salles et ateliers techniques.'
  },

  // 5. Notes, Examens & Jurys (6 permissions)
  {
    code: 'perm_view_compositions',
    label: 'Consulter les évaluations et examens',
    category: 'exams',
    categoryLabel: 'Notes, Examens & Jurys',
    description: 'Accès au calendrier des examens continus, normales et rattrapages.'
  },
  {
    code: 'perm_create_composition',
    label: 'Créer une session d\'examen ou de composition',
    category: 'exams',
    categoryLabel: 'Notes, Examens & Jurys',
    description: 'Paramétrage des barèmes, coefficients et dates d\'évaluation.'
  },
  {
    code: 'perm_input_grades',
    label: 'Saisir et corriger les notes d\'examens',
    category: 'exams',
    categoryLabel: 'Notes, Examens & Jurys',
    description: 'Enregistrement des notes et calcul des moyennes semestrielles.'
  },
  {
    code: 'perm_publish_bulletins',
    label: 'Publier et débloquer les bulletins officiels',
    category: 'exams',
    categoryLabel: 'Notes, Examens & Jurys',
    description: 'Autorisation de consultation des résultats pour les étudiants et tuteurs.'
  },
  {
    code: 'perm_generate_transcripts_archive',
    label: 'Archiver et certifier les Relevés de Notes',
    category: 'exams',
    categoryLabel: 'Notes, Examens & Jurys',
    description: 'Édition des relevés avec sceau institutionnel et moyenne de promotion.'
  },
  {
    code: 'perm_manage_jurys',
    label: 'Constituer les jurys de délibération & concours',
    category: 'exams',
    categoryLabel: 'Notes, Examens & Jurys',
    description: 'Gestion des procès-verbaux de délibération MINEFOP et mentions.'
  },

  // 6. Caisse, Facturation & Finances (5 permissions)
  {
    code: 'perm_view_caisse',
    label: 'Consulter le journal de caisse et les soldes',
    category: 'caisse',
    categoryLabel: 'Caisse, Facturation & Finances',
    description: 'Accès au solde en temps réel et historique des encaissements.'
  },
  {
    code: 'perm_record_payment',
    label: 'Encaisser les frais de scolarité & acomptes',
    category: 'caisse',
    categoryLabel: 'Caisse, Facturation & Finances',
    description: 'Délivrance des reçus de paiement numérotés et lettrage comptable.'
  },
  {
    code: 'perm_edit_payment_records',
    label: 'Rectifier un versement en caisse',
    category: 'caisse',
    categoryLabel: 'Caisse, Facturation & Finances',
    description: 'Correction motivée d\'une écriture comptable avec journal d\'audit.'
  },
  {
    code: 'perm_export_financial_reports',
    label: 'Exporter les bilans financiers officiels',
    category: 'caisse',
    categoryLabel: 'Caisse, Facturation & Finances',
    description: 'Génération des états financiers pour la direction et commissaires aux comptes.'
  },
  {
    code: 'perm_manage_tuition_rates',
    label: 'Paramétrer la grille tarifaire des filières',
    category: 'caisse',
    categoryLabel: 'Caisse, Facturation & Finances',
    description: 'Configuration des pensions et échéanciers de paiement par spécialité.'
  },

  // 7. Ressources Humaines & Contrats (5 permissions)
  {
    code: 'perm_manage_staff',
    label: 'Créer et administrer le personnel administratif',
    category: 'hr',
    categoryLabel: 'Ressources Humaines & Contrats',
    description: 'Attribution des rôles et paramétrage des 50 permissions par utilisateur.'
  },
  {
    code: 'perm_view_staff_contracts',
    label: 'Consulter les contrats et fiches de poste',
    category: 'hr',
    categoryLabel: 'Ressources Humaines & Contrats',
    description: 'Accès aux dossiers professionnels du personnel permanent et vacataire.'
  },
  {
    code: 'perm_manage_teacher_payroll',
    label: 'Gérer les états d\'heures et vacations enseignants',
    category: 'hr',
    categoryLabel: 'Ressources Humaines & Contrats',
    description: 'Calcul des honoraires sur la base des volumes horaires effectués.'
  },
  {
    code: 'perm_manage_leave_requests',
    label: 'Traiter les congés, permissions et absences',
    category: 'hr',
    categoryLabel: 'Ressources Humaines & Contrats',
    description: 'Validation des demandes d\'absence du personnel et des formateurs.'
  },
  {
    code: 'perm_audit_staff_logs',
    label: 'Auditer l\'activité et les présences du personnel',
    category: 'hr',
    categoryLabel: 'Ressources Humaines & Contrats',
    description: 'Suivi de l\'assiduité administrative et des opérations sensibles.'
  },

  // 8. Site Vitrine, Annonces & Événements (5 permissions)
  {
    code: 'perm_post_news_vitrine',
    label: 'Publier des actualités sur le site vitrine',
    category: 'vitrine',
    categoryLabel: 'Site Vitrine & Communication',
    description: 'Rédaction et mise en ligne des articles d\'actualité pour le public.'
  },
  {
    code: 'perm_edit_news_vitrine',
    label: 'Modifier ou archiver des articles vitrine',
    category: 'vitrine',
    categoryLabel: 'Site Vitrine & Communication',
    description: 'Mise à jour des communiqués officiels et dates d\'événements.'
  },
  {
    code: 'perm_manage_events_calendar',
    label: 'Gérer l\'agenda des portes ouvertes & salons',
    category: 'vitrine',
    categoryLabel: 'Site Vitrine & Communication',
    description: 'Planification des cérémonies de remise de diplômes et séminaires.'
  },
  {
    code: 'perm_manage_vitrine_banners',
    label: 'Gérer les bannières, photos et galeries du site',
    category: 'vitrine',
    categoryLabel: 'Site Vitrine & Communication',
    description: 'Personnalisation des visuels haute fidélité du campus.'
  },
  {
    code: 'perm_manage_contact_messages',
    label: 'Consulter et répondre aux messages de contact',
    category: 'vitrine',
    categoryLabel: 'Site Vitrine & Communication',
    description: 'Traitement des demandes d\'information soumises via le site public.'
  },

  // 9. Jeux Éducatifs & E-Learning (4 permissions)
  {
    code: 'perm_view_games',
    label: 'Accéder à la ludothèque pédagogique',
    category: 'elearning',
    categoryLabel: 'Jeux Éducatifs & E-Learning',
    description: 'Consultation des quiz chrono, challenges duel et modules interactifs.'
  },
  {
    code: 'perm_create_games',
    label: 'Créer et configurer des tournois & quiz TV',
    category: 'elearning',
    categoryLabel: 'Jeux Éducatifs & E-Learning',
    description: 'Paramétrage des jokers, chronomètres et banques de questions.'
  },
  {
    code: 'perm_host_live_game_tv',
    label: 'Animer une compétition Quiz TV en direct',
    category: 'elearning',
    categoryLabel: 'Jeux Éducatifs & E-Learning',
    description: 'Lancement du buzzer multijoueur et affichage du tableau des scores.'
  },
  {
    code: 'perm_manage_elearning_modules',
    label: 'Gérer les modules et ressources de cours en ligne',
    category: 'elearning',
    categoryLabel: 'Jeux Éducatifs & E-Learning',
    description: 'Dépôt des supports PDF, vidéos et exercices d\'entraînement.'
  },

  // 10. Sécurité, Audits & Paramètres (4 permissions)
  {
    code: 'perm_view_analytics',
    label: 'Consulter les statistiques globales et taux de réussite',
    category: 'security',
    categoryLabel: 'Sécurité & Paramètres',
    description: 'Accès aux tableaux de bord analytiques et indicateurs clés (KPI).'
  },
  {
    code: 'perm_export_school_data',
    label: 'Exporter les registres généraux (CSV, Excel, PDF)',
    category: 'security',
    categoryLabel: 'Sécurité & Paramètres',
    description: 'Export consolidé des registres pour les autorités de tutelle.'
  },
  {
    code: 'perm_view_audit_logs',
    label: 'Consulter le journal de sécurité & traçabilité IP',
    category: 'security',
    categoryLabel: 'Sécurité & Paramètres',
    description: 'Audit en temps réel des connexions, tentatives suspectes et modifications.'
  },
  {
    code: 'perm_reset_user_passwords',
    label: 'Réinitialiser les mots de passe des utilisateurs',
    category: 'security',
    categoryLabel: 'Sécurité & Paramètres',
    description: 'Déblocage d\'accès et réinitialisation au mot de passe sécurisé initial.'
  }
];

// =========================================================================
// 14 RÔLES OFFICIELS D'UN CENTRE DE FORMATION PROFESSIONNELLE (CFP-ITMC)
// =========================================================================
export const ADMINISTRATIVE_ROLES: AdministrativeRole[] = [
  {
    code: 'rh',
    title: 'Responsable des Ressources Humaines (RH)',
    shortTitle: 'Responsable RH',
    department: 'Direction des Ressources Humaines',
    description: 'Gestion des contrats de travail, recrutements des formateurs, pointages, congés et vacations.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300',
    defaultPermissions: [
      'perm_manage_staff',
      'perm_view_staff_contracts',
      'perm_manage_teacher_payroll',
      'perm_manage_leave_requests',
      'perm_audit_staff_logs',
      'perm_view_teachers',
      'perm_add_teacher',
      'perm_edit_teacher',
      'perm_manage_teacher_evaluations',
      'perm_view_analytics',
      'perm_reset_user_passwords'
    ]
  },
  {
    code: 'dir_etudes',
    title: 'Directeur des Études & de la Pédagogie',
    shortTitle: 'Dir. Études',
    department: 'Direction Pédagogique',
    description: 'Supervision générale des programmes de formation, emplois du temps, corps enseignant et jurys.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300',
    defaultPermissions: [
      'perm_view_students_list',
      'perm_view_student_dossier',
      'perm_edit_student_info',
      'perm_view_teachers',
      'perm_add_teacher',
      'perm_edit_teacher',
      'perm_manage_teacher_evaluations',
      'perm_view_schedules',
      'perm_create_schedule_slot',
      'perm_edit_schedule_slot',
      'perm_delete_schedule_slot',
      'perm_manage_classrooms',
      'perm_view_compositions',
      'perm_create_composition',
      'perm_input_grades',
      'perm_publish_bulletins',
      'perm_generate_transcripts_archive',
      'perm_manage_jurys',
      'perm_view_games',
      'perm_manage_elearning_modules',
      'perm_view_analytics',
      'perm_export_school_data'
    ]
  },
  {
    code: 'sg',
    title: 'Secrétaire Général',
    shortTitle: 'Secrétaire Général',
    department: 'Secrétariat Général & Direction',
    description: 'Coordination administrative transversale, courriers officiels, attestations et relations institutionnelles.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200',
    defaultPermissions: [
      'perm_view_students_list',
      'perm_view_student_dossier',
      'perm_edit_student_info',
      'perm_view_registrations',
      'perm_validate_registrations',
      'perm_print_certificat_scolarite',
      'perm_manage_matricules_minefop',
      'perm_view_teachers',
      'perm_view_schedules',
      'perm_view_compositions',
      'perm_generate_transcripts_archive',
      'perm_view_staff_contracts',
      'perm_manage_contact_messages',
      'perm_export_school_data',
      'perm_reset_user_passwords'
    ]
  },
  {
    code: 'comptable',
    title: 'Chef Comptable & Responsable Caisse',
    shortTitle: 'Chef Comptable',
    department: 'Service Comptabilité & Finances',
    description: 'Encaissement des pensions, suivi de la caisse, trésorerie, facturation et états financiers.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300',
    defaultPermissions: [
      'perm_view_caisse',
      'perm_record_payment',
      'perm_edit_payment_records',
      'perm_export_financial_reports',
      'perm_manage_tuition_rates',
      'perm_view_students_list',
      'perm_view_registrations',
      'perm_view_staff_contracts',
      'perm_manage_teacher_payroll',
      'perm_export_school_data'
    ]
  },
  {
    code: 'surveillant_general',
    title: 'Surveillant Général & Discipline',
    shortTitle: 'Surveillant Général',
    department: 'Vie Scolaire & Discipline',
    description: 'Contrôle des présences, respect du règlement intérieur, assiduité et sécurité des apprenants.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300',
    defaultPermissions: [
      'perm_view_students_list',
      'perm_view_student_dossier',
      'perm_toggle_student_status',
      'perm_view_schedules',
      'perm_view_teachers',
      'perm_manage_leave_requests',
      'perm_audit_staff_logs'
    ]
  },
  {
    code: 'resp_examens',
    title: 'Responsable des Examens, Concours & Jurys',
    shortTitle: 'Resp. Examens',
    department: 'Bureau des Examens & Évaluations',
    description: 'Organisation matérielle des sessions d\'examen, relevés de notes, jurys et publication des résultats.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300',
    defaultPermissions: [
      'perm_view_students_list',
      'perm_view_compositions',
      'perm_create_composition',
      'perm_input_grades',
      'perm_publish_bulletins',
      'perm_generate_transcripts_archive',
      'perm_manage_jurys',
      'perm_view_schedules',
      'perm_export_school_data'
    ]
  },
  {
    code: 'resp_stages',
    title: 'Responsable des Stages & Insertion Professionnelle',
    shortTitle: 'Resp. Stages',
    department: 'Cellule Insertion & Relations Entreprises',
    description: 'Placement des apprenants en immersion professionnelle, conventions de stage et suivi des diplômés.',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300',
    defaultPermissions: [
      'perm_view_students_list',
      'perm_view_student_dossier',
      'perm_print_certificat_scolarite',
      'perm_view_teachers',
      'perm_post_news_vitrine',
      'perm_manage_contact_messages',
      'perm_export_school_data'
    ]
  },
  {
    code: 'resp_communication',
    title: 'Responsable Communication, Marketing & Vitrine',
    shortTitle: 'Resp. Communication',
    department: 'Service Communication & Relations Publiques',
    description: 'Animation du site vitrine, publications d\'actualités, bannières, campagnes d\'admission et événements.',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950/60 dark:text-pink-300',
    defaultPermissions: [
      'perm_post_news_vitrine',
      'perm_edit_news_vitrine',
      'perm_manage_events_calendar',
      'perm_manage_vitrine_banners',
      'perm_manage_contact_messages',
      'perm_view_registrations',
      'perm_view_analytics'
    ]
  },
  {
    code: 'resp_elearning',
    title: 'Responsable Pédagogie Numérique & E-Learning',
    shortTitle: 'Resp. E-Learning',
    department: 'Pôle Innovation & E-Learning',
    description: 'Administration de la plateforme en ligne, organisation des compétitions Quiz TV et ressources interactives.',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300',
    defaultPermissions: [
      'perm_view_games',
      'perm_create_games',
      'perm_host_live_game_tv',
      'perm_manage_elearning_modules',
      'perm_view_students_list',
      'perm_view_teachers',
      'perm_view_analytics'
    ]
  },
  {
    code: 'resp_scolarite',
    title: 'Responsable de la Scolarité & Immatriculations',
    shortTitle: 'Resp. Scolarité',
    department: 'Bureau de la Scolarité',
    description: 'Enregistrement des dossiers physiques, attribution des matricules MINEFOP et archivage des pièces.',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300',
    defaultPermissions: [
      'perm_view_students_list',
      'perm_view_student_dossier',
      'perm_edit_student_info',
      'perm_toggle_student_status',
      'perm_manage_matricules_minefop',
      'perm_view_registrations',
      'perm_validate_registrations',
      'perm_reject_registrations',
      'perm_edit_registration_docs',
      'perm_print_certificat_scolarite',
      'perm_export_school_data'
    ]
  },
  {
    code: 'gestionnaire_ateliers',
    title: 'Gestionnaire du Matériel, Laboratoires & Ateliers',
    shortTitle: 'Gestionnaire Ateliers',
    department: 'Logistique & Ateliers Techniques',
    description: 'Maintenance des équipements, réservation des laboratoires informatiques et ateliers industriels.',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300',
    defaultPermissions: [
      'perm_manage_classrooms',
      'perm_view_schedules',
      'perm_view_teachers',
      'perm_view_students_list'
    ]
  },
  {
    code: 'audit_qualite',
    title: 'Responsable Audit & Assurance Qualité',
    shortTitle: 'Audit Qualité',
    department: 'Cellule Qualité & Conformité MINEFOP',
    description: 'Vérification de la conformité réglementaire, audits des registres et traçabilité des procédures.',
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-800 dark:text-stone-200',
    defaultPermissions: [
      'perm_view_students_list',
      'perm_view_student_dossier',
      'perm_view_teachers',
      'perm_manage_teacher_evaluations',
      'perm_view_schedules',
      'perm_view_compositions',
      'perm_view_caisse',
      'perm_export_financial_reports',
      'perm_view_analytics',
      'perm_export_school_data',
      'perm_view_audit_logs'
    ]
  },
  {
    code: 'bibliothecaire',
    title: 'Bibliothécaire & Gestionnaire Documentaire',
    shortTitle: 'Bibliothécaire',
    department: 'Centre de Documentation & Médiathèque',
    description: 'Gestion des ouvrages techniques, manuels de référence et ressources numériques d\'apprentissage.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300',
    defaultPermissions: [
      'perm_manage_elearning_modules',
      'perm_view_students_list',
      'perm_view_teachers'
    ]
  },
  {
    code: 'super_admin',
    title: 'Super Administrateur / Délégué Général',
    shortTitle: 'Super Admin',
    department: 'Direction Générale',
    description: 'Contrôle total absolu sur l\'intégralité des 50 permissions, sécurité, configurations et bases de données.',
    badgeColor: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300',
    defaultPermissions: ALL_PERMISSIONS.map(p => p.code)
  }
];

// Helper functions
export function getRoleMeta(roleCode: string): AdministrativeRole {
  return ADMINISTRATIVE_ROLES.find(r => r.code === roleCode) || ADMINISTRATIVE_ROLES[0];
}

export function hasPermission(user: any, requiredPermission: string): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'super_admin' || user.permissions?.includes('all') || user.permissions?.includes('superadmin')) {
    return true;
  }
  return Array.isArray(user.permissions) && user.permissions.includes(requiredPermission);
}

export function hasAnyPermission(user: any, requiredPermissions: string[]): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'super_admin' || user.permissions?.includes('all') || user.permissions?.includes('superadmin')) {
    return true;
  }
  if (!Array.isArray(user.permissions)) return false;
  return requiredPermissions.some(perm => user.permissions.includes(perm));
}
