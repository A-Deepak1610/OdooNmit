export type ProductAvailability = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
export type OrderFulfillmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderPaymentStatus =
  | 'PAID'
  | 'PARTIAL'
  | 'UNPAID'
  | 'VERIFICATION_PENDING'
  | 'FAILED'
  | 'REFUNDED';

export interface ProductVariant {
  size: string;
  sku: string;
  onHandStock: number;
  reservedStock: number;
  soldStock: number;
}

export interface StockAdjustmentLog {
  id: string;
  productId: string;
  productName: string;
  variantSize: string;
  delta: number;
  previousStock: number;
  newStock: number;
  reason: string;
  date: string;
  adjustedBy: string;
}

export interface MerchProduct {
  id: string;
  clubId: string;
  name: string;
  description: string;
  category: string;
  image: string;
  sellingPrice: number;
  costPrice?: number;
  memberPrice?: number;
  sku: string;
  status: ProductAvailability;
  lowStockThreshold: number;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
  stockHistory?: StockAdjustmentLog[];
}

export interface StudentMerchOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  clubId: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentPhone?: string;
  department?: string;
  productId: string;
  productName: string;
  variantSize: string;
  quantity: number;
  unitPrice: number;
  orderTotal: number;
  amountPaid: number;
  outstandingBalance: number;
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  paymentMethod?: 'UPI' | 'CASH' | 'CARD' | 'NET_BANKING';
  transactionRef?: string;
  expectedPickupDate?: string;
  handoverAt?: string;
  handoverBy?: string;
  notes?: string;
  cancellationReason?: string;
}

