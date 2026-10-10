import { create } from 'zustand';
import {
  mockEvents,
  mockDoorTickets,
  mockMembers,
  mockMerchandise,
  mockFundraiserTasks,
  mockExpenses,
  mockTreasurerLedger,
  mockAnnouncements,
  MockEvent,
  MockMember,
  MockMerchItem,
  MockTask,
  MockExpense,
} from '../data/mockClubData';

export interface MerchandiseOrder {
  id: string;
  itemId: string;
  itemName: string;
  size: string;
  price: number;
  quantity: number;
  studentName: string;
  studentEmail: string;
  paymentId: string;
  orderDate: string;
  status: 'PROCESSING' | 'READY_FOR_PICKUP' | 'COLLECTED';
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  platform: string;
  votes: number;
}

export interface ElectionPosition {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
}

export interface ElectionState {
  term: string;
  status: 'ACTIVE' | 'CLOSED';
  totalEligibleVoters: number;
  totalBallotsCast: number;
  userVotedPositions: Record<string, string>; // positionId -> candidateId
  positions: ElectionPosition[];
}

export interface PaymentReceipt {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  purpose: string;
  payerName: string;
  payerEmail: string;
  method: 'UPI' | 'CARD' | 'NETBANKING' | 'RAZORPAY_OFFICIAL_POPUP';
  timestamp: string;
  signature: string;
}

interface ClubState {
  // 1. Memberships
  members: MockMember[];
  activeMemberCount: number;
  annualDuesAmount: number;

  // 2. Events & Ticketing
  events: MockEvent[];
  doorTickets: typeof mockDoorTickets;

  // 3. Merchandise & Goodies
  merchandise: MockMerchItem[];
  orders: MerchandiseOrder[];

  // 4. Fundraiser Tasks
  fundraiserTasks: MockTask[];

  // 5. Treasury Ledger & Reimbursements
  expenses: MockExpense[];
  ledger: typeof mockTreasurerLedger;
  paymentReceipts: PaymentReceipt[];

  // 6. Announcements
  announcements: typeof mockAnnouncements;

  // 7. Annual Officer Elections
  elections: ElectionState;

  // ── Actions ─────────────────────────────────────────────────────────────
  // Memberships
  payMembershipDues: (memberId: string, receipt: PaymentReceipt) => void;
  registerNewMember: (memberData: Omit<MockMember, 'id' | 'membershipId'>, receipt: PaymentReceipt) => MockMember;
  renewMembership: (memberId: string, receipt: PaymentReceipt) => void;

  // Ticketing
  bookEventTicket: (
    eventId: string,
    tierName: string,
    attendeeName: string,
    isMember: boolean,
    receipt: PaymentReceipt
  ) => { ticketId: string; qrToken: string };
  checkInDoorTicket: (ticketIdOrToken: string) => { success: boolean; message: string; ticket?: any };

  // Merchandise
  orderMerchandise: (
    itemId: string,
    size: string,
    studentName: string,
    studentEmail: string,
    isMember: boolean,
    receipt: PaymentReceipt
  ) => MerchandiseOrder | null;

  // Fundraiser Tasks
  updateTaskStatus: (taskId: string, status: MockTask['status']) => void;
  addTask: (task: Omit<MockTask, 'id'>) => void;

  // Reimbursements & Treasury
  submitExpenseClaim: (claim: Omit<MockExpense, 'id' | 'status' | 'date'>) => void;
  approveExpenseClaim: (expenseId: string) => void;
  recordExpensePayout: (expenseId: string) => void;

  // Announcements
  publishAnnouncement: (announcement: {
    title: string;
    category: string;
    author: string;
    priority: string;
    content: string;
  }) => void;

  // Officer Elections
  castBallot: (positionId: string, candidateId: string, voterId: string) => { success: boolean; receiptToken?: string; error?: string };
}

