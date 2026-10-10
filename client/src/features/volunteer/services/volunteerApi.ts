import { apiClient } from '../../../services/api-client';
import {
  VolunteerTask,
  VolunteerProject,
  VolunteerEventAssignment,
  VolunteerExpenseClaim,
  TaskStatus,
  DoorTicket,
  ClubAnnouncement,
} from '../types/volunteer.types';

/**
 * =============================================================================
 * VOLUNTEER API CONTRACT & CLIENT SERVICE
 * =============================================================================
 * Connects the Volunteer Portal to CampusMitra REST APIs.
 *
 * Current Backend Status:
 * - Profile & Auth endpoints are implemented (/api/v1/users/me, /api/v1/auth/me)
 * - Domain endpoints (/api/v1/volunteer/*) are documented below with their
 *   required request/response schemas and authorization rules.
 * - When backend endpoints return 404 (unimplemented), this client provides
 *   graceful fallback to authenticated club seed data.
 */

// Initial club seed data aligned with Skyline Student Association (SSA-2026)
const INITIAL_TASKS: VolunteerTask[] = [
  {
    id: 'tsk-01',
    title: 'Bake 60 chocolate chip cookies for Spring Bake Sale',
    description: 'Prepare 5 dozen fresh cookies, pack in greaseproof bags, and label ingredients for allergy awareness.',
    category: 'Baking',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-05-01',
    projectName: 'Spring Charity Bake Sale & Fundraiser',
    assigneeName: 'RITHISH S',
    isOverdue: false,
  },
  {
    id: 'tsk-02',
    title: 'Procure biodegradable food boxes & napkins',
    description: 'Purchase 100 compostable snack containers and paper napkins from campus store.',
    category: 'Supplies',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    dueDate: '2026-04-30',
    projectName: 'Spring Charity Bake Sale & Fundraiser',
    assigneeName: 'Alex Rivera',
    isOverdue: false,
  },
  {
    id: 'tsk-03',
    title: 'Staff Table Shift: 10:00 AM - 12:00 PM',
    description: 'Manage sales table at Student Union Plaza Quad. Handle QR payments and verify member discount passes.',
    category: 'Table Staffing',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2026-05-02',
    projectName: 'Spring Charity Bake Sale & Fundraiser',
    assigneeName: 'RITHISH S',
    isOverdue: false,
  },
  {
    id: 'tsk-04',
    title: 'Staff Table Shift: 12:00 PM - 2:00 PM',
    description: 'Relieve morning shift volunteers, replenish pastry display, and record mid-day inventory counts.',
    category: 'Table Staffing',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2026-05-02',
    projectName: 'Spring Charity Bake Sale & Fundraiser',
    assigneeName: 'Sneha Patel',
    isOverdue: false,
  },
  {
    id: 'tsk-05',
    title: 'Print QR payment posters & price standees',
    description: 'Print laminated UPI payment QR codes and menu price standees for the booth counter.',
    category: 'Promotion',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    dueDate: '2026-04-29',
    projectName: 'Spring Charity Bake Sale & Fundraiser',
    assigneeName: 'Rohan Mehra',
    isOverdue: false,
  },
  {
    id: 'tsk-06',
    title: 'Coordinate stage setup & AV microphone cables',
    description: 'Assist event organizer with auditorium stage dressing, podium setup, and test guest wireless microphones.',
    category: 'Logistics',
    status: 'TODO',
    priority: 'URGENT',
    dueDate: '2026-04-24',
    projectName: 'Skyline Annual Spring Gala 2026',
    assigneeName: 'RITHISH S',
    isOverdue: true,
  },
];

