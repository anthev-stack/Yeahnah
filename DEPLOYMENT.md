# Deployment Guide for Yeahnah (Next.js Version)

## Vercel Deployment

This application has been converted to **Next.js** and is configured for deployment on Vercel. The current setup uses an in-memory SQLite database, which means data will be reset on each deployment.

### For Production Use

**Important**: The current database setup uses in-memory storage, which means all data will be lost when the server restarts. For a production application, you should:

1. **Use a proper database service**:
   - PostgreSQL with Vercel Postgres
   - MongoDB Atlas
   - PlanetScale (MySQL)
   - Supabase

2. **Update the database configuration** in `src/lib/database.ts` to connect to your chosen database.

### Quick Deploy to Vercel

1. **Connect your GitHub repository** to Vercel
2. **Vercel will auto-detect** this as a Next.js application
3. **Deploy!** - The app will be live in minutes

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:3000

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Next.js Architecture

### API Routes
- `/api/events` - Event management
- `/api/events/[eventId]/guests` - Guest management
- `/api/rsvp/[guestId]` - RSVP responses
- `/api/events/[eventId]/awards` - Award management
- `/api/events/[eventId]/vote` - Voting system
- `/api/events/[eventId]/results` - Results and leaderboards

### Pages
- `/` - Home page
- `/create-event` - Event creation wizard
- `/event/[eventId]/dashboard` - Host dashboard
- `/rsvp/[guestId]` - Guest RSVP page

### Database Integration

The application uses SQLite with the following tables:
- `events` - Event information
- `guests` - Guest details and RSVP status
- `awards` - Award categories
- `votes` - Voting records

## Database Migration for Production

To use a real database in production:

1. **Choose a database service** (recommended: Vercel Postgres)
2. **Install the appropriate database driver** (e.g., `pg` for PostgreSQL)
3. **Update `src/lib/database.ts`** to use the new database connection
4. **Add environment variables** in Vercel dashboard
5. **Update the SQL schema** to match your chosen database

### Example with Vercel Postgres

```bash
npm install pg @types/pg
```

```typescript
// src/lib/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export const dbQuery = async (text: string, params: any[] = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
};
```

## Environment Variables

For production deployment, add these environment variables in Vercel:

```bash
# Database
POSTGRES_URL=your_postgres_connection_string
DATABASE_URL=your_database_url

# Optional: JWT secrets for future authentication
JWT_SECRET=your_jwt_secret
```

## Current Limitations

- **Data Persistence**: Data is stored in memory and will be lost on restart
- **Scalability**: Single server instance (not suitable for high traffic)
- **Security**: No authentication or authorization implemented

## Next Steps for Production

1. Implement proper database with persistent storage
2. Add user authentication with NextAuth.js
3. Add input validation and sanitization
4. Implement rate limiting
5. Add error monitoring and logging
6. Set up CI/CD pipeline
7. Add comprehensive testing

## Benefits of Next.js Version

✅ **Simplified Architecture**: Single framework for frontend and backend
✅ **API Routes**: Built-in API endpoints
✅ **Server-Side Rendering**: Better SEO and performance
✅ **Automatic Code Splitting**: Faster page loads
✅ **Built-in CSS Support**: No additional build tools needed
✅ **Easy Deployment**: Optimized for Vercel

---

**Note**: This is a demo application. For production use, please implement proper security measures and data persistence.