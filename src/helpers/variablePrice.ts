import { ProductsPass, ProductsProps } from "@/types/Products";

/**
 * Variable Price Utilities
 * 
 * A product is variable-price when min_price is set (not null).
 * Users can choose how much to pay within defined bounds.
 */

export interface VariablePriceConfig {
  minPrice: number;
  maxPrice: number | null;
  suggestedPrice: number;
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Checks if a product supports variable pricing
 */
export const isVariablePrice = (product: ProductsProps | ProductsPass): boolean => {
  return product.min_price !== null && product.min_price !== undefined;
};

/**
 * Gets the variable price configuration for a product
 */
export const getVariablePriceConfig = (product: ProductsProps | ProductsPass): VariablePriceConfig | null => {
  if (!isVariablePrice(product)) return null;
  
  return {
    minPrice: product.min_price!,
    maxPrice: product.max_price,
    suggestedPrice: product.price,
  };
};

/**
 * Validates a custom amount against product constraints
 */
export const validateCustomAmount = (
  product: ProductsProps | ProductsPass,
  amount: number | undefined
): ValidationResult => {
  if (!isVariablePrice(product)) {
    return { isValid: true, error: null };
  }

  if (amount === undefined || amount === null) {
    return { 
      isValid: false, 
      error: `Amount is required for ${product.name}` 
    };
  }

  const minPrice = product.min_price!;
  
  if (amount < minPrice) {
    return { 
      isValid: false, 
      error: `Amount must be at least $${minPrice.toLocaleString()}` 
    };
  }

  if (product.max_price !== null && amount > product.max_price) {
    return { 
      isValid: false, 
      error: `Amount must be at most $${product.max_price.toLocaleString()}` 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Gets the effective price for a product (custom_amount for variable, price for fixed)
 */
export const getEffectivePrice = (product: ProductsPass): number => {
  if (isVariablePrice(product) && product.custom_amount !== undefined) {
    return product.custom_amount;
  }
  return product.price;
};

/**
 * Checks if a variable-price product has a valid custom amount set
 */
export const hasValidCustomAmount = (product: ProductsPass): boolean => {
  if (!isVariablePrice(product)) return true;
  
  const validation = validateCustomAmount(product, product.custom_amount);
  return validation.isValid;
};

/**
 * Calculates the total variable amount from a list of products
 */
export const calculateVariableAmount = (products: ProductsPass[]): number => {
  return products
    .filter(p => p.selected && isVariablePrice(p) && p.custom_amount !== undefined)
    .reduce((sum, p) => sum + (p.custom_amount! * (p.quantity ?? 1)), 0);
};
