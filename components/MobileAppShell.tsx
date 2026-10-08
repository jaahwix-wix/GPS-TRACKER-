'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  MapPin,
  Home,
  Clock,
  AlertOctagon,
  ShieldCheck,
  MoreHorizontal,
  Search,
  ChevronDown,
  Gauge,
  Battery,
  Crosshair,
  Layers,
  Play,
  Pause,
  Phone,
  Radio,
  Share2,
  Calendar,
  Download,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Send,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Maximize2,
  Minimize2,
  Bell,
  X,
  Navigation2,
  Info,
  Compass,
  Sparkles,
} from 'lucide-react';
import MapViewport from '@/components/MapViewport';
import LocationIntelModal from '@/components/LocationIntelModal';
import {
  TrackedUser,
  GeofenceZone,
  Waypoint,
  HistoryRoute,
  EmergencyContact,
  SystemNotification,
} from '@/lib/types';
import { soundEffects } from '@/lib/audio';

export type MobileTab = 'home' | 'history' | 'sos' | 'zones' | 'more';

interface MobileAppShellProps {
  trackedUsers: TrackedUser[];
  currentUser: TrackedUser;
  onSelectUser: (user: TrackedUser) => void;
  onAddNewPhone: (phone: string, name?: string) => void;
  onLocateCurrentDevice?: () => void;
  onSetCustomLocation?: (coords: [number, number], name: string) => void;
  geofences: GeofenceZone[];
  onToggleGeofence: (id: string) => void;
  onAddGeofence: (zone: Omit<GeofenceZone, 'id'>) => void;
  onDeleteGeofence: (id: string) => void;
  selectedGeofenceId: string | null;
  onSelectGeofence: (id: string) => void;
  history: HistoryRoute;
  onSelectWaypoint: (wp: Waypoint) => void;
  emergencyContacts: EmergencyContact[];
  notifications: SystemNotification[];
  isTrackingActive: boolean;
  onToggleTracking: () => void;
  isSimulatingLiveTransit: boolean;
  onToggleSimulatingTransit: () => void;
  systemTime: string;
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

export default function MobileAppShell({
  trackedUsers,
  currentUser,
  onSelectUser,
  onAddNewPhone,
  onLocateCurrentDevice,
  onSetCustomLocation,
  geofences,
  onToggleGeofence,
  onAddGeofence,
  onDeleteGeofence,
  selectedGeofenceId,
  onSelectGeofence,
  history,
  onSelectWaypoint,
  emergencyContacts,
  notifications,
  isTrackingActive,
  onToggleTracking,
  isSimulatingLiveTransit,
  onToggleSimulatingTransit,
  systemTime,
}: MobileAppShellProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumberInput, setPhoneNumberInput] = useState('078649553');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);
  const [triangulationMessage, setTriangulationMessage] = useState<string | null>(null);
  const [isDesktopFrameMode, setIsDesktopFrameMode] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Real Address & Geocoding Search Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ place_id: number; display_name: string; lat: string; lon: string }>>([]);

  // Google Maps & Google Search Live Grounding Modal (gemini-2.5-flash)
  const [isIntelModalOpen, setIsIntelModalOpen] = useState(false);

  // Accuracy Guide Modal
  const [isAccuracyGuideOpen, setIsAccuracyGuideOpen] = useState(false);

  // SOS state
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [isSosAlarmActive, setIsSosAlarmActive] = useState(false);
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const [callNotification, setCallNotification] = useState<string | null>(null);

  // Geofence Create sheet
  const [isCreateZoneOpen, setIsCreateZoneOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState(350);
  const [newZoneColor, setNewZoneColor] = useState('#2563eb');
  const [newZoneIcon, setNewZoneIcon] = useState<'home' | 'briefcase' | 'graduation-cap' | 'warehouse'>('home');

  // History state
  const [historyFilter, setHistoryFilter] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(history.waypoints[0]?.id || null);

  // Notifications drawer
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Handle phone number search & instant triangulation
  const handleTrackPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = phoneNumberInput.trim();
    if (!raw) return;

    const fullNumber = raw.startsWith('+') || raw.startsWith('0') ? raw : `${selectedCountry.code} ${raw}`;
    setIsSearchingPhone(true);
    setTriangulationMessage(`Triangulating mobile tower & GPS satellites for ${fullNumber}...`);
    soundEffects.playBeep(700, 0.12);

    setTimeout(() => {
      onAddNewPhone(fullNumber);
      if (onLocateCurrentDevice) {
        onLocateCurrentDevice();
      }
      setIsSearchingPhone(false);
      setTriangulationMessage(`Live Signal Locked: ${fullNumber} (Current device location synchronized)`);
      soundEffects.playBeep(900, 0.18);

      setTimeout(() => {
        setTriangulationMessage(null);
      }, 3500);
    }, 900);
  };

  // Search real-world address via OpenStreetMap Nominatim
  const handleAddressSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressQuery.trim()) return;

    setIsSearchingAddress(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(addressQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.slice(0, 5));
      }
    } catch {
      // ignore
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleSelectSearchResult = (result: { lat: string; lon: string; display_name: string }) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const nameParts = result.display_name.split(', ');
    const shortName = nameParts.slice(0, 3).join(', ');

    if (onSetCustomLocation) {
      onSetCustomLocation([lat, lon], shortName);
    }

    setIsAddressModalOpen(false);
    setAddressQuery('');
    setSearchResults([]);
    setTriangulationMessage(`Location locked to: ${shortName}`);
    setTimeout(() => setTriangulationMessage(null), 3500);
  };

  // SOS countdown effect
  useEffect(() => {
    if (sosCountdown === null) return;

    const timer = setTimeout(() => {
      if (sosCountdown <= 1) {
        setSosCountdown(null);
        setIsSosAlarmActive(true);
        if (!isSirenMuted) {
          soundEffects.startSiren();
        }
      } else {
        setSosCountdown(sosCountdown - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [sosCountdown, isSirenMuted]);

  const handleStartSos = () => {
    setSosCountdown(3);
    soundEffects.playBeep(880, 0.2);
  };

  const handleCancelSos = () => {
    setSosCountdown(null);
    setIsSosAlarmActive(false);
    soundEffects.stopSiren();
  };

  const handleSimulateCall = (contact: EmergencyContact) => {
    setCallNotification(`Calling ${contact.name} (${contact.phone})...`);
    soundEffects.playBeep(440, 0.25);
    setTimeout(() => {
      setCallNotification(null);
    }, 3500);
  };

  const handleCreateZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    onAddGeofence({
      name: newZoneName.trim(),
      radiusMeters: Number(newZoneRadius),
      centerCoordinates: [
        currentUser.coordinates[0] + (Math.random() - 0.5) * 0.015,
        currentUser.coordinates[1] + (Math.random() - 0.5) * 0.015,
      ],
      color: newZoneColor,
      iconName: newZoneIcon,
      isActive: true,
      alertOnEntry: true,
      alertOnExit: true,
    });

    soundEffects.playGeofenceChime();
    setIsCreateZoneOpen(false);
    setNewZoneName('');
  };

  const exportHistoryCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Time,Location,Speed(km/h),Status\n';
    history.waypoints.forEach((wp) => {
      csvContent += `"${wp.time}","${wp.name}",${wp.speedKmH},"${wp.isLive ? 'Current' : 'History'}"\n`;
    });
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `LiveTrack_${currentUser.name.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-0 md:p-4 select-none">
      {/* Desktop Mode Toggle Bar */}
      <div className="hidden md:flex items-center justify-between w-full max-w-[420px] mb-2 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span>LiveTrack Pro Mobile App</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAccuracyGuideOpen(true)}
            className="flex items-center gap-1 hover:text-blue-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            title="How GPS Accuracy Works"
          >
            <Info className="w-3 h-3 text-blue-400" />
            <span>Accuracy Guide</span>
          </button>
          <button
            onClick={() => setIsDesktopFrameMode(!isDesktopFrameMode)}
            className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 transition-colors"
            title="Toggle Full Width or Phone Frame"
          >
            {isDesktopFrameMode ? (
              <>
                <Maximize2 className="w-3 h-3" />
                <span>Fluid</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3 h-3" />
                <span>Phone</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Smartphone Shell Container */}
      <div
        className={`w-full bg-[#0a192f] text-slate-100 flex flex-col overflow-hidden relative shadow-2xl transition-all duration-300 ${
          isDesktopFrameMode
            ? 'h-[100dvh] md:max-w-[420px] md:h-[900px] md:max-h-[94vh] md:rounded-[48px] md:border-4 md:border-slate-800'
            : 'w-full h-[100dvh] rounded-none border-none'
        }`}
        style={{ minHeight: '100dvh' }}
      >
        {/* Dynamic Island / Speaker Notch (visible on phone frame) */}
        <div className="hidden md:flex absolute top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-full z-40 items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-950/80 border border-blue-900/60" />
        </div>

        {/* Mobile Top Status Bar */}
        <div className="pt-2 px-6 pb-1 flex justify-between items-center text-[11px] font-mono text-slate-300 font-semibold bg-slate-950/60 backdrop-blur-xs z-30 shrink-0">
          <span suppressHydrationWarning>{systemTime.split(',')[1]?.trim().slice(0, 5) || '14:32'}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-tight text-emerald-400 font-sans font-bold">● 5G</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono">{currentUser.batteryLevel}%</span>
              <Battery className="w-3.5 h-3.5 fill-current text-slate-300" />
            </div>
          </div>
        </div>

        {/* Mobile Header Bar */}
        <header className="px-3.5 py-2 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 flex flex-col gap-2 z-30 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                <MapPin className="w-4 h-4 fill-current" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold text-white tracking-tight">
                  LiveTrack
                </span>
                <span className="text-base font-extrabold text-blue-400">Pro</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Accuracy Guide Trigger */}
              <button
                onClick={() => setIsAccuracyGuideOpen(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                title="GPS Accuracy Info"
              >
                <Info className="w-4 h-4 text-blue-400" />
              </button>

              {/* Notifications Bell */}
              <button
                onClick={() => setIsNotifDrawerOpen(!isNotifDrawerOpen)}
                className="relative p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Active User Badge Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[85px]">
                  {currentUser.name.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Mobile Number Search & Direct Triangulation Input */}
          <form suppressHydrationWarning onSubmit={handleTrackPhoneSubmit} className="flex items-center gap-1.5">
            {/* Country flag selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="h-8 px-2 bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-1 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <span>{selectedCountry.flag}</span>
                <span className="font-mono font-semibold">{selectedCountry.code}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCountryDropdownOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 max-h-48 overflow-y-auto">
                  {COUNTRY_CODES.map((item) => (
                    <button
                      key={item.code + item.country}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(item);
                        setIsCountryDropdownOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center justify-between text-xs hover:bg-slate-800 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{item.flag}</span>
                        <span className="text-slate-300 truncate">{item.country}</span>
                      </span>
                      <span className="font-mono text-slate-400 text-[10px]">{item.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile number input */}
            <input
              suppressHydrationWarning
              type="text"
              value={phoneNumberInput}
              onChange={(e) => setPhoneNumberInput(e.target.value)}
              placeholder="078649553"
              className="h-8 flex-1 px-2.5 bg-slate-800/90 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />

            {/* Locate button */}
            <button
              type="submit"
              disabled={isSearchingPhone}
              className="h-8 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <Search className="w-3 h-3" />
              <span>{isSearchingPhone ? 'Locating...' : 'Track'}</span>
            </button>
          </form>

          {/* Quick Real-Location Action Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 pt-0.5 text-[11px] no-scrollbar">
            {/* Real Hardware GPS detector */}
            {onLocateCurrentDevice && (
              <button
                type="button"
                onClick={onLocateCurrentDevice}
                className="px-2.5 py-1 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
                title="Detect exact coordinates of this physical device using hardware GPS"
              >
                <Navigation2 className="w-3 h-3 text-emerald-400 fill-current animate-pulse" />
                <span>Detect My Live Real GPS</span>
              </button>
            )}

            {/* Search Real Address or City */}
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
              title="Search and pinpoint exact real-world street, city, or coordinates"
            >
              <Search className="w-3 h-3 text-blue-400" />
              <span>Search Real Address/City</span>
            </button>

            {/* Google Maps & Google Search Live Grounding (gemini-2.5-flash) */}
            <button
              type="button"
              onClick={() => setIsIntelModalOpen(true)}
              className="px-2.5 py-1 bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-500/50 text-indigo-300 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer"
              title="Google Maps & Google Search Live Grounding (gemini-2.5-flash)"
            >
              <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
              <span>Google Maps &amp; Search Intel</span>
            </button>
          </div>

          {/* Triangulation feedback alert toast */}
          {triangulationMessage && (
            <div className="px-2.5 py-1.5 rounded-lg bg-blue-950/80 border border-blue-500/50 text-[11px] font-semibold text-blue-300 flex items-center gap-1.5 animate-in fade-in">
              <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse shrink-0" />
              <span className="truncate">{triangulationMessage}</span>
            </div>
          )}
        </header>

        {/* Notifications Drawer (overlay) */}
        {isNotifDrawerOpen && (
          <div className="absolute top-28 left-4 right-4 z-40 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-bold text-white">Notifications ({notifications.length})</span>
              <button
                onClick={() => setIsNotifDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                  <div className="flex justify-between items-center text-slate-200 font-semibold mb-0.5">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screen Content Viewport */}
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
          {/* TAB 1: HOME (Live GPS Map + Telemetry Card) - Kept persistent for instant switching */}
          <div
            className={`flex-1 min-h-0 flex-col h-full overflow-hidden relative ${
              activeTab === 'home' ? 'flex' : 'hidden'
            }`}
          >
              {/* Detailed Area & Location Bar matching user request */}
              <div className="px-3.5 py-2 bg-[#081325] border-b border-slate-800 flex items-center justify-between z-20 shrink-0">
                <div
                  onClick={onLocateCurrentDevice}
                  className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
                  title="Click to refresh exact current GPS location"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/40">
                    <MapPin className="w-4 h-4 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                        Current Area
                      </span>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-[10px] text-emerald-400 font-semibold font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        GPS {currentUser.gpsAccuracyMeters}m
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-white truncate leading-tight">
                      {currentUser.currentLocationName}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {currentUser.coordinates[0].toFixed(5)}° N, {currentUser.coordinates[1].toFixed(5)}° W
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Live GPS Sync Button */}
                  {onLocateCurrentDevice && (
                    <button
                      onClick={onLocateCurrentDevice}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md shadow-emerald-600/30 transition-colors cursor-pointer"
                      title="Sync exact current live GPS location"
                    >
                      <Navigation2 className="w-3 h-3 fill-current animate-pulse" />
                      <span>Live GPS</span>
                    </button>
                  )}

                  {/* Location Intelligence (Google Maps & Google Search via gemini-2.5-flash) */}
                  <button
                    type="button"
                    onClick={() => setIsIntelModalOpen(true)}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
                    title="Live Area Intel powered by Google Maps & Google Search (gemini-2.5-flash)"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-200 animate-pulse" />
                    <span>Area Intel</span>
                  </button>

                  {/* Transit Motion Simulation button */}
                  <button
                    onClick={onToggleSimulatingTransit}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                      isSimulatingLiveTransit
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                    title="Simulate live GPS car movement along Bo urban roads"
                  >
                    {isSimulatingLiveTransit ? (
                      <>
                        <Pause className="w-3 h-3 text-emerald-400" />
                        <span>12 km/h</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 text-slate-400" />
                        <span>Idle</span>
                      </>
                    )}
                  </button>

                  {/* Toggle Map Full View button */}
                  <button
                    onClick={() => setIsMapExpanded(!isMapExpanded)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={isMapExpanded ? 'Show telemetry card' : 'Expand full map'}
                  >
                    {isMapExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Interactive Satellite/Street Map Viewport with guaranteed min-height */}
              <div
                className={`w-full relative overflow-hidden transition-all duration-300 ${
                  isMapExpanded ? 'flex-1 h-full min-h-[500px]' : 'flex-1 min-h-[360px]'
                }`}
                style={{ minHeight: isMapExpanded ? '500px' : '360px' }}
              >
                <MapViewport
                  currentUser={currentUser}
                  geofences={geofences}
                  historyWaypoints={history.waypoints}
                  showHistoryPath={false}
                  selectedGeofenceId={selectedGeofenceId}
                  onSelectGeofence={onSelectGeofence}
                  onLocateCurrentDevice={onLocateCurrentDevice}
                  isTrackingActive={isTrackingActive}
                  isExpanded={isMapExpanded}
                  onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
                />
              </div>

              {/* Bottom Target Profile & Telemetry HUD Card */}
              {!isMapExpanded ? (
                <div className="p-3 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 z-20 shrink-0 space-y-2.5">
                  {/* User Info Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-blue-500 shrink-0 bg-slate-800 flex items-center justify-center font-bold text-xs">
                        {currentUser.avatar ? (
                          <Image
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span>{currentUser.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {currentUser.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {currentUser.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                      <button
                        onClick={onToggleTracking}
                        className={`p-1.5 rounded-lg border text-xs font-semibold ${
                          isTrackingActive
                            ? 'border-blue-500/50 bg-blue-900/40 text-blue-300'
                            : 'border-emerald-500/50 bg-emerald-900/40 text-emerald-300'
                        }`}
                        title={isTrackingActive ? 'Pause GPS tracking' : 'Resume GPS tracking'}
                      >
                        {isTrackingActive ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 3 Telemetry Metrics (Speed, Battery, Accuracy) matching MVP */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                        <Gauge className="w-3 h-3 text-blue-400" />
                        <span>Speed</span>
                      </div>
                      <span className="text-xs font-extrabold font-mono text-white">
                        {currentUser.speedKmH} km/h
                      </span>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                        <Battery className="w-3 h-3 text-emerald-400" />
                        <span>Battery</span>
                      </div>
                      <span className="text-xs font-extrabold font-mono text-white">
                        {currentUser.batteryLevel}%
                      </span>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                        <Crosshair className="w-3 h-3 text-purple-400" />
                        <span>Accuracy</span>
                      </div>
                      <span className="text-xs font-extrabold font-mono text-white">
                        {currentUser.gpsAccuracyMeters} m
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-1.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-white">{currentUser.name}</span>
                    <span className="text-slate-500">·</span>
                    <span className="font-mono text-slate-400">{currentUser.speedKmH} km/h</span>
                  </div>
                  <button
                    onClick={() => setIsMapExpanded(false)}
                    className="text-[11px] text-blue-400 font-bold hover:underline"
                  >
                    Show Details
                  </button>
                </div>
              )}
            </div>

          {/* TAB 2: HISTORY (Timeline Trail & Replay) */}
          {activeTab === 'history' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
              {/* Header Card */}
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white tracking-tight">
                    Location History Trail
                  </h3>
                  <button
                    onClick={exportHistoryCsv}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>
                </div>

                {/* Date Filter Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  {(['today', 'yesterday', 'custom'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setHistoryFilter(d)}
                      className={`py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                        historyFilter === d
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Waypoints List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {history.waypoints.map((wp) => {
                  const isSelected = selectedWaypointId === wp.id;
                  return (
                    <div
                      key={wp.id}
                      onClick={() => {
                        setSelectedWaypointId(wp.id);
                        onSelectWaypoint(wp);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-950/70 border-blue-500'
                          : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-mono font-semibold text-slate-400 w-11 shrink-0">
                          {wp.time}
                        </span>
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            wp.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-blue-500'
                          }`}
                        />
                        <span className="text-xs font-semibold text-white truncate">
                          {wp.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">
                        {wp.speedKmH} km/h
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Summary Metrics Bar matching MVP */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-3 divide-x divide-slate-800 text-center shrink-0">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Distance</span>
                  <span className="text-xs font-bold font-mono text-white">
                    {history.totalDistanceKm} km
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Duration</span>
                  <span className="text-xs font-bold font-mono text-white">
                    {history.durationFormatted}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Avg. Speed</span>
                  <span className="text-xs font-bold font-mono text-white">
                    {history.avgSpeedKmH} km/h
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMERGENCY SOS */}
          {activeTab === 'sos' && (
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 bg-slate-900 text-center">
              {/* Header Alert banner */}
              <div className="bg-rose-950/60 border border-rose-600/50 rounded-2xl p-3 mb-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-200">
                      Emergency Alert Center
                    </h4>
                    <p className="text-[10px] text-rose-300/80">
                      Broadcasting directly with mobile phone coordinates
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isSosAlarmActive) {
                      if (!isSirenMuted) soundEffects.stopSiren();
                      else soundEffects.startSiren();
                    }
                    setIsSirenMuted(!isSirenMuted);
                  }}
                  className="p-1 rounded-lg bg-rose-900/60 text-white"
                >
                  {isSirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Big Pulsating SOS Button matching MVP */}
              <div className="relative w-36 h-36 mx-auto my-3 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full bg-rose-600/30 ${
                    isSosAlarmActive || sosCountdown !== null ? 'animate-ping' : ''
                  }`}
                />
                <div className="absolute -inset-3 rounded-full border-2 border-rose-500/40 animate-pulse" />

                <button
                  onClick={
                    isSosAlarmActive
                      ? handleCancelSos
                      : sosCountdown !== null
                      ? handleCancelSos
                      : handleStartSos
                  }
                  className={`relative w-32 h-32 rounded-full text-white font-black flex flex-col items-center justify-center shadow-2xl transition-all cursor-pointer ${
                    isSosAlarmActive
                      ? 'bg-slate-950 border-4 border-rose-500'
                      : sosCountdown !== null
                      ? 'bg-amber-600 border-4 border-white animate-pulse'
                      : 'bg-rose-600 border-4 border-white hover:bg-rose-700 active:scale-95'
                  }`}
                >
                  {sosCountdown !== null ? (
                    <>
                      <span className="text-3xl font-black">{sosCountdown}</span>
                      <span className="text-[9px] uppercase font-bold text-amber-200">
                        Tap to cancel
                      </span>
                    </>
                  ) : isSosAlarmActive ? (
                    <>
                      <span className="text-sm font-black text-rose-400">ALARM ACTIVE</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 mt-1">
                        Tap to Stop
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-black tracking-wider">SOS</span>
                      <span className="text-[9px] font-semibold text-rose-200 mt-0.5">
                        Hold or Tap
                      </span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-sm font-bold text-white mt-1">
                {isSosAlarmActive ? '🚨 SOS BROADCAST TRANSMITTED' : 'Emergency Alert'}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-3">
                Send live mobile location to emergency contacts and selected guardians.
              </p>

              {callNotification && (
                <div className="mb-3 p-2 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs font-semibold text-emerald-300">
                  {callNotification}
                </div>
              )}

              {/* Emergency Contacts List with direct call buttons matching MVP */}
              <div className="mt-2 text-left bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
                <span className="text-xs font-bold text-slate-300 block mb-2">
                  Emergency Contacts (Direct Dial)
                </span>
                <div className="space-y-2">
                  {emergencyContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {contact.name[0]}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white leading-tight font-mono">
                            {contact.phone}
                          </h5>
                          <p className="text-[10px] text-slate-400">
                            {contact.relation} · {contact.name}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSimulateCall(contact)}
                        className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                        title={`Call ${contact.name}`}
                      >
                        <Phone className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GEOFENCING SAFE ZONES */}
          {activeTab === 'zones' && (
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-white">Safe Zone Geofencing</h3>
                  <p className="text-[10px] text-slate-400">
                    Receive boundary alerts when target enters or departs
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateZoneOpen(true)}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create</span>
                </button>
              </div>

              {/* Safe Zones List matching MVP */}
              <div className="space-y-2">
                {geofences.map((zone) => {
                  const isSelected = selectedGeofenceId === zone.id;
                  return (
                    <div
                      key={zone.id}
                      onClick={() => onSelectGeofence(zone.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-blue-950/70 border-blue-500'
                          : 'bg-slate-800/70 border-slate-700/70 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: zone.color }}
                        >
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{zone.name}</h4>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Radius: {zone.radiusMeters} m
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onToggleGeofence(zone.id)}
                          className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                            zone.isActive ? 'bg-blue-600' : 'bg-slate-600'
                          }`}
                        >
                          <div
                            className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform ${
                              zone.isActive ? 'translate-x-4.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => onDeleteGeofence(zone.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Create Zone Modal */}
              {isCreateZoneOpen && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-700 animate-in fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-white">New Safe Zone</h4>
                    <button onClick={() => setIsCreateZoneOpen(false)} className="text-slate-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form suppressHydrationWarning onSubmit={handleCreateZoneSubmit} className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Zone Name</label>
                      <input
                        suppressHydrationWarning
                        type="text"
                        required
                        placeholder="e.g. Bo Clock Tower Residence"
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Radius</span>
                        <span className="font-mono text-blue-400 font-bold">{newZoneRadius}m</span>
                      </div>
                      <input
                        suppressHydrationWarning
                        type="range"
                        min="100"
                        max="1500"
                        step="50"
                        value={newZoneRadius}
                        onChange={(e) => setNewZoneRadius(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
                    >
                      Save Safe Zone
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MORE (Tracked Mobile Numbers & Settings) */}
          {activeTab === 'more' && (
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 bg-slate-900 space-y-4">
              {/* Tracked Devices List */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
                <span className="text-xs font-bold text-white block mb-2">
                  Tracked Mobile Numbers ({trackedUsers.length})
                </span>
                <div className="space-y-2">
                  {trackedUsers.map((user) => {
                    const isActive = user.id === currentUser.id;
                    return (
                      <div
                        key={user.id}
                        onClick={() => {
                          onSelectUser(user);
                          setActiveTab('home');
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-blue-950/80 border-blue-500'
                            : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-600 shrink-0 bg-slate-700 flex items-center justify-center font-bold text-xs">
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span>{user.name.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white">{user.name}</h5>
                            <p className="text-[10px] text-slate-400 font-mono">{user.phone}</p>
                          </div>
                        </div>

                        {isActive ? (
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full border border-blue-500/40">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">
                            Select
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Accuracy & Technology Guide Card */}
              <div className="bg-slate-950/80 border border-blue-900/40 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <Info className="w-4 h-4" />
                  <span>How Phone Number Geolocation Works</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Due to mobile carrier encryption and operating system security safeguards (iOS &amp; Android), true physical GPS data requires the target phone to have an authorized client or sharing link. To test with real high-precision hardware GPS right now, use the <strong className="text-slate-200">&ldquo;Detect My Live Real GPS&rdquo;</strong> button.
                </p>
                <button
                  onClick={() => setIsAccuracyGuideOpen(true)}
                  className="text-xs text-blue-400 font-bold hover:underline block pt-1"
                >
                  Read Full Accuracy &amp; Telecom Guide →
                </button>
              </div>

              {/* Quick Settings */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-3">
                <span className="text-xs font-bold text-white block">System Preferences</span>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>GPS Telemetry Polling</span>
                  <span className="font-mono font-bold text-blue-400">2.5s (High Precision)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Cellular Triangulation</span>
                  <span className="text-emerald-400 font-bold">Active</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Audit Logs</span>
                  <button
                    onClick={exportHistoryCsv}
                    className="text-blue-400 font-bold hover:underline"
                  >
                    Download CSV
                  </button>
                </div>
              </div>

              {/* Branding tagline */}
              <div className="p-3 text-center text-xs italic font-serif text-blue-300/80">
                &ldquo;Because your loved ones matter...&rdquo;
              </div>
            </div>
          )}
        </main>

        {/* Real Address / City Search Modal */}
        {isAddressModalOpen && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold text-white">Search Real Address or City</h4>
                </div>
                <button onClick={() => setIsAddressModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form suppressHydrationWarning onSubmit={handleAddressSearchSubmit} className="flex items-center gap-1.5">
                <input
                  suppressHydrationWarning
                  type="text"
                  placeholder="e.g. Bo Clock Tower, Tikonko Rd, Bo School..."
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isSearchingAddress}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSearchingAddress ? '...' : 'Find'}
                </button>
              </form>

              {/* Results list */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {searchResults.map((item) => (
                  <button
                    key={item.place_id}
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full p-2 rounded-xl bg-slate-800/80 hover:bg-blue-900/50 border border-slate-700/80 hover:border-blue-500 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-200 line-clamp-2 leading-snug">
                        {item.display_name}
                      </span>
                    </div>
                  </button>
                ))}
                {searchResults.length === 0 && !isSearchingAddress && addressQuery.length > 2 && (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No matching real-world places found. Try another city or neighborhood name.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Accuracy & Telecom Guide Modal */}
        {isAccuracyGuideOpen && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold text-white">How Phone Tracking Works</h4>
                </div>
                <button onClick={() => setIsAccuracyGuideOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-3 leading-relaxed max-h-72 overflow-y-auto pr-1">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <h5 className="font-bold text-blue-400 mb-1">1. Carrier &amp; Privacy Protection</h5>
                  <p className="text-[11px] text-slate-400">
                    Telecommunications networks (GSM/LTE/5G) and smartphone operating systems (iOS &amp; Android) strictly encrypt device location. No website or web app can silently extract another person&apos;s live GPS coordinates across the internet solely from their phone number.
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <h5 className="font-bold text-emerald-400 mb-1">2. How Family Safety Apps Work</h5>
                  <p className="text-[11px] text-slate-400">
                    Apps like Apple Find My, Life360, or LiveTrack Pro require the companion tracker app installed on the target phone (or an authorized mutual location sharing token) to broadcast real hardware satellite coordinates.
                  </p>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <h5 className="font-bold text-purple-400 mb-1">3. How to test real GPS right now</h5>
                  <p className="text-[11px] text-slate-400">
                    Tap <strong className="text-emerald-300">&ldquo;Detect My Live Real GPS&rdquo;</strong> to allow this app to read your physical device&apos;s GPS chip, or tap <strong className="text-blue-300">&ldquo;Search Real Address/City&rdquo;</strong> to place the phone at any verified real address in the world.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAccuracyGuideOpen(false)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        )}

        {/* Location Intelligence Modal (Google Maps & Google Search via gemini-2.5-flash) */}
        <LocationIntelModal
          isOpen={isIntelModalOpen}
          onClose={() => setIsIntelModalOpen(false)}
          currentUser={currentUser}
        />

        {/* Mobile Bottom Navigation Bar matching MVP */}
        <nav className="h-16 bg-slate-950 border-t border-slate-800 flex items-center justify-around px-2 z-30 shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors cursor-pointer ${
              activeTab === 'history' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>History</span>
          </button>

          <button
            onClick={() => setActiveTab('sos')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors cursor-pointer ${
              activeTab === 'sos' ? 'text-rose-400' : 'text-rose-500/80 hover:text-rose-400'
            }`}
          >
            <div className="relative">
              <AlertOctagon className="w-5 h-5 text-rose-500" />
              {isSosAlarmActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <span>SOS</span>
          </button>

          <button
            onClick={() => setActiveTab('zones')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors cursor-pointer ${
              activeTab === 'zones' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Safe Zones</span>
          </button>

          <button
            onClick={() => setActiveTab('more')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors cursor-pointer ${
              activeTab === 'more' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
            <span>More</span>
          </button>
        </nav>

        {/* Home indicator bar (iOS style) */}
        <div className="h-3.5 bg-slate-950 flex justify-center items-center pb-1 shrink-0">
          <div className="w-28 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
}
