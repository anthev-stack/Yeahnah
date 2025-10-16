import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun, uuidv4, initializeDatabase } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await initializeDatabase();
    
    const { awardId, voterId, nomineeId } = await request.json();
    const resolvedParams = await params;
    
    // Check if voter already voted for this award
    const existingVote = await dbGet(
      'SELECT id FROM votes WHERE event_id = ? AND award_id = ? AND voter_id = ?',
      [resolvedParams.eventId, awardId, voterId]
    );
    
    if (existingVote) {
      // Update existing vote
      await dbRun(
        'UPDATE votes SET nominee_id = ? WHERE id = ?',
        [nomineeId, existingVote.id]
      );
      return NextResponse.json({ message: 'Vote updated successfully' });
    } else {
      // Create new vote
      const voteId = uuidv4();
      await dbRun(
        'INSERT INTO votes (id, event_id, award_id, voter_id, nominee_id) VALUES (?, ?, ?, ?, ?)',
        [voteId, resolvedParams.eventId, awardId, voterId, nomineeId]
      );
      return NextResponse.json({ message: 'Vote submitted successfully' });
    }
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}
