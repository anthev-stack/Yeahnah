export default function RSVPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Event RSVP</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              margin: 0;
              padding: 0;
              min-height: 100vh;
              font-family: system-ui, -apple-system, sans-serif;
              overflow-x: hidden;
            }
            #__next {
              min-height: 100vh;
            }
            /* Hide any potential navigation or header elements */
            header, nav, .header, .navbar {
              display: none !important;
            }
            /* Ensure full viewport usage */
            .rsvp-container {
              min-height: 100vh;
              width: 100vw;
              position: fixed;
              top: 0;
              left: 0;
              z-index: 9999;
            }
          `
        }} />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        minHeight: '100vh',
        background: 'transparent',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999
        }}>
          {children}
        </div>
      </body>
    </html>
  );
}
