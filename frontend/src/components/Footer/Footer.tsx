import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.brandBlock}>
          <h3>
            <span className={styles.brandIcon}>P</span>
            PixelStack
          </h3>
          <p>
            Curating the best hardware deals for professionals. We help you find
            the perfect workstation for your needs.
          </p>
        </div>

        <div className={styles.linkColumn}>
          <h4>Categories</h4>
          <ul>
            <li><Link href="/category/laptops">Laptops</Link></li>
            <li><Link href="/category/monitors">Workstations</Link></li>
            <li><Link href="/category/monitors">Monitors</Link></li>
            <li><Link href="/category/gpus">Components</Link></li>
          </ul>
        </div>

        <div className={styles.linkColumn}>
          <h4>Company</h4>
          <ul>
            <li><Link href="/methodology">About Us</Link></li>
            <li><Link href="/methodology">Editorial Policy</Link></li>
            <li><Link href="/methodology">Privacy Policy</Link></li>
            <li><Link href="/methodology">Terms</Link></li>
          </ul>
        </div>
      </div>

      <p className={styles.copyright}>
        © 2025 PixelStack Inc. All rights reserved.
      </p>
    </footer>
  );
}
