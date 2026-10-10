import React from 'react';
import { VolunteerTask, TaskStatus } from '../types/volunteer.types';
import {
  Search,
  AlertCircle,
  Play,
  CheckCircle2,
  RotateCcw,
  Loader2,
  CheckSquare,
  RefreshCw,
  Clock,
} from 'lucide-react';

interface TaskListProps {
  tasks: VolunteerTask[];
  loading: boolean;
  error: string | null;
  updatingTaskId: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onRefresh: () => void;
  stats?: {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  error,
  updatingTaskId,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  onStatusChange,
  onRefresh,
  stats,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── 1. SEARCH & FILTERS BAR (Master Anatomy) ───────────────── */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '18px 20px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              style={{
                width: '16px',
                height: '16px',
                color: '#94a3b8',
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              type="text"
              placeholder="Search tasks by duty, project or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#f8fafc',
              }}
            />
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: 'white',
                color: '#1e293b',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Statuses {stats ? `(${stats.total})` : ''}</option>
              <option value="TODO">To Do {stats ? `(${stats.todo})` : ''}</option>
              <option value="IN_PROGRESS">In Progress {stats ? `(${stats.inProgress})` : ''}</option>
              <option value="COMPLETED">Completed {stats ? `(${stats.completed})` : ''}</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: 'white',
                color: '#1e293b',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: 'white',
                color: '#1e293b',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Categories</option>
              <option value="Baking">Baking</option>
              <option value="Supplies">Supplies</option>
              <option value="Table Staffing">Table Staffing</option>
              <option value="Promotion">Promotion</option>
              <option value="Logistics">Logistics</option>
            </select>

            <button
              onClick={onRefresh}
              title="Refresh Task Board"
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Count Pills */}
        {stats && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '8px',
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid #f1f5f9',
              fontSize: '12px',
            }}
          >
            <span style={{ color: '#64748b', fontWeight: 600 }}>Summary:</span>
            <span style={{ padding: '3px 10px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
              Total: {stats.total}
            </span>
            <span style={{ padding: '3px 10px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
              To Do: {stats.todo}
            </span>
            <span style={{ padding: '3px 10px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#1e3a8a', fontWeight: 600 }}>
              In Progress: {stats.inProgress}
            </span>
            <span style={{ padding: '3px 10px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }}>
              Completed: {stats.completed}
            </span>
            {stats.overdue > 0 && (
              <span style={{ padding: '3px 10px', borderRadius: '12px', backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: 700 }}>
                ⚠ Overdue: {stats.overdue}
              </span>
            )}
          </div>
        )}
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle style={{ width: '16px', height: '16px' }} />
            <span>{error}</span>
          </div>
          <button
            onClick={onRefresh}
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
          <div style={{ fontSize: '14px', fontWeight: 500 }}>Loading volunteer task assignments...</div>
        </div>
      )}

      {/* ── 4. EMPTY STATE ────────────────────────────────────────── */}
      {!loading && tasks.length === 0 && (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <CheckSquare style={{ width: '36px', height: '36px', color: '#cbd5e1', margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
            No Tasks Matching Criteria
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
            Try resetting your search query or filter dropdowns above to view all volunteer duties.
          </p>
        </div>
      )}

      {/* ── 5. DESKTOP & TABLE VIEW (Master Table Anatomy) ────────── */}
      {!loading && tasks.length > 0 && (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 20px' }}>Task Duty</th>
                  <th style={{ padding: '14px 16px' }}>Category</th>
                  <th style={{ padding: '14px 16px' }}>Priority</th>
                  <th style={{ padding: '14px 16px' }}>Due Date</th>
                  <th style={{ padding: '14px 16px' }}>Execution Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const isUpdating = updatingTaskId === task.id;
                  const isCompleted = task.status === 'COMPLETED';

                  return (
                    <tr
                      key={task.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Task details */}
                      <td style={{ padding: '16px 20px', maxWidth: '340px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                          {task.title}
                        </div>
                        {task.projectName && (
                          <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '2px', fontWeight: 500 }}>
                            📁 {task.projectName}
                          </div>
                        )}
                        {task.description && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                            {task.description}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#eff6ff',
                            color: '#1e3a8a',
                            fontWeight: 600,
                            fontSize: '12px',
                          }}
                        >
                          {task.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontSize: '11px',
                            backgroundColor:
                              task.priority === 'URGENT'
                                ? '#fef2f2'
                                : task.priority === 'HIGH'
                                ? '#fff7ed'
                                : '#f1f5f9',
                            color:
                              task.priority === 'URGENT'
                                ? '#dc2626'
                                : task.priority === 'HIGH'
                                ? '#c2410c'
                                : '#475569',
                          }}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Due Date & Overdue */}
                      <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 500, color: '#334155' }}>
                          {task.dueDate}
                        </div>
                        {task.isOverdue && !isCompleted && (
                          <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <AlertCircle style={{ width: '12px', height: '12px' }} />
                            Overdue
                          </div>
                        )}
                      </td>

                      {/* Execution Status */}
                      <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor:
                              task.status === 'COMPLETED'
                                ? '#dcfce7'
                                : task.status === 'IN_PROGRESS'
                                ? '#eff6ff'
                                : '#fef3c7',
                            color:
                              task.status === 'COMPLETED'
                                ? '#15803d'
                                : task.status === 'IN_PROGRESS'
                                ? '#1e3a8a'
                                : '#92400e',
                          }}
                        >
                          {task.status === 'COMPLETED' ? (
                            <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                          ) : task.status === 'IN_PROGRESS' ? (
                            <Clock style={{ width: '14px', height: '14px' }} />
                          ) : (
                            <CheckSquare style={{ width: '14px', height: '14px' }} />
                          )}
                          <span>{task.status === 'COMPLETED' ? 'Done' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'To Do'}</span>
                        </span>
                      </td>

                      {/* Transition Action Button */}
                      <td style={{ padding: '16px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {task.status === 'TODO' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                            style={{
                              padding: '7px 14px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#1e3a8a',
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            {isUpdating ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" /> : <Play style={{ width: '13px', height: '13px' }} />}
                            <span>Start Task</span>
                          </button>
                        )}

                        {task.status === 'IN_PROGRESS' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => onStatusChange(task.id, 'COMPLETED')}
                            style={{
                              padding: '7px 14px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#15803d',
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            {isUpdating ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" /> : <CheckCircle2 style={{ width: '13px', height: '13px' }} />}
                            <span>Mark Done</span>
                          </button>
                        )}

                        {task.status === 'COMPLETED' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#64748b',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            {isUpdating ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" /> : <RotateCcw style={{ width: '13px', height: '13px' }} />}
                            <span>Reopen</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
