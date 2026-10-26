// ============================================================================
// Tier 2: Boundary Cases - Streaks, Leap Days & Date Boundaries
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { calculateStreak } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 2');

describe('Tier 2: Boundary & Corner Cases - Streaks & Calendar Math', () => {
  it('B28: should return streak 0 and flame None for empty date list', () => {
    const res = calculateStreak([]);
    assert.strictEqual(res.streak, 0);
    assert.strictEqual(res.flameTier, 'None');
    assert.strictEqual(res.status, 'inactive');
  });

  it('B29: should return streak 1 and Spark tier for single check-in today', () => {
    const today = new Date('2026-10-26T12:00:00Z');
    const res = calculateStreak(['2026-10-26'], today);
    assert.strictEqual(res.streak, 1);
    assert.strictEqual(res.flameTier, 'Spark');
    assert.strictEqual(res.status, 'completed_today');
  });

  it('B30: should return streak 1 and grace period status for single check-in yesterday', () => {
    const today = new Date('2026-10-26T12:00:00Z');
    const res = calculateStreak(['2026-10-25'], today);
    assert.strictEqual(res.streak, 1);
    assert.strictEqual(res.status, 'grace_period_pending_today');
    assert.strictEqual(res.flameTier, 'Spark');
  });

  it('B31: should reset streak to 0 with status broken when last check-in was 2 days ago', () => {
    const today = new Date('2026-10-26T12:00:00Z');
    // Checked in on 2026-10-24, missed 2026-10-25, viewing on 2026-10-26 -> gap of 2 days
    const res = calculateStreak(['2026-10-24', '2026-10-23'], today);
    assert.strictEqual(res.streak, 0);
    assert.strictEqual(res.flameTier, 'None');
    assert.strictEqual(res.status, 'broken');
  });

  it('B32: should deduplicate multiple submissions on the same calendar day', () => {
    const today = new Date('2026-10-26T12:00:00Z');
    const duplicateDates = ['2026-10-26', '2026-10-26', '2026-10-25', '2026-10-25'];
    const res = calculateStreak(duplicateDates, today);
    assert.strictEqual(res.streak, 2);
    assert.strictEqual(res.flameTier, 'Spark');
  });

  it('B33: should handle long 365-day streak and return Legendary Phoenix flame tier', () => {
    const today = new Date('2026-10-26T12:00:00Z');
    const dates = [];
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    const res = calculateStreak(dates, today);
    assert.strictEqual(res.streak, 365);
    assert.strictEqual(res.flameTier, 'Legendary Phoenix');
  });

  it('B34: should correctly handle leap year transition (Feb 28 -> Feb 29 -> Mar 1, 2024)', () => {
    // 2024 is a leap year (Feb 29 exists)
    const refDate = new Date('2024-03-01T12:00:00Z');
    const dates = ['2024-03-01', '2024-02-29', '2024-02-28'];

    const res = calculateStreak(dates, refDate);
    assert.strictEqual(res.streak, 3);
    assert.strictEqual(res.flameTier, 'Blaze');
  });

  it('B35: should correctly handle non-leap year transition (Feb 28 -> Mar 1, 2025)', () => {
    // 2025 is not a leap year (Feb has 28 days)
    const refDate = new Date('2025-03-01T12:00:00Z');
    const dates = ['2025-03-01', '2025-02-28'];

    const res = calculateStreak(dates, refDate);
    assert.strictEqual(res.streak, 2);
    assert.strictEqual(res.flameTier, 'Spark');
  });

  it('B36: should correctly handle year boundary transition (Dec 31 -> Jan 1)', () => {
    const refDate = new Date('2026-01-01T12:00:00Z');
    const dates = ['2026-01-01', '2025-12-31', '2025-12-30'];

    const res = calculateStreak(dates, refDate);
    assert.strictEqual(res.streak, 3);
    assert.strictEqual(res.flameTier, 'Blaze');
  });

  it('B37: should handle out-of-order date arrays by sorting chronologically', () => {
    const today = new Date('2026-10-26T12:00:00Z');
    // Scrambled array
    const scrambled = ['2026-10-24', '2026-10-26', '2026-10-25'];
    const res = calculateStreak(scrambled, today);
    assert.strictEqual(res.streak, 3);
  });
});
