'use client';
import { useState } from 'react';
import styles from './CheckoutModal.module.css';

const PLANS: Record<string, { name: string; students: string; basePrice: number; plus?: boolean }> = {
  micro:      { name: 'Micro',      students: 'Up to 200 students',   basePrice: 20000 },
  starter:    { name: 'Starter',    students: 'Up to 500 students',   basePrice: 52000 },
  growth:     { name: 'Growth',     students: 'Up to 1,000 students', basePrice: 105000 },
  enterprise: { name: 'Enterprise', students: '1,001+ students',      basePrice: 112500, plus: true },
};

interface Props { plan: string | null; isAnnual?: boolean; onClose: () => void; }

export default function CheckoutModal({ plan, isAnnual, onClose }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [school,    setSchool]    = useState('');
  const [email,     setEmail]     = useState('');
  const [country,   setCountry]   = useState('Nigeria');
  const [stateLoc,  setStateLoc]  = useState('');
  const [lga,       setLga]       = useState('');
  const [address,   setAddress]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copied,    setCopied]    = useState(false);
  const [bankRef]   = useState(() => 'TBT-' + Math.floor(100000 + Math.random() * 900000));
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'bank'>('paystack');

  if (!plan) return null;
  const p = PLANS[plan];
  const finalPrice = isAnnual ? p.basePrice * 3 * 0.9 : p.basePrice;
  const priceStr = `₦${finalPrice.toLocaleString()}${p.plus ? '+' : ''}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: school,
          adminName: `${firstName} ${lastName}`.trim(),
          adminEmail: email,
          plan,
          isAnnual,
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
          setError(data.error || 'Failed to start checkout. Please try again.');
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
      <div className={styles.modal}>
        <div className={styles.summary}>
          <h3>{p.name} Plan</h3>
          <div className={styles.badge}>{p.name}</div>
          <div className={styles.row}><span>Capacity</span><span>{p.students}</span></div>
          <div className={styles.row}><span>Billing</span><span>{isAnnual ? 'Annually (3 Terms)' : 'Termly'}</span></div>
          <div className={styles.total}><span>Due Today</span><span>{priceStr}</span></div>
          <p className={styles.note}>🔒 Payments via Paystack. Cancel anytime before next term.</p>
        </div>
        <div className={styles.form}>
          <button className={styles.close} onClick={onClose}>×</button>
          <h3>Complete Your Subscription</h3>
          <p>7-day free trial — no charge today. T&C applies.</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {(['paystack', 'bank'] as const).map(t => (
              <button key={t} type="button" onClick={() => { setPaymentMethod(t); setError(''); }}
                style={{ flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none',
                  background: paymentMethod === t ? 'linear-gradient(135deg,#4472C4,#2563EB)' : 'var(--card)',
                  color: paymentMethod === t ? '#fff' : 'var(--text)', fontWeight: 700, cursor: 'pointer' }}>
                {t === 'paystack' ? 'Pay Online' : 'Bank Transfer'}
              </button>
            ))}
          </div>

          {paymentMethod === 'bank' ? (
            <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Bank Transfer Details</span>
                <span style={{ fontSize: '0.8rem', background: 'var(--card)', padding: '0.3rem 0.6rem', borderRadius: '12px', color: 'var(--primary)', border: '1px solid var(--border)' }}>Ref: {bankRef}</span>
              </h4>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>Bank: <strong>UBA bank plc</strong></p>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Account Number:</span>
                <strong style={{ color: 'var(--white)', fontSize: '1rem' }}>1030718002</strong>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('1030718002');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{ background: copied ? '#10B981' : 'var(--card)', color: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--muted)' }}>Account Name: <strong>TITBEAT TECH SOLUTION</strong></p>
              <div style={{ padding: '1rem', background: 'rgba(68,114,196,0.1)', borderRadius: '8px', border: '1px solid rgba(68,114,196,0.3)', fontSize: '0.85rem', color: 'var(--white)', lineHeight: 1.5 }}>
                After payment, send your receipt and tracking reference <strong style={{ color: '#FBBF24', fontFamily: 'monospace', fontSize: '0.95rem' }}>{bankRef}</strong> to WhatsApp support at <a href={`https://wa.me/2349049524320?text=Hello%2C%20I%20just%20made%20a%20bank%20transfer%20for%20my%20school%20subscription.%20My%20reference%20is%20${bankRef}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>+234 904 952 4320</a> for instant provisioning.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.row2}>
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
              <div className={styles.row2}>
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
              <div className={styles.row2}>
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
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? 'Redirecting to payment…' : '🔒 Proceed to Pay'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
