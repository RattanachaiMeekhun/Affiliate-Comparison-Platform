'use client';

import { AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Row, Col } from 'antd';
import { RootState } from '@/store';
import AnimatedPage from '@/components/AnimatedLayout/AnimatedLayout';
import Surveys from '@/components/SetupBuilder/Surveys';
import ReviewBuild from '@/components/SetupBuilder/ReviewBuild';
import EstimatedBuild from '@/components/SetupBuilder/EstimatedBuild';
import { steps } from '@/components/SetupBuilder/builderData';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { SetBuilderResponse, fetchSetBuilderRecommendation } from '@/services/setbuilderApi';
import { useSearchParams } from 'next/navigation';
import { setSelection } from '@/store/slices/builderSlice';

function SetupBuilderContent() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { currentStep, selections } = useSelector((state: RootState) => state.builder);
  const { selectedCurrency } = useCurrency();
  const isSurvey = currentStep < steps.length - 1;

  const [aiResponse, setAiResponse] = useState<SetBuilderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle query params to initialize selections
  useEffect(() => {
    const useCase = searchParams.get('use-case');
    if (useCase) {
      const useCaseSection = steps[0].sections.find((s) => s.id === 'use-case');
      const option = useCaseSection?.options.find(
        (o) => o.id === useCase || o.label.toLowerCase() === useCase.toLowerCase()
      );
      if (option) {
        dispatch(setSelection({ sectionId: 'use-case', optionLabel: option.label }));
        form.setFieldsValue({ 'use-case': option.label });
      }
    }
  }, [searchParams, dispatch, form]);

  // Fetch AI recommendation when survey is completed
  const handleSurveyComplete = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSetBuilderRecommendation(selections, selectedCurrency);
      setAiResponse(data);
    } catch (err) {
      console.error('SetBuilder API error:', err);
      setError('Offline');
    } finally {
      setIsLoading(false);
    }
  }, [selections, selectedCurrency]);

  return (
    <div className="container" style={{ paddingTop: 64, paddingBottom: 100 }}>
      <Form form={form} layout="vertical">
        <Row gutter={[48, 48]}>
          <Col xs={24} lg={14}>
            <AnimatePresence mode="wait">
              <Surveys onSurveyComplete={handleSurveyComplete} />
            </AnimatePresence>
          </Col>

          <Col xs={24} lg={10}>
            <EstimatedBuild aiResponse={aiResponse} isLoading={isLoading} error={error} />
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default function SetupBuilderPage() {
  return (
    <AnimatedPage>
      <Suspense fallback={<div>Loading...</div>}>
        <SetupBuilderContent />
      </Suspense>
    </AnimatedPage>
  );
}
