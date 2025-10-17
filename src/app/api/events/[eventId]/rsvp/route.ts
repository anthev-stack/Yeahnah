import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun, dbQuery, initializeDatabase } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const resolvedParams = await params;
    const event = await dbGet(
      `SELECT * FROM events WHERE id = ?`,
      [resolvedParams.eventId]
    );
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Get all guests for this event
    const guests = await dbQuery(
      `SELECT g.*, gr.name as group_name FROM guests g 
       LEFT JOIN groups gr ON g.group_id = gr.id 
       WHERE g.event_id = ? ORDER BY gr.name, g.first_name`,
      [resolvedParams.eventId]
    );
    
    return NextResponse.json({ event, guests });
  } catch (error) {
    console.error('Error fetching event RSVP data:', error);
    return NextResponse.json({ error: 'Failed to fetch event data' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const { firstName, lastName, guestId, response } = await request.json();
    const resolvedParams = await params;
    
    if (!['yes', 'no'].includes(response)) {
      return NextResponse.json({ error: 'Invalid response. Must be "yes" or "no"' }, { status: 400 });
    }
    
    // Find the guest by name or guest ID
    let guest;
    if (guestId && guestId.trim() !== '') {
      // Search by guest ID
      guest = await dbGet(
        `SELECT * FROM guests WHERE event_id = ? AND guest_id = ?`,
        [resolvedParams.eventId, guestId.trim()]
      );
    } else {
      // Search by first and last name
      if (!firstName || firstName.trim() === '') {
        return NextResponse.json({ error: 'First name is required' }, { status: 400 });
      }
      
      guest = await dbGet(
        `SELECT * FROM guests WHERE event_id = ? AND LOWER(TRIM(first_name)) = LOWER(TRIM(?)) AND LOWER(TRIM(last_name)) = LOWER(TRIM(?))`,
        [resolvedParams.eventId, firstName.trim(), (lastName || '').trim()]
      );
      
      // If no exact match with last name, try just first name
      if (!guest && (!lastName || lastName.trim() === '')) {
        guest = await dbGet(
          `SELECT * FROM guests WHERE event_id = ? AND LOWER(TRIM(first_name)) = LOWER(TRIM(?)) AND (last_name IS NULL OR last_name = '' OR TRIM(last_name) = '')`,
          [resolvedParams.eventId, firstName.trim()]
        );
      }
    }
    
    if (!guest) {
      return NextResponse.json({ 
        error: 'Guest not found. Please check your name or guest ID and try again.' 
      }, { status: 404 });
    }
    
    // Update RSVP
    const result = await dbRun(
      'UPDATE guests SET rsvp_status = ?, rsvp_date = CURRENT_TIMESTAMP WHERE id = ?',
      [response, guest.id]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'RSVP updated successfully',
      guest: {
        firstName: guest.first_name,
        lastName: guest.last_name,
        response
      }
    });
  } catch (error) {
    console.error('Error updating RSVP:', error);
    return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 });
  }
}
