// ============================================================================
// Tier 1: Study & Growth - Doubt Board with Code Snippets & Upvoting
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 1');

describe('Tier 1: Study & Growth - Doubt Board', () => {
  it('should post an academic doubt with title, body, courseCode, and tags', () => {
    const store = createSimulatorStore();
    store.setPersona('tanvi');
    const doubt = store.addDoubt({
      title: 'How does Dijkstra algorithm handle negative edge cycles?',
      body: 'Can Bellman-Ford be used instead or does Dijkstra work with modified heuristics?',
      courseCode: 'CS202 Data Structures',
      tags: ['Graph Theory', 'Algorithms', 'Dijkstra'],
      urgency: 'Exam Soon',
      codeSnippet: 'priority_queue<pair<int, int>> pq;',
      language: 'C++',
    });

    assert.ok(doubt.id);
    assert.strictEqual(doubt.authorId, 'tanvi');
    assert.strictEqual(doubt.courseCode, 'CS202 Data Structures');
    assert.strictEqual(doubt.urgency, 'Exam Soon');
    assert.isFalse(doubt.isResolved);
  });

  it('should add peer answers with code snippets and explanations', () => {
    const store = createSimulatorStore();
    const doubtId = store.state.doubts[0].id;

    store.setPersona('aman');
    const ans = store.addDoubtAnswer(doubtId, {
      body: 'Dijkstra fails on negative weights because greedy assumption of shortest prefix breaks.',
      codeSnippet: '// Bellman-Ford relaxes all edges |V| - 1 times',
      language: 'C++',
    });

    assert.ok(ans.id);
    assert.strictEqual(ans.authorId, 'aman');
    assert.strictEqual(ans.doubtId, doubtId);
    assert.isFalse(ans.isAccepted);
  });

  it('should allow upvoting a doubt question with toggle capability', () => {
    const store = createSimulatorStore();
    const doubt = store.state.doubts[0];
    store.setPersona('tanvi');

    // Upvote
    store.toggleDoubtUpvote(doubt.id);
    assert.ok(doubt.upvotes.includes('tanvi'));

    // Toggle off
    store.toggleDoubtUpvote(doubt.id);
    assert.isFalse(doubt.upvotes.includes('tanvi'));
  });

  it('should allow question author to mark an answer as accepted and resolve doubt', () => {
    const store = createSimulatorStore();
    const doubt = store.state.doubts[0];
    const answer = doubt.answers[0];

    store.setPersona(doubt.authorId);
    store.acceptDoubtAnswer(doubt.id, answer.id);

    assert.isTrue(answer.isAccepted);
    assert.isTrue(doubt.isResolved);
  });

  it('should reject creating a doubt with missing or empty title', () => {
    const store = createSimulatorStore();
    store.setPersona('dev');

    assert.throws(
      () => store.addDoubt({ title: '   ', body: 'Valid body' }),
      'Doubt title cannot be empty',
      'Should throw when title is whitespace'
    );
  });
});
