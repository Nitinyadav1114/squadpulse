// ============================================================================
// Tier 3: Cross-Feature - Doubt Resolution Flow (Post -> Answer -> Upvote -> Accept)
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 3');

describe('Tier 3: Cross-Feature - Academic Doubt Resolution Flow', () => {
  it('should complete end-to-end academic doubt lifecycle', () => {
    const store = createSimulatorStore();

    // 1. Dev posts a doubt
    store.setPersona('dev');
    const doubt = store.addDoubt({
      title: 'How does LRU page replacement algorithm work in OS?',
      body: 'Need intuition on maintaining access timestamps vs doubly linked list.',
      courseCode: 'CS301 OS',
      urgency: 'Exam Soon',
      tags: ['OS', 'MemoryManagement'],
    });

    assert.isFalse(doubt.isResolved);
    assert.lengthOf(doubt.answers, 0);

    // 2. Rhea submits high quality answer
    store.setPersona('rhea');
    const answer = store.addDoubtAnswer(doubt.id, {
      body: 'Use a hash map + doubly linked list. Hash map gives O(1) lookup, list maintains O(1) eviction of least recently used node at tail.',
      codeSnippet: '// LRUCache get/put in O(1)\nclass LRUCache { ... }',
      language: 'TypeScript',
    });

    assert.lengthOf(doubt.answers, 1);
    assert.isFalse(answer.isAccepted);

    // 3. Aman and Tanvi upvote Rhea\'s answer
    store.setPersona('aman');
    store.toggleDoubtUpvote(doubt.id);
    store.setPersona('tanvi');
    store.toggleDoubtUpvote(doubt.id);
    assert.strictEqual(doubt.upvotes.length, 2);

    // 4. Dev (author) reviews and marks Rhea\'s answer accepted
    store.setPersona('dev');
    store.acceptDoubtAnswer(doubt.id, answer.id);

    assert.isTrue(answer.isAccepted, 'Answer should have isAccepted = true');
    assert.isTrue(doubt.isResolved, 'Doubt should be marked resolved');
  });
});
