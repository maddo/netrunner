import { createContext, useState } from 'react';
import { AudioSynth } from './AudioSynth';

export const AudioContext = createContext<AudioSynth | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [synth] = useState(() => new AudioSynth());

  return (
    <AudioContext.Provider value={synth}>
      {children}
    </AudioContext.Provider>
  );
} 