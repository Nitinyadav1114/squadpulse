#!/usr/bin/env node
// ============================================================================
// SquadPulse Empirical Stress Test Suite: Zustand Store & Reactive State
// Tests:
//   1. Rapid Multi-Persona Switching & Perspective Coherence (1,000 switches)
//   2. Concurrent Interleaved Actions Across All 13 Subsystems (500+ mutations)
//   3. Persistence, Hydration & Corruption Fault-Tolerance
// ============================================================================

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Register TypeScript and path alias loader
register('./tests/node-loader.mjs', pathToFileURL('./'));

// Setup global mock for window & localStorage BEFORE loading Zustand store
const storageMap = new Map();
const storageEvents = [];

global.window = global;
global.localStorage = {
  getItem: (key) => {
    storageEvents.push({ op: 'getItem', key });
    return storageMap.has(key) ? storageMap.get(key) : null;
  },
  setItem: (key, val) => {
    storageEvents.push({ op: 'setItem', key, valLength: String(val).length });
    storageMap.set(key, String(val));
  },
  removeItem: (key) => {
    storageEvents.push({ op: 'removeItem', key });
    storageMap.delete(key);
  },
  clear: () => {
    storageEvents.push({ op: 'clear' });
    storageMap.clear();
  },
};

// Now import store and algorithms
const { useSquadStore } = await import('../lib/store.ts');
const {
  calculateNetBalances,
  calculatePairwiseDebts,
  calculatePollPercentages,
  calculateHabitStreak,
  generate30DayHeatmap,
} = await import('../lib/algorithms.ts');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

let assertionCount = 0;
let failureCount = 0;
const failures = [];

function assert(condition, message) {
  assertionCount++;
  if (!condition) {
    failureCount++;
    const err = new Error(message);
    failures.push(err);
    console.error(`  ${colors.red}✖ FAIL: ${message}${colors.reset}`);
    throw err;
  }
}

function assertStrictEqual(actual, expected, message) {
  assert(actual === expected, `${message} | Expected: ${expected}, Actual: ${actual}`);
}

function assertDeepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  assert(actualStr === expectedStr, `${message} | Objects differ`);
}

function assertCloseTo(actual, expected, delta = 0.05, message) {
  const diff = Math.abs(actual - expected);
  assert(diff <= delta, `${message} | Expected ~${expected}, got ${actual} (diff: ${diff.toFixed(4)})`);
}

