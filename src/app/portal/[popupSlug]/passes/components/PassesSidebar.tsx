import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsAttendee } from "./ProductsAttendee"
import { ProductsPass, ProductsProps } from "@/types/Products"
import { AttendeeProps } from "@/types/Attendee"
import { useMemo, useState } from "react"
import PaymentHistory from "./PaymentHistory"

interface PassesSidebarProps {
  productsPurchase: ProductsProps[], 
  attendees: AttendeeProps[], 
  payments: any[],
  discount: number
}

const defaultProducts = (products: ProductsProps[], attendees: AttendeeProps[], discount: number): ProductsPass[] => {
  const mainAttendee = attendees.find(a => a.category === 'main') ?? { id: 0, products: [] }

  const hasDiscount = discount > 0
  const isPatreon = mainAttendee.products?.some(p => p.category === 'patreon')

  return products.map(p => {
    if(p.category !== 'patreon'){
      return {
        ...p,
        price: isPatreon ? 0 : hasDiscount ? p.price * (1 - discount/100) : p.price,
        original_price: hasDiscount ? p.price : p.compare_price, // Precio original para mostrar tachado
      }
    }
    return p
  }) as ProductsPass[]
}

const PassesSidebar = ({productsPurchase, attendees, payments, discount}: PassesSidebarProps) => {
  const initialProducts = useMemo(() => defaultProducts(productsPurchase, attendees, discount), [productsPurchase, attendees, discount])
  const [products, setProducts] = useState<ProductsPass[]>(initialProducts)

  const toggleProduct = (attendee: AttendeeProps | undefined, product?: ProductsPass) => {
    if (!product || !attendee) return;

    setProducts(prev => {
      // Manejo de productos Patreon
      if (product.category === 'patreon') {
        if (product.selected) {
          return initialProducts;
        }
        return prev.map(p => ({...p, price: p.category === 'patreon' ? p.price : 0, selected: p.id === product.id, attendee_id: p.id === product.id ? attendee.id : p.attendee_id}))
      }

      // Crear nueva lista de productos con el toggle básico
      const newProducts = prev.map(p => ({
        ...p,
        attendee_id: p.id === product.id ? attendee.id : p.attendee_id,
        selected: p.id === product.id ? !p.selected : p.selected
      }));

      if (product.category === 'month') {
        return newProducts.map(p => ({
          ...p,
          selected: p.category === 'week' && attendee.category === p.attendee_category ? !product.selected : p.selected
        }));
      }

      // Si es un producto "week", verificar si todos los weeks del attendee están seleccionados
      if (product.category === 'week') {
        const monthProduct = newProducts.find(p => p.category === 'month' && p.attendee_category === attendee.category);

        if(!monthProduct) return newProducts

        if(monthProduct.selected) {
          return newProducts.map(p => ({
            ...p,
            selected: p.id === monthProduct.id ? false : // des-seleccionar monthProduct
                     p.id === product.id ? false : // des-seleccionar producto week clickeado
                     p.attendee_category === attendee.category && p.category === 'week' ? true : // seleccionar resto de weeks del attendee
                     p.selected
          }));
        }

        const allWeeksSelected = newProducts
          .filter(p => (p.category === 'week' && p.attendee_category === attendee.category && p.selected)).length === 4

        if (allWeeksSelected) {
            return newProducts.map(p => ({
              ...p,
              selected: p.id === monthProduct.id ? true : p.selected,
              attendee_id: p.id === monthProduct.id ? attendee.id : p.attendee_id
            }));
          }
      }

      return newProducts;
    });
  };

  return (
    <div className="mt-6 md:mt-0">
      <Tabs defaultValue="passes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="passes">Passes</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="passes">
          <ProductsAttendee products={products} attendees={attendees} onToggleProduct={toggleProduct} />
        </TabsContent>

        <TabsContent value="payment-history">
          <PaymentHistory payments={payments}/>
        </TabsContent>
      </Tabs>
    </div>
  )
}
export default PassesSidebar