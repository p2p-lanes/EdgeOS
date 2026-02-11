'use client';

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCheckout } from '@/providers/checkoutProvider';
import { useCityProvider } from '@/providers/cityProvider';
import { CheckoutStep } from '@/types/checkout';
import PassSelectionSection from './PassSelectionSection';
import CheckoutSkeleton from './CheckoutSkeleton';
import HousingStep from './HousingStep';
import MerchSection from './MerchSection';
import PatronSection from './PatronSection';
import ConfirmStep from './ConfirmStep';
import SuccessStep from './SuccessStep';
import CartFooter from './CartFooter';
import { AttendeeCategory } from '@/types/Attendee';

// Get step title for content area
function getStepTitle(step: CheckoutStep): string {
  switch (step) {
    case 'passes':
      return 'Select Your Passes';
    case 'housing':
      return 'Choose Housing';
    case 'merch':
      return 'Event Merchandise';
    case 'patron':
      return 'Support Edge City';
    case 'confirm':
      return 'Review & Confirm';
    case 'success':
      return ''; // Success step has its own header
    default:
      return '';
  }
}

// Get step subtitle for content area
function getStepSubtitle(step: CheckoutStep): string {
  switch (step) {
    case 'passes':
      return 'Choose passes for yourself and family members';
    case 'housing':
      return 'Optional: Book accommodation for your stay';
    case 'merch':
      return 'Optional: Pick up exclusive merch at the event';
    case 'patron':
      return 'Optional: Help fund scholarships for builders';
    case 'confirm':
      return 'Review your order before payment';
    case 'success':
      return ''; // Success step has its own content
    default:
      return '';
  }
}

interface CheckoutFlowProps {
  onAddAttendee?: (category: AttendeeCategory) => void;
  onPaymentComplete?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function CheckoutFlow({ onAddAttendee, onPaymentComplete, onBack, isLoading = false }: CheckoutFlowProps) {
  const {
    currentStep,
    availableSteps,
    goToNextStep,
    goToPreviousStep,
    isStepComplete,
    cart,
    housingProducts,
    merchProducts,
    patronProducts,
    submitPayment,
  } = useCheckout();

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleSkip = () => {
    goToNextStep();
  };

  const handleBack = () => {
    const currentIndex = availableSteps.findIndex(s => s === currentStep);
    if (currentIndex > 0) {
      goToPreviousStep();
    } else if (onBack) {
      onBack();
    }
  };

  const handlePayment = async () => {
    const result = await submitPayment();
    if (result.success) {
      onPaymentComplete?.();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'passes':
        return (
          <AnimatePresence mode="wait">
            {isLoading ? (
              <CheckoutSkeleton key="skeleton" />
            ) : (
              <PassSelectionSection key="passes" onAddAttendee={onAddAttendee} />
            )}
          </AnimatePresence>
        );
      case 'housing':
        return housingProducts.length > 0 ? <HousingStep onSkip={handleSkip} /> : null;
      case 'merch':
        return merchProducts.length > 0 ? <MerchSection onSkip={handleSkip} /> : null;
      case 'patron':
        return patronProducts.length > 0 ? <PatronSection onSkip={handleSkip} /> : null;
      case 'confirm':
        return <ConfirmStep />;
      case 'success':
        return <SuccessStep />;
      default:
        return null;
    }
  };

  // Hide header and footer on success step
  const showHeader = currentStep !== 'success';
  const showFooter = currentStep !== 'success';

  return (
    <div className="flex flex-col bg-[#F5F5F7] font-sans text-gray-900 rounded-lg">
      {/* Main Content */}
      <main className="flex-1 max-w-md lg:max-w-2xl mx-auto px-4 pt-6 pb-4 w-full">
        {/* Step Header - hidden on success step */}
        {showHeader && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {getStepTitle(currentStep)}
            </h1>
            <p className="text-gray-500 mt-1">
              {getStepSubtitle(currentStep)}
            </p>
          </div>
        )}

        {/* Step Content */}
        {renderStepContent()}
      </main>

      {/* Cart Footer - sticky at bottom, hidden on success step */}
      {showFooter && (
        <div className="sticky bottom-0 w-full z-30">
          <div className="max-w-md lg:max-w-2xl mx-auto px-4">
            <CartFooter onPay={handlePayment} onBack={handleBack} />
          </div>
        </div>
      )}
    </div>
  );
}
