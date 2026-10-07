import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ModernSelect } from "@/components/ui/select";
import {
  Sparkles,
  Gamepad2,
  Timer,
  Puzzle,
  ShieldAlert,
  Users,
  Search,
  TrendingUp,
  Brain,
  FlaskConical,
  MessageSquare,
  Compass,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Layers,
  Volume2,
  Trash2,
  Plus,
  Copy,
  Info
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { GameType, GameMode, GameDifficulty, EducationalGame, GameTemplate } from '@/types/games';
import { GAME_TEMPLATES } from '@/data/gameTemplates';
import { gameAudio, SoundCategory } from '@/lib/gameAudio';

interface GameCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameSaved?: (game: EducationalGame) => void;
  onSaveGame?: (game: any) => Promise<void> | void;
  editingGame?: EducationalGame | null;
  teacherId?: string;
  teacherName?: string;
  classesList?: any[];
}

export const GAME_TYPES_LIST: Array<{
  id: GameType;
  name: string;
  icon: any;
  shortDesc: string;
  badge: string;
  color: string;
}> = [
  {
    id: 'chrono_challenge',
    name: '🎯 Défi Chrono',
    icon: Timer,
    shortDesc: 'Réponses ou tâches sous chronomètre strict avec bonus de vélocité.',
    badge: 'Vitesse & Réflexes',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'puzzle',
    name: '🧩 Puzzle & Ordonnancement',
    icon: Puzzle,
    shortDesc: 'Reconstruction de procédures, glisser-déposer et classement logique.',
    badge: 'Logique & Méthode',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'simulation',
    name: '🏗️ Simulation Professionnelle',
    icon: ShieldAlert,
    shortDesc: 'Scénarios réels avec décisions sous tension et analyse de conséquences.',
    badge: 'Mise en Situation',
    color: 'from-rose-600 to-red-700'
  },
  {
    id: 'team_mission',
    name: '👥 Mission en Équipe',
    icon: Users,
    shortDesc: 'Mission collaborative où chaque rôle apporte des pièces du livrable.',
    badge: 'Coopération',
    color: 'from-purple-600 to-indigo-700'
  },
  {
    id: 'investigation',
    name: '🕵️ Enquête Pédagogique',
    icon: Search,
    shortDesc: 'Indices, pièces à conviction, documents d\'audit et résolution.',
    badge: 'Déduction & Forensics',
    color: 'from-yellow-600 to-amber-700'
  },
  {
    id: 'business_mgmt',
    name: '💰 Gestion d\'Entreprise',
    icon: TrendingUp,
    shortDesc: 'Budget, trésorerie, investissements, dépenses et pilotage stratégique.',
    badge: 'Finance & Stratégie',
    color: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'memory',
    name: '🧠 Memory Professionnel',
    icon: Brain,
    shortDesc: 'Association de paires : protocoles, normes, concepts et définitions.',
    badge: 'Mémorisation',
    color: 'from-violet-600 to-purple-800'
  },
  {
    id: 'virtual_lab',
    name: '🧪 Atelier / Lab Virtuel',
    icon: FlaskConical,
    shortDesc: 'Manipulation technique, diagnostics de pannes et expérimentation.',
    badge: 'Pratique Technique',
    color: 'from-teal-600 to-emerald-700'
  },
  {
    id: 'role_play',
    name: '🗣️ Jeu de Rôle & Entretien',
    icon: MessageSquare,
    shortDesc: 'Communication, négociation, vente, gestion de conflit et objections.',
    badge: 'Soft Skills & Pitch',
    color: 'from-pink-600 to-rose-700'
  },
  {
    id: 'treasure_hunt',
    name: '🗺️ Chasse au Trésor',
    icon: Compass,
    shortDesc: 'Parcours d\'énigmes successives débloquant progressivement les étapes.',
    badge: 'Aventure & Énigmes',
    color: 'from-amber-600 to-yellow-500'
  }
];

