import React, { useState, useEffect, useRef } from "react";

interface RegisterSet {
  rax: string;
  rbx: string;
  rcx: string;
  rdx: string;
  rsi: string;
  rdi: string;
  rbp: string;
  rsp: string;
  rip: string;
  eflags: string;
}

interface AsmInstruction {
  addr: string;
  bytes: string;
  mnemonic: string;
  comment?: string;
  isTarget?: boolean;
}

const BASE_ASM: AsmInstruction[] = [
  { addr: "0x7fff0040", bytes: "f3 0f 1e fa", mnemonic: "endbr64", comment: "IBT landing pad" },
  { addr: "0x7fff0044", bytes: "55", mnemonic: "push   %rbp" },
  { addr: "0x7fff0045", bytes: "48 89 e5", mnemonic: "mov    %rsp, %rbp" },
  { addr: "0x7fff0048", bytes: "48 83 ec 20", mnemonic: "sub    $0x20, %rsp", comment: "alloc frame" },
  { addr: "0x7fff004c", bytes: "48 89 7d e8", mnemonic: "mov    %rdi, -0x18(%rbp)" },
  { addr: "0x7fff0050", bytes: "31 c0", mnemonic: "xor    %eax, %eax" },
  { addr: "0x7fff0052", bytes: "e8 c9 00 00", mnemonic: "callq  <check_hash>" },
  { addr: "0x7fff0057", bytes: "85 c0", mnemonic: "test   %eax, %eax" },
  { addr: "0x7fff0059", bytes: "75 17", mnemonic: "jne    <bypass_auth>", isTarget: true, comment: "[CRITICAL JMP]" },
  { addr: "0x7fff005b", bytes: "b8 01 00 00", mnemonic: "mov    $0x1, %eax", comment: "SYS_write" },
  { addr: "0x7fff0060", bytes: "0f 05", mnemonic: "syscall", comment: "ring-0 transition" },
  { addr: "0x7fff0062", bytes: "48 8d 05 18", mnemonic: "lea    0x18(%rip), %rax" },
  { addr: "0x7fff0069", bytes: "48 8b 18", mnemonic: "mov    (%rax), %rbx" },
  { addr: "0x7fff006c", bytes: "5d", mnemonic: "pop    %rbp" },
  { addr: "0x7fff006d", bytes: "c3", mnemonic: "retq" },
  { addr: "0x7fff0072", bytes: "bf 00 00 00", mnemonic: "mov    $0x0, %edi", comment: "UID 0 root" },
  { addr: "0x7fff0077", bytes: "e8 84 ff ff", mnemonic: "callq  <commit_creds>", isTarget: true },
  { addr: "0x7fff007c", bytes: "c9", mnemonic: "leaveq" },
  { addr: "0x7fff007d", bytes: "c3", mnemonic: "retq" },
];

function randomHex(bytes: number): string {
  let s = "";
  for (let i = 0; i < bytes; i++) {
    s += Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  }
  return "0x" + s;
}

export const DisassemblyView: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(8);
  const [regs, setRegs] = useState<RegisterSet>({
    rax: "0x0000000000000000",
    rbx: "0x00007fffffffe108",
    rcx: "0x00007ffff7f9d8a0",
    rdx: "0x0000000000000001",
    rsi: "0x00007fff00001000",
    rdi: "0x0000000000000000",
    rbp: "0x00007fffffffdff0",
    rsp: "0x00007fffffffdfe0",
    rip: "0x00007fff0059",
    eflags: "[ZF IF]",
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Stepping through disassembly and jittering registers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % BASE_ASM.length;
        const target = BASE_ASM[next];

        setRegs({
          rax: next === 8 ? "0x0000000000000001" : randomHex(4),
          rbx: randomHex(8),
          rcx: randomHex(8),
          rdx: "0x000000000000000" + Math.floor(Math.random() * 9),
          rsi: "0x00007fff" + randomHex(4).slice(2),
          rdi: next >= 15 ? "0x0000000000000000" : randomHex(4),
          rbp: "0x00007fffffffdff0",
          rsp: "0x00007fffffffdfe0",
          rip: target.addr,
          eflags: next % 2 === 0 ? "[CF ZF IF]" : "[PF ZF SF IF]",
        });

        return next;
      });
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hacker-pane-body" ref={containerRef}>
      <pre className="hacker-terminal-text">
        {/* Registers section (GDB GEF style) */}
        <div className="hacker-highlight">─── REGISTERS (x86_64) ──────────────────────────────────</div>
        <div>{`RAX: ${regs.rax}  RBX: ${regs.rbx}`}</div>
        <div>{`RCX: ${regs.rcx}  RDX: ${regs.rdx}`}</div>
        <div>{`RSI: ${regs.rsi}  RDI: ${regs.rdi}`}</div>
        <div>{`RBP: ${regs.rbp}  RSP: ${regs.rsp}`}</div>
        <div>{`RIP: ${regs.rip}  EFL: ${regs.eflags}`}</div>
        <br />

        {/* Disassembly section */}
        <div className="hacker-highlight">─── DISASSEMBLY (radare2 / gdb) ─────────────────────────</div>
        {BASE_ASM.map((item, idx) => {
          const isCurrent = idx === currentStep;
          const prefix = isCurrent ? "=> " : "   ";
          const line = `${prefix}${item.addr.padEnd(12)} ${item.bytes.padEnd(12)} ${item.mnemonic.padEnd(26)} ${item.comment ? "; " + item.comment : ""}`;

          if (isCurrent) {
            return (
              <div key={item.addr} className="hacker-alert">
                {line}
              </div>
            );
          }

          if (item.isTarget) {
            return (
              <div key={item.addr} className="hacker-highlight">
                {line}
              </div>
            );
          }

          return <div key={item.addr}>{line}</div>;
        })}
        <br />

        {/* Stack frame */}
        <div className="hacker-highlight">─── STACK TRACE ─────────────────────────────────────────</div>
        <div className="hacker-dim">#0  0x7fff0059 in check_security_gate (uid=0)</div>
        <div className="hacker-dim">#1  0x7fff0120 in ninja_exec_core (payload=0x7fff0000)</div>
        <div className="hacker-dim">#2  0x7ffff7df in __libc_start_main ()</div>
      </pre>
    </div>
  );
};

export default DisassemblyView;
