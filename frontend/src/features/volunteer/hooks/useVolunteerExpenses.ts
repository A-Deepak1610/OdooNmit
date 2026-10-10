import { useState, useEffect, useCallback, useMemo } from 'react';
import { VolunteerExpenseClaim } from '../types/volunteer.types';
import { volunteerApi } from '../services/volunteerApi';

export function useVolunteerExpenses() {
  const [expenses, setExpenses] = useState<VolunteerExpenseClaim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await volunteerApi.getExpenses();
      setExpenses(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load expense claims';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const submitExpense = useCallback(
    async (formData: Omit<VolunteerExpenseClaim, 'id' | 'status'>) => {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const newClaim = await volunteerApi.submitExpense(formData);
        setExpenses((prev) => [newClaim, ...prev]);
        setSuccessMessage(`Expense claim "${formData.title}" submitted successfully for ₹${formData.amount}.`);
        return newClaim;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to submit expense claim';
        setError(message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const stats = useMemo(() => {
    const pendingTotal = expenses
      .filter((e) => e.status === 'PENDING')
      .reduce((sum, e) => sum + e.amount, 0);

    const approvedTotal = expenses
      .filter((e) => e.status === 'APPROVED')
      .reduce((sum, e) => sum + e.amount, 0);

    const reimbursedTotal = expenses
      .filter((e) => e.status === 'REIMBURSED')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      pendingTotal,
      approvedTotal,
      reimbursedTotal,
      totalClaims: expenses.length,
    };
  }, [expenses]);

  return {
    expenses,
    loading,
    submitting,
    error,
    successMessage,
    setSuccessMessage,
    submitExpense,
    refreshExpenses: loadExpenses,
    stats,
  };
}
