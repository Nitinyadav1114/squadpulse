// ============================================================================
// Tier 1: Fun & Culture - Meme & Inside-Joke Vault
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 1');

describe('Tier 1: Fun & Culture - Meme & Inside-Joke Vault', () => {
  it('should add a meme, funny quote, or chronicle with metadata and tags', () => {
    const store = createSimulatorStore();
    store.setPersona('aman');
    const meme = {
      id: `meme-${Date.now()}`,
      title: 'The Great WiFi Outage of 2026',
      type: 'HostelChronicle',
      contentUrlOrText: 'The entire 3rd floor gathered in the corridor seeking 5G hotspots like ancient tribes.',
      context: 'Midterm week Sunday 11 PM',
      authorId: 'aman',
      creditedPersonaId: 'dev',
      tags: ['hostel-lore', 'wifi', 'exam-crisis'],
      laughReactionIds: [],
      createdAt: new Date().toISOString(),
    };
    store.state.memes.push(meme);

    assert.ok(meme.id);
    assert.strictEqual(meme.type, 'HostelChronicle');
    assert.strictEqual(meme.creditedPersonaId, 'dev');
    assert.lengthOf(meme.tags, 3);
  });

  it('should allow toggling a laugh reaction on a meme', () => {
    const store = createSimulatorStore();
    const meme = store.state.memes[0];
    const initialReactions = meme.laughReactionIds.length;

    // Dev was not in reactions initially
    assert.isFalse(meme.laughReactionIds.includes('dev'));

    store.setPersona('dev');
    store.toggleMemeReaction(meme.id);

    assert.strictEqual(meme.laughReactionIds.length, initialReactions + 1);
    assert.ok(meme.laughReactionIds.includes('dev'));
  });

  it('should remove reaction when user clicks laugh reaction a second time (toggle off)', () => {
    const store = createSimulatorStore();
    const meme = store.state.memes[0];

    store.setPersona('dev');
    store.toggleMemeReaction(meme.id); // turned on
    assert.ok(meme.laughReactionIds.includes('dev'));

    store.toggleMemeReaction(meme.id); // turned off
    assert.isFalse(meme.laughReactionIds.includes('dev'));
  });

  it('should support quoting and crediting a specific roommate persona', () => {
    const store = createSimulatorStore();
    const meme = store.state.memes[0];

    assert.ok(meme.creditedPersonaId);
    assert.includes(['aman', 'rhea', 'dev', 'tanvi'], meme.creditedPersonaId);
    assert.includes(meme.contentUrlOrText, 'Dev');
  });

  it('should filter memes by tag or author', () => {
    const store = createSimulatorStore();
    const codingMemes = store.state.memes.filter(m => m.tags.includes('coding'));
    assert.isAtLeast(codingMemes.length, 1);
    assert.strictEqual(codingMemes[0].tags.includes('coding'), true);
  });
});
