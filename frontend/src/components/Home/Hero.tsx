'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightOutlined, ThunderboltOutlined } from '@ant-design/icons';
import styles from '@/app/page.module.css';

export default function Hero() {
  return (
    <motion.section
      className={styles.heroSection}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.heroContent}>
        <motion.h1
          className={styles.heroTitle}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          AI-Powered Hardware Deals for Data Scientists, Video Editors & 3D Artists
        </motion.h1>
        <motion.p
          className={styles.heroSubtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          Stop guessing. Our AI analyzes thousands of benchmarks to find high-performance
          hardware tailored specifically for data science, 3D rendering, and 4K video editing.
        </motion.p>
        <motion.div
          className={styles.heroCtas}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/compare" className={styles.ctaPrimary}>
              View Top Deals <ArrowRightOutlined />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/compare" className={styles.ctaSecondary}>
              <ThunderboltOutlined /> Compare Specs
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
