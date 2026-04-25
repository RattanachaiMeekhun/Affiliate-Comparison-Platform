'use client';

import { motion } from 'framer-motion';
import styles from '@/app/page.module.css';

const steps = [
  {
    step: '01',
    title: 'Select Category',
    description: 'Choose your professional workflow, from Data Science to 4K Video Editing.',
  },
  {
    step: '02',
    title: 'Compare Performance',
    description: 'Our AI compares technical specs and benchmark scores for you.',
  },
  {
    step: '03',
    title: 'Get Best Deal',
    description: 'Click the link to the retailer with the best available price and start building.',
  },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>How It Works</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
          Finding professional-grade hardware has never been easier.
        </p>
      </div>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 48 
      }}>
        {steps.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            style={{
              flex: '1 1 300px',
              maxWidth: 350,
              position: 'relative'
            }}
          >
            <div style={{ 
              fontSize: 64, 
              fontWeight: 800, 
              color: 'var(--bg-secondary)', 
              lineHeight: 1,
              marginBottom: -20,
              zIndex: -1
            }}>
              {item.step}
            </div>
            <div style={{ position: 'relative', zIndex: 1, paddingLeft: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{item.title}</h3>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
