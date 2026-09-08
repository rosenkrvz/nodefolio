import { SoundType, synthesizeSound } from './sounds';

const STORAGE_KEY = 'nodefolio_audio_muted';
const MASTER_VOLUME = 0.28; // Subtle, refined, understated master level

// Cooldown intervals per sound type in milliseconds to prevent spam
const COOLDOWNS: Record<SoundType, number> = {
  click: 60,
  secondaryClick: 50,
  hover: 160,
  open: 120,
  close: 120,
  connect: 150,
  disconnect: 150,
  select: 70,
  zoom: 140,
  success: 200,
  error: 180,
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean = false;
  private isUnlocked: boolean = false;
  private lastPlayed: Map<SoundType, number> = new Map();
  private listeners: Set<(muted: boolean) => void> = new Set();
  private isMobileDevice: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        this.muted = stored === 'true';
      } catch {
        this.muted = false;
      }

      this.isMobileDevice =
        'ontouchstart' in window ||
        (navigator && navigator.maxTouchPoints > 0) ||
        window.innerWidth < 768;

      this.registerFirstInteractionListener();
    }
  }

  private registerFirstInteractionListener() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.ensureContext();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('click', unlock);
    };

    window.addEventListener('pointerdown', unlock, { passive: true, once: true });
    window.addEventListener('keydown', unlock, { passive: true, once: true });
    window.addEventListener('click', unlock, { passive: true, once: true });
  }

  private ensureContext(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      if (!this.ctx) {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        if (!AudioContextClass) return false;

        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : MASTER_VOLUME, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      this.isUnlocked = true;
      return true;
    } catch {
      return false;
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem(STORAGE_KEY, String(muted));
    } catch {
      // Ignore storage errors
    }

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(muted ? 0 : MASTER_VOLUME, this.ctx.currentTime);
      } catch {
        // Ignore audio errors
      }
    }

    this.notifyListeners();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    if (!this.muted) {
      // Play an immediate subtle confirmation click when unmuting
      this.playSound('secondaryClick');
    }
    return this.muted;
  }

  public subscribe(listener: (muted: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => {
      try {
        l(this.muted);
      } catch {
        // Ignore listener error
      }
    });
  }

  public playSound(type: SoundType, options?: { volumeMultiplier?: number }): void {
    if (this.muted) return;

    // Mobile check: skip hover sounds completely on touch devices
    if (type === 'hover' && this.isMobileDevice) return;

    // Cooldown check to prevent acoustic spam
    const now = Date.now();
    const last = this.lastPlayed.get(type) || 0;
    const cooldown = COOLDOWNS[type] || 60;
    if (now - last < cooldown) {
      return;
    }
    this.lastPlayed.set(type, now);

    try {
      if (!this.ensureContext() || !this.ctx || !this.masterGain) {
        return;
      }

      // If custom volume multiplier passed, route through a temporary gain node
      if (options?.volumeMultiplier && options.volumeMultiplier !== 1.0) {
        const tempGain = this.ctx.createGain();
        tempGain.gain.setValueAtTime(options.volumeMultiplier, this.ctx.currentTime);
        tempGain.connect(this.masterGain);
        synthesizeSound(this.ctx, tempGain, type);
      } else {
        synthesizeSound(this.ctx, this.masterGain, type);
      }
    } catch {
      // Audio errors must NEVER crash the application
    }
  }
}

// Export singleton instance
export const audioManager = new AudioManager();

// Helper convenience function
export function playSound(type: SoundType, options?: { volumeMultiplier?: number }): void {
  audioManager.playSound(type, options);
}
