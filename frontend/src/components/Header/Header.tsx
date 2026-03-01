'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Input, Dropdown, MenuProps, Avatar } from 'antd';
import { SearchOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import styles from './Header.module.css';
import LoginModal from '@/components/LoginModal/LoginModal';

const navLinks = [
  { label: 'Deals', href: '/' },
  { label: 'Compare', href: '/compare' },
  { label: 'Guides', href: '/setup-builder' },
  { label: 'Methodology', href: '/methodology' },
];

export default function Header() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Check initial user session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const userMenu: MenuProps = {
    items: [
      {
        key: 'email',
        label: <span style={{ color: 'var(--text-secondary)' }}>{user?.email}</span>,
        disabled: true,
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: 'Sign out',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
        danger: true,
      },
    ],
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

          <div className={styles.actions}>
            {user ? (
              <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
                <Avatar 
                  size="large" 
                  src={user.user_metadata?.avatar_url} 
                  icon={!user.user_metadata?.avatar_url && <UserOutlined />}
                  style={{ cursor: 'pointer', border: '2px solid var(--primary)' }}
                />
              </Dropdown>
            ) : (
              <motion.button
                className={styles.signInBtn}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsModalOpen(true)}
              >
                Sign In
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      <LoginModal 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
      />
    </>
  );
}
