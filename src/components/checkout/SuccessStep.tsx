'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Ticket,
  PartyPopper,
  Check,
  CalendarDays,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCheckout } from '@/providers/checkoutProvider';
import { formatCurrency } from '@/types/checkout';
import { useCityProvider } from '@/providers/cityProvider';

// ── Dev toggle: set to false (or remove) to hide the variant switcher ──
const DEV_TOGGLE = false;

type SuccessVariant =
  | 'minimal'
  | 'kinetic'
  | 'confetti'
  | 'narrative'
  | 'terminal'
  | 'receipt'
  | 'stamp'
  | 'ticket'
  | 'stack'
  | 'glass'
  | 'split';

const VARIANT_LIST: SuccessVariant[] = [
  'minimal', 'kinetic', 'confetti', 'narrative', 'terminal',
  'receipt', 'stamp', 'ticket', 'stack', 'glass', 'split',
];

interface SuccessStepProps {
  onComplete?: () => void;
}

// ─── Shared footer: countdown + CTA button ─────────────────────────────────
interface SharedFooterProps {
  countdown: number;
  onGoToPasses: () => void;
  dark?: boolean;
}

const SharedFooter = ({ countdown, onGoToPasses, dark = false }: SharedFooterProps) => (
  <motion.div
    className="flex flex-col items-center gap-3 mt-8"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.8, duration: 0.4 }}
  >
    <p className={cn('text-sm', dark ? 'text-slate-400' : 'text-gray-500')}>
      Redirecting in {countdown}s...
    </p>
    <Button onClick={onGoToPasses}>
      Go to My Passes
      <ArrowRight className="w-4 h-4" />
    </Button>
  </motion.div>
);

