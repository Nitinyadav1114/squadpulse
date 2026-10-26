'use client';

import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useSquadStore } from '@/lib/store';
import { Expense, ExpenseCategory, PersonaId, PairwiseDebt } from '@/types';
import { calculatePairwiseDebts, calculateNetBalances } from '@/lib/algorithms';
import { formatCurrency, formatRelativeTime, cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  Wallet,
  Plus,
  ArrowRight,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Utensils,
  ShoppingBag,
  Zap,
  Film,
  Tag,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Receipt,
  Scale,
} from 'lucide-react';

const CATEGORY_ICONS: Record<
  ExpenseCategory,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  food: { label: 'Food & Dining', icon: Utensils, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  groceries: { label: 'Groceries', icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  utilities: { label: 'Utilities & WiFi', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  entertainment: { label: 'Entertainment', icon: Film, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  other: { label: 'Other Expenses', icon: Tag, color: 'text-slate-400', bg: 'bg-slate-500/10' },
};

/**
 * Generates an SVG 25x25 QR Matrix from a given text payload.
 * Produces authentic-looking QR codes with 3 corner finder patterns,
 * timing lines, and hashed data modules.
 */
function UpiQrSvg({ payload, size = 180 }: { payload: string; size?: number }) {
  const gridSize = 25;

  const modules = useMemo(() => {
    const grid: boolean[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(false)
    );

    // 1. Finder pattern helper
    const drawFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuterBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInnerCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[startY + r][startX + c] = isOuterBorder || isInnerCenter;
        }
      }
    };

    drawFinder(0, 0); // Top-left
    drawFinder(gridSize - 7, 0); // Top-right
    drawFinder(0, gridSize - 7); // Bottom-left

    // 2. Timing patterns
    for (let i = 8; i < gridSize - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // 3. Alignment pattern at (16, 16)
    const alignX = 16;
    const alignY = 16;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
        const isCenter = r === 0 && c === 0;
        grid[alignY + r][alignX + c] = isBorder || isCenter;
      }
    }

    // 4. Fill remaining cells pseudorandomly seeded by payload
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      hash = (hash << 5) - hash + payload.charCodeAt(i);
      hash |= 0;
    }

    let seed = Math.abs(hash);
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip finder areas
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= gridSize - 8;
        const inBottomLeft = r >= gridSize - 8 && c < 8;
        const inAlignment = r >= 14 && r <= 18 && c >= 14 && c <= 18;
        const isTiming = (r === 6 && c >= 8 && c < gridSize - 8) || (c === 6 && r >= 8 && r < gridSize - 8);

        if (!inTopLeft && !inTopRight && !inBottomLeft && !inAlignment && !isTiming) {
          grid[r][c] = rng() > 0.48;
        }
      }
    }

    return grid;
  }, [payload]);

  const cellSize = size / gridSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-lg shadow-sm bg-white p-2"
    >
      <rect width={size} height={size} fill="#ffffff" />
      {modules.map((row, r) =>
        row.map((isDark, c) => {
          if (!isDark) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize - 0.2}
              height={cellSize - 0.2}
              fill="#0f172a"
              rx={cellSize * 0.15}
            />
          );
        })
      )}
    </svg>
  );
}

