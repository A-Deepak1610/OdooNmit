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
// DEV 1: EVENTS & TICKETING (President Delegation, Organizer Ops, Member Discount)
// =============================================================================
export interface MockTicketTier {
  id: string;
  name: string;
  memberPrice: number;
  nonMemberPrice: number;
  available: number;
  total: number;
  description?: string;
}

export interface MockVolunteerAssignment {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  role: string;
  shift: string;
  responsibilities: string;
  guideInstructions: string[];
  status: 'ASSIGNED' | 'CONFIRMED' | 'ON_DUTY';
  contactPhone: string;
}

export interface MockEventAttendee {
  id: string;
  ticketId: string;
  name: string;
  email: string;
  isMember: boolean;
  membershipId?: string;
  tier: string;
  pricePaid: number;
  registeredAt: string;
  checkedIn: boolean;
  checkInTime?: string;
}

export interface MockEventAnnouncement {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  author: string;
  pinned?: boolean;
}

export interface MockEvent {
  id: string;
  title: string;
  category: 'Hackathon' | 'Bootcamp' | 'Technical Symposium' | 'Competition' | 'Workshop';
  bannerImage: string;
  dateDisplay: string;
  date: string;
  time: string;
  location: string;
  venueHall: string;
  tags: string[];
  capacity: number;
  soldCount: number;
  checkedInCount: number;
  revenue: number;
  status: 'PROPOSED_BY_PRESIDENT' | 'ORGANIZER_CONFIGURING' | 'PUBLISHED' | 'LIVE';
  presidentNotes?: string;
  assignedOrganizer: {
    id: string;
    name: string;
    email: string;
    assignedAt: string;
  } | null;
  tiers: MockTicketTier[];
  volunteers: MockVolunteerAssignment[];
  attendees: MockEventAttendee[];
  announcements: MockEventAnnouncement[];
}

