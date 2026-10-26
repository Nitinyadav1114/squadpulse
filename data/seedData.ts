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
  aman: {
    id: 'aman',
    name: 'Aman Sharma',
    room: 'Flat 402 - Room A',
    role: 'Hostel Rep',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tagline: 'Logistics lead & campus problem solver',
    bio: 'Hostel representative, community organizer, cricket enthusiast, and midnight chai coordinator.',
    skills: ['Event Mgmt', 'Budgeting', 'PR & Pitching', 'DevOps', 'Python'],
    upiId: 'aman@okhdfcbank',
    phone: '+91 98765 43210',
    accentColor: 'emerald',
    stats: { studyStreak: 12, choresCompleted: 14, debtBalance: 420 },
  },
  rhea: {
    id: 'rhea',
    name: 'Rhea Sen',
    room: 'Flat 402 - Room B',
    role: 'Coder / Lead',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    tagline: 'Competitive programmer & night owl',
    bio: 'Competitive programmer, AI researcher, night owl, and hackathon winner. Always debugging something.',
    skills: ['Next.js', 'React', 'PyTorch', 'TypeScript', 'LeetCode 500+'],
    upiId: 'rhea@oksbi',
    phone: '+91 98765 43211',
    accentColor: 'indigo',
    stats: { studyStreak: 28, choresCompleted: 9, debtBalance: -150 },
  },
  dev: {
    id: 'dev',
    name: 'Dev Malhotra',
    room: 'Flat 402 - Room C',
    role: 'Gamer / Chill',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tagline: 'Valorant lobby host & snack connoisseur',
    bio: 'Valorant lobby host, snack hoarder, anime critic, and mechanical keyboard collector.',
    skills: ['Unity', 'C++', 'UI/UX', 'Discord Bot Dev', 'Sound Design'],
    upiId: 'dev@okaxis',
    phone: '+91 98765 43212',
    accentColor: 'rose',
    stats: { studyStreak: 7, choresCompleted: 11, debtBalance: -350 },
  },
  tanvi: {
    id: 'tanvi',
    name: 'Tanvi Verma',
    room: 'Flat 402 - Room D',
    role: 'Planner / Academic',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    tagline: 'Notion wizard & timetable architect',
    bio: 'Notion guru, 4.0 GPA holder, design perfectionist, and chore schedule optimizer.',
    skills: ['Figma', 'UI/UX Design', 'Project Mgmt', 'Algorithms', 'Research'],
    upiId: 'tanvi@paytm',
    phone: '+91 98765 43213',
    accentColor: 'amber',
    stats: { studyStreak: 30, choresCompleted: 16, debtBalance: 80 },
  },
};

export const SEED_STATUSES: Record<PersonaId, UserStatus> = {
  aman: {
    personaId: 'aman',
    badge: 'Canteen / Mess',
    customMessage: 'Grabbing samosas & cold coffee at Nescafe. Ping if you want any!',
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
  },
  rhea: {
    personaId: 'rhea',
    badge: 'Coding',
    customMessage: 'Deep in Next.js 15 App Router & Server Actions. Do not disturb unless tea.',
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
  },
  dev: {
    personaId: 'dev',
    badge: 'Free to Chill',
    customMessage: 'Finished lab early. Down for Valorant, BGMI, or campus walk.',
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
  },
  tanvi: {
    personaId: 'tanvi',
    badge: 'Library / Studying',
    customMessage: '2nd floor quiet section preparing OS semaphore notes.',
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 80 * 60 * 1000).toISOString(),
  },
};

export const SEED_PINGS: HangoutPing[] = [
  {
    id: 'ping-1',
    senderId: 'aman',
    recipientId: 'all',
    presetText: '☕ Evening Chai & Canteen snacks at Nescafe in 15 mins?',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'ping-2',
    senderId: 'dev',
    recipientId: 'all',
    presetText: '🎮 Valorant 5-stack tonight at 10:30 PM. Who is in?',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    isRead: false,
  },
];

