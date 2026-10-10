export type IncomeStreamType =
  | 'MEMBERSHIP_DUES'
  | 'TICKET_SALES'
  | 'MERCHANDISE'
  | 'FUNDRAISER';

export interface IncomeItem {
  id: string;
  source: IncomeStreamType;
  title: string;
  payerName: string;
  payerEmail?: string;
  payerRoll?: string;
  amount: number;
  date: string;
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'CASH';
  paymentId: string;
  status: 'VERIFIED' | 'SETTLED';
  reference: string;
  categoryTag?: string;
}

export type ExpenseCategoryType =
  | 'VENUE'
  | 'CATERING'
  | 'EQUIPMENT'
  | 'SUPPLIES'
  | 'MERCHANDISE'
  | 'MARKETING'
  | 'LOGISTICS'
  | 'OTHER';

export interface ExpenseRecord {
  id: string;
  title: string;
  category: ExpenseCategoryType;
  amount: number;
  date: string;
  vendor: string;
  paymentMethod: 'BANK_TRANSFER' | 'UPI' | 'PETTY_CASH' | 'CREDIT_CARD';
  receiptNote: string;
  receiptInvoiceNo?: string;
  receiptUrl?: string;
  recordedBy: string;
  notes?: string;
}

export type ReimbursementStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';

export interface ItemizedReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ItemizedReceipt {
  merchantName: string;
  merchantAddress: string;
  merchantGSTIN: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: ItemizedReceiptItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentProofType: string;
  transactionRef: string;
}

export interface ReimbursementClaim {
  id: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerRoll: string;
  volunteerDepartment: string;
  projectName: string;
  title: string;
  category: ExpenseCategoryType;
  amount: number;
  dateSubmitted: string;
  status: ReimbursementStatus;
  receiptNote: string;
  receipt: ItemizedReceipt;
  reviewerNotes?: string;
  reviewedBy?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  payoutDetails?: {
    payoutDate: string;
    payoutMethod: 'IMPS' | 'UPI' | 'NEFT' | 'CASH';
    transactionRef: string;
    disbursedBy: string;
    accountReference: string;
  };
}

export interface SemesterReportData {
  semester: string;
  academicYear: string;
  status: 'ACTIVE_INTERIM' | 'AUDITED_FINAL';
  openingBalance: number;
  incomeBreakdown: {
    membershipDues: number;
    ticketSales: number;
    merchandise: number;
    fundraisers: number;
    sponsorships: number;
    totalIncome: number;
  };
  expenseBreakdown: {
    venueBooking: number;
    galaCatering: number;
    volunteerReimbursements: number;
    merchandisePrinting: number;
    equipmentAndSound: number;
    suppliesAndDecor: number;
    totalExpenses: number;
  };
  netOperatingSurplus: number;
  netClosingBalance: number;
  auditedBy: string;
  facultyAdvisor: string;
  certifiedDate: string;
  auditHash: string;
}

export interface PaymentTransactionRecord {
  id: string;
  timestamp: string;
  type: 'INFLOW' | 'OUTFLOW';
  sourceCategory: string;
  partyName: string;
  partyDetails: string;
  amount: number;
  method: 'UPI' | 'IMPS' | 'NEFT' | 'CARD' | 'NET_BANKING' | 'CASH';
  referenceId: string;
  status: 'SETTLED' | 'CLEARED' | 'DISBURSED';
  verifiedHash: string;
}