export const INITIAL_MERCH_PRODUCTS: MerchProduct[] = [
  {
    id: 'prod-polo-01',
    clubId: 'club-skyline-sa-001',
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
    createdAt: '2026-03-01',
    updatedAt: '2026-04-12',
    variants: [
      { size: 'S', sku: 'SKU-SSA-POLO-S', onHandStock: 25, reservedStock: 3, soldStock: 18 },
      { size: 'M', sku: 'SKU-SSA-POLO-M', onHandStock: 35, reservedStock: 4, soldStock: 25 },
      { size: 'L', sku: 'SKU-SSA-POLO-L', onHandStock: 20, reservedStock: 2, soldStock: 14 },
      { size: 'XL', sku: 'SKU-SSA-POLO-XL', onHandStock: 15, reservedStock: 1, soldStock: 10 },
      { size: '2XL', sku: 'SKU-SSA-POLO-2XL', onHandStock: 8, reservedStock: 0, soldStock: 5 },
    ],
  },
  {
    id: 'prod-hoodie-02',
    clubId: 'club-skyline-sa-001',
    name: 'CampusMitra Skyline Tech Hoodie',
    description: 'Heavyweight 360 GSM fleece hoodie with custom embroidered chest crest, kangaroo pouch pocket, and ribbed hem.',
    category: 'Apparel & Uniforms',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    sellingPrice: 1499,
    memberPrice: 850,
    costPrice: 580,
    sku: 'SKU-SSA-HOD-2026',
    status: 'ACTIVE',
    lowStockThreshold: 8,
    createdAt: '2026-03-10',
    updatedAt: '2026-04-10',
    variants: [
      { size: 'S', sku: 'SKU-SSA-HOD-S', onHandStock: 14, reservedStock: 2, soldStock: 12 },
      { size: 'M', sku: 'SKU-SSA-HOD-M', onHandStock: 22, reservedStock: 5, soldStock: 28 },
      { size: 'L', sku: 'SKU-SSA-HOD-L', onHandStock: 18, reservedStock: 3, soldStock: 22 },
      { size: 'XL', sku: 'SKU-SSA-HOD-XL', onHandStock: 6, reservedStock: 2, soldStock: 15 }, // low stock
      { size: '2XL', sku: 'SKU-SSA-HOD-2XL', onHandStock: 2, reservedStock: 2, soldStock: 8 }, // 0 available (out of stock available)
    ],
  },
  {
    id: 'prod-mug-03',
    clubId: 'club-skyline-sa-001',
    name: 'Odoo Official Ceramic Mug',
    description: 'High-gloss 11oz ceramic mug with vivid Odoo emblem print. Dishwasher and microwave safe.',
    category: 'Goodies & Drinkware',
    image: 'https://odoocdn.com/web/image/product.product/20563/image_1024/Mug?unique=02e5ff9',
    sellingPrice: 450,
    memberPrice: 250,
    costPrice: 120,
    sku: 'SKU-SSA-MUG-23195',
    status: 'ACTIVE',
    lowStockThreshold: 15,
    createdAt: '2026-02-15',
    updatedAt: '2026-04-05',
    variants: [
      { size: '11 oz', sku: 'SKU-SSA-MUG-11OZ', onHandStock: 50, reservedStock: 4, soldStock: 45 },
      { size: '15 oz', sku: 'SKU-SSA-MUG-15OZ', onHandStock: 24, reservedStock: 2, soldStock: 20 },
    ],
  },
  {
    id: 'prod-sneakers-04',
    clubId: 'club-skyline-sa-001',
    name: 'Odoo Signature Low-Top Sneakers',
    description: 'Comfortable low-top canvas sneakers in signature purple & white colorway with durable vulcanized rubber soles.',
    category: 'Footwear & Lifestyle',
    image: 'https://odoocdn.com/web/image/product.image/11/image_1024/Odoo%20Shoes?unique=9b6c356',
    sellingPrice: 2999,
    memberPrice: 1899,
    costPrice: 1100,
    sku: 'SKU-SSA-SHOE-23198',
    status: 'ACTIVE',
    lowStockThreshold: 5,
    createdAt: '2026-03-12',
    updatedAt: '2026-04-14',
    variants: [
      { size: 'UK 7 (39)', sku: 'SKU-SSA-SHOE-39', onHandStock: 10, reservedStock: 1, soldStock: 8 },
      { size: 'UK 8 (40)', sku: 'SKU-SSA-SHOE-40', onHandStock: 14, reservedStock: 2, soldStock: 12 },
      { size: 'UK 9 (41)', sku: 'SKU-SSA-SHOE-41', onHandStock: 18, reservedStock: 1, soldStock: 15 },
      { size: 'UK 10 (42)', sku: 'SKU-SSA-SHOE-42', onHandStock: 12, reservedStock: 1, soldStock: 10 },
      { size: 'UK 11 (43)', sku: 'SKU-SSA-SHOE-43', onHandStock: 4, reservedStock: 1, soldStock: 6 }, // low stock
      { size: 'UK 12 (44)', sku: 'SKU-SSA-SHOE-44', onHandStock: 1, reservedStock: 1, soldStock: 4 }, // out of stock available
    ],
  },
  {
    id: 'prod-bottle-05',
    clubId: 'club-skyline-sa-001',
    name: 'Stainless Steel Insulated Thermal Flask (750ml)',
    description: 'Double-walled vacuum insulated bottle keeping water chilled for 24 hours or piping hot for 12 hours. Laser engraved club logo.',
    category: 'Goodies & Drinkware',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    sellingPrice: 550,
    memberPrice: 380,
    costPrice: 210,
    sku: 'SKU-SSA-FLASK-750',
    status: 'ACTIVE',
    lowStockThreshold: 12,
    createdAt: '2026-03-20',
    updatedAt: '2026-04-12',
    variants: [
      { size: '750 ml - Matte Black', sku: 'SKU-SSA-FLASK-BLK', onHandStock: 32, reservedStock: 3, soldStock: 25 },
      { size: '750 ml - Indigo Silver', sku: 'SKU-SSA-FLASK-SLV', onHandStock: 28, reservedStock: 2, soldStock: 19 },
    ],
  },
  {
    id: 'prod-boardgame-06',
    clubId: 'club-skyline-sa-001',
    name: 'Scale-Up! The Business Game',
    description: 'Learn real-world business & ERP management with 36 interactive business challenge cards across 4 real startup case studies.',
    category: 'Educational & Board Games',
    image: 'https://odoocdn.com/web/image/product.product/107155/image_1024/%5BSCUD%5D%20Scale-Up%21%20Business%20Game%20%5BDE%5D?unique=bce70b4',
    sellingPrice: 1499,
    memberPrice: 899,
    costPrice: 550,
    sku: 'SKU-SSA-SCAL-GAME',
    status: 'ACTIVE',
    lowStockThreshold: 6,
    createdAt: '2026-02-28',
    updatedAt: '2026-04-01',
    variants: [
      { size: 'Standard Edition', sku: 'SKU-SSA-SCAL-STD', onHandStock: 24, reservedStock: 2, soldStock: 22 },
      { size: 'Deluxe Collector Pack', sku: 'SKU-SSA-SCAL-DLX', onHandStock: 12, reservedStock: 1, soldStock: 11 },
    ],
  },
];

