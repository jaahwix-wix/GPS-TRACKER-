'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  AlertOctagon,
  Phone,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { EmergencyContact, TrackedUser } from '@/lib/types';
import { soundEffects } from '@/lib/audio';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: TrackedUser;
  contacts: EmergencyContact[];
  onTriggerSos: (locationDesc: string) => void;
}

export default function EmergencySosModal({
  isOpen,
  onClose,
  user,
  contacts,
  onTriggerSos,
}: EmergencySosModalProps) {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [callNotification, setCallNotification] = useState<string | null>(null);

  useEffect(() => {
    if (countdown === null) return;

    const timer = setTimeout(() => {
      if (countdown <= 1) {
        setCountdown(null);
        setIsAlertActive(true);
        if (!isSoundMuted) {
          soundEffects.startSiren();
        }
        onTriggerSos(`${user.name} broadcasted SOS from ${user.currentLocationName}`);
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isSoundMuted, onTriggerSos, user]);

  const handleStartSos = () => {
    // 3 second countdown safety to cancel accidental press
    setCountdown(3);
    soundEffects.playBeep(880, 0.2);
  };

  const handleCancelSos = () => {
    setCountdown(null);
    setIsAlertActive(false);
    soundEffects.stopSiren();
  };

  const handleCall = (contact: EmergencyContact) => {
    setCallNotification(`Simulating urgent call to ${contact.name} (${contact.phone})...`);
    soundEffects.playBeep(440, 0.3);
    setTimeout(() => {
      setCallNotification(null);
    }, 3500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Modal Red Top Banner matching MVP */}
        <div className="bg-rose-600 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-white" />
            <h3 className="text-sm font-bold tracking-tight">
              Emergency SOS Hub
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!isSoundMuted) {
                  soundEffects.stopSiren();
                } else if (isAlertActive) {
                  soundEffects.startSiren();
                }
                setIsSoundMuted(!isSoundMuted);
              }}
              className="p-1 rounded-lg hover:bg-rose-700 text-white transition-colors"
              title={isSoundMuted ? 'Unmute siren' : 'Mute siren'}
            >
              {isSoundMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => {
                handleCancelSos();
                onClose();
              }}
              className="p-1 rounded-lg hover:bg-rose-700 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 text-center">
          {/* Big SOS Circle Button matching MVP */}
          <div className="relative w-32 h-32 mx-auto my-3 flex items-center justify-center">
            {/* Pulsating outer rings */}
            <div
              className={`absolute inset-0 rounded-full bg-rose-500/30 ${
                isAlertActive || countdown !== null ? 'animate-ping' : ''
              }`}
            />
            <div className="absolute -inset-2 rounded-full border-2 border-rose-400/40 animate-pulse" />

            <button
              onClick={
                isAlertActive
                  ? handleCancelSos
                  : countdown !== null
                  ? handleCancelSos
                  : handleStartSos
              }
              className={`relative w-28 h-28 rounded-full text-white font-extrabold flex flex-col items-center justify-center shadow-xl transition-all cursor-pointer ${
                isAlertActive
                  ? 'bg-slate-900 border-4 border-rose-500 hover:bg-slate-800'
                  : countdown !== null
                  ? 'bg-amber-600 border-4 border-white animate-pulse'
                  : 'bg-rose-600 border-4 border-white hover:bg-rose-700 active:scale-95'
              }`}
            >
              {countdown !== null ? (
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black">{countdown}</span>
                  <span className="text-[10px] tracking-widest font-semibold uppercase">
                    Tap to cancel
                  </span>
                </div>
              ) : isAlertActive ? (
                <div className="flex flex-col items-center">
                  <span className="text-base font-black">ACTIVE</span>
                  <span className="text-[9px] text-rose-300 font-semibold uppercase">
                    Tap to stop
                  </span>
                </div>
              ) : (
                <span className="text-2xl tracking-wider font-black">SOS</span>
              )}
            </button>
          </div>

          <h4 className="text-base font-bold text-slate-900 mt-2">
            {isAlertActive ? '🚨 SOS BROADCAST ACTIVE' : 'Emergency Alert'}
          </h4>
          <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1 mb-5">
            {isAlertActive
              ? `Real-time distress telemetry transmitted to Sierra Leone emergency services and 3 contacts.`
              : 'Send your current location to your emergency contacts and selected guardians.'}
          </p>

          {/* Trigger button matching MVP */}
          {!isAlertActive && countdown === null && (
            <button
              onClick={handleStartSos}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send SOS</span>
            </button>
          )}

          {countdown !== null && (
            <button
              onClick={handleCancelSos}
              className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
            >
              Cancel Alert ({countdown}s)
            </button>
          )}

          {isAlertActive && (
            <button
              onClick={handleCancelSos}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
            >
              De-escalate &amp; Stop SOS Siren
            </button>
          )}

          {/* Call notification toast */}
          {callNotification && (
            <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 animate-in fade-in">
              {callNotification}
            </div>
          )}

          {/* Emergency Contacts List matching MVP */}
          <div className="mt-6 text-left border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">
                Emergency Contacts
              </span>
              <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                Edit
              </span>
            </div>

            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {contact.avatar ? (
                        <Image
                          src={contact.avatar}
                          alt={contact.name}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        contact.name[0]
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 leading-tight">
                        {contact.phone}
                      </h5>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {contact.relation} · {contact.name}
                      </p>
                    </div>
                  </div>

                  {/* Green Call Action Button matching MVP */}
                  <button
                    onClick={() => handleCall(contact)}
                    title={`Call ${contact.name}`}
                    className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
