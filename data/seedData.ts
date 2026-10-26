import {
  Persona,
  PersonaId,
  UserStatus,
  HangoutPing,
  CarpoolRide,
  Chore,
  BorrowItem,
  Expense,
  KittyTransaction,
  DailyCodingProblem,
  DoubtItem,
  ExamItem,
  HackathonProject,
  PollItem,
  WatchPlayItem,
  HabitChallenge,
  MemeItem,
} from '@/types';

export const SEED_PERSONAS: Record<PersonaId, Persona> = {
  me: {
    id: 'me',
    name: 'You (Flat 402)',
    room: 'Flat 402',
    role: 'Resident',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    tagline: 'Hostel Resident',
    bio: 'Flat 402 resident. Sign in with Google to sync your personal profile.',
    skills: ['Fullstack', 'Team Player', 'Problem Solving'],
    upiId: 'user@upi',
    phone: '',
    accentColor: 'indigo',
    stats: { studyStreak: 1, choresCompleted: 0, debtBalance: 0 },
  },
};

export const SEED_STATUSES: Record<PersonaId, UserStatus> = {
  me: {
    personaId: 'me',
    badge: 'Free to Chill',
    customMessage: 'At Flat 402 common room',
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600 * 1000 * 2).toISOString(),
  },
};

export const SEED_PINGS: HangoutPing[] = [];

export const SEED_CARPOOLS: CarpoolRide[] = [
  {
    id: 'ride-1',
    creatorId: 'me',
    origin: 'Hostel Gate 2',
    destination: 'City Metro Station',
    departureTime: 'Today, 5:30 PM',
    vehicleType: 'Car',
    totalSeats: 3,
    passengers: ['me'],
    estimatedFarePerPerson: 50,
    notes: 'AC car, trunk has space for bags',
    status: 'Upcoming',
    createdAt: new Date().toISOString(),
  },
];

export const SEED_CHORES: Chore[] = [
  {
    id: 'chore-groceries',
    title: 'Weekly Grocery Run',
    description: 'Milk, bread, eggs, Maggie, and fruits from reliance smart point',
    category: 'groceries',
    currentAssigneeId: 'me',
    rotationOrder: ['me'],
    frequency: 'weekly',
    dueDate: new Date().toISOString().slice(0, 10),
    history: [],
  },
  {
    id: 'chore-cleaning',
    title: 'Common Room Sweeping & Mopping',
    description: 'Clean hall carpet, dust desks, empty dustbin',
    category: 'cleaning',
    currentAssigneeId: 'me',
    rotationOrder: ['me'],
    frequency: 'bi-weekly',
    dueDate: new Date().toISOString().slice(0, 10),
    history: [],
  },
  {
    id: 'chore-water',
    title: '20L Water Can Refill',
    description: 'Exchange empty bubble top jar at reception counter',
    category: 'water',
    currentAssigneeId: 'me',
    rotationOrder: ['me'],
    frequency: 'daily',
    dueDate: new Date().toISOString().slice(0, 10),
    history: [],
  },
];

export const SEED_BORROW_ITEMS: BorrowItem[] = [
  {
    id: 'borrow-1',
    type: 'LendingOffer',
    title: 'Scientific Calculator Casio fx-991EX',
    category: 'Electronics',
    ownerId: 'me',
    borrowerOrClaimerId: null,
    status: 'Open',
    locationOrRoom: 'Room 402 Desk',
    depositRequired: 0,
    notes: 'Please return before tomorrow morning',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  },
  {
    id: 'borrow-2',
    type: 'BorrowRequest',
    title: '65W Type-C Laptop Fast Charger',
    category: 'Electronics',
    ownerId: 'me',
    borrowerOrClaimerId: null,
    status: 'Open',
    locationOrRoom: 'Library / Room 402',
    depositRequired: 0,
    notes: 'Needed for 2 hours for hackathon prep',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  },
];

export const SEED_EXPENSES: Expense[] = [];

export const SEED_KITTY_TRANSACTIONS: KittyTransaction[] = [
  {
    id: 'kitty-1',
    personaId: 'me',
    amount: 500,
    type: 'deposit',
    description: 'Emergency flat kitty reserve initial fund',
    createdAt: new Date().toISOString(),
  },
];

export const SEED_CODING_PROBLEM: DailyCodingProblem = {
  id: 'code-1',
  date: new Date().toISOString().slice(0, 10),
  title: 'Two Sum II - Input Array Is Sorted',
  difficulty: 'Medium',
  tags: ['Two Pointers', 'Array', 'Binary Search'],
  description: 'Given a 1-indexed sorted integer array numbers, find two numbers that add up to target.',
  exampleInput: 'numbers = [2,7,11,15], target = 9',
  exampleOutput: '[1,2]',
  constraints: '2 <= numbers.length <= 3 * 10^4',
  submissions: [],
};

