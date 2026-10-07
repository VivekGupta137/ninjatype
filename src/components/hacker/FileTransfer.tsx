import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  $hackerPhase,
  $hackerTarget,
  $hackerTargetVersion,
  $hackerInjectionProgress,
  TRANSFER_DURATION,
} from '@/store/hacker';
import { TRANSFER_FILES } from '@/constants/hackerData';

export const FileTransfer: React.FC = () => {
  const phase = useStore($hackerPhase);
  const target = useStore($hackerTarget);
  const targetVersion = useStore($hackerTargetVersion);
  const injectionProgress = useStore($hackerInjectionProgress);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentFileProgress, setCurrentFileProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-arm file transfer whenever the target is updated
  useEffect(() => {
    setCurrentFileIndex(0);
    setCurrentFileProgress(0);
  }, [targetVersion]);

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
  }, [phase, currentFileIndex, currentFileProgress, targetVersion, injectionProgress]);

  const renderProgressBar = (progress: number, width: number = 18) => {
    const filledLength = Math.floor((progress / 100) * width);
    const emptyLength = Math.max(0, width - filledLength);
    const bar = '='.repeat(Math.max(0, filledLength - 1)) + (filledLength > 0 && progress < 100 ? '>' : (progress === 100 ? '=' : ''));
    const empty = ' '.repeat(emptyLength);
    return `[${bar}${empty}]`;
  };

  if (phase === 'awaiting') {
    return (
      <div className="hacker-pane-body" ref={containerRef}>
        <pre className="hacker-terminal-text">
          <div className="hacker-highlight">{`[>] TARGET LOCKED: ${target.ip} [${target.name}]`}</div>
          <div>{`[*] Exfiltration root: /var/ninja/exfil/${target.ip}/`}</div>
          <div>{`[*] Remote ports listening: ${target.ports}`}</div>
          <br />
          <div className="hacker-blink">[*] Standby: Awaiting payload initiation in PANE: PAYLOAD ...</div>
          <div style={{ opacity: 0.5, marginTop: 4 }}>
            [Press ENTER in editor to initiate payload sequence]
          </div>
          <br />
          <div style={{ opacity: 0.4 }}>
            {TRANSFER_FILES.map((file) => (
              <div key={file.name}>
                {`[   ] ${file.name.padEnd(25, '.')} ${file.size} [STANDBY]`}
              </div>
            ))}
          </div>
        </pre>
      </div>
    );
  }

  if (phase === 'injecting') {
    const primedCount = Math.min(
      TRANSFER_FILES.length,
      Math.floor((injectionProgress / 100) * (TRANSFER_FILES.length + 1))
    );

    return (
      <div className="hacker-pane-body" ref={containerRef}>
        <pre className="hacker-terminal-text">
          <div className="hacker-highlight">{`[>] TARGET LOCKED: ${target.ip} [${target.name}]`}</div>
          <div>{`[*] Exfiltration root: /var/ninja/exfil/${target.ip}/`}</div>
          <div>{`[*] Remote ports listening: ${target.ports}`}</div>
          <br />
          <div className="hacker-alert">
            <div>{`[>] PIPELINE SYNC // PANE: INJECTOR`}</div>
            <div>{`    PAYLOAD STAGE: ${renderProgressBar(injectionProgress, 20)} ${Math.floor(injectionProgress)}%`}</div>
          </div>
          <div style={{ opacity: 0.85, marginTop: 4 }}>
            {injectionProgress < 35 && `[*] Handshaking socket: tun0 -> gw(192.168.10.103) -> ${target.ip}:${target.ports} [SYN]`}
            {injectionProgress >= 35 && injectionProgress < 75 && `[*] Bypassing remote iptables & staging exfiltration ring buffer...`}
            {injectionProgress >= 75 && `[*] Stream handoff active: Priming target file descriptors (${primedCount}/${TRANSFER_FILES.length})...`}
          </div>
          <br />
          {TRANSFER_FILES.map((file, idx) => {
            const isStaged = idx < primedCount;
            return (
              <div
                key={file.name}
                className={isStaged ? "hacker-highlight" : ""}
                style={{ opacity: isStaged ? 0.95 : 0.4 }}
              >
                {`[${isStaged ? 'ARM' : '   '}] ${file.name.padEnd(25, '.')} ${file.size} [${isStaged ? 'STAGED' : 'QUEUED'}]`}
              </div>
            );
          })}
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
