export type VerdictType = 'safe' | 'suspicious' | 'malicious' | 'phishing' | 'spam' | 'clean' | 'strong' | 'weak' | 'moderate';

export interface HeuristicIndicator {
  name: string;
  passed: boolean;
  scoreAdded: number;
  details: string;
}

export interface UrlScanResult {
  score: number;
  verdict: 'safe' | 'suspicious' | 'malicious';
  flags: string[];
  url?: string;
  indicators?: HeuristicIndicator[];
  overview?: { domain: string; protocol: string; path: string; search: string };
  pageStats?: { reachable: boolean; statusCode: number | null; statusText: string | null; responseTimeMs: number | null };
  historyNote?: { firstSeen: string };
  webTech?: string[];
  details?: {
    headers: Record<string, string>;
    htmlInfo: { title: string | null; description: string | null };
    favicon: string | null;
    outboundLinks: string[];
    cookies: string[];
    unsupportedNote: string;
  };
  communityScans?: { verdict: string; riskScore: number; date: string }[];
}

export interface EmailScanResult {
  verdict: 'clean' | 'spam' | 'phishing' | 'malicious';
  confidence: number;
  flags: string[];
  extractedLinks?: { href: string; text: string; mismatched: boolean }[];
}

export interface PortResult {
  port: number;
  status: 'open' | 'closed';
  service: string;
}

export interface PortScanResult {
  target: string;
  isLocalhost: boolean;
  warning: string | null;
  results: PortResult[];
  summary: { total: number; open: number; closed: number };
}

export interface ScanHistoryItem {
  _id: string;
  module: string;
  verdict?: string;
  riskScore?: number;
  input: string;
  createdAt: string;
}

export interface DashboardStats {
  totals: {
    threatsDetected: number;
    urlsScanned: number;
    emailsAnalyzed: number;
    portsScanned: number;
    filesEncrypted: number;
  };
  threatLandscape: { date: string; threats: number; urls: number; emails: number }[];
  urlDistribution: { safe: number; suspicious: number; malicious: number };
  weeklyThreats: { day: string; threats: number }[];
  lastScan: { time: string; module: string } | null;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}
