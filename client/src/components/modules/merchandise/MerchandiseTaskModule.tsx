import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Package,
  TrendingUp,
  BarChart3,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  QrCode,
  RefreshCw,
  DollarSign,
  Layers,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { useClubStore } from '../../../stores/club.store';
import { ROLES } from '../../../config/roles';
import { RealQrCode } from '../../shared/RealQrCode';
import {
  merchandiseService,
  MerchProduct,
  MerchOrder,
  MerchAnalyticsResponse,
  CreateProductPayload,
} from '../../../services/merchandise.service';

// Preset Odoo Goodies for quick fill in Campus Lead modal
const ODOO_PRESETS = [
  {
    name: 'Odoo Classic Piqué Polo Shirt',
    category: 'Apparel & Uniforms',
    image: 'https://odoocdn.com/web/image/product.image/10/image_1024/Odoo%20Short%20Sleeve%20Polo?unique=d5e3797',
    sellingPrice: 1199,
    memberPrice: 699,
    costPrice: 420,
    sku: 'SKU-SSA-POLO-2026',
    description: '100% combed cotton breathable piqué fabric with embroidered Odoo crest, ribbed collar, and tailored cuffs.',
    variants: [
      { size: 'S', onHandStock: 20 },
      { size: 'M', onHandStock: 25 },
      { size: 'L', onHandStock: 18 },
      { size: 'XL', onHandStock: 9 },
    ],
  },
  {
    name: 'Odoo Official Ceramic Mug',
    category: 'Drinkware & Goodies',
    image: 'https://odoocdn.com/web/image/product.product/20563/image_1024/Mug?unique=02e5ff9',
    sellingPrice: 450,
    memberPrice: 250,
    costPrice: 160,
    sku: 'SKU-SSA-MUG-2026',
    description: 'High-gloss 11oz ceramic mug with vivid Odoo emblem print. Dishwasher and microwave safe.',
    variants: [{ size: '11 oz', onHandStock: 65 }],
  },
  {
    name: 'Odoo Signature Low-Top Sneakers',
    category: 'Footwear & Lifestyle',
    image: 'https://odoocdn.com/web/image/product.image/11/image_1024/Odoo%20Shoes?unique=9b6c356',
    sellingPrice: 2999,
    memberPrice: 1899,
    costPrice: 1250,
    sku: 'SKU-SSA-SHOE-2026',
    description: 'Comfortable and stylish low-top sneakers in signature purple & white colorway with durable vulcanized rubber sole.',
    variants: [
      { size: 'EU 40', onHandStock: 12 },
      { size: 'EU 41', onHandStock: 15 },
      { size: 'EU 42', onHandStock: 14 },
      { size: 'EU 43', onHandStock: 10 },
    ],
  },
  {
    name: 'Scale-Up! The Business Game',
    category: 'Educational & Board Games',
    image: 'https://odoocdn.com/web/image/product.product/107155/image_1024/%5BSCUD%5D%20Scale-Up%21%20Business%20Game%20%5BDE%5D?unique=bce70b4',
    sellingPrice: 1499,
    memberPrice: 899,
    costPrice: 550,
    sku: 'SKU-SSA-GAME-2026',
    description: 'Learn real-world business & ERP management with 36 interactive business challenge cards across 4 real startup case studies.',
    variants: [{ size: 'Standard Box', onHandStock: 33 }],
  },
  {
    name: 'Odoo Campus Hoodie 2026',
    category: 'Apparel & Uniforms',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    sellingPrice: 1899,
    memberPrice: 1199,
    costPrice: 750,
    sku: 'SKU-SSA-HOODIE-2026',
    description: 'Premium heavyweight brushed fleece pullover with kangaroo pocket and embroidered chest badge.',
    variants: [
      { size: 'S', onHandStock: 15 },
      { size: 'M', onHandStock: 30 },
      { size: 'L', onHandStock: 25 },
      { size: 'XL', onHandStock: 10 },
    ],
  },
];

