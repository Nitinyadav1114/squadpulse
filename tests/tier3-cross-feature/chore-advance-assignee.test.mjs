// ============================================================================
// Tier 3: Cross-Feature - Chore Completion <-> Assignee Turn & Audit Trail
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 3');

describe('Tier 3: Cross-Feature - Chore Completion & Assignee Rotation', () => {
  it('should advance chore assignee to next flatmate and update persona perspective', () => {
    const store = createSimulatorStore();
    const chore = store.state.chores.find(c => c.id === 'chore-cleaning');

    // 1. Initial State: Dev is assigned
    assert.strictEqual(chore.currentAssigneeId, 'dev');
    store.setPersona('dev');

    // 2. Dev completes chore
    const updated = store.completeChoreTurn('chore-cleaning', 'Cleaned main floor and emptied bins');

    // 3. New assignee is Tanvi
    assert.strictEqual(updated.currentAssigneeId, 'tanvi');

    // 4. Verify perspective switch:
    store.setPersona('tanvi');
    const tanviChore = store.state.chores.find(c => c.id === 'chore-cleaning');
    assert.strictEqual(tanviChore.currentAssigneeId, 'tanvi');

    // 5. Audit history record check
    assert.isAtLeast(tanviChore.history.length, 1);
    assert.strictEqual(tanviChore.history[0].completedById, 'dev');
    assert.strictEqual(tanviChore.history[0].note, 'Cleaned main floor and emptied bins');
  });
});
