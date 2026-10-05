'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, QrCode, Clock, ShieldCheck, X } from 'lucide-react';
import { TrackedUser } from '@/lib/types';

interface ShareLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: TrackedUser;
}

export default function ShareLocationModal({
  isOpen,
  onClose,
  user,
}: ShareLocationModalProps) {
  const [copied, setCopied] = useState(false);
  const [expiry, setExpiry] = useState<'1h' | '24h' | 'never'>('24h');

  if (!isOpen) return null;

  const shareUrl = `https://livetrack.pro/share/${user.id}?token=sl-live-89f41b`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Share Live Location
              </h3>
              <p className="text-[11px] text-slate-500">
                Target: {user.name}
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

        <div className="p-6 space-y-4">
          {/* Expiry Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Link Expiration Window
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '1h', label: '1 Hour' },
                { id: '24h', label: '24 Hours' },
                { id: 'never', label: 'Indefinite' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setExpiry(item.id as '1h' | '24h' | 'never')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    expiry === item.id
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Share Link Box */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Encrypted Share Link
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-xs font-mono text-slate-700 px-2 focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick 1-click Broadcast channels */}
          <div className="pt-2 grid grid-cols-2 gap-2">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Track ${user.name}'s live location securely on LiveTrack Pro: ${shareUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>WhatsApp Direct</span>
            </a>
            <a
              href={`sms:?body=${encodeURIComponent(
                `Live location link for ${user.name}: ${shareUrl}`
              )}`}
              className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>SMS Direct</span>
            </a>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Only people with this encrypted URL can view the live coordinate stream.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