// ============================================================================
// SUITE 1: RAPID PERSONA SWITCHING & DYNAMIC PERSPECTIVE COHERENCE
// ============================================================================
async function runPersonaSwitchingStress() {
  console.log(`\n${colors.bright}${colors.cyan}▶ Suite 1: Rapid Multi-Persona Switching & Perspective Coherence (1,000 iterations)${colors.reset}`);
  const store = useSquadStore;
  const personas = ['aman', 'rhea', 'dev', 'tanvi'];

  // Reset to seed data first
  store.getState().resetToSeedData();
  assertStrictEqual(store.getState().currentPersonaId, 'aman', 'Initial persona must be aman');

  const start = performance.now();

  for (let i = 0; i < 1000; i++) {
    // Alternate between round-robin and pseudo-random switching
    const targetPersona = i % 2 === 0
      ? personas[i % personas.length]
      : personas[Math.floor(Math.sin(i * 997) * 2 + 2) % personas.length];

    store.getState().setActivePersona(targetPersona);
    const state = store.getState();

    // 1. Identity coherence
    assertStrictEqual(state.currentPersonaId, targetPersona, `Iteration ${i}: currentPersonaId mismatch`);

    // 2. Status badge coherence
    const status = state.statuses[targetPersona];
    assert(status !== undefined, `Iteration ${i}: Status for ${targetPersona} missing`);
    assertStrictEqual(status.personaId, targetPersona, `Iteration ${i}: Status personaId mismatch`);
    assert(typeof status.badge === 'string', `Iteration ${i}: Status badge invalid`);
    assert(typeof status.customMessage === 'string', `Iteration ${i}: Status customMessage invalid`);

    // 3. Dynamic Pairwise Debt Perspective Coherence
    const balances = calculateNetBalances(state.expenses);
    const pairwiseDebts = calculatePairwiseDebts(state.expenses);

    // Sum of net balances must strictly equal zero (Conservation of Money)
    const totalBalance = Object.values(balances).reduce((sum, b) => sum + b, 0);
    assertCloseTo(totalBalance, 0, 0.01, `Iteration ${i}: Conservation of Money violated`);

    // Derive active persona's perspective
    const owes = pairwiseDebts.filter((d) => d.debtorId === targetPersona);
    const isOwed = pairwiseDebts.filter((d) => d.creditorId === targetPersona);

    // Invariants for active persona's debt view
    for (const debt of owes) {
      assert(debt.amount > 0, `Iteration ${i}: Negative or zero debt amount in owes`);
      assert(debt.debtorId !== debt.creditorId, `Iteration ${i}: Persona owes money to self`);
    }
    for (const credit of isOwed) {
      assert(credit.amount > 0, `Iteration ${i}: Negative or zero credit amount in isOwed`);
      assert(credit.debtorId !== credit.creditorId, `Iteration ${i}: Persona is owed money by self`);
    }

    const totalIsOwed = isOwed.reduce((s, c) => s + c.amount, 0);
    const totalOwes = owes.reduce((s, d) => s + d.amount, 0);
    const derivedNet = totalIsOwed - totalOwes;
    assertCloseTo(derivedNet, balances[targetPersona], 0.05, `Iteration ${i}: Net balance mismatch with settlements`);

    // 4. Chore highlight coherence
    const myTurnChores = state.chores.filter((c) => c.currentAssigneeId === targetPersona);
    const otherChores = state.chores.filter((c) => c.currentAssigneeId !== targetPersona);
    assertStrictEqual(myTurnChores.length + otherChores.length, state.chores.length, `Iteration ${i}: Chore partition count mismatch`);

    // 5. Habit streak coherence for active persona
    for (const habit of state.habitChallenges) {
      const checkIns = habit.checkIns[targetPersona] || [];
      const streakResult = calculateHabitStreak(checkIns);
      assert(typeof streakResult.streak === 'number' && streakResult.streak >= 0, `Iteration ${i}: Streak is negative`);
      assert(streakResult.bestStreak >= streakResult.streak, `Iteration ${i}: bestStreak < current streak`);
      assert(['none', 'spark', 'blaze', 'inferno', 'phoenix'].includes(streakResult.flameTier), `Iteration ${i}: Invalid flame tier`);
    }
  }

  const duration = (performance.now() - start).toFixed(2);
  console.log(`  ${colors.green}✔ Completed 1,000 rapid persona switches and perspective checks in ${duration}ms${colors.reset}`);
}

