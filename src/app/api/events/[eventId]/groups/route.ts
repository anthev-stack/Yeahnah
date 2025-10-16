import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbQuery, dbGet, uuidv4, initializeDatabase } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const { name } = await request.json();
    const resolvedParams = await params;
    const groupId = uuidv4();
    
    await dbRun(
      'INSERT INTO groups (id, event_id, name) VALUES (?, ?, ?)',
      [groupId, resolvedParams.eventId, name]
    );
    
    return NextResponse.json({ groupId, message: 'Group created successfully' });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const resolvedParams = await params;
    const groups = await dbQuery(
      'SELECT * FROM groups WHERE event_id = ? ORDER BY created_at',
      [resolvedParams.eventId]
    );
    
    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const { groupId } = await request.json();
    const resolvedParams = await params;
    
    await dbRun(
      'DELETE FROM groups WHERE id = ? AND event_id = ?',
      [groupId, resolvedParams.eventId]
    );
    
    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}

