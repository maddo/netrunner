import { useContext } from 'react';
import { AudioContext } from '../AudioContext';

interface TargetProps {
  onClick: () => Promise<{ success: boolean }>;
  title: string;
  disabled: boolean;
  className?: string;
}

export const Target: React.FC<TargetProps> = ({ 
  onClick, 
  title, 
  disabled, 
  className = '' 
}) => {
  const audioSynth = useContext(AudioContext);

  const handleClick = async () => {
    console.log('Target clicked:', title);
    
    // Play sound first
    if (audioSynth) {
      console.log('Playing hack effect');
      await audioSynth.playHackEffect();
    } else {
      console.warn('No AudioSynth available');
    }

    // Then call the original onClick handler
    onClick();
  };

  return (
    <button
      className={`target-btn ${className}`}
      onClick={handleClick}
      disabled={disabled}
      title={title}
    >
      ▶
    </button>
  );
}; 