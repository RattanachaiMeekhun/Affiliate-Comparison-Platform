import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.brandBlock}>
          <h3>
            <span className={styles.brandIcon}>s</span>
            stacknodes
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
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/methodology">Methodology</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/disclosure">Affiliate Disclosure</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.disclosure}>
        <p>
          Affiliate Disclosure: stacknodes is a participant in various affiliate
          programs. We may earn a commission when you click on or make purchases
          via links from our platform at no additional cost to you. Our comparison
          engine remains objective and focused on find the best technical value for
          pro users.
        </p>
      </div>

      <p className={styles.copyright}>
        © 2025 stacknodes Inc. All rights reserved.
      </p>
    </footer>
  );
}
