// ============================================================================
// Tier 4: Scenario 3 - Midterms Coding Sprint & Collaborative Q&A
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 4');

describe('Tier 4: Scenario 3 - Daily Coding Challenge & Doubt Discussion', () => {
  it('should simulate roommates tackling the daily problem, asking doubts, and boosting streaks', () => {
    const store = createSimulatorStore();
    const problem = store.state.codingProblems[0];

    // 1. Rhea submits solution first
    store.setPersona('rhea');
    const rheaSub = store.submitCodingSolution(
      problem.id,
      'function twoSum(nums: number[], target: number): number[] {\n  let l = 0, r = nums.length - 1;\n  while(l < r) {\n    const sum = nums[l] + nums[r];\n    if (sum === target) return [l + 1, r + 1];\n    else if (sum < target) l++;\n    else r--;\n  }\n  return [];\n}',
      'TypeScript'
    );
    assert.strictEqual(rheaSub.status, 'Accepted');

    // 2. Dev struggles with 1-based indexing in Python and posts a doubt
    store.setPersona('dev');
    const doubt = store.addDoubt({
      title: 'Why is Two Sum II returning [0, 1] instead of [1, 2] on LeetCode?',
      body: 'My indices match standard array indexing, but problem tests fail.',
      courseCode: 'CS301 LeetCode Daily',
      urgency: 'Exam Soon',
      tags: ['TwoSum', 'Arrays', 'OffByOne'],
    });

    // 3. Rhea spots the issue and posts an answer
    store.setPersona('rhea');
    const answer = store.addDoubtAnswer(doubt.id, {
      body: 'The problem statement specifies 1-indexed output! Just add 1 to both indices: return [left + 1, right + 1].',
      codeSnippet: '# Python 3 fix\\nreturn [left + 1, right + 1]',
      language: 'Python',
    });

    // 4. Dev accepts answer
    store.setPersona('dev');
    store.acceptDoubtAnswer(doubt.id, answer.id);
    assert.isTrue(doubt.isResolved);

    // 5. Dev submits correct Python solution and gains a streak bump
    const initialDevStreak = store.state.personas.find(p => p.id === 'dev').stats.studyStreak;
    store.submitCodingSolution(
      problem.id,
      'class Solution:\n    def twoSum(self, numbers, target):\n        l, r = 0, len(numbers) - 1\n        while l < r:\n            s = numbers[l] + numbers[r]\n            if s == target: return [l + 1, r + 1]\n            elif s < target: l += 1\n            else: r -= 1',
      'Python'
    );

    const devAfter = store.state.personas.find(p => p.id === 'dev');
    assert.strictEqual(devAfter.stats.studyStreak, initialDevStreak + 1);
  });
});
