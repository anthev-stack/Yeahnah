import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Award, TrendingUp, Filter, Download, Share2, Plus } from 'lucide-react';
import axios from 'axios';
import { useEvent } from '../context/EventContext';

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

const EventDashboardPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { setCurrentEvent, setGuests, setAwards } = useEvent();
  
  const [event, setEvent] = useState<EventData | null>(null);
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [awards, setAwards] = useState<AwardData[]>([]);
  const [results, setResults] = useState<VotingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rsvp' | 'awards'>('rsvp');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedAward, setSelectedAward] = useState<string>('all');

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      try {
        // Fetch event details
        const eventResponse = await axios.get(`http://localhost:5000/api/events/${eventId}`);
        const eventData = eventResponse.data;
        setEvent(eventData);
        setCurrentEvent(eventData);

        // Fetch guests
        const guestsResponse = await axios.get(`http://localhost:5000/api/events/${eventId}/guests`);
        const guestsData = guestsResponse.data;
        setGuests(guestsData);
        setGuests(guestsData);

        // Fetch awards
        const awardsResponse = await axios.get(`http://localhost:5000/api/events/${eventId}/awards`);
        const awardsData = awardsResponse.data;
        setAwards(awardsData);
        setAwards(awardsData);

        // Fetch results if there are awards
        if (awardsData.length > 0) {
          const resultsResponse = await axios.get(`http://localhost:5000/api/events/${eventId}/results`);
          setResults(resultsResponse.data);
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
    const stores = guests
      .map(g => g.store_department)
      .filter((store, index, arr) => store && arr.indexOf(store) === index);
    return stores;
  };

  const getRSVPStats = () => {
    const total = guests.length;
    const yes = guests.filter(g => g.rsvp_status === 'yes').length;
    const no = guests.filter(g => g.rsvp_status === 'no').length;
    const pending = guests.filter(g => g.rsvp_status === 'pending').length;
    
    return { total, yes, no, pending };
  };

  const getFilteredGuests = () => {
    let filtered = guests;
    
    if (selectedStore !== 'all') {
      filtered = filtered.filter(g => g.store_department === selectedStore);
    }
    
    return filtered;
  };

  const getFilteredResults = () => {
    let filtered = results;
    
    if (selectedAward !== 'all') {
      filtered = filtered.filter(r => r.id === selectedAward);
    }
    
    if (selectedStore !== 'all') {
      filtered = filtered.filter(r => r.store_department === selectedStore);
    }
    
    return filtered.sort((a, b) => b.vote_count - a.vote_count);
  };

  const generateShareLinks = () => {
    const shareLinks = guests
      .filter(g => g.guest_id)
      .map(g => ({
        guest: `${g.first_name} ${g.last_name}`,
        link: `${window.location.origin}/rsvp/${g.guest_id}`
      }));
    
    return shareLinks;
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
  const shareLinks = generateShareLinks();

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

          {shareLinks.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Share Links</h4>
              <div className="list">
                {shareLinks.map((link, index) => (
                  <div key={index} className="list-item">
                    <div className="flex justify-between items-center">
                      <span>{link.guest}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={link.link}
                          readOnly
                          className="form-input"
                          style={{ width: '300px', fontSize: '0.8rem' }}
                        />
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigator.clipboard.writeText(link.link)}
                          style={{ padding: '0.5rem' }}
                        >
                          <Share2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
};

export default EventDashboardPage;
