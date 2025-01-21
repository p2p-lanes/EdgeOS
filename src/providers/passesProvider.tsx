import { AttendeeProps } from '@/types/Attendee';
import { createContext, ReactNode, useContext, useMemo, useState, useEffect } from 'react';
import { useCityProvider } from './cityProvider';
import { sortAttendees } from '@/helpers/filters';
import useGetPassesData from '@/hooks/useGetPassesData';
import { getProductStrategy } from '@/strategies/ProductStrategies';

interface PassesContext_interface {
  attendeePasses: AttendeeProps[];
  toggleProduct: (attendeeId: number, productId: number) => void;
}

export const PassesContext = createContext<PassesContext_interface | null>(null);


const PassesProvider = ({ children }: { children: ReactNode }) => {
  const { getAttendees } = useCityProvider()
  const [attendeePasses, setAttendeePasses] = useState<AttendeeProps[]>([])
  const { payments, loading, products } = useGetPassesData()
  const attendees = useMemo(() => sortAttendees(getAttendees()), [getAttendees])

  const toggleProduct = (attendeeId: number, productId: number) => {
    const attendee = attendeePasses.find(a => a.id === attendeeId);
    const product = attendee?.products.find(p => p.id === productId);
    
    if (!attendee || !product) return;
    
    const strategy = getProductStrategy(product.category, product.exclusive);
    const updatedAttendees = strategy.handleSelection(attendeePasses, attendeeId, productId);
    setAttendeePasses(updatedAttendees);
  }

  useEffect(() => {
    if (attendees.length > 0 && products.length > 0) {
      const initialAttendees = attendees.map(attendee => ({
        ...attendee,
        products: products
          .filter(product => product.attendee_category === attendee.category)
          .map(product => ({
            ...product,
            selected: false,
            purchased: false,
            attendee_id: attendee.id,
            original_price: product.price,
            disabled: false
          }))
      }));
      setAttendeePasses(initialAttendees);
    }
  }, [attendees, products]);

  return (
    <PassesContext.Provider 
      value={{ 
        attendeePasses,
        toggleProduct
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