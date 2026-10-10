import {
  PrismaClient,
  RoleType,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  ElectionStatus,
  CandidateStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding with UUIDv7...');

  // 1. Clean existing records in reverse dependency order
  // Event & booking transactions
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.eventTask.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.membershipApplication.deleteMany({});

  // Treasurer models
  await prisma.studentMerchOrder.deleteMany({});
  await prisma.merchProduct.deleteMany({});
  await prisma.duesRecord.deleteMany({});
  await prisma.treasuryAuditLog.deleteMany({});
  await prisma.treasuryPaymentRecord.deleteMany({});
  await prisma.semesterReport.deleteMany({});
  await prisma.reimbursementClaim.deleteMany({});
  await prisma.treasuryExpense.deleteMany({});
  await prisma.treasuryIncome.deleteMany({});
  await prisma.treasuryLedger.deleteMany({});

  // Elections, Support, Auth & Users
  await prisma.notification.deleteMany({});
  await prisma.electionVote.deleteMany({});
  await prisma.electionCandidate.deleteMany({});
  await prisma.election.deleteMany({});
  await prisma.supportMessage.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing tables.');

  // 2. Seed 12 Diverse Campus Organizations
  const clubData = [
    {
      name: 'Tech & AI Innovators Club',
      slug: 'tech-innovators',
      description: 'Premier collegiate hub for artificial intelligence, machine learning, and modern web application development.',
      category: 'Technology',
      logoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=200&fit=crop&crop=faces',
      coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop',
      isActive: true,
    },
    {
      name: 'Creative Design & UI/UX Guild',
      slug: 'design-guild',
      description: 'Community of visual artists, UI/UX product designers, 3D animators, and multimedia creators.',
      category: 'Arts & Media',
      logoUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop&crop=faces',
      coverUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&h=400&fit=crop',
      isActive: true,
    },
    {
      name: 'Robotics & Hardware Society',
      slug: 'robotics-society',
      description: 'Hands-on embedded systems, autonomous drones, ROS framework, and collegiate battlebots team.',
      category: 'Engineering',
      logoUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=200&fit=crop&crop=faces',
      coverUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=400&fit=crop',
      isActive: true,
    },
    {
      name: 'Collegiate Coding & ACM Chapter',
      slug: 'acm-chapter',
      description: 'Competitive programming, algorithmic research, open-source development, and ICPC regional preparation.',
      category: 'Computer Science',
      logoUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=200&h=200&fit=crop&crop=faces',
      coverUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=400&fit=crop',
      isActive: true,
    },
    {
      name: 'FinTech & Investment Syndicate',
      slug: 'fintech-syndicate',
      description: 'Equity research, algorithmic trading models, decentralized finance, and student investment portfolio.',
      category: 'Finance & Business',
      logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop&crop=faces',
      coverUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=400&fit=crop',
      isActive: true,
    },
    {
      name: 'CyberSecurity & Defense Guild',
      slug: 'cybersecurity-guild',
      description: 'Ethical hacking, Capture the Flag (CTF) tournaments, penetration testing, and zero-trust network defenses.',
      category: 'Information Security',
      logoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&h=200&fit=crop&crop=faces',
      coverUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=400&fit=crop',
      isActive: true,
    },
    {
      name: 'Eco-Green & Environmental Action',
      slug: 'eco-green-action',
      description: 'Campus sustainability initiatives, zero-waste audits, rooftop solar projects, and tree canopy drives.',
      category: 'Sustainability',
      logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&h=200&fit=crop&crop=faces',
      coverUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&h=400&fit=crop',
      isActive: true,
    },
    {
      name: 'Literary & Debating Society',
      slug: 'literary-debating',
      description: 'Parliamentary debate, collegiate model UN, creative writing anthologies, and public rhetoric symposiums.',
      category: 'Humanities',
      logoUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=200&h=200&fit=crop&crop=faces',
      coverUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=400&fit=crop',
      isActive: true,
    },
    {
      name: 'Music & Performing Arts Ensemble',
      slug: 'music-performing-arts',
      description: 'Live instrumental fusion, acapella choir, annual campus music festivals, and sound engineering.',
      category: 'Culture',
      logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop&crop=faces',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=400&fit=crop',
      isActive: true,
    },
    {
      name: 'Biomedical & Healthcare Innovators',
      slug: 'biomedical-innovators',
      description: 'Wearable health telemetry, prosthetic 3D-printing, bioinformatics, and campus health awareness.',
      category: 'Life Sciences',
      logoUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=200&h=200&fit=crop&crop=faces',
      coverUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&h=400&fit=crop',
      isActive: true,
    },
    {
      name: 'Photography & Cinematography Forum',
      slug: 'photography-cinema',
      description: 'Documentary filmmaking, portraiture, campus event coverage, and darkroom/digital post-processing.',
      category: 'Visual Arts',
      logoUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop&crop=faces',
      coverUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=400&fit=crop',
      isActive: false, // Inactive example to test status management
    },
    {
      name: 'Aerospace & Rocketry Society',
      slug: 'aerospace-rocketry',
      description: 'Model rocketry, computational fluid dynamics, high-altitude weather balloons, and satellite telemetry.',
      category: 'Engineering',
      logoUrl: 'https://images.unsplash.com/photo-1517976487502-520e5cfa8561?w=200&h=200&fit=crop&crop=faces',
      coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop',
      isActive: false, // Inactive example to test status management
    },
  ];

  const clubs: any[] = [];
  for (const c of clubData) {
    const org = await prisma.organization.create({
      data: {
        id: uuidv7(),
        ...c,
      },
    });
    clubs.push(org);
  }
  console.log(`🏢 Created ${clubs.length} campus organizations.`);

  // 3. Define & Seed Standard Role Accounts + Additional Students
  const defaultHash = (pass: string) => bcrypt.hashSync(pass, 10);

  const seedUsers = [
    {
      username: 'admin',
      email: 'admin@campusmitra.edu',
      password: 'Admin@123',
      fullName: 'Prof. Alexander Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
      bio: 'Platform System Administrator overseeing organizations, governance, and audit operations.',
      roles: [{ role: RoleType.ADMIN, organizationId: null }],
    },
    {
      username: 'president',
      email: 'president@campusmitra.edu',
      password: 'President@123',
      fullName: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      bio: 'President of Tech & AI Innovators Club. Leading innovation initiatives, club events, and partnerships.',
      roles: [
        { role: RoleType.STUDENT, organizationId: null },
        { role: RoleType.MEMBER, organizationId: clubs[0].id },
        { role: RoleType.PRESIDENT, organizationId: clubs[0].id },
      ],
    },
    {
      username: 'treasurer',
      email: 'treasurer@campusmitra.edu',
      password: 'Treasurer@123',
      fullName: 'Marcus Sterling',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
      bio: 'Club Treasurer. Managing budget allocations, reimbursements, ticketing inflows, and semester financial audits.',
      roles: [
        { role: RoleType.STUDENT, organizationId: null },
        { role: RoleType.MEMBER, organizationId: clubs[0].id },
        { role: RoleType.TREASURER, organizationId: clubs[0].id },
      ],
    },
    {
      username: 'organizer',
      email: 'organizer@campusmitra.edu',
      password: 'Organizer@123',
      fullName: 'Chloe Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
      bio: 'Lead Event Organizer. Orchestrating conferences, tech talks, ticketing pipelines, and attendee verification.',
      roles: [
        { role: RoleType.STUDENT, organizationId: null },
        { role: RoleType.MEMBER, organizationId: clubs[0].id },
        { role: RoleType.EVENT_ORGANIZER, organizationId: clubs[0].id },
      ],
    },
    {
      username: 'volunteer',
      email: 'volunteer@campusmitra.edu',
      password: 'Volunteer@123',
      fullName: 'David Kim',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
      bio: 'Active Volunteer. Supporting event logistics, venue setup, participant registration, and task operations.',
      roles: [
        { role: RoleType.STUDENT, organizationId: null },
        { role: RoleType.MEMBER, organizationId: clubs[0].id },
        { role: RoleType.VOLUNTEER, organizationId: clubs[0].id },
      ],
    },
    {
      username: 'member',
      email: 'member@campusmitra.edu',
      password: 'Member@123',
      fullName: 'Aria Montgomery',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
      bio: 'Official club member with access to member-only workshops, special ticket pricing, and internal discussions.',
      roles: [
        { role: RoleType.STUDENT, organizationId: null },
        { role: RoleType.MEMBER, organizationId: clubs[0].id },
      ],
    },
    {
      username: 'student',
      email: 'student@campusmitra.edu',
      password: 'Student@123',
      fullName: 'Rahul Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces',
      bio: 'Undergraduate student exploring campus clubs, attending open events, and purchasing public merchandise.',
      roles: [{ role: RoleType.STUDENT, organizationId: null }],
    },
    // Additional voting students & nominees for election verification
    {
      username: 'candidate1',
      email: 'ananya.iyer@campusmitra.edu',
      password: 'Student@123',
      fullName: 'Ananya Iyer',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
      bio: '3rd Year Computer Science student running for Tech Club President.',
      roles: [
        { role: RoleType.STUDENT, organizationId: null },
        { role: RoleType.MEMBER, organizationId: clubs[0].id },
      ],
    },
    {
      username: 'candidate2',
      email: 'vikram.mehta@campusmitra.edu',
      password: 'Student@123',
      fullName: 'Vikram Mehta',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces',
      bio: 'AI researcher and open-source contributor seeking leadership.',
      roles: [
        { role: RoleType.STUDENT, organizationId: null },
        { role: RoleType.MEMBER, organizationId: clubs[0].id },
      ],
    },
    {
      username: 'candidate3',
      email: 'priya.nair@campusmitra.edu',
      password: 'Student@123',
      fullName: 'Priya Nair',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
      bio: 'Lead designer running for Creative Design Guild President.',
      roles: [
        { role: RoleType.STUDENT, organizationId: null },
        { role: RoleType.MEMBER, organizationId: clubs[1].id },
      ],
    },
    {
      username: 'voter1',
      email: 'rohan.patel@campusmitra.edu',
      password: 'Student@123',
      fullName: 'Rohan Patel',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=faces',
      bio: 'Active student voter and club participant.',
      roles: [{ role: RoleType.STUDENT, organizationId: null }],
    },
    {
      username: 'voter2',
      email: 'sneha.reddy@campusmitra.edu',
      password: 'Student@123',
      fullName: 'Sneha Reddy',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      bio: 'Robotics enthusiast and student council delegate.',
      roles: [{ role: RoleType.STUDENT, organizationId: null }],
    },
  ];

  const createdUsers: Record<string, any> = {};
  for (const item of seedUsers) {
    const user = await prisma.user.create({
      data: {
        id: uuidv7(),
        username: item.username,
        email: item.email,
        passwordHash: defaultHash(item.password),
        fullName: item.fullName,
        avatarUrl: item.avatarUrl,
        bio: item.bio,
        isActive: true,
        isEmailVerified: true,
      },
    });

    for (const r of item.roles) {
      await prisma.userRole.create({
        data: {
          id: uuidv7(),
          userId: user.id,
          role: r.role,
          organizationId: r.organizationId,
        },
      });
    }

    createdUsers[item.username] = user;
    console.log(`✅ Seeded user: ${item.username} (${item.fullName})`);
  }

  // 4. Seed at least 11 Support Tickets with Conversation Messages
  const ticketData = [
    {
      ticketNumber: 'TICK-1001',
      subject: 'Unable to verify student membership status after semester dues payment',
      description: 'I completed my UPI payment for the Tech & AI Innovators Club membership 2 days ago, but my portal still displays "Student" without member benefits.',
      category: TicketCategory.PAYMENT_ISSUE,
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      club: clubs[0],
      creator: createdUsers['student'],
      messages: [
        {
          sender: createdUsers['student'],
          message: 'Hello Support, my transaction reference is UPI-982348271. Please help sync my membership status so I can buy member-priced Gala tickets.',
          isAdmin: false,
        },
      ],
    },
    {
      ticketNumber: 'TICK-1002',
      subject: 'Club website custom banner upload returning 413 Payload Too Large error',
      description: 'When uploading the newly designed high-res club cover banner (6MB SVG), the server drops the connection with 413.',
      category: TicketCategory.WEBSITE_BUG,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      club: clubs[1],
      creator: createdUsers['president'],
      messages: [
        {
          sender: createdUsers['president'],
          message: 'We are preparing for annual orientations and need the guild hero banner updated. Is the file upload limit currently capped at 2MB?',
          isAdmin: false,
        },
        {
          sender: createdUsers['admin'],
          message: 'Hello Elena, investigating nginx client_max_body_size and S3 multipart buffer. Will deploy a 10MB threshold patch shortly.',
          isAdmin: true,
        },
      ],
    },
    {
      ticketNumber: 'TICK-1003',
      subject: 'Auditorium main stage reservation approval for Spring Tech Expo 2026',
      description: 'Tech & AI Club requests formal system admin sign-off for Main Auditorium A reservation on April 24th from 9 AM to 6 PM.',
      category: TicketCategory.CLUB_QUERY,
      priority: TicketPriority.URGENT,
      status: TicketStatus.OPEN,
      club: clubs[0],
      creator: createdUsers['organizer'],
      messages: [
        {
          sender: createdUsers['organizer'],
          message: 'Estimated attendance is 450 students. Sound system and live streaming infrastructure requested.',
          isAdmin: false,
        },
      ],
    },
    {
      ticketNumber: 'TICK-1004',
      subject: 'Two-Factor Authentication device recovery for Club Treasurer account',
      description: 'Replaced hardware mobile phone and lost access to Microsoft Authenticator TOTP token.',
      category: TicketCategory.ACCESS_RECOVERY,
      priority: TicketPriority.HIGH,
      status: TicketStatus.RESOLVED,
      club: clubs[0],
      creator: createdUsers['treasurer'],
      messages: [
        {
          sender: createdUsers['treasurer'],
          message: 'Requesting temporary backup OTP reset to verified campus email.',
          isAdmin: false,
        },
        {
          sender: createdUsers['admin'],
          message: 'Identity confirmed via college dean directory. 2FA secret reset successfully. Please re-pair your authenticator app on next login.',
          isAdmin: true,
        },
      ],
    },
    {
      ticketNumber: 'TICK-1005',
      subject: 'Door QR barcode scanner camera stream permission glitch on Safari iOS',
      description: 'Marshals on iPhone iOS 18 Safari reported that camera permissions were repeatedly prompting on every attendee check-in.',
      category: TicketCategory.WEBSITE_BUG,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.RESOLVED,
      club: clubs[0],
      creator: createdUsers['volunteer'],
      messages: [
        {
          sender: createdUsers['volunteer'],
          message: 'Found that WebRTC camera stream was closing after each scan rather than remaining active.',
          isAdmin: false,
        },
        {
          sender: createdUsers['admin'],
          message: 'Resolved in client v1.2.4 with persistent stream caching and continuous scanning mode.',
          isAdmin: true,
        },
      ],
    },
    {
      ticketNumber: 'TICK-1006',
      subject: 'New Student Club Charter Application: CyberSecurity & Defense Society',
      description: 'Submitted constitution, founding charter, and 45 student signatures to officially inaugurate the CyberSecurity Guild.',
      category: TicketCategory.CLUB_QUERY,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      club: clubs[5],
      creator: createdUsers['candidate2'],
      messages: [
        {
          sender: createdUsers['candidate2'],
          message: 'Faculty mentor Dr. K. Ramanathan has countersigned the charter PDF attached.',
          isAdmin: false,
        },
        {
          sender: createdUsers['admin'],
          message: 'Charter is under review by Student Affairs Committee. Scheduled for vote this Thursday.',
          isAdmin: true,
        },
      ],
    },
    {
      ticketNumber: 'TICK-1007',
      subject: 'Merchandise store refund request: Wrong hoodie size received',
      description: 'Order #CM-8492 received Size S instead of Size L ordered for Annual Gala Merchandise.',
      category: TicketCategory.PAYMENT_ISSUE,
      priority: TicketPriority.LOW,
      status: TicketStatus.RESOLVED,
      club: clubs[0],
      creator: createdUsers['member'],
      messages: [
        {
          sender: createdUsers['member'],
          message: 'Can this be swapped at the Treasurer desk on Friday?',
          isAdmin: false,
        },
        {
          sender: createdUsers['admin'],
          message: 'Exchange voucher issued. You can collect your Size L hoodie at Desk 4.',
          isAdmin: true,
        },
      ],
    },
    {
      ticketNumber: 'TICK-1008',
      subject: 'Election nominee eligibility GPA threshold clarification',
      description: 'Does the 3.0 cumulative GPA requirement apply to overall semesters or only the preceding academic year?',
      category: TicketCategory.GENERAL,
      priority: TicketPriority.LOW,
      status: TicketStatus.OPEN,
      club: clubs[0],
      creator: createdUsers['candidate1'],
      messages: [
        {
          sender: createdUsers['candidate1'],
          message: 'Checking ahead of submitting presidential nomination manifesto.',
          isAdmin: false,
        },
      ],
    },
    {
      ticketNumber: 'TICK-1009',
      subject: 'Semester Ledger reconciliation: ₹12,400 ticket receipts unallocated',
      description: 'Bank statement credits show ₹12,400 from cash desk deposits not yet paired to online ticket records.',
      category: TicketCategory.CLUB_QUERY,
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      club: clubs[0],
      creator: createdUsers['treasurer'],
      messages: [
        {
          sender: createdUsers['treasurer'],
          message: 'Need super admin audit adjustment permission to log manual counter receipts.',
          isAdmin: false,
        },
      ],
    },
    {
      ticketNumber: 'TICK-1010',
      subject: 'Volunteer task assignment push notifications delay',
      description: 'Volunteers reported a 20-minute delay in receiving SMS/push notifications when new event duties are assigned.',
      category: TicketCategory.WEBSITE_BUG,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      club: clubs[0],
      creator: createdUsers['organizer'],
      messages: [
        {
          sender: createdUsers['organizer'],
          message: 'Event logistics run on tight schedules. Push queue needs high priority.',
          isAdmin: false,
        },
      ],
    },
    {
      ticketNumber: 'TICK-1011',
      subject: 'Corporate sponsorship fund receipts tax deduction query',
      description: 'Google Developer Student Clubs sponsor grant inquiry regarding institutional 80G receipt issuance.',
      category: TicketCategory.GENERAL,
      priority: TicketPriority.LOW,
      status: TicketStatus.CLOSED,
      club: clubs[0],
      creator: createdUsers['president'],
      messages: [
        {
          sender: createdUsers['president'],
          message: 'Received response from Dean of Finance. Closing ticket as resolved.',
          isAdmin: false,
        },
      ],
    },
  ];

  for (const t of ticketData) {
    const ticket = await prisma.supportTicket.create({
      data: {
        id: uuidv7(),
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        organizationId: t.club ? t.club.id : null,
        createdById: t.creator.id,
        assignedToId: createdUsers['admin'].id,
        resolvedAt: t.status === TicketStatus.RESOLVED ? new Date() : null,
      },
    });

    for (const m of t.messages) {
      await prisma.supportMessage.create({
        data: {
          id: uuidv7(),
          ticketId: ticket.id,
          senderId: m.sender.id,
          message: m.message,
          isAdminReply: m.isAdmin,
        },
      });
    }
  }
  console.log(`🎫 Seeded ${ticketData.length} Support Tickets with complete conversation threads.`);

  // 5. Seed Elections, Nominees & Atomic 1-Time Votes
  // Election 1: Active Ongoing Election (VOTING_OPEN)
  const election1 = await prisma.election.create({
    data: {
      id: uuidv7(),
      title: '2026-2027 Executive Leadership & President Election',
      organizationId: clubs[0].id, // Tech & AI Innovators
      academicYear: '2026-2027',
      description: 'Annual democratic election to elect the Club President and Lead Executive Officer. Per-user strictly 1-time voting enforced with cryptographic ballot verification.',
      status: ElectionStatus.VOTING_OPEN,
      nominationDeadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      votingStartDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      votingEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
    },
  });

  // Candidates for Election 1
  const cand1 = await prisma.electionCandidate.create({
    data: {
      id: uuidv7(),
      electionId: election1.id,
      userId: createdUsers['candidate1'].id,
      manifesto: 'Transforming Tech Club into a national hackathon powerhouse. Introducing 24/7 AI lab compute credits, monthly industry tech talks, and 100% transparent budget tracking.',
      status: CandidateStatus.APPROVED,
      voteCount: 3,
      approvedAt: new Date(),
    },
  });

  const cand2 = await prisma.electionCandidate.create({
    data: {
      id: uuidv7(),
      electionId: election1.id,
      userId: createdUsers['candidate2'].id,
      manifesto: 'Democratizing open-source engineering. Establishing beginner bootcamps in Rust and WebGPU, plus sponsored conference travel grants for top project contributors.',
      status: CandidateStatus.APPROVED,
      voteCount: 2,
      approvedAt: new Date(),
    },
  });

  const candPending = await prisma.electionCandidate.create({
    data: {
      id: uuidv7(),
      electionId: election1.id,
      userId: createdUsers['student'].id,
      manifesto: 'Focusing on peer tutoring, weekly coding sprints, and cross-department collaboration with Design Guild.',
      status: CandidateStatus.PENDING, // Pending review to test Admin approval action
      voteCount: 0,
    },
  });

  // Cast initial 1-time votes (demonstrating unique constraint)
  await prisma.electionVote.create({
    data: {
      id: uuidv7(),
      electionId: election1.id,
      candidateId: cand1.id,
      voterId: createdUsers['voter1'].id,
    },
  });

  await prisma.electionVote.create({
    data: {
      id: uuidv7(),
      electionId: election1.id,
      candidateId: cand1.id,
      voterId: createdUsers['member'].id,
    },
  });

  await prisma.electionVote.create({
    data: {
      id: uuidv7(),
      electionId: election1.id,
      candidateId: cand1.id,
      voterId: createdUsers['volunteer'].id,
    },
  });

  await prisma.electionVote.create({
    data: {
      id: uuidv7(),
      electionId: election1.id,
      candidateId: cand2.id,
      voterId: createdUsers['voter2'].id,
    },
  });

  await prisma.electionVote.create({
    data: {
      id: uuidv7(),
      electionId: election1.id,
      candidateId: cand2.id,
      voterId: createdUsers['treasurer'].id,
    },
  });

  // Election 2: Open for Nominations (NOMINATION_OPEN)
  const election2 = await prisma.election.create({
    data: {
      id: uuidv7(),
      title: '2026-2027 Creative Design Guild Presidential Election',
      organizationId: clubs[1].id, // Creative Design Guild
      academicYear: '2026-2027',
      description: 'Nominations are officially OPEN! Any approved guild member may submit their candidature and visual design manifesto.',
      status: ElectionStatus.NOMINATION_OPEN,
      nominationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
      votingStartDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      votingEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.electionCandidate.create({
    data: {
      id: uuidv7(),
      electionId: election2.id,
      userId: createdUsers['candidate3'].id,
      manifesto: 'Pioneering generative AI in design, annual design sprint showcases, and Figma community partner credentials for every member.',
      status: CandidateStatus.APPROVED,
      voteCount: 0,
    },
  });

  // Election 3: Completed Election with Winner Promoted (COMPLETED)
  const election3 = await prisma.election.create({
    data: {
      id: uuidv7(),
      title: '2025-2026 Robotics Society Leadership Election',
      organizationId: clubs[2].id, // Robotics Society
      academicYear: '2025-2026',
      description: 'Election successfully finalized and tallied. President elected and leadership privileges granted.',
      status: ElectionStatus.COMPLETED,
      nominationDeadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      votingStartDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      votingEndDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      winnerCandidateId: createdUsers['candidate2'].id,
    },
  });

  console.log('🗳️ Seeded Elections, Candidates, and atomic 1-time voting records.');

  // 6. Seed at least 10 Notifications
  const notificationData = [
    {
      title: 'Annual Club Elections 2026-2027 Officially Announced',
      message: 'Super Administrator Prof. Alexander Vance has announced the 2026-2027 executive election calendar. All eligible students are invited to review open offices.',
      type: 'ELECTION_ANNOUNCED',
      link: '/admin/elections',
    },
    {
      title: 'Voting is Now LIVE: Tech & AI Innovators Club',
      message: 'Ballot boxes are open! Cast your atomic 1-time vote for Club President before voting closes.',
      type: 'ELECTION_ANNOUNCED',
      link: '/admin/elections',
    },
    {
      title: 'Robotics Society 2025-2026 Election Finalized',
      message: 'Election results tallied: Vikram Mehta has been elected President and promoted to leadership.',
      type: 'ELECTION_RESULT',
      link: '/admin/elections',
    },
    {
      title: 'Support Ticket #TICK-1004 Resolved',
      message: 'Two-Factor Authentication reset for Marcus Sterling successfully authorized by System Administrator.',
      type: 'SUPPORT_TICKET',
      link: '/admin/tickets',
    },
    {
      title: 'New High Priority Ticket Submitted: Auditorium Reservation',
      message: 'Ticket #TICK-1003 for Spring Tech Expo main stage reservation submitted by Chloe Chen.',
      type: 'SUPPORT_TICKET',
      link: '/admin/tickets',
    },
    {
      title: 'Club Status Update: CyberSecurity Society Pending Charter',
      message: 'Charter application submitted with 45 signatures and faculty sponsorship.',
      type: 'CLUB_UPDATE',
      link: '/admin/clubs',
    },
    {
      title: 'System Health: TiDB Cloud Database Sync Healthy',
      message: 'All 7 role partitions synchronized with zero replication lag across regional gateway.',
      type: 'SYSTEM',
      link: '/admin/dashboard',
    },
    {
      title: 'Audit Warning: Unallocated Desk Receipts',
      message: 'Treasurer Marcus Sterling reported ₹12,400 unallocated counter receipts in Ticket #TICK-1009.',
      type: 'CLUB_UPDATE',
      link: '/admin/tickets',
    },
    {
      title: 'Nomination Application Received',
      message: 'Rahul Sharma submitted presidential nomination application for Tech & AI Club. Review pending in Admin portal.',
      type: 'ELECTION_ANNOUNCED',
      link: '/admin/elections',
    },
    {
      title: 'Platform Security Audit Completed',
      message: 'Quarterly RBAC privilege check passed with 100% compliance across all 7 privilege tiers.',
      type: 'SYSTEM',
      link: '/admin/dashboard',
    },
    {
      title: 'Door QR Scanning Patch Deployed',
      message: 'Resolution for Ticket #TICK-1005 deployed with persistent camera streaming support.',
      type: 'SYSTEM',
      link: '/admin/tickets',
    },
  ];

  for (const n of notificationData) {
    await prisma.notification.create({
      data: {
        id: uuidv7(),
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link,
      },
    });
  }
  console.log(`🔔 Seeded ${notificationData.length} system notifications.`);

  // 7. Seed Treasurer Module Data (Ledger, Incomes, Expenses, Claims, Dues, Merchandise)
  const orgId = clubs[0].id;
  console.log(`🌱 Seeding Treasurer Module Data for organization: ${clubs[0].name} (${orgId})...`);

  // 7.1 Treasury Ledger
  await prisma.treasuryLedger.upsert({
    where: {
      organizationId_academicYear_semester: {
        organizationId: orgId,
        academicYear: '2025–2026',
        semester: 'Spring 2026',
      },
    },
    update: {
      openingBalance: 45000,
      totalIncome: 155300,
      totalExpenses: 99000,
      netBalance: 101300,
    },
    create: {
      id: uuidv7(),
      organizationId: orgId,
      academicYear: '2025–2026',
      semester: 'Spring 2026',
      openingBalance: 45000,
      totalIncome: 155300,
      totalExpenses: 99000,
      netBalance: 101300,
    },
  });

  // 7.2 Seed Treasury Incomes
  const incomes = [
    {
      source: 'MEMBERSHIP_DUES',
      title: 'Annual Membership Dues Collection (Batch 1)',
      payerName: 'Deepak Kumar',
      payerEmail: 'deepaka.ad24@bitsathy.ac.in',
      payerRoll: '7376222AD105',
      amount: 250,
      date: new Date('2026-04-12'),
      paymentMethod: 'UPI',
      paymentId: 'pay_UPI_992144810',
      status: 'VERIFIED',
      reference: 'MEM-SSA-2026-0042',
      categoryTag: '194 Paid Members',
    },
    {
      source: 'MEMBERSHIP_DUES',
      title: 'Annual Membership Dues Collection (Batch 2)',
      payerName: 'Ananya Deshmukh',
      payerEmail: 'ananya.d@campus.edu',
      payerRoll: '7376222CS204',
      amount: 250,
      date: new Date('2026-04-14'),
      paymentMethod: 'UPI',
      paymentId: 'pay_UPI_992145129',
      status: 'VERIFIED',
      reference: 'MEM-SSA-2026-0089',
      categoryTag: '194 Paid Members',
    },
    {
      source: 'TICKET_SALES',
      title: 'Spring Gala VIP Table Reservation #4',
      payerName: 'Siddharth Varma',
      payerEmail: 'siddharth.v@campus.edu',
      amount: 1500,
      date: new Date('2026-04-15'),
      paymentMethod: 'CARD',
      paymentId: 'pay_CARD_8829104',
      status: 'SETTLED',
      reference: 'TKT-GALA-VIP-004',
      categoryTag: 'Flagship Event',
    },
    {
      source: 'TICKET_SALES',
      title: 'Spring Gala Member Passes (Tier 1 General)',
      payerName: 'Campus Online Ticket Portal',
      payerEmail: 'ticketing@campus.edu',
      amount: 57000,
      date: new Date('2026-04-18'),
      paymentMethod: 'NET_BANKING',
      paymentId: 'pay_GATEWAY_388192',
      status: 'SETTLED',
      reference: 'GATEWAY-BATCH-388',
      categoryTag: '385 Passes Sold',
    },
    {
      source: 'MERCHANDISE',
      title: 'Odoo Classic Piqué Polo Shirt (Size L)',
      payerName: 'Deepak Kumar',
      payerEmail: 'deepaka.ad24@bitsathy.ac.in',
      amount: 699,
      date: new Date('2026-04-14'),
      paymentMethod: 'UPI',
      paymentId: 'pay_N93kLa829481',
      status: 'SETTLED',
      reference: 'ORD-SSA-1042',
      categoryTag: 'Store Sales',
    },
    {
      source: 'MERCHANDISE',
      title: 'SSA Embroidered Hoodies & Ceramic Mugs Preorders',
      payerName: 'Merchandise Preorder Portal',
      payerEmail: 'merch@campus.edu',
      amount: 33401,
      date: new Date('2026-04-16'),
      paymentMethod: 'UPI',
      paymentId: 'pay_MERCH_BULK_8821',
      status: 'SETTLED',
      reference: 'BATCH-ORD-MERCH-APR',
      categoryTag: 'Store Sales',
    },
    {
      source: 'FUNDRAISER',
      title: 'Spring Charity Bake Sale - Quad Plaza Booth Cash Float',
      payerName: 'Student Union Plaza Booth #4',
      payerEmail: 'treasury@skyline.org',
      amount: 8700,
      date: new Date('2026-04-20'),
      paymentMethod: 'CASH',
      paymentId: 'CASH-REC-BOOTH-04',
      status: 'VERIFIED',
      reference: 'BAKE-SALE-BOOTH-01',
      categoryTag: 'Charity Fundraiser',
    },
    {
      source: 'FUNDRAISER',
      title: 'Spring Charity Bake Sale - UPI Counter QR Collections',
      payerName: 'UPI Merchant Counter #1',
      payerEmail: 'treasury@skyline.org',
      amount: 5500,
      date: new Date('2026-04-21'),
      paymentMethod: 'UPI',
      paymentId: 'UPI-BATCH-BAKE-992',
      status: 'SETTLED',
      reference: 'BAKE-SALE-UPI-02',
      categoryTag: 'Charity Fundraiser',
    },
    {
      source: 'MEMBERSHIP_DUES',
      title: 'Spring General Member Dues Direct Portal Clearing',
      payerName: 'Student Affairs Clearing House',
      payerEmail: 'accounts@campus.edu',
      amount: 48000,
      date: new Date('2026-04-05'),
      paymentMethod: 'NET_BANKING',
      paymentId: 'CLG-DUES-SPR26-90',
      status: 'SETTLED',
      reference: 'MEM-BATCH-CLEAR-01',
      categoryTag: '194 Paid Members',
    },
  ];

  for (const inc of incomes) {
    await prisma.treasuryIncome.create({
      data: {
        id: uuidv7(),
        organizationId: orgId,
        ...inc,
      },
    });
  }
  console.log(`💰 Seeded ${incomes.length} Treasury Incomes.`);

  // 7.3 Seed Treasury Expenses
  const expenses = [
    {
      title: 'Main Campus Grand Auditorium Hall Booking Deposit',
      category: 'VENUE',
      amount: 32000,
      date: new Date('2026-04-10'),
      vendor: 'University Estates & Facilities Directorate',
      paymentMethod: 'BANK_TRANSFER',
      receiptNote: 'Invoice #EST-2026-0841',
      receiptInvoiceNo: 'EST-2026-0841',
      recordedBy: 'Marcus Sterling (Treasurer)',
      notes: 'Full day hire for Annual Spring Gala 2026 including green rooms and stage lighting rigs.',
    },
    {
      title: 'Spring Gala 3-Course Banquet Catering (385 Guests)',
      category: 'CATERING',
      amount: 38000,
      date: new Date('2026-04-18'),
      vendor: 'Grand Royal Gourmet Caterers Ltd.',
      paymentMethod: 'BANK_TRANSFER',
      receiptNote: 'Tax Invoice #GRC-99120',
      receiptInvoiceNo: 'GRC-99120',
      recordedBy: 'Marcus Sterling (Treasurer)',
      notes: 'Advance booking deposit & head-count catering for gala dinner attendees and guest dignitaries.',
    },
    {
      title: 'Volunteer Approved Expense Reimbursements (Batch Payout)',
      category: 'LOGISTICS',
      amount: 14200,
      date: new Date('2026-04-22'),
      vendor: 'CampusMitra Treasury IMPS Clearing',
      paymentMethod: 'BANK_TRANSFER',
      receiptNote: 'Audit Disbursement Schedule #DS-2026-04',
      receiptInvoiceNo: 'DS-2026-04',
      recordedBy: 'Marcus Sterling (Treasurer)',
      notes: 'Reimbursements for event volunteers: supplies, transportation, and setup items.',
    },
    {
      title: 'Official Club Hoodies & Embroidered Polos Batch Production',
      category: 'MERCHANDISE',
      amount: 14800,
      date: new Date('2026-04-15'),
      vendor: 'Apex Apparel & Screenprinting Co.',
      paymentMethod: 'BANK_TRANSFER',
      receiptNote: 'Bill #APX-44910',
      receiptInvoiceNo: 'APX-44910',
      recordedBy: 'Marcus Sterling (Treasurer)',
      notes: 'First batch production of 60 official hoodies and 40 polo shirts for member orders.',
    },
  ];

  for (const exp of expenses) {
    await prisma.treasuryExpense.create({
      data: {
        id: uuidv7(),
        organizationId: orgId,
        ...exp,
      },
    });
  }
  console.log(`💸 Seeded ${expenses.length} Treasury Expenses.`);

  // 7.4 Seed Reimbursement Claims
  const claims = [
    {
      volunteerName: 'Priya Sharma',
      volunteerEmail: 'priya.s@campus.edu',
      volunteerRoll: '7376221EC112',
      volunteerDepartment: 'Electronics & Communication',
      projectName: 'Spring Charity Bake Sale & Fundraiser',
      title: 'Bake sale organic butter, chocolate chips & flour packaging',
      category: 'SUPPLIES',
      amount: 1450,
      dateSubmitted: new Date('2026-04-28'),
      status: 'APPROVED',
      receiptNote: 'Supermarket Tax Invoice #9482 (Attached)',
      reviewerNotes: 'Verified against baking booth requisition. Approved for immediate batch disbursement.',
      reviewedBy: 'Marcus Sterling (Treasurer)',
      approvedAt: new Date('2026-04-29T11:30:00Z'),
      receipt: {
        merchantName: 'Metro Hypermarket & Superstore',
        merchantAddress: 'Campus Avenue, Sector 4, Coimbatore',
        merchantGSTIN: '33AABCT9982Q1Z4',
        invoiceNumber: 'INV-9482',
        invoiceDate: '2026-04-28',
        items: [
          { name: 'Organic Salted Butter (500g x 4)', quantity: 4, price: 560 },
          { name: 'Dark Chocolate Chips (1kg)', quantity: 2, price: 440 },
          { name: 'Greaseproof Bakery Bags & Labels', quantity: 1, price: 300 },
        ],
        subtotal: 1300,
        taxAmount: 150,
        totalAmount: 1450,
        paymentProofType: 'UPI Tax Receipt Slip',
        transactionRef: 'UPI/992481024/METRO',
      },
    },
    {
      volunteerName: 'Alex Rivera',
      volunteerEmail: 'alex.r@campus.edu',
      volunteerRoll: '7376221ME105',
      volunteerDepartment: 'Mechanical Engineering',
      projectName: 'Spring Charity Bake Sale & Fundraiser',
      title: 'Lamination sheets & mounting tape for payment QR standees',
      category: 'SUPPLIES',
      amount: 320,
      dateSubmitted: new Date('2026-04-29'),
      status: 'REIMBURSED',
      receiptNote: 'Campus Stationery Store Receipt #118',
      reviewerNotes: 'Reimbursed via direct bank transfer #IMPS-938210.',
      reviewedBy: 'Marcus Sterling (Treasurer)',
      approvedAt: new Date('2026-04-29T16:45:00Z'),
      payoutDetails: {
        payoutDate: '2026-04-30 14:20',
        payoutMethod: 'IMPS',
        transactionRef: 'IMPS-938210',
        disbursedBy: 'Marcus Sterling (Treasurer)',
        accountReference: 'HDFC Bank ending in **4821',
      },
      receipt: {
        merchantName: 'Campus Book & Stationery Depot',
        merchantAddress: 'Student Union Building, Ground Floor',
        merchantGSTIN: '33AAECS1102P1Z8',
        invoiceNumber: 'RCPT-118',
        invoiceDate: '2026-04-29',
        items: [
          { name: 'Thermal Lamination Pouches (Pack of 20)', quantity: 1, price: 220 },
          { name: 'Heavy-duty Double Sided Tape', quantity: 1, price: 100 },
        ],
        subtotal: 300,
        taxAmount: 20,
        totalAmount: 320,
        paymentProofType: 'POS Terminal Cash Receipt',
        transactionRef: 'POS-TXN-118-CAMPUS',
      },
    },
    {
      volunteerName: 'Deepak Kumar',
      volunteerEmail: 'deepaka.ad24@bitsathy.ac.in',
      volunteerRoll: '7376222AD105',
      volunteerDepartment: 'Artificial Intelligence & Data Science',
      projectName: 'Skyline Annual Spring Gala 2026',
      title: 'Sound cable adapters & extra heavy-duty microphone batteries',
      category: 'EQUIPMENT',
      amount: 850,
      dateSubmitted: new Date('2026-05-01'),
      status: 'PENDING',
      receiptNote: 'City Sound Equipment receipt slip #482',
      receipt: {
        merchantName: 'City Sound & Electronics Depot',
        merchantAddress: '88 Trunk Road, Cross-Cut, Gandhipuram',
        merchantGSTIN: '33AALCS4492K1Z0',
        invoiceNumber: 'INV-482',
        invoiceDate: '2026-05-01',
        items: [
          { name: 'Gold-plated 3.5mm to 6.35mm Stereo Cable', quantity: 2, price: 450 },
          { name: 'Duracell Rechargeable 9V Microphone Batteries', quantity: 2, price: 350 },
        ],
        subtotal: 800,
        taxAmount: 50,
        totalAmount: 850,
        paymentProofType: 'Google Pay UPI Transaction Snapshot',
        transactionRef: 'GPay-UPI-99482104-CITYSOUND',
      },
    },
    {
      volunteerName: 'Sneha Patel',
      volunteerEmail: 'sneha.p@campus.edu',
      volunteerRoll: '7376222CS188',
      volunteerDepartment: 'Computer Science',
      projectName: 'Spring Charity Bake Sale & Fundraiser',
      title: 'Bake sale booth sanitizers & compostable nitrile food gloves',
      category: 'SUPPLIES',
      amount: 420,
      dateSubmitted: new Date('2026-05-02'),
      status: 'PENDING',
      receiptNote: 'Metro Wholesale Bill #6621',
      receipt: {
        merchantName: 'Metro Healthcare & Supplies',
        merchantAddress: 'University Campus Pharmacy Block',
        merchantGSTIN: '33BBXCS8810K1Z9',
        invoiceNumber: 'INV-6621',
        invoiceDate: '2026-05-02',
        items: [
          { name: 'Nitrile Food Grade Gloves (Box of 100)', quantity: 1, price: 280 },
          { name: 'Alcohol Sanitizer Gel (500ml)', quantity: 2, price: 140 },
        ],
        subtotal: 395,
        taxAmount: 25,
        totalAmount: 420,
        paymentProofType: 'UPI Receipt Verified',
        transactionRef: 'UPI-MTR-6621-APP',
      },
    },
    {
      volunteerName: 'Rohan Mehra',
      volunteerEmail: 'rohan.m@campus.edu',
      volunteerRoll: '7376221EE142',
      volunteerDepartment: 'Electrical & Electronics',
      projectName: 'Skyline Annual Spring Gala 2026',
      title: 'Private cab fare for off-campus guest speaker transport',
      category: 'LOGISTICS',
      amount: 650,
      dateSubmitted: new Date('2026-04-26'),
      status: 'REJECTED',
      receiptNote: 'Ride Hailing Digital Invoice #UB-9941',
      rejectionReason:
        'Club travel guidelines state that student vehicle transport must use pre-approved University fleet or public transit passes. Non-preapproved private rides cannot be disbursed from student dues.',
      reviewedBy: 'Marcus Sterling (Treasurer)',
      rejectedAt: new Date('2026-04-27T10:15:00Z'),
      receipt: {
        merchantName: 'City Cab Fleet Services',
        merchantAddress: 'Airport Road, Coimbatore',
        merchantGSTIN: '33AAACB9901M1Z5',
        invoiceNumber: 'UB-9941',
        invoiceDate: '2026-04-26',
        items: [{ name: 'Point-to-Point Airport Transfer Trip', quantity: 1, price: 650 }],
        subtotal: 619,
        taxAmount: 31,
        totalAmount: 650,
        paymentProofType: 'Credit Card Digital Receipt',
        transactionRef: 'CC-TXN-UB9941-RIDE',
      },
    },
  ];

  for (const clm of claims) {
    await prisma.reimbursementClaim.create({
      data: {
        id: uuidv7(),
        organizationId: orgId,
        ...clm,
      },
    });
  }
  console.log(`📑 Seeded ${claims.length} Reimbursement Claims.`);

  // 7.5 Seed Semester Reports
  const reports = [
    {
      semester: 'Spring 2026',
      academicYear: '2025–2026',
      status: 'ACTIVE_INTERIM',
      openingBalance: 45000,
      incomeBreakdown: {
        membershipDues: 48500,
        ticketSales: 58500,
        merchandise: 34100,
        fundraisers: 14200,
        sponsorships: 0,
        totalIncome: 155300,
      },
      expenseBreakdown: {
        venueBooking: 32000,
        galaCatering: 38000,
        volunteerReimbursements: 14200,
        merchandisePrinting: 14800,
        equipmentAndSound: 0,
        suppliesAndDecor: 0,
        totalExpenses: 99000,
      },
      netOperatingSurplus: 56300,
      netClosingBalance: 101300,
      auditedBy: 'Marcus Sterling (Treasurer)',
      facultyAdvisor: 'Dr. S. Ranganathan (Dean of Student Affairs)',
      certifiedDate: '2026-05-02',
      auditHash: 'SHA256-TREAS-AUDIT-SPR26-98104B',
    },
    {
      semester: 'Fall 2025',
      academicYear: '2025–2026',
      status: 'AUDITED_FINAL',
      openingBalance: 32000,
      incomeBreakdown: {
        membershipDues: 44000,
        ticketSales: 48000,
        merchandise: 28500,
        fundraisers: 12000,
        sponsorships: 15000,
        totalIncome: 147500,
      },
      expenseBreakdown: {
        venueBooking: 28000,
        galaCatering: 42000,
        volunteerReimbursements: 11500,
        merchandisePrinting: 12000,
        equipmentAndSound: 18000,
        suppliesAndDecor: 23000,
        totalExpenses: 134500,
      },
      netOperatingSurplus: 13000,
      netClosingBalance: 45000,
      auditedBy: 'Marcus Sterling (Treasurer)',
      facultyAdvisor: 'Dr. S. Ranganathan (Dean of Student Affairs)',
      certifiedDate: '2025-12-18',
      auditHash: 'SHA256-TREAS-AUDIT-FALL25-44912A',
    },
    {
      semester: 'Spring 2025',
      academicYear: '2024–2025',
      status: 'AUDITED_FINAL',
      openingBalance: 25000,
      incomeBreakdown: {
        membershipDues: 38000,
        ticketSales: 42000,
        merchandise: 22000,
        fundraisers: 10000,
        sponsorships: 10000,
        totalIncome: 122000,
      },
      expenseBreakdown: {
        venueBooking: 24000,
        galaCatering: 35000,
        volunteerReimbursements: 9500,
        merchandisePrinting: 11500,
        equipmentAndSound: 15000,
        suppliesAndDecor: 20000,
        totalExpenses: 115000,
      },
      netOperatingSurplus: 7000,
      netClosingBalance: 32000,
      auditedBy: 'Karthik Raja (Former Treasurer)',
      facultyAdvisor: 'Dr. M. Lakshmi (Student Affairs)',
      certifiedDate: '2025-05-15',
      auditHash: 'SHA256-TREAS-AUDIT-SPR25-11029F',
    },
  ];

  for (const rep of reports) {
    await prisma.semesterReport.create({
      data: {
        id: uuidv7(),
        organizationId: orgId,
        ...rep,
      },
    });
  }
  console.log(`📊 Seeded ${reports.length} Semester Reports.`);

  // 7.6 Seed Treasury Payment Records
  const paymentRecords = [
    {
      timestamp: new Date('2026-04-30T14:20:00Z'),
      type: 'OUTFLOW',
      sourceCategory: 'Volunteer Reimbursement',
      partyName: 'Alex Rivera',
      partyDetails: 'HDFC Bank ending **4821',
      amount: 320,
      method: 'IMPS',
      referenceId: 'IMPS-938210',
      status: 'DISBURSED',
      verifiedHash: 'SHA256-IMPS-938210-OK',
    },
    {
      timestamp: new Date('2026-04-22T10:15:00Z'),
      type: 'OUTFLOW',
      sourceCategory: 'Logistics',
      partyName: 'CampusMitra Treasury Batch',
      partyDetails: 'State Bank of India Corporate Account',
      amount: 14200,
      method: 'IMPS',
      referenceId: 'DS-2026-04',
      status: 'DISBURSED',
      verifiedHash: 'SHA256-DS2026-4491-VER',
    },
    {
      timestamp: new Date('2026-04-21T16:30:00Z'),
      type: 'INFLOW',
      sourceCategory: 'Fundraiser',
      partyName: 'Bake Sale UPI Counter #1',
      partyDetails: 'Razorpay Campus UPI Gateway',
      amount: 5500,
      method: 'UPI',
      referenceId: 'UPI-BATCH-BAKE-992',
      status: 'SETTLED',
      verifiedHash: 'SHA256-UPI-992-SETTLED',
    },
    {
      timestamp: new Date('2026-04-20T18:00:00Z'),
      type: 'INFLOW',
      sourceCategory: 'Fundraiser',
      partyName: 'Plaza Booth #4 Cash Handover',
      partyDetails: 'Treasury Safe Locker Deposit Box',
      amount: 8700,
      method: 'CASH',
      referenceId: 'CASH-REC-BOOTH-04',
      status: 'CLEARED',
      verifiedHash: 'SHA256-CASH-REC-04-OK',
    },
    {
      timestamp: new Date('2026-04-18T12:00:00Z'),
      type: 'OUTFLOW',
      sourceCategory: 'Catering',
      partyName: 'Grand Royal Gourmet Caterers Ltd.',
      partyDetails: 'Axis Bank RTGS Ref #AX99120',
      amount: 38000,
      method: 'IMPS',
      referenceId: 'GRC-99120',
      status: 'DISBURSED',
      verifiedHash: 'SHA256-GRC99120-RTGS',
    },
    {
      timestamp: new Date('2026-04-18T09:30:00Z'),
      type: 'INFLOW',
      sourceCategory: 'Ticket Sales',
      partyName: 'Campus Online Ticket Portal Batch',
      partyDetails: 'Gateway Net Banking Settlement',
      amount: 57000,
      method: 'NET_BANKING',
      referenceId: 'GATEWAY-BATCH-388',
      status: 'SETTLED',
      verifiedHash: 'SHA256-TKT-SETTLE-388',
    },
    {
      timestamp: new Date('2026-04-16T17:40:00Z'),
      type: 'INFLOW',
      sourceCategory: 'Merchandise',
      partyName: 'Merchandise Preorder Portal',
      partyDetails: 'UPI Bulk Collections',
      amount: 33401,
      method: 'UPI',
      referenceId: 'BATCH-ORD-MERCH-APR',
      status: 'SETTLED',
      verifiedHash: 'SHA256-MERCH-33401-OK',
    },
    {
      timestamp: new Date('2026-04-15T15:20:00Z'),
      type: 'OUTFLOW',
      sourceCategory: 'Merchandise Production',
      partyName: 'Apex Apparel & Screenprinting Co.',
      partyDetails: 'Kotak Bank IMPS Direct',
      amount: 14800,
      method: 'IMPS',
      referenceId: 'APX-44910',
      status: 'DISBURSED',
      verifiedHash: 'SHA256-APX44910-DISB',
    },
    {
      timestamp: new Date('2026-04-14T11:24:00Z'),
      type: 'INFLOW',
      sourceCategory: 'Merchandise',
      partyName: 'Deepak Kumar',
      partyDetails: 'UPI / deepaka.ad24@bitsathy.ac.in',
      amount: 699,
      method: 'UPI',
      referenceId: 'ORD-SSA-1042',
      status: 'SETTLED',
      verifiedHash: 'SHA256-ORD-1042-VER',
    },
    {
      timestamp: new Date('2026-04-10T14:00:00Z'),
      type: 'OUTFLOW',
      sourceCategory: 'Venue Booking',
      partyName: 'University Estates & Facilities',
      partyDetails: 'Internal Institutional Account #UNIV-9921',
      amount: 32000,
      method: 'NET_BANKING',
      referenceId: 'EST-2026-0841',
      status: 'DISBURSED',
      verifiedHash: 'SHA256-EST-0841-DISB',
    },
  ];

  for (const pay of paymentRecords) {
    await prisma.treasuryPaymentRecord.create({
      data: {
        id: uuidv7(),
        organizationId: orgId,
        ...pay,
      },
    });
  }
  console.log(`💳 Seeded ${paymentRecords.length} Payment Transaction Records.`);

  // 7.7 Seed Treasury Audit Logs
  const auditLogs = [
    {
      timestamp: new Date('2026-04-30T14:20:00Z'),
      action: 'PAYOUT_RECORDED',
      actor: 'Marcus Sterling (Treasurer)',
      details: 'Disbursed reimbursement payout of ₹320 for Claim #CLM-002 (Alex Rivera) via IMPS Ref #IMPS-938210.',
      amount: 320,
      referenceId: 'CLM-002',
      verificationHash: 'SHA256-AUD-PAYOUT-CLM002-320',
    },
    {
      timestamp: new Date('2026-04-29T16:45:00Z'),
      action: 'CLAIM_APPROVED',
      actor: 'Marcus Sterling (Treasurer)',
      details: 'Approved reimbursement Claim #CLM-002 (Lamination sheets) submitted by Alex Rivera after receipt audit.',
      amount: 320,
      referenceId: 'CLM-002',
      verificationHash: 'SHA256-AUD-APPR-CLM002',
    },
    {
      timestamp: new Date('2026-04-29T11:30:00Z'),
      action: 'CLAIM_APPROVED',
      actor: 'Marcus Sterling (Treasurer)',
      details: 'Approved reimbursement Claim #CLM-001 (Bake sale butter & packaging) submitted by Priya Sharma for ₹1,450.',
      amount: 1450,
      referenceId: 'CLM-001',
      verificationHash: 'SHA256-AUD-APPR-CLM001',
    },
    {
      timestamp: new Date('2026-04-27T10:15:00Z'),
      action: 'CLAIM_REJECTED',
      actor: 'Marcus Sterling (Treasurer)',
      details: 'Rejected Claim #CLM-005 (Cab ride fare ₹650). Reason: Non-compliant with university fleet travel policy.',
      amount: 650,
      referenceId: 'CLM-005',
      verificationHash: 'SHA256-AUD-REJ-CLM005',
    },
    {
      timestamp: new Date('2026-04-21T17:00:00Z'),
      action: 'INCOME_LOGGED',
      actor: 'Marcus Sterling (Treasurer)',
      details: 'Verified and reconciled Bake Sale QR payment collections of ₹5,500 into club treasury ledger.',
      amount: 5500,
      referenceId: 'UPI-BATCH-BAKE-992',
      verificationHash: 'SHA256-AUD-INC-BAKE-UPI',
    },
    {
      timestamp: new Date('2026-04-20T18:30:00Z'),
      action: 'INCOME_LOGGED',
      actor: 'Marcus Sterling (Treasurer)',
      details: 'Received physical cash float handover of ₹8,700 from Quad Plaza Booth #4; signed and locked in safe.',
      amount: 8700,
      referenceId: 'CASH-REC-BOOTH-04',
      verificationHash: 'SHA256-AUD-INC-CASH-BOOTH',
    },
    {
      timestamp: new Date('2026-04-18T12:15:00Z'),
      action: 'EXPENSE_RECORDED',
      actor: 'Marcus Sterling (Treasurer)',
      details: 'Recorded catering outflow of ₹38,000 to Grand Royal Gourmet Caterers under Spring Gala budget.',
      amount: 38000,
      referenceId: 'GRC-99120',
      verificationHash: 'SHA256-AUD-EXP-CATERING-38K',
    },
    {
      timestamp: new Date('2026-04-10T14:30:00Z'),
      action: 'EXPENSE_RECORDED',
      actor: 'Marcus Sterling (Treasurer)',
      details: 'Recorded venue hire expense of ₹32,000 to University Estates for Grand Auditorium reservation.',
      amount: 32000,
      referenceId: 'EST-2026-0841',
      verificationHash: 'SHA256-AUD-EXP-VENUE-32K',
    },
  ];

  for (const log of auditLogs) {
    await prisma.treasuryAuditLog.create({
      data: {
        id: uuidv7(),
        organizationId: orgId,
        ...log,
      },
    });
  }
  console.log(`🛡️ Seeded ${auditLogs.length} Treasury Audit Logs.`);

  // 7.8 Seed Dues Records
  const dues = [
    {
      studentId: 'SSA-2026-0001',
      name: 'THIRUMURUGAN K',
      email: 'thirumurugank.al24@bitsathy.ac.in',
      phone: '+91 98421 11029',
      rollNumber: '7376222AL101',
      department: 'Artificial Intelligence & DS',
      yearOfStudy: '2nd Year',
      membershipStatus: 'ACTIVE',
      clubRole: 'CORE_COMMITTEE',
      academicYear: '2025–2026',
      annualFee: 250,
      amountPaid: 250,
      outstandingBalance: 0,
      paymentStatus: 'PAID',
      lastPaymentDate: '2026-04-10',
      paymentMethod: 'UPI',
      transactionRef: 'UPI-NMIT-99182341',
      dueDate: '2026-05-31',
      paymentHistory: [
        {
          id: 'pay-d-001',
          amount: 250,
          date: '2026-04-10',
          method: 'UPI',
          reference: 'UPI-NMIT-99182341',
          notes: 'Annual Membership fee payment verified via GPay',
          recordedBy: 'Marcus Sterling (Treasurer)',
        },
      ],
    },
    {
      studentId: 'SSA-2026-0042',
      name: 'Deepak Kumar',
      email: 'deepaka.ad24@bitsathy.ac.in',
      phone: '+91 94432 88120',
      rollNumber: '7376222AD105',
      department: 'Computer Science & Engineering',
      yearOfStudy: '3rd Year',
      membershipStatus: 'ACTIVE',
      clubRole: 'CORE_COMMITTEE',
      academicYear: '2025–2026',
      annualFee: 250,
      amountPaid: 250,
      outstandingBalance: 0,
      paymentStatus: 'PAID',
      lastPaymentDate: '2026-04-12',
      paymentMethod: 'UPI',
      transactionRef: 'UPI-NMIT-99214481',
      dueDate: '2026-05-31',
      paymentHistory: [
        {
          id: 'pay-d-002',
          amount: 250,
          date: '2026-04-12',
          method: 'UPI',
          reference: 'UPI-NMIT-99214481',
          notes: 'Batch 1 dues settlement',
          recordedBy: 'Marcus Sterling (Treasurer)',
        },
      ],
    },
    {
      studentId: 'SSA-2026-0002',
      name: 'Hemanth S V',
      email: 'hemanthsv.al24@bitsathy.ac.in',
      phone: '+91 97892 44102',
      rollNumber: '7376222AL115',
      department: 'Artificial Intelligence & DS',
      yearOfStudy: '2nd Year',
      membershipStatus: 'ACTIVE',
      clubRole: 'VOLUNTEER',
      academicYear: '2025–2026',
      annualFee: 250,
      amountPaid: 250,
      outstandingBalance: 0,
      paymentStatus: 'PAID',
      lastPaymentDate: '2026-04-09',
      paymentMethod: 'UPI',
      transactionRef: 'UPI-NMIT-88391024',
      dueDate: '2026-05-31',
      paymentHistory: [
        {
          id: 'pay-d-003',
          amount: 250,
          date: '2026-04-09',
          method: 'UPI',
          reference: 'UPI-NMIT-88391024',
          notes: 'Annual Membership fee payment verified via PhonePe',
          recordedBy: 'Marcus Sterling (Treasurer)',
        },
      ],
    },
    {
      studentId: 'SSA-2026-0003',
      name: 'Rithish S',
      email: 'rithishs.cs24@bitsathy.ac.in',
      phone: '+91 95512 33901',
      rollNumber: '7376222CS210',
      department: 'Computer Science & Engineering',
      yearOfStudy: '2nd Year',
      membershipStatus: 'ACTIVE',
      clubRole: 'VOLUNTEER',
      academicYear: '2025–2026',
      annualFee: 250,
      amountPaid: 250,
      outstandingBalance: 0,
      paymentStatus: 'PAID',
      lastPaymentDate: '2026-04-11',
      paymentMethod: 'UPI',
      transactionRef: 'UPI-NMIT-77189023',
      dueDate: '2026-05-31',
      paymentHistory: [
        {
          id: 'pay-d-004',
          amount: 250,
          date: '2026-04-11',
          method: 'UPI',
          reference: 'UPI-NMIT-77189023',
          notes: 'Annual Membership fee payment verified via Paytm',
          recordedBy: 'Marcus Sterling (Treasurer)',
        },
      ],
    },
    {
      studentId: 'SSA-2026-0043',
      name: 'Ananya Deshmukh',
      email: 'ananya.d@campus.edu',
      phone: '+91 98840 22319',
      rollNumber: '7376222CS204',
      department: 'Computer Science & Engineering',
      yearOfStudy: '3rd Year',
      membershipStatus: 'ACTIVE',
      clubRole: 'MEMBER',
      academicYear: '2025–2026',
      annualFee: 250,
      amountPaid: 250,
      outstandingBalance: 0,
      paymentStatus: 'PAID',
      lastPaymentDate: '2026-04-14',
      paymentMethod: 'UPI',
      transactionRef: 'pay_UPI_992145129',
      dueDate: '2026-05-31',
      paymentHistory: [
        {
          id: 'pay-d-005',
          amount: 250,
          date: '2026-04-14',
          method: 'UPI',
          reference: 'pay_UPI_992145129',
          notes: 'Batch 2 dues settlement',
          recordedBy: 'Marcus Sterling (Treasurer)',
        },
      ],
    },
    {
      studentId: 'SSA-2026-0089',
      name: 'Karthik Raja',
      email: 'karthik.r@campus.edu',
      phone: '+91 99401 55672',
      rollNumber: '7376221EC145',
      department: 'Electronics & Communication',
      yearOfStudy: '4th Year',
      membershipStatus: 'PENDING',
      clubRole: 'MEMBER',
      academicYear: '2025–2026',
      annualFee: 250,
      amountPaid: 0,
      outstandingBalance: 250,
      paymentStatus: 'OVERDUE',
      dueDate: '2026-04-30',
      notes: 'Renewal overdue. Alert sent on April 28.',
      paymentHistory: [],
    },
  ];

  for (const d of dues) {
    await prisma.duesRecord.create({
      data: {
        id: uuidv7(),
        organizationId: orgId,
        ...d,
      },
    });
  }
  console.log(`📋 Seeded ${dues.length} Student Dues Records.`);

  // 7.9 Seed Merchandise Products
  const merchProducts = [
    {
      name: 'Odoo Classic Piqué Polo Shirt',
      description: '100% combed cotton breathable piqué fabric with embroidered Odoo crest, ribbed collar, and tailored cuffs.',
      category: 'Apparel & Uniforms',
      image: 'https://odoocdn.com/web/image/product.image/10/image_1024/Odoo%20Short%20Sleeve%20Polo?unique=d5e3797',
      sellingPrice: 1199,
      memberPrice: 699,
      costPrice: 420,
      sku: 'SKU-SSA-POLO-2026',
      status: 'ACTIVE',
      lowStockThreshold: 10,
      variants: [
        { size: 'S', sku: 'POLO-S', onHandStock: 18, reservedStock: 2, soldStock: 14 },
        { size: 'M', sku: 'POLO-M', onHandStock: 25, reservedStock: 5, soldStock: 28 },
        { size: 'L', sku: 'POLO-L', onHandStock: 14, reservedStock: 4, soldStock: 22 },
        { size: 'XL', sku: 'POLO-XL', onHandStock: 10, reservedStock: 1, soldStock: 8 },
        { size: '2XL', sku: 'POLO-2XL', onHandStock: 5, reservedStock: 0, soldStock: 3 },
      ],
    },
    {
      name: 'Odoo Official Ceramic Mug',
      description: 'High-gloss 11oz ceramic mug with vivid Odoo emblem print. Dishwasher and microwave safe.',
      category: 'Drinkware & Goodies',
      image: 'https://odoocdn.com/web/image/product.product/20563/image_1024/Mug?unique=02e5ff9',
      sellingPrice: 450,
      memberPrice: 250,
      costPrice: 160,
      sku: 'SKU-SSA-MUG-2026',
      status: 'ACTIVE',
      lowStockThreshold: 15,
      variants: [
        { size: '11 oz', sku: 'MUG-11OZ', onHandStock: 45, reservedStock: 8, soldStock: 62 },
        { size: '15 oz', sku: 'MUG-15OZ', onHandStock: 20, reservedStock: 3, soldStock: 25 },
      ],
    },
    {
      name: 'Odoo Signature Low-Top Sneakers',
      description: 'Comfortable and stylish low-top sneakers in signature purple & white colorway with durable vulcanized rubber sole.',
      category: 'Footwear & Lifestyle',
      image: 'https://odoocdn.com/web/image/product.image/11/image_1024/Odoo%20Shoes?unique=9b6c356',
      sellingPrice: 2999,
      memberPrice: 1899,
      costPrice: 1250,
      sku: 'SKU-SSA-SHOE-2026',
      status: 'ACTIVE',
      lowStockThreshold: 8,
      variants: [
        { size: 'EU 39', sku: 'SHOE-39', onHandStock: 8, reservedStock: 1, soldStock: 6 },
        { size: 'EU 40', sku: 'SHOE-40', onHandStock: 12, reservedStock: 2, soldStock: 14 },
        { size: 'EU 41', sku: 'SHOE-41', onHandStock: 15, reservedStock: 4, soldStock: 18 },
        { size: 'EU 42', sku: 'SHOE-42', onHandStock: 10, reservedStock: 3, soldStock: 12 },
        { size: 'EU 43', sku: 'SHOE-43', onHandStock: 6, reservedStock: 1, soldStock: 5 },
      ],
    },
    {
      name: 'Scale-Up! The Business Game',
      description: 'Learn real-world business & ERP management with 36 interactive business challenge cards across 4 real startup case studies.',
      category: 'Educational & Board Games',
      image: 'https://odoocdn.com/web/image/product.product/107155/image_1024/%5BSCUD%5D%20Scale-Up%21%20Business%20Game%20%5BDE%5D?unique=bce70b4',
      sellingPrice: 1499,
      memberPrice: 899,
      costPrice: 550,
      sku: 'SKU-SSA-GAME-2026',
      status: 'ACTIVE',
      lowStockThreshold: 10,
      variants: [
        { size: 'Board Box', sku: 'GAME-STD', onHandStock: 22, reservedStock: 2, soldStock: 18 },
        { size: 'Deluxe Pack', sku: 'GAME-DLX', onHandStock: 11, reservedStock: 1, soldStock: 9 },
      ],
    },
  ];

  const seededMerch: any[] = [];
  for (const m of merchProducts) {
    const prod = await prisma.merchProduct.create({
      data: {
        id: uuidv7(),
        organizationId: orgId,
        ...m,
      },
    });
    seededMerch.push(prod);
  }
  console.log(`🛍️ Seeded ${merchProducts.length} Merchandise Products.`);

  // 7.10 Seed Student Merch Orders
  const orders = [
    {
      orderNumber: 'ORD-SSA-1042',
      orderDate: '2026-04-14',
      studentName: 'Deepak Kumar',
      studentId: 'SSA-2026-0042',
      studentEmail: 'deepaka.ad24@bitsathy.ac.in',
      studentPhone: '+91 94432 88120',
      department: 'Computer Science & Engineering',
      productId: seededMerch[0].id,
      productName: 'Odoo Classic Piqué Polo Shirt',
      variantSize: 'L',
      quantity: 1,
      unitPrice: 699,
      orderTotal: 699,
      amountPaid: 699,
      outstandingBalance: 0,
      paymentStatus: 'PAID',
      fulfillmentStatus: 'COMPLETED',
      paymentMethod: 'UPI',
      transactionRef: 'pay_N93kLa829481',
      expectedPickupDate: '2026-04-16',
      handoverAt: '2026-04-16 16:30',
      handoverBy: 'Marcus Sterling (Treasurer)',
      notes: 'Handed over at Student Union Desk B',
    },
    {
      orderNumber: 'ORD-SSA-1043',
      orderDate: '2026-04-16',
      studentName: 'THIRUMURUGAN K',
      studentId: 'SSA-2026-0001',
      studentEmail: 'thirumurugank.al24@bitsathy.ac.in',
      studentPhone: '+91 98421 11029',
      department: 'Artificial Intelligence & DS',
      productId: seededMerch[1].id,
      productName: 'Odoo Official Ceramic Mug',
      variantSize: '11 oz',
      quantity: 2,
      unitPrice: 250,
      orderTotal: 500,
      amountPaid: 500,
      outstandingBalance: 0,
      paymentStatus: 'PAID',
      fulfillmentStatus: 'READY_FOR_PICKUP',
      paymentMethod: 'UPI',
      transactionRef: 'UPI-MUG-9982104',
      expectedPickupDate: '2026-04-22',
      notes: 'Packaged in bubblewrap box ready at Treasury Desk',
    },
    {
      orderNumber: 'ORD-SSA-1044',
      orderDate: '2026-04-18',
      studentName: 'Hemanth S V',
      studentId: 'SSA-2026-0002',
      studentEmail: 'hemanthsv.al24@bitsathy.ac.in',
      studentPhone: '+91 97892 44102',
      department: 'Artificial Intelligence & DS',
      productId: seededMerch[0].id,
      productName: 'Odoo Classic Piqué Polo Shirt',
      variantSize: 'M',
      quantity: 1,
      unitPrice: 699,
      orderTotal: 699,
      amountPaid: 699,
      outstandingBalance: 0,
      paymentStatus: 'PAID',
      fulfillmentStatus: 'PROCESSING',
      paymentMethod: 'UPI',
      transactionRef: 'UPI-POLO-882194',
      expectedPickupDate: '2026-04-24',
      notes: 'Awaiting shipment fulfillment batch',
    },
  ];

  for (const ord of orders) {
    await prisma.studentMerchOrder.create({
      data: {
        id: uuidv7(),
        organizationId: orgId,
        ...ord,
      },
    });
  }
  console.log(`📦 Seeded ${orders.length} Student Merchandise Orders.`);

  console.log('🎉 Database seeding with 10+ records across all models completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
