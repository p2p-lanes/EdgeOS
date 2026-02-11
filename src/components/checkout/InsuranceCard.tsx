'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudRain,
  Umbrella,
  Shield,
  ShieldCheck,
  Check,
  Zap,
  Sparkles,
  MonitorSmartphone,
  CircleDot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { formatCurrency, INSURANCE_BENEFITS } from '@/types/checkout';

// ── Dev toggle: set to false (or remove) to hide the variant switcher ──
const DEV_TOGGLE = false;

type Variant =
  | 'minimal'
  | 'premium'
  | 'playful'
  | 'trust'
  | 'neon'
  | 'glassmorphism'
  | 'retro'
  | 'zen'
  | 'line'
  | 'dot';

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
  const variants: Variant[] = [
    'minimal',
    'premium',
    'playful',
    'trust',
    'neon',
    'glassmorphism',
    'retro',
    'zen',
    'line',
    'dot',
  ];
  return (
    <div className="flex flex-wrap items-center gap-1 mb-2 font-mono text-[10px]">
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

// ─── Variant 5: Neon ──────────────────────────────────────────────────────────

function NeonVariant({ insurance, price, onToggle }: InsuranceCardProps) {
  return (
    <motion.div
      animate={{
        boxShadow: insurance
          ? '0 0 20px rgba(0,255,200,0.3), 0 0 40px rgba(0,255,200,0.1)'
          : '0 0 0px rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.5 }}
      className={cn(
        'rounded-2xl p-5 border transition-all duration-500',
        insurance
          ? 'bg-gray-950 border-cyan-400/60'
          : 'bg-gray-900 border-gray-700'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              filter: insurance
                ? 'drop-shadow(0 0 8px rgba(0,255,200,0.8))'
                : 'drop-shadow(0 0 0px rgba(0,0,0,0))',
            }}
            transition={{ duration: 0.5 }}
          >
            <Zap
              className={cn(
                'w-5 h-5 transition-colors duration-500',
                insurance ? 'text-cyan-400' : 'text-gray-500'
              )}
            />
          </motion.div>
          <div>
            <h3
              className={cn(
                'font-bold tracking-wide uppercase text-sm transition-colors duration-500',
                insurance ? 'text-cyan-300' : 'text-gray-400'
              )}
            >
              Insurance
            </h3>
            <span
              className={cn(
                'text-xs font-mono transition-colors duration-500',
                insurance ? 'text-cyan-500' : 'text-gray-600'
              )}
            >
              {formatCurrency(price)}
            </span>
          </div>
        </div>

        <button
          onClick={onToggle}
          role="switch"
          aria-checked={insurance}
          aria-label="Toggle insurance"
          className={cn(
            'relative inline-flex h-7 w-14 items-center rounded-full border-2 transition-all duration-500',
            insurance
              ? 'border-cyan-400 bg-cyan-400/20'
              : 'border-gray-600 bg-gray-800'
          )}
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
              'inline-block h-4 w-4 rounded-full transition-colors duration-500',
              insurance ? 'ml-8 bg-cyan-400 shadow-[0_0_10px_rgba(0,255,200,0.6)]' : 'ml-1 bg-gray-500'
            )}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {insurance && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-3 border-t border-cyan-900/50 space-y-2">
              {INSURANCE_BENEFITS.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,255,200,0.6)]" />
                  <span className="text-gray-400">{b}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Variant 6: Glassmorphism ─────────────────────────────────────────────────

function GlassmorphismVariant({ insurance, price, onToggle }: InsuranceCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl p-5 transition-all duration-500 overflow-hidden',
        insurance
          ? 'bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg shadow-purple-200/30'
          : 'bg-white/10 backdrop-blur-md border border-white/20 shadow-sm'
      )}
    >
      {/* Background gradient blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <div
          className={cn(
            'absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl transition-all duration-700',
            insurance ? 'bg-purple-300/40' : 'bg-gray-200/30'
          )}
        />
        <div
          className={cn(
            'absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-3xl transition-all duration-700',
            insurance ? 'bg-pink-300/30' : 'bg-gray-200/20'
          )}
        />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-500',
              insurance
                ? 'bg-white/40 shadow-md shadow-purple-200/40'
                : 'bg-white/20'
            )}
          >
            <Sparkles
              className={cn(
                'w-5 h-5 transition-colors duration-500',
                insurance ? 'text-purple-600' : 'text-gray-400'
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Insurance</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatCurrency(price)}
            </p>
          </div>
        </div>

        {/* Floating badge */}
        <AnimatePresence>
          {insurance && (
            <motion.span
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-purple-300/30"
            >
              Protected
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {INSURANCE_BENEFITS.map((b, i) => (
          <span
            key={i}
            className={cn(
              'text-[11px] px-2.5 py-1 rounded-full backdrop-blur-sm transition-all duration-500',
              insurance
                ? 'bg-white/50 text-purple-700 shadow-sm'
                : 'bg-white/20 text-gray-400'
            )}
          >
            {b}
          </span>
        ))}
      </div>

      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.97 }}
        aria-label="Toggle insurance"
        className={cn(
          'w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-500 backdrop-blur-sm',
          insurance
            ? 'bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white shadow-lg shadow-purple-300/30'
            : 'bg-white/30 text-gray-600 hover:bg-white/50 border border-white/40'
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
                <Check className="w-4 h-4" /> Coverage Active
              </>
            ) : (
              'Activate Coverage'
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

// ─── Variant 7: Retro ─────────────────────────────────────────────────────────

function RetroVariant({ insurance, price, onToggle }: InsuranceCardProps) {
  return (
    <div
      className={cn(
        'rounded-none border-3 p-5 transition-all duration-300',
        insurance
          ? 'bg-yellow-300 border-gray-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
          : 'bg-gray-100 border-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MonitorSmartphone
            className={cn(
              'w-6 h-6 transition-colors duration-300',
              insurance ? 'text-gray-900' : 'text-gray-400'
            )}
          />
          <div>
            <h3
              className={cn(
                'font-black uppercase tracking-widest text-sm transition-colors duration-300',
                insurance ? 'text-gray-900' : 'text-gray-500'
              )}
            >
              Insurance
            </h3>
            <span
              className={cn(
                'font-mono text-xs font-bold transition-colors duration-300',
                insurance ? 'text-gray-800' : 'text-gray-400'
              )}
            >
              {formatCurrency(price)}
            </span>
          </div>
        </div>

        <button
          onClick={onToggle}
          role="switch"
          aria-checked={insurance}
          aria-label="Toggle insurance"
          className={cn(
            'w-7 h-7 border-3 flex items-center justify-center transition-all duration-200',
            insurance
              ? 'bg-gray-900 border-gray-900'
              : 'bg-white border-gray-400 hover:border-gray-600'
          )}
        >
          {insurance && <Check className="w-5 h-5 text-yellow-300 stroke-[3]" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {insurance && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-3 border-t-3 border-gray-900 space-y-2">
              {INSURANCE_BENEFITS.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase"
                >
                  <span className="w-2 h-2 bg-gray-900" />
                  {b}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Variant 8: Zen ───────────────────────────────────────────────────────────

function ZenVariant({ insurance, price, onToggle }: InsuranceCardProps) {
  return (
    <div className="py-5 px-1">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-light tracking-wide text-gray-800">
            Insurance
          </h3>
          <p className="text-sm text-gray-400 mt-1 font-light">
            Change of plans coverage · {formatCurrency(price)}
          </p>
        </div>
        <Switch
          checked={insurance}
          onCheckedChange={onToggle}
          aria-label="Toggle insurance"
        />
      </div>

      <div
        className={cn(
          'w-full h-px my-4 transition-colors duration-500',
          insurance ? 'bg-gray-300' : 'bg-gray-100'
        )}
      />

      <AnimatePresence initial={false}>
        {insurance && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="space-y-3"
          >
            {INSURANCE_BENEFITS.map((b, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="text-sm text-gray-500 font-light leading-relaxed"
              >
                {b}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Variant 9: Line ──────────────────────────────────────────────────────────

function LineVariant({ insurance, price, onToggle }: InsuranceCardProps) {
  const [showBenefits, setShowBenefits] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3 py-2">
        <CloudRain
          className={cn(
            'w-4 h-4 flex-shrink-0 transition-colors duration-300',
            insurance ? 'text-blue-500' : 'text-gray-300'
          )}
        />
        <span className="text-sm text-gray-700 font-medium">Insurance</span>
        <span className="text-xs text-gray-400 font-mono">
          {formatCurrency(price)}
        </span>

        <button
          onClick={() => setShowBenefits((prev) => !prev)}
          aria-label="Show insurance benefits"
          tabIndex={0}
          className="text-gray-300 hover:text-gray-500 transition-colors ml-auto"
        >
          <CircleDot className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggle}
          role="switch"
          aria-checked={insurance}
          aria-label="Toggle insurance"
          className={cn(
            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0',
            insurance ? 'bg-blue-500' : 'bg-gray-200'
          )}
        >
          <span
            className={cn(
              'inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-all',
              insurance ? 'translate-x-5' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showBenefits && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 pb-2 pl-7">
              {INSURANCE_BENEFITS.map((b, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                >
                  {b}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-px bg-gray-100" />
    </div>
  );
}

// ─── Variant 10: Dot ──────────────────────────────────────────────────────────

function DotVariant({ insurance, price, onToggle }: InsuranceCardProps) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={insurance}
      aria-label="Toggle insurance"
      tabIndex={0}
      className={cn(
        'w-full text-left rounded-xl px-4 py-3.5 transition-all duration-300 group cursor-pointer',
        insurance
          ? 'bg-emerald-50/60 ring-1 ring-emerald-200'
          : 'bg-gray-50 hover:bg-gray-100/80'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Status dot */}
        <motion.span
          animate={{
            scale: insurance ? [1, 1.3, 1] : 1,
          }}
          transition={{ duration: 0.4 }}
          className={cn(
            'w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors duration-300',
            insurance ? 'bg-emerald-500' : 'bg-gray-300'
          )}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">Insurance</span>
            <span
              className={cn(
                'text-xs transition-colors duration-300',
                insurance ? 'text-emerald-600' : 'text-gray-400'
              )}
            >
              {formatCurrency(price)}
            </span>
          </div>

          {/* Inline benefit tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {INSURANCE_BENEFITS.map((b, i) => (
              <span
                key={i}
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full transition-all duration-300',
                  insurance
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200/70'
                )}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Active indicator */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={insurance ? 'on' : 'off'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 transition-colors duration-300',
              insurance ? 'text-emerald-600' : 'text-gray-300'
            )}
          >
            {insurance ? 'On' : 'Off'}
          </motion.span>
        </AnimatePresence>
      </div>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const VARIANT_MAP: Record<Variant, React.ComponentType<InsuranceCardProps>> = {
  minimal: MinimalVariant,
  premium: PremiumVariant,
  playful: PlayfulVariant,
  trust: TrustVariant,
  neon: NeonVariant,
  glassmorphism: GlassmorphismVariant,
  retro: RetroVariant,
  zen: ZenVariant,
  line: LineVariant,
  dot: DotVariant,
};

export default function InsuranceCard(props: InsuranceCardProps) {
  const [variant, setVariant] = useState<Variant>('playful');
  const VariantComponent = VARIANT_MAP[variant];

  return (
    <div>
      {DEV_TOGGLE && <DevToggleBar variant={variant} onChange={setVariant} />}
      <VariantComponent {...props} />
    </div>
  );
}
