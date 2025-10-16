import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize database tables
export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
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

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_guests_event_id ON guests(event_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_guests_guest_id ON guests(guest_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_awards_event_id ON awards(event_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_votes_event_id ON votes(event_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_groups_event_id ON groups(event_id)
    `);

  } finally {
    client.release();
  }
};

// Helper function to convert SQLite ? syntax to PostgreSQL $1, $2 syntax
const convertToPostgresParams = (text: string, params: any[]): { query: string; params: any[] } => {
  let paramIndex = 1;
  const convertedQuery = text.replace(/\?/g, () => `$${paramIndex++}`);
  return { query: convertedQuery, params };
};

export const dbQuery = async (text: string, params: any[] = []): Promise<any[]> => {
  const client = await pool.connect();
  try {
    const { query, params: convertedParams } = convertToPostgresParams(text, params);
    const result = await client.query(query, convertedParams);
    return result.rows;
  } finally {
    client.release();
  }
};

export const dbRun = async (text: string, params: any[] = []): Promise<{ rowCount: number }> => {
  const client = await pool.connect();
  try {
    const { query, params: convertedParams } = convertToPostgresParams(text, params);
    const result = await client.query(query, convertedParams);
    return { rowCount: result.rowCount || 0 };
  } finally {
    client.release();
  }
};

export const dbGet = async (text: string, params: any[] = []): Promise<any> => {
  const client = await pool.connect();
  try {
    const { query, params: convertedParams } = convertToPostgresParams(text, params);
    const result = await client.query(query, convertedParams);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

export { uuidv4 };