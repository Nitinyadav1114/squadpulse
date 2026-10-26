// ============================================================================
// Tier 2: Boundary Cases - Habits & 30-Day Heatmap Generation
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore, generate30DayHeatmap } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 2');

describe('Tier 2: Boundary & Corner Cases - Habit Heatmaps', () => {
  it('B59: should mark all 30 cells as future when startDate is in the future', () => {
    const today = new Date('2026-10-26T12:00:00Z');
    const futureStart = '2026-11-01'; // 6 days in future
    const cells = generate30DayHeatmap([], futureStart, today);

    assert.lengthOf(cells, 30);
    for (const c of cells) {
      assert.isTrue(c.isFuture);
      assert.isFalse(c.isCompleted);
    }
  });

  it('B60: should mark all cells as past when challenge ended 60 days ago', () => {
    const today = new Date('2026-10-26T12:00:00Z');
    const pastStart = '2026-06-01'; // Ended in July
    const cells = generate30DayHeatmap([], pastStart, today);

    assert.lengthOf(cells, 30);
    for (const c of cells) {
      assert.isFalse(c.isFuture);
      assert.isFalse(c.isToday);
    }
  });

  it('B61: should mark level 0 for uncompleted past days and level 1 for today', () => {
    const today = new Date('2026-10-26T12:00:00Z');
    const start = '2026-10-20'; // 6 days ago
    const cells = generate30DayHeatmap([], start, today);

    const pastUncompleted = cells.find(c => c.date === '2026-10-20');
    assert.strictEqual(pastUncompleted.level, 0);

    const todayCell = cells.find(c => c.date === '2026-10-26');
    assert.strictEqual(todayCell.level, 1);
  });

  it('B62: should set level 3 for all 30 completed days', () => {
    const today = new Date('2026-10-26T12:00:00Z');
    const start = '2026-09-20';
    const all30Dates = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date('2026-09-20');
      d.setDate(d.getDate() + i);
      all30Dates.push(d.toISOString().slice(0, 10));
    }
    const cells = generate30DayHeatmap(all30Dates, start, today);

    for (const c of cells) {
      assert.isTrue(c.isCompleted);
      assert.strictEqual(c.level, 3);
    }
  });

  it('B63: should throw when checking in on non-existent habit ID', () => {
    const store = createSimulatorStore();
    assert.throws(
      () => store.checkInHabit('fake-habit-id'),
      'Habit challenge not found',
      'Should throw on invalid habit ID'
    );
  });

  it('B64: should record poke from current persona to target persona', () => {
    const store = createSimulatorStore();
    const habitId = store.state.habits[0].id;

    store.setPersona('rhea');
    store.pokeMember(habitId, 'dev');

    const habit = store.state.habits[0];
    const latest = habit.pokes[habit.pokes.length - 1];
    assert.strictEqual(latest.fromPersonaId, 'rhea');
    assert.strictEqual(latest.toPersonaId, 'dev');
  });

  it('B65: should allow multiple sequential pokes creating distinct timestamped entries', () => {
    const store = createSimulatorStore();
    const habitId = store.state.habits[0].id;
    const initialCount = store.state.habits[0].pokes.length;

    store.setPersona('tanvi');
    store.pokeMember(habitId, 'dev');
    store.pokeMember(habitId, 'dev');

    assert.strictEqual(store.state.habits[0].pokes.length, initialCount + 2);
  });

  it('B66: should prevent duplicate check-in entries on the same date for a persona', () => {
    const store = createSimulatorStore();
    const habit = store.state.habits[0];
    const dateStr = '2026-10-26';

    store.setPersona('tanvi');
    store.checkInHabit(habit.id, dateStr);
    const countAfterFirst = habit.checkIns.tanvi.length;

    store.checkInHabit(habit.id, dateStr);
    assert.strictEqual(habit.checkIns.tanvi.length, countAfterFirst);
  });
});
