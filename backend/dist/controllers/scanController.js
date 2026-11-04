"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanEmail = exports.scanUrl = void 0;
exports.updateTodayStat = updateTodayStat;
const zod_1 = require("zod");
const xss_1 = __importDefault(require("xss"));
const ScanHistory_1 = __importDefault(require("../models/ScanHistory"));
const DashboardStat_1 = __importDefault(require("../models/DashboardStat"));
const KNOWN_SHORTENERS = [
    'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 't.co', 'is.gd',
    'buff.ly', 'adf.ly', 'cli.gs', 'tiny.cc', 'bc.vc',
];
const SUSPICIOUS_KEYWORDS = [
    'login', 'signin', 'verify', 'secure', 'account', 'update', 'confirm',
    'banking', 'paypal', 'amazon', 'apple', 'microsoft', 'google', 'netflix',
];
const BRAND_NAMES = [
    'paypal', 'amazon', 'apple', 'microsoft', 'google', 'netflix', 'facebook',
    'instagram', 'twitter', 'linkedin', 'bank', 'chase', 'wellsfargo', 'citibank',
];
function runMockUrlEngineDetailed(rawUrl) {
    let score = 0;
    const flags = [];
    const indicators = [];
    let url;
    try {
        url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    }
    catch {
        return {
            score: 85,
            verdict: 'malicious',
            flags: ['Invalid URL format'],
            indicators: [{ name: 'URL Syntax Check', passed: false, scoreAdded: 85, details: 'Malformed or invalid URL string' }],
            overview: { domain: 'invalid', protocol: 'none', path: '', search: '' },
        };
    }
    const hostname = url.hostname.toLowerCase();
    const fullUrl = rawUrl.toLowerCase();
    const pathAndQuery = (url.pathname + url.search).toLowerCase();
    // 1. IP Hostname Check
    const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
    if (isIp)
        score += 30;
    indicators.push({
        name: 'IP Address Hostname Check',
        passed: !isIp,
        scoreAdded: isIp ? 30 : 0,
        details: isIp ? 'IP address used as host instead of domain name' : 'Uses standard domain hostname',
    });
    if (isIp)
        flags.push('IP address used instead of domain name');
    // 2. Non-HTTPS Protocol Check
    const isHttp = url.protocol === 'http:';
    if (isHttp)
        score += 15;
    indicators.push({
        name: 'TLS/HTTPS Encryption Check',
        passed: !isHttp,
        scoreAdded: isHttp ? 15 : 0,
        details: isHttp ? 'Unencrypted HTTP protocol detected (no TLS)' : 'Secure HTTPS protocol enabled',
    });
    if (isHttp)
        flags.push('Non-secure HTTP protocol (no TLS)');
    // 3. URL Shortener Check
    const isShortener = KNOWN_SHORTENERS.some((s) => hostname === s || hostname.endsWith(`.${s}`));
    if (isShortener)
        score += 20;
    indicators.push({
        name: 'URL Shortener Concealment Check',
        passed: !isShortener,
        scoreAdded: isShortener ? 20 : 0,
        details: isShortener ? 'Known URL shortener service (obscures destination)' : 'Direct destination URL (not shortened)',
    });
    if (isShortener)
        flags.push('URL shortener detected — real destination hidden');
    // 4. Punycode / IDN Domain Check
    const isPunycode = hostname.includes('xn--');
    if (isPunycode)
        score += 25;
    indicators.push({
        name: 'Punycode / IDN Homograph Check',
        passed: !isPunycode,
        scoreAdded: isPunycode ? 25 : 0,
        details: isPunycode ? 'Punycode (xn--) domain detected (potential lookalike attack)' : 'Standard ASCII domain encoding',
    });
    if (isPunycode)
        flags.push('Punycode/IDN domain detected — potential lookalike attack');
    // 5. Subdomain Depth Check
    const subdomainCount = Math.max(0, hostname.split('.').length - 2);
    const excessSubdomains = subdomainCount > 2;
    const subScore = excessSubdomains ? 10 * Math.min(subdomainCount - 2, 3) : 0;
    score += subScore;
    indicators.push({
        name: 'Subdomain Nesting Depth Check',
        passed: !excessSubdomains,
        scoreAdded: subScore,
        details: excessSubdomains ? `Excessive subdomain nesting (${subdomainCount} levels)` : `Normal subdomain depth (${subdomainCount} levels)`,
    });
    if (excessSubdomains)
        flags.push(`Excessive subdomain depth (${subdomainCount} levels)`);
    // 6. Brand Typosquatting Check
    const brandHit = BRAND_NAMES.find((b) => hostname.includes(b) && !hostname.endsWith(`${b}.com`) && !hostname.endsWith(`${b}.org`));
    const hasBrandSpoof = Boolean(brandHit);
    if (hasBrandSpoof)
        score += 35;
    indicators.push({
        name: 'Brand Typosquatting / Impersonation Check',
        passed: !hasBrandSpoof,
        scoreAdded: hasBrandSpoof ? 35 : 0,
        details: hasBrandSpoof ? `Brand keyword "${brandHit}" detected in non-official domain` : 'No brand name typosquatting detected',
    });
    if (hasBrandSpoof)
        flags.push('Brand name impersonation detected in domain');
    // 7. Suspicious Keywords Combination Check
    const matchedKeywords = SUSPICIOUS_KEYWORDS.filter((kw) => fullUrl.includes(kw));
    const hasSuspKeywords = matchedKeywords.length >= 2;
    if (hasSuspKeywords)
        score += 15;
    indicators.push({
        name: 'High-Risk Keywords Combination Check',
        passed: !hasSuspKeywords,
        scoreAdded: hasSuspKeywords ? 15 : 0,
        details: hasSuspKeywords ? `Keywords matched: ${matchedKeywords.slice(0, 3).join(', ')}` : 'No suspicious keyword combinations',
    });
    if (hasSuspKeywords)
        flags.push(`Suspicious keyword combination: ${matchedKeywords.slice(0, 3).join(', ')}`);
    // 8. Long URL Length Check
    const isLongUrl = rawUrl.length > 200;
    if (isLongUrl)
        score += 10;
    indicators.push({
        name: 'URL Payload Length Check',
        passed: !isLongUrl,
        scoreAdded: isLongUrl ? 10 : 0,
        details: isLongUrl ? `Unusually long URL (${rawUrl.length} characters)` : `Standard URL length (${rawUrl.length} characters)`,
    });
    if (isLongUrl)
        flags.push('Unusually long URL (possible obfuscation)');
    // 9. Multiple Redirect Parameters Check
    const redirectCount = (pathAndQuery.match(/url=/gi) || []).length;
    const hasMultipleRedirects = redirectCount > 1;
    if (hasMultipleRedirects)
        score += 20;
    indicators.push({
        name: 'Multiple Redirect Parameter Check',
        passed: !hasMultipleRedirects,
        scoreAdded: hasMultipleRedirects ? 20 : 0,
        details: hasMultipleRedirects ? 'Multiple "url=" redirect parameters in path' : 'No nested redirect parameters detected',
    });
    if (hasMultipleRedirects)
        flags.push('Multiple URL redirect parameters detected');
    // 10. Dangerous File Extension Check
    const hasExecutableExt = /\.(exe|bat|cmd|scr|vbs|js|jar|msi|zip)$/i.test(url.pathname);
    if (hasExecutableExt)
        score += 25;
    indicators.push({
        name: 'Executable / Archive Extension Check',
        passed: !hasExecutableExt,
        scoreAdded: hasExecutableExt ? 25 : 0,
        details: hasExecutableExt ? 'Direct link to executable/archive payload in path' : 'No executable or archive file extension in path',
    });
    if (hasExecutableExt)
        flags.push('Executable/archive file extension in URL path');
    score = Math.min(score, 100);
    const verdict = score >= 70 ? 'malicious' : score >= 35 ? 'suspicious' : 'safe';
    if (flags.length === 0) {
        flags.push('No suspicious patterns detected');
    }
    return {
        score,
        verdict,
        flags,
        indicators,
        overview: {
            domain: hostname,
            protocol: url.protocol,
            path: url.pathname,
            search: url.search,
        },
    };
}
// POST /api/scan/url
const scanUrl = async (req, res) => {
    const schema = zod_1.z.object({
        url: zod_1.z.string().min(1).max(2048),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
    }
    const { url } = parsed.data;
    const mockResult = runMockUrlEngineDetailed(url);
    // Perform a basic server-side fetch (with 3500ms timeout) to derive real HTTP details
    let targetUrlString = url.startsWith('http') ? url : `https://${url}`;
    let pageStats = { reachable: false, statusCode: null, statusText: null, responseTimeMs: null };
    let headersObj = {};
    let webTech = [];
    let htmlInfo = { title: null, description: null };
    let favicon = null;
    let outboundLinks = [];
    let cookies = [];
    const startTime = Date.now();
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3500);
        const fetchRes = await fetch(targetUrlString, {
            method: 'GET',
            headers: { 'User-Agent': 'CyberShield-AI-Security-Auditor/1.0' },
            signal: controller.signal,
        });
        clearTimeout(timer);
        pageStats.responseTimeMs = Date.now() - startTime;
        pageStats.reachable = true;
        pageStats.statusCode = fetchRes.status;
        pageStats.statusText = fetchRes.statusText || String(fetchRes.status);
        // Extract headers
        fetchRes.headers.forEach((val, key) => {
            headersObj[key.toLowerCase()] = val;
            if (key.toLowerCase() === 'set-cookie') {
                cookies.push(val);
            }
        });
        // Extract Tech Hints from headers
        if (headersObj['server'])
            webTech.push(`Server: ${headersObj['server']}`);
        if (headersObj['x-powered-by'])
            webTech.push(`X-Powered-By: ${headersObj['x-powered-by']}`);
        // Parse HTML content if html
        const contentType = headersObj['content-type'] || '';
        if (contentType.includes('text/html')) {
            const htmlText = await fetchRes.text();
            // Title
            const titleMatch = htmlText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            if (titleMatch)
                htmlInfo.title = titleMatch[1].trim();
            // Description meta
            const descMatch = htmlText.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
            if (descMatch)
                htmlInfo.description = descMatch[1].trim();
            // Generator meta
            const genMatch = htmlText.match(/<meta\s+name=["']generator["']\s+content=["']([^"']+)["']/i);
            if (genMatch)
                webTech.push(`Generator: ${genMatch[1].trim()}`);
            // CMS signatures
            if (htmlText.includes('wp-content') || htmlText.includes('wp-includes'))
                webTech.push('WordPress CMS');
            if (htmlText.includes('_next/static'))
                webTech.push('Next.js Framework');
            // Favicon
            const iconMatch = htmlText.match(/<link\s+[^>]*rel=["'](?:shortcut )?icon["']\s+href=["']([^"']+)["']/i);
            if (iconMatch) {
                const iconHref = iconMatch[1];
                try {
                    favicon = new URL(iconHref, targetUrlString).href;
                }
                catch {
                    favicon = iconHref;
                }
            }
            // Outbound links
            const hrefMatches = htmlText.matchAll(/<a\s+[^>]*href=["'](https?:\/\/[^"']+)["']/gi);
            const linkSet = new Set();
            for (const m of hrefMatches) {
                if (linkSet.size < 10)
                    linkSet.add(m[1]);
            }
            outboundLinks = Array.from(linkSet);
        }
    }
    catch {
        pageStats.reachable = false;
        pageStats.statusText = 'Unreachable / Timeout';
    }
    if (webTech.length === 0) {
        webTech.push('Not detected');
    }
    // Lookup Scan History for Community tab (system-wide previous scans of this URL)
    const previousScans = await ScanHistory_1.default.find({ input: url })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('verdict riskScore createdAt');
    const communityScans = previousScans.map((s) => ({
        verdict: s.verdict || 'unknown',
        riskScore: s.riskScore ?? 0,
        date: s.createdAt.toISOString(),
    }));
    const firstScanDate = previousScans.length > 0 ? previousScans[previousScans.length - 1].createdAt.toISOString() : new Date().toISOString();
    // Save to scan history
    await ScanHistory_1.default.create({
        userId: req.userId,
        module: 'url',
        input: url,
        result: { score: mockResult.score, verdict: mockResult.verdict, flags: mockResult.flags },
        riskScore: mockResult.score,
        verdict: mockResult.verdict,
    });
    // Update today's dashboard stat
    await updateTodayStat(req.userId, { urlsScanned: 1, threatsDetected: mockResult.verdict !== 'safe' ? 1 : 0 });
    res.json({
        success: true,
        url,
        score: mockResult.score,
        verdict: mockResult.verdict,
        flags: mockResult.flags,
        indicators: mockResult.indicators,
        overview: mockResult.overview,
        pageStats,
        historyNote: { firstSeen: firstScanDate },
        webTech,
        details: {
            headers: headersObj,
            htmlInfo,
            favicon,
            outboundLinks,
            cookies,
            unsupportedNote: 'Not available (Requires headless browser JS execution environment — not executed by server-side heuristic engine)',
        },
        communityScans,
    });
};
exports.scanUrl = scanUrl;
const URGENCY_WORDS = [
    'urgent', 'immediately', 'action required', 'account suspended', 'verify now',
    'click here', 'limited time', 'expire', 'suspended', 'unauthorized', 'alert',
    'winner', 'prize', 'free', 'congratulations', 'selected',
];
const SUSPICIOUS_LINK_PATTERNS = [
    /http:\/\//i,
    /bit\.ly/i,
    /tinyurl/i,
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
    /xn--/i,
];
function runMockEmailEngine(rawEmail) {
    let score = 0;
    const flags = [];
    const text = rawEmail.toLowerCase();
    const extractedLinks = [];
    // Check 1: HTML Link Mismatch (Text shows brand/URL but href points to different domain)
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let linkMatch;
    let foundMismatched = false;
    while ((linkMatch = linkRegex.exec(rawEmail)) !== null) {
        const href = linkMatch[1].trim();
        const anchorText = linkMatch[2].replace(/<[^>]+>/g, '').trim();
        let mismatched = false;
        try {
            const hrefUrl = new URL(href.startsWith('http') ? href : `http://${href}`);
            const hrefDomain = hrefUrl.hostname.toLowerCase().replace(/^www\./, '');
            const textDomainMatch = anchorText.match(/(?:https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
            if (textDomainMatch) {
                const textDomain = textDomainMatch[1].toLowerCase().replace(/^www\./, '');
                if (textDomain && textDomain !== hrefDomain && !hrefDomain.endsWith('.' + textDomain)) {
                    mismatched = true;
                    foundMismatched = true;
                    flags.push(`Mismatched Hyperlink: Visible text displays "${textDomain}" but href targets "${hrefDomain}"`);
                }
            }
        }
        catch {
            // Ignore invalid URL structures
        }
        extractedLinks.push({ href, text: anchorText || href, mismatched });
    }
    if (foundMismatched) {
        score += 40;
    }
    // Check 2: Urgency / pressure language
    const urgencyHits = URGENCY_WORDS.filter((w) => text.includes(w));
    if (urgencyHits.length >= 3) {
        score += 30;
        flags.push(`High-urgency language: "${urgencyHits.slice(0, 3).join('", "')}"`);
    }
    else if (urgencyHits.length >= 1) {
        score += 10;
        flags.push(`Mild urgency language detected: "${urgencyHits[0]}"`);
    }
    // Check 3: Generic greeting (no personalization)
    if (/dear (customer|user|account holder|sir|madam)/i.test(rawEmail)) {
        score += 15;
        flags.push('Generic impersonal greeting (common in phishing)');
    }
    // Check 4: Suspicious links in body
    const suspLinks = SUSPICIOUS_LINK_PATTERNS.filter((p) => p.test(rawEmail));
    if (suspLinks.length > 0) {
        score += 25;
        flags.push('Suspicious link patterns detected (HTTP, IP-based, or shortener)');
    }
    // Check 5: Mismatched From header (basic heuristic)
    const fromMatch = rawEmail.match(/From:\s*([^\n<]+)?<([^>]+)>/i);
    if (fromMatch) {
        const displayName = (fromMatch[1] || '').toLowerCase().trim();
        const emailAddr = (fromMatch[2] || '').toLowerCase();
        const domain = emailAddr.split('@')[1] || '';
        const brandInDisplay = BRAND_NAMES.some((b) => displayName.includes(b));
        const brandInDomain = BRAND_NAMES.some((b) => domain.includes(b));
        if (brandInDisplay && !brandInDomain) {
            score += 35;
            flags.push('Display name impersonates a brand but domain does not match');
        }
    }
    // Check 6: Excessive exclamation marks / ALL CAPS
    const capsWordCount = (rawEmail.match(/\b[A-Z]{4,}\b/g) || []).length;
    if (capsWordCount > 5) {
        score += 10;
        flags.push('Excessive use of ALL CAPS words');
    }
    // Check 7: Request for personal information
    if (/(password|ssn|social security|credit card|cvv|bank account|pin number)/i.test(rawEmail)) {
        score += 30;
        flags.push('Requests sensitive personal or financial information');
    }
    // Check 8: Attachment references with dangerous extensions
    if (/\.(exe|bat|zip|js|vbs|docm|xlsm)/i.test(rawEmail)) {
        score += 25;
        flags.push('References potentially dangerous file attachment types');
    }
    score = Math.min(score, 100);
    const verdict = score >= 70
        ? 'phishing'
        : score >= 50
            ? 'malicious'
            : score >= 25
                ? 'spam'
                : 'clean';
    const confidence = Math.min(50 + score / 2, 99);
    if (flags.length === 0) {
        flags.push('No phishing or spam indicators detected');
    }
    return { verdict, confidence: Math.round(confidence), flags, extractedLinks };
}
// POST /api/scan/email
const scanEmail = async (req, res) => {
    const schema = zod_1.z.object({
        emailText: zod_1.z.string().min(10).max(50000),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
    }
    // XSS-sanitize before processing (though result is not rendered as HTML)
    const sanitizedEmail = (0, xss_1.default)(parsed.data.emailText);
    const result = runMockEmailEngine(sanitizedEmail);
    await ScanHistory_1.default.create({
        userId: req.userId,
        module: 'email',
        input: sanitizedEmail.substring(0, 500), // Store only first 500 chars
        result,
        riskScore: result.confidence,
        verdict: result.verdict,
    });
    await updateTodayStat(req.userId, {
        emailsAnalyzed: 1,
        threatsDetected: result.verdict !== 'clean' ? 1 : 0,
    });
    res.json({ success: true, ...result });
};
exports.scanEmail = scanEmail;
// Utility: increment today's stat document
async function updateTodayStat(userId, increments) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inc = {};
    for (const [key, val] of Object.entries(increments)) {
        if (val)
            inc[key] = val;
    }
    await DashboardStat_1.default.findOneAndUpdate({ userId, date: today }, { $inc: inc }, { upsert: true, new: true });
}
