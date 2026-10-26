// ============================================================================
// Tier 1: Study & Growth - Daily Coding Challenge & Streak Flames
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 1');

describe('Tier 1: Study & Growth - Daily Coding Challenge', () => {
  it('should allow submitting solution with code snippet and programming language', () => {
    const store = createSimulatorStore();
    store.setPersona('rhea');
    const problem = store.state.codingProblems[0];
    const initialSubsCount = problem.submissions.length;

    const sub = store.submitCodingSolution(
      problem.id,
      'function solve(arr) { return arr.sort((a,b) => a-b); }',
      'TypeScript'
    );

    assert.ok(sub.id);
    assert.strictEqual(sub.personaId, 'rhea');
    assert.strictEqual(sub.language, 'TypeScript');
    assert.strictEqual(sub.status, 'Accepted');
    assert.strictEqual(problem.submissions.length, initialSubsCount + 1);
  });

  it('should increment study streak counter in persona stats on submission', () => {
    const store = createSimulatorStore();
    store.setPersona('dev');
    const initialStreak = store.state.personas.find(p => p.id === 'dev').stats.studyStreak;

    store.submitCodingSolution(
      store.state.codingProblems[0].id,
      '# Python 3 solution\\ndef solve(n): return n * 2',
      'Python'
    );

    const updatedDev = store.state.personas.find(p => p.id === 'dev');
    assert.strictEqual(updatedDev.stats.studyStreak, initialStreak + 1);
  });

  it('should support difficulty tiers: Easy, Medium, Hard with constraints', () => {
    const store = createSimulatorStore();
    const problem = store.state.codingProblems[0];

    assert.includes(['Easy', 'Medium', 'Hard'], problem.difficulty);
    assert.ok(problem.constraints.length > 0);
    assert.ok(problem.exampleInput);
    assert.ok(problem.exampleOutput);
  });

  it('should reject empty or whitespace-only code snippet submissions', () => {
    const store = createSimulatorStore();
    store.setPersona('aman');
    const problemId = store.state.codingProblems[0].id;

    assert.throws(
      () => store.submitCodingSolution(problemId, '   \n  \t  ', 'TypeScript'),
      'Code snippet cannot be empty',
      'Empty solution submission should be rejected'
    );
  });

  it('should allow multiple roommates to submit distinct solutions to the same problem', () => {
    const store = createSimulatorStore();
    const problemId = store.state.codingProblems[0].id;

    store.setPersona('aman');
    store.submitCodingSolution(problemId, 'int main() { return 0; }', 'C++');

    store.setPersona('tanvi');
    store.submitCodingSolution(problemId, 'public class Solution {}', 'Java');

    const prob = store.state.codingProblems.find(p => p.id === problemId);
    const amanSub = prob.submissions.find(s => s.personaId === 'aman');
    const tanviSub = prob.submissions.find(s => s.personaId === 'tanvi');

    assert.ok(amanSub);
    assert.strictEqual(amanSub.language, 'C++');
    assert.ok(tanviSub);
    assert.strictEqual(tanviSub.language, 'Java');
  });
});
