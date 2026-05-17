import { Send } from 'lucide-react';
import UserAvatar from '../../ui/UserAvatar';

export default function PeopleSearch({
  suggestedUsers,
  loadingSuggestions,
  filtered,
  expandedUid,
  draftMsg,
  setDraftMsg,
  MSG_MAX,
  blockedByMe,
  suggestedStatuses,
  getSuggestedBtn,
  isExpanded,
  onAction,
  onSend,
  onSetExpanded,
}) {
  return (
    <>
      <p className="text-[11px] font-semibold text-neutral-4 uppercase tracking-wide px-4 pt-3 pb-1.5">
        Personas
      </p>
      {loadingSuggestions && (
        <p className="px-4 py-3 body-3 text-neutral-3">Buscando...</p>
      )}
      {!loadingSuggestions && suggestedUsers.length === 0 && filtered.length === 0 && (
        <p className="px-4 py-3 body-3 text-neutral-3">Sin resultados</p>
      )}
      {!loadingSuggestions && suggestedUsers.length === 0 && filtered.length > 0 && (
        <p className="px-4 py-3 body-3 text-neutral-3">No se encontraron más usuarios</p>
      )}
      {suggestedUsers.map((u) => {
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Usuario';
        const btn = getSuggestedBtn(u.uid);
        const expanded = isExpanded(u.uid);
        return (
          <div key={u.uid} className="rounded-xl overflow-hidden mx-2 mb-0.5">
            <div className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${expanded ? 'bg-neutral-1' : 'hover:bg-neutral-1'}`}>
              <UserAvatar
                src={u.profilePhoto}
                backgroundColor={u.avatarColor}
                fullName={name}
                sizeClass="w-10 h-10"
                initialsClass="body-3 text-white font-bold"
                backgroundClass="bg-neutral-3"
                containerClass="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="body-3 font-semibold text-neutral-7 truncate">{name}</p>
                {u.username && <p className="text-[11px] text-neutral-3">@{u.username}</p>}
              </div>
              {expanded ? (
                <button
                  type="button"
                  onClick={() => onSetExpanded(null)}
                  className="px-3 py-1 rounded-full text-[12px] font-medium bg-neutral-2 text-neutral-5 hover:bg-neutral-3 transition-colors shrink-0"
                >
                  Cancelar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onAction(u)}
                  disabled={btn.disabled}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors shrink-0 ${btn.cls}`}
                >
                  {btn.label}
                </button>
              )}
            </div>
            {expanded && (
              <div className="px-3 pb-3 bg-neutral-1">
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-neutral-2">
                  <input
                    autoFocus
                    type="text"
                    value={draftMsg}
                    onChange={(e) => setDraftMsg(e.target.value.slice(0, MSG_MAX))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSend(u, draftMsg);
                      if (e.key === 'Escape') onSetExpanded(null);
                    }}
                    placeholder="Mensaje opcional..."
                    maxLength={MSG_MAX}
                    className="flex-1 text-sm text-neutral-7 placeholder:text-neutral-3 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => onSend(u, draftMsg)}
                    className="w-7 h-7 rounded-full bg-primary-3 text-white flex items-center justify-center shrink-0 hover:bg-primary-4 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1.5 px-1">
                  <p className="text-[10px] text-neutral-3">Puedes enviar sin escribir nada</p>
                  {draftMsg.length > 0 && (
                    <p className={`text-[10px] ${draftMsg.length >= MSG_MAX ? 'text-red-400' : 'text-neutral-3'}`}>
                      {draftMsg.length}/{MSG_MAX}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
