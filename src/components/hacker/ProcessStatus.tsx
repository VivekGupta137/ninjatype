import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $hackerTarget, $hackerTargetVersion } from '@/store/hacker';
import { PROCESS_TEMPLATES, jitterProcess, type ProcessInfo } from '@/constants/hackerData';

export const ProcessStatus: React.FC = () => {
  const target = useStore($hackerTarget);
  const targetVersion = useStore($hackerTargetVersion);
  const [processes, setProcesses] = useState<ProcessInfo[]>(PROCESS_TEMPLATES);
  const [timeStr, setTimeStr] = useState<string>('');
  const [loadAvg, setLoadAvg] = useState({ one: 2.41, five: 1.87, fifteen: 1.52 });
  const [memState, setMemState] = useState({ free: 4201.2, used: 8192.5 });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const updateTop = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));

      // Jitter load average
      setLoadAvg(prev => ({
        one: Math.max(0.8, +(prev.one + (Math.random() - 0.48) * 0.15).toFixed(2)),
        five: Math.max(0.8, +(prev.five + (Math.random() - 0.49) * 0.05).toFixed(2)),
        fifteen: Math.max(0.8, +(prev.fifteen + (Math.random() - 0.5) * 0.02).toFixed(2)),
      }));

      // Jitter memory
      setMemState(prev => {
        const delta = (Math.random() - 0.5) * 8.4;
        return {
          free: +(prev.free - delta).toFixed(1),
          used: +(prev.used + delta).toFixed(1),
        };
      });

      // Advance processes and TIME+
      setProcesses(prev => {
        return prev.map(p => {
          const jittered = jitterProcess(p);
          // Advance TIME+ slightly for busy processes
          if (jittered.cpu > 5 && Math.random() > 0.6) {
            const parts = jittered.time.split(':');
            if (parts.length === 2) {
              const secs = parseFloat(parts[1]) + 0.12;
              jittered.time = `${parts[0]}:${secs.toFixed(2).padStart(5, '0')}`;
            }
          }
          return jittered;
        }).sort((a, b) => b.cpu - a.cpu);
      });

      setTick(t => t + 1);
    };

    updateTop();
    const interval = setInterval(updateTop, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalCpuUser = Math.min(99, processes.reduce((acc, p) => acc + p.cpu, 0)).toFixed(1);
  const totalCpuSys = (parseFloat(totalCpuUser) * 0.22).toFixed(1);
  const totalCpuIdle = Math.max(0, 100 - parseFloat(totalCpuUser) - parseFloat(totalCpuSys)).toFixed(1);

  return (
    <div className="hacker-pane-body">
      <pre className="hacker-terminal-text">
        <div suppressHydrationWarning>{`top - ${timeStr || "12:00:00"} [TARGET: ${target.ip}] up 137 days, load avg: ${loadAvg.one.toFixed(2)}, ${loadAvg.five.toFixed(2)}`}</div>
        <div className="hacker-highlight">{`[!] LINK: ${target.ip} [${target.name}] status:${target.status} rtt:${target.latency}ms`}</div>
        <div>{`Tasks: 128 total,   ${processes.filter(p => p.cpu > 2).length} running, 126 sleeping,   0 stopped`}</div>
        <div>{`%Cpu(s): ${totalCpuUser.padStart(4)} us, ${totalCpuSys.padStart(4)} sy,  ${totalCpuIdle.padStart(4)} id`}</div>
        <div>{`MiB Mem :  16384.0 total,   ${memState.free.toFixed(1)} free,   ${memState.used.toFixed(1)} used`}</div>
        <br />
        <div className="hacker-highlight">{`  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND`}</div>
        {processes.map((p, idx) => {
          const cmd = p.command === 'nj-exploit' ? `nj-exploit --target=${target.ip}` : p.command;
          const row = `${p.pid.toString().padStart(5)} ${p.user.padEnd(8)} ${p.pr.toString().padStart(3)} ${p.ni.toString().padStart(3)} ${p.virt.padStart(7)} ${p.res.padStart(6)} ${p.shr.padStart(6)} ${p.s} ${p.cpu.toFixed(1).padStart(5)} ${p.mem.toFixed(1).padStart(5)} ${p.time.padStart(9)} ${cmd}`;
          if (p.command === 'nj-exploit' || idx === 0) {
            return <div key={p.pid}><span className="hacker-alert">{row}</span></div>;
          }
          if (p.cpu > 8) {
            return <div key={p.pid}><span className="hacker-highlight">{row}</span></div>;
          }
          return <div key={p.pid}>{row}</div>;
        })}
      </pre>
    </div>
  );
};

export default ProcessStatus;
