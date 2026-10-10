import { PrismaClient, ApplicationStatus, RoleType } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding President Module Data (Club Profile, Announcements, Memberships)...');

  // 1. Find president user
  const president = await prisma.user.findUnique({
    where: { username: 'president' },
    include: {
      roles: {
        where: { role: RoleType.PRESIDENT },
      },
    },
  });

  if (!president) {
    console.error('❌ President user not found. Ensure primary seed has run.');
    return;
  }

  const presRole = president.roles[0];
  let clubId = presRole?.organizationId;

  if (!clubId) {
    const techClub = await prisma.organization.findFirst({
      where: { slug: 'tech-innovators' },
    });
    if (!techClub) {
      console.error('❌ Tech Club not found.');
      return;
    }
    clubId = techClub.id;
    // ensure president has role
    await prisma.userRole.create({
      data: {
        id: uuidv7(),
        userId: president.id,
        role: RoleType.PRESIDENT,
        organizationId: clubId,
      },
    });
  }

  // 2. Update Club Profile details
  await prisma.organization.update({
    where: { id: clubId },
    data: {
      description: 'Premier collegiate hub for artificial intelligence, machine learning, and modern web application development. Hosting campus hackathons, research symposiums, and hands-on workshops.',
      category: 'Technology & AI',
      membershipFee: 50000, // ₹500 in paise
      websiteUrl: 'https://techinnovators.nmit.edu',
      instagramUrl: 'https://instagram.com/tech_innovators_nmit',
      linkedinUrl: 'https://linkedin.com/company/tech-innovators-club',
      logoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=200&fit=crop&crop=faces',
      coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop',
    },
  });
  console.log('🏢 Updated club profile and membership fee (₹500).');

  // 3. Clear existing announcements for this club to avoid duplicate spam
  await prisma.announcement.deleteMany({
    where: { organizationId: clubId },
  });

  // Seed Announcements
  const announcements = [
    {
      title: '🚀 Welcome to Spring 2026 Semester! 48-Hour Hackathon Launch',
      content: 'We are thrilled to kick off the new academic semester! Registration for Hack-AI-Thon 2026 opens this Friday. Get your teams of 2-4 ready. Top 3 teams win cash grants of ₹50,000, incubation support, and direct internship interviews with campus partner startups.',
      category: 'EVENT',
      isPinned: true,
      isMemberOnly: false,
    },
    {
      title: '📋 Executive Committee & Core Members General Body Meeting (GBM #1)',
      content: 'First semester GBM is scheduled for Wednesday at 5:30 PM in Seminar Hall 2 (Main Academic Block). Agenda: Budget allocation, recruitment drive status, upcoming guest lectures by Google DeepMind researchers, and lab server rack maintenance.',
      category: 'MEETING',
      isPinned: false,
      isMemberOnly: true,
    },
    {
      title: '⚡ GPU Cluster & AI Research Lab Access Permissions',
      content: 'Club members can now apply for compute tokens on the department NVIDIA A100 server rack for capstone projects, LLM fine-tuning, and CV benchmarking. Please submit your project abstract before the 20th of this month to the Lab Coordinator.',
      category: 'GENERAL',
      isPinned: true,
      isMemberOnly: true,
    },
    {
      title: '📢 Urgent: Volunteer Shift Confirmation for Induction Orientation',
      content: 'All appointed volunteers must check in at the Student Center booth by 8:30 AM on Monday. T-shirts, attendee lanyards, and QR registration scanners will be distributed by Chloe Chen (Lead Event Organizer).',
      category: 'URGENT',
      isPinned: false,
      isMemberOnly: true,
    },
    {
      title: '🎓 Open Workshop: Mastering Vector Databases & RAG Architecture',
      content: 'Hands-on session on LangChain, Pinecone, and Ollama local models on Saturday 10:00 AM. Free for all club members, nominal pass ₹99 for non-members. Bring your own laptops with Docker installed.',
      category: 'EVENT',
      isPinned: false,
      isMemberOnly: false,
    },
  ];

  for (const a of announcements) {
    await prisma.announcement.create({
      data: {
        id: uuidv7(),
        organizationId: clubId,
        authorId: president.id,
        title: a.title,
        content: a.content,
        category: a.category,
        isPinned: a.isPinned,
        isMemberOnly: a.isMemberOnly,
      },
    });
  }
  console.log(`📢 Seeded ${announcements.length} announcements.`);

  // 4. Seed Membership Applications
  // Find or create student users to apply
  const applicantsData = [
    {
      username: 'rahul_s',
      fullName: 'Rahul Sharma',
      email: 'rahul.s@nmit.edu',
      department: 'Computer Science & Engineering',
      semester: 'Semester 4',
      sop: 'I am eager to contribute to full-stack development and cloud computing initiatives. I have spent the last year building microservices and want to collaborate with seniors on the club web platforms and annual hackathon management systems.',
      experience: 'Built 3 React/Node.js full-stack applications with PostgreSQL. Ranked top 5% in College Coding Sprint. Contributed 12 PRs to open-source developer tooling.',
      status: ApplicationStatus.PENDING,
    },
    {
      username: 'priya_n',
      fullName: 'Priya Nair',
      email: 'priya.n@nmit.edu',
      department: 'Information Science & Engineering',
      semester: 'Semester 6',
      sop: 'Deeply interested in Machine Learning interpretability and Natural Language Processing. I want to assist in conducting AI workshops and mentor 1st/2nd year students transitioning into data science.',
      experience: 'Co-authored an IEEE student conference paper on Transformer pruning. 2-month summer internship at a Bengaluru AI startup working on RAG pipelines.',
      status: ApplicationStatus.PENDING,
    },
    {
      username: 'tanya_s',
      fullName: 'Tanya Sengupta',
      email: 'tanya.s@nmit.edu',
      department: 'Electronics & Communication',
      semester: 'Semester 3',
      sop: 'Passionate about Edge AI, Embedded Systems, and tinyML. Want to bridge the gap between software algorithms and hardware prototyping in the club robotics division.',
      experience: 'Hands-on with ESP32, STM32 microcontrollers and FreeRTOS. Won 2nd prize at Inter-College IoT Prototype Expo 2025.',
      status: ApplicationStatus.PENDING,
    },
    {
      username: 'aryan_k',
      fullName: 'Aryan Kapoor',
      email: 'aryan.k@nmit.edu',
      department: 'AI & Data Engineering',
      semester: 'Semester 5',
      sop: 'I want to spearhead the club competitive coding wing and train teams for ACM-ICPC regionals and Google HashCode.',
      experience: 'Expert rating (1840) on Codeforces, 5-star on CodeChef. Solved 750+ LeetCode problems.',
      status: ApplicationStatus.APPROVED,
    },
    {
      username: 'neha_v',
      fullName: 'Neha Verma',
      email: 'neha.v@nmit.edu',
      department: 'Mechanical Engineering',
      semester: 'Semester 1',
      sop: 'Interested in learning beginner programming concepts and participating in club events.',
      experience: 'No prior coding experience yet, eager to learn.',
      status: ApplicationStatus.REJECTED,
    },
  ];

  // Clear existing membership applications for this club
  await prisma.membershipApplication.deleteMany({
    where: { organizationId: clubId },
  });

  for (const app of applicantsData) {
    let u = await prisma.user.findFirst({
      where: { email: app.email },
    });

    if (!u) {
      u = await prisma.user.create({
        data: {
          id: uuidv7(),
          username: app.username,
          fullName: app.fullName,
          email: app.email,
          isActive: true,
          roles: {
            create: {
              id: uuidv7(),
              role: RoleType.STUDENT,
            },
          },
        },
      });
    }

    await prisma.membershipApplication.create({
      data: {
        id: uuidv7(),
        organizationId: clubId,
        userId: u.id,
        statementOfPurpose: app.sop,
        experience: app.experience,
        department: app.department,
        semester: app.semester,
        status: app.status,
        reviewedAt: app.status !== ApplicationStatus.PENDING ? new Date() : null,
        reviewedById: app.status !== ApplicationStatus.PENDING ? president.id : null,
      },
    });

    // If approved, ensure user has MEMBER role
    if (app.status === ApplicationStatus.APPROVED) {
      const existingRole = await prisma.userRole.findFirst({
        where: {
          userId: u.id,
          role: RoleType.MEMBER,
          organizationId: clubId,
        },
      });
      if (!existingRole) {
        await prisma.userRole.create({
          data: {
            id: uuidv7(),
            userId: u.id,
            role: RoleType.MEMBER,
            organizationId: clubId,
          },
        });
      }
    }
  }

  console.log(`📝 Seeded ${applicantsData.length} membership applications.`);
  console.log('✅ President module data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding president data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
