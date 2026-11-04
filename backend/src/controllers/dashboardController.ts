import { Request, Response } from 'express';
import DashboardStat from '../models/DashboardStat';
import ScanHistory from '../models/ScanHistory';
import { AuthRequest } from '../middleware/auth';

// GET /api/dashboard/stats
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const userId = req.userId!;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const stats = await DashboardStat.find({
    userId,
    date: { $gte: thirtyDaysAgo },
  }).sort({ date: 1 });

  // Compute totals
  const totals = stats.reduce(
    (acc, s) => ({
      threatsDetected: acc.threatsDetected + s.threatsDetected,
      urlsScanned: acc.urlsScanned + s.urlsScanned,
      emailsAnalyzed: acc.emailsAnalyzed + s.emailsAnalyzed,
      portsScanned: acc.portsScanned + s.portsScanned,
      filesEncrypted: acc.filesEncrypted + s.filesEncrypted,
    }),
    { threatsDetected: 0, urlsScanned: 0, emailsAnalyzed: 0, portsScanned: 0, filesEncrypted: 0 }
  );

  // Chart series (daily breakdown)
  const threatLandscape = stats.map((s) => ({
    date: s.date.toISOString().split('T')[0],
    threats: s.threatsDetected,
    urls: s.urlsScanned,
    emails: s.emailsAnalyzed,
  }));

  // URL verdict distribution from scan history
  const urlResults = await ScanHistory.find({ userId, module: 'url' }).select('verdict');
  const urlDistribution = { safe: 0, suspicious: 0, malicious: 0 };
  urlResults.forEach((r) => {
    const v = r.verdict as keyof typeof urlDistribution;
    if (v in urlDistribution) urlDistribution[v]++;
  });

  // Weekly threats (last 7 days, grouped by day of week)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyStats = stats.filter((s) => s.date >= sevenDaysAgo);
  const weeklyThreats = weeklyStats.map((s) => ({
    day: s.date.toLocaleDateString('en-US', { weekday: 'short' }),
    threats: s.threatsDetected,
  }));

  // Last scan timestamp (query most recent ScanHistory by createdAt)
  const lastScan = await ScanHistory.findOne({ userId })
    .sort({ createdAt: -1 })
    .select('createdAt module');

  res.json({
    success: true,
    totals,
    threatLandscape,
    urlDistribution,
    weeklyThreats,
    lastScan: lastScan
      ? { time: lastScan.createdAt, module: lastScan.module }
      : null,
  });
};

// GET /api/dashboard/activity
export const getRecentActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const userId = req.userId!;
  const activities = await ScanHistory.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('module verdict riskScore createdAt input');

  res.json({ success: true, activities });
};
