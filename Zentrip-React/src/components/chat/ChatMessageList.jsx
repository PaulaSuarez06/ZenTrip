import UserAvatar from '../ui/UserAvatar';
import { buildGroups, bubbleRadius } from '../../utils/chatGroups';

export default function ChatMessageList({ messages, currentUserId, memberProfiles = {}, compact = false, bottomRef, containerRef }) {
  const groups = buildGroups(messages);

  return (
    <div ref={containerRef} className={`flex-1 overflow-y-auto flex flex-col ${compact ? 'px-3 py-3 gap-2' : 'px-4 py-4 gap-3'}`}>
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
          <div
            key={`g-${gIdx}-${group.msgs[0].id}`}
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
                  return (
                    <div
                      key={msg.id}
                      className={`${compact ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 body-3'} wrap-anywhere ${
                        isOwn ? `bg-primary-3 text-white ${r}` : `bg-neutral-1 text-neutral-7 ${r}`
                      }`}
                    >
                      {msg.text}
                    </div>
                  );
                })}
              </div>
              {time && (
                <span className={`text-[11px] text-neutral-3 px-1 ${compact ? 'mt-0.5' : 'mt-1'}`}>{time}</span>
              )}
            </div>
          </div>
        );
      })}
      {bottomRef && <div ref={bottomRef} />}
    </div>
  );
}
