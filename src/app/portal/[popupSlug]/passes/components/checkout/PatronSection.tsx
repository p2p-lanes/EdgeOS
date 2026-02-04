'use client';

import { useState, useEffect } from 'react';
import { Heart, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCheckout } from '@/providers/checkoutProvider';
import { formatCurrency, PATRON_PRESETS, PATRON_MINIMUM } from '@/types/checkout';

interface PatronSectionProps {
  onSkip?: () => void;
}

export default function PatronSection({ onSkip }: PatronSectionProps) {
  const { patronProducts, cart, setPatronAmount, clearPatron } = useCheckout();

  const currentAmount = cart.patron?.amount || 0;
  const currentProductId = cart.patron?.productId || patronProducts[0]?.id;

  const [expanded, setExpanded] = useState(true);
  const [isCustom, setIsCustom] = useState(
    currentAmount > 0 && !PATRON_PRESETS.includes(currentAmount)
  );
  const [customValue, setCustomValue] = useState(
    currentAmount > 0 && !PATRON_PRESETS.includes(currentAmount)
      ? currentAmount.toString()
      : ''
  );

  // Update local state when cart changes
  useEffect(() => {
    if (cart.patron) {
      setExpanded(true);
      if (!PATRON_PRESETS.includes(cart.patron.amount)) {
        setIsCustom(true);
        setCustomValue(cart.patron.amount.toString());
      }
    }
  }, [cart.patron]);

  const handleExpand = () => {
    setExpanded(true);
  };

  const handlePresetSelect = (amount: number) => {
    if (!currentProductId) return;
    const isCurrentlySelected = currentAmount === amount && !isCustom;
    if (isCurrentlySelected) {
      setIsCustom(false);
      setCustomValue('');
      clearPatron();
      return;
    }
    setIsCustom(false);
    setCustomValue('');
    setPatronAmount(currentProductId, amount, false);
  };

  const handleCustomChange = (value: string) => {
    if (!currentProductId) return;
    setIsCustom(true);
    setCustomValue(value);
    const numValue = parseInt(value.replace(/,/g, ''), 10);
    if (!isNaN(numValue) && numValue >= PATRON_MINIMUM) {
      setPatronAmount(currentProductId, numValue, true);
    } else {
      clearPatron();
    }
  };

  const handleClear = () => {
    setIsCustom(false);
    setCustomValue('');
    clearPatron();
    // setExpanded(false);
  };

  const handleSkip = () => {
    handleClear();
    onSkip?.();
  };

  if (patronProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Heart className="w-12 h-12 text-gray-300 mb-4" />
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
      {/* Banner Placeholder */}
      {/* <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-white" aria-hidden="true">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2 uppercase tracking-wide">Banner placeholder</p>
      </div> */}

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header - Always visible */}
        <button
          // onClick={expanded ? () => setExpanded(false) : handleExpand}
          aria-expanded={expanded}
          className="w-full p-5 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">Support Edge City</h3>
            <p className="text-sm text-gray-500">Fund scholarships for builders</p>
          </div>
          {/* <ChevronDown
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform',
              expanded && 'rotate-180'
            )}
          /> */}
        </button>

        {/* Expandable Amount Selection */}
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
      </div>

      {/* Past impact indicator */}
      <p className="text-xs text-gray-400 text-center">
        47 builders & 12 projects funded in 2025
      </p>
    </div>
  );
}
