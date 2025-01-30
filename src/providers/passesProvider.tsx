import { AttendeeProps } from '@/types/Attendee';
import { createContext, ReactNode, useContext, useMemo, useState, useEffect } from 'react';
import { sortAttendees } from '@/helpers/filters';
import useGetPassesData from '@/hooks/useGetPassesData';
import { getProductStrategy } from '@/strategies/ProductStrategies';
import { ProductsPass } from '@/types/Products';
import { useApplication } from './applicationProvider';
import { getPriceStrategy } from '@/strategies/PriceStrategy';
import { DiscountProps } from '@/types/discounts';

interface PassesContext_interface {
  attendeePasses: AttendeeProps[];
  toggleProduct: (attendeeId: number, product: ProductsPass) => void;
  products: ProductsPass[];
  setDiscount: (discount: DiscountProps) => void;
  discountApplied: DiscountProps;
}

export const PassesContext = createContext<PassesContext_interface | null>(null);

const PassesProvider = ({ children }: { children: ReactNode }) => {
  const { getAttendees, getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const [attendeePasses, setAttendeePasses] = useState<AttendeeProps[]>([])
  const { products } = useGetPassesData()
  const attendees = useMemo(() => sortAttendees(getAttendees()), [getAttendees])
  const [discountApplied, setDiscountApplied] = useState<DiscountProps>({discount_value: 0, discount_type: 'percentage'})

  const toggleProduct = (attendeeId: number, product: ProductsPass) => {
    if (!product) return;

    const strategy = getProductStrategy(product.category, product.exclusive);
    const updatedAttendees = strategy.handleSelection(attendeePasses, attendeeId, product, discountApplied);

    setAttendeePasses(updatedAttendees);
  }
  
  useEffect(() => {
    if (attendees.length > 0 && products.length > 0) {
      const initialAttendees = attendees.map(attendee => {
        const hasPatreonPurchased = attendee.products?.some(p => p.category === 'patreon')
        const priceStrategy = getPriceStrategy();
        return {
          ...attendee,
          products: products
            .filter(product => product.attendee_category === attendee.category && product.is_active)
            .map(product => ({
              ...product,
              selected: false,
              purchased: attendee.products?.some(purchasedProduct => purchasedProduct.id === product.id) || false,
              attendee_id: attendee.id,
              original_price: product.price,
              disabled: false,
              price: priceStrategy.calculatePrice(product, hasPatreonPurchased, discountApplied)
            }))
        };
      });
      setAttendeePasses(initialAttendees);
    }
  }, [attendees, products, discountApplied]);

  useEffect(() => {
    setDiscountApplied({discount_value: application?.discount_assigned || 0, discount_type: 'percentage'})
  }, [application?.discount_assigned])

  const setDiscount = (discount: DiscountProps) => {
    const priceStrategy = getPriceStrategy();
    
    // Solo consideramos productos regulares para el cálculo del mejor descuento
    const regularProducts = attendeePasses.flatMap(attendee => 
      attendee.products.filter(p => 
        p.category !== 'patreon' && 
        p.category !== 'supporter' &&
        !p.purchased
      )
    );

    if (regularProducts.length === 0) {
      setDiscountApplied(discount);
      return;
    }

    // Encontramos el producto con el precio más alto
    const productWithHighestPrice = regularProducts.reduce((highest, current) => 
      (current.original_price || 0) > (highest.original_price || 0) ? current : highest
    );

    const bestDiscount = priceStrategy.getBestDiscount(
      productWithHighestPrice.original_price || 0,
      application?.discount_assigned || 0,
      discount
    );

    setDiscountApplied(bestDiscount);
  }

  return (
    <PassesContext.Provider 
      value={{ 
        setDiscount,
        discountApplied,
        attendeePasses,
        toggleProduct,
        products
      }}>
      {children}
    </PassesContext.Provider>
  )
}

export const usePassesProvider = (): PassesContext_interface => {
  const context = useContext(PassesContext);
  if (context === null) {
    throw new Error('usePassesProvider must be used within a PassesProvider');
  }
  return context;
};

export default PassesProvider