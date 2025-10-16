import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbQuery, dbGet, uuidv4, initializeDatabase } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const { firstName, lastName, guestId, groupId } = await request.json();
    const guestUuid = uuidv4();
    const resolvedParams = await params;
    
    await dbRun(
      `INSERT INTO guests (id, event_id, first_name, last_name, guest_id, group_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [guestUuid, resolvedParams.eventId, firstName, lastName, guestId, groupId]
    );
    
    return NextResponse.json({ guestId: guestUuid, message: 'Guest added successfully' });
  } catch (error) {
    console.error('Error adding guest:', error);
    return NextResponse.json({ error: 'Failed to add guest' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const resolvedParams = await params;
    const guests = await dbQuery(
      `SELECT g.*, gr.name as group_name FROM guests g 
       LEFT JOIN groups gr ON g.group_id = gr.id 
       WHERE g.event_id = ? ORDER BY gr.name, g.first_name`,
      [resolvedParams.eventId]
    );
    
    return NextResponse.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
}
