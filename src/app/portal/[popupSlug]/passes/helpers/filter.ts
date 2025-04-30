import { AttendeeProps } from "@/types/Attendee";
import { ProductsPass, ProductsProps } from "@/types/Products";

export const defaultProducts = (products: ProductsProps[], attendees: AttendeeProps[], discount: number): ProductsPass[] => {
  const mainAttendee = attendees.find(a => a.category === 'main') ?? { id: 0, products: [] }

  const hasDiscount = discount > 0
  const isPatreon = mainAttendee.products?.some(p => p.category === 'patreon')

  return products
    .filter(p => p.is_active !== false)
    .map(p => {
      if(p.category !== 'patreon' && p.category !== 'supporter'){
        return {
          ...p,
          price: isPatreon ? 0 : hasDiscount ? p.price * (1 - discount/100) : p.price,
          original_price: hasDiscount ? p.price : p.compare_price, // Precio original para mostrar tachado
        }
      }
      return {...p, original_price: p.price}
    }) as ProductsPass[]
}

export const sortAttendees = (attendees: AttendeeProps[]) => {
  return attendees.sort((a, b) => {
      if (a.category === 'main') return -1;
      if (b.category === 'main') return 1;
      if (a.category === 'spouse') return -1;
      if (b.category === 'spouse') return 1;
      return 0;
    });
}

export const filterProductsToPurchase = (products: ProductsPass[]) => {
  return products.reduce((acc: ProductsPass[], product) => {
      if (product.category === 'month' || product.category === 'patreon') {
        return [...acc, product];
      }
      const hasMonthProduct = products.some(p => 
        p.category === 'month' && 
        p.attendee_category === product.attendee_category
      );
      
      if (!hasMonthProduct) {
        return [...acc, product];
      }
      return acc;
    }, []).map(p => ({product_id: p.id, attendee_id: p.attendee_id, quantity: p.quantity ?? 1}))
}
