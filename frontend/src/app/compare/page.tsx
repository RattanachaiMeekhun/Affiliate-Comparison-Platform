'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Slider, Select } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import AnimatedPage, {
  ScrollReveal,
  staggerItem,
} from '@/components/AnimatedLayout/AnimatedLayout';
import { fetchProducts, Product } from '@/lib/api';
import styles from './page.module.css';

const brands = ['Apple', 'Dell', 'ASUS', 'Lenovo'];
const componentTypes = ['Gaming Laptops', 'Ultrabooks', 'Creator Laptops'];

export default function ComparePage() {
  const router = useRouter();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('best-match');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const prods = await fetchProducts();
        setProducts(prods || []);
      } catch (err) {
        console.error('Error loading compare page data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // ═══════ Processing Logic ═══════
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Filtering
    result = result.filter((product) => {
      const bestPrice =
        product.affiliate_products.length > 0
          ? Math.min(
              ...product.affiliate_products.map((p) => Number(p.price) || 0).filter((p) => p > 0)
            )
          : Number(product.price) || 0;

      const matchesPrice = bestPrice >= priceRange[0] && bestPrice <= priceRange[1];
      const matchesBrand =
        selectedBrands.length === 0 ||
        (product.specs?.brand && selectedBrands.includes(product.specs.brand));

      // For type, we check name or specs.category/type if available
      const productType = product.specs?.type || product.name || '';
      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.some((type) =>
          productType.toLowerCase().includes(type.split(' ')[0].toLowerCase())
        );

      return matchesPrice && matchesBrand && matchesType;
    });

    // Sorting
    result.sort((a, b) => {
      const getBestPrice = (p: Product) =>
        p.affiliate_products.length > 0
          ? Math.min(
              ...p.affiliate_products.map((ap) => Number(ap.price) || 0).filter((ap) => ap > 0)
            )
          : Number(p.price) || 0;

      if (sortBy === 'price-low') return getBestPrice(a) - getBestPrice(b);
      if (sortBy === 'price-high') return getBestPrice(b) - getBestPrice(a);
      if (sortBy === 'rating') return Number(b.trending_score) - Number(a.trending_score);
      return 0; // best-match is default order from API
    });

    return result;
  }, [products, priceRange, selectedBrands, selectedTypes, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedProducts.slice(start, start + pageSize);
  }, [processedProducts, currentPage]);

  const activeChips = useMemo(() => {
    const chips: string[] = [];
    if (priceRange[0] > 0 || priceRange[1] < 5000) {
      chips.push(`$${priceRange[0]} - $${priceRange[1]}`);
    }
    selectedBrands.forEach((b) => chips.push(b));
    selectedTypes.forEach((t) => chips.push(t));
    return chips;
  }, [priceRange, selectedBrands, selectedTypes]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const clearAll = () => {
    setPriceRange([0, 5000]);
    setSelectedBrands([]);
    setSelectedTypes([]);
    setCurrentPage(1);
  };

  const removeChip = (chip: string) => {
    if (chip.includes('$')) {
      setPriceRange([0, 5000]);
    } else if (brands.includes(chip)) {
      setSelectedBrands((prev) => prev.filter((b) => b !== chip));
    } else if (componentTypes.includes(chip)) {
      setSelectedTypes((prev) => prev.filter((t) => t !== chip));
    }
    setCurrentPage(1);
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: 'var(--text-muted)',
              }}
            >
              <span>$ {priceRange[0].toLocaleString()}</span>
              <span>$ {priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Component Type */}
          <div className={styles.filterGroup}>
            <div className={styles.filterGroupHeader}>
              <span className={styles.filterLabel}>Component Type</span>
            </div>
            {componentTypes.map((type) => (
              <div
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                  fontSize: 13,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                  style={{ accentColor: '#2563EB' }}
                />
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
              RTX 4060 options offer the best price-to-performance ratio for 1080p gaming right now.
            </p>
          </div>
        </motion.aside>

        {/* ═══════ Main Content ═══════ */}
        <div className={styles.mainContent}>
          {/* Active filters */}
          <div className={styles.activeFilters}>
            <span className={styles.activeFilterLabel}>Active Filters:</span>
            {activeChips.map((chip) => (
              <span
                key={chip}
                className={styles.filterChip}
                onClick={() => removeChip(chip)}
                style={{ cursor: 'pointer' }}
              >
                {chip} ×
              </span>
            ))}
            {activeChips.length > 0 && (
              <button className={styles.clearAll} onClick={clearAll}>
                Clear all
              </button>
            )}
          </div>

          <div className={styles.sortBar}>
            <Select
              value={sortBy}
              variant="borderless"
              style={{ fontSize: 13 }}
              onChange={(val) => setSortBy(val)}
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

                  {paginatedProducts.map((product, index) => {
                    const bestPrice =
                      product.affiliate_products.length > 0
                        ? Math.min(
                            ...product.affiliate_products
                              .map((p) => Number(p.price) || 0)
                              .filter((p) => p > 0)
                          )
                        : Number(product.price) || 0;

                    const imgUrl = product.image_url;

                    const specs = product.specs || {};

                    return (
                      <motion.div
                        key={product.id}
                        variants={staggerItem}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.08 }}
                        className={styles.tableRow}
                        onClick={() => router.push(`/products/${product.slug}`)}
                      >
                        {/* Product */}
                        <div className={styles.productCell}>
                          <div className={styles.productThumb}>
                            <img
                              src={imgUrl || '/no-image.png'}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                e.currentTarget.src = '/no-image.png';
                              }}
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
                          {Object.entries(specs)
                            .slice(0, 3)
                            .map(([key, val]) => (
                              <span key={key} className={styles.specItem}>
                                <span className={styles.specIcon}>•</span> {String(val)}
                              </span>
                            ))}
                        </div>

                        {/* Trend */}
                        <div className={styles.trendCell}>
                          <span className={styles.trendLabel} style={{ color: '#9CA3AF' }}>
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
                            <span className={styles.priceCellValue}>View Prices</span>
                          )}
                          <div className={styles.priceActions}>
                            <span className={styles.detailsBtn}>Details</span>
                            {product.affiliate_products.length > 0 && (
                              <a
                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/affiliate/go/${product.affiliate_products[0].id}`}
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
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollReveal>

              <div className={styles.pagination}>
                <span className={styles.pageInfo}>
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, processedProducts.length)} of{' '}
                  {processedProducts.length} results
                </span>
                {Array.from({ length: Math.ceil(processedProducts.length / pageSize) }).map(
                  (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        width: 32,
                        height: 32,
                        border: i + 1 === currentPage ? 'none' : '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        background: i + 1 === currentPage ? 'var(--primary)' : 'white',
                        color: i + 1 === currentPage ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {i + 1}
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
