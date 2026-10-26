// ============================================================================
// Tier 1: Daily Life - Borrow & Lost/Found Board
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 1');

describe('Tier 1: Daily Life - Borrow & Lost/Found Board', () => {
  it('should create a borrow or lending listing with status Open', () => {
    const store = createSimulatorStore();
    store.setPersona('tanvi');
    const item = store.addBorrowItem({
      type: 'LendingOffer',
      title: 'iPad Air with Apple Pencil 2',
      category: 'Electronics',
      locationOrRoom: 'Room 303',
      notes: 'Available for digital sketching or notes',
    });

    assert.ok(item.id);
    assert.strictEqual(item.ownerId, 'tanvi');
    assert.strictEqual(item.status, 'Open');
    assert.strictEqual(item.borrowerOrClaimerId, null);
  });

  it('should transition status from Open to Borrowed when roommate claims it', () => {
    const store = createSimulatorStore();
    const item = store.state.borrowItems[0];
    assert.strictEqual(item.status, 'Open');

    store.setPersona('dev');
    store.updateBorrowStatus(item.id, 'Borrowed', 'dev');

    assert.strictEqual(item.status, 'Borrowed');
    assert.strictEqual(item.borrowerOrClaimerId, 'dev');
  });

  it('should transition status from Borrowed to Returned', () => {
    const store = createSimulatorStore();
    const item = store.state.borrowItems[0];
    store.updateBorrowStatus(item.id, 'Borrowed', 'dev');

    store.updateBorrowStatus(item.id, 'Returned');
    assert.strictEqual(item.status, 'Returned');
    assert.ok(item.resolvedAt);
  });

  it('should support LostItem and FoundItem campus recovery reports', () => {
    const store = createSimulatorStore();
    store.setPersona('aman');
    const lostItem = store.addBorrowItem({
      type: 'LostItem',
      title: 'Blue Boat Bluetooth Earbuds',
      category: 'Electronics',
      locationOrRoom: 'Near Badminton Court',
      notes: 'Lost during evening match',
    });

    assert.strictEqual(lostItem.type, 'LostItem');
    assert.strictEqual(lostItem.status, 'Open');

    store.updateBorrowStatus(lostItem.id, 'Resolved');
    assert.strictEqual(lostItem.status, 'Resolved');
  });

  it('should properly support equipment categories: Electronics, Books, Clothing, Essentials', () => {
    const store = createSimulatorStore();
    const categories = ['Electronics', 'Books & Notes', 'Clothing & Accessories', 'Daily Essentials'];

    for (const cat of categories) {
      store.setPersona('rhea');
      const item = store.addBorrowItem({
        type: 'BorrowRequest',
        title: `Item for ${cat}`,
        category: cat,
        locationOrRoom: 'Room 302',
        notes: '',
      });
      assert.strictEqual(item.category, cat);
    }
  });
});