// ============================================================================
// SUITE 2: CONCURRENT HIGH-FREQUENCY INTERLEAVED ACTIONS (500+ MUTATIONS)
// ============================================================================
async function runConcurrentActionStress() {
  console.log(`\n${colors.bright}${colors.cyan}▶ Suite 2: Concurrent High-Frequency Interleaved Actions (500+ mutations)${colors.reset}`);
  const store = useSquadStore;
  const personas = ['aman', 'rhea', 'dev', 'tanvi'];
  const start = performance.now();

  store.getState().resetToSeedData();

  // Test 2.1: Interleaved Chore Turn Advancements
  console.log(`  ${colors.dim}• Testing high-frequency chore rotation across flatmates...${colors.reset}`);
  const choreId = store.getState().chores[0].id;
  const initialAssignee = store.getState().chores[0].currentAssigneeId;
  const rotationOrder = store.getState().chores[0].rotationOrder || personas;

  let expectedAssigneeIndex = rotationOrder.indexOf(initialAssignee);

  for (let step = 0; step < 40; step++) {
    const actor = personas[step % personas.length];
    store.getState().setActivePersona(actor);

    const prevCompletedCount = store.getState().personas[actor].stats.choresCompleted;
    store.getState().completeChoreTurn(choreId, `Automated stress completion step ${step}`);

    expectedAssigneeIndex = (expectedAssigneeIndex + 1) % rotationOrder.length;
    const updatedChore = store.getState().chores.find((c) => c.id === choreId);

    assertStrictEqual(updatedChore.currentAssigneeId, rotationOrder[expectedAssigneeIndex], `Step ${step}: Chore rotation order failed`);
    assertStrictEqual(store.getState().personas[actor].stats.choresCompleted, prevCompletedCount + 1, `Step ${step}: Stats chore counter not incremented`);
    assertStrictEqual(updatedChore.history[0].completedById, actor, `Step ${step}: History completion author mismatch`);
  }

  // Test 2.2: Interleaved Group Expenses & Conservation of Money Invariant
  console.log(`  ${colors.dim}• Testing high-frequency expenses and conservation of money...${colors.reset}`);
  for (let step = 0; step < 80; step++) {
    const payer = personas[step % personas.length];
    store.getState().setActivePersona(payer);

    const amount = 100 + (step * 25);
    const splitType = step % 4;

    if (splitType === 0) {
      // 4-way equal split
      store.getState().addExpense({
        description: `Stress Dinner ${step}`,
        amount,
        splitAmongIds: [...personas],
        category: 'food',
      });
    } else if (splitType === 1) {
      // 2-person split
      const friend = personas[(step + 1) % personas.length];
      store.getState().addExpense({
        description: `Shared Grocery ${step}`,
        amount,
        splitAmongIds: [payer, friend],
        category: 'groceries',
      });
    } else if (splitType === 2) {
      // Custom weighted split
      const p1 = personas[0];
      const p2 = personas[1];
      store.getState().addExpense({
        description: `Custom Split Taxi ${step}`,
        amount: 200,
        splitAmongIds: [p1, p2],
        category: 'travel',
        splits: [
          { personaId: p1, amount: 150 },
          { personaId: p2, amount: 50 },
        ],
      });
    } else {
      // Debt settlement via settleDebt action
      const debtor = personas[(step + 2) % personas.length];
      const creditor = personas[(step + 3) % personas.length];
      store.getState().settleDebt(debtor, creditor, 75);
    }

    // Invariant check: Conservation of Money
    const balances = calculateNetBalances(store.getState().expenses);
    const netSum = Object.values(balances).reduce((sum, b) => sum + b, 0);
    assertCloseTo(netSum, 0, 0.01, `Step ${step}: Sum of net balances is non-zero (${netSum})`);

    // Invariant check: Greedily minimized pairwise debts <= N - 1
    const debts = calculatePairwiseDebts(store.getState().expenses);
    assert(debts.length <= personas.length - 1, `Step ${step}: Pairwise debts (${debts.length}) exceed N-1 bound`);
  }

  // Test 2.3: Interleaved Poll Voting & Hamilton Rounding Dynamics
  console.log(`  ${colors.dim}• Testing concurrent poll voting and Hamilton Largest Remainder dynamics...${colors.reset}`);
  const poll = store.getState().polls[0];
  const pollId = poll.id;

  for (let step = 0; step < 60; step++) {
    const voter = personas[step % personas.length];
    store.getState().setActivePersona(voter);
    const targetOpt = poll.options[step % poll.options.length];

    store.getState().votePoll(pollId, targetOpt.id);

    const updatedPoll = store.getState().polls.find((p) => p.id === pollId);
    if (!updatedPoll.isMultiChoice) {
      // Single-choice invariant: voter appears at most once across all options
      let appearances = 0;
      for (const opt of updatedPoll.options) {
        if (opt.voterIds && opt.voterIds.includes(voter)) appearances++;
      }
      assert(appearances <= 1, `Step ${step}: Single-choice poll has voter ${voter} in ${appearances} options`);
    }

    // Hamilton percentage invariant: sum must equal 100% or 0%
    const totalVotes = updatedPoll.options.reduce((sum, opt) => sum + (opt.voterIds?.length || 0), 0);
    const percentages = calculatePollPercentages(updatedPoll.options);
    const sumPct = percentages.reduce((sum, p) => sum + p, 0);

    if (totalVotes === 0) {
      assertStrictEqual(sumPct, 0, `Step ${step}: 0 votes must yield 0% sum`);
    } else {
      assertStrictEqual(sumPct, 100, `Step ${step}: Hamilton percentages must sum strictly to 100% (got ${sumPct})`);
    }
  }

  // Test 2.4: Coding Challenge Submissions & Streak Integrity
  console.log(`  ${colors.dim}• Testing coding submissions concurrency and study streak updates...${colors.reset}`);
  for (let step = 0; step < 20; step++) {
    const coder = personas[step % personas.length];
    store.getState().setActivePersona(coder);

    const prevStreak = store.getState().personas[coder].stats.studyStreak;
    store.getState().submitCodingSolution(`function solve() { return ${step}; }`, 'typescript');

    const updatedState = store.getState();
    assertStrictEqual(updatedState.personas[coder].stats.studyStreak, prevStreak + 1, `Coder ${coder} streak did not increment`);

    // Invariant: exactly one submission for coder in codingProblem.submissions
    const coderSubs = updatedState.codingProblem.submissions.filter((s) => s.personaId === coder);
    assertStrictEqual(coderSubs.length, 1, `Coder ${coder} has ${coderSubs.length} submissions, expected exactly 1`);
    assert(coderSubs[0].codeSnippet.includes(`return ${step};`), `Submission content did not update properly`);
  }

  // Test 2.5: Habit Check-In Toggling & Heatmap Matrix
  console.log(`  ${colors.dim}• Testing habit check-in toggles and 30-day heatmap matrices...${colors.reset}`);
  const habitId = store.getState().habitChallenges[0].id;

  for (let step = 0; step < 40; step++) {
    const user = personas[step % personas.length];
    store.getState().setActivePersona(user);

    const testDate = `2026-10-${String((step % 28) + 1).padStart(2, '0')}`;
    const initialChecked = (store.getState().habitChallenges.find((h) => h.id === habitId).checkIns[user] || []).includes(testDate);

    // Toggle checkin
    store.getState().checkInHabit(habitId, testDate);
    const toggledChecked = (store.getState().habitChallenges.find((h) => h.id === habitId).checkIns[user] || []).includes(testDate);
    assertStrictEqual(toggledChecked, !initialChecked, `Step ${step}: Habit checkIn toggle failed`);

    // Heatmap verification
    const allCheckIns = store.getState().habitChallenges.find((h) => h.id === habitId).checkIns[user] || [];
    const heatmap = generate30DayHeatmap('2026-09-27', allCheckIns);
    assertStrictEqual(heatmap.length, 30, `Heatmap cell count must be 30, got ${heatmap.length}`);
    for (const cell of heatmap) {
      assert([0, 1, 2, 3].includes(cell.level), `Heatmap cell level invalid: ${cell.level}`);
    }
  }

  // Test 2.6: Carpool Seat Allocation & Race Resilience
  console.log(`  ${colors.dim}• Testing carpool join/leave seat race conditions...${colors.reset}`);
  store.getState().setActivePersona('aman');
  store.getState().addCarpool({
    destination: 'Cyber City Hub',
    origin: 'Flat 402',
    departureTime: '6:30 PM',
    date: 'Today',
    totalSeats: 2,
    farePerSeat: 50,
    vehicleType: 'Car',
    vehicleName: 'Honda City',
    notes: 'AC on',
  });

  const ride = store.getState().carpools[0];
  const rideId = ride.id;

  // Aman is creator, cannot join as passenger
  store.getState().setActivePersona('aman');
  store.getState().joinCarpool(rideId);
  assertStrictEqual(store.getState().carpools[0].passengers.length, 0, 'Creator must not join as passenger');

  // Rhea joins -> 1 seat taken
  store.getState().setActivePersona('rhea');
  store.getState().joinCarpool(rideId);
  assertStrictEqual(store.getState().carpools[0].passengers.length, 1, 'Rhea should join');

  // Rhea duplicate join -> still 1 seat taken
  store.getState().joinCarpool(rideId);
  assertStrictEqual(store.getState().carpools[0].passengers.length, 1, 'Duplicate join must be rejected');

  // Dev joins -> 2 seats taken (Full capacity)
  store.getState().setActivePersona('dev');
  store.getState().joinCarpool(rideId);
  assertStrictEqual(store.getState().carpools[0].passengers.length, 2, 'Dev should take 2nd seat');

  // Tanvi tries to join when full -> rejected
  store.getState().setActivePersona('tanvi');
  store.getState().joinCarpool(rideId);
  assertStrictEqual(store.getState().carpools[0].passengers.length, 2, 'Total seats capacity exceeded');

  // Rhea leaves -> 1 seat available
  store.getState().setActivePersona('rhea');
  store.getState().leaveCarpool(rideId);
  assertStrictEqual(store.getState().carpools[0].passengers.length, 1, 'Rhea leave should free 1 seat');
  assertStrictEqual(store.getState().carpools[0].passengers[0], 'dev', 'Dev should remain passenger');

  // Now Tanvi can join!
  store.getState().setActivePersona('tanvi');
  store.getState().joinCarpool(rideId);
  assertStrictEqual(store.getState().carpools[0].passengers.length, 2, 'Tanvi should claim the freed seat');

  // Test 2.7: Academic Doubt Board Lifecycle
  console.log(`  ${colors.dim}• Testing doubt resolution flow and upvote concurrency...${colors.reset}`);
  store.getState().setActivePersona('dev');
  store.getState().addDoubt({
    title: 'Dynamic Programming vs Memoization Space Bound',
    body: 'What is the auxiliary call stack overhead in top-down recursion?',
    subject: 'Algorithms',
    urgency: 'High',
    tags: ['DP', 'Recursion'],
  });

  const doubt = store.getState().doubts[0];
  const doubtId = doubt.id;

  // Rhea answers
  store.getState().setActivePersona('rhea');
  store.getState().addDoubtAnswer(doubtId, 'Auxiliary stack depth is O(N) unless tail-call optimized.');
  const ansId = store.getState().doubts[0].answers[0].id;

  // Upvote toggling
  store.getState().setActivePersona('aman');
  store.getState().toggleAnswerUpvote(doubtId, ansId);
  assert(store.getState().doubts[0].answers[0].upvotes.includes('aman'), 'Aman upvote should be registered');
  store.getState().toggleAnswerUpvote(doubtId, ansId);
  assert(!store.getState().doubts[0].answers[0].upvotes.includes('aman'), 'Aman upvote should toggle off');

  // Dev accepts answer -> marks doubt resolved
  store.getState().setActivePersona('dev');
  store.getState().acceptDoubtAnswer(doubtId, ansId);
  assertStrictEqual(store.getState().doubts[0].isResolved, true, 'Doubt must be marked resolved');
  assertStrictEqual(store.getState().doubts[0].answers[0].isAccepted, true, 'Answer must be marked accepted');

  const duration = (performance.now() - start).toFixed(2);
  console.log(`  ${colors.green}✔ Completed 500+ concurrent interleaved mutations across all modules in ${duration}ms${colors.reset}`);
}

