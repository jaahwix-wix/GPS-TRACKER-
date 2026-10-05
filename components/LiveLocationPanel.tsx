'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MapPin,
  Clock,
  Gauge,
  Compass,
  BatteryCharging,
  Crosshair,
  Pause,
  Play,
  ExternalLink,
  Edit2,
} from 'lucide-react';
import { TrackedUser } from '@/lib/types';

interface LiveLocationPanelProps {
  user: TrackedUser;
  isTrackingActive: boolean;
  onToggleTracking: () => void;
  onViewFullDetails: () => void;
  onEditUser: () => void;
}

export default function LiveLocationPanel({
  user,
  isTrackingActive,
  onToggleTracking,
  onViewFullDetails,
  onEditUser,
}: LiveLocationPanelProps) {
  const [imgError, setImgError] = useState(false);

  // Battery status color
  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-emerald-600 bg-emerald-500';
    if (level > 20) return 'text-amber-600 bg-amber-500';
    return 'text-rose-600 bg-rose-500';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Live Location Details
            </h3>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{user.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 shrink-0 shadow-xs bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
              {!imgError && user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                  onError={() => setImgError(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{user.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {user.name}
              </h4>
              <p className="text-xs text-slate-500 font-mono tracking-tight mt-0.5">
                {user.phone}
              </p>
            </div>
          </div>

          <button
            onClick={onEditUser}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3 text-slate-400" />
            <span>Edit</span>
          </button>
        </div>

        {/* Telemetry Grid List */}
        <div className="py-3 space-y-3.5 text-xs">
          {/* Current Location */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-blue-600 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 font-medium block">
                Current Location
              </span>
              <span className="font-semibold text-slate-800 break-words">
                {user.currentLocationName}
              </span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-blue-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">
                Last Updated
              </span>
              <span className="font-medium text-slate-700 font-mono">
                {user.lastUpdated}
              </span>
            </div>
          </div>

          {/* Speed */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-blue-600 shrink-0">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">
                Speed
              </span>
              <span className="font-semibold text-slate-800 font-mono">
                {user.speedKmH} km/h
              </span>
            </div>
          </div>

          {/* Direction */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-blue-600 shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">
                Direction
              </span>
              <span className="font-medium text-slate-700">
                {user.direction} ({user.headingDegrees}°)
              </span>
            </div>
          </div>

          {/* Battery Level */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-emerald-600 shrink-0">
              <BatteryCharging className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Battery Level
                </span>
                <span className="font-bold text-slate-800 font-mono">
                  {user.batteryLevel}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    getBatteryColor(user.batteryLevel).split(' ')[1]
                  }`}
                  style={{ width: `${user.batteryLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* GPS Accuracy */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-blue-600 shrink-0">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">
                GPS Accuracy
              </span>
              <span className="font-semibold text-slate-800 font-mono">
                {user.gpsAccuracyMeters} meters
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={onViewFullDetails}
          className="h-10 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Full Details</span>
        </button>

        <button
          onClick={onToggleTracking}
          className={`h-10 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap ${
            isTrackingActive
              ? 'border-blue-300 text-blue-700 bg-blue-50/60 hover:bg-blue-100'
              : 'border-emerald-300 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100'
          }`}
        >
          {isTrackingActive ? (
            <>
              <Pause className="w-3.5 h-3.5 text-blue-600" />
              <span>Stop Tracking</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>Resume Tracking</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
