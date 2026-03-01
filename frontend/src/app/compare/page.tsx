'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider, Select } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import AnimatedPage, { ScrollReveal, staggerItem } from '@/components/AnimatedLayout/AnimatedLayout';
import { mockProducts } from '@/lib/mockData';
import styles from './page.module.css';

const brands = ['Apple', 'Dell', 'ASUS', 'Lenovo'];
const componentTypes = ['Gaming Laptops', 'Ultrabooks', 'Creator Laptops'];

export default function ComparePage() {
  const [priceRange, setPriceRange] = useState<[number, number]>([800, 2500]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Apple']);
  const [activeChips] = useState(['Apple', '$800 - $2500', 'Gaming Laptops']);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  return (
    <AnimatedPage>
      <div className={styles.pageWrapper}>
        {/* ═══════ Sidebar Filters ═══════ */}
        <motion.aside
          className={styles.sidebar}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className={styles.sidebarTitle}>Filters</h2>
          <p className={styles.resultCount}>Refining 142 results</p>

          {/* Price Range */}
          <div className={styles.filterGroup}>
            <div className={styles.filterGroupHeader}>
              <span className={styles.filterLabel}>Price Range</span>
            </div>
            <Slider
              range
              min={0}
              max={5000}
              step={100}
              value={priceRange}
              onChange={(val) => setPriceRange(val as [number, number])}
              styles={{
                track: { background: '#2563EB' },
                handle: { borderColor: '#2563EB' },
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
              <span>$ {priceRange[0].toLocaleString()}</span>
              <span>$ {priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Component Type */}
          <div className={styles.filterGroup}>
            <div className={styles.filterGroupHeader}>
              <span className={styles.filterLabel}>Component Type</span>
            </div>
            {componentTypes.map((type, i) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                <input type="checkbox" defaultChecked={i === 0} style={{ accentColor: '#2563EB' }} />
                <span>{type}</span>
              </div>
            ))}
          </div>

          {/* Brand */}
          <div className={styles.filterGroup}>
            <div className={styles.filterGroupHeader}>
              <span className={styles.filterLabel}>Brand</span>
            </div>
            <div className={styles.brandPills}>
              {brands.map((brand) => (
                <button
                  key={brand}
                  className={`${styles.brandPill} ${
                    selectedBrands.includes(brand) ? styles.brandPillActive : ''
                  }`}
                  onClick={() => toggleBrand(brand)}
                >
                  {selectedBrands.includes(brand) && '✓ '}
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Pro Tip */}
          <div className={styles.proTipBox}>
            <div className={styles.proTipLabel}>
              <BulbOutlined /> Pro Tip
            </div>
            <p className={styles.proTipText}>
              RTX 4060 options offer the best price-to-performance ratio
              for 1080p gaming right now.
            </p>
          </div>
        </motion.aside>

        {/* ═══════ Main Content ═══════ */}
        <div className={styles.mainContent}>
          {/* Active filters */}
          <div className={styles.activeFilters}>
            <span className={styles.activeFilterLabel}>Active Filters:</span>
            {activeChips.map((chip) => (
              <span key={chip} className={styles.filterChip}>
                {chip} ×
              </span>
            ))}
            <button className={styles.clearAll}>Clear all</button>
          </div>

          <div className={styles.sortBar}>
            <Select
              defaultValue="best-match"
              variant="borderless"
              style={{ fontSize: 13 }}
              options={[
                { value: 'best-match', label: 'Sort by: Best Match' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
                { value: 'rating', label: 'Highest Rated' },
              ]}
            />
          </div>

          {/* Product Table */}
          <ScrollReveal>
            <div className={styles.productTable}>
              <div className={styles.tableHeader}>
                <span>Product</span>
                <span>Key Specs</span>
                <span>Trend</span>
                <span style={{ textAlign: 'right' }}>Marketplace Price</span>
              </div>

              {mockProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={staggerItem}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.08 }}
                >
                  <Link href={`/products/${product.slug}`} className={styles.tableRow}>
                    {/* Product */}
                    <div className={styles.productCell}>
                      <div className={styles.productThumb}>
                        <Image src={product.image} alt={product.name} width={40} height={40} />
                      </div>
                      <div className={styles.productMeta}>
                        <h3>{product.name}</h3>
                        <div className={styles.productMetaSub}>
                          <span className={styles.metaTag}>{product.brand}</span>
                          <span className={styles.metaTag}>{product.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className={styles.specsCell}>
                      {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
                        <span key={key} className={styles.specItem}>
                          <span className={styles.specIcon}>•</span> {val}
                        </span>
                      ))}
                    </div>

                    {/* Trend */}
                    <div className={styles.trendCell}>
                      <svg className={styles.sparkline} viewBox="0 0 80 30">
                        <polyline
                          points={product.priceHistory
                            .map((p, i) => `${(i / (product.priceHistory.length - 1)) * 76 + 2},${30 - ((p.price - Math.min(...product.priceHistory.map(h => h.price))) / (Math.max(...product.priceHistory.map(h => h.price)) - Math.min(...product.priceHistory.map(h => h.price)) || 1)) * 26}`)
                            .join(' ')}
                          fill="none"
                          stroke={product.trend === 'down' ? '#10B981' : product.trend === 'up' ? '#EF4444' : '#9CA3AF'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span
                        className={styles.trendLabel}
                        style={{ color: product.trend === 'down' ? '#10B981' : product.trend === 'up' ? '#EF4444' : '#9CA3AF' }}
                      >
                        {product.trend === 'down' ? `↓ ${product.trendPercent}% drop` : product.trend === 'up' ? `↑ ${product.trendPercent}%` : '— Stable'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className={styles.priceCell}>
                      <span className={styles.priceCellValue}>
                        ${product.prices[0].price.toLocaleString()}
                      </span>
                      <div className={styles.priceActions}>
                        <span className={styles.detailsBtn}>Details</span>
                        <span
                          className={styles.marketplaceBtn}
                          style={{ background: product.prices[0].color }}
                        >
                          {product.prices[0].marketplace} →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>

          {/* Pagination */}
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>Showing 1 to {mockProducts.length} of 142 results</span>
            {[1, 2, 3, '...', 12].map((p, i) => (
              <button
                key={i}
                style={{
                  width: 32,
                  height: 32,
                  border: p === 1 ? 'none' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: p === 1 ? 'var(--primary)' : 'white',
                  color: p === 1 ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
