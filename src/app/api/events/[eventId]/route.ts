import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
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
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await initializeDatabase();
    
    const resolvedParams = await params;
    const { title, description, event_type, event_date, multi_store_enabled, award_voting_scope } = await request.json();
    
    // Check if the event exists and belongs to the user
    const event = await dbGet('SELECT * FROM events WHERE id = ? AND host_id = ?', [resolvedParams.eventId, session.user.id]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 });
    }
    
    await dbRun(
      `UPDATE events 
       SET title = ?, description = ?, event_type = ?, event_date = ?, multi_store_enabled = ?, award_voting_scope = ?
       WHERE id = ? AND host_id = ?`,
      [title, description, event_type, event_date, multi_store_enabled ? 1 : 0, award_voting_scope || 'all', resolvedParams.eventId, session.user.id]
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
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await initializeDatabase();
    
    const resolvedParams = await params;
    
    // Check if the event exists and belongs to the user
    const event = await dbGet('SELECT * FROM events WHERE id = ? AND host_id = ?', [resolvedParams.eventId, session.user.id]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 });
    }
    
    // Delete related data first (guests, groups, etc.)
    await dbRun('DELETE FROM guests WHERE event_id = ?', [resolvedParams.eventId]);
    await dbRun('DELETE FROM groups WHERE event_id = ?', [resolvedParams.eventId]);
    
    // Delete the event
    await dbRun('DELETE FROM events WHERE id = ? AND host_id = ?', [resolvedParams.eventId, session.user.id]);
    
    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
