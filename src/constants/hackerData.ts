/**
 * Fake data for the hacker mode dashboard panels.
 */

export interface ProcessInfo {
    pid: number;
    user: string;
    pr: number;
    ni: number;
    virt: string;
    res: string;
    shr: string;
    s: string;
    cpu: number;
    mem: number;
    time: string;
    command: string;
}

export const PROCESS_TEMPLATES: ProcessInfo[] = [
    { pid: 1, user: "root", pr: 20, ni: 0, virt: "225M", res: "9.4M", shr: "6.7M", s: "S", cpu: 0.0, mem: 0.1, time: "5:32.14", command: "systemd" },
    { pid: 2, user: "root", pr: 20, ni: 0, virt: "0K", res: "0K", shr: "0K", s: "S", cpu: 0.0, mem: 0.0, time: "0:01.23", command: "kthreadd" },
    { pid: 847, user: "root", pr: 20, ni: 0, virt: "1.2G", res: "48M", shr: "12M", s: "S", cpu: 2.3, mem: 1.2, time: "12:45.67", command: "Xorg" },
    { pid: 1024, user: "ninja", pr: 20, ni: 0, virt: "4.1G", res: "312M", shr: "89M", s: "S", cpu: 8.7, mem: 8.1, time: "45:12.89", command: "node" },
    { pid: 1337, user: "root", pr: -20, ni: -20, virt: "128M", res: "24M", shr: "4M", s: "R", cpu: 15.2, mem: 0.6, time: "2:18.44", command: "nj-exploit" },
    { pid: 1338, user: "root", pr: 20, ni: 0, virt: "64M", res: "12M", shr: "8M", s: "S", cpu: 3.1, mem: 0.3, time: "0:45.12", command: "ssh-tunnel" },
    { pid: 1401, user: "ninja", pr: 20, ni: 0, virt: "2.8G", res: "196M", shr: "52M", s: "S", cpu: 5.4, mem: 5.1, time: "23:56.78", command: "chromium" },
    { pid: 1455, user: "root", pr: 20, ni: 0, virt: "96M", res: "18M", shr: "6M", s: "S", cpu: 1.2, mem: 0.5, time: "1:34.56", command: "sshd" },
    { pid: 1502, user: "ninja", pr: 20, ni: 0, virt: "512M", res: "64M", shr: "24M", s: "S", cpu: 4.8, mem: 1.7, time: "8:23.45", command: "python3" },
    { pid: 1567, user: "root", pr: 20, ni: 0, virt: "32M", res: "8M", shr: "4M", s: "S", cpu: 0.7, mem: 0.2, time: "0:12.34", command: "cron" },
    { pid: 1623, user: "ninja", pr: 20, ni: 0, virt: "1.6G", res: "142M", shr: "38M", s: "R", cpu: 12.5, mem: 3.7, time: "15:47.23", command: "rustc" },
    { pid: 1700, user: "root", pr: 20, ni: 0, virt: "48M", res: "6M", shr: "3M", s: "S", cpu: 0.3, mem: 0.2, time: "0:08.91", command: "rsyslogd" },
    { pid: 1842, user: "ninja", pr: 20, ni: 0, virt: "256M", res: "32M", shr: "16M", s: "S", cpu: 2.1, mem: 0.8, time: "3:12.67", command: "vim" },
    { pid: 1900, user: "root", pr: 20, ni: 0, virt: "72M", res: "14M", shr: "8M", s: "S", cpu: 0.9, mem: 0.4, time: "0:23.45", command: "NetworkManager" },
    { pid: 2001, user: "ninja", pr: 20, ni: 0, virt: "384M", res: "52M", shr: "20M", s: "S", cpu: 3.6, mem: 1.4, time: "6:34.12", command: "cargo" },
    { pid: 2100, user: "root", pr: 20, ni: 0, virt: "156M", res: "28M", shr: "12M", s: "S", cpu: 1.8, mem: 0.7, time: "2:01.56", command: "dockerd" },
];

/** Randomize CPU/MEM values slightly for animation */
export function jitterProcess(p: ProcessInfo): ProcessInfo {
    return {
        ...p,
        cpu: Math.max(0, p.cpu + (Math.random() - 0.5) * 4),
        mem: Math.max(0, p.mem + (Math.random() - 0.5) * 0.5),
    };
}