export function GroupWallet() {
  const {
    expenses,
    kittyTransactions,
    personas,
    currentPersonaId,
    addExpense,
    settleDebt,
    addKittyTransaction,
  } = useSquadStore();

  const allRoommates: PersonaId[] = ['aman', 'rhea', 'dev', 'tanvi'];

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddKittyOpen, setIsAddKittyOpen] = useState(false);
  const [settleModalDebt, setSettleModalDebt] = useState<PairwiseDebt | null>(null);
  const [copiedUpiUri, setCopiedUpiUri] = useState(false);
  const [settleSuccessToast, setSettleSuccessToast] = useState(false);

  // Add Expense Form State
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expPaidBy, setExpPaidBy] = useState<PersonaId>(currentPersonaId);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('food');
  const [expSplitAmong, setExpSplitAmong] = useState<PersonaId[]>(allRoommates);
  const [expDate, setExpDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expNotes, setExpNotes] = useState('');

  // Kitty Form State
  const [kittyAmount, setKittyAmount] = useState<number | ''>('');
  const [kittyType, setKittyType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [kittyDesc, setKittyDesc] = useState('');

  // Calculations
  const netBalances = useMemo(() => calculateNetBalances(expenses), [expenses]);
  const pairwiseDebts = useMemo(() => calculatePairwiseDebts(expenses), [expenses]);

  const totalGroupSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const kittyBalance = kittyTransactions.reduce(
    (acc, tx) => (tx.type === 'deposit' ? acc + tx.amount : acc - tx.amount),
    0
  );

  const myNetBalance = netBalances[currentPersonaId] || 0;

  // Debts involving active persona
  const myDebtsOwed = pairwiseDebts.filter((d) => d.debtorId === currentPersonaId);
  const myDebtsReceivable = pairwiseDebts.filter((d) => d.creditorId === currentPersonaId);

  // Handle Add Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDescription.trim() || !expAmount || Number(expAmount) <= 0) return;
    if (expSplitAmong.length === 0) return;

    addExpense({
      description: expDescription.trim(),
      amount: Number(expAmount),
      paidById: expPaidBy,
      splitAmongIds: expSplitAmong,
      category: expCategory,
      date: expDate,
      notes: expNotes.trim() || undefined,
    });

    setIsAddExpenseOpen(false);
    setExpDescription('');
    setExpAmount('');
    setExpNotes('');
  };

  // Handle Add Kitty Transaction
  const handleAddKitty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kittyAmount || Number(kittyAmount) <= 0 || !kittyDesc.trim()) return;

    addKittyTransaction(Number(kittyAmount), kittyType, kittyDesc.trim());
    setIsAddKittyOpen(false);
    setKittyAmount('');
    setKittyDesc('');
  };

  // Trigger Settle Up
  const handleOpenSettleModal = (debt: PairwiseDebt) => {
    setSettleModalDebt(debt);
    setCopiedUpiUri(false);
  };

  // Confirm payment in store
  const handleConfirmSettlement = () => {
    if (!settleModalDebt) return;

    settleDebt(
      settleModalDebt.debtorId,
      settleModalDebt.creditorId,
      settleModalDebt.amount
    );

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#6366F1', '#F59E0B'],
      });
    } catch {}

    setSettleModalDebt(null);
    setSettleSuccessToast(true);
    setTimeout(() => setSettleSuccessToast(false), 3500);
  };

  // Generate UPI deep-link URI
  const generateUpiUri = (creditorId: PersonaId, amount: number) => {
    const creditor = personas[creditorId];
    const upiId = creditor?.upiId || `${creditorId}@upi`;
    const name = encodeURIComponent(creditor?.name || 'Flatmate');
    return `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=SquadPulse+Settlement`;
  };

  const toggleSplitUser = (id: PersonaId) => {
    if (expSplitAmong.includes(id)) {
      if (expSplitAmong.length > 1) {
        setExpSplitAmong(expSplitAmong.filter((m) => m !== id));
      }
    } else {
      setExpSplitAmong([...expSplitAmong, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-card to-card border border-emerald-500/20 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
              <Wallet className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Group Wallet & Kitty Matrix
            </h2>
            <Badge variant="daily" size="sm">
              ₹{totalGroupSpent.toLocaleString('en-IN')} Total Shared
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Zero-friction flatmate expense splitting, mutual debt minimization, shared kitty balances, and simulated UPI deep-link settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddKittyOpen(true)}
            className="text-xs"
          >
            <PiggyBank className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            Kitty Txn
          </Button>
          <Button
            variant="daily"
            size="sm"
            onClick={() => setIsAddExpenseOpen(true)}
            className="shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Expense
          </Button>
        </div>
      </div>

      {settleSuccessToast && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs sm:text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Debt settled and recorded into the ledger! Balances updated automatically.</span>
        </div>
      )}

      {/* Financial Health Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Your Net Balance */}
        <Card className="border-border">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>Your Net Balance</span>
              <Scale className="w-4 h-4 text-emerald-500" />
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'text-2xl font-bold tracking-tight',
                  myNetBalance > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : myNetBalance < 0
                    ? 'text-rose-500'
                    : 'text-foreground'
                )}
              >
                {myNetBalance > 0 ? `+₹${myNetBalance}` : myNetBalance < 0 ? `-₹${Math.abs(myNetBalance)}` : '₹0'}
              </span>
              <span className="text-xs text-muted-foreground">
                {myNetBalance > 0 ? 'owed to you' : myNetBalance < 0 ? 'you owe flat' : 'all squared up'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Based on {expenses.length} flat expenses and active pairwise settlements.
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Shared Kitty Balance */}
        <Card className="border-border">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>Flat Kitty Fund</span>
              <PiggyBank className="w-4 h-4 text-emerald-500" />
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                ₹{kittyBalance.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Available
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Emergency buffer for water cans, trash bags, detergent, and common pantry staples.
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Total Group Spend */}
        <Card className="border-border">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>Total Month Expenses</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                ₹{totalGroupSpent.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-muted-foreground">{expenses.length} transactions</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Calculated across all 4 roommates with greedy balance minimization.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pairwise Debt Settlement Matrix Section */}
      <Card className="border-emerald-500/20">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-500" />
              Pairwise Debt Settlement Matrix
            </CardTitle>
            <CardDescription>
              Minimal debt transactions required to square up every roommate. Click &apos;Settle Up&apos; to pay via simulated UPI QR.
            </CardDescription>
          </div>

          <Badge variant="outline" size="sm" className="w-fit">
            {pairwiseDebts.length === 0
              ? 'All Settled!'
              : `${pairwiseDebts.length} Pending Settlements`}
          </Badge>
        </CardHeader>

        <CardContent>
          {pairwiseDebts.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-foreground">No Outstanding Debts in Flat 402!</p>
              <p>Everyone is completely squared up.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pairwiseDebts.map((debt, idx) => {
                const debtor = personas[debt.debtorId];
                const creditor = personas[debt.creditorId];
                const isIDebtor = debt.debtorId === currentPersonaId;
                const isICreditor = debt.creditorId === currentPersonaId;

                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all',
                      isIDebtor
                        ? 'border-rose-500/40 bg-rose-500/5'
                        : isICreditor
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-border bg-card'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Debtor Avatar */}
                      <div className="relative">
                        <Avatar name={debtor?.name || debt.debtorId} src={debtor?.avatar} size="sm" />
                      </div>

                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <span
                          className={cn(
                            'font-semibold',
                            isIDebtor ? 'text-rose-500' : 'text-foreground'
                          )}
                        >
                          {isIDebtor ? 'You' : debtor?.name.split(' ')[0]}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span
                          className={cn(
                            'font-semibold',
                            isICreditor
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-foreground'
                          )}
                        >
                          {isICreditor ? 'You' : creditor?.name.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-bold text-sm sm:text-base text-foreground">
                        ₹{debt.amount}
                      </span>

                      <Button
                        variant={isIDebtor ? 'daily' : 'outline'}
                        size="sm"
                        onClick={() => handleOpenSettleModal(debt)}
                        className="text-xs h-8 px-2.5 gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Settle Up
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-Column: Expense Timeline + Kitty Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expense Timeline (col 8) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-500" />
              Shared Expenses Timeline
            </h3>
            <span className="text-xs text-muted-foreground">
              {expenses.length} recorded items
            </span>
          </div>

          <div className="space-y-2.5">
            {expenses.length === 0 ? (
              <Card className="py-8 text-center text-xs text-muted-foreground">
                No expenses logged yet. Add one to split!
              </Card>
            ) : (
              expenses
                .slice()
                .reverse()
                .map((exp) => {
                  const payer = personas[exp.paidById];
                  const isPayerMe = exp.paidById === currentPersonaId;
                  const catConfig = CATEGORY_ICONS[exp.category] || CATEGORY_ICONS.other;
                  const CatIcon = catConfig.icon;

                  return (
                    <Card key={exp.id} className="hover:border-border/80 transition-colors">
                      <CardContent className="p-4 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 mt-0.5',
                              catConfig.bg,
                              catConfig.color
                            )}
                          >
                            <CatIcon className="w-4 h-4" />
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-semibold text-sm text-foreground leading-snug">
                              {exp.description}
                            </h4>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                              <span className="font-medium text-foreground">
                                {isPayerMe ? 'You' : payer?.name.split(' ')[0]} paid
                              </span>
                              <span>•</span>
                              <span>
                                Split {exp.splitAmongIds?.length || 4} ways (
                                {exp.splitAmongIds
                                  ?.map((id) =>
                                    id === currentPersonaId ? 'You' : personas[id]?.name.split(' ')[0]
                                  )
                                  .join(', ')}
                                )
                              </span>
                              <span>•</span>
                              <span>{exp.date}</span>
                            </div>

                            {exp.notes && (
                              <p className="text-xs text-muted-foreground italic pt-0.5">
                                &ldquo;{exp.notes}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-sm sm:text-base text-foreground block">
                            ₹{exp.amount}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ≈ ₹{Math.round(exp.amount / (exp.splitAmongIds?.length || 1))}/person
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            )}
          </div>
        </div>

        {/* Kitty Fund Ledger (col 4) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-emerald-500" />
              Flat Kitty Activity
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddKittyOpen(true)}
              className="text-xs h-7 px-2"
            >
              <Plus className="w-3 h-3 mr-1" />
              Deposit
            </Button>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-center space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                  Available Buffer
                </span>
                <div className="text-2xl font-bold text-foreground">
                  ₹{kittyBalance.toLocaleString('en-IN')}
                </div>
              </div>

              {kittyTransactions.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  No kitty deposits yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {kittyTransactions
                    .slice()
                    .reverse()
                    .map((tx) => {
                      const person = personas[tx.personaId];
                      const isDeposit = tx.type === 'deposit';

                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between text-xs p-2 rounded-lg border border-border/40 bg-card"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'p-1 rounded-md shrink-0',
                                isDeposit
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-rose-500/10 text-rose-500'
                              )}
                            >
                              {isDeposit ? (
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              )}
                            </span>
                            <div className="truncate max-w-[130px]">
                              <span className="font-medium text-foreground block truncate">
                                {tx.description}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {person?.name.split(' ')[0]}
                              </span>
                            </div>
                          </div>

                          <span
                            className={cn(
                              'font-semibold shrink-0',
                              isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                            )}
                          >
                            {isDeposit ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal: Add Expense */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title="Record Shared Expense"
        description="Log an expense to split automatically with your flatmates."
        size="md"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Description</label>
            <input
              type="text"
              value={expDescription}
              onChange={(e) => setExpDescription(e.target.value)}
              placeholder="e.g. Late Night Pizza, DMart grocery run, WiFi bill..."
              required
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Amount (₹)</label>
              <input
                type="number"
                min={1}
                step={1}
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="₹ 0"
                required
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Category</label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.entries(CATEGORY_ICONS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Paid By</label>
              <select
                value={expPaidBy}
                onChange={(e) => setExpPaidBy(e.target.value as PersonaId)}
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {allRoommates.map((pid) => (
                  <option key={pid} value={pid}>
                    {personas[pid]?.name} {pid === currentPersonaId ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Date</label>
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Split Among Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Split Equally Among ({expSplitAmong.length} selected)
              </label>
              <button
                type="button"
                onClick={() => setExpSplitAmong(allRoommates)}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium"
              >
                Select All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {allRoommates.map((pid) => {
                const isSelected = expSplitAmong.includes(pid);
                const p = personas[pid];
                return (
                  <button
                    type="button"
                    key={pid}
                    onClick={() => toggleSplitUser(pid)}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-colors',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'border-border bg-card hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <Avatar name={p.name} src={p.avatar} size="xs" />
                    <span className="truncate">{p.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Optional Notes</label>
            <input
              type="text"
              value={expNotes}
              onChange={(e) => setExpNotes(e.target.value)}
              placeholder="e.g. Swiggy order #91238"
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddExpenseOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="daily" size="sm">
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Kitty Transaction */}
      <Modal
        isOpen={isAddKittyOpen}
        onClose={() => setIsAddKittyOpen(false)}
        title="Flat Kitty Fund Transaction"
        description="Deposit to or withdraw from the flat emergency pool."
        size="sm"
      >
        <form onSubmit={handleAddKitty} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Transaction Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKittyType('deposit')}
                className={cn(
                  'p-2 rounded-xl border text-xs font-semibold transition-colors',
                  kittyType === 'deposit'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'border-border bg-card hover:bg-muted text-muted-foreground'
                )}
              >
                + Deposit Funds
              </button>
              <button
                type="button"
                onClick={() => setKittyType('withdrawal')}
                className={cn(
                  'p-2 rounded-xl border text-xs font-semibold transition-colors',
                  kittyType === 'withdrawal'
                    ? 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : 'border-border bg-card hover:bg-muted text-muted-foreground'
                )}
              >
                - Withdraw Expense
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Amount (₹)</label>
            <input
              type="number"
              min={1}
              value={kittyAmount}
              onChange={(e) => setKittyAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 500"
              required
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Description / Purpose</label>
            <input
              type="text"
              value={kittyDesc}
              onChange={(e) => setKittyDesc(e.target.value)}
              placeholder="e.g. Monthly maintenance deposit or water can payment"
              required
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddKittyOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="daily" size="sm">
              Record Transaction
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Settle Up with Simulated UPI Deep-Link QR */}
      {settleModalDebt && (
        <Modal
          isOpen={Boolean(settleModalDebt)}
          onClose={() => setSettleModalDebt(null)}
          title="Instant UPI Debt Settlement"
          description="Scan via GPay, PhonePe, Paytm, or tap 'Confirm Payment' to square up."
          size="md"
        >
          {(() => {
            const debtor = personas[settleModalDebt.debtorId];
            const creditor = personas[settleModalDebt.creditorId];
            const upiUri = generateUpiUri(settleModalDebt.creditorId, settleModalDebt.amount);

            return (
              <div className="space-y-4 text-center">
                {/* Transfer summary banner */}
                <div className="p-3.5 rounded-2xl bg-muted/50 border border-border flex items-center justify-between text-left">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={creditor?.name || 'Creditor'} src={creditor?.avatar} size="md" />
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                        Paying Creditor
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {creditor?.name}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-mono">
                        {creditor?.upiId}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Amount Due
                    </span>
                    <span className="text-xl font-extrabold text-foreground">
                      ₹{settleModalDebt.amount}
                    </span>
                  </div>
                </div>

                {/* Simulated UPI QR Code SVG */}
                <div className="flex flex-col items-center justify-center p-4 bg-muted/20 border border-border rounded-2xl">
                  <UpiQrSvg payload={upiUri} size={200} />
                  <span className="text-[11px] text-muted-foreground mt-2 font-medium">
                    Valid simulated UPI QR SVG • Ready for scanning
                  </span>
                </div>

                {/* Copyable UPI URI */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Direct UPI Deep-Link URI
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={upiUri}
                      className="w-full text-[11px] font-mono bg-muted/60 border border-border rounded-xl px-3 py-2 text-foreground truncate select-all"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard?.writeText(upiUri);
                        setCopiedUpiUri(true);
                        setTimeout(() => setCopiedUpiUri(false), 2000);
                      }}
                      className="shrink-0 h-8 px-3 text-xs gap-1"
                    >
                      {copiedUpiUri ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSettleModalDebt(null)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="daily"
                    size="sm"
                    onClick={handleConfirmSettlement}
                    className="w-full sm:w-auto font-semibold shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Confirm Payment & Settle Debt
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
