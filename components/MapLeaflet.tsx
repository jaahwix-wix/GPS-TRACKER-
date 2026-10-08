'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TrackedUser, GeofenceZone, Waypoint } from '@/lib/types';
import { Layers, Crosshair, ZoomIn, ZoomOut, MapPin, Maximize2, Minimize2 } from 'lucide-react';

interface MapLeafletProps {
  currentUser: TrackedUser;
  geofences: GeofenceZone[];
  historyWaypoints?: Waypoint[];
  showHistoryPath?: boolean;
  selectedGeofenceId?: string | null;
  onSelectGeofence?: (id: string) => void;
  onMapClickCoordinates?: (coords: [number, number]) => void;
  onLocateCurrentDevice?: () => void;
  isTrackingActive: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// Tile layer configurations
const TILE_CONFIGS = {
  streets: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: { maxZoom: 19, attribution: '© OpenStreetMap' },
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 19, attribution: 'Esri World Imagery' },
  },
  hybrid: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    options: { maxZoom: 19, subdomains: ['a', 'b', 'c', 'd'], attribution: 'CartoDB' },
  },
};

// Recognizable local landmarks around Sierra Leone (Bo & Freetown)
const AREA_LANDMARKS = [
  { name: 'Bo Clock Tower', coords: [7.95997, -11.73964] as [number, number], icon: '🕰️' },
  { name: 'Bo School Campus', coords: [7.96215, -11.74276] as [number, number], icon: '🏫' },
  { name: 'Bo Central Market', coords: [7.9618, -11.7372] as [number, number], icon: '🏬' },
  { name: 'Bo Govt Hospital', coords: [7.9645, -11.7380] as [number, number], icon: '🏥' },
  { name: 'Njala Bo Campus', coords: [7.9520, -11.7445] as [number, number], icon: '🎓' },
  { name: 'Lumley Beach', coords: [8.4891, -13.2721] as [number, number], icon: '🏖️' },
  { name: 'State House / Freetown', coords: [8.4877, -13.2356] as [number, number], icon: '🏛️' },
];

