import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';

// Database setup - use in-memory for Vercel deployment
// In production, you should use a proper database like PostgreSQL or MongoDB
const db = new sqlite3.Database(':memory:');

// Initialize database tables
export const initializeDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
      });

      // Events table
      db.run(`CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        event_type TEXT NOT NULL CHECK (event_type IN ('business', 'personal')),
        multi_store_enabled BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        host_id TEXT NOT NULL,
        host_name TEXT,
        host_email TEXT,
        FOREIGN KEY (host_id) REFERENCES users (id)
      )`, (err) => {
        if (err) reject(err);
      });

      // Guests table
      db.run(`CREATE TABLE IF NOT EXISTS guests (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        guest_id TEXT UNIQUE,
        store_department TEXT,
        rsvp_status TEXT CHECK (rsvp_status IN ('yes', 'no', 'pending')) DEFAULT 'pending',
        rsvp_date DATETIME,
        FOREIGN KEY (event_id) REFERENCES events (id)
      )`, (err) => {
        if (err) reject(err);
      });

      // Awards table
      db.run(`CREATE TABLE IF NOT EXISTS awards (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id)
      )`, (err) => {
        if (err) reject(err);
      });

      // Votes table
      db.run(`CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        award_id TEXT NOT NULL,
        voter_id TEXT NOT NULL,
        nominee_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id),
        FOREIGN KEY (award_id) REFERENCES awards (id),
        FOREIGN KEY (voter_id) REFERENCES guests (id),
        FOREIGN KEY (nominee_id) REFERENCES guests (id)
      )`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

export const dbQuery = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbRun = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const dbGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export { uuidv4 };