export const MerchandiseTaskModule: React.FC = () => {
  const { user, role } = useAuthStore();
  const { fundraiserTasks, addTask, updateTaskStatus } = useClubStore();

  const isPresident = role === ROLES.PRESIDENT || user?.roles?.includes('PRESIDENT');
  const isCampusLeadOrAdmin =
    isPresident ||
    role === ROLES.ADMIN ||
    role === ROLES.TREASURER ||
    role === ROLES.EVENT_ORGANIZER;

  // Active Tab
  const [activeTab, setActiveTab] = useState<'store' | 'orders' | 'analytics' | 'tasks'>('store');

  // Backend Data State
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<MerchProduct[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [orders, setOrders] = useState<MerchOrder[]>([]);
  const [analytics, setAnalytics] = useState<MerchAnalyticsResponse | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Checkout State
  const [checkoutProduct, setCheckoutProduct] = useState<{
    product: MerchProduct;
    size: string;
    unitPrice: number;
    quantity: number;
  } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Success / Pickup Pass Modal State
  const [confirmedOrder, setConfirmedOrder] = useState<{
    order: MerchOrder;
    pickupQr: string;
    discountClaimed: number;
    isMember: boolean;
  } | null>(null);
  const [selectedViewOrder, setSelectedViewOrder] = useState<MerchOrder | null>(null);

  // Toast / Feedback Alert
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Campus Lead Create Product Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [productForm, setProductForm] = useState<CreateProductPayload>({
    name: '',
    category: 'Apparel & Uniforms',
    description: '',
    image: 'https://odoocdn.com/web/image/product.image/10/image_1024/Odoo%20Short%20Sleeve%20Polo?unique=d5e3797',
    sellingPrice: 999,
    memberPrice: 599,
    costPrice: 400,
    sku: `SKU-ODOO-${Date.now().toString().slice(-4)}`,
    lowStockThreshold: 10,
    variants: [
      { size: 'S', onHandStock: 20 },
      { size: 'M', onHandStock: 25 },
      { size: 'L', onHandStock: 20 },
      { size: 'XL', onHandStock: 10 },
    ],
  });

  // Task Modal (Fundraiser Bake sale)
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Baking' as const,
    assignee: user?.name || 'Deepak Kumar',
    dueDate: 'May 15, 2026',
  });

  // 1. Fetch live merchandise catalog from backend
  const loadProducts = async () => {
    try {
      const data = await merchandiseService.getProducts({ userEmail: user?.email });
      setProducts(data.products || []);
      setIsMember(data.isMember || false);

      // Initialize default variant size selection for each product
      const initialVariants: Record<string, string> = {};
      data.products.forEach((p) => {
        if (p.variants && p.variants.length > 0) {
          initialVariants[p.id] = p.variants[0].size;
        }
      });
      setSelectedVariants((prev) => ({ ...initialVariants, ...prev }));
    } catch (err: any) {
      console.error('Failed to load merchandise:', err);
    }
  };

  // 2. Fetch my orders
  const loadOrders = async () => {
    try {
      const ordersData = await merchandiseService.getMyOrders();
      setOrders(ordersData || []);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
    }
  };

  // 3. Fetch analytics if lead/admin or president
  const loadAnalytics = async () => {
    if (!isCampusLeadOrAdmin && !isPresident) return;
    try {
      const analyticsData = await merchandiseService.getMerchandiseAnalytics();
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadProducts(), loadOrders(), loadAnalytics()]);
      setLoading(false);
    };
    init();
  }, [user?.email, role]);

  // Tab change handler
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'analytics') {
      loadAnalytics();
    } else if (tab === 'orders') {
      loadOrders();
      if (isPresident || isCampusLeadOrAdmin) {
        loadAnalytics();
      }
    } else if (tab === 'store') {
      loadProducts();
    }
  };

  // Variant selector
  const handleSelectSize = (productId: string, size: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: size }));
  };

  // Open Checkout
  const handleInitiateOrder = (product: MerchProduct) => {
    const selectedSize = selectedVariants[product.id] || (product.variants?.[0]?.size ?? 'Standard');
    const unitPrice = isMember ? product.memberPrice : product.sellingPrice;

    setCheckoutProduct({
      product,
      size: selectedSize,
      unitPrice,
      quantity: 1,
    });
    setIsPaymentModalOpen(true);
  };

  // Confirm order and backend order placement (simple Buy Now, zero Razorpay dependency)
  const handleConfirmOrder = async () => {
    if (!checkoutProduct || isPlacingOrder) return;
    setIsPlacingOrder(true);
    try {
      const res = await merchandiseService.placeOrder({
        productId: checkoutProduct.product.id,
        variantSize: checkoutProduct.size,
        quantity: checkoutProduct.quantity,
        paymentMethod: 'CAMPUS_DESK',
        notes: `Pickup by student at campus desk`,
      });

      setIsPaymentModalOpen(false);
      setCheckoutProduct(null);

      setConfirmedOrder({
        order: res.data.order,
        pickupQr: res.data.pickupQr,
        discountClaimed: res.data.discountClaimed,
        isMember: res.data.isMember,
      });

      setAlert({
        type: 'success',
        message: `Order #${res.data.order.orderNumber} placed! Pickup pass ready with scannable QR.`,
      });

      // Refresh catalog and orders
      loadProducts();
      loadOrders();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to place order.',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Handle preset fill in create product modal
  const handleApplyPreset = (preset: typeof ODOO_PRESETS[0]) => {
    setProductForm({
      name: preset.name,
      category: preset.category,
      description: preset.description,
      image: preset.image,
      sellingPrice: preset.sellingPrice,
      memberPrice: preset.memberPrice,
      costPrice: preset.costPrice,
      sku: preset.sku,
      lowStockThreshold: 10,
      variants: preset.variants.map((v) => ({ ...v })),
    });
  };

  // Add / Remove Variant row in Create modal
  const handleAddVariantRow = () => {
    setProductForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: 'Size ' + (prev.variants.length + 1), onHandStock: 20 }],
    }));
  };

  const handleRemoveVariantRow = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleVariantStockChange = (index: number, field: 'size' | 'onHandStock', val: any) => {
    setProductForm((prev) => {
      const copy = [...prev.variants];
      copy[index] = { ...copy[index], [field]: field === 'onHandStock' ? Number(val) || 0 : val };
      return { ...prev, variants: copy };
    });
  };

  // Submit new product (Campus Lead / Admin)
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.sellingPrice) {
      setAlert({ type: 'error', message: 'Product name and selling price are required.' });
      return;
    }
    try {
      setIsSubmittingProduct(true);
      await merchandiseService.createProduct(productForm);
      setShowCreateModal(false);
      setAlert({
        type: 'success',
        message: `Merchandise item "${productForm.name}" created with assigned variant stock!`,
      });
      loadProducts();
      loadAnalytics();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to create merchandise product.',
      });
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Fulfill order status toggle (Officer desk handover)
  const handleFulfillOrder = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'READY_FOR_PICKUP' : 'COMPLETED';
    try {
      await merchandiseService.updateOrderStatus(orderId, nextStatus, user?.name || 'Campus Lead Officer');
      setAlert({
        type: 'success',
        message: `Order fulfillment status updated to ${nextStatus}.`,
      });
      loadAnalytics();
      loadOrders();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to update order status.',
      });
    }
  };

  // Create fundraiser task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    addTask({
      title: newTask.title,
      category: newTask.category,
      assignee: newTask.assignee,
      status: 'TODO',
      dueDate: newTask.dueDate,
    });
    setShowTaskModal(false);
    setNewTask({
      title: '',
      category: 'Baking',
      assignee: user?.name || 'Deepak Kumar',
      dueDate: 'May 15, 2026',
    });
  };

  // Categories list
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const completedCount = fundraiserTasks.filter((t) => t.status === 'DONE').length;
  const progressPercent =
    fundraiserTasks.length > 0 ? Math.round((completedCount / fundraiserTasks.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-body)' }}>
      {/* ── 1. MODULE HEADER & HERO ────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.25)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                CAMPUS STORE & OFFICIAL ODOO GOODIES
              </span>
              {isMember && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#86efac',
                    background: 'rgba(34, 197, 94, 0.2)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    border: '1px solid rgba(134, 239, 172, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkles style={{ width: '12px', height: '12px' }} />
                  Member Discount Active (Up to 40% OFF)
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              {isPresident ? 'Merchandise Products & Store Operations' : 'Campus Merchandise & Official Goodies'}
            </h1>
            <p style={{ fontSize: '14px', color: '#c7d2fe', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
              {isPresident
                ? 'Manage club merchandise catalog, add new products, track incoming student orders, and review store finances.'
                : 'Official club apparel, Odoo swag, live stock allocation with size specifications, and digital QR pickup passes.'}
            </p>
          </div>

          {/* Quick Lead Actions */}
          {(isPresident || isCampusLeadOrAdmin) && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.15s',
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                + Add Merchandise Product
              </button>
            </div>
          )}
        </div>

        {/* President Store Stats Banner */}
        {isPresident && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              marginTop: '22px',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              paddingTop: '20px',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                padding: '14px 18px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#c7d2fe', textTransform: 'uppercase' }}>
                Orders Received
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'white', marginTop: '4px' }}>
                {analytics?.overview?.totalOrders ?? orders.length} Orders
              </div>
              <div style={{ fontSize: '11px', color: '#a5b4fc', marginTop: '2px' }}>Total student orders received</div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                padding: '14px 18px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#c7d2fe', textTransform: 'uppercase' }}>
                Total Order Values
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#86efac', marginTop: '4px' }}>
                ₹{(analytics?.overview?.totalRevenue ?? orders.reduce((s, o) => s + o.orderTotal, 0)).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: '#a5b4fc', marginTop: '2px' }}>Gross merchandise sales</div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                padding: '14px 18px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#c7d2fe', textTransform: 'uppercase' }}>
                Configured Products
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'white', marginTop: '4px' }}>
                {products.length} Products
              </div>
              <div style={{ fontSize: '11px', color: '#a5b4fc', marginTop: '2px' }}>Active in club catalog</div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                padding: '14px 18px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#c7d2fe', textTransform: 'uppercase' }}>
                Stock Outflow / Units Sold
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#fde047', marginTop: '4px' }}>
                {orders.reduce((s, o) => s + o.quantity, 0)} Units
              </div>
              <div style={{ fontSize: '11px', color: '#a5b4fc', marginTop: '2px' }}>Fulfilled or awaiting pickup</div>
            </div>
          </div>
        )}

        {/* Dynamic Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '24px',
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(10px)',
            padding: '6px',
            borderRadius: '12px',
            width: 'fit-content',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => handleTabChange('store')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'store' ? 'white' : 'transparent',
              color: activeTab === 'store' ? '#1e1b4b' : '#c7d2fe',
              fontSize: '13px',
              fontWeight: activeTab === 'store' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShoppingBag style={{ width: '15px', height: '15px' }} />
            {isPresident ? `Products & Stock (${products.length})` : `Merchandise Store (${products.length})`}
          </button>

          <button
            onClick={() => handleTabChange('orders')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'orders' ? 'white' : 'transparent',
              color: activeTab === 'orders' ? '#1e1b4b' : '#c7d2fe',
              fontSize: '13px',
              fontWeight: activeTab === 'orders' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Package style={{ width: '15px', height: '15px' }} />
            {isPresident
              ? `Orders Received (${analytics?.overview?.totalOrders ?? orders.length})`
              : `My Orders (${orders.length})`}
          </button>

          {(isPresident || isCampusLeadOrAdmin) && (
            <button
              onClick={() => handleTabChange('analytics')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'analytics' ? 'white' : 'transparent',
                color: activeTab === 'analytics' ? '#1e1b4b' : '#c7d2fe',
                fontSize: '13px',
                fontWeight: activeTab === 'analytics' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <TrendingUp style={{ width: '15px', height: '15px' }} />
              Merchandise Finance & Records
            </button>
          )}

          {!isPresident && (
            <button
              onClick={() => handleTabChange('tasks')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'tasks' ? 'white' : 'transparent',
                color: activeTab === 'tasks' ? '#1e1b4b' : '#c7d2fe',
                fontSize: '13px',
                fontWeight: activeTab === 'tasks' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Layers style={{ width: '15px', height: '15px' }} />
              Bake Sale Fundraiser Tasks ({progressPercent}%)
            </button>
          )}
        </div>
      </div>

      {/* Global Toast Alert */}
      {alert && (
        <div
          style={{
            background: alert.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: alert.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca',
            color: alert.type === 'success' ? '#065f46' : '#991b1b',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {alert.type === 'success' ? (
              <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
            ) : (
              <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
            )}
            <span style={{ fontWeight: 600 }}>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 700, cursor: 'pointer' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── TAB 1: MERCHANDISE STORE (STUDENTS & MEMBERS) ───────── */}
      {activeTab === 'store' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Member Discount Status Bar */}
          <div
            style={{
              background: isMember
                ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: isMember ? '1px solid #86efac' : '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: isMember ? '#15803d' : '#2563eb',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isMember ? <Sparkles style={{ width: '22px', height: '22px' }} /> : <ShoppingBag style={{ width: '22px', height: '22px' }} />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: isMember ? '#15803d' : '#1d4ed8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    {isMember ? '★ OFFICIAL CLUB MEMBER PRIVILEGE APPLIED' : 'GENERAL CAMPUS STUDENT PRICING'}
                  </span>
                  {isMember && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#22c55e',
                        color: 'white',
                      }}
                    >
                      SAVING UP TO 40%
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: '#334155', marginTop: '2px' }}>
                  {isMember
                    ? 'Your verified club membership grants exclusive subsidized rates on all official Odoo merchandise.'
                    : 'Standard student pricing. Join the club charter to unlock member discounts on all apparel and merchandise.'}
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '14px',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search merchandise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 12px 8px 32px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                    background: 'white',
                    width: '180px',
                  }}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px' }}>
              <Loader2 style={{ width: '32px', height: '32px', color: '#4338ca', animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>Loading merchandise catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <Package style={{ width: '40px', height: '40px', color: '#94a3b8', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>No merchandise found</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Try adjusting your search query or category filters.</p>
            </div>
          ) : (
            /* Product Grid */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {filteredProducts.map((product) => {
                const variants = product.variants || [];
                const currentSelectedSize = selectedVariants[product.id] || (variants[0]?.size ?? 'Standard');
                const selectedVariantObj = variants.find((v) => v.size === currentSelectedSize) || variants[0];
                const onHandStock = selectedVariantObj?.onHandStock ?? product.totalStock ?? 0;
                const isOutOfStock = onHandStock <= 0;
                const isLowStock = !isOutOfStock && onHandStock <= product.lowStockThreshold;

                const displayPrice = isMember ? product.memberPrice : product.sellingPrice;
                const savings = Math.max(0, product.sellingPrice - product.memberPrice);

                return (
                  <div
                    key={product.id}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                  >
                    {/* Product Image Header with Badges */}
                    <div style={{ position: 'relative', height: '220px', background: '#f8fafc', overflow: 'hidden' }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: '16px',
                          transition: 'transform 0.3s',
                        }}
                      />

                      {/* Stock Badge */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        {isOutOfStock ? (
                          <span
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '4px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            SOLD OUT
                          </span>
                        ) : isLowStock ? (
                          <span
                            style={{
                              background: '#f59e0b',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '4px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            LOW STOCK ({onHandStock} LEFT)
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#10b981',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '4px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            IN STOCK ({onHandStock})
                          </span>
                        )}
                      </div>

                      {/* Category Tag */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(15, 23, 42, 0.75)',
                          backdropFilter: 'blur(4px)',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {product.category}
                      </span>
                    </div>

                    {/* Product Body */}
                    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.4px' }}>
                          {product.sku}
                        </div>
                        <h3
                          style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#1e293b',
                            margin: '4px 0 6px 0',
                            lineHeight: 1.3,
                          }}
                        >
                          {product.name}
                        </h3>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#64748b',
                            margin: 0,
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {product.description}
                        </p>
                      </div>

                      {/* Size / Variant Specification Selector */}
                      {variants.length > 0 && (
                        <div>
                          <div
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#475569',
                              marginBottom: '6px',
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>SELECT SPECIFICATION / SIZE:</span>
                            <span style={{ color: '#059669', fontWeight: 800 }}>{selectedVariantObj?.onHandStock || 0} in stock</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {variants.map((v) => {
                              const isSelected = v.size === currentSelectedSize;
                              const variantOutOfStock = v.onHandStock <= 0;
                              return (
                                <button
                                  key={v.size}
                                  type="button"
                                  disabled={variantOutOfStock}
                                  onClick={() => handleSelectSize(product.id, v.size)}
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    border: isSelected ? '2px solid #4338ca' : '1px solid #cbd5e1',
                                    background: isSelected ? '#eef2ff' : variantOutOfStock ? '#f1f5f9' : 'white',
                                    color: isSelected ? '#3730a3' : variantOutOfStock ? '#94a3b8' : '#334155',
                                    fontSize: '11px',
                                    fontWeight: isSelected ? 800 : 600,
                                    cursor: variantOutOfStock ? 'not-allowed' : 'pointer',
                                    opacity: variantOutOfStock ? 0.6 : 1,
                                    textDecoration: variantOutOfStock ? 'line-through' : 'none',
                                  }}
                                >
                                  {v.size} ({v.onHandStock})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Price Section */}
                      <div
                        style={{
                          marginTop: 'auto',
                          paddingTop: '12px',
                          borderTop: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
                              ₹{displayPrice.toLocaleString()}
                            </span>
                            {isMember && (
                              <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>
                                ₹{product.sellingPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {isMember && savings > 0 ? (
                            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 700 }}>
                              You save ₹{savings} with membership!
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              Member price: ₹{product.memberPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Buy Now Button or Stock Indicator for President */}
                        {isPresident ? (
                          <div
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              background: isOutOfStock ? '#fef2f2' : '#f0fdf4',
                              color: isOutOfStock ? '#b91c1c' : '#15803d',
                              fontSize: '12px',
                              fontWeight: 800,
                              border: isOutOfStock ? '1px solid #fecaca' : '1px solid #bbf7d0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Package style={{ width: '14px', height: '14px' }} />
                            {isOutOfStock ? 'Sold Out' : `${onHandStock} In Stock`}
                          </div>
                        ) : (
                          <button
                            disabled={isOutOfStock}
                            onClick={() => handleInitiateOrder(product)}
                            style={{
                              padding: '9px 18px',
                              borderRadius: '10px',
                              border: 'none',
                              background: isOutOfStock ? '#e2e8f0' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                              color: isOutOfStock ? '#94a3b8' : 'white',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: isOutOfStock ? 'none' : '0 2px 4px rgba(79, 70, 229, 0.25)',
                              transition: 'all 0.2s',
                            }}
                          >
                            <ShoppingBag style={{ width: '14px', height: '14px' }} />
                            {isOutOfStock ? 'Sold Out' : 'Buy Now'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MY ORDERS & DIGITAL PICKUP PASSES ───────────── */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                {isPresident ? 'All Student Merchandise Orders Received' : 'My Merchandise Orders & Pickup Passes'}
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                {isPresident
                  ? 'Real-time record of merchandise orders placed by campus students and club members.'
                  : 'Present the digital QR pass or 6-digit order OTP at the club executive desk during campus hours to claim your merchandise.'}
              </p>
            </div>
            <button
              onClick={() => {
                loadOrders();
                if (isPresident) loadAnalytics();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: 'white',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              Refresh
            </button>
          </div>

          {(() => {
            const displayOrders = (isPresident && analytics?.recentOrders && analytics.recentOrders.length > 0)
              ? analytics.recentOrders
              : orders;

            if (displayOrders.length === 0) {
              return (
                <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <Package style={{ width: '40px', height: '40px', color: '#94a3b8', margin: '0 auto 12px auto' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                    {isPresident ? 'No student orders received yet' : 'No orders placed yet'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    {isPresident
                      ? 'Student orders placed online will appear here with pickup passes and revenue records.'
                      : 'Browse our official Odoo merchandise store and order with member discounts.'}
                  </p>
                  {!isPresident && (
                    <button
                      onClick={() => setActiveTab('store')}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '8px',
                        background: '#4338ca',
                        color: 'white',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Go to Merchandise Shop
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {displayOrders.map((o) => {
                  const isFulfilled = o.fulfillmentStatus === 'COMPLETED';
                  return (
                    <div
                      key={o.id}
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        padding: '18px 22px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            background: isFulfilled ? '#dcfce7' : '#e0e7ff',
                            color: isFulfilled ? '#15803d' : '#4338ca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <ShoppingBag style={{ width: '24px', height: '24px' }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>
                              {o.productName}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                background: '#f1f5f9',
                                color: '#475569',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              Size: {o.variantSize}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                background: isFulfilled ? '#ecfdf5' : '#eff6ff',
                                color: isFulfilled ? '#065f46' : '#1e40af',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              {isFulfilled ? 'HANDED OVER' : 'READY FOR PICKUP'}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            Order #{o.orderNumber} • Placed on {new Date(o.createdAt).toLocaleDateString()} • Qty: {o.quantity}
                            {isPresident && o.studentName && (
                              <span style={{ marginLeft: '10px', color: '#4338ca', fontWeight: 700 }}>
                                • Student: {o.studentName} ({o.studentEmail})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                            ₹{o.orderTotal.toLocaleString()}
                          </div>
                          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                            Paid via {o.paymentStatus}
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedViewOrder(o)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid #4338ca',
                            background: '#eef2ff',
                            color: '#4338ca',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <QrCode style={{ width: '14px', height: '14px' }} />
                          View Pickup Pass
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── TAB 3: MERCHANDISE ANALYTICS & FINANCE RECORD ──────── */}
      {activeTab === 'analytics' && isCampusLeadOrAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Refresh */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Campus Merchandise Financial Analytics & Insights
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                Comparison of Member vs Non-Member purchase volume, revenue velocity, total discount savings, and stock
                inventory ledger.
              </p>
            </div>
            <button
              onClick={loadAnalytics}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: 'white',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              Refresh Analytics
            </button>
          </div>

          {/* Top Metric KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Total Revenue */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>TOTAL MERCH REVENUE</span>
                <DollarSign style={{ width: '18px', height: '18px', color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginTop: '8px' }}>
                ₹{(analytics?.overview?.totalRevenue || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                {analytics?.overview?.totalOrders || 0} orders processed
              </div>
            </div>

            {/* Member vs Non-Member Split */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>MEMBER ORDER SHARE</span>
                <Users style={{ width: '18px', height: '18px', color: '#6366f1' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginTop: '8px' }}>
                {analytics?.overview?.memberOrderPercent || 0}%
              </div>
              <div style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 600, marginTop: '4px' }}>
                {analytics?.overview?.memberOrdersCount || 0} Member vs {analytics?.overview?.nonMemberOrdersCount || 0} Regular
              </div>
            </div>

            {/* Member Discount Savings */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>MEMBER SAVINGS</span>
                <Sparkles style={{ width: '18px', height: '18px', color: '#eab308' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginTop: '8px' }}>
                ₹{(analytics?.overview?.totalDiscountSavings || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: '#ca8a04', fontWeight: 600, marginTop: '4px' }}>
                Subsidized through club treasury
              </div>
            </div>

            {/* Total Stock On-Hand */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>STOCK VALUATION</span>
                <Package style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginTop: '8px' }}>
                ₹{(analytics?.overview?.totalStockValuation || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600, marginTop: '4px' }}>
                {analytics?.overview?.totalStockCount || 0} units across all variants
              </div>
            </div>
          </div>

          {/* ── TWO-COLUMN ANALYSIS: TREND & MEMBER VS NON-MEMBER ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* 1. Member vs Non-Member Deep Dive Comparison */}
            <div
              style={{
                background: 'white',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#e0e7ff',
                    color: '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BarChart3 style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    Member vs. Non-Member Purchase Split
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Order volume & revenue comparison</span>
                </div>
              </div>

              {/* Progress Bar 1: Orders Split */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#15803d' }}>
                    Member Orders: {analytics?.overview?.memberOrdersCount || 0} ({analytics?.overview?.memberOrderPercent || 0}%)
                  </span>
                  <span style={{ fontWeight: 600, color: '#475569' }}>
                    Non-Member: {analytics?.overview?.nonMemberOrdersCount || 0} ({100 - (analytics?.overview?.memberOrderPercent || 0)}%)
                  </span>
                </div>
                <div style={{ height: '10px', borderRadius: '5px', background: '#e2e8f0', overflow: 'hidden', display: 'flex' }}>
                  <div
                    style={{
                      width: `${analytics?.overview?.memberOrderPercent || 0}%`,
                      background: '#22c55e',
                      transition: 'width 0.5s',
                    }}
                  />
                  <div
                    style={{
                      width: `${100 - (analytics?.overview?.memberOrderPercent || 0)}%`,
                      background: '#94a3b8',
                      transition: 'width 0.5s',
                    }}
                  />
                </div>
              </div>

              {/* Progress Bar 2: Revenue Split */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#15803d' }}>
                    Member Revenue: ₹{(analytics?.overview?.memberRevenue || 0).toLocaleString()} (
                    {analytics?.overview?.memberRevenuePercent || 0}%)
                  </span>
                  <span style={{ fontWeight: 600, color: '#475569' }}>
                    Non-Member: ₹{(analytics?.overview?.nonMemberRevenue || 0).toLocaleString()} (
                    {100 - (analytics?.overview?.memberRevenuePercent || 0)}%)
                  </span>
                </div>
                <div style={{ height: '10px', borderRadius: '5px', background: '#e2e8f0', overflow: 'hidden', display: 'flex' }}>
                  <div
                    style={{
                      width: `${analytics?.overview?.memberRevenuePercent || 0}%`,
                      background: '#10b981',
                      transition: 'width 0.5s',
                    }}
                  />
                  <div
                    style={{
                      width: `${100 - (analytics?.overview?.memberRevenuePercent || 0)}%`,
                      background: '#64748b',
                      transition: 'width 0.5s',
                    }}
                  />
                </div>
              </div>

              {/* Average Order Value (AOV) Comparison */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  background: '#f8fafc',
                  padding: '14px',
                  borderRadius: '10px',
                  marginTop: '4px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>MEMBER AVERAGE ORDER</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                    ₹{(analytics?.overview?.memberAOV || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>NON-MEMBER AVERAGE ORDER</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#475569', marginTop: '2px' }}>
                    ₹{(analytics?.overview?.nonMemberAOV || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Purchase Trend Timeline */}
            <div
              style={{
                background: 'white',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#fef3c7',
                    color: '#b45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    Merchandise Sales Trend
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Daily transaction volume and revenue</span>
                </div>
              </div>

              {/* Trend List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {(analytics?.trend || []).length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px 0' }}>
                    No purchase trend data yet.
                  </div>
                ) : (
                  analytics?.trend.map((t) => (
                    <div
                      key={t.date}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{t.date}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{t.orders} orders placed</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>
                          ₹{t.revenue.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10px', color: '#15803d', fontWeight: 600 }}>
                          ₹{t.memberRevenue.toLocaleString()} from members
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── 3. INVENTORY SPECIFICATIONS & STOCK LEDGER ───────── */}
          <div
            style={{
              background: 'white',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Inventory Specifications & Stock Depletion
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                Stock specifications assigned per variant size, re-order thresholds, and active valuation.
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>PRODUCT NAME & CATEGORY</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>PRICING (REG / MEMBER)</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>VARIANTS & STOCK</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>SOLD</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>VALUATION</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.productStats || []).map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{p.category}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>₹{p.sellingPrice}</span> /{' '}
                        <span style={{ color: '#15803d', fontWeight: 700 }}>₹{p.memberPrice}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(p.variants || []).map((v) => (
                            <span
                              key={v.size}
                              style={{
                                background: '#f1f5f9',
                                color: '#334155',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                              }}
                            >
                              {v.size}: <b>{v.onHandStock}</b>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1e293b' }}>
                        {p.soldStock} units
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1e293b' }}>
                        ₹{p.stockValuation.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {p.isLowStock ? (
                          <span
                            style={{
                              background: '#fef3c7',
                              color: '#b45309',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            LOW STOCK
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#ecfdf5',
                              color: '#065f46',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            HEALTHY
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 4. MERCHANDISE FINANCE RECORD LEDGER ─────────────── */}
          <div
            style={{
              background: 'white',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Merchandise Finance Records & Fulfillment Desk
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                Real-time purchase transactions recorded in treasury with pickup fulfillment status.
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>ORDER # & DATE</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>STUDENT</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>ITEM & SIZE</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>AMOUNT</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>TYPE</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>FULFILLMENT</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.recentOrders || []).map((o) => {
                    const isFulfilled = o.fulfillmentStatus === 'COMPLETED';
                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{o.orderNumber}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{o.studentName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{o.studentEmail}</div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{o.productName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Size: {o.variantSize} (Qty: {o.quantity})
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ fontWeight: 800, color: '#1e293b' }}>₹{o.orderTotal}</span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {o.isMemberPurchase ? (
                            <span
                              style={{
                                background: '#dcfce7',
                                color: '#15803d',
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              MEMBER (Saved ₹{o.discountSaved})
                            </span>
                          ) : (
                            <span
                              style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              REGULAR STUDENT
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              background: isFulfilled ? '#ecfdf5' : '#fef3c7',
                              color: isFulfilled ? '#065f46' : '#b45309',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            {isFulfilled ? 'HANDED OVER' : 'READY FOR PICKUP'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <button
                            onClick={() => handleFulfillOrder(o.id, o.fulfillmentStatus)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: isFulfilled ? '1px solid #cbd5e1' : '1px solid #10b981',
                              background: isFulfilled ? '#f8fafc' : '#10b981',
                              color: isFulfilled ? '#475569' : 'white',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {isFulfilled ? 'Mark Pending' : 'Mark Handed Over'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* ── TAB 5: BAKE SALE FUNDRAISER TASKS ──────────────────── */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Charity Bake Sale Task Delegation Board
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                Volunteer squad assignments for baking, ingredient sourcing, stall setup, and cash collection.
              </p>
            </div>
            {isCampusLeadOrAdmin && (
              <button
                onClick={() => setShowTaskModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: '#4338ca',
                  color: 'white',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Assign Task
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {fundraiserTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: '#f1f5f9',
                      color: '#475569',
                    }}
                  >
                    {task.category}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: task.status === 'DONE' ? '#ecfdf5' : '#eff6ff',
                      color: task.status === 'DONE' ? '#065f46' : '#1e40af',
                    }}
                  >
                    {task.status}
                  </span>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  {task.title}
                </h4>

                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Assignee: <b>{task.assignee}</b> • Due: {task.dueDate}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => updateTaskStatus(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')}
                    style={{
                      width: '100%',
                      padding: '7px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: task.status === 'DONE' ? '#f8fafc' : '#10b981',
                      color: task.status === 'DONE' ? '#475569' : 'white',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {task.status === 'DONE' ? 'Reopen Task' : 'Mark Completed'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL 1: CAMPUS LEAD CREATE MERCHANDISE PRODUCT ────── */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Create Merchandise Product & Assign Stock
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Assign product specifications, sizes, SKU codes, and initial on-hand stock counts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Quick Presets for Odoo Goodies */}
            <div style={{ padding: '14px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                QUICK AUTOFILL ODOO GOODIES PRESETS:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {ODOO_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: 'white',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    + {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProductSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Product Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Odoo Signature Low-Top Sneakers"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Category & SKU */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      background: 'white',
                    }}
                  >
                    <option value="Apparel & Uniforms">Apparel & Uniforms</option>
                    <option value="Drinkware & Goodies">Drinkware & Goodies</option>
                    <option value="Footwear & Lifestyle">Footwear & Lifestyle</option>
                    <option value="Educational & Board Games">Educational & Board Games</option>
                    <option value="Stationery & Stickers">Stationery & Stickers</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    SKU Code Prefix
                  </label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Product Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter fabric specifications, dimensions, materials, care instructions..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Image URL */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Pricing Specification */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Standard Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={productForm.sellingPrice}
                    onChange={(e) => setProductForm({ ...productForm, sellingPrice: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#15803d', marginBottom: '6px' }}>
                    Member Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={productForm.memberPrice}
                    onChange={(e) => setProductForm({ ...productForm, memberPrice: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #86efac',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                    Cost / Production (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Stock Specifications & Variants Table */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                      Size Specifications & Stock Allocation
                    </span>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Assign sizes (e.g. S, M, L, XL or Standard) and physical units on-hand.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #4338ca',
                      background: '#eef2ff',
                      color: '#4338ca',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus style={{ width: '12px', height: '12px' }} />
                    + Add Size / Variant
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {productForm.variants.map((v, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Size / Dimension"
                        value={v.size}
                        onChange={(e) => handleVariantStockChange(idx, 'size', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                        }}
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="On-Hand Stock"
                        value={v.onHandStock}
                        onChange={(e) => handleVariantStockChange(idx, 'onHandStock', e.target.value)}
                        style={{
                          width: '120px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                        }}
                      />
                      {productForm.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '6px',
                          }}
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10b981',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isSubmittingProduct ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : null}
                  Save & Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: DIGITAL PICKUP PASS & QR CODE (AFTER ORDER OR VIEW) ── */}
      {(confirmedOrder || selectedViewOrder) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => {
                setConfirmedOrder(null);
                setSelectedViewOrder(null);
              }}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>

            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <CheckCircle2 style={{ width: '32px', height: '32px' }} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
              Official Merchandise Pickup Pass
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
              Present this verified digital QR pass at the club executive desk for instant handover.
            </p>

            {/* Scannable RealQrCode */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                display: 'inline-block',
                margin: '0 auto',
              }}
            >
              <RealQrCode
                value={
                  confirmedOrder?.pickupQr ||
                  selectedViewOrder?.pickupPassQr ||
                  JSON.stringify({
                    orderId: selectedViewOrder?.id,
                    orderNumber: selectedViewOrder?.orderNumber,
                    studentEmail: selectedViewOrder?.studentEmail,
                  })
                }
                size={180}
              />
            </div>

            {/* Order Details Breakdown */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '20px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Order Number:</span>
                <span style={{ fontWeight: 800, color: '#1e293b' }}>
                  {confirmedOrder?.order.orderNumber || selectedViewOrder?.orderNumber}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Product & Size:</span>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>
                  {confirmedOrder?.order.productName || selectedViewOrder?.productName} (
                  {confirmedOrder?.order.variantSize || selectedViewOrder?.variantSize})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Paid Amount:</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>
                  ₹{(confirmedOrder?.order.orderTotal || selectedViewOrder?.orderTotal || 0).toLocaleString()}
                </span>
              </div>
              {confirmedOrder?.discountClaimed ? (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#15803d' }}>Member Savings:</span>
                  <span style={{ fontWeight: 800, color: '#15803d' }}>
                    -₹{confirmedOrder.discountClaimed.toLocaleString()}
                  </span>
                </div>
              ) : null}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <span style={{ fontWeight: 700, color: '#4338ca' }}>
                  {confirmedOrder?.order.fulfillmentStatus || selectedViewOrder?.fulfillmentStatus || 'READY_FOR_PICKUP'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setConfirmedOrder(null);
                setSelectedViewOrder(null);
              }}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '12px',
                borderRadius: '10px',
                background: '#4338ca',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Done & Return to Store
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 3: INSTANT BUY NOW MODAL (NO RAZORPAY NEEDED) ───────────────────────────── */}
      {isPaymentModalOpen && checkoutProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '26px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Buy Merchandise
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Instant campus order & digital pickup pass
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setCheckoutProduct(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Product Summary Card */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                padding: '14px',
                background: '#f8fafc',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                marginBottom: '18px',
              }}
            >
              <img
                src={checkoutProduct.product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300'}
                alt={checkoutProduct.product.name}
                style={{ width: '68px', height: '68px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>
                  {checkoutProduct.product.category}
                </span>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: '2px 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {checkoutProduct.product.name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <span style={{ fontWeight: 600 }}>Size: {checkoutProduct.size}</span>
                  <span>•</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{checkoutProduct.unitPrice} each</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                  SELECT QUANTITY:
                </label>
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                  In Stock
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (checkoutProduct.quantity > 1) {
                        setCheckoutProduct({ ...checkoutProduct, quantity: checkoutProduct.quantity - 1 });
                      }
                    }}
                    disabled={checkoutProduct.quantity <= 1}
                    style={{
                      width: '36px',
                      height: '36px',
                      background: '#f8fafc',
                      border: 'none',
                      color: checkoutProduct.quantity <= 1 ? '#cbd5e1' : '#1e293b',
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: checkoutProduct.quantity <= 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    -
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    {checkoutProduct.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutProduct({ ...checkoutProduct, quantity: checkoutProduct.quantity + 1 });
                    }}
                    style={{
                      width: '36px',
                      height: '36px',
                      background: '#f8fafc',
                      border: 'none',
                      color: '#1e293b',
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Total Units: <strong>{checkoutProduct.quantity}</strong>
                </span>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '14px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Unit Price</span>
                <span>₹{checkoutProduct.unitPrice}</span>
              </div>
              {isMember && checkoutProduct.product.sellingPrice > checkoutProduct.unitPrice && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                  <span>Member Discount Saved</span>
                  <span>-₹{(checkoutProduct.product.sellingPrice - checkoutProduct.unitPrice) * checkoutProduct.quantity}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Pickup Station</span>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>Campus Student Association Desk</span>
              </div>
              <div
                style={{
                  height: '1px',
                  background: '#e2e8f0',
                  margin: '4px 0',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Total Amount</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#4f46e5' }}>
                  ₹{(checkoutProduct.unitPrice * checkoutProduct.quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setCheckoutProduct(null);
                }}
                disabled={isPlacingOrder}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isPlacingOrder ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isPlacingOrder}
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isPlacingOrder ? '#818cf8' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: isPlacingOrder ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
                }}
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShoppingBag style={{ width: '16px', height: '16px' }} />
                    Buy Now • ₹{(checkoutProduct.unitPrice * checkoutProduct.quantity).toLocaleString()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: FUNDRAISER TASK MODAL ──────────────────────── */}
      {showTaskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Assign Fundraiser / Bake Sale Task
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prepare 40 Red Velvet cupcakes"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Assignee
                </label>
                <input
                  type="text"
                  required
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#4338ca',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
