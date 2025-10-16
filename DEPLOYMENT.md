# Deployment Guide for Yeahnah

## Vercel Deployment

This application is configured for deployment on Vercel. The current setup uses an in-memory SQLite database, which means data will be reset on each deployment.

### For Production Use

**Important**: The current database setup uses in-memory storage, which means all data will be lost when the server restarts. For a production application, you should:

1. **Use a proper database service**:
   - PostgreSQL with Vercel Postgres
   - MongoDB Atlas
   - PlanetScale (MySQL)
   - Supabase

2. **Update the database configuration** in `server/index.js` to connect to your chosen database.

### Quick Deploy to Vercel

1. **Connect your GitHub repository** to Vercel
2. **Configure build settings**:
   - Root Directory: Leave as default
   - Build Command: `npm run build`
   - Output Directory: `client/build`

3. **Environment Variables** (if using external database):
   - Add your database connection strings
   - Update the server code to use environment variables

### Local Development

```bash
# Install dependencies
npm run install-all

# Start development servers
npm run dev
```

### Build for Production

```bash
# Build the client
cd client && npm run build

# The server will serve the built client files
```

## Database Migration for Production

To use a real database in production:

1. **Choose a database service** (recommended: Vercel Postgres)
2. **Install the appropriate database driver** (e.g., `pg` for PostgreSQL)
3. **Update `server/index.js`** to use the new database connection
4. **Add environment variables** in Vercel dashboard
5. **Update the SQL schema** to match your chosen database

### Example with Vercel Postgres

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});
```

## Current Limitations

- **Data Persistence**: Data is stored in memory and will be lost on restart
- **Scalability**: Single server instance (not suitable for high traffic)
- **Security**: No authentication or authorization implemented

## Next Steps for Production

1. Implement proper database with persistent storage
2. Add user authentication
3. Add input validation and sanitization
4. Implement rate limiting
5. Add error monitoring and logging
6. Set up CI/CD pipeline
7. Add comprehensive testing

---

**Note**: This is a demo application. For production use, please implement proper security measures and data persistence.
