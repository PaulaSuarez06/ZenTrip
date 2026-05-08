import { useRef, useEffect, useState } from 'react';
import { Pencil, Trash2, LogOut } from 'lucide-react';
import ConfirmModal from '../../../ui/ConfirmModal';

export default function TripActionsMenu({ isCreator, onEditTrip, onDeleteTrip, onLeaveTrip, onClose }) {
  const [confirmAction, setConfirmAction] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const MenuItem = ({ icon: Icon, label, onClick, danger }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 body-3 text-left hover:bg-neutral-1 transition-colors ${danger ? 'text-feedback-error-strong' : 'text-neutral-6'}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );

  return (
    <>
      <div
        ref={menuRef}
        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-neutral-1 shadow-lg z-40 py-1.5 overflow-hidden"
      >
        {isCreator ? (
          <>
            <MenuItem
              icon={Pencil}
              label="Editar viaje"
              onClick={() => { onClose(); onEditTrip(); }}
            />
            <div className="my-1 border-t border-neutral-1" />
            <MenuItem
              icon={Trash2}
              label="Eliminar viaje"
              danger
              onClick={() => setConfirmAction('delete')}
            />
          </>
        ) : (
          <MenuItem
            icon={LogOut}
            label="Salir del viaje"
            danger
            onClick={() => setConfirmAction('leave')}
          />
        )}
      </div>

      {confirmAction === 'delete' && (
        <ConfirmModal
          title="Eliminar viaje"
          message="¿Seguro que quieres eliminar este viaje? Esta acción no se puede deshacer y se perderán todos los datos."
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          confirmVariant="danger"
          onConfirm={() => { setConfirmAction(null); onDeleteTrip(); }}
          onCancel={() => { setConfirmAction(null); onClose(); }}
        />
      )}

      {confirmAction === 'leave' && (
        <ConfirmModal
          title="Salir del viaje"
          message="¿Seguro que quieres salir de este viaje? No podrás volver a acceder a menos que te inviten de nuevo."
          confirmLabel="Salir"
          cancelLabel="Cancelar"
          confirmVariant="danger"
          onConfirm={() => { setConfirmAction(null); onLeaveTrip(); }}
          onCancel={() => { setConfirmAction(null); onClose(); }}
        />
      )}
    </>
  );
}
