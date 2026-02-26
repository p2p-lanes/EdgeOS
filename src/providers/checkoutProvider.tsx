'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { usePassesProvider } from './passesProvider';
import { useApplication } from './applicationProvider';
import {
  CheckoutStep,
  CheckoutCartState,
  CheckoutCartSummary,
  SelectedPassItem,
  SelectedHousingItem,
  SelectedMerchItem,
  SelectedPatronItem,
  createInitialCartState,
  createInitialSummary,
} from '@/types/checkout';
import { ProductsProps, ProductsPass } from '@/types/Products';
import { AttendeeProps } from '@/types/Attendee';
import { useCityProvider } from './cityProvider';
import { api } from '@/api';
import { toast } from 'sonner';
import {
  saveCheckoutCart,
  loadCheckoutCart,
  clearCartStorage,
  PersistedCheckoutCart,
} from '@/hooks/useCartStorage';
import { jwtDecode } from 'jwt-decode';
import { User } from '@/types/User';

interface CheckoutContextValue {
  // Current step
  currentStep: CheckoutStep;

  // Available steps (dynamically filtered)
  availableSteps: CheckoutStep[];

  // Cart state
  cart: CheckoutCartState;

  // Computed summary
  summary: CheckoutCartSummary;

  // Available products by category
  passProducts: ProductsProps[];
  housingProducts: ProductsProps[];
  merchProducts: ProductsProps[];
  patronProducts: ProductsProps[];

  // Attendees
  attendees: AttendeeProps[];

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;

  // Error state
  error: string | null;

  // Navigation
  goToStep: (step: CheckoutStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;

  // Pass actions (delegates to passesProvider)
  togglePass: (attendeeId: number, productId: number) => void;
  resetDayProduct: (attendeeId: number, productId: number) => void;

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
  clearCart: () => void;

  // Check if can proceed
  canProceedToStep: (step: CheckoutStep) => boolean;
  isStepComplete: (step: CheckoutStep) => boolean;

  // Payment
  submitPayment: () => Promise<{ success: boolean; error?: string }>;

  // Edit mode
  isEditing: boolean;
  toggleEditing: (editing?: boolean) => void;
  editCredit: number;

  // Month upgrade credit (purchased week/day value when upgrading to month)
  monthUpgradeCredit: number;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

interface CheckoutProviderProps {
  children: ReactNode;
  products: ProductsProps[];
  initialStep?: CheckoutStep;
}

export function CheckoutProvider({ children, products, initialStep = 'passes' }: CheckoutProviderProps) {
  const { attendeePasses, toggleProduct, resetDayProduct, discountApplied, setDiscount, clearDiscount, clearSelections, isEditing, editCredit, toggleEditing } = usePassesProvider();
  const { getRelevantApplication } = useApplication();
  const { getCity } = useCityProvider();
  const application = getRelevantApplication();
  const city = getCity();
  const cityId = city?.id;

  const citizenId = useMemo(() => {
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      if (!token) return null;
      const decoded = jwtDecode<User>(token);
      return decoded.citizen_id ?? null;
    } catch {
      return null;
    }
  }, []);

  // Flag to prevent save effect from overwriting localStorage before restoration
  const hasRestoredCheckoutRef = useRef(false);

  // Step management
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(initialStep);

  // Cart state for non-pass items — starts empty, restored reactively via useEffect
  const [housing, setHousing] = useState<SelectedHousingItem | null>(null);
  const [merch, setMerch] = useState<SelectedMerchItem[]>([]);
  const [patron, setPatron] = useState<SelectedPatronItem | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeValid, setPromoCodeValid] = useState(false);
  const [promoCodeDiscount, setPromoCodeDiscount] = useState(0);
  const [insurance, setInsurance] = useState(false);

