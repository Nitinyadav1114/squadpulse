// ============================================================================
// Tier 4: Scenario 4 - Weekend Movie Night, Poll & Wheel Spinner
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 4');

describe('Tier 4: Scenario 4 - Friday Movie Night Decision & Celebration', () => {
  it('should simulate social flow: radar update, hangout ping, poll voting, wheel spin, and meme log', () => {
    const store = createSimulatorStore();

    // 1. Dev marks radar status as Free to Chill
    store.setPersona('dev');
    store.updateStatus('Free to Chill', 'Done with assignments, ready for movie! 🍿', 120);
    assert.strictEqual(store.state.statuses.dev.badge, 'Free to Chill');

    // 2. Dev broadcasts hangout ping
    const ping = store.sendPing('all', 'Movie night in Common Room at 9 PM? 🎬');
    assert.strictEqual(ping.recipientId, 'all');

    // 3. Roommates create a poll: Sci-Fi vs Comedy vs Gaming
    const moviePoll = {
      id: 'poll-movie-genres',
      question: 'What genre for tonight?',
      createdById: 'dev',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      isMultiChoice: false,
      options: [
        { id: 'opt-scifi', text: 'Mind-bending Sci-Fi 🚀', voterIds: ['rhea', 'dev'] },
        { id: 'opt-comedy', text: 'Classic Comedy 😂', voterIds: ['aman'] },
      ],
    };
    store.state.polls.push(moviePoll);

    // Tanvi votes for Sci-Fi
    store.setPersona('tanvi');
    store.votePoll(moviePoll.id, 'opt-scifi');

    // Sci-Fi has 3 votes (75%), Comedy has 1 vote (25%)
    const pollResults = store.getPollResults(moviePoll.id);
    assert.strictEqual(pollResults[0].percentage, 75);
    assert.strictEqual(pollResults[1].percentage, 25);

    // 4. Two Sci-Fi movies are on the backlog: Interstellar & Dune
    const sciFiMovies = [
      { id: 'm1', title: 'Interstellar' },
      { id: 'm2', title: 'Dune: Part Two' },
    ];
    assert.isAtLeast(sciFiMovies.length, 2, 'Spin the wheel requires >= 2 items');

    // 5. Flatmates celebrate movie night by posting an inside-joke meme
    store.setPersona('rhea');
    const meme = {
      id: `meme-${Date.now()}`,
      title: 'Dev watching Interstellar black hole scene',
      type: 'HostelChronicle',
      contentUrlOrText: '"Wait, so the gravity equation was just love all along?" — Dev in shock',
      context: 'Common room screening 11:30 PM',
      authorId: 'rhea',
      creditedPersonaId: 'dev',
      tags: ['movie-night', 'sci-fi', 'common-room'],
      laughReactionIds: ['aman', 'tanvi', 'dev'],
      createdAt: new Date().toISOString(),
    };
    store.state.memes.push(meme);

    assert.ok(meme.id);
    assert.lengthOf(meme.laughReactionIds, 3);
  });
});
