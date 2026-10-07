import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Sparkles, 
  Zap, 
  Clock, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Crown, 
  Radio, 
  Target, 
  Award,
  ChevronRight,
  ShieldCheck,
  Play,
  KeyRound,
  History,
  Calendar,
  Medal,
  TrendingUp,
  Search,
  ArrowRight,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  stopCountdownMusic
} from "@/lib/soundEffects";

export default function StudentGamesPage() {
  const outletCtx = useOutletContext<{ student?: any }>() || {};
  const { user: authUser } = useAuth();
  const student = outletCtx?.student || {
    id: authUser?.id || 'std_101',
    name: authUser?.name || 'Victor Nya',
    classCode: 'GL-3A',
    avatar: authUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Victor'
  };
  const [games, setGames] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'waiting' | 'history' | 'leaderboard'>('available');

  // PIN / Code Join state
  const [gameCodeInput, setGameCodeInput] = useState('');
  const [joiningByCode, setJoiningByCode] = useState(false);

  // Active Game Room Arena state
  const [activeRoom, setActiveLiveRoom] = useState<any | null>(null);
  const [roomState, setRoomState] = useState<any | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<{ isCorrect: boolean; points: number } | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(15);

  const fetchStudentGames = async () => {
    setLoading(true);
    try {
      const [gRes, hRes] = await Promise.all([
        fetch(`/api/games?studentId=${student?.id || 'std_101'}`),
        fetch(`/api/games/history/student/${student?.id || 'std_101'}`)
      ]);
      if (gRes.ok) setGames(await gRes.json());
      if (hRes.ok) setHistory(await hRes.json());
    } catch (err) {
      console.error("Failed to fetch student games", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentGames();
  }, []);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
  };

  // Join Room by Object
  const handleJoinGameRoom = async (game: any) => {
    try {
      const res = await fetch(`/api/games/${game.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student?.id || 'std_101',
          studentName: student?.name || 'Victor Nya',
          avatar: student?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.name || 'Victor'}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        playBuzzerPress();
        toast.success("Vous avez rejoint la salle de jeu !");
        setActiveLiveRoom(game);
      } else {
        toast.error(data.error || "Impossible de rejoindre la session.");
      }
    } catch {
      toast.error("Erreur lors de la connexion au plateau de jeu");
    }
  };

  // Join Room by Code
  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = gameCodeInput.trim();
    if (!cleanCode) {
      toast.error("Veuillez saisir un code de session valide");
      return;
    }

    setJoiningByCode(true);
    try {
      const res = await fetch(`/api/games/${cleanCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student?.id || 'std_101',
          studentName: student?.name || 'Victor Nya',
          avatar: student?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.name || 'Victor'}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        playBuzzerPress();
        toast.success("Code validé ! Bienvenue sur le plateau TV");
        setActiveLiveRoom(data.game);
        setGameCodeInput('');
      } else {
        toast.error(data.error || "Code invalide ou session introuvable");
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setJoiningByCode(false);
    }
  };

  // Poll room state
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeRoom) {
      const pollLobby = async () => {
        try {
          const res = await fetch(`/api/games/${activeRoom.id}/lobby`);
          if (res.ok) {
            const data = await res.json();
            setRoomState(data);
          }
        } catch (e) {
          console.error(e);
        }
      };
      pollLobby();
      interval = setInterval(pollLobby, 2000);
    }
    return () => clearInterval(interval);
  }, [activeRoom]);

  // Sync local answer and feedback states with server state in real-time
  useEffect(() => {
    if (activeRoom && roomState) {
      // Sync timer from server
      const serverTimerLeft = roomState.dynamicTimeLeft !== undefined ? roomState.dynamicTimeLeft : 15;
      setTimerSecondsLeft(serverTimerLeft);

      // Play tick sound on last 5 seconds of active question
      if (roomState.status === 'active' && serverTimerLeft > 0 && serverTimerLeft <= 5 && !roomState.isRevealed && !hasAnsweredCurrent) {
        playCountdownTick();
      }

      // Check if student has responded in server responses
      const myResponse = roomState.responses?.find(
        (r: any) => r.questionIndex === roomState.currentQuestionIndex && r.studentId === (student?.id || 'std_101')
      );

      if (myResponse) {
        setHasAnsweredCurrent(true);
        setSelectedOption(myResponse.answer);
        
        // If server revealed answers, show correct/incorrect feedback!
        if (roomState.isRevealed) {
          setAnswerFeedback({
            isCorrect: myResponse.isCorrect,
            points: myResponse.earnedPoints
          });
        }
      } else {
        // If not answered yet and server revealed answers, mark as missed (wrong)
        if (roomState.isRevealed) {
          setHasAnsweredCurrent(true);
          setAnswerFeedback({
            isCorrect: false,
            points: 0
          });
        }
      }
    }
  }, [roomState, activeRoom?.id, student?.id, hasAnsweredCurrent]);

  // Handle sounds for student lobby and active questions
  useEffect(() => {
    if (!activeRoom || !roomState) {
      stopLobbyMusic();
      stopCountdownMusic();
      return;
    }

    const selectedAudio = roomState.game?.selectedAudio;
    if (!selectedAudio) return;

    if (roomState.status === 'lobby' || roomState.status === 'scheduled') {
      playLobbyMusic(selectedAudio.deb);
      stopCountdownMusic();
    } else if (roomState.status === 'active') {
      stopLobbyMusic();
      
      const serverTimerLeft = roomState.dynamicTimeLeft !== undefined ? roomState.dynamicTimeLeft : 15;
      const myResponse = roomState.responses?.find(
        (r: any) => r.questionIndex === roomState.currentQuestionIndex && r.studentId === (student?.id || 'std_101')
      );

      // Play countdown music if question is active and player hasn't answered
      if (!roomState.isRevealed && !myResponse && serverTimerLeft > 0) {
        playCountdownMusic(selectedAudio.pan);
      } else {
        stopCountdownMusic();
      }
    } else if (roomState.status === 'completed') {
      stopLobbyMusic();
      stopCountdownMusic();
      playVictoryFanfare(selectedAudio.vic);
    }

    return () => {
      stopLobbyMusic();
      stopCountdownMusic();
    };
  }, [activeRoom, roomState?.status, roomState?.currentQuestionIndex, roomState?.isRevealed, roomState?.dynamicTimeLeft, student?.id]);

  // Sound triggering on reveal event
  const [lastRevealedIndex, setLastRevealedIndex] = useState<number | null>(null);
  useEffect(() => {
    if (roomState?.isRevealed && roomState.currentQuestionIndex !== lastRevealedIndex) {
      setLastRevealedIndex(roomState.currentQuestionIndex);
      
      // Play correct or wrong sound depending on response correctness
      const myResponse = roomState.responses?.find(
        (r: any) => r.questionIndex === roomState.currentQuestionIndex && r.studentId === (student?.id || 'std_101')
      );

      if (myResponse?.isCorrect) {
        playCorrectSound(roomState.game?.selectedAudio?.bon);
      } else {
        playWrongSound(roomState.game?.selectedAudio?.mov);
      }
    }
  }, [roomState?.isRevealed, roomState?.currentQuestionIndex, lastRevealedIndex, roomState?.responses, student?.id, roomState?.game?.selectedAudio]);

  // Reset states on question change
  useEffect(() => {
    if (roomState?.currentQuestionIndex !== undefined) {
      setSelectedOption(null);
      setHasAnsweredCurrent(false);
      setAnswerFeedback(null);
      setQuestionStartTime(Date.now());
    }
  }, [roomState?.currentQuestionIndex]);

  // Submit Answer
  const handleSelectOption = async (option: string) => {
    if (hasAnsweredCurrent || !activeRoom) return;
    setSelectedOption(option);
    setHasAnsweredCurrent(true);
    stopCountdownMusic(); // Stop countdown music once answered

    const responseTimeMs = Date.now() - questionStartTime;

    try {
      const res = await fetch(`/api/games/${activeRoom.id}/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student?.id || 'std_101',
          studentName: student?.name || 'Victor Nya',
          avatar: student?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.name || 'Victor'}`,
          questionIndex: roomState?.currentQuestionIndex || 0,
          answer: option,
          responseTimeMs
        })
      });

      if (res.ok) {
        toast.success("Réponse enregistrée, attente de la révélation !");
      }
    } catch {
      toast.error("Erreur de soumission");
    }
  };

  const totalPointsEarned = history.reduce((sum, g) => sum + (g.playerStats?.totalScore || 0), 0);

  // Filtered games
  const activeGames = games.filter(g => g.status === 'active');
  const waitingGames = games.filter(g => g.status === 'lobby' || g.status === 'scheduled');
  const completedGames = games.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-16 px-2 sm:px-4 font-sans">
      {/* High Energy TV Show Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-2xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-purple-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-xl shadow-lg shadow-purple-600/40">
              🎮 Espace Apprenant • Jeux Éducatifs & Compétitions
            </Badge>
            <Badge variant="outline" className="text-purple-300 border-purple-700 font-bold text-[10px] px-3 py-1 rounded-xl">
              Plateau Multijoueur TV
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
            <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 animate-bounce shrink-0" />
            Compétitions & Arène TV
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
            Défiez vos camarades en direct sur le plateau télé : gagnez des trophées, cumulez des points bonus de rapidité et hissez-vous au sommet du classement académique !
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          <Button
            type="button"
            onClick={handleToggleMute}
            variant="outline"
            className="h-10 sm:h-12 px-3 sm:px-4 rounded-xl sm:rounded-2xl border-purple-700 bg-purple-950/40 text-purple-200 hover:bg-purple-900 font-bold text-xs gap-2 cursor-pointer flex-1 sm:flex-initial"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            {isMuted ? "Son Off" : "Son On"}
          </Button>

          <div className="bg-amber-500/20 border border-amber-500/40 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-right flex-1 sm:flex-initial">
            <p className="text-[9px] sm:text-[10px] font-black uppercase text-amber-400">Cumul Année</p>
            <p className="text-base sm:text-lg font-black text-amber-300">{totalPointsEarned + 1450} PTS</p>
          </div>
        </div>
      </div>

      {/* QUICK JOIN WITH GAME CODE BAR */}
      <Card className="rounded-2xl sm:rounded-[2rem] border-purple-200 dark:border-purple-900/50 bg-gradient-to-r from-purple-50 via-white to-indigo-50 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 shadow-md p-4 sm:p-6">
        <form onSubmit={handleJoinByCode} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="gamePinInput" className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-0.5">
                Rejoindre avec un Code de Session (PIN)
              </label>
              <Input
                id="gamePinInput"
                value={gameCodeInput}
                onChange={e => setGameCodeInput(e.target.value)}
                placeholder="Ex: GAME-101, 784920..."
                className="h-10 sm:h-11 rounded-xl bg-white dark:bg-slate-800 font-mono font-bold text-sm tracking-widest uppercase border-purple-200 dark:border-purple-800 focus:border-purple-600"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={joiningByCode || !gameCodeInput.trim()}
            className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 cursor-pointer gap-2 shrink-0"
          >
            {joiningByCode ? "Vérification..." : "Rejoindre la Session"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </Card>

      {/* RESPONSIVE STUDENT TABS HEADER */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto w-full select-none scrollbar-none">
        <button
          onClick={() => setActiveTab('available')}
          className={cn(
            "px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-initial shrink-0",
            activeTab === 'available'
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-slate-700"
          )}
        >
          <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-pulse" />
          <span>En Direct & Disponibles ({activeGames.length + waitingGames.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('waiting')}
          className={cn(
            "px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-initial shrink-0",
            activeTab === 'waiting'
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-slate-700"
          )}
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Salons en Attente ({waitingGames.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-initial shrink-0",
            activeTab === 'history'
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-slate-700"
          )}
        >
          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Historique & Résultats ({history.length + completedGames.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={cn(
            "px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-initial shrink-0",
            activeTab === 'leaderboard'
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-slate-700"
          )}
        >
          <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
          <span>Classement & Points XP</span>
        </button>
      </div>

      {/* TAB 1: JEUX DISPONIBLES & EN DIRECT */}
      {activeTab === 'available' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {games.filter(g => g.status === 'active' || g.status === 'lobby').map(g => (
              <Card key={g.id} className="rounded-2xl sm:rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between">
                <CardHeader className="p-4 sm:p-6 md:p-8 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className={cn(
                      "font-black text-[9px] uppercase border-none px-2.5 sm:px-3 py-1",
                      g.status === 'active' ? "bg-emerald-600 text-white animate-pulse" : "bg-purple-600 text-white"
                    )}>
                      {g.status === 'active' ? '🔴 EN DIRECT SUR LE PLATEAU' : '📺 SALLE D\'ATTENTE OUVERTE'}
                    </Badge>

                    <Badge variant="outline" className="text-slate-500 text-[9px] font-bold">
                      {g.mode === 'quiz_tv' ? '📺 Plateau Quiz TV' :
                       g.mode === 'buzzer_flash' ? '⚡ Buzzer Éclair' :
                       g.mode === 'marathon_survival' ? '❤️ Marathon Survie' : '⚔️ Duel de Code'}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {g.title}
                  </CardTitle>
                  <CardDescription className="text-xs font-bold text-slate-400 mt-1">
                    Créé par {g.teacherName || 'Professeur'} • Promo {g.classCode} • Code: <span className="font-mono text-purple-600 dark:text-purple-400">{g.sessionCode || g.id}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 flex-1">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {g.description || "Rejoignez la compétition en direct et répondez le plus rapidement possible pour accumuler un maximum de points !"}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-bold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      {g.connectedPlayers?.length || 0} participants
                    </span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {g.questions?.length || 5} questions
                    </span>
                  </div>

                  <Button
                    onClick={() => handleJoinGameRoom(g)}
                    className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 cursor-pointer gap-2"
                  >
                    <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Rejoindre le Plateau TV
                  </Button>
                </CardContent>
              </Card>
            ))}

            {games.filter(g => g.status === 'active' || g.status === 'lobby').length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-12 sm:py-16 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 space-y-3">
                <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500 mx-auto opacity-50" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Aucun Jeu Ouvert en Ce Moment</h3>
                <p className="text-xs text-slate-400">Restez attentif ou entrez le code PIN fourni par votre enseignant dans le champ ci-dessus !</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SESSIONS & EN ATTENTE */}
      {activeTab === 'waiting' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {waitingGames.map(g => (
              <Card key={g.id} className="rounded-2xl sm:rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-8 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge className="bg-amber-500 text-white font-black text-[9px] uppercase px-2.5 py-1 mb-2">
                      ⏳ SALLE D'ATTENTE OUVERTE
                    </Badge>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{g.title}</h3>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">Enseignant : {g.teacherName || "Professeur"}</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs font-bold">
                    {g.sessionCode || g.id}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  {g.scheduledAt ? `Lancement prévu : ${new Date(g.scheduledAt).toLocaleString('fr-FR')}` : "En attente du lancement par l'enseignant..."}
                </p>

                <Button
                  onClick={() => handleJoinGameRoom(g)}
                  className="w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs gap-2"
                >
                  <Users className="w-4 h-4" /> Entrer dans le Salon ({g.connectedPlayers?.length || 0} prêts)
                </Button>
              </Card>
            ))}

            {waitingGames.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 space-y-2">
                <Calendar className="w-10 h-10 text-purple-400 mx-auto opacity-50" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300">Aucune session en attente actuellement</h4>
                <p className="text-xs text-slate-400">Les sessions programmées apparaîtront ici.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: HISTORIQUE & MES RÉSULTATS */}
      {activeTab === 'history' && (
        <Card className="rounded-2xl sm:rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              Mes Compétitions & Résultats Passés
            </h3>
            <Badge className="bg-emerald-100 text-emerald-800 border-none font-black text-[10px] uppercase">
              {history.length} Parties Enregistrées
            </Badge>
          </div>

          {/* Mobile Cards for History */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {history.map((h, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">{h.title || `Compétition #${idx + 1}`}</h4>
                    <p className="text-[10px] font-bold text-slate-400">{new Date(h.completedAt || Date.now()).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <Badge className="bg-purple-600 text-white font-black text-[10px]">
                    +{h.playerStats?.totalScore || 180} PTS
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Rang : <strong className="text-amber-500 font-black">#{h.playerStats?.rank || 2}</strong></span>
                  <span>Bonnes réponses : {h.playerStats?.correctCount || 4} / {h.playerStats?.totalCount || 5}</span>
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-6">Vous n'avez pas encore terminé de compétition.</p>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
            <Table className="min-w-[580px]">
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400">Jeu / Compétition</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400">Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400">Score Obtenu</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400">Précision</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400 text-right">Classement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-black text-sm text-slate-900 dark:text-white">
                      {h.title || `Compétition #${idx + 1}`}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-medium">
                      {new Date(h.completedAt || Date.now()).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="font-black text-sm text-purple-600">
                      +{h.playerStats?.totalScore || 180} PTS
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {h.playerStats?.correctCount || 4} / {h.playerStats?.totalCount || 5} (80%)
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-amber-100 text-amber-900 border-none font-black text-xs">
                        #{h.playerStats?.rank || 2}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* TAB 4: CLASSEMENT ACADÉMIQUE & POINTS XP */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4 sm:space-y-6">
          <Card className="rounded-2xl sm:rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  Tableau d'Honneur & Classement de la Promotion
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Points cumulés sur l'ensemble des jeux éducatifs et défis de l'année académique.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800 font-black text-xs px-3 py-1.5">
                  Année 2025 - 2026
                </Badge>
              </div>
            </div>

            {/* Podium Top 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-center space-y-2 order-2 sm:order-1">
                <Badge className="bg-amber-500 text-white font-black text-[10px]">🥈 2ème Place</Badge>
                <Avatar className="w-12 h-12 mx-auto border-2 border-amber-400">
                  <AvatarFallback className="font-bold bg-amber-200 text-amber-900">VN</AvatarFallback>
                </Avatar>
                <p className="font-black text-sm text-slate-900 dark:text-white">{student?.name || 'Victor Nya'}</p>
                <p className="text-xs font-black text-amber-600">{totalPointsEarned + 1450} PTS</p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-100 to-amber-50 dark:from-amber-950/40 dark:to-slate-900 border-2 border-amber-400 text-center space-y-2 shadow-lg order-1 sm:order-2">
                <Crown className="w-8 h-8 text-amber-500 mx-auto animate-bounce" />
                <Badge className="bg-amber-600 text-white font-black text-[10px]">🥇 1ère Place</Badge>
                <Avatar className="w-14 h-14 mx-auto border-2 border-amber-500 shadow-md">
                  <AvatarFallback className="font-black bg-amber-300 text-amber-950">AD</AvatarFallback>
                </Avatar>
                <p className="font-black text-base text-slate-900 dark:text-white">Amina Diallo</p>
                <p className="text-sm font-black text-amber-600">1,820 PTS</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-2 order-3">
                <Badge className="bg-slate-400 text-white font-black text-[10px]">🥉 3ème Place</Badge>
                <Avatar className="w-12 h-12 mx-auto border-2 border-slate-300">
                  <AvatarFallback className="font-bold bg-slate-200 text-slate-800">MB</AvatarFallback>
                </Avatar>
                <p className="font-black text-sm text-slate-900 dark:text-white">Marc Bongo</p>
                <p className="text-xs font-black text-purple-600">1,210 PTS</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* LIVE GAME ARENA MODAL */}
      {activeRoom && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 text-white rounded-2xl sm:rounded-[2.5rem] max-w-3xl w-full p-4 sm:p-6 md:p-8 border border-purple-800/50 shadow-2xl space-y-4 sm:space-y-6 relative overflow-hidden my-auto max-h-[96vh] overflow-y-auto"
          >
            {/* Header Stage */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Badge className="bg-purple-600 text-white font-black text-[9px] sm:text-[10px] uppercase shrink-0">
                  📺 PLATEAU TV
                </Badge>
                <h3 className="text-base sm:text-lg font-black text-white truncate">{activeRoom.title}</h3>
              </div>

              <button
                onClick={() => setActiveLiveRoom(null)}
                className="text-slate-400 hover:text-white font-bold text-xs bg-slate-800 px-3 py-1.5 rounded-xl cursor-pointer shrink-0"
              >
                Quitter
              </button>
            </div>

            {/* Waiting in Lobby */}
            {roomState?.status === 'lobby' || roomState?.status === 'scheduled' ? (
              <div className="text-center py-8 sm:py-12 space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-600/20 border-2 border-purple-500 flex items-center justify-center mx-auto animate-pulse">
                  <Radio className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white">Vous êtes dans la Salle d'Attente !</h3>
                  <p className="text-xs text-purple-200 font-medium">
                    L'enseignant va lancer la partie d'un moment à l'autre. Préparez vos réflexes !
                  </p>
                </div>

                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700 max-w-md mx-auto">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Joueurs Connectés :</p>
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                    {roomState?.connectedPlayers?.map((p: any, pi: number) => (
                      <Badge key={pi} className="bg-emerald-950 text-emerald-300 border border-emerald-800 font-black text-[11px] sm:text-xs px-2.5 sm:px-3 py-1">
                        {p.studentName} (Prêt)
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : roomState?.status === 'active' ? (
              /* Active Game Arena Question View (Dynamically Custom for 12 Modes) */
              <div className="space-y-4 sm:space-y-6">
                {/* Question/Step Info Bar */}
                <div className="flex items-center justify-between">
                  <Badge className="bg-amber-500 text-slate-950 font-black text-[11px] sm:text-xs uppercase px-2.5 sm:px-3 py-1">
                    {['defi_chrono', 'duel', 'tournoi'].includes(activeRoom.mode) 
                      ? `Question #${ (roomState?.currentQuestionIndex || 0) + 1 } / ${activeRoom.questions?.length || 1}`
                      : `${activeRoom.title}`}
                  </Badge>

                  {/* Countdown Timer */}
                  <div className={cn(
                    "font-mono font-black text-xl sm:text-2xl px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl border flex items-center gap-1.5 sm:gap-2",
                    timerSecondsLeft <= 5 ? "bg-red-950 text-red-400 border-red-800 animate-bounce" : "bg-purple-950 text-purple-300 border-purple-800"
                  )}>
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    {timerSecondsLeft}s
                  </div>
                </div>

                {/* 1. Standard MCQ (Défi Chrono, Duel, Tournoi) */}
                {(activeRoom.mode === 'defi_chrono' || activeRoom.mode === 'duel' || activeRoom.mode === 'tournoi' || !['puzzle_competences', 'simulation_pro', 'mission_equipe', 'enquete_pedagogique', 'gestion_entreprise', 'memory_pro', 'atelier_virtuel', 'jeu_role', 'chasse_tresor'].includes(activeRoom.mode)) && (
                  <div className="space-y-4">
                    {/* Question Text */}
                    <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-800 border border-slate-700 text-center space-y-2">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-snug break-words">
                        {activeRoom.questions?.[roomState?.currentQuestionIndex || 0]?.text}
                      </h2>
                    </div>

                    {/* Option Buttons Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                      {activeRoom.questions?.[roomState?.currentQuestionIndex || 0]?.options?.map((opt: string, optIdx: number) => {
                        const isSelected = selectedOption === opt;
                        return (
                          <button
                            key={optIdx}
                            disabled={hasAnsweredCurrent}
                            onClick={() => handleSelectOption(opt)}
                            className={cn(
                              "p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 font-black text-xs sm:text-sm md:text-base text-left transition-all cursor-pointer flex items-center justify-between gap-2",
                              isSelected
                                ? "bg-purple-600 border-purple-400 text-white scale-101 shadow-lg"
                                : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750 hover:border-purple-500"
                            )}
                          >
                            <span className="break-words">{opt}</span>
                            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-900/60 flex items-center justify-center text-xs font-black shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Puzzle de Compétences (Interactive sorting) */}
                {activeRoom.mode === 'puzzle_competences' && (
                  <div className="space-y-4 text-center">
                    <Badge className="bg-purple-600 text-white font-black text-[10px] uppercase">🧩 Puzzle : Ordonner de haut en bas</Badge>
                    <h3 className="text-lg sm:text-xl font-black text-white">{activeRoom.puzzleTitle}</h3>
                    
                    <div className="space-y-2 max-w-md mx-auto text-left">
                      {(activeRoom.puzzleSteps || []).map((step: string, sIdx: number) => (
                        <div key={sIdx} className="p-3.5 rounded-xl bg-slate-800 border border-purple-900/40 font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-3">
                          <span className="h-6 w-6 rounded-full bg-purple-900 border border-purple-500 text-purple-300 font-mono text-xs flex items-center justify-center font-black">#{sIdx + 1}</span>
                          <span className="flex-1">{step}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => {
                        setHasAnsweredCurrent(true);
                        playCorrectSound();
                        toast.success("Ordre soumis ! Attente de la validation du professeur.");
                      }}
                      disabled={hasAnsweredCurrent}
                      className="h-11 px-6 rounded-xl bg-purple-600 text-white font-black uppercase text-xs tracking-wider"
                    >
                      {hasAnsweredCurrent ? "✓ Puzzle Soumis" : "Valider l'Ordre du Puzzle"}
                    </Button>
                  </div>
                )}

                {/* 3. Simulation Professionnelle */}
                {activeRoom.mode === 'simulation_pro' && (
                  <div className="space-y-4 text-center max-w-xl mx-auto">
                    <Badge className="bg-blue-600 text-white font-black text-[10px] uppercase">🏗️ Prise de Décision Métier</Badge>
                    <p className="text-xs sm:text-sm font-bold text-slate-200 bg-slate-800 p-4 rounded-xl leading-relaxed">{activeRoom.scenarios?.[0]?.scenario}</p>
                    
                    <div className="grid grid-cols-1 gap-2 text-left pt-2">
                      {(activeRoom.scenarios?.[0]?.options || []).map((opt: any, oIdx: number) => {
                        const isSelected = selectedOption === opt.text;
                        return (
                          <button
                            key={oIdx}
                            disabled={hasAnsweredCurrent}
                            onClick={() => {
                              setSelectedOption(opt.text);
                              setHasAnsweredCurrent(true);
                              playBuzzerPress();
                              toast.info(`Décision enregistrée : ${opt.text}`);
                            }}
                            className={cn(
                              "p-3 rounded-xl border text-left text-xs font-black transition-all cursor-pointer",
                              isSelected 
                                ? "bg-blue-600 border-blue-400 text-white"
                                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                            )}
                          >
                            <p className="font-bold">{opt.text}</p>
                            {hasAnsweredCurrent && isSelected && (
                              <p className="text-[11px] text-blue-200 mt-1 font-medium italic">➡️ Conséquence : {opt.consequence}</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Mission en Équipe */}
                {activeRoom.mode === 'mission_equipe' && (
                  <div className="space-y-4 text-center">
                    <Badge className="bg-emerald-600 text-white font-black text-[10px] uppercase">👥 Objectif d'Équipe</Badge>
                    <h3 className="text-lg sm:text-xl font-black text-white">Objectif : {activeRoom.missionObjective}</h3>
                    
                    <div className="space-y-2 max-w-md mx-auto text-left">
                      {(activeRoom.missionTasks || []).map((task: string, tIdx: number) => (
                        <div key={tIdx} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-3">
                          <input type="checkbox" className="rounded text-emerald-500 bg-slate-900 border-slate-700" defaultChecked={tIdx === 0} />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => {
                        setHasAnsweredCurrent(true);
                        playCorrectSound();
                        toast.success("Tâches collectives validées !");
                      }}
                      disabled={hasAnsweredCurrent}
                      className="h-11 px-6 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase"
                    >
                      {hasAnsweredCurrent ? "✓ Mission Soumise" : "Valider l'avancement"}
                    </Button>
                  </div>
                )}

                {/* 5. Enquête Pédagogique */}
                {activeRoom.mode === 'enquete_pedagogique' && (
                  <div className="space-y-4 max-w-xl mx-auto text-center">
                    <Badge className="bg-amber-600 text-white font-black text-[10px] uppercase">🕵️ Enquête & Recherche</Badge>
                    <h3 className="text-base sm:text-lg font-black text-white">Affaire : {activeRoom.enqueteCase}</h3>
                    
                    <div className="grid grid-cols-1 gap-2 text-left">
                      {(activeRoom.enqueteClues || []).map((clue: string, cIdx: number) => (
                        <div key={cIdx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                          <strong className="text-amber-400 font-bold block mb-0.5">🔍 Indice #{cIdx + 1}</strong>
                          {clue}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2 text-left">
                      <span className="text-[10px] font-black uppercase text-slate-400">Saisir votre conclusion / solution de l'enquête</span>
                      <Input
                        disabled={hasAnsweredCurrent}
                        placeholder="Tapez le mot clé ou coupable..."
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            setHasAnsweredCurrent(true);
                            playCorrectSound();
                            toast.success("Conclusion enregistrée !");
                          }
                        }}
                        className="h-11 rounded-xl bg-slate-800 border-slate-700 font-bold text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 6. Gestion d’Entreprise */}
                {activeRoom.mode === 'gestion_entreprise' && (
                  <div className="space-y-4 text-center max-w-xl mx-auto">
                    <Badge className="bg-rose-600 text-white font-black text-[10px] uppercase">💰 Investissements & Budgets</Badge>
                    <h3 className="text-base font-bold text-slate-300">Capital Restant : <span className="text-emerald-400 font-black">{activeRoom.capital} FCFA</span></h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                      {(activeRoom.decisions || []).map((dec: any, idx: number) => (
                        <button
                          key={idx}
                          disabled={hasAnsweredCurrent}
                          onClick={() => {
                            setHasAnsweredCurrent(true);
                            playCorrectSound();
                            toast.success(`Option "${dec.name}" financée !`);
                          }}
                          className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-left space-y-1 hover:border-rose-500 cursor-pointer"
                        >
                          <strong className="text-xs text-rose-400 font-black block">{dec.name}</strong>
                          <p className="text-[11px] text-slate-300">Coût : {dec.cost} FCFA</p>
                          <p className="text-[11px] text-emerald-400 font-bold">Retour : +{dec.revenue} FCFA</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Memory Professionnel */}
                {activeRoom.mode === 'memory_pro' && (
                  <div className="space-y-4 text-center max-w-xl mx-auto">
                    <Badge className="bg-purple-600 text-white font-black text-[10px] uppercase">🧠 Association de Cartes</Badge>
                    <h3 className="text-xs text-slate-400">Associez les bons termes techniques</h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                      {(activeRoom.memoryPairs || []).map((pair: any, pIdx: number) => {
                        const isFlipped = selectedOption === pair.term;
                        return (
                          <button
                            key={pIdx}
                            onClick={() => {
                              setSelectedOption(pair.term);
                              playBuzzerPress();
                            }}
                            className={cn(
                              "p-3 rounded-xl border flex flex-col justify-between h-24 text-center transition-all cursor-pointer",
                              isFlipped 
                                ? "bg-purple-900 border-purple-400 text-white"
                                : "bg-slate-850 border-slate-800 text-purple-300"
                            )}
                          >
                            <strong className="text-xs font-black block border-b border-purple-800 pb-1">{pair.term}</strong>
                            <p className="text-[10px] text-slate-300 leading-tight mt-1">
                              {isFlipped ? pair.definition : "❓ [Flippez]"}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 8. Atelier / Laboratoire Virtuel */}
                {activeRoom.mode === 'atelier_virtuel' && (
                  <div className="space-y-4 max-w-xl mx-auto text-center">
                    <Badge className="bg-indigo-600 text-white font-black text-[10px] uppercase">🧪 Travaux Pratiques Virtuels</Badge>
                    <h3 className="text-base sm:text-lg font-black text-white">{activeRoom.workshopTitle}</h3>

                    <div className="space-y-2 text-left">
                      {(activeRoom.manipulationSteps || []).map((step: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-850 border border-slate-700 text-xs">
                          <strong className="text-indigo-400 block font-bold mb-1">Étape #{idx + 1} : {step.instruction}</strong>
                          <Input
                            disabled={hasAnsweredCurrent}
                            placeholder="Entrez la commande linux..."
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                playCorrectSound();
                                toast.success("Commande validée !");
                              }
                            }}
                            className="h-8 font-mono text-[11px] bg-slate-900 border-none text-emerald-400 focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. Jeu de Rôle */}
                {activeRoom.mode === 'jeu_role' && (
                  <div className="space-y-4 text-center max-w-xl mx-auto">
                    <Badge className="bg-pink-600 text-white font-black text-[10px] uppercase">🗣️ Jeu de Rôle & Négociation</Badge>
                    <p className="text-xs sm:text-sm font-bold text-slate-200 bg-slate-800 p-4 rounded-xl leading-relaxed">{activeRoom.roleScenario}</p>

                    <div className="space-y-2 text-left">
                      <span className="text-[10px] font-black uppercase text-slate-400">Objection soulevée par le client :</span>
                      <div className="p-3 rounded-xl bg-red-950/40 border border-red-900 text-xs text-red-300 font-medium">
                        {activeRoom.objections?.[0]}
                      </div>
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-black uppercase text-slate-400">Votre argumentation idéale de réponse</span>
                        <Input
                          disabled={hasAnsweredCurrent}
                          placeholder="Saisissez votre réponse pour convaincre le client..."
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              setHasAnsweredCurrent(true);
                              playCorrectSound();
                              toast.success("Argument soumis !");
                            }
                          }}
                          className="h-10 bg-slate-800 border-slate-700 font-bold text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 10. Chasse au Trésor */}
                {activeRoom.mode === 'chasse_tresor' && (
                  <div className="space-y-4 text-center max-w-xl mx-auto">
                    <Badge className="bg-yellow-600 text-slate-950 font-black text-[10px] uppercase">🗺️ Énigmes Successives</Badge>
                    
                    <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-left space-y-2">
                      <span className="text-xs font-black text-yellow-400">🗝️ Énigme :</span>
                      <p className="text-xs sm:text-sm font-bold text-slate-200">{activeRoom.treasureRiddles?.[0]?.riddle}</p>
                    </div>

                    <div className="space-y-2 text-left pt-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">Entrez le code secret trouvé</span>
                      <div className="flex gap-2">
                        <Input
                          disabled={hasAnsweredCurrent}
                          placeholder="Code secret..."
                          className="h-11 bg-slate-800 border-slate-700 font-mono text-center font-bold tracking-widest uppercase text-sm"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              setHasAnsweredCurrent(true);
                              playCorrectSound();
                              toast.success("Énigme résolue !");
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Answer Feedback Alert */}
                {answerFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-center space-y-1 font-black text-xs sm:text-sm uppercase tracking-wider",
                      answerFeedback.isCorrect ? "bg-emerald-950 border-emerald-800 text-emerald-300" : "bg-red-950 border-red-800 text-red-300"
                    )}
                  >
                    <p>{answerFeedback.isCorrect ? "🎉 EXCELLENT !" : "❌ RÉVÉLATION DU SCORE !"}</p>
                    <p className="text-xs font-bold text-white">Points ajoutés : +{answerFeedback.points} PTS</p>
                  </motion.div>
                )}
              </div>
            ) : (
              /* Completed Victory Podium */
              <div className="text-center py-8 sm:py-12 space-y-4 sm:space-y-6">
                <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400 mx-auto animate-bounce" />
                <h3 className="text-2xl sm:text-3xl font-black text-white">Fin de la Compétition !</h3>
                <p className="text-xs text-purple-200 font-medium max-w-md mx-auto px-2">
                  Félicitations à tous les participants ! Vos points ont été enregistrés dans votre profil.
                </p>
                <Button onClick={() => setActiveLiveRoom(null)} className="bg-purple-600 text-white font-black text-xs uppercase px-6 sm:px-8 h-11 sm:h-12 rounded-xl sm:rounded-2xl">
                  Retour au Menu
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
