import { useState, useEffect, useCallback, useMemo } from 'react';
import { VolunteerTask, TaskStatus } from '../types/volunteer.types';
import { volunteerApi } from '../services/volunteerApi';

export function useVolunteerTasks() {
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await volunteerApi.getTasks();
      setTasks(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load volunteer tasks';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const updateTaskStatus = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      setUpdatingTaskId(taskId);
      try {
        const updated = await volunteerApi.updateTaskStatus(taskId, newStatus);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update task status';
        setError(message);
      } finally {
        setUpdatingTaskId(null);
      }
    },
    []
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search title / description / project
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description || '').toLowerCase().includes(query);
        const matchesProject = (task.projectName || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesProject) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && task.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && task.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const stats = useMemo(() => {
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const overdue = tasks.filter((t) => t.isOverdue && t.status !== 'COMPLETED').length;

    return {
      total: tasks.length,
      todo,
      inProgress,
      completed,
      overdue,
    };
  }, [tasks]);

  return {
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
    refreshTasks: loadTasks,
    stats,
  };
}
