import { TrackedUser, HistoryRoute, GeofenceZone, EmergencyContact, SystemNotification } from './types';

// Coordinates around Freetown, Sierra Leone matching the MVP map
export const FREETOWN_CENTER: [number, number] = [8.4844, -13.2344];

export const INITIAL_TRACKED_USERS: TrackedUser[] = [
  {
    id: 'user-078649553',
    name: '078649553',
    phone: '078649553',
    countryCode: '+232',
    avatar: '/avatars/avatar_mohamed_kamara_1791130244032.jpg',
    role: 'Primary Tracked Target',
    isOnline: true,
    isTracking: true,
    currentLocationName: 'Lumley Beach / Aberdeen Sector, Freetown',
    coordinates: [8.4844, -13.2344],
    lastUpdated: '16 Sep 2025, 14:32',
    speedKmH: 12,
    direction: 'North East',
    headingDegrees: 45,
    batteryLevel: 68,
    isCharging: false,
    gpsAccuracyMeters: 8,
    deviceModel: 'Samsung Galaxy A54 5G',
    networkType: '4G LTE / Orange SL',
  },
  {
    id: 'user-fatmata-conteh',
    name: 'Fatmata Conteh',
    phone: '+232 78 456 789',
    countryCode: '+232',
    avatar: '/avatars/avatar_contact_guardian_1791130269199.jpg',
    role: 'Senior Supervisor',
    isOnline: true,
    isTracking: true,
    currentLocationName: 'Wilberforce Barracks, Freetown',
    coordinates: [8.4682, -13.2489],
    lastUpdated: '16 Sep 2025, 14:30',
    speedKmH: 0,
    direction: 'Stationary',
    headingDegrees: 0,
    batteryLevel: 84,
    isCharging: true,
    gpsAccuracyMeters: 5,
    deviceModel: 'iPhone 14 Pro',
    networkType: '5G / Africell SL',
  },
  {
    id: 'user-ibrahim-sesay',
    name: 'Ibrahim Sesay',
    phone: '+232 79 987 654',
    countryCode: '+232',
    avatar: '/avatars/avatar_james_weekes_1791130259379.jpg',
    role: 'Logistics Fleet Driver',
    isOnline: false,
    isTracking: false,
    currentLocationName: 'Kissy Terminal, Freetown',
    coordinates: [8.4721, -13.1952],
    lastUpdated: '16 Sep 2025, 13:15',
    speedKmH: 0,
    direction: 'West',
    headingDegrees: 270,
    batteryLevel: 19,
    isCharging: false,
    gpsAccuracyMeters: 14,
    deviceModel: 'Xiaomi Redmi Note 12',
    networkType: '3G / QCell SL',
  },
];

export const INITIAL_GEOFENCES: GeofenceZone[] = [
  {
    id: 'geo-home',
    name: 'Home',
    radiusMeters: 500,
    centerCoordinates: [8.4891, -13.2721], // Near Lumley
    color: '#16a34a', // Emerald green
    iconName: 'home',
    isActive: true,
    alertOnEntry: true,
    alertOnExit: true,
    lastEvent: {
      type: 'exit',
      timestamp: 'Today at 08:15',
      userName: '078649553',
    },
  },
  {
    id: 'geo-office',
    name: 'Office',
    radiusMeters: 300,
    centerCoordinates: [8.4844, -13.2344], // Central Freetown
    color: '#2563eb', // Blue
    iconName: 'briefcase',
    isActive: true,
    alertOnEntry: true,
    alertOnExit: false,
    lastEvent: {
      type: 'entry',
      timestamp: 'Today at 14:10',
      userName: '078649553',
    },
  },
  {
    id: 'geo-school',
    name: 'School',
    radiusMeters: 200,
    centerCoordinates: [8.4715, -13.2558], // Hill Station / Wilberforce
    color: '#9333ea', // Purple
    iconName: 'graduation-cap',
    isActive: false,
    alertOnEntry: true,
    alertOnExit: true,
  },
  {
    id: 'geo-warehouse',
    name: 'Warehouse',
    radiusMeters: 400,
    centerCoordinates: [8.4610, -13.2185], // Cline Town / Industrial
    color: '#ea580c', // Orange
    iconName: 'warehouse',
    isActive: true,
    alertOnEntry: true,
    alertOnExit: true,
  },
];

export const INITIAL_LOCATION_HISTORY: HistoryRoute = {
  date: '16 Sep 2025',
  totalDistanceKm: 18.6,
  durationFormatted: '6h 29m',
  avgSpeedKmH: 8,
  waypoints: [
    {
      id: 'wp-1',
      time: '14:32',
      name: 'Freetown, Sierra Leone',
      coordinates: [8.4844, -13.2344],
      speedKmH: 12,
      isLive: true,
    },
    {
      id: 'wp-2',
      time: '13:58',
      name: 'Wilberforce, Freetown',
      coordinates: [8.4682, -13.2489],
      speedKmH: 8,
    },
    {
      id: 'wp-3',
      time: '12:41',
      name: 'Lumley Beach, Freetown',
      coordinates: [8.4891, -13.2721],
      speedKmH: 15,
    },
    {
      id: 'wp-4',
      time: '11:26',
      name: 'Aberdeen, Freetown',
      coordinates: [8.4978, -13.2842],
      speedKmH: 0,
    },
    {
      id: 'wp-5',
      time: '09:12',
      name: 'Congo Cross, Freetown',
      coordinates: [8.4812, -13.2519],
      speedKmH: 6,
    },
    {
      id: 'wp-6',
      time: '08:03',
      name: 'Youyi Building, Freetown',
      coordinates: [8.4795, -13.2371],
      speedKmH: 4,
    },
  ],
};

export const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'ec-1',
    name: 'Aminata Kamara',
    relation: 'Family',
    phone: '+232 76 111 222',
  },
  {
    id: 'ec-2',
    name: 'David Koroma',
    relation: 'Friend',
    phone: '+232 77 333 444',
  },
  {
    id: 'ec-3',
    name: 'Mama Hawa Sesay',
    relation: 'Guardian',
    phone: '+232 78 555 666',
    avatar: '/avatars/avatar_contact_guardian_1791130269199.jpg',
  },
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'Safe Zone Entry',
    message: '078649553 entered Office (Central Freetown)',
    time: '14:10',
    type: 'safe_zone',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'Safe Zone Exit',
    message: '078649553 departed Home zone (Lumley)',
    time: '08:15',
    type: 'safe_zone',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'GPS Signal Strong',
    message: 'High accuracy tracking lock achieved (8 meters precision)',
    time: '08:03',
    type: 'info',
    isRead: true,
  },
];
