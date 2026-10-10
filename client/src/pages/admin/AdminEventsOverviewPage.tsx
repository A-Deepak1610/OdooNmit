import React, { useState } from 'react';
import {
  Calendar,
  Search,
  MapPin,
} from 'lucide-react';

interface CampusEvent {
  id: string;
  title: string;
  club: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  sold: number;
  checkedIn: number;
  revenue: number;
  status: 'Active' | 'Upcoming' | 'Completed';
}

const ALL_CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: 'EVT-001',
    title: 'Skyline Annual Spring Gala 2026',
    club: 'Skyline Student Association',
    date: 'April 24, 2026',
    time: '6:30 PM - 10:30 PM',
    location: 'Grand Auditorium',
    capacity: 500,
    sold: 420,
    checkedIn: 385,
    revenue: 58500,
    status: 'Upcoming',
  },
  {
    id: 'EVT-002',
    title: 'HackNMIT 36-Hour National Hackathon',
    club: 'Coding Club',
    date: 'October 15, 2026',
    time: '9:00 AM Onwards',
    location: 'Innovation Lab Complex',
    capacity: 350,
    sold: 350,
    checkedIn: 338,
    revenue: 140000,
    status: 'Active',
  },
  {
    id: 'EVT-003',
    title: 'Robotics Combat Arena 2026',
    club: 'Robotics Society',
    date: 'November 5, 2026',
    time: '11:00 AM - 5:00 PM',
    location: 'Indoor Stadium',
    capacity: 250,
    sold: 210,
    checkedIn: 192,
    revenue: 63000,
    status: 'Upcoming',
  },
  {
    id: 'EVT-004',
    title: 'Spring Charity Bake Sale & Fundraiser',
    club: 'Skyline Student Association',
    date: 'May 2, 2026',
    time: '10:00 AM - 4:00 PM',
    location: 'Student Union Quad',
    capacity: 300,
    sold: 180,
    checkedIn: 154,
    revenue: 14200,
    status: 'Completed',
  },
];

export const AdminEventsOverviewPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredEvents = ALL_CAMPUS_EVENTS.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.club.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── 1. Page Header ── */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
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
                color: '#2563eb',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              Event Oversight
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Campus-wide Quotas & Attendance
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Events Overview & Door Check-ins
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Monitor real-time ticket sales velocity, venue capacity limits, and door scan check-in ratios.
          </p>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search
              size={15}
              color="#94a3b8"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search event or club..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '34px',
                paddingRight: '12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                background: '#f8fafc',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              height: '38px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              background: '#f8fafc',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses ({ALL_CAMPUS_EVENTS.length})</option>
            <option value="Active">Active Now</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* ── 2. Events Cards Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredEvents.map((evt) => {
          const fillPct = Math.round((evt.sold / evt.capacity) * 100);
          const checkInPct = evt.sold > 0 ? Math.round((evt.checkedIn / evt.sold) * 100) : 0;
          const statusBg = evt.status === 'Active' ? '#dcfce7' : evt.status === 'Upcoming' ? '#eff6ff' : '#f1f5f9';
          const statusColor = evt.status === 'Active' ? '#15803d' : evt.status === 'Upcoming' ? '#1d4ed8' : '#475569';

          return (
            <div
              key={evt.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span
                    style={{
                      background: statusBg,
                      color: statusColor,
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {evt.status}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>
                    ₹{evt.revenue.toLocaleString('en-IN')}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
                  {evt.title}
                </h3>
                <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, marginBottom: '12px' }}>
                  {evt.club}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#94a3b8" />
                    <span>{evt.date} • {evt.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="#94a3b8" />
                    <span>{evt.location}</span>
                  </div>
                </div>

                {/* Progress Bar (Sold vs Capacity) */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Tickets Issued</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      {evt.sold} / {evt.capacity} ({fillPct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${fillPct}%`,
                        height: '100%',
                        background: fillPct >= 95 ? '#ef4444' : '#2563eb',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Footer Info */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: '#94a3b8',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '12px',
                }}
              >
                <span>Door Check-ins: <strong style={{ color: '#1e293b' }}>{evt.checkedIn} ({checkInPct}%)</strong></span>
                <span style={{ color: '#2563eb', fontWeight: 600 }}>Inspect Station →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
