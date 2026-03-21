'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from '@/app/page.module.css';
import { Product, CurrencyRate } from '@/services/api';
import { formatPrice } from '@/services/formatters';

interface ProductCardProps {
  product: Product;
  selectedCurrency: string;
  rates: CurrencyRate[];
}

export default function ProductCard({ product, selectedCurrency, rates }: ProductCardProps) {
  const bestPrice =
    product.affiliate_products.length > 0
      ? Math.min(
          ...product.affiliate_products
            .map((p) => Number(p.price) || 0)
            .filter((p) => p > 0)
        )
      : Number(product.price) || 0;

  const imgUrl = product.image_url || '/placeholder.png';

  return (
    <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
      <Link href={`/products/${product.slug}`} className={styles.productCard}>
        {product.best_value && (
          <div className={styles.productBadge}>
            <span className="badge badge-danger">Best Value</span>
          </div>
        )}
        <div className={styles.productImage}>
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
                {formatPrice(bestPrice, product.currency || 'THB', selectedCurrency, rates)}
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
  );
}