export function GameCreatorModal({
  isOpen,
  onClose,
  onGameSaved,
  onSaveGame,
  editingGame,
  teacherId = 'TCH-001',
  teacherName = 'Dr. Jean-Paul Kamga',
  classesList = []
}: GameCreatorModalProps) {
  // Step navigation: 0 = Template Picker / From scratch, 1 = Infos, 2 = Mode, 3 = Params, 4 = Scoring & Content
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showTemplatePicker, setShowTemplatePicker] = useState<boolean>(!editingGame);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formation, setFormation] = useState('Génie Logiciel');
  const [classId, setClassId] = useState('G1-GL');
  const [className, setClassName] = useState('G1 Génie Logiciel');
  const [subject, setSubject] = useState('Algorithmique & Programmation');
  const [level, setLevel] = useState('Licence 1');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('intermediate');
  const [gameType, setGameType] = useState<GameType>('chrono_challenge');
  const [gameMode, setGameMode] = useState<GameMode>('multiplayer');

  // Step 3: Parameters
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [timeLimitPerRoundSeconds, setTimeLimitPerRoundSeconds] = useState(30);
  const [maxPlayers, setMaxPlayers] = useState(30);
  const [teamCount, setTeamCount] = useState(2);
  const [playersPerTeam, setPlayersPerTeam] = useState(4);
  const [roundsCount, setRoundsCount] = useState(3);
  const [maxAttempts, setMaxAttempts] = useState(1);

  // Step 4: Scoring Rules
  const [correctPoints, setCorrectPoints] = useState(200);
  const [wrongPenalty, setWrongPenalty] = useState(50);
  const [speedBonus, setSpeedBonus] = useState(true);
  const [speedBonusMax, setSpeedBonusMax] = useState(100);
  const [streakBonus, setStreakBonus] = useState(50);
  const [missionSuccessPoints, setMissionSuccessPoints] = useState(500);
  const [hintPenalty, setHintPenalty] = useState(20);
  const [academicCredits, setAcademicCredits] = useState(10);

  // Content Items
  const [contentItems, setContentItems] = useState<any[]>([
    {
      id: 'q1',
      title: 'Question / Manche 1',
      prompt: 'Intitulé de la première épreuve ou question...',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      points: 200,
      timeLimitSeconds: 30
    }
  ]);

  // Audio Testing Category
  const [testedAudioCategory, setTestedAudioCategory] = useState<SoundCategory | null>(null);

  // Reset or fill form when modal opens or editingGame changes
  useEffect(() => {
    if (editingGame) {
      setShowTemplatePicker(false);
      setTitle(editingGame.title || '');
      setDescription(editingGame.description || '');
      setFormation(editingGame.formation || editingGame.specialty || 'Génie Logiciel');
      setClassId(editingGame.classId || editingGame.classCode || 'G1-GL');
      setClassName(editingGame.className || editingGame.classCode || 'G1 Génie Logiciel');
      setSubject(editingGame.subject || 'Informatique');
      setLevel(editingGame.level || 'Licence 1');
      setDifficulty(editingGame.difficulty || 'intermediate');
      setGameType(editingGame.gameType || 'chrono_challenge');
      setGameMode(editingGame.gameMode || 'multiplayer');

      if (editingGame.parameters) {
        setDurationMinutes(editingGame.parameters.durationMinutes || 15);
        setTimeLimitPerRoundSeconds(editingGame.parameters.timeLimitPerRoundSeconds || 30);
        setMaxPlayers(editingGame.parameters.maxPlayers || 30);
        setTeamCount(editingGame.parameters.teamCount || 2);
        setPlayersPerTeam(editingGame.parameters.playersPerTeam || 4);
        setRoundsCount(editingGame.parameters.roundsCount || 3);
        setMaxAttempts(editingGame.parameters.maxAttempts || 1);
      }

      if (editingGame.scoringRules) {
        setCorrectPoints(editingGame.scoringRules.correctPoints ?? 200);
        setWrongPenalty(editingGame.scoringRules.wrongPenalty ?? 50);
        setSpeedBonus(editingGame.scoringRules.speedBonus ?? true);
        setSpeedBonusMax(editingGame.scoringRules.speedBonusMax ?? 100);
        setStreakBonus(editingGame.scoringRules.streakBonus ?? 50);
        setMissionSuccessPoints(editingGame.scoringRules.missionSuccessPoints ?? 500);
        setHintPenalty(editingGame.scoringRules.hintPenalty ?? 20);
        setAcademicCredits(editingGame.scoringRules.academicCredits ?? 10);
      }

      if (Array.isArray(editingGame.content) && editingGame.content.length > 0) {
        setContentItems(editingGame.content);
      } else if (Array.isArray(editingGame.questions) && editingGame.questions.length > 0) {
        setContentItems(editingGame.questions);
      }
      setCurrentStep(1);
    } else {
      setShowTemplatePicker(true);
      setCurrentStep(1);
    }
  }, [editingGame, isOpen]);

  // Apply template
  const applyTemplate = (tpl: GameTemplate) => {
    setTitle(tpl.title);
    setDescription(tpl.description);
    setGameType(tpl.gameType);
    setGameMode(tpl.gameMode);
    setFormation(tpl.defaultFormation);
    setSubject(tpl.defaultSubject);
    setLevel(tpl.level);
    setDifficulty(tpl.difficulty);
    setDurationMinutes(tpl.parameters.durationMinutes);
    setTimeLimitPerRoundSeconds(tpl.parameters.timeLimitPerRoundSeconds);
    setMaxPlayers(tpl.parameters.maxPlayers);
    setTeamCount(tpl.parameters.teamCount);
    setPlayersPerTeam(tpl.parameters.playersPerTeam);
    setRoundsCount(tpl.parameters.roundsCount);
    setMaxAttempts(tpl.parameters.maxAttempts);
    setCorrectPoints(tpl.scoringRules.correctPoints);
    setWrongPenalty(tpl.scoringRules.wrongPenalty);
    setSpeedBonus(tpl.scoringRules.speedBonus);
    setSpeedBonusMax(tpl.scoringRules.speedBonusMax);
    setStreakBonus(tpl.scoringRules.streakBonus);
    setMissionSuccessPoints(tpl.scoringRules.missionSuccessPoints);
    setHintPenalty(tpl.scoringRules.hintPenalty);
    setAcademicCredits(tpl.scoringRules.academicCredits);
    setContentItems(tpl.sampleContent);

    setShowTemplatePicker(false);
    setCurrentStep(1);
    gameAudio.click();
    toast.success(`Modèle "${tpl.title.split('•')[0]}" appliqué avec succès !`);
  };

  const handleStartFromScratch = () => {
    setShowTemplatePicker(false);
    setCurrentStep(1);
    gameAudio.click();
  };

  // Add question/content item
  const handleAddContentItem = () => {
    const newItem = {
      id: `item_${Date.now()}`,
      title: `Épreuve #${contentItems.length + 1}`,
      prompt: 'Énoncé de l\'épreuve...',
      options: ['Choix 1', 'Choix 2', 'Choix 3', 'Choix 4'],
      correctAnswer: 'Choix 1',
      points: correctPoints,
      timeLimitSeconds: timeLimitPerRoundSeconds
    };
    setContentItems([...contentItems, newItem]);
    gameAudio.click();
  };

  const handleRemoveContentItem = (index: number) => {
    if (contentItems.length <= 1) {
      toast.error("Le jeu doit comporter au moins une épreuve ou question.");
      return;
    }
    setContentItems(contentItems.filter((_, i) => i !== index));
    gameAudio.pointsDown();
  };

  // Audio preview helper
  const handleTestAudio = (category: SoundCategory) => {
    setTestedAudioCategory(category);
    gameAudio.play(category);
    setTimeout(() => setTestedAudioCategory(null), 1200);
  };

  // Submit Game to Server
  const handleSubmitGame = async (status: 'published' | 'draft' | 'scheduled') => {
    if (!title.trim()) {
      toast.error("Veuillez renseigner le titre du jeu.");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        gameType,
        gameMode,
        formation,
        classId,
        className,
        classCode: classId,
        subject,
        level,
        difficulty,
        teacherId,
        teacherName,
        status,
        parameters: {
          durationMinutes,
          timeLimitPerRoundSeconds,
          maxPlayers,
          teamCount,
          playersPerTeam,
          roundsCount: contentItems.length || roundsCount,
          maxAttempts
        },
        scoringRules: {
          correctPoints,
          wrongPenalty,
          speedBonus,
          speedBonusMax,
          streakBonus,
          missionSuccessPoints,
          hintPenalty,
          academicCredits
        },
        content: contentItems,
        questions: contentItems, // Backwards compatibility
        mode: gameType // Backwards compatibility
      };

      const url = editingGame ? `/api/games/${editingGame.id}` : '/api/games';
      const method = editingGame ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erreur de sauvegarde du jeu");

      const savedGame = await res.json();
      gameAudio.victory();
      toast.success(editingGame ? "Jeu modifié avec succès !" : "Jeu éducatif créé et prêt à être lancé !");
      if (onGameSaved) onGameSaved(savedGame);
      if (onSaveGame) await onSaveGame(savedGame);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur de communication avec le serveur");
      gameAudio.wrong();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-5xl rounded-3xl p-4 sm:p-7 md:p-8 max-h-[92vh] overflow-y-auto bg-slate-950 text-white border-slate-800 shadow-2xl">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge className="bg-purple-600 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1">
                  🎮 Créateur de Jeux Éducatifs Sans Programmation
                </Badge>
                <Badge variant="outline" className="text-amber-400 border-amber-500/40 text-[9px] font-bold">
                  Phase 1 • Infrastructure Complète
                </Badge>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {editingGame ? `Modifier le Jeu : ${editingGame.title}` : "+ Créer un Jeu Éducatif"}
              </DialogTitle>
            </div>

            {!editingGame && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                className="h-10 px-4 rounded-xl border-purple-800 text-purple-300 hover:bg-purple-950 text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer"
              >
                {showTemplatePicker ? "Créer depuis zéro" : "✨ Parcourir les 10 Modèles"}
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* VIEW A: TEMPLATE PICKER (Section 6) */}
        {showTemplatePicker && !editingGame ? (
          <div className="space-y-6 py-4">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 to-indigo-950/70 border border-purple-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Modèles Prêts à l'Emploi (Recommandé)
                </h3>
                <p className="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
                  Gagnez du temps en sélectionnant un modèle pédagogique clé en main pré-configuré avec paramètres de scoring, chronos et épreuves types, personnalisable ensuite.
                </p>
              </div>

              <Button
                onClick={handleStartFromScratch}
                className="h-11 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase shrink-0 cursor-pointer border border-slate-700"
              >
                Commencer depuis zéro →
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GAME_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer space-y-3 relative overflow-hidden shadow-lg hover:shadow-purple-900/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-black uppercase text-purple-400 tracking-wider">
                      {tpl.badge}
                    </span>
                    <Badge variant="outline" className="text-amber-300 border-amber-800 text-[10px] font-bold">
                      {tpl.level}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-white group-hover:text-amber-400 transition-colors leading-tight">
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>⏱️ {tpl.parameters.durationMinutes} min • {tpl.parameters.roundsCount} manches</span>
                    <span className="text-emerald-400 font-bold">+{tpl.scoringRules.academicCredits} pts académiques</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* VIEW B: 4-STEP WIZARD (Section 4) */
          <div className="space-y-6 py-2">
            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-b border-slate-800 pb-4 select-none">
              {[
                { num: 1, label: "1. Informations", desc: "Type, classe & matière" },
                { num: 2, label: "2. Mode", desc: "Solo, Duel, Équipes" },
                { num: 3, label: "3. Paramètres", desc: "Durée, manches & essais" },
                { num: 4, label: "4. Scoring & Audio", desc: "Règles & épreuves" }
              ].map((s) => (
                <div
                  key={s.num}
                  onClick={() => setCurrentStep(s.num)}
                  className={cn(
                    "p-3 rounded-2xl cursor-pointer transition-all duration-200 border text-left",
                    currentStep === s.num
                      ? "bg-purple-950/80 border-purple-500 shadow-md shadow-purple-900/30"
                      : currentStep > s.num
                      ? "bg-slate-900/60 border-emerald-800/80 text-slate-400"
                      : "bg-slate-900/40 border-slate-800 text-slate-500"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-black uppercase", currentStep === s.num ? "text-purple-300" : currentStep > s.num ? "text-emerald-400" : "text-slate-500")}>
                      {s.label}
                    </span>
                    {currentStep > s.num && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 hidden sm:block truncate mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* STEP 1: INFORMATIONS (Section 4 — Étape 1) */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Nom / Titre de la Compétition <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: 🎯 Marathon Algorithmique & Systèmes Distribués"
                      className="h-12 bg-slate-900 border-slate-800 rounded-xl text-white font-bold text-sm focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Description & Objectifs Pédagogiques
                    </Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Expliquez brièvement les compétences évaluées et le déroulement du jeu..."
                      className="bg-slate-900 border-slate-800 rounded-xl text-white text-xs min-h-[75px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-300">Formation</Label>
                    <ModernSelect
                      dropdownTitle="Sélectionner la Formation"
                      value={formation}
                      onChange={(e) => setFormation(e.target.value)}
                      className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs font-bold text-white outline-none focus:border-purple-500"
                    >
                      <option value="Génie Logiciel">💻 Génie Logiciel — Architecture & Développement</option>
                      <option value="Réseaux & Télécoms">🌐 Réseaux & Télécoms — Infrastructures & Cisco</option>
                      <option value="Sécurité Informatique">🛡️ Sécurité Informatique — Cyber-Défense & Pentest</option>
                      <option value="Systèmes & Cloud">☁️ Systèmes & Cloud — DevOps & Kubernetes</option>
                      <option value="Management & Entrepreneuriat">📊 Management & Entrepreneuriat — Pilotage & Stratégie</option>
                      <option value="Commerce & Vente">🤝 Commerce & Vente — Négociation & Relation Client</option>
                    </ModernSelect>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-300">Classe / Promotion Cible</Label>
                    <ModernSelect
                      dropdownTitle="Sélectionner la Classe Cible"
                      value={classId}
                      onChange={(e) => {
                        setClassId(e.target.value);
                        const cl = classesList.find((c: any) => c.code === e.target.value || c.id === e.target.value);
                        if (cl) setClassName(cl.name || cl.code);
                      }}
                      className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs font-bold text-white outline-none focus:border-purple-500"
                    >
                      {classesList.length > 0 ? (
                        classesList.map((c: any) => (
                          <option key={c.id || c.code} value={c.code || c.id}>
                            🎓 {c.name || c.code} — {c.level || 'Formation'}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="G1-GL">🎓 G1 - Génie Logiciel 1ère Année</option>
                          <option value="G2-GL">🎓 G2 - Génie Logiciel 2ème Année</option>
                          <option value="L3-GL">🎓 L3 - Génie Logiciel Licence 3</option>
                          <option value="G2-RT">🎓 G2 - Réseaux & Télécoms</option>
                        </>
                      )}
                    </ModernSelect>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-300">Matière / Module</Label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Ex: Architecture Web & APIs REST"
                      className="h-11 bg-slate-900 border-slate-800 rounded-xl text-white font-bold text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-300">Niveau</Label>
                      <ModernSelect
                        dropdownTitle="Niveau Académique"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs font-bold text-white outline-none"
                      >
                        <option value="Licence 1">📘 Licence 1 — Fondamentaux</option>
                        <option value="Licence 2">📗 Licence 2 — Approfondissement</option>
                        <option value="Licence 3">📙 Licence 3 — Spécialisation</option>
                        <option value="Master 1">📕 Master 1 — Ingénierie</option>
                        <option value="Master 2">🏆 Master 2 — Expertise</option>
                      </ModernSelect>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-300">Difficulté</Label>
                      <ModernSelect
                        dropdownTitle="Niveau de Difficulté"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as GameDifficulty)}
                        className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs font-bold text-white outline-none"
                      >
                        <option value="beginner">🟢 Débutant — Découverte</option>
                        <option value="intermediate">🟡 Intermédiaire — Standard</option>
                        <option value="advanced">🟠 Avancé — Intensif</option>
                        <option value="expert">🔴 Expert — Compétition</option>
                      </ModernSelect>
                    </div>
                  </div>
                </div>

                {/* 10 Game Types Picker (Section 5) */}
                <div className="space-y-3 pt-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Sélectionner l'un des 10 Types de Jeux Pédagogiques
                    </Label>
                    <Badge variant="outline" className="text-purple-300 border-purple-800 text-[10px]">
                      Architecture Dédiée
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {GAME_TYPES_LIST.map((gt) => {
                      const Icon = gt.icon;
                      const isSelected = gameType === gt.id;
                      return (
                        <div
                          key={gt.id}
                          onClick={() => {
                            setGameType(gt.id);
                            gameAudio.click();
                          }}
                          className={cn(
                            "p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2",
                            isSelected
                              ? "bg-purple-900/60 border-purple-500 shadow-lg shadow-purple-900/40 ring-1 ring-purple-400"
                              : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className={cn("p-2 rounded-xl bg-gradient-to-br text-white", gt.color)}>
                              <Icon className="w-4 h-4" />
                            </div>
                            {isSelected && <span className="text-xs text-amber-400 font-black">✓</span>}
                          </div>

                          <div>
                            <p className="text-xs font-black text-white leading-tight">{gt.name}</p>
                            <p className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-tight">{gt.shortDesc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: MODE (Section 4 — Étape 2) */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-150 py-2">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-1">
                    Choisissez le Mode de Confrontation & Participation
                  </h3>
                  <p className="text-xs text-slate-400">
                    Définissez la structure d'interaction des étudiants durant la partie.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      id: 'individual',
                      title: 'Individuel',
                      icon: Timer,
                      desc: 'Chaque joueur joue pour son propre score face au chronomètre et aux épreuves.',
                      badge: 'Solo / Autonomie'
                    },
                    {
                      id: 'duel',
                      title: 'Duel Direct',
                      icon: MessageSquare,
                      desc: 'Affrontement en 1 contre 1 direct. Idéal pour les jeux de rôles et soutenances.',
                      badge: '1 vs 1'
                    },
                    {
                      id: 'multiplayer',
                      title: 'Multijoueur Tous Contre Tous',
                      icon: Sparkles,
                      desc: 'Toute la classe participe simultanément en direct avec classement live et podium.',
                      badge: 'Plateau Classe'
                    },
                    {
                      id: 'teams',
                      title: 'Par Équipes Coopératives',
                      icon: Users,
                      desc: 'Les étudiants sont répartis en équipes et cumulent ensemble des points stratégiques.',
                      badge: 'Coopération d\'Équipe'
                    }
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = gameMode === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setGameMode(m.id as GameMode);
                          gameAudio.click();
                        }}
                        className={cn(
                          "p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4",
                          isSelected
                            ? "bg-purple-900/60 border-purple-500 shadow-xl shadow-purple-900/30 ring-1 ring-purple-400"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="p-3 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30">
                            <Icon className="w-5 h-5" />
                          </div>
                          <Badge variant="outline" className="text-purple-300 border-purple-800 text-[10px]">
                            {m.badge}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-black text-sm text-white">{m.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.desc}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className={cn("font-bold text-[11px]", isSelected ? "text-amber-400 font-black" : "text-slate-500")}>
                            {isSelected ? "Mode Actif" : "Cliquer pour activer"}
                          </span>
                          {isSelected && <span className="text-emerald-400">✅</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: PARAMÈTRES (Section 4 — Étape 3) */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-150 py-2">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-1">
                    Paramètres de Durée, Manches et Dimensionnement
                  </h3>
                  <p className="text-xs text-slate-400">
                    Réglez les quotas de temps et les capacités d'accueil de la session.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <Label className="text-xs font-black uppercase text-purple-300 flex items-center justify-between">
                      <span>Durée Totale de Session</span>
                      <span className="text-amber-400 font-mono text-sm">{durationMinutes} min</span>
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 font-bold"
                    />
                    <p className="text-[10px] text-slate-500">Temps alloué pour l'ensemble de la compétition.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <Label className="text-xs font-black uppercase text-purple-300 flex items-center justify-between">
                      <span>Temps par Manche / Question</span>
                      <span className="text-amber-400 font-mono text-sm">{timeLimitPerRoundSeconds} sec</span>
                    </Label>
                    <Input
                      type="number"
                      min={5}
                      max={300}
                      value={timeLimitPerRoundSeconds}
                      onChange={(e) => setTimeLimitPerRoundSeconds(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 font-bold"
                    />
                    <p className="text-[10px] text-slate-500">Délai du compte à rebours avant révélation automatique.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <Label className="text-xs font-black uppercase text-purple-300 flex items-center justify-between">
                      <span>Nombre Max de Joueurs</span>
                      <span className="text-amber-400 font-mono text-sm">{maxPlayers}</span>
                    </Label>
                    <Input
                      type="number"
                      min={2}
                      max={200}
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 font-bold"
                    />
                    <p className="text-[10px] text-slate-500">Capacité de la salle d'attente multijoueur.</p>
                  </div>

                  {gameMode === 'teams' && (
                    <>
                      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60 space-y-2">
                        <Label className="text-xs font-black uppercase text-purple-300 flex items-center justify-between">
                          <span>Nombre d'Équipes</span>
                          <span className="text-amber-400 font-mono text-sm">{teamCount}</span>
                        </Label>
                        <Input
                          type="number"
                          min={2}
                          max={10}
                          value={teamCount}
                          onChange={(e) => setTeamCount(Number(e.target.value))}
                          className="bg-slate-950 border-slate-800 font-bold"
                        />
                        <p className="text-[10px] text-slate-400">Équipes créées automatiquement dans le lobby.</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60 space-y-2">
                        <Label className="text-xs font-black uppercase text-purple-300 flex items-center justify-between">
                          <span>Joueurs par Équipe</span>
                          <span className="text-amber-400 font-mono text-sm">{playersPerTeam}</span>
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={playersPerTeam}
                          onChange={(e) => setPlayersPerTeam(Number(e.target.value))}
                          className="bg-slate-950 border-slate-800 font-bold"
                        />
                        <p className="text-[10px] text-slate-400">Quota max de membres par escouade.</p>
                      </div>
                    </>
                  )}

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <Label className="text-xs font-black uppercase text-purple-300 flex items-center justify-between">
                      <span>Nombre de Manches / Rounds</span>
                      <span className="text-amber-400 font-mono text-sm">{roundsCount}</span>
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={roundsCount}
                      onChange={(e) => setRoundsCount(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 font-bold"
                    />
                    <p className="text-[10px] text-slate-500">Nombre total d'épreuves à franchir.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <Label className="text-xs font-black uppercase text-purple-300 flex items-center justify-between">
                      <span>Nombre d'Essais Autorisés</span>
                      <span className="text-amber-400 font-mono text-sm">{maxAttempts}</span>
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 font-bold"
                    />
                    <p className="text-[10px] text-slate-500">Essais par joueur avant élimination ou verrouillage.</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SCORING & AUDIO (Section 4 — Étape 4 + Section 7) */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-150 py-2">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-1">
                    Système de Scoring & Crédits Académiques Annuels
                  </h3>
                  <p className="text-xs text-slate-400">
                    Définissez la pondération des points, les pénalités et les points officiels crédités sur l'année académique.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <Label className="text-[11px] font-black uppercase text-emerald-400">Bonne Réponse (+)</Label>
                    <Input
                      type="number"
                      value={correctPoints}
                      onChange={(e) => setCorrectPoints(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 font-black text-emerald-400"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <Label className="text-[11px] font-black uppercase text-rose-400">Pénalité Erreur (-)</Label>
                    <Input
                      type="number"
                      value={wrongPenalty}
                      onChange={(e) => setWrongPenalty(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 font-black text-rose-400"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <Label className="text-[11px] font-black uppercase text-amber-400">Bonus Vitesse Max (+)</Label>
                    <Input
                      type="number"
                      value={speedBonusMax}
                      onChange={(e) => setSpeedBonusMax(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 font-black text-amber-400"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <Label className="text-[11px] font-black uppercase text-purple-400">Bonus Série / Streak (+)</Label>
                    <Input
                      type="number"
                      value={streakBonus}
                      onChange={(e) => setStreakBonus(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 font-black text-purple-400"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <Label className="text-[11px] font-black uppercase text-cyan-400">Réussite Mission (+)</Label>
                    <Input
                      type="number"
                      value={missionSuccessPoints}
                      onChange={(e) => setMissionSuccessPoints(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 font-black text-cyan-400"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <Label className="text-[11px] font-black uppercase text-orange-400">Pénalité Indice (-)</Label>
                    <Input
                      type="number"
                      value={hintPenalty}
                      onChange={(e) => setHintPenalty(Number(e.target.value))}
                      className="bg-slate-950 border-slate-800 font-black text-orange-400"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-purple-500/50 space-y-1 col-span-2">
                    <Label className="text-[11px] font-black uppercase text-amber-300 flex items-center justify-between">
                      <span>Points Académiques Annuels (Crédits)</span>
                      <Badge className="bg-amber-500 text-slate-950 text-[9px] font-black">Officiel</Badge>
                    </Label>
                    <Input
                      type="number"
                      value={academicCredits}
                      onChange={(e) => setAcademicCredits(Number(e.target.value))}
                      className="bg-slate-950 border-purple-500/40 font-black text-amber-300 text-base"
                    />
                    <p className="text-[10px] text-purple-200">
                      Points crédités de manière permanente dans le carnet académique de l'étudiant pour l'année en cours.
                    </p>
                  </div>
                </div>

                {/* Section 7: Système Audio Réutilisable */}
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        Bibliothèque Audio Pédagogique (Dossier /AUDIO)
                      </h4>
                    </div>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-800 text-[10px]">
                      11 Sons Connectés
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Testez les effets sonores qui rythmeront les épreuves, les validations et les victoires de cette compétition :
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {[
                      { id: 'lancement', label: '🚀 Lancement' },
                      { id: 'clic', label: '🔘 Clic' },
                      { id: 'bonne_reponse', label: '✅ Bonne Rép.' },
                      { id: 'mauvaise_reponse', label: '❌ Erreur' },
                      { id: 'compte_a_rebours', label: '⏱️ Tick Chrono' },
                      { id: 'gain_points', label: '⭐ Gain Points' },
                      { id: 'perte_points', label: '📉 Pénalité' },
                      { id: 'victoire', label: '🏆 Victoire' },
                      { id: 'defaite', label: '💔 Défaite' },
                      { id: 'fin_jeu', label: '🔔 Fin de Jeu' },
                      { id: 'notification', label: '💬 Notification' }
                    ].map((s) => (
                      <Button
                        key={s.id}
                        type="button"
                        onClick={() => handleTestAudio(s.id as SoundCategory)}
                        variant="outline"
                        className={cn(
                          "h-9 px-2 text-[10px] font-black rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-purple-500 cursor-pointer truncate",
                          testedAudioCategory === s.id && "bg-purple-600 text-white border-purple-400 animate-pulse"
                        )}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Content / Rounds Configuration */}
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4" /> Questions & Épreuves de la Compétition ({contentItems.length})
                    </h4>
                    <Button
                      type="button"
                      onClick={handleAddContentItem}
                      className="h-8 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> + Ajouter une Épreuve
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {contentItems.map((item, idx) => (
                      <div key={item.id || idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-purple-400">Épreuve #{idx + 1}</span>
                          <Button
                            type="button"
                            onClick={() => handleRemoveContentItem(idx)}
                            variant="ghost"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <Input
                          value={item.prompt}
                          onChange={(e) => {
                            const updated = [...contentItems];
                            updated[idx].prompt = e.target.value;
                            updated[idx].text = e.target.value;
                            setContentItems(updated);
                          }}
                          placeholder="Intitulé de la question ou instruction de l'épreuve..."
                          className="bg-slate-900 border-slate-800 text-xs font-bold"
                        />

                        {Array.isArray(item.options) && (
                          <div className="grid grid-cols-2 gap-2">
                            {item.options.map((opt: string, optIdx: number) => (
                              <div key={optIdx} className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-slate-500 w-4">{String.fromCharCode(65 + optIdx)}</span>
                                <Input
                                  value={opt}
                                  onChange={(e) => {
                                    const updated = [...contentItems];
                                    updated[idx].options[optIdx] = e.target.value;
                                    setContentItems(updated);
                                  }}
                                  className={cn(
                                    "bg-slate-900 border-slate-800 text-xs h-9",
                                    item.correctAnswer === opt && "border-emerald-500 text-emerald-400 font-bold"
                                  )}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...contentItems];
                                    updated[idx].correctAnswer = opt;
                                    setContentItems(updated);
                                    gameAudio.correct();
                                  }}
                                  className={cn(
                                    "h-7 px-2 rounded text-[9px] font-black cursor-pointer",
                                    item.correctAnswer === opt ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                  )}
                                >
                                  {item.correctAnswer === opt ? "Exact" : "Définir"}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={() => {
                      setCurrentStep(currentStep - 1);
                      gameAudio.click();
                    }}
                    variant="outline"
                    className="h-11 px-4 rounded-xl border-slate-700 bg-slate-900 text-white text-xs font-bold uppercase gap-2 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Précédent
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  onClick={() => handleSubmitGame('draft')}
                  variant="outline"
                  disabled={isSubmitting}
                  className="h-11 px-4 rounded-xl border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-bold uppercase cursor-pointer flex-1 sm:flex-initial"
                >
                  Enregistrer Brouillon
                </Button>

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (currentStep === 1 && !title.trim()) {
                        toast.error("Veuillez renseigner le nom de la compétition.");
                        return;
                      }
                      setCurrentStep(currentStep + 1);
                      gameAudio.click();
                    }}
                    className="h-11 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider gap-2 cursor-pointer flex-1 sm:flex-initial shadow-lg shadow-purple-600/30"
                  >
                    Suivant <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleSubmitGame('published')}
                    disabled={isSubmitting}
                    className="h-11 px-7 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider gap-2 cursor-pointer flex-1 sm:flex-initial shadow-xl shadow-amber-500/20"
                  >
                    {isSubmitting ? "Publication en cours..." : "🚀 Publier & Ouvrir la Session"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default GameCreatorModal;

