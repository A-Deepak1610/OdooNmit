import { PrismaClient, EventStatus, RoleType } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding 10 Comprehensive Campus Events with Full Analytics, Incharges & Tasks...');

  // 1. Find club and members
  const club = await prisma.organization.findFirst({
    where: { slug: 'tech-innovators' },
  });

  if (!club) {
    console.error('❌ Tech Club not found. Run base seed first.');
    return;
  }

  // Find Organizer (Chloe Chen), Volunteer (David Kim), Member (Aria Montgomery)
  const organizer = await prisma.user.findFirst({ where: { username: 'organizer' } });
  const volunteer = await prisma.user.findFirst({ where: { username: 'volunteer' } });
  const member = await prisma.user.findFirst({ where: { username: 'member' } });
  const treasurer = await prisma.user.findFirst({ where: { username: 'treasurer' } });

  const defaultInchargeId = organizer?.id || member?.id || club.id;

  // Clear existing events for this organization
  await prisma.eventTask.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.event.deleteMany({
    where: { organizationId: club.id },
  });

  const eventsData = [
    {
      title: 'Hackathon 2026: National Level Ideathon',
      slug: 'hackathon-2026-ideathon',
      description: 'Premier 48-hour collegiate hackathon bringing together cross-disciplinary developers, UI/UX designers, and ML researchers. Solve challenging industry problem statements with high-impact prototypes.',
      category: 'Hackathon',
      domain: 'AI/ML',
      status: EventStatus.PUBLISHED,
      statusLabel: 'ONGOING',
      venue: 'Main Auditorium, Dr.SNSRCAS Campus',
      mode: 'offline',
      startAt: new Date('2026-03-15T09:00:00Z'),
      endAt: new Date('2026-03-17T18:00:00Z'),
      totalSeats: 100,
      remainingSeats: 44,
      teamsCount: 45,
      memberPrice: 10000, // ₹100
      nonMemberPrice: 15000, // ₹150
      bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop',
      inchargeId: organizer?.id || defaultInchargeId,
      prizes: '1st Prize: ₹50,000 Cash + Incubation Grant, 2nd Prize: ₹25,000, 3rd Prize: ₹15,000',
      analyticsData: JSON.stringify({
        pageViews: 1245,
        uniqueVisitors: 856,
        avgTimeOnPage: '3m 24s',
        conversionRate: '18.2%',
        locationsCount: 6,
        geographicDistribution: [
          { city: 'Chennai', state: 'Tamil Nadu', teams: 18, lat: 13.0827, lng: 80.2707 },
          { city: 'Bangalore', state: 'Karnataka', teams: 12, lat: 12.9716, lng: 77.5946 },
          { city: 'Hyderabad', state: 'Telangana', teams: 8, lat: 17.3850, lng: 78.4867 },
          { city: 'Mumbai', state: 'Maharashtra', teams: 5, lat: 19.0760, lng: 72.8777 },
          { city: 'Delhi', state: 'Delhi', teams: 4, lat: 28.7041, lng: 77.1025 },
          { city: 'Coimbatore', state: 'Tamil Nadu', teams: 4, lat: 11.0168, lng: 76.9558 },
        ],
        domainDistribution: {
          'AI/ML': 28,
          'Web Development': 23,
          'IoT': 19,
          'Mobile Apps': 17,
          'Blockchain': 13,
        },
        registrationStatus: {
          approved: 38,
          pending: 5,
          rejected: 2,
        },
        departmentWise: {
          CSE: 68,
          ISE: 38,
          ECE: 32,
          ME: 21,
          AIML: 14,
        },
        participatingColleges: [
          { college: 'Sathyabama Institute', city: 'Chennai', teams: 11 },
          { college: 'VIT Chennai', city: 'Chennai', teams: 8 },
          { college: 'SRM University', city: 'Chennai', teams: 7 },
          { college: 'RVCE', city: 'Bangalore', teams: 6 },
          { college: 'BITS Pilani', city: 'Hyderabad', teams: 5 },
        ],
        yearWise: {
          '2nd Year': 29,
          '3rd Year': 46,
          '4th Year': 25,
        },
        registrationTrend: [
          { date: 'Feb 10', count: 8 },
          { date: 'Feb 15', count: 18 },
          { date: 'Feb 20', count: 28 },
          { date: 'Feb 25', count: 36 },
          { date: 'Mar 01', count: 45 },
        ],
        domainWinRates: [
          { domain: 'AI/ML', participated: 45, wins: 8, rate: '19.0%' },
          { domain: 'Web Development', participated: 38, wins: 5, rate: '14.3%' },
          { domain: 'IoT', participated: 30, wins: 4, rate: '14.3%' },
          { domain: 'Mobile Apps', participated: 27, wins: 3, rate: '12.0%' },
          { domain: 'Blockchain', participated: 21, wins: 2, rate: '10.0%' },
        ],
        averageWinRate: '14.7%',
      }),
    },
    {
      title: 'AI Workshop Series: Deep Learning & LLMs',
      slug: 'ai-workshop-series-2026',
      description: 'Hands-on architectural deep dive into Transformers, fine-tuning Llama-3, embedding vector databases, and constructing RAG autonomous agents.',
      category: 'Workshop',
      domain: 'AI/ML',
      status: EventStatus.PUBLISHED,
      statusLabel: 'UPCOMING',
      venue: 'Seminar Hall B, Main Academic Block',
      mode: 'hybrid',
      startAt: new Date('2026-03-20T10:00:00Z'),
      endAt: new Date('2026-03-22T16:00:00Z'),
      totalSeats: 50,
      remainingSeats: 33,
      teamsCount: 0,
      memberPrice: 0, // Free
      nonMemberPrice: 9900, // ₹99
      bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=450&fit=crop',
      inchargeId: organizer?.id || defaultInchargeId,
      prizes: 'Certificate of Excellence + JetBrains All Products License (1 Year)',
      analyticsData: JSON.stringify({
        pageViews: 940,
        uniqueVisitors: 610,
        avgTimeOnPage: '4m 12s',
        conversionRate: '21.5%',
        locationsCount: 4,
        geographicDistribution: [
          { city: 'Chennai', state: 'Tamil Nadu', teams: 14, lat: 13.0827, lng: 80.2707 },
          { city: 'Bangalore', state: 'Karnataka', teams: 10, lat: 12.9716, lng: 77.5946 },
          { city: 'Hyderabad', state: 'Telangana', teams: 6, lat: 17.3850, lng: 78.4867 },
          { city: 'Coimbatore', state: 'Tamil Nadu', teams: 3, lat: 11.0168, lng: 76.9558 },
        ],
        domainDistribution: { 'AI/ML': 65, 'Data Science': 20, 'Python': 15 },
        registrationStatus: { approved: 17, pending: 2, rejected: 0 },
        departmentWise: { CSE: 25, AIML: 18, ISE: 10, ECE: 8 },
        participatingColleges: [
          { college: 'VIT Chennai', city: 'Chennai', teams: 6 },
          { college: 'SRM University', city: 'Chennai', teams: 5 },
          { college: 'RVCE', city: 'Bangalore', teams: 4 },
        ],
        yearWise: { '2nd Year': 35, '3rd Year': 50, '4th Year': 15 },
        registrationTrend: [
          { date: 'Mar 01', count: 5 },
          { date: 'Mar 05', count: 11 },
          { date: 'Mar 10', count: 17 },
        ],
        domainWinRates: [{ domain: 'AI/ML', participated: 17, wins: 4, rate: '23.5%' }],
        averageWinRate: '23.5%',
      }),
    },
    {
      title: 'Web Dev Championship: Full-Stack Shootout',
      slug: 'web-dev-championship-2026',
      description: 'Competitive frontend-backend speed sprint. Build scalable web applications against live automated end-to-end integration test suites.',
      category: 'Competition',
      domain: 'Web Development',
      status: EventStatus.COMPLETED,
      statusLabel: 'COMPLETED',
      venue: 'Computer Lab 1 & 2',
      mode: 'offline',
      startAt: new Date('2026-02-28T09:00:00Z'),
      endAt: new Date('2026-03-01T17:00:00Z'),
      totalSeats: 60,
      remainingSeats: 0,
      teamsCount: 38,
      memberPrice: 5000, // ₹50
      nonMemberPrice: 10000, // ₹100
      bannerUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
      inchargeId: member?.id || defaultInchargeId,
      prizes: '1st Prize: ₹20,000, 2nd Prize: ₹10,000, 3rd Prize: ₹5,000',
      analyticsData: JSON.stringify({
        pageViews: 1420,
        uniqueVisitors: 980,
        avgTimeOnPage: '2m 55s',
        conversionRate: '15.8%',
        locationsCount: 5,
        geographicDistribution: [
          { city: 'Chennai', state: 'Tamil Nadu', teams: 16, lat: 13.0827, lng: 80.2707 },
          { city: 'Bangalore', state: 'Karnataka', teams: 11, lat: 12.9716, lng: 77.5946 },
          { city: 'Hyderabad', state: 'Telangana', teams: 5, lat: 17.3850, lng: 78.4867 },
          { city: 'Mumbai', state: 'Maharashtra', teams: 4, lat: 19.0760, lng: 72.8777 },
          { city: 'Delhi', state: 'Delhi', teams: 2, lat: 28.7041, lng: 77.1025 },
        ],
        domainDistribution: { 'React/Next.js': 45, 'Node/Express': 30, 'Full-Stack UI': 25 },
        registrationStatus: { approved: 38, pending: 0, rejected: 3 },
        departmentWise: { CSE: 42, ISE: 28, ECE: 12 },
        participatingColleges: [
          { college: 'Sathyabama Institute', city: 'Chennai', teams: 12 },
          { college: 'SRM University', city: 'Chennai', teams: 9 },
          { college: 'VIT Chennai', city: 'Chennai', teams: 8 },
        ],
        yearWise: { '1st Year': 10, '2nd Year': 40, '3rd Year': 50 },
        registrationTrend: [
          { date: 'Feb 15', count: 12 },
          { date: 'Feb 20', count: 25 },
          { date: 'Feb 28', count: 38 },
        ],
        domainWinRates: [{ domain: 'Web Dev', participated: 38, wins: 6, rate: '15.7%' }],
        averageWinRate: '15.7%',
      }),
    },
    {
      title: 'IoT & Autonomous Robotics Expo',
      slug: 'iot-robotics-expo-2026',
      description: 'Hardware embedded prototyping, autonomous ROS rovers, drone obstacle courses, and edge microcontrollers exhibition.',
      category: 'Competition',
      domain: 'IoT',
      status: EventStatus.PUBLISHED,
      statusLabel: 'UPCOMING',
      venue: 'Robotics Innovation Center & Quadrangle',
      mode: 'offline',
      startAt: new Date('2026-03-25T09:30:00Z'),
      endAt: new Date('2026-03-27T17:30:00Z'),
      totalSeats: 80,
      remainingSeats: 26,
      teamsCount: 24,
      memberPrice: 7500, // ₹75
      nonMemberPrice: 15000, // ₹150
      bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop',
      inchargeId: organizer?.id || defaultInchargeId,
      prizes: '1st Prize: ₹30,000 + PCB Fabrication Sponsorship, 2nd Prize: ₹15,000',
      analyticsData: JSON.stringify({
        pageViews: 810,
        uniqueVisitors: 540,
        avgTimeOnPage: '3m 15s',
        conversionRate: '16.2%',
        locationsCount: 4,
        geographicDistribution: [
          { city: 'Chennai', state: 'Tamil Nadu', teams: 10, lat: 13.0827, lng: 80.2707 },
          { city: 'Bangalore', state: 'Karnataka', teams: 8, lat: 12.9716, lng: 77.5946 },
          { city: 'Hyderabad', state: 'Telangana', teams: 4, lat: 17.3850, lng: 78.4867 },
          { city: 'Coimbatore', state: 'Tamil Nadu', teams: 2, lat: 11.0168, lng: 76.9558 },
        ],
        domainDistribution: { 'Embedded C': 40, 'ROS': 35, 'Computer Vision': 25 },
        registrationStatus: { approved: 24, pending: 3, rejected: 1 },
        departmentWise: { ECE: 35, ME: 25, CSE: 20 },
        participatingColleges: [
          { college: 'RVCE', city: 'Bangalore', teams: 7 },
          { college: 'VIT Chennai', city: 'Chennai', teams: 6 },
        ],
        yearWise: { '2nd Year': 25, '3rd Year': 55, '4th Year': 20 },
        registrationTrend: [
          { date: 'Mar 02', count: 8 },
          { date: 'Mar 08', count: 16 },
          { date: 'Mar 12', count: 24 },
        ],
        domainWinRates: [{ domain: 'IoT', participated: 24, wins: 4, rate: '16.6%' }],
        averageWinRate: '16.6%',
      }),
    },
    {
      title: 'CyberDefend 2026: 24-Hour CTF Tournament',
      slug: 'cyberdefend-ctf-2026',
      description: 'Flag Capture tournament encompassing reverse engineering, cryptography, web exploitation, binary pwn, and digital forensics.',
      category: 'Hackathon',
      domain: 'CyberSecurity',
      status: EventStatus.PUBLISHED,
      statusLabel: 'ONGOING',
      venue: 'Advanced Cyber Range Lab & Virtual VPN',
      mode: 'online',
      startAt: new Date('2026-03-16T12:00:00Z'),
      endAt: new Date('2026-03-17T12:00:00Z'),
      totalSeats: 120,
      remainingSeats: 18,
      teamsCount: 32,
      memberPrice: 0, // Free
      nonMemberPrice: 10000, // ₹100
      bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop',
      inchargeId: volunteer?.id || defaultInchargeId,
      prizes: '1st Prize: ₹40,000 + OSCP Certification Voucher, 2nd Prize: ₹20,000',
      analyticsData: JSON.stringify({
        pageViews: 1100,
        uniqueVisitors: 780,
        avgTimeOnPage: '4m 45s',
        conversionRate: '19.8%',
        locationsCount: 6,
        geographicDistribution: [
          { city: 'Chennai', state: 'Tamil Nadu', teams: 12, lat: 13.0827, lng: 80.2707 },
          { city: 'Bangalore', state: 'Karnataka', teams: 9, lat: 12.9716, lng: 77.5946 },
          { city: 'Hyderabad', state: 'Telangana', teams: 5, lat: 17.3850, lng: 78.4867 },
          { city: 'Delhi', state: 'Delhi', teams: 3, lat: 28.7041, lng: 77.1025 },
          { city: 'Mumbai', state: 'Maharashtra', teams: 2, lat: 19.0760, lng: 72.8777 },
          { city: 'Pune', state: 'Maharashtra', teams: 1, lat: 18.5204, lng: 73.8567 },
        ],
        domainDistribution: { 'Web Pwn': 35, 'Crypto': 25, 'Forensics': 20, 'Reverse Eng': 20 },
        registrationStatus: { approved: 32, pending: 4, rejected: 1 },
        departmentWise: { CSE: 45, ISE: 30, ECE: 15 },
        participatingColleges: [
          { college: 'BITS Pilani', city: 'Hyderabad', teams: 8 },
          { college: 'IIT Madras', city: 'Chennai', teams: 6 },
        ],
        yearWise: { '2nd Year': 20, '3rd Year': 50, '4th Year': 30 },
        registrationTrend: [
          { date: 'Mar 05', count: 10 },
          { date: 'Mar 10', count: 22 },
          { date: 'Mar 14', count: 32 },
        ],
        domainWinRates: [{ domain: 'Security', participated: 32, wins: 5, rate: '15.6%' }],
        averageWinRate: '15.6%',
      }),
    },
    {
      title: 'FinTech Algothon: High-Frequency Trading Challenge',
      slug: 'fintech-algothon-2026',
      description: 'Build algorithmic trading bots, quantitative backtesting pipelines, and arbitrage strategies with synthetic equity tick data.',
      category: 'Hackathon',
      domain: 'Blockchain',
      status: EventStatus.PUBLISHED,
      statusLabel: 'UPCOMING',
      venue: 'Bloomberg Terminal Suite & FinTech Lab',
      mode: 'hybrid',
      startAt: new Date('2026-04-05T09:00:00Z'),
      endAt: new Date('2026-04-07T17:00:00Z'),
      totalSeats: 75,
      remainingSeats: 40,
      teamsCount: 15,
      memberPrice: 12000, // ₹120
      nonMemberPrice: 20000, // ₹200
      bannerUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
      inchargeId: treasurer?.id || defaultInchargeId,
      prizes: '1st Prize: ₹35,000 + Prop Trading Firm Fast-track Interview',
      analyticsData: JSON.stringify({
        pageViews: 650,
        uniqueVisitors: 410,
        avgTimeOnPage: '3m 30s',
        conversionRate: '14.5%',
        locationsCount: 3,
        geographicDistribution: [
          { city: 'Mumbai', state: 'Maharashtra', teams: 7, lat: 19.0760, lng: 72.8777 },
          { city: 'Bangalore', state: 'Karnataka', teams: 5, lat: 12.9716, lng: 77.5946 },
          { city: 'Chennai', state: 'Tamil Nadu', teams: 3, lat: 13.0827, lng: 80.2707 },
        ],
        domainDistribution: { 'Quant Python': 50, 'Smart Contracts': 30, 'Data Feeds': 20 },
        registrationStatus: { approved: 15, pending: 2, rejected: 0 },
        departmentWise: { CSE: 20, Business: 15, ISE: 10 },
        participatingColleges: [
          { college: 'IIM Bangalore', city: 'Bangalore', teams: 4 },
          { college: 'NMIMS Mumbai', city: 'Mumbai', teams: 3 },
        ],
        yearWise: { '3rd Year': 40, '4th Year': 60 },
        registrationTrend: [
          { date: 'Mar 10', count: 5 },
          { date: 'Mar 15', count: 15 },
        ],
        domainWinRates: [{ domain: 'Finance', participated: 15, wins: 3, rate: '20.0%' }],
        averageWinRate: '20.0%',
      }),
    },
    {
      title: 'Cloud Native & Kubernetes Masterclass',
      slug: 'cloud-native-masterclass-2026',
      description: 'Hands-on architectural deployment workshop covering containerization, Helm charts, ingress controllers, CI/CD pipelines, and multi-cloud resilience.',
      category: 'Workshop',
      domain: 'Web Development',
      status: EventStatus.PUBLISHED,
      statusLabel: 'UPCOMING',
      venue: 'Virtual Lecture Hall & Live Discord Sandbox',
      mode: 'online',
      startAt: new Date('2026-04-10T10:00:00Z'),
      endAt: new Date('2026-04-11T16:00:00Z'),
      totalSeats: 150,
      remainingSeats: 65,
      teamsCount: 0,
      memberPrice: 0, // Free
      nonMemberPrice: 5000, // ₹50
      bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
      inchargeId: organizer?.id || defaultInchargeId,
      prizes: 'Certified Kubernetes Administrator (CKA) Exam 100% Vouchers',
      analyticsData: JSON.stringify({
        pageViews: 890,
        uniqueVisitors: 620,
        avgTimeOnPage: '3m 10s',
        conversionRate: '22.0%',
        locationsCount: 5,
        geographicDistribution: [
          { city: 'Chennai', state: 'Tamil Nadu', teams: 25, lat: 13.0827, lng: 80.2707 },
          { city: 'Bangalore', state: 'Karnataka', teams: 20, lat: 12.9716, lng: 77.5946 },
          { city: 'Hyderabad', state: 'Telangana', teams: 15, lat: 17.3850, lng: 78.4867 },
          { city: 'Pune', state: 'Maharashtra', teams: 10, lat: 18.5204, lng: 73.8567 },
          { city: 'Delhi', state: 'Delhi', teams: 15, lat: 28.7041, lng: 77.1025 },
        ],
        domainDistribution: { 'Docker/K8s': 60, 'DevOps CI/CD': 40 },
        registrationStatus: { approved: 85, pending: 8, rejected: 1 },
        departmentWise: { CSE: 55, ISE: 35, ECE: 10 },
        participatingColleges: [
          { college: 'SRM University', city: 'Chennai', teams: 15 },
          { college: 'VIT Chennai', city: 'Chennai', teams: 12 },
        ],
        yearWise: { '2nd Year': 30, '3rd Year': 50, '4th Year': 20 },
        registrationTrend: [
          { date: 'Mar 15', count: 30 },
          { date: 'Mar 25', count: 65 },
          { date: 'Apr 02', count: 85 },
        ],
        domainWinRates: [{ domain: 'DevOps', participated: 85, wins: 15, rate: '17.6%' }],
        averageWinRate: '17.6%',
      }),
    },
    {
      title: 'Mobile App Launchpad: Flutter & React Native Sprint',
      slug: 'mobile-app-launchpad-2026',
      description: '36-hour cross-platform mobile sprint. Prototype, package, and deploy native iOS & Android applications with offline sync and push notifications.',
      category: 'Competition',
      domain: 'Mobile Apps',
      status: EventStatus.COMPLETED,
      statusLabel: 'COMPLETED',
      venue: 'Design & Innovation Studio, Hall 4',
      mode: 'offline',
      startAt: new Date('2026-02-12T09:00:00Z'),
      endAt: new Date('2026-02-14T18:00:00Z'),
      totalSeats: 50,
      remainingSeats: 0,
      teamsCount: 22,
      memberPrice: 5000, // ₹50
      nonMemberPrice: 10000, // ₹100
      bannerUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=450&fit=crop',
      inchargeId: member?.id || defaultInchargeId,
      prizes: '1st Prize: ₹25,000, 2nd Prize: ₹12,000, 3rd Prize: ₹6,000',
      analyticsData: JSON.stringify({
        pageViews: 780,
        uniqueVisitors: 490,
        avgTimeOnPage: '2m 40s',
        conversionRate: '14.2%',
        locationsCount: 3,
        geographicDistribution: [
          { city: 'Chennai', state: 'Tamil Nadu', teams: 12, lat: 13.0827, lng: 80.2707 },
          { city: 'Bangalore', state: 'Karnataka', teams: 7, lat: 12.9716, lng: 77.5946 },
          { city: 'Coimbatore', state: 'Tamil Nadu', teams: 3, lat: 11.0168, lng: 76.9558 },
        ],
        domainDistribution: { 'Flutter': 55, 'React Native': 45 },
        registrationStatus: { approved: 22, pending: 0, rejected: 2 },
        departmentWise: { CSE: 30, ISE: 15, AIML: 5 },
        participatingColleges: [
          { college: 'Sathyabama Institute', city: 'Chennai', teams: 9 },
          { college: 'VIT Chennai', city: 'Chennai', teams: 7 },
        ],
        yearWise: { '1st Year': 15, '2nd Year': 45, '3rd Year': 40 },
        registrationTrend: [
          { date: 'Feb 01', count: 8 },
          { date: 'Feb 08', count: 16 },
          { date: 'Feb 12', count: 22 },
        ],
        domainWinRates: [{ domain: 'Mobile', participated: 22, wins: 3, rate: '13.6%' }],
        averageWinRate: '13.6%',
      }),
    },
    {
      title: 'Quantum Computing & Qiskit Symposium',
      slug: 'quantum-computing-symposium-2026',
      description: 'Collegiate academic symposium on quantum gate circuits, Shor algorithm implementations, and superconducting qubit simulations.',
      category: 'Conference',
      domain: 'AI/ML',
      status: EventStatus.PUBLISHED,
      statusLabel: 'UPCOMING',
      venue: 'Main Auditorium Tier 1, Academic Block',
      mode: 'hybrid',
      startAt: new Date('2026-04-18T09:30:00Z'),
      endAt: new Date('2026-04-19T17:00:00Z'),
      totalSeats: 200,
      remainingSeats: 110,
      teamsCount: 0,
      memberPrice: 10000, // ₹100
      nonMemberPrice: 25000, // ₹250
      bannerUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
      inchargeId: organizer?.id || defaultInchargeId,
      prizes: 'IBM Quantum Cloud Compute Credits + Research Fellowship',
      analyticsData: JSON.stringify({
        pageViews: 1150,
        uniqueVisitors: 820,
        avgTimeOnPage: '4m 05s',
        conversionRate: '18.5%',
        locationsCount: 6,
        geographicDistribution: [
          { city: 'Chennai', state: 'Tamil Nadu', teams: 25, lat: 13.0827, lng: 80.2707 },
          { city: 'Bangalore', state: 'Karnataka', teams: 20, lat: 12.9716, lng: 77.5946 },
          { city: 'Delhi', state: 'Delhi', teams: 15, lat: 28.7041, lng: 77.1025 },
          { city: 'Hyderabad', state: 'Telangana', teams: 12, lat: 17.3850, lng: 78.4867 },
          { city: 'Mumbai', state: 'Maharashtra', teams: 10, lat: 19.0760, lng: 72.8777 },
          { city: 'Kolkata', state: 'West Bengal', teams: 8, lat: 22.5726, lng: 88.3639 },
        ],
        domainDistribution: { 'Qiskit': 50, 'Quantum Alg': 30, 'Physics Simulation': 20 },
        registrationStatus: { approved: 90, pending: 12, rejected: 2 },
        departmentWise: { CSE: 40, ECE: 30, Science: 20 },
        participatingColleges: [
          { college: 'IIT Madras', city: 'Chennai', teams: 15 },
          { college: 'IISc Bangalore', city: 'Bangalore', teams: 12 },
        ],
        yearWise: { '3rd Year': 40, '4th Year': 60 },
        registrationTrend: [
          { date: 'Mar 20', count: 25 },
          { date: 'Apr 01', count: 60 },
          { date: 'Apr 10', count: 90 },
        ],
        domainWinRates: [{ domain: 'Quantum', participated: 90, wins: 12, rate: '13.3%' }],
        averageWinRate: '13.3%',
      }),
    },
    {
      title: 'Open Source Carnival 2026: Campus Code Fair',
      slug: 'open-source-carnival-2026',
      description: 'Community celebrate-a-thon. Contribute pull requests to trending open-source projects, claim bounty swag, and attend lightning talks from maintainers.',
      category: 'Hackathon',
      domain: 'Web Development',
      status: EventStatus.PUBLISHED,
      statusLabel: 'ONGOING',
      venue: 'Campus Central Open Plaza & Amphitheatre',
      mode: 'offline',
      startAt: new Date('2026-03-14T09:00:00Z'),
      endAt: new Date('2026-03-16T18:00:00Z'),
      totalSeats: 150,
      remainingSeats: 52,
      teamsCount: 41,
      memberPrice: 0, // Free
      nonMemberPrice: 5000, // ₹50
      bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop',
      inchargeId: volunteer?.id || defaultInchargeId,
      prizes: 'GitHub Sponsors Grants + Official Swag Hampers & Mechanical Keyboards',
      analyticsData: JSON.stringify({
        pageViews: 1350,
        uniqueVisitors: 910,
        avgTimeOnPage: '3m 40s',
        conversionRate: '17.5%',
        locationsCount: 5,
        geographicDistribution: [
          { city: 'Chennai', state: 'Tamil Nadu', teams: 16, lat: 13.0827, lng: 80.2707 },
          { city: 'Bangalore', state: 'Karnataka', teams: 12, lat: 12.9716, lng: 77.5946 },
          { city: 'Coimbatore', state: 'Tamil Nadu', teams: 6, lat: 11.0168, lng: 76.9558 },
          { city: 'Hyderabad', state: 'Telangana', teams: 5, lat: 17.3850, lng: 78.4867 },
          { city: 'Mumbai', state: 'Maharashtra', teams: 2, lat: 19.0760, lng: 72.8777 },
        ],
        domainDistribution: { 'JavaScript': 40, 'Rust': 25, 'Python': 20, 'Go': 15 },
        registrationStatus: { approved: 41, pending: 4, rejected: 1 },
        departmentWise: { CSE: 50, ISE: 25, ECE: 15, AIML: 10 },
        participatingColleges: [
          { college: 'Sathyabama Institute', city: 'Chennai', teams: 10 },
          { college: 'SRM University', city: 'Chennai', teams: 8 },
          { college: 'VIT Chennai', city: 'Chennai', teams: 7 },
        ],
        yearWise: { '1st Year': 20, '2nd Year': 35, '3rd Year': 45 },
        registrationTrend: [
          { date: 'Mar 01', count: 12 },
          { date: 'Mar 08', count: 26 },
          { date: 'Mar 13', count: 41 },
        ],
        domainWinRates: [{ domain: 'Open Source', participated: 41, wins: 7, rate: '17.0%' }],
        averageWinRate: '17.0%',
      }),
    },
  ];

  for (let i = 0; i < eventsData.length; i++) {
    const e = eventsData[i];
    const createdEvent = await prisma.event.create({
      data: {
        id: uuidv7(),
        organizationId: club.id,
        title: e.title,
        slug: e.slug,
        description: e.description,
        category: e.category,
        domain: e.domain,
        status: e.status,
        venue: e.venue,
        mode: e.mode,
        startAt: e.startAt,
        endAt: e.endAt,
        totalSeats: e.totalSeats,
        remainingSeats: e.remainingSeats,
        teamsCount: e.teamsCount,
        memberPrice: e.memberPrice,
        nonMemberPrice: e.nonMemberPrice,
        bannerUrl: e.bannerUrl,
        inchargeId: e.inchargeId,
        prizes: e.prizes,
        analyticsData: e.analyticsData,
      },
    });

    // Seed tasks for the event assigned to volunteers
    if (volunteer) {
      await prisma.eventTask.create({
        data: {
          id: uuidv7(),
          eventId: createdEvent.id,
          title: `Setup Audio-Visual & Projector Racks for ${createdEvent.title.substring(0, 25)}`,
          description: 'Ensure double-display mirroring and wireless mic batteries are tested 1 hour prior.',
          assignedToId: volunteer.id,
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          deadline: new Date(createdEvent.startAt.getTime() - 2 * 3600000),
        },
      });

      await prisma.eventTask.create({
        data: {
          id: uuidv7(),
          eventId: createdEvent.id,
          title: 'Attendee QR Pass Check-in & Badge Distribution',
          description: 'Operate the door scanner app at Registration Counter 1. Verify student identity cards.',
          assignedToId: volunteer.id,
          priority: 'URGENT',
          status: 'PENDING',
          deadline: createdEvent.startAt,
        },
      });

      await prisma.eventTask.create({
        data: {
          id: uuidv7(),
          eventId: createdEvent.id,
          title: 'Catering & Participant Refreshment Kits',
          description: 'Distribute lunch and energy drinks to all registered teams in Annex Hall.',
          assignedToId: volunteer.id,
          priority: 'MEDIUM',
          status: 'PENDING',
          deadline: new Date(createdEvent.startAt.getTime() + 4 * 3600000),
        },
      });
    }

    // Seed realistic attendee bookings and payments for the first 4 events
    const allUsers = await prisma.user.findMany({ take: 8 });
    if (allUsers.length > 0 && (i === 0 || i === 1 || i === 2 || i === 3)) {
      const attendeeSample = [
        { name: 'Kavya Sundaram', roll: '23CS104', dept: 'CSE', member: true, checked: true },
        { name: 'Rohan Verma', roll: '23IT045', dept: 'ISE', member: false, checked: true },
        { name: 'Pooja Iyer', roll: '24AI012', dept: 'AIML', member: true, checked: true },
        { name: 'Rahul Nair', roll: '22EC089', dept: 'ECE', member: false, checked: false },
        { name: 'Aadhya Sharma', roll: '23CS112', dept: 'CSE', member: true, checked: true },
        { name: 'Varun Teja', roll: '24ME034', dept: 'ME', member: false, checked: false },
      ];

      for (let bIdx = 0; bIdx < attendeeSample.length; bIdx++) {
        const att = attendeeSample[bIdx];
        const userToAssign = allUsers[bIdx % allUsers.length];
        const price = att.member ? createdEvent.memberPrice : createdEvent.nonMemberPrice;
        const bookingId = uuidv7();

        const booking = await prisma.booking.create({
          data: {
            id: bookingId,
            bookingNumber: `TKT-2026-${(i + 1) * 100 + bIdx + 1}`,
            userId: userToAssign.id,
            eventId: createdEvent.id,
            quantity: 1,
            unitPrice: price,
            totalAmount: price,
            currency: 'INR',
            status: 'CONFIRMED',
            confirmedAt: new Date(Date.now() - (7 - bIdx) * 86400000),
            checkedInAt: att.checked ? new Date(Date.now() - (3 - (bIdx % 3)) * 3600000) : null,
          },
        });

        // Add payment record
        await prisma.payment.create({
          data: {
            id: uuidv7(),
            userId: userToAssign.id,
            bookingId: booking.id,
            status: 'CAPTURED',
            amount: price,
            currency: 'INR',
            razorpayOrderId: `order_seed_${i}_${bIdx}_${Date.now()}`,
            razorpayPaymentId: `pay_seed_${i}_${bIdx}_${Date.now()}`,
            capturedAt: new Date(Date.now() - (7 - bIdx) * 86400000),
          },
        });
      }
    }
  }

  console.log(`🎉 Successfully seeded ${eventsData.length} events with complete analytics, incharges, tasks, and attendee bookings!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
