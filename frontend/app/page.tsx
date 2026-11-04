'use client';

import { useRouter } from 'next/navigation';
import { Shield, Lock, Search, Server, FileText, ArrowRight, CheckCircle2, Zap, Terminal, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#090B14] text-white selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#090B14]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">CyberShield AI</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#modules" className="hover:text-white transition-colors">Modules</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Autonomous Threat Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400">
            Enterprise Cybersecurity Powered by Real-Time AI Telemetry
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Scan URLs, analyze email headers, audit port vulnerabilities, check password exposure, and encrypt sensitive assets — all within a unified zero-trust dashboard.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Launch Console <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#modules"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 font-bold text-base transition-all"
            >
              Explore Modules
            </a>
          </div>

          {/* Code/Terminal Preview graphic */}
          <div className="mt-16 max-w-4xl mx-auto rounded-3xl border border-white/10 bg-gray-900/90 shadow-2xl p-4 text-left font-mono text-xs text-gray-300 backdrop-blur-2xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-gray-500 text-xs ml-2">cybershield-engine v2.4.0 -- live scan</span>
            </div>
            <div className="space-y-1 px-2 text-gray-300">
              <p className="text-blue-400">$ cybershield scan --target https://example-suspicious-login.com</p>
              <p className="text-gray-400">[+] Resolving target IP address... 104.21.55.19</p>
              <p className="text-gray-400">[+] Querying threat feeds & AI heuristics engine...</p>
              <p className="text-yellow-400">[!] Detected Phishing Kit pattern (Score: 88/100 - CRITICAL)</p>
              <p className="text-green-400">[✓] Threat response deployed: Domain blocked, alert dispatched to SOC.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Modules Grid */}
      <section id="modules" className="py-24 bg-gray-950/60 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">All-in-One Security Suite</h2>
            <p className="mt-4 text-gray-400">Comprehensive detection and mitigation modules built for modern SOC teams.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all hover:bg-white/[0.04]">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">URL Detector</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Scan suspicious links for malware, phishing attempts, domain age anomalies, and malicious redirects.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all hover:bg-white/[0.04]">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email Analyzer</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Analyze email headers, SPF/DKIM/DMARC records, and email body for BEC and spoofing indicators.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all hover:bg-white/[0.04]">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Port Scanner</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Inspect public IP addresses or target hosts for open ports and vulnerable listening services.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-orange-500/30 transition-all hover:bg-white/[0.04]">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">File Encryption</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Zero-knowledge client-side AES-256-GCM file encryption and decryption right inside your browser.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-pink-500/30 transition-all hover:bg-white/[0.04]">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Password Auditor</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Audit password complexity entropy and check credentials against global breach databases.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all hover:bg-white/[0.04]">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Executive Reports</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Generate and export presentation-ready PDF and CSV security executive summaries with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Flexible Security Pricing</h2>
            <p className="mt-4 text-gray-400">Deploy immediately with transparent plans tailored to your infrastructure scale.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-gray-900/60 border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-300">Starter</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-sm text-gray-400">/month</span>
                </div>
                <p className="mt-4 text-xs text-gray-400">Perfect for individual developers & security enthusiasts.</p>
                <ul className="mt-6 space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Up to 50 scans / month</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Basic URL & Email scanner</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Standard encryption tool</li>
                </ul>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="mt-8 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
              >
                Start Free
              </button>
            </div>

            <div className="p-8 rounded-3xl bg-blue-950/40 border-2 border-blue-500/50 relative flex flex-col justify-between shadow-2xl shadow-blue-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Pro SOC</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$49</span>
                  <span className="text-sm text-gray-400">/month</span>
                </div>
                <p className="mt-4 text-xs text-gray-400">Designed for growing security teams & IT operations.</p>
                <ul className="mt-6 space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Unlimited automated scans</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Full Port & Service audit</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Executive PDF/CSV exports</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> 2FA & strict data isolation</li>
                </ul>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="mt-8 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/25"
              >
                Get Started
              </button>
            </div>

            <div className="p-8 rounded-3xl bg-gray-900/60 border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-300">Enterprise</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$199</span>
                  <span className="text-sm text-gray-400">/month</span>
                </div>
                <p className="mt-4 text-xs text-gray-400">Dedicated compliance and high-throughput security APIs.</p>
                <ul className="mt-6 space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Everything in Pro</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Dedicated API endpoint</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Custom SIEM integration</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> 24/7 Priority Incident SLA</li>
                </ul>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="mt-8 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-gray-300">CyberShield AI</span>
            <span>© 2026 CyberShield SaaS, Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/login" className="hover:text-gray-300">Terms of Service</Link>
            <Link href="/login" className="hover:text-gray-300">Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
