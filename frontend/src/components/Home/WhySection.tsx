'use client';

import { motion } from 'framer-motion';
import { RocketOutlined, SafetyCertificateOutlined, LineChartOutlined, TeamOutlined } from '@ant-design/icons';
import styles from '@/app/page.module.css';

const usps = [
  {
    icon: <RocketOutlined />,
    title: 'AI-Powered Recommendations',
    description: 'Our algorithms analyze thousands of benchmarks to find hardware that actually performs for your specific workload.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Unbiased Comparisons',
    description: 'We compare specs and real-world performance across all major retailers to ensure you get the best value without brand bias.',
  },
  {
    icon: <LineChartOutlined />,
    title: 'Real-time Price Tracking',
    description: 'Never miss a deal. We track prices across Amazon, Best Buy, and Newegg to show you the current lowest available price.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Expert Curated',
    description: 'Every category is curated by professionals in data science, video editing, and 3D art to ensure technical accuracy.',
  },
];

export default function WhySection() {
  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Why Choose stacknodes?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
          We bridge the gap between technical specs and professional requirements.
        </p>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 32 
      }}>
        {usps.map((usp, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: 24,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center'
            }}
          >
            <div style={{ 
              fontSize: 32, 
              color: 'var(--primary)', 
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'center'
            }}>
              {usp.icon}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{usp.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{usp.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
