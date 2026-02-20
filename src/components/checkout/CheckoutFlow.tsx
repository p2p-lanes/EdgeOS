'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCheckout } from '@/providers/checkoutProvider';
import { CheckoutStep } from '@/types/checkout';
import { AttendeeCategory } from '@/types/Attendee';

import StepNavbar from './StepNavbar';
import ScrollSection, {
  SectionDevToggleBar,
  type SectionVariant,
} from './ScrollSection';
import PassSelectionSection from './PassSelectionSection';
import CheckoutSkeleton from './CheckoutSkeleton';
import HousingStep from './HousingStep';
import MerchSection from './MerchSection';
import PatronSection from './PatronSection';
import ConfirmStep from './ConfirmStep';
import SuccessStep from './SuccessStep';
import CartFooter from './CartFooter';

const DEV_TOGGLE = true;

function getStepTitle(step: CheckoutStep): string {
  switch (step) {
    case 'passes':
      return 'Select Your Passes';
    case 'housing':
      return 'Choose Housing';
    case 'merch':
      return 'Event Merchandise';
    case 'patron':
      return 'Become a Patron';
    case 'confirm':
      return 'Review & Confirm';
    default:
      return '';
  }
}

function getStepSubtitle(step: CheckoutStep): string {
  switch (step) {
    case 'passes':
      return 'Choose passes for yourself and family members';
    case 'housing':
      return 'Optional: Book accommodation for your stay';
    case 'merch':
      return 'Optional: Pick up exclusive merch at the event';
    case 'patron':
      return 'Optional: Support Edge City\u2019s mission with a donation';
    case 'confirm':
      return 'Review your order before payment';
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

export default function CheckoutFlow({
  onAddAttendee,
  onPaymentComplete,
  onBack,
  isLoading = false,
}: CheckoutFlowProps) {
  const {
    currentStep,
    availableSteps,
    goToStep,
    cart,
    housingProducts,
    merchProducts,
    patronProducts,
    submitPayment,
  } = useCheckout();

  const [sectionVariant, setSectionVariant] = useState<SectionVariant>('fade');
  const sectionRefs = useRef<Map<CheckoutStep, HTMLDivElement | null>>(new Map());
  const isScrollingRef = useRef(false);

  const scrollableSteps = useMemo(
    () => availableSteps.filter((s) => s !== 'success'),
    [availableSteps]
  );

  // ── IntersectionObserver: track which section is in view ──
  useEffect(() => {
    if (currentStep === 'success') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;

        let maxRatio = 0;
        let mostVisibleStep: CheckoutStep | null = null;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            const id = entry.target.id;
            if (id?.startsWith('section-')) {
              mostVisibleStep = id.replace('section-', '') as CheckoutStep;
            }
          }
        });

        if (mostVisibleStep && mostVisibleStep !== currentStep) {
          goToStep(mostVisibleStep);
        }
      },
      {
        root: null,
        rootMargin: '-30% 0px -50% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [currentStep, goToStep, scrollableSteps, sectionVariant]);

  const scrollToSection = useCallback(
    (step: CheckoutStep) => {
      const el = sectionRefs.current.get(step);
      if (!el) return;

      isScrollingRef.current = true;
      goToStep(step);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    },
    [goToStep]
  );

  const scrollToNextSection = useCallback(() => {
    const idx = scrollableSteps.indexOf(currentStep as typeof scrollableSteps[number]);
    if (idx >= 0 && idx < scrollableSteps.length - 1) {
      scrollToSection(scrollableSteps[idx + 1]);
    }
  }, [currentStep, scrollableSteps, scrollToSection]);

  const scrollToPreviousSection = useCallback(() => {
    const idx = scrollableSteps.indexOf(currentStep as typeof scrollableSteps[number]);
    if (idx > 0) {
      scrollToSection(scrollableSteps[idx - 1]);
    } else if (onBack) {
      onBack();
    }
  }, [currentStep, scrollableSteps, scrollToSection, onBack]);

  const handleStepClick = useCallback(
    (step: CheckoutStep) => scrollToSection(step),
    [scrollToSection]
  );

  const handlePayment = async () => {
    const result = await submitPayment();
    if (result.success) onPaymentComplete?.();
  };

  const handleSkip = useCallback(() => scrollToNextSection(), [scrollToNextSection]);

  const setSectionRef = useCallback(
    (step: CheckoutStep) => (el: HTMLDivElement | null) => {
      sectionRefs.current.set(step, el);
    },
    []
  );

  const renderStepContent = (step: CheckoutStep) => {
    switch (step) {
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
      default:
        return null;
    }
  };

  // ── SUCCESS: Full-screen ──
  if (currentStep === 'success') {
    return (
      <div className="flex flex-col bg-[#F5F5F7] font-sans text-gray-900 rounded-lg">
        <main className="flex-1 max-w-md lg:max-w-2xl mx-auto px-4 pt-6 pb-4 w-full">
          <SuccessStep />
        </main>
      </div>
    );
  }

  // ── SCROLLABLE CHECKOUT ──
  return (
    <div className="flex flex-col bg-[#F5F5F7] font-sans text-gray-900 rounded-lg min-h-screen">
      {/* Sticky Top Navbar */}
      <div className="sticky top-0 z-40">
        <StepNavbar
          steps={scrollableSteps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Dev Toggle for Section Variant */}
      {DEV_TOGGLE && (
        <div className="max-w-md lg:max-w-2xl mx-auto px-4 pt-3 w-full">
          <SectionDevToggleBar variant={sectionVariant} onChange={setSectionVariant} />
        </div>
      )}

      {/* All sections stacked */}
      <main className="flex-1 max-w-md lg:max-w-2xl mx-auto px-4 pb-32 w-full">
        {scrollableSteps.map((step, index) => (
          <ScrollSection
            key={step}
            ref={setSectionRef(step)}
            id={`section-${step}`}
            title={getStepTitle(step)}
            subtitle={getStepSubtitle(step)}
            stepId={step}
            stepIndex={index}
            isActive={step === currentStep}
            variant={sectionVariant}
          >
            {renderStepContent(step)}
          </ScrollSection>
        ))}
      </main>

      {/* Sticky Cart Footer */}
      <div className="sticky bottom-0 w-full z-30">
        <div className="max-w-md lg:max-w-2xl mx-auto px-4">
          <CartFooter
            onPay={handlePayment}
            onBack={onBack}
            onScrollToNext={scrollToNextSection}
            onScrollToPrevious={scrollToPreviousSection}
          />
        </div>
      </div>
    </div>
  );
}
