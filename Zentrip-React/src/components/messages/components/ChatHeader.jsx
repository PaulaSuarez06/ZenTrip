import { MoreVertical, Users } from 'lucide-react';
import UserAvatar from '../../ui/UserAvatar';

export default function ChatHeader({ chat, isGroup, isBlockedByMe, onNavigateToTrip, menuRef, menuOpen, onToggleMenu, onToggleBlock }) {
  return (
    <div className="px-5 py-3.5 border-b border-neutral-1 flex items-center gap-3 shrink-0 bg-white">
      {isGroup ? (
        <button
          type="button"
          onClick={onNavigateToTrip}
          className="flex items-center gap-3 min-w-0 hover:opacity-70 transition-opacity cursor-pointer"
          title="Ver viaje"
        >
          {chat.coverImage ? (
            <img src={chat.coverImage} alt={chat.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-secondary-1 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-secondary-4" />
            </div>
          )}
          <div className="min-w-0 text-left">
            <p className="body-3 font-semibold text-secondary-5 truncate">{chat.name}</p>
            <p className="text-[11px] text-neutral-3">Chat grupal</p>
          </div>
        </button>
      ) : (
        <div className="flex items-center gap-3 min-w-0 flex-1">
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
            {isBlockedByMe && <p className="text-[11px] text-red-400">Usuario bloqueado</p>}
          </div>
        </div>
      )}

      {/* 3-dots menu — solo en chats privados */}
      {!isGroup && (
        <div ref={menuRef} className="relative ml-auto shrink-0">
          <button
            type="button"
            onClick={onToggleMenu}
            className="w-8 h-8 rounded-full hover:bg-neutral-1 flex items-center justify-center transition-colors text-neutral-4"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-neutral-1 bg-white shadow-lg z-10 py-1 overflow-hidden">
              <button
                type="button"
                onClick={onToggleBlock}
                className={`w-full text-left px-4 py-2.5 body-3 transition-colors ${
                  isBlockedByMe
                    ? 'text-neutral-6 hover:bg-neutral-1'
                    : 'text-red-500 hover:bg-red-50'
                }`}
              >
                {isBlockedByMe ? 'Desbloquear usuario' : 'Bloquear usuario'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
