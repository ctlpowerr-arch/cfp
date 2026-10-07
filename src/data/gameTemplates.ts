import { GameTemplate } from '@/types/games';

export const GAME_TEMPLATES: GameTemplate[] = [
  {
    id: 'tpl_chrono_1',
    title: '🎯 Sprint Chrono • Algorithmique & Structures de Données',
    description: 'Questions rapides à choix multiples sous haute pression temporelle avec bonus de vélocité.',
    gameType: 'chrono_challenge',
    gameMode: 'multiplayer',
    icon: 'Timer',
    badge: 'Chrono 15s',
    color: 'from-amber-500 to-orange-600',
    defaultFormation: 'Génie Logiciel',
    defaultSubject: 'Algorithmique Avancée',
    level: 'Licence 2',
    difficulty: 'intermediate',
    parameters: {
      durationMinutes: 10,
      timeLimitPerRoundSeconds: 15,
      maxPlayers: 40,
      teamCount: 1,
      playersPerTeam: 1,
      roundsCount: 5,
      maxAttempts: 1
    },
    scoringRules: {
      correctPoints: 200,
      wrongPenalty: 50,
      speedBonus: true,
      speedBonusMax: 100,
      streakBonus: 50,
      missionSuccessPoints: 500,
      hintPenalty: 0,
      academicCredits: 10
    },
    sampleContent: [
      {
        id: 'c1',
        title: 'Complexité temporelle',
        prompt: 'Quelle est la complexité pire cas du tri rapide (QuickSort) ?',
        options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
        correctAnswer: 'O(n²)',
        points: 200,
        timeLimitSeconds: 15
      },
      {
        id: 'c2',
        title: 'Structure de données',
        prompt: 'Quelle structure suit rigoureusement le principe LIFO (Last-In, First-Out) ?',
        options: ['File (Queue)', 'Pile (Stack)', 'Arbre Binaire', 'Table de hachage'],
        correctAnswer: 'Pile (Stack)',
        points: 200,
        timeLimitSeconds: 15
      },
      {
        id: 'c3',
        title: 'Indexation SQL',
        prompt: 'Quel type d\'arbre est le plus communément utilisé pour les index de bases de données relationnelles ?',
        options: ['B-Tree / B+Tree', 'Arbre AVL', 'Arbre Rouge-Noir', 'Trie'],
        correctAnswer: 'B-Tree / B+Tree',
        points: 200,
        timeLimitSeconds: 15
      }
    ]
  },
  {
    id: 'tpl_puzzle_1',
    title: '🧩 Pipeline DevOps • Reconstitution de Procédure CI/CD',
    description: 'Glisser-déposer et ordonnancement logique des étapes d\'un déploiement sécurisé en production.',
    gameType: 'puzzle',
    gameMode: 'individual',
    icon: 'Puzzle',
    badge: 'Logique & Étapes',
    color: 'from-blue-600 to-cyan-600',
    defaultFormation: 'Génie Logiciel',
    defaultSubject: 'Architecture Cloud & DevOps',
    level: 'Licence 3',
    difficulty: 'advanced',
    parameters: {
      durationMinutes: 15,
      timeLimitPerRoundSeconds: 60,
      maxPlayers: 30,
      teamCount: 1,
      playersPerTeam: 1,
      roundsCount: 3,
      maxAttempts: 2
    },
    scoringRules: {
      correctPoints: 300,
      wrongPenalty: 40,
      speedBonus: true,
      speedBonusMax: 50,
      streakBonus: 0,
      missionSuccessPoints: 600,
      hintPenalty: 25,
      academicCredits: 15
    },
    sampleContent: [
      {
        id: 'p1',
        title: 'Pipeline CI/CD Standard',
        prompt: 'Remettez dans l\'ordre chronologique exact les phases d\'un pipeline de livraison continue :',
        orderItems: [
          '1. Checkout & Analyse statique du code (Linting)',
          '2. Exécution des tests unitaires et d\'intégration',
          '3. Build du container Docker & scan vulnérabilités',
          '4. Déploiement automatique sur l\'environnement Staging',
          '5. Validation fonctionnelle et déploiement Canary en Production'
        ],
        points: 300
      }
    ]
  },
  {
    id: 'tpl_simulation_1',
    title: '🏗️ Gestion de Crise Cyber • Incident Ransomware',
    description: 'Scénario interactif à embranchements avec décisions sous tension et analyse d\'impacts.',
    gameType: 'simulation',
    gameMode: 'multiplayer',
    icon: 'ShieldAlert',
    badge: 'Scénario Réel',
    color: 'from-red-600 to-rose-700',
    defaultFormation: 'Sécurité Informatique',
    defaultSubject: 'Gestion des Incidents de Sécurité',
    level: 'Master 1',
    difficulty: 'expert',
    parameters: {
      durationMinutes: 20,
      timeLimitPerRoundSeconds: 45,
      maxPlayers: 25,
      teamCount: 1,
      playersPerTeam: 1,
      roundsCount: 4,
      maxAttempts: 1
    },
    scoringRules: {
      correctPoints: 250,
      wrongPenalty: 100,
      speedBonus: false,
      speedBonusMax: 0,
      streakBonus: 50,
      missionSuccessPoints: 800,
      hintPenalty: 50,
      academicCredits: 20
    },
    sampleContent: [
      {
        id: 'sim1',
        title: 'Alerte rouge à 02h15',
        prompt: 'Un serveur de fichiers critique commence à chiffrer les répertoires partagés. Que faites-vous en premier ?',
        scenarioContext: 'Le monitoring SOC indique 14 000 opérations d\'écriture par minute depuis une machine du service comptable.',
        decisions: [
          {
            id: 'd1',
            text: 'Isoler immédiatement le VLAN et couper les interfaces réseau du serveur',
            consequence: 'Excellente décision : la propagation latérale est stoppée instantanément.',
            pointsDelta: 250
          },
          {
            id: 'd2',
            text: 'Redémarrer le serveur à distance via SSH',
            consequence: 'Erreur critique : le redémarrage accélère le verrouillage du bootloader.',
            pointsDelta: -100
          },
          {
            id: 'd3',
            text: 'Envoyer un email d\'alerte à tous les employés',
            consequence: 'Inutile à cette heure : la propagation continue pendant 30 minutes.',
            pointsDelta: -50
          }
        ]
      }
    ]
  },
  {
    id: 'tpl_team_mission_1',
    title: '👥 Hackathon Sprint • Déploiement d\'Architecture Haute Dispo',
    description: 'Mission collaborative par équipe où chaque rôle apporte des pièces du puzzle architectural.',
    gameType: 'team_mission',
    gameMode: 'teams',
    icon: 'Users',
    badge: 'Travail d\'Équipe',
    color: 'from-purple-600 to-indigo-700',
    defaultFormation: 'Réseaux & Systèmes',
    defaultSubject: 'Haute Disponibilité & Load Balancing',
    level: 'Licence 3',
    difficulty: 'advanced',
    parameters: {
      durationMinutes: 25,
      timeLimitPerRoundSeconds: 90,
      maxPlayers: 32,
      teamCount: 4,
      playersPerTeam: 4,
      roundsCount: 4,
      maxAttempts: 1
    },
    scoringRules: {
      correctPoints: 400,
      wrongPenalty: 50,
      speedBonus: true,
      speedBonusMax: 100,
      streakBonus: 100,
      missionSuccessPoints: 1000,
      hintPenalty: 50,
      academicCredits: 25
    },
    sampleContent: [
      {
        id: 'tm1',
        title: 'Mise en place du Load Balancer',
        prompt: 'L\'équipe doit accorder les paramètres HAProxy et configurer le Keepalived pour éliminer le SPOF.',
        options: ['Round Robin + VRRP', 'Least Connection sans VIP', 'DNS Round Robin simple'],
        correctAnswer: 'Round Robin + VRRP',
        points: 400
      }
    ]
  },
  {
    id: 'tpl_investigation_1',
    title: '🕵️ Enquête Pédagogique • Le Mystère de la Fuite de Données',
    description: 'Examen de journaux d\'audit, analyse de métadonnées et déduction logique du vecteur d\'attaque.',
    gameType: 'investigation',
    gameMode: 'multiplayer',
    icon: 'Search',
    badge: 'Investigation & Indices',
    color: 'from-amber-600 to-yellow-600',
    defaultFormation: 'Sécurité Informatique',
    defaultSubject: 'Forensics & Analyse Post-Mortem',
    level: 'Master 1',
    difficulty: 'expert',
    parameters: {
      durationMinutes: 30,
      timeLimitPerRoundSeconds: 120,
      maxPlayers: 30,
      teamCount: 1,
      playersPerTeam: 1,
      roundsCount: 3,
      maxAttempts: 2
    },
    scoringRules: {
      correctPoints: 350,
      wrongPenalty: 60,
      speedBonus: false,
      speedBonusMax: 0,
      streakBonus: 0,
      missionSuccessPoints: 750,
      hintPenalty: 40,
      academicCredits: 20
    },
    sampleContent: [
      {
        id: 'inv1',
        title: 'Analyse des logs d\'accès API',
        prompt: 'Quel identifiant de clé API a été compromis d\'après les adresses IP géolocalisées en anomalie ?',
        clues: [
          'Indice 1 : La requête anormale a été enregistrée à 04:12 GMT+1',
          'Indice 2 : L\'User-Agent contenait python-requests/2.28',
          'Indice 3 : Le token commence par "ak_live_99f"'
        ],
        options: ['ak_live_99f2b8', 'ak_test_44e1a0', 'ak_live_11c3d9', 'ak_admin_root'],
        correctAnswer: 'ak_live_99f2b8',
        points: 350
      }
    ]
  },
  {
    id: 'tpl_business_1',
    title: '💰 Gestion de Startup Tech • Trésorerie, Recrutement & Ventes',
    description: 'Prenez les commandes d\'une entreprise : équilibrez le budget, les investissements et le churn.',
    gameType: 'business_mgmt',
    gameMode: 'teams',
    icon: 'TrendingUp',
    badge: 'Stratégie & Finance',
    color: 'from-emerald-600 to-teal-700',
    defaultFormation: 'Management & Entrepreneuriat',
    defaultSubject: 'Finance d\'Entreprise & Pilotage Budgétaire',
    level: 'Master 2',
    difficulty: 'advanced',
    parameters: {
      durationMinutes: 20,
      timeLimitPerRoundSeconds: 60,
      maxPlayers: 24,
      teamCount: 4,
      playersPerTeam: 3,
      roundsCount: 4,
      maxAttempts: 1
    },
    scoringRules: {
      correctPoints: 300,
      wrongPenalty: 50,
      speedBonus: false,
      speedBonusMax: 0,
      streakBonus: 50,
      missionSuccessPoints: 900,
      hintPenalty: 30,
      academicCredits: 20
    },
    sampleContent: [
      {
        id: 'biz1',
        title: 'Arbitrage Trimestriel T1',
        prompt: 'Vous disposez d\'un solde de trésorerie de 50 000 000 FCFA. Votre CAC augmente de 30%. Quelle décision prenez-vous ?',
        decisions: [
          {
            id: 'b1',
            text: 'Optimiser le SEO organique et réduire les ads payantes non ciblées',
            consequence: 'Excellente gestion : le CAC diminue de 20% et la rentabilité s\'améliore.',
            pointsDelta: 300,
            budgetDelta: -5000000
          },
          {
            id: 'b2',
            text: 'Doubler immédiatement les dépenses publicitaires',
            consequence: 'Désastreux : burn rate accru de 40% sans augmentation du LTV.',
            pointsDelta: -100,
            budgetDelta: -25000000
          }
        ]
      }
    ]
  },
  {
    id: 'tpl_memory_1',
    title: '🧠 Memory Professionnel • Ports Réseau & Protocoles Standard',
    description: 'Associez rapidement les numéros de ports TCP/UDP avec leurs protocoles et couches OSI respectifs.',
    gameType: 'memory',
    gameMode: 'individual',
    icon: 'Brain',
    badge: 'Mémorisation Rapide',
    color: 'from-violet-600 to-purple-800',
    defaultFormation: 'Réseaux & Télécoms',
    defaultSubject: 'Protocoles Réseaux TCP/IP',
    level: 'Licence 1',
    difficulty: 'beginner',
    parameters: {
      durationMinutes: 10,
      timeLimitPerRoundSeconds: 45,
      maxPlayers: 35,
      teamCount: 1,
      playersPerTeam: 1,
      roundsCount: 3,
      maxAttempts: 3
    },
    scoringRules: {
      correctPoints: 150,
      wrongPenalty: 20,
      speedBonus: true,
      speedBonusMax: 80,
      streakBonus: 30,
      missionSuccessPoints: 400,
      hintPenalty: 15,
      academicCredits: 10
    },
    sampleContent: [
      {
        id: 'm1',
        title: 'Appariement Ports & Services',
        prompt: 'Associez chaque protocole à son numéro de port assigné standard :',
        pairs: [
          { id: 'pair1', term: 'Port 443', match: 'HTTPS' },
          { id: 'pair2', term: 'Port 22', match: 'SSH' },
          { id: 'pair3', term: 'Port 53', match: 'DNS' },
          { id: 'pair4', term: 'Port 3306', match: 'MySQL' },
          { id: 'pair5', term: 'Port 5432', match: 'PostgreSQL' }
        ]
      }
    ]
  },
  {
    id: 'tpl_virtual_lab_1',
    title: '🧪 Atelier Virtuel • Résolution de Panne Réseau & Routage',
    description: 'Diagnostiquez une rupture de connectivité à l\'aide de commandes virtuelles ping, traceroute et arp.',
    gameType: 'virtual_lab',
    gameMode: 'individual',
    icon: 'FlaskConical',
    badge: 'Pratique & Diagnostic',
    color: 'from-teal-600 to-emerald-800',
    defaultFormation: 'Réseaux & Télécoms',
    defaultSubject: 'Administration Systèmes & Réseaux',
    level: 'Licence 2',
    difficulty: 'intermediate',
    parameters: {
      durationMinutes: 20,
      timeLimitPerRoundSeconds: 60,
      maxPlayers: 30,
      teamCount: 1,
      playersPerTeam: 1,
      roundsCount: 3,
      maxAttempts: 2
    },
    scoringRules: {
      correctPoints: 250,
      wrongPenalty: 30,
      speedBonus: true,
      speedBonusMax: 50,
      streakBonus: 40,
      missionSuccessPoints: 600,
      hintPenalty: 20,
      academicCredits: 15
    },
    sampleContent: [
      {
        id: 'lab1',
        title: 'Diagnostic de passerelle par défaut',
        prompt: 'La machine hôte ne peut pas joindre Internet. Quel élément manque dans la table de routage ?',
        options: ['Passerelle par défaut (0.0.0.0/0)', 'Table ARP locale', 'Masque de sous-réseau /32'],
        correctAnswer: 'Passerelle par défaut (0.0.0.0/0)',
        points: 250
      }
    ]
  },
  {
    id: 'tpl_role_play_1',
    title: '🗣️ Jeu de Rôle • Soutenance & Gestion d\'Objections Client',
    description: 'Défendez une proposition commerciale et un cahier des charges face à un client exigeant.',
    gameType: 'role_play',
    gameMode: 'duel',
    icon: 'MessageSquare',
    badge: 'Communication & Vente',
    color: 'from-pink-600 to-rose-700',
    defaultFormation: 'Commerce & Vente',
    defaultSubject: 'Négociation Commerciale & Relation Client',
    level: 'Licence 3',
    difficulty: 'advanced',
    parameters: {
      durationMinutes: 15,
      timeLimitPerRoundSeconds: 45,
      maxPlayers: 20,
      teamCount: 2,
      playersPerTeam: 1,
      roundsCount: 3,
      maxAttempts: 1
    },
    scoringRules: {
      correctPoints: 200,
      wrongPenalty: 40,
      speedBonus: false,
      speedBonusMax: 0,
      streakBonus: 40,
      missionSuccessPoints: 500,
      hintPenalty: 20,
      academicCredits: 15
    },
    sampleContent: [
      {
        id: 'rp1',
        title: 'Objection Tarifaire',
        prompt: 'Le client affirme : "Votre devis est 30% plus cher que votre concurrent local." Quelle est la meilleure réplique ?',
        options: [
          'Valoriser le coût total de possession (TCO), la garantie et l\'assistance 24/7 sur site',
          'Accorder immédiatement une remise de 30% pour conclure',
          'Critiquer publiquement la qualité du concurrent'
        ],
        correctAnswer: 'Valoriser le coût total de possession (TCO), la garantie et l\'assistance 24/7 sur site',
        points: 200
      }
    ]
  },
  {
    id: 'tpl_treasure_hunt_1',
    title: '🗺️ Chasse au Trésor • Les Clés de l\'Architecture Logicielle',
    description: 'Parcours d\'énigmes successives où chaque réponse découverte déverrouille l\'étape suivante.',
    gameType: 'treasure_hunt',
    gameMode: 'individual',
    icon: 'Compass',
    badge: 'Énigmes Successives',
    color: 'from-amber-500 to-yellow-600',
    defaultFormation: 'Génie Logiciel',
    defaultSubject: 'Patrons de Conception (Design Patterns)',
    level: 'Licence 3',
    difficulty: 'expert',
    parameters: {
      durationMinutes: 25,
      timeLimitPerRoundSeconds: 90,
      maxPlayers: 35,
      teamCount: 1,
      playersPerTeam: 1,
      roundsCount: 4,
      maxAttempts: 2
    },
    scoringRules: {
      correctPoints: 300,
      wrongPenalty: 50,
      speedBonus: true,
      speedBonusMax: 70,
      streakBonus: 50,
      missionSuccessPoints: 800,
      hintPenalty: 35,
      academicCredits: 20
    },
    sampleContent: [
      {
        id: 'th1',
        title: 'Étape 1 : Le gardien de l\'instance unique',
        prompt: 'Quel patron de conception garantit qu\'une classe ne possède qu\'une seule et unique instance accessible globalement ?',
        options: ['Singleton', 'Factory Method', 'Observer', 'Decorator'],
        correctAnswer: 'Singleton',
        points: 300
      },
      {
        id: 'th2',
        title: 'Étape 2 : L\'abonné et le sujet',
        prompt: 'Quel patron permet à un objet de notifier automatiquement ses dépendants lors d\'un changement d\'état ?',
        options: ['Observer', 'Strategy', 'Adapter', 'Proxy'],
        correctAnswer: 'Observer',
        points: 300
      }
    ]
  }
];
