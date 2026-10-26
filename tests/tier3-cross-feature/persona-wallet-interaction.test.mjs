// ============================================================================
// Tier 3: Cross-Feature - Persona Switch <-> Group Wallet Debt Perspective
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 3');

describe('Tier 3: Cross-Feature - Persona Switch & Debt Perspective', () => {
  it('should dynamically flip debt perspective when switching between personas', () => {
    const store = createSimulatorStore();

    // 1. Aman's perspective: Aman is the primary creditor (+₹900)
    store.setPersona('aman');
    const amanDebtView = store.getPersonaDebtView('aman');
    assert.strictEqual(amanDebtView.netBalance, 900);
    assert.lengthOf(amanDebtView.owes, 0, 'Aman owes nothing to anyone');
    assert.isAtLeast(amanDebtView.isOwed.length, 1, 'Aman is owed money by roommates');

    // 2. Dev's perspective: Dev is the primary debtor (-₹700)
    store.setPersona('dev');
    const devDebtView = store.getPersonaDebtView('dev');
    assert.strictEqual(devDebtView.netBalance, -700);
    assert.lengthOf(devDebtView.isOwed, 0, 'No one owes Dev money');
    const devOwesAman = devDebtView.owes.find(d => d.creditorId === 'aman');
    assert.ok(devOwesAman);
    assert.strictEqual(devOwesAman.amount, 700);

    // 3. Tanvi's perspective: Tanvi owes ₹300 total (split between Aman and Rhea)
    store.setPersona('tanvi');
    const tanviDebtView = store.getPersonaDebtView('tanvi');
    assert.strictEqual(tanviDebtView.netBalance, -300);
    const tanviOwesAman = tanviDebtView.owes.find(d => d.creditorId === 'aman');
    const tanviOwesRhea = tanviDebtView.owes.find(d => d.creditorId === 'rhea');
    assert.strictEqual(tanviOwesAman.amount, 200);
    assert.strictEqual(tanviOwesRhea.amount, 100);

    // 4. Rhea's perspective: Rhea is owed ₹100 net (+₹100)
    store.setPersona('rhea');
    const rheaDebtView = store.getPersonaDebtView('rhea');
    assert.strictEqual(rheaDebtView.netBalance, 100);
    assert.lengthOf(rheaDebtView.owes, 0);
    assert.strictEqual(rheaDebtView.isOwed[0].amount, 100);
  });
});
