// ============================================================================
// Tier 3: Cross-Feature - Habit Check-In <-> Heatmap Cell & Streak Promotion
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore, calculateStreak, generate30DayHeatmap } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 3');

describe('Tier 3: Cross-Feature - Habit Check-In, Heatmap & Streak', () => {
  it('should immediately update heatmap cell and promote streak upon check-in', () => {
    const store = createSimulatorStore();
    const habit = store.state.habits[0];
    const today = new Date('2026-10-26T12:00:00Z');
    const todayStr = '2026-10-26';

    // Dev has past check-ins on 24th and 25th, but not yet on 26th
    habit.checkIns.dev = ['2026-10-24', '2026-10-25'];

    // Before check-in:
    const streakBefore = calculateStreak(habit.checkIns.dev, today);
    assert.strictEqual(streakBefore.streak, 2);
    assert.strictEqual(streakBefore.flameTier, 'Spark');
    assert.strictEqual(streakBefore.status, 'grace_period_pending_today');

    const heatmapBefore = generate30DayHeatmap(habit.checkIns.dev, habit.startDate, today);
    const cellBefore = heatmapBefore.find(c => c.date === todayStr);
    assert.isFalse(cellBefore.isCompleted);
    assert.strictEqual(cellBefore.level, 1); // today uncompleted

    // Dev checks in today
    store.setPersona('dev');
    store.checkInHabit(habit.id, todayStr);

    // After check-in:
    const streakAfter = calculateStreak(habit.checkIns.dev, today);
    assert.strictEqual(streakAfter.streak, 3);
    assert.strictEqual(streakAfter.flameTier, 'Blaze'); // Promoted from Spark to Blaze!
    assert.strictEqual(streakAfter.status, 'completed_today');

    const heatmapAfter = generate30DayHeatmap(habit.checkIns.dev, habit.startDate, today);
    const cellAfter = heatmapAfter.find(c => c.date === todayStr);
    assert.isTrue(cellAfter.isCompleted);
    assert.strictEqual(cellAfter.level, 3); // elevated to completed level
  });
});
