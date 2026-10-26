# SquadPulse 🚀

> **The Free & Open-Source Operating System for University Flatmates & Hostel Squads**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-green?style=flat&logo=auth0)](https://authjs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Deployed live on Vercel: **[https://squadpulse-phi.vercel.app](https://squadpulse-phi.vercel.app)**

---

## ✨ Overview

SquadPulse replaces fragmented WhatsApp groups, forgotten Splitwise balances, and chore arguments with one high-performance, edge-ready dashboard.

- 🌿 **Daily Life Wing**: Who's Free Status Radar with quick hangout pings, Ride & Carpool Board with seat locks, Shared Chores Wheel with turn advancement, Borrow Board, Group Wallet with zero-cent debt minimization and UPI deep-link QR codes.
- 📚 **Study & Growth Wing**: Daily LeetCode/Codeforces Coding Problem with streak flames, Academic Doubt Board with peer upvotes, Exam Countdown with Group Syllabus Tracker, Hackathon & Study Partner Roster.
- 🎮 **Fun & Culture Wing**: Squad Decision Polls with Hamilton Largest Remainder rounding, Watch/Play Backlog with Wheel of Fortune spin, 30-Day Habit Matrix with flatmate pokes, Meme Vault with laugh counters.

---

## 🔐 Real Authentication with Free & Open-Source Tech

SquadPulse integrates **Auth.js (NextAuth v5)**:
1. **Sign in with Google (OAuth 2.0)**:
   - Configure your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local` or Vercel environment variables.
2. **Zero-Config 1-Click Guest / Roommate Demo**:
   - Running locally without Google credentials? No problem! 1-click Demo logs you in instantly as Aman, Rhea, Dev, Tanvi, or a custom guest name with zero configuration required.
3. **Reactive Store Sync**:
   - Active user profile, avatar, email, and authentication session automatically sync into Zustand and the top application header.

---

## 🛠️ Quickstart

```bash
# 1. Clone repository
git clone https://github.com/Nitinyadav1114/squadpulse.git
cd squadpulse

# 2. Install dependencies
npm install

# 3. (Optional) Set up Google OAuth in .env.local
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the landing page and app.

---

## 🧪 Testing & Verification

SquadPulse features a rigorous 4-tier automated test suite:

```bash
# Run comprehensive 4-tier test runner (151 tests)
node tests/run-all.mjs

# Run Zustand store stress & persistence harness (19,000+ assertions)
node tests/stress-store.mjs

# Build production bundle
npm run build
```

---

## 📄 License

MIT License — 100% Free and Open Source.
