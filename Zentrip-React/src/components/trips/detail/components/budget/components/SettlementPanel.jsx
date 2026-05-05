import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { addPayment } from '../../../../../../services/budgetService';
import ConfirmModal from '../../../../../ui/ConfirmModal';
import { Avatar, fmt } from './BudgetAtoms';

export default function SettlementPanel({ debts, members, tripId, currency, currentUid, showAll = true }) {
  const [marking,     setMarking]     = useState(null);
  const [confirmDebt, setConfirmDebt] = useState(null);

  const handleMarkPaid = async () => {
    if (!confirmDebt) return;
    const key = `${confirmDebt.from}-${confirmDebt.to}`;
    setMarking(key);
    setConfirmDebt(null);
    try {
      await addPayment(tripId, {
        from:   confirmDebt.from,
        to:     confirmDebt.to,
        amount: confirmDebt.amount,
        date:   new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('[SettlementPanel] Error al marcar como pagado:', err);
    } finally {
      setMarking(null);
    }
  };

  const visibleDebts = showAll ? debts : debts.filter((d) => d.from === currentUid || d.to === currentUid);

  if (visibleDebts.length === 0) {
    return (
      <div className="flex items-center gap-2 bg-auxiliary-green-1 rounded-xl px-3 py-3">
        <CheckCircle2 className="w-4 h-4 text-auxiliary-green-5 shrink-0" />
        <p className="body-3 text-auxiliary-green-5 font-medium">Todo está al día, no hay pagos pendientes.</p>
      </div>
    );
  }

  return (
    <>
      {confirmDebt && (() => {
        const fromName = members.find((m) => m.uid === confirmDebt.from)?.name ?? '?';
        const toName   = members.find((m) => m.uid === confirmDebt.to)?.name   ?? '?';
        return (
          <ConfirmModal
            title="Confirmar pago"
            message={`¿Confirmas que ${fromName} ha pagado ${fmt(confirmDebt.amount, currency)} a ${toName}? Este pago se eliminará de los pendientes.`}
            confirmLabel="Marcar como pagado"
            cancelLabel="Cancelar"
            onConfirm={handleMarkPaid}
            onCancel={() => setConfirmDebt(null)}
          />
        );
      })()}
      <div className="flex flex-col gap-2">
        {visibleDebts.map((d, i) => {
          const from    = members.find((m) => m.uid === d.from);
          const to      = members.find((m) => m.uid === d.to);
          const isMe    = d.from === currentUid;
          const canMark = d.from === currentUid || d.to === currentUid;
          const key     = `${d.from}-${d.to}`;
          const busy    = marking === key;

          return (
            <div
              key={i}
              className={`flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl px-3 py-3 border ${
                isMe ? 'bg-feedback-error-bg border-feedback-error' : 'bg-secondary-1 border-secondary-2'
              }`}
            >
              <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                <span className="hidden sm:inline-flex shrink-0"><Avatar member={from} size="sm" /></span>
                <span className="body-3 font-semibold text-neutral-7 shrink-0">{from?.name ?? '?'}</span>
                <span className="body-3 text-neutral-5 shrink-0">debe pagar</span>
                <span className={`sm:hidden body-2 font-bold shrink-0 ${isMe ? 'text-feedback-error' : 'text-neutral-7'}`}>
                  {fmt(d.amount, currency)}
                </span>
                <span className="body-3 text-neutral-5 shrink-0">a</span>
                <span className="hidden sm:inline-flex shrink-0"><Avatar member={to} size="sm" /></span>
                <span className="body-3 font-semibold text-neutral-7 shrink-0">{to?.name ?? '?'}</span>
              </div>
              <div className="flex items-center justify-end sm:shrink-0 gap-2">
                <span className={`hidden sm:inline body-2 font-bold shrink-0 ${isMe ? 'text-feedback-error' : 'text-neutral-7'}`}>
                  {fmt(d.amount, currency)}
                </span>
                {canMark && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmDebt(d)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-full body-3 font-medium bg-auxiliary-green-5 text-white hover:bg-auxiliary-green-5 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {busy ? '...' : 'Marcar como pagado'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
