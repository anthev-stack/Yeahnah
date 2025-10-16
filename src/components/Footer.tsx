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
          <h3>Products</h3>
          <ul>
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/business-events">Business Events</Link></li>
            <li><Link href="/personal-events">Personal Events</Link></li>
            <li><Link href="/awards">Award Voting</Link></li>
            <li><Link href="/analytics">Analytics</Link></li>
            <li><Link href="/integrations">Integrations</Link></li>
            <li><Link href="/api">API</Link></li>
            <li><Link href="/templates">Templates</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Resources</h3>
          <ul>
            <li><Link href="/docs">Documentation</Link></li>
            <li><Link href="/guides">Guides</Link></li>
            <li><Link href="/help">Help Center</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/examples">Examples</Link></li>
            <li><Link href="/best-practices">Best Practices</Link></li>
            <li><Link href="/security">Security</Link></li>
            <li><Link href="/status">Status</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Company</h3>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/partners">Partners</Link></li>
            <li><Link href="/press">Press</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Social</h3>
          <ul>
            <li>
              <Link href="https://github.com/anthev-stack/Yeahnah" className="flex items-center gap-2">
                <Github size={16} />
                GitHub
              </Link>
            </li>
            <li>
              <Link href="https://linkedin.com" className="flex items-center gap-2">
                <Linkedin size={16} />
                LinkedIn
              </Link>
            </li>
            <li>
              <Link href="https://twitter.com" className="flex items-center gap-2">
                <Twitter size={16} />
                Twitter
              </Link>
            </li>
            <li>
              <Link href="https://youtube.com" className="flex items-center gap-2">
                <Youtube size={16} />
                YouTube
              </Link>
            </li>
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
