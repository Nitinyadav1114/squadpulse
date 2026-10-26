// ============================================================================
// Tier 2: Boundary Cases - Hamilton Poll Percentage Distribution
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { calculatePollPercentages } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 2');

describe('Tier 2: Boundary & Corner Cases - Polls & Hamilton Rounding', () => {
  it('B19: should return 0% for all options when total votes is 0', () => {
    const opts = [
      { id: '1', text: 'Opt 1', voterIds: [] },
      { id: '2', text: 'Opt 2', voterIds: [] },
      { id: '3', text: 'Opt 3', voterIds: [] },
    ];
    const res = calculatePollPercentages(opts);
    for (const r of res) {
      assert.strictEqual(r.percentage, 0);
      assert.strictEqual(r.voteCount, 0);
    }
  });

  it('B20: should assign 100% to single voted option and 0% to remaining options', () => {
    const opts = [
      { id: '1', text: 'Opt 1', voterIds: ['aman'] },
      { id: '2', text: 'Opt 2', voterIds: [] },
      { id: '3', text: 'Opt 3', voterIds: [] },
    ];
    const res = calculatePollPercentages(opts);
    assert.strictEqual(res[0].percentage, 100);
    assert.strictEqual(res[1].percentage, 0);
    assert.strictEqual(res[2].percentage, 0);
  });

  it('B21: should distribute Hamilton Largest Remainder on 3-way tie (1/3 each)', () => {
    const opts = [
      { id: '1', text: 'Opt 1', voterIds: ['a'] },
      { id: '2', text: 'Opt 2', voterIds: ['b'] },
      { id: '3', text: 'Opt 3', voterIds: ['c'] },
    ];
    // Each has 33.333% remainder 0.3333. Deficit is 1 (33+33+33=99).
    const res = calculatePollPercentages(opts);
    const sum = res.reduce((acc, r) => acc + r.percentage, 0);
    assert.strictEqual(sum, 100, 'Sum of percentages must equal 100');
    // Top remainder gets +1%, others get 33%
    const pcts = res.map(r => r.percentage).sort();
    assert.deepEqual(pcts, [33, 33, 34]);
  });

  it('B22: should handle 100 options each with 1 vote (sum strictly 100%)', () => {
    const opts = Array.from({ length: 100 }, (_, i) => ({
      id: `opt-${i}`,
      text: `Option ${i}`,
      voterIds: [`user-${i}`],
    }));
    const res = calculatePollPercentages(opts);
    const sum = res.reduce((acc, r) => acc + r.percentage, 0);
    assert.strictEqual(sum, 100);
    for (const r of res) {
      assert.strictEqual(r.percentage, 1);
    }
  });

  it('B23: should handle massive vote counts without numerical distortion (1,000,000 votes)', () => {
    const opts = [
      { id: '1', voterIds: Array(600000).fill('v') },
      { id: '2', voterIds: Array(400000).fill('v') },
    ];
    const res = calculatePollPercentages(opts);
    assert.strictEqual(res[0].percentage, 60);
    assert.strictEqual(res[1].percentage, 40);
  });

  it('B24: should give strictly 0% to options with 0 votes among options with votes', () => {
    const opts = [
      { id: '1', voterIds: ['a', 'b', 'c'] },
      { id: '2', voterIds: [] },
    ];
    const res = calculatePollPercentages(opts);
    assert.strictEqual(res[0].percentage, 100);
    assert.strictEqual(res[1].percentage, 0);
  });

  it('B25: should return empty array when options list is null or empty', () => {
    assert.deepEqual(calculatePollPercentages([]), []);
    assert.deepEqual(calculatePollPercentages(null), []);
  });

  it('B26: should prioritize highest fractional remainder for deficit allocation', () => {
    // 10 votes total: Opt A: 5 (50%), Opt B: 3 (30%), Opt C: 1.4... let's use 7 votes:
    // A: 4/7 = 57.142% -> 57 (rem 0.142)
    // B: 2/7 = 28.571% -> 28 (rem 0.571)
    // C: 1/7 = 14.285% -> 14 (rem 0.285)
    // Integer sum: 57 + 28 + 14 = 99. Deficit = 1.
    // Highest remainder is B (0.571). So B gets +1% -> 29%.
    const opts = [
      { id: 'A', voterIds: ['1', '2', '3', '4'] },
      { id: 'B', voterIds: ['5', '6'] },
      { id: 'C', voterIds: ['7'] },
    ];
    const res = calculatePollPercentages(opts);
    assert.strictEqual(res[0].percentage, 57);
    assert.strictEqual(res[1].percentage, 29); // B got the extra 1%
    assert.strictEqual(res[2].percentage, 14);
    assert.strictEqual(57 + 29 + 14, 100);
  });

  it('B27: should split 50/50 exactly for 2 equal choices', () => {
    const opts = [
      { id: 'yes', voterIds: ['a', 'b'] },
      { id: 'no', voterIds: ['c', 'd'] },
    ];
    const res = calculatePollPercentages(opts);
    assert.strictEqual(res[0].percentage, 50);
    assert.strictEqual(res[1].percentage, 50);
  });
});
