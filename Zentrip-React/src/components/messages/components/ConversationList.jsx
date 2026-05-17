import { Users } from 'lucide-react';
import UserAvatar from '../../ui/UserAvatar';

export default function ConversationList({ filtered, isSearching, selectedChat, onSelect, formatSidebarTime }) {
  return (
    <>
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
    </>
  );
}
