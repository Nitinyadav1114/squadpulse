'use client';

import React, { useState, useEffect } from 'react';
import { useSquadStore } from '@/lib/store';
import { calculateHabitStreak, calculatePollPercentages } from '@/lib/algorithms';
import { GroupPolls } from '@/components/fun/GroupPolls';
import { WatchPlayWheel } from '@/components/fun/WatchPlayWheel';
import { HabitTracker } from '@/components/fun/HabitTracker';
import { MemeVault } from '@/components/fun/MemeVault';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  Sparkles,
  PieChart,
  Disc,
  Flame,
  Laugh,
  TrendingUp,
  Users,
  Film,
  Zap,
  Layers,
} from 'lucide-react';

export default function FunCulturePage() {
  const {
    currentPersonaId,
    personas,
    polls,
    watchPlayList,
    habitChallenges,
    memes,
    setActiveSection,
  } = useSquadStore();

  const [activeTab, setActiveTab] = useState<'all' | 'polls' | 'wheel' | 'habits' | 'memes'>('all');

  useEffect(() => {
    setActiveSection('fun');

    // Handle hash links if user navigated via sidebar e.g. /fun#wheel
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['polls', 'wheel', 'habits', 'memes'].includes(hash)) {
        setActiveTab(hash as 'polls' | 'wheel' | 'habits' | 'memes');
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActiveSection]);

  const activePersona = personas[currentPersonaId] || personas.aman;

  // Compute Fun Metrics
  const activePollsCount = polls.filter((p) => new Date(p.expiresAt).getTime() > Date.now()).length;
  const totalPollVotes = polls.reduce(
    (sum, p) => sum + p.options.reduce((s, opt) => s + (opt.voterIds?.length || 0), 0),
    0
  );

  const activeHabit = habitChallenges[0];
  const habitStreakData = activeHabit
    ? calculateHabitStreak(activeHabit.checkIns[currentPersonaId] || [])
    : { streak: 0, flameTier: 'none' };

  const backlogCount = watchPlayList.filter((item) => item.status === 'Backlog').length;
  const activeMedia = watchPlayList.find((item) => item.status === 'Currently Active');

  const totalLaughs = memes.reduce((sum, m) => sum + m.laughReactionIds.length, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950/40 via-card to-background border border-rose-500/30 p-6 md:p-8 shadow-xl">
        {/* Decorative Background Elements */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-500 shadow-inner">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block">
                  Flat 402 Common Room
                </span>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
                  Fun & Group Culture
                </h1>
              </div>
            </div>

            {/* Active Persona Banner */}
            <div className="flex items-center gap-2.5 bg-card/80 border border-border/80 px-3.5 py-1.5 rounded-2xl shadow-sm">
              <Avatar name={activePersona.name} size="sm" />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">{activePersona.name}</span>
                  <span className="text-[10px] text-rose-500 font-semibold bg-rose-500/10 px-1.5 py-0.2 rounded">
                    Active
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground block truncate max-w-[130px]">
                  {activePersona.role}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Where hostel legends are born. Settle debates with instant polls, spin the wheel for tonight&apos;s movie, protect your 30-day habits, and archive unhinged 2 AM memories.
          </p>

          {/* Quick Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 hover:border-rose-500/30 transition-all">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Active Debates</span>
                <PieChart className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-xl font-bold text-foreground tabular-nums">
                {activePollsCount} <span className="text-xs font-normal text-muted-foreground">polls</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {totalPollVotes} votes cast overall
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 hover:border-rose-500/30 transition-all">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Watch Queue</span>
                <Film className="w-4 h-4 text-fuchsia-500" />
              </div>
              <div className="text-xl font-bold text-foreground tabular-nums">
                {backlogCount} <span className="text-xs font-normal text-muted-foreground">on wheel</span>
              </div>
              <div className="text-[10px] text-rose-400 font-medium truncate mt-0.5">
                {activeMedia ? `Streaming: ${activeMedia.title}` : 'Ready to spin'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 hover:border-rose-500/30 transition-all">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Your Habit Streak</span>
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="text-xl font-bold text-foreground tabular-nums flex items-center gap-1.5">
                {habitStreakData.streak} <span className="text-xs font-normal text-muted-foreground">days</span>
              </div>
              <div className="text-[10px] text-amber-500 font-medium uppercase tracking-wider mt-0.5">
                Tier: {habitStreakData.flameTier}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 hover:border-rose-500/30 transition-all">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Meme Vault</span>
                <Laugh className="w-4 h-4 text-pink-500" />
              </div>
              <div className="text-xl font-bold text-foreground tabular-nums">
                {memes.length} <span className="text-xs font-normal text-muted-foreground">tales</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {totalLaughs} laughing reactions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Navigation Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border overflow-x-auto scrollbar-none w-full sm:w-auto self-start">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Wings</span>
        </button>

        <button
          onClick={() => setActiveTab('polls')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'polls'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Group Polls</span>
        </button>

        <button
          onClick={() => setActiveTab('wheel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'wheel'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Disc className="w-3.5 h-3.5" />
          <span>Spin the Wheel</span>
        </button>

        <button
          onClick={() => setActiveTab('habits')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'habits'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>30-Day Habits</span>
        </button>

        <button
          onClick={() => setActiveTab('memes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'memes'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Laugh className="w-3.5 h-3.5" />
          <span>Meme Vault</span>
        </button>
      </div>

      {/* Content Sections */}
      <div className="space-y-12">
        {(activeTab === 'all' || activeTab === 'polls') && (
          <section className="scroll-mt-24">
            <GroupPolls />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'wheel') && (
          <section className="scroll-mt-24">
            <WatchPlayWheel />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'habits') && (
          <section className="scroll-mt-24">
            <HabitTracker />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'memes') && (
          <section className="scroll-mt-24">
            <MemeVault />
          </section>
        )}
      </div>
    </div>
  );
}
