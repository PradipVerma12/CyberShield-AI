import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../config/db';
import User from '../models/User';
import DashboardStat from '../models/DashboardStat';
import ScanHistory from '../models/ScanHistory';

const DEMO_EMAIL = 'demo@cybershield.ai';
const DEMO_PASSWORD = 'Demo1234!';

async function seed() {
  await connectDB();
  console.log('🌱 Starting seed...');

  // Remove existing demo user and their data
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    await DashboardStat.deleteMany({ userId: existing._id });
    await ScanHistory.deleteMany({ userId: existing._id });
    await User.deleteOne({ _id: existing._id });
    console.log('🗑️  Cleared existing demo data');
  }

  // Create demo user
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await User.create({
    name: 'Alex Chen',
    email: DEMO_EMAIL,
    passwordHash,
    role: 'user',
  });
  console.log(`✅ Created demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);

  // Seed 30 days of dashboard stats
  const stats = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const isWeekend = [0, 6].includes(date.getDay());
    const base = isWeekend ? 2 : 8;

    stats.push({
      userId: user._id,
      date,
      threatsDetected: Math.floor(Math.random() * base) + 1,
      urlsScanned: Math.floor(Math.random() * base * 2) + base,
      emailsAnalyzed: Math.floor(Math.random() * base) + 2,
      portsScanned: Math.floor(Math.random() * 30) + 5,
      filesEncrypted: Math.floor(Math.random() * 3),
    });
  }
  await DashboardStat.insertMany(stats);
  console.log('✅ Seeded 30 days of dashboard stats');

  // Seed scan history (20 realistic records)
  const scanRecords = [
    // URL scans
    {
      userId: user._id,
      module: 'url',
      input: 'https://paypa1-secure-login.verify-account.com/signin',
      result: { score: 92, verdict: 'malicious', flags: ['Brand name impersonation', 'Punycode domain'] },
      riskScore: 92,
      verdict: 'malicious',
      createdAt: daysAgo(1),
    },
    {
      userId: user._id,
      module: 'url',
      input: 'https://bit.ly/3xKp2mN',
      result: { score: 45, verdict: 'suspicious', flags: ['URL shortener detected'] },
      riskScore: 45,
      verdict: 'suspicious',
      createdAt: daysAgo(2),
    },
    {
      userId: user._id,
      module: 'url',
      input: 'https://github.com/microsoft/vscode',
      result: { score: 5, verdict: 'safe', flags: ['No suspicious patterns detected'] },
      riskScore: 5,
      verdict: 'safe',
      createdAt: daysAgo(3),
    },
    {
      userId: user._id,
      module: 'url',
      input: 'http://192.168.1.1/admin/login?redirect=http://evil.com',
      result: { score: 78, verdict: 'malicious', flags: ['IP address hostname', 'Non-secure HTTP', 'Multiple redirect params'] },
      riskScore: 78,
      verdict: 'malicious',
      createdAt: daysAgo(4),
    },
    {
      userId: user._id,
      module: 'url',
      input: 'https://amazon.com/products/laptop',
      result: { score: 8, verdict: 'safe', flags: ['No suspicious patterns detected'] },
      riskScore: 8,
      verdict: 'safe',
      createdAt: daysAgo(5),
    },
    // Email scans
    {
      userId: user._id,
      module: 'email',
      input: 'From: PayPal Security <noreply@payp4l-security.net>\nSubject: URGENT: Your account has been suspended\n\nDear Customer,\n\nYour account has been suspended. Click here immediately to verify your account.',
      result: { verdict: 'phishing', confidence: 94, flags: ['Display name impersonation', 'Urgency language', 'Generic greeting'] },
      riskScore: 94,
      verdict: 'phishing',
      createdAt: daysAgo(2),
    },
    {
      userId: user._id,
      module: 'email',
      input: 'From: John Smith <john@company.com>\nHi team, please review the attached proposal by EOD.',
      result: { verdict: 'clean', confidence: 10, flags: ['No phishing indicators detected'] },
      riskScore: 10,
      verdict: 'clean',
      createdAt: daysAgo(6),
    },
    {
      userId: user._id,
      module: 'email',
      input: 'CONGRATULATIONS!!! You have been SELECTED as our WINNER. Claim your PRIZE now. Click here: http://bit.ly/prize-claim',
      result: { verdict: 'spam', confidence: 72, flags: ['Urgency language', 'ALL CAPS abuse', 'Suspicious link'] },
      riskScore: 72,
      verdict: 'spam',
      createdAt: daysAgo(7),
    },
    // Port scans
    {
      userId: user._id,
      module: 'port',
      input: 'localhost:80,443,22,3306',
      result: {
        target: 'localhost',
        results: [
          { port: 80, status: 'open', service: 'HTTP' },
          { port: 443, status: 'closed', service: 'HTTPS' },
          { port: 22, status: 'open', service: 'SSH' },
          { port: 3306, status: 'closed', service: 'MySQL' },
        ],
        summary: { total: 4, open: 2, closed: 2 },
      },
      riskScore: 15,
      verdict: 'suspicious',
      createdAt: daysAgo(3),
    },
    // Password checks (no server-side call, but we log them)
    {
      userId: user._id,
      module: 'password',
      input: '[password strength check — input not stored for security]',
      result: { strength: 'strong', score: 85, criteria: { length: true, uppercase: true, numbers: true, symbols: true } },
      riskScore: 15,
      verdict: 'strong',
      createdAt: daysAgo(1),
    },
  ];

  // Add more varied records
  const urlExamples = [
    'https://google.com', 'https://stripe.com/dashboard',
    'http://amaz0n-deals.login-verify.xyz/account',
    'https://tinyurl.com/fake-bank-login',
  ];
  const verdicts = ['safe', 'safe', 'malicious', 'suspicious'];

  for (let i = 0; i < urlExamples.length; i++) {
    scanRecords.push({
      userId: user._id,
      module: 'url',
      input: urlExamples[i],
      result: { score: [5, 8, 88, 45][i], verdict: verdicts[i], flags: ['Demo seeded record'] },
      riskScore: [5, 8, 88, 45][i],
      verdict: verdicts[i],
      createdAt: daysAgo(8 + i),
    });
  }

  await ScanHistory.insertMany(scanRecords);
  console.log('✅ Seeded scan history records');

  console.log('\n🎉 Seed complete!');
  console.log('──────────────────────────────');
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log('──────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
