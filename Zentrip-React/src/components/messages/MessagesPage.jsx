import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import ConversationView from './ConversationView';
import UserSearchModal from './UserSearchModal';

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSelect = (chat) => {
    setSelectedChat(chat);
    setShowConversation(true);
  };

  // Auto-select a chat when arriving from a notification click
  useEffect(() => {
    const { selectChat } = location.state || {};
    if (!selectChat) return;
    handleSelect(selectChat);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state?.selectChat?.id]);

  // Auto-open a pending request preview
  useEffect(() => {
    const { selectRequest: req } = location.state || {};
    if (!req) return;
    handleSelect({
      type: 'request',
      id: req.id,
      name: req.fromDisplayName,
      fromUid: req.fromUid,
      message: req.message,
      otherUser: { displayName: req.fromDisplayName, profilePhoto: req.fromProfilePhoto || '', avatarColor: '' },
    });
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state?.selectRequest?.id]);

  const handleChatReady = (chat) => {
    setSelectedChat(chat);
    setShowConversation(true);
    setShowSearch(false);
  };

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100dvh-4.5rem)] overflow-hidden">
      {/* Left sidebar — hidden on mobile when conversation is open */}
      <div className={`${showConversation ? 'hidden md:flex' : 'flex'} flex-col w-full min-h-0 md:w-80`}>
        <ChatSidebar
          selectedChat={selectedChat}
          onSelect={handleSelect}
          onNewChat={() => setShowSearch(true)}
        />
      </div>

      {/* Right panel */}
      <div className={`${showConversation ? 'flex' : 'hidden md:flex'} flex-1 min-h-0 flex-col min-w-0 bg-slate-50 overflow-hidden`}>
        {/* Mobile back button */}
        {showConversation && (
          <div className="md:hidden px-4 py-2 border-b border-neutral-1 bg-white shrink-0">
            <button
              type="button"
              onClick={() => setShowConversation(false)}
              className="flex items-center gap-1.5 body-3 text-neutral-4 hover:text-neutral-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </div>
        )}
        <ConversationView
          chat={selectedChat}
          onChatUpdate={(newChat) => {
            setSelectedChat(newChat);
            if (!newChat) setShowConversation(false);
          }}
        />
      </div>

      {showSearch && (
        <UserSearchModal onClose={() => setShowSearch(false)} onChatReady={handleChatReady} />
      )}
    </div>
  );
}
