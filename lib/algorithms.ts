import {
  Chore,
  Expense,
  PairwiseDebt,
  PersonaId,
  PollOption,
  HeatmapCell,
} from '@/types';
import { parseISO, differenceInCalendarDays, format } from 'date-fns';

// ============================================================================
// 1. PAIRWISE DEBT SETTLEMENT & GREEDY MINIMIZATION ENGINE
// ============================================================================

export function calculateNetBalances(expenses: Expense[]): Record<PersonaId, number> {
  const balances: Record<PersonaId, number> = {
    aman: 0,
    rhea: 0,
    dev: 0,
    tanvi: 0,
  };

  for (const exp of expenses) {
    if (!exp.amount || exp.amount <= 0 || !exp.splitAmongIds || exp.splitAmongIds.length === 0) {
      continue;
    }

    if (exp.splits && exp.splits.length > 0) {
      // Custom splits
      balances[exp.paidById] = (balances[exp.paidById] || 0) + exp.amount;
      for (const split of exp.splits) {
        balances[split.personaId] = (balances[split.personaId] || 0) - split.amount;
      }
    } else {
      // Equal split
      const share = exp.amount / exp.splitAmongIds.length;
      balances[exp.paidById] = (balances[exp.paidById] || 0) + exp.amount;
      for (const memberId of exp.splitAmongIds) {
        balances[memberId] = (balances[memberId] || 0) - share;
      }
    }
  }

  // Round balances to 2 decimal places to avoid floating point anomalies
  for (const key of Object.keys(balances) as PersonaId[]) {
    balances[key] = Math.round(balances[key] * 100) / 100;
  }

  return balances;
}

/**
 * Greedy balance minimization: reduces multilateral group debts to minimal (at most N-1) transactions.
 */
export function calculatePairwiseDebts(expenses: Expense[]): PairwiseDebt[] {
  const balances = calculateNetBalances(expenses);

  interface BalanceEntry {
    personaId: PersonaId;
    amount: number;
  }

  const debtors: BalanceEntry[] = [];
  const creditors: BalanceEntry[] = [];

  for (const [id, bal] of Object.entries(balances)) {
    const personaId = id as PersonaId;
    if (bal < -0.01) {
      debtors.push({ personaId, amount: -bal });
    } else if (bal > 0.01) {
      creditors.push({ personaId, amount: bal });
    }
  }

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: PairwiseDebt[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);
    if (settleAmount > 0.01) {
      settlements.push({
        debtorId: debtor.personaId,
        creditorId: creditor.personaId,
        amount: Math.round(settleAmount * 100) / 100,
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) {
      dIdx++;
    }
    if (creditor.amount < 0.01) {
      cIdx++;
    }
  }

  return settlements;
}

// ============================================================================
// 2. CHORE CYCLIC TURN ADVANCEMENT
// ============================================================================

export function advanceChoreTurn(chore: Chore, completedById: PersonaId, note?: string): Chore {
  const order: PersonaId[] = chore.rotationOrder && chore.rotationOrder.length > 0
    ? chore.rotationOrder
    : ['aman', 'rhea', 'dev', 'tanvi'];

  const currentIndex = order.indexOf(chore.currentAssigneeId);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % order.length : 0;
  const nextAssignee: PersonaId = order[nextIndex];

  // Calculate next due date string based on frequency
  let nextDueDate = chore.dueDate;
  const now = new Date();
  if (chore.frequency === 'daily') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    nextDueDate = `${format(tomorrow, 'EEE')}, 9:00 PM`;
  } else if (chore.frequency === 'weekly') {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextDueDate = `${format(nextWeek, 'EEE, MMM d')}, 12:00 PM`;
  } else if (chore.frequency === 'bi-weekly') {
    const biWeekly = new Date(now);
    biWeekly.setDate(biWeekly.getDate() + 14);
    nextDueDate = `${format(biWeekly, 'EEE, MMM d')}, 12:00 PM`;
  }

  const completionRecord = {
    id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    completedById,
    timestamp: now.toISOString(),
    note: note || undefined,
  };

  return {
    ...chore,
    currentAssigneeId: nextAssignee,
    dueDate: nextDueDate,
    lastCompletedDate: now.toISOString(),
    history: [completionRecord, ...(chore.history || [])],
  };
}

// ============================================================================
// 3. HAMILTON LARGEST REMAINDER POLL PERCENTAGE CALCULATION
// ============================================================================

