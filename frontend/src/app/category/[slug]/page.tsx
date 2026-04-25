import { Metadata } from 'next';
import { fetchCategories, fetchProducts } from '@/services/api';
import CategoryClient from './CategoryClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const allCats = await fetchCategories();
  const category = allCats.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: 'Category Not Found | stacknodes',
    };
  }

  return {
    title: `${category.name} Hardware Deals | stacknodes`,
    description: category.description || `Find the best hardware deals for ${category.name} workflows. AI-powered benchmarks and professional comparisons.`,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} Deals | stacknodes`,
      description: `Browse curated ${category.name} hardware deals for professional workflows.`,
      images: [
        {
          url: category.icon_url || '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${category.name} — stacknodes`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${category.name} Hardware Deals | stacknodes`,
      description: `Browse curated ${category.name} hardware deals for professional workflows.`,
      images: [category.icon_url || '/og-image.png'],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  // Fetch data on the server
  const [allCats, products] = await Promise.all([
    fetchCategories(),
    fetchProducts(slug),
  ]);

  const category = allCats.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://stacknodes.net/' },
              { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://stacknodes.net/category' },
              { '@type': 'ListItem', position: 3, name: category.name, item: `https://stacknodes.net/category/${category.slug}` },
            ],
          }),
        }}
      />
      <CategoryClient category={category} products={products} />
    </>
  );
}
