/**
 * Checkout Flow Types
 *
 * These types support the multi-step checkout flow ported from magipatterns.
 * They integrate with existing EdgeOS types (Products, Attendee, Application).
 */

import { AttendeeCategory, AttendeeProps } from './Attendee';
import { ProductsProps, ProductsPass, CategoryProducts } from './Products';

// --- Step Types ---
export type CheckoutStep = 'passes' | 'housing' | 'merch' | 'patron' | 'confirm' | 'success';

export interface StepConfig {
  id: CheckoutStep;
  label: string;
  description: string;
  icon: string; // lucide-react icon name
  optional: boolean;
}

export const CHECKOUT_STEPS: StepConfig[] = [
  { id: 'passes', label: 'Passes', description: 'Select your passes', icon: 'Ticket', optional: false },
  { id: 'patron', label: 'Patron', description: 'Support the community', icon: 'Heart', optional: true },
  { id: 'housing', label: 'Housing', description: 'Book accommodation', icon: 'Home', optional: true },
  { id: 'merch', label: 'Merch', description: 'Get official merch', icon: 'ShoppingBag', optional: true },
  { id: 'confirm', label: 'Confirm', description: 'Review and pay', icon: 'CheckCircle', optional: false },
];

// --- Extended Product Categories ---
// Extends existing CategoryProducts with checkout-specific categories
export type CheckoutProductCategory = CategoryProducts | 'housing' | 'merch' | 'patreon';

// --- Selected Items ---
export interface SelectedPassItem {
  productId: number;
  product: ProductsPass;
  attendeeId: number;
  attendee: AttendeeProps;
  quantity: number;
  price: number;
  originalPrice?: number; // For early bird display
}

export interface SelectedHousingItem {
  productId: number;
  product: ProductsProps;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  nights: number;
  pricePerNight: number;
  totalPrice: number;
}

export interface SelectedMerchItem {
  productId: number;
  product: ProductsProps;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SelectedPatronItem {
  productId: number;
  product: ProductsProps;
  amount: number;
  isCustomAmount: boolean;
}

// --- Cart State ---
export interface CheckoutCartState {
  // Pass selections by attendee
  passes: SelectedPassItem[];

  // Housing selection (optional, single item)
  housing: SelectedHousingItem | null;

  // Merch selections
  merch: SelectedMerchItem[];

  // Patron contribution
  patron: SelectedPatronItem | null;

  // Promo/discount code
  promoCode: string;
  promoCodeValid: boolean;
  promoCodeDiscount: number;

  // Insurance option
  insurance: boolean;
  insurancePrice: number;
  insurancePotentialPrice: number; // Always calculated, regardless of insurance toggle state
}

// --- Cart Summary ---
export interface CheckoutCartSummary {
  passesSubtotal: number;
  housingSubtotal: number;
  merchSubtotal: number;
  patronSubtotal: number;
  insuranceSubtotal: number;
  subtotal: number;
  discount: number;
  credit: number; // From application credit
  grandTotal: number;
  itemCount: number;
}

// --- Checkout Context ---
export interface CheckoutContextState {
  // Current step
  currentStep: CheckoutStep;

  // Cart state
  cart: CheckoutCartState;

  // Computed summary
  summary: CheckoutCartSummary;

  // Available products by category
  passProducts: ProductsProps[];
  housingProducts: ProductsProps[];
  merchProducts: ProductsProps[];
  patronProducts: ProductsProps[];

  // Application and attendees
  applicationId: number;
  attendees: AttendeeProps[];

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;

