'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSquadStore } from '@/lib/store';
import { calculatePairwiseDebts, calculatePollPercentages, calculateHabitStreak } from '@/lib/algorithms';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import confetti from 'canvas-confetti';
import {
  Zap,
  BookOpen,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Radio,
  RotateCw,
  Wallet,
  Code2,
  PieChart,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import { PersonaId } from '@/types';
import { LandingPage } from '@/components/landing/LandingPage';

export default function SquadHubPage() {
  const {
    authUser,
    currentPersonaId,
    personas,
    statuses,
    chores,
    expenses,
    codingProblem,
    polls,
    habitChallenges,
    completeChoreTurn,
    votePoll,
    settleDebt,
    togglePingDrawer,
  } = useSquadStore();

  const activePersona = personas[currentPersonaId] || personas.aman;
  const activeStatus = statuses[currentPersonaId];

  // Dynamic calculations
  const pairwiseDebts = calculatePairwiseDebts(expenses);
  const myOwedDebts = pairwiseDebts.filter((d) => d.debtorId === currentPersonaId);
  const debtsOwedToMe = pairwiseDebts.filter((d) => d.creditorId === currentPersonaId);

  const myChores = chores.filter((c) => c.currentAssigneeId === currentPersonaId);
  const activePoll = polls[0];
  const pollPercentages = activePoll ? calculatePollPercentages(activePoll.options) : [];

  // Active habit streak for current persona
  const activeHabit = habitChallenges[0];
  const habitStreak = activeHabit
    ? calculateHabitStreak(activeHabit.checkIns[currentPersonaId] || [])
    : { streak: 0, flameTier: 'none' };

  // UPI QR Simulation Modal State
  const [selectedDebtToSettle, setSelectedDebtToSettle] = useState<{
    debtorId: PersonaId;
    creditorId: PersonaId;
    amount: number;
  } | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const handleCompleteChore = (choreId: string) => {
    completeChoreTurn(choreId, 'Completed from Squad Hub');
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10B981', '#14B8A6', '#F59E0B'],
    });
  };

  const handleSettleUpi = () => {
    if (!selectedDebtToSettle) return;
    settleDebt(
      selectedDebtToSettle.debtorId,
      selectedDebtToSettle.creditorId,
      selectedDebtToSettle.amount
    );
    setSelectedDebtToSettle(null);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#6366F1'],
    });
  };

  const creditorPersona = selectedDebtToSettle
    ? personas[selectedDebtToSettle.creditorId]
    : null;

  if (!authUser) {
    return <LandingPage />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ------------------------------------------------------------- */}
      {/* 0. AUTHENTICATED USER SESSION STATUS BAR                      */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-muted/40 border border-border">
        <div className="flex items-center gap-2.5">
          <Avatar name={authUser.name} src={authUser.image} size="sm" />
          <div className="text-xs">
            <span className="font-semibold text-foreground">{authUser.name}</span>
            <span className="text-muted-foreground ml-1.5 hidden sm:inline">({authUser.email})</span>
            <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {authUser.provider === 'google' ? 'Google OAuth' : 'Guest Demo'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/landing"
            className="text-xs text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-xl hover:bg-muted border border-border transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Product Tour</span>
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. WELCOME HERO & MULTI-PERSONA PERSPECTIVE BANNER             */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/40 p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <Avatar
              name={activePersona.name}
              src={activePersona.avatar}
              size="xl"
              statusDot="online"
              className="ring-4 ring-card shadow-lg"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="study" size="sm">
                  {activePersona.role}
                </Badge>
                <span className="text-xs text-muted-foreground">{activePersona.room}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                Welcome back, {activePersona.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                {activePersona.tagline}
              </p>
            </div>
          </div>

          {/* Quick Perspective Stat Badges */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <div className="flex-1 sm:flex-initial p-3 rounded-2xl bg-muted/60 border border-border min-w-[130px]">
              <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Study Streak
              </div>
              <div className="text-lg font-bold text-foreground mt-0.5">
                {habitStreak.streak} Days 🔥
              </div>
            </div>

            <div className="flex-1 sm:flex-initial p-3 rounded-2xl bg-muted/60 border border-border min-w-[130px]">
              <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                <RotateCw className="w-3.5 h-3.5 text-emerald-500" /> Duties Due
              </div>
              <div className="text-lg font-bold text-foreground mt-0.5">
                {myChores.length} Assigned
              </div>
            </div>

            <div className="flex-1 sm:flex-initial p-3 rounded-2xl bg-muted/60 border border-border min-w-[130px]">
              <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                <Wallet className="w-3.5 h-3.5 text-indigo-500" /> Net Balance
              </div>
              <div
                className={`text-lg font-bold mt-0.5 ${
                  myOwedDebts.length > 0
                    ? 'text-rose-500'
                    : debtsOwedToMe.length > 0
                    ? 'text-emerald-500'
                    : 'text-foreground'
                }`}
              >
                {myOwedDebts.length > 0
                  ? `Owes ${formatCurrency(
                      myOwedDebts.reduce((sum, d) => sum + d.amount, 0)
                    )}`
                  : debtsOwedToMe.length > 0
                  ? `+${formatCurrency(
                      debtsOwedToMe.reduce((sum, d) => sum + d.amount, 0)
                    )}`
                  : 'All Square'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. SECTION SHORTCUTS (DAILY, STUDY, FUN)                      */}
      {/* ------------------------------------------------------------- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Life Wing Card */}
        <Link href="/daily" className="group">
          <Card
            variant="daily"
            className="h-full p-5 hover:-translate-y-1 transition-all duration-200 border-emerald-500/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <h3 className="font-bold text-base text-foreground">Daily Life Suite</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Who's free status radar, campus rides, rotating chore wheel, equipment borrowing, and pairwise group wallet.
            </p>
          </Card>
        </Link>

        {/* Study & Growth Wing Card */}
        <Link href="/study" className="group">
          <Card
            variant="study"
            className="h-full p-5 hover:-translate-y-1 transition-all duration-200 border-indigo-500/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-indigo-500 flex items-center gap-1">
                Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <h3 className="font-bold text-base text-foreground">Study & Growth Wing</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Daily LeetCode challenge with streak flames, academic doubt board, exam syllabus progress, and hackathon teams.
            </p>
          </Card>
        </Link>

        {/* Fun & Culture Wing Card */}
        <Link href="/fun" className="group">
          <Card
            variant="fun"
            className="h-full p-5 hover:-translate-y-1 transition-all duration-200 border-rose-500/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <h3 className="font-bold text-base text-foreground">Fun & Culture Common</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Group opinion polls, spin-the-wheel movie/game picker, 30-day GitHub habit heatmaps, and hostel meme vault.
            </p>
          </Card>
        </Link>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. CORE INTERACTIVE HUB TILES: RADAR, CHORES, WALLET, STUDY  */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Who's Free Radar & Chores */}
        <div className="lg:col-span-8 space-y-6">
          {/* WHO'S FREE RADAR QUICK-GLANCE */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                  Who's Free Status Radar
                </CardTitle>
                <CardDescription>Live availability & campus whereabouts of all 4 roommates</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={togglePingDrawer}
                className="text-xs gap-1.5 cursor-pointer"
              >
                Send Ping
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(personas).map((persona) => {
                  const status = statuses[persona.id];
                  const isCurrent = persona.id === currentPersonaId;

                  const badgeColors: Record<string, string> = {
                    'In Class': 'bg-amber-500/10 text-amber-500 border-amber-500/30',
                    'Free to Chill': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
                    'Canteen / Mess': 'bg-rose-500/10 text-rose-500 border-rose-500/30',
                    'Library / Studying': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
                    'Gym / Sports': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
                    Coding: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
                    Sleeping: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
                    'Away / Offline': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
                  };

                  return (
                    <div
                      key={persona.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-primary/5 border-primary/30 shadow-xs'
                          : 'bg-muted/40 border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar name={persona.name} src={persona.avatar} size="sm" />
                          <div>
                            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                              {persona.name}
                              {isCurrent && (
                                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.2 rounded-full font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{persona.room}</div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                            badgeColors[status?.badge || 'Away / Offline']
                          }`}
                        >
                          {status?.badge || 'Offline'}
                        </span>
                      </div>

                      <p className="text-xs text-foreground/90 italic line-clamp-2">
                        "{status?.customMessage || 'No status note set.'}"
                      </p>

                      <div className="mt-2 text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/50">
                        <span>Updated {status ? formatRelativeTime(status.updatedAt) : 'just now'}</span>
                        <span className="text-emerald-500 font-medium">Auto-expires in 40m</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* CHORES ROTATION WHEEL SNAPSHOT */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-emerald-500" />
                  Shared Chores Rotation
                </CardTitle>
                <CardDescription>Automatic cyclic turns across flatmates</CardDescription>
              </div>
              <Link href="/daily" className="text-xs text-emerald-500 hover:underline font-semibold">
                View Full Wheel →
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {chores.map((chore) => {
                const isMyTurn = chore.currentAssigneeId === currentPersonaId;
                const assignee = personas[chore.currentAssigneeId];

                return (
                  <div
                    key={chore.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isMyTurn
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs shadow-emerald-500/10'
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isMyTurn
                            ? 'bg-emerald-500 text-white font-bold'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <RotateCw className={`w-4 h-4 ${isMyTurn ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-foreground">{chore.title}</span>
                          {isMyTurn && (
                            <Badge variant="daily" size="sm" withDot>
                              YOUR TURN!
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{chore.description}</p>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-2 pt-0.5">
                          <span>
                            Current Turn: <strong className="text-foreground">{assignee?.name}</strong>
                          </span>
                          <span>•</span>
                          <span>Due: {chore.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:self-center shrink-0">
                      {isMyTurn ? (
                        <Button
                          size="sm"
                          variant="daily"
                          onClick={() => handleCompleteChore(chore.id)}
                          className="w-full sm:w-auto text-xs"
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Mark Completed
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          Assigned to {assignee?.name.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Wallet Debts, Coding Problem, Poll */}
        <div className="lg:col-span-4 space-y-6">
          {/* GROUP WALLET & PAIRWISE SETTLEMENT */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-500" />
                Group Wallet & Pairwise Debts
              </CardTitle>
              <CardDescription>Mathematical greedy settlement matrix</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pairwiseDebts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                  All debts are completely settled! No one owes anything.
                </div>
              ) : (
                pairwiseDebts.map((debt, idx) => {
                  const debtor = personas[debt.debtorId];
                  const creditor = personas[debt.creditorId];
                  const isDebtorMe = debt.debtorId === currentPersonaId;
                  const isCreditorMe = debt.creditorId === currentPersonaId;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all space-y-2 ${
                        isDebtorMe
                          ? 'bg-rose-500/5 border-rose-500/30'
                          : isCreditorMe
                          ? 'bg-emerald-500/5 border-emerald-500/30'
                          : 'bg-muted/30 border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Avatar name={debtor?.name || debt.debtorId} size="xs" />
                          <span className="font-semibold">
                            {isDebtorMe ? 'You' : debtor?.name.split(' ')[0]}
                          </span>
                          <span className="text-muted-foreground">owes</span>
                          <Avatar name={creditor?.name || debt.creditorId} size="xs" />
                          <span className="font-semibold">
                            {isCreditorMe ? 'You' : creditor?.name.split(' ')[0]}
                          </span>
                        </div>
                        <span className="font-extrabold text-sm text-foreground">
                          {formatCurrency(debt.amount)}
                        </span>
                      </div>

                      {/* Settle Action Button */}
                      {isDebtorMe && (
                        <Button
                          size="sm"
                          variant="daily"
                          className="w-full h-7 text-xs"
                          onClick={() => setSelectedDebtToSettle(debt)}
                          leftIcon={<QrCode className="w-3.5 h-3.5" />}
                        >
                          Settle via UPI QR
                        </Button>
                      )}

                      {isCreditorMe && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium text-right">
                          Pending payment from {debtor?.name.split(' ')[0]}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* DAILY CODING CHALLENGE */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-500" />
                  Today's Coding Problem
                </CardTitle>
                <Badge variant="study" size="sm">
                  {codingProblem.difficulty}
                </Badge>
              </div>
              <CardDescription>{codingProblem.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {codingProblem.description}
              </p>

              <div className="flex flex-wrap gap-1">
                {codingProblem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-muted px-2 py-0.5 rounded-md text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {codingProblem.submissions.length} Solutions Submitted
                </span>
                <Link
                  href="/study"
                  className="font-semibold text-indigo-500 hover:underline flex items-center gap-1"
                >
                  Solve Now →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* ACTIVE SQUAD POLL SPOTLIGHT */}
          {activePoll && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <PieChart className="w-4 h-4 text-rose-500" />
                  Active Squad Poll
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-foreground">
                  {activePoll.question}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {activePoll.options.map((opt, idx) => {
                  const hasVoted = opt.voterIds?.includes(currentPersonaId);
                  const pct = pollPercentages[idx] || 0;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => votePoll(activePoll.id, opt.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        hasVoted
                          ? 'border-rose-500/50 bg-rose-500/10'
                          : 'border-border bg-card hover:bg-muted/50'
                      }`}
                    >
                      {/* Background animated progress bar */}
                      <div
                        className="absolute inset-y-0 left-0 bg-rose-500/15 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between text-xs">
                        <span className="font-medium flex items-center gap-1.5">
                          {hasVoted && <Check className="w-3.5 h-3.5 text-rose-500 font-bold" />}
                          {opt.text}
                        </span>
                        <span className="font-bold text-[11px] text-muted-foreground">{pct}%</span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. SIMULATED UPI QR CODE MODAL FOR DEBT SETTLEMENT             */}
      {/* ------------------------------------------------------------- */}
      {selectedDebtToSettle && (
        <Modal
          isOpen={Boolean(selectedDebtToSettle)}
          onClose={() => setSelectedDebtToSettle(null)}
          title="Settle Debt via UPI QR"
          description={`Direct payment to ${creditorPersona?.name || selectedDebtToSettle.creditorId}`}
        >
          <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center">
            {/* SVG Simulated QR Code */}
            <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
              <svg
                viewBox="0 0 100 100"
                className="w-48 h-48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="100" height="100" fill="white" />
                {/* 3 Corner Positioning markers */}
                <rect x="10" y="10" width="24" height="24" fill="black" />
                <rect x="14" y="14" width="16" height="16" fill="white" />
                <rect x="18" y="18" width="8" height="8" fill="black" />

                <rect x="66" y="10" width="24" height="24" fill="black" />
                <rect x="70" y="14" width="16" height="16" fill="white" />
                <rect x="74" y="18" width="8" height="8" fill="black" />

                <rect x="10" y="66" width="24" height="24" fill="black" />
                <rect x="14" y="70" width="16" height="16" fill="white" />
                <rect x="18" y="74" width="8" height="8" fill="black" />

                {/* Pattern dots */}
                <rect x="42" y="15" width="6" height="6" fill="black" />
                <rect x="52" y="25" width="6" height="6" fill="black" />
                <rect x="42" y="35" width="6" height="6" fill="black" />
                <rect x="25" y="45" width="6" height="6" fill="black" />
                <rect x="45" y="52" width="10" height="10" fill="#4F46E5" />
                <rect x="62" y="45" width="6" height="6" fill="black" />
                <rect x="75" y="55" width="6" height="6" fill="black" />
                <rect x="40" y="75" width="6" height="6" fill="black" />
                <rect x="55" y="70" width="6" height="6" fill="black" />
                <rect x="70" y="75" width="6" height="6" fill="black" />
                <rect x="85" y="80" width="6" height="6" fill="black" />
              </svg>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-black text-foreground">
                {formatCurrency(selectedDebtToSettle.amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Scan using Google Pay, PhonePe, Paytm or Navi
              </p>
            </div>

            {/* UPI Deep-link display */}
            <div className="w-full p-2.5 rounded-xl bg-muted border border-border flex items-center justify-between text-xs">
              <span className="font-mono truncate">{creditorPersona?.upiId}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(creditorPersona?.upiId || '');
                  setCopiedUpi(true);
                  setTimeout(() => setCopiedUpi(false), 2000);
                }}
                className="p-1 text-primary hover:text-primary/80 transition-colors"
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="w-full flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedDebtToSettle(null)}
              >
                Cancel
              </Button>
              <Button
                variant="daily"
                className="flex-1"
                onClick={handleSettleUpi}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm Settle
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
