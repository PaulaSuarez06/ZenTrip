export default function BlockConfirmModal({ name, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-1">
          <p className="body-2-semibold text-neutral-7">¿Bloquear a {name}?</p>
          <p className="body-3 text-neutral-4">Esta acción hará lo siguiente:</p>
        </div>
        <ul className="flex flex-col gap-2">
          {[
            'No podrá enviarte nuevas solicitudes de chat.',
            'No podrás enviarle mensajes mientras esté bloqueado.',
            'Los mensajes anteriores no se eliminarán.',
            'Puedes desbloquearlo en cualquier momento desde este mismo chat.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-neutral-3 shrink-0" />
              <span className="body-3 text-neutral-5">{item}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full border border-neutral-2 body-3 font-semibold text-neutral-5 hover:bg-neutral-1 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-full bg-red-500 text-white body-3 font-semibold hover:bg-red-600 transition-colors"
          >
            Bloquear
          </button>
        </div>
      </div>
    </div>
  );
}
