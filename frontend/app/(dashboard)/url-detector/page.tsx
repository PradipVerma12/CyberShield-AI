'use client';

import { useState } from 'react';
import {
  Link2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Server,
  Layers,
  FileText,
  History,
  Lock,
  ExternalLink,
  Code,
  Cookie,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { scanService } from '@/services/api';
import { UrlScanResult } from '@/types';
import { getVerdictBg, formatDate } from '@/lib/utils';

export default function UrlDetectorPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlScanResult | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'detection' | 'details' | 'community'>('summary');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await scanService.scanUrl(url);
      if (res.data.success) {
        setResult(res.data);
        setActiveTab('summary');
        toast.success('URL analysis complete');
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('scanCompleted'));
      }
    } catch {
      toast.error('Failed to analyze URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Link2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Malicious URL &amp; Typosquatting Detector
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Inspect suspicious links, punycode domains, IP-based hosts, and phishing patterns.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Info className="w-3.5 h-3.5" /> Heuristic / Demo Engine
        </span>
      </div>

      {/* Search Input Box */}
      <div className="glass-card p-6 border border-white/5">
        <form onSubmit={handleScan} className="space-y-4">
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Target URL to Analyze
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com or http://192.168.1.1/login..."
                className="input-field pl-10 w-full font-mono text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 min-w-[140px]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Scan URL <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick preset links */}
          <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
            <span>Test examples:</span>
            {[
              'https://paypa1-secure-login.verify-account.com/signin',
              'https://bit.ly/3xKp2mN',
              'https://github.com/microsoft/vscode',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setUrl(preset)}
                className="text-blue-400 hover:underline truncate max-w-[200px]"
              >
                {preset.replace('https://', '')}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Structured Results Card */}
      {result && (
        <div className="glass-card p-6 border border-white/5 space-y-6">
          {/* Verdict Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Analysis Result</p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-1 rounded-xl text-sm font-bold capitalize ${getVerdictBg(result.verdict)}`}>
                  {result.verdict}
                </span>
                <span className="text-sm font-mono text-gray-300">
                  Risk Score: <strong className="text-white text-base">{result.score}/100</strong>
                </span>
              </div>
            </div>

            {/* Risk Gauge Bar */}
            <div className="w-full sm:w-48 bg-white/5 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  result.score >= 70 ? 'bg-red-500' : result.score >= 35 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(result.score, 5)}%` }}
              />
            </div>
          </div>

          {/* Four Structured Result Tabs */}
          <div className="flex border-b border-white/5 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2.5 border-b-2 font-sans transition-colors whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('detection')}
              className={`px-4 py-2.5 border-b-2 font-sans transition-colors whitespace-nowrap ${
                activeTab === 'detection'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Detection ({result.indicators?.length || result.flags.length})
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2.5 border-b-2 font-sans transition-colors whitespace-nowrap ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2.5 border-b-2 font-sans transition-colors whitespace-nowrap ${
                activeTab === 'community'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Community ({result.communityScans?.length || 0})
            </button>
          </div>

          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Page Stats & Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Page Stats */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" /> Page Stats (Server-side Probe)
                  </h3>
                  <div className="space-y-2 font-mono">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400 font-sans">Reachability</span>
                      <span className={result.pageStats?.reachable ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {result.pageStats?.reachable ? 'Reachable' : 'Unreachable / Timeout'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400 font-sans">HTTP Status Code</span>
                      <span className="text-white font-bold">
                        {result.pageStats?.statusCode ? `${result.pageStats.statusCode} (${result.pageStats.statusText})` : 'Not applicable'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-400 font-sans">Response Latency</span>
                      <span className="text-white font-bold">
                        {result.pageStats?.responseTimeMs ? `${result.pageStats.responseTimeMs} ms` : 'Not applicable'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* URL Overview */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" /> URL Overview
                  </h3>
                  <div className="space-y-2 font-mono">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400 font-sans">Domain Hostname</span>
                      <span className="text-white font-bold truncate max-w-[200px]">{result.overview?.domain || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400 font-sans">Protocol</span>
                      <span className="text-white font-bold">{result.overview?.protocol || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-400 font-sans">Path &amp; Query</span>
                      <span className="text-gray-300 truncate max-w-[200px]">{result.overview?.path || '/'}{result.overview?.search || ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Web Technology & System History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Web Tech */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" /> Web Technology Hints
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {result.webTech && result.webTech.length > 0 ? (
                      result.webTech.map((tech, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 text-gray-200 border border-white/5 font-mono">
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic">Not detected</span>
                    )}
                  </div>
                </div>

                {/* System History Note */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400" /> System Scan History Note
                  </h3>
                  <p className="text-gray-300">
                    First recorded scan in our database:{' '}
                    <strong className="text-white font-mono">
                      {result.historyNote?.firstSeen ? formatDate(result.historyNote.firstSeen) : 'Today'}
                    </strong>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Note: Shows history recorded strictly within our CyberShield system database.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETECTION (Heuristic Risk Indicators) */}
          {activeTab === 'detection' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Heuristic Risk Indicators ({result.indicators?.length || 0})
                </h3>
                <span className="text-[11px] text-gray-400">
                  Label: Offline rule heuristics engine (No 3rd-party vendor APIs)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase font-sans">
                      <th className="py-2.5 px-3">Indicator Check</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Risk Contribution</th>
                      <th className="py-2.5 px-3">Diagnostic Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {result.indicators && result.indicators.length > 0 ? (
                      result.indicators.map((ind, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3 font-sans font-semibold text-white">{ind.name}</td>
                          <td className="py-3 px-3">
                            {ind.passed ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-sans font-semibold border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> PASSED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-400 font-sans font-semibold border border-red-500/20">
                                <XCircle className="w-3 h-3" /> FLAGGED
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-bold">
                            {ind.scoreAdded > 0 ? (
                              <span className="text-red-400">+{ind.scoreAdded} pts</span>
                            ) : (
                              <span className="text-gray-500">0 pts</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-gray-300 font-sans">{ind.details}</td>
                        </tr>
                      ))
                    ) : (
                      result.flags.map((flag, idx) => (
                        <tr key={idx}>
                          <td className="py-3 px-3 text-white font-sans">Rule #{idx + 1}</td>
                          <td className="py-3 px-3 text-red-400">FLAGGED</td>
                          <td className="py-3 px-3">—</td>
                          <td className="py-3 px-3 text-gray-300">{flag}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6 text-xs">
              {/* Derivable HTTP Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* HTTP Headers */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-400" /> Server HTTP Response Headers
                  </h3>
                  {result.details?.headers && Object.keys(result.details.headers).length > 0 ? (
                    <div className="space-y-1.5 font-mono max-h-48 overflow-y-auto pr-1">
                      {Object.entries(result.details.headers).map(([k, v]) => (
                        <div key={k} className="flex flex-col py-1 border-b border-white/5">
                          <span className="text-blue-400 font-bold">{k}:</span>
                          <span className="text-gray-300 break-all">{v}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Not available (Target server unreachable or headers restricted)</p>
                  )}
                </div>

                {/* HTML & Favicon Info */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" /> HTML Info &amp; Meta Tags
                  </h3>
                  <div className="space-y-2 font-mono">
                    <div className="py-1 border-b border-white/5">
                      <span className="text-gray-400 font-sans block">Page Title (&lt;title&gt;):</span>
                      <span className="text-white font-bold">{result.details?.htmlInfo?.title || 'Not available'}</span>
                    </div>
                    <div className="py-1 border-b border-white/5">
                      <span className="text-gray-400 font-sans block">Meta Description:</span>
                      <span className="text-gray-300">{result.details?.htmlInfo?.description || 'Not available'}</span>
                    </div>
                    <div className="py-1">
                      <span className="text-gray-400 font-sans block">Favicon:</span>
                      {result.details?.favicon ? (
                        <a href={result.details.favicon} target="_blank" rel="noreferrer" className="text-blue-400 underline truncate block">
                          {result.details.favicon}
                        </a>
                      ) : (
                        <span className="text-gray-500 italic">Not available</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookies & Outbound Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Outbound Links */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-emerald-400" /> External Outbound Links
                  </h3>
                  {result.details?.outboundLinks && result.details.outboundLinks.length > 0 ? (
                    <div className="space-y-1 font-mono max-h-36 overflow-y-auto pr-1">
                      {result.details.outboundLinks.map((link, idx) => (
                        <a key={idx} href={link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate block py-0.5">
                          {link}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Not available / None found</p>
                  )}
                </div>

                {/* Cookies */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Cookie className="w-4 h-4 text-amber-400" /> Set-Cookie Headers
                  </h3>
                  {result.details?.cookies && result.details.cookies.length > 0 ? (
                    <div className="space-y-1 font-mono max-h-36 overflow-y-auto pr-1">
                      {result.details.cookies.map((c, idx) => (
                        <p key={idx} className="text-gray-300 break-all py-0.5">{c}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Not available (No Set-Cookie header returned)</p>
                  )}
                </div>
              </div>

              {/* Clear notice for browser-only features */}
              <div className="p-4 rounded-xl bg-gray-500/5 border border-white/10 space-y-1">
                <p className="font-bold text-gray-300">Browser Environment Note (Data Honesty Guarantee)</p>
                <p className="text-gray-400">
                  {result.details?.unsupportedNote || 'Not available (Requires headless browser JS execution environment — not executed by server-side heuristic engine)'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: COMMUNITY (System Scan History for this URL) */}
          {activeTab === 'community' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  System Scan History for this URL
                </h3>
                <span className="text-[11px] text-gray-400">Recorded scans by any user in CyberShield system</span>
              </div>

              {result.communityScans && result.communityScans.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 uppercase font-sans">
                        <th className="py-2.5 px-3">Scan Date</th>
                        <th className="py-2.5 px-3">Verdict</th>
                        <th className="py-2.5 px-3">Risk Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {result.communityScans.map((cs, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3 text-gray-300">{formatDate(cs.date)}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize font-sans ${getVerdictBg(cs.verdict)}`}>
                              {cs.verdict}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-white font-bold">{cs.riskScore}/100</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 font-sans">
                  No previous scans found for this URL in system database.
                </div>
              )}
            </div>
          )}

          <div className="p-3 rounded-xl bg-gray-500/5 border border-white/5 text-xs text-gray-400">
            <span className="font-semibold text-gray-300">Notice:</span> This analysis is executed using CyberShield's offline regex &amp; structural heuristic engine plus a basic server-side HTTP probe. No fake third-party vendor metrics are rendered.
          </div>
        </div>
      )}
    </div>
  );
}
