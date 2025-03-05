import { useContext } from 'react';
import { AudioContext } from '../AudioContext';

export function CommandList() {
  const audioSynth = useContext(AudioContext);

  const handleCommand = (commandName: string) => {
    console.log('Command clicked:', commandName);
    
    // Play the hack sound immediately
    audioSynth?.playHackEffect();
    
    // Your existing command logic here
    // When the command succeeds:
    // audioSynth?.playSuccessEffect();
    // If it fails:
    // audioSynth?.playFailureEffect();
  };

  const commands = [
    { name: 'BYPASS.exe', power: 2, cost: 3 },
    { name: 'CRYPTCRACK.exe', power: 3, cost: 4 },
    { name: 'NEURAL_STORM.exe', power: 4, cost: 6 },
    { name: 'ICE_BREAKER.exe', power: 5, cost: 8 }
  ];

  return (
    <div className="command-list">
      <h3>AVAILABLE COMMANDS:</h3>
      {commands.map(cmd => (
        <div key={cmd.name} className="command-row">
          <span 
            className="command"
            onClick={() => handleCommand(cmd.name)}
            style={{
              cursor: 'pointer',
              padding: '5px 10px',
              margin: '2px 0',
              display: 'inline-block',
              transition: 'all 0.2s ease'
            }}
          >
            {cmd.name} [PWR: {cmd.power}] [COST: {cmd.cost}]
          </span>
        </div>
      ))}
    </div>
  );
} 