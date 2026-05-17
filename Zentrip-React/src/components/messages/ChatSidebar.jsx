import { Search } from 'lucide-react';
import { useChatNotifications } from '../../context/ChatNotificationContext';
import { usePrivateChat } from '../../context/PrivateChatContext';
import { useAuth } from '../../context/AuthContext';
import useChatSidebar from './hooks/useChatSidebar';
import PendingRequests from './components/PendingRequests';
import ConversationList from './components/ConversationList';
import PeopleSearch from './components/PeopleSearch';

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
  const { allTripChats, tripReadTimestamps } = useChatNotifications();
  const { allPrivateChats, pendingRequests, accept, reject } = usePrivateChat();

  const {
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
  } = useChatSidebar({ user, profile, allTripChats, tripReadTimestamps, allPrivateChats, onSelect });

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
          <PendingRequests
            pendingRequests={pendingRequests}
            onSelect={onSelect}
            onAccept={accept}
            onReject={reject}
          />
        )}

        {/* Conversation list with section headers and empty state */}
        <ConversationList
          filtered={filtered}
          isSearching={isSearching}
          selectedChat={selectedChat}
          onSelect={onSelect}
          formatSidebarTime={formatSidebarTime}
        />

        {/* Sección Personas (solo al buscar) */}
        {isSearching && (
          <PeopleSearch
            suggestedUsers={suggestedUsers}
            loadingSuggestions={loadingSuggestions}
            filtered={filtered}
            expandedUid={expandedUid}
            draftMsg={draftMsg}
            setDraftMsg={setDraftMsg}
            MSG_MAX={MSG_MAX}
            blockedByMe={blockedByMe}
            suggestedStatuses={suggestedStatuses}
            getSuggestedBtn={getSuggestedBtn}
            isExpanded={isExpanded}
            onAction={handleSuggestedAction}
            onSend={handleSuggestedSend}
            onSetExpanded={setExpandedUid}
          />
        )}
      </div>
    </div>
  );
}
