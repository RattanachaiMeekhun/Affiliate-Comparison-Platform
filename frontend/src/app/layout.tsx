import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import StoreProvider from '@/store/provider';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CompareProvider } from '@/context/CompareContext';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import CompareStickyBar from '@/components/Compare/CompareStickyBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'stacknodes — AI-Powered Hardware Deals for Professionals',
  description:
    'Find the best hardware deals across Amazon, Best Buy, Newegg & more. AI-curated comparisons for data scientists, video editors, 3D artists, and gamers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-head-element */}
        <meta name="impact-site-verification" {...({ value: "2f49fcd3-65ef-4d1b-9e4d-9a3b767c6432" } as any)} />
      </head>
      <body>
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

