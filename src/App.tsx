import React, { useState, useEffect, useRef, useContext } from 'react';
import './App.css';
import { AudioSynth } from './AudioSynth';
import { AudioProvider, AudioContext } from './AudioContext';

interface SecurityLayer {
  name: string;
  difficulty: number;
  broken: boolean;
  animating?: 'hacking' | 'success' | 'failure' | null;
}

interface HackingCommand {
  name: string;
  power: number;
  cooldown: number;
  isAvailable: boolean;
  powerCost: number;
}

interface TutorialStep {
  message: string;
  highlight: string | null;
  requireClick?: boolean;
  checkCondition?: () => boolean;
}

interface GameMode {
  type: 'tutorial' | 'main';
  layers: number;
}

// Modify your AudioPlayer component to use the synthesizer
const AudioPlayer = ({ isPlaying, volume }: { isPlaying: boolean, volume: number }) => {
  const synthRef = useRef<AudioSynth | null>(null);

  useEffect(() => {
    synthRef.current = new AudioSynth();
    
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.start();
    } else {
      synthRef.current.stop();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setVolume(volume);
    }
  }, [volume]);

  return null; // No need for audio element anymore
};

// Separate AudioControls component
const AudioControls: React.FC<{
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
}> = ({ isPlaying, setIsPlaying, volume, setVolume }) => {
  const [showVolume, setShowVolume] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="audio-control-container">
      <div className="audio-controls-wrapper">
        <button 
          className={`audio-toggle ${isPlaying ? 'playing' : ''}`}
          onClick={() => setIsPlaying(!isPlaying)}
          onMouseEnter={() => setShowVolume(true)}
        >
          <div className="button-content">
            <span className="audio-icon">{isPlaying ? '⬛' : '▶'}</span>
            <span className="audio-label">SYNC_{isPlaying ? 'ACTIVE' : 'READY'}</span>
          </div>
        </button>

        <div 
          className={`volume-controls ${showVolume ? 'show' : ''}`}
          onMouseLeave={() => setShowVolume(false)}
        >
          <div className="volume-label">SIGNAL_STRENGTH</div>
          <input 
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="volume-slider"
          />
          <div className="volume-level">
            {Math.round(volume * 100).toString().padStart(3, '0')}%
          </div>
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const [gameState, setGameState] = useState<'start' | 'tutorial' | 'playing'>('start');
  const [securityLayers, setSecurityLayers] = useState<SecurityLayer[]>([
    { name: "Firewall", difficulty: 3, broken: false },
    { name: "Encryption", difficulty: 4, broken: false },
    { name: "Neural ICE", difficulty: 5, broken: false },
    { name: "Black ICE", difficulty: 7, broken: false },
  ]);

  const [playerPower, setPlayerPower] = useState({
    current: 10,
    max: 10,
    regenRate: 1
  });

  const [commands, setCommands] = useState<HackingCommand[]>([
    { name: "BYPASS.exe", power: 2, cooldown: 0, isAvailable: true, powerCost: 3 },
    { name: "CRYPTCRACK.exe", power: 3, cooldown: 1, isAvailable: true, powerCost: 4 },
    { name: "NEURAL_STORM.exe", power: 4, cooldown: 2, isAvailable: true, powerCost: 6 },
    { name: "ICE_BREAKER.exe", power: 5, cooldown: 3, isAvailable: true, powerCost: 8 },
  ]);

  const [logs, setLogs] = useState<string[]>([
    "> INITIATING HACK SEQUENCE...",
    "> CONNECTING TO MAINFRAME..."
  ]);

  const [traceLevel, setTraceLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [success, setSuccess] = useState(false);

  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialComplete, setTutorialComplete] = useState(false);

  const [showQuitDialog, setShowQuitDialog] = useState(false);

  const [gameMode, setGameMode] = useState<GameMode | null>(null);

  // Add audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioContext = useContext(AudioContext);

  // Save audio preferences to localStorage
  useEffect(() => {
    localStorage.setItem('audioPreferences', JSON.stringify({ isPlaying, volume }));
  }, [isPlaying, volume]);

  // Load audio preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('audioPreferences');
    if (savedPreferences) {
      const { isPlaying: savedIsPlaying, volume: savedVolume } = JSON.parse(savedPreferences);
      setIsPlaying(savedIsPlaying);
      setVolume(savedVolume);
    }
  }, []);

  useEffect(() => {
    console.log('Audio effect running, isPlaying:', isPlaying);
    console.log('audioContext available:', !!audioContext);

    if (audioContext) {
      try {
        if (isPlaying) {
          console.log('Attempting to start audio');
          audioContext.start();
          audioContext.setVolume(volume);
        } else {
          console.log('Attempting to stop audio');
          audioContext.stop();
        }
      } catch (error) {
        console.error('Audio operation failed:', error);
      }
    }
  }, [isPlaying, volume, audioContext]);

  const tutorialSteps: TutorialStep[] = [
    {
      message: "Welcome, Netrunner. Let's start with a basic hack.",
      highlight: null,
      requireClick: true
    },
    {
      message: "This is a security layer. Each layer has a difficulty level that you need to overcome.",
      highlight: ".security-layers",
      requireClick: true
    },
    {
      message: "Use your hacking commands to break through. Match the command's POWER with the layer's DIFFICULTY.",
      highlight: ".command-list",
      requireClick: true
    },
    {
      message: "Try using BYPASS.exe on the Training Firewall. Click the arrow button to execute.",
      highlight: ".command-row:first-child",
      checkCondition: () => securityLayers[0].broken
    }
  ];

  const handleTutorialNext = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
      setTutorialComplete(true);
    }
  };

  useEffect(() => {
    if (traceLevel >= 100) {
      setGameOver(true);
      setLogs(prev => [...prev, "> TRACE COMPLETE - CONNECTION TERMINATED"]);
    }

    if (securityLayers.every(layer => layer.broken)) {
      setSuccess(true);
      setGameOver(true);
      if (gameMode?.type === 'tutorial') {
        setLogs(prev => [
          ...prev, 
          "> TUTORIAL COMPLETE!",
          "> You're ready for the real thing.",
          "> Initializing main game..."
        ]);
        setTimeout(() => {
          initializeGame({ type: 'main', layers: 4 });
        }, 3000);
      } else {
        setLogs(prev => [...prev, "> HACK SUCCESSFUL - DATA ACQUIRED"]);
      }
    }
  }, [traceLevel, securityLayers, gameMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!gameOver) {
        setTraceLevel(prev => Math.min(prev + 2, 100));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCommands(prev => 
        prev.map(cmd => ({
          ...cmd,
          cooldown: Math.max(0, cmd.cooldown - 1),
          isAvailable: cmd.cooldown === 0
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!gameOver) {
        setPlayerPower(prev => ({
          ...prev,
          current: Math.min(prev.current + prev.regenRate, prev.max)
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  const executeCommand = (commandIndex: number, layerIndex: number) => {
    if (gameOver) return;
    
    const command = commands[commandIndex];
    const layer = securityLayers[layerIndex];

    if (playerPower.current < command.powerCost) {
      setLogs(prev => [...prev, `> ERROR: INSUFFICIENT POWER (${playerPower.current}/${command.powerCost})`]);
      return;
    }

    if (!command.isAvailable || layer.broken) return;

    // Set hacking animation
    setSecurityLayers(prev => 
      prev.map((l, i) => 
        i === layerIndex ? { ...l, animating: 'hacking' } : l
      )
    );

    // Simulate hack attempt duration
    setTimeout(() => {
      const success = command.power >= layer.difficulty;
      
      // Set success/failure animation
      setSecurityLayers(prev => 
        prev.map((l, i) => 
          i === layerIndex ? { 
            ...l, 
            animating: success ? 'success' : 'failure',
            broken: l.broken || success 
          } : l
        )
      );

      // Reset animation state after effects
      setTimeout(() => {
        setSecurityLayers(prev => 
          prev.map((l, i) => 
            i === layerIndex ? { ...l, animating: null } : l
          )
        );
      }, 1000);

      const newLogs = [
        `> EXECUTING ${command.name}...`,
        `> POWER CONSUMED: ${command.powerCost}`,
        success 
          ? `> ${layer.name} BREACHED!` 
          : `> BREACH FAILED - INSUFFICIENT POWER`
      ];

      setPlayerPower(prev => ({
        ...prev,
        current: prev.current - command.powerCost
      }));

      setLogs(prev => [...prev, ...newLogs]);
      
      setCommands(prev => 
        prev.map((c, i) => 
          i === commandIndex ? { ...c, cooldown: c.cooldown + 3, isAvailable: false } : c
        )
      );
    }, 1000);
  };

  // Add highlight positioning logic
  const highlightRef = useRef<HTMLDivElement>(null);

  const updateHighlight = () => {
    const highlight = highlightRef.current;
    if (!highlight || !showTutorial) return;
    
    const targetSelector = tutorialSteps[tutorialStep].highlight;
    if (!targetSelector) return;
    
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) return;
    
    const rect = targetElement.getBoundingClientRect();
    highlight.style.top = `${rect.top}px`;
    highlight.style.left = `${rect.left}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
  };

  // Update highlight position on window resize and tutorial step change
  useEffect(() => {
    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    
    const interval = setInterval(updateHighlight, 100);
    
    return () => {
      window.removeEventListener('resize', updateHighlight);
      clearInterval(interval);
    };
  }, [tutorialStep, showTutorial]);

  const startTutorial = () => {
    setGameState('tutorial');
    setShowTutorial(true);
    setTutorialStep(0);
  };

  const startGame = () => {
    setGameState('playing');
    setShowTutorial(false);
    setTutorialComplete(true);
  };

  const initializeGame = (mode: GameMode) => {
    const layers = mode.type === 'tutorial' ? [
      { name: "Training Firewall", difficulty: 2, broken: false }
    ] : [
      { name: "Firewall", difficulty: 3, broken: false },
      { name: "Encryption", difficulty: 4, broken: false },
      { name: "Neural ICE", difficulty: 5, broken: false },
      { name: "Black ICE", difficulty: 7, broken: false },
    ];

    setSecurityLayers(layers);
    setGameState('playing');
    setShowTutorial(mode.type === 'tutorial');
    setTutorialStep(0);
    setPlayerPower({ current: 10, max: 10, regenRate: 1 });
    setTraceLevel(0);
    setLogs(["> INITIATING HACK SEQUENCE...", "> CONNECTING TO MAINFRAME..."]);
    setGameOver(false);
    setSuccess(false);
    setGameMode(mode);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    console.log('Play button clicked');
    console.log('Audio context:', audioContext);
    setIsPlaying(!isPlaying);
  };

  const handleCommand = (commandName: string) => {
    console.log('Command executed:', commandName);
    
    if (audioContext) {
      audioContext.playHackEffect();
      console.log('Playing hack effect');
    } else {
      console.warn('AudioSynth not available');
    }
    
    // Your existing command logic here
  };

  useEffect(() => {
    console.log('Setting up target button listeners');
    
    // Add click listeners to all target buttons
    const targetButtons = document.querySelectorAll('.target-btn');
    console.log('Found target buttons:', targetButtons.length);

    const handleTargetClick = (e: Event) => {
      console.log('Target button clicked');
      console.log('AudioSynth available in click handler:', !!audioContext);
      
      if (!audioContext) {
        console.warn('No AudioSynth available');
        return;
      }

      // Just call the playHackEffect method directly
      audioContext.playHackEffect();
    };

    targetButtons.forEach(button => {
      button.addEventListener('click', handleTargetClick);
    });

    // Cleanup
    return () => {
      targetButtons.forEach(button => {
        button.removeEventListener('click', handleTargetClick);
      });
    };
  }, [audioContext]);

  return (
    <div className="App">
      {gameState === 'start' ? (
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
          <button className="start-button" onClick={() => setGameState('playing')}>
            START
          </button>
        </div>
      ) : (
        <>
          <div className="terminal-window">
            <div className="terminal-header">
              <span className="blink">[ARASAKA SECURITY BREACH IN PROGRESS]</span>
              <div className="system-info">
                <div className="status-bars">
                  <div className="status-bar">
                    <span>TRACE: {traceLevel}%</span>
                    <div className="progress-bar trace">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${traceLevel}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="status-bar">
                    <span>POWER: {playerPower.current}/{playerPower.max}</span>
                    <div className="progress-bar power">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(playerPower.current / playerPower.max) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                className="quit-to-menu-btn"
                onClick={() => setGameState('start')}
                title="Quit to Main Menu"
              >
                DISCONNECT
              </button>
            </div>

            <div className="terminal-content">
              <div className="security-layers">
                <h3>SECURITY LAYERS:</h3>
                {securityLayers.map((layer, i) => (
                  <div 
                    key={layer.name} 
                    className={`layer ${layer.broken ? 'broken' : ''} ${layer.animating ? layer.animating : ''}`}
                  >
                    {layer.name} [DIFFICULTY: {layer.difficulty}]
                    {layer.broken && ' [BREACHED]'}
                  </div>
                ))}
              </div>

              <div className="command-list">
                <h3>AVAILABLE COMMANDS:</h3>
                {commands.map((cmd, cmdIndex) => (
                  <div key={cmd.name} className="command-row">
                    <span 
                      className={`command ${!cmd.isAvailable || playerPower.current < cmd.powerCost ? 'cooldown' : ''}`}
                      onClick={() => handleCommand(cmd.name)}
                    >
                      {cmd.name} [PWR: {cmd.power}] [COST: {cmd.powerCost}]
                      {cmd.cooldown > 0 && ` [COOLDOWN: ${cmd.cooldown}s]`}
                    </span>
                    {cmd.isAvailable && !gameOver && playerPower.current >= cmd.powerCost && (
                      <div className="target-buttons">
                        {securityLayers.map((layer, layerIndex) => (
                          !layer.broken && (
                            <button
                              key={layer.name}
                              onClick={() => executeCommand(cmdIndex, layerIndex)}
                              className="target-btn"
                              title={`Attack ${layer.name}`}
                            >
                              ▶
                            </button>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="terminal-logs">
                {logs.map((log, i) => (
                  <p key={i} className="log-entry">{log}</p>
                ))}
              </div>

              {gameOver && (
                <div className={`game-over ${success ? 'success' : 'failure'}`}>
                  {success ? 'HACK SUCCESSFUL' : 'HACK FAILED'}
                  <button 
                    onClick={() => window.location.reload()} 
                    className="retry-btn"
                  >
                    RETRY
                  </button>
                </div>
              )}

              {tutorialComplete && (
                <button 
                  className="tutorial-restart-btn"
                  onClick={() => {
                    setShowTutorial(true);
                    setTutorialStep(0);
                  }}
                >
                  SHOW TUTORIAL
                </button>
              )}

              {gameMode?.type === 'tutorial' && (
                <div className="tutorial-indicator">
                  TRAINING MODE ACTIVE
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div 
        className="audio-controls" 
        style={{ 
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'rgba(0,0,0,0.5)',
          padding: '10px',
        }}
      >
        <button 
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={handlePlayClick}
          style={{ 
            cursor: 'pointer',
            padding: '10px 20px',
            fontSize: '20px',
            background: '#000',
            color: '#00ff00',
            border: '2px solid #00ff00',
            margin: '0',
            display: 'block',
          }}
        >
          {isPlaying ? '⬛' : '▶'}
        </button>
      </div>
    </div>
  );
}

// Separate root component that only handles AudioProvider
function App() {
  console.log('=== App Rendering ===');

  const audioContext = useContext(AudioContext);
  console.log('AudioContext available:', !!audioContext);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);

  // Add direct click handler to test event bubbling
  const handleClick = (e: React.MouseEvent) => {
    console.log('Div clicked');
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    console.log('Play button clicked');
    console.log('Audio context:', audioContext);
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    console.log('App mounted');
    console.log('AudioSynth available:', !!audioContext);

    // Add click listeners to all command elements
    const addCommandListeners = () => {
      const commands = document.querySelectorAll('.command');
      console.log('Found command elements:', commands.length);

      commands.forEach(cmd => {
        cmd.addEventListener('click', (e) => {
          console.log('Command clicked!');
          if (audioContext) {
            console.log('Playing hack effect');
            audioContext.playHackEffect();
          } else {
            console.log('No AudioSynth available');
          }
        });
      });
    };

    // Try immediately
    addCommandListeners();

    // Also try after a short delay to ensure DOM is loaded
    setTimeout(addCommandListeners, 1000);

    // Add test click handler to entire document
    document.addEventListener('click', (e) => {
      console.log('Document clicked at:', e.target);
    });

    // Debug log to check AudioContext on mount
    console.log('App mounted, AudioSynth available:', !!audioContext);
    if (audioContext) {
      console.log('AudioSynth methods:', Object.keys(audioContext));
    }

    const handleTargetClick = (e: Event) => {
      console.log('Target button clicked');
      console.log('AudioSynth available in click handler:', !!audioContext);
      
      if (!audioContext) {
        console.warn('No AudioSynth available');
        return;
      }

      // Just call the playHackEffect method directly
      audioContext.playHackEffect();
    };

    // Add click listeners to all target buttons
    const targetButtons = document.querySelectorAll('.target-btn');
    console.log('Found target buttons:', targetButtons.length);

    targetButtons.forEach(button => {
      button.addEventListener('click', handleTargetClick);
    });

    // Cleanup
    return () => {
      targetButtons.forEach(button => {
        button.removeEventListener('click', handleTargetClick);
      });
    };
  }, [audioContext]);

  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}

export default App; 