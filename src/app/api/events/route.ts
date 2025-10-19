import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbRun, dbGet, dbQuery, uuidv4, initializeDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const { title, description, eventType, multiStoreEnabled, eventDate, hostName, hostEmail, hostId, templateTheme, logoUrl } = await request.json();
    
    if (!hostId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!eventDate) {
      return NextResponse.json({ error: 'Event date is required' }, { status: 400 });
    }
    
    const eventId = uuidv4();
    
    await dbRun(
      `INSERT INTO events (id, title, description, event_type, multi_store_enabled, event_date, template_theme, logo_url, host_id, host_name, host_email) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [eventId, title, description, eventType, multiStoreEnabled ? 1 : 0, eventDate, templateTheme || 'light', logoUrl || null, hostId, hostName, hostEmail]
    );
    
    return NextResponse.json({ eventId, message: 'Event created successfully' });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    if (!eventId) {
      // Return events for the authenticated user
      const events = await dbQuery('SELECT * FROM events WHERE host_id = ? ORDER BY created_at DESC', [session.user.id]);
      return NextResponse.json(events);
    }
    
    // Return specific event if it belongs to the user
    const event = await dbGet('SELECT * FROM events WHERE id = ? AND host_id = ?', [eventId, session.user.id]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
