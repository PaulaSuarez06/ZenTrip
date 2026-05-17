import { useEffect, useMemo, useRef, useState } from 'react';
import { useUnreadSinceTs } from '../../hooks/useUnreadSinceTs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChatNotifications } from '../../context/ChatNotificationContext';
import { useChatUI } from '../../context/ChatUIContext';
import { sendMessage, subscribeToMessages, subscribeToTripMembers } from '../../services/tripService';
import { sendPrivateMessage, subscribeToPrivateMessages } from '../../services/privateChatService';
import { blockUser, subscribeToIsBlockedBy, subscribeToMyBlocks, unblockUser } from '../../services/blockService';
import { usePrivateChat } from '../../context/PrivateChatContext';
import { useMemberProfiles } from '../../hooks/useMemberProfiles';
import { useChatScroll } from '../../hooks/useChatScroll';
import { useChatInput } from '../../hooks/useChatInput';
import { ROUTES } from '../../config/routes';
import ChatMessageList from '../chat/ChatMessageList';
import ChatRequestView from './components/ChatRequestView';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import BlockConfirmModal from './components/BlockConfirmModal';

export default function ConversationView({ chat, onChatUpdate }) {
  const { user, profile } = useAuth();
  const { allTripChats } = useChatNotifications();
  const { accept, reject } = usePrivateChat();
  const { setActiveChatTrip } = useChatUI();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [tripMembers, setTripMembers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(new Set());
  const [blockedByThem, setBlockedByThem] = useState(false);
  const containerRef = useRef(null);
  const menuRef = useRef(null);

  const isRequest = chat?.type === 'request';
  const isGroup = chat?.type === 'group';
  const otherUid = !isGroup && !isRequest ? chat?.otherUid : null;
  const isBlockedByMe = otherUid ? blockedByMe.has(otherUid) : false;
  const cannotMessage = isBlockedByMe || blockedByThem;
  const isRemovedFromTrip = isGroup && chat && !allTripChats.some((t) => t.id === chat.id);

  useEffect(() => {
    if (!chat || isRequest) return;
    setMessages([]);
    const unsub = isGroup
      ? subscribeToMessages(chat.id, setMessages)
      : subscribeToPrivateMessages(chat.id, setMessages);
    return unsub;
  }, [chat?.id, isGroup, isRequest]);

  useEffect(() => {
    if (!isGroup || !chat?.id) { setTripMembers([]); return; }
    return subscribeToTripMembers(chat.id, setTripMembers);
  }, [chat?.id, isGroup]);

  // setActiveChatTrip: marca el viaje activo para suprimir notificaciones del chat grupal
  useEffect(() => {
    if (!chat || isRequest || !isGroup) return;
    setActiveChatTrip(chat.id);
    return () => setActiveChatTrip(null);
  }, [chat?.id, isGroup, isRequest, setActiveChatTrip]);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeToMyBlocks(user.uid, setBlockedByMe);
  }, [user?.uid]);

  useEffect(() => {
    if (!otherUid || !user?.uid) { setBlockedByThem(false); return; }
    return subscribeToIsBlockedBy(otherUid, user.uid, setBlockedByThem);
  }, [otherUid, user?.uid]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const { unreadSinceTs, markRead } = useUnreadSinceTs(!isRequest ? chat?.id : null, isGroup);

  useChatScroll({
    chatId: chat?.id,
    messages,
    unreadSinceTs,
    containerRef,
    onAfterScroll: markRead,
    currentUserId: user?.uid,
  });

  const displayName = profile?.displayName || profile?.firstName || user?.email || 'Usuario';
  const memberUids = useMemo(() => [...new Set(messages.map((m) => m.uid).filter(Boolean))], [messages]);
  const memberProfiles = useMemberProfiles(memberUids);

  const mentionMembers = useMemo(() => {
    if (!isGroup) return [];
    return tripMembers
      .filter((m) => m.uid && m.uid !== user?.uid)
      .map((m) => ({ uid: m.uid, displayName: m.displayName || m.firstName || m.name || m.email || 'Usuario' }));
  }, [tripMembers, user?.uid, isGroup]);

  const { text, sending, replyTo, setReplyTo, mentionQuery, inputRef,
    handleTextChange, handleMentionSelect, handleSend, handleKeyDown,
  } = useChatInput({
    isGroup,
    onSend: async (trimmed, reply, chatMentions) => {
      if (!chat) return;
      if (isGroup) await sendMessage(chat.id, user.uid, displayName, trimmed, reply, chatMentions);
      else await sendPrivateMessage(chat.id, user.uid, displayName, trimmed, reply);
    },
  });

  const handleNavigateToTrip = () => {
    navigate(ROUTES.TRIPS.DETAIL.replace(':tripId', chat.id));
  };

  const handleToggleBlock = () => {
    if (!otherUid) return;
    setMenuOpen(false);
    if (isBlockedByMe) {
      unblockUser(user.uid, otherUid);
    } else {
      setShowBlockConfirm(true);
    }
  };

  const handleConfirmBlock = async () => {
    setShowBlockConfirm(false);
    await blockUser(user.uid, otherUid);
  };

  const handleAcceptRequest = async () => {
    const chatId = await accept(chat.id, chat.fromUid, chat.name, chat.message);
    if (chatId && onChatUpdate) {
      onChatUpdate({ id: chatId, name: chat.name, type: 'private', otherUser: chat.otherUser });
    }
  };

  const handleRejectRequest = async () => {
    await reject(chat.id);
    if (onChatUpdate) onChatUpdate(null);
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-neutral-3 gap-3">
        <span className="text-5xl">💬</span>
        <p className="body-2 text-neutral-4">Selecciona una conversación</p>
      </div>
    );
  }

  if (isRequest) {
    return (
      <ChatRequestView
        chat={chat}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Header */}
      <ChatHeader
        chat={chat}
        isGroup={isGroup}
        isBlockedByMe={isBlockedByMe}
        onNavigateToTrip={handleNavigateToTrip}
        menuRef={menuRef}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((o) => !o)}
        onToggleBlock={handleToggleBlock}
      />

      {/* Messages — min-h-0 is critical for flex scroll to work */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-slate-50">
        <ChatMessageList
          messages={messages}
          currentUserId={user?.uid}
          memberProfiles={memberProfiles}
          containerRef={containerRef}
          onReply={setReplyTo}
          unreadSinceTs={unreadSinceTs}
          isGroup={isGroup}
        />
      </div>

      {/* Reply + input wrapper (relative for MentionPicker absolute positioning) */}
      <ChatInput
        isGroup={isGroup}
        isRemovedFromTrip={isRemovedFromTrip}
        cannotMessage={cannotMessage}
        mentionQuery={mentionQuery}
        mentionMembers={mentionMembers}
        onMentionSelect={handleMentionSelect}
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
        text={text}
        sending={sending}
        inputRef={inputRef}
        onTextChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onSend={handleSend}
      />

      {/* Modal confirmación de bloqueo */}
      {showBlockConfirm && (
        <BlockConfirmModal
          name={chat.name}
          onCancel={() => setShowBlockConfirm(false)}
          onConfirm={handleConfirmBlock}
        />
      )}
    </div>
  );
}
