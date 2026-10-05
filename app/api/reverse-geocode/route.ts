import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Missing required parameters "lat" and "lon"' },
      { status: 400 }
    );
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'LiveTrackProApp/1.0 (Contact: jaahwix@gmail.com)',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Reverse geocoding upstream error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error in reverse-geocode API:', error);
    return NextResponse.json(
      { error: 'Internal server error during reverse geocoding' },
      { status: 500 }
    );
  }
}
