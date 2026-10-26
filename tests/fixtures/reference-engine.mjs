// ============================================================================
// SquadPulse Reference Engine & Algorithmic Oracle
// Implements exact mathematical specifications and domain state behavior
// ============================================================================

import { getFreshSeedData } from './seed-data.mjs';

/**
 * Greedily minimizes pairwise debts among personas.
 * Follows Conservation of Money: sum(balances) == 0.
 * Produces at most N - 1 settlement transactions.
 */
export function calculatePairwiseDebts(expenses, personas) {
  if (!expenses || expenses.length === 0 || !personas || personas.length === 0) {
    return [];
  }

  // Initialize net balances: positive = is owed money, negative = owes money
  const balances = {};
  for (const p of personas) {
    balances[p.id] = 0;
  }

  // Process all expenses
  for (const exp of expenses) {
    if (!exp.amount || exp.amount <= 0) continue;
    const payer = exp.paidById;
    const splits = exp.splitAmongIds && exp.splitAmongIds.length > 0
      ? exp.splitAmongIds
      : personas.map(p => p.id);

    if (splits.length === 0) continue;

    const share = exp.amount / splits.length;

    // Credit payer full amount
    if (balances[payer] === undefined) balances[payer] = 0;
    balances[payer] += exp.amount;

    // Debit each participant
    for (const participant of splits) {
      if (balances[participant] === undefined) balances[participant] = 0;
      balances[participant] -= share;
    }
  }

  // Partition into Debtors and Creditors
  const EPSILON = 0.01;
  const debtors = [];
  const creditors = [];

  for (const [id, balance] of Object.entries(balances)) {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded < -EPSILON) {
      debtors.push({ id, amount: -rounded });
    } else if (rounded > EPSILON) {
      creditors.push({ id, amount: rounded });
    }
  }

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);
    const roundedAmount = Math.round(settleAmount * 100) / 100;

    if (roundedAmount > 0) {
      settlements.push({
        debtorId: debtor.id,
        creditorId: creditor.id,
        amount: roundedAmount,
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount <= EPSILON) dIdx++;
    if (creditor.amount <= EPSILON) cIdx++;
  }

  return settlements;
}

/**
 * Advances chore turn to next roommate in cyclic permutation order.
 * Appends completion history record.
 */
