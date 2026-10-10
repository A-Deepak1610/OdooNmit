import React from 'react';
import { VolunteerProject } from '../types/volunteer.types';
import { Calendar, User, CheckCircle2, TrendingUp } from 'lucide-react';

interface ProjectCardProps {
  project: VolunteerProject;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const taskProgress = project.totalTasks > 0
    ? Math.round((project.completedTasks / project.totalTasks) * 100)
    : 0;

  const fundProgress = project.targetFund && project.targetFund > 0
    ? Math.round(((project.raisedFund || 0) / project.targetFund) * 100)
    : 0;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '20px',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#cbd5e1';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: '4px',
              backgroundColor: '#eff6ff',
              color: '#1e3a8a',
            }}
          >
            {project.category}
          </span>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '20px',
              backgroundColor: project.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
              color: project.status === 'ACTIVE' ? '#15803d' : '#64748b',
              textTransform: 'uppercase',
            }}
          >
            {project.status}
          </span>
        </div>

        <h3
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 8px 0',
            lineHeight: 1.3,
          }}
        >
          {project.name}
        </h3>

        <p
          style={{
            fontSize: '13px',
            color: '#64748b',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {project.description}
        </p>

        {/* Coordinator & Deadline */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid #f1f5f9',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
            <span style={{ fontWeight: 500, color: '#334155' }}>
              {project.coordinatorName} ({project.coordinatorRole})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
            <Calendar style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
            <span>Target: {project.deadline}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
        {/* Task progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 style={{ width: '14px', height: '14px', color: '#15803d' }} />
              Task Execution
            </span>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>
              {project.completedTasks} / {project.totalTasks} Done ({taskProgress}%)
            </span>
          </div>
          <div style={{ height: '7px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${taskProgress}%`,
                height: '100%',
                backgroundColor: '#15803d',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Fundraising goal */}
        {project.targetFund && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <TrendingUp style={{ width: '14px', height: '14px', color: '#1e3a8a' }} />
                Fundraising Goal
              </span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>
                ₹{project.raisedFund?.toLocaleString()} / ₹{project.targetFund?.toLocaleString()} ({fundProgress}%)
              </span>
            </div>
            <div style={{ height: '7px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(fundProgress, 100)}%`,
                  height: '100%',
                  backgroundColor: '#1e3a8a',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            paddingTop: '6px',
          }}
        >
          <span style={{ color: '#64748b' }}>My Assigned Duties:</span>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '12px',
              backgroundColor: project.myTasksCount > 0 ? '#eff6ff' : '#f8fafc',
              color: project.myTasksCount > 0 ? '#1e3a8a' : '#94a3b8',
              fontWeight: 600,
            }}
          >
            {project.myTasksCount > 0 ? `${project.myTasksCount} Duties Active` : 'None Allocated'}
          </span>
        </div>
      </div>
    </div>
  );
};
