import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Copy,
  Check,
  Play,
  RotateCcw,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EducationalGame, GameSession, GameSessionStatus } from '@/types/games';
import { gameAudio } from '@/lib/gameAudio';

interface WaitingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: EducationalGame | null;
  sessionCode?: string;
  isTeacher?: boolean;
  currentUserId?: string;
  onStartSession?: (game: EducationalGame) => void;
  onViewResults?: (game: EducationalGame) => void;
}

export default function WaitingRoomModal({
  isOpen,
  onClose,
  game,
  sessionCode,
  isTeacher = false,
  currentUserId = 'std_101',
  onStartSession,
  onViewResults
}: WaitingRoomModalProps) {
  const [session, setSession] = useState<GameSession | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const activeCode = sessionCode || game?.accessCode || (game?.id ? game.id.replace('game_', '').slice(0, 6).toUpperCase() : 'ITMC42');

  // Fetch / Poll session state
  const fetchSessionState = async () => {
    if (!game && !sessionCode) return;
    try {
      const codeOrId = sessionCode || game?.accessCode || game?.id;
      const res = await fetch(`/api/games/session/${codeOrId}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
      }
    } catch (e) {
      console.error("Failed to poll session:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessionState();
      const interval = setInterval(fetchSessionState, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, game?.id, sessionCode]);

  // Copy code helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    gameAudio.click();
    toast.success(`Code ${activeCode} copié dans le presse-papier !`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Start Session (Teacher)
  const handleStartSession = async () => {
    if (!game) return;
    setIsStarting(true);
    try {
      const res = await fetch(`/api/games/session/${activeCode}/start`, { method: 'POST' });
      if (res.ok) {
        gameAudio.launch();
        toast.success("La partie est lancée ! Tous les étudiants entrent dans l'arène.");
        if (onStartSession) onStartSession(game);
        fetchSessionState();
      }
    } catch {
      toast.error("Erreur lors du démarrage de la session");
    } finally {
      setIsStarting(false);
    }
  };

  // End Session (Teacher)
  const handleEndSession = async () => {
    if (!game) return;
    setIsEnding(true);
    try {
      const res = await fetch(`/api/games/session/${activeCode}/end`, { method: 'POST' });
      if (res.ok) {
        gameAudio.victory();
        toast.success("Session clôturée ! Les points académiques ont été enregistrés.");
        fetchSessionState();
      }
    } catch {
      toast.error("Erreur lors de la clôture");
    } finally {
      setIsEnding(false);
    }
  };

  const currentStatus: GameSessionStatus = session?.status || (game?.status === 'active' ? 'in_progress' : (game?.status === 'completed' ? 'completed' : 'waiting'));
  const participantsList = session?.participants?.length ? session.participants : (game?.connectedPlayers || []);
  const teamsList = session?.teams?.length ? session.teams : (game?.teams || []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-4xl rounded-3xl p-4 sm:p-7 md:p-8 max-h-[92vh] overflow-y-auto bg-slate-950 text-white border-slate-800 shadow-2xl">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-purple-600 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1">
                  🎮 Salle d'Attente Interactive
                </Badge>

                {currentStatus === 'waiting' && (
                  <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-3 py-1 animate-pulse">
                    ⏳ EN ATTENTE DES JOUEURS
                  </Badge>
                )}
                {currentStatus === 'in_progress' && (
                  <Badge className="bg-emerald-500 text-slate-950 font-black text-[9px] uppercase px-3 py-1 animate-pulse">
                    🟢 SESSION EN COURS
                  </Badge>
                )}
                {currentStatus === 'completed' && (
                  <Badge className="bg-purple-500 text-white font-black text-[9px] uppercase px-3 py-1">
                    🏆 SESSION TERMINÉE
                  </Badge>
                )}
              </div>

              <DialogTitle className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {game?.title || session?.gameTitle || "Session de Compétition"}
              </DialogTitle>
              <p className="text-xs text-purple-200">
                Enseignant : <strong className="text-white">{game?.teacherName || session?.teacherName || "Professeur"}</strong> • Classe : <strong className="text-amber-400">{game?.className || session?.className || "Génie Logiciel"}</strong>
              </p>
            </div>

            {/* Access Code Box */}
            <div className="flex items-center gap-2 bg-slate-900 border border-purple-500/40 p-2.5 px-4 rounded-2xl shrink-0 shadow-lg shadow-purple-900/20">
              <div>
                <p className="text-[9px] font-black uppercase text-purple-400 tracking-wider">Code de Rejoint</p>
                <p className="text-2xl font-black text-amber-400 font-mono tracking-widest leading-none mt-0.5">{activeCode}</p>
              </div>
              <Button
                type="button"
                onClick={handleCopyCode}
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Copier le code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* BODY TABS / STATE DISPLAY */}
        <div className="space-y-6 py-3">
          {/* Key Session Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-[9px] font-black uppercase text-slate-500">Durée</p>
                <p className="text-xs font-black text-white">{game?.parameters?.durationMinutes || 15} minutes</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-[9px] font-black uppercase text-slate-500">Joueurs Connectés</p>
                <p className="text-xs font-black text-emerald-400">{participantsList.length} en ligne</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-[9px] font-black uppercase text-slate-500">Mode</p>
                <p className="text-xs font-black text-amber-400 capitalize">{game?.gameMode || 'Multijoueur'}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-[9px] font-black uppercase text-slate-500">Points Annuels</p>
                <p className="text-xs font-black text-cyan-400">+{game?.scoringRules?.academicCredits || 10} crédits</p>
              </div>
            </div>
          </div>

          {/* VIEW 1: EN ATTENTE */}
          {currentStatus === 'waiting' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  <p className="text-xs font-bold text-purple-200">
                    {isTeacher 
                      ? "Partagez le code aux étudiants. Lorsque tout le monde est prêt, lancez la compétition !"
                      : "Vous êtes connecté ! Patientez quelques instants pendant que l'enseignant lance la partie."}
                  </p>
                </div>

                {isTeacher && (
                  <Button
                    onClick={handleStartSession}
                    disabled={isStarting || participantsList.length === 0}
                    className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer shrink-0"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    {isStarting ? "Démarrage..." : `Démarrer (${participantsList.length} joueurs)`}
                  </Button>
                )}
              </div>

              {/* TEAMS SECTION (If gameMode === 'teams') */}
              {teamsList.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Répartition des Équipes ({teamsList.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {teamsList.map((t: any) => {
                      const teamMembers = participantsList.filter((p: any) => p.teamId === t.id);
                      return (
                        <div
                          key={t.id}
                          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 relative overflow-hidden"
                          style={{ borderLeftColor: t.color || '#9333ea', borderLeftWidth: '4px' }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-white">{t.name}</span>
                            <Badge variant="outline" className="text-[9px] font-bold text-slate-400">
                              {teamMembers.length} membre{teamMembers.length > 1 ? 's' : ''}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {teamMembers.map((m: any, mi: number) => (
                              <Avatar key={mi} className="h-7 w-7 border border-slate-700" title={m.studentName}>
                                <AvatarImage src={m.avatar} />
                                <AvatarFallback className="text-[10px]">{m.studentName?.charAt(0)}</AvatarFallback>
                              </Avatar>
                            ))}
                            {teamMembers.length === 0 && (
                              <span className="text-[10px] text-slate-500 italic">En attente d'assignation...</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CONNECTED PLAYERS LIST */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    Participants Connectés ({participantsList.length})
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-400">Actualisation temps réel</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[260px] overflow-y-auto pr-1">
                  {participantsList.map((p: any, idx: number) => (
                    <div
                      key={p.studentId || idx}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-2.5"
                    >
                      <Avatar className="h-8 w-8 border border-purple-500 shrink-0">
                        <AvatarImage src={p.avatar} />
                        <AvatarFallback>{p.studentName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-white truncate">{p.studentName}</p>
                        <p className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Prêt
                        </p>
                      </div>
                    </div>
                  ))}

                  {participantsList.length === 0 && (
                    <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                      Aucun participant connecté pour le moment. Partagez le code <strong className="text-amber-400">{activeCode}</strong> aux étudiants !
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: EN COURS */}
          {currentStatus === 'in_progress' && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-800/60 text-center space-y-4 animate-in fade-in duration-150">
              <span className="w-12 h-12 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 flex items-center justify-center mx-auto text-xl animate-pulse">
                ⚡
              </span>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">La Compétition est en Cours de Jeu !</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Les joueurs répondent aux épreuves en direct. Le podium et les points se mettent à jour automatiquement.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                {isTeacher && (
                  <>
                    <Button
                      onClick={() => {
                        if (onStartSession && game) onStartSession(game);
                        onClose();
                      }}
                      className="h-11 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                    >
                      📺 Ouvrir la Régie Grand Écran
                    </Button>

                    <Button
                      onClick={handleEndSession}
                      disabled={isEnding}
                      variant="outline"
                      className="h-11 px-5 rounded-xl border-red-800 bg-red-950/40 text-red-300 hover:bg-red-900 text-xs font-black uppercase cursor-pointer"
                    >
                      {isEnding ? "Clôture..." : "🏁 Clôturer la Session"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: TERMINÉ */}
          {currentStatus === 'completed' && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/80 to-slate-900 border border-purple-800 text-center space-y-5 animate-in fade-in duration-150">
              <Trophy className="w-14 h-14 text-amber-400 mx-auto animate-bounce" />

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">Compétition Terminée avec Succès !</h3>
                <p className="text-xs text-purple-200">
                  Les résultats sont enregistrés de façon permanente dans le carnet académique de chaque participant.
                </p>
              </div>

              {/* Mini Podium */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                {[...participantsList].sort((a: any, b: any) => (b.score || 0) - (a.score || 0)).slice(0, 3).map((p: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                    <span className="text-base">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                    <p className="text-xs font-black text-white truncate">{p.studentName}</p>
                    <p className="text-xs font-mono font-bold text-amber-400">{p.score || 0} pts</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  onClick={onClose}
                  className="h-11 px-7 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase cursor-pointer"
                >
                  Fermer la Salle
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
