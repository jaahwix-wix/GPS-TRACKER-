'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Smartphone,
  Wifi,
  Battery,
  MapPin,
  Clock,
  Compass,
  Gauge,
  X,
  Save,
  Shield,
  Layers,
  Activity,
} from 'lucide-react';
import { TrackedUser } from '@/lib/types';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: TrackedUser;
  onSaveUser: (updatedUser: TrackedUser) => void;
}

export default function UserDetailsModal({
  isOpen,
  onClose,
  user,
  onSaveUser,
}: UserDetailsModalProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [role, setRole] = useState(user.role);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUser({
      ...user,
      name,
      phone,
      role,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Live Device Telemetry Inspector
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Hardware Node: {user.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
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
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                placeholder="Full Name"
              />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-700"
                placeholder="Phone Number"
              />
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-500"
                placeholder="Designation or Relationship"
              />
            </div>
          </div>

          {/* Diagnostic specs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">
                Device Model
              </span>
              <span className="font-bold text-slate-800">
                {user.deviceModel || 'Samsung Galaxy A54'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">
                Carrier &amp; Signal
              </span>
              <span className="font-bold text-slate-800">
                {user.networkType || 'Orange SL / 4G LTE'} (-78 dBm)
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">
                GPS Precision &amp; Satellites
              </span>
              <span className="font-bold text-emerald-600">
                {user.gpsAccuracyMeters}m (14 GLONASS/GPS sats)
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">
                Battery Health
              </span>
              <span className="font-bold text-slate-800">
                {user.batteryLevel}% (Good condition, Normal temp)
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Latitude:</span>
              <span className="font-mono font-bold">{user.coordinates[0].toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Longitude:</span>
              <span className="font-mono font-bold">{user.coordinates[1].toFixed(6)}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Telemetry Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
