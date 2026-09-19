import React, { useState, useRef, useEffect } from 'react';
import { useAML } from '../../context/AMLContext';
import { Bell, Check, ShieldAlert, AlertTriangle, Info } from 'lucide-react';

export const NotificationsMenu: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveView,
    setSelectedCaseId,
  } = useAML();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.linkView) {
      setActiveView(notif.linkView as any);
    }
    if (notif.linkId) {
      setSelectedCaseId(notif.linkId);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="notifications-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-rose-100 text-rose-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                No active notifications
              </div>
            ) : (
              notifications.map((n) => {
                let Icon = Info;
                let iconColor = 'text-blue-500 bg-blue-50';
                if (n.type === 'CRITICAL') {
                  Icon = ShieldAlert;
                  iconColor = 'text-rose-600 bg-rose-50';
                } else if (n.type === 'WARNING') {
                  Icon = AlertTriangle;
                  iconColor = 'text-amber-600 bg-amber-50';
                }

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                      !n.read ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-semibold truncate ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500">
              Autonomous AML Event Stream (Simulation Mode)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
