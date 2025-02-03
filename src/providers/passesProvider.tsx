import { AttendeeProps } from '@/types/Attendee';
import { createContext, ReactNode, useContext, useMemo, useState, useEffect } from 'react';
import { sortAttendees } from '@/helpers/filters';
import useGetPassesData from '@/hooks/useGetPassesData';
import { getProductStrategy } from '@/strategies/ProductStrategies';
import { ProductsPass } from '@/types/Products';
import { useApplication } from './applicationProvider';
import { getPriceStrategy } from '@/strategies/PriceStrategy';
import { DiscountProps } from '@/types/discounts';
import { useCityProvider } from './cityProvider';

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
  const { getCity } = useCityProvider()
  const city = getCity()
  const [attendeePasses, setAttendeePasses] = useState<AttendeeProps[]>([])
  const { products } = useGetPassesData()
  const attendees = useMemo(() => sortAttendees(getAttendees()), [getAttendees])
  const [discountApplied, setDiscountApplied] = useState<DiscountProps>({discount_value: 0, discount_type: 'percentage', discount_code: null})

  const toggleProduct = (attendeeId: number, product: ProductsPass) => {
    if (!product) return;

    const strategy = getProductStrategy(product.category, product.exclusive);
    const updatedAttendees = strategy.handleSelection(attendeePasses, attendeeId, product, discountApplied);

    setAttendeePasses(updatedAttendees);
  }
  
  useEffect(() => {
    if (attendees.length > 0 && products.length > 0) {
      const bestDiscount = (application?.discount_assigned || 0) >= discountApplied.discount_value
        ? {discount_value: application?.discount_assigned || 0, discount_type: 'percentage', discount_code: null}
        : {discount_value: 0, discount_type: 'percentage', discount_code: null}

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
              price: priceStrategy.calculatePrice(product, hasPatreonPurchased, bestDiscount.discount_value || 0)
            }))
        };
      });
      setAttendeePasses(initialAttendees);
    }
  }, [attendees, products, application?.discount_assigned, discountApplied]);

  useEffect(() => {
    if(city?.id){
      setDiscountApplied({discount_value: 0, discount_type: 'percentage'})
    }
  }, [city?.id])

  const setDiscount = (discount: DiscountProps) => {
    if((application?.discount_assigned || 0) >= discount.discount_value) return;
    
    setDiscountApplied(discount);
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