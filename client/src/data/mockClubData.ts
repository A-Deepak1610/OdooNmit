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
  type?: 'FLAGSHIP_EVENT' | 'FUNDRAISER' | 'WORKSHOP' | 'SOCIAL';
  description?: string;
  category?: string;
  fundraiserTargetGoal?: number;
  assignedOrganizer?: {
    name: string;
    email: string;
    role: string;
    avatar: string;
    assignedAt: string;
    status: 'ACTIVE' | 'PENDING';
  };
  departmentStats?: { department: string; count: number; percentage: number }[];
  attendanceHourly?: { hour: string; count: number }[];
  yearStats?: { year: string; count: number; percentage?: number }[];
  memberVsStudentStats?: { members: number; students: number };
  tiers: {
    name: string;
    memberPrice: number;
    nonMemberPrice: number;
    available: number;
    total: number;
    perks?: string;
  }[];
}

export const mockEvents: MockEvent[] = [
  {
    id: 'evt-gala-2026',
    title: 'Skyline Annual Spring Gala 2026',
    date: 'April 24, 2026',
    time: '6:30 PM - 10:30 PM',
    location: 'Main Campus Grand Auditorium',
    type: 'FLAGSHIP_EVENT',
    description: 'Premier campus social gala with keynote speeches, musical banquet, annual leadership awards, and club fellowship.',
    category: 'Cultural & Honors',
    capacity: 500,
    soldCount: 420,
    checkedInCount: 385,
    revenue: 58500,
    assignedOrganizer: {
      name: 'Aarav Patel',
      email: 'aarav.patel@skyline.edu',
      role: 'Chief Event Organizer',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=AaravPatel&backgroundColor=ffdfbf',
      assignedAt: 'March 15, 2026',
      status: 'ACTIVE',
    },
    departmentStats: [
      { department: 'Computer Science & Engineering', count: 176, percentage: 42 },
      { department: 'Electronics & Communication', count: 109, percentage: 26 },
      { department: 'Mechanical Engineering', count: 59, percentage: 14 },
      { department: 'Information Science', count: 50, percentage: 12 },
      { department: 'Design, Media & Others', count: 26, percentage: 6 },
    ],
    yearStats: [
      { year: '1st Year Freshmen', count: 68, percentage: 16 },
      { year: '2nd Year Sophomores', count: 118, percentage: 28 },
      { year: '3rd Year Juniors', count: 164, percentage: 39 },
      { year: '4th Year Seniors', count: 70, percentage: 17 },
    ],
    memberVsStudentStats: {
      members: 285,
      students: 135,
    },
    attendanceHourly: [
      { hour: '5:30 PM - 6:00 PM', count: 45 },
      { hour: '6:00 PM - 6:30 PM', count: 110 },
      { hour: '6:30 PM - 7:00 PM', count: 160 },
      { hour: '7:00 PM - 7:30 PM', count: 70 },
    ],
    tiers: [
      {
        name: 'Club Member Pass',
        memberPrice: 100,
        nonMemberPrice: 250,
        available: 30,
        total: 300,
        perks: 'Special Member Price (60% Off), Front Section Seating, Deluxe Dinner Buffet & Digital QR Pass',
      },
      {
        name: 'General Student Pass',
        memberPrice: 150,
        nonMemberPrice: 300,
        available: 50,
        total: 150,
        perks: 'General Seating, Evening Buffet & Certified Attendance Pass',
      },
      {
        name: 'VIP Executive Table',
        memberPrice: 400,
        nonMemberPrice: 600,
        available: 0,
        total: 50,
        perks: 'Reserved Table Seating, Priority VIP Buffet & Exclusive Swag Pack',
      },
    ],
  },
  {
    id: 'evt-bake-sale',
    title: 'Spring Charity Bake Sale & Fundraiser',
    date: 'May 2, 2026',
    time: '10:00 AM - 4:00 PM',
    location: 'Student Union Plaza Quad',
    type: 'FUNDRAISER',
    description: 'Charity fundraiser bake sale generating proceeds for campus student hardship grants and lab supplies.',
    category: 'Fundraiser & Charity',
    capacity: 300,
    soldCount: 180,
    checkedInCount: 154,
    revenue: 28400,
    fundraiserTargetGoal: 35000,
    assignedOrganizer: {
      name: 'Sneha Sundaram',
      email: 'sneha.s@skyline.edu',
      role: 'Cultural & Charity Lead',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=SnehaSundaram&backgroundColor=b6e3f4',
      assignedAt: 'April 02, 2026',
      status: 'ACTIVE',
    },
    departmentStats: [
      { department: 'Computer Science & Engineering', count: 72, percentage: 40 },
      { department: 'Electronics & Communication', count: 45, percentage: 25 },
      { department: 'Business & Management', count: 36, percentage: 20 },
      { department: 'Design & Media', count: 27, percentage: 15 },
    ],
    yearStats: [
      { year: '1st Year Freshmen', count: 35, percentage: 19 },
      { year: '2nd Year Sophomores', count: 65, percentage: 36 },
      { year: '3rd Year Juniors', count: 55, percentage: 31 },
      { year: '4th Year Seniors', count: 25, percentage: 14 },
    ],
    memberVsStudentStats: {
      members: 120,
      students: 60,
    },
    attendanceHourly: [
      { hour: '10:00 AM - 11:30 AM', count: 48 },
      { hour: '11:30 AM - 1:00 PM', count: 62 },
      { hour: '1:00 PM - 2:30 PM', count: 30 },
      { hour: '2:30 PM - 4:00 PM', count: 14 },
    ],
    tiers: [
      {
        name: 'Treat Voucher & Charity Pack',
        memberPrice: 80,
        nonMemberPrice: 120,
        available: 120,
        total: 300,
        perks: 'Special Member Price (33% Off), 4 Artisanal Treats, Drink Voucher & Charity Contribution',
      },
    ],
  },
  {
    id: 'evt-hackathon-2026',
    title: 'Inter-College 24hr Innovation Hackathon',
    date: 'May 16, 2026',
    time: '9:00 AM - Next Day 9:00 AM',
    location: 'Campus Tech Center & Innovation Hub',
    type: 'WORKSHOP',
    description: '24-hour hybrid sprint on AI Agents, Open Source Tools, and sustainable campus software solutions with ₹50,000 in prizes.',
    category: 'Technical Hackathon',
    capacity: 250,
    soldCount: 220,
    checkedInCount: 198,
    revenue: 44000,
    fundraiserTargetGoal: 50000,
    assignedOrganizer: {
      name: 'Deepak Kumar',
      email: 'deepak.k@skyline.edu',
      role: 'Tech Committee Lead',
      avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=DeepakKumar&backgroundColor=b6e3f4',
      assignedAt: 'April 05, 2026',
      status: 'ACTIVE',
    },
    departmentStats: [
      { department: 'Computer Science & Engineering', count: 132, percentage: 60 },
      { department: 'Information Science', count: 44, percentage: 20 },
      { department: 'Electronics & Communication', count: 33, percentage: 15 },
      { department: 'Mechanical & Robotics', count: 11, percentage: 5 },
    ],
    yearStats: [
      { year: '1st Year Freshmen', count: 22, percentage: 10 },
      { year: '2nd Year Sophomores', count: 77, percentage: 35 },
      { year: '3rd Year Juniors', count: 99, percentage: 45 },
      { year: '4th Year Seniors', count: 22, percentage: 10 },
    ],
    memberVsStudentStats: {
      members: 165,
      students: 55,
    },
    attendanceHourly: [
      { hour: '8:30 AM - 9:30 AM', count: 125 },
      { hour: '9:30 AM - 10:30 AM', count: 55 },
      { hour: '10:30 AM - 11:30 AM', count: 18 },
    ],
    tiers: [
      {
        name: 'Hacker Delegate Pass',
        memberPrice: 150,
        nonMemberPrice: 300,
        available: 30,
        total: 250,
        perks: 'Special Member Price (50% Off), 24hr Meals & RedBull, Hacker Kit & Mentor Access',
      },
    ],
  },
];

