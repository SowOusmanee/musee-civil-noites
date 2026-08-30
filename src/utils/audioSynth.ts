// Web Audio API ambient chime & kora tone synthesizer for museum audio guide immersion

class MuseumAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playScanSuccess() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      
      // Note 1: High crisp chime (1046.50 Hz - C6)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.1);

      // Note 2: Higher confirming harmonic (1318.51 Hz - E6)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.09);
      gain2.gain.setValueAtTime(0, now + 0.09);
      gain2.gain.linearRampToValueAtTime(0.22, now + 0.105);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.28);
    } catch {
      // safe fallback
    }
  }

  public playScanError() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // Harsh dual low buzz tone (220 Hz & 180 Hz sawtooth / square)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.16);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(175, now + 0.14);
      gain2.gain.setValueAtTime(0, now + 0.14);
      gain2.gain.linearRampToValueAtTime(0.18, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.36);
    } catch {
      // safe fallback
    }
  }

  // Play a gentle pentatonic kora/kalimba note
  private playPentaNote(freq: number, duration: number = 2.5, gainLevel: number = 0.08) {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Warm triangle / sine blend
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(gainLevel, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // safe fallback
    }
  }

  public startAmbientSoundtrack() {
    this.initCtx();
    if (this.isPlaying) return;
    this.isPlaying = true;

    // West African pentatonic frequencies (Dakar / Mandé scale: F, G, A, C, D)
    const notes = [220, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];

    // Initial note
    this.playPentaNote(notes[0], 3, 0.05);
    this.playPentaNote(notes[4], 3.5, 0.03);

    let step = 0;
    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying) return;
      step++;
      const note1 = notes[Math.floor(Math.random() * notes.length)];
      this.playPentaNote(note1, 3.2, 0.04);

      if (step % 2 === 0) {
        const note2 = notes[Math.floor(Math.random() * 4)];
        setTimeout(() => {
          if (this.isPlaying) this.playPentaNote(note2, 4.0, 0.025);
        }, 800);
      }
    }, 2800);
  }

  public stopAmbientSoundtrack() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Web Speech API for voice narration if supported
  public speakText(text: string, onEnd?: () => void) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.95;
      utterance.pitch = 0.98;
      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }
      window.speechSynthesis.speak(utterance);
    }
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const museumAudio = new MuseumAudioEngine();
