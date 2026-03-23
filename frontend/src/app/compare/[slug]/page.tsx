'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchProducts, Product } from '@/services/api';
import { useCurrency } from '@/context/CurrencyContext';
import { formatPrice } from '@/services/formatters';
import { Empty, Button, Badge } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import AnimatedPage from '@/components/AnimatedLayout/AnimatedLayout';
import styles from '../page.module.css';

export default function DynamicComparePage() {
  const params = useParams();
  const slug = params.slug as string;
  const parts = slug.split('-vs-');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCurrency, rates } = useCurrency();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const prods = await fetchProducts(undefined, 0, 1000);
        setProducts(prods || []);
      } catch (err) {
        console.error('Error loading products', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const comparedProducts = useMemo(() => {
    if (parts.length < 2) return [];
    
    // Attempt multiple match strategies
    const p1Term = parts[0].toLowerCase().replace(/-/g, ' ');
    const p2Term = parts[1].toLowerCase().replace(/-/g, ' ');
    
    const match1 = products.find(p => p.slug.includes(parts[0]) || p.name.toLowerCase().includes(p1Term));
    const match2 = products.find(p => (p.slug.includes(parts[1]) || p.name.toLowerCase().includes(p2Term)) && p.id !== match1?.id);
    
    const result = [];
    if (match1) result.push(match1);
    if (match2) result.push(match2);
    
    return result;
  }, [products, parts]);

  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    comparedProducts.forEach((p) => {
      if (p.specs) {
        Object.keys(p.specs).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys).sort(); // sort alphabetically
  }, [comparedProducts]);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '100px 20px' }}>Loading comparison data...</div>;
  }

  if (parts.length < 2 || comparedProducts.length < 2) {
    return (
      <AnimatedPage>
        <div style={{ padding: '100px 20px', textAlign: 'center', background: 'white', minHeight: '60vh' }}>
          <Empty description={
            <div>
              <h3>Comparison Not Found</h3>
              <p>We couldn't find exact matches for {parts.map(p => p.replace(/-/g, ' ').toUpperCase()).join(' and ')}.</p>
            </div>
          } />
          <Button type="primary" onClick={() => router.push('/compare')} style={{ marginTop: 20 }}>
            Browse Compare Page
          </Button>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className={styles.pageWrapper} style={{ display: 'block' }}>
        <div style={{ textAlign: 'center', marginBottom: 40, marginTop: 20 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>
            {comparedProducts.map(p => p.name).join(' vs ')}
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Compare specifications, features, and current prices side-by-side to make the best decision.
          </p>
        </div>

        <div className={styles.compareScrollContainer} style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: 20 }}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th className={styles.specHeaderCell} style={{ borderBottom: '2px solid var(--border)' }}>Specifications</th>
                {comparedProducts.map((p) => {
                  const bestPrice =
                    p.affiliate_products.length > 0
                      ? Math.min(...p.affiliate_products.map((a) => Number(a.price) || 0).filter((a) => a > 0))
                      : Number(p.price) || 0;

                  return (
                    <th key={p.id} className={styles.productHeaderCell} style={{ textAlign: 'center', borderBottom: '2px solid var(--border)', paddingBottom: 24 }}>
                      <div className={styles.compProductThumb} style={{ margin: '0 auto 16px', width: 120, height: 120 }}>
                        <img src={p.image_url || '/no-image.png'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <div className={styles.compProductName} style={{ fontSize: '1.2rem', fontWeight: 700 }}>{p.name}</div>
                      {p.category_name && (
                        <div style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: 8 }}>
                          {p.category_name}
                        </div>
                      )}
                      <div className={styles.compProductPrice} style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 16 }}>
                        {bestPrice > 0 ? formatPrice(bestPrice, p.currency || 'THB', selectedCurrency, rates) : 'View Prices'}
                      </div>
                      <Button type="primary" onClick={() => router.push(`/products/${p.slug}`)}>
                        View Details
                      </Button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.specLabelCell} style={{ borderBottom: '1px solid var(--border)', padding: '16px', fontWeight: 600 }}>Trending Score</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className={styles.specValueCell} style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', padding: '16px' }}>
                    <Badge count={p.trending_score} color="var(--primary)" />
                  </td>
                ))}
              </tr>
              {allSpecKeys.map((key) => (
                <tr key={key}>
                  <td className={styles.specLabelCell} style={{ borderBottom: '1px solid var(--border)', padding: '16px', textTransform: 'capitalize', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {key.replace(/_/g, ' ')}
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className={styles.specValueCell} style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', padding: '16px' }}>
                      {p.specs?.[key] ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 500 }}>{String(p.specs[key])}</span>
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
        </div>
        
        <div style={{ marginTop: 40, textAlign: 'center' }}>
           <Button size="large" onClick={() => router.push('/compare')}>
             Compare Other Products
           </Button>
        </div>
      </div>
    </AnimatedPage>
  );
}
