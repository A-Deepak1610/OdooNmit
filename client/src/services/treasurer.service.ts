import { apiClient } from './api-client';
import {
  IncomeItem,
  ExpenseRecord,
  ReimbursementClaim,
  SemesterReportData,
  PaymentTransactionRecord,
  FinancialAuditLogItem,
} from '../data/mockTreasurerData';
import { StudentDuesRecord, DuesConfiguration } from '../data/mockTreasurerDuesData';
import { MerchProduct, StudentMerchOrder } from '../data/mockTreasurerMerchData';

export interface TreasurerOverviewData {
  club: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    category: string | null;
  };
  ledger: {
    openingBalance: number;
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    academicYear: string;
    semester: string;
  };
  claimsPending: {
    count: number;
    amount: number;
  };
  streamStats: {
    dues: number;
    tickets: number;
    merchandise: number;
    fundraiser: number;
  };
  categoryStats: Record<string, number>;
  recentIncomes: IncomeItem[];
  recentExpenses: ExpenseRecord[];
}

export const treasurerService = {
  // 1. Overview
  async getOverview(): Promise<TreasurerOverviewData> {
    const res = await apiClient.get<{ success: boolean; data: TreasurerOverviewData }>('/treasurer/overview');
    return res.data.data;
  },

  // 2. Incomes
  async getIncomes(filters?: { source?: string; method?: string; query?: string }): Promise<IncomeItem[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/treasurer/incomes', {
      params: filters,
    });
    return res.data.data.map((item) => ({
      ...item,
      date: typeof item.date === 'string' ? item.date.split('T')[0] : item.date,
    }));
  },

  async createIncome(incomeData: Omit<IncomeItem, 'id' | 'status'>): Promise<IncomeItem> {
    const res = await apiClient.post<{ success: boolean; data: IncomeItem; message: string }>(
      '/treasurer/incomes',
      incomeData
    );
    return res.data.data;
  },

  // 3. Expenses
  async getExpenses(filters?: { category?: string; method?: string; query?: string }): Promise<ExpenseRecord[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/treasurer/expenses', {
      params: filters,
    });
    return res.data.data.map((item) => ({
      ...item,
      date: typeof item.date === 'string' ? item.date.split('T')[0] : item.date,
    }));
  },

  async createExpense(expenseData: Omit<ExpenseRecord, 'id'>): Promise<ExpenseRecord> {
    const res = await apiClient.post<{ success: boolean; data: ExpenseRecord; message: string }>(
      '/treasurer/expenses',
      expenseData
    );
    return res.data.data;
  },

  // 4. Reimbursement Claims
  async getClaims(filters?: { status?: string; query?: string }): Promise<ReimbursementClaim[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/treasurer/claims', {
      params: filters,
    });
    return res.data.data.map((item) => ({
      ...item,
      dateSubmitted:
        typeof item.dateSubmitted === 'string' ? item.dateSubmitted.split('T')[0] : item.dateSubmitted,
    }));
  },

  async createClaim(claimData: any): Promise<ReimbursementClaim> {
    const res = await apiClient.post<{ success: boolean; data: ReimbursementClaim; message: string }>(
      '/treasurer/claims',
      claimData
    );
    return res.data.data;
  },

  async reviewClaim(
    claimId: string,
    action: { status: 'APPROVED' | 'REJECTED'; reviewerNotes?: string; rejectionReason?: string }
  ): Promise<ReimbursementClaim> {
    const res = await apiClient.patch<{ success: boolean; data: ReimbursementClaim; message: string }>(
      `/treasurer/claims/${claimId}/review`,
      action
    );
    return res.data.data;
  },

  async disbursePayout(
    claimId: string,
    payoutDetails: {
      payoutMethod: 'IMPS' | 'UPI' | 'NEFT' | 'CASH';
      transactionRef: string;
      payoutDate: string;
      accountReference: string;
    }
  ): Promise<ReimbursementClaim> {
    const res = await apiClient.post<{ success: boolean; data: ReimbursementClaim; message: string }>(
      `/treasurer/claims/${claimId}/payout`,
      payoutDetails
    );
    return res.data.data;
  },

  // 5. Semester Reports
  async getReports(): Promise<SemesterReportData[]> {
    const res = await apiClient.get<{ success: boolean; data: SemesterReportData[] }>('/treasurer/reports');
    return res.data.data;
  },

  // 6. Audit Trail & Payments
  async getAuditTrail(filters?: { type?: string; query?: string }): Promise<{
    payments: PaymentTransactionRecord[];
    auditLogs: FinancialAuditLogItem[];
  }> {
    const res = await apiClient.get<{
      success: boolean;
      data: { payments: any[]; auditLogs: any[] };
    }>('/treasurer/audit', { params: filters });

    return {
      payments: res.data.data.payments.map((p) => ({
        ...p,
        timestamp: typeof p.timestamp === 'string' ? p.timestamp.replace('T', ' ').slice(0, 16) : p.timestamp,
      })),
      auditLogs: res.data.data.auditLogs.map((a) => ({
        ...a,
        timestamp: typeof a.timestamp === 'string' ? a.timestamp.replace('T', ' ').slice(0, 16) : a.timestamp,
      })),
    };
  },

  // 7. Student Dues
  async getDues(filters?: {
    status?: string;
    query?: string;
    department?: string;
  }): Promise<{ config: DuesConfiguration; students: StudentDuesRecord[] }> {
    const res = await apiClient.get<{
      success: boolean;
      data: { config: DuesConfiguration; students: StudentDuesRecord[] };
    }>('/treasurer/dues', { params: filters });
    return res.data.data;
  },

  async recordDuesPayment(
    duesId: string,
    paymentData: {
      amount: number;
      paymentMethod: string;
      reference?: string;
      date?: string;
      notes?: string;
    }
  ): Promise<StudentDuesRecord> {
    const res = await apiClient.post<{ success: boolean; data: StudentDuesRecord; message: string }>(
      `/treasurer/dues/${duesId}/pay`,
      paymentData
    );
    return res.data.data;
  },

  // 8. Merchandise & Store Orders
  async getMerchandise(): Promise<{ products: MerchProduct[]; orders: StudentMerchOrder[] }> {
    const res = await apiClient.get<{
      success: boolean;
      data: { products: MerchProduct[]; orders: StudentMerchOrder[] };
    }>('/treasurer/merchandise');
    return res.data.data;
  },

  async createMerchProduct(data: any): Promise<MerchProduct> {
    const res = await apiClient.post<{ success: boolean; data: MerchProduct; message: string }>(
      '/treasurer/merchandise/products',
      data
    );
    return res.data.data;
  },

  async updateMerchStock(
    productId: string,
    variantSku: string,
    delta: number,
    reason: string
  ): Promise<MerchProduct> {
    const res = await apiClient.patch<{ success: boolean; data: MerchProduct; message: string }>(
      `/treasurer/merchandise/products/${productId}/stock`,
      { variantSku, delta, reason }
    );
    return res.data.data;
  },

  async updateOrderStatus(
    orderId: string,
    update: { fulfillmentStatus?: string; paymentStatus?: string }
  ): Promise<StudentMerchOrder> {
    const res = await apiClient.patch<{ success: boolean; data: StudentMerchOrder; message: string }>(
      `/treasurer/merchandise/orders/${orderId}/status`,
      update
    );
    return res.data.data;
  },
};
