"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanPorts = void 0;
const net_1 = __importDefault(require("net"));
const zod_1 = require("zod");
const ScanHistory_1 = __importDefault(require("../models/ScanHistory"));
const scanController_1 = require("./scanController");
// ============================================================
// PORT SCANNER — MANDATORY SAFETY CONSTRAINTS
// ⚠️  Users MUST confirm authorization via `consentConfirmed: true`
//     before any scan is executed.
//     Default target is localhost/127.0.0.1.
//     Non-localhost targets are allowed only with explicit consent.
//     This is NOT a general-purpose unrestricted network scanner.
// ============================================================
const ALLOWED_PORTS = [
    20, 21, 22, 23, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995,
    1433, 1521, 2181, 3000, 3306, 3389, 4200, 5000, 5432, 5900, 6379,
    7474, 8000, 8080, 8443, 8888, 9000, 9200, 27017,
];
const isLocalhost = (target) => {
    return (target === 'localhost' ||
        target === '127.0.0.1' ||
        target === '::1' ||
        target.startsWith('192.168.') ||
        target.startsWith('10.') ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(target));
};
function scanPort(host, port, timeoutMs = 1500) {
    return new Promise((resolve) => {
        const socket = new net_1.default.Socket();
        let resolved = false;
        const cleanup = (status) => {
            if (!resolved) {
                resolved = true;
                socket.destroy();
                resolve(status);
            }
        };
        socket.setTimeout(timeoutMs);
        socket.on('connect', () => cleanup('open'));
        socket.on('timeout', () => cleanup('closed'));
        socket.on('error', () => cleanup('closed'));
        socket.connect(port, host);
    });
}
// POST /api/scan/ports
const scanPorts = async (req, res) => {
    const schema = zod_1.z.object({
        target: zod_1.z.string().min(1).max(253),
        ports: zod_1.z
            .array(zod_1.z.number().int().min(1).max(65535))
            .min(1)
            .max(50)
            .refine((ports) => ports.every((p) => ALLOWED_PORTS.includes(p)), {
            message: 'One or more ports are not in the allowed port list',
        }),
        consentConfirmed: zod_1.z.literal(true, {
            errorMap: () => ({ message: 'You must confirm authorization to scan this target' }),
        }),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
    }
    const { target, ports } = parsed.data;
    // Extra server-side safety: warn but allow non-localhost with consent (already confirmed)
    const isLocal = isLocalhost(target);
    const warning = isLocal
        ? null
        : '⚠️ Scanning non-localhost targets. Ensure you have explicit authorization.';
    // Scan ports concurrently (with rate limiting to avoid overwhelming targets)
    const BATCH_SIZE = 10;
    const results = [];
    const SERVICE_NAMES = {
        20: 'FTP Data', 21: 'FTP Control', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
        53: 'DNS', 80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS',
        465: 'SMTPS', 587: 'SMTP Submission', 993: 'IMAPS', 995: 'POP3S',
        1433: 'MSSQL', 1521: 'Oracle DB', 2181: 'Zookeeper', 3000: 'Node.js Dev',
        3306: 'MySQL', 3389: 'RDP', 4200: 'Angular Dev', 5000: 'Flask/Dev',
        5432: 'PostgreSQL', 5900: 'VNC', 6379: 'Redis', 7474: 'Neo4j HTTP',
        8000: 'HTTP Alt', 8080: 'HTTP Proxy', 8443: 'HTTPS Alt', 8888: 'Jupyter',
        9000: 'PHP-FPM', 9200: 'Elasticsearch', 27017: 'MongoDB',
    };
    for (let i = 0; i < ports.length; i += BATCH_SIZE) {
        const batch = ports.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch.map(async (port) => ({
            port,
            status: await scanPort(target, port),
            service: SERVICE_NAMES[port] || 'Unknown',
        })));
        results.push(...batchResults);
    }
    await ScanHistory_1.default.create({
        userId: req.userId,
        module: 'port',
        input: `${target}:${ports.join(',')}`,
        result: { target, results, warning },
        riskScore: results.filter((r) => r.status === 'open').length * 3,
        verdict: results.some((r) => r.status === 'open') ? 'suspicious' : 'safe',
    });
    await (0, scanController_1.updateTodayStat)(req.userId, { portsScanned: results.length });
    res.json({
        success: true,
        target,
        isLocalhost: isLocal,
        warning,
        results,
        summary: {
            total: results.length,
            open: results.filter((r) => r.status === 'open').length,
            closed: results.filter((r) => r.status === 'closed').length,
        },
    });
};
exports.scanPorts = scanPorts;
