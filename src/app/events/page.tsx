'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Calendar, Users, Award, Eye, Plus, Edit, Trash2 } from 'lucide-react';

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
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  const handleEditEvent = async (eventData: EventData) => {
    try {
      const response = await fetch(`/api/events/${eventData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        await fetchEvents(); // Refresh the events list
        setEditingEvent(null);
      } else {
        console.error('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEvents(); // Refresh the events list
        setDeleteConfirm(null);
      } else {
        console.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <button
                    onClick={() => {
                      console.log('Edit button clicked for event:', event.id);
                      setEditingEvent(event);
                    }}
                    className="btn btn-outline px-3 py-2"
                    title="Edit Event"
                    style={{ minWidth: '40px', minHeight: '40px' }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      console.log('Delete button clicked for event:', event.id);
                      setDeleteConfirm(event.id);
                    }}
                    className="btn btn-outline px-3 py-2 text-red-600 hover:bg-red-50 hover:border-red-300"
                    title="Delete Event"
                    style={{ minWidth: '40px', minHeight: '40px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Event</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const updatedEvent = {
                ...editingEvent,
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                event_type: formData.get('event_type') as 'business' | 'personal',
                event_date: formData.get('event_date') as string,
                multi_store_enabled: formData.get('multi_store_enabled') === 'on'
              };
              handleEditEvent(updatedEvent);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Event Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingEvent.title}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingEvent.description}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Event Type</label>
                <select
                  name="event_type"
                  defaultValue={editingEvent.event_type}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="business">Business</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Event Date</label>
                <input
                  type="datetime-local"
                  name="event_date"
                  defaultValue={new Date(editingEvent.event_date).toISOString().slice(0, 16)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="multi_store_enabled"
                    defaultChecked={editingEvent.multi_store_enabled}
                    className="mr-2"
                  />
                  Enable Multi-Group Management
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Event</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this event? This action cannot be undone and will remove all associated guests and groups.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(deleteConfirm)}
                className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

