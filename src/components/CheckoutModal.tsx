'use client';
import { useState } from 'react';
import styles from './CheckoutModal.module.css';

const PLANS: Record<string, { name: string; students: string; basePrice: number; plus?: boolean }> = {
  starter:    { name: 'Starter',    students: 'Up to 300 students',   basePrice: 30000 },
  growth:     { name: 'Growth',     students: 'Up to 1,000 students', basePrice: 50000 },
  enterprise: { name: 'Enterprise', students: 'Unlimited students',   basePrice: 90000, plus: true },
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
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'bank'>('paystack');

  if (!plan) return null;
  const p = PLANS[plan];
  const finalPrice = isAnnual ? p.basePrice * 3 : p.basePrice;
  const priceStr = `₦${finalPrice.toLocaleString()}${p.plus ? '+' : ''}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
        setError(data.error || 'Failed to start checkout. Please try again.');
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
          <p>14-day free trial — no charge today.</p>
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
              <h4 style={{ marginBottom: '1rem', color: 'var(--white)' }}>Bank Transfer Details</h4>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>Bank: <strong>UBA bank plc</strong></p>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>Account Number: <strong style={{ color: 'var(--white)', fontSize: '1rem' }}>1030718002</strong></p>
              <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--muted)' }}>Account Name: <strong>TITBEAT TECH SOLUTION</strong></p>
              <div style={{ padding: '1rem', background: 'rgba(68,114,196,0.1)', borderRadius: '8px', border: '1px solid rgba(68,114,196,0.3)', fontSize: '0.85rem', color: 'var(--white)', lineHeight: 1.5 }}>
                After making payment, please send your payment receipt to our WhatsApp support at <a href="https://wa.me/2349060446496" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>+234 906 044 6496</a> to get your account provisioned instantly.
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
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Country</label>
                  <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Nigeria" required />
                </div>
                <div className={styles.field}>
                  <label>State</label>
                  <input value={stateLoc} onChange={e => setStateLoc(e.target.value)} placeholder="Lagos" required />
                </div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>LGA</label>
                  <input value={lga} onChange={e => setLga(e.target.value)} placeholder="Ikeja" required />
                </div>
                <div className={styles.field}>
                  <label>Address</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 School Road" required />
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
