import { useContext } from 'react';
import { AudioContext } from '../AudioContext'; // We'll create this

interface HackButtonProps {
  onClick: () => void;
  // ... other props
}

export function HackButton({ onClick, ...props }: HackButtonProps) {
  const audio = useContext(AudioContext);

  const handleClick = () => {
    // Play the hack effect sound
    audio?.playHackEffect();
    // Call the original onClick handler
    onClick();
  };

  return (
    <button 
      onClick={handleClick}
      {...props}
    >
      {/* Your button content */}
    </button>
  );
} 