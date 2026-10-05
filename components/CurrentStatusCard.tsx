'use client';

import React from 'react';
import { Radio } from 'lucide-react';

interface CurrentStatusCardProps {
  isTracking: boolean;
  onToggleTracking: () => void;
  speed: number;
}

export default function CurrentStatusCard({
  isTracking,
  onToggleTracking,
  speed,
}: CurrentStatusCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Current Status
        </h3>
        <button
          onClick={onToggleTracking}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isTracking ? 'Pause' : 'Activate'}
        </button>
      </div>

      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
          isTracking
            ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {isTracking && (
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-60"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isTracking ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            ></span>
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>{isTracking ? 'Tracking Active' : 'Tracking Suspended'}</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isTracking
                ? 'Receiving real-time location updates'
                : 'Device beacon is currently idle'}
            </p>
          </div>
        </div>

        {/* Animated signal wave bars */}
        <div className="flex items-end gap-1 h-6 shrink-0">
          <div
            className={`w-1 rounded-full transition-all ${
              isTracking ? 'bg-emerald-500 animate-pulse h-3' : 'bg-slate-300 h-1.5'
            }`}
          />
          <div
            className={`w-1 rounded-full transition-all ${
              isTracking ? 'bg-emerald-500 animate-pulse h-5' : 'bg-slate-300 h-2'
            }`}
            style={{ animationDelay: '150ms' }}
          />
          <div
            className={`w-1 rounded-full transition-all ${
              isTracking ? 'bg-emerald-500 animate-pulse h-6' : 'bg-slate-300 h-3'
            }`}
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <Radio className="w-3.5 h-3.5 text-blue-500" />
          <span>Telemetry Polling: 2.5s</span>
        </span>
        <span className="font-semibold text-slate-700">
          {speed > 0 ? `${speed} km/h (In Transit)` : 'Stationary'}
        </span>
      </div>
    </div>
  );
}
