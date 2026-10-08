import { TrackedUser, HistoryRoute, GeofenceZone, EmergencyContact, SystemNotification } from './types';

// Accurate coordinates for Bo, Southern Province, Sierra Leone
export const BO_CENTER: [number, number] = [7.95997, -11.73964];
export const FREETOWN_CENTER: [number, number] = [7.95997, -11.73964];

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
    currentLocationName: 'Bo Clock Tower, Tikonko Rd, Bo, Southern Province',
    coordinates: [7.95997, -11.73964],
    lastUpdated: '16 Sep 2025, 14:32',
    speedKmH: 12,
    direction: 'North East',
    headingDegrees: 45,
    batteryLevel: 78,
    isCharging: false,
    gpsAccuracyMeters: 4,
    deviceModel: 'Samsung Galaxy A54 5G',
    networkType: '4G LTE / Orange SL (Bo City Tower)',
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
    currentLocationName: 'Bo School Campus, Hangha Town, Bo',
    coordinates: [7.96215, -11.74276],
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
    currentLocationName: 'Torwama Rd Junction, Bo',
    coordinates: [7.9520, -11.7445],
    lastUpdated: '16 Sep 2025, 13:15',
    speedKmH: 0,
    direction: 'West',
    headingDegrees: 270,
    batteryLevel: 19,
    isCharging: false,
    gpsAccuracyMeters: 12,
    deviceModel: 'Xiaomi Redmi Note 12',
    networkType: '3G / QCell SL',
  },
];

export const INITIAL_GEOFENCES: GeofenceZone[] = [
  {
    id: 'geo-bo-center',
    name: 'Bo Clock Tower Hub',
    radiusMeters: 400,
    centerCoordinates: [7.95997, -11.73964], // Bo Clock Tower
    color: '#16a34a', // Emerald green
    iconName: 'home',
    isActive: true,
    alertOnEntry: true,
    alertOnExit: true,
    lastEvent: {
      type: 'entry',
      timestamp: 'Today at 14:10',
      userName: '078649553',
    },
  },
  {
    id: 'geo-bo-school',
    name: 'Bo School Zone',
    radiusMeters: 350,
    centerCoordinates: [7.96215, -11.74276], // Bo Government Secondary School
    color: '#2563eb', // Blue
    iconName: 'graduation-cap',
    isActive: true,
    alertOnEntry: true,
    alertOnExit: false,
    lastEvent: {
      type: 'exit',
      timestamp: 'Today at 08:15',
      userName: '078649553',
    },
  },
  {
    id: 'geo-bo-hospital',
    name: 'Bo Govt Hospital',
    radiusMeters: 250,
    centerCoordinates: [7.9645, -11.7380], // Bo Hospital
    color: '#9333ea', // Purple
    iconName: 'briefcase',
    isActive: false,
    alertOnEntry: true,
    alertOnExit: true,
  },
  {
    id: 'geo-bo-commercial',
    name: 'Tikonko Rd Commercial',
    radiusMeters: 400,
    centerCoordinates: [7.9542, -11.7410], // Tikonko Rd
    color: '#ea580c', // Orange
    iconName: 'warehouse',
    isActive: true,
    alertOnEntry: true,
    alertOnExit: true,
  },
];

export const INITIAL_LOCATION_HISTORY: HistoryRoute = {
  date: '16 Sep 2025',
  totalDistanceKm: 14.2,
  durationFormatted: '5h 18m',
  avgSpeedKmH: 11,
  waypoints: [
    {
      id: 'wp-1',
      time: '14:32',
      name: 'Bo Clock Tower, Tikonko Rd, Bo',
      coordinates: [7.95997, -11.73964],
      speedKmH: 12,
      isLive: true,
    },
    {
      id: 'wp-2',
      time: '13:58',
      name: 'Fenton Rd / Bo Central Market',
      coordinates: [7.96120, -11.73810],
      speedKmH: 10,
    },
    {
      id: 'wp-3',
      time: '12:41',
      name: 'Dambala Rd Junction, Bo',
      coordinates: [7.96280, -11.73600],
      speedKmH: 14,
    },
    {
      id: 'wp-4',
      time: '11:26',
      name: 'Bo Govt Hospital, Hospital Rd',
      coordinates: [7.96450, -11.73800],
      speedKmH: 0,
    },
    {
      id: 'wp-5',
      time: '09:12',
      name: 'Bo School Campus, Hangha Town',
      coordinates: [7.96215, -11.74276],
      speedKmH: 8,
    },
    {
      id: 'wp-6',
      time: '08:03',
      name: 'Torwama Rd Junction, Bo',
      coordinates: [7.95200, -11.74450],
      speedKmH: 16,
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
    message: '078649553 entered Bo Clock Tower Hub (Bo City)',
    time: '14:10',
    type: 'safe_zone',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'Safe Zone Exit',
    message: '078649553 departed Bo School Zone (Hangha Town)',
    time: '08:15',
    type: 'safe_zone',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'GPS Signal Strong',
    message: 'High accuracy GPS lock: Bo, Southern Province, Sierra Leone (4m precision)',
    time: '08:03',
    type: 'info',
    isRead: true,
  },
];
