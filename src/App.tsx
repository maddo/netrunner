import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { AudioSynth } from './AudioSynth';
import { AudioProvider } from './AudioContext';

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

function App() {
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
  const [volume, setVolume] = useState(0.3);
  const synthRef = useRef<AudioSynth | null>(null);

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
    synthRef.current = new AudioSynth();
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      if (isPlaying) {
        synthRef.current.start();
      } else {
        synthRef.current.stop();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setVolume(volume);
    }
  }, [volume]);

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

  // Add start screen component
  const StartScreen = () => (
    <div className="start-screen">
      <div className="title-container">
        <div className="glitch-container">
          <h1 className="game-title glitch" data-text="NETRUNNER">NETRUNNER</h1>
        </div>
        <div className="subtitle">SECURITY BREACH v2.0.2.0</div>
      </div>
      
      <div className="menu-container">
        <button 
          className="start-button tutorial"
          onClick={() => initializeGame({ type: 'tutorial', layers: 1 })}
        >
          <span className="button-text">START TRAINING SEQUENCE</span>
          <span className="button-glitch"></span>
        </button>
        
        <button 
          className="start-button main"
          onClick={() => initializeGame({ type: 'main', layers: 4 })}
        >
          <span className="button-text">DIRECT SYSTEM ACCESS</span>
          <span className="button-glitch"></span>
        </button>
      </div>

      <div className="flavor-text">
        <p>"Breaking through ICE isn't about brute force...</p>
        <p>it's about finding the right frequency of chaos."</p>
        <p className="author">- Anonymous Netrunner, 2020</p>
      </div>
    </div>
  );

  // Add quit handlers
  const handleQuitClick = () => {
    setShowQuitDialog(true);
  };

  const handleQuitConfirm = () => {
    setGameState('start');
    setShowQuitDialog(false);
    setGameMode(null);
    // Reset game state
    setSecurityLayers([
      { name: "Firewall", difficulty: 3, broken: false },
      { name: "Encryption", difficulty: 4, broken: false },
      { name: "Neural ICE", difficulty: 5, broken: false },
      { name: "Black ICE", difficulty: 7, broken: false },
    ]);
    setPlayerPower({ current: 10, max: 10, regenRate: 1 });
    setTraceLevel(0);
    setLogs(["> INITIATING HACK SEQUENCE...", "> CONNECTING TO MAINFRAME..."]);
    setGameOver(false);
    setSuccess(false);
  };

  const handleQuitCancel = () => {
    setShowQuitDialog(false);
  };

  // Add QuitDialog component
  const QuitDialog = () => (
    <div className="quit-dialog-overlay">
      <div className="quit-dialog">
        <div className="quit-dialog-header">
          WARNING: DISCONNECT IMMINENT
        </div>
        <div className="quit-dialog-content">
          All progress will be lost. Confirm disconnect?
        </div>
        <div className="quit-dialog-buttons">
          <button 
            className="quit-btn confirm"
            onClick={handleQuitConfirm}
          >
            CONFIRM
          </button>
          <button 
            className="quit-btn cancel"
            onClick={handleQuitCancel}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );

  const togglePlay = () => {
    if (!synthRef.current) return;
    
    if (isPlaying) {
      synthRef.current.stop();
    } else {
      synthRef.current.start();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (synthRef.current) {
      synthRef.current.setVolume(newVolume);
    }
  };

  return (
    <AudioProvider>
      <div className="App">
        <AudioPlayer isPlaying={isPlaying} volume={volume} />
        <div className="crt-overlay"></div>
        <div className="scan-lines"></div>
        
        {gameState === 'start' ? (
          <StartScreen />
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
                  onClick={handleQuitClick}
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
                      <span className={`command ${!cmd.isAvailable || playerPower.current < cmd.powerCost ? 'cooldown' : ''}`}>
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
            {showQuitDialog && <QuitDialog />}
          </>
        )}

        <div className="audio-controls">
          <button 
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? 'Stop Music' : 'Play Music'}
          >
            {isPlaying ? '��' : '🎵'}
          </button>
          {isPlaying && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          )}
        </div>
      </div>
    </AudioProvider>
  );
}

export default App; 