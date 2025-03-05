import { useContext, useEffect } from 'react';
import { AudioContext } from '../AudioContext';

export const StartScreen: React.FC = () => {
  const audio = useContext(AudioContext);

  useEffect(() => {
    // Play startup sequence when component mounts
    audio?.playStartupSequence();
  }, []);

  return (
    <div className="start-screen">
      <h1>NETRUNNER</h1>
      <h2>SECURITY BREACH v2.0.2.0</h2>
      <p>DIRECT SYSTEM ACCESS</p>
      <blockquote>
        "Breaking through ICE isn't about brute force...<br />
        it's about finding the right frequency of chaos."
      </blockquote>
      <p className="quote-author">- Anonymous Netrunner, 2020</p>
      <div className="music-icon">🎵</div>
    </div>
  );
}; 