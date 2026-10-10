import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Search,
  Calendar,
  CheckCircle2,
  UserCheck,
  MapPin,
  Mail,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_CLUBS, CampusClub } from '../../../pages/admin/data/clubs';

export const StudentOrganizationsModule: React.FC = () => {
  const navigate = useNavigate();
  const [clubs] = useState<CampusClub[]>(INITIAL_CLUBS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const categories = ['ALL', 'Cultural', 'Technical', 'Academic', 'Entrepreneurship', 'Social', 'Sports'];

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.tagline.toLowerCase().includes(search.toLowerCase()) ||
      club.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || club.category === categoryFilter;
    return matchesSearch && matchesCategory;
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
                color: '#1e3a8a',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              CAMPUS DIRECTORY
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {clubs.length} Recognized Student Organizations
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Browse Student Organizations
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0, maxWidth: '640px' }}>
            Explore campus associations, join active student charters, pay annual membership dues securely, and unlock member discounts on events and merchandise.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/apply-membership')}
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
          <UserCheck style={{ width: '16px', height: '16px' }} />
          <span>Register for an Organization</span>
        </button>
      </div>

      {/* ── 2. SEARCH & CATEGORY FILTERS ─────────────────────────── */}
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
            placeholder="Search organizations, tech, arts..."
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

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: categoryFilter === cat ? 700 : 500,
                cursor: 'pointer',
                backgroundColor: categoryFilter === cat ? '#0f172a' : '#f1f5f9',
                color: categoryFilter === cat ? '#ffffff' : '#64748b',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. CLUBS GRID ────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredClubs.map((club) => (
          <div
            key={club.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#eff6ff',
                      color: club.accentColor || '#1e3a8a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    <Building2 style={{ width: '22px', height: '22px' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
                      {club.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {club.category}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#15803d',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                        Chartered
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: '0 0 16px 0', minHeight: '40px' }}>
                {club.tagline || club.description}
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#64748b',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Users style={{ width: '13px', height: '13px', color: '#1e3a8a' }} />
                    Active Members:
                  </span>
                  <strong style={{ color: '#0f172a' }}>{club.memberCount} Students</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin style={{ width: '13px', height: '13px', color: '#b45309' }} />
                    Meeting Venue:
                  </span>
                  <span style={{ color: '#334155' }}>{club.meetingVenue || 'Student Union 204'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail style={{ width: '13px', height: '13px', color: '#7c3aed' }} />
                    Faculty Advisor:
                  </span>
                  <span style={{ color: '#334155' }}>{club.facultyAdvisor?.split(',')[0] || 'Dr. Ramesh Babu'}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '14px',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Annual Dues</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#15803d' }}>
                  ₹{club.duesAmount || 250} <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>/ year</span>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => navigate('/student/events')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Calendar style={{ width: '13px', height: '13px' }} />
                  <span>Events</span>
                </button>

                <button
                  onClick={() => navigate('/student/apply-membership')}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#1e3a8a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Join & Pay</span>
                  <ArrowRight style={{ width: '13px', height: '13px' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 4. BENEFITS BANNER ───────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0c2340 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <ShieldCheck style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              Student Organization Entitlements
            </span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0' }}>
            Why Join a Recognized Campus Organization?
          </h3>
          <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0, maxWidth: '600px' }}>
            Joining entitles you to 20% discounts on all event passes, voting rights in officer elections, exclusive merchandise discounts, and access to member-only project announcements.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/membership')}
          style={{
            backgroundColor: '#ffffff',
            color: '#1e3a8a',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Check My Membership Status
        </button>
      </div>
    </div>
  );
};
