import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../config/routes";
import { useProfileAvatar } from "../../../../hooks/useProfileAvatar";
import { useAuth } from "../../../../context/AuthContext";
import { useNotifications } from "../../../../context/NotificationContext";
import { useChatNotifications } from "../../../../context/ChatNotificationContext";
import { usePrivateChat } from "../../../../context/PrivateChatContext";

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

export function useNavbarController() {
  const navigate = useNavigate();
  const { avatarSrc, initials } = useProfileAvatar();
  const { profile, user, logout } = useAuth();
  const { unseenCount: notificationCount } = useNotifications();
  const { chatUnreadCount } = useChatNotifications();
  const { pendingCount, unreadPrivateCount } = usePrivateChat();
  const avatarColor = profile?.avatarColor || "";
  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [languageSelectorOpen, setLanguageSelectorOpen] = useState(false);

  const toggleLanguageSelector = () => {
    setLanguageSelectorOpen((prev) => {
      const next = !prev;
      if (next) {
        setMenuOpen(false);
        setProfileMenuOpen(false);
        setNotificationPanelOpen(false);
        setChatPanelOpen(false);
      }
      return next;
    });
  };

  const closeLanguageSelector = () => setLanguageSelectorOpen(false);

  const toggleNotificationPanel = () => {
    setNotificationPanelOpen((prev) => {
      const next = !prev;
      if (next) {
        setMenuOpen(false);
        setProfileMenuOpen(false);
        setChatPanelOpen(false);
        setLanguageSelectorOpen(false);
      }
      return next;
    });
  };

  const closeNotificationPanel = () => setNotificationPanelOpen(false);

  const toggleChatPanel = () => {
    setChatPanelOpen((prev) => {
      const next = !prev;
      if (next) {
        setMenuOpen(false);
        setProfileMenuOpen(false);
        setNotificationPanelOpen(false);
        setLanguageSelectorOpen(false);
      }
      return next;
    });
  };

  const closeChatPanel = () => setChatPanelOpen(false);

  const toggleProfileMenu = () => {
    setProfileMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        setMenuOpen(false);
        setNotificationPanelOpen(false);
        setLanguageSelectorOpen(false);
      }
      return next;
    });
  };

  const toggleMobileMenu = () => {
    setMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        setProfileMenuOpen(false);
        setNotificationPanelOpen(false);
        setLanguageSelectorOpen(false);
      }
      return next;
    });
  };

  const closeMobileMenu = () => setMenuOpen(false);

  const closeProfileMenu = () => {
    setProfileMenuOpen(false);
  };

  const handleGoToEditProfile = () => {
    setProfileMenuOpen(false);
    navigate(ROUTES.PROFILE.EDIT);
  };

  const handleGoToAdmin = () => {
    setProfileMenuOpen(false);
    navigate(ROUTES.ADMIN.DASHBOARD);
  };

  const handleGoHome = () => {
    setProfileMenuOpen(false);
    navigate(ROUTES.HOME);
  };

  const handleGoToMyTrips = () => {
    setMenuOpen(false);
    navigate(ROUTES.TRIPS.LIST);
  };

  const handleGoToExplore = () => {
    setMenuOpen(false);
    navigate(ROUTES.EXPLORE);
  };

  const handleGoToCommunity = () => {
    setMenuOpen(false);
    navigate(ROUTES.COMMUNITY);
  };

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    try {
      await logout();
    } finally {
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    }
  };

  return {
    avatarSrc,
    initials,
    avatarColor,
    isAdmin,
    notificationCount,
    messageCount: chatUnreadCount + pendingCount + unreadPrivateCount,
    menuOpen,
    profileMenuOpen,
    notificationPanelOpen,
    chatPanelOpen,
    languageSelectorOpen,
    toggleLanguageSelector,
    closeLanguageSelector,
    toggleProfileMenu,
    toggleMobileMenu,
    closeMobileMenu,
    closeProfileMenu,
    toggleNotificationPanel,
    closeNotificationPanel,
    toggleChatPanel,
    closeChatPanel,
    handleGoToEditProfile,
    handleGoToAdmin,
    handleGoHome,
    handleGoToMyTrips,
    handleGoToExplore,
    handleGoToCommunity,
    handleLogout,
  };
}
