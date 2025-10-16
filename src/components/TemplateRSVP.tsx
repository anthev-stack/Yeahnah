'use client';

import React from 'react';
import { Check, X, Award, Users, Calendar, Heart, Moon, Sun } from 'lucide-react';

interface TemplateRSVPProps {
  guest: any;
  awards: any[];
  onRSVP: (response: 'yes' | 'no') => void;
  onVote: (awardId: string, nomineeId: string) => void;
  votedAwards: string[];
}

export default function TemplateRSVP({ guest, awards, onRSVP, onVote, votedAwards }: TemplateRSVPProps) {
  const getThemeConfig = () => {
    switch (guest.template_theme) {
      case 'dark':
        return {
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          primaryColor: '#00ff88',
          secondaryColor: '#ffffff',
          accentColor: '#667eea',
          cardBackground: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          textColor: '#ffffff',
          mutedTextColor: '#cccccc',
          icon: <Moon size={48} />
        };
      case 'love':
        return {
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
          primaryColor: '#ec4899',
          secondaryColor: '#be185d',
          accentColor: '#fbbf24',
          cardBackground: 'rgba(255, 255, 255, 0.8)',
          borderColor: 'rgba(236, 72, 153, 0.2)',
          textColor: '#be185d',
          mutedTextColor: '#9d174d',
          icon: <Heart size={48} />
        };
      default: // light
        return {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          primaryColor: '#667eea',
          secondaryColor: '#764ba2',
          accentColor: '#00ff88',
          cardBackground: 'rgba(255, 255, 255, 0.9)',
          borderColor: 'rgba(102, 126, 234, 0.2)',
          textColor: '#1f2937',
          mutedTextColor: '#6b7280',
          icon: <Sun size={48} />
        };
    }
  };

  const theme = getThemeConfig();

  return (
    <div 
      className="template-rsvp"
      style={{
        background: theme.background,
        minHeight: '100vh',
        padding: '2rem',
        color: theme.textColor
      }}
    >
      <div 
        className="template-card"
        style={{
          background: theme.cardBackground,
          border: `2px solid ${theme.borderColor}`,
          borderRadius: '20px',
          padding: '3rem',
          maxWidth: '600px',
          margin: '0 auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Logo Section */}
        {guest.logo_url && (
          <div className="template-logo" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img 
              src={guest.logo_url} 
              alt="Event logo" 
              style={{
                maxHeight: '80px',
                maxWidth: '200px',
                objectFit: 'contain'
              }}
            />
          </div>
        )}

        {/* Header Section */}
        <div className="template-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ color: theme.primaryColor, marginBottom: '1rem' }}>
            {theme.icon}
          </div>
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: theme.textColor,
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {guest.event_title}
          </h1>
          
          <div style={{
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            display: 'inline-block',
            marginBottom: '1rem',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            📅 {new Date(guest.event_date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          
          <p style={{
            fontSize: '1.25rem',
            color: theme.mutedTextColor,
            marginBottom: '0.5rem'
          }}>
            Hi {guest.first_name} {guest.last_name}!
          </p>
          
          {guest.store_department && (
            <p style={{
              fontSize: '1rem',
              color: theme.mutedTextColor
            }}>
              Department: {guest.store_department}
            </p>
          )}
        </div>

        {/* RSVP Section */}
        <div className="template-rsvp-section" style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '1.5rem',
            color: theme.textColor
          }}>
            Will you be joining us?
          </h2>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => onRSVP('yes')}
              className={`rsvp-btn ${guest.rsvp_status === 'yes' ? 'active' : ''}`}
              style={{
                background: guest.rsvp_status === 'yes' 
                  ? `linear-gradient(135deg, ${theme.accentColor}, #00cc6a)` 
                  : theme.cardBackground,
                color: guest.rsvp_status === 'yes' ? 'white' : theme.textColor,
                border: `2px solid ${guest.rsvp_status === 'yes' ? theme.accentColor : theme.borderColor}`,
                borderRadius: '15px',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Check size={24} />
              Yeah!
            </button>
            
            <button
              onClick={() => onRSVP('no')}
              className={`rsvp-btn ${guest.rsvp_status === 'no' ? 'active' : ''}`}
              style={{
                background: guest.rsvp_status === 'no' 
                  ? 'linear-gradient(135deg, #ff4444, #cc0000)' 
                  : theme.cardBackground,
                color: guest.rsvp_status === 'no' ? 'white' : theme.textColor,
                border: `2px solid ${guest.rsvp_status === 'no' ? '#ff4444' : theme.borderColor}`,
                borderRadius: '15px',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <X size={24} />
              Nah
            </button>
          </div>
        </div>

        {/* Awards Section */}
        {awards.length > 0 && guest.rsvp_status === 'yes' && (
          <div className="template-awards-section">
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '1.5rem',
              color: theme.textColor
            }}>
              <Award size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Vote for Awards
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {awards.map((award) => (
                <div key={award.id} style={{
                  background: theme.cardBackground,
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: '12px',
                  padding: '1rem'
                }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: theme.textColor
                  }}>
                    {award.title}
                  </h4>
                  
                  {award.description && (
                    <p style={{
                      fontSize: '0.9rem',
                      color: theme.mutedTextColor,
                      marginBottom: '0.75rem'
                    }}>
                      {award.description}
                    </p>
                  )}
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {award.nominees?.map((nominee: any) => (
                      <button
                        key={nominee.id}
                        onClick={() => onVote(award.id, nominee.id)}
                        disabled={votedAwards.includes(award.id)}
                        style={{
                          background: votedAwards.includes(award.id) 
                            ? theme.accentColor 
                            : theme.cardBackground,
                          color: votedAwards.includes(award.id) 
                            ? 'white' 
                            : theme.textColor,
                          border: `1px solid ${votedAwards.includes(award.id) ? theme.accentColor : theme.borderColor}`,
                          borderRadius: '8px',
                          padding: '0.5rem 1rem',
                          fontSize: '0.9rem',
                          cursor: votedAwards.includes(award.id) ? 'default' : 'pointer',
                          opacity: votedAwards.includes(award.id) ? 0.7 : 1,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {nominee.first_name} {nominee.last_name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Message */}
        {guest.rsvp_status !== 'pending' && (
          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            padding: '1rem',
            background: theme.cardBackground,
            border: `1px solid ${theme.borderColor}`,
            borderRadius: '12px'
          }}>
            <p style={{
              fontSize: '0.9rem',
              color: theme.mutedTextColor,
              margin: 0
            }}>
              {guest.rsvp_status === 'yes' 
                ? `✅ You're confirmed! We can't wait to see you there.`
                : `❌ Sorry you can't make it. We'll miss you!`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
