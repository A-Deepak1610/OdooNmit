import React from 'react';
import { Calendar, Users, ShoppingBag, Landmark, Sparkles, Layers } from 'lucide-react';

export type WorkstreamId = 'all' | 'events' | 'memberships' | 'merch_tasks' | 'finance_announcements';

interface TeamWorkstreamBannerProps {
  activeStream: WorkstreamId;
  onSelectStream: (stream: WorkstreamId) => void;
}

export const TeamWorkstreamBanner: React.FC<TeamWorkstreamBannerProps> = ({
  activeStream,
  onSelectStream,
}) => {
  const streams = [
    {
      id: 'all' as WorkstreamId,
      label: 'All Workstreams',
      sub: 'Synthesized role dashboard',
      icon: Layers,
      color: '#1e3a8a',
      bg: '#eff6ff',
    },
    {
      id: 'events' as WorkstreamId,
      label: 'Dev 1: Events & Tickets',
      sub: 'Spring Gala & door QR checks',
      icon: Calendar,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      id: 'memberships' as WorkstreamId,
      label: 'Dev 2: Memberships & Dues',
      sub: 'Sign-ups & digital ID passes',
      icon: Users,
      color: '#15803d',
      bg: '#dcfce7',
    },
    {
      id: 'merch_tasks' as WorkstreamId,
      label: 'Dev 3: Merch & Tasks',
      sub: 'Hoodie stock & bake sale duties',
      icon: ShoppingBag,
      color: '#b45309',
      bg: '#fef3c7',
    },
    {
      id: 'finance_announcements' as WorkstreamId,
      label: 'Dev 4: Treasury & Notices',
      sub: 'Closing books & notice board',
      icon: Landmark,
      color: '#7c3aed',
      bg: '#f3e8ff',
    },
  ];

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '28px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#1e3a8a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles style={{ width: '16px', height: '16px' }} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--foreground)',
                margin: 0,
              }}
            >
              Skyline Student Association — 4-Member Engineering Team Setup
            </h3>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--muted-foreground)',
                margin: '2px 0 0 0',
              }}
            >
              Multi-tenant club architecture. Inspect individual workstream prototypes or the active role workspace.
            </p>
          </div>
        </div>

        <span
          style={{
            color: '#15803d',
            background: '#dcfce7',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 600,
            fontSize: '11px',
            textTransform: 'uppercase',
          }}
        >
          Tenant: Skyline SA
        </span>
      </div>

      {/* Grid of Workstream Selectors */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
        }}
      >
        {streams.map((s) => {
          const Icon = s.icon;
          const isActive = activeStream === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectStream(s.id)}
              style={{
                textAlign: 'left',
                padding: '12px 14px',
                borderRadius: '8px',
                border: isActive ? `1.5px solid ${s.color}` : '1px solid var(--border)',
                backgroundColor: isActive ? s.bg : 'var(--background)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = s.color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Icon style={{ width: '15px', height: '15px', color: s.color }} />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isActive ? s.color : 'var(--foreground)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {s.label}
                </span>
              </div>
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--muted-foreground)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {s.sub}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