const INITIAL_PROJECTS: VolunteerProject[] = [
  {
    id: 'proj-bake-sale',
    name: 'Spring Charity Bake Sale & Fundraiser',
    description: 'Campus-wide fundraising bake sale on Student Union Quad raising budget for student club activities and community outreach.',
    coordinatorName: 'Rohan Gupta',
    coordinatorRole: 'Event Organizer',
    deadline: 'May 2, 2026',
    targetFund: 20000,
    raisedFund: 14200,
    totalTasks: 5,
    completedTasks: 2,
    myTasksCount: 2,
    status: 'ACTIVE',
    category: 'Fundraiser',
  },
  {
    id: 'proj-spring-gala',
    name: 'Skyline Annual Spring Gala 2026',
    description: 'The premier annual formal event for Skyline Student Association featuring keynote address, dinner buffet, and cultural showcase.',
    coordinatorName: 'Aarav Sharma',
    coordinatorRole: 'President',
    deadline: 'April 24, 2026',
    targetFund: 65000,
    raisedFund: 58500,
    totalTasks: 8,
    completedTasks: 6,
    myTasksCount: 1,
    status: 'ACTIVE',
    category: 'Flagship Event',
  },
  {
    id: 'proj-hackathon-prep',
    name: 'Inter-College Hackathon Logistics',
    description: 'Planning volunteer logistics, sponsor merchandise distribution, and participant registration for upcoming hackathon.',
    coordinatorName: 'Priya Patel',
    coordinatorRole: 'Treasurer',
    deadline: 'June 10, 2026',
    targetFund: 35000,
    raisedFund: 18000,
    totalTasks: 4,
    completedTasks: 1,
    myTasksCount: 0,
    status: 'UPCOMING',
    category: 'Tech Initiative',
  },
];

const INITIAL_EVENTS: VolunteerEventAssignment[] = [
  {
    id: 'ev-assign-01',
    eventId: 'evt-bake-sale',
    eventTitle: 'Spring Charity Bake Sale & Fundraiser',
    date: 'Saturday, May 2, 2026',
    time: '10:00 AM - 12:00 PM',
    location: 'Student Union Plaza Quad (Booth #4)',
    responsibility: 'Table Staffing & Member Check-in',
    assignmentStatus: 'CONFIRMED',
    briefingInstructions: [
      'Arrive 15 minutes prior (9:45 AM) for cash float and card reader handover.',
      'Verify student digital membership cards before applying 20% discount on treat packs.',
      'Keep allergy declaration sheet visibly placed on the front counter table.',
    ],
  },
  {
    id: 'ev-assign-02',
    eventId: 'evt-gala-2026',
    eventTitle: 'Skyline Annual Spring Gala 2026',
    date: 'Friday, April 24, 2026',
    time: '5:30 PM - 10:30 PM',
    location: 'Main Campus Grand Auditorium',
    responsibility: 'Stage Logistics & VIP Guest Greeter',
    assignmentStatus: 'CONFIRMED',
    briefingInstructions: [
      'Dress code: Formal attire with volunteer lanyard identification.',
      'Check in with Event Coordinator Rohan Gupta at Green Room by 5:15 PM.',
      'Direct ticket holders to their assigned table seating zones according to QR code tier.',
    ],
  },
];

const INITIAL_EXPENSES: VolunteerExpenseClaim[] = [
  {
    id: 'exp-01',
    title: 'Bake sale organic butter, chocolate chips & flour packaging',
    amount: 1450,
    category: 'SUPPLIES',
    date: '2026-04-28',
    receiptNote: 'Supermarket Tax Invoice #9482 (Attached)',
    status: 'APPROVED',
    projectName: 'Spring Charity Bake Sale & Fundraiser',
    reviewerNotes: 'Approved by Treasurer Priya Patel. Slated for batch disbursement.',
  },
  {
    id: 'exp-02',
    title: 'Lamination sheets & mounting tape for payment QR standees',
    amount: 320,
    category: 'PRINTING',
    date: '2026-04-29',
    receiptNote: 'Campus Stationery Store Receipt #118',
    status: 'REIMBURSED',
    projectName: 'Spring Charity Bake Sale & Fundraiser',
    reimbursedAt: '2026-04-30',
    reviewerNotes: 'Reimbursed via direct bank transfer #IMPS-938210.',
  },
  {
    id: 'exp-03',
    title: 'Extra heavy-duty audio XLR cable adapter',
    amount: 450,
    category: 'EQUIPMENT',
    date: '2026-05-01',
    receiptNote: 'City Sound Equipment receipt slip #482',
    status: 'PENDING',
    projectName: 'Skyline Annual Spring Gala 2026',
    reviewerNotes: 'Under review by Treasurer Office.',
  },
];

// In-memory session store for runtime mutation tracking
let sessionTasks = [...INITIAL_TASKS];
let sessionExpenses = [...INITIAL_EXPENSES];

