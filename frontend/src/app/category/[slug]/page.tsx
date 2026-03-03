'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FilterOutlined, ArrowRightOutlined } from '@ant-design/icons';
import AnimatedPage, {
  ScrollReveal,
  StaggerWrapper,
  StaggerChild,
} from '@/components/AnimatedLayout/AnimatedLayout';
import { mockProducts, mockCategories } from '@/util/mockData';

export default function CategoryPage() {
  const category = mockCategories[0];

  return (
    <AnimatedPage>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '48px',
            color: 'white',
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>{category.icon}</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
            {category.name}
          </h1>
          <p style={{ fontSize: 15, color: '#94A3B8', maxWidth: 500 }}>
            {category.description}
          </p>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 12 }}>
            {category.productCount} products compared
          </p>
        </motion.div>

        {/* Filter bar */}
        <ScrollReveal>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['All', 'Gaming', 'Creator', 'Business'].map((f, i) => (
                <button
                  key={f}
                  style={{
                    padding: '6px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    border: `1px solid ${i === 0 ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 100,
                    background: i === 0 ? 'var(--primary)' : 'white',
                    color: i === 0 ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              fontSize: 13,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'white',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}>
              <FilterOutlined /> Filters
            </button>
          </div>
        </ScrollReveal>

        {/* Product Grid */}
        <StaggerWrapper style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {mockProducts.map((product) => (
            <StaggerChild key={product.id}>
              <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={`/products/${product.slug}`}
                  style={{
                    display: 'block',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {product.tags[0] && (
                    <div style={{ position: 'absolute', zIndex: 2, margin: 12 }}>
                      <span className={product.tags[0] === 'Hot Deal' ? 'badge badge-danger' : 'badge badge-primary'}>
                        {product.tags[0]}
                      </span>
                    </div>
                  )}
                  <div style={{
                    width: '100%',
                    height: 160,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-secondary)',
                    padding: 16,
                    position: 'relative',
                  }}>
                    <Image src={product.image} alt={product.name} width={100} height={100} />
                  </div>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>
                      {product.name}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                      {Object.entries(product.specs).slice(0, 2).map(([k, v]) => (
                        <span key={k} style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          background: 'var(--bg-secondary)',
                          borderRadius: 100,
                          color: 'var(--text-muted)',
                        }}>
                          {v}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 18, fontWeight: 700 }}>
                        ${product.prices[0].price.toLocaleString()}
                      </span>
                      {product.prices[0].originalPrice && (
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ${product.prices[0].originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 500,
                      marginTop: 6,
                      color: product.trend === 'down' ? 'var(--success)' : 'var(--text-muted)',
                    }}>
                      {product.trend === 'down' ? `↓ ${product.trendPercent}% this week` : '— Stable'}
                    </div>
                  </div>
                </Link>
              </motion.div>
            </StaggerChild>
          ))}
        </StaggerWrapper>

        {/* Load more */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '12px 32px',
              fontSize: 14,
              fontWeight: 600,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'white',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            Load More Products <ArrowRightOutlined />
          </motion.button>
        </div>
      </div>
    </AnimatedPage>
  );
}
