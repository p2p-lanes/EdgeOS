import { AttendeeProps } from "@/types/Attendee";
import { ProductsPass } from "@/types/Products";

const calculateAttendeeTotal = (attendeeProducts: ProductsPass[], patreonSelected: boolean) => {
  const monthProduct = attendeeProducts.find(p => p.category === 'month' && p.selected);
  const selectedProducts = attendeeProducts.filter(p => p.selected && p.category !== 'month');
  const originalTotal = selectedProducts.reduce((sum, product) => sum + (product.original_price ?? 0), 0)
  
  if (monthProduct) {
    return {
      total: monthProduct.price ?? 0,
      originalTotal: originalTotal
    };
  }

  return {
    total: patreonSelected ? 0 : selectedProducts.reduce((sum, product) => sum + product.price, 0),
    originalTotal: originalTotal
  };
};

export const calculateTotal = (attendees: AttendeeProps[], products: ProductsPass[]) => {
  const patreonSelected = products.find(p => p.category === 'patreon')

  const totals = attendees.reduce((acc, attendee) => {
    const attendeeProducts = products.filter(p => p.attendee_category === attendee.category && p.category !== 'patreon');
    const attendeeTotals = calculateAttendeeTotal(attendeeProducts, patreonSelected?.selected ?? false);
    return {
      total: acc.total + attendeeTotals.total,
      originalTotal: acc.originalTotal + attendeeTotals.originalTotal
    };
  }, { total: 0, originalTotal: 0 });

  if (patreonSelected?.selected) {
    return {
      total: patreonSelected.price ?? 0,
      originalTotal: patreonSelected.price + totals.originalTotal
    };
  }

  return totals;
};

export const toggleProducts = (prev: ProductsPass[], product: ProductsPass, attendee: AttendeeProps, initialProducts: ProductsPass[]) => {
  // Manejo de productos exclusivos
  if (product.exclusive) {
    const existingExclusive = prev.find(p => p.exclusive && p.selected && p.attendee_category === attendee.category);
    if (existingExclusive) {
      return prev.map(p => ({
        ...p,
        selected: p.id === existingExclusive.id ? false : 
                 p.id === product.id ? true : p.selected,
        attendee_id: p.id === product.id ? attendee.id : p.attendee_id
      }));
    }
  }

  // Manejo de productos Patreon
  if (product.category === 'patreon') {
    if (product.selected) {
      return initialProducts;
    }
    return prev.map(p => ({...p, price: p.category === 'patreon' ? p.price : 0, selected: p.id === product.id, attendee_id: p.id === product.id ? attendee.id : p.attendee_id}))
  }

  // Crear nueva lista de productos con el toggle básico
  const newProducts = prev.map(p => ({
    ...p,
    attendee_id: p.id === product.id ? attendee.id : p.attendee_id,
    selected: p.id === product.id ? !p.selected : p.selected
  }));

  if (product.category === 'month') {
    return newProducts.map(p => ({
      ...p,
      selected: (p.category === 'week' && attendee.category === p.attendee_category) ? !product.selected : p.selected,
      attendee_id: (p.category === 'week' && attendee.category === p.attendee_category) ? attendee.id : p.attendee_id
    }));
  }

  // Si es un producto "week", verificar si todos los weeks del attendee están seleccionados
  if (product.category === 'week') {
    const monthProduct = newProducts.find(p => p.category === 'month' && p.attendee_category === attendee.category);

    if(!monthProduct) return newProducts

    if(monthProduct.selected) {
      return newProducts.map(p => ({
        ...p,
        selected: p.id === monthProduct.id ? false : // des-seleccionar monthProduct
                  p.id === product.id ? false : // des-seleccionar producto week clickeado
                  p.attendee_category === attendee.category && p.category === 'week' ? true : // seleccionar resto de weeks del attendee
                  p.selected
      }));
    }

    const allWeeksSelected = newProducts
      .filter(p => (p.category === 'week' && p.attendee_category === attendee.category && p.selected)).length === 4

    if (allWeeksSelected) {
        return newProducts.map(p => ({
          ...p,
          selected: p.id === monthProduct.id ? true : p.selected,
          attendee_id: p.id === monthProduct.id ? attendee.id : p.attendee_id
        }));
      }
  }

  return newProducts;
}