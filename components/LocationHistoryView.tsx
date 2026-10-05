'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Calendar,
  Route,
  Clock,
  Gauge,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { TrackedUser, HistoryRoute, Waypoint } from '@/lib/types';

interface LocationHistoryViewProps {
  user: TrackedUser;
  history: HistoryRoute;
  onSelectWaypoint: (wp: Waypoint) => void;
  onClose?: () => void;
}

export default function LocationHistoryView({
  user,
  history,
  onSelectWaypoint,
}: LocationHistoryViewProps) {
  const [activeDateFilter, setActiveDateFilter] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);
  const [selectedWpId, setSelectedWpId] = useState<string | null>(history.waypoints[0]?.id || null);

  const handleReplayToggle = () => {
    setIsPlayingReplay(!isPlayingReplay);
  };

  const handleExportGPX = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `LiveTrack_History_${user.name.replace(' ', '_')}_${history.date}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md flex flex-col h-full overflow-hidden">
      {/* Top Header Card matching MVP */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Location History Trail
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportGPX}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
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
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                {user.name}
              </h4>
              <p className="text-[11px] text-slate-500 font-mono">
                {user.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>

        {/* Date Filter Segmented Controls matching MVP */}
        <div className="grid grid-cols-3 gap-1.5 mt-3">
          <button
            onClick={() => setActiveDateFilter('today')}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeDateFilter === 'today'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveDateFilter('yesterday')}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeDateFilter === 'yesterday'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => setActiveDateFilter('custom')}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              activeDateFilter === 'custom'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Custom Date</span>
          </button>
        </div>
      </div>

      {/* Waypoint Timeline List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {history.waypoints.map((wp, index) => {
          const isSelected = selectedWpId === wp.id;
          const isLive = wp.isLive;

          return (
            <div
              key={wp.id}
              onClick={() => {
                setSelectedWpId(wp.id);
                onSelectWaypoint(wp);
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/50 shadow-2xs'
                  : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Time Indicator & Timeline Dot */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-700 w-12">
                    {wp.time}
                  </span>
                  <div
                    className={`w-3 h-3 rounded-full border-2 border-white shadow-xs shrink-0 ${
                      isLive ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                  />
                </div>

                {/* Location Name & Live Tag */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {wp.name}
                    </span>
                    {isLive && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        (Live)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Speed readout */}
              <div className="text-right shrink-0">
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  {wp.speedKmH} km/h
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aggregate Metrics Footer Bar matching MVP */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-3 divide-x divide-slate-200 text-center">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Total Distance
          </span>
          <span className="text-xs font-bold text-slate-800 font-mono">
            {history.totalDistanceKm} km
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Duration
          </span>
          <span className="text-xs font-bold text-slate-800 font-mono">
            {history.durationFormatted}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Avg. Speed
          </span>
          <span className="text-xs font-bold text-slate-800 font-mono">
            {history.avgSpeedKmH} km/h
          </span>
        </div>
      </div>
    </div>
  );
}
