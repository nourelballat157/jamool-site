export type SoundName = "click" | "open" | "correct" | "wrong" | "win" | "badge";

type Tone = {
  frequency: number;
  start: number;
  duration: number;
  type?: "sine" | "square" | "sawtooth" | "triangle";
  gain?: number;
};

/**
 * A single shared, child-friendly sound engine built on the Web Audio API.
 * No audio files are needed, so nothing can fail to load and nothing autoplays
 * when the website opens — a sound only plays after a real user action.
 */
const RECIPES: Record<SoundName, Tone[]> = {
  click: [{ frequency: 640, start: 0, duration: 0.07, gain: 0.055 }],
  open: [
    { frequency: 520, start: 0, duration: 0.1, gain: 0.06 },
    { frequency: 720, start: 0.08, duration: 0.12, gain: 0.06 },
  ],
  correct: [
    { frequency: 523.25, start: 0, duration: 0.16, gain: 0.13 },
    { frequency: 659.25, start: 0.12, duration: 0.16, gain: 0.13 },
    { frequency: 783.99, start: 0.24, duration: 0.26, gain: 0.13 },
  ],
  wrong: [
    { frequency: 320, start: 0, duration: 0.2, type: "triangle", gain: 0.1 },
    { frequency: 240, start: 0.16, duration: 0.28, type: "triangle", gain: 0.1 },
  ],
  win: [
    { frequency: 523.25, start: 0, duration: 0.18, gain: 0.14 },
    { frequency: 659.25, start: 0.14, duration: 0.18, gain: 0.14 },
    { frequency: 783.99, start: 0.28, duration: 0.18, gain: 0.14 },
    { frequency: 1046.5, start: 0.42, duration: 0.42, gain: 0.14 },
  ],
  badge: [
    { frequency: 659.25, start: 0, duration: 0.16, gain: 0.13 },
    { frequency: 880, start: 0.14, duration: 0.28, gain: 0.13 },
  ],
};

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

let enabled = true;
let context: AudioContext | null = null;
let lastPlayAt = 0;
let lastClickAt = 0;
const listeners = new Set<(value: boolean) => void>();

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
  listeners.forEach((listener) => listener(value));
}

export function subscribeSound(listener: (value: boolean) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const ContextCtor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!ContextCtor) return null;
    context = new ContextCtor();
  }
  if (context.state === "suspended") {
    void context.resume();
  }
  return context;
}

/**
 * Play a short, soft sound effect. Multiple sounds never overlap: a new sound
 * is skipped if another one started a moment ago, and rapid clicks are throttled.
 */
export function playSound(name: SoundName) {
  if (!enabled) return;

  const now = Date.now();
  if (now - lastPlayAt < 45) return;
  if (name === "click" && now - lastClickAt < 60) return;
  lastPlayAt = now;
  if (name === "click") lastClickAt = now;

  const ctx = getContext();
  if (!ctx) return;

  const start = ctx.currentTime;
  RECIPES[name].forEach((tone) => {
    const at = start + tone.start;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = tone.type ?? "sine";
    oscillator.frequency.setValueAtTime(tone.frequency, at);
    const peak = tone.gain ?? 0.12;
    gainNode.gain.setValueAtTime(0.0001, at);
    gainNode.gain.exponentialRampToValueAtTime(peak, at + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, at + tone.duration);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(at);
    oscillator.stop(at + tone.duration + 0.05);
  });
}