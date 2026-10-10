export type DuesPaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE' | 'WAIVED';
export type MemberRoleType = 'MEMBER' | 'VOLUNTEER' | 'CORE_COMMITTEE' | 'ASSOCIATE';

export interface DuesPaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: 'UPI' | 'CASH' | 'NET_BANKING' | 'CARD';
  reference: string;
  notes?: string;
  recordedBy: string;
}

export interface StudentDuesRecord {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone?: string;
  rollNumber: string;
  department: string;
  yearOfStudy: string;
  membershipStatus: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'ASSOCIATE';
  clubRole: MemberRoleType;
  academicYear: string;
  annualFee: number;
  amountPaid: number;
  outstandingBalance: number;
  paymentStatus: DuesPaymentStatus;
  lastPaymentDate?: string;
  paymentMethod?: string;
  transactionRef?: string;
  dueDate: string;
  notes?: string;
  paymentHistory: DuesPaymentRecord[];
}

export interface DuesConfiguration {
  academicYear: string;
  annualFee: number;
  paymentDeadline: string;
  clubId: string;
  clubName: string;
  lateFeeApplicable: boolean;
  lateFeeAmount: number;
}

export const INITIAL_DUES_CONFIG: DuesConfiguration = {
  academicYear: '2025–2026',
  annualFee: 250,
  paymentDeadline: '2026-05-31',
  clubId: 'club-skyline-sa-001',
  clubName: 'Skyline Student Association',
  lateFeeApplicable: false,
  lateFeeAmount: 50,
};

