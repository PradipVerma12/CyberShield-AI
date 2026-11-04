'use client';
import { useEffect, useState } from 'react';
import { History, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { scanService } from '@/services/api';
import { ScanHistoryItem } from '@/types';
import { formatTimeAgo, getVerdictBg, getModuleIcon, truncate } from '@/lib/utils';

export default function HistoryPage() {
  const [items, setItems] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await scanService.getHistory({
        module: moduleFilter,
        page,
        limit: 10,
        search,
      });
      if (res.data.success) {
        setItems(res.data.items);
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch {
      toast.error('Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [moduleFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card p-6 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Centralized Audit Log &amp; Scan History</h1>
            <p className="text-xs text-gray-400 mt-1">Search, filter, and review historical threat scans.</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 border border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search input text..."
            className="input-field pl-9 py-2 text-xs w-full"
          />
        </form>

        {/* Module Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'url', label: 'URL' },
            { id: 'email', label: 'Email' },
            { id: 'port', label: 'Port' },
            { id: 'password', label: 'Password' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setModuleFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                moduleFilter === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading audit history...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">No scan records match your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 uppercase font-sans">
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Target / Payload</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">
                      <span className="mr-1.5">{getModuleIcon(item.module)}</span>
                      <span className="capitalize">{item.module}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 max-w-xs truncate" title={item.input}>
                      {truncate(item.input, 40)}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      {item.verdict ? (
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize ${getVerdictBg(item.verdict)}`}>
                          {item.verdict}
                        </span>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {item.riskScore !== undefined ? `${item.riskScore}/100` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 font-sans">{formatTimeAgo(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
