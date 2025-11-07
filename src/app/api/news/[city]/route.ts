import { NextResponse } from 'next/server';
import { getCityNewsWithPriority } from '@/lib/services/news-aggregator';

export async function GET(
  request: Request,
  { params }: { params: { city: string } }
) {
  try {
    const cityName = decodeURIComponent(params.city);
    
    // Optional query param to force refresh
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';

    const cityNews = await getCityNewsWithPriority(cityName, forceRefresh);
    
    return NextResponse.json({
      success: true,
      data: cityNews,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching city news:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch city news',
      },
      { status: 500 }
    );
  }
}
