import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import { useVolunteerTasks } from '../hooks/useVolunteerTasks';
import { useVolunteerExpenses } from '../hooks/useVolunteerExpenses';
import {
  Calendar,
  Trophy,
  CheckSquare,
  Receipt,
  Ticket,
  Plus,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { TeamWorkstreamBanner, WorkstreamId } from '../../../components/modules/TeamWorkstreamBanner';
import { EventsTicketingModule } from '../../../components/modules/events/EventsTicketingModule';
import { MembershipModule } from '../../../components/modules/memberships/MembershipModule';
import { MerchandiseTaskModule } from '../../../components/modules/merchandise/MerchandiseTaskModule';
import { FinanceLedgerModule } from '../../../components/modules/finance/FinanceLedgerModule';
import { AnnouncementBoardModule } from '../../../components/modules/announcements/AnnouncementBoardModule';

export const VolunteerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeStream, setActiveStream] = useState<WorkstreamId>('all');
  const { tasks, updateTaskStatus } = useVolunteerTasks();
  const { expenses } = useVolunteerExpenses();

  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>('ALL');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Baking' | 'Supplies' | 'Table Staffing' | 'Promotion'>('Baking');
  const [newTaskDue, setNewTaskDue] = useState('May 2, 2026');

  // Stats configuration matching CampusMitra Master Anatomy
  const stats = [
    {
      label: 'Assigned Duties',
      value: `${tasks.filter((t) => t.status !== 'COMPLETED').length} Active`,
      subtitle: `${tasks.length} total tasks allocated`,
      color: '#1e3a8a',
      bg: '#eff6ff',
      icon: CheckSquare,
    },
    {
      label: 'Upcoming Shift',
      value: 'May 2',
      subtitle: '10 AM - 12 PM Quad Table Shift',
      color: '#15803d',
      bg: '#dcfce7',
      icon: Calendar,
    },
    {
      label: 'Expense Claims',
      value: `₹${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`,
      subtitle: 'Ingredient & supply receipts filed',
      color: '#b45309',
      bg: '#fef3c7',
      icon: Receipt,
    },
    {
      label: 'Volunteer Service',
      value: '18 Hours',
      subtitle: 'Verified by Skyline Secretariat',
      color: '#7c3aed',
      bg: '#f3e8ff',
      icon: Trophy,
    },
  ];

  // Quick Action cards matching Master Anatomy
  const actions = [
    {
      label: 'Bake Sale Task Board',
      description: 'Track and execute baking, packaging & quad shift assignments',
      color: '#1e3a8a',
      bg: '#eff6ff',
      icon: CheckSquare,
      onClick: () => navigate('/volunteer/tasks'),
    },
    {
      label: 'Submit Expense Claim',
      description: 'Upload out-of-pocket receipts for Treasurer reimbursement',
      color: '#15803d',
      bg: '#dcfce7',
      icon: Receipt,
      onClick: () => navigate('/volunteer/expenses'),
    },
    {
      label: 'Gala Shift & Duty Passes',
      description: 'Review auditorium door briefing & digital volunteer credentials',
      color: '#b45309',
      bg: '#fef3c7',
      icon: Ticket,
      onClick: () => navigate('/volunteer/events'),
    },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (taskCategoryFilter === 'ALL') return true;
    return t.category.toLowerCase().includes(taskCategoryFilter.toLowerCase());
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    // Prepend new task to in-memory list
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
    <div style={{ fontFamily: 'var(--font-family-body)' }}>
      {/* ── 1. 4-DEVELOPER WORKSTREAM BANNER ──────────────────────── */}
      <TeamWorkstreamBanner
        activeStream={activeStream}
        onSelectStream={(s) => setActiveStream(s)}
      />

      {/* Render dedicated Dev Workstream or Full Volunteer Operations Desk */}
      {activeStream === 'events' ? (
        <EventsTicketingModule />
      ) : activeStream === 'memberships' ? (
        <MembershipModule />
      ) : activeStream === 'merch_tasks' ? (
        <MerchandiseTaskModule />
      ) : activeStream === 'finance_announcements' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <FinanceLedgerModule />
          <AnnouncementBoardModule />
        </div>
      ) : (
        /* STANDARD MASTER PAGE ANATOMY FOR VOLUNTEER ROLE */
        <div>
          {/* ── 2. PAGE HEADER ─────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '28px',
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
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                  }}
                >
                  Skyline Student Association
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Volunteer Operations Desk
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
                Volunteer Operations Desk
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Welcome back, {user?.name || 'Volunteer'}. Coordinate fundraiser bake sales, manage quad shifts, and claim out-of-pocket reimbursements.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setShowTaskModal(true)}
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
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#172554';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1e3a8a';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                <span>Assign Task</span>
              </button>
            </div>
          </div>

          {/* ── 3. STAT CARDS (4-col Master Anatomy) ────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '28px',
            }}
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* 44×44px container */}
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
                        color: '#1e293b',
                        marginBottom: '2px',
                        letterSpacing: '-0.5px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
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

          {/* ── 4. QUICK ACTIONS (3-col Master Anatomy) ─────────────── */}
          <div style={{ marginBottom: '28px' }}>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#1e293b',
                margin: '0 0 16px 0',
              }}
            >
              Volunteer Quick Actions
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '14px',
              }}
            >
              {actions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <div
                    key={i}
                    onClick={action.onClick}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = action.color;
                      e.currentTarget.style.boxShadow = `0 4px 12px ${action.color}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: action.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon style={{ width: '22px', height: '22px', color: action.color }} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#1e293b',
                          marginBottom: '2px',
                        }}
                      >
                        {action.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {action.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 5. MAIN CONTENT (2:1 split Master Anatomy) ──────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '20px',
              marginBottom: '28px',
            }}
          >
            {/* Left column (2fr) — Bake Sale Task Board & Roster */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                {/* Header with Filter Pills */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '18px',
                    paddingBottom: '14px',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#1e293b',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <CheckSquare style={{ width: '18px', height: '18px', color: '#1e3a8a' }} />
                      Bake Sale Squad Roster & Execution Board
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                      Fundraiser planning: baking, packaging, and quad table shifts.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['ALL', 'Baking', 'Supplies', 'Table'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setTaskCategoryFilter(cat)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '20px',
                          border: '1px solid',
                          borderColor: taskCategoryFilter === cat ? '#1e3a8a' : '#e2e8f0',
                          backgroundColor: taskCategoryFilter === cat ? '#1e3a8a' : '#ffffff',
                          color: taskCategoryFilter === cat ? '#ffffff' : '#64748b',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Task Item Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredTasks.slice(0, 5).map((task) => {
                    const isCompleted = task.status === 'COMPLETED';
                    return (
                      <div
                        key={task.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9',
                          backgroundColor: isCompleted ? '#f8fafc' : '#ffffff',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => {
                              const nextStatus = isCompleted ? 'IN_PROGRESS' : 'COMPLETED';
                              updateTaskStatus(task.id, nextStatus);
                            }}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              accentColor: '#1e3a8a',
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: isCompleted ? '#94a3b8' : '#1e293b',
                                textDecoration: isCompleted ? 'line-through' : 'none',
                              }}
                            >
                              {task.title}
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '4px',
                                fontSize: '12px',
                                color: '#64748b',
                              }}
                            >
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: '#eff6ff',
                                  color: '#1e3a8a',
                                  fontWeight: 500,
                                }}
                              >
                                {task.category}
                              </span>
                              <span>•</span>
                              <span>Assigned: {task.assigneeName}</span>
                              <span>•</span>
                              <span style={{ color: task.isOverdue && !isCompleted ? '#dc2626' : '#64748b' }}>
                                Due: {task.dueDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => {
                              const nextStatus = isCompleted ? 'IN_PROGRESS' : 'COMPLETED';
                              updateTaskStatus(task.id, nextStatus);
                            }}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: isCompleted ? '#f1f5f9' : '#15803d',
                              color: isCompleted ? '#64748b' : '#ffffff',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            {isCompleted ? 'Mark Pending' : 'Done ✓'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ color: '#64748b' }}>
                    Showing {Math.min(filteredTasks.length, 5)} of {tasks.length} volunteer squad duties
                  </span>
                  <button
                    onClick={() => navigate('/volunteer/tasks')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1e3a8a',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    View Complete Task Table →
                  </button>
                </div>
              </div>

              {/* Fundraiser Bake Sale Campaign Card */}
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#1e293b',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <TrendingUp style={{ width: '18px', height: '18px', color: '#15803d' }} />
                      Spring Charity Bake Sale & Fundraiser Campaign
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                      Fundraiser Target: ₹20,000 for student conference travel & equipment scholarships.
                    </p>
                  </div>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    71% Achieved
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    height: '10px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    marginBottom: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '71%',
                      height: '100%',
                      backgroundColor: '#15803d',
                      borderRadius: '5px',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    fontSize: '13px',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>Total Inflow Raised</span>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '16px' }}>₹14,200</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>Treat Packs Sold</span>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '16px' }}>154 Packs</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>Shift Quotas</span>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '16px' }}>4 / 4 Filled</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column (1fr) — Upcoming Shift & Reimbursement Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Event Day Shift Card */}
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '14px',
                  }}
                >
                  <Calendar style={{ width: '18px', height: '18px', color: '#b45309' }} />
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                    My Next Shift Schedule
                  </h3>
                </div>

                <div
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde68a',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400e' }}>
                    Table Staffing Shift (Booth #4)
                  </div>
                  <div style={{ fontSize: '13px', color: '#b45309', marginTop: '4px' }}>
                    Saturday, May 2 • 10:00 AM - 12:00 PM
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: '#78350f',
                      marginTop: '6px',
                    }}
                  >
                    <MapPin style={{ width: '14px', height: '14px' }} />
                    <span>Student Union Plaza Quad</span>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                    Shift Day Briefing:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    <li>Arrive at 9:45 AM for cash float & QR standee handover.</li>
                    <li>Apply 20% member discount on verified digital ID passes.</li>
                    <li>Ensure allergy declaration labels remain visible.</li>
                  </ul>
                </div>

                <button
                  onClick={() => navigate('/volunteer/events')}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#1e3a8a',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View All Shift Instructions →
                </button>
              </div>

              {/* Reimbursement Snapshot Card */}
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Receipt style={{ width: '18px', height: '18px', color: '#1e3a8a' }} />
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                      Expense Reimbursements
                    </h3>
                  </div>
                  <button
                    onClick={() => navigate('/volunteer/expenses')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1e3a8a',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    View All →
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {expenses.slice(0, 3).map((claim) => (
                    <div
                      key={claim.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ maxWidth: '65%' }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1e293b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {claim.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {claim.date} • {claim.receiptNote}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                          ₹{claim.amount}
                        </div>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor:
                              claim.status === 'REIMBURSED'
                                ? '#dcfce7'
                                : claim.status === 'APPROVED'
                                ? '#eff6ff'
                                : '#fef3c7',
                            color:
                              claim.status === 'REIMBURSED'
                                ? '#15803d'
                                : claim.status === 'APPROVED'
                                ? '#1e3a8a'
                                : '#b45309',
                          }}
                        >
                          {claim.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/volunteer/expenses')}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1e3a8a',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  + File New Receipt Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN / CREATE TASK MODAL ────────────────────────────── */}
      {showTaskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '28px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Assign New Fundraiser Duty
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                  Duty Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bake 30 blueberry muffins"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  >
                    <option value="Baking">Baking</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Table Staffing">Table Shift</option>
                    <option value="Promotion">Promotion</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                    Deadline Date
                  </label>
                  <input
                    type="text"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: 600,
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
                    border: 'none',
                    background: '#1e3a8a',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
