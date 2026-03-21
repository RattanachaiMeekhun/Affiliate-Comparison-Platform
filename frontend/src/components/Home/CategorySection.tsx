'use client';

import Link from 'next/link';
import { ArrowRightOutlined } from '@ant-design/icons';
import {
  ScrollReveal,
  StaggerWrapper,
  StaggerChild,
} from '@/components/AnimatedLayout/AnimatedLayout';
import styles from '@/app/page.module.css';
import CategoryCard from './CategoryCard';

interface CategorySectionProps {
  categories: any[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  return (
    <>
      <ScrollReveal>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Find Your Perfect Setup</h2>
            <p className={styles.sectionSubtitle}>
              Hardware recommendations optimized for your specific workflow requirements.
            </p>
          </div>
          <Link href="/setup-builder" className={styles.viewAll}>
            Setup Builder <ArrowRightOutlined />
          </Link>
        </div>
      </ScrollReveal>

      <StaggerWrapper className={styles.categoryGrid}>
        {categories.map((category) => (
          <StaggerChild key={category.id}>
            <CategoryCard category={category} />
          </StaggerChild>
        ))}
      </StaggerWrapper>
    </>
  );
}
