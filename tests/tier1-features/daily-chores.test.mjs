// ============================================================================
// Tier 1: Daily Life - Shared Chores Rotation Wheel
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 1');

describe('Tier 1: Daily Life - Shared Chores Rotation Wheel', () => {
  it('should advance chore turn to the next member in sequence upon completion', () => {
    const store = createSimulatorStore();
    const chore = store.state.chores.find(c => c.id === 'chore-groceries');
    // rotationOrder: ['aman', 'rhea', 'dev', 'tanvi']
    // current: 'aman'
    assert.strictEqual(chore.currentAssigneeId, 'aman');

    store.setPersona('aman');
    const updated = store.completeChoreTurn('chore-groceries', 'Bought milk, eggs, bread');

    assert.strictEqual(updated.currentAssigneeId, 'rhea');
  });

  it('should advance through full 4-roommate cycle and return to the first member', () => {
    const store = createSimulatorStore();
    const choreId = 'chore-cleaning'; // current: dev -> tanvi -> aman -> rhea -> dev

    const chore = store.state.chores.find(c => c.id === choreId);
    assert.strictEqual(chore.currentAssigneeId, 'dev');

    store.setPersona('dev');
    let res = store.completeChoreTurn(choreId, 'Done');
    assert.strictEqual(res.currentAssigneeId, 'tanvi');

    store.setPersona('tanvi');
    res = store.completeChoreTurn(choreId, 'Done');
    assert.strictEqual(res.currentAssigneeId, 'aman');

    store.setPersona('aman');
    res = store.completeChoreTurn(choreId, 'Done');
    assert.strictEqual(res.currentAssigneeId, 'rhea');

    store.setPersona('rhea');
    res = store.completeChoreTurn(choreId, 'Done');
    assert.strictEqual(res.currentAssigneeId, 'dev');
  });

  it('should append an audit record to completion history with user and note', () => {
    const store = createSimulatorStore();
    store.setPersona('tanvi');
    const updated = store.completeChoreTurn('chore-water', 'Replaced 20L water can at reception');

    assert.isAtLeast(updated.history.length, 1);
    const latest = updated.history[0];
    assert.strictEqual(latest.completedById, 'tanvi');
    assert.strictEqual(latest.note, 'Replaced 20L water can at reception');
    assert.ok(latest.timestamp);
  });

  it('should increment personal choresCompleted counter in stats', () => {
    const store = createSimulatorStore();
    const initialAmanChores = store.state.personas.find(p => p.id === 'aman').stats.choresCompleted;

    store.setPersona('aman');
    store.completeChoreTurn('chore-groceries', 'Completed run');

    const updatedAman = store.state.personas.find(p => p.id === 'aman');
    assert.strictEqual(updatedAman.stats.choresCompleted, initialAmanChores + 1);
  });

  it('should track multiple independent chore categories without cross-interference', () => {
    const store = createSimulatorStore();
    const gChore = store.state.chores.find(c => c.category === 'groceries');
    const wChore = store.state.chores.find(c => c.category === 'water');

    store.setPersona(gChore.currentAssigneeId);
    store.completeChoreTurn(gChore.id, 'Groceries done');

    // Water chore should remain untouched
    const wAfter = store.state.chores.find(c => c.id === wChore.id);
    assert.strictEqual(wAfter.currentAssigneeId, wChore.currentAssigneeId);
  });
});
