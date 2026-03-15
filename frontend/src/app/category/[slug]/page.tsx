'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FilterOutlined, ArrowRightOutlined } from '@ant-design/icons';
import AnimatedPage, {
  ScrollReveal,
  StaggerWrapper,
  StaggerChild,
} from '@/components/AnimatedLayout/AnimatedLayout';
import { fetchCategories, fetchProducts, Category, Product } from '@/lib/api';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allCats, catProds] = await Promise.all([
          fetchCategories(),
          fetchProducts(slug)
        ]);
        
        const foundCat = allCats.find(c => c.slug === slug);
        if (foundCat) {
          setCategory(foundCat);
          setProducts(catProds);
        } else {
          setCategory(null);
        }
      } catch (err) {
        console.error("Error loading category page data", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (slug) {
      loadData();
    }
  }, [slug]);

  if (isLoading) {
    return <AnimatedPage><div style={{ textAlign: 'center', padding: 100 }}>Loading category...</div></AnimatedPage>;
  }

  if (!category) {
    return <AnimatedPage><div style={{ textAlign: 'center', padding: 100 }}>Category not found</div></AnimatedPage>;
  }

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
          <div style={{ fontSize: 40, marginBottom: 12 }}>
            {category.icon_url ? <img src={category.icon_url} alt={category.name} width={40} height={40} /> : '📂'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
            {category.name}
          </h1>
          <p style={{ fontSize: 15, color: '#94A3B8', maxWidth: 500 }}>
            {category.description || `Browse all ${category.name} products`}
          </p>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 12 }}>
            {products.length} products compared
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
              {['All'].map((f, i) => (
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
          {products.map((product) => {
            const bestPrice = product.affiliate_products.length > 0 
                ? Math.min(...product.affiliate_products.map(p => Number(p.price) || 0).filter(p => p > 0)) 
                : Number(product.price) || 0;
            
            const imgUrl = product.image_url || product.affiliate_products.find(p => p.image_url)?.image_url || '/placeholder.png';
            const specs = product.specs || {};

            return (
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
                    {product.best_value && (
                      <div style={{ position: 'absolute', zIndex: 2, margin: 12 }}>
                        <span className="badge badge-danger">
                          Best Value
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
                      <img 
                        src={imgUrl} 
                        alt={product.name} 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/100?text=No+Image'; }}
                      />
                    </div>
                    <div style={{ padding: 16 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.4, height: 40, overflow: 'hidden' }}>
                        {product.name}
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8, height: 22, overflow: 'hidden' }}>
                        {Object.entries(specs).slice(0, 2).map(([k, v]) => (
                          <span key={k} style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            background: 'var(--bg-secondary)',
                            borderRadius: 100,
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap'
                          }}>
                            {String(v)}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        {bestPrice > 0 ? (
                          <span style={{ fontSize: 18, fontWeight: 700 }}>
                            ${bestPrice.toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ fontSize: 16, fontWeight: 700 }}>
                            View Prices
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 500,
                        marginTop: 6,
                        color: 'var(--text-muted)',
                      }}>
                        Score: {product.trending_score || 'N/A'}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </StaggerChild>
            )
          })}
        </StaggerWrapper>

        {/* Load more */}
        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            No products found in this category.
          </div>
        )}
        {products.length > 0 && (
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
        )}
      </div>
    </AnimatedPage>
  );
}
