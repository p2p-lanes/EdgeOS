import { AttendeeProps } from '@/types/Attendee';
import { createContext, ReactNode, useContext, useMemo, useState, useEffect } from 'react';
import { useCityProvider } from './cityProvider';
import { sortAttendees } from '@/helpers/filters';
import useGetPassesData from '@/hooks/useGetPassesData';
import { getProductStrategy } from '@/strategies/ProductStrategies';
import { ProductsPass } from '@/types/Products';
import { useApplication } from './applicationProvider';

interface PassesContext_interface {
  attendeePasses: AttendeeProps[];
  toggleProduct: (attendeeId: number, product: ProductsPass) => void;
  products: ProductsPass[];
}

export const PassesContext = createContext<PassesContext_interface | null>(null);


const PassesProvider = ({ children }: { children: ReactNode }) => {
  const { getAttendees, getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const [attendeePasses, setAttendeePasses] = useState<AttendeeProps[]>([])
  const { products } = useGetPassesData()
  const attendees = useMemo(() => sortAttendees(getAttendees()), [getAttendees])

  const toggleProduct = (attendeeId: number, product: ProductsPass) => {
    if (!product) return;
    
    const strategy = getProductStrategy(product.category, product.exclusive);
    const updatedAttendees = strategy.handleSelection(attendeePasses, attendeeId, product);
    setAttendeePasses(updatedAttendees);
  }
  
  useEffect(() => {
    if (attendees.length > 0 && products.length > 0) {
      const hasPatreonPurchased = attendees.some(attendee => attendee.products?.some(p => p.category === 'patreon'));
      const discount = application?.discount_assigned || 0
      const initialAttendees = attendees.map(attendee => {
        
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
              price: hasPatreonPurchased ? 0 : 
                     (product.category !== 'patreon' && product.category !== 'supporter' && discount > 0) ? 
                     product.price * (1 - discount/100) : 
                     product.price,
              disabled: false
            }))
        };
      });
      setAttendeePasses(initialAttendees);
    }
  }, [attendees, products]);

  return (
    <PassesContext.Provider 
      value={{ 
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