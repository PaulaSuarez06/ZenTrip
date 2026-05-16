import { useState, useMemo } from 'react';
import { Lock, Pencil, AlertCircle, ArrowRight, CheckCircle2, Wallet } from 'lucide-react';
import { setPersonalBudget } from '../../../../../../services/budgetService';
import { getExpenseShare, computeSettlement } from '../utils/budgetUtils';
import { CATEGORIES } from '../AddExpenseModal';
import { fmt, Avatar, ProgressBar } from './BudgetAtoms';
import ExpenseList from './ExpenseList';
import CustomDropdown from './CustomDropdown';

export default function PersonalView({
  trip, members, expenses, payments, myPersonalBudget, currency,
  currentUid, tripId, onAddPersonalExpense, onEditExpense, onDeleteExpense,
}) {
  const [budgetInput,   setBudgetInput]   = useState('');
  const [budgetSaving,  setBudgetSaving]  = useState(false);
  const [budgetMsg,     setBudgetMsg]     = useState(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [filterCat,     setFilterCat]     = useState('all');

  const myExpenses = useMemo(
    () => expenses.filter((e) => e.splitAmong?.includes(currentUid)),
    [expenses, currentUid],
  );

  const myTotal = useMemo(
    () => myExpenses.reduce((s, e) => s + getExpenseShare(e, currentUid), 0),
    [myExpenses, currentUid],
  );

  const overPersonal = myPersonalBudget > 0 && myTotal > myPersonalBudget;

  const { debts } = useMemo(() => computeSettlement(expenses, members, payments), [expenses, members, payments]);
  const myDebts   = debts.filter((d) => d.from === currentUid);
  const owedToMe  = debts.filter((d) => d.to   === currentUid);

  const filtered = useMemo(() => {
    const list = filterCat === 'all' ? [...myExpenses] : myExpenses.filter((e) => e.category === filterCat);
    list.sort((a, b) => {
      if (b.date !== a.date) return b.date > a.date ? 1 : -1;
      return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
    });
    return list;
  }, [myExpenses, filterCat]);

  const handleSaveBudget = async () => {
    const val = Number(budgetInput);
    if (isNaN(val) || val < 0) {
      setBudgetMsg({ type: 'error', text: 'Introduce un valor válido (0 o mayor).' });
      return;
    }
    setBudgetSaving(true);
    setBudgetMsg(null);
    try {
      await setPersonalBudget(trip.id, currentUid, val);
      setBudgetMsg({ type: 'ok', text: 'Presupuesto guardado.' });
      setEditingBudget(false);
    } catch {
      setBudgetMsg({ type: 'error', text: 'No se pudo guardar. Inténtalo de nuevo.' });
    } finally {
      setBudgetSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Mi presupuesto personal */}
      <div className="bg-white border border-neutral-1 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="body-3 text-neutral-4 font-medium uppercase tracking-wide">Mi presupuesto personal</p>
          <Wallet className="w-4 h-4 text-neutral-3" />
        </div>

        {editingBudget || myPersonalBudget === 0 ? (
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="0"
              step="10"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder={myPersonalBudget > 0 ? String(myPersonalBudget) : '0'}
              className="flex-1 border border-neutral-2 rounded-xl px-3 py-2 body-2 focus:outline-none focus:ring-2 focus:ring-primary-3 transition"
            />
            <button
              type="button"
              onClick={handleSaveBudget}
              disabled={budgetSaving}
              className="px-4 py-2 rounded-xl bg-primary-3 text-white body-3 font-semibold hover:bg-primary-4 transition-colors disabled:opacity-60"
            >
              {budgetSaving ? '...' : 'Guardar'}
            </button>
            {myPersonalBudget > 0 && (
              <button
                type="button"
                onClick={() => setEditingBudget(false)}
                className="px-3 py-2 rounded-xl border border-neutral-2 body-3 text-neutral-5 hover:bg-neutral-1 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="title-h2-desktop text-neutral-7">{fmt(myPersonalBudget, currency)}</p>
            <button
              type="button"
              onClick={() => { setBudgetInput(String(myPersonalBudget)); setEditingBudget(true); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-2 body-3 text-neutral-5 hover:bg-neutral-1 transition-colors"
            >
              <Pencil className="w-3 h-3" />Editar
            </button>
          </div>
        )}

        {budgetMsg && (
          <p className={`body-3 flex items-center gap-1 ${budgetMsg.type === 'ok' ? 'text-auxiliary-green-5' : 'text-feedback-error'}`}>
            <AlertCircle className="w-3 h-3 shrink-0" />{budgetMsg.text}
          </p>
        )}

        {myPersonalBudget > 0 && (
          <>
            <ProgressBar value={myTotal} max={myPersonalBudget} warn={overPersonal} />
            <p className="body-3 text-neutral-4">
              Tu parte acumulada:{' '}
              <span className={`font-semibold ${overPersonal ? 'text-feedback-error' : 'text-neutral-7'}`}>
                {fmt(myTotal, currency)}
              </span>
              {' '}/ {fmt(myPersonalBudget, currency)}
              {overPersonal && <span className="ml-2 text-feedback-error font-medium">— Presupuesto superado</span>}
            </p>
          </>
        )}
        {myPersonalBudget === 0 && myTotal > 0 && (
          <p className="body-3 text-neutral-4">
            Tu parte acumulada: <span className="font-semibold text-neutral-7">{fmt(myTotal, currency)}</span>
          </p>
        )}
      </div>

      {/* Mis liquidaciones (privado) */}
      <div className="bg-white border border-neutral-1 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-neutral-3" />
          <div className="flex-1">
            <p className="body-3 text-neutral-4 font-medium uppercase tracking-wide">Mis pagos pendientes</p>
            <p className="body-3 text-neutral-3 mt-0.5">Solo tú puedes ver esto</p>
          </div>
        </div>

        {myDebts.length === 0 && owedToMe.length === 0 ? (
          <div className="flex items-center gap-2 bg-auxiliary-green-1 rounded-xl px-3 py-2">
            <CheckCircle2 className="w-4 h-4 text-auxiliary-green-5 shrink-0" />
            <p className="body-3 text-auxiliary-green-5 font-medium">Estás al día, no debes nada ni te deben.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {myDebts.map((d, i) => {
              const to = members.find((m) => m.uid === d.to);
              return (
                <div key={`d-${i}`} className="flex items-center gap-2 bg-feedback-error-bg border border-feedback-error rounded-xl px-3 py-2.5">
                  <ArrowRight className="w-4 h-4 text-feedback-error shrink-0" />
                  <span className="body-3 text-neutral-7 flex-1 flex items-center gap-1.5 flex-wrap">
                    <span className="shrink-0">Debes pagar</span>
                    <span className="font-semibold text-feedback-error shrink-0">{fmt(d.amount, currency)}</span>
                    <span className="shrink-0">a</span>
                    <Avatar member={to} size="sm" />
                    <span className="font-semibold shrink-0">{to?.name ?? '?'}</span>
                  </span>
                </div>
              );
            })}
            {owedToMe.map((d, i) => {
              const from = members.find((m) => m.uid === d.from);
              return (
                <div key={`o-${i}`} className="flex items-center gap-2 bg-auxiliary-green-1 border border-auxiliary-green-3 rounded-xl px-3 py-2.5">
                  <ArrowRight className="w-4 h-4 text-auxiliary-green-5 shrink-0 rotate-180" />
                  <span className="body-3 text-neutral-7 flex-1 flex items-center gap-1.5 flex-wrap">
                    <Avatar member={from} size="sm" />
                    <span className="font-semibold shrink-0">{from?.name ?? '?'}</span>
                    <span className="shrink-0">te debe</span>
                    <span className="font-semibold text-auxiliary-green-5 shrink-0">{fmt(d.amount, currency)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mis gastos */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <p className="body-3 text-neutral-4 font-medium uppercase tracking-wide shrink-0">Mis gastos</p>
          <CustomDropdown
            className="w-full sm:w-64 max-w-xs"
            value={filterCat}
            onChange={setFilterCat}
            placeholder="Todas las categorías"
            options={CATEGORIES.map((c) => ({ value: c.key, label: c.label }))}
          />
        </div>

        <ExpenseList
          expenses={filtered}
          members={members}
          currentUid={currentUid}
          tripCurrency={currency}
          onEdit={onEditExpense}
          onDelete={onDeleteExpense}
          highlightShare
          emptyText={myExpenses.length === 0 ? 'No participas en ningún gasto todavía.' : 'No hay gastos con esa categoría.'}
        />
      </div>
    </div>
  );
}
