const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Database setup - use in-memory for Vercel deployment
// In production, you should use a proper database like PostgreSQL or MongoDB
const db = new sqlite3.Database(':memory:');

// Initialize database tables
db.serialize(() => {
  // Events table
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('business', 'personal')),
    multi_store_enabled BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    host_name TEXT,
    host_email TEXT
  )`);

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
  )`);

  // Awards table
  db.run(`CREATE TABLE IF NOT EXISTS awards (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events (id)
  )`);

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
  )`);
});

// API Routes

// Create new event
app.post('/api/events', (req, res) => {
  const { title, description, eventType, multiStoreEnabled, hostName, hostEmail } = req.body;
  const eventId = uuidv4();
  
  db.run(
    `INSERT INTO events (id, title, description, event_type, multi_store_enabled, host_name, host_email) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [eventId, title, description, eventType, multiStoreEnabled ? 1 : 0, hostName, hostEmail],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ eventId, message: 'Event created successfully' });
    }
  );
});

// Add guest to event
app.post('/api/events/:eventId/guests', (req, res) => {
  const { eventId } = req.params;
  const { firstName, lastName, email, guestId, storeDepartment } = req.body;
  const guestUuid = uuidv4();
  
  db.run(
    `INSERT INTO guests (id, event_id, first_name, last_name, email, guest_id, store_department) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [guestUuid, eventId, firstName, lastName, email, guestId, storeDepartment],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ guestId: guestUuid, message: 'Guest added successfully' });
    }
  );
});

// Get event details
app.get('/api/events/:eventId', (req, res) => {
  const { eventId } = req.params;
  
  db.get(
    `SELECT * FROM events WHERE id = ?`,
    [eventId],
    (err, event) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }
      res.json(event);
    }
  );
});

// Get guests for event
app.get('/api/events/:eventId/guests', (req, res) => {
  const { eventId } = req.params;
  
  db.all(
    `SELECT * FROM guests WHERE event_id = ? ORDER BY last_name, first_name`,
    [eventId],
    (err, guests) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(guests);
    }
  );
});

// RSVP response
app.post('/api/rsvp/:guestId', (req, res) => {
  const { guestId } = req.params;
  const { response } = req.body;
  
  if (!['yes', 'no'].includes(response)) {
    res.status(400).json({ error: 'Invalid response. Must be "yes" or "no"' });
    return;
  }
  
  db.run(
    `UPDATE guests SET rsvp_status = ?, rsvp_date = CURRENT_TIMESTAMP WHERE guest_id = ?`,
    [response, guestId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Guest not found' });
        return;
      }
      res.json({ message: 'RSVP updated successfully' });
    }
  );
});

// Get RSVP status by guest ID
app.get('/api/rsvp/:guestId', (req, res) => {
  const { guestId } = req.params;
  
  db.get(
    `SELECT g.*, e.title as event_title, e.event_type, e.multi_store_enabled 
     FROM guests g 
     JOIN events e ON g.event_id = e.id 
     WHERE g.guest_id = ?`,
    [guestId],
    (err, guest) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!guest) {
        res.status(404).json({ error: 'Guest not found' });
        return;
      }
      res.json(guest);
    }
  );
});

// Create award
app.post('/api/events/:eventId/awards', (req, res) => {
  const { eventId } = req.params;
  const { title, description } = req.body;
  const awardId = uuidv4();
  
  db.run(
    `INSERT INTO awards (id, event_id, title, description) VALUES (?, ?, ?, ?)`,
    [awardId, eventId, title, description],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ awardId, message: 'Award created successfully' });
    }
  );
});

// Get awards for event
app.get('/api/events/:eventId/awards', (req, res) => {
  const { eventId } = req.params;
  
  db.all(
    `SELECT * FROM awards WHERE event_id = ? ORDER BY created_at`,
    [eventId],
    (err, awards) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(awards);
    }
  );
});

// Submit vote
app.post('/api/events/:eventId/vote', (req, res) => {
  const { eventId } = req.params;
  const { awardId, voterId, nomineeId } = req.body;
  const voteId = uuidv4();
  
  // Check if voter already voted for this award
  db.get(
    `SELECT id FROM votes WHERE event_id = ? AND award_id = ? AND voter_id = ?`,
    [eventId, awardId, voterId],
    (err, existingVote) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (existingVote) {
        // Update existing vote
        db.run(
          `UPDATE votes SET nominee_id = ? WHERE id = ?`,
          [nomineeId, existingVote.id],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ message: 'Vote updated successfully' });
          }
        );
      } else {
        // Create new vote
        db.run(
          `INSERT INTO votes (id, event_id, award_id, voter_id, nominee_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [voteId, eventId, awardId, voterId, nomineeId],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ message: 'Vote submitted successfully' });
          }
        );
      }
    }
  );
});

// Get voting results for event
app.get('/api/events/:eventId/results', (req, res) => {
  const { eventId } = req.params;
  const { awardId, storeDepartment } = req.query;
  
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
  
  const params = [eventId];
  
  if (awardId) {
    query += ` AND a.id = ?`;
    params.push(awardId);
  }
  
  if (storeDepartment) {
    query += ` AND g.store_department = ?`;
    params.push(storeDepartment);
  }
  
  query += `
    GROUP BY g.id, g.first_name, g.last_name, g.store_department, a.title
    ORDER BY vote_count DESC, g.last_name, g.first_name
  `;
  
  db.all(query, params, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
