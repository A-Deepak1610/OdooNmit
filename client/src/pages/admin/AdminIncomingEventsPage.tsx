import React, { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  MapPin,
  Users,
} from 'lucide-react';

interface IncomingEvent {
  id: string;
  title: string;
  club: string;
  proposer: string;
  proposedDate: string;
  venue: string;
  expectedAttendance: number;
  budgetRequested: string;
  status: 'Pending Review' | 'Approved' | 'Declined';
}

const INITIAL_INCOMING: IncomingEvent[] = [
  {
    id: 'INC-001',
    title: 'Inter-College RoboWars Championship',
    club: 'Robotics & Automation Society',
    proposer: 'Siddharth Rao (VP)',
    proposedDate: 'November 18, 2026',
    venue: 'Campus Indoor Stadium',
    expectedAttendance: 450,
    budgetRequested: '₹35,000',
    status: 'Pending Review',
  },
  {
    id: 'INC-002',
    title: 'Autumn Acoustic Night & Open Mic',
    club: 'Cultural & Music Society',
    proposer: 'Meera Nambiar (Sec)',
    proposedDate: 'November 22, 2026',
    venue: 'Open Air Amphitheatre',
    expectedAttendance: 300,
    budgetRequested: '₹12,000',
    status: 'Pending Review',
  },
  {
    id: 'INC-003',
    title: 'Startup Pitchathon 2026',
    club: 'E-Cell Innovation Club',
    proposer: 'Kavya Sundaram (Lead)',
    proposedDate: 'December 4, 2026',
    venue: 'Seminar Hall 3',
    expectedAttendance: 200,
    budgetRequested: '₹20,000',
    status: 'Approved',
  },
];

export const AdminIncomingEventsPage: React.FC = () => {
  const [events, setEvents] = useState<IncomingEvent[]>(INITIAL_INCOMING);
  const [notice, setNotice] = useState<string | null>(null);

  const handleAction = (id: string, newStatus: 'Approved' | 'Declined') => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
    setNotice(`Event proposal ${newStatus.toLowerCase()} successfully.`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
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
                color: '#b45309',
                background: '#fef3c7',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              Charter Approvals
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Pending Campus Calendaring
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Incoming Events & Approval Queue
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Review incoming event charters proposed by student organization executives for venue and budget approval.
          </p>
        </div>
      </div>

      {notice && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px 18px',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Grid of Incoming Events */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {events.map((evt) => (
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
                    background: evt.status === 'Approved' ? '#dcfce7' : evt.status === 'Declined' ? '#fee2e2' : '#fef3c7',
                    color: evt.status === 'Approved' ? '#15803d' : evt.status === 'Declined' ? '#dc2626' : '#b45309',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {evt.status}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                  Budget: {evt.budgetRequested}
                </span>
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
                {evt.title}
              </h3>
              <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, marginBottom: '12px' }}>
                {evt.club} • Proposed by {evt.proposer}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarClock size={14} color="#94a3b8" />
                  <span>Proposed Date: {evt.proposedDate}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#94a3b8" />
                  <span>Requested Venue: {evt.venue}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} color="#94a3b8" />
                  <span>Expected Attendees: {evt.expectedAttendance}</span>
                </div>
              </div>
            </div>

            {evt.status === 'Pending Review' ? (
              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <button
                  onClick={() => handleAction(evt.id, 'Approved')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <CheckCircle2 size={14} />
                  Approve Charter
                </button>
                <button
                  onClick={() => handleAction(evt.id, 'Declined')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <XCircle size={14} />
                  Reject
                </button>
              </div>
            ) : (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '12px', color: '#94a3b8' }}>
                Decided on calendar • Finalized
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
