// Safe web audio synthesizer for SOS alert and geofence alerts
class SoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  private sirenOscillator: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private isSirenActive = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  playBeep(freq = 600, duration = 0.15) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playGeofenceChime() {
    this.playBeep(523.25, 0.12); // C5
    setTimeout(() => this.playBeep(659.25, 0.18), 120); // E5
  }

  startSiren() {
    try {
      const ctx = this.getContext();
      if (!ctx || this.isSirenActive) return;

      this.isSirenActive = true;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(700, ctx.currentTime);

      // Wobble siren
      let time = ctx.currentTime;
      for (let i = 0; i < 20; i++) {
        osc.frequency.linearRampToValueAtTime(950, time + 0.3);
        osc.frequency.linearRampToValueAtTime(700, time + 0.6);
        time += 0.6;
      }

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      this.sirenOscillator = osc;
      this.sirenGain = gain;
    } catch {
      // safe fallback
    }
  }

  stopSiren() {
    try {
      if (this.sirenOscillator) {
        this.sirenOscillator.stop();
        this.sirenOscillator.disconnect();
        this.sirenOscillator = null;
      }
      this.isSirenActive = false;
    } catch {
      // safe fallback
    }
  }
}

export const soundEffects = new SoundSynthesizer();
