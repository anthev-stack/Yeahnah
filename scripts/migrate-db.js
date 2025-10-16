const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migration...');
    
    // Check if event_date column exists
    const eventDateCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'event_date'
    `);
    
    if (eventDateCheck.rows.length === 0) {
      console.log('📅 Adding event_date column to events table...');
      await client.query(`
        ALTER TABLE events 
        ADD COLUMN event_date DATE
      `);
      console.log('✅ event_date column added');
    } else {
      console.log('✅ event_date column already exists');
    }
    
    // Check if template_theme column exists
    const templateThemeCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'template_theme'
    `);
    
    if (templateThemeCheck.rows.length === 0) {
      console.log('🎨 Adding template_theme column to events table...');
      await client.query(`
        ALTER TABLE events 
        ADD COLUMN template_theme TEXT DEFAULT 'light' CHECK (template_theme IN ('light', 'dark', 'love'))
      `);
      console.log('✅ template_theme column added');
    } else {
      console.log('✅ template_theme column already exists');
    }
    
    // Check if logo_url column exists
    const logoUrlCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'logo_url'
    `);
    
    if (logoUrlCheck.rows.length === 0) {
      console.log('🖼️ Adding logo_url column to events table...');
      await client.query(`
        ALTER TABLE events 
        ADD COLUMN logo_url TEXT
      `);
      console.log('✅ logo_url column added');
    } else {
      console.log('✅ logo_url column already exists');
    }
    
    // Check if group_id column exists in guests table
    const groupIdCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'guests' AND column_name = 'group_id'
    `);
    
    if (groupIdCheck.rows.length === 0) {
      console.log('👥 Adding group_id column to guests table...');
      await client.query(`
        ALTER TABLE guests 
        ADD COLUMN group_id TEXT
      `);
      console.log('✅ group_id column added');
    } else {
      console.log('✅ group_id column already exists');
    }
    
    // Check if groups table exists
    const groupsTableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'groups'
    `);
    
    if (groupsTableCheck.rows.length === 0) {
      console.log('🏢 Creating groups table...');
      await client.query(`
        CREATE TABLE groups (
          id TEXT PRIMARY KEY,
          event_id TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
        )
      `);
      console.log('✅ groups table created');
    } else {
      console.log('✅ groups table already exists');
    }
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateDatabase().catch(console.error);
