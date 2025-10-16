'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, X, Award, Users, Calendar } from 'lucide-react';
import { useEvent } from '@/context/EventContext';
import TemplateRSVP from '@/components/TemplateRSVP';

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
  event_date: string;
  template_theme: 'light' | 'dark' | 'love';
  logo_url?: string;
}

interface AwardData {
  id: string;
  title: string;
  description?: string;
}

export default function RSVPPage() {
  const params = useParams();
  const guestId = params?.guestId as string;
  const { setCurrentEvent, setGuests, setAwards: setContextAwards } = useEvent();
  
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [awards, setAwards] = useState<AwardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedAwards, setVotedAwards] = useState<string[]>([]);

  useEffect(() => {
    const fetchGuestData = async () => {
      if (!guestId) return;
      
      try {
        // Fetch guest details
        const guestResponse = await fetch(`/api/rsvp/${guestId}`);
        if (guestResponse.ok) {
          const guestData = await guestResponse.json();
          setGuest(guestData);
          setCurrentEvent({
            id: guestData.event_id,
            title: guestData.event_title,
            description: '',
            event_type: guestData.event_type,
            multi_store_enabled: guestData.multi_store_enabled,
            host_name: '',
            host_email: '',
            created_at: new Date().toISOString()
          });
        }

        // Fetch awards
        const awardsResponse = await fetch(`/api/events/${guest?.event_id}/awards`);
        if (awardsResponse.ok) {
          const awardsData = await awardsResponse.json();
          setAwards(awardsData);
          setContextAwards(awardsData);
        }
      } catch (error) {
        console.error('Error fetching guest data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuestData();
  }, [guestId, guest?.event_id, setCurrentEvent, setAwards]);

  const handleRSVP = async (response: 'yes' | 'no') => {
    try {
      const rsvpResponse = await fetch(`/api/rsvp/${guestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      });

      if (rsvpResponse.ok) {
        setGuest(prev => prev ? { ...prev, rsvp_status: response } : null);
      } else {
        const error = await rsvpResponse.json();
        alert(error.error || 'Failed to update RSVP');
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Failed to update RSVP');
    }
  };

  const handleVote = async (awardId: string, nomineeId: string) => {
    try {
      const voteResponse = await fetch(`/api/events/${guest?.event_id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          awardId,
          nomineeId,
          guestId: guest?.id,
        }),
      });

      if (voteResponse.ok) {
        setVotedAwards(prev => [...prev, awardId]);
      } else {
        const error = await voteResponse.json();
        alert(error.error || 'Failed to submit vote');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote');
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
    <TemplateRSVP
      guest={guest}
      awards={awards}
      onRSVP={handleRSVP}
      onVote={handleVote}
      votedAwards={votedAwards}
    />
  );
}