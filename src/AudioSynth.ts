export class AudioSynth {
  private audioContext: AudioContext | null = null;
  private mainGainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private interval: number | null = null;
  private currentBeat: number = 0;
  private bpm: number = 70; // Slow tempo

  constructor() {
    this.init();
  }

  private init() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.mainGainNode = this.audioContext.createGain();
      this.mainGainNode.connect(this.audioContext.destination);
      this.mainGainNode.gain.value = 0.3;
    }
  }

  private createDrumSound(frequency: number, decay: number, time: number) {
    if (!this.audioContext || !this.mainGainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.mainGainNode);

    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(1, time + decay);
    
    gainNode.gain.setValueAtTime(0.3, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + decay);

    oscillator.start(time);
    oscillator.stop(time + decay);
  }

  private createSynthNote(frequency: number, time: number, duration: number, type: OscillatorType) {
    if (!this.audioContext || !this.mainGainNode) return;

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
    gainNode.connect(this.mainGainNode);

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.3, time + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration - 0.1);

    oscillator.start(time);
    oscillator.stop(time + duration);
  }

  private playBeat(time: number) {
    if (!this.audioContext) return;
    
    const measureLength = 60 / this.bpm * 4;
    const beatTime = time + (this.currentBeat * measureLength / 4);

    // 16-measure sequence
    const sequence = this.currentBeat % 64; // 16 measures * 4 beats

    // Kick drum pattern (every 2 beats)
    if (sequence % 8 === 0) {
      this.createDrumSound(60, 0.3, beatTime);
    }

    // Snare (on 2 and 4)
    if (sequence % 8 === 4) {
      this.createDrumSound(200, 0.2, beatTime);
    }

    // Hi-hat pattern
    if (sequence % 2 === 0) {
      this.createDrumSound(1000, 0.1, beatTime);
    }

    // Bass line
    const bassNotes = [
      36, 36, 41, 43,  // Measure 1-4
      36, 36, 41, 38,  // Measure 5-8
      36, 36, 41, 43,  // Measure 9-12
      36, 34, 33, 31   // Measure 13-16
    ];
    
    if (sequence % 4 === 0) {
      const bassFreq = 440 * Math.pow(2, (bassNotes[Math.floor(sequence / 4)] - 69) / 12);
      this.createSynthNote(bassFreq, beatTime, measureLength, 'sawtooth');
    }

    // Pad chords
    const padNotes = [
      [48, 51, 55], // Am
      [48, 51, 55], // Am
      [53, 56, 60], // Dm
      [55, 58, 62], // Em
    ];
    
    if (sequence % 16 === 0) {
      const chordIndex = (Math.floor(sequence / 16) % padNotes.length);
      padNotes[chordIndex].forEach(note => {
        const freq = 440 * Math.pow(2, (note - 69) / 12);
        this.createSynthNote(freq, beatTime, measureLength * 4, 'triangle');
      });
    }

    // Atmospheric high notes
    if (sequence % 32 === 0) {
      const highNote = 440 * Math.pow(2, (72 - 69) / 12);
      this.createSynthNote(highNote, beatTime, measureLength * 8, 'sine');
    }

    this.currentBeat = (this.currentBeat + 1) % 64;
  }

  public start() {
    if (this.isPlaying) return;
    
    this.init();
    this.isPlaying = true;
    this.currentBeat = 0;

    if (this.audioContext) {
      this.audioContext.resume();
      
      const beatInterval = (60 / this.bpm) * 1000; // Convert BPM to milliseconds
      
      // Start the first beat immediately
      this.playBeat(this.audioContext.currentTime);
      
      // Schedule subsequent beats with looping
      this.interval = window.setInterval(() => {
        if (this.isPlaying && this.audioContext) {
          this.playBeat(this.audioContext.currentTime);
          // Reset currentBeat when reaching the end of the sequence
          this.currentBeat = (this.currentBeat + 1) % 16; // Assuming 16-measure sequence
        }
      }, beatInterval);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.currentBeat = 0;
  }

  public setVolume(volume: number) {
    if (this.mainGainNode) {
      this.mainGainNode.gain.value = volume;
    }
  }
} 