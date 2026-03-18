'use client';

import { AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Form } from 'antd';
import { RootState } from '@/store';
import AnimatedPage from '@/components/AnimatedLayout/AnimatedLayout';
import Surveys from '@/components/SetupBuilder/Surveys';
import ReviewBuild from '@/components/SetupBuilder/ReviewBuild';
import { steps } from '@/components/SetupBuilder/builderData';
import { useState, useEffect } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { SetBuilderRecommendation, fetchSetBuilderRecommendation } from '@/services/setbuilderApi';

export default function SetupBuilderPage() {
  const [form] = Form.useForm();
  const { currentStep, selections } = useSelector((state: RootState) => state.builder);
  const { selectedCurrency } = useCurrency();
  const isSurvey = currentStep < steps.length - 1;

  const [aiRecommendation, setAiRecommendation] = useState<SetBuilderRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch recommendation when user reaches the review step
  useEffect(() => {
    if (!isSurvey) {
      setIsLoading(true);
      setError(null);
      fetchSetBuilderRecommendation(selections, selectedCurrency)
        .then((data) => {
          setAiRecommendation(data);
        })
        .catch((err) => {
          console.error('SetBuilder API error:', err);
          setError('Failed to generate recommendation. Using fallback.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isSurvey, selections, selectedCurrency]);

  return (
    <AnimatedPage>
      <div className="container" style={{ paddingTop: 64, paddingBottom: 100 }}>
        <Form form={form} layout="vertical">
          <AnimatePresence mode="wait">
            {isSurvey ? (
              <Surveys />
            ) : (
              <ReviewBuild
                aiRecommendation={aiRecommendation}
                isLoading={isLoading}
                error={error}
              />
            )}
          </AnimatePresence>
        </Form>
      </div>
    </AnimatedPage>
  );
}
