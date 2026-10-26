// ============================================================================
// Tier 3: Cross-Feature - Hackathon Roster Claim <-> Project Status
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 3');

describe('Tier 3: Cross-Feature - Hackathon Roster & Status Transition', () => {
  it('should transition status from Recruiting to Roster Full when all slots are filled', () => {
    const store = createSimulatorStore();
    const proj = store.state.hackathons[0];
    // Seed has 4 slots: ML (Rhea), Frontend (Tanvi), Backend (null), Presenter (null)
    assert.strictEqual(proj.status, 'Recruiting');

    // Aman joins Backend slot (index 2)
    store.setPersona('aman');
    store.joinHackathonSlot(proj.id, 2);
    assert.strictEqual(proj.status, 'Recruiting');

    // Dev joins Game / Presenter slot (index 3) - All 4 now filled!
    store.setPersona('dev');
    store.joinHackathonSlot(proj.id, 3);
    assert.strictEqual(proj.status, 'Roster Full');

    // If Dev leaves, status should revert to Recruiting
    store.leaveHackathonSlot(proj.id, 3);
    assert.strictEqual(proj.status, 'Recruiting');
  });
});
