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
            <button className={styles.btnOutline} onClick={() => { onLogin(); setMenuOpen(false); }}>Log In</button>
            <button className={styles.btnPrimary} onClick={() => { onSignup(); setMenuOpen(false); }}>Get Started</button>
          </li>
        </ul>
        <div className={styles.desktopCta}>
          <button className={styles.btnOutline} onClick={onLogin}>Log In</button>
          <button className={styles.btnPrimary} onClick={onSignup}>Get Started</button>
        </div>
      </div>
    </nav>
  );
}
