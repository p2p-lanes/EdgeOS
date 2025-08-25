import { ProductsPass } from '@/types/Products';

interface PurchaseStrategy {
  applyPurchaseRules: (products: ProductsPass[], attendeeProducts: ProductsPass[]) => ProductsPass[];
}

class DefaultPurchaseStrategy implements PurchaseStrategy {
  applyPurchaseRules(products: ProductsPass[], attendeeProducts: ProductsPass[]): ProductsPass[] {
    const hasMonthlyPass = attendeeProducts?.some(p => p.category === 'month' || p.category === 'month local');
    
    return products.map(product => ({
      ...product,
      purchased: attendeeProducts?.some(p => p.id === product.id) || 
                (hasMonthlyPass && (product.category === 'week' || product.category === 'local week'))
    }));
  }
}

export const getPurchaseStrategy = (): PurchaseStrategy => {
  return new DefaultPurchaseStrategy();
}; 