'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Calendar, Users, Award, Building2, Heart, LogIn, ArrowRight, Globe, Zap } from 'lucide-react';

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center" style={{ padding: '4rem 0' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: '700', 
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #888 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Streamline RSVP management with Yeahnah
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#888', 
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          Yeahnah provides the tools and platform to build, manage, and track events for both personal celebrations and business gatherings.
        </p>
        
        <div className="flex justify-center gap-4" style={{ marginBottom: '3rem' }}>
          {session ? (
            <Link href="/create-event" className="btn btn-primary btn-large">
              <Calendar size={20} />
              Create New Event
              <ArrowRight size={16} />
            </Link>
          ) : (
            <Link href="/auth/signup" className="btn btn-primary btn-large">
              Get Started
              <ArrowRight size={16} />
            </Link>
          )}
          <Link href="/contact" className="btn btn-secondary btn-large">
            Talk to an Expert
          </Link>
        </div>

        {session && (
          <p className="text-green" style={{ fontSize: '1rem', marginBottom: '2rem' }}>
            Welcome back, {session.user?.name}! Ready to create your next event?
          </p>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid grid-2" style={{ marginBottom: '4rem' }}>
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={24} />
            <h3>Business Events</h3>
          </div>
          <p style={{ color: '#888', marginBottom: '1.5rem' }}>
            Perfect for work functions, Christmas parties, meetings, and corporate gatherings
          </p>
          <ul style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <li>• Multi-group support (stores, departments, regions)</li>
            <li>• Award voting systems with leaderboards</li>
            <li>• Professional analytics and reporting</li>
            <li>• Team collaboration features</li>
          </ul>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={24} />
            <h3>Personal Events</h3>
          </div>
          <p style={{ color: '#888', marginBottom: '1.5rem' }}>
            Ideal for birthdays, weddings, engagement parties, and casual get-togethers
          </p>
          <ul style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <li>• Simple RSVP management</li>
            <li>• Guest ID system for easy access</li>
            <li>• Beautiful invitation sharing</li>
            <li>• Intuitive guest experience</li>
          </ul>
        </div>
      </div>

      {/* How It Works */}
      <div className="card">
        <h3 style={{ marginBottom: '2rem', textAlign: 'center' }}>How It Works</h3>
        <div className="grid grid-3">
          <div className="text-center">
            <div style={{
              background: 'rgba(0, 255, 136, 0.1)',
              color: '#00ff88',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0 auto 1rem'
            }}>1</div>
            <h4 style={{ marginBottom: '0.5rem' }}>Create Event</h4>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>Set up your event with custom details and guest lists</p>
          </div>
          <div className="text-center">
            <div style={{
              background: 'rgba(0, 255, 136, 0.1)',
              color: '#00ff88',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0 auto 1rem'
            }}>2</div>
            <h4 style={{ marginBottom: '0.5rem' }}>Share Invitations</h4>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>Send unique links to your guests for easy RSVP</p>
          </div>
          <div className="text-center">
            <div style={{
              background: 'rgba(0, 255, 136, 0.1)',
              color: '#00ff88',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0 auto 1rem'
            }}>3</div>
            <h4 style={{ marginBottom: '0.5rem' }}>Track Results</h4>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>Monitor responses and award voting in real-time</p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="grid grid-3" style={{ marginBottom: '4rem' }}>
        <div className="card text-center">
          <Users size={32} className="text-green" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ marginBottom: '0.5rem' }}>Easy Guest Management</h4>
          <p style={{ fontSize: '0.9rem', color: '#888' }}>Add guests with optional IDs for quick access</p>
        </div>
        <div className="card text-center">
          <Award size={32} className="text-green" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ marginBottom: '0.5rem' }}>Award Voting</h4>
          <p style={{ fontSize: '0.9rem', color: '#888' }}>Create custom awards and let guests vote</p>
        </div>
        <div className="card text-center">
          <Globe size={32} className="text-green" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ marginBottom: '0.5rem' }}>Real-time Results</h4>
          <p style={{ fontSize: '0.9rem', color: '#888' }}>See top performers instantly</p>
        </div>
      </div>
    </div>
  );
}