'use client';

import React, { useState, useEffect } from 'react';
import { TrackedUser } from '@/lib/types';
import {
  X,
  MapPin,
  Search,
  ExternalLink,
  ShieldCheck,
  CloudSun,
  Hospital,
  AlertTriangle,
  RotateCw,
  Compass,
  Building,
  Navigation,
} from 'lucide-react';

interface LocationIntelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TrackedUser;
}

interface GroundingChunk {
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: Array<{ reviewText?: string }>;
    };
  };
  web?: {
    uri?: string;
    title?: string;
  };
}

interface IntelResponse {
  mode: 'maps' | 'search';
  text: string;
  groundingChunks: GroundingChunk[];
}

export default function LocationIntelModal({
  isOpen,
  onClose,
  currentUser,
}: LocationIntelModalProps) {
  const [activeMode, setActiveMode] = useState<'maps' | 'search'>('maps');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IntelResponse | null>(null);
  const [customQuery, setCustomQuery] = useState('');

  const [lat, lng] = currentUser.coordinates;

  const fetchIntel = async (mode: 'maps' | 'search', query?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/location-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          latitude: lat,
          longitude: lng,
          locationName: currentUser.currentLocationName,
          query: query || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.details || errJson.error || 'Failed to fetch location data');
      }

      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error retrieving intelligence data';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchIntel(activeMode);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeMode, currentUser.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              {activeMode === 'maps' ? (
                <Compass className="w-4 h-4 text-blue-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">Location Intelligence</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                {currentUser.currentLocationName} ({lat.toFixed(4)}°, {lng.toFixed(4)}°)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="p-2 bg-slate-950/50 border-b border-slate-800/80 flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveMode('maps');
              fetchIntel('maps');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'maps'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Google Maps Grounding</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('search');
              fetchIntel('search');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'search'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Google Search Grounding</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-[11px]">
          {activeMode === 'maps' ? (
            <>
              <button
                type="button"
                onClick={() => fetchIntel('maps', 'Nearest Police Stations and Security Posts')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 shrink-0 border border-slate-700"
              >
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>Police Stations</span>
              </button>
              <button
                type="button"
                onClick={() => fetchIntel('maps', 'Nearest General Hospitals and Medical Centers')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 shrink-0 border border-slate-700"
              >
                <Hospital className="w-3 h-3 text-rose-400" />
                <span>Hospitals</span>
              </button>
              <button
                type="button"
                onClick={() => fetchIntel('maps', 'Key Transport Hubs, Fuel Stations and Intersections')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 shrink-0 border border-slate-700"
              >
                <Building className="w-3 h-3 text-amber-400" />
                <span>Fuel &amp; Transport</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fetchIntel('search', 'Current Weather Conditions and Flood Warnings')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 shrink-0 border border-slate-700"
              >
                <CloudSun className="w-3 h-3 text-amber-400" />
                <span>Live Weather</span>
              </button>
              <button
                type="button"
                onClick={() => fetchIntel('search', 'Road Traffic and Infrastructure Status')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 shrink-0 border border-slate-700"
              >
                <Navigation className="w-3 h-3 text-emerald-400" />
                <span>Road Conditions</span>
              </button>
              <button
                type="button"
                onClick={() => fetchIntel('search', 'Local Safety News and Emergency Alerts')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 shrink-0 border border-slate-700"
              >
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Emergency News</span>
              </button>
            </>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <RotateCw className="w-7 h-7 text-blue-400 animate-spin" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-white block">
                  Grounding with {activeMode === 'maps' ? 'Google Maps' : 'Google Search'}...
                </span>
                <span className="text-[11px] text-slate-400">
                  Retrieving verified coordinates &amp; real-time data via gemini-2.5-flash
                </span>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Intelligence Retrieval Notice</span>
              </div>
              <p className="text-[11px] text-rose-300/90 leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={() => fetchIntel(activeMode)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading && data && (
            <div className="space-y-4">
              {/* Grounded Text Response */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200 leading-relaxed whitespace-pre-line space-y-2">
                {data.text}
              </div>

              {/* Verified Google Maps / Search Sources & Links */}
              {data.groundingChunks && data.groundingChunks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {activeMode === 'maps' ? 'Verified Google Maps Places' : 'Google Search Source Links'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {data.groundingChunks.length} sources
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.groundingChunks.map((chunk, idx) => {
                      if (chunk.maps?.uri) {
                        return (
                          <a
                            key={idx}
                            href={chunk.maps.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-between text-xs text-blue-300 transition-colors group shadow-2xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="truncate font-semibold text-white group-hover:text-blue-300">
                                {chunk.maps.title || 'View on Google Maps'}
                              </span>
                            </div>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white shrink-0 ml-1" />
                          </a>
                        );
                      }

                      if (chunk.web?.uri) {
                        return (
                          <a
                            key={idx}
                            href={chunk.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-between text-xs text-emerald-300 transition-colors group shadow-2xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Search className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate font-semibold text-white group-hover:text-emerald-300">
                                {chunk.web.title || 'Web Reference'}
                              </span>
                            </div>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white shrink-0 ml-1" />
                          </a>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Query Footer Form */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
          <form
            suppressHydrationWarning
            onSubmit={(e) => {
              e.preventDefault();
              if (customQuery.trim()) {
                fetchIntel(activeMode, customQuery.trim());
              }
            }}
            className="flex items-center gap-1.5"
          >
            <input
              suppressHydrationWarning
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder={
                activeMode === 'maps'
                  ? 'Ask Google Maps e.g. "Find pharmacies near me"...'
                  : 'Ask Google Search e.g. "Current road conditions"...'
              }
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !customQuery.trim()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
            >
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
