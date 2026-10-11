import {
  PrismaClient,
  ElectionStatus,
  CandidateStatus,
  RoleType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🗳️ Starting Dedicated Completed Elections Seeding (5 Clubs, >=35 Votes Each)...');

  // 1. Ensure at least 5 clubs exist
  let clubs = await prisma.organization.findMany({ take: 6 });
  if (clubs.length < 5) {
    console.log('Creating additional campus clubs...');
    const clubTemplates = [
      {
        name: 'Tech & AI Innovators Club',
        slug: 'tech-innovators',
        description: 'Premier collegiate hub for artificial intelligence, machine learning, and modern web application development.',
        category: 'Technology',
        logoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=200&fit=crop&crop=faces',
      },
      {
        name: 'Robotics & Hardware Society',
        slug: 'robotics-society',
        description: 'Hands-on embedded systems, autonomous drones, ROS framework, and collegiate battlebots team.',
        category: 'Engineering',
        logoUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=200&fit=crop&crop=faces',
      },
      {
        name: 'Creative Design & UI/UX Guild',
        slug: 'design-guild',
        description: 'Community of visual artists, UI/UX product designers, 3D animators, and multimedia creators.',
        category: 'Arts & Media',
        logoUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop&crop=faces',
      },
      {
        name: 'Coding & Open Source Society',
        slug: 'coding-society',
        description: 'Promoting Linux, open-source development, competitive programming, and GitHub campus contributions.',
        category: 'Technology',
        logoUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=200&fit=crop&crop=faces',
      },
      {
        name: 'Entrepreneurship & E-Cell',
        slug: 'ecell-club',
        description: 'Fostering campus startups, angel pitch days, VC investor roundtables, and student incubation grants.',
        category: 'Business & Leadership',
        logoUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=200&fit=crop&crop=faces',
      },
    ];

    for (const t of clubTemplates) {
      await prisma.organization.upsert({
        where: { slug: t.slug },
        update: {},
        create: {
          id: uuidv7(),
          name: t.name,
          slug: t.slug,
          description: t.description,
          category: t.category,
          logoUrl: t.logoUrl,
          isActive: true,
        },
      });
    }
    clubs = await prisma.organization.findMany({ take: 6 });
  }

  // 2. Ensure a pool of 55 distinct student voters exists
  console.log('Ensuring pool of 55 distinct student voter user accounts...');
  const passwordHash = await bcrypt.hash('Student@123', 10);
  const voterUsers: Array<{ id: string; fullName: string; username: string; email: string }> = [];

  const voterFirstNames = [
    'Aditya', 'Priya', 'Marcus', 'Sneha', 'Farhan', 'Tanvi', 'Deepak', 'Ananya', 'Rahul', 'Kavita',
    'Rohan', 'Neha', 'Varun', 'Anika', 'Kabir', 'Riya', 'Ishaan', 'Pooja', 'Kunal', 'Aarav',
    'Meera', 'Siddharth', 'Divya', 'Nikhil', 'Shreya', 'Amit', 'Swati', 'Gaurav', 'Manish', 'Bhavna',
    'Harsh', 'Isha', 'Jatin', 'Kiran', 'Lokesh', 'Mohit', 'Nandini', 'Omkar', 'Payal', 'Rajesh',
    'Simran', 'Tushar', 'Urvashi', 'Vivek', 'Yash', 'Zoya', 'Alok', 'Chhavi', 'Dhruv', 'Esha',
    'Hemant', 'Kalyan', 'Mitali', 'Naveen', 'Pranav'
  ];

  const voterLastNames = [
    'Rao', 'Sharma', 'Vance', 'Kulkarni', 'Ali', 'Joshi', 'Verma', 'Reddy', 'Nair', 'Das',
    'Kapoor', 'Patel', 'Menon', 'Shah', 'Malhotra', 'Saxena', 'Gupta', 'Bhat', 'Sen', 'Chawla',
    'Iyer', 'Deshmukh', 'Singhania', 'Patil', 'Bansal', 'Agarwal', 'Chatterjee', 'Mishra', 'Pandey', 'Choudhury',
    'Ghosh', 'Bose', 'Dutta', 'Sengupta', 'Mukherjee', 'Roy', 'Barman', 'Saha', 'Biswas', 'Majumdar',
    'Bhattacharya', 'Chakraborty', 'Paul', 'Sarkar', 'Pal', 'Kundu', 'De', 'Basu', 'Mitra', 'Dasgupta',
    'Kashyap', 'Chauhan', 'Thakur', 'Rathore', 'Parmar'
  ];

  for (let i = 0; i < 55; i++) {
    const fn = voterFirstNames[i % voterFirstNames.length];
    const ln = voterLastNames[i % voterLastNames.length];
    const username = `voter_${(i + 1).toString().padStart(2, '0')}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}.${i + 10}@campus.nmit.ac.in`;

    const user = await prisma.user.upsert({
      where: { username },
      update: {
        fullName: `${fn} ${ln}`,
        email,
      },
      create: {
        id: uuidv7(),
        username,
        email,
        fullName: `${fn} ${ln}`,
        passwordHash,
        isActive: true,
      },
    });

    const existingStudentRole = await prisma.userRole.findFirst({
      where: { userId: user.id, role: RoleType.STUDENT },
    });
    if (!existingStudentRole) {
      await prisma.userRole.create({
        data: {
          id: uuidv7(),
          userId: user.id,
          role: RoleType.STUDENT,
        },
      });
    }

    voterUsers.push(user);
  }

  console.log(`✅ Ready with ${voterUsers.length} student voter accounts.`);

  // 3. Define the 5 Completed Elections configuration
  const completedElectionConfigs = [
    {
      title: '2025–2026 Executive Leadership & President Election',
      clubIndex: 0,
      slug: 'tech-innovators',
      description: 'Official annual democratic election to elect the President of Tech & AI Innovators Club. Certified with 100% cryptographic 1-time ballot integrity.',
      daysAgoStart: 35,
      daysAgoEnd: 30,
      daysAgoDeadline: 38,
      candidates: [
        {
          fullName: 'Karthik Menon',
          username: 'karthik_menon',
          email: 'karthik.menon@campus.nmit.ac.in',
          votesCount: 22, // Rank 1 Winner
          manifesto: 'Transforming Tech Club into a national hackathon powerhouse. Introducing 24/7 AI lab compute credits, monthly industry tech talks, and 100% transparent budget tracking.',
          statementOfPurpose: 'I have served as Vice Lead and demonstrated consistent dedication to organizing major campus hackathons and student tech workshops.',
          experience: 'Vice Lead (2024–2025), Smart India Hackathon Finalist, Organizer of CodeStorm 2024.',
        },
        {
          fullName: 'Ananya Reddy',
          username: 'ananya_reddy',
          email: 'ananya.reddy@campus.nmit.ac.in',
          votesCount: 12, // Rank 2
          manifesto: 'Democratizing foundational engineering workshops, beginner developer bootcamps, and active cross-disciplinary partnerships with Design Guild.',
          statementOfPurpose: 'Ensuring every student regardless of department gets access to modern web, app, and AI development tracks.',
          experience: 'Core Technical Member, Lead Trainer for Web Development Bootcamp.',
        },
        {
          fullName: 'Tanvi Shah',
          username: 'tanvi_shah',
          email: 'tanvi.shah@campus.nmit.ac.in',
          votesCount: 7, // Rank 3
          manifesto: 'Focusing on peer research papers, IEEE collegiate chapter credentials, and sponsored conference travel grants for top project teams.',
          statementOfPurpose: 'Elevating academic citations and competitive collegiate standings through faculty-aligned research clusters.',
          experience: 'Research Assistant in Embedded Systems, 2x Hackathon Finalist, IEEE Student Member.',
        },
        {
          fullName: 'Rohan Kapoor',
          username: 'rohan_kapoor',
          email: 'rohan.kapoor@campus.nmit.ac.in',
          votesCount: 4, // Rank 4
          manifesto: 'Expanding high-school STEM outreach, women in tech initiatives, and weekly open laboratory hack hours for all campus departments.',
          statementOfPurpose: 'Strengthening campus community engagement and making technical equipment accessible to non-engineering majors.',
          experience: 'Outreach Coordinator, Volunteer for Science Day, Campus Events Lead.',
        },
        {
          fullName: 'Priya Desai',
          username: 'priya_desai',
          email: 'priya.desai@campus.nmit.ac.in',
          votesCount: 2, // Rank 5
          manifesto: 'Industry alumni connect series, resume clinics, and campus internship fairs directly affiliated with student-built software projects.',
          statementOfPurpose: 'Connecting engineering student work with top hiring partners and tech incubators.',
          experience: 'Placement Cell Student Coordinator, Tech Lead in Open-Source Projects.',
        },
      ],
    },
    {
      title: '2025–2026 Robotics Society Leadership Election',
      clubIndex: 1,
      slug: 'robotics-society',
      description: 'Annual election for President of Robotics & Hardware Society. Full voting concluded, verified, and ratified by Super Administrator.',
      daysAgoStart: 45,
      daysAgoEnd: 40,
      daysAgoDeadline: 48,
      candidates: [
        {
          fullName: 'Vikram Mehta',
          username: 'vikram_mehta',
          email: 'vikram.mehta@campus.nmit.ac.in',
          votesCount: 21, // Rank 1 Winner
          manifesto: 'Building collegiate autonomous rover & drones, expanding hardware fabrication lab 24/7 access, and securing corporate sponsorship for national robotics championships.',
          statementOfPurpose: 'Dedicated to leading our collegiate robotics team to victory in national autonomous vehicle challenges.',
          experience: 'Lead Autonomous Systems Researcher, 1st Place National Robocon 2024.',
        },
        {
          fullName: 'Sneha Kulkarni',
          username: 'sneha_kulkarni',
          email: 'sneha.kulkarni@campus.nmit.ac.in',
          votesCount: 11, // Rank 2
          manifesto: 'Democratizing ROS2 robotics framework workshops, launching beginner Arduino bootcamps, and establishing inter-college battlebot league.',
          statementOfPurpose: 'Empowering first-year students to build functional robotics kits within their first semester.',
          experience: 'Robotics Hardware Trainer, Mentor for 120+ first-year students.',
        },
        {
          fullName: 'Aditya Rao',
          username: 'aditya_rao',
          email: 'aditya.rao@campus.nmit.ac.in',
          votesCount: 6, // Rank 3
          manifesto: 'Expanding computer vision and embedded sensor fusion projects with sponsored laboratory compute GPUs.',
          statementOfPurpose: 'Bridging software algorithms with real-world mechatronics applications.',
          experience: 'Embedded Firmware Lead, Winner of IoT Hackathon 2024.',
        },
        {
          fullName: 'Farhan Ali',
          username: 'farhan_ali',
          email: 'farhan.ali@campus.nmit.ac.in',
          votesCount: 4, // Rank 4
          manifesto: 'Standardizing lab safety protocols, 3D printing filaments availability, and PCB milling machine access.',
          statementOfPurpose: 'Ensuring reliable workshop equipment and maker space tools for all members.',
          experience: 'Lab Inventory Manager, Certified Mechatronics Specialist.',
        },
        {
          fullName: 'Marcus Vance',
          username: 'marcus_vance',
          email: 'marcus.vance@campus.nmit.ac.in',
          votesCount: 2, // Rank 5
          manifesto: 'High school drone workshops and collegiate drone racing league setup on campus sports grounds.',
          statementOfPurpose: 'Bringing visibility and drone pilot certification training to students.',
          experience: 'Certified Drone Pilot, Aerial Cinematography Lead.',
        },
      ],
    },
    {
      title: '2025–2026 Creative Design & UI/UX Guild Presidential Election',
      clubIndex: 2,
      slug: 'design-guild',
      description: 'Democratic vote to elect Lead Guild Master & President of Creative Design Guild. Ballots sealed and audited.',
      daysAgoStart: 50,
      daysAgoEnd: 45,
      daysAgoDeadline: 53,
      candidates: [
        {
          fullName: 'Aarav Sharma',
          username: 'aarav_sharma',
          email: 'aarav.sharma@campus.nmit.ac.in',
          votesCount: 19, // Rank 1 Winner
          manifesto: 'Figma Organization plan for every member, annual 48-hour UI/UX Designathon, and direct design agency mentorship critique sessions.',
          statementOfPurpose: 'I have designed branding for 5 campus fests and want to establish our guild as top design talent pipeline.',
          experience: 'Lead Product Designer for CampusMitra, Best UI Award at HackIndia.',
        },
        {
          fullName: 'Meera Joshi',
          username: 'meera_joshi',
          email: 'meera.joshi@campus.nmit.ac.in',
          votesCount: 11, // Rank 2
          manifesto: 'Focusing on 3D Blender animation, spatial computing UI in visionOS, and Adobe Creative Cloud campus licenses.',
          statementOfPurpose: 'Integrating 3D motion design with practical user interface research.',
          experience: '3D Motion Lead, Freelance Brand Identity Designer.',
        },
        {
          fullName: 'Siddharth Nair',
          username: 'siddharth_nair',
          email: 'siddharth.nair@campus.nmit.ac.in',
          votesCount: 6, // Rank 3
          manifesto: 'Bridging design with front-end code: Tailwind CSS, micro-interactions, and accessible web standards workshops.',
          statementOfPurpose: 'Helping designers write cleaner code and engineers build prettier interfaces.',
          experience: 'Front-end Design Engineer, Design Systems Contributor.',
        },
        {
          fullName: 'Divya Patel',
          username: 'divya_patel',
          email: 'divya.patel@campus.nmit.ac.in',
          votesCount: 3, // Rank 4
          manifesto: 'Typography clinics, print media publishing for annual campus magazine, and design portfolio review drives.',
          statementOfPurpose: 'Dedicated to traditional graphic design craft alongside digital experiences.',
          experience: 'Chief Editor of Design Guild Gazette, Poster Designer.',
        },
      ],
    },
    {
      title: '2025–2026 Coding & Open Source Society Annual Election',
      clubIndex: 3,
      slug: 'coding-society',
      description: 'Presidential election for Coding & Open Source Society. Enforcing open peer review and verified ballot tallying.',
      daysAgoStart: 60,
      daysAgoEnd: 55,
      daysAgoDeadline: 63,
      candidates: [
        {
          fullName: 'Rahul Verma',
          username: 'rahul_verma',
          email: 'rahul.verma@campus.nmit.ac.in',
          votesCount: 20, // Rank 1 Winner
          manifesto: 'Establishing campus Linux mirror, monthly contribution sprints to top GitHub repos, and sponsored GSoC mentoring cohorts.',
          statementOfPurpose: 'Passionate about open-source ethics, self-hosting campus tools, and algorithmic problem-solving.',
          experience: 'GSoC Contributor @ Apache, Winner of ICPC Regional Prelims.',
        },
        {
          fullName: 'Ishaan Gupta',
          username: 'ishaan_gupta',
          email: 'ishaan.gupta@campus.nmit.ac.in',
          votesCount: 11, // Rank 2
          manifesto: 'Weekly competitive programming ladder, codeforces division 2 training camps, and algorithmic mock interviews.',
          statementOfPurpose: 'Helping students crack top product companies through rigorous data structures mastery.',
          experience: 'Codeforces Master, President of Problem Setter Club.',
        },
        {
          fullName: 'Pooja Bhat',
          username: 'pooja_bhat',
          email: 'pooja.bhat@campus.nmit.ac.in',
          votesCount: 6, // Rank 3
          manifesto: 'Rust & Systems Programming study groups, Linux kernel modules workshops, and WebAssembly compiler projects.',
          statementOfPurpose: 'Advocating for deep systems engineering beyond high-level web frameworks.',
          experience: 'Rust Foundation Grantee, Low-level Systems Researcher.',
        },
        {
          fullName: 'Kunal Sen',
          username: 'kunal_sen',
          email: 'kunal.sen@campus.nmit.ac.in',
          votesCount: 3, // Rank 4
          manifesto: 'Cybersecurity CTF team sponsorship, ethical hacking workshops, and responsible bug bounty disclosures.',
          statementOfPurpose: 'Equipping members with practical penetration testing and defensive security skills.',
          experience: 'Top 50 CTF Player, Security Researcher.',
        },
      ],
    },
    {
      title: '2025–2026 Entrepreneurship & E-Cell Presidential Election',
      clubIndex: 4,
      slug: 'ecell-club',
      description: 'Annual election for President of Entrepreneurship Cell. Student venture founders and innovators cast verified ballots.',
      daysAgoStart: 70,
      daysAgoEnd: 65,
      daysAgoDeadline: 73,
      candidates: [
        {
          fullName: 'Varun Reddy',
          username: 'varun_reddy',
          email: 'varun.reddy@campus.nmit.ac.in',
          votesCount: 18, // Rank 1 Winner
          manifesto: '₹10,00,000 campus venture seed grant fund, startup incubator co-working space, and direct access to top angel syndicates.',
          statementOfPurpose: 'Founder of student-led startup with real revenue, aiming to build a thriving founder culture on campus.',
          experience: 'Co-founder of CampusDrop, Winner of National B-Plan Challenge 2024.',
        },
        {
          fullName: 'Anika Singhania',
          username: 'anika_singhania',
          email: 'anika.singhania@campus.nmit.ac.in',
          votesCount: 11, // Rank 2
          manifesto: 'Female founders accelerator, venture capital term sheet masterclasses, and corporate pilot testing partnerships.',
          statementOfPurpose: 'Expanding access to funding and business network for female student entrepreneurs.',
          experience: 'VC Fellow, Venture Analyst Intern, Organiser of E-Summit.',
        },
        {
          fullName: 'Kabir Malhotra',
          username: 'kabir_malhotra',
          email: 'kabir.malhotra@campus.nmit.ac.in',
          votesCount: 5, // Rank 3
          manifesto: 'Deeptech patent filings support, legal clinic for startup incorporation, and IP licensing guidance.',
          statementOfPurpose: 'Protecting student intellectual property and helping technical projects spin off into patents.',
          experience: 'Patent Filing Grantee, Tech Commercialization Lead.',
        },
        {
          fullName: 'Riya Saxena',
          username: 'riya_saxena',
          email: 'riya.saxena@campus.nmit.ac.in',
          votesCount: 3, // Rank 4
          manifesto: 'Marketing, sales bootcamps, B2B customer discovery sprints, and campus product demo days.',
          statementOfPurpose: 'Focusing on go-to-market strategies and early customer traction.',
          experience: 'Growth Lead in 2 Startups, Campus Ambassador for Sequoia Spark.',
        },
      ],
    },
  ];

  // 4. Seed each Completed Election with Candidates and Verified 1-Time Votes
  for (let eIdx = 0; eIdx < completedElectionConfigs.length; eIdx++) {
    const config = completedElectionConfigs[eIdx];
    const club = clubs[config.clubIndex % clubs.length];

    console.log(`\n📌 Seeding Completed Election #${eIdx + 1}: "${config.title}" for ${club.name}...`);

    // Clean any prior election with matching title to ensure idempotency
    const existingElec = await prisma.election.findFirst({
      where: { title: config.title, organizationId: club.id },
    });

    if (existingElec) {
      await prisma.electionVote.deleteMany({ where: { electionId: existingElec.id } });
      await prisma.electionCandidate.deleteMany({ where: { electionId: existingElec.id } });
      await prisma.election.delete({ where: { id: existingElec.id } });
    }

    const electionId = uuidv7();
    const nominationDeadline = new Date(Date.now() - config.daysAgoDeadline * 24 * 60 * 60 * 1000);
    const votingStartDate = new Date(Date.now() - config.daysAgoStart * 24 * 60 * 60 * 1000);
    const votingEndDate = new Date(Date.now() - config.daysAgoEnd * 24 * 60 * 60 * 1000);

    // Create candidates user accounts and candidate entries
    const createdCandidates: Array<{ id: string; userId: string; voteTarget: number; candUser: any }> = [];

    for (const cData of config.candidates) {
      // Upsert candidate user
      const candUser = await prisma.user.upsert({
        where: { username: cData.username },
        update: {
          fullName: cData.fullName,
          email: cData.email,
        },
        create: {
          id: uuidv7(),
          username: cData.username,
          email: cData.email,
          fullName: cData.fullName,
          passwordHash,
          isActive: true,
        },
      });

      // Ensure Member role in this club
      const existingMemberRole = await prisma.userRole.findFirst({
        where: {
          userId: candUser.id,
          role: RoleType.MEMBER,
          organizationId: club.id,
        },
      });
      if (!existingMemberRole) {
        await prisma.userRole.create({
          data: {
            id: uuidv7(),
            userId: candUser.id,
            role: RoleType.MEMBER,
            organizationId: club.id,
          },
        });
      }

      const candId = uuidv7();
      await prisma.electionCandidate.create({
        data: {
          id: candId,
          electionId,
          userId: candUser.id,
          manifesto: cData.manifesto,
          statementOfPurpose: cData.statementOfPurpose,
          experience: cData.experience,
          status: CandidateStatus.APPROVED,
          voteCount: cData.votesCount,
          approvedAt: nominationDeadline,
        },
      });

      createdCandidates.push({
        id: candId,
        userId: candUser.id,
        voteTarget: cData.votesCount,
        candUser,
      });
    }

    const winner = createdCandidates[0]; // Top candidate is the winner

    // Create Election record marked as COMPLETED
    const totalVotesInThisElection = config.candidates.reduce((sum, c) => sum + c.votesCount, 0);

    await prisma.election.create({
      data: {
        id: electionId,
        title: config.title,
        organizationId: club.id,
        academicYear: '2025-2026',
        description: config.description,
        status: ElectionStatus.COMPLETED,
        nominationDeadline,
        votingStartDate,
        votingEndDate,
        winnerCandidateId: winner.userId,
      },
    });

    // Ratify President role in database for the winner
    await prisma.userRole.deleteMany({
      where: { organizationId: club.id, role: RoleType.PRESIDENT },
    });

    await prisma.userRole.create({
      data: {
        id: uuidv7(),
        userId: winner.userId,
        role: RoleType.PRESIDENT,
        organizationId: club.id,
      },
    });

    // 5. Cast individual ElectionVote records with distinct real voterUsers
    console.log(`Casting ${totalVotesInThisElection} verified atomic ballots from voter pool...`);
    let voterCursor = 0;

    for (const cand of createdCandidates) {
      for (let v = 0; v < cand.voteTarget; v++) {
        const voter = voterUsers[voterCursor % voterUsers.length];
        voterCursor++;

        // Calculate a realistic timestamp during the voting window
        const randomSecondsOffset = Math.floor(
          (v / Math.max(cand.voteTarget, 1)) * 4 * 24 * 3600 + Math.random() * 3600
        );
        const castAt = new Date(votingStartDate.getTime() + randomSecondsOffset * 1000);

        try {
          await prisma.electionVote.create({
            data: {
              id: uuidv7(),
              electionId,
              candidateId: cand.id,
              voterId: voter.id,
              castAt,
            },
          });
        } catch (err: any) {
          // If already voted in this election due to wrap-around, pick an unused voter
          const availableVoter = voterUsers.find((u) => u.id !== voter.id);
          if (availableVoter) {
            await prisma.electionVote.create({
              data: {
                id: uuidv7(),
                electionId,
                candidateId: cand.id,
                voterId: availableVoter.id,
                castAt,
              },
            });
          }
        }
      }
    }

    console.log(
      `✅ Election "${config.title}" seeded successfully! ${totalVotesInThisElection} votes recorded. Winner: ${winner.candUser.fullName} (President of ${club.name}).`
    );
  }

  console.log('\n🎉 ALL 5 COMPLETED ELECTIONS SUCCESSFULLY SEEDED WITH >= 35 REAL DATABASE VOTES EACH!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding completed elections:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
