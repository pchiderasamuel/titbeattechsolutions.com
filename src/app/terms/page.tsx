import Navbar from '@/components/Navbar';
import ClientHtmlRenderer from '@/components/ClientHtmlRenderer';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';

export const metadata: Metadata = {
  title: 'Terms of Service | TitbeatTech Solutions',
  description: 'Terms of Service for TitbeatTechsolutions.app',
};

export default function TermsOfService() {
  const filePath = path.join(process.cwd(), 'src', 'app', 'terms', 'termsContent.txt');
  let termsHtml = '';
  try {
    termsHtml = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Failed to load terms content:', error);
    termsHtml = '<p>Error loading terms of service. Please try again later.</p>';
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '100px', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
          <ClientHtmlRenderer html={termsHtml} />
        </div>
      </main>
    </>
  );
}
