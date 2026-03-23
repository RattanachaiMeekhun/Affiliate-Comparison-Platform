'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider, Select, Checkbox, Button, Modal, Empty, Badge } from 'antd';
import { BulbOutlined, SwapOutlined, CloseOutlined, CheckCircleOutlined } from '@ant-design/icons';
import AnimatedPage, {
  ScrollReveal,
  staggerItem,
} from '@/components/AnimatedLayout/AnimatedLayout';
import { fetchProducts, Product } from '@/services/api';
import { useCurrency } from '@/context/CurrencyContext';
import { useCompare } from '@/context/CompareContext';
import { formatPrice } from '@/services/formatters';
import styles from './page.module.css';

export default function ComparePage() {
  const router = useRouter();
  const { selectedCurrency, rates } = useCurrency();
  const { compareItems, addToCompare, removeFromCompare, clearCompare, isCompareModalOpen, setIsCompareModalOpen } = useCompare();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
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

        // Update price range max based on actual data
        if (prods && prods.length > 0) {
          const maxP = Math.max(...prods.map((p) => Number(p.price) || 0));
          setPriceRange([0, Math.ceil(maxP / 1000) * 1000 || 100000]);
        }
      } catch (err) {
        console.error('Error loading compare page data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // ═══════ Dynamic Filter Options ═══════
  const dynamicBrands = useMemo(() => {
    const bSet = new Set<string>();
    products.forEach((p) => {
      if (p.specs?.brand) bSet.add(p.specs.brand);
    });
    return Array.from(bSet).sort();
  }, [products]);

  const dynamicTypes = useMemo(() => {
    const tSet = new Set<string>();
    products.forEach(p => {
      if (p.specs?.type) tSet.add(p.specs.type);
      else if (p.category_name) tSet.add(p.category_name);
      else if (p.category_id) tSet.add('Category ' + p.category_id); // Fallback
    });
    return Array.from(tSet).sort();
  }, [products]);

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

      let productType = '';
      if (product.specs?.type) {
        productType = product.specs.type;
      } else if (product.category_name) {
        productType = product.category_name;
      } else if (product.category_id) {
        productType = 'Category ' + product.category_id;
      }

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(productType);

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
    if (priceRange[0] > 0 || priceRange[1] < 100000) {
      chips.push(
        `${formatPrice(priceRange[0], 'THB', selectedCurrency, rates)} - ${formatPrice(priceRange[1], 'THB', selectedCurrency, rates)}`
      );
    }
    selectedBrands.forEach((b) => chips.push(b));
    selectedTypes.forEach((t) => chips.push(t));
    return chips;
  }, [priceRange, selectedBrands, selectedTypes, selectedCurrency, rates]);

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
    setPriceRange([0, 100000]);
    setSelectedBrands([]);
    setSelectedTypes([]);
    setCurrentPage(1);
  };

  const removeChip = (chip: string) => {
    if (chip.includes(selectedCurrency) || chip.includes(' - ')) {
      setPriceRange([0, 100000]);
    } else if (dynamicBrands.includes(chip)) {
      setSelectedBrands((prev) => prev.filter((b) => b !== chip));
    } else if (dynamicTypes.includes(chip)) {
      setSelectedTypes((prev) => prev.filter((t) => t !== chip));
    }
    setCurrentPage(1);
  };

  const toggleProductSelection = (product: Product) => {
    const isCompared = compareItems.some((item) => item.id === product.id);
    if (isCompared) {
      removeFromCompare(product.id);
    } else {
      const bestPrice =
        product.affiliate_products.length > 0
          ? Math.min(
              ...product.affiliate_products
                .map((p) => Number(p.price) || 0)
                .filter((p) => p > 0)
            )
          : Number(product.price) || 0;

      addToCompare({
        id: product.id,
        name: product.name,
        imageUrl: product.image_url || '/placeholder.png',
        category: product.category_name || 'Unknown',
        price: bestPrice,
      });
    }
  };

  const selectedProductsForComparison = useMemo(() => {
    return products.filter((p) => compareItems.some((item) => item.id === p.id));
  }, [products, compareItems]);

  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    selectedProductsForComparison.forEach((p) => {
      if (p.specs) {
        Object.keys(p.specs).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [selectedProductsForComparison]);

  return (
    <>
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
              max={100000}
              step={1000}
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
              <span>{formatPrice(priceRange[0], 'THB', selectedCurrency, rates)}</span>
              <span>{formatPrice(priceRange[1], 'THB', selectedCurrency, rates)}</span>
            </div>
          </div>

          {/* Component Type */}
          <div className={styles.filterGroup}>
            <div className={styles.filterGroupHeader}>
              <span className={styles.filterLabel}>Product Type</span>
            </div>
            {dynamicTypes.length > 0 ? (
              dynamicTypes.map((type) => (
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
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                  />
                  <span>{type}</span>
                </div>
              ))
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No types available</span>
            )}
          </div>

          {/* Brand */}
          <div className={styles.filterGroup}>
            <div className={styles.filterGroupHeader}>
              <span className={styles.filterLabel}>Brand</span>
            </div>
            <div className={styles.brandPills}>
              {dynamicBrands.length > 0 ? (
                dynamicBrands.map((brand) => (
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
                ))
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  No brands available
                </span>
              )}
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Checkbox
                        checked={
                          paginatedProducts.length > 0 &&
                          paginatedProducts.every((p) => compareItems.some((item) => item.id === p.id))
                        }
                        indeterminate={
                          paginatedProducts.some((p) => compareItems.some((item) => item.id === p.id)) &&
                          !paginatedProducts.every((p) => compareItems.some((item) => item.id === p.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            paginatedProducts.forEach((p) => {
                              if (!compareItems.some((item) => item.id === p.id)) {
                                toggleProductSelection(p);
                              }
                            });
                          } else {
                            paginatedProducts.forEach((p) => {
                              if (compareItems.some((item) => item.id === p.id)) {
                                removeFromCompare(p.id);
                              }
                            });
                          }
                        }}
                      />
                      Product
                    </span>
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
                        className={`${styles.tableRow} ${compareItems.some((item) => item.id === product.id) ? styles.tableRowSelected : ''}`}
                        onClick={() => router.push(`/products/${product.slug}`)}
                      >
                        {/* Product */}
                        <div className={styles.productCell}>
                          <div onClick={(e) => e.stopPropagation()} style={{ marginRight: 8 }}>
                            <Checkbox
                              checked={compareItems.some((item) => item.id === product.id)}
                              onChange={() => toggleProductSelection(product)}
                            />
                          </div>
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
                              {product.category_name && (
                                <span className={styles.categoryTag}>{product.category_name}</span>
                              )}
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
                              {formatPrice(
                                bestPrice,
                                product.currency || 'THB',
                                selectedCurrency,
                                rates
                              )}
                            </span>
                          ) : (
                            <span className={styles.priceCellValue}>View Prices</span>
                          )}
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



      <Modal
        title={null}
        open={isCompareModalOpen}
        onCancel={() => setIsCompareModalOpen(false)}
        footer={null}
        width={1000}
        centered
        className={styles.compareModal}
        closeIcon={<CloseOutlined style={{ color: 'white' }} />}
      >
        <div className={styles.compareModalHeader}>
          <h2>Product Comparison</h2>
          <p>Side-by-side technical specification analysis</p>
        </div>

        <div className={styles.compareScrollContainer}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th className={styles.specHeaderCell}>Specifications</th>
                {selectedProductsForComparison.map((p) => (
                  <th key={p.id} className={styles.productHeaderCell}>
                    <div className={styles.compProductThumb}>
                      <img src={p.image_url || '/no-image.png'} alt={p.name} />
                    </div>
                    <div className={styles.compProductName}>{p.name}</div>
                    {p.category_name && (
                      <div style={{ fontSize: '11px', color: 'var(--primary)', marginBottom: 8 }}>
                        {p.category_name}
                      </div>
                    )}
                    <div className={styles.compProductPrice}>
                      {formatPrice(p.price, p.currency || 'THB', selectedCurrency, rates)}
                    </div>
                    <Button
                      danger
                      size="small"
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() => toggleProductSelection(p)}
                    >
                      Remove
                    </Button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.specLabelCell}>Trending Score</td>
                {selectedProductsForComparison.map((p) => (
                  <td key={p.id} className={styles.specValueCell}>
                    <Badge count={p.trending_score} color="var(--primary)" />
                  </td>
                ))}
              </tr>
              {allSpecKeys.map((key) => (
                <tr key={key}>
                  <td className={styles.specLabelCell} style={{ textTransform: 'capitalize' }}>
                    {key}
                  </td>
                  {selectedProductsForComparison.map((p) => (
                    <td key={p.id} className={styles.specValueCell}>
                      {p.specs?.[key] ? (
                        <div className={styles.specValueBox}>
                          <CheckCircleOutlined style={{ color: '#10B981', marginRight: 4 }} />
                          {String(p.specs[key])}
                        </div>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {compareItems.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <Empty description="No products selected for comparison" />
            </div>
          )}
        </div>

        <div className={styles.compareModalFooter}>
          <Button size="large" onClick={() => setIsCompareModalOpen(false)}>
            Close Comparison
          </Button>
        </div>
      </Modal>
    </>
  );
}
