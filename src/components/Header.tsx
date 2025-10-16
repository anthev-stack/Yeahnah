'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Users } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link href="/" className="logo">
          <Calendar size={24} style={{ marginRight: '8px', display: 'inline' }} />
          Yeahnah
        </Link>
        <nav>
          <ul className="nav-links">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/create-event">
                <Users size={16} style={{ marginRight: '4px', display: 'inline' }} />
                Create Event
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
