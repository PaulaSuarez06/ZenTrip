import { useEffect, useState } from 'react';
import {
  subscribeToExpenses,
  subscribeToAllPersonalBudgets,
  subscribeToPayments,
} from '../../../../../services/budgetService';

export { getExpenseShare, computeSettlement, computeCategoryTotals } from './utils/budgetUtils';

export function useBudget(tripId, uid) {
  const [expenses,           setExpenses]           = useState([]);
  const [payments,           setPayments]           = useState([]);
  const [allPersonalBudgets, setAllPersonalBudgets] = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [error,              setError]              = useState(null);

  useEffect(() => {
    if (!tripId) return;
    setLoading(true);
    setError(null);

    const unsub1 = subscribeToExpenses(
      tripId,
      (data) => { setExpenses(data); setLoading(false); },
      (err) => { setError(err.message); setLoading(false); },
    );
    const unsub2 = subscribeToAllPersonalBudgets(
      tripId,
      (data) => setAllPersonalBudgets(data),
      (err) => console.error('[useBudget] allPersonalBudgets:', err),
    );
    const unsub3 = subscribeToPayments(
      tripId,
      (data) => setPayments(data),
      (err) => console.error('[useBudget] payments:', err),
    );

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [tripId, uid]);

  const myPersonalBudget = allPersonalBudgets.find((b) => b.uid === uid)?.budget ?? 0;

  return { expenses, payments, myPersonalBudget, allPersonalBudgets, loading, error };
}
