import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Reply } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';
import { buildGroups, bubbleRadius } from '../../utils/chatGroups';
import { getUserColor } from '../../utils/userColors';

function toMs(createdAt) {
  if (!createdAt) return 0;
  if (typeof createdAt === 'number') return createdAt;
  if (typeof createdAt.toMillis === 'function') return createdAt.toMillis();
  if (createdAt.seconds) return createdAt.seconds * 1000;
  return 0;
}

function ReplyQuote({ replyTo, isOwn, currentUserId, onJump }) {
  const name = replyTo.uid === currentUserId ? 'Tú' : (replyTo.displayName || '');
  const color = getUserColor(replyTo.uid);
  return (
    <div
      className={`mb-1.5 rounded-md px-2 py-1 border-l-2 text-[11px] overflow-hidden ${
        isOwn ? 'bg-neutral-1' : 'bg-white'
      } ${onJump ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}`}
      style={{ borderColor: color }}
      onClick={onJump}
    >
      <p className="font-semibold break-all line-clamp-1" style={{ color }}>
        {name}
      </p>
      <p className={`break-all line-clamp-2 ${isOwn ? 'text-black/60' : 'text-neutral-5'}`}>{replyTo.text}</p>
    </div>
  );
}

function renderTextWithMentions(text, mentions, isOwn) {
  if (!mentions?.length || !text) return text;
  const escaped = mentions
    .map((m) => m.displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .filter(Boolean);
  if (!escaped.length) return text;
  const rx = new RegExp(`(@(?:${escaped.join('|')}))`, 'g');
  const parts = text.split(rx);
  const mentionSet = new Set(mentions.map((m) => `@${m.displayName}`));
  return parts.map((part, i) =>
    mentionSet.has(part)
      ? <span key={i} className={`font-bold ${isOwn ? 'underline decoration-white/70' : 'text-primary-4'}`}>{part}</span>
      : part
  );
}

export default function ChatMessageList({
  messages, currentUserId, memberProfiles = {}, compact = false,
  bottomRef, containerRef, onReply, unreadSinceTs = 0, isGroup = true,
}) {
  const groups = buildGroups(messages);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);
  const [seenCount, setSeenCount] = useState(0);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const autoHighlightDone = useRef(false);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    const check = () => setShowScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
    check();
    el.addEventListener('scroll', check, { passive: true });
    return () => el.removeEventListener('scroll', check);
  }, [containerRef]);

  const firstUnreadMsgId = useMemo(() => {
    if (!currentUserId || unreadSinceTs < 1) return null;
    for (const msg of messages) {
      if (!msg.isIntro && msg.uid !== currentUserId && toMs(msg.createdAt) > unreadSinceTs) {
        return msg.id;
      }
    }
    return null;
  }, [messages, currentUserId, unreadSinceTs]);

  const atMeMessages = useMemo(() => {
    if (!isGroup || !currentUserId || unreadSinceTs < 1) return [];
    return messages.filter((m) =>
      !m.isIntro &&
      m.uid !== currentUserId &&
      toMs(m.createdAt) > unreadSinceTs &&
      (
        m.replyTo?.uid === currentUserId ||
        m.mentions?.some((x) => x.uid === currentUserId || x.uid === 'todos')
      )
    );
  }, [isGroup, messages, currentUserId, unreadSinceTs]);

  const unreadAtCount = atMeMessages.length - seenCount;
  const showAtBadge = unreadAtCount > 0;

  useEffect(() => {
    setSeenCount(0);
    autoHighlightDone.current = false;
  }, [unreadSinceTs]);

  useEffect(() => {
    if (autoHighlightDone.current || !atMeMessages.length || !containerRef?.current) return;
    autoHighlightDone.current = true;

    const container = containerRef.current;
    const { top: cTop, bottom: cBottom } = container.getBoundingClientRect();
    const visibleNow = atMeMessages.filter((m) => {
      const el = container.querySelector(`[data-msgid="${m.id}"]`);
      if (!el) return false;
      const { top, bottom } = el.getBoundingClientRect();
      return bottom > cTop && top < cBottom;
    });

    if (visibleNow.length) {
      // Solo resaltar visualmente; el badge lo descarta el usuario con clicks
      setHighlightedMsgId(visibleNow[0].id);
      const timer = setTimeout(() => setHighlightedMsgId(null), 3000);
      return () => clearTimeout(timer);
    }

    // Menciones fuera del viewport — esperar scroll inicial y luego observar
    let done = false;
    let observer = null;
    const setupTimer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          if (done) return;
          const visible = entries.find((e) => e.isIntersecting);
          if (!visible) return;
          done = true;
          observer.disconnect();
          const msgId = visible.target.getAttribute('data-msgid');
          const idx = atMeMessages.findIndex((m) => m.id === msgId);
          setHighlightedMsgId(msgId);
          setTimeout(() => {
            setHighlightedMsgId(null);
            setSeenCount((prev) => Math.max(prev, idx + 1));
          }, 2000);
        },
        { root: container, threshold: 0.5 },
      );
      atMeMessages.forEach((m) => {
        const el = container.querySelector(`[data-msgid="${m.id}"]`);
        if (el) observer.observe(el);
      });
    }, 600);
    return () => { clearTimeout(setupTimer); observer?.disconnect(); };
  }, [atMeMessages, containerRef]);

  const handleJumpToMessage = (messageId) => {
    const container = containerRef?.current;
    if (!container) return;
    const el = container.querySelector(`[data-msgid="${messageId}"]`);
    if (!el) return;
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const relativeTop = elRect.top - containerRect.top + container.scrollTop;
    const centered = relativeTop - container.clientHeight / 2 + el.offsetHeight / 2;
    container.scrollTo({ top: Math.max(0, centered), behavior: 'smooth' });
    setHighlightedMsgId(messageId);
    setTimeout(() => setHighlightedMsgId(null), 1500);
  };

  // Cada click salta a la siguiente mención no vista (seenCount), ya esté arriba o abajo
  const handleAtBadgeClick = () => {
    if (!showAtBadge) return;
    const idx = seenCount;
    if (idx >= atMeMessages.length) return;
    handleJumpToMessage(atMeMessages[idx].id);
    setSeenCount(idx + 1);
  };

  return (
    <div className="flex-1 min-h-0 relative overflow-hidden">
      <div
        ref={containerRef}
        className={`absolute inset-0 overflow-y-auto flex flex-col ${compact ? 'px-3 py-3 gap-2' : 'px-4 py-4 gap-3'}`}
      >
        {groups.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-4 body-3 py-8">
            <span className={compact ? 'text-3xl mb-1' : 'text-4xl mb-2'}>💬</span>
            <p className="text-center">Sé el primero en escribir</p>
          </div>
        )}

        {groups.map((group, gIdx) => {
          const isOwn = group.uid === currentUserId;
          const lastMsg = group.msgs[group.msgs.length - 1];
          const time = lastMsg.createdAt?.toDate?.()
            ? lastMsg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';
          const mp = memberProfiles[group.uid];
          return (
            <Fragment key={`g-${gIdx}-${group.msgs[0].id}`}>
              <div
                className={`flex items-start ${compact ? 'gap-1.5 max-w-[85%]' : 'gap-2 max-w-[70%]'} ${isOwn ? 'self-end flex-row-reverse' : 'self-start flex-row'}`}
              >
                {!isOwn && (
                  <div className="shrink-0">
                    <UserAvatar
                      src={mp?.profilePhoto}
                      backgroundColor={mp?.avatarColor}
                      fullName={group.displayName}
                      sizeClass={compact ? 'w-6 h-6' : 'w-8 h-8'}
                      initialsClass={`${compact ? 'text-[9px]' : 'text-[11px]'} text-white font-bold`}
                      backgroundClass="bg-neutral-3"
                    />
                  </div>
                )}
                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  {!isOwn && (
                    <span className={`${compact ? 'text-[11px]' : 'text-xs'} text-neutral-4 font-medium px-1 ${compact ? 'mb-0.5' : 'mb-1'}`}>
                      {group.displayName}
                    </span>
                  )}
                  <div className={`flex flex-col ${compact ? 'gap-px' : 'gap-0.5'} ${isOwn ? 'items-end' : 'items-start'}`}>
                    {group.msgs.map((msg, mIdx) => {
                      const isOnly = group.msgs.length === 1;
                      const isFirst = mIdx === 0;
                      const isLast = mIdx === group.msgs.length - 1;
                      const r = bubbleRadius(isOwn, isOnly, isFirst, isLast);
                      const isHighlighted = highlightedMsgId === msg.id;
                      return (
                        <div
                          key={msg.id}
                          data-msgid={msg.id}
                          data-first-unread={msg.id === firstUnreadMsgId || undefined}
                          className={`group/msg flex items-center w-fit ${compact ? 'gap-1' : 'gap-1.5'} ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <div
                            className={`${compact ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 body-3'} wrap-anywhere transition-all duration-300 ${
                              isOwn
                                ? `bg-primary-3 text-white ${r} ${isHighlighted ? 'ring-2 ring-offset-1 ring-white/60' : ''}`
                                : `bg-neutral-1 text-neutral-7 ${r} ${isHighlighted ? 'ring-2 ring-offset-1 ring-primary-3/50' : ''}`
                            }`}
                          >
                            {msg.replyTo && (
                              <ReplyQuote
                                replyTo={msg.replyTo}
                                isOwn={isOwn}
                                currentUserId={currentUserId}
                                onJump={containerRef ? () => handleJumpToMessage(msg.replyTo.messageId) : null}
                              />
                            )}
                            {renderTextWithMentions(msg.text, msg.mentions, isOwn)}
                          </div>
                          {onReply && !msg.isIntro && (
                            <button
                              type="button"
                              onClick={() => onReply({ messageId: msg.id, uid: group.uid, displayName: group.displayName, text: msg.text })}
                              className="opacity-100 sm:opacity-0 sm:group-hover/msg:opacity-100 transition-opacity p-1 rounded-full hover:bg-neutral-2 text-neutral-3 hover:text-neutral-5 shrink-0"
                              title="Responder"
                            >
                              <Reply className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {time && (
                    <span className={`text-[11px] text-neutral-3 px-1 ${compact ? 'mt-0.5' : 'mt-1'}`}>{time}</span>
                  )}
                </div>
              </div>
            </Fragment>
          );
        })}
        {bottomRef && <div ref={bottomRef} />}
      </div>

      {/* Botones flotantes: @ arriba, flecha abajo debajo */}
      {(showAtBadge || showScrollDown) && (
        <div className={`absolute ${compact ? 'bottom-2 right-2' : 'bottom-3 right-3'} z-10 flex flex-col items-center gap-2 select-none`}>
          {showAtBadge && (
            <button
              type="button"
              onClick={handleAtBadgeClick}
              title="Ir a mención"
              className={`bg-primary-3 text-white rounded-full shadow-lg font-bold hover:bg-primary-4 transition-colors flex items-center justify-center gap-0.5 ${
                compact ? 'text-[11px] px-2 py-1' : 'text-xs px-2.5 py-1.5'
              }`}
            >
              <span>@</span>
              {unreadAtCount > 1 && <span>{unreadAtCount}</span>}
            </button>
          )}
          {showScrollDown && (
            <button
              type="button"
              onClick={() => containerRef?.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })}
              title="Ir al final"
              className={`bg-white border border-neutral-2 text-neutral-5 rounded-full shadow-md hover:bg-neutral-1 transition-colors flex items-center justify-center ${
                compact ? 'w-7 h-7' : 'w-8 h-8'
              }`}
            >
              <ChevronDown className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}