import styles from './page.module.css';

export const metadata = { title: 'Payment Successful — TitbeatTech', robots: { index: false } };

export default function CheckoutSuccessPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.ring}>✓</div>
        <h1 className={styles.cardH1}>Payment Successful! 🎉</h1>
        <p className={styles.sub}>
          Your subscription is now active. We&apos;re setting up your school account — this usually takes less than a minute.
        </p>
        <div className={styles.infoBox}>
          <p><strong>Check your inbox.</strong> You&apos;ll receive an email with your temporary login credentials shortly. You <strong>must change your password</strong> on first login.</p>
          <p>Didn&apos;t receive the email? Check your spam folder or <a href="mailto:support@titbeattechsolutions.app">contact support</a>.</p>
        </div>
        <a href={process.env.NEXT_PUBLIC_APP_URL || 'https://app.titbeattechsolutions.app'} className={styles.btn}>
          Go to Login →
        </a>
        <p><a href="/">← Back to homepage</a></p>
      </div>
    </div>
  );
}
