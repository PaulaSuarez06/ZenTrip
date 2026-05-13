import { useState } from 'react';
import { PenSquare, Search, Users, Check, X } from 'lucide-react';
import { useChatNotifications } from '../../context/ChatNotificationContext';
import { usePrivateChat } from '../../context/PrivateChatContext';
import UserAvatar from '../ui/UserAvatar';

function toMs(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val.toMillis === 'function') return val.toMillis();
  if (val.seconds) return val.seconds * 1000;
  return 0;
}

function formatSidebarTime(val) {
  if (!val) return '';
  const ms = toMs(val);
  if (!ms) return '';
  const date = new Date(ms);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

export default function ChatSidebar({ selectedChat, onSelect, onNewChat }) {
  const { allTripChats } = useChatNotifications();
  const { privateChats, pendingRequests, accept, reject } = usePrivateChat();
  const [search, setSearch] = useState('');

  const groupItems = allTripChats.map((t) => ({
    key: `group_${t.id}`,
    type: 'group',
    id: t.id,
    name: t.name,
    coverImage: t.coverImage || null,
    lastText: t.lastMessage ? `${t.lastMessage.displayName}: ${t.lastMessage.text}` : 'Sin mensajes',
    lastTime: t.lastMessage?.createdAt,
    isUnread: t.isUnread,
    otherUser: null,
  }));

  const privateItems = privateChats.map((c) => ({
    key: `private_${c.id}`,
    type: 'private',
    id: c.id,
    name: c.otherUser.displayName,
    coverImage: null,
    lastText: c.lastMessage ? c.lastMessage.text : 'Sin mensajes',
    lastTime: c.lastMessage?.createdAt,
    isUnread: false,
    otherUser: c.otherUser,
    otherUid: c.otherUid,
  }));

  const allItems = [...groupItems, ...privateItems]
    .sort((a, b) => toMs(b.lastTime) - toMs(a.lastTime));

  const filtered = search.trim()
    ? allItems.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white border-r border-neutral-1">
      {/* Header */}
      <div className="px-4 py-4 border-b border-neutral-1 flex items-center justify-between shrink-0">
        <span className="body-2-semibold text-secondary-5">Mensajes</span>
        <button
          type="button"
          onClick={onNewChat}
          className="w-8 h-8 rounded-full bg-secondary-1 hover:bg-secondary-2 transition-colors flex items-center justify-center"
          title="Nueva conversación"
        >
          <PenSquare className="w-4 h-4 text-secondary-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversación..."
            className="w-full pl-8 pr-3 py-2 bg-neutral-1 rounded-full text-sm text-neutral-7 placeholder:text-neutral-3 outline-none focus:ring-2 focus:ring-primary-1"
          />
        </div>
      </div>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <div className="px-3 pb-2 shrink-0 border-b border-neutral-1">
          <p className="text-[11px] font-semibold text-neutral-4 uppercase tracking-wide px-1 mb-1.5 mt-1">
            Solicitudes ({pendingRequests.length})
          </p>
          {pendingRequests.map((req) => (
            <div key={req.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-secondary-1 mb-1">
              <UserAvatar
                src={req.fromProfilePhoto}
                fullName={req.fromDisplayName}
                sizeClass="w-8 h-8"
                initialsClass="text-[10px] text-white font-bold"
                backgroundClass="bg-neutral-3"
              />
              <div className="flex-1 min-w-0">
                <p className="body-3 font-semibold text-secondary-5 truncate">{req.fromDisplayName}</p>
                <p className="text-[11px] text-neutral-4">Quiere chatear contigo</p>
              </div>
              <button
                type="button"
                onClick={() => accept(req.id, req.fromUid)}
                className="w-7 h-7 rounded-full bg-primary-3 text-white flex items-center justify-center hover:bg-primary-4 transition-colors shrink-0"
                title="Aceptar"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => reject(req.id)}
                className="w-7 h-7 rounded-full bg-neutral-2 text-neutral-5 flex items-center justify-center hover:bg-neutral-3 transition-colors shrink-0"
                title="Rechazar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Chat list — min-h-0 is required for overflow-y-auto to work inside flex */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="py-10 text-center body-3 text-neutral-3">
            {search ? 'Sin resultados' : 'No hay conversaciones'}
          </div>
        )}
        {filtered.map((item) => {
          const isSelected = selectedChat?.id === item.id && selectedChat?.type === item.type;
          return (
            <div
              key={item.key}
              className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer ${
                isSelected ? 'bg-secondary-1' : 'hover:bg-neutral-1'
              }`}
              onClick={() => onSelect({ type: item.type, id: item.id, name: item.name, coverImage: item.coverImage, otherUser: item.otherUser, otherUid: item.otherUid })}
            >
              <div className="shrink-0">
                {item.type === 'group' ? (
                  item.coverImage ? (
                    <img src={item.coverImage} alt={item.name} className="w-10 h-10 rounded-full object-cover hover:opacity-70 transition-opacity" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary-1 flex items-center justify-center hover:opacity-70 transition-opacity">
                      <Users className="w-4.5 h-4.5 text-secondary-4" />
                    </div>
                  )
                ) : (
                  <UserAvatar
                    src={item.otherUser?.profilePhoto}
                    backgroundColor={item.otherUser?.avatarColor}
                    fullName={item.name}
                    sizeClass="w-10 h-10"
                    initialsClass="body-3 text-white font-bold"
                    backgroundClass="bg-neutral-3"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={`body-3 truncate ${item.isUnread ? 'font-semibold text-secondary-5' : 'text-neutral-6'}`}>
                    {item.name}
                  </p>
                  {item.lastTime && (
                    <span className={`text-[11px] shrink-0 ${item.isUnread ? 'text-primary-3 font-semibold' : 'text-neutral-3'}`}>
                      {formatSidebarTime(item.lastTime)}
                    </span>
                  )}
                </div>
                <p className={`text-[12px] truncate mt-0.5 ${item.isUnread ? 'text-neutral-6 font-medium' : 'text-neutral-4'}`}>
                  {item.lastText}
                </p>
              </div>

              {item.isUnread && <span className="w-2 h-2 rounded-full bg-primary-3 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
