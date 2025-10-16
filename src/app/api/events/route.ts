import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbGet, dbQuery, uuidv4, initializeDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const { title, description, eventType, multiStoreEnabled, hostName, hostEmail } = await request.json();
    const eventId = uuidv4();
    
    await dbRun(
      `INSERT INTO events (id, title, description, event_type, multi_store_enabled, host_name, host_email) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [eventId, title, description, eventType, multiStoreEnabled ? 1 : 0, hostName, hostEmail]
    );
    
    return NextResponse.json({ eventId, message: 'Event created successfully' });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    if (!eventId) {
      // Return all events
      const events = await dbQuery('SELECT * FROM events ORDER BY created_at DESC');
      return NextResponse.json(events);
    }
    
    // Return specific event
    const event = await dbGet('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
