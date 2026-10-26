'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Persona,
  PersonaId,
  ThemeMode,
  ActiveSection,
  UserStatus,
  StatusBadge,
  HangoutPing,
  CarpoolRide,
  Chore,
  BorrowItem,
  BorrowStatus,
  Expense,
  KittyTransaction,
  DailyCodingProblem,
  CodingSubmission,
  DoubtItem,
  DoubtAnswer,
  ExamItem,
  HackathonProject,
  PollItem,
  WatchPlayItem,
  MediaStatus,
  HabitChallenge,
  MemeItem,
} from '@/types';
import {
  SEED_PERSONAS,
  SEED_STATUSES,
  SEED_PINGS,
  SEED_CARPOOLS,
  SEED_CHORES,
  SEED_BORROW_ITEMS,
  SEED_EXPENSES,
  SEED_KITTY_TRANSACTIONS,
  SEED_CODING_PROBLEM,
  SEED_DOUBTS,
  SEED_EXAMS,
  SEED_HACKATHONS,
  SEED_POLLS,
  SEED_WATCH_PLAY,
  SEED_HABITS,
  SEED_MEMES,
} from '@/data/seedData';
import { advanceChoreTurn } from '@/lib/algorithms';
import { format } from 'date-fns';

export interface SquadPulseState {
  // Shell & System
  currentPersonaId: PersonaId;
  theme: ThemeMode;
  activeSection: ActiveSection;
  isSidebarCollapsed: boolean;
  isPingDrawerOpen: boolean;

  // Personas
  personas: Record<PersonaId, Persona>;

  // Daily Life
  statuses: Record<PersonaId, UserStatus>;
  hangoutPings: HangoutPing[];
  carpools: CarpoolRide[];
  chores: Chore[];
  borrowItems: BorrowItem[];
  expenses: Expense[];
  kittyTransactions: KittyTransaction[];

  // Study & Growth
  codingProblem: DailyCodingProblem;
  doubts: DoubtItem[];
  exams: ExamItem[];
  hackathons: HackathonProject[];

  // Fun & Culture
  polls: PollItem[];
  watchPlayList: WatchPlayItem[];
  habitChallenges: HabitChallenge[];
  memes: MemeItem[];

  // System Actions
  setActivePersona: (id: PersonaId) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setActiveSection: (section: ActiveSection) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  togglePingDrawer: () => void;
  setPingDrawerOpen: (open: boolean) => void;
  resetToSeedData: () => void;

  // Daily Life Actions
  updateStatus: (badge: StatusBadge, customMessage: string, durationMinutes: number) => void;
  sendPing: (recipientId: PersonaId | 'all', presetText: string) => void;
  markPingAsRead: (pingId: string) => void;

  addCarpool: (ride: Omit<CarpoolRide, 'id' | 'createdAt' | 'passengers' | 'status'>) => void;
  joinCarpool: (rideId: string) => void;
  leaveCarpool: (rideId: string) => void;
  cancelCarpool: (rideId: string) => void;

  completeChoreTurn: (choreId: string, note?: string) => void;
  swapChoreAssignee: (choreId: string, targetPersonaId: PersonaId) => void;

