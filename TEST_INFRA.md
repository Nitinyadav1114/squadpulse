# SquadPulse Test Infrastructure & Methodology Specification

## 1. Overview & Test Architecture

The SquadPulse test suite is a requirement-driven, 4-tier opaque-box test framework designed to independently verify all algorithmic invariants, reactive state flows, multi-persona perspectives, and cross-module dynamics without relying on third-party test runners or external network services.

The suite executes in native Node.js (v20+) using ES modules (`.mjs`) with zero external test runner dependencies, guaranteeing 100% deterministic local execution, zero-cost continuous integration, and sub-second runtimes (~0.09s for 151 tests).

### Directory Layout
```
tests/
├── run-all.mjs                                 # Master test runner executable
├── test-framework.mjs                          # Zero-dependency async test harness with tier reporting
├── fixtures/
│   ├── seed-data.mjs                           # Realistic seed datasets for Aman, Rhea, Dev, Tanvi
│   └── reference-engine.mjs                    # Algorithmic oracle and isolated state simulator
├── tier1-features/                             # Tier 1: Functional Feature Coverage (>=5 tests per module)
│   ├── daily-whos-free.test.mjs                # Who's Free Radar & Hangout Pings (5 tests)
│   ├── daily-carpool.test.mjs                  # Ride & Carpool Transit Board (5 tests)
│   ├── daily-chores.test.mjs                   # Shared Chores Rotation Wheel (5 tests)
│   ├── daily-borrow.test.mjs                   # Borrow & Lost/Found Lending Board (5 tests)
│   ├── daily-wallet-debts.test.mjs             # Group Wallet, Debts & Kitty Reserves (5 tests)
│   ├── study-daily-coding.test.mjs             # Problem of the Day & Streak Flames (5 tests)
│   ├── study-doubt-board.test.mjs              # Academic Q&A Forum & Upvoting (5 tests)
│   ├── study-exam-countdown.test.mjs           # Exam Countdown & Syllabus Checklists (5 tests)
│   ├── study-partner-finder.test.mjs           # Hackathon Roster & Skill Profiles (5 tests)
│   ├── fun-group-polls.test.mjs                # Group Opinion Polls & "This or That" (5 tests)
│   ├── fun-watch-play.test.mjs                 # Media Backlog & Spin the Wheel (5 tests)
│   ├── fun-habit-tracker.test.mjs              # 30-Day Heatmap Habit Challenge (5 tests)
│   └── fun-meme-vault.test.mjs                 # Meme & Inside-Joke Vault (5 tests)
├── tier2-boundary/                             # Tier 2: Boundary & Corner Cases (73 tests)
│   ├── boundary-wallet-debts.test.mjs          # Fractional penny rounding, cyclic debts, extremes (10 tests)
│   ├── boundary-chore-rotation.test.mjs        # 1-member, 2-member, 10-member rings, history audit (8 tests)
│   ├── boundary-polls-hamilton.test.mjs        # 0 votes, 3-way tie, 100 options, 1M votes (9 tests)
│   ├── boundary-streaks-dates.test.mjs         # Leap years, grace periods, 365 days, resets (10 tests)
│   ├── boundary-carpool.test.mjs               # 0 seats, duplicate joins, free rides, unjoined leaves (7 tests)
│   ├── boundary-borrow.test.mjs                # Non-existent IDs, free loans, category checks (7 tests)
│   ├── boundary-study-exams.test.mjs           # 0 syllabus topics, past exam dates, 45KB code (7 tests)
│   ├── boundary-habits-heatmaps.test.mjs       # Future start dates, 30-day clamps, duplicate pokes (8 tests)
│   └── boundary-social-memes.test.mjs          # Invalid persona switch, unreacted memes, search (7 tests)
├── tier3-cross-feature/                        # Tier 3: Cross-Feature Pairwise Interactions (8 tests)
│   ├── persona-wallet-interaction.test.mjs     # Persona switch reflecting in debtor/creditor view (1 test)
│   ├── chore-advance-assignee.test.mjs         # Chore completion advancing turn to next persona (1 test)
│   ├── habit-checkin-heatmap.test.mjs          # Habit check-in updating heatmap cell & streak tier (1 test)
│   ├── poll-vote-distribution.test.mjs         # Single-choice vote toggle shifting Hamilton distribution (1 test)
│   ├── carpool-seat-allocation.test.mjs        # Carpool capacity state machine (open -> full -> open) (1 test)
│   ├── doubt-resolution-flow.test.mjs          # Post -> Answer -> Upvote -> Accept flow (1 test)
│   ├── hackathon-roster-status.test.mjs        # Slot claim automatically transitioning status (1 test)
│   └── coding-submission-leaderboard.test.mjs  # Submission updating streak and personal stats (1 test)
└── tier4-scenarios/                            # Tier 4: Real-World Roommate Day Scenarios (5 tests)
    ├── scenario-grocery-split.test.mjs         # Weekend dinner split, debt settlement & UPI QR deep-link
    ├── scenario-water-can-rotation.test.mjs    # 20L hostel water can exchange & audit log sequence
    ├── scenario-daily-coding-sprint.test.mjs   # Daily problem solve, edge-case doubt, and peer fix
    ├── scenario-weekend-movie-night.test.mjs   # Status radar -> ping -> genre poll -> wheel spin -> meme
    └── scenario-hackathon-prep.test.mjs        # Roster recruitment -> carpool transit -> prize kitty
```

