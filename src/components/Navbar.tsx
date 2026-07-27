'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import { env } from '@/lib/env';

export default function Navbar({ onSignup, onLogin }: { onSignup?: () => void; onLogin?: () => void } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Click outside to auto-close mobile menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const links = ['Home', 'Features', 'Pricing', 'About', 'Contact'];

  const handleLoginClick = () => {
    setMenuOpen(false);
    if (onLogin) {
      onLogin();
    } else {
      window.location.href = env.NEXT_PUBLIC_APP_URL;
    }
  };

  const handleSignupClick = () => {
    setMenuOpen(false);
    if (onSignup) {
      onSignup();
    } else {
      window.location.href = '/#pricing';
    }
  };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`} ref={navRef}>
      <div className={styles.inner}>
        <a href="#" className={styles.logo} style={{ textDecoration: 'none' }}>
          <img src="/tbt-logo.png" alt="TitbeatTech Solutions Logo" style={{ height: '36px', width: 'auto' }} />
          <span style={{ fontSize: '1.1rem', color: '#4472C4', fontWeight: 900, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
            TITBEATTECH SOLUTIONS
          </span>
        </a>
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((m) => !m)}
        >
          <span />
          <span />
          <span />
        </button>
        <ul className={`${styles.links} ${menuOpen ? styles.active : ''}`}>
          {links.map((l) => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
                {l}
              </a>
            </li>
          ))}
          <li className={styles.mobileCta}>
            <button className={styles.btnOutline} onClick={handleLoginClick}>
              Log In
            </button>
            <button className={styles.btnPrimary} onClick={handleSignupClick}>
              Get Started
            </button>
          </li>
        </ul>
        <div className={styles.desktopCta}>
          <button className={styles.btnOutline} onClick={handleLoginClick}>
            Log In
          </button>
          <button className={styles.btnPrimary} onClick={handleSignupClick}>
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
