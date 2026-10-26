// ============================================================================
// Tier 1: Study & Growth - Partner & Hackathon Finder
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 1');

describe('Tier 1: Study & Growth - Partner & Hackathon Finder', () => {
  it('should list hackathon project with open and filled role slots', () => {
    const store = createSimulatorStore();
    const proj = store.state.hackathons[0];

    assert.strictEqual(proj.title, 'Campus HackAI 2026');
    assert.strictEqual(proj.teamLeadId, 'rhea');
    assert.strictEqual(proj.slots.length, 4);
    assert.strictEqual(proj.slots[0].assignedPersonaId, 'rhea');
    assert.strictEqual(proj.slots[2].assignedPersonaId, null); // Backend slot open
  });

  it('should allow a roommate to claim an open role slot', () => {
    const store = createSimulatorStore();
    const proj = store.state.hackathons[0];
    const backendSlotIdx = 2;

    store.setPersona('dev');
    store.joinHackathonSlot(proj.id, backendSlotIdx);

    assert.strictEqual(proj.slots[backendSlotIdx].assignedPersonaId, 'dev');
  });

  it('should reject claiming a slot that is already occupied', () => {
    const store = createSimulatorStore();
    const proj = store.state.hackathons[0];
    const mlSlotIdx = 0; // Already held by Rhea

    store.setPersona('aman');
    assert.throws(
      () => store.joinHackathonSlot(proj.id, mlSlotIdx),
      'Slot is already assigned',
      'Cannot overwrite an already occupied slot'
    );
  });

  it('should allow a member to release/leave their claimed slot', () => {
    const store = createSimulatorStore();
    const proj = store.state.hackathons[0];
    const frontendSlotIdx = 1; // assigned to tanvi in seed

    store.setPersona('tanvi');
    store.leaveHackathonSlot(proj.id, frontendSlotIdx);

    assert.strictEqual(proj.slots[frontendSlotIdx].assignedPersonaId, null);
    assert.strictEqual(proj.status, 'Recruiting');
  });

  it('should verify persona skills roster includes technical badges', () => {
    const store = createSimulatorStore();
    const rhea = store.state.personas.find(p => p.id === 'rhea');
    const tanvi = store.state.personas.find(p => p.id === 'tanvi');

    assert.includes(rhea.skills, 'Next.js');
    assert.includes(rhea.skills, 'TypeScript');
    assert.includes(tanvi.skills, 'UI/UX');
    assert.includes(tanvi.skills, 'Figma');
  });
});
