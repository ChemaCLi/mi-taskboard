// Audio service using Web Audio API
class AudioService {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private isInitialized = false;
  private volume = 0.5; // Default volume (0.0 to 1.0)
  private isMuted = false;

  // Pomodoro audio file paths
  private pomodoroSounds = {
    workStart: '/audio/pomodoro/work-start.wav',
    workEnd: '/audio/pomodoro/work-end.wav',
    breakStart: '/audio/pomodoro/break-start.wav',
    breakEnd: '/audio/pomodoro/break-end.wav',
    cycleComplete: '/audio/pomodoro/cycle-complete.wav'
  };

  /**
   * Initialize the audio context (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create audio context (requires user interaction)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Preload all Pomodoro sounds
      await this.preloadPomodoroSounds();
      
      this.isInitialized = true;
      console.log('🎵 Audio service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize audio service:', error);
    }
  }

  /**
   * Preload all Pomodoro audio files
   */
  private async preloadPomodoroSounds(): Promise<void> {
    const loadPromises = Object.entries(this.pomodoroSounds).map(async ([key, path]) => {
      try {
        const buffer = await this.loadAudioFile(path);
        this.audioBuffers.set(key, buffer);
        console.log(`✅ Loaded audio: ${key}`);
      } catch (error) {
        console.error(`❌ Failed to load audio ${key}:`, error);
      }
    });

    await Promise.all(loadPromises);
  }

  /**
   * Load an audio file and return an AudioBuffer
   */
  private async loadAudioFile(path: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load audio file: ${path}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  /**
   * Play a sound by name
   */
  playSound(soundName: keyof typeof this.pomodoroSounds): void {
    if (!this.isInitialized || this.isMuted) return;

    const buffer = this.audioBuffers.get(soundName);
    if (!buffer) {
      console.warn(`Audio buffer not found for: ${soundName}`);
      return;
    }

    if (!this.audioContext) {
      console.warn('Audio context not available');
      return;
    }

    try {
      // Create source node
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.volume;

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Play the sound
      source.start(0);
      console.log(`🎵 Playing sound: ${soundName}`);
    } catch (error) {
      console.error(`❌ Failed to play sound ${soundName}:`, error);
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 Volume set to: ${this.volume}`);
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Mute/unmute audio
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    console.log(`🔇 Audio ${muted ? 'muted' : 'unmuted'}`);
  }

  /**
   * Check if audio is muted
   */
  isAudioMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Check if audio service is initialized
   */
  isAudioInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Resume audio context (needed after browser suspends it)
   */
  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('🎵 Audio context resumed');
    }
  }

  /**
   * Get loading status of audio files
   */
  getLoadingStatus(): { loaded: string[], total: number } {
    const loaded = Array.from(this.audioBuffers.keys());
    const total = Object.keys(this.pomodoroSounds).length;
    return { loaded, total };
  }
}

// Create singleton instance
export const audioService = new AudioService();

// Export types for use in components
export type PomodoroSound = keyof typeof audioService['pomodoroSounds']; 