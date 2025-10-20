import { AttendeeProps } from '@/types/Attendee';
import { createContext, ReactNode, useContext, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { sortAttendees } from '@/helpers/filters';
import useGetPassesData from '@/hooks/useGetPassesData';
import { getProductStrategy } from '@/strategies/ProductStrategies';
import { ProductsPass } from '@/types/Products';
import { useApplication } from './applicationProvider';
import { getPriceStrategy } from '@/strategies/PriceStrategy';
import { DiscountProps } from '@/types/discounts';
import { useCityProvider } from './cityProvider';
import { getPurchaseStrategy } from '@/strategies/PurchaseStrategy';
import { useGroupsProvider } from './groupsProvider';

interface PassesContext_interface {
  attendeePasses: AttendeeProps[];
  toggleProduct: (attendeeId: number, product: ProductsPass) => void;
  products: ProductsPass[];
  setDiscount: (discount: DiscountProps) => void;
  discountApplied: DiscountProps;
  isEditing: boolean;
  toggleEditing: (editing?: boolean) => void;
}

export const PassesContext = createContext<PassesContext_interface | null>(null);

const PassesProvider = ({ children }: { children: ReactNode }) => {
  const { getAttendees, getRelevantApplication } = useApplication()
  const [discountApplied, setDiscountApplied] = useState<DiscountProps>({discount_value: 0, discount_type: 'percentage', discount_code: null})
  const [attendeePasses, setAttendeePasses] = useState<AttendeeProps[]>([])
  const application = getRelevantApplication()

  const attendees = useMemo(() => {
    const result = sortAttendees(getAttendees())
    return result
  }, [getAttendees])

  const [isEditing, setIsEditing] = useState(false)
  const { products } = useGetPassesData()
  const { getCity } = useCityProvider()
  const city = getCity()
  const localResident = application?.local_resident || false
  const attendeePassesRef = useRef<AttendeeProps[]>([])
  const { groups } = useGroupsProvider()

  const toggleProduct = useCallback((attendeeId: number, product: ProductsPass) => {
    if (!product) return;
    const strategy = getProductStrategy(product, isEditing);
    const updatedAttendees = strategy.handleSelection(attendeePasses, attendeeId, product, discountApplied);
    setAttendeePasses(updatedAttendees);
  }, [attendeePasses, isEditing, discountApplied])
  
  useEffect(() => {
    if (attendees.length > 0 && products.length > 0) {
      const initialAttendees = attendees.map(attendee => {
        const hasPatreonPurchased = attendee.products.some(p => p.category === 'patreon');
        const priceStrategy = getPriceStrategy();
        const purchaseStrategy = getPurchaseStrategy();
      
        const attendeeProducts = products
          .filter((product: ProductsPass) => 
            product.attendee_category === attendee.category && 
            product.is_active 
            // (
            //   localResident 
            //     ? (product.category.includes('local')) 
            //     : (product.category !== 'local week' && product.category !== 'local month')
            // )
          )
          .map((product: ProductsPass) => {
            const originalQuantity = product.category.includes('day') ? attendees.find(a => a.id === attendee.id)?.products.find(p => p.id === product.id)?.quantity ?? 0 : 1
            return {
              ...product,
              original_quantity: originalQuantity,
              quantity: originalQuantity,
              selected: attendeePassesRef.current.find(a => a.id === attendee.id)?.products.find(p => p.id === product.id)?.selected || false,
              attendee_id: attendee.id,
              original_price: product.price,
              disabled: false,
              price: priceStrategy.calculatePrice(product, hasPatreonPurchased, discountApplied.discount_value)
            }
          });

        return {
          ...attendee,
          products: purchaseStrategy.applyPurchaseRules(attendeeProducts, attendee.products || [])
        };
      });
      setAttendeePasses(initialAttendees);
    }
  }, [attendees, products, discountApplied, isEditing, localResident]);

  useEffect(() => {
    attendeePassesRef.current = attendeePasses
  }, [attendeePasses])

  const toggleEditing = useCallback((editing?: boolean) => {
    setAttendeePasses(attendeePasses.map(attendee => ({
      ...attendee,
      products: attendee.products.map(product => ({...product, edit: false, selected: false, disabled: false}))
    })))

    setIsEditing(editing !== undefined ? editing : !isEditing)
  }, [attendeePasses, isEditing])

  useEffect(() => {
    if(city?.id && discountApplied.city_id !== city?.id){
      console.log('aca entro', discountApplied, city?.id);
      setDiscountApplied({discount_value: 0, discount_type: 'percentage'})
    }
  }, [city?.id, discountApplied.city_id])

  useEffect(() => {
    if(application?.discount_assigned && application?.discount_assigned > discountApplied.discount_value){
      setDiscountApplied({discount_value: application?.discount_assigned, discount_type: 'percentage'})
    }
  }, [application?.discount_assigned, discountApplied.discount_value])

  useEffect(() => {
    if (application?.group_id && groups.length > 0) {
      const group = groups.find(g => g.id === application.group_id);
      if (group && group.discount_percentage && group.discount_percentage > discountApplied.discount_value) {
        setDiscountApplied({
          discount_value: group.discount_percentage,
          discount_type: 'percentage',
          discount_code: null
        });
      }
    }
  }, [application?.group_id, groups, discountApplied.discount_value]);

  const setDiscount = useCallback((discount: DiscountProps) => {
    console.log('setDiscount', discount.discount_value, discountApplied.discount_value)
    if(discount.discount_value <= discountApplied.discount_value) return;
    setDiscountApplied(discount);
  }, [discountApplied.discount_value])

  return (
    <PassesContext.Provider 
      value={{ 
        setDiscount,
        discountApplied,
        attendeePasses,
        toggleProduct,
        products,
        isEditing,
        toggleEditing
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