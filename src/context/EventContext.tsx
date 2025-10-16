'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: 'business' | 'personal';
  multi_store_enabled: boolean;
  host_name: string;
  host_email: string;
  created_at: string;
}

export interface Guest {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  guest_id?: string;
  store_department?: string;
  rsvp_status: 'pending' | 'yes' | 'no';
  rsvp_date?: string;
}

export interface Award {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  created_at: string;
}

export interface Vote {
  id: string;
  event_id: string;
  award_id: string;
  voter_id: string;
  nominee_id: string;
  created_at: string;
}

interface EventContextType {
  currentEvent: Event | null;
  guests: Guest[];
  awards: Award[];
  setCurrentEvent: (event: Event | null) => void;
  setGuests: (guests: Guest[]) => void;
  setAwards: (awards: Award[]) => void;
  addGuest: (guest: Guest) => void;
  updateGuestRSVP: (guestId: string, status: 'yes' | 'no') => void;
  addAward: (award: Award) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvent = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);

  const addGuest = (guest: Guest) => {
    setGuests(prev => [...prev, guest]);
  };

  const updateGuestRSVP = (guestId: string, status: 'yes' | 'no') => {
    setGuests(prev => 
      prev.map(guest => 
        guest.guest_id === guestId 
          ? { ...guest, rsvp_status: status, rsvp_date: new Date().toISOString() }
          : guest
      )
    );
  };

  const addAward = (award: Award) => {
    setAwards(prev => [...prev, award]);
  };

  const value: EventContextType = {
    currentEvent,
    guests,
    awards,
    setCurrentEvent,
    setGuests,
    setAwards,
    addGuest,
    updateGuestRSVP,
    addAward,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

