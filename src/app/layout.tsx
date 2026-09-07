import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AnnouncementBar from '@/components/AnnouncementBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://titbeattech.com'),
  title: {
    default: 'Titbeat SchoolPro — Run Your School Smarter',
    template: '%s | Titbeat SchoolPro',
  },
  description:
    'Cloud-based school management SaaS for Nigerian K-12 schools. Manage students, fees, timetables and staff from one dashboard. Start your free trial today.',
  keywords: ['school management Nigeria', 'K-12 software', 'school management system', 'TitbeatTech', 'edtech Nigeria', 'school portal', 'Titbeat SchoolPro'],
  authors: [{ name: 'TitbeatTech Solutions' }],
  creator: 'TitbeatTech Solutions',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://titbeattech.com',
    title: 'Titbeat SchoolPro — Run Your School Smarter',
    description:
      'Cloud-based school management SaaS for Nigerian K-12 schools. Manage fees, students, and staff effortlessly.',
    siteName: 'Titbeat SchoolPro',
    images: ['/tbt-logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Titbeat SchoolPro — Run Your School Smarter',
    description:
      'Cloud-based school management SaaS for Nigerian K-12 schools. Manage fees, students, and staff effortlessly.',
    creator: '@titbeattech',
    images: ['/tbt-logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AnnouncementBar />
        {children}
      </body>
    </html>
  );
}
