'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompare } from '@/context/CompareContext';
import { CloseOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CompareStickyBar() {
  const { compareItems, removeFromCompare, clearCompare, setIsCompareModalOpen } = useCompare();
  const pathname = usePathname();

  if (compareItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1000,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontWeight: 600 }}>Compare Products ({compareItems.length}/4)</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {compareItems.map((item) => (
              <div
                key={item.id}
                style={{
                  position: 'relative',
                  width: 60,
                  height: 60,
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'white',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
                <button
                  onClick={() => removeFromCompare(item.id)}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    background: 'var(--danger, #ff4d4f)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 10,
                  }}
                >
                  <CloseOutlined />
                </button>
              </div>
            ))}
            {[...Array(4 - compareItems.length)].map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  width: 60,
                  height: 60,
                  border: '1px dashed var(--border)',
                  borderRadius: 8,
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                }}
              >
                Empty
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={clearCompare}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Clear All
          </button>
          {pathname === '/compare' ? (
            <button
              onClick={() => setIsCompareModalOpen(true)}
              disabled={compareItems.length < 2}
              style={{
                background: compareItems.length > 1 ? 'var(--primary)' : 'var(--border)',
                color: compareItems.length > 1 ? 'white' : 'var(--text-secondary)',
                padding: '10px 24px',
                borderRadius: 8,
                fontWeight: 600,
                border: 'none',
                cursor: compareItems.length > 1 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              Compare Now
            </button>
          ) : (
            <Link
              href="/compare"
              style={{
                background: compareItems.length > 1 ? 'var(--primary)' : 'var(--border)',
                color: compareItems.length > 1 ? 'white' : 'var(--text-secondary)',
                padding: '10px 24px',
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: 'none',
                pointerEvents: compareItems.length > 1 ? 'auto' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Compare Now
            </Link>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
