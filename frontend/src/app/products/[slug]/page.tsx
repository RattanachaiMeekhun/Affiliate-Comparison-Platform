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

  return {
    title: `${product.name} | Professional Hardware Deals`,
    description: `Compare prices and specs for ${product.name}. ${specsStr}. AI-powered insights for professional workflows.`,
    openGraph: {
      title: `${product.name} | stacknodes`,
      description: product.description || `Find the best deals for ${product.name} on stacknodes.`,
      images: product.image_url ? [product.image_url] : [],
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
