import { NextResponse } from 'next/server';
import { refreshAllCitiesNews } from '@/lib/services/news-aggregator';

export async function POST() {
  try {
    await refreshAllCitiesNews();
    
    return NextResponse.json({
      success: true,
      message: 'News refresh completed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error refreshing news:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh news',
      },
      { status: 500 }
    );
  }
}
