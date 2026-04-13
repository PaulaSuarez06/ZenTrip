import { useEffect, useRef } from 'react';
import { useNotifications } from '../../../context/NotificationContext';
import NotificationItem from './NotificationItem';

export default function NotificationPanel({ onClose }) {
  const { notifications } = useNotifications();
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="fixed left-2 right-2 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 rounded-2xl border border-secondary-1 shadow-lg z-50 overflow-hidden"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(8px)' }}
    >
      {/* Cabecera */}
      <div className="px-4 py-3 border-b border-neutral-1 flex items-center justify-between">
        <span className="body-2-semibold text-secondary-5">Notificaciones</span>
        {notifications.length > 0 && (
          <span className="body-3 text-neutral-3">{notifications.length} pendiente{notifications.length > 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Lista */}
      <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-2">
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <p className="body-2-semibold text-secondary-5">Todo tranquilo por aquí</p>
            <p className="body-3 text-neutral-3 mt-1">No tienes invitaciones pendientes</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
    </div>
  );
}
