/**
 * Mock & Prototype Data for Student Organization System: Skyline Student Association
 * Provides comprehensive data structures for the 4 developers working on:
 * Dev 1: Events & Ticketing
 * Dev 2: Memberships & Dues
 * Dev 3: Merchandise Store & Fundraiser Tasks
 * Dev 4: Treasury Ledger, Expenses & Announcements
 */

export interface MockClub {
  id: string;
  name: string;
  slug: string;
  duesAmount: number;
  duesInterval: string;
  memberCount: number;
  activeBudget: number;
}

export const activeClub: MockClub = {
  id: 'club-skyline-sa-001',
  name: 'Skyline Student Association',
  slug: 'skyline-sa',
  duesAmount: 250,
  duesInterval: 'Annual (Per Academic Year)',
  memberCount: 248,
  activeBudget: 101300,
};

// =============================================================================
// DEV 1: EVENTS & TICKETING (Spring Gala, Tiers, Door Check-in)
// =============================================================================
export interface MockEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  soldCount: number;
  checkedInCount: number;
  revenue: number;
  tiers: {
    name: string;
    memberPrice: number;
    nonMemberPrice: number;
    available: number;
    total: number;
  }[];
}

export const mockEvents: MockEvent[] = [
  {
    id: 'evt-gala-2026',
    title: 'Skyline Annual Spring Gala 2026',
    date: 'April 24, 2026',
    time: '6:30 PM - 10:30 PM',
    location: 'Main Campus Grand Auditorium',
    capacity: 500,
    soldCount: 420,
    checkedInCount: 385,
    revenue: 58500,
    tiers: [
      { name: 'Club Member Pass', memberPrice: 100, nonMemberPrice: 250, available: 30, total: 300 },
      { name: 'General Admission', memberPrice: 150, nonMemberPrice: 300, available: 50, total: 150 },
      { name: 'VIP Table (Per Seat)', memberPrice: 400, nonMemberPrice: 600, available: 0, total: 50 },
    ],
  },
  {
    id: 'evt-bake-sale',
    title: 'Spring Charity Bake Sale & Fundraiser',
    date: 'May 2, 2026',
    time: '10:00 AM - 4:00 PM',
    location: 'Student Union Plaza Quad',
    capacity: 300,
    soldCount: 180,
    checkedInCount: 154,
    revenue: 14200,
    tiers: [
      { name: 'Treat Voucher Pack', memberPrice: 80, nonMemberPrice: 100, available: 120, total: 300 },
    ],
  },
];

export const mockDoorTickets = [
  { id: 'TKT-GALA-001', attendee: 'Aarav Sharma', isMember: true, tier: 'Member Pass', checkedIn: true, time: '6:42 PM' },
  { id: 'TKT-GALA-002', attendee: 'Priya Sundaram', isMember: true, tier: 'Member Pass', checkedIn: true, time: '6:45 PM' },
  { id: 'TKT-GALA-003', attendee: 'Rohan Mehra', isMember: false, tier: 'General Non-Member', checkedIn: false, time: '-' },
  { id: 'TKT-GALA-004', attendee: 'Deepak Kumar', isMember: true, tier: 'Member Pass', checkedIn: true, time: '6:51 PM' },
  { id: 'TKT-GALA-005', attendee: 'Sneha Patel', isMember: false, tier: 'General Non-Member', checkedIn: false, time: '-' },
];

// =============================================================================
// DEV 2: MEMBERSHIPS & DUES (Sign-up, Verification, Renewals)
// =============================================================================
export interface MockMember {
  id: string;
  name: string;
  email: string;
  membershipId: string;
  tier: 'STANDARD' | 'PREMIUM';
  duesPaid: boolean;
  duesExpiresAt: string;
  renewalAlert: boolean;
  discountEligible: boolean;
}

export const mockMembers: MockMember[] = [
  {
    id: 'mem-001',
    name: 'Deepak Kumar',
    email: 'deepaka.ad24@bitsathy.ac.in',
    membershipId: 'SSA-2026-0042',
    tier: 'STANDARD',
    duesPaid: true,
    duesExpiresAt: 'May 31, 2026',
    renewalAlert: false,
    discountEligible: true,
  },
  {
    id: 'mem-002',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@campus.edu',
    membershipId: 'SSA-2026-0043',
    tier: 'PREMIUM',
    duesPaid: true,
    duesExpiresAt: 'April 30, 2026',
    renewalAlert: true, // Expiring soon!
    discountEligible: true,
  },
  {
    id: 'mem-003',
    name: 'Karthik Raja',
    email: 'karthik.r@campus.edu',
    membershipId: 'SSA-2026-0089',
    tier: 'STANDARD',
    duesPaid: false, // Dues not yet paid
    duesExpiresAt: 'Overdue',
    renewalAlert: true,
    discountEligible: false,
  },
  {
    id: 'mem-004',
    name: 'Meera Nambiar',
    email: 'meera.n@campus.edu',
    membershipId: 'SSA-2026-0112',
    tier: 'STANDARD',
    duesPaid: true,
    duesExpiresAt: 'June 30, 2026',
    renewalAlert: false,
    discountEligible: true,
  },
];

