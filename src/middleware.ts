import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to RSVP pages without authentication
        if (req.nextUrl.pathname.startsWith('/rsvp/')) {
          return true;
        }
        
        // Allow access to auth pages
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true;
        }
        
        // Allow access to home page
        if (req.nextUrl.pathname === '/') {
          return true;
        }
        
        // Require authentication for event creation and dashboard
        if (req.nextUrl.pathname.startsWith('/create-event') || 
            req.nextUrl.pathname.startsWith('/event/')) {
          return !!token;
        }
        
        // Allow access to API routes for RSVP (public)
        if (req.nextUrl.pathname.startsWith('/api/rsvp/')) {
          return true;
        }
        
        // Require authentication for other protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/create-event/:path*',
    '/event/:path*',
    '/auth/:path*'
  ]
};

