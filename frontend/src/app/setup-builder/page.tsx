'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from 'antd';
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  ThunderboltOutlined,
  LaptopOutlined,
  DesktopOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import AnimatedPage from '@/components/AnimatedLayout/AnimatedLayout';

const steps = [
  {
    id: 1,
    title: 'What is your budget?',
    description: 'Select your target budget range for the hardware setup.',
    options: [
      { id: 'budget-1', label: 'Under $1,000', description: 'Entry-level professional hardware', icon: '💰' },
      { id: 'budget-2', label: '$1,000 - $2,500', description: 'Mid-range workstation components', icon: '💵' },
      { id: 'budget-3', label: '$2,500 - $5,000', description: 'High-performance professional gear', icon: '💎' },
      { id: 'budget-4', label: '$5,000+', description: 'Enterprise-grade, no compromises', icon: '🏆' },
    ],
  },
  {
    id: 2,
    title: 'What is your primary use case?',
    description: 'Choose the workload that best matches your daily needs.',
    options: [
      { id: 'use-1', label: 'Data Science & ML', description: 'GPU-heavy training and inference', icon: '🧪' },
      { id: 'use-2', label: '4K Video Editing', description: 'Premiere Pro, DaVinci Resolve', icon: '🎬' },
      { id: 'use-3', label: '3D Rendering', description: 'Blender, Cinema 4D, Maya', icon: '🎨' },
      { id: 'use-4', label: 'Competitive Gaming', description: 'High FPS, low latency', icon: '🎮' },
    ],
  },
  {
    id: 3,
    title: 'Preferred form factor?',
    description: 'Desktop or portable—choose what fits your workflow.',
    options: [
      { id: 'form-1', label: 'Desktop Tower', description: 'Maximum upgradability and power', icon: '🖥️' },
      { id: 'form-2', label: 'Laptop', description: 'Portability without compromise', icon: '💻' },
      { id: 'form-3', label: 'Mini PC / SFF', description: 'Compact and space-efficient', icon: '📦' },
      { id: 'form-4', label: 'No Preference', description: 'Show me the best regardless', icon: '🔄' },
    ],
  },
];

export default function SetupBuilderPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});

  const step = steps[currentStep];
  const isComplete = currentStep >= steps.length;
  const progress = Math.round(((currentStep) / steps.length) * 100);

  const handleSelect = (optionId: string) => {
    setSelections((prev) => ({ ...prev, [currentStep]: optionId }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <AnimatedPage>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 720, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 8,
          }}>
            AI Setup Builder
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32 }}>
            Answer a few questions and our AI will recommend the perfect hardware setup.
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: 40 }}
        >
          <Progress
            percent={progress}
            strokeColor="#2563EB"
            railColor="#E5E7EB"
            showInfo={false}
            style={{ maxWidth: 400, margin: '0 auto' }}
          />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
            >
              <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{step.title}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
                {step.description}
              </p>

              {/* Option Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 14,
                textAlign: 'left',
                marginBottom: 32,
              }}>
                {step.options.map((opt) => {
                  const isSelected = selections[currentStep] === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: 20,
                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'var(--primary-bg)' : 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isSelected && (
                        <CheckCircleFilled style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          color: 'var(--primary)',
                          fontSize: 18,
                        }} />
                      )}
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.icon}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{opt.description}</div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={currentStep === 0}
                  style={{
                    padding: '10px 24px',
                    fontSize: 14,
                    fontWeight: 500,
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'white',
                    cursor: currentStep === 0 ? 'default' : 'pointer',
                    opacity: currentStep === 0 ? 0.4 : 1,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <ArrowLeftOutlined /> Back
                </motion.button>

                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={!selections[currentStep]}
                  style={{
                    padding: '10px 28px',
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    background: selections[currentStep] ? 'var(--primary)' : 'var(--border)',
                    color: 'white',
                    cursor: selections[currentStep] ? 'pointer' : 'default',
                  }}
                >
                  {currentStep === steps.length - 1 ? 'Get Recommendations' : 'Continue'} <ArrowRightOutlined />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* Results */
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                Your Perfect Setup
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32 }}>
                Based on your preferences, here are our AI-curated recommendations.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
                marginBottom: 32,
                textAlign: 'left',
              }}>
                {[
                  { icon: <DesktopOutlined style={{ fontSize: 24, color: 'var(--primary)' }} />, label: 'GPU', rec: 'NVIDIA RTX 4090 24GB', price: '$1,599' },
                  { icon: <LaptopOutlined style={{ fontSize: 24, color: 'var(--primary)' }} />, label: 'CPU', rec: 'AMD Ryzen 9 7950X', price: '$549' },
                  { icon: <CodeOutlined style={{ fontSize: 24, color: 'var(--primary)' }} />, label: 'RAM', rec: 'Corsair 64GB DDR5', price: '$189' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    style={{
                      padding: 20,
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      background: 'white',
                    }}
                  >
                    {item.icon}
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 12, marginBottom: 4 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.rec}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>{item.price}</div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={() => { setCurrentStep(0); setSelections({}); }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '12px 28px',
                  fontSize: 14,
                  fontWeight: 600,
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'white',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                }}
              >
                <ThunderboltOutlined /> Start Over
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
}
