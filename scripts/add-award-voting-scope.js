const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Add award_voting_scope field to events table...');
    
    // Add the new column if it doesn't exist
    await client.query(`
      ALTER TABLE events 
      ADD COLUMN award_voting_scope TEXT DEFAULT 'all' CHECK (award_voting_scope IN ('all', 'department'))
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('Column award_voting_scope already exists, skipping migration.');
    } else {
      console.error('Migration failed:', error);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrateDatabase();
