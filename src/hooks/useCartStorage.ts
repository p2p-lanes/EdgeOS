// Cart persistence utilities using localStorage
// Storage keys are scoped by userId (citizen_id) + cityId to prevent cross-account conflicts

export interface PersistedPassSelection {
  attendeeId: number;
  productId: number;
  quantity?: number;
  custom_amount?: number;
}

export interface PersistedCheckoutCart {
  housing: { productId: number; checkIn: string; checkOut: string } | null;
  merch: Array<{ productId: number; quantity: number }>;
  patron?: { productId: number; amount: number; isCustomAmount: boolean } | null;
}

const PASSES_STORAGE_KEY = 'cart_passes';
const CHECKOUT_STORAGE_KEY = 'cart_checkout';

const buildKey = (base: string, userId: string, cityId: string | number): string =>
  `${base}_${userId}_${cityId}`;

// --- Pass Selections ---

export const savePassSelections = (
  userId: string,
  cityId: string | number,
  selections: PersistedPassSelection[]
): void => {
  try {
    const key = buildKey(PASSES_STORAGE_KEY, userId, cityId);
    localStorage.setItem(key, JSON.stringify(selections));
  } catch {
    // Silently fail if localStorage is unavailable
  }
};

export const loadPassSelections = (
  userId: string,
  cityId: string | number
): PersistedPassSelection[] => {
  try {
    const key = buildKey(PASSES_STORAGE_KEY, userId, cityId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as PersistedPassSelection[];
  } catch {
    return [];
  }
};

// --- Checkout Cart (housing, merch, patron) ---

export const saveCheckoutCart = (
  userId: string,
  cityId: string | number,
  cart: PersistedCheckoutCart
): void => {
  try {
    const key = buildKey(CHECKOUT_STORAGE_KEY, userId, cityId);
    localStorage.setItem(key, JSON.stringify(cart));
  } catch {
    // Silently fail if localStorage is unavailable
  }
};

export const loadCheckoutCart = (
  userId: string,
  cityId: string | number
): PersistedCheckoutCart | null => {
  try {
    const key = buildKey(CHECKOUT_STORAGE_KEY, userId, cityId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedCheckoutCart;
  } catch {
    return null;
  }
};

// --- Clear All Cart Storage ---

export const clearCartStorage = (userId: string, cityId: string | number): void => {
  try {
    localStorage.removeItem(buildKey(PASSES_STORAGE_KEY, userId, cityId));
    localStorage.removeItem(buildKey(CHECKOUT_STORAGE_KEY, userId, cityId));
  } catch {
    // Silently fail if localStorage is unavailable
  }
};

export const clearPassSelectionsStorage = (userId: string, cityId: string | number): void => {
  try {
    localStorage.removeItem(buildKey(PASSES_STORAGE_KEY, userId, cityId));
  } catch {
    // Silently fail
  }
};

export const clearCheckoutCartStorage = (userId: string, cityId: string | number): void => {
  try {
    localStorage.removeItem(buildKey(CHECKOUT_STORAGE_KEY, userId, cityId));
  } catch {
    // Silently fail
  }
};

// --- Purchase Pending Flag ---
// Set before redirect to payment provider; consumed on next page load to skip cart restoration

const PURCHASE_PENDING_KEY = 'cart_purchase_pending';

export const markPurchasePending = (): void => {
  try { localStorage.setItem(PURCHASE_PENDING_KEY, 'true'); } catch { /* noop */ }
};

export const checkAndClearPurchasePending = (): boolean => {
  try {
    const pending = localStorage.getItem(PURCHASE_PENDING_KEY) === 'true';
    if (pending) localStorage.removeItem(PURCHASE_PENDING_KEY);
    return pending;
  } catch { return false; }
};

export const clearAllUserCartStorage = (userId: string): void => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(`${PASSES_STORAGE_KEY}_${userId}_`) || key.startsWith(`${CHECKOUT_STORAGE_KEY}_${userId}_`))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch {
    // Silently fail if localStorage is unavailable
  }
};
