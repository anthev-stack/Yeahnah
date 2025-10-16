'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Users, Award, Building2, Heart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="text-center">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Welcome to Yeahnah
          </h1>
          <p className="card-subtitle" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Streamline your RSVP management for both personal and business events
          </p>
        </div>

        <div className="grid grid-2" style={{ marginBottom: '3rem' }}>
          <div className="card">
            <Building2 size={48} color="#667eea" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '1rem' }}>Business Events</h3>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Perfect for work functions, Christmas parties, end-of-year celebrations, and meetings.
            </p>
            <ul style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <li>• Multi-store/department support</li>
              <li>• Award voting system</li>
              <li>• Store-specific leaderboards</li>
              <li>• Professional guest management</li>
            </ul>
          </div>

          <div className="card">
            <Heart size={48} color="#764ba2" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '1rem' }}>Personal Events</h3>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Ideal for birthdays, weddings, engagement parties, and casual gatherings.
            </p>
            <ul style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <li>• Simple RSVP management</li>
              <li>• Custom guest IDs</li>
              <li>• Easy sharing via links</li>
              <li>• Award voting (optional)</li>
            </ul>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <Award size={32} color="#667eea" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '1rem' }}>Award Voting System</h3>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Let your attendees vote for colleagues and friends. Perfect for recognizing outstanding team members or celebrating special moments.
          </p>
          <div className="grid grid-3">
            <div>
              <strong>Custom Awards</strong>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Create your own award categories</p>
            </div>
            <div>
              <strong>Store Filtering</strong>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Vote within departments or stores</p>
            </div>
            <div>
              <strong>Leaderboards</strong>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>See top performers instantly</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/create-event" className="btn btn-primary btn-large">
            <Calendar size={20} />
            Create Your First Event
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>How It Works</h3>
        <div className="grid grid-3">
          <div className="text-center">
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0 auto 1rem'
            }}>
              1
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>Create Event</h4>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Choose business or personal event type and add your details
            </p>
          </div>

          <div className="text-center">
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0 auto 1rem'
            }}>
              2
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>Add Guests</h4>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Invite your guests with optional IDs for easy RSVP access
            </p>
          </div>

          <div className="text-center">
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0 auto 1rem'
            }}>
              3
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>Collect RSVPs</h4>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Guests respond with "Yeah" or "Nah" and vote for awards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
