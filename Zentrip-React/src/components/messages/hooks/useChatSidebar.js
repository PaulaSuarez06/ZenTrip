import { useEffect, useMemo, useState } from 'react';
import {
  cancelChatRequest,
  fetchOutgoingPendingRequests,
  searchUsers,
  sendChatRequest,
} from '../../../services/privateChatService';
import { subscribeToMyBlocks } from '../../../services/blockService';

function toMs(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val.toMillis === 'function') return val.toMillis();
  if (val.seconds) return val.seconds * 1000;
  return 0;
}

export default function useChatSidebar({ user, profile, allTripChats, tripReadTimestamps, allPrivateChats, onSelect }) {
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
    allPrivateChats.forEach((c) => { if (c.otherUid) map[c.otherUid] = c; });
    return map;
  }, [allPrivateChats]);

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
    atMe: t.hasMention || (
      !!t.lastMessage &&
      t.lastMessage.uid !== user?.uid &&
      toMs(t.lastMessage.createdAt) > (tripReadTimestamps?.[t.id] ?? 0) &&
      (t.lastMessage.mentionUids?.includes(user?.uid) || t.lastMessage.mentionUids?.includes('todos'))
    ),
    otherUser: null,
  }));

  const privateItems = allPrivateChats.map((c) => ({
    key: `private_${c.id}`,
    type: 'private',
    id: c.id,
    name: c.otherUser.displayName,
    coverImage: null,
    lastText: c.lastMessage
      ? `${c.lastMessage.uid === user?.uid ? 'Tú: ' : ''}${c.lastMessage.text}`
      : 'Sin mensajes',
    lastTime: c.lastMessage?.createdAt,
    isUnread: c.isUnread,
    atMe: c.hasMention ?? false,
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

  return {
    search,
    setSearch,
    filtered,
    isSearching,
    suggestedUsers,
    loadingSuggestions,
    expandedUid,
    setExpandedUid,
    draftMsg,
    setDraftMsg,
    MSG_MAX,
    suggestedStatuses,
    blockedByMe,
    handleSuggestedAction,
    handleSuggestedSend,
    getSuggestedBtn,
    isExpanded,
  };
}
