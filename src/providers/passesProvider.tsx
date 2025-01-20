import { AttendeeProps } from '@/types/Attendee';
import { ProductsPass } from '@/types/Products';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useCityProvider } from './cityProvider';
import { sortAttendees } from '@/helpers/filters';
import useGetPassesData from '@/hooks/useGetPassesData';
import { PaymentsProps } from '@/types/passes';

interface PassesContext_interface {
  attendeePasses: AttendeeProps[];
  payments: PaymentsProps[];
  products: ProductsPass[];
  hasProductPurchased: (attendeeId: number, productId: number) => boolean;
  getProductsByAttendeeId: (attendeeId: number) => ProductsPass[];
  getAttendeeById: (attendeeId: number) => AttendeeProps | undefined;
  toggleProduct: (attendeeId: number, productId: number) => void;
}

export const PassesContext = createContext<PassesContext_interface | null>(null);

const PassesProvider = ({ children }: { children: ReactNode }) => {
  const { getAttendees } = useCityProvider()
  const [attendeePasses, setAttendeePasses] = useState<AttendeeProps[]>([])
  const { payments, loading, products } = useGetPassesData()
  const attendees = useMemo(() => getAttendees(), [getAttendees])

  const setProductsToAttendees = (attendees: AttendeeProps[], products: ProductsPass[]) => {
    const attendeesWithProducts = attendees.map(attendee => {
      return {
        ...attendee,
        products: products
          .filter(product => product.attendee_category === attendee.category)
          .map(product => ({
            ...product,
            purchased: attendee.products.some(p => p.id === product.id)
          }))
      }
    })
    setAttendeePasses(attendeesWithProducts)
  }

  useEffect(() => {
    if(loading || attendees.length === 0 || products.length === 0) return;
    const sortedAttendees = sortAttendees(attendees);
    setProductsToAttendees(sortedAttendees, products)
  }, [attendees, products, loading])

  const getAttendeeById = (attendeeId: number) => {
    return attendeePasses.find(attendee => attendee.id === attendeeId)
  }

  const hasProductPurchased = (attendeeId: number, productId: number): boolean => {
    return attendees.find(attendee => attendee.id === attendeeId)?.products.some(product => product.id === productId) || false
  }

  const getProductsByAttendeeId = (attendeeId: number) => {
    return attendeePasses.find(attendee => attendee.id === attendeeId)?.products || []
  }

  const _updateAttendeeProducts = (attendee: AttendeeProps, attendeeId: number, productId: number) => {
    if (attendee.id !== attendeeId) return attendee;
    
    return {
        ...attendee,
        products: attendee.products.map(product => 
            product.id === productId 
                ? { ...product, selected: !product.selected }
                : product
        )
    }
  }

  const toggleProduct = (attendeeId: number, productId: number) => {
    setAttendeePasses(prevPasses => 
        prevPasses.map(attendee => _updateAttendeeProducts(attendee, attendeeId, productId))
    )
  }

  return (
    <PassesContext.Provider 
      value={{ 
        attendeePasses,
        hasProductPurchased,
        getProductsByAttendeeId,
        getAttendeeById,
        toggleProduct,
        payments,
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