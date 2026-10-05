'use client';

import React from 'react';
import { Clock, ShieldCheck, AlertOctagon, Share2, ChevronRight } from 'lucide-react';

interface QuickActionsProps {
  onOpenHistory: () => void;
  onOpenGeofence: () => void;
  onOpenSos: () => void;
  onOpenShare: () => void;
}

export default function QuickActions({
  onOpenHistory,
  onOpenGeofence,
  onOpenSos,
  onOpenShare,
}: QuickActionsProps) {
  const actions = [
    {
      title: 'Location History',
      description: 'View past locations',
      icon: Clock,
      color: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white',
      onClick: onOpenHistory,
    },
    {
      title: 'Set Geofence',
      description: 'Create safe zones',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
      onClick: onOpenGeofence,
    },
    {
      title: 'Emergency SOS',
      description: 'Send alert',
      icon: AlertOctagon,
      color: 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white',
      onClick: onOpenSos,
    },
    {
      title: 'Share Location',
      description: 'Get location link',
      icon: Share2,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white',
      onClick: onOpenShare,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-3">
        Quick Actions
      </h3>

      <div className="space-y-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.title}
              onClick={act.onClick}
              className="w-full group p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${act.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-slate-900">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {act.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
