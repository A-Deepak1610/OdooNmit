import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  QrCode,
  Calendar,
  MapPin,
  CheckCircle2,
  Download,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useClubStore } from '../../../stores/club.store';
import { useAuthStore } from '../../../stores/auth.store';

export const StudentTicketsModule: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { doorTickets, events } = useClubStore();
  const [search, setSearch] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(doorTickets[0]?.id || null);

  const filteredTickets = doorTickets.filter(
    (t) =>
      t.attendee.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.tier.toLowerCase().includes(search.toLowerCase())
  );

  const activeTicket = doorTickets.find((t) => t.id === selectedTicketId) || doorTickets[0];
  const relatedEvent = events[0];

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
                color: '#2563eb',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              DIGITAL EVENT PASSES
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {doorTickets.length} Confirmed Passports
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            My Tickets & QR Confirmations
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0, maxWidth: '640px' }}>
            Access verified digital entrance passes with cryptographic QR tokens. Present these at the door for instant barcode scanning and admission verification.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/events')}
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
          <Ticket style={{ width: '16px', height: '16px' }} />
          <span>Book More Event Tickets</span>
        </button>
      </div>

      {/* ── 2. TWO-COLUMN LAYOUT: TICKET WALLET & ACTIVE QR DETAIL ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 420px)', gap: '20px' }}>
        {/* LEFT COLUMN: TICKET LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '15px',
                  height: '15px',
                  color: '#94a3b8',
                }}
              />
              <input
                type="text"
                placeholder="Search ticket ID or attendee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {filteredTickets.map((t) => {
            const isSelected = activeTicket?.id === t.id;

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  padding: '16px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: t.isMember ? '#dcfce7' : '#f1f5f9',
                        color: t.isMember ? '#15803d' : '#475569',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {t.tier} • {t.isMember ? 'Member Rate' : 'Standard'}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: t.checkedIn ? '#15803d' : '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                      {t.checkedIn ? 'Admitted at Door' : 'Confirmed'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                    {relatedEvent.title}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar style={{ width: '12px', height: '12px' }} />
                      {relatedEvent.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin style={{ width: '12px', height: '12px' }} />
                      {relatedEvent.location}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Ticket #</div>
                  <strong style={{ fontSize: '13px', color: '#1e293b' }}>{t.id}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: DIGITAL QR PASS DETAIL CARD */}
        {activeTicket && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* PASS HEADER */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
                padding: '20px',
                color: '#ffffff',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                OFFICIAL ENTRY ADMISSION PASS
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0' }}>
                {relatedEvent.title}
              </h3>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                {relatedEvent.date} • {relatedEvent.time || '6:30 PM IST'}
              </div>
            </div>

            {/* QR CODE DISPLAY */}
            <div
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                borderBottom: '2px dashed #e2e8f0',
              }}
            >
              <div
                style={{
                  background: '#f8fafc',
                  border: '2px solid #0f172a',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
              >
                <QrCode style={{ width: '140px', height: '140px', color: '#0f172a' }} />
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: '#1e3a8a',
                  }}
                >
                  QR-{activeTicket.id}-GATEPASS
                </span>
              </div>

              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: activeTicket.checkedIn ? '#15803d' : '#2563eb',
                    backgroundColor: activeTicket.checkedIn ? '#dcfce7' : '#eff6ff',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ShieldCheck style={{ width: '13px', height: '13px' }} />
                  {activeTicket.checkedIn
                    ? 'Admitted & Scanned at Door'
                    : 'Valid for Single Admission'}
                </span>
              </div>
            </div>

            {/* PASS METADATA */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Attendee Name:</span>
                <strong style={{ color: '#0f172a' }}>{activeTicket.attendee || user?.name || 'Deepak Kumar'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Pass Tier:</span>
                <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{activeTicket.tier}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Venue Location:</span>
                <span style={{ color: '#334155', fontWeight: 500 }}>{relatedEvent.location}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Ticket Reference:</span>
                <span style={{ fontFamily: 'monospace', color: '#475569' }}>{activeTicket.id}</span>
              </div>

              <button
                onClick={() => alert(`Saving offline ticket image pass for ${activeTicket.id}...`)}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#f1f5f9',
                  color: '#1e293b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Download style={{ width: '15px', height: '15px' }} />
                <span>Save Offline QR Pass</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
