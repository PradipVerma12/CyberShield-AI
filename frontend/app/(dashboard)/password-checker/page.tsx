'use client';
import { useState } from 'react';
import { KeyRound, ShieldCheck, Copy, RefreshCw, Check, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PasswordCheckerPage() {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [genLength, setGenLength] = useState(16);

  // Criteria checks
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password),
  };

  const passedCount = Object.values(checks).filter(Boolean).length;

  // Calculate entropy (bits) = L * log2(R)
  const calculateEntropy = (pwd: string): number => {
    if (!pwd) return 0;
    let poolSize = 0;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^A-Za-z0-9]/.test(pwd)) poolSize += 32;
    if (poolSize === 0) return 0;
    return Math.round(pwd.length * Math.log2(poolSize));
  };

  const entropy = calculateEntropy(password);

  const getStrengthTier = () => {
    if (entropy === 0) return { label: 'None', color: 'text-gray-500', bg: 'bg-gray-500/20', pct: 0 };
    if (entropy < 40) return { label: 'Very Weak', color: 'text-red-500', bg: 'bg-red-500', pct: 20 };
    if (entropy < 60) return { label: 'Weak', color: 'text-amber-500', bg: 'bg-amber-500', pct: 40 };
    if (entropy < 80) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-400', pct: 65 };
    if (entropy < 100) return { label: 'Strong', color: 'text-emerald-400', bg: 'bg-emerald-400', pct: 85 };
    return { label: 'Very Strong', color: 'text-blue-400', bg: 'bg-blue-500', pct: 100 };
  };

  const tier = getStrengthTier();

  // Secure generator using Web Crypto API
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const array = new Uint32Array(genLength);
    crypto.getRandomValues(array);
    let pwd = '';
    for (let i = 0; i < genLength; i++) {
      pwd += chars[array[i] % chars.length];
    }
    setPassword(pwd);
    toast.success('Generated cryptographically secure password');
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card p-6 border border-white/5 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <KeyRound className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Password Entropy & Strength Auditor
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Client-side entropy calculation and CSPRNG password generator. Passwords never touch the network.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Auditor Input */}
        <div className="lg:col-span-2 glass-card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Audit Password</h2>

          {/* Password Input Box */}
          <div className="relative">
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type or generate a password to inspect entropy..."
              className="input-field text-lg font-mono tracking-wide pr-12"
            />
            {password && (
              <button
                onClick={handleCopy}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
                title="Copy password"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Strength Bar & Entropy score */}
          {password && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Strength: <strong className={tier.color}>{tier.label}</strong></span>
                <span className="text-gray-400 font-mono">Entropy: <strong className="text-white">{entropy} bits</strong></span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${tier.bg}`}
                  style={{ width: `${tier.pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Criteria Checklist */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <p className="text-xs font-medium text-gray-400 mb-3">Security Requirements Checklist:</p>
            {[
              { label: 'At least 12 characters long', ok: checks.length },
              { label: 'Contains uppercase letter (A-Z)', ok: checks.uppercase },
              { label: 'Contains lowercase letter (a-z)', ok: checks.lowercase },
              { label: 'Contains numeric digit (0-9)', ok: checks.numbers },
              { label: 'Contains special character (!@#$...)', ok: checks.symbols },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-xs">
                {item.ok ? (
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-gray-600 flex-shrink-0" />
                )}
                <span className={item.ok ? 'text-gray-200 font-medium' : 'text-gray-500'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-gray-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <span>
              Passwords with entropy &gt; 80 bits require over 100 years of brute-force attack time on standard modern compute clusters.
            </span>
          </div>
        </div>

        {/* Right Column: CSPRNG Generator */}
        <div className="glass-card p-6 space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-400" /> Password Generator
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Character Length:</span>
                  <span className="font-mono text-white font-bold">{genLength}</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={genLength}
                  onChange={(e) => setGenLength(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <button
                onClick={generatePassword}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Generate Secure Password
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-400">Zero-Knowledge Guarantee</p>
            <p>Calculations occur strictly in browser memory using Web Crypto API. No data is stored or transmitted.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
