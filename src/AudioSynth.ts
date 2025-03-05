export class AudioSynth {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private isPlaying: boolean = false;
  private interval: number | null = null;

  constructor() {
    console.log('Creating new AudioSynth instance');
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    console.log('AudioContext created, state:', this.audioContext.state);
  }

  private async init() {
    if (this.audioContext.state !== 'running') {
      console.log('Resuming audio context...');
      await this.audioContext.resume();
    }
    console.log('Audio context state:', this.audioContext.state);
  }

  public async start() {
    console.log('Start called');
    if (this.isPlaying) {
      console.log('Already playing, returning');
      return;
    }
    
    await this.init();
    if (this.audioContext.state !== 'running') {
      console.error('Failed to initialize audio context');
      return;
    }

    console.log('Starting playback...');
    this.isPlaying = true;
    
    // Clear any existing interval
    if (this.interval) {
      clearInterval(this.interval);
    }

    // Start playing immediately
    this.playDarkArpeggio(this.audioContext.currentTime);
    
    // Schedule next beats
    const beatInterval = 4000; // 4 seconds per progression
    this.interval = window.setInterval(() => {
      if (this.isPlaying && this.audioContext) {
        this.playDarkArpeggio(this.audioContext.currentTime);
      }
    }, beatInterval);
  }

  private playDarkArpeggio(time: number) {
    if (!this.audioContext || !this.gainNode) {
      console.error('Cannot play: audio context or gain node not initialized');
      return;
    }

    console.log('Playing arpeggio at time:', time);
    const frequencies = [
      110.00,  // A2 (bass)
      220.00,  // A3
      261.63,  // C4
      329.63,  // E4
    ];

    frequencies.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      osc.type = i === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, time + i * 0.2);
      gainNode.gain.linearRampToValueAtTime(0.2, time + i * 0.2 + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + i * 0.2 + 0.8);

      osc.connect(gainNode);
      gainNode.connect(this.gainNode);

      osc.start(time + i * 0.2);
      osc.stop(time + i * 0.2 + 1);
    });
  }

  public stop() {
    console.log('Stop called');
    this.isPlaying = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  private createDrumSound(frequency: number, decay: number, time: number) {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);

    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(1, time + decay);
    
    gainNode.gain.setValueAtTime(0.3, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + decay);

    oscillator.start(time);
    oscillator.stop(time + decay);
  }

  private createSynthNote(frequency: number, time: number, duration: number, type: OscillatorType) {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    filter.Q.value = 10;

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.gainNode);

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.3, time + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration - 0.1);

    oscillator.start(time);
    oscillator.stop(time + duration);
  }

  async playHackEffect() {
    try {
      // Ensure audio context is running
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const startTime = this.audioContext.currentTime;
      
      // Create oscillators for a more complex sound
      const osc1 = this.audioContext.createOscillator();
      const osc2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Configure oscillators
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      
      // Set frequencies
      osc1.frequency.setValueAtTime(880, startTime);
      osc1.frequency.exponentialRampToValueAtTime(220, startTime + 0.1);
      
      osc2.frequency.setValueAtTime(440, startTime);
      osc2.frequency.exponentialRampToValueAtTime(110, startTime + 0.1);

      // Configure gain envelope
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      // Connect everything
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.gainNode);

      // Start and stop the sound
      osc1.start(startTime);
      osc2.start(startTime);
      
      osc1.stop(startTime + 0.1);
      osc2.stop(startTime + 0.1);

      console.log('Hack effect played');
    } catch (error) {
      console.error('Error playing hack effect:', error);
    }
  }

  public playSuccessEffect() {
    if (this.audioContext.state !== 'running') this.init();
    if (!this.audioContext || !this.gainNode) return;

    const time = this.audioContext.currentTime;
    
    // Success chord
    const frequencies = [440, 554.37, 659.25]; // A4, C#5, E5
    frequencies.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
      
      osc.connect(gain);
      gain.connect(this.gainNode);
      
      osc.start(time + i * 0.05);
      osc.stop(time + 0.3);
    });
  }

  public playFailEffect() {
    if (this.audioContext.state !== 'running') this.init();
    if (!this.audioContext || !this.gainNode) return;

    const time = this.audioContext.currentTime;
    
    // Error buzz
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, time);
    
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
    osc.connect(gain);
    gain.connect(this.gainNode);
    
    osc.start(time);
    osc.stop(time + 0.2);
  }

  public playStartupSequence() {
    if (this.audioContext.state !== 'running') this.init();
    if (!this.audioContext) return;

    const time = this.audioContext.currentTime;
    
    // Startup sound sequence
    const frequencies = [
      220,  // A3 - low startup tone
      440,  // A4 - system ready
      880,  // A5 - high confirmation
      587.33, // D5 - resolve
    ];

    // Create a lowpass filter for the cyberpunk feel
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, time);
    filter.Q.setValueAtTime(5, time);

    frequencies.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      // Alternate between sawtooth and square for that retro computer feel
      osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(freq, time + i * 0.15);
      
      // Create a sweeping effect
      gain.gain.setValueAtTime(0, time + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.2, time + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.15 + 0.3);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.gainNode || this.audioContext!.destination);
      
      osc.start(time + i * 0.15);
      osc.stop(time + i * 0.15 + 0.3);
    });

    // Add a low atmospheric sweep
    const sweepOsc = this.audioContext.createOscillator();
    const sweepGain = this.audioContext.createGain();
    
    sweepOsc.type = 'sine';
    sweepOsc.frequency.setValueAtTime(80, time + 0.6);
    sweepOsc.frequency.exponentialRampToValueAtTime(160, time + 1.2);
    
    sweepGain.gain.setValueAtTime(0.15, time + 0.6);
    sweepGain.gain.exponentialRampToValueAtTime(0.01, time + 1.2);
    
    sweepOsc.connect(sweepGain);
    sweepGain.connect(this.gainNode || this.audioContext.destination);
    
    sweepOsc.start(time + 0.6);
    sweepOsc.stop(time + 1.2);
  }
} 