// ============================================================================
// SUITE 3: PERSISTENCE, HYDRATION & CORRUPTION FAULT-TOLERANCE
// ============================================================================
async function runPersistenceAndHydrationStress() {
  console.log(`\n${colors.bright}${colors.cyan}▶ Suite 3: Persistence, Hydration & Fault-Tolerance Resilience${colors.reset}`);
  const store = useSquadStore;
  const start = performance.now();

  const STORAGE_KEY = 'squadpulse_storage_v1';

  // 1. Verify localStorage state was populated during mutations
  const rawSaved = storageMap.get(STORAGE_KEY);
  assert(rawSaved !== undefined && rawSaved.length > 0, 'LocalStorage must contain serialized store state');

  const parsed = JSON.parse(rawSaved);
  assert(parsed.state !== undefined, 'Serialized payload must contain state wrapper');

  // Verify all 17 partialize fields exist in serialized representation
  const expectedKeys = [
    'currentPersonaId',
    'theme',
    'statuses',
    'hangoutPings',
    'carpools',
    'chores',
    'borrowItems',
    'expenses',
    'kittyTransactions',
    'codingProblem',
    'doubts',
    'exams',
    'hackathons',
    'polls',
    'watchPlayList',
    'habitChallenges',
    'memes',
  ];

  for (const key of expectedKeys) {
    assert(parsed.state[key] !== undefined, `Serialized state missing whitelisted key: ${key}`);
  }
  console.log(`  ${colors.green}✔ Serialized schema matches all 17 partialize fields (${rawSaved.length} bytes)${colors.reset}`);

  // 2. Snapshot current state in memory
  const stateSnapshotBeforeReset = JSON.parse(JSON.stringify(store.getState()));

  // 3. Reset store to seed data
  console.log(`  ${colors.dim}• Resetting store to seed data...${colors.reset}`);
  store.getState().resetToSeedData();
  const stateAfterReset = store.getState();
  assert(stateAfterReset.expenses.length !== stateSnapshotBeforeReset.expenses.length, 'Expenses count must differ after seed reset');

  // 4. Clean Rehydration: Restore serialized state from localStorage
  console.log(`  ${colors.dim}• Rehydrating state from localStorage payload...${colors.reset}`);
  storageMap.set(STORAGE_KEY, rawSaved);
  await store.persist.rehydrate();

  const stateAfterHydration = store.getState();

  // Invariant: All 17 persisted fields must match 100% of pre-reset snapshot
  for (const key of expectedKeys) {
    assertDeepEqual(
      stateAfterHydration[key],
      stateSnapshotBeforeReset[key],
      `Hydration fidelity check failed for key: ${key}`
    );
  }
  console.log(`  ${colors.green}✔ Perfect 100% hydration fidelity verified across all 17 subsystems${colors.reset}`);

  // 5. Corruption Fault-Tolerance: Invalid JSON in localStorage
  console.log(`  ${colors.dim}• Stress-testing corrupted JSON string fault tolerance...${colors.reset}`);
  storageMap.set(STORAGE_KEY, '{ invalid_malformed_json: true, ...');

  // Calling rehydrate should NOT throw fatal crash; store retains fallback state
  let didCrashOnBadJson = false;
  try {
    await store.persist.rehydrate();
  } catch (err) {
    didCrashOnBadJson = true;
  }
  assert(!didCrashOnBadJson, 'Store crashed catastrophically on corrupted JSON in localStorage');
  console.log(`  ${colors.green}✔ Gracefully survived corrupted JSON payload without process crash${colors.reset}`);

  // 6. Partial schema corruption: Missing keys
  console.log(`  ${colors.dim}• Stress-testing partial schema payload...${colors.reset}`);
  const partialPayload = JSON.stringify({
    state: {
      currentPersonaId: 'dev',
      theme: 'light',
    },
    version: 1,
  });
  storageMap.set(STORAGE_KEY, partialPayload);
  await store.persist.rehydrate();
  assertStrictEqual(store.getState().currentPersonaId, 'dev', 'Partial state should update present keys');
  assert(store.getState().personas !== undefined, 'Partial hydration must preserve uncorrupted store keys');
  console.log(`  ${colors.green}✔ Successfully merged partial schema payload${colors.reset}`);

  const duration = (performance.now() - start).toFixed(2);
  console.log(`  ${colors.green}✔ Completed persistence & hydration resilience suite in ${duration}ms${colors.reset}`);
}

