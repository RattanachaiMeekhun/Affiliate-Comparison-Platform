import React from 'react';
import { motion } from 'framer-motion';
import { Progress, Tag } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, BulbOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Form } from 'antd';
import { RootState } from '@/store';
import { setSelection, setStep, setCustomRequirements } from '@/store/slices/builderSlice';
import { steps, budgetLabels } from './builderData';
import { useCurrency } from '@/context/CurrencyContext';
import SurveysCheckbox from './SurveysCheckbox';

type Props = {
  onSurveyComplete: () => void;
};

const Surveys = ({ onSurveyComplete }: Props) => {
  const dispatch = useDispatch();
  const { currentStep, selections } = useSelector((state: RootState) => state.builder);
  const { selectedCurrency: currency } = useCurrency();
  const form = Form.useFormInstance();

  const step = steps[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  const handleSelect = (sectionId: string, optionLabel: string) => {
    dispatch(setSelection({ sectionId, optionLabel }));
    form.setFieldsValue({ [sectionId]: optionLabel });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      dispatch(setStep(currentStep + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onSurveyComplete();
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
    >
      <div style={{ marginBottom: 48 }}>
        <h1
          style={{
            fontSize: 40,
            fontWeight: 800,
            marginBottom: 12,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          AI Setup Builder
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 32 }}>
          {step.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              flexGrow: 1,
              height: 6,
              background: 'var(--border)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              style={{ height: '100%', background: 'var(--primary)' }}
            />
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
            }}
          >
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {step.sections.map((section, sIdx) => (
          <div key={section.id}>
            <Form.Item
              name={section.id}
              rules={[{ required: true, message: `Please select ${section.label}` }]}
              initialValue={selections[section.id]}
              style={{ marginBottom: 0 }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: 20,
                    color: 'var(--text-primary)',
                  }}
                >
                  {section.label}
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 12,
                  }}
                >
                  {section.options.map((opt) => {
                    let displayLabel = opt.label;
                    if (section.id === 'budget') {
                      const mappedLabel = budgetLabels[currency]?.[opt.id];
                      if (mappedLabel) displayLabel = mappedLabel;
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
            </Form.Item>
          </div>
        ))}
      </div>

      {/* Additional Requirements textarea — shown on last survey step */}
      {currentStep === steps.length - 2 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            marginTop: 40,
            padding: 24,
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--primary-light)',
            background: 'var(--primary-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <BulbOutlined style={{ color: 'var(--primary)', fontSize: 18 }} />
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Additional Requirements
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  marginLeft: 8,
                }}
              >
                (Optional)
              </span>
            </h3>
          </div>
          <textarea
            onChange={(e) => dispatch(setCustomRequirements(e.target.value))}
            placeholder="e.g. I need Wi-Fi 7 motherboard, prefer white components, want to do live streaming, need at least 2TB storage, prefer quiet fans..."
            rows={3}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'white',
              fontSize: 14,
              fontFamily: 'inherit',
              lineHeight: 1.6,
              resize: 'vertical',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, marginBottom: 0 }}>
            Tell our AI about any specific needs — it will factor these into your personalized build.
          </p>
        </motion.div>
      )}

      <div
        style={{
          marginTop: 64,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 32,
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              style={{
                padding: '10px 20px',
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
            </button>
          ) : (
            <div />
          )}
        </div>

        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '12px 32px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--text-primary)',
            color: 'white',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {currentStep === steps.length - 1 ? 'View Full Build' : 'Continue'} <ArrowRightOutlined />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Surveys;
