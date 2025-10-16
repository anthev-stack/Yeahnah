import { dbQuery, dbRun, initializeDatabase } from './database';
import { sendEventSummaryEmail, EventSummary } from './email';

export const cleanupExpiredEvents = async () => {
  try {
    await initializeDatabase();
    
    // Find events that have passed (event_date < today)
    const today = new Date().toISOString().split('T')[0];
    const expiredEvents = await dbQuery(
      `SELECT * FROM events WHERE event_date < ?`,
      [today]
    );

    console.log(`Found ${expiredEvents.length} expired events to cleanup`);

    for (const event of expiredEvents) {
      await processExpiredEvent(event);
    }

    return { processed: expiredEvents.length };
  } catch (error) {
    console.error('Error during event cleanup:', error);
    throw error;
  }
};

const processExpiredEvent = async (event: any) => {
  try {
    console.log(`Processing expired event: ${event.title} (${event.id})`);

    // Get event summary data before deletion
    const summary = await generateEventSummary(event);
    
    // Send email summary to host
    if (summary) {
      await sendEventSummaryEmail(summary);
    }

    // Delete all related data (cascading deletes will handle this)
    await dbRun('DELETE FROM events WHERE id = ?', [event.id]);
    
    console.log(`Successfully cleaned up event: ${event.title}`);
  } catch (error) {
    console.error(`Error processing event ${event.id}:`, error);
  }
};

const generateEventSummary = async (event: any): Promise<EventSummary | null> => {
  try {
    // Get guest statistics
    const guestStats = await dbQuery(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN rsvp_status = 'yes' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN rsvp_status = 'no' THEN 1 ELSE 0 END) as declined,
        SUM(CASE WHEN rsvp_status = 'pending' THEN 1 ELSE 0 END) as pending
       FROM guests WHERE event_id = ?`,
      [event.id]
    );

    const stats = guestStats[0];

    // Get group breakdown if multi-store is enabled
    let groups = undefined;
    if (event.multi_store_enabled) {
      const groupStats = await dbQuery(
        `SELECT 
          g.name,
          COUNT(gu.id) as guests,
          SUM(CASE WHEN gu.rsvp_status = 'yes' THEN 1 ELSE 0 END) as confirmed
         FROM groups g
         LEFT JOIN guests gu ON g.id = gu.group_id
         WHERE g.event_id = ?
         GROUP BY g.id, g.name`,
        [event.id]
      );
      groups = groupStats;
    }

    // Get award winners if awards exist
    let awards = undefined;
    const awardStats = await dbQuery(
      `SELECT 
        a.title,
        COUNT(v.id) as votes,
        gu.first_name || ' ' || gu.last_name as winner_name
       FROM awards a
       LEFT JOIN votes v ON a.id = v.award_id
       LEFT JOIN guests gu ON v.nominee_id = gu.id
       WHERE a.event_id = ?
       GROUP BY a.id, a.title, gu.first_name, gu.last_name
       HAVING COUNT(v.id) > 0
       ORDER BY COUNT(v.id) DESC
       LIMIT 1`,
      [event.id]
    );

    if (awardStats.length > 0) {
      awards = awardStats.map(award => ({
        title: award.title,
        winner: award.winner_name || 'No votes',
        votes: award.votes
      }));
    }

    return {
      eventId: event.id,
      title: event.title,
      eventDate: event.event_date,
      hostName: event.host_name,
      hostEmail: event.host_email,
      totalGuests: parseInt(stats.total),
      confirmedGuests: parseInt(stats.confirmed),
      declinedGuests: parseInt(stats.declined),
      pendingGuests: parseInt(stats.pending),
      groups,
      awards
    };
  } catch (error) {
    console.error('Error generating event summary:', error);
    return null;
  }
};
