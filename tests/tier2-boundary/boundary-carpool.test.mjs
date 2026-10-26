// ============================================================================
// Tier 2: Boundary Cases - Carpool Rides & Seat Capacity
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 2');

describe('Tier 2: Boundary & Corner Cases - Carpool & Rides', () => {
  it('B38: should handle carpool with totalSeats = 1 allowing only creator', () => {
    const store = createSimulatorStore();
    store.setPersona('aman');
    const ride = store.addCarpool({
      origin: 'Campus',
      destination: 'Airport',
      departureTime: '8 AM',
      vehicleType: 'Bike',
      totalSeats: 1,
      estimatedFarePerPerson: 100,
      notes: '',
    });

    store.setPersona('rhea');
    assert.throws(
      () => store.joinCarpool(ride.id),
      'Ride is already full',
      'Should throw when joining 1-seater ride already occupied by driver'
    );
  });

  it('B39: should reject duplicate join by the same persona', () => {
    const store = createSimulatorStore();
    const ride = store.state.carpools[0];

    store.setPersona('rhea');
    store.joinCarpool(ride.id);

    // Try joining again
    assert.throws(
      () => store.joinCarpool(ride.id),
      'Already joined ride',
      'Should reject duplicate join'
    );
  });

  it('B40: should reject leave attempt when persona is not a passenger', () => {
    const store = createSimulatorStore();
    const ride = store.state.carpools[0];

    store.setPersona('tanvi'); // Tanvi is not in ride-1
    assert.throws(
      () => store.leaveCarpool(ride.id),
      'User not in this ride',
      'Should throw when leaving unjoined ride'
    );
  });

  it('B41: should immediately update available seat count when passenger leaves', () => {
    const store = createSimulatorStore();
    const ride = store.state.carpools[0];
    const initialAvailable = ride.totalSeats - ride.passengers.length;

    store.setPersona('dev');
    store.joinCarpool(ride.id);
    assert.strictEqual(ride.totalSeats - ride.passengers.length, initialAvailable - 1);

    store.leaveCarpool(ride.id);
    assert.strictEqual(ride.totalSeats - ride.passengers.length, initialAvailable);
  });

  it('B42: should throw when joining a non-existent carpool ID', () => {
    const store = createSimulatorStore();
    assert.throws(
      () => store.joinCarpool('non-existent-ride-id'),
      'Ride not found',
      'Should throw on invalid ride ID'
    );
  });

  it('B43: should permit carpool with free fare (0 fare)', () => {
    const store = createSimulatorStore();
    store.setPersona('aman');
    const freeRide = store.addCarpool({
      origin: 'Hostel',
      destination: 'Campus Hospital',
      departureTime: 'Now',
      vehicleType: 'Car',
      totalSeats: 4,
      estimatedFarePerPerson: 0,
      notes: 'Emergency free ride',
    });
    assert.strictEqual(freeRide.estimatedFarePerPerson, 0);
  });

  it('B44: should permit empty notes string in carpool creation', () => {
    const store = createSimulatorStore();
    store.setPersona('dev');
    const r = store.addCarpool({
      origin: 'A',
      destination: 'B',
      departureTime: 'Now',
      vehicleType: 'Metro / Walk',
      totalSeats: 2,
      estimatedFarePerPerson: 10,
      notes: '',
    });
    assert.strictEqual(r.notes, '');
  });
});
