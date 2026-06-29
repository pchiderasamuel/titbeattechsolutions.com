'use client';
import { useState } from 'react';
import styles from './CheckoutModal.module.css';

interface Props { mode: 'login' | 'signup' | null; onClose: () => void; onSwitchToCheckout: (plan: string) => void; }

export default function AuthModal({ mode, onClose, onSwitchToCheckout }: Props) {
  const [tab, setTab] = useState<'login' | 'signup'>(mode || 'login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Signup form state
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [school,    setSchool]    = useState('');
  const [email,     setEmail]     = useState('');
  const [country,   setCountry]   = useState('Nigeria');
  const [stateLoc,  setStateLoc]  = useState('');
  const [lga,       setLga]       = useState('');
  const [address,   setAddress]   = useState('');
  const [selectedPlan, setSelectedPlan] = useState('growth');

  if (!mode) return null;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = process.env.NEXT_PUBLIC_APP_URL || 'https://app.titbeattechsolutions.app';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/checkout/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: school,
          adminName: `${firstName} ${lastName}`.trim(),
          adminEmail: email,
          plan: selectedPlan,
          country,
          state: stateLoc,
          lga,
          address,
        }),
      });
      const data = await res.json();
      if (res.ok && data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setError(data.error || 'Failed to start signup. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} style={{ gridTemplateColumns: '1fr', maxWidth: 480 }}>
        <div className={styles.form}>
          <button className={styles.close} onClick={onClose}>×</button>
          <h3 style={{ marginBottom: '1.5rem' }}>Welcome to TitbeatTech</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                style={{ flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none',
                  background: tab === t ? 'linear-gradient(135deg,#4472C4,#2563EB)' : 'var(--card)',
                  color: tab === t ? '#fff' : 'var(--text)', fontWeight: 700, cursor: 'pointer' }}>
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>
          {tab === 'login' ? (
            <form key="login-form" onSubmit={handleLogin}>
              <div className={styles.field}><label>Email</label><input name="email" type="email" placeholder="admin@yourschool.edu.ng" required /></div>
              <div className={styles.field}><label>Password</label><input name="password" type="password" placeholder="••••••••" required /></div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.submit} disabled={loading}>{loading ? 'Logging in…' : 'Log In'}</button>
            </form>
          ) : (
            <form key="signup-form" onSubmit={handleSignup}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.field}>
                  <label>First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Adaeze" required />
                </div>
                <div className={styles.field}>
                  <label>Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Okonkwo" required />
                </div>
              </div>
              <div className={styles.field}>
                <label>School Name</label>
                <input value={school} onChange={e => setSchool(e.target.value)} placeholder="Greenfield Academy" required minLength={3} />
              </div>
              <div className={styles.field}>
                <label>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@yourschool.edu.ng" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.field}>
                  <label>Country</label>
                  <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Nigeria" required />
                </div>
                <div className={styles.field}>
                  <label>State</label>
                  <input value={stateLoc} onChange={e => setStateLoc(e.target.value)} placeholder="Lagos" required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.field}>
                  <label>LGA</label>
                  <input value={lga} onChange={e => setLga(e.target.value)} placeholder="Ikeja" required />
                </div>
                <div className={styles.field}>
                  <label>Address</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 School Road" required />
                </div>
              </div>
              <div className={styles.field}>
                <label>Select Plan</label>
                <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} required style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.65rem 0.9rem', color: 'var(--text)', fontSize: '0.95rem', outline: 'none' }}>
                  <option value="starter">Starter Plan (Up to 300 students)</option>
                  <option value="growth">Growth Plan (Up to 1,000 students)</option>
                  <option value="enterprise">Enterprise Plan (Unlimited)</option>
                </select>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? 'Processing…' : 'Start Free Trial'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
