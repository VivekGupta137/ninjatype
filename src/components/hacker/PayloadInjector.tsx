import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import {
  $hackerCharCount,
  $hackerPhase,
  $hackerTarget,
  $hackerTargetVersion,
  $hackerFinalMessageConfig,
  $hackerFinalMessageVisible,
  $hackerSettingsOpen,
  $hackerInjectionProgress,
  initiatePayloadInjection,
  INJECTION_THRESHOLD,
  INJECTION_DURATION,
} from '@/store/hacker';
import { INJECTION_MESSAGES } from '@/constants/hackerData';

export const PayloadInjector: React.FC = () => {
  const charCount = useStore($hackerCharCount);
  const phase = useStore($hackerPhase);
  const target = useStore($hackerTarget);
  const targetVersion = useStore($hackerTargetVersion);
  const finalConfig = useStore($hackerFinalMessageConfig);
  const injectionProgress = useStore($hackerInjectionProgress);
  const [targetLogs, setTargetLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cinematic target update telemetry
  useEffect(() => {
    if (targetVersion > 0) {
      setTargetLogs([
        `[>] ========================================================`,
        `[>] >>> TARGET UPDATED: ${target.ip} [${target.name}] <<<`,
        `[*] Target architecture: x86_64 SMP | Latency: ${target.latency}ms`,
        `[*] Vulnerability vector: ${target.ports} [OPEN] | Status: ${target.status}`,
        `[*] Routing tunnel: tun0 -> gw(192.168.10.103) -> ${target.ip}`,
        `[*] Memory injection payload re-calibrated.`,
        `[>] ========================================================`,
      ]);
    }
  }, [targetVersion, target]);

  const handleInitiate = useCallback(() => {
    initiatePayloadInjection();
  }, []);

  // Activate on press of Enter key anywhere (unless typing in settings inputs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetEl = e.target as HTMLElement;
      // Do not trigger if typing in a real input (like settings modal), but allow editor's hidden input
      if (
        targetEl &&
        (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA') &&
        !targetEl.classList.contains('hacker-hidden-input')
      ) {
        return;
      }

      if (e.key === 'Enter') {
        if (!$hackerSettingsOpen.get() && !$hackerFinalMessageVisible.get()) {
          initiatePayloadInjection();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle injection animation & write progress to shared store
  useEffect(() => {
    if (phase === 'injecting') {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min((elapsed / INJECTION_DURATION) * 100, 100);
        $hackerInjectionProgress.set(p);
        if (p >= 100) {
          clearInterval(interval);
          $hackerPhase.set('transferring');
          if ($hackerFinalMessageConfig.get().enabled) {
            $hackerFinalMessageVisible.set(true);
          }
        }
      }, 50);
      return () => clearInterval(interval);
    } else if (phase === 'awaiting') {
      $hackerInjectionProgress.set(0);
    }
  }, [phase]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [charCount, phase, injectionProgress, targetVersion]);

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

        {targetLogs.length > 0 && (
          <>
            <br />
            {targetLogs.map((log, i) => (
              <div key={`tl-${i}`} className="hacker-alert">{log}</div>
            ))}
          </>
        )}

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
                {`[!] TARGET LOCKED (${target.ip}) — Press [ENTER] to initiate payload`}
              </div>
            ) : (
              <div
                className="hacker-blink"
                style={{ cursor: 'pointer' }}
                onClick={handleInitiate}
              >
                {`[*] Target: ${target.ip} (${target.name}) — Press [ENTER] to initiate ...`}
              </div>
            )}
          </>
        )}
        {phase === 'injecting' && (
          <div className="hacker-alert">
            <div>{`[*] INJECTING PAYLOAD INTO ${target.ip} ... ${renderProgressBar(injectionProgress)}`}</div>
            <div style={{ opacity: 0.85, marginTop: 4 }}>
              {`[>] PIPELINE SYNC: Arming extraction socket in PANE: TRANSFER`}
            </div>
            <div style={{ opacity: 0.75 }}>
              {`[>] MEM_OFFSET: 0x${(0x7fff0000 + Math.floor(injectionProgress * 128)).toString(16).toUpperCase()} | Stage: ${
                injectionProgress < 35
                  ? "EXPLOIT_DELIVERY"
                  : injectionProgress < 75
                  ? "BUFFER_OVERWRITE"
                  : "EXFIL_STAGING_LINK"
              }`}
            </div>
            <div style={{ opacity: 0.75 }}>
              {`[*] Handing off stream descriptors to PANE: TRANSFER (${Math.min(10, Math.floor(injectionProgress * 0.1))}/10 primed)...`}
            </div>
          </div>
        )}
        {(phase === 'transferring' || phase === 'complete') && (
          <>
            <div className="hacker-success">
              {`[+] PAYLOAD DELIVERED TO ${target.ip} (${target.name})`}
            </div>
            <div style={{ opacity: 0.8, fontSize: 11, marginTop: 2 }}>
              {`[>] HANDOFF COMPLETE -> Active exfiltration running in PANE: TRANSFER`}
            </div>
            {finalConfig.enabled && (
              <div
                className={finalConfig.type === 'fail' ? 'hacker-alert' : 'hacker-success'}
                style={{ marginTop: 6, fontWeight: 'bold' }}
              >
                {finalConfig.type === 'fail' ? '[-] ' : '[+] '}
                {finalConfig.text.trim() || (finalConfig.type === 'fail' ? 'Access Denied' : 'Access Granted')}
              </div>
            )}
          </>
        )}
      </pre>
    </div>
  );
};

export default PayloadInjector;
