'use client';

import React, { useState, useEffect } from 'react';
import { useSquadStore } from '@/lib/store';
import { calculateNetBalances } from '@/lib/algorithms';
import { WhosFreeRadar } from '@/components/daily/WhosFreeRadar';
import { RideCarpoolBoard } from '@/components/daily/RideCarpoolBoard';
import { ChoresWheel } from '@/components/daily/ChoresWheel';
import { BorrowBoard } from '@/components/daily/BorrowBoard';
import { GroupWallet } from '@/components/daily/GroupWallet';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
  Radio,
  Car,
  RotateCw,
  ShoppingBag,
  Wallet,
  Sparkles,
  Zap,
  LayoutGrid,
  CheckCircle2,
  Users,
} from 'lucide-react';

type DailySubTab = 'all' | 'radar' | 'carpool' | 'chores' | 'borrow' | 'wallet';

const TAB_CONFIG: { id: DailySubTab; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All In One', icon: LayoutGrid },
  { id: 'radar', label: "Who's Free", icon: Radio },
  { id: 'carpool', label: 'Ride & Carpool', icon: Car },
  { id: 'chores', label: 'Chores Wheel', icon: RotateCw },
  { id: 'borrow', label: 'Borrow & Lost', icon: ShoppingBag },
  { id: 'wallet', label: 'Group Wallet', icon: Wallet },
];