---

## 2. 4-Tier Test Suite Specification

### Tier 1: Functional Feature Coverage (65 Tests)
Ensures baseline functional completeness across all 13 core modules defined in `PROJECT.md` § Feature Inventory:
- **Daily Life**: Who's Free Radar (5), Ride & Carpool (5), Shared Chores Wheel (5), Borrow Board (5), Group Wallet & Kitty (5).
- **Study & Growth**: Daily Coding Challenge (5), Doubt Board (5), Exam Countdown & Revision (5), Partner Finder (5).
- **Fun & Culture**: Group Polls (5), Watch & Play Backlog (5), 30-Day Habit Tracker (5), Meme Vault (5).

### Tier 2: Boundary & Corner Cases (73 Tests)
Stress tests mathematical limits, numeric boundaries, edge states, and date anomalies:
- **Division by Zero Protection**: Polls with 0 votes and exams with 0 topics render safe 0% without `NaN` or runtime crashes.
- **Penny Conservation & Fractional Rounding**: Asymmetrical expense splits (₹100 split 3 ways) distribute exact fractions without floating leaks.
- **Cyclic Debt Elimination**: Resolves multi-party cyclic debts ($A \to B \to C \to A$) into zero transfers.
- **Calendar & Streak Bounds**: Accurately traverses leap year boundaries (Feb 28 $\to$ Feb 29 $\to$ Mar 1 in 2024), non-leap years (Feb 28 $\to$ Mar 1 in 2025), and year transitions (Dec 31 $\to$ Jan 1) with 1-day grace period.
- **Capacity Limits**: Rejects joining full carpool rides, prevents over-claiming hackathon slots, and handles single-member chore rotation rings.

### Tier 3: Cross-Feature Combinations (8 Tests)
Validates reactive state synchronization when multiple modules interact:
1. **Persona Switch $\leftrightarrow$ Group Wallet**: Switching between Aman (+₹900) and Dev (-₹700) flips relative debt perspectives ("You are owed ₹900" vs "You owe Aman ₹700").
2. **Chore Completion $\leftrightarrow$ Assignee Highlighting**: Completing a chore rotates the active turn indicator to the next persona.
3. **Habit Check-In $\leftrightarrow$ Heatmap & Flame**: Checking in today elevates cell from level 1 to level 3, increments streak, and promotes flame badge (Spark $\to$ Blaze).
4. **Poll Vote $\leftrightarrow$ Hamilton Distribution**: Casting/modifying a vote recalculates all options' integer percentages, guaranteeing exact 100% total sum.
5. **Carpool Join $\leftrightarrow$ Available Seats**: Seat counter decrements to 0, triggers 'Full' badge, and automatically restores availability when a passenger leaves.
6. **Doubt Flow $\leftrightarrow$ Accepted Badge**: Upvoting and accepting answers marks answer accepted and marks parent question resolved.
7. **Roster Slot $\leftrightarrow$ Project State**: Filling all slots transitions project status from `Recruiting` to `Roster Full`.
8. **Coding Submission $\leftrightarrow$ Streak Stats**: Submitting code updates problem submission arrays and increments the persona's `studyStreak`.

### Tier 4: Real-World Roommate Day Scenarios (5 Tests)
Simulates end-to-end multi-step flatmate days from start to finish:
- **Scenario 1**: 3-roommate dinner and grocery expense split with greedy minimization and UPI deep-link QR URI generation (`upi://pay?pa=...`).
- **Scenario 2**: 20L hostel water can depletion, replacement, duty wheel handoff, and append-only audit trail logging.
- **Scenario 3**: Midterms coding challenge sprint, doubt posting for edge-case clarification, peer code explanation, and streak boost.
- **Scenario 4**: Friday movie night orchestration: status radar broadcast $\to$ hangout ping $\to$ genre opinion poll $\to$ spin the wheel selection $\to$ meme vault chronicle.
- **Scenario 5**: Campus hackathon roster recruitment $\to$ booking carpool transit $\to$ winning prize and depositing share into flat emergency kitty reserve.

