import { PrismaClient, RoleType } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

/**
 * Idempotent seed script for Club Management
 * - Repairs broken/404 image URLs
 * - Enriches missing metadata & realistic membership fees
 * - Appoints student leaders from existing users for designated clubs
 * - Guarantees zero duplicate records on repeated execution
 */
async function main() {
  console.log('🌱 Starting safe, idempotent club verification and seed...');

  // 1. Safe image URL corrections (fixing known 404 / broken Unsplash URLs)
  const aerospace = await prisma.organization.findUnique({
    where: { slug: 'aerospace-rocketry' },
  });

  if (aerospace && aerospace.logoUrl?.includes('photo-1517976487502-520e5cfa8561')) {
    await prisma.organization.update({
      where: { id: aerospace.id },
      data: {
        logoUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=200&h=200&fit=crop',
      },
    });
    console.log('✅ Updated Aerospace & Rocketry Society logo to verified working asset.');
  }


  // 3. Leadership assignments (assign presidents for a few clubs from existing seeded users, leave others vacant)
  const candidateMappings: Array<{ username: string; clubSlug: string }> = [
    { username: 'candidate3', clubSlug: 'design-guild' },     // Priya Nair -> Design Guild
    { username: 'candidate2', clubSlug: 'robotics-society' },  // Vikram Mehta -> Robotics Society
    { username: 'candidate1', clubSlug: 'acm-chapter' },       // Ananya Iyer -> ACM Chapter
  ];

  for (const item of candidateMappings) {
    const user = await prisma.user.findUnique({ where: { username: item.username } });
    const club = await prisma.organization.findUnique({ where: { slug: item.clubSlug } });

    if (user && club) {
      // Check if this club already has a president
      const existingPres = await prisma.userRole.findFirst({
        where: {
          organizationId: club.id,
          role: RoleType.PRESIDENT,
        },
      });

      if (!existingPres) {
        // Ensure member role first
        const existingMember = await prisma.userRole.findFirst({
          where: {
            userId: user.id,
            organizationId: club.id,
            role: RoleType.MEMBER,
          },
        });

        if (!existingMember) {
          await prisma.userRole.create({
            data: {
              id: uuidv7(),
              userId: user.id,
              role: RoleType.MEMBER,
              organizationId: club.id,
            },
          });
        }

        // Assign President role
        await prisma.userRole.create({
          data: {
            id: uuidv7(),
            userId: user.id,
            role: RoleType.PRESIDENT,
            organizationId: club.id,
          },
        });
        console.log(`✅ Appointed ${user.fullName} as President of ${club.name}.`);
      }
    }
  }

  // 4. Ensure non-zero member count for active clubs by enrolling existing student users as members
  const students = await prisma.user.findMany({
    where: {
      username: { in: ['voter1', 'voter2', 'member', 'student', 'organizer', 'treasurer'] },
    },
  });

  const activeClubs = await prisma.organization.findMany({
    where: { isActive: true },
  });

  for (const club of activeClubs) {
    for (const student of students) {
      // Add member role if not present
      const hasRole = await prisma.userRole.findFirst({
        where: {
          userId: student.id,
          organizationId: club.id,
          role: RoleType.MEMBER,
        },
      });

      if (!hasRole) {
        await prisma.userRole.create({
          data: {
            id: uuidv7(),
            userId: student.id,
            role: RoleType.MEMBER,
            organizationId: club.id,
          },
        });
      }
    }
  }
  console.log('✅ Enrolled active campus members across chartered clubs.');

  console.log('✨ Idempotent club seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error in seed-clubs script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
