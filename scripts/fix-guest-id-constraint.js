const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixGuestIdConstraint() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing guest_id unique constraint...');
    
    // Drop the existing unique constraint
    console.log('📝 Dropping existing unique constraint on guest_id...');
    await client.query(`
      ALTER TABLE guests 
      DROP CONSTRAINT IF EXISTS guests_guest_id_key
    `);
    console.log('✅ Existing constraint dropped');
    
    // Add a new unique constraint that combines guest_id and event_id
    console.log('🔗 Adding new composite unique constraint...');
    await client.query(`
      ALTER TABLE guests 
      ADD CONSTRAINT guests_guest_id_event_id_unique 
      UNIQUE (guest_id, event_id)
    `);
    console.log('✅ New composite constraint added');
    
    console.log('🎉 Guest ID constraint fix completed successfully!');
    console.log('📋 Now guest_id only needs to be unique within each event, not globally.');
    
  } catch (error) {
    console.error('❌ Constraint fix failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixGuestIdConstraint().catch(console.error);
