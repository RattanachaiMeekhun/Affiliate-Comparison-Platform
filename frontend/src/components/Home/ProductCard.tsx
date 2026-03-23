'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlusOutlined, CheckOutlined } from '@ant-design/icons';
import styles from '@/app/page.module.css';
import { Product, CurrencyRate } from '@/services/api';
import { formatPrice } from '@/services/formatters';
import { useCompare } from '@/context/CompareContext';

interface ProductCardProps {
  product: Product;
  selectedCurrency: string;
  rates: CurrencyRate[];
}

export default function ProductCard({ product, selectedCurrency, rates }: ProductCardProps) {
  const { compareItems, addToCompare, removeFromCompare } = useCompare();

  const isCompared = compareItems.some((item) => item.id === product.id);

  const bestPrice =
    product.affiliate_products.length > 0
      ? Math.min(
          ...product.affiliate_products
            .map((p) => Number(p.price) || 0)
            .filter((p) => p > 0)
        )
      : Number(product.price) || 0;

  const imgUrl = product.image_url || '/placeholder.png';

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCompared) {
      removeFromCompare(product.id);
    } else {
      addToCompare({
        id: product.id,
        name: product.name,
        imageUrl: imgUrl,
        category: product.category_name || 'Unknown',
        price: bestPrice,
      });
    }
  };

  return (
    <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }} style={{ position: 'relative' }}>
      <Link href={`/products/${product.slug}`} className={styles.productCard}>
        {product.best_value && (
          <div className={styles.productBadge}>
            <span className="badge badge-danger">Best Value</span>
          </div>
        )}
        <button
          onClick={handleCompareClick}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            background: isCompared ? 'var(--primary)' : 'rgba(255, 255, 255, 0.9)',
            color: isCompared ? 'white' : 'var(--text-primary)',
            border: `1px solid ${isCompared ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
          }}
          title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
        >
          {isCompared ? <CheckOutlined /> : <PlusOutlined />}
        </button>
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