export default function DailyLifePage() {
  const {
    personas,
    currentPersonaId,
    statuses,
    carpools,
    chores,
    borrowItems,
    expenses,
    kittyTransactions,
  } = useSquadStore();

  const [activeTab, setActiveTab] = useState<DailySubTab>('all');

  // Handle URL hash changes e.g. /daily#radar, /daily#chores
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as DailySubTab;
      if (['radar', 'carpool', 'chores', 'borrow', 'wallet'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const currentPersona =
    personas[currentPersonaId] ||
    Object.values(personas)[0] || {
      id: 'me',
      name: 'Hostel Resident',
      room: 'Flat 402',
      role: 'Resident',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      tagline: 'Active Member',
      bio: '',
      skills: ['Team Player'],
      upiId: 'user@upi',
      phone: '',
      accentColor: 'emerald' as const,
      stats: { studyStreak: 0, choresCompleted: 0, debtBalance: 0 },
    };

  // Quick stats calculations
  const freeRoommatesCount = Object.keys(personas).filter(
    (id) =>
      statuses[id]?.badge === 'Free to Chill' ||
      statuses[id]?.badge === 'Canteen / Mess'
  ).length;

  const openRidesCount = carpools.filter(
    (r) => r.status === 'Upcoming' && r.passengers.length < r.totalSeats
  ).length;

  const myChoresDueCount = chores.filter(
    (c) => c.currentAssigneeId === currentPersonaId
  ).length;

  const netBalances = calculateNetBalances(expenses);
  const myNetDebt = netBalances[currentPersonaId] || 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Daily Wing Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/60 via-card to-card border border-emerald-500/25 p-5 sm:p-8 shadow-sm">
        {/* Glow ambient background element */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 shadow-sm">
                <Zap className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Daily Life & Flat Hub
              </h1>
              <Badge variant="daily" size="md" className="font-semibold">
                Wing 01
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Real-time hostel logistics for Flat 402. Coordinate rides, track who is free on campus,
              rotate grocery and cleaning duties fairly, and settle expenses instantly with UPI.
            </p>
          </div>

          {/* Active Persona Context Badge */}
          <div className="flex items-center gap-3 bg-muted/50 border border-border/80 rounded-2xl p-3 shrink-0">
            <Avatar
              name={currentPersona?.name || 'Resident'}
              src={currentPersona?.avatar}
              size="md"
              statusDot="online"
            />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs sm:text-sm text-foreground">
                  {currentPersona?.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                  Active
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground block">
                {currentPersona?.room} • {currentPersona?.role}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Quick Stat Micro-Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mt-6 pt-6 border-t border-border/60">
          {/* Stat 1: Free Roommates */}
          <button
            onClick={() => setActiveTab('radar')}
            className="p-3 rounded-2xl bg-card/60 hover:bg-card border border-border/70 hover:border-emerald-500/40 text-left transition-all"
          >
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Free to Hang</span>
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground mt-1">
              {freeRoommatesCount} of 4 Free
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              View live status radar →
            </span>
          </button>

          {/* Stat 2: Open Carpools */}
          <button
            onClick={() => setActiveTab('carpool')}
            className="p-3 rounded-2xl bg-card/60 hover:bg-card border border-border/70 hover:border-emerald-500/40 text-left transition-all"
          >
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Open Carpools</span>
              <Car className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground mt-1">
              {openRidesCount} Available
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Transit & rides board →
            </span>
          </button>

          {/* Stat 3: My Chores */}
          <button
            onClick={() => setActiveTab('chores')}
            className="p-3 rounded-2xl bg-card/60 hover:bg-card border border-border/70 hover:border-emerald-500/40 text-left transition-all"
          >
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Chores Duty</span>
              <RotateCw className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground mt-1">
              {myChoresDueCount > 0 ? `${myChoresDueCount} Your Turn!` : 'All Completed'}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Rotate & advance turns →
            </span>
          </button>

          {/* Stat 4: Debt Balance */}
          <button
            onClick={() => setActiveTab('wallet')}
            className="p-3 rounded-2xl bg-card/60 hover:bg-card border border-border/70 hover:border-emerald-500/40 text-left transition-all"
          >
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Your Net Kitty Debt</span>
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div
              className={cn(
                'text-lg sm:text-xl font-bold mt-1',
                myNetDebt > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : myNetDebt < 0
                  ? 'text-rose-500'
                  : 'text-foreground'
              )}
            >
              {myNetDebt > 0 ? `+₹${myNetDebt}` : myNetDebt < 0 ? `-₹${Math.abs(myNetDebt)}` : '₹0'}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              {myNetDebt < 0 ? 'Settle up with UPI QR →' : 'View expense matrix →'}
            </span>
          </button>
        </div>
      </div>

      {/* Feature Navigation Tabs Strip */}
      <div className="flex items-center justify-start gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-border">
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'all') {
                  window.history.replaceState(null, '', `/daily#${tab.id}`);
                } else {
                  window.history.replaceState(null, '', '/daily');
                }
              }}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer select-none',
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 ring-1 ring-emerald-500/30'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Rendering */}
      <main className="space-y-12">
        {/* Tab: All In One Overview */}
        {activeTab === 'all' && (
          <div className="space-y-12">
            {/* 1. Who's Free Radar */}
            <section id="radar" className="scroll-mt-20">
              <WhosFreeRadar />
            </section>

            <div className="border-t border-border/80 my-8" />

            {/* 2. Ride & Carpool Board */}
            <section id="carpool" className="scroll-mt-20">
              <RideCarpoolBoard />
            </section>

            <div className="border-t border-border/80 my-8" />

            {/* 3. Shared Chores Rotation */}
            <section id="chores" className="scroll-mt-20">
              <ChoresWheel />
            </section>

            <div className="border-t border-border/80 my-8" />

            {/* 4. Borrow & Lost/Found */}
            <section id="borrow" className="scroll-mt-20">
              <BorrowBoard />
            </section>

            <div className="border-t border-border/80 my-8" />

            {/* 5. Group Wallet & Kitty */}
            <section id="wallet" className="scroll-mt-20">
              <GroupWallet />
            </section>
          </div>
        )}

        {/* Tab: Who's Free Only */}
        {activeTab === 'radar' && (
          <section id="radar">
            <WhosFreeRadar />
          </section>
        )}

        {/* Tab: Ride & Carpool Only */}
        {activeTab === 'carpool' && (
          <section id="carpool">
            <RideCarpoolBoard />
          </section>
        )}

        {/* Tab: Chores Wheel Only */}
        {activeTab === 'chores' && (
          <section id="chores">
            <ChoresWheel />
          </section>
        )}

        {/* Tab: Borrow & Lost/Found Only */}
        {activeTab === 'borrow' && (
          <section id="borrow">
            <BorrowBoard />
          </section>
        )}

        {/* Tab: Group Wallet Only */}
        {activeTab === 'wallet' && (
          <section id="wallet">
            <GroupWallet />
          </section>
        )}
      </main>
    </div>
  );
}
