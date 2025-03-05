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
  const audio = useContext(AudioContext);
  console.log('Target rendered, audio available:', !!audio); // Debug audio context

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Target button clicked:', title);
    console.log('Audio context available:', !!audio);

    if (!audio) {
      console.error('No audio context available for sound effects');
      return;
    }

    try {
      // Play hack sound immediately
      console.log('Attempting to play hack effect...');
      await audio.playHackEffect();
      console.log('Hack effect played');

      // Call the original onClick handler
      console.log('Calling original onClick...');
      const result = await onClick();
      console.log('Hack result:', result);

      if (result?.success) {
        console.log('Playing success effect...');
        await audio.playSuccessEffect();
      } else {
        console.log('Playing fail effect...');
        await audio.playFailEffect();
      }
    } catch (error) {
      console.error('Error during hack attempt:', error);
      audio.playFailEffect();
    }
  };

  return (
    <button
      className={`target-btn ${className}`}
      onClick={handleClick}
      disabled={disabled}
      title={title}
      onMouseDown={() => console.log('Button mouse down')} // Extra debug
      onMouseUp={() => console.log('Button mouse up')} // Extra debug
    >
      {title}
    </button>
  );
}; 