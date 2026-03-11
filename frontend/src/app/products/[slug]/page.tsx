'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BellOutlined, SettingOutlined, CheckCircleFilled, CloseCircleFilled, InfoCircleOutlined, ShopOutlined } from '@ant-design/icons';
import AnimatedPage, { ScrollReveal } from '@/components/AnimatedLayout/AnimatedLayout';
import { fetchProducts, Product, Category, fetchCategories } from '@/lib/api';
import styles from './page.module.css';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allProds, allCats] = await Promise.all([fetchProducts(), fetchCategories()]);
        
        const foundProd = allProds.find(p => p.slug === slug);
        if (foundProd) {
          setProduct(foundProd);
          
          if (foundProd.category_id) {
            const foundCat = allCats.find(c => c.id === foundProd.category_id);
            if (foundCat) setCategory(foundCat);
          }
        }
      } catch (err) {
        console.error("Error loading product page data", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (slug) {
      loadData();
    }
  }, [slug]);

  if (isLoading) {
    return <AnimatedPage><div style={{ textAlign: 'center', padding: 100 }}>Loading product...</div></AnimatedPage>;
  }

  if (!product) {
    return <AnimatedPage><div style={{ textAlign: 'center', padding: 100 }}>Product not found</div></AnimatedPage>;
  }

  const specs = product.specs || {};
  const bestPrice = product.affiliate_products.length > 0
    ? Math.min(...product.affiliate_products.map(p => Number(p.price) || 0).filter(p => p > 0))
    : Number(product.price) || 0;
  
  const imgUrl = product.image_url || product.affiliate_products.find(p => p.image_url)?.image_url || '/placeholder.png';

  // Parse AI insight if it's a JSON string, otherwise just display it as text
  let aiVerdict: any = null;
  if (product.ai_insight) {
    try {
      aiVerdict = JSON.parse(product.ai_insight);
    } catch {
      // It's just text
    }
  }

  return (
    <AnimatedPage>
      <div className={styles.pageContainer}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <Link href="/categories">Categories</Link>
          {category && (
            <>
              <span className={styles.breadcrumbSep}>›</span>
              <Link href={`/category/${category.slug}`}>{category.name}</Link>
            </>
          )}
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </div>

        <div className={styles.productLayout}>
          {/* ═══ Main column ═══ */}
          <div>
            {/* Hero */}
            <motion.div
              className={styles.productHero}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className={styles.heroImage}>
                <img 
                  src={imgUrl} 
                  alt={product.name} 
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className={styles.heroBadges}>
                {product.best_value && (
                  <span className="badge badge-danger">Best Value</span>
                )}
                {specs.brand && (
                  <span className="badge badge-primary">{specs.brand}</span>
                )}
              </div>
              <h1 className={styles.heroProductName}>{product.name}</h1>
              <p className={styles.heroSpecs}>
                {Object.entries(specs).slice(0, 4).map(([k,v]) => `${k}: ${v}`).join(' • ')}
              </p>
            </motion.div>

            {/* Rating & Price Bar */}
            <ScrollReveal>
              <div className={styles.ratingPriceBar}>
                <div className={styles.ratingBlock}>
                  <span className={styles.ratingScore}>{product.trending_score || 'N/A'}</span>
                  <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: 14 }}>Trending Score</strong>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Based on AI analysis</span>
                  </div>
                </div>
                <div className={styles.priceBlock}>
                  <div className={styles.priceLabel}>Best Available Price</div>
                  <div>
                    {bestPrice > 0 ? (
                      <span className={styles.priceValue}>${bestPrice.toLocaleString()}</span>
                    ) : (
                      <span className={styles.priceValue}>Check Listings</span>
                    )}
                  </div>
                  <motion.button
                    className={styles.trackBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <BellOutlined /> Track Price Alerts
                  </motion.button>
                </div>
              </div>
            </ScrollReveal>

            {/* Technical Specifications */}
            <ScrollReveal>
              <div className={styles.specsSection}>
                <div className={styles.specsHeader}>
                  <h2 className={styles.specsTitle}>
                    <SettingOutlined /> Technical Specifications
                  </h2>
                </div>
                <div className={styles.specsGrid}>
                  {Object.entries(specs).length > 0 ? (
                    <div className={styles.specGroup} style={{ flex: '1 1 100%' }}>
                      {Object.entries(specs).map(([k, v]) => (
                        <div key={k} className={styles.specRow}>
                          <span className={styles.specKey} style={{ textTransform: 'capitalize' }}>{k}</span>
                          <span className={styles.specVal}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: 20, color: 'var(--text-muted)' }}>No detailed specifications available.</div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* ═══ Sidebar ═══ */}
          <motion.aside
            className={styles.sidebarPanel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Where to Buy */}
            <div className={styles.buyPanel}>
              <h3 className={styles.buyTitle}>🛒 Where to Buy</h3>
              {product.affiliate_products.length > 0 ? (
                product.affiliate_products.map((mp, i) => (
                  <motion.div
                    key={mp.id || i}
                    className={styles.buyOption}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <div className={styles.buyLeft}>
                      <div className={styles.buyIcon} style={{ background: '#2563EB' }}>
                        <ShopOutlined />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div className={styles.buyName} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                            {mp.source_name}
                        </div>
                        <div className={styles.buyShipping}>{(mp.price && Number(mp.price) > 0) ? `${mp.currency} ${Number(mp.price).toLocaleString()}` : 'Check Price'}</div>
                      </div>
                    </div>
                    <div className={styles.buyRight}>
                      <a href={mp.source_url} target="_blank" rel="noopener noreferrer" className={styles.buyLink} style={{ textDecoration: 'none' }}>
                        View Deal →
                      </a>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                  No active listings found for this product.
                </div>
              )}
            </div>

            {/* AI Verdict */}
            {(aiVerdict || product.ai_insight) && (
              <div className={styles.verdictPanel}>
                <h3 className={styles.verdictTitle}>AI Analysis</h3>
                {aiVerdict?.pros && aiVerdict?.pros.map((pro: string, i: number) => (
                  <div key={`pro-${i}`} className={styles.verdictItem}>
                    <CheckCircleFilled className={styles.verdictPro} />
                    <span>{pro}</span>
                  </div>
                ))}
                {aiVerdict?.cons && aiVerdict?.cons.map((con: string, i: number) => (
                  <div key={`con-${i}`} className={styles.verdictItem}>
                    <CloseCircleFilled className={styles.verdictCon} />
                    <span>{con}</span>
                  </div>
                ))}
                
                {(!aiVerdict?.pros && !aiVerdict?.cons && typeof product.ai_insight === 'string') && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <InfoCircleOutlined style={{ marginRight: 6, color: 'var(--primary)' }} />
                    {product.ai_insight}
                  </div>
                )}
              </div>
            )}
          </motion.aside>
        </div>
      </div>
    </AnimatedPage>
  );
}