export function calculatePollPercentages(options: PollOption[]): number[] {
  if (!options || options.length === 0) return [];

  const voteCounts = options.map((opt) => (opt.voterIds ? opt.voterIds.length : 0));
  const totalVotes = voteCounts.reduce((acc, curr) => acc + curr, 0);

  if (totalVotes === 0) {
    return options.map(() => 0);
  }

  const rawPercentages = voteCounts.map((v) => (v / totalVotes) * 100);
  const integerParts = rawPercentages.map((p) => Math.floor(p));
  const remainders = rawPercentages.map((p, idx) => ({
    index: idx,
    remainder: p - integerParts[idx],
  }));

  const allocatedSum = integerParts.reduce((acc, curr) => acc + curr, 0);
  const discrepancy = 100 - allocatedSum;

  remainders.sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < discrepancy && i < remainders.length; i++) {
    const targetIdx = remainders[i].index;
    integerParts[targetIdx] += 1;
  }

  return integerParts;
}

export function calculateExactPercentages(options: PollOption[]): number[] {
  if (!options || options.length === 0) return [];
  const totalVotes = options.reduce((acc, opt) => acc + (opt.voterIds ? opt.voterIds.length : 0), 0);
  if (totalVotes === 0) return options.map(() => 0);
  return options.map((opt) => Math.round(((opt.voterIds?.length || 0) / totalVotes) * 1000) / 10);
}

// ============================================================================
// 4. HABIT STREAK & 30-DAY HEATMAP DATA GENERATOR
// ============================================================================

export type FlameTier = 'none' | 'spark' | 'blaze' | 'inferno' | 'phoenix';

export interface HabitStreakResult {
  streak: number;
  bestStreak: number;
  flameTier: FlameTier;
  status: 'completed_today' | 'grace_period' | 'broken' | 'inactive';
}

export function calculateHabitStreak(checkIns: string[]): HabitStreakResult {
  if (!checkIns || checkIns.length === 0) {
    return {
      streak: 0,
      bestStreak: 0,
      flameTier: 'none',
      status: 'inactive',
    };
  }

  const uniqueDates = Array.from(new Set(checkIns)).sort((a, b) => b.localeCompare(a));
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

  let streak = 0;
  let status: HabitStreakResult['status'] = 'broken';

  const mostRecent = uniqueDates[0];

  if (mostRecent === todayStr) {
    status = 'completed_today';
    streak = 1;
    let expected = parseISO(yesterdayStr);

    for (let i = 1; i < uniqueDates.length; i++) {
      const checkDate = parseISO(uniqueDates[i]);
      if (differenceInCalendarDays(expected, checkDate) === 0) {
        streak++;
        expected.setDate(expected.getDate() - 1);
      } else {
        break;
      }
    }
  } else if (mostRecent === yesterdayStr) {
    status = 'grace_period';
    streak = 1;
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);
    let expected = dayBeforeYesterday;

    for (let i = 1; i < uniqueDates.length; i++) {
      const checkDate = parseISO(uniqueDates[i]);
      if (differenceInCalendarDays(expected, checkDate) === 0) {
        streak++;
        expected.setDate(expected.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    streak = 0;
    status = 'broken';
  }

  let flameTier: FlameTier = 'none';
  if (streak >= 14) flameTier = 'phoenix';
  else if (streak >= 7) flameTier = 'inferno';
  else if (streak >= 3) flameTier = 'blaze';
  else if (streak >= 1) flameTier = 'spark';

  return {
    streak,
    bestStreak: Math.max(streak, uniqueDates.length),
    flameTier,
    status,
  };
}

export function generate30DayHeatmap(startDateStr: string, checkIns: string[]): HeatmapCell[] {
  const checkInSet = new Set(checkIns || []);
  const cells: HeatmapCell[] = [];
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Generate 30 days ending today (or from startDateStr forward 30 days)
  for (let i = 29; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - i);
    const dateStr = format(targetDate, 'yyyy-MM-dd');

    const isCompleted = checkInSet.has(dateStr);
    const isToday = dateStr === todayStr;
    const isFuture = targetDate > today;

    let level: 0 | 1 | 2 | 3 = 0;
    if (isCompleted) {
      level = isToday ? 3 : 2;
    } else {
      level = 0;
    }

    cells.push({
      date: dateStr,
      dayNumber: 30 - i,
      isCompleted,
      isToday,
      isFuture,
      level,
    });
  }

  return cells;
}
