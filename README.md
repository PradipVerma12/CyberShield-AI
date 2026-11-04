# CyberShield AI — Enterprise Cybersecurity SaaS Dashboard

A real, functional cybersecurity SaaS dashboard featuring JWT authentication, a MongoDB backend, client-side Web Crypto AES-256-GCM encryption, heuristic threat detection engines, a TCP port scanner with authorization controls, executive PDF/CSV reporting, and a dark-mode glassmorphic interface inspired by Linear, Stripe, Vercel, and Framer.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: A running local instance or MongoDB Atlas Connection URI

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `/backend` (copy from `.env.example`):
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cybershield?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
PORT=5000
FRONTEND_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Seed the Database with realistic initial telemetry and demo user credentials:
```bash
npm run seed
```

Start Backend in Development Mode:
```bash
npm run dev
```
*(Backend runs on `http://localhost:5000`)*

---

### 2. Frontend Setup

In a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env.local` file inside `/frontend`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start Next.js Frontend:
```bash
npm run dev
```
*(Frontend runs on `http://localhost:3000`)*

---

## 🔑 Demo Account Credentials

Use these credentials to log in immediately after running `npm run seed`:

- **Email**: `demo@cybershield.ai`
- **Password**: `Demo1234!`

---

## 🛡️ Core Security Modules Overview

1. **Dashboard Home**: Real-time aggregated statistics (threats blocked, URLs scanned, emails analyzed, ports audited) backed by real MongoDB documents. Features interactive Recharts line charts, donut risk breakdown, and weekly bar charts.
2. **Password Checker**: Client-side entropy calculation ($E = L \cdot \log_2 R$), requirement checklist, and cryptographically secure pseudorandom number generator (CSPRNG) powered by Web Crypto `crypto.getRandomValues`. Zero network transmission.
3. **URL Detector**: Heuristic engine inspecting suspicious links, punycode lookalikes, non-HTTPS protocols, shortener domains, and brand-name typosquatting. Clearly marked as heuristic/demo logic in code & UI.
4. **Email Analyzer**: Content & header classifier analyzing urgency language, display name mismatch spoofing, suspicious links, and dangerous attachments. Sanitized server-side with XSS filtering.
5. **Port Scanner**: Node.js `net` TCP socket probe. **Mandatory Safety Constraint**: Scans default to `127.0.0.1 / localhost` and require explicit user consent acknowledgement before execution.
6. **File Encryption Vault**: Client-side AES-256-GCM encryption with 100,000 PBKDF2 iterations via browser native `window.crypto.subtle`. Plaintext secret passphrases never touch the server network stack.
7. **Reports & History**: Paginated, filterable audit log history with client-side PDF export (jsPDF + html2canvas) and CSV export capabilities.
8. **Profile**: User metadata editing, password change with bcrypt re-hashing, and a 2FA toggle indicator.

---

## 📁 Repository Structure

```
cybershield-ai/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # Auth, Dashboard, Scan, Port controllers
│   │   ├── middleware/      # JWT protection middleware
│   │   ├── models/          # User, ScanHistory, DashboardStat schemas
│   │   ├── routes/          # Express API endpoints
│   │   └── scripts/         # Seed script
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/                 # Next.js 15 App Router pages & layouts
│   ├── components/          # Sidebar, Topbar, UI components
│   ├── services/            # Axios API client with auto refresh token logic
│   ├── store/               # Zustand auth state
│   ├── types/               # TypeScript interfaces
│   ├── .env.example
│   └── package.json
└── README.md
```