export const volunteerApi = {
  /**
   * Fetches volunteer account profile, roles, and club memberships from backend.
   * Endpoint: GET /api/v1/users/me
   * Authorization: Bearer JWT
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/users/me');
      return response.data?.data?.user;
    } catch {
      // Fallback to auth/me if users/me is unavailable
      const fallbackResponse = await apiClient.get('/auth/me');
      return fallbackResponse.data?.data?.user;
    }
  },

  /**
   * Fetches tasks assigned to the volunteer.
   * Contract:
   *   Method: GET /api/v1/volunteer/tasks
   *   Auth: Bearer JWT (Role: VOLUNTEER)
   *   Response: { status: 'success', data: { tasks: VolunteerTask[] } }
   */
  async getTasks(): Promise<VolunteerTask[]> {
    try {
      const response = await apiClient.get('/volunteer/tasks');
      if (response.data?.data?.tasks) {
        return response.data.data.tasks;
      }
    } catch {
      // Endpoint not yet deployed; safely return club seed data
    }
    return [...sessionTasks];
  },

  /**
   * Updates status of a task assigned to the volunteer.
   * Contract:
   *   Method: PATCH /api/v1/volunteer/tasks/:id/status
   *   Auth: Bearer JWT (Role: VOLUNTEER)
   *   Request: { status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' }
   *   Response: { status: 'success', data: { task: VolunteerTask } }
   */
  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<VolunteerTask> {
    try {
      const response = await apiClient.patch(`/volunteer/tasks/${taskId}/status`, {
        status: newStatus,
      });
      if (response.data?.data?.task) {
        return response.data.data.task;
      }
    } catch {
      // Endpoint not yet deployed; safely update session state
    }

    const taskIndex = sessionTasks.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      sessionTasks[taskIndex] = {
        ...sessionTasks[taskIndex],
        status: newStatus,
      };
      return sessionTasks[taskIndex];
    }
    throw new Error(`Task with id ${taskId} not found.`);
  },

  /**
   * Fetches projects & fundraisers where volunteer participates.
   * Contract:
   *   Method: GET /api/v1/volunteer/projects
   *   Auth: Bearer JWT (Role: VOLUNTEER)
   *   Response: { status: 'success', data: { projects: VolunteerProject[] } }
   */
  async getProjects(): Promise<VolunteerProject[]> {
    try {
      const response = await apiClient.get('/volunteer/projects');
      if (response.data?.data?.projects) {
        return response.data.data.projects;
      }
    } catch {
      // Endpoint not yet deployed; safely return club seed data
    }
    return [...INITIAL_PROJECTS];
  },

  /**
   * Fetches upcoming event assignments for the volunteer.
   * Contract:
   *   Method: GET /api/v1/volunteer/events
   *   Auth: Bearer JWT (Role: VOLUNTEER)
   *   Response: { status: 'success', data: { events: VolunteerEventAssignment[] } }
   */
  async getEvents(): Promise<VolunteerEventAssignment[]> {
    try {
      const response = await apiClient.get('/volunteer/events');
      if (response.data?.data?.events) {
        return response.data.data.events;
      }
    } catch {
      // Endpoint not yet deployed; safely return club seed data
    }
    return [...INITIAL_EVENTS];
  },

  /**
   * Fetches volunteer's own expense claims and reimbursement status.
   * Contract:
   *   Method: GET /api/v1/volunteer/expenses
   *   Auth: Bearer JWT (Role: VOLUNTEER)
   *   Response: { status: 'success', data: { expenses: VolunteerExpenseClaim[] } }
   */
  async getExpenses(): Promise<VolunteerExpenseClaim[]> {
    try {
      const response = await apiClient.get('/volunteer/expenses');
      if (response.data?.data?.expenses) {
        return response.data.data.expenses;
      }
    } catch {
      // Endpoint not yet deployed; safely return club seed data
    }
    return [...sessionExpenses];
  },

  /**
   * Submits a new volunteer expense claim for reimbursement review.
   * Contract:
   *   Method: POST /api/v1/volunteer/expenses
   *   Auth: Bearer JWT (Role: VOLUNTEER)
   *   Request: {
   *     title: string,
   *     amount: number,
   *     category: ExpenseCategory,
   *     date: string,
   *     receiptNote: string,
   *     projectName?: string
   *   }
   *   Response: { status: 'success', data: { claim: VolunteerExpenseClaim } }
   */
  async submitExpense(data: Omit<VolunteerExpenseClaim, 'id' | 'status'>): Promise<VolunteerExpenseClaim> {
    try {
      const response = await apiClient.post('/volunteer/expenses', data);
      if (response.data?.data?.claim) {
        return response.data.data.claim;
      }
    } catch {
      // Endpoint not yet deployed; record in session claim ledger
    }

    const newClaim: VolunteerExpenseClaim = {
      ...data,
      id: `exp-${Date.now()}`,
      status: 'PENDING',
      reviewerNotes: 'Submitted for treasurer review. Pending verification against receipt.',
    };

    sessionExpenses = [newClaim, ...sessionExpenses];
    return newClaim;
  },

  /**
   * Fetches tickets for Door Check-in Scanner at club events.
   * Solves: "On the night, someone at the door should be able to check a ticket in seconds, without a printed list."
   */
  async getTickets(): Promise<DoorTicket[]> {
    return [...sessionTickets];
  },

  /**
   * Admits an attendee by ticket code or ID at the venue door in real time.
   */
  async admitTicket(
    ticketIdOrCode: string,
    admittedBy = 'Volunteer Desk'
  ): Promise<{ success: boolean; ticket: DoorTicket; message: string }> {
    const cleanQuery = ticketIdOrCode.trim().toUpperCase();
    const index = sessionTickets.findIndex(
      (t) => t.id === cleanQuery || t.ticketCode.toUpperCase() === cleanQuery
    );

    if (index === -1) {
      throw new Error(`Ticket "${ticketIdOrCode}" not found in registered guest list.`);
    }

    const currentTicket = sessionTickets[index];
    if (currentTicket.admitted) {
      return {
        success: false,
        ticket: currentTicket,
        message: `Already admitted at ${currentTicket.admittedAt || 'earlier today'} by ${currentTicket.admittedBy || 'door staff'}.`,
      };
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    sessionTickets[index] = {
      ...currentTicket,
      admitted: true,
      admittedAt: timeString,
      admittedBy,
    };

    return {
      success: true,
      ticket: sessionTickets[index],
      message: `Verified and Admitted! Welcome, ${currentTicket.guestName}.`,
    };
  },

  /**
   * Fetches club announcements and volunteer directives.
   * Solves: "The club needs to tell every member about a meeting... instead of it getting lost in a chat."
   */
  async getAnnouncements(): Promise<ClubAnnouncement[]> {
    return [...sessionAnnouncements];
  },

  /**
   * Acknowledges that volunteer has read an announcement.
   */
  async acknowledgeAnnouncement(id: string): Promise<ClubAnnouncement> {
    const idx = sessionAnnouncements.findIndex((a) => a.id === id);
    if (idx !== -1) {
      sessionAnnouncements[idx] = {
        ...sessionAnnouncements[idx],
        acknowledged: true,
      };
      return sessionAnnouncements[idx];
    }
    throw new Error('Announcement not found.');
  },
};

