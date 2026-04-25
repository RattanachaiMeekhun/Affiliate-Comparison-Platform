'use client';

import { motion } from 'framer-motion';
import {
  BellOutlined,
  SettingOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedPage, { ScrollReveal } from '@/components/AnimatedLayout/AnimatedLayout';
import { Product, Category } from '@/services/api';
import { useCurrency } from '@/context/CurrencyContext';
import { formatPrice } from '@/services/formatters';
import styles from './page.module.css';

interface ProductClientProps {
  product: Product;
  category: Category | null;
}

export default function ProductClient({ product, category }: ProductClientProps) {
  const { selectedCurrency, rates } = useCurrency();

  const specs = product.specs || {};
  const bestPrice =
    product.affiliate_products.length > 0
      ? Math.min(
          ...product.affiliate_products.map((p) => Number(p.price) || 0).filter((p) => p > 0)
        )
      : Number(product.price) || 0;

  const imgUrl =
    product.image_url ||
    product.affiliate_products.find((p) => p.image_url)?.image_url ||
    '/no-image.png';

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
          <Link href="/category">Categories</Link>
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
              <div className={styles.heroImage} style={{ position: 'relative', height: 250, width: '100%' }}>
                <Image
                  src={imgUrl}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
              <div className={styles.heroBadges}>
                {product.best_value && <span className="badge badge-danger">Best Value</span>}
                {specs.brand && <span className="badge badge-primary">{specs.brand}</span>}
              </div>
              <h1 className={styles.heroProductName}>{product.name}</h1>
              <p className={styles.heroSpecs}>
                {Object.entries(specs)
                  .slice(0, 4)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' • ')}
              </p>
            </motion.div>

            {/* Rating & Price Bar */}
            <ScrollReveal>
              <div className={styles.ratingPriceBar}>
                <div className={styles.ratingBlock}>
                  <span className={styles.ratingScore}>{product.trending_score || 'N/A'}</span>
                  <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: 14 }}>Trending Score</strong>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Based on AI analysis
                    </span>
                  </div>
                </div>
                <div className={styles.priceBlock}>
                  <div className={styles.priceLabel}>Best Available Price</div>
                  <div>
                    {bestPrice > 0 ? (
                      <span className={styles.priceValue}>
                        {formatPrice(bestPrice, product.currency || 'THB', selectedCurrency, rates)}
                      </span>
                    ) : (
                      <span className={styles.priceValue}>Check Listings</span>
                    )}
                  </div>

                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'https://api.stacknodes.net'}/affiliate/amazon-search?q=${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.amazonBtn}
                  >
                    <ShopOutlined /> Buy on Amazon
                  </a>

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
                          <span className={styles.specKey} style={{ textTransform: 'capitalize' }}>
                            {k}
                          </span>
                          <span className={styles.specVal}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: 20, color: 'var(--text-muted)' }}>
                      No detailed specifications available.
                    </div>
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

              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'https://api.stacknodes.net'}/affiliate/amazon-search?q=${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.amazonBtn}
                style={{ marginBottom: 16 }}
              >
                <ShopOutlined /> Buy on Amazon
              </a>

              {product.affiliate_products.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Also Available On
                  </div>
                  {product.affiliate_products.map((mp, i) => {
                    const sourceLower = mp.source_name.toLowerCase();
                    const sourceColor = sourceLower.includes('amazon') ? '#FF9900'
                      : sourceLower.includes('shopee') ? '#EE4D2D'
                      : sourceLower.includes('lazada') ? '#0F146D'
                      : '#2563EB';

                    return (
                      <motion.div
                        key={mp.id || i}
                        className={styles.buyOption}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                      >
                        <div className={styles.buyLeft}>
                          <div className={styles.buyIcon} style={{ background: sourceColor }}>
                            <ShopOutlined />
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div
                              className={styles.buyName}
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '120px',
                              }}
                            >
                              {mp.source_name}
                            </div>
                            <div className={styles.buyShipping}>
                              {mp.price && Number(mp.price) > 0
                                ? formatPrice(mp.price, mp.currency || 'THB', selectedCurrency, rates)
                                : 'Check Price'}
                            </div>
                          </div>
                        </div>
                        <div className={styles.buyRight}>
                          <a
                            href={mp.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.buyLink}
                            style={{ textDecoration: 'none' }}
                          >
                            View Deal →
                          </a>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  lineHeight: '1.4',
                }}
              >
                As an Amazon Associate I earn from qualifying purchases.
              </div>
            </div>

            {/* AI Verdict */}
            {(aiVerdict || product.ai_insight) && (
              <div className={styles.verdictPanel}>
                <h3 className={styles.verdictTitle}>AI Analysis</h3>
                {aiVerdict?.pros &&
                  aiVerdict?.pros.map((pro: string, i: number) => (
                    <div key={`pro-${i}`} className={styles.verdictItem}>
                      <CheckCircleFilled className={styles.verdictPro} />
                      <span>{pro}</span>
                    </div>
                  ))}
                {aiVerdict?.cons &&
                  aiVerdict?.cons.map((con: string, i: number) => (
                    <div key={`con-${i}`} className={styles.verdictItem}>
                      <CloseCircleFilled className={styles.verdictCon} />
                      <span>{con}</span>
                    </div>
                  ))}

                {!aiVerdict?.pros && !aiVerdict?.cons && typeof product.ai_insight === 'string' && (
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

      {/* Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: imgUrl,
            description: product.description || `Buy ${product.name} at best prices.`,
            brand: {
              '@type': 'Brand',
              name: specs.brand || 'Unbranded',
            },
            offers: {
              '@type': 'Offer',
              url: `https://stacknodes.net/products/${product.slug}`,
              priceCurrency: product.currency || 'USD',
              price: bestPrice,
              availability: bestPrice > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
          }),
        }}
      />
    </AnimatedPage>
  );
}
