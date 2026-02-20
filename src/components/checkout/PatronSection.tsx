'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useCheckout } from '@/providers/checkoutProvider';
import { formatCurrency, PATRON_PRESETS, PATRON_MINIMUM } from '@/types/checkout';

const DEV_TOGGLE = true;
type PatronVariant = 'default' | 'slider' | 'tiers';
const VARIANT_LIST: PatronVariant[] = ['default', 'slider', 'tiers'];

interface PatronSectionProps {
  onSkip?: () => void;
}

function usePatronState(onSkip?: () => void) {
  const { patronProducts, cart, setPatronAmount, clearPatron } = useCheckout();
  const patronProduct = patronProducts[0];
  const isVariablePrice = patronProduct?.min_price !== null && patronProduct?.min_price !== undefined;
  const isPatronEnabled = cart.patron !== null;
  const currentAmount = cart.patron?.amount || 0;
  const currentProductId = cart.patron?.productId || patronProduct?.id;

  const [isCustom, setIsCustom] = useState(currentAmount > 0 && !PATRON_PRESETS.includes(currentAmount));
  const [customValue, setCustomValue] = useState(currentAmount > 0 && !PATRON_PRESETS.includes(currentAmount) ? currentAmount.toString() : '');

  useEffect(() => {
    if (!isVariablePrice) return;
    if (cart.patron) {
      if (!PATRON_PRESETS.includes(cart.patron.amount)) {
        setIsCustom(true);
        setCustomValue(cart.patron.amount.toString());
      }
    }
  }, [cart.patron, isVariablePrice]);

  const handleFixedToggle = (checked: boolean) => {
    if (!patronProduct) return;
    if (checked) setPatronAmount(patronProduct.id, patronProduct.price, false);
    else clearPatron();
  };

  const handlePresetSelect = (amount: number) => {
    if (!currentProductId) return;
    if (currentAmount === amount && !isCustom) { setIsCustom(false); setCustomValue(''); clearPatron(); return; }
    setIsCustom(false); setCustomValue('');
    setPatronAmount(currentProductId, amount, false);
  };

  const handleCustomChange = (value: string) => {
    if (!currentProductId) return;
    setIsCustom(true); setCustomValue(value);
    const numValue = parseInt(value.replace(/,/g, ''), 10);
    if (!isNaN(numValue) && numValue >= PATRON_MINIMUM) setPatronAmount(currentProductId, numValue, true);
    else clearPatron();
  };

  const handleClear = () => { setIsCustom(false); setCustomValue(''); clearPatron(); };
  const handleSkip = () => { handleClear(); onSkip?.(); };

  return { patronProducts, patronProduct, isVariablePrice, isPatronEnabled, currentAmount, currentProductId, isCustom, customValue, handleFixedToggle, handlePresetSelect, handleCustomChange, handleClear, handleSkip, setPatronAmount };
}

