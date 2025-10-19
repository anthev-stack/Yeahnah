import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbQuery, dbRun, initializeDatabase } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const resolvedParams = await params;
    const event = await dbGet('SELECT * FROM events WHERE id = ?', [resolvedParams.eventId]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const resolvedParams = await params;
    const { title, description, event_type, event_date, multi_store_enabled } = await request.json();
    
    await dbRun(
      `UPDATE events 
       SET title = ?, description = ?, event_type = ?, event_date = ?, multi_store_enabled = ?
       WHERE id = ?`,
      [title, description, event_type, event_date, multi_store_enabled ? 1 : 0, resolvedParams.eventId]
    );
    
    return NextResponse.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const resolvedParams = await params;
    
    // Delete related data first (guests, groups, etc.)
    await dbRun('DELETE FROM guests WHERE event_id = ?', [resolvedParams.eventId]);
    await dbRun('DELETE FROM groups WHERE event_id = ?', [resolvedParams.eventId]);
    
    // Delete the event
    await dbRun('DELETE FROM events WHERE id = ?', [resolvedParams.eventId]);
    
    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