  // Error state
  error: string | null;
}

// --- Checkout Actions ---
export interface CheckoutActions {
  // Navigation
  goToStep: (step: CheckoutStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;

  // Pass actions
  togglePass: (attendeeId: number, productId: number) => void;
  updatePassQuantity: (attendeeId: number, productId: number, quantity: number) => void;

  // Housing actions
  selectHousing: (productId: number, checkIn: string, checkOut: string) => void;
  clearHousing: () => void;

  // Merch actions
  updateMerchQuantity: (productId: number, quantity: number) => void;

  // Patron actions
  setPatronAmount: (productId: number, amount: number, isCustom?: boolean) => void;
  clearPatron: () => void;

  // Promo code
  applyPromoCode: (code: string) => Promise<boolean>;
  clearPromoCode: () => void;

  // Insurance
  toggleInsurance: () => void;

  // Cart management
  removeItem: (type: 'pass' | 'housing' | 'merch' | 'patron', itemId?: number) => void;
  clearCart: () => void;

  // Checkout
  previewPayment: () => Promise<CheckoutCartSummary>;
  submitPayment: () => Promise<{ success: boolean; paymentId?: number; error?: string }>;
}

// --- Patron Presets ---
export const PATRON_PRESETS = [2500, 5000, 7500];
export const PATRON_MINIMUM = 1000;

// --- Insurance ---
export const INSURANCE_BENEFITS = [
  'Full refund up to 14 days before the event',
  '50% refund up to 7 days before',
  'Free date change at no extra cost',
];

// --- Helper Types ---
export interface ProductsByCategory {
  passes: ProductsProps[];
  housing: ProductsProps[];
  merch: ProductsProps[];
  patron: ProductsProps[];
}

// --- API Request/Response Types ---
export interface PaymentPreviewRequest {
  application_id: number;
  products: Array<{
    product_id: number;
    attendee_id: number;
    quantity: number;
  }>;
  coupon_code?: string;
  insurance?: boolean;
}

export interface PaymentPreviewResponse {
  subtotal: number;
  discount: number;
  credit: number;
  total: number;
  insurance_amount: number | null;
  items: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export interface PaymentCreateRequest {
  application_id: number;
  products: Array<{
    product_id: number;
    attendee_id: number;
    quantity: number;
  }>;
  coupon_code?: string;
  insurance?: boolean;
  amount: number;
}

export interface PaymentCreateResponse {
  id: number;
  status: string;
  checkout_url?: string;
  amount: number;
}

// --- Utility Functions ---
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getStepIndex(step: CheckoutStep): number {
  return CHECKOUT_STEPS.findIndex(s => s.id === step);
}

export function getStepIndexInArray(step: CheckoutStep, steps: CheckoutStep[]): number {
  return steps.findIndex(s => s === step);
}

export function isStepComplete(step: CheckoutStep, cart: CheckoutCartState): boolean {
  switch (step) {
    case 'passes':
      return cart.passes.length > 0;
    case 'housing':
      return true; // Optional step
    case 'merch':
      return true; // Optional step
    case 'patron':
      return true; // Optional step
    case 'confirm':
      return false; // Never "complete" until payment
    case 'success':
      return true; // Payment completed
    default:
      return false;
  }
}

export function canProceedToStep(targetStep: CheckoutStep, cart: CheckoutCartState): boolean {
  const targetIndex = getStepIndex(targetStep);

  // Must have at least one pass to proceed past first step
  if (targetIndex > 0 && cart.passes.length === 0) {
    return false;
  }

  return true;
}

// --- Initial State Factory ---
export function createInitialCartState(): CheckoutCartState {
  return {
    passes: [],
    housing: null,
    merch: [],
    patron: null,
    promoCode: '',
    promoCodeValid: false,
    promoCodeDiscount: 0,
    insurance: false,
    insurancePrice: 0,
    insurancePotentialPrice: 0,
  };
}

export function createInitialSummary(): CheckoutCartSummary {
  return {
    passesSubtotal: 0,
    housingSubtotal: 0,
    merchSubtotal: 0,
    patronSubtotal: 0,
    insuranceSubtotal: 0,
    subtotal: 0,
    discount: 0,
    credit: 0,
    grandTotal: 0,
    itemCount: 0,
  };
}

// --- Category mapping helpers ---
export function mapAttendeeToPassCategory(category: AttendeeCategory): 'main' | 'spouse' | 'child' {
  switch (category) {
    case 'main':
      return 'main';
    case 'spouse':
      return 'spouse';
    case 'kid':
    case 'teen':
    case 'baby':
      return 'child';
    default:
      return 'main';
  }
}

export function filterProductsByCategory(
  products: ProductsProps[],
  category: CheckoutProductCategory
): ProductsProps[] {
  return products.filter(p => p.category === category && p.is_active);
}

export function filterProductsByAttendeeCategory(
  products: ProductsProps[],
  attendeeCategory: AttendeeCategory
): ProductsProps[] {
  return products.filter(p => p.attendee_category === attendeeCategory && p.is_active);
}
