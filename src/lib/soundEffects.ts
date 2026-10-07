// Web Audio API Synthesizer & MP3 Player for TV Game Show Sound Effects
// Supports loading real MP3 assets from the /AUD folder with resilient synthesized audio fallbacks!

let audioCtx: AudioContext | null = null;
let soundMuted = false;

// Track active playing audio elements for looping/previews
let lobbyMusic: HTMLAudioElement | null = null;
let countdownMusic: HTMLAudioElement | null = null;
let previewAudio: HTMLAudioElement | null = null;

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

export function setSoundMuted(muted: boolean) {
  soundMuted = muted;
  if (muted) {
    stopLobbyMusic();
    stopCountdownMusic();
    stopPreviewSound();
  }
}

export function isSoundMuted(): boolean {
  return soundMuted;
}

// Resilient helper to play an HTML5 Audio MP3 file, falling back to Web Audio synth on failure
function playMp3WithFallback(url: string, fallbackSynth: () => void) {
  if (soundMuted) return;
  
  // Create HTMLAudioElement
  const audio = new Audio(url);
  audio.volume = 0.5;
  
  audio.play().catch((err) => {
    // If the file is missing or fails (e.g. no user interaction yet or file 404),
    // use our reliable Web Audio API synthesizer fallback
    console.warn(`Could not play MP3: ${url}. Falling back to synthesized audio.`, err);
    fallbackSynth();
  });
}

// 1. Correct Answer Sound (Happy ascending chord chime or custom MP3)
export function playCorrectSound(customUrl: string = '/AUD/bon/1.mp3') {
  const synthFallback = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });
  };

  playMp3WithFallback(customUrl, synthFallback);
}

// 2. Wrong Answer / Buzzer Sound (Low buzz or custom MP3)
export function playWrongSound(customUrl: string = '/AUD/mov/1.mp3') {
  const synthFallback = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  };

  playMp3WithFallback(customUrl, synthFallback);
}

// 3. Countdown Tick Sound (Standard clock tick or custom MP3)
export function playCountdownTick(customUrl: string = '/AUD/pan/1.mp3') {
  const synthFallback = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  };

  playMp3WithFallback(customUrl, synthFallback);
}

// 4. Buzzer Press Sound (High-energy TV Buzzer)
export function playBuzzerPress() {
  if (soundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'square';
  osc2.type = 'sawtooth';

  osc1.frequency.setValueAtTime(440, now);
  osc2.frequency.setValueAtTime(880, now);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.25);
  osc2.stop(now + 0.25);
}

// 5. Victory Fanfare Sound (Victory fanfare or custom MP3)
export function playVictoryFanfare(customUrl: string = '/AUD/vic/1.mp3') {
  const synthFallback = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const melody = [
      { freq: 523.25, duration: 0.15 }, // C5
      { freq: 659.25, duration: 0.15 }, // E5
      { freq: 783.99, duration: 0.15 }, // G5
      { freq: 1046.50, duration: 0.4 }  // C6
    ];

    let offset = 0;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + offset);
      gain.gain.setValueAtTime(0.3, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + note.duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + note.duration + 0.05);
      offset += note.duration + 0.03;
    });
  };

  playMp3WithFallback(customUrl, synthFallback);
}

// 6. Lobby Music ("deb") - Loops background music before launch
export function playLobbyMusic(url: string = '/AUD/deb/1.mp3') {
  if (soundMuted) return;
  stopLobbyMusic(); // Stop previous if any
  
  lobbyMusic = new Audio(url);
  lobbyMusic.volume = 0.4;
  lobbyMusic.loop = true;
  lobbyMusic.play().catch((err) => {
    console.warn(`Lobby music failed to play: ${url}`, err);
  });
}

export function stopLobbyMusic() {
  if (lobbyMusic) {
    lobbyMusic.pause();
    lobbyMusic = null;
  }
}

// 7. Countdown Music ("pan") - Loops during a question's timer
export function playCountdownMusic(url: string = '/AUD/pan/1.mp3') {
  if (soundMuted) return;
  stopCountdownMusic(); // Stop previous if any
  
  countdownMusic = new Audio(url);
  countdownMusic.volume = 0.4;
  countdownMusic.loop = true;
  countdownMusic.play().catch((err) => {
    console.warn(`Countdown music failed to play: ${url}`, err);
  });
}

export function stopCountdownMusic() {
  if (countdownMusic) {
    countdownMusic.pause();
    countdownMusic = null;
  }
}

// 8. Teacher Preview Audio
export function playPreviewSound(url: string) {
  if (soundMuted) return;
  stopPreviewSound(); // Stop previous
  
  previewAudio = new Audio(url);
  previewAudio.volume = 0.6;
  previewAudio.play().catch((err) => {
    console.warn(`Preview audio failed to play: ${url}`, err);
  });
}

export function stopPreviewSound() {
  if (previewAudio) {
    previewAudio.pause();
    previewAudio = null;
  }
}

// 9. Reveal Sound (Magnificent suspense-reveal chime/fanfare)
export function playRevealSound() {
  if (soundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const melody = [587.33, 659.25, 698.46, 880.00, 1174.66]; // D5, E5, F5, A5, D6

  melody.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.06);
    
    gain.gain.setValueAtTime(0, now + i * 0.06);
    gain.gain.linearRampToValueAtTime(0.25, now + i * 0.06 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.6);
  });
}

// 10. Joy Cheering / Applause Sound (When someone finds the correct answer)
export function playCheerSound() {
  if (soundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Synthesize cheering applause with white noise source and warm bandpass filters
  const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds of applause
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1000, now);
  filter.Q.setValueAtTime(2.0, now);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.15); // fade in
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4); // fade out
  
  noiseNode.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noiseNode.start(now);
  noiseNode.stop(now + 1.5);

  // Add bird-like chirping on top for extra excitement
  const pitchChirps = [1500, 1800, 2200, 2400];
  pitchChirps.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.1);
    osc.frequency.exponentialRampToValueAtTime(freq + 400, now + idx * 0.1 + 0.15);
    
    oscGain.gain.setValueAtTime(0, now + idx * 0.1);
    oscGain.gain.linearRampToValueAtTime(0.12, now + idx * 0.1 + 0.03);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.2);
    
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    osc.start(now + idx * 0.1);
    osc.stop(now + idx * 0.1 + 0.22);
  });
}
