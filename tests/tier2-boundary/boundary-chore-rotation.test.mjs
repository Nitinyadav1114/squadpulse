// ============================================================================
// Tier 2: Boundary Cases - Chore Rotation Engine
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { advanceChoreTurn } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 2');

describe('Tier 2: Boundary & Corner Cases - Chore Rotation', () => {
  it('B11: should handle single-member rotation ring by cycling back to self', () => {
    const singleChore = {
      id: 'c1',
      currentAssigneeId: 'aman',
      rotationOrder: ['aman'],
      history: [],
    };
    const next = advanceChoreTurn(singleChore, 'aman', 'Done solo');
    assert.strictEqual(next.currentAssigneeId, 'aman');
    assert.lengthOf(next.history, 1);
  });

  it('B12: should oscillate back and forth cleanly in 2-member rotation ring', () => {
    let chore = {
      id: 'c2',
      currentAssigneeId: 'aman',
      rotationOrder: ['aman', 'rhea'],
      history: [],
    };
    chore = advanceChoreTurn(chore, 'aman', 'Turn 1');
    assert.strictEqual(chore.currentAssigneeId, 'rhea');

    chore = advanceChoreTurn(chore, 'rhea', 'Turn 2');
    assert.strictEqual(chore.currentAssigneeId, 'aman');

    chore = advanceChoreTurn(chore, 'aman', 'Turn 3');
    assert.strictEqual(chore.currentAssigneeId, 'rhea');
  });

  it('B13: should throw descriptive error when rotationOrder is empty', () => {
    const invalidChore = {
      id: 'c3',
      currentAssigneeId: 'aman',
      rotationOrder: [],
      history: [],
    };
    assert.throws(
      () => advanceChoreTurn(invalidChore, 'aman'),
      'Chore must have a valid rotationOrder',
      'Should throw on empty rotationOrder'
    );
  });

  it('B14: should fall back to index 0 if currentAssigneeId is not in rotationOrder', () => {
    const chore = {
      id: 'c4',
      currentAssigneeId: 'stranger_user',
      rotationOrder: ['aman', 'rhea', 'dev'],
      history: [],
    };
    const next = advanceChoreTurn(chore, 'aman');
    assert.strictEqual(next.currentAssigneeId, 'aman'); // index 0
  });

  it('B15: should preserve long history array (100 completions) without truncation', () => {
    let chore = {
      id: 'c5',
      currentAssigneeId: 'aman',
      rotationOrder: ['aman', 'rhea'],
      history: [],
    };
    for (let i = 0; i < 100; i++) {
      chore = advanceChoreTurn(chore, chore.currentAssigneeId, `Run #${i}`);
    }
    assert.strictEqual(chore.history.length, 100);
    assert.strictEqual(chore.history[0].note, 'Run #99'); // latest first
  });

  it('B16: should default gracefully when completion note is omitted or empty', () => {
    const chore = {
      id: 'c6',
      currentAssigneeId: 'dev',
      rotationOrder: ['dev', 'tanvi'],
      history: [],
    };
    const next = advanceChoreTurn(chore, 'dev');
    assert.strictEqual(next.history[0].note, '');
  });

  it('B17: should generate unique history record IDs for rapid successive calls', () => {
    const chore = {
      id: 'c7',
      currentAssigneeId: 'tanvi',
      rotationOrder: ['tanvi', 'aman'],
      history: [],
    };
    const res1 = advanceChoreTurn(chore, 'tanvi');
    const res2 = advanceChoreTurn(res1, 'aman');

    assert.notStrictEqual(res1.history[0].id, res2.history[0].id);
  });

  it('B18: should cycle through a large 10-roommate cluster smoothly', () => {
    const members = Array.from({ length: 10 }, (_, i) => `user_${i}`);
    let chore = {
      id: 'c8',
      currentAssigneeId: 'user_0',
      rotationOrder: members,
      history: [],
    };

    for (let i = 0; i < 10; i++) {
      assert.strictEqual(chore.currentAssigneeId, `user_${i}`);
      chore = advanceChoreTurn(chore, chore.currentAssigneeId);
    }
    // After 10 turns, should be back to user_0
    assert.strictEqual(chore.currentAssigneeId, 'user_0');
  });
});
