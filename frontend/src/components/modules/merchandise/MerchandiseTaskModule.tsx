import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  CreditCard,
} from 'lucide-react';
import { useClubStore } from '../../../stores/club.store';
import { useAuthStore } from '../../../stores/auth.store';
import { RazorpayPaymentModal } from '../../shared/RazorpayPaymentModal';
import { MockTask } from '../../../data/mockClubData';

export const MerchandiseTaskModule: React.FC = () => {
  const { user } = useAuthStore();
  const {
    merchandise,
    orders,
    fundraiserTasks,
    orderMerchandise,
    updateTaskStatus,
    addTask,
  } = useClubStore();

  const [activeTab, setActiveTab] = useState<'store' | 'orders' | 'tasks'>('store');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({
    'merch-hoodie': 'L',
    'merch-tee': 'M',
  });

  const [checkoutItem, setCheckoutItem] = useState<{
    id: string;
    name: string;
    size: string;
    price: number;
  } | null>(null);

  const [orderAlert, setOrderAlert] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Baking' as const,
    assignee: user?.name || 'Deepak Kumar',
    dueDate: 'May 2, 2026',
  });

  const handleSelectSize = (itemId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [itemId]: size }));
  };

  const handleTriggerCheckout = (itemId: string, itemName: string, price: number) => {
    const size = selectedSizes[itemId] || 'M';
    setCheckoutItem({
      id: itemId,
      name: itemName,
      size,
      price,
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assignee) return;

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
      dueDate: 'May 2, 2026',
    });
  };

  const completedCount = fundraiserTasks.filter((t) => t.status === 'DONE').length;
  const progressPercent = Math.round((completedCount / fundraiserTasks.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-body)' }}>
      {/* ── 1. MODULE HEADER ───────────────────────────────── */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#b45309',
                background: '#fef3c7',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              GOODIES & FUNDRAISING OPERATIONS
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Problem Scenes: "Ordering hoodies online & Planning bake sale fundraiser"
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: '2px 0 2px 0' }}>
            Club Merchandise Store & Fundraiser Coordination
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Online size collection and stock depletion with Razorpay payment, alongside volunteer task boards for charity bake sales.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--muted)', padding: '4px', borderRadius: '8px' }}>
          {(['store', 'orders', 'tasks'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const labels = {
              store: 'Merchandise Shop',
              orders: `My Orders (${orders.length})`,
              tasks: `Bake Sale Tasks (${progressPercent}%)`,
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--muted-foreground)',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {orderAlert && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
            <span>{orderAlert}</span>
          </div>
          <button
            onClick={() => setOrderAlert(null)}
            style={{ background: 'none', border: 'none', color: '#065f46', fontWeight: 700, cursor: 'pointer' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── TAB 1: MERCHANDISE SHOP ─────────────────────────── */}
      {activeTab === 'store' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {merchandise.map((item) => {
            const activeSize = selectedSizes[item.id] || 'M';
            const activeVariant = item.variants.find((v) => v.size === activeSize);
            const currentStock = activeVariant?.stock || 0;
            const isOutOfStock = currentStock <= 0;

            return (
              <div
                key={item.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#15803d',
                        background: '#dcfce7',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      Member Exclusive Discount
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '4px 0 2px 0' }}>
                      {item.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: '#15803d' }}>
                        ₹{item.memberPrice}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>
                        ₹{item.basePrice}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        (Save ₹{item.basePrice - item.memberPrice})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Size Variants Selector */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      Select Size:
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: currentStock <= 3 ? '#dc2626' : '#15803d',
                      }}
                    >
                      {isOutOfStock
                        ? 'Size Out of Stock'
                        : currentStock <= 3
                        ? `Only ${currentStock} left in stock!`
                        : `${currentStock} available in size ${activeSize}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {item.variants.map((v) => {
                      const isSelected = activeSize === v.size;
                      const hasStock = v.stock > 0;
                      return (
                        <button
                          key={v.size}
                          onClick={() => handleSelectSize(item.id, v.size)}
                          style={{
                            flex: 1,
                            padding: '8px 0',
                            borderRadius: '6px',
                            border: isSelected ? '2px solid #1e3a8a' : '1px solid #cbd5e1',
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#1e3a8a' : hasStock ? '#1e293b' : '#94a3b8',
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '13px',
                            cursor: 'pointer',
                            position: 'relative',
                          }}
                        >
                          {v.size}
                          {!hasStock && (
                            <span
                              style={{
                                display: 'block',
                                fontSize: '9px',
                                color: '#dc2626',
                                fontWeight: 700,
                              }}
                            >
                              0 left
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Checkout Action Button */}
                <button
                  onClick={() => handleTriggerCheckout(item.id, item.name, item.memberPrice)}
                  disabled={isOutOfStock}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isOutOfStock ? '#cbd5e1' : '#1e3a8a',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <CreditCard style={{ width: '16px', height: '16px' }} />
                  <span>
                    {isOutOfStock ? `Size ${activeSize} Sold Out` : `Order Size ${activeSize} (Pay via Razorpay)`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 2: MY ORDERS ─────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Order Records & Live Fulfillment Status
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Pickup at Student Union Room 204
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Order ID</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Item & Size</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Student</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Amount</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Razorpay Payment ID</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#1e3a8a' }}>
                      {ord.id}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>
                      {ord.itemName} (Size {ord.size})
                    </td>
                    <td style={{ padding: '12px', color: '#64748b' }}>
                      {ord.studentName}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#15803d' }}>
                      ₹{ord.price}
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>
                      {ord.paymentId}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          background: ord.status === 'READY_FOR_PICKUP' ? '#dcfce7' : '#eff6ff',
                          color: ord.status === 'READY_FOR_PICKUP' ? '#15803d' : '#1e3a8a',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {ord.status === 'READY_FOR_PICKUP' ? '✓ Ready for Pickup' : 'Processing Production'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: BAKE SALE FUNDRAISER TASKS ─────────────────── */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Progress Header Card */}
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Charity Bake Sale Fundraiser Task Board
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                Event Date: Saturday, May 2, 2026 • Goal: Raise ₹15,000 for club student emergency fund
              </p>
            </div>

            <button
              onClick={() => setShowTaskModal(true)}
              style={{
                padding: '8px 16px',
                background: '#1e3a8a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              <span>Assign Fundraiser Task</span>
            </button>
          </div>

          {/* Tasks Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {fundraiserTasks.map((t) => (
              <div
                key={t.id}
                style={{
                  background: 'white',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color:
                        t.category === 'Baking'
                          ? '#b45309'
                          : t.category === 'Supplies'
                          ? '#15803d'
                          : t.category === 'Table Shift'
                          ? '#1e3a8a'
                          : '#7c3aed',
                      background:
                        t.category === 'Baking'
                          ? '#fef3c7'
                          : t.category === 'Supplies'
                          ? '#dcfce7'
                          : t.category === 'Table Shift'
                          ? '#eff6ff'
                          : '#f3e8ff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {t.category}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Due: {t.dueDate}</span>
                </div>

                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                  {t.title}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Assigned: <strong>{t.assignee}</strong>
                  </span>

                  {/* Status Toggle Buttons */}
                  <select
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t.id, e.target.value as MockTask['status'])}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: '1px solid #cbd5e1',
                      background:
                        t.status === 'DONE'
                          ? '#dcfce7'
                          : t.status === 'IN_PROGRESS'
                          ? '#eff6ff'
                          : '#fef3c7',
                      color:
                        t.status === 'DONE'
                          ? '#15803d'
                          : t.status === 'IN_PROGRESS'
                          ? '#1e3a8a'
                          : '#b45309',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="TODO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="DONE">Done ✓</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '440px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1e293b' }}>
              Assign Bake Sale Fundraiser Task
            </h3>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Task Title & Instruction
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bake 40 lemon bars"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Duty Category
                </label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value as any })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="Baking">Baking Duty</option>
                  <option value="Supplies">Buying Supplies</option>
                  <option value="Table Shift">Table Staffing Shift</option>
                  <option value="Promotion">Promotion & Posters</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Assignee Volunteer
                </label>
                <input
                  type="text"
                  required
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Deadline
                </label>
                <input
                  type="text"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Merchandise Checkout Modal */}
      {checkoutItem && (
        <RazorpayPaymentModal
          isOpen={Boolean(checkoutItem)}
          onClose={() => setCheckoutItem(null)}
          title={`Order: ${checkoutItem.name}`}
          purpose={`${checkoutItem.name} (Size: ${checkoutItem.size})`}
          amount={checkoutItem.price}
          payerName={user?.name || 'Deepak Kumar'}
          payerEmail={user?.email || 'deepaka.ad24@bitsathy.ac.in'}
          onSuccess={(receipt) => {
            const order = orderMerchandise(
              checkoutItem.id,
              checkoutItem.size,
              user?.name || 'Deepak Kumar',
              user?.email || 'deepaka.ad24@bitsathy.ac.in',
              true,
              receipt
            );
            if (order) {
              setOrderAlert(
                `Order Placed! Order #${order.id} for ${checkoutItem.name} (Size: ${checkoutItem.size}). Paid ₹${checkoutItem.price} via Razorpay.`
              );
            }
            setCheckoutItem(null);
          }}
        />
      )}
    </div>
  );
};
