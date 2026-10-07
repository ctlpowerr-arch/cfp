import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Sparkles, 
  Zap, 
  Play, 
  Clock, 
  Plus, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Crown, 
  BarChart3, 
  Printer, 
  Download, 
  Radio, 
  Trash2, 
  ChevronRight, 
  Send, 
  Target, 
  ShieldAlert,
  Loader2,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, ModernSelect } from "@/components/ui/select";
import { GameCreatorModal } from "@/components/games/GameCreatorModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { printElementDirect, exportElementToPDF } from "@/lib/pdfExport";
import { 
  playCorrectSound, 
  playWrongSound, 
  playCountdownTick, 
  playBuzzerPress, 
  playVictoryFanfare,
  setSoundMuted,
  isSoundMuted,
  playLobbyMusic,
  stopLobbyMusic,
  playCountdownMusic,
  stopCountdownMusic,
  playPreviewSound,
  stopPreviewSound,
  playRevealSound,
  playCheerSound
} from "@/lib/soundEffects";

const defaultModeData: Record<string, any> = {
  defi_chrono: {
    questions: [
      { id: '1', text: 'Quelle est la complexité temporelle du tri rapide (QuickSort) au pire des cas ?', options: ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'], correctAnswer: 'O(n²)', points: 200, timeLimitSeconds: 15 },
      { id: '2', text: 'Que signifie l’acronyme SOLID en conception orientée objet ?', options: ['Single Responsibility, Open/Closed, Liskov, Interface, Dependency', 'Software Oriented, Liskov, Injection, Design', 'Simple, Optimal, Lightweight, Interface, Development', 'Aucun de ces choix'], correctAnswer: 'Single Responsibility, Open/Closed, Liskov, Interface, Dependency', points: 200, timeLimitSeconds: 15 }
    ]
  },
  puzzle_competences: {
    puzzleTitle: "Algorithme de Tri Fusion",
    puzzleSteps: [
      "Diviser le tableau en deux sous-tableaux",
      "Trier récursivement chaque moitié",
      "Fusionner les deux sous-tableaux triés",
      "Retourner le tableau final ordonné"
    ]
  },
  simulation_pro: {
    scenarios: [
      {
        scenario: "Un serveur de production subit une attaque DDoS massive.",
        options: [
          { text: "Activer la protection CDN Cloudflare et limiter le taux (Rate Limiting)", consequence: "Attaque mitigée, serveurs stabilisés !", points: 300 },
          { text: "Redémarrer physiquement le serveur principal", consequence: "Le serveur redémarre mais retombe immédiatement sous la charge.", points: -100 },
          { text: "Ignorer et attendre que l'attaque se termine", consequence: "Indisponibilité prolongée, perte de 15% de clients.", points: -200 }
        ]
      }
    ]
  },
  mission_equipe: {
    missionObjective: "Incident de Fuite de Données",
    missionTasks: [
      "Isoler la base de données affectée",
      "Analyser les logs de connexion suspectes",
      "Révoquer les clés API compromises",
      "Notifier le responsable sécurité (CISO)"
    ]
  },
  enquete_pedagogique: {
    enqueteCase: "L'affaire de la Clé API Perdue",
    enqueteClues: [
      "Fichier .env pushé par erreur sur un dépôt GitHub public",
      "Requêtes anormales en provenance d'adresses IP non répertoriées",
      "Logs AWS montrant la création de 50 instances de minage de crypto-monnaie"
    ],
    enqueteSolution: "GitHub public leaks"
  },
  gestion_entreprise: {
    capital: 15000,
    decisions: [
      { name: "Recruter un Développeur Senior", cost: 5000, revenue: 8000, risk: "Faible" },
      { name: "Lancer une Campagne Marketing DQP", cost: 3000, revenue: 4500, risk: "Moyen" },
      { name: "Externaliser le Support Client", cost: 2000, revenue: 1500, risk: "Élevé" }
    ]
  },
  memory_pro: {
    memoryPairs: [
      { term: "React", definition: "Bibliothèque UI par composants déclaratifs" },
      { term: "Node.js", definition: "Environnement d'exécution JavaScript côté serveur" },
      { term: "Docker", definition: "Conteneurisation d'applications isolées" },
      { term: "PostgreSQL", definition: "Système de base de données relationnelle robuste" }
    ]
  },
  atelier_virtuel: {
    workshopTitle: "Configuration d'un Serveur Web Nginx",
    manipulationSteps: [
      { instruction: "Installer le package nginx via apt", toolRequired: "sudo apt install nginx" },
      { instruction: "Éditer le fichier de configuration par défaut", toolRequired: "nano /etc/nginx/sites-available/default" },
      { instruction: "Tester la syntaxe de configuration", toolRequired: "nginx -t" },
      { instruction: "Redémarrer le service web", toolRequired: "systemctl restart nginx" }
    ]
  },
  jeu_role: {
    roleScenario: "Soutenance de Projet de Fin d'Études devant un Client Exigeant",
    objections: [
      "Votre architecture manque de scalabilité horizontale.",
      "Le budget de maintenance est trop élevé par rapport à nos attentes.",
      "Nous craignons la sécurité du stockage des données bancaires."
    ],
    perfectAnswers: [
      "Mettre en avant l'usage de microservices Docker et Kubernetes.",
      "Présenter un plan de transfert de compétences pour autonomie.",
      "Garantir la conformité RGPD et le chiffrement AES-256."
    ]
  },
  chasse_tresor: {
    treasureRiddles: [
      { riddle: "Je suis un protocole réseau sécurisé qui écoute par défaut sur le port 22. Qui suis-je ?", hint: "SSH", passkey: "SSH" },
      { riddle: "Je suis une méthode HTTP non idempotente utilisée pour créer des ressources. Qui suis-je ?", hint: "POST", passkey: "POST" },
      { riddle: "Je suis le fichier de configuration système qui mappe les adresses IP aux noms d'hôtes locaux.", hint: "/etc/...", passkey: "hosts" }
    ]
  },
  duel: {
    questions: [
      { id: '1', text: 'Quel protocole garantit une livraison fiable et ordonnée de paquets ?', options: ['UDP', 'TCP', 'IP', 'DNS'], correctAnswer: 'TCP', points: 300, timeLimitSeconds: 10 },
      { id: '2', text: 'Quel langage de requête est standard pour les bases relationnelles ?', options: ['NoSQL', 'SQL', 'GraphQL', 'Cypher'], correctAnswer: 'SQL', points: 300, timeLimitSeconds: 10 }
    ]
  },
  tournoi: {
    questions: [
      { id: '1', text: '[Manche 1] Que signifie le T de TDD ?', options: ['Test', 'Technical', 'Template', 'Time'], correctAnswer: 'Test', points: 250, timeLimitSeconds: 12 },
      { id: '2', text: '[Manche 2] Quel outil est utilisé pour la gestion des versions de code ?', options: ['Vite', 'Git', 'npm', 'Docker'], correctAnswer: 'Git', points: 250, timeLimitSeconds: 12 },
      { id: '3', text: '[Manche 3] Quelle structure de données fonctionne en mode LIFO ?', options: ['File (Queue)', 'Pile (Stack)', 'Graphe', 'Arbre'], correctAnswer: 'Pile (Stack)', points: 250, timeLimitSeconds: 12 }
    ]
  }
};

const GAME_MODES_CATALOG = [
  {
    id: 'defi_chrono',
    num: 1,
    emoji: '⏱️',
    title: 'Défi Chrono',
    subtitle: 'Résoudre des questions et défis techniques le plus rapidement possible',
    category: 'speed',
    categoryLabel: 'Rapidité & Chrono',
    badge: 'Sprint 15s',
    gradient: 'from-amber-500 to-orange-600',
    bgGlow: 'bg-amber-500/10 border-amber-500/30 text-amber-400'
  },
  {
    id: 'puzzle_competences',
    num: 2,
    emoji: '🧩',
    title: 'Puzzle de Compétences',
    subtitle: 'Remettre des étapes de procédure dans l’ordre logique et associer',
    category: 'logic',
    categoryLabel: 'Logique & Procédure',
    badge: 'Ordonnancement',
    gradient: 'from-purple-500 to-indigo-600',
    bgGlow: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
  },
  {
    id: 'simulation_pro',
    num: 3,
    emoji: '🏗️',
    title: 'Simulation Professionnelle',
    subtitle: 'Prendre des décisions stratégiques dans une situation réelle de métier',
    category: 'simulation',
    categoryLabel: 'Simulation Métier',
    badge: 'Scénario & Impact',
    gradient: 'from-blue-500 to-cyan-600',
    bgGlow: 'bg-blue-500/10 border-blue-500/30 text-blue-400'
  },
  {
    id: 'mission_equipe',
    num: 4,
    emoji: '👥',
    title: 'Mission en Équipe',
    subtitle: 'Plusieurs étudiants collaborent en escouade pour résoudre une mission',
    category: 'team',
    categoryLabel: 'Coopération',
    badge: 'Escouades',
    gradient: 'from-emerald-500 to-teal-600',
    bgGlow: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
  },
  {
    id: 'enquete_pedagogique',
    num: 5,
    emoji: '🕵️',
    title: 'Enquête Pédagogique',
    subtitle: 'Analyser des indices, logs, documents et preuves pour trouver la faille',
    category: 'team',
    categoryLabel: 'Investigation',
    badge: 'Indices & Preuves',
    gradient: 'from-yellow-500 to-amber-600',
    bgGlow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
  },
  {
    id: 'gestion_entreprise',
    num: 6,
    emoji: '💰',
    title: 'Gestion d’Entreprise',
    subtitle: 'Gérer budget, capital, stock, ventes, risques et investissements',
    category: 'simulation',
    categoryLabel: 'Management & ROI',
    badge: 'Budget & Stratégie',
    gradient: 'from-rose-500 to-pink-600',
    bgGlow: 'bg-rose-500/10 border-rose-500/30 text-rose-400'
  },
  {
    id: 'memory_pro',
    num: 7,
    emoji: '🧠',
    title: 'Memory Professionnel',
    subtitle: 'Associer rapidement termes techniques, définitions, outils et composants',
    category: 'logic',
    categoryLabel: 'Mémorisation',
    badge: 'Paires & Concepts',
    gradient: 'from-fuchsia-500 to-purple-600',
    bgGlow: 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400'
  },
  {
    id: 'atelier_virtuel',
    num: 8,
    emoji: '🧪',
    title: 'Atelier / Labo Virtuel',
    subtitle: 'Manipuler virtuellement des commandes et outils pour une tâche technique',
    category: 'logic',
    categoryLabel: 'TP & Pratique',
    badge: 'Labo Technique',
    gradient: 'from-indigo-500 to-violet-600',
    bgGlow: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
  },
  {
    id: 'jeu_role',
    num: 9,
    emoji: '🗣️',
    title: 'Jeu de Rôle Professionnel',
    subtitle: 'Gérer un entretien, une soutenance ou les objections d’un client difficile',
    category: 'simulation',
    categoryLabel: 'Négociation',
    badge: 'Argumentation',
    gradient: 'from-pink-500 to-rose-600',
    bgGlow: 'bg-pink-500/10 border-pink-500/30 text-pink-400'
  },
  {
    id: 'chasse_tresor',
    num: 10,
    emoji: '🗺️',
    title: 'Chasse au Trésor Pédagogique',
    subtitle: 'Résoudre une série d’énigmes successives avec clés de validation',
    category: 'team',
    categoryLabel: 'Parcours Énigmes',
    badge: 'Clés Secrètes',
    gradient: 'from-teal-500 to-emerald-600',
    bgGlow: 'bg-teal-500/10 border-teal-500/30 text-teal-400'
  },
  {
    id: 'duel',
    num: 11,
    emoji: '⚔️',
    title: 'Duel 1 contre 1',
    subtitle: 'Deux étudiants s’affrontent directement en vitesse sur une série de défis',
    category: 'speed',
    categoryLabel: 'Affrontement Direct',
    badge: '1 vs 1',
    gradient: 'from-red-500 to-orange-600',
    bgGlow: 'bg-red-500/10 border-red-500/30 text-red-400'
  },
  {
    id: 'tournoi',
    num: 12,
    emoji: '🏆',
    title: 'Grand Tournoi Multi-Manches',
    subtitle: 'Plusieurs étudiants ou équipes s’affrontent sur plusieurs manches éliminatoires',
    category: 'speed',
    categoryLabel: 'Compétition Majeure',
    badge: 'Championnat',
    gradient: 'from-amber-400 to-yellow-600',
    bgGlow: 'bg-amber-500/10 border-amber-500/30 text-amber-400'
  }
];

export default function TeacherGamesPage() {
  const outletCtx = useOutletContext<{ teacher?: any }>() || {};
  const { user: authUser } = useAuth();
  const teacher = outletCtx?.teacher || {
    id: authUser?.id || 'tea_1',
    name: authUser?.name || 'Professeur CFP-ITMC',
    email: authUser?.email || 'professeur@itmc.cm',
    function: 'Enseignant',
    specialties: ['Génie Logiciel', 'Informatique de Gestion', 'Réseaux & Sécurité']
  };
  const [activeTab, setActiveTab] = useState<'lobby' | 'scheduled' | 'history'>('lobby');
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [audioFavorites, setAudioFavorites] = useState<any[]>([]);
  const [playingPreviewUrl, setPlayingPreviewUrl] = useState<string | null>(null);

  // New Game Dialog state
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [isStudioWizardOpen, setIsStudioWizardOpen] = useState(false);
  const [isGameTypePickerOpen, setIsGameTypePickerOpen] = useState(false);
  const [gameTypeFilter, setGameTypeFilter] = useState<'all' | 'speed' | 'logic' | 'simulation' | 'team'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newGameData, setNewGameData] = useState<{
    title: string;
    description: string;
    mode: string;
    specialty: string;
    classCode: string;
    scheduledAt: string;
    isAutoLaunch: boolean;
    questions: Array<{
      id: string;
      text: string;
      options: string[];
      correctAnswer: string;
      points: number;
      timeLimitSeconds: number;
    }>;
    selectedAudio: {
      bon: string;
      mov: string;
      deb: string;
      pan: string;
      vic: string;
    };
    [key: string]: any;
  }>({
    title: '',
    description: '',
    mode: 'defi_chrono',
    specialty: teacher?.specialty || 'Génie Logiciel',
    classCode: 'G1',
    scheduledAt: '',
    isAutoLaunch: false,
    questions: [
      { id: '1', text: 'Quelle est la complexité temporelle du tri rapide (QuickSort) au pire des cas ?', options: ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'], correctAnswer: 'O(n²)', points: 200, timeLimitSeconds: 15 },
      { id: '2', text: 'Que signifie l’acronyme SOLID en conception orientée objet ?', options: ['Single Responsibility, Open/Closed, Liskov, Interface, Dependency', 'Software Oriented, Liskov, Injection, Design', 'Simple, Optimal, Lightweight, Interface, Development', 'Aucun de ces choix'], correctAnswer: 'Single Responsibility, Open/Closed, Liskov, Interface, Dependency', points: 200, timeLimitSeconds: 15 }
    ],
    selectedAudio: {
      bon: '/AUD/bon/1.mp3',
      mov: '/AUD/mov/1.mp3',
      deb: '/AUD/deb/1.mp3',
      pan: '/AUD/pan/1.mp3',
      vic: '/AUD/vic/1.mp3'
    }
  });

  // Live TV Control Room Modal state
  const [activeLiveGame, setActiveLiveGame] = useState<any | null>(null);
  const [liveLobbyState, setLiveLobbyState] = useState<any | null>(null);
  
  // Immersive Game TV Fullscreen & Auto-advance states
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);
  const [isAutoAdvanceEnabled, setIsAutoAdvanceEnabled] = useState(false);
  const [teacherTimerLeft, setTeacherTimerLeft] = useState(15);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [revealCountdown, setRevealCountdown] = useState<number | null>(null);

  const reportPrintRef = useRef<HTMLDivElement>(null);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/games?teacherId=${teacher?.id || 'TCH-001'}`);
      if (res.ok) {
        setGames(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch games", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    fetch('/api/games/audio-favorites')
      .then(res => {
        if (res.ok) return res.json();
        return [];
      })
      .then(data => setAudioFavorites(data))
      .catch(err => console.error("Failed to fetch favorites", err));
  }, []);

  const handlePlayPreview = (url: string) => {
    if (playingPreviewUrl === url) {
      stopPreviewSound();
      setPlayingPreviewUrl(null);
    } else {
      playPreviewSound(url);
      setPlayingPreviewUrl(url);
    }
  };

  const handleSaveFavoriteAudio = async () => {
    const title = window.prompt("Nommez cette ambiance audio favorite (ex: Ambiance Rétro, Suspense...) :");
    if (!title || !title.trim()) return;
    try {
      const res = await fetch('/api/games/audio-favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          audios: newGameData.selectedAudio,
          teacherId: teacher?.id || 'TCH-001'
        })
      });
      if (res.ok) {
        toast.success("Ambiance enregistrée dans vos favoris !");
        const favsRes = await fetch('/api/games/audio-favorites');
        if (favsRes.ok) setAudioFavorites(await favsRes.json());
      }
    } catch {
      toast.error("Erreur de sauvegarde");
    }
  };

  // Poll live lobby if viewing activeLiveGame
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeLiveGame) {
      const pollLobby = async () => {
        try {
          const res = await fetch(`/api/games/${activeLiveGame.id}/lobby`);
          if (res.ok) {
            const data = await res.json();
            setLiveLobbyState(data);
          }
        } catch (e) {
          console.error("Failed to poll lobby", e);
        }
      };
      pollLobby();
      interval = setInterval(pollLobby, 2000);
    }
    return () => clearInterval(interval);
  }, [activeLiveGame]);

  // Handle background sounds for teacher's live control room
  useEffect(() => {
    if (!activeLiveGame || !liveLobbyState) {
      stopLobbyMusic();
      stopCountdownMusic();
      return;
    }

    const selectedAudio = activeLiveGame.selectedAudio || liveLobbyState.game?.selectedAudio;
    if (!selectedAudio) return;

    if (liveLobbyState.status === 'lobby' || liveLobbyState.status === 'scheduled') {
      playLobbyMusic(selectedAudio.deb);
      stopCountdownMusic();
    } else if (liveLobbyState.status === 'active') {
      stopLobbyMusic();
      playCountdownMusic(selectedAudio.pan);
    } else if (liveLobbyState.status === 'completed') {
      stopLobbyMusic();
      stopCountdownMusic();
      playVictoryFanfare(selectedAudio.vic);
    }

    return () => {
      stopLobbyMusic();
      stopCountdownMusic();
    };
  }, [activeLiveGame, liveLobbyState?.status, liveLobbyState?.currentQuestionIndex, liveLobbyState?.game?.selectedAudio]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
  };

  // Synchronize client view state with backend live lobby state in real-time
  useEffect(() => {
    if (activeLiveGame && liveLobbyState) {
      // Sync timer from server
      const serverTimerLeft = liveLobbyState.dynamicTimeLeft !== undefined ? liveLobbyState.dynamicTimeLeft : 15;
      setTeacherTimerLeft(serverTimerLeft);

      // Play clock tick on last 5 seconds
      if (liveLobbyState.status === 'active' && serverTimerLeft > 0 && serverTimerLeft <= 5 && !liveLobbyState.isRevealed) {
        playCountdownTick();
      }

      // Sync answer revealed state
      const serverRevealed = !!liveLobbyState.isRevealed;
      
      // If server just switched to revealed, play reveal and cheering sounds!
      if (serverRevealed && !isAnswerRevealed) {
        setIsAnswerRevealed(true);
        playRevealSound();
        const curQIndex = liveLobbyState.currentQuestionIndex || 0;
        const curResponses = liveLobbyState.responses?.filter((r: any) => r.questionIndex === curQIndex) || [];
        const correctCount = curResponses.filter((r: any) => r.isCorrect).length;
        if (correctCount > 0) {
          playCheerSound();
        }
      } else if (!serverRevealed) {
        setIsAnswerRevealed(false);
      }

      // Sync auto-advance countdown banner
      if (serverRevealed && liveLobbyState.revealedAt) {
        const elapsed = Math.floor((Date.now() - new Date(liveLobbyState.revealedAt).getTime()) / 1000);
        const countdown = Math.max(0, 4 - elapsed);
        setRevealCountdown(countdown);
      } else {
        setRevealCountdown(null);
      }
    }
  }, [liveLobbyState, activeLiveGame?.id, isAnswerRevealed]);

  const handleRevealAnswer = async () => {
    if (!activeLiveGame) return;
    try {
      await fetch(`/api/games/${activeLiveGame.id}/reveal`, { method: 'POST' });
    } catch (e) {
      console.error("Reveal failed", e);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameData.title.trim()) {
      toast.error("Veuillez saisir le titre du jeu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newGameData,
          teacherId: teacher?.id || 'TCH-001',
          teacherName: teacher?.name || 'Professeur Démo'
        })
      });

      if (response.ok) {
        toast.success("Jeu éducatif créé et publié avec succès !");
        setIsNewGameOpen(false);
        fetchGames();
      } else {
        toast.error("Échec de la création du jeu.");
      }
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaunchGame = async (gameId: string) => {
    try {
      const res = await fetch(`/api/games/${gameId}/launch`, { method: 'POST' });
      if (res.ok) {
        playVictoryFanfare();
        toast.success("Partie lancée en direct sur le plateau TV !");
        const data = await res.json();
        setActiveLiveGame(data.game);
        fetchGames();
      }
    } catch {
      toast.error("Erreur lors du lancement");
    }
  };

  const handleNextQuestion = async (gameId: string) => {
    try {
      const res = await fetch(`/api/games/${gameId}/next-question`, { method: 'POST' });
      if (res.ok) {
        playBuzzerPress();
        const data = await res.json();
        setActiveLiveGame(data.game);
      }
    } catch {
      toast.error("Erreur serveur");
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette compétition ?")) return;
    try {
      await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
      toast.success("Jeu supprimé.");
      fetchGames();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handlePrintReport = () => {
    if (reportPrintRef.current) {
      printElementDirect(reportPrintRef.current, `Rapport_Competition_${activeLiveGame?.title || 'Jeu'}`);
    }
  };

  const handleDownloadPDF = () => {
    if (reportPrintRef.current) {
      exportElementToPDF(reportPrintRef.current, `Rapport_Competition_${activeLiveGame?.title || 'Jeu'}.pdf`);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 px-2 sm:px-4">
      {/* High Energy TV Show Banner */}
      <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-2xl border border-purple-800/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-purple-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-xl shadow-lg shadow-purple-600/40">
              📺 Plateau TV • Compétitions Éducatives Multijoueurs
            </Badge>
            <Badge variant="outline" className="text-purple-300 border-purple-700 font-bold text-[10px] px-3 py-1 rounded-xl">
              Chronomètre & Ambiance Plateau TV
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 animate-bounce shrink-0" />
            <span>Régie TV des Jeux Éducatifs</span>
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
            Créez des tournois interactifs en direct : Buzzer Éclair, Duel de Code, Plateau Quiz TV 4 choix, et Suivi de présence en temps réel des joueurs connectés !
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 sm:gap-3 w-full 2xl:w-auto shrink-0 pt-2 2xl:pt-0">
          <Button
            type="button"
            onClick={handleToggleMute}
            variant="outline"
            className="h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl border-purple-700 bg-purple-950/40 text-purple-200 hover:bg-purple-900 font-bold text-xs gap-2 cursor-pointer flex-1 sm:flex-initial justify-center whitespace-nowrap"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? "Son Désactivé" : "Son Activé"}</span>
          </Button>

          <Button
            onClick={() => setIsStudioWizardOpen(true)}
            variant="outline"
            className="h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl border-purple-500/50 bg-purple-900/40 text-white hover:bg-purple-800/60 font-black text-xs uppercase tracking-wider gap-2 cursor-pointer flex-1 sm:flex-initial justify-center whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Assistant Studio 4 Étapes</span>
          </Button>

          <Button
            onClick={() => setIsNewGameOpen(true)}
            className="h-11 sm:h-12 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider gap-2 shadow-xl shadow-amber-500/20 cursor-pointer w-full sm:w-auto justify-center whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Créer un Jeu</span>
          </Button>
        </div>
      </div>

      {/* 3 KPIs Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="rounded-[2.5rem] border-purple-100 dark:border-purple-900/40 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                <Trophy className="w-6 h-6" />
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-none font-black text-[10px] uppercase">
                {games.length} Jeux Créés
              </Badge>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {games.filter(g => g.status === 'active' || g.status === 'lobby').length} <span className="text-xs text-emerald-600 font-bold">Parties En Ligne</span>
            </p>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Compétitions Pédagogiques
            </p>
          </div>
        </Card>

        <Card className="rounded-[2.5rem] border-purple-100 dark:border-purple-900/40 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                <Users className="w-6 h-6" />
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-none font-black text-[10px] uppercase">
                Presi-Joueurs
              </Badge>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              100% <span className="text-xs text-amber-600 font-bold">Connectivité</span>
            </p>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Présence Joueurs en Direct
            </p>
          </div>
        </Card>

        <Card className="rounded-[2.5rem] border-purple-100 dark:border-purple-900/40 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <Flame className="w-6 h-6" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-none font-black text-[10px] uppercase">
                5 Modes de Jeux
              </Badge>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              Interactif <span className="text-xs text-purple-600 font-bold">Plateau TV</span>
            </p>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Génération de Points & Confettis
            </p>
          </div>
        </Card>
      </div>

      {/* Main Tabs Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto w-full select-none scrollbar-none">
        <button
          onClick={() => setActiveTab('lobby')}
          className={cn(
            "px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-initial shrink-0",
            activeTab === 'lobby'
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50"
          )}
        >
          <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>En Direct & Régie ({games.filter(g => g.status === 'lobby' || g.status === 'active').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scheduled')}
          className={cn(
            "px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-initial shrink-0",
            activeTab === 'scheduled'
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50"
          )}
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Jeux Programmés ({games.filter(g => g.status === 'scheduled' || g.status === 'draft').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-initial shrink-0",
            activeTab === 'history'
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50"
          )}
        >
          <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Historique & Bilan ({games.filter(g => g.status === 'completed').length})</span>
        </button>
      </div>

      {/* TAB 1: EN DIRECT & RÉGIE TV */}
      {activeTab === 'lobby' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {games.map((g) => (
            <Card key={g.id} className="rounded-2xl sm:rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between">
              <CardHeader className="p-4 sm:p-6 md:p-8 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge className={cn(
                        "font-black text-[9px] uppercase border-none px-2.5 sm:px-3 py-1",
                        g.status === 'active' ? "bg-emerald-600 text-white animate-pulse" :
                        g.status === 'lobby' ? "bg-amber-500 text-white" : "bg-purple-600 text-white"
                      )}>
                        {g.status === 'active' ? '🔴 EN DIRECT' : g.status === 'lobby' ? '📺 Salle d Attente' : '🗓️ Programmé'}
                      </Badge>

                      <Badge variant="outline" className="text-slate-500 text-[9px] font-bold">
                        {g.mode === 'quiz_tv' ? '📺 Plateau Quiz TV' :
                         g.mode === 'buzzer_flash' ? '⚡ Buzzer Éclair' :
                         g.mode === 'marathon_survival' ? '❤️ Marathon Survie' :
                         g.mode === 'code_duel' ? '⚔️ Duel de Code' : '🏆 Défi Spécialité'}
                      </Badge>
                    </div>

                    <CardTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {g.title}
                    </CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-400 mt-1">
                      {g.specialty} • Promo {g.classCode} • {g.questions?.length || 0} Questions
                    </CardDescription>
                  </div>

                  <button
                    onClick={() => handleDeleteGame(g.id)}
                    className="text-slate-400 hover:text-red-500 p-2 cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                    title="Supprimer la session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 flex-1">
                {/* Connected Players list */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      Joueurs Connectés ({g.connectedPlayers?.length || 0}) :
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Prêts à Jouer
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap min-h-[48px] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    {g.connectedPlayers && g.connectedPlayers.length > 0 ? (
                      g.connectedPlayers.map((p: any, pi: number) => (
                        <div key={pi} className="flex items-center gap-1.5 sm:gap-2 bg-white dark:bg-slate-900 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                          <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                            <AvatarImage src={p.avatar} />
                            <AvatarFallback>{p.studentName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white">{p.studentName}</span>
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 font-bold italic">En attente de connexion des étudiants invités...</p>
                    )}
                  </div>
                </div>

                {/* Game Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                  <Button
                    onClick={() => handleLaunchGame(g.id)}
                    className="flex-1 h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 cursor-pointer gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Lancer la Partie en Direct
                  </Button>

                  <Button
                    onClick={() => {
                      setActiveLiveGame(g);
                    }}
                    variant="outline"
                    className="h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl font-bold text-xs gap-2 cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-purple-600" />
                    Entrer en Régie
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {games.length === 0 && (
            <div className="col-span-1 lg:col-span-2 text-center py-12 sm:py-16 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 space-y-4">
              <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500 mx-auto animate-pulse" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Aucun Jeu Multijoueur en Direct</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Cliquez sur "Nouveau Jeu Multijoueur" pour créer votre premier quiz interactif avec plateau TV et chrono !
              </p>
              <Button onClick={() => setIsNewGameOpen(true)} className="bg-purple-600 text-white font-black text-xs uppercase rounded-xl sm:rounded-2xl h-11 px-6">
                Créer un Jeu
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JEUX PROGRAMMÉS */}
      {activeTab === 'scheduled' && (
        <Card className="rounded-2xl sm:rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Programmation & Lancement Automatique à l'Avance
            </h3>
            <Badge className="bg-purple-100 text-purple-800 border-none font-black text-[10px] uppercase w-fit">
              {games.filter(g => g.scheduledAt).length} Programmé(s)
            </Badge>
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Vous pouvez programmer le lancement automatique d'une compétition à une heure précise, ou conserver le mode par défaut nécessitant votre clic de lancement manuel.
          </p>

          {/* Responsive Mobile Cards for Scheduled Games */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {games.map(g => (
              <div key={g.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">{g.title}</h4>
                    <p className="text-[10px] font-bold text-purple-600 uppercase mt-0.5">{g.mode}</p>
                  </div>
                  <Badge variant="outline" className="font-black text-[9px] uppercase shrink-0">
                    {g.isAutoLaunch ? "🚀 Lancement Auto" : "👆 Déclenchement Manuel"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium truncate max-w-[180px]">
                    {g.scheduledAt ? new Date(g.scheduledAt).toLocaleString('fr-FR') : "Lancement Manuel Uniquement"}
                  </span>
                  <Button
                    onClick={() => handleLaunchGame(g.id)}
                    className="h-8 px-3 rounded-xl bg-purple-600 text-white font-bold text-[11px] gap-1 cursor-pointer shrink-0"
                  >
                    <Play className="w-3 h-3" /> Lancer
                  </Button>
                </div>
              </div>
            ))}
            {games.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-6">Aucun jeu programmé pour le moment.</p>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
            <Table className="min-w-[620px]">
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400">Titre du Jeu</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400">Mode</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400">Date/Heure Programmée</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400">Mode de Lancement</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map(g => (
                  <TableRow key={g.id}>
                    <TableCell className="font-black text-sm text-slate-900 dark:text-white">
                      {g.title}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-purple-600">
                      {g.mode}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {g.scheduledAt ? new Date(g.scheduledAt).toLocaleString('fr-FR') : "Lancement Manuel Uniquement"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-black text-[9px] uppercase">
                        {g.isAutoLaunch ? "🚀 Lancement Auto" : "👆 Déclenchement Manuel"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleLaunchGame(g.id)}
                        className="h-9 px-4 rounded-xl bg-purple-600 text-white font-bold text-xs gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" /> Lancer Maintenant
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* TAB 3: HISTORIQUE & GRAPHIQUES */}
      {activeTab === 'history' && (
        <div className="space-y-6 sm:space-y-8">
          <Card className="rounded-2xl sm:rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Statistiques Globales & Bilan des Compétitions
              </h3>

              <div className="flex items-center gap-2">
                <Button onClick={handlePrintReport} variant="outline" className="h-9 sm:h-10 rounded-xl sm:rounded-2xl text-xs font-bold gap-2 flex-1 sm:flex-initial">
                  <Printer className="w-4 h-4 text-purple-600" /> Imprimer
                </Button>
                <Button onClick={handleDownloadPDF} className="h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-900 text-white text-xs font-bold gap-2 flex-1 sm:flex-initial">
                  <Download className="w-4 h-4" /> PDF
                </Button>
              </div>
            </div>

            {/* Printable summary */}
            <div ref={reportPrintRef} className="space-y-4 sm:space-y-6 p-2 sm:p-4">
              <div className="p-4 sm:p-6 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900 space-y-2">
                <h4 className="font-black text-sm uppercase text-purple-800 dark:text-purple-300">
                  Rapport de Performance - Jeux Éducatifs CFP-ITMC
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Nombre total de compétitions réalisées : <strong className="text-slate-900 dark:text-white">{games.length}</strong>. Taux de participation moyen : <strong className="text-emerald-600">96%</strong>.
                </p>
              </div>

              {/* Responsive Mobile Cards for History */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {games.map(g => (
                  <div key={g.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">{g.title}</h4>
                      <Badge className="bg-emerald-100 text-emerald-800 font-black text-[9px] uppercase shrink-0">
                        {g.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span className="font-bold text-purple-600 text-[11px]">{g.mode}</span>
                      <span className="text-[11px] font-medium">{g.connectedPlayers?.length || 0} participants</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Leaderboard Table */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                <Table className="min-w-[500px]">
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                    <TableRow>
                      <TableHead className="font-black text-[10px] uppercase text-slate-400">Compétition</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-slate-400">Mode</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-slate-400">Joueurs Total</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-slate-400 text-right">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {games.map(g => (
                      <TableRow key={g.id}>
                        <TableCell className="font-black text-sm text-slate-900 dark:text-white">
                          {g.title}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-purple-600">
                          {g.mode}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {g.connectedPlayers?.length || 0} participants
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-emerald-100 text-emerald-800 font-black text-[9px] uppercase">
                            {g.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* CREATE NEW GAME DIALOG */}
      <Dialog open={isNewGameOpen} onOpenChange={setIsNewGameOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-3xl rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-purple-600" />
              Créer un Jeu Éducatif Multijoueur
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Paramétrez le plateau télé, le chrono, les questions et le mode de compétition.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGame} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titre de la Compétition</label>
              <Input
                value={newGameData.title}
                onChange={e => setNewGameData({...newGameData, title: e.target.value})}
                placeholder="Ex: Le Grand Quiz TV • Génie Logiciel & Algorithmes"
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ULTRA-MODERN RESPONSIVE GAME TYPE SELECTOR */}
              <div className="space-y-3 col-span-1 sm:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    🎮 Architecture & Type de Jeu Éducatif (12 Expériences Uniques)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsGameTypePickerOpen(!isGameTypePickerOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer w-fit"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {isGameTypePickerOpen ? "Masquer la Galerie Visuelle" : "Explorer la Galerie Visuelle (12 Jeux)"}
                  </button>
                </div>

                {/* Selected Game Active Showcase Card */}
                {(() => {
                  const activeModeObj = GAME_MODES_CATALOG.find(m => m.id === newGameData.mode) || GAME_MODES_CATALOG[0];
                  return (
                    <div
                      onClick={() => setIsGameTypePickerOpen(!isGameTypePickerOpen)}
                      className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-purple-500/40 shadow-lg hover:border-purple-400 transition-all cursor-pointer overflow-hidden"
                    >
                      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                          <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl shadow-lg shrink-0", activeModeObj.gradient)}>
                            {activeModeObj.emoji}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="px-2 py-0.5 rounded-lg bg-white/10 text-[9px] font-black uppercase tracking-wider text-amber-300">
                                Jeu #{activeModeObj.num} / 12
                              </span>
                              <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 border border-purple-400/30 text-[9px] font-black uppercase tracking-wider text-purple-200">
                                {activeModeObj.categoryLabel}
                              </span>
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-[9px] font-bold text-emerald-300">
                                {activeModeObj.badge}
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                              {activeModeObj.title}
                            </h4>
                            <p className="text-xs text-slate-300 font-medium line-clamp-2 sm:line-clamp-1 mt-0.5">
                              {activeModeObj.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 border-white/10 pt-2.5 sm:pt-0">
                          <span className="px-3.5 py-2 rounded-xl bg-white/10 group-hover:bg-purple-600 text-white font-black text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5">
                            Changer de Type
                            <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-200", isGameTypePickerOpen && "rotate-90")} />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* EXPANDABLE INTERACTIVE BENTO SELECTION GALLERY */}
                <AnimatePresence>
                  {isGameTypePickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-purple-200 dark:border-purple-900/60 space-y-4">
                        {/* Category Filter Bar */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {[
                              { id: 'all', label: 'Tous les Jeux (12)' },
                              { id: 'speed', label: '⚡ Rapidité & Tournoi' },
                              { id: 'logic', label: '🧩 Logique & Labo' },
                              { id: 'simulation', label: '🏗️ Simulation & Rôle' },
                              { id: 'team', label: '👥 Équipe & Enquête' }
                            ].map(cat => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setGameTypeFilter(cat.id as any)}
                                className={cn(
                                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                  gameTypeFilter === cat.id
                                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                )}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Responsive 12-Game Bento Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                          {GAME_MODES_CATALOG.filter(m => gameTypeFilter === 'all' || m.category === gameTypeFilter).map((item) => {
                            const isSelected = newGameData.mode === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  const selMode = item.id;
                                  const templateData = defaultModeData[selMode] || {};
                                  setNewGameData({
                                    ...newGameData,
                                    mode: selMode,
                                    questions: templateData.questions || [
                                      {
                                        id: '1',
                                        text: `Défi ${item.title} : Question ou étape principale de l'exercice`,
                                        options: ['Choix A', 'Choix B', 'Choix C', 'Choix D'],
                                        correctAnswer: 'Choix A',
                                        points: 200,
                                        timeLimitSeconds: 15
                                      }
                                    ],
                                    ...templateData
                                  });
                                  setIsGameTypePickerOpen(false);
                                  toast.success(`🎮 Type de jeu « ${item.title} » sélectionné !`);
                                }}
                                className={cn(
                                  "text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-2.5 cursor-pointer group",
                                  isSelected
                                    ? "bg-purple-600/10 dark:bg-purple-950/70 border-purple-500 ring-2 ring-purple-500/30 shadow-md"
                                    : "bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-purple-400 dark:hover:border-purple-500/60"
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-base shadow-xs shrink-0", item.gradient)}>
                                      {item.emoji}
                                    </span>
                                    <div className="min-w-0">
                                      <span className="text-[9px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                                        #{item.num} • {item.categoryLabel}
                                      </span>
                                      <p className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
                                        {item.title}
                                      </p>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                                  {item.subtitle}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Classe Cible</label>
                <ModernSelect
                  dropdownTitle="Sélectionner la Classe Cible"
                  value={newGameData.classCode}
                  onChange={e => setNewGameData({...newGameData, classCode: e.target.value})}
                  className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs px-4"
                >
                  <option value="G1">🎓 Groupe 1 (G1) — Cycle Ingénieur 1ère Année</option>
                  <option value="G2">🎓 Groupe 2 (G2) — Cycle Ingénieur 2ème Année</option>
                  <option value="L3-GL">🎓 Licence 3 GL — Génie Logiciel & IA</option>
                </ModernSelect>
              </div>
            </div>

            {/* Audio Ambiance Configuration */}
            <div className="space-y-4 p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-300">
                  🎵 Régie Audio & Ambiance Plateau TV
                </label>
                <div className="flex items-center gap-2">
                  <ModernSelect
                    dropdownTitle="Charger une ambiance favorite"
                    onChange={(e) => {
                      if (e.target.value) {
                        try {
                          const fav = JSON.parse(e.target.value);
                          setNewGameData({ ...newGameData, selectedAudio: fav.audios });
                          toast.success(`Ambiance favorite "${fav.title}" chargée !`);
                        } catch(e) {}
                      }
                    }}
                    className="h-9 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 text-[10px] font-bold px-3 min-w-[170px]"
                  >
                    <option value="">⭐ Choisir un Favori Audio</option>
                    {audioFavorites.map((fav: any) => (
                      <option key={fav.id} value={JSON.stringify(fav)}>🎵 {fav.title}</option>
                    ))}
                  </ModernSelect>
                  <Button
                    type="button"
                    onClick={handleSaveFavoriteAudio}
                    className="h-9 px-3 rounded-xl bg-purple-600 text-white font-bold text-[9px] uppercase cursor-pointer shrink-0"
                  >
                    Sauver en Favori
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* BON */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500">Bonne Réponse (bon)</span>
                  <div className="flex items-center gap-1.5">
                    <ModernSelect
                      dropdownTitle="Effet sonore : Bonne Réponse"
                      value={newGameData.selectedAudio?.bon?.replace('/AUD/bon/', '')?.replace('.mp3', '') || '1'}
                      onChange={e => {
                        const num = e.target.value;
                        const audios = { ...newGameData.selectedAudio, bon: `/AUD/bon/${num}.mp3` };
                        setNewGameData({ ...newGameData, selectedAudio: audios });
                      }}
                      className="flex-1 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold px-2.5 text-slate-900 dark:text-white"
                    >
                      {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={String(n)}>✅ Son Bonne Réponse #{n}</option>)}
                    </ModernSelect>
                    <Button
                      type="button"
                      onClick={() => handlePlayPreview(`/AUD/bon/${newGameData.selectedAudio?.bon?.replace('/AUD/bon/', '')?.replace('.mp3', '') || '1'}.mp3`)}
                      variant="outline"
                      className="h-9 w-9 p-0 rounded-xl bg-white text-purple-600 hover:bg-purple-100 shrink-0 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* MOV */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500">Mauvaise Réponse (mov)</span>
                  <div className="flex items-center gap-1.5">
                    <ModernSelect
                      dropdownTitle="Effet sonore : Mauvaise Réponse"
                      value={newGameData.selectedAudio?.mov?.replace('/AUD/mov/', '')?.replace('.mp3', '') || '1'}
                      onChange={e => {
                        const num = e.target.value;
                        const audios = { ...newGameData.selectedAudio, mov: `/AUD/mov/${num}.mp3` };
                        setNewGameData({ ...newGameData, selectedAudio: audios });
                      }}
                      className="flex-1 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold px-2.5 text-slate-900 dark:text-white"
                    >
                      {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={String(n)}>❌ Son Mauvaise Réponse #{n}</option>)}
                    </ModernSelect>
                    <Button
                      type="button"
                      onClick={() => handlePlayPreview(`/AUD/mov/${newGameData.selectedAudio?.mov?.replace('/AUD/mov/', '')?.replace('.mp3', '') || '1'}.mp3`)}
                      variant="outline"
                      className="h-9 w-9 p-0 rounded-xl bg-white text-purple-600 hover:bg-purple-100 shrink-0 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* DEB */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500">Lobby / Attente (deb)</span>
                  <div className="flex items-center gap-1.5">
                    <ModernSelect
                      dropdownTitle="Musique de Salle d'Attente"
                      value={newGameData.selectedAudio?.deb?.replace('/AUD/deb/', '')?.replace('.mp3', '') || '1'}
                      onChange={e => {
                        const num = e.target.value;
                        const audios = { ...newGameData.selectedAudio, deb: `/AUD/deb/${num}.mp3` };
                        setNewGameData({ ...newGameData, selectedAudio: audios });
                      }}
                      className="flex-1 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold px-2.5 text-slate-900 dark:text-white"
                    >
                      {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={String(n)}>🎵 Ambiance Lobby #{n}</option>)}
                    </ModernSelect>
                    <Button
                      type="button"
                      onClick={() => handlePlayPreview(`/AUD/deb/${newGameData.selectedAudio?.deb?.replace('/AUD/deb/', '')?.replace('.mp3', '') || '1'}.mp3`)}
                      variant="outline"
                      className="h-9 w-9 p-0 rounded-xl bg-white text-purple-600 hover:bg-purple-100 shrink-0 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* PAN */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500">Compte à Rebours (pan)</span>
                  <div className="flex items-center gap-1.5">
                    <ModernSelect
                      dropdownTitle="Son du Compte à Rebours"
                      value={newGameData.selectedAudio?.pan?.replace('/AUD/pan/', '')?.replace('.mp3', '') || '1'}
                      onChange={e => {
                        const num = e.target.value;
                        const audios = { ...newGameData.selectedAudio, pan: `/AUD/pan/${num}.mp3` };
                        setNewGameData({ ...newGameData, selectedAudio: audios });
                      }}
                      className="flex-1 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold px-2.5 text-slate-900 dark:text-white"
                    >
                      {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={String(n)}>⏱️ Chrono Suspense #{n}</option>)}
                    </ModernSelect>
                    <Button
                      type="button"
                      onClick={() => handlePlayPreview(`/AUD/pan/${newGameData.selectedAudio?.pan?.replace('/AUD/pan/', '')?.replace('.mp3', '') || '1'}.mp3`)}
                      variant="outline"
                      className="h-9 w-9 p-0 rounded-xl bg-white text-purple-600 hover:bg-purple-100 shrink-0 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* VIC */}
                <div className="space-y-1 col-span-1 sm:col-span-2 md:col-span-1">
                  <span className="text-[9px] font-black uppercase text-slate-500">Victoire (vic)</span>
                  <div className="flex items-center gap-1.5">
                    <ModernSelect
                      dropdownTitle="Fanfare de Victoire"
                      value={newGameData.selectedAudio?.vic?.replace('/AUD/vic/', '')?.replace('.mp3', '') || '1'}
                      onChange={e => {
                        const num = e.target.value;
                        const audios = { ...newGameData.selectedAudio, vic: `/AUD/vic/${num}.mp3` };
                        setNewGameData({ ...newGameData, selectedAudio: audios });
                      }}
                      className="flex-1 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold px-2.5 text-slate-900 dark:text-white"
                    >
                      {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={String(n)}>🏆 Fanfare Victoire #{n}</option>)}
                    </ModernSelect>
                    <Button
                      type="button"
                      onClick={() => handlePlayPreview(`/AUD/vic/${newGameData.selectedAudio?.vic?.replace('/AUD/vic/', '')?.replace('.mp3', '') || '1'}.mp3`)}
                      variant="outline"
                      className="h-9 w-9 p-0 rounded-xl bg-white text-purple-600 hover:bg-purple-100 shrink-0 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Config & Dynamic Game Editors */}
            <div className="space-y-4 pt-2">
              {/* 1. DEFI CHRONO, DUEL, TOURNOI (Standard Multiple Choice Editor) */}
              {(newGameData.mode === 'defi_chrono' || newGameData.mode === 'duel' || newGameData.mode === 'tournoi' || !['puzzle_competences', 'simulation_pro', 'mission_equipe', 'enquete_pedagogique', 'gestion_entreprise', 'memory_pro', 'atelier_virtuel', 'jeu_role', 'chasse_tresor'].includes(newGameData.mode)) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-slate-400">Questions de la Compétition ({newGameData.questions?.length || 0})</label>
                    <span className="text-[9px] text-purple-600 font-bold">Chronomètre par Étape</span>
                  </div>

                  {newGameData.questions?.map((q, qIdx) => (
                    <div key={qIdx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 space-y-3 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-purple-600">Question #{qIdx + 1}</span>
                        <Input
                          type="number"
                          value={q.timeLimitSeconds}
                          onChange={e => {
                            const updated = [...newGameData.questions];
                            updated[qIdx].timeLimitSeconds = Number(e.target.value) || 15;
                            setNewGameData({...newGameData, questions: updated});
                          }}
                          className="w-28 h-8 text-xs font-mono font-bold bg-white dark:bg-slate-900 border-none"
                          placeholder="Chrono sec"
                        />
                      </div>

                      <Input
                        value={q.text}
                        onChange={e => {
                          const updated = [...newGameData.questions];
                          updated[qIdx].text = e.target.value;
                          setNewGameData({...newGameData, questions: updated});
                        }}
                        placeholder="Intitulé de la question..."
                        className="h-10 bg-white dark:bg-slate-900 border-none text-xs font-bold"
                        required
                      />

                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl">
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={q.correctAnswer === opt}
                              onChange={() => {
                                const updated = [...newGameData.questions];
                                updated[qIdx].correctAnswer = opt;
                                setNewGameData({...newGameData, questions: updated});
                              }}
                              className="accent-purple-600 cursor-pointer"
                            />
                            <Input
                              value={opt}
                              onChange={e => {
                                const updated = [...newGameData.questions];
                                const oldVal = updated[qIdx].options[optIdx];
                                const newVal = e.target.value;
                                updated[qIdx].options[optIdx] = newVal;
                                if (updated[qIdx].correctAnswer === oldVal) {
                                  updated[qIdx].correctAnswer = newVal;
                                }
                                setNewGameData({...newGameData, questions: updated});
                              }}
                              className="h-8 text-xs font-bold border-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewGameData({
                      ...newGameData,
                      questions: [
                        ...(newGameData.questions || []),
                        {
                          id: String(Date.now()),
                          text: `Question #${(newGameData.questions?.length || 0) + 1}`,
                          options: ['Option A', 'Option B', 'Option C', 'Option D'],
                          correctAnswer: 'Option A',
                          points: 200,
                          timeLimitSeconds: 15
                        }
                      ]
                    })}
                    className="w-full h-11 rounded-2xl border-dashed border-purple-300 text-purple-600 font-black text-xs uppercase"
                  >
                    + Ajouter une question au plateau
                  </Button>
                </div>
              )}

              {/* 2. PUZZLE DE COMPETENCES */}
              {newGameData.mode === 'puzzle_competences' && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 space-y-4 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-purple-600">Thème du Puzzle</span>
                    <Input
                      value={newGameData.puzzleTitle || ''}
                      onChange={e => setNewGameData({...newGameData, puzzleTitle: e.target.value})}
                      placeholder="Ex: Procédure de déploiement CI/CD"
                      className="h-10 bg-white dark:bg-slate-900 border-none font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">Étapes à ordonner (dans le bon ordre de haut en bas)</span>
                    {newGameData.puzzleSteps?.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Badge className="bg-purple-600 text-white font-mono shrink-0">#{idx + 1}</Badge>
                        <Input
                          value={step}
                          onChange={e => {
                            const steps = [...(newGameData.puzzleSteps || [])];
                            steps[idx] = e.target.value;
                            setNewGameData({...newGameData, puzzleSteps: steps});
                          }}
                          className="h-9 bg-white dark:bg-slate-900 border-none text-xs font-medium flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const steps = (newGameData.puzzleSteps || []).filter((_: any, i: number) => i !== idx);
                            setNewGameData({...newGameData, puzzleSteps: steps});
                          }}
                          className="text-red-500 hover:text-red-700 text-xs font-bold"
                        >
                          Retirer
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewGameData({
                        ...newGameData,
                        puzzleSteps: [...(newGameData.puzzleSteps || []), `Nouvelle étape #${(newGameData.puzzleSteps?.length || 0) + 1}`]
                      })}
                      className="h-9 rounded-xl border-dashed text-xs w-full font-bold"
                    >
                      + Ajouter une étape
                    </Button>
                  </div>
                </div>
              )}

              {/* 3. SIMULATION PROFESSIONNELLE */}
              {newGameData.mode === 'simulation_pro' && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 space-y-4 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-purple-600">Scénario de départ (Problématique métier)</span>
                    <textarea
                      value={newGameData.scenarios?.[0]?.scenario || ''}
                      onChange={e => {
                        const scs = [...(newGameData.scenarios || [{ scenario: '', options: [] }])];
                        scs[0].scenario = e.target.value;
                        setNewGameData({...newGameData, scenarios: scs});
                      }}
                      rows={3}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 text-xs font-medium border-none text-slate-900 dark:text-white"
                      placeholder="Décrivez la mise en situation..."
                    />
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-400">Décisions possibles pour l'étudiant :</span>
                    {newGameData.scenarios?.[0]?.options?.map((opt: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-2 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-purple-600">Option #{idx + 1}</span>
                          <Input
                            type="number"
                            value={opt.points}
                            onChange={e => {
                              const scs = [...(newGameData.scenarios || [])];
                              scs[0].options[idx].points = Number(e.target.value) || 0;
                              setNewGameData({...newGameData, scenarios: scs});
                            }}
                            className="w-20 h-7 text-xs font-mono font-bold"
                            placeholder="Points"
                          />
                        </div>
                        <Input
                          value={opt.text}
                          onChange={e => {
                            const scs = [...(newGameData.scenarios || [])];
                            scs[0].options[idx].text = e.target.value;
                            setNewGameData({...newGameData, scenarios: scs});
                          }}
                          placeholder="Intitulé de la décision..."
                          className="h-8 text-xs font-bold"
                        />
                        <Input
                          value={opt.consequence}
                          onChange={e => {
                            const scs = [...(newGameData.scenarios || [])];
                            scs[0].options[idx].consequence = e.target.value;
                            setNewGameData({...newGameData, scenarios: scs});
                          }}
                          placeholder="Conséquence et feedback immédiat..."
                          className="h-8 text-xs text-slate-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. MISSION EN EQUIPE */}
              {newGameData.mode === 'mission_equipe' && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 space-y-4 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-purple-600">Objectif Collectif</span>
                    <Input
                      value={newGameData.missionObjective || ''}
                      onChange={e => setNewGameData({...newGameData, missionObjective: e.target.value})}
                      placeholder="Ex: Résoudre l'incident de sécurité majeure"
                      className="h-10 bg-white dark:bg-slate-900 border-none font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">Missions / Tâches collaboratives requises</span>
                    {newGameData.missionTasks?.map((task: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={task}
                          onChange={e => {
                            const tasks = [...(newGameData.missionTasks || [])];
                            tasks[idx] = e.target.value;
                            setNewGameData({...newGameData, missionTasks: tasks});
                          }}
                          className="h-9 bg-white dark:bg-slate-900 border-none text-xs font-medium flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. ENQUETE PEDAGOGIQUE */}
              {newGameData.mode === 'enquete_pedagogique' && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 space-y-4 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-purple-600">Titre de l'Affaire</span>
                    <Input
                      value={newGameData.enqueteCase || ''}
                      onChange={e => setNewGameData({...newGameData, enqueteCase: e.target.value})}
                      placeholder="Ex: Le mystère du dump de la base clients"
                      className="h-10 bg-white dark:bg-slate-900 border-none font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">Pièces à conviction / Indices à débloquer</span>
                    {newGameData.enqueteClues?.map((clue: string, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <span className="text-[9px] font-bold text-purple-600">Indice #{idx + 1}</span>
                        <Input
                          value={clue}
                          onChange={e => {
                            const clues = [...(newGameData.enqueteClues || [])];
                            clues[idx] = e.target.value;
                            setNewGameData({...newGameData, enqueteClues: clues});
                          }}
                          className="h-9 bg-white dark:bg-slate-900 border-none text-xs"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Solution attendue (Mots clés)</span>
                    <Input
                      value={newGameData.enqueteSolution || ''}
                      onChange={e => setNewGameData({...newGameData, enqueteSolution: e.target.value})}
                      placeholder="Ex: Fuite de clé API GitHub"
                      className="h-9 bg-white dark:bg-slate-900 border-none text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* 6. GESTION D'ENTREPRISE */}
              {newGameData.mode === 'gestion_entreprise' && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 space-y-4 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-purple-600">Capital de Départ (FCFA / EUR)</span>
                    <Input
                      type="number"
                      value={newGameData.capital || 10000}
                      onChange={e => setNewGameData({...newGameData, capital: Number(e.target.value) || 10000})}
                      className="h-10 bg-white dark:bg-slate-900 border-none font-mono font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-400">Décisions d'Investissements / Achats de Stocks</span>
                    {newGameData.decisions?.map((dec: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-2 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-purple-600">{dec.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400">Coût d'achat</span>
                            <Input
                              type="number"
                              value={dec.cost}
                              onChange={e => {
                                const decs = [...(newGameData.decisions || [])];
                                decs[idx].cost = Number(e.target.value) || 0;
                                setNewGameData({...newGameData, decisions: decs});
                              }}
                              className="h-8 font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400">Revenu estimé</span>
                            <Input
                              type="number"
                              value={dec.revenue}
                              onChange={e => {
                                const decs = [...(newGameData.decisions || [])];
                                decs[idx].revenue = Number(e.target.value) || 0;
                                setNewGameData({...newGameData, decisions: decs});
                              }}
                              className="h-8 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. MEMORY PROFESSIONNEL */}
              {newGameData.mode === 'memory_pro' && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 space-y-4 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase text-purple-600">Cartes de paires à associer</span>
                  {newGameData.memoryPairs?.map((pair: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[9px] text-slate-400">Terme / Outil</span>
                        <Input
                          value={pair.term}
                          onChange={e => {
                            const pairs = [...(newGameData.memoryPairs || [])];
                            pairs[idx].term = e.target.value;
                            setNewGameData({...newGameData, memoryPairs: pairs});
                          }}
                          className="h-8 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400">Définition / Image</span>
                        <Input
                          value={pair.definition}
                          onChange={e => {
                            const pairs = [...(newGameData.memoryPairs || [])];
                            pairs[idx].definition = e.target.value;
                            setNewGameData({...newGameData, memoryPairs: pairs});
                          }}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 8. ATELIER / LABO VIRTUEL */}
              {newGameData.mode === 'atelier_virtuel' && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 space-y-4 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-purple-600">Intitulé du TP Technique</span>
                    <Input
                      value={newGameData.workshopTitle || ''}
                      onChange={e => setNewGameData({...newGameData, workshopTitle: e.target.value})}
                      placeholder="Ex: Configurer Nginx en Proxy Inverse"
                      className="h-10 bg-white dark:bg-slate-900 border-none font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-400">Étapes de manipulation et outils/commandes</span>
                    {newGameData.manipulationSteps?.map((step: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 space-y-2 text-xs">
                        <span className="font-bold text-purple-600">Étape #{idx + 1}</span>
                        <Input
                          value={step.instruction}
                          onChange={e => {
                            const steps = [...(newGameData.manipulationSteps || [])];
                            steps[idx].instruction = e.target.value;
                            setNewGameData({...newGameData, manipulationSteps: steps});
                          }}
                          placeholder="Consigne technique..."
                          className="h-8"
                        />
                        <Input
                          value={step.toolRequired}
                          onChange={e => {
                            const steps = [...(newGameData.manipulationSteps || [])];
                            steps[idx].toolRequired = e.target.value;
                            setNewGameData({...newGameData, manipulationSteps: steps});
                          }}
                          placeholder="Commande exacte ou outil..."
                          className="h-8 font-mono text-purple-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. JEU DE ROLE */}
              {newGameData.mode === 'jeu_role' && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 space-y-4 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-purple-600">Scénario de Négociation / Entretien</span>
                    <textarea
                      value={newGameData.roleScenario || ''}
                      onChange={e => setNewGameData({...newGameData, roleScenario: e.target.value})}
                      rows={3}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 text-xs font-medium border-none text-slate-900 dark:text-white"
                      placeholder="Contexte du jeu de rôle..."
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">Objections critiques soulevées par l'interlocuteur</span>
                    {newGameData.objections?.map((obj: string, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <span className="text-[9px] text-slate-400">Objection #{idx + 1}</span>
                        <Input
                          value={obj}
                          onChange={e => {
                            const objs = [...(newGameData.objections || [])];
                            objs[idx] = e.target.value;
                            setNewGameData({...newGameData, objections: objs});
                          }}
                          className="h-8 bg-white dark:bg-slate-900 border-none text-xs text-red-500 font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 10. CHASSE AU TRESOR */}
              {newGameData.mode === 'chasse_tresor' && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 space-y-4 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase text-purple-600">Parcours des Énigmes Successives</span>
                  {newGameData.treasureRiddles?.map((rid: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-2 border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black text-purple-600">Énigme #{idx + 1}</span>
                      <Input
                        value={rid.riddle}
                        onChange={e => {
                          const rids = [...(newGameData.treasureRiddles || [])];
                          rids[idx].riddle = e.target.value;
                          setNewGameData({...newGameData, treasureRiddles: rids});
                        }}
                        placeholder="Énigme secrète..."
                        className="h-8 text-xs font-bold"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={rid.hint}
                          onChange={e => {
                            const rids = [...(newGameData.treasureRiddles || [])];
                            rids[idx].hint = e.target.value;
                            setNewGameData({...newGameData, treasureRiddles: rids});
                          }}
                          placeholder="Indice d'aide"
                          className="h-8 text-xs"
                        />
                        <Input
                          value={rid.passkey}
                          onChange={e => {
                            const rids = [...(newGameData.treasureRiddles || [])];
                            rids[idx].passkey = e.target.value;
                            setNewGameData({...newGameData, treasureRiddles: rids});
                          }}
                          placeholder="Code secret de validation"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Publier & Inviter les Joueurs"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* LIVE TV CONTROL ROOM MODAL */}
      <Dialog open={!!activeLiveGame} onOpenChange={open => {
        if (!open) {
          setActiveLiveGame(null);
          setIsFullScreenMode(false);
          stopLobbyMusic();
          stopCountdownMusic();
        }
      }}>
        <DialogContent 
          showCloseButton={false}
          className={cn(
            "bg-slate-950 text-white shadow-2xl transition-all duration-300 border-none",
            isFullScreenMode 
              ? "!fixed !inset-0 !top-0 !left-0 !right-0 !bottom-0 !w-screen !max-w-none !h-screen !max-h-none !rounded-none !translate-x-0 !translate-y-0 p-3 sm:p-6 md:p-10 flex flex-col justify-between z-50 overflow-y-auto"
              : "w-[96vw] max-w-[96vw] sm:max-w-4xl rounded-2xl sm:rounded-[2.5rem] p-3 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto"
          )}
        >
          {/* Header Stage */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-slate-800 pb-3 sm:pb-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-purple-600 text-white font-black text-[9px] uppercase tracking-widest px-2.5 sm:px-3 py-1">
                  📺 PLATEAU TV EN DIRECT • RÉGIE ENSEIGNANT
                </Badge>
                {isFullScreenMode && (
                  <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2.5 sm:px-3 py-1">
                    ✨ MODE GRAND ÉCRAN ACTIVÉ
                  </Badge>
                )}
              </div>
              <h3 className={cn("font-black tracking-tight text-white leading-tight break-words", isFullScreenMode ? "text-xl sm:text-2xl md:text-3xl lg:text-4xl" : "text-base sm:text-lg md:text-xl")}>
                {activeLiveGame?.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto shrink-0">
              <Button
                type="button"
                onClick={() => setIsFullScreenMode(!isFullScreenMode)}
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] sm:text-xs font-black uppercase tracking-wider flex-1 sm:flex-initial"
              >
                {isFullScreenMode ? "🖥️ Écran Normal" : "🖥️ Grand Écran TV"}
              </Button>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold text-slate-300 flex-1 sm:flex-initial justify-center sm:justify-start">
                <input
                  type="checkbox"
                  checked={isAutoAdvanceEnabled}
                  onChange={e => {
                    setIsAutoAdvanceEnabled(e.target.checked);
                    const curTimeLimit = activeLiveGame?.questions?.[liveLobbyState?.currentQuestionIndex || 0]?.timeLimitSeconds || 15;
                    toast.success(e.target.checked ? `Enchaînement automatique activé (${curTimeLimit}s)` : "Enchaînement automatique désactivé");
                  }}
                  className="rounded border-purple-500 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5 sm:h-4 sm:w-4"
                />
                <span>Enchaînement ({activeLiveGame?.questions?.[liveLobbyState?.currentQuestionIndex || 0]?.timeLimitSeconds || 15}s)</span>
              </label>

              <Button
                onClick={() => {
                  setActiveLiveGame(null);
                  setIsFullScreenMode(false);
                  stopLobbyMusic();
                  stopCountdownMusic();
                }}
                variant="outline"
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl border-red-950 bg-red-950/20 text-red-400 hover:bg-red-900 hover:text-white text-[10px] sm:text-xs font-black uppercase cursor-pointer flex-1 sm:flex-initial"
              >
                Fermer
              </Button>
            </div>
          </div>

          {activeLiveGame && (
            <div className={cn("space-y-4 sm:space-y-6 flex-1 mt-3 sm:mt-4 flex flex-col justify-between", isFullScreenMode && "py-2 sm:py-4 gap-4 sm:gap-8")}>
              
              {/* BIG CENTER SHOWCASE */}
              <div className={cn(
                "rounded-2xl sm:rounded-3xl border border-slate-800 p-4 sm:p-6 space-y-4 sm:space-y-6 relative overflow-hidden",
                isFullScreenMode 
                  ? "bg-slate-900/40 p-4 sm:p-8 flex-1 flex flex-col justify-center gap-4 sm:gap-8 shadow-inner shadow-purple-900/10" 
                  : "bg-slate-900"
              )}>
                {/* Countdown Timer Big Circle & Auto Advance Banner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
                    <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] sm:text-xs uppercase px-2.5 sm:px-3.5 py-1">
                      Question #{ (liveLobbyState?.currentQuestionIndex || 0) + 1 } sur {activeLiveGame.questions?.length || 1}
                    </Badge>
                    <Badge variant="outline" className="text-slate-400 border-slate-700 text-[10px] sm:text-xs font-black">
                      Mode : {activeLiveGame.mode === 'quiz_tv' ? '📺 Plateau Quiz' : '⚡ Chrono / Buzzer'}
                    </Badge>
                  </div>

                  {revealCountdown !== null ? (
                    <div className="flex items-center gap-2 sm:gap-3 bg-purple-900/60 border border-purple-500 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl animate-pulse">
                      <span className="text-[11px] sm:text-xs font-black uppercase text-purple-200">Enchaînement automatique dans :</span>
                      <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono animate-bounce">{revealCountdown}s</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3">
                      {!isAnswerRevealed ? (
                        <Button
                          onClick={handleRevealAnswer}
                          className="h-9 sm:h-10 px-4 sm:px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] sm:text-xs uppercase cursor-pointer shadow-lg shadow-amber-500/20"
                        >
                          👁️ Révéler la Réponse
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleNextQuestion(activeLiveGame.id)}
                          className="h-9 sm:h-10 px-4 sm:px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-[11px] sm:text-xs uppercase gap-2 cursor-pointer shadow-lg shadow-purple-600/40 animate-pulse"
                        >
                          <ChevronRight className="w-4 h-4" /> Question Suivante
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Big Question / Game Stage Centerpiece (Dynamically Customized for 12 Modes) */}
                <div className="w-full py-2 sm:py-4">
                  {/* Standard MCQ (Défi Chrono, Duel, Tournoi) */}
                  {(activeLiveGame.mode === 'defi_chrono' || activeLiveGame.mode === 'duel' || activeLiveGame.mode === 'tournoi' || !['puzzle_competences', 'simulation_pro', 'mission_equipe', 'enquete_pedagogique', 'gestion_entreprise', 'memory_pro', 'atelier_virtuel', 'jeu_role', 'chasse_tresor'].includes(activeLiveGame.mode)) && (
                    <div className="space-y-4">
                      <div className="text-center max-w-4xl mx-auto">
                        <h2 className={cn(
                          "font-black text-white leading-tight tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.15)] break-words px-2",
                          isFullScreenMode ? "text-xl sm:text-3xl md:text-4xl lg:text-5xl" : "text-base sm:text-xl md:text-2xl"
                        )}>
                          {activeLiveGame.questions?.[liveLobbyState?.currentQuestionIndex || 0]?.text}
                        </h2>
                      </div>

                      {/* Countdown Timer Big View */}
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 md:gap-12 pt-4">
                        <div className={cn(
                          "w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 font-mono font-black text-2xl sm:text-4xl flex items-center justify-center transition-all duration-300 shadow-xl",
                          teacherTimerLeft <= 5 
                            ? "bg-red-950/80 text-red-400 border-red-500 animate-bounce shadow-red-500/40" 
                            : "bg-purple-950/80 text-purple-300 border-purple-500 shadow-purple-500/40"
                        )}>
                          {teacherTimerLeft}s
                        </div>

                        {isAnswerRevealed && (
                          <div className="bg-emerald-950/90 border-2 border-emerald-500 p-3 sm:p-5 rounded-2xl sm:rounded-3xl text-center space-y-1 shadow-lg shadow-emerald-500/20 max-w-md animate-pulse">
                            <p className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Réponse Correcte</p>
                            <p className="text-base sm:text-xl font-black text-emerald-300">
                              {activeLiveGame.questions?.[liveLobbyState?.currentQuestionIndex || 0]?.correctAnswer}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Big Neon Choices Grid */}
                      <div className={cn(
                        "grid gap-2.5 sm:gap-4 mt-6 w-full",
                        isFullScreenMode ? "grid-cols-1 sm:grid-cols-2 max-w-5xl mx-auto" : "grid-cols-1 sm:grid-cols-2"
                      )}>
                        {activeLiveGame.questions?.[liveLobbyState?.currentQuestionIndex || 0]?.options?.map((opt: string, i: number) => {
                          const isCorrectOption = opt === activeLiveGame.questions?.[liveLobbyState?.currentQuestionIndex || 0]?.correctAnswer;
                          return (
                            <div 
                              key={i} 
                              className={cn(
                                "p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 flex items-center justify-between text-xs sm:text-sm font-black",
                                isAnswerRevealed
                                  ? isCorrectOption
                                    ? "bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/30 scale-101"
                                    : "bg-slate-900/30 border-slate-950 text-slate-600 opacity-40 scale-98"
                                  : "bg-slate-800 border-slate-700 text-slate-200"
                              )}
                            >
                              <span className="break-words pr-2">{opt}</span>
                              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-900/60 flex items-center justify-center text-xs font-black text-slate-400">
                                  {String.fromCharCode(65 + i)}
                                </span>
                                {isAnswerRevealed && isCorrectOption && <span className="text-emerald-400 text-sm">✅</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. Puzzle de Compétences */}
                  {activeLiveGame.mode === 'puzzle_competences' && (
                    <div className="text-center space-y-4 max-w-xl mx-auto">
                      <Badge className="bg-purple-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-xl">🧩 PUZZLE DE COMPÉTENCES</Badge>
                      <h3 className="text-lg sm:text-2xl font-black text-white">{activeLiveGame.puzzleTitle || "Algorithme de Tri Fusion"}</h3>
                      <div className="space-y-2 pt-2 text-left">
                        {(activeLiveGame.puzzleSteps || []).map((step: string, sIdx: number) => (
                          <div key={sIdx} className="p-3 rounded-xl bg-slate-800 border border-slate-700 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-3">
                            <Badge className="bg-purple-600 text-white font-mono h-6 w-6 rounded-full flex items-center justify-center shrink-0">#{sIdx + 1}</Badge>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Simulation Professionnelle */}
                  {activeLiveGame.mode === 'simulation_pro' && (
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                      <Badge className="bg-blue-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-xl">🏗️ SIMULATION PROFESSIONNELLE MÉTIER</Badge>
                      <p className="text-sm sm:text-base font-bold text-slate-200 bg-slate-800 p-4 rounded-xl">{activeLiveGame.scenarios?.[0]?.scenario || "Mise en situation..."}</p>
                      <div className="grid grid-cols-1 gap-3 text-left pt-2">
                        {(activeLiveGame.scenarios?.[0]?.options || []).map((opt: any, oIdx: number) => (
                          <div key={oIdx} className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-purple-400">Option #{oIdx + 1}</span>
                              <Badge className="bg-purple-900 text-purple-300 font-mono text-[9px] font-bold">+{opt.points} PTS</Badge>
                            </div>
                            <p className="text-xs font-black text-white">{opt.text}</p>
                            {isAnswerRevealed && <p className="text-[11px] text-emerald-400 font-medium">➡️ Conséquence : {opt.consequence}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Mission en Équipe */}
                  {activeLiveGame.mode === 'mission_equipe' && (
                    <div className="text-center space-y-4 max-w-xl mx-auto">
                      <Badge className="bg-emerald-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-xl">👥 MISSION EN ÉQUIPE</Badge>
                      <h3 className="text-lg sm:text-2xl font-black text-white">Cible : {activeLiveGame.missionObjective}</h3>
                      <div className="space-y-2 pt-2 text-left">
                        {(activeLiveGame.missionTasks || []).map((task: string, tIdx: number) => (
                          <div key={tIdx} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Enquête Pédagogique */}
                  {activeLiveGame.mode === 'enquete_pedagogique' && (
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                      <Badge className="bg-amber-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-xl">🕵️ ENQUÊTE PÉDAGOGIQUE</Badge>
                      <h3 className="text-base sm:text-xl font-black text-white">Affaire : {activeLiveGame.enqueteCase}</h3>
                      <div className="grid grid-cols-1 gap-2 text-left pt-2">
                        {(activeLiveGame.enqueteClues || []).map((clue: string, cIdx: number) => (
                          <div key={cIdx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                            <strong className="text-amber-400 font-bold block mb-1">🔍 Pièce à conviction #{cIdx + 1}</strong>
                            {clue}
                          </div>
                        ))}
                      </div>
                      {isAnswerRevealed && (
                        <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 max-w-sm mx-auto text-center text-emerald-300 font-bold text-xs uppercase animate-pulse">
                          Solution : {activeLiveGame.enqueteSolution}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 6. Gestion d’Entreprise */}
                  {activeLiveGame.mode === 'gestion_entreprise' && (
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                      <Badge className="bg-rose-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-xl">💰 GESTION D'ENTREPRISE</Badge>
                      <h3 className="text-base sm:text-lg font-bold text-white">Capital de l'Entreprise : <strong className="text-emerald-400 font-black">{activeLiveGame.capital || 15000} FCFA</strong></h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                        {(activeLiveGame.decisions || []).map((dec: any, dIdx: number) => (
                          <div key={dIdx} className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                            <span className="text-[10px] font-black text-rose-400">{dec.name}</span>
                            <p className="text-xs text-slate-300 font-medium">Coût : {dec.cost} FCFA</p>
                            <p className="text-xs text-emerald-400 font-bold">Retour : +{dec.revenue} FCFA</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Risque : {dec.risk}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 7. Memory Professionnel */}
                  {activeLiveGame.mode === 'memory_pro' && (
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                      <Badge className="bg-purple-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-xl">🧠 MEMORY PROFESSIONNEL</Badge>
                      <h3 className="text-base sm:text-lg font-black text-white">Associer les Termes & Définitions</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                        {(activeLiveGame.memoryPairs || []).map((pair: any, pIdx: number) => (
                          <div key={pIdx} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex flex-col justify-between h-24 text-center">
                            <strong className="text-purple-400 font-black block border-b border-slate-700 pb-1">{pair.term}</strong>
                            <p className="text-[10px] text-slate-300 leading-tight mt-1">{isAnswerRevealed ? pair.definition : "🔒 [Masqué]"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8. Atelier / Laboratoire Virtuel */}
                  {activeLiveGame.mode === 'atelier_virtuel' && (
                    <div className="text-center space-y-4 max-w-xl mx-auto">
                      <Badge className="bg-indigo-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-xl">🧪 ATELIER VIRTUEL</Badge>
                      <h3 className="text-lg sm:text-xl font-black text-white">{activeLiveGame.workshopTitle}</h3>
                      <div className="space-y-2 pt-2 text-left">
                        {(activeLiveGame.manipulationSteps || []).map((step: any, sIdx: number) => (
                          <div key={sIdx} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200">
                            <strong className="text-indigo-400 block font-bold mb-1">Étape #{sIdx + 1} : {step.instruction}</strong>
                            {isAnswerRevealed && <code className="block bg-slate-950 p-1.5 rounded text-[10px] font-mono text-emerald-400">{step.toolRequired}</code>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 9. Jeu de Rôle Professionnel */}
                  {activeLiveGame.mode === 'jeu_role' && (
                    <div className="text-center space-y-4 max-w-xl mx-auto">
                      <Badge className="bg-pink-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-xl">🗣️ JEU DE RÔLE PROFESSIONNEL</Badge>
                      <p className="text-xs sm:text-sm font-bold text-slate-200 bg-slate-800 p-3 rounded-xl">{activeLiveGame.roleScenario}</p>
                      <div className="space-y-2 pt-2 text-left">
                        {(activeLiveGame.objections || []).map((obj: string, oIdx: number) => (
                          <div key={oIdx} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                            <strong className="text-red-400 font-bold block mb-0.5">⚠️ Objection du Client #{oIdx + 1}</strong>
                            <p className="text-slate-200">{obj}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 10. Chasse au Trésor Pédagogique */}
                  {activeLiveGame.mode === 'chasse_tresor' && (
                    <div className="text-center space-y-4 max-w-xl mx-auto">
                      <Badge className="bg-yellow-600 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-xl">🗺️ CHASSE AU TRÉSOR PÉDAGOGIQUE</Badge>
                      <h3 className="text-base sm:text-lg font-black text-white">Résoudre les Énigmes Successives</h3>
                      <div className="space-y-2 pt-2 text-left">
                        {(activeLiveGame.treasureRiddles || []).map((rid: any, rIdx: number) => (
                          <div key={rIdx} className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                            <strong className="text-yellow-400 font-black block text-xs">🗝️ Énigme #{rIdx + 1}</strong>
                            <p className="text-xs text-slate-200">{rid.riddle}</p>
                            {isAnswerRevealed && (
                              <div className="text-[10px] text-emerald-400 font-bold bg-slate-900 px-2 py-1 rounded inline-block">
                                Indice : {rid.hint} | Clé : {rid.passkey}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* REAL-TIME PLAYER RESPONSES TRACKER BOARD */}
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 sm:pb-3 flex-wrap gap-2">
                  <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4" /> Réponses des Étudiants en Direct ({liveLobbyState?.connectedPlayers?.length || 0})
                  </h4>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-800 font-bold text-[9px] sm:text-[10px]">
                    Synchro Temps Réel Instantanée
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 max-h-[200px] sm:max-h-[220px] overflow-y-auto pr-1">
                  {liveLobbyState?.connectedPlayers?.map((p: any, pi: number) => {
                    const currentResponses = liveLobbyState?.responses?.filter((r: any) => r.questionIndex === (liveLobbyState?.currentQuestionIndex || 0)) || [];
                    const playerResponse = currentResponses.find((r: any) => r.studentId === p.studentId);
                    const hasResponded = !!playerResponse;
                    
                    return (
                      <div 
                        key={pi} 
                        className={cn(
                          "p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-300 flex items-center gap-2 sm:gap-2.5",
                          hasResponded 
                            ? isAnswerRevealed
                              ? playerResponse.isCorrect
                                ? "bg-emerald-950/80 border-emerald-800 text-emerald-300"
                                : "bg-red-950/80 border-red-800 text-red-300"
                              : "bg-purple-950/80 border-purple-800 text-purple-300"
                            : "bg-slate-800/80 border-slate-700 text-slate-400"
                        )}
                      >
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border border-purple-500 shrink-0">
                          <AvatarImage src={p.avatar} />
                          <AvatarFallback>{p.studentName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-[11px] font-black truncate text-white">{p.studentName}</p>
                          <p className="text-[8px] sm:text-[9px] font-bold truncate">
                            {hasResponded
                              ? isAnswerRevealed
                                ? playerResponse.isCorrect 
                                  ? "🏆 Correct (+150XP)" 
                                  : "❌ Incorrect"
                                : "✅ A Répondu"
                              : "⏳ Réfléchit..."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* STUDIO PRO 4-STEP WIZARD MODAL */}
      <GameCreatorModal
        isOpen={isStudioWizardOpen}
        onClose={() => setIsStudioWizardOpen(false)}
        teacherId={teacher?.id || 'TCH-001'}
        teacherName={teacher?.name || 'Professeur CFP-ITMC'}
        classesList={[
          { id: 'G1', code: 'G1', name: 'Groupe 1 (G1)', level: 'Licence 1' },
          { id: 'G2', code: 'G2', name: 'Groupe 2 (G2)', level: 'Licence 2' },
          { id: 'L3-GL', code: 'L3-GL', name: 'Licence 3 GL', level: 'Licence 3' },
        ]}
        onSaveGame={async (payload) => {
          const res = await fetch('/api/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            fetchGames();
          }
        }}
      />
    </div>
  );
}
