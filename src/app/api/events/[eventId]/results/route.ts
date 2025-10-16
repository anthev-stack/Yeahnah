import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, initializeDatabase } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const awardId = searchParams.get('awardId');
    const storeDepartment = searchParams.get('storeDepartment');
    
    let query = `
      SELECT 
        g.id,
        g.first_name,
        g.last_name,
        g.store_department,
        a.title as award_title,
        COUNT(v.id) as vote_count
      FROM guests g
      LEFT JOIN votes v ON g.id = v.nominee_id
      LEFT JOIN awards a ON v.award_id = a.id
      WHERE g.event_id = ?
    `;
    
    const queryParams = [resolvedParams.eventId];
    
    if (awardId) {
      query += ` AND a.id = ?`;
      queryParams.push(awardId);
    }
    
    if (storeDepartment) {
      query += ` AND g.store_department = ?`;
      queryParams.push(storeDepartment);
    }
    
    query += `
      GROUP BY g.id, g.first_name, g.last_name, g.store_department, a.title
      ORDER BY vote_count DESC, g.last_name, g.first_name
    `;
    
    const results = await dbQuery(query, queryParams);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
