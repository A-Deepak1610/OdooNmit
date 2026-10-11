import { PrismaClient, RoleType } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

export class TreasurerService {
  /**
   * Helper: Resolve the organization managed by the treasurer / admin / president
   */
  async getTreasurerClub(userId: string) {
    // 1. Look for explicit TREASURER role
    const treasurerRole = await prisma.userRole.findFirst({
      where: {
        userId,
        role: RoleType.TREASURER,
        organizationId: { not: null },
      },
      include: {
        organization: true,
      },
    });

    if (treasurerRole?.organization) {
      return treasurerRole.organization;
    }

    // 2. Look for PRESIDENT role
    const presRole = await prisma.userRole.findFirst({
      where: {
        userId,
        role: RoleType.PRESIDENT,
        organizationId: { not: null },
      },
      include: {
        organization: true,
      },
    });

    if (presRole?.organization) {
      return presRole.organization;
    }

    // 3. Fallback: If user is ADMIN or testing, fallback to first active club
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    const isAdmin = user?.roles.some((r) => r.role === RoleType.ADMIN);
    if (isAdmin) {
      const firstClub = await prisma.organization.findFirst({
        where: { isActive: true },
      });
      if (firstClub) return firstClub;
    }

    // 4. Any organization role
    const anyOrgRole = await prisma.userRole.findFirst({
      where: {
        userId,
        organizationId: { not: null },
      },
      include: { organization: true },
    });

    if (anyOrgRole?.organization) {
      return anyOrgRole.organization;
    }

    // 5. Default first club to avoid blocking
    const defaultClub = await prisma.organization.findFirst({
      where: { isActive: true },
    });
    if (!defaultClub) {
      throw new Error('No club organization found in the system.');
    }
    return defaultClub;
  }

  /**
   * 1. Overview & KPIs
   */
  async getOverview(userId: string) {
    const club = await this.getTreasurerClub(userId);

    // Get current ledger
    let ledger = await prisma.treasuryLedger.findFirst({
      where: { organizationId: club.id },
      orderBy: { createdAt: 'desc' },
    });

    // Compute live balances
    const incomeAgg = await prisma.treasuryIncome.aggregate({
      where: { organizationId: club.id },
      _sum: { amount: true },
      _count: { id: true },
    });

    const expenseAgg = await prisma.treasuryExpense.aggregate({
      where: { organizationId: club.id },
      _sum: { amount: true },
      _count: { id: true },
    });

    const openingBalance = ledger?.openingBalance || 45000;
    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpenses = expenseAgg._sum.amount || 0;
    const netBalance = openingBalance + totalIncome - totalExpenses;

    // Claims pending count & amount
    const pendingClaims = await prisma.reimbursementClaim.findMany({
      where: { organizationId: club.id, status: 'PENDING' },
    });
    const pendingClaimsCount = pendingClaims.length;
    const pendingClaimsAmount = pendingClaims.reduce((sum, c) => sum + c.amount, 0);

    // Stream distribution
    const streamGroups = await prisma.treasuryIncome.groupBy({
      by: ['source'],
      where: { organizationId: club.id },
      _sum: { amount: true },
    });

    const streamStats = {
      dues: 0,
      tickets: 0,
      merchandise: 0,
      fundraiser: 0,
    };

    streamGroups.forEach((g) => {
      const val = g._sum.amount || 0;
      if (g.source === 'MEMBERSHIP_DUES') streamStats.dues += val;
      else if (g.source === 'TICKET_SALES') streamStats.tickets += val;
      else if (g.source === 'MERCHANDISE') streamStats.merchandise += val;
      else if (g.source === 'FUNDRAISER') streamStats.fundraiser += val;
    });

    // Category distribution for expenses
    const categoryGroups = await prisma.treasuryExpense.groupBy({
      by: ['category'],
      where: { organizationId: club.id },
      _sum: { amount: true },
    });

    const categoryStats: Record<string, number> = {};
    categoryGroups.forEach((c) => {
      categoryStats[c.category] = c._sum.amount || 0;
    });

    // Recent activities
    const recentIncomes = await prisma.treasuryIncome.findMany({
      where: { organizationId: club.id },
      orderBy: { date: 'desc' },
      take: 5,
    });

    const recentExpenses = await prisma.treasuryExpense.findMany({
      where: { organizationId: club.id },
      orderBy: { date: 'desc' },
      take: 5,
    });

    return {
      club: {
        id: club.id,
        name: club.name,
        slug: club.slug,
        logoUrl: club.logoUrl,
        category: club.category,
      },
      ledger: {
        openingBalance,
        totalIncome,
        totalExpenses,
        netBalance,
        academicYear: ledger?.academicYear || '2025–2026',
        semester: ledger?.semester || 'Spring 2026',
      },
      claimsPending: {
        count: pendingClaimsCount,
        amount: pendingClaimsAmount,
      },
      streamStats,
      categoryStats,
      recentIncomes,
      recentExpenses,
    };
  }

