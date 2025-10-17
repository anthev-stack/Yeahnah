const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixEmptyGuestIds() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing empty guest_id values...');
    
    // Find all guests with empty or null guest_id
    const emptyGuestIds = await client.query(`
      SELECT id, event_id, first_name, last_name 
      FROM guests 
      WHERE guest_id IS NULL OR guest_id = '' OR TRIM(guest_id) = ''
    `);
    
    console.log(`📋 Found ${emptyGuestIds.rows.length} guests with empty guest_id values`);
    
    if (emptyGuestIds.rows.length === 0) {
      console.log('✅ No empty guest_id values found');
      return;
    }
    
    // Update each guest with a unique guest_id
    for (const guest of emptyGuestIds.rows) {
      const timestamp = Date.now().toString(36);
      const firstNameInitial = guest.first_name ? guest.first_name.charAt(0).toUpperCase() : 'G';
      const newGuestId = `${firstNameInitial}${timestamp}${Math.random().toString(36).substr(2, 4)}`;
      
      await client.query(`
        UPDATE guests 
        SET guest_id = $1 
        WHERE id = $2
      `, [newGuestId, guest.id]);
      
      console.log(`✅ Updated guest ${guest.first_name} ${guest.last_name} with guest_id: ${newGuestId}`);
    }
    
    console.log('🎉 All empty guest_id values have been fixed!');
    
  } catch (error) {
    console.error('❌ Failed to fix empty guest_id values:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixEmptyGuestIds().catch(console.error);
