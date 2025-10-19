'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, X, Award, Calendar, Users, Search } from 'lucide-react';
import StandaloneRSVP from '@/components/StandaloneRSVP';

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
  const [allGuests, setAllGuests] = useState<any[]>([]);
  const [votedAwards, setVotedAwards] = useState<string[]>([]);
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
          
          // Fetch guests for voting based on event settings
          // We'll fetch this later when we know which guest is voting
          
          // Fetch awards
          const awardsResponse = await fetch(`/api/events/${eventId}/awards`);
          if (awardsResponse.ok) {
            const awardsData = await awardsResponse.json();
            setAwards(awardsData);
          }
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

  const fetchGuestsForVoting = async (guest: GuestData) => {
    if (!event) return;
    
    try {
      let url = `/api/events/${eventId}/guests?excludeGuestId=${guest.id}`;
      
      // If multi-store is enabled and award voting scope is department-only, filter by department
      if (event.multi_store_enabled && event.award_voting_scope === 'department' && guest.group_name) {
        url += `&department=${encodeURIComponent(guest.group_name)}`;
      }
      
      const guestsResponse = await fetch(url);
      if (guestsResponse.ok) {
        const guestsData = await guestsResponse.json();
        setAllGuests(guestsData);
      }
    } catch (error) {
      console.error('Error fetching guests for voting:', error);
    }
  };

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
      // Fetch guests for voting based on the selected guest and event settings
      fetchGuestsForVoting(foundGuest);
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

  const handleVote = async (awardId: string, nomineeId: string) => {
    if (!selectedGuest) return;
    
    try {
      const voteResponse = await fetch(`/api/events/${eventId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          awardId, 
          voterId: selectedGuest.id, 
          nomineeId 
        }),
      });

      if (voteResponse.ok) {
        setVotedAwards(prev => [...prev, awardId]);
        alert('Vote submitted successfully!');
      } else {
        const errorData = await voteResponse.json();
        alert(errorData.error || 'Failed to submit vote.');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Error submitting vote.');
    }
  };

      if (loading) {
        return (
          <div style={{ 
            minHeight: '100vh',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '3rem',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              textAlign: 'center',
              maxWidth: '400px',
              width: '90%'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p style={{ margin: 0, color: '#666', fontSize: '1.1rem' }}>Loading event...</p>
            </div>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        );
      }

      if (!event) {
        return (
          <div style={{ 
            minHeight: '100vh',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '3rem',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              textAlign: 'center',
              maxWidth: '400px',
              width: '90%'
            }}>
              <X size={48} color="#ff6b6b" style={{ marginBottom: '1rem' }} />
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>Event Not Found</h2>
              <p style={{ color: '#666', lineHeight: '1.5' }}>The event you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        );
      }

  if (!selectedGuest) {
    const getThemeStyles = (theme: 'light' | 'dark' | 'love') => {
      switch (theme) {
        case 'dark':
          return {
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
            cardBg: 'rgba(26, 26, 26, 0.95)',
            textColor: '#ffffff',
            inputBg: '#333333',
            inputBorder: '#00ff88',
            buttonBg: '#00ff88',
            buttonColor: '#000000'
          };
        case 'love':
          return {
            background: 'linear-gradient(135deg, #ffe4e1 0%, #fff0f5 100%)',
            cardBg: 'rgba(255, 240, 245, 0.95)',
            textColor: '#8b4b69',
            inputBg: '#ffffff',
            inputBorder: '#ff69b4',
            buttonBg: '#ff69b4',
            buttonColor: '#ffffff'
          };
        case 'light':
        default:
          return {
            background: 'linear-gradient(135deg, #e0e7ff 0%, #ffffff 100%)',
            cardBg: 'rgba(255, 255, 255, 0.95)',
            textColor: '#333333',
            inputBg: '#ffffff',
            inputBorder: '#667eea',
            buttonBg: '#667eea',
            buttonColor: '#ffffff'
          };
      }
    };

    const styles = getThemeStyles(event.template_theme);

        return (
          <div style={{ 
            minHeight: '100vh',
            background: styles.background,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem'
          }}>
        <div style={{
          background: styles.cardBg,
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          color: styles.textColor
        }}>
          {event.logo_url && (
            <div style={{ marginBottom: '2rem' }}>
              <img 
                src={event.logo_url} 
                alt="Event Logo" 
                style={{ 
                  maxWidth: '120px', 
                  maxHeight: '120px', 
                  objectFit: 'contain',
                  borderRadius: '10px'
                }} 
              />
            </div>
          )}
          
          <Calendar size={48} style={{ marginBottom: '1rem', color: styles.buttonBg }} />
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            color: styles.textColor
          }}>
            {event.title}
          </h1>
          
          <div style={{ 
            fontSize: '1.1rem', 
            marginBottom: '1rem',
            color: styles.textColor,
            opacity: 0.8
          }}>
            📅 {new Date(event.event_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          
          <p style={{ 
            fontSize: '1rem', 
            marginBottom: '2rem',
            color: styles.textColor,
            opacity: 0.7
          }}>
            Please enter your information to RSVP
          </p>

          <div style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: styles.textColor
              }}>
                How would you like to find your invitation?
              </label>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="searchMethod"
                    value="name"
                    checked={searchMethod === 'name'}
                    onChange={(e) => setSearchMethod(e.target.value as 'name' | 'id')}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span style={{ color: styles.textColor }}>By Name</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="searchMethod"
                    value="id"
                    checked={searchMethod === 'id'}
                    onChange={(e) => setSearchMethod(e.target.value as 'name' | 'id')}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span style={{ color: styles.textColor }}>By Guest ID</span>
                </label>
              </div>
            </div>

            {searchMethod === 'name' ? (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: styles.textColor
                  }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${styles.inputBorder}`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: styles.inputBg,
                      color: styles.textColor,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    onKeyPress={(e) => e.key === 'Enter' && findGuest()}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: styles.textColor
                  }}>
                    Last Name (Optional)
                  </label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${styles.inputBorder}`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: styles.inputBg,
                      color: styles.textColor,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    onKeyPress={(e) => e.key === 'Enter' && findGuest()}
                  />
                </div>
              </>
            ) : (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: styles.textColor
                }}>
                  Guest ID *
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${styles.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: styles.inputBg,
                    color: styles.textColor,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  value={guestId}
                  onChange={(e) => setGuestId(e.target.value)}
                  placeholder="Enter your guest ID"
                  onKeyPress={(e) => e.key === 'Enter' && findGuest()}
                />
              </div>
            )}

            <button
              onClick={findGuest}
              style={{
                width: '100%',
                padding: '1rem',
                background: styles.buttonBg,
                color: styles.buttonColor,
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Search size={20} />
              Find My Invitation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show RSVP form for the selected guest
  return (
    <StandaloneRSVP
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
        award_voting_scope: event.award_voting_scope,
        event_date: event.event_date,
        template_theme: event.template_theme,
        logo_url: event.logo_url
      }}
      awards={awards}
      onRSVP={handleRSVP}
      onVote={handleVote}
      votedAwards={votedAwards}
      allGuests={allGuests}
    />
  );
}
