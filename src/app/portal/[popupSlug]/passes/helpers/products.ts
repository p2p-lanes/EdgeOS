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
    return products
      .filter(p => p.selected)
      .reduce((sum, product) => sum + (product.compare_price ?? product.original_price ?? 0), 0);
  }

  abstract calculate(products: ProductsPass[], discount: DiscountProps): TotalResult;
}

class MonthlyPriceStrategy extends BasePriceStrategy {
  calculate(products: ProductsPass[], discount: DiscountProps): TotalResult {
    const monthProduct = products.find(p => p.category === 'month' && p.selected);
    
    const monthPrice = monthProduct?.price ?? 0;
    const originalTotal = this.calculateOriginalTotal(products)
    const discountAmount = discount.discount_value ? originalTotal * (discount.discount_value / 100): 0;

    return {
      total: monthPrice,
      originalTotal: originalTotal,
      discountAmount: discountAmount
    };
  }

  protected calculateOriginalTotal(products: ProductsPass[]): number {
    return products
      .filter(p => p.selected && p.category === 'week')
      .reduce((sum, product) => sum + (product.compare_price ?? 0), 0);
  }
}

class WeeklyPriceStrategy extends BasePriceStrategy {
  calculate(products: ProductsPass[], discount: DiscountProps): TotalResult {
    const weekProducts = products.filter(p => p.category === 'week' && p.selected);
    
    const discountableTotal = weekProducts.reduce((sum, product) => sum + (product.price ?? 0), 0);
    const originalTotal = this.calculateOriginalTotal(products)
    const discountAmount = discount.discount_value ? originalTotal * (discount.discount_value / 100): 0;

    return {
      total: discountableTotal,
      originalTotal: originalTotal,
      discountAmount: discountAmount
    };
  }
}

class PatreonPriceStrategy extends BasePriceStrategy {
  calculate(products: ProductsPass[], discount: DiscountProps): TotalResult {
    const patreonProduct = products.find(p => (p.category === 'patreon' || p.category === 'supporter') && p.selected);
    const productsSelected = products.filter(p => p.selected && p.category !== 'patreon' && p.category !== 'supporter')
    const patreonPrice = patreonProduct?.price ?? 0;
    const originalTotal = this.calculateOriginalTotal(products)
    const discountAmount = productsSelected.reduce((sum, product) => sum + (product.original_price ?? 0), 0)

    return {
      total: patreonPrice,
      originalTotal: originalTotal,
      discountAmount: discountAmount
    };
  }
}

// Calculadora de totales
class TotalCalculator {
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

    if(hasPatreon) return new PatreonPriceStrategy()
    if(hasMonthly) return new MonthlyPriceStrategy()
    return new WeeklyPriceStrategy()
  }
}

// Funciones exportadas
export const calculateTotal = (attendees: AttendeeProps[], discount: DiscountProps): TotalResult => {
  const calculator = new TotalCalculator();
  return calculator.calculate(attendees, discount);
}