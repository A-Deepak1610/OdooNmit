export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Club President' | 'Treasurer' | 'Event Organizer' | 'Volunteer' | 'Member';
  organizationIds: string[];
  organizationNames: string[];
  status: 'Active' | 'Suspended' | 'Pending';
  joinedAt: string;
  lastActive: string;
  avatarColor: string;
  department: string;
  semester: number;
}

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-000',
    name: 'THIRUMURUGAN K',
    email: 'thirumurugank.al24@bitsathy.ac.in',
    phone: '+91 94883 45678',
    role: 'Super Admin',
    organizationIds: ['ORG-001', 'ORG-002'],
    organizationNames: ['Central Campus Administration', 'Skyline Student Association'],
    status: 'Active',
    joinedAt: '2025-05-15',
    lastActive: 'Today, 2:45 PM',
    avatarColor: '#10B981',
    department: 'Artificial Intelligence & Data Science',
    semester: 7,
  },
  {
    id: 'USR-TEAM-01',
    name: 'DEEPAK A',
    email: 'deepaka.ad24@bitsathy.ac.in',
    phone: '+91 98401 23456',
    role: 'Club President',
    organizationIds: ['ORG-001'],
    organizationNames: ['Skyline Student Association'],
    status: 'Active',
    joinedAt: '2025-06-15',
    lastActive: 'Today, 2:15 PM',
    avatarColor: '#2563EB',
    department: 'Artificial Intelligence & DS',
    semester: 7,
  },
  {
    id: 'USR-TEAM-02',
    name: 'HEMANTH S V',
    email: 'hemanthsv.al24@bitsathy.ac.in',
    phone: '+91 98402 34567',
    role: 'Treasurer',
    organizationIds: ['ORG-001'],
    organizationNames: ['Skyline Student Association'],
    status: 'Active',
    joinedAt: '2025-06-20',
    lastActive: 'Today, 1:45 PM',
    avatarColor: '#7C3AED',
    department: 'Artificial Intelligence & DS',
    semester: 7,
  },
  {
    id: 'USR-TEAM-03',
    name: 'RITHISH S',
    email: 'rithishs.cs24@bitsathy.ac.in',
    phone: '+91 98403 45678',
    role: 'Event Organizer',
    organizationIds: ['ORG-001', 'ORG-002'],
    organizationNames: ['Skyline Student Association', 'Coding Club'],
    status: 'Active',
    joinedAt: '2025-06-25',
    lastActive: 'Today, 1:30 PM',
    avatarColor: '#D97706',
    department: 'Computer Science & Eng',
    semester: 7,
  },
  {
    id: 'USR-002',
    name: 'Vikram Malhotra',
    email: 'vikram.m@nmit.edu.in',
    phone: '+91 98450 12345',
    role: 'Club President',
    organizationIds: ['ORG-002'],
    organizationNames: ['Coding Club'],
    status: 'Active',
    joinedAt: '2025-08-12',
    lastActive: 'Yesterday',
    avatarColor: '#4F46E5',
    department: 'Computer Science & Eng',
    semester: 7,
  },
  {
    id: 'USR-003',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@nmit.edu.in',
    phone: '+91 97412 88901',
    role: 'Volunteer',
    organizationIds: ['ORG-003'],
    organizationNames: ['Robotics Club'],
    status: 'Active',
    joinedAt: '2025-08-15',
    lastActive: '2 days ago',
    avatarColor: '#0284C7',
    department: 'Mechanical & Automation',
    semester: 5,
  },
  {
    id: 'USR-004',
    name: 'Karthik Raja',
    email: 'karthik.r@campus.edu',
    phone: '+91 96321 44556',
    role: 'Member',
    organizationIds: ['ORG-001'],
    organizationNames: ['Skyline Student Association'],
    status: 'Active',
    joinedAt: '2025-09-01',
    lastActive: '3 days ago',
    avatarColor: '#D97706',
    department: 'Electronics & Comm',
    semester: 3,
  },
];
