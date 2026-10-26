// ============================================================================
// Tier 1: Daily Life - Ride & Carpool Board
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 1');

describe('Tier 1: Daily Life - Ride & Carpool Board', () => {
  it('should create a carpool ride setting creator as initial passenger', () => {
    const store = createSimulatorStore();
    store.setPersona('aman');
    const ride = store.addCarpool({
      origin: 'Campus North Gate',
      destination: 'Central Mall & Cineplex',
      departureTime: 'Today, 7:00 PM',
      vehicleType: 'Auto / Cab Share',
      totalSeats: 4,
      estimatedFarePerPerson: 40,
      notes: 'Catching evening movie',
    });

    assert.ok(ride.id);
    assert.strictEqual(ride.creatorId, 'aman');
    assert.deepEqual(ride.passengers, ['aman']);
    assert.strictEqual(ride.status, 'Upcoming');
    assert.strictEqual(ride.totalSeats, 4);
  });

  it('should allow another roommate to join an available carpool', () => {
    const store = createSimulatorStore();
    const ride = store.state.carpools[0]; // created by aman, totalSeats 3
    const initialSeatsOccupied = ride.passengers.length;

    store.setPersona('rhea');
    store.joinCarpool(ride.id);

    assert.strictEqual(ride.passengers.length, initialSeatsOccupied + 1);
    assert.ok(ride.passengers.includes('rhea'));
  });

  it('should allow a roommate to leave a carpool ride cleanly', () => {
    const store = createSimulatorStore();
    const ride = store.state.carpools[0];

    store.setPersona('dev');
    store.joinCarpool(ride.id);
    assert.ok(ride.passengers.includes('dev'));

    store.leaveCarpool(ride.id);
    assert.isFalse(ride.passengers.includes('dev'));
  });

  it('should block joining a full carpool ride and throw error', () => {
    const store = createSimulatorStore();
    store.setPersona('tanvi');
    const ride = store.addCarpool({
      origin: 'Hostel',
      destination: 'Railway Station',
      departureTime: 'Tomorrow 6 AM',
      vehicleType: 'Bike',
      totalSeats: 2, // Creator + 1 passenger
      estimatedFarePerPerson: 60,
      notes: 'Backpack only',
    });

    store.setPersona('aman');
    store.joinCarpool(ride.id); // 2/2 full now

    store.setPersona('rhea');
    assert.throws(
      () => store.joinCarpool(ride.id),
      'Ride is already full',
      'Should throw when joining full carpool'
    );
  });

  it('should support various vehicle types: Bike, Auto, Car, Metro', () => {
    const store = createSimulatorStore();
    const types = ['Bike', 'Auto / Cab Share', 'Car', 'Metro / Walk'];
    for (const vType of types) {
      store.setPersona('dev');
      const r = store.addCarpool({
        origin: 'Library',
        destination: 'Food Court',
        departureTime: 'Now',
        vehicleType: vType,
        totalSeats: 3,
        estimatedFarePerPerson: 20,
        notes: '',
      });
      assert.strictEqual(r.vehicleType, vType);
    }
  });
});
