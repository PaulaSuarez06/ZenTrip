import { useMemo } from 'react';
import { Wallet } from 'lucide-react';
import ExpenseCard from './ExpenseCard';
import { fmtDateLabel } from './BudgetAtoms';

export default function ExpenseList({ expenses, members, currentUid, tripCurrency, onEdit, onDelete, highlightShare = false, emptyText }) {
  const grouped = useMemo(() => {
    const map = {};
    expenses.forEach((exp) => {
      const k = exp.date ?? '';
      if (!map[k]) map[k] = [];
      map[k].push(exp);
    });
    return Object.entries(map)
      .sort(([a], [b]) => (b > a ? 1 : -1))
      .map(([date, items]) => ({ date, items }));
  }, [expenses]);

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-neutral-1 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-neutral-3" />
        </div>
        <p className="body-2 text-neutral-4">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {grouped.map(({ date, items }) => (
        <div key={date}>
          <p className="body-3 text-neutral-4 font-semibold uppercase tracking-wide px-1 mb-2">
            {fmtDateLabel(date)}
          </p>
          <div className="flex flex-col gap-2">
            {items.map((exp) => (
              <ExpenseCard
                key={exp.id}
                expense={exp}
                members={members}
                currentUid={currentUid}
                tripCurrency={tripCurrency}
                onEdit={onEdit}
                onDelete={onDelete}
                highlightShare={highlightShare}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
