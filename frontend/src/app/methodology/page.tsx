'use client';

import { motion } from 'framer-motion';
import {
  SafetyCertificateOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  AuditOutlined,
  TeamOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import AnimatedPage, { ScrollReveal, StaggerWrapper, StaggerChild } from '@/components/AnimatedLayout/AnimatedLayout';

const methodologySections = [
  {
    icon: <DatabaseOutlined style={{ fontSize: 28, color: '#2563EB' }} />,
    title: 'Data Collection',
    description: 'We aggregate product data from 15+ trusted marketplaces including Amazon, Best Buy, Newegg, and manufacturer direct stores. Our crawlers run every 4 hours to capture the latest pricing, availability, and promotional offers.',
    details: [
      'Real-time price tracking across 15+ marketplaces',
      'Historical data going back 12+ months',
      'Automated detection of fake deals and inflated original prices',
      'Validation against manufacturer suggested retail prices (MSRP)',
    ],
  },
  {
    icon: <ExperimentOutlined style={{ fontSize: 28, color: '#7C3AED' }} />,
    title: 'AI-Powered Product Matching',
    description: 'Our proprietary matching engine uses Google Gemini to semantically identify products across marketplaces, even when listings use different naming conventions or SKUs.',
    details: [
      'Vector embedding comparison using PGVector',
      'Fuzzy matching with 98.5% accuracy rate',
      'Human-in-the-loop verification for edge cases',
      'Continuous model fine-tuning on correction data',
    ],
  },
  {
    icon: <AuditOutlined style={{ fontSize: 28, color: '#10B981' }} />,
    title: 'Scoring & Ranking',
    description: 'Products are evaluated on a composite score that combines benchmark performance, price-to-value ratio, build quality, and community sentiment analysis.',
    details: [
      'Weighted scoring: Performance (40%), Value (30%), Reliability (20%), Reviews (10%)',
      'Benchmark data from independent testing labs',
      'Sentiment analysis of 500K+ user reviews',
      'Monthly recalibration of scoring weights',
    ],
  },
  {
    icon: <EyeOutlined style={{ fontSize: 28, color: '#F59E0B' }} />,
    title: 'Transparency',
    description: 'We believe in full transparency about our monetization. When you click an affiliate link, we may earn a commission at no extra cost to you. This never influences our rankings.',
    details: [
      'Rankings are algorithm-driven, not pay-to-play',
      'Affiliate relationships disclosed on every product page',
      'Annual third-party audit of ranking algorithm',
      'Open methodology documentation',
    ],
  },
];

const teamValues = [
  {
    icon: <SafetyCertificateOutlined style={{ fontSize: 24, color: '#2563EB' }} />,
    title: 'Independence',
    description: 'Our editorial team operates independently from our business partnerships.',
  },
  {
    icon: <TeamOutlined style={{ fontSize: 24, color: '#7C3AED' }} />,
    title: 'Expertise',
    description: 'Our team includes former hardware engineers, data scientists, and tech journalists.',
  },
  {
    icon: <ExperimentOutlined style={{ fontSize: 24, color: '#10B981' }} />,
    title: 'Rigor',
    description: 'Every recommendation is backed by data, benchmarks, and real-world testing.',
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