export const SEED_DOUBTS: DoubtItem[] = [
  {
    id: 'doubt-1',
    title: 'Why does useEffect run twice in React 18 / 19 development mode?',
    body: 'When mounting my component, console.log triggers twice. Is this normal or a bug?',
    authorId: 'me',
    courseCode: 'CS305 Web Technologies',
    tags: ['React', 'Hooks', 'StrictMode'],
    urgency: 'Normal',
    upvotes: [],
    isResolved: false,
    createdAt: new Date().toISOString(),
    answers: [],
  },
];

export const SEED_EXAMS: ExamItem[] = [
  {
    id: 'exam-1',
    courseCode: 'CS301',
    courseTitle: 'Operating Systems & Concurrency',
    examDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    roomLocation: 'Lecture Hall Complex LH-102',
    topics: [
      { id: 'top-1', title: 'Process Synchronization & Semaphores', completedBy: {} },
      { id: 'top-2', title: 'Deadlock Detection & Banker Algorithm', completedBy: {} },
      { id: 'top-3', title: 'Virtual Memory & Page Replacement (LRU)', completedBy: {} },
    ],
  },
  {
    id: 'exam-2',
    courseCode: 'CS304',
    courseTitle: 'Computer Networks & Distributed Systems',
    examDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    roomLocation: 'LH-201',
    topics: [
      { id: 'top-4', title: 'OSI vs TCP/IP Architecture', completedBy: {} },
      { id: 'top-5', title: 'Routing Protocols & BGP', completedBy: {} },
    ],
  },
];

export const SEED_HACKATHONS: HackathonProject[] = [
  {
    id: 'hack-1',
    title: 'CampusPulse: Autonomous Campus Micro-Transit',
    eventName: 'Inter-College Hackathon 2026',
    eventDate: 'Nov 20-22, 2026',
    prizePool: '₹1,50,000',
    description: 'Building an electric shuttle pooling network with dynamic routing for university students.',
    tags: ['AI/ML', 'Next.js', 'FastAPI'],
    teamLeadId: 'me',
    status: 'Recruiting',
    createdAt: new Date().toISOString(),
    slots: [
      { role: 'ML Engineer', assignedPersonaId: null },
      { role: 'Frontend & UI', assignedPersonaId: null },
      { role: 'Backend & APIs', assignedPersonaId: null },
    ],
  },
];

export const SEED_POLLS: PollItem[] = [
  {
    id: 'poll-1',
    question: 'Dinner choice for Friday night hostel feast?',
    createdById: 'me',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    isMultiChoice: false,
    options: [
      { id: 'opt-1', text: 'Butter Chicken / Paneer + Naan 🥘', voterIds: [] },
      { id: 'opt-2', text: 'Wood-fired Pizza 🍕', voterIds: [] },
      { id: 'opt-3', text: 'Biryani Feast 🍗', voterIds: [] },
    ],
  },
];

export const SEED_WATCH_PLAY: WatchPlayItem[] = [
  {
    id: 'wp-1',
    title: 'Interstellar',
    type: 'Movie',
    platform: 'Prime',
    genreOrDuration: 'Sci-Fi / 2h 49m',
    addedById: 'me',
    interestedPersonaIds: [],
    status: 'Backlog',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wp-2',
    title: 'Overcooked! 2',
    type: 'Multiplayer Game',
    platform: 'Steam',
    genreOrDuration: 'Co-op Party',
    addedById: 'me',
    interestedPersonaIds: [],
    status: 'Backlog',
    createdAt: new Date().toISOString(),
  },
];

export const SEED_HABITS: HabitChallenge[] = [
  {
    id: 'habit-1',
    title: 'LeetCode Daily Streak',
    description: 'Solve at least one medium or easy algorithm problem daily before midnight.',
    icon: '🔥',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    durationDays: 30,
    checkIns: {},
    pokes: [],
  },
];

export const SEED_MEMES: MemeItem[] = [
  {
    id: 'meme-1',
    title: 'The Great WiFi Reboot Incident',
    type: 'HostelChronicle',
    contentUrlOrText: 'The entire flat froze in complete silence when the router light turned orange in the middle of a coding contest.',
    context: 'Flat 402 Living Room Legend',
    authorId: 'me',
    creditedPersonaId: 'me',
    tags: ['WiFi', 'Coding', 'Tragedy'],
    laughReactionIds: [],
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];
