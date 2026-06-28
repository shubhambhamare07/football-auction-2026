class SoundManager {
  private isMuted: boolean = false;
  private ctx: AudioContext | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuteState() {
    return this.isMuted;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, gainSequence: { time: number; val: number }[]) {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    
    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Apply gain envelope
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    for (const step of gainSequence) {
      gainNode.gain.linearRampToValueAtTime(step.val, this.ctx.currentTime + step.time);
    }

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playClick() {
    this.playTone(800, 'sine', 0.08, [
      { time: 0.005, val: 0.1 },
      { time: 0.08, val: 0 }
    ]);
  }

  public playTick() {
    this.playTone(1000, 'triangle', 0.05, [
      { time: 0.002, val: 0.15 },
      { time: 0.05, val: 0 }
    ]);
  }

  public playCoin() {
    // Dual bell sound
    this.playTone(987.77, 'sine', 0.15, [
      { time: 0.005, val: 0.15 },
      { time: 0.15, val: 0 }
    ]);
    setTimeout(() => {
      this.playTone(1318.51, 'sine', 0.25, [
        { time: 0.005, val: 0.15 },
        { time: 0.25, val: 0 }
      ]);
    }, 50);
  }

  public playHammer() {
    // Wooden thud
    this.playTone(150, 'triangle', 0.15, [
      { time: 0.01, val: 0.4 },
      { time: 0.15, val: 0 }
    ]);
    setTimeout(() => {
      this.playTone(120, 'triangle', 0.1, [
        { time: 0.01, val: 0.2 },
        { time: 0.1, val: 0 }
      ]);
    }, 120);
  }

  public playCheer() {
    // Synthesize noise cheer
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const bufferSize = this.ctx.sampleRate * 1.5; // 1.5 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Populate with white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Filter noise to sound like crowd/stadium cheer
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 1.0);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.2);
    gainNode.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.8);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    noiseNode.start();
  }

  public playPop() {
    this.playTone(600, 'sine', 0.12, [
      { time: 0.01, val: 0.12 },
      { time: 0.04, val: 0.08 },
      { time: 0.12, val: 0 }
    ]);
  }

  public playVictory() {
    // Beautiful fanfare chords
    const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.8, [
          { time: 0.05, val: 0.1 },
          { time: 0.4, val: 0.08 },
          { time: 0.8, val: 0 }
        ]);
      }, idx * 100);
    });
  }

  public playWhistle() {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    // Play a realistic dual-oscillator whistle sound
    const playWhistleTone = (freq: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      // Pitch modulation LFO for the whistle pea rattle effect
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 35; // 35Hz modulation rate
      lfoGain.gain.value = 25; // 25Hz modulation depth
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.03);
      gainNode.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      
      lfo.start();
      osc.start();
      lfo.stop(this.ctx.currentTime + 0.3);
      osc.stop(this.ctx.currentTime + 0.3);
    };

    playWhistleTone(2050);
    playWhistleTone(2200);
    
    // Play a low stadium sub-drop/boom
    this.playTone(85, 'sine', 0.5, [
      { time: 0.01, val: 0.3 },
      { time: 0.15, val: 0.15 },
      { time: 0.5, val: 0 }
    ]);
  }

  public playOutbid() {
    // Quick two-tone warning
    this.playTone(440, 'triangle', 0.1, [
      { time: 0.005, val: 0.2 },
      { time: 0.1, val: 0 }
    ]);
    setTimeout(() => {
      this.playTone(330, 'triangle', 0.15, [
        { time: 0.005, val: 0.2 },
        { time: 0.15, val: 0 }
      ]);
    }, 80);
  }

  public playBoost() {
    // Cyber slide-up synth
    const frequencies = [600, 800, 1000, 1200];
    frequencies.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.15, [
          { time: 0.01, val: 0.1 },
          { time: 0.15, val: 0 }
        ]);
      }, idx * 50);
    });
  }

  public playTransfer() {
    // Quick swish followed by coin
    this.playTone(1500, 'sine', 0.1, [
      { time: 0.01, val: 0.05 },
      { time: 0.1, val: 0 }
    ]);
    setTimeout(() => {
      this.playCoin();
    }, 60);
  }

  public playButtonHover() {
    // Very quiet high-pitched tactile click
    this.playTone(1200, 'sine', 0.02, [
      { time: 0.001, val: 0.02 },
      { time: 0.02, val: 0 }
    ]);
  }
}

export const audio = new SoundManager();
