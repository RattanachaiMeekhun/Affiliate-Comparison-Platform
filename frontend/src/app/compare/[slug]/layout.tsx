import { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parts = params.slug.split('-vs-');
  
  if (parts.length === 2) {
    const p1 = parts[0].replace(/-/g, ' ').toUpperCase();
    const p2 = parts[1].replace(/-/g, ' ').toUpperCase();
    
    return {
      title: `${p1} vs ${p2} - Detailed Specification Comparison & Benchmarks | Stacknodes`,
      description: `Compare ${p1} and ${p2} side-by-side. See technical specifications, current marketplace prices, trending scores, and find out which one is better value.`,
    };
  }

  return {
    title: 'Product Comparison | Stacknodes',
    description: 'Compare products side-by-side to find the best value.',
  };
}

export default function CompareSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
