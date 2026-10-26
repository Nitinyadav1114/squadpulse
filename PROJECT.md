# Project: SquadPulse

## Architecture
SquadPulse is a modern, mobile-responsive fullstack web application for university hostel/flatmates and friend groups. It is built on Next.js 15 App Router, React 19, Tailwind CSS, Lucide icons, and Zustand for unified client-side state management with zero external API key requirements and seamless local persistence.

- **Frontend / Client Tier**: Next.js 15 App Router with hybrid SSR layout and client-side reactive components.
- **Styling & Theming**: Tailwind CSS with class-based dark mode (`darkMode: 'class'`) and semantic color tokens for 3 distinct section accents:
  - Daily Life: Emerald / Teal / Amber
  - Study & Growth: Indigo / Violet / Cyan
  - Fun & Culture: Rose / Fuchsia / Coral
- **Navigation & Shell**:
  - Responsive layout: Mobile bottom navigation (< 768px, 64px height with safe-area spacing) and Desktop collapsible sidebar (>= 768px, 260px expanded / 80px collapsed).
  - Header: Sticky blur bar with active persona indicator, 4-persona switcher dropdown, live hangout notification drawer trigger, and theme toggle.
- **State & Persistence**:
  - Single Source of Truth Zustand store (`useSquadStore`) with `localStorage` persistence adapter.
  - Pluggable storage interface (`IStorageAdapter`) providing an immediate zero-key `LocalStorageAdapter` and a ready-to-wire `PostgresStorageAdapter` for Supabase / Neon PostgreSQL.
- **Social Multi-Persona Dynamics**:
  - 4 mock roommates: Aman (Hostel Rep), Rhea (Coder), Dev (Gamer), Tanvi (Planner).
  - Real-time switching alters relative debt perspective ("You owe X" vs "X owes you"), highlighted chore assignments ("YOUR TURN!"), status badges, and habit check-in permissions.

---

## Feature Inventory
| # | Feature | Description | Milestone | Status | Source |
|---|---------|-------------|-----------|--------|--------|
| 1 | Theme & Color Tokens | Dark/Light mode + Daily, Study, and Fun section accent palettes | M1 | DONE | R1 |
| 2 | Mobile Bottom Nav Shell | Safe-area mobile bottom navigation (< 768px) with 5 touch tabs and micro-glow | M1 | DONE | R1 |
| 3 | Desktop Collapsible Sidebar | Collapsible sidebar (>= 768px) with section groupings and tooltips | M1 | DONE | R1 |
| 4 | Multi-Persona Switcher | Real-time switcher between Aman, Rhea, Dev, and Tanvi with dynamic badge and context | M1 | DONE | R1 |
| 5 | Reactive Store & Persistence | Zustand store with local storage sync, initial seed dataset, and PostgreSQL adapter hook | M1 | DONE | R1, R5 |
| 6 | Who's Free Status Radar | Live status radar with preset badges, custom status, auto-expiry, and hangout pings | M2 | DONE | R2 |
| 7 | Ride & Carpool Board | Transit board with origin, destination, vehicle type, seat counters, and one-tap join | M2 | DONE | R2 |
| 8 | Shared Chores Rotation Wheel | Duty wheel with automatic cyclic turn rotation upon completion and history log | M2 | DONE | R2 |
| 9 | Borrow & Lost/Found Board | Lending and recovery board with status lifecycle (Open, Borrowed, Returned, Resolved) | M2 | DONE | R2 |
| 10 | Group Wallet & Expense Splitting | Shared expenses with automated pairwise debt settlement matrix (e.g. 'Dev owes Rhea ₹350') | M2 | DONE | R2 |
| 11 | UPI Deep-Link QR Simulation | Modal simulating UPI QR payment with copyable payload and deep-link format | M2 | DONE | R2 |
| 12 | Daily Coding Challenge | Problem of the day, difficulty tags, code showcase, streak flames, and leaderboard | M3 | DONE | R3 |
| 13 | Doubt Board with Code Snippets | Academic Q&A forum with markdown/code syntax highlighting, answers, and upvoting | M3 | DONE | R3 |
| 14 | Exam Countdown & Revision Tracker | Visual countdown timers, syllabus module checklists, and group completion progress bars | M3 | DONE | R3 |
| 15 | Partner & Hackathon Finder | Member skill profiles (Python, React, ML, UI/UX) and hackathon roster builder with open slots | M3 | DONE | R3 |
| 16 | Group Polls & 'This or That' | Daily opinion polls, voting toggles, animated percentage bars, and results summary | M4 | DONE | R4 |
| 17 | Watch & Play Together Backlog | Shared backlog of movies, series, and multiplayer games | M4 | DONE | R4 |
| 18 | Spin-the-Wheel Decision Maker | Canvas/SVG animated wheel with physics-based deceleration and winner celebration | M4 | DONE | R4 |
| 19 | 30-Day Habit Challenge Tracker | Habit streak tracker with individual GitHub-style check-in heatmaps and poke reminders | M4 | DONE | R4 |
| 20 | Meme & Inside-Joke Vault | Searchable gallery of group memes, quotes, and legendary moments with tag and member filters | M4 | DONE | R4 |
| 21 | Zero-Cost Vercel Production Build | Clean Next.js 15 build with zero TypeScript errors, responsive render at 375px and 1280px | M5 | DONE | R5, AC |

