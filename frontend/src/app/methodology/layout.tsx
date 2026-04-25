import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Methodology | stacknodes',
  description:
    'Learn how stacknodes collects, analyzes, and ranks hardware using AI-powered matching, vector embeddings, and transparent scoring methodology.',
  alternates: { canonical: '/methodology' },
  openGraph: {
    title: 'stacknodes Methodology — AI-Powered Hardware Curation',
    description:
      'Discover how we use AI to aggregate pricing, match products across marketplaces, and score hardware for professionals.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'stacknodes Methodology' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'stacknodes Methodology',
    description: 'How we use AI to find and rank the best hardware deals.',
    images: ['/og-image.png'],
  },
};

export default function MethodologyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
