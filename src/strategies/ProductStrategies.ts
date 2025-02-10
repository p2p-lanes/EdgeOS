import { AttendeeProps } from '@/types/Attendee';
import { ProductsPass } from '@/types/Products';
import { getPriceStrategy, PriceStrategy } from "@/strategies/PriceStrategy";
import { DiscountProps } from '@/types/discounts';

interface ProductStrategy {
  handleSelection: (
    attendees: AttendeeProps[],
    attendeeId: number,
    product: ProductsPass,
    discount?: DiscountProps
  ) => AttendeeProps[];
}

class ExclusiveProductStrategy implements ProductStrategy {
  handleSelection(attendees: AttendeeProps[], attendeeId: number, product: ProductsPass): AttendeeProps[] {
    return attendees.map(attendee => {
      if (attendee.id !== attendeeId) return attendee;
      
      const willBeSelected = !product?.selected;
      
      return {
        ...attendee,
        products: attendee.products.map(p => ({
          ...p,
          selected: 
            p.id === product.id ? !p.selected :
            (p.exclusive && willBeSelected && product?.exclusive) ? false :
            p.selected,
          disabled: product.exclusive && p.id !== product.id && p.selected
        }))
      };
    });
  }
}

class PatreonProductStrategy implements ProductStrategy {
  private priceStrategy: PriceStrategy;

  constructor() {
    this.priceStrategy = getPriceStrategy();
  }

  handleSelection(attendees: AttendeeProps[], attendeeId: number, product: ProductsPass, discount?: DiscountProps): AttendeeProps[] {
    const isPatreonSelected = !product?.selected;

    return attendees.map(attendee => ({
      ...attendee,
      products: attendee.products.map(p => ({
        ...p,
        selected: (attendee.id === attendeeId && p.id === product.id) ? !p.selected : p.selected,
        // original_price: p.price,
        price: this.priceStrategy.calculatePrice(p, isPatreonSelected || false, discount?.discount_value || 0)
      }))
    }));
  }
}

class MonthProductStrategy implements ProductStrategy {
  handleSelection(attendees: AttendeeProps[], attendeeId: number, product: ProductsPass): AttendeeProps[] {
    const isMonthSelected = product?.selected;

    return attendees.map(attendee => {
      if (attendee.id !== attendeeId) return attendee;
      
      return {
        ...attendee,
        products: attendee.products.map(p => ({
          ...p,
          selected: p.id === product.id ? !p.selected : 
            p.category === 'week' ? !isMonthSelected : p.selected
        }))
      };
    });
  }
}

class WeekProductStrategy implements ProductStrategy {
  handleSelection(attendees: AttendeeProps[], attendeeId: number, product: ProductsPass): AttendeeProps[] {
    const willBeSelected = !product?.selected;

    // Calculamos el número total de semanas que estarán seleccionadas después del cambio
    const selectedWeeksCount = attendees.find(a => a.id === attendeeId)?.products.filter(p => 
      p.category === 'week' && (
        p.id === product.id ? willBeSelected : p.selected
      )
    ).length || 0;

    const willBeSelectMonth = selectedWeeksCount !== 0 && selectedWeeksCount % 4 === 0;

    return attendees.map(attendee => {
      if (attendee.id !== attendeeId) return attendee;
      
      const monthProduct = attendee.products.find(p => p.category === 'month');
      
      return {
        ...attendee,
        products: attendee.products.map(p => ({
          ...p,
          selected: 
            p.id === product.id ? willBeSelected :
            p.id === monthProduct?.id ? willBeSelectMonth :
            p.selected
        }))
      };
    });
  }
}

export const getProductStrategy = (category: string, exclusive: boolean): ProductStrategy => {
  if (exclusive) return new ExclusiveProductStrategy();
  switch (category) {
    case 'patreon':
      return new PatreonProductStrategy();
    case 'month':
      return new MonthProductStrategy();
    case 'week':
      return new WeekProductStrategy();
    default:
      return new ExclusiveProductStrategy();
  }
}; 