// ─── Dev Toggle Bar ────────────────────────────────────────────────────────────
const DevToggleBar = ({
  variant,
  onChange,
}: {
  variant: SuccessVariant;
  onChange: (v: SuccessVariant) => void;
}) => (
  <div className="flex flex-wrap items-center justify-center gap-1 mb-4 font-mono text-[10px]">
    {VARIANT_LIST.map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        aria-label={`Switch to ${v} variant`}
        tabIndex={0}
        className={cn(
          'px-2.5 py-1 rounded-md transition-colors capitalize',
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

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 1 — MINIMAL: SVG path draw + fade
// ═══════════════════════════════════════════════════════════════════════════════

const MinimalVariant = ({ countdown, onGoToPasses }: SharedFooterProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4">
      {/* Pulse ring */}
      <motion.div
        className="absolute w-32 h-32 rounded-full border-2 border-green-300"
        initial={{ scale: 0.6, opacity: 0.8 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 2, ease: 'easeOut', repeat: Infinity, repeatDelay: 1 }}
      />

      {/* SVG check circle — path draw */}
      <div className="relative w-24 h-24 mb-8">
        <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
          {/* Circle stroke */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#16a34a"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
          {/* Check mark path */}
          <motion.path
            d="M30 52 L44 66 L70 38"
            fill="none"
            stroke="#16a34a"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
      </div>

      {/* Title */}
      <motion.h1
        className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        Payment Successful
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-gray-500 max-w-xs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.4 }}
      >
        Your passes are ready and waiting for you.
      </motion.p>

      <SharedFooter countdown={countdown} onGoToPasses={onGoToPasses} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 2 — KINETIC: Big sliding typography + count-up
// ═══════════════════════════════════════════════════════════════════════════════

const useCountUp = (target: number, duration: number = 1.5, delay: number = 0.8) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now() + delay * 1000;
    const endTime = startTime + duration * 1000;

    const tick = () => {
      const now = Date.now();
      if (now < startTime) {
        requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min((now - startTime) / (endTime - startTime), 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, delay]);

  return value;
};

const KineticVariant = ({
  countdown,
  onGoToPasses,
  grandTotal,
}: SharedFooterProps & { grandTotal: number }) => {
  const animatedTotal = useCountUp(grandTotal, 1.5, 0.6);

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4 overflow-hidden">
      {/* Check bounce from top */}
      <motion.div
        className="mb-6"
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
      >
        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
          <Check className="w-9 h-9 text-white" strokeWidth={3} />
        </div>
      </motion.div>

      {/* "Payment" slides in from left */}
      <div className="overflow-hidden">
        <motion.h1
          className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none"
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          Payment
        </motion.h1>
      </div>

      {/* "Successful" slides in from right */}
      <div className="overflow-hidden">
        <motion.h1
          className="text-5xl md:text-7xl font-black text-green-600 tracking-tighter leading-none"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        >
          Successful
        </motion.h1>
      </div>

      {/* Animated total */}
      <motion.div
        className="mt-6 mb-2"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <span className="text-4xl md:text-5xl font-black text-gray-900 tabular-nums">
          {formatCurrency(animatedTotal)}
        </span>
      </motion.div>

      <motion.p
        className="text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
      >
        charged successfully
      </motion.p>

      <SharedFooter countdown={countdown} onGoToPasses={onGoToPasses} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 3 — CONFETTI: Particle burst + spring icon
// ═══════════════════════════════════════════════════════════════════════════════

const PARTICLE_COUNT = 40;
const PARTICLE_COLORS = [
  '#16a34a', '#22c55e', '#f59e0b', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

interface ParticleData {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  rotation: number;
}

const generateParticles = (): ParticleData[] =>
  Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = 80 + Math.random() * 160;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 4 + Math.random() * 8,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      delay: Math.random() * 0.3,
      rotation: Math.random() * 360,
    };
  });

const ConfettiVariant = ({ countdown, onGoToPasses }: SharedFooterProps) => {
  const particles = useMemo(() => generateParticles(), []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4 relative overflow-hidden">
      {/* Particle burst */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-sm"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
            }}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
            animate={{
              x: p.x,
              y: p.y,
              scale: [0, 1.2, 0.8],
              rotate: p.rotation,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 1.4,
              delay: 0.2 + p.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ))}
      </div>

      {/* Success icon */}
      <motion.div
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 relative z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 250, damping: 15 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 12 }}
        >
          <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.h1
        className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Payment Successful!
      </motion.h1>

      <motion.p
        className="text-gray-500 max-w-xs relative z-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.4 }}
      >
        Your passes are ready and waiting for you.
      </motion.p>

      <div className="relative z-10">
        <SharedFooter countdown={countdown} onGoToPasses={onGoToPasses} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 4 — NARRATIVE: Scrollytelling timeline
// ═══════════════════════════════════════════════════════════════════════════════

interface NarrativeStepData {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  delay: number;
}

const NarrativeVariant = ({
  countdown,
  onGoToPasses,
  grandTotal,
  passCount,
}: SharedFooterProps & { grandTotal: number; passCount: number }) => {
  const steps: NarrativeStepData[] = [
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: 'Order placed',
      subtitle: 'Your order has been received',
      delay: 0.3,
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: 'Payment confirmed',
      subtitle: `${formatCurrency(grandTotal)} charged successfully`,
      delay: 0.9,
    },
    {
      icon: <Ticket className="w-5 h-5" />,
      title: `${passCount} ${passCount === 1 ? 'pass' : 'passes'} activated`,
      subtitle: 'Ready to use at the event',
      delay: 1.5,
    },
    {
      icon: <PartyPopper className="w-5 h-5" />,
      title: "You're all set!",
      subtitle: 'See you there',
      delay: 2.1,
    },
  ];

  return (
    <div className="flex flex-col items-start justify-center min-h-[55vh] px-6 max-w-sm mx-auto w-full">
      {/* Title */}
      <motion.h1
        className="text-2xl font-bold text-gray-900 mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Payment Successful
      </motion.h1>

      {/* Timeline */}
      <div className="relative pl-8 w-full">
        {/* Animated vertical line */}
        <motion.div
          className="absolute left-[11px] top-0 w-0.5 bg-green-400 origin-top"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ height: '100%' }}
        />

        {/* Steps */}
        <div className="flex flex-col gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative flex items-start gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay, duration: 0.4, ease: 'easeOut' }}
            >
              {/* Dot */}
              <motion.div
                className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-white border-2 border-green-500 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: step.delay - 0.1,
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: step.delay + 0.15 }}
                >
                  <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                </motion.div>
              </motion.div>

              {/* Content */}
              <div className="flex items-start gap-3 pt-0">
                <div className="text-gray-400 mt-0.5">{step.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    {step.title}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{step.subtitle}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col items-center">
        <SharedFooter countdown={countdown} onGoToPasses={onGoToPasses} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 5 — TERMINAL: Retro receipt / terminal style
// ═══════════════════════════════════════════════════════════════════════════════

interface TerminalLine {
  text: string;
  status?: string;
  statusColor?: string;
  delay: number;
}

const useTypewriter = (lines: TerminalLine[]) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    lines.forEach((line, i) => {
      const timer = setTimeout(() => {
        setVisibleLines(i + 1);
      }, line.delay * 1000);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [lines]);

  return visibleLines;
};

const TerminalVariant = ({
  countdown,
  onGoToPasses,
  grandTotal,
  passCount,
}: SharedFooterProps & { grandTotal: number; passCount: number }) => {
  const { getCity } = useCityProvider();
  const city = getCity();
  const refId = useMemo(() => Math.random().toString(36).slice(2, 10).toUpperCase(), []);
  const lines: TerminalLine[] = useMemo(
    () => [
      { text: '$ checkout --process', delay: 0.2 },
      { text: 'Initializing payment gateway...', status: 'OK', statusColor: 'text-green-400', delay: 0.6 },
      { text: 'Validating order details...', status: 'OK', statusColor: 'text-green-400', delay: 1.0 },
      { text: 'Processing payment...', status: 'OK', statusColor: 'text-green-400', delay: 1.4 },
      { text: `Generating ${passCount} ${passCount === 1 ? 'pass' : 'passes'}...`, status: 'OK', statusColor: 'text-green-400', delay: 1.8 },
      { text: `Total: ${formatCurrency(grandTotal)}`, status: 'CONFIRMED', statusColor: 'text-amber-400', delay: 2.2 },
      { text: '', delay: 2.5 },
      { text: `Payment successful. Welcome to ${city?.name}...`, delay: 2.6 },
    ],
    [grandTotal, passCount]
  );

  const visibleCount = useTypewriter(lines);

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] px-4">
      <motion.div
        className="w-full max-w-md bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Terminal header */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 border-b border-slate-700">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-[10px] text-slate-500 font-pp-mono">checkout — success</span>
        </div>

        {/* Terminal body */}
        <div className="px-4 py-4 font-pp-mono text-sm leading-relaxed min-h-[280px]">
          {lines.slice(0, visibleCount).map((line, i) => (
            <motion.div
              key={i}
              className="flex justify-between items-center"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {line.text === '' ? (
                <div className="h-4" />
              ) : (
                <>
                  <span
                    className={cn(
                      'text-slate-300',
                      i === 0 && 'text-green-400',
                      i === lines.length - 1 && 'text-white font-semibold'
                    )}
                  >
                    {line.text}
                  </span>
                  {line.status && (
                    <span className={cn('text-xs font-semibold ml-4', line.statusColor)}>
                      [{line.status}]
                    </span>
                  )}
                </>
              )}
            </motion.div>
          ))}

          {/* Blinking cursor */}
          {visibleCount >= lines.length && (
            <motion.span
              className="inline-block w-2 h-4 bg-green-400 ml-0.5 mt-1"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
            />
          )}
        </div>

        {/* Dashed separator */}
        <div className="border-t border-dashed border-slate-700 mx-4" />

        {/* Receipt footer */}
        <div className="px-4 py-3 flex items-center justify-between text-xs text-slate-500 font-pp-mono">
          <span>ref: #{refId}</span>
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </motion.div>

      <SharedFooter countdown={countdown} onGoToPasses={onGoToPasses} dark />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 6 — RECEIPT: Card-based itemized receipt
// ═══════════════════════════════════════════════════════════════════════════════

interface ReceiptLineItem {
  label: string;
  value: string;
}

const ReceiptVariant = ({
  countdown,
  onGoToPasses,
  grandTotal,
  passCount,
  summary,
}: SharedFooterProps & {
  grandTotal: number;
  passCount: number;
  summary: { passesSubtotal: number; housingSubtotal: number; merchSubtotal: number; patronSubtotal: number; discount: number; insuranceSubtotal: number };
}) => {
  const refId = useMemo(() => Math.random().toString(36).slice(2, 10).toUpperCase(), []);
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const lineItems = useMemo<ReceiptLineItem[]>(() => {
    const items: ReceiptLineItem[] = [];
    if (summary.passesSubtotal > 0) items.push({ label: `${passCount} ${passCount === 1 ? 'Pass' : 'Passes'}`, value: formatCurrency(summary.passesSubtotal) });
    if (summary.housingSubtotal > 0) items.push({ label: 'Housing', value: formatCurrency(summary.housingSubtotal) });
    if (summary.merchSubtotal > 0) items.push({ label: 'Merchandise', value: formatCurrency(summary.merchSubtotal) });
    if (summary.patronSubtotal > 0) items.push({ label: 'Patron Support', value: formatCurrency(summary.patronSubtotal) });
    if (summary.insuranceSubtotal > 0) items.push({ label: 'Insurance', value: formatCurrency(summary.insuranceSubtotal) });
    if (summary.discount > 0) items.push({ label: 'Discount', value: `-${formatCurrency(summary.discount)}` });
    return items;
  }, [summary, passCount]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] px-4">
      <motion.div
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Green accent strip */}
        <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
          >
            <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
          </motion.div>
          <div>
            <motion.h2
              className="text-lg font-bold text-gray-900"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Order Confirmed
            </motion.h2>
            <motion.p
              className="text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.3 }}
            >
              Your payment has been processed
            </motion.p>
          </div>
        </div>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-gray-200 mx-5" />

        {/* Line items */}
        <div className="px-5 py-4 space-y-2.5">
          {lineItems.map((item, i) => (
            <motion.div
              key={item.label}
              className="flex items-center justify-between text-sm"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
            >
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium text-gray-900 tabular-nums">{item.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-gray-200 mx-5" />

        {/* Total */}
        <motion.div
          className="px-5 py-4 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <span className="text-sm font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900 tabular-nums">
            {formatCurrency(grandTotal)}
          </span>
        </motion.div>

        {/* Footer meta */}
        <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
          <motion.span
            className="text-[11px] text-gray-400 font-pp-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.3 }}
          >
            REF #{refId}
          </motion.span>
          <motion.span
            className="text-[11px] text-gray-400 font-pp-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.3 }}
          >
            {dateStr}
          </motion.span>
        </div>
      </motion.div>

      <SharedFooter countdown={countdown} onGoToPasses={onGoToPasses} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 7 — STAMP: Official approval stamp animation
// ═══════════════════════════════════════════════════════════════════════════════

const StampVariant = ({
  countdown,
  onGoToPasses,
  grandTotal,
  passCount,
}: SharedFooterProps & { grandTotal: number; passCount: number }) => {
  const refId = useMemo(() => Math.random().toString(36).slice(2, 10).toUpperCase(), []);
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] px-4">
      <motion.div
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Card content */}
        <div className="px-5 pt-6 pb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Order Summary</h2>
          <p className="text-sm text-gray-500 mb-5">Transaction details</p>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Passes</span>
              <span className="font-medium text-gray-900">{passCount} {passCount === 1 ? 'pass' : 'passes'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium text-gray-900 tabular-nums">{formatCurrency(grandTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900">{dateStr}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 flex items-center justify-between text-[11px] text-gray-400 font-pp-mono">
          <span>REF #{refId}</span>
          <span>PAYMENT</span>
        </div>

        {/* Stamp overlay — animates in */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.1 }}
        >
          {/* Ripple effect */}
          <motion.div
            className="absolute w-32 h-32 rounded-full border-2 border-green-300/50"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 3, opacity: [0, 0.6, 0] }}
            transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
          />

          {/* Stamp SVG */}
          <motion.svg
            viewBox="0 0 200 200"
            className="w-40 h-40"
            initial={{ scale: 3, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: -12, opacity: 1 }}
            transition={{
              delay: 0.6,
              type: 'spring',
              stiffness: 300,
              damping: 18,
            }}
            aria-hidden="true"
          >
            {/* Outer circle */}
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="#16a34a"
              strokeWidth="6"
              opacity="0.8"
            />
            {/* Inner circle */}
            <circle
              cx="100"
              cy="100"
              r="78"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2"
              opacity="0.5"
            />
            {/* APPROVED text */}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#16a34a"
              fontSize="28"
              fontWeight="900"
              letterSpacing="3"
              opacity="0.85"
            >
              APPROVED
            </text>
            {/* Decorative stars */}
            <text
              x="100"
              y="125"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#16a34a"
              fontSize="14"
              opacity="0.6"
            >
              ★ ★ ★
            </text>
          </motion.svg>
        </motion.div>
      </motion.div>

      <SharedFooter countdown={countdown} onGoToPasses={onGoToPasses} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 8 — TICKET: Boarding pass / event ticket style
// ═══════════════════════════════════════════════════════════════════════════════

const DecorativeGrid = () => {
  const cells = useMemo(
    () =>
      Array.from({ length: 49 }, (_, i) => ({
        id: i,
        filled: Math.random() > 0.35,
      })),
    []
  );

  return (
    <div className="grid grid-cols-7 gap-[3px] w-[72px] h-[72px]" aria-hidden="true">
      {cells.map((cell) => (
        <div
          key={cell.id}
          className={cn(
            'rounded-[2px]',
            cell.filled ? 'bg-gray-900' : 'bg-gray-200'
          )}
        />
      ))}
    </div>
  );
};

const TicketVariant = ({
  countdown,
  onGoToPasses,
  grandTotal,
  passCount,
}: SharedFooterProps & { grandTotal: number; passCount: number }) => {
  const refId = useMemo(() => Math.random().toString(36).slice(2, 10).toUpperCase(), []);
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] px-4">
      <motion.div
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Left panel — event info */}
          <motion.div
            className="flex-1 px-5 py-5 flex flex-col justify-between"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Status badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold uppercase tracking-wider">
                <Check className="w-3 h-3" strokeWidth={3} />
                Confirmed
              </span>
            </div>

            {/* Admit */}
            <div className="mb-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                Admit
              </p>
              <p className="text-4xl font-black text-gray-900 leading-none tabular-nums">
                {passCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {passCount === 1 ? 'pass' : 'passes'}
              </p>
            </div>

            {/* Total */}
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-0.5">
                Total Paid
              </p>
              <p className="text-lg font-bold text-gray-900 tabular-nums">
                {formatCurrency(grandTotal)}
              </p>
            </div>
          </motion.div>

          {/* Perforated divider */}
          <div className="relative flex sm:flex-col items-center justify-center px-0 py-2 sm:py-0 sm:px-0">
            {/* Horizontal on mobile */}
            <div className="w-full sm:w-px h-px sm:h-full border-t sm:border-t-0 sm:border-l border-dashed border-gray-200" />
            {/* Notch top */}
            <div className="hidden sm:block absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#F5F5F7]" />
            {/* Notch bottom */}
            <div className="hidden sm:block absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#F5F5F7]" />
            {/* Notch left (mobile) */}
            <div className="sm:hidden absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F5F5F7]" />
            {/* Notch right (mobile) */}
            <div className="sm:hidden absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F5F5F7]" />
          </div>

          {/* Right panel — decorative */}
          <motion.div
            className="w-full sm:w-36 px-5 py-5 flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <DecorativeGrid />
            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-pp-mono">{dateStr}</p>
              <p className="text-[10px] text-gray-400 font-pp-mono mt-0.5">#{refId}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <SharedFooter countdown={countdown} onGoToPasses={onGoToPasses} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 9 — STACK: Fanned stacked cards
// ═══════════════════════════════════════════════════════════════════════════════

const STACK_ROTATIONS = [-4, 3, -1.5, 2];

const StackVariant = ({
  countdown,
  onGoToPasses,
  grandTotal,
  passCount,
}: SharedFooterProps & { grandTotal: number; passCount: number }) => {
  const cardCount = Math.min(Math.max(passCount, 2), 4);

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] px-4">
      {/* Floating badge */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-semibold shadow-sm">
          <Check className="w-4 h-4" strokeWidth={3} />
          Payment Complete
        </span>
      </motion.div>

      {/* Card stack */}
      <div className="relative w-full max-w-[280px] h-[200px]">
        {/* Background cards */}
        {Array.from({ length: cardCount - 1 }, (_, i) => (
          <motion.div
            key={`bg-${i}`}
            className="absolute inset-0 bg-white rounded-2xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, scale: 0.9, rotate: 0, y: 20 }}
            animate={{
              opacity: 0.7 - i * 0.15,
              scale: 1 - (i + 1) * 0.03,
              rotate: STACK_ROTATIONS[i] ?? 0,
              y: -(i + 1) * 6,
            }}
            transition={{
              delay: 0.1 + i * 0.15,
              type: 'spring',
              stiffness: 180,
              damping: 18,
            }}
          >
            <div className="p-5 flex items-center gap-3 opacity-40">
              <Ticket className="w-8 h-8 text-gray-300" />
              <div className="h-2 w-20 bg-gray-100 rounded-full" />
            </div>
          </motion.div>
        ))}

        {/* Main (top) card */}
        <motion.div
          className="absolute inset-0 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
          <div className="px-5 py-5 flex flex-col items-center text-center">
            <motion.div
              className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 15 }}
            >
              <Check className="w-6 h-6 text-green-600" strokeWidth={3} />
            </motion.div>
            <motion.p
              className="text-sm font-semibold text-gray-900 mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.3 }}
            >
              {passCount} {passCount === 1 ? 'Pass' : 'Passes'} Purchased
            </motion.p>
            <motion.p
              className="text-2xl font-bold text-gray-900 tabular-nums"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.3 }}
            >
              {formatCurrency(grandTotal)}
            </motion.p>
          </div>
        </motion.div>
      </div>

      <SharedFooter countdown={countdown} onGoToPasses={onGoToPasses} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 10 — GLASS: Glassmorphism with animated gradient blobs
