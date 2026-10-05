'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Users,
  Search,
  Plus,
  Battery,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { TrackedUser } from '@/lib/types';

interface UsersViewProps {
  users: TrackedUser[];
  activeUserId: string;
  onSelectUserToTrack: (user: TrackedUser) => void;
  onOpenAddModal: () => void;
}

export default function UsersView({
  users,
  activeUserId,
  onSelectUserToTrack,
  onOpenAddModal,
}: UsersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    if (!matchesSearch) return false;
    if (filterStatus === 'online') return u.isOnline;
    if (filterStatus === 'offline') return !u.isOnline;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 h-full flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Tracked Devices &amp; Family Members</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authorized hardware beacons, smartphone locators, and active members
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Phone to Track</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Filter status buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {(['all', 'online', 'offline'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === status
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Users */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredUsers.map((user) => {
          const isCurrentlyActive = user.id === activeUserId;

          return (
            <div
              key={user.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isCurrentlyActive
                  ? 'border-blue-500 bg-blue-50/30 shadow-xs ring-1 ring-blue-500/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {/* User Profile */}
              <div className="flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {user.name}
                    </h3>
                    {user.isOnline ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Online
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Offline
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {user.phone} · <span className="font-sans text-slate-400">{user.role}</span>
                  </p>
                </div>
              </div>

              {/* Status details */}
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Current Location
                  </span>
                  <span className="font-semibold text-slate-800 truncate block max-w-[160px]">
                    {user.currentLocationName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Battery
                  </span>
                  <span className="font-mono font-bold text-slate-700 flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-500" />
                    {user.batteryLevel}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Accuracy
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {user.gpsAccuracyMeters} m
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="shrink-0 w-full md:w-auto flex justify-end">
                {isCurrentlyActive ? (
                  <span className="px-3.5 py-1.5 bg-blue-100 text-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Viewing on Map</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectUserToTrack(user)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Track Live</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
