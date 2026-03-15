'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRightOutlined, ThunderboltOutlined } from '@ant-design/icons';
import AnimatedPage, {
  ScrollReveal,
  StaggerWrapper,
  StaggerChild,
} from '@/components/AnimatedLayout/AnimatedLayout';
import { Category, fetchCategories, fetchProducts, Product } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import { formatPrice } from '@/lib/formatters';
import { mockCategories } from '@/util/mockData';
import styles from './page.module.css';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const { selectedCurrency, rates } = useCurrency();
  const [activeTab, setActiveTab] = useState('All Categories');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, categories] = await Promise.all([fetchProducts(), fetchCategories()]);
        setProducts(prods);
        setCategories(categories);
      } catch (err) {
        console.error('Error loading home page data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <AnimatedPage>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 40 }}>
        {/* ═══════ Hero Section ═══════ */}
        <motion.section
          className={styles.heroSection}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.heroContent}>
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              Curated Deals for Professional Workflows
            </motion.h1>
            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              Stop guessing. Our AI analyzes thousands of benchmarks to find high-performance
              hardware tailored specifically for data science, 3D rendering, and 4K video editing.
            </motion.p>
            <motion.div
              className={styles.heroCtas}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/compare" className={styles.ctaPrimary}>
                  View Top Deals <ArrowRightOutlined />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/compare" className={styles.ctaSecondary}>
                  <ThunderboltOutlined /> Compare Specs
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* ═══════ Find Your Perfect Setup ═══════ */}
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Find Your Perfect Setup</h2>
              <p className={styles.sectionSubtitle}>
                Hardware recommendations optimized for your specific workflow requirements.
              </p>
            </div>
            <Link href="/setup-builder" className={styles.viewAll}>
              Setup Builder <ArrowRightOutlined />
            </Link>
          </div>
        </ScrollReveal>

        <StaggerWrapper className={styles.categoryGrid}>
          {mockCategories.map((category) => (
            <StaggerChild key={category.id}>
              <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Link href={`/category/${category.slug}`} className={styles.categoryCard}>
                  <div className={styles.categoryIcon}>{category.icon}</div>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <p className={styles.categoryDesc}>{category.description}</p>
                </Link>
              </motion.div>
            </StaggerChild>
          ))}
        </StaggerWrapper>

        {/* ═══════ Trending Hardware Deals ═══════ */}
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Trending Hardware Deals</h2>
            </div>
            <div className={styles.filterTabs}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`${styles.filterTab} ${
                    activeTab === category.name ? styles.filterTabActive : ''
                  }`}
                  onClick={() => setActiveTab(category.name)}
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
          <StaggerWrapper className={styles.productGrid}>
            {products.slice(0, 8).map((product) => {
              const bestPrice =
                product.affiliate_products.length > 0
                  ? Math.min(
                      ...product.affiliate_products
                        .map((p) => Number(p.price) || 0)
                        .filter((p) => p > 0)
                    )
                  : Number(product.price) || 0;

              const imgUrl = product.image_url || '/placeholder.png'; // Assume placeholder exists or fails gracefully

              return (
                <StaggerChild key={product.id}>
                  <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
                    <Link href={`/products/${product.slug}`} className={styles.productCard}>
                      {product.best_value && (
                        <div className={styles.productBadge}>
                          <span className="badge badge-danger">Best Value</span>
                        </div>
                      )}
                      <div className={styles.productImage}>
                        {/* Fallback image if cross-domain error */}
                        <img
                          src={imgUrl}
                          alt={product.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            e.currentTarget.src = '/no-image.png';
                          }}
                        />
                      </div>
                      <div className={styles.productInfo}>
                        <h3 className={styles.productName}>{product.name}</h3>
                        <div className={styles.productPrice}>
                          {bestPrice > 0 ? (
                            <span className={styles.priceValue}>
                              {formatPrice(
                                bestPrice,
                                product.currency || 'THB',
                                selectedCurrency,
                                rates
                              )}
                            </span>
                          ) : (
                            <span className={styles.priceValue}>View Prices</span>
                          )}
                        </div>

                        <div className={`${styles.productTrend} ${styles.trendStable}`}>
                          — Trending Score: {Number(product.trending_score) || 'N/A'}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </StaggerChild>
              );
            })}
          </StaggerWrapper>
        )}
      </div>
    </AnimatedPage>
  );
}
