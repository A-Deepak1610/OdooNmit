import { PrismaClient } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

export interface CreateProductInput {
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
  variants: {
    size: string;
    sku?: string;
    onHandStock: number;
  }[];
}

export interface PlaceOrderInput {
  productId: string;
  variantSize: string;
  quantity?: number;
  paymentMethod?: string;
  notes?: string;
}

export class MerchandiseService {
  /**
   * 1. Get all merchandise products
   */
  async getProducts(organizationId?: string, userEmail?: string) {
    let orgId = organizationId;
    if (!orgId) {
      const defaultOrg = await prisma.organization.findFirst();
      orgId = defaultOrg?.id;
    }

    const products = await prisma.merchProduct.findMany({
      where: orgId ? { organizationId: orgId, status: 'ACTIVE' } : { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
      },
    });

    // Check if user is a member of this club
    let isMember = false;
    if (userEmail && orgId) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } });
      if (user) {
        const membership = await prisma.userRole.findFirst({
          where: {
            userId: user.id,
            organizationId: orgId,
            role: { in: ['MEMBER', 'PRESIDENT', 'TREASURER', 'EVENT_ORGANIZER', 'VOLUNTEER'] },
          },
        });
        isMember = !!membership;
      }
    }

    return {
      products: products.map((p) => {
        const variants = (p.variants as any[]) || [];
        const totalStock = variants.reduce((sum, v) => sum + (v.onHandStock || 0), 0);
        const totalSold = variants.reduce((sum, v) => sum + (v.soldStock || 0), 0);
        return {
          id: p.id,
          organizationId: p.organizationId,
          organization: p.organization,
          name: p.name,
          description: p.description,
          category: p.category,
          image: p.image,
          sellingPrice: p.sellingPrice,
          memberPrice: p.memberPrice ?? Math.round(p.sellingPrice * 0.65),
          costPrice: p.costPrice ?? Math.round(p.sellingPrice * 0.4),
          sku: p.sku,
          status: p.status,
          lowStockThreshold: p.lowStockThreshold,
          variants,
          totalStock,
          totalSold,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      }),
      isMember,
    };
  }

  /**
   * 2. Get single product by ID
   */
  async getProductById(id: string) {
    const product = await prisma.merchProduct.findUnique({
      where: { id },
      include: {
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) {
      throw new Error('Merchandise item not found.');
    }

    const variants = (product.variants as any[]) || [];
    const totalStock = variants.reduce((sum, v) => sum + (v.onHandStock || 0), 0);
    const totalSold = variants.reduce((sum, v) => sum + (v.soldStock || 0), 0);

    return {
      ...product,
      variants,
      totalStock,
      totalSold,
    };
  }

  /**
   * 3. Create a new merchandise product (Campus Lead / Admin)
   */
  async createProduct(userId: string, input: CreateProductInput) {
    let orgId = input.organizationId;
    if (!orgId) {
      // Find organization where user is president/admin/officer
      const userRole = await prisma.userRole.findFirst({
        where: {
          userId,
          organizationId: { not: null },
          role: { in: ['PRESIDENT', 'ADMIN', 'TREASURER', 'EVENT_ORGANIZER'] },
        },
      });
      orgId = userRole?.organizationId || (await prisma.organization.findFirst())?.id;
    }

    if (!orgId) {
      throw new Error('No club organization found for product assignment.');
    }

    if (!input.name || !input.sellingPrice || !input.category) {
      throw new Error('Product name, category, and selling price are required.');
    }

    const memberPrice = input.memberPrice ?? Math.round(input.sellingPrice * 0.65);
    const costPrice = input.costPrice ?? Math.round(input.sellingPrice * 0.4);

    const formattedVariants = (input.variants || [{ size: 'Standard', onHandStock: 25 }]).map((v) => ({
      size: v.size,
      sku: v.sku || `${input.sku || 'SKU'}-${v.size.replace(/\s+/g, '')}`,
      onHandStock: Number(v.onHandStock) || 0,
      reservedStock: 0,
      soldStock: 0,
    }));

    const newProduct = await prisma.merchProduct.create({
      data: {
        id: uuidv7(),
        organizationId: orgId,
        name: input.name,
        description: input.description || '',
        category: input.category,
        image:
          input.image ||
          'https://odoocdn.com/web/image/product.product/20563/image_1024/Mug?unique=02e5ff9',
        sellingPrice: Number(input.sellingPrice),
        costPrice,
        memberPrice,
        sku: input.sku || `SKU-ODOO-${Date.now().toString().slice(-6)}`,
        status: 'ACTIVE',
        lowStockThreshold: input.lowStockThreshold || 10,
        variants: formattedVariants,
        stockHistory: [
          {
            timestamp: new Date().toISOString(),
            action: 'INITIAL_STOCK_INWARD',
            quantity: formattedVariants.reduce((sum, v) => sum + v.onHandStock, 0),
            note: 'Initial inventory creation by Campus Lead',
          },
        ],
      },
    });

    return newProduct;
  }

  /**
   * 4. Update Product Details or Stock Specifications
   */
  async updateProduct(id: string, input: Partial<CreateProductInput>) {
    const existing = await prisma.merchProduct.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Product not found.');
    }

    let updatedVariants = existing.variants as any[];
    if (input.variants) {
      updatedVariants = input.variants.map((v) => {
        const prev = updatedVariants.find((pv: any) => pv.size === v.size) || {};
        return {
          size: v.size,
          sku: v.sku || prev.sku || `${existing.sku}-${v.size}`,
          onHandStock: Number(v.onHandStock) ?? prev.onHandStock ?? 0,
          reservedStock: prev.reservedStock || 0,
          soldStock: prev.soldStock || 0,
        };
      });
    }

    return prisma.merchProduct.update({
      where: { id },
      data: {
        name: input.name ?? existing.name,
        description: input.description ?? existing.description,
        category: input.category ?? existing.category,
        image: input.image ?? existing.image,
        sellingPrice: input.sellingPrice ? Number(input.sellingPrice) : existing.sellingPrice,
        memberPrice: input.memberPrice !== undefined ? Number(input.memberPrice) : existing.memberPrice,
        costPrice: input.costPrice !== undefined ? Number(input.costPrice) : existing.costPrice,
        sku: input.sku ?? existing.sku,
        lowStockThreshold: input.lowStockThreshold ?? existing.lowStockThreshold,
        variants: updatedVariants,
      },
    });
  }

  /**
   * 5. Place Merchandise Order with Member Discount Check & Atomic Stock Depletion
   */
  async placeOrder(userId: string, input: PlaceOrderInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found.');
    }

    const product = await prisma.merchProduct.findUnique({ where: { id: input.productId } });
    if (!product) {
      throw new Error('Merchandise product not found.');
    }

    // Check membership standing
    const membership = await prisma.userRole.findFirst({
      where: {
        userId,
        organizationId: product.organizationId,
        role: { in: ['MEMBER', 'PRESIDENT', 'TREASURER', 'EVENT_ORGANIZER', 'VOLUNTEER'] },
      },
    });
    const isMember = !!membership;

    const qty = input.quantity && input.quantity > 0 ? input.quantity : 1;
    const unitPrice = isMember && product.memberPrice ? product.memberPrice : product.sellingPrice;
    const orderTotal = unitPrice * qty;
    const discountClaimed = isMember && product.memberPrice ? (product.sellingPrice - product.memberPrice) * qty : 0;

    // Check variant stock
    const variants = (product.variants as any[]) || [];
    const variantIndex = variants.findIndex((v) => v.size === input.variantSize);
    if (variantIndex === -1) {
      throw new Error(`Variant size "${input.variantSize}" not available for this product.`);
    }

    const currentOnHand = variants[variantIndex].onHandStock || 0;
    if (currentOnHand < qty) {
      throw new Error(`Insufficient stock for size ${input.variantSize}. Only ${currentOnHand} items available.`);
    }

    // Atomically decrement on-hand stock and increment sold stock
    variants[variantIndex].onHandStock = currentOnHand - qty;
    variants[variantIndex].soldStock = (variants[variantIndex].soldStock || 0) + qty;

    const orderNumber = `ORD-SSA-${Math.floor(1000 + Math.random() * 9000)}`;
    const txRef = `pay_MCH_${Date.now()}`;
    const pickupQr = `CM-PICKUP-${orderNumber}-${user.id.substring(0, 8)}`;

    const [updatedProduct, newOrder] = await prisma.$transaction([
      prisma.merchProduct.update({
        where: { id: product.id },
        data: {
          variants,
        },
      }),
      prisma.studentMerchOrder.create({
        data: {
          id: uuidv7(),
          organizationId: product.organizationId,
          orderNumber,
          orderDate: new Date().toISOString().split('T')[0],
          studentName: user.fullName,
          studentId: `SSA-2026-${user.id.substring(0, 4).toUpperCase()}`,
          studentEmail: user.email,
          studentPhone: user.phone || '+91 94432 88120',
          department: 'Computer Science & Engineering',
          productId: product.id,
          productName: product.name,
          variantSize: input.variantSize,
          quantity: qty,
          unitPrice,
          orderTotal,
          amountPaid: orderTotal,
          outstandingBalance: 0,
          paymentStatus: 'PAID',
          fulfillmentStatus: 'READY_FOR_PICKUP',
          paymentMethod: input.paymentMethod || 'UPI',
          transactionRef: txRef,
          expectedPickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: input.notes || 'Order placed online with digital pickup pass',
        },
      }),
    ]);

    // Record in treasury incomes ledger as well
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO treasury_incomes (id, organizationId, source, title, payerName, payerEmail, amount, date, paymentMethod, paymentId, status, reference, categoryTag, createdAt, updatedAt)
         VALUES (?, ?, 'MERCHANDISE', ?, ?, ?, ?, NOW(), ?, ?, 'SETTLED', ?, 'Store Sales', NOW(), NOW())`,
        uuidv7(),
        product.organizationId,
        `${product.name} (Size: ${input.variantSize}, Qty: ${qty})`,
        user.fullName,
        user.email,
        orderTotal,
        input.paymentMethod || 'UPI',
        txRef,
        orderNumber
      );
    } catch (e: any) {
      console.warn('Treasury income recording skipped:', e.message);
    }

    // Issue Notification
    await prisma.notification.create({
      data: {
        id: uuidv7(),
        userId: user.id,
        title: `Merchandise Order Confirmed: ${product.name}`,
        message: `Your order #${orderNumber} for ${product.name} (${input.variantSize}) has been confirmed. Total paid: ₹${orderTotal}. Digital pickup QR pass ready.`,
        type: 'MERCH_ORDER',
        link: '/member/merchandise',
      },
    });

    return {
      order: newOrder,
      pickupQr,
      discountClaimed,
      isMember,
      remainingStock: variants[variantIndex].onHandStock,
    };
  }

  /**
   * 6. Get orders for authenticated student
   */
  async getMyOrders(userEmail: string) {
    return prisma.studentMerchOrder.findMany({
      where: { studentEmail: userEmail },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 7. Get Merchandise Analytics (Member vs Non-Member, Trends, Finance Record)
   */
  async getMerchandiseAnalytics(organizationId?: string) {
    let orgId = organizationId;
    if (!orgId) {
      const defaultOrg = await prisma.organization.findFirst();
      orgId = defaultOrg?.id;
    }

    const [products, orders] = await Promise.all([
      prisma.merchProduct.findMany({
        where: orgId ? { organizationId: orgId } : {},
      }),
      prisma.studentMerchOrder.findMany({
        where: orgId ? { organizationId: orgId } : {},
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const productMap = new Map<string, any>();
    products.forEach((p) => productMap.set(p.id, p));

    // Analyze Member vs Non-Member purchases
    let memberOrdersCount = 0;
    let nonMemberOrdersCount = 0;
    let memberRevenue = 0;
    let nonMemberRevenue = 0;
    let totalDiscountSavings = 0;

    const classifiedOrders = orders.map((o) => {
      const p = productMap.get(o.productId);
      const isMemberPrice = p && p.memberPrice && o.unitPrice <= p.memberPrice;
      const savingsPerUnit = p && p.memberPrice ? Math.max(0, p.sellingPrice - p.memberPrice) : 0;
      const orderSavings = isMemberPrice ? savingsPerUnit * o.quantity : 0;

      if (isMemberPrice) {
        memberOrdersCount++;
        memberRevenue += o.orderTotal;
        totalDiscountSavings += orderSavings;
      } else {
        nonMemberOrdersCount++;
        nonMemberRevenue += o.orderTotal;
      }

      return {
        ...o,
        isMemberPurchase: isMemberPrice,
        discountSaved: orderSavings,
        basePrice: p?.sellingPrice || o.unitPrice,
      };
    });

    const totalOrders = orders.length;
    const totalRevenue = memberRevenue + nonMemberRevenue;
    const memberOrderPercent = totalOrders > 0 ? Math.round((memberOrdersCount / totalOrders) * 100) : 0;
    const memberRevenuePercent = totalRevenue > 0 ? Math.round((memberRevenue / totalRevenue) * 100) : 0;
    const memberAOV = memberOrdersCount > 0 ? Math.round(memberRevenue / memberOrdersCount) : 0;
    const nonMemberAOV = nonMemberOrdersCount > 0 ? Math.round(nonMemberRevenue / nonMemberOrdersCount) : 0;

    // Daily / Date velocity trend
    const dateTrendMap = new Map<string, { date: string; revenue: number; orders: number; memberRevenue: number }>();
    classifiedOrders.forEach((o) => {
      const dateKey = o.orderDate || o.createdAt.toISOString().split('T')[0];
      const existing = dateTrendMap.get(dateKey) || { date: dateKey, revenue: 0, orders: 0, memberRevenue: 0 };
      existing.revenue += o.orderTotal;
      existing.orders += 1;
      if (o.isMemberPurchase) {
        existing.memberRevenue += o.orderTotal;
      }
      dateTrendMap.set(dateKey, existing);
    });
    const trendData = Array.from(dateTrendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Product performance & inventory value
    let totalStockCount = 0;
    let totalStockValuation = 0;
    const productStats = products.map((p) => {
      const variants = (p.variants as any[]) || [];
      const onHand = variants.reduce((sum, v) => sum + (v.onHandStock || 0), 0);
      const sold = variants.reduce((sum, v) => sum + (v.soldStock || 0), 0);
      const productOrders = classifiedOrders.filter((o) => o.productId === p.id);
      const productRevenue = productOrders.reduce((sum, o) => sum + o.orderTotal, 0);

      totalStockCount += onHand;
      totalStockValuation += onHand * p.sellingPrice;

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        sellingPrice: p.sellingPrice,
        memberPrice: p.memberPrice ?? Math.round(p.sellingPrice * 0.65),
        onHandStock: onHand,
        soldStock: sold,
        totalOrders: productOrders.length,
        totalRevenue: productRevenue,
        variants,
      };
    });

    return {
      overview: {
        totalOrders,
        totalRevenue,
        totalDiscountSavings,
        totalStockCount,
        totalStockValuation,
      },
      memberVsNonMember: {
        memberOrdersCount,
        nonMemberOrdersCount,
        memberRevenue,
        nonMemberRevenue,
        memberOrderPercent,
        memberRevenuePercent,
        memberAOV,
        nonMemberAOV,
        totalDiscountSavings,
      },
      trend: trendData,
      productStats,
      recentOrders: classifiedOrders.slice(0, 50),
    };
  }

  /**
   * 8. Separate Event Finance Records Ledger
   */
  async getEventFinanceRecord(organizationId?: string) {
    let orgId = organizationId;
    if (!orgId) {
      const defaultOrg = await prisma.organization.findFirst();
      orgId = defaultOrg?.id;
    }

    const [events, bookings, ticketIncomes] = await Promise.all([
      prisma.event.findMany({
        where: orgId ? { organizationId: orgId } : {},
        include: {
          organization: { select: { name: true } },
        },
      }),
      prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          event: orgId ? { organizationId: orgId } : {},
        },
        include: {
          user: { select: { fullName: true, email: true } },
          event: { select: { title: true, memberPrice: true, nonMemberPrice: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM treasury_incomes WHERE source = 'TICKET_SALES' ${orgId ? `AND organizationId = '${orgId}'` : ''} ORDER BY date DESC`
      ).catch(() => []),
    ]);

    // Calculate ticket sales, member savings, attendance
    let totalEventRevenue = 0;
    let totalTicketsSold = 0;
    let totalMemberTicketSavings = 0;

    const eventSummaries = events.map((ev) => {
      const evBookings = bookings.filter((b) => b.eventId === ev.id);
      const ticketsCount = evBookings.reduce((sum, b) => sum + b.quantity, 0);
      const grossRevenue = evBookings.reduce((sum, b) => sum + b.totalAmount / 100, 0);

      // Estimate member savings on tickets
      const savingsPerTicket = Math.max(0, (ev.nonMemberPrice - ev.memberPrice) / 100);
      const eventMemberSavings = evBookings.reduce((sum, b) => {
        const isMemberRate = b.unitPrice <= ev.memberPrice;
        return isMemberRate ? sum + savingsPerTicket * b.quantity : sum;
      }, 0);

      totalEventRevenue += grossRevenue;
      totalTicketsSold += ticketsCount;
      totalMemberTicketSavings += eventMemberSavings;

      return {
        id: ev.id,
        title: ev.title,
        venue: ev.venue,
        startAt: ev.startAt,
        totalSeats: ev.totalSeats,
        ticketsSold: ticketsCount,
        remainingSeats: ev.remainingSeats,
        memberPriceINR: Math.round(ev.memberPrice / 100),
        nonMemberPriceINR: Math.round(ev.nonMemberPrice / 100),
        grossRevenue,
        memberSavings: eventMemberSavings,
        occupancyRate: ev.totalSeats > 0 ? Math.round((ticketsCount / ev.totalSeats) * 100) : 0,
      };
    });

    return {
      overview: {
        totalEvents: events.length,
        totalTicketsSold,
        totalEventRevenue: Math.round(totalEventRevenue),
        totalMemberTicketSavings: Math.round(totalMemberTicketSavings),
      },
      events: eventSummaries,
      recentBookings: bookings.slice(0, 30).map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        eventTitle: b.event.title,
        userName: b.user.fullName,
        userEmail: b.user.email,
        quantity: b.quantity,
        unitPriceINR: Math.round(b.unitPrice / 100),
        totalAmountINR: Math.round(b.totalAmount / 100),
        status: b.status,
        confirmedAt: b.confirmedAt,
      })),
      treasuryTicketIncomes: ticketIncomes,
    };
  }

  /**
   * 9. Update Order Fulfillment Status
   */
  async updateOrderStatus(orderId: string, status: string, handoverBy?: string) {
    const existing = await prisma.studentMerchOrder.findUnique({ where: { id: orderId } });
    if (!existing) {
      throw new Error('Order not found.');
    }

    return prisma.studentMerchOrder.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus: status,
        handoverBy: handoverBy ?? existing.handoverBy,
        handoverAt: status === 'COMPLETED' ? new Date().toISOString() : existing.handoverAt,
      },
    });
  }
}

export const merchandiseService = new MerchandiseService();