export default function MapLeaflet({
  currentUser,
  geofences,
  historyWaypoints = [],
  showHistoryPath = false,
  selectedGeofenceId,
  onSelectGeofence,
  onMapClickCoordinates,
  onLocateCurrentDevice,
  isTrackingActive,
  isExpanded = false,
  onToggleExpand,
}: MapLeafletProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const geofenceCirclesRef = useRef<{ [key: string]: L.Circle }>({});
  const historyPolylineRef = useRef<L.Polyline | null>(null);
  const historyMarkersRef = useRef<L.Marker[]>([]);
  const landmarkMarkersRef = useRef<L.Marker[]>([]);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const onMapClickRef = useRef(onMapClickCoordinates);
  const prevUserIdRef = useRef(currentUser.id);
  const prevCoordsRef = useRef<[number, number]>(currentUser.coordinates);

  useEffect(() => {
    onMapClickRef.current = onMapClickCoordinates;
  }, [onMapClickCoordinates]);

  // Default to Street view so street & area names are immediately readable
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'hybrid'>('streets');

  // Initialize Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if ((container as unknown as { _leaflet_id?: number })._leaflet_id) {
      delete (container as unknown as { _leaflet_id?: number })._leaflet_id;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialCoords = currentUser.coordinates;
    const map = L.map(container, {
      center: initialCoords,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    const activeConfig = TILE_CONFIGS[mapStyle];
    const initialTile = L.tileLayer(activeConfig.url, activeConfig.options).addTo(map);
    currentTileLayerRef.current = initialTile;

    mapInstanceRef.current = map;

    // Observe container resizing to prevent blank/grey tiles
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);

    // Multiple staggered invalidation calls to guarantee tiles load as container expands
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 800);

    // Add Area Landmark markers
    landmarkMarkersRef.current = [];
    AREA_LANDMARKS.forEach((lm) => {
      const landmarkIcon = L.divIcon({
        className: 'landmark-label',
        html: `
          <div class="flex items-center gap-1 bg-slate-900/90 text-white px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-700 shadow-md whitespace-nowrap pointer-events-none">
            <span>${lm.icon}</span>
            <span>${lm.name}</span>
          </div>
        `,
        iconSize: [100, 20],
        iconAnchor: [50, 10],
      });
      const marker = L.marker(lm.coords, { icon: landmarkIcon, zIndexOffset: 200 }).addTo(map);
      landmarkMarkersRef.current.push(marker);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClickRef.current) {
        onMapClickRef.current([e.latlng.lat, e.latlng.lng]);
      }
    });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
      landmarkMarkersRef.current.forEach((m) => map.removeLayer(m));
      landmarkMarkersRef.current = [];
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Tile Layer when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const activeConfig = TILE_CONFIGS[mapStyle];
    const newTile = L.tileLayer(activeConfig.url, activeConfig.options).addTo(map);
    currentTileLayerRef.current = newTile;
    map.invalidateSize();
  }, [mapStyle]);

  // Center camera when user changes or coordinates update significantly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const [lat, lng] = currentUser.coordinates;
    const [prevLat, prevLng] = prevCoordsRef.current;
    const dist = Math.hypot(lat - prevLat, lng - prevLng);

    if (prevUserIdRef.current !== currentUser.id || dist > 0.003) {
      prevUserIdRef.current = currentUser.id;
      prevCoordsRef.current = currentUser.coordinates;
      map.flyTo(currentUser.coordinates, 15, { duration: 1.2 });
    }
  }, [currentUser.id, currentUser.coordinates]);

  // Center camera when selected geofence changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedGeofenceId) return;

    const targetZone = geofences.find((g) => g.id === selectedGeofenceId);
    if (targetZone) {
      map.flyTo(targetZone.centerCoordinates, 14, { duration: 1 });
    }
  }, [selectedGeofenceId, geofences]);

  // Update / Render User Marker & Accuracy Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const [lat, lng] = currentUser.coordinates;

    const customIconHtml = `
      <div class="relative flex flex-col items-center justify-end w-[150px] h-[95px] pointer-events-auto select-none">
        <!-- Floating Label Card with Area name -->
        <div class="bg-[#0b1728] text-white px-2.5 py-1.5 rounded-xl shadow-2xl border-2 border-blue-500/80 text-center mb-1 whitespace-nowrap min-w-[130px]">
          <div class="text-[11px] font-black tracking-tight text-white flex items-center justify-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>${currentUser.name}</span>
          </div>
          <div class="text-[10px] text-blue-300 font-mono tracking-wider">
            ${currentUser.phone}
          </div>
        </div>

        <!-- Radar Pulse & Pin Marker -->
        <div class="relative flex flex-col items-center justify-center">
          ${
            isTrackingActive
              ? `
              <div class="absolute -inset-2.5 rounded-full bg-blue-500/40 animate-ping"></div>
              <div class="absolute -inset-5 rounded-full border-2 border-blue-400/60 animate-pulse"></div>
            `
              : ''
          }
          
          <!-- Outer pin circle -->
          <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white z-10">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>

          <!-- Bottom pointer tip -->
          <div class="w-2.5 h-2.5 bg-blue-600 rotate-45 -mt-1.5 z-0 border-r border-b border-white"></div>
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: customIconHtml,
      iconSize: [150, 95],
      iconAnchor: [75, 94],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
      userMarkerRef.current.setIcon(userIcon);
    } else {
      userMarkerRef.current = L.marker([lat, lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    }

    // Accuracy Circle
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng([lat, lng]);
      accuracyCircleRef.current.setRadius(currentUser.gpsAccuracyMeters * 35);
    } else {
      accuracyCircleRef.current = L.circle([lat, lng], {
        radius: currentUser.gpsAccuracyMeters * 35,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '4, 4',
      }).addTo(map);
    }
  }, [currentUser, isTrackingActive]);

  // Render Geofence Zones
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.keys(geofenceCirclesRef.current).forEach((id) => {
      if (!geofences.find((g) => g.id === id)) {
        map.removeLayer(geofenceCirclesRef.current[id]);
        delete geofenceCirclesRef.current[id];
      }
    });

    geofences.forEach((zone) => {
      const isSelected = selectedGeofenceId === zone.id;

      if (geofenceCirclesRef.current[zone.id]) {
        geofenceCirclesRef.current[zone.id].setLatLng(zone.centerCoordinates);
        geofenceCirclesRef.current[zone.id].setRadius(zone.radiusMeters * 2);
        geofenceCirclesRef.current[zone.id].setStyle({
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: zone.isActive ? (isSelected ? 0.35 : 0.2) : 0.05,
          weight: isSelected ? 3 : 2,
        });
      } else {
        const circle = L.circle(zone.centerCoordinates, {
          radius: zone.radiusMeters * 2,
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: zone.isActive ? 0.2 : 0.05,
          weight: 2,
        }).addTo(map);

        circle.bindTooltip(
          `<div class="text-xs font-bold text-slate-900">${zone.name} (${zone.radiusMeters}m)</div>`,
          { permanent: false, direction: 'top' }
        );

        circle.on('click', () => {
          if (onSelectGeofence) {
            onSelectGeofence(zone.id);
          }
        });

        geofenceCirclesRef.current[zone.id] = circle;
      }
    });
  }, [geofences, selectedGeofenceId, onSelectGeofence]);

  // Render History Path & Waypoints
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (historyPolylineRef.current) {
      map.removeLayer(historyPolylineRef.current);
      historyPolylineRef.current = null;
    }
    historyMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    historyMarkersRef.current = [];

    if (showHistoryPath && historyWaypoints.length > 0) {
      const latlngs = historyWaypoints.map((wp) => wp.coordinates);

      const polyline = L.polyline(latlngs, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.9,
        dashArray: '6, 6',
      }).addTo(map);
      historyPolylineRef.current = polyline;

      historyWaypoints.forEach((wp, index) => {
        const isLive = wp.isLive;
        const iconHtml = `
          <div class="flex items-center justify-center">
            <div class="w-6 h-6 rounded-full ${
              isLive ? 'bg-emerald-500' : 'bg-blue-600'
            } text-white border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold">
              ${index + 1}
            </div>
          </div>
        `;
        const marker = L.marker(wp.coordinates, {
          icon: L.divIcon({
            className: 'history-waypoint-dot',
            html: iconHtml,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        }).addTo(map);

        marker.bindPopup(`
          <div class="text-xs font-semibold p-1">
            <p class="text-blue-600 font-bold">${wp.name}</p>
            <p class="text-slate-500 text-[11px]">Time: ${wp.time} · Speed: ${wp.speedKmH} km/h</p>
          </div>
        `);

        historyMarkersRef.current.push(marker);
      });
    }
  }, [showHistoryPath, historyWaypoints]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleCenterOnUser = () => {
    if (onLocateCurrentDevice) {
      onLocateCurrentDevice();
    }
    mapInstanceRef.current?.flyTo(currentUser.coordinates, 16, {
      duration: 1.2,
    });
  };

  return (
    <div
      className="relative w-full h-full min-h-[360px] overflow-hidden bg-slate-950 select-none"
      style={{ minHeight: '360px', height: '100%', width: '100%' }}
    >
      {/* Map DOM Element with guaranteed height */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[360px]"
        style={{ minHeight: '360px', height: '100%', width: '100%' }}
      />

      {/* Area & Neighborhood Floating Bar (Shows exactly where he is) */}
      <div className="absolute top-3 left-3 right-14 z-20 pointer-events-none">
        <div className="bg-[#0b1728]/95 backdrop-blur-md text-white border border-blue-500/40 px-3 py-1.5 rounded-xl shadow-xl flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-blue-300 font-bold block uppercase tracking-wider">
                Current Area Lock
              </span>
              <span className="text-xs font-extrabold text-white truncate block">
                {currentUser.currentLocationName}
              </span>
            </div>
          </div>

          <button
            onClick={handleCenterOnUser}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold shrink-0 transition-colors shadow-xs"
          >
            Zoom Here
          </button>
        </div>
      </div>

      {/* Map Controls (Top Right) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        {/* Layer Switcher */}
        <div className="relative group">
          <button
            onClick={() =>
              setMapStyle((prev) =>
                prev === 'streets' ? 'satellite' : prev === 'satellite' ? 'hybrid' : 'streets'
              )
            }
            className="w-9 h-9 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-xl border border-slate-700/80 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"
            title={`Current: ${mapStyle}. Click to toggle Street / Satellite.`}
          >
            <Layers className="w-4 h-4" />
          </button>
          <div className="absolute right-11 top-0 hidden group-hover:flex items-center bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow whitespace-nowrap border border-slate-700">
            {mapStyle === 'streets' ? 'Street Names' : mapStyle === 'satellite' ? 'Satellite View' : 'Hybrid View'}
          </div>
        </div>

        {/* Center on User */}
        <button
          onClick={handleCenterOnUser}
          className="w-9 h-9 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-xl border border-slate-700/80 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"
          title="Center on Target"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Zoom In/Out */}
        <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-xl border border-slate-700/80 overflow-hidden flex flex-col divide-y divide-slate-800">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Fullscreen Expand/Collapse Toggle (if provided) */}
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="w-9 h-9 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-xl border border-slate-700/80 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Map' : 'Expand Full Map'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Bottom Overlays */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Live Tracking Status Pill */}
        <div className="bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg text-[11px] pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">Live:</span>
          <span className="text-slate-300 truncate max-w-[140px]">{currentUser.name}</span>
        </div>

        {/* Accuracy Badge */}
        <div className="bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-slate-700 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg text-[10px] font-mono pointer-events-auto">
          <span>📶 {currentUser.gpsAccuracyMeters}m lock</span>
        </div>
      </div>
    </div>
  );
}
