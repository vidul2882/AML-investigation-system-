import React from 'react';
import { useAML } from '../../context/AMLContext';
import { ActiveView } from '../../types';
import {
  LayoutDashboard,
  Activity,
  Share2,
  Briefcase,
  SearchCode,
  Bot,
  FileSpreadsheet,
  PlaySquare,
  Settings,
  ShieldCheck,
  TrendingDown,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeView, setActiveView, cases, detectionResult } = useAML();

  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions',
      label: 'Transaction Monitor',
      icon: Activity,
      badge: detectionResult.stats.suspiciousTransactions,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'network',
      label: 'Money Network',
      icon: Share2,
      badge: 'Visualizer',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'cases',
      label: 'Suspicious Cases',
      icon: Briefcase,
      badge: cases.filter((c) => c.status === 'OPEN').length,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'investigation',
      label: 'Investigation',
      icon: SearchCode,
      badge: 'Active',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'ai_investigator',
      label: 'AI Investigator',
      icon: Bot,
      badge: 'AI Engine',
      badgeColor: 'bg-purple-100 text-purple-700 font-semibold',
    },
    {
      id: 'case_reports',
      label: 'Case Reports',
      icon: FileSpreadsheet,
    },
    {
      id: 'demo_scenarios',
      label: 'Demo Scenario',
      icon: PlaySquare,
      badge: '3 Live',
      badgeColor: 'bg-emerald-100 text-emerald-800 font-semibold',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 w-64 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                AMLens
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                v2.4
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 tracking-tight">
              Follow the Money
            </p>
          </div>
        </div>

        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1 text-slate-400 hover:text-slate-700 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Core Workflow Tag */}
      <div className="px-4 pt-3 pb-1">
        <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
          <TrendingDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="text-[11px] font-medium text-slate-600">
            Detect → Trace → Explain
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Compliance Disclaimer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="text-[11px] text-slate-500 leading-relaxed">
          <div className="font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            Simulated Sandbox
          </div>
          AMLens is a hackathon prototype using synthetic financial graph data.
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </>
  );
};
