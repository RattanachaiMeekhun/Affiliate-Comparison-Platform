'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spin, Tag, Divider, Alert } from 'antd';
import {
  ThunderboltOutlined,
  RocketOutlined,
  SettingOutlined,
  HddOutlined,
  AppstoreOutlined,
  ApiOutlined,
  CheckCircleFilled,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useCurrency } from '@/context/CurrencyContext';
import { formatPrice } from '@/services/formatters';
import { SetBuilderResponse } from '@/services/setbuilderApi';

const ICON_MAP: Record<string, React.ReactNode> = {
  processor: <ThunderboltOutlined />,
  gpu: <RocketOutlined />,
  'graphic-card': <RocketOutlined />,
  memory: <SettingOutlined />,
  storage: <HddOutlined />,
  motherboard: <AppstoreOutlined />,
  mainboard: <AppstoreOutlined />,
  psu: <ApiOutlined />,
};

interface EstimatedBuildProps {
  aiResponse: SetBuilderResponse | null;
  isLoading: boolean;
  error: string | null;
}

const EstimatedBuild: React.FC<EstimatedBuildProps> = ({ aiResponse, isLoading, error }) => {
  const { selections } = useSelector((state: RootState) => state.builder);
  const { selectedCurrency, rates } = useCurrency();

  const hasData = aiResponse && aiResponse.components.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        background: 'white',
        padding: '32px',
        borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xl)',
        position: 'sticky',
        top: '100px',
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Estimated Build</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {hasData
            ? 'AI-curated build based on your selections.'
            : 'Complete the survey and click "View Full Build" to generate your AI build.'}
        </p>
      </div>

      {!hasData ? (
        /* ── Empty State ── */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--primary-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <ExperimentOutlined style={{ fontSize: 28, color: 'var(--primary)' }} />
          </div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: 8,
              lineHeight: 1.5,
            }}
          >
            Your AI build will appear here
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Select your preferences and click <strong>"View Full Build"</strong> to let our AI craft
            the perfect setup.
          </p>

          {isLoading && (
            <div style={{ marginTop: 24 }}>
              <Spin />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                AI is generating your build...
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ── Populated State ── */
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence mode="popLayout">
              {aiResponse!.components.map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ display: 'flex', gap: 16, alignItems: 'center' }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      background: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      color: 'var(--primary)',
                    }}
                  >
                    {ICON_MAP[item.icon_key] || <CheckCircleFilled />}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {formatPrice(item.price || 0, 'THB', selectedCurrency, rates)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Divider style={{ margin: '24px 0' }} />

          {aiResponse!.insight && (
            <div
              style={{
                background: 'var(--primary-bg)',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--primary-light)',
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                AI Analysis
              </div>
              <p
                style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}
              >
                {aiResponse!.insight}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                Estimated Total
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>
                {formatPrice(
                  aiResponse!.components.reduce((sum, item) => sum + (item.price || 0), 0),
                  'THB',
                  selectedCurrency,
                  rates
                )}
              </div>
            </div>
            {isLoading && <Spin size="small" />}
          </div>
        </>
      )}

      {error && (
        <Alert
          message="Offline Mode"
          description="Using local logic while AI is connecting..."
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </motion.div>
  );
};

export default EstimatedBuild;
