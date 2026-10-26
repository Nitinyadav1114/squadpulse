'use client';

import React, { useState } from 'react';
import { useSquadStore } from '@/lib/store';
import { generate30DayHeatmap, calculateHabitStreak, FlameTier } from '@/lib/algorithms';
import { PersonaId } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  Flame,
  Bell,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  Zap,
  Info,
  Clock,
  Send,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';

export function HabitTracker() {
  const { habitChallenges, currentPersonaId, personas, checkInHabit, pokeMember } = useSquadStore();

  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(
    habitChallenges[0]?.id || ''
  );
  const [pokeNotification, setPokeNotification] = useState<string | null>(null);

  const activePersona = personas[currentPersonaId] || personas.aman;
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Find active challenge
  const activeChallenge =
    habitChallenges.find((c) => c.id === selectedChallengeId) || habitChallenges[0];

  if (!activeChallenge) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No habit challenges active.
      </div>
    );
  }

  // Active persona today check-in status
  const myCheckIns = activeChallenge.checkIns[currentPersonaId] || [];
  const hasCheckedInToday = myCheckIns.includes(todayStr);

  const handleToggleTodayCheckIn = () => {
    checkInHabit(activeChallenge.id, todayStr);
    if (!hasCheckedInToday) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F43F5E', '#FB7185', '#F59E0B'],
      });
    }
  };

  const handlePoke = (targetId: PersonaId) => {
    const targetPersona = personas[targetId];
    pokeMember(activeChallenge.id, targetId);
    setPokeNotification(`🔔 Poked ${targetPersona.name}! Friendly reminder sent to keep the streak.`);
    setTimeout(() => {
      setPokeNotification(null);
    }, 4000);
  };

  const getFlameTierBadge = (tier: FlameTier, streak: number) => {
    switch (tier) {
      case 'phoenix':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40 animate-pulse">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
            {streak}d Phoenix
          </span>
        );
      case 'inferno':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/40">
            <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
            {streak}d Inferno
          </span>
        );
      case 'blaze':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-500 border border-orange-500/40">
            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
            {streak}d Blaze
          </span>
        );
      case 'spark':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/40">
            <Flame className="w-3 h-3 text-yellow-500" />
            {streak}d Spark
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
            0d Streak
          </span>
        );
    }
  };

  const roommates: PersonaId[] = ['aman', 'rhea', 'dev', 'tanvi'];

  return (
    <div id="habits" className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-rose-500/20 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-500">
              <Flame className="w-5 h-5 fill-rose-500" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">30-Day Habit Tracker</h2>
            <Badge variant="fun" size="sm">GitHub-Style Heatmaps</Badge>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Build discipline together with daily check-ins, flame streaks, and friendly pokes.
          </p>
        </div>

        {/* 1-Tap Check In for Today */}
        <div className="shrink-0">
          <Button
            variant="fun"
            size="md"
            onClick={handleToggleTodayCheckIn}
            className={`shadow-md transition-all ${
              hasCheckedInToday
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25 animate-pulse'
            }`}
            leftIcon={
              hasCheckedInToday ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Flame className="w-4 h-4 fill-white" />
              )
            }
          >
            {hasCheckedInToday ? 'Checked in Today! ✓' : 'Check In for Today!'}
          </Button>
        </div>
      </div>

      {/* Poke Toast Notification */}
      {pokeNotification && (
        <div className="p-3.5 bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/30 rounded-xl text-xs font-medium text-foreground flex items-center justify-between gap-2 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
            <span>{pokeNotification}</span>
          </div>
          <button
            onClick={() => setPokeNotification(null)}
            className="text-muted-foreground hover:text-foreground text-[10px] px-1.5 py-0.5 rounded hover:bg-muted"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Habit Challenge Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {habitChallenges.map((challenge) => {
          const isSelected = challenge.id === activeChallenge.id;
          return (
            <button
              key={challenge.id}
              onClick={() => setSelectedChallengeId(challenge.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap cursor-pointer select-none ${
                isSelected
                  ? 'border-rose-500 bg-rose-500/10 text-foreground shadow-sm'
                  : 'border-border bg-card/60 hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              <span className="text-base">{challenge.icon}</span>
              <span>{challenge.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Challenge Overview Card */}
      <Card className="border-border/80">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeChallenge.icon}</span>
                <CardTitle className="text-lg font-bold">{activeChallenge.title}</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {activeChallenge.description} • Started {activeChallenge.startDate}
              </CardDescription>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg shrink-0">
              <span>Less</span>
              <span className="w-3 h-3 rounded-sm bg-muted/60 border border-border/80" title="0: Not completed" />
              <span className="w-3 h-3 rounded-sm bg-rose-500/30 border border-rose-500/40" title="1: Low" />
              <span className="w-3 h-3 rounded-sm bg-rose-500/70 border border-rose-500/80" title="2: Completed" />
              <span className="w-3 h-3 rounded-sm bg-rose-500 border border-rose-400" title="3: Today completed" />
              <span>More</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {/* 4 Roommates Heatmap Rows */}
          <div className="space-y-4">
            {roommates.map((personId) => {
              const persona = personas[personId];
              const checkIns = activeChallenge.checkIns[personId] || [];
              const isCheckedInToday = checkIns.includes(todayStr);
              const heatmapCells = generate30DayHeatmap(activeChallenge.startDate, checkIns);
              const streakData = calculateHabitStreak(checkIns);
              const isMe = personId === currentPersonaId;

              return (
                <div
                  key={personId}
                  className={`p-4 rounded-xl border transition-all ${
                    isMe
                      ? 'border-rose-500/40 bg-rose-500/5 shadow-sm'
                      : 'border-border/60 bg-card/40'
                  }`}
                >
                  {/* Persona Row Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={persona.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{persona.name}</span>
                          {isMe && (
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            ({persona.role})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>
                            {checkIns.length} / 30 days ({Math.round((checkIns.length / 30) * 100)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Streak Badge & Actions */}
                    <div className="flex items-center gap-2.5">
                      {getFlameTierBadge(streakData.flameTier, streakData.streak)}

                      {/* If not me and hasn't checked in today: Send Poke button */}
                      {!isMe && !isCheckedInToday && (
                        <button
                          type="button"
                          onClick={() => handlePoke(personId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 transition-all hover:scale-105 active:scale-95"
                          title={`Send friendly reminder to ${persona.name}`}
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>Send Poke</span>
                        </button>
                      )}

                      {!isMe && isCheckedInToday && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Done today</span>
                        </span>
                      )}

                      {isMe && (
                        <button
                          type="button"
                          onClick={handleToggleTodayCheckIn}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                            isCheckedInToday
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                              : 'bg-rose-500 text-white shadow-sm'
                          }`}
                        >
                          {isCheckedInToday ? 'Checked In' : 'Tap to Check In'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 30-Day GitHub-Style Heatmap Grid */}
                  <div className="overflow-x-auto pb-1 scrollbar-thin">
                    <div className="inline-flex gap-1.5 items-center min-w-full sm:min-w-0">
                      {heatmapCells.map((cell) => {
                        const isToday = cell.isToday;
                        const isCompleted = cell.isCompleted;

                        // Color density levels
                        let cellBg = 'bg-muted/40 border-border/40';
                        if (isCompleted) {
                          if (isToday) {
                            cellBg = 'bg-rose-500 border-rose-400 text-white shadow-sm shadow-rose-500/30';
                          } else {
                            cellBg = 'bg-rose-500/75 border-rose-500/80';
                          }
                        } else if (isToday) {
                          cellBg = isMe
                            ? 'bg-rose-500/20 border-rose-500 border-dashed animate-pulse'
                            : 'bg-muted/60 border-amber-500/50';
                        }

                        return (
                          <div
                            key={cell.date}
                            onClick={() => {
                              // If it's today and me, allow click on cell
                              if (isToday && isMe) {
                                handleToggleTodayCheckIn();
                              }
                            }}
                            title={`${cell.date} (Day ${cell.dayNumber}): ${
                              isCompleted ? 'Completed ✓' : isToday ? 'Pending Today' : 'Missed'
                            }`}
                            className={`w-6 h-6 rounded-md border flex items-center justify-center text-[9px] font-bold select-none transition-all ${cellBg} ${
                              isToday && isMe ? 'cursor-pointer hover:scale-110' : ''
                            }`}
                          >
                            {isToday ? (
                              isCompleted ? (
                                '✓'
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              )
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dates Axis Hint */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5 px-0.5">
                    <span>30 days ago</span>
                    <span>15 days ago</span>
                    <span className="font-semibold text-rose-500">Today</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Pokes Feed */}
          {activeChallenge.pokes && activeChallenge.pokes.length > 0 && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Recent Streak Reminders & Pokes</span>
              </div>
              <div className="space-y-1.5">
                {activeChallenge.pokes.slice(0, 3).map((poke, idx) => {
                  const fromP = personas[poke.fromPersonaId] || { name: poke.fromPersonaId };
                  const toP = personas[poke.toPersonaId] || { name: poke.toPersonaId };
                  return (
                    <div
                      key={idx}
                      className="text-xs text-muted-foreground flex items-center justify-between py-1 border-b border-border/30 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{fromP.name}</span>
                        <span>poked</span>
                        <span className="font-semibold text-rose-500">{toP.name}</span>
                        <span>to maintain the daily streak!</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/80">
                        {new Date(poke.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
