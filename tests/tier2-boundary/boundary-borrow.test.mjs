// ============================================================================
// Tier 2: Boundary Cases - Borrow & Lost/Found State Transitions
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 2');

describe('Tier 2: Boundary & Corner Cases - Borrow Board', () => {
  it('B45: should throw when updating non-existent borrow item ID', () => {
    const store = createSimulatorStore();
    assert.throws(
      () => store.updateBorrowStatus('fake-item-id', 'Borrowed'),
      'Borrow item not found',
      'Should throw on invalid item ID'
    );
  });

  it('B46: should record resolution timestamp when marking item Resolved', () => {
    const store = createSimulatorStore();
    const item = store.state.borrowItems[0];
    assert.strictEqual(item.resolvedAt, null);

    store.updateBorrowStatus(item.id, 'Resolved');
    assert.strictEqual(item.status, 'Resolved');
    assert.ok(item.resolvedAt);
  });

  it('B47: should permit depositRequired = 0 (free equipment lending)', () => {
    const store = createSimulatorStore();
    store.setPersona('rhea');
    const freeItem = store.addBorrowItem({
      type: 'LendingOffer',
      title: 'HDMI to USB-C Adapter',
      category: 'Electronics',
      locationOrRoom: 'Room 302',
      depositRequired: 0,
      notes: '',
    });
    assert.strictEqual(freeItem.depositRequired, 0);
  });

  it('B48: should assign specified borrowerId when transitioning to Borrowed', () => {
    const store = createSimulatorStore();
    const item = store.state.borrowItems[0];

    store.updateBorrowStatus(item.id, 'Borrowed', 'dev');
    assert.strictEqual(item.borrowerOrClaimerId, 'dev');
  });

  it('B49: should filter items by status Open vs Borrowed correctly', () => {
    const store = createSimulatorStore();
    const openItems = store.state.borrowItems.filter(b => b.status === 'Open');
    assert.isAtLeast(openItems.length, 1);

    store.updateBorrowStatus(openItems[0].id, 'Borrowed', 'aman');
    const openAfter = store.state.borrowItems.filter(b => b.status === 'Open');
    assert.strictEqual(openAfter.length, openItems.length - 1);
  });

  it('B50: should allow adding FoundItem with campus location', () => {
    const store = createSimulatorStore();
    store.setPersona('tanvi');
    const found = store.addBorrowItem({
      type: 'FoundItem',
      title: 'Hostel Block 3 keys with red lanyard',
      category: 'Other',
      locationOrRoom: 'Mess counter notice board',
      notes: 'Handed to guard on duty',
    });
    assert.strictEqual(found.type, 'FoundItem');
    assert.strictEqual(found.locationOrRoom, 'Mess counter notice board');
  });

  it('B51: should support all 5 borrow categories', () => {
    const store = createSimulatorStore();
    const cats = ['Electronics', 'Books & Notes', 'Clothing & Accessories', 'Daily Essentials', 'Other'];
    for (const c of cats) {
      const itm = store.addBorrowItem({
        type: 'BorrowRequest',
        title: `Need ${c}`,
        category: c,
        locationOrRoom: 'Room 303',
        notes: '',
      });
      assert.strictEqual(itm.category, c);
    }
  });
});
