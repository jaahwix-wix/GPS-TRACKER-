'use client';

import React from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Navigation,
  Clock,
  ShieldCheck,
  AlertOctagon,
  Users,
  FileText,
  Settings,
  LogOut,
  Smartphone,
  X,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'live_tracking'
  | 'history'
  | 'geofencing'
  | 'sos'
  | 'users'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  sosActiveCount?: number;
  onOpenMobileCompanion?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  currentTab,
  onSelectTab,
  sosActiveCount = 0,
  onOpenMobileCompanion,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live_tracking', label: 'Live Tracking', icon: Navigation },
    { id: 'history', label: 'Location History', icon: Clock },
    { id: 'geofencing', label: 'Geofencing', icon: ShieldCheck },
    {
      id: 'sos',
      label: 'Emergency SOS',
      icon: AlertOctagon,
      badge: sosActiveCount > 0 ? 'ALERT' : undefined,
    },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (tabId: NavTab) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0a192f] text-slate-200 flex flex-col h-full border-r border-slate-800/80 shrink-0 select-none shadow-xl transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
              <svg
                className="w-5 h-5 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                <span>LiveTrack</span>
                <span className="text-blue-400 font-extrabold">Pro</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                Real People. Real Time. Real Safety.
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isSos = item.id === 'sos';

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? isSos
                      ? 'bg-rose-600 text-white font-semibold shadow-md shadow-rose-900/40'
                      : 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : isSos
                    ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-200'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : isSos
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                />
                <span className="truncate flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Mobile companion preview button */}
          {onOpenMobileCompanion && (
            <div className="pt-4 mt-4 border-t border-slate-800/60">
              <button
                onClick={() => {
                  onOpenMobileCompanion();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 hover:bg-emerald-900/40 transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-left flex-1 font-semibold">Tracked Phone App</span>
                <span className="text-[10px] bg-emerald-600/60 text-white px-1.5 py-0.5 rounded">Preview</span>
              </button>
            </div>
          )}
        </nav>

        {/* User Administrator Footer Profile */}
        <div className="p-3.5 m-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-blue-500/40 shrink-0 bg-slate-800">
              <Image
                src="/avatars/avatar_james_weekes_1791130259379.jpg"
                alt="James Weekes"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-white truncate">
                James Weekes
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                Administrator
              </p>
            </div>
          </div>
          <button
            title="Sign out / Switch user"
            onClick={() => {
              onSelectTab('settings');
              if (onCloseMobile) onCloseMobile();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
