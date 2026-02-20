'use client';

import { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckoutStep } from '@/types/checkout';

type SectionVariant = 'fade' | 'card' | 'divider' | 'numbered';
const VARIANT_LIST: SectionVariant[] = ['fade', 'card', 'divider', 'numbered'];

interface ScrollSectionProps {
  id: string;
  title: string;
  subtitle: string;
  stepId: CheckoutStep;
  stepIndex: number;
  isActive: boolean;
  variant?: SectionVariant;
  children: ReactNode;
}

const SectionDevToggleBar = ({
  variant,
  onChange,
}: {
  variant: SectionVariant;
  onChange: (v: SectionVariant) => void;
}) => (
  <div className="flex items-center gap-1 font-mono text-[10px]">
    <span className="text-gray-400 mr-1">Section:</span>
    {VARIANT_LIST.map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        aria-label={`Switch to ${v} section variant`}
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
// FADE — Classic fade + slide-up
// ═══════════════════════════════════════════════════════════════

const FadeVariant = forwardRef<HTMLDivElement, ScrollSectionProps>(
  ({ id, title, subtitle, children }, ref) => (
    <div ref={ref} id={id} className="scroll-mt-28 py-6">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mb-5">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <div>{children}</div>
      </motion.div>
    </div>
  )
);
FadeVariant.displayName = 'FadeVariant';

// ═══════════════════════════════════════════════════════════════
// CARD — Card with border/shadow that elevates when active
// ═══════════════════════════════════════════════════════════════

const CardVariant = forwardRef<HTMLDivElement, ScrollSectionProps>(
  ({ id, title, subtitle, isActive, children }, ref) => (
    <div ref={ref} id={id} className="scroll-mt-28 py-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={cn(
          'rounded-2xl border transition-all duration-300 overflow-hidden',
          isActive ? 'border-gray-200 shadow-lg bg-white' : 'border-gray-100 shadow-sm bg-white/80'
        )}
      >
        <div
          className={cn(
            'px-5 py-4 border-b transition-colors duration-300',
            isActive ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50/50'
          )}
        >
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  )
);
CardVariant.displayName = 'CardVariant';

// ═══════════════════════════════════════════════════════════════
// DIVIDER — Editorial style, title left + content right
// ═══════════════════════════════════════════════════════════════

const DividerVariant = forwardRef<HTMLDivElement, ScrollSectionProps>(
  ({ id, title, subtitle, isActive, children }, ref) => (
    <div ref={ref} id={id} className="scroll-mt-28 py-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-4 mb-5">
          <div
            className={cn(
              'h-px flex-1 transition-colors duration-300',
              isActive ? 'bg-gray-300' : 'bg-gray-200'
            )}
          />
        </div>
        <div className="flex flex-col lg:flex-row lg:gap-8">
          <div className="lg:w-48 lg:flex-shrink-0 mb-4 lg:mb-0 lg:sticky lg:top-32 lg:self-start">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          </div>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </motion.div>
    </div>
  )
);
DividerVariant.displayName = 'DividerVariant';

// ═══════════════════════════════════════════════════════════════
// NUMBERED — Big step number left, content right, vertical line
// ═══════════════════════════════════════════════════════════════

const NumberedVariant = forwardRef<HTMLDivElement, ScrollSectionProps>(
  ({ id, title, subtitle, stepIndex, isActive, children }, ref) => (
    <div ref={ref} id={id} className="scroll-mt-28 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex gap-4 lg:gap-6"
      >
        <div className="flex flex-col items-center flex-shrink-0">
          <motion.div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all duration-300',
              isActive
                ? 'bg-gray-900 border-gray-900 text-white'
                : 'bg-white border-gray-200 text-gray-400'
            )}
            animate={{ scale: isActive ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {stepIndex + 1}
          </motion.div>
          <div className="w-px flex-1 bg-gray-200 mt-2 min-h-[20px]" />
        </div>
        <div className="flex-1 min-w-0 pb-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <div>{children}</div>
        </div>
      </motion.div>
    </div>
  )
);
NumberedVariant.displayName = 'NumberedVariant';

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

const VARIANT_MAP: Record<
  SectionVariant,
  React.ForwardRefExoticComponent<ScrollSectionProps & React.RefAttributes<HTMLDivElement>>
> = {
  fade: FadeVariant,
  card: CardVariant,
  divider: DividerVariant,
  numbered: NumberedVariant,
};

const ScrollSection = forwardRef<HTMLDivElement, ScrollSectionProps>((props, ref) => {
  const activeVariant = props.variant ?? 'fade';
  const VariantComponent = VARIANT_MAP[activeVariant];
  return <VariantComponent ref={ref} {...props} />;
});
ScrollSection.displayName = 'ScrollSection';

export default ScrollSection;
export { SectionDevToggleBar, VARIANT_LIST as SECTION_VARIANT_LIST };
export type { SectionVariant, ScrollSectionProps };
