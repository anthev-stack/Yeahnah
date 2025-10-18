'use client';

export default function RSVPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style jsx global>{`
        /* Hide all navigation and header elements */
        header, nav, .header, .navbar, .navigation, .top-nav {
          display: none !important;
        }
        
        /* Hide footer */
        footer, .footer {
          display: none !important;
        }
        
        /* Ensure body takes full viewport */
        body {
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
        }
        
        /* Make sure our RSVP content is on top */
        .rsvp-standalone {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 99999 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
      <div className="rsvp-standalone">
        {children}
      </div>
    </>
  );
}
