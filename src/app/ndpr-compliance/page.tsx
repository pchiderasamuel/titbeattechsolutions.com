import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Protection Notice | TitbeatTechsolutions',
  description: 'Data Protection Notice (NDPA & GAID Compliance) for TitbeatTechsolutions.',
};

export default function NDPRCompliance() {
  return (
    <>
      <header style={{ padding: '20px 40px', borderBottom: '1px solid #eee' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold', fontSize: '18px' }}>
          TitbeatTech Solutions
        </Link>
      </header>
      <main style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', background: '#fff', color: '#333', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
        <Link href="/" style={{ color: '#0055FF', textDecoration: 'underline', marginBottom: '30px', display: 'inline-block' }}>
          &larr; Back to Home
        </Link>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#000', marginBottom: '0.5rem' }}>Data Protection Notice (NDPA & GAID Compliance)</h1>
          <p style={{ fontStyle: 'italic', color: '#666' }}>Last updated: June 30, 2026</p>
          
          <p>TITBEATTECH SOLUTIONS LTD ("we", "us", "our") is committed to protecting your personal data in accordance with the Nigeria Data Protection Act (NDPA) 2023 and the General Application and Implementation Directive (GAID) 2025.</p>

          <h2 style={{ fontSize: '1.5rem', color: '#000', marginTop: '1rem' }}>1. Data Controller</h2>
          <p>TITBEATTECH SOLUTIONS LTD is the data controller responsible for your personal data collected through this website and our application.</p>
          <p>
            <strong>Contact:</strong> titbeattechsolutions@gmail.com<br />
            <strong>Address:</strong> Bayelsa State, Nigeria
          </p>

          <h2 style={{ fontSize: '1.5rem', color: '#000', marginTop: '1rem' }}>2. Data We Collect</h2>
          <p>When you register, make payment, or use our services, we may collect:</p>
          <ul style={{ paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Full name, email address, phone number</li>
            <li>School/institution details</li>
            <li>Payment information (processed securely by our payment partner; we do not store card details)</li>
            <li>Login credentials and account activity</li>
            <li>Technical data (IP address, browser type, cookies)</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', color: '#000', marginTop: '1rem' }}>3. Purpose of Processing</h2>
          <p>We process your data to:</p>
          <ul style={{ paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Create and manage your account and school records</li>
            <li>Process payments and confirm transactions</li>
            <li>Send onboarding emails (login credentials, one-time passwords, school PIN)</li>
            <li>Provide customer support</li>
            <li>Comply with legal obligations</li>
            <li>Improve our services</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', color: '#000', marginTop: '1rem' }}>4. Legal Basis for Processing</h2>
          <p>We process your data based on:</p>
          <ul style={{ paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Consent</strong> — given at registration/checkout</li>
            <li><strong>Contractual necessity</strong> — to deliver the service you've signed up for</li>
            <li><strong>Legal obligation</strong> — where required by law</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', color: '#000', marginTop: '1rem' }}>5. Third-Party Processors</h2>
          <p>We share data only with trusted service providers necessary to deliver our service, including:</p>
          <ul style={{ paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Paystack</strong> — payment processing</li>
            <li><strong>Resend</strong> — transactional email delivery</li>
            <li><strong>Supabase</strong> — secure database hosting and authentication</li>
          </ul>
          <p>These providers are contractually/technically required to handle your data securely and only for the purposes stated.</p>

          <h2 style={{ fontSize: '1.5rem', color: '#000', marginTop: '1rem' }}>6. Data Retention</h2>
          <p>We retain personal data only for as long as necessary to fulfill the purposes outlined above, or as required by law, after which it is securely deleted or anonymized.</p>

          <h2 style={{ fontSize: '1.5rem', color: '#000', marginTop: '1rem' }}>7. Your Rights</h2>
          <p>Under the NDPA and GAID, you have the right to:</p>
          <ul style={{ paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data ("right to be forgotten"), subject to legal limits</li>
            <li>Withdraw consent at any time</li>
            <li>Object to certain processing</li>
            <li>Lodge a complaint with the Nigeria Data Protection Commission (NDPC)</li>
          </ul>
          <p>To exercise any of these rights, contact us at titbeattechsolutions@gmail.com.</p>

          <h2 style={{ fontSize: '1.5rem', color: '#000', marginTop: '1rem' }}>8. Data Security</h2>
          <p>We implement appropriate technical and organizational measures (encryption, access controls, secure authentication) to protect your data against unauthorized access, loss, or misuse.</p>

          <h2 style={{ fontSize: '1.5rem', color: '#000', marginTop: '1rem' }}>9. Cookies</h2>
          <p>This website uses cookies to improve user experience. By continuing to use the site, you consent to our use of cookies as described in this notice.</p>

          <h2 style={{ fontSize: '1.5rem', color: '#000', marginTop: '1rem' }}>10. Changes to This Notice</h2>
          <p>We may update this notice periodically. Continued use of our website/app after changes constitutes acceptance of the updated notice.</p>

          <h2 style={{ fontSize: '1.5rem', color: '#000', marginTop: '1rem' }}>11. Contact Us</h2>
          <p>For data protection inquiries:<br />
          <strong>Email:</strong> titbeattechsolutions@gmail.com</p>

          <h2 style={{ fontSize: '1.5rem', color: '#000', marginTop: '1rem' }}>12. NDPC Registration Status</h2>
          <p>TITBEATTECH SOLUTIONS LTD is registered (or in the process of registering) with the Nigeria Data Protection Commission (NDPC) as a Data Controller/Processor in accordance with the NDPA and GAID. [Add your NDPC registration number and category once confirmed, e.g. "Registration No: XXXXX, Category: Small Business Data Controller."]</p>
        </div>
      </main>
    </>
  );
}
