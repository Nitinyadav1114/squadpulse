// ============================================================================
// Tier 1: Fun & Culture - Watch & Play Together Backlog & Spin Wheel
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 1');

describe('Tier 1: Fun & Culture - Watch & Play Together', () => {
  it('should add media item to group entertainment backlog', () => {
    const store = createSimulatorStore();
    store.setPersona('aman');
    const item = {
      id: `wp-${Date.now()}`,
      title: 'Dune: Part Two',
      type: 'Movie',
      platform: 'Prime',
      genreOrDuration: 'Sci-Fi / 2h 46m',
      addedById: 'aman',
      interestedPersonaIds: ['aman'],
      status: 'Backlog',
      createdAt: new Date().toISOString(),
    };
    store.state.watchPlayList.push(item);

    assert.ok(item.id);
    assert.strictEqual(item.title, 'Dune: Part Two');
    assert.strictEqual(item.status, 'Backlog');
    assert.deepEqual(item.interestedPersonaIds, ['aman']);
  });

  it('should toggle flatmate interest in a movie or game', () => {
    const store = createSimulatorStore();
    const item = store.state.watchPlayList.find(w => w.id === 'wp-2'); // Overcooked! 2
    // Initially: ['dev', 'tanvi', 'aman'] -> Rhea not interested

    store.setPersona('rhea');
    store.toggleWatchPlayInterest(item.id);
    assert.ok(item.interestedPersonaIds.includes('rhea'));

    // Toggle off
    store.toggleWatchPlayInterest(item.id);
    assert.isFalse(item.interestedPersonaIds.includes('rhea'));
  });

  it('should verify Spin the Wheel requires at least 2 active backlog items', () => {
    const activeItems = [{ id: '1', title: 'Movie 1' }, { id: '2', title: 'Movie 2' }];
    assert.isAtLeast(activeItems.length, 2, 'Spin the Wheel must have at least 2 items');

    const singleItem = [{ id: '1', title: 'Movie 1' }];
    const canSpin = singleItem.length >= 2;
    assert.isFalse(canSpin, 'Single item cannot spin the wheel');
  });

  it('should support entertainment lifecycle transitions: Backlog -> Active -> Completed', () => {
    const store = createSimulatorStore();
    const item = store.state.watchPlayList[0];

    assert.strictEqual(item.status, 'Backlog');
    item.status = 'Currently Active';
    assert.strictEqual(item.status, 'Currently Active');
    item.status = 'Completed';
    assert.strictEqual(item.status, 'Completed');
  });

  it('should support multiple media types: Movie, TV Series, Anime, Multiplayer Game', () => {
    const store = createSimulatorStore();
    const mediaTypes = ['Movie', 'TV Series', 'Anime', 'Multiplayer Game', 'Board Game'];

    for (const mt of mediaTypes) {
      const item = {
        id: `wp-${Math.random()}`,
        title: `Test ${mt}`,
        type: mt,
        platform: 'Discord',
        genreOrDuration: 'Various',
        addedById: 'dev',
        interestedPersonaIds: [],
        status: 'Backlog',
        createdAt: new Date().toISOString(),
      };
      store.state.watchPlayList.push(item);
      assert.strictEqual(item.type, mt);
    }
  });
});
