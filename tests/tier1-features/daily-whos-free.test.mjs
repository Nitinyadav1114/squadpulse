// ============================================================================
// Tier 1: Daily Life - Who's Free Right Now & Quick Hangout Pings
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 1');

describe('Tier 1: Daily Life - Who\'s Free Radar & Hangout Pings', () => {
  it('should update persona status badge and custom message', () => {
    const store = createSimulatorStore();
    store.setPersona('aman');
    store.updateStatus('Library / Studying', 'Revising CS301 OS notes', 90);

    const st = store.state.statuses.aman;
    assert.strictEqual(st.badge, 'Library / Studying');
    assert.strictEqual(st.customMessage, 'Revising CS301 OS notes');
    assert.ok(new Date(st.expiresAt) > new Date(st.updatedAt));
  });

  it('should calculate auto-expiry timestamp strictly in the future', () => {
    const store = createSimulatorStore();
    store.setPersona('rhea');
    const beforeTime = Date.now();
    store.updateStatus('Coding', 'Hacking Next.js app', 45);
    const afterTime = Date.now();

    const expiresAtMs = new Date(store.state.statuses.rhea.expiresAt).getTime();
    const minExpected = beforeTime + 45 * 60 * 1000;
    const maxExpected = afterTime + 45 * 60 * 1000;

    assert.isAtLeast(expiresAtMs, minExpected - 50);
    assert.isAtMost(expiresAtMs, maxExpected + 50);
  });

  it('should maintain independent status radar states for all personas', () => {
    const store = createSimulatorStore();
    store.setPersona('dev');
    store.updateStatus('Free to Chill', 'Ready for BGMI', 30);

    store.setPersona('tanvi');
    store.updateStatus('Gym / Sports', 'Evening workout', 60);

    assert.strictEqual(store.state.statuses.dev.badge, 'Free to Chill');
    assert.strictEqual(store.state.statuses.tanvi.badge, 'Gym / Sports');
    assert.notStrictEqual(store.state.statuses.dev.customMessage, store.state.statuses.tanvi.customMessage);
  });

  it('should broadcast a quick hangout ping to all flatmates', () => {
    const store = createSimulatorStore();
    store.setPersona('aman');
    const initialCount = store.state.pings.length;

    const ping = store.sendPing('all', 'Tapri Chai Break in 10 mins ☕');
    assert.strictEqual(store.state.pings.length, initialCount + 1);
    assert.strictEqual(ping.senderId, 'aman');
    assert.strictEqual(ping.recipientId, 'all');
    assert.strictEqual(ping.presetText, 'Tapri Chai Break in 10 mins ☕');
    assert.isFalse(ping.isRead);
  });

  it('should send a targeted 1-to-1 hangout ping to a specific persona', () => {
    const store = createSimulatorStore();
    store.setPersona('rhea');
    const ping = store.sendPing('dev', 'Help me test multiplayer lobby 🎮');

    assert.strictEqual(ping.senderId, 'rhea');
    assert.strictEqual(ping.recipientId, 'dev');
    assert.ok(ping.id.startsWith('ping-'));
  });
});
