'use client';

import React, { useState } from 'react';
import { useSquadStore } from '@/lib/store';
import { VehicleType, CarpoolRide } from '@/types';
import { formatCurrency, formatRelativeTime, cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  Car,
  Bike,
  Navigation,
  Clock,
  Users,
  Plus,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  IndianRupee,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

const VEHICLE_OPTIONS: { type: VehicleType; label: string; icon: React.ElementType; defaultSeats: number }[] = [
  { type: 'Bike', label: 'Bike / Scooter', icon: Bike, defaultSeats: 1 },
  { type: 'Auto / Cab Share', label: 'Auto / Cab Share', icon: Car, defaultSeats: 3 },
  { type: 'Car', label: 'Personal Car', icon: Car, defaultSeats: 4 },
  { type: 'Metro / Walk', label: 'Metro / Walk Group', icon: Navigation, defaultSeats: 5 },
];

const COMMON_ORIGINS = ['Hostel Gate 2', 'Flat 402', 'Library Lawn', 'Tech Park Block B', 'Main Gate'];
const COMMON_DESTINATIONS = ['Phoenix Marketcity & Metro', 'Central Railway Station', 'MG Road / City Center', 'Airport Terminal 1', 'D-Mart Supermarket'];

export function RideCarpoolBoard() {
  const {
    carpools,
    personas,
    currentPersonaId,
    addCarpool,
    joinCarpool,
    leaveCarpool,
    cancelCarpool,
  } = useSquadStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'mine'>('all');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Form state for offering a ride
  const [origin, setOrigin] = useState('Hostel Gate 2');
  const [destination, setDestination] = useState('Phoenix Marketcity & Metro');
  const [departureTime, setDepartureTime] = useState('Today, 6:00 PM');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Auto / Cab Share');
  const [totalSeats, setTotalSeats] = useState<number>(3);
  const [estimatedFare, setEstimatedFare] = useState<number>(50);
  const [notes, setNotes] = useState('');
  const [offerSuccessToast, setOfferSuccessToast] = useState(false);

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case 'Bike':
        return Bike;
      case 'Auto / Cab Share':
      case 'Car':
        return Car;
      default:
        return Navigation;
    }
  };

  const handleOfferRide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim() || !departureTime.trim()) return;

    addCarpool({
      creatorId: currentPersonaId,
      origin: origin.trim(),
      destination: destination.trim(),
      departureTime: departureTime.trim(),
      vehicleType,
      totalSeats: Number(totalSeats) || 1,
      estimatedFarePerPerson: Number(estimatedFare) || 0,
      notes: notes.trim(),
    });

    setIsOfferModalOpen(false);
    setNotes('');
    setOfferSuccessToast(true);
    setTimeout(() => setOfferSuccessToast(false), 3000);
  };

  // Filter rides
  const filteredRides = carpools.filter((ride) => {
    if (ride.status === 'Cancelled') return false;
    if (activeFilter === 'available') {
      return ride.passengers.length < ride.totalSeats;
    }
    if (activeFilter === 'mine') {
      return (
        ride.creatorId === currentPersonaId ||
        ride.passengers.includes(currentPersonaId)
      );
    }
    return true;
  });

  const availableRidesCount = carpools.filter(
    (r) => r.status === 'Upcoming' && r.passengers.length < r.totalSeats
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-card to-card border border-emerald-500/20 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
              <Car className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Ride & Carpool Transit Board
            </h2>
            <Badge variant="daily" size="sm">
              {availableRidesCount} Open Rides
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Share rides to the metro, markets, coding labs, and airports with flatmates to save auto fares and travel safe.
          </p>
        </div>

        <Button
          variant="daily"
          size="sm"
          onClick={() => setIsOfferModalOpen(true)}
          className="shadow-emerald-500/20 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Offer a Ride
        </Button>
      </div>

      {offerSuccessToast && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs sm:text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Your ride has been posted to the campus transit board!</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveFilter('all')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
              activeFilter === 'all'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            All Active ({carpools.filter((r) => r.status !== 'Cancelled').length})
          </button>
          <button
            onClick={() => setActiveFilter('available')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
              activeFilter === 'available'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Seats Available ({availableRidesCount})
          </button>
          <button
            onClick={() => setActiveFilter('mine')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
              activeFilter === 'mine'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            My Rides
          </button>
        </div>

        <span className="text-xs text-muted-foreground hidden sm:inline">
          One-tap instant seat reservation
        </span>
      </div>

      {/* Rides Grid */}
      {filteredRides.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Car className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-foreground">No rides matching this filter</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Heading out somewhere? Be the first to offer a seat to your flatmates!
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOfferModalOpen(true)}
              className="mt-2 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Offer Ride
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRides.map((ride) => {
            const driver = personas[ride.creatorId];
            const isDriver = ride.creatorId === currentPersonaId;
            const isPassenger = ride.passengers.includes(currentPersonaId);
            const seatsRemaining = ride.totalSeats - ride.passengers.length;
            const isFull = seatsRemaining <= 0;
            const VehicleIcon = getVehicleIcon(ride.vehicleType);

            return (
              <Card
                key={ride.id}
                variant={isDriver || isPassenger ? 'daily' : 'default'}
                className={cn(
                  'overflow-hidden transition-all flex flex-col justify-between',
                  (isDriver || isPassenger) && 'border-emerald-500/30'
                )}
              >
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Top Driver Info & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={driver?.name || 'Driver'}
                        src={driver?.avatar}
                        size="md"
                        statusDot="online"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-foreground">
                            {driver?.name || 'Flatmate'}
                          </span>
                          {isDriver && (
                            <Badge variant="daily" size="sm" className="text-[9px] py-0 px-1.5">
                              Driver (You)
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {driver?.room} • Host
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted border border-border text-foreground">
                        <VehicleIcon className="w-3.5 h-3.5 text-emerald-500" />
                        {ride.vehicleType}
                      </span>
                    </div>
                  </div>

                  {/* Route & Timing Box */}
                  <div className="space-y-2 bg-muted/40 rounded-xl p-3 border border-border/50 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="flex flex-col items-center mt-0.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <div className="w-0.5 h-5 bg-border my-0.5" />
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                            Pickup / Origin
                          </span>
                          <span className="font-medium text-foreground text-xs">{ride.origin}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                            Destination
                          </span>
                          <span className="font-medium text-foreground text-xs">{ride.destination}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        {ride.departureTime}
                      </span>

                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <IndianRupee className="w-3 h-3" />
                        {ride.estimatedFarePerPerson > 0
                          ? `₹${ride.estimatedFarePerPerson}/person`
                          : 'Free Ride'}
                      </span>
                    </div>
                  </div>

                  {/* Passengers & Seat Counter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        Seat Availability:
                      </span>
                      <span
                        className={cn(
                          'font-semibold',
                          isFull
                            ? 'text-rose-500'
                            : seatsRemaining === 1
                            ? 'text-amber-500'
                            : 'text-emerald-600 dark:text-emerald-400'
                        )}
                      >
                        {isFull
                          ? 'Full'
                          : `${seatsRemaining} of ${ride.totalSeats} seats open`}
                      </span>
                    </div>

                    {/* Passenger Avatars / Seat slots */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Array.from({ length: ride.totalSeats }).map((_, idx) => {
                        const passengerId = ride.passengers[idx];
                        const passenger = passengerId ? personas[passengerId] : null;

                        if (passenger) {
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-1 bg-card border border-border px-2 py-0.5 rounded-full text-[11px]"
                              title={passenger.name}
                            >
                              <Avatar name={passenger.name} src={passenger.avatar} size="xs" />
                              <span className="font-medium text-foreground truncate max-w-[70px]">
                                {passenger.name.split(' ')[0]}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-1 border border-dashed border-border/80 px-2.5 py-1 rounded-full text-[10px] text-muted-foreground"
                          >
                            <Users className="w-3 h-3 opacity-40" />
                            <span>Empty</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {ride.notes && (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-emerald-500/40 pl-2">
                      &ldquo;{ride.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    Posted {formatRelativeTime(ride.createdAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    {isDriver ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelCarpool(ride.id)}
                        className="text-xs text-rose-500 hover:bg-rose-500/10 h-8"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Cancel Ride
                      </Button>
                    ) : isPassenger ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => leaveCarpool(ride.id)}
                        className="text-xs text-rose-500 border-rose-500/30 hover:bg-rose-500/10 h-8"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1" />
                        Leave Ride
                      </Button>
                    ) : isFull ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                        className="text-xs opacity-60 h-8"
                      >
                        Ride Full
                      </Button>
                    ) : (
                      <Button
                        variant="daily"
                        size="sm"
                        onClick={() => joinCarpool(ride.id)}
                        className="text-xs h-8 shadow-xs"
                      >
                        <Users className="w-3.5 h-3.5 mr-1.5" />
                        Join Ride
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Offer Ride Modal */}
      <Modal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title="Offer a Ride or Carpool"
        description="Share your transit details with flatmates so they can ride along."
        size="md"
      >
        <form onSubmit={handleOfferRide} className="space-y-4">
          {/* Origin */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Pickup Location / Origin</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Hostel Gate 2 or Flat 402"
              required
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex flex-wrap gap-1 pt-1">
              {COMMON_ORIGINS.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setOrigin(loc)}
                  className="text-[10px] px-2 py-0.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-muted-foreground"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Phoenix Marketcity & Metro"
              required
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex flex-wrap gap-1 pt-1">
              {COMMON_DESTINATIONS.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setDestination(loc)}
                  className="text-[10px] px-2 py-0.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-muted-foreground"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Type & Seats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => {
                  const val = e.target.value as VehicleType;
                  setVehicleType(val);
                  const opt = VEHICLE_OPTIONS.find((v) => v.type === val);
                  if (opt) setTotalSeats(opt.defaultSeats);
                }}
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {VEHICLE_OPTIONS.map((v) => (
                  <option key={v.type} value={v.type}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Available Passenger Seats</label>
              <input
                type="number"
                min={1}
                max={6}
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                required
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Departure Time & Fare */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Departure Time</label>
              <input
                type="text"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="e.g. Today, 6:30 PM or Tomorrow, 9 AM"
                required
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Est. Fare / Person (₹)</label>
              <input
                type="number"
                min={0}
                step={5}
                value={estimatedFare}
                onChange={(e) => setEstimatedFare(Number(e.target.value))}
                placeholder="0 for free"
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Notes / Instructions</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Helmet provided, returning in 2 hours..."
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOfferModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="daily" size="sm">
              Publish Ride
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
