export const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
  if (typeof window === 'undefined') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
};

export const playSpinSound = () => {
  const notes = [262, 294, 330, 349, 392, 440, 494, 523];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playSound(freq, 0.1, 'square', 0.15);
    }, idx * 400);
  });
};

export const playWinSound = () => {
  playSound(523, 0.15, 'sine', 0.3);
  setTimeout(() => playSound(659, 0.15, 'sine', 0.3), 100);
  setTimeout(() => playSound(784, 0.3, 'sine', 0.3), 200);
};

export const playClickSound = () => {
  playSound(800, 0.05, 'square', 0.1);
};

export const playButtonSound = () => {
  playSound(600, 0.08, 'sine', 0.12);
};

export const playSuccessSound = () => {
  playSound(523, 0.15, 'sine', 0.2);
  setTimeout(() => playSound(659, 0.2, 'sine', 0.15), 100);
};

export const playErrorSound = () => {
  playSound(200, 0.2, 'sawtooth', 0.15);
};