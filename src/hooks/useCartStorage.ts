// Cart persistence utilities using localStorage
// Storage keys are scoped by a unique identifier (e.g. city ID) to prevent conflicts between events

export interface PersistedPassSelection {
  attendeeId: number;
  productId: number;
  quantity?: number;
  custom_amount?: number;
}

export interface PersistedCheckoutCart {
  housing: { productId: number; checkIn: string; checkOut: string } | null;
  merch: Array<{ productId: number; quantity: number }>;
  patron: { productId: number; amount: number; isCustomAmount: boolean } | null;
  insurance: boolean;
}

const PASSES_STORAGE_KEY = 'cart_passes';
const CHECKOUT_STORAGE_KEY = 'cart_checkout';

const buildKey = (base: string, scopeId: string | number): string =>
  `${base}_${scopeId}`;

// --- Pass Selections ---

export const savePassSelections = (
  scopeId: string | number,
  selections: PersistedPassSelection[]
): void => {
  try {
    const key = buildKey(PASSES_STORAGE_KEY, scopeId);
    localStorage.setItem(key, JSON.stringify(selections));
  } catch {
    // Silently fail if localStorage is unavailable
  }
};

export const loadPassSelections = (
  scopeId: string | number
): PersistedPassSelection[] => {
  try {
    const key = buildKey(PASSES_STORAGE_KEY, scopeId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as PersistedPassSelection[];
  } catch {
    return [];
  }
};

// --- Checkout Cart (housing, merch, patron, insurance) ---

export const saveCheckoutCart = (
  scopeId: string | number,
  cart: PersistedCheckoutCart
): void => {
  try {
    const key = buildKey(CHECKOUT_STORAGE_KEY, scopeId);
    localStorage.setItem(key, JSON.stringify(cart));
  } catch {
    // Silently fail if localStorage is unavailable
  }
};

export const loadCheckoutCart = (
  scopeId: string | number
): PersistedCheckoutCart | null => {
  try {
    const key = buildKey(CHECKOUT_STORAGE_KEY, scopeId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedCheckoutCart;
  } catch {
    return null;
  }
};

// --- Clear All Cart Storage ---

export const clearCartStorage = (scopeId: string | number): void => {
  try {
    localStorage.removeItem(buildKey(PASSES_STORAGE_KEY, scopeId));
    localStorage.removeItem(buildKey(CHECKOUT_STORAGE_KEY, scopeId));
  } catch {
    // Silently fail if localStorage is unavailable
  }
};

export const clearPassSelectionsStorage = (scopeId: string | number): void => {
  try {
    localStorage.removeItem(buildKey(PASSES_STORAGE_KEY, scopeId));
  } catch {
    // Silently fail
  }
};

export const clearCheckoutCartStorage = (scopeId: string | number): void => {
  try {
    localStorage.removeItem(buildKey(CHECKOUT_STORAGE_KEY, scopeId));
  } catch {
    // Silently fail
  }
};