  addBorrowItem: (item: Omit<BorrowItem, 'id' | 'createdAt' | 'resolvedAt'>) => void;
  updateBorrowStatus: (itemId: string, status: BorrowStatus, borrowerId?: PersonaId | null) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'date'> & { date?: string }) => void;
  settleDebt: (debtorId: PersonaId, creditorId: PersonaId, amount: number) => void;
  addKittyTransaction: (amount: number, type: 'deposit' | 'withdrawal', description: string) => void;

  // Study & Growth Actions
  submitCodingSolution: (code: string, language: CodingSubmission['language']) => void;
  addDoubt: (doubt: Omit<DoubtItem, 'id' | 'createdAt' | 'upvotes' | 'answers' | 'isResolved'>) => void;
  addDoubtAnswer: (doubtId: string, body: string, codeSnippet?: string, language?: string) => void;
  toggleDoubtUpvote: (doubtId: string) => void;
  toggleAnswerUpvote: (doubtId: string, answerId: string) => void;
  acceptDoubtAnswer: (doubtId: string, answerId: string) => void;
  toggleExamTopic: (examId: string, topicId: string) => void;
  joinHackathonSlot: (projectId: string, roleIndex: number) => void;
  leaveHackathonSlot: (projectId: string, roleIndex: number) => void;

  // Fun & Culture Actions
  votePoll: (pollId: string, optionId: string) => void;
  addPoll: (poll: Omit<PollItem, 'id' | 'createdAt'>) => void;
  addWatchPlayItem: (item: Omit<WatchPlayItem, 'id' | 'createdAt' | 'interestedPersonaIds'>) => void;
  toggleWatchPlayInterest: (itemId: string) => void;
  updateWatchPlayStatus: (itemId: string, status: MediaStatus) => void;
  checkInHabit: (challengeId: string, dateStr?: string) => void;
  pokeMember: (challengeId: string, targetPersonaId: PersonaId) => void;
  addMeme: (meme: Omit<MemeItem, 'id' | 'createdAt' | 'laughReactionIds'>) => void;
  toggleMemeReaction: (memeId: string) => void;
}

