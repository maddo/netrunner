import { useContext } from 'react';
import { AudioContext } from '../AudioContext';

interface HackButtonProps {
  onClick: () => Promise<{ success: boolean }>;
  disabled?: boolean;
  completed?: boolean;
  className?: string;
}

export const HackButton: React.FC<HackButtonProps> = ({ 
  onClick, 
  disabled = false, 
  completed = false,
  className = '' 
}) => {
  const audio = useContext(AudioContext);
  console.log('HackButton rendered, audio available:', !!audio); // Debug log

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Hack button clicked'); // Debug log

    if (!audio) {
      console.error('No audio context available');
      return;
    }

    try {
      // Play initial hack sound
      console.log('Playing hack sound');
      await audio.playHackEffect();

      // Perform the hack
      const result = await onClick();
      
      // Play result sound
      if (result.success) {
        console.log('Playing success sound');
        await audio.playSuccessEffect();
      } else {
        console.log('Playing fail sound');
        await audio.playFailEffect();
      }
    } catch (error) {
      console.error('Error during hack:', error);
      audio.playFailEffect();
    }
  };

  return (
    <button 
      className={`hack-button ${className} ${completed ? 'completed' : ''}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {completed ? '[ BREACHED ]' : '[ >_HACK ]'}
    </button>
  );
}; 