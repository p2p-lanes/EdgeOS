import { AttendeeProps } from '@/types/Attendee';
import { ProductsPass } from '@/types/Products';

interface ProductStrategy {
  handleSelection: (
    attendees: AttendeeProps[],
    attendeeId: number,
    productId: number
  ) => AttendeeProps[];
}

class ExclusiveProductStrategy implements ProductStrategy {
  handleSelection(attendees: AttendeeProps[], attendeeId: number, productId: number): AttendeeProps[] {
    return attendees.map(attendee => {
      if (attendee.id !== attendeeId) return attendee;
      
      const hasSelectedExclusive = attendee.products.some(
        p => p.exclusive && (p.selected || p.purchased)
      );
      
      return {
        ...attendee,
        products: attendee.products.map(product => ({
          ...product,
          selected: product.id === productId ? !product.selected : product.selected,
          disabled: product.exclusive && product.id !== productId && 
            (hasSelectedExclusive || product.selected)
        }))
      };
    });
  }
}

class PatreonProductStrategy implements ProductStrategy {
  handleSelection(attendees: AttendeeProps[], attendeeId: number, productId: number): AttendeeProps[] {
    const isPatreonSelected = attendees
      .find(a => a.id === attendeeId)
      ?.products.find(p => p.id === productId)?.selected;

    return attendees.map(attendee => ({
      ...attendee,
      products: attendee.products.map(product => ({
        ...product,
        selected: attendee.id === attendeeId && product.id === productId ? 
          !product.selected : product.selected,
        price: !isPatreonSelected ? 0 : product.original_price || product.price
      }))
    }));
  }
}

class MonthProductStrategy implements ProductStrategy {
  handleSelection(attendees: AttendeeProps[], attendeeId: number, productId: number): AttendeeProps[] {
    const targetAttendee = attendees.find(a => a.id === attendeeId);
    const isMonthSelected = targetAttendee?.products.find(p => p.id === productId)?.selected;

    return attendees.map(attendee => {
      if (attendee.id !== attendeeId) return attendee;
      
      return {
        ...attendee,
        products: attendee.products.map(product => ({
          ...product,
          selected: product.id === productId ? 
            !product.selected : 
            product.category === 'week' ? 
              !isMonthSelected : product.selected
        }))
      };
    });
  }
}

class WeekProductStrategy implements ProductStrategy {
  handleSelection(attendees: AttendeeProps[], attendeeId: number, productId: number): AttendeeProps[] {
    const targetAttendee = attendees.find(a => a.id === attendeeId);
    const currentProduct = targetAttendee?.products.find(p => p.id === productId);
    const willBeSelected = !currentProduct?.selected;

    // Calculamos el número total de semanas que estarán seleccionadas después del cambio
    const futureSelectedWeeksCount = targetAttendee?.products.filter(p => 
      p.category === 'week' && (
        p.id === productId ? willBeSelected : p.selected
      )
    ).length || 0;

    return attendees.map(attendee => {
      if (attendee.id !== attendeeId) return attendee;
      
      const monthProduct = attendee.products.find(p => p.category === 'month');
      
      return {
        ...attendee,
        products: attendee.products.map(product => ({
          ...product,
          selected: 
            product.id === productId ? willBeSelected :
            product.id === monthProduct?.id ? futureSelectedWeeksCount % 4 === 0 :
            product.selected
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