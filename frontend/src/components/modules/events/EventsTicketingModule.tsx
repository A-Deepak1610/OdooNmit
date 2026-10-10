import React, { useState } from 'react';
import {
  Calendar,
  Ticket,
  Users,
  CheckCircle2,
  Clock,
  QrCode,
  Search,
} from 'lucide-react';
import { mockEvents, mockDoorTickets } from '../../../data/mockClubData';

export const EventsTicketingModule: React.FC = () => {
  const [tickets, setTickets] = useState(mockDoorTickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'checkin' | 'analytics'>('overview');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const springGala = mockEvents[0];

  const handleCheckIn = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              checkedIn: true,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : t
      )
    );
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.attendee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-body)' }}>
      {/* Module Title Header Card */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                color: '#1e3a8a',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '11px',
                textTransform: 'uppercase',
              }}
            >
              Dev 1 Workstream
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Problem Statement Scene:</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>"Selling tickets for the spring gala"</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '4px 0 2px 0' }}>
            Events & Online Ticketing Platform
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Differential tier pricing (members vs non-members), live seat capacity, and instant door QR check-in.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--muted)', padding: '4px', borderRadius: '8px' }}>
          {(['overview', 'checkin', 'analytics'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const labels = { overview: 'Gala Tiers', checkin: 'Door Check-in', analytics: 'Turnout Analytics' };
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
                  fontWeight: isActive ? 600 : 500,
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

      {bookingSuccess && (
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
            <span>{bookingSuccess}</span>
          </div>
          <button
            onClick={() => setBookingSuccess(null)}
            style={{ background: 'none', border: 'none', color: '#065f46', fontWeight: 700, cursor: 'pointer' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: GALA OVERVIEW & TIERS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Main Gala Card */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '11px' }}>
                  FLAGSHIP ANNUAL EVENT
                </span>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: '8px 0 4px 0' }}>
                  {springGala.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Main campus gala with music, dinner, and student achievements.
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Total Ticket Revenue</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>₹{springGala.revenue.toLocaleString()}</span>
              </div>
            </div>

            {/* Event Meta Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'var(--muted)', padding: '12px', borderRadius: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <Calendar style={{ width: '16px', height: '16px', color: '#1e3a8a' }} />
                <span>{springGala.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <Clock style={{ width: '16px', height: '16px', color: '#1e3a8a' }} />
                <span>{springGala.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <Users style={{ width: '16px', height: '16px', color: '#1e3a8a' }} />
                <span>{springGala.location}</span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>Seat Capacity Quota</span>
                <span style={{ color: '#1e3a8a', fontWeight: 600 }}>{springGala.soldCount} / {springGala.capacity} Seats Claimed (84%)</span>
              </div>
              <div style={{ height: '6px', background: 'var(--secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(springGala.soldCount / springGala.capacity) * 100}%`, background: 'var(--primary)', borderRadius: '3px' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Only 80 tickets remaining before registration closes.</span>
            </div>

            {/* Tiers List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>
                Differential Ticket Tiers (Member Discount Engine)
              </h4>
              {springGala.tiers.map((tier, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'white',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{tier.name}</span>
                      <span style={{ fontSize: '11px', color: '#15803d', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        {tier.available} left of {tier.total}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Includes catered dinner, pass & gala voting rights</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#15803d' }}>
                        Member: ₹{tier.memberPrice}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>
                        Non-Member: ₹{tier.nonMemberPrice}
                      </div>
                    </div>

                    <button
                      onClick={() => setBookingSuccess(`Booked ${tier.name} at member rate ₹${tier.memberPrice}!`)}
                      style={{
                        background: '#1e3a8a',
                        color: 'white',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Book Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Card: Digital Ticket Preview */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Ticket style={{ width: '16px', height: '16px' }} />
                  Digital QR Pass
                </span>
                <span style={{ color: '#15803d', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                  Active
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Attendee</span>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Deepak Kumar</div>
                <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 500 }}>Club Member Pass (₹100)</div>
              </div>

              {/* QR Box */}
              <div style={{ padding: '16px', background: 'var(--muted)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <QrCode style={{ width: '110px', height: '110px', margin: '0 auto', color: '#1e293b' }} />
                <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#64748b', marginTop: '8px' }}>
                  SSA-GALA-2026-9812
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  Scan at entrance for door verification
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', paddingTop: '10px' }}>
              Skyline Student Association • Academic Term 2025-26
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOOR CHECK-IN */}
      {activeTab === 'checkin' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                Entrance Check-in Desk (Zero Paper Lists)
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                Verify attendee name or pass ID to admit guests in seconds.
              </p>
            </div>

            <div style={{ position: 'relative', width: '260px' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search attendee or Ticket ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', height: '36px', paddingLeft: '32px', paddingRight: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
              />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Ticket ID</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Attendee</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Tier</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Membership</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', color: '#64748b' }}>{t.id}</td>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>{t.attendee}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{t.tier}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: t.isMember ? '#15803d' : '#475569', background: t.isMember ? '#dcfce7' : '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                      {t.isMember ? 'Active Member' : 'Non-Member'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {t.checkedIn ? (
                      <span style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                        Admitted ({t.time})
                      </span>
                    ) : (
                      <span style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <Clock style={{ width: '14px', height: '14px' }} />
                        Not Arrived
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {t.checkedIn ? (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>Verified</span>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(t.id)}
                        style={{ background: '#1e3a8a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Check In
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Turnout Rate</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '4px 0' }}>385 / 420 (91.6%)</div>
            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 500 }}>+14% turnout vs last semester</span>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Total Ticket Revenue</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '4px 0' }}>₹58,500</div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Avg ₹139.2 per registered attendee</span>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Estimated Net Balance</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#15803d', margin: '4px 0' }}>₹26,500</div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>After auditorium & catering costs</span>
          </div>
        </div>
      )}
    </div>
  );
};
