import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Setup Builder | stacknodes',
  description:
    'Build your perfect workstation with our AI Setup Builder. Tell us your use case and budget — get instant hardware recommendations optimized for data science, video editing, or 3D rendering.',
  alternates: { canonical: '/setup-builder' },
  openGraph: {
    title: 'AI Setup Builder — stacknodes',
    description:
      'Get AI-powered hardware recommendations tailored to your workload and budget. Build smarter with stacknodes.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'stacknodes AI Setup Builder' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Setup Builder | stacknodes',
    description: 'Get AI-powered hardware recommendations tailored to your workflow and budget.',
    images: ['/og-image.png'],
  },
};

export default function SetupBuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
