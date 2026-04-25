import { Metadata } from 'next';
import { fetchProductBySlug, fetchCategories } from '@/services/api';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | stacknodes',
    };
  }

  const specsStr = product.specs 
    ? Object.entries(product.specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ')
    : '';

  const bestPrice =
    product.affiliate_products.length > 0
      ? Math.min(
          ...product.affiliate_products.map((p) => Number(p.price) || 0).filter((p) => p > 0)
        )
      : Number(product.price) || 0;

  const brand = product.specs?.brand || 'stacknodes';
  const category = 'Computer Hardware'; // Default category prefix

  return {
    title: `${product.name} | Professional Hardware Deals`,
    description: `Compare prices and specs for ${product.name}. ${specsStr}. AI-powered insights for professional workflows.`,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | stacknodes`,
      description: product.description || `Find the best deals for ${product.name} on stacknodes.`,
      images: product.image_url
        ? [{ url: product.image_url, alt: product.name }]
        : [{ url: '/og-image.png', width: 1200, height: 630, alt: 'stacknodes' }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${product.name} | stacknodes`,
      description: product.description || `Find the best deals for ${product.name} on stacknodes.`,
      images: product.image_url ? [product.image_url] : ['/og-image.png'],
    },
    other: {
      'og:type': 'product',
      'product:price:amount': bestPrice > 0 ? bestPrice.toString() : '0',
      'product:price:currency': product.currency || 'USD',
      'product:availability': bestPrice > 0 ? 'in stock' : 'out of stock',
      'product:condition': 'new',
      'product:brand': brand,
      'product:category': category,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  
  // Fetch data on the server
  const [product, allCats] = await Promise.all([
    fetchProductBySlug(slug),
    fetchCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const category = product.category_id 
    ? allCats.find((c) => c.id === product.category_id) || null
    : null;

  return <ProductClient product={product} category={category} />;
}