---

## Milestones
| # | Name | Scope | Dependencies | Status | Verification Outputs |
|---|------|-------|-------------|--------|---------------------|
| M1 | Foundation, Shell & Persona Store | Configs, Theme system, Mobile Bottom Nav, Desktop Sidebar, 4-Persona Switcher, Zustand Store & Types, Seed Data | none | DONE | `npm run build` exits 0, zero TS errors, full responsive layout |
| M2 | Daily Life Utility Suite | Who's Free Radar, Ride & Carpool Board, Shared Chores Wheel with turn advancement, Borrow Board, Group Wallet with Pairwise Debt Matrix & UPI QR | M1 | DONE | `npx tsc` exits 0, 5 components + `/daily` route fully interactive |
| M3 | Study & Growth Collaborative Wing | Daily Coding Challenge with streak flames, Doubt Board with Code Snippets, Exam Countdown & Syllabus Progress, Partner Finder | M1 | DONE | `npx tsc` exits 0, 4 components + `/study` route fully interactive |
| M4 | Fun & Group Culture Common Room | Group Polls with animated bars, Watch/Play Backlog + Spin the Wheel, 30-Day Heatmap Habit Tracker & Pokes, Meme Vault | M1 | DONE | `npm run build` exits 0, 4 components + `/fun` route fully interactive |
| M5 | E2E Testing, Build Verification & Integrity Audit | E2E test suite, responsive validation (375px, 1280px), zero TypeScript errors, `npm run build` exits 0, Forensic Audit | M1, M2, M3, M4 | DONE | 151/151 tests pass, 58 stress tests pass, 19,133 state assertions pass, Reviewers APPROVE, Auditor CLEAN |

---

## Code Layout
```
amazing-darwin/
├── app/
│   ├── layout.tsx                # Global HTML shell, theme provider, fonts
│   ├── page.tsx                  # Dashboard / Hub aggregating all wings
│   ├── globals.css               # Tailwind directives, CSS variables, dark/light themes
│   ├── daily/
│   │   └── page.tsx              # R2 Daily Life Utility Suite
│   ├── study/
│   │   └── page.tsx              # R3 Study & Growth Collaborative Wing
│   └── fun/
│   │   └── page.tsx              # R4 Fun & Group Culture Common Room
├── components/
│   ├── shell/
│   │   ├── Navigation.tsx        # Bottom Nav (<768px) and Desktop Sidebar (>=768px)
│   │   ├── Header.tsx            # Persona switcher, theme toggle, notification bell
│   │   └── PingDrawer.tsx        # Hangout pings and quick interaction drawer
│   ├── daily/
│   │   ├── WhosFreeRadar.tsx     # Live status radar & quick hangout pings
│   │   ├── RideCarpoolBoard.tsx  # Ride sharing transit board
│   │   ├── ChoresWheel.tsx       # Rotating chore wheel with turn advancement
│   │   ├── BorrowBoard.tsx       # Equipment and notes lending lifecycle
│   │   └── GroupWallet.tsx       # Expense splitter, debt matrix, UPI QR modal
│   ├── study/
│   │   ├── DailyCoding.tsx       # Problem of day, streak flame, leaderboard
│   │   ├── DoubtBoard.tsx        # Q&A with syntax highlighted code
│   │   ├── ExamCountdown.tsx     # Visual countdown & syllabus checklists
│   │   └── PartnerFinder.tsx     # Member skill profiles & hackathon teams
│   ├── fun/
│   │   ├── GroupPolls.tsx        # Opinion polls with animated bars
│   │   ├── WatchPlayWheel.tsx    # Media backlog & Canvas spin wheel
│   │   ├── HabitTracker.tsx      # 30-day heatmap & pokes
│   │   └── MemeVault.tsx         # Meme & quote gallery with tag search
│   └── ui/                       # Reusable buttons, badges, modals, tabs, cards
├── types/
│   └── index.ts                  # Centralized TypeScript definitions
├── data/
│   └── seedData.ts               # Realistic initial state for Aman, Rhea, Dev, Tanvi
├── lib/
│   ├── store.ts                  # Zustand single-source-of-truth store
│   ├── algorithms.ts             # Debt matrix, chore rotation, streaks, polls
│   ├── storage.ts                # Storage adapter interface (Local + Postgres hook)
│   └── utils.ts                  # Tailwind clsx/twMerge & date format helpers
├── tests/
│   ├── run-all.mjs               # 4-tier E2E runner (151 tests)
│   ├── stress-algorithms.mjs     # Algorithmic stress verification (58 tests)
│   ├── stress-store.mjs          # Zustand store stress verification (19,133 checks)
│   ├── tier1-features/           # Tier 1 tests
│   ├── tier2-boundary/           # Tier 2 tests
│   ├── tier3-cross-feature/      # Tier 3 tests
│   └── tier4-scenarios/          # Tier 4 tests
├── tailwind.config.ts            # Tailwind configuration with section palettes
├── postcss.config.mjs            # PostCSS configuration
├── tsconfig.json                 # Strict TypeScript configuration
└── next.config.ts                # Next.js 15 configuration
```