// =============================================================================
// DEV 3: MERCHANDISE STORE & FUNDRAISER TASKS
// =============================================================================
export interface MockMerchItem {
  id: string;
  name: string;
  basePrice: number;
  memberPrice: number;
  image: string;
  variants: { size: string; stock: number }[];
}

export const mockMerchandise: MockMerchItem[] = [
  {
    id: 'merch-hoodie',
    name: 'Skyline Club Embroidered Hoodie',
    basePrice: 850,
    memberPrice: 700,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80',
    variants: [
      { size: 'S', stock: 14 },
      { size: 'M', stock: 8 },
      { size: 'L', stock: 3 }, // Low stock!
      { size: 'XL', stock: 12 },
    ],
  },
  {
    id: 'merch-tee',
    name: 'Skyline Signature Cotton T-Shirt',
    basePrice: 450,
    memberPrice: 350,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
    variants: [
      { size: 'S', stock: 22 },
      { size: 'M', stock: 19 },
      { size: 'L', stock: 15 },
      { size: 'XL', stock: 9 },
    ],
  },
];

export interface MockTask {
  id: string;
  title: string;
  category: 'Baking' | 'Supplies' | 'Table Shift' | 'Promotion';
  assignee: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string;
}

export const mockFundraiserTasks: MockTask[] = [
  { id: 'tsk-01', title: 'Bake 60 chocolate chip cookies', category: 'Baking', assignee: 'Priya S.', status: 'IN_PROGRESS', dueDate: 'May 1, 6:00 PM' },
  { id: 'tsk-02', title: 'Buy paper plates, napkins & packaging bags', category: 'Supplies', assignee: 'Alex Rivera', status: 'DONE', dueDate: 'April 30' },
  { id: 'tsk-03', title: 'Staff Table Shift: 10:00 AM - 12:00 PM', category: 'Table Shift', assignee: 'Deepak Kumar', status: 'TODO', dueDate: 'May 2' },
  { id: 'tsk-04', title: 'Staff Table Shift: 12:00 PM - 2:00 PM', category: 'Table Shift', assignee: 'Sneha Patel', status: 'TODO', dueDate: 'May 2' },
  { id: 'tsk-05', title: 'Print QR payment posters & price list', category: 'Promotion', assignee: 'Rohan Mehra', status: 'DONE', dueDate: 'April 29' },
];

// =============================================================================
// DEV 4: TREASURER BOOKS, EXPENSES & ANNOUNCEMENTS
// =============================================================================
export interface MockExpense {
  id: string;
  title: string;
  submittedBy: string;
  amount: number;
  category: string;
  receiptNote: string;
  status: 'PENDING' | 'APPROVED' | 'REIMBURSED';
  date: string;
}

export const mockExpenses: MockExpense[] = [
  { id: 'exp-01', title: 'Bake sale butter, chocolate & flour ingredients', submittedBy: 'Priya S.', amount: 1450, category: 'Supplies', receiptNote: 'Supermarket Bill #9482', status: 'APPROVED', date: 'April 28' },
  { id: 'exp-02', title: 'Spring Gala stage balloons & velvet backdrop', submittedBy: 'Alex R.', amount: 3200, category: 'Decoration', receiptNote: 'Party Store Receipt #201', status: 'REIMBURSED', date: 'April 22' },
  { id: 'exp-03', title: 'Sound cable adapters & microphone batteries', submittedBy: 'Deepak A.', amount: 850, category: 'Equipment', receiptNote: 'Electronics Depot Bill', status: 'PENDING', date: 'May 1' },
];

export const mockTreasurerLedger = {
  semester: 'Spring 2026',
  openingBalance: 45000,
  income: {
    membershipDues: 48500, // 194 members paid
    galaTickets: 58500,
    bakeSale: 14200,
    merchandise: 34100,
    totalIncome: 155300,
  },
  expenses: {
    venueBooking: 32000,
    galaCatering: 38000,
    volunteerReimbursements: 14200,
    merchandisePrinting: 14800,
    totalExpenses: 99000,
  },
  netClosingBalance: 101300,
};

export const mockAnnouncements = [
  {
    id: 'ann-01',
    title: 'Spring Gala Ticket Presale Open for Members!',
    category: 'EVENT',
    author: 'President Office',
    date: 'April 10, 2026',
    priority: 'HIGH',
    content: 'Exclusive 60% discount for registered club members. Login to claim your QR ticket before general admission opens.',
  },
  {
    id: 'ann-02',
    title: 'General Body Meeting & Fundraiser Briefing',
    category: 'MEETING',
    author: 'Skyline Secretariat',
    date: 'April 25, 2026',
    priority: 'NORMAL',
    content: 'Mandatory meeting for all active volunteers in Auditorium B. We will review table assignments and baking rosters.',
  },
  {
    id: 'ann-03',
    title: 'Annual Membership Dues Renewal Reminder',
    category: 'DEADLINE',
    author: 'Treasurer Office',
    date: 'April 28, 2026',
    priority: 'URGENT',
    content: 'Memberships expiring in May must be renewed to retain voting rights and merchandise discounts for the upcoming term.',
  },
];
