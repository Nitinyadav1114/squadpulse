// ============================================================================
// SQUADPULSE / ROOMIES CENTRAL DATA TYPES & DOMAIN CONTRACTS
// ============================================================================

export type PersonaId = 'aman' | 'rhea' | 'dev' | 'tanvi';

export interface PersonaStats {
  studyStreak: number;
  choresCompleted: number;
  debtBalance: number; // positive = owed money, negative = owes money
}

export interface Persona {
  id: PersonaId;
  name: string;
  room: string;
  role: string;
  avatar: string;
  tagline: string;
  bio: string;
  skills: string[];
  upiId: string;
  phone: string;
  accentColor: 'emerald' | 'indigo' | 'rose' | 'amber';
  stats: PersonaStats;
}

// ----------------------------------------------------------------------------
// System & Shell State
// ----------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider: 'google' | 'demo' | 'guest';
}

export type ActiveSection = 'hub' | 'daily' | 'study' | 'fun';
export type ThemeMode = 'dark' | 'light';

export interface SystemState {
  currentPersonaId: PersonaId;
  theme: ThemeMode;
  activeSection: ActiveSection;
  isSidebarCollapsed: boolean;
  isPingDrawerOpen: boolean;
  authUser?: AuthUser | null;
}

// ----------------------------------------------------------------------------
// Daily Life: Status Radar & Quick Hangout Pings
// ----------------------------------------------------------------------------

export type StatusBadge =
  | 'In Class'
  | 'Free to Chill'
  | 'Canteen / Mess'
  | 'Library / Studying'
  | 'Gym / Sports'
  | 'Sleeping'
  | 'Coding'
  | 'Away / Offline';

export interface UserStatus {
  personaId: PersonaId;
  badge: StatusBadge;
  customMessage: string;
  updatedAt: string; // ISO string
  expiresAt: string; // ISO string
}

export interface HangoutPing {
  id: string;
  senderId: PersonaId;
  recipientId: PersonaId | 'all';
  presetText: string;
  createdAt: string; // ISO string
  expiresAt: string; // ISO string
  isRead: boolean;
}

// ----------------------------------------------------------------------------
// Daily Life: Ride & Carpool Board
// ----------------------------------------------------------------------------

export type VehicleType = 'Bike' | 'Auto / Cab Share' | 'Car' | 'Metro / Walk';
export type CarpoolStatus = 'Upcoming' | 'Departed' | 'Cancelled' | 'Completed';

