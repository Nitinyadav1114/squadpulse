// ============================================================================
// Tier 2: Boundary Cases - Group Wallet & Pairwise Debts
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { calculatePairwiseDebts, createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 2');

describe('Tier 2: Boundary & Corner Cases - Wallet & Debt Settlement', () => {
  it('B1: should return empty settlements when expenses list is empty', () => {
    const personas = [{ id: 'aman' }, { id: 'rhea' }];
    const res = calculatePairwiseDebts([], personas);
    assert.deepEqual(res, []);
  });

  it('B2: should ignore expenses with zero or negative amount', () => {
    const personas = [{ id: 'aman' }, { id: 'rhea' }];
    const expenses = [
      { paidById: 'aman', amount: 0, splitAmongIds: ['aman', 'rhea'] },
      { paidById: 'aman', amount: -50, splitAmongIds: ['aman', 'rhea'] },
    ];
    const res = calculatePairwiseDebts(expenses, personas);
    assert.deepEqual(res, []);
  });

  it('B3: should produce zero debts when a member pays an expense split only for themselves', () => {
    const personas = [{ id: 'aman' }, { id: 'rhea' }];
    const expenses = [
      { paidById: 'aman', amount: 500, splitAmongIds: ['aman'] },
    ];
    const res = calculatePairwiseDebts(expenses, personas);
    assert.deepEqual(res, []);
  });

  it('B4: should return empty settlements when all member balances are perfectly settled', () => {
    const personas = [{ id: 'aman' }, { id: 'rhea' }];
    const expenses = [
      { paidById: 'aman', amount: 200, splitAmongIds: ['aman', 'rhea'] }, // Rhea owes Aman 100
      { paidById: 'rhea', amount: 200, splitAmongIds: ['aman', 'rhea'] }, // Aman owes Rhea 100
    ];
    const res = calculatePairwiseDebts(expenses, personas);
    assert.deepEqual(res, []);
  });

  it('B5: should handle asymmetric 3-way split fractional rounding without penny leaks', () => {
    // 100 split 3 ways: 33.3333... each
    const personas = [{ id: 'aman' }, { id: 'rhea' }, { id: 'dev' }];
    const expenses = [
      { paidById: 'aman', amount: 100, splitAmongIds: ['aman', 'rhea', 'dev'] },
    ];
    const res = calculatePairwiseDebts(expenses, personas);

    // Sum of debts must equal ~66.67 (the 2/3 share owed to Aman)
    const totalOwed = res.reduce((acc, d) => acc + d.amount, 0);
    assert.closeTo(totalOwed, 66.67, 0.05);

    for (const d of res) {
      assert.strictEqual(d.creditorId, 'aman');
      assert.closeTo(d.amount, 33.33, 0.05);
    }
  });

  it('B6: should support large expense amounts (₹10,00,000 hostel rent)', () => {
    const personas = [{ id: 'aman' }, { id: 'rhea' }, { id: 'dev' }, { id: 'tanvi' }];
    const expenses = [
      { paidById: 'aman', amount: 1000000, splitAmongIds: ['aman', 'rhea', 'dev', 'tanvi'] },
    ];
    const res = calculatePairwiseDebts(expenses, personas);

    assert.lengthOf(res, 3);
    for (const d of res) {
      assert.strictEqual(d.creditorId, 'aman');
      assert.strictEqual(d.amount, 250000);
    }
  });

  it('B7: should handle small fractional transactions (₹1 split among 4)', () => {
    const personas = [{ id: 'aman' }, { id: 'rhea' }, { id: 'dev' }, { id: 'tanvi' }];
    const expenses = [
      { paidById: 'aman', amount: 1.0, splitAmongIds: ['aman', 'rhea', 'dev', 'tanvi'] },
    ];
    const res = calculatePairwiseDebts(expenses, personas);

    assert.lengthOf(res, 3);
    for (const d of res) {
      assert.strictEqual(d.amount, 0.25);
    }
  });

  it('B8: should reject adding expense with zero or negative amount in store', () => {
    const store = createSimulatorStore();
    assert.throws(
      () => store.addExpense({ amount: 0, description: 'Zero exp' }),
      'Expense amount must be positive',
      'Should throw on 0 expense'
    );
    assert.throws(
      () => store.addExpense({ amount: -100, description: 'Negative exp' }),
      'Expense amount must be positive',
      'Should throw on negative expense'
    );
  });

  it('B9: should reject adding kitty deposit with zero or negative amount', () => {
    const store = createSimulatorStore();
    assert.throws(
      () => store.addKittyDeposit(0, 'Zero deposit'),
      'Deposit must be positive',
      'Should throw on 0 deposit'
    );
  });

  it('B10: should eliminate cyclic debts: A->B 100, B->C 100, C->A 100 resolves to 0 transfers', () => {
    // A pays 100 for B only (B owes A 100)
    // B pays 100 for C only (C owes B 100)
    // C pays 100 for A only (A owes C 100)
    // Everyone paid 100 and consumed 100 -> net balances are all 0!
    const personas = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
    const expenses = [
      { paidById: 'A', amount: 100, splitAmongIds: ['B'] },
      { paidById: 'B', amount: 100, splitAmongIds: ['C'] },
      { paidById: 'C', amount: 100, splitAmongIds: ['A'] },
    ];

    const settlements = calculatePairwiseDebts(expenses, personas);
    assert.deepEqual(settlements, [], 'Cyclic debts must cancel out to 0 transactions');
  });
});
