import { createContext, useState, useRef } from 'react';
import { AudioSynth } from './AudioSynth';

export const AudioContext = createContext<AudioSynth | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const synthRef = useRef<AudioSynth | null>(null);
  
  if (!synthRef.current) {
    console.log('Creating new AudioSynth instance');
    synthRef.current = new AudioSynth();
  }

  return (
    <AudioContext.Provider value={synthRef.current}>
      {children}
    </AudioContext.Provider>
  );
} 