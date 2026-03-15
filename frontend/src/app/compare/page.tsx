'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Slider, Select } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import AnimatedPage, { ScrollReveal, staggerItem } from '@/components/AnimatedLayout/AnimatedLayout';
import { fetchProducts, Product } from '@/lib/api';
import styles from './page.module.css';

const brands = ['Apple', 'Dell', 'ASUS', 'Lenovo'];
const componentTypes = ['Gaming Laptops', 'Ultrabooks', 'Creator Laptops'];

export default function ComparePage() {
  const [priceRange, setPriceRange] = useState<[number, number]>([800, 2500]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Apple']);
  const [activeChips] = useState(['Apple', '$800 - $2500', 'Gaming Laptops']);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const prods = await fetchProducts();
        setProducts(prods);
      } catch (err) {
        console.error("Error loading compare page data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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
          <p className={styles.resultCount}>Refining {products.length} results</p>

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

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Loading products...</div>
          ) : (
            <>
            {/* Product Table */}
            <ScrollReveal>
              <div className={styles.productTable}>
                <div className={styles.tableHeader}>
                  <span>Product</span>
                  <span>Key Specs</span>
                  <span>Trend</span>
                  <span style={{ textAlign: 'right' }}>Marketplace Price</span>
                </div>

                {products.map((product, index) => {
                  const bestPrice = product.affiliate_products.length > 0 
                      ? Math.min(...product.affiliate_products.map(p => Number(p.price) || 0).filter(p => p > 0)) 
                      : Number(product.price) || 0;
                  
                  const imgUrl = product.affiliate_products.find(p => p.image_url)?.image_url || '/placeholder.png';
                  
                  const specs = product.specs || {};
                  
                  return (
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
                            <img
                              src={imgUrl}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/40?text=No+Image'; }}
                            />
                          </div>
                          <div className={styles.productMeta}>
                            <h3>{product.name}</h3>
                            <div className={styles.productMetaSub}>
                              <span className={styles.metaTag}>{specs.brand || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Specs */}
                        <div className={styles.specsCell}>
                          {Object.entries(specs).slice(0, 3).map(([key, val]) => (
                            <span key={key} className={styles.specItem}>
                              <span className={styles.specIcon}>•</span> {String(val)}
                            </span>
                          ))}
                        </div>

                        {/* Trend */}
                        <div className={styles.trendCell}>
                          <span
                            className={styles.trendLabel}
                            style={{ color: '#9CA3AF' }}
                          >
                            Score: {product.trending_score || 'N/A'}
                          </span>
                        </div>

                        {/* Price */}
                        <div className={styles.priceCell}>
                          {bestPrice > 0 ? (
                            <span className={styles.priceCellValue}>
                              ${bestPrice.toLocaleString()}
                            </span>
                          ) : (
                            <span className={styles.priceCellValue}>
                              View Prices
                            </span>
                          )}
                          <div className={styles.priceActions}>
                            <span className={styles.detailsBtn}>Details</span>
                            {product.affiliate_products.length > 0 && (
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/affiliate/go/${product.affiliate_products[0].id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.marketplaceBtn}
                              style={{ background: '#2563EB', textDecoration: 'none' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {product.affiliate_products[0].source_name} →
                            </a>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollReveal>

            {/* Pagination */}
            <div className={styles.pagination}>
              <span className={styles.pageInfo}>Showing 1 to {products.length} results</span>
              {[1, 2, 3, '...'].map((p, i) => (
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
            </>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
