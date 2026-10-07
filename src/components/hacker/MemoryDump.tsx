import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { $hackerTarget, $hackerTargetVersion } from '@/store/hacker';
import { generateHexLine, DISCOVERED_SECRETS } from '@/constants/hackerData';

const INITIAL_LINES = Array.from({ length: 15 }, (_, i) => ({
  id: `init-${i}`,
  text: generateHexLine(0x7fff0000 + i * 16),
}));

export const MemoryDump: React.FC = () => {
  const target = useStore($hackerTarget);
  const targetVersion = useStore($hackerTargetVersion);
  const [lines, setLines] = useState<{ id: string; text: string; isSecret?: boolean }[]>(INITIAL_LINES);
  const containerRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<number>(0x7fff0000 + INITIAL_LINES.length * 16);
  const lineCountRef = useRef<number>(INITIAL_LINES.length);
  const secretIndexRef = useRef<number>(0);
  const isHoveredRef = useRef<boolean>(false);

  // Reinitialize memory map when target changes
  useEffect(() => {
    if (targetVersion > 0) {
      const ts = Date.now();
      addressRef.current = 0x7fff0000;
      const reinitLines = [
        { id: `tg-b1-${ts}`, text: `[>>>] ====================================================`, isSecret: true },
        { id: `tg-b2-${ts}`, text: `[>>>] TARGET UPDATE >> ATTACHING PTRACE TO ${target.ip} [${target.name}]`, isSecret: true },
        { id: `tg-b3-${ts}`, text: `[>>>] RE-MAPPING REMOTE ADDRESS SPACE >> 0x7fff0000 [OK]`, isSecret: true },
        { id: `tg-b4-${ts}`, text: `[>>>] PROBING ${target.ports} >> SESSION MEMORY CAPTURED`, isSecret: true },
        { id: `tg-b5-${ts}`, text: `[!] SECRET FOUND >> ${target.ip}::root:$6$n1nja$hash...`, isSecret: true },
        { id: `tg-b6-${ts}`, text: `[>>>] ====================================================`, isSecret: true },
      ];
      setLines((prev) => [...prev.slice(-20), ...reinitLines]);
    }
  }, [targetVersion, target]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isHoveredRef.current) return;

      const newLines: { id: string; text: string; isSecret?: boolean }[] = [];

      lineCountRef.current++;
      addressRef.current += 16;

      // Intermittently inject discovered secret every ~14 lines
      if (lineCountRef.current % 14 === 0) {
        const secret = DISCOVERED_SECRETS[secretIndexRef.current % DISCOVERED_SECRETS.length];
        secretIndexRef.current++;
        newLines.push({
          id: `sec-${lineCountRef.current}`,
          text: `[!] SECRET FOUND >> ${secret}`,
          isSecret: true,
        });
        lineCountRef.current++;
      }

      newLines.push({
        id: `mem-${lineCountRef.current}`,
        text: generateHexLine(addressRef.current),
      });

      setLines((prev) => {
        const next = [...prev, ...newLines];
        if (next.length > 50) {
          return next.slice(next.length - 50);
        }
        return next;
      });
    }, 850);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current && !isHoveredRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div
      className="hacker-pane-body"
      ref={containerRef}
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
    >
      <pre className="hacker-terminal-text">
        {lines.map(line => (
          <div key={line.id} className={line.isSecret ? 'hacker-alert' : ''}>
            {line.text}
          </div>
        ))}
      </pre>
    </div>
  );
};

export default MemoryDump;
