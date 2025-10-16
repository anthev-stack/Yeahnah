import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { EventProvider } from '@/context/EventContext'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'Yeahnah - RSVP Management Platform',
  description: 'Streamline RSVP management for both personal and business events',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <EventProvider>
            <div className="App">
              <Header />
              <main className="main-content">
                {children}
              </main>
              <Footer />
            </div>
          </EventProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
