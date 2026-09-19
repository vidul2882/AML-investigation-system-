import React, { useState, useEffect } from 'react';
import { useAML } from '../../context/AMLContext';
import {
  Search,
  Award,
  Upload,
  User,
  LogOut,
  Clock,
  Shield,
  Menu,
} from 'lucide-react';
import { NotificationsMenu } from './NotificationsMenu';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenCsvModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenCsvModal,
}) => {
  const {
    startJudgeDemo,
    setIsSearchModalOpen,
    logoutUser,
  } = useAML();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      id="app-top-header"
      className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-xs"
    >
      {/* Left side: Hamburger (mobile) + Global Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          id="mobile-sidebar-toggle-btn"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search input trigger */}
        <div
          id="global-search-trigger"
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center gap-2.5 w-full bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 rounded-xl px-3 py-2 cursor-pointer transition text-slate-500 hover:text-slate-800"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs sm:text-sm truncate">
            Search Accounts, Transactions, Cases (e.g. A101, T001, CASE-001)...
          </span>
          <kbd className="hidden sm:inline-flex ml-auto text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side: Actions, Demo Badge, Date/Time, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Start Judge Demo Button */}
        <button
          id="start-judge-demo-btn"
          onClick={startJudgeDemo}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow transition transform active:scale-95"
          title="Start 11-step interactive judge presentation"
        >
          <Award className="w-4 h-4" />
          <span className="hidden sm:inline">Start</span> Judge Demo
        </button>

        {/* CSV Import Button */}
        <button
          id="header-import-csv-btn"
          onClick={onOpenCsvModal}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200/90 transition"
          title="Import Transaction CSV"
        >
          <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
          <span className="hidden md:inline">Import</span> CSV
        </button>

        {/* Demo Mode Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200/80 rounded-lg text-indigo-700 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          <span>Demo Data Mode</span>
        </div>

        {/* Date / Time */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime}</span>
        </div>

        {/* Notifications */}
        <NotificationsMenu />

        {/* User Profile / Logout */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              PR
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Inspector Priya Rao
              </div>
              <div className="text-[10px] text-slate-500">FIU Special AML Unit</div>
            </div>
          </div>
          <button
            id="header-logout-btn"
            onClick={logoutUser}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