export interface FinancialAuditLogItem {
  id: string;
  timestamp: string;
  action:
    | 'PAYOUT_RECORDED'
    | 'CLAIM_APPROVED'
    | 'CLAIM_REJECTED'
    | 'EXPENSE_RECORDED'
    | 'INCOME_LOGGED'
    | 'REPORT_GENERATED'
    | 'AUDIT_SEALED';
  actor: string;
  details: string;
  amount?: number;
  referenceId: string;
  verificationHash: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial Seed Data (Harmonized with Spring 2026 mockTreasurerLedger)
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_INCOME_ITEMS: IncomeItem[] = [
  {
    id: 'inc-01',
    source: 'MEMBERSHIP_DUES',
    title: 'Annual Membership Dues Collection (Batch 1)',
    payerName: 'Deepak Kumar',
    payerEmail: 'deepaka.ad24@bitsathy.ac.in',
    payerRoll: '7376222AD105',
    amount: 250,
    date: '2026-04-12',
    paymentMethod: 'UPI',
    paymentId: 'pay_UPI_992144810',
    status: 'VERIFIED',
    reference: 'MEM-SSA-2026-0042',
    categoryTag: '194 Paid Members',
  },
  {
    id: 'inc-02',
    source: 'MEMBERSHIP_DUES',
    title: 'Annual Membership Dues Collection (Batch 2)',
    payerName: 'Ananya Deshmukh',
    payerEmail: 'ananya.d@campus.edu',
    payerRoll: '7376222CS204',
    amount: 250,
    date: '2026-04-14',
    paymentMethod: 'UPI',
    paymentId: 'pay_UPI_992145129',
    status: 'VERIFIED',
    reference: 'MEM-SSA-2026-0089',
    categoryTag: '194 Paid Members',
  },
  {
    id: 'inc-03',
    source: 'TICKET_SALES',
    title: 'Spring Gala VIP Table Reservation #4',
    payerName: 'Siddharth Varma',
    payerEmail: 'siddharth.v@campus.edu',
    amount: 1500,
    date: '2026-04-15',
    paymentMethod: 'CARD',
    paymentId: 'pay_CARD_8829104',
    status: 'SETTLED',
    reference: 'TKT-GALA-VIP-004',
    categoryTag: 'Flagship Event',
  },
  {
    id: 'inc-04',
    source: 'TICKET_SALES',
    title: 'Spring Gala Member Passes (Tier 1 General)',
    payerName: 'Campus Online Ticket Portal',
    payerEmail: 'ticketing@campus.edu',
    amount: 57000,
    date: '2026-04-18',
    paymentMethod: 'NET_BANKING',
    paymentId: 'pay_GATEWAY_388192',
    status: 'SETTLED',
    reference: 'GATEWAY-BATCH-388',
    categoryTag: '385 Passes Sold',
  },
  {
    id: 'inc-05',
    source: 'MERCHANDISE',
    title: 'Odoo Classic Piqué Polo Shirt (Size L)',
    payerName: 'Deepak Kumar',
    payerEmail: 'deepaka.ad24@bitsathy.ac.in',
    amount: 699,
    date: '2026-04-14',
    paymentMethod: 'UPI',
    paymentId: 'pay_N93kLa829481',
    status: 'SETTLED',
    reference: 'ORD-SSA-1042',
    categoryTag: 'Store Sales',
  },
  {
    id: 'inc-06',
    source: 'MERCHANDISE',
    title: 'SSA Embroidered Hoodies & Ceramic Mugs Preorders',
    payerName: 'Merchandise Preorder Portal',
    payerEmail: 'merch@campus.edu',
    amount: 33401,
    date: '2026-04-16',
    paymentMethod: 'UPI',
    paymentId: 'pay_MERCH_BULK_8821',
    status: 'SETTLED',
    reference: 'BATCH-ORD-MERCH-APR',
    categoryTag: 'Store Sales',
  },
  {
    id: 'inc-07',
    source: 'FUNDRAISER',
    title: 'Spring Charity Bake Sale - Quad Plaza Booth Cash Float',
    payerName: 'Student Union Plaza Booth #4',
    payerEmail: 'treasury@skyline.org',
    amount: 8700,
    date: '2026-04-20',
    paymentMethod: 'CASH',
    paymentId: 'CASH-REC-BOOTH-04',
    status: 'VERIFIED',
    reference: 'BAKE-SALE-BOOTH-01',
    categoryTag: 'Charity Fundraiser',
  },
  {
    id: 'inc-08',
    source: 'FUNDRAISER',
    title: 'Spring Charity Bake Sale - UPI Counter QR Collections',
    payerName: 'UPI Merchant Counter #1',
    payerEmail: 'treasury@skyline.org',
    amount: 5500,
    date: '2026-04-21',
    paymentMethod: 'UPI',
    paymentId: 'UPI-BATCH-BAKE-992',
    status: 'SETTLED',
    reference: 'BAKE-SALE-UPI-02',
    categoryTag: 'Charity Fundraiser',
  },
  {
    id: 'inc-09',
    source: 'MEMBERSHIP_DUES',
    title: 'Spring General Member Dues Direct Portal Clearing',
    payerName: 'Student Affairs Clearing House',
    payerEmail: 'accounts@campus.edu',
    amount: 48000,
    date: '2026-04-05',
    paymentMethod: 'NET_BANKING',
    paymentId: 'CLG-DUES-SPR26-90',
    status: 'SETTLED',
    reference: 'MEM-BATCH-CLEAR-01',
    categoryTag: '194 Paid Members',
  },
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-rec-01',
    title: 'Main Campus Grand Auditorium Hall Booking Deposit',
    category: 'VENUE',
    amount: 32000,
    date: '2026-04-10',
    vendor: 'University Estates & Facilities Directorate',
    paymentMethod: 'BANK_TRANSFER',
    receiptNote: 'Invoice #EST-2026-0841',
    receiptInvoiceNo: 'EST-2026-0841',
    recordedBy: 'Priya Patel (Treasurer)',
    notes: 'Full day hire for Skyline Annual Spring Gala 2026 including green rooms and stage lighting rigs.',
  },
  {
    id: 'exp-rec-02',
    title: 'Spring Gala 3-Course Banquet Catering (385 Guests)',
    category: 'CATERING',
    amount: 38000,
    date: '2026-04-18',
    vendor: 'Grand Royal Gourmet Caterers Ltd.',
    paymentMethod: 'BANK_TRANSFER',
    receiptNote: 'Tax Invoice #GRC-99120',
    receiptInvoiceNo: 'GRC-99120',
    recordedBy: 'Priya Patel (Treasurer)',
    notes: 'Advance booking deposit & head-count catering for gala dinner attendees and guest dignitaries.',
  },
  {
    id: 'exp-rec-03',
    title: 'Volunteer Approved Expense Reimbursements (Batch Payout)',
    category: 'LOGISTICS',
    amount: 14200,
    date: '2026-04-22',
    vendor: 'CampusMitra Treasury IMPS Clearing',
    paymentMethod: 'BANK_TRANSFER',
    receiptNote: 'Audit Disbursement Schedule #DS-2026-04',
    receiptInvoiceNo: 'DS-2026-04',
    recordedBy: 'Priya Patel (Treasurer)',
    notes: 'Reimbursements for event volunteers: supplies, transportation, and setup items.',
  },
  {
    id: 'exp-rec-04',
    title: 'Official Club Hoodies & Embroidered Polos Batch Production',
    category: 'MERCHANDISE',
    amount: 14800,
    date: '2026-04-15',
    vendor: 'Apex Apparel & Screenprinting Co.',
    paymentMethod: 'BANK_TRANSFER',
    receiptNote: 'Bill #APX-44910',
    receiptInvoiceNo: 'APX-44910',
    recordedBy: 'Priya Patel (Treasurer)',
    notes: 'First batch production of 60 official hoodies and 40 polo shirts for member orders.',
  },
];

