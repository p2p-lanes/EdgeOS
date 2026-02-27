'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useCheckout } from '@/providers/checkoutProvider';
import { formatCurrency, PATRON_PRESETS, PATRON_MINIMUM } from '@/types/checkout';

interface PatronSectionProps {
  onSkip?: () => void;
}

export default function PatronSection({ onSkip }: PatronSectionProps) {
  const { patronProducts, cart, setPatronAmount, clearPatron } = useCheckout();

  const patronProduct = patronProducts[0];
  const isVariablePrice = patronProduct?.min_price !== null && patronProduct?.min_price !== undefined;
  const isPatronEnabled = cart.patron !== null;

  const currentAmount = cart.patron?.amount || 0;
  const currentProductId = cart.patron?.productId || patronProduct?.id;

  const [expanded, setExpanded] = useState(true);
  const [isCustom, setIsCustom] = useState(
    currentAmount > 0 && !PATRON_PRESETS.includes(currentAmount)
  );
  const [customValue, setCustomValue] = useState(
    currentAmount > 0 && !PATRON_PRESETS.includes(currentAmount)
      ? currentAmount.toString()
      : ''
  );

  // Update local state when cart changes (only for variable-price)
  useEffect(() => {
    if (!isVariablePrice) return;
    if (cart.patron) {
      setExpanded(true);
      if (!PATRON_PRESETS.includes(cart.patron.amount)) {
        setIsCustom(true);
        setCustomValue(cart.patron.amount.toString());
      }
    }
  }, [cart.patron, isVariablePrice]);

  const handleFixedToggle = (checked: boolean) => {
    if (!patronProduct) return;
    if (checked) {
      setPatronAmount(patronProduct.id, patronProduct.price, false);
    } else {
      clearPatron();
    }
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
  };

  const handleSkip = () => {
    handleClear();
    onSkip?.();
  };

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
                      'w-full pl-7 pr-3 py-2 border rounded-lg text-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:border-transparent',
                      isCustom && customValue && parseInt(customValue.replace(/,/g, ''), 10) >= PATRON_MINIMUM
                        ? 'border-green-400 bg-green-50 focus:ring-green-400'
                        : isCustom && customValue
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-gray-200 focus:ring-amber-400'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-xs text-gray-400',
                    isCustom &&
                      customValue &&
                      parseInt(customValue.replace(/,/g, ''), 10) < PATRON_MINIMUM &&
                      'text-black'
                  )}
                >
                  Min {formatCurrency(PATRON_MINIMUM)}
                </span>
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
