export interface PermissionItem {
  code: string;
  label: string;
  description: string;
  cat: 'Calendrier' | 'Classes & Salles' | 'Notes & Bulletins' | 'Étudiants & Admissions' | 'Scolarité & Finances' | 'Caisse & Trésorerie' | 'Formateurs' | 'Site Vitrine' | 'Pilotage & Système';
}

export const PERMISSION_CATEGORIES = [
  'Calendrier',
  'Classes & Salles',
  'Notes & Bulletins',
  'Étudiants & Admissions',
  'Scolarité & Finances',
  'Caisse & Trésorerie',
  'Formateurs',
  'Site Vitrine',
  'Pilotage & Système'
] as const;

export const ALL_SYSTEM_PERMISSIONS: PermissionItem[] = [
  // 1. Calendrier & Emplois du temps (6)
  { 
    code: 'perm_manage_prof_schedule', 
    label: 'Gérer les plannings enseignants', 
    description: 'Créer, modifier et ajuster les créneaux horaires des professeurs',
    cat: 'Calendrier' 
  },
  { 
    code: 'perm_generate_rt_schedules', 
    label: 'Générer plannings temps réel', 
    description: 'Génération automatique avec détection d\'interférences',
    cat: 'Calendrier' 
  },
  { 
    code: 'perm_view_global_schedule', 
    label: 'Visualiser tous les plannings', 
    description: 'Accès en lecture à l\'ensemble des grilles horaires de l\'institut',
    cat: 'Calendrier' 
  },
  { 
    code: 'perm_block_holidays', 
    label: 'Déclarer jours fériés & congés', 
    description: 'Bloquer des dates et planifier les vacances académiques',
    cat: 'Calendrier' 
  },
  { 
    code: 'perm_reserve_rooms', 
    label: 'Réserver des salles de cours', 
    description: 'Affecter et verrouiller des amphithéâtres et laboratoires',
    cat: 'Calendrier' 
  },
  { 
    code: 'perm_override_clashes', 
    label: 'Forcer conflits horaires', 
    description: 'Autoriser les dérogations et chevauchements exceptionnels',
    cat: 'Calendrier' 
  },

  // 2. Classes & Salles (5)
  { 
    code: 'perm_create_classrooms', 
    label: 'Créer de nouvelles classes', 
    description: 'Ouvrir de nouvelles promotions et sections (G1, G2, G3)',
    cat: 'Classes & Salles' 
  },
  { 
    code: 'perm_edit_classes', 
    label: 'Modifier les structures de classe', 
    description: 'Mettre à jour les effectifs, capacités et délégués',
    cat: 'Classes & Salles' 
  },
  { 
    code: 'perm_delete_classes', 
    label: 'Supprimer des promotions', 
    description: 'Archiver ou supprimer une classe inactive',
    cat: 'Classes & Salles' 
  },
  { 
    code: 'perm_assign_class_titulaires', 
    label: 'Nommer titulaires de classe', 
    description: 'Désigner le formateur référent d\'une promotion',
    cat: 'Classes & Salles' 
  },
  { 
    code: 'perm_view_class_journals', 
    label: 'Consulter cahiers de texte', 
    description: 'Suivre l\'avancement pédagogique des séances dispensées',
    cat: 'Classes & Salles' 
  },

  // 3. Notes & Bulletins Académiques (5)
  { 
    code: 'perm_generate_bulletins', 
    label: 'Générer bulletins de notes', 
    description: 'Calculer moyennes, rangs et éditer les bulletins officiels',
    cat: 'Notes & Bulletins' 
  },
  { 
    code: 'perm_view_student_grades', 
    label: 'Consulter relevés de notes', 
    description: 'Accéder aux grilles d\'évaluations et notes par matière',
    cat: 'Notes & Bulletins' 
  },
  { 
    code: 'perm_edit_student_grades', 
    label: 'Saisir ou modifier les notes', 
    description: 'Encoder et corriger les notes de CC, TP et examens',
    cat: 'Notes & Bulletins' 
  },
  { 
    code: 'perm_publish_bulletins', 
    label: 'Publier bulletins aux apprenants', 
    description: 'Rendre les bulletins visibles dans le portail étudiant',
    cat: 'Notes & Bulletins' 
  },
  { 
    code: 'perm_lock_evaluation_sessions', 
    label: 'Verrouiller sessions de contrôle', 
    description: 'Clôturer la saisie des notes pour délibération',
    cat: 'Notes & Bulletins' 
  },

  // 4. Étudiants & Admissions (6 - incluant inscriptions manuelles complètes)
  { 
    code: 'perm_manual_admission', 
    label: 'Inscrire manuellement un étudiant (dossier complet)', 
    description: 'Création manuelle directe avec état civil, CNI, filière DQP et tranche scolarité',
    cat: 'Étudiants & Admissions' 
  },
  { 
    code: 'perm_add_student', 
    label: 'Créer un compte apprenant', 
    description: 'Ajouter un nouvel étudiant dans le registre numérique',
    cat: 'Étudiants & Admissions' 
  },
  { 
    code: 'perm_edit_student', 
    label: 'Modifier fiches élèves & cursus', 
    description: 'Mettre à jour coordonnées, spécialité et statut académique',
    cat: 'Étudiants & Admissions' 
  },
  { 
    code: 'perm_delete_student', 
    label: 'Supprimer / radier un élève', 
    description: 'Retirer un dossier du registre des effectifs actifs',
    cat: 'Étudiants & Admissions' 
  },
  { 
    code: 'perm_verify_documents', 
    label: 'Valider justificatifs, CNI & diplômes', 
    description: 'Vérifier la conformité des pièces déposées par l\'apprenant',
    cat: 'Étudiants & Admissions' 
  },
  { 
    code: 'perm_assign_student_class', 
    label: 'Affecter élèves aux classes & groupes', 
    description: 'Ventiler les apprenants dans les groupes G1, G2, G3',
    cat: 'Étudiants & Admissions' 
  },

  // 5. Scolarité, Actes & Finances (4)
  { 
    code: 'perm_print_certificat_scolarite', 
    label: 'Délivrer certificats de scolarité & attestations', 
    description: 'Éditer et signer les attestations d\'inscription officielles certifiées MINEFOP',
    cat: 'Scolarité & Finances' 
  },
  { 
    code: 'perm_manage_tuition_payments', 
    label: 'Gérer encaissements & quittances de scolarité', 
    description: 'Enregistrer les versements de pension et émettre les reçus officiels',
    cat: 'Scolarité & Finances' 
  },
  { 
    code: 'perm_manage_transcripts_archive', 
    label: 'Archiver PV & relevés de délibération DQP', 
    description: 'Gestion des relevés annuels officiels et procès-verbaux de jury d\'examen',
    cat: 'Scolarité & Finances' 
  },

  // 6. Caisse & Trésorerie (Gestion complète de la Caisse, Inscriptions, Pensions, Reçus, Dépenses & Matériel)
  { 
    code: 'perm_caisse_encaissement_inscriptions', 
    label: 'Encaisser frais d\'inscription & admissions', 
    description: 'Enregistrer les frais de dossier, tests et acomptes d\'inscription',
    cat: 'Caisse & Trésorerie' 
  },
  { 
    code: 'perm_caisse_encaissement_pension', 
    label: 'Encaisser pensions & tranches de scolarité', 
    description: 'Percevoir les règlements de scolarité (Tranche 1, 2, 3 et solde) et mettre à jour le dossier',
    cat: 'Caisse & Trésorerie' 
  },
  { 
    code: 'perm_caisse_generate_receipt', 
    label: 'Émettre & imprimer reçus officiels certifiés', 
    description: 'Délivrer et signer les quittances numériques officielles avec numéro unique',
    cat: 'Caisse & Trésorerie' 
  },
  { 
    code: 'perm_caisse_depenses_mineures', 
    label: 'Enregistrer menues dépenses & fournitures (< 50 000 FCFA)', 
    description: 'Saisir les petites dépenses courantes de fonctionnement et consommables bureau',
    cat: 'Caisse & Trésorerie' 
  },
  { 
    code: 'perm_caisse_depenses_majeures', 
    label: 'Valider achats de matériel, équipements & logistique', 
    description: 'Décaisser pour outillage, ordinateurs, maintenance campus, factures et salaires',
    cat: 'Caisse & Trésorerie' 
  },
  { 
    code: 'perm_caisse_view_solde', 
    label: 'Consulter solde de caisse & flux de trésorerie', 
    description: 'Accéder aux statistiques de recettes, dépenses, solde net et ventilation par compte',
    cat: 'Caisse & Trésorerie' 
  },
  { 
    code: 'perm_caisse_cloture_journaliere', 
    label: 'Effectuer la clôture journalière de caisse', 
    description: 'Arrêter les comptes du jour, vérifier les écarts et imprimer le procès-verbal',
    cat: 'Caisse & Trésorerie' 
  },
  { 
    code: 'perm_caisse_annulation_ecriture', 
    label: 'Annuler / rectifier une écriture de caisse', 
    description: 'Droit exclusif de suppression ou révision d\'un mouvement comptable erroné',
    cat: 'Caisse & Trésorerie' 
  },
  { 
    code: 'perm_caisse_export_bilan', 
    label: 'Exporter journal de caisse & états financiers', 
    description: 'Télécharger les bilans périodiques en format Excel ou PDF certifié',
    cat: 'Caisse & Trésorerie' 
  },

  // 7. Formateurs & Personnel (5)
  { 
    code: 'perm_add_teacher', 
    label: 'Ajouter formateur & enseignant', 
    description: 'Enregistrer un nouveau professeur dans le corps professoral',
    cat: 'Formateurs' 
  },
  { 
    code: 'perm_edit_teacher', 
    label: 'Modifier fiches formateurs', 
    description: 'Ajuster coordonnées, spécialités et départements d\'enseignement',
    cat: 'Formateurs' 
  },
  { 
    code: 'perm_delete_teacher', 
    label: 'Supprimer un formateur', 
    description: 'Désactiver ou retirer un compte enseignant de l\'institut',
    cat: 'Formateurs' 
  },
  { 
    code: 'perm_assign_teacher_module', 
    label: 'Affecter modules de cours', 
    description: 'Assigner des unités d\'enseignement (UE) aux professeurs',
    cat: 'Formateurs' 
  },
  { 
    code: 'perm_approve_teacher_hours', 
    label: 'Approuver émoluments & vacations', 
    description: 'Valider les fiches de vacations et volume horaire presté',
    cat: 'Formateurs' 
  },

  // 7. Site Vitrine & Communication (5)
  { 
    code: 'perm_post_events', 
    label: 'Publier actualités & événements', 
    description: 'Rédiger et publier des articles sur la page actualités',
    cat: 'Site Vitrine' 
  },
  { 
    code: 'perm_manage_landing', 
    label: 'Éditer page d\'accueil vitrine', 
    description: 'Modifier bannières, textes promotionnels et annonces',
    cat: 'Site Vitrine' 
  },
  { 
    code: 'perm_edit_about_page', 
    label: 'Modifier page "À Propos"', 
    description: 'Actualiser l\'historique, mot du directeur et agréments',
    cat: 'Site Vitrine' 
  },
  { 
    code: 'perm_respond_contacts', 
    label: 'Traiter demandes de contact & devis', 
    description: 'Consulter et répondre aux messages reçus des visiteurs',
    cat: 'Site Vitrine' 
  },
  { 
    code: 'perm_broadcast_sms_notifs', 
    label: 'Diffuser alertes SMS & annonces globales', 
    description: 'Envoyer des notifications d\'urgence et convocations aux apprenants',
    cat: 'Site Vitrine' 
  },

  // 8. Pilotage, Pédagogie & Système (5)
  { 
    code: 'perm_export_school_data', 
    label: 'Exporter données & registres Excel/PDF', 
    description: 'Générer des exports statistiques complets et listes d\'émargement',
    cat: 'Pilotage & Système' 
  },
  { 
    code: 'perm_manage_pedagogical_modules', 
    label: 'Gérer syllabus & programmes DQP', 
    description: 'Définir les contenus de formation, coefficients et volumes horaires',
    cat: 'Pilotage & Système' 
  },
  { 
    code: 'perm_manage_internships_partners', 
    label: 'Gérer stages académiques & partenaires', 
    description: 'Suivi des conventions d\'immersion en entreprise et soutenances',
    cat: 'Pilotage & Système' 
  },
  { 
    code: 'perm_audit_activity_logs', 
    label: 'Consulter journal d\'audit & sécurité', 
    description: 'Accéder aux journaux d\'intrusion WAF et traçabilité des opérations',
    cat: 'Pilotage & Système' 
  },
  { 
    code: 'perm_manage_system_settings', 
    label: 'Configurer paramètres & année académique', 
    description: 'Gestion du calendrier annuel, filières actives et quotas d\'admission',
    cat: 'Pilotage & Système' 
  }
];

export const FUNCTION_SUGGESTIONS = [
  "Secrétaire Générale & Scolarité",
  "Responsable Admissions & Inscriptions",
  "Comptable & Trésorier Scolaire",
  "Coordonnateur Pédagogique & DQP",
  "Surveillant Général & Discipline",
  "Directeur des Études Délégué",
  "Responsable Relations Entreprises & Stages",
  "Chargé de Communication & Événements",
  "Gestionnaire de Laboratoire Informatique",
  "Auditeur & Contrôleur Académique"
];
