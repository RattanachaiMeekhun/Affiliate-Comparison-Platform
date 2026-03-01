'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import styles from './Header.module.css';

const navLinks = [
  { label: 'Deals', href: '/' },
  { label: 'Compare', href: '/compare' },
  { label: 'Guides', href: '/setup-builder' },
  { label: 'Methodology', href: '/methodology' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <>
      <motion.header
        className={styles.header}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>P</span>
            PixelStack
          </Link>

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

          <div className={styles.searchWrapper}>
            <Input
              placeholder="Search hardware..."
              prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
              style={{
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
              }}
            />
          </div>

        </div>
      </motion.header>
    </>
  );
}
