'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket,
  Heart,
  Home,
  ShoppingBag,
  CheckCircle,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheckoutStep, CHECKOUT_STEPS } from '@/types/checkout';

const DEV_TOGGLE = true;

type NavbarVariant = 'pills' | 'dots' | 'minimal' | 'segmented';
const VARIANT_LIST: NavbarVariant[] = ['pills', 'dots', 'minimal', 'segmented'];

interface StepNavbarProps {
  steps: CheckoutStep[];
  currentStep: CheckoutStep;
  onStepClick: (step: CheckoutStep) => void;
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  Ticket: <Ticket className="w-3.5 h-3.5" />,
  Heart: <Heart className="w-3.5 h-3.5" />,
  Home: <Home className="w-3.5 h-3.5" />,
  ShoppingBag: <ShoppingBag className="w-3.5 h-3.5" />,
  CheckCircle: <CheckCircle className="w-3.5 h-3.5" />,
};

const getStepConfig = (stepId: CheckoutStep) =>
  CHECKOUT_STEPS.find((s) => s.id === stepId);

const DevToggleBar = ({
  variant,
  onChange,
}: {
  variant: NavbarVariant;
  onChange: (v: NavbarVariant) => void;
}) => (
  <div className="flex items-center justify-center gap-1 py-1 font-mono text-[10px]">
    {VARIANT_LIST.map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        aria-label={`Switch to ${v} navbar variant`}
        tabIndex={0}
        className={cn(
          'px-2 py-0.5 rounded transition-colors capitalize',
          variant === v
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        )}
      >
        {v}
      </button>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// PILLS — Horizontal pills, active = solid bg, completed = check
// ═══════════════════════════════════════════════════════════════

const PillsVariant = ({ steps, currentStep, onStepClick }: StepNavbarProps) => {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto scrollbar-hide">
      {steps.map((stepId, index) => {
        const config = getStepConfig(stepId);
        if (!config) return null;
        const isActive = stepId === currentStep;
        const isCompleted = index < currentIndex;

        return (
          <button
            key={stepId}
            onClick={() => onStepClick(stepId)}
            aria-label={`Go to ${config.label} step`}
            aria-current={isActive ? 'step' : undefined}
            tabIndex={0}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0',
              isActive
                ? 'bg-gray-900 text-white shadow-sm'
                : isCompleted
                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            {isCompleted ? (
              <Check className="w-3 h-3" strokeWidth={3} />
            ) : (
              STEP_ICONS[config.icon]
            )}
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// DOTS — Connected dots with animated progress line
// ═══════════════════════════════════════════════════════════════

const DotsVariant = ({ steps, currentStep, onStepClick }: StepNavbarProps) => {
  const currentIndex = steps.indexOf(currentStep);
  const progress = steps.length > 1 ? currentIndex / (steps.length - 1) : 0;

  return (
    <div className="px-6 py-3">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200" />
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-900 origin-left"
          initial={false}
          animate={{ scaleX: progress }}
          style={{ width: '100%' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />

        {steps.map((stepId, index) => {
          const config = getStepConfig(stepId);
          if (!config) return null;
          const isActive = stepId === currentStep;
          const isCompleted = index < currentIndex;

          return (
            <button
              key={stepId}
              onClick={() => onStepClick(stepId)}
              aria-label={`Go to ${config.label} step`}
              aria-current={isActive ? 'step' : undefined}
              tabIndex={0}
              className="relative z-10 flex flex-col items-center gap-1.5 group"
            >
              <motion.div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors',
                  isActive
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400 group-hover:border-gray-400'
                )}
                initial={false}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                ) : (
                  <span className="text-[10px] font-bold">{index + 1}</span>
                )}
              </motion.div>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  isActive ? 'text-gray-900' : isCompleted ? 'text-green-600' : 'text-gray-400'
                )}
              >
                {config.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MINIMAL — Current step text with arrows, breadcrumb style
// ═══════════════════════════════════════════════════════════════

const MinimalVariant = ({ steps, currentStep, onStepClick }: StepNavbarProps) => {
  const currentIndex = steps.indexOf(currentStep);
  const config = getStepConfig(currentStep);
  const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;

  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <button
        onClick={() => prevStep && onStepClick(prevStep)}
        disabled={!prevStep}
        aria-label="Previous step"
        tabIndex={0}
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          prevStep ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 tabular-nums">
          {currentIndex + 1}/{steps.length}
        </span>
        <span className="text-sm font-semibold text-gray-900">{config?.label}</span>
      </div>

      <button
        onClick={() => nextStep && onStepClick(nextStep)}
        disabled={!nextStep}
        aria-label="Next step"
        tabIndex={0}
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          nextStep ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SEGMENTED — iOS-style segmented control
// ═══════════════════════════════════════════════════════════════

const SegmentedVariant = ({ steps, currentStep, onStepClick }: StepNavbarProps) => {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="px-4 py-2.5">
      <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
        {steps.map((stepId, index) => {
          const config = getStepConfig(stepId);
          if (!config) return null;
          const isActive = stepId === currentStep;
          const isCompleted = index < currentIndex;

          return (
            <button
              key={stepId}
              onClick={() => onStepClick(stepId)}
              aria-label={`Go to ${config.label} step`}
              aria-current={isActive ? 'step' : undefined}
              tabIndex={0}
              className={cn(
                'relative flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all',
                isActive
                  ? 'text-gray-900'
                  : isCompleted
                  ? 'text-green-600 hover:text-green-700'
                  : 'text-gray-400 hover:text-gray-500'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="segmented-active"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                {isCompleted && <Check className="w-3 h-3" strokeWidth={3} />}
                <span className="hidden sm:inline">{config.label}</span>
                <span className="sm:hidden">{config.label.slice(0, 3)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

const VARIANT_MAP: Record<NavbarVariant, React.ComponentType<StepNavbarProps>> = {
  pills: PillsVariant,
  dots: DotsVariant,
  minimal: MinimalVariant,
  segmented: SegmentedVariant,
};

export default function StepNavbar(props: StepNavbarProps) {
  const [variant, setVariant] = useState<NavbarVariant>('pills');
  const VariantComponent = VARIANT_MAP[variant];

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-100">
      {DEV_TOGGLE && <DevToggleBar variant={variant} onChange={setVariant} />}
      <VariantComponent {...props} />
    </div>
  );
}
