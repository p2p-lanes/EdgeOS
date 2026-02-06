import { useState, useCallback } from 'react';
import { api } from '@/api';
import { useCityProvider } from '@/providers/cityProvider';
import { useApplication } from '@/providers/applicationProvider';
import { toast } from 'sonner';
import {
  PaymentPreviewRequest,
  PaymentPreviewResponse,
  PaymentCreateRequest,
  PaymentCreateResponse,
  SelectedPassItem,
  SelectedMerchItem,
  SelectedHousingItem,
  SelectedPatronItem,
} from '@/types/checkout';

interface CheckoutApiResult {
  validatePromoCode: (code: string) => Promise<{ valid: boolean; discount: number; message: string }>;
  previewPayment: (
    passes: SelectedPassItem[],
    merch: SelectedMerchItem[],
    housing: SelectedHousingItem | null,
    patron: SelectedPatronItem | null,
    promoCode?: string
  ) => Promise<PaymentPreviewResponse | null>;
  createPayment: (
    passes: SelectedPassItem[],
    merch: SelectedMerchItem[],
    housing: SelectedHousingItem | null,
    patron: SelectedPatronItem | null,
    promoCode?: string,
    amount?: number
  ) => Promise<PaymentCreateResponse | null>;
  loading: boolean;
  error: string | null;
}

const useCheckoutApi = (): CheckoutApiResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCity } = useCityProvider();
  const { getRelevantApplication } = useApplication();
  const city = getCity();
  const application = getRelevantApplication();

  // Validate promo code
  const validatePromoCode = useCallback(
    async (code: string): Promise<{ valid: boolean; discount: number; message: string }> => {
      if (!city?.id) {
        return { valid: false, discount: 0, message: 'City not available' };
      }

      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`coupon-codes?code=${code.toUpperCase()}&popup_city_id=${city.id}`);

        if (res.status === 200) {
          return {
            valid: true,
            discount: res.data.discount_value,
            message: res.data.message || 'Coupon applied successfully',
          };
        } else {
          return {
            valid: false,
            discount: 0,
            message: res.data.message || 'Invalid coupon code',
          };
        }
      } catch (err: any) {
        const message = err?.response?.data?.detail || 'Failed to validate coupon';
        return { valid: false, discount: 0, message };
      } finally {
        setLoading(false);
      }
    },
    [city?.id]
  );

  // Build products array from cart items
  const buildProductsArray = (
    passes: SelectedPassItem[],
    merch: SelectedMerchItem[],
    housing: SelectedHousingItem | null,
    patron: SelectedPatronItem | null
  ) => {
    const products: Array<{ product_id: number; attendee_id: number; quantity: number; custom_amount?: number }> = [];

    // Add passes
    passes.forEach((pass) => {
      products.push({
        product_id: pass.productId,
        attendee_id: pass.attendeeId,
        quantity: pass.quantity,
      });
    });

    // Add merch (use first attendee for merch)
    merch.forEach((item) => {
      const firstAttendeeId = passes[0]?.attendeeId || 0;
      products.push({
        product_id: item.productId,
        attendee_id: firstAttendeeId,
        quantity: item.quantity,
      });
    });

    // Add housing
    if (housing) {
      const firstAttendeeId = passes[0]?.attendeeId || 0;
      products.push({
        product_id: housing.productId,
        attendee_id: firstAttendeeId,
        quantity: housing.nights,
      });
    }

    // Add patron — only include custom_amount for variable-price products
    if (patron) {
      const firstAttendeeId = passes[0]?.attendeeId || 0;
      const isVariable = patron.product.min_price !== null && patron.product.min_price !== undefined;
      products.push({
        product_id: patron.productId,
        attendee_id: firstAttendeeId,
        quantity: 1,
        ...(isVariable ? { custom_amount: patron.amount } : {}),
      });
    }

    return products;
  };

  // Preview payment (get totals with discounts)
  const previewPayment = useCallback(
    async (
      passes: SelectedPassItem[],
      merch: SelectedMerchItem[],
      housing: SelectedHousingItem | null,
      patron: SelectedPatronItem | null,
      promoCode?: string
    ): Promise<PaymentPreviewResponse | null> => {
      if (!application?.id) {
        setError('Application not available');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const products = buildProductsArray(passes, merch, housing, patron);

        const requestData: PaymentPreviewRequest = {
          application_id: application.id,
          products,
          ...(promoCode ? { coupon_code: promoCode } : {}),
        };

        const res = await api.post('payments/preview', requestData);

        if (res.status === 200) {
          return res.data;
        } else {
          setError(res.data?.message || 'Failed to preview payment');
          return null;
        }
      } catch (err: any) {
        const message = err?.response?.data?.detail || 'Failed to preview payment';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [application?.id]
  );

  // Create payment
  const createPayment = useCallback(
    async (
      passes: SelectedPassItem[],
      merch: SelectedMerchItem[],
      housing: SelectedHousingItem | null,
      patron: SelectedPatronItem | null,
      promoCode?: string,
      amount?: number
    ): Promise<PaymentCreateResponse | null> => {
      if (!application?.id) {
        setError('Application not available');
        toast.error('Application not available');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const products = buildProductsArray(passes, merch, housing, patron);

        const requestData: PaymentCreateRequest = {
          application_id: application.id,
          products,
          amount: amount || 0,
          ...(promoCode ? { coupon_code: promoCode } : {}),
        };

        const res = await api.post('payments', requestData);

        if (res.status === 200) {
          const data = res.data as PaymentCreateResponse;

          if (data.status === 'pending' && data.checkout_url) {
            // Redirect to payment provider
            const redirectUrl = window.location.href;
            window.location.href = `${data.checkout_url}?redirect_url=${redirectUrl}`;
          } else if (data.status === 'approved') {
            toast.success('Payment completed successfully!');
          }

          return data;
        } else {
          const message = res.data?.message || 'Failed to create payment';
          setError(message);
          toast.error(message);
          return null;
        }
      } catch (err: any) {
        const message = err?.response?.data?.detail || 'Failed to create payment';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [application?.id]
  );

  return {
    validatePromoCode,
    previewPayment,
    createPayment,
    loading,
    error,
  };
};

export default useCheckoutApi;