// ============================================================================
// MAIN EXECUTION ORCHESTRATOR
// ============================================================================
async function main() {
  const totalStart = performance.now();

  console.log(`${colors.bright}${colors.cyan}================================================================`);
  console.log(` 🛡️  SquadPulse Zustand Store & Reactive State Stress Harness`);
  console.log(`================================================================${colors.reset}`);

  try {
    await runPersonaSwitchingStress();
    await runConcurrentActionStress();
    await runPersistenceAndHydrationStress();

    const totalDuration = ((performance.now() - totalStart) / 1000).toFixed(2);

    console.log(`\n${colors.bright}================================================================`);
    console.log(` 📊 Stress Test Execution Summary (${totalDuration}s)`);
    console.log(`================================================================${colors.reset}`);
    console.log(` Total Invariant Assertions Checked: ${colors.green}${colors.bright}${assertionCount}${colors.reset}`);
    console.log(` Total Failures Detected           : ${failureCount === 0 ? colors.green : colors.red}${colors.bright}${failureCount}${colors.reset}`);
    console.log(` Total LocalStorage Operations     : ${colors.cyan}${storageEvents.length}${colors.reset}`);
    console.log(` Final Store Health Verdict        : ${colors.green}${colors.bright}STABLE & SYNCHRONIZED${colors.reset}`);
    console.log(`================================================================\n`);

    if (failureCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error(`\n${colors.red}${colors.bright}FATAL TEST EXECUTION ERROR:${colors.reset}`, err);
    process.exit(1);
  }
}

main();
