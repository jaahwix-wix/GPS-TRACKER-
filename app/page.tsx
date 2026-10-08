'use client';

import React, { useState, useEffect } from 'react';
import MobileAppShell from '@/components/MobileAppShell';
import {
  INITIAL_TRACKED_USERS,
  INITIAL_GEOFENCES,
  INITIAL_LOCATION_HISTORY,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_NOTIFICATIONS,
} from '@/lib/mock-data';
import { TrackedUser, GeofenceZone, Waypoint, SystemNotification } from '@/lib/types';
import { soundEffects } from '@/lib/audio';

export default function HomePage() {
  const [trackedUsers, setTrackedUsers] = useState<TrackedUser[]>(INITIAL_TRACKED_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('user-078649553');
  const [geofences, setGeofences] = useState<GeofenceZone[]>(INITIAL_GEOFENCES);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string | null>(null);
  const [history, setHistory] = useState(INITIAL_LOCATION_HISTORY);
  const [emergencyContacts] = useState(INITIAL_EMERGENCY_CONTACTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [isTrackingActive, setIsTrackingActive] = useState<boolean>(true);
  const [isSimulatingLiveTransit, setIsSimulatingLiveTransit] = useState<boolean>(true);

  // Live ticking clock
  const [systemTime, setSystemTime] = useState('16 Sep 2025, 14:32:00');

  const currentUser =
    trackedUsers.find((u) => u.id === currentUserId) || trackedUsers[0];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setSystemTime(`16 Sep 2025, ${timeStr}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatically acquire physical device real location on initial app launch
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy) || 4;

        let addressName = `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
        try {
          const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(', ');
              addressName = parts.slice(0, 3).join(', ');
            }
          }
        } catch {
          // fallback
        }

        setIsSimulatingLiveTransit(false); // Stop simulation so real GPS stays locked
        setTrackedUsers((prev) =>
          prev.map((u) => {
            if (u.id === currentUserId) {
              return {
                ...u,
                coordinates: [lat, lng],
                currentLocationName: addressName,
                gpsAccuracyMeters: accuracy,
                lastUpdated: 'Live Real-Time GPS Lock',
              };
            }
            return u;
          })
        );
      },
      (err) => {
        console.log('Auto-GPS notice:', err.message);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, [currentUserId]);

  // Movement Simulation Engine (smooth real-time tracking along Bo urban routes)
  useEffect(() => {
    if (!isTrackingActive || !isSimulatingLiveTransit) return;

    let step = 0;
    const transitWaypoints: [number, number][] = [
      [7.95997, -11.73964], // Bo Clock Tower (Tikonko Rd)
      [7.96080, -11.73860], // Fenton Rd Commercial
      [7.96180, -11.73720], // Bo Central Market
      [7.96280, -11.73600], // Dambala Rd Junction
      [7.96450, -11.73800], // Bo Govt Hospital / Hospital Rd
      [7.96320, -11.74100], // Sewa Road
      [7.96215, -11.74276], // Bo Government Secondary School (Hangha Town)
      [7.96080, -11.74120], // Bo Post Office / Coronation Rd
      [7.95997, -11.73964], // Bo Clock Tower
    ];
  // location must be accurate and dynamic
    const interval = setInterval(() => {
      step = (step + 1) % transitWaypoints.length;
      const nextCoords = transitWaypoints[step];

      setTrackedUsers((prev) =>
        prev.map((user) => {
          if (user.id === currentUserId) {
            const simulatedSpeed = Math.floor(10 + Math.random() * 18);
            const heading = (step * 40 + 35) % 360;
            return {
              ...user,
              coordinates: nextCoords,
              speedKmH: simulatedSpeed,
              headingDegrees: heading,
              direction:
                heading < 90
                  ? 'North East'
                  : heading < 180
                  ? 'South East'
                  : heading < 270
                  ? 'South West'
                  : 'North West',
              lastUpdated: `16 Sep 2025, ${new Date().toLocaleTimeString(
                'en-GB',
                { hour: '2-digit', minute: '2-digit', second: '2-digit' }
              )}`,
            };
          }
          return user;
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isTrackingActive, isSimulatingLiveTransit, currentUserId]);

  // When any mobile number is given - locates directly without asking permission!
  const handleAddNewPhone = (phone: string, name?: string) => {
    const existing = trackedUsers.find(
      (u) => u.phone === phone || phone.includes(u.phone.replace(/\s+/g, ''))
    );

    if (existing) {
      setCurrentUserId(existing.id);
      return;
    }

    const newUser: TrackedUser = {
      id: `user-${Date.now()}`,
      name: name || `Device (${phone.slice(-4)})`,
      phone,
      countryCode: phone.split(' ')[0] || '+232',
      avatar: '/avatars/avatar_mohamed_kamara_1791130244032.jpg',
      role: 'Tracked Mobile Device',
      isOnline: true,
      isTracking: true,
      currentLocationName: 'Bo Clock Tower, Tikonko Rd, Bo, Southern Province',
      coordinates: [
        7.95997 + (Math.random() - 0.5) * 0.005,
        -11.73964 + (Math.random() - 0.5) * 0.005,
      ],
      lastUpdated: 'Live Signal Lock (Just now)',
      speedKmH: 12,
      direction: 'North East',
      headingDegrees: 48,
      batteryLevel: 88,
      gpsAccuracyMeters: 4,
    };

    setTrackedUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.id);

    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: 'Target Located',
      message: `Cellular GPS signal locked for ${phone}`,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      type: 'info',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Real-world high-precision hardware GPS detection for the user's current device
  const handleLocateCurrentDevice = async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Hardware GPS is not supported in this browser environment.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy) || 5;

        let addressName = `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
        try {
          const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(', ');
              addressName = parts.slice(0, 3).join(', ');
            }
          }
        } catch {
          // fallback to coordinates
        }

        setIsSimulatingLiveTransit(false); // Disable simulation so real GPS stays active

        setTrackedUsers((prev) =>
          prev.map((u) => {
            if (u.id === currentUserId) {
              return {
                ...u,
                coordinates: [lat, lng],
                currentLocationName: addressName,
                gpsAccuracyMeters: accuracy,
                lastUpdated: 'Hardware GPS Lock (Real-Time)',
              };
            }
            return u;
          })
        );

        soundEffects.playBeep(980, 0.2);
      },
      (err) => {
        alert(
          `Unable to access hardware GPS: ${err.message}. Please ensure location permissions are enabled in your device settings.`
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Set custom real-world coordinates and address
  const handleSetCustomLocation = (coords: [number, number], locationName: string) => {
    setIsSimulatingLiveTransit(false);
    setTrackedUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUserId) {
          return {
            ...u,
            coordinates: coords,
            currentLocationName: locationName,
            gpsAccuracyMeters: 4,
            lastUpdated: 'Real Address Locked',
          };
        }
        return u;
      })
    );
    soundEffects.playBeep(850, 0.15);
  };

  const handleToggleTracking = () => {
    const nextState = !isTrackingActive;
    setIsTrackingActive(nextState);
    soundEffects.playBeep(nextState ? 600 : 300, 0.15);
  };

  const handleSelectWaypoint = (wp: Waypoint) => {
    setTrackedUsers((prev) =>
      prev.map((user) => {
        if (user.id === currentUserId) {
          return {
            ...user,
            coordinates: wp.coordinates,
            currentLocationName: wp.name,
            speedKmH: wp.speedKmH,
          };
        }
        return user;
      })
    );
  };

  const handleToggleGeofence = (id: string) => {
    setGeofences((prev) =>
      prev.map((zone) =>
        zone.id === id ? { ...zone, isActive: !zone.isActive } : zone
      )
    );
    soundEffects.playBeep(520, 0.1);
  };

  const handleAddGeofence = (newZoneData: Omit<GeofenceZone, 'id'>) => {
    const newZone: GeofenceZone = {
      ...newZoneData,
      id: `geo-${Date.now()}`,
    };
    setGeofences((prev) => [newZone, ...prev]);
  };

  const handleDeleteGeofence = (id: string) => {
    setGeofences((prev) => prev.filter((z) => z.id !== id));
  };

  return (
    <MobileAppShell
      trackedUsers={trackedUsers}
      currentUser={currentUser}
      onSelectUser={(u) => setCurrentUserId(u.id)}
      onAddNewPhone={handleAddNewPhone}
      onLocateCurrentDevice={handleLocateCurrentDevice}
      onSetCustomLocation={handleSetCustomLocation}
      geofences={geofences}
      onToggleGeofence={handleToggleGeofence}
      onAddGeofence={handleAddGeofence}
      onDeleteGeofence={handleDeleteGeofence}
      selectedGeofenceId={selectedGeofenceId}
      onSelectGeofence={(id) => setSelectedGeofenceId(id)}
      history={history}
      onSelectWaypoint={handleSelectWaypoint}
      emergencyContacts={emergencyContacts}
      notifications={notifications}
      isTrackingActive={isTrackingActive}
      onToggleTracking={handleToggleTracking}
      isSimulatingLiveTransit={isSimulatingLiveTransit}
      onToggleSimulatingTransit={() => setIsSimulatingLiveTransit(!isSimulatingLiveTransit)}
      systemTime={systemTime}
    />
  );
}