  // Restore checkout cart from localStorage once cityId and citizenId become available
  // If initialStep is 'success', user is returning from a confirmed payment — clear storage instead
  useEffect(() => {
    if (hasRestoredCheckoutRef.current || !cityId || !citizenId) return;

    hasRestoredCheckoutRef.current = true;

    // Returning from successful payment — clear persisted cart and pass selections, don't restore
    if (initialStep === 'success') {
      clearCartStorage(citizenId, cityId);
      clearSelections();
      return;
    }

    const savedCart = loadCheckoutCart(citizenId, cityId);
    if (!savedCart) return;

    // Restore housing
    if (savedCart.housing) {
      const product = products.find(p => p.id === savedCart.housing!.productId);
      if (product) {
        const start = new Date(savedCart.housing.checkIn);
        const end = new Date(savedCart.housing.checkOut);
        const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        setHousing({
          productId: product.id,
          product,
          checkIn: savedCart.housing.checkIn,
          checkOut: savedCart.housing.checkOut,
          nights,
          pricePerNight: product.price,
          totalPrice: product.price * nights,
        });
      }
    }

    // Restore merch
    if (savedCart.merch?.length) {
      const restoredMerch = savedCart.merch.reduce<SelectedMerchItem[]>((acc, saved) => {
        const product = products.find(p => p.id === saved.productId);
        if (!product || saved.quantity <= 0) return acc;
        acc.push({
          productId: product.id,
          product,
          quantity: saved.quantity,
          unitPrice: product.price,
          totalPrice: product.price * saved.quantity,
        });
        return acc;
      }, []);
      if (restoredMerch.length > 0) setMerch(restoredMerch);
    }

    // Restore patron
    if (savedCart.patron) {
      const product = products.find(p => p.id === savedCart.patron!.productId);
      if (product) {
        setPatron({
          productId: product.id,
          product,
          amount: savedCart.patron.amount,
          isCustomAmount: savedCart.patron.isCustomAmount,
        });
      }
    }

  }, [cityId, citizenId, products]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset isSubmitting when page is restored from bfcache (e.g. user presses browser back from payment provider)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsSubmitting(false);
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Filter products by category
  const passProducts = useMemo(() =>
    products.filter(p =>
      ['week', 'month', 'day', 'local week', 'local month', 'local day'].includes(p.category) && p.is_active
    ), [products]);

  const housingProducts = useMemo(() =>
    products.filter(p => p.category === 'housing' && p.is_active), [products]);

  const merchProducts = useMemo(() =>
    products.filter(p => p.category === 'merch' && p.is_active), [products]);

  const patronProducts = useMemo(() =>
    products.filter(p => (p.category === 'patreon' || p.category === 'donation') && p.is_active), [products]);

  // Calculate available steps dynamically based on products
  const availableSteps = useMemo<CheckoutStep[]>(() => {
    const steps: CheckoutStep[] = ['passes']; // Passes always available
    
    if (patronProducts.length > 0) steps.push('patron');
    if (housingProducts.length > 0) steps.push('housing');
    if (merchProducts.length > 0) steps.push('merch');
    
    steps.push('confirm'); // Confirm always available
    
    return steps;
  }, [patronProducts.length, housingProducts.length, merchProducts.length]);

  // Build selected passes from attendeePasses (integrates with existing provider)
  // In edit mode, exclude purchased products marked for credit (edit=true, selected=true)
  const selectedPasses = useMemo<SelectedPassItem[]>(() => {
    const passes: SelectedPassItem[] = [];

    attendeePasses.forEach(attendee => {
      attendee.products.forEach(product => {
        // Skip purchased products being edited (they contribute to credit, not cart)
        if (product.selected && !(isEditing && product.purchased)) {
          const quantity = product.category.includes('day')
            ? (product.quantity ?? 1) - (product.original_quantity ?? 0)
            : 1;

          if (quantity > 0) {
            passes.push({
              productId: product.id,
              product,
              attendeeId: attendee.id,
              attendee,
              quantity,
              price: product.price * quantity,
              originalPrice: product.original_price ? product.original_price * quantity : undefined,
            });
          }
        }
      });
    });

    return passes;
  }, [attendeePasses, isEditing]);

  // When a month pass is selected for an attendee who already has purchased week/day passes,
  // the purchased ticket prices should be credited toward the month upgrade
  const monthUpgradeCredit = useMemo(() => {
    if (isEditing) return 0;

    const hasPatreonSelected = attendeePasses.some(a =>
      a.products.some(p => p.category === 'patreon' && p.selected)
    );
    if (hasPatreonSelected) return 0;

    return attendeePasses.reduce((total, attendee) => {
      const hasMonthSelected = attendee.products.some(p =>
        (p.category === 'month' || p.category === 'local month') && p.selected && !p.purchased
      );
      if (!hasMonthSelected) return total;

      const hasPurchasedWeekOrDay = attendee.products.some(p =>
        ((p.category === 'week' || p.category === 'local week') && p.purchased) ||
        (p.category.includes('day') && p.purchased)
      );
      if (!hasPurchasedWeekOrDay) return total;

      const purchasedCredit = attendee.products
        .filter(p => p.category !== 'patreon' && p.category !== 'supporter' && p.purchased)
        .reduce((sum, p) => sum + (p.price * (p.quantity ?? 1)), 0);

      return total + purchasedCredit;
    }, 0);
  }, [attendeePasses, isEditing]);

  // Calculate insurance amount based on product insurance_percentage
  // Insurance is calculated on the FULL product price (before discounts)
  const calculateInsuranceAmount = useCallback((
    passes: SelectedPassItem[],
    housingItem: SelectedHousingItem | null,
    merchItems: SelectedMerchItem[]
  ): number => {
    let total = 0;

    // Calculate for passes (use original price before discounts)
    passes.forEach(pass => {
      const pct = pass.product.insurance_percentage;
      if (pct != null) {
        const basePrice = pass.originalPrice ?? pass.price;
        total += basePrice * pct / 100;
      }
    });

    // Calculate for housing
    if (housingItem?.product.insurance_percentage != null) {
      total += housingItem.totalPrice * housingItem.product.insurance_percentage / 100;
    }

    // Calculate for merch
    merchItems.forEach(item => {
      const pct = item.product.insurance_percentage;
      if (pct != null) {
        total += item.totalPrice * pct / 100;
      }
    });

    return total;
  }, []);

  // Calculate insurance amount always (for UI display regardless of toggle state)
  const insurancePotentialAmount = useMemo(() => {
    return calculateInsuranceAmount(selectedPasses, housing, merch);
  }, [selectedPasses, housing, merch, calculateInsuranceAmount]);

  // Insurance amount only when enabled (for total calculation)
  const insuranceAmount = useMemo(() => {
    if (!insurance) return 0;
    return insurancePotentialAmount;
  }, [insurance, insurancePotentialAmount]);

  // Build cart state
  const cart = useMemo<CheckoutCartState>(() => ({
    passes: selectedPasses,
    housing,
    merch,
    patron,
    promoCode,
    promoCodeValid,
    promoCodeDiscount,
    insurance,
    insurancePrice: insuranceAmount,
    insurancePotentialPrice: insurancePotentialAmount,
  }), [selectedPasses, housing, merch, patron, promoCode, promoCodeValid, promoCodeDiscount, insurance, insuranceAmount, insurancePotentialAmount]);

  // Persist checkout cart to localStorage whenever non-pass items change
  // Guarded: only save after restoration to avoid overwriting saved data with empty state
  useEffect(() => {
    if (!cityId || !citizenId || !hasRestoredCheckoutRef.current) return;
    const persistedCart: PersistedCheckoutCart = {
      housing: housing
        ? { productId: housing.productId, checkIn: housing.checkIn, checkOut: housing.checkOut }
        : null,
      merch: merch.map(m => ({ productId: m.productId, quantity: m.quantity })),
      patron: patron
        ? { productId: patron.productId, amount: patron.amount, isCustomAmount: patron.isCustomAmount }
        : null,
    };
    saveCheckoutCart(citizenId, cityId, persistedCart);
  }, [housing, merch, patron, cityId, citizenId]);

  // Calculate summary
  // Note: Insurance is calculated on original prices (before discounts) and added AFTER discounts
  const summary = useMemo<CheckoutCartSummary>(() => {
    const passesSubtotal = selectedPasses.reduce((sum, p) => sum + p.price, 0);
    // Track original prices to calculate discount when promo code reduces prices
    const passesOriginalSubtotal = selectedPasses.reduce((sum, p) => sum + (p.originalPrice ?? p.price), 0);
    const housingSubtotal = housing?.totalPrice ?? 0;
    const merchSubtotal = merch.reduce((sum, m) => sum + m.totalPrice, 0);
    const patronSubtotal = patron?.amount ?? 0;
    // Insurance is calculated on full prices and added after discounts
    const insuranceSubtotal = insuranceAmount;

    // Subtotal is the discounted amount (what customer pays before credits) + insurance
    const subtotal = passesSubtotal + housingSubtotal + merchSubtotal + patronSubtotal + insuranceSubtotal;
    // Original subtotal is before any promo discounts (but includes insurance since it doesn't get discounted)
    const originalSubtotal = passesOriginalSubtotal + housingSubtotal + merchSubtotal + patronSubtotal + insuranceSubtotal;
    // Discount is the difference between original and discounted prices
    const discount = originalSubtotal - subtotal;
    const accountCredit = application?.credit ?? 0;
    const credit = isEditing
      ? editCredit + accountCredit
      : accountCredit + monthUpgradeCredit;
    const grandTotal = Math.max(0, subtotal - credit);

    const itemCount = selectedPasses.length + (housing ? 1 : 0) + merch.length + (patron ? 1 : 0);

    return {
      passesSubtotal,
      housingSubtotal,
      merchSubtotal,
      patronSubtotal,
      insuranceSubtotal,
      subtotal: originalSubtotal, // Return original subtotal for display
      discount,
      credit,
      grandTotal,
      itemCount,
    };
  }, [selectedPasses, housing, merch, patron, insuranceAmount, promoCodeValid, promoCodeDiscount, application?.credit, isEditing, editCredit, monthUpgradeCredit]);

  // Navigation
  const goToStep = useCallback((step: CheckoutStep) => {
    setCurrentStep(step);
    setError(null);
  }, []);

  const goToNextStep = useCallback(() => {
    const currentIndex = availableSteps.findIndex(s => s === currentStep);
    if (currentIndex < availableSteps.length - 1) {
      setCurrentStep(availableSteps[currentIndex + 1]);
      setError(null);
    }
  }, [currentStep, availableSteps]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = availableSteps.findIndex(s => s === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(availableSteps[currentIndex - 1]);
      setError(null);
    }
  }, [currentStep, availableSteps]);

