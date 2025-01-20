import { AttendeeProps } from '@/types/Attendee';
import { ProductsPass } from '@/types/Products';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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

interface ProductUpdate {
  productId: number;
  selected: boolean;
  price?: number;
}

const PassesProvider = ({ children }: { children: ReactNode }) => {
  const { getAttendees } = useCityProvider()
  const [attendeePasses, setAttendeePasses] = useState<AttendeeProps[]>([])
  const [originalPrices, setOriginalPrices] = useState<Map<number, number>>(new Map())
  const { payments, loading, products } = useGetPassesData()
  const attendees = useMemo(() => sortAttendees(getAttendees()), [getAttendees])

  const setInitialProductsToAttendees = useCallback(() => {
    if(attendees.length === 0 || products.length === 0) return;
    
    const prices = new Map();
    products.forEach(product => {
      prices.set(product.id, product.price);
    });
    setOriginalPrices(prices);

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
  }, [attendees, products])

  useEffect(() => {
    if(loading) return;
    setInitialProductsToAttendees()
  }, [attendees, products, loading, setInitialProductsToAttendees])

  const getAttendeeById = (attendeeId: number) => {
    return attendeePasses.find(attendee => attendee.id === attendeeId)
  }

  const hasProductPurchased = (attendeeId: number, productId: number): boolean => {
    return attendees.find(attendee => attendee.id === attendeeId)?.products.some(product => product.id === productId) || false
  }

  const getProductsByAttendeeId = (attendeeId: number) => {
    return attendeePasses.find(attendee => attendee.id === attendeeId)?.products || []
  }

  const _handleExclusiveProduct = (products: ProductsPass[], productId: number): ProductUpdate[] => {
    const product = products.find(p => p.id === productId);
    if (!product?.exclusive) return [];

    const existingExclusive = products.find(p => p.exclusive && p.selected);
    if (!existingExclusive) return [];

    return [{ productId: existingExclusive.id, selected: false }];
  };

  const _handleMonthToggle = (products: ProductsPass[], productId: number): ProductUpdate[] => {
    const monthProduct = products.find(p => p.id === productId && p.category === 'month');
    if (!monthProduct) return [];

    const weekProducts = products.filter(p => p.category === 'week');
    return weekProducts.map(week => ({
      productId: week.id,
      selected: !monthProduct.selected
    }));
  };

  const _handleWeekToggle = (products: ProductsPass[], productId: number): ProductUpdate[] => {
    const weekProduct = products.find(p => p.id === productId && p.category === 'week');
    if (!weekProduct) return [];

    const monthProduct = products.find(p => p.category === 'month');
    if (!monthProduct) return [];

    // Si el mes está seleccionado, deseleccionamos el mes
    if (monthProduct.selected) {
      return [
        { productId: monthProduct.id, selected: false },
        { productId: productId, selected: false }
      ];
    }

    // Verificar si todas las semanas estarán seleccionadas
    const weekProducts = products.filter(p => p.category === 'week');
    const selectedWeeks = weekProducts.filter(p => p.selected || p.id === productId).length;
    
    if (selectedWeeks === weekProducts.length) {
      return [{ productId: monthProduct.id, selected: true }];
    }

    return [];
  };

  const _handlePatreonToggle = (products: ProductsPass[], productId: number): ProductUpdate[] => {
    const patreonProduct = products.find(p => p.id === productId && p.category === 'patreon');
    if (!patreonProduct) return [];

    // Cuando se selecciona patreon, todos los productos de todos los attendees deben tener precio 0
    return attendeePasses
      .flatMap(attendee => attendee.products)
      .filter(p => p.category !== 'patreon')
      .map(p => ({
        productId: p.id,
        selected: false,
        price: !patreonProduct.selected ? 0 : originalPrices.get(p.id)
      }));
  };

  const _updateAttendeeProducts = (attendee: AttendeeProps, attendeeId: number, productId: number) => {
    if (attendee.id !== attendeeId) return attendee;

    const product = attendee.products.find(p => p.id === productId);
    if (!product) return attendee;

    // Recolectar todas las actualizaciones necesarias
    const updates: ProductUpdate[] = [
      { productId, selected: !product.selected }, // Toggle básico del producto seleccionado
      ..._handleExclusiveProduct(attendee.products, productId),
      ..._handleMonthToggle(attendee.products, productId),
      ..._handleWeekToggle(attendee.products, productId),
      ..._handlePatreonToggle(attendee.products, productId)
    ];

    // Aplicar todas las actualizaciones
    return {
      ...attendee,
      products: attendee.products.map(p => {
        const update = updates.find(u => u.productId === p.id);
        if (!update) return p;
        
        return {
          ...p,
          selected: update.selected,
          price: update.price !== undefined ? update.price : p.price
        };
      })
    };
  };

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