import { AttendeeProps } from "@/types/Attendee";
import { DiscountProps } from "@/types/discounts";
import { ProductsPass } from "@/types/Products";

interface TotalResult {
  total: number;
  originalTotal: number;
  discountAmount: number;
}
interface PriceCalculationStrategy {
  calculate(products: ProductsPass[], discount: DiscountProps): TotalResult;
}

abstract class BasePriceStrategy implements PriceCalculationStrategy {
  protected calculateOriginalTotal(products: ProductsPass[]): number {
    return products.filter(p => p.selected).reduce((sum, product) => {
      const price = product.original_price ?? 0;
      
      if (product.purchased) {
        // Para productos comprados, solo contamos la diferencia adicional
        const diff = ((product.quantity || 1) - (product.original_quantity || 1));
        return diff > 0 ? sum + (price * diff) : sum;
      }
      
      // Para productos no comprados, contamos el precio total
      return sum + (price * (product.quantity || 1));
    }, 0);
  }

  abstract calculate(products: ProductsPass[], discount: DiscountProps): TotalResult;
}

class MonthlyPriceStrategy extends BasePriceStrategy {
  calculate(products: ProductsPass[], discount: DiscountProps): TotalResult {
    const hasPatreon = products.some(p => (p.category === 'patreon' || p.category === 'supporter') && p.selected);
    const monthProduct = products.find(p => p.category === 'month' && p.selected && !p.purchased);
    const monthPrice = (monthProduct?.price ?? 0) * (monthProduct?.quantity ?? 1);
    const totalProductsPurchased = products.filter(p => p.category !== 'patreon' && p.category !== 'supporter').reduce((sum, product) => sum + (product.purchased ? product.price * (product.quantity ?? 1) : 0), 0)

    const originalTotal = this.calculateOriginalTotal(products)
    const discountAmount = discount.discount_value ? originalTotal * (discount.discount_value / 100): 0;

    console.log('discountAmount', discountAmount, discount, originalTotal)
    return {
      total: monthPrice - (hasPatreon && monthProduct?.attendee_category !== 'main' ? 0 : totalProductsPurchased),
      originalTotal: originalTotal,
      discountAmount: discountAmount
    };
  }

  protected calculateOriginalTotal(products: ProductsPass[]): number {
    return products
      .find(p => p.selected && p.category === 'month')?.original_price ?? 0
  }
}

class WeeklyPriceStrategy extends BasePriceStrategy {
  calculate(products: ProductsPass[], discount: DiscountProps): TotalResult {
    const weekSelectedProducts = products.filter(p => (p.category === 'week' || p.category === 'day') && p.selected);
    
    const totalSelected = weekSelectedProducts.reduce((sum, product) => {
      if (product.purchased && product.category !== 'day') {
        return sum - ((product.price ?? 0) * (product.quantity || 1));
      }
      
      if (product.category === 'day') {
        if (product.purchased) {
          const diff = ((product.quantity || 1) - (product.original_quantity || 1));
          return diff > 0 ? sum + ((product.price ?? 0) * diff) : sum;
        } 
        return sum + ((product.price ?? 0) * (product.quantity || 1));
      }
      
      return sum + ((product.price ?? 0) * (product.quantity || 1));
    }, 0);
    
    const originalTotal = this.calculateOriginalTotal(products)
    const discountAmount = discount.discount_value ? originalTotal * (discount.discount_value / 100): 0;

    return {
      total: totalSelected,
      originalTotal: originalTotal,
      discountAmount: discountAmount
    };
  }
}

class PatreonPriceStrategy extends BasePriceStrategy {
  calculate(products: ProductsPass[], _discount: DiscountProps): TotalResult {
    const patreonProduct = products.find(p => (p.category === 'patreon' || p.category === 'supporter') && p.selected);
    const productsSelected = products.filter(p => p.selected && !p.purchased && p.category !== 'patreon' && p.category !== 'supporter')
    const patreonPrice = (patreonProduct?.price ?? 0) * (patreonProduct?.quantity ?? 1);
    const originalTotal = this.calculateOriginalTotal(products)
    const discountAmount = productsSelected.reduce((sum, product) => sum + ((product.original_price ?? 0) * (product.quantity ?? 1)), 0)

    return {
      total: patreonPrice,
      originalTotal: originalTotal,
      discountAmount: discountAmount
    };
  }
}

class MonthlyPurchasedPriceStrategy extends BasePriceStrategy {
  calculate(products: ProductsPass[], _discount: DiscountProps): TotalResult {
    const someSelectedWeek = products.some(p => p.selected && p.category === 'week')

    if(!someSelectedWeek) {
      return {
        total: 0,
        originalTotal: 0,
        discountAmount: 0
      };
    }

    const monthProductPurchased = products.find(p => p.category === 'month' && p.purchased);
    const weekProductsPurchased = products.filter(p => p.category === 'week' && p.purchased && !p.selected)

    const totalWeekPurchased = weekProductsPurchased.reduce((sum, product) => sum + (product.price * (product.quantity ?? 1)), 0)

    const originalTotal = this.calculateOriginalTotal(products)

    
    return {
      total: totalWeekPurchased - ((monthProductPurchased?.price ?? 0) * (monthProductPurchased?.quantity ?? 1)),
      originalTotal: originalTotal,
      discountAmount: 0
    };
  }
}

class DayPriceStrategy extends BasePriceStrategy {
  calculate(products: ProductsPass[], discount: DiscountProps): TotalResult {
     const daySelectedProducts = products.filter(p => (p.category === 'day') && p.selected);
    
    const totalSelected = daySelectedProducts.reduce((sum, product) => {
      if (product.purchased) {
        return sum - ((product.price ?? 0) * (product.quantity ?? 1));
      }
      return sum + ((product.price ?? 0) * (product.quantity ?? 1));
    }, 0);
    
    const originalTotal = this.calculateOriginalTotal(products)
    const discountAmount = discount.discount_value ? originalTotal * (discount.discount_value / 100): 0;

    return {
      total: totalSelected,
      originalTotal: originalTotal,
      discountAmount: discountAmount
    };
  }
}


// Calculadora de totales
export class TotalCalculator {
  calculate(attendees: AttendeeProps[], discount: DiscountProps): TotalResult {
    return attendees.reduce((total, attendee) => {
      const strategy = this.getStrategy(attendee.products);
      const result = strategy.calculate(attendee.products, discount);
      
      return {
        total: total.total + result.total,
        originalTotal: total.originalTotal + result.originalTotal,
        discountAmount: total.discountAmount + result.discountAmount
      };
    }, { total: 0, originalTotal: 0, discountAmount: 0 });
  }

  private getStrategy(products: ProductsPass[]): PriceCalculationStrategy {
    const hasPatreon = products.some(p => (p.category === 'patreon' || p.category === 'supporter') && p.selected);
    const hasMonthly = products.some(p => p.category === 'month' && p.selected);
    const hasMonthPurchased = products.some(p => p.category === 'month' && p.purchased);

    if(hasPatreon) return new PatreonPriceStrategy()
    if(hasMonthly) return new MonthlyPriceStrategy()
    if(hasMonthPurchased) return new MonthlyPurchasedPriceStrategy()
    return new WeeklyPriceStrategy()
  }
}
