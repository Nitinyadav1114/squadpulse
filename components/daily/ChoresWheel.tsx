'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useSquadStore } from '@/lib/store';
import { Chore, ChoreCategory, PersonaId } from '@/types';
import { formatRelativeTime, cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  RotateCw,
  Sparkles,
  ShoppingBag,
  Trash2,
  Droplet,
  Wrench,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ArrowRightLeft,
  History,
  PartyPopper,
  AlertTriangle,
} from 'lucide-react';

const CATEGORY_CONFIG: Record<
  ChoreCategory,
  { label: string; icon: React.ElementType; color: string; bg: string; border: string }
> = {
  cleaning: {
    label: 'Cleaning',
    icon: Sparkles,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  trash: {
    label: 'Trash & Disposal',
    icon: Trash2,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  water: {
    label: 'Water Refill',
    icon: Droplet,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  groceries: {
    label: 'Groceries Restock',
    icon: ShoppingBag,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  maintenance: {
    label: 'Maintenance',
    icon: Wrench,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
};

export function ChoresWheel() {
  const {
    chores,
    personas,
    currentPersonaId,
    completeChoreTurn,
    swapChoreAssignee,
  } = useSquadStore();

  const [activeTab, setActiveTab] = useState<'wheel' | 'history'>('wheel');
  const [selectedChoreId, setSelectedChoreId] = useState<string>(chores[0]?.id || '');
  const [completionNote, setCompletionNote] = useState('');
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapTargetId, setSwapTargetId] = useState<PersonaId>('aman');
  const [swapSuccessToast, setSwapSuccessToast] = useState(false);
  const [completedToast, setCompletedToast] = useState<string | null>(null);

  // Active chore for focus view
  const currentSelectedChore = chores.find((c) => c.id === selectedChoreId) || chores[0];

  const handleMarkDone = (chore: Chore) => {
    // 1. Confetti explosion
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#10B981', '#34D399', '#6366F1', '#EC4899', '#F59E0B'],
      });
    } catch {
      // Fallback
    }

    // 2. Advance store chore turn
    completeChoreTurn(chore.id, completionNote || undefined);
    setCompletionNote('');

    // 3. User feedback
    const completedPersona = personas[currentPersonaId];
    setCompletedToast(
      `Awesome job, ${completedPersona?.name.split(' ')[0]}! Duty marked done and passed to the next roommate!`
    );
    setTimeout(() => setCompletedToast(null), 3500);
  };

  const handleSwap = () => {
    if (!currentSelectedChore) return;
    swapChoreAssignee(currentSelectedChore.id, swapTargetId);
    setIsSwapModalOpen(false);
    setSwapSuccessToast(true);
    setTimeout(() => setSwapSuccessToast(false), 3000);
  };

  const allRoommates: PersonaId[] = ['aman', 'rhea', 'dev', 'tanvi'];

  // Count chores where current persona is assigned
  const myPendingChoresCount = chores.filter(
    (c) => c.currentAssigneeId === currentPersonaId
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-card to-card border border-emerald-500/20 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
              <RotateCw className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Shared Flat Chores Rotation
            </h2>
            {myPendingChoresCount > 0 ? (
              <Badge variant="warning" size="sm" className="animate-pulse">
                {myPendingChoresCount} Assigned to You!
              </Badge>
            ) : (
              <Badge variant="daily" size="sm">
                All Caught Up!
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Fair cyclic turns for groceries, kitchen cleaning, trash disposal, and 20L water cans. Completing advances the turn automatically.
          </p>
        </div>

        {/* View Switcher: Chores vs History */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border shrink-0">
          <button
            onClick={() => setActiveTab('wheel')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5',
              activeTab === 'wheel'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <RotateCw className="w-3.5 h-3.5 text-emerald-500" />
            Duty Board ({chores.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5',
              activeTab === 'history'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <History className="w-3.5 h-3.5" />
            Log & History
          </button>
        </div>
      </div>

      {completedToast && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-1">
          <PartyPopper className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{completedToast}</span>
        </div>
      )}

      {swapSuccessToast && (
        <div className="flex items-center gap-2 p-3 bg-indigo-500/15 border border-indigo-500/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs sm:text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Chore duty reassigned successfully!</span>
        </div>
      )}

      {activeTab === 'wheel' ? (
        <div className="space-y-6">
          {/* Chore Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chores.map((chore) => {
              const categoryConfig = CATEGORY_CONFIG[chore.category] || CATEGORY_CONFIG.cleaning;
              const CategoryIcon = categoryConfig.icon;
              const isMyTurn = chore.currentAssigneeId === currentPersonaId;
              const currentAssignee = personas[chore.currentAssigneeId];
              const rotationList = chore.rotationOrder || allRoommates;
              const currentAssigneeIdx = rotationList.indexOf(chore.currentAssigneeId);

              return (
                <Card
                  key={chore.id}
                  variant={isMyTurn ? 'daily' : 'default'}
                  className={cn(
                    'relative overflow-hidden flex flex-col justify-between transition-all duration-200',
                    isMyTurn && 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/5'
                  )}
                >
                  {/* Top 'YOUR TURN' ribbon / banner */}
                  {isMyTurn && (
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-1.5 flex items-center justify-between text-xs font-bold tracking-wide uppercase">
                      <span className="flex items-center gap-1.5">
                        <PartyPopper className="w-3.5 h-3.5" /> YOUR TURN!
                      </span>
                      <span className="text-[10px] font-medium lowercase tracking-normal">
                        Due: {chore.dueDate}
                      </span>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center border shrink-0',
                            categoryConfig.bg,
                            categoryConfig.border,
                            categoryConfig.color
                          )}
                        >
                          <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base text-foreground leading-snug">
                            {chore.title}
                          </h3>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {chore.frequency.toUpperCase()} • Due {chore.dueDate}
                          </span>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0',
                          categoryConfig.color,
                          categoryConfig.bg,
                          categoryConfig.border
                        )}
                      >
                        {categoryConfig.label}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {chore.description}
                    </p>

                    {/* Cyclical Order Sequence Strip */}
                    <div className="space-y-2 bg-muted/40 rounded-xl p-3 border border-border/50">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <RotateCw className="w-3 h-3 text-emerald-500" />
                          Cyclical Rotation Sequence
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          Turn {currentAssigneeIdx + 1} of {rotationList.length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
                        {rotationList.map((pid, idx) => {
                          const p = personas[pid];
                          const isAssignedNow = pid === chore.currentAssigneeId;
                          const isNextInLine =
                            idx === (currentAssigneeIdx + 1) % rotationList.length;

                          return (
                            <React.Fragment key={pid}>
                              <div
                                className={cn(
                                  'flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all relative',
                                  isAssignedNow
                                    ? 'bg-card border-2 border-emerald-500 shadow-xs'
                                    : 'opacity-70 hover:opacity-100'
                                )}
                              >
                                {isAssignedNow && (
                                  <span className="absolute -top-1.5 px-1 bg-emerald-500 text-white text-[8px] font-bold rounded-full uppercase">
                                    Now
                                  </span>
                                )}
                                <Avatar
                                  name={p?.name || pid}
                                  src={p?.avatar}
                                  size="sm"
                                  className={isAssignedNow ? 'ring-2 ring-emerald-500' : ''}
                                />
                                <span
                                  className={cn(
                                    'text-[10px] truncate max-w-[55px] font-medium',
                                    isAssignedNow
                                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                      : 'text-muted-foreground'
                                  )}
                                >
                                  {p?.name.split(' ')[0]}
                                </span>
                              </div>

                              {idx < rotationList.length - 1 && (
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* Current Assignee Banner */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={currentAssignee?.name || 'Assignee'}
                          src={currentAssignee?.avatar}
                          size="xs"
                        />
                        <span className="text-muted-foreground">
                          On Duty:{' '}
                          <span className="font-semibold text-foreground">
                            {isMyTurn ? 'You' : currentAssignee?.name}
                          </span>
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedChoreId(chore.id);
                          setIsSwapModalOpen(true);
                        }}
                        className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 underline underline-offset-2"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        Swap Assignee
                      </button>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between gap-3">
                    <span className="text-[10px] text-muted-foreground">
                      {chore.lastCompletedDate
                        ? `Last done ${formatRelativeTime(chore.lastCompletedDate)}`
                        : 'Never completed'}
                    </span>

                    <Button
                      variant={isMyTurn ? 'daily' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkDone(chore)}
                      className={cn(
                        'text-xs font-semibold shadow-xs',
                        isMyTurn
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'hover:border-emerald-500 hover:text-emerald-500'
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      {isMyTurn ? 'Mark Done & Advance Turn' : 'Mark Done For Flat'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* History & Activity Log Tab */
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-500" />
              Chore Completion History & Check-Off Log
            </CardTitle>
            <CardDescription>
              Chronological ledger of completed flat chores, timestamps, and notes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chores.flatMap((c) =>
              (c.history || []).map((h) => ({
                ...h,
                choreTitle: c.title,
                choreCategory: c.category,
              }))
            ).length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No completion records yet. Complete your first chore above!
              </div>
            ) : (
              <div className="space-y-3">
                {chores
                  .flatMap((c) =>
                    (c.history || []).map((h) => ({
                      ...h,
                      choreTitle: c.title,
                      choreCategory: c.category,
                    }))
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                  )
                  .map((record) => {
                    const person = personas[record.completedById];
                    const catConfig = CATEGORY_CONFIG[record.choreCategory] || CATEGORY_CONFIG.cleaning;
                    const CatIcon = catConfig.icon;

                    return (
                      <div
                        key={record.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar name={person?.name || 'User'} src={person?.avatar} size="sm" />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs text-foreground">
                                {person?.name || record.completedById}
                              </span>
                              <span className="text-[10px] text-muted-foreground">completed</span>
                              <span className="font-medium text-xs text-foreground flex items-center gap-1">
                                <CatIcon className={cn('w-3 h-3', catConfig.color)} />
                                {record.choreTitle}
                              </span>
                            </div>

                            {record.note && (
                              <p className="text-xs text-muted-foreground italic leading-relaxed pt-0.5">
                                &ldquo;{record.note}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatRelativeTime(record.timestamp)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Swap Assignee Modal */}
      <Modal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        title="Reassign Chore Duty"
        description={`Trade or reassign "${currentSelectedChore?.title}" to another roommate if you are busy.`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Select New Assignee</label>
            <div className="space-y-1.5">
              {allRoommates.map((pid) => {
                const p = personas[pid];
                const isSelected = swapTargetId === pid;
                const isCurrentlyAssigned = currentSelectedChore?.currentAssigneeId === pid;

                return (
                  <button
                    type="button"
                    key={pid}
                    onClick={() => setSwapTargetId(pid)}
                    className={cn(
                      'w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-colors text-left',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'border-border bg-card hover:bg-muted text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar name={p.name} src={p.avatar} size="xs" />
                      <span>{p.name}</span>
                    </div>
                    {isCurrentlyAssigned && (
                      <Badge variant="outline" size="sm" className="text-[9px]">
                        Current
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSwapModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="daily" size="sm" onClick={handleSwap}>
              Confirm Reassignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
