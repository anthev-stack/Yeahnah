'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Heart, Plus, Users, Award } from 'lucide-react';

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  guestId: string;
  storeDepartment: string;
}

interface Award {
  id: string;
  title: string;
  description: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Event form data
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    eventType: 'personal' as 'business' | 'personal',
    multiStoreEnabled: false,
    hostName: '',
    hostEmail: '',
    awardsEnabled: false,
  });

  // Guests and awards
  const [guests, setGuests] = useState<Guest[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);

  const handleEventDataChange = (field: string, value: any) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addGuest = () => {
    const newGuest: Guest = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      email: '',
      guestId: '',
      storeDepartment: ''
    };
    setGuests([...guests, newGuest]);
  };

  const updateGuest = (index: number, field: string, value: string) => {
    const updatedGuests = [...guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setGuests(updatedGuests);
  };

  const removeGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const addAward = () => {
    const newAward: Award = {
      id: Date.now().toString(),
      title: '',
      description: ''
    };
    setAwards([...awards, newAward]);
  };

  const updateAward = (index: number, field: string, value: string) => {
    const updatedAwards = [...awards];
    updatedAwards[index] = { ...updatedAwards[index], [field]: value };
    setAwards(updatedAwards);
  };

  const removeAward = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
  };

  const createEvent = async () => {
    if (!eventData.title || !eventData.hostName || !eventData.hostEmail) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Create event
      const eventResponse = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      const eventResult = await eventResponse.json();
      const newEventId = eventResult.eventId;

      // Add guests
      for (const guest of guests) {
        if (guest.firstName && guest.lastName) {
          await fetch(`/api/events/${newEventId}/guests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: guest.firstName,
              lastName: guest.lastName,
              email: guest.email,
              guestId: guest.guestId,
              storeDepartment: guest.storeDepartment
            })
          });
        }
      }

      // Add awards
      for (const award of awards) {
        if (award.title) {
          await fetch(`/api/events/${newEventId}/awards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: award.title,
              description: award.description
            })
          });
        }
      }

      router.push(`/event/${newEventId}/dashboard`);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!eventData.title || !eventData.hostName || !eventData.hostEmail) {
        alert('Please fill in all required fields');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Create New Event</h1>
        <p className="card-subtitle">
          Step {currentStep} of 3: {
            currentStep === 1 ? 'Event Details' :
            currentStep === 2 ? 'Add Guests' : 'Add Awards'
          }
        </p>
      </div>

      {/* Step 1: Event Details */}
      {currentStep === 1 && (
        <div>
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              className="form-input"
              value={eventData.title}
              onChange={(e) => handleEventDataChange('title', e.target.value)}
              placeholder="e.g., Christmas Party 2024"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Description</label>
            <textarea
              className="form-textarea"
              value={eventData.description}
              onChange={(e) => handleEventDataChange('description', e.target.value)}
              placeholder="Tell your guests about the event..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Type *</label>
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div 
                className={`card ${eventData.eventType === 'business' ? 'selected' : ''}`}
                style={{ 
                  cursor: 'pointer', 
                  border: eventData.eventType === 'business' ? '2px solid #667eea' : '2px solid #e1e5e9',
                  background: eventData.eventType === 'business' ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                }}
                onClick={() => handleEventDataChange('eventType', 'business')}
              >
                <Building2 size={32} color="#667eea" style={{ marginBottom: '0.5rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Business Event</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  Work functions, meetings, company parties
                </p>
              </div>
              <div 
                className={`card ${eventData.eventType === 'personal' ? 'selected' : ''}`}
                style={{ 
                  cursor: 'pointer', 
                  border: eventData.eventType === 'personal' ? '2px solid #764ba2' : '2px solid #e1e5e9',
                  background: eventData.eventType === 'personal' ? 'rgba(118, 75, 162, 0.1)' : 'transparent'
                }}
                onClick={() => handleEventDataChange('eventType', 'personal')}
              >
                <Heart size={32} color="#764ba2" style={{ marginBottom: '0.5rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Personal Event</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  Birthdays, weddings, casual gatherings
                </p>
              </div>
            </div>
          </div>

          {eventData.eventType === 'business' && (
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="multiStore"
                checked={eventData.multiStoreEnabled}
                onChange={(e) => handleEventDataChange('multiStoreEnabled', e.target.checked)}
              />
              <label htmlFor="multiStore">
                Enable multi-store/department functionality
              </label>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Host Name *</label>
            <input
              type="text"
              className="form-input"
              value={eventData.hostName}
              onChange={(e) => handleEventDataChange('hostName', e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Host Email *</label>
            <input
              type="email"
              className="form-input"
              value={eventData.hostEmail}
              onChange={(e) => handleEventDataChange('hostEmail', e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>

          <div className="form-checkbox">
            <input
              type="checkbox"
              id="awardsEnabled"
              checked={eventData.awardsEnabled}
              onChange={(e) => handleEventDataChange('awardsEnabled', e.target.checked)}
            />
            <label htmlFor="awardsEnabled">
              Enable award voting system
            </label>
          </div>

          <div className="flex justify-end">
            <button className="btn btn-primary" onClick={nextStep}>
              Next: Add Guests
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Add Guests */}
      {currentStep === 2 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3>Add Guests</h3>
            <button className="btn btn-secondary" onClick={addGuest}>
              <Plus size={16} />
              Add Guest
            </button>
          </div>

          {guests.map((guest, index) => (
            <div key={guest.id} className="card" style={{ marginBottom: '1rem' }}>
              <div className="flex justify-between items-center mb-2">
                <h4>Guest {index + 1}</h4>
                <button 
                  className="btn btn-danger"
                  onClick={() => removeGuest(index)}
                  style={{ padding: '0.5rem' }}
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div>
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={guest.firstName}
                    onChange={(e) => updateGuest(index, 'firstName', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={guest.lastName}
                    onChange={(e) => updateGuest(index, 'lastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={guest.email}
                    onChange={(e) => updateGuest(index, 'email', e.target.value)}
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div>
                  <label className="form-label">Guest ID (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={guest.guestId}
                    onChange={(e) => updateGuest(index, 'guestId', e.target.value)}
                    placeholder="Unique ID for easy RSVP access"
                  />
                </div>
              </div>

              {eventData.multiStoreEnabled && (
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Store/Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={guest.storeDepartment}
                    onChange={(e) => updateGuest(index, 'storeDepartment', e.target.value)}
                    placeholder="e.g., Store A, Marketing, Sales"
                  />
                </div>
              )}
            </div>
          ))}

          {guests.length === 0 && (
            <div className="text-center" style={{ padding: '2rem', color: '#666' }}>
              <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No guests added yet. Click "Add Guest" to get started.</p>
            </div>
          )}

          <div className="flex justify-between">
            <button className="btn btn-secondary" onClick={prevStep}>
              Back: Event Details
            </button>
            <button className="btn btn-primary" onClick={nextStep}>
              Next: Add Awards
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Add Awards */}
      {currentStep === 3 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3>Add Awards</h3>
            {eventData.awardsEnabled && (
              <button className="btn btn-secondary" onClick={addAward}>
                <Award size={16} />
                Add Award
              </button>
            )}
          </div>

          {!eventData.awardsEnabled ? (
            <div className="text-center" style={{ padding: '2rem', color: '#666' }}>
              <Award size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Awards are disabled for this event.</p>
              <p style={{ fontSize: '0.9rem' }}>
                Go back to Step 1 to enable the award voting system.
              </p>
            </div>
          ) : (
            <>
              {awards.map((award, index) => (
                <div key={award.id} className="card" style={{ marginBottom: '1rem' }}>
                  <div className="flex justify-between items-center mb-2">
                    <h4>Award {index + 1}</h4>
                    <button 
                      className="btn btn-danger"
                      onClick={() => removeAward(index)}
                      style={{ padding: '0.5rem' }}
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div>
                    <label className="form-label">Award Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={award.title}
                      onChange={(e) => updateAward(index, 'title', e.target.value)}
                      placeholder="e.g., Best Team Player"
                    />
                  </div>
                  
                  <div style={{ marginTop: '1rem' }}>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      value={award.description}
                      onChange={(e) => updateAward(index, 'description', e.target.value)}
                      placeholder="Describe what this award is for..."
                      style={{ minHeight: '80px' }}
                    />
                  </div>
                </div>
              ))}

              {awards.length === 0 && (
                <div className="text-center" style={{ padding: '2rem', color: '#666' }}>
                  <Award size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>No awards added yet. Click "Add Award" to create award categories.</p>
                  <p style={{ fontSize: '0.9rem' }}>
                    Awards are optional - you can skip this step if you don't want voting.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex justify-between">
            <button className="btn btn-secondary" onClick={prevStep}>
              Back: Add Guests
            </button>
            <button 
              className="btn btn-primary btn-large" 
              onClick={createEvent}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating Event...
                </>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