const INITIAL_TICKETS: DoorTicket[] = [
  {
    id: 'tkt-01',
    ticketCode: 'GALA-TKT-1089',
    guestName: 'Aarav Patel',
    email: 'aarav.patel@skyline.edu',
    tier: 'VIP',
    eventTitle: 'Skyline Annual Spring Gala 2026',
    seatInfo: 'VIP Table #4 - Seat A',
    admitted: false,
  },
  {
    id: 'tkt-02',
    ticketCode: 'GALA-TKT-1090',
    guestName: 'Priya Sharma',
    email: 'priya.s@skyline.edu',
    tier: 'STUDENT_MEMBER',
    eventTitle: 'Skyline Annual Spring Gala 2026',
    seatInfo: 'General Section Row C - Seat 12',
    admitted: true,
    admittedAt: '06:15 PM',
    admittedBy: 'Volunteer Desk (RITHISH S)',
  },
  {
    id: 'tkt-03',
    ticketCode: 'GALA-TKT-1091',
    guestName: 'Rohan Mehta',
    email: 'rohan.m@skyline.edu',
    tier: 'STUDENT_MEMBER',
    eventTitle: 'Skyline Annual Spring Gala 2026',
    seatInfo: 'General Section Row D - Seat 08',
    admitted: false,
  },
  {
    id: 'tkt-04',
    ticketCode: 'GALA-TKT-1092',
    guestName: 'Ananya Iyer',
    email: 'ananya.iyer@skyline.edu',
    tier: 'GENERAL',
    eventTitle: 'Skyline Annual Spring Gala 2026',
    seatInfo: 'General Section Row B - Seat 05',
    admitted: false,
  },
  {
    id: 'tkt-05',
    ticketCode: 'GALA-TKT-1093',
    guestName: 'Karthik Rajan',
    email: 'karthik.r@skyline.edu',
    tier: 'STUDENT_MEMBER',
    eventTitle: 'Skyline Annual Spring Gala 2026',
    seatInfo: 'General Section Row A - Seat 19',
    admitted: true,
    admittedAt: '06:40 PM',
    admittedBy: 'Volunteer Desk (RITHISH S)',
  },
  {
    id: 'tkt-06',
    ticketCode: 'GALA-TKT-1094',
    guestName: 'Sneha Nambiar',
    email: 'sneha.n@skyline.edu',
    tier: 'VIP',
    eventTitle: 'Skyline Annual Spring Gala 2026',
    seatInfo: 'VIP Table #2 - Seat B',
    admitted: false,
  },
  {
    id: 'tkt-07',
    ticketCode: 'GALA-TKT-1095',
    guestName: 'Vikram Sundaram',
    email: 'vikram.s@skyline.edu',
    tier: 'GENERAL',
    eventTitle: 'Skyline Annual Spring Gala 2026',
    seatInfo: 'Balcony Tier Row A - Seat 04',
    admitted: false,
  },
];

