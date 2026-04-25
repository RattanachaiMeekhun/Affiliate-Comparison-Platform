'use client';

import { Collapse } from 'antd';
import styles from '@/app/page.module.css';


const faqs = [
  {
    key: '1',
    question: 'What is the best GPU for machine learning and deep learning?',
    answer: 'For professional machine learning workflows, GPUs with high VRAM are essential. Currently, the NVIDIA RTX 4090 (24GB VRAM) is the top choice for desktop workstations, while the H100 or A100 are preferred for enterprise-grade training.',
  },
  {
    key: '2',
    question: 'How does stacknodes calculate the "Trending Score"?',
    answer: 'Our Trending Score is an AI-powered metric that combines benchmark data, technical specifications, market availability, and current price value to help you identify the best hardware for your money.',
  },
  {
    key: '3',
    question: 'Does stacknodes sell hardware directly?',
    answer: 'No, we are a comparison and recommendation platform. We find the best deals across various retailers like Amazon, Best Buy, and Newegg and redirect you to their secure sites for purchase.',
  },
  {
    key: '4',
    question: 'What monitor is best for color-accurate video editing?',
    answer: 'Video editors should look for monitors with at least 99% sRGB or DCI-P3 coverage. Brands like ASUS ProArt and Dell UltraSharp are highly recommended for professionals.',
  },
  {
    key: '5',
    question: 'Is it better to buy a pre-built workstation or build my own?',
    answer: 'Building your own usually offers better value and customization. However, for enterprise environments, pre-built workstations from vendors like Dell or HP often come with essential support and warranties.',
  },
];

export default function FaqSection() {
  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Frequently Asked Questions</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
          Common questions about professional hardware and how stacknodes helps you save.
        </p>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Collapse 
          accordion 
          ghost 
          expandIconPlacement="end" 
          className="faq-collapse"
          items={faqs.map((faq) => ({
            key: faq.key,
            label: <strong style={{ fontSize: 16 }}>{faq.question}</strong>,
            children: <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6 }}>{faq.answer}</p>,
          }))}
        />
      </div>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
