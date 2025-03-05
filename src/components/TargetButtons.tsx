import { useContext } from 'react';
import { AudioContext } from '../AudioContext';

interface TargetButtonsProps {
  onAttackFirewall: () => Promise<{ success: boolean }>;
  onAttackNeuralIce: () => Promise<{ success: boolean }>;
  onAttackBlackIce: () => Promise<{ success: boolean }>;
}

export const TargetButtons: React.FC<TargetButtonsProps> = ({
  onAttackFirewall,
  onAttackNeuralIce,
  onAttackBlackIce
}) => {
  const audio = useContext(AudioContext);

  const handleAttack = async (
    attackFn: () => Promise<{ success: boolean }>,
    target: string
  ) => {
    console.log(`Attacking ${target}`);
    
    // Play hack sound immediately
    if (audio) {
      await audio.playHackEffect();
    }

    try {
      const result = await attackFn();
      if (result.success) {
        audio?.playSuccessEffect();
      } else {
        audio?.playFailEffect();
      }
    } catch (error) {
      console.error(`Error attacking ${target}:`, error);
      audio?.playFailEffect();
    }
  };

  return (
    <div className="target-buttons">
      <button 
        className="target-btn" 
        title="Attack Firewall"
        onClick={() => handleAttack(onAttackFirewall, 'Firewall')}
      >
        ▶
      </button>
      <button 
        className="target-btn" 
        title="Attack Neural ICE"
        onClick={() => handleAttack(onAttackNeuralIce, 'Neural ICE')}
      >
        ▶
      </button>
      <button 
        className="target-btn" 
        title="Attack Black ICE"
        onClick={() => handleAttack(onAttackBlackIce, 'Black ICE')}
      >
        ▶
      </button>
    </div>
  );
}; 