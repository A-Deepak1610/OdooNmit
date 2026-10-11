import { apiClient } from './api-client';

export interface MerchVariant {
  size: string;
  sku?: string;
  onHandStock: number;
  reservedStock?: number;
  soldStock?: number;
}

export interface MerchProduct {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  category: string;
  image: string;
  sellingPrice: number;
  costPrice: number;
  memberPrice: number;
  sku: string;
  status: string;
  lowStockThreshold: number;
  variants: MerchVariant[];
  totalStock: number;
  totalSold: number;
  organization?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MerchOrder {
  id: string;
  orderNumber: string;
  studentName: string;
  studentEmail: string;
  productId: string;
  productName: string;
  variantSize: string;
  quantity: number;
  unitPrice: number;
  orderTotal: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  orderDate: string;
  notes?: string;
  pickupPassQr?: string;
  handoverBy?: string;
  handoverAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MerchAnalyticsOverview {
  totalOrders: number;
  totalRevenue: number;
  memberOrdersCount: number;
  nonMemberOrdersCount: number;
  memberRevenue: number;
  nonMemberRevenue: number;
  totalDiscountSavings: number;
  memberOrderPercent: number;
  memberRevenuePercent: number;
  memberAOV: number;
  nonMemberAOV: number;
  totalStockCount: number;
  totalStockValuation: number;
  totalUnitsSold: number;
}

export interface MerchAnalyticsResponse {
  overview: MerchAnalyticsOverview;
  trend: Array<{
    date: string;
    revenue: number;
    orders: number;
    memberRevenue: number;
  }>;
  productStats: Array<{
    id: string;
    name: string;
    category: string;
    sellingPrice: number;
    memberPrice: number;
    costPrice: number;
    onHandStock: number;
    soldStock: number;
    stockValuation: number;
    isLowStock: boolean;
    variants: MerchVariant[];
  }>;
  recentOrders: Array<MerchOrder & { isMemberPurchase: boolean; discountSaved: number; basePrice: number }>;
}

export interface EventFinanceResponse {
  overview: {
    totalEvents: number;
    totalTicketsSold: number;
    totalEventRevenue: number;
    totalMemberTicketSavings: number;
  };
  events: Array<{
    id: string;
    title: string;
    venue: string;
    startAt: string;
    totalSeats: number;
    ticketsSold: number;
    remainingSeats: number;
    memberPriceINR: number;
    nonMemberPriceINR: number;
    grossRevenue: number;
    memberSavings: number;
    occupancyRate: number;
  }>;
  recentBookings: Array<{
    id: string;
    bookingNumber: string;
    eventTitle: string;
    userName: string;
    userEmail: string;
    quantity: number;
    unitPriceINR: number;
    totalAmountINR: number;
    status: string;
    confirmedAt: string;
  }>;
  treasuryTicketIncomes: any[];
}

export interface CreateProductPayload {
  organizationId?: string;
  name: string;
  description: string;
  category: string;
  image: string;
  sellingPrice: number;
  costPrice?: number;
  memberPrice?: number;
  sku: string;
  lowStockThreshold?: number;
  variants: Array<{
    size: string;
    sku?: string;
    onHandStock: number;
  }>;
}

export interface PlaceOrderPayload {
  productId: string;
  variantSize: string;
  quantity?: number;
  paymentMethod?: string;
  notes?: string;
}

export const merchandiseService = {
  async getProducts(params?: { organizationId?: string; userEmail?: string }) {
    const res = await apiClient.get<{ success: boolean; data: { products: MerchProduct[]; isMember: boolean } }>(
      '/merchandise',
      { params }
    );
    return res.data.data;
  },

  async getProductById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: MerchProduct }>(`/merchandise/product/${id}`);
    return res.data.data;
  },

  async createProduct(payload: CreateProductPayload) {
    const res = await apiClient.post<{ success: boolean; data: MerchProduct; message: string }>(
      '/merchandise/products',
      payload
    );
    return res.data;
  },

  async updateProduct(id: string, payload: Partial<CreateProductPayload>) {
    const res = await apiClient.put<{ success: boolean; data: MerchProduct; message: string }>(
      `/merchandise/products/${id}`,
      payload
    );
    return res.data;
  },

  async placeOrder(payload: PlaceOrderPayload) {
    const res = await apiClient.post<{
      success: boolean;
      data: {
        order: MerchOrder;
        pickupQr: string;
        discountClaimed: number;
        isMember: boolean;
        remainingStock: number;
      };
      message: string;
    }>('/merchandise/order', payload);
    return res.data;
  },

  async getMyOrders() {
    const res = await apiClient.get<{ success: boolean; data: MerchOrder[] }>('/merchandise/my-orders');
    return res.data.data;
  },

  async getMerchandiseAnalytics(organizationId?: string) {
    const res = await apiClient.get<{ success: boolean; data: MerchAnalyticsResponse }>('/merchandise/analytics', {
      params: { organizationId },
    });
    return res.data.data;
  },

  async getEventFinanceRecord(organizationId?: string) {
    const res = await apiClient.get<{ success: boolean; data: EventFinanceResponse }>('/merchandise/event-finance', {
      params: { organizationId },
    });
    return res.data.data;
  },

  async updateOrderStatus(orderId: string, status: string, handoverBy?: string) {
    const res = await apiClient.patch<{ success: boolean; data: MerchOrder; message: string }>(
      `/merchandise/orders/${orderId}/status`,
      { status, handoverBy }
    );
    return res.data;
  },
};
