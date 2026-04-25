import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Hardware | stacknodes',
  description:
    'Compare GPUs, CPUs, monitors and more side-by-side. Filter by brand, price, and specs to find the best hardware for your workflow.',
  openGraph: {
    title: 'Compare Hardware — stacknodes',
    description:
      'Side-by-side hardware comparison with AI insights. Find the best value for data science, video editing, and 3D rendering builds.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'stacknodes — Hardware Comparison Tool',
      },
    ],
  },
  alternates: {
    canonical: '/compare',
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