  // Pass actions (delegate to passesProvider)
  const togglePass = useCallback((attendeeId: number, productId: number) => {
    const attendee = attendeePasses.find(a => a.id === attendeeId);
    const product = attendee?.products.find(p => p.id === productId);
    if (product) {
      toggleProduct(attendeeId, product);
    }
  }, [attendeePasses, toggleProduct]);

  // Housing actions
  const selectHousing = useCallback((productId: number, checkIn: string, checkOut: string) => {
    const product = housingProducts.find(p => p.id === productId);
    if (!product) return;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    setHousing({
      productId,
      product,
      checkIn,
      checkOut,
      nights,
      pricePerNight: product.price,
      totalPrice: product.price * nights,
    });
  }, [housingProducts]);

  const clearHousing = useCallback(() => {
    setHousing(null);
  }, []);

  // Merch actions
  const updateMerchQuantity = useCallback((productId: number, quantity: number) => {
    const product = merchProducts.find(p => p.id === productId);
    if (!product) return;

    if (quantity <= 0) {
      setMerch(prev => prev.filter(m => m.productId !== productId));
    } else {
      setMerch(prev => {
        const existing = prev.find(m => m.productId === productId);
        if (existing) {
          return prev.map(m =>
            m.productId === productId
              ? { ...m, quantity, totalPrice: product.price * quantity }
              : m
          );
        } else {
          return [...prev, {
            productId,
            product,
            quantity,
            unitPrice: product.price,
            totalPrice: product.price * quantity,
          }];
        }
      });
    }
  }, [merchProducts]);

