'use client';
import { useState } from 'react';
import styles from './CheckoutModal.module.css';

interface Props { mode: 'login' | 'signup' | null; onClose: () => void; onSwitchToCheckout: (plan: string) => void; }

export default function AuthModal({ mode, onClose, onSwitchToCheckout }: Props) {
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

  if (!mode || mode === 'login') return null;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setFieldErrors({}); setLoading(true);
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
        if (data.details && Array.isArray(data.details)) {
          const errMap: Record<string, string> = {};
          data.details.forEach((issue: any) => {
            const field = issue.path?.[0];
            if (field) errMap[field] = issue.message;
          });
          setFieldErrors(errMap);
          setError(data.error || 'Please check the highlighted fields below.');
        } else {
          setError(data.error || 'Failed to start signup. Please try again.');
        }
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
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Start your free 7-day trial. No credit card required. T&C applies.</p>
            <form key="signup-form" onSubmit={handleSignup}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.field}>
                  <label>First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Adaeze" required />
                </div>
                <div className={styles.field}>
                  <label>Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Okonkwo" required />
                  {fieldErrors.adminName && <span className={styles.fieldError}>{fieldErrors.adminName}</span>}
                </div>
              </div>
              <div className={styles.field}>
                <label>School Name</label>
                <input value={school} onChange={e => setSchool(e.target.value)} placeholder="Greenfield Academy" required minLength={3} />
                {fieldErrors.schoolName && <span className={styles.fieldError}>{fieldErrors.schoolName}</span>}
              </div>
              <div className={styles.field}>
                <label>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@yourschool.edu.ng" required />
                {fieldErrors.adminEmail && <span className={styles.fieldError}>{fieldErrors.adminEmail}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.field}>
                  <label>Country</label>
                  <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Nigeria" required />
                  {fieldErrors.country && <span className={styles.fieldError}>{fieldErrors.country}</span>}
                </div>
                <div className={styles.field}>
                  <label>State</label>
                  <input value={stateLoc} onChange={e => setStateLoc(e.target.value)} placeholder="Lagos" required />
                  {fieldErrors.state && <span className={styles.fieldError}>{fieldErrors.state}</span>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.field}>
                  <label>LGA</label>
                  <input value={lga} onChange={e => setLga(e.target.value)} placeholder="Ikeja" required />
                  {fieldErrors.lga && <span className={styles.fieldError}>{fieldErrors.lga}</span>}
                </div>
                <div className={styles.field}>
                  <label>Address</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 School Road" required />
                  {fieldErrors.address && <span className={styles.fieldError}>{fieldErrors.address}</span>}
                </div>
              </div>
              <div className={styles.field}>
                <label>Select Plan</label>
                <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} required style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.65rem 0.9rem', color: 'var(--text)', fontSize: '0.95rem', outline: 'none' }}>
                  <option value="micro">Micro Plan (Up to 200 students)</option>
                  <option value="starter">Starter Plan (Up to 500 students)</option>
                  <option value="growth">Growth Plan (Up to 1,000 students)</option>
                  <option value="enterprise">Enterprise Plan (1,001+ students)</option>
                </select>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? 'Processing…' : 'Start Free Trial'}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
}