export const mockEvents: MockEvent[] = [
  {
    id: 'evt-ai-hackathon',
    title: 'National AI Innovation Hackathon',
    category: 'Hackathon',
    bannerImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80',
    dateDisplay: 'MAR 12-14, 2026',
    date: 'March 12-14, 2026',
    time: '09:00 AM - 08:00 PM (36-Hour Hack)',
    location: 'IIT Delhi',
    venueHall: 'Bharti School of Telecommunications Auditorium & Innovation Labs',
    tags: ['Artificial Intelligence', 'Machine Learning', 'Python', 'National'],
    capacity: 150,
    soldCount: 108,
    checkedInCount: 94,
    revenue: 16200,
    status: 'PUBLISHED',
    presidentNotes: 'Flagship spring hackathon. Please enforce a 60% discount for all active Skyline club members.',
    assignedOrganizer: {
      id: 'mem-002',
      name: 'Ananya Deshmukh',
      email: 'ananya.d@campus.edu',
      assignedAt: 'Feb 15, 2026',
    },
    tiers: [
      { id: 'tier-1', name: 'Club Member Hacker Pass', memberPrice: 100, nonMemberPrice: 250, available: 18, total: 75, description: 'Exclusive 60% off for verified active club members with meal vouchers' },
      { id: 'tier-2', name: 'General Participant Pass', memberPrice: 150, nonMemberPrice: 300, available: 24, total: 75, description: 'Full access pass including GPU credits, swag pack, and mentor rounds' },
    ],
    volunteers: [
      {
        id: 'vol-001',
        memberId: 'mem-001',
        memberName: 'Deepak Kumar',
        memberEmail: 'deepaka.ad24@bitsathy.ac.in',
        role: 'Registration Desk & Attendee Check-in',
        shift: '08:00 AM - 01:30 PM (Day 1)',
        responsibilities: 'Manage entry queue, scan digital pass QR codes, check member validity, and hand over NFC lanyard tags.',
        guideInstructions: [
          'Verify attendee digital QR pass on mobile screen using the scanner tool.',
          'If ticket has "Member Benefit Applied", verify student name matches Skyline club roster.',
          'Provide the official hackathon lanyard, meal stamp card, and welcome kit.',
          'Instruct participants to proceed to Hall A - Team Allocation Quad.',
        ],
        status: 'ON_DUTY',
        contactPhone: '+91 98452 11029',
      },
      {
        id: 'vol-002',
        memberId: 'mem-003',
        memberName: 'Karthik Raja',
        memberEmail: 'karthik.r@campus.edu',
        role: 'Hardware & Cloud Lab Desk',
        shift: '01:00 PM - 07:00 PM (Day 1)',
        responsibilities: 'Distribute GPU cluster credentials and IoT development boards to participating teams.',
        guideInstructions: [
          'Collect team lead signature and student ID deposit.',
          'Issue GPU API cluster voucher envelope.',
          'Log serial numbers for any borrowed Raspberry Pi/Jetson hardware kits.',
        ],
        status: 'CONFIRMED',
        contactPhone: '+91 97410 44321',
      },
    ],
    attendees: [
      { id: 'att-001', ticketId: 'TKT-AI-001', name: 'Aarav Sharma', email: 'aarav.s@campus.edu', isMember: true, membershipId: 'SSA-2026-0042', tier: 'Club Member Hacker Pass', pricePaid: 100, registeredAt: 'Mar 01, 2026', checkedIn: true, checkInTime: '08:45 AM' },
      { id: 'att-002', ticketId: 'TKT-AI-002', name: 'Priya Sundaram', email: 'priya.s@campus.edu', isMember: true, membershipId: 'SSA-2026-0056', tier: 'Club Member Hacker Pass', pricePaid: 100, registeredAt: 'Mar 02, 2026', checkedIn: true, checkInTime: '08:52 AM' },
      { id: 'att-003', ticketId: 'TKT-AI-003', name: 'Rohan Mehra', email: 'rohan.m@campus.edu', isMember: false, tier: 'General Participant Pass', pricePaid: 300, registeredAt: 'Mar 04, 2026', checkedIn: false },
      { id: 'att-004', ticketId: 'TKT-AI-004', name: 'Sneha Patel', email: 'sneha.p@campus.edu', isMember: false, tier: 'General Participant Pass', pricePaid: 300, registeredAt: 'Mar 05, 2026', checkedIn: false },
      { id: 'att-005', ticketId: 'TKT-AI-005', name: 'Deepak Kumar', email: 'deepaka.ad24@bitsathy.ac.in', isMember: true, membershipId: 'SSA-2026-0042', tier: 'Club Member Hacker Pass', pricePaid: 100, registeredAt: 'Mar 02, 2026', checkedIn: true, checkInTime: '09:05 AM' },
    ],
    announcements: [
      { id: 'ann-01', title: 'Problem Statements Released!', content: 'All 4 tracks (Healthcare AI, FinTech LLMs, Autonomous Logistics, EdTech) are now live on the hack portal.', timestamp: 'Mar 10, 2026 at 10:00 AM', author: 'Ananya Deshmukh (Organizer)', pinned: true },
      { id: 'ann-02', title: 'Day 1 Dinner & Networking Mixer', content: 'Dinner will be served at the cafeteria lawn starting 8:30 PM. High tea at 4:30 PM.', timestamp: 'Mar 12, 2026 at 02:00 PM', author: 'Ananya Deshmukh (Organizer)' },
    ],
  },
  {
    id: 'evt-fs-bootcamp',
    title: 'Full Stack Web Development Bootcamp',
    category: 'Bootcamp',
    bannerImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    dateDisplay: 'APR 5-10, 2026',
    date: 'April 5-10, 2026',
    time: '10:00 AM - 04:00 PM Daily',
    location: 'BITS Pilani',
    venueHall: 'Tech Hub Computing Cluster B & Seminar Hall 2',
    tags: ['React', 'Node.js', 'Web Development', 'Beginner Friendly'],
    capacity: 200,
    soldCount: 80,
    checkedInCount: 0,
    revenue: 17600,
    status: 'PUBLISHED',
    presidentNotes: 'Collaborate with the WebDev society. Ensure all members receive project repo templates.',
    assignedOrganizer: {
      id: 'mem-001',
      name: 'Deepak Kumar',
      email: 'deepaka.ad24@bitsathy.ac.in',
      assignedAt: 'Feb 20, 2026',
    },
    tiers: [
      { id: 'tier-boot-1', name: 'Member Fast-Track Seat', memberPrice: 150, nonMemberPrice: 350, available: 60, total: 100, description: 'Includes 1-on-1 code reviews and official completion certificate' },
      { id: 'tier-boot-2', name: 'General Student Admission', memberPrice: 200, nonMemberPrice: 400, available: 60, total: 100, description: 'Comprehensive 5-day bootcamp access with cloud dev sandbox' },
    ],
    volunteers: [
      {
        id: 'vol-003',
        memberId: 'mem-004',
        memberName: 'Meera Nambiar',
        memberEmail: 'meera.n@campus.edu',
        role: 'Registration Desk & Attendee Check-in',
        shift: '09:00 AM - 01:00 PM',
        responsibilities: 'Check in attendees, ensure GitHub accounts are ready, distribute course material binders.',
        guideInstructions: [
          'Verify student registration email and QR pass.',
          'Verify active membership badge to validate ₹200 discount eligibility.',
          'Invite students to join the Discord cohort channel.',
        ],
        status: 'CONFIRMED',
        contactPhone: '+91 94432 99821',
      },
    ],
    attendees: [
      { id: 'att-006', ticketId: 'TKT-FS-001', name: 'Vikram Seth', email: 'vikram.s@campus.edu', isMember: true, membershipId: 'SSA-2026-0091', tier: 'Member Fast-Track Seat', pricePaid: 150, registeredAt: 'Mar 15, 2026', checkedIn: false },
      { id: 'att-007', ticketId: 'TKT-FS-002', name: 'Tara Iyer', email: 'tara.i@campus.edu', isMember: false, tier: 'General Student Admission', pricePaid: 400, registeredAt: 'Mar 16, 2026', checkedIn: false },
    ],
    announcements: [
      { id: 'ann-03', title: 'Bootcamp Software Prerequisites', content: 'Please install Node.js v20+, Git, and VS Code prior to Day 1.', timestamp: 'Mar 25, 2026 at 11:30 AM', author: 'Deepak Kumar (Organizer)', pinned: true },
    ],
  },
  {
    id: 'evt-iot-summit',
    title: 'IoT Innovation Summit',
    category: 'Technical Symposium',
    bannerImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    dateDisplay: 'MAR 28, 2026',
    date: 'March 28, 2026',
    time: '09:30 AM - 05:00 PM',
    location: 'Anna University',
    venueHall: 'Tagore Auditorium & Embedded Systems Lab',
    tags: ['IoT', 'Smart Cities', 'Industry 4.0', 'State Level'],
    capacity: 100,
    soldCount: 95,
    checkedInCount: 88,
    revenue: 11400,
    status: 'PUBLISHED',
    presidentNotes: 'Distinguished guest keynote from state electronics director. Strict safety in lab.',
    assignedOrganizer: {
      id: 'mem-004',
      name: 'Meera Nambiar',
      email: 'meera.n@campus.edu',
      assignedAt: 'Feb 25, 2026',
    },
    tiers: [
      { id: 'tier-iot-1', name: 'Member Symposium Pass', memberPrice: 80, nonMemberPrice: 200, available: 2, total: 50, description: 'Exclusive entry for club members including keynote luncheon' },
      { id: 'tier-iot-2', name: 'Standard Delegate Pass', memberPrice: 120, nonMemberPrice: 240, available: 3, total: 50, description: 'Access to all 4 research paper presentations and lab demo' },
    ],
    volunteers: [
      {
        id: 'vol-004',
        memberId: 'mem-003',
        memberName: 'Karthik Raja',
        memberEmail: 'karthik.r@campus.edu',
        role: 'Registration Desk & Attendee Check-in',
        shift: '08:30 AM - 12:30 PM',
        responsibilities: 'Issue NFC summit badges, cross-verify member discount eligibility, seat VIP guest faculty.',
        guideInstructions: [
          'Scan student QR ticket on tablet.',
          'Verify Skyline club membership ID on screen.',
          'Issue color-coded delegate ribbon tag.',
        ],
        status: 'CONFIRMED',
        contactPhone: '+91 97410 44321',
      },
    ],
    attendees: [
      { id: 'att-008', ticketId: 'TKT-IOT-001', name: 'Tanvi Joshi', email: 'tanvi.j@campus.edu', isMember: true, membershipId: 'SSA-2026-0049', tier: 'Member Symposium Pass', pricePaid: 80, registeredAt: 'Mar 10, 2026', checkedIn: true, checkInTime: '09:15 AM' },
      { id: 'att-009', ticketId: 'TKT-IOT-002', name: 'Dev Sharma', email: 'dev.s@campus.edu', isMember: false, tier: 'Standard Delegate Pass', pricePaid: 240, registeredAt: 'Mar 11, 2026', checkedIn: true, checkInTime: '09:22 AM' },
    ],
    announcements: [
      { id: 'ann-04', title: 'Keynote Speaker Announced', content: 'Dr. R. Swaminathan, Chief Architect at C-DAC, will inaugurate the symposium at 10 AM.', timestamp: 'Mar 20, 2026 at 09:00 AM', author: 'Meera Nambiar (Organizer)', pinned: true },
    ],
  },
  {
    id: 'evt-robotics-champ',
    title: 'Inter-College Robotics Championship',
    category: 'Competition',
    bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
    dateDisplay: 'APR 15-17, 2026',
    date: 'April 15-17, 2026',
    time: '08:30 AM - 06:00 PM',
    location: 'NIT Trichy',
    venueHall: 'Indoor Sports Complex Arena A',
    tags: ['Robotics', 'Embedded C', 'Hardware', 'National'],
    capacity: 80,
    soldCount: 62,
    checkedInCount: 0,
    revenue: 12400,
    status: 'PUBLISHED',
    presidentNotes: 'Safety arena barricades must be inspected by college engineering faculty.',
    assignedOrganizer: {
      id: 'mem-003',
      name: 'Karthik Raja',
      email: 'karthik.r@campus.edu',
      assignedAt: 'Mar 01, 2026',
    },
    tiers: [
      { id: 'tier-rob-1', name: 'Member Combat Arena Entry', memberPrice: 120, nonMemberPrice: 300, available: 8, total: 40, description: 'Arena access for verified club members & bot pit crew' },
      { id: 'tier-rob-2', name: 'General Spectator Pass', memberPrice: 150, nonMemberPrice: 320, available: 10, total: 40, description: 'Grandstand seat access across all 3 competition rounds' },
    ],
    volunteers: [
      {
        id: 'vol-005',
        memberId: 'mem-001',
        memberName: 'Deepak Kumar',
        memberEmail: 'deepaka.ad24@bitsathy.ac.in',
        role: 'Pit Arena Marshall & Safety Lead',
        shift: '08:00 AM - 02:00 PM',
        responsibilities: 'Ensure team bots meet weight & battery safety criteria before entering match ring.',
        guideInstructions: [
          'Weigh combat robots on digital scale (max 15kg).',
          'Verify fail-safe kill switch operation.',
          'Issue pit pass tags to authorized team pilots.',
        ],
        status: 'CONFIRMED',
        contactPhone: '+91 98452 11029',
      },
    ],
    attendees: [
      { id: 'att-010', ticketId: 'TKT-ROB-001', name: 'Siddharth Rao', email: 'sid.r@campus.edu', isMember: true, membershipId: 'SSA-2026-0062', tier: 'Member Combat Arena Entry', pricePaid: 120, registeredAt: 'Apr 01, 2026', checkedIn: false },
    ],
    announcements: [
      { id: 'ann-05', title: 'Arena Dimensions & Match Rules Released', content: 'Official 8m x 8m combat arena specs and weapon restrictions are available for download.', timestamp: 'Apr 02, 2026', author: 'Karthik Raja (Organizer)', pinned: true },
    ],
  },
  {
    id: 'evt-blockchain-web3',
    title: 'Blockchain & Web3 Workshop',
    category: 'Workshop',
    bannerImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80',
    dateDisplay: 'MAR 20, 2026',
    date: 'March 20, 2026',
    time: '01:30 PM - 06:30 PM',
    location: 'IIIT Hyderabad',
    venueHall: 'Kohli Research Block Seminar Hall',
    tags: ['Web3', 'Solidity', 'Smart Contracts', 'FinTech'],
    capacity: 120,
    soldCount: 55,
    checkedInCount: 42,
    revenue: 8250,
    status: 'PUBLISHED',
    presidentNotes: 'Focus on hands-on Solidity testnet deployment and wallet integration.',
    assignedOrganizer: {
      id: 'mem-002',
      name: 'Ananya Deshmukh',
      email: 'ananya.d@campus.edu',
      assignedAt: 'Mar 02, 2026',
    },
    tiers: [
      { id: 'tier-bc-1', name: 'Club Member Dev Pass', memberPrice: 90, nonMemberPrice: 220, available: 35, total: 60, description: 'Includes Sepolia gas faucet credits and starter contracts package' },
      { id: 'tier-bc-2', name: 'Student General Ticket', memberPrice: 120, nonMemberPrice: 250, available: 30, total: 60, description: 'Hands-on developer workshop pass with sandbox access' },
    ],
    volunteers: [
      {
        id: 'vol-006',
        memberId: 'mem-004',
        memberName: 'Meera Nambiar',
        memberEmail: 'meera.n@campus.edu',
        role: 'Registration Desk & Attendee Check-in',
        shift: '12:30 PM - 03:00 PM',
        responsibilities: 'Verify attendee ticket credentials, provide WiFi voucher and GitHub repo link.',
        guideInstructions: [
          'Scan student QR pass upon entry.',
          'Verify member discount status on dashboard.',
          'Issue testnet token instruction flyer.',
        ],
        status: 'CONFIRMED',
        contactPhone: '+91 94432 99821',
      },
    ],
    attendees: [
      { id: 'att-011', ticketId: 'TKT-BC-001', name: 'Nikhil Verma', email: 'nikhil.v@campus.edu', isMember: true, membershipId: 'SSA-2026-0077', tier: 'Club Member Dev Pass', pricePaid: 90, registeredAt: 'Mar 12, 2026', checkedIn: true, checkInTime: '01:15 PM' },
    ],
    announcements: [
      { id: 'ann-06', title: 'Bring Your Laptop with MetaMask', content: 'Ensure MetaMask extension or Brave wallet is installed before arriving.', timestamp: 'Mar 18, 2026', author: 'Ananya Deshmukh (Organizer)' },
    ],
  },
  {
    id: 'evt-uiux-masterclass',
    title: 'UI/UX Design Masterclass',
    category: 'Workshop',
    bannerImage: 'https://images.unsplash.com/photo-1581291518655-9523c93269c4?auto=format&fit=crop&w=900&q=80',
    dateDisplay: 'APR 20-22, 2026',
    date: 'April 20-22, 2026',
    time: '02:00 PM - 05:30 PM Daily',
    location: 'NID Ahmedabad',
    venueHall: 'Design Studio 3B & Usability Lab',
    tags: ['Figma', 'Design Systems', 'User Research', 'Wireframing'],
    capacity: 60,
    soldCount: 32,
    checkedInCount: 0,
    revenue: 5400,
    status: 'PUBLISHED',
    presidentNotes: 'Limited seats due to workstation licensing. Prioritize club design committee members.',
    assignedOrganizer: {
      id: 'mem-001',
      name: 'Deepak Kumar',
      email: 'deepaka.ad24@bitsathy.ac.in',
      assignedAt: 'Mar 05, 2026',
    },
    tiers: [
      { id: 'tier-ux-1', name: 'Member Studio Pass', memberPrice: 110, nonMemberPrice: 250, available: 16, total: 30, description: 'Exclusive 56% savings for club members with Figma Pro team seat' },
      { id: 'tier-ux-2', name: 'General Designer Pass', memberPrice: 150, nonMemberPrice: 290, available: 12, total: 30, description: 'Full access to 3-day workshop sessions and portfolio review' },
    ],
    volunteers: [
      {
        id: 'vol-007',
        memberId: 'mem-002',
        memberName: 'Ananya Deshmukh',
        memberEmail: 'ananya.d@campus.edu',
        role: 'Registration Desk & Attendee Check-in',
        shift: '01:30 PM - 03:30 PM',
        responsibilities: 'Check in students, verify member discount, distribute sketchbook kits.',
        guideInstructions: [
          'Verify attendee digital ticket code.',
          'Verify club member status for discounted passholders.',
          'Provide UI kit sketchbook and fine-liner set.',
        ],
        status: 'CONFIRMED',
        contactPhone: '+91 99882 11234',
      },
    ],
    attendees: [
      { id: 'att-012', ticketId: 'TKT-UX-001', name: 'Kavya Nair', email: 'kavya.n@campus.edu', isMember: true, membershipId: 'SSA-2026-0081', tier: 'Member Studio Pass', pricePaid: 110, registeredAt: 'Apr 02, 2026', checkedIn: false },
    ],
    announcements: [
      { id: 'ann-07', title: 'Portfolio Review Sessions', content: 'Submit your Figma project links 24 hours before the session for live feedback.', timestamp: 'Apr 10, 2026', author: 'Deepak Kumar (Organizer)', pinned: true },
    ],
  },
];

export const mockDoorTickets = [
  { id: 'TKT-AI-001', attendee: 'Aarav Sharma', isMember: true, tier: 'Club Member Hacker Pass', checkedIn: true, time: '08:45 AM' },
  { id: 'TKT-AI-002', attendee: 'Priya Sundaram', isMember: true, tier: 'Club Member Hacker Pass', checkedIn: true, time: '08:52 AM' },
  { id: 'TKT-AI-003', attendee: 'Rohan Mehra', isMember: false, tier: 'General Participant Pass', checkedIn: false, time: '-' },
  { id: 'TKT-AI-004', attendee: 'Sneha Patel', isMember: false, tier: 'General Participant Pass', checkedIn: false, time: '-' },
  { id: 'TKT-AI-005', attendee: 'Deepak Kumar', isMember: true, tier: 'Club Member Hacker Pass', checkedIn: true, time: '09:05 AM' },
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
