import { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { getExpenseShare } from '../utils/budgetUtils';
import { getCatMeta, getCatLabel, fmt, fmtDateLabel, DetailRow } from './BudgetAtoms';

export default function ExpenseCard({ expense, members, currentUid, tripCurrency, onEdit, onDelete, highlightShare = false }) {
  const [open, setOpen] = useState(false);
  const meta       = getCatMeta(expense.category);
  const { Icon }   = meta;
  const payer      = members.find((m) => m.uid === expense.paidBy);
  const myShare    = getExpenseShare(expense, currentUid);
  const splitNames = (expense.splitAmong ?? [])
    .map((uid) => members.find((m) => m.uid === uid)?.name ?? uid)
    .join(', ');
  const tc   = tripCurrency || expense.currency;
  const diff = expense.tripAmount != null && expense.currency !== tc;

  return (
    <div className="bg-white border border-neutral-1 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-1/40 transition-colors"
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.badge}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="body-2 font-semibold text-neutral-7 truncate">{expense.description}</p>
          <p className="body-3 text-neutral-4">
            {fmtDateLabel(expense.date)} · Pagó {payer?.name ?? expense.paidByName ?? '?'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {highlightShare && myShare > 0 ? (
            <div className="text-right">
              <p className="body-2 font-semibold text-primary-3">{fmt(myShare, tc)}</p>
              <p className="body-3 text-neutral-4">tu parte</p>
            </div>
          ) : (
            <div className="text-right">
              <p className="body-2 font-semibold text-neutral-7">{fmt(expense.amount, expense.currency)}</p>
              {diff && <p className="body-3 text-neutral-4">≈ {fmt(expense.tripAmount, tc)}</p>}
            </div>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-neutral-4" /> : <ChevronDown className="w-4 h-4 text-neutral-4" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-neutral-1 pt-3 flex flex-col gap-2">
          <DetailRow label="Categoría">
            <span className={`px-2 py-0.5 rounded-full body-3 font-medium border ${meta.badge}`}>
              {getCatLabel(expense)}
            </span>
          </DetailRow>
          {highlightShare && (
            <DetailRow label="Total del gasto">
              <span className="body-3 font-semibold text-neutral-7">
                {fmt(expense.amount, expense.currency)}
                {diff && <span className="ml-1 text-neutral-4 font-normal">(≈ {fmt(expense.tripAmount, tc)})</span>}
              </span>
            </DetailRow>
          )}
          <DetailRow label="Entre">
            <span className="body-3 text-neutral-6 text-right max-w-45">{splitNames || '—'}</span>
          </DetailRow>
          <DetailRow label={`División (${expense.splitAmong?.length ?? 1} personas)`}>
            <span className="body-3 text-neutral-6">
              {expense.splitType === 'equal' && (() => {
                const base = expense.tripAmount ?? expense.amount;
                const cur  = diff ? tc : expense.currency;
                return `${fmt(base / (expense.splitAmong?.length || 1), cur)} c/u`;
              })()}
              {expense.splitType === 'percentage' && 'Por porcentaje'}
              {expense.splitType === 'amounts'    && 'Por importes'}
            </span>
          </DetailRow>
          {currentUid && expense.splitAmong?.includes(currentUid) && (
            <DetailRow label="Tu parte">
              <span className="body-3 font-semibold text-primary-3">
                {fmt(myShare, tc)}
                {diff && myShare > 0 && (
                  <span className="ml-1 body-3 font-normal text-neutral-4">
                    (≈ {fmt(myShare / (expense.exchangeRate ?? 1), expense.currency)})
                  </span>
                )}
              </span>
            </DetailRow>
          )}
          {expense.notes && (
            <DetailRow label="Notas">
              <span className="body-3 text-neutral-5 text-right max-w-45">{expense.notes}</span>
            </DetailRow>
          )}
          {expense.receiptUrls?.length > 0 && (
            <div>
              <p className="body-3 text-neutral-4 mb-1.5">Comprobantes</p>
              <div className="flex flex-wrap gap-2">
                {expense.receiptUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ width: 64, height: 64, flexShrink: 0 }}
                    className="rounded-lg overflow-hidden border border-neutral-2 bg-neutral-1 block"
                  >
                    <img src={url} alt={`Comprobante ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => onEdit(expense)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-2 body-3 text-neutral-5 hover:bg-neutral-1 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(expense)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-feedback-error body-3 text-feedback-error hover:bg-feedback-error-bg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
