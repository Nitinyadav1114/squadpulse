// ============================================================================
// Tier 1: Daily Life - Group Wallet, Pairwise Debts & Kitty Reserves
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore, calculatePairwiseDebts } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 1');

describe('Tier 1: Daily Life - Group Wallet, Pairwise Debts & Kitty', () => {
  it('should split an expense equally and calculate accurate net debtor/creditor positions', () => {
    const store = createSimulatorStore();
    // Default seed has:
    // Aman paid 1200 split among 4 (Aman, Rhea, Dev, Tanvi -> 300 each)
    // Rhea paid 800 split between Rhea & Dev (400 each)
    // Net:
    // Aman: +900
    // Rhea: +800 - 300 - 400 = +100
    // Dev: 0 - 300 - 400 = -700
    // Tanvi: 0 - 300 = -300
    const debts = store.getPairwiseDebts();

    // Sum of amounts paid must match sum of amounts received
    const totalTransferred = debts.reduce((sum, d) => sum + d.amount, 0);
    assert.strictEqual(totalTransferred, 1000); // 700 + 300 = 1000

    // Dev must owe Aman 700
    const devToAman = debts.find(d => d.debtorId === 'dev' && d.creditorId === 'aman');
    assert.ok(devToAman);
    assert.strictEqual(devToAman.amount, 700);

    // Tanvi must owe Aman 200 and Rhea 100
    const tanviToAman = debts.find(d => d.debtorId === 'tanvi' && d.creditorId === 'aman');
    const tanviToRhea = debts.find(d => d.debtorId === 'tanvi' && d.creditorId === 'rhea');
    assert.ok(tanviToAman);
    assert.strictEqual(tanviToAman.amount, 200);
    assert.ok(tanviToRhea);
    assert.strictEqual(tanviToRhea.amount, 100);
  });

  it('should guarantee greedy debt minimization generates at most N - 1 transactions', () => {
    const personas = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' }];
    const expenses = [
      { paidById: 'p1', amount: 400, splitAmongIds: ['p1', 'p2', 'p3', 'p4'] },
      { paidById: 'p2', amount: 200, splitAmongIds: ['p2', 'p3'] },
      { paidById: 'p3', amount: 100, splitAmongIds: ['p3', 'p4'] },
    ];

    const settlements = calculatePairwiseDebts(expenses, personas);
    assert.isAtMost(settlements.length, personas.length - 1); // <= 3 transactions
  });

  it('should satisfy Conservation of Money (sum of all net balances is strictly 0)', () => {
    const store = createSimulatorStore();
    const personas = store.state.personas;
    let netSum = 0;

    for (const p of personas) {
      const view = store.getPersonaDebtView(p.id);
      netSum += view.netBalance;
    }

    assert.closeTo(netSum, 0, 0.001, 'Sum of all roommate net balances must be 0');
  });

  it('should support logging new shared expenses and recomputing debt graph', () => {
    const store = createSimulatorStore();
    store.setPersona('dev');
    // Dev pays ₹600 for dinner split among Dev, Tanvi, Aman
    store.addExpense({
      description: 'Late night Biryani order',
      amount: 600,
      category: 'food',
      splitAmongIds: ['dev', 'tanvi', 'aman'],
    });

    // Dev paid 600, share was 200 -> +400 credit to Dev
    // Dev was previously -700, so now Dev should be -300
    const devView = store.getPersonaDebtView('dev');
    assert.strictEqual(devView.netBalance, -300);
  });

  it('should support kitty reserve fund deposits and track transaction audit trail', () => {
    const store = createSimulatorStore();
    store.setPersona('rhea');
    const tx = store.addKittyDeposit(300, 'Monthly flat maintenance kitty contribution');

    assert.ok(tx.id);
    assert.strictEqual(tx.personaId, 'rhea');
    assert.strictEqual(tx.amount, 300);
    assert.strictEqual(tx.type, 'deposit');
  });
});
