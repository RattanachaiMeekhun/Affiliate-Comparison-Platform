import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import StoreProvider from '@/store/provider';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CompareProvider } from '@/context/CompareContext';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import CompareStickyBar from '@/components/Compare/CompareStickyBar';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'stacknodes — AI-Powered Hardware Deals for Professionals',
    template: '%s | stacknodes',
  },
  description:
    'Find the best hardware deals across Amazon, Best Buy, Newegg & more. AI-curated comparisons for data scientists, video editors, 3D artists, and gamers.',
  keywords: [
    'workstation for data science',
    'best GPU for machine learning',
    '4K video editing monitor',
    '3D rendering workstation',
    'professional workstation deals',
    'RTX 4090 deals',
    'best CPU for rendering',
    'hardware comparison',
  ],
  metadataBase: new URL('https://stacknodes.net'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'stacknodes',
    title: 'stacknodes — AI-Powered Hardware Deals for Professionals',
    description:
      'Find the best hardware deals for data science, video editing, and 3D rendering workflows. AI-curated comparisons across top retailers.',
    url: 'https://stacknodes.net/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'stacknodes — AI-Powered Hardware Deals',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    other: {
      'impact-site-verification': '2f49fcd3-65ef-4d1b-9e4d-9a3b767c6432',
      'p:domain_verify': 'ece3bf1617ba789fedc7b2bbe1677d88',
    },
  },
  other: {
    'pinterest-rich-pin': 'true',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Website Schema (Sitelinks search box) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'stacknodes',
              url: 'https://stacknodes.net/',
              description: 'AI-Powered Hardware Deals for Professionals',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://stacknodes.net/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'stacknodes',
              url: 'https://stacknodes.net/',
              logo: 'https://stacknodes.net/logo.png',
              sameAs: [
                'https://www.pinterest.com/stacknodes',
              ],
            }),
          }}
        />

        <NextTopLoader 
          color="#2563eb"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563eb,0 0 5px #2563eb"
        />
        <AntdRegistry>
          <CurrencyProvider>
            <StoreProvider>
              <CompareProvider>
                <Header />
                <main style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
                  {children}
                </main>
                <Footer />
                <CompareStickyBar />
              </CompareProvider>
            </StoreProvider>
          </CurrencyProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

