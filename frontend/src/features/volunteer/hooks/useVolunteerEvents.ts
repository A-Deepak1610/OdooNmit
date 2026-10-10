import { useState, useEffect, useCallback } from 'react';
import { VolunteerEventAssignment } from '../types/volunteer.types';
import { volunteerApi } from '../services/volunteerApi';

export function useVolunteerEvents() {
  const [events, setEvents] = useState<VolunteerEventAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await volunteerApi.getEvents();
      setEvents(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load event assignments';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    loading,
    error,
    refreshEvents: loadEvents,
  };
}
