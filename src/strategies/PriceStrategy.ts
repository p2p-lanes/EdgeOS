import { DiscountProps } from "@/types/discounts";
import { ProductsPass } from "@/types/Products";

export interface PriceStrategy {
  calculatePrice(product: ProductsPass, hasPatreonPurchased: boolean, discount: DiscountProps): number;
  getBestDiscount(price: number, applicationDiscount: number, currentDiscount: DiscountProps): DiscountProps;
}

class DefaultPriceStrategy implements PriceStrategy {
  calculatePrice(product: ProductsPass, hasPatreonPurchased: boolean, discount: DiscountProps): number {
    const isSpecialProduct = product.category === 'patreon' || product.category === 'supporter';
    const originalPrice = product.original_price || product.price || 0;

    if (!isSpecialProduct && hasPatreonPurchased) {
      return 0;
    }

    if (product.category !== 'patreon' && product.category !== 'supporter') {
      if (discount.discount_type === 'percentage') {
        return originalPrice * (1 - discount.discount_value / 100);
      } else if (discount.discount_type === 'fixed') {
        return Math.max(0, originalPrice - discount.discount_value);
      }
    }

    return originalPrice;
  }

  getBestDiscount(price: number, applicationDiscount: number, currentDiscount: DiscountProps): DiscountProps {
    if (currentDiscount.discount_type === 'percentage') {
      return currentDiscount.discount_value > applicationDiscount
        ? currentDiscount
        : { discount_value: applicationDiscount, discount_type: 'percentage' };
    }

    const fixedDiscountPercentage = (currentDiscount.discount_value / price) * 100;
    return fixedDiscountPercentage > applicationDiscount
      ? currentDiscount
      : { discount_value: applicationDiscount, discount_type: 'percentage' };
  }
}

export const getPriceStrategy = (): PriceStrategy => {
  return new DefaultPriceStrategy();
}; 