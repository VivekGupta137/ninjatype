import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { $hackerPhase, TRANSFER_DURATION } from '@/store/hacker';
import { TRANSFER_FILES } from '@/constants/hackerData';

export const FileTransfer: React.FC = () => {
  const phase = useStore($hackerPhase);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentFileProgress, setCurrentFileProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === 'transferring') {
      const fileDuration = TRANSFER_DURATION / TRANSFER_FILES.length;
      let startTime = Date.now();
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        let p = (elapsed / fileDuration) * 100;
        
        if (p >= 100) {
          setCurrentFileIndex(prev => {
            const next = prev + 1;
            if (next >= TRANSFER_FILES.length) {
              clearInterval(interval);
              $hackerPhase.set('complete');
              return prev;
            }
            return next;
          });
          setCurrentFileProgress(0);
          startTime = Date.now();
        } else {
          setCurrentFileProgress(p);
        }
      }, 50);
      
      return () => clearInterval(interval);
    } else if (phase === 'awaiting') {
      setCurrentFileIndex(0);
      setCurrentFileProgress(0);
    }
  }, [phase]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [phase, currentFileIndex, currentFileProgress]);

  const renderProgressBar = (progress: number, width: number = 15) => {
    const filledLength = Math.floor((progress / 100) * width);
    const emptyLength = width - filledLength;
    const bar = '='.repeat(Math.max(0, filledLength - 1)) + (filledLength > 0 && progress < 100 ? '>' : (progress === 100 ? '=' : ''));
    const empty = ' '.repeat(emptyLength);
    return `[${bar}${empty}]`;
  };

  if (phase === 'awaiting' || phase === 'injecting') {
    return (
      <div className="hacker-pane-body" ref={containerRef}>
        <pre className="hacker-terminal-text">
          <div className="hacker-blink">[*] Waiting for payload delivery ...</div>
        </pre>
      </div>
    );
  }

  return (
    <div className="hacker-pane-body" ref={containerRef}>
      <pre className="hacker-terminal-text">
        {TRANSFER_FILES.map((file, index) => {
          if (index < currentFileIndex || (phase === 'complete' && index === TRANSFER_FILES.length - 1)) {
            return (
              <div key={file.name} className="hacker-success">
                {`[+] ${file.name.padEnd(25, '.')} ${file.size} [DONE]`}
              </div>
            );
          }
          if (index === currentFileIndex && phase === 'transferring') {
            return (
              <div key={file.name} className="hacker-alert">
                {`[>] ${file.name.padEnd(25, '.')} ${renderProgressBar(currentFileProgress)} ${Math.floor(currentFileProgress)}% ${Math.floor(Math.random() * 500 + 100)}K/s`}
              </div>
            );
          }
          return (
            <div key={file.name} style={{ opacity: 0.5 }}>
              {`[ ] ${file.name.padEnd(25, '.')} ${file.size} [PENDING]`}
            </div>
          );
        })}
        {phase === 'complete' && (
          <>
            <br />
            <div className="hacker-success">
              [+] EXFILTRATION COMPLETE: 10 files, 2.3MB total
            </div>
          </>
        )}
      </pre>
    </div>
  );
};

export default FileTransfer;
