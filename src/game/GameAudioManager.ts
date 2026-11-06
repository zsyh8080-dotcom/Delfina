/**
 * Procedural Web Audio API synthesizer + SpeechSynthesis narrator helper
 * Automatically pauses/ducks all game audio & speech while the child's microphone is listening
 * so game audio never interferes with Persian Speech-to-Text recognition.
 */

class GameAudioManagerImpl {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private isMicListening = false;
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMicListening(listening: boolean) {
    this.isMicListening = listening;
  }

  private playTone(
    freq: number,
    endFreq: number,
    durationMs: number,
    type: OscillatorType = 'sine',
    gainLevel = 0.14
  ) {
    if (this.isMuted || this.isMicListening) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + durationMs / 1000);

      gain.gain.setValueAtTime(gainLevel, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + durationMs / 1000);
    } catch {
      // Ignore audio errors when autoplay is blocked
    }
  }

  public playClick() {
    this.playTone(520, 680, 90, 'sine', 0.1);
  }

  public playMicStart() {
    // Intentionally silent during mic startup so Web Audio never steals audio focus or aborts SpeechRecognition
  }

  public playCommandRecognized() {
    this.playTone(587.33, 880, 180, 'triangle', 0.15);
  }

  public playUnknownCommand() {
    this.playTone(320, 220, 220, 'sine', 0.12);
  }

  public playSwordAttack() {
    this.playTone(300, 920, 160, 'triangle', 0.18);
    setTimeout(() => this.playTone(780, 420, 190, 'sine', 0.15), 90);
  }

  public playShieldPing() {
    this.playTone(880, 1320, 240, 'sine', 0.18);
    setTimeout(() => this.playTone(1320, 1760, 180, 'triangle', 0.12), 80);
  }

  public playJump() {
    this.playTone(280, 740, 240, 'sine', 0.15);
  }

  public playBubblePower() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, n * 1.15, 200, 'sine', 0.16), idx * 75);
    });
  }

  public playGateOpen() {
    const notes = [392, 493.88, 587.33, 783.99];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, n * 1.05, 250, 'triangle', 0.15), idx * 110);
    });
  }

  public playVictoryFanfare() {
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, n, 340, 'triangle', 0.16), idx * 120);
    });
  }

  public speakPersian(text: string, onStart?: () => void, onEnd?: () => void) {
    if (this.isMuted || this.isMicListening || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      this.activeUtterance = utterance;
      utterance.lang = 'fa-IR';
      utterance.rate = 0.95;
      utterance.pitch = 1.12;
      utterance.onstart = () => onStart?.();
      utterance.onend = () => {
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
        }
        onEnd?.();
      };
      utterance.onerror = () => {
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
        }
        onEnd?.();
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      onEnd?.();
    }
  }

  public stopAllSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    }
  }
}

export const gameAudio = new GameAudioManagerImpl();
