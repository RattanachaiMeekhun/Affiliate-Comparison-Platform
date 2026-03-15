'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { fetchProducts, Product } from '@/lib/api';
import CurrencySelector from '@/components/CurrencySelector/CurrencySelector';
import Logo from '@/components/Branding/Logo';
import styles from './Header.module.css';



const navLinks = [
  { label: 'Deals', href: '/' },
  { label: 'Compare', href: '/compare' },
  { label: 'Guides', href: '/setup-builder' },
  { label: 'Methodology', href: '/methodology' },
];

export default function Header() {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch all products once for client-side search
    async function initSearch() {
      try {
        const prods = await fetchProducts();
        setAllProducts(prods);
      } catch (e) {
        console.error("Failed to load products for search");
      }
    }
    initSearch();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 1) {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(val.toLowerCase()) || 
        (p.specs && p.specs.brand && String(p.specs.brand).toLowerCase().includes(val.toLowerCase()))
      ).slice(0, 5); // Max 5 results
      setResults(filtered);
      setIsSearching(true);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  };

  return (
    <>
      <motion.header
        className={styles.header}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.headerInner}>
          <Logo />

          <nav className={styles.nav}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${
                  pathname === link.href ? styles.navLinkActive : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.searchWrapper} ref={searchRef} style={{ position: 'relative' }}>
            <Input
              placeholder="Search hardware..."
              value={query}
              onChange={handleSearch}
              onFocus={() => { if (query.trim().length > 1) setIsSearching(true) }}
              prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
              style={{
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
              }}
            />
            
            <AnimatePresence>
              {isSearching && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: 8,
                    background: 'white',
                    borderRadius: 8,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    zIndex: 1000
                  }}
                >
                  {results.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {results.map((product) => {
                         const imgUrl = product.affiliate_products && product.affiliate_products.length > 0
                          ? product.affiliate_products[0].image_url 
                          : '/placeholder.png';
                          
                        return (
                          <Link 
                            key={product.id} 
                            href={`/products/${product.slug}`}
                            onClick={() => {
                              setIsSearching(false);
                              setQuery('');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '12px 16px',
                              borderBottom: '1px solid var(--border)',
                              textDecoration: 'none',
                              color: 'inherit',
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <img 
                              src={imgUrl || '/placeholder.png'} 
                              alt={product.name}
                              style={{ width: 40, height: 40, objectFit: 'contain' }}
                              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/40?text=No+Image'; }}
                            />
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {product.name}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {product.specs?.brand ? String(product.specs.brand) : 'Hardware'}
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                      No hardware found matching "{query}"
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ marginLeft: 16 }}>
            <CurrencySelector />
          </div>


        </div>
      </motion.header>
    </>
  );
}
