import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <Calendar size={24} style={{ marginRight: '8px', display: 'inline' }} />
          Yeahnah
        </Link>
        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/create-event">
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
