import UserAvatar from '../../ui/UserAvatar';

export default function ChatRequestView({ chat, onAccept, onReject }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="px-5 py-3.5 border-b border-neutral-1 flex items-center gap-3 shrink-0 bg-white">
        <UserAvatar
          src={chat.otherUser?.profilePhoto}
          backgroundColor={chat.otherUser?.avatarColor}
          fullName={chat.name}
          sizeClass="w-9 h-9"
          initialsClass="text-xs text-white font-bold"
          backgroundClass="bg-neutral-3"
        />
        <div className="min-w-0">
          <p className="body-3 font-semibold text-secondary-5 truncate">{chat.name}</p>
          <p className="text-[11px] text-neutral-3">Solicitud de chat</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 flex flex-col items-start justify-end p-4 gap-2">
        {chat.message ? (
          <div className="max-w-[75%] bg-neutral-1 rounded-2xl rounded-tl-sm px-4 py-2.5">
            <p className="body-3 text-neutral-7 wrap-break-word">{chat.message}</p>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center py-8">
            <p className="body-3 text-neutral-4">Ha enviado una solicitud de chat</p>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-1 px-4 py-3 flex flex-col gap-2.5 shrink-0 bg-white">
        <p className="text-center text-[11px] text-neutral-3">Acepta la solicitud para poder responder</p>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={onReject}
            className="px-8 py-2 rounded-full border border-neutral-2 body-3 font-semibold text-neutral-5 hover:bg-neutral-1 transition-colors"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="px-8 py-2 rounded-full bg-primary-3 text-white body-3 font-semibold hover:bg-primary-4 transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
