import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import { useVolunteerTasks } from '../hooks/useVolunteerTasks';
import { useVolunteerExpenses } from '../hooks/useVolunteerExpenses';
import {
  Calendar,
  CheckSquare,
  Receipt,
  QrCode,
  Plus,
  ArrowRight,
  Clock,
  Bell,
  HeartHandshake,
} from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks, updateTaskStatus } = useVolunteerTasks();
  const { expenses } = useVolunteerExpenses();

  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>('ALL');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Baking' | 'Supplies' | 'Table Staffing' | 'Promotion'>('Baking');
  const [newTaskDue, setNewTaskDue] = useState('May 2, 2026');

  // Stats configuration matching Volunteer Problem Statement
  const stats = [
    {
      label: 'Bake Sale Tasks',
      value: `${tasks.filter((t) => t.status !== 'COMPLETED').length} Active`,
      subtitle: `${tasks.length} total squad tasks allocated`,
      color: '#1e3a8a',
      bg: '#eff6ff',
      icon: CheckSquare,
    },
    {
      label: 'Next Shift Station',
      value: 'East Gate',
      subtitle: 'Spring Gala Door Check-In',
      color: '#15803d',
      bg: '#dcfce7',
      icon: Calendar,
    },
    {
      label: 'Fundraiser Raised',
      value: '₹28,500',
      subtitle: 'Goal: ₹35,000 (81.4% on track)',
      color: '#b45309',
      bg: '#fef3c7',
      icon: HeartHandshake,
    },
    {
      label: 'Reimbursement Claims',
      value: `₹${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`,
      subtitle: `${expenses.filter((e) => e.status === 'PENDING').length} pending review`,
      color: '#7c3aed',
      bg: '#f3e8ff',
      icon: Receipt,
    },
  ];

  // Quick Action cards for core volunteer roles
  const actions = [
    {
      label: 'Fundraiser Tasks & Squad Board',
      description: 'View assigned fundraiser tasks, deadlines, and update progress (To do, In progress, Done)',
      color: '#1e3a8a',
      bg: '#eff6ff',
      icon: CheckSquare,
      onClick: () => navigate('/volunteer/tasks'),
    },
    {
      label: 'Event Duties & Instructions',
      description: 'Review confirmed event shifts, station locations, shift windows, and briefing protocols',
      color: '#b45309',
      bg: '#fef3c7',
      icon: Calendar,
      onClick: () => navigate('/volunteer/events'),
    },
    {
      label: 'Submit Reimbursement Claim',
      description: 'Upload out-of-pocket receipts and track pending, approved, rejected, or paid status',
      color: '#7c3aed',
      bg: '#f3e8ff',
      icon: Receipt,
      onClick: () => navigate('/volunteer/expenses'),
    },
    {
      label: 'Door Check-in & Verification',
      description: 'Verify memberships or check tickets only if explicitly granted event-day permissions',
      color: '#15803d',
      bg: '#dcfce7',
      icon: QrCode,
      onClick: () => navigate('/volunteer/scanner'),
    },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (taskCategoryFilter === 'ALL') return true;
    return t.category.toLowerCase().includes(taskCategoryFilter.toLowerCase());
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    tasks.unshift({
      id: `tsk-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      status: 'TODO',
      priority: 'HIGH',
      dueDate: newTaskDue,
      projectName: 'Spring Charity Bake Sale & Fundraiser',
      assigneeName: user?.name || 'RITHISH S',
    });
    setNewTaskTitle('');
    setShowTaskModal(false);
  };

  return (
    <div style={{ fontFamily: 'var(--font-family-body)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '6px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                border: '1px solid #bbf7d0',
              }}
              className="dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
            >
              Skyline Student Association
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              Volunteer Operations Hub
            </span>
          </div>

          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              margin: '0 0 6px 0',
              color: 'var(--foreground, #1e293b)',
              letterSpacing: '-0.3px',
            }}
            className="text-slate-900 dark:text-slate-100"
          >
            Volunteer Operations Hub
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }} className="text-slate-500 dark:text-slate-400">
            Welcome back, {user?.name || 'Volunteer'}. Coordinate the charity bake sale squad, admit attendees at the Gala door, and claim supply reimbursements.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/volunteer/scanner')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <QrCode style={{ width: '16px', height: '16px' }} />
            <span>Launch Door Scanner</span>
          </button>

          <button
            onClick={() => setShowTaskModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--foreground, #334155)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            <span>+ Log Squad Task</span>
          </button>
        </div>
      </div>

      {/* ── 2. Stat Cards (4-column) ──────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              style={{
                background: 'var(--card-bg, #ffffff)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid var(--border-color, #e2e8f0)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: stat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: '22px', height: '22px', color: stat.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#64748b',
                    fontWeight: 500,
                    marginBottom: '4px',
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: 'var(--foreground, #1e293b)',
                    marginBottom: '2px',
                    letterSpacing: '-0.5px',
                  }}
                  className="text-slate-900 dark:text-slate-100"
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {stat.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Quick Action Cards (4-column) ──────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <div
              key={i}
              onClick={act.onClick}
              style={{
                background: 'var(--card-bg, #ffffff)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid var(--border-color, #e2e8f0)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = act.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
              }}
            >
              <div>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: act.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <Icon style={{ width: '20px', height: '20px', color: act.color }} />
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--foreground, #1e293b)',
                    marginBottom: '6px',
                  }}
                  className="text-slate-900 dark:text-slate-100"
                >
                  {act.label}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#64748b',
                    lineHeight: 1.5,
                  }}
                >
                  {act.description}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: act.color,
                }}
              >
                <span>Launch Workspace</span>
                <ArrowRight style={{ width: '13px', height: '13px' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4. Main 2:1 Split Content ─────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
        }}
      >
        {/* LEFT COLUMN: Bake Sale Execution Board (2/3 proportional) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Fundraiser Roster Card */}
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #e2e8f0)',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-color, #f1f5f9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
              className="border-slate-100 dark:border-slate-800"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HeartHandshake style={{ width: '18px', height: '18px', color: '#1e3a8a' }} className="dark:text-blue-400" />
                  <h2
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--foreground, #1e293b)',
                      margin: 0,
                    }}
                    className="text-slate-900 dark:text-slate-100"
                  >
                    Bake Sale Squad Roster & Execution Board
                  </h2>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Solving fundraiser coordination: who is baking, who is buying supplies, who is managing the booth.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {['ALL', 'Baking', 'Supplies', 'Table Staffing'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTaskCategoryFilter(cat)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: taskCategoryFilter === cat ? '#1e3a8a' : 'var(--muted, #f1f5f9)',
                      color: taskCategoryFilter === cat ? 'white' : '#64748b',
                    }}
                    className={taskCategoryFilter !== cat ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : ''}
                  >
                    {cat === 'ALL' ? 'All Duties' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr
                    style={{
                      background: 'var(--muted, #f8fafc)',
                      borderBottom: '1px solid var(--border-color, #e2e8f0)',
                      color: '#64748b',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                    className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800"
                  >
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Squad Task</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Assigned To</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Due Date</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Status / Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.slice(0, 5).map((task) => {
                    const isDone = task.status === 'COMPLETED';
                    const inProgress = task.status === 'IN_PROGRESS';

                    return (
                      <tr
                        key={task.id}
                        style={{
                          borderBottom: '1px solid var(--border-color, #f1f5f9)',
                          transition: 'background-color 0.15s ease',
                        }}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800"
                      >
                        <td style={{ padding: '16px 20px', maxWidth: '280px' }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: isDone ? '#94a3b8' : 'var(--foreground, #1e293b)',
                              textDecoration: isDone ? 'line-through' : 'none',
                              marginBottom: '2px',
                            }}
                            className={!isDone ? 'text-slate-900 dark:text-slate-100' : ''}
                          >
                            {task.title}
                          </div>
                          {task.description && (
                            <div style={{ fontSize: '12px', color: '#64748b' }} className="truncate">
                              {task.description}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background:
                                task.category === 'Baking'
                                  ? '#fef3c7'
                                  : task.category === 'Supplies'
                                  ? '#eff6ff'
                                  : '#ecfdf5',
                              color:
                                task.category === 'Baking'
                                  ? '#b45309'
                                  : task.category === 'Supplies'
                                  ? '#1e3a8a'
                                  : '#065f46',
                            }}
                          >
                            {task.category}
                          </span>
                        </td>

                        <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 500, color: '#334155' }} className="dark:text-slate-300">
                            {task.assigneeName}
                          </span>
                        </td>

                        <td style={{ padding: '16px 16px', whiteSpace: 'nowrap', color: '#64748b' }}>
                          {task.dueDate}
                        </td>

                        <td style={{ padding: '16px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() =>
                              updateTaskStatus(
                                task.id,
                                isDone ? 'TODO' : inProgress ? 'COMPLETED' : 'IN_PROGRESS'
                              )
                            }
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              border: isDone ? '1px solid #bbf7d0' : 'none',
                              background: isDone
                                ? '#dcfce7'
                                : inProgress
                                ? '#eff6ff'
                                : '#f1f5f9',
                              color: isDone ? '#15803d' : inProgress ? '#1e3a8a' : '#475569',
                              cursor: 'pointer',
                            }}
                          >
                            {isDone ? '✓ Completed' : inProgress ? '● In Progress' : 'Start Task'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--border-color, #f1f5f9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--muted, #f8fafc)',
              }}
              className="bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"
            >
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Showing 5 of {tasks.length} volunteer squad duties
              </span>
              <button
                onClick={() => navigate('/volunteer/tasks')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1e3a8a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                className="dark:text-blue-400"
              >
                <span>View Full Squad Board</span>
                <ArrowRight style={{ width: '13px', height: '13px' }} />
              </button>
            </div>
          </div>

          {/* Live Fundraiser Tracker */}
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--foreground, #1e293b)' }}>
                  Spring Charity Bake Sale & Fundraiser Tracker
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Event date: May 2, 2026 • Student Union Plaza Quad
                </p>
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#15803d',
                  background: '#dcfce7',
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                81.4% Target Met
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ height: '100%', width: '81.4%', background: '#10b981', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
              <span>Raised so far: <strong style={{ color: '#1e293b' }}>₹28,500</strong></span>
              <span>Charity Target: <strong style={{ color: '#1e293b' }}>₹35,000</strong></span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Door Scanner Quick Station & Shift Briefing (1/3) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Gala Door Scanner Quick Launch */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
              color: 'white',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 4px 14px rgba(30, 58, 138, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '18px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                  }}
                >
                  LIVE ENTRANCE DESK
                </span>
                <span style={{ fontSize: '12px', color: '#93c5fd' }}>Door Station #1</span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0', color: 'white' }}>
                Door Check-in & Scanner
              </h3>
              <p style={{ fontSize: '13px', color: '#bfdbfe', margin: 0, lineHeight: 1.5 }}>
                Verify guest tickets in seconds at the Main Auditorium door without paper sheets.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '12px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: '#93c5fd', fontSize: '11px', display: 'block' }}>TURNED OUT</span>
                <strong style={{ fontSize: '16px' }}>385 Admitted</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#93c5fd', fontSize: '11px', display: 'block' }}>CAPACITY</span>
                <strong style={{ fontSize: '16px' }}>420 Seats</strong>
              </div>
            </div>

            <button
              onClick={() => navigate('/volunteer/scanner')}
              style={{
                padding: '12px',
                background: 'white',
                color: '#1e3a8a',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <QrCode style={{ width: '16px', height: '16px' }} />
              <span>Open Scanner Workspace</span>
            </button>
          </div>

          {/* Next Shift Schedule Briefing */}
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Clock style={{ width: '18px', height: '18px', color: '#15803d' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--foreground, #1e293b)' }}>
                Upcoming Shift Briefing
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: 'var(--muted, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                }}
                className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60"
              >
                <div style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 700, marginBottom: '2px' }}>
                  May 2, 2026 • 10:00 AM - 12:00 PM
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground, #1e293b)' }}>
                  Bake Sale Plaza Booth Table
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Student Union Quad • Handle QR collections & cash float
                </div>
              </div>

              <div
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: 'var(--muted, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                }}
                className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60"
              >
                <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 700, marginBottom: '2px' }}>
                  May 16, 2026 • 05:30 PM - 10:30 PM
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground, #1e293b)' }}>
                  Spring Gala Door Scanner
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Main Auditorium East Gate • Check-in badge distribution
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/volunteer/events')}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '9px',
                background: 'transparent',
                border: '1px solid var(--border-color, #cbd5e1)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--foreground, #334155)',
                cursor: 'pointer',
              }}
              className="hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              View Full Shift Protocols
            </button>
          </div>

          {/* Latest Official Club Directive (Replacing WhatsApp) */}
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell style={{ width: '16px', height: '16px', color: '#b45309' }} />
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--foreground, #1e293b)' }}>
                  Official Club Notice
                </h4>
              </div>
              <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>URGENT</span>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground, #1e293b)', marginBottom: '4px' }}>
              Semester Reimbursement Cutoff
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px 0' }}>
              The Treasurer will close the books this Friday. Any out-of-pocket receipts for baking ingredients must be submitted today.
            </p>

            <button
              onClick={() => navigate('/volunteer/expenses')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                color: '#1e3a8a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0,
              }}
              className="dark:text-blue-400"
            >
              <span>Submit out-of-pocket reimbursement</span>
              <ArrowRight style={{ width: '13px', height: '13px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 5. Add Task Modal ─────────────────────────────────────── */}
      {showTaskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              border: '1px solid var(--border-color, #e2e8f0)',
              width: '100%',
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckSquare style={{ width: '20px', height: '20px', color: '#1e3a8a' }} className="dark:text-blue-400" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--foreground, #1e293b)' }}>
                  Log Fundraiser Squad Duty
                </h3>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--foreground, #334155)' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bake 3 dozen lemon bars, buy recyclable napkins..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--foreground, #1e293b)',
                    outline: 'none',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--foreground, #334155)' }}>
                  Squad Responsibility Category
                </label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--foreground, #1e293b)',
                    outline: 'none',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="Baking">Baking & Kitchen (Who is baking)</option>
                  <option value="Supplies">Supplies & Ingredients (Who is buying)</option>
                  <option value="Table Staffing">Table & Quad Shift (Who is managing table)</option>
                  <option value="Promotion">Signage & Promotion</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--foreground, #334155)' }}>
                  Target Completion Date
                </label>
                <input
                  type="text"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--foreground, #1e293b)',
                    outline: 'none',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'transparent',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    background: '#1e3a8a',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Assign Duty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