export const SEED_CARPOOLS: CarpoolRide[] = [
  {
    id: 'ride-1',
    creatorId: 'aman',
    origin: 'Hostel Gate 2',
    destination: 'Phoenix Marketcity & Metro',
    departureTime: 'Today, 6:00 PM',
    vehicleType: 'Auto / Cab Share',
    totalSeats: 3,
    passengers: ['dev'],
    estimatedFarePerPerson: 60,
    notes: 'Going for grocery run and electronics market. 2 seats left!',
    status: 'Upcoming',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ride-2',
    creatorId: 'rhea',
    origin: 'Flat 402',
    destination: 'Main Campus Tech Park / CS Dept',
    departureTime: 'Tomorrow, 8:45 AM',
    vehicleType: 'Bike',
    totalSeats: 1,
    passengers: [],
    estimatedFarePerPerson: 25,
    notes: 'Morning ride for 9 AM lab. Helmet provided.',
    status: 'Upcoming',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
];

export const SEED_CHORES: Chore[] = [
  {
    id: 'chore-1',
    title: 'Kitchen & Counter Cleaning',
    description: 'Wipe kitchen counters, clean sink, and stack dry dishes.',
    category: 'cleaning',
    currentAssigneeId: 'dev',
    rotationOrder: ['aman', 'rhea', 'dev', 'tanvi'],
    frequency: 'daily',
    dueDate: 'Today, 9:00 PM',
    lastCompletedDate: new Date(Date.now() - 86400000).toISOString(),
    history: [
      { id: 'ch-1', completedById: 'rhea', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Cleaned thoroughly with disinfectant' },
      { id: 'ch-2', completedById: 'aman', timestamp: new Date(Date.now() - 172800000).toISOString() },
    ],
  },
  {
    id: 'chore-2',
    title: 'Living Room Trash Disposal',
    description: 'Empty main bins, tie compost bag, drop at ground floor collection.',
    category: 'trash',
    currentAssigneeId: 'rhea',
    rotationOrder: ['tanvi', 'dev', 'rhea', 'aman'],
    frequency: 'daily',
    dueDate: 'Tonight, 11:00 PM',
    lastCompletedDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    history: [
      { id: 'ch-3', completedById: 'dev', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'Replaced with fresh 30L liners' },
    ],
  },
  {
    id: 'chore-3',
    title: 'Water 20L Can Refill',
    description: 'Exchange 2 empty Bisleri 20L jars at water station near block D.',
    category: 'water',
    currentAssigneeId: 'aman',
    rotationOrder: ['aman', 'tanvi', 'rhea', 'dev'],
    frequency: 'weekly',
    dueDate: 'Tomorrow, 12:00 PM',
    history: [
      { id: 'ch-4', completedById: 'tanvi', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
    ],
  },
  {
    id: 'chore-4',
    title: 'Weekend Grocery Restock',
    description: 'Buy milk, curd, eggs, bread, fruits, and dishwashing soap from DMart.',
    category: 'groceries',
    currentAssigneeId: 'tanvi',
    rotationOrder: ['tanvi', 'aman', 'dev', 'rhea'],
    frequency: 'weekly',
    dueDate: 'Saturday, 11:00 AM',
    history: [],
  },
];

export const SEED_BORROW_ITEMS: BorrowItem[] = [
  {
    id: 'borrow-1',
    type: 'LendingOffer',
    title: 'TI-84 Plus Graphing Calculator',
    category: 'Electronics',
    ownerId: 'tanvi',
    borrowerOrClaimerId: 'dev',
    status: 'Borrowed',
    locationOrRoom: 'Room D Desk',
    depositRequired: 0,
    notes: 'Dev has it for today’s Discrete Math exam. Return by evening!',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    resolvedAt: null,
  },
  {
    id: 'borrow-2',
    type: 'LendingOffer',
    title: 'USB-C to HDMI 4K Display Adapter',
    category: 'Electronics',
    ownerId: 'rhea',
    borrowerOrClaimerId: null,
    status: 'Open',
    locationOrRoom: 'Living Room TV Console',
    depositRequired: 0,
    notes: 'Available for presentation practice or projector gaming.',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    resolvedAt: null,
  },
  {
    id: 'borrow-3',
    type: 'BorrowRequest',
    title: 'Sony WH-1000XM4 Headphones (or any ANC)',
    category: 'Electronics',
    ownerId: 'dev',
    borrowerOrClaimerId: null,
    status: 'Open',
    locationOrRoom: 'Flat 402',
    depositRequired: 0,
    notes: 'Need for 2 hours for a remote technical interview tomorrow 4 PM.',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    resolvedAt: null,
  },
  {
    id: 'borrow-4',
    type: 'LostItem',
    title: 'Blue Parker Metal Gel Pen + SanDisk 64GB Pendrive',
    category: 'Books & Notes',
    ownerId: 'aman',
    borrowerOrClaimerId: null,
    status: 'Open',
    locationOrRoom: 'Lost around Central Canteen or Flat Balcony',
    depositRequired: 0,
    notes: 'Has my seminar slides on it. Reward: 1 hot chocolate!',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    resolvedAt: null,
  },
];

export const SEED_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    description: 'DMart Flat Essentials & Snacks Restock',
    amount: 1200,
    paidById: 'aman',
    splitAmongIds: ['aman', 'rhea', 'dev', 'tanvi'],
    category: 'groceries',
    date: '2026-10-24',
    notes: 'Milk cartons, bread, eggs, cooking oil, detergent, chips.',
  },
  {
    id: 'exp-2',
    description: 'Airtel 300 Mbps Fiber WiFi Monthly Bill',
    amount: 800,
    paidById: 'rhea',
    splitAmongIds: ['rhea', 'dev'],
    category: 'utilities',
    date: '2026-10-22',
    notes: 'High speed lane shared between Rhea and Dev.',
  },
  {
    id: 'exp-3',
    description: 'Late Night Dominos 4-Cheese Pizza & Garlic Bread',
    amount: 600,
    paidById: 'tanvi',
    splitAmongIds: ['aman', 'dev', 'tanvi'],
    category: 'food',
    date: '2026-10-25',
    notes: 'Mid-study session hunger relief.',
  },
];

export const SEED_KITTY_TRANSACTIONS: KittyTransaction[] = [
  {
    id: 'kit-1',
    personaId: 'aman',
    amount: 500,
    type: 'deposit',
    description: 'Initial monthly kitty deposit',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'kit-2',
    personaId: 'rhea',
    amount: 500,
    type: 'deposit',
    description: 'Initial monthly kitty deposit',
    createdAt: '2026-10-01T10:05:00Z',
  },
  {
    id: 'kit-3',
    personaId: 'dev',
    amount: 500,
    type: 'deposit',
    description: 'Initial monthly kitty deposit',
    createdAt: '2026-10-01T11:00:00Z',
  },
  {
    id: 'kit-4',
    personaId: 'tanvi',
    amount: 500,
    type: 'deposit',
    description: 'Initial monthly kitty deposit',
    createdAt: '2026-10-01T11:15:00Z',
  },
  {
    id: 'kit-5',
    personaId: 'aman',
    amount: 350,
    type: 'withdrawal',
    description: 'Emergency plumber fee for bathroom tap',
    createdAt: '2026-10-18T14:30:00Z',
  },
];

export const SEED_CODING_PROBLEM: DailyCodingProblem = {
  id: 'prob-today',
  date: '2026-10-26',
  title: 'Longest Palindromic Substring',
  difficulty: 'Medium',
  tags: ['Strings', 'Dynamic Programming', 'Two Pointers'],
  description:
    'Given a string `s`, return the longest palindromic substring in `s`. A palindrome is a sequence of characters that reads the same backward as forward.',
  exampleInput: 's = "babad"',
  exampleOutput: '"bab" (or "aba")',
  constraints: '1 <= s.length <= 1000, s consists of only digits and English letters.',
  referenceUrl: 'https://leetcode.com/problems/longest-palindromic-substring/',
  submissions: [
    {
      id: 'sub-1',
      problemId: 'prob-today',
      personaId: 'rhea',
      language: 'TypeScript',
      codeSnippet: `function longestPalindrome(s: string): string {
  let start = 0, maxLength = 1;
  function expand(left: number, right: number) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      if (right - left + 1 > maxLength) {
        start = left;
        maxLength = right - left + 1;
      }
      left--;
      right++;
    }
  }
  for (let i = 0; i < s.length; i++) {
    expand(i, i);
    expand(i, i + 1);
  }
  return s.substring(start, start + maxLength);
}`,
      submittedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      status: 'Accepted',
      notes: 'O(N^2) time, O(1) space expand around center solution.',
    },
    {
      id: 'sub-2',
      problemId: 'prob-today',
      personaId: 'aman',
      language: 'Python',
      codeSnippet: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        res = ""
        for i in range(len(s)):
            # odd length
            l, r = i, i
            while l >= 0 and r < len(s) and s[l] == s[r]:
                if (r - l + 1) > len(res):
                    res = s[l:r+1]
                l -= 1
                r += 1
            # even length
            l, r = i, i + 1
            while l >= 0 and r < len(s) and s[l] == s[r]:
                if (r - l + 1) > len(res):
                    res = s[l:r+1]
                l -= 1
                r += 1
        return res`,
      submittedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      status: 'Accepted',
      notes: 'Clean python implementation using expand around centers.',
    },
  ],
};

export const SEED_DOUBTS: DoubtItem[] = [
  {
    id: 'doubt-1',
    title: 'How does Reader-Writer lock prevent writer starvation in OS?',
    body: 'In CS304 Operating Systems, if readers constantly acquire shared lock, writer thread starves indefinitely. What is the standard semaphore idiom to ensure fair queuing?',
    courseCode: 'CS304',
    tags: ['Operating Systems', 'Semaphores', 'Concurrency'],
    urgency: 'Exam Soon',
    authorId: 'dev',
    upvotes: ['rhea', 'tanvi'],
    isResolved: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    answers: [
      {
        id: 'ans-1',
        doubtId: 'doubt-1',
        authorId: 'rhea',
        body: 'You add a `turnstile` (or `order_mutex`) semaphore! Before acquiring `read_mutex`, readers must pass through the turnstile. If a writer is waiting, it holds the turnstile, blocking newer readers.',
        codeSnippet: `// Writer priority idiom
wait(order_mutex);
wait(write_mutex);
// writing section...
signal(write_mutex);
signal(order_mutex);`,
        language: 'C',
        upvotes: ['dev', 'tanvi'],
        isAccepted: true,
        createdAt: new Date(Date.now() - 20 * 3600000).toISOString(),
      },
    ],
  },
  {
    id: 'doubt-2',
    title: 'Difference between PAC and Raft Consensus in Distributed Systems?',
    body: 'Can someone explain why Raft elects a leader before log replication, whereas Paxos can accept concurrent proposer values?',
    courseCode: 'CS301',
    tags: ['Distributed Systems', 'Consensus', 'Raft'],
    urgency: 'Normal',
    authorId: 'aman',
    upvotes: ['rhea'],
    isResolved: false,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    answers: [],
  },
];

export const SEED_EXAMS: ExamItem[] = [
  {
    id: 'exam-1',
    courseCode: 'CS304',
    courseTitle: 'Operating Systems & Concurrency',
    examDate: '2026-11-12T09:30:00Z',
    roomLocation: 'Hall C - Desk 42-45',
    topics: [
      { id: 'top-1', title: 'Process Scheduling (CFS, Round Robin, SJF)', completedBy: { aman: true, rhea: true, dev: true, tanvi: true } },
      { id: 'top-2', title: 'Deadlock Detection & Banker Algorithm', completedBy: { aman: true, rhea: true, dev: false, tanvi: true } },
      { id: 'top-3', title: 'Virtual Memory & Page Replacement (LRU, Clock)', completedBy: { aman: false, rhea: true, dev: false, tanvi: true } },
      { id: 'top-4', title: 'File System Inodes & Disk Scheduling', completedBy: { aman: false, rhea: true, dev: false, tanvi: false } },
    ],
  },
  {
    id: 'exam-2',
    courseCode: 'CS301',
    courseTitle: 'Distributed Systems & Cloud Computing',
    examDate: '2026-11-18T14:00:00Z',
    roomLocation: 'Auditorium 2',
    topics: [
      { id: 'top-5', title: 'Lamport Timestamps & Vector Clocks', completedBy: { aman: true, rhea: true, dev: true, tanvi: true } },
      { id: 'top-6', title: 'Two-Phase Commit (2PC) & Consensus', completedBy: { aman: true, rhea: true, dev: false, tanvi: true } },
      { id: 'top-7', title: 'CAP Theorem & Dynamo DB Consistent Hashing', completedBy: { aman: false, rhea: true, dev: false, tanvi: true } },
    ],
  },
];

export const SEED_HACKATHONS: HackathonProject[] = [
  {
    id: 'hack-1',
    title: 'SmartHostel AI: Energy & Mess Optimization',
    eventName: 'HackCampus National 2026',
    eventDate: 'Nov 5 - 7, 2026',
    prizePool: '₹2,50,000',
    description: 'IoT sensors on hostel electricity grid combined with Next.js edge dashboard and LLM food waste predictor for university mess halls.',
    tags: ['Next.js 15', 'FastAPI', 'PyTorch', 'IoT'],
    teamLeadId: 'rhea',
    slots: [
      { role: 'Team Lead & ML Edge Models', assignedPersonaId: 'rhea' },
      { role: 'Fullstack UI/UX & Tailwind', assignedPersonaId: 'tanvi' },
      { role: 'DevOps & Pitch Deck', assignedPersonaId: 'aman' },
      { role: 'IoT Firmware & Hardware Mock', assignedPersonaId: null },
    ],
    status: 'Recruiting',
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    id: 'hack-2',
    title: 'DormPulse: Multiplayer LAN Game Launcher',
    eventName: 'GameDev Weekend Jam',
    eventDate: 'Nov 14 - 15, 2026',
    prizePool: '₹75,000',
    description: 'P2P WebRTC zero-setup browser games for hostel LAN tournaments during power cuts.',
    tags: ['WebSockets', 'Canvas API', 'TypeScript'],
    teamLeadId: 'dev',
    slots: [
      { role: 'Game Physics & Mechanics', assignedPersonaId: 'dev' },
      { role: 'P2P Networking', assignedPersonaId: null },
    ],
    status: 'Recruiting',
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
];

export const SEED_POLLS: PollItem[] = [
  {
    id: 'poll-1',
    question: 'Saturday Squad Movie Night: What are we streaming on projector?',
    createdById: 'dev',
    createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 34 * 3600000).toISOString(),
    isMultiChoice: false,
    options: [
      { id: 'opt-1', text: 'Interstellar (IMAX 4K)', voterIds: ['rhea', 'dev'] },
      { id: 'opt-2', text: 'Dune: Part Two', voterIds: ['tanvi'] },
      { id: 'opt-3', text: 'Spirited Away (Ghibli)', voterIds: ['aman'] },
    ],
  },
  {
    id: 'poll-2',
    question: 'Dinner Plan tonight: Mess paneer or Canteen rolls?',
    createdById: 'aman',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 4 * 3600000).toISOString(),
    isMultiChoice: false,
    options: [
      { id: 'opt-4', text: 'Hostel Mess (Free & already paid)', voterIds: ['tanvi'] },
      { id: 'opt-5', text: 'Kathi Junction Canteen Rolls', voterIds: ['aman', 'dev', 'rhea'] },
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
    addedById: 'rhea',
    interestedPersonaIds: ['rhea', 'dev', 'aman'],
    status: 'Backlog',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: 'wp-2',
    title: 'Valorant 5-Man Competitive Lobby',
    type: 'Multiplayer Game',
    platform: 'Discord',
    genreOrDuration: 'FPS / 40m matches',
    addedById: 'dev',
    interestedPersonaIds: ['dev', 'aman', 'rhea'],
    status: 'Currently Active',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'wp-3',
    title: 'Overcooked! All You Can Eat',
    type: 'Multiplayer Game',
    platform: 'Steam',
    genreOrDuration: 'Co-op Chaos / 4 Players',
    addedById: 'tanvi',
    interestedPersonaIds: ['tanvi', 'aman', 'rhea', 'dev'],
    status: 'Backlog',
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    id: 'wp-4',
    title: 'Cyberpunk: Edgerunners',
    type: 'Anime',
    platform: 'Netflix',
    genreOrDuration: '10 Episodes / 24m each',
    addedById: 'dev',
    interestedPersonaIds: ['dev', 'rhea'],
    status: 'Completed',
    createdAt: new Date(Date.now() - 100 * 3600000).toISOString(),
  },
];

// Helper to generate past 30 days ISO date array strings
function getPastDays(daysBack: number[]): string[] {
  const result: string[] = [];
  const today = new Date();
  for (const d of daysBack) {
    const target = new Date(today);
    target.setDate(today.getDate() - d);
    result.push(target.toISOString().split('T')[0]);
  }
  return result;
}

export const SEED_HABITS: HabitChallenge[] = [
  {
    id: 'habit-1',
    title: 'Daily LeetCode Problem Solved',
    description: 'Solve at least 1 problem before midnight. No broken streaks!',
    icon: '💻',
    startDate: '2026-10-01',
    durationDays: 30,
    checkIns: {
      aman: getPastDays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
      rhea: getPastDays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]),
      dev: getPastDays([0, 1, 2, 3, 4, 5, 6]),
      tanvi: getPastDays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]),
    },
    pokes: [
      { fromPersonaId: 'tanvi', toPersonaId: 'dev', timestamp: new Date(Date.now() - 3600000).toISOString() },
    ],
  },
  {
    id: 'habit-2',
    title: 'Morning 5km Run or Gym Session',
    description: 'Hit the campus sports track or gym before 8 AM.',
    icon: '🏃',
    startDate: '2026-10-01',
    durationDays: 30,
    checkIns: {
      aman: getPastDays([0, 1, 2, 3, 5, 6, 7, 9, 10, 12]),
      rhea: getPastDays([1, 2, 4, 5, 8, 12]),
      dev: getPastDays([0, 2, 6]),
      tanvi: getPastDays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]),
    },
    pokes: [],
  },
];

export const SEED_MEMES: MemeItem[] = [
  {
    id: 'meme-1',
    title: 'When Dev says "One quick spike rush before studying"',
    type: 'HostelChronicle',
    contentUrlOrText: 'It was 8:00 PM when he opened Valorant. It is now 3:45 AM. Dev is still defending B site on Ascent while Operating Systems exam is at 9:30 AM.',
    context: 'Flat 402 Living Room Legend, October 2026',
    authorId: 'rhea',
    creditedPersonaId: 'dev',
    tags: ['Valorant', 'OS Exam', 'Procrastination'],
    laughReactionIds: ['aman', 'rhea', 'tanvi', 'dev'],
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: 'meme-2',
    title: 'Aman’s Budgeting Spreadsheet vs Reality',
    type: 'LegendaryQuote',
    contentUrlOrText: '"Guys we will strictly spend ₹2000 each this month on snacks and groceries. I made a Notion sheet." — Aman Sharma, 3 days before ordering ₹800 Swiggy midnight waffles.',
    context: 'Post-hackathon celebration evening',
    authorId: 'tanvi',
    creditedPersonaId: 'aman',
    tags: ['Budget', 'Swiggy', 'HostelRep'],
    laughReactionIds: ['dev', 'rhea', 'tanvi'],
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
  {
    id: 'meme-3',
    title: 'The Great WiFi Reboot of 2 AM',
    type: 'HostelChronicle',
    contentUrlOrText: 'The entire flat froze in complete silence when the router light turned orange during Rhea’s Codeforces contest and Dev’s ranked clutch.',
    context: 'Router plugged out by vacuum cleaner incident',
    authorId: 'dev',
    creditedPersonaId: 'rhea',
    tags: ['WiFi', 'Codeforces', 'Tragedy'],
    laughReactionIds: ['aman', 'dev', 'tanvi'],
    createdAt: new Date(Date.now() - 96 * 3600000).toISOString(),
  },
];