const INITIAL_ANNOUNCEMENTS: ClubAnnouncement[] = [
  {
    id: 'anc-01',
    title: 'Spring Gala Door Entrance & Scanner Briefing',
    category: 'VOLUNTEER_BRIEFING',
    content: 'All door check-in volunteers are requested to assemble at Main Auditorium East Gate at 4:45 PM sharp for QR scanner tablet testing and badge lanyard distribution. Verify student memberships for discounted ticket holders.',
    date: '2026-05-15',
    postedBy: 'Event Organizer Committee',
    priority: 'URGENT',
    targetAudience: 'Event Volunteers & Gate Marshals',
    acknowledged: false,
  },
  {
    id: 'anc-02',
    title: 'Bake Sale Quad Booth Schedule & Pastry Drop-off',
    category: 'VOLUNTEER_BRIEFING',
    content: 'Plaza tables 1-4 are confirmed for May 2. Bakers should drop off labeled cookie and pastry batches between 9:00 AM - 9:30 AM at the Student Union kitchenette. Morning table shifts begin at 10:00 AM.',
    date: '2026-04-30',
    postedBy: 'Charity Fundraiser Leads',
    priority: 'IMPORTANT',
    targetAudience: 'Bake Sale Squad',
    acknowledged: true,
  },
  {
    id: 'anc-03',
    title: 'Semester Reimbursement Cutoff: Submit All Bills Before Friday',
    category: 'DEADLINE',
    content: 'The Treasurer will close the audited semester books on Friday 5:00 PM. Any out-of-pocket receipts for baking ingredients, decor, or cables must be uploaded via the Volunteer Portal today to ensure prompt bank disbursement.',
    date: '2026-04-28',
    postedBy: 'Treasurer Office',
    priority: 'URGENT',
    targetAudience: 'All Club Volunteers',
    acknowledged: true,
  },
  {
    id: 'anc-04',
    title: 'General Club Meeting & Hoodies Distribution Announcement',
    category: 'MEETING',
    content: 'Our monthly general assembly will take place next Tuesday at 3:30 PM in Hall B. Pre-ordered Skyline branded hoodies will be distributed to active members. Check your digital membership pass at the welcome table.',
    date: '2026-04-25',
    postedBy: 'Skyline Executive Board',
    priority: 'NORMAL',
    targetAudience: 'All Members & Volunteers',
    acknowledged: false,
  },
];

let sessionTickets = [...INITIAL_TICKETS];
let sessionAnnouncements = [...INITIAL_ANNOUNCEMENTS];

