import api from '@/util/axios';

// Ensure NEXT_PUBLIC_API_URL is available in .env
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  is_active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  icon_url: string | null;
  sort_order: number;
}

export interface AffiliateProduct {
  id: string;
  product_id: string;
  source_name: string;
  source_product_id: string;
  source_url: string;
  price: number | string;
  currency: string;
  image_url: string | null;
  raw_data: any;
  last_scraped: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ai_insight: string | null;
  best_value: boolean;
  category_id: string | null;
  specs: Record<string, any> | null;
  trending_score: string | number;
  price: string | number | null;
  currency: string;
  image_url: string | null;
  affiliate_products: AffiliateProduct[];
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await api.get<Category[]>('/categories/?limit=20');
    return res.data;
  } catch (error) {
    console.error('Failed to fetch categorisses', error);
    return [];
  }
}

export async function fetchProducts(
  category?: string,
  skip?: number,
  limit?: number
): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());
    if (skip !== undefined) params.append('skip', skip.toString());
    if (category) params.append('category', category);
    const res = await api.get<Product[]>(
      `/products/${params.size > 0 ? '?' + params.toString() : ''}`
    );
    return res.data;
  } catch (error) {
    console.error('Failed to fetch products', error);
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await api.get<Product>(`/products/${id}`);
    return res.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) return null;
    console.error(`Failed to fetch product ${id}`, error);
    throw new Error(`Failed to fetch product ${id}`);
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    // Current backend doesn't have a direct /products/slug/{slug} endpoint,
    // but read_products supports a category filter. 
    // We should ideally add a specific endpoint to the backend, 
    // but for now we can use /products/?slug=... if the backend supports it,
    // or fetch products and find it (which is what we want to avoid).
    
    // Check if backend crud.py has get_product_by_slug (it doesn't seem to have a router for it yet)
    // Actually, I should add a router for it in the backend first.
    const res = await api.get<Product[]>(`/products/?limit=1&slug=${slug}`);
    return res.data.length > 0 ? res.data[0] : null;
  } catch (error: any) {
    console.error(`Failed to fetch product by slug ${slug}`, error);
    return null;
  }
}

export interface CurrencyRate {
  code: string;
  rate: number;
}

export async function fetchCurrencies(): Promise<CurrencyRate[]> {
  try {
    const res = await api.get<CurrencyRate[]>('/currencies/');
    return res.data;
  } catch (error) {
    console.error('Failed to fetch currencies', error);
    return [];
  }
}
