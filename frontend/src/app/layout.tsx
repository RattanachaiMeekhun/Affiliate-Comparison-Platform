import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import StoreProvider from '@/store/provider';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'PixelStack — AI-Powered Hardware Deals for Professionals',
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
      <body>
        <AntdRegistry>
          <StoreProvider>
            <Header />
            <main style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
              {children}
            </main>
            <Footer />
          </StoreProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
