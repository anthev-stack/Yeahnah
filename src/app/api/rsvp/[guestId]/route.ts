import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun, initializeDatabase } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  try {
    await initializeDatabase();
    
    const resolvedParams = await params;
    const guest = await dbGet(
      `SELECT g.*, e.title as event_title, e.event_type, e.multi_store_enabled 
       FROM guests g 
       JOIN events e ON g.event_id = e.id 
       WHERE g.guest_id = ?`,
      [resolvedParams.guestId]
    );
    
    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }
    
    return NextResponse.json(guest);
  } catch (error) {
    console.error('Error fetching guest data:', error);
    return NextResponse.json({ error: 'Failed to fetch guest data' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  try {
    await initializeDatabase();
    
    const { response } = await request.json();
    
    if (!['yes', 'no'].includes(response)) {
      return NextResponse.json({ error: 'Invalid response. Must be "yes" or "no"' }, { status: 400 });
    }
    
    const resolvedParams = await params;
    const result = await dbRun(
      'UPDATE guests SET rsvp_status = ?, rsvp_date = CURRENT_TIMESTAMP WHERE guest_id = ?',
      [response, resolvedParams.guestId]
    );
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'RSVP updated successfully' });
  } catch (error) {
    console.error('Error updating RSVP:', error);
    return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 });
  }
}
