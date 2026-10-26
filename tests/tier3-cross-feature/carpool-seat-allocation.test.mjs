// ============================================================================
// Tier 3: Cross-Feature - Carpool Seat Allocation & Full Capacity State
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 3');

describe('Tier 3: Cross-Feature - Carpool Seat Allocation Lifecycle', () => {
  it('should transition capacity from available -> full -> available as passengers join and leave', () => {
    const store = createSimulatorStore();
    store.setPersona('aman');
    const ride = store.addCarpool({
      origin: 'Campus North',
      destination: 'Railway Junction',
      departureTime: '6:00 PM',
      vehicleType: 'Car',
      totalSeats: 3, // Aman + 2 open seats
      estimatedFarePerPerson: 50,
      notes: '',
    });

    assert.strictEqual(ride.passengers.length, 1);
    assert.strictEqual(ride.totalSeats - ride.passengers.length, 2);

    // 1. Rhea joins
    store.setPersona('rhea');
    store.joinCarpool(ride.id);
    assert.strictEqual(ride.totalSeats - ride.passengers.length, 1);

    // 2. Dev joins (carpool now full)
    store.setPersona('dev');
    store.joinCarpool(ride.id);
    assert.strictEqual(ride.totalSeats - ride.passengers.length, 0);

    // 3. Tanvi attempts to join full carpool -> blocked
    store.setPersona('tanvi');
    assert.throws(
      () => store.joinCarpool(ride.id),
      'Ride is already full',
      'Should block 4th person on 3-seat ride'
    );

    // 4. Dev leaves -> seat freed
    store.setPersona('dev');
    store.leaveCarpool(ride.id);
    assert.strictEqual(ride.totalSeats - ride.passengers.length, 1);

    // 5. Tanvi can now successfully join
    store.setPersona('tanvi');
    store.joinCarpool(ride.id);
    assert.ok(ride.passengers.includes('tanvi'));
    assert.strictEqual(ride.totalSeats - ride.passengers.length, 0);
  });
});
