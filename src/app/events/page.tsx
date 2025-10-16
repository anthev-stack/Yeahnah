'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Calendar, Users, Award, Eye, Plus } from 'lucide-react';

interface EventData {
  id: string;
  title: string;
  description: string;
  event_type: 'business' | 'personal';
  event_date: string;
  multi_store_enabled: boolean;
  created_at: string;
}

export default function EventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [session]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="text-center">
        <div className="card">
          <h2>Sign In Required</h2>
          <p>Please sign in to view your events.</p>
          <Link href="/auth/signin" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center">
        <div className="card">
          <div className="spinner"></div>
          <p>Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Events</h1>
        <Link href="/create-event" className="btn btn-primary">
          <Plus size={20} />
          Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card text-center">
          <Calendar size={64} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Events Yet</h2>
          <p className="text-gray-600 mb-4">
            Create your first event to get started with RSVP management.
          </p>
          <Link href="/create-event" className="btn btn-primary">
            <Plus size={20} />
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-2 gap-6">
          {events.map((event) => {
            const eventDate = new Date(event.event_date);
            const isUpcoming = eventDate >= new Date();
            
            return (
              <div key={event.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} />
                      <span className="text-sm text-gray-600">
                        {eventDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isUpcoming 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isUpcoming ? 'Upcoming' : 'Past'}
                  </span>
                </div>

                {event.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                )}

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span className="capitalize">{event.event_type}</span>
                  </div>
                  {event.multi_store_enabled && (
                    <div className="flex items-center gap-1">
                      <Award size={16} />
                      <span>Multi-Group</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link 
                    href={`/event/${event.id}/dashboard`} 
                    className="btn btn-secondary flex-1"
                  >
                    <Eye size={16} />
                    View Dashboard
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

