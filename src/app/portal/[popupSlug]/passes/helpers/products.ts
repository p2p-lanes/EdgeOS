import { AttendeeProps } from "@/types/Attendee";
import { ProductsPass } from "@/types/Products";

interface TotalResult {
  total: number;
  originalTotal: number;
}

const _calculateAttendeeTotal = (products: ProductsPass[]): TotalResult => {
  const monthProduct = products.find(p => p.category === 'month' && p.selected);
  const selectedProducts = products.filter(p => p.selected && p.category !== 'month');
  const originalTotal = selectedProducts.reduce((sum, product) => sum + (product.compare_price ?? 0), 0);

  if (monthProduct) {
    return {
      total: monthProduct.price ?? 0,
      originalTotal
    };
  }

  return {
    total: selectedProducts.reduce((sum, product) => sum + (product.price ?? 0), 0),
    originalTotal
  };
};

export const calculateTotal = (attendees: AttendeeProps[]): TotalResult => {
  // Encontrar el producto Patreon seleccionado (si existe)
  const patreonProduct = attendees[0]?.products.find(
    p => p.category === 'patreon' && p.selected
  );

  // Calcular totales por cada attendee
  const totals = attendees.reduce((acc, attendee) => {
    const attendeeProducts = attendee.products.filter(p => p.category !== 'patreon');
    const attendeeTotals = _calculateAttendeeTotal(attendeeProducts);

    return {
      total: acc.total + (patreonProduct ? 0 : attendeeTotals.total),
      originalTotal: acc.originalTotal + attendeeTotals.originalTotal
    };
  }, { total: 0, originalTotal: 0 });

  // Ajustar el total si hay Patreon seleccionado
  if (patreonProduct?.selected) {
    return {
      total: patreonProduct.price ?? 0,
      originalTotal: (patreonProduct.price ?? 0) + totals.originalTotal
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