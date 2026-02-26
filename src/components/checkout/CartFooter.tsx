'use client';

import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Ticket,
  Home,
  ShoppingBag,
  Heart,
  X,
  Shield,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCheckout } from '@/providers/checkoutProvider';
import {
  formatCurrency,
} from '@/types/checkout';

interface CartFooterProps {
  onPay?: () => void;
  onBack?: () => void;
}

export default function CartFooter({ onPay, onBack }: CartFooterProps) {
  const {
    cart,
    summary,
    currentStep,
    availableSteps,
    attendees,
    goToNextStep,
    goToPreviousStep,
    togglePass,
    resetDayProduct,
    clearHousing,
    updateMerchQuantity,
    clearPatron,
    canProceedToStep,
    isStepComplete,
    isSubmitting,
    isEditing,
    editCredit,
    monthUpgradeCredit,
  } = useCheckout();

  const [isExpanded, setIsExpanded] = useState(false);

  const isConfirmStep = currentStep === 'confirm';
  const isFirstStep = currentStep === 'passes';
  const currentIndex = availableSteps.findIndex(s => s === currentStep);
  const nextStepId = currentIndex < availableSteps.length - 1
    ? availableSteps[currentIndex + 1]
    : null;

  const hasEditChanges = isEditing && attendees.some(a => a.products.some(p => p.edit));
  const canContinue = isEditing
    ? cart.passes.length > 0
    : isConfirmStep
    ? cart.passes.length > 0
    : nextStepId
    ? canProceedToStep(nextStepId)
    : false;

  const hasItems = summary.itemCount > 0 || (isEditing && hasEditChanges);

  // Get attendee name by ID
  const getAttendeeName = (attendeeId: number): string => {
    const attendee = attendees.find((a) => a.id === attendeeId);
    return attendee?.name || 'Unknown';
  };

  const handleContinue = () => {
    if (isConfirmStep && onPay) {
      onPay();
    } else {
      goToNextStep();
    }
  };

  const handleRemovePass = (attendeeId: number, productId: number) => {
    const pass = cart.passes.find(p => p.attendeeId === attendeeId && p.productId === productId);
    const isDayProductWithOriginalQuantity = pass?.product.category.includes('day');
    
    if (isDayProductWithOriginalQuantity) {
      resetDayProduct(attendeeId, productId);
    } else {
      togglePass(attendeeId, productId);
    }
  };

  const handleRemoveMerch = (productId: number) => {
    updateMerchQuantity(productId, 0);
  };

  return (
    <div className="z-30">
      {/* Backdrop to close cart on click outside */}
      {isExpanded && (
        <button
          type="button"
          aria-label="Close cart"
          className="fixed inset-0 z-20 cursor-default"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Expanded Cart Drawer */}
      <div
        className={cn(
          'bg-white shadow-2xl transition-all duration-300 ease-in-out overflow-hidden rounded-2xl mb-2 relative z-30',
          isExpanded ? 'max-h-[60vh]' : 'max-h-0'
        )}
      >
        <div className="px-4 py-4 overflow-y-auto max-h-[calc(60vh-80px)]">
          {/* Passes */}
          {cart.passes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Passes
              </h4>
              <div className="space-y-2">
                {cart.passes.map((pass, idx) => (
                  <div
                    key={`${pass.attendeeId}-${pass.productId}-${idx}`}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Ticket className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getAttendeeName(pass.attendeeId)}
                        </p>
                        <p className="text-xs text-gray-500">{pass.product.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(pass.originalPrice ?? pass.price)}
                      </span>
                      <button
                        onClick={() => handleRemovePass(pass.attendeeId, pass.productId)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Housing */}
          {cart.housing && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Housing
              </h4>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Home className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {cart.housing.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cart.housing.nights} night{cart.housing.nights !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(cart.housing.totalPrice)}
                  </span>
                  <button
                    onClick={clearHousing}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Merch */}
          {cart.merch.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Merchandise
              </h4>
              <div className="space-y-2">
                {cart.merch.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <ShoppingBag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.totalPrice)}
                      </span>
                      <button
                        onClick={() => handleRemoveMerch(item.productId)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patron */}
          {cart.patron && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Patron Contribution
              </h4>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">
                    Community Support
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(cart.patron.amount)}
                  </span>
                  <button
                    onClick={clearPatron}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Insurance */}
          {cart.insurance && summary.insuranceSubtotal > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Pass Protection
              </h4>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">
                    Coverage for all passes
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(summary.insuranceSubtotal)}
                </span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!hasItems && (
            <div className="py-8 text-center">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Footer - D1 variant */}
      <div className="mb-4">
        <div className="backdrop-blur-xl bg-gray-900/95 rounded-2xl shadow-2xl border border-white/10 p-3 lg:p-4">
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Back button - always visible */}
            <button
              onClick={isFirstStep ? onBack : goToPreviousStep}
              className="flex items-center justify-center p-2.5 lg:px-3 lg:py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden lg:inline text-sm font-medium ml-1.5">Back</span>
            </button>

            {/* Center: Total - clickable to expand */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden hover:opacity-80 transition-opacity"
            >
              <div className="flex flex-col items-start min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wider font-medium">
                    {isEditing ? 'To Pay' : 'Total'}
                  </span>
                  {hasItems && (
                    isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronUp className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    )
                  )}
                </div>
                <span className="text-lg lg:text-2xl font-bold text-white truncate max-w-full">
                  {formatCurrency(summary.grandTotal)}
                </span>
                {isEditing && editCredit > 0 && (
                  <span className="text-[10px] lg:text-xs text-orange-400 font-medium">
                    Credit: {formatCurrency(editCredit)}
                  </span>
                )}
                {/* {monthUpgradeCredit > 0 && (
                  <span className="text-[10px] lg:text-xs text-emerald-400 font-medium">
                    Upgrade credit: {formatCurrency(monthUpgradeCredit)}
                  </span>
                )} */}
              </div>
            </button>

            {/* Continue button */}
            <button
              onClick={handleContinue}
              disabled={!canContinue || isSubmitting}
              className={cn(
                'flex items-center justify-center gap-1.5 lg:gap-2 px-3 lg:px-6 py-3 lg:py-3.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0 whitespace-nowrap',
                canContinue && !isSubmitting
                  ? 'bg-white hover:bg-gray-100 text-gray-900 shadow-lg active:scale-95'
                  : 'bg-white/20 text-gray-400 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {isEditing
                      ? isConfirmStep
                        ? summary.grandTotal === 0
                          ? 'Confirm Edit'
                          : 'Pay & Confirm Edit'
                        : 'Continue'
                      : isConfirmStep
                      ? summary.grandTotal === 0
                        ? 'Claim Pass'
                        : 'Pay'
                      : 'Continue'}
                  </span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
