'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Calendar, Users, LogIn, LogOut, UserPlus, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  const { data: session, status } = useSession();

  return (
    <header className="header">
      <div className="header-content">
        <Link href="/" className="logo">
          <Calendar size={20} />
          Yeahnah
        </Link>
        
        <nav>
          <ul className="nav-links">
            <li>
              <Link href="/">
                Home
              </Link>
            </li>
            {session && (
              <>
                <li>
                  <Link href="/events">
                    <Users size={16} />
                    View Events
                  </Link>
                </li>
                <li>
                  <Link href="/create-event">
                    <Users size={16} />
                    Create Event
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="nav-actions">
          <Link href="/contact" className="btn-contact">
            Contact
          </Link>
          {session ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="btn-dashboard">
                Dashboard
              </Link>
              <div className="profile-icon">
                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                onClick={() => signOut()}
                className="text-gray-400 hover:text-white"
                style={{ padding: '0.25rem' }}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/signin" className="text-white hover:text-gray-300">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-dashboard">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
