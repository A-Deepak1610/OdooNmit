import 'dotenv/config';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

export const PREDEFINED_ROLE_USERS = [
  {
    role: 'ADMIN',
    name: 'Campus Administrator',
    email: 'admin@campusFlow.edu',
    avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Admin&backgroundColor=ffd5dc',
    roles: ['ADMIN', 'STUDENT'],
    clubRole: 'FACULTY_ADVISOR',
  },
  {
    role: 'PRESIDENT',
    name: 'Aarav Sharma (President)',
    email: 'president@campusFlow.edu',
    avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Aarav&backgroundColor=b6e3f4',
    roles: ['PRESIDENT', 'MEMBER', 'STUDENT'],
    clubRole: 'PRESIDENT',
  },
  {
    role: 'TREASURER',
    name: 'Priya Patel (Treasurer)',
    email: 'treasurer@campusFlow.edu',
    avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Priya&backgroundColor=c0aede',
    roles: ['TREASURER', 'MEMBER', 'STUDENT'],
    clubRole: 'TREASURER',
  },
  {
    role: 'EVENT_ORGANIZER',
    name: 'Rohan Gupta (Organizer)',
    email: 'organizer@campusFlow.edu',
    avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Rohan&backgroundColor=ffd5dc',
    roles: ['EVENT_ORGANIZER', 'MEMBER', 'STUDENT'],
    clubRole: 'OFFICER',
  },
  {
    role: 'VOLUNTEER',
    name: 'Ananya Iyer (Volunteer)',
    email: 'volunteer@campusFlow.edu',
    avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Ananya&backgroundColor=b6e3f4',
    roles: ['VOLUNTEER', 'MEMBER', 'STUDENT'],
    clubRole: 'VOLUNTEER',
  },
  {
    role: 'VOLUNTEER',
    name: 'RITHISH S',
    email: 'rithishs.cs24@bitsathy.ac.in',
    avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Rithish&backgroundColor=b6e3f4',
    roles: ['VOLUNTEER', 'MEMBER', 'STUDENT'],
    clubRole: 'VOLUNTEER',
  },
  {
    role: 'MEMBER',
    name: 'Vikram Malhotra (Member)',
    email: 'member@campusFlow.edu',
    avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Vikram&backgroundColor=c0aede',
    roles: ['MEMBER', 'STUDENT'],
    clubRole: 'MEMBER',
  },
  {
    role: 'STUDENT',
    name: 'Deepak Kumar (Student)',
    email: 'student@campusFlow.edu',
    avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Deepak&backgroundColor=b6e3f4',
    roles: ['STUDENT'],
    clubRole: null,
  },
];

export async function seedDatabase() {
  logger.info('Starting CampusFlow database seeding...');

  try {
    // 1. Ensure Skyline Student Association tenant club exists
    let club = await prisma.club.findUnique({
      where: { slug: 'skyline-sa' },
    });

    if (!club) {
      club = await prisma.club.create({
        data: {
          name: 'Skyline Student Association',
          slug: 'skyline-sa',
          description: 'Official student organization running campus events, memberships, and fundraisers.',
          category: 'Leadership & Student Governance',
          collegeName: 'Dr.SNS Rajalakshmi College Of Arts and Science',
          duesAmount: 250.0,
          duesInterval: 'ANNUAL',
          status: 'ACTIVE',
        },
      });
      logger.info('Created Skyline Student Association club tenant.');
    }

    // 2. Upsert Predefined Demo Users
    for (const demoUser of PREDEFINED_ROLE_USERS) {
      // Find or create User
      let user = await prisma.user.findFirst({
        where: { email: demoUser.email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: demoUser.name,
            email: demoUser.email,
            avatarUrl: demoUser.avatarUrl,
            status: 'ACTIVE',
          },
        });
        logger.info(`Created demo user: ${demoUser.name} (${demoUser.email})`);
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: user.name || demoUser.name,
            avatarUrl: user.avatarUrl || demoUser.avatarUrl,
            status: 'ACTIVE',
          },
        });
      }

      // Ensure mock OAuth account binding for @campusFlow.edu demo users
      if (demoUser.email.endsWith('@campusFlow.edu')) {
        await prisma.oAuthAccount.upsert({
          where: {
            provider_providerAccountId: {
              provider: 'demo_oauth',
              providerAccountId: `demo-${demoUser.role.toLowerCase()}`,
            },
          },
          create: {
            userId: user.id,
            provider: 'demo_oauth',
            providerAccountId: `demo-${demoUser.role.toLowerCase()}`,
            email: demoUser.email,
            emailVerified: true,
          },
          update: {
            email: demoUser.email,
          },
        });
      }

      // Clear existing user roles to ensure exact predefined role synchronization
      await prisma.userRole.deleteMany({
        where: { userId: user.id },
      });

      // Add each role in demoUser.roles
      for (const roleName of demoUser.roles) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            role: roleName,
          },
        });
      }

      // Add Club Membership if applicable
      if (demoUser.clubRole && club) {
        const memNumber = demoUser.email.startsWith('rithish')
          ? 'SSA-2026-VOL-01'
          : `SSA-2026-${demoUser.role.substring(0, 3)}-001`;

        await prisma.clubMember.upsert({
          where: {
            clubId_userId: {
              clubId: club.id,
              userId: user.id,
            },
          },
          create: {
            clubId: club.id,
            userId: user.id,
            membershipNumber: memNumber,
            tier: 'STANDARD',
            status: 'ACTIVE',
            duesPaid: true,
            duesExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
          update: {
            status: 'ACTIVE',
            duesPaid: true,
          },
        });
      }

      logger.info(`Assigned roles for ${demoUser.email}: [${demoUser.roles.join(', ')}]`);
    }

    logger.info('Database seeding completed successfully!');
  } catch (err) {
    logger.error('Error during database seeding:', err);
    throw err;
  }
}

// Execute standalone if called directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      logger.info('Seed process finished.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Seed process failed:', err);
      process.exit(1);
    });
}