export const INITIAL_STUDENT_ORDERS: StudentMerchOrder[] = [
  {
    id: 'ord-001',
    orderNumber: 'ORD-SSA-1042',
    orderDate: '2026-04-14 11:20 AM',
    clubId: 'club-skyline-sa-001',
    studentName: 'Deepak Kumar',
    studentId: 'SSA-2026-0042',
    studentEmail: 'deepaka.ad24@bitsathy.ac.in',
    studentPhone: '+91 94432 88120',
    department: 'Computer Science & Engineering',
    productId: 'prod-polo-01',
    productName: 'Odoo Classic Piqué Polo Shirt',
    variantSize: 'L',
    quantity: 1,
    unitPrice: 699,
    orderTotal: 699,
    amountPaid: 699,
    outstandingBalance: 0,
    paymentStatus: 'PAID',
    fulfillmentStatus: 'READY_FOR_PICKUP',
    paymentMethod: 'UPI',
    transactionRef: 'pay_N93kLa829481',
    expectedPickupDate: '2026-04-18',
    notes: 'Member discount applied (₹699 vs ₹1199). Package labeled and staged at Student Union Desk #2.',
  },
  {
    id: 'ord-002',
    orderNumber: 'ORD-SSA-1043',
    orderDate: '2026-04-14 02:45 PM',
    clubId: 'club-skyline-sa-001',
    studentName: 'THIRUMURUGAN K',
    studentId: 'SSA-2026-0001',
    studentEmail: 'thirumurugank.al24@bitsathy.ac.in',
    studentPhone: '+91 98421 11029',
    department: 'Artificial Intelligence & DS',
    productId: 'prod-hoodie-02',
    productName: 'CampusMitra Skyline Tech Hoodie',
    variantSize: 'M',
    quantity: 1,
    unitPrice: 850,
    orderTotal: 850,
    amountPaid: 850,
    outstandingBalance: 0,
    paymentStatus: 'PAID',
    fulfillmentStatus: 'COMPLETED',
    paymentMethod: 'UPI',
    transactionRef: 'pay_THIRU_994102',
    handoverAt: '2026-04-14 04:30 PM',
    handoverBy: 'Priya Patel (Treasurer)',
    notes: 'Handed over directly to student after evening general meeting.',
  },
  {
    id: 'ord-003',
    orderNumber: 'ORD-SSA-1044',
    orderDate: '2026-04-13 09:15 AM',
    clubId: 'club-skyline-sa-001',
    studentName: 'Hemanth S V',
    studentId: 'SSA-2026-0002',
    studentEmail: 'hemanthsv.al24@bitsathy.ac.in',
    studentPhone: '+91 97890 22341',
    department: 'Artificial Intelligence & DS',
    productId: 'prod-mug-03',
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
    transactionRef: 'pay_MUG_881923',
    expectedPickupDate: '2026-04-17',
    notes: '2x 11oz mugs boxed with bubble wrap.',
  },
  {
    id: 'ord-004',
    orderNumber: 'ORD-SSA-1045',
    orderDate: '2026-04-13 04:10 PM',
    clubId: 'club-skyline-sa-001',
    studentName: 'Ananya Deshmukh',
    studentId: 'SSA-2026-0043',
    studentEmail: 'ananya.d@campus.edu',
    studentPhone: '+91 98214 77410',
    department: 'Design & Media',
    productId: 'prod-hoodie-02',
    productName: 'CampusMitra Skyline Tech Hoodie',
    variantSize: 'S',
    quantity: 1,
    unitPrice: 850,
    orderTotal: 850,
    amountPaid: 450,
    outstandingBalance: 400,
    paymentStatus: 'PARTIAL',
    fulfillmentStatus: 'CONFIRMED',
    paymentMethod: 'CASH',
    transactionRef: 'CASH-ORD-PART-1045',
    expectedPickupDate: '2026-04-19',
    notes: 'Deposit of ₹450 paid in cash. Remaining ₹400 due upon pickup.',
  },
  {
    id: 'ord-005',
    orderNumber: 'ORD-SSA-1046',
    orderDate: '2026-04-12 01:20 PM',
    clubId: 'club-skyline-sa-001',
    studentName: 'Rohan Mehra',
    studentId: 'SSA-2026-0155',
    studentEmail: 'rohan.m@campus.edu',
    studentPhone: '+91 94511 88301',
    department: 'Mechanical Engineering',
    productId: 'prod-sneakers-04',
    productName: 'Odoo Signature Low-Top Sneakers',
    variantSize: 'UK 9 (41)',
    quantity: 1,
    unitPrice: 2999, // non-member price
    orderTotal: 2999,
    amountPaid: 0,
    outstandingBalance: 2999,
    paymentStatus: 'UNPAID',
    fulfillmentStatus: 'PENDING',
    notes: 'Order placed via portal; awaiting offline cash float verification or UPI settlement.',
  },
  {
    id: 'ord-006',
    orderNumber: 'ORD-SSA-1047',
    orderDate: '2026-04-11 05:40 PM',
    clubId: 'club-skyline-sa-001',
    studentName: 'Karthik Raja',
    studentId: 'SSA-2026-0089',
    studentEmail: 'karthik.r@campus.edu',
    studentPhone: '+91 97120 44912',
    department: 'Mechanical Engineering',
    productId: 'prod-bottle-05',
    productName: 'Stainless Steel Insulated Thermal Flask (750ml)',
    variantSize: '750 ml - Matte Black',
    quantity: 1,
    unitPrice: 380,
    orderTotal: 380,
    amountPaid: 380,
    outstandingBalance: 0,
    paymentStatus: 'PAID',
    fulfillmentStatus: 'COMPLETED',
    paymentMethod: 'UPI',
    transactionRef: 'pay_FLASK_220194',
    handoverAt: '2026-04-13 11:00 AM',
    handoverBy: 'Priya Patel (Treasurer)',
    notes: 'Collected at Student Union booth.',
  },
  {
    id: 'ord-007',
    orderNumber: 'ORD-SSA-1048',
    orderDate: '2026-04-10 10:05 AM',
    clubId: 'club-skyline-sa-001',
    studentName: 'Pooja Hegde',
    studentId: 'SSA-2026-0204',
    studentEmail: 'pooja.h@campus.edu',
    studentPhone: '+91 98801 33214',
    department: 'Biotechnology',
    productId: 'prod-polo-01',
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
    transactionRef: 'pay_POLO_POOJA_441',
    expectedPickupDate: '2026-04-20',
    notes: 'Batch print monogramming in progress.',
  },
  {
    id: 'ord-008',
    orderNumber: 'ORD-SSA-1049',
    orderDate: '2026-04-09 03:15 PM',
    clubId: 'club-skyline-sa-001',
    studentName: 'Vikramaditya Roy',
    studentId: 'SSA-2026-0219',
    studentEmail: 'vikram.r@campus.edu',
    studentPhone: '+91 97312 99411',
    department: 'Civil Engineering',
    productId: 'prod-boardgame-06',
    productName: 'Scale-Up! The Business Game',
    variantSize: 'Standard Edition',
    quantity: 1,
    unitPrice: 899,
    orderTotal: 899,
    amountPaid: 899,
    outstandingBalance: 0,
    paymentStatus: 'PAID',
    fulfillmentStatus: 'COMPLETED',
    paymentMethod: 'CARD',
    transactionRef: 'CARD-POS-GAME-910',
    handoverAt: '2026-04-11 02:00 PM',
    handoverBy: 'Priya Patel (Treasurer)',
    notes: 'Purchased and collected during workshop session.',
  },
];
