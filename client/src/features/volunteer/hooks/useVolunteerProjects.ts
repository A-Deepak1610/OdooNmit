import { useState, useEffect, useCallback } from 'react';
import { VolunteerProject } from '../types/volunteer.types';
import { volunteerApi } from '../services/volunteerApi';

export function useVolunteerProjects() {
  const [projects, setProjects] = useState<VolunteerProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await volunteerApi.getProjects();
      setProjects(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load projects';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    refreshProjects: loadProjects,
  };
}
