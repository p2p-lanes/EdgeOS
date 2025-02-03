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
class MonthlyPriceStrategy implements PriceCalculationStrategy {
  calculate(products: ProductsPass[], discount: DiscountProps): TotalResult {
    const monthProduct = products.find(p => p.category === 'month' && p.selected);
    const nonDiscountableTotal = this.calculateNonDiscountableTotal(products);
    
    const monthPrice = monthProduct?.price ?? 0;
    const discountAmount = discount.discount_value 
      ? monthPrice * (discount.discount_value / 100)
      : 0;
    
    const monthAmount = monthPrice - discountAmount;

    return {
      total: monthAmount + nonDiscountableTotal,
      originalTotal: this.calculateOriginalTotal(products),
      discountAmount: discountAmount
    };
  }

  private calculateNonDiscountableTotal(products: ProductsPass[]): number {
    return products
      .filter(p => p.selected && !['week', 'month'].includes(p.category))
      .reduce((sum, product) => sum + (product.price ?? 0), 0);
  }

  private calculateOriginalTotal(products: ProductsPass[]): number {
    return products
      .filter(p => p.selected)
      .reduce((sum, product) => sum + (product.compare_price ?? 0), 0);
  }
}

class WeeklyPriceStrategy implements PriceCalculationStrategy {
  calculate(products: ProductsPass[], discount: DiscountProps): TotalResult {
    const weekProducts = products.filter(p => p.category === 'week' && p.selected);
    const nonDiscountableTotal = this.calculateNonDiscountableTotal(products);
    
    const discountableTotal = weekProducts.reduce((sum, product) => sum + (product.price ?? 0), 0);
    const discountAmount = discount.discount_value 
      ? discountableTotal * (discount.discount_value / 100)
      : 0;
    
    const discountedAmount = discountableTotal - discountAmount;

    return {
      total: discountedAmount + nonDiscountableTotal,
      originalTotal: this.calculateOriginalTotal(products),
      discountAmount: discountAmount
    };
  }

  private calculateNonDiscountableTotal(products: ProductsPass[]): number {
    return products
      .filter(p => p.selected && !['week', 'month'].includes(p.category))
      .reduce((sum, product) => sum + (product.price ?? 0), 0);
  }

  private calculateOriginalTotal(products: ProductsPass[]): number {
    return products
      .filter(p => p.selected)
      .reduce((sum, product) => sum + (product.compare_price ?? 0), 0);
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
    const hasMonthly = products.some(p => p.category === 'month' && p.selected);
    return hasMonthly ? new MonthlyPriceStrategy() : new WeeklyPriceStrategy();
  }
}

// Funciones exportadas
export const calculateTotal = (attendees: AttendeeProps[], discount: DiscountProps): TotalResult => {
  const calculator = new TotalCalculator();
  return calculator.calculate(attendees, discount);
}