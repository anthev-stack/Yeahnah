import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CreateEventPage from './pages/CreateEventPage';
import EventDashboardPage from './pages/EventDashboardPage';
import RSVPPage from './pages/RSVPPage';
import { EventProvider } from './context/EventContext';

function App() {
  return (
    <EventProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create-event" element={<CreateEventPage />} />
              <Route path="/event/:eventId/dashboard" element={<EventDashboardPage />} />
              <Route path="/rsvp/:guestId" element={<RSVPPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </EventProvider>
  );
}

export default App;