export const useClubStore = create<ClubState>((set, get) => ({
  members: mockMembers,
  activeMemberCount: mockMembers.filter((m) => m.duesPaid).length,
  annualDuesAmount: 250,

  events: mockEvents,
  doorTickets: mockDoorTickets,

  merchandise: mockMerchandise,
  orders: [
    {
      id: 'ORD-SSA-1042',
      itemId: 'merch-hoodie',
      itemName: 'Skyline Club Embroidered Hoodie',
      size: 'L',
      price: 700,
      quantity: 1,
      studentName: 'Deepak Kumar',
      studentEmail: 'deepaka.ad24@bitsathy.ac.in',
      paymentId: 'pay_N93kLa829481',
      orderDate: 'April 14, 2026',
      status: 'READY_FOR_PICKUP',
    },
    {
      id: 'ORD-SSA-1043',
      itemId: 'merch-tee',
      itemName: 'Skyline Signature Cotton T-Shirt',
      size: 'M',
      price: 350,
      quantity: 1,
      studentName: 'Ananya Deshmukh',
      studentEmail: 'ananya.d@campus.edu',
      paymentId: 'pay_N94mKb921472',
      orderDate: 'April 18, 2026',
      status: 'PROCESSING',
    },
  ],

  fundraiserTasks: mockFundraiserTasks,

  expenses: mockExpenses,
  ledger: { ...mockTreasurerLedger },
  paymentReceipts: [
    {
      paymentId: 'pay_N93kLa829481',
      orderId: 'order_hoodie_9821',
      amount: 700,
      currency: 'INR',
      purpose: 'Skyline Club Embroidered Hoodie (Size L)',
      payerName: 'Deepak Kumar',
      payerEmail: 'deepaka.ad24@bitsathy.ac.in',
      method: 'UPI',
      timestamp: '2026-04-14 11:24:00',
      signature: 'hmac_sha256_verified_token_88921a',
    },
  ],

  announcements: mockAnnouncements,

  elections: {
    term: '2026 - 2027 Executive Board',
    status: 'ACTIVE',
    totalEligibleVoters: 248,
    totalBallotsCast: 142,
    userVotedPositions: {},
    positions: [
      {
        id: 'pos-president',
        title: 'Club President',
        description: 'Oversees club strategy, university liaison, and executive committee leadership.',
        candidates: [
          {
            id: 'cand-pres-1',
            name: 'Deepak Kumar',
            role: 'Current VP & Tech Lead',
            department: 'Computer Science (3rd Year)',
            avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Deepak&backgroundColor=b6e3f4',
            platform: 'Transparent live ledger, hybrid hackathons, industry mentorship partnerships, and 100% digital check-in.',
            votes: 84,
          },
          {
            id: 'cand-pres-2',
            name: 'Sarah Jenkins',
            role: 'Public Relations Officer',
            department: 'Electronics & Comm (3rd Year)',
            avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Sarah&backgroundColor=ffd5dc',
            platform: 'Expanded alumni sponsorship network, inter-college club festival, and community outreach workshops.',
            votes: 58,
          },
        ],
      },
      {
        id: 'pos-treasurer',
        title: 'Club Treasurer',
        description: 'Manages club bank accounts, dues collection, expense disbursements, and audits.',
        candidates: [
          {
            id: 'cand-trs-1',
            name: 'Priya Sharma',
            role: 'Finance Coordinator',
            department: 'Information Science (2nd Year)',
            avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Priya&backgroundColor=c0aede',
            platform: '24-hour volunteer receipt reimbursement SLA, automated semester audit reports, and zero manual spreadsheets.',
            votes: 79,
          },
          {
            id: 'cand-trs-2',
            name: 'Marcus Lee',
            role: 'Budget Assistant',
            department: 'Business & Management (2nd Year)',
            avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Marcus&backgroundColor=d1d4f9',
            platform: 'Negotiating group discounts on venue catering, competitive vendor pricing, and merchandise profit margins.',
            votes: 63,
          },
        ],
      },
      {
        id: 'pos-organizer',
        title: 'Chief Event Organizer',
        description: 'Directs flagship festivals, venue logistics, door ticket management, and stage production.',
        candidates: [
          {
            id: 'cand-org-1',
            name: 'Aarav Patel',
            role: 'Events Committee Lead',
            department: 'Mechanical Eng (3rd Year)',
            avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Aarav&backgroundColor=ffdfbf',
            platform: 'Streamlined QR scanners for 500+ attendees under 15 minutes, food truck alliances, and stage lighting.',
            votes: 91,
          },
          {
            id: 'cand-org-2',
            name: 'Sneha Sundaram',
            role: 'Cultural Secretary',
            department: 'Design & Media (2nd Year)',
            avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Sneha&backgroundColor=b6e3f4',
            platform: 'Accessible sensory-friendly event zones, live streaming for distant members, and collaborative music galas.',
            votes: 51,
          },
        ],
      },
    ],
  },

  // ── Actions Implementation ────────────────────────────────────────────────
  payMembershipDues: (memberId, receipt) => {
    set((state) => {
      const updatedMembers = state.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              duesPaid: true,
              duesExpiresAt: 'May 31, 2027',
              discountEligible: true,
              renewalAlert: false,
            }
          : m
      );

      const duesAmount = receipt.amount || state.annualDuesAmount;
      const updatedIncome = {
        ...state.ledger.income,
        membershipDues: state.ledger.income.membershipDues + duesAmount,
        totalIncome: state.ledger.income.totalIncome + duesAmount,
      };

      const netClosingBalance = updatedIncome.totalIncome - state.ledger.expenses.totalExpenses;

      return {
        members: updatedMembers,
        activeMemberCount: updatedMembers.filter((m) => m.duesPaid).length,
        paymentReceipts: [receipt, ...state.paymentReceipts],
        ledger: {
          ...state.ledger,
          income: updatedIncome,
          netClosingBalance,
        },
      };
    });
  },

  registerNewMember: (memberData, receipt) => {
    const state = get();
    const newId = `SSA-2026-${String(state.members.length + 101).padStart(4, '0')}`;
    const newMember: MockMember = {
      ...memberData,
      id: `mem-${Date.now()}`,
      membershipId: newId,
      duesPaid: true,
      duesExpiresAt: 'May 31, 2027',
      renewalAlert: false,
      discountEligible: true,
    };

    const duesAmount = receipt.amount || state.annualDuesAmount;
    const updatedIncome = {
      ...state.ledger.income,
      membershipDues: state.ledger.income.membershipDues + duesAmount,
      totalIncome: state.ledger.income.totalIncome + duesAmount,
    };
    const netClosingBalance = updatedIncome.totalIncome - state.ledger.expenses.totalExpenses;

    set({
      members: [newMember, ...state.members],
      activeMemberCount: state.activeMemberCount + 1,
      paymentReceipts: [receipt, ...state.paymentReceipts],
      ledger: {
        ...state.ledger,
        income: updatedIncome,
        netClosingBalance,
      },
    });

    return newMember;
  },

  renewMembership: (memberId, receipt) => {
    get().payMembershipDues(memberId, receipt);
  },

  bookEventTicket: (eventId, tierName, attendeeName, isMember, receipt) => {
    const state = get();
    const ticketId = `TKT-GALA-${Math.floor(100 + Math.random() * 900)}`;
    const qrToken = `SSA-GALA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedEvents = state.events.map((evt) => {
      if (evt.id === eventId) {
        const updatedTiers = evt.tiers.map((t) =>
          t.name === tierName && t.available > 0
            ? { ...t, available: t.available - 1 }
            : t
        );
        return {
          ...evt,
          soldCount: evt.soldCount + 1,
          revenue: evt.revenue + receipt.amount,
          tiers: updatedTiers,
        };
      }
      return evt;
    });

    const newDoorTicket = {
      id: ticketId,
      attendee: attendeeName,
      isMember,
      tier: tierName,
      checkedIn: false,
      time: '-',
    };

    const updatedIncome = {
      ...state.ledger.income,
      galaTickets: state.ledger.income.galaTickets + receipt.amount,
      totalIncome: state.ledger.income.totalIncome + receipt.amount,
    };
    const netClosingBalance = updatedIncome.totalIncome - state.ledger.expenses.totalExpenses;

    set({
      events: updatedEvents,
      doorTickets: [newDoorTicket, ...state.doorTickets],
      paymentReceipts: [receipt, ...state.paymentReceipts],
      ledger: {
        ...state.ledger,
        income: updatedIncome,
        netClosingBalance,
      },
    });

    return { ticketId, qrToken };
  },

  checkInDoorTicket: (ticketIdOrToken) => {
    const state = get();
    const normalized = ticketIdOrToken.trim().toUpperCase();

    // Search by ID or attendee name substring
    const ticket = state.doorTickets.find(
      (t) => t.id.toUpperCase() === normalized || normalized.includes(t.id.toUpperCase())
    );

    if (!ticket) {
      return {
        success: false,
        message: `Ticket "${ticketIdOrToken}" not found in guest list. Please check attendee name or purchase record.`,
      };
    }

    if (ticket.checkedIn) {
      return {
        success: false,
        message: `⚠️ DUPLICATE ENTRY ALERT: Ticket #${ticket.id} (${ticket.attendee}) was ALREADY checked in at ${ticket.time}!`,
        ticket,
      };
    }

    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedDoorTickets = state.doorTickets.map((t) =>
      t.id === ticket.id ? { ...t, checkedIn: true, time: checkInTime } : t
    );

    const updatedEvents = state.events.map((evt) =>
      evt.id === 'evt-gala-2026' ? { ...evt, checkedInCount: evt.checkedInCount + 1 } : evt
    );

    set({
      doorTickets: updatedDoorTickets,
      events: updatedEvents,
    });

    return {
      success: true,
      message: `Verified! Entry granted for ${ticket.attendee} (${ticket.isMember ? 'Club Member' : 'General Admission'}).`,
      ticket: { ...ticket, checkedIn: true, time: checkInTime },
    };
  },

  orderMerchandise: (itemId, size, studentName, studentEmail, _isMember, receipt) => {
    const state = get();
    const item = state.merchandise.find((m) => m.id === itemId);
    if (!item) return null;

    const variant = item.variants.find((v) => v.size === size);
    if (!variant || variant.stock <= 0) return null;

    // Decrement stock
    const updatedMerchandise = state.merchandise.map((m) => {
      if (m.id === itemId) {
        return {
          ...m,
          variants: m.variants.map((v) => (v.size === size ? { ...v, stock: v.stock - 1 } : v)),
        };
      }
      return m;
    });

    const newOrder: MerchandiseOrder = {
      id: `ORD-SSA-${Math.floor(1050 + Math.random() * 8900)}`,
      itemId,
      itemName: item.name,
      size,
      price: receipt.amount,
      quantity: 1,
      studentName,
      studentEmail,
      paymentId: receipt.paymentId,
      orderDate: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PROCESSING',
    };

    const updatedIncome = {
      ...state.ledger.income,
      merchandise: state.ledger.income.merchandise + receipt.amount,
      totalIncome: state.ledger.income.totalIncome + receipt.amount,
    };
    const netClosingBalance = updatedIncome.totalIncome - state.ledger.expenses.totalExpenses;

    set({
      merchandise: updatedMerchandise,
      orders: [newOrder, ...state.orders],
      paymentReceipts: [receipt, ...state.paymentReceipts],
      ledger: {
        ...state.ledger,
        income: updatedIncome,
        netClosingBalance,
      },
    });

    return newOrder;
  },

  updateTaskStatus: (taskId, status) => {
    set((state) => ({
      fundraiserTasks: state.fundraiserTasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    }));
  },

  addTask: (taskData) => {
    set((state) => ({
      fundraiserTasks: [
        ...state.fundraiserTasks,
        {
          ...taskData,
          id: `tsk-${Date.now()}`,
        },
      ],
    }));
  },

  submitExpenseClaim: (claimData) => {
    set((state) => ({
      expenses: [
        {
          ...claimData,
          id: `exp-${Math.floor(10 + Math.random() * 90)}`,
          status: 'PENDING',
          date: 'Today, ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        },
        ...state.expenses,
      ],
    }));
  },

  approveExpenseClaim: (expenseId) => {
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === expenseId ? { ...e, status: 'APPROVED' } : e)),
    }));
  },

  recordExpensePayout: (expenseId) => {
    set((state) => {
      const expense = state.expenses.find((e) => e.id === expenseId);
      if (!expense) return state;

      const updatedExpenses = state.expenses.map((e) =>
        e.id === expenseId ? { ...e, status: 'REIMBURSED' as const } : e
      );

      const updatedLedgerExpenses = {
        ...state.ledger.expenses,
        volunteerReimbursements: state.ledger.expenses.volunteerReimbursements + expense.amount,
        totalExpenses: state.ledger.expenses.totalExpenses + expense.amount,
      };

      const netClosingBalance = state.ledger.income.totalIncome - updatedLedgerExpenses.totalExpenses;

      return {
        expenses: updatedExpenses,
        ledger: {
          ...state.ledger,
          expenses: updatedLedgerExpenses,
          netClosingBalance,
        },
      };
    });
  },

  publishAnnouncement: (announcementData) => {
    set((state) => ({
      announcements: [
        {
          id: `ann-${Date.now()}`,
          ...announcementData,
          date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...state.announcements,
      ],
    }));
  },

  castBallot: (positionId, candidateId, voterId) => {
    const state = get();

    // Check voting eligibility
    const voter = state.members.find((m) => m.id === voterId || m.name === voterId);
    if (voter && !voter.duesPaid) {
      return {
        success: false,
        error: 'Only registered members with dues paid for the current academic term are eligible to vote.',
      };
    }

    if (state.elections.userVotedPositions[positionId]) {
      return {
        success: false,
        error: 'You have already cast your ballot for this executive position.',
      };
    }

    const updatedPositions = state.elections.positions.map((pos) => {
      if (pos.id === positionId) {
        return {
          ...pos,
          candidates: pos.candidates.map((c) => (c.id === candidateId ? { ...c, votes: c.votes + 1 } : c)),
        };
      }
      return pos;
    });

    const receiptToken = `BALLOT-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    set({
      elections: {
        ...state.elections,
        totalBallotsCast: state.elections.totalBallotsCast + 1,
        userVotedPositions: {
          ...state.elections.userVotedPositions,
          [positionId]: candidateId,
        },
        positions: updatedPositions,
      },
    });

    return { success: true, receiptToken };
  },
}));
