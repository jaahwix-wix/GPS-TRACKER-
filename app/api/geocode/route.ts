import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || !query.trim()) {
    return NextResponse.json({ error: 'Missing query parameter "q"' }, { status: 400 });
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim()
    )}&limit=5&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'LiveTrackProApp/1.0 (Contact: jaahwix@gmail.com)',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Geocoding upstream error: ${response.statusText}` },
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
    console.error('Error in geocode API:', error);
    return NextResponse.json({ error: 'Internal server error during geocoding' }, { status: 500 });
  }
}