export const mockDoorTickets = [
  {
    id: 'TKT-GALA-001',
    attendee: 'Aarav Sharma',
    email: 'aarav.sharma@nmit.edu.in',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    isMember: true,
    tier: 'Club Member Pass',
    checkedIn: true,
    time: '6:42 PM',
    qrToken: 'SSA-GALA-2026-TKT001-AARAV',
    seatNumber: 'Table A, Seat 03',
  },
  {
    id: 'TKT-GALA-002',
    attendee: 'Priya Sundaram',
    email: 'priya.s@nmit.edu.in',
    department: 'Electronics & Communication',
    year: '2nd Year',
    isMember: true,
    tier: 'Club Member Pass',
    checkedIn: true,
    time: '6:45 PM',
    qrToken: 'SSA-GALA-2026-TKT002-PRIYA',
    seatNumber: 'Table A, Seat 04',
  },
  {
    id: 'TKT-GALA-003',
    attendee: 'Rohan Mehra',
    email: 'rohan.m@campus.edu',
    department: 'Mechanical Engineering',
    year: '4th Year',
    isMember: false,
    tier: 'General Student Pass',
    checkedIn: false,
    time: '-',
    qrToken: 'SSA-GALA-2026-TKT003-ROHAN',
    seatNumber: 'General Tier, Seat 42',
  },
  {
    id: 'TKT-GALA-004',
    attendee: 'Deepak Kumar',
    email: 'deepaka.ad24@bitsathy.ac.in',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    isMember: true,
    tier: 'Club Member Pass',
    checkedIn: true,
    time: '6:51 PM',
    qrToken: 'SSA-GALA-2026-TKT004-DEEPAK',
    seatNumber: 'Table B, Seat 01',
  },
  {
    id: 'TKT-GALA-005',
    attendee: 'Sneha Patel',
    email: 'sneha.p@campus.edu',
    department: 'Information Science',
    year: '1st Year',
    isMember: false,
    tier: 'General Student Pass',
    checkedIn: false,
    time: '-',
    qrToken: 'SSA-GALA-2026-TKT005-SNEHA',
    seatNumber: 'General Tier, Seat 58',
  },
  {
    id: 'TKT-GALA-006',
    attendee: 'Hemanth S V',
    email: 'hemanthsv.al24@bitsathy.ac.in',
    department: 'Artificial Intelligence & DS',
    year: '2nd Year',
    isMember: true,
    tier: 'Club Member Pass',
    checkedIn: true,
    time: '6:55 PM',
    qrToken: 'SSA-GALA-2026-TKT006-HEMANTH',
    seatNumber: 'Table B, Seat 05',
  },
  {
    id: 'TKT-GALA-007',
    attendee: 'Ananya Deshmukh',
    email: 'ananya.d@campus.edu',
    department: 'Design & Media',
    year: '3rd Year',
    isMember: true,
    tier: 'VIP Executive Table',
    checkedIn: true,
    time: '7:04 PM',
    qrToken: 'SSA-GALA-2026-TKT007-ANANYA',
    seatNumber: 'VIP Table 01, Seat 02',
  },
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
    id: 'mem-000',
    name: 'THIRUMURUGAN K',
    email: 'thirumurugank.al24@bitsathy.ac.in',
    membershipId: 'SSA-2026-0001',
    tier: 'PREMIUM',
    duesPaid: true,
    duesExpiresAt: 'May 31, 2027',
    renewalAlert: false,
    discountEligible: true,
  },
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
    id: 'mem-005',
    name: 'Hemanth S V',
    email: 'hemanthsv.al24@bitsathy.ac.in',
    membershipId: 'SSA-2026-0002',
    tier: 'PREMIUM',
    duesPaid: true,
    duesExpiresAt: 'May 31, 2027',
    renewalAlert: false,
    discountEligible: true,
  },
  {
    id: 'mem-006',
    name: 'Rithish S',
    email: 'rithishs.cs24@bitsathy.ac.in',
    membershipId: 'SSA-2026-0003',
    tier: 'STANDARD',
    duesPaid: true,
    duesExpiresAt: 'May 31, 2027',
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
  category: string;
  description: string;
  basePrice: number;
  memberPrice: number;
  image: string;
  odooUrl: string;
  variants: { size: string; stock: number }[];
}

