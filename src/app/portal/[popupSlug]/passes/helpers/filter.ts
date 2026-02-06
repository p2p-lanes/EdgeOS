import { AttendeeProps } from "@/types/Attendee";
import { ProductsPass, ProductsProps } from "@/types/Products";
import { isVariablePrice } from "@/helpers/variablePrice";

interface ProductPurchasePayload {
  product_id: number;
  attendee_id: number | undefined;
  quantity: number;
  custom_amount?: number;
}

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

export const filterProductsToPurchase = (products: ProductsPass[], editableMode: boolean) => {

  const reducedProducts = products.reduce((acc: ProductsPass[], product) => {
    const isDayProduct = product.category.includes('day')
    const isWeekProduct = product.category === 'week' || product.category === 'local week'
    const isMonthProduct = product.category === 'month' || product.category === 'local month'
    const isPatreonProduct = product.category === 'patreon'

    const hasMonth = products.some(p => (p.category === 'month' || p.category === 'local month') && (p.selected || p.purchased) && !p.edit && p.attendee_category === product.attendee_category)
    
    if((!editableMode && !product.selected) || (!product.purchased && !product.selected)) return acc

    if(product.selected){
      if(product.purchased && !isDayProduct) return acc
      if(isWeekProduct && hasMonth) return acc
      if(isDayProduct && (product.quantity === product.original_quantity || hasMonth)) return acc
      if(isDayProduct && (product.quantity ?? 0) > (product.original_quantity ?? 0) && !hasMonth){
        const newProduct = {
          ...product,
          quantity: editableMode ? (product.quantity ?? 0) : (product.quantity ?? 0) - (product.original_quantity ?? 0),
        }
        return [...acc, newProduct]
      }
      return [...acc, product]
    }

    if(editableMode){
      if(isMonthProduct && product.purchased && !product.edit) return [...acc, product]
  
      if(isPatreonProduct && product.purchased) return [...acc, product]
  
      if(isWeekProduct && !hasMonth) return [...acc, product]

      if(isDayProduct && !hasMonth) return [...acc, product]
    }

    return acc
  }, [])

  // console.log('reducedProducts', reducedProducts, {editableMode})

  return reducedProducts.map(p => {
    const payload: ProductPurchasePayload = {
      product_id: p.id,
      attendee_id: p.attendee_id,
      quantity: p.quantity ?? 1
    };

    // Always include custom_amount for variable-price products, with fallback to suggested price
    if (isVariablePrice(p)) {
      payload.custom_amount = p.custom_amount ?? p.original_price ?? p.price;
    }

    return payload;
  })
}
