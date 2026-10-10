import React from 'react';
import { useVolunteerProjects } from '../hooks/useVolunteerProjects';
import { ProjectCard } from '../components/ProjectCard';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const VolunteerProjects: React.FC = () => {
  const { projects, loading, error, refreshProjects } = useVolunteerProjects();

  return (
    <div style={{ fontFamily: 'var(--font-family-body)' }}>
      {/* ── 1. MASTER PAGE HEADER ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
            justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#eff6ff',
                color: '#1e3a8a',
              }}
            >
              Initiatives
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Fundraiser Campaigns
            </span>
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              margin: '0 0 6px 0',
              color: '#1e293b',
              letterSpacing: '-0.3px',
            }}
          >
            Projects & Fundraiser Campaigns
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Active club initiatives, bake sales, and campus events driven by volunteer squads.
          </p>
        </div>

        <button
          onClick={refreshProjects}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: 'white',
            color: '#1e293b',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RefreshCw style={{ width: '14px', height: '14px' }} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── 2. ERROR STATE ────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle style={{ width: '16px', height: '16px' }} />
            <span>{error}</span>
          </div>
          <button
            onClick={refreshProjects}
            style={{ fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── 3. LOADING STATE ──────────────────────────────────────── */}
      {loading && (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '40px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <Loader2 style={{ width: '28px', height: '28px', color: '#1e3a8a', margin: '0 auto 12px auto' }} className="animate-spin" />
          <div style={{ fontSize: '14px', fontWeight: 500 }}>Loading project & campaign data...</div>
        </div>
      )}

      {/* ── 4. 3-COLUMN PROJECTS GRID (Master Anatomy) ────────────── */}
      {!loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '20px',
          }}
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};
