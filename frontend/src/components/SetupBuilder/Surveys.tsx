import React from 'react';
import { motion } from 'framer-motion';
import { Progress, Tag } from 'antd';
import { 
  ArrowLeftOutlined, 
  ArrowRightOutlined 
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setSelection, setStep } from '@/store/slices/builderSlice';
import { steps, budgetLabels } from './builderData';
import { useCurrency } from '@/context/CurrencyContext';
import SurveysCheckbox from './SurveysCheckbox';

const Surveys = () => {
  const dispatch = useDispatch();
  const { currentStep, selections } = useSelector((state: RootState) => state.builder);
  const { selectedCurrency: currency } = useCurrency();

  const step = steps[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  const handleSelect = (sectionId: string, optionLabel: string) => {
    dispatch(setSelection({ sectionId, optionLabel }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      dispatch(setStep(currentStep + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      dispatch(setStep(currentStep - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      key="survey"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="survey-container"
      style={{ maxWidth: 800, margin: '0 auto' }}
    >
      <div style={{ marginBottom: 64, textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 48,
            fontWeight: 800,
            marginBottom: 16,
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI Build Assistant
        </h1>
        <p
          style={{
            fontSize: 18,
            color: 'var(--text-muted)',
            marginBottom: 40,
            maxWidth: 640,
            margin: '0 auto',
          }}
        >
          {step.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Progress
            percent={progressPercent}
            strokeColor="var(--primary)"
            railColor="var(--border)"
            showInfo={false}
            status="active"
            style={{ maxWidth: 300 }}
          />
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--primary)',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
        {step.sections.map((section, sIdx) => (
          <div key={section.id}>
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * sIdx }}
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Tag
                color="blue"
                style={{
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: 0,
                }}
              >
                {sIdx + 1}
              </Tag>
              {section.label}
            </motion.h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 16,
              }}
            >
              {section.options.map((opt) => {
                let displayLabel = opt.label;
                if (section.id === 'budget') {
                  const mappedLabel = budgetLabels[currency]?.[opt.id];
                  if (mappedLabel) {
                    displayLabel = mappedLabel;
                  }
                }
                const isSelected = selections[section.id] === displayLabel;
                
                return (
                  <SurveysCheckbox
                    key={opt.id}
                    opt={{ ...opt, label: displayLabel }}
                    handleSelect={handleSelect}
                    isSelected={isSelected}
                    section={section}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 80,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white',
          padding: '24px 32px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          {currentStep > 0 && (
            <motion.button
              onClick={handleBack}
              whileHover={{ x: -2 }}
              style={{
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ArrowLeftOutlined /> Back
            </motion.button>
          )}
        </div>

        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '14px 40px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--primary)',
            color: 'white',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)',
          }}
        >
          Continue <ArrowRightOutlined />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Surveys;
