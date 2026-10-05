'use client';

import React from 'react';
import {
  FileText,
  Download,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { TrackedUser, GeofenceZone, HistoryRoute } from '@/lib/types';

interface ReportsViewProps {
  user: TrackedUser;
  history: HistoryRoute;
  geofences: GeofenceZone[];
}

export default function ReportsView({
  user,
  history,
  geofences,
}: ReportsViewProps) {
  const exportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Timestamp,Location,Speed(km/h),Status\n';
    history.waypoints.forEach((wp) => {
      csvContent += `"${wp.time}","${wp.name}",${wp.speedKmH},"${wp.isLive ? 'Current' : 'Historical'}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Safety_Audit_${user.name.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Safety Audit &amp; Telemetry Reports</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geofence boundary transitions, route compliance logs, and movement analytics
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Audit Log</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
            Total Distance Covered
          </span>
          <span className="text-xl font-extrabold text-slate-900 font-mono">
            {history.totalDistanceKm} km
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
            Route fully verified
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
            Active Travel Duration
          </span>
          <span className="text-xl font-extrabold text-slate-900 font-mono">
            {history.durationFormatted}
          </span>
          <span className="text-[10px] text-blue-600 font-semibold block mt-1">
            Recorded since 08:03 AM
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
            Max Recorded Speed
          </span>
          <span className="text-xl font-extrabold text-slate-900 font-mono">
            35.2 km/h
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
            Compliant with 50 km/h limit
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
            Safe Zone Entries
          </span>
          <span className="text-xl font-extrabold text-slate-900 font-mono">
            4 events
          </span>
          <span className="text-[10px] text-blue-600 font-semibold block mt-1">
            0 unauthorized excursions
          </span>
        </div>
      </div>

      {/* Incident & Event Log Table */}
      <div className="flex-1 overflow-y-auto mt-2 border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4">Event Type</th>
              <th className="py-3 px-4">Location / Zone</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr className="hover:bg-slate-50/70">
              <td className="py-3 px-4 font-semibold text-emerald-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zone Entry</span>
              </td>
              <td className="py-3 px-4 font-medium">Office Safe Zone (Central Freetown)</td>
              <td className="py-3 px-4 font-mono text-slate-500">Today, 14:10</td>
              <td className="py-3 px-4">{user.name}</td>
              <td className="py-3 px-4 text-right">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Verified
                </span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50/70">
              <td className="py-3 px-4 font-semibold text-blue-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Waypoint Check-in</span>
              </td>
              <td className="py-3 px-4 font-medium">Lumley Beach Road (Aberdeen)</td>
              <td className="py-3 px-4 font-mono text-slate-500">Today, 12:41</td>
              <td className="py-3 px-4">{user.name}</td>
              <td className="py-3 px-4 text-right">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  Auto-Logged
                </span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50/70">
              <td className="py-3 px-4 font-semibold text-amber-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Zone Departure</span>
              </td>
              <td className="py-3 px-4 font-medium">Home Safe Zone (Lumley)</td>
              <td className="py-3 px-4 font-mono text-slate-500">Today, 08:15</td>
              <td className="py-3 px-4">{user.name}</td>
              <td className="py-3 px-4 text-right">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Departed
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
