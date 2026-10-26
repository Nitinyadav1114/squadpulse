// ============================================================================
// Tier 3: Cross-Feature - Poll Vote <-> Hamilton Distribution Recalculation
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 3');

describe('Tier 3: Cross-Feature - Poll Vote & Percentage Dynamics', () => {
  it('should dynamically shift poll percentage distribution when votes change', () => {
    const store = createSimulatorStore();
    const poll = store.state.polls[0];
    // Seed:
    // opt-1: Naan (dev, aman) -> 2 votes (50%)
    // opt-2: Pizza (rhea) -> 1 vote (25%)
    // opt-3: Biryani (tanvi) -> 1 vote (25%)
    // Total = 4 votes.
    let results = store.getPollResults(poll.id);
    assert.strictEqual(results[0].percentage, 50);
    assert.strictEqual(results[1].percentage, 25);
    assert.strictEqual(results[2].percentage, 25);

    // Tanvi switches vote from Biryani to Pizza
    store.setPersona('tanvi');
    store.votePoll(poll.id, 'opt-2');

    // New state:
    // opt-1: Naan (dev, aman) -> 2 votes (50%)
    // opt-2: Pizza (rhea, tanvi) -> 2 votes (50%)
    // opt-3: Biryani () -> 0 votes (0%)
    results = store.getPollResults(poll.id);
    assert.strictEqual(results[0].percentage, 50);
    assert.strictEqual(results[1].percentage, 50);
    assert.strictEqual(results[2].percentage, 0);

    const sum = results.reduce((acc, r) => acc + r.percentage, 0);
    assert.strictEqual(sum, 100);
  });
});
