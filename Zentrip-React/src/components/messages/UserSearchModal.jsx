import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePrivateChat } from '../../context/PrivateChatContext';
import { buildPrivateChatId, cancelChatRequest, fetchOutgoingPendingRequests, searchUsers, sendChatRequest } from '../../services/privateChatService';
import { isBlockedBy, subscribeToMyBlocks } from '../../services/blockService';
import UserAvatar from '../ui/UserAvatar';

function formatShortTime(ts) {
  if (!ts) return '';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function UserSearchModal({ onClose, onChatReady }) {
  const { user, profile } = useAuth();
  const { privateChats } = usePrivateChat();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState({});
  const [blockedByMe, setBlockedByMe] = useState(new Set());
  const [blockedByThem, setBlockedByThem] = useState(new Set());
  const inputRef = useRef(null);

  // Map otherUid → chat for quick lookup
  const existingChatMap = useMemo(() => {
    const map = {};
    privateChats.forEach((c) => { if (c.otherUid) map[c.otherUid] = c; });
    return map;
  }, [privateChats]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // On mount: pre-populate statuses from already-sent requests + subscribe to my blocks
  useEffect(() => {
    fetchOutgoingPendingRequests(user.uid).then((requests) => {
      const initial = {};
      requests.forEach((r) => {
        initial[r.toUid] = { state: 'requested', requestId: r.id, sentAt: r.createdAt };
      });
      setStatuses(initial);
    });
    const unsub = subscribeToMyBlocks(user.uid, setBlockedByMe);
    return unsub;
  }, [user.uid]);

  // When results change, check if any of them has blocked the current user
  useEffect(() => {
    if (results.length === 0) { setBlockedByThem(new Set()); return; }
    Promise.all(
      results.map(async (u) => {
        const blocked = await isBlockedBy(u.uid, user.uid);
        return blocked ? u.uid : null;
      })
    ).then((list) => setBlockedByThem(new Set(list.filter(Boolean))));
  }, [results, user.uid]);

  useEffect(() => {
    if (term.length < 2) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await searchUsers(term, user.uid);
        setResults(found);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [term, user.uid]);

  const handleAction = async (target) => {
    // Open existing chat
    const existing = existingChatMap[target.uid];
    if (existing) {
      onChatReady({ type: 'private', id: existing.id, name: existing.otherUser.displayName, otherUser: existing.otherUser });
      onClose();
      return;
    }

    // Blocked in either direction
    if (blockedByMe.has(target.uid) || blockedByThem.has(target.uid)) return;

    const s = statuses[target.uid];

    // Cancel pending request
    if ((s?.state === 'requested' || s?.state === 'pending') && s?.requestId) {
      setStatuses((p) => ({ ...p, [target.uid]: { ...s, state: 'cancelling' } }));
      try {
        await cancelChatRequest(s.requestId);
        setStatuses((p) => ({ ...p, [target.uid]: { state: 'idle' } }));
      } catch {
        setStatuses((p) => ({ ...p, [target.uid]: s }));
      }
      return;
    }

    const chatId = buildPrivateChatId(user.uid, target.uid);
    setStatuses((p) => ({ ...p, [target.uid]: { state: 'sending' } }));
    try {
      const displayName = profile?.displayName || profile?.firstName || user.email || 'Usuario';
      const result = await sendChatRequest(user.uid, target.uid, displayName, profile?.profilePhoto || '');
      if (result.status === 'exists') {
        const name = `${target.firstName || ''} ${target.lastName || ''}`.trim() || target.username;
        onChatReady({ type: 'private', id: chatId, name, otherUser: { displayName: name, profilePhoto: target.profilePhoto || '', avatarColor: target.avatarColor || '' } });
        onClose();
      } else {
        setStatuses((p) => ({
          ...p,
          [target.uid]: { state: result.status, requestId: result.requestId, sentAt: new Date() },
        }));
      }
    } catch {
      setStatuses((p) => ({ ...p, [target.uid]: { state: 'idle' } }));
    }
  };

  const getButton = (u) => {
    const { uid } = u;
    if (existingChatMap[uid]) {
      return { label: 'Abrir chat', cls: 'bg-secondary-1 text-secondary-5 hover:bg-secondary-2', disabled: false };
    }
    if (blockedByThem.has(uid)) {
      return { label: 'No disponible', cls: 'bg-neutral-2 text-neutral-4', disabled: true };
    }
    if (blockedByMe.has(uid)) {
      return { label: 'Bloqueado', cls: 'bg-neutral-2 text-neutral-4', disabled: true };
    }
    const s = statuses[uid];
    if (!s || s.state === 'idle') return { label: 'Enviar solicitud', cls: 'bg-primary-3 text-white hover:bg-primary-4', disabled: false };
    if (s.state === 'sending') return { label: 'Enviando...', cls: 'bg-neutral-2 text-neutral-4', disabled: true };
    if (s.state === 'cancelling') return { label: 'Cancelando...', cls: 'bg-neutral-2 text-neutral-4', disabled: true };
    if (s.state === 'requested' || s.state === 'pending') {
      const time = s.sentAt ? formatShortTime(s.sentAt) : '';
      return { label: `Solicitud enviada${time ? ` · ${time}` : ''}`, sublabel: 'Clic para cancelar', cls: 'bg-neutral-2 text-neutral-5 hover:bg-red-50 hover:text-red-500', disabled: false };
    }
    return { label: 'Enviar solicitud', cls: 'bg-primary-3 text-white hover:bg-primary-4', disabled: false };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-neutral-1 flex items-center justify-between">
          <p className="body-2-semibold text-secondary-5">Nueva conversación</p>
          <button type="button" onClick={onClose} className="text-neutral-3 hover:text-neutral-6 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-3 border-b border-neutral-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-3" />
            <input
              ref={inputRef}
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar por nombre o usuario..."
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-1 rounded-full body-3 text-neutral-7 placeholder:text-neutral-3 outline-none focus:ring-2 focus:ring-primary-1"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {loading && <div className="py-8 text-center body-3 text-neutral-3">Buscando...</div>}
          {!loading && term.length >= 2 && results.length === 0 && (
            <div className="py-8 text-center body-3 text-neutral-3">No se encontraron usuarios</div>
          )}
          {!loading && term.length < 2 && (
            <div className="py-8 text-center body-3 text-neutral-3">Escribe al menos 2 caracteres para buscar</div>
          )}
          {results.map((u) => {
            const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Usuario';
            const btn = getButton(u);
            return (
              <div key={u.uid} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-1 transition-colors">
                <UserAvatar
                  src={u.profilePhoto}
                  backgroundColor={u.avatarColor}
                  fullName={name}
                  sizeClass="w-10 h-10"
                  initialsClass="body-3 text-white font-bold"
                  backgroundClass="bg-neutral-3"
                />
                <div className="flex-1 min-w-0">
                  <p className="body-3 font-semibold text-neutral-7 truncate">{name}</p>
                  {u.username && <p className="text-[11px] text-neutral-3">@{u.username}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleAction(u)}
                  disabled={btn.disabled}
                  className={`px-3 py-1.5 rounded-full body-3 font-medium transition-colors shrink-0 text-center min-w-0 max-w-44 ${btn.cls}`}
                  title={btn.sublabel}
                >
                  <span className="block truncate">{btn.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
