'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, X, Award, Users, Calendar } from 'lucide-react';
import { useEvent } from '@/context/EventContext';

interface GuestData {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  store_department?: string;
  rsvp_status: 'pending' | 'yes' | 'no';
  rsvp_date?: string;
  event_title: string;
  event_type: 'business' | 'personal';
  multi_store_enabled: boolean;
}

interface AwardData {
  id: string;
  title: string;
  description?: string;
}

export default function RSVPPage() {
  const params = useParams();
  const guestId = params?.guestId as string;
  const { updateGuestRSVP } = useEvent();
  
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [awards, setAwards] = useState<AwardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [votingMode, setVotingMode] = useState(false);
  const [votes, setVotes] = useState<{ [awardId: string]: string }>({});

  useEffect(() => {
    const fetchGuestData = async () => {
      if (!guestId) return;
      
      try {
        const response = await fetch(`/api/rsvp/${guestId}`);
        const guestData = await response.json();
        
        if (!response.ok) {
          throw new Error(guestData.error || 'Failed to fetch guest data');
        }
        
        setGuest(guestData);
        
        // Fetch awards if they exist
        if (guestData.rsvp_status === 'yes') {
          const awardsResponse = await fetch(`/api/events/${guestData.event_id}/awards`);
          const awardsData = await awardsResponse.json();
          setAwards(awardsData);
        }
        
        setRsvpSubmitted(guestData.rsvp_status !== 'pending');
      } catch (error) {
        console.error('Error fetching guest data:', error);
        alert('Guest not found or invalid ID');
      } finally {
        setLoading(false);
      }
    };

    fetchGuestData();
  }, [guestId]);

  const submitRSVP = async (response: 'yes' | 'no') => {
    if (!guestId) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/rsvp/${guestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      });
      
      if (!res.ok) {
        throw new Error('Failed to submit RSVP');
      }
      
      setGuest(prev => prev ? { ...prev, rsvp_status: response, rsvp_date: new Date().toISOString() } : null);
      updateGuestRSVP(guestId, response);
      setRsvpSubmitted(true);
      
      // If they said yes, fetch awards
      if (response === 'yes' && guest?.event_id) {
        const awardsResponse = await fetch(`/api/events/${guest.event_id}/awards`);
        const awardsData = await awardsResponse.json();
        setAwards(awardsData);
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('Error submitting RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitVote = async (awardId: string, nomineeId: string) => {
    if (!guest?.event_id || !guest.id) return;
    
    try {
      const res = await fetch(`/api/events/${guest.event_id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awardId,
          voterId: guest.id,
          nomineeId
        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to submit vote');
      }
      
      setVotes(prev => ({ ...prev, [awardId]: nomineeId }));
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Error submitting vote. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="card text-center">
        <div className="spinner" style={{ margin: '2rem auto' }}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="card text-center">
        <X size={48} color="#ff416c" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '1rem' }}>Guest Not Found</h2>
        <p>The guest ID you provided is invalid or the event has been removed.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header text-center">
        <Calendar size={48} color="#667eea" style={{ marginBottom: '1rem' }} />
        <h1 className="card-title">{guest.event_title}</h1>
        <p className="card-subtitle">
          Hi {guest.first_name} {guest.last_name}!
        </p>
        {guest.store_department && (
          <p className="card-subtitle">
            Department: {guest.store_department}
          </p>
        )}
      </div>

      {!rsvpSubmitted ? (
        <div>
          <div className="text-center mb-4">
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
              Will you be attending this {guest.event_type} event?
            </p>
          </div>

          <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
            <button
              className="btn btn-success btn-large"
              onClick={() => submitRSVP('yes')}
              disabled={submitting}
              style={{ padding: '2rem', fontSize: '1.2rem' }}
            >
              <Check size={32} />
              Yeah!
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'normal', marginTop: '0.5rem' }}>
                I'll be there
              </span>
            </button>

            <button
              className="btn btn-danger btn-large"
              onClick={() => submitRSVP('no')}
              disabled={submitting}
              style={{ padding: '2rem', fontSize: '1.2rem' }}
            >
              <X size={32} />
              Nah
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'normal', marginTop: '0.5rem' }}>
                Can't make it
              </span>
            </button>
          </div>

          {submitting && (
            <div className="text-center">
              <div className="spinner" style={{ margin: '0 auto' }}></div>
              <p>Submitting your response...</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="text-center mb-4">
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              background: guest.rsvp_status === 'yes' ? '#d4edda' : '#f8d7da',
              color: guest.rsvp_status === 'yes' ? '#155724' : '#721c24'
            }}>
              <h3>
                {guest.rsvp_status === 'yes' ? (
                  <>
                    <Check size={24} style={{ marginRight: '0.5rem', display: 'inline' }} />
                    You're coming! 🎉
                  </>
                ) : (
                  <>
                    <X size={24} style={{ marginRight: '0.5rem', display: 'inline' }} />
                    You can't make it
                  </>
                )}
              </h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Response submitted on {new Date(guest.rsvp_date || '').toLocaleDateString()}
              </p>
            </div>
          </div>

          {guest.rsvp_status === 'yes' && awards.length > 0 && (
            <div>
              <div className="text-center mb-4">
                <Award size={32} color="#667eea" style={{ marginBottom: '1rem' }} />
                <h3>Award Voting</h3>
                <p>Vote for your colleagues and friends!</p>
              </div>

              {!votingMode ? (
                <div className="text-center">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setVotingMode(true)}
                  >
                    <Award size={20} />
                    Start Voting
                  </button>
                </div>
              ) : (
                <div>
                  {awards.map((award) => (
                    <div key={award.id} className="card" style={{ marginBottom: '1rem' }}>
                      <h4 style={{ marginBottom: '0.5rem' }}>{award.title}</h4>
                      {award.description && (
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                          {award.description}
                        </p>
                      )}
                      
                      <div className="form-group">
                        <label className="form-label">Your Vote</label>
                        <select
                          className="form-select"
                          value={votes[award.id] || ''}
                          onChange={(e) => setVotes(prev => ({ ...prev, [award.id]: e.target.value }))}
                        >
                          <option value="">Select a nominee...</option>
                          {/* In a real app, you'd fetch the list of other guests */}
                          <option value="nominee1">John Smith</option>
                          <option value="nominee2">Jane Doe</option>
                          <option value="nominee3">Mike Johnson</option>
                        </select>
                      </div>
                      
                      {votes[award.id] && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => submitVote(award.id, votes[award.id])}
                        >
                          Submit Vote
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <div className="text-center">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setVotingMode(false)}
                    >
                      Finish Voting
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {guest.rsvp_status === 'yes' && awards.length === 0 && (
            <div className="text-center">
              <Award size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p style={{ color: '#666' }}>
                No awards to vote for in this event.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
