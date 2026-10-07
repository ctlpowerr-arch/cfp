// Centralized Audio Library for Educational Games
// Integrates standard assets from the /AUDIO folder with robust Web Audio API synthesizers

export type SoundCategory =
  | 'lancement'
  | 'clic'
  | 'bonne_reponse'
  | 'mauvaise_reponse'
  | 'compte_a_rebours'
  | 'gain_points'
  | 'perte_points'
  | 'victoire'
  | 'defaite'
  | 'fin_jeu'
  | 'notification';

export interface SoundCatalogItem {
  id: SoundCategory;
  name: string;
  description: string;
  defaultPath: string;
  category: 'interaction' | 'gameplay' | 'outcome' | 'system';
}

export const SOUND_CATALOG: SoundCatalogItem[] = [
  {
    id: 'lancement',
    name: 'Lancement de Partie (deb)',
    description: 'Jingle dynamique d\'ouverture de session de jeu ou manche',
    defaultPath: '/AUD/deb/1.mp3',
    category: 'system'
  },
  {
    id: 'clic',
    name: 'Clic & Interaction',
    description: 'Son court et net lors de la sélection ou pression de bouton',
    defaultPath: '/AUDIO/clic.wav',
    category: 'interaction'
  },
  {
    id: 'bonne_reponse',
    name: 'Bonne Réponse (bon)',
    description: 'Son harmonieux pour validation de réponse exacte',
    defaultPath: '/AUD/bon/1.mp3',
    category: 'gameplay'
  },
  {
    id: 'mauvaise_reponse',
    name: 'Mauvaise Réponse / Erreur (mov)',
    description: 'Buzzer ou son d\'erreur pour réponse incorrecte',
    defaultPath: '/AUD/mov/1.mp3',
    category: 'gameplay'
  },
  {
    id: 'compte_a_rebours',
    name: 'Compte à Rebours / Chrono (pan)',
    description: 'Pression sonore et tic-tac pour le chronomètre',
    defaultPath: '/AUD/pan/1.mp3',
    category: 'gameplay'
  },
  {
    id: 'gain_points',
    name: 'Gain de Points / Bonus',
    description: 'Effet scintillant marquant l\'ajout de points ou bonus de vitesse',
    defaultPath: '/AUDIO/gain_points.wav',
    category: 'gameplay'
  },
  {
    id: 'perte_points',
    name: 'Pénalité / Perte de Points',
    description: 'Son descendant indiquant une pénalité ou utilisation d\'indice',
    defaultPath: '/AUD/perte_points.wav',
    category: 'gameplay'
  },
  {
    id: 'victoire',
    name: 'Victoire & Podium (vic)',
    description: 'Fanfare triomphale pour célébrer le gagnant ou l\'équipe victorieuse',
    defaultPath: '/AUD/vic/1.mp3',
    category: 'outcome'
  },
  {
    id: 'defaite',
    name: 'Défaite / Fin de Vies',
    description: 'Progression mineure lors de l\'épuisement des essais ou échec',
    defaultPath: '/AUDIO/defaite.wav',
    category: 'outcome'
  },
  {
    id: 'fin_jeu',
    name: 'Fin de Jeu / Clôture',
    description: 'Sonorité solennelle concluant la session pour révéler les bilans',
    defaultPath: '/AUDIO/fin_jeu.wav',
    category: 'outcome'
  },
  {
    id: 'notification',
    name: 'Notification & Alerte',
    description: 'Carillon doux pour notification d\'équipe ou consigne',
    defaultPath: '/AUDIO/notification.wav',
    category: 'system'
  }
];

let audioCtx: AudioContext | null = null;
let soundMuted = false;
let globalVolume = 0.6;

// Track active music loops
let activeLobbyAudio: HTMLAudioElement | null = null;
let activeCountdownAudio: HTMLAudioElement | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setAudioMuted(muted: boolean) {
  soundMuted = muted;
  if (muted) {
    stopAllAudio();
  }
}

export function isAudioMuted(): boolean {
  return soundMuted;
}

export function setAudioVolume(volume: number) {
  globalVolume = Math.max(0, Math.min(1, volume));
}

export function getAudioVolume(): number {
  return globalVolume;
}

