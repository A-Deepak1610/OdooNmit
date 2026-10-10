import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  Plus,
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Sliders,
  Archive,
  User,
  ShieldCheck,
  CreditCard,
  X,
  Eye,
  Check,
  Filter,
  Tag,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import {
  MerchProduct,
  StudentMerchOrder,
  ProductVariant,
  StockAdjustmentLog,
  INITIAL_MERCH_PRODUCTS,
  INITIAL_STUDENT_ORDERS,
  OrderFulfillmentStatus,
  OrderPaymentStatus,
} from '../../../data/mockTreasurerMerchData';
import { presidentService } from '../../../services/president.service';
import { treasurerService } from '../../../services/treasurer.service';
import { useAuthStore } from '../../../stores/auth.store';
import { activeClub } from '../../../data/mockClubData';

interface TreasurerMerchandiseTabProps {
  onRecordIncomeEntry?: (entry: {
    source: 'MERCHANDISE';
    title: string;
    payerName: string;
    payerEmail?: string;
    payerRoll?: string;
    amount: number;
    paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'CASH';
    reference: string;
    date: string;
  }) => void;
}

export const TreasurerMerchandiseTab: React.FC<TreasurerMerchandiseTabProps> = ({
  onRecordIncomeEntry,
}) => {
  const { user } = useAuthStore();

  // 1. Data State
  const [products, setProducts] = useState<MerchProduct[]>(INITIAL_MERCH_PRODUCTS);
  const [orders, setOrders] = useState<StudentMerchOrder[]>(INITIAL_STUDENT_ORDERS);
  const [presidentName, setPresidentName] = useState<string>('Arjun Sharma');
  const [clubLogoUrl, setClubLogoUrl] = useState<string | null>(null);

  // 2. Navigation Mode: 'PRODUCTS' vs 'ORDERS'
  const [activeView, setActiveView] = useState<'PRODUCTS' | 'ORDERS'>('PRODUCTS');

  // 3. Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('ALL');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [selectedProductForOrdersFilter, setSelectedProductForOrdersFilter] = useState<string>('ALL');

  // 4. Modal States
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isStockAdjustmentModalOpen, setIsStockAdjustmentModalOpen] = useState(false);
  const [isRecordOrderPaymentModalOpen, setIsRecordOrderPaymentModalOpen] = useState(false);

  // 5. Selected Entities for Modals
  const [selectedProduct, setSelectedProduct] = useState<MerchProduct | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<StudentMerchOrder | null>(null);

  // 6. Add/Edit Product Form State
  const [productFormName, setProductFormName] = useState('');
  const [productFormCategory, setProductFormCategory] = useState('Apparel & Uniforms');
  const [productFormDesc, setProductFormDesc] = useState('');
  const [productFormImage, setProductFormImage] = useState('');
  const [productFormSellingPrice, setProductFormSellingPrice] = useState<string>('799');
  const [productFormCostPrice, setProductFormCostPrice] = useState<string>('450');
  const [productFormMemberPrice, setProductFormMemberPrice] = useState<string>('599');
  const [productFormSku, setProductFormSku] = useState('');
  const [productFormLowThreshold, setProductFormLowThreshold] = useState<number>(10);
  const [productFormVariants, setProductFormVariants] = useState<{ size: string; stock: number }[]>([
    { size: 'S', stock: 20 },
    { size: 'M', stock: 30 },
    { size: 'L', stock: 25 },
    { size: 'XL', stock: 15 },
  ]);

  // 7. Stock Adjustment Form State
  const [adjustVariantSize, setAdjustVariantSize] = useState<string>('');
  const [adjustDelta, setAdjustDelta] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [adjustReason, setAdjustReason] = useState<string>('New Shipment Batch Received');

  // 8. Order Payment Form State
  const [orderPaymentAmount, setOrderPaymentAmount] = useState<string>('');
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<'UPI' | 'CASH' | 'CARD' | 'NET_BANKING'>('UPI');
  const [orderPaymentRef, setOrderPaymentRef] = useState('');

  // 9. Toast Feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch real club profile & server merchandise data
  useEffect(() => {
    let isMounted = true;
    const fetchClubData = async () => {
      try {
        const [overviewRes, membersRes, merchRes] = await Promise.all([
          presidentService.getOverview().catch(() => null),
          presidentService.getMembers().catch(() => []),
          treasurerService.getMerchandise().catch(() => null),
        ]);

        if (isMounted && merchRes) {
          if (Array.isArray(merchRes.products) && merchRes.products.length > 0) {
            setProducts(merchRes.products);
          }
          if (Array.isArray(merchRes.orders) && merchRes.orders.length > 0) {
            setOrders(merchRes.orders);
          }
        }

        if (isMounted && overviewRes?.club?.logoUrl) {
          setClubLogoUrl(overviewRes.club.logoUrl);
        }

        if (isMounted && Array.isArray(membersRes) && membersRes.length > 0) {
          const pres = membersRes.find((m) => m.role === 'PRESIDENT');
          if (pres?.user?.fullName) {
            setPresidentName(pres.user.fullName);
          }
        }
      } catch {
        // Fallback
      }
    };

    fetchClubData();
    return () => {
      isMounted = false;
    };
  }, []);

  // ── Summary Cards Calculations ─────────────────────────────────
  const summary = useMemo(() => {
    const totalActiveProducts = products.filter((p) => p.status === 'ACTIVE').length;
    const totalOrdersCount = orders.length;
    const pendingOrdersCount = orders.filter(
      (o) => o.fulfillmentStatus !== 'COMPLETED' && o.fulfillmentStatus !== 'CANCELLED'
    ).length;

    // Revenue confirmed from orders (excluding cancelled)
    const revenueCollected = orders
      .filter((o) => o.fulfillmentStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + o.amountPaid, 0);

    const outstandingPayments = orders
      .filter((o) => o.fulfillmentStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + o.outstandingBalance, 0);

    // Variants stock counts across active products
    let lowStockVariantsCount = 0;
    let outOfStockVariantsCount = 0;

    products
      .filter((p) => p.status === 'ACTIVE')
      .forEach((p) => {
        p.variants.forEach((v) => {
          const available = v.onHandStock - v.reservedStock;
          if (available <= 0) {
            outOfStockVariantsCount++;
          } else if (available <= p.lowStockThreshold) {
            lowStockVariantsCount++;
          }
        });
      });

    return {
      totalActiveProducts,
      totalOrdersCount,
      pendingOrdersCount,
      revenueCollected,
      outstandingPayments,
      lowStockVariantsCount,
      outOfStockVariantsCount,
    };
  }, [products, orders]);

  // Unique categories for filters
  const categories = useMemo(() => {
    const setCats = new Set<string>();
    products.forEach((p) => setCats.add(p.category));
    return Array.from(setCats);
  }, [products]);

  // Product count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (categoryFilter !== 'ALL' && product.category !== categoryFilter) return false;
      if (stockStatusFilter === 'LOW_STOCK') {
        const hasLowStock = product.variants.some((v) => {
          const avail = v.onHandStock - v.reservedStock;
          return avail > 0 && avail <= product.lowStockThreshold;
        });
        if (!hasLowStock) return false;
      }
      if (stockStatusFilter === 'OUT_OF_STOCK') {
        const hasOutOfStock = product.variants.some((v) => v.onHandStock - v.reservedStock <= 0);
        if (!hasOutOfStock) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesSku = product.sku.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesCategory) return false;
      }
      return true;
    });
  }, [products, categoryFilter, stockStatusFilter, searchQuery]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (fulfillmentFilter !== 'ALL' && order.fulfillmentStatus !== fulfillmentFilter) return false;
      if (paymentFilter !== 'ALL' && order.paymentStatus !== paymentFilter) return false;
      if (
        selectedProductForOrdersFilter !== 'ALL' &&
        order.productId !== selectedProductForOrdersFilter
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesOrder = order.orderNumber.toLowerCase().includes(q);
        const matchesName = order.studentName.toLowerCase().includes(q);
        const matchesId = order.studentId.toLowerCase().includes(q);
        const matchesProd = order.productName.toLowerCase().includes(q);
        const matchesRef = order.transactionRef?.toLowerCase().includes(q);
        if (!matchesOrder && !matchesName && !matchesId && !matchesProd && !matchesRef) return false;
      }
      return true;
    });
  }, [orders, fulfillmentFilter, paymentFilter, selectedProductForOrdersFilter, searchQuery]);

  // ── Add Product Handlers ─────────────────────────────────────────
  const handleOpenAddProduct = () => {
    setProductFormName('');
    setProductFormCategory('Apparel & Uniforms');
    setProductFormDesc('');
    setProductFormImage('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80');
    setProductFormSellingPrice('799');
    setProductFormCostPrice('450');
    setProductFormMemberPrice('599');
    setProductFormSku(`SKU-SSA-${Date.now().toString().slice(-4)}`);
    setProductFormLowThreshold(10);
    setProductFormVariants([
      { size: 'S', stock: 20 },
      { size: 'M', stock: 30 },
      { size: 'L', stock: 25 },
      { size: 'XL', stock: 15 },
    ]);
    setIsAddProductModalOpen(true);
  };

  const handleAddVariantRow = () => {
    setProductFormVariants((prev) => [...prev, { size: 'One Size', stock: 15 }]);
  };

  const handleRemoveVariantRow = (index: number) => {
    setProductFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormName.trim()) {
      showToast('Product title is required.', 'error');
      return;
    }
    const parsedSelling = parseFloat(productFormSellingPrice);
    if (isNaN(parsedSelling) || parsedSelling <= 0) {
      showToast('Selling price must be greater than zero.', 'error');
      return;
    }
    if (productFormVariants.length === 0) {
      showToast('Please specify at least one product size or variant.', 'error');
      return;
    }

    const newProductId = `prod-${Date.now()}`;
    const newVariants: ProductVariant[] = productFormVariants.map((v) => ({
      size: v.size.trim() || 'Standard',
      sku: `${productFormSku}-${v.size.replace(/\s+/g, '').toUpperCase()}`,
      onHandStock: Math.max(0, v.stock || 0),
      reservedStock: 0,
      soldStock: 0,
    }));

    const newProduct: MerchProduct = {
      id: newProductId,
      clubId: activeClub.id,
      name: productFormName.trim(),
      description: productFormDesc.trim() || 'Official club commemorative merchandise item.',
      category: productFormCategory,
      image: productFormImage.trim() || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      sellingPrice: parsedSelling,
      costPrice: parseFloat(productFormCostPrice) || undefined,
      memberPrice: parseFloat(productFormMemberPrice) || parsedSelling,
      sku: productFormSku.trim() || `SKU-${Date.now()}`,
      status: 'ACTIVE',
      lowStockThreshold: productFormLowThreshold || 10,
      variants: newVariants,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      stockHistory: [],
    };

    // Save to server
    treasurerService
      .createMerchProduct(newProduct)
      .then((saved) => {
        setProducts((prev) => [saved, ...prev.filter((p) => p.id !== newProductId)]);
      })
      .catch((err) => {
        console.error('Failed to save product to server:', err);
      });

    setProducts((prev) => [newProduct, ...prev]);
    setIsAddProductModalOpen(false);
    showToast(`Product "${newProduct.name}" created with ${newVariants.length} variants.`);
  };

  // ── Stock Adjustment Handlers ────────────────────────────────────
  const handleOpenStockAdjust = (product: MerchProduct) => {
    setSelectedProduct(product);
    setAdjustVariantSize(product.variants[0]?.size || 'Standard');
    setAdjustDelta(10);
    setAdjustType('ADD');
    setAdjustReason('New Supplier Restock Batch Received');
    setIsStockAdjustmentModalOpen(true);
  };

  const handleSaveStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const deltaAmount = Math.abs(adjustDelta);
    if (deltaAmount === 0) {
      showToast('Please enter an adjustment quantity greater than zero.', 'error');
      return;
    }

    const appliedDelta = adjustType === 'ADD' ? deltaAmount : -deltaAmount;

    try {
      const targetVariant = selectedProduct.variants.find((v) => v.size === adjustVariantSize);
      if (targetVariant?.sku) {
        await treasurerService
          .updateMerchStock(selectedProduct.id, targetVariant.sku, appliedDelta, adjustReason)
          .catch((e) => console.warn('Server stock update notice:', e));
      }

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== selectedProduct.id) return p;

          const updatedVariants = p.variants.map((v) => {
            if (v.size !== adjustVariantSize) return v;
            const newOnHand = Math.max(0, v.onHandStock + appliedDelta);
            return { ...v, onHandStock: newOnHand };
          });

          const logEntry: StockAdjustmentLog = {
            id: `adj-${Date.now()}`,
            productId: p.id,
            productName: p.name,
            variantSize: adjustVariantSize,
            delta: appliedDelta,
            previousStock: targetVariant?.onHandStock || 0,
            newStock: Math.max(0, (targetVariant?.onHandStock || 0) + appliedDelta),
            reason: adjustReason,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            adjustedBy: `${user?.name || 'Priya Patel'} (Treasurer)`,
          };

          return {
            ...p,
            variants: updatedVariants,
            updatedAt: new Date().toISOString().split('T')[0],
            stockHistory: [logEntry, ...(p.stockHistory || [])],
          };
        })
      );

      setIsStockAdjustmentModalOpen(false);
      showToast(
        `Inventory adjusted for ${selectedProduct.name} (${adjustVariantSize}): ${appliedDelta > 0 ? '+' : ''}${appliedDelta} units.`
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to adjust stock', 'error');
    }
  };

  // ── Archive / Activate Product ───────────────────────────────────
  const handleToggleProductStatus = (product: MerchProduct) => {
    const nextStatus = product.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
    );
    showToast(`Product "${product.name}" status updated to ${nextStatus}.`);
  };

  // ── Order Status Transitions ─────────────────────────────────────
  const handleUpdateFulfillment = async (
    order: StudentMerchOrder,
    newStatus: OrderFulfillmentStatus
  ) => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    try {
      await treasurerService
        .updateOrderStatus(order.id, { fulfillmentStatus: newStatus })
        .catch((e) => console.warn('Order status sync notice:', e));

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== order.id) return o;
          return {
            ...o,
            fulfillmentStatus: newStatus,
            handoverAt: newStatus === 'COMPLETED' ? timeStr : o.handoverAt,
            handoverBy: newStatus === 'COMPLETED' ? `${user?.name || 'Priya Patel'} (Treasurer)` : o.handoverBy,
          };
        })
      );

      showToast(`Order ${order.orderNumber} status updated to ${newStatus}.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // ── Cancel Order & Release Reserved Stock ────────────────────────
  const handleCancelOrder = (order: StudentMerchOrder) => {
    const reason = window.prompt(`Enter cancellation reason for Order ${order.orderNumber}:`, 'Student requested cancellation');
    if (reason === null) return; // user cancelled prompt

    // 1. Release reserved stock from product inventory
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== order.productId) return p;
        const restoredVariants = p.variants.map((v) => {
          if (v.size !== order.variantSize) return v;
          return {
            ...v,
            reservedStock: Math.max(0, v.reservedStock - order.quantity),
          };
        });
        return { ...p, variants: restoredVariants };
      })
    );

    // 2. Update order status
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              fulfillmentStatus: 'CANCELLED',
              cancellationReason: reason || 'Cancelled by Treasurer',
            }
          : o
      )
    );

    showToast(`Order ${order.orderNumber} cancelled. ${order.quantity} units released back to available inventory.`);
  };

  // ── Record Order Offline Payment ─────────────────────────────────
  const handleOpenOrderPayment = (order: StudentMerchOrder) => {
    setSelectedOrder(order);
    setOrderPaymentAmount(order.outstandingBalance.toString());
    setOrderPaymentMethod('UPI');
    setOrderPaymentRef(`PAY-MERCH-${Date.now().toString().slice(-6)}`);
    setIsRecordOrderPaymentModalOpen(true);
  };

  const handleConfirmOrderPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const parsedAmt = parseFloat(orderPaymentAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      showToast('Please enter a valid payment amount.', 'error');
      return;
    }

    const newAmountPaid = selectedOrder.amountPaid + parsedAmt;
    const newBalance = Math.max(0, selectedOrder.orderTotal - newAmountPaid);
    const newStatus: OrderPaymentStatus = newBalance === 0 ? 'PAID' : 'PARTIAL';

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              amountPaid: newAmountPaid,
              outstandingBalance: newBalance,
              paymentStatus: newStatus,
              paymentMethod: orderPaymentMethod,
              transactionRef: orderPaymentRef,
            }
          : o
      )
    );

    // Integrate into central Treasury income
    if (onRecordIncomeEntry) {
      onRecordIncomeEntry({
        source: 'MERCHANDISE',
        title: `Merchandise Collection: ${selectedOrder.productName} (${selectedOrder.variantSize})`,
        payerName: selectedOrder.studentName,
        payerEmail: selectedOrder.studentEmail,
        payerRoll: selectedOrder.studentId,
        amount: parsedAmt,
        paymentMethod: orderPaymentMethod,
        reference: orderPaymentRef,
        date: new Date().toISOString().split('T')[0],
      });
    }

    setIsRecordOrderPaymentModalOpen(false);
    setSelectedOrder(null);
    showToast(`Payment of ₹${parsedAmt.toLocaleString()} recorded for Order ${selectedOrder.orderNumber}.`);
  };

  // ── Export CSV Handlers ──────────────────────────────────────────
  const handleExportProductsCSV = () => {
    const headers = ['Product ID', 'Name', 'Category', 'SKU', 'Selling Price (INR)', 'Member Price (INR)', 'Status', 'Total On-Hand', 'Total Reserved', 'Total Available'];
    const rows = filteredProducts.map((p) => {
      const onHand = p.variants.reduce((acc, v) => acc + v.onHandStock, 0);
      const reserved = p.variants.reduce((acc, v) => acc + v.reservedStock, 0);
      const avail = onHand - reserved;
      return [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.sku,
        p.sellingPrice,
        p.memberPrice || p.sellingPrice,
        p.status,
        onHand,
        reserved,
        avail,
      ];
    });
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Merchandise_Products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportOrdersCSV = () => {
    const headers = [
      'Order Number',
      'Date',
      'Student Name',
      'Student ID',
      'Email',
      'Product Name',
      'Variant (Size)',
      'Quantity',
      'Unit Price',
      'Order Total',
      'Amount Paid',
      'Outstanding Balance',
      'Payment Status',
      'Fulfillment Status',
      'Method',
      'Reference',
    ];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.orderDate,
      `"${o.studentName.replace(/"/g, '""')}"`,
      o.studentId,
      o.studentEmail,
      `"${o.productName.replace(/"/g, '""')}"`,
      o.variantSize,
      o.quantity,
      o.unitPrice,
      o.orderTotal,
      o.amountPaid,
      o.outstandingBalance,
      o.paymentStatus,
      o.fulfillmentStatus,
      o.paymentMethod || '',
      o.transactionRef || '',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Student_Merchandise_Orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold transition-all ${
            toastMessage.type === 'success' ? 'bg-[#059669] text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:opacity-70 ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── 1. Merchandise Page Header ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
              {clubLogoUrl ? (
                <img src={clubLogoUrl} alt={activeClub.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-7 h-7 text-[#4F46E5]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">Merchandise Management</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100">
                  {activeClub.name}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    President: <strong className="text-[#0F172A] font-semibold">{presidentName}</strong>
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    Treasurer: <strong className="text-[#0F172A] font-semibold">{user?.name || 'Priya Patel'}</strong>
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {/* View Switcher Pills */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setActiveView('PRODUCTS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'PRODUCTS'
                    ? 'bg-white text-[#4F46E5] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Products & Stock ({products.length})</span>
              </button>
              <button
                onClick={() => setActiveView('ORDERS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'ORDERS'
                    ? 'bg-white text-[#4F46E5] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Student Orders ({orders.length})</span>
                {summary.pendingOrdersCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#4F46E5] text-white">
                    {summary.pendingOrdersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            {activeView === 'PRODUCTS' ? (
              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            ) : (
              <button
                onClick={handleExportOrdersCSV}
                className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Export Orders</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Merchandise Summary Cards (7 Cards) ────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Total Active Products */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <span className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Total Products
          </span>
          <div className="text-xl font-bold text-[#0F172A] font-mono mt-1">{summary.totalActiveProducts}</div>
          <span className="text-[10px] text-[#64748B] mt-1 block">Active on store</span>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <span className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Total Orders
          </span>
          <div className="text-xl font-bold text-[#0F172A] font-mono mt-1">{summary.totalOrdersCount}</div>
          <span className="text-[10px] text-[#64748B] mt-1 block">Campus bookings</span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <span className="block text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            Pending Orders
          </span>
          <div className="text-xl font-bold text-amber-700 font-mono mt-1">{summary.pendingOrdersCount}</div>
          <span className="text-[10px] text-amber-700 font-medium mt-1 block">Handover queue</span>
        </div>

        {/* Revenue Collected */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <span className="block text-[11px] font-semibold text-[#059669] uppercase tracking-wider">
            Revenue Collected
          </span>
          <div className="text-xl font-bold text-[#059669] font-mono mt-1">₹{summary.revenueCollected.toLocaleString()}</div>
          <span className="text-[10px] text-[#64748B] mt-1 block">Confirmed paid</span>
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <span className="block text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            Low Stock
          </span>
          <div className="text-xl font-bold text-amber-700 font-mono mt-1">{summary.lowStockVariantsCount}</div>
          <span className="text-[10px] text-amber-700 font-medium mt-1 block">Variants below threshold</span>
        </div>

        {/* Out of Stock */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <span className="block text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
            Out of Stock
          </span>
          <div className="text-xl font-bold text-rose-600 font-mono mt-1">{summary.outOfStockVariantsCount}</div>
          <span className="text-[10px] text-rose-600 font-medium mt-1 block">Zero availability</span>
        </div>

        {/* Outstanding Payments */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <span className="block text-[11px] font-semibold text-[#0F172A] uppercase tracking-wider">
            Outstanding
          </span>
          <div className="text-xl font-bold text-[#0F172A] font-mono mt-1">₹{summary.outstandingPayments.toLocaleString()}</div>
          <span className="text-[10px] text-[#64748B] mt-1 block">Unpaid on orders</span>
        </div>
      </div>

      {/* ── 3. VIEW 1: PRODUCTS & INVENTORY ────────────────────────── */}
      {activeView === 'PRODUCTS' && (
        <div className="space-y-6">
          {/* Products Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Left: Search Bar */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search product, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right: Selectable Filter Dropdowns & Actions */}
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-2.5">
              {/* Category Filter Dropdown */}
              <div className="relative min-w-[175px] flex-1 sm:flex-initial">
                <Tag className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={`w-full appearance-none pl-8.5 pr-8 py-2 text-xs rounded-xl border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 ${
                    categoryFilter !== 'ALL'
                      ? 'bg-[#EEF2FF] border-[#4F46E5]/40 text-[#4F46E5] font-semibold ring-1 ring-[#4F46E5]/20'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-[#E2E8F0] text-[#0F172A] font-medium'
                  }`}
                >
                  <option value="ALL">All Categories ({products.length})</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({categoryCounts[cat] || 0})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Stock Status Filter Dropdown */}
              <div className="relative min-w-[155px] flex-1 sm:flex-initial">
                <Filter className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  className={`w-full appearance-none pl-8.5 pr-8 py-2 text-xs rounded-xl border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 ${
                    stockStatusFilter !== 'ALL'
                      ? 'bg-[#EEF2FF] border-[#4F46E5]/40 text-[#4F46E5] font-semibold ring-1 ring-[#4F46E5]/20'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-[#E2E8F0] text-[#0F172A] font-medium'
                  }`}
                >
                  <option value="ALL">All Stock Levels</option>
                  <option value="LOW_STOCK">Low Stock (≤ 10)</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Reset button if active */}
              {(categoryFilter !== 'ALL' || stockStatusFilter !== 'ALL' || searchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('ALL');
                    setStockStatusFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/60 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}

              {/* Export Products Button */}
              <button
                type="button"
                onClick={handleExportProductsCSV}
                className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                title="Export Products CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-[#E2E8F0]">
                No merchandise items found matching current filters.
              </div>
            ) : (
              filteredProducts.map((product) => {
                const totalOnHand = product.variants.reduce((acc, v) => acc + v.onHandStock, 0);
                const totalReserved = product.variants.reduce((acc, v) => acc + v.reservedStock, 0);
                const totalAvailable = totalOnHand - totalReserved;
                const totalSold = product.variants.reduce((acc, v) => acc + v.soldStock, 0);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image & Badges */}
                      <div className="relative h-44 bg-slate-100 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-[#0F172A] shadow-xs">
                            {product.category}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                              product.status === 'ACTIVE'
                                ? 'bg-[#059669] text-white'
                                : 'bg-slate-700 text-white'
                            }`}
                          >
                            {product.status}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-[#0F172A] text-sm line-clamp-1">{product.name}</h3>
                          </div>
                          <span className="text-[11px] font-mono text-[#64748B]">{product.sku}</span>
                          <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{product.description}</p>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-lg font-bold text-[#0F172A] font-mono">
                            ₹{product.memberPrice?.toLocaleString() || product.sellingPrice.toLocaleString()}
                          </span>
                          {product.memberPrice && product.memberPrice < product.sellingPrice && (
                            <>
                              <span className="text-xs text-[#64748B] line-through font-mono">
                                ₹{product.sellingPrice.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-semibold text-[#059669]">Member Perk</span>
                            </>
                          )}
                        </div>

                        {/* Variant Stock Matrix */}
                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B] mb-1.5">
                            <span>Available Stock by Size/Variant</span>
                            <span className="font-mono text-[#0F172A] font-bold">{totalAvailable} avail</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {product.variants.map((v) => {
                              const avail = v.onHandStock - v.reservedStock;
                              const isLow = avail > 0 && avail <= product.lowStockThreshold;
                              const isOut = avail <= 0;

                              return (
                                <div
                                  key={v.size}
                                  className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1 font-mono ${
                                    isOut
                                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                                      : isLow
                                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                                      : 'bg-slate-50 border-slate-200 text-[#0F172A]'
                                  }`}
                                  title={`On Hand: ${v.onHandStock} | Reserved in Orders: ${v.reservedStock} | Sold: ${v.soldStock}`}
                                >
                                  <span className="font-semibold">{v.size}:</span>
                                  <span className="font-bold">{avail}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-3.5 bg-slate-50/70 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                      <div className="text-[11px] text-[#64748B]">
                        Sold: <strong className="text-[#0F172A] font-mono">{totalSold}</strong> units
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenStockAdjust(product)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          title="Adjust variant inventory"
                        >
                          <Sliders className="w-3.5 h-3.5 text-[#4F46E5]" />
                          <span>Stock</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProductForOrdersFilter(product.id);
                            setActiveView('ORDERS');
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                          title="View student orders for this product"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Orders</span>
                        </button>

                        <button
                          onClick={() => handleToggleProductStatus(product)}
                          className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
                          title={product.status === 'ACTIVE' ? 'Archive Product' : 'Activate Product'}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── 4. VIEW 2: STUDENT ORDERS MANAGEMENT ───────────────────── */}
      {activeView === 'ORDERS' && (
        <div className="space-y-6">
          {/* Orders Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Fulfillment Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {[
                { id: 'ALL', label: 'All Orders' },
                { id: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
                { id: 'CONFIRMED', label: 'Confirmed' },
                { id: 'PROCESSING', label: 'Processing' },
                { id: 'COMPLETED', label: 'Completed' },
                { id: 'CANCELLED', label: 'Cancelled' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFulfillmentFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    fulfillmentFilter === tab.id
                      ? 'bg-[#4F46E5] text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-[#64748B] hover:bg-slate-200/80 hover:text-[#0F172A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-2.5">
              <div className="relative flex-1 md:w-60">
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search order #, student, ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-8 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#64748B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="relative min-w-[155px]">
                <CreditCard className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className={`w-full appearance-none pl-8.5 pr-8 py-2 text-xs font-medium rounded-xl border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 ${
                    paymentFilter !== 'ALL'
                      ? 'bg-[#EEF2FF] border-[#4F46E5]/40 text-[#4F46E5] font-semibold ring-1 ring-[#4F46E5]/20'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  <option value="ALL">All Payment Statuses</option>
                  <option value="PAID">Paid Only</option>
                  <option value="PARTIAL">Partially Paid</option>
                  <option value="UNPAID">Unpaid Only</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {selectedProductForOrdersFilter !== 'ALL' && (
                <button
                  onClick={() => setSelectedProductForOrdersFilter('ALL')}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-50 text-[#4F46E5] text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                  title="Clear product scope"
                >
                  <span>Scoped</span>
                  <X className="w-3 h-3" />
                </button>
              )}

              <button
                type="button"
                onClick={handleExportOrdersCSV}
                className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                title="Export Orders CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3 px-4">Order # & Date</th>
                    <th className="py-3 px-4">Student & ID</th>
                    <th className="py-3 px-4">Item & Variant</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Paid / Due</th>
                    <th className="py-3 px-4 text-center">Payment</th>
                    <th className="py-3 px-4 text-center">Fulfillment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#64748B] text-xs">
                        No student merchandise orders found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Order & Date */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="font-semibold text-[#0F172A] font-mono text-xs">{order.orderNumber}</div>
                          <div className="text-[11px] text-[#64748B] mt-0.5">{order.orderDate}</div>
                        </td>

                        {/* Student */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="font-semibold text-[#0F172A] text-xs">{order.studentName}</div>
                          <div className="text-[11px] text-[#64748B] font-mono mt-0.5">{order.studentId}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{order.studentEmail}</div>
                        </td>

                        {/* Item & Size */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="font-medium text-[#0F172A] text-xs line-clamp-1">{order.productName}</div>
                          <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                            Size/Variant: <strong className="text-slate-800">{order.variantSize}</strong>
                          </div>
                        </td>

                        {/* Qty */}
                        <td className="py-3.5 px-4 text-center align-middle font-mono font-semibold text-xs text-[#0F172A]">
                          {order.quantity}
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-4 text-right align-middle font-mono font-semibold text-xs text-[#0F172A]">
                          ₹{order.orderTotal.toLocaleString()}
                        </td>

                        {/* Paid / Due */}
                        <td className="py-3.5 px-4 text-right align-middle font-mono text-xs">
                          <div className="text-[#059669] font-medium">₹{order.amountPaid.toLocaleString()}</div>
                          {order.outstandingBalance > 0 ? (
                            <div className="text-rose-600 font-bold text-[11px]">
                              Due: ₹{order.outstandingBalance.toLocaleString()}
                            </div>
                          ) : (
                            <div className="text-slate-400 text-[10px]">Settled</div>
                          )}
                        </td>

                        {/* Payment Status Badge */}
                        <td className="py-3.5 px-4 text-center align-middle">
                          {order.paymentStatus === 'PAID' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-[#059669] border border-emerald-200/70">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          )}
                          {order.paymentStatus === 'PARTIAL' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/70">
                              <Clock className="w-3 h-3" /> Partial
                            </span>
                          )}
                          {order.paymentStatus === 'UNPAID' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                              Unpaid
                            </span>
                          )}
                        </td>

                        {/* Fulfillment Status Badge */}
                        <td className="py-3.5 px-4 text-center align-middle">
                          {order.fulfillmentStatus === 'READY_FOR_PICKUP' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200/70">
                              <ShoppingBag className="w-3 h-3" /> Ready
                            </span>
                          )}
                          {order.fulfillmentStatus === 'CONFIRMED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/70">
                              Confirmed
                            </span>
                          )}
                          {order.fulfillmentStatus === 'PROCESSING' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              Processing
                            </span>
                          )}
                          {order.fulfillmentStatus === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-[#059669] border border-emerald-200/70">
                              <Check className="w-3 h-3" /> Handed Over
                            </span>
                          )}
                          {order.fulfillmentStatus === 'CANCELLED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-400 line-through">
                              Cancelled
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right align-middle">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Handover / Ready status controls */}
                            {order.fulfillmentStatus === 'CONFIRMED' && (
                              <button
                                onClick={() => handleUpdateFulfillment(order, 'READY_FOR_PICKUP')}
                                className="px-2 py-1 rounded-lg bg-[#4F46E5] hover:bg-[#3730A3] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Mark ready for student collection"
                              >
                                Mark Ready
                              </button>
                            )}

                            {order.fulfillmentStatus === 'READY_FOR_PICKUP' && (
                              <button
                                onClick={() => handleUpdateFulfillment(order, 'COMPLETED')}
                                className="px-2 py-1 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                title="Confirm item handed over to student"
                              >
                                <Check className="w-3 h-3" />
                                <span>Handover</span>
                              </button>
                            )}

                            {/* Collect offline payment if balance due */}
                            {order.outstandingBalance > 0 && order.fulfillmentStatus !== 'CANCELLED' && (
                              <button
                                onClick={() => handleOpenOrderPayment(order)}
                                className="px-2 py-1 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#0F172A] text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Collect cash / verify offline payment"
                              >
                                Pay
                              </button>
                            )}

                            {/* Cancel order if not completed */}
                            {order.fulfillmentStatus !== 'COMPLETED' && order.fulfillmentStatus !== 'CANCELLED' && (
                              <button
                                onClick={() => handleCancelOrder(order)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Cancel order and release reserved stock"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3.5 bg-slate-50/60 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4 text-xs text-[#64748B]">
              <span>
                Showing <strong className="text-[#0F172A]">{filteredOrders.length}</strong> orders
              </span>
              <div className="flex items-center gap-4">
                <span>
                  Total Value:{' '}
                  <strong className="text-[#0F172A] font-mono text-xs">
                    ₹{filteredOrders.reduce((acc, o) => acc + o.orderTotal, 0).toLocaleString()}
                  </strong>
                </span>
                <span>
                  Total Paid:{' '}
                  <strong className="text-[#059669] font-mono text-xs">
                    ₹{filteredOrders.reduce((acc, o) => acc + o.amountPaid, 0).toLocaleString()}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Add Product Modal ───────────────────────────────────── */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Add New Club Merchandise Product</h3>
                  <p className="text-xs text-[#64748B]">Define variants, sizes, prices, and initial stock</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skyline Commemorative Tech Hoodie"
                    value={productFormName}
                    onChange={(e) => setProductFormName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Category *</label>
                  <select
                    value={productFormCategory}
                    onChange={(e) => setProductFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] font-medium cursor-pointer"
                  >
                    <option value="Apparel & Uniforms">Apparel & Uniforms</option>
                    <option value="Goodies & Drinkware">Goodies & Drinkware</option>
                    <option value="Footwear & Lifestyle">Footwear & Lifestyle</option>
                    <option value="Stationery & Accessories">Stationery & Accessories</option>
                    <option value="Educational & Board Games">Educational & Board Games</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Product SKU / Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SKU-SSA-HOD-26"
                    value={productFormSku}
                    onChange={(e) => setProductFormSku(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Fabric specs, wash care instructions, or materials..."
                  value={productFormDesc}
                  onChange={(e) => setProductFormDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
              </div>

              {/* Pricing & Thresholds */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productFormSellingPrice}
                    onChange={(e) => setProductFormSellingPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-medium bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Member Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={productFormMemberPrice}
                    onChange={(e) => setProductFormMemberPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-medium bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Low-Stock Alert Level</label>
                  <input
                    type="number"
                    min="1"
                    value={productFormLowThreshold}
                    onChange={(e) => setProductFormLowThreshold(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={productFormImage}
                  onChange={(e) => setProductFormImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
              </div>

              {/* Sizes / Variants Matrix */}
              <div className="pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-[#0F172A]">
                    Product Sizes & Initial Stock Quantities *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-xs font-semibold text-[#4F46E5] hover:text-[#3730A3] cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Size</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {productFormVariants.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Size / Variant (e.g. S, M, 11oz)"
                        value={v.size}
                        onChange={(e) => {
                          const updated = [...productFormVariants];
                          updated[idx].size = e.target.value;
                          setProductFormVariants(updated);
                        }}
                        className="w-1/2 px-3 py-1.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Initial Stock"
                        value={v.stock}
                        onChange={(e) => {
                          const updated = [...productFormVariants];
                          updated[idx].stock = parseInt(e.target.value) || 0;
                          setProductFormVariants(updated);
                        }}
                        className="w-1/2 px-3 py-1.5 text-xs font-mono bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                      />
                      {productFormVariants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#64748B] bg-slate-100 rounded-xl hover:bg-slate-200 hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#3730A3] rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Confirm & Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. Adjust Inventory Stock Modal ────────────────────────── */}
      {isStockAdjustmentModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Adjust Inventory Stock</h3>
                  <p className="text-xs text-[#64748B]">{selectedProduct.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsStockAdjustmentModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Target Size / Variant *</label>
                <select
                  value={adjustVariantSize}
                  onChange={(e) => setAdjustVariantSize(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] font-semibold cursor-pointer"
                >
                  {selectedProduct.variants.map((v) => (
                    <option key={v.size} value={v.size}>
                      Size: {v.size} (Current On Hand: {v.onHandStock} | Available: {v.onHandStock - v.reservedStock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Adjustment Action</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] font-medium cursor-pointer"
                  >
                    <option value="ADD">Add Stock (+)</option>
                    <option value="DEDUCT">Deduct Stock (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-mono font-medium bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Audit Reason *</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] font-medium cursor-pointer"
                >
                  <option value="New Supplier Restock Batch Received">New Supplier Restock Batch Received</option>
                  <option value="Damaged / Defective Stock Written Off">Damaged / Defective Stock Written Off</option>
                  <option value="Physical Inventory Count Audit Recount">Physical Inventory Count Audit Recount</option>
                  <option value="Promotional Sample Giveaway Handout">Promotional Sample Giveaway Handout</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsStockAdjustmentModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#64748B] bg-slate-100 rounded-xl hover:bg-slate-200 hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#3730A3] rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Apply Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. Record Order Offline Payment Modal ─────────────────── */}
      {isRecordOrderPaymentModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Record Order Payment</h3>
                  <p className="text-xs text-[#64748B]">Order #{selectedOrder.orderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setIsRecordOrderPaymentModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmOrderPayment} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Student:</span>
                  <span className="font-semibold text-[#0F172A]">{selectedOrder.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Item Ordered:</span>
                  <span className="text-[#0F172A]">
                    {selectedOrder.productName} ({selectedOrder.variantSize})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Outstanding Balance:</span>
                  <span className="font-mono font-bold text-rose-600">₹{selectedOrder.outstandingBalance}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Amount Collected (₹ INR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedOrder.outstandingBalance}
                  value={orderPaymentAmount}
                  onChange={(e) => setOrderPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-medium bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Payment Method</label>
                  <select
                    value={orderPaymentMethod}
                    onChange={(e) => setOrderPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] font-medium cursor-pointer"
                  >
                    <option value="UPI">UPI Direct</option>
                    <option value="CASH">Cash at Desk</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="NET_BANKING">Net Banking Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Transaction Ref</label>
                  <input
                    type="text"
                    required
                    value={orderPaymentRef}
                    onChange={(e) => setOrderPaymentRef(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsRecordOrderPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#64748B] bg-slate-100 rounded-xl hover:bg-slate-200 hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#3730A3] rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Confirm & Settle Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
