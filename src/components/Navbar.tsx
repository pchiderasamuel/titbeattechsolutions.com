'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';

export default function Navbar({ onSignup, onLogin }: { onSignup: () => void; onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = ['Home','Features','Pricing','About','Contact'];

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <a href="#" className={styles.logo} style={{ textDecoration: 'none' }}>
          <img src="/tbt-logo.png" alt="TitbeatTech Solutions Logo" style={{ height: '36px', width: 'auto' }} />
          <span style={{ fontSize: '1.1rem', color: '#4472C4', fontWeight: 900, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>TITBEATTECH SOLUTIONS</span>
        </a>
        <button className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          aria-label="Toggle menu" onClick={() => setMenuOpen(m => !m)}>
          <span/><span/><span/>
        </button>
        <ul className={`${styles.links} ${menuOpen ? styles.active : ''}`}>
          {links.map(l => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
                {l}
              </a>
            </li>
          ))}
          <li className={styles.mobileCta}>
            <a href={process.env.NEXT_PUBLIC_APP_URL || 'https://app.titbeattechsolutions.app'} className={styles.btnOutline} onClick={() => setMenuOpen(false)}>Log In</a>
            <button className={styles.btnPrimary} onClick={() => { onSignup(); setMenuOpen(false); }}>Get Started</button>
          </li>
        </ul>
        <div className={styles.desktopCta}>
          <a href={process.env.NEXT_PUBLIC_APP_URL || 'https://app.titbeattechsolutions.app'} className={styles.btnOutline}>Log In</a>
          <button className={styles.btnPrimary} onClick={onSignup}>Get Started</button>
        </div>
      </div>
    </nav>
  );
}
