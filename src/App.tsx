import React, { useState, useEffect, useRef } from 'react';
import './App.css';

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

function App() {
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

  const tutorialSteps: TutorialStep[] = [
    {
      message: "Welcome, Netrunner. This tutorial will teach you how to hack the system.",
      highlight: null,
      requireClick: true
    },
    {
      message: "These are the security layers you need to breach. Each layer has a difficulty level.",
      highlight: ".security-layers",
      requireClick: true
    },
    {
      message: "Your hacking commands are listed here. Each command has a POWER level and POWER COST.",
      highlight: ".command-list",
      requireClick: true
    },
    {
      message: "Watch your POWER meter! Commands consume power, but it regenerates over time.",
      highlight: ".power",
      requireClick: true
    },
    {
      message: "The TRACE meter shows how close the system is to detecting you. Don't let it reach 100%!",
      highlight: ".trace",
      requireClick: true
    },
    {
      message: "Try using BYPASS.exe on the Firewall layer. Click the arrow button to execute.",
      highlight: ".command-row:first-child",
      checkCondition: () => securityLayers[0].broken
    },
    {
      message: "Great! Notice that the command is now on cooldown and power was consumed.",
      highlight: ".command-row:first-child",
      requireClick: true
    },
    {
      message: "Break through all security layers before the trace completes. Good luck, Netrunner!",
      highlight: null,
      requireClick: true
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
      setLogs(prev => [...prev, "> HACK SUCCESSFUL - DATA ACQUIRED"]);
    }
  }, [traceLevel, securityLayers]);

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

  return (
    <div className="App">
      <div className="crt-overlay"></div>
      <div className="scan-lines"></div>
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <div className="tutorial-header">
              <span className="tutorial-title">TUTORIAL</span>
              <button 
                className="tutorial-quit-btn"
                onClick={() => {
                  setShowTutorial(false);
                  setTutorialComplete(true);
                }}
                title="Skip Tutorial"
              >
                ✕
              </button>
            </div>
            <div className="tutorial-message">
              {tutorialSteps[tutorialStep].message}
            </div>
            {tutorialSteps[tutorialStep].requireClick && (
              <button 
                className="tutorial-next-btn"
                onClick={handleTutorialNext}
              >
                CONTINUE
              </button>
            )}
          </div>
          {tutorialSteps[tutorialStep].highlight && (
            <div 
              ref={highlightRef}
              className="tutorial-highlight"
            ></div>
          )}
        </div>
      )}
      
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
        </div>
      </div>
    </div>
  );
}

export default App; 