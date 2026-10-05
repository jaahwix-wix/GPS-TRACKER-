'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TrackedUser, GeofenceZone, Waypoint } from '@/lib/types';
import { Loader2, MapPin, Radio } from 'lucide-react';

const MapLeaflet = dynamic(() => import('./MapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-3 p-4 select-none">
      <div className="relative flex items-center justify-center">
        <span className="w-16 h-16 rounded-full bg-blue-500/30 animate-ping absolute" />
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 relative z-10">
          <MapPin className="w-6 h-6" />
        </div>
      </div>
      <div className="text-center">
        <span className="text-xs font-bold text-white block">
          Loading High-Resolution Area Map...
        </span>
        <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
          Locking GPS coordinates &amp; terrain layers
        </span>
      </div>
    </div>
  ),
});

interface MapViewportProps {
  currentUser: TrackedUser;
  geofences: GeofenceZone[];
  historyWaypoints?: Waypoint[];
  showHistoryPath?: boolean;
  selectedGeofenceId?: string | null;
  onSelectGeofence?: (id: string) => void;
  onMapClickCoordinates?: (coords: [number, number]) => void;
  isTrackingActive: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function MapViewport(props: MapViewportProps) {
  return (
    <div
      className="relative w-full h-full min-h-[360px] overflow-hidden bg-slate-950"
      style={{ minHeight: '360px', height: '100%', width: '100%' }}
    >
      <MapLeaflet {...props} />
    </div>
  );
}