export const mockMerchandise: MockMerchItem[] = [
  {
    id: 'odoo-mug-23195',
    name: 'Odoo Official Ceramic Mug',
    category: 'Goodies & Drinkware',
    description: 'High-gloss 11oz ceramic mug with vivid Odoo emblem print. Dishwasher and microwave safe, retains quality and luster.',
    basePrice: 450,
    memberPrice: 250,
    image: 'https://odoocdn.com/web/image/product.product/20563/image_1024/Mug?unique=02e5ff9',
    odooUrl: 'https://www.odoo.com/shop/mug-23195',
    variants: [
      { size: '11 oz', stock: 45 },
      { size: '15 oz', stock: 20 },
    ],
  },
  {
    id: 'odoo-shoes-23198',
    name: 'Odoo Signature Low-Top Sneakers',
    category: 'Footwear & Lifestyle',
    description: 'Comfortable and stylish low-top sneakers in signature purple & white colorway with durable vulcanized rubber sole.',
    basePrice: 2999,
    memberPrice: 1899,
    image: 'https://odoocdn.com/web/image/product.image/11/image_1024/Odoo%20Shoes?unique=9b6c356',
    odooUrl: 'https://www.odoo.com/shop/shoes-23198',
    variants: [
      { size: '39', stock: 8 },
      { size: '40', stock: 12 },
      { size: '41', stock: 15 },
      { size: '42', stock: 10 },
      { size: '43', stock: 6 },
      { size: '44', stock: 4 },
    ],
  },
  {
    id: 'odoo-polo-23196',
    name: 'Odoo Classic Piqué Polo Shirt',
    category: 'Apparel & Uniforms',
    description: '100% combed cotton breathable piqué fabric with embroidered Odoo crest, ribbed collar, and tailored sleeve cuffs.',
    basePrice: 1199,
    memberPrice: 699,
    image: 'https://odoocdn.com/web/image/product.image/10/image_1024/Odoo%20Short%20Sleeve%20Polo?unique=d5e3797',
    odooUrl: 'https://www.odoo.com/shop/polo-shirt-23196',
    variants: [
      { size: 'S', stock: 18 },
      { size: 'M', stock: 25 },
      { size: 'L', stock: 14 },
      { size: 'XL', stock: 10 },
      { size: '2XL', stock: 5 },
    ],
  },
  {
    id: 'odoo-scaleup-115973',
    name: 'Scale-Up! The Business Game',
    category: 'Educational & Board Games',
    description: 'Learn real-world business & ERP management with 36 interactive business challenge cards across 4 real startup case studies.',
    basePrice: 1499,
    memberPrice: 899,
    image: 'https://odoocdn.com/web/image/product.product/107155/image_1024/%5BSCUD%5D%20Scale-Up%21%20Business%20Game%20%5BDE%5D?unique=bce70b4',
    odooUrl: 'https://www.odoo.com/shop/scud-scale-up-business-game-de-115973',
    variants: [
      { size: 'Board Box', stock: 22 },
      { size: 'Deluxe Pack', stock: 11 },
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
