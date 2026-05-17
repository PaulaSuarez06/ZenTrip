import { Check, X } from 'lucide-react';
import UserAvatar from '../../ui/UserAvatar';

export default function PendingRequests({ pendingRequests, onSelect, onAccept, onReject }) {
  return (
    <div className="px-3 pb-2 shrink-0 border-b border-neutral-1">
      <p className="text-[11px] font-semibold text-neutral-4 uppercase tracking-wide px-1 mb-1.5 mt-1">
        Solicitudes ({pendingRequests.length})
      </p>
      {pendingRequests.map((req) => (
        <div key={req.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-secondary-1 mb-1">
          <button
            type="button"
            onClick={() => onSelect({
              type: 'request',
              id: req.id,
              name: req.fromDisplayName,
              fromUid: req.fromUid,
              message: req.message,
              otherUser: { displayName: req.fromDisplayName, profilePhoto: req.fromProfilePhoto || '', avatarColor: '' },
            })}
            className="flex items-center gap-2.5 flex-1 min-w-0 text-left hover:opacity-70 transition-opacity"
          >
            <UserAvatar
              src={req.fromProfilePhoto}
              fullName={req.fromDisplayName}
              sizeClass="w-8 h-8"
              initialsClass="text-[10px] text-white font-bold"
              backgroundClass="bg-neutral-3"
              containerClass="shrink-0"
            />
            <div className="min-w-0">
              <p className="body-3 font-semibold text-secondary-5 truncate">{req.fromDisplayName}</p>
              <p className="text-[11px] text-neutral-4 truncate">{req.message || 'Quiere chatear contigo'}</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onAccept(req.id, req.fromUid, req.fromDisplayName, req.message)}
            className="w-7 h-7 rounded-full bg-primary-3 text-white flex items-center justify-center hover:bg-primary-4 transition-colors shrink-0"
            title="Aceptar"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onReject(req.id)}
            className="w-7 h-7 rounded-full bg-neutral-2 text-neutral-5 flex items-center justify-center hover:bg-neutral-3 transition-colors shrink-0"
            title="Rechazar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
