'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Home,
  Briefcase,
  GraduationCap,
  Warehouse,
  Check,
  Trash2,
  Bell,
  X,
} from 'lucide-react';
import { GeofenceZone } from '@/lib/types';
import { soundEffects } from '@/lib/audio';

interface GeofencingViewProps {
  geofences: GeofenceZone[];
  onToggleZone: (id: string) => void;
  onAddZone: (zone: Omit<GeofenceZone, 'id'>) => void;
  onDeleteZone: (id: string) => void;
  onSelectZoneOnMap: (id: string) => void;
  selectedZoneId?: string | null;
}

export default function GeofencingView({
  geofences,
  onToggleZone,
  onAddZone,
  onDeleteZone,
  onSelectZoneOnMap,
  selectedZoneId,
}: GeofencingViewProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRadius, setNewRadius] = useState(350);
  const [newIcon, setNewIcon] = useState<'home' | 'briefcase' | 'graduation-cap' | 'warehouse'>('home');
  const [newColor, setNewColor] = useState('#2563eb');
  const [alertOnEntry, setAlertOnEntry] = useState(true);
  const [alertOnExit, setAlertOnExit] = useState(true);

  const getIcon = (type: string) => {
    switch (type) {
      case 'home':
        return Home;
      case 'briefcase':
        return Briefcase;
      case 'graduation-cap':
        return GraduationCap;
      case 'warehouse':
        return Warehouse;
      default:
        return ShieldCheck;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddZone({
      name: newName.trim(),
      radiusMeters: Number(newRadius),
      centerCoordinates: [8.4844 + (Math.random() - 0.5) * 0.02, -13.2344 + (Math.random() - 0.5) * 0.02],
      color: newColor,
      iconName: newIcon,
      isActive: true,
      alertOnEntry,
      alertOnExit,
    });

    soundEffects.playGeofenceChime();
    setIsCreateModalOpen(false);
    setNewName('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md flex flex-col h-full overflow-hidden">
      {/* Top Header matching MVP */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Geofencing Safe Zones
          </h3>
          <p className="text-[11px] text-slate-500">
            Set boundaries to receive real-time entry &amp; departure alerts
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Geofence</span>
        </button>
      </div>

      {/* Geofence Safe Zones List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Your Geofences ({geofences.length})
        </div>

        {geofences.map((zone) => {
          const Icon = getIcon(zone.iconName);
          const isSelected = selectedZoneId === zone.id;

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZoneOnMap(zone.id)}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                  : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Zone Icon Box */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: zone.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Name & Radius */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {zone.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Radius: {zone.radiusMeters} m
                  </p>
                </div>
              </div>

              {/* Controls: Active Switch & Delete */}
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                {/* Custom Toggle Switch matching MVP */}
                <button
                  type="button"
                  onClick={() => onToggleZone(zone.id)}
                  className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    zone.isActive ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  aria-pressed={zone.isActive}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                      zone.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

                <button
                  onClick={() => onDeleteZone(zone.id)}
                  title="Delete zone"
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="p-3 bg-blue-50 border-t border-blue-100 flex items-center gap-2 text-xs text-blue-800">
        <Bell className="w-4 h-4 text-blue-600 shrink-0" />
        <span>SMS alerts will be dispatched to guardians when zones are entered or exited.</span>
      </div>

      {/* Create Geofence Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-900">
                Create Safe Zone Geofence
              </h4>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lumley Beach Residence"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Radius (Meters)
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-600">
                    {newRadius} m
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1500"
                  step="50"
                  value={newRadius}
                  onChange={(e) => setNewRadius(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Category Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['home', 'briefcase', 'graduation-cap', 'warehouse'] as const).map(
                    (iconType) => {
                      const IconComp = getIcon(iconType);
                      return (
                        <button
                          key={iconType}
                          type="button"
                          onClick={() => setNewIcon(iconType)}
                          className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                            newIcon === iconType
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                          <span className="text-[10px] capitalize">
                            {iconType}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {['#16a34a', '#2563eb', '#9333ea', '#ea580c', '#e11d48'].map(
                    (hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setNewColor(hex)}
                        style={{ backgroundColor: hex }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white transition-transform ${
                          newColor === hex ? 'scale-115 ring-2 ring-slate-900' : ''
                        }`}
                      >
                        {newColor === hex && <Check className="w-3.5 h-3.5" />}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Save Safe Zone
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
