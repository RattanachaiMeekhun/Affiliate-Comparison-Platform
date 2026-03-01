export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  specs: Record<string, string>;
  tags: string[];
  prices: MarketplacePrice[];
  priceHistory: PricePoint[];
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  aiVerdict?: AIVerdict;
}

export interface MarketplacePrice {
  marketplace: string;
  price: number;
  originalPrice?: number;
  url: string;
  shipping: string;
  color: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface AIVerdict {
  score: number;
  pros: string[];
  cons: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  productCount: number;
}

export interface FilterState {
  priceRange: [number, number];
  brands: string[];
  componentTypes: string[];
  sortBy: string;
}

export interface SetupStep {
  id: number;
  title: string;
  description: string;
  options: SetupOption[];
}

export interface SetupOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}
