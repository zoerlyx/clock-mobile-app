import { AlarmSound } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentAlarmInterval: number | null = null;
  private isMuted: boolean = false;

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlarmSound();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play subtle tactile mechanical click
  public playClick(pitch: number = 800) {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio context might be restricted before first interaction
    }
  }

  // Play stopwatch tick
  public playTick(accent: boolean = false) {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(accent ? 1200 : 800, ctx.currentTime);

      gain.gain.setValueAtTime(accent ? 0.05 : 0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {}
  }

  // Play harmonic note helper
  private playHarmonicNote(freq: number, duration: number, type: OscillatorType = 'sine', gainVal: number = 0.2, delay: number = 0) {
    const ctx = this.initCtx();
    if (!ctx) return;
    const startTime = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  // Play preview or sequence of alarm sound
  public playAlarmSoundOnce(soundType: AlarmSound) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      switch (soundType) {
        case 'radiance':
          // Warm uplifting major chords
          this.playHarmonicNote(523.25, 0.4, 'sine', 0.25, 0); // C5
          this.playHarmonicNote(659.25, 0.4, 'sine', 0.25, 0.12); // E5
          this.playHarmonicNote(783.99, 0.5, 'sine', 0.25, 0.24); // G5
          this.playHarmonicNote(1046.50, 0.8, 'sine', 0.3, 0.36); // C6
          break;
        case 'cosmic':
          // Spatial shimmering bell
          this.playHarmonicNote(440.0, 0.6, 'sine', 0.2, 0);
          this.playHarmonicNote(880.0, 0.8, 'triangle', 0.15, 0.1);
          this.playHarmonicNote(1320.0, 1.0, 'sine', 0.1, 0.2);
          this.playHarmonicNote(1760.0, 1.2, 'sine', 0.08, 0.3);
          break;
        case 'pulse':
          // Energetic rhythmic modern pulse
          for (let i = 0; i < 4; i++) {
            this.playHarmonicNote(880, 0.08, 'square', 0.15, i * 0.12);
          }
          break;
        case 'bell':
          // Deep resonant temple chime
          this.playHarmonicNote(329.63, 1.5, 'sine', 0.3, 0); // E4
          this.playHarmonicNote(659.25, 1.2, 'sine', 0.18, 0); // E5
          this.playHarmonicNote(987.77, 1.0, 'sine', 0.12, 0); // B5
          break;
        case 'chime':
        default:
          // Classic crystal dual chime
          this.playHarmonicNote(587.33, 0.6, 'sine', 0.25, 0); // D5
          this.playHarmonicNote(880.00, 0.8, 'sine', 0.25, 0.18); // A5
          break;
      }
    } catch {}
  }

  // Continuous alarm ringing loop
  public startAlarmSound(soundType: AlarmSound, vibration: boolean = true) {
    if (this.isMuted) return;
    this.stopAlarmSound();

    this.playAlarmSoundOnce(soundType);
    this.currentAlarmInterval = window.setInterval(() => {
      this.playAlarmSoundOnce(soundType);
      if (vibration && 'vibrate' in navigator) {
        try {
          navigator.vibrate([300, 150, 300, 150]);
        } catch {}
      }
    }, 1800);

    if (vibration && 'vibrate' in navigator) {
      try {
        navigator.vibrate([300, 150, 300, 150]);
      } catch {}
    }
  }

  public stopAlarmSound() {
    if (this.currentAlarmInterval !== null) {
      clearInterval(this.currentAlarmInterval);
      this.currentAlarmInterval = null;
    }
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch {}
    }
  }

  // Play timer complete sound
  public playTimerFinished(vibration: boolean = true) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      // Triple resonant completion gong
      this.playHarmonicNote(440, 1.4, 'sine', 0.3, 0);
      this.playHarmonicNote(659.25, 1.4, 'sine', 0.25, 0.15);
      this.playHarmonicNote(880, 1.8, 'sine', 0.3, 0.3);
      this.playHarmonicNote(1320, 2.0, 'triangle', 0.15, 0.45);

      if (vibration && 'vibrate' in navigator) {
        navigator.vibrate([400, 200, 400, 200, 600]);
      }
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
