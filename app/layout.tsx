import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MyApproved - Find Local Approved Tradespeople | Plumbers, Electricians, Builders',
  description: 'Find verified, reliable tradespeople in your area. Connect with approved plumbers, electricians, builders, and more. Get quotes, compare services, and hire with confidence on MyApproved.',
  keywords: 'tradespeople, plumber, electrician, builder, home improvement, local trades, verified professionals, quotes, UK',
  authors: [{ name: 'MyApproved' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'MyApproved - Find Local Approved Tradespeople',
    description: 'Connect with verified, reliable tradespeople in your area. Get quotes and hire with confidence.',
    type: 'website',
    locale: 'en_GB',
    siteName: 'MyApproved',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyApproved - Find Local Approved Tradespeople',
    description: 'Connect with verified, reliable tradespeople in your area.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://myapproved.co.uk" />
        <meta name="theme-color" content="#1e40af" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          rel="stylesheet"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}