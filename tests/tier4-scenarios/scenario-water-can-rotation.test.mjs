// ============================================================================
// Tier 4: Scenario 2 - Water Can Refill & Chore Rotation Audit
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 4');

describe('Tier 4: Scenario 2 - Water Can Refill Chore Lifecycle', () => {
  it('should simulate a hostel water can refill cycle across roommates with full audit trail', () => {
    const store = createSimulatorStore();
    const chore = store.state.chores.find(c => c.id === 'chore-water');
    // Rotation order: ['aman', 'rhea', 'dev', 'tanvi']
    // Current assignee in seed: 'tanvi'
    assert.strictEqual(chore.currentAssigneeId, 'tanvi');

    // 1. Tanvi notices the 20L can is empty and performs the exchange
    store.setPersona('tanvi');
    const update1 = store.completeChoreTurn(
      'chore-water',
      'Exchanged empty bubble top at hostel block reception. Paid ₹40 token.'
    );

    // 2. Next turn automatically rotates to Aman (index 3 -> 0)
    assert.strictEqual(update1.currentAssigneeId, 'aman');
    assert.strictEqual(update1.history[0].completedById, 'tanvi');

    // 3. Next day: Aman carries up the new jar and marks completed
    store.setPersona('aman');
    const update2 = store.completeChoreTurn(
      'chore-water',
      'Placed fresh Bisleri jar on dispenser in corridor'
    );

    // 4. Next turn rotates to Rhea (index 0 -> 1)
    assert.strictEqual(update2.currentAssigneeId, 'rhea');
    assert.strictEqual(update2.history[0].completedById, 'aman');
    assert.strictEqual(update2.history[1].completedById, 'tanvi');
    assert.lengthOf(update2.history, 2);
  });
});
