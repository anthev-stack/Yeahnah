'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Users, Award, TrendingUp, Filter, Download, Share2, Plus, Copy, Check, Link2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEvent } from '@/context/EventContext';

interface EventData {
  id: string;
  title: string;
  description: string;
  event_type: 'business' | 'personal';
  multi_store_enabled: boolean;
  host_name: string;
  host_email: string;
  created_at: string;
}

interface GuestData {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  store_department?: string;
  rsvp_status: 'pending' | 'yes' | 'no';
  rsvp_date?: string;
  guest_id?: string;
}

interface AwardData {
  id: string;
  title: string;
  description?: string;
}

interface VotingResult {
  id: string;
  first_name: string;
  last_name: string;
  store_department?: string;
  award_title: string;
  vote_count: number;
}

interface DepartmentColumnsViewProps {
  guests: GuestData[];
  selectedStore: string;
  onStoreChange: (store: string) => void;
}

const DepartmentColumnsView: React.FC<DepartmentColumnsViewProps> = ({ guests, selectedStore, onStoreChange }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Group guests by department
  const departments = guests.reduce((acc, guest) => {
    const dept = guest.store_department || 'No Department';
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(guest);
    return acc;
  }, {} as Record<string, GuestData[]>);

  const departmentNames = Object.keys(departments);

  // Check scroll state
  const checkScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollState);
      window.addEventListener('resize', checkScrollState);
      return () => {
        container.removeEventListener('scroll', checkScrollState);
        window.removeEventListener('resize', checkScrollState);
      };
    }
  }, [guests]);

  const getDepartmentStats = (deptGuests: GuestData[]) => {
    const total = deptGuests.length;
    const yes = deptGuests.filter(g => g.rsvp_status === 'yes').length;
    const no = deptGuests.filter(g => g.rsvp_status === 'no').length;
    const pending = deptGuests.filter(g => g.rsvp_status === 'pending').length;
    return { total, yes, no, pending };
  };

  const showScrollControls = departmentNames.length > 3;

  return (
    <div>
      {/* Scroll Controls */}
      {showScrollControls && (
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`btn btn-secondary ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ padding: '0.5rem', minWidth: '40px' }}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-2 flex-wrap justify-center">
            {departmentNames.map(dept => (
              <button
                key={dept}
                onClick={() => onStoreChange(dept)}
                className={`btn ${selectedStore === dept ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                {dept} ({departments[dept].length})
              </button>
            ))}
            <button
              onClick={() => onStoreChange('all')}
              className={`btn ${selectedStore === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              All ({guests.length})
            </button>
          </div>

          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`btn btn-secondary ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ padding: '0.5rem', minWidth: '40px' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Department Columns */}
      <div
        ref={scrollContainerRef}
        className="department-columns-container"
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin'
        }}
      >
        {departmentNames.map(dept => {
          const deptGuests = departments[dept];
          const stats = getDepartmentStats(deptGuests);
          
          return (
            <div
              key={dept}
              className="department-column"
              style={{
                minWidth: '300px',
                maxWidth: '350px',
                flex: '1 1 300px',
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '1rem',
                border: selectedStore === dept ? '2px solid #667eea' : '1px solid #e9ecef'
              }}
            >
              {/* Department Header */}
              <div className="flex justify-between items-center mb-3">
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                  {dept}
                </h4>
                <div className="flex gap-1">
                  <span style={{ fontSize: '0.8rem', color: '#28a745' }}>{stats.yes}</span>
                  <span style={{ fontSize: '0.8rem', color: '#dc3545' }}>{stats.no}</span>
                  <span style={{ fontSize: '0.8rem', color: '#ffc107' }}>{stats.pending}</span>
                </div>
              </div>

              {/* Department Stats */}
              <div className="grid grid-3 gap-2 mb-3" style={{ fontSize: '0.8rem' }}>
                <div className="text-center">
                  <div style={{ fontWeight: 'bold', color: '#28a745' }}>{stats.yes}</div>
                  <div style={{ color: '#666' }}>Coming</div>
                </div>
                <div className="text-center">
                  <div style={{ fontWeight: 'bold', color: '#dc3545' }}>{stats.no}</div>
                  <div style={{ color: '#666' }}>Not Coming</div>
                </div>
                <div className="text-center">
                  <div style={{ fontWeight: 'bold', color: '#ffc107' }}>{stats.pending}</div>
                  <div style={{ color: '#666' }}>Pending</div>
                </div>
              </div>

              {/* Department Guests */}
              <div className="department-guests-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {deptGuests.map(guest => (
                  <div
                    key={guest.id}
                    className="department-guest-item"
                    style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                          {guest.first_name} {guest.last_name}
                        </div>
                        {guest.email && (
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>
                            {guest.email}
                          </div>
                        )}
                        {guest.guest_id && (
                          <div style={{ fontSize: '0.7rem', color: '#888' }}>
                            ID: {guest.guest_id}
                          </div>
                        )}
                      </div>
                      <span className={`status-badge status-${guest.rsvp_status}`} style={{ fontSize: '0.8rem' }}>
                        {guest.rsvp_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CSS for smooth scrolling */}
      <style jsx>{`
        .department-columns-container::-webkit-scrollbar {
          height: 8px;
        }
        .department-columns-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .department-columns-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        .department-columns-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default function EventDashboardPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { setCurrentEvent, setGuests: setContextGuests, setAwards: setContextAwards } = useEvent();
  
  const [event, setEvent] = useState<EventData | null>(null);
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [awards, setAwards] = useState<AwardData[]>([]);
  const [results, setResults] = useState<VotingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rsvp' | 'awards'>('rsvp');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedAward, setSelectedAward] = useState<string>('all');
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());
  const [bulkCopied, setBulkCopied] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      try {
        // Fetch event details
        const eventResponse = await fetch(`/api/events?eventId=${eventId}`);
        const eventData = await eventResponse.json();
        setEvent(eventData);
        setCurrentEvent(eventData);

        // Fetch guests
        const guestsResponse = await fetch(`/api/events/${eventId}/guests`);
        const guestsData = await guestsResponse.json();
        setGuests(guestsData);
        setContextGuests(guestsData);

        // Fetch awards
        const awardsResponse = await fetch(`/api/events/${eventId}/awards`);
        const awardsData = await awardsResponse.json();
        setAwards(awardsData);
        setContextAwards(awardsData);

        // Fetch results if there are awards
        if (awardsData.length > 0) {
          const resultsResponse = await fetch(`/api/events/${eventId}/results`);
          setResults(await resultsResponse.json());
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
        alert('Error loading event data');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, setCurrentEvent, setGuests, setAwards]);

  const getUniqueStores = () => {
    if (!guests || !Array.isArray(guests)) return [];
    const stores = guests
      .map(g => g.store_department)
      .filter((store, index, arr) => store && arr.indexOf(store) === index);
    return stores;
  };

  const getRSVPStats = () => {
    if (!guests || !Array.isArray(guests)) {
      return { total: 0, yes: 0, no: 0, pending: 0 };
    }
    const total = guests.length;
    const yes = guests.filter(g => g.rsvp_status === 'yes').length;
    const no = guests.filter(g => g.rsvp_status === 'no').length;
    const pending = guests.filter(g => g.rsvp_status === 'pending').length;
    
    return { total, yes, no, pending };
  };

  const getFilteredGuests = () => {
    if (!guests || !Array.isArray(guests)) return [];
    let filtered = guests;
    
    if (selectedStore !== 'all') {
      filtered = filtered.filter(g => g.store_department === selectedStore);
    }
    
    return filtered;
  };

  const getFilteredResults = () => {
    if (!results || !Array.isArray(results)) return [];
    let filtered = results;
    
    if (selectedAward !== 'all') {
      filtered = filtered.filter(r => r.id === selectedAward);
    }
    
    if (selectedStore !== 'all') {
      filtered = filtered.filter(r => r.store_department === selectedStore);
    }
    
    return filtered.sort((a, b) => b.vote_count - a.vote_count);
  };

  const getEventInviteLink = () => {
    return `${window.location.origin}/events/${eventId}/rsvp`;
  };

  const copyToClipboard = async (text: string, guestId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      
      if (guestId) {
        setCopiedLinks(prev => new Set([...prev, guestId]));
        setTimeout(() => {
          setCopiedLinks(prev => {
            const newSet = new Set(prev);
            newSet.delete(guestId);
            return newSet;
          });
        }, 2000);
      } else {
        setBulkCopied(true);
        setTimeout(() => setBulkCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };


  const exportToCSV = () => {
    const csvData = guests.map(g => ({
      'First Name': g.first_name,
      'Last Name': g.last_name,
      'Email': g.email || '',
      'Store/Department': g.store_department || '',
      'RSVP Status': g.rsvp_status,
      'RSVP Date': g.rsvp_date || '',
      'Guest ID': g.guest_id || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.title || 'event'}_guests.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="card text-center">
        <div className="spinner" style={{ margin: '2rem auto' }}></div>
        <p>Loading event dashboard...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="card text-center">
        <h2>Event Not Found</h2>
        <p>The event you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const stats = getRSVPStats();
  const filteredGuests = getFilteredGuests();
  const filteredResults = getFilteredResults();

  return (
    <div>
      {/* Event Header */}
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="card-title">{event.title}</h1>
            <p className="card-subtitle">
              {event.event_type === 'business' ? 'Business Event' : 'Personal Event'} • 
              Hosted by {event.host_name}
            </p>
            {event.description && (
              <p style={{ marginTop: '1rem', color: '#666' }}>{event.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={exportToCSV}>
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* RSVP Stats */}
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          <div className="text-center">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
              {stats.total}
            </div>
            <div style={{ color: '#666' }}>Total Guests</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {stats.yes}
            </div>
            <div style={{ color: '#666' }}>Coming</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
              {stats.no}
            </div>
            <div style={{ color: '#666' }}>Not Coming</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
              {stats.pending}
            </div>
            <div style={{ color: '#666' }}>Pending</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          <button
            className={`btn ${activeTab === 'rsvp' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('rsvp')}
          >
            <Users size={16} />
            RSVP Management
          </button>
          {awards.length > 0 && (
            <button
              className={`btn ${activeTab === 'awards' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('awards')}
            >
              <Award size={16} />
              Award Results
            </button>
          )}
        </div>
      </div>

      {/* RSVP Tab */}
      {activeTab === 'rsvp' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>Guest List</h3>
            <div className="flex gap-2">
              {event.multi_store_enabled && (
                <select
                  className="form-select"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="all">All Stores/Departments</option>
                  {getUniqueStores().map(store => (
                    <option key={store} value={store}>{store}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Department Columns Layout for Multi-Store Events */}
          {(() => {
            console.log('Event data:', { 
              multi_store_enabled: event.multi_store_enabled, 
              event_type: event.event_type,
              guests_count: guests.length,
              departments: guests.map(g => g.store_department).filter(Boolean)
            });
            return null;
          })()}
          {(event.multi_store_enabled || getUniqueStores().length > 1) ? (
            <DepartmentColumnsView 
              guests={guests}
              selectedStore={selectedStore}
              onStoreChange={setSelectedStore}
            />
          ) : (
            /* Regular List View for Single-Store Events */
            <div className="list">
              {filteredGuests.map((guest) => (
                <div key={guest.id} className="list-item">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4>{guest.first_name} {guest.last_name}</h4>
                      {guest.email && <p style={{ fontSize: '0.9rem', color: '#666' }}>{guest.email}</p>}
                      {guest.store_department && (
                        <p style={{ fontSize: '0.8rem', color: '#888' }}>
                          {guest.store_department}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`status-badge status-${guest.rsvp_status}`}>
                        {guest.rsvp_status}
                      </span>
                      {guest.guest_id && (
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>
                          ID: {guest.guest_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <div className="flex justify-between items-center mb-4">
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link2 size={20} />
                Event Invite Link
              </h4>
              <div className="flex gap-2">
                <button
                  className={`btn ${bulkCopied ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => copyToClipboard(getEventInviteLink())}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                  {bulkCopied ? (
                    <>
                      <Check size={16} style={{ marginRight: '0.5rem' }} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} style={{ marginRight: '0.5rem' }} />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="card" style={{ padding: '1.5rem' }}>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={getEventInviteLink()}
                    readOnly
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.9rem' }}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
                <button
                  className={`btn ${bulkCopied ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => copyToClipboard(getEventInviteLink())}
                  style={{ padding: '0.75rem', minWidth: '50px' }}
                  title={bulkCopied ? 'Copied!' : 'Copy link'}
                >
                  {bulkCopied ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-green)' }}>
                💡 How It Works:
              </h5>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                <li>Share this single link with all your guests</li>
                <li>Guests enter their name or guest ID to find their invitation</li>
                <li>No need to manage individual links for each guest</li>
                <li>Guests can RSVP without creating an account</li>
                <li>Perfect for email blasts, social media, or QR codes</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Awards Tab */}
      {activeTab === 'awards' && awards.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>Award Results</h3>
            <div className="flex gap-2">
              <select
                className="form-select"
                value={selectedAward}
                onChange={(e) => setSelectedAward(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">All Awards</option>
                {awards.map(award => (
                  <option key={award.id} value={award.id}>{award.title}</option>
                ))}
              </select>
              {event.multi_store_enabled && (
                <select
                  className="form-select"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="all">All Stores/Departments</option>
                  {getUniqueStores().map(store => (
                    <option key={store} value={store}>{store}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {filteredResults.length > 0 ? (
            <div className="list">
              {filteredResults.slice(0, 10).map((result, index) => (
                <div key={`${result.id}-${result.award_title}`} className="list-item">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                                   index === 1 ? 'linear-gradient(135deg, #C0C0C0, #A8A8A8)' :
                                   index === 2 ? 'linear-gradient(135deg, #CD7F32, #B87333)' :
                                   'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <h4>{result.first_name} {result.last_name}</h4>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                          {result.award_title}
                          {result.store_department && ` • ${result.store_department}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                        {result.vote_count}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        vote{result.vote_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center" style={{ padding: '2rem', color: '#666' }}>
              <Award size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p>No votes have been submitted yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
