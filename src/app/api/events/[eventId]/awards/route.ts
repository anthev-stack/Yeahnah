import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbQuery, dbGet, uuidv4, initializeDatabase } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const { title, description } = await request.json();
    const awardId = uuidv4();
    const resolvedParams = await params;
    
    await dbRun(
      'INSERT INTO awards (id, event_id, title, description) VALUES (?, ?, ?, ?)',
      [awardId, resolvedParams.eventId, title, description]
    );
    
    return NextResponse.json({ awardId, message: 'Award created successfully' });
  } catch (error) {
    console.error('Error creating award:', error);
    return NextResponse.json({ error: 'Failed to create award' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const resolvedParams = await params;
    const awards = await dbQuery(
      'SELECT * FROM awards WHERE event_id = ? ORDER BY created_at',
      [resolvedParams.eventId]
    );
    
    return NextResponse.json(awards);
  } catch (error) {
    console.error('Error fetching awards:', error);
    return NextResponse.json({ error: 'Failed to fetch awards' }, { status: 500 });
  }
}
