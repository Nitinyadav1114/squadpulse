// ============================================================================
// Tier 1: Fun & Culture - Group Polls & 'This or That'
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore, calculatePollPercentages } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 1');

describe('Tier 1: Fun & Culture - Group Polls', () => {
  it('should allow casting a vote on a poll option', () => {
    const store = createSimulatorStore();
    const poll = store.state.polls[0];
    const option = poll.options[1]; // pizza

    store.setPersona('tanvi');
    store.votePoll(poll.id, option.id);

    assert.ok(option.voterIds.includes('tanvi'));
  });

  it('should remove previous selection when changing vote in single-choice poll', () => {
    const store = createSimulatorStore();
    const poll = store.state.polls[0];
    const optNaan = poll.options[0];
    const optPizza = poll.options[1];

    store.setPersona('dev'); // Dev was in optNaan
    assert.ok(optNaan.voterIds.includes('dev'));

    // Dev switches vote to Pizza
    store.votePoll(poll.id, optPizza.id);

    assert.isFalse(optNaan.voterIds.includes('dev'));
    assert.ok(optPizza.voterIds.includes('dev'));
  });

  it('should guarantee Hamilton Largest Remainder percentages sum strictly to 100%', () => {
    const options = [
      { id: '1', text: 'Option A', voterIds: ['a', 'b'] },
      { id: '2', text: 'Option B', voterIds: ['c'] },
      { id: '3', text: 'Option C', voterIds: ['d', 'e', 'f'] },
    ];
    // Total votes = 6.
    // A: 2/6 = 33.333% -> 33
    // B: 1/6 = 16.666% -> 17
    // C: 3/6 = 50.000% -> 50
    const results = calculatePollPercentages(options);
    const sum = results.reduce((acc, r) => acc + r.percentage, 0);

    assert.strictEqual(sum, 100);
    assert.strictEqual(results[0].percentage, 33);
    assert.strictEqual(results[1].percentage, 17);
    assert.strictEqual(results[2].percentage, 50);
  });

  it('should handle zero-vote polls cleanly without NaN or zero division errors', () => {
    const emptyOptions = [
      { id: '1', text: 'Coffee', voterIds: [] },
      { id: '2', text: 'Tea', voterIds: [] },
    ];

    const results = calculatePollPercentages(emptyOptions);
    assert.lengthOf(results, 2);
    assert.strictEqual(results[0].percentage, 0);
    assert.strictEqual(results[1].percentage, 0);
    assert.strictEqual(results[0].voteCount, 0);
  });

  it('should support creating binary "This or That" fast opinion polls', () => {
    const store = createSimulatorStore();
    store.setPersona('aman');
    const newPoll = {
      id: 'poll-this-that',
      question: 'Weekend Hack: Next.js or React Native?',
      createdById: 'aman',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      isMultiChoice: false,
      options: [
        { id: 'opt-next', text: 'Next.js 15 Web', voterIds: [] },
        { id: 'opt-rn', text: 'React Native Mobile', voterIds: [] },
      ],
    };
    store.state.polls.push(newPoll);

    store.setPersona('rhea');
    store.votePoll(newPoll.id, 'opt-next');

    const res = store.getPollResults(newPoll.id);
    assert.strictEqual(res[0].percentage, 100);
    assert.strictEqual(res[1].percentage, 0);
  });
});
