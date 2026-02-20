'use client';

import React, { useState } from 'react';
import {
  Ticket,
  Home,
  ShoppingBag,
  Heart,
  X,
  AlertCircle,
  CloudRain,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCheckout } from '@/providers/checkoutProvider';
import { useApplication } from '@/providers/applicationProvider';
import {
  formatCurrency,
  formatDate,
} from '@/types/checkout';
import InsuranceCard from './InsuranceCard';

const DEV_TOGGLE = true;
type ConfirmVariant = 'default' | 'receipt' | 'split';
const VARIANT_LIST: ConfirmVariant[] = ['default', 'receipt', 'split'];

function useConfirmData() {
  const {
    cart, summary, attendees, applyPromoCode, clearPromoCode, toggleInsurance, isLoading, error: checkoutError, isEditing, editCredit,
  } = useCheckout();
  const { getRelevantApplication } = useApplication();
  const application = getRelevantApplication();
  const accountCredit = application?.credit ?? 0;

  const getAttendeeName = (attendeeId: number): string => attendees.find((a) => a.id === attendeeId)?.name || 'Unknown';

  const passesByAttendee = cart.passes.reduce((acc, pass) => {
    if (!acc[pass.attendeeId]) acc[pass.attendeeId] = [];
    acc[pass.attendeeId].push(pass);
    return acc;
  }, {} as Record<number, typeof cart.passes>);

  const hasEditChanges = isEditing && attendees.some(a => a.products.some(p => p.edit));
  const hasCartItems = cart.passes.length > 0 || cart.housing || cart.merch.length > 0 || cart.patron || hasEditChanges;
  const hasInsurableProducts = cart.passes.some(p => p.product.insurance_percentage != null) || (cart.housing?.product.insurance_percentage != null) || cart.merch.some(m => m.product.insurance_percentage != null);

  return {
    cart, summary, attendees, applyPromoCode, clearPromoCode, toggleInsurance, isLoading, checkoutError,
    isEditing, editCredit, accountCredit, getAttendeeName, passesByAttendee, hasEditChanges, hasCartItems, hasInsurableProducts,
  };
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT — Original confirm step
// ═══════════════════════════════════════════════════════════════

function DefaultConfirmVariant() {
  const {
    cart, summary, applyPromoCode, clearPromoCode, toggleInsurance, isLoading, checkoutError,
    isEditing, editCredit, accountCredit, getAttendeeName, passesByAttendee, hasCartItems, hasInsurableProducts,
  } = useConfirmData();

  const [promoInput, setPromoInput] = useState(cart.promoCode);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) { setPromoError('Please enter a promo code'); return; }
    setPromoLoading(true); setPromoError('');
    try {
      const success = await applyPromoCode(promoInput.trim().toUpperCase());
      if (!success) setPromoError('Invalid promo code');
    } catch { setPromoError('Failed to validate promo code'); }
    finally { setPromoLoading(false); }
  };

  const handleClearPromo = () => { setPromoInput(''); setPromoError(''); clearPromoCode(); };

  if (!hasCartItems) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 max-w-md">Please go back and select some passes to continue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checkoutError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800">Error</h4>
            <p className="text-sm text-red-600">{checkoutError}</p>
          </div>
        </div>
      )}

      {hasInsurableProducts && (
        <InsuranceCard insurance={cart.insurance} price={cart.insurancePotentialPrice} onToggle={toggleInsurance} />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {cart.passes.length > 0 && (
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Passes</span>
            </div>
            <div className="space-y-3">
              {Object.entries(passesByAttendee).map(([attendeeId, passes]) => (
                <div key={attendeeId}>
                  <p className="text-sm font-medium text-gray-700 mb-1">{getAttendeeName(Number(attendeeId))}</p>
                  {passes.map((pass, idx) => (
                    <div key={`${pass.productId}-${idx}`} className="flex items-center justify-between text-sm py-0.5">
                      <span className="text-gray-600">{pass.product.name}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(pass.originalPrice ?? pass.price)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {cart.housing && (
          <>
            <div className="border-t border-gray-100" />
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Housing</span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{cart.housing.product.name}</p>
                  <p className="text-xs text-gray-500">{cart.housing.nights} night{cart.housing.nights !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-400">{formatDate(cart.housing.checkIn)} &ndash; {formatDate(cart.housing.checkOut)}</p>
                </div>
                <span className="font-medium text-gray-900 text-sm">{formatCurrency(cart.housing.totalPrice)}</span>
              </div>
            </div>
          </>
        )}

        {cart.merch.length > 0 && (
          <>
            <div className="border-t border-gray-100" />
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Merchandise</span>
              </div>
              <div className="space-y-1">
                {cart.merch.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.product.name} <span className="text-gray-400">&times;{item.quantity}</span></span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {cart.patron && (
          <>
            <div className="border-t border-gray-100" />
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Patron</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Community contribution</span>
                <span className="font-medium text-gray-900">{formatCurrency(cart.patron.amount)}</span>
              </div>
            </div>
          </>
        )}

        {cart.insurance && summary.insuranceSubtotal > 0 && (
          <>
            <div className="border-t border-gray-100" />
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <CloudRain className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Insurance</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Change of plans coverage</span>
                <span className="font-medium text-gray-900">{formatCurrency(summary.insuranceSubtotal)}</span>
              </div>
            </div>
          </>
        )}

        <div className="border-t border-gray-100" />
        <div className="px-4 sm:px-5 py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
              placeholder="Promo code"
              disabled={cart.promoCodeValid}
              className={cn(
                'flex-1 px-3 py-2 border rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                promoError ? 'border-red-300 bg-red-50' : cart.promoCodeValid ? 'border-green-300 bg-green-50' : 'border-gray-200'
              )}
            />
            {cart.promoCodeValid ? (
              <button onClick={handleClearPromo} aria-label="Remove promo code" tabIndex={0}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors duration-200 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleApplyPromo} disabled={promoLoading || isLoading || !promoInput.trim()}
                className={cn('px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0', !promoInput.trim() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800')}>
                {(promoLoading || isLoading) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
              </button>
            )}
          </div>
          {promoError && (
            <div className="flex items-center gap-1.5 text-red-600 text-xs mt-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
              <AlertCircle className="w-3 h-3" /><span>{promoError}</span>
            </div>
          )}
          {cart.promoCodeValid && (
            <p className="text-green-600 text-xs mt-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">Code applied!</p>
          )}
        </div>

        <div className={cn('border-t border-gray-200 px-5 py-4', summary.grandTotal === 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-gray-50')}>
          {summary.discount > 0 && (
            <div className="flex justify-between text-sm text-gray-500 mb-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
              <span>Subtotal</span><span>{formatCurrency(summary.subtotal)}</span>
            </div>
          )}
          {summary.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 mb-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
              <span>Promo Discount</span><span>-{formatCurrency(summary.discount)}</span>
            </div>
          )}
          {isEditing && editCredit > 0 && (
            <div className="flex justify-between text-sm text-orange-600 mb-2">
              <span>Edit Credit</span><span>-{formatCurrency(editCredit)}</span>
            </div>
          )}
          {accountCredit > 0 && (
            <div className="flex justify-between text-sm text-blue-600 mb-2">
              <span>Account Credit</span><span>-{formatCurrency(accountCredit)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">
              {summary.discount > 0 || summary.credit > 0 ? 'Total' : 'Subtotal'}
            </span>
            {summary.grandTotal === 0 ? (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="text-2xl font-bold text-amber-600">$0</span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(summary.grandTotal)}</span>
            )}
          </div>
          {summary.grandTotal === 0 && (
            <p className="text-sm text-amber-600 mt-2 text-center">Your order is covered &mdash; no payment needed</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RECEIPT — Paper receipt style
// ═══════════════════════════════════════════════════════════════

function ReceiptConfirmVariant() {
  const {
    cart, summary, applyPromoCode, clearPromoCode, toggleInsurance, isLoading, checkoutError,
    isEditing, editCredit, accountCredit, getAttendeeName, passesByAttendee, hasCartItems, hasInsurableProducts,
  } = useConfirmData();

  const [promoInput, setPromoInput] = useState(cart.promoCode);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) { setPromoError('Please enter a promo code'); return; }
    setPromoLoading(true); setPromoError('');
    try { const success = await applyPromoCode(promoInput.trim().toUpperCase()); if (!success) setPromoError('Invalid promo code'); }
    catch { setPromoError('Failed to validate promo code'); }
    finally { setPromoLoading(false); }
  };
  const handleClearPromo = () => { setPromoInput(''); setPromoError(''); clearPromoCode(); };

  if (!hasCartItems) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 max-w-md">Please go back and select some passes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checkoutError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{checkoutError}</p>
        </div>
      )}

      {hasInsurableProducts && (
        <InsuranceCard insurance={cart.insurance} price={cart.insurancePotentialPrice} onToggle={toggleInsurance} />
      )}

      <div className="relative bg-[#fefdf8] border border-amber-100 rounded-lg overflow-hidden shadow-sm font-mono">
        <div className="px-5 py-5 pt-6 space-y-3 text-sm">
          <div className="text-center border-b border-dashed border-amber-200 pb-3">
            <p className="font-bold text-gray-800 text-base">ORDER SUMMARY</p>
            <p className="text-[10px] text-gray-400 mt-1">EDGE CITY</p>
          </div>

          {cart.passes.length > 0 && (
            <div className="border-b border-dashed border-amber-200 pb-3">
              {Object.entries(passesByAttendee).map(([attendeeId, passes]) => (
                <div key={attendeeId} className="mb-1.5 last:mb-0">
                  <p className="text-xs text-gray-500 font-bold">{getAttendeeName(Number(attendeeId))}</p>
                  {passes.map((pass, idx) => (
                    <div key={`${pass.productId}-${idx}`} className="flex justify-between text-xs py-0.5">
                      <span className="text-gray-600 truncate mr-2">{pass.product.name}</span>
                      <span className="text-gray-800 font-bold tabular-nums">{formatCurrency(pass.originalPrice ?? pass.price)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {cart.housing && (
            <div className="flex justify-between text-xs border-b border-dashed border-amber-200 pb-3">
              <span className="text-gray-600">Housing: {cart.housing.product.name} ({cart.housing.nights}n)</span>
              <span className="text-gray-800 font-bold tabular-nums">{formatCurrency(cart.housing.totalPrice)}</span>
            </div>
          )}

          {cart.merch.length > 0 && (
            <div className="border-b border-dashed border-amber-200 pb-3">
              {cart.merch.map((item) => (
                <div key={item.productId} className="flex justify-between text-xs py-0.5">
                  <span className="text-gray-600">{item.product.name} x{item.quantity}</span>
                  <span className="text-gray-800 font-bold tabular-nums">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          )}

          {cart.patron && (
            <div className="flex justify-between text-xs border-b border-dashed border-amber-200 pb-3">
              <span className="text-gray-600">Patron</span>
              <span className="text-gray-800 font-bold tabular-nums">{formatCurrency(cart.patron.amount)}</span>
            </div>
          )}

          {cart.insurance && summary.insuranceSubtotal > 0 && (
            <div className="flex justify-between text-xs border-b border-dashed border-amber-200 pb-3">
              <span className="text-gray-600">Insurance</span>
              <span className="text-gray-800 font-bold tabular-nums">{formatCurrency(summary.insuranceSubtotal)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
              placeholder="PROMO"
              disabled={cart.promoCodeValid}
              className={cn(
                'flex-1 px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono uppercase',
                promoError ? 'border-red-300' : cart.promoCodeValid ? 'border-green-300 bg-green-50' : 'border-amber-200'
              )}
            />
            {cart.promoCodeValid ? (
              <button onClick={handleClearPromo} aria-label="Remove promo code" tabIndex={0} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleApplyPromo} disabled={promoLoading || isLoading || !promoInput.trim()} className="px-2 py-1.5 bg-amber-100 text-amber-800 rounded text-xs font-bold hover:bg-amber-200 disabled:opacity-50">
                {promoLoading ? '...' : 'Apply'}
              </button>
            )}
          </div>
          {promoError && <p className="text-red-500 text-[10px]">{promoError}</p>}
          {cart.promoCodeValid && <p className="text-green-600 text-[10px]">Code applied!</p>}

          <div className="border-t-2 border-double border-amber-300 pt-3 space-y-1">
            {summary.discount > 0 && (
              <div className="flex justify-between text-xs"><span className="text-gray-500">Discount</span><span className="text-green-600">-{formatCurrency(summary.discount)}</span></div>
            )}
            {isEditing && editCredit > 0 && (
              <div className="flex justify-between text-xs"><span className="text-orange-600">Edit Credit</span><span className="text-orange-600">-{formatCurrency(editCredit)}</span></div>
            )}
            {accountCredit > 0 && (
              <div className="flex justify-between text-xs"><span className="text-blue-600">Account Credit</span><span className="text-blue-600">-{formatCurrency(accountCredit)}</span></div>
            )}
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-gray-900 text-base">TOTAL</span>
              <span className="font-bold text-gray-900 text-xl tabular-nums">{formatCurrency(summary.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SPLIT — Two-column layout (stacked on mobile)
// ═══════════════════════════════════════════════════════════════

function SplitConfirmVariant() {
  const {
    cart, summary, applyPromoCode, clearPromoCode, toggleInsurance, isLoading, checkoutError,
    isEditing, editCredit, accountCredit, getAttendeeName, passesByAttendee, hasCartItems, hasInsurableProducts,
  } = useConfirmData();

  const [promoInput, setPromoInput] = useState(cart.promoCode);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) { setPromoError('Please enter a promo code'); return; }
    setPromoLoading(true); setPromoError('');
    try { const success = await applyPromoCode(promoInput.trim().toUpperCase()); if (!success) setPromoError('Invalid promo code'); }
    catch { setPromoError('Failed to validate promo code'); }
    finally { setPromoLoading(false); }
  };
  const handleClearPromo = () => { setPromoInput(''); setPromoError(''); clearPromoCode(); };

  if (!hasCartItems) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 max-w-md">Please go back and select some passes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checkoutError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{checkoutError}</p>
        </div>
      )}

      {hasInsurableProducts && (
        <InsuranceCard insurance={cart.insurance} price={cart.insurancePotentialPrice} onToggle={toggleInsurance} />
      )}

      <div className="flex flex-col lg:flex-row lg:gap-4">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 lg:mb-0">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Order Items</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {cart.passes.length > 0 && (
              <div className="px-5 py-3">
                {Object.entries(passesByAttendee).map(([attendeeId, passes]) => (
                  <div key={attendeeId} className="mb-2 last:mb-0">
                    <p className="text-xs font-semibold text-gray-500 mb-1">{getAttendeeName(Number(attendeeId))}</p>
                    {passes.map((pass, idx) => (
                      <div key={`${pass.productId}-${idx}`} className="flex justify-between text-sm py-0.5">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-700">{pass.product.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">{formatCurrency(pass.originalPrice ?? pass.price)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {cart.housing && (
              <div className="px-5 py-3 flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Home className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-700">{cart.housing.product.name} ({cart.housing.nights}n)</span>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(cart.housing.totalPrice)}</span>
              </div>
            )}
            {cart.merch.length > 0 && cart.merch.map((item) => (
              <div key={item.productId} className="px-5 py-3 flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-700">{item.product.name} x{item.quantity}</span>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(item.totalPrice)}</span>
              </div>
            ))}
            {cart.patron && (
              <div className="px-5 py-3 flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-700">Patron</span>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(cart.patron.amount)}</span>
              </div>
            )}
            {cart.insurance && summary.insuranceSubtotal > 0 && (
              <div className="px-5 py-3 flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-700">Insurance</span>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(summary.insuranceSubtotal)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-64 flex-shrink-0 space-y-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                placeholder="Promo code"
                disabled={cart.promoCodeValid}
                className={cn(
                  'flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                  promoError ? 'border-red-300' : cart.promoCodeValid ? 'border-green-300 bg-green-50' : 'border-gray-200'
                )}
              />
              {cart.promoCodeValid ? (
                <button onClick={handleClearPromo} aria-label="Remove promo code" tabIndex={0} className="px-2 py-2 rounded-lg bg-slate-100 text-gray-500 hover:bg-red-100 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleApplyPromo} disabled={promoLoading || isLoading || !promoInput.trim()}
                  className={cn('px-3 py-2 rounded-lg text-sm font-medium', !promoInput.trim() ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-gray-800')}>
                  {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </button>
              )}
            </div>
            {promoError && <p className="text-red-500 text-xs">{promoError}</p>}
            {cart.promoCodeValid && <p className="text-green-600 text-xs">Code applied!</p>}
          </div>

          <div className={cn('rounded-2xl border p-4', summary.grandTotal === 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100')}>
            {summary.discount > 0 && (
              <div className="flex justify-between text-sm text-gray-500 mb-1.5"><span>Subtotal</span><span>{formatCurrency(summary.subtotal)}</span></div>
            )}
            {summary.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 mb-1.5"><span>Discount</span><span>-{formatCurrency(summary.discount)}</span></div>
            )}
            {isEditing && editCredit > 0 && (
              <div className="flex justify-between text-sm text-orange-600 mb-1.5"><span>Edit Credit</span><span>-{formatCurrency(editCredit)}</span></div>
            )}
            {accountCredit > 0 && (
              <div className="flex justify-between text-sm text-blue-600 mb-1.5"><span>Account Credit</span><span>-{formatCurrency(accountCredit)}</span></div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total</span>
              {summary.grandTotal === 0 ? (
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xl font-bold text-amber-600">$0</span>
                </div>
              ) : (
                <span className="text-xl font-bold text-gray-900">{formatCurrency(summary.grandTotal)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEV TOGGLE & MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

const ConfirmDevToggleBar = ({ variant, onChange }: { variant: ConfirmVariant; onChange: (v: ConfirmVariant) => void }) => (
  <div className="flex items-center gap-1 mb-2 font-mono text-[10px]">
    <span className="text-gray-400 mr-1">Confirm:</span>
    {VARIANT_LIST.map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        aria-label={`Switch to ${v} confirm variant`}
        tabIndex={0}
        className={cn(
          'px-2 py-0.5 rounded transition-colors capitalize',
          variant === v ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        )}
      >
        {v}
      </button>
    ))}
  </div>
);

const CONFIRM_VARIANT_MAP: Record<ConfirmVariant, React.ComponentType> = {
  default: DefaultConfirmVariant,
  receipt: ReceiptConfirmVariant,
  split: SplitConfirmVariant,
};

export default function ConfirmStep() {
  const [variant, setVariant] = useState<ConfirmVariant>('default');
  const VariantComponent = CONFIRM_VARIANT_MAP[variant];
  return (
    <div>
      {DEV_TOGGLE && <ConfirmDevToggleBar variant={variant} onChange={setVariant} />}
      <VariantComponent />
    </div>
  );
}
