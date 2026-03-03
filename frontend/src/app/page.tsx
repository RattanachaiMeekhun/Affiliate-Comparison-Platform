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
import { mockCategories, mockProducts } from '@/util/mockData';
import styles from './page.module.css';
import { useState } from 'react';

const tabFilters = ['GPUs', 'Laptops', 'Monitors'];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('GPUs');

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
              Stop guessing. Our AI analyzes thousands of benchmarks to find
              high-performance hardware tailored specifically for data science,
              3D rendering, and 4K video editing.
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
              View all niches <ArrowRightOutlined />
            </Link>
          </div>
        </ScrollReveal>

        <StaggerWrapper className={styles.categoryGrid}>
          {mockCategories.slice(0, 3).map((cat) => (
            <StaggerChild key={cat.id}>
              <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={`/category/${cat.slug}`}
                  className={styles.categoryCard}
                >
                  <div className={styles.categoryIcon}>{cat.icon}</div>
                  <h3 className={styles.categoryName}>{cat.name}</h3>
                  <p className={styles.categoryDesc}>{cat.description}</p>
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
              {tabFilters.map((tab) => (
                <button
                  key={tab}
                  className={`${styles.filterTab} ${
                    activeTab === tab ? styles.filterTabActive : ''
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <StaggerWrapper className={styles.productGrid}>
          {mockProducts.slice(0, 4).map((product) => (
            <StaggerChild key={product.id}>
              <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={`/products/${product.slug}`}
                  className={styles.productCard}
                >
                  {product.tags[0] && (
                    <div className={styles.productBadge}>
                      <span
                        className={`badge ${
                          product.tags[0] === 'Hot Deal'
                            ? 'badge-danger'
                            : 'badge-primary'
                        }`}
                      >
                        {product.tags[0]}
                      </span>
                    </div>
                  )}
                  <div className={styles.productImage}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={120}
                      height={120}
                    />
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.productPrice}>
                      <span className={styles.priceValue}>
                        ${product.prices[0].price.toLocaleString()}
                      </span>
                      {product.prices[0].originalPrice && (
                        <span className={styles.priceOriginal}>
                          ${product.prices[0].originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div
                      className={`${styles.productTrend} ${
                        product.trend === 'down'
                          ? styles.trendDown
                          : product.trend === 'up'
                          ? styles.trendUp
                          : styles.trendStable
                      }`}
                    >
                      {product.trend === 'down' && '↓'}
                      {product.trend === 'up' && '↑'}
                      {product.trend === 'stable' && '—'}
                      {product.trendPercent > 0
                        ? ` ${product.trendPercent}% this week`
                        : ' Stable price'}
                    </div>
                  </div>
                </Link>
              </motion.div>
            </StaggerChild>
          ))}
        </StaggerWrapper>
      </div>
    </AnimatedPage>
  );
}
