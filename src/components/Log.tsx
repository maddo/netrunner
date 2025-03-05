import { useEffect, useRef } from 'react';

export const Log: React.FC<{ messages: string[] }> = ({ messages }) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={logRef} 
      className="log-container"
    >
      {messages.map((message, index) => (
        <div key={index} className="log-message">
          {message}
        </div>
      ))}
    </div>
  );
}; 