export const INITIAL_STUDENT_DUES: StudentDuesRecord[] = [
  {
    id: 'dues-001',
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
        recordedBy: 'Priya Patel (Treasurer)',
      },
    ],
  },
  {
    id: 'dues-002',
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
    transactionRef: 'MEM-SSA-2026-0042',
    dueDate: '2026-05-31',
    paymentHistory: [
      {
        id: 'pay-d-002',
        amount: 250,
        date: '2026-04-12',
        method: 'UPI',
        reference: 'MEM-SSA-2026-0042',
        notes: 'Batch 1 Dues collection confirmed',
        recordedBy: 'Priya Patel (Treasurer)',
      },
    ],
  },
  {
    id: 'dues-003',
    studentId: 'SSA-2026-0002',
    name: 'Hemanth S V',
    email: 'hemanthsv.al24@bitsathy.ac.in',
    phone: '+91 97890 22341',
    rollNumber: '7376222AL145',
    department: 'Artificial Intelligence & DS',
    yearOfStudy: '2nd Year',
    membershipStatus: 'ACTIVE',
    clubRole: 'MEMBER',
    academicYear: '2025–2026',
    annualFee: 250,
    amountPaid: 250,
    outstandingBalance: 0,
    paymentStatus: 'PAID',
    lastPaymentDate: '2026-04-08',
    paymentMethod: 'NET_BANKING',
    transactionRef: 'NEFT-IMPS-884102',
    dueDate: '2026-05-31',
    paymentHistory: [
      {
        id: 'pay-d-003',
        amount: 250,
        date: '2026-04-08',
        method: 'NET_BANKING',
        reference: 'NEFT-IMPS-884102',
        notes: 'SBI Net Banking Transfer',
        recordedBy: 'Priya Patel (Treasurer)',
      },
    ],
  },
  {
    id: 'dues-004',
    studentId: 'SSA-2026-0003',
    name: 'Rithish S',
    email: 'rithishs.cs24@bitsathy.ac.in',
    phone: '+91 99401 55621',
    rollNumber: '7376222CS204',
    department: 'Computer Science & Engineering',
    yearOfStudy: '2nd Year',
    membershipStatus: 'ACTIVE',
    clubRole: 'MEMBER',
    academicYear: '2025–2026',
    annualFee: 250,
    amountPaid: 250,
    outstandingBalance: 0,
    paymentStatus: 'PAID',
    lastPaymentDate: '2026-04-11',
    paymentMethod: 'UPI',
    transactionRef: 'UPI-PAY-77123984',
    dueDate: '2026-05-31',
    paymentHistory: [
      {
        id: 'pay-d-004',
        amount: 250,
        date: '2026-04-11',
        method: 'UPI',
        reference: 'UPI-PAY-77123984',
        notes: 'PhonePe QR scan at club desk',
        recordedBy: 'Priya Patel (Treasurer)',
      },
    ],
  },
  {
    id: 'dues-005',
    studentId: 'SSA-2026-0043',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@campus.edu',
    phone: '+91 98214 77410',
    rollNumber: '7376221DM102',
    department: 'Design & Media',
    yearOfStudy: '3rd Year',
    membershipStatus: 'ACTIVE',
    clubRole: 'CORE_COMMITTEE',
    academicYear: '2025–2026',
    annualFee: 250,
    amountPaid: 150,
    outstandingBalance: 100,
    paymentStatus: 'PARTIAL',
    lastPaymentDate: '2026-04-01',
    paymentMethod: 'CASH',
    transactionRef: 'CASH-REC-1049',
    dueDate: '2026-05-31',
    paymentHistory: [
      {
        id: 'pay-d-005',
        amount: 150,
        date: '2026-04-01',
        method: 'CASH',
        reference: 'CASH-REC-1049',
        notes: 'Partial payment received at general body meet; remaining balance ₹100 due by May 31',
        recordedBy: 'Priya Patel (Treasurer)',
      },
    ],
  },
  {
    id: 'dues-006',
    studentId: 'SSA-2026-0089',
    name: 'Karthik Raja',
    email: 'karthik.r@campus.edu',
    phone: '+91 97120 44912',
    rollNumber: '7376220ME180',
    department: 'Mechanical Engineering',
    yearOfStudy: '4th Year',
    membershipStatus: 'PENDING',
    clubRole: 'MEMBER',
    academicYear: '2025–2026',
    annualFee: 250,
    amountPaid: 0,
    outstandingBalance: 250,
    paymentStatus: 'OVERDUE',
    dueDate: '2026-03-31',
    paymentHistory: [],
    notes: 'Past initial early-bird deadline; reminder notification sent twice.',
  },
  {
    id: 'dues-007',
    studentId: 'SSA-2026-0112',
    name: 'Meera Nambiar',
    email: 'meera.n@campus.edu',
    phone: '+91 96321 00192',
    rollNumber: '7376222EC114',
    department: 'Electronics & Communication',
    yearOfStudy: '2nd Year',
    membershipStatus: 'ACTIVE',
    clubRole: 'VOLUNTEER',
    academicYear: '2025–2026',
    annualFee: 250,
    amountPaid: 250,
    outstandingBalance: 0,
    paymentStatus: 'PAID',
    lastPaymentDate: '2026-04-05',
    paymentMethod: 'UPI',
    transactionRef: 'UPI-ICICI-661204',
    dueDate: '2026-05-31',
    paymentHistory: [
      {
        id: 'pay-d-007',
        amount: 250,
        date: '2026-04-05',
        method: 'UPI',
        reference: 'UPI-ICICI-661204',
        notes: 'Full dues clear',
        recordedBy: 'Priya Patel (Treasurer)',
      },
    ],
  },
  {
    id: 'dues-008',
    studentId: 'SSA-2026-0155',
    name: 'Rohan Mehra',
    email: 'rohan.m@campus.edu',
    phone: '+91 94511 88301',
    rollNumber: '7376220ME112',
    department: 'Mechanical Engineering',
    yearOfStudy: '4th Year',
    membershipStatus: 'PENDING',
    clubRole: 'MEMBER',
    academicYear: '2025–2026',
    annualFee: 250,
    amountPaid: 0,
    outstandingBalance: 250,
    paymentStatus: 'PENDING',
    dueDate: '2026-05-31',
    paymentHistory: [],
  },
  {
    id: 'dues-009',
    studentId: 'SSA-2026-0021',
    name: 'Sneha Sundaram',
    email: 'sneha.s@skyline.edu',
    phone: '+91 99120 77312',
    rollNumber: '7376221IS109',
    department: 'Information Science',
    yearOfStudy: '3rd Year',
    membershipStatus: 'ACTIVE',
    clubRole: 'CORE_COMMITTEE',
    academicYear: '2025–2026',
    annualFee: 250,
    amountPaid: 250,
    outstandingBalance: 0,
    paymentStatus: 'PAID',
    lastPaymentDate: '2026-04-02',
    paymentMethod: 'CARD',
    transactionRef: 'CARD-POS-44129',
    dueDate: '2026-05-31',
    paymentHistory: [
      {
        id: 'pay-d-009',
        amount: 250,
        date: '2026-04-02',
        method: 'CARD',
        reference: 'CARD-POS-44129',
        notes: 'Debit Card payment at Treasury Office Terminal',
        recordedBy: 'Priya Patel (Treasurer)',
      },
    ],
  },
  {
    id: 'dues-010',
    studentId: 'SSA-2026-0204',
    name: 'Pooja Hegde',
    email: 'pooja.h@campus.edu',
    phone: '+91 98801 33214',
    rollNumber: '7376223BT108',
    department: 'Biotechnology',
    yearOfStudy: '1st Year',
    membershipStatus: 'ACTIVE',
    clubRole: 'MEMBER',
    academicYear: '2025–2026',
    annualFee: 250,
    amountPaid: 100,
    outstandingBalance: 150,
    paymentStatus: 'PARTIAL',
    lastPaymentDate: '2026-04-14',
    paymentMethod: 'CASH',
    transactionRef: 'CASH-FLOAT-1102',
    dueDate: '2026-05-31',
    paymentHistory: [
      {
        id: 'pay-d-010',
        amount: 100,
        date: '2026-04-14',
        method: 'CASH',
        reference: 'CASH-FLOAT-1102',
        notes: 'Freshman installment 1 of 2',
        recordedBy: 'Priya Patel (Treasurer)',
      },
    ],
  },
  {
    id: 'dues-011',
    studentId: 'SSA-2026-0219',
    name: 'Vikramaditya Roy',
    email: 'vikram.r@campus.edu',
    phone: '+91 97312 99411',
    rollNumber: '7376222CV121',
    department: 'Civil Engineering',
    yearOfStudy: '2nd Year',
    membershipStatus: 'PENDING',
    clubRole: 'MEMBER',
    academicYear: '2025–2026',
    annualFee: 250,
    amountPaid: 0,
    outstandingBalance: 250,
    paymentStatus: 'PENDING',
    dueDate: '2026-05-31',
    paymentHistory: [],
  },
  {
    id: 'dues-012',
    studentId: 'SSA-2026-0230',
    name: 'Aditi Sharma',
    email: 'aditi.s@campus.edu',
    phone: '+91 98110 55412',
    rollNumber: '7376223EE140',
    department: 'Electrical Engineering',
    yearOfStudy: '1st Year',
    membershipStatus: 'ACTIVE',
    clubRole: 'VOLUNTEER',
    academicYear: '2025–2026',
    annualFee: 250,
    amountPaid: 250,
    outstandingBalance: 0,
    paymentStatus: 'WAIVED',
    lastPaymentDate: '2026-04-03',
    paymentMethod: 'CASH',
    transactionRef: 'WAIVER-DEAN-2026-04',
    dueDate: '2026-05-31',
    notes: 'Institutional hardship fee waiver approved by Dean of Student Affairs & Club President',
    paymentHistory: [
      {
        id: 'pay-d-012',
        amount: 250,
        date: '2026-04-03',
        method: 'CASH',
        reference: 'WAIVER-DEAN-2026-04',
        notes: 'Hardship Grant Waiver allocation',
        recordedBy: 'Priya Patel (Treasurer)',
      },
    ],
  },
];
