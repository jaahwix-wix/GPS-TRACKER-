export interface TrackedUser {
  id: string;
  name: string;
  phone: string;
  countryCode: string;
  avatar: string;
  role: string;
  isOnline: boolean;
  isTracking: boolean;
  currentLocationName: string;
  coordinates: [number, number]; // [lat, lng]
  lastUpdated: string;
  speedKmH: number;
  direction: string;
  headingDegrees: number;
  batteryLevel: number;
  isCharging?: boolean;
  gpsAccuracyMeters: number;
  deviceModel?: string;
  networkType?: string;
}

export interface Waypoint {
  id: string;
  time: string;
  name: string;
  coordinates: [number, number];
  speedKmH: number;
  isLive?: boolean;
}

export interface HistoryRoute {
  date: string;
  totalDistanceKm: number;
  durationFormatted: string;
  avgSpeedKmH: number;
  waypoints: Waypoint[];
}

export interface GeofenceZone {
  id: string;
  name: string;
  radiusMeters: number;
  centerCoordinates: [number, number];
  color: string;
  iconName: 'home' | 'briefcase' | 'graduation-cap' | 'warehouse';
  isActive: boolean;
  alertOnEntry: boolean;
  alertOnExit: boolean;
  lastEvent?: {
    type: 'entry' | 'exit';
    timestamp: string;
    userName: string;
  };
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: 'Family' | 'Friend' | 'Guardian';
  phone: string;
  avatar?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'safe_zone' | 'sos' | 'battery' | 'speed' | 'info';
  isRead: boolean;
}
