'use client';

import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Radio,
  Shield,
  Volume2,
  Smartphone,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsView() {
  const [pollingRate, setPollingRate] = useState('2.5');
  const [smsGateway, setSmsGateway] = useState('orange_sl');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [geofencePush, setGeofencePush] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>LiveTrack Pro System Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure telemetry polling frequencies, carrier gateways, and safety thresholds
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {savedToast && (
        <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings successfully synchronized with LiveTrack Pro gateway!</span>
        </div>
      )}

      <div className="py-6 space-y-6 max-w-2xl">
        {/* Polling */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600" />
            <span>GPS Ping &amp; Telemetry Frequency</span>
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Lower polling intervals provide ultra-smooth real-time tracking with increased battery consumption.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '1.0', label: '1.0s (High Precision)' },
              { id: '2.5', label: '2.5s (Recommended)' },
              { id: '5.0', label: '5.0s (Battery Saver)' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setPollingRate(item.id)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  pollingRate === item.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Carrier SMS / WhatsApp Gateway */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Carrier Integration (Sierra Leone &amp; Global)</span>
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Select the primary telecom relay gateway for one-click location permission links and SOS SMS dispatch.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'orange_sl', label: 'Orange SL Gateway' },
              { id: 'africell_sl', label: 'Africell Direct' },
              { id: 'twilio_global', label: 'Global Twilio / Cloud' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSmsGateway(item.id)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  smsGateway === item.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Alerts */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Acoustic Siren &amp; Geofence Chimes
              </h4>
              <p className="text-[11px] text-slate-500">
                Audible synthesize alert tone when SOS is active or safe zones are entered
              </p>
            </div>
          </div>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
              audioEnabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                audioEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Geofence Push */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Real-Time Boundary Alerts
              </h4>
              <p className="text-[11px] text-slate-500">
                Instant browser notification when tracked subjects leave assigned perimeter
              </p>
            </div>
          </div>
          <button
            onClick={() => setGeofencePush(!geofencePush)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
              geofencePush ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                geofencePush ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