/** Generate a fake memory address */
export function randomHexAddr(base: number): string {
    return "0x" + (base + Math.floor(Math.random() * 0xfff)).toString(16).padStart(8, "0");
}

/** Generate a line of hex dump */
export function generateHexLine(addr: number): string {
    const hexAddr = "0x" + addr.toString(16).padStart(8, "0");
    const bytes: string[] = [];
    const ascii: string[] = [];
    for (let i = 0; i < 16; i++) {
        const b = Math.floor(Math.random() * 256);
        bytes.push(b.toString(16).padStart(2, "0"));
        ascii.push(b >= 32 && b < 127 ? String.fromCharCode(b) : ".");
    }
    return `${hexAddr}  ${bytes.slice(0, 8).join(" ")}  ${bytes.slice(8).join(" ")}  |${ascii.join("")}|`;
}

/** Fake file transfer entries */
export interface TransferFile {
    name: string;
    size: string;
    sizeBytes: number;
}

export const TRANSFER_FILES: TransferFile[] = [
    { name: "/etc/shadow", size: "1.2K", sizeBytes: 1228 },
    { name: "/etc/passwd", size: "2.4K", sizeBytes: 2457 },
    { name: "/root/.ssh/id_rsa", size: "3.2K", sizeBytes: 3276 },
    { name: "/var/log/auth.log", size: "847K", sizeBytes: 867328 },
    { name: "/opt/app/config/database.yml", size: "4.1K", sizeBytes: 4198 },
    { name: "/etc/ssl/private/server.key", size: "1.7K", sizeBytes: 1740 },
    { name: "/home/admin/.bash_history", size: "12K", sizeBytes: 12288 },
    { name: "/var/lib/mysql/users.ibd", size: "2.1M", sizeBytes: 2202009 },
    { name: "/opt/secrets/api_keys.json", size: "956B", sizeBytes: 956 },
    { name: "/root/.gnupg/secring.gpg", size: "5.4K", sizeBytes: 5529 },
];

/** Fake passwords that appear in memory dump */
export const DISCOVERED_SECRETS = [
    "admin:$6$rounds=5000$xR3kQv...$B8Tf2lKz",
    "root:$6$Kj8mPqNx$7vF2hGdR9wX4mNbC",
    "db_pass=Pr0d_S3cur3!@#2024",
    "API_KEY=sk-proj-nJ7x9Kf2mR4wQp8v",
    "JWT_SECRET=eyJhbGciOiJIUzI1NiJ9",
    "AWS_SECRET=wJalrXUtnFEMI/K7MDENG",
    "SSH_PASSPHRASE=N1nj4Typ3_2024!",
    "MASTER_KEY=0xDEADBEEF4A6F7C8D",
];

/** Injection status messages */
export const INJECTION_MESSAGES = [
    "[*] Initializing secure channel ...",
    "[*] Scanning target network 192.168.1.0/24 ...",
    "[+] Target identified: 192.168.1.42:8443",
    "[*] Probing open ports ...",
    "[+] Port 22 (SSH) - OPEN",
    "[+] Port 443 (HTTPS) - OPEN",
    "[+] Port 8443 (Custom) - OPEN",
    "[*] Enumerating services ...",
    "[+] OpenSSH 8.9p1 detected",
    "[+] nginx/1.24.0 detected",
    "[*] Checking for known vulnerabilities ...",
    "[+] CVE-2024-3094: POTENTIALLY VULNERABLE",
    "[*] Preparing exploit payload ...",
    "[*] Encoding shellcode with XOR cipher ...",
    "[+] Payload size: 2048 bytes",
    "[+] Checksum: 0x4a6f7c8d",
    "[*] Establishing encrypted tunnel ...",
    "[+] TLS 1.3 handshake complete",
    "[+] Cipher: ECDHE-RSA-AES256-GCM-SHA384",
    "[*] Performing key exchange ...",
    "[+] Session key derived: a7f2c9e1b4d8...",
    "[*] Awaiting code injection from operator ...",
];
