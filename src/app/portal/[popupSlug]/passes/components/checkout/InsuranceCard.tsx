'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Umbrella, Shield, ShieldCheck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { formatCurrency, INSURANCE_BENEFITS } from '@/types/checkout';

// ── Dev toggle: set to false (or remove) to hide the variant switcher ──
const DEV_TOGGLE = false;

type Variant = 'minimal' | 'premium' | 'playful' | 'trust';

interface InsuranceCardProps {
  insurance: boolean;
  price: number;
  onToggle: () => void;
}

// ─── Dev Toggle Bar ────────────────────────────────────────────────────────────

function DevToggleBar({
  variant,
  onChange,
}: {
  variant: Variant;
  onChange: (v: Variant) => void;
}) {
  const variants: Variant[] = ['minimal', 'premium', 'playful', 'trust'];
  return (
    <div className="flex items-center gap-1 mb-2 font-mono text-[10px]">
      {variants.map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            'px-2 py-0.5 rounded transition-colors',
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
}

// ─── Variant 1: Minimal ────────────────────────────────────────────────────────

function MinimalVariant({ insurance, price, onToggle }: InsuranceCardProps) {
  return (
    <div className="rounded-2xl bg-gray-50/80 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CloudRain className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Insurance</span>
          <span className="text-xs text-gray-400">{formatCurrency(price)}</span>
        </div>
        <Switch
          checked={insurance}
          onCheckedChange={onToggle}
          aria-label="Toggle insurance"
        />
      </div>

      <AnimatePresence initial={false}>
        {insurance && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden text-xs text-gray-400 mt-2 space-y-0.5 pl-6.5"
          >
            {INSURANCE_BENEFITS.map((b, i) => (
              <li key={i}>• {b}</li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Variant 2: Premium ────────────────────────────────────────────────────────

function PremiumVariant({ insurance, price, onToggle }: InsuranceCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-5 transition-all duration-500',
        insurance
          ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
          : 'bg-gradient-to-br from-slate-50 to-gray-100'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500',
            insurance
              ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
              : 'bg-gradient-to-br from-gray-300 to-gray-400'
          )}
        >
          <CloudRain className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">Insurance</h3>
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full transition-colors duration-500',
                insurance
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-200 text-gray-500'
              )}
            >
              {formatCurrency(price)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {INSURANCE_BENEFITS.map((b, i) => (
              <span
                key={i}
                className={cn(
                  'text-[11px] px-2.5 py-1 rounded-full transition-colors duration-500',
                  insurance
                    ? 'bg-white/70 text-indigo-600'
                    : 'bg-white/50 text-gray-400'
                )}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-500',
          insurance
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-indigo-200'
            : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={insurance ? 'added' : 'add'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-1.5"
          >
            {insurance ? (
              <>
                <Check className="w-4 h-4" /> Coverage Added
              </>
            ) : (
              'Add Coverage'
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

// ─── Variant 3: Playful ────────────────────────────────────────────────────────

function PlayfulVariant({ insurance, price, onToggle }: InsuranceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="bg-white rounded-2xl border border-gray-100 border-l-4 border-l-amber-400 p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={{ rotate: insurance ? 0 : -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0"
        >
          <Umbrella className="w-5 h-5 text-amber-500" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900">Insurance</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {formatCurrency(price)} · Change of plans coverage
              </p>
            </div>
            <button
              onClick={onToggle}
              role="switch"
              aria-checked={insurance}
              aria-label="Toggle insurance"
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0',
                insurance ? 'bg-amber-400' : 'bg-gray-200'
              )}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={cn(
                  'inline-block h-4 w-4 rounded-full bg-white shadow-sm',
                  insurance ? 'ml-6' : 'ml-1'
                )}
              />
            </button>
          </div>

          <ul className="text-xs text-gray-500 mt-3 space-y-1">
            {INSURANCE_BENEFITS.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={insurance ? 'check' : 'dot'}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="flex-shrink-0"
                  >
                    {insurance ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <span className="block w-1.5 h-1.5 rounded-full bg-gray-300" />
                    )}
                  </motion.span>
                </AnimatePresence>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Variant 4: Trust ──────────────────────────────────────────────────────────

function TrustVariant({ insurance, price, onToggle }: InsuranceCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Banner */}
      <div
        className={cn(
          'px-5 py-4 transition-colors duration-500',
          insurance
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
            : 'bg-gradient-to-r from-gray-600 to-gray-700'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-white/90" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Insurance</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-sm font-semibold text-white/90 mt-0.5">
                {formatCurrency(price)}
              </p>
            </div>
          </div>
          {/* Inverted toggle */}
          <button
            onClick={onToggle}
            role="switch"
            aria-checked={insurance}
            aria-label="Toggle insurance"
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0',
              insurance ? 'bg-white/30' : 'bg-white/20'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 rounded-full shadow-sm transition-all',
                insurance
                  ? 'translate-x-6 bg-white'
                  : 'translate-x-1 bg-white/60'
              )}
            />
          </button>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white px-5 py-4">
        <ul className="space-y-2">
          {INSURANCE_BENEFITS.map((b, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
              <ShieldCheck
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors duration-300',
                  insurance ? 'text-emerald-500' : 'text-gray-300'
                )}
              />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const VARIANT_MAP: Record<Variant, React.ComponentType<InsuranceCardProps>> = {
  minimal: MinimalVariant,
  premium: PremiumVariant,
  playful: PlayfulVariant,
  trust: TrustVariant,
};

export default function InsuranceCard(props: InsuranceCardProps) {
  const [variant, setVariant] = useState<Variant>('trust');
  const VariantComponent = VARIANT_MAP[variant];

  return (
    <div>
      {DEV_TOGGLE && <DevToggleBar variant={variant} onChange={setVariant} />}
      <VariantComponent {...props} />
    </div>
  );
}
