#!/usr/bin/env node
// ============================================================================
// SquadPulse Unified Test Runner
// Executes all 4 tiers of tests and reports per-tier counts and verdicts.
// ============================================================================

import { registry, runSuite } from './test-framework.mjs';

// Tier 1: Feature Coverage (All 13 core modules across Daily Life, Study, and Fun)
import './tier1-features/daily-whos-free.test.mjs';
import './tier1-features/daily-carpool.test.mjs';
import './tier1-features/daily-chores.test.mjs';
import './tier1-features/daily-borrow.test.mjs';
import './tier1-features/daily-wallet-debts.test.mjs';
import './tier1-features/study-daily-coding.test.mjs';
import './tier1-features/study-doubt-board.test.mjs';
import './tier1-features/study-exam-countdown.test.mjs';
import './tier1-features/study-partner-finder.test.mjs';
import './tier1-features/fun-group-polls.test.mjs';
import './tier1-features/fun-watch-play.test.mjs';
import './tier1-features/fun-habit-tracker.test.mjs';
import './tier1-features/fun-meme-vault.test.mjs';

// Tier 2: Boundary & Corner Cases
import './tier2-boundary/boundary-wallet-debts.test.mjs';
import './tier2-boundary/boundary-chore-rotation.test.mjs';
import './tier2-boundary/boundary-polls-hamilton.test.mjs';
import './tier2-boundary/boundary-streaks-dates.test.mjs';
import './tier2-boundary/boundary-carpool.test.mjs';
import './tier2-boundary/boundary-borrow.test.mjs';
import './tier2-boundary/boundary-study-exams.test.mjs';
import './tier2-boundary/boundary-habits-heatmaps.test.mjs';
import './tier2-boundary/boundary-social-memes.test.mjs';

// Tier 3: Cross-Feature Combinations
import './tier3-cross-feature/persona-wallet-interaction.test.mjs';
import './tier3-cross-feature/chore-advance-assignee.test.mjs';
import './tier3-cross-feature/habit-checkin-heatmap.test.mjs';
import './tier3-cross-feature/poll-vote-distribution.test.mjs';
import './tier3-cross-feature/carpool-seat-allocation.test.mjs';
import './tier3-cross-feature/doubt-resolution-flow.test.mjs';
import './tier3-cross-feature/hackathon-roster-status.test.mjs';
import './tier3-cross-feature/coding-submission-leaderboard.test.mjs';

// Tier 4: Real-World Application Scenarios
import './tier4-scenarios/scenario-grocery-split.test.mjs';
import './tier4-scenarios/scenario-water-can-rotation.test.mjs';
import './tier4-scenarios/scenario-daily-coding-sprint.test.mjs';
import './tier4-scenarios/scenario-weekend-movie-night.test.mjs';
import './tier4-scenarios/scenario-hackathon-prep.test.mjs';

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

async function main() {
  const overallStart = performance.now();

  console.log(`${colors.bright}${colors.cyan}================================================================`);
  console.log(` 🚀 SquadPulse Comprehensive 4-Tier Test Runner`);
  console.log(`================================================================${colors.reset}`);
  console.log(`Total suites registered: ${registry.suites.length}`);

  for (const suite of registry.suites) {
    await runSuite(suite);
  }

  const durationSec = ((performance.now() - overallStart) / 1000).toFixed(2);
  const stats = registry.stats;

  const totalAll = stats['Tier 1'].total + stats['Tier 2'].total + stats['Tier 3'].total + stats['Tier 4'].total;
  const passedAll = stats['Tier 1'].passed + stats['Tier 2'].passed + stats['Tier 3'].passed + stats['Tier 4'].passed;
  const failedAll = stats['Tier 1'].failed + stats['Tier 2'].failed + stats['Tier 3'].failed + stats['Tier 4'].failed;

  console.log(`\n${colors.bright}================================================================`);
  console.log(` 📊 Test Suite Execution Summary (${durationSec}s)`);
  console.log(`================================================================${colors.reset}`);

  const tiers = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
  for (const t of tiers) {
    const s = stats[t];
    const statusColor = s.failed > 0 ? colors.red : colors.green;
    console.log(
      ` ${colors.bright}${t.padEnd(8)}:${colors.reset} ` +
      `${colors.green}Passed: ${String(s.passed).padStart(3)}${colors.reset} | ` +
      `${statusColor}Failed: ${String(s.failed).padStart(2)}${colors.reset} | ` +
      `Total: ${String(s.total).padStart(3)}`
    );
  }

  console.log(`----------------------------------------------------------------`);
  const finalColor = failedAll === 0 ? colors.green : colors.red;
  console.log(
    ` ${colors.bright}Grand Total:${colors.reset} ` +
    `${colors.green}Passed: ${String(passedAll).padStart(3)}${colors.reset} | ` +
    `${finalColor}Failed: ${String(failedAll).padStart(2)}${colors.reset} | ` +
    `Total: ${String(totalAll).padStart(3)}`
  );
  console.log(`================================================================`);

  if (failedAll > 0) {
    console.log(`\n${colors.red}${colors.bright}❌ FAILURES DETECTED (${failedAll}):${colors.reset}`);
    for (const f of registry.failures) {
      console.log(` - [${f.tier}] ${f.suite} > ${f.testName}: ${f.error.message || f.error}`);
    }
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bright}🎉 ALL ${passedAll} TESTS PASSED SUCCESSFULLY! (Tier 1: ${stats['Tier 1'].passed}, Tier 2: ${stats['Tier 2'].passed}, Tier 3: ${stats['Tier 3'].passed}, Tier 4: ${stats['Tier 4'].passed})${colors.reset}\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error in test runner:', err);
  process.exit(1);
});
