'use client';

import { useState } from 'react';
import { Mail, AlertCircle, ArrowRight, CheckCircle2, Info, Upload, FileText, Link2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { scanService } from '@/services/api';
import { EmailScanResult } from '@/types';
import { getVerdictBg } from '@/lib/utils';

export default function EmailAnalyzerPage() {
  const [inputMode, setInputMode] = useState<'paste' | 'file'>('paste');
  const [emailText, setEmailText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailScanResult | null>(null);

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.eml') && !file.name.endsWith('.txt')) {
      toast.error('Only .eml and .txt files are supported');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setEmailText(content);
        setFileName(file.name);
        toast.success(`Loaded file: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailText.trim() || emailText.length < 10) {
      toast.error('Please provide raw email content or upload a valid file (min 10 characters)');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await scanService.scanEmail(emailText);
      if (res.data.success) {
        setResult(res.data);
        toast.success('Email threat classification complete');
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('scanCompleted'));
      }
    } catch {
      toast.error('Failed to analyze email content');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (type: 'phishing' | 'clean' | 'mismatched') => {
    if (type === 'phishing') {
      setEmailText(
        `From: PayPal Security <noreply@payp4l-security-alert.net>\nTo: target@company.com\nSubject: URGENT: Your account has been suspended!\n\nDear Customer,\n\nWe detected suspicious activity on your PayPal account. You must verify your identity immediately or your account will be permanently closed within 24 hours.\n\nPlease click here immediately to restore access: http://bit.ly/paypal-verify-now\n\nThank you,\nPayPal Security Team`
      );
      setFileName(null);
    } else if (type === 'mismatched') {
      setEmailText(
        `From: Security Alert <alert@security-update-center.com>\nTo: user@company.com\nSubject: URGENT: Verify your PayPal credentials\n\nDear Customer,\n\nPlease click the link below to verify your account:\n<a href="http://malicious-phishing-target.net/login">https://paypal.com/signin/verify</a>\n\nThank you.`
      );
      setFileName('phishing-mismatch-sample.eml');
    } else {
      setEmailText(
        `From: Sarah Connor <sarah@acme-corp.com>\nTo: alex@company.com\nSubject: Q3 Security Audit Presentation\n\nHi Alex,\n\nI have attached the updated slides for tomorrow's security audit review meeting. Let me know if you have any feedback before 3 PM.\n\nBest regards,\nSarah Connor`
      );
      setFileName(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Email Phishing &amp; Header Analyzer
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Classify urgency language, display name spoofing, link text vs. href mismatches, and phishing indicators.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Info className="w-3.5 h-3.5" /> Heuristic Classifier
        </span>
      </div>

      {/* Input Form */}
      <div className="glass-card p-6 border border-white/5 space-y-5">
        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setInputMode('paste')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                inputMode === 'paste' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Paste Email Text
            </button>
            <button
              type="button"
              onClick={() => setInputMode('file')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                inputMode === 'file' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload File (.eml, .txt)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Load sample:</span>
            <button
              type="button"
              onClick={() => loadSample('mismatched')}
              className="text-amber-400 hover:underline font-medium"
            >
              Mismatched .eml
            </button>
            <span className="text-gray-600">|</span>
            <button
              type="button"
              onClick={() => loadSample('phishing')}
              className="text-red-400 hover:underline font-medium"
            >
              Phishing
            </button>
            <span className="text-gray-600">|</span>
            <button
              type="button"
              onClick={() => loadSample('clean')}
              className="text-emerald-400 hover:underline font-medium"
            >
              Clean
            </button>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          {inputMode === 'file' ? (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-2xl p-6 text-center transition-colors relative bg-white/[0.01]">
                <input
                  type="file"
                  accept=".eml,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-blue-400" />
                  {fileName ? (
                    <div>
                      <p className="text-sm font-bold text-blue-400">{fileName}</p>
                      <p className="text-xs text-gray-400 mt-1">Click or drag another file to replace</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-300 font-medium">
                        Drag and drop <code>.eml</code> or <code>.txt</code> email file here, or <span className="text-blue-400 underline">browse</span>
                      </p>
                      <p className="text-xs text-gray-500">Extracts raw headers, HTML body tags, and hidden hyperlink targets</p>
                    </>
                  )}
                </div>
              </div>

              {emailText && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Raw File Contents Preview
                  </label>
                  <textarea
                    rows={6}
                    value={emailText}
                    onChange={(e) => setEmailText(e.target.value)}
                    className="input-field w-full font-mono text-xs resize-y"
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Raw Email Source / Headers &amp; HTML
              </label>
              <textarea
                rows={8}
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Paste raw email body, headers, or HTML source code here..."
                className="input-field w-full font-mono text-xs resize-y"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2 min-w-[160px]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Analyze Email <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Box */}
      {result && (
        <div className="glass-card p-6 border border-white/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Classifier Verdict</p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-1 rounded-xl text-sm font-bold capitalize ${getVerdictBg(result.verdict)}`}>
                  {result.verdict}
                </span>
                <span className="text-sm font-mono text-gray-300">
                  Confidence Score: <strong className="text-white text-base">{result.confidence}%</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Threat Indicators */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Identified Threat Factors ({result.flags.length})
            </h3>
            <div className="space-y-2">
              {result.flags.map((flag, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-sm"
                >
                  {result.verdict === 'clean' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <span className="text-gray-200">{flag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Links & Mismatch Analysis */}
          {result.extractedLinks && result.extractedLinks.length > 0 && (
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-400" /> Extracted Hyperlinks &amp; Href Mismatch Audit ({result.extractedLinks.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {result.extractedLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                      link.mismatched
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-white/[0.02] border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-sans">Anchor Text: <strong className="text-white font-mono">{link.text}</strong></span>
                      {link.mismatched ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          MISMATCHED DOMAIN
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          MATCHED
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 truncate flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      <span>Actual href:</span>
                      <span className={link.mismatched ? 'text-red-300 font-bold' : 'text-gray-300'}>{link.href}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
