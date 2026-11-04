'use client';
import { useState } from 'react';
import { Server, AlertTriangle, Shield, Check, X, ArrowRight, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { scanService } from '@/services/api';
import { PortScanResult } from '@/types';

const POPULAR_PORTS = [
  { port: 21, service: 'FTP' },
  { port: 22, service: 'SSH' },
  { port: 25, service: 'SMTP' },
  { port: 53, service: 'DNS' },
  { port: 80, service: 'HTTP' },
  { port: 443, service: 'HTTPS' },
  { port: 3000, service: 'Node Dev' },
  { port: 3306, service: 'MySQL' },
  { port: 5000, service: 'Flask/API' },
  { port: 5432, service: 'PostgreSQL' },
  { port: 6379, service: 'Redis' },
  { port: 8080, service: 'HTTP Proxy' },
  { port: 27017, service: 'MongoDB' },
];

export default function PortScannerPage() {
  const [target, setTarget] = useState('localhost');
  const [selectedPorts, setSelectedPorts] = useState<number[]>([22, 80, 443, 3000, 3306, 5000, 8080, 27017]);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortScanResult | null>(null);

  const togglePort = (port: number) => {
    if (selectedPorts.includes(port)) {
      if (selectedPorts.length <= 1) return;
      setSelectedPorts(selectedPorts.filter((p) => p !== port));
    } else {
      setSelectedPorts([...selectedPorts, port].sort((a, b) => a - b));
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) {
      toast.error('Please enter a target hostname or IP address');
      return;
    }
    if (!consent) {
      toast.error('You must acknowledge consent before initiating a port scan');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await scanService.scanPorts(target, selectedPorts, true);
      if (res.data.success) {
        setResult(res.data);
        toast.success('Port scan completed');
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('scanCompleted'));
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Port scan failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Safety Constraint Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-amber-200">Mandatory Authorization &amp; Safety Constraint</p>
          <p>
            Unapproved port scanning may violate local regulations or terms of service. By default, scans target <code>127.0.0.1 / localhost</code>. Scanning remote targets requires explicit authorization confirmation below.
          </p>
        </div>
      </div>

      {/* Main Scan Form Card */}
      <div className="glass-card p-6 border border-white/5 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <Server className="w-6 h-6 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Network Port Auditor (TCP Probe)</h2>
        </div>

        <form onSubmit={handleScan} className="space-y-5">
          {/* Target Host */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Target IP / Hostname
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="localhost or 127.0.0.1"
              className="input-field max-w-md font-mono"
            />
          </div>

          {/* Port Selection Grid */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Select Ports to Audit ({selectedPorts.length} selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {POPULAR_PORTS.map(({ port, service }) => {
                const active = selectedPorts.includes(port);
                return (
                  <button
                    key={port}
                    type="button"
                    onClick={() => togglePort(port)}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex flex-col items-center justify-center ${
                      active
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold'
                        : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span>Port {port}</span>
                    <span className="text-[10px] text-gray-500 font-sans font-normal">{service}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
            <label htmlFor="consent" className="text-xs text-gray-300 cursor-pointer select-none">
              <strong className="text-white">Authorization Consent:</strong> I confirm I am the owner or have explicit written authorization to probe open TCP ports on <code>{target || 'the target'}</code>.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !consent}
            className="btn-primary px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 min-w-[160px]"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Execute Port Audit <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Display */}
      {result && (
        <div className="glass-card p-6 border border-white/5 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Audit Target</p>
              <h3 className="text-lg font-bold font-mono text-white mt-0.5">{result.target}</h3>
            </div>
            <div className="flex gap-3 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Open: {result.summary.open}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-gray-500/10 text-gray-400 border border-gray-500/20">
                Closed: {result.summary.closed}
              </span>
            </div>
          </div>

          {result.warning && (
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              {result.warning}
            </div>
          )}

          {/* Port status table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 uppercase font-sans">
                  <th className="py-2.5 px-3">Port</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {result.results.map((r) => (
                  <tr key={r.port} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-white font-bold">{r.port}</td>
                    <td className="py-3 px-3 text-gray-300 font-sans">{r.service}</td>
                    <td className="py-3 px-3">
                      {r.status === 'open' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-sans font-semibold border border-emerald-500/20">
                          <Check className="w-3 h-3" /> OPEN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gray-500/10 text-gray-400 font-sans border border-gray-500/20">
                          <X className="w-3 h-3" /> CLOSED / FILTERED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
