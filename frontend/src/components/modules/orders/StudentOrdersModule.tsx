import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Receipt,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Package,
} from 'lucide-react';
import { useClubStore } from '../../../stores/club.store';

export const StudentOrdersModule: React.FC = () => {
  const navigate = useNavigate();
  const { orders, merchandise, paymentReceipts } = useClubStore();
  const [filterType, setFilterType] = useState<'ALL' | 'MERCH' | 'PAYMENTS'>('ALL');
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter((o) => {
    const item = merchandise.find((m) => m.id === o.itemId);
    return (
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (item && item.name.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const filteredReceipts = paymentReceipts.filter((r) => {
    return (
      r.paymentId.toLowerCase().includes(search.toLowerCase()) ||
      r.purpose.toLowerCase().includes(search.toLowerCase()) ||
      r.orderId.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-body)' }}>
      {/* ── 1. HEADER ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
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
              PURCHASE & PAYMENT LEDGER
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {orders.length} Merchandise Orders • {paymentReceipts.length} Verified Gateway Receipts
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Order & Payment Status
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0, maxWidth: '640px' }}>
            Inspect real-time order fulfillment status for official apparel, payment receipts, and cryptographically verified HMAC signatures.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/merchandise')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#1e3a8a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(30, 58, 138, 0.2)',
          }}
        >
          <ShoppingBag style={{ width: '16px', height: '16px' }} />
          <span>Shop Merchandise</span>
        </button>
      </div>

      {/* ── 2. FILTER & SEARCH ───────────────────────────────────── */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search order ID, receipt ID, purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'MERCH', label: `Merchandise Orders (${orders.length})` },
            { id: 'PAYMENTS', label: `Payment Receipts (${paymentReceipts.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: filterType === tab.id ? 700 : 500,
                cursor: 'pointer',
                backgroundColor: filterType === tab.id ? '#0f172a' : '#f1f5f9',
                color: filterType === tab.id ? '#ffffff' : '#64748b',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. MERCHANDISE ORDERS TABLE ──────────────────────────── */}
      {(filterType === 'ALL' || filterType === 'MERCH') && (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package style={{ width: '18px', height: '18px', color: '#1e3a8a' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Merchandise Fulfillment Orders
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {filteredOrders.length} Orders
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Order ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Item & Size</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Student</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Order Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Payment ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  const item = merchandise.find((m) => m.id === o.itemId);
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#1e3a8a' }}>
                        {o.id}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{item?.name || 'Club Item'}</span>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Size: {o.size}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        {o.studentName}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {o.orderDate}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: o.status === 'COLLECTED' ? '#dcfce7' : o.status === 'READY_FOR_PICKUP' ? '#eff6ff' : '#fef3c7',
                            color: o.status === 'COLLECTED' ? '#15803d' : o.status === 'READY_FOR_PICKUP' ? '#1e40af' : '#b45309',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {o.status === 'COLLECTED' ? (
                            <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                          ) : (
                            <Clock style={{ width: '12px', height: '12px' }} />
                          )}
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>
                        {o.paymentId}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 4. RAZORPAY PAYMENT RECEIPTS TABLE ─────────────────────── */}
      {(filterType === 'ALL' || filterType === 'PAYMENTS') && (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt style={{ width: '18px', height: '18px', color: '#15803d' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Cryptographic Payment Receipts & HMAC Verification
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {filteredReceipts.length} Verified Gateway Receipts
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Payment ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Purpose</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Amount</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Method</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Cryptographic HMAC</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((r) => (
                  <tr key={r.paymentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#1e3a8a' }}>
                      {r.paymentId}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 500 }}>
                      {r.purpose}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#15803d' }}>
                      ₹{r.amount}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: '#eff6ff',
                          color: '#1e40af',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {r.method}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>
                      {new Date(r.timestamp).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <ShieldCheck style={{ width: '12px', height: '12px', color: '#15803d' }} />
                        {r.signature.substring(0, 16)}...
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
