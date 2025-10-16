const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Initializing PostgreSQL database...');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created/verified');

    // Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        event_type TEXT NOT NULL CHECK (event_type IN ('business', 'personal')),
        multi_store_enabled BOOLEAN DEFAULT FALSE,
        event_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        host_id TEXT NOT NULL,
        host_name TEXT,
        host_email TEXT,
        FOREIGN KEY (host_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Events table created/verified');

    // Create groups table (for stores, departments, states, etc.)
    await client.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Groups table created/verified');

    // Create guests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS guests (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT,
        guest_id TEXT UNIQUE,
        group_id TEXT,
        rsvp_status TEXT CHECK (rsvp_status IN ('yes', 'no', 'pending')) DEFAULT 'pending',
        rsvp_date TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Guests table created/verified');

    // Create awards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS awards (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Awards table created/verified');

    // Create votes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        award_id TEXT NOT NULL,
        voter_id TEXT NOT NULL,
        nominee_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
        FOREIGN KEY (award_id) REFERENCES awards (id) ON DELETE CASCADE,
        FOREIGN KEY (voter_id) REFERENCES guests (id) ON DELETE CASCADE,
        FOREIGN KEY (nominee_id) REFERENCES guests (id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Votes table created/verified');

    // Create indexes for better performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_guests_event_id ON guests(event_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_guests_guest_id ON guests(guest_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_awards_event_id ON awards(event_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_votes_event_id ON votes(event_id)`);
    console.log('✅ Database indexes created/verified');

    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
