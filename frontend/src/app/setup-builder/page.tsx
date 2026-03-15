'use client';

import { AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import AnimatedPage from '@/components/AnimatedLayout/AnimatedLayout';
import Surveys from '@/components/SetupBuilder/Surveys';
import ReviewBuild from '@/components/SetupBuilder/ReviewBuild';
import { steps } from '@/components/SetupBuilder/builderData';

export default function SetupBuilderPage() {
  const { currentStep } = useSelector((state: RootState) => state.builder);
  const isSurvey = currentStep < steps.length - 1;

  return (
    <AnimatedPage>
      <div className="container" style={{ paddingTop: 64, paddingBottom: 100 }}>
        <AnimatePresence mode="wait">
          {isSurvey ? (
            <Surveys />
          ) : (
            <ReviewBuild />
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
}
