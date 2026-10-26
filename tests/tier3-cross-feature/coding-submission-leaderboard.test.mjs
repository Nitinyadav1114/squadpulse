// ============================================================================
// Tier 3: Cross-Feature - Coding Submission <-> Streak & Stats
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 3');

describe('Tier 3: Cross-Feature - Coding Submission & Streak Impact', () => {
  it('should register submission on problem and update persona studyStreak stats', () => {
    const store = createSimulatorStore();
    const problem = store.state.codingProblems[0];
    const dev = store.state.personas.find(p => p.id === 'dev');
    const initialStreak = dev.stats.studyStreak;

    store.setPersona('dev');
    store.submitCodingSolution(
      problem.id,
      '// Clean solution\nfunction solve(s) { return s.split("").reverse().join(""); }',
      'TypeScript'
    );

    // Problem submissions list updated
    const devSub = problem.submissions.find(s => s.personaId === 'dev');
    assert.ok(devSub);
    assert.strictEqual(devSub.language, 'TypeScript');

    // Persona stats updated
    const updatedDev = store.state.personas.find(p => p.id === 'dev');
    assert.strictEqual(updatedDev.stats.studyStreak, initialStreak + 1);
  });
});
