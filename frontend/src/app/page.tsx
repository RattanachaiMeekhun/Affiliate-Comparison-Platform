'use client';

import { motion } from 'framer-motion';
import AnimatedPage from '@/components/AnimatedLayout/AnimatedLayout';
import { Category, fetchCategories, fetchProducts, Product } from '@/services/api';
import { useCurrency } from '@/context/CurrencyContext';
import { mockCategories } from '@/util/mockData';
import styles from './page.module.css';

// New Modular Components
import Hero from '@/components/Home/Hero';
import CategorySection from '@/components/Home/CategorySection';
import ProductSection from '@/components/Home/ProductSection';
import WhySection from '@/components/Home/WhySection';
import HowItWorks from '@/components/Home/HowItWorks';
import FaqSection from '@/components/Home/FaqSection';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const { selectedCurrency, rates } = useCurrency();
  const [activeTab, setActiveTab] = useState('All Categories');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats] = await Promise.all([
          fetchProducts(undefined, 0, ITEMS_PER_PAGE),
          fetchCategories(),
        ]);
        console.log({ cats });

        setProducts(prods);
        setCategories(cats);
        setHasMore(prods.length === ITEMS_PER_PAGE);
      } catch (err) {
        console.error('Error loading home page data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (visibleCount > ITEMS_PER_PAGE) {
      async function loadMore() {
        try {
          const categorySlug =
            activeTab === 'All Categories'
              ? undefined
              : categories.find((c) => c.name === activeTab)?.slug;
          const skip = visibleCount - ITEMS_PER_PAGE;
          const moreProds = await fetchProducts(categorySlug, skip, ITEMS_PER_PAGE);
          setProducts((prev) => {
            // Avoid duplicate additions from strict mode double invocation
            const existingIds = new Set(prev.map((p) => p.id));
            const newProds = moreProds.filter((p) => !existingIds.has(p.id));
            return [...prev, ...newProds];
          });
          setHasMore(moreProds.length === ITEMS_PER_PAGE);
        } catch (err) {
          console.error('Error loading more products', err);
        }
      }
      loadMore();
    }
  }, [visibleCount, activeTab, categories]);

  async function handleTabClick(categoryName: string) {
    setActiveTab(categoryName);
    setIsLoading(true);
    setVisibleCount(ITEMS_PER_PAGE);
    try {
      const categorySlug =
        categoryName === 'All Categories'
          ? undefined
          : categories.find((c) => c.name === categoryName)?.slug;

      const prods = await fetchProducts(categorySlug, 0, ITEMS_PER_PAGE);
      setProducts(prods);
      setHasMore(prods.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error('Error filtering products', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatedPage>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 40 }}>
        <Hero />

        <CategorySection categories={mockCategories} />

        <ProductSection
          products={products}
          categories={categories}
          activeTab={activeTab}
          isLoading={isLoading}
          hasMore={hasMore}
          selectedCurrency={selectedCurrency}
          rates={rates}
          onTabChange={handleTabClick}
          onLoadMore={() => setVisibleCount((prev) => prev + 8)}
        />

        <WhySection />
        <HowItWorks />
        <FaqSection />
      </div>
    </AnimatedPage>
  );
}
