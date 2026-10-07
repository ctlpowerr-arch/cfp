export type GameType =
  | 'chrono_challenge'            // 🎯 Défi chrono
  | 'puzzle'                      // 🧩 Puzzle
  | 'simulation'                  // 🏗️ Simulation professionnelle
  | 'team_mission'                // 👥 Mission en équipe
  | 'investigation'               // 🕵️ Enquête pédagogique
  | 'business_mgmt'               // 💰 Gestion d’entreprise
  | 'memory'                      // 🧠 Memory professionnel
  | 'virtual_lab'                 // 🧪 Atelier/laboratoire virtuel
  | 'role_play'                   // 🗣️ Jeu de rôle
  | 'treasure_hunt';              // 🗺️ Chasse au trésor

export type GameMode = 'individual' | 'duel' | 'multiplayer' | 'teams';

export type GameDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type GameStatus = 'draft' | 'published' | 'scheduled' | 'active' | 'completed' | 'archived';

export type GameSessionStatus = 'waiting' | 'in_progress' | 'completed';

export interface GameParameters {
  durationMinutes: number;
  timeLimitPerRoundSeconds: number;
  maxPlayers: number;
  teamCount: number;
  playersPerTeam: number;
  roundsCount: number;
  maxAttempts: number;
}

export interface ScoringRules {
  correctPoints: number;
  wrongPenalty: number;
  speedBonus: boolean;
  speedBonusMax: number;
  streakBonus: number;
  missionSuccessPoints: number;
  hintPenalty: number;
  academicCredits: number; // Points académiques cumulables sur l'année
}

export interface GameContentItem {
  id: string;
  type?: string;
  title: string;
  prompt: string;
  timeLimitSeconds?: number;
  points?: number;
  options?: string[];
  correctAnswer?: string | string[];
  clues?: string[];
  scenarioContext?: string;
  decisions?: Array<{
    id: string;
    text: string;
    consequence: string;
    pointsDelta: number;
    budgetDelta?: number;
  }>;
  pairs?: Array<{
    id: string;
    term: string;
    match: string;
  }>;
  orderItems?: string[];
  investigationDocs?: Array<{
    title: string;
    content: string;
    isClue: boolean;
  }>;
}

export interface GameAudioSettings {
  launch: string;
  click: string;
  correct: string;
  wrong: string;
  countdown: string;
  pointsUp: string;
  pointsDown: string;
  victory: string;
  defeat: string;
  gameOver: string;
  notify: string;
}

export interface ConnectedPlayer {
  studentId: string;
  studentName: string;
  avatar: string;
  teamId?: string;
  isReady: boolean;
  joinedAt?: string;
  score?: number;
}

export interface GameTeam {
  id: string;
  name: string;
  color: string;
  score: number;
  memberIds: string[];
}

export interface EducationalGame {
  id: string;
  title: string;
  description: string;
  gameType: GameType;
  gameMode: GameMode;
  formation: string;
  classId: string;
  className: string;
  subject: string;
  level: string;
  difficulty: GameDifficulty;
  teacherId: string;
  teacherName: string;
  academicYearId: string;
  status: GameStatus;
  scheduledAt?: string;
  accessCode: string;
  parameters: GameParameters;
  scoringRules: ScoringRules;
  content: GameContentItem[];
  audioSettings: GameAudioSettings;
  connectedPlayers?: ConnectedPlayer[];
  teams?: GameTeam[];
  // Backwards compatibility with previous version
  mode?: string;
  questions?: any[];
  specialty?: string;
  classCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameTemplate {
  id: string;
  title: string;
  description: string;
  gameType: GameType;
  gameMode: GameMode;
  icon: string;
  badge: string;
  color: string;
  defaultFormation: string;
  defaultSubject: string;
  level: string;
  difficulty: GameDifficulty;
  parameters: GameParameters;
  scoringRules: ScoringRules;
  sampleContent: GameContentItem[];
}

export interface GameSession {
  id: string;
  gameId: string;
  gameTitle: string;
  gameType: GameType;
  gameMode: GameMode;
  accessCode: string;
  teacherId: string;
  teacherName: string;
  className: string;
  academicYearId: string;
  status: GameSessionStatus;
  currentRound: number;
  totalRounds: number;
  startedAt?: string;
  endedAt?: string;
  participants: Array<{
    studentId: string;
    studentName: string;
    avatar: string;
    teamId?: string;
    score: number;
    pointsWon: number;
    pointsLost: number;
    correctCount: number;
    wrongCount: number;
    isReady: boolean;
    joinedAt: string;
  }>;
  teams: GameTeam[];
  responses: Array<{
    studentId: string;
    studentName: string;
    roundIndex: number;
    answer: any;
    isCorrect: boolean;
    earnedPoints: number;
    submittedAt: string;
  }>;
}

export interface AcademicGameRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  formation: string;
  academicYearId: string;
  gameId: string;
  gameTitle: string;
  gameType: GameType;
  finalScore: number;
  rank: number;
  academicPoints: number;
  completedAt: string;
}
