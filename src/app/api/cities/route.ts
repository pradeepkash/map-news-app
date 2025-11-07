import { NextResponse } from 'next/server';
import { getCitiesSummary } from '@/lib/services/news-aggregator';

export async function GET() {
  try {
    const cities = await getCitiesSummary();
    
    return NextResponse.json({
      success: true,
      data: cities,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cities data',
      },
      { status: 500 }
    );
  }
}
