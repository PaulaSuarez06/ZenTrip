import { useEffect, useMemo, useState } from 'react';
import { Check, Search, Send, Users, X } from 'lucide-react';
import { useChatNotifications } from '../../context/ChatNotificationContext';
import { usePrivateChat } from '../../context/PrivateChatContext';
import { useAuth } from '../../context/AuthContext';
import { cancelChatRequest, fetchOutgoingPendingRequests, searchUsers, sendChatRequest } from '../../services/privateChatService';
import { subscribeToMyBlocks } from '../../services/blockService';
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
  const { user, profile } = useAuth();
  const { allTripChats } = useChatNotifications();
  const { privateChats, pendingRequests, accept, reject } = usePrivateChat();
  const [search, setSearch] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [suggestedStatuses, setSuggestedStatuses] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(new Set());
  const [expandedUid, setExpandedUid] = useState(null);
  const [draftMsg, setDraftMsg] = useState('');
  const MSG_MAX = 200;
  const LS_MSG_KEY = `zentrip_msg_used_${user?.uid}`;
  const [usedMessageUids, setUsedMessageUids] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(`zentrip_msg_used_${user?.uid}`) || '[]')); }
    catch { return new Set(); }
  });

  const markMessageUsed = (toUid) => {
    setUsedMessageUids((prev) => {
      const next = new Set(prev);
      next.add(toUid);
      localStorage.setItem(LS_MSG_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const existingChatMap = useMemo(() => {
    const map = {};
    privateChats.forEach((c) => { if (c.otherUid) map[c.otherUid] = c; });
    return map;
  }, [privateChats]);

  useEffect(() => {
    if (!user?.uid) return;
    fetchOutgoingPendingRequests(user.uid).then((requests) => {
      const initial = {};
      requests.forEach((r) => { initial[r.toUid] = { state: 'requested', requestId: r.id, sentAt: r.createdAt }; });
      setSuggestedStatuses(initial);
    });
    return subscribeToMyBlocks(user.uid, setBlockedByMe);
  }, [user?.uid]);

  useEffect(() => {
    const term = search.trim();
    if (!user?.uid || term.length < 2) { setSuggestedUsers([]); return; }
    const timeout = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const found = await searchUsers(term, user.uid);
        setSuggestedUsers(found.filter((u) => !existingChatMap[u.uid]));
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, user?.uid, existingChatMap]);

  const isAtMentioned = (lastMessage) => {
    if (!lastMessage || lastMessage.uid === user?.uid) return false;
    return (
      lastMessage.replyToUid === user?.uid ||
      lastMessage.mentionUids?.includes(user?.uid) ||
      lastMessage.mentionUids?.includes('todos')
    );
  };

  const groupItems = allTripChats.map((t) => ({
    key: `group_${t.id}`,
    type: 'group',
    id: t.id,
    name: t.name,
    coverImage: t.coverImage || null,
    lastText: t.lastMessage
      ? `${t.lastMessage.uid === user?.uid ? 'Tú' : t.lastMessage.displayName}: ${t.lastMessage.text}`
      : 'Sin mensajes',
    lastTime: t.lastMessage?.createdAt,
    isUnread: t.isUnread,
    atMe: isAtMentioned(t.lastMessage),
    otherUser: null,
  }));

  const privateItems = privateChats.map((c) => ({
    key: `private_${c.id}`,
    type: 'private',
    id: c.id,
    name: c.otherUser.displayName,
    coverImage: null,
    lastText: c.lastMessage
      ? `${c.lastMessage.uid === user?.uid ? 'Tú: ' : ''}${c.lastMessage.text}`
      : 'Sin mensajes',
    lastTime: c.lastMessage?.createdAt,
    isUnread: false,
    atMe: isAtMentioned(c.lastMessage),
    otherUser: c.otherUser,
    otherUid: c.otherUid,
  }));

  const allItems = [...groupItems, ...privateItems].sort((a, b) => toMs(b.lastTime) - toMs(a.lastTime));

  const lower = search.trim().toLowerCase();
  const filtered = lower
    ? allItems.filter((i) => i.name.toLowerCase().includes(lower) || i.lastText.toLowerCase().includes(lower))
    : allItems;

  const handleSuggestedAction = (target) => {
    if (blockedByMe.has(target.uid)) return;
    const s = suggestedStatuses[target.uid];

    // Cancel pending request — also clears used-message flag so user can send a new message
    if ((s?.state === 'requested' || s?.state === 'pending') && s?.requestId) {
      setSuggestedStatuses((p) => ({ ...p, [target.uid]: { ...s, state: 'cancelling' } }));
      cancelChatRequest(s.requestId)
        .then(() => {
          setSuggestedStatuses((p) => ({ ...p, [target.uid]: { state: 'idle' } }));
          setUsedMessageUids((prev) => {
            const next = new Set(prev);
            next.delete(target.uid);
            localStorage.setItem(LS_MSG_KEY, JSON.stringify([...next]));
            return next;
          });
        })
        .catch(() => setSuggestedStatuses((p) => ({ ...p, [target.uid]: s })));
      return;
    }

    // New request: expand input (first time) or send directly (already used message)
    if (!usedMessageUids.has(target.uid)) {
      setExpandedUid(target.uid);
      setDraftMsg('');
    } else {
      handleSuggestedSend(target, '');
    }
  };

  const handleSuggestedSend = async (target, message) => {
    setExpandedUid(null);
    setDraftMsg('');
    setSuggestedStatuses((p) => ({ ...p, [target.uid]: { state: 'sending' } }));
    try {
      const trimmed = message.trim();
      if (trimmed) markMessageUsed(target.uid);
      const displayName = profile?.displayName || profile?.firstName || user.email || 'Usuario';
      const result = await sendChatRequest(user.uid, target.uid, displayName, profile?.profilePhoto || '', trimmed);
      setSuggestedStatuses((p) => ({
        ...p,
        [target.uid]: result.status === 'exists'
          ? { state: 'idle' }
          : { state: result.status, requestId: result.requestId, sentAt: new Date() },
      }));
    } catch {
      setSuggestedStatuses((p) => ({ ...p, [target.uid]: { state: 'idle' } }));
    }
  };

  const getSuggestedBtn = (uid) => {
    if (blockedByMe.has(uid)) return { label: 'Bloqueado', cls: 'bg-neutral-2 text-neutral-4', disabled: true };
    const s = suggestedStatuses[uid];
    if (!s || s.state === 'idle') return { label: 'Enviar solicitud', cls: 'bg-primary-3 text-white hover:bg-primary-4', disabled: false };
    if (s.state === 'sending' || s.state === 'cancelling') return { label: 'Enviando...', cls: 'bg-neutral-2 text-neutral-4', disabled: true };
    if (s.state === 'requested' || s.state === 'pending') return { label: 'Solicitud enviada', cls: 'bg-neutral-2 text-neutral-5 hover:bg-red-50 hover:text-red-500', disabled: false };
    return { label: 'Enviar solicitud', cls: 'bg-primary-3 text-white hover:bg-primary-4', disabled: false };
  };

  const isExpanded = (uid) => expandedUid === uid;

  const isSearching = search.trim().length >= 2;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white border-r border-neutral-1">
      {/* Header */}
      <div className="px-4 py-4 border-b border-neutral-1 flex items-center shrink-0">
        <span className="body-2-semibold text-secondary-5">Mensajes</span>
      </div>

      {/* Search */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar mensajes o personas..."
            className="w-full pl-8 pr-3 py-2 bg-neutral-1 rounded-full text-sm text-neutral-7 placeholder:text-neutral-3 outline-none focus:ring-2 focus:ring-primary-1"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Solicitudes pendientes */}
        {pendingRequests.length > 0 && (
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
                  onClick={() => accept(req.id, req.fromUid, req.fromDisplayName, req.message)}
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

        {/* Sección Mensajes */}
        {isSearching && filtered.length > 0 && (
          <p className="text-[11px] font-semibold text-neutral-4 uppercase tracking-wide px-4 pt-3 pb-1.5">
            Mensajes
          </p>
        )}

        {filtered.length === 0 && !isSearching && (
          <div className="py-10 text-center body-3 text-neutral-3">No hay conversaciones</div>
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
                    <img src={item.coverImage} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary-1 flex items-center justify-center">
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
              <div className="flex flex-col items-center gap-1 shrink-0">
                {item.isUnread && <span className="w-2 h-2 rounded-full bg-primary-3" />}
                {item.atMe && (
                  <span className="text-[10px] font-bold text-white bg-primary-3 rounded-full w-4 h-4 flex items-center justify-center leading-none">@</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Sección Personas (solo al buscar) */}
        {isSearching && (
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
                        onClick={() => setExpandedUid(null)}
                        className="px-3 py-1 rounded-full text-[12px] font-medium bg-neutral-2 text-neutral-5 hover:bg-neutral-3 transition-colors shrink-0"
                      >
                        Cancelar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSuggestedAction(u)}
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
                            if (e.key === 'Enter') handleSuggestedSend(u, draftMsg);
                            if (e.key === 'Escape') setExpandedUid(null);
                          }}
                          placeholder="Mensaje opcional..."
                          maxLength={MSG_MAX}
                          className="flex-1 text-sm text-neutral-7 placeholder:text-neutral-3 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSuggestedSend(u, draftMsg)}
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
        )}
      </div>
    </div>
  );
}