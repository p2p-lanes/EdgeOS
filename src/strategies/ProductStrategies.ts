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
          // disabled: product.exclusive && p.id !== product.id && p.selected
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

    return attendees.map(attendee => {
      if (attendee.id !== attendeeId) return attendee;

      return {
        ...attendee,
        products: attendee.products.map(p => ({
          ...p,
        selected: (attendee.id === attendeeId && p.id === product.id) ? !p.selected : p.selected,
        // original_price: p.price,
        price: this.priceStrategy.calculatePrice(p, isPatreonSelected || false, discount?.discount_value || 0)
        }))
      };
    });
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
  protected countActiveWeeks(products: ProductsPass[]): number {
    return products.filter(p => 
      p.category === 'week' && 
      (p.purchased || p.selected)
    ).length;
  }

  protected hasEditedWeeks(products: ProductsPass[]): boolean {
    return products.some(p => 
      p.category === 'week' && 
      p.edit
    );
  }

  protected shouldSelectMonth(activeWeeks: number, hasEditedWeeks: boolean, monthPurchased: boolean): boolean {
    // Si el mes está purchased, solo debe estar selected si hay weeks editadas
    if (monthPurchased) {
      return false;
    }
    // Si no está purchased, sigue la lógica original
    return activeWeeks >= 4 && !hasEditedWeeks;
  }

  handleSelection(attendees: AttendeeProps[], attendeeId: number, product: ProductsPass): AttendeeProps[] {
    return attendees.map(attendee => {
      if (attendee.id !== attendeeId) return attendee;

      const willBeSelected = !product.selected;
      const monthProduct = attendee.products.find(p => p.category === 'month');
      
      // Actualizamos el producto seleccionado
      const updatedProducts = attendee.products.map(p => ({
        ...p,
        selected: p.id === product.id ? willBeSelected : p.selected,
        edit: p.id === product.id ? (product.purchased && willBeSelected) : p.edit
      }));

      // Calculamos estados después de la actualización
      const activeWeeks = this.countActiveWeeks(updatedProducts);
      const hasEdited = this.hasEditedWeeks(updatedProducts);
      const shouldSelectMonth = this.shouldSelectMonth(
        activeWeeks, 
        hasEdited, 
        monthProduct?.purchased || false
      );

      console.log('shouldSelectMonth', {shouldSelectMonth, hasEdited, activeWeeks})

      // Actualizamos el estado del mes
      return {
        ...attendee,
        products: updatedProducts.map(p => ({
          ...p,
          selected: p.category === 'month' ? shouldSelectMonth : p.selected,
          edit: p.category === 'month' ? hasEdited : p.edit
        }))
      };
    });
  }
}

export const getProductStrategy = (product: ProductsPass, isEditing: boolean): ProductStrategy => {
  
  if (product.exclusive) return new ExclusiveProductStrategy();
  
  switch (product.category) {
    case 'patreon':
      return new PatreonProductStrategy();
    case 'month':
      return new MonthProductStrategy();
    case 'week':
      return new WeekProductStrategy();
    case 'exclusive':
      return new ExclusiveProductStrategy();
    default:
      return new WeekProductStrategy();
  }
}; 