export const useSquadStore = create<SquadPulseState>()(
  persist(
    (set, get) => ({
      // Initial System State
      currentPersonaId: 'aman',
      theme: 'dark',
      activeSection: 'hub',
      isSidebarCollapsed: false,
      isPingDrawerOpen: false,

      // Initial Data from Seeds
      personas: SEED_PERSONAS,
      statuses: SEED_STATUSES,
      hangoutPings: SEED_PINGS,
      carpools: SEED_CARPOOLS,
      chores: SEED_CHORES,
      borrowItems: SEED_BORROW_ITEMS,
      expenses: SEED_EXPENSES,
      kittyTransactions: SEED_KITTY_TRANSACTIONS,
      codingProblem: SEED_CODING_PROBLEM,
      doubts: SEED_DOUBTS,
      exams: SEED_EXAMS,
      hackathons: SEED_HACKATHONS,
      polls: SEED_POLLS,
      watchPlayList: SEED_WATCH_PLAY,
      habitChallenges: SEED_HABITS,
      memes: SEED_MEMES,

      // System Actions
      setActivePersona: (id) => set({ currentPersonaId: id }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setActiveSection: (section) => set({ activeSection: section }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      togglePingDrawer: () => set((state) => ({ isPingDrawerOpen: !state.isPingDrawerOpen })),
      setPingDrawerOpen: (open) => set({ isPingDrawerOpen: open }),

      resetToSeedData: () =>
        set({
          personas: SEED_PERSONAS,
          statuses: SEED_STATUSES,
          hangoutPings: SEED_PINGS,
          carpools: SEED_CARPOOLS,
          chores: SEED_CHORES,
          borrowItems: SEED_BORROW_ITEMS,
          expenses: SEED_EXPENSES,
          kittyTransactions: SEED_KITTY_TRANSACTIONS,
          codingProblem: SEED_CODING_PROBLEM,
          doubts: SEED_DOUBTS,
          exams: SEED_EXAMS,
          hackathons: SEED_HACKATHONS,
          polls: SEED_POLLS,
          watchPlayList: SEED_WATCH_PLAY,
          habitChallenges: SEED_HABITS,
          memes: SEED_MEMES,
        }),

      // Daily Life: Status Radar
      updateStatus: (badge, customMessage, durationMinutes) => {
        const { currentPersonaId } = get();
        const now = new Date();
        const expires = new Date(now.getTime() + durationMinutes * 60 * 1000);

        set((state) => ({
          statuses: {
            ...state.statuses,
            [currentPersonaId]: {
              personaId: currentPersonaId,
              badge,
              customMessage,
              updatedAt: now.toISOString(),
              expiresAt: expires.toISOString(),
            },
          },
        }));
      },

      // Daily Life: Hangout Pings
      sendPing: (recipientId, presetText) => {
        const { currentPersonaId } = get();
        const now = new Date();
        const expires = new Date(now.getTime() + 45 * 60 * 1000);

        const newPing: HangoutPing = {
          id: `ping-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          senderId: currentPersonaId,
          recipientId,
          presetText,
          createdAt: now.toISOString(),
          expiresAt: expires.toISOString(),
          isRead: false,
        };

        set((state) => ({
          hangoutPings: [newPing, ...state.hangoutPings],
        }));
      },

      markPingAsRead: (pingId) =>
        set((state) => ({
          hangoutPings: state.hangoutPings.map((p) =>
            p.id === pingId ? { ...p, isRead: true } : p
          ),
        })),

      // Daily Life: Carpool
      addCarpool: (ride) => {
        const { currentPersonaId } = get();
        const newRide: CarpoolRide = {
          ...ride,
          id: `ride-${Date.now()}`,
          creatorId: currentPersonaId,
          passengers: [],
          status: 'Upcoming',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          carpools: [newRide, ...state.carpools],
        }));
      },

      joinCarpool: (rideId) => {
        const { currentPersonaId } = get();
        set((state) => ({
          carpools: state.carpools.map((ride) => {
            if (ride.id !== rideId) return ride;
            if (ride.passengers.includes(currentPersonaId)) return ride;
            if (ride.creatorId === currentPersonaId) return ride;
            if (ride.passengers.length >= ride.totalSeats) return ride;
            return {
              ...ride,
              passengers: [...ride.passengers, currentPersonaId],
            };
          }),
        }));
      },

      leaveCarpool: (rideId) => {
        const { currentPersonaId } = get();
        set((state) => ({
          carpools: state.carpools.map((ride) => {
            if (ride.id !== rideId) return ride;
            return {
              ...ride,
              passengers: ride.passengers.filter((p) => p !== currentPersonaId),
            };
          }),
        }));
      },

      cancelCarpool: (rideId) =>
        set((state) => ({
          carpools: state.carpools.map((ride) =>
            ride.id === rideId ? { ...ride, status: 'Cancelled' as const } : ride
          ),
        })),

      // Daily Life: Chores Rotation
      completeChoreTurn: (choreId, note) => {
        const { currentPersonaId } = get();
        set((state) => ({
          chores: state.chores.map((chore) => {
            if (chore.id !== choreId) return chore;
            return advanceChoreTurn(chore, currentPersonaId, note);
          }),
          personas: {
            ...state.personas,
            [currentPersonaId]: {
              ...state.personas[currentPersonaId],
              stats: {
                ...state.personas[currentPersonaId].stats,
                choresCompleted: state.personas[currentPersonaId].stats.choresCompleted + 1,
              },
            },
          },
        }));
      },

      swapChoreAssignee: (choreId, targetPersonaId) =>
        set((state) => ({
          chores: state.chores.map((chore) =>
            chore.id === choreId ? { ...chore, currentAssigneeId: targetPersonaId } : chore
          ),
        })),

      // Daily Life: Borrow Board
      addBorrowItem: (item) => {
        const newItem: BorrowItem = {
          ...item,
          id: `borrow-${Date.now()}`,
          createdAt: new Date().toISOString(),
          resolvedAt: null,
        };
        set((state) => ({
          borrowItems: [newItem, ...state.borrowItems],
        }));
      },

      updateBorrowStatus: (itemId, status, borrowerId) =>
        set((state) => ({
          borrowItems: state.borrowItems.map((item) => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              status,
              borrowerOrClaimerId: borrowerId !== undefined ? borrowerId : item.borrowerOrClaimerId,
              resolvedAt: status === 'Resolved' || status === 'Returned' ? new Date().toISOString() : item.resolvedAt,
            };
          }),
        })),

      // Daily Life: Group Expenses & Debt Settlement
      addExpense: (expenseData) => {
        const { currentPersonaId } = get();
        const newExpense: Expense = {
          ...expenseData,
          id: `exp-${Date.now()}`,
          date: expenseData.date || format(new Date(), 'yyyy-MM-dd'),
          paidById: expenseData.paidById || currentPersonaId,
        };

        set((state) => ({
          expenses: [newExpense, ...state.expenses],
        }));
      },

      settleDebt: (debtorId, creditorId, amount) => {
        // Record settlement transaction
        const settlementExpense: Expense = {
          id: `settle-${Date.now()}`,
          description: `Direct UPI Debt Settlement to ${get().personas[creditorId]?.name || creditorId}`,
          amount,
          paidById: debtorId,
          splitAmongIds: [creditorId],
          category: 'other',
          date: format(new Date(), 'yyyy-MM-dd'),
          notes: 'Automated settlement record',
        };

        set((state) => ({
          expenses: [settlementExpense, ...state.expenses],
        }));
      },

      addKittyTransaction: (amount, type, description) => {
        const { currentPersonaId } = get();
        const newTx: KittyTransaction = {
          id: `kit-${Date.now()}`,
          personaId: currentPersonaId,
          amount,
          type,
          description,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          kittyTransactions: [newTx, ...state.kittyTransactions],
        }));
      },

      // Study & Growth: Coding Challenge
      submitCodingSolution: (code, language) => {
        const { currentPersonaId, codingProblem } = get();
        const newSub: CodingSubmission = {
          id: `sub-${Date.now()}`,
          problemId: codingProblem.id,
          personaId: currentPersonaId,
          codeSnippet: code,
          language,
          submittedAt: new Date().toISOString(),
          status: 'Accepted',
        };

        set((state) => ({
          codingProblem: {
            ...state.codingProblem,
            submissions: [newSub, ...state.codingProblem.submissions.filter((s) => s.personaId !== currentPersonaId)],
          },
          personas: {
            ...state.personas,
            [currentPersonaId]: {
              ...state.personas[currentPersonaId],
              stats: {
                ...state.personas[currentPersonaId].stats,
                studyStreak: state.personas[currentPersonaId].stats.studyStreak + 1,
              },
            },
          },
        }));
      },

      // Study & Growth: Doubts
      addDoubt: (doubt) => {
        const { currentPersonaId } = get();
        const newDoubt: DoubtItem = {
          ...doubt,
          id: `doubt-${Date.now()}`,
          authorId: currentPersonaId,
          upvotes: [currentPersonaId],
          answers: [],
          isResolved: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          doubts: [newDoubt, ...state.doubts],
        }));
      },

      addDoubtAnswer: (doubtId, body, codeSnippet, language) => {
        const { currentPersonaId } = get();
        const newAnswer: DoubtAnswer = {
          id: `ans-${Date.now()}`,
          doubtId,
          authorId: currentPersonaId,
          body,
          codeSnippet,
          language,
          upvotes: [currentPersonaId],
          isAccepted: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          doubts: state.doubts.map((d) =>
            d.id === doubtId ? { ...d, answers: [...d.answers, newAnswer] } : d
          ),
        }));
      },

      toggleDoubtUpvote: (doubtId) => {
        const { currentPersonaId } = get();
        set((state) => ({
          doubts: state.doubts.map((d) => {
            if (d.id !== doubtId) return d;
            const hasUpvoted = d.upvotes.includes(currentPersonaId);
            return {
              ...d,
              upvotes: hasUpvoted
                ? d.upvotes.filter((id) => id !== currentPersonaId)
                : [...d.upvotes, currentPersonaId],
            };
          }),
        }));
      },

      toggleAnswerUpvote: (doubtId, answerId) => {
        const { currentPersonaId } = get();
        set((state) => ({
          doubts: state.doubts.map((d) => {
            if (d.id !== doubtId) return d;
            return {
              ...d,
              answers: d.answers.map((a) => {
                if (a.id !== answerId) return a;
                const hasUpvoted = a.upvotes.includes(currentPersonaId);
                return {
                  ...a,
                  upvotes: hasUpvoted
                    ? a.upvotes.filter((id) => id !== currentPersonaId)
                    : [...a.upvotes, currentPersonaId],
                };
              }),
            };
          }),
        }));
      },

      acceptDoubtAnswer: (doubtId, answerId) =>
        set((state) => ({
          doubts: state.doubts.map((d) => {
            if (d.id !== doubtId) return d;
            return {
              ...d,
              isResolved: true,
              answers: d.answers.map((a) => ({
                ...a,
                isAccepted: a.id === answerId,
              })),
            };
          }),
        })),

      // Study & Growth: Exams
      toggleExamTopic: (examId, topicId) => {
        const { currentPersonaId } = get();
        set((state) => ({
          exams: state.exams.map((exam) => {
            if (exam.id !== examId) return exam;
            return {
              ...exam,
              topics: exam.topics.map((t) => {
                if (t.id !== topicId) return t;
                const currentVal = t.completedBy[currentPersonaId] || false;
                return {
                  ...t,
                  completedBy: {
                    ...t.completedBy,
                    [currentPersonaId]: !currentVal,
                  },
                };
              }),
            };
          }),
        }));
      },

      // Study & Growth: Hackathons
      joinHackathonSlot: (projectId, roleIndex) => {
        const { currentPersonaId } = get();
        set((state) => ({
          hackathons: state.hackathons.map((h) => {
            if (h.id !== projectId) return h;
            const updatedSlots = [...h.slots];
            if (updatedSlots[roleIndex] && !updatedSlots[roleIndex].assignedPersonaId) {
              updatedSlots[roleIndex] = {
                ...updatedSlots[roleIndex],
                assignedPersonaId: currentPersonaId,
              };
            }
            return { ...h, slots: updatedSlots };
          }),
        }));
      },

      leaveHackathonSlot: (projectId, roleIndex) => {
        const { currentPersonaId } = get();
        set((state) => ({
          hackathons: state.hackathons.map((h) => {
            if (h.id !== projectId) return h;
            const updatedSlots = [...h.slots];
            if (updatedSlots[roleIndex] && updatedSlots[roleIndex].assignedPersonaId === currentPersonaId) {
              updatedSlots[roleIndex] = {
                ...updatedSlots[roleIndex],
                assignedPersonaId: null,
              };
            }
            return { ...h, slots: updatedSlots };
          }),
        }));
      },

      // Fun & Culture: Polls
      votePoll: (pollId, optionId) => {
        const { currentPersonaId } = get();
        set((state) => ({
          polls: state.polls.map((poll) => {
            if (poll.id !== pollId) return poll;

            // Remove user from all options if single choice
            const updatedOptions = poll.options.map((opt) => {
              const voterIds = opt.voterIds || [];
              if (opt.id === optionId) {
                // Toggle vote or add
                if (voterIds.includes(currentPersonaId)) {
                  return { ...opt, voterIds: voterIds.filter((id) => id !== currentPersonaId) };
                } else {
                  return { ...opt, voterIds: [...voterIds, currentPersonaId] };
                }
              } else {
                if (!poll.isMultiChoice) {
                  return { ...opt, voterIds: voterIds.filter((id) => id !== currentPersonaId) };
                }
                return opt;
              }
            });

            return { ...poll, options: updatedOptions };
          }),
        }));
      },

      addPoll: (poll) => {
        const { currentPersonaId } = get();
        const newPoll: PollItem = {
          ...poll,
          id: `poll-${Date.now()}`,
          createdById: currentPersonaId,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          polls: [newPoll, ...state.polls],
        }));
      },

      // Fun & Culture: Watch & Play
      addWatchPlayItem: (item) => {
        const { currentPersonaId } = get();
        const newItem: WatchPlayItem = {
          ...item,
          id: `wp-${Date.now()}`,
          addedById: currentPersonaId,
          interestedPersonaIds: [currentPersonaId],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          watchPlayList: [newItem, ...state.watchPlayList],
        }));
      },

      toggleWatchPlayInterest: (itemId) => {
        const { currentPersonaId } = get();
        set((state) => ({
          watchPlayList: state.watchPlayList.map((item) => {
            if (item.id !== itemId) return item;
            const interested = item.interestedPersonaIds.includes(currentPersonaId);
            return {
              ...item,
              interestedPersonaIds: interested
                ? item.interestedPersonaIds.filter((id) => id !== currentPersonaId)
                : [...item.interestedPersonaIds, currentPersonaId],
            };
          }),
        }));
      },

      updateWatchPlayStatus: (itemId, status) =>
        set((state) => ({
          watchPlayList: state.watchPlayList.map((item) =>
            item.id === itemId ? { ...item, status } : item
          ),
        })),

      // Fun & Culture: Habits
      checkInHabit: (challengeId, dateStr) => {
        const { currentPersonaId } = get();
        const targetDate = dateStr || format(new Date(), 'yyyy-MM-dd');

        set((state) => ({
          habitChallenges: state.habitChallenges.map((ch) => {
            if (ch.id !== challengeId) return ch;
            const currentList = ch.checkIns[currentPersonaId] || [];
            const hasCheckedIn = currentList.includes(targetDate);

            const updatedList = hasCheckedIn
              ? currentList.filter((d) => d !== targetDate)
              : [targetDate, ...currentList];

            return {
              ...ch,
              checkIns: {
                ...ch.checkIns,
                [currentPersonaId]: updatedList,
              },
            };
          }),
        }));
      },

      pokeMember: (challengeId, targetPersonaId) => {
        const { currentPersonaId } = get();
        set((state) => ({
          habitChallenges: state.habitChallenges.map((ch) => {
            if (ch.id !== challengeId) return ch;
            return {
              ...ch,
              pokes: [
                {
                  fromPersonaId: currentPersonaId,
                  toPersonaId: targetPersonaId,
                  timestamp: new Date().toISOString(),
                },
                ...ch.pokes,
              ],
            };
          }),
        }));
      },

      // Fun & Culture: Memes
      addMeme: (meme) => {
        const { currentPersonaId } = get();
        const newMeme: MemeItem = {
          ...meme,
          id: `meme-${Date.now()}`,
          authorId: currentPersonaId,
          laughReactionIds: [currentPersonaId],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          memes: [newMeme, ...state.memes],
        }));
      },

      toggleMemeReaction: (memeId) => {
        const { currentPersonaId } = get();
        set((state) => ({
          memes: state.memes.map((m) => {
            if (m.id !== memeId) return m;
            const hasReacted = m.laughReactionIds.includes(currentPersonaId);
            return {
              ...m,
              laughReactionIds: hasReacted
                ? m.laughReactionIds.filter((id) => id !== currentPersonaId)
                : [...m.laughReactionIds, currentPersonaId],
            };
          }),
        }));
      },
    }),
    {
      name: 'squadpulse_storage_v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({
        currentPersonaId: state.currentPersonaId,
        theme: state.theme,
        statuses: state.statuses,
        hangoutPings: state.hangoutPings,
        carpools: state.carpools,
        chores: state.chores,
        borrowItems: state.borrowItems,
        expenses: state.expenses,
        kittyTransactions: state.kittyTransactions,
        codingProblem: state.codingProblem,
        doubts: state.doubts,
        exams: state.exams,
        hackathons: state.hackathons,
        polls: state.polls,
        watchPlayList: state.watchPlayList,
        habitChallenges: state.habitChallenges,
        memes: state.memes,
      }),
    }
  )
);