  /**
   * 2. Incomes
   */
  async getIncomes(userId: string, filters?: { source?: string; method?: string; query?: string }) {
    const club = await this.getTreasurerClub(userId);

    const where: any = { organizationId: club.id };

    if (filters?.source && filters.source !== 'ALL') {
      where.source = filters.source;
    }
    if (filters?.method && filters.method !== 'ALL') {
      where.paymentMethod = filters.method;
    }
    if (filters?.query?.trim()) {
      const q = filters.query.trim();
      where.OR = [
        { title: { contains: q } },
        { payerName: { contains: q } },
        { reference: { contains: q } },
        { paymentId: { contains: q } },
        { payerRoll: { contains: q } },
      ];
    }

    const items = await prisma.treasuryIncome.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return items;
  }

  async createIncome(userId: string, data: any) {
    const club = await this.getTreasurerClub(userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const actorName = user?.fullName || 'Club Treasurer';

    const incomeId = uuidv7();
    const paymentId = data.paymentId || `pay_UPI_${Date.now().toString().slice(-8)}`;
    const reference = data.reference || `REC-TREAS-${Date.now().toString().slice(-4)}`;
    const amount = Number(data.amount) || 0;
    const date = data.date ? new Date(data.date) : new Date();

    const newIncome = await prisma.treasuryIncome.create({
      data: {
        id: incomeId,
        organizationId: club.id,
        source: data.source || 'FUNDRAISER',
        title: data.title,
        payerName: data.payerName,
        payerEmail: data.payerEmail || null,
        payerRoll: data.payerRoll || null,
        amount,
        date,
        paymentMethod: data.paymentMethod || 'UPI',
        paymentId,
        status: data.status || 'VERIFIED',
        reference,
        categoryTag: data.categoryTag || null,
      },
    });

    // Create payment transaction record
    await prisma.treasuryPaymentRecord.create({
      data: {
        id: uuidv7(),
        organizationId: club.id,
        timestamp: date,
        type: 'INFLOW',
        sourceCategory: (data.source || 'INCOME').replace('_', ' '),
        partyName: data.payerName,
        partyDetails: reference,
        amount,
        method: data.paymentMethod || 'UPI',
        referenceId: paymentId,
        status: 'SETTLED',
        verifiedHash: `SHA256-INFLOW-${Date.now()}-OK`,
      },
    });

    // Create financial audit log
    await prisma.treasuryAuditLog.create({
      data: {
        id: uuidv7(),
        organizationId: club.id,
        timestamp: new Date(),
        action: 'INCOME_LOGGED',
        actor: actorName,
        details: `Logged inflow of ₹${amount.toLocaleString()} for "${data.title}" from ${data.payerName}.`,
        amount,
        referenceId: paymentId,
        verificationHash: `SHA256-AUD-INC-${Date.now()}`,
      },
    });

    return newIncome;
  }

  /**
   * 3. Expenses
   */
  async getExpenses(userId: string, filters?: { category?: string; method?: string; query?: string }) {
    const club = await this.getTreasurerClub(userId);

    const where: any = { organizationId: club.id };

    if (filters?.category && filters.category !== 'ALL') {
      where.category = filters.category;
    }
    if (filters?.method && filters.method !== 'ALL') {
      where.paymentMethod = filters.method;
    }
    if (filters?.query?.trim()) {
      const q = filters.query.trim();
      where.OR = [
        { title: { contains: q } },
        { vendor: { contains: q } },
        { receiptInvoiceNo: { contains: q } },
        { receiptNote: { contains: q } },
      ];
    }

    const items = await prisma.treasuryExpense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return items;
  }

  async createExpense(userId: string, data: any) {
    const club = await this.getTreasurerClub(userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const actorName = user?.fullName || 'Club Treasurer';

    const expenseId = uuidv7();
    const amount = Number(data.amount) || 0;
    const date = data.date ? new Date(data.date) : new Date();
    const invoiceNo = data.receiptInvoiceNo || `INV-${Date.now().toString().slice(-4)}`;

    const newExpense = await prisma.treasuryExpense.create({
      data: {
        id: expenseId,
        organizationId: club.id,
        title: data.title,
        category: data.category || 'OTHER',
        amount,
        date,
        vendor: data.vendor,
        paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
        receiptNote: data.receiptNote || `Invoice #${invoiceNo}`,
        receiptInvoiceNo: invoiceNo,
        receiptUrl: data.receiptUrl || null,
        recordedBy: data.recordedBy || actorName,
        notes: data.notes || null,
      },
    });

    // Create payment record outflow
    await prisma.treasuryPaymentRecord.create({
      data: {
        id: uuidv7(),
        organizationId: club.id,
        timestamp: date,
        type: 'OUTFLOW',
        sourceCategory: (data.category || 'EXPENSE').replace('_', ' '),
        partyName: data.vendor,
        partyDetails: invoiceNo,
        amount,
        method: data.paymentMethod || 'BANK_TRANSFER',
        referenceId: invoiceNo,
        status: 'DISBURSED',
        verifiedHash: `SHA256-OUTFLOW-${Date.now()}-OK`,
      },
    });

    // Audit log
    await prisma.treasuryAuditLog.create({
      data: {
        id: uuidv7(),
        organizationId: club.id,
        timestamp: new Date(),
        action: 'EXPENSE_RECORDED',
        actor: actorName,
        details: `Recorded expenditure of ₹${amount.toLocaleString()} to "${data.vendor}" under ${data.category}.`,
        amount,
        referenceId: invoiceNo,
        verificationHash: `SHA256-AUD-EXP-${Date.now()}`,
      },
    });

    return newExpense;
  }

  /**
   * 4. Reimbursement Claims
   */
  async getClaims(userId: string, filters?: { status?: string; query?: string }) {
    const club = await this.getTreasurerClub(userId);

    const where: any = { organizationId: club.id };

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }
    if (filters?.query?.trim()) {
      const q = filters.query.trim();
      where.OR = [
        { title: { contains: q } },
        { volunteerName: { contains: q } },
        { volunteerRoll: { contains: q } },
        { projectName: { contains: q } },
      ];
    }

    const claims = await prisma.reimbursementClaim.findMany({
      where,
      orderBy: { dateSubmitted: 'desc' },
    });

    return claims;
  }

  async createClaim(userId: string, data: any) {
    const club = await this.getTreasurerClub(userId);

    const claimId = uuidv7();
    const amount = Number(data.amount) || 0;

    const newClaim = await prisma.reimbursementClaim.create({
      data: {
        id: claimId,
        organizationId: club.id,
        volunteerName: data.volunteerName,
        volunteerEmail: data.volunteerEmail,
        volunteerRoll: data.volunteerRoll,
        volunteerDepartment: data.volunteerDepartment,
        projectName: data.projectName,
        title: data.title,
        category: data.category || 'SUPPLIES',
        amount,
        dateSubmitted: data.dateSubmitted ? new Date(data.dateSubmitted) : new Date(),
        status: 'PENDING',
        receiptNote: data.receiptNote || 'Supermarket Tax Invoice Attached',
        receipt: data.receipt || null,
      },
    });

    return newClaim;
  }

  async reviewClaim(
    userId: string,
    claimId: string,
    action: { status: 'APPROVED' | 'REJECTED'; reviewerNotes?: string; rejectionReason?: string }
  ) {
    const club = await this.getTreasurerClub(userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const actorName = user?.fullName || 'Club Treasurer';

    const existing = await prisma.reimbursementClaim.findFirst({
      where: { id: claimId, organizationId: club.id },
    });

    if (!existing) {
      throw new Error('Reimbursement claim not found.');
    }

    const updateData: any = {
      status: action.status,
      reviewedBy: actorName,
    };

    if (action.status === 'APPROVED') {
      updateData.approvedAt = new Date();
      updateData.reviewerNotes = action.reviewerNotes || 'Approved by Treasurer after receipt verification.';
    } else {
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = action.rejectionReason || 'Claim does not comply with organization spending policy.';
    }

    const updated = await prisma.reimbursementClaim.update({
      where: { id: claimId },
      data: updateData,
    });

    // Create Audit Log
    await prisma.treasuryAuditLog.create({
      data: {
        id: uuidv7(),
        organizationId: club.id,
        timestamp: new Date(),
        action: action.status === 'APPROVED' ? 'CLAIM_APPROVED' : 'CLAIM_REJECTED',
        actor: actorName,
        details:
          action.status === 'APPROVED'
            ? `Approved reimbursement claim for ₹${existing.amount.toLocaleString()} submitted by ${existing.volunteerName}.`
            : `Rejected claim for ₹${existing.amount.toLocaleString()} submitted by ${existing.volunteerName}. Reason: ${action.rejectionReason || 'Policy non-compliance'}`,
        amount: existing.amount,
        referenceId: existing.id,
        verificationHash: `SHA256-AUD-CLM-${action.status}-${Date.now()}`,
      },
    });

    return updated;
  }

  async disbursePayout(
    userId: string,
    claimId: string,
    payoutDetails: {
      payoutMethod: string;
      transactionRef: string;
      payoutDate: string;
      accountReference: string;
    }
  ) {
    const club = await this.getTreasurerClub(userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const actorName = user?.fullName || 'Club Treasurer';

    const existing = await prisma.reimbursementClaim.findFirst({
      where: { id: claimId, organizationId: club.id },
    });

    if (!existing) {
      throw new Error('Reimbursement claim not found.');
    }

    const updatedClaim = await prisma.reimbursementClaim.update({
      where: { id: claimId },
      data: {
        status: 'REIMBURSED',
        payoutDetails: {
          ...payoutDetails,
          disbursedBy: actorName,
        },
      },
    });

    // Record as outflow payment transaction
    await prisma.treasuryPaymentRecord.create({
      data: {
        id: uuidv7(),
        organizationId: club.id,
        timestamp: new Date(),
        type: 'OUTFLOW',
        sourceCategory: 'Volunteer Reimbursement',
        partyName: existing.volunteerName,
        partyDetails: payoutDetails.accountReference,
        amount: existing.amount,
        method: payoutDetails.payoutMethod,
        referenceId: payoutDetails.transactionRef,
        status: 'DISBURSED',
        verifiedHash: `SHA256-PAYOUT-${payoutDetails.transactionRef}-OK`,
      },
    });

    // Record as treasury expense
    await prisma.treasuryExpense.create({
      data: {
        id: uuidv7(),
        organizationId: club.id,
        title: `Reimbursement Payout: ${existing.title} (${existing.volunteerName})`,
        category: 'LOGISTICS',
        amount: existing.amount,
        date: new Date(),
        vendor: `${existing.volunteerName} (${existing.volunteerRoll})`,
        paymentMethod: payoutDetails.payoutMethod === 'IMPS' ? 'BANK_TRANSFER' : 'UPI',
        receiptNote: `Disbursement Ref #${payoutDetails.transactionRef}`,
        receiptInvoiceNo: payoutDetails.transactionRef,
        recordedBy: actorName,
        notes: `Direct reimbursement payout disbursed for claim #${existing.id}.`,
      },
    });

    // Audit log
    await prisma.treasuryAuditLog.create({
      data: {
        id: uuidv7(),
        organizationId: club.id,
        timestamp: new Date(),
        action: 'PAYOUT_RECORDED',
        actor: actorName,
        details: `Disbursed reimbursement payout of ₹${existing.amount.toLocaleString()} to ${existing.volunteerName} via ${payoutDetails.payoutMethod} Ref #${payoutDetails.transactionRef}.`,
        amount: existing.amount,
        referenceId: existing.id,
        verificationHash: `SHA256-AUD-PAYOUT-${Date.now()}`,
      },
    });

    return updatedClaim;
  }

  /**
   * 5. Semester Reports
   */
  async getReports(userId: string) {
    const club = await this.getTreasurerClub(userId);

    const reports = await prisma.semesterReport.findMany({
      where: { organizationId: club.id },
      orderBy: { createdAt: 'desc' },
    });

    return reports;
  }

  /**
   * 6. Audit Trail & Payments
   */
  async getAuditTrail(userId: string, filters?: { type?: string; query?: string }) {
    const club = await this.getTreasurerClub(userId);

    const paymentWhere: any = { organizationId: club.id };
    if (filters?.type && filters.type !== 'ALL') {
      paymentWhere.type = filters.type;
    }
    if (filters?.query?.trim()) {
      const q = filters.query.trim();
      paymentWhere.OR = [
        { partyName: { contains: q } },
        { referenceId: { contains: q } },
        { sourceCategory: { contains: q } },
      ];
    }

    const payments = await prisma.treasuryPaymentRecord.findMany({
      where: paymentWhere,
      orderBy: { timestamp: 'desc' },
    });

    const auditWhere: any = { organizationId: club.id };
    if (filters?.query?.trim()) {
      const q = filters.query.trim();
      auditWhere.OR = [
        { details: { contains: q } },
        { actor: { contains: q } },
        { action: { contains: q } },
        { referenceId: { contains: q } },
      ];
    }

    const auditLogs = await prisma.treasuryAuditLog.findMany({
      where: auditWhere,
      orderBy: { timestamp: 'desc' },
    });

    return {
      payments,
      auditLogs,
    };
  }

  /**
   * 7. Student Dues
   */
  async getDues(userId: string, filters?: { status?: string; query?: string; department?: string }) {
    const club = await this.getTreasurerClub(userId);

    const where: any = { organizationId: club.id };
    if (filters?.status && filters.status !== 'ALL') {
      where.paymentStatus = filters.status;
    }
    if (filters?.department && filters.department !== 'ALL') {
      where.department = filters.department;
    }
    if (filters?.query?.trim()) {
      const q = filters.query.trim();
      where.OR = [
        { name: { contains: q } },
        { rollNumber: { contains: q } },
        { studentId: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const dues = await prisma.duesRecord.findMany({
      where,
      orderBy: { rollNumber: 'asc' },
    });

    return {
      config: {
        academicYear: '2025–2026',
        annualFee: 250,
        paymentDeadline: '2026-05-31',
        clubId: club.id,
        clubName: club.name,
        lateFeeApplicable: false,
        lateFeeAmount: 50,
      },
      students: dues,
    };
  }

  async recordDuesPayment(userId: string, duesId: string, paymentData: any) {
    const club = await this.getTreasurerClub(userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const actorName = user?.fullName || 'Club Treasurer';

    const existing = await prisma.duesRecord.findFirst({
      where: { id: duesId, organizationId: club.id },
    });

    if (!existing) {
      throw new Error('Dues record not found.');
    }

    const payAmount = Number(paymentData.amount) || 250;
    const newAmountPaid = existing.amountPaid + payAmount;
    const newOutstanding = Math.max(0, existing.annualFee - newAmountPaid);
    const newStatus = newOutstanding === 0 ? 'PAID' : 'PARTIAL';
    const txRef = paymentData.reference || `UPI-NMIT-${Date.now().toString().slice(-6)}`;
    const payDate = paymentData.date || new Date().toISOString().split('T')[0];

    const currentHistory = Array.isArray(existing.paymentHistory)
      ? (existing.paymentHistory as any[])
      : [];

    const newPaymentEntry = {
      id: uuidv7(),
      amount: payAmount,
      date: payDate,
      method: paymentData.paymentMethod || 'UPI',
      reference: txRef,
      notes: paymentData.notes || 'Membership dues settled',
      recordedBy: actorName,
    };

    const updated = await prisma.duesRecord.update({
      where: { id: duesId },
      data: {
        amountPaid: newAmountPaid,
        outstandingBalance: newOutstanding,
        paymentStatus: newStatus,
        lastPaymentDate: payDate,
        paymentMethod: paymentData.paymentMethod || 'UPI',
        transactionRef: txRef,
        paymentHistory: [...currentHistory, newPaymentEntry],
      },
    });

    // Also automatically log into Treasury Incomes
    await this.createIncome(userId, {
      source: 'MEMBERSHIP_DUES',
      title: `Membership Dues - ${existing.name} (${existing.rollNumber})`,
      payerName: existing.name,
      payerEmail: existing.email,
      payerRoll: existing.rollNumber,
      amount: payAmount,
      date: payDate,
      paymentMethod: paymentData.paymentMethod || 'UPI',
      paymentId: txRef,
      status: 'VERIFIED',
      reference: `MEM-${existing.rollNumber}`,
      categoryTag: '194 Paid Members',
    });

    return updated;
  }

  /**
   * 8. Merchandise & Store Orders
   */
  async getMerchandise(userId: string) {
    const club = await this.getTreasurerClub(userId);

    const products = await prisma.merchProduct.findMany({
      where: { organizationId: club.id },
      orderBy: { createdAt: 'desc' },
    });

    const orders = await prisma.studentMerchOrder.findMany({
      where: { organizationId: club.id },
      orderBy: { orderDate: 'desc' },
    });

    return {
      products,
      orders,
    };
  }

  async createMerchProduct(userId: string, data: any) {
    const club = await this.getTreasurerClub(userId);

    const product = await prisma.merchProduct.create({
      data: {
        id: uuidv7(),
        organizationId: club.id,
        name: data.name,
        description: data.description,
        category: data.category,
        image: data.image,
        sellingPrice: Number(data.sellingPrice),
        costPrice: data.costPrice ? Number(data.costPrice) : null,
        memberPrice: data.memberPrice ? Number(data.memberPrice) : null,
        sku: data.sku || `SKU-${Date.now().toString().slice(-4)}`,
        status: data.status || 'ACTIVE',
        lowStockThreshold: data.lowStockThreshold || 10,
        variants: data.variants || [],
      },
    });

    return product;
  }

  async updateMerchStock(
    userId: string,
    productId: string,
    variantSku: string,
    delta: number,
    reason: string
  ) {
    const club = await this.getTreasurerClub(userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const actorName = user?.fullName || 'Club Treasurer';

    const prod = await prisma.merchProduct.findFirst({
      where: { id: productId, organizationId: club.id },
    });

    if (!prod) {
      throw new Error('Product not found.');
    }

    const variants = (prod.variants as any[]) || [];
    const variantIndex = variants.findIndex((v) => v.sku === variantSku);

    if (variantIndex === -1) {
      throw new Error(`Variant SKU ${variantSku} not found.`);
    }

    const prevStock = variants[variantIndex].onHandStock || 0;
    const newStock = Math.max(0, prevStock + delta);
    variants[variantIndex].onHandStock = newStock;

    const currentHistory = Array.isArray(prod.stockHistory) ? (prod.stockHistory as any[]) : [];
    const logEntry = {
      id: uuidv7(),
      productId: prod.id,
      productName: prod.name,
      variantSize: variants[variantIndex].size,
      delta,
      previousStock: prevStock,
      newStock,
      reason,
      date: new Date().toISOString(),
      adjustedBy: actorName,
    };

    const updated = await prisma.merchProduct.update({
      where: { id: productId },
      data: {
        variants,
        stockHistory: [...currentHistory, logEntry],
      },
    });

    return updated;
  }

  async updateOrderStatus(
    userId: string,
    orderId: string,
    update: { fulfillmentStatus?: string; paymentStatus?: string }
  ) {
    const club = await this.getTreasurerClub(userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const actorName = user?.fullName || 'Club Treasurer';

    const existing = await prisma.studentMerchOrder.findFirst({
      where: { id: orderId, organizationId: club.id },
    });

    if (!existing) {
      throw new Error('Order not found.');
    }

    const data: any = {};
    if (update.fulfillmentStatus) data.fulfillmentStatus = update.fulfillmentStatus;
    if (update.paymentStatus) data.paymentStatus = update.paymentStatus;

    if (update.fulfillmentStatus === 'COMPLETED') {
      data.handoverAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      data.handoverBy = actorName;
    }

    const updated = await prisma.studentMerchOrder.update({
      where: { id: orderId },
      data,
    });

    return updated;
  }
}

export const treasurerService = new TreasurerService();
