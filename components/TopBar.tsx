'use client';

import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Check, ShieldAlert, Wifi, X, CheckCircle2, Menu } from 'lucide-react';
import { SystemNotification } from '@/lib/types';

interface TopBarProps {
  onSearchPhone: (fullNumber: string) => void;
  notifications: SystemNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
  systemTime: string;
  onToggleMobileSidebar?: () => void;
}

const COUNTRY_CODES = [
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
];

export default function TopBar({
  onSearchPhone,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  systemTime,
  onToggleMobileSidebar,
}: TopBarProps) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('078649553');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    const fullNumber = `${selectedCountry.code} ${phoneNumber.trim()}`;
    onSearchPhone(fullNumber);
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shadow-xs relative z-30">
      {/* Track by Phone Number Form */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Mobile Hamburger Menu Toggle */}
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Phone Icon */}
        <div className="hidden sm:flex w-10 h-10 rounded-full bg-blue-600 text-white items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
        </div>

        <form suppressHydrationWarning onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Track by Phone Number
            </h2>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Enter the person&apos;s phone number to view their live location.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Country Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="h-10 px-3 bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-blue-500/20"
              >
                <span className="text-base">{selectedCountry.flag}</span>
                <span className="font-semibold text-slate-700">{selectedCountry.code}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
              </button>

              {isCountryDropdownOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Country
                  </div>
                  {COUNTRY_CODES.map((item) => (
                    <button
                      key={item.code + item.country}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(item);
                        setIsCountryDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.flag}</span>
                        <span className="font-medium text-slate-700">{item.country}</span>
                      </div>
                      <span className="font-mono text-slate-500 text-[11px]">{item.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Input */}
            <div className="relative">
              <input
                suppressHydrationWarning
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="078649553"
                className="h-10 w-44 md:w-56 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono tracking-wider focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find &amp; Track</span>
            </button>
          </div>
        </form>
      </div>

      {/* Right Utility Bar */}
      <div className="flex items-center gap-5">
        {/* System Online Badge */}
        <div className="hidden lg:flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-800 tracking-tight">System Online</span>
          </div>
          <span suppressHydrationWarning className="text-[11px] text-slate-500 font-mono">
            Last updated: {systemTime}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileMenuOpen(false);
            }}
            className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">Safety Notifications</h3>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
                    {unreadCount} unread
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onClearAllNotifications}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No safety notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5 ${
                        !notif.isRead ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'safe_zone' && (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {notif.type === 'sos' && (
                          <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {notif.type === 'info' && (
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                            <Wifi className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-semibold text-slate-900 truncate">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile JW Capsule */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center tracking-wider shadow-sm">
              JW
            </div>
            <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
              James Weekes
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">James Weekes</p>
                <p className="text-[11px] text-slate-500">jaahwix@gmail.com</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  System Administrator
                </span>
              </div>
              <div className="py-1 text-xs text-slate-700">
                <button
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50"
                >
                  Organization Security
                </button>
                <button
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50"
                >
                  GPS Precision Calibration
                </button>
                <button
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50"
                >
                  API &amp; Webhooks
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
