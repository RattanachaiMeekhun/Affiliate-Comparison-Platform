'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from '@/app/page.module.css';
import { Category } from '@/services/api';

interface CategoryCardProps {
  category: {
    id: string | number;
    name: string;
    slug: string;
    icon: React.ReactNode;
    description: string;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  // Map category slug to builder use-case id if needed, 
  // but here they seem to match mostly or can be handled in the builder page.
  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
      <Link href={`/setup-builder?use-case=${category.slug}`} className={styles.categoryCard}>
        <div className={styles.categoryIcon}>{category.icon}</div>
        <h3 className={styles.categoryName}>{category.name}</h3>
        <p className={styles.categoryDesc}>{category.description}</p>
        <div style={{ marginTop: 'auto', paddingTop: 16, fontSize: 13, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          Start Building <ArrowRightOutlined style={{ fontSize: 12 }} />
        </div>
      </Link>
    </motion.div>
  );
}
