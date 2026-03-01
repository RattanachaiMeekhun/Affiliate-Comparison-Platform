'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { BellOutlined, SettingOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import AnimatedPage, { ScrollReveal } from '@/components/AnimatedLayout/AnimatedLayout';
import { mockDellProduct } from '@/lib/mockData';
import styles from './page.module.css';

const chartTabs = ['1W', '1M', '3M', 'YTD'];

export default function ProductDetailPage() {
  const product = mockDellProduct;

  // Build chart path
  const points = product.priceHistory;
  const minP = Math.min(...points.map(p => p.price));
  const maxP = Math.max(...points.map(p => p.price));
  const range = maxP - minP || 1;
  const svgWidth = 700;
  const svgHeight = 180;
  const pad = 20;

  const linePath = points
    .map((p, i) => {
      const x = pad + (i / (points.length - 1)) * (svgWidth - pad * 2);
      const y = pad + (1 - (p.price - minP) / range) * (svgHeight - pad * 2);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const areaPath = linePath +
    ` L ${pad + (svgWidth - pad * 2)} ${svgHeight - pad}` +
    ` L ${pad} ${svgHeight - pad} Z`;

  return (
    <AnimatedPage>
      <div className={styles.pageContainer}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <a href="/">Home</a>
          <span className={styles.breadcrumbSep}>›</span>
          <a href="/compare">Laptops</a>
          <span className={styles.breadcrumbSep}>›</span>
          <a href="/category/gaming">Gaming</a>
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
                <Image src={product.image} alt={product.name} width={200} height={150} />
              </div>
              <div className={styles.heroBadges}>
                {product.tags.map((tag) => (
                  <span key={tag} className="badge badge-primary">{tag}</span>
                ))}
              </div>
              <h1 className={styles.heroProductName}>{product.name}</h1>
              <p className={styles.heroSpecs}>
                {product.specs.CPU} • {product.specs.GPU} • {product.specs.RAM}
              </p>
            </motion.div>

            {/* Rating & Price Bar */}
            <ScrollReveal>
              <div className={styles.ratingPriceBar}>
                <div className={styles.ratingBlock}>
                  <span className={styles.ratingScore}>{product.rating}</span>
                  <div className={styles.ratingStars}>
                    <div className={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`${styles.star} ${i > Math.round(product.rating) ? styles.starEmpty : ''}`}
                        />
                      ))}
                    </div>
                    <div className={styles.ratingBars}>
                      {[92, 78, 60, 45, 30].map((w, i) => (
                        <div key={i} className={styles.ratingBar}>
                          <div className={styles.ratingBarFill} style={{ width: `${w}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.priceBlock}>
                  <div className={styles.priceLabel}>Lowest Current Price</div>
                  <div>
                    <span className={styles.priceValue}>${product.prices[0].price.toLocaleString()}.00</span>
                    <span className={styles.priceDrop}>{product.trendPercent}% Drop</span>
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

            {/* Price History Chart */}
            <ScrollReveal>
              <div className={styles.chartSection}>
                <div className={styles.chartHeader}>
                  <h2 className={styles.chartTitle}>Price History</h2>
                  <div className={styles.chartTabs}>
                    {chartTabs.map((tab, i) => (
                      <button
                        key={tab}
                        className={`${styles.chartTab} ${i === 2 ? styles.chartTabActive : ''}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.chartArea}>
                  <svg className={styles.chartSvg} viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d={areaPath}
                      fill="url(#areaGrad)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    />
                    <motion.path
                      d={linePath}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.3, duration: 1.2, ease: 'easeInOut' }}
                    />
                    {/* Tooltip dot on last point */}
                    <motion.circle
                      cx={pad + (svgWidth - pad * 2)}
                      cy={pad + (1 - (points[points.length - 1].price - minP) / range) * (svgHeight - pad * 2)}
                      r="5"
                      fill="#2563EB"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.3 }}
                    />
                    {/* X Axis Labels */}
                    {points.map((p, i) => (
                      <text
                        key={i}
                        x={pad + (i / (points.length - 1)) * (svgWidth - pad * 2)}
                        y={svgHeight - 4}
                        textAnchor="middle"
                        fill="#9CA3AF"
                        fontSize="11"
                      >
                        {p.date}
                      </text>
                    ))}
                  </svg>
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
                  <span className={styles.downloadLink}>Download Datasheet</span>
                </div>
                <div className={styles.specsGrid}>
                  <div className={styles.specGroup}>
                    <h4>Processor & Graphics</h4>
                    {['CPU', 'GPU', 'VRAM', 'TDP'].map(k => product.specs[k] && (
                      <div key={k} className={styles.specRow}>
                        <span className={styles.specKey}>{k}</span>
                        <span className={styles.specVal}>{product.specs[k]}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.specGroup}>
                    <h4>Display & Audio</h4>
                    {['Size', 'Resolution', 'Features'].map(k => product.specs[k] && (
                      <div key={k} className={styles.specRow}>
                        <span className={styles.specKey}>{k}</span>
                        <span className={styles.specVal}>{product.specs[k]}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.specGroup}>
                    <h4>Body & Battery</h4>
                    {['Dimensions', 'Weight', 'Battery', 'OS'].map(k => product.specs[k] && (
                      <div key={k} className={styles.specRow}>
                        <span className={styles.specKey}>{k}</span>
                        <span className={styles.specVal}>{product.specs[k]}</span>
                      </div>
                    ))}
                  </div>
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
              {product.prices.map((mp, i) => (
                <motion.div
                  key={mp.marketplace}
                  className={styles.buyOption}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <div className={styles.buyLeft}>
                    <div className={styles.buyIcon} style={{ background: mp.color }}>
                      {mp.marketplace[0]}
                    </div>
                    <div>
                      <div className={styles.buyName}>{mp.marketplace}</div>
                      <div className={styles.buyShipping}>{mp.shipping}</div>
                    </div>
                  </div>
                  <div className={styles.buyRight}>
                    <div className={styles.buyPrice}>${mp.price.toLocaleString()}</div>
                    <div className={styles.buyLink}>Buy Now →</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Our Verdict */}
            {product.aiVerdict && (
              <div className={styles.verdictPanel}>
                <h3 className={styles.verdictTitle}>Our Verdict</h3>
                {product.aiVerdict.pros.map((pro, i) => (
                  <div key={i} className={styles.verdictItem}>
                    <CheckCircleFilled className={styles.verdictPro} />
                    <span>{pro}</span>
                  </div>
                ))}
                {product.aiVerdict.cons.map((con, i) => (
                  <div key={i} className={styles.verdictItem}>
                    <CloseCircleFilled className={styles.verdictCon} />
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.aside>
        </div>
      </div>
    </AnimatedPage>
  );
}