function DefaultPatronVariant({ onSkip }: PatronSectionProps) {
  const {
    patronProducts, patronProduct, isVariablePrice, isPatronEnabled, currentAmount, currentProductId,
    isCustom, customValue, handleFixedToggle, handlePresetSelect, handleCustomChange, handleClear, handleSkip,
  } = usePatronState(onSkip);
  const [expanded, setExpanded] = useState(true);

  if (patronProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Patron Support Not Available
        </h3>
        <p className="text-gray-500 max-w-md mb-6">
          Patron support options are not currently available for this event.
          You can continue to the next step.
        </p>
        <Button variant="outline" onClick={handleSkip}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="w-full p-5 text-left">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-lg">Become a Patron</h3>

            {/* Fixed-price: show switch + price */}
            {!isVariablePrice && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-semibold text-gray-700">
                  {formatCurrency(patronProduct.price)}
                </span>
                <Switch
                  checked={isPatronEnabled}
                  onCheckedChange={handleFixedToggle}
                  aria-label="Toggle patron support"
                />
              </div>
            )}
          </div>

          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              Add an optional donation to support Edge City&apos;s mission. Every contribution goes
              toward fellowships for researchers, artists, and builders who&apos;d have difficulty
              attending otherwise, and toward sustaining the community infrastructure that makes all
              of this work.
            </p>
            <p>
              Edge Institute is a 501(c)(3) nonprofit. All contributions are tax-deductible and
              documentation is provided.
            </p>
            <p>
              As a patron, you&apos;ll be featured on our website, invited to a gathering with the
              core team during the event, and if you&apos;d like, introduced to the fellow you helped
              bring.
            </p>
          </div>
        </div>

        {/* Variable-price: Expandable Amount Selection */}
        {isVariablePrice && (
          <div
            className={cn(
              'transition-all duration-300 ease-in-out overflow-hidden',
              expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="px-5 pb-5 border-t border-gray-100">
              {/* Preset Amounts */}
              <div className="flex gap-2 pt-4 pb-3">
                {PATRON_PRESETS.map((amount) => {
                  const isSelected = currentAmount === amount && !isCustom;
                  return (
                    <button
                      key={amount}
                      onClick={() => handlePresetSelect(amount)}
                      className={cn(
                        'flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all',
                        isSelected
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {formatCurrency(amount)}
                    </button>
                  );
                })}
              </div>

              {/* Custom Amount */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Custom:</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={customValue}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder={PATRON_MINIMUM.toLocaleString()}
                    aria-label="Custom patron amount"
                    className={cn(
                      'w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent',
                      isCustom && customValue
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-gray-200'
                    )}
                  />
                </div>
                <span className="text-xs text-gray-400">Min {formatCurrency(PATRON_MINIMUM)}</span>
              </div>

              {/* Clear link */}
              {currentAmount > 0 && (
                <div className="pt-3 text-center">
                  <button
                    onClick={handleClear}
                    className="text-gray-400 hover:text-gray-600 text-xs transition-colors"
                  >
                    Remove contribution
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Past impact indicator */}
      <p className="text-xs text-gray-400 text-center">
        47 builders & 12 projects funded in 2025
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SLIDER — Visual range slider with preset marks
// ═══════════════════════════════════════════════════════════════

function SliderVariant({ onSkip }: PatronSectionProps) {
  const {
    patronProducts, patronProduct, isVariablePrice, currentAmount, currentProductId,
    handleClear, handleSkip, setPatronAmount,
  } = usePatronState(onSkip);

  const [sliderValue, setSliderValue] = useState(currentAmount || PATRON_PRESETS[0]);

  useEffect(() => {
    if (currentAmount > 0) setSliderValue(currentAmount);
  }, [currentAmount]);

  if (patronProducts.length === 0) {
    return (<div className="flex flex-col items-center justify-center py-12 text-center"><h3 className="text-lg font-semibold text-gray-900 mb-2">Not Available</h3><Button variant="outline" onClick={handleSkip}>Continue</Button></div>);
  }

  const maxAmount = 15000;
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderValue(val);
    if (currentProductId && val >= PATRON_MINIMUM) setPatronAmount(currentProductId, val, !PATRON_PRESETS.includes(val));
  };

  const percentage = ((sliderValue - PATRON_MINIMUM) / (maxAmount - PATRON_MINIMUM)) * 100;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2">Become a Patron</h3>
        <p className="text-sm text-gray-600 mb-5">
          Support Edge City&apos;s mission with a contribution. Every dollar goes toward fellowships and community infrastructure.
        </p>

        {isVariablePrice && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-gray-900">{formatCurrency(sliderValue)}</span>
            </div>

            <div className="relative px-1">
              <input type="range" min={PATRON_MINIMUM} max={maxAmount} step={100} value={sliderValue} onChange={handleSliderChange} aria-label="Patron amount slider"
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                style={{ background: `linear-gradient(to right, #111827 ${percentage}%, #e5e7eb ${percentage}%)` }} />
              <div className="flex justify-between mt-1">
                {PATRON_PRESETS.map((p) => (
                  <button key={p} onClick={() => { setSliderValue(p); if (currentProductId) setPatronAmount(currentProductId, p, false); }} aria-label={`Set amount to ${formatCurrency(p)}`} tabIndex={0}
                    className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors', sliderValue === p ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600')}>
                    {formatCurrency(p)}
                  </button>
                ))}
              </div>
            </div>

            {currentAmount > 0 && (
              <div className="text-center pt-2">
                <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 text-xs transition-colors">Remove contribution</button>
              </div>
            )}
          </div>
        )}

        {!isVariablePrice && patronProduct && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">{formatCurrency(patronProduct.price)}</span>
            <Switch checked={currentAmount > 0} onCheckedChange={(checked) => {
              if (checked && currentProductId) setPatronAmount(currentProductId, patronProduct.price, false);
              else handleClear();
            }} aria-label="Toggle patron support" />
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 text-center">47 builders & 12 projects funded in 2025</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TIERS — Three side-by-side cards (Good/Better/Best)
// ═══════════════════════════════════════════════════════════════

const TIER_LABELS = ['Supporter', 'Champion', 'Visionary'];
const TIER_EMOJIS = ['🌱', '🌿', '🌳'];

function TiersVariant({ onSkip }: PatronSectionProps) {
  const {
    patronProducts, patronProduct, isVariablePrice, currentAmount, currentProductId,
    handlePresetSelect, handleClear, handleSkip, setPatronAmount,
  } = usePatronState(onSkip);

  if (patronProducts.length === 0) {
    return (<div className="flex flex-col items-center justify-center py-12 text-center"><h3 className="text-lg font-semibold text-gray-900 mb-2">Not Available</h3><Button variant="outline" onClick={handleSkip}>Continue</Button></div>);
  }

  const tiers = isVariablePrice
    ? PATRON_PRESETS.map((amount, i) => ({ amount, label: TIER_LABELS[i], emoji: TIER_EMOJIS[i] }))
    : [{ amount: patronProduct.price, label: TIER_LABELS[0], emoji: TIER_EMOJIS[0] }];

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h3 className="font-semibold text-gray-900 text-lg">Become a Patron</h3>
        <p className="text-sm text-gray-500 mt-1">Choose a tier to support the community</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tiers.map((tier, index) => {
          const isSelected = currentAmount === tier.amount;
          const isMiddle = index === 1;
          return (
            <button key={tier.amount} onClick={() => {
              if (isVariablePrice) handlePresetSelect(tier.amount);
              else if (currentProductId) { if (isSelected) handleClear(); else setPatronAmount(currentProductId, tier.amount, false); }
            }} aria-label={`Select ${tier.label} tier at ${formatCurrency(tier.amount)}`} tabIndex={0}
              className={cn('relative flex flex-col items-center p-5 rounded-2xl border-2 transition-all', isSelected ? 'border-gray-900 bg-gray-50 shadow-lg' : isMiddle ? 'border-gray-200 bg-white shadow-md' : 'border-gray-100 bg-white shadow-sm hover:border-gray-200')}>
              {isMiddle && !isSelected && <span className="absolute -top-2.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">Popular</span>}
              <span className="text-3xl mb-2">{tier.emoji}</span>
              <span className="text-sm font-semibold text-gray-900 mb-1">{tier.label}</span>
              <span className={cn('text-xl font-bold', isSelected ? 'text-gray-900' : 'text-gray-700')}>{formatCurrency(tier.amount)}</span>
              {isSelected && <span className="text-xs text-green-600 mt-1 font-medium">Selected</span>}
            </button>
          );
        })}
      </div>

      {currentAmount > 0 && (
        <div className="text-center pt-1">
          <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 text-xs transition-colors">Remove contribution</button>
        </div>
      )}
      <p className="text-xs text-gray-400 text-center">501(c)(3) nonprofit. All contributions tax-deductible.</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEV TOGGLE & MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

const PatronDevToggleBar = ({ variant, onChange }: { variant: PatronVariant; onChange: (v: PatronVariant) => void }) => (
  <div className="flex items-center gap-1 mb-2 font-mono text-[10px]">
    <span className="text-gray-400 mr-1">Patron:</span>
    {VARIANT_LIST.map((v) => (
      <button key={v} onClick={() => onChange(v)} aria-label={`Switch to ${v} patron variant`} tabIndex={0}
        className={cn('px-2 py-0.5 rounded transition-colors capitalize', variant === v ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
        {v}
      </button>
    ))}
  </div>
);

const PATRON_VARIANT_MAP: Record<PatronVariant, React.ComponentType<PatronSectionProps>> = {
  default: DefaultPatronVariant,
  slider: SliderVariant,
  tiers: TiersVariant,
};

export default function PatronSection(props: PatronSectionProps) {
  const [variant, setVariant] = useState<PatronVariant>('default');
  const VariantComponent = PATRON_VARIANT_MAP[variant];
  return (
    <div>
      {DEV_TOGGLE && <PatronDevToggleBar variant={variant} onChange={setVariant} />}
      <VariantComponent {...props} />
    </div>
  );
}
