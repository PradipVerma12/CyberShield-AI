'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Link2,
  Mail,
  Server,
  Lock,
  Clock,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { dashboardService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { DashboardStats, ScanHistoryItem } from '@/types';
import { formatTimeAgo, getVerdictBg, getModuleIcon, truncate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, actRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivity(),
      ]);
      if (statsRes.data.success) setStats(statsRes.data);
      if (actRes.data.success) setActivities(actRes.data.activities);
    } catch {
      toast.error('Failed to load dashboard telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleRefresh = () => fetchData();
    window.addEventListener('focus', handleRefresh);
    window.addEventListener('scanCompleted', handleRefresh);
    return () => {
      window.removeEventListener('focus', handleRefresh);
      window.removeEventListener('scanCompleted', handleRefresh);
    };
  }, []);

  const DONUT_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  const donutData = stats?.urlDistribution
    ? [
        { name: 'Safe', value: stats.urlDistribution.safe },
        { name: 'Suspicious', value: stats.urlDistribution.suspicious },
        { name: 'Malicious', value: stats.urlDistribution.malicious },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 border border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name || 'Security Specialist'}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              PRO TIER
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Real-time threat telemetry and automated security posture monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Last scan:{' '}
            <span className="text-white font-medium">
              {stats?.lastScan ? `${formatTimeAgo(stats.lastScan.time)} (${stats.lastScan.module})` : 'No scans yet'}
            </span>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 transition-colors"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Animated Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Threats Blocked',
            value: stats?.totals.threatsDetected ?? 0,
            icon: ShieldAlert,
            color: 'text-red-400',
            bg: 'bg-red-500/10 border-red-500/20',
            change: '+14% this month',
          },
          {
            title: 'URLs Scanned',
            value: stats?.totals.urlsScanned ?? 0,
            icon: Link2,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
            change: '+28% this week',
          },
          {
            title: 'Emails Analyzed',
            value: stats?.totals.emailsAnalyzed ?? 0,
            icon: Mail,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10 border-purple-500/20',
            change: '99.4% accuracy',
          },
          {
            title: 'Ports Audited',
            value: stats?.totals.portsScanned ?? 0,
            icon: Server,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
            change: 'Local & Remote',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{card.title}</p>
                  <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">
                    {loading ? '...' : card.value.toLocaleString()}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span>{card.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl border ${card.bg}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1: Line Chart & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Landscape Line Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Threat Intelligence Timeline (30 Days)
              </h2>
              <p className="text-xs text-gray-400">Aggregated daily security telemetry logs</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">Loading telemetry...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.threatLandscape || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="threats" name="Threats Detected" stroke="#EF4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="urls" name="URLs Scanned" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="emails" name="Emails Analyzed" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* URL Analysis Donut Chart */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Link2 className="w-4 h-4 text-purple-400" /> URL Risk Distribution
            </h2>
            <p className="text-xs text-gray-400">Categorization of inspected URLs</p>
          </div>
          <div className="h-56 my-2">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {donutData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-4 text-xs">
            {donutData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[i] }} />
                <span className="text-gray-300">{entry.name}:</span>
                <span className="text-white font-bold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Weekly Bar Chart & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Threats Bar Chart */}
        <div className="glass-card p-6">
          <h2 className="text-base font-bold text-white mb-1">Weekly Threats (7 Days)</h2>
          <p className="text-xs text-gray-400 mb-4">Detected threats per weekday</p>
          <div className="h-60">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.weeklyThreats || []}>
                  <XAxis dataKey="day" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="threats" name="Threats" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Recent Security Activity
            </h2>
            <p className="text-xs text-gray-400 mb-4">Live audit stream of recent scans</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
            {loading ? (
              <p className="text-sm text-gray-500 text-center py-6">Fetching activity feed...</p>
            ) : activities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No recent activity logged</p>
            ) : (
              activities.map((act) => (
                <div
                  key={act._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">{getModuleIcon(act.module)}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate max-w-xs">{act.input}</p>
                      <p className="text-[11px] text-gray-400 uppercase">{act.module} module</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {act.verdict && (
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${getVerdictBg(act.verdict)}`}>
                        {act.verdict}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">{formatTimeAgo(act.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