---

## 3. Feature Inventory Coverage Matrix

| # | Core Feature | Spec Source | Tier 1 Tests | Tier 2 Tests | Tier 3 Tests | Tier 4 Scenarios | Total Tests |
|---|---|---|---|---|---|---|---|
| 1 | Who's Free Radar & Pings | `ORIGINAL_REQUEST.md` § R2 | 5 | 7 | 1 | 2 | **15** |
| 2 | Ride & Carpool Board | `ORIGINAL_REQUEST.md` § R2 | 5 | 7 | 1 | 2 | **15** |
| 3 | Shared Chores Rotation Wheel | `ORIGINAL_REQUEST.md` § R2 | 5 | 8 | 1 | 2 | **16** |
| 4 | Borrow & Lost/Found Board | `ORIGINAL_REQUEST.md` § R2 | 5 | 7 | 1 | 1 | **14** |
| 5 | Group Wallet & Pairwise Debts | `ORIGINAL_REQUEST.md` § R2 | 5 | 10 | 1 | 2 | **18** |
| 6 | UPI Deep-Link QR Simulation | `ORIGINAL_REQUEST.md` § R2 | 5 | 10 | 1 | 2 | **18** |
| 7 | Daily Coding Challenge & Streak | `ORIGINAL_REQUEST.md` § R3 | 5 | 10 | 1 | 2 | **18** |
| 8 | Doubt Board & Code Snippets | `ORIGINAL_REQUEST.md` § R3 | 5 | 7 | 1 | 2 | **15** |
| 9 | Exam Countdown & Revision | `ORIGINAL_REQUEST.md` § R3 | 5 | 7 | 1 | 1 | **14** |
| 10 | Partner & Hackathon Finder | `ORIGINAL_REQUEST.md` § R3 | 5 | 7 | 1 | 2 | **15** |
| 11 | Group Polls & "This or That" | `ORIGINAL_REQUEST.md` § R4 | 5 | 9 | 1 | 2 | **17** |
| 12 | Watch & Play Together / Wheel | `ORIGINAL_REQUEST.md` § R4 | 5 | 7 | 1 | 2 | **15** |
| 13 | 30-Day Habit Tracker & Heatmap | `ORIGINAL_REQUEST.md` § R4 | 5 | 8 | 1 | 2 | **16** |
| 14 | Meme & Inside-Joke Vault | `ORIGINAL_REQUEST.md` § R4 | 5 | 7 | 1 | 2 | **15** |
| **Sum**| **All 13 Modules + Shell** | | **65** | **73** | **8** | **5** | **151** |

---

## 4. Algorithmic Invariants & Mathematical Formulations Verified

### 4.1 Greedy Debt Minimization
- **Conservation of Money**: $\sum_{i=1}^N B_i = 0$. Sum of all roommate net balances strictly equals zero.
- **Transaction Minimization**: For $N$ roommates, greedy matching between the largest debtor and largest creditor guarantees at most $N - 1$ total settlement transactions.
- **Cyclic Cancellation**: Transitive cycles ($A \to B \to C \to A$) resolve to 0 transfers.

### 4.2 Chore Permutation Ring
- **Cyclic Modulo Advancement**: $i_{t+1} = (i_t + 1) \pmod N$. Single-member rings cycle to self ($N=1$); multi-member rings traverse in fixed rotation order.
- **Audit Record Immutability**: Appends completed-by persona ID and ISO timestamp to prepend-ordered history log.

### 4.3 Hamilton Largest Remainder Poll Distribution
- **Zero-Vote Guard**: If total votes $V = 0$, returns 0% for all options without `#DIV/0!` or `NaN`.
- **Exact Integer Sum**: Computes base floors $I_k = \lfloor r_k \rfloor$ and remainder $f_k$. Allocates remaining $+1\%$ to highest remainders. Guarantees $\sum P_k = 100\%$.

### 4.4 Streak Calculation with Grace Period
- **1-Day Grace Period**: If user checked in yesterday ($Y$) but has not checked in today ($T$), active streak is preserved under `grace_period_pending_today`.
- **Reset Trigger**: Streak breaks to 0 only if gap $\ge 2$ calendar days.
- **Flame Tiers**: 0: None, 1-2: Spark (🔥), 3-6: Blaze (🔥🔥), 7-13: Inferno (🔥🔥🔥), 14+: Legendary Phoenix (⚡🔥🔥🔥).

---

## 5. Execution & Verification

Execute the entire test suite via:
```bash
node tests/run-all.mjs
```

### Exit Code Contract
- Exit Code `0`: All 151 tests passed across all 4 tiers.
- Exit Code `1`: Any assertion failure detected; detailed suite path, test name, and error stack trace printed.
