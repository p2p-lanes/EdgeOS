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
import { isVariablePrice } from '@/helpers/variablePrice';
import { savePassSelections, loadPassSelections, clearPassSelectionsStorage, PersistedPassSelection } from '@/hooks/useCartStorage';

interface PassesContext_interface {
  attendeePasses: AttendeeProps[];
  toggleProduct: (attendeeId: number, product: ProductsPass) => void;
  resetDayProduct: (attendeeId: number, productId: number) => void;
  setCustomAmount: (attendeeId: number, productId: number, amount: number | undefined) => void;
  products: ProductsPass[];
  setDiscount: (discount: DiscountProps) => void;
  clearDiscount: () => void;
  discountApplied: DiscountProps;
  isEditing: boolean;
  toggleEditing: (editing?: boolean) => void;
  editCredit: number;
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
  const hasRestoredRef = useRef(false)
  const { groups } = useGroupsProvider()

  const toggleProduct = useCallback((attendeeId: number, product: ProductsPass) => {
    if (!product) return;
    const strategy = getProductStrategy(product, isEditing);
    const updatedAttendees = strategy.handleSelection(attendeePasses, attendeeId, product, discountApplied);

    // For variable-price products being selected, inject suggested price as custom_amount
    const willBeSelected = !product.selected;
    if (isVariablePrice(product) && willBeSelected) {
      const withCustomAmount = updatedAttendees.map(attendee => {
        if (attendee.id !== attendeeId) return attendee;
        return {
          ...attendee,
          products: attendee.products.map(p => {
            if (p.id !== product.id) return p;
            return {
              ...p,
              custom_amount: p.custom_amount ?? product.price
            };
          })
        };
      });
      setAttendeePasses(withCustomAmount);
      return;
    }

    // When deselecting a variable-price product, clear custom_amount
    if (isVariablePrice(product) && !willBeSelected) {
      const withoutCustomAmount = updatedAttendees.map(attendee => {
        if (attendee.id !== attendeeId) return attendee;
        return {
          ...attendee,
          products: attendee.products.map(p => {
            if (p.id !== product.id) return p;
            return { ...p, custom_amount: undefined };
          })
        };
      });
      setAttendeePasses(withoutCustomAmount);
      return;
    }

    setAttendeePasses(updatedAttendees);
  }, [attendeePasses, isEditing, discountApplied])

  const resetDayProduct = useCallback((attendeeId: number, productId: number) => {
    setAttendeePasses(prevAttendees => 
      prevAttendees.map(attendee => {
        if (attendee.id !== attendeeId) return attendee;
        
        return {
          ...attendee,
          products: attendee.products.map(product => {
            if (product.id === productId && product.category.includes('day')) {
              return {
                ...product,
                quantity: product.original_quantity ?? 0,
                selected: false
              };
            }
            return product;
          })
        };
      })
    );
  }, [])

  const setCustomAmount = useCallback((attendeeId: number, productId: number, amount: number | undefined) => {
    setAttendeePasses(prevAttendees =>
      prevAttendees.map(attendee => {
        if (attendee.id !== attendeeId) return attendee;
        
        return {
          ...attendee,
          products: attendee.products.map(product => {
            if (product.id !== productId) return product;
            
            return {
              ...product,
              custom_amount: amount,
              selected: amount !== undefined && amount > 0
            };
          })
        };
      })
    );
  }, [])
  
  useEffect(() => {
    if (attendees.length > 0 && products.length > 0) {
      // Read saved selections from localStorage reactively (city?.id may not be available on first render)
      const savedSelections = (!hasRestoredRef.current && city?.id)
        ? loadPassSelections(city.id)
        : [];

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
            const prevProduct = attendeePassesRef.current.find(a => a.id === attendee.id)?.products.find(p => p.id === product.id)

            // On first load, fallback to localStorage saved selections
            const savedSelection = !hasRestoredRef.current
              ? savedSelections.find(
                  s => s.attendeeId === attendee.id && s.productId === product.id
                )
              : undefined;

            const restoredSelected = prevProduct?.selected || !!savedSelection;
            const restoredQuantity = prevProduct?.quantity ?? savedSelection?.quantity ?? originalQuantity;
            const restoredCustomAmount = prevProduct?.custom_amount ?? savedSelection?.custom_amount;
            const restoredEdit = prevProduct?.edit ?? false;

            return {
              ...product,
              original_quantity: originalQuantity,
              quantity: product.category.includes('day') && restoredSelected
                ? Math.max(restoredQuantity, originalQuantity)
                : originalQuantity,
              selected: restoredSelected,
              custom_amount: restoredCustomAmount,
              edit: restoredEdit,
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
      // Mark restored only when city.id was available (so localStorage was actually checked)
      if (city?.id) {
        hasRestoredRef.current = true;
      }
    }
  }, [attendees, products, discountApplied, isEditing, localResident, city?.id]);

  useEffect(() => {
    attendeePassesRef.current = attendeePasses

    // Only persist after initial restoration to avoid overwriting saved data
    if (!hasRestoredRef.current) return;

    // Persist selected passes to localStorage
    if (city?.id && attendeePasses.length > 0) {
      const selections: PersistedPassSelection[] = [];
      attendeePasses.forEach(attendee => {
        attendee.products.forEach(product => {
          if (product.selected) {
            selections.push({
              attendeeId: attendee.id,
              productId: product.id,
              quantity: product.quantity,
              custom_amount: product.custom_amount,
            });
          }
        });
      });
      savePassSelections(city.id, selections);
    }
  }, [attendeePasses, city?.id])

  const toggleEditing = useCallback((editing?: boolean) => {
    setAttendeePasses(attendeePasses.map(attendee => ({
      ...attendee,
      products: attendee.products.map(product => ({...product, edit: false, selected: false, disabled: false}))
    })))

    setIsEditing(editing !== undefined ? editing : !isEditing)
  }, [attendeePasses, isEditing])

  useEffect(() => {
    if(city?.id && discountApplied.city_id !== city?.id){
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

  const editCredit = useMemo(() => {
    if (!isEditing) return 0;
    return attendeePasses.reduce((credit, attendee) =>
      credit + attendee.products
        .filter(p => p.purchased && p.edit)
        .reduce((sum, p) => sum + (p.price * (p.quantity ?? 1)), 0)
    , 0);
  }, [attendeePasses, isEditing]);

  const setDiscount = useCallback((discount: DiscountProps) => {
    console.log('setDiscount', discount.discount_value, discountApplied.discount_value)
    if(discount.discount_value <= discountApplied.discount_value) return;
    setDiscountApplied(discount);
  }, [discountApplied.discount_value])

  const clearDiscount = useCallback(() => {
    setDiscountApplied({ discount_value: 0, discount_type: 'percentage', discount_code: null });
  }, []);

  return (
    <PassesContext.Provider 
      value={{ 
        setDiscount,
        clearDiscount,
        discountApplied,
        attendeePasses,
        toggleProduct,
        resetDayProduct,
        setCustomAmount,
        products,
        isEditing,
        toggleEditing,
        editCredit
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