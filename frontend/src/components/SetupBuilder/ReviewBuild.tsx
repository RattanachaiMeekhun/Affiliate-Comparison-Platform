import React from 'react';
import { motion } from 'framer-motion';
import { Row, Col, Tag, Divider, Spin, Alert } from 'antd';
import {
  RocketOutlined,
  RedoOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  CheckCircleFilled,
  HddOutlined,
  AppstoreOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { resetBuilder } from '@/store/slices/builderSlice';
import { formatPrice } from '@/lib/formatters';
import { useCurrency } from '@/context/CurrencyContext';
import { getRecommendations } from './builderData';
import { SetBuilderRecommendation } from '@/lib/setbuilderApi';

const ICON_MAP: Record<string, React.ReactNode> = {
  processor: <ThunderboltOutlined />,
  gpu: <RocketOutlined />,
  memory: <SettingOutlined />,
  storage: <HddOutlined />,
  motherboard: <AppstoreOutlined />,
  psu: <ApiOutlined />,
};

interface ReviewBuildProps {
  aiRecommendation: SetBuilderRecommendation | null;
  isLoading: boolean;
  error: string | null;
}

const ReviewBuild: React.FC<ReviewBuildProps> = ({ aiRecommendation, isLoading, error }) => {
  const dispatch = useDispatch();
  const { selections } = useSelector((state: RootState) => state.builder);
  const { selectedCurrency, rates } = useCurrency();

  const handleReset = () => {
    dispatch(resetBuilder());
  };

  // Use AI data if available, otherwise fall back to hardcoded mock
  const fallback = getRecommendations(selections);

  const title = aiRecommendation?.title ?? fallback.title;
  const subtitle = aiRecommendation?.subtitle ?? fallback.subtitle;
  const insight = aiRecommendation?.insight ?? fallback.insight;

  const components = aiRecommendation
    ? aiRecommendation.components.map((c) => ({
        label: c.label,
        name: c.name,
        price: c.price_usd,
        icon: ICON_MAP[c.icon_key] || <CheckCircleFilled />,
      }))
    : fallback.components;

  const totalPrice = components.reduce((sum, item) => sum + item.price, 0);

  if (isLoading) {
    return (
      <motion.div
        key="review-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          gap: 24,
        }}
      >
        <Spin size="large" />
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
          🤖 AI is building your perfect setup...
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          This may take a few seconds
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      style={{ maxWidth: 1200, margin: '0 auto' }}
    >
      {error && (
        <Alert
          message="AI Recommendation Unavailable"
          description={error}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[48, 48]} align="middle">
        <Col xs={24} lg={14}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tag
              color={aiRecommendation ? 'green' : 'gold'}
              style={{ marginBottom: 16, fontWeight: 700, padding: '4px 12px', fontSize: 13 }}
            >
              {aiRecommendation ? 'AI GENERATED' : 'EXPERT MATCH FOUND'}
            </Tag>
            <h1 style={{ fontSize: 56, fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
              {title}
            </h1>
            <p style={{ fontSize: 22, color: 'var(--text-muted)', marginBottom: 32 }}>{subtitle}</p>

            <div
              style={{
                background: 'var(--primary-bg)',
                padding: '32px',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--primary-light)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, fontSize: 120 }}
              >
                ✨
              </div>
              <h4
                style={{
                  color: 'var(--primary)',
                  fontWeight: 800,
                  marginBottom: 12,
                  fontSize: 15,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                }}
              >
                AI Analysis Result
              </h4>
              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}
              >
                &ldquo;{insight}&rdquo;
              </p>
            </div>
          </motion.div>
        </Col>

        <Col xs={24} lg={10}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'white',
              padding: 40,
              borderRadius: 'var(--radius-2xl)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>
              Components Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
              {components.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      color: 'var(--primary)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        marginBottom: 2,
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {formatPrice(item.price, 'USD', selectedCurrency, rates)}
                  </div>
                </div>
              ))}
            </div>

            <Divider />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: 24,
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Total Build Value
                </div>
                <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--text-primary)' }}>
                  {formatPrice(totalPrice, 'USD', selectedCurrency, rates)}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                style={{
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--text-secondary)',
                }}
              >
                <RedoOutlined /> Reset
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'var(--success)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                marginTop: 40,
                padding: '18px',
                background: 'var(--text-primary)',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                fontWeight: 800,
                fontSize: 17,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              }}
            >
              Secure This Build <RocketOutlined />
            </motion.button>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default ReviewBuild;
