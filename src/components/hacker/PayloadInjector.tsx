import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { $hackerCharCount, $hackerPhase, INJECTION_THRESHOLD, INJECTION_DURATION } from '@/store/hacker';
import { INJECTION_MESSAGES } from '@/constants/hackerData';

export const PayloadInjector: React.FC = () => {
  const charCount = useStore($hackerCharCount);
  const phase = useStore($hackerPhase);
  const [injectionProgress, setInjectionProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInitiate = useCallback(() => {
    if ($hackerPhase.get() === 'awaiting') {
      if ($hackerCharCount.get() < INJECTION_THRESHOLD) {
        $hackerCharCount.set(INJECTION_THRESHOLD);
      }
      $hackerPhase.set('injecting');
    }
  }, []);

  // Activate ONLY on press of Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleInitiate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInitiate]);

  // Handle injection animation
  useEffect(() => {
    if (phase === 'injecting') {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min((elapsed / INJECTION_DURATION) * 100, 100);
        setInjectionProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          $hackerPhase.set('transferring');
        }
      }, 100);
      return () => clearInterval(interval);
    } else if (phase === 'awaiting') {
      setInjectionProgress(0);
    }
  }, [phase]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [charCount, phase, injectionProgress]);

  const renderProgressBar = (progress: number, width: number = 20) => {
    const filledLength = Math.floor((progress / 100) * width);
    const emptyLength = width - filledLength;
    const bar = '='.repeat(Math.max(0, filledLength - 1)) + (filledLength > 0 && progress < 100 ? '>' : (progress === 100 ? '=' : ''));
    const empty = ' '.repeat(emptyLength);
    return `[${bar}${empty}] ${Math.floor(progress)}%`;
  };

  return (
    <div className="hacker-pane-body" ref={containerRef}>
      <pre className="hacker-terminal-text">
        {INJECTION_MESSAGES.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
        <br />
        {phase === 'awaiting' && (
          <>
            <div>{`[*] Code fragments received: ${charCount}/${INJECTION_THRESHOLD}`}</div>
            <div>{renderProgressBar(Math.min((charCount / INJECTION_THRESHOLD) * 100, 100))}</div>
            <br />
            {charCount >= INJECTION_THRESHOLD ? (
              <div
                className="hacker-alert hacker-blink"
                style={{ cursor: 'pointer' }}
                onClick={handleInitiate}
              >
                [!] BUFFER ARMED: Press [ENTER] to initiate payload injection
              </div>
            ) : (
              <div
                className="hacker-blink"
                style={{ cursor: 'pointer' }}
                onClick={handleInitiate}
              >
                [*] Press [ENTER] to initiate payload injection ...
              </div>
            )}
          </>
        )}
        {phase === 'injecting' && (
          <div className="hacker-alert">
            {`[*] INJECTING PAYLOAD ... ${renderProgressBar(injectionProgress)}`}
          </div>
        )}
        {(phase === 'transferring' || phase === 'complete') && (
          <div className="hacker-success">
            [+] PAYLOAD DELIVERED SUCCESSFULLY
          </div>
        )}
      </pre>
    </div>
  );
};

export default PayloadInjector;
