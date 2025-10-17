'use client';

import React, { useState } from 'react';
import { Check, X, Award, Calendar, Users } from 'lucide-react';

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

interface StandaloneRSVPProps {
  guest: GuestData;
  awards: AwardData[];
  onRSVP: (response: 'yes' | 'no') => void;
  onVote: (awardId: string, nomineeId: string) => void;
  votedAwards: string[];
}

const StandaloneRSVP: React.FC<StandaloneRSVPProps> = ({ guest, awards, onRSVP, onVote, votedAwards }) => {
  const [rsvpSubmitted, setRsvpSubmitted] = useState(guest.rsvp_status !== 'pending');
  const [submitting, setSubmitting] = useState(false);
  const [selectedNominee, setSelectedNominee] = useState<{ [awardId: string]: string }>({});

  const submitRSVP = async (response: 'yes' | 'no') => {
    setSubmitting(true);
    await onRSVP(response);
    setRsvpSubmitted(true);
    setSubmitting(false);
  };

  const handleNomineeChange = (awardId: string, nomineeId: string) => {
    setSelectedNominee((prev) => ({ ...prev, [awardId]: nomineeId }));
  };

  const castVote = async (awardId: string) => {
    const nomineeId = selectedNominee[awardId];
    if (!nomineeId) {
      alert('Please select a nominee before voting.');
      return;
    }
    await onVote(awardId, nomineeId);
  };

  const getThemeStyles = (theme: 'light' | 'dark' | 'love') => {
    switch (theme) {
      case 'dark':
        return {
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          cardBg: 'rgba(26, 26, 26, 0.95)',
          textColor: '#ffffff',
          inputBg: '#333333',
          inputBorder: '#00ff88',
          buttonYes: '#00ff88',
          buttonNo: '#ff4444',
          buttonColor: '#000000',
          accentColor: '#00ff88'
        };
      case 'love':
        return {
          background: 'linear-gradient(135deg, #ffe4e1 0%, #fff0f5 100%)',
          cardBg: 'rgba(255, 240, 245, 0.95)',
          textColor: '#8b4b69',
          inputBg: '#ffffff',
          inputBorder: '#ff69b4',
          buttonYes: '#ff69b4',
          buttonNo: '#ff69b4',
          buttonColor: '#ffffff',
          accentColor: '#ff69b4'
        };
      case 'light':
      default:
        return {
          background: 'linear-gradient(135deg, #e0e7ff 0%, #ffffff 100%)',
          cardBg: 'rgba(255, 255, 255, 0.95)',
          textColor: '#333333',
          inputBg: '#ffffff',
          inputBorder: '#667eea',
          buttonYes: '#667eea',
          buttonNo: '#ff4444',
          buttonColor: '#ffffff',
          accentColor: '#667eea'
        };
    }
  };

  const styles = getThemeStyles(guest.template_theme);

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: styles.background,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      zIndex: 10000,
      overflow: 'auto'
    }}>
      <div style={{
        background: styles.cardBg,
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%',
        color: styles.textColor
      }}>
        {guest.logo_url && (
          <div style={{ marginBottom: '2rem' }}>
            <img 
              src={guest.logo_url} 
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
        
        <Calendar size={48} style={{ marginBottom: '1rem', color: styles.accentColor }} />
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '0.5rem',
          color: styles.textColor
        }}>
          {guest.event_title}
        </h1>
        
        <div style={{ 
          fontSize: '1.1rem', 
          marginBottom: '1rem',
          color: styles.textColor,
          opacity: 0.8
        }}>
          📅 {new Date(guest.event_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '2rem',
          color: styles.textColor
        }}>
          Hi {guest.first_name} {guest.last_name}!
        </p>
        
        {guest.store_department && (
          <p style={{ 
            fontSize: '1rem', 
            marginBottom: '2rem',
            color: styles.textColor,
            opacity: 0.8
          }}>
            Department: {guest.store_department}
          </p>
        )}

        {!rsvpSubmitted ? (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ 
                fontSize: '1.2rem', 
                marginBottom: '2rem',
                color: styles.textColor
              }}>
                Will you be attending this {guest.event_type} event?
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <button
                style={{
                  padding: '1.5rem',
                  background: styles.buttonYes,
                  color: styles.buttonColor,
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => submitRSVP('yes')}
                disabled={submitting}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Check size={32} />
                <span>Yeah!</span>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>I'll be there</span>
              </button>

              <button
                style={{
                  padding: '1.5rem',
                  background: styles.buttonNo,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => submitRSVP('no')}
                disabled={submitting}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <X size={32} />
                <span>Nah</span>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Can't make it</span>
              </button>
            </div>

            {submitting && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid ' + styles.accentColor,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <p style={{ color: styles.textColor, opacity: 0.7 }}>Submitting your response...</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ 
                fontSize: '1.2rem', 
                marginBottom: '1rem',
                color: styles.textColor
              }}>
                You have RSVP'd: 
                <span style={{ 
                  color: guest.rsvp_status === 'yes' ? styles.buttonYes : styles.buttonNo,
                  fontWeight: 'bold',
                  marginLeft: '0.5rem'
                }}>
                  {guest.rsvp_status.toUpperCase()}
                </span>
              </p>
              <p style={{ 
                fontSize: '1rem',
                color: styles.textColor,
                opacity: 0.7
              }}>
                Thank you for your response!
              </p>
            </div>

            {/* Awards Section */}
            {awards.length > 0 && guest.rsvp_status === 'yes' && (
              <div style={{ 
                marginTop: '2rem',
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                border: `1px solid ${styles.accentColor}20`
              }}>
                <h3 style={{ 
                  marginBottom: '1rem',
                  color: styles.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <Award size={24} />
                  Vote for Awards!
                </h3>
                <p style={{ 
                  marginBottom: '1.5rem',
                  color: styles.textColor,
                  opacity: 0.8
                }}>
                  Help us recognize outstanding individuals by casting your votes.
                </p>

                {awards.map((award) => (
                  <div key={award.id} style={{ 
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: `1px solid ${styles.accentColor}30`
                  }}>
                    <div style={{ 
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Award size={20} style={{ color: styles.accentColor }} />
                      <h4 style={{ 
                        margin: 0,
                        color: styles.textColor,
                        fontSize: '1.1rem'
                      }}>
                        {award.title}
                      </h4>
                    </div>
                    {award.description && (
                      <p style={{ 
                        marginBottom: '1rem',
                        color: styles.textColor,
                        opacity: 0.8,
                        fontSize: '0.9rem'
                      }}>
                        {award.description}
                      </p>
                    )}

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                        color: styles.textColor
                      }}>
                        Select Nominee:
                      </label>
                      <select
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
                        value={selectedNominee[award.id] || ''}
                        onChange={(e) => handleNomineeChange(award.id, e.target.value)}
                        disabled={votedAwards.includes(award.id)}
                      >
                        <option value="">-- Select a guest --</option>
                        {/* This would need to be populated with actual guests */}
                        <option value="placeholder">Placeholder Guest</option>
                      </select>
                    </div>

                    <button
                      onClick={() => castVote(award.id)}
                      disabled={votedAwards.includes(award.id) || !selectedNominee[award.id]}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: votedAwards.includes(award.id) ? '#666' : styles.accentColor,
                        color: styles.buttonColor,
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: votedAwards.includes(award.id) ? 'not-allowed' : 'pointer',
                        opacity: votedAwards.includes(award.id) ? 0.6 : 1
                      }}
                    >
                      {votedAwards.includes(award.id) ? 'Vote Cast!' : 'Cast Vote'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StandaloneRSVP;
