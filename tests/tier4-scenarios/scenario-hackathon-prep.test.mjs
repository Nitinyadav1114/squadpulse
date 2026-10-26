// ============================================================================
// Tier 4: Scenario 5 - Hackathon Team Formation, Transit & Kitty Deposit
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 4');

describe('Tier 4: Scenario 5 - Hackathon Team Roster, Carpool & Prize Kitty', () => {
  it('should simulate team formation, booking carpool to venue, and logging prize share to flat kitty', () => {
    const store = createSimulatorStore();
    const proj = store.state.hackathons[0];

    // 1. Team lead Rhea forms team:
    // Slot 0 (ML): Rhea (already filled)
    // Slot 1 (Frontend): Tanvi (already filled)
    // Slot 2 (Backend): Aman joins
    store.setPersona('aman');
    store.joinHackathonSlot(proj.id, 2);

    // Slot 3 (Game / Demo): Dev joins
    store.setPersona('dev');
    store.joinHackathonSlot(proj.id, 3);

    // 2. All 4 slots filled -> status is Roster Full!
    assert.strictEqual(proj.status, 'Roster Full');

    // 3. Aman organizes a carpool ride to Hackathon venue at Tech Park
    store.setPersona('aman');
    const ride = store.addCarpool({
      origin: 'Hostel Gate 1',
      destination: 'Campus Convention Center',
      departureTime: 'Saturday 8:00 AM',
      vehicleType: 'Car',
      totalSeats: 4, // Aman + Rhea + Tanvi + Dev
      estimatedFarePerPerson: 30,
      notes: 'Carrying laptop chargers and demo monitors',
    });

    store.setPersona('rhea');
    store.joinCarpool(ride.id);
    store.setPersona('tanvi');
    store.joinCarpool(ride.id);
    store.setPersona('dev');
    store.joinCarpool(ride.id);

    assert.lengthOf(ride.passengers, 4);
    assert.strictEqual(ride.totalSeats - ride.passengers.length, 0);

    // 4. Team wins ₹10,000 runner-up prize and puts ₹1,000 into common flat kitty
    store.setPersona('rhea');
    const tx = store.addKittyDeposit(1000, 'HackAI 2026 Runner-Up celebration flat kitty reserve');
    assert.strictEqual(tx.amount, 1000);
    assert.strictEqual(tx.personaId, 'rhea');

    const totalKitty = store.state.kittyTransactions.reduce((acc, t) => acc + t.amount, 0);
    assert.isAtLeast(totalKitty, 1500); // 500 initial + 1000 new
  });
});
