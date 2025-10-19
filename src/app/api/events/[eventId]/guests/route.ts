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
    
    // Generate a unique guest_id if none provided or if it's empty
    let finalGuestId = guestId;
    if (!guestId || guestId.trim() === '') {
      // Generate a unique guest_id based on first name and timestamp
      const timestamp = Date.now().toString(36);
      const firstNameInitial = firstName ? firstName.charAt(0).toUpperCase() : 'G';
      finalGuestId = `${firstNameInitial}${timestamp}`;
    }
    
    await dbRun(
      `INSERT INTO guests (id, event_id, first_name, last_name, guest_id, group_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [guestUuid, resolvedParams.eventId, firstName, lastName, finalGuestId, groupId]
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
    const { searchParams } = new URL(request.url);
    const filterDepartment = searchParams.get('department');
    const excludeGuestId = searchParams.get('excludeGuestId');
    
    let query = `SELECT g.*, gr.name as group_name FROM guests g 
                 LEFT JOIN groups gr ON g.group_id = gr.id 
                 WHERE g.event_id = ?`;
    let queryParams = [resolvedParams.eventId];
    
    // Filter by department if specified
    if (filterDepartment) {
      query += ` AND gr.name = ?`;
      queryParams.push(filterDepartment);
    }
    
    // Exclude a specific guest if specified (for voting, exclude the voter)
    if (excludeGuestId) {
      query += ` AND g.id != ?`;
      queryParams.push(excludeGuestId);
    }
    
    query += ` ORDER BY gr.name, g.first_name`;
    
    const guests = await dbQuery(query, queryParams);
    
    return NextResponse.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
}
