import { ProductsPass } from "@/types/Products";

interface PriceStrategy {
  calculatePrice(product: ProductsPass, hasPatreonPurchased: boolean, discount: number): number;
}

class DefaultPriceStrategy implements PriceStrategy {
  calculatePrice(product: ProductsPass, hasPatreonPurchased: boolean, discount: number): number {
    if (hasPatreonPurchased) {
      return 0;
    }
    if (product.category !== 'patreon' && product.category !== 'supporter' && discount > 0) {
      return (product.original_price || 0) * (1 - discount / 100);
    }
    return product.original_price || 0;
  }
}

export const getPriceStrategy = (): PriceStrategy => {
  return new DefaultPriceStrategy();
}; 