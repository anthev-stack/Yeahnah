'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Calendar, Users, LogIn, LogOut, UserPlus } from 'lucide-react';

const Header: React.FC = () => {
  const { data: session, status } = useSession();

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
            {session ? (
              <>
                <li>
                  <Link href="/create-event">
                    <Users size={16} style={{ marginRight: '4px', display: 'inline' }} />
                    Create Event
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Hello, {session.user?.name}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem' }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/auth/signin" className="flex items-center gap-1">
                    <LogIn size={16} />
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="flex items-center gap-1">
                    <UserPlus size={16} />
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
