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

  console.log('🎉 Database seeding with 10+ records across all models completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
