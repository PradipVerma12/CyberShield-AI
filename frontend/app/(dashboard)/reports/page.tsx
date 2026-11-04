'use client';
import { useState, useRef, useEffect } from 'react';
import { FileBarChart, Download, FileText, Printer, CheckCircle, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { scanService } from '@/services/api';
import { ScanHistoryItem } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ReportsPage() {
  const [items, setItems] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await scanService.getHistory({ limit: 50 });
        if (res.data.success) {
          setItems(res.data.items);
        }
      } catch {
        toast.error('Failed to load telemetry for report generation');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Export PDF using direct vector jsPDF builder (robust, high performance, zero DOM/canvas failures)
  const exportPDF = async () => {
    toast.loading('Generating Executive PDF report...', { id: 'pdf-toast' });
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let y = 20;

      // Theme Colors
      const blueColor: [number, number, number] = [59, 130, 246];
      const emeraldColor: [number, number, number] = [16, 185, 129];
      const redColor: [number, number, number] = [239, 68, 68];
      const lightTextColor: [number, number, number] = [241, 245, 249];
      const mutedTextColor: [number, number, number] = [148, 163, 184];

      // Page background (#0F172A)
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Title Banner Accent Line
      pdf.setFillColor(...blueColor);
      pdf.rect(margin, y, 4, 16, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(...lightTextColor);
      pdf.text('CyberShield AI', margin + 8, y + 7);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...mutedTextColor);
      pdf.text('Executive Security Audit & Telemetry Report', margin + 8, y + 14);

      // Report Metadata (Right Aligned)
      pdf.setFontSize(9);
      pdf.setTextColor(...mutedTextColor);
      pdf.text(`Generated: ${formatDate(new Date())}`, pageWidth - margin, y + 6, { align: 'right' });
      pdf.text(`Scope: Last ${items.length} Scans`, pageWidth - margin, y + 12, { align: 'right' });

      y += 26;

      // Divider Line
      pdf.setDrawColor(51, 65, 85);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);

      y += 10;

      // Executive Summary Metrics (3 Boxes)
      const boxWidth = (pageWidth - margin * 2 - 10) / 3;
      const boxHeight = 22;

      // Box 1: Total Scans
      pdf.setFillColor(30, 41, 59);
      pdf.roundedRect(margin, y, boxWidth, boxHeight, 3, 3, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(...mutedTextColor);
      pdf.text('TOTAL SCANS AUDITED', margin + 6, y + 7);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...lightTextColor);
      pdf.text(String(items.length), margin + 6, y + 16);

      // Box 2: Clean Verdicts
      pdf.setFillColor(6, 78, 59);
      pdf.roundedRect(margin + boxWidth + 5, y, boxWidth, boxHeight, 3, 3, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(167, 243, 208);
      pdf.text('CLEAN / SAFE VERDICTS', margin + boxWidth + 11, y + 7);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...emeraldColor);
      pdf.text(String(safeCount), margin + boxWidth + 11, y + 16);

      // Box 3: Threats Flagged
      pdf.setFillColor(127, 29, 29);
      pdf.roundedRect(margin + (boxWidth + 5) * 2, y, boxWidth, boxHeight, 3, 3, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(254, 202, 202);
      pdf.text('THREATS FLAGGED', margin + (boxWidth + 5) * 2 + 6, y + 7);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...redColor);
      pdf.text(String(maliciousCount), margin + (boxWidth + 5) * 2 + 6, y + 16);

      y += boxHeight + 15;

      // Section Header
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...lightTextColor);
      pdf.text('AUDITED TELEMETRY LOG ENTRIES', margin, y);

      y += 6;

      // Table Header Row
      pdf.setFillColor(30, 41, 59);
      pdf.rect(margin, y, pageWidth - margin * 2, 8, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...mutedTextColor);
      pdf.text('MODULE', margin + 4, y + 5.5);
      pdf.text('PAYLOAD / TARGET', margin + 35, y + 5.5);
      pdf.text('VERDICT', margin + 125, y + 5.5);
      pdf.text('RISK SCORE', margin + 160, y + 5.5);

      y += 10;

      // Table Data Rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);

      items.forEach((item, idx) => {
        if (y > pageHeight - 20) {
          pdf.addPage();
          pdf.setFillColor(15, 23, 42);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
          y = 20;

          // Header repeat on new page
          pdf.setFillColor(30, 41, 59);
          pdf.rect(margin, y, pageWidth - margin * 2, 8, 'F');
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...mutedTextColor);
          pdf.text('MODULE', margin + 4, y + 5.5);
          pdf.text('PAYLOAD / TARGET', margin + 35, y + 5.5);
          pdf.text('VERDICT', margin + 125, y + 5.5);
          pdf.text('RISK SCORE', margin + 160, y + 5.5);
          y += 10;
          pdf.setFont('helvetica', 'normal');
        }

        // Alternating row background
        if (idx % 2 === 0) {
          pdf.setFillColor(24, 32, 47);
          pdf.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
        }

        pdf.setTextColor(...lightTextColor);
        pdf.text(item.module.toUpperCase(), margin + 4, y);

        // Truncate payload text if long
        const payloadText = item.input.length > 50 ? item.input.substring(0, 47) + '...' : item.input;
        pdf.setTextColor(203, 213, 225);
        pdf.text(payloadText, margin + 35, y);

        // Verdict color styling
        const v = (item.verdict || 'N/A').toLowerCase();
        if (v === 'malicious' || v === 'phishing') {
          pdf.setTextColor(...redColor);
        } else if (v === 'safe' || v === 'clean') {
          pdf.setTextColor(...emeraldColor);
        } else {
          pdf.setTextColor(251, 191, 36);
        }
        pdf.text((item.verdict || 'N/A').toUpperCase(), margin + 125, y);

        pdf.setTextColor(...lightTextColor);
        pdf.text(item.riskScore !== undefined ? String(item.riskScore) : '—', margin + 160, y);

        y += 7;
      });

      // Footer on all pages
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(8);
        pdf.setTextColor(...mutedTextColor);
        pdf.text(
          `CyberShield AI Executive Security Operations Center — Confidential Audit Report (Page ${p} of ${totalPages})`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }

      pdf.save(`CyberShield_Security_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('Executive PDF report downloaded!', { id: 'pdf-toast' });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error(`PDF generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`, { id: 'pdf-toast' });
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (items.length === 0) {
      toast.error('No scan records to export');
      return;
    }
    const headers = ['ID', 'Module', 'Verdict', 'Risk Score', 'Target/Payload', 'Timestamp'];
    const rows = items.map((item) => [
      item._id,
      item.module,
      item.verdict || 'N/A',
      item.riskScore !== undefined ? item.riskScore : 'N/A',
      `"${item.input.replace(/"/g, '""')}"`,
      new Date(item.createdAt).toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cybershield_audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV log exported successfully');
  };

  const maliciousCount = items.filter((i) => i.verdict === 'malicious' || i.verdict === 'phishing').length;
  const safeCount = items.filter((i) => i.verdict === 'safe' || i.verdict === 'clean').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="glass-card p-6 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <FileBarChart className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Compliance &amp; Executive Security Reports</h1>
            <p className="text-xs text-gray-400 mt-1">Export formatted PDF summaries or raw CSV audit logs.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={exportCSV} className="btn-secondary text-xs flex items-center gap-2">
            <FileText className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={exportPDF} className="btn-primary text-xs flex items-center gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div ref={reportRef} className="glass-card p-8 border border-white/5 space-y-6 text-white">
        {/* Printable Header */}
        <div className="flex justify-between items-start pb-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-extrabold text-blue-400">CyberShield AI</h2>
            <p className="text-xs text-gray-400">Executive Security Audit &amp; Telemetry Report</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Generated: <strong className="text-gray-200">{formatDate(new Date())}</strong></p>
            <p>Scope: <strong className="text-gray-200">Last 50 Scans</strong></p>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-gray-400">Total Scans Audited</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">{items.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-emerald-300">Clean / Safe Verdicts</p>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{safeCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-300">Threats Flagged</p>
            <p className="text-2xl font-bold font-mono text-red-400 mt-1">{maliciousCount}</p>
          </div>
        </div>

        {/* Audit Log Data Table */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            Audited Telemetry Log Entries
          </h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase">
                <th className="py-2.5">Module</th>
                <th className="py-2.5">Payload Input</th>
                <th className="py-2.5">Verdict</th>
                <th className="py-2.5">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {items.slice(0, 15).map((item) => (
                <tr key={item._id}>
                  <td className="py-2.5 capitalize font-sans">{item.module}</td>
                  <td className="py-2.5 text-gray-300 max-w-xs truncate">{item.input}</td>
                  <td className="py-2.5 font-sans capitalize">{item.verdict || 'N/A'}</td>
                  <td className="py-2.5">{item.riskScore ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