export const INITIAL_REIMBURSEMENTS: ReimbursementClaim[] = [
  {
    id: 'CLM-001',
    volunteerName: 'Priya Sharma',
    volunteerEmail: 'priya.s@campus.edu',
    volunteerRoll: '7376221EC112',
    volunteerDepartment: 'Electronics & Communication',
    projectName: 'Spring Charity Bake Sale & Fundraiser',
    title: 'Bake sale organic butter, chocolate chips & flour packaging',
    category: 'SUPPLIES',
    amount: 1450,
    dateSubmitted: '2026-04-28',
    status: 'APPROVED',
    receiptNote: 'Supermarket Tax Invoice #9482 (Attached)',
    reviewerNotes: 'Verified against baking booth requisition. Approved for immediate batch disbursement.',
    reviewedBy: 'Priya Patel (Treasurer)',
    approvedAt: '2026-04-29 11:30',
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
    id: 'CLM-002',
    volunteerName: 'Alex Rivera',
    volunteerEmail: 'alex.r@campus.edu',
    volunteerRoll: '7376221ME105',
    volunteerDepartment: 'Mechanical Engineering',
    projectName: 'Spring Charity Bake Sale & Fundraiser',
    title: 'Lamination sheets & mounting tape for payment QR standees',
    category: 'SUPPLIES',
    amount: 320,
    dateSubmitted: '2026-04-29',
    status: 'REIMBURSED',
    receiptNote: 'Campus Stationery Store Receipt #118',
    reviewerNotes: 'Reimbursed via direct bank transfer #IMPS-938210.',
    reviewedBy: 'Priya Patel (Treasurer)',
    approvedAt: '2026-04-29 16:45',
    payoutDetails: {
      payoutDate: '2026-04-30 14:20',
      payoutMethod: 'IMPS',
      transactionRef: 'IMPS-938210',
      disbursedBy: 'Priya Patel (Treasurer)',
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
    id: 'CLM-003',
    volunteerName: 'Deepak Kumar',
    volunteerEmail: 'deepaka.ad24@bitsathy.ac.in',
    volunteerRoll: '7376222AD105',
    volunteerDepartment: 'Artificial Intelligence & Data Science',
    projectName: 'Skyline Annual Spring Gala 2026',
    title: 'Sound cable adapters & extra heavy-duty microphone batteries',
    category: 'EQUIPMENT',
    amount: 850,
    dateSubmitted: '2026-05-01',
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
    id: 'CLM-004',
    volunteerName: 'Sneha Patel',
    volunteerEmail: 'sneha.p@campus.edu',
    volunteerRoll: '7376222CS188',
    volunteerDepartment: 'Computer Science',
    projectName: 'Spring Charity Bake Sale & Fundraiser',
    title: 'Bake sale booth sanitizers & compostable nitrile food gloves',
    category: 'SUPPLIES',
    amount: 420,
    dateSubmitted: '2026-05-02',
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
    id: 'CLM-005',
    volunteerName: 'Rohan Mehra',
    volunteerEmail: 'rohan.m@campus.edu',
    volunteerRoll: '7376221EE142',
    volunteerDepartment: 'Electrical & Electronics',
    projectName: 'Skyline Annual Spring Gala 2026',
    title: 'Private cab fare for off-campus guest speaker transport',
    category: 'LOGISTICS',
    amount: 650,
    dateSubmitted: '2026-04-26',
    status: 'REJECTED',
    receiptNote: 'Ride Hailing Digital Invoice #UB-9941',
    rejectionReason:
      'Club travel guidelines state that student vehicle transport must use pre-approved University fleet or public transit passes. Non-preapproved private rides cannot be disbursed from student dues.',
    reviewedBy: 'Priya Patel (Treasurer)',
    rejectedAt: '2026-04-27 10:15',
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

export const INITIAL_SEMESTER_REPORTS: SemesterReportData[] = [
  {
    semester: 'Spring 2026',
    academicYear: '2025 - 2026',
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
    auditedBy: 'Priya Patel (Treasurer, Skyline SA)',
    facultyAdvisor: 'Dr. S. Ranganathan (Dean of Student Affairs)',
    certifiedDate: '2026-05-02',
    auditHash: 'SHA256-TREAS-AUDIT-SPR26-98104B',
  },
  {
    semester: 'Fall 2025',
    academicYear: '2025 - 2026',
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
    auditedBy: 'Priya Patel (Treasurer, Skyline SA)',
    facultyAdvisor: 'Dr. S. Ranganathan (Dean of Student Affairs)',
    certifiedDate: '2025-12-18',
    auditHash: 'SHA256-TREAS-AUDIT-FALL25-44912A',
  },
  {
    semester: 'Spring 2025',
    academicYear: '2024 - 2025',
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

export const INITIAL_PAYMENT_RECORDS: PaymentTransactionRecord[] = [
  {
    id: 'TXN-2026-9901',
    timestamp: '2026-04-30 14:20',
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
    id: 'TXN-2026-9902',
    timestamp: '2026-04-22 10:15',
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
    id: 'TXN-2026-9903',
    timestamp: '2026-04-21 16:30',
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
    id: 'TXN-2026-9904',
    timestamp: '2026-04-20 18:00',
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
    id: 'TXN-2026-9905',
    timestamp: '2026-04-18 12:00',
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
    id: 'TXN-2026-9906',
    timestamp: '2026-04-18 09:30',
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
    id: 'TXN-2026-9907',
    timestamp: '2026-04-16 17:40',
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
    id: 'TXN-2026-9908',
    timestamp: '2026-04-15 15:20',
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
    id: 'TXN-2026-9909',
    timestamp: '2026-04-14 11:24',
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
    id: 'TXN-2026-9910',
    timestamp: '2026-04-10 14:00',
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

export const INITIAL_AUDIT_LOGS: FinancialAuditLogItem[] = [
  {
    id: 'AUD-991',
    timestamp: '2026-04-30 14:20',
    action: 'PAYOUT_RECORDED',
    actor: 'Priya Patel (Treasurer)',
    details: 'Disbursed reimbursement payout of ₹320 for Claim #CLM-002 (Alex Rivera) via IMPS Ref #IMPS-938210.',
    amount: 320,
    referenceId: 'CLM-002',
    verificationHash: 'SHA256-AUD-PAYOUT-CLM002-320',
  },
  {
    id: 'AUD-992',
    timestamp: '2026-04-29 16:45',
    action: 'CLAIM_APPROVED',
    actor: 'Priya Patel (Treasurer)',
    details: 'Approved reimbursement Claim #CLM-002 (Lamination sheets) submitted by Alex Rivera after receipt audit.',
    amount: 320,
    referenceId: 'CLM-002',
    verificationHash: 'SHA256-AUD-APPR-CLM002',
  },
  {
    id: 'AUD-993',
    timestamp: '2026-04-29 11:30',
    action: 'CLAIM_APPROVED',
    actor: 'Priya Patel (Treasurer)',
    details: 'Approved reimbursement Claim #CLM-001 (Bake sale butter & packaging) submitted by Priya Sharma for ₹1,450.',
    amount: 1450,
    referenceId: 'CLM-001',
    verificationHash: 'SHA256-AUD-APPR-CLM001',
  },
  {
    id: 'AUD-994',
    timestamp: '2026-04-27 10:15',
    action: 'CLAIM_REJECTED',
    actor: 'Priya Patel (Treasurer)',
    details: 'Rejected Claim #CLM-005 (Cab ride fare ₹650). Reason: Non-compliant with university fleet travel policy.',
    amount: 650,
    referenceId: 'CLM-005',
    verificationHash: 'SHA256-AUD-REJ-CLM005',
  },
  {
    id: 'AUD-995',
    timestamp: '2026-04-21 17:00',
    action: 'INCOME_LOGGED',
    actor: 'Priya Patel (Treasurer)',
    details: 'Verified and reconciled Bake Sale QR payment collections of ₹5,500 into club treasury ledger.',
    amount: 5500,
    referenceId: 'UPI-BATCH-BAKE-992',
    verificationHash: 'SHA256-AUD-INC-BAKE-UPI',
  },
  {
    id: 'AUD-996',
    timestamp: '2026-04-20 18:30',
    action: 'INCOME_LOGGED',
    actor: 'Priya Patel (Treasurer)',
    details: 'Received physical cash float handover of ₹8,700 from Quad Plaza Booth #4; signed and locked in safe.',
    amount: 8700,
    referenceId: 'CASH-REC-BOOTH-04',
    verificationHash: 'SHA256-AUD-INC-CASH-BOOTH',
  },
  {
    id: 'AUD-997',
    timestamp: '2026-04-18 12:15',
    action: 'EXPENSE_RECORDED',
    actor: 'Priya Patel (Treasurer)',
    details: 'Recorded catering outflow of ₹38,000 to Grand Royal Gourmet Caterers under Spring Gala budget.',
    amount: 38000,
    referenceId: 'GRC-99120',
    verificationHash: 'SHA256-AUD-EXP-CATERING-38K',
  },
  {
    id: 'AUD-998',
    timestamp: '2026-04-10 14:30',
    action: 'EXPENSE_RECORDED',
    actor: 'Priya Patel (Treasurer)',
    details: 'Recorded venue hire expense of ₹32,000 to University Estates for Grand Auditorium reservation.',
    amount: 32000,
    referenceId: 'EST-2026-0841',
    verificationHash: 'SHA256-AUD-EXP-VENUE-32K',
  },
];
