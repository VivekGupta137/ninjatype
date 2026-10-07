import React, { useState, useEffect, useRef } from 'react';
import { generateHexLine, DISCOVERED_SECRETS } from '@/constants/hackerData';

const INITIAL_LINES = Array.from({ length: 15 }, (_, i) => ({
  id: `init-${i}`,
  text: generateHexLine(0x7fff0000 + i * 16),
}));

export const MemoryDump: React.FC = () => {
  const [lines, setLines] = useState<{ id: string; text: string; isSecret?: boolean }[]>(INITIAL_LINES);
  const containerRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<number>(0x7fff0000 + INITIAL_LINES.length * 16);
  const lineCountRef = useRef<number>(INITIAL_LINES.length);
  const secretIndexRef = useRef<number>(0);
  const isHoveredRef = useRef<boolean>(false);

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
