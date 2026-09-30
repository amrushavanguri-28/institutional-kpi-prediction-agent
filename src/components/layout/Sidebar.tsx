import React from 'react';
import { useInstitutional } from '../../context/InstitutionalContext';
import {
  LayoutDashboard,
  Users,
  AlertOctagon,
  BookOpen,
  BadgeIndianRupee,
  CheckSquare,
  Bot,
  FileBarChart,
  Database,
  Activity,
  Sliders,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const {
    activeNavigation,
    setActiveNavigation,
    setIsSettingsOpen,
    unreviewedAlertsCount,
  } = useInstitutional();

  const mainNavigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Admissions', icon: Users, badge: null },
    { name: 'Academic Risk', icon: AlertOctagon, badge: 'Warning' },
    { name: 'Faculty Publications', icon: BookOpen, badge: null },
    { name: 'Research Funding', icon: BadgeIndianRupee, badge: null },
    { name: 'Faculty Work', icon: CheckSquare, badge: null },
    { name: 'AI Assistant', icon: Bot, badge: 'AI Agent' },
    { name: 'Reports', icon: FileBarChart, badge: null },
    { name: 'Data Management', icon: Database, badge: null },
  ];

  const handleNavClick = (navName: string) => {
    setActiveNavigation(navName);
    onMobileClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Institutional Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
          <div className="w-9 h-9 rounded bg-indigo-600 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-inner">
            KPI
          </div>
          <div>
            <div className="text-xs font-black tracking-wider uppercase text-slate-200">
              Institutional KPI
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-tight">
              Prediction & Warning Agent
            </div>
          </div>
        </div>

        {/* Primary Navigation List */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Monitoring Modules
          </div>

          {mainNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavigation === item.name;

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleNavClick(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-xs border-l-2 border-indigo-400 pl-[10px]'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-indigo-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      item.badge === 'AI Agent'
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/80'
                        : 'bg-amber-950 text-amber-300 border border-amber-800/80'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: System Status & Settings */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
          {/* System Status Display */}
          <div className="bg-slate-800/50 rounded-md p-2.5 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-slate-300">System Status</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">OPERATIONAL</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span>Risk Engine: Active</span>
              <span>Model: Gemini 3.8</span>
            </div>
          </div>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={() => {
              setIsSettingsOpen(true);
              onMobileClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>Settings & Parameters</span>
          </button>
        </div>
      </aside>
    </>
  );
};
