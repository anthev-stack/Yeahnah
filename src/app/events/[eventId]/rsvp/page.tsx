'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, X, Award, Calendar, Users, Search } from 'lucide-react';
import TemplateRSVP from '@/components/TemplateRSVP';

interface EventData {
  id: string;
  title: string;
  description: string;
  event_type: 'business' | 'personal';
  multi_store_enabled: boolean;
  event_date: string;
  template_theme: 'light' | 'dark' | 'love';
  logo_url?: string;
}

interface GuestData {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  store_department?: string;
  rsvp_status: 'pending' | 'yes' | 'no';
  rsvp_date?: string;
  guest_id?: string;
  group_name?: string;
}

interface AwardData {
  id: string;
  title: string;
  description?: string;
}

export default function EventRSVPPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  
  const [event, setEvent] = useState<EventData | null>(null);
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [awards, setAwards] = useState<AwardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [guestId, setGuestId] = useState('');
  const [searchMethod, setSearchMethod] = useState<'name' | 'id'>('name');

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/rsvp`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data.event);
          setGuests(data.guests);
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const findGuest = async () => {
    if (searchMethod === 'name' && !firstName.trim()) {
      alert('Please enter your first name');
      return;
    }
    
    if (searchMethod === 'id' && !guestId.trim()) {
      alert('Please enter your guest ID');
      return;
    }

    // Find guest in the local list first
    let foundGuest: GuestData | null = null;
    
    if (searchMethod === 'id') {
      foundGuest = guests.find(g => g.guest_id === guestId.trim()) || null;
    } else {
      const searchFirstName = firstName.trim().toLowerCase();
      const searchLastName = (lastName || '').trim().toLowerCase();
      
      foundGuest = guests.find(g => {
        const gFirstName = g.first_name.toLowerCase();
        const gLastName = (g.last_name || '').toLowerCase();
        
        if (searchLastName) {
          return gFirstName === searchFirstName && gLastName === searchLastName;
        } else {
          return gFirstName === searchFirstName && (!g.last_name || g.last_name.trim() === '');
        }
      }) || null;
    }

    if (foundGuest) {
      setSelectedGuest(foundGuest);
      if (foundGuest.rsvp_status !== 'pending') {
        setRsvpSubmitted(true);
      }
    } else {
      alert('Guest not found. Please check your name or guest ID and try again.');
    }
  };

  const handleRSVP = async (response: 'yes' | 'no') => {
    if (!selectedGuest) return;
    
    setSubmitting(true);
    try {
      const rsvpResponse = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          guestId, 
          response 
        }),
      });
      
      if (rsvpResponse.ok) {
        setRsvpSubmitted(true);
        // Update the guest in local state
        setGuests(prev => prev.map(g => 
          g.id === selectedGuest.id 
            ? { ...g, rsvp_status: response, rsvp_date: new Date().toISOString() }
            : g
        ));
        setSelectedGuest(prev => prev ? { ...prev, rsvp_status: response } : null);
        alert(`RSVP updated to ${response.toUpperCase()}!`);
      } else {
        const errorData = await rsvpResponse.json();
        alert(errorData.error || 'Failed to update RSVP.');
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Error updating RSVP.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card text-center">
        <div className="spinner" style={{ margin: '2rem auto' }}></div>
        <p>Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="card text-center">
        <X size={48} color="#ff416c" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '1rem' }}>Event Not Found</h2>
        <p>The event you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  if (!selectedGuest) {
    return (
      <div className="rsvp-container">
        <div className="rsvp-card">
          {event.logo_url && (
            <div className="logo-display">
              <img src={event.logo_url} alt="Event Logo" className="event-logo" />
            </div>
          )}
          
          <div className="card-header text-center">
            <Calendar size={48} style={{ marginBottom: '1rem' }} />
            <h1 className="card-title">{event.title}</h1>
            <div className="event-date-display">
              📅 {new Date(event.event_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <p className="card-subtitle">
              Please enter your information to RSVP
            </p>
          </div>

          <div className="rsvp-form">
            <div className="form-group">
              <label className="form-label">How would you like to find your invitation?</label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchMethod"
                    value="name"
                    checked={searchMethod === 'name'}
                    onChange={(e) => setSearchMethod(e.target.value as 'name' | 'id')}
                    className="mr-2"
                  />
                  By Name
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchMethod"
                    value="id"
                    checked={searchMethod === 'id'}
                    onChange={(e) => setSearchMethod(e.target.value as 'name' | 'id')}
                    className="mr-2"
                  />
                  By Guest ID
                </label>
              </div>
            </div>

            {searchMethod === 'name' ? (
              <>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    onKeyPress={(e) => e.key === 'Enter' && findGuest()}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    onKeyPress={(e) => e.key === 'Enter' && findGuest()}
                  />
                </div>
              </>
            ) : (
              <div className="form-group">
                <label className="form-label">Guest ID *</label>
                <input
                  type="text"
                  className="form-input"
                  value={guestId}
                  onChange={(e) => setGuestId(e.target.value)}
                  placeholder="Enter your guest ID"
                  onKeyPress={(e) => e.key === 'Enter' && findGuest()}
                />
              </div>
            )}

            <button
              className="btn btn-primary btn-large"
              onClick={findGuest}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              <Search size={20} style={{ marginRight: '0.5rem' }} />
              Find My Invitation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show RSVP form for the selected guest
  return (
    <TemplateRSVP
      guest={{
        id: selectedGuest.id,
        event_id: selectedGuest.event_id,
        first_name: selectedGuest.first_name,
        last_name: selectedGuest.last_name,
        email: selectedGuest.email,
        store_department: selectedGuest.group_name,
        rsvp_status: selectedGuest.rsvp_status,
        rsvp_date: selectedGuest.rsvp_date,
        event_title: event.title,
        event_type: event.event_type,
        multi_store_enabled: event.multi_store_enabled,
        event_date: event.event_date,
        template_theme: event.template_theme,
        logo_url: event.logo_url
      }}
      awards={awards}
      onRSVP={handleRSVP}
      onVote={() => {}} // Voting not implemented yet for this flow
      votedAwards={[]}
    />
  );
}