// ═══════════════════════════════════════════════════════════════════════════════

const GlassVariant = ({
  countdown,
  onGoToPasses,
  grandTotal,
  passCount,
}: SharedFooterProps & { grandTotal: number; passCount: number }) => {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const stats = [
    { label: 'Passes', value: String(passCount), icon: <Ticket className="w-4 h-4" /> },
    { label: 'Total', value: formatCurrency(grandTotal), icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Date', value: dateStr, icon: <CalendarDays className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] px-4 relative overflow-hidden">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-green-200/40 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-blue-200/30 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-purple-200/20 blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Glass card */}
      <motion.div
        className="relative w-full max-w-sm rounded-2xl backdrop-blur-xl bg-white/70 border border-white/40 shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
          {/* Glow ring behind icon */}
          <div className="relative mb-5">
            <motion.div
              className="absolute inset-0 w-16 h-16 rounded-full bg-green-400/20 blur-xl"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative w-16 h-16 rounded-full bg-green-50/80 border border-green-200/50 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
            </motion.div>
          </div>

          <motion.h1
            className="text-2xl font-bold text-gray-900 mb-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            Payment Successful
          </motion.h1>
          <motion.p
            className="text-sm text-gray-500 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.3 }}
          >
            Your passes are confirmed
          </motion.p>

          {/* Stat pills */}
          <div className="flex items-center gap-2 w-full">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex-1 rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 px-3 py-3 flex flex-col items-center gap-1.5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
              >
                <div className="text-gray-400">{stat.icon}</div>
                <p className="text-sm font-bold text-gray-900 tabular-nums">{stat.value}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="relative z-10">
        <SharedFooter countdown={countdown} onGoToPasses={onGoToPasses} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT 11 — SPLIT: Dashboard-style metric grid
// ═══════════════════════════════════════════════════════════════════════════════

interface MetricCardData {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const SplitVariant = ({
  countdown,
  onGoToPasses,
  grandTotal,
  passCount,
}: SharedFooterProps & { grandTotal: number; passCount: number }) => {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const metrics: MetricCardData[] = [
    { icon: <Users className="w-5 h-5" />, label: 'Passes', value: String(passCount) },
    { icon: <CreditCard className="w-5 h-5" />, label: 'Amount', value: formatCurrency(grandTotal) },
    { icon: <CalendarDays className="w-5 h-5" />, label: 'Date', value: dateStr },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] px-4 w-full max-w-md mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Payment Successful
        </h1>
        <motion.div
          className="h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-3 gap-3 w-full mb-6">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-5 flex flex-col items-center text-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.15, duration: 0.4, ease: 'easeOut' }}
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
              {metric.icon}
            </div>
            <p className="text-lg font-bold text-gray-900 tabular-nums leading-tight">
              {metric.value}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              {metric.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <motion.div
        className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-gray-500">Order Status</span>
          <motion.span
            className="text-xs font-semibold text-green-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.3 }}
          >
            Complete
          </motion.span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ delay: 1.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400 font-pp-mono">
          <span>Processing</span>
          <span>Confirmed</span>
          <span>Complete</span>
        </div>
      </motion.div>

      <SharedFooter countdown={countdown} onGoToPasses={onGoToPasses} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SuccessStep({ onComplete }: SuccessStepProps) {
  const params = useParams();
  const popupSlug = params.popupSlug as string;
  const [countdown, setCountdown] = useState(DEV_TOGGLE ? 99 : 5);
  const [variant, setVariant] = useState<SuccessVariant>('terminal');

  const { cart, summary } = useCheckout();
  const grandTotal = summary.grandTotal;
  const passCount = cart.passes.length;

  const passesUrl = `/portal/${popupSlug}/passes`;

  // Countdown + redirect (disabled when DEV_TOGGLE is on)
  useEffect(() => {
    if (DEV_TOGGLE) return;

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const redirectTimer = setTimeout(() => {
      onComplete?.();
      window.location.href = passesUrl;
    }, 5000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [passesUrl, onComplete]);

  const handleGoToPasses = () => {
    onComplete?.();
    window.location.href = passesUrl;
  };

  // Reset animation key when variant changes
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [variant]);

  const sharedProps: SharedFooterProps = { countdown, onGoToPasses: handleGoToPasses };

  const renderVariant = () => {
    switch (variant) {
      case 'minimal':
        return <MinimalVariant {...sharedProps} />;
      case 'kinetic':
        return <KineticVariant {...sharedProps} grandTotal={grandTotal} />;
      case 'confetti':
        return <ConfettiVariant {...sharedProps} />;
      case 'narrative':
        return (
          <NarrativeVariant {...sharedProps} grandTotal={grandTotal} passCount={passCount} />
        );
      case 'terminal':
        return (
          <TerminalVariant {...sharedProps} grandTotal={grandTotal} passCount={passCount} />
        );
      case 'receipt':
        return (
          <ReceiptVariant {...sharedProps} grandTotal={grandTotal} passCount={passCount} summary={summary} />
        );
      case 'stamp':
        return (
          <StampVariant {...sharedProps} grandTotal={grandTotal} passCount={passCount} />
        );
      case 'ticket':
        return (
          <TicketVariant {...sharedProps} grandTotal={grandTotal} passCount={passCount} />
        );
      case 'stack':
        return (
          <StackVariant {...sharedProps} grandTotal={grandTotal} passCount={passCount} />
        );
      case 'glass':
        return (
          <GlassVariant {...sharedProps} grandTotal={grandTotal} passCount={passCount} />
        );
      case 'split':
        return (
          <SplitVariant {...sharedProps} grandTotal={grandTotal} passCount={passCount} />
        );
      default:
        return <MinimalVariant {...sharedProps} />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Dev variant switcher */}
      {DEV_TOGGLE && <DevToggleBar variant={variant} onChange={setVariant} />}

      {/* Variant content — re-mounts on variant change for fresh animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={animKey}
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {renderVariant()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
