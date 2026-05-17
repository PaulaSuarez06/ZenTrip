import { useState, useMemo } from 'react';
import { AlertCircle, Plus, Users, Wallet } from 'lucide-react';
import { useBudget } from '../budget/useBudget';
import {
  addExpense, updateExpense, deleteExpense, sendExpenseNotifications,
} from '../../../../../services/budgetService';
import { updateActivity } from '../../../../../services/tripService';
import AddExpenseModal from '../budget/AddExpenseModal';
import ConfirmModal from '../../../../ui/ConfirmModal';
import GroupView from '../budget/components/GroupView';
import PersonalView from '../budget/components/PersonalView';
import { useMemberProfiles } from '../../../../../hooks/useMemberProfiles';

export default function BudgetTab({ tripId, trip, members = [], currentUser }) {
  const currentUid = currentUser?.uid;
  const { expenses, payments, myPersonalBudget, allPersonalBudgets, loading, error } = useBudget(tripId, currentUid);

  const memberUids = useMemo(() => members.map((m) => m.uid).filter(Boolean), [members]);
  const memberProfiles = useMemberProfiles(memberUids);

  const enrichedMembers = useMemo(() =>
    members.map((m) => ({
      ...m,
      avatar:      memberProfiles[m.uid]?.profilePhoto || m.avatar || '',
      avatarColor: memberProfiles[m.uid]?.avatarColor  || m.avatarColor || '',
    })),
  [members, memberProfiles]);

  const groupExpenses = useMemo(() => expenses.filter((e) => !e.isPersonal), [expenses]);

  const [view,         setView]         = useState('group');
  const [expenseModal, setExpenseModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError,  setDeleteError]  = useState(null);

  const currency = trip?.currency || 'EUR';

  const handleSaveExpense = async (data) => {
    if (expenseModal?.mode === 'edit') {
      await updateExpense(tripId, expenseModal.expense.id, data);
      const linkedActivityId = expenseModal.expense.linkedActivityId;
      if (linkedActivityId) {
        updateActivity(tripId, linkedActivityId, {
          price: data.amount,
          priceCurrency: data.currency,
        }).catch(() => {});
      }
    } else {
      await addExpense(tripId, { ...data, createdBy: currentUid });
      if (!data.isPersonal && data.splitAmong?.length > 0) {
        sendExpenseNotifications(tripId, {
          creatorUid:         currentUid,
          creatorName:        currentUser?.displayName || currentUser?.name || 'Un miembro',
          expenseDescription: data.description,
          amount:             data.amount,
          currency:           data.currency,
          splitAmong:         data.splitAmong,
          tripName:           trip?.name || '',
        }).catch(() => {});
      }
    }
    setExpenseModal(null);
  };

  const handleConfirmDelete = async () => {
    setDeleteError(null);
    try {
      await deleteExpense(tripId, deleteTarget.id);
      const linkedActivityId = deleteTarget.linkedActivityId;
      if (linkedActivityId) {
        updateActivity(tripId, linkedActivityId, { price: null, priceCurrency: null }).catch(() => {});
      }
      setDeleteTarget(null);
    } catch {
      setDeleteError('No se pudo eliminar el gasto. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-primary-3 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-feedback-error-bg border border-feedback-error rounded-2xl px-4 py-3">
        <AlertCircle className="w-5 h-5 text-feedback-error shrink-0" />
        <p className="body-3 text-feedback-error">No se pudo cargar el presupuesto: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {expenseModal && (
        <AddExpenseModal
          members={enrichedMembers}
          currentUser={currentUser}
          trip={trip}
          tripCurrency={currency}
          initialExpense={expenseModal.mode === 'edit' ? expenseModal.expense : null}
          personalMode={expenseModal.personal === true}
          onSave={handleSaveExpense}
          onClose={() => setExpenseModal(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar gasto"
          message={`¿Seguro que quieres eliminar "${deleteTarget.description}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          confirmVariant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
        />
      )}

      {deleteError && (
        <div className="flex items-center gap-2 bg-feedback-error-bg border border-feedback-error rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 text-feedback-error shrink-0" />
          <p className="body-3 text-feedback-error">{deleteError}</p>
        </div>
      )}

      {/* Toggle Grupo / Personal */}
      <div className="bg-white border border-neutral-1 rounded-2xl flex p-1 gap-1">
        {[
          { key: 'group',    label: 'Grupo',    Icon: Users  },
          { key: 'personal', label: 'Personal', Icon: Wallet },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl body-3 font-semibold transition-colors ${
              view === key ? 'bg-primary-3 text-white shadow-sm' : 'text-neutral-4 hover:text-neutral-6 hover:bg-neutral-1'
            }`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Título + botón */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="title-h3-desktop text-neutral-7">
            {view === 'group' ? 'Gastos del grupo' : 'Mis gastos'}
          </h2>
          <p className="body-3 text-neutral-4 mt-0.5">
            {view === 'group'
              ? 'Gestiona y divide los gastos del viaje entre todos'
              : 'Controla tu parte del presupuesto del viaje'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => view === 'group'
            ? setExpenseModal({ mode: 'add', personal: false })
            : setExpenseModal({ mode: 'add', personal: true })
          }
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-3 text-white body-3 font-semibold hover:bg-primary-4 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          {view === 'group' ? 'Añadir gasto' : 'Añadir mi gasto'}
        </button>
      </div>

      {view === 'group' ? (
        <GroupView
          trip={trip}
          members={enrichedMembers}
          expenses={groupExpenses}
          payments={payments}
          currency={currency}
          currentUid={currentUid}
          tripId={tripId}
          allPersonalBudgets={allPersonalBudgets}
          onAddExpense={() => setExpenseModal({ mode: 'add', personal: false })}
          onEditExpense={(exp) => setExpenseModal({ mode: 'edit', expense: exp, personal: false })}
          onDeleteExpense={setDeleteTarget}
        />
      ) : (
        <PersonalView
          trip={trip}
          members={enrichedMembers}
          expenses={expenses}
          payments={payments}
          myPersonalBudget={myPersonalBudget}
          currency={currency}
          currentUid={currentUid}
          tripId={tripId}
          onAddPersonalExpense={() => setExpenseModal({ mode: 'add', personal: true })}
          onEditExpense={(exp) => setExpenseModal({ mode: 'edit', expense: exp, personal: false })}
          onDeleteExpense={setDeleteTarget}
        />
      )}
    </div>
  );
}
