import { useContext } from 'react';
import { AudioContext } from '../AudioContext';

interface SecurityLayerProps {
  onHack: () => Promise<{ success: boolean }>;
  difficulty: number;
  className?: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

export const SecurityLayer: React.FC<SecurityLayerProps> = ({ 
  onHack, 
  difficulty, 
  className = '',
  isActive = false,
  isCompleted = false
}) => {
  const audio = useContext(AudioContext);
  console.log('SecurityLayer mounted, audio available:', !!audio);

  // Simple test click handler
  const testClick = () => {
    console.log('Button clicked!');
    alert('Button clicked!'); // This will be very visible
  };

  const handleHackAttempt = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Hack button clicked!');

    if (!audio) {
      console.error('No audio context available');
      return;
    }

    try {
      // Play the hack sound immediately
      console.log('Playing hack sound...');
      await audio.playHackEffect();

      // Then do the hack attempt
      console.log('Attempting hack...');
      const result = await onHack();
      
      if (result.success) {
        console.log('Hack successful!');
        await audio.playSuccessEffect();
      } else {
        console.log('Hack failed!');
        await audio.playFailEffect();
      }
    } catch (error) {
      console.error('Error during hack:', error);
    }
  };

  return (
    <div className={`security-layer ${className} ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
      <div className="security-content">
        <div className="difficulty">LEVEL {difficulty}</div>
        <button 
          className="hack-button"
          onClick={testClick}  // Test handler
          disabled={!isActive || isCompleted}
        >
          {isCompleted ? '[ BREACHED ]' : '[ >_HACK ]'}
        </button>
      </div>
    </div>
  );
}; 