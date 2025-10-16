'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Building2, Heart, Plus, Users, Award } from 'lucide-react';
import TemplateSelector from '@/components/TemplateSelector';
import LogoUpload from '@/components/LogoUpload';
import ExcelUpload from '@/components/ExcelUpload';

interface Group {
  id: string;
  name: string;
}

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  guestId: string;
  groupId: string;
}

interface Award {
  id: string;
  title: string;
  description: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  // Event form data
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    eventType: 'personal' as 'business' | 'personal',
    multiStoreEnabled: false,
    eventDate: '',
    hostName: '',
    hostEmail: '',
    awardsEnabled: false,
    templateTheme: 'light' as 'light' | 'dark' | 'love',
    logoUrl: '',
  });

  // Groups, guests and awards
  const [groups, setGroups] = useState<Group[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [groupName, setGroupName] = useState('');

  const handleEventDataChange = (field: string, value: any) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addGroup = () => {
    if (groupName.trim()) {
      const newGroup: Group = {
        id: Date.now().toString(),
        name: groupName.trim()
      };
      setGroups([...groups, newGroup]);
      setGroupName('');
    }
  };

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
    setGuests(guests.filter(g => g.groupId !== groupId));
  };

  const addGuest = (groupId: string, firstName: string = '', lastName: string = '', guestId: string = '') => {
    const newGuest: Guest = {
      id: Date.now().toString() + Math.random(),
      firstName,
      lastName,
      guestId,
      groupId: groupId
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
    if (!eventData.title || !eventData.eventDate || !eventData.hostName || !eventData.hostEmail) {
      alert('Please fill in all required fields including event date');
      return;
    }

    setLoading(true);
    try {
      // Create event
      const eventResponse = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          hostId: session.user.id,
          hostName: session.user.name,
          hostEmail: session.user.email
        })
      });
      
      if (!eventResponse.ok) {
        const errorResult = await eventResponse.json();
        throw new Error(errorResult.error || 'Failed to create event');
      }
      
      const eventResult = await eventResponse.json();
      const newEventId = eventResult.eventId;

      // Add groups
      for (const group of groups) {
        await fetch(`/api/events/${newEventId}/groups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: group.name
          })
        });
      }

      // Wait a moment for groups to be created, then add guests
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch created groups to get their database IDs
      const groupsResponse = await fetch(`/api/events/${newEventId}/groups`);
      const createdGroups = await groupsResponse.json();

      // Create a mapping from temporary IDs to database IDs
      const groupIdMap: { [key: string]: string } = {};
      groups.forEach((group, index) => {
        if (createdGroups[index]) {
          groupIdMap[group.id] = createdGroups[index].id;
        }
      });

      // Add guests
      for (const guest of guests) {
        if (guest.firstName) {
          await fetch(`/api/events/${newEventId}/guests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: guest.firstName,
              lastName: guest.lastName || '',
              guestId: guest.guestId || '',
              groupId: groupIdMap[guest.groupId] || null
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
            <div className="form-group">
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="multiStore"
                  checked={eventData.multiStoreEnabled}
                  onChange={(e) => handleEventDataChange('multiStoreEnabled', e.target.checked)}
                />
                <label htmlFor="multiStore">
                  Enable multi-group functionality (stores, departments, states, etc.)
                </label>
              </div>
              
              {eventData.multiStoreEnabled && (
                <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e1e5e9', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Create Groups</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    Add groups like "Store 1", "Marketing Department", "California", etc.
                  </p>
                  
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      className="form-input"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g., Store 1, Marketing, California"
                      onKeyPress={(e) => e.key === 'Enter' && addGroup()}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={addGroup}
                    >
                      <Plus size={16} />
                      Add Group
                    </button>
                  </div>
                  
                  {groups.length > 0 && (
                    <div className="grid grid-3" style={{ gap: '0.5rem' }}>
                      {groups.map((group) => (
                        <div key={group.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{group.name}</span>
                          <button
                            type="button"
                            onClick={() => removeGroup(group.id)}
                            className="text-red-500 hover:text-red-700"
                            style={{ fontSize: '0.8rem' }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Event Date *</label>
            <input
              type="date"
              className="form-input"
              value={eventData.eventDate}
              onChange={(e) => handleEventDataChange('eventDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
              This date will be visible to all invited guests
            </p>
          </div>

          <TemplateSelector
            selectedTemplate={eventData.templateTheme}
            onTemplateSelect={(template) => handleEventDataChange('templateTheme', template)}
          />

          <LogoUpload
            onLogoUploaded={(logoUrl) => handleEventDataChange('logoUrl', logoUrl)}
            currentLogo={eventData.logoUrl}
          />

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
          </div>

          {eventData.multiStoreEnabled && groups.length > 0 ? (
            <div>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                Add guests to each group. Click the "+" button in each column to add a new guest, or upload an Excel file.
              </p>
              
              {/* Excel Upload for Multi-Group */}
              <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #e1e5e9', borderRadius: '8px', background: '#f8f9fa' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} />
                  Bulk Upload for All Groups
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  Upload an Excel file with an additional "Group" column to automatically assign guests to groups.
                </p>
                <ExcelUpload 
                  onGuestsImported={(importedGuests) => {
                    // For multi-group, we'll need to handle group assignment
                    // This is a simplified version - in a full implementation you'd want to parse group names
                    importedGuests.forEach(guest => {
                      if (groups.length > 0) {
                        addGuest(groups[0].id, guest.firstName, guest.lastName, guest.guestId);
                      }
                    });
                  }}
                  isMultiGroup={true}
                />
              </div>
              
              <div className="overflow-x-auto">
                <div className="grid" style={{ 
                  gridTemplateColumns: `repeat(${groups.length}, 1fr)`,
                  gap: '1rem',
                  minWidth: `${groups.length * 250}px`
                }}>
                  {groups.map((group) => {
                    const groupGuests = guests.filter(g => g.groupId === group.id);
                    return (
                      <div key={group.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-center w-full">{group.name}</h4>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => addGuest(group.id)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {groupGuests.map((guest, guestIndex) => {
                            const globalIndex = guests.findIndex(g => g.id === guest.id);
                            return (
                              <div key={guest.id} className="p-2 bg-gray-50 rounded border">
                                <div className="grid grid-1 gap-2">
                                  <input
                                    type="text"
                                    className="form-input"
                                    style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                    value={guest.firstName}
                                    onChange={(e) => updateGuest(globalIndex, 'firstName', e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addGuest(group.id);
                                      }
                                    }}
                                    placeholder="First Name *"
                                  />
                                  <input
                                    type="text"
                                    className="form-input"
                                    style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                    value={guest.lastName}
                                    onChange={(e) => updateGuest(globalIndex, 'lastName', e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addGuest(group.id);
                                      }
                                    }}
                                    placeholder="Last Name (optional)"
                                  />
                                  <input
                                    type="text"
                                    className="form-input"
                                    style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                    value={guest.guestId}
                                    onChange={(e) => updateGuest(globalIndex, 'guestId', e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addGuest(group.id);
                                      }
                                    }}
                                    placeholder="Guest ID (optional)"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeGuest(globalIndex)}
                                  className="text-red-500 hover:text-red-700 mt-1"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  Remove
                                </button>
                              </div>
                            );
                          })}
                          
                          {groupGuests.length === 0 && (
                            <div className="text-center text-gray-500 text-sm py-4">
                              Click + to add guests
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Excel Upload for Single Group */}
              <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #e1e5e9', borderRadius: '8px', background: '#f8f9fa' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} />
                  Bulk Upload Guests
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  Upload an Excel file to add multiple guests at once.
                </p>
                <ExcelUpload 
                  onGuestsImported={(importedGuests) => {
                    importedGuests.forEach(guest => {
                      addGuest('default', guest.firstName, guest.lastName, guest.guestId);
                    });
                  }}
                />
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <button className="btn btn-secondary" onClick={() => addGuest('default')}>
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
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addGuest('default');
                          }
                        }}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="form-label">Last Name (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={guest.lastName}
                        onChange={(e) => updateGuest(index, 'lastName', e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addGuest('default');
                          }
                        }}
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className="form-label">Guest ID (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={guest.guestId}
                        onChange={(e) => updateGuest(index, 'guestId', e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addGuest('default');
                          }
                        }}
                        placeholder="Unique ID for easy RSVP access"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {guests.length === 0 && (
                <div className="text-center" style={{ padding: '2rem', color: '#666' }}>
                  <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>No guests added yet. Click "Add Guest" to get started.</p>
                </div>
              )}
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
