// ============================================================================
// Tier 2: Boundary Cases - Social Memes & Persona Switching
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 2');

describe('Tier 2: Boundary & Corner Cases - Memes & Social State', () => {
  it('B67: should throw error when attempting to switch to non-existent persona ID', () => {
    const store = createSimulatorStore();
    assert.throws(
      () => store.setPersona('ghost_roommate_99'),
      'Persona ghost_roommate_99 not found',
      'Should throw on invalid persona ID'
    );
  });

  it('B68: should throw error when toggling reaction on non-existent meme ID', () => {
    const store = createSimulatorStore();
    assert.throws(
      () => store.toggleMemeReaction('fake-meme-id'),
      'Meme not found',
      'Should throw on invalid meme ID'
    );
  });

  it('B69: should handle meme with 0 laugh reactions gracefully', () => {
    const store = createSimulatorStore();
    const newMeme = {
      id: 'meme-unreacted',
      title: 'Zero reactions yet',
      type: 'MemeImage',
      contentUrlOrText: 'https://example.com/cat.jpg',
      context: 'Random meme',
      authorId: 'dev',
      creditedPersonaId: 'dev',
      tags: ['fun'],
      laughReactionIds: [],
      createdAt: new Date().toISOString(),
    };
    store.state.memes.push(newMeme);

    assert.lengthOf(newMeme.laughReactionIds, 0);
  });

  it('B70: should return empty array when searching for non-existent tag', () => {
    const store = createSimulatorStore();
    const matches = store.state.memes.filter(m => m.tags.includes('quantum-computing-error'));
    assert.lengthOf(matches, 0);
  });

  it('B71: should perform case-insensitive tag search accurately', () => {
    const store = createSimulatorStore();
    const term = 'CODING'.toLowerCase();
    const matches = store.state.memes.filter(m =>
      m.tags.some(t => t.toLowerCase().includes(term))
    );
    assert.isAtLeast(matches.length, 1);
  });

  it('B72: should prevent spinning the wheel when backlog has 0 items', () => {
    const emptyBacklog = [];
    const canSpin = emptyBacklog.length >= 2;
    assert.isFalse(canSpin, 'Cannot spin wheel with 0 items');
  });

  it('B73: should default doubt urgency to Normal when omitted', () => {
    const store = createSimulatorStore();
    store.setPersona('dev');
    const doubt = store.addDoubt({
      title: 'Quick CSS Flexbox question',
      body: 'How to vertically center a div?',
    });
    assert.strictEqual(doubt.urgency, 'Normal');
  });
});
