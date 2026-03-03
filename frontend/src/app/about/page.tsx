import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us - stacknodes',
  description: 'About stacknodes and our mission to simplify hardware comparison.',
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '30px' }}>About stacknodes.net</h1>

      <div style={{ lineHeight: '1.8' }}>
        <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
          Our mission is to simplify the process of finding and comparing technology hardware. With the ever-growing number of variants, specifications, and regional differences, buying the right tech has become increasingly complex.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>The Problem</h2>
        <p style={{ marginBottom: '20px' }}>
          When you want to buy a laptop or a graphics card, you have to sift through dozens of listings across different marketplaces. Often, the same product is listed under slightly different names, making it hard to compare prices and ensure you are getting the best deal.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>Our Solution</h2>
        <p style={{ marginBottom: '20px' }}>
          stacknodes.net uses an AI-powered matching engine to normalize product data across multiple merchants. Our system groups identical products together, cutting through the noise and allowing you to compare options side-by-side with clear, data-driven insights.
        </p>
        
        <p style={{ marginBottom: '30px' }}>
          Whether you are a data scientist looking for a compute heavy machine, a video editor needing rendering power, or a gamer seeking the best frame rates, we help you find the optimal hardware for your specific needs.
        </p>
        
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/contact" style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--primary)', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 600 }}>
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
