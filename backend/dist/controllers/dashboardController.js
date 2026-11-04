"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivity = exports.getDashboardStats = void 0;
const DashboardStat_1 = __importDefault(require("../models/DashboardStat"));
const ScanHistory_1 = __importDefault(require("../models/ScanHistory"));
// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const userId = req.userId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const stats = await DashboardStat_1.default.find({
        userId,
        date: { $gte: thirtyDaysAgo },
    }).sort({ date: 1 });
    // Compute totals
    const totals = stats.reduce((acc, s) => ({
        threatsDetected: acc.threatsDetected + s.threatsDetected,
        urlsScanned: acc.urlsScanned + s.urlsScanned,
        emailsAnalyzed: acc.emailsAnalyzed + s.emailsAnalyzed,
        portsScanned: acc.portsScanned + s.portsScanned,
        filesEncrypted: acc.filesEncrypted + s.filesEncrypted,
    }), { threatsDetected: 0, urlsScanned: 0, emailsAnalyzed: 0, portsScanned: 0, filesEncrypted: 0 });
    // Chart series (daily breakdown)
    const threatLandscape = stats.map((s) => ({
        date: s.date.toISOString().split('T')[0],
        threats: s.threatsDetected,
        urls: s.urlsScanned,
        emails: s.emailsAnalyzed,
    }));
    // URL verdict distribution from scan history
    const urlResults = await ScanHistory_1.default.find({ userId, module: 'url' }).select('verdict');
    const urlDistribution = { safe: 0, suspicious: 0, malicious: 0 };
    urlResults.forEach((r) => {
        const v = r.verdict;
        if (v in urlDistribution)
            urlDistribution[v]++;
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
    const lastScan = await ScanHistory_1.default.findOne({ userId })
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
exports.getDashboardStats = getDashboardStats;
// GET /api/dashboard/activity
const getRecentActivity = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const userId = req.userId;
    const activities = await ScanHistory_1.default.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('module verdict riskScore createdAt input');
    res.json({ success: true, activities });
};
exports.getRecentActivity = getRecentActivity;
