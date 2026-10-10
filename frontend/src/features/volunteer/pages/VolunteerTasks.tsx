import React, { useState } from 'react';
import { useVolunteerTasks } from '../hooks/useVolunteerTasks';
import { TaskList } from '../components/TaskList';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';

export const VolunteerTasks: React.FC = () => {
  const { user } = useAuthStore();
  const {
    tasks,
    filteredTasks,
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
    updateTaskStatus,
    refreshTasks,
    stats,
  } = useVolunteerTasks();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Baking' | 'Supplies' | 'Table Staffing' | 'Promotion'>('Baking');
  const [newTaskDue, setNewTaskDue] = useState('May 2, 2026');

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
              Task Management
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Fundraiser & Gala Duties
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
            Volunteer Task Board
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Track, filter, and execute assigned tasks for bake sales, supply runs, and quad table shifts.
          </p>
        </div>

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
          <span>New Task</span>
        </button>
      </div>

      {/* ── 2. TASK TABLE & FILTERS ───────────────────────────────── */}
      <TaskList
        tasks={filteredTasks}
        loading={loading}
        error={error}
        updatingTaskId={updatingTaskId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onStatusChange={updateTaskStatus}
        onRefresh={refreshTasks}
        stats={stats}
      />

      {/* ── MODAL ─────────────────────────────────────────────────── */}
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
                Create Volunteer Task
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
                  placeholder="e.g. Purchase napkins & compostable snack boxes"
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
                    Deadline
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
