// ============================================================================
// Tier 4: Scenario 1 - Hostel Dinner & Grocery Split with UPI Settlement
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 4');

describe('Tier 4: Scenario 1 - Dinner Bill Split & UPI Deep-Link Settlement', () => {
  it('should simulate a realistic 3-roommate dinner split, debt minimization, and UPI payment payload', () => {
    const store = createSimulatorStore({
      ...createSimulatorStore().state,
      expenses: [], // start clean for this scenario
    });

    // Step 1: Aman pays ₹1200 for flat groceries split 4 ways (Aman, Rhea, Dev, Tanvi)
    store.setPersona('aman');
    store.addExpense({
      description: 'Monthly flat groceries',
      amount: 1200,
      splitAmongIds: ['aman', 'rhea', 'dev', 'tanvi'],
      category: 'groceries',
    });

    // Step 2: Rhea pays ₹900 for Saturday dinner split among Rhea, Dev, and Tanvi (₹300 each)
    store.setPersona('rhea');
    store.addExpense({
      description: 'Zomato Friday night feast',
      amount: 900,
      splitAmongIds: ['rhea', 'dev', 'tanvi'],
      category: 'food',
    });

    // Step 3: Verify net balances
    // Aman: paid 1200, share 300 -> +₹900
    // Rhea: paid 900, share (300 groceries + 300 dinner = 600) -> +₹300
    // Dev: paid 0, share (300 groceries + 300 dinner = 600) -> -₹600
    // Tanvi: paid 0, share (300 groceries + 300 dinner = 600) -> -₹600
    // Sum: 900 + 300 - 600 - 600 = 0.
    const amanView = store.getPersonaDebtView('aman');
    const rheaView = store.getPersonaDebtView('rhea');
    const devView = store.getPersonaDebtView('dev');
    const tanviView = store.getPersonaDebtView('tanvi');

    assert.strictEqual(amanView.netBalance, 900);
    assert.strictEqual(rheaView.netBalance, 300);
    assert.strictEqual(devView.netBalance, -600);
    assert.strictEqual(tanviView.netBalance, -600);

    // Step 4: Verify greedy debt minimization produced at most 3 transactions
    const debts = store.getPairwiseDebts();
    assert.isAtMost(debts.length, 3);

    // Step 5: Simulate Dev settling their ₹600 debt to Aman via UPI QR deep-link
    const settlement = debts.find(d => d.debtorId === 'dev' && d.creditorId === 'aman');
    assert.ok(settlement);
    assert.strictEqual(settlement.amount, 600);

    const amanPersona = store.state.personas.find(p => p.id === 'aman');
    const upiUri = `upi://pay?pa=${amanPersona.upiId}&pn=${encodeURIComponent(amanPersona.name)}&am=${settlement.amount}&cu=INR&tn=${encodeURIComponent('SquadPulse Settlement')}`;

    assert.includes(upiUri, 'upi://pay?pa=aman@okhdfcbank');
    assert.includes(upiUri, 'am=600');
    assert.includes(upiUri, 'cu=INR');
  });
});