// Fallback Synthesizers (Web Audio API)
const synthFallbacks: Record<SoundCategory, () => void> = {
  lancement: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [440, 554, 659, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.25 * globalVolume, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.45);
    });
  },
  clic: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.15 * globalVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  },
  bonne_reponse: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2 * globalVolume, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });
  },
  mauvaise_reponse: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.25 * globalVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  },
  compte_a_rebours: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.2 * globalVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  },
  gain_points: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [987, 1318].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.09);
      gain.gain.setValueAtTime(0.2 * globalVolume, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.3);
    });
  },
  perte_points: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);
    gain.gain.setValueAtTime(0.2 * globalVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  },
  victoire: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523, 659, 784, 1046, 1318].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.15);
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.25 * globalVolume, now + i * 0.15 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.55);
    });
  },
  defaite: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [440, 415, 349, 293].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.2);
      gain.gain.setValueAtTime(0.2 * globalVolume, now + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.5);
    });
  },
  fin_jeu: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, now);
    gain.gain.setValueAtTime(0.3 * globalVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.3);
  },
  notification: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now);
    gain.gain.setValueAtTime(0.18 * globalVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }
};

/**
 * Main Centralized Audio Player
 * Plays the MP3/WAV file from /AUDIO, falling back to Web Audio API synthesis
 */
export function playSound(category: SoundCategory, customPath?: string) {
  if (soundMuted) return;

  const catalogItem = SOUND_CATALOG.find((s) => s.id === category);
  const audioPath = customPath || catalogItem?.defaultPath || `/AUDIO/${category}.wav`;

  try {
    const audio = new Audio(audioPath);
    audio.volume = globalVolume;
    audio.play().catch(() => {
      // Autoplay blocked or asset not reachable, trigger resilient synth fallback
      const fallback = synthFallbacks[category];
      if (fallback) fallback();
    });
  } catch {
    const fallback = synthFallbacks[category];
    if (fallback) fallback();
  }
}

// Background Music Helpers
export function startLobbyMusicLoop(url = '/AUD/deb/1.mp3') {
  if (soundMuted) return;
  stopLobbyMusicLoop();
  try {
    activeLobbyAudio = new Audio(url);
    activeLobbyAudio.loop = true;
    activeLobbyAudio.volume = 0.25 * globalVolume;
    activeLobbyAudio.play().catch(() => {});
  } catch {}
}

export function stopLobbyMusicLoop() {
  if (activeLobbyAudio) {
    try {
      activeLobbyAudio.pause();
      activeLobbyAudio.currentTime = 0;
    } catch {}
    activeLobbyAudio = null;
  }
}

export function startCountdownMusicLoop(url = '/AUD/pan/1.mp3') {
  if (soundMuted) return;
  stopCountdownMusicLoop();
  try {
    activeCountdownAudio = new Audio(url);
    activeCountdownAudio.loop = true;
    activeCountdownAudio.volume = 0.3 * globalVolume;
    activeCountdownAudio.play().catch(() => {});
  } catch {}
}

export function stopCountdownMusicLoop() {
  if (activeCountdownAudio) {
    try {
      activeCountdownAudio.pause();
      activeCountdownAudio.currentTime = 0;
    } catch {}
    activeCountdownAudio = null;
  }
}

export function stopAllAudio() {
  stopLobbyMusicLoop();
  stopCountdownMusicLoop();
}

// Export named helpers for ergonomic usage
export const gameAudio = {
  play: playSound,
  click: () => playSound('clic'),
  launch: () => playSound('lancement'),
  correct: () => playSound('bonne_reponse'),
  wrong: () => playSound('mauvaise_reponse'),
  tick: () => playSound('compte_a_rebours'),
  pointsUp: () => playSound('gain_points'),
  pointsDown: () => playSound('perte_points'),
  victory: () => playSound('victoire'),
  defeat: () => playSound('defaite'),
  gameOver: () => playSound('fin_jeu'),
  notify: () => playSound('notification'),
  setMuted: setAudioMuted,
  isMuted: isAudioMuted,
  setVolume: setAudioVolume,
  getVolume: getAudioVolume,
  catalog: SOUND_CATALOG
};
