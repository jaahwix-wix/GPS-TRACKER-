import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'LiveTrack Pro - Real People. Real Time. Real Safety.',
  description: 'Professional modern real-time GPS tracking, phone locator, geofencing safe zones, journey history, and emergency SOS safety management system.',
  openGraph: {
    title: 'LiveTrack Pro - Real People. Real Time. Real Safety.',
    description: 'Professional modern real-time GPS tracking, phone locator, geofencing safe zones, journey history, and emergency SOS safety management system.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LiveTrack Pro - Real People. Real Time. Real Safety.',
    description: 'Professional modern real-time GPS tracking, phone locator, geofencing safe zones, journey history, and emergency SOS safety management system.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