export function advanceChoreTurn(chore, completedById, note = '') {
  if (!chore || !chore.rotationOrder || chore.rotationOrder.length === 0) {
    throw new Error('Chore must have a valid rotationOrder');
  }

  const order = chore.rotationOrder;
  const currentIndex = order.indexOf(chore.currentAssigneeId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % order.length;
  const nextAssigneeId = order[nextIndex];
  const nowStr = new Date().toISOString();

  const historyEntry = {
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    completedById,
    timestamp: nowStr,
    note,
  };

  return {
    ...chore,
    currentAssigneeId: nextAssigneeId,
    lastCompletedDate: nowStr,
    history: [historyEntry, ...(chore.history || [])],
  };
}

/**
 * Calculates poll integer percentages via Hamilton Largest Remainder Method.
 * Guarantees total integer sum is exactly 100% (or 0% if 0 votes).
 */
export function calculatePollPercentages(options) {
  if (!options || options.length === 0) return [];

  const counts = options.map(o => (o.voterIds ? o.voterIds.length : 0));
  const totalVotes = counts.reduce((acc, c) => acc + c, 0);

  if (totalVotes === 0) {
    return options.map(o => ({
      ...o,
      voteCount: 0,
      percentage: 0,
      floatPercentage: 0,
    }));
  }

  const rawPercentages = counts.map(c => (c / totalVotes) * 100);
  const integerParts = rawPercentages.map(r => Math.floor(r));
  const remainders = rawPercentages.map((r, i) => ({ index: i, remainder: r - integerParts[i] }));

  const allocatedSum = integerParts.reduce((acc, val) => acc + val, 0);
  let deficit = 100 - allocatedSum;

  // Sort descending by remainder
  remainders.sort((a, b) => b.remainder - a.remainder);

  // Allocate +1 to highest remainders
  for (let i = 0; i < deficit && i < remainders.length; i++) {
    integerParts[remainders[i].index] += 1;
  }

  return options.map((opt, i) => ({
    ...opt,
    voteCount: counts[i],
    percentage: integerParts[i],
    floatPercentage: Math.round(rawPercentages[i] * 10) / 10,
  }));
}

/**
 * Calculates habit and coding streak with 1-day grace period.
 * Given array of 'YYYY-MM-DD' check-in strings.
 */
export function calculateStreak(dateStrings, referenceDate = new Date()) {
  if (!dateStrings || dateStrings.length === 0) {
    return { streak: 0, flameTier: 'None', status: 'inactive' };
  }

  // Normalize, deduplicate, and sort descending
  const uniqueDates = Array.from(new Set(dateStrings.filter(Boolean))).sort().reverse();
  if (uniqueDates.length === 0) {
    return { streak: 0, flameTier: 'None', status: 'inactive' };
  }

  const toDateStr = d => d.toISOString().slice(0, 10);
  const ref = new Date(referenceDate);
  const todayStr = toDateStr(ref);

  const yesterday = new Date(ref);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateStr(yesterday);

  let currentStreak = 0;
  let expectedDate = null;
  let status = 'active';

  const mostRecent = uniqueDates[0];

  if (mostRecent === todayStr) {
    currentStreak = 1;
    expectedDate = new Date(ref);
    expectedDate.setDate(expectedDate.getDate() - 1);
    status = 'completed_today';
  } else if (mostRecent === yesterdayStr) {
    currentStreak = 1;
    expectedDate = new Date(yesterday);
    expectedDate.setDate(expectedDate.getDate() - 1);
    status = 'grace_period_pending_today';
  } else {
    // Gap >= 2 calendar days -> streak is broken
    return { streak: 0, flameTier: 'None', status: 'broken' };
  }

  // Iterate backwards through remaining dates
  for (let i = 1; i < uniqueDates.length; i++) {
    const checkStr = uniqueDates[i];
    const expectedStr = toDateStr(expectedDate);

    if (checkStr === expectedStr) {
      currentStreak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  let flameTier = 'None';
  if (currentStreak >= 14) flameTier = 'Legendary Phoenix';
  else if (currentStreak >= 7) flameTier = 'Inferno';
  else if (currentStreak >= 3) flameTier = 'Blaze';
  else if (currentStreak >= 1) flameTier = 'Spark';

  return { streak: currentStreak, flameTier, status };
}

/**
 * Generates 30-day heatmap grid from start date.
 */
export function generate30DayHeatmap(checkIns = [], startDateStr, referenceDate = new Date()) {
  const checkInSet = new Set(checkIns);
  const start = new Date(startDateStr);
  const ref = new Date(referenceDate);
  const todayStr = ref.toISOString().slice(0, 10);

  const cells = [];
  for (let i = 0; i < 30; i++) {
    const cur = new Date(start);
    cur.setDate(start.getDate() + i);
    const dateStr = cur.toISOString().slice(0, 10);

    const isCompleted = checkInSet.has(dateStr);
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;

    let level = 0;
    if (isCompleted) level = 3;
    else if (isToday) level = 1;

    cells.push({
      date: dateStr,
      dayNumber: i + 1,
      isCompleted,
      isToday,
      isFuture,
      level,
    });
  }
  return cells;
}

/**
 * Creates an isolated SquadPulse simulated state store for testing.
 */
export function createSimulatorStore(customData = null) {
  const state = customData || getFreshSeedData();

  return {
    state,

    // Persona & System actions
    setPersona(id) {
      const p = state.personas.find(x => x.id === id);
      if (!p) throw new Error(`Persona ${id} not found`);
      state.system.currentPersonaId = id;
    },

    setTheme(theme) {
      state.system.theme = theme;
    },

    // Daily Life: Status Radar & Pings
    updateStatus(badge, customMessage = '', durationMinutes = 60) {
      const user = state.system.currentPersonaId;
      const now = new Date();
      const expires = new Date(now.getTime() + durationMinutes * 60 * 1000);
      state.statuses[user] = {
        personaId: user,
        badge,
        customMessage,
        updatedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
      };
    },

    sendPing(recipientId, presetText) {
      const sender = state.system.currentPersonaId;
      const now = new Date();
      const expires = new Date(now.getTime() + 30 * 60 * 1000);
      const ping = {
        id: `ping-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        senderId: sender,
        recipientId,
        presetText,
        createdAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        isRead: false,
      };
      state.pings.push(ping);
      return ping;
    },

    // Carpool actions
    addCarpool(rideData) {
      const creator = state.system.currentPersonaId;
      const ride = {
        id: `ride-${Date.now()}`,
        creatorId: creator,
        passengers: [creator],
        status: 'Upcoming',
        createdAt: new Date().toISOString(),
        ...rideData,
      };
      state.carpools.push(ride);
      return ride;
    },

    joinCarpool(rideId) {
      const user = state.system.currentPersonaId;
      const ride = state.carpools.find(r => r.id === rideId);
      if (!ride) throw new Error('Ride not found');
      if (ride.passengers.includes(user)) throw new Error('Already joined ride');
      if (ride.passengers.length >= ride.totalSeats) throw new Error('Ride is already full');
      ride.passengers.push(user);
    },

    leaveCarpool(rideId) {
      const user = state.system.currentPersonaId;
      const ride = state.carpools.find(r => r.id === rideId);
      if (!ride) throw new Error('Ride not found');
      const idx = ride.passengers.indexOf(user);
      if (idx === -1) throw new Error('User not in this ride');
      ride.passengers.splice(idx, 1);
    },

    // Chores actions
    completeChoreTurn(choreId, note = '') {
      const user = state.system.currentPersonaId;
      const chore = state.chores.find(c => c.id === choreId);
      if (!chore) throw new Error('Chore not found');
      const updated = advanceChoreTurn(chore, user, note);
      const idx = state.chores.findIndex(c => c.id === choreId);
      state.chores[idx] = updated;

      // Update persona stats
      const p = state.personas.find(x => x.id === user);
      if (p && p.stats) p.stats.choresCompleted++;
      return updated;
    },

    // Borrow actions
    addBorrowItem(itemData) {
      const user = state.system.currentPersonaId;
      const item = {
        id: `borrow-${Date.now()}`,
        ownerId: user,
        borrowerOrClaimerId: null,
        status: 'Open',
        createdAt: new Date().toISOString(),
        resolvedAt: null,
        depositRequired: 0,
        ...itemData,
      };
      state.borrowItems.push(item);
      return item;
    },

    updateBorrowStatus(itemId, newStatus, targetBorrowerId = null) {
      const item = state.borrowItems.find(b => b.id === itemId);
      if (!item) throw new Error('Borrow item not found');
      item.status = newStatus;
      if (newStatus === 'Borrowed') {
        item.borrowerOrClaimerId = targetBorrowerId || state.system.currentPersonaId;
      } else if (newStatus === 'Resolved' || newStatus === 'Returned') {
        item.resolvedAt = new Date().toISOString();
      }
    },

    // Expense & Wallet actions
    addExpense(expData) {
      if (!expData.amount || expData.amount <= 0) {
        throw new Error('Expense amount must be positive');
      }
      const exp = {
        id: `exp-${Date.now()}`,
        paidById: state.system.currentPersonaId,
        date: new Date().toISOString().slice(0, 10),
        ...expData,
      };
      state.expenses.push(exp);
      return exp;
    },

    addKittyDeposit(amount, description = 'Kitty deposit') {
      if (!amount || amount <= 0) throw new Error('Deposit must be positive');
      const tx = {
        id: `kitty-${Date.now()}`,
        personaId: state.system.currentPersonaId,
        amount,
        type: 'deposit',
        description,
        createdAt: new Date().toISOString(),
      };
      state.kittyTransactions.push(tx);
      return tx;
    },

    // Study: Daily Coding Challenge
    submitCodingSolution(problemId, codeSnippet, language = 'TypeScript') {
      if (!codeSnippet || !codeSnippet.trim()) {
        throw new Error('Code snippet cannot be empty');
      }
      const user = state.system.currentPersonaId;
      const prob = state.codingProblems.find(p => p.id === problemId);
      if (!prob) throw new Error('Problem not found');

      const sub = {
        id: `sub-${Date.now()}`,
        problemId,
        personaId: user,
        codeSnippet,
        language,
        submittedAt: new Date().toISOString(),
        status: 'Accepted',
      };
      prob.submissions.push(sub);

      // Increment stats
      const p = state.personas.find(x => x.id === user);
      if (p && p.stats) p.stats.studyStreak++;
      return sub;
    },

    // Study: Doubts
    addDoubt(doubtData) {
      if (!doubtData.title || !doubtData.title.trim()) {
        throw new Error('Doubt title cannot be empty');
      }
      const doubt = {
        id: `doubt-${Date.now()}`,
        authorId: state.system.currentPersonaId,
        upvotes: [],
        answers: [],
        isResolved: false,
        createdAt: new Date().toISOString(),
        urgency: 'Normal',
        tags: [],
        ...doubtData,
      };
      state.doubts.push(doubt);
      return doubt;
    },

    addDoubtAnswer(doubtId, answerData) {
      const doubt = state.doubts.find(d => d.id === doubtId);
      if (!doubt) throw new Error('Doubt not found');
      const ans = {
        id: `ans-${Date.now()}`,
        doubtId,
        authorId: state.system.currentPersonaId,
        upvotes: [],
        isAccepted: false,
        createdAt: new Date().toISOString(),
        ...answerData,
      };
      doubt.answers.push(ans);
      return ans;
    },

    toggleDoubtUpvote(doubtId) {
      const user = state.system.currentPersonaId;
      const doubt = state.doubts.find(d => d.id === doubtId);
      if (!doubt) throw new Error('Doubt not found');
      const idx = doubt.upvotes.indexOf(user);
      if (idx === -1) {
        doubt.upvotes.push(user);
      } else {
        doubt.upvotes.splice(idx, 1);
      }
    },

    acceptDoubtAnswer(doubtId, answerId) {
      const doubt = state.doubts.find(d => d.id === doubtId);
      if (!doubt) throw new Error('Doubt not found');
      for (const a of doubt.answers) {
        a.isAccepted = a.id === answerId;
      }
      doubt.isResolved = true;
    },

    // Study: Exams
    toggleExamTopic(examId, topicId) {
      const user = state.system.currentPersonaId;
      const exam = state.exams.find(e => e.id === examId);
      if (!exam) throw new Error('Exam not found');
      const topic = exam.topics.find(t => t.id === topicId);
      if (!topic) throw new Error('Topic not found');
      if (!topic.completedBy) topic.completedBy = {};
      topic.completedBy[user] = !topic.completedBy[user];
    },

    // Study: Hackathons
    joinHackathonSlot(projectId, slotIndex) {
      const user = state.system.currentPersonaId;
      const proj = state.hackathons.find(h => h.id === projectId);
      if (!proj) throw new Error('Hackathon project not found');
      if (!proj.slots[slotIndex]) throw new Error('Slot index out of bounds');
      if (proj.slots[slotIndex].assignedPersonaId !== null) {
        throw new Error('Slot is already assigned');
      }
      proj.slots[slotIndex].assignedPersonaId = user;
      const allFilled = proj.slots.every(s => s.assignedPersonaId !== null);
      if (allFilled) proj.status = 'Roster Full';
    },

    leaveHackathonSlot(projectId, slotIndex) {
      const user = state.system.currentPersonaId;
      const proj = state.hackathons.find(h => h.id === projectId);
      if (!proj) throw new Error('Hackathon project not found');
      if (!proj.slots[slotIndex]) throw new Error('Slot index out of bounds');
      if (proj.slots[slotIndex].assignedPersonaId !== user) {
        throw new Error('User does not hold this slot');
      }
      proj.slots[slotIndex].assignedPersonaId = null;
      proj.status = 'Recruiting';
    },

    // Fun: Polls
    votePoll(pollId, optionId) {
      const user = state.system.currentPersonaId;
      const poll = state.polls.find(p => p.id === pollId);
      if (!poll) throw new Error('Poll not found');
      const targetOpt = poll.options.find(o => o.id === optionId);
      if (!targetOpt) throw new Error('Option not found');

      if (!poll.isMultiChoice) {
        // Remove user from all other options
        for (const opt of poll.options) {
          const idx = opt.voterIds.indexOf(user);
          if (idx !== -1) opt.voterIds.splice(idx, 1);
        }
      }

      if (!targetOpt.voterIds.includes(user)) {
        targetOpt.voterIds.push(user);
      }
    },

    // Fun: Watch/Play
    toggleWatchPlayInterest(itemId) {
      const user = state.system.currentPersonaId;
      const item = state.watchPlayList.find(w => w.id === itemId);
      if (!item) throw new Error('Media item not found');
      const idx = item.interestedPersonaIds.indexOf(user);
      if (idx === -1) {
        item.interestedPersonaIds.push(user);
      } else {
        item.interestedPersonaIds.splice(idx, 1);
      }
    },

    // Fun: Habits
    checkInHabit(challengeId, dateStr = new Date().toISOString().slice(0, 10)) {
      const user = state.system.currentPersonaId;
      const hab = state.habits.find(h => h.id === challengeId);
      if (!hab) throw new Error('Habit challenge not found');
      if (!hab.checkIns[user]) hab.checkIns[user] = [];
      if (!hab.checkIns[user].includes(dateStr)) {
        hab.checkIns[user].push(dateStr);
      }
    },

    pokeMember(challengeId, targetPersonaId) {
      const sender = state.system.currentPersonaId;
      const hab = state.habits.find(h => h.id === challengeId);
      if (!hab) throw new Error('Habit challenge not found');
      hab.pokes.push({
        fromPersonaId: sender,
        toPersonaId: targetPersonaId,
        timestamp: new Date().toISOString(),
      });
    },

    // Fun: Memes
    toggleMemeReaction(memeId) {
      const user = state.system.currentPersonaId;
      const meme = state.memes.find(m => m.id === memeId);
      if (!meme) throw new Error('Meme not found');
      const idx = meme.laughReactionIds.indexOf(user);
      if (idx === -1) {
        meme.laughReactionIds.push(user);
      } else {
        meme.laughReactionIds.splice(idx, 1);
      }
    },

    // Computed Getters
    getPairwiseDebts() {
      return calculatePairwiseDebts(state.expenses, state.personas);
    },

    getPersonaDebtView(personaId) {
      const debts = calculatePairwiseDebts(state.expenses, state.personas);
      const owes = debts.filter(d => d.debtorId === personaId);
      const isOwed = debts.filter(d => d.creditorId === personaId);
      const totalOwed = owes.reduce((acc, d) => acc + d.amount, 0);
      const totalCredit = isOwed.reduce((acc, d) => acc + d.amount, 0);
      return {
        owes,
        isOwed,
        netBalance: Math.round((totalCredit - totalOwed) * 100) / 100,
      };
    },

    getPollResults(pollId) {
      const poll = state.polls.find(p => p.id === pollId);
      if (!poll) throw new Error('Poll not found');
      return calculatePollPercentages(poll.options);
    },

    getSyllabusProgress(examId) {
      const exam = state.exams.find(e => e.id === examId);
      if (!exam) throw new Error('Exam not found');
      if (!exam.topics || exam.topics.length === 0) return { groupPercent: 0, personaPercents: {} };

      const totalTopics = exam.topics.length;
      const personaCounts = {};
      for (const p of state.personas) personaCounts[p.id] = 0;

      for (const top of exam.topics) {
        if (!top.completedBy) continue;
        for (const [pId, done] of Object.entries(top.completedBy)) {
          if (done && personaCounts[pId] !== undefined) {
            personaCounts[pId]++;
          }
        }
      }

      const personaPercents = {};
      let sumPercents = 0;
      for (const p of state.personas) {
        const pct = Math.round((personaCounts[p.id] / totalTopics) * 100);
        personaPercents[p.id] = pct;
        sumPercents += pct;
      }

      return {
        groupPercent: Math.round(sumPercents / state.personas.length),
        personaPercents,
      };
    },
  };
}
