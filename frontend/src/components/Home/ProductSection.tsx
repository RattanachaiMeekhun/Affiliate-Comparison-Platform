'use client';

import { ScrollReveal, StaggerWrapper, StaggerChild } from '@/components/AnimatedLayout/AnimatedLayout';
import styles from '@/app/page.module.css';
import { Product, Category, CurrencyRate } from '@/services/api';
import ProductCard from './ProductCard';

interface ProductSectionProps {
  products: Product[];
  categories: Category[];
  activeTab: string;
  isLoading: boolean;
  hasMore: boolean;
  selectedCurrency: string;
  rates: CurrencyRate[];
  onTabChange: (name: string) => void;
  onLoadMore: () => void;
}

export default function ProductSection({
  products,
  categories,
  activeTab,
  isLoading,
  hasMore,
  selectedCurrency,
  rates,
  onTabChange,
  onLoadMore,
}: ProductSectionProps) {
  return (
    <>
      <ScrollReveal>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Trending Hardware Deals</h2>
          </div>
          <div className={styles.filterTabs}>
            <button
              key={'all'}
              className={`${styles.filterTab} ${
                activeTab === 'All Categories' ? styles.filterTabActive : ''
              }`}
              onClick={() => onTabChange('All Categories')}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.filterTab} ${
                  activeTab === category.name ? styles.filterTabActive : ''
                }`}
                onClick={() => onTabChange(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading products...</div>
      ) : (
        <StaggerWrapper className={styles.productGrid} animate="visible">
          {products.map((product) => (
            <StaggerChild key={product.id}>
              <ProductCard
                product={product}
                selectedCurrency={selectedCurrency}
                rates={rates}
              />
            </StaggerChild>
          ))}
        </StaggerWrapper>
      )}

      {!isLoading && hasMore && (
        <div className={styles.loadMoreContainer}>
          <button className={styles.loadMoreButton} onClick={onLoadMore}>
            Load More Deals
          </button>
        </div>
      )}
    </>
  );
}