  // Patron actions
  const setPatronAmount = useCallback((productId: number, amount: number, isCustom = false) => {
    const product = patronProducts.find(p => p.id === productId);
    if (!product) return;

    setPatron({
      productId,
      product,
      amount,
      isCustomAmount: isCustom,
    });
  }, [patronProducts]);

  const clearPatron = useCallback(() => {
    setPatron(null);
  }, []);

  // Promo code validation via API
  const applyPromoCode = useCallback(async (code: string): Promise<boolean> => {
    if (!city?.id) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get(`coupon-codes?code=${code.toUpperCase()}&popup_city_id=${city.id}`);

      if (res.status === 200) {
        const discountValue = res.data.discount_value;

        // Check if this discount is better than current
        if (discountValue >= discountApplied.discount_value) {
          setPromoCode(code.toUpperCase());
          setPromoCodeValid(true);
          setPromoCodeDiscount(discountValue);

          // Also update the passesProvider discount
          setDiscount({
            discount_value: discountValue,
            discount_type: 'percentage',
            discount_code: code.toUpperCase(),
            city_id: city.id,
          });

          return true;
        } else {
          setError('You already have a higher discount than this coupon');
          return false;
        }
      } else {
        setError(res.data?.message || 'Invalid promo code');
        return false;
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to validate promo code');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [city?.id, discountApplied.discount_value, setDiscount]);

  const clearPromoCode = useCallback(() => {
    setPromoCode('');
    setPromoCodeValid(false);
    setPromoCodeDiscount(0);
    clearDiscount();
  }, [clearDiscount]);

  // Insurance
  const toggleInsurance = useCallback(() => {
    setInsurance(prev => !prev);
  }, []);

  // Cart management
  const clearCart = useCallback(() => {
    setHousing(null);
    setMerch([]);
    setPatron(null);
    setPromoCode('');
    setPromoCodeValid(false);
    setPromoCodeDiscount(0);
    setInsurance(false);
    // Clear persisted cart from localStorage
    if (cityId && citizenId) {
      clearCartStorage(citizenId, cityId);
    }
  }, [cityId, citizenId]);

  // Validation helpers
  const canProceedToStepFn = useCallback((step: CheckoutStep): boolean => {
    const targetIndex = availableSteps.findIndex(s => s === step);

    // In edit mode, can proceed only if a new pass is selected
    if (isEditing) {
      return selectedPasses.length > 0;
    }

    // Must have at least one pass to proceed past first step
    if (targetIndex > 0 && selectedPasses.length === 0) {
      return false;
    }

    return true;
  }, [selectedPasses.length, availableSteps, isEditing, attendeePasses]);

  const isStepCompleteFn = useCallback((step: CheckoutStep): boolean => {
    switch (step) {
      case 'passes':
        return selectedPasses.length > 0;
      case 'housing':
      case 'merch':
      case 'patron':
        return true; // Optional steps
      case 'confirm':
        return false; // Never "complete" until payment
      default:
        return false;
    }
  }, [selectedPasses.length]);

  // Submit payment via API
  const submitPayment = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!application?.id) {
      return { success: false, error: 'Application not available' };
    }

    // Both normal and edit mode require at least one new pass selected
    if (selectedPasses.length === 0) {
      return { success: false, error: isEditing ? 'Please select a new pass' : 'Please select at least one pass' };
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Build products array
      const productsToSend: Array<{ product_id: number; attendee_id: number; quantity: number; custom_amount?: number }> = [];

      const monthSelectedWithWeekOrDay = attendeePasses.some(a =>
        a.products.some(p => (p.category === 'month' || p.category === 'local month') && p.selected && !p.purchased) &&
        (a.products.some(p => (p.category === 'week' || p.category === 'local week') && p.purchased) ||
         a.products.some(p => p.category.includes('day') && p.purchased))
      );
      const hasPatreonSelected = attendeePasses.some(a =>
        a.products.some(p => p.category === 'patreon' && p.selected)
      );
      const isMonthUpgrade = monthSelectedWithWeekOrDay && !hasPatreonSelected;

      if (isEditing) {
        // Edit mode: send only the final products the user wants to keep
        attendeePasses.forEach(attendee => {
          attendee.products.forEach(product => {
            // Kept: purchased and NOT given up for credit
            if (product.purchased && !product.edit) {
              productsToSend.push({
                product_id: product.id,
                attendee_id: attendee.id,
                quantity: product.quantity ?? 1,
              });
            }
            // New: selected and not previously purchased
            if (product.selected && !product.purchased) {
              productsToSend.push({
                product_id: product.id,
                attendee_id: attendee.id,
                quantity: product.category.includes('day')
                  ? (product.quantity ?? 1) - (product.original_quantity ?? 0)
                  : product.quantity ?? 1,
              });
            }
          });
        });
      } else {
        const hasAccountCredit = (application?.credit ?? 0) > 0;

        if (hasAccountCredit) {
          attendeePasses.forEach(attendee => {
            attendee.products.forEach(product => {
              if (product.purchased) {
                productsToSend.push({
                  product_id: product.id,
                  attendee_id: attendee.id,
                  quantity: product.quantity ?? 1,
                });
              }
            });
          });
        }

        // Normal mode: add selected passes
        selectedPasses.forEach((pass) => {
          productsToSend.push({
            product_id: pass.productId,
            attendee_id: pass.attendeeId,
            quantity: pass.quantity,
          });
        });

        // Add merch
        merch.forEach((item) => {
          const firstAttendeeId = selectedPasses[0]?.attendeeId || 0;
          productsToSend.push({
            product_id: item.productId,
            attendee_id: firstAttendeeId,
            quantity: item.quantity,
          });
        });

        // Add housing
        if (housing) {
          const firstAttendeeId = selectedPasses[0]?.attendeeId || 0;
          productsToSend.push({
            product_id: housing.productId,
            attendee_id: firstAttendeeId,
            quantity: housing.nights,
          });
        }

        // Add patron — only include custom_amount for variable-price products
        if (patron) {
          const firstAttendeeId = selectedPasses[0]?.attendeeId || 0;
          const isVariable = patron.product.min_price !== null && patron.product.min_price !== undefined;
          productsToSend.push({
            product_id: patron.productId,
            attendee_id: firstAttendeeId,
            quantity: 1,
            ...(isVariable ? { custom_amount: patron.amount } : {}),
          });
        }
      }

      const requestData: Record<string, unknown> = {
        application_id: application.id,
        products: productsToSend,
        coupon_code: promoCodeValid ? promoCode : undefined,
        insurance: insurance || undefined,
        ...((isEditing || (application?.credit ?? 0) > 0 || isMonthUpgrade) ? { edit_passes: true } : {}),
      };

      const res = await api.post('payments', requestData);

      if (res.status === 200) {
        const data = res.data;

        if (data.status === 'pending' && data.checkout_url) {
          // Do NOT clear cart here — payment is not confirmed yet.
          // Cart will be cleared when user returns with ?checkout=success
          // Redirect to payment provider with success parameter for return
          // Keep loading state active during redirect
          
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('checkout', 'success');
          const redirectUrl = currentUrl.toString();
          window.location.href = `${data.checkout_url}?redirect_url=${encodeURIComponent(redirectUrl)}`;
          return { success: true };
        } else if (data.status === 'approved') {
          toast.success(isEditing ? 'Your passes have been updated successfully!' : 'Payment completed successfully!');
          if (isEditing) {
            toggleEditing(false);
          }
          clearCart();
          clearSelections();
          setCurrentStep('success');
          setIsSubmitting(false);
          return { success: true };
        }

        setIsSubmitting(false);
        return { success: true };
      } else {
        const errorMsg = res.data?.message || 'Failed to create payment';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Failed to create payment';
      setError(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
      return { success: false, error: errorMsg };
    }
  }, [application?.id, selectedPasses, merch, housing, patron, promoCodeValid, promoCode, insurance, clearCart, clearSelections, isEditing, attendeePasses, editCredit, toggleEditing]);

  const value: CheckoutContextValue = {
    currentStep,
    availableSteps,
    cart,
    summary,
    passProducts,
    housingProducts,
    merchProducts,
    patronProducts,
    attendees: attendeePasses,
    isLoading,
    isSubmitting,
    error,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    togglePass,
    resetDayProduct,
    selectHousing,
    clearHousing,
    updateMerchQuantity,
    setPatronAmount,
    clearPatron,
    applyPromoCode,
    clearPromoCode,
    toggleInsurance,
    clearCart,
    canProceedToStep: canProceedToStepFn,
    isStepComplete: isStepCompleteFn,
    submitPayment,
    isEditing,
    toggleEditing,
    editCredit,
    monthUpgradeCredit,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout(): CheckoutContextValue {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
