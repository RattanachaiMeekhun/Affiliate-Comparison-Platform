'use client';

import { motion } from 'framer-motion';
import {
  SafetyCertificateOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  AuditOutlined,
  TeamOutlined,
  EyeOutlined,
  BulbOutlined,
  UserOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import AnimatedPage, { ScrollReveal, StaggerWrapper, StaggerChild } from '@/components/AnimatedLayout/AnimatedLayout';

const methodologySections = [
  {
    icon: <DatabaseOutlined style={{ fontSize: 28, color: '#2563EB' }} />,
    title: 'Data Collection',
    description: 'We aggregate product data from global platforms such as Amazon and various brand partners via Impact.com. Our system captures the latest pricing, availability, and promotional offers across multiple currencies.',
    details: [
      'Real-time price tracking via Amazon Product Advertising API and Impact.com APIs',
      'Multi-currency support with live exchange rates',
      'Automated detection of regional variants and SKUs',
      'Validation against manufacturer suggested retail prices (MSRP)',
    ],
  },
  {
    icon: <BulbOutlined style={{ fontSize: 28, color: '#F59E0B' }} />,
    title: 'AI Setup Specialist',
    description: 'Our AI Setup Builder leverages Google Gemini to translate your professional needs into optimized hardware configurations, ensuring perfect compatibility and performance-per-dollar.',
    details: [
      'Context-aware hardware recommendations',
      'Real-time budget optimization across categories',
      'Expert-level compatibility checking (Thermal, PSU, Clearance)',
      'Automated alternative suggestions for out-of-stock items',
    ],
  },
  {
    icon: <ExperimentOutlined style={{ fontSize: 28, color: '#7C3AED' }} />,
    title: 'AI-Powered Matching',
    description: 'Using vector embeddings and Google Gemini Pro, we semantically identify products across marketplaces even when listings use different names, ensuring high-precision model matching across multiple sources.',
    details: [
      'Semantic comparison using PGVector embeddings',
      'High-precision SKU and variant identification',
      'AI insights highlighting technical advantages (e.g., Cooling, Warranty)',
      'Continuous model optimization for global hardware data patterns',
    ],
  },
  {
    icon: <AuditOutlined style={{ fontSize: 28, color: '#10B981' }} />,
    title: 'Scoring & Ranking',
    description: 'Products are evaluated on a dynamic score that combines benchmark performance, price-to-value ratio, build quality, and real-time community sentiment analysis.',
    details: [
      'Weighted scoring: Performance (40%), Value (30%), Reliability (20%), Reviews (10%)',
      'Market-leading technical specification benchmarks',
      'Sentiment analysis of localized user feedback',
      'Regular data updates based on hardware release cycles',
    ],
  },
  {
    icon: <EyeOutlined style={{ fontSize: 28, color: '#64748B' }} />,
    title: 'Transparency',
    description: 'We maintain full editorial independence. As an affiliate-supported platform, we may earn a commission when you purchase through our links, but this never influences our rankings or AI recommendations.',
    details: [
      'Rankings are algorithm-driven, not pay-to-play',
      'Disclosure: We are a participant in the Amazon Services LLC Associates Program and various affiliate programs via Impact.com.',
      'Regular audits of recommendation logic',
      'Open methodology for score calculations',
    ],
  },
];

const teamValues = [
  {
    icon: <UserOutlined style={{ fontSize: 24, color: '#2563EB' }} />,
    title: 'Solo Foundation',
    description: 'Built and maintained by a single developer with a passion for hardware, ensuring every recommendation is personal and honest.',
  },
  {
    icon: <RobotOutlined style={{ fontSize: 24, color: '#7C3AED' }} />,
    title: 'AI Augmented',
    description: 'Leveraging Gemini AI to scale data processing, providing insights and comparisons that would typically require a large team.',
  },
  {
    icon: <SafetyCertificateOutlined style={{ fontSize: 24, color: '#10B981' }} />,
    title: 'Authentic Data',
    description: 'Our AI presents products as they are, without corporate bias or inflated marketing buzzwords—just verifiable technical truth.',
  },
];

export default function MethodologyPage() {
  return (
    <AnimatedPage>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 860 }}>
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 16,
          }}>
            Our Expertise &<br />Methodology
          </h1>
          <p style={{
            fontSize: 17,
            color: 'var(--text-secondary)',
            maxWidth: 560,
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Discover how stacknodes curates, analyzes, and ranks hardware to help
            professionals make informed purchasing decisions.
          </p>
        </motion.div>

        {/* Team Values */}
        <ScrollReveal>
          <StaggerWrapper style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            marginBottom: 64,
          }}>
            {teamValues.map((value) => (
              <StaggerChild key={value.title}>
                <motion.div
                  whileHover={{ y: -3 }}
                  style={{
                    padding: 28,
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'white',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{ marginBottom: 14 }}>{value.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{value.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{value.description}</p>
                </motion.div>
              </StaggerChild>
            ))}
          </StaggerWrapper>
        </ScrollReveal>

        {/* Methodology Sections */}
        {methodologySections.map((section, index) => (
          <ScrollReveal key={section.title} delay={index * 0.05}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: index % 2 === 0 ? '1fr 1.2fr' : '1.2fr 1fr',
              gap: 40,
              alignItems: 'center',
              marginBottom: 56,
              padding: 32,
              background: index % 2 === 0 ? 'var(--bg-secondary)' : 'white',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ order: index % 2 === 0 ? 0 : 1 }}>
                <div style={{ marginBottom: 16 }}>{section.icon}</div>
                <h2 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 26,
                  fontWeight: 700,
                  marginBottom: 12,
                }}>
                  {section.title}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {section.description}
                </p>
              </div>
              <div style={{ order: index % 2 === 0 ? 1 : 0 }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {section.details.map((detail, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        flexShrink: 0,
                        marginTop: 6,
                      }} />
                      {detail}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>
        ))}

        {/* Trust Banner */}
        <ScrollReveal>
          <motion.div
            whileHover={{ scale: 1.01 }}
            style={{
              background: 'var(--bg-hero)',
              borderRadius: 'var(--radius-lg)',
              padding: '48px',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
            }}>
              Built on Trust, Powered by Data
            </h2>
            <p style={{
              fontSize: 14,
              color: '#94A3B8',
              maxWidth: 480,
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              Our commitment is to help you make the best hardware decisions.
              Every score, every ranking, every recommendation is backed by
              transparent, verifiable data.
            </p>
          </motion.div>
        </ScrollReveal>
      </div>
    </AnimatedPage>
  );
}
