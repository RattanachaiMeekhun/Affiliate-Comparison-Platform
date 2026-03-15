'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/formatters';
import { useCurrency } from '@/context/CurrencyContext';

interface BuildComponent {
  label: string;
  name: string;
  price: number;
}

interface BuildPreviewProps {
  components: BuildComponent[];
  insight: string;
}

export default function BuildPreview({ components, insight }: BuildPreviewProps) {
  const { selectedCurrency, rates } = useCurrency();
  const totalPrice = components.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      padding: 24,
      position: 'sticky',
      top: 100,
      boxShadow: 'var(--shadow-md)',
      textAlign: 'left'
    }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Estimated Build</h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Updates automatically as you select options.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        {components.map((item, index) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {formatPrice(item.price, 'USD', selectedCurrency, rates)}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ 
        background: 'var(--primary-bg)', 
        borderRadius: 'var(--radius-md)', 
        padding: 16, 
        marginBottom: 32,
        border: '1px solid var(--primary-light)'
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>
          AI Insight
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {insight}
        </p>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
          Estimated Total
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>
          {formatPrice(totalPrice, 'USD', selectedCurrency, rates)}
        </div>
      </div>
    </div>
  );
}
