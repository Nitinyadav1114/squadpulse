// ============================================================================
// Tier 1: Fun & Culture - 30-Day Habit Tracker & Heatmap
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore, calculateStreak, generate30DayHeatmap } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 1');

describe('Tier 1: Fun & Culture - 30-Day Habit Challenge Tracker', () => {
  it('should record a daily habit check-in for the current persona', () => {
    const store = createSimulatorStore();
    const habit = store.state.habits[0];
    const todayStr = new Date().toISOString().slice(0, 10);

    // Dev was empty in seed
    assert.strictEqual(habit.checkIns.dev.length, 0);

    store.setPersona('dev');
    store.checkInHabit(habit.id, todayStr);

    assert.ok(habit.checkIns.dev.includes(todayStr));
  });

  it('should generate an exact 30-day heatmap grid with dates and level indicators', () => {
    const today = new Date('2026-10-26T12:00:00Z');
    const startStr = '2026-10-01';
    const checkIns = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-26'];

    const grid = generate30DayHeatmap(checkIns, startStr, today);
    assert.lengthOf(grid, 30);
    assert.strictEqual(grid[0].dayNumber, 1);
    assert.strictEqual(grid[0].date, '2026-10-01');
    assert.isTrue(grid[0].isCompleted);
    assert.strictEqual(grid[0].level, 3);

    // Day 26 should be today
    const day26 = grid.find(c => c.date === '2026-10-26');
    assert.ok(day26);
    assert.isTrue(day26.isToday);
  });

  it('should calculate consecutive day streak and determine flame tier accurately', () => {
    const refDate = new Date('2026-10-26T12:00:00Z');
    const consecutiveDates = [
      '2026-10-26',
      '2026-10-25',
      '2026-10-24',
      '2026-10-23',
    ];

    const res = calculateStreak(consecutiveDates, refDate);
    assert.strictEqual(res.streak, 4);
    assert.strictEqual(res.flameTier, 'Blaze'); // 3 to 6 is Blaze
    assert.strictEqual(res.status, 'completed_today');
  });

  it('should grant 1-day grace period if checked in yesterday but not yet today', () => {
    const refDate = new Date('2026-10-26T12:00:00Z');
    // User checked in yesterday (2026-10-25) and day before (2026-10-24), but not yet on 2026-10-26
    const dates = ['2026-10-25', '2026-10-24'];

    const res = calculateStreak(dates, refDate);
    assert.strictEqual(res.streak, 2);
    assert.strictEqual(res.status, 'grace_period_pending_today');
    assert.strictEqual(res.flameTier, 'Spark');
  });

  it('should allow sending friendly poke reminders to flatmates', () => {
    const store = createSimulatorStore();
    const habit = store.state.habits[0];

    store.setPersona('aman');
    store.pokeMember(habit.id, 'dev');

    assert.isAtLeast(habit.pokes.length, 1);
    const latest = habit.pokes[habit.pokes.length - 1];
    assert.strictEqual(latest.fromPersonaId, 'aman');
    assert.strictEqual(latest.toPersonaId, 'dev');
    assert.ok(latest.timestamp);
  });
});
