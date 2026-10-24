/** One fictional operation script shared by every terminal pane. */
export const ANALYSIS_DURATION = 10_000;
export const INJECTION_DURATION = 8_000;
export const TRANSFER_DURATION = 12_000;
export const VERIFICATION_DURATION = 2_000;
export const TRANSFER_START = ANALYSIS_DURATION + INJECTION_DURATION;
export const VERIFICATION_START = TRANSFER_START + TRANSFER_DURATION;
export const SEQUENCE_DURATION = VERIFICATION_START + VERIFICATION_DURATION;
export type SequencePhase =
    | "awaiting"
    | "writing"
    | "analyzing"
    | "injecting"
    | "transferring"
    | "verifying"
    | "complete";
export type SequencePane =
    | "editor"
    | "process"
    | "topology"
    | "memory"
    | "disasm"
    | "injector"
    | "transfer";
export interface SequenceEvent {
    id: string;
    at: number;
    pane: SequencePane;
    text: string;
    level: "info" | "success" | "warning";
}
export interface SequenceTarget {
    id: string;
    name: string;
    ip: string;
    ports: string;
}
export const SEQUENCE_FILES = [
    { name: "credentials.db", size: 128 },
    { name: "access_keys.bin", size: 64 },
    { name: "network.pcap", size: 1024 },
    { name: "vault.enc", size: 2048 },
    { name: "sys_snapshot.tar", size: 832 },
];
export const TRANSFER_TOTAL = SEQUENCE_FILES.reduce(
    (sum, file) => sum + file.size,
    0,
);
export function sequenceEvidence(target: SequenceTarget) {
    const node = Number(target.id.replace(/\D/g, "")) || 1;
    const base = 0x7fff0000 + node * 0x1000;
    return {
        buffer: `0x${base.toString(16)}`,
        guard: `0x${(base + 0x59).toString(16)}`,
        key: `0x${(0x4a6f7000 + node * 0x101).toString(16)}`,
        patch: "75 17 → 90 90",
        request: `REV-${String(node).padStart(2, "0")}`,
        base,
    };
}
export function sequencePhase(elapsed: number): SequencePhase {
    if (elapsed < ANALYSIS_DURATION) return "analyzing";
    if (elapsed < TRANSFER_START) return "injecting";
    if (elapsed < VERIFICATION_START) return "transferring";
    if (elapsed < SEQUENCE_DURATION) return "verifying";
    return "complete";
}
export function stageProgress(
    elapsed: number,
    start: number,
    duration: number,
) {
    return Math.min(100, Math.max(0, ((elapsed - start) / duration) * 100));
}
export function sequenceTargetStatus(phase: SequencePhase, denied: boolean) {
    if (phase === "awaiting") return "TARGET";
    if (phase === "complete") return denied ? "LOCKED OUT" : "ACCESS GRANTED";
    return {
        writing: "WRITING CODE",
        analyzing: "REVERSING",
        injecting: "INJECTING",
        transferring: "EXFILTRATING",
        verifying: "VERIFYING",
    }[phase];
}
export function buildSequenceEvents(
    target: SequenceTarget,
    denied: boolean,
): SequenceEvent[] {
    const e = sequenceEvidence(target);
    const events: SequenceEvent[] = [];
    function add(
        at: number,
        pane: SequencePane,
        text: string,
        level: SequenceEvent["level"] = "info",
    ) {
        events.push({
            id: `${pane}-${at}-${events.length}`,
            at,
            pane,
            text,
            level,
        });
    }
    add(
        0,
        "injector",
        `OPERATION OPEN // ${e.request} // ${target.name} (${target.ip})`,
    );
    add(
        0,
        "editor",
        `Code editor complete. Worker attached to ${target.name}; reverse-engineering pipeline armed.`,
    );
    add(0, "topology", `Route locked: CORE-RELAY → ${target.name}`);
    add(
        400,
        "injector",
        `REQUEST → MEMDUMP [${e.request}]: locate auth buffer and recover session key.`,
    );
    add(
        800,
        "memory",
        `REQUEST ← PAYLOAD [${e.request}]: capture ${target.ip} address space.`,
    );
    add(
        1400,
        "memory",
        `ptrace attached // buffer=${e.buffer} // 256 bytes captured.`,
        "success",
    );
    for (let row = 0; row < 8; row++) {
        const address = e.base + row * 16;
        const bytes = Array.from(
            { length: 16 },
            (_, i) => ((address + i) * 31 + 17) % 256,
        );
        add(
            1600 + row * 150,
            "memory",
            `${address.toString(16)}  ${bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ")}  |${bytes.map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : ".")).join("")}|`,
        );
    }
    add(
        3000,
        "memory",
        `AUTH BUFFER FOUND // ${e.buffer} // key=${e.key}`,
        "success",
    );
    add(
        3400,
        "memory",
        `RESPONSE → PAYLOAD [${e.request}]: buffer and key exported.`,
        "success",
    );
    add(
        3600,
        "injector",
        `RESPONSE ← MEMDUMP [${e.request}]: buffer=${e.buffer}, key=${e.key}.`,
        "success",
    );
    add(
        4000,
        "injector",
        `REQUEST → DISASM [${e.request}]: reverse auth gate at ${e.guard}.`,
    );
    add(
        4400,
        "disasm",
        `REQUEST ← PAYLOAD [${e.request}]: trace check_security_gate().`,
    );
    add(
        4800,
        "disasm",
        `Symbols loaded // RIP=${e.guard} // buffer=${e.buffer}.`,
        "success",
    );
    add(
        5200,
        "disasm",
        `0x${(e.base + 0x57).toString(16)}  85 c0    test %eax, %eax`,
    );
    add(5600, "disasm", `${e.guard}  75 17    jne <security_lockout>`);
    add(
        6000,
        "disasm",
        `AUTH GUARD IDENTIFIED // conditional branch at ${e.guard}.`,
        "success",
    );
    add(
        6500,
        "disasm",
        `PATCH CANDIDATE // ${e.patch} // bypass length: 2 bytes.`,
    );
    add(
        7000,
        "disasm",
        `RESPONSE → PAYLOAD [${e.request}]: guard=${e.guard}, patch=${e.patch}.`,
        "success",
    );
    add(
        7400,
        "injector",
        `RESPONSE ← DISASM [${e.request}]: branch patch verified.`,
        "success",
    );
    add(
        8000,
        "injector",
        `PAYLOAD IDENTIFIED // buffer=${e.buffer} // guard=${e.guard} // key=${e.key}.`,
        "success",
    );
    add(
        9000,
        "injector",
        "Reverse-engineering complete. Packing ring-0 stage...",
        "success",
    );
    add(
        10_000,
        "injector",
        `INJECTION START → ${target.ip} // destination=${e.buffer}.`,
    );
    add(
        10_000,
        "editor",
        `Payload compiled; applying ${e.patch} at ${e.guard}.`,
    );
    add(
        11_000,
        "memory",
        `REQUEST ← PAYLOAD: write staged payload into ${e.buffer}.`,
    );
    add(
        12_000,
        "memory",
        `${e.buffer}  90 90 48 31 c0 48 ff c0 0f 05 90 90 90 90 90 90`,
    );
    add(
        13_000,
        "memory",
        `WRITE CONFIRMED → PAYLOAD // buffer=${e.buffer} // checksum matched.`,
        "success",
    );
    add(
        14_000,
        "disasm",
        `${e.guard}  90 90    nop; nop // branch patch applied.`,
        "success",
    );
    add(
        15_000,
        "disasm",
        "Execution trace: check_security_gate → commit_creds → return.",
        "success",
    );
    add(
        16_000,
        "injector",
        "MEMDUMP write acknowledged. DISASM execution trace acknowledged.",
        "success",
    );
    add(
        17_000,
        "injector",
        `REQUEST → SCP: open encrypted stream using key=${e.key}.`,
    );
    add(
        18_000,
        "injector",
        "PAYLOAD DELIVERED // handing transport descriptors to SCP.",
        "success",
    );
    add(
        18_000,
        "transfer",
        `HANDOFF ← PAYLOAD // ${e.request} // key=${e.key}.`,
        "success",
    );
    add(
        18_000,
        "transfer",
        `scp stream established // ${target.ip} → EXFIL-14 // 5 files / 4.00 MiB.`,
        "success",
    );
    add(
        18_000,
        "editor",
        "Transport handed to scp; collecting remote archive.",
    );
    add(18_000, "memory", "Ring buffer mapped to SCP. Watching read cursor...");
    add(
        18_000,
        "disasm",
        "Execution transferred to scp_stream_write(); auth gate held open.",
    );
    let cumulative = 0;
    for (const file of SEQUENCE_FILES) {
        const begin =
            TRANSFER_START + (cumulative / TRANSFER_TOTAL) * TRANSFER_DURATION;
        cumulative += file.size;
        const end =
            TRANSFER_START + (cumulative / TRANSFER_TOTAL) * TRANSFER_DURATION;
        add(
            Math.ceil(begin),
            "transfer",
            `RECEIVING ${file.name} // ${file.size} KiB.`,
        );
        add(
            Math.ceil(end),
            "transfer",
            `${file.name} // ${file.size} KiB // RECEIVED.`,
            "success",
        );
        add(
            Math.ceil(end),
            "memory",
            `SCP read acknowledged // ${file.name} // cursor=${cumulative} KiB.`,
            "success",
        );
    }
    add(
        30_000,
        "transfer",
        "All bytes received. Verifying archive and remote access receipt...",
    );
    add(
        30_000,
        "injector",
        "RESPONSE ← SCP: transfer complete. Awaiting final access verification.",
    );
    add(
        30_000,
        "disasm",
        "Final trace: verify_access_receipt() // waiting on remote response.",
    );
    add(
        31_000,
        "memory",
        "Read cursor drained // 4096 KiB // releasing staging buffer.",
    );
    if (denied) {
        add(
            32_000,
            "disasm",
            "REMOTE GUARD TRIGGERED // security_lockout() // access receipt rejected.",
            "warning",
        );
        add(
            32_000,
            "memory",
            `Session key ${e.key} revoked. Staging buffer cleared.`,
            "warning",
        );
        add(
            32_000,
            "transfer",
            "ACCESS RECEIPT DENIED // archive quarantined // transport closed.",
            "warning",
        );
        add(
            32_000,
            "injector",
            "ACCESS DENIED // remote countermeasure active // operation terminated.",
            "warning",
        );
        add(
            32_000,
            "editor",
            "Operation denied; remote access receipt rejected.",
            "warning",
        );
    } else {
        add(
            32_000,
            "disasm",
            "verify_access_receipt() → 0 // execution completed.",
            "success",
        );
        add(
            32_000,
            "memory",
            "Staging buffer released // session key verified.",
            "success",
        );
        add(
            32_000,
            "transfer",
            "EXFILTRATION COMPLETE // 5 files / 4.00 MiB // CHECKSUM OK.",
            "success",
        );
        add(
            32_000,
            "injector",
            "ACCESS GRANTED // payload, memory, disassembly and SCP verified.",
            "success",
        );
        add(
            32_000,
            "editor",
            "Operation complete; access receipt and archive verified.",
            "success",
        );
    }
    return events.sort((a, b) => a.at - b.at);
}
