import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredEvents } from '@/lib/cleanup';

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication for this endpoint in production
    const result = await cleanupExpiredEvents();
    
    return NextResponse.json({
      success: true,
      message: `Successfully processed ${result.processed} expired events`,
      processed: result.processed
    });
  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cleanup expired events',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await cleanupExpiredEvents();
    
    return NextResponse.json({
      success: true,
      message: `Cleanup completed. Processed ${result.processed} expired events`,
      processed: result.processed
    });
  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cleanup expired events',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

