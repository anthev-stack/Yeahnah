'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Users, Award, Building2, Heart, Github, Linkedin, Twitter, Youtube, ChevronUp } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <h3>Yeahnah</h3>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/create-event">Create Event</Link></li>
            <li><Link href="/events">View Events</Link></li>
            <li><Link href="https://github.com/anthev-stack/Yeahnah">
              <Github size={16} style={{ display: 'inline', marginRight: '8px' }} />
              GitHub
            </Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Support</h3>
          <ul>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="system-status">
          <div className="status-dot"></div>
          <span>All systems operational</span>
        </div>
        <button onClick={scrollToTop} className="scroll-to-top">
          <ChevronUp size={16} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