export interface CarpoolRide {
  id: string;
  creatorId: PersonaId;
  origin: string;
  destination: string;
  departureTime: string; // ISO or human string e.g. "Today, 5:30 PM"
  vehicleType: VehicleType;
  totalSeats: number;
  passengers: PersonaId[];
  estimatedFarePerPerson: number;
  notes: string;
  status: CarpoolStatus;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// Daily Life: Shared Chores Rotation Wheel
// ----------------------------------------------------------------------------

export type ChoreCategory = 'cleaning' | 'groceries' | 'trash' | 'water' | 'maintenance';
export type ChoreFrequency = 'daily' | 'weekly' | 'bi-weekly' | 'on-demand';

export interface ChoreCompletionRecord {
  id: string;
  completedById: PersonaId;
  timestamp: string;
  note?: string;
}

export interface Chore {
  id: string;
  title: string;
  description: string;
  category: ChoreCategory;
  currentAssigneeId: PersonaId;
  rotationOrder: PersonaId[]; // [aman -> rhea -> dev -> tanvi]
  frequency: ChoreFrequency;
  dueDate: string;
  lastCompletedDate?: string;
  history: ChoreCompletionRecord[];
}

// ----------------------------------------------------------------------------
// Daily Life: Borrow & Lost/Found Board
// ----------------------------------------------------------------------------

export type BorrowType = 'BorrowRequest' | 'LendingOffer' | 'LostItem' | 'FoundItem';
export type BorrowStatus = 'Open' | 'Borrowed' | 'Returned' | 'Resolved';

export interface BorrowItem {
  id: string;
  type: BorrowType;
  title: string;
  category: 'Electronics' | 'Books & Notes' | 'Clothing & Accessories' | 'Daily Essentials' | 'Other';
  ownerId: PersonaId;
  borrowerOrClaimerId: PersonaId | null;
  status: BorrowStatus;
  locationOrRoom: string;
  depositRequired: number;
  notes: string;
  createdAt: string;
  resolvedAt: string | null;
}

// ----------------------------------------------------------------------------
// Daily Life: Group Wallet, Pairwise Debt & Kitty
// ----------------------------------------------------------------------------

export type ExpenseCategory = 'food' | 'groceries' | 'utilities' | 'entertainment' | 'other';
export type SplitType = 'equal' | 'exact' | 'shares';

export interface ExpenseSplit {
  personaId: PersonaId;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidById: PersonaId;
  splitAmongIds: PersonaId[];
  category: ExpenseCategory;
  splitType?: SplitType;
  splits?: ExpenseSplit[];
  date: string;
  notes?: string;
}

export interface PairwiseDebt {
  debtorId: PersonaId;
  creditorId: PersonaId;
  amount: number;
}

export interface KittyTransaction {
  id: string;
  personaId: PersonaId;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// Study & Growth: Coding Challenge & Leaderboard
// ----------------------------------------------------------------------------

export type CodingDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface CodingSubmission {
  id: string;
  problemId: string;
  personaId: PersonaId;
  codeSnippet: string;
  language: 'TypeScript' | 'Python' | 'Java' | 'C++';
  submittedAt: string;
  status: 'Accepted' | 'Attempted';
  notes?: string;
}

export interface DailyCodingProblem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  difficulty: CodingDifficulty;
  tags: string[];
  description: string;
  exampleInput: string;
  exampleOutput: string;
  constraints: string;
  referenceUrl?: string;
  submissions: CodingSubmission[];
}

// ----------------------------------------------------------------------------
// Study & Growth: Doubt Board with Code Snippets
// ----------------------------------------------------------------------------

export interface DoubtAnswer {
  id: string;
  doubtId: string;
  authorId: PersonaId;
  body: string;
  codeSnippet?: string;
  language?: string;
  upvotes: PersonaId[];
  isAccepted: boolean;
  createdAt: string;
}

export interface DoubtItem {
  id: string;
  title: string;
  body: string;
  codeSnippet?: string;
  language?: string;
  authorId: PersonaId;
  courseCode: string;
  tags: string[];
  urgency: 'Normal' | 'Exam Soon' | 'Urgent';
  upvotes: PersonaId[];
  answers: DoubtAnswer[];
  isResolved: boolean;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// Study & Growth: Exam Countdown & Syllabus Checklist
// ----------------------------------------------------------------------------

export interface ExamTopic {
  id: string;
  title: string;
  completedBy: Record<PersonaId, boolean>;
}

export interface ExamItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  examDate: string; // ISO string e.g. 2026-11-15T09:30:00Z
  roomLocation: string;
  topics: ExamTopic[];
}

// ----------------------------------------------------------------------------
// Study & Growth: Partner & Hackathon Finder
// ----------------------------------------------------------------------------

export interface HackathonSlot {
  role: string;
  assignedPersonaId: PersonaId | null;
}

export interface HackathonProject {
  id: string;
  title: string;
  eventName: string;
  eventDate: string;
  prizePool: string;
  description: string;
  tags: string[];
  teamLeadId: PersonaId;
  slots: HackathonSlot[];
  status: 'Recruiting' | 'Roster Full' | 'Submitted';
  createdAt: string;
}

// ----------------------------------------------------------------------------
// Fun & Culture: Group Polls & 'This or That'
// ----------------------------------------------------------------------------

export interface PollOption {
  id: string;
  text: string;
  voterIds: PersonaId[];
}

export interface PollItem {
  id: string;
  question: string;
  createdById: PersonaId;
  createdAt: string;
  expiresAt: string;
  isMultiChoice: boolean;
  options: PollOption[];
}

// ----------------------------------------------------------------------------
// Fun & Culture: Watch & Play Together Backlog & Spin Wheel
// ----------------------------------------------------------------------------

export type MediaType = 'Movie' | 'TV Series' | 'Anime' | 'Multiplayer Game' | 'Board Game';
export type MediaPlatform = 'Netflix' | 'Prime' | 'Steam' | 'PS5' | 'Discord' | 'YouTube' | 'Board Game';
export type MediaStatus = 'Backlog' | 'Currently Active' | 'Completed';

export interface WatchPlayItem {
  id: string;
  title: string;
  type: MediaType;
  platform: MediaPlatform;
  genreOrDuration: string;
  addedById: PersonaId;
  interestedPersonaIds: PersonaId[];
  status: MediaStatus;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// Fun & Culture: 30-Day Habit Tracker & Heatmap
// ----------------------------------------------------------------------------

export interface HabitPoke {
  fromPersonaId: PersonaId;
  toPersonaId: PersonaId;
  timestamp: string;
}

export interface HabitChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  startDate: string; // YYYY-MM-DD
  durationDays: number; // 30
  checkIns: Record<PersonaId, string[]>; // Map personaId to array of 'YYYY-MM-DD'
  pokes: HabitPoke[];
}

export interface HeatmapCell {
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1 to 30
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  level: 0 | 1 | 2 | 3;
}

// ----------------------------------------------------------------------------
// Fun & Culture: Meme & Inside-Joke Vault
// ----------------------------------------------------------------------------

export type MemeType = 'MemeImage' | 'LegendaryQuote' | 'HostelChronicle';

export interface MemeItem {
  id: string;
  title: string;
  type: MemeType;
  contentUrlOrText: string;
  context: string;
  authorId: PersonaId;
  creditedPersonaId: PersonaId;
  tags: string[];
  laughReactionIds: PersonaId[];
  createdAt: string;
}
