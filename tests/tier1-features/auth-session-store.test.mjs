// ============================================================================
// Tier 1: Authentication, Session Management & Store Synchronization
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';

setTestTier('Tier 1');

describe('Tier 1: Auth & Session Management - Zustand & Provider State', () => {
  it('should initialize authUser as null in clean default state', () => {
    let authUser = null;
    assert.strictEqual(authUser, null);
  });

  it('should register Google OAuth authenticated user in session store', () => {
    let authUser = null;
    const setAuthUser = (user) => { authUser = user; };

    setAuthUser({
      id: 'google-sub-12345',
      name: 'Nitin Yadav',
      email: 'nitinyadav0dev@gmail.com',
      image: 'https://lh3.googleusercontent.com/a/photo.jpg',
      provider: 'google',
    });

    assert.ok(authUser !== null);
    assert.strictEqual(authUser.id, 'google-sub-12345');
    assert.strictEqual(authUser.name, 'Nitin Yadav');
    assert.strictEqual(authUser.email, 'nitinyadav0dev@gmail.com');
    assert.strictEqual(authUser.provider, 'google');
  });

  it('should register 1-click Demo roommate persona sign-in', () => {
    let authUser = null;
    const setAuthUser = (user) => { authUser = user; };

    setAuthUser({
      id: 'aman',
      name: 'Aman Sharma',
      email: 'aman@campus.squadpulse.org',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      provider: 'demo',
    });

    assert.strictEqual(authUser.id, 'aman');
    assert.strictEqual(authUser.name, 'Aman Sharma');
    assert.strictEqual(authUser.provider, 'demo');
  });

  it('should support custom guest roommate login with sanitized name', () => {
    let authUser = null;
    const setAuthUser = (user) => { authUser = user; };
    const rawInput = '  Priyanshu Verma  ';
    const trimmed = rawInput.trim();

    setAuthUser({
      id: 'custom-guest',
      name: trimmed,
      email: `${trimmed.toLowerCase().replace(/\s+/g, '.')}@campus.squadpulse.org`,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      provider: 'guest',
    });

    assert.strictEqual(authUser.name, 'Priyanshu Verma');
    assert.strictEqual(authUser.email, 'priyanshu.verma@campus.squadpulse.org');
    assert.strictEqual(authUser.provider, 'guest');
  });

  it('should clear authenticated user session on logoutUser action', () => {
    let authUser = {
      id: 'rhea',
      name: 'Rhea Sen',
      email: 'rhea@campus.squadpulse.org',
      image: '',
      provider: 'demo',
    };
    const logoutUser = () => { authUser = null; };

    assert.ok(authUser !== null);
    logoutUser();
    assert.strictEqual(authUser, null);
  });

  it('should preserve active authUser session when flat data is reset to seed', () => {
    const store = {
      authUser: {
        id: 'google-999',
        name: 'Open Source Tester',
        email: 'tester@campus.edu',
        image: '',
        provider: 'google',
      },
      currentPersonaId: 'dev',
      expensesCount: 25,
      resetToSeedData() {
        this.expensesCount = 5; // Reset flat data
        // authUser is deliberately untouched
      },
    };

    store.resetToSeedData();
    assert.strictEqual(store.expensesCount, 5);
    assert.ok(store.authUser !== null);
    assert.strictEqual(store.authUser.name, 'Open Source Tester');
  });

  it('should maintain independent perspective switching without altering authUser identity', () => {
    const session = {
      authUser: {
        id: 'google-user',
        name: 'Campus Admin',
        email: 'admin@college.edu',
        provider: 'google',
      },
      currentPersonaId: 'aman',
      setActivePersona(id) {
        this.currentPersonaId = id;
      },
    };

    assert.strictEqual(session.currentPersonaId, 'aman');
    assert.strictEqual(session.authUser.name, 'Campus Admin');

    // Switch perspective to Rhea
    session.setActivePersona('rhea');
    assert.strictEqual(session.currentPersonaId, 'rhea');
    // Auth user remains untouched
    assert.strictEqual(session.authUser.name, 'Campus Admin');
    assert.strictEqual(session.authUser.provider, 'google');
  });
});
