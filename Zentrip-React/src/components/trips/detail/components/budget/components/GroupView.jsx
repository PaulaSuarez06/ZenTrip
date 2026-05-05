import { useState, useMemo } from 'react';
import { Plus, TrendingUp, Users } from 'lucide-react';
import { computeSettlement, computeCategoryTotals } from '../utils/budgetUtils';
import { CATEGORIES } from '../AddExpenseModal';
import { getCatMeta, fmt, Avatar, ProgressBar } from './BudgetAtoms';
import ExpenseList from './ExpenseList';
import SettlementPanel from './SettlementPanel';

export default function GroupView({
  trip, members, expenses, payments, currency, currentUid,
  tripId, allPersonalBudgets, onAddExpense, onEditExpense, onDeleteExpense,
}) {
  const [filterCat,    setFilterCat]    = useState('all');
  const [filterMember, setFilterMember] = useState('all');

  const totalBudget = allPersonalBudgets.reduce((s, b) => s + (b.budget ?? 0), 0);
  const totalSpent  = expenses.reduce((s, e) => s + (e.tripAmount ?? e.amount ?? 0), 0);
  const overBudget  = totalBudget > 0 && totalSpent > totalBudget;

  const categoryTotals      = useMemo(() => computeCategoryTotals(expenses), [expenses]);
  const { balances, debts } = useMemo(() => computeSettlement(expenses, members, payments), [expenses, members, payments]);
  const maxCat              = Math.max(...Object.values(categoryTotals), 1);

  const filtered = useMemo(() => {
    let list = [...expenses];
    if (filterCat    !== 'all') list = list.filter((e) => e.category === filterCat);
    if (filterMember !== 'all') list = list.filter((e) => e.paidBy   === filterMember);
    list.sort((a, b) => {
      if (b.date !== a.date) return b.date > a.date ? 1 : -1;
      return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
    });
    return list;
  }, [expenses, filterCat, filterMember]);

  const activeCategories = CATEGORIES.filter(({ key }) => (categoryTotals[key] ?? 0) > 0);

  return (
    <div className="flex flex-col gap-4">

      {/* Resumen presupuesto */}
      <div className="bg-white border border-neutral-1 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="body-3 text-neutral-4 font-medium uppercase tracking-wide">Presupuesto del grupo</p>
            <p className="body-3 text-neutral-3 mt-0.5">Suma de los presupuestos personales de cada miembro</p>
          </div>
          <TrendingUp className="w-4 h-4 text-neutral-3 shrink-0 mt-0.5" />
        </div>
        <p className="title-h2-desktop text-neutral-7">
          {totalBudget > 0
            ? fmt(totalBudget, currency)
            : <span className="body text-neutral-3">Los miembros aún no han definido su presupuesto personal</span>}
        </p>
        {totalBudget > 0 && (
          <>
            <ProgressBar value={totalSpent} max={totalBudget} warn={overBudget} />
            <p className="body-3 text-neutral-4">
              Gastado:{' '}
              <span className={`font-semibold ${overBudget ? 'text-feedback-error' : 'text-neutral-7'}`}>
                {fmt(totalSpent, currency)}
              </span>
              {' '}({Math.round((totalSpent / totalBudget) * 100)} %)
              {overBudget && <span className="ml-2 text-feedback-error font-medium">— Presupuesto superado</span>}
            </p>
          </>
        )}
        {totalBudget === 0 && (
          <p className="body-3 text-neutral-4">
            Total gastado: <span className="font-semibold text-neutral-7">{fmt(totalSpent, currency)}</span>
          </p>
        )}
      </div>

      {/* Botón añadir gasto */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAddExpense}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary-3 text-white body-2 font-semibold hover:bg-primary-4 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />Añadir gasto
        </button>
      </div>

      {/* Balance de miembros + Categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Balance de miembros */}
        <div className="bg-white border border-neutral-1 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="body-3 text-neutral-4 font-medium uppercase tracking-wide">Balance de miembros</p>
              <p className="body-3 text-neutral-3 mt-0.5">Verde: le deben · Rojo: debe dinero</p>
            </div>
            <Users className="w-4 h-4 text-neutral-3" />
          </div>
          {members.length === 0 ? (
            <p className="body-3 text-neutral-4">Sin miembros</p>
          ) : (
            <div className="flex flex-col gap-2">
              {members.map((m) => {
                const bal = balances[m.uid] ?? 0;
                const pos = bal > 0.005;
                const neg = bal < -0.005;
                return (
                  <div key={m.uid} className="flex items-center gap-2">
                    <Avatar member={m} size="sm" />
                    <span className="body-3 text-neutral-6 flex-1 truncate">{m.name}</span>
                    <span className={`body-3 font-semibold ${pos ? 'text-auxiliary-green-5' : neg ? 'text-feedback-error' : 'text-neutral-4'}`}>
                      {pos ? '+' : ''}{fmt((pos || neg) ? bal : 0, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gastos por categoría */}
        <div className="bg-white border border-neutral-1 rounded-2xl p-4 flex flex-col gap-3">
          <p className="body-3 text-neutral-4 font-medium uppercase tracking-wide">Gastos por categoría</p>
          {activeCategories.length === 0 ? (
            <p className="body-3 text-neutral-4">Aún no hay gastos registrados.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {activeCategories.map(({ key, label }) => {
                const meta     = getCatMeta(key);
                const { Icon } = meta;
                const amount   = categoryTotals[key] ?? 0;
                const pct      = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(0) : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${meta.badge}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="body-3 text-neutral-6">{label}</span>
                        <span className="body-3 font-semibold text-neutral-7">{fmt(amount, currency)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-1 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${Math.max((amount / maxCat) * 100, 2)}%` }} />
                      </div>
                    </div>
                    <span className="body-3 text-neutral-4 w-8 text-right shrink-0">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pagos pendientes */}
      <div className="bg-white border border-neutral-1 rounded-2xl p-4 flex flex-col gap-3">
        <div>
          <p className="body-3 text-neutral-4 font-medium uppercase tracking-wide">Pagos pendientes</p>
          <p className="body-3 text-neutral-3 mt-0.5">Cómo saldar las deudas del grupo con el mínimo de transferencias</p>
        </div>
        <SettlementPanel
          debts={debts}
          members={members}
          tripId={tripId}
          currency={currency}
          currentUid={currentUid}
          showAll
        />
      </div>

      {/* Filtros + lista de gastos */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <p className="body-3 text-neutral-4 font-medium uppercase tracking-wide mr-1">Filtrar</p>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="w-full sm:w-auto cursor-pointer border border-neutral-2 rounded-full px-4 py-1.5 body-3 font-medium text-neutral-6 bg-neutral-1 hover:bg-neutral-2 focus:outline-none focus:ring-2 focus:ring-primary-3 transition-colors"
          >
            <option value="all">Todas las categorías</option>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="w-full sm:w-auto cursor-pointer border border-neutral-2 rounded-full px-4 py-1.5 body-3 font-medium text-neutral-6 bg-neutral-1 hover:bg-neutral-2 focus:outline-none focus:ring-2 focus:ring-primary-3 transition-colors"
          >
            <option value="all">Cualquier pagador</option>
            {members.map((m) => <option key={m.uid} value={m.uid}>Pagó {m.name}</option>)}
          </select>
          {(filterCat !== 'all' || filterMember !== 'all') && (
            <button
              type="button"
              onClick={() => { setFilterCat('all'); setFilterMember('all'); }}
              className="px-3 py-1 rounded-full body-3 text-primary-3 border border-primary-2 hover:bg-primary-1 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <ExpenseList
          expenses={filtered}
          members={members}
          currentUid={currentUid}
          tripCurrency={currency}
          onEdit={onEditExpense}
          onDelete={onDeleteExpense}
          highlightShare={false}
          emptyText={expenses.length === 0 ? 'Aún no hay gastos registrados.' : 'No hay gastos con esos filtros.'}
        />
      </div>
    </div>
  );
}
