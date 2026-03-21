'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
      <Link href={`/category/${category.slug}`} className={styles.categoryCard}>
        <div className={styles.categoryIcon}>{category.icon}</div>
        <h3 className={styles.categoryName}>{category.name}</h3>
        <p className={styles.categoryDesc}>{category.description}</p>
      </Link>
    </motion.div>
